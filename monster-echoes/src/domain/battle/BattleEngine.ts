import { BALANCE } from '../../data/balance';
import { getItem } from '../../data/items';
import { getSpecies } from '../../data/monsters';
import { getSkill } from '../../data/skills';
import type { EnemySpec, SkillDefinition, StatusId, Tactic } from '../../data/types';
import { chance, clamp, pick, randomInt, type Rng } from '../../core/Random';
import { applySkillUpgrades, averageStatsAtLevel } from '../monster/Growth';
import { displayName, learnedSkillsAtLevel, speciesResistances } from '../monster/MonsterFactory';
import type { MonsterInstance } from '../monster/types';
import { alive, chooseAction, friendsOf, opponentsOf } from './BattleAI';
import { calculateDamage, effSpeed, healAmount, statusMultiplier } from './DamageCalculator';
import { decideOrder } from './TurnOrder';
import type { AllyCommand, BattleEvent, BattleKind, BattleState, Combatant, TurnInput, TurnResult } from './types';

const B = BALANCE.battle;
const STATUS_NAME: Record<StatusId, string> = { sleep: 'ねむり', paralysis: 'まひ', confusion: 'こんらん', poison: 'どく' };
const STAT_NAME = { attack: 'こうげきりょく', defense: 'しゅびりょく', speed: 'すばやさ' } as const;

const emptyStatus = () => ({ sleep: 0, paralysis: 0, confusion: 0, poison: false });

export function allyFromInstance(m: MonsterInstance, slot: number): Combatant {
  const sp = getSpecies(m.speciesId);
  return {
    key: `a${slot}`, side: 'ally', slot, instanceId: m.id, speciesId: m.speciesId, name: displayName(m), level: m.level,
    maxHp: m.stats.hp, hp: m.hp, maxMp: m.stats.mp, mp: m.mp,
    attack: m.stats.attack, defense: m.stats.defense, speed: m.stats.speed, wisdom: m.stats.wisdom,
    stages: { attack: 0, defense: 0, speed: 0 }, status: emptyStatus(), charged: false, defending: false,
    skills: [...m.skills], resist: { ...m.resistances }, wildness: m.wildness, affection: 0, recruitable: false,
    recruitBase: 0, expYield: sp.expYield, goldYield: sp.goldYield, distorted: false,
    tactic: m.tactic, healsUsed: 0, used: {}, statusHits: 0,
  };
}

export function enemyFromSpec(spec: EnemySpec, slot: number): Combatant {
  const sp = getSpecies(spec.speciesId);
  const st = averageStatsAtLevel(sp, spec.level);
  const sc = spec.statScale ?? 1;
  const hp = Math.round(st.hp * (spec.hpScale ?? 1));
  let skills = spec.skills ?? learnedSkillsAtLevel(sp, spec.level);
  if (!spec.skills) {
    const fake = { level: spec.level, stats: st, skills } as unknown as MonsterInstance;
    skills = applySkillUpgrades(fake).monster.skills;
  }
  const resist = { ...speciesResistances(sp) };
  if (spec.distorted) resist.light = -1; // ゆがんだモンスターは光に弱い
  return {
    key: `e${slot}`, side: 'enemy', slot, speciesId: sp.id, name: spec.name ?? sp.name, level: spec.level,
    maxHp: hp, hp, maxMp: st.mp, mp: st.mp,
    attack: Math.round(st.attack * sc), defense: Math.round(st.defense * sc), speed: Math.round(st.speed * sc), wisdom: Math.round(st.wisdom * sc),
    stages: { attack: 0, defense: 0, speed: 0 }, status: emptyStatus(), charged: false, defending: false,
    skills, resist, wildness: 0, affection: 0, recruitable: spec.recruitable ?? true, recruitBase: sp.recruitBaseChance,
    expYield: Math.round(sp.expYield * Math.max(1, spec.hpScale ?? 1)), goldYield: Math.round(sp.goldYield * Math.max(1, spec.hpScale ?? 1)),
    distorted: !!spec.distorted,
    healsUsed: 0, used: {}, statusHits: 0,
  };
}

/** 同じ名前が並んだら A・B・C をつける（味方と同じ名前の敵にも つけて 見分けやすくする） */
function labelDuplicates(cs: Combatant[], reserved: string[] = []) {
  const count: Record<string, number> = {};
  for (const c of cs) count[c.name] = (count[c.name] ?? 0) + 1;
  const seen: Record<string, number> = {};
  for (const c of cs) {
    if (count[c.name] > 1 || reserved.includes(c.name)) {
      const i = (seen[c.name] = (seen[c.name] ?? 0) + 1);
      c.name = `${c.name}${'ABCDE'[i - 1]}`;
    }
  }
}

export function createBattle(kind: BattleKind, party: MonsterInstance[], enemies: EnemySpec[], tactic: Tactic): BattleState {
  const W = kind === 'wild' ? BALANCE.wild : kind === 'arena' ? BALANCE.arena : null;
  const es = enemies.map((e, i) => enemyFromSpec(W ? { ...e, hpScale: (e.hpScale ?? 1) * W.hpScale, statScale: (e.statScale ?? 1) * W.statScale } : e, i));
  const allies = party.map((m, i) => allyFromInstance(m, i));
  labelDuplicates(es, allies.map((a) => a.name));
  return {
    kind,
    allies,
    enemies: es,
    turn: 0,
    tactic,
    enemyTactic: 'skill',
    escapeTries: 0,
    canEscape: kind === 'wild',
    canUseItems: kind !== 'arena',
    canRecruit: kind === 'wild',
    outcome: null,
    aiLog: [],
  };
}

const clone = (s: BattleState): BattleState => structuredClone(s);
const find = (s: BattleState, key: string) => [...s.allies, ...s.enemies].find((c) => c.key === key)!;

type Planned = { actor: Combatant; priority: number; run: () => void };

/**
 * 1ターンぶんを解決する。入力の state は変更せず、新しい state とイベント列を返す。
 * 画面はイベント列を順に再生するだけで、HP などを書き換えない。
 */
export function resolveTurn(input: BattleState, cmd: TurnInput, rng: Rng): TurnResult {
  const s = clone(input);
  const ev: BattleEvent[] = [];
  const itemsUsed: Record<string, number> = {};
  if (s.outcome) return { state: s, events: ev, itemsUsed };
  s.turn += 1;
  for (const c of [...s.allies, ...s.enemies]) c.defending = false;

  // ---- にげる（味方の行動より先に判定）
  let alliesAct = true;
  if (cmd.player.kind === 'escape') {
    if (!s.canEscape) {
      ev.push({ t: 'msg', text: 'にげられない！' });
    } else {
      const avg = (cs: Combatant[]) => cs.reduce((a, c) => a + effSpeed(c), 0) / Math.max(1, cs.length);
      const p = clamp(B.defaultEscapeChance + (avg(alive(s.allies)) - avg(alive(s.enemies))) * 0.01 + s.escapeTries * 0.12, 0.2, 0.95);
      ev.push({ t: 'msg', text: 'モンスターたちは にげだした！' });
      if (chance(rng, p)) {
        s.outcome = 'escape';
        ev.push({ t: 'end', outcome: 'escape', text: 'うまく にげきれた！' });
        return { state: s, events: ev, itemsUsed };
      }
      s.escapeTries += 1;
      ev.push({ t: 'msg', text: 'しかし まわりこまれてしまった！' });
    }
    alliesAct = false;
  }

  const plans: Planned[] = [];
  // ---- プレイヤー（どうぐ・にく）は最優先
  if (cmd.player.kind === 'item') {
    const pa = cmd.player;
    const dummy = { ...s.allies[0], key: 'player', side: 'ally' as const, slot: -1, speed: 9999 };
    plans.push({ actor: dummy, priority: 10, run: () => useItem(s, pa.itemId, pa.target, ev, itemsUsed, rng) });
  }
  if (alliesAct) {
    s.allies.forEach((a, i) => {
      if (a.hp <= 0) return;
      const c: AllyCommand = cmd.mode === 'auto' ? { kind: 'auto' } : (cmd.commands?.[i] ?? { kind: 'auto' });
      if (c.kind === 'defend') {
        a.defending = true; // ぼうぎょはターンの最初から有効
        plans.push({ actor: a, priority: 5, run: () => ev.push({ t: 'msg', text: `${a.name}は みを まもっている。` }) });
        return;
      }
      const pr = c.kind === 'skill' ? getSkill(c.skillId).priority : 0;
      plans.push({ actor: a, priority: pr, run: () => allyAct(s, a, c, ev, rng) });
    });
  }
  for (const e of s.enemies) {
    if (e.hp <= 0) continue;
    plans.push({ actor: e, priority: 0, run: () => monsterAct(s, e, autoChoice(s, e, s.enemyTactic, rng, 6), ev, rng) });
  }
  const order = decideOrder(plans.map((p) => ({ actor: p.actor, priority: p.priority })), rng);
  for (const o of order) {
    if (s.outcome) break;
    const p = plans.find((x) => x.actor === o.actor)!;
    if (p.actor.key !== 'player' && p.actor.hp <= 0) continue;
    p.run();
    checkEnd(s, ev);
  }
  if (!s.outcome) endOfTurn(s, ev, rng);
  checkEnd(s, ev);
  return { state: s, events: ev, itemsUsed };
}

function checkEnd(s: BattleState, ev: BattleEvent[]) {
  if (s.outcome) return;
  if (!alive(s.enemies).length) {
    s.outcome = 'win';
    ev.push({ t: 'end', outcome: 'win', text: s.enemies.length > 1 ? 'まものたちを やっつけた！' : `${s.enemies[0].name}を やっつけた！` });
  } else if (!alive(s.allies).length) {
    s.outcome = 'lose';
    ev.push({ t: 'end', outcome: 'lose', text: 'モンスターたちは ぜんめつした…。' });
  }
}

function autoChoice(s: BattleState, c: Combatant, tactic: Tactic, rng: Rng, noise = 3) {
  const whim = c.side === 'enemy' ? (B.enemyWhim[s.kind] ?? 0) : 0;
  const ch = chooseAction(s, c, tactic, rng, noise, whim);
  s.aiLog.push(`T${s.turn} ${c.name}: ${getSkill(ch.skillId).name} (${ch.reason}, ${ch.score.toFixed(1)})`);
  if (s.aiLog.length > 60) s.aiLog.splice(0, s.aiLog.length - 60);
  return ch;
}

function allyAct(s: BattleState, a: Combatant, c: AllyCommand, ev: BattleEvent[], rng: Rng) {
  // 野生値が高いと命令を聞かないことがある
  const p = Math.min(B.maxDisobey, a.wildness * B.disobeyPerWildness);
  if (p > 0 && chance(rng, p) && !a.status.sleep && !a.status.paralysis) {
    ev.push({ t: 'msg', text: pick(rng, [`${a.name}は そっぽを むいている。`, `${a.name}は いうことを きかない！`, `${a.name}は あくびを している。`]) });
    return;
  }
  if (c.kind === 'auto') return monsterAct(s, a, autoChoice(s, a, a.tactic ?? s.tactic, rng), ev, rng);
  if (c.kind === 'attack') return monsterAct(s, a, { skillId: 'attack', target: c.target }, ev, rng);
  if (c.kind === 'skill') {
    const sk = getSkill(c.skillId);
    if (a.mp < sk.mpCost) {
      ev.push({ t: 'msg', text: `${a.name}は ${sk.name}を つかおうとした！` }, { t: 'msg', text: 'しかし MPが たりない！' });
      return;
    }
    return monsterAct(s, a, { skillId: c.skillId, target: c.target }, ev, rng);
  }
}

function canAct(c: Combatant, ev: BattleEvent[]): boolean {
  if (c.status.sleep > 0) {
    ev.push({ t: 'msg', text: `${c.name}は ねむっている。` });
    return false;
  }
  if (c.status.paralysis > 0) {
    ev.push({ t: 'msg', text: `${c.name}は しびれて うごけない！` });
    return false;
  }
  return true;
}

function retarget(s: BattleState, actor: Combatant, sk: SkillDefinition, target: string | undefined, rng: Rng): Combatant | undefined {
  const enemySide = sk.target === 'oneEnemy';
  const pool = enemySide ? alive(opponentsOf(s, actor)) : sk.category === 'revive' ? friendsOf(s, actor).filter((c) => c.hp <= 0) : alive(friendsOf(s, actor));
  const t = target ? find(s, target) : undefined;
  if (t && pool.includes(t)) return t;
  if (!pool.length) return undefined;
  if (!enemySide && sk.category === 'heal') return [...pool].sort((x, y) => x.hp / x.maxHp - y.hp / y.maxHp)[0];
  return pick(rng, pool);
}

function monsterAct(s: BattleState, a: Combatant, choice: { skillId: string; target?: string }, ev: BattleEvent[], rng: Rng) {
  if (!canAct(a, ev)) return;
  let sk = getSkill(choice.skillId);
  let targetKey = choice.target;
  if (a.status.confusion > 0) {
    ev.push({ t: 'msg', text: `${a.name}は こんらんしている！` });
    if (chance(rng, 0.5)) {
      sk = getSkill('attack');
      const pool = alive([...s.allies, ...s.enemies]).filter((c) => c !== a);
      targetKey = pick(rng, pool)?.key;
      if (!targetKey) return;
      return doPhysical(s, a, sk, [find(s, targetKey)], ev, rng, true);
    }
  }
  if (sk.mpCost > a.mp) sk = getSkill('attack');
  a.mp -= sk.mpCost;
  const verb = sk.id === 'attack' ? 'の こうげき！' : `は ${sk.name}を つかった！`;
  ev.push({ t: 'act', actor: a.key, skillId: sk.id, text: `${a.name}${verb}` });
  if (sk.mpCost) ev.push({ t: 'mp', target: a.key, mp: a.mp });

  const foes = alive(opponentsOf(s, a));
  const friends = alive(friendsOf(s, a));
  const targets = (): Combatant[] => {
    switch (sk.target) {
      case 'self': return [a];
      case 'allAllies': return friends;
      case 'allEnemies': return foes;
      case 'randomEnemies': return foes;
      default: { const t = retarget(s, a, sk, targetKey, rng); return t ? [t] : []; }
    }
  };
  const ts = targets();
  if (!ts.length) { ev.push({ t: 'msg', text: 'しかし だれも いなかった。' }); return; }

  if (sk.category === 'heal' || sk.category === 'revive') a.healsUsed += 1;
  a.used[sk.id] = (a.used[sk.id] ?? 0) + 1;
  switch (sk.category) {
    case 'physical': return doPhysical(s, a, sk, ts, ev, rng, false);
    case 'magic':
    case 'breath':
      for (const t of ts) dealDamage(a, t, calculateDamage({ skill: sk, attacker: a, defender: t, isCritical: false, charged: false, rng }), ev, sk, rng);
      return;
    case 'heal':
      for (const t of ts) {
        const amt = Math.min(t.maxHp - t.hp, healAmount(sk, a, rng));
        t.hp += amt;
        ev.push({ t: 'heal', target: t.key, amount: amt, hp: t.hp, text: `${t.name}の HPが ${amt} かいふくした！` });
      }
      return;
    case 'revive':
      for (const t of ts) {
        if (t.hp > 0) { ev.push({ t: 'msg', text: 'しかし なにも おこらなかった。' }); continue; }
        reviveTarget(t, sk.power, ev);
      }
      return;
    case 'cure':
      for (const t of ts) cureTarget(t, ev);
      return;
    case 'buff':
      if (sk.charge) {
        a.charged = true;
        ev.push({ t: 'status', target: a.key, status: 'buff', on: true, text: `${a.name}は ちからを ためている！` });
        return;
      }
      for (const t of ts) changeStage(t, sk.buff!.stat, sk.buff!.stages, ev);
      return;
    case 'debuff':
      for (const t of ts) {
        if (!chance(rng, sk.hitRate)) { ev.push({ t: 'miss', target: t.key, text: `${t.name}には きかなかった！` }); continue; }
        changeStage(t, sk.buff!.stat, sk.buff!.stages, ev);
      }
      return;
    case 'status':
      for (const t of ts) applyStatus(t, sk.statusEffectId!, sk.statusChance ?? 0, ev, rng);
      return;
  }
}

function doPhysical(s: BattleState, a: Combatant, sk: SkillDefinition, ts: Combatant[], ev: BattleEvent[], rng: Rng, confused: boolean) {
  const charged = a.charged;
  if (charged && !confused) a.charged = false;
  const hits = sk.hits ?? 1;
  const list: Combatant[] = [];
  if (sk.target === 'randomEnemies') {
    for (let i = 0; i < hits; i++) {
      const pool = alive(opponentsOf(s, a));
      if (pool.length) list.push(pick(rng, pool));
    }
  } else if (sk.target === 'allEnemies') list.push(...ts);
  else for (let i = 0; i < hits; i++) list.push(ts[0]);
  if (confused) ev.push({ t: 'act', actor: a.key, skillId: 'attack', text: `${a.name}は ${list[0].name}に おそいかかった！` });
  for (const t of list) {
    if (t.hp <= 0) continue;
    const sure = t.status.sleep > 0 || t.status.paralysis > 0;
    if (!sure && !chance(rng, sk.hitRate)) {
      ev.push({ t: 'miss', target: t.key, text: `ミス！ ${t.name}は ひらりと みを かわした！` });
      continue;
    }
    const crit = sk.id === 'attack' && chance(rng, B.criticalChance);
    if (crit) ev.push({ t: 'msg', text: 'かいしんの いちげき！' });
    const d = calculateDamage({ skill: sk, attacker: a, defender: t, isCritical: crit, charged: charged && !confused, rng });
    dealDamage(a, t, d, ev, sk, rng, crit);
    if (sk.recoil && d > 0 && a.hp > 0) {
      const r = Math.max(1, Math.floor(d * sk.recoil));
      a.hp = Math.max(0, a.hp - r);
      ev.push({ t: 'damage', target: a.key, amount: r, hp: a.hp, text: `${a.name}も はんどうで ${r}の ダメージ！` });
      if (a.hp <= 0) ev.push({ t: 'faint', target: a.key, text: faintText(a) });
    }
    if (t.hp > 0 && t.status.sleep > 0 && chance(rng, 0.5)) {
      t.status.sleep = 0;
      ev.push({ t: 'status', target: t.key, status: 'sleep', on: false, text: `${t.name}は めを さました！` });
    }
  }
}

const faintText = (c: Combatant) => (c.side === 'enemy' ? `${c.name}を たおした！` : `${c.name}は たおれた！`);

function dealDamage(_a: Combatant, t: Combatant, d: number, ev: BattleEvent[], sk: SkillDefinition, _rng: Rng, crit = false) {
  if (t.hp <= 0) return;
  if (d <= 0) {
    ev.push({ t: 'miss', target: t.key, text: `${t.name}には まったく きいていない！` });
    return;
  }
  t.hp = Math.max(0, t.hp - d);
  const weak = !!sk.elementId && (t.resist[sk.elementId] ?? 0) < 0;
  ev.push({ t: 'damage', target: t.key, amount: d, hp: t.hp, crit, weak, text: `${t.name}に ${d}の ダメージ！${weak ? '' : ''}` });
  if (t.hp <= 0) {
    t.status = emptyStatus();
    t.charged = false;
    ev.push({ t: 'faint', target: t.key, text: faintText(t) });
  }
}

function changeStage(t: Combatant, stat: 'attack' | 'defense' | 'speed', delta: number, ev: BattleEvent[]) {
  const before = t.stages[stat];
  const after = clamp(before + delta, -B.maxStage, B.maxStage);
  if (after === before) {
    ev.push({ t: 'msg', text: `${t.name}の ${STAT_NAME[stat]}は もう ${delta > 0 ? 'あがらない' : 'さがらない'}！` });
    return;
  }
  t.stages[stat] = after;
  ev.push({ t: 'status', target: t.key, status: 'buff', on: delta > 0, text: `${t.name}の ${STAT_NAME[stat]}が ${delta > 0 ? 'あがった' : 'さがった'}！` });
}

/** 状態異常: 耐性で確率が下がる。すでにかかっていれば効果なし（上書きしない）。 */
export function applyStatus(t: Combatant, st: StatusId, base: number, ev: BattleEvent[], rng: Rng) {
  const already = st === 'poison' ? t.status.poison : t.status[st] > 0;
  if (already) { ev.push({ t: 'msg', text: `${t.name}は すでに ${STATUS_NAME[st]}に なっている。` }); return; }
  // 状態異常は かかるたびに かかりにくくなる（はめ殺しを防ぐ）
  const p = base * statusMultiplier(t, st) * Math.pow(B.statusRepeatFactor, t.statusHits);
  if (!chance(rng, p)) { ev.push({ t: 'miss', target: t.key, text: `${t.name}には きかなかった！` }); return; }
  t.statusHits += 1;
  if (st === 'poison') t.status.poison = true;
  else {
    const [lo, hi] = st === 'sleep' ? B.sleepTurns : st === 'paralysis' ? B.paralysisTurns : B.confusionTurns;
    t.status[st] = randomInt(rng, lo, hi);
  }
  const msg = { sleep: 'ねむってしまった！', paralysis: 'しびれて うごけなくなった！', confusion: 'こんらんした！', poison: 'どくに おかされた！' }[st];
  ev.push({ t: 'status', target: t.key, status: st, on: true, text: `${t.name}は ${msg}` });
}

function cureTarget(t: Combatant, ev: BattleEvent[]) {
  const had = t.status.sleep || t.status.paralysis || t.status.confusion || t.status.poison;
  t.status = emptyStatus();
  ev.push(had ? { t: 'status', target: t.key, status: 'poison', on: false, text: `${t.name}の からだが もとに もどった！` } : { t: 'msg', text: 'しかし なにも おこらなかった。' });
}

function reviveTarget(t: Combatant, percent: number, ev: BattleEvent[]) {
  t.hp = Math.max(1, Math.floor((t.maxHp * percent) / 100));
  t.status = emptyStatus();
  ev.push({ t: 'revive', target: t.key, hp: t.hp, text: `${t.name}は いきかえった！` });
}

function useItem(s: BattleState, itemId: string, target: string, ev: BattleEvent[], used: Record<string, number>, rng: Rng) {
  const it = getItem(itemId);
  used[itemId] = (used[itemId] ?? 0) + 1;
  const t = find(s, target);
  if (it.category === 'meat') {
    ev.push({ t: 'item', itemId, text: `${t.name}に ${it.name}を なげた！` });
    if (!t || t.side !== 'enemy' || t.hp <= 0) { ev.push({ t: 'msg', text: 'しかし だれも うけとらなかった。' }); return; }
    t.affection += it.power;
    if (t.status.sleep > 0) { ev.push({ t: 'msg', text: `${t.name}は ねむっていて きづかない…。` }); t.affection -= it.power * 0.5; return; }
    ev.push({ t: 'msg', text: pick(rng, [`${t.name}は ${it.name}を むしゃむしゃ たべている！`, `${t.name}は ${it.name}に とびついた！`]) });
    if (t.affection >= 0.5) ev.push({ t: 'msg', text: `${t.name}は うれしそうに こちらを みている。` });
    return;
  }
  ev.push({ t: 'item', itemId, text: `どうぐ ${it.name}を つかった！` });
  if (!t) return;
  switch (it.category) {
    case 'heal': {
      if (t.hp <= 0) { ev.push({ t: 'msg', text: 'しかし こうかが なかった。' }); return; }
      const amt = Math.min(t.maxHp - t.hp, it.power);
      t.hp += amt;
      ev.push({ t: 'heal', target: t.key, amount: amt, hp: t.hp, text: `${t.name}の HPが ${amt} かいふくした！` });
      return;
    }
    case 'mp': {
      if (t.hp <= 0) { ev.push({ t: 'msg', text: 'しかし こうかが なかった。' }); return; }
      const amt = Math.min(t.maxMp - t.mp, it.power);
      t.mp += amt;
      ev.push({ t: 'mp', target: t.key, mp: t.mp, text: `${t.name}の MPが ${amt} かいふくした！` });
      return;
    }
    case 'revive':
      if (t.hp > 0) { ev.push({ t: 'msg', text: 'しかし こうかが なかった。' }); return; }
      reviveTarget(t, it.power, ev);
      return;
    case 'cure':
      cureTarget(t, ev);
      return;
  }
}

function endOfTurn(s: BattleState, ev: BattleEvent[], _rng: Rng) {
  for (const c of [...s.allies, ...s.enemies]) {
    if (c.hp <= 0) continue;
    if (c.status.poison) {
      const d = Math.max(1, Math.floor(c.maxHp * B.poisonDamageRate));
      c.hp = Math.max(0, c.hp - d);
      ev.push({ t: 'damage', target: c.key, amount: d, hp: c.hp, text: `${c.name}は どくで ${d}の ダメージ！` });
      if (c.hp <= 0) { c.status = emptyStatus(); ev.push({ t: 'faint', target: c.key, text: faintText(c) }); continue; }
    }
    if (c.status.sleep > 0 && --c.status.sleep === 0) ev.push({ t: 'status', target: c.key, status: 'sleep', on: false, text: `${c.name}は めを さました！` });
    if (c.status.paralysis > 0 && --c.status.paralysis === 0) ev.push({ t: 'status', target: c.key, status: 'paralysis', on: false, text: `${c.name}の からだの しびれが とれた！` });
    if (c.status.confusion > 0 && --c.status.confusion === 0) ev.push({ t: 'status', target: c.key, status: 'confusion', on: false, text: `${c.name}は われに かえった！` });
  }
}

/** 勝利時の報酬（全員に同じだけ経験値が入る） */
export function battleRewards(s: BattleState): { exp: number; gold: number } {
  const exp = s.enemies.reduce((a, e) => a + e.expYield * e.level * BALANCE.reward.expScale, 0);
  const gold = s.enemies.reduce((a, e) => a + e.goldYield * (1 + e.level * 0.5) * BALANCE.reward.goldScale, 0);
  return { exp: Math.round(exp), gold: Math.round(gold) };
}

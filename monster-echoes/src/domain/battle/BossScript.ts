// ボスの 行動台本を うごかす。データは src/data/bosses/scripts.ts。
// ターンの はじめ（turnStart）と おわり（turnEnd）に よばれ、条件を みたした ルールの 手順を じゅんに 実行する。
import { BOSS_SCRIPTS } from '../../data/bosses/scripts';
import { getSkill } from '../../data/skills';
import type { BossRule, BossStep, BuffStat, ElementId, EnemySpec, Resistances } from '../../data/types';
import { ELEMENT_WEAKNESS } from '../../data/v2/monsters/def';
import type { BattleEvent, BattleState, Combatant } from './types';

export type ScriptState = { fired: string[]; phase: number; elementIndex: number; baseResist: Resistances; forcedSkill?: string };
export type ScriptTiming = 'turnStart' | 'turnEnd';
export type ScriptHelpers = {
  makeEnemy: (spec: EnemySpec, slot: number) => Combatant;
  changeStage: (t: Combatant, stat: BuffStat, delta: number, ev: BattleEvent[]) => void;
};

const ELEMENT_NAME: Record<ElementId, string> = { fire: 'ほのお', water: 'みず', wind: 'かぜ', earth: 'だいち', thunder: 'かみなり', ice: 'こおり', light: 'ひかり', shadow: 'かげ' };
/** 場に いられる 敵の かず（召喚の 上限） */
export const MAX_FIELD_ENEMIES = 4;

export function initScript(c: Combatant, scriptId: string | undefined) {
  if (!scriptId) return;
  if (!BOSS_SCRIPTS[scriptId]) throw new Error(`unknown boss script: ${scriptId}`);
  c.script = scriptId;
  c.scriptState = { fired: [], phase: 0, elementIndex: -1, baseResist: { ...c.resist } };
}

const alive = (cs: Combatant[]) => cs.filter((c) => c.hp > 0);
const minions = (s: BattleState) => alive(s.enemies).filter((e) => e.summoned).length;

function triggered(r: BossRule, s: BattleState, boss: Combatant, timing: ScriptTiming): boolean {
  const st = boss.scriptState!;
  if (r.once && st.fired.includes(r.id)) return false;
  if (r.inPhase !== undefined && r.inPhase !== st.phase) return false;
  const w = r.when;
  switch (w.kind) {
    case 'start': return timing === 'turnStart' && s.turn === 1;
    case 'turn': {
      if (timing !== 'turnStart') return false;
      if (w.at !== undefined) return s.turn === w.at;
      const from = w.from ?? w.every ?? 1;
      return !!w.every && s.turn >= from && (s.turn - from) % w.every === 0;
    }
    case 'hpBelow': return boss.hp > 0 && boss.hp <= boss.maxHp * w.ratio;
    case 'minionsBelow': return timing === 'turnEnd' && s.turn > 1 && minions(s) < w.count;
  }
}

/** 台本を もつ 敵の ルールを 実行する */
export function runBossScripts(s: BattleState, timing: ScriptTiming, ev: BattleEvent[], h: ScriptHelpers) {
  for (const boss of [...s.enemies]) {
    if (!boss.script || boss.hp <= 0 || s.outcome) continue;
    const st = boss.scriptState!;
    if (timing === 'turnStart') st.forcedSkill = undefined;
    for (const r of BOSS_SCRIPTS[boss.script].rules) {
      if (!triggered(r, s, boss, timing)) continue;
      if (!st.fired.includes(r.id)) st.fired.push(r.id);
      for (const step of r.steps) runStep(s, boss, step, ev, h);
    }
  }
}

function runStep(s: BattleState, boss: Combatant, step: BossStep, ev: BattleEvent[], h: ScriptHelpers) {
  const st = boss.scriptState!;
  switch (step.kind) {
    case 'message':
      ev.push({ t: 'msg', text: step.text });
      return;
    case 'summon': {
      let n = 0;
      for (let i = 0; i < step.count; i++) {
        if (alive(s.enemies).length >= Math.min(step.max, MAX_FIELD_ENEMIES)) break;
        // たおれた 子分の 場所を つかいまわす（キーは かえる）
        const slot = s.enemies.length;
        const c = h.makeEnemy({ speciesId: step.speciesId, level: step.level, recruitable: false, name: step.name }, slot);
        c.summoned = true;
        const same = s.enemies.filter((e) => e.name.startsWith(c.name)).length;
        if (same) c.name = `${c.name}${'ABCDEFGH'[same] ?? ''}`;
        c.expYield = 0;
        c.goldYield = 0;
        s.enemies.push(c);
        ev.push({ t: 'summon', target: c.key, combatant: structuredClone(c), text: `${c.name}が あらわれた！` });
        n++;
      }
      if (!n) ev.push({ t: 'msg', text: `${boss.name}は なかまを よんだ！ しかし だれも こなかった。` });
      return;
    }
    case 'reflect':
      boss.reflect = { turns: step.turns, categories: [...step.categories], hits: step.physicalHits };
      ev.push({ t: 'status', target: boss.key, status: 'buff', on: true, text: `${boss.name}の まえに かがみが あらわれた！` });
      return;
    case 'buff': {
      const ts = step.target === 'self' ? [boss] : alive(s.enemies);
      for (const t of ts) h.changeStage(t, step.stat, step.stages, ev);
      return;
    }
    case 'phase': {
      st.phase += 1;
      if (step.message) ev.push({ t: 'msg', text: step.message });
      if (step.name) boss.name = step.name;
      if (step.statScale) {
        for (const k of ['attack', 'defense', 'speed', 'magic', 'spirit'] as const) boss[k] = Math.round(boss[k] * step.statScale);
      }
      if (step.skills) boss.skills = [...step.skills];
      if (step.resist) { st.baseResist = { ...step.resist }; boss.resist = { ...step.resist }; st.elementIndex = -1; }
      if (step.clearStages) boss.stages = { attack: 0, defense: 0, speed: 0, magic: 0, spirit: 0 };
      boss.status = { sleep: 0, paralysis: 0, confusion: 0, poison: false };
      boss.reflect = undefined;
      if (step.healRatio) {
        const amt = Math.max(0, Math.round(boss.maxHp * step.healRatio) - boss.hp);
        boss.hp += amt;
        if (amt) ev.push({ t: 'heal', target: boss.key, amount: amt, hp: boss.hp, text: `${boss.name}の ちからが みなぎる！` });
      }
      ev.push({ t: 'phase', target: boss.key, name: boss.name, text: `${boss.name}が すがたを あらわした！` });
      return;
    }
    case 'element': {
      st.elementIndex = (st.elementIndex + 1) % step.cycle.length;
      const e = step.cycle[st.elementIndex];
      const r: Resistances = { ...st.baseResist };
      for (const k of step.cycle) if ((r[k] ?? 0) > 0) delete r[k];
      r[e] = 2;
      r[ELEMENT_WEAKNESS[e]] = -1;
      boss.resist = r;
      ev.push({ t: 'msg', text: `${boss.name}の からだが ${ELEMENT_NAME[e]}の いろに かわった！` });
      return;
    }
    case 'dispel': {
      const foes = alive(s.allies);
      let any = false;
      for (const c of foes) {
        for (const k of Object.keys(c.stages) as (keyof Combatant['stages'])[]) if (c.stages[k] > 0) { c.stages[k] = 0; any = true; }
        if (c.charged) { c.charged = false; any = true; }
      }
      ev.push({ t: 'msg', text: any ? 'みかたの つよさが もとに もどってしまった！' : 'くろい なみが ひろがった……' });
      return;
    }
    case 'useSkill':
      getSkill(step.skillId); // ない 特技なら ここで エラー
      st.forcedSkill = step.skillId;
      return;
  }
}

/** この ターンに 台本で きまった 特技（MP が たりなければ なし） */
export function forcedSkillOf(c: Combatant): string | undefined {
  const id = c.scriptState?.forcedSkill;
  if (!id) return undefined;
  c.scriptState!.forcedSkill = undefined;
  return id;
}

/**
 * はねかえし: 台本の かがみが あれば あたる あいてを 使い手に かえる。
 * 物理で なぐると かがみが けずれる（physicalHits 回で われる）。
 */
export function reflectTarget(a: Combatant, t: Combatant, category: string, ev: BattleEvent[]): Combatant {
  const r = t.reflect;
  if (!r || t === a || t.side === a.side) return t;
  if (category === 'physical' && r.hits !== undefined && !r.categories.includes('physical')) {
    r.hits -= 1;
    if (r.hits <= 0) {
      t.reflect = undefined;
      ev.push({ t: 'status', target: t.key, status: 'buff', on: false, text: `${t.name}の かがみが くだけちった！` });
    }
    return t;
  }
  if (!r.categories.includes(category as never)) return t;
  ev.push({ t: 'msg', text: `${t.name}の かがみが こうげきを はねかえした！` });
  return a;
}

/** ターンの おわりに かがみの のこりを へらす */
export function tickReflect(c: Combatant, ev: BattleEvent[]) {
  if (!c.reflect) return;
  if (--c.reflect.turns <= 0) {
    c.reflect = undefined;
    ev.push({ t: 'status', target: c.key, status: 'buff', on: false, text: `${c.name}の かがみが きえた。` });
  }
}

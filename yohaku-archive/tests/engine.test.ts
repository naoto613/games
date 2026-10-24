import { describe, expect, it } from 'vitest';
import { PUZZLE_MAP } from '../src/data/puzzles';
import { BATTLE_MAP } from '../src/data/enemies';
import { applyOp, checkEdit, emptyEdit, evaluate, revealChanged, type EditEnv, type GraphDef } from '../src/engine/causal';
import { evalCond } from '../src/engine/cond';
import {
  addRecord, cond, equip, gainExp, joinParty, learn, marginMax, newGame, statsOf, useItemField, addItem,
} from '../src/engine/state';
import { battleEditEnv, checkBattleEdit, doBattleEdit, evalBattle, intentHolds, intentOf, resolveTurn, startBattle, type Command, type BattleState } from '../src/engine/battle';
import { deserialize, serialize } from '../src/engine/save';

const env = (over: Partial<EditEnv> = {}): EditEnv => ({
  records: new Set(['r_dishes', 'r_neighbor', 'r_handwriting', 'r_note', 'r_death']),
  obs: 10, margin: 3, tolerance: 1, unlocked: new Set(['connect', 'cut']), costDown: 0, shards: 0, ...over,
});

describe('条件式', () => {
  it('& と | と ! を解く', () => {
    const t = (x: string) => x === 'a' || x === 'b';
    expect(evalCond('a & b', t)).toBe(true);
    expect(evalCond('a & c', t)).toBe(false);
    expect(evalCond('c | a', t)).toBe(true);
    expect(evalCond('!c & a', t)).toBe(true);
    expect(evalCond('', t)).toBe(true);
  });
});

describe('因果編集', () => {
  const g = PUZZLE_MAP.get('p_mother')!;

  it('最初は「使った人がいない」という欠因の矛盾がある', () => {
    const r = evaluate(g, emptyEdit());
    expect(r.contras.map(c => c.id)).toEqual(['c1']);
    expect(r.active.has('held')).toBe(true);
  });

  it('接続すると結果が変わり、予測に出る', () => {
    const chk = checkEdit(g, emptyEdit(), { kind: 'link', id: 'L1' }, 'connect', env());
    expect(chk.ok).toBe(true);
    expect(chk.cost).toBe(1);
    expect(chk.on).toContain('someone');
    expect(chk.resolvedContras.map(c => c.id)).toEqual(['c1']);
  });

  it('矛盾が許容量を超える編集はできない', () => {
    const chk = checkEdit(g, emptyEdit(), { kind: 'link', id: 'L3' }, 'connect', env());
    expect(chk.ok).toBe(false);
    expect(chk.reasons.join()).toContain('矛盾');
  });

  it('記録が足りなければできないが、記録片で代用できる', () => {
    const e = env({ records: new Set(['r_dishes']) });
    const step1 = applyOp(g, emptyEdit(), { kind: 'link', id: 'L1' }, 'connect');
    expect(checkEdit(g, step1, { kind: 'link', id: 'L2' }, 'connect', e).ok).toBe(false);
    const withShard = checkEdit(g, step1, { kind: 'link', id: 'L2' }, 'connect', { ...e, shards: 1 });
    expect(withShard.ok).toBe(true);
    expect(withShard.usesShard).toBe(true);
  });

  it('隠れた代償は「未調査の影響」として伏せられ、編集後に明かされる', () => {
    const step1 = applyOp(g, emptyEdit(), { kind: 'link', id: 'L1' }, 'connect');
    const chk = checkEdit(g, step1, { kind: 'link', id: 'L2' }, 'connect', env());
    expect(chk.ok).toBe(true);
    expect(chk.off).not.toContain('held');
    expect(chk.hiddenChanges).toBe(1);
    const revealed = revealChanged(g, chk.before, chk.after, chk.nextEdit);
    expect(revealed.revealed.L5).toBe(true);
  });

  it('反転は矢印の向きを変える', () => {
    const gear = PUZZLE_MAP.get('p_gear')!;
    const e = applyOp(gear, emptyEdit(), { kind: 'link', id: 't3' }, 'invert');
    const r = evaluate(gear, e);
    expect(r.active.has('door')).toBe(true);
    expect(r.active.has('flow')).toBe(true);
  });

  it('原因を奪う接続は、元の関係を切り離す', () => {
    const g2: GraphDef = {
      id: 't', title: 't',
      nodes: [{ id: 'a', label: 'a', x: 0, y: 0, base: true }, { id: 'b', label: 'b', x: 0, y: 0 }, { id: 'c', label: 'c', x: 0, y: 0 }],
      links: [
        { id: 'x', from: 'a', to: 'b', state: 'intact' },
        { id: 'y', from: 'a', to: 'c', state: 'possible', ops: ['connect'], steals: 'x' },
      ],
    };
    const r = evaluate(g2, applyOp(g2, emptyEdit(), { kind: 'link', id: 'y' }, 'connect'));
    expect(r.active.has('b')).toBe(false);
    expect(r.active.has('c')).toBe(true);
  });
});

describe('ゲーム状態', () => {
  it('条件式でフラグや記録を読む', () => {
    const s = newGame();
    s.flags.chapter1 = 1;
    addRecord(s, 'r_diary');
    expect(cond(s, 'f:chapter1 & r:r_diary')).toBe(true);
    expect(cond(s, 'f:chapter1 & !r:r_diary')).toBe(false);
    s.quests.mq1 = 2;
    expect(cond(s, 'q:mq1>=2')).toBe(true);
    expect(cond(s, 'g:gold>=10')).toBe(true);
  });

  it('レベルアップで能力とスキルポイントが増える', () => {
    const s = newGame();
    const before = statsOf(s, 'seil');
    const msgs = gainExp(s, 200);
    expect(msgs.length).toBeGreaterThan(0);
    expect(statsOf(s, 'seil').hp).toBeGreaterThan(before.hp);
    expect(s.members.seil!.sp).toBeGreaterThan(0);
    expect(learn(s, 'seil', 's_margin')).toBe(s.members.seil!.level >= 4);
  });

  it('装備で能力と余白の上限が変わる', () => {
    const s = newGame();
    const m0 = marginMax(s);
    addItem(s, 'bookmark');
    expect(equip(s, 'seil', 'bookmark', 'acc')).toBe(true);
    expect(marginMax(s)).toBe(m0 + Math.floor(2 / 4 + 0) + 2 + (Math.floor((statsOf(s, 'seil').edit) / 4) - Math.floor((statsOf(s, 'seil').edit - 2) / 4)));
    expect(equip(s, 'seil', null, 'acc')).toBe(true);
    expect(s.inv.bookmark).toBe(1);
  });

  it('探索中に回復薬を使える', () => {
    const s = newGame();
    s.members.seil!.hp = 10;
    expect(useItemField(s, 'potion', 'seil')).toBeTruthy();
    expect(s.members.seil!.hp).toBe(62);
  });

  it('セーブとロードで状態が再現される', () => {
    const s = newGame();
    s.flags.chapter1 = 1;
    s.records.push('r_diary');
    s.graphs.p_gate = applyOp(PUZZLE_MAP.get('p_gate')!, emptyEdit(), { kind: 'link', id: 'g1' }, 'cut');
    joinParty(s, 'dran');
    const t = deserialize(serialize(s))!;
    expect(t).toEqual(s);
    expect(deserialize('壊れたデータ')).toBeNull();
  });

  it('古い形式のセーブも補って読み込める', () => {
    const s = newGame() as unknown as Record<string, unknown>;
    delete s.lens;
    delete s.world;
    s.version = 1;
    const t = deserialize(JSON.stringify(s))!;
    expect(t.lens).toEqual({});
    expect(t.world.stability).toBe(50);
  });
});

function party(level: number, dran = true) {
  const s = newGame();
  s.flags.chapter1 = 1;
  gainExp(s, 0);
  s.members.seil!.level = level;
  if (dran) joinParty(s, 'dran');
  s.members.dran && (s.members.dran.level = level);
  for (const c of s.party) { const st = statsOf(s, c); s.members[c]!.hp = st.hp; s.members[c]!.ap = st.ap; }
  s.margin = marginMax(s);
  return s;
}

describe('戦闘', () => {
  it('チュートリアル：見えている関係を切断すると噛みつきが不成立になる', () => {
    const s = newGame();
    const b = startBattle(BATTLE_MAP.get('b_tutorial')!, s, 1);
    expect(b.planned.e0!.intent).toBe('bite');
    doBattleEdit(b, s, { kind: 'link', id: 'e0.L1' }, 'cut');
    const hp = b.party[0].hp;
    const ev = resolveTurn(b, s, [{ actor: 'seil', kind: 'defend' }]);
    expect(ev.some(e => e.t === 'fail')).toBe(true);
    expect(b.party[0].hp).toBe(hp);
  });

  it('断絶獣：矛盾2つ＋強化で全体攻撃を予告し、崩しで不成立にできる', () => {
    const s = party(5);
    s.members.dran!.skills.push('d_break');
    const b = startBattle(BATTLE_MAP.get('b_east2')!, s, 7);
    expect(b.planned.e0!.intent).toBe('roar');
    const ev = resolveTurn(b, s, [{ actor: 'seil', kind: 'defend' }, { actor: 'dran', kind: 'skill', skill: 'd_break', target: 'e0' }]);
    expect(ev.some(e => e.t === 'fail')).toBe(true);
  });

  it('断絶獣：矛盾を解消（切断）しても全体攻撃を防げる', () => {
    const s = party(5);
    const b = startBattle(BATTLE_MAP.get('b_east2')!, s, 7);
    expect(checkBattleEdit(b, s, { kind: 'link', id: 'f.l0' }, 'cut').ok).toBe(true);
    doBattleEdit(b, s, { kind: 'link', id: 'f.l0' }, 'cut');
    const it = intentOf(b.enemies[0], 'roar')!;
    expect(intentHolds(b, b.enemies[0], it)).toBe(false);
  });

  it('断絶獣：矛盾を味方に繋ぎ替えると強化を奪える', () => {
    const s = party(5);
    const b = startBattle(BATTLE_MAP.get('b_east2')!, s, 7);
    doBattleEdit(b, s, { kind: 'link', id: 'e0.B5' }, 'connect');
    const r = evalBattle(b);
    expect(r.active.has('e0.buff')).toBe(false);
    expect(r.active.has('p.atk')).toBe(true);
  });

  it('沈黙の王：攻撃すると石を纏い、碑文の関係を切れば纏わずに剥がれていく', () => {
    const s = party(7);
    s.records.push('r_inscription');
    const b = startBattle(BATTLE_MAP.get('b_king')!, s, 3);
    resolveTurn(b, s, [{ actor: 'seil', kind: 'attack', target: 'e0' }, { actor: 'dran', kind: 'attack', target: 'e0' }]);
    expect(b.enemies[0].stacks).toBe(1);
    expect(checkBattleEdit(b, s, { kind: 'link', id: 'e0.K2' }, 'cut').ok).toBe(true);
    doBattleEdit(b, s, { kind: 'link', id: 'e0.K2' }, 'cut');
    resolveTurn(b, s, [{ actor: 'seil', kind: 'attack', target: 'e0' }, { actor: 'dran', kind: 'attack', target: 'e0' }]);
    // 纏わなかったターンには石が一枚はがれる
    expect(b.enemies[0].stacks).toBe(0);
  });

  it('沈黙の王：碑文を読んでいなければ、石を纏う関係は見えず切れない', () => {
    const s = party(7);
    const b = startBattle(BATTLE_MAP.get('b_king')!, s, 3);
    expect(checkBattleEdit(b, s, { kind: 'link', id: 'e0.K2' }, 'cut').ok).toBe(false);
  });

  it('保留した行動は次のターンへ持ち越される', () => {
    const s = party(7);
    s.unlocked.push('hold');
    const b = startBattle(BATTLE_MAP.get('b_king')!, s, 3);
    b.enemies[0].stacks = 2;
    b.planned.e0 = { intent: 'toll' };
    doBattleEdit(b, s, { kind: 'node', id: 'e0.toll' }, 'hold');
    const hp = b.party.map(p => p.hp);
    const ev = resolveTurn(b, s, [{ actor: 'seil', kind: 'defend' }, { actor: 'dran', kind: 'defend' }]);
    expect(ev.some(e => e.t === 'fail' && e.text === '保留')).toBe(true);
    expect(b.planned.e0!.intent).toBe('toll');
    void hp;
  });

  it('戦闘の編集は2ターンで元に戻る', () => {
    const s = party(5);
    const b = startBattle(BATTLE_MAP.get('b_t1a')!, s, 9);
    doBattleEdit(b, s, { kind: 'link', id: 'e0.S2' }, 'cut');
    expect(b.edit.links['e0.S2']).toBe('severed');
    resolveTurn(b, s, [{ actor: 'seil', kind: 'defend' }, { actor: 'dran', kind: 'defend' }]);
    expect(b.edit.links['e0.S2']).toBe('severed');
    resolveTurn(b, s, [{ actor: 'seil', kind: 'defend' }, { actor: 'dran', kind: 'defend' }]);
    expect(b.edit.links['e0.S2']).toBeUndefined();
  });
});

/** 単純な方針で最後まで戦わせ、勝てるかを確かめる（難易度の目安） */
function simulate(battleId: string, level: number, opts: { smart: boolean; dran?: boolean; records?: string[]; seed?: number }) {
  const s = party(level, opts.dran ?? true);
  for (const r of opts.records ?? []) s.records.push(r);
  s.unlocked.push('invert', 'hold');
  s.inv.potion = 4;
  if (s.members.dran) s.members.dran.skills.push('d_break');
  const b: BattleState = startBattle(BATTLE_MAP.get(battleId)!, s, opts.seed ?? 11);
  for (let turn = 0; turn < 40 && !b.result; turn++) {
    if (opts.smart) {
      // 予告された行動が強いなら、成立条件を切れるか試す
      for (const e of b.enemies.filter(x => x.alive)) {
        const it = intentOf(e, b.planned[e.uid]!.intent)!;
        if (!it.node || it.kind === 'idle') continue;
        const links = b.graph.links.filter(l => l.to === `${e.uid}.${it.node}` && (l.ops ?? []).includes('cut'));
        for (const l of links) {
          const chk = checkBattleEdit(b, s, { kind: 'link', id: l.id }, 'cut');
          if (chk.ok && chk.cost <= b.margin) { doBattleEdit(b, s, { kind: 'link', id: l.id }, 'cut'); break; }
        }
      }
      // 王の石は最初に断つ
      const k2 = b.graph.links.find(l => l.id === 'e0.K2');
      if (k2 && b.edit.links['e0.K2'] !== 'severed' && checkBattleEdit(b, s, { kind: 'link', id: 'e0.K2' }, 'cut').ok) doBattleEdit(b, s, { kind: 'link', id: 'e0.K2' }, 'cut');
    }
    const target = b.enemies.filter(e => e.alive).sort((x, y) => x.hp - y.hp)[0];
    const cmds: Command[] = b.party.filter(p => p.alive).map(p => {
      if (p.hp < p.maxHp * 0.35 && (s.inv.potion ?? 0) > 0) return { actor: p.uid, kind: 'item', item: 'potion', target: p.uid } as Command;
      if (b.def.devices && opts.smart && !b.deviceCd.weight && p.char === 'seil') return { actor: p.uid, kind: 'device', device: 'weight', target: 'e0' } as Command;
      if (p.char === 'dran' && p.ap >= 3) return { actor: p.uid, kind: 'skill', skill: 'd_smash', target: target.uid } as Command;
      return { actor: p.uid, kind: 'attack', target: target.uid } as Command;
    });
    resolveTurn(b, s, cmds);
  }
  return { result: b.result, turns: b.turn };
}

describe('難易度の目安', () => {
  it('序章のボスはレベル3のセイル一人で勝てる', () => {
    const r = simulate('b_shelf', 3, { smart: true, dran: false });
    expect(r.result).toBe('win');
  });

  it('沈黙の王：仕組みを使えばレベル7で勝てる', () => {
    const wins = [1, 2, 3, 4, 5].filter(seed => simulate('b_king', 7, { smart: true, records: ['r_inscription'], seed }).result === 'win').length;
    expect(wins).toBeGreaterThanOrEqual(4);
  });

  it('沈黙の王：力押しだけでは同じレベルで苦戦する', () => {
    const smart = simulate('b_king', 7, { smart: true, records: ['r_inscription'], seed: 2 });
    const brute = simulate('b_king', 7, { smart: false, seed: 2 });
    expect(brute.result !== 'win' || brute.turns > smart.turns).toBe(true);
  });

  it('battleEditEnv は余白と記録を反映する', () => {
    const s = party(5);
    const b = startBattle(BATTLE_MAP.get('b_t1a')!, s, 1);
    expect(battleEditEnv(b, s).margin).toBe(s.margin);
  });
});

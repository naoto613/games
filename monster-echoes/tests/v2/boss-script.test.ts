import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/core/Random';
import { BOSS_SCRIPT_LIST } from '../../src/data/bosses/scripts';
import { SPECIES } from '../../src/data/monsters';
import { SKILLS } from '../../src/data/skills';
import type { EnemySpec } from '../../src/data/types';
import { createBattle, resolveTurn } from '../../src/domain/battle/BattleEngine';
import type { BattleState, TurnInput } from '../../src/domain/battle/types';
import { createMonster } from '../../src/domain/monster/MonsterFactory';

const party = (level = 30, ids = ['m021', 'm002', 'm121']) => ids.map((id, i) => createMonster(id, createRng(i + 1), { level }));
const wait: TurnInput = { mode: 'command', commands: [{ kind: 'defend' }, { kind: 'defend' }, { kind: 'defend' }], player: { kind: 'none' } };
const boss = (script: string, extra: Partial<EnemySpec> = {}): EnemySpec => ({ speciesId: 'm044', level: 10, hpScale: 20, script, recruitable: false, ...extra });
function run(s: BattleState, turns: number, cmd: TurnInput = wait, seed = 1) {
  const events = [];
  for (let i = 0; i < turns && !s.outcome; i++) {
    const r = resolveTurn(s, cmd, createRng(seed + i));
    s = r.state;
    events.push(...r.events);
  }
  return { s, events };
}

describe('ボスの 行動台本：データ', () => {
  it('台本が 参照する 特技・種族は すべて ある', () => {
    for (const sc of BOSS_SCRIPT_LIST) {
      for (const r of sc.rules) for (const st of r.steps) {
        if (st.kind === 'useSkill') expect(SKILLS[st.skillId], `${sc.id} ${st.skillId}`).toBeTruthy();
        if (st.kind === 'summon') expect(SPECIES[st.speciesId], `${sc.id} ${st.speciesId}`).toBeTruthy();
        if (st.kind === 'phase') for (const k of st.skills ?? []) expect(SKILLS[k], `${sc.id} ${k}`).toBeTruthy();
      }
      expect(new Set(sc.rules.map((r) => r.id)).size).toBe(sc.rules.length);
    }
  });
});

describe('ボスの 行動台本：エンジン', () => {
  it('召喚：子分を よび、場の 上限を こえない。子分は 経験値なし', () => {
    let s = createBattle('boss', party(), [boss('morg')], 'attack');
    const r = run(s, 12);
    s = r.s;
    const summons = r.events.filter((e) => e.t === 'summon');
    expect(summons.length).toBeGreaterThan(0);
    expect(s.enemies.filter((e) => e.hp > 0).length).toBeLessThanOrEqual(3);
    for (const e of s.enemies.filter((x) => x.summoned)) { expect(e.expYield).toBe(0); expect(e.recruitable).toBe(false); }
    // 同じ 名前には 記号が つく
    const names = s.enemies.map((e) => e.name);
    expect(new Set(names).size).toBe(names.length);
  });
  it('最初の ターンに 台本の 特技を つかう（モルグの どくのほうし）', () => {
    const s = createBattle('boss', party(), [boss('morg')], 'attack');
    const r = resolveTurn(s, wait, createRng(1));
    expect(r.events.some((e) => e.t === 'act' && e.actor === 'e0' && e.skillId === 'poisonmist')).toBe(true);
  });
  it('反射：呪文が 使い手に はねかえり、物理で かがみが われる', () => {
    const s = createBattle('boss', party(30, ['m004', 'm002', 'm121']), [boss('mirage', { speciesId: 'm177', level: 30 })], 'attack');
    let r = resolveTurn(s, wait, createRng(2));
    expect(r.state.enemies[0].reflect).toBeTruthy();
    const st = r.state;
    st.allies[0].skills = ['ember'];
    st.allies[0].mp = 99;
    const hp0 = st.allies[0].hp;
    const enemyHp = st.enemies[0].hp;
    r = resolveTurn(st, { mode: 'command', commands: [{ kind: 'skill', skillId: 'ember', target: 'e0' }, { kind: 'defend' }, { kind: 'defend' }], player: { kind: 'none' } }, createRng(3));
    expect(r.events.some((e) => e.t === 'msg' && e.text.includes('はねかえした'))).toBe(true);
    expect(r.events.some((e) => e.t === 'damage' && e.target === 'a0')).toBe(true);
    expect(r.state.allies[0].hp).toBeLessThan(hp0 + 1);
    expect(r.state.enemies[0].hp).toBeGreaterThanOrEqual(Math.min(enemyHp, r.state.enemies[0].maxHp) - 0); // ボスは 呪文で へらない
    // 物理で 2回 なぐると われる
    const atk: TurnInput = { mode: 'command', commands: [{ kind: 'attack', target: 'e0' }, { kind: 'attack', target: 'e0' }, { kind: 'defend' }], player: { kind: 'none' } };
    let s2 = r.state;
    for (let i = 0; i < 3 && s2.enemies[0].reflect; i++) s2 = resolveTurn(s2, atk, createRng(20 + i)).state;
    expect(s2.enemies[0].reflect).toBeFalsy();
  });
  it('ターン強化：一定ターンごとに 能力段階が あがる', () => {
    const s = createBattle('boss', party(), [boss('volga', { speciesId: 'm176', level: 30 })], 'attack');
    const r = run(s, 3);
    expect(r.s.enemies[0].stages.attack).toBeGreaterThan(0);
    expect(r.s.enemies[0].stages.magic).toBeGreaterThan(0);
  });
  it('属性切替：耐性が じゅんに かわる', () => {
    let s = createBattle('boss', party(), [boss('astra', { speciesId: 'm140', level: 30 })], 'attack');
    s = run(s, 2).s;
    expect(s.enemies[0].resist.fire).toBe(2);
    expect(s.enemies[0].resist.water).toBe(-1);
    s = run(s, 2, wait, 9).s;
    expect(s.enemies[0].resist.ice).toBe(2);
    expect(s.enemies[0].resist.fire).toBe(-1);
  });
  it('形態変化：HP が へると すがたが かわり、回復して 特技が かわる。形態ごとの ルールに きりかわる', () => {
    let s = createBattle('boss', party(), [boss('noctil', { speciesId: 'm199', level: 40 })], 'attack');
    s.enemies[0].hp = Math.floor(s.enemies[0].maxHp * 0.45);
    const r = resolveTurn(s, wait, createRng(1));
    s = r.state;
    expect(r.events.some((e) => e.t === 'phase')).toBe(true);
    expect(s.enemies[0].name).toBe('すべてを統べる者');
    expect(s.enemies[0].scriptState!.phase).toBe(1);
    expect(s.enemies[0].skills).toContain('starfall');
    expect(s.enemies[0].hp).toBeGreaterThan(s.enemies[0].maxHp * 0.5);
    // 第2形態では 属性が かわる
    s = run(s, 2, wait, 5).s;
    expect(Object.values(s.enemies[0].resist).some((v) => v === 2)).toBe(true);
    // 第3形態
    s.enemies[0].hp = Math.floor(s.enemies[0].maxHp * 0.4);
    s = run(s, 1, wait, 30).s;
    expect(s.enemies[0].scriptState!.phase).toBe(2);
    expect(s.enemies[0].name).toBe('静寂の世界');
  });
  it('強化解除：みかたの 強化が きえる', () => {
    let s = createBattle('boss', party(), [boss('zelva', { speciesId: 'm191', level: 30 })], 'attack');
    s.allies[0].stages.attack = 2;
    s.allies[1].stages.defense = 1;
    s = resolveTurn(s, wait, createRng(1)).state;
    s.allies[0].stages.attack = 2;
    s = resolveTurn(s, wait, createRng(2)).state;
    expect(s.allies[0].stages.attack).toBe(0);
  });
  it('台本の ある ボス戦も 最後まで すすむ（どの 台本でも エラーなし）', () => {
    for (const sc of BOSS_SCRIPT_LIST) {
      const s = createBattle('boss', party(35), [boss(sc.id, { speciesId: 'm176', level: 20, hpScale: 3 })], 'attack');
      const r = run(s, 80, { mode: 'auto', player: { kind: 'none' } });
      expect(r.s.outcome, sc.id).not.toBeNull();
    }
  });
});

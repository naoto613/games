// 進行シミュレーション: 寄り道なしの 進み方で レベルの 伸びと 章ボスの 手ごたえを 見る
import { expect, it } from 'vitest';
import { createRng } from '../../src/core/Random';
import { createBattle, resolveTurn, battleRewards, expForMember } from '../../src/domain/battle/BattleEngine';
import { rollEncounter } from '../../src/domain/dungeon/DungeonEngine';
import { createMonster } from '../../src/domain/monster/MonsterFactory';
import { gainExperience } from '../../src/domain/monster/Growth';
import { BOSSES } from '../../src/data/areas';
import type { MonsterInstance } from '../../src/domain/monster/types';

function fight(party: MonsterInstance[], enemies: any[], rng: any, kind: any = 'wild') {
  let s = createBattle(kind, party, enemies, 'attack');
  while (!s.outcome && s.turn < 60) s = resolveTurn(s, { mode: 'auto', player: { kind: 'none' } }, rng).state;
  const out = party.map((m, i) => ({ ...m, hp: s.allies[i].hp, mp: s.allies[i].mp }));
  if (s.outcome !== 'win') return { party: out, win: false, turns: s.turn };
  const r = battleRewards(s);
  const alive = s.allies.filter((c) => c.hp > 0).length;
  return { party: out.map((m, i) => (s.allies[i].hp > 0 ? gainExperience(m, expForMember(r, m.level), rng).monster : m)), win: true, turns: s.turn, alive };
}
const heal = (p: MonsterInstance[]) => p.map((m) => ({ ...m, hp: m.stats.hp, mp: m.stats.mp }));

// 第1章を 寄り道なしで：各階 8戦（あいだは 回復）、仲間は 出会える 種族を じゅんに くわえる
function run(seed: number, verbose: boolean) {
  const rng = createRng(seed);
  let party: MonsterInstance[] = [createMonster('m001', rng, { level: 3, sex: 'B' })];
  const log = (t: string) => verbose && console.log(t, party.map((m) => `${m.speciesId}${m.level} a${m.stats.attack} d${m.stats.defense} h${m.stats.hp}`).join(' | '));
  let battles = 0;
  const floor = (fl: string) => { for (let i = 0; i < 8; i++) { const r = fight(party, rollEncounter(fl, rng), rng); party = heal(r.party); battles++; } log(fl); };
  floor('komorebi1');
  party.push(createMonster('m041', rng, { level: 2, sex: 'A' })); // 1F で モスラットが なかまに
  floor('komorebi2');
  party.push(createMonster('m023', rng, { level: 3, sex: 'A' })); // 2F で バークボア
  floor('komorebi3');
  party[1] = createMonster('m043', rng, { level: 3, sex: 'B' }); // 石碑の グリーンスプライト（なかま化の 練習）
  floor('sasayaki1');
  party[1] = createMonster('m042', rng, { level: 5, sex: 'A' }); // 森で リーフアント
  for (const fl of ['sasayaki2', 'sasayaki3', 'sasayaki4']) floor(fl);
  const b1 = fight(heal(party), BOSSES.morg.enemies, rng, 'boss');
  const lv1 = party.map((m) => m.level).join('/');
  // 第2章：水音の洞穴（クラブリン・アクアバットが なかまに）→ 泡守りの騎士 → 深淵の水路（アビスイール）→ ウロコ王
  floor('mizuoto1');
  party[2] = createMonster('m101', rng, { level: 8, sex: 'A' });
  floor('mizuoto2');
  party[1] = createMonster('m104', rng, { level: 9, sex: 'B' });
  floor('mizuoto3');
  const b2 = fight(heal(party), BOSSES.bubbleknight.enemies, rng, 'boss');
  for (const fl of ['shinen1', 'shinen2', 'shinen3']) floor(fl);
  floor('shinen4');
  party[1] = createMonster('m105', rng, { level: 12, sex: 'B' });
  floor('shinen5');
  const b3 = fight(heal(party), BOSSES.uroko.enemies, rng, 'boss');
  return { b1, b2, b3, lv: lv1, lv2: party.map((m) => m.level).join('/'), battles };
}
it('progression（第1章）', () => {
  run(5, false);
  const rs = Array.from({ length: 30 }, (_, i) => run(100 + i, false));
  const pct = (f: (r: any) => boolean) => Math.round((rs.filter(f).length / rs.length) * 100);
  const avg = (f: (r: any) => number) => (rs.reduce((a, r) => a + f(r), 0) / rs.length).toFixed(1);
  // 目標：章ボス 50〜90%（計画書 1-11）。レベルは 第1章の 想定 Lv1〜10（Q15）
  expect(pct((r) => r.b1.win)).toBeGreaterThanOrEqual(50);
  expect(pct((r) => r.b1.win)).toBeLessThanOrEqual(92);
  const maxLv = Math.max(...rs.flatMap((r) => r.lv.split('/').map(Number)));
  expect(maxLv).toBeLessThanOrEqual(12);
  console.log(`（第1章を 寄り道なしで）モルグ 勝率 ${pct((r) => r.b1.win)}% ${avg((r) => r.b1.turns)}ターン  レベル 例: ${rs[0].lv}`);
});
it('progression（第2章）', () => {
  const rs = Array.from({ length: 30 }, (_, i) => run(300 + i, false));
  const pct = (f: (r: any) => boolean) => Math.round((rs.filter(f).length / rs.length) * 100);
  const avg = (f: (r: any) => number) => (rs.reduce((a, r) => a + f(r), 0) / rs.length).toFixed(1);
  console.log(`（第2章を 寄り道なしで）泡守りの騎士 ${pct((r) => r.b2.win)}% ${avg((r) => r.b2.turns)}ターン ／ ウロコ王 ${pct((r) => r.b3.win)}% ${avg((r) => r.b3.turns)}ターン  レベル 例: ${rs[0].lv2}（${rs[0].battles}戦）`);
  // 目標：中ボス 55〜95%・章ボス 50〜90%。レベルは 第2章の 想定 Lv8〜16（Q15）
  expect(pct((r) => r.b2.win)).toBeGreaterThanOrEqual(55);
  expect(pct((r) => r.b2.win)).toBeLessThanOrEqual(95);
  expect(pct((r) => r.b3.win)).toBeGreaterThanOrEqual(50);
  expect(pct((r) => r.b3.win)).toBeLessThanOrEqual(92);
  const maxLv = Math.max(...rs.flatMap((r) => r.lv2.split('/').map(Number)));
  expect(maxLv).toBeLessThanOrEqual(18);
});

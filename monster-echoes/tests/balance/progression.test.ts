// 進行シミュレーション: 各フロア8戦・森のあとで1回配合、という寄り道なしの進み方で
// レベルの伸びとボスの手ごたえを見る（フィードバック「配合して育てると余裕すぎる」の再発防止）
import { expect, it } from 'vitest';
import { createRng } from '../../src/core/Random';
import { createBattle, resolveTurn, battleRewards, expForMember } from '../../src/domain/battle/BattleEngine';
import { rollEncounter } from '../../src/domain/dungeon/DungeonEngine';
import { createMonster } from '../../src/domain/monster/MonsterFactory';
import { gainExperience } from '../../src/domain/monster/Growth';
import { executeBreeding, previewBreeding } from '../../src/domain/breeding/BreedingEngine';
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

function run(seed: number, verbose: boolean) {
  const rng = createRng(seed);
  let party = [createMonster('lumipon', rng, { level: 3, sex: 'B' }), createMonster('kogemaru', rng, { level: 3, sex: 'A' }), createMonster('mossglow', rng, { level: 3, sex: 'A' })];
  const log = (t: string) => verbose && console.log(t, party.map((m) => `${m.speciesId}${m.level}+${m.plusValue} a${m.stats.attack} d${m.stats.defense} h${m.stats.hp}`).join(' | '));
  let battles = 0;
  for (const fl of ['forest1', 'forest2', 'forest3']) { for (let i = 0; i < 8; i++) { const r = fight(party, rollEncounter(fl, rng), rng); party = heal(r.party); battles++; } log(fl); }
  const b1 = fight(heal(party), BOSSES.boss_forest.enemies, rng, 'boss'); const lv1 = party.map((m) => m.level).join('/');
  // 配合: lumipon × kogemaru → tsukipon（まだLv10未満ならレベル上げ）
  while (party[0].level < 10 || party[1].level < 10) { const r = fight(party, rollEncounter('forest3', rng), rng); party = heal(r.party); battles++; }
  log('before breed (battles ' + battles + ')');
  const w = { monsters: party, partyIds: party.map((m) => m.id), capacity: 20, flags: {} };
  const pv = previewBreeding(party[0], party[1]);
  const br = executeBreeding(w, party[0].id, party[1].id, pv.skills.recommended, rng);
  if (!br.ok) throw new Error(br.error);
  party = br.value.world.partyIds.map((id) => br.value.world.monsters.find((m) => m.id === id)!);
  party.push(createMonster('kogemaru', rng, { level: 8 }));
  log('after breed');
  let b = 0;
  for (const fl of ['cave1', 'cave2', 'cave3']) { let turns = 0, wins = 0; for (let i = 0; i < 8; i++) { const r = fight(party, rollEncounter(fl, rng), rng); turns += r.turns; wins += r.win ? 1 : 0; party = heal(r.party); b++; } log(`${fl} win${wins}/8 turns${(turns / 8).toFixed(1)}`); }
  const b2 = fight(heal(party), BOSSES.boss_cave.enemies, rng, 'boss');
  return { b1, b2, lv1, lv2: party.map((m) => m.level).join('/'), battles };
}
it('progression', () => {
  run(5, false);
  const rs = Array.from({ length: 30 }, (_, i) => run(100 + i, false));
  const pct = (f: (r: any) => boolean) => Math.round((rs.filter(f).length / rs.length) * 100);
  const avg = (f: (r: any) => number) => (rs.reduce((a, r) => a + f(r), 0) / rs.length).toFixed(1);
  expect(pct((r) => r.b1.win)).toBeGreaterThanOrEqual(50);
  expect(pct((r) => r.b1.win)).toBeLessThanOrEqual(95);
  expect(pct((r) => r.b2.win)).toBeGreaterThanOrEqual(15);
  expect(pct((r) => r.b2.win)).toBeLessThanOrEqual(65);
  console.log(`（寄り道なしで進んだ場合）boss1 勝率 ${pct((r) => r.b1.win)}% ${avg((r) => r.b1.turns)}ターン / boss2 勝率 ${pct((r) => r.b2.win)}% ${avg((r) => r.b2.turns)}ターン  例: ${rs[0].lv1} → ${rs[0].lv2}`);
});

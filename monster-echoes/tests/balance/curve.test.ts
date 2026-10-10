// バランステスト: 想定レベルのパーティで各フロアの連戦・ボス・闘技場に勝てるかをシミュレーションする。
// npm run sim で表を表示する。数値は「おおむねこの範囲」に入っていることだけを確認する。
import { describe, expect, it } from 'vitest';
import { createRng, type Rng } from '../../src/core/Random';
import { BOSSES, ARENA_RANKS } from '../../src/data/areas';
import type { EnemySpec, Tactic } from '../../src/data/types';
import { createBattle, resolveTurn } from '../../src/domain/battle/BattleEngine';
import { rollEncounter } from '../../src/domain/dungeon/DungeonEngine';
import { createMonster } from '../../src/domain/monster/MonsterFactory';
import type { MonsterInstance } from '../../src/domain/monster/types';
import type { BattleState } from '../../src/domain/battle/types';

type P = [string, number, number?][]; // species, level, plus
const mkParty = (p: P, rng: Rng) => p.map(([id, lv, plus]) => createMonster(id, rng, { level: lv, plusValue: plus ?? 0 }));

function run(party: MonsterInstance[], enemies: EnemySpec[], kind: 'wild' | 'boss' | 'arena', rng: Rng, tactic: Tactic = 'attack', enemyTactic?: Tactic) {
  let s: BattleState = createBattle(kind, party, enemies, tactic);
  if (enemyTactic) s.enemyTactic = enemyTactic;
  while (!s.outcome && s.turn < 60) s = resolveTurn(s, { mode: 'auto', player: { kind: 'none' } }, rng).state;
  return s;
}
const sync = (party: MonsterInstance[], s: BattleState) => party.map((m, i) => ({ ...m, hp: s.allies[i].hp, mp: s.allies[i].mp }));

/** フロアで n 連戦（あいだに やくそうで回復、最大 herbs 個） */
function gauntlet(p: P, table: string, n: number, herbs: number, rng: Rng) {
  let party = mkParty(p, rng);
  let turns = 0;
  for (let i = 0; i < n; i++) {
    const s = run(party, rollEncounter(table, rng), 'wild', rng);
    turns += s.turn;
    if (s.outcome !== 'win') return { ok: false, fights: i, turns: turns / (i + 1) };
    party = sync(party, s);
    for (const m of party) while (herbs > 0 && m.hp > 0 && m.hp < m.stats.hp * 0.5) { m.hp = Math.min(m.stats.hp, m.hp + 35); herbs--; }
  }
  return { ok: true, fights: n, turns: turns / n };
}

const N = 200;
function rate(f: (rng: Rng) => boolean, seed: number) {
  const rng = createRng(seed);
  let w = 0;
  for (let i = 0; i < N; i++) if (f(rng)) w++;
  return w / N;
}

const report: string[] = [];
const STAGES: { name: string; party: P; table?: string; boss?: string; arena?: string; expect: [number, number] }[] = [
  { name: 'もり1F 6連戦', party: [['lunaslime', 3], ['magmadog', 3]], table: 'forest1', expect: [0.85, 1] },
  { name: 'もり2F 6連戦', party: [['lunaslime', 5], ['magmadog', 5], ['leafant', 4]], table: 'forest2', expect: [0.7, 1] },
  { name: 'もり3F 6連戦', party: [['lunaslime', 7], ['magmadog', 7], ['leafant', 6]], table: 'forest3', expect: [0.45, 1] },
  { name: 'ボス: ゆがみキノコボーグ', party: [['lunaslime', 9], ['magmadog', 9], ['leafant', 8]], boss: 'boss_forest', expect: [0.5, 0.95] },
  { name: '闘技場F', party: [['windcat', 9, 1], ['magmadog', 11], ['leafant', 10]], arena: 'arenaF', expect: [0.4, 0.97] },
  { name: 'どうくつB1 6連戦', party: [['windcat', 10, 1], ['magmadog', 11], ['leafant', 10]], table: 'cave1', expect: [0.6, 1] },
  { name: 'どうくつB3 6連戦', party: [['windcat', 13, 1], ['lightningleo', 12, 1], ['stonegolem', 12]], table: 'cave3', expect: [0.3, 1] },
  { name: 'ボス: ゆがみアイスクリル', party: [['windcat', 15, 1], ['lightningleo', 15, 1], ['stonegolem', 14]], boss: 'boss_cave', expect: [0.12, 0.7] },
  { name: '闘技場E', party: [['windcat', 16, 1], ['lightningleo', 16, 1], ['stonegolem', 15]], arena: 'arenaE', expect: [0.3, 0.95] },
  { name: 'こうげん ふもと 6連戦', party: [['firedragon', 14, 1], ['lightningleo', 16, 1], ['icekrill', 16]], table: 'highland1', expect: [0.5, 1] },
  { name: 'ボス: ゆがみファイアドラゴン', party: [['firedragon', 19, 1], ['lightningleo', 20, 1], ['icekrill', 19]], boss: 'boss_highland', expect: [0.3, 0.97] },
  { name: 'ルナフィアたいかい', party: [['darkdragon', 22, 2], ['metalspirit', 21, 2], ['greensprite', 22, 2]], arena: 'arenaD', expect: [0.25, 0.95] },
  { name: '(参考)配合なし R1 Lv20 でルナフィアたいかい', party: [['lunaslime', 20], ['magmadog', 20], ['stonegolem', 20]], arena: 'arenaD', expect: [0, 0.4] },
];


describe('難易度曲線', () => {
  for (const [i, st] of STAGES.entries()) {
    it(st.name, () => {
      let turnsSum = 0, turnsN = 0;
      const r = rate((rng) => {
        if (st.table) {
          const g = gauntlet(st.party, st.table, 6, 6, rng);
          turnsSum += g.turns; turnsN++;
          return g.ok;
        }
        if (st.boss) {
          const s = run(mkParty(st.party, rng), BOSSES[st.boss].enemies, 'boss', rng);
          turnsSum += s.turn; turnsN++;
          return s.outcome === 'win';
        }
        const rank = ARENA_RANKS.find((x) => x.id === st.arena)!;
        let party = mkParty(st.party, rng);
        for (const b of rank.battles) {
          const s = run(party, b.enemies, 'arena', rng, 'attack', b.tactic);
          turnsSum += s.turn; turnsN++;
          if (s.outcome !== 'win') return false;
          party = sync(party, s).map((m) =>
            rank.betweenBattleRecovery === 'full' ? { ...m, hp: m.stats.hp, mp: m.stats.mp }
            : rank.betweenBattleRecovery === 'partial' ? { ...m, hp: Math.max(m.hp, Math.ceil(m.stats.hp * 0.4)), mp: Math.max(m.mp, Math.ceil(m.stats.mp * 0.3)) } : m);
        }
        return true;
      }, 1000 + i);
      report.push(`${st.name.padEnd(28, '　')} 勝率 ${(r * 100).toFixed(0).padStart(3)}%  平均ターン ${(turnsSum / Math.max(1, turnsN)).toFixed(1)}`);
      expect(r).toBeGreaterThanOrEqual(st.expect[0]);
      expect(r).toBeLessThanOrEqual(st.expect[1]);
    });
  }
  it('レポート', () => console.log('\n' + report.join('\n')));
});

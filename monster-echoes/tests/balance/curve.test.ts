// バランステスト: 想定レベルのパーティで各フロアの連戦・ボス・闘技場に勝てるかをシミュレーションする。
// npm run sim で表を表示する。数値は「おおむねこの範囲」に入っていることだけを確認する。
import { describe, expect, it } from 'vitest';
import { createRng, type Rng } from '../../src/core/Random';
import { BOSSES } from '../../src/data/areas';
import type { EnemySpec, Tactic } from '../../src/data/types';
import { createBattle, resolveTurn } from '../../src/domain/battle/BattleEngine';
import { rollEncounter } from '../../src/domain/dungeon/DungeonEngine';
import { createMonster } from '../../src/domain/monster/MonsterFactory';
import type { MonsterInstance } from '../../src/domain/monster/types';
import type { BattleState } from '../../src/domain/battle/types';

type P = [string, number, number?][]; // species, level, plus
const mkParty = (p: P, rng: Rng) => p.map(([id, lv, plus]) => createMonster(id, rng, { level: lv, plusValue: plus ?? 0 }));

function run(party: MonsterInstance[], enemies: EnemySpec[], kind: 'wild' | 'boss', rng: Rng, tactic: Tactic = 'attack', enemyTactic?: Tactic) {
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
// 第1章（仕様 6・Q15：Lv1〜10）。目標：通常フロア連戦 60〜100%、章ボス 50〜90%（計画書 §9・1-11）
// パーティは 第1章で なかまに できる 種族から（1F モスラット → 2F バークボア → 3F ブロンズスライム／グリーンスプライト → 森 リーフアント）
const STAGES: { name: string; party: P; table?: string; boss?: string; expect: [number, number] }[] = [
  { name: '木漏れ日の小道 1F 6連戦（ルナスライムだけ）', party: [['m001', 3]], table: 'komorebi1', expect: [0.75, 1] },
  { name: '木漏れ日の小道 2F 6連戦', party: [['m001', 4], ['m041', 3]], table: 'komorebi2', expect: [0.65, 1] },
  { name: '木漏れ日の小道 3F 6連戦', party: [['m001', 5], ['m041', 4], ['m023', 4]], table: 'komorebi3', expect: [0.6, 1] },
  { name: 'ささやきの森 1F 6連戦', party: [['m001', 6], ['m023', 5], ['m013', 5]], table: 'sasayaki1', expect: [0.6, 1] },
  { name: 'ささやきの森 2F 6連戦', party: [['m001', 7], ['m023', 6], ['m042', 6]], table: 'sasayaki2', expect: [0.55, 1] },
  { name: 'ささやきの森 3F 6連戦', party: [['m001', 7], ['m042', 7], ['m023', 7]], table: 'sasayaki3', expect: [0.5, 1] },
  { name: 'ささやきの森 4F 6連戦', party: [['m001', 8], ['m042', 8], ['m023', 8]], table: 'sasayaki4', expect: [0.45, 1] },
  { name: 'ボス: キノコ王モルグ', party: [['m001', 9], ['m042', 9], ['m023', 9]], boss: 'morg', expect: [0.5, 0.9] },
  { name: '(参考) ボス: モルグを Lv6 で', party: [['m001', 6], ['m041', 6], ['m043', 6]], boss: 'morg', expect: [0, 0.5] },
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
        return false;
      }, 1000 + i);
      report.push(`${st.name.padEnd(30, '　')} 勝率 ${(r * 100).toFixed(0).padStart(3)}%  平均ターン ${(turnsSum / Math.max(1, turnsN)).toFixed(1)}`);
      expect(r).toBeGreaterThanOrEqual(st.expect[0]);
      expect(r).toBeLessThanOrEqual(st.expect[1]);
    });
  }
  it('レポート', () => console.log('\n' + report.join('\n')));
});

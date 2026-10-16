// 1レベルあたりの 強さの 差が 大きすぎないか（「レベルが 少し あがったら 敵が ぜんぶ 一撃」に ならない）
import { describe, expect, it } from 'vitest';
import { BALANCE } from '../../src/data/balance';
import { getSpecies } from '../../src/data/monsters';
import { averageStatsAtLevel } from '../../src/domain/monster/Growth';

// 第1章で であう 種族
const IDS = ['m001', 'm002', 'm041', 'm023', 'm043', 'm013', 'm063', 'm081', 'm042', 'm061', 'm121', 'm085', 'm044'];
const B = BALANCE.battle;
const hitDamage = (atk: number, def: number) => Math.max(1, atk * B.attackScale - def * B.defenseScale);

describe('レベル差と 強さ', () => {
  it('Lv1→2 の 能力の 伸びは 2割 以下（攻撃・HP）', () => {
    for (const id of IDS) {
      const sp = getSpecies(id);
      const a = averageStatsAtLevel(sp, 1), b = averageStatsAtLevel(sp, 2);
      expect((b.attack - a.attack) / a.attack, `${id} 攻撃`).toBeLessThanOrEqual(0.2);
      expect((b.hp - a.hp) / a.hp, `${id} HP`).toBeLessThanOrEqual(0.2);
    }
  });
  it('3レベル 上の なかまでも、ふつうの こうげき 1回では たおせない（平均的な 組みあわせで HP の 4割 いか、いちばん 強い 組みあわせでも 8割 いか）', () => {
    const rs: number[] = [];
    let worst = '';
    for (const L of [1, 3, 5, 7]) for (const a of IDS) for (const d of IDS) {
      const sa = averageStatsAtLevel(getSpecies(a), L + 3), sd = averageStatsAtLevel(getSpecies(d), L);
      const r = hitDamage(sa.attack, sd.defense) / sd.hp;
      if (r > Math.max(0, ...rs)) worst = `${a} Lv${L + 3} → ${d} Lv${L}`;
      rs.push(r);
    }
    rs.sort((x, y) => x - y);
    const med = rs[Math.floor(rs.length / 2)], max = rs[rs.length - 1];
    console.log(`3レベル差の 1撃: 中央値 HP の ${(med * 100).toFixed(0)}% ／ 最大 ${(max * 100).toFixed(0)}%（${worst}）`);
    expect(med).toBeLessThanOrEqual(0.4);
    expect(max).toBeLessThanOrEqual(0.8);
  });
});

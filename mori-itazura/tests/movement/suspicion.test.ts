import { describe, it, expect } from 'vitest';
import { canSee, suspicionRate, levelOf } from '../../src/game/systems/SuspicionSystem';
import { disguiseModifier } from '../../src/game/content/characters/npcs';

const base = { npcX: 0, npcZ: 0, facing: 0, eyeH: 1.4, range: 10, fov: 120, px: 0, pz: 5, pH: 0.4, hidden: false, underTable: false, sneaking: false, night: 0, chasing: false };
const clear = () => true;

describe('視界', () => {
  it('正面の近くは見える・背後は見えない', () => {
    expect(canSee(base, clear).seen).toBe(true);
    expect(canSee({ ...base, pz: -5 }, clear).seen).toBe(false);
  });
  it('遠すぎると見えない。しのびあしで見える距離が縮む', () => {
    expect(canSee({ ...base, pz: 9 }, clear).seen).toBe(true);
    expect(canSee({ ...base, pz: 9, sneaking: true }, clear).seen).toBe(false);
  });
  it('茂みに隠れていると見えない', () => {
    expect(canSee({ ...base, hidden: true }, clear).seen).toBe(false);
  });
  it('遮蔽物があれば見えない', () => {
    expect(canSee(base, () => false).seen).toBe(false);
  });
});

describe('警戒度', () => {
  const r = { baseRate: 40, d: 3, range: 10, running: false, sneaking: false, recentTheft: false, nearOwnedFood: false, disguiseMod: 1 };
  it('段階の区切り（設計書 8.4）', () => {
    expect(levelOf(10)).toBe('normal');
    expect(levelOf(20)).toBe('odd');
    expect(levelOf(55)).toBe('alert');
    expect(levelOf(80)).toBe('chase');
  });
  it('変装で上がりにくく、盗むと変装していても上がる', () => {
    const plain = suspicionRate(r);
    const dis = suspicionRate({ ...r, disguiseMod: disguiseModifier('camper_outfit', 'family') });
    const theft = suspicionRate({ ...r, disguiseMod: disguiseModifier('camper_outfit', 'family'), recentTheft: true });
    expect(dis).toBeLessThan(plain * 0.3);
    expect(theft).toBeGreaterThan(plain);
  });
  it('レンジャーぼうしは本人には逆効果', () => {
    expect(disguiseModifier('ranger_hat', 'ranger')).toBeGreaterThan(1);
  });
});

import { describe, it, expect } from 'vitest';
import { FishingSystem } from '../../src/game/systems/FishingSystem';
import { ITEM_LIST, ITEMS } from '../../src/game/content/items/items';
import { SHOP } from '../../src/game/content/items/shop';
import { QUESTS } from '../../src/game/content/quests/quests';
import { DIALOGUE } from '../../src/game/content/dialogue/dialogue';

describe('データの整合性', () => {
  it('ショップ・クエスト・会話が参照するアイテムが存在する', () => {
    for (const s of SHOP) if (s.kind === 'item') expect(ITEMS[s.id], s.id).toBeTruthy();
    for (const q of QUESTS) for (const r of q.rewards) if ('item' in r) expect(ITEMS[r.item], r.item).toBeTruthy();
    for (const it of ITEM_LIST) if (it.cook) expect(ITEMS[it.cook]).toBeTruthy();
  });
  it('会話の行き先ノードがすべて存在する', () => {
    for (const [id, d] of Object.entries(DIALOGUE)) {
      for (const e of d.entries) expect(d.nodes[e.node], `${id}:${e.node}`).toBeTruthy();
      for (const n of Object.values(d.nodes)) {
        if (n.next) expect(d.nodes[n.next], `${id}->${n.next}`).toBeTruthy();
        for (const c of n.choices ?? []) if (c.next) expect(d.nodes[c.next], `${id}->${c.next}`).toBeTruthy();
      }
    }
  });
});

describe('つり', () => {
  it('うきが沈んだときにタップ → れんだで釣れる', () => {
    const f = new FishingSystem();
    let got: string | null = null;
    f.onCatch = (c) => { got = c; };
    f.start();
    for (let i = 0; i < 200 && f.phase !== 'bite'; i++) f.update(0.05);
    expect(f.phase).toBe('bite');
    f.tap();
    expect(f.phase).toBe('reel');
    for (let i = 0; i < 6; i++) f.tap();
    f.update(0.05);
    expect(got).not.toBeNull();
  });
});

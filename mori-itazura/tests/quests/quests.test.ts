import { describe, it, expect } from 'vitest';
import { EventBus } from '../../src/game/core/EventBus';
import { GameState } from '../../src/game/core/GameState';
import { InventorySystem } from '../../src/game/systems/InventorySystem';
import { EconomySystem } from '../../src/game/systems/EconomySystem';
import { QuestSystem } from '../../src/game/systems/QuestSystem';
import { DialogueSystem } from '../../src/game/systems/DialogueSystem';
import { QUESTS } from '../../src/game/content/quests/quests';

function setup() {
  const bus = new EventBus();
  const state = new GameState();
  const inv = new InventorySystem(state, bus);
  const eco = new EconomySystem(state, bus, inv);
  const ach: string[] = [];
  let quests!: QuestSystem;
  const ctx = () => ({ state, itemCount: (id: string) => inv.count(id), questStatus: (id: string) => quests.status(id), isDisguised: () => state.player.outfitId !== 'none' });
  quests = new QuestSystem(state, bus, QUESTS, ctx, {
    addItem: (id, n, s) => inv.add(id, n, s), removeItem: (id, n) => inv.remove(id, n), addMoney: (n) => eco.add(n), achieve: (id) => ach.push(id),
  });
  quests.evaluate();
  return { bus, state, inv, eco, quests, ach, ctx };
}

describe('インベントリと経済', () => {
  it('上限まで重ねて持てる・売ると減ってお金が増える', () => {
    const { inv, eco } = setup();
    expect(inv.add('apple', 25)).toBe(20);
    expect(eco.sell('apple').ok).toBe(true);
    expect(inv.count('apple')).toBe(19);
    expect(eco.money).toBe(3);
  });
  it('お金が足りないと買えない', () => {
    const { eco, inv } = setup();
    expect(eco.buy('fishing_rod').ok).toBe(false);
    eco.add(50);
    expect(eco.buy('fishing_rod').ok).toBe(true);
    expect(inv.has('fishing_rod')).toBe(true);
    expect(eco.buy('fishing_rod').ok).toBe(false); // もう持っている
    expect(eco.money).toBe(20);
  });
});

describe('クエスト', () => {
  it('お昼ごはん大作戦 → へんそう → かいもの と順に進む', () => {
    const { bus, inv, quests, state, eco, ach } = setup();
    expect(quests.status('lunch_heist')).toBe('Active');
    inv.add('cookie', 1, 'ground');
    expect(quests.step('lunch_heist')).toBe(0); // バスケット以外では進まない
    inv.add('sandwich', 1, 'basket');
    expect(quests.step('lunch_heist')).toBe(1);
    bus.emit('item:used', { itemId: 'sandwich', action: 'eat' });
    expect(quests.status('lunch_heist')).toBe('Completed');
    expect(quests.status('disguise')).toBe('Active');
    inv.add('camper_outfit', 1, 'laundry');
    state.player.outfitId = 'camper_outfit';
    bus.emit('outfit:changed', { outfitId: 'camper_outfit' });
    expect(quests.status('disguise')).toBe('Completed');
    expect(quests.status('first_shopping')).toBe('Active');
    eco.buy('marshmallow');
    expect(quests.status('first_shopping')).toBe('Completed');
    expect(ach).toContain('first_heist');
    expect(state.player.currency).toBe(5 + 10 - 5);
  });
  it('依頼を受けるクエストは会話で始まり、繰り返せる', () => {
    const { bus, inv, quests, state } = setup();
    state.progress.completedQuestIds.push('lunch_heist', 'disguise');
    expect(quests.status('trash_job')).toBe('Available');
    quests.start('trash_job');
    inv.add('litter', 5);
    expect(quests.step('trash_job')).toBe(1);
    bus.emit('item:given', { itemId: 'litter', npcId: 'ranger' });
    expect(inv.count('litter')).toBe(0);
    expect(state.player.currency).toBe(30);
    expect(quests.status('trash_job')).toBe('Available');
  });
});

describe('会話', () => {
  it('条件で入り口が変わり、選択肢の効果が実行される', () => {
    const { state, quests, inv, ctx } = setup();
    const effects: unknown[] = [];
    const d = new DialogueSystem(ctx, { effect: (e) => { effects.push(e); if ('startQuest' in e) quests.start(e.startQuest); }, close: () => {} });
    d.open('kid');
    expect(d.node?.text).toContain('どうぶつさん');
    d.choose(-1);
    d.choose(0);
    expect(quests.status('lost_teddy')).toBe('Active');
    d.close();
    inv.add('teddy_bear');
    d.open('kid');
    expect(d.choices().map((c) => c.text)).toContain('ぬいぐるみを かえす');
    void state;
  });
});

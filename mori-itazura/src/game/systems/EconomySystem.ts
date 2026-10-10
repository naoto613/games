// お金の出入り（購入・売却・報酬）
import type { GameState } from '../core/GameState';
import type { EventBus } from '../core/EventBus';
import type { InventorySystem } from './InventorySystem';
import { ITEMS } from '../content/items/items';
import { SHOP, ShopEntry } from '../content/items/shop';

export interface TradeResult { ok: boolean; reason?: string }

export class EconomySystem {
  constructor(private state: GameState, private bus: EventBus, private inv: InventorySystem) {}

  get money() { return this.state.player.currency; }

  add(amount: number) {
    if (!amount) return;
    this.state.player.currency = Math.max(0, this.state.player.currency + amount);
    this.bus.emit('money:changed', { amount: this.state.player.currency, delta: amount });
  }

  canAfford(price: number) { return this.money >= price; }

  owns(entry: ShopEntry) {
    if (entry.kind === 'upgrade') return this.state.flag('home_' + entry.id);
    const def = ITEMS[entry.id];
    return !!def && !def.stackable && this.inv.has(entry.id);
  }

  buy(entryId: string): TradeResult {
    const entry = SHOP.find((e) => e.id === entryId);
    if (!entry) return { ok: false, reason: 'うっていない' };
    if (this.owns(entry)) return { ok: false, reason: 'もう もっている' };
    if (!this.canAfford(entry.price)) return { ok: false, reason: 'おかねが たりない' };
    if (entry.kind === 'item') {
      const added = this.inv.add(entry.id, 1, 'shop');
      if (!added) return { ok: false, reason: 'もちきれない' };
    } else {
      this.state.setFlag('home_' + entry.id);
    }
    this.add(-entry.price);
    this.bus.emit('shop:bought', { itemId: entry.id, price: entry.price });
    return { ok: true };
  }

  sell(itemId: string, n = 1): TradeResult {
    const def = ITEMS[itemId];
    if (!def || def.sellPrice <= 0 || def.category === 'quest') return { ok: false, reason: 'うれない' };
    if (!this.inv.has(itemId, n)) return { ok: false, reason: 'もっていない' };
    if (this.state.player.outfitId === itemId) return { ok: false, reason: 'きているものは うれない' };
    this.inv.remove(itemId, n, 'sold');
    this.add(def.sellPrice * n);
    this.bus.emit('shop:sold', { itemId, price: def.sellPrice * n });
    return { ok: true };
  }
}

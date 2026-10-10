// 持ち物の管理。追加・削除・個数の上限・図鑑（発見済み）を扱う
import type { GameState, InventoryEntry } from '../core/GameState';
import type { EventBus } from '../core/EventBus';
import { ITEMS, ItemCategory } from '../content/items/items';

export class InventorySystem {
  constructor(private state: GameState, private bus: EventBus) {}

  get entries(): InventoryEntry[] { return this.state.player.inventory; }

  count(itemId: string) {
    return this.entries.find((e) => e.itemId === itemId)?.count ?? 0;
  }
  has(itemId: string, n = 1) { return this.count(itemId) >= n; }

  /** 追加できた個数を返す */
  add(itemId: string, n = 1, source?: string): number {
    const def = ITEMS[itemId];
    if (!def || n <= 0) return 0;
    let e = this.entries.find((x) => x.itemId === itemId);
    const max = def.stackable ? def.maxStack : 1;
    const cur = e?.count ?? 0;
    const add = Math.max(0, Math.min(n, max - cur));
    if (add <= 0) {
      this.bus.emit('toast', { text: `${def.name}は これいじょう もてない`, kind: 'warn' });
      return 0;
    }
    if (!e) { e = { itemId, count: 0 }; this.entries.push(e); }
    e.count += add;
    const disc = this.state.progress.discoveredItemIds;
    if (!disc.includes(itemId)) disc.push(itemId);
    this.bus.emit('item:obtained', { itemId, count: add, source });
    return add;
  }

  remove(itemId: string, n = 1, reason?: string): boolean {
    const e = this.entries.find((x) => x.itemId === itemId);
    if (!e || e.count < n) return false;
    e.count -= n;
    if (e.count <= 0) this.state.player.inventory = this.entries.filter((x) => x !== e);
    this.bus.emit('item:removed', { itemId, count: n, reason });
    return true;
  }

  byCategory(cat: ItemCategory) {
    return this.entries.filter((e) => ITEMS[e.itemId]?.category === cat);
  }

  /** つかまったときに失う食べ物を 1 つ選ぶ（いちばん多いもの） */
  pickPenalty(): string | null {
    const foods = this.byCategory('food').sort((a, b) => b.count - a.count);
    return foods[0]?.itemId ?? null;
  }
}

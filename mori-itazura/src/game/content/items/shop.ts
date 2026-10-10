// 売店の品ぞろえ
export interface ShopEntry { id: string; kind: 'item' | 'upgrade'; price: number; name?: string; description?: string }

export const SHOP: ShopEntry[] = [
  { id: 'marshmallow', kind: 'item', price: 5 },
  { id: 'onigiri', kind: 'item', price: 8 },
  { id: 'juice', kind: 'item', price: 4 },
  { id: 'fishing_rod', kind: 'item', price: 30 },
  { id: 'treasure_map', kind: 'item', price: 40 },
  { id: 'straw_hat', kind: 'item', price: 25 },
  { id: 'sunglasses', kind: 'item', price: 20 },
  { id: 'lantern', kind: 'upgrade', price: 30, name: 'おうちの ランタン', description: 'おうちの まえを あかるく てらす ランタン。' },
  { id: 'garland', kind: 'upgrade', price: 25, name: 'はたの かざり', description: 'おうちを いろとりどりの はたで かざろう。' },
  { id: 'bed', kind: 'upgrade', price: 60, name: 'ふかふかベッド', description: 'ねると おなかが すこし ふくれる…きが する。' },
];

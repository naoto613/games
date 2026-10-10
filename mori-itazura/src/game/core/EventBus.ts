// ゲーム内のできごとを各システムへ配る（インベントリ・クエスト・セーブ・UI など）
export interface GameEvents {
  'item:obtained': { itemId: string; count: number; source?: string };
  'item:removed': { itemId: string; count: number; reason?: string };
  'item:used': { itemId: string; action: string };
  'item:given': { itemId: string; npcId: string };
  'item:cooked': { from: string; to: string };
  'npc:talked': { npcId: string };
  'npc:spotted': { npcId: string };
  'npc:chase': { npcId: string };
  'player:caught': { npcId: string };
  'player:escaped': { npcId: string };
  'theft': { objectId: string; itemId: string; seenBy: string[] };
  'outfit:changed': { outfitId: string };
  'shop:bought': { itemId: string; price: number };
  'shop:sold': { itemId: string; price: number };
  'money:changed': { amount: number; delta: number };
  'flag:set': { flag: string };
  'quest:started': { questId: string };
  'quest:progress': { questId: string };
  'quest:completed': { questId: string };
  'achievement': { id: string };
  'fish:caught': { itemId: string };
  'toast': { text: string; icon?: string; kind?: 'info' | 'good' | 'warn' };
  'save': { reason: string };
}

type Handler<T> = (payload: T) => void;

export class EventBus {
  private handlers = new Map<keyof GameEvents, Set<Handler<any>>>();
  on<K extends keyof GameEvents>(type: K, h: Handler<GameEvents[K]>) {
    let s = this.handlers.get(type);
    if (!s) this.handlers.set(type, (s = new Set()));
    s.add(h);
    return () => s!.delete(h);
  }
  emit<K extends keyof GameEvents>(type: K, payload: GameEvents[K]) {
    const s = this.handlers.get(type);
    if (s) for (const h of [...s]) h(payload);
    const any = this.handlers.get('*' as keyof GameEvents);
    if (any) for (const h of [...any]) h({ type, payload });
  }
  onAny(h: (e: { type: keyof GameEvents; payload: unknown }) => void) {
    return this.on('*' as keyof GameEvents, h as Handler<any>);
  }
}

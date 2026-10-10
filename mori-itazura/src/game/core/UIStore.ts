// ゲームエンジン → React UI への状態の受け渡し（UI に必要な値だけを通知する）
export interface DialogueView { npcId: string; name: string; text: string; choices: string[]; mood?: string; portrait?: string }
export interface FishingView { phase: 'cast' | 'wait' | 'bite' | 'reel' | 'result'; message: string; taps?: number; result?: string }
export interface Toast { id: number; text: string; kind: 'info' | 'good' | 'warn'; icon?: string }

export interface UIState {
  screen: 'loading' | 'title' | 'game';
  loadingText: string;
  hasSave: boolean;
  money: number;
  hunger: number;
  timeLabel: string;
  night: number;
  place: string;
  quest: { title: string; text: string; progress?: string } | null;
  action: { label: string; type: string } | null;
  sneaking: boolean;
  hidden: boolean;
  inBoat: boolean;
  alert: number;
  chased: boolean;
  dialogue: DialogueView | null;
  shop: 'buy' | 'sell' | null;
  panel: 'inventory' | 'map' | 'menu' | 'quests' | null;
  toasts: Toast[];
  fishing: FishingView | null;
  banner: string | null;
  outfit: string;
  invVersion: number;
  quality: 'high' | 'medium' | 'low';
  hint: string | null;
  fps: number;
  saving: boolean;
}

export const initialUI: UIState = {
  screen: 'loading', loadingText: 'じゅんびちゅう…', hasSave: false, money: 0, hunger: 70, timeLabel: '', night: 0, place: '',
  quest: null, action: null, sneaking: false, hidden: false, inBoat: false, alert: 0, chased: false,
  dialogue: null, shop: null, panel: null, toasts: [], fishing: null, banner: null, outfit: 'none', invVersion: 0,
  quality: 'high', hint: null, fps: 60, saving: false,
};

export class UIStore {
  private s: UIState = { ...initialUI };
  private subs = new Set<() => void>();
  get = () => this.s;
  subscribe = (f: () => void) => { this.subs.add(f); return () => { this.subs.delete(f); }; };
  set(p: Partial<UIState>) {
    let changed = false;
    for (const k in p) {
      const key = k as keyof UIState;
      if (!shallowEq(this.s[key], p[key])) { changed = true; break; }
    }
    if (!changed) return;
    this.s = { ...this.s, ...p };
    for (const f of this.subs) f();
  }
}

function shallowEq(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (!a || !b || typeof a !== 'object' || typeof b !== 'object') return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const ka = Object.keys(a as object), kb = Object.keys(b as object);
  if (ka.length !== kb.length) return false;
  for (const k of ka) if ((a as Record<string, unknown>)[k] !== (b as Record<string, unknown>)[k]) return false;
  return true;
}

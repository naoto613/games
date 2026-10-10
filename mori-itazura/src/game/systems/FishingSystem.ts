// つりのミニゲーム：うきが しずんだ瞬間にタップ → れんだで ひきあげる
import type { FishingView } from '../core/UIStore';

export type Catch = 'fish' | 'big_fish' | 'old_boot' | 'old_coin';

export class FishingSystem {
  active = false;
  phase: FishingView['phase'] = 'cast';
  private t = 0;
  private wait = 0;
  taps = 0;
  result: Catch | null = null;
  message = '';
  onCatch: ((c: Catch) => void) | null = null;
  onMiss: (() => void) | null = null;
  bob = 0; // うきの沈み具合

  start() { this.active = true; this.set('cast', 'えいっ！'); }
  stop() { this.active = false; this.result = null; }

  private set(p: FishingView['phase'], msg: string) { this.phase = p; this.t = 0; this.message = msg; }

  update(dt: number) {
    if (!this.active) return;
    this.t += dt;
    switch (this.phase) {
      case 'cast':
        if (this.t > 0.9) { this.wait = 2 + Math.random() * 4.5; this.set('wait', 'うきを よく みて…'); }
        this.bob = 0;
        break;
      case 'wait':
        this.bob = Math.sin(this.t * 3) * 0.02 + (this.t > this.wait - 0.8 && Math.random() < 0.05 ? 0.04 : 0);
        if (this.t > this.wait) this.set('bite', 'いまだ！ タップ！');
        break;
      case 'bite':
        this.bob = 0.12;
        if (this.t > 0.95) { this.set('wait', 'にげられた… もういちど まとう'); this.wait = 2 + Math.random() * 3; this.onMiss?.(); }
        break;
      case 'reel':
        this.bob = 0.08 + Math.sin(this.t * 20) * 0.04;
        if (this.taps >= 6) {
          const r = Math.random();
          this.result = r < 0.62 ? 'fish' : r < 0.8 ? 'big_fish' : r < 0.93 ? 'old_boot' : 'old_coin';
          this.set('result', '');
          this.onCatch?.(this.result);
        } else if (this.t > 2.6) { this.set('wait', 'いとが きれちゃった…'); this.wait = 2.5 + Math.random() * 3; this.onMiss?.(); }
        break;
      case 'result':
        this.bob = 0;
        break;
    }
  }

  tap() {
    if (!this.active) return;
    if (this.phase === 'bite') { this.taps = 0; this.set('reel', 'れんだで ひきあげろ！'); }
    else if (this.phase === 'reel') this.taps++;
    else if (this.phase === 'wait' && this.t > 0.3) { this.message = 'まだ はやい！'; this.wait = this.t + 1.5 + Math.random() * 2; }
    else if (this.phase === 'result') { this.result = null; this.set('cast', 'えいっ！'); }
  }

  view(): FishingView | null {
    if (!this.active) return null;
    return { phase: this.phase, message: this.message, taps: this.taps, result: this.result ?? undefined };
  }
}

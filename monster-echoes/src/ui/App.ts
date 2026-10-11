import type { Game } from '../application/Game';
import type { SaveRepository } from '../infrastructure/save/SaveRepository';
import { pauseAudio, sfx, unlockAudio } from '../infrastructure/audio/Sound';
import { btn, clear, h, item, sleep } from './dom';

export interface Screen {
  el: HTMLElement;
  enter?(): void;
  leave?(): void;
  /** キー入力（まど・パネルが開いていないときだけ届く） */
  key?(k: Key, down: boolean): void;
  /** 一時停止（タブが裏にまわったとき） */
  pause?(p: boolean): void;
}
export type Key = 'up' | 'down' | 'left' | 'right' | 'a' | 'b' | 'menu';

const KEYMAP: Record<string, Key> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right',
  z: 'a', Z: 'a', Enter: 'a', ' ': 'a', x: 'b', X: 'b', Escape: 'b', Backspace: 'b', m: 'menu', M: 'menu',
};

type Panel = { el: HTMLElement; body: HTMLElement; foot: HTMLElement; refresh: () => void; close: () => void; onBack: () => void };

/** 画面の切りかえ・メッセージ・選択肢・パネルを管理する */
export class App {
  root: HTMLElement;
  stage: HTMLElement;
  screen: Screen | null = null;
  private _game: Game | null = null;
  private saveMark: HTMLElement;
  private saveMarkTimer = 0;
  private lastSaveFailToast = 0;
  get game() { return this._game; }
  set game(g: Game | null) {
    this._game = g;
    if (g) g.onSaved = (ok) => this.showSaved(ok);
  }
  /** オートセーブの しるし（画面の すみに そっと だす） */
  private showSaved(ok: boolean) {
    if (!ok) {
      if (Date.now() - this.lastSaveFailToast > 20000) { this.lastSaveFailToast = Date.now(); this.toast('きろくに しっぱいしました…（ようりょう不足かも）', 3000); }
      return;
    }
    this.saveMark.classList.add('on');
    clearTimeout(this.saveMarkTimer);
    this.saveMarkTimer = window.setTimeout(() => this.saveMark.classList.remove('on'), 900);
  }
  panels: Panel[] = [];
  private modal: { onKey: (k: Key) => void } | null = null;

  constructor(public repo: SaveRepository) {
    this.root = document.getElementById('app')!;
    this.stage = h('div', { class: 'stage' });
    this.root.append(this.stage);
    this.saveMark = h('div', { class: 'savemark', 'aria-hidden': 'true' }, 'きろくしました');
    this.stage.append(this.saveMark);
    window.addEventListener('keydown', (e) => {
      const k = KEYMAP[e.key];
      if (!k || (e.target instanceof HTMLInputElement)) return;
      e.preventDefault();
      unlockAudio();
      if (e.repeat && (k === 'a' || k === 'b')) return;
      this.dispatch(k, true);
    });
    window.addEventListener('keyup', (e) => {
      const k = KEYMAP[e.key];
      if (k && !this.modal && !this.panels.length) this.screen?.key?.(k, false);
    });
    const unlock = () => unlockAudio();
    window.addEventListener('pointerdown', unlock, { passive: true });
    document.addEventListener('visibilitychange', () => {
      const hidden = document.visibilityState === 'hidden';
      pauseAudio(hidden);
      this.screen?.pause?.(hidden);
      if (hidden) this.game?.flushSave().catch(() => {});
    });
    window.addEventListener('pagehide', () => { this.game?.flushSave().catch(() => {}); });
    // ピンチやダブルタップでの拡大・ページのスクロールを防ぐ
    document.addEventListener('gesturestart', (e) => e.preventDefault());
    document.addEventListener('touchmove', (e) => {
      const t = e.target as HTMLElement;
      if (!t.closest('.panel-body')) e.preventDefault();
    }, { passive: false });
  }

  dispatch(k: Key, down: boolean) {
    if (this.modal) {
      if (down) this.modal.onKey(k);
      return;
    }
    if (this.panels.length) {
      const top = this.panels[this.panels.length - 1];
      if (down && k === 'b') top.onBack();
      return;
    }
    this.screen?.key?.(k, down);
  }

  show(s: Screen) {
    this.closeAllPanels();
    this.screen?.leave?.();
    this.screen?.el.remove();
    this.screen = s;
    this.stage.prepend(s.el);
    s.enter?.();
  }

  get settings() {
    return this.game?.state.settings ?? { textSpeed: 'normal', battleSpeed: 'fast', reduceMotion: false, sound: true, largeText: false };
  }
  applySettings() {
    const s = this.settings;
    document.body.classList.toggle('large', s.largeText);
    document.body.classList.toggle('reduce', s.reduceMotion);
  }

  // ---------------------------------------------------------------- メッセージ
  /** メッセージを1ページずつ表示。タップ（A）で次へ。 */
  async say(lines: string | string[], opts: { auto?: number; speaker?: string } = {}) {
    const pages = (Array.isArray(lines) ? lines : [lines]).filter(Boolean);
    if (!pages.length) return;
    const box = h('div', { class: 'win msgbox' });
    const text = h('div');
    const more = h('div', { class: 'more' }, '▼');
    box.append(text);
    // 画面の どこを タップしても 次へ すすむ
    const catcher = h('div', { class: 'tap-catcher' });
    this.stage.append(catcher, box);
    const speed = { slow: 30, normal: 14, fast: 4 }[this.settings.textSpeed];
    try {
      for (const pg of pages) {
        const full = opts.speaker ? `${opts.speaker}「${pg}」` : pg;
        let skip = false;
        let done = false;
        await new Promise<void>((resolve) => {
          const advance = () => {
            if (!done) { skip = true; return; }
            sfx('cursor');
            resolve();
          };
          box.onclick = advance;
          catcher.onclick = advance;
          this.modal = { onKey: (k) => (k === 'a' || k === 'b') && advance() };
          (async () => {
            more.remove();
            const stepN = speed <= 4 ? 2 : 1;
            for (let i = 1; i <= full.length && !skip; i += stepN) {
              text.textContent = full.slice(0, i);
              await sleep(speed);
            }
            text.textContent = full;
            done = true;
            box.append(more);
            if (opts.auto) setTimeout(() => resolve(), opts.auto);
          })();
        });
      }
    } finally {
      this.modal = null;
      box.remove();
      catcher.remove();
    }
  }

  /** 質問と選択肢。キャンセルで -1 */
  async ask(question: string, options: string[], opts: { cancel?: boolean; speaker?: string } = {}): Promise<number> {
    const box = h('div', { class: 'win msgbox' }, opts.speaker ? `${opts.speaker}「${question}」` : question);
    const bg = h('div', { class: 'modal-bg' });
    const list = h('div', { class: 'list' });
    const ch = h('div', { class: 'win choices' }, list);
    this.stage.append(bg, box, ch);
    // 選択肢をメッセージの上に置く
    requestAnimationFrame(() => (ch.style.bottom = `${box.offsetHeight + 16}px`));
    let sel = 0;
    try {
      return await new Promise<number>((resolve) => {
        const render = () => {
          clear(list);
          options.forEach((o, i) => list.append(item(o, () => { sfx('ok'); resolve(i); }, { sel: i === sel })));
        };
        render();
        if (opts.cancel !== false) bg.onclick = () => { sfx('cancel'); resolve(-1); };
        this.modal = {
          onKey: (k) => {
            if (k === 'up') { sel = (sel + options.length - 1) % options.length; sfx('cursor'); render(); }
            if (k === 'down') { sel = (sel + 1) % options.length; sfx('cursor'); render(); }
            if (k === 'a') { sfx('ok'); resolve(sel); }
            if (k === 'b' && opts.cancel !== false) { sfx('cancel'); resolve(-1); }
          },
        };
      });
    } finally {
      this.modal = null;
      bg.remove();
      box.remove();
      ch.remove();
    }
  }
  async confirm(question: string, yes = 'はい', no = 'いいえ') {
    return (await this.ask(question, [yes, no])) === 0;
  }

  toast(text: string, ms = 1600) {
    const t = h('div', { class: 'win toast' }, text);
    this.stage.append(t);
    setTimeout(() => t.remove(), ms);
  }

  // ---------------------------------------------------------------- パネル（全画面のメニュー）
  /** タイトルつきのパネルを開く。build は refresh のたびに呼ばれる。 */
  panel(title: string, build: (body: HTMLElement, foot: HTMLElement, p: Panel) => void, opts: { onClose?: () => void; noBack?: boolean } = {}): Panel {
    const body = h('div', { class: 'panel-body' });
    const foot = h('div', { class: 'panel-foot' });
    const titleEl = h('div', { class: 'title' }, title);
    const close = () => {
      const i = this.panels.indexOf(p);
      if (i >= 0) this.panels.splice(i, 1);
      el.remove();
      opts.onClose?.();
    };
    const back = btn('◀ もどる', () => { sfx('cancel'); p.onBack(); });
    const el = h('div', { class: 'panel' }, h('div', { class: 'panel-head' }, opts.noBack ? null : back, titleEl), body, foot);
    const p: Panel = {
      el, body, foot,
      refresh: () => {
        const top = body.scrollTop;
        clear(body);
        clear(foot);
        build(body, foot, p);
        foot.style.display = foot.childElementCount ? '' : 'none';
        body.scrollTop = top;
      },
      close,
      onBack: close,
    };
    this.panels.push(p);
    this.stage.append(el);
    p.refresh();
    return p;
  }
  closeAllPanels() {
    while (this.panels.length) this.panels[this.panels.length - 1].close();
  }
  refreshPanels() {
    for (const p of this.panels) p.refresh();
  }

  /** 保存（失敗したら知らせる） */
  async saveNow(showToast = false) {
    if (!this.game) return false;
    try {
      await this.game.flushSave();
      if (showToast) { sfx('save'); this.toast('ぼうけんの きろくを のこしました。'); }
      return true;
    } catch {
      this.toast('きろくに しっぱいしました…（ようりょう不足かも）', 3000);
      return false;
    }
  }
}

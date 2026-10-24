// 会話・選択肢・場面転換・通知
import { el, btn, esc, wait } from './dom';
import { sfx } from './audio';
import { PALETTES, charSprite } from './sprites';

const SPEAKER_SPRITE: Record<string, string> = {
  セイル: 'seil', ドラン: 'dran', ヘルド: 'held', コラ: 'kora', マルタ: 'marta', ペック: 'peck', オルネ: 'orne', ネリ: 'neri',
  ティモ: 'timo', ピリカ: 'pirika', ボルド: 'bold', ハンナ: 'hanna', ガルト: 'garth', トワ: 'towa', ミナ: 'mina', ルーメ: 'lume',
  果物売り: 'citizen', 通りの男: 'citizen2',
};

let textSpeed = 28;
export function setTextSpeed(cps: number): void { textSpeed = cps; }

export class DialogUI {
  readonly root: HTMLDivElement;
  private toastBox: HTMLDivElement;
  constructor(parent: HTMLElement) {
    this.root = el('div', 'dlg-layer');
    this.toastBox = el('div', 'toasts');
    parent.append(this.root, this.toastBox);
  }

  /** 台詞。タップ・Enter で送る */
  say(who: string, text: string): Promise<void> {
    return new Promise(resolve => {
      const box = el('div', 'dlg' + (who ? '' : ' narr'));
      const sp = SPEAKER_SPRITE[who];
      if (sp && PALETTES[sp]) {
        const face = el('div', 'face');
        const c = charSprite(sp, 2, 0);
        const cv = document.createElement('canvas');
        cv.width = 12; cv.height = 10;
        cv.getContext('2d')!.drawImage(c, 0, 0, 12, 10, 0, 0, 12, 10);
        face.append(cv);
        box.append(face);
      }
      const body = el('div', 'dlg-body');
      if (who) body.append(el('div', 'who', esc(who)));
      const p = el('div', 'txt');
      body.append(p);
      const more = el('div', 'more', '▼');
      box.append(body, more);
      this.root.append(box);
      let i = 0;
      let done = false;
      const chars = [...text];
      const full = () => { p.textContent = text; done = true; more.classList.add('on'); };
      const iv = window.setInterval(() => {
        if (done) return;
        i += 1;
        p.textContent = chars.slice(0, i).join('');
        if (i % 3 === 0 && who) sfx('blip');
        if (i >= chars.length) { clearInterval(iv); full(); }
      }, 1000 / textSpeed);
      const advance = (e?: Event) => {
        e?.preventDefault();
        if (!done) { clearInterval(iv); full(); return; }
        cleanup();
        box.remove();
        resolve();
      };
      const key = (e: KeyboardEvent) => { if (['Enter', ' ', 'z', 'Z'].includes(e.key)) advance(e); };
      const cleanup = () => { window.removeEventListener('keydown', key); };
      box.addEventListener('click', advance);
      setTimeout(() => window.addEventListener('keydown', key), 60);
    });
  }

  choice(q: string | undefined, opts: { label: string; disabled?: boolean }[]): Promise<number> {
    return new Promise(resolve => {
      const wrap = el('div', 'choice');
      if (q) wrap.append(el('div', 'q', esc(q)));
      let sel = opts.findIndex(o => !o.disabled);
      const buttons = opts.map((o, i) => {
        const b = btn(esc(o.label), 'opt' + (o.disabled ? ' off' : ''), () => { if (o.disabled) return; finish(i); });
        wrap.append(b);
        return b;
      });
      const mark = () => buttons.forEach((b, i) => b.classList.toggle('sel', i === sel));
      mark();
      const key = (e: KeyboardEvent) => {
        if (e.key === 'ArrowDown' || e.key === 's') { e.preventDefault(); do sel = (sel + 1) % opts.length; while (opts[sel].disabled); mark(); }
        if (e.key === 'ArrowUp' || e.key === 'w') { e.preventDefault(); do sel = (sel - 1 + opts.length) % opts.length; while (opts[sel].disabled); mark(); }
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); finish(sel); }
      };
      const finish = (i: number) => { sfx('select'); window.removeEventListener('keydown', key); wrap.remove(); resolve(i); };
      this.root.append(wrap);
      setTimeout(() => window.addEventListener('keydown', key), 80);
    });
  }

  /** 黒い画面に一行ずつ */
  async scene(lines: string[], title?: string): Promise<void> {
    const sc = el('div', 'scene');
    this.root.append(sc);
    await wait(30);
    sc.classList.add('on');
    if (title) {
      const t = el('div', 'scene-title', esc(title));
      sc.append(t);
      await wait(1400);
    }
    for (const line of lines) {
      const p = el('p', '', esc(line));
      sc.append(p);
      await wait(30);
      p.classList.add('on');
      await this.tapOrWait(sc, 2600);
    }
    sc.classList.remove('on');
    await wait(500);
    sc.remove();
  }

  private tapOrWait(node: HTMLElement, ms: number): Promise<void> {
    return new Promise(res => {
      let done = false;
      const fin = () => { if (done) return; done = true; node.removeEventListener('click', fin); window.removeEventListener('keydown', fin); res(); };
      node.addEventListener('click', fin);
      window.addEventListener('keydown', fin);
      setTimeout(fin, ms);
    });
  }

  async titleCard(text: string, sub?: string): Promise<void> {
    const c = el('div', 'titlecard');
    c.innerHTML = `<div class="tc-main">${esc(text)}</div>${sub ? `<div class="tc-sub">${esc(sub)}</div>` : ''}`;
    this.root.append(c);
    await wait(30);
    c.classList.add('on');
    await this.tapOrWait(c, 3200);
    c.classList.remove('on');
    await wait(700);
    c.remove();
  }

  async flash(): Promise<void> {
    const f = el('div', 'flash');
    this.root.append(f);
    await wait(20);
    f.classList.add('on');
    await wait(500);
    f.classList.remove('on');
    await wait(700);
    f.remove();
  }

  toast(html: string, kind = ''): void {
    const t = el('div', 'toast ' + kind, html);
    while (this.toastBox.childElementCount >= 3) this.toastBox.firstElementChild!.remove();
    this.toastBox.append(t);
    setTimeout(() => t.classList.add('on'), 20);
    setTimeout(() => { t.classList.remove('on'); setTimeout(() => t.remove(), 500); }, 3000);
  }

  /** 決まった内容のパネル（勝利画面など）を出してボタンを待つ */
  panel(html: string, buttons: string[], cls = ''): Promise<number> {
    return new Promise(resolve => {
      const ov = el('div', 'overlay');
      const p = el('div', 'panel ' + cls, html);
      const row = el('div', 'panel-btns');
      buttons.forEach((b, i) => row.append(btn(esc(b), i === 0 ? 'primary' : '', () => { sfx('select'); ov.remove(); window.removeEventListener('keydown', key); resolve(i); })));
      const key = (e: KeyboardEvent) => { if (e.key === 'Enter') { e.preventDefault(); ov.remove(); window.removeEventListener('keydown', key); resolve(0); } };
      p.append(row);
      ov.append(p);
      this.root.append(ov);
      setTimeout(() => window.addEventListener('keydown', key), 200);
    });
  }
}

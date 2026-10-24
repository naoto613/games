// タイトル画面：ほどけかけた因果の線が漂う
import { el, btn } from './dom';
import { sfx, unlockAudio } from './audio';
import { getSave } from '../app/storage';

export type TitleChoice = { kind: 'new' } | { kind: 'continue' } | { kind: 'load'; slot: string } | { kind: 'import'; text: string };

export class TitleUI {
  private root: HTMLDivElement;
  private cv: HTMLCanvasElement;
  private raf = 0;
  constructor(private parent: HTMLElement, private hasAuto: boolean) {
    this.root = el('div', 'title');
    this.cv = document.createElement('canvas');
  }

  run(): Promise<TitleChoice> {
    this.root.append(this.cv);
    const box = el('div', 'title-box');
    box.innerHTML = `<div class="t-kicker">因果編集RPG</div><h1>余白のアーカイブ</h1><div class="t-sub">— 世界がそうなった理由 —</div>`;
    const menu = el('div', 'title-menu');
    box.append(menu);
    this.root.append(box, el('div', 't-foot', '序章・第一章「繰り返される街」収録版'));
    this.parent.append(this.root);
    this.anim();
    return new Promise(resolve => {
      const finish = (c: TitleChoice) => { sfx('select'); cancelAnimationFrame(this.raf); this.root.remove(); resolve(c); };
      if (this.hasAuto) menu.append(btn('つづきから', 'primary', () => finish({ kind: 'continue' })));
      menu.append(btn('はじめから', this.hasAuto ? '' : 'primary', async () => {
        if (this.hasAuto && !confirm('はじめからにしますか？（自動セーブは次のセーブで上書きされます）')) return;
        finish({ kind: 'new' });
      }));
      menu.append(btn('セーブを選んでロード', '', async () => {
        menu.innerHTML = '';
        for (const slot of ['slot1', 'slot2', 'slot3']) {
          const t = await getSave(slot);
          const b = btn(`スロット${slot.slice(4)}${t ? '' : '（空き）'}`, '', () => finish({ kind: 'load', slot }));
          b.disabled = !t;
          menu.append(b);
        }
        menu.append(btn('戻る', 'small', () => { this.root.remove(); cancelAnimationFrame(this.raf); void new TitleUI(this.parent, this.hasAuto).run().then(resolve); }));
      }));
      const file = document.createElement('input');
      file.type = 'file'; file.accept = '.json,application/json'; file.style.display = 'none';
      file.addEventListener('change', async () => { const f = file.files?.[0]; if (f) finish({ kind: 'import', text: await f.text() }); });
      menu.append(btn('ファイルから読み込む', 'small', () => file.click()), file);
      this.root.addEventListener('pointerdown', () => unlockAudio());
    });
  }

  private anim(): void {
    const cv = this.cv;
    const g = cv.getContext('2d')!;
    const nodes = Array.from({ length: 26 }, (_, i) => ({ x: Math.random(), y: Math.random(), vx: (Math.random() - 0.5) * 0.02, vy: (Math.random() - 0.5) * 0.02, broken: i % 4 === 0 }));
    let t = 0;
    const step = () => {
      t += 1 / 60;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      if (cv.width !== innerWidth * dpr) { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }
      const W = cv.width, H = cv.height;
      g.fillStyle = '#0d0c12';
      g.fillRect(0, 0, W, H);
      for (const n of nodes) {
        n.x += n.vx / 60; n.y += n.vy / 60;
        if (n.x < 0 || n.x > 1) n.vx *= -1;
        if (n.y < 0 || n.y > 1) n.vy *= -1;
      }
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot((a.x - b.x) * W, (a.y - b.y) * H);
        if (d > Math.min(W, H) * 0.28) continue;
        const alpha = 1 - d / (Math.min(W, H) * 0.28);
        const broken = a.broken || b.broken;
        g.strokeStyle = broken ? `rgba(208,96,90,${alpha * 0.35})` : `rgba(226,180,94,${alpha * 0.35})`;
        g.lineWidth = dpr;
        g.setLineDash(broken ? [6 * dpr, 6 * dpr] : []);
        g.beginPath(); g.moveTo(a.x * W, a.y * H); g.lineTo(b.x * W, b.y * H); g.stroke();
      }
      g.setLineDash([]);
      for (const n of nodes) {
        const s = (n.broken ? 5 : 4) * dpr;
        g.fillStyle = n.broken ? 'rgba(208,96,90,0.7)' : 'rgba(240,210,140,0.8)';
        if (n.broken && Math.sin(t * 3 + n.x * 20) > 0.6) continue;
        g.fillRect(n.x * W - s / 2, n.y * H - s / 2, s, s);
      }
      this.raf = requestAnimationFrame(step);
    };
    step();
  }
}

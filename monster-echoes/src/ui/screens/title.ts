import { createRng } from '../../core/Random';
import { Game, INTRO_EVENTS, newGameState } from '../../application/Game';
import { STORY_EVENT_BY_ID } from '../../data/story';
import { renderLines } from '../../domain/story/StoryEngine';
import { sayLines } from './story';
import type { SaveData } from '../../application/GameState';
import { playBgm, sfx } from '../../infrastructure/audio/Sound';
import type { App, Screen } from '../App';
import { btn, h } from '../dom';
import { monsterSprite } from '../gfx/monsters';
import { mkCanvas } from '../gfx/Pix';
import { personSprite } from '../gfx/tiles';
import { FieldScreen } from './field';
import { openSettings, welcomeMonster } from './menus';

const TW = 352, TH = 700;

/**
 * タイトル画面（参考画像2「タイトル画面」）：
 * 空に うかぶ 島と おしろ・滝・雪山、クリスタルの ロゴ、がけの 上で 景色を ながめる 主人公と キツネと スライム、右下の メニュー。
 */
export class TitleScreen implements Screen {
  el: HTMLElement;
  private raf = 0;
  private cv: HTMLCanvasElement;
  private g: CanvasRenderingContext2D;
  private t = 0;
  constructor(private app: App, private save: SaveData | null, loadError: string | null) {
    [this.cv, this.g] = mkCanvas(TW, TH);
    const opt = (label: string, fn: () => void, first: boolean) => {
      const b = h('button', { class: `titem${first ? ' sel' : ''}`, type: 'button' }, label);
      b.addEventListener('click', fn);
      return b;
    };
    const menu = h('div', { class: 'win tmenu' },
      opt('はじめから', () => this.newGame(), !save),
      save ? opt('つづきから', () => this.cont(), true) : null,
      opt('オプション', () => openSettings(this.app), false));
    this.el = h('div', { class: 'titlescr' }, this.cv,
      loadError ? h('div', { class: 'win small bad terr' }, loadError) : null,
      menu,
      h('div', { class: 'tcopy' }, '© モンスター・エコーズ'));
  }
  enter() {
    const loop = () => { this.raf = requestAnimationFrame(loop); this.t++; this.draw(); };
    loop();
  }
  leave() { cancelAnimationFrame(this.raf); }

  private bg: HTMLCanvasElement | null = null;
  /** 動かない 背景を 一度だけ 描く */
  private background() {
    if (this.bg) return this.bg;
    const [c, g] = mkCanvas(TW, TH);
    // 空
    const sky = g.createLinearGradient(0, 0, 0, 470);
    sky.addColorStop(0, '#1d4fb4'); sky.addColorStop(0.45, '#5fa6ec'); sky.addColorStop(1, '#cfeeff');
    g.fillStyle = sky; g.fillRect(0, 0, TW, 470);
    const sun = g.createRadialGradient(270, 250, 6, 270, 250, 160);
    sun.addColorStop(0, 'rgba(255,250,220,.9)'); sun.addColorStop(1, 'rgba(255,250,220,0)');
    g.fillStyle = sun; g.fillRect(100, 90, 252, 320);
    // とおくの 雪山
    const peaks = (base: number, col: string, snow: string, pts: [number, number][]) => {
      g.fillStyle = col; g.beginPath(); g.moveTo(0, base);
      for (const [x, y] of pts) g.lineTo(x, y);
      g.lineTo(TW, base); g.fill();
      g.fillStyle = snow;
      for (let i = 1; i < pts.length - 1; i++) {
        const [x, y] = pts[i];
        if (y > pts[i - 1][1] || y > pts[i + 1][1]) continue;
        g.beginPath(); g.moveTo(x, y); g.lineTo(x - 13, y + 16); g.lineTo(x - 4, y + 12); g.lineTo(x + 3, y + 18); g.lineTo(x + 12, y + 15); g.fill();
      }
    };
    peaks(440, '#7e9cc8', '#f4f8ff', [[0, 400], [40, 360], [80, 392], [130, 330], [178, 384], [226, 350], [262, 300], [300, 352], [352, 330]]);
    peaks(460, '#5f80b4', '#e6eefc', [[0, 430], [56, 398], [104, 430], [150, 392], [210, 440], [260, 404], [320, 436], [352, 416]]);
    // みずうみと 森の 谷
    const lake = g.createLinearGradient(0, 446, 0, 500);
    lake.addColorStop(0, '#8fd0f4'); lake.addColorStop(1, '#3f8fd0');
    g.fillStyle = lake; g.fillRect(0, 446, TW, 60);
    g.fillStyle = 'rgba(255,255,255,.55)';
    for (let i = 0; i < 26; i++) g.fillRect((i * 61) % TW, 452 + ((i * 13) % 44), 8 + (i % 3) * 4, 1);
    const trees = (y0: number, col: string, hi: string, step: number, r: number) => {
      for (let x = -10; x < TW + 20; x += step) {
        const y = y0 + Math.sin(x * 0.07) * 4;
        g.fillStyle = col; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
        g.fillStyle = hi; g.beginPath(); g.arc(x - r * 0.3, y - r * 0.35, r * 0.45, 0, Math.PI * 2); g.fill();
      }
    };
    trees(500, '#2f7a3a', '#4f9a4a', 14, 11);
    g.fillStyle = '#3f8a3a'; g.fillRect(0, 504, TW, 40);
    trees(526, '#28703a', '#45924a', 18, 13);
    // 右の がけと 大きな 滝
    g.fillStyle = '#6a7a6a'; g.beginPath(); g.moveTo(270, 540); g.lineTo(282, 380); g.lineTo(310, 360); g.lineTo(352, 350); g.lineTo(352, 540); g.fill();
    g.fillStyle = '#4a9a3e'; g.beginPath(); g.moveTo(276, 392); g.quadraticCurveTo(312, 344, 352, 342); g.lineTo(352, 360); g.lineTo(282, 400); g.fill();
    const fall = g.createLinearGradient(300, 0, 330, 0);
    fall.addColorStop(0, '#d8f2ff'); fall.addColorStop(0.5, '#ffffff'); fall.addColorStop(1, '#a8dcf8');
    g.fillStyle = fall; g.fillRect(300, 362, 26, 170);
    g.fillStyle = 'rgba(255,255,255,.8)'; g.beginPath(); g.ellipse(313, 534, 30, 8, 0, 0, Math.PI * 2); g.fill();
    // 手前の がけ（主人公たちが 立つ ところ）
    const cliff = g.createLinearGradient(0, 560, 0, TH);
    cliff.addColorStop(0, '#5ab048'); cliff.addColorStop(0.25, '#3f8f3a'); cliff.addColorStop(1, '#2a5e2a');
    g.fillStyle = cliff; g.beginPath(); g.moveTo(0, TH); g.lineTo(0, 566); g.quadraticCurveTo(120, 548, 236, 572); g.quadraticCurveTo(262, 590, 258, TH); g.fill();
    g.fillStyle = '#7a6a52'; g.beginPath(); g.moveTo(236, 572); g.quadraticCurveTo(262, 590, 258, TH); g.lineTo(300, TH); g.quadraticCurveTo(286, 620, 250, 576); g.fill();
    const flowers = ['#ff7aa8', '#fff070', '#ffffff', '#b0a0ff'];
    for (let i = 0; i < 46; i++) { const x = (i * 83) % 240, y = 578 + ((i * 37) % 110); g.fillStyle = flowers[i % 4]; g.fillRect(x, y, 2, 2); g.fillStyle = '#2a7a2a'; g.fillRect(x + 3, y + 1, 1, 3); }
    this.bg = c;
    return c;
  }

  /** 空に うかぶ 島と おしろ（ゆっくり 上下する） */
  private island(g: CanvasRenderingContext2D, x: number, y: number, w: number, castle: boolean) {
    // 島の ねもと（岩と たれさがる 根）
    g.fillStyle = '#7a6250'; g.beginPath(); g.moveTo(x - w, y); g.quadraticCurveTo(x - w * 0.4, y + w * 0.9, x, y + w * 1.15); g.quadraticCurveTo(x + w * 0.4, y + w * 0.9, x + w, y); g.fill();
    g.fillStyle = '#5a4636'; g.beginPath(); g.moveTo(x, y + w * 1.15); g.quadraticCurveTo(x + w * 0.4, y + w * 0.9, x + w, y); g.lineTo(x + w * 0.4, y); g.fill();
    g.strokeStyle = '#3e6a2e'; g.lineWidth = 1.5;
    for (let i = -2; i <= 2; i++) { g.beginPath(); g.moveTo(x + i * w * 0.3, y + w * 0.5); g.quadraticCurveTo(x + i * w * 0.32 + 3, y + w * 0.9, x + i * w * 0.28, y + w * 1.25); g.stroke(); }
    g.fillStyle = '#4fae44'; g.beginPath(); g.ellipse(x, y, w, w * 0.22, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#7ad064'; g.beginPath(); g.ellipse(x - w * 0.15, y - w * 0.05, w * 0.6, w * 0.1, 0, 0, Math.PI * 2); g.fill();
    // 島から おちる 細い 滝
    g.fillStyle = 'rgba(220,244,255,.85)'; g.fillRect(x + w * 0.55, y + 4, 4, w * 1.4);
    if (!castle) return;
    const tower = (tx: number, ty: number, tw: number, th: number, roof: string) => {
      g.fillStyle = '#eef2fa'; g.fillRect(tx, ty, tw, th);
      g.fillStyle = '#c4cee2'; g.fillRect(tx + tw * 0.62, ty, tw * 0.38, th);
      g.fillStyle = roof; g.beginPath(); g.moveTo(tx - 2, ty); g.lineTo(tx + tw / 2, ty - tw * 1.3); g.lineTo(tx + tw + 2, ty); g.fill();
      g.fillStyle = '#4a6aa0'; for (let yy = ty + 5; yy < ty + th - 3; yy += 9) g.fillRect(tx + tw / 2 - 1, yy, 2.5, 4);
    };
    g.fillStyle = '#e2e8f4'; g.fillRect(x - w * 0.55, y - 26, w * 1.1, 24);
    tower(x - w * 0.62, y - 46, 12, 44, '#3a6ad8');
    tower(x + w * 0.42, y - 42, 12, 40, '#3a6ad8');
    tower(x - 10, y - 74, 20, 72, '#2a52c0');
    tower(x - w * 0.25, y - 52, 11, 50, '#3a6ad8');
    tower(x + w * 0.15, y - 56, 11, 54, '#3a6ad8');
    g.fillStyle = '#ffd84a'; g.fillRect(x, y - 100, 1, 10); g.fillStyle = '#ff5a5a'; g.fillRect(x + 1, y - 100, 7, 4);
  }

  private draw() {
    const g = this.g, t = this.t;
    const still = this.app.settings.reduceMotion;
    g.drawImage(this.background(), 0, 0);
    const f = still ? 0 : t;
    // くも
    for (const [x0, y, sc, sp] of [[20, 300, 1, 0.08], [190, 240, 0.8, 0.05], [300, 330, 0.7, 0.1], [90, 210, 0.6, 0.04]] as [number, number, number, number][]) {
      const x = ((x0 + f * sp) % (TW + 80)) - 40;
      g.fillStyle = 'rgba(255,255,255,.9)';
      for (const [dx, dy, r] of [[0, 3, 10], [13, 0, 13], [28, 4, 10], [-11, 6, 8]]) { g.beginPath(); g.arc(x + dx * sc, y + dy * sc, r * sc, 0, Math.PI * 2); g.fill(); }
    }
    // うかぶ 島（おしろの 島と 小さな 島）
    this.island(g, 92, 300 + Math.sin(f / 50) * 3, 70, true);
    this.island(g, 262, 214 + Math.sin(f / 40 + 1) * 3, 34, false);
    this.island(g, 196, 330 + Math.sin(f / 46 + 2) * 2, 20, false);
    // きらめき
    for (let i = 0; i < 18; i++) { const x = (i * 71 + f * 0.15) % TW, y = 16 + (i * 29) % 200; g.fillStyle = `rgba(255,255,230,${0.35 + 0.45 * Math.sin(f / 14 + i)})`; g.fillRect(x, y, 2, 2); }
    // クリスタル（ロゴの 上）
    const cy = 50 + Math.sin(f / 30) * 2;
    const glow = g.createRadialGradient(TW / 2, cy, 4, TW / 2, cy, 54);
    glow.addColorStop(0, 'rgba(200,230,255,.9)'); glow.addColorStop(1, 'rgba(200,230,255,0)');
    g.fillStyle = glow; g.fillRect(TW / 2 - 60, cy - 60, 120, 120);
    const gem = (dx: number, w: number, h2: number, c1: string, c2: string) => {
      g.fillStyle = c1; g.beginPath(); g.moveTo(TW / 2 + dx, cy - h2); g.lineTo(TW / 2 + dx + w, cy - h2 * 0.2); g.lineTo(TW / 2 + dx, cy + h2 * 0.75); g.lineTo(TW / 2 + dx - w, cy - h2 * 0.2); g.fill();
      g.fillStyle = c2; g.beginPath(); g.moveTo(TW / 2 + dx, cy - h2); g.lineTo(TW / 2 + dx + w, cy - h2 * 0.2); g.lineTo(TW / 2 + dx, cy + h2 * 0.75); g.fill();
    };
    gem(-16, 9, 22, '#9a8af0', '#7a6ad8'); gem(16, 9, 22, '#7ab8f8', '#5a98e0'); gem(0, 15, 38, '#b8a8ff', '#8a7af0');
    g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(TW / 2 - 5, cy - 26, 3, 12);
    // ロゴ
    g.save();
    g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = 'bold 38px "DotGothic16", monospace';
    const text = 'モンスター・エコーズ';
    const tw = g.measureText(text).width;
    g.translate(TW / 2, 112);
    g.scale(Math.min(1, (TW - 56) / tw), 1); // 画面が たて長だと 左右が すこし きれるので 内がわに おさめる
    g.lineJoin = 'round';
    g.lineWidth = 10; g.strokeStyle = '#1a2a6a'; g.strokeText(text, 0, 3);
    g.lineWidth = 7; g.strokeStyle = '#ffffff'; g.strokeText(text, 0, 0);
    const blue = g.createLinearGradient(0, -18, 0, 18);
    blue.addColorStop(0, '#6ab0ff'); blue.addColorStop(0.5, '#2a5ad8'); blue.addColorStop(1, '#1a2a8a');
    g.fillStyle = blue; g.fillText(text, 0, 0);
    g.restore();
    // サブタイトル
    g.save();
    g.font = '13px "DotGothic16", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.lineWidth = 5; g.strokeStyle = '#ffffff'; g.strokeText('〜ルナフィアと ひかりのクリスタル〜', TW / 2, 146);
    g.fillStyle = '#1a3a9a'; g.fillText('〜ルナフィアと ひかりのクリスタル〜', TW / 2, 146);
    g.restore();
    // がけの 上の 主人公（うしろすがた）と キツネと ルナスライム
    const bob = still ? 0 : Math.round(Math.sin(t / 12) * 2);
    const shadow = (x: number, y: number, w: number) => { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x, y, w, 5, 0, 0, Math.PI * 2); g.fill(); };
    shadow(54, 616, 24); shadow(112, 622, 18); shadow(164, 614, 22);
    g.drawImage(monsterSprite('m024'), 16, 540 - bob, 78, 78);
    g.drawImage(personSprite('hero', 'up', 0), 88, 552, 50, 64);
    g.drawImage(monsterSprite('m001'), 132, 546 + bob, 66, 66);
  }

  private async cont() {
    sfx('ok');
    this.app.game = new Game(this.save!, { sink: this.app.repo });
    this.app.applySettings();
    this.app.show(new FieldScreen(this.app));
  }

  private async newGame() {
    sfx('ok');
    if (this.save && !(await this.app.confirm('いまの きろくは きえてしまいます。\nはじめから あそびますか？', 'はじめから', 'やめる'))) return;
    const input = h('input', { class: 'name', maxlength: 6, value: 'ルカ' }) as HTMLInputElement;
    const p = this.app.panel('なまえを きめてね', (body, foot) => {
      body.append(h('div', null, 'あなたの なまえ（6もじまで）'), input);
      foot.append(btn('けってい', () => { p.close(); this.start(input.value.trim() || 'ルカ'); }, 'primary grow'));
    });
    setTimeout(() => input.select(), 50);
  }

  private async start(name: string) {
    const state = newGameState(name, createRng((Date.now() ^ (Math.random() * 1e9)) >>> 0));
    try { const s = JSON.parse(localStorage.getItem('me-settings') ?? 'null'); if (s) Object.assign(state.settings, s); } catch { /* ignore */ }
    const game = new Game(state, { sink: this.app.repo });
    this.app.game = game;
    this.app.applySettings();
    playBgm('town');
    const app = this.app;
    // はじめの 物語（仕様 6 第1章：夜の光 → 傷ついた ルナスライムを たすける）
    await app.say(['ここは ルナフィア。ひとと まものが ともに くらす せかい。', `${name}は 森の 集落リーフェルで くらす、調律師の 見習い。`]);
    for (const id of INTRO_EVENTS) await sayLines(app, renderLines(game.storyContext(), STORY_EVENT_BY_ID[id].lines));
    sfx('recruit');
    for (const m of game.party) await welcomeMonster(app, m.id, '相棒の なまえ');
    await app.say(['森の 入口の 石碑の まえで、{luna}が なにかを 気にしている。'.replace('{luna}', game.storyContext().partnerName), '（集落の きた、森の 入口の 石碑を しらべてみよう）']);
    await app.saveNow();
    app.show(new FieldScreen(app));
  }
}

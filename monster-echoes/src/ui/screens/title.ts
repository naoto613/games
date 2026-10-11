import { createRng } from '../../core/Random';
import { Game, newGameState } from '../../application/Game';
import type { SaveData } from '../../application/GameState';
import { playBgm, sfx } from '../../infrastructure/audio/Sound';
import type { App, Screen } from '../App';
import { btn, h } from '../dom';
import { monsterSprite } from '../gfx/monsters';
import { mkCanvas } from '../gfx/Pix';
import { personSprite } from '../gfx/tiles';
import { FieldScreen } from './field';
import { openSettings, welcomeMonster } from './menus';

const TW = 352, TH = 340, OFF = 40;

/** タイトル画面 */
export class TitleScreen implements Screen {
  el: HTMLElement;
  private raf = 0;
  private cv: HTMLCanvasElement;
  private g: CanvasRenderingContext2D;
  private t = 0;
  constructor(private app: App, private save: SaveData | null, loadError: string | null) {
    [this.cv, this.g] = mkCanvas(TW, TH);
    const menu = h('div', { class: 'menu' },
      save ? btn('つづきから', () => this.cont(), 'primary') : null,
      btn('はじめから', () => this.newGame(), save ? '' : 'primary'),
      btn('せってい', () => openSettings(this.app)),
      loadError ? h('div', { class: 'win small bad' }, loadError) : null,
      h('div', { class: 'small muted', style: 'text-align:center' }, 'タップで いどう・なぞって あるく／きろくは じどうで のこります'));
    this.el = h('div', { class: 'titlescr' }, this.cv, menu);
  }
  enter() {
    const loop = () => { this.raf = requestAnimationFrame(loop); this.t++; this.draw(); };
    loop();
  }
  leave() { cancelAnimationFrame(this.raf); }

  private bg: HTMLCanvasElement | null = null;
  /** 動かない背景（空・海・島・おしろ・草原）を一度だけ描く */
  private background() {
    if (this.bg) return this.bg;
    const [c, g] = mkCanvas(TW, TH);
    const sky = g.createLinearGradient(0, 0, 0, 190 + OFF);
    sky.addColorStop(0, '#2350b8'); sky.addColorStop(0.55, '#79b6f0'); sky.addColorStop(1, '#d8f0ff');
    g.fillStyle = sky; g.fillRect(0, 0, TW, 190 + OFF);
    g.translate(0, OFF);
    const sun = g.createRadialGradient(300, 120, 4, 300, 120, 110);
    sun.addColorStop(0, 'rgba(255,248,210,.95)'); sun.addColorStop(1, 'rgba(255,248,210,0)');
    g.fillStyle = sun; g.fillRect(170, 0, 182, 240);
    // うみ
    const sea = g.createLinearGradient(0, 168, 0, 214);
    sea.addColorStop(0, '#5aa8e8'); sea.addColorStop(1, '#2a78c8');
    g.fillStyle = sea; g.fillRect(0, 168, TW, 50);
    g.fillStyle = 'rgba(255,255,255,.55)';
    for (let i = 0; i < 40; i++) g.fillRect((i * 53) % TW, 172 + ((i * 7) % 38), 6 + (i % 3) * 3, 1);
    // とおくの しま
    const island = (x: number, w: number, h: number, col: string) => {
      g.fillStyle = col; g.beginPath(); g.moveTo(x - w, 172); g.quadraticCurveTo(x - w * 0.3, 172 - h, x, 172 - h * 0.9); g.quadraticCurveTo(x + w * 0.4, 172 - h * 1.1, x + w, 172); g.fill();
    };
    island(40, 46, 20, '#6a9ab8'); island(130, 30, 12, '#7aa8c4');
    // おしろ（がけの上）
    g.fillStyle = '#5e8a4a'; g.beginPath(); g.moveTo(190, 180); g.quadraticCurveTo(240, 120, 300, 128); g.quadraticCurveTo(350, 132, 360, 180); g.fill();
    g.fillStyle = '#8a7a6a'; g.beginPath(); g.moveTo(205, 180); g.lineTo(225, 150); g.lineTo(260, 146); g.lineTo(250, 182); g.fill();
    const tower = (x: number, y: number, w: number, h: number, roof: string) => {
      g.fillStyle = '#e8eef8'; g.fillRect(x, y, w, h);
      g.fillStyle = '#b8c4dc'; g.fillRect(x + w * 0.62, y, w * 0.38, h);
      g.fillStyle = roof; g.beginPath(); g.moveTo(x - 3, y); g.lineTo(x + w / 2, y - w * 1.25); g.lineTo(x + w + 3, y); g.fill();
      g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.moveTo(x + w / 2, y - w * 1.25); g.lineTo(x + w + 3, y); g.lineTo(x + w / 2, y); g.fill();
      g.fillStyle = '#4a6aa0'; for (let yy = y + 6; yy < y + h - 4; yy += 10) g.fillRect(x + w / 2 - 1.5, yy, 3, 5);
    };
    g.fillStyle = '#dfe6f2'; g.fillRect(244, 104, 80, 30);
    for (let x = 244; x < 324; x += 8) g.fillRect(x, 100, 5, 4);
    tower(236, 86, 14, 48, '#d8484a'); tower(316, 90, 13, 44, '#d8484a'); tower(268, 70, 18, 64, '#3a6ad8'); tower(292, 82, 14, 52, '#d8484a');
    g.fillStyle = '#ffd84a'; g.fillRect(276, 46, 1, 10); g.fillStyle = '#ff5a5a'; g.fillRect(277, 46, 7, 4);
    g.fillStyle = '#5a4a3a'; g.beginPath(); g.arc(284, 134, 6, Math.PI, 0); g.fill();
    // おかと 木
    const hill = (y: number, col: string, amp: number, seed: number) => {
      g.fillStyle = col; g.beginPath(); g.moveTo(0, TH);
      for (let x = 0; x <= TW + 30; x += 30) g.quadraticCurveTo(x - 15, y - amp * Math.abs(Math.sin(x * 0.05 + seed)), x, y - amp * 0.4 * Math.abs(Math.cos(x * 0.03 + seed)));
      g.lineTo(TW, TH); g.fill();
    };
    hill(206, '#5aa04a', 14, 1);
    for (const [x, y, r] of [[18, 200, 13], [44, 204, 10], [330, 202, 12]]) {
      g.fillStyle = '#2e7a32'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#56a84a'; g.beginPath(); g.arc(x - r * 0.3, y - r * 0.35, r * 0.5, 0, Math.PI * 2); g.fill();
    }
    const field = g.createLinearGradient(0, 214, 0, TH);
    field.addColorStop(0, '#6ab84e'); field.addColorStop(1, '#4a9a3a');
    g.fillStyle = field; g.beginPath(); g.moveTo(0, TH); g.lineTo(0, 222); g.quadraticCurveTo(176, 206, TW, 222); g.lineTo(TW, TH); g.fill();
    const flowers = ['#ff7aa8', '#fff070', '#ffffff', '#b0a0ff'];
    for (let i = 0; i < 70; i++) { const x = (i * 97) % TW, y = 226 + ((i * 31) % 70); g.fillStyle = flowers[i % 4]; g.fillRect(x, y, 2, 2); g.fillStyle = '#3a8a2a'; g.fillRect(x + 3, y + 1, 1, 3); }
    this.bg = c;
    return c;
  }

  private draw() {
    const g = this.g, t = this.t;
    g.drawImage(this.background(), 0, 0);
    // くも
    for (const [x0, y, sc, sp] of [[20, 150, 1, 0.08], [180, 128, 0.8, 0.05], [320, 170, 0.7, 0.1]] as [number, number, number, number][]) {
      const x = ((x0 + t * sp) % (TW + 80)) - 40;
      g.fillStyle = 'rgba(255,255,255,.9)';
      for (const [dx, dy, r] of [[0, 3, 10], [13, 0, 13], [28, 4, 10], [-11, 6, 8]]) { g.beginPath(); g.arc(x + dx * sc, y + dy * sc, r * sc, 0, Math.PI * 2); g.fill(); }
    }
    for (let i = 0; i < 18; i++) { const x = (i * 71 + t * 0.15) % TW, y = 8 + (i * 29) % 70; g.fillStyle = `rgba(255,255,230,${0.35 + 0.45 * Math.sin(t / 14 + i)})`; g.fillRect(x, y, 2, 2); }
    // ロゴ
    g.save();
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = 'bold 38px "DotGothic16", monospace';
    const text = 'モンスター・エコーズ';
    const tw = g.measureText(text).width;
    g.translate(TW / 2, 46);
    g.rotate(-0.03);
    g.scale(Math.min(1, (TW - 20) / tw), 1);
    g.lineJoin = 'round';
    g.lineWidth = 10; g.strokeStyle = '#1a2a6a'; g.strokeText(text, 0, 3);
    g.lineWidth = 7; g.strokeStyle = '#2a4aa8'; g.strokeText(text, 0, 0);
    const gold = g.createLinearGradient(0, -18, 0, 18);
    gold.addColorStop(0, '#fff8b0'); gold.addColorStop(0.45, '#ffd84a'); gold.addColorStop(1, '#f08a20');
    g.fillStyle = gold; g.fillText(text, 0, 0);
    // つやの ひかり
    const shine = ((t * 3) % 500) - 200;
    g.globalCompositeOperation = 'source-atop';
    g.restore();
    g.save();
    g.globalAlpha = 0.5;
    g.fillStyle = '#ffffff';
    g.beginPath(); g.moveTo(shine, 20); g.lineTo(shine + 14, 20); g.lineTo(shine - 6, 72); g.lineTo(shine - 20, 72); g.fill();
    g.restore();
    // サブタイトルの リボン
    g.save();
    g.fillStyle = '#1a3a8a';
    g.beginPath(); g.moveTo(50, 78); g.lineTo(302, 78); g.lineTo(312, 89); g.lineTo(302, 100); g.lineTo(50, 100); g.lineTo(40, 89); g.fill();
    g.strokeStyle = '#ffffff'; g.lineWidth = 2; g.stroke();
    g.font = '14px "DotGothic16", monospace'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillStyle = '#ffffff'; g.fillText('〜 ルナフィアと ひかりのクリスタル 〜', TW / 2, 90);
    g.restore();
    // なかまたち
    const bob = this.app.settings.reduceMotion ? 0 : Math.round(Math.sin(t / 12) * 2);
    const shadow = (x: number, y: number, w: number) => { g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(x, y, w, 5, 0, 0, Math.PI * 2); g.fill(); };
    shadow(84, 330, 30); shadow(186, 332, 22); shadow(262, 330, 30);
    g.drawImage(monsterSprite('magmadog'), 36, 236 - bob, 96, 96);
    g.drawImage(personSprite('hero', 'down', Math.floor(t / 24)), 154, 252, 64, 80);
    g.drawImage(monsterSprite('lunaslime'), 214, 236 + bob, 96, 96);
    g.drawImage(monsterSprite('frostbird'), 20, 150 + bob * 2, 64, 64);
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
    await app.say([
      'ここは ルナフィア。ひとと モンスターが ともに くらす せかい。',
      'しかし あるひ、まちを まもる ひかりの クリスタルが くだけ、せかいの あちこちに「ゆがみ」が うまれた。',
      `${name}は モンスターの ちからを ととのえる みならい「ちょうりつし」。`,
    ]);
    await app.say(['よく きた、' + name + '。', 'ゆがみは たびのとびらの むこうで モンスターたちを くるしめておる。', 'これは わしが そだてた ルナスライムと、リリィが そだてた マグマドッグじゃ。いっしょに つれていきなさい。'], { speaker: 'モンスターはかせ' });
    sfx('recruit');
    await app.say('ルナスライム と マグマドッグ が なかまに なった！');
    for (const m of game.party) await welcomeMonster(app, m.id, 'なかまの なまえ');
    await app.say(['やせいの モンスターに にくを なげてから たおすと、なかまに なってくれることが ある。', 'なかまを ふやし、そだて、配合して…ひかりの かけらを 3つ あつめてくるのじゃ！', 'まずは まちの きたの「たびのとびら」から はじまりのもりへ いってみなさい。'], { speaker: 'モンスターはかせ' });
    await app.saveNow();
    app.show(new FieldScreen(app));
  }
}

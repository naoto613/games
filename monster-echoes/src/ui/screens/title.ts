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
import { openSettings } from './menus';

/** タイトル画面 */
export class TitleScreen implements Screen {
  el: HTMLElement;
  private raf = 0;
  private cv: HTMLCanvasElement;
  private g: CanvasRenderingContext2D;
  private t = 0;
  constructor(private app: App, private save: SaveData | null, loadError: string | null) {
    [this.cv, this.g] = mkCanvas(176, 132);
    const menu = h('div', { class: 'menu' },
      save ? btn('つづきから', () => this.cont(), 'primary') : null,
      btn('はじめから', () => this.newGame(), save ? '' : 'primary'),
      btn('せってい', () => openSettings(this.app)),
      loadError ? h('div', { class: 'win small bad' }, loadError) : null,
      h('div', { class: 'small muted', style: 'text-align:center' }, 'ゆびで あそべます（キーボード: やじるし・Z・X）'));
    this.el = h('div', { class: 'titlescr' }, this.cv, menu);
  }
  enter() {
    const loop = () => { this.raf = requestAnimationFrame(loop); this.t++; this.draw(); };
    loop();
  }
  leave() { cancelAnimationFrame(this.raf); }

  private draw() {
    const g = this.g, t = this.t;
    const grd = g.createLinearGradient(0, 0, 0, 132);
    grd.addColorStop(0, '#2a3a8a'); grd.addColorStop(0.6, '#7ab0e8'); grd.addColorStop(1, '#bfe4ff');
    g.fillStyle = grd; g.fillRect(0, 0, 176, 132);
    // 遠くの しろ
    g.fillStyle = '#c8d8f0';
    for (const [x, w, hh] of [[120, 10, 34], [132, 8, 44], [142, 10, 30], [112, 8, 24]]) g.fillRect(x, 92 - hh, w, hh);
    g.fillStyle = '#e04a5a';
    for (const [x, w, hh] of [[120, 10, 34], [132, 8, 44], [142, 10, 30], [112, 8, 24]]) { g.beginPath(); g.moveTo(x - 1, 92 - hh); g.lineTo(x + w / 2, 84 - hh); g.lineTo(x + w + 1, 92 - hh); g.fill(); }
    g.fillStyle = '#4a9a4a'; g.fillRect(0, 92, 176, 40);
    g.fillStyle = '#3a8a3a';
    for (let x = 0; x < 176; x += 14) { g.beginPath(); g.arc(x + 7, 94, 9, Math.PI, 0); g.fill(); }
    for (let i = 0; i < 14; i++) { const x = (i * 37 + t * 0.2) % 176, y = (i * 23) % 50; g.fillStyle = `rgba(255,255,220,${0.4 + 0.4 * Math.sin(t / 15 + i)})`; g.fillRect(x, y, 1, 1); }
    // ロゴ
    g.textAlign = 'center';
    g.font = 'bold 19px "DotGothic16", monospace';
    const tw = g.measureText('モンスター・エコーズ').width;
    g.save();
    g.translate(88, 30);
    g.scale(Math.min(1, 164 / tw), 1);
    g.fillStyle = '#1a1030'; g.fillText('モンスター・エコーズ', 1, 1);
    g.fillStyle = '#ffd84a'; g.fillText('モンスター・エコーズ', 0, 0);
    g.restore();
    g.font = '9px "DotGothic16", monospace';
    g.fillStyle = '#fff'; g.fillText('〜 ルナフィアと ひかりのクリスタル 〜', 88, 44);
    const bob = Math.round(Math.sin(t / 12) * 1.5);
    g.drawImage(personSprite('hero', 'down', Math.floor(t / 20)), 58, 98, 24, 24);
    g.drawImage(monsterSprite('lumipon'), 78, 86 + bob, 32, 32);
    g.drawImage(monsterSprite('kogemaru'), 28, 88 - bob, 30, 30);
    g.drawImage(monsterSprite('yorufukuro'), 140, 56 + bob * 2, 26, 26);
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
    await app.say(['よく きた、' + name + '。', 'ゆがみは たびのとびらの むこうで モンスターたちを くるしめておる。', 'これは わしが そだてた ルミポンと、リリィが そだてた コゲマルじゃ。いっしょに つれていきなさい。'], { speaker: 'モンスターはかせ' });
    sfx('recruit');
    await app.say('ルミポン と コゲマル が なかまに なった！');
    await app.say(['やせいの モンスターに にくを なげてから たおすと、なかまに なってくれることが ある。', 'なかまを ふやし、そだて、配合して…ひかりの かけらを 3つ あつめてくるのじゃ！', 'まずは まちの きたの「たびのとびら」から はじまりのもりへ いってみなさい。'], { speaker: 'モンスターはかせ' });
    await app.saveNow();
    app.show(new FieldScreen(app));
  }
}

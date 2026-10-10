// 起動フロー（70章）と Game App：Input → GameCommand → Stage Runtime → Renderer / Audio
import { RAW_STAGES, STAGE_ORDER } from './content/index.js';
import { TUTORIAL } from './content/tutorial.js';
import { normalizeStage } from './engine/content.js';
import { validateStage } from './engine/validator.js';
import { StageRuntime } from './engine/runtime.js';
import { evalAll } from './engine/condition.js';
import { Renderer } from './game/render.js';
import { TouchInput } from './game/input.js';
import { Audio } from './game/audio.js';
import { SaveSystem } from './game/save.js';
import * as UI from './game/ui.js';
import { fmtTime, esc } from './game/util.js';

const $ = s => document.querySelector(s);
const APP_VERSION = '1.0.0';
const DIFF = {
  EASY: { hit: 1.5, hint: true, time: 1.3, focus: true, label: 'やさしい' },
  NORMAL: { hit: 1.2, hint: true, time: 1.0, focus: false, label: 'ふつう' },
  CLASSIC: { hit: 1.0, hint: false, time: 0.9, focus: false, label: 'クラシック' },
};

class Game {
  constructor() {
    this.version = APP_VERSION;
    this.canvas = $('#world');
    this.renderer = new Renderer(this.canvas);
    this.audio = new Audio();
    this.saves = new SaveSystem();
    this.stages = {};
    this.contentErrors = [];
    for (const id of STAGE_ORDER) this.stages[id] = normalizeStage(RAW_STAGES[id]);
    this.stages.T0 = normalizeStage(TUTORIAL);
    // リリースビルドでも起動時に軽い Content Validator を走らせる（重いグラフ解析は CI 側）
    for (const st of Object.values(this.stages)) {
      const { errors } = validateStage(st);
      if (errors.length) { this.contentErrors.push(...errors.map(e => st.id + ': ' + e)); console.error(st.id, errors); }
    }
    this.order = STAGE_ORDER;
    this.rt = null; this.stage = null;
    this.paused = false; this.pauseReason = null;
    this.lastFrame = performance.now();
    this.autosaveAt = 0;
    this.hintReadyAt = 0;
    this.replay = null;
    this.tutorialStep = 0;
    this.params = new URLSearchParams(location.search);
    this.input = new TouchInput(this.canvas, {
      pan: (dx, dy) => { if (!this.rt) return; this.renderer.pan(dx, dy); this.tutorialSignal('pan'); this.camLog('PAN'); },
      pinch: (x, y, f) => { if (!this.rt) return; this.renderer.zoomAt(x, y, f); this.tutorialSignal('zoom'); this.camLog('ZOOM'); },
      tap: (x, y) => this.onTap(x, y),
      doubleTap: (x, y) => this.onDoubleTap(x, y),
      longPress: (x, y) => this.onLongPress(x, y),
      release: () => { this.renderer.labels = null; },
    });
    this.bindUi();
    this.bindLifecycle();
    this.resize();
    requestAnimationFrame(t => this.frame(t));
    this.boot();
  }

  async boot() {
    this.progress = await this.saves.loadProgress();
    if (this.params.has('debug')) this.progress.settings.debug = true;
    this.applySettings();
    this.pendingRun = await this.saves.loadRun();
    if (this.pendingRun && !this.stages[this.pendingRun.stageId]) this.pendingRun = null;
    UI.showTitle(this);
    if (this.params.get('stage') && this.progress.settings.debug) this.startStage(this.params.get('stage'));
  }

  get settings() { return this.progress.settings; }
  get diff() { return DIFF[this.settings.difficulty] || DIFF.NORMAL; }
  saveProgress() { return this.saves.saveProgress(this.progress); }

  applySettings() {
    const s = this.settings;
    const r = this.renderer;
    r.settings.fontPx = { S: 13, M: 15, L: 19 }[s.fontSize] || 15;
    r.settings.reducedMotion = s.reducedMotion; r.settings.reducedFlash = s.reducedFlash; r.settings.highContrast = s.highContrast;
    r.zoomCap = s.zoomCap;
    this.input.opts = { longPress: s.longPress, doubleTap: s.doubleTap, sensitivity: s.camSensitivity };
    this.audio.setVolumes(s.bgm, s.se);
    document.body.classList.toggle('hc', s.highContrast);
    document.body.classList.toggle('big-text', s.fontSize === 'L');
    $('#debugBtn').classList.toggle('hidden', !s.debug);
    if (this.stage) this.renderer.clampCam();
  }

  // ── ブラウザのライフサイクル（97.5/98.5） ──
  bindLifecycle() {
    const onResize = () => this.resize();
    window.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', () => { this.resize(); if (this.rt && !this.rt.ended) this.pause('rotate'); });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.rt && !this.rt.ended) { this.pause('hidden'); this.autosave(true); }
        this.audio.suspend();
      } else this.audio.resume();
    });
    window.addEventListener('pagehide', () => this.autosave(true));
    document.addEventListener('gesturestart', e => e.preventDefault());
    document.addEventListener('dblclick', e => e.preventDefault());
  }
  resize() {
    const r = $('#view').getBoundingClientRect();
    this.renderer.resize(Math.max(1, Math.round(r.width)), Math.max(1, Math.round(r.height)), window.devicePixelRatio || 1);
  }
  viewRect() { return $('#view').getBoundingClientRect(); }

  bindUi() {
    $('#pauseBtn').addEventListener('click', () => { this.audio.unlock(); this.pause('menu'); });
    $('#hintBtn').addEventListener('click', () => this.useHint());
    $('#cardDiscard').addEventListener('click', e => { e.stopPropagation(); if (this.rt) { this.rt.discard(); this.updateCard(); } });
    $('#debugBtn').addEventListener('click', () => UI.showDebug(this));
    $('#zoomBtn').addEventListener('click', () => this.toggleOverview());
    document.addEventListener('pointerdown', () => this.audio.unlock(), { capture: true });
  }

  // ── ステージ開始（71章 初期化順） ──
  startStage(id, opts = {}) {
    const stage = this.stages[id];
    if (!stage) return;
    this.audio.unlock();
    this.stage = stage;
    const timeMul = this.diff.time * (this.settings.extendedTimer ? 1.5 : 1);
    const seed = opts.seed ?? ((Date.now() ^ 0x5bd1e995) >>> 0);
    const rt = new StageRuntime(stage, { timeLimitMs: Math.round(stage.timeLimitMs * timeMul), seed });
    rt.state.seed = seed;
    this.rt = rt;
    this.wire(rt);
    if (opts.resume) { rt.restore(opts.resume.state); }
    this.replay = opts.replay || null;
    this.tutorialStep = 0;
    this.tutorialDone = new Set();
    this.hintReadyAt = 0;
    this.runStartDiscovered = new Set(Object.keys(this.progress.eventCollection).filter(k => k.startsWith(id + '-') && this.progress.eventCollection[k].discovered));
    UI.hideScreen();
    $('#hud').classList.remove('hidden');
    $('#stageName').textContent = (id === 'T0' ? '' : id.replace('S', 'STAGE ') + '  ') + stage.title;
    this.resize();
    this.renderer.setStage(stage, rt);
    if (opts.resume) this.renderer.cam = { ...this.renderer.cam, ...opts.resume.state.camera };
    this.lastCloseCam = null;
    $('#hintBtn').classList.toggle('hidden', !this.diff.hint || this.settings.hintLevel === 0 || !!this.replay);
    this.updateCard();
    this.updateTutorial();
    this.paused = false;
    rt.start();
    this.audio.startBgm(stage.bgm);
    this.audio.duck(false);
    if (!opts.resume && !this.replay) {
      this.banner(id === 'T0' ? 'れんしゅう' : 'スタート', stage.title);
      if (stage.intro) setTimeout(() => { if (this.rt === rt) this.toast(stage.intro, 4200); }, 1900);
      this.saves.saveRun(id, rt.serialize());
    }
    if (this.replay) this.toast('リプレイ再生中', 2500);
  }

  wire(rt) {
    const r = this.renderer;
    const delay = rt.opts.presentDelayMs;
    rt.on('speech', ({ actorId, speech, idle }) => r.speech(actorId, speech, { idle }));
    rt.on('capture', ({ sourceId }) => { this.audio.play('capture'); r.captureFx(sourceId); this.tutorialSignal('capture'); });
    rt.on('event', ({ event, durationMs, speech, forced }) => {
      r.react(event.targetId, event.animationId, forced ? 0 : delay);
      if (speech) setTimeout(() => r.speech(event.targetId, speech, { extra: 400 }), forced ? 100 : delay + 150);
      setTimeout(() => {
        this.audio.play(event.category === 'TERMINAL' ? 'fanfare' : event.category === 'TIMEOUT' ? 'timeout' : event.points >= 5 ? 'success' : 'surprise');
        if (event.points) this.scorePop(event);
      }, forced ? 0 : delay);
      if (event.soundId) setTimeout(() => this.audio.play(event.soundId), delay);
      if (event.focus && (this.diff.focus || event.category === 'TERMINAL' || event.category === 'TIMEOUT')) {
        const p = rt.pos(event.targetId);
        if (p) setTimeout(() => r.focus(p.x, p.y - 80, Math.max(r.cam.zoom, 1)), forced ? 0 : delay);
      }
      if (event.category !== 'TIMEOUT') this.recordDiscovery(event);
      this.tutorialSignal('event');
      this.autosave(true);
    });
    rt.on('reaction', ({ targetId, speech, animationId }) => {
      r.react(targetId, animationId, delay);
      if (speech) setTimeout(() => r.speech(targetId, speech), delay + 150);
      setTimeout(() => this.audio.play('pop'), delay);
    });
    rt.on('noEffect', ({ targetId }) => {
      r.react(targetId, 'react.nothing', delay);
      setTimeout(() => this.audio.play('nothing'), delay);
    });
    rt.on('anim', ({ actorId, animationId }) => r.react(actorId, animationId));
    rt.on('fx', fx => {
      if (fx.type === 'FX') r.addFx(fx.kind, fx.at ? r.anchor(fx.at) : { x: fx.x, y: fx.y });
      else if (fx.type === 'PLAY_SOUND' || fx.type === 'PLAY_MUSIC_STING') this.audio.play(fx.soundId);
      else if (fx.type === 'CAMERA_FOCUS' && this.diff.focus) r.focus(fx.x, fx.y, fx.zoom);
    });
    rt.on('end', ({ result }) => this.onEnd(result));
  }

  // ── 入力 → GameCommand（72章 判定の優先順位） ──
  onTap(x, y) {
    const rt = this.rt;
    if (!rt || this.paused || this.replay) return false;
    this.audio.unlock();
    const picks = this.renderer.pick(x, y, this.diff.hit);
    if (!picks.length) return false;
    const zoom = this.renderer.cam.zoom;
    if (rt.state.capturedSourceId) {
      const tgt = picks.find(p => rt.isTargetable(p.id));
      if (tgt) { this.sendTo(tgt.id); return true; }
    }
    for (const p of picks) {
      const c = rt.canCapture(p.id, zoom);
      if (c.ok) {
        rt.capture(p.id, zoom);
        this.updateCard(true);
        return true;
      }
      if (c.reason === 'ZOOM') { this.toast('もっと近づいて見てみよう'); return true; }
      if (c.reason === 'USED') { this.toast('いまは撮れない'); return true; }
      if (c.reason === 'LOCKED') return true;
    }
    return false;
  }
  sendTo(targetId) {
    const rt = this.rt;
    const card = $('#cardBtn').getBoundingClientRect(), vr = this.viewRect();
    const src = rt.state.capturedSourceId;
    const res = rt.send(targetId);
    if (res.type === 'INPUT_CONSUMED') { this.toast('いまは手がはなせないみたい'); return; }
    if (res.type === 'NOT_TARGET' || res.type === 'NO_CARD' || res.type === 'ENDED') return;
    this.audio.play('send');
    this.renderer.flyCard({ x: card.left + card.width / 2 - vr.left, y: card.top + card.height / 2 - vr.top }, targetId, null, src);
    this.updateCard();
  }
  onDoubleTap(x, y) {
    if (!this.rt) return;
    const r = this.renderer;
    const p = r.screenToWorld(x, y);
    const target = r.cam.zoom >= r.maxZoom(r.zoomCap) * 0.8 ? 1 : Math.min(r.maxZoom(r.zoomCap), r.cam.zoom * 2);
    r.focus(p.x, p.y, target, 350);
    this.tutorialSignal('zoom');
  }
  onLongPress(x, y) {
    if (!this.rt || !this.settings.longPress) return;
    const picks = this.renderer.pick(x, y, this.diff.hit);
    if (!picks.length) return;
    const id = picks[0].id;
    const e = this.rt.entity(id);
    const has = this.rt.state.capturedSourceId;
    const hint = has && this.rt.isTargetable(id) ? '（タップで画像を送る）' : e.capturable ? '（タップで撮る）' : '';
    this.renderer.labels = { id, text: e.name + hint };
  }
  camLog(type) {
    const now = performance.now();
    if (now - (this._camLogAt || 0) < 1000 || !this.rt) return;
    this._camLogAt = now;
    const c = this.renderer.cam;
    this.rt.log({ type, camera: { x: Math.round(c.x), y: Math.round(c.y), zoom: +c.zoom.toFixed(2) } });
  }

  // ── ヒント（30章） ──
  useHint() {
    const rt = this.rt;
    if (!rt || this.paused || !rt.playing) return;
    const now = performance.now();
    if (now < this.hintReadyAt) { this.toast('もう少し自分で探してみよう'); return; }
    const ev = rt.hintCandidate();
    rt.log({ type: 'HINT', resultEventId: ev ? ev.id : null });
    this.hintReadyAt = now + (rt.stage.hintConfig.cooldownMs || 12000);
    this.audio.play('hint');
    if (!ev) { this.toast('いまは、みんなの様子を見てみよう…'); return; }
    const cap = this.settings.hintLevel;
    const lv = Math.min(cap, (rt.state.hintLevel[ev.id] || 0) + 1);
    rt.state.hintLevel[ev.id] = lv;
    const r = this.renderer;
    // Lv1：対象人物が短く反応し、いま言える手がかりをつぶやく
    const tgt = rt.stage.actors[ev.targetId];
    if (tgt) {
      r.react(ev.targetId, 'react.think');
      const ctx = rt.ctx();
      const lines = tgt.idle.filter(l => evalAll(l.when, ctx));
      const line = lines.filter(l => l.when.length).pop() || lines[0];
      if (line) r.speech(ev.targetId, rt.stage.speeches[line.speechId]);
    }
    const tp = rt.pos(ev.targetId);
    // Lv2：関連領域を画面外に軽く示す / Lv3：候補 Source を短時間光らせる
    r.setHint({ region: lv >= 2 && tp ? { x: tp.x, y: tp.y - 60 } : null, source: lv >= 3 ? ev.sourceId : null });
    this.toast(['', '💡 誰かが反応したみたい', '💡 あっちのほうが気になる…', '💡 光っている物に注目！'][lv]);
  }

  // ── 時間・描画ループ ──
  frame(now) {
    const dt = Math.min(100, now - this.lastFrame);
    this.lastFrame = now;
    if (this.rt) {
      if (!this.paused) {
        if (this.replay) this.stepReplay();
        this.rt.update(dt);
        this.input.step(dt);
      }
      this.renderer.draw(now, dt);
      this.updateHud();
      if (!this.paused && this.rt.playing && now > this.autosaveAt) this.autosave();
      if (!$('#inspector').classList.contains('hidden') && now - (this._inspAt || 0) > 250) { this._inspAt = now; UI.renderInspector(this); }
    } else {
      this.renderer.draw(now, dt);
    }
    requestAnimationFrame(t => this.frame(t));
  }

  autosave(force) {
    if (!this.rt || this.replay || this.stage.id === 'T0') return;
    if (!force && performance.now() < this.autosaveAt) return;
    this.autosaveAt = performance.now() + 30000; // 41.1：30 秒ごと
    if (this.rt.ended || this.rt.state.status === 'ENDING') return;
    this.saves.saveRun(this.stage.id, this.rt.serialize());
  }

  pause(reason) {
    if (!this.rt || this.rt.ended) return;
    // クラシック（原作準拠）ではメニュー中も時間が進む。ただしバックグラウンドと回転時は必ず止める
    this.paused = !(reason === 'menu' && this.settings.difficulty === 'CLASSIC');
    this.pauseReason = reason;
    this.audio.duck(true);
    this.input.inertia = null;
    UI.showPause(this);
  }
  resume() {
    this.paused = false; this.pauseReason = null;
    this.audio.duck(false);
    this.lastFrame = performance.now();
    UI.hideScreen();
  }
  leaveStage(toTitle) {
    if (this.rt && !this.rt.ended && !this.replay && this.stage.id !== 'T0') { this.rt.abort(); }
    this.saves.clearRun();
    this.pendingRun = null;
    this.rt = null; this.stage = null; this.replay = null;
    this.audio.stopBgm();
    $('#hud').classList.add('hidden');
    $('#tutorialBar').classList.add('hidden');
    $('#inspector').classList.add('hidden');
    if (toTitle) UI.showTitle(this); else UI.showStageSelect(this);
  }

  updateHud() {
    const rt = this.rt;
    const ms = rt.remainingMs;
    const t = $('#timer');
    const txt = this.stage.id === 'T0' ? 'れんしゅう' : fmtTime(ms);
    const em = t.querySelector('em');
    if (em.textContent !== txt) em.textContent = txt;
    t.querySelector('i').style.width = (this.stage.id === 'T0' ? 100 : Math.max(0, ms / rt.state.timeLimitMs * 100)) + '%';
    t.classList.toggle('low', ms < 30000 && rt.playing && this.stage.id !== 'T0');
    const n = String(Math.min(999, [...rt.state.completedEvents].filter(id => id !== this.stage.timeoutEventId).length)).padStart(3, '0');
    if (this._digits !== n) { this._digits = n; $('#count').querySelectorAll('b').forEach((b, i) => { b.textContent = n[i]; }); }
    const sc = rt.state.score + '点';
    if ($('#score').textContent !== sc) $('#score').textContent = sc;
    const ready = performance.now() >= this.hintReadyAt;
    $('#hintBtn').disabled = !ready;
    if (rt.state.capturedSourceId !== this._shownCard) this.updateCard();
  }
  updateCard(pop) {
    const rt = this.rt;
    const id = rt && rt.state.capturedSourceId;
    this._shownCard = id;
    const card = $('#card');
    const cv = $('#cardThumb');
    const ctx = cv.getContext('2d');
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, cv.width, cv.height);
    card.classList.toggle('empty', !id);
    $('#cardDiscard').classList.toggle('hidden', !id);
    if (id) {
      this.renderer.drawThumbInto(ctx, id, cv.width / 2, cv.height / 2, cv.width * 0.92);
      $('#cardLabel').textContent = rt.entity(id).name;
      if (pop) { card.classList.remove('pop'); void card.offsetWidth; card.classList.add('pop'); }
    } else $('#cardLabel').textContent = '';
  }
  // 全体を見る ⇄ さっきの場所にもどる
  toggleOverview() {
    const r = this.renderer;
    if (!this.rt) return;
    const minZ = r.minZoom();
    if (r.cam.zoom > minZ * 1.15) {
      this.lastCloseCam = { ...r.cam };
      r.focus(this.stage.world.width / 2, this.stage.world.height / 2, minZ, 500);
    } else if (this.lastCloseCam) {
      r.focus(this.lastCloseCam.x, this.lastCloseCam.y, this.lastCloseCam.zoom, 500);
    } else {
      const sc = this.stage.world.spawnCamera;
      r.focus(sc.x, sc.y, Math.max(minZ * 2.5, sc.zoom || 1), 500);
    }
  }
  banner(big, sub) {
    const b = $('#banner');
    b.innerHTML = `<div class="big1">${esc(big)}</div>${sub ? `<div class="sub1">${esc(sub)}</div>` : ''}`;
    b.classList.remove('hidden');
    clearTimeout(this._bannerT);
    this._bannerT = setTimeout(() => b.classList.add('hidden'), 1800);
  }
  scorePop(ev) {
    const p = this.rt.pos(ev.targetId);
    if (!p) return;
    const vr = this.viewRect();
    const s0 = this.renderer.worldToScreen(p.x, p.y - 160);
    const s = { x: s0.x + vr.left, y: s0.y + vr.top };
    const el = document.createElement('div');
    el.className = 'scorepop';
    el.textContent = '+' + ev.points;
    el.style.left = Math.max(10, Math.min(innerWidth - 60, s.x)) + 'px';
    el.style.top = Math.max(60, s.y) + 'px';
    $('#app').appendChild(el);
    setTimeout(() => el.remove(), 1200);
  }
  toast(text, ms = 1600) {
    const t = $('#toast');
    t.textContent = text; t.classList.add('show');
    clearTimeout(this._toastT);
    this._toastT = setTimeout(() => t.classList.remove('show'), ms);
  }

  // ── 図鑑（28章）：GlobalProgress に記録。StageRunState とは分ける ──
  recordDiscovery(ev) {
    const col = this.progress.eventCollection;
    const e = col[ev.id] || { eventId: ev.id, discovered: false, completedCount: 0, firstDiscoveredAt: null, bestRouteScoreContribution: 0 };
    if (!e.discovered) { e.discovered = true; e.firstDiscoveredAt = Date.now(); }
    e.completedCount++;
    e.bestRouteScoreContribution = Math.max(e.bestRouteScoreContribution, ev.points);
    col[ev.id] = e;
    if (this.stage.id !== 'T0' && !this.replay) this.saveProgress();
  }

  // ── ステージ終了（146章 Stage Clear の Transaction） ──
  onEnd(result) {
    const rt = this.rt, st = this.stage;
    if (!rt || result === 'ABORTED') return;
    this.audio.stopBgm();
    const p = this.progress;
    const isTut = st.id === 'T0';
    const newly = [...rt.state.completedEvents].filter(id => !this.runStartDiscovered.has(id) && id !== st.timeoutEventId);
    let unlocked = null;
    if (!this.replay) {
      if (isTut) p.tutorialDone = true;
      else {
        p.bestScores[st.id] = Math.max(p.bestScores[st.id] || 0, rt.state.score);
        if (result === 'CLEAR') {
          if (!p.completedStages.includes(st.id)) p.completedStages.push(st.id);
          const next = this.order[this.order.indexOf(st.id) + 1];
          if (next && !p.unlockedStages.includes(next)) { p.unlockedStages.push(next); unlocked = next; }
        }
      }
      this.saveProgress();
      this.saves.clearRun();
      this.lastRun = { stageId: st.id, seed: rt.state.seed, actionLog: rt.state.actionLog.slice(), timeLimitMs: rt.state.timeLimitMs };
    }
    setTimeout(() => {
      if (this.rt !== rt) return;
      $('#hud').classList.add('hidden');
      $('#tutorialBar').classList.add('hidden');
      UI.showResult(this, { result, rt, stage: st, newly, unlocked, isTut, replay: !!this.replay });
      if (result === 'CLEAR') this.audio.play('fanfare');
    }, 700);
  }

  // ── リプレイ（29章）：操作ログを同じ seed のランに時刻どおり流し込む ──
  startReplay() {
    const lr = this.lastRun;
    if (!lr) return;
    const entries = lr.actionLog.filter(e => e.type === 'CAPTURE' || e.type === 'TARGET');
    this.startStage(lr.stageId, { seed: lr.seed, replay: { entries, i: 0 } });
    this.rt.state.timeLimitMs = lr.timeLimitMs;
  }
  stepReplay() {
    const rp = this.replay, rt = this.rt;
    while (rp.i < rp.entries.length && rt.state.worldTimeMs >= rp.entries[rp.i].t) {
      const e = rp.entries[rp.i++];
      if (e.type === 'CAPTURE') { rt.capture(e.sourceId); const p = rt.pos(e.sourceId); if (p) this.renderer.focus(p.x, p.y - 60, this.renderer.cam.zoom, 400); this.updateCard(true); }
      else if (e.type === 'TARGET') this.sendTo(e.targetId);
    }
  }

  // ── チュートリアル（52章） ──
  tutorialSignal(kind) {
    if (!this.stage || !this.stage.tutorial) return;
    this.tutorialDone ||= new Set();
    if (kind === 'event' && this.rt.state.completedEvents.has(this.stage.clearEventId)) this.tutorialDone.add('clear');
    if (this.tutorialDone.has(kind)) return;
    this.tutorialDone.add(kind);
    const tut = this.stage.tutorial;
    const before = this.tutorialStep;
    while (this.tutorialStep < tut.length && this.tutorialDone.has(tut[this.tutorialStep].done)) this.tutorialStep++;
    if (this.tutorialStep !== before) { this.audio.play('pop'); this.updateTutorial(); }
  }
  updateTutorial() {
    const bar = $('#tutorialBar');
    const tut = this.stage && this.stage.tutorial;
    if (!tut || this.tutorialStep >= tut.length) { bar.classList.add('hidden'); return; }
    bar.classList.remove('hidden');
    bar.textContent = `${this.tutorialStep + 1}/${tut.length}　${tut[this.tutorialStep].text}`;
  }

  // ── デバッグ（44/100章） ──
  playEvent(id) { UI.playEvent(this, id); }
}

window.game = new Game();

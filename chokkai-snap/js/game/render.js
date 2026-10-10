// Camera / World Renderer / Actor Renderer / Speech Balloon / FX（仕様 6/25/26/35/36/37/74/75 章）
import { ANIMATIONS } from '../engine/animations.js';
import { PROPS, EMOJI_PROPS, drawEmojiProp, shade } from './props.js';

const SKIN = '#f2c9a0';
export const VIEW_UNITS = 900; // ズーム 1.0 で画面縦に映るワールド px

// ── 絵文字キャッシュ（毎フレームのテキスト描画を避ける） ──
const emojiCache = new Map();
function emojiCanvas(e, px) {
  const b = Math.max(8, Math.min(512, Math.ceil(px / 6) * 6));
  const key = e + '|' + b;
  let c = emojiCache.get(key);
  if (c) return c;
  if (emojiCache.size > 600) emojiCache.clear();
  c = document.createElement('canvas');
  c.width = c.height = Math.ceil(b * 1.3);
  const x = c.getContext('2d');
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = `${b}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
  x.fillText(e, c.width / 2, c.height / 2 + b * 0.05);
  emojiCache.set(key, c);
  return c;
}
export function drawEmoji(ctx, e, x, y, size, pxScale, opts = {}) {
  if (EMOJI_PROPS[e] && !opts.raw) {
    ctx.save();
    if (opts.alpha != null) ctx.globalAlpha *= opts.alpha;
    if (opts.rot) { ctx.translate(x, y); ctx.rotate(opts.rot); ctx.translate(-x, -y); }
    drawEmojiProp(ctx, e, x, y, size, opts.flip);
    ctx.restore();
    return;
  }
  const c = emojiCanvas(e, size * pxScale);
  const s = size * 1.3;
  ctx.save();
  ctx.translate(x, y);
  if (opts.rot) ctx.rotate(opts.rot);
  if (opts.flip) ctx.scale(-1, 1);
  if (opts.alpha != null) ctx.globalAlpha *= opts.alpha;
  ctx.drawImage(c, -s / 2, -s / 2, s, s);
  ctx.restore();
}

function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.w = 1; this.h = 1; this.dpr = 1;
    this.cam = { x: 0, y: 0, zoom: 1 };
    this.camAnim = null;
    this.fx = [];
    this.bubbles = new Map();   // actorId → bubble
    this.reacts = new Map();    // actorId → { clips, t0, dur }
    this.flights = [];
    this.overlays = [];
    this.flash = 0;
    this.shake = 0;
    this.hint = null;
    this.debug = { hitboxes: false, ids: false };
    this.settings = { fontPx: 15, reducedMotion: false, reducedFlash: false, highContrast: false };
    this.labels = null;
  }

  resize(w, h, dpr) {
    this.w = w; this.h = h; this.dpr = Math.min(dpr || 1, 2);
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    if (this.stage) this.clampCam();
  }

  setStage(stage, rt) {
    this.stage = stage; this.rt = rt;
    this.fx = []; this.bubbles.clear(); this.reacts.clear(); this.flights = []; this.overlays = []; this.hint = null;
    this.sceneryBoxes = stage.scenery.map(boxOf);
    // 開始時はステージ全体を一望する（俯瞰）
    this.cam = { x: stage.world.width / 2, y: stage.world.height / 2, zoom: 1 };
    this.cam.zoom = this.coverZoom();
    this.clampCam();
  }

  get base() { return Math.min(this.h / VIEW_UNITS, this.w / 700); }
  get scale() { return this.base * this.cam.zoom; }
  minZoom() {
    // 世界全体が画面に収まる倍率（contain）まで引ける
    const wd = this.stage.world;
    // 世界全体が入る倍率（contain）まで引ける。開始時は画面いっぱい（cover）
    return Math.min(this.w / (wd.width * this.base), this.h / (wd.height * this.base));
  }
  coverZoom() {
    const wd = this.stage.world;
    return Math.max(this.w / (wd.width * this.base), this.h / (wd.height * this.base));
  }
  maxZoom(cap) { return Math.min(this.stage.world.maxZoom, cap || 99); }
  worldToScreen(x, y) { const s = this.scale; return { x: (x - this.cam.x) * s + this.w / 2, y: (y - this.cam.y) * s + this.h / 2 }; }
  screenToWorld(x, y) { const s = this.scale; return { x: (x - this.w / 2) / s + this.cam.x, y: (y - this.h / 2) / s + this.cam.y }; }

  clampCam() {
    const wd = this.stage.world;
    this.cam.zoom = Math.max(this.minZoom(), Math.min(this.maxZoom(this.zoomCap), this.cam.zoom));
    const s = this.scale;
    const hw = this.w / 2 / s, hh = this.h / 2 / s;
    this.cam.x = wd.width < hw * 2 ? wd.width / 2 : Math.max(hw, Math.min(wd.width - hw, this.cam.x));
    this.cam.y = wd.height < hh * 2 ? wd.height / 2 : Math.max(hh, Math.min(wd.height - hh, this.cam.y));
  }
  pan(dx, dy) { const s = this.scale; this.cam.x -= dx / s; this.cam.y -= dy / s; this.camAnim = null; this.clampCam(); }
  // 6.4 ズーム中心維持：指の下のワールド座標を不変に
  zoomAt(sx, sy, factor) {
    const before = this.screenToWorld(sx, sy);
    this.cam.zoom = Math.max(this.minZoom(), Math.min(this.maxZoom(this.zoomCap), this.cam.zoom * factor));
    const after = this.screenToWorld(sx, sy);
    this.cam.x += before.x - after.x; this.cam.y += before.y - after.y;
    this.camAnim = null;
    this.clampCam();
  }
  // 36章 カメラ演出：easeOutCubic
  focus(x, y, zoom, dur = 550) {
    if (this.settings.reducedMotion) dur = 0;
    this.camAnim = { from: { ...this.cam }, to: { x, y, zoom: zoom ?? this.cam.zoom }, t0: performance.now(), dur };
  }
  _stepCam(now) {
    const a = this.camAnim;
    if (!a) return;
    const k = a.dur ? Math.min(1, (now - a.t0) / a.dur) : 1;
    const e = 1 - Math.pow(1 - k, 3);
    this.cam.x = a.from.x + (a.to.x - a.from.x) * e;
    this.cam.y = a.from.y + (a.to.y - a.from.y) * e;
    this.cam.zoom = a.from.zoom + (a.to.zoom - a.from.zoom) * e;
    this.clampCam();
    if (k >= 1) this.camAnim = null;
  }

  // ── 当たり判定（72/73章・Spatial Hash 27.2） ──
  entityBox(id) {
    const st = this.stage, rt = this.rt;
    const a = st.actors[id];
    if (a) {
      const s = rt.state.actors[id];
      if (a.emoji) { const sz = (s.look && s.look.size) || a.size; return { x: s.x - sz / 2, y: s.y - sz, w: sz, h: sz }; }
      const L = { ...(a.look || {}), ...(s.look || {}) };
      const H = (L.h || 150) * (L.sit ? 0.8 : 1);
      const W = (L.h || 150) * (L.wide ? 0.56 : 0.46);
      return { x: s.x - W / 2, y: s.y - H, w: W, h: H };
    }
    const o = st.objects[id];
    const s = rt.state.objects[id];
    const L = s.look || {};
    if (o.sign || L.sign || (o.prop && o.w)) { const w = o.w || 100, h = o.h || 60; return { x: s.x - w / 2, y: s.y - h, w, h }; }
    const sz = L.size || o.size;
    return { x: s.x - sz / 2, y: s.y - sz, w: sz, h: sz };
  }
  buildHash() {
    const cell = 128;
    const map = new Map();
    const rt = this.rt;
    for (const id of [...Object.keys(this.stage.objects), ...Object.keys(this.stage.actors)]) {
      if (!rt.isVisible(id)) continue;
      const b = this.entityBox(id);
      for (let cx = Math.floor(b.x / cell); cx <= Math.floor((b.x + b.w) / cell); cx++)
        for (let cy = Math.floor(b.y / cell); cy <= Math.floor((b.y + b.h) / cell); cy++) {
          const k = cx + ',' + cy;
          if (!map.has(k)) map.set(k, []);
          map.get(k).push(id);
        }
    }
    return { cell, map };
  }
  // 画面座標 → 候補の entity（近い順）。hitScale：難易度によるヒットエリア倍率
  pick(sx, sy, hitScale = 1) {
    const p = this.screenToWorld(sx, sy);
    const hash = this.buildHash();
    const s = this.scale;
    const minHalf = 22 / s; // 画面で最低 44px 角（97.4）
    const seen = new Set();
    const out = [];
    const reach = Math.max(minHalf, 60);
    for (let cx = Math.floor((p.x - reach) / hash.cell); cx <= Math.floor((p.x + reach) / hash.cell); cx++)
      for (let cy = Math.floor((p.y - reach) / hash.cell); cy <= Math.floor((p.y + reach) / hash.cell); cy++)
        for (const id of hash.map.get(cx + ',' + cy) || []) {
          if (seen.has(id)) continue; seen.add(id);
          const b = this.entityBox(id);
          const isActor = !!this.stage.actors[id];
          const grow = isActor ? 1.15 : 1.6; // actor は見た目×1.15、小物は大きめの hitbox
          const hw = Math.max(minHalf, b.w / 2 * grow * hitScale), hh = Math.max(minHalf, b.h / 2 * grow * hitScale);
          const cx2 = b.x + b.w / 2, cy2 = b.y + b.h / 2;
          if (Math.abs(p.x - cx2) <= hw && Math.abs(p.y - cy2) <= hh) {
            const d = Math.hypot((p.x - cx2) / hw, (p.y - cy2) / hh);
            out.push({ id, d, area: b.w * b.h, actor: isActor });
          }
        }
    out.sort((a, b) => (a.d - b.d) || (a.area - b.area));
    return out;
  }

  // ── 演出の受け口 ──
  speech(actorId, speech, opts = {}) {
    if (!speech) return;
    this.bubbles.set(actorId, { text: speech.text.ja, type: speech.bubbleType, until: performance.now() + speech.durationMs + (opts.extra || 0), t0: performance.now(), idle: !!opts.idle });
  }
  react(actorId, animationId, delayMs = 0) {
    const clips = ANIMATIONS[animationId] || ANIMATIONS['react.shrug'];
    const dur = clips.reduce((s, c) => s + c.durationMs, 0);
    this.reacts.set(actorId, { clips, t0: performance.now() + delayMs, dur });
    for (const c of clips) if (c.type === 'FX') setTimeout(() => this.addFx(c.params.kind, this.anchor(actorId)), delayMs + 200);
  }
  anchor(id) {
    const p = this.rt.pos(id);
    if (!p) return null;
    const b = this.entityBox(id);
    return { x: p.x, y: b.y + b.h * 0.3 };
  }
  addFx(kind, at) {
    if (!at) return;
    const now = performance.now();
    const n = { sparkle: 10, hearts: 8, smoke: 14, steam: 16, fire: 16, splash: 16, confetti: 40, stars: 10, paper: 26, eruption: 60, lightning: 1, big: 50, zzz: 4, ink: 18, bubbles: 12, notes: 8, leaves: 14, flash: 0 }[kind] ?? 10;
    if (kind === 'flash' || kind === 'lightning' || kind === 'big' || kind === 'eruption') { if (!this.settings.reducedFlash) this.flash = kind === 'flash' ? 0.6 : 0.8; }
    if ((kind === 'big' || kind === 'eruption' || kind === 'lightning') && !this.settings.reducedMotion) this.shake = 1;
    if (kind === 'lightning') this.fx.push({ kind: 'bolt', x: at.x, y: at.y, t0: now, life: 600 });
    for (let i = 0; i < n; i++) {
      const r = (i * 9301 + 49297) % 233280 / 233280; // 決定的な散らし
      const r2 = (i * 4271 + 1123) % 1000 / 1000;
      const ang = r * Math.PI * 2;
      const sp = 60 + r2 * 200;
      const p = { kind, x: at.x + (r2 - 0.5) * 40, y: at.y + (r - 0.5) * 30, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 120, t0: now + (i % 6) * 40, life: 900 + r2 * 900, size: 16 + r * 22, hue: (i * 47) % 360 };
      if (kind === 'steam' || kind === 'smoke') { p.vx *= 0.3; p.vy = -80 - r2 * 120; p.life = 1600 + r2 * 1200; p.size = 30 + r * 50; }
      if (kind === 'eruption') { p.vx *= 0.6; p.vy = -350 - r2 * 450; p.life = 2200; p.size = 40 + r * 60; p.sub = i % 3 ? 'steam' : 'confetti'; }
      if (kind === 'fire') { p.vx *= 0.25; p.vy = -60 - r2 * 100; }
      if (kind === 'zzz' || kind === 'notes') { p.vx = 20 + r * 30; p.vy = -50; p.life = 1800; }
      if (kind === 'leaves') { p.vy = 30 + r2 * 60; }
      this.fx.push(p);
    }
  }
  flyCard(fromScreen, toId, label, entityId) {
    const to = this.anchor(toId);
    if (!to) return;
    const dur = this.settings.reducedMotion ? 150 : 420;
    this.flights.push({ from: fromScreen, toWorld: to, t0: performance.now(), dur, entityId });
  }
  captureFx(id) {
    const b = this.entityBox(id);
    this.overlays.push({ kind: 'reticle', x: b.x + b.w / 2, y: b.y + b.h / 2, r: Math.max(b.w, b.h) * 0.7, t0: performance.now(), life: 320 });
    if (!this.settings.reducedFlash) this.flash = Math.max(this.flash, 0.35);
  }
  setHint(h) { this.hint = h ? { ...h, t0: performance.now() } : null; }

  // ── 描画 ──
  draw(now, frameDt) {
    const ctx = this.ctx;
    const st = this.stage, rt = this.rt;
    this._stepCam(now);
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = '#3a3a40';
    ctx.fillRect(0, 0, this.w, this.h);
    if (!st) return;
    const s = this.scale;
    let shx = 0, shy = 0;
    if (this.shake > 0) { shx = Math.sin(now / 23) * 10 * this.shake; shy = Math.cos(now / 17) * 8 * this.shake; this.shake = Math.max(0, this.shake - frameDt / 900); }
    const ox = this.w / 2 - this.cam.x * s + shx, oy = this.h / 2 - this.cam.y * s + shy;
    const T = (m = 1) => ctx.setTransform(this.dpr * s * m, 0, 0, this.dpr * s * m, this.dpr * ox, this.dpr * oy);
    T();
    const view = { x: this.cam.x - this.w / 2 / s - 50, y: this.cam.y - this.h / 2 / s - 50, w: this.w / s + 100, h: this.h / s + 100 };
    ctx.fillStyle = st.world.bg;
    ctx.fillRect(0, 0, st.world.width, st.world.height);
    // 背景
    st.scenery.forEach((p, i) => { if (intersects(this.sceneryBoxes[i], view)) drawPrim(ctx, p, s); });
    // エンティティ（layer → y ソート）
    const ents = [];
    for (const id of Object.keys(st.objects)) if (rt.isVisible(id)) { const o = rt.state.objects[id]; const d = st.objects[id]; ents.push({ id, y: d.z != null ? d.z + (o.y - d.y) : o.y, layer: d.layer, kind: 'o' }); }
    for (const id of Object.keys(st.actors)) if (rt.isVisible(id)) { const a = rt.state.actors[id]; const d = st.actors[id]; ents.push({ id, y: d.z != null && !a.path && a.x === d.x && a.y === d.y ? d.z : a.y, layer: d.layer, kind: 'a' }); }
    ents.sort((a, b) => (a.layer - b.layer) || (a.y - b.y));
    for (const e of ents) {
      const b = this.entityBox(e.id);
      if (!intersects(b, view)) continue;
      if (e.kind === 'o') this.drawObject(ctx, e.id, s, now);
      else this.drawActor(ctx, e.id, s, now);
    }
    // ヒント Lv3：Source のきらめき
    if (this.hint && this.hint.source && now - this.hint.t0 < 3500) {
      const b = rt.isVisible(this.hint.source) && this.entityBox(this.hint.source);
      if (b) {
        const k = (now - this.hint.t0) / 300;
        ctx.strokeStyle = `rgba(255,240,120,${0.5 + 0.5 * Math.sin(k)})`;
        ctx.lineWidth = 6 / s;
        ctx.beginPath(); ctx.arc(b.x + b.w / 2, b.y + b.h / 2, Math.max(b.w, b.h) * 0.8 + Math.sin(k) * 6, 0, Math.PI * 2); ctx.stroke();
        drawEmoji(ctx, '✨', b.x + b.w, b.y, 30, s);
      }
    }
    this.drawFx(ctx, now, frameDt, s);
    // オーバーレイ（取り込みのレティクル）
    this.overlays = this.overlays.filter(o => now - o.t0 < o.life);
    for (const o of this.overlays) {
      const k = (now - o.t0) / o.life;
      ctx.strokeStyle = `rgba(255,255,255,${1 - k})`;
      ctx.lineWidth = 4 / s;
      const r = o.r * (1.4 - 0.4 * k);
      ctx.beginPath(); ctx.arc(o.x, o.y, r, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(o.x - r * 1.2, o.y); ctx.lineTo(o.x - r * 0.6, o.y); ctx.moveTo(o.x + r * 0.6, o.y); ctx.lineTo(o.x + r * 1.2, o.y);
      ctx.moveTo(o.x, o.y - r * 1.2); ctx.lineTo(o.x, o.y - r * 0.6); ctx.moveTo(o.x, o.y + r * 0.6); ctx.lineTo(o.x, o.y + r * 1.2); ctx.stroke();
    }
    if (this.debug.hitboxes || this.debug.ids) this.drawDebug(ctx, s);
    // ── 画面座標 ──
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.drawBubbles(ctx, now);
    this.drawFlights(ctx, now);
    this.drawHintArrow(ctx, now);
    if (this.labels) this.drawLabel(ctx);
    if (this.flash > 0) { ctx.fillStyle = `rgba(255,255,255,${this.flash})`; ctx.fillRect(0, 0, this.w, this.h); this.flash = Math.max(0, this.flash - frameDt / 250); }
  }

  drawObject(ctx, id, s, now) {
    const def = this.stage.objects[id];
    const o = this.rt.state.objects[id];
    const L = o.look || {};
    if (def.prop && !L.emoji && !L.sign) {
      const fn = PROPS[def.prop];
      if (fn) { ctx.save(); if (L.flip || def.propOpts.flip) { ctx.translate(o.x, 0); ctx.scale(-1, 1); ctx.translate(-o.x, 0); } fn(ctx, o.x, o.y, L.size || def.size, { ...def.propOpts, ...(L.propOpts || {}) }); ctx.restore(); }
      return;
    }
    const sign = L.sign || def.sign;
    if (sign) {
      const w = def.w || 100, h = def.h || 60;
      ctx.fillStyle = sign.fill || '#fff';
      ctx.strokeStyle = 'rgba(0,0,0,.55)'; ctx.lineWidth = Math.max(2, 4 / s);
      rr(ctx, o.x - w / 2, o.y - h, w, h, 6); ctx.fill(); ctx.stroke();
      if (sign.text) {
        ctx.fillStyle = sign.color || '#222';
        ctx.font = `bold ${sign.s || 22}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        wrapText(ctx, sign.text, o.x, o.y - h / 2, w - 10, (sign.s || 22) * 1.15);
      }
      return;
    }
    const sz = L.size || def.size;
    const bob = o.state === 'MOVING' ? Math.sin(now / 90) * 3 : 0;
    drawEmoji(ctx, L.emoji || def.emoji, o.x, o.y - sz / 2 + bob, sz, s, { rot: L.rot ?? def.rot });
  }

  // 反応クリップの現在値
  reactNow(id, now) {
    const r = this.reacts.get(id);
    if (!r) return null;
    const t = now - r.t0;
    if (t < 0) return null;
    if (t > r.dur + 200) { this.reacts.delete(id); return null; }
    let acc = 0;
    for (const c of r.clips) {
      if (t < acc + c.durationMs && c.type === 'EMOTE') return { ...c.params, k: (t - acc) / c.durationMs, t };
      acc += c.durationMs;
    }
    const em = r.clips.find(c => c.type === 'EMOTE');
    return em ? { ...em.params, k: 1, t, tail: true } : null;
  }

  drawActor(ctx, id, s, now) {
    const def = this.stage.actors[id];
    const a = this.rt.state.actors[id];
    const R = this.reactNow(id, now);
    const face = R ? R.face : stateFace(a.state);
    let body = R && !R.tail ? R.body : 'none';
    const moving = !!a.path;
    const t = now / 1000;
    ctx.save();
    ctx.translate(a.x, a.y);
    let dy = 0, rot = 0, sx = 1, sy = 1, dx = 0;
    const k = R ? R.k : 0;
    if (!this.settings.reducedMotion) {
      if (body === 'jump') dy = -Math.abs(Math.sin(k * Math.PI)) * 40;
      if (body === 'bounce') dy = -Math.abs(Math.sin(k * Math.PI * 3)) * 18;
      if (body === 'shake') dx = Math.sin(t * 60) * 6;
      if (body === 'tremble') dx = Math.sin(t * 90) * 3;
      if (body === 'spin') sx = Math.cos(k * Math.PI * 4);
      if (body === 'fall') rot = Math.min(1, k * 3) * (a.facing === 'LEFT' ? -1.3 : 1.3);
      if (body === 'droop') { sy = 1 - 0.12 * Math.sin(Math.min(1, k * 2) * Math.PI / 2); }
      if (body === 'grow') { const g = 1 + 0.2 * Math.sin(k * Math.PI); sx = sy = g; }
      if (body === 'nod') dy = Math.sin(k * Math.PI * 4) * 4;
      if (body === 'eat') dy = Math.sin(t * 20) * 3;
      if (moving && !body) dy = -Math.abs(Math.sin(t * 10)) * 4;
    }
    // 影
    const shW = def.emoji ? (a.look?.size || def.size) * 0.4 : ((def.look?.h || 150) * (def.look?.wide ? 0.3 : 0.2));
    ctx.fillStyle = 'rgba(0,0,0,.18)';
    ctx.beginPath(); ctx.ellipse(0, 0, shW, shW * 0.28, 0, 0, Math.PI * 2); ctx.fill();
    ctx.translate(dx, dy);
    ctx.rotate(rot);
    ctx.scale(sx, sy);
    let headTop;
    if (def.emoji) {
      const sz = a.look?.size || def.size;
      const hop = moving && !this.settings.reducedMotion ? -Math.abs(Math.sin(t * 12)) * sz * 0.08 : 0;
      const em = a.look?.emoji || def.emoji;
      drawEmoji(ctx, em, 0, -sz / 2 + hop, sz, s, { flip: EMOJI_PROPS[em] ? a.facing === 'LEFT' : a.facing === 'RIGHT' });
      if (a.state === 'ANGRY' || a.state === 'SCARED' || a.state === 'HAPPY') drawEmoji(ctx, { ANGRY: '💢', SCARED: '💦', HAPPY: '♪' }[a.state], sz * 0.35, -sz * 0.9, sz * 0.3, s);
      headTop = -sz;
    } else {
      headTop = drawPerson(ctx, { ...(def.look || {}), ...(a.look || {}) }, a.facing, face, moving && !this.settings.reducedMotion ? t : null, body, k, s);
    }
    ctx.restore();
    // 感情アイコン
    const icon = R && !R.tail ? R.icon : null;
    if (icon) {
      const pop = Math.min(1, R.k * 4);
      const ix = a.x + dx + 20, iy = a.y + dy + headTop - 22;
      ctx.save();
      ctx.translate(ix, iy); ctx.scale(pop, pop);
      if (icon === '…' || icon === '‼' || icon === '♪') {
        ctx.fillStyle = '#fff'; ctx.strokeStyle = '#333'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = icon === '‼' ? '#e33' : '#333'; ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(icon, 0, icon === '…' ? -4 : 1);
      } else drawEmoji(ctx, icon, 0, 0, 40, s);
      ctx.restore();
    }
    a._headTop = headTop + dy;
  }

  drawFx(ctx, now, dt, s) {
    this.fx = this.fx.filter(p => now - p.t0 < p.life);
    for (const p of this.fx) {
      const age = (now - p.t0) / 1000;
      if (age < 0) continue;
      const k = age * 1000 / p.life;
      if (p.kind === 'bolt') {
        ctx.strokeStyle = `rgba(255,250,150,${1 - k})`; ctx.lineWidth = 10;
        ctx.beginPath(); let x = p.x, y = p.y - 900; ctx.moveTo(x, y);
        for (let i = 1; i <= 8; i++) { x = p.x + ((i * 37) % 7 - 3) * 18; y = p.y - 900 + i * 112; ctx.lineTo(x, y); }
        ctx.stroke(); continue;
      }
      const g = p.kind === 'confetti' || p.kind === 'paper' || p.kind === 'splash' || p.kind === 'ink' || p.kind === 'leaves' ? 420 : 0;
      const x = p.x + p.vx * age, y = p.y + p.vy * age + 0.5 * g * age * age;
      const alpha = 1 - k;
      const kind = p.sub || p.kind;
      ctx.globalAlpha = Math.max(0, alpha);
      switch (kind) {
        case 'steam': case 'smoke':
          ctx.fillStyle = kind === 'smoke' ? 'rgba(90,90,90,.5)' : 'rgba(255,255,255,.7)';
          ctx.beginPath(); ctx.arc(x, y, p.size * (0.6 + k), 0, Math.PI * 2); ctx.fill(); break;
        case 'confetti': case 'paper':
          ctx.fillStyle = kind === 'paper' ? '#fff' : `hsl(${p.hue},80%,60%)`;
          ctx.save(); ctx.translate(x, y); ctx.rotate(age * 8 + p.hue); ctx.fillRect(-p.size / 3, -p.size / 6, p.size * 0.66, p.size / 3); ctx.restore(); break;
        case 'splash': ctx.fillStyle = 'rgba(80,160,255,.8)'; ctx.beginPath(); ctx.arc(x, y, p.size / 4, 0, Math.PI * 2); ctx.fill(); break;
        case 'ink': ctx.fillStyle = 'rgba(20,20,30,.85)'; ctx.beginPath(); ctx.arc(x, y, p.size / 3, 0, Math.PI * 2); ctx.fill(); break;
        default: {
          const e = { sparkle: '✨', hearts: '💕', fire: '🔥', stars: '⭐', big: '💥', zzz: '💤', bubbles: '🫧', notes: '🎵', leaves: '🍃' }[kind] || '✨';
          drawEmoji(ctx, e, x, y, p.size, s);
        }
      }
      ctx.globalAlpha = 1;
    }
  }

  drawBubbles(ctx, now) {
    const fs = this.settings.fontPx;
    const placed = [];
    const list = [];
    for (const [id, b] of this.bubbles) {
      if (now > b.until) { this.bubbles.delete(id); continue; }
      if (!this.rt.isVisible(id)) continue;
      const a = this.rt.state.actors[id];
      const head = a.y + (a._headTop ?? -150);
      const p = this.worldToScreen(a.x, head);
      list.push({ id, b, p, a });
    }
    // 引きの画面では小さく見える人物の雑談は出さず、雑談は画面中央に近い 4 人までにする（吹き出しの洪水を防ぐ）
    const cx = this.w / 2, cy = this.h / 2;
    // 小さく見える人物は「…」の小さな吹き出しだけ（近づくと読める）
    for (const e of list) e.small = this.entityBox(e.id).h * this.scale < 40;
    const smalls = list.filter(e => e.small && e.p.x > -20 && e.p.x < this.w + 20 && e.p.y > -20 && e.p.y < this.h + 20);
    const smallIdle = smalls.filter(e => e.b.idle).sort((u, v) => v.b.t0 - u.b.t0).slice(0, 5);
    for (const e of [...smalls.filter(e => !e.b.idle), ...smallIdle]) {
      const pw = 26, ph = 15, x = e.p.x - pw / 2, y = e.p.y - ph - 7;
      ctx.fillStyle = 'rgba(255,255,255,.95)'; ctx.strokeStyle = 'rgba(60,50,60,.6)'; ctx.lineWidth = 1.2;
      rr(ctx, x, y, pw, ph, 7); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(e.p.x - 3, y + ph); ctx.lineTo(e.p.x, y + ph + 5); ctx.lineTo(e.p.x + 3, y + ph); ctx.fill();
      ctx.fillStyle = e.b.idle ? '#666' : '#e04848';
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(e.p.x + i * 6, y + ph / 2, 1.8, 0, Math.PI * 2); ctx.fill(); }
    }
    const idle = list.filter(e => e.b.idle && !e.small)
      .sort((u, v) => Math.hypot(u.p.x - cx, u.p.y - cy) - Math.hypot(v.p.x - cx, v.p.y - cy)).slice(0, 4);
    list.splice(0, list.length, ...list.filter(e => !e.b.idle && !e.small), ...idle);
    list.sort((u, v) => u.p.x - v.p.x);
    const offscreen = [];
    for (const { id, b, p } of list) {
      if (p.x < -40 || p.x > this.w + 40 || p.y < -40 || p.y > this.h + 60) { if (!b.idle) offscreen.push({ id, p }); continue; }
      ctx.font = `bold ${fs}px "Hiragino Maru Gothic ProN","Yu Gothic",sans-serif`;
      const maxW = Math.min(this.w * 0.42, fs * 13);
      const lines = wrapLines(ctx, b.text, maxW).slice(0, 3);
      const tw = Math.max(...lines.map(l => ctx.measureText(l).width), fs * 3);
      const bw = tw + fs * 1.2, bh = lines.length * fs * 1.35 + fs * 0.9 + fs * 0.9;
      let bx = Math.max(6, Math.min(this.w - bw - 6, p.x - bw / 2));
      let by = p.y - bh - 18;
      // 重なり回避（25.2）
      for (let tries = 0; tries < 6; tries++) {
        const hit = placed.find(r => bx < r.x + r.w && bx + bw > r.x && by < r.y + r.h && by + bh > r.y);
        if (!hit) break;
        by = hit.y - bh - 4;
      }
      const noTail = by < 70;
      by = Math.max(70, by);
      placed.push({ x: bx, y: by, w: bw, h: bh });
      const pop = Math.min(1, (now - b.t0) / 120);
      const fade = Math.min(1, (b.until - now) / 300);
      ctx.globalAlpha = fade;
      ctx.save();
      ctx.translate(bx + bw / 2, by + bh); ctx.scale(pop, pop); ctx.translate(-(bx + bw / 2), -(by + bh));
      const fill = b.type === 'SHOUT' ? '#fff6b0' : b.type === 'THOUGHT' ? '#eef4ff' : '#fff';
      ctx.fillStyle = fill; ctx.strokeStyle = this.settings.highContrast ? '#000' : '#444'; ctx.lineWidth = this.settings.highContrast ? 3 : 2;
      rr(ctx, bx, by, bw, bh, 10); ctx.fill(); ctx.stroke();
      // しっぽ
      const tx = Math.max(bx + 12, Math.min(bx + bw - 12, p.x));
      if (!noTail) {
      ctx.beginPath(); ctx.moveTo(tx - 7, by + bh - 1); ctx.lineTo(tx, Math.min(p.y - 4, by + bh + 14)); ctx.lineTo(tx + 7, by + bh - 1); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(tx - 7, by + bh); ctx.lineTo(tx, Math.min(p.y - 4, by + bh + 14)); ctx.lineTo(tx + 7, by + bh); ctx.stroke();
      }
      // 名前
      ctx.fillStyle = '#8a6a9a'; ctx.font = `bold ${Math.round(fs * 0.7)}px sans-serif`; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(this.stage.actors[id].name, bx + fs * 0.6, by + fs * 0.35);
      ctx.fillStyle = '#222'; ctx.font = `bold ${fs}px "Hiragino Maru Gothic ProN","Yu Gothic",sans-serif`;
      lines.forEach((l, i) => ctx.fillText(l, bx + fs * 0.6, by + fs * 1.2 + i * fs * 1.35));
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    // 画面外の発言は端に 💬 を出す（イベント後の手がかりを見逃さないため）
    for (const { p } of offscreen) {
      const x = Math.max(24, Math.min(this.w - 24, p.x)), y = Math.max(70, Math.min(this.h - 90, p.y));
      ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.beginPath(); ctx.arc(x, y, 18, 0, Math.PI * 2); ctx.fill();
      ctx.font = '20px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('💬', x, y + 1);
    }
  }

  drawFlights(ctx, now) {
    this.flights = this.flights.filter(f => now - f.t0 < f.dur + 250);
    for (const f of this.flights) {
      const k = Math.min(1, (now - f.t0) / f.dur);
      const to = this.worldToScreen(f.toWorld.x, f.toWorld.y);
      // 決定的なベジェ曲線（75章）
      const cx = (f.from.x + to.x) / 2, cy = Math.min(f.from.y, to.y) - 120;
      const x = (1 - k) * (1 - k) * f.from.x + 2 * (1 - k) * k * cx + k * k * to.x;
      const y = (1 - k) * (1 - k) * f.from.y + 2 * (1 - k) * k * cy + k * k * to.y;
      if (k < 1) {
        const sz = 56 * (1 - 0.5 * k);
        ctx.save(); ctx.translate(x, y); ctx.rotate(k * 6);
        ctx.fillStyle = '#fff'; ctx.strokeStyle = '#ff5fa2'; ctx.lineWidth = 3;
        rr(ctx, -sz / 2, -sz / 2, sz, sz, 8); ctx.fill(); ctx.stroke();
        if (f.entityId) this.drawThumbInto(ctx, f.entityId, 0, 0, sz * 0.8);
        ctx.restore();
      } else {
        const r = (now - f.t0 - f.dur) / 250;
        drawEmoji(ctx, '✨', to.x, to.y, 40 + r * 40, 1, { alpha: 1 - r });
      }
    }
  }

  drawHintArrow(ctx, now) {
    const h = this.hint;
    if (!h || now - h.t0 > 4000 || !h.region) return;
    const p = this.worldToScreen(h.region.x, h.region.y);
    const inside = p.x > 30 && p.x < this.w - 30 && p.y > 60 && p.y < this.h - 90;
    const pulse = 0.5 + 0.5 * Math.sin((now - h.t0) / 180);
    if (inside) {
      ctx.strokeStyle = `rgba(255,220,90,${0.4 + 0.5 * pulse})`; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(p.x, p.y, 80 + pulse * 10, 0, Math.PI * 2); ctx.stroke();
      return;
    }
    const cx = this.w / 2, cy = this.h / 2;
    const ang = Math.atan2(p.y - cy, p.x - cx);
    const ex = Math.max(30, Math.min(this.w - 30, cx + Math.cos(ang) * this.w));
    const ey = Math.max(70, Math.min(this.h - 100, cy + Math.sin(ang) * this.h));
    ctx.save(); ctx.translate(ex, ey); ctx.rotate(ang);
    ctx.fillStyle = `rgba(255,210,60,${0.6 + 0.4 * pulse})`; ctx.strokeStyle = '#7a5a00'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(-12, -14); ctx.lineTo(-6, 0); ctx.lineTo(-12, 14); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.restore();
  }

  drawLabel(ctx) {
    const l = this.labels;
    const b = this.entityBox(l.id);
    const p = this.worldToScreen(b.x + b.w / 2, b.y);
    const fs = this.settings.fontPx;
    ctx.font = `bold ${fs}px sans-serif`;
    const text = l.text;
    const w = ctx.measureText(text).width + 20;
    const x = Math.max(4, Math.min(this.w - w - 4, p.x - w / 2)), y = Math.max(4, p.y - fs * 2.4);
    ctx.fillStyle = 'rgba(30,20,40,.88)'; rr(ctx, x, y, w, fs * 1.8, 8); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(text, x + 10, y + fs * 0.9);
  }

  drawDebug(ctx, s) {
    ctx.lineWidth = 2 / s;
    ctx.font = `${12 / s}px monospace`; ctx.textAlign = 'left'; ctx.textBaseline = 'bottom';
    for (const id of [...Object.keys(this.stage.objects), ...Object.keys(this.stage.actors)]) {
      if (!this.rt.isVisible(id)) continue;
      const b = this.entityBox(id);
      if (this.debug.hitboxes) { ctx.strokeStyle = this.stage.actors[id] ? 'rgba(0,120,255,.9)' : 'rgba(255,0,0,.9)'; ctx.strokeRect(b.x, b.y, b.w, b.h); }
      if (this.debug.ids) {
        const evs = this.stage.events.filter(e => e.sourceId === id || e.targetId === id).map(e => e.id.split('-')[1]);
        ctx.fillStyle = '#000'; ctx.fillText(id + (evs.length ? ' ' + evs.slice(0, 6).join(',') : ''), b.x, b.y);
      }
    }
  }

  // カード・図鑑用のサムネイル
  drawThumbInto(ctx, id, cx, cy, size) {
    const st = this.stage;
    const o = st.objects[id];
    if (o) {
      const L = this.rt?.state.objects[id]?.look || {};
      if (o.prop && !L.emoji && !L.sign && PROPS[o.prop]) {
        const bw = o.w || o.size, bh = o.h || o.size;
        const k = size * 0.85 / Math.max(bw, bh);
        ctx.save(); ctx.translate(cx, cy + bh * k / 2); ctx.scale(k, k);
        PROPS[o.prop](ctx, 0, 0, o.size, { ...o.propOpts, ...(L.propOpts || {}) }); ctx.restore();
        return;
      }
      const sign = L.sign || o.sign;
      if (sign) {
        ctx.fillStyle = sign.fill || '#fff'; rr(ctx, cx - size / 2, cy - size * 0.35, size, size * 0.7, 6); ctx.fill();
        ctx.fillStyle = sign.color || '#222'; ctx.font = `bold ${size * 0.22}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText((sign.text || o.name).slice(0, 4), cx, cy);
      } else drawEmoji(ctx, L.emoji || o.emoji, cx, cy, size * 0.75, 2);
      return;
    }
    const a = st.actors[id];
    if (!a) return;
    if (a.emoji) { drawEmoji(ctx, a.emoji, cx, cy, size * 0.75, 2); return; }
    const look = { ...(a.look || {}), ...(this.rt?.state.actors[id]?.look || {}) };
    const H = (look.h || 150);
    const k = size / (H * 0.62);
    ctx.save(); ctx.beginPath(); ctx.rect(cx - size / 2, cy - size / 2, size, size); ctx.clip();
    ctx.translate(cx, cy + H * 0.62 * k); ctx.scale(k, k);
    drawPerson(ctx, { ...look, sit: false }, 'RIGHT', 'normal', null, 'none', 0, k * 2);
    ctx.restore();
  }
}

function stateFace(st) {
  return { HAPPY: 'happy', ANGRY: 'angry', SURPRISED: 'surprised', EMBARRASSED: 'embarrassed', SAD: 'sad', SCARED: 'scared', BUSY: 'normal' }[st] || 'normal';
}

// 人物の描画（足もと原点、上向きが負）。頭の大きいフラットなイラスト調。頭頂の y を返す
const OUT = 'rgba(40,25,30,.55)';
export function drawPerson(ctx, L, facing, face, walkT, body, k, s) {
  const H = L.h || 150;
  const kid = !!L.kid, old = !!L.old, sit = !!L.sit;
  const headR = H * (kid ? 0.25 : 0.21);
  const legH = sit ? H * 0.06 : H * (kid ? 0.2 : 0.26);
  const torsoH = H * (kid ? 0.25 : 0.29);
  const torsoW = H * (L.wide ? 0.46 : kid ? 0.27 : 0.29) * (L.muscle ? 1.25 : 1);
  const dir = facing === 'LEFT' ? -1 : 1;
  const skin = L.skin || SKIN;
  const pants = L.pants || '#445';
  const shirt = L.shirt || '#6a8';
  const lw = Math.max(0.8, H * 0.012);
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const hipY = -legH;
  const shoulderY = hipY - torsoH;
  // 脚
  if (sit) {
    rr(ctx, -torsoW * 0.62, hipY - H * 0.06, torsoW * 1.24, H * 0.12, H * 0.05); ctx.fillStyle = pants; ctx.fill(); ctx.strokeStyle = OUT; ctx.lineWidth = lw; ctx.stroke();
  } else {
    const sw = walkT != null ? Math.sin(walkT * 10) * 0.45 : 0;
    const legW = H * (L.wide ? 0.11 : 0.085);
    for (const side of [-1, 1]) {
      const fx = side * torsoW * 0.22 + side * Math.sin(sw) * legH * 0.6 * (side > 0 ? -1 : 1);
      ctx.strokeStyle = OUT; ctx.lineWidth = legW + lw * 2; ctx.beginPath(); ctx.moveTo(side * torsoW * 0.22, hipY); ctx.lineTo(fx, -H * 0.03); ctx.stroke();
      ctx.strokeStyle = pants; ctx.lineWidth = legW; ctx.beginPath(); ctx.moveTo(side * torsoW * 0.22, hipY); ctx.lineTo(fx, -H * 0.03); ctx.stroke();
      ctx.fillStyle = L.shoes || '#3a3030'; ctx.beginPath(); ctx.ellipse(fx + dir * H * 0.025, -H * 0.022, H * 0.055, H * 0.028, 0, 0, Math.PI * 2); ctx.fill();
    }
  }
  // 胴
  ctx.fillStyle = shirt; ctx.strokeStyle = OUT; ctx.lineWidth = lw;
  if (L.skirt) {
    ctx.beginPath(); ctx.moveTo(-torsoW * 0.45, shoulderY + 4); ctx.quadraticCurveTo(0, shoulderY - 4, torsoW * 0.45, shoulderY + 4);
    ctx.lineTo(torsoW * 0.75, hipY + legH * 0.5); ctx.lineTo(-torsoW * 0.75, hipY + legH * 0.5); ctx.closePath(); ctx.fill(); ctx.stroke();
  } else { rr(ctx, -torsoW / 2, shoulderY, torsoW, torsoH + H * 0.02, torsoW * 0.35); ctx.fill(); ctx.stroke(); }
  ctx.fillStyle = 'rgba(255,255,255,.18)'; rr(ctx, -torsoW * 0.38, shoulderY + torsoH * 0.12, torsoW * 0.22, torsoH * 0.6, torsoW * 0.1); ctx.fill();
  const acc = L.acc || [];
  if (acc.includes('apron')) { ctx.fillStyle = L.apronColor || '#fff4e0'; rr(ctx, -torsoW * 0.3, shoulderY + torsoH * 0.45, torsoW * 0.6, torsoH * 0.6, 5); ctx.fill(); ctx.strokeStyle = 'rgba(40,25,30,.3)'; ctx.stroke(); ctx.strokeStyle = L.apronColor || '#fff4e0'; ctx.lineWidth = H * 0.015; ctx.beginPath(); ctx.moveTo(-torsoW * 0.25, shoulderY + torsoH * 0.47); ctx.lineTo(-torsoW * 0.2, shoulderY + 2); ctx.moveTo(torsoW * 0.25, shoulderY + torsoH * 0.47); ctx.lineTo(torsoW * 0.2, shoulderY + 2); ctx.stroke(); }
  if (acc.includes('tie')) { ctx.fillStyle = '#d23a3a'; ctx.beginPath(); ctx.moveTo(-H * 0.02, shoulderY + 2); ctx.lineTo(H * 0.02, shoulderY + 2); ctx.lineTo(H * 0.014, shoulderY + torsoH * 0.6); ctx.lineTo(0, shoulderY + torsoH * 0.72); ctx.lineTo(-H * 0.014, shoulderY + torsoH * 0.6); ctx.fill(); }
  if (acc.includes('scarf')) { ctx.fillStyle = L.hatColor || '#e04848'; rr(ctx, -torsoW * 0.48, shoulderY - H * 0.02, torsoW * 0.96, H * 0.06, H * 0.03); ctx.fill(); }
  // 腕
  const up = body === 'jump' || body === 'bounce' || body === 'spin' || body === 'grow';
  const armLen = H * (kid ? 0.2 : 0.25);
  const aw = H * (L.muscle ? 0.1 : 0.065);
  const swing = walkT != null ? Math.sin(walkT * 10) * 0.5 : 0;
  for (const side of [-1, 1]) {
    const sx = side * torsoW * 0.44;
    let hx = sx + side * armLen * 0.18 + swing * armLen * 0.5 * side, hy = shoulderY + H * 0.02 + armLen * 0.9;
    if (sit) { hx = side * torsoW * 0.35; hy = shoulderY + torsoH * 0.75; }
    if (up) { hx = sx + side * armLen * 0.5; hy = shoulderY - armLen * 0.55; }
    if (body === 'eat' && side === dir) { hx = dir * headR * 0.5; hy = shoulderY - headR * 0.2; }
    ctx.strokeStyle = OUT; ctx.lineWidth = aw + lw * 2; ctx.beginPath(); ctx.moveTo(sx, shoulderY + H * 0.03); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.strokeStyle = shirt; ctx.lineWidth = aw; ctx.beginPath(); ctx.moveTo(sx, shoulderY + H * 0.03); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(hx, hy, aw * 0.62, 0, Math.PI * 2); ctx.fill();
  }
  if (acc.includes('bag')) { ctx.fillStyle = '#9a6a3a'; rr(ctx, -dir * torsoW * 0.7 - H * 0.05, hipY - H * 0.06, H * 0.1, H * 0.1, 3); ctx.fill(); }
  if (acc.includes('camera')) { ctx.fillStyle = '#333'; rr(ctx, dir * torsoW * 0.05 - H * 0.05, shoulderY + torsoH * 0.25, H * 0.1, H * 0.07, 2); ctx.fill(); ctx.fillStyle = '#8ac'; ctx.beginPath(); ctx.arc(dir * torsoW * 0.05, shoulderY + torsoH * 0.25 + H * 0.035, H * 0.02, 0, Math.PI * 2); ctx.fill(); }
  // 頭
  const hy = shoulderY - headR * 0.88;
  if (L.costume) {
    drawEmoji(ctx, L.costume, 0, hy - headR * 0.2, headR * 2.6, s, { flip: facing === 'RIGHT' });
    return hy - headR * 1.4;
  }
  const hc = L.hairColor || '#3a2a22';
  const hair = L.hair || 'short';
  // 後ろ髪
  ctx.fillStyle = hc;
  if (hair === 'long') { rr(ctx, -headR * 1.08, hy - headR * 0.6, headR * 2.16, headR * 2.0, headR * 0.7); ctx.fill(); }
  if (hair === 'bob') { rr(ctx, -headR * 1.1, hy - headR * 0.7, headR * 2.2, headR * 1.65, headR * 0.6); ctx.fill(); }
  if (hair === 'twin') { for (const sd of [-1, 1]) { ctx.beginPath(); ctx.ellipse(sd * headR * 1.18, hy + headR * 0.35, headR * 0.32, headR * 0.6, sd * 0.3, 0, Math.PI * 2); ctx.fill(); } }
  if (hair === 'pony') { ctx.beginPath(); ctx.ellipse(-dir * headR * 1.05, hy + headR * 0.15, headR * 0.3, headR * 0.75, dir * 0.5, 0, Math.PI * 2); ctx.fill(); }
  if (hair === 'afro') { ctx.beginPath(); ctx.arc(0, hy - headR * 0.25, headR * 1.38, 0, Math.PI * 2); ctx.fill(); }
  // 顔
  ctx.fillStyle = skin; ctx.strokeStyle = OUT; ctx.lineWidth = lw;
  ctx.beginPath(); ctx.ellipse(0, hy, headR, headR * 0.96, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  // 耳
  ctx.beginPath(); ctx.ellipse(-dir * headR * 0.95, hy + headR * 0.08, headR * 0.16, headR * 0.2, 0, 0, Math.PI * 2); ctx.fill();
  const ex = dir * headR * 0.16;
  const eyeY = hy + headR * 0.05;
  const er = headR * (kid ? 0.25 : 0.22);
  const eyes = [ex - headR * 0.3, ex + headR * 0.3];
  for (const x of eyes) {
    if (face === 'happy' || face === 'laugh') { ctx.strokeStyle = '#2a1a1a'; ctx.lineWidth = headR * 0.09; ctx.beginPath(); ctx.arc(x, eyeY + er * 0.3, er * 0.7, Math.PI * 1.15, Math.PI * 1.85); ctx.stroke(); continue; }
    if (face === 'sleep') { ctx.strokeStyle = '#2a1a1a'; ctx.lineWidth = headR * 0.08; ctx.beginPath(); ctx.arc(x, eyeY - er * 0.1, er * 0.6, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke(); continue; }
    ctx.fillStyle = '#fff'; ctx.strokeStyle = 'rgba(40,25,30,.7)'; ctx.lineWidth = headR * 0.035;
    ctx.beginPath(); ctx.ellipse(x, eyeY, er * 0.82, er, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const pr = face === 'surprised' || face === 'scared' ? er * 0.35 : er * 0.55;
    const px = x + dir * er * 0.25, py = eyeY + er * (face === 'sad' ? 0.25 : 0.12);
    ctx.fillStyle = '#1e1414'; ctx.beginPath(); ctx.arc(px, py, pr, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(px + pr * 0.35, py - pr * 0.4, pr * 0.32, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = '#2a1a1a'; ctx.lineWidth = headR * 0.07;
  if (face === 'angry') { ctx.beginPath(); ctx.moveTo(eyes[0] - er, eyeY - er * 1.5); ctx.lineTo(eyes[0] + er * 0.6, eyeY - er * 0.95); ctx.moveTo(eyes[1] + er, eyeY - er * 1.5); ctx.lineTo(eyes[1] - er * 0.6, eyeY - er * 0.95); ctx.stroke(); }
  if (face === 'sad' || face === 'scared') { ctx.beginPath(); ctx.moveTo(eyes[0] - er, eyeY - er * 1.0); ctx.lineTo(eyes[0] + er * 0.6, eyeY - er * 1.45); ctx.moveTo(eyes[1] + er, eyeY - er * 1.0); ctx.lineTo(eyes[1] - er * 0.6, eyeY - er * 1.45); ctx.stroke(); }
  // ほお
  if (kid || face === 'embarrassed' || face === 'happy' || L.blush) { ctx.fillStyle = face === 'embarrassed' ? 'rgba(255,80,100,.55)' : 'rgba(255,120,130,.38)'; for (const x of eyes) { ctx.beginPath(); ctx.ellipse(x + (x < ex ? -1 : 1) * er * 0.4, eyeY + er * 1.45, er * 0.55, er * 0.32, 0, 0, Math.PI * 2); ctx.fill(); } }
  // 口
  const my = hy + headR * 0.58, mx = ex;
  ctx.strokeStyle = '#6a2a2a'; ctx.fillStyle = '#b8343a'; ctx.lineWidth = headR * 0.06;
  ctx.beginPath();
  if (face === 'happy') { ctx.arc(mx, my - headR * 0.06, headR * 0.17, 0.15, Math.PI - 0.15); ctx.closePath(); ctx.fill(); }
  else if (face === 'surprised' || face === 'scared') { ctx.ellipse(mx, my, headR * 0.08, headR * 0.12, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (face === 'sad' || face === 'angry') { ctx.arc(mx, my + headR * 0.1, headR * 0.12, Math.PI + 0.5, -0.5); ctx.stroke(); }
  else if (face === 'embarrassed') { ctx.moveTo(mx - headR * 0.1, my); ctx.lineTo(mx - headR * 0.03, my - headR * 0.04); ctx.lineTo(mx + headR * 0.04, my); ctx.lineTo(mx + headR * 0.1, my - headR * 0.04); ctx.stroke(); }
  else { ctx.arc(mx, my - headR * 0.04, headR * 0.09, 0.3, Math.PI - 0.3); ctx.stroke(); }
  if (face === 'scared' || face === 'embarrassed') drawEmoji(ctx, '💧', -dir * headR * 0.95, hy - headR * 0.55, headR * 0.5, s);
  // 前髪
  ctx.fillStyle = hc;
  const capTop = (r0, a0 = 1.02, a1 = 1.98) => { ctx.beginPath(); ctx.ellipse(0, hy - headR * 0.06, headR * r0, headR * r0 * 0.98, 0, Math.PI * a0, Math.PI * a1); ctx.closePath(); ctx.fill(); };
  if (hair === 'short' || hair === 'long' || hair === 'twin' || hair === 'pony' || hair === 'bob') {
    capTop(1.06);
    ctx.beginPath(); ctx.moveTo(-headR * 1.0, hy - headR * 0.15);
    for (let i = 0; i <= 5; i++) ctx.lineTo(-headR + i * headR * 0.4, hy - headR * (0.3 + (i % 2) * 0.22) + (i === 0 || i === 5 ? headR * 0.15 : 0));
    ctx.lineTo(headR, hy - headR * 0.5); ctx.closePath(); ctx.fill();
    if (hair === 'short' && !kid) { ctx.beginPath(); ctx.ellipse(-dir * headR * 0.85, hy - headR * 0.05, headR * 0.2, headR * 0.35, 0, 0, Math.PI * 2); ctx.fill(); }
  } else if (hair === 'bun') {
    capTop(1.05); ctx.beginPath(); ctx.arc(0, hy - headR * 1.12, headR * 0.38, 0, Math.PI * 2); ctx.fill();
  } else if (hair === 'spiky') {
    ctx.beginPath(); for (let i = 0; i <= 8; i++) { const a0 = Math.PI * (1.0 + i / 8); const rr2 = i % 2 ? 1.45 : 1.02; ctx.lineTo(Math.cos(a0) * headR * rr2, hy - headR * 0.06 + Math.sin(a0) * headR * rr2); } ctx.closePath(); ctx.fill();
  } else if (hair === 'afro') {
    capTop(1.15, 1.0, 2.0);
  } else if (hair === 'mohawk') {
    rr(ctx, -headR * 0.16, hy - headR * 1.75, headR * 0.32, headR * 1.0, headR * 0.12); ctx.fill();
  } else if (hair === 'topknot') {
    capTop(1.03, 1.1, 1.9); rr(ctx, -headR * 0.12, hy - headR * 1.38, headR * 0.85, headR * 0.24, headR * 0.1); ctx.fill();
  } else if (hair === 'bald') {
    ctx.beginPath(); ctx.ellipse(-dir * headR * 0.82, hy - headR * 0.1, headR * 0.22, headR * 0.35, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(dir * headR * 0.82, hy - headR * 0.1, headR * 0.2, headR * 0.32, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.ellipse(-headR * 0.25, hy - headR * 0.68, headR * 0.28, headR * 0.12, -0.3, 0, Math.PI * 2); ctx.fill();
  }
  // アクセサリ
  ctx.lineWidth = headR * 0.07;
  if (acc.includes('glasses') || acc.includes('sunglasses')) {
    ctx.strokeStyle = '#2a2a2a'; ctx.fillStyle = acc.includes('sunglasses') ? 'rgba(20,20,30,.92)' : 'rgba(210,235,255,.25)';
    for (const x of eyes) { ctx.beginPath(); ctx.arc(x, eyeY, er * 1.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(eyes[0] + er * 1.2, eyeY); ctx.lineTo(eyes[1] - er * 1.2, eyeY); ctx.stroke();
  }
  if (acc.includes('beard')) { ctx.fillStyle = old ? '#f2f2f2' : hc; ctx.beginPath(); ctx.ellipse(ex * 0.5, hy + headR * 0.72, headR * 0.6, headR * 0.42, 0, 0, Math.PI); ctx.fill(); }
  if (acc.includes('mustache') || (old && acc.includes('beard'))) { ctx.fillStyle = old ? '#f2f2f2' : hc; ctx.beginPath(); ctx.ellipse(mx - headR * 0.14, my - headR * 0.1, headR * 0.17, headR * 0.08, 0.2, 0, Math.PI * 2); ctx.ellipse(mx + headR * 0.14, my - headR * 0.1, headR * 0.17, headR * 0.08, -0.2, 0, Math.PI * 2); ctx.fill(); }
  if (acc.includes('mask')) { ctx.fillStyle = '#fff'; ctx.strokeStyle = OUT; ctx.lineWidth = lw; rr(ctx, ex - headR * 0.48, hy + headR * 0.3, headR * 0.96, headR * 0.5, headR * 0.15); ctx.fill(); ctx.stroke(); }
  if (acc.includes('ribbon')) { ctx.fillStyle = L.hatColor || '#ff4a6a'; ctx.beginPath(); ctx.ellipse(-dir * headR * 0.55, hy - headR * 0.92, headR * 0.3, headR * 0.17, 0.5, 0, Math.PI * 2); ctx.ellipse(-dir * headR * 0.05, hy - headR * 1.0, headR * 0.3, headR * 0.17, -0.5, 0, Math.PI * 2); ctx.fill(); }
  if (acc.includes('flower')) drawEmoji(ctx, '🌺', -dir * headR * 0.6, hy - headR * 0.82, headR * 0.7, s);
  if (acc.includes('earring')) { ctx.fillStyle = '#ffd23f'; ctx.beginPath(); ctx.arc(-dir * headR * 0.95, hy + headR * 0.35, headR * 0.1, 0, Math.PI * 2); ctx.fill(); }
  if (acc.includes('headphones')) { ctx.strokeStyle = '#333'; ctx.lineWidth = headR * 0.15; ctx.beginPath(); ctx.arc(0, hy, headR * 1.1, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); ctx.fillStyle = '#e44'; ctx.beginPath(); ctx.arc(-headR, hy, headR * 0.26, 0, Math.PI * 2); ctx.arc(headR, hy, headR * 0.26, 0, Math.PI * 2); ctx.fill(); }
  let top = hy - headR * (hair === 'afro' ? 1.65 : hair === 'mohawk' ? 1.75 : hair === 'bun' ? 1.5 : hair === 'spiky' ? 1.5 : 1.08);
  if (acc.includes('hat') || acc.includes('cap') || acc.includes('helmet') || acc.includes('crown')) {
    ctx.fillStyle = L.hatColor || (acc.includes('helmet') ? '#ffcc22' : '#3a4a6a'); ctx.strokeStyle = OUT; ctx.lineWidth = lw;
    if (acc.includes('crown')) { drawEmoji(ctx, '👑', 0, hy - headR * 1.15, headR * 1.2, s); }
    else if (acc.includes('cap')) { ctx.beginPath(); ctx.ellipse(0, hy - headR * 0.32, headR * 1.04, headR * 0.82, 0, Math.PI, 0); ctx.fill(); ctx.stroke(); rr(ctx, dir > 0 ? 0 : -headR * 1.55, hy - headR * 0.42, headR * 1.55, headR * 0.2, headR * 0.1); ctx.fill(); }
    else if (acc.includes('helmet')) { ctx.beginPath(); ctx.ellipse(0, hy - headR * 0.2, headR * 1.12, headR * 1.0, 0, Math.PI, 0); ctx.fill(); ctx.stroke(); }
    else { rr(ctx, -headR * 1.35, hy - headR * 0.72, headR * 2.7, headR * 0.24, headR * 0.1); ctx.fill(); rr(ctx, -headR * 0.82, hy - headR * 1.55, headR * 1.64, headR * 0.92, headR * 0.25); ctx.fill(); ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(-headR * 0.82, hy - headR * 0.88, headR * 1.64, headR * 0.16); }
    top = Math.min(top, hy - headR * 1.55);
  }
  return top;
}

// ── 背景プリミティブ ──
function boxOf(p) {
  switch (p.t) {
    case 'rect': case 'stripes': case 'sign': case 'water': case 'road': return { x: p.x, y: p.y, w: p.w, h: p.h };
    case 'ellipse': return { x: p.x - p.rx, y: p.y - p.ry, w: p.rx * 2, h: p.ry * 2 };
    case 'emoji': return { x: p.x - p.s, y: p.y - p.s, w: p.s * 2, h: p.s * 2 };
    case 'text': return { x: p.x - (p.s || 20) * (p.text.length), y: p.y - (p.s || 20), w: (p.s || 20) * p.text.length * 2, h: (p.s || 20) * 2 };
    case 'building': return { x: p.x - 40, y: p.y - p.h - 130, w: p.w + 80, h: p.h + 140 };
    case 'prop': { const s2 = p.s || 100; return { x: p.x - s2 * 3.5, y: p.y - s2 * 1.4, w: s2 * 7, h: s2 * 1.5 }; }
    case 'sky': return { x: p.x, y: p.y, w: p.w, h: p.h };
    case 'rail': return { x: p.x, y: p.y - 20, w: p.w, h: 40 };
    case 'fence': return { x: p.x, y: p.y - (p.h || 40), w: p.w, h: (p.h || 40) };
    case 'poly': case 'line': {
      let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
      for (let i = 0; i < p.pts.length; i += 2) { x0 = Math.min(x0, p.pts[i]); x1 = Math.max(x1, p.pts[i]); y0 = Math.min(y0, p.pts[i + 1]); y1 = Math.max(y1, p.pts[i + 1]); }
      const m = p.w || 0;
      return { x: x0 - m, y: y0 - m, w: x1 - x0 + m * 2, h: y1 - y0 + m * 2 };
    }
  }
  return { x: -1e9, y: -1e9, w: 2e9, h: 2e9 };
}
function intersects(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

function drawPrim(ctx, p, s) {
  switch (p.t) {
    case 'rect':
      ctx.fillStyle = p.fill;
      if (p.r) { rr(ctx, p.x, p.y, p.w, p.h, p.r); ctx.fill(); if (p.stroke) { ctx.strokeStyle = p.stroke; ctx.lineWidth = p.lw || 2; ctx.stroke(); } }
      else { ctx.fillRect(p.x, p.y, p.w, p.h); if (p.stroke) { ctx.strokeStyle = p.stroke; ctx.lineWidth = p.lw || 2; ctx.strokeRect(p.x, p.y, p.w, p.h); } }
      break;
    case 'ellipse':
      ctx.fillStyle = p.fill; ctx.beginPath(); ctx.ellipse(p.x, p.y, p.rx, p.ry, p.rot || 0, 0, Math.PI * 2); ctx.fill();
      if (p.stroke) { ctx.strokeStyle = p.stroke; ctx.lineWidth = p.lw || 2; ctx.stroke(); }
      break;
    case 'poly':
      ctx.beginPath(); for (let i = 0; i < p.pts.length; i += 2) (i ? ctx.lineTo : ctx.moveTo).call(ctx, p.pts[i], p.pts[i + 1]); ctx.closePath();
      if (p.fill) { ctx.fillStyle = p.fill; ctx.fill(); }
      if (p.stroke) { ctx.strokeStyle = p.stroke; ctx.lineWidth = p.lw || 2; ctx.stroke(); }
      break;
    case 'line':
      ctx.strokeStyle = p.stroke || '#333'; ctx.lineWidth = p.w || 3; ctx.beginPath();
      for (let i = 0; i < p.pts.length; i += 2) (i ? ctx.lineTo : ctx.moveTo).call(ctx, p.pts[i], p.pts[i + 1]);
      ctx.stroke(); break;
    case 'emoji': drawEmoji(ctx, p.e, p.x, p.y, p.s, s, { rot: p.rot, flip: p.flip }); break;
    case 'text':
      ctx.fillStyle = p.fill || '#333'; ctx.font = `${p.bold ? 'bold ' : ''}${p.s || 20}px "Hiragino Maru Gothic ProN","Yu Gothic",sans-serif`;
      ctx.textAlign = p.align || 'center'; ctx.textBaseline = 'middle'; ctx.fillText(p.text, p.x, p.y); break;
    case 'stripes': {
      ctx.save(); ctx.beginPath(); ctx.rect(p.x, p.y, p.w, p.h); ctx.clip();
      const n = p.n || 8;
      for (let i = 0; i < n; i++) {
        ctx.fillStyle = i % 2 ? p.c2 : p.c1;
        if (p.dir === 'h') ctx.fillRect(p.x, p.y + p.h * i / n, p.w, p.h / n + 1); else ctx.fillRect(p.x + p.w * i / n, p.y, p.w / n + 1, p.h);
      }
      ctx.restore(); break;
    }
    case 'sign':
      ctx.fillStyle = p.fill || '#fff'; ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 3;
      rr(ctx, p.x, p.y, p.w, p.h, 6); ctx.fill(); ctx.stroke();
      ctx.fillStyle = p.color || '#222'; ctx.font = `bold ${p.s || 24}px "Hiragino Maru Gothic ProN","Yu Gothic",sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      wrapText(ctx, p.text, p.x + p.w / 2, p.y + p.h / 2, p.w - 8, (p.s || 24) * 1.15); break;
    case 'building': {
      const u = p.unit || 1, top = p.y - p.h, w = p.w;
      const body = p.fill || '#e8dcc4';
      ctx.fillStyle = body; ctx.fillRect(p.x, top, w, p.h);
      ctx.fillStyle = shade(body, -0.12); ctx.fillRect(p.x + w - 14 * u, top, 14 * u, p.h);
      ctx.strokeStyle = 'rgba(40,25,30,.35)'; ctx.lineWidth = 3 * u; ctx.strokeRect(p.x, top, w, p.h);
      const roof = p.roof;
      if (roof && p.roofStyle === 'flat') { ctx.fillStyle = roof; ctx.fillRect(p.x - 8 * u, top - 18 * u, w + 16 * u, 22 * u); }
      else if (roof && p.roofStyle === 'tile') {
        ctx.fillStyle = roof; ctx.beginPath(); ctx.moveTo(p.x - 30 * u, top + 6 * u); ctx.lineTo(p.x + 30 * u, top - 60 * u); ctx.lineTo(p.x + w - 30 * u, top - 60 * u); ctx.lineTo(p.x + w + 30 * u, top + 6 * u); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = shade(roof, -0.3); ctx.lineWidth = 3 * u; for (let xx = p.x - 10 * u; xx < p.x + w + 20 * u; xx += 22 * u) { ctx.beginPath(); ctx.moveTo(xx, top + 4 * u); ctx.lineTo(xx + 14 * u, top - 56 * u); ctx.stroke(); }
      } else if (roof) {
        const rh = Math.min(110 * u, w * 0.3);
        ctx.fillStyle = roof; ctx.beginPath(); ctx.moveTo(p.x - 16 * u, top + 6 * u); ctx.lineTo(p.x + w / 2, top - rh); ctx.lineTo(p.x + w + 16 * u, top + 6 * u); ctx.closePath(); ctx.fill();
        ctx.fillStyle = shade(roof, -0.2); ctx.beginPath(); ctx.moveTo(p.x + w / 2, top - rh); ctx.lineTo(p.x + w + 16 * u, top + 6 * u); ctx.lineTo(p.x + w / 2 + 10 * u, top + 6 * u); ctx.closePath(); ctx.fill();
      }
      const shopH = (p.awning || p.shop) ? Math.min(p.h * 0.55, 190 * u) : 0;
      if (p.windows !== false) {
        const cols = Math.max(1, Math.floor(w / (120 * u)));
        const gap = w / cols;
        const avail = p.h - shopH - (p.sign && !shopH ? 90 * u : 30 * u) - (shopH && p.sign ? 80 * u : 0);
        const rows = Math.max(0, Math.floor(avail / (115 * u)));
        const y0 = top + (p.sign && !shopH ? 90 * u : 26 * u);
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const wx = p.x + c * gap + gap / 2 - 32 * u, wy = y0 + r * 115 * u;
          ctx.fillStyle = '#fff'; ctx.fillRect(wx - 5 * u, wy - 5 * u, 74 * u, 72 * u);
          ctx.fillStyle = p.windowColor || '#8fd0f0'; ctx.fillRect(wx, wy, 64 * u, 62 * u);
          ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.beginPath(); ctx.moveTo(wx + 6 * u, wy + 40 * u); ctx.lineTo(wx + 30 * u, wy + 6 * u); ctx.lineTo(wx + 42 * u, wy + 6 * u); ctx.lineTo(wx + 14 * u, wy + 48 * u); ctx.fill();
          ctx.fillStyle = '#fff'; ctx.fillRect(wx + 30 * u, wy, 4 * u, 62 * u);
        }
      }
      if (shopH) {
        const sy = p.y - shopH;
        ctx.fillStyle = shade(body, -0.25); ctx.fillRect(p.x + 8 * u, sy, w - 16 * u, shopH);
        ctx.fillStyle = '#d6eef8'; ctx.fillRect(p.x + 18 * u, sy + 40 * u, w - 36 * u, shopH - 50 * u);
        const goods = p.goods || ['#ff6f61', '#ffd23f', '#5bb03b', '#3a8ad8', '#ff9fc8'];
        for (let xx = p.x + 30 * u, i = 0; xx < p.x + w - 50 * u; xx += 34 * u, i++) {
          const gh = (18 + (i * 13) % 22) * u;
          ctx.fillStyle = goods[i % goods.length]; ctx.fillRect(xx, p.y - 26 * u - gh, 24 * u, gh);
        }
        ctx.fillStyle = '#9a7a5a'; ctx.fillRect(p.x + 18 * u, p.y - 26 * u, w - 36 * u, 10 * u);
        if (p.door !== false) { ctx.fillStyle = '#7a5032'; ctx.fillRect(p.x + w / 2 - 30 * u, p.y - 100 * u, 60 * u, 100 * u); ctx.fillStyle = '#bfe6ff'; ctx.fillRect(p.x + w / 2 - 20 * u, p.y - 88 * u, 40 * u, 40 * u); }
        if (p.awning) {
          const ay = sy - 6 * u, ah = 40 * u, n = Math.max(3, Math.round(w / (44 * u)));
          const ww = (w + 16 * u) / n;
          for (let i = 0; i < n; i++) {
            const x0 = p.x - 8 * u + i * ww;
            ctx.fillStyle = i % 2 ? '#ffffff' : p.awning;
            ctx.beginPath(); ctx.moveTo(x0, ay); ctx.lineTo(x0 + ww, ay); ctx.lineTo(x0 + ww, ay + ah); ctx.arc(x0 + ww / 2, ay + ah, ww / 2, 0, Math.PI); ctx.closePath(); ctx.fill();
          }
        }
      } else if (p.door !== false) {
        ctx.fillStyle = '#7a5032'; ctx.fillRect(p.x + w / 2 - 32 * u, p.y - 110 * u, 64 * u, 110 * u);
        ctx.fillStyle = '#e0b060'; ctx.beginPath(); ctx.arc(p.x + w / 2 + 20 * u, p.y - 55 * u, 4 * u, 0, Math.PI * 2); ctx.fill();
      }
      if (p.sign) {
        const fs = (p.signSize || 30) * u;
        ctx.font = `900 ${fs}px "Hiragino Maru Gothic ProN","Yu Gothic",sans-serif`;
        const sw = Math.min(w - 16 * u, ctx.measureText(p.sign).width + 36 * u);
        const sy2 = shopH ? p.y - shopH - fs - 40 * u : top + 18 * u;
        ctx.fillStyle = p.signFill || '#ffffff'; ctx.strokeStyle = shade(p.signFill || '#ffffff', -0.45); ctx.lineWidth = 4 * u;
        rr(ctx, p.x + w / 2 - sw / 2, sy2, sw, fs + 20 * u, 8 * u); ctx.fill(); ctx.stroke();
        ctx.fillStyle = p.signColor || '#2a2030'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(p.sign, p.x + w / 2, sy2 + (fs + 20 * u) / 2 + 1, sw - 12 * u);
      }
      break;
    }
    case 'prop': {
      const fn = PROPS[p.kind];
      if (!fn) break;
      ctx.save();
      if (p.flip) { ctx.translate(p.x, 0); ctx.scale(-1, 1); ctx.translate(-p.x, 0); }
      fn(ctx, p.x, p.y, p.s || 100, p);
      ctx.restore();
      break;
    }
    case 'sky': {
      const g = ctx.createLinearGradient(0, p.y, 0, p.y + p.h);
      g.addColorStop(0, p.c1 || '#5aa8e0'); g.addColorStop(1, p.c2 || '#cfeaff');
      ctx.fillStyle = g; ctx.fillRect(p.x, p.y, p.w, p.h);
      break;
    }
    case 'water': {
      ctx.fillStyle = p.shore || '#e8d8a8'; ctx.fillRect(p.x, p.y - 12, p.w, p.h + 24);
      ctx.fillStyle = p.fill || '#5ab4e6'; ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = 'rgba(255,255,255,.16)'; ctx.fillRect(p.x, p.y, p.w, Math.min(30, p.h * 0.25));
      ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      const t = performance.now() / 900;
      for (let yy = p.y + 40, r = 0; yy < p.y + p.h - 10; yy += 70, r++) for (let xx = p.x + ((r * 97) % 160); xx < p.x + p.w - 40; xx += 260) { const dx = Math.sin(t + xx * 0.01 + r) * 8; ctx.beginPath(); ctx.moveTo(xx + dx, yy); ctx.quadraticCurveTo(xx + 15 + dx, yy - 8, xx + 30 + dx, yy); ctx.stroke(); }
      break;
    }
    case 'road':
      ctx.fillStyle = p.fill || '#9a9ea4'; ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.fillRect(p.x, p.y, p.w, 6); ctx.fillRect(p.x, p.y + p.h - 6, p.w, 6);
      if (p.lines !== false) { ctx.fillStyle = 'rgba(255,255,255,.75)'; if (p.w >= p.h) for (let xx = p.x + 20; xx < p.x + p.w; xx += 140) ctx.fillRect(xx, p.y + p.h / 2 - 4, 70, 8); else for (let yy = p.y + 20; yy < p.y + p.h; yy += 140) ctx.fillRect(p.x + p.w / 2 - 4, yy, 8, 70); }
      break;
    case 'rail':
      ctx.fillStyle = '#7a6a5a'; for (let xx = p.x; xx < p.x + p.w; xx += 36) ctx.fillRect(xx, p.y - 16, 16, 32);
      ctx.fillStyle = '#999'; ctx.fillRect(p.x, p.y - 12, p.w, 6); ctx.fillRect(p.x, p.y + 6, p.w, 6);
      break;
    case 'fence': {
      const h = p.h || 40;
      ctx.fillStyle = p.fill || '#c8a878';
      for (let xx = p.x; xx < p.x + p.w; xx += 30) ctx.fillRect(xx, p.y - h, 10, h);
      ctx.fillRect(p.x, p.y - h * 0.8, p.w, 8); ctx.fillRect(p.x, p.y - h * 0.35, p.w, 8);
      break;
    }
  }
}

function wrapLines(ctx, text, maxW) {
  const out = [];
  for (const para of String(text).split('\n')) {
    let line = '';
    for (const ch of para) {
      if (ctx.measureText(line + ch).width > maxW && line) { out.push(line); line = ch; } else line += ch;
    }
    out.push(line);
  }
  return out;
}
function wrapText(ctx, text, cx, cy, maxW, lh) {
  const lines = wrapLines(ctx, text, maxW);
  lines.forEach((l, i) => ctx.fillText(l, cx, cy + (i - (lines.length - 1) / 2) * lh));
}

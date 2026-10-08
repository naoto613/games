// Camera / World Renderer / Actor Renderer / Speech Balloon / FX（仕様 6/25/26/35/36/37/74/75 章）
import { ANIMATIONS } from '../engine/animations.js';

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
    const sc = stage.world.spawnCamera || { x: stage.world.width / 2, y: stage.world.height / 2, zoom: 1 };
    this.cam = { x: sc.x, y: sc.y, zoom: sc.zoom || 1 };
    this.clampCam();
  }

  get base() { return Math.min(this.h / VIEW_UNITS, this.w / 700); }
  get scale() { return this.base * this.cam.zoom; }
  minZoom() {
    const wd = this.stage.world;
    // 画面が世界の外にはみ出さない倍率（cover）より引かない。世界全体の縦が入るところまでは引ける
    const cover = Math.max(this.w / (wd.width * this.base), this.h / (wd.height * this.base));
    return Math.max(cover, Math.min(wd.minZoom, (this.h / wd.height) / this.base));
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
      const H = (L.h || 150) * (L.sit ? 0.72 : 1);
      const W = (L.h || 150) * (L.wide ? 0.55 : 0.36);
      return { x: s.x - W / 2, y: s.y - H, w: W, h: H };
    }
    const o = st.objects[id];
    const s = rt.state.objects[id];
    const L = s.look || {};
    if (o.sign || L.sign) { const w = o.w || 100, h = o.h || 60; return { x: s.x - w / 2, y: s.y - h, w, h }; }
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
    ctx.fillStyle = '#1b1b22';
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
    for (const id of Object.keys(st.objects)) if (rt.isVisible(id)) { const o = rt.state.objects[id]; ents.push({ id, y: o.y, layer: st.objects[id].layer, kind: 'o' }); }
    for (const id of Object.keys(st.actors)) if (rt.isVisible(id)) { const a = rt.state.actors[id]; ents.push({ id, y: a.y, layer: st.actors[id].layer, kind: 'a' }); }
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
      drawEmoji(ctx, a.look?.emoji || def.emoji, 0, -sz / 2 + hop, sz, s, { flip: a.facing === 'RIGHT' });
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
    const idle = list.filter(e => e.b.idle && this.entityBox(e.id).h * this.scale >= 38)
      .sort((u, v) => Math.hypot(u.p.x - cx, u.p.y - cy) - Math.hypot(v.p.x - cx, v.p.y - cy)).slice(0, 4);
    list.splice(0, list.length, ...list.filter(e => !e.b.idle), ...idle);
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
      by = Math.max(58, by);
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
      ctx.beginPath(); ctx.moveTo(tx - 7, by + bh - 1); ctx.lineTo(tx, Math.min(p.y - 4, by + bh + 14)); ctx.lineTo(tx + 7, by + bh - 1); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.moveTo(tx - 7, by + bh); ctx.lineTo(tx, Math.min(p.y - 4, by + bh + 14)); ctx.lineTo(tx + 7, by + bh); ctx.stroke();
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

// 人物の描画（足もと原点、上向きが負）。頭頂の y を返す
export function drawPerson(ctx, L, facing, face, walkT, body, k, s) {
  const H = L.h || 150;
  const kid = !!L.kid, old = !!L.old;
  const sit = !!L.sit;
  const headR = H * (kid ? 0.16 : 0.12);
  const legH = sit ? H * 0.1 : H * 0.36;
  const torsoH = H * (kid ? 0.3 : 0.34);
  const torsoW = H * (L.wide ? 0.46 : 0.26) * (L.muscle ? 1.25 : 1);
  const dir = facing === 'LEFT' ? -1 : 1;
  const skin = L.skin || SKIN;
  const pants = L.pants || '#445';
  const shirt = L.shirt || '#6a8';
  ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const hipY = -legH;
  const shoulderY = hipY - torsoH;
  // 脚
  if (sit) {
    ctx.fillStyle = pants;
    rr(ctx, -torsoW * 0.7, -legH - 4, torsoW * 1.4, legH + 4, 8); ctx.fill();
    ctx.fillStyle = 'rgba(160,60,60,.85)'; rr(ctx, -torsoW * 0.9, -6, torsoW * 1.8, 10, 4); ctx.fill();
  } else {
    const sw = walkT != null ? Math.sin(walkT * 10) * 0.35 : 0;
    ctx.strokeStyle = pants; ctx.lineWidth = H * (L.wide ? 0.11 : 0.075);
    ctx.beginPath(); ctx.moveTo(-torsoW * 0.22, hipY); ctx.lineTo(-torsoW * 0.22 + Math.sin(sw) * legH, -2);
    ctx.moveTo(torsoW * 0.22, hipY); ctx.lineTo(torsoW * 0.22 - Math.sin(sw) * legH, -2); ctx.stroke();
    ctx.fillStyle = '#333';
    ctx.beginPath(); ctx.ellipse(-torsoW * 0.22 + Math.sin(sw) * legH + dir * 4, -2, H * 0.045, H * 0.022, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(torsoW * 0.22 - Math.sin(sw) * legH + dir * 4, -2, H * 0.045, H * 0.022, 0, 0, Math.PI * 2); ctx.fill();
  }
  // 胴
  ctx.fillStyle = shirt;
  if (L.skirt) {
    ctx.beginPath(); ctx.moveTo(-torsoW / 2, shoulderY + 6); ctx.lineTo(torsoW / 2, shoulderY + 6);
    ctx.lineTo(torsoW * 0.8, hipY + legH * 0.35); ctx.lineTo(-torsoW * 0.8, hipY + legH * 0.35); ctx.closePath(); ctx.fill();
  } else { rr(ctx, -torsoW / 2, shoulderY, torsoW, torsoH + 4, torsoW * 0.3); ctx.fill(); }
  if (L.acc?.includes('apron')) { ctx.fillStyle = '#fff'; rr(ctx, -torsoW * 0.35, shoulderY + torsoH * 0.3, torsoW * 0.7, torsoH * 0.75, 4); ctx.fill(); }
  if (L.acc?.includes('tie')) { ctx.fillStyle = '#c33'; ctx.beginPath(); ctx.moveTo(-4, shoulderY + 2); ctx.lineTo(4, shoulderY + 2); ctx.lineTo(2, shoulderY + torsoH * 0.6); ctx.lineTo(0, shoulderY + torsoH * 0.7); ctx.lineTo(-2, shoulderY + torsoH * 0.6); ctx.fill(); }
  if (L.acc?.includes('scarf')) { ctx.fillStyle = L.hatColor || '#d33'; rr(ctx, -torsoW * 0.45, shoulderY - 4, torsoW * 0.9, 12, 5); ctx.fill(); }
  // 腕
  const up = body === 'jump' || body === 'bounce' || body === 'spin' || body === 'grow';
  const armLen = H * 0.3;
  const aw = H * (L.muscle ? 0.1 : 0.06);
  ctx.strokeStyle = shirt; ctx.lineWidth = aw;
  const swing = walkT != null ? Math.sin(walkT * 10) * 0.5 : 0;
  for (const side of [-1, 1]) {
    const sx = side * torsoW * 0.48;
    let hx = sx + side * armLen * 0.15 + swing * armLen * 0.5 * side, hy = shoulderY + 6 + armLen * 0.95;
    if (up) { hx = sx + side * armLen * 0.45; hy = shoulderY - armLen * 0.65; }
    if (body === 'eat' && side === dir) { hx = dir * headR * 0.6; hy = shoulderY - headR * 0.4; }
    ctx.beginPath(); ctx.moveTo(sx, shoulderY + 6); ctx.lineTo(hx, hy); ctx.stroke();
    ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(hx, hy, aw * 0.6, 0, Math.PI * 2); ctx.fill();
  }
  if (L.acc?.includes('bag')) { ctx.fillStyle = '#8a5a2a'; rr(ctx, -dir * torsoW * 0.7 - 10, hipY - 10, 20, 22, 4); ctx.fill(); }
  if (L.acc?.includes('camera')) drawEmoji(ctx, '📷', dir * torsoW * 0.2, shoulderY + torsoH * 0.35, H * 0.12, s);
  // 首・頭
  const hy = shoulderY - headR * 0.85;
  if (L.costume) {
    drawEmoji(ctx, L.costume, 0, hy - headR * 0.3, headR * 3.2, s, { flip: facing === 'RIGHT' });
    return hy - headR * 2;
  }
  ctx.fillStyle = skin;
  ctx.beginPath(); ctx.arc(0, hy, headR, 0, Math.PI * 2); ctx.fill();
  // 髪（後ろ）
  const hc = L.hairColor || '#333';
  ctx.fillStyle = hc;
  const hair = L.hair || 'short';
  if (hair === 'long') { rr(ctx, -headR * 1.05, hy - headR * 0.9, headR * 2.1, headR * 2.3, headR * 0.8); ctx.fill(); ctx.fillStyle = skin; ctx.beginPath(); ctx.arc(dir * headR * 0.12, hy + headR * 0.05, headR * 0.86, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = hc; }
  if (hair === 'twin') { ctx.beginPath(); ctx.arc(-headR * 1.15, hy + headR * 0.2, headR * 0.45, 0, Math.PI * 2); ctx.arc(headR * 1.15, hy + headR * 0.2, headR * 0.45, 0, Math.PI * 2); ctx.fill(); }
  if (hair === 'pony') { ctx.beginPath(); ctx.ellipse(-dir * headR * 1.1, hy + headR * 0.1, headR * 0.35, headR * 0.7, 0.4 * dir, 0, Math.PI * 2); ctx.fill(); }
  // 顔
  const ex = dir * headR * 0.28;
  ctx.fillStyle = '#222';
  const eyeY = hy - headR * 0.05;
  const eye = (x) => {
    if (face === 'happy') { ctx.strokeStyle = '#222'; ctx.lineWidth = headR * 0.1; ctx.beginPath(); ctx.arc(x, eyeY + 2, headR * 0.13, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
    else if (face === 'sleep') { ctx.strokeStyle = '#222'; ctx.lineWidth = headR * 0.08; ctx.beginPath(); ctx.moveTo(x - headR * 0.12, eyeY); ctx.lineTo(x + headR * 0.12, eyeY); ctx.stroke(); }
    else { ctx.beginPath(); ctx.arc(x, eyeY, headR * (face === 'surprised' || face === 'scared' ? 0.13 : 0.09), 0, Math.PI * 2); ctx.fill(); }
  };
  eye(ex - headR * 0.2); eye(ex + headR * 0.24);
  if (face === 'angry') { ctx.strokeStyle = '#222'; ctx.lineWidth = headR * 0.08; ctx.beginPath(); ctx.moveTo(ex - headR * 0.38, eyeY - headR * 0.3); ctx.lineTo(ex - headR * 0.05, eyeY - headR * 0.16); ctx.moveTo(ex + headR * 0.42, eyeY - headR * 0.3); ctx.lineTo(ex + headR * 0.1, eyeY - headR * 0.16); ctx.stroke(); }
  if (face === 'embarrassed' || face === 'happy') { ctx.fillStyle = 'rgba(255,90,110,.45)'; ctx.beginPath(); ctx.arc(ex - headR * 0.42, eyeY + headR * 0.28, headR * 0.15, 0, Math.PI * 2); ctx.arc(ex + headR * 0.46, eyeY + headR * 0.28, headR * 0.15, 0, Math.PI * 2); ctx.fill(); }
  ctx.strokeStyle = '#6a2a2a'; ctx.lineWidth = headR * 0.08; ctx.fillStyle = '#7a2a2a';
  const my = hy + headR * 0.45, mx = ex + headR * 0.02;
  ctx.beginPath();
  if (face === 'happy') { ctx.arc(mx, my - headR * 0.08, headR * 0.2, 0.1, Math.PI - 0.1); ctx.fill(); }
  else if (face === 'surprised' || face === 'scared') { ctx.ellipse(mx, my, headR * 0.1, headR * 0.15, 0, 0, Math.PI * 2); ctx.fill(); }
  else if (face === 'sad' || face === 'angry') { ctx.arc(mx, my + headR * 0.12, headR * 0.16, Math.PI + 0.4, -0.4); ctx.stroke(); }
  else { ctx.moveTo(mx - headR * 0.14, my); ctx.lineTo(mx + headR * 0.14, my); ctx.stroke(); }
  if (face === 'scared' || face === 'embarrassed') drawEmoji(ctx, '💧', -dir * headR * 0.9, hy - headR * 0.6, headR * 0.6, s);
  // 髪（前）
  ctx.fillStyle = hc;
  if (hair === 'short' || hair === 'long' || hair === 'twin' || hair === 'pony' || hair === 'bob') {
    ctx.beginPath(); ctx.arc(0, hy - headR * 0.1, headR * 1.04, Math.PI * 1.05, Math.PI * 1.95); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-dir * headR * 0.5, hy - headR * 0.35, headR * 0.6, headR * 0.45, 0, 0, Math.PI * 2); ctx.fill();
    if (hair === 'bob') { rr(ctx, -headR * 1.08, hy - headR * 0.6, headR * 0.4, headR * 1.3, 6); rr(ctx, headR * 0.68, hy - headR * 0.6, headR * 0.4, headR * 1.3, 6); ctx.fill(); }
  } else if (hair === 'bun') {
    ctx.beginPath(); ctx.arc(0, hy - headR * 0.1, headR * 1.04, Math.PI * 1.05, Math.PI * 1.95); ctx.fill();
    ctx.beginPath(); ctx.arc(0, hy - headR * 1.2, headR * 0.45, 0, Math.PI * 2); ctx.fill();
  } else if (hair === 'spiky') {
    ctx.beginPath(); for (let i = 0; i < 7; i++) { const a0 = Math.PI * (1.0 + i / 6); ctx.lineTo(Math.cos(a0) * headR * 1.05, hy + Math.sin(a0) * headR * 1.05); ctx.lineTo(Math.cos(a0 + 0.08) * headR * 1.5, hy + Math.sin(a0 + 0.08) * headR * 1.5); } ctx.closePath(); ctx.fill();
  } else if (hair === 'afro') {
    ctx.beginPath(); ctx.arc(0, hy - headR * 0.55, headR * 1.35, Math.PI * 0.95, Math.PI * 2.05); ctx.fill();
  } else if (hair === 'mohawk') {
    rr(ctx, -headR * 0.18, hy - headR * 1.9, headR * 0.36, headR * 1.1, 4); ctx.fill();
  } else if (hair === 'topknot') {
    ctx.beginPath(); ctx.arc(0, hy - headR * 0.1, headR * 1.02, Math.PI * 1.15, Math.PI * 1.85); ctx.fill();
    rr(ctx, -headR * 0.15, hy - headR * 1.45, headR * 0.9, headR * 0.28, 4); ctx.fill();
  } else if (hair === 'bald') {
    ctx.beginPath(); ctx.arc(-dir * headR * 0.85, hy, headR * 0.28, 0, Math.PI * 2); ctx.fill();
  }
  if (old && hair !== 'bald') { ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.beginPath(); ctx.arc(0, hy - headR * 0.1, headR * 1.04, Math.PI * 1.05, Math.PI * 1.95); ctx.fill(); }
  // アクセサリ
  const acc = L.acc || [];
  ctx.lineWidth = headR * 0.07;
  if (acc.includes('glasses') || acc.includes('sunglasses')) {
    ctx.strokeStyle = '#222'; ctx.fillStyle = acc.includes('sunglasses') ? '#111' : 'rgba(200,230,255,.35)';
    for (const x of [ex - headR * 0.2, ex + headR * 0.24]) { ctx.beginPath(); ctx.arc(x, eyeY, headR * 0.2, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(ex - headR * 0.0, eyeY); ctx.lineTo(ex + headR * 0.04, eyeY); ctx.stroke();
  }
  if (acc.includes('beard')) { ctx.fillStyle = old ? '#eee' : hc; ctx.beginPath(); ctx.ellipse(ex * 0.6, hy + headR * 0.7, headR * 0.55, headR * 0.45, 0, 0, Math.PI); ctx.fill(); }
  if (acc.includes('mustache')) { ctx.fillStyle = hc; ctx.beginPath(); ctx.ellipse(mx, my - headR * 0.12, headR * 0.28, headR * 0.08, 0, 0, Math.PI * 2); ctx.fill(); }
  if (acc.includes('mask')) { ctx.fillStyle = '#fff'; rr(ctx, ex - headR * 0.5, hy + headR * 0.15, headR, headR * 0.55, 6); ctx.fill(); }
  if (acc.includes('ribbon')) { ctx.fillStyle = L.hatColor || '#f45'; ctx.beginPath(); ctx.ellipse(-dir * headR * 0.6, hy - headR * 0.9, headR * 0.35, headR * 0.2, 0.4, 0, Math.PI * 2); ctx.ellipse(-dir * headR * 0.1, hy - headR * 1.0, headR * 0.35, headR * 0.2, -0.4, 0, Math.PI * 2); ctx.fill(); }
  if (acc.includes('flower')) drawEmoji(ctx, '🌺', -dir * headR * 0.6, hy - headR * 0.8, headR * 0.8, s);
  if (acc.includes('earring')) { ctx.fillStyle = '#fd3'; ctx.beginPath(); ctx.arc(-dir * headR * 0.95, hy + headR * 0.3, headR * 0.12, 0, Math.PI * 2); ctx.fill(); }
  if (acc.includes('headphones')) { ctx.strokeStyle = '#333'; ctx.lineWidth = headR * 0.15; ctx.beginPath(); ctx.arc(0, hy, headR * 1.08, Math.PI * 1.05, Math.PI * 1.95); ctx.stroke(); ctx.fillStyle = '#e44'; ctx.beginPath(); ctx.arc(-headR, hy, headR * 0.25, 0, Math.PI * 2); ctx.arc(headR, hy, headR * 0.25, 0, Math.PI * 2); ctx.fill(); }
  let top = hy - headR * (hair === 'afro' ? 1.9 : hair === 'mohawk' ? 1.9 : hair === 'bun' ? 1.65 : 1.1);
  if (acc.includes('hat') || acc.includes('cap') || acc.includes('helmet') || acc.includes('crown')) {
    ctx.fillStyle = L.hatColor || (acc.includes('helmet') ? '#fc0' : '#335');
    if (acc.includes('crown')) { drawEmoji(ctx, '👑', 0, hy - headR * 1.2, headR * 1.3, s); }
    else if (acc.includes('cap')) { ctx.beginPath(); ctx.arc(0, hy - headR * 0.2, headR * 1.02, Math.PI, 0); ctx.fill(); rr(ctx, dir > 0 ? 0 : -headR * 1.6, hy - headR * 0.32, headR * 1.6, headR * 0.2, 4); ctx.fill(); }
    else if (acc.includes('helmet')) { ctx.beginPath(); ctx.arc(0, hy - headR * 0.15, headR * 1.12, Math.PI, 0); ctx.fill(); }
    else { rr(ctx, -headR * 1.3, hy - headR * 0.75, headR * 2.6, headR * 0.25, 4); ctx.fill(); rr(ctx, -headR * 0.8, hy - headR * 1.6, headR * 1.6, headR * 0.95, 6); ctx.fill(); }
    top = Math.min(top, hy - headR * 1.6);
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
    case 'building': return { x: p.x - 10, y: p.y - p.h - 60, w: p.w + 20, h: p.h + 70 };
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
      const top = p.y - p.h;
      ctx.fillStyle = p.fill || '#d8c8a8'; ctx.fillRect(p.x, top, p.w, p.h);
      ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 3; ctx.strokeRect(p.x, top, p.w, p.h);
      if (p.roof) { ctx.fillStyle = p.roof; ctx.beginPath(); ctx.moveTo(p.x - 14, top + 4); ctx.lineTo(p.x + p.w / 2, top - Math.min(90, p.w * 0.25)); ctx.lineTo(p.x + p.w + 14, top + 4); ctx.closePath(); ctx.fill(); }
      if (p.windows !== false) {
        ctx.fillStyle = 'rgba(170,210,240,.9)';
        const rows = Math.max(1, Math.floor((p.h - 160) / 110));
        for (let r = 0; r < rows; r++) for (let c = 0; c < Math.max(1, Math.floor(p.w / 120)); c++) ctx.fillRect(p.x + 30 + c * 120, top + 30 + r * 110, 70, 60);
      }
      if (p.awning) { ctx.fillStyle = p.awning; ctx.fillRect(p.x - 6, p.y - 150, p.w + 12, 34); ctx.fillStyle = 'rgba(255,255,255,.55)'; for (let i = 0; i < p.w + 12; i += 40) ctx.fillRect(p.x - 6 + i, p.y - 150, 20, 34); }
      if (p.door !== false) { ctx.fillStyle = 'rgba(80,50,30,.85)'; ctx.fillRect(p.x + p.w / 2 - 35, p.y - 110, 70, 110); }
      if (p.sign) {
        const sw = Math.min(p.w - 20, Math.max(120, p.sign.length * 34 + 30));
        ctx.fillStyle = p.signFill || '#fff'; ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.lineWidth = 3;
        rr(ctx, p.x + p.w / 2 - sw / 2, p.y - 210, sw, 52, 8); ctx.fill(); ctx.stroke();
        ctx.fillStyle = p.signColor || '#222'; ctx.font = 'bold 30px "Hiragino Maru Gothic ProN","Yu Gothic",sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(p.sign, p.x + p.w / 2, p.y - 184);
      }
      break;
    }
    case 'water': {
      ctx.fillStyle = p.fill || '#5aa6d6'; ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 4;
      const t = performance.now() / 600;
      for (let yy = p.y + 30; yy < p.y + p.h; yy += 60) { ctx.beginPath(); for (let xx = p.x; xx <= p.x + p.w; xx += 40) ctx.lineTo(xx, yy + Math.sin(xx / 60 + t + yy) * 6); ctx.stroke(); }
      break;
    }
    case 'road':
      ctx.fillStyle = p.fill || '#777'; ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = 'rgba(255,255,255,.7)'; for (let xx = p.x; xx < p.x + p.w; xx += 140) ctx.fillRect(xx, p.y + p.h / 2 - 4, 70, 8);
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

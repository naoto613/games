// Stage Runtime（仕様 4/8/10/12/15/31/48/77/78 章）。DOM 非依存・決定的。
// 描画層は on(type, fn) で通知を受け取り、update(dtMs) で時間を進める。
import { evalAll, explain } from './condition.js';
import { animDuration } from './animations.js';

export const TUNING = { wrongActionPenaltyMs: 750, presentDelayMs: 450, idleFirstDelayMs: 1500 };

function mulberry32(a) {
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return { v: ((t ^ (t >>> 14)) >>> 0) / 4294967296, a };
  };
}

const CAT_ORDER = { TIMEOUT: 0, TERMINAL: 0, PROGRESSION: 1, BRANCH: 1, CHAIN: 2, FLAVOR: 3 };

export class StageRuntime {
  constructor(stage, opts = {}) {
    this.stage = stage;
    this.opts = { ...TUNING, timeLimitMs: stage.timeLimitMs, seed: 20010628, ...opts };
    this.listeners = {};
    this.byPair = new Map();
    for (const ev of stage.events) {
      const k = ev.sourceId + '>' + ev.targetId;
      if (!this.byPair.has(k)) this.byPair.set(k, []);
      this.byPair.get(k).push(ev);
    }
    this.eventById = new Map(stage.events.map(e => [e.id, e]));
    this.reset();
  }

  on(type, fn) { (this.listeners[type] ||= []).push(fn); return this; }
  emit(type, data) { for (const fn of this.listeners[type] || []) fn(data, this); }

  // ── 状態生成（93章：リトライは常に新しい StageRunState） ──
  reset() {
    const st = this.stage;
    const actors = {};
    for (const a of Object.values(st.actors)) {
      actors[a.id] = {
        actorId: a.id, x: a.x, y: a.y, homeX: a.x, homeY: a.y, facing: a.facing, state: 'IDLE',
        attentionTargetId: null, currentTimelineId: null, interruptible: true,
        visible: !a.hidden, look: null, moving: false, path: null, pathIdx: 0, pathLoop: false, speed: a.speed,
        wander: a.wander, waitUntil: 0, lockedUntil: 0, idleSaid: [], idleIdx: 0,
        nextIdleAt: this.opts.idleFirstDelayMs + (hash(a.id) % 5000),
      };
      if (a.path) this._setPath(actors[a.id], this.stage.paths[a.path] ? this.stage.paths[a.path].points : a.path.map(([x, y]) => ({ x, y })), true);
    }
    const objects = {};
    for (const o of Object.values(st.objects)) {
      objects[o.id] = { objectId: o.id, state: o.initialState, x: o.x, y: o.y, variantId: null, usableCount: null, look: null, path: null, pathIdx: 0 };
    }
    this.state = {
      stageId: st.id, runId: 'run-' + Date.now().toString(36), status: 'READY',
      worldTimeMs: 0, t: 0, timeLimitMs: this.opts.timeLimitMs, score: 0,
      camera: { ...(st.world.spawnCamera || { x: st.world.width / 2, y: st.world.height / 2, zoom: 1 }) },
      capturedSourceId: null,
      completedEvents: new Set(), invalidatedEvents: new Set(),
      triggerCounts: {}, counters: {}, flags: {},
      actors, objects, actionLog: [], journal: [], queue: [], seq: 0,
      rngA: this.opts.seed >>> 0, endResult: null, endAt: null, inputLockUntil: 0,
      timelineFired: {}, hintLevel: {}, lastHintAt: -1e9,
    };
  }

  start() { if (this.state.status === 'READY') { this.state.status = 'PLAYING'; this.emit('start'); } }
  get remainingMs() { return Math.max(0, this.state.timeLimitMs - this.state.worldTimeMs); }
  get playing() { return this.state.status === 'PLAYING'; }
  get ended() { return this.state.status === 'CLEAR' || this.state.status === 'TIMEOUT' || this.state.status === 'ABORTED'; }

  rand() { const r = mulberry32(this.state.rngA)(); this.state.rngA = r.a; return r.v; }

  ctx() {
    const s = this.state;
    const actors = {};
    for (const [k, a] of Object.entries(s.actors)) actors[k] = { state: a.state, visible: a.visible };
    return { completed: s.completedEvents, counters: { ...s.triggerCounts, ...s.counters }, flags: s.flags, actors, objects: s.objects, remainingMs: this.remainingMs };
  }

  entity(id) { return this.stage.actors[id] || this.stage.objects[id] || null; }
  isVisible(id) {
    const s = this.state;
    if (s.actors[id]) return s.actors[id].visible;
    if (s.objects[id]) return s.objects[id].state === 'VISIBLE' || s.objects[id].state === 'MOVING';
    return false;
  }
  isTargetable(id) {
    const e = this.entity(id);
    return !!e && (e.kind === 'actor' ? e.targetable : e.targetable || this.stage.events.some(ev => ev.targetId === id && ev.category !== 'TIMEOUT'));
  }
  pos(id) { const s = this.state; return s.actors[id] || s.objects[id] || null; }

  // ── 時間 ──
  update(dtMs) {
    const s = this.state;
    if (s.status === 'READY' || this.ended) return;
    s.t += dtMs;
    if (s.status === 'PLAYING') s.worldTimeMs += dtMs;
    this._runQueue();
    this._runTimeline();
    this._moveAll(dtMs);
    this._idleSpeech();
    if (s.status === 'PLAYING' && this.remainingMs <= 0) this._timeout();
    if (s.status === 'ENDING' && s.t >= s.endAt) {
      s.status = s.endResult;
      this.emit('end', { result: s.endResult });
    }
  }

  // 解析・テスト用：保留中の効果を即時に全部実行する
  flush() {
    const s = this.state;
    let guard = 0;
    while (s.queue.length && guard++ < 10000) {
      s.queue.sort(queueCmp);
      const item = s.queue.shift();
      this._execQueued(item);
    }
    for (const a of Object.values(s.actors)) if (a.path && !a.pathLoop) { const p = a.path[a.path.length - 1]; a.x = p.x; a.y = p.y; a.path = null; a.moving = false; a.homeX = a.x; a.homeY = a.y; }
    s.inputLockUntil = 0;
    for (const a of Object.values(s.actors)) a.lockedUntil = 0;
    if (s.status === 'ENDING') { s.status = s.endResult; this.emit('end', { result: s.endResult }); }
  }

  _schedule(at, item) {
    item.at = at; item.seq = this.state.seq++;
    this.state.queue.push(item);
  }
  _runQueue() {
    const s = this.state;
    if (!s.queue.length) return;
    s.queue.sort(queueCmp); // Event Queue：時刻順、同時刻はカテゴリ順（77章）
    while (s.queue.length && s.queue[0].at <= s.t) this._execQueued(s.queue.shift());
  }
  _execQueued(item) {
    if (item.kind === 'effect') this._applyEffect(item.effect, item.eventId);
    else if (item.kind === 'event') {
      const ev = this.eventById.get(item.eventId);
      if (ev && this._isOpen(ev) && evalAll(ev.conditions, this.ctx())) this.resolveEvent(ev, { queued: true });
    }
  }

  _runTimeline() {
    const s = this.state;
    for (const tl of this.stage.timeline) {
      const last = s.timelineFired[tl.id];
      let due = false;
      if (tl.at != null) due = last == null && s.t >= tl.at;
      else if (tl.every) due = s.t >= (last == null ? tl.start : last + tl.every);
      if (!due) continue;
      s.timelineFired[tl.id] = s.t;
      if (!evalAll(tl.when, this.ctx())) continue;
      this._scheduleEffects(tl.effects, null, 0);
    }
  }

  // ── NPC 移動（決め打ちタイムライン＋ゆるい徘徊。12章） ──
  _setPath(a, points, loop) { a.path = points.map(p => ({ x: p.x, y: p.y })); a.pathIdx = 0; a.pathLoop = loop; a.moving = true; }
  _moveAll(dt) {
    const s = this.state;
    for (const a of Object.values(s.actors)) {
      if (!a.visible) continue;
      if (a.path) {
        stepAlong(a, dt, a.speed);
        if (!a.path && !a.pathLoop) { a.homeX = a.x; a.homeY = a.y; a.waitUntil = s.t + 1500; }
      } else if (a.wander > 0 && s.t >= a.waitUntil && s.t >= a.lockedUntil) {
        if (this.rand() < 0.5) { a.waitUntil = s.t + 1200 + this.rand() * 2600; continue; }
        const nx = clamp(a.homeX + (this.rand() * 2 - 1) * a.wander, 40, this.stage.world.width - 40);
        const ny = clamp(a.homeY + (this.rand() * 2 - 1) * a.wander * 0.25, 40, this.stage.world.height - 20);
        this._setPath(a, [{ x: nx, y: ny }], false);
        a.wanderMove = true;
      }
      if (a.wanderMove && !a.path) { a.wanderMove = false; a.homeX = a.homeX; }
    }
    for (const o of Object.values(s.objects)) {
      if (o.path) { stepAlong(o, dt, o.speed || 120); if (!o.path && o.state === 'MOVING') o.state = 'VISIBLE'; }
    }
  }

  // ── 吹き出しによるヒント（25章）：条件付きの新しい台詞を優先、同じ人物は重ねない ──
  _idleSpeech() {
    const s = this.state;
    const ctx = this.ctx();
    for (const def of Object.values(this.stage.actors)) {
      const a = s.actors[def.id];
      if (!a.visible || !def.idle.length || s.t < a.nextIdleAt || s.t < a.lockedUntil) continue;
      const ok = def.idle.map((l, i) => ({ l, i })).filter(({ l, i }) => evalAll(l.when, ctx) && !(l.once && a.idleSaid.includes(i)));
      if (!ok.length) { a.nextIdleAt = s.t + 2000; continue; }
      let pick = ok.find(({ l, i }) => l.when.length && !a.idleSaid.includes(i));
      if (!pick) pick = ok.find(({ i }) => i >= a.idleIdx) || ok[0];
      a.idleIdx = pick.i + 1;
      if (!a.idleSaid.includes(pick.i)) a.idleSaid.push(pick.i);
      const sp = this.stage.speeches[pick.l.speechId];
      this.emit('speech', { actorId: def.id, speech: sp, idle: true });
      a.nextIdleAt = s.t + def.idleEveryMs * (0.8 + this.rand() * 0.5) + sp.durationMs;
    }
  }

  // ── 画像取り込み（7章） ──
  canCapture(id, zoom = 99) {
    const e = this.entity(id);
    if (!e) return { ok: false, reason: 'UNKNOWN' };
    if (!e.capturable) return { ok: false, reason: 'DISABLED' };
    if (!this.isVisible(id)) return { ok: false, reason: 'HIDDEN' };
    const o = this.state.objects[id];
    if (o && (o.state === 'USED' || o.state === 'BROKEN')) return { ok: false, reason: 'USED' };
    if (e.minZoom && zoom < e.minZoom) return { ok: false, reason: 'ZOOM' };
    if (this.ended || this.state.status === 'ENDING') return { ok: false, reason: 'ENDED' };
    if (this.state.t < this.state.inputLockUntil) return { ok: false, reason: 'LOCKED' };
    return { ok: true };
  }
  capture(id, zoom = 99) {
    const r = this.canCapture(id, zoom);
    if (!r.ok) return r;
    this.state.capturedSourceId = id;
    this.log({ type: 'CAPTURE', sourceId: id });
    this.emit('capture', { sourceId: id });
    return { ok: true };
  }
  discard() { this.state.capturedSourceId = null; }

  log(entry) { this.state.actionLog.push({ t: Math.round(this.state.worldTimeMs), ...entry }); }

  // ── ちょっかい（8章） ──
  send(targetId) {
    const s = this.state;
    const sourceId = s.capturedSourceId;
    if (!sourceId) return { type: 'NO_CARD' };
    if (s.status !== 'PLAYING') return { type: 'ENDED' };
    if (s.t < s.inputLockUntil) return { type: 'INPUT_CONSUMED' }; // 78章 再入防止
    if (!this.isVisible(targetId) || !this.isTargetable(targetId)) return { type: 'NOT_TARGET' };
    const ta = s.actors[targetId];
    if (ta && s.t < ta.lockedUntil) return { type: 'INPUT_CONSUMED' }; // 145章 Target Lock
    s.capturedSourceId = null;
    return this.tryChokkai(sourceId, targetId);
  }

  isEventCandidate(ev) { return ev.category !== 'TIMEOUT'; }
  _isOpen(ev) { return !this.state.completedEvents.has(ev.id) && !this.state.invalidatedEvents.has(ev.id); }

  tryChokkai(sourceId, targetId) {
    const s = this.state;
    const key = sourceId + '>' + targetId;
    s.triggerCounts[key] = (s.triggerCounts[key] || 0) + 1;
    const ctx = this.ctx();
    const active = (this.byPair.get(key) || [])
      .filter(e => this.isEventCandidate(e))
      .filter(e => this._isOpen(e))
      .filter(e => evalAll(e.conditions, ctx))
      .filter(e => !e.triggerCountMin || s.triggerCounts[key] >= e.triggerCountMin);
    const ev = selectByPriority(active);
    if (!ev) {
      const r = this.resolveNoEffect(sourceId, targetId);
      this.log({ type: 'TARGET', sourceId, targetId, resultEventId: null });
      return r;
    }
    this.log({ type: 'TARGET', sourceId, targetId, resultEventId: ev.id });
    return this.resolveEvent(ev, { sourceId, targetId });
  }

  resolveNoEffect(sourceId, targetId) {
    const s = this.state;
    const ctx = this.ctx();
    const rx = this.stage.reactions.find(r => r.sourceId === sourceId && r.targetId === targetId && evalAll(r.when, ctx));
    s.journal.push({ eventId: null, timestampMs: s.worldTimeMs, sourceId, targetId, scoreAwarded: 0, result: 'NO_EFFECT' });
    if (rx) {
      if (rx.counter) s.counters[rx.counter] = (s.counters[rx.counter] || 0) + 1;
      const dur = animDuration(rx.anim);
      this._lockTarget(targetId, dur);
      this.emit('reaction', { sourceId, targetId, speech: rx.speechId ? this.stage.speeches[rx.speechId] : null, animationId: rx.anim, durationMs: dur });
      return { type: 'REACTION', sourceId, targetId };
    }
    s.worldTimeMs += this.opts.wrongActionPenaltyMs; // 33.2 時間ペナルティ
    this.emit('noEffect', { sourceId, targetId, durationMs: animDuration('react.nothing') });
    return { type: 'NO_EFFECT', sourceId, targetId };
  }

  _lockTarget(targetId, dur) {
    const a = this.state.actors[targetId];
    if (a) { a.lockedUntil = this.state.t + this.opts.presentDelayMs + dur; a.waitUntil = Math.max(a.waitUntil, a.lockedUntil); }
  }

  resolveEvent(ev, info = {}) {
    const s = this.state;
    if (s.completedEvents.has(ev.id)) return { type: 'ALREADY' };
    // コミットポイント（138章）：完了・無効化・得点・記録をまとめて確定
    s.completedEvents.add(ev.id);
    const invalidated = [];
    const g = ev.exclusiveGroupId && this.stage.exclusiveGroups[ev.exclusiveGroupId];
    if (g) for (const id of g.eventIds) if (id !== ev.id && !s.completedEvents.has(id) && !s.invalidatedEvents.has(id)) { s.invalidatedEvents.add(id); invalidated.push(id); }
    for (const id of ev.invalidates) if (!s.completedEvents.has(id) && !s.invalidatedEvents.has(id)) { s.invalidatedEvents.add(id); invalidated.push(id); }
    invalidated.push(...this._sweepBlocked());
    s.score += ev.points;
    s.journal.push({ eventId: ev.id, timestampMs: s.worldTimeMs, sourceId: ev.sourceId, targetId: ev.targetId, scoreAwarded: ev.points, result: ev.category === 'TIMEOUT' ? 'TIMEOUT' : 'SUCCESS' });

    const dur = animDuration(ev.animationId);
    const base = this.opts.presentDelayMs;
    if (ev.lockMode === 'INPUT') s.inputLockUntil = s.t + base + dur;
    this._lockTarget(ev.targetId, dur);
    const ta = s.actors[ev.targetId];
    const src = this.pos(ev.sourceId);
    if (ta && src && src !== ta) ta.facing = src.x < ta.x ? 'LEFT' : 'RIGHT';

    this.emit('event', { event: ev, durationMs: dur, invalidated, speech: ev.speechId ? this.stage.speeches[ev.speechId] : null, queued: !!info.queued, forced: !!info.forced });
    this._scheduleEffects(ev.effects, ev, base + Math.min(600, dur * 0.4));

    if (ev.category === 'TERMINAL' || ev.category === 'TIMEOUT') {
      s.status = 'ENDING';
      s.endResult = ev.category === 'TERMINAL' ? 'CLEAR' : 'TIMEOUT';
      s.endAt = s.t + base + Math.max(dur, this._effectsSpan(ev.effects)) + 900;
      s.capturedSourceId = null;
      // 終端が確定したら残りの通常イベントは EXPIRED 扱い（表示上のみ）
    }
    return { type: 'EVENT', event: ev, invalidated };
  }

  _effectsSpan(effects) {
    let cur = 0, max = 0;
    for (const fx of effects) { if (fx.type === 'WAIT') cur += fx.durationMs; else max = Math.max(max, cur + (fx.delayMs || 0) + (fx.durationMs || 0)); }
    return Math.max(cur, max);
  }

  _scheduleEffects(effects, ev, base) {
    let cur = base;
    for (const fx of effects) {
      if (fx.type === 'WAIT') { cur += fx.durationMs; continue; }
      if (fx.type === 'QUEUE_EVENT') { this._schedule(this.state.t + cur + (fx.delayMs || 0), { kind: 'event', eventId: fx.eventId, cat: CAT_ORDER[this.eventById.get(fx.eventId)?.category] ?? 3 }); continue; }
      this._schedule(this.state.t + cur + (fx.delayMs || 0), { kind: 'effect', effect: fx, eventId: ev && ev.id, cat: ev ? CAT_ORDER[ev.category] : 3 });
    }
  }

  // blocksIfCompleted / トップレベル eventNotDone が破られたイベントは今回のランで二度と起きない → INVALIDATED
  _sweepBlocked() {
    const s = this.state;
    const out = [];
    for (const ev of this.stage.events) {
      if (!this._isOpen(ev)) continue;
      const dead = ev.conditions.some(c => c.eventNotDone && s.completedEvents.has(c.eventNotDone));
      if (dead) { s.invalidatedEvents.add(ev.id); out.push(ev.id); }
    }
    return out;
  }

  _applyEffect(fx, eventId) {
    const s = this.state;
    const actor = fx.actorId && s.actors[fx.actorId];
    switch (fx.type) {
      case 'ACTOR_SET_STATE': if (actor) actor.state = fx.state; break;
      case 'ACTOR_MOVE': {
        if (!actor) break;
        const p = this.stage.paths[fx.pathId];
        if (p) { this._setPath(actor, p.points, p.loop); actor.speed = fx.speed || p.speed || actor.speed; }
        if (fx.wander != null) actor.wander = fx.wander; else actor.wander = Math.min(actor.wander, 20);
        if (fx.run) actor.running = true;
        break;
      }
      case 'ACTOR_FACE': if (actor) actor.facing = fx.direction; break;
      case 'ACTOR_SPEECH': this.emit('speech', { actorId: fx.actorId, speech: this.stage.speeches[fx.speechId] }); break;
      case 'ACTOR_ANIMATION': this.emit('anim', { actorId: fx.actorId, animationId: fx.animationId, durationMs: animDuration(fx.animationId) }); break;
      case 'ACTOR_APPEARANCE': if (actor) actor.look = { ...(actor.look || {}), ...fx.look }; break;
      case 'ACTOR_SHOW': if (actor) actor.visible = true; break;
      case 'ACTOR_HIDE': if (actor) actor.visible = false; break;
      case 'OBJECT_SET_STATE': if (s.objects[fx.objectId]) s.objects[fx.objectId].state = fx.state; break;
      case 'OBJECT_MOVE': {
        const o = s.objects[fx.objectId]; const p = this.stage.paths[fx.pathId];
        if (o && p) { o.path = p.points.map(q => ({ ...q })); o.pathIdx = 0; o.speed = fx.speed || p.speed; o.state = 'MOVING'; }
        break;
      }
      case 'OBJECT_APPEARANCE': if (s.objects[fx.objectId]) s.objects[fx.objectId].look = { ...(s.objects[fx.objectId].look || {}), ...fx.look }; break;
      case 'SET_FLAG': s.flags[fx.id] = fx.value; break;
      case 'INCREMENT_COUNTER': s.counters[fx.id] = (s.counters[fx.id] || 0) + (fx.amount ?? 1); break;
      case 'SPAWN_OBJECT':
        if (s.objects[fx.objectId]) s.objects[fx.objectId].state = 'VISIBLE';
        else if (s.actors[fx.objectId]) s.actors[fx.objectId].visible = true;
        break;
      case 'HIDE_OBJECT':
        if (s.objects[fx.objectId]) s.objects[fx.objectId].state = 'HIDDEN';
        else if (s.actors[fx.objectId]) s.actors[fx.objectId].visible = false;
        if (s.capturedSourceId === fx.objectId) s.capturedSourceId = null;
        break;
      default: this.emit('fx', { ...fx, eventId }); // SHOW_HINT / PLAY_SOUND / CAMERA_FOCUS / FX は表現層へ
    }
    this.emit('effect', { effect: fx, eventId });
  }

  // ── 時間切れ（31.2）：終端の代わりにタイムアウトイベントを強制発生 ──
  _timeout() {
    const s = this.state;
    s.worldTimeMs = s.timeLimitMs;
    const ev = this.stage.timeoutEventId && this.eventById.get(this.stage.timeoutEventId);
    if (ev && this._isOpen(ev)) { this.resolveEvent(ev, { forced: true }); return; }
    s.status = 'ENDING'; s.endResult = 'TIMEOUT'; s.endAt = s.t + 600; s.capturedSourceId = null;
  }

  abort() { if (!this.ended) { this.state.status = 'ABORTED'; this.emit('end', { result: 'ABORTED' }); } }

  // ── 状態機械（48章）── LOCKED / AVAILABLE / ARMED / COMPLETED / INVALIDATED / EXPIRED
  eventStatus(id) {
    const s = this.state; const ev = this.eventById.get(id);
    if (s.completedEvents.has(id)) return 'COMPLETED';
    if (s.invalidatedEvents.has(id)) return 'INVALIDATED';
    if (this.ended || s.status === 'ENDING') return 'EXPIRED';
    if (ev.category === 'TIMEOUT') return 'LOCKED';
    if (!evalAll(ev.conditions, this.ctx())) return 'LOCKED';
    return s.capturedSourceId === ev.sourceId ? 'ARMED' : 'AVAILABLE';
  }
  explainEvent(id) {
    const ev = this.eventById.get(id);
    const tree = explain(ev.conditions, this.ctx());
    return { event: ev, tree, status: this.eventStatus(id) };
  }

  // 強制発生（デバッグ：Force Event / Play Event）
  forceEvent(id) { const ev = this.eventById.get(id); if (ev && this._isOpen(ev)) return this.resolveEvent(ev, { forced: true }); return null; }

  // ── ヒント（30章）：クリアに必要な系統を優先して、いま起こせるイベントを 1 つ選ぶ ──
  hintCandidate() {
    const s = this.state;
    const ctx = this.ctx();
    const need = this.requirementClosure(this.stage.clearEventId);
    const ok = this.stage.events.filter(e => this.isEventCandidate(e) && this._isOpen(e) && evalAll(e.conditions, ctx)
      && this.isVisible(e.targetId) && this.isVisible(e.sourceId) && this.canCapture(e.sourceId).reason !== 'USED');
    ok.sort((a, b) => (need.has(b.id) - need.has(a.id)) || (b.priority - a.priority) || (a.sortOrder - b.sortOrder));
    return ok[0] || null;
  }
  requirementClosure(id, out = new Set()) {
    const ev = this.eventById.get(id);
    if (!ev || out.has(id)) return out;
    out.add(id);
    const walk = list => { for (const c of list) { if (c.eventDone) this.requirementClosure(c.eventDone, out); if (c.all) walk(c.all); if (c.allEventsDone) c.allEventsDone.forEach(x => this.requirementClosure(x, out)); if (c.any) walk(c.any.slice(0, 1)); if (c.anyEventDone) this.requirementClosure(c.anyEventDone[0], out); } };
    walk(ev.conditions);
    return out;
  }

  // ── セーブ（137章 クラッシュ復旧用スナップショット） ──
  serialize() {
    const s = this.state;
    return JSON.parse(JSON.stringify({ ...s, completedEvents: [...s.completedEvents], invalidatedEvents: [...s.invalidatedEvents] }));
  }
  restore(data) {
    this.reset();
    const s = Object.assign(this.state, JSON.parse(JSON.stringify(data)));
    s.completedEvents = new Set(data.completedEvents);
    s.invalidatedEvents = new Set(data.invalidatedEvents);
    // 復帰時は演出待ちを解除（ロック・演出の再生はしない）
    s.inputLockUntil = 0;
    for (const a of Object.values(s.actors)) { a.lockedUntil = 0; a.nextIdleAt = s.t + 1500; }
  }
}

export function selectByPriority(list) {
  if (!list.length) return null;
  return [...list].sort((a, b) => (b.priority - a.priority) || (a.sortOrder - b.sortOrder))[0];
}

function queueCmp(a, b) { return (a.at - b.at) || (a.cat - b.cat) || (a.seq - b.seq); }
function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
function hash(str) { let h = 2166136261; for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function stepAlong(a, dt, speed) {
  let budget = speed * dt / 1000;
  while (a.path && budget > 0) {
    const p = a.path[a.pathIdx];
    const dx = p.x - a.x, dy = p.y - a.y;
    const d = Math.hypot(dx, dy);
    if (Math.abs(dx) > 0.5 && a.facing !== undefined) a.facing = dx < 0 ? 'LEFT' : 'RIGHT';
    if (d <= budget) {
      a.x = p.x; a.y = p.y; budget -= d;
      a.pathIdx++;
      if (a.pathIdx >= a.path.length) {
        if (a.pathLoop) a.pathIdx = 0; else { a.path = null; a.moving = false; a.running = false; }
      }
    } else { a.x += dx / d * budget; a.y += dy / d * budget; budget = 0; }
  }
}

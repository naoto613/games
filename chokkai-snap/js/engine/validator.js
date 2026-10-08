// Content Validator / Event Graph / Reachability（仕様 43/47/60/64/101/102 章）。DOM 非依存。
import { condKey, referencedEvents, CONDITION_KEYS } from './condition.js';
import { ANIMATIONS } from './animations.js';
import { CATEGORIES, EFFECT_TYPES, ACTOR_STATES, OBJECT_STATES, FX_KINDS, SOUND_IDS } from './content.js';
import { StageRuntime } from './runtime.js';

export function validateStage(stage) {
  const errors = [...(stage.normalizeErrors || [])];
  const warns = [];
  const evIds = new Set();
  const ents = new Set([...Object.keys(stage.actors), ...Object.keys(stage.objects)]);
  for (const ev of stage.events) {
    if (evIds.has(ev.id)) errors.push(`Event ID duplicate: ${ev.id}`);
    evIds.add(ev.id);
  }
  const checkCond = (c, where) => {
    let k;
    try { k = condKey(c); } catch (e) { errors.push(`${where}: ${e.message}`); return; }
    const v = c[k];
    if (k === 'eventDone' || k === 'eventNotDone') { if (!evIds.has(v)) errors.push(`${where}: Unknown required event ${v}`); }
    else if (k === 'anyEventDone' || k === 'allEventsDone') v.forEach(x => { if (!evIds.has(x)) errors.push(`${where}: Unknown required event ${x}`); });
    else if (k === 'actorStateEquals') { if (!stage.actors[v.actorId]) errors.push(`${where}: Unknown actor ${v.actorId}`); if (!ACTOR_STATES.includes(v.value)) errors.push(`${where}: Unknown actor state ${v.value}`); }
    else if (k === 'objectStateEquals') { if (!stage.objects[v.objectId]) errors.push(`${where}: Unknown object ${v.objectId}`); if (!OBJECT_STATES.includes(v.value)) errors.push(`${where}: Unknown object state ${v.value}`); }
    else if (k === 'actorVisible') { if (!stage.actors[v]) errors.push(`${where}: Unknown actor ${v}`); }
    else if (k === 'objectVisible') { if (!stage.objects[v]) errors.push(`${where}: Unknown object ${v}`); }
    else if (k === 'all' || k === 'any') v.forEach(x => checkCond(x, where));
    else if (k === 'not') checkCond(v, where);
  };
  const checkFx = (fx, where) => {
    if (!EFFECT_TYPES.includes(fx.type)) { errors.push(`${where}: Unknown effect type ${fx.type}`); return; }
    if (fx.actorId && !stage.actors[fx.actorId]) errors.push(`${where}: Unknown actor ${fx.actorId}`);
    if (fx.objectId && !ents.has(fx.objectId)) errors.push(`${where}: Unknown object ${fx.objectId}`);
    if (fx.pathId && !stage.paths[fx.pathId]) errors.push(`${where}: Unknown path ${fx.pathId}`);
    if (fx.speechId && !stage.speeches[fx.speechId]) errors.push(`${where}: Unknown speech ${fx.speechId}`);
    if (fx.type === 'QUEUE_EVENT' && !evIds.has(fx.eventId)) errors.push(`${where}: Unknown queued event ${fx.eventId}`);
    if (fx.type === 'ACTOR_SET_STATE' && !ACTOR_STATES.includes(fx.state)) errors.push(`${where}: Unknown actor state ${fx.state}`);
    if (fx.type === 'OBJECT_SET_STATE' && !OBJECT_STATES.includes(fx.state)) errors.push(`${where}: Unknown object state ${fx.state}`);
    if (fx.type === 'ACTOR_ANIMATION' && !ANIMATIONS[fx.animationId]) errors.push(`${where}: Unknown animationId ${fx.animationId}`);
    if (fx.type === 'FX' && !FX_KINDS.includes(fx.kind)) errors.push(`${where}: Unknown FX kind ${fx.kind}`);
    if (fx.type === 'FX' && fx.at && !ents.has(fx.at)) errors.push(`${where}: Unknown FX anchor ${fx.at}`);
    if ((fx.type === 'PLAY_SOUND' || fx.type === 'PLAY_MUSIC_STING') && !SOUND_IDS.includes(fx.soundId)) errors.push(`${where}: Unknown soundId ${fx.soundId}`);
  };
  for (const ev of stage.events) {
    const w = ev.id;
    if (!ev.journalText) errors.push(`${w}: journalText がない`);
    if (!CATEGORIES.includes(ev.category)) errors.push(`${w}: Unknown category ${ev.category}`);
    if (!ents.has(ev.sourceId)) errors.push(`${w}: Unknown sourceId ${ev.sourceId}`);
    if (!ents.has(ev.targetId)) errors.push(`${w}: Unknown targetId ${ev.targetId}`);
    if (!ANIMATIONS[ev.animationId]) errors.push(`${w}: Unknown animationId ${ev.animationId}`);
    if (ev.speechId && !stage.speeches[ev.speechId]) errors.push(`${w}: Unknown speech ${ev.speechId}`);
    const ent = stage.actors[ev.sourceId] || stage.objects[ev.sourceId];
    if (ent && !ent.capturable && ev.category !== 'TIMEOUT') errors.push(`${w}: source ${ev.sourceId} が capturable でない`);
    ev.conditions.forEach(c => checkCond(c, w));
    const refs = referencedEvents(ev.conditions);
    if (refs.requires.has(ev.id)) errors.push(`${w}: Event requires itself`);
    if (refs.requires.has(ev.id) && refs.blocks.has(ev.id)) errors.push(`${w}: impossible condition`);
    for (const r of refs.requires) if (refs.blocks.has(r)) errors.push(`${w}: impossible condition (${r} を必須かつ禁止)`);
    ev.effects.forEach(fx => checkFx(fx, w));
    ev.invalidates.forEach(x => { if (!evIds.has(x)) errors.push(`${w}: Unknown invalidated event ${x}`); });
  }
  for (const g of Object.values(stage.exclusiveGroups)) {
    if (g.eventIds.length < 2) warns.push(`exclusive group ${g.id} のイベントが 1 件以下`);
    g.eventIds.forEach(x => { if (!evIds.has(x)) errors.push(`exclusive group ${g.id}: Unknown event ${x}`); });
  }
  for (const a of Object.values(stage.actors)) a.idle.forEach(l => l.when.forEach(c => checkCond(c, `${a.id}.idle`)));
  for (const r of stage.reactions) { if (!ents.has(r.sourceId) || !ents.has(r.targetId)) errors.push(`reaction ${r.sourceId}>${r.targetId}: Unknown entity`); r.when.forEach(c => checkCond(c, 'reaction')); }
  for (const tl of stage.timeline) { tl.effects.forEach(fx => checkFx(fx, tl.id)); tl.when.forEach(c => checkCond(c, tl.id)); }
  const clear = stage.events.find(e => e.id === stage.clearEventId);
  if (!clear) errors.push(`clearEventId ${stage.clearEventId} が存在しない`);
  else if (clear.category !== 'TERMINAL') errors.push(`${clear.id}: clear event の category が TERMINAL でない`);
  if (stage.timeoutEventId) {
    const to = stage.events.find(e => e.id === stage.timeoutEventId);
    if (!to) errors.push(`timeoutEventId ${stage.timeoutEventId} が存在しない`);
    else if (to.category !== 'TIMEOUT') errors.push(`${to.id}: timeout event の category が TIMEOUT でない`);
  }
  // 循環依存（102章）
  const graph = eventGraph(stage);
  const req = new Map(stage.events.map(e => [e.id, graph.edges.filter(x => x.to === e.id && x.type === 'requires').map(x => x.from)]));
  const color = new Map();
  const dfs = (id, stack) => {
    color.set(id, 1);
    for (const d of req.get(id) || []) {
      if (color.get(d) === 1) errors.push(`Circular dependency ${[...stack, id, d].slice(stack.indexOf(d) >= 0 ? stack.indexOf(d) : 0).join(' -> ')}`);
      else if (!color.get(d)) dfs(d, [...stack, id]);
    }
    color.set(id, 2);
  };
  for (const ev of stage.events) if (!color.get(ev.id)) dfs(ev.id, []);
  return { errors, warns };
}

// Event Graph（43章）：nodes と requires / blocks / invalidates / queues の辺
export function eventGraph(stage) {
  const nodes = stage.events.map(e => ({ id: e.id, source: e.sourceId, target: e.targetId, points: e.points, category: e.category, title: e.journalText }));
  const edges = [];
  for (const ev of stage.events) {
    const r = referencedEvents(ev.conditions);
    r.requires.forEach(x => edges.push({ from: x, to: ev.id, type: 'requires' }));
    r.soft.forEach(x => edges.push({ from: x, to: ev.id, type: 'requires-any' }));
    r.blocks.forEach(x => edges.push({ from: x, to: ev.id, type: 'blocks' }));
    ev.invalidates.forEach(x => edges.push({ from: ev.id, to: x, type: 'invalidates' }));
    ev.effects.filter(f => f.type === 'QUEUE_EVENT').forEach(f => edges.push({ from: ev.id, to: f.eventId, type: 'queues' }));
  }
  for (const g of Object.values(stage.exclusiveGroups)) for (const a of g.eventIds) for (const b of g.eventIds) if (a < b) edges.push({ from: a, to: b, type: 'exclusive', group: g.id });
  return { nodes, edges };
}

// ── Automated Stage Solver（101章）：ロジック到達性だけを検査する ──
export function makeSolverRuntime(stage) {
  const rt = new StageRuntime(stage, { presentDelayMs: 0, idleFirstDelayMs: 1e12, wrongActionPenaltyMs: 0, timeLimitMs: 1e12 });
  rt.start();
  return rt;
}

function actionsOf(stage) {
  const pairs = new Map();
  for (const ev of stage.events) if (ev.category !== 'TIMEOUT') pairs.set(ev.sourceId + '>' + ev.targetId, [ev.sourceId, ev.targetId]);
  for (const r of stage.reactions) if (r.counter) pairs.set(r.sourceId + '>' + r.targetId, [r.sourceId, r.targetId]);
  const list = [...pairs.values()];
  if (stage.timeline.length) list.push(['WAIT', 'WAIT']);
  return list;
}

function stateKey(rt) {
  const s = rt.state;
  const tc = {};
  for (const ev of rt.stage.events) if (ev.triggerCountMin) { const k = ev.sourceId + '>' + ev.targetId; tc[k] = Math.min(s.triggerCounts[k] || 0, ev.triggerCountMin); }
  return [...s.completedEvents].sort().join(',') + '|' + JSON.stringify(s.counters) + '|' + JSON.stringify(s.flags) + '|' + JSON.stringify(tc) + '|' + Math.floor(s.t / 10000);
}

function doAction(rt, [src, tgt]) {
  if (src === 'WAIT') { rt.update(10000); rt.flush(); return { type: 'WAIT' }; }
  const c = rt.capture(src);
  if (!c.ok) return { type: 'CANT_CAPTURE' };
  const r = rt.send(tgt);
  rt.flush();
  return r;
}

// goalId に到達する操作列を探す（DFS + 目標の依存集合を優先）
export function solveFor(stage, goalId, { maxNodes = 4000, allowTerminal = false } = {}) {
  const goal = stage.events.find(e => e.id === goalId);
  if (!goal) return { ok: false, reason: 'unknown event' };
  if (goal.category === 'TIMEOUT') return { ok: true, path: [], note: 'timeout は時間切れで強制発生' };
  const rt = makeSolverRuntime(stage);
  const acts = actionsOf(stage);
  const closure = rt.requirementClosure(goalId);
  const goalPair = goal.sourceId + '>' + goal.targetId;
  const prio = a => {
    const k = a[0] + '>' + a[1];
    if (k === goalPair) return 0;
    if ((rt.byPair.get(k) || []).some(e => closure.has(e.id))) return 1;
    if (a[0] === 'WAIT') return 3;
    return 2;
  };
  acts.sort((a, b) => prio(a) - prio(b));
  const seen = new Set();
  const stack = [{ snap: rt.serialize(), path: [] }];
  let nodes = 0;
  while (stack.length && nodes < maxNodes) {
    const { snap, path } = stack.pop();
    rt.restore(snap);
    const key = stateKey(rt);
    if (seen.has(key)) continue;
    seen.add(key); nodes++;
    const children = [];
    for (const a of acts) {
      rt.restore(snap);
      const before = stateKey(rt);
      const r = doAction(rt, a);
      if (rt.state.completedEvents.has(goalId)) return { ok: true, path: [...path, a], nodes };
      if (r.type === 'EVENT' && (r.event.category === 'TERMINAL') && !allowTerminal) continue;
      if (rt.state.invalidatedEvents.has(goalId) || rt.ended) continue;
      if (stateKey(rt) === before) continue;
      children.push({ snap: rt.serialize(), path: [...path, a] });
    }
    for (let i = children.length - 1; i >= 0; i--) stack.push(children[i]);
  }
  return { ok: false, nodes, reason: nodes >= maxNodes ? 'search limit' : 'unreachable' };
}

export function reachability(stage, opts = {}) {
  const out = {};
  for (const ev of stage.events) out[ev.id] = solveFor(stage, ev.id, { ...opts, allowTerminal: ev.category === 'TERMINAL' });
  return out;
}

// 1 つの操作列を実行して到達状態を返す（Play Event / テスト用）
export function replay(stage, path, rt = makeSolverRuntime(stage)) {
  for (const a of path) doAction(rt, a);
  return rt;
}

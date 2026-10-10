// コンテンツ正規化：ステージ作者向けの短い記法 → 仕様 5/13/14 章の StageDefinition / EventDefinition
// DOM 非依存。Node（検証ツール・テスト）からもそのまま読み込む。

export const CATEGORY_PRIORITY = { TIMEOUT: 10, TERMINAL: 10, PROGRESSION: 9, BRANCH: 8, CHAIN: 6, NORMAL: 4, FLAVOR: 2, DECOY: 0 };
export const CATEGORY_POINTS = { FLAVOR: 1, CHAIN: 3, BRANCH: 5, PROGRESSION: 7, TERMINAL: 10, TIMEOUT: 0 };
export const CATEGORIES = ['FLAVOR', 'CHAIN', 'PROGRESSION', 'BRANCH', 'TERMINAL', 'TIMEOUT'];
export const ACTOR_STATES = ['IDLE', 'WALKING', 'RUNNING', 'WAITING', 'BUSY', 'HAPPY', 'ANGRY', 'SURPRISED', 'EMBARRASSED', 'SAD', 'SCARED', 'RESOLVED'];
export const OBJECT_STATES = ['VISIBLE', 'HIDDEN', 'MOVING', 'USED', 'BROKEN'];
export const EFFECT_TYPES = [
  'ACTOR_SET_STATE', 'ACTOR_MOVE', 'ACTOR_FACE', 'ACTOR_SPEECH', 'ACTOR_ANIMATION', 'ACTOR_APPEARANCE', 'ACTOR_SHOW', 'ACTOR_HIDE',
  'OBJECT_SET_STATE', 'OBJECT_MOVE', 'OBJECT_APPEARANCE', 'SET_FLAG', 'INCREMENT_COUNTER', 'SPAWN_OBJECT', 'HIDE_OBJECT',
  'SHOW_HINT', 'PLAY_SOUND', 'PLAY_MUSIC_STING', 'CAMERA_FOCUS', 'WAIT', 'QUEUE_EVENT', 'FX',
];

export const FX_KINDS = ['sparkle', 'hearts', 'smoke', 'steam', 'fire', 'splash', 'flash', 'confetti', 'stars', 'paper', 'eruption', 'lightning', 'big', 'zzz', 'ink', 'bubbles', 'notes', 'leaves'];
export const SOUND_IDS = ['capture', 'send', 'success', 'surprise', 'laugh', 'hit', 'vehicle', 'tv', 'boom', 'splash', 'train', 'bell', 'whistle', 'roar', 'fanfare', 'thunder', 'pop', 'crash'];

const DEFAULT_ANIM = { FLAVOR: 'react.surprised', CHAIN: 'react.think', PROGRESSION: 'react.happy', BRANCH: 'react.think', TERMINAL: 'react.terminal', TIMEOUT: 'react.timeout' };

export function normalizeStage(raw) {
  const errors = [];
  const id = raw.id;
  const speeches = {};
  const addSpeech = (sid, actorId, text, extra = {}) => {
    speeches[sid] = { id: sid, actorId, textKey: sid, text: { ja: text }, durationMs: extra.durationMs || Math.min(4200, 1600 + text.length * 70), bubbleType: extra.bubble || 'SPEECH', worldAnchor: 'HEAD', priority: extra.priority || 1 };
    return sid;
  };

  const actors = {};
  for (const [aid, a] of Object.entries(raw.actors || {})) {
    actors[aid] = {
      id: aid, kind: 'actor', name: a.name, x: a.x, y: a.y,
      look: a.look || null, emoji: a.emoji || null, size: a.size || (a.emoji ? 70 : 1),
      capturable: a.capturable !== false, targetable: a.targetable !== false,
      hidden: !!a.hidden, facing: a.facing || 'RIGHT',
      wander: a.wander ?? (a.path ? 0 : 40), path: a.path || null, speed: a.speed || 60,
      minZoom: a.minZoom || 0, layer: a.layer || 0, z: a.z ?? null,
      idle: (a.idle || []).map((l, i) => {
        const line = typeof l === 'string' ? { text: l } : l;
        return { speechId: addSpeech(`${id}.${aid}.idle${i}`, aid, line.text, { bubble: line.bubble }), when: line.when || [], once: !!line.once };
      }),
      idleEveryMs: a.idleEveryMs || 9000,
      routeId: a.route || null,
    };
  }
  const objects = {};
  for (const [oid, o] of Object.entries(raw.objects || {})) {
    if (actors[oid]) errors.push(`ID 重複: ${oid}`);
    objects[oid] = {
      id: oid, kind: 'object', name: o.name, x: o.x, y: o.y,
      emoji: o.emoji || null, size: o.size || 44, sign: o.sign || null, w: o.w || null, h: o.h || null, draw: o.draw || null,
      capturable: o.capturable !== false, targetable: !!o.targetable,
      initialState: o.hidden ? 'HIDDEN' : 'VISIBLE', minZoom: o.minZoom || 0, layer: o.layer || 0,
      variants: o.variants || null, rot: o.rot || 0,
      prop: o.prop || null, propOpts: o.propOpts || {}, z: o.z ?? null,
    };
  }

  const paths = {};
  for (const [pid, p] of Object.entries(raw.paths || {})) paths[pid] = { id: pid, points: p.points.map(([x, y]) => ({ x, y })), speed: p.speed || 90, loop: !!p.loop };

  const groups = {};
  for (const g of raw.exclusiveGroups || []) groups[g.id] = { id: g.id, policy: g.policy || 'FIRST_TRIGGER_WINS', eventIds: [...g.eventIds] };

  const normEffect = (fx, evId, k) => {
    const e = { ...fx };
    if (e.type === 'ACTOR_SPEECH' && e.text != null) {
      e.speechId = addSpeech(`${evId}.fx${k}`, e.actorId, e.text, { bubble: e.bubble });
      delete e.text;
    }
    if ((e.type === 'ACTOR_MOVE' || e.type === 'OBJECT_MOVE') && e.to) {
      const pid = `${evId}.path${k}`;
      paths[pid] = { id: pid, points: [{ x: e.to[0], y: e.to[1] }], speed: e.speed || 120, loop: false, relative: false };
      e.pathId = pid; delete e.to;
    }
    return e;
  };

  const events = [];
  (raw.events || []).forEach((r, idx) => {
    const cat = r.cat || 'FLAVOR';
    const conditions = [...(r.cond || [])];
    (r.requires || []).forEach(x => conditions.push({ eventDone: x }));
    (r.blocksIfCompleted || []).forEach(x => conditions.push({ eventNotDone: x }));
    const effects = [];
    let k = 0;
    // 反応の台詞（ターゲット本人）
    let speechId;
    if (r.say) speechId = addSpeech(`${r.id}.say`, r.t, r.say, { priority: 3 });
    for (const fx of r.fx || []) effects.push(normEffect(fx, r.id, k++));
    // after: [{actor, text, delay}] → WAIT + ACTOR_SPEECH（イベント後の手がかり放出、156章）
    for (const a of r.after || []) {
      effects.push({ type: 'ACTOR_SPEECH', actorId: a.actor, speechId: addSpeech(`${r.id}.after${k++}`, a.actor, a.text, { bubble: a.bubble }), delayMs: a.delay ?? 2600 });
    }
    if (r.group) {
      groups[r.group] = groups[r.group] || { id: r.group, policy: 'FIRST_TRIGGER_WINS', eventIds: [] };
      if (!groups[r.group].eventIds.includes(r.id)) groups[r.group].eventIds.push(r.id);
    }
    events.push({
      id: r.id, stageId: id, sourceId: r.s, targetId: r.t,
      category: cat, priority: r.priority ?? (r.decoy ? CATEGORY_PRIORITY.DECOY : CATEGORY_PRIORITY[cat]), sortOrder: idx,
      conditions, exclusiveGroupId: r.group || null,
      invalidates: r.invalidates || [], requiresCompleted: r.requires || [], blocksIfCompleted: r.blocksIfCompleted || [],
      triggerCountMin: r.triggerCountMin || 0,
      effects, points: r.points ?? CATEGORY_POINTS[cat],
      animationId: r.anim || DEFAULT_ANIM[cat], speechId, soundId: r.sound || null,
      journalText: r.title, developerNote: r.note || null, decoy: !!r.decoy,
      routeId: r.route || null, lockMode: r.lock || (cat === 'TERMINAL' || cat === 'TIMEOUT' ? 'INPUT' : 'TARGET_ONLY'),
      focus: !!r.focus || cat === 'TERMINAL' || cat === 'TIMEOUT',
    });
  });
  for (const g of Object.values(groups)) for (const eid of g.eventIds) {
    const ev = events.find(e => e.id === eid);
    if (ev && !ev.exclusiveGroupId) ev.exclusiveGroupId = g.id;
  }

  const reactions = (raw.reactions || []).map((r, i) => ({
    sourceId: r.s, targetId: r.t, when: r.when || [],
    speechId: r.say ? addSpeech(`${id}.reaction${i}`, r.t, r.say) : null,
    counter: r.counter || null, anim: r.anim || 'react.shrug',
  }));

  const timeline = (raw.timeline || []).map((t, i) => ({
    id: `${id}.tl${i}`, at: t.at ?? null, every: t.every ?? null, start: t.start ?? t.every ?? 0, when: t.when || [],
    effects: (t.effects || []).map((fx, k) => normEffect(fx, `${id}.tl${i}`, k)),
  }));

  return {
    id, title: raw.title, subtitle: raw.subtitle || '', theme: raw.theme || '', intro: raw.intro || '',
    timeLimitMs: raw.timeLimitMs,
    world: { width: raw.world.width, height: raw.world.height, minZoom: raw.world.minZoom ?? 0.75, maxZoom: raw.world.maxZoom ?? 4, spawnCamera: raw.world.spawnCamera, bg: raw.world.bg || '#ddd', horizon: raw.world.horizon },
    scenery: raw.scenery || [],
    actors, objects, paths, events, exclusiveGroups: groups, speeches, reactions, timeline,
    routes: raw.routes || {},
    clearEventId: raw.clearEventId, timeoutEventId: raw.timeoutEventId || null,
    hintConfig: raw.hintConfig || { cooldownMs: 12000 },
    bgm: raw.bgm || { tempo: 100, key: 0, mood: 'major' },
    tutorial: raw.tutorial || null,
    normalizeErrors: errors,
  };
}

export function entityOf(stage, id) { return stage.actors[id] || stage.objects[id] || null; }

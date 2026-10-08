// 条件エンジン（仕様 9章）。DOM 非依存。
// ctx: { completed:Set, counters:{}, flags:{}, actors:{id:{state,visible}}, objects:{id:{state}}, remainingMs }

export const CONDITION_KEYS = [
  'eventDone', 'eventNotDone', 'anyEventDone', 'allEventsDone',
  'countAtLeast', 'countAtMost', 'flagEquals',
  'actorStateEquals', 'objectStateEquals',
  'timeRemainingAtLeastMs', 'timeRemainingAtMostMs',
  'actorVisible', 'objectVisible', 'all', 'any', 'not',
];

export function condKey(c) {
  const k = Object.keys(c);
  if (k.length !== 1 || !CONDITION_KEYS.includes(k[0])) throw new Error('不正な条件: ' + JSON.stringify(c));
  return k[0];
}

export function evalCondition(c, ctx) {
  const k = condKey(c);
  const v = c[k];
  switch (k) {
    case 'eventDone': return ctx.completed.has(v);
    case 'eventNotDone': return !ctx.completed.has(v);
    case 'anyEventDone': return v.some(id => ctx.completed.has(id));
    case 'allEventsDone': return v.every(id => ctx.completed.has(id));
    case 'countAtLeast': return (ctx.counters[v.id] || 0) >= v.value;
    case 'countAtMost': return (ctx.counters[v.id] || 0) <= v.value;
    case 'flagEquals': return ctx.flags[v.id] === v.value;
    case 'actorStateEquals': return ctx.actors[v.actorId]?.state === v.value;
    case 'objectStateEquals': return ctx.objects[v.objectId]?.state === v.value;
    case 'timeRemainingAtLeastMs': return ctx.remainingMs >= v;
    case 'timeRemainingAtMostMs': return ctx.remainingMs <= v;
    case 'actorVisible': return ctx.actors[v] ? ctx.actors[v].visible !== false : false;
    case 'objectVisible': return ctx.objects[v] ? ['VISIBLE', 'MOVING'].includes(ctx.objects[v].state) : false;
    case 'all': return v.every(x => evalCondition(x, ctx));
    case 'any': return v.some(x => evalCondition(x, ctx));
    case 'not': return !evalCondition(v, ctx);
  }
  return false;
}

export function evalAll(list, ctx) {
  return (list || []).every(c => evalCondition(c, ctx));
}

// Condition Debugger 用：各条件の評価結果をツリーで返す
export function explain(list, ctx) {
  return (list || []).map(c => explainOne(c, ctx));
}
function explainOne(c, ctx) {
  const k = condKey(c);
  const ok = evalCondition(c, ctx);
  const node = { label: describe(c), ok };
  if (k === 'all' || k === 'any') node.children = c[k].map(x => explainOne(x, ctx));
  if (k === 'not') node.children = [explainOne(c.not, ctx)];
  if (k === 'anyEventDone' || k === 'any') {
    const hit = (k === 'any' ? c.any : c.anyEventDone.map(id => ({ eventDone: id })))
      .filter(x => evalCondition(x, ctx)).map(describe);
    if (hit.length) node.label += '  [' + hit.join(', ') + ']';
  }
  return node;
}

export function describe(c) {
  const k = condKey(c);
  const v = c[k];
  switch (k) {
    case 'eventDone': return v;
    case 'eventNotDone': return 'NOT ' + v;
    case 'anyEventDone': return 'any(' + v.join(',') + ')';
    case 'allEventsDone': return 'all(' + v.join(',') + ')';
    case 'countAtLeast': return `COUNT(${v.id}) >= ${v.value}`;
    case 'countAtMost': return `COUNT(${v.id}) <= ${v.value}`;
    case 'flagEquals': return `FLAG(${v.id}) == ${JSON.stringify(v.value)}`;
    case 'actorStateEquals': return `${v.actorId}.state == ${v.value}`;
    case 'objectStateEquals': return `${v.objectId}.state == ${v.value}`;
    case 'timeRemainingAtLeastMs': return `残り >= ${v / 1000}s`;
    case 'timeRemainingAtMostMs': return `残り <= ${v / 1000}s`;
    case 'actorVisible': return `visible(${v})`;
    case 'objectVisible': return `visible(${v})`;
    case 'all': return 'all';
    case 'any': return 'any';
    case 'not': return 'not';
  }
  return k;
}

// 条件ツリーから参照しているイベント ID を集める（グラフ・検証用）
export function referencedEvents(list, out = { requires: new Set(), blocks: new Set(), soft: new Set() }, neg = false) {
  for (const c of list || []) {
    const k = condKey(c);
    const v = c[k];
    if (k === 'eventDone') (neg ? out.blocks : out.requires).add(v);
    else if (k === 'eventNotDone') (neg ? out.requires : out.blocks).add(v);
    else if (k === 'anyEventDone' || k === 'allEventsDone') v.forEach(id => (k === 'allEventsDone' && !neg ? out.requires : out.soft).add(id));
    else if (k === 'all') referencedEvents(v, out, neg);
    else if (k === 'any') { const t = { requires: new Set(), blocks: new Set(), soft: new Set() }; referencedEvents(v, t, neg); [...t.requires, ...t.soft].forEach(x => out.soft.add(x)); t.blocks.forEach(x => out.blocks.add(x)); }
    else if (k === 'not') referencedEvents([v], out, !neg);
  }
  return out;
}

// Condition DSL（仕様 103章）： DONE(S1-E03) AND NOT DONE(S1-E18) AND COUNT(x) >= 3
export function compileDSL(src) {
  const toks = src.match(/\(|\)|>=|<=|==|[A-Za-z0-9_.\-:]+|"[^"]*"/g) || [];
  let i = 0;
  const peek = () => toks[i], next = () => toks[i++];
  function expr() {
    let left = term();
    const ors = [left];
    while (peek() === 'OR') { next(); ors.push(term()); }
    return ors.length > 1 ? { any: ors } : left;
  }
  function term() {
    const ands = [factor()];
    while (peek() === 'AND') { next(); ands.push(factor()); }
    return ands.length > 1 ? { all: ands } : ands[0];
  }
  function factor() {
    const t = next();
    if (t === 'NOT') return { not: factor() };
    if (t === '(') { const e = expr(); next(); return e; }
    if (t === 'DONE') { next(); const id = next(); next(); return { eventDone: id }; }
    if (t === 'COUNT') {
      next(); const id = next(); next();
      const op = next(); const val = Number(next());
      if (op === '>=') return { countAtLeast: { id, value: val } };
      if (op === '<=') return { countAtMost: { id, value: val } };
      throw new Error('COUNT の演算子が不正: ' + op);
    }
    if (t === 'FLAG') {
      next(); const id = next(); next(); next();
      const raw = next();
      const value = raw.startsWith('"') ? raw.slice(1, -1) : raw === 'true' ? true : raw === 'false' ? false : Number(raw);
      return { flagEquals: { id, value } };
    }
    throw new Error('DSL を解釈できません: ' + t);
  }
  const r = expr();
  if (i < toks.length) throw new Error('DSL の末尾が余っています: ' + toks.slice(i).join(' '));
  return r;
}

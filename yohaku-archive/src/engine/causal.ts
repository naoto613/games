// 因果編集エンジン（探索・クエスト・戦闘で共通に使う）。DOM には依存しない。
import { evalCond, compare, CMP_RE } from './cond';

export type Op = 'connect' | 'cut' | 'invert' | 'hold';
export type LinkState = 'intact' | 'severed' | 'possible';

export const OP_NAME: Record<Op, string> = { connect: '接続', cut: '切断', invert: '反転', hold: '保留' };
export const DEFAULT_COST: Record<Op, number> = { connect: 2, cut: 2, invert: 3, hold: 2 };

export interface NodeDef {
  id: string;
  label: string;
  desc?: string;
  x: number;
  y: number;
  /** 事実として成立している出来事 */
  base?: boolean;
  /** 戦闘中に状態から読む条件（engine/battle の sensor 名） */
  sensor?: string;
  /** any: どれか1つの原因 / all: すべての原因 / 数値: N 個以上の原因 */
  mode?: 'any' | 'all' | number;
  /** 原因が無いまま成立していると「欠因」の矛盾になる */
  needsCause?: boolean;
  tag?: 'contra' | 'intent' | 'goal' | 'fact' | 'party' | 'enemy' | 'cost';
  /** 表示に必要な記録 */
  requires?: string[];
  /** 表示に必要な観測能力 */
  obs?: number;
  ops?: Op[];
  cost?: Partial<Record<Op, number>>;
  /** 戦闘での継続効果（成立中のみ）: "atkUp:30" など */
  effect?: string[];
}

export interface LinkDef {
  id: string;
  from: string;
  to: string;
  type?: 'cause' | 'inhibit';
  state: LinkState;
  ops?: Op[];
  cost?: Partial<Record<Op, number>>;
  /** 編集の根拠として必要な記録 */
  requires?: string[];
  /** 編集されるまで（または明かされるまで）表示しない */
  hidden?: boolean;
  /** これを接続すると、指定した関係が切り離される（原因を奪う） */
  steals?: string;
  label?: string;
  /** 誤った仮説の理由（仮説ボード用） */
  wrong?: string;
}

export interface ContraRule {
  id: string;
  kind: 'both' | 'aNotB' | 'link';
  a: string;
  b?: string;
  text: string;
  /** この矛盾が初めて生じたときに得られる記録 */
  reveals?: string;
}

export interface OutcomeDef {
  id: string;
  label: string;
  cond: string;
  desc?: string;
  /** 条件を満たすまで目標一覧に出さない */
  hidden?: boolean;
}

export interface GraphDef {
  id: string;
  title: string;
  goal?: string;
  intro?: string;
  kind?: 'edit' | 'hypothesis' | 'battle';
  nodes: NodeDef[];
  links: LinkDef[];
  contras?: ContraRule[];
  outcomes?: OutcomeDef[];
  /** この図での矛盾許容量の上乗せ */
  tolerance?: number;
}

export interface GraphEdit {
  links: Record<string, LinkState>;
  inverted: Record<string, boolean>;
  held: Record<string, boolean>;
  revealed: Record<string, boolean>;
}

export interface ContraHit { id: string; text: string; reveals?: string }

export interface EvalResult {
  active: Set<string>;
  contras: ContraHit[];
}

export interface EvalCtx {
  sensor?: (key: string, contraCount: number) => boolean;
}

export function emptyEdit(): GraphEdit {
  return { links: {}, inverted: {}, held: {}, revealed: {} };
}

export function cloneEdit(e: GraphEdit): GraphEdit {
  return { links: { ...e.links }, inverted: { ...e.inverted }, held: { ...e.held }, revealed: { ...e.revealed } };
}

export interface EffLink { def: LinkDef; from: string; to: string; state: LinkState; type: 'cause' | 'inhibit' }

export function effLink(l: LinkDef, edit: GraphEdit): EffLink {
  const inv = !!edit.inverted[l.id];
  return {
    def: l,
    from: inv ? l.to : l.from,
    to: inv ? l.from : l.to,
    state: edit.links[l.id] ?? l.state,
    type: l.type ?? 'cause',
  };
}

function fixpoint(g: GraphDef, edit: GraphEdit, ctx: EvalCtx, contraCount: number): Set<string> {
  const links = g.links.map(l => effLink(l, edit));
  const inByNode = new Map<string, EffLink[]>();
  for (const l of links) {
    const arr = inByNode.get(l.to) ?? [];
    arr.push(l);
    inByNode.set(l.to, arr);
  }
  const active = new Set<string>();
  for (let iter = 0; iter < 60; iter++) {
    let changed = false;
    for (const n of g.nodes) {
      let v: boolean;
      if (n.id in edit.held) v = edit.held[n.id];
      else {
        const base = !!n.base || (!!n.sensor && !!ctx.sensor?.(n.sensor, contraCount));
        const inc = inByNode.get(n.id) ?? [];
        const causes = inc.filter(l => l.type === 'cause');
        const live = causes.filter(l => l.state === 'intact' && active.has(l.from));
        let pos = false;
        const mode = n.mode ?? 'any';
        if (mode === 'any') pos = live.length > 0;
        else if (mode === 'all') {
          const counted = causes.filter(l => l.state !== 'possible');
          pos = counted.length > 0 && counted.every(l => l.state === 'intact' && active.has(l.from));
        } else pos = live.length >= mode;
        const inhibited = inc.some(l => l.type === 'inhibit' && l.state === 'intact' && active.has(l.from));
        v = (base || pos) && !inhibited;
      }
      if (v !== active.has(n.id)) {
        changed = true;
        if (v) active.add(n.id); else active.delete(n.id);
      }
    }
    if (!changed) break;
  }
  return active;
}

function computeContras(g: GraphDef, edit: GraphEdit, active: Set<string>): ContraHit[] {
  const hits: ContraHit[] = [];
  for (const r of g.contras ?? []) {
    let hit = false;
    if (r.kind === 'both') hit = active.has(r.a) && !!r.b && active.has(r.b);
    else if (r.kind === 'aNotB') hit = active.has(r.a) && !!r.b && !active.has(r.b);
    else {
      const l = g.links.find(x => x.id === r.a);
      hit = !!l && (edit.links[l.id] ?? l.state) === 'intact';
    }
    if (hit) hits.push({ id: r.id, text: r.text, reveals: r.reveals });
  }
  for (const n of g.nodes) {
    if (!active.has(n.id)) continue;
    if (n.tag === 'contra') hits.push({ id: 'node:' + n.id, text: n.label });
    if (n.needsCause && !(n.id in edit.held)) {
      const caused = g.links.some(l => {
        const e = effLink(l, edit);
        return e.to === n.id && e.type === 'cause' && e.state === 'intact' && active.has(e.from);
      });
      if (!caused) hits.push({ id: 'uncaused:' + n.id, text: `「${n.label}」に原因がない（欠因）` });
    }
  }
  return hits;
}

export function evaluate(g: GraphDef, edit: GraphEdit, ctx: EvalCtx = {}): EvalResult {
  let count = 0;
  let res: EvalResult = { active: new Set(), contras: [] };
  for (let pass = 0; pass < 4; pass++) {
    const active = fixpoint(g, edit, ctx, count);
    const contras = computeContras(g, edit, active);
    res = { active, contras };
    if (contras.length === count) break;
    count = contras.length;
  }
  return res;
}

// ---------- 表示 ----------

export interface ViewEnv {
  records: Set<string>;
  obs: number;
  revealAll?: boolean;
}

export function nodeVisible(n: NodeDef, env: ViewEnv): boolean {
  if (env.revealAll) return true;
  return (n.requires ?? []).every(r => env.records.has(r)) && (n.obs ?? 0) <= env.obs;
}

export function linkVisible(g: GraphDef, l: LinkDef, edit: GraphEdit, env: ViewEnv): boolean {
  const a = g.nodes.find(n => n.id === l.from);
  const b = g.nodes.find(n => n.id === l.to);
  if (!a || !b || !nodeVisible(a, env) || !nodeVisible(b, env)) return false;
  return !l.hidden || !!edit.revealed[l.id];
}

// ---------- 編集 ----------

export type Target = { kind: 'link' | 'node'; id: string };

export interface EditEnv extends ViewEnv {
  margin: number;
  tolerance: number;
  unlocked: Set<Op>;
  costDown: number;
  /** 記録片（不足した記録の代わりに1度だけ根拠にできる） */
  shards: number;
  /** 費用 0 で行える操作（装備などの効果） */
  freeOps?: Set<Op>;
  /** 戦闘中の条件読み取り */
  ctx?: EvalCtx;
}

export interface EditCheck {
  ok: boolean;
  reasons: string[];
  cost: number;
  usesShard: boolean;
  missing: string[];
  before: EvalResult;
  after: EvalResult;
  nextEdit: GraphEdit;
  on: string[];
  off: string[];
  newContras: ContraHit[];
  resolvedContras: ContraHit[];
  hiddenChanges: number;
}

export function availableOps(g: GraphDef, edit: GraphEdit, t: Target): Op[] {
  if (t.kind === 'link') {
    const l = g.links.find(x => x.id === t.id);
    if (!l) return [];
    const st = edit.links[l.id] ?? l.state;
    const ops = l.ops ?? [];
    const out: Op[] = [];
    if (st !== 'intact' && ops.includes('connect')) out.push('connect');
    if (st === 'intact' && ops.includes('cut')) out.push('cut');
    if (st === 'intact' && ops.includes('invert')) out.push('invert');
    return out;
  }
  const n = g.nodes.find(x => x.id === t.id);
  if (!n) return [];
  if ((n.ops ?? []).includes('hold') && !(n.id in edit.held)) return ['hold'];
  return [];
}

export function opCost(g: GraphDef, t: Target, op: Op, env: Pick<EditEnv, 'costDown' | 'freeOps'>): number {
  if (env.freeOps?.has(op)) return 0;
  const def = t.kind === 'link' ? g.links.find(x => x.id === t.id) : g.nodes.find(x => x.id === t.id);
  const base = def?.cost?.[op] ?? (g.kind === 'hypothesis' ? 0 : DEFAULT_COST[op]);
  const down = op === 'connect' ? env.costDown : 0;
  return Math.max(base === 0 ? 0 : 1, base - down);
}

export function applyOp(g: GraphDef, edit: GraphEdit, t: Target, op: Op, ctx: EvalCtx = {}): GraphEdit {
  const e = cloneEdit(edit);
  if (t.kind === 'link') {
    const l = g.links.find(x => x.id === t.id)!;
    if (op === 'connect') {
      e.links[l.id] = 'intact';
      e.revealed[l.id] = true;
      if (l.steals) e.links[l.steals] = 'severed';
    } else if (op === 'cut') {
      e.links[l.id] = 'severed';
    } else if (op === 'invert') {
      e.inverted[l.id] = !e.inverted[l.id];
    }
  } else if (op === 'hold') {
    const r = evaluate(g, edit, ctx);
    e.held[t.id] = r.active.has(t.id);
  }
  return e;
}

/** 保留を解除する（費用なし） */
export function release(edit: GraphEdit, nodeId: string): GraphEdit {
  const e = cloneEdit(edit);
  delete e.held[nodeId];
  return e;
}

/** 編集の結果、成立状態が変わった隠れた関係を明かす */
export function revealChanged(g: GraphDef, before: EvalResult, after: EvalResult, edit: GraphEdit): GraphEdit {
  const e = cloneEdit(edit);
  for (const l of g.links) {
    if (!l.hidden || e.revealed[l.id]) continue;
    if (before.active.has(l.to) !== after.active.has(l.to) || before.active.has(l.from) !== after.active.has(l.from)) e.revealed[l.id] = true;
  }
  return e;
}

export function checkEdit(g: GraphDef, edit: GraphEdit, t: Target, op: Op, env: EditEnv): EditCheck {
  const reasons: string[] = [];
  const ctx = env.ctx ?? {};
  const before = evaluate(g, edit, ctx);
  const ops = availableOps(g, edit, t);
  if (!ops.includes(op)) reasons.push('この対象には行えない操作です');
  if (!env.unlocked.has(op)) reasons.push(`「${OP_NAME[op]}」はまだ使えない`);
  const def = t.kind === 'link' ? g.links.find(x => x.id === t.id) : g.nodes.find(x => x.id === t.id);
  const missing = (def?.requires ?? []).filter(r => !env.records.has(r));
  let usesShard = false;
  if (missing.length > 0) {
    if (missing.length === 1 && env.shards > 0) usesShard = true;
    else reasons.push('根拠となる記録が足りない');
  }
  const cost = opCost(g, t, op, env);
  if (cost > env.margin) reasons.push(`余白が足りない（必要 ${cost}）`);
  const nextEdit = ops.includes(op) ? applyOp(g, edit, t, op, ctx) : edit;
  const after = evaluate(g, nextEdit, ctx);
  const limit = Math.max(env.tolerance + (g.tolerance ?? 0), before.contras.length);
  if (after.contras.length > limit) reasons.push(`矛盾が許容量（${env.tolerance + (g.tolerance ?? 0)}）を超える`);
  const visible = (id: string) => {
    const n = g.nodes.find(x => x.id === id);
    return !!n && nodeVisible(n, env);
  };
  const on: string[] = [];
  const off: string[] = [];
  let hiddenChanges = 0;
  for (const n of g.nodes) {
    const a = before.active.has(n.id);
    const b = after.active.has(n.id);
    if (a === b) continue;
    if (!visible(n.id)) { hiddenChanges++; continue; }
    // 見えている出来事でも、隠れた関係を通じて変わる場合は「未調査の影響」として伏せる
    const viaHidden = g.links.some(l => l.hidden && !edit.revealed[l.id] && l.to === n.id);
    if (viaHidden) { hiddenChanges++; continue; }
    (b ? on : off).push(n.id);
  }
  const ids = (r: EvalResult) => new Set(r.contras.map(c => c.id));
  const bIds = ids(before);
  const aIds = ids(after);
  return {
    ok: reasons.length === 0,
    reasons,
    cost,
    usesShard,
    missing,
    before,
    after,
    nextEdit,
    on,
    off,
    newContras: after.contras.filter(c => !bIds.has(c.id)),
    resolvedContras: before.contras.filter(c => !aIds.has(c.id)),
    hiddenChanges,
  };
}

// ---------- 目標 ----------

export function graphTerm(g: GraphDef, edit: GraphEdit, res: EvalResult, term: string): boolean {
  if (term.startsWith('n:')) return res.active.has(term.slice(2));
  if (term.startsWith('l:')) {
    const [id, want] = term.slice(2).split('=');
    const l = g.links.find(x => x.id === id);
    if (!l) return false;
    return (edit.links[id] ?? l.state) === want;
  }
  if (term.startsWith('i:')) return !!edit.inverted[term.slice(2)];
  if (term.startsWith('h:')) return term.slice(2) in edit.held;
  const m = term.match(CMP_RE);
  if (m && m[1] === 'contra') return compare(res.contras.length, m[2], Number(m[3]));
  return false;
}

export function outcomeMet(g: GraphDef, edit: GraphEdit, res: EvalResult, o: OutcomeDef, extra?: (term: string) => boolean | undefined): boolean {
  return evalCond(o.cond, t => extra?.(t) ?? graphTerm(g, edit, res, t));
}

export function metOutcomes(g: GraphDef, edit: GraphEdit, extra?: (term: string) => boolean | undefined, ctx: EvalCtx = {}): OutcomeDef[] {
  const res = evaluate(g, edit, ctx);
  return (g.outcomes ?? []).filter(o => outcomeMet(g, edit, res, o, extra));
}

/** データ検証: 参照切れを返す（テストとデバッグ用） */
export function validateGraph(g: GraphDef): string[] {
  const errs: string[] = [];
  const ids = new Set(g.nodes.map(n => n.id));
  const lids = new Set(g.links.map(l => l.id));
  if (ids.size !== g.nodes.length) errs.push(`${g.id}: ノードIDが重複`);
  if (lids.size !== g.links.length) errs.push(`${g.id}: 関係IDが重複`);
  for (const l of g.links) {
    if (!ids.has(l.from)) errs.push(`${g.id}/${l.id}: from ${l.from} がない`);
    if (!ids.has(l.to)) errs.push(`${g.id}/${l.id}: to ${l.to} がない`);
    if (l.steals && !lids.has(l.steals)) errs.push(`${g.id}/${l.id}: steals ${l.steals} がない`);
  }
  for (const r of g.contras ?? []) {
    if (r.kind === 'link') { if (!lids.has(r.a)) errs.push(`${g.id}/${r.id}: link ${r.a} がない`); }
    else {
      if (!ids.has(r.a)) errs.push(`${g.id}/${r.id}: ${r.a} がない`);
      if (r.b && !ids.has(r.b)) errs.push(`${g.id}/${r.id}: ${r.b} がない`);
    }
  }
  for (const o of g.outcomes ?? []) {
    for (const m of o.cond.matchAll(/([nlih]):([\w.]+)/g)) {
      if ((m[1] === 'n' || m[1] === 'h') && !ids.has(m[2])) errs.push(`${g.id}/${o.id}: ノード ${m[2]} がない`);
      if ((m[1] === 'l' || m[1] === 'i') && !lids.has(m[2])) errs.push(`${g.id}/${o.id}: 関係 ${m[2]} がない`);
    }
  }
  return errs;
}

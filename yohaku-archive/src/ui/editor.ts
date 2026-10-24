// 因果編集画面：出来事をノード、因果関係を線で表示し、接続・切断・反転・保留を行う
import {
  availableOps, checkEdit, evaluate, linkVisible, metOutcomes, nodeVisible, opCost, OP_NAME, revealChanged,
  type EditCheck, type EditEnv, type GraphDef, type GraphEdit, type LinkDef, type NodeDef, type Op, type Target,
} from '../engine/causal';
import { RECORD_MAP } from '../data/records';
import { el, btn, esc, svg } from './dom';
import { nodeBox, wrapLabel } from './layout';
import { sfx } from './audio';

export interface PuzzleResult { outcome: string; edit: GraphEdit; spent: number; shards: number; revealed: string[] }

interface Mode {
  kind: 'puzzle' | 'battle' | 'view';
  /** 戦闘：編集を即時に反映する */
  apply?: (t: Target, op: Op) => void;
  editsLeft?: () => number;
  expiry?: () => Record<string, number>;
  nodeNote?: (id: string) => string | null;
  hiddenNode?: (id: string) => boolean;
  /** 戦闘：敵ごとに表示を切り替える */
  groups?: { label: string; prefix: string }[];
  predict?: boolean;
}

const OP_SOUND: Record<Op, string> = { connect: 'connect', cut: 'cut', invert: 'invert', hold: 'hold' };

export class CausalEditor {
  private ov: HTMLDivElement;
  private svgEl!: SVGSVGElement;
  private sheet!: HTMLDivElement;
  private head!: HTMLDivElement;
  private sel: Target | null = null;
  private pendingOp: Op | null = null;
  private stack: { edit: GraphEdit; cost: number; shard: boolean }[] = [];
  private edit: GraphEdit;
  private resolveFn: ((r: PuzzleResult | null) => void) | null = null;
  private keyH = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.preventDefault(); this.close(null); } };
  private boxes = new Map<string, { x: number; y: number; w: number; h: number }>();
  private showHelp = false;
  private portrait = false;
  private group = 0;
  private vb = { x: 0, y: 0, w: 100, h: 80 };
  private canvasWrap!: HTMLDivElement;

  constructor(
    private parent: HTMLElement,
    private g: GraphDef,
    start: GraphEdit,
    private envFn: () => EditEnv,
    private mode: Mode,
    private extra?: (t: string) => boolean | undefined,
    private startedFrom = '',
  ) {
    this.edit = start;
    this.ov = el('div', 'editor' + (mode.kind === 'battle' ? ' in-battle' : ''));
  }

  open(): Promise<PuzzleResult | null> {
    this.parent.append(this.ov);
    window.addEventListener('keydown', this.keyH);
    this.build();
    this.render();
    requestAnimationFrame(() => this.render());
    window.addEventListener('resize', this.resizeH);
    if (this.g.intro && this.mode.kind === 'puzzle') this.flashMsg(this.g.intro, 6000);
    return new Promise(r => { this.resolveFn = r; });
  }

  /** 戦闘側から状態が変わったことを伝える */
  setEdit(e: GraphEdit): void {
    this.edit = e;
    this.render();
  }

  private spent(): number { return this.stack.reduce((a, s) => a + s.cost, 0); }
  private shardsUsed(): number { return this.stack.filter(s => s.shard).length; }

  private env(): EditEnv {
    const e = this.envFn();
    if (this.mode.kind === 'puzzle') return { ...e, margin: e.margin - this.spent(), shards: e.shards - this.shardsUsed() };
    return e;
  }

  private ctx() { return this.env().ctx ?? {}; }

  private build(): void {
    this.head = el('div', 'ed-head');
    const wrap = el('div', 'ed-canvas');
    this.canvasWrap = wrap;
    this.svgEl = svg('svg', { viewBox: '0 0 100 80', preserveAspectRatio: 'xMidYMid meet' });
    const defs = svg('defs');
    const mk = (id: string, color: string, bar = false) => {
      const m = svg('marker', { id, viewBox: '0 0 10 10', refX: bar ? '5' : '9', refY: '5', markerWidth: '4', markerHeight: '4', orient: 'auto-start-reverse' });
      m.append(bar ? svg('path', { d: 'M5 0 L5 10', stroke: color, 'stroke-width': '3' }) : svg('path', { d: 'M0 0 L10 5 L0 10 z', fill: color }));
      defs.append(m);
    };
    mk('ar-live', '#f0c870'); mk('ar-dead', '#6e6a78'); mk('ar-sev', '#d0605a'); mk('ar-pos', '#8aa0b8');
    mk('bar-live', '#7ab0e8', true); mk('bar-dead', '#55607a', true); mk('bar-sev', '#d0605a', true); mk('bar-pos', '#8aa0b8', true);
    const glow = svg('filter', { id: 'glow', x: '-30%', y: '-30%', width: '160%', height: '160%' });
    glow.append(svg('feGaussianBlur', { stdDeviation: '0.8', result: 'b' }));
    const merge = svg('feMerge');
    merge.append(svg('feMergeNode', { in: 'b' }), svg('feMergeNode', { in: 'SourceGraphic' }));
    glow.append(merge);
    defs.append(glow);
    this.svgEl.append(defs);
    this.svgEl.addEventListener('click', e => { if (e.target === this.svgEl) { this.sel = null; this.pendingOp = null; this.render(); } });
    wrap.append(this.svgEl);
    this.sheet = el('div', 'ed-sheet');
    this.ov.append(this.head, wrap, this.sheet);
  }

  private flashMsg(text: string, ms = 2600): void {
    this.ov.querySelectorAll('.ed-msg').forEach(x => x.remove());
    const m = el('div', 'ed-msg', esc(text));
    (this.canvasWrap ?? this.ov).append(m);
    setTimeout(() => m.classList.add('on'), 20);
    m.addEventListener('click', () => m.remove());
    setTimeout(() => { m.classList.remove('on'); setTimeout(() => m.remove(), 400); }, ms);
  }

  /** 縦長の画面では、原因→結果を上から下へ流す */
  private render(): void {
    const r = this.canvasWrap?.getBoundingClientRect();
    this.portrait = !!r && r.width > 0 && r.width < r.height * 0.85;
    const env = this.env();
    const res = evaluate(this.g, this.edit, this.ctx());
    this.renderHead(env, res.contras.length);
    this.renderGraph(env, res.active);
    this.renderSheet(env, res);
  }

  private renderHead(env: EditEnv, contras: number): void {
    const tol = env.tolerance + (this.g.tolerance ?? 0);
    const maxM = this.mode.kind === 'puzzle' ? this.envFn().margin : env.margin;
    const gems = this.g.kind === 'hypothesis' ? '' : `<span class="pill margin">余白 ${'◆'.repeat(Math.max(0, env.margin))}${'◇'.repeat(Math.max(0, maxM - env.margin))} <b>${env.margin}</b></span>`;
    const tolTxt = this.mode.kind === 'battle' ? '' : ` / 許容 ${tol}`;
    const left = this.mode.kind === 'battle' ? `<span class="pill">このターンの編集 残り${this.mode.editsLeft!()}</span>` : '';
    this.head.innerHTML = `
      <div class="ed-title"><b>${esc(this.g.title)}</b>${this.g.goal ? `<span class="goal">目標：${esc(this.g.goal)}</span>` : ''}</div>
      <div class="ed-stats">${gems}<span class="pill contra ${contras > 0 ? 'on' : ''}">矛盾 <b>${contras}</b>${tolTxt}</span>${left}</div>`;
    const gs = this.mode.groups;
    if (gs && gs.length > 1) {
      const row = el('div', 'ed-groups');
      gs.forEach((g, i) => row.append(btn(esc(g.label), 'tab' + (i === this.group ? ' on' : ''), () => { this.group = i; this.sel = null; this.pendingOp = null; this.render(); })));
      this.head.append(row);
    }
    const tools = el('div', 'ed-tools');
    if (this.mode.kind === 'puzzle') {
      const u = btn('↶ 戻す', 'small', () => this.undo());
      u.disabled = this.stack.length === 0;
      tools.append(u);
    }
    tools.append(btn('凡例', 'small', () => { this.showHelp = !this.showHelp; this.render(); }));
    tools.append(btn(this.mode.kind === 'battle' ? '戦闘に戻る' : this.mode.kind === 'view' ? '閉じる' : 'やめる', 'small', () => this.close(null)));
    this.head.append(tools);
  }

  /** 表示中の敵以外の出来事は隠す */
  private outOfGroup(id: string): boolean {
    const gs = this.mode.groups;
    if (!gs || gs.length < 2) return false;
    // 味方側の出来事は、表示中の敵とつながっているときだけ出す
    if (id.startsWith('p.')) {
      const pre = gs[this.group].prefix;
      return !this.g.links.some(l => (l.from === id || l.to === id) && l.id.startsWith(pre));
    }
    return gs.some((g, i) => i !== this.group && id.startsWith(g.prefix));
  }

  private renderGraph(env: EditEnv, active: Set<string>): void {
    const s = this.svgEl;
    while (s.childNodes.length > 1) s.lastChild!.remove();
    this.boxes.clear();
    const visNodes = this.g.nodes.filter(n => nodeVisible(n, env) && !this.mode.hiddenNode?.(n.id) && !this.outOfGroup(n.id));
    const visIds = new Set(visNodes.map(n => n.id));
    // 箱の大きさ
    for (const n of visNodes) this.boxes.set(n.id, nodeBox(n, this.portrait));
    // 全体が収まるように表示範囲を決める
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const b of this.boxes.values()) { x0 = Math.min(x0, b.x); y0 = Math.min(y0, b.y); x1 = Math.max(x1, b.x + b.w); y1 = Math.max(y1, b.y + b.h); }
    if (!isFinite(x0)) { x0 = 0; y0 = 0; x1 = 100; y1 = 80; }
    const vb = { x: x0 - 3, y: y0 - 4, w: Math.max(40, x1 - x0 + 6), h: Math.max(30, y1 - y0 + 10) };
    this.vb = vb;
    s.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    const linkLayer = svg('g');
    const nodeLayer = svg('g');
    s.append(linkLayer, nodeLayer);
    // 見えないノードにつながる線の「？」
    const exp = this.mode.expiry?.() ?? {};
    for (const l of this.g.links) {
      if (!visIds.has(l.from) || !visIds.has(l.to)) continue;
      if (!linkVisible(this.g, l, this.edit, env)) continue;
      this.drawLink(linkLayer, l, active, env, exp[l.id]);
    }
    for (const n of visNodes) this.drawNode(nodeLayer, n, active.has(n.id));
    // 見えていない出来事の気配
    const hiddenCount = this.g.nodes.filter(n => !visIds.has(n.id) && !this.mode.hiddenNode?.(n.id) && !this.outOfGroup(n.id)).length;
    if (hiddenCount > 0) {
      const t = svg('text', { x: this.vb.x + this.vb.w - 1, y: this.vb.y + this.vb.h - 1, 'text-anchor': 'end', class: 'hint-txt' });
      t.textContent = `未発見の出来事 ${hiddenCount}`;
      s.append(t);
    }
    if (this.showHelp) this.drawLegend(s);
  }

  private drawLegend(s: SVGSVGElement): void {
    const g = svg('g', { class: 'legend', transform: `translate(${this.vb.x} ${this.vb.y})` });
    g.append(svg('rect', { x: 1, y: 1, width: 44, height: 33, rx: 1.5 }));
    const rows: [string, string][] = [
      ['live', '成立している因果（原因→結果）'], ['dead', '原因が不成立の因果'], ['sev', '切れている因果（切断）'],
      ['pos', 'まだ無い因果（接続できる）'], ['bar', '⊣ 結果を打ち消す関係'], ['held', '保留中の出来事'],
    ];
    rows.forEach(([k, txt], i) => {
      const y = 6 + i * 5;
      if (k === 'held') g.append(svg('rect', { x: 3, y: y - 2, width: 6, height: 3.4, class: 'n held' }));
      else g.append(svg('line', { x1: 3, y1: y, x2: 9, y2: y, class: 'ln ' + (k === 'bar' ? 'inh live' : k) }));
      const t = svg('text', { x: 11, y: y + 1, class: 'legend-txt' });
      t.textContent = txt;
      g.append(t);
    });
    s.append(g);
  }

  private edgePoint(id: string, toward: { x: number; y: number }): { x: number; y: number } {
    const b = this.boxes.get(id)!;
    const cx = b.x + b.w / 2, cy = b.y + b.h / 2;
    const dx = toward.x - cx, dy = toward.y - cy;
    const sx = dx === 0 ? Infinity : (b.w / 2 + 0.6) / Math.abs(dx);
    const sy = dy === 0 ? Infinity : (b.h / 2 + 0.6) / Math.abs(dy);
    const k = Math.min(sx, sy);
    return { x: cx + dx * k, y: cy + dy * k };
  }

  private drawLink(layer: SVGGElement, l: LinkDef, active: Set<string>, env: EditEnv, expiry?: number): void {
    const inv = !!this.edit.inverted[l.id];
    const from = inv ? l.to : l.from, to = inv ? l.from : l.to;
    const st = this.edit.links[l.id] ?? l.state;
    const bf = this.boxes.get(from)!, bt = this.boxes.get(to)!;
    const cf = { x: bf.x + bf.w / 2, y: bf.y + bf.h / 2 }, ct = { x: bt.x + bt.w / 2, y: bt.y + bt.h / 2 };
    const a = this.edgePoint(from, ct), b = this.edgePoint(to, cf);
    // 少しだけ曲げる（往復の線が重ならないように）
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const nx = -(b.y - a.y), ny = b.x - a.x;
    const len = Math.hypot(nx, ny) || 1;
    const bend = 2.2 * (l.from < l.to ? 1 : -1);
    const qx = mx + (nx / len) * bend, qy = my + (ny / len) * bend;
    const d = `M${a.x.toFixed(2)} ${a.y.toFixed(2)} Q${qx.toFixed(2)} ${qy.toFixed(2)} ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
    const inh = (l.type ?? 'cause') === 'inhibit';
    const live = st === 'intact' && active.has(from);
    const cls = st === 'severed' ? 'sev' : st === 'possible' ? 'pos' : live ? 'live' : 'dead';
    const marker = `url(#${inh ? 'bar' : 'ar'}-${cls})`;
    const selected = this.sel?.kind === 'link' && this.sel.id === l.id;
    const editable = (l.ops ?? []).length > 0;
    const grp = svg('g', { class: 'link' + (selected ? ' sel' : '') + (editable ? ' editable' : ''), 'data-link': l.id });
    grp.append(svg('path', { d, class: `ln ${cls}${inh ? ' inh' : ''}`, 'marker-end': marker }));
    // 状態の印
    const midx = 0.25 * a.x + 0.5 * qx + 0.25 * b.x, midy = 0.25 * a.y + 0.5 * qy + 0.25 * b.y;
    const missing = (l.requires ?? []).some(r => !env.records.has(r));
    const badge = (txt: string, cls2: string) => {
      grp.append(svg('circle', { cx: midx, cy: midy, r: 1.9, class: 'badge ' + cls2 }));
      const t = svg('text', { x: midx, y: midy + 0.95, 'text-anchor': 'middle', class: 'badge-txt' });
      t.textContent = txt;
      grp.append(t);
    };
    if (editable && missing && availableOps(this.g, this.edit, { kind: 'link', id: l.id }).length > 0) badge('？', 'q');
    else if (st === 'severed') badge('✂', 'cut');
    else if (inv) badge('⇄', 'inv');
    else if (editable && availableOps(this.g, this.edit, { kind: 'link', id: l.id }).length > 0) badge(st === 'intact' ? '✎' : '+', 'op');
    if (expiry) {
      const t = svg('text', { x: midx + 2.4, y: midy - 1.6, class: 'exp-txt' });
      t.textContent = `あと${expiry}`;
      grp.append(t);
    }
    if (live && !inh) {
      const dot = svg('circle', { r: 0.7, class: 'flow' });
      const anim = svg('animateMotion', { dur: '1.6s', repeatCount: 'indefinite', path: d });
      dot.append(anim);
      grp.append(dot);
    }
    // 押しやすい太い当たり判定
    const hit = svg('path', { d, class: 'hit' });
    grp.append(hit);
    grp.addEventListener('click', e => { e.stopPropagation(); sfx('blip'); this.sel = { kind: 'link', id: l.id }; this.pendingOp = null; this.render(); });
    layer.append(grp);
  }

  private drawNode(layer: SVGGElement, n: NodeDef, on: boolean): void {
    const b = this.boxes.get(n.id)!;
    const held = n.id in this.edit.held;
    const sel = this.sel?.kind === 'node' && this.sel.id === n.id;
    const cls = ['n', on ? 'on' : 'off', n.tag ?? '', held ? 'held' : '', sel ? 'sel' : ''].join(' ');
    const grp = svg('g', { class: 'node', 'data-node': n.id });
    const rect = svg('rect', { x: b.x, y: b.y, width: b.w, height: b.h, rx: n.tag === 'fact' ? 0.6 : 2.2, class: cls });
    if (on && (n.tag === 'goal' || n.tag === 'intent' || n.tag === 'contra')) rect.setAttribute('filter', 'url(#glow)');
    grp.append(rect);
    const lines = wrapLabel(n.label);
    lines.forEach((ln, i) => {
      const t = svg('text', { x: b.x + b.w / 2, y: b.y + 2.9 + i * 3.1 + 0.4, 'text-anchor': 'middle', class: 'n-txt ' + (on ? 'on' : 'off') });
      t.textContent = ln;
      grp.append(t);
    });
    const icon = n.tag === 'goal' ? '★' : n.tag === 'intent' ? '⚔' : n.tag === 'contra' ? '⚡' : n.tag === 'cost' ? '♢' : n.sensor ? '◉' : held ? '⏸' : '';
    if (icon || held) {
      const t = svg('text', { x: b.x + 1, y: b.y + 2.4, class: 'n-icon' });
      t.textContent = held ? '⏸' : icon;
      grp.append(t);
    }
    if ((n.ops ?? []).includes('hold') && !held) {
      const t = svg('text', { x: b.x + b.w - 1, y: b.y + 2.4, 'text-anchor': 'end', class: 'n-icon hold' });
      t.textContent = '⏸?';
      grp.append(t);
    }
    const note = this.mode.nodeNote?.(n.id);
    if (note) {
      const t = svg('text', { x: b.x + b.w / 2, y: b.y + b.h + 2.4, 'text-anchor': 'middle', class: 'n-note' });
      t.textContent = note;
      grp.append(t);
    }
    grp.addEventListener('click', e => { e.stopPropagation(); sfx('blip'); this.sel = { kind: 'node', id: n.id }; this.pendingOp = null; this.render(); });
    layer.append(grp);
  }

  private nodeLabel(id: string): string {
    return this.g.nodes.find(n => n.id === id)?.label ?? id;
  }

  private renderSheet(env: EditEnv, res: ReturnType<typeof evaluate>): void {
    const sh = this.sheet;
    sh.innerHTML = '';
    if (this.sel && this.pendingOp) { this.renderPreview(env); return; }
    if (this.sel?.kind === 'link') { this.renderLinkInfo(env, res.active); return; }
    if (this.sel?.kind === 'node') { this.renderNodeInfo(env, res.active); return; }
    // 何も選んでいない：矛盾と目標
    const box = el('div', 'sheet-body');
    if (res.contras.length) {
      box.append(el('div', 'sec', '矛盾'));
      for (const c of res.contras) box.append(el('div', 'contra-line', '⚡ ' + esc(c.text)));
    }
    if (this.mode.kind === 'puzzle') {
      const met = metOutcomes(this.g, this.edit, this.extra, this.ctx());
      box.append(el('div', 'sec', '結末（条件を満たすと確定できる）'));
      for (const o of this.g.outcomes ?? []) {
        const ok = met.some(m => m.id === o.id);
        if (o.hidden && !ok) continue;
        const row = el('div', 'outcome' + (ok ? ' ok' : ''));
        row.innerHTML = `<span>${ok ? '✓' : '・'} ${esc(o.label)}</span>${o.desc && ok ? `<small>${esc(o.desc)}</small>` : ''}`;
        if (ok) row.append(btn('この結末で確定', 'primary', () => this.commit(o.id)));
        box.append(row);
      }
      if ((this.g.outcomes ?? []).some(o => o.hidden) && !met.some(m => this.g.outcomes!.find(o => o.id === m.id)?.hidden)) {
        box.append(el('div', 'hint', '……まだ見えていない結末があるかもしれない。'));
      }
    }
    if (this.mode.kind !== 'view') box.append(el('div', 'hint', '線（因果関係）や出来事をタップすると、詳細と編集できる操作が表示されます。「+」は接続できる線、「✎」は切断・反転できる線、「？」は根拠の記録が足りない線。'));
    sh.append(box);
  }

  private opsRow(env: EditEnv, t: Target): HTMLDivElement {
    const row = el('div', 'ops');
    const ops = availableOps(this.g, this.edit, t);
    if (this.mode.kind === 'view') return row;
    for (const op of ops) {
      const cost = opCost(this.g, t, op, env);
      const locked = !env.unlocked.has(op);
      const b = btn(`${OP_NAME[op]}<small>${this.g.kind === 'hypothesis' ? '' : `余白${cost}`}</small>`, 'op-btn ' + op + (locked ? ' locked' : ''), () => {
        if (locked) { this.flashMsg(`「${OP_NAME[op]}」はまだ使えない。`); return; }
        this.pendingOp = op;
        this.render();
      });
      row.append(b);
    }
    if (t.kind === 'node' && t.id in this.edit.held && this.mode.kind === 'puzzle') {
      row.append(btn('保留を解く<small>余白0</small>', 'op-btn', () => {
        this.stack.push({ edit: this.edit, cost: 0, shard: false });
        const e = { ...this.edit, held: { ...this.edit.held } };
        delete e.held[t.id];
        this.edit = e;
        this.render();
      }));
    }
    return row;
  }

  private recordsLine(ids: string[] | undefined, env: EditEnv): string {
    if (!ids?.length) return '';
    return '<div class="recs">根拠：' + ids.map(r => {
      const ok = env.records.has(r);
      return `<span class="${ok ? 'ok' : 'ng'}">${ok ? '✓' : '✗'} ${esc(ok ? RECORD_MAP.get(r)?.title ?? r : '（未発見の記録）')}</span>`;
    }).join('') + '</div>';
  }

  private renderLinkInfo(env: EditEnv, active: Set<string>): void {
    const l = this.g.links.find(x => x.id === this.sel!.id)!;
    const st = this.edit.links[l.id] ?? l.state;
    const inv = !!this.edit.inverted[l.id];
    const from = inv ? l.to : l.from, to = inv ? l.from : l.to;
    const inh = (l.type ?? 'cause') === 'inhibit';
    const stTxt = st === 'intact' ? (active.has(from) ? '成立している' : '原因が不成立') : st === 'severed' ? '切れている' : 'まだ繋がっていない';
    const box = el('div', 'sheet-body');
    box.innerHTML = `
      <div class="sel-title">${esc(this.nodeLabel(from))} <span class="arrow">${inh ? '⊣' : '→'}</span> ${esc(this.nodeLabel(to))}</div>
      ${l.label ? `<div class="sel-desc">「${esc(l.label)}」</div>` : ''}
      <div class="sel-desc">状態：${stTxt}${inv ? '（反転中）' : ''}${inh ? '／結果を打ち消す関係' : ''}</div>
      ${this.recordsLine(l.requires, env)}
      ${l.wrong && st === 'intact' ? `<div class="contra-line">⚡ ${esc(l.wrong)}</div>` : ''}
      ${(l.ops ?? []).length === 0 ? '<div class="hint">この関係は編集できない。</div>' : ''}`;
    box.append(this.opsRow(env, { kind: 'link', id: l.id }));
    this.sheet.append(box);
  }

  private renderNodeInfo(env: EditEnv, active: Set<string>): void {
    const n = this.g.nodes.find(x => x.id === this.sel!.id)!;
    const held = n.id in this.edit.held;
    const ins = this.g.links.filter(l => (this.edit.inverted[l.id] ? l.from : l.to) === n.id && linkVisible(this.g, l, this.edit, env));
    const outs = this.g.links.filter(l => (this.edit.inverted[l.id] ? l.to : l.from) === n.id && linkVisible(this.g, l, this.edit, env));
    const name = (l: LinkDef, other: string) => `${esc(this.nodeLabel(other))}${(this.edit.links[l.id] ?? l.state) !== 'intact' ? '（未成立）' : ''}`;
    const modeTxt = n.mode === 'all' ? '原因がすべて揃うと成立' : typeof n.mode === 'number' ? `原因が${n.mode}つ以上で成立` : '';
    const box = el('div', 'sheet-body');
    box.innerHTML = `
      <div class="sel-title">${esc(n.label)}</div>
      <div class="sel-desc">状態：${held ? `保留中（${this.edit.held[n.id] ? '成立' : '不成立'}のまま確定しない）` : active.has(n.id) ? '成立している' : '成立していない'}${n.base ? '／事実' : ''}${n.sensor ? '／戦場の状態' : ''}${modeTxt ? '／' + modeTxt : ''}${n.needsCause ? '／原因が必要' : ''}</div>
      ${n.desc ? `<div class="sel-desc">${esc(n.desc)}</div>` : ''}
      <div class="sel-desc">判明している原因：${ins.length ? ins.map(l => name(l, this.edit.inverted[l.id] ? l.to : l.from)).join('、') : 'なし'}</div>
      <div class="sel-desc">発生する結果：${outs.length ? outs.map(l => name(l, this.edit.inverted[l.id] ? l.from : l.to)).join('、') : 'なし'}</div>
      ${this.recordsLine(n.requires, env)}
      ${this.mode.nodeNote?.(n.id) ? `<div class="sel-desc">${esc(this.mode.nodeNote(n.id)!)}</div>` : ''}`;
    box.append(this.opsRow(env, { kind: 'node', id: n.id }));
    this.sheet.append(box);
  }

  private check(env: EditEnv): EditCheck {
    return checkEdit(this.g, this.edit, this.sel!, this.pendingOp!, env);
  }

  private renderPreview(env: EditEnv): void {
    const chk = this.check(env);
    const box = el('div', 'sheet-body preview');
    const names = (ids: string[]) => ids.map(id => `「${esc(this.nodeLabel(id))}」`).join('');
    let html = `<div class="sel-title">${OP_NAME[this.pendingOp!]}の予測</div>`;
    if (chk.on.length) html += `<div class="pv on">成立する：${names(chk.on)}</div>`;
    if (chk.off.length) html += `<div class="pv off">成立しなくなる：${names(chk.off)}</div>`;
    for (const c of chk.newContras) html += `<div class="pv contra">新たな矛盾：${esc(c.text)}</div>`;
    for (const c of chk.resolvedContras) html += `<div class="pv ok">解消する矛盾：${esc(c.text)}</div>`;
    if (chk.hiddenChanges) {
      const predict = this.mode.predict;
      html += `<div class="pv hidden">未調査の影響：${chk.hiddenChanges}件${predict ? '（どこかで、何かが失われる気配がする）' : ''}</div>`;
    }
    if (!chk.on.length && !chk.off.length && !chk.newContras.length && !chk.resolvedContras.length && !chk.hiddenChanges) html += '<div class="pv">目に見える変化はない。</div>';
    if (chk.usesShard) html += `<div class="pv">記録片を1つ使って、足りない記録の代わりにする。</div>`;
    html += `<div class="pv cost">${this.g.kind === 'hypothesis' ? '' : `必要な余白：${chk.cost}`}</div>`;
    for (const r of chk.reasons) html += `<div class="pv ng">✗ ${esc(r)}${r.startsWith('余白') && this.mode.kind === 'puzzle' ? '<small>（家のベッドや宿で休む・戦闘に勝つ・余白結晶を使うと回復する）</small>' : ''}</div>`;
    box.innerHTML = html;
    const row = el('div', 'ops');
    const doIt = btn('実行する', 'primary', () => this.execute(chk));
    doIt.disabled = !chk.ok;
    row.append(doIt, btn('やめる', '', () => { this.pendingOp = null; this.render(); }));
    box.append(row);
    this.sheet.append(box);
  }

  private execute(chk: EditCheck): void {
    const op = this.pendingOp!;
    const t = this.sel!;
    sfx(OP_SOUND[op]);
    this.ov.classList.remove('pulse');
    void this.ov.offsetWidth;
    this.ov.classList.add('pulse');
    if (this.mode.kind === 'battle') {
      this.mode.apply!(t, op);
      this.pendingOp = null;
      this.sel = null;
      return;
    }
    this.stack.push({ edit: this.edit, cost: chk.cost, shard: chk.usesShard });
    this.edit = revealChanged(this.g, chk.before, chk.after, chk.nextEdit);
    const newly = Object.keys(this.edit.revealed).filter(k => !this.stack[this.stack.length - 1].edit.revealed[k] && this.g.links.find(l => l.id === k)?.hidden);
    this.sel = null;
    for (const id of newly) {
      const l = this.g.links.find(x => x.id === id)!;
      this.flashMsg(`新たな関係が明らかになった：「${l.label ?? this.nodeLabel(l.from) + '→' + this.nodeLabel(l.to)}」`, 4200);
    }
    for (const c of chk.newContras) if (c.reveals) this.flashMsg(`矛盾から手がかり：${c.text}`);
    this.pendingOp = null;
    this.render();
    const met = metOutcomes(this.g, this.edit, this.extra, this.ctx());
    if (met.length) this.flashMsg('結末の条件を満たした。下の一覧から確定できる。', 2400);
  }

  private undo(): void {
    const last = this.stack.pop();
    if (!last) return;
    sfx('cancel');
    this.edit = last.edit;
    this.pendingOp = null;
    this.render();
  }

  private commit(outcome: string): void {
    sfx('select');
    const revealed = Object.keys(this.edit.revealed).filter(k => !(this.stack[0]?.edit.revealed[k]));
    this.close({ outcome, edit: this.edit, spent: this.spent(), shards: this.shardsUsed(), revealed });
  }

  private resizeH = () => this.render();

  close(r: PuzzleResult | null): void {
    window.removeEventListener('keydown', this.keyH);
    window.removeEventListener('resize', this.resizeH);
    this.ov.remove();
    this.resolveFn?.(r);
    this.resolveFn = null;
    void this.startedFrom;
  }

  /** 戦闘側から閉じる */
  refresh(): void { this.render(); }
}

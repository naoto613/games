// ターン制戦闘：1.敵の行動予告 → 2.行動選択 → 3.因果編集 → 4.行動解決 → 5.状態更新
import { CHARS, type CharId } from '../data/chars';
import { ENEMY_MAP, FIELD_CONTRA_LABELS, type BattleDef, type EnemyDef, type IntentDef } from '../data/enemies';
import { ITEM_MAP } from '../data/items';
import { SKILL_MAP } from '../data/skills';
import {
  checkEdit, emptyEdit, evaluate, release, type EditCheck, type EditEnv, type EvalCtx, type GraphDef, type GraphEdit,
  type LinkDef, type NodeDef, type Op, type Target,
} from './causal';
import { compare, CMP_RE } from './cond';
import { hasSkill, hasSpecial, marginMax, partyObs, statsOf, tolerance, type GameState } from './state';

export interface Fighter {
  uid: string;
  name: string;
  side: 'party' | 'enemy';
  tpl?: string;
  char?: CharId;
  hp: number;
  maxHp: number;
  ap: number;
  maxAp: number;
  atk: number;
  def: number;
  obs: number;
  edit: number;
  st: Record<string, number>;
  stacks: number;
  revives: number;
  alive: boolean;
}

export interface Planned { intent: string; carried?: boolean }

export type Command =
  | { actor: string; kind: 'attack'; target: string }
  | { actor: string; kind: 'skill'; skill: string; target: string }
  | { actor: string; kind: 'defend' }
  | { actor: string; kind: 'item'; item: string; target: string }
  | { actor: string; kind: 'device'; device: string; target: string };

export type BEvent =
  | { t: 'log'; text: string }
  | { t: 'dmg'; uid: string; amount: number; big?: boolean }
  | { t: 'heal'; uid: string; amount: number }
  | { t: 'fail'; uid: string; text: string }
  | { t: 'act'; uid: string }
  | { t: 'death'; uid: string }
  | { t: 'revive'; uid: string }
  | { t: 'edit'; text: string };

export interface BattleState {
  def: BattleDef;
  turn: number;
  party: Fighter[];
  enemies: Fighter[];
  graph: GraphDef;
  edit: GraphEdit;
  expiry: Record<string, number>;
  planned: Record<string, Planned | null>;
  editsThisTurn: number;
  attacked: Record<string, boolean>;
  deviceCd: Record<string, number>;
  revealAll: boolean;
  freeCutUsed: boolean;
  holdClockUsed: boolean;
  margin: number;
  rng: number;
  result: null | 'win' | 'lose' | 'escape';
  linked: Record<string, boolean>;
  covering: string | null;
  defending: Record<string, boolean>;
}

// ---------- 乱数（再現できるように状態に持つ） ----------

export function rand(b: BattleState): number {
  b.rng = (b.rng * 1664525 + 1013904223) >>> 0;
  return b.rng / 4294967296;
}

// ---------- 戦闘の組み立て ----------

const MAX_STACKS = 5;
const SCOPED = ['status:', 'attacked', 'notAttacked', 'allyAttacked', 'hpBelow:', 'stacks>='];

/** 敵ごとの因果は画面いっぱいに配置する（因果編集画面では敵ごとに切り替えて表示する） */
function prefixNode(n: NodeDef, uid: string): NodeDef {
  let sensor = n.sensor;
  if (sensor && SCOPED.some(p => sensor!.startsWith(p))) sensor = `${sensor}@${uid}`;
  return { ...n, id: `${uid}.${n.id}`, sensor, x: 4 + n.x * 0.92, y: 24 + n.y * 0.66 };
}

function pid(id: string, uid: string): string {
  return id.startsWith('f.') || id.startsWith('p.') ? id : `${uid}.${id}`;
}

export function buildBattleGraph(def: BattleDef, enemies: Fighter[]): GraphDef {
  const nodes: NodeDef[] = [];
  const links: LinkDef[] = [];
  const field = def.field ?? 0;
  nodes.push({ id: 'f.void', label: '欠因の侵食', x: 50, y: -6, base: true, tag: 'fact' });
  FIELD_CONTRA_LABELS.forEach((label, i) => {
    nodes.push({ id: `f.c${i}`, label: `矛盾：${label}`, x: 14 + i * 36, y: 12, tag: 'contra' });
    links.push({ id: `f.l${i}`, from: 'f.void', to: `f.c${i}`, state: i < field ? 'intact' : 'severed', ops: ['cut'], cost: { cut: 1 }, label: '矛盾を解消する' });
  });
  let usesParty = false;
  enemies.forEach(e => {
    const tpl = ENEMY_MAP.get(e.tpl!)!;
    for (const n of tpl.nodes) nodes.push(prefixNode(n, e.uid));
    for (const l of tpl.links) {
      if (l.to.startsWith('p.') || l.from.startsWith('p.')) usesParty = true;
      links.push({ ...l, id: `${e.uid}.${l.id}`, from: pid(l.from, e.uid), to: pid(l.to, e.uid), steals: l.steals ? `${e.uid}.${l.steals}` : undefined });
    }
  });
  if (usesParty) nodes.push({ id: 'p.atk', label: '味方の攻撃強化（+30%）', x: 16, y: 78, tag: 'party', effect: ['partyAtkUp:30'] });
  return { id: 'battle:' + def.id, title: '戦場の因果', kind: 'battle', nodes, links };
}

function partyFighter(s: GameState, c: CharId): Fighter {
  const st = statsOf(s, c);
  const m = s.members[c]!;
  return {
    uid: c, name: CHARS[c].name, side: 'party', char: c,
    hp: m.hp, maxHp: st.hp, ap: m.ap, maxAp: st.ap, atk: st.atk, def: st.def, obs: st.obs, edit: st.edit,
    st: {}, stacks: 0, revives: 0, alive: m.hp > 0,
  };
}

export function startBattle(def: BattleDef, s: GameState, seed = Date.now()): BattleState {
  const enemies: Fighter[] = def.enemies.map((id, i) => {
    const t = ENEMY_MAP.get(id)!;
    const same = def.enemies.filter(x => x === id).length > 1;
    const letter = same ? 'ABC'[def.enemies.slice(0, i).filter(x => x === id).length] : '';
    return {
      uid: `e${i}`, name: t.name + letter, side: 'enemy', tpl: id,
      hp: t.hp, maxHp: t.hp, ap: 0, maxAp: 0, atk: t.atk, def: t.def, obs: 0, edit: 0,
      st: {}, stacks: 0, revives: 0, alive: true,
    };
  });
  const b: BattleState = {
    def, turn: 1,
    party: s.party.map(c => partyFighter(s, c)),
    enemies,
    graph: buildBattleGraph(def, enemies),
    edit: emptyEdit(),
    expiry: {},
    planned: {},
    editsThisTurn: 0,
    attacked: {},
    deviceCd: {},
    revealAll: false,
    freeCutUsed: false,
    holdClockUsed: false,
    margin: s.margin,
    rng: seed >>> 0,
    result: null,
    linked: {},
    covering: null,
    defending: {},
  };
  // 倒れている仲間も最低1で戦闘に参加させない（HP0は戦闘不能のまま）
  if (b.party.every(p => !p.alive)) { b.party[0].hp = 1; b.party[0].alive = true; }
  planIntents(b);
  return b;
}

// ---------- 条件の読み取り ----------

function fighterById(b: BattleState, uid: string): Fighter | undefined {
  return b.party.find(f => f.uid === uid) ?? b.enemies.find(f => f.uid === uid);
}

export function battleCtx(b: BattleState): EvalCtx {
  return {
    sensor: (key, contraCount) => {
      const [k, uid] = key.split('@');
      const self = uid ? fighterById(b, uid) : undefined;
      if (k === 'always') return true;
      if (k.startsWith('turnMod:')) {
        const [, m, r] = k.split(':');
        return b.turn % Number(m) === Number(r);
      }
      if (k.startsWith('contraLt:')) return contraCount < Number(k.split(':')[1]);
      if (k.startsWith('status:')) return !!self && (self.st[k.slice(7)] ?? 0) > 0;
      if (k === 'attacked') return !!self && !!b.attacked[self.uid];
      if (k === 'notAttacked') return !!self && !b.attacked[self.uid];
      if (k === 'allyAttacked') return b.enemies.some(e => e.alive && e.uid !== uid && b.attacked[e.uid]);
      if (k.startsWith('hpBelow:')) return !!self && self.hp / self.maxHp * 100 < Number(k.slice(8));
      const m = k.match(CMP_RE);
      if (m) {
        if (m[1] === 'contra') return compare(contraCount, m[2], Number(m[3]));
        if (m[1] === 'stacks') return !!self && compare(self.stacks, m[2], Number(m[3]));
      }
      return false;
    },
  };
}

export function evalBattle(b: BattleState) {
  return evaluate(b.graph, b.edit, battleCtx(b));
}

function nodeActive(b: BattleState, nodeId: string): boolean {
  return evalBattle(b).active.has(nodeId);
}

function effectActive(b: BattleState, owner: string, effect: string): number {
  const res = evalBattle(b);
  let total = 0;
  for (const n of b.graph.nodes) {
    if (!res.active.has(n.id)) continue;
    if (owner !== '*' && !n.id.startsWith(owner + '.')) continue;
    for (const e of n.effect ?? []) {
      const [k, v] = e.split(':');
      if (k === effect) total += v ? Number(v) : 1;
    }
  }
  return total;
}

export function intentOf(f: Fighter, id: string): IntentDef | undefined {
  return ENEMY_MAP.get(f.tpl!)?.intents.find(i => i.id === id);
}

/** 予告された行動が、いまの因果で成立するか */
export function intentHolds(b: BattleState, f: Fighter, it: IntentDef): boolean {
  return !it.node || nodeActive(b, `${f.uid}.${it.node}`);
}

export function planIntents(b: BattleState): void {
  for (const e of b.enemies) {
    if (!e.alive) { b.planned[e.uid] = null; continue; }
    const prev = b.planned[e.uid];
    if (prev?.carried) { b.planned[e.uid] = { intent: prev.intent }; continue; }
    const tpl = ENEMY_MAP.get(e.tpl!)!;
    const it = tpl.intents.find(i => intentHolds(b, e, i)) ?? tpl.intents[tpl.intents.length - 1];
    b.planned[e.uid] = { intent: it.id };
  }
}

// ---------- 数値 ----------

export function enemyAtk(b: BattleState, e: Fighter): number {
  const tpl = ENEMY_MAP.get(e.tpl!)!;
  const stackAtk = tpl.nodes.some(n => n.effect?.includes('stackAtk')) ? e.stacks * 3 : 0;
  return (e.atk + stackAtk) * (1 + effectActive(b, e.uid, 'atkUp') / 100);
}

export function enemyDef(e: Fighter): number {
  const tpl = ENEMY_MAP.get(e.tpl!)!;
  const stackDef = tpl.nodes.some(n => n.effect?.includes('stackDef')) ? e.stacks * 5 : 0;
  return (e.def + stackDef) * ((e.st.exposed ?? 0) > 0 ? 0.6 : 1);
}

function partyAtk(b: BattleState, p: Fighter): number {
  return p.atk * (1 + effectActive(b, '*', 'partyAtkUp') / 100);
}

function calcDamage(b: BattleState, atk: number, def: number, mult: number): number {
  const raw = atk * mult - def * 0.6;
  return Math.max(1, Math.round(Math.max(raw, atk * mult * 0.12) * (0.92 + rand(b) * 0.16)));
}

// ---------- 因果編集（戦闘） ----------

export function editLimit(s: GameState): number {
  return hasSkill(s, 's_double') ? 2 : 1;
}

export function battleEditEnv(b: BattleState, s: GameState): EditEnv {
  const free = new Set<Op>();
  if (hasSpecial(s, 'freeCut') && !b.freeCutUsed) free.add('cut');
  if (hasSpecial(s, 'holdClock') && !b.holdClockUsed) free.add('hold');
  return {
    records: new Set(s.records),
    obs: partyObs(s) + (hasSkill(s, 's_condview') ? 99 : 0),
    revealAll: b.revealAll,
    margin: b.margin,
    tolerance: 99,
    unlocked: new Set(s.unlocked),
    costDown: hasSkill(s, 's_costdown') ? 1 : 0,
    shards: s.inv.shard ?? 0,
    freeOps: free,
    ctx: battleCtx(b),
  };
}

export function checkBattleEdit(b: BattleState, s: GameState, t: Target, op: Op): EditCheck {
  const chk = checkEdit(b.graph, b.edit, t, op, battleEditEnv(b, s));
  if (b.editsThisTurn >= editLimit(s)) {
    chk.ok = false;
    chk.reasons.push('このターンはもう編集できない');
  }
  return chk;
}

export function doBattleEdit(b: BattleState, s: GameState, t: Target, op: Op): BEvent[] {
  const chk = checkBattleEdit(b, s, t, op);
  if (!chk.ok) return [];
  const ev: BEvent[] = [];
  b.edit = chk.nextEdit;
  b.margin -= chk.cost;
  if (chk.usesShard) s.inv.shard = Math.max(0, (s.inv.shard ?? 0) - 1);
  if (op === 'cut' && chk.cost === 0 && hasSpecial(s, 'freeCut')) b.freeCutUsed = true;
  if (op === 'hold' && chk.cost === 0 && hasSpecial(s, 'holdClock')) b.holdClockUsed = true;
  b.editsThisTurn++;
  if (t.kind === 'link' && !t.id.startsWith('f.l')) {
    b.expiry[t.id] = 2;
    const l = b.graph.links.find(x => x.id === t.id);
    if (l?.steals && op === 'connect') b.expiry[l.steals] = 2;
  }
  const label = t.kind === 'link' ? (b.graph.links.find(l => l.id === t.id)?.label ?? '因果') : b.graph.nodes.find(n => n.id === t.id)!.label;
  const opName = { connect: '接続', cut: '切断', invert: '反転', hold: '保留' }[op];
  ev.push({ t: 'edit', text: `因果編集：「${label}」を${opName}した。` });
  if (hasSkill(s, 's_echo')) {
    const seil = b.party.find(p => p.char === 'seil');
    if (seil?.alive) {
      const d = Math.max(1, Math.floor(seil.edit * 0.8));
      for (const e of b.enemies.filter(x => x.alive)) {
        e.hp = Math.max(0, e.hp - d);
        ev.push({ t: 'dmg', uid: e.uid, amount: d });
        handleDeath(b, e, ev);
      }
      checkEnd(b);
    }
  }
  return ev;
}

// ---------- 行動解決 ----------

function alive(list: Fighter[]): Fighter[] {
  return list.filter(f => f.alive);
}

function handleDeath(b: BattleState, f: Fighter, ev: BEvent[]): void {
  if (f.hp > 0 || !f.alive) return;
  if (f.side === 'enemy') {
    const tpl = ENEMY_MAP.get(f.tpl!)!;
    const reviveNode = tpl.nodes.find(n => n.effect?.includes('revive'));
    if (reviveNode && f.revives < 2 && nodeActive(b, `${f.uid}.${reviveNode.id}`)) {
      f.revives++;
      f.hp = Math.floor(f.maxHp * 0.5);
      ev.push({ t: 'revive', uid: f.uid });
      ev.push({ t: 'log', text: `${f.name}は戦場の矛盾に繋ぎ止められ、形を取り戻した！` });
      return;
    }
  }
  f.alive = false;
  f.hp = 0;
  f.st = {};
  ev.push({ t: 'death', uid: f.uid });
  ev.push({ t: 'log', text: f.side === 'enemy' ? `${f.name}は消えた。` : `${f.name}は倒れた……` });
}

function hit(b: BattleState, attacker: Fighter, target: Fighter, mult: number, ev: BEvent[], countsAsAttack = true): number {
  if (!target.alive) return 0;
  let dmg: number;
  if (attacker.side === 'party') {
    const link = b.linked[attacker.uid] ? 1.6 : 1;
    dmg = calcDamage(b, partyAtk(b, attacker), enemyDef(target), mult * link);
    if (countsAsAttack) b.attacked[target.uid] = true;
  } else {
    let def = target.def;
    if (b.defending[target.uid]) def *= 1.8;
    if (b.covering === target.uid) def *= 1.5;
    dmg = calcDamage(b, enemyAtk(b, attacker), def, mult);
    if (b.defending[target.uid]) dmg = Math.max(1, Math.floor(dmg * 0.6));
  }
  target.hp = Math.max(0, target.hp - dmg);
  ev.push({ t: 'dmg', uid: target.uid, amount: dmg, big: mult >= 1.8 });
  handleDeath(b, target, ev);
  return dmg;
}

function pickTarget(b: BattleState, wanted: string, side: 'party' | 'enemy'): Fighter | undefined {
  const list = side === 'party' ? b.party : b.enemies;
  const f = list.find(x => x.uid === wanted && x.alive);
  return f ?? alive(list)[0];
}

function echoFollow(b: BattleState, s: GameState, actor: Fighter, target: Fighter, ev: BEvent[]): void {
  if (!hasSpecial(s, 'echoRing') || !target.alive) return;
  const other = alive(b.party).find(p => p.uid !== actor.uid);
  if (!other || rand(b) > 0.3) return;
  ev.push({ t: 'log', text: `共鳴環が響き、${other.name}が続けて攻撃した！` });
  ev.push({ t: 'act', uid: other.uid });
  hit(b, other, target, 0.6, ev);
}

function doPartyCommand(b: BattleState, s: GameState, cmd: Command, ev: BEvent[]): void {
  const actor = b.party.find(p => p.uid === cmd.actor);
  if (!actor?.alive) return;
  if ((actor.st.stun ?? 0) > 0) { ev.push({ t: 'log', text: `${actor.name}は動けない！` }); return; }
  ev.push({ t: 'act', uid: actor.uid });
  if (cmd.kind === 'attack') {
    const t = pickTarget(b, cmd.target, 'enemy');
    if (!t) return;
    ev.push({ t: 'log', text: `${actor.name}の攻撃！` });
    hit(b, actor, t, 1, ev);
    echoFollow(b, s, actor, t, ev);
  } else if (cmd.kind === 'defend') {
    b.defending[actor.uid] = true;
    ev.push({ t: 'log', text: `${actor.name}は身構えた。` });
  } else if (cmd.kind === 'item') {
    const it = ITEM_MAP.get(cmd.item);
    if (!it?.use || (s.inv[cmd.item] ?? 0) <= 0) return;
    s.inv[cmd.item]--;
    if (s.inv[cmd.item] <= 0) delete s.inv[cmd.item];
    ev.push({ t: 'log', text: `${actor.name}は${it.name}を使った。` });
    if (it.use.hp || it.use.ap) {
      const t = b.party.find(p => p.uid === cmd.target && p.alive) ?? actor;
      if (it.use.hp) { const h = Math.min(it.use.hp, t.maxHp - t.hp); t.hp += h; ev.push({ t: 'heal', uid: t.uid, amount: h }); }
      if (it.use.ap) { t.ap = Math.min(t.maxAp, t.ap + it.use.ap); ev.push({ t: 'log', text: `${t.name}のAPが回復した。` }); }
    }
    if (it.use.margin) { b.margin = Math.min(marginMax(s), b.margin + it.use.margin); ev.push({ t: 'log', text: `余白が${b.margin}になった。` }); }
    if (it.use.obs) { b.revealAll = true; ev.push({ t: 'log', text: '敵の隠れた条件が見えるようになった。' }); }
  } else if (cmd.kind === 'device') {
    const dv = b.def.devices?.find(d => d.id === cmd.device);
    if (!dv || (b.deviceCd[dv.id] ?? 0) > 0) return;
    const t = pickTarget(b, cmd.target, 'enemy');
    if (!t) return;
    ev.push({ t: 'log', text: `${actor.name}は${dv.name}！` });
    t.hp = Math.max(0, t.hp - dv.dmg);
    ev.push({ t: 'dmg', uid: t.uid, amount: dv.dmg, big: true });
    handleDeath(b, t, ev);
    b.deviceCd[dv.id] = dv.cooldown + 1;
  } else if (cmd.kind === 'skill') {
    const sk = SKILL_MAP.get(cmd.skill);
    if (!sk || !sk.ap) return;
    if ((actor.st.sealed ?? 0) > 0) { ev.push({ t: 'log', text: `${actor.name}は沈黙していてスキルが使えない！ 代わりに攻撃した。` }); const t = pickTarget(b, cmd.target, 'enemy'); if (t) hit(b, actor, t, 1, ev); return; }
    if (actor.ap < sk.ap) { ev.push({ t: 'log', text: `${actor.name}はAPが足りない！` }); return; }
    actor.ap -= sk.ap;
    ev.push({ t: 'log', text: `${actor.name}の${sk.name}！` });
    const t = pickTarget(b, cmd.target, 'enemy');
    switch (sk.id) {
      case 's_strike': if (t) { hit(b, actor, t, b.editsThisTurn > 0 ? 2.4 : 1.6, ev); echoFollow(b, s, actor, t, ev); } break;
      case 'd_smash': if (t) { hit(b, actor, t, 1.8, ev); echoFollow(b, s, actor, t, ev); } break;
      case 'd_break':
        if (t) {
          delete t.st.charged;
          t.st.broken = 2;
          ev.push({ t: 'log', text: `${t.name}の構えが崩れた！（強化・溜めを解除）` });
          hit(b, actor, t, 0.8, ev);
        }
        break;
      case 'd_wound': if (t) { hit(b, actor, t, 1.0, ev); if (t.alive) { t.st.bleed = 3; ev.push({ t: 'log', text: `${t.name}に裂傷を負わせた。` }); } } break;
      case 'd_guard': b.covering = actor.uid; ev.push({ t: 'log', text: `${actor.name}は仲間の前に立ちはだかった。` }); break;
      case 's_analyze':
        if (t) { t.st.exposed = 3; b.revealAll = true; ev.push({ t: 'log', text: `${t.name}の弱点が露わになった！ 隠れた条件も見えるようになった。` }); }
        break;
      case 's_rewrite':
        if (t) {
          const tpl = ENEMY_MAP.get(t.tpl!)!;
          const weakest = tpl.intents[tpl.intents.length - 1];
          b.planned[t.uid] = { intent: weakest.id };
          ev.push({ t: 'log', text: `${t.name}の予告行動を「${weakest.name}」に書き換えた！` });
        }
        break;
      case 's_link': {
        const ally = b.party.find(p => p.uid === cmd.target && p.alive && p.uid !== actor.uid) ?? alive(b.party).find(p => p.uid !== actor.uid);
        if (ally) { b.linked[ally.uid] = true; ev.push({ t: 'log', text: `${ally.name}の次の攻撃が強化された。` }); }
        break;
      }
      case 'd_interrupt':
        if (t && b.planned[t.uid]) {
          b.planned[t.uid] = { intent: b.planned[t.uid]!.intent, carried: true };
          ev.push({ t: 'log', text: `${t.name}の行動を次のターンへ押し出した！` });
        }
        break;
    }
  }
}

function doEnemy(b: BattleState, s: GameState, e: Fighter, ev: BEvent[]): void {
  if (!e.alive) return;
  const plan = b.planned[e.uid];
  if (!plan) return;
  const it = intentOf(e, plan.intent)!;
  if (plan.carried) {
    ev.push({ t: 'log', text: `${e.name}の「${it.name}」は次のターンに持ち越された。` });
    return;
  }
  if ((e.st.stun ?? 0) > 0) { ev.push({ t: 'log', text: `${e.name}は動けない。` }); return; }
  const nodeId = it.node ? `${e.uid}.${it.node}` : null;
  if (nodeId && nodeId in b.edit.held) {
    ev.push({ t: 'fail', uid: e.uid, text: '保留' });
    ev.push({ t: 'log', text: `保留：${e.name}の「${it.name}」は確定せず、次のターンへ持ち越された。` });
    b.planned[e.uid] = { intent: it.id, carried: true };
    return;
  }
  ev.push({ t: 'act', uid: e.uid });
  if (!intentHolds(b, e, it)) {
    ev.push({ t: 'fail', uid: e.uid, text: '不成立' });
    ev.push({ t: 'log', text: `${e.name}の「${it.name}」は成立条件を失った！` });
    const dran = b.party.find(p => p.char === 'dran' && p.alive);
    if (dran && hasSkill(s, 'd_followup')) {
      ev.push({ t: 'log', text: `隙を逃さず、ドランが追撃！` });
      ev.push({ t: 'act', uid: dran.uid });
      hit(b, dran, e, 0.9, ev);
    }
    return;
  }
  const targets = alive(b.party);
  if (targets.length === 0) return;
  const single = (): Fighter => {
    if (b.covering && b.party.find(p => p.uid === b.covering)?.alive) return b.party.find(p => p.uid === b.covering)!;
    return targets[Math.floor(rand(b) * targets.length)];
  };
  ev.push({ t: 'log', text: `${e.name}の「${it.name}」！` });
  switch (it.kind) {
    case 'attack': hit(b, e, single(), it.power ?? 1, ev); break;
    case 'aoe': for (const t of targets) hit(b, e, t, it.power ?? 1, ev); break;
    case 'drain': {
      hit(b, e, single(), it.power ?? 1, ev);
      if (b.margin > 0) { b.margin--; ev.push({ t: 'log', text: '余白が1つ啜られた。' }); }
      break;
    }
    case 'seal': {
      const t = single();
      hit(b, e, t, it.power ?? 1, ev);
      if (t.alive) { t.st.sealed = 2; ev.push({ t: 'log', text: `${t.name}は沈黙し、スキルを封じられた。` }); }
      break;
    }
    case 'charge': e.st.charged = 2; ev.push({ t: 'log', text: `${e.name}は力を溜めている……` }); break;
    case 'contra': {
      const idx = [0, 1, 2].find(i => (b.edit.links[`f.l${i}`] ?? b.graph.links.find(l => l.id === `f.l${i}`)!.state) !== 'intact');
      if (idx !== undefined) {
        b.edit = { ...b.edit, links: { ...b.edit.links, [`f.l${idx}`]: 'intact' } };
        ev.push({ t: 'log', text: `戦場に新たな矛盾が生じた：${FIELD_CONTRA_LABELS[idx]}` });
      } else ev.push({ t: 'log', text: 'しかし何も起こらなかった。' });
      break;
    }
    case 'heal': {
      const tpl = ENEMY_MAP.get(e.tpl!)!;
      const allies = alive(b.enemies);
      const t = tpl.id === 'king' ? e : allies.filter(a => a.uid !== e.uid).sort((x, y) => x.hp / x.maxHp - y.hp / y.maxHp)[0] ?? e;
      const h = Math.min(it.power ?? 30, t.maxHp - t.hp);
      t.hp += h;
      ev.push({ t: 'heal', uid: t.uid, amount: h });
      break;
    }
    case 'idle': ev.push({ t: 'log', text: `${e.name}はあたりをうろついている。` }); break;
  }
}

function checkEnd(b: BattleState): void {
  if (alive(b.enemies).length === 0) b.result = 'win';
  else if (alive(b.party).length === 0) b.result = 'lose';
}

export function resolveTurn(b: BattleState, s: GameState, cmds: Command[]): BEvent[] {
  const ev: BEvent[] = [];
  b.attacked = {};
  for (const c of cmds) {
    if (b.result) break;
    doPartyCommand(b, s, c, ev);
    checkEnd(b);
  }
  for (const e of b.enemies) {
    if (b.result) break;
    doEnemy(b, s, e, ev);
    checkEnd(b);
  }
  if (!b.result) endTurn(b, ev);
  checkEnd(b);
  return ev;
}

function endTurn(b: BattleState, ev: BEvent[]): void {
  // 成立している出来事の効果（石を纏う・頁が積もる）
  const res = evalBattle(b);
  for (const e of alive(b.enemies)) {
    const tpl = ENEMY_MAP.get(e.tpl!)!;
    for (const n of tpl.nodes) {
      if (!res.active.has(`${e.uid}.${n.id}`)) continue;
      if (n.effect?.includes('stackDef') || n.effect?.includes('stackAtk')) {
        if (e.stacks < MAX_STACKS) {
          e.stacks++;
          ev.push({ t: 'log', text: n.effect.includes('stackDef') ? `${e.name}は石を纏った。（防御 ${Math.round(enemyDef(e))}）` : `${e.name}の頁が積もった。（攻撃+${e.stacks * 3}）` });
        }
      }
    }
    // 積み重なる効果は、その出来事が成立しなかったターンに1段はがれる
    const stackNode = tpl.nodes.find(n => n.effect?.includes('stackDef') || n.effect?.includes('stackAtk'));
    if (stackNode && e.stacks > 0 && !res.active.has(`${e.uid}.${stackNode.id}`)) {
      e.stacks--;
      ev.push({ t: 'log', text: stackNode.effect!.includes('stackDef') ? `${e.name}の石が一枚、剥がれ落ちた。` : `${e.name}の頁が一枚、散った。` });
    }
  }
  // 継続ダメージと状態の経過
  for (const f of [...b.party, ...b.enemies]) {
    if (!f.alive) continue;
    if ((f.st.bleed ?? 0) > 0) {
      const d = Math.max(3, Math.floor(f.maxHp * 0.05));
      f.hp = Math.max(0, f.hp - d);
      ev.push({ t: 'dmg', uid: f.uid, amount: d });
      handleDeath(b, f, ev);
    }
    for (const k of Object.keys(f.st)) {
      if (k === 'charged' && f.side === 'enemy') { f.st[k]--; if (f.st[k] <= 0) delete f.st[k]; continue; }
      f.st[k]--;
      if (f.st[k] <= 0) delete f.st[k];
    }
  }
  // 因果は元に戻ろうとする
  const exp: Record<string, number> = {};
  let reverted = false;
  const e2 = { links: { ...b.edit.links }, inverted: { ...b.edit.inverted }, held: {}, revealed: { ...b.edit.revealed } };
  for (const [id, n] of Object.entries(b.expiry)) {
    if (n - 1 <= 0) { delete e2.links[id]; delete e2.inverted[id]; reverted = true; }
    else exp[id] = n - 1;
  }
  if (Object.keys(b.edit.held).length > 0) ev.push({ t: 'log', text: '保留が解けた。' });
  b.edit = e2;
  b.expiry = exp;
  if (reverted) ev.push({ t: 'log', text: '編集した因果が、元の形に戻った。' });
  for (const k of Object.keys(b.deviceCd)) { b.deviceCd[k]--; if (b.deviceCd[k] <= 0) delete b.deviceCd[k]; }
  for (const p of alive(b.party)) p.ap = Math.min(p.maxAp, p.ap + 2);
  b.turn++;
  b.editsThisTurn = 0;
  b.freeCutUsed = false;
  b.linked = {};
  b.covering = null;
  b.defending = {};
  planIntents(b);
}

export function tryEscape(b: BattleState, s: GameState): BEvent[] {
  const ev: BEvent[] = [];
  if (b.def.boss) { ev.push({ t: 'log', text: 'この戦いからは逃げられない！' }); return ev; }
  if (rand(b) < 0.7) {
    b.result = 'escape';
    ev.push({ t: 'log', text: 'うまく逃げ切った。' });
    return ev;
  }
  ev.push({ t: 'log', text: '逃げられなかった！' });
  b.attacked = {};
  for (const e of b.enemies) { if (b.result) break; doEnemy(b, s, e, ev); checkEnd(b); }
  if (!b.result) endTurn(b, ev);
  checkEnd(b);
  return ev;
}

// ---------- 戦闘の終了 ----------

export interface Rewards { exp: number; gold: number; margin: number; drops: string[] }

export function rewards(b: BattleState): Rewards {
  const r: Rewards = { exp: 0, gold: 0, margin: 0, drops: [] };
  for (const e of b.enemies) {
    const t: EnemyDef = ENEMY_MAP.get(e.tpl!)!;
    r.exp += t.exp;
    r.gold += t.gold;
    r.margin += t.margin;
    for (const d of t.drops ?? []) if (rand(b) < d.rate) r.drops.push(d.item);
  }
  return r;
}

/** 戦闘の結果をゲーム状態に書き戻す */
export function writeBack(b: BattleState, s: GameState): void {
  for (const p of b.party) {
    const m = s.members[p.char!]!;
    m.hp = p.alive ? p.hp : (b.result === 'win' ? 1 : 0);
    m.ap = p.ap;
  }
  s.margin = Math.max(0, Math.min(marginMax(s), b.margin));
}

export function partyTolerance(s: GameState): number {
  return tolerance(s);
}

export function heldNodes(b: BattleState): string[] {
  return Object.keys(b.edit.held);
}

export function releaseHold(b: BattleState, nodeId: string): void {
  b.edit = release(b.edit, nodeId);
}

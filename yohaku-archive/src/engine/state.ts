// ゲーム状態と、状態を変更する明示的な処理。描画には依存しない。
import { CHARS, expToNext, MAX_LEVEL, type CharId, type StatKey } from '../data/chars';
import { ITEM_MAP, type Slot } from '../data/items';
import { SKILL_MAP, START_SKILLS } from '../data/skills';
import { evalCond, compare, CMP_RE } from './cond';
import { emptyEdit, evaluate, type GraphEdit, type Op } from './causal';
import { PUZZLE_MAP } from '../data/puzzles';

export const SAVE_VERSION = 2;

export interface Member {
  id: CharId;
  level: number;
  exp: number;
  hp: number;
  ap: number;
  equip: Record<Slot, string | null>;
  skills: string[];
  sp: number;
}

export interface WorldState {
  stability: number;
  repaired: number;
  contras: number;
  trust: number;
  policy: { restore: number; free: number; keep: number };
}

export interface GameState {
  version: number;
  map: string;
  x: number;
  y: number;
  dir: 0 | 1 | 2 | 3;
  party: CharId[];
  members: Partial<Record<CharId, Member>>;
  inv: Record<string, number>;
  gold: number;
  margin: number;
  flags: Record<string, number>;
  records: string[];
  quests: Record<string, number>;
  graphs: Record<string, GraphEdit>;
  outcomes: Record<string, string>;
  world: WorldState;
  unlocked: Op[];
  defeated: Record<string, number>;
  lens: Record<string, boolean>;
  log: string[];
  playtime: number;
  savedAt: number;
}

export function newMember(id: CharId, level = 1): Member {
  const m: Member = { id, level, exp: 0, hp: 0, ap: 0, equip: { ...CHARS[id].equip }, skills: [...START_SKILLS[id]], sp: level - 1 };
  return m;
}

export function newGame(): GameState {
  const s: GameState = {
    version: SAVE_VERSION,
    map: 'archive', x: 9, y: 4, dir: 0,
    party: ['seil'],
    members: { seil: newMember('seil') },
    inv: { potion: 3 },
    gold: 40,
    margin: 0,
    flags: {},
    records: [],
    quests: {},
    graphs: {},
    outcomes: {},
    world: { stability: 50, repaired: 0, contras: 0, trust: 50, policy: { restore: 0, free: 0, keep: 0 } },
    unlocked: ['connect', 'cut'],
    defeated: {},
    lens: {},
    log: [],
    playtime: 0,
    savedAt: 0,
  };
  fullHeal(s);
  s.margin = marginMax(s);
  return s;
}

// ---------- 能力値 ----------

export type Stats = Record<StatKey, number>;

export function statsOf(s: GameState, id: CharId): Stats {
  const m = s.members[id]!;
  const c = CHARS[id];
  const out = {} as Stats;
  for (const k of Object.keys(c.base) as StatKey[]) out[k] = Math.floor(c.base[k] + c.grow[k] * (m.level - 1));
  for (const slot of ['weapon', 'armor', 'acc'] as Slot[]) {
    const it = m.equip[slot] ? ITEM_MAP.get(m.equip[slot]!) : undefined;
    for (const [k, v] of Object.entries(it?.stats ?? {})) out[k as StatKey] += v as number;
  }
  if (m.skills.includes('s_reveal')) out.obs += 4;
  if (m.skills.includes('d_veteran')) { out.hp = Math.floor(out.hp * 1.2); out.obs += 3; }
  return out;
}

export function hasSkill(s: GameState, id: string): boolean {
  return s.party.some(c => s.members[c]?.skills.includes(id));
}

export function hasSpecial(s: GameState, special: string): boolean {
  return s.party.some(c => {
    const m = s.members[c]!;
    return Object.values(m.equip).some(e => e && ITEM_MAP.get(e)?.special === special);
  });
}

export function marginMax(s: GameState): number {
  const e = statsOf(s, 'seil').edit;
  return 4 + Math.floor(e / 4) + (hasSkill(s, 's_margin') ? 2 : 0) + (hasSpecial(s, 'marginUp') ? 2 : 0);
}

export function tolerance(s: GameState): number {
  return 1 + Math.floor(statsOf(s, 'seil').edit / 14) + (hasSkill(s, 's_tolerance') ? 1 : 0);
}

export function partyObs(s: GameState): number {
  return Math.max(...s.party.map(c => statsOf(s, c).obs));
}

export function fullHeal(s: GameState): void {
  for (const c of Object.keys(s.members) as CharId[]) {
    const st = statsOf(s, c);
    s.members[c]!.hp = st.hp;
    s.members[c]!.ap = st.ap;
  }
}

export function clampMember(s: GameState, id: CharId): void {
  const m = s.members[id]!;
  const st = statsOf(s, id);
  m.hp = Math.max(0, Math.min(st.hp, m.hp));
  m.ap = Math.max(0, Math.min(st.ap, m.ap));
}

// ---------- 成長 ----------

export function gainExp(s: GameState, amount: number): string[] {
  const msgs: string[] = [];
  for (const c of s.party) {
    const m = s.members[c]!;
    m.exp += amount;
    while (m.level < MAX_LEVEL && m.exp >= expToNext(m.level)) {
      m.exp -= expToNext(m.level);
      const before = statsOf(s, c);
      m.level++;
      m.sp++;
      const after = statsOf(s, c);
      m.hp += after.hp - before.hp;
      m.ap += after.ap - before.ap;
      msgs.push(`${CHARS[c].name}はレベル${m.level}になった！（スキルポイント+1）`);
    }
  }
  return msgs;
}

export function canLearn(s: GameState, c: CharId, skillId: string): { ok: boolean; reason?: string } {
  const m = s.members[c]!;
  const sk = SKILL_MAP.get(skillId);
  if (!sk || sk.owner !== c) return { ok: false, reason: '覚えられない' };
  if (m.skills.includes(skillId)) return { ok: false, reason: '習得済み' };
  if (sk.lv && m.level < sk.lv) return { ok: false, reason: `レベル${sk.lv}から` };
  if (sk.req && !m.skills.includes(sk.req)) return { ok: false, reason: `「${SKILL_MAP.get(sk.req)!.name}」が必要` };
  if (m.sp < sk.sp) return { ok: false, reason: 'スキルポイントが足りない' };
  return { ok: true };
}

export function learn(s: GameState, c: CharId, skillId: string): boolean {
  if (!canLearn(s, c, skillId).ok) return false;
  const m = s.members[c]!;
  m.sp -= SKILL_MAP.get(skillId)!.sp;
  m.skills.push(skillId);
  clampMember(s, c);
  s.margin = Math.min(s.margin, marginMax(s));
  return true;
}

export function joinParty(s: GameState, c: CharId): void {
  if (s.party.includes(c)) return;
  const lv = Math.max(3, s.members.seil!.level);
  const m = newMember(c, lv);
  m.sp = Math.max(1, lv - 2);
  s.members[c] = m;
  s.party.push(c);
  const st = statsOf(s, c);
  m.hp = st.hp;
  m.ap = st.ap;
}

// ---------- 持ち物 ----------

export function addItem(s: GameState, id: string, n = 1): void {
  s.inv[id] = (s.inv[id] ?? 0) + n;
  if (s.inv[id] <= 0) delete s.inv[id];
}

export function itemCount(s: GameState, id: string): number {
  let n = s.inv[id] ?? 0;
  for (const c of Object.keys(s.members) as CharId[]) for (const e of Object.values(s.members[c]!.equip)) if (e === id) n++;
  return n;
}

export function equip(s: GameState, c: CharId, itemId: string | null, slot: Slot): boolean {
  const m = s.members[c]!;
  if (itemId) {
    const it = ITEM_MAP.get(itemId);
    if (!it || it.slot !== slot || (it.owner && it.owner !== c) || (s.inv[itemId] ?? 0) <= 0) return false;
    addItem(s, itemId, -1);
  }
  const old = m.equip[slot];
  if (old) addItem(s, old, 1);
  m.equip[slot] = itemId;
  clampMember(s, c);
  s.margin = Math.min(s.margin, marginMax(s));
  return true;
}

/** 探索中のアイテム使用。使えたら説明文を返す */
export function useItemField(s: GameState, itemId: string, target?: CharId): string | null {
  const it = ITEM_MAP.get(itemId);
  if (!it?.use?.field || (s.inv[itemId] ?? 0) <= 0) return null;
  const u = it.use;
  let msg = '';
  if (u.hp || u.ap) {
    const c = target ?? 'seil';
    const m = s.members[c]!;
    const st = statsOf(s, c);
    if (u.hp) { if (m.hp >= st.hp) return null; m.hp = Math.min(st.hp, m.hp + u.hp); }
    if (u.ap) { if (m.ap >= st.ap && !u.hp) return null; m.ap = Math.min(st.ap, m.ap + u.ap); }
    msg = `${CHARS[c].name}に${it.name}を使った。`;
  } else if (u.margin) {
    if (s.margin >= marginMax(s)) return null;
    s.margin = Math.min(marginMax(s), s.margin + u.margin);
    msg = `余白が回復した（${s.margin}/${marginMax(s)}）。`;
  } else if (u.obs) {
    if (s.lens[s.map]) return null;
    s.lens[s.map] = true;
    msg = 'あたりの違和感が、くっきりと見えるようになった。';
  }
  addItem(s, itemId, -1);
  return msg;
}

// ---------- 記録・フラグ・世界状態 ----------

export function addRecord(s: GameState, id: string): boolean {
  if (s.records.includes(id)) return false;
  s.records.push(id);
  return true;
}

export function getGraphEdit(s: GameState, id: string): GraphEdit {
  return s.graphs[id] ?? emptyEdit();
}

export function cond(s: GameState, expr: string | undefined): boolean {
  return evalCond(expr, t => condTerm(s, t));
}

export function condTerm(s: GameState, t: string): boolean {
  const colon = t.indexOf(':');
  const kind = t.slice(0, colon);
  const rest = t.slice(colon + 1);
  const m = rest.match(CMP_RE);
  switch (kind) {
    case 'f': return m ? compare(s.flags[m[1]] ?? 0, m[2], Number(m[3])) : !!s.flags[rest];
    case 'r': return s.records.includes(rest);
    case 'q': return m ? compare(s.quests[m[1]] ?? 0, m[2], Number(m[3])) : (s.quests[rest] ?? 0) > 0;
    case 'i': return itemCount(s, rest) > 0;
    case 'p': return s.party.includes(rest as CharId);
    case 'o': { const [g, o] = rest.split('='); return s.outcomes[g] === o; }
    case 'd': return !!s.defeated[rest];
    case 'u': return s.unlocked.includes(rest as Op);
    case 'w': {
      if (!m) return false;
      const w = s.world;
      const v: Record<string, number> = { stability: w.stability, repaired: w.repaired, contras: unresolvedContras(s).length, trust: w.trust, restore: w.policy.restore, free: w.policy.free, keep: w.policy.keep };
      return compare(v[m[1]] ?? 0, m[2], Number(m[3]));
    }
    case 'g': return !!m && compare(s.gold, m[2], Number(m[3]));
    case 'x': // 観測能力が N 以上、またはこの区域で観測薬を使った
      return partyObs(s) >= Number(rest) || !!s.lens[s.map];
    case 'n': { // 記録の数
      return m ? compare(s.records.length, m[2], Number(m[3])) : false;
    }
    default: return false;
  }
}

/** 確定した因果編集のうち、矛盾を抱えたまま残っているものの数 */
export function unresolvedContras(s: GameState): { text: string; graph: string }[] {
  const out: { text: string; graph: string }[] = [];
  for (const [id, edit] of Object.entries(s.graphs)) {
    const g = PUZZLE_MAP.get(id);
    if (!g || g.kind === 'hypothesis' || !s.outcomes[id]) continue;
    for (const c of evaluate(g, edit).contras) out.push({ text: c.text, graph: g.title });
  }
  return out;
}

export function setFlag(s: GameState, f: string, v = 1): void {
  s.flags[f] = v;
}

export function clamp100(v: number): number {
  return Math.max(0, Math.min(100, v));
}

export function applyWorld(s: GameState, key: string, n: number): void {
  const w = s.world;
  if (key === 'stability') w.stability = clamp100(w.stability + n);
  else if (key === 'trust') w.trust = clamp100(w.trust + n);
  else if (key === 'repaired') w.repaired += n;
  else if (key === 'contras') w.contras = Math.max(0, w.contras + n);
  else if (key === 'restore' || key === 'free' || key === 'keep') w.policy[key] += n;
}

/** 世界簿に対するプレイヤーの方針（いちばん大きい値） */
export function policyName(s: GameState): string {
  const p = s.world.policy;
  const max = Math.max(p.restore, p.free, p.keep);
  if (max === 0) return 'まだ定まっていない';
  if (p.keep === max) return '矛盾を抱えて残す';
  if (p.restore === max) return '正しい形に修復する';
  return '縛りから解き放つ';
}

export function questStage(s: GameState, id: string): number {
  return s.quests[id] ?? 0;
}

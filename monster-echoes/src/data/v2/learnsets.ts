// 200種の 習得スキル。属性の 特技セット × 役割の 構成 × 特徴の ことば（毒・麻痺 など）× ランクで きめる。
// 同じ 属性・役割でも 図鑑番号で 特技を すこし かえて、にた モンスターに ちがいを つける。
// 特定の 種だけ かえたい ときは OVERRIDES に 書く（レベル と 特技ID の ならび）。
import type { Element2, MonsterDefinition, Role2 } from './types';

export type LearnEntry = { level: number; skillId: string };

type Kit = {
  /** ひとりを うつ 呪文 */ magic: string[];
  /** 全体の 呪文 */ all: string[];
  /** 属性つきの 物理 */ phys: string[];
  /** 息 */ breath: string;
  /** 上位（ランク3いじょう） */ high: string[];
  /** 属性らしい 補助 */ support: string[];
};

const KIT: Record<Element2, Kit> = {
  fire: { magic: ['ember'], all: ['heatwave'], phys: ['firefang', 'flameclaw'], breath: 'flamebreath', high: ['fireball', 'scorch', 'flamedrive', 'megaflare'], support: ['focus', 'warcry'] },
  water: { magic: ['splash'], all: ['wave'], phys: ['aquafang', 'aquatail'], breath: 'bubblebreath', high: ['aquaburst', 'tidalwave'], support: ['aquaheal', 'mistveil'] },
  wind: { magic: ['gust', 'leaf'], all: ['windwave'], phys: ['galeslash', 'aircutter'], breath: 'cyclone', high: ['tornado', 'cyclone'], support: ['tailwind', 'haste'] },
  earth: { magic: ['earthspike'], all: ['pebbles', 'quake'], phys: ['rocksmash', 'headbutt'], breath: 'quake', high: ['terraburst', 'rockfall'], support: ['stoneskin', 'crumble'] },
  thunder: { magic: ['spark'], all: ['thunder'], phys: ['thunderfang', 'voltclaw'], breath: 'stormbreath', high: ['thunderbolt', 'thunder'], support: ['thunderwave', 'haste'] },
  ice: { magic: ['icicle', 'icefeather'], all: ['blizzard'], phys: ['frostclaw'], breath: 'icebreath', high: ['frostspear', 'blizzard'], support: ['chillwind', 'iceshield'] },
  light: { magic: ['glimmer'], all: ['lightrain'], phys: ['lightfang'], breath: 'crystalbreath', high: ['holylight', 'lightrain'], support: ['lightshield', 'heal'] },
  shadow: { magic: ['shadowbolt'], all: ['darkwave'], phys: ['shadowclaw', 'drainbite'], breath: 'darkbreath', high: ['nightmare', 'abyss'], support: ['curse', 'darkmist'] },
};

/** 役割ごとの 習得の ならび（L1 から じゅんに） */
type Slot = 'magic' | 'all' | 'phys' | 'breath' | 'high' | 'support' | 'heal' | 'healall' | 'revive' | 'guard' | 'teamguard' | 'basic' | 'big' | 'charge'
  | 'fast' | 'multi' | 'debuff' | 'status' | 'mind' | 'cure';
const ROLE_PLAN: Record<Role2, Slot[]> = {
  attacker: ['phys', 'basic', 'charge', 'big', 'high', 'multi', 'breath'],
  caster: ['magic', 'all', 'mind', 'high', 'debuff', 'breath', 'high'],
  tank: ['guard', 'phys', 'teamguard', 'basic', 'debuff', 'high', 'big'],
  support: ['heal', 'support', 'magic', 'healall', 'cure', 'revive', 'high'],
  status: ['status', 'magic', 'debuff', 'status', 'all', 'high', 'mind'],
  speed: ['fast', 'phys', 'support', 'multi', 'all', 'high', 'big'],
  special: ['magic', 'support', 'debuff', 'all', 'mind', 'high', 'breath'],
};

/** 系統らしい 物理技（はさみは カニ・虫、つるは 植物 など） */
const FAMILY_BASIC: Record<string, string[]> = {
  slime: ['tackle', 'headbutt'], beast: ['bite', 'headbutt'], plant: ['vinewhip', 'headbutt'], bug: ['bite', 'pinch'], bird: ['wingstrike', 'peck'],
  water: ['pinch', 'shellbash'], material: ['headbutt', 'shellbash'], spirit: ['headbutt', 'tackle'], dragon: ['bite', 'tackle'], mystic: ['headbutt', 'tackle'],
};
const FAMILY_MULTI: Record<string, string[]> = {
  slime: ['peck'], beast: ['triplebite', 'peck'], plant: ['vinewhip', 'peck'], bug: ['peck'], bird: ['peck', 'aircutter'],
  water: ['peck'], material: ['peck'], spirit: ['peck'], dragon: ['triplebite', 'peck'], mystic: ['peck'],
};

const pick = <T,>(xs: readonly T[], n: number): T => xs[((n % xs.length) + xs.length) % xs.length];

const POOL: Record<string, string[]> = {
  heal: ['heal', 'aquaheal', 'regen'],
  healall: ['healall', 'healbreeze'],
  revive: ['revive'],
  guard: ['harden', 'shellguard', 'stoneskin'],
  teamguard: ['veil', 'iceshield', 'ironwall'],
  big: ['megahorn', 'tackle', 'rampage', 'sweep'],
  charge: ['focus', 'warcry'],
  fast: ['quickstrike', 'galeslash', 'wingstrike'],
  debuff: ['glare', 'dust', 'roar', 'armorbreak', 'mindbreak'],
  status: ['stunspore', 'lullaby', 'poisonmist', 'dazzle', 'sleepsong', 'toxic'],
  mind: ['focusmind', 'calmmind', 'magicup'],
  cure: ['antidote', 'purify'],
};

/** 特徴の ことば → その ことばに あう 特技（はやい レベルで おぼえる） */
const NOTE_SKILLS: [RegExp, string[]][] = [
  [/毒/, ['poisonsting', 'poisonmist', 'toxic']],
  [/麻痺|しびれ/, ['stunclaw', 'stunspore', 'thunderwave']],
  [/睡眠|眠り|眠/, ['lullaby', 'sleepsong']],
  [/混乱|幻惑|幻/, ['dazzle', 'illusion']],
  [/吸収|ドレイン|吸/, ['souldrain', 'drainbite']],
  [/速度を低下|減速/, ['chillwind', 'dust']],
  [/防御低下|崩し/, ['armorbreak', 'crumble']],
  [/弱体/, ['glare', 'curse', 'roar']],
  [/蘇生/, ['revive']],
  [/全体回復|全体支援/, ['healall', 'veil']],
  [/回復/, ['heal', 'aquaheal']],
  [/先制|高速/, ['quickstrike', 'galeslash']],
  [/連続|連撃/, ['peck', 'aircutter']],
  [/反射|魔法耐性/, ['calmmind', 'mistveil']],
  [/強化|支援/, ['warcry', 'magicup']],
];

/** ランクごとの 習得数と レベル */
const LEVELS: Record<number, number[]> = {
  1: [1, 4, 8, 13, 19, 26],
  2: [1, 5, 9, 14, 20, 27, 35],
  3: [1, 1, 8, 14, 21, 29, 38],
  4: [1, 1, 10, 18, 27, 37, 48],
  5: [1, 1, 12, 22, 33, 45, 58],
};

/** 伝説級（ランク5）の 固有特技 */
function signature(d: MonsterDefinition): string {
  if (d.element === 'light') return d.role === 'support' ? 'eternallight' : 'starfall';
  if (d.element === 'shadow') return 'voidnova';
  if (d.element === 'water') return 'tsunamicrown';
  if (d.element === 'fire') return 'infernoroar';
  return 'primalroar';
}

/** 個別の 手直し（データとして 管理する） */
export const LEARNSET_OVERRIDES: Record<string, [number, string][]> = {
  // ルナスライム：主人公の 相棒。回復と 光、そだつと 守りと 蘇生
  m001: [[1, 'heal'], [3, 'glimmer'], [7, 'veil'], [12, 'antidote'], [18, 'healall'], [23, 'lightshield'], [28, 'revive']],
  // バブルミニ：初期回復役
  m002: [[1, 'aquaheal'], [3, 'splash'], [8, 'bubblebreath'], [13, 'mistveil'], [19, 'healbreeze']],
  // メタルスピリット：v1 と おなじ 方向性
  m017: [[1, 'metalbody'], [1, 'galeslash'], [10, 'haste'], [18, 'aircutter'], [27, 'ironwall'], [37, 'tornado']],
  // ゴールドスライム
  m015: [[1, 'happyguard'], [1, 'glimmer'], [10, 'goldflash'], [18, 'healall'], [27, 'ironwall'], [37, 'holylight']],
};

function resolve(slot: Slot, d: MonsterDefinition, salt: number): string {
  const k = KIT[d.element];
  switch (slot) {
    case 'magic': return pick(k.magic, salt);
    case 'all': return pick(k.all, salt);
    case 'phys': return pick(k.phys, salt);
    case 'breath': return k.breath;
    case 'high': return pick(k.high, salt);
    case 'support': return pick(k.support, salt);
    case 'basic': return pick(FAMILY_BASIC[d.family], salt);
    case 'multi': return pick(FAMILY_MULTI[d.family], salt);
    default: return pick(POOL[slot], salt);
  }
}

export function generateLearnset(d: MonsterDefinition): LearnEntry[] {
  const over = LEARNSET_OVERRIDES[d.id];
  if (over) return over.map(([level, skillId]) => ({ level, skillId }));
  const levels = LEVELS[d.rank];
  const plan = ROLE_PLAN[d.role];
  const ids: string[] = [];
  const add = (id: string) => { if (!ids.includes(id)) ids.push(id); };
  // 特徴の ことばに あう 特技を 2番目に 入れる（L1〜L5 で おぼえる）
  let noteSkill: string | undefined;
  for (const [re, xs] of NOTE_SKILLS) if (re.test(d.note)) { noteSkill = pick(xs, d.no); break; }
  for (let i = 0; i < plan.length && ids.length < levels.length; i++) {
    if (i === 1 && noteSkill) add(noteSkill);
    if (ids.length >= levels.length) break;
    let id = resolve(plan[i], d, d.no + i);
    // かぶったら となりの 候補を ためす
    for (let j = 1; ids.includes(id) && j < 4; j++) id = resolve(plan[i], d, d.no + i + j);
    add(id);
  }
  // たりない ときは 属性の 上位特技で うめる
  for (let j = 0; ids.length < levels.length && j < 8; j++) add(pick([...KIT[d.element].high, KIT[d.element].breath, ...KIT[d.element].all], d.no + j));
  const out = ids.slice(0, levels.length).map((skillId, i) => ({ level: levels[i], skillId }));
  if (d.rank === 5) out.push({ level: levels[levels.length - 1] + 8, skillId: signature(d) });
  return out;
}

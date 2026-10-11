// モンスター定義を つくる 関数。能力は「役割 × ランク × 成長型」の テンプレートから きめる（v1 の mon() と おなじ やりかた）。
import { ELEMENTS2, type Element2, type Family2, type GrowthType2, type MonsterDefinition, type Rank2, type Resistances2, type ResistKey2, type ResistLevel, type Role2, type Stats2 } from '../types';

const S = (hp: number, mp: number, atk: number, def: number, mag: number, spr: number, spd: number): Stats2 => ({ hp, mp, atk, def, mag, spr, spd });

/** 役割ごとの Lv1 能力と 1レベルの のび（v1 の 6能力の 値を もとに、賢さを 魔力・精神に わけた） */
export const ROLE_TEMPLATE: Record<Role2, [Stats2, Stats2]> = {
  attacker: [S(15, 4, 11, 7, 4, 5, 9), S(4.2, 1.5, 3.2, 2.0, 1.2, 1.4, 2.6)],
  caster: [S(13, 9, 6, 7, 12, 9, 9), S(3.6, 3.0, 1.8, 2.0, 3.4, 2.6, 2.6)],
  tank: [S(18, 3, 9, 12, 3, 7, 4), S(4.8, 1.2, 2.6, 3.4, 1.0, 2.2, 1.2)],
  support: [S(13, 8, 8, 7, 8, 11, 9), S(3.6, 2.8, 2.3, 2.0, 2.4, 3.0, 2.6)],
  status: [S(13, 8, 8, 7, 10, 8, 10), S(3.5, 2.6, 2.2, 2.0, 3.0, 2.4, 2.8)],
  speed: [S(12, 6, 8, 6, 7, 6, 13), S(3.4, 2.2, 2.4, 1.8, 2.2, 2.0, 3.4)],
  special: [S(14, 8, 8, 9, 9, 9, 8), S(3.8, 2.4, 2.4, 2.6, 2.6, 2.6, 2.2)],
};
/** ランクごとの [Lv1能力の倍率, のびの倍率]（v1 の TIER_SCALE に 伝説級を たした） */
export const RANK_SCALE: Record<Rank2, [number, number]> = { 1: [1, 1], 2: [1.2, 1.15], 3: [1.5, 1.35], 4: [1.8, 1.55], 5: [2.1, 1.75] };
/** ランクごとの 配合なしの レベル上限 */
export const RANK_LEVEL_CAP: Record<Rank2, number> = { 1: 30, 2: 40, 3: 50, 4: 60, 5: 70 };

/** 成長型による のびの 補正（早熟・晩成は レベルによる 曲線で あらわすので ここでは かえない） */
const GROWTH_MOD: Record<GrowthType2, Partial<Stats2>> = {
  early: {}, late: {}, balanced: {}, variable: {},
  offense: { atk: 1.15, mag: 1.15, def: 0.85, spr: 0.85 },
  endure: { hp: 1.15, def: 1.15, spr: 1.15, atk: 0.9, mag: 0.9 },
};

/** 系統の 基本耐性（仕様 11.3 の 特性に あわせる） */
export const FAMILY_RESIST: Record<Family2, Resistances2> = {
  slime: { sleep: 1, poison: 1 },
  beast: { paralysis: 1, confusion: -1 },
  plant: { poison: 1, sleep: 1, fire: -1 },
  bug: { poison: 2, paralysis: 1 },
  bird: { earth: 2, wind: 1 },
  water: { water: 1, fire: 1 },
  material: { poison: 3, sleep: 2, confusion: 1 },
  spirit: { poison: 3, paralysis: 1 },
  dragon: { sleep: 1, paralysis: 1, confusion: 1 },
  mystic: { confusion: 2, sleep: 1 },
};
/** 属性の 弱点（仕様 8.3） */
export const ELEMENT_WEAKNESS: Record<Element2, Element2> = {
  fire: 'water', water: 'thunder', wind: 'earth', earth: 'wind', thunder: 'earth', ice: 'fire', light: 'shadow', shadow: 'light',
};

/** 系統と 属性が うちけしあって 弱点が なくなった ときの 予備の 弱点 */
const FAMILY_FALLBACK_WEAK: Record<Family2, Element2> = {
  slime: 'earth', beast: 'ice', plant: 'fire', bug: 'fire', bird: 'thunder', water: 'thunder', material: 'thunder', spirit: 'light', dragon: 'ice', mystic: 'shadow',
};

const clampR = (v: number): ResistLevel => Math.max(-1, Math.min(3, v)) as ResistLevel;
const scale = (st: Stats2, k: number, mod: Partial<Stats2> = {}, round = false): Stats2 =>
  Object.fromEntries(Object.entries(st).map(([key, v]) => {
    const x = v * k * (mod[key as keyof Stats2] ?? 1);
    return [key, round ? Math.round(x) : Math.round(x * 10) / 10];
  })) as Stats2;

export type DefOptions = { resist?: Resistances2; baseStats?: Partial<Stats2>; growthRates?: Partial<Stats2>; description?: string; slug?: string };

export function def(no: number, name: string, family: Family2, element: Element2, role: Role2, rank: Rank2, growthType: GrowthType2, note: string, o: DefOptions = {}): MonsterDefinition {
  const [b, g] = ROLE_TEMPLATE[role];
  const [kb, kg] = RANK_SCALE[rank];
  const base = { ...scale(b, kb, {}, true), ...o.baseStats };
  const growth = { ...scale(g, kg, GROWTH_MOD[growthType]), ...o.growthRates };
  // 耐性: 系統 ＋ 属性（じぶんの 属性に つよく、弱点の 属性に よわい）＋ 個別
  const res: Resistances2 = { ...FAMILY_RESIST[family] };
  const add = (k: ResistKey2, d: number) => { res[k] = clampR((res[k] ?? 0) + d); };
  add(element, rank >= 4 ? 2 : 1);
  add(ELEMENT_WEAKNESS[element], -1);
  if (!ELEMENTS2.some((k) => (res[k] ?? 0) < 0)) {
    const w = FAMILY_FALLBACK_WEAK[family] === element ? ELEMENT_WEAKNESS[FAMILY_FALLBACK_WEAK[family]] : FAMILY_FALLBACK_WEAK[family];
    res[w] = -1;
  }
  for (const [k, v] of Object.entries(o.resist ?? {})) res[k as ResistKey2] = v as ResistLevel;
  for (const k of Object.keys(res) as ResistKey2[]) if (res[k] === 0) delete res[k];
  const id = `m${String(no).padStart(3, '0')}`;
  return {
    id, no, name, family, rank, element, role, growthType,
    baseStats: base, growthRates: growth, levelCap: RANK_LEVEL_CAP[rank],
    resistances: res, skills: [], breedingGroup: family, habitatIds: [],
    spriteId: `mon_${String(no).padStart(3, '0')}_${o.slug ?? id}`,
    note, description: o.description ?? note, legendary: rank === 5,
  };
}

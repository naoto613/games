// v2（大規模拡張）の ゲームデータの 型。docs/v2/IMPLEMENTATION_PLAN.md §4.2
// v1 の データ（src/data/*.ts）と ならべて おき、Phase 0 の とちゅうで きりかえる。

/** 7つの 能力（v1 の 賢さを 魔力・精神に わけた） */
export type StatKey2 = 'hp' | 'mp' | 'atk' | 'def' | 'mag' | 'spr' | 'spd';
export const STAT_KEYS2: readonly StatKey2[] = ['hp', 'mp', 'atk', 'def', 'mag', 'spr', 'spd'];
export type Stats2 = Record<StatKey2, number>;

/** 10系統 */
export type Family2 = 'slime' | 'beast' | 'plant' | 'bug' | 'bird' | 'water' | 'material' | 'spirit' | 'dragon' | 'mystic';
export const FAMILIES2: readonly Family2[] = ['slime', 'beast', 'plant', 'bug', 'bird', 'water', 'material', 'spirit', 'dragon', 'mystic'];

/** 8属性 */
export type Element2 = 'fire' | 'water' | 'wind' | 'earth' | 'thunder' | 'ice' | 'light' | 'shadow';
export const ELEMENTS2: readonly Element2[] = ['fire', 'water', 'wind', 'earth', 'thunder', 'ice', 'light', 'shadow'];
export type Status2 = 'sleep' | 'paralysis' | 'confusion' | 'poison';
export type ResistKey2 = Element2 | Status2;
export const RESIST_KEYS2: readonly ResistKey2[] = [...ELEMENTS2, 'sleep', 'paralysis', 'confusion', 'poison'];
/** 耐性レベル: -1 よわい / 0 ふつう / 1 つよい / 2 とてもつよい / 3 むこう / 4 きゅうしゅう（属性のみ） */
export type ResistLevel = -1 | 0 | 1 | 2 | 3 | 4;
export type Resistances2 = Partial<Record<ResistKey2, ResistLevel>>;

/** 役割（仕様 8.2） */
export type Role2 = 'attacker' | 'caster' | 'tank' | 'support' | 'status' | 'speed' | 'special';
/** 成長型（仕様 10.2） */
export type GrowthType2 = 'early' | 'late' | 'balanced' | 'offense' | 'endure' | 'variable';
/** ランク 1〜5（5 = 伝説級） */
export type Rank2 = 1 | 2 | 3 | 4 | 5;

export type MonsterDefinition = {
  /** 'm001'〜'm200' */
  id: string;
  no: number;
  name: string;
  family: Family2;
  rank: Rank2;
  element: Element2;
  role: Role2;
  growthType: GrowthType2;
  /** Lv1 の 能力 */
  baseStats: Stats2;
  /** 1レベルあたりの 平均の のび */
  growthRates: Stats2;
  /** 配合なしの レベル上限 */
  levelCap: number;
  resistances: Resistances2;
  /** 覚える スキル（Phase 0-5 で スキル表と いっしょに うめる） */
  skills: { level: number; skillId: string }[];
  /** 配合グループ（系統配合・ランク表で つかう） */
  breedingGroup: string;
  /** 生息地（'ダンジョンID:階' など。Phase 1〜 で うめる） */
  habitatIds: string[];
  /** スプライト（assets/monsters/mon_###_slug.png） */
  spriteId: string;
  /** 仕様書の 役割・特徴 */
  note: string;
  description: string;
  /** 伝説級（ランク5） */
  legendary: boolean;
};

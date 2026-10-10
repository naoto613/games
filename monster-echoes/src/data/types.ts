// ゲームデータ（マスタ）の型。計算ロジックは domain/ に置き、ここには「値」だけを持たせる。

export type StatKey = 'hp' | 'mp' | 'attack' | 'defense' | 'speed' | 'wisdom';
export const STAT_KEYS: readonly StatKey[] = ['hp', 'mp', 'attack', 'defense', 'speed', 'wisdom'];
export type Stats = Record<StatKey, number>;

/** 早熟／普通／晩成。レベルの進み具合で伸び幅が変わる。 */
export type GrowthCurve = 'early' | 'normal' | 'late';

/** 属性・状態異常の耐性キー */
export type ElementId = 'fire' | 'ice' | 'wind' | 'earth' | 'light';
export type StatusId = 'sleep' | 'paralysis' | 'confusion' | 'poison';
export type ResistKey = ElementId | StatusId;
export const RESIST_KEYS: readonly ResistKey[] = ['fire', 'ice', 'wind', 'earth', 'light', 'sleep', 'paralysis', 'confusion', 'poison'];
/** -1:よわい 0:ふつう 1:つよい 2:とてもつよい 3:むこう */
export type Resistances = Partial<Record<ResistKey, number>>;

export type LearnsetEntry = { level: number; skillId: string };

export type FamilyId = 'spirit' | 'beast' | 'mineral' | 'bird' | 'plant' | 'mystery';

export type FamilyDefinition = {
  id: FamilyId;
  name: string;
  baseResistances: Resistances;
};

export type MonsterSpecies = {
  id: string;
  name: string;
  familyId: FamilyId;
  /** 1:野生で出会える 2:中級 3:配合でしか生まれない 4:伝説 */
  rarity: number;
  /** レベル1の能力 */
  baseStats: Stats;
  /** 1レベルあたりの平均的な伸び */
  growth: Stats;
  growthCurves: Partial<Record<StatKey, GrowthCurve>>;
  statCaps: Stats;
  /** 系統の耐性に上乗せ・上書きする耐性 */
  resistances: Resistances;
  learnset: LearnsetEntry[];
  baseLevelCap: number;
  absoluteLevelCap: number;
  /** 経験値の必要量の係数（大きいほど育ちにくい） */
  expRate: number;
  /** 倒したときの経験値・ゴールドの基準 */
  expYield: number;
  goldYield: number;
  recruitBaseChance: number;
  spriteId: string;
  description: string;
};

export type SkillCategory = 'physical' | 'magic' | 'breath' | 'heal' | 'revive' | 'buff' | 'debuff' | 'status' | 'cure';
export type SkillTarget = 'self' | 'oneAlly' | 'allAllies' | 'oneEnemy' | 'allEnemies' | 'randomEnemies';
export type BuffStat = 'attack' | 'defense' | 'speed';

export type SkillDefinition = {
  id: string;
  name: string;
  category: SkillCategory;
  target: SkillTarget;
  mpCost: number;
  /** 物理: 攻撃力にかける倍率／呪文・息: 基礎ダメージ／回復: 回復量／蘇生: 回復割合(%) */
  power: number;
  hitRate: number;
  priority: number;
  elementId?: ElementId;
  statusEffectId?: StatusId;
  statusChance?: number;
  /** randomEnemies の回数 */
  hits?: number;
  buff?: { stat: BuffStat; stages: number };
  /** ちからため（次の物理攻撃が 2 倍） */
  charge?: boolean;
  /** 反動（与えたダメージの割合） */
  recoil?: number;
  /** 条件を満たすと上位の特技に変化する */
  upgrade?: { to: string; level: number; stat: Partial<Stats> };
  /** 配合で受け継げない特技 */
  noInherit?: boolean;
  description: string;
};

export type ItemCategory = 'heal' | 'mp' | 'revive' | 'cure' | 'meat' | 'escape' | 'key';
export type ItemDefinition = {
  id: string;
  name: string;
  category: ItemCategory;
  price: number;
  power: number;
  /** 戦闘中に使えるか */
  battle: boolean;
  /** フィールドで使えるか */
  field: boolean;
  description: string;
};

export type SpeciesMatcher = { speciesId: string } | { familyId: FamilyId; maxRarity?: number } | { any: true };

export type BreedingCondition =
  /** 親2体のプラス値の合計 */
  | { type: 'minPlusSum'; value: number }
  | { type: 'minLevelSum'; value: number }
  | { type: 'flag'; id: string };

export type BreedingRecipe = {
  id: string;
  kind: 'special' | 'familyCombination' | 'fallback';
  /** 血統（はじめに選ぶ親） */
  parentA: SpeciesMatcher;
  /** 相手 */
  parentB: SpeciesMatcher;
  /** 親A・親Bを入れ替えても成立するか */
  symmetric?: boolean;
  resultSpeciesId: string;
  priority: number;
  conditions?: BreedingCondition[];
  /** 図鑑に出すヒント */
  hint?: string;
};

export type Condition =
  | { type: 'flag'; id: string }
  | { type: 'boss'; id: string }
  | { type: 'arena'; id: string };

export type EncounterEntry = { speciesId: string; weight: number; minLevel: number; maxLevel: number };
export type EncounterTable = { id: string; entries: EncounterEntry[]; groupSize: { weight: number; value: number }[] };

export type EnemySpec = {
  speciesId: string;
  level: number;
  /** ボス用の補正（HP 倍率など） */
  hpScale?: number;
  statScale?: number;
  skills?: string[];
  name?: string;
  distorted?: boolean;
  recruitable?: boolean;
};

export type BossDefinition = {
  id: string;
  name: string;
  intro: string[];
  enemies: EnemySpec[];
  defeatText: string[];
  rewards: Reward[];
  setFlags: string[];
};

export type Reward = { type: 'gold'; amount: number } | { type: 'item'; itemId: string; count: number } | { type: 'capacity'; amount: number };

export type FloorDefinition = {
  id: string;
  name: string;
  encounterTableId: string;
  mapTemplateId: string;
  /** 宝箱から出るもの */
  chestTable: { weight: number; value: Reward }[];
  bossId?: string;
};

export type AreaDefinition = {
  id: string;
  name: string;
  description: string;
  recommendedLevel: number;
  floors: FloorDefinition[];
  unlockConditions: Condition[];
  theme: 'forest' | 'cave' | 'highland';
};

export type ArenaBattleDefinition = { trainer: string; enemies: EnemySpec[]; tactic?: Tactic };
export type ArenaRankDefinition = {
  id: string;
  name: string;
  entryConditions: Condition[];
  battles: ArenaBattleDefinition[];
  betweenBattleRecovery: 'none' | 'partial' | 'full';
  rewards: Reward[];
  setFlags: string[];
  description: string;
};

export type Tactic = 'attack' | 'skill' | 'support' | 'save';

// ゲームデータ（マスタ）の型。計算ロジックは domain/ に置き、ここには「値」だけを持たせる。

/** 7能力（仕様 10.1）。v1 の「かしこさ」は 魔力（magic）と 精神（spirit）に わけた */
export type StatKey = 'hp' | 'mp' | 'attack' | 'defense' | 'speed' | 'magic' | 'spirit';
// 順番は 乱数の つかいかたに かかわるので v1（hp, mp, attack, defense, speed, wisdom）の 順を まもり、精神を さいごに たす
export const STAT_KEYS: readonly StatKey[] = ['hp', 'mp', 'attack', 'defense', 'speed', 'magic', 'spirit'];
export type Stats = Record<StatKey, number>;

/** 早熟／普通／晩成。レベルの進み具合で伸び幅が変わる。 */
export type GrowthCurve = 'early' | 'normal' | 'late';
/** 成長タイプ6種（仕様 10.2）。早熟・晩成は 曲線、攻撃特化・耐久は 能力の かたより、変則は 戦闘中の 覚醒で あらわす */
export type GrowthType = 'early' | 'late' | 'balanced' | 'offense' | 'endure' | 'variable';

/** 属性・状態異常の耐性キー */
export type ElementId = 'fire' | 'water' | 'wind' | 'earth' | 'thunder' | 'ice' | 'light' | 'shadow';
export const ELEMENT_IDS: readonly ElementId[] = ['fire', 'water', 'wind', 'earth', 'thunder', 'ice', 'light', 'shadow'];
export type StatusId = 'sleep' | 'paralysis' | 'confusion' | 'poison';
export type ResistKey = ElementId | StatusId;
export const RESIST_KEYS: readonly ResistKey[] = [...ELEMENT_IDS, 'sleep', 'paralysis', 'confusion', 'poison'];
/** -1:よわい 0:ふつう 1:つよい 2:とてもつよい 3:むこう 4:きゅうしゅう（属性だけ。ダメージの かわりに 回復する） */
export type Resistances = Partial<Record<ResistKey, number>>;

export type LearnsetEntry = { level: number; skillId: string };

export type FamilyId = 'slime' | 'beast' | 'material' | 'bird' | 'bug' | 'plant' | 'spirit' | 'demon' | 'water' | 'dragon' | 'mystic';

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
  /** なかまに したときだけ 図鑑に のる とくべつな じょうほう */
  lore?: string;
  // ---- v2 の 種族（m001〜m200）だけが もつ じょうほう
  /** 図鑑番号 */
  no?: number;
  element?: ElementId;
  role?: string;
  growthType?: GrowthType;
  /** ランク 1〜5（5 = 伝説級） */
  rank?: number;
  /** true なら resistances が 系統こみの 最終的な 耐性（系統の 耐性を 足さない） */
  resistAbsolute?: boolean;
  /** 通常配合では うまれない（特殊配合・物語でのみ） */
  noBreed?: boolean;
};

export type SkillCategory = 'physical' | 'magic' | 'breath' | 'heal' | 'revive' | 'buff' | 'debuff' | 'status' | 'cure';
export type SkillTarget = 'self' | 'oneAlly' | 'allAllies' | 'oneEnemy' | 'allEnemies' | 'randomEnemies';
export type BuffStat = 'attack' | 'defense' | 'speed' | 'magic' | 'spirit';

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
  /** 吸いとり（与えたダメージの割合だけ じぶんの HP を 回復） */
  drain?: number;
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
  /** rule：v2 の 通常配合（系統 × ランクで きまる。仕様 12.2） */
  kind: 'special' | 'familyCombination' | 'rule' | 'fallback';
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
  | { type: 'arena'; id: string }
  // ---- v2：章の 進行（domain/progression/ChapterEngine）
  | { type: 'stage'; id: string }
  | { type: 'feature'; id: string };

export type EncounterEntry = { speciesId: string; weight: number; minLevel: number; maxLevel: number };
export type EncounterTable = { id: string; entries: EncounterEntry[]; groupSize: { weight: number; value: number }[] };

export type EnemySpec = {
  speciesId: string;
  level: number;
  /** ボス用の補正（HP 倍率など） */
  hpScale?: number;
  statScale?: number;
  /** 能力ごとの 倍率（statScale に かける。かたい ボスの 守備だけ さげる など） */
  statMul?: Partial<Record<'attack' | 'defense' | 'speed' | 'magic' | 'spirit', number>>;
  /** 耐性の 上がき（ボスの 弱点 など） */
  resist?: Resistances;
  skills?: string[];
  name?: string;
  distorted?: boolean;
  recruitable?: boolean;
  /** ボスの 行動台本（src/data/bosses/scripts.ts の ID） */
  script?: string;
};

// ---- ボスの 行動台本（v2 仕様：召喚・反射・ターン強化・形態変化・属性切替）
/** いつ うごくか。turn は ターンの はじめ、hpBelow は ターンの はじめと おわりに しらべる */
export type BossTrigger =
  | { kind: 'start' }
  | { kind: 'turn'; at?: number; every?: number; from?: number }
  | { kind: 'hpBelow'; ratio: number }
  | { kind: 'minionsBelow'; count: number };
export type BossStep =
  | { kind: 'message'; text: string }
  /** 子分を よぶ（場の 敵は max 体まで） */
  | { kind: 'summon'; speciesId: string; level: number; count: number; max: number; name?: string }
  /** はねかえす まく。physicalHits 回 物理で なぐると われる */
  | { kind: 'reflect'; turns: number; categories: SkillCategory[]; physicalHits?: number }
  | { kind: 'buff'; stat: BuffStat; stages: number; target: 'self' | 'team' }
  /** 形態変化 */
  | { kind: 'phase'; name?: string; healRatio?: number; statScale?: number; skills?: string[]; resist?: Resistances; clearStages?: boolean; message?: string }
  /** 属性切替（じゅんばんに。その属性に つよく、弱点に よわくなる） */
  | { kind: 'element'; cycle: ElementId[] }
  /** みかたの 強化を けす */
  | { kind: 'dispel' }
  /** この ターンは この 特技を つかう */
  | { kind: 'useSkill'; skillId: string };
/** inPhase を 書くと その 形態の ときだけ うごく（形態は 0 から） */
export type BossRule = { id: string; when: BossTrigger; once?: boolean; inPhase?: number; steps: BossStep[] };
export type BossScript = { id: string; rules: BossRule[] };

export type BossDefinition = {
  id: string;
  name: string;
  intro: string[];
  enemies: EnemySpec[];
  defeatText: string[];
  /** たおした あとに あかされる じじつ（メインストーリー。ボスごとに あたらしい じょうほうを ひとつ） */
  story?: string[];
  rewards: Reward[];
  setFlags: string[];
};

export type Reward = { type: 'gold'; amount: number } | { type: 'item'; itemId: string; count: number } | { type: 'capacity'; amount: number };

export type FloorDefinition = {
  id: string;
  name: string;
  encounterTableId: string;
  /** 宝箱から出るもの */
  chestTable: { weight: number; value: Reward }[];
  bossId?: string;
  // ---- v2 の ダンジョン（部屋テンプレート型の 生成 RoomGen）
  /** この 階の ギミック（毒の床・水流 など） */
  gimmicks?: ('poison' | 'current' | 'ice' | 'switchGate' | 'wind')[];
  /** しらべると おこる 物語イベント（data/story の ID。行き止まりの 部屋に 置く） */
  storyEvents?: string[];
  /** いやしの いずみを 置くか */
  spring?: boolean;
};

export type AreaDefinition = {
  id: string;
  name: string;
  description: string;
  recommendedLevel: number;
  floors: FloorDefinition[];
  unlockConditions: Condition[];
  theme: 'forest' | 'cave' | 'highland' | 'tower' | 'snow' | 'volcano';
  /** v2：章の ステージ（'1-2' など）。入れるかは 章の 進行で きまる */
  stageId?: string;
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

export type Tactic = 'attack' | 'skill' | 'support' | 'save' | 'nomagic';

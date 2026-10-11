// 数値はすべてここに集約する（プレイテストで調整する前提の初期値）
export const BALANCE = {
  partySize: 3,
  maxSkillSlots: 8,
  storageCapacityStart: 20,
  growth: {
    /** 早熟・晩成の伸び方（t=0→1 で倍率が a→b に変わる） */
    curves: { early: [1.45, 0.55], normal: [1, 1], late: [0.55, 1.45] } as Record<string, [number, number]>,
    /** 1レベルの伸びのばらつき */
    varianceMin: 0.75,
    varianceMax: 1.25,
    /** プラス値1につき伸びが何割増えるか */
    plusGrowthBonus: 0.02,
    /** 経験値テーブル: 必要累計経験値 = expBase * rate * (L-1)^expPow */
    expBase: 4,
    expPow: 2.5,
  },
  breeding: {
    plusLevelBonus: 2,
    /** 親2体の能力の合計にかける割合（子の Lv1 能力に足される） */
    statInheritanceWeight: 0.07,
    /** 親のレベルの合計 levelSumPerPlus ごとにプラス値 +1（上限 maxLevelPlus） */
    levelSumPerPlus: 12,
    maxLevelPlus: 4,
    requireDifferentSex: true,
    /** 配合に必要なレベル */
    minLevel: 10,
    /** 子の耐性は種族の耐性より最大これだけ高くなれる */
    resistInheritMaxBonus: 1,
  },
  battle: {
    attackScale: 0.6,
    defenseScale: 0.3,
    wisdomScale: 0.12,
    healWisdomScale: 0.25,
    damageVarianceMin: 0.88,
    damageVarianceMax: 1.12,
    criticalChance: 1 / 28,
    criticalMultiplier: 1.8,
    defaultEscapeChance: 0.5,
    /** 能力段階 1 あたりの倍率 */
    stageMultiplier: 0.25,
    maxStage: 2,
    /** 素早さに掛ける乱数の幅 */
    speedVarianceMin: 0.8,
    poisonDamageRate: 1 / 10,
    sleepTurns: [2, 4] as [number, number],
    paralysisTurns: [1, 3] as [number, number],
    confusionTurns: [2, 4] as [number, number],
    /** 耐性レベル → ダメージ倍率 */
    elementMultiplier: { '-1': 1.5, '0': 1, '1': 0.6, '2': 0.3, '3': 0 } as Record<string, number>,
    /** 耐性レベル → 状態異常のかかりやすさ */
    statusMultiplier: { '-1': 1.4, '0': 1, '1': 0.55, '2': 0.25, '3': 0 } as Record<string, number>,
    /** 野生値1につき命令を無視する確率 */
    disobeyPerWildness: 0.006,
    maxDisobey: 0.5,
    /** 敵が「いちばん良い行動」ではなく気まぐれに行動する確率 */
    /** 敵の回復: HPがこの割合を下回るまで回復しない／回復の重み／1回使うごとの減衰 */
    enemyHeal: { threshold: 0.35, weight: 0.6, decay: 0.4 },
    /** 同じ戦闘で状態異常にかかるたびに、次にかかる確率に掛ける値 */
    statusRepeatFactor: 0.6,
    /** 敵が同じ補助・状態異常の特技を使うたびに評価に掛ける値 */
    enemyRepeatFactor: 0.6,
    enemyWhim: { wild: 0.35, boss: 0.15, arena: 0.2 } as Record<string, number>,
  },
  /** 野生のモンスターは育てたモンスターより少し弱い */
  wild: { hpScale: 0.85, statScale: 0.95 },
  /** 闘技場の相手（育成途中のトレーナーのモンスター） */
  arena: { hpScale: 0.9, statScale: 0.93 },
  recruitment: {
    minChance: 0,
    maxChance: 0.95,
    /** にくを もらっていない敵の 基礎確率に掛ける値（にくなしでは まず なかまに ならない） */
    noMeatFactor: 0.15,
    /** 敵のレベルがパーティ平均より高いとき 1 レベルごとに下がる確率 */
    levelPenalty: 0.015,
    initialWildness: 60,
    /** 牧場でにくをあげたときに下がる野生値（にくの power * これ） */
    meatWildnessRate: 120,
    wildnessPerBattle: 3,
    wildnessPerLevel: 2,
  },
  dungeon: {
    defeatGoldLossRate: 0.5,
    autosaveAtFloorChange: true,
    encounterMinSteps: 4,
    encounterBase: 0.05,
    encounterRamp: 0.018,
    encounterMax: 0.3,
  },
  reward: {
    /** 経験値 = expYield * level * expScale（これを 生きている みかたで 分ける） */
    expScale: 1.5,
    /** 2体いじょうで 分けるときの おまけ（3体で わけても 1体ぶんより すこし多い） */
    shareBonus: 1.25,
    /** 敵より レベルが 1 高いごとに 経験値が これだけ へる（下限 expMinFactor） */
    expLevelPenalty: 0.12,
    expMinFactor: 0.2,
    /** 敵より レベルが ひくいと すこし ふえる（上限） */
    expMaxFactor: 1.2,
    goldScale: 1,
  },
};
export type BalanceConfig = typeof BALANCE;

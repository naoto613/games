// 章・ステージ・街・機能解放（仕様 5・6・14・15、要確認事項 Q7・Q15）。
// 章は「街（またはダンジョン）→ ダンジョン → ダンジョン（章ボス）」の 3ステージ。ステージは じゅんばんに 進む。
// 街の 施設や 機能は「その 街に 着いたとき」と「章を クリアしたとき」に 解放する（仕様 15：解放直後に 試せる）。

/** 解放される 機能（ゲームの どこで 使えるかを きめる キー） */
export type FeatureId =
  // 第1章（はじめから・リーフェル）
  | 'move' | 'talk' | 'menu' | 'save' | 'partner'
  // 第1章 クリア
  | 'recruit' | 'dex' | 'travelDoor'
  // 第2章（ミズナ・クリア）
  | 'breeding' | 'ranch' | 'ranchExpand' | 'familyCheck' | 'skillInherit'
  // 第3章
  | 'doorWarp' | 'familyDex' | 'resistView' | 'equipment'
  // 第4章
  | 'arena' | 'enhance' | 'quests' | 'training'
  // 第5章
  | 'skillInheritPlus' | 'monsterHistory' | 'trainingGoal' | 'breedingLog' | 'breedHintPlus'
  // 第6章
  | 'highBreeding' | 'resistDetail' | 'hardQuests' | 'enhancePlus'
  // 第7章
  | 'upperArena' | 'equipmentEffects' | 'mutantDex' | 'bossRematch'
  // 第8章
  | 'undersea' | 'rareInfo' | 'habitat' | 'questChain'
  // 第9章
  | 'shadowStudy' | 'specialBreeding' | 'highSkillInherit' | 'hiddenDoorHints'
  // 第10章
  | 'legendBreeding' | 'legendHints' | 'skillResearch' | 'legendArena'
  // 第11章
  | 'finalEquipment' | 'gauntlet' | 'pastBossRematch' | 'finalBreedingHints' | 'finalBreeding'
  // 第12章 クリア
  | 'postgame' | 'hiddenBosses';

export const FEATURE_NAMES: Record<FeatureId, string> = {
  move: 'いどう', talk: 'かいわ', menu: 'メニュー', save: 'セーブ', partner: 'あいぼうの とうろく',
  recruit: 'なかまに する', dex: 'まもの ずかん', travelDoor: 'たびの とびら',
  breeding: 'はいごう', ranch: 'まもの ぼくじょう', ranchExpand: 'ぼくじょうの かくちょう', familyCheck: 'しゅぞく・けいとうの かくにん', skillInherit: 'スキルけいしょう',
  doorWarp: 'とびらの あいだの いどう', familyDex: 'けいとうべつ ずかん', resistView: 'たいせいの ひょうじ', equipment: 'そうび',
  arena: 'とうぎじょう', enhance: 'そうびの きょうか', quests: 'いらいじょ', training: 'くんれんじょう',
  skillInheritPlus: 'スキルけいしょうの かくちょう', monsterHistory: 'こたいの きろく', trainingGoal: 'いくせい もくひょう', breedingLog: 'はいごう りれき', breedHintPlus: 'はいごう ヒントの かくちょう',
  highBreeding: 'こうい はいごう', resistDetail: 'たいせいの くわしい ひょうじ', hardQuests: 'こうなんど いらい', enhancePlus: 'そうびの ついか きょうか',
  upperArena: 'じょうい とうぎじょう', equipmentEffects: 'そうびの とくしゅ こうか', mutantDex: 'へんい まものの ずかん', bossRematch: 'きょうてき さいせん',
  undersea: 'かいてい たんさく', rareInfo: 'きしょう まものの じょうほう', habitat: 'せいそくち ひょうじ', questChain: 'いらいの れんさ',
  shadowStudy: 'かげ ぞくせいの けんきゅう', specialBreeding: 'とくしゅ はいごう', highSkillInherit: 'こうい スキルの けいしょう', hiddenDoorHints: 'かくし とびらの てがかり',
  legendBreeding: 'でんせつ はいごう', legendHints: 'でんせつきゅうの ヒント', skillResearch: 'こうい スキルの けんきゅう', legendArena: 'でんせつ とうぎじょう',
  finalEquipment: 'さいしゅう そうび', gauntlet: 'こうなんどの れんせん', pastBossRematch: 'かこの ボス さいせん', finalBreedingHints: 'さいしゅう はいごうの ヒント', finalBreeding: 'さいしゅう はいごう',
  postgame: 'クリアごの エリア', hiddenBosses: 'かくし ボス',
};

export type TownDefinition = {
  id: string;
  name: string;
  /** 大きな 街（6）か 小さな 拠点（5）（Q7） */
  kind: 'major' | 'hub';
  chapter: number;
  facilities: string[];
  role: string;
};

export const TOWNS: TownDefinition[] = [
  { id: 'liefel', name: 'リーフェル集落', kind: 'major', chapter: 1, role: 'チュートリアルと 冒険の 出発点', facilities: ['主人公の家', '調律師の小屋', '小さな牧場', '集落の広場', '森の入口'] },
  { id: 'mizuna', name: '水辺の街ミズナ', kind: 'major', chapter: 2, role: '育成と 配合の 中心', facilities: ['配合の館', '魔物牧場', '道具屋', '旅の扉の祠', '水路入口'] },
  { id: 'kazeno', name: '風見の村カゼノ', kind: 'major', chapter: 3, role: '探索と 情報収集', facilities: ['風見台', '魔物研究所', '宿屋', '旅の扉', '高原入口'] },
  { id: 'akaris', name: '灯火の街アカリス', kind: 'major', chapter: 4, role: '戦闘と 装備', facilities: ['闘技場', '武具工房', '依頼所', '訓練場', '城門'] },
  { id: 'elm', name: '樹守の村エルム', kind: 'hub', chapter: 5, role: 'スキル継承と 個体の 記録', facilities: ['記憶の樹', '宿屋', '旅の扉'] },
  { id: 'frost', name: '雪灯りの街フロスト', kind: 'major', chapter: 6, role: '高位育成と 耐性研究', facilities: ['氷晶研究所', '装備工房', '高位配合所', '雪山入口'] },
  { id: 'volka', name: '鍛冶の街ボルカ', kind: 'hub', chapter: 7, role: '上位闘技場と 装備の 特殊効果', facilities: ['上位闘技場', '鍛冶場', '旅の扉'] },
  { id: 'shelna', name: '港町シェルナ', kind: 'hub', chapter: 8, role: '海底探索の 拠点', facilities: ['港', '潜水小屋', '旅の扉'] },
  { id: 'noxa', name: '影の街ノクサ', kind: 'hub', chapter: 9, role: '影属性の 研究', facilities: ['影の研究所', '特殊配合所', '旅の扉'] },
  { id: 'astera', name: '天空の街アステラ', kind: 'major', chapter: 10, role: '終盤・伝説配合', facilities: ['天空図書館', '伝説配合所', '伝説闘技場', '原初の記録室', '天空庭園入口'] },
  { id: 'memorygate', name: '記憶の門', kind: 'hub', chapter: 11, role: '最終準備', facilities: ['記憶の祭壇', '再戦の間', '旅の扉'] },
];
export const TOWN_BY_ID: Record<string, TownDefinition> = Object.fromEntries(TOWNS.map((t) => [t.id, t]));

export type StageDefinition = {
  /** '1-1' など */
  id: string;
  name: string;
  kind: 'town' | 'dungeon';
  townId?: string;
  /** ダンジョンの 階数 */
  floors?: number;
  /** 中ボス・章ボス（名前。台本は data/bosses） */
  boss?: string;
  bossKind?: 'mid' | 'chapter' | 'final';
  /** 着いたときに 解放する 機能 */
  unlocks: FeatureId[];
};

export type ChapterDefinition = {
  no: number;
  title: string;
  area: string;
  goal: string;
  boss: string;
  /** 推奨レベル（Q15） */
  level: [number, number];
  stages: StageDefinition[];
  /** 章クリアで 解放する 機能（仕様 15） */
  clearUnlocks: FeatureId[];
};

const town = (id: string, name: string, townId: string, unlocks: FeatureId[]): StageDefinition => ({ id, name, kind: 'town', townId, unlocks });
const dun = (id: string, name: string, floors: number, boss?: string, bossKind?: StageDefinition['bossKind']): StageDefinition =>
  ({ id, name, kind: 'dungeon', floors, boss, bossKind: boss ? bossKind ?? 'mid' : undefined, unlocks: [] });

export const CHAPTERS: ChapterDefinition[] = [
  { no: 1, title: 'はじまりの森', area: 'はじまりの森', goal: '相棒との出会い', boss: 'キノコ王モルグ', level: [1, 10],
    stages: [town('1-1', 'リーフェル集落', 'liefel', ['move', 'talk', 'menu', 'save', 'partner']), dun('1-2', '木漏れ日の小道', 3), dun('1-3', 'ささやきの森', 5, 'キノコ王モルグ', 'chapter')],
    clearUnlocks: ['recruit', 'dex', 'travelDoor'] },
  { no: 2, title: 'しずくの洞窟', area: 'しずくの洞窟', goal: '最初の響晶を探す', boss: '深淵のウロコ王', level: [8, 16],
    stages: [town('2-1', '水辺の街ミズナ', 'mizuna', ['breeding', 'ranch', 'familyCheck']), dun('2-2', '水音の洞穴', 4, '泡守りの騎士'), dun('2-3', '深淵の水路', 6, '深淵のウロコ王', 'chapter')],
    clearUnlocks: ['ranchExpand', 'skillInherit'] },
  { no: 3, title: '風鳴り高原', area: '風鳴り高原', goal: '風の異常を解決する', boss: '風喰いグリフォン', level: [14, 22],
    stages: [town('3-1', '風見の村カゼノ', 'kazeno', ['doorWarp', 'familyDex', 'resistView', 'equipment']), dun('3-2', '風渡りの峡谷', 5, '風見の番人'), dun('3-3', '逆風の塔', 7, '風喰いグリフォン', 'chapter')],
    clearUnlocks: [] },
  { no: 4, title: '灯火の街道', area: '灯火の街道', goal: '人間と魔物の対立を解く', boss: '灰冠の騎士', level: [20, 28],
    stages: [town('4-1', '灯火の街アカリス', 'akaris', ['arena', 'enhance', 'quests', 'training']), dun('4-2', '古戦場の道', 5, '古戦場の守護兵'), dun('4-3', '灰冠城', 7, '灰冠の騎士', 'chapter')],
    clearUnlocks: [] },
  { no: 5, title: '古樹の聖域', area: '古樹の聖域', goal: '記憶の樹を救う', boss: '樹海母神エルダ', level: [26, 34],
    stages: [town('5-1', '樹守の村エルム', 'elm', ['skillInheritPlus', 'monsterHistory', 'trainingGoal', 'breedingLog']), dun('5-2', '根の迷宮', 6, '根喰いムカデ'), dun('5-3', '古樹の心臓部', 8, '樹海母神エルダ', 'chapter')],
    clearUnlocks: ['breedHintPlus'] },
  { no: 6, title: '凍星の山脈', area: '凍星の山脈', goal: '過去の大災厄を知る', boss: '氷鏡竜ミラージュ', level: [32, 40],
    stages: [town('6-1', '雪灯りの街フロスト', 'frost', ['highBreeding', 'resistDetail', 'hardQuests', 'enhancePlus']), dun('6-2', '氷晶の洞窟', 6, '氷結の番人'), dun('6-3', '凍星の神殿', 8, '氷鏡竜ミラージュ', 'chapter')],
    clearUnlocks: [] },
  { no: 7, title: '灼熱の火山', area: '灼熱の火山', goal: '歪みの発生源を追う', boss: '紅蓮帝ヴォルガ', level: [38, 46],
    stages: [town('7-1', '鍛冶の街ボルカ', 'volka', ['upperArena', 'equipmentEffects', 'mutantDex', 'bossRematch']), dun('7-2', '熔岩回廊', 6, '熔岩巨人'), dun('7-3', '紅蓮炉心', 9, '紅蓮帝ヴォルガ', 'chapter')],
    clearUnlocks: [] },
  { no: 8, title: '沈没都市アトラ', area: '沈没都市アトラ', goal: '古代文明の真実を知る', boss: '深海司祭ネレウス', level: [44, 52],
    stages: [town('8-1', '港町シェルナ', 'shelna', ['undersea', 'rareInfo', 'habitat', 'questChain']), dun('8-2', '沈没水路', 7, '海底の門番'), dun('8-3', '記憶の水殿', 9, '深海司祭ネレウス', 'chapter')],
    clearUnlocks: [] },
  { no: 9, title: '影渡りの国', area: '影渡りの国', goal: 'ノクティルの思想を知る', boss: '影王ゼルヴァ', level: [50, 57],
    stages: [town('9-1', '影の街ノクサ', 'noxa', ['shadowStudy', 'specialBreeding', 'highSkillInherit', 'hiddenDoorHints']), dun('9-2', '影写しの森', 7, '影写しの番人'), dun('9-3', '忘却の城', 10, '影王ゼルヴァ', 'chapter')],
    clearUnlocks: [] },
  { no: 10, title: '天空庭園', area: '天空庭園', goal: '原初の光の記録を集める', boss: '天穹獣アストラ', level: [55, 61],
    stages: [town('10-1', '天空の街アステラ', 'astera', ['legendBreeding', 'legendHints', 'skillResearch', 'legendArena']), dun('10-2', '雲上回廊', 8, '天門の守護獣'), dun('10-3', '星見の庭園', 10, '天穹獣アストラ', 'chapter')],
    clearUnlocks: [] },
  { no: 11, title: '虚無の回廊', area: '虚無の回廊', goal: 'ノクティルの過去を知る', boss: '虚無の守護者', level: [59, 64],
    stages: [town('11-1', '記憶の門', 'memorygate', ['finalEquipment', 'gauntlet', 'pastBossRematch', 'finalBreedingHints']), dun('11-2', '虚無の迷宮', 10, '記憶喰らい'), dun('11-3', '静寂の回廊', 12, '虚無の守護者', 'chapter')],
    clearUnlocks: ['finalBreeding'] },
  { no: 12, title: '原初の神殿', area: '原初の神殿', goal: '世界の未来を決める', boss: '虚無の王ノクティル', level: [62, 68],
    stages: [dun('12-1', '原初の門', 5, '原初の門番'), dun('12-2', '光と影の神殿', 8, '光影の双獣'), dun('12-3', '原初の玉座', 3, '虚無の王ノクティル', 'final')],
    clearUnlocks: ['postgame', 'hiddenBosses'] },
];

/** クリア後の ダンジョン（仕様 7） */
export const POSTGAME_DUNGEONS: StageDefinition[] = [
  dun('pg-1', '月影の塔', 12), dun('pg-2', '忘れられた大地', 15), dun('pg-3', '原初の庭', 10),
];

export const CHAPTER_BY_NO: Record<number, ChapterDefinition> = Object.fromEntries(CHAPTERS.map((c) => [c.no, c]));
export const STAGE_BY_ID: Record<string, StageDefinition & { chapter: number; index: number }> = Object.fromEntries(
  CHAPTERS.flatMap((c) => c.stages.map((s, index) => [s.id, { ...s, chapter: c.no, index }])),
);
/** 章を すべて おえる までに 解放される 機能 */
export const ALL_STORY_FEATURES: FeatureId[] = [...new Set(CHAPTERS.flatMap((c) => [...c.stages.flatMap((s) => s.unlocks), ...c.clearUnlocks]))];

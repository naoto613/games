// クエスト定義（データだけで追加できる）
import type { QuestDef } from '../../systems/QuestSystem';

export const QUESTS: QuestDef[] = [
  {
    id: 'lunch_heist', title: 'おひるごはん だいさくせん', autoStart: true,
    description: 'ピクニックの かぞくの バスケットに、おいしそうな ごはんが はいっている。みつからないように いただこう！',
    prerequisites: [],
    objectives: [
      { text: 'ピクニックテーブルの バスケットから たべものを とる', trigger: { event: 'item:obtained', match: { source: 'basket' } }, target: 'basket' },
      { text: 'とった ごはんを たべる（もちもの → たべる）', trigger: { event: 'item:used', match: { action: 'eat' } } },
    ],
    effects: [{ setFlag: 'heist_done' }],
    rewards: [{ money: 5 }, { achievement: 'first_heist' }],
    followUpEventIds: ['disguise'],
  },
  {
    id: 'disguise', title: 'へんそう だいさくせん', autoStart: true,
    description: 'にんげんに まぎれれば、ばいてんで かいものも できるかも。テントの そばの せんたくものに キャンパーふくが ほしてある。',
    prerequisites: [{ questCompleted: 'lunch_heist' }],
    objectives: [
      { text: 'せんたくひもの キャンパーふくを てにいれる', trigger: { have: 'camper_outfit' }, target: 'laundry' },
      { text: 'キャンパーふくを きる（もちもの → きる）', trigger: { event: 'outfit:changed', match: { outfitId: 'camper_outfit' } } },
    ],
    effects: [{ setFlag: 'can_shop' }],
    rewards: [{ money: 10 }, { achievement: 'disguised' }],
    followUpEventIds: ['first_shopping', 'trash_job'],
  },
  {
    id: 'first_shopping', title: 'はじめての おかいもの', autoStart: true,
    description: 'へんそうして ばいてんの モモさんに はなしかけ、なにか かってみよう。おかねは あつめた ものを うっても かせげる。',
    prerequisites: [{ questCompleted: 'disguise' }],
    objectives: [
      { text: 'ばいてんで なにかを かう', trigger: { event: 'shop:bought' }, target: 'shop' },
    ],
    effects: [],
    rewards: [{ achievement: 'shopper' }],
    followUpEventIds: ['campfire_treat'],
  },
  {
    id: 'trash_job', title: 'ゴミひろいの アルバイト', giver: 'ranger',
    description: 'レンジャーの ガンさんに たのまれた。キャンプじょうに おちている ゴミを 5こ ひろって とどけよう。',
    prerequisites: [{ questCompleted: 'disguise' }], repeatable: true,
    objectives: [
      { text: 'ゴミを 5こ ひろう', trigger: { have: 'litter', count: 5 }, target: 'litter' },
      { text: 'レンジャーの ガンさんに ゴミを わたす', trigger: { event: 'item:given', match: { itemId: 'litter', npcId: 'ranger' } }, target: 'npc:ranger' },
    ],
    effects: [{ removeItem: 'litter', count: 5 }],
    rewards: [{ money: 30 }, { achievement: 'worker' }],
    followUpEventIds: [],
  },
  {
    id: 'lost_teddy', title: 'まいごの くまちゃん', giver: 'kid',
    description: 'ソラちゃんの だいじな くまの ぬいぐるみが なくなった。みずうみの ほうに とんでいった らしい。',
    prerequisites: [],
    objectives: [
      { text: 'くまの ぬいぐるみを さがす（みずうみの しま…？）', trigger: { have: 'teddy_bear' }, target: 'teddy' },
      { text: 'ソラちゃんに ぬいぐるみを かえす', trigger: { event: 'item:given', match: { itemId: 'teddy_bear', npcId: 'kid' } }, target: 'npc:kid' },
    ],
    effects: [{ setFlag: 'teddy_returned' }],
    rewards: [{ money: 20 }, { item: 'cookie', count: 3 }, { achievement: 'kind_heart' }],
    followUpEventIds: [],
  },
  {
    id: 'fisher_pupil', title: 'つりびとの でし', giver: 'fisher',
    description: 'つりびとの ジロウさんに つりを おしえてもらった。さんばしの さきで さかなを つって みせよう。つりざおは ばいてんで うっている。',
    prerequisites: [],
    objectives: [
      { text: 'つりざおを てにいれる', trigger: { have: 'fishing_rod' }, target: 'shop' },
      { text: 'さんばしの さきで さかなを つる', trigger: { event: 'fish:caught' }, target: 'fishspot' },
      { text: 'ジロウさんに さかなを みせる', trigger: { event: 'item:given', match: { npcId: 'fisher' } }, target: 'npc:fisher' },
    ],
    effects: [],
    rewards: [{ money: 15 }, { item: 'straw_hat' }, { achievement: 'angler' }],
    followUpEventIds: [],
  },
  {
    id: 'campfire_treat', title: 'たきびの ごちそう', autoStart: true,
    description: 'キャンプと いえば やきマシュマロ！ マシュマロを もって たきびを しらべよう。',
    prerequisites: [{ questCompleted: 'first_shopping' }],
    objectives: [
      { text: 'マシュマロを てにいれる', trigger: { have: 'marshmallow' }, target: 'shop' },
      { text: 'たきびで マシュマロを やく', trigger: { event: 'item:cooked', match: { to: 'roasted_marshmallow' } }, target: 'campfire' },
    ],
    effects: [],
    rewards: [{ money: 10 }, { achievement: 'gourmet' }],
    followUpEventIds: [],
  },
  {
    id: 'treasure', title: 'もりの おたから',
    description: 'たからのちずの ×じるしを ほりおこそう。',
    prerequisites: [{ hasItem: 'treasure_map' }], autoStart: true,
    objectives: [
      { text: 'ちずの ×じるしを ほる（ほくとうの もり）', trigger: { have: 'golden_acorn' }, target: 'treasure' },
    ],
    effects: [],
    rewards: [{ money: 100 }, { achievement: 'treasure_hunter' }],
    followUpEventIds: [],
  },
  {
    id: 'shiny_collector', title: 'きらきら コレクター', autoStart: true,
    description: 'キャンプじょうの あちこちに きらきら ひかる いしが おちている。5こ あつめよう。',
    prerequisites: [{ hasItem: 'shiny_stone' }],
    objectives: [
      { text: 'きらきらいしを 5こ あつめる', trigger: { have: 'shiny_stone', count: 5 } },
    ],
    effects: [],
    rewards: [{ money: 40 }, { achievement: 'collector' }],
    followUpEventIds: [],
  },
  {
    id: 'ranger_hat_heist', title: 'レンジャーごやの ぼうし', autoStart: true,
    description: 'レンジャーごやの なかに ぼうしが かけてある。ガンさんが パトロールに でかけている すきに…。',
    prerequisites: [{ questCompleted: 'disguise' }],
    objectives: [
      { text: 'レンジャーごやで レンジャーぼうしを てにいれる', trigger: { have: 'ranger_hat' }, target: 'rangerhat' },
    ],
    effects: [],
    rewards: [{ achievement: 'master_thief' }],
    followUpEventIds: [],
  },
];

export const ACHIEVEMENTS: Record<string, { name: string; desc: string }> = {
  first_heist: { name: 'はじめての いたずら', desc: 'バスケットの ごはんを いただいた' },
  perfect_heist: { name: 'かんぺきな しのびあし', desc: 'だれにも みつからずに ごはんを とった' },
  disguised: { name: 'へんそうの たつじん', desc: 'キャンパーふくで にんげんに まぎれた' },
  shopper: { name: 'おかいもの デビュー', desc: 'ばいてんで かいものを した' },
  worker: { name: 'はたらきもの', desc: 'ゴミひろいの アルバイトを した' },
  kind_heart: { name: 'やさしい こころ', desc: 'ぬいぐるみを もちぬしに かえした' },
  angler: { name: 'つりびと', desc: 'みずうみで さかなを つった' },
  gourmet: { name: 'キャンプの グルメ', desc: 'たきびで マシュマロを やいた' },
  treasure_hunter: { name: 'たからさがし', desc: 'もりの おたからを みつけた' },
  collector: { name: 'コレクター', desc: 'きらきらいしを 5こ あつめた' },
  master_thief: { name: 'おおどろぼう', desc: 'レンジャーの ぼうしを いただいた' },
  escape_artist: { name: 'にげあしの たつじん', desc: 'おいかけてきた ひとから にげきった' },
  caught: { name: 'つかまっちゃった', desc: 'レンジャーに つかまった…' },
  boater: { name: 'ボートこぎ', desc: 'ボートで みずうみに でた' },
  home_sweet_home: { name: 'すてきな おうち', desc: 'おうちを かざった' },
};

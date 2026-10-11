// v2 で ふやした 特技（仕様 3：通常スキル 100種類以上）。v1 の 特技（src/data/skills.ts）と あわせて つかう。
// 水・影の 系統、魔力・精神の 強化と 弱体、吸いとり、こうげきの ついでの 状態異常 など。名前・効果は すべて オリジナル。
import type { SkillDefinition } from '../types';

type Sk = SkillDefinition;
const P = (id: string, name: string, power: number, mpCost: number, o: Partial<Sk>, description: string): Sk =>
  ({ id, name, category: 'physical', target: 'oneEnemy', mpCost, power, hitRate: 0.95, priority: 0, ...o, description });
const M = (id: string, name: string, power: number, mpCost: number, o: Partial<Sk>, description: string): Sk =>
  ({ id, name, category: 'magic', target: 'oneEnemy', mpCost, power, hitRate: 1, priority: 0, ...o, description });
const BR = (id: string, name: string, power: number, mpCost: number, o: Partial<Sk>, description: string): Sk =>
  ({ id, name, category: 'breath', target: 'allEnemies', mpCost, power, hitRate: 1, priority: 0, ...o, description });
const X = (id: string, name: string, category: Sk['category'], target: Sk['target'], mpCost: number, power: number, o: Partial<Sk>, description: string): Sk =>
  ({ id, name, category, target, mpCost, power, hitRate: 1, priority: 0, ...o, description });

export const V2_SKILLS: SkillDefinition[] = [
  // ---- 水（回復・防御・制御）
  M('splash', 'みずでっぽう', 11, 2, { elementId: 'water', upgrade: { to: 'aquaburst', level: 13, stat: { magic: 42 } } }, 'いきおいの ある みずを ぶつける。'),
  M('aquaburst', 'アクアバースト', 34, 5, { elementId: 'water' }, 'うずまく みずの かたまりを ばくはつさせる。'),
  M('wave', 'なみのり', 10, 5, { elementId: 'water', target: 'allEnemies', upgrade: { to: 'tidalwave', level: 18, stat: { magic: 60 } } }, 'なみを よんで てき ぜんたいを おしながす。'),
  M('tidalwave', 'おおつなみ', 26, 13, { elementId: 'water', target: 'allEnemies' }, 'おおきな つなみが てき ぜんたいを のみこむ。'),
  BR('bubblebreath', 'あわのいぶき', 13, 6, { elementId: 'water', statusEffectId: 'sleep', statusChance: 0.1 }, 'ねむけを さそう あわを はく。'),
  P('aquafang', 'みずのキバ', 1.4, 3, { elementId: 'water' }, 'みずを まとった キバで かみつく。'),
  P('aquatail', 'アクアテール', 1.6, 4, { elementId: 'water', hitRate: 0.85 }, 'みずを まとった しっぽを たたきつける。'),
  X('aquaheal', 'みずのいやし', 'heal', 'oneAlly', 3, 30, { upgrade: { to: 'springheal', level: 15, stat: { spirit: 45 } } }, 'きよらかな みずで みかた ひとりを いやす。'),
  X('springheal', 'わきみずのいやし', 'heal', 'allAllies', 9, 34, {}, 'わきみずが みかた ぜんいんを いやす。'),
  X('mistveil', 'きりのベール', 'buff', 'allAllies', 4, 0, { buff: { stat: 'spirit', stages: 1 } }, 'きりの まくで みかた ぜんいんの せいしんを あげる。'),
  // ---- 影（弱体化・吸収）
  M('shadowbolt', 'シャドウボルト', 12, 2, { elementId: 'shadow', upgrade: { to: 'nightmare', level: 14, stat: { magic: 48 } } }, 'かげの やを はなつ。'),
  M('nightmare', 'ナイトメア', 36, 6, { elementId: 'shadow', statusEffectId: 'confusion', statusChance: 0.15 }, 'わるい ゆめで あいてを くるしめる。こんらんさせる ことも ある。'),
  M('souldrain', 'ソウルドレイン', 16, 4, { elementId: 'shadow', drain: 0.5 }, 'あいての いのちを すいとる。'),
  P('drainbite', 'ドレインバイト', 1.2, 3, { elementId: 'shadow', drain: 0.4 }, 'かみついて いのちを すいとる。'),
  P('shadowclaw', 'かげのツメ', 1.4, 3, { elementId: 'shadow' }, 'かげを まとった ツメで ひっかく。'),
  X('curse', 'のろい', 'debuff', 'oneEnemy', 3, 0, { hitRate: 0.9, buff: { stat: 'spirit', stages: -2 } }, 'のろいで てき ひとりの せいしんを おおきく さげる。'),
  X('darkmist', 'やみのきり', 'debuff', 'allEnemies', 5, 0, { hitRate: 0.85, buff: { stat: 'magic', stages: -1 } }, 'やみの きりで てき ぜんたいの まりょくを さげる。'),
  M('abyss', 'アビスゲート', 28, 14, { elementId: 'shadow', target: 'allEnemies' }, 'しんえんの とびらを ひらき てき ぜんたいを のみこむ。'),
  // ---- 火（高火力・継続）
  M('heatwave', 'ねっぷう', 12, 6, { elementId: 'fire', target: 'allEnemies', upgrade: { to: 'megaflare', level: 20, stat: { magic: 70 } } }, 'あつい かぜで てき ぜんたいを つつむ。'),
  P('flamedrive', 'フレアドライブ', 1.9, 4, { elementId: 'fire', hitRate: 0.9, recoil: 0.25 }, 'ほのおを まとって とっしんする。じぶんも すこし ダメージ。'),
  P('flameclaw', 'ほのおのツメ', 1.35, 3, { elementId: 'fire' }, 'もえる ツメで きりさく。'),
  BR('scorch', 'しゃくねつのいき', 28, 12, { elementId: 'fire' }, 'しゃくねつの いきで てき ぜんたいを やきつくす。'),
  // ---- 風（素早さ・回避）
  P('aircutter', 'エアカッター', 0.6, 3, { elementId: 'wind', target: 'randomEnemies', hits: 3, hitRate: 0.9 }, 'かぜの やいばを 3かい とばす。'),
  P('galeslash', 'かまいたち', 1.1, 3, { elementId: 'wind', priority: 1, hitRate: 1 }, 'だれよりも はやく かぜで きりつける。'),
  BR('cyclone', 'サイクロン', 26, 12, { elementId: 'wind' }, 'おおきな うずまきで てき ぜんたいを まきあげる。'),
  X('tailwind', 'おいかぜ', 'buff', 'allAllies', 4, 0, { priority: 1, buff: { stat: 'speed', stages: 1 } }, 'せなかから かぜを ふかせ みかたを はやくする。'),
  // ---- 地（防御・崩し）
  P('rocksmash', 'いわくだき', 1.5, 3, { elementId: 'earth', hitRate: 0.9 }, 'いわをも くだく いちげき。'),
  M('quake', 'じしん', 18, 9, { elementId: 'earth', target: 'allEnemies' }, 'じめんを ゆらして てき ぜんたいを うつ。'),
  M('earthspike', 'だいちのとげ', 14, 3, { elementId: 'earth', upgrade: { to: 'terraburst', level: 16, stat: { magic: 52 } } }, 'じめんから とげを つきだす。'),
  M('terraburst', 'テラバースト', 38, 7, { elementId: 'earth' }, 'だいちの ちからを いっきに ばくはつさせる。'),
  X('stoneskin', 'いわのよろい', 'buff', 'self', 3, 0, { priority: 1, buff: { stat: 'defense', stages: 1 } }, 'いわを まとって しゅびりょくを あげる。'),
  X('crumble', 'じばんくずし', 'debuff', 'allEnemies', 4, 0, { hitRate: 0.85, buff: { stat: 'defense', stages: -1 } }, 'あしもとを くずして てき ぜんたいの しゅびりょくを さげる。'),
  // ---- 雷（麻痺・高速）
  M('thunderbolt', 'らいげき', 36, 6, { elementId: 'thunder', statusEffectId: 'paralysis', statusChance: 0.1 }, 'つよい いなずまを おとす。まひさせる ことも ある。'),
  X('thunderwave', 'でんじは', 'status', 'allEnemies', 5, 0, { statusEffectId: 'paralysis', statusChance: 0.35 }, 'でんきの なみで てき ぜんたいを まひさせる ことが ある。'),
  P('voltclaw', 'いなずまのツメ', 1.3, 3, { elementId: 'thunder', priority: 1 }, 'いなずまの はやさで ひっかく。'),
  BR('stormbreath', 'らいうんのいき', 15, 7, { elementId: 'thunder' }, 'かみなりぐもの いきを はく。'),
  // ---- 氷（減速・防御低下）
  P('frostclaw', 'こおりのツメ', 1.35, 3, { elementId: 'ice' }, 'こおりついた ツメで ひっかく。'),
  X('chillwind', 'つめたいかぜ', 'debuff', 'allEnemies', 4, 0, { hitRate: 0.85, buff: { stat: 'speed', stages: -1 } }, 'つめたい かぜで てき ぜんたいの すばやさを さげる。'),
  M('frostspear', 'ひょうそう', 36, 6, { elementId: 'ice' }, 'こおりの やりで つらぬく。'),
  X('iceshield', 'ひょうへき', 'buff', 'allAllies', 6, 0, { buff: { stat: 'defense', stages: 1 } }, 'こおりの かべで みかた ぜんいんを まもる。'),
  // ---- 光（回復・対影）
  M('holylight', 'ホーリーライト', 36, 6, { elementId: 'light' }, 'せいなる ひかりで てき ひとりを うつ。'),
  X('prayer', 'せいなるいのり', 'heal', 'allAllies', 16, 70, {}, 'いのりの ひかりが みかた ぜんいんを おおきく いやす。'),
  X('purify', 'きよめのひかり', 'cure', 'allAllies', 5, 0, {}, 'みかた ぜんいんの じょうたいいじょうを なおす。'),
  X('lightshield', 'ひかりのたて', 'buff', 'allAllies', 5, 0, { buff: { stat: 'spirit', stages: 1 } }, 'ひかりの たてで みかた ぜんいんの せいしんを あげる。'),
  P('lightfang', 'ひかりのキバ', 1.4, 3, { elementId: 'light' }, 'ひかりを まとった キバで かみつく。'),
  // ---- 強化・弱体（魔力・精神）
  X('focusmind', 'めいそう', 'buff', 'self', 3, 0, { buff: { stat: 'magic', stages: 2 } }, 'こころを しずめ じぶんの まりょくを おおきく あげる。'),
  X('calmmind', 'せいしんとういつ', 'buff', 'self', 3, 0, { buff: { stat: 'spirit', stages: 2 } }, 'じぶんの せいしんを おおきく あげる。'),
  X('warcry', 'おたけび', 'buff', 'allAllies', 5, 0, { buff: { stat: 'attack', stages: 1 } }, 'みかた ぜんいんの こうげきりょくを あげる。'),
  X('magicup', 'マジックアップ', 'buff', 'allAllies', 6, 0, { buff: { stat: 'magic', stages: 1 } }, 'みかた ぜんいんの まりょくを あげる。'),
  X('ironwall', 'てっぺき', 'buff', 'allAllies', 8, 0, { buff: { stat: 'defense', stages: 2 } }, 'みかた ぜんいんの しゅびりょくを おおきく あげる。'),
  X('mindbreak', 'マインドブレイク', 'debuff', 'oneEnemy', 3, 0, { hitRate: 0.9, buff: { stat: 'magic', stages: -2 } }, 'てき ひとりの まりょくを おおきく さげる。'),
  X('roar', 'いかく', 'debuff', 'allEnemies', 4, 0, { hitRate: 0.85, buff: { stat: 'attack', stages: -1 } }, 'てき ぜんたいの こうげきりょくを さげる。'),
  X('armorbreak', 'よろいくだき', 'debuff', 'oneEnemy', 3, 0, { hitRate: 0.9, buff: { stat: 'defense', stages: -2 } }, 'てき ひとりの しゅびりょくを おおきく さげる。'),
  // ---- 物理（属性なし）
  P('headbutt', 'ずつき', 1.5, 2, { hitRate: 0.85 }, 'あたまから ぶつかる。'),
  P('vinewhip', 'つるのムチ', 0.65, 3, { target: 'randomEnemies', hits: 2, hitRate: 0.95 }, 'つるを ふりまわして 2かい たたく。'),
  P('poisonsting', 'どくばり', 1.0, 2, { statusEffectId: 'poison', statusChance: 0.4 }, 'どくの はりで さす。どくに する ことが ある。'),
  P('stunclaw', 'しびれづめ', 1.0, 3, { statusEffectId: 'paralysis', statusChance: 0.25 }, 'しびれる ツメで ひっかく。'),
  P('rampage', 'あばれまわる', 0.9, 5, { target: 'allEnemies', hitRate: 0.9 }, 'あばれて てき ぜんたいを こうげき。'),
  P('megahorn', 'メガホーン', 2.0, 5, { hitRate: 0.8 }, 'おおきな ツノで つきあげる。'),
  P('shellbash', 'こうらアタック', 1.3, 2, { hitRate: 0.95 }, 'かたい こうらで ぶつかる。'),
  // ---- 回復・蘇生・状態異常
  X('healbreeze', 'いやしのかぜ', 'heal', 'allAllies', 6, 22, {}, 'やさしい かぜが みかた ぜんいんを いやす。'),
  X('fullcare', 'フルケア', 'heal', 'oneAlly', 10, 160, {}, 'みかた ひとりの HPを とても おおきく かいふく。'),
  X('rebirth', 'リバース', 'revive', 'oneAlly', 22, 100, { noInherit: true }, 'たおれた みかたを HP まんたんで いきかえらせる。'),
  X('sleepsong', 'ねむりのうた', 'status', 'oneEnemy', 3, 0, { statusEffectId: 'sleep', statusChance: 0.65 }, 'てき ひとりを ねむらせる ことが ある。'),
  X('toxic', 'もうどく', 'status', 'oneEnemy', 3, 0, { statusEffectId: 'poison', statusChance: 0.85 }, 'つよい どくで てき ひとりを どくに する。'),
  X('illusion', 'げんわく', 'status', 'allEnemies', 6, 0, { statusEffectId: 'confusion', statusChance: 0.35 }, 'まぼろしで てき ぜんたいを こんらんさせる ことが ある。'),
  // ---- 伝説級・ボスの 固有特技（受け継げない）
  X('eternallight', 'えいえんのひかり', 'heal', 'allAllies', 18, 110, { noInherit: true }, 'えいえんの ひかりが みかた ぜんいんを つつみ いやす。'),
  M('starfall', 'スターフォール', 42, 18, { elementId: 'light', target: 'allEnemies', noInherit: true }, 'ほしの ひかりが てき ぜんたいに ふりそそぐ。'),
  M('voidnova', 'ヴォイドノヴァ', 42, 18, { elementId: 'shadow', target: 'allEnemies', noInherit: true }, 'むの ひかりが すべてを のみこむ。'),
  BR('primalroar', 'げんしょのほうこう', 34, 16, { noInherit: true }, 'げんしょの ちからを こめた ほうこう。'),
  M('tsunamicrown', 'うしおのかんむり', 40, 16, { elementId: 'water', target: 'allEnemies', noInherit: true }, 'うみの おうの ちからで おおなみを おこす。'),
  BR('infernoroar', 'ぐれんのほうこう', 38, 16, { elementId: 'fire', noInherit: true }, 'ぐれんの ほのおを まとった ほうこう。'),
];

import type { SkillDefinition } from './types';

// 特技マスタ。名前・効果はすべてオリジナル。
const list: SkillDefinition[] = [
  // ---- 物理
  { id: 'bite', name: 'かみつき', category: 'physical', target: 'oneEnemy', mpCost: 2, power: 1.35, hitRate: 0.95, priority: 0, description: 'するどい きばで かみつく。ふつうの こうげきより つよい。' },
  { id: 'peck', name: 'れんぞくつつき', category: 'physical', target: 'randomEnemies', hits: 3, mpCost: 3, power: 0.6, hitRate: 0.9, priority: 0, description: 'ランダムな てきを 3かい つつく。' },
  { id: 'tackle', name: 'たいあたり', category: 'physical', target: 'oneEnemy', mpCost: 0, power: 1.7, hitRate: 0.85, priority: 0, recoil: 0.25, description: 'からだごと ぶつかる。じぶんも すこし ダメージを うける。' },
  { id: 'sweep', name: 'なぎはらい', category: 'physical', target: 'allEnemies', mpCost: 4, power: 0.7, hitRate: 0.9, priority: 0, description: 'てき ぜんたいを なぎはらう。' },
  { id: 'triplebite', name: 'みつまたがみ', category: 'physical', target: 'oneEnemy', hits: 3, mpCost: 6, power: 0.75, hitRate: 0.9, priority: 0, description: '3つの くちで つづけて かみつく。' },
  { id: 'quickstrike', name: 'はやてづき', category: 'physical', target: 'oneEnemy', mpCost: 2, power: 0.9, hitRate: 1, priority: 1, description: 'だれよりも はやく こうげきする。' },
  // ---- 呪文（賢さで威力が伸びる）
  { id: 'ember', name: 'ひのこ', category: 'magic', target: 'oneEnemy', elementId: 'fire', mpCost: 2, power: 11, hitRate: 1, priority: 0, upgrade: { to: 'fireball', level: 12, stat: { wisdom: 40 } }, description: 'ちいさな ほのおを とばす。' },
  { id: 'fireball', name: 'かえんだま', category: 'magic', target: 'oneEnemy', elementId: 'fire', mpCost: 5, power: 34, hitRate: 1, priority: 0, description: 'おおきな ほのおの たまを ぶつける。' },
  { id: 'icicle', name: 'つららおとし', category: 'magic', target: 'oneEnemy', elementId: 'ice', mpCost: 3, power: 14, hitRate: 1, priority: 0, upgrade: { to: 'blizzard', level: 14, stat: { wisdom: 50 } }, description: 'つららを おとして ひとりを こうげき。' },
  { id: 'blizzard', name: 'ふぶき', category: 'magic', target: 'allEnemies', elementId: 'ice', mpCost: 10, power: 15, hitRate: 1, priority: 0, description: 'こおりの あらしが てき ぜんたいを おそう。' },
  { id: 'gust', name: 'かぜきり', category: 'magic', target: 'oneEnemy', elementId: 'wind', mpCost: 2, power: 10, hitRate: 1, priority: 0, upgrade: { to: 'tornado', level: 13, stat: { wisdom: 42 } }, description: 'かぜの やいばで きりさく。' },
  { id: 'tornado', name: 'たつまき', category: 'magic', target: 'allEnemies', elementId: 'wind', mpCost: 9, power: 14, hitRate: 1, priority: 0, description: 'たつまきで てき ぜんたいを まきこむ。' },
  { id: 'glimmer', name: 'ひかりのつぶ', category: 'magic', target: 'oneEnemy', elementId: 'light', mpCost: 3, power: 13, hitRate: 1, priority: 0, upgrade: { to: 'lightrain', level: 15, stat: { wisdom: 60 } }, description: 'ひかりの つぶを はなつ。' },
  { id: 'lightrain', name: 'ひかりのあめ', category: 'magic', target: 'allEnemies', elementId: 'light', mpCost: 12, power: 18, hitRate: 1, priority: 0, description: 'ひかりの あめを ふらせ てき ぜんたいを うつ。' },
  { id: 'pebbles', name: 'いしつぶて', category: 'magic', target: 'allEnemies', elementId: 'earth', mpCost: 3, power: 5, hitRate: 1, priority: 0, upgrade: { to: 'rockfall', level: 14, stat: { attack: 45 } }, description: 'こいしを ばらまき てき ぜんたいに あてる。' },
  { id: 'rockfall', name: 'がんせきおとし', category: 'magic', target: 'allEnemies', elementId: 'earth', mpCost: 10, power: 15, hitRate: 1, priority: 0, description: 'おおいわを おとして てき ぜんたいを つぶす。' },
  { id: 'judgement', name: 'ひかりのさばき', category: 'magic', target: 'allEnemies', elementId: 'light', mpCost: 18, power: 40, hitRate: 1, priority: 0, noInherit: true, description: 'でんせつの ひかりが すべてを うつ。' },
  // ---- 息（賢さに関係なく一定）
  { id: 'flamebreath', name: 'ほのおのいき', category: 'breath', target: 'allEnemies', elementId: 'fire', mpCost: 7, power: 14, hitRate: 1, priority: 0, description: 'ほのおを はいて てき ぜんたいを やく。' },
  { id: 'crystalbreath', name: 'すいしょうのいき', category: 'breath', target: 'allEnemies', elementId: 'light', mpCost: 12, power: 26, hitRate: 1, priority: 0, description: 'きらめく すいしょうの いきを はく。' },
  // ---- 回復
  { id: 'heal', name: 'いやしのしずく', category: 'heal', target: 'oneAlly', mpCost: 3, power: 26, hitRate: 1, priority: 0, upgrade: { to: 'healmore', level: 12, stat: { wisdom: 40 } }, description: 'みかた ひとりの HPを かいふく。' },
  { id: 'healmore', name: 'いやしのいずみ', category: 'heal', target: 'oneAlly', mpCost: 6, power: 75, hitRate: 1, priority: 0, description: 'みかた ひとりの HPを おおきく かいふく。' },
  { id: 'healall', name: 'めぐみのあめ', category: 'heal', target: 'allAllies', mpCost: 10, power: 36, hitRate: 1, priority: 0, description: 'みかた ぜんいんの HPを かいふく。' },
  { id: 'revive', name: 'よみがえりのうた', category: 'revive', target: 'oneAlly', mpCost: 15, power: 50, hitRate: 1, priority: 0, description: 'たおれた みかたを HP はんぶんで いきかえらせる。' },
  { id: 'antidote', name: 'げどくのは', category: 'cure', target: 'oneAlly', mpCost: 2, power: 0, hitRate: 1, priority: 0, description: 'みかた ひとりの どく・まひ・ねむり・こんらんを なおす。' },
  // ---- 補助
  { id: 'harden', name: 'かたくなる', category: 'buff', target: 'self', mpCost: 2, power: 0, hitRate: 1, priority: 1, buff: { stat: 'defense', stages: 2 }, description: 'じぶんの しゅびりょくを おおきく あげる。' },
  { id: 'veil', name: 'まもりのまく', category: 'buff', target: 'allAllies', mpCost: 4, power: 0, hitRate: 1, priority: 0, buff: { stat: 'defense', stages: 1 }, description: 'みかた ぜんいんの しゅびりょくを あげる。' },
  { id: 'haste', name: 'はやあし', category: 'buff', target: 'allAllies', mpCost: 3, power: 0, hitRate: 1, priority: 0, buff: { stat: 'speed', stages: 1 }, description: 'みかた ぜんいんの すばやさを あげる。' },
  { id: 'focus', name: 'ちからため', category: 'buff', target: 'self', mpCost: 3, power: 0, hitRate: 1, priority: 0, charge: true, description: 'つぎの ぶつり こうげきが 2ばいに なる。' },
  { id: 'glare', name: 'にらみつけ', category: 'debuff', target: 'oneEnemy', mpCost: 2, power: 0, hitRate: 0.9, priority: 0, buff: { stat: 'attack', stages: -1 }, description: 'てき ひとりの こうげきりょくを さげる。' },
  { id: 'dust', name: 'すなけむり', category: 'debuff', target: 'allEnemies', mpCost: 3, power: 0, hitRate: 0.85, priority: 0, buff: { stat: 'speed', stages: -1 }, description: 'てき ぜんたいの すばやさを さげる。' },
  // ---- 状態異常
  { id: 'lullaby', name: 'ねむりのうた', category: 'status', target: 'allEnemies', mpCost: 4, power: 0, hitRate: 1, priority: 0, statusEffectId: 'sleep', statusChance: 0.45, description: 'てき ぜんたいを ねむらせる ことが ある。' },
  { id: 'stunspore', name: 'しびれごな', category: 'status', target: 'oneEnemy', mpCost: 3, power: 0, hitRate: 1, priority: 0, statusEffectId: 'paralysis', statusChance: 0.6, description: 'てき ひとりを まひさせる ことが ある。' },
  { id: 'poisonmist', name: 'どくのきり', category: 'status', target: 'allEnemies', mpCost: 4, power: 0, hitRate: 1, priority: 0, statusEffectId: 'poison', statusChance: 0.6, description: 'てき ぜんたいを どくに する ことが ある。' },
  { id: 'dazzle', name: 'まどわしのまい', category: 'status', target: 'oneEnemy', mpCost: 4, power: 0, hitRate: 1, priority: 0, statusEffectId: 'confusion', statusChance: 0.6, description: 'てき ひとりを こんらんさせる ことが ある。' },
];

export const SKILLS: Record<string, SkillDefinition> = Object.fromEntries(list.map((s) => [s.id, s]));
export const SKILL_LIST = list;

/** ふつうの こうげき（特技枠を使わない） */
export const ATTACK: SkillDefinition = {
  id: 'attack', name: 'こうげき', category: 'physical', target: 'oneEnemy', mpCost: 0, power: 1, hitRate: 0.95, priority: 0, noInherit: true, description: 'ふつうに こうげきする。',
};

export function getSkill(id: string): SkillDefinition {
  if (id === 'attack') return ATTACK;
  const s = SKILLS[id];
  if (!s) throw new Error(`unknown skill: ${id}`);
  return s;
}

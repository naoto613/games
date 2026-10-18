// ボスの 行動台本（仕様 6 の 各章ボスの 特徴を データに したもの）。エンジンは src/domain/battle/BossScript.ts。
// ふつうの 行動は AI が きめ、台本は「いつ・なにを くわえるか」だけを 書く。
import type { BossScript } from '../types';

const list: BossScript[] = [
  // 第1章 キノコ王モルグ：毒胞子で 継続ダメージ／子分を よぶ／火が 弱点（耐性は 種族で）
  {
    id: 'morg',
    rules: [
      { id: 'open', when: { kind: 'start' }, once: true, steps: [{ kind: 'message', text: 'キノコ王モルグは どくの ほうしを まきちらした！' }, { kind: 'useSkill', skillId: 'poisonmist' }] },
      { id: 'call', when: { kind: 'turn', every: 4, from: 3 }, steps: [{ kind: 'summon', speciesId: 'm044', level: 6, count: 1, max: 2, name: 'キノコへい' }] },
      { id: 'rage', when: { kind: 'hpBelow', ratio: 0.4 }, once: true, steps: [{ kind: 'message', text: 'モルグの かさが まっかに ふくらんだ！' }, { kind: 'buff', stat: 'attack', stages: 1, target: 'self' }] },
    ],
  },
  // 第2章 中ボス 泡守りの騎士：はじめに 泡の よろい（守備↑）／HP はんぶんで バブルミニを よぶ
  {
    id: 'bubbleknight',
    rules: [
      { id: 'armor', when: { kind: 'start' }, once: true, steps: [{ kind: 'message', text: '泡守りの騎士は 泡の よろいを まとった！' }, { kind: 'buff', stat: 'defense', stages: 1, target: 'self' }] },
      { id: 'call', when: { kind: 'hpBelow', ratio: 0.5 }, once: true, steps: [{ kind: 'message', text: '騎士の まわりに 泡が あつまっていく……！' }, { kind: 'summon', speciesId: 'm002', level: 10, count: 1, max: 2, name: 'あわの こ' }] },
    ],
  },
  // 第2章 深淵のウロコ王：水の 全体攻撃／一定ターンごとに 守備が あがる（雷が 弱点）
  {
    id: 'uroko',
    rules: [
      { id: 'tide', when: { kind: 'turn', every: 4, from: 2 }, steps: [{ kind: 'message', text: 'ウロコ王が 水を まきあげた！' }, { kind: 'useSkill', skillId: 'wave' }] },
      { id: 'scale', when: { kind: 'turn', every: 3, from: 3 }, steps: [{ kind: 'message', text: 'ウロコ王の ウロコが かたく かさなった！' }, { kind: 'buff', stat: 'defense', stages: 1, target: 'self' }] },
    ],
  },
  // 第4章 灰冠の騎士：物理防御が 高い／途中で 魔物を 召喚
  {
    id: 'ashcrown',
    rules: [
      { id: 'guard', when: { kind: 'start' }, once: true, steps: [{ kind: 'buff', stat: 'defense', stages: 2, target: 'self' }] },
      { id: 'call', when: { kind: 'hpBelow', ratio: 0.6 }, once: true, steps: [{ kind: 'message', text: '灰冠の騎士は つのぶえを ふいた！' }, { kind: 'summon', speciesId: 'm122', level: 22, count: 2, max: 3 }] },
    ],
  },
  // 第5章 樹海母神エルダ：自己回復と 状態異常／取り巻きを 放置すると 回復が ふえる
  {
    id: 'elda',
    rules: [
      { id: 'roots', when: { kind: 'start' }, once: true, steps: [{ kind: 'summon', speciesId: 'm047', level: 28, count: 2, max: 3, name: 'ねっこ' }] },
      { id: 'bloom', when: { kind: 'turn', every: 3 }, steps: [{ kind: 'useSkill', skillId: 'healbreeze' }] },
      { id: 'regrow', when: { kind: 'minionsBelow', count: 1 }, steps: [{ kind: 'summon', speciesId: 'm047', level: 28, count: 1, max: 2, name: 'ねっこ' }] },
    ],
  },
  // 第6章 氷鏡竜ミラージュ：呪文を はねかえす 氷鏡（物理で わる）／火が 有効
  {
    id: 'mirage',
    rules: [
      { id: 'mirror', when: { kind: 'turn', every: 4, from: 1 }, steps: [{ kind: 'message', text: 'ミラージュは こおりの かがみを つくりだした！' }, { kind: 'reflect', turns: 3, categories: ['magic', 'breath'], physicalHits: 2 }] },
    ],
  },
  // 第7章 紅蓮帝ヴォルガ：高火力の 全体攻撃／一定ターンごとに 火力が あがる
  {
    id: 'volga',
    rules: [
      { id: 'heat', when: { kind: 'turn', every: 3, from: 3 }, steps: [{ kind: 'message', text: 'ヴォルガの ほのおが いっそう もえあがる！' }, { kind: 'buff', stat: 'attack', stages: 1, target: 'self' }, { kind: 'buff', stat: 'magic', stages: 1, target: 'self' }] },
      { id: 'burst', when: { kind: 'turn', every: 4, from: 4 }, steps: [{ kind: 'useSkill', skillId: 'scorch' }] },
    ],
  },
  // 第9章 影王ゼルヴァ：強化を 解除／影分身
  {
    id: 'zelva',
    rules: [
      { id: 'dispel', when: { kind: 'turn', every: 3, from: 2 }, steps: [{ kind: 'message', text: 'ゼルヴァの かげが ひろがる……' }, { kind: 'dispel' }] },
      { id: 'clone', when: { kind: 'hpBelow', ratio: 0.5 }, once: true, steps: [{ kind: 'summon', speciesId: 'm145', level: 48, count: 2, max: 3, name: 'かげぶんしん' }] },
    ],
  },
  // 第10章 天穹獣アストラ：属性を 切り替え、耐性が かわる
  {
    id: 'astra',
    rules: [
      { id: 'shift', when: { kind: 'turn', every: 2 }, steps: [{ kind: 'element', cycle: ['fire', 'ice', 'thunder', 'wind', 'light'] }] },
    ],
  },
  // 第12章 虚無の王ノクティル：3つの 形態（記憶を封じる者 → すべてを統べる者 → 静寂の世界）
  {
    id: 'noctil',
    rules: [
      { id: 'seal', inPhase: 0, when: { kind: 'turn', every: 3 }, steps: [{ kind: 'useSkill', skillId: 'illusion' }] },
      {
        id: 'phase2', inPhase: 0, when: { kind: 'hpBelow', ratio: 0.5 }, once: true,
        steps: [{ kind: 'phase', name: 'すべてを統べる者', healRatio: 1, statScale: 1.15, skills: ['starfall', 'voidnova', 'tidalwave', 'scorch'], clearStages: true, message: 'ノクティルの すがたが かわっていく……！' }],
      },
      { id: 'shift', inPhase: 1, when: { kind: 'turn', every: 2 }, steps: [{ kind: 'element', cycle: ['shadow', 'fire', 'water', 'thunder', 'ice'] }] },
      {
        id: 'phase3', inPhase: 1, when: { kind: 'hpBelow', ratio: 0.5 }, once: true,
        steps: [{ kind: 'phase', name: '静寂の世界', healRatio: 0.6, statScale: 1.1, skills: ['voidnova', 'nightmare', 'souldrain', 'curse'], resist: { shadow: 3, light: -1 }, clearStages: true, message: 'あたりから おとが きえた……' }],
      },
      { id: 'silence', inPhase: 2, when: { kind: 'turn', every: 3 }, steps: [{ kind: 'dispel' }] },
    ],
  },
];

export const BOSS_SCRIPTS: Record<string, BossScript> = Object.fromEntries(list.map((s) => [s.id, s]));
export const BOSS_SCRIPT_LIST = list;

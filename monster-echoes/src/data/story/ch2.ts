// 第2章「しずくの洞窟」の 物語イベント（仕様 6 第2章）。
// ミズナに 着く（ch1.ts の ch2_mizuna_arrive）→ 祠の 扉が ひらく → 水音の洞穴（泡守りの騎士）→ 深淵の水路（氷の欠片・水鏡の記憶・深淵のウロコ王）。
import type { StoryEvent } from './types';

const L = (speaker: string, text: string) => ({ speaker, text });

export const CH2_EVENTS: StoryEvent[] = [
  // ---- 2-1 ミズナ：街の ふしぎな 現象と 祠の 扉
  {
    id: 'ch2_rumor', trigger: { kind: 'talk', target: 'minamo' }, conditions: [{ type: 'flag', id: 'tutorial_breeding' }, { type: 'stageNotCleared', id: '2-2' }], priority: 5,
    lines: [
      L('配合師ミナモ', 'じつはね、ちかごろ ミズナの まものが うまく そだたないの。'),
      L('配合師ミナモ', 'レベルが あがっても ちからが のびにくくて……。水路の 水も、どこか にごっているわ。'),
      L('配合師ミナモ', '街の 水は、祠の おくの 水音の洞穴から ながれてくるの。むかしは そこに 水の 響晶が あったと いうけれど……。'),
      L('', '{luna}が 森の 響晶の 欠片に よりそって、ちいさく ふるえた。'),
      L('配合師ミナモ', '祠の 扉を ひらいておくわ。{name}、水の ようすを 見てきてくれる？'),
    ],
    actions: [{ type: 'setFlag', id: 'ch2_shrine_open' }],
  },
  // ---- 2-2 水音の洞穴
  {
    id: 'ch2_cave_enter', trigger: { kind: 'enterStage', target: '2-2' }, conditions: [], priority: 5,
    lines: [
      L('', 'ぽたり、ぽたり……。洞穴じゅうに しずくの 音が ひびいている。'),
      L('', '{luna}は 水の 音に 耳を すますように、じっと うごかない。'),
    ],
    actions: [{ type: 'setFlag', id: 'ch2_cave' }],
  },
  {
    id: 'ch2_current', trigger: { kind: 'floor', target: '2-2', floor: 3 }, conditions: [], priority: 1,
    lines: [L('', 'はやい 水の ながれが ある。のると ながれの さきまで はこばれて しまうようだ。'), L('', '矢印の むきを よく 見て すすもう。')],
    actions: [{ type: 'setFlag', id: 'ch2_current' }],
  },
  {
    id: 'ch2_knight_defeated', trigger: { kind: 'bossDefeated', target: 'bubbleknight' }, conditions: [], priority: 10,
    lines: [
      L('泡守りの騎士', '……わたしは……なにを まもって いたのだ……。'),
      L('泡守りの騎士', 'ずっと むかし、ここで 水の 響晶を まもれと いわれた。だが その 声は いつしか、くらい 声に かわっていた……。'),
      L('泡守りの騎士', '響晶は この 下……深淵の水路の おくだ。ウロコ王が ねむる 淵に ある。'),
      L('', '騎士は しずかに ひざを つき、泡の ように きえていった。'),
    ],
    actions: [{ type: 'setFlag', id: 'ch2_knight' }, { type: 'record', id: 'rec_dark_voice', title: '響晶を まもる ものに ささやく「くらい声」' }, { type: 'clearStage', id: '2-2' }],
  },
  // ---- 2-3 深淵の水路
  {
    id: 'ch2_waterway_enter', trigger: { kind: 'enterStage', target: '2-3' }, conditions: [], priority: 5,
    lines: [
      L('', 'つめたい 空気が 足もとから はいあがってくる。ふるい 石の 水路が、くらやみの おくへ つづいている。'),
      L('', '水路の かべには、森の 石碑と おなじ 紋章が きざまれていた。'),
    ],
    actions: [{ type: 'setFlag', id: 'ch2_waterway' }],
  },
  {
    // 3F：氷の欠片（第6章 凍星の山脈への 伏線）
    id: 'ch2_ice_shard', trigger: { kind: 'manual', target: 'ch2_ice_shard' }, conditions: [], priority: 5,
    lines: [
      L('', '水路の 水が、ここだけ こおりついている。'),
      L('', 'こおりの なかに、すきとおった 青い 欠片が しずんでいた。'),
      L('', '{luna}が ふれると、欠片は「さむい……さむい……」と かすかに ささやいた 気が した。'),
      L('', 'ふしぎな 氷の欠片を 手に いれた。どこか とおい 雪山の 気配が する……。'),
    ],
    actions: [{ type: 'setFlag', id: 'ch2_ice_shard' }, { type: 'record', id: 'rec_ice_shard', title: '「さむい」と ささやく 氷の欠片（とおい 雪山の 気配）' }, { type: 'giveItem', itemId: 'mpdrop', count: 1 }],
  },
  {
    // 5F：水鏡の記憶（仕様：魔物は 死後も 記憶の 一部を 響晶に のこす）
    id: 'ch2_water_mirror', trigger: { kind: 'manual', target: 'ch2_water_mirror' }, conditions: [], priority: 10,
    lines: [
      L('', '水面が 鏡の ように しずまり、ふるい 装置が うかびあがった。'),
      L('', '装置の 中心で、ちいさな 光が いくつも ゆれている。'),
      L('', '光に ふれると、しらない 景色が 頭の なかに ながれこんできた。'),
      L('', '──広い 草原。まものたちと わらう 人々。そして、その まんなかで 光る 大きな 響晶。'),
      L('', '──空が くらく なり、だれかの 影が 響晶に 手を のばす……。'),
      L('', '{luna}が {name}の うでの なかで、ふるえながら 光った。'),
      L('', 'まものは いのちを おえても、記憶の かけらを 響晶に のこすのだ……。この 装置は、それを まもる ための ものだったらしい。'),
    ],
    actions: [{ type: 'setFlag', id: 'ch2_mirror' }, { type: 'record', id: 'rec_memory_device', title: 'まものは 死後も 記憶を 響晶に のこす（水鏡の 装置）' }, { type: 'record', id: 'rec_shadow_hand', title: '響晶に 手を のばす 影（水鏡の 記憶）' }],
  },
  {
    id: 'ch2_uroko_defeated', trigger: { kind: 'bossDefeated', target: 'uroko' }, conditions: [], priority: 10,
    lines: [
      L('深淵のウロコ王', 'ぐ……う……。わしは ただ……ねむりを まもりたかった だけだ……。'),
      L('深淵のウロコ王', 'あの 影が きてから、響晶は ずっと 泣いて おった。わしの ウロコに しみこむ ほどにな……。'),
      L('', '淵の そこで、青い 光が しずかに ひかっている。'),
      L('', '{luna}が 光に ふれると、にごっていた 水が すきとおっていった。'),
      L('', '水の 響晶を 手に いれた！'),
      L('配合師ミナモ（遠くの 声）', '……水が すんでいく……！ {name}、ありがとう！'),
    ],
    actions: [
      { type: 'setFlag', id: 'ch2_uroko' },
      { type: 'record', id: 'rec_crying_crystal', title: '影が きてから 響晶は 泣いていた（ウロコ王の ことば）' },
      { type: 'clearStage', id: '2-3' },
    ],
  },
  {
    // 第2章 クリア：つぎの 目的地（第3章 風鳴り高原）
    id: 'ch2_clear', trigger: { kind: 'clearStage', target: '2-3' }, conditions: [], priority: 5,
    lines: [
      L('配合師ミナモ', 'おかえりなさい！ 街の まものたちも、また げんきに そだつように なったわ。'),
      L('配合師ミナモ', 'お礼に、配合の 秘伝を おしえるわね。親の とくぎを 3つまで うけつがせられるように なるわ。牧場も ひろげておいたから。'),
      L('配合師ミナモ', 'それと……北の 風鳴り高原で、風が おかしな むきに ふいているそうよ。響晶と かんけいが あるのかも しれない。'),
    ],
    actions: [{ type: 'setFlag', id: 'ch2_clear' }],
  },
];

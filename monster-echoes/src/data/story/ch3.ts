// 第3章「風鳴り高原」の 物語イベント（仕様 6 第3章）。
// 高原では 風が さかさまに ふき、まものが すみかを おわれている。村カゼノは 旅人を こばむ。
// 峡谷の 番人を しずめて 村の 信頼を とりもどし、逆風の塔の グリフォンを しずめると、上空の 黒い結晶が 原因だと わかる。
import { BOSSES } from '../areas';
import type { StoryEvent } from './types';

const L = (speaker: string, text: string) => ({ speaker, text });

export const CH3_EVENTS: StoryEvent[] = [
  // ---- 3-1 風見の村カゼノ
  {
    id: 'ch3_kazeno_arrive', trigger: { kind: 'enterStage', target: '3-1' }, conditions: [], priority: 10,
    lines: [
      L('', '高原に でると、つよい 風が 顔に ふきつけてきた。……風が、山の ほうから 谷へ むかって ふいている。'),
      L('見はりのゴウ', 'とまれ！ ……まものを つれた 旅人か。'),
      L('見はりのゴウ', 'ちかごろ 谷から おいだされた まものが 村を おそうんだ。まもの使いは しんよう できん。'),
      L('見はりのゴウ', '……村に いるのは かまわんが、へんな まねは するなよ。'),
      L('', '{luna}が しょんぼりと {name}の かげに かくれた。'),
    ],
    actions: [{ type: 'setFlag', id: 'ch3_distrust' }],
  },
  {
    id: 'ch3_hakase', trigger: { kind: 'talk', target: 'hakase' }, conditions: [], priority: 10,
    lines: [
      L('研究者ホルン', 'おや、きみが ミズナの 水を すませた 調律師かい？ うわさは きいているよ。'),
      L('研究者ホルン', 'ここは 魔物研究所。まものの 系統や、どの 属性に つよいか よわいかを しらべているんだ。'),
      L('研究者ホルン', '図鑑を 系統ごとに 見られるように しておこう。戦闘でも、あいての 弱点が わかるはずだ。'),
      L('研究者ホルン', 'それと、これを。高原の 風に まけない おまもりだ。モンスターの「そうび」に つけてごらん。'),
      L('', 'かぜのおまもりを もらった！ モンスターに ひとつ そうび できる。'),
      L('研究者ホルン', '谷の 風が さかさまに なったのは、ひと月ほど まえ……。峡谷の 番人なら なにか しっているかもしれない。'),
    ],
    actions: [{ type: 'setFlag', id: 'ch3_hakase' }, { type: 'giveEquip', equipId: 'windcharm', count: 1 }],
  },
  // ---- 3-2 風渡りの峡谷
  {
    id: 'ch3_canyon_enter', trigger: { kind: 'enterStage', target: '3-2' }, conditions: [], priority: 5,
    lines: [
      L('', '深い 谷の そこを、風が うなりを あげて ふきぬけていく。'),
      L('', '岩の かげで、すみかを おわれた まものたちが こちらを うかがっている。'),
    ],
    actions: [{ type: 'setFlag', id: 'ch3_canyon' }],
  },
  {
    id: 'ch3_wind_bridge', trigger: { kind: 'manual', target: 'ch3_wind_bridge' }, conditions: [], priority: 5,
    lines: [
      L('', '谷に かかった 古い 橋の まえに、風見の 石が たっている。'),
      L('', '「橋を わたる ものは 風に まかせよ。風の すじを よみ、ながれの さきを 見よ」'),
      L('', '橋の うえの 風の すじに のると、その むきへ ながされるようだ。'),
    ],
    actions: [{ type: 'setFlag', id: 'ch3_bridge' }, { type: 'giveItem', itemId: 'herb', count: 2 }],
  },
  {
    id: 'ch3_guard_defeated', trigger: { kind: 'bossDefeated', target: 'kazami_guard' }, conditions: [], priority: 10,
    lines: [
      L('風見の番人', '……ううむ。わしは 谷の 風を 見まもる ものだった……。'),
      L('風見の番人', 'ある 夜、空に 黒い 光が うかんでから、風は さかさまに ふくように なった。'),
      L('風見の番人', 'わしの こころまで、その 風に ながされて しまったようだ……。'),
      L('風見の番人', '風の みなもとは 逆風の塔。いただきに いる グリフォンが、風を のみこみつづけている……。'),
      L('', '番人は ふかく 頭を さげ、谷の 空へ とびさった。'),
    ],
    actions: [{ type: 'setFlag', id: 'ch3_guard' }, { type: 'record', id: 'rec_black_light', title: '空に うかんだ 黒い光（風見の番人の ことば）' }, { type: 'clearStage', id: '3-2' }],
  },
  {
    // 峡谷の あと：見はりの ゴウが こころを ひらく
    id: 'ch3_trust', trigger: { kind: 'talk', target: 'goh' }, conditions: [{ type: 'stageCleared', id: '3-2' }], priority: 10,
    lines: [
      L('見はりのゴウ', '……谷の 風が すこし おさまった。まものたちも 谷へ かえっていくのを 見た。'),
      L('見はりのゴウ', 'あんたの おかげだ。うたがって すまなかった。'),
      L('見はりのゴウ', '村長に きいたよ。逆風の塔へ いくんだろう？ 宿屋には あんたの 部屋を とっておいた。むりょうで とまっていけ。'),
      L('', '{luna}が うれしそうに ぴょんと はねた。'),
    ],
    actions: [{ type: 'setFlag', id: 'ch3_trusted' }],
  },
  // ---- 3-3 逆風の塔
  {
    id: 'ch3_tower_enter', trigger: { kind: 'enterStage', target: '3-3' }, conditions: [], priority: 5,
    lines: [
      L('', '塔の 入口から、つめたい 向かい風が ふきおろしてくる。'),
      L('', 'かべには、ミズナの 水路と おなじ 紋章が きざまれていた。'),
    ],
    actions: [{ type: 'setFlag', id: 'ch3_tower' }],
  },
  {
    id: 'ch3_cloud_chest', trigger: { kind: 'manual', target: 'ch3_cloud_chest' }, conditions: [], priority: 5,
    lines: [
      L('', 'まどの そとに、くもの かたまりが ひっかかっている。'),
      L('', 'くもの なかに、ふわふわの 宝箱が うかんでいた！'),
      L('', 'くものはねかざりを 手に いれた！ そうびすると すばやく うごける。'),
    ],
    actions: [{ type: 'setFlag', id: 'ch3_cloud' }, { type: 'giveEquip', equipId: 'cloudfeather', count: 1 }],
  },
  {
    // 5F：風の記憶（伏線：黒い結晶・同じ紋章）
    id: 'ch3_wind_memory', trigger: { kind: 'manual', target: 'ch3_wind_memory' }, conditions: [], priority: 10,
    lines: [
      L('', '風の とおりみちに、ちいさな 響晶の かけらが はまっている。'),
      L('', 'ふれると、風の 記憶が ながれこんできた。'),
      L('', '──塔の いただき。グリフォンが 子どもたちを 風に のせて あそばせている。'),
      L('', '──夜空が われ、黒い 結晶が しずかに おりてくる。結晶の まわりで、風が ぎゃくに うずを まく。'),
      L('', '──グリフォンが 結晶に ほえる。だが 結晶は 風を すいこみ、グリフォンの 目が くろく そまっていく……。'),
      L('', '{luna}が ふるえている。森の 下の「泣いている光」と、どこか にた 気配が する……。'),
    ],
    actions: [{ type: 'setFlag', id: 'ch3_memory' }, { type: 'record', id: 'rec_black_crystal', title: '夜空から おりてきた 黒い結晶（風の記憶）' }],
  },
  {
    // 6F：グリフォンの分身
    id: 'ch3_griffon_clone', trigger: { kind: 'manual', target: 'ch3_griffon_clone' }, conditions: [], priority: 10,
    lines: [
      L('', '階段の まえで、風が かたまり、グリフォンの すがたに なった！'),
      L('グリフォンの分身', 'キイイ……！ 風を……かえせ……！'),
    ],
    actions: [{ type: 'setFlag', id: 'ch3_clone' }, { type: 'battle', enemies: BOSSES.griffon_clone.enemies }],
  },
  {
    id: 'ch3_griffon_defeated', trigger: { kind: 'bossDefeated', target: 'griffon' }, conditions: [], priority: 10,
    lines: [
      L('風喰いグリフォン', '……クゥ……。わたしは……なにを……。'),
      L('風喰いグリフォン', '風を……のみこまないと……あの 結晶に ぜんぶ すわれて しまう……そう おもったのだ……。'),
      L('', 'グリフォンが 空を 見あげた。塔の はるか うえに、黒い 結晶が うかんでいる。'),
      L('', '結晶は ゆっくりと まわりながら、風を すいこみ……やがて、空の かなたへ きえていった。'),
      L('風喰いグリフォン', '……あれだ。あれが 風を くるわせた。わたしでは かてなかった……。'),
      L('', 'グリフォンの 胸から、すきとおった 緑の 光が こぼれた。'),
      L('', '風の響晶を 手に いれた！ 高原に、ほんとうの 風が もどってきた。'),
    ],
    actions: [
      { type: 'setFlag', id: 'ch3_griffon' },
      { type: 'record', id: 'rec_crystal_sky', title: '空に うかび、風を すいこんで きえた 黒い結晶' },
      { type: 'clearStage', id: '3-3' },
    ],
  },
  {
    // 第3章 クリア：つぎの 目的地（第4章 灯火の街道）
    id: 'ch3_clear', trigger: { kind: 'clearStage', target: '3-3' }, conditions: [], priority: 5,
    lines: [
      L('村長カザミ', '風が もどった……！ 村の 風車も、またまわりはじめたよ。'),
      L('村長カザミ', '旅の扉を みがいておいた。これで ほかの 町の 扉へも とべるはずじゃ。'),
      L('研究者ホルン', '黒い 結晶……。南の 灯火の街道でも、空に 黒い 光を 見たという うわさが あるんだ。'),
      L('研究者ホルン', '街道の 先の アカリスでは、人と まものの あいだで あらそいが おきているらしい。気を つけて。'),
    ],
    actions: [{ type: 'setFlag', id: 'ch3_clear' }],
  },
];

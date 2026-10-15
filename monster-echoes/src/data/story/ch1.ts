// 第1章「はじまりの森」と 第2章の はじまり（ミズナ・配合の館）の 物語イベント（仕様 6 第1章・Q8）。
// 画面との つなぎこみは Phase 1（1-2〜1-9）。ここでは 内容と 条件を データに する。
import type { StoryEvent } from './types';

const L = (speaker: string, text: string) => ({ speaker, text });

export const CH1_EVENTS: StoryEvent[] = [
  // ---- 1-1 リーフェル集落：夜の光 → ルナスライムを たすける → 石碑が 反応する
  {
    id: 'ch1_night_light', trigger: { kind: 'enterStage', target: '1-1' }, conditions: [{ type: 'chapterBelow', n: 2 }], priority: 10,
    lines: [
      L('', 'その夜、森の おくから ふしぎな 光が はなたれた。'),
      L('調律師ソラ', '{name}、おきているか。森の まものたちが さわいでいる。'),
      L('調律師ソラ', '見習いでも 調律師だ。光の ほうを たしかめて きておくれ。'),
    ],
    actions: [{ type: 'setFlag', id: 'ch1_light_seen' }],
  },
  {
    id: 'ch1_rescue_luna', trigger: { kind: 'manual', target: 'forest_edge' }, conditions: [{ type: 'flag', id: 'ch1_light_seen' }], priority: 10,
    lines: [
      L('', 'しげみの かげで、小さな スライムが ふるえている。'),
      L('', 'からだに きずが ある。光に うたれたのだろうか。'),
      L('{name}', 'だいじょうぶ。もう こわくないよ。'),
      L('', 'スライムは {name}の 手のひらで、ほのかに 光った。'),
      L('', 'ルナスライムが なかまに なった！'),
    ],
    actions: [{ type: 'giveMonster', speciesId: 'm001', level: 3, partner: true }, { type: 'setFlag', id: 'partner_joined' }],
  },
  {
    id: 'ch1_stone_reacts', trigger: { kind: 'manual', target: 'forest_stone' }, conditions: [{ type: 'flag', id: 'partner_joined' }], priority: 5,
    lines: [
      L('', '森の 入口の 古い 石碑が、ルナスライムに こたえるように 光った。'),
      L('調律師ソラ', 'この 石碑が 光るのは はじめて 見る……。'),
      L('調律師ソラ', '{luna}と いっしょなら、森の おくへ いけるかもしれない。'),
    ],
    actions: [{ type: 'setFlag', id: 'ch1_stone' }, { type: 'record', id: 'rec_stone_ch1', title: '森の入口の石碑が 相棒に 反応した' }, { type: 'clearStage', id: '1-1' }],
  },
  // ---- 1-2 木漏れ日の小道：はじめての 仲間（Q16：グリーンピクシー → グリーンスプライト）
  {
    id: 'ch1_pollen', trigger: { kind: 'floor', target: '1-2', floor: 2 }, conditions: [], priority: 1,
    lines: [L('', 'あまい 花粉が ただよっている。まものたちが おとなしく なっていく……。'), L('', '傷ついた まものが こちらを 見ている。')],
    actions: [{ type: 'setFlag', id: 'ch1_pollen' }],
  },
  {
    // 3F の 古い 石碑（しらべると おこる）
    id: 'ch1_first_recruit', trigger: { kind: 'manual', target: 'ch1_first_recruit' }, conditions: [], priority: 10,
    lines: [
      L('', '古い 石碑の まえで、グリーンスプライトが ないている。'),
      L('', '{luna}が ちかよると、グリーンスプライトは おどろいて とびかかってきた！'),
      L('調律師ソラ（思い出）', 'まものの こころが ゆらいだら、にくを わけて あげなさい。'),
      L('', 'せんとうで「にく」を なげてから たおすと、なかまに なってくれる ことが ある。'),
    ],
    actions: [{ type: 'giveItem', itemId: 'jerky', count: 3 }, { type: 'setFlag', id: 'tutorial_recruit' }, { type: 'battle', enemies: [{ speciesId: 'm043', level: 3 }] }],
  },
  // ---- 1-3 ささやきの森：キノコ王モルグ
  {
    id: 'ch1_trace', trigger: { kind: 'manual', target: 'ch1_trace' }, conditions: [], priority: 1,
    lines: [L('', '地面に 見なれない 足あとが のこっている。めずらしい まものが ちかくに いるようだ。')],
    actions: [{ type: 'setFlag', id: 'ch1_trace' }],
  },
  {
    id: 'ch1_morg_defeated', trigger: { kind: 'bossDefeated', target: 'morg' }, conditions: [], priority: 10,
    lines: [
      L('キノコ王モルグ', 'うう……ちからが ぬけていく……。'),
      L('キノコ王モルグ', 'ちがうのだ……わしらは あばれたくて あばれたのでは ない……。'),
      L('キノコ王モルグ', '森の 下で、泣いている 光を 見た。たすけを もとめる 声が、ずっと きこえるのだ……。'),
      L('', '{luna}が モルグの まわりを まわり、そっと ふれた。'),
      L('', '森の 響晶の 欠片を 手に いれた！'),
    ],
    actions: [
      { type: 'setFlag', id: 'ch1_morg' },
      { type: 'record', id: 'rec_crying_light', title: '森の下で 泣いている光（モルグの ことば）' },
      { type: 'clearStage', id: '1-3' },
    ],
  },
  // ---- 第2章の はじまり：ミズナ・配合の館（Q8）
  {
    id: 'ch2_mizuna_arrive', trigger: { kind: 'enterStage', target: '2-1' }, conditions: [], priority: 10,
    lines: [
      L('', '水辺の街ミズナに ついた。水路の 音が ここちよい。'),
      L('配合師ミナモ', 'ようこそ、配合の館へ。調律師の 見習いさんね。'),
      L('配合師ミナモ', 'まもの どうしの きずなを むすぶと、あたらしい いのちが うまれるの。ためして みる？'),
    ],
    actions: [{ type: 'setFlag', id: 'tutorial_breeding' }],
  },
];

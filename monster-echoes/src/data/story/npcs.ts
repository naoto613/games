// 街の NPC と 会話表（仕様 14・17.3：章ごとに 会話が かわる）。あとの 行ほど・優先度が 高いほど さきに つかう。
import type { NpcDefinition } from './types';

const L = (text: string) => ({ speaker: '', text });

export const NPCS: NpcDefinition[] = [
  {
    id: 'sora', name: '調律師ソラ', townId: 'liefel',
    talks: [
      { conditions: [], lines: [L('調律師は、世界の 響きを ととのえる 仕事だ。まものの こえを よく きいておくれ。')] },
      { conditions: [{ type: 'flag', id: 'ch1_light_seen' }, { type: 'notFlag', id: 'partner_joined' }], lines: [L('光は 森の 入口の ほうに おちた。気を つけるんだよ。')] },
      { conditions: [{ type: 'flag', id: 'partner_joined' }], lines: [L('{luna}は 光に ふれて うまれた まもの かもしれないね。だいじに してあげなさい。')] },
      { conditions: [{ type: 'chapterAtLeast', n: 2 }], lines: [L('モルグが 「泣いている光」と いったのか……。ミズナの 配合師なら なにか しっているかもしれない。')] },
      { conditions: [{ type: 'chapterAtLeast', n: 4 }], lines: [L('{name}の うわさは リーフェルまで とどいているよ。りっぱに なったね。')] },
      { conditions: [{ type: 'chapterAtLeast', n: 12 }], priority: 1, lines: [L('世界の 響きが みだれている……。{name}、かならず かえっておいで。')] },
    ],
  },
  {
    id: 'mio', name: '村の子ミオ', townId: 'liefel',
    talks: [
      { conditions: [], lines: [L('ゆうべの 光、見た？ ながれ星みたいだった！')] },
      { conditions: [{ type: 'flag', id: 'partner_joined' }], lines: [L('わあ、ちいさい スライム！ なまえは {luna}って いうの？ かわいい！')] },
      { conditions: [{ type: 'chapterAtLeast', n: 2 }], lines: [L('森の まものたち、おとなしく なったよ。{name}の おかげだね！')] },
    ],
  },
  {
    id: 'elder', name: '村長ハルト', townId: 'liefel',
    talks: [
      { conditions: [], lines: [L('森の 入口の 石碑は、むかし 調律師が たてた ものと つたわっておる。')] },
      { conditions: [{ type: 'flag', id: 'ch1_stone' }], lines: [L('石碑が 光ったとな……。まさか、あの 言いつたえが ほんとうに……。')] },
      { conditions: [{ type: 'chapterAtLeast', n: 2 }], lines: [L('ミズナへは 森を ぬけて 水路ぞいに すすむと よい。旅の扉も つかえるぞ。')] },
    ],
  },
  {
    id: 'minamo', name: '配合師ミナモ', townId: 'mizuna',
    talks: [
      { conditions: [], lines: [L('配合には レベル 10 いじょうの まもの 2体が ひつようよ。')] },
      { conditions: [{ type: 'flag', id: 'tutorial_breeding' }], lines: [L('親の とくぎを えらんで うけつげるの。いろんな くみあわせを ためしてね。')] },
      { conditions: [{ type: 'chapterAtLeast', n: 3 }], lines: [L('水の 響晶が もどってから、館の 水も すんだ 気が するわ。')] },
    ],
  },
];
export const NPC_BY_ID: Record<string, NpcDefinition> = Object.fromEntries(NPCS.map((n) => [n.id, n]));

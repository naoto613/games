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
      { conditions: [{ type: 'flag', id: 'ch2_shrine_open' }], lines: [L('祠の 扉は ひらいておいたわ。水音の洞穴は ミズナの 水の みなもと。気を つけてね。')] },
      { conditions: [{ type: 'stageCleared', id: '2-2' }], lines: [L('泡守りの騎士が……？ 響晶を まもっていた ものまで おかしく なっていたのね。')] },
      { conditions: [{ type: 'chapterAtLeast', n: 3 }], lines: [L('水の 響晶が もどってから、館の 水も すんだ 気が するわ。とくぎは 3つまで うけつげるわよ。')] },
    ],
  },
  {
    id: 'mother', name: 'おかあさん', townId: 'liefel',
    talks: [
      { conditions: [], lines: [L('{name}、ゆうべは ねむれた？ 森へ いくなら、いやしそうを わすれずにね。')] },
      { conditions: [{ type: 'stageCleared', id: '1-2' }], lines: [L('木漏れ日の小道を ぬけたの？ {luna}も すこし たくましく なったわね。')] },
      { conditions: [{ type: 'chapterAtLeast', n: 2 }], lines: [L('ミズナへ いくのね。つかれたら いつでも かえって おいで。')] },
    ],
  },
  {
    id: 'nagi', name: 'ミズナの 子ナギ', townId: 'mizuna',
    talks: [
      { conditions: [], lines: [L('配合の館には ミナモさんが いるよ。まものと まものを あわせると、あたらしい こが うまれるんだって！')] },
      { conditions: [{ type: 'flag', id: 'tutorial_breeding' }], lines: [L('ちがう 系統どうしを あわせると、ちょっと つよい こが うまれやすいんだよ。')] },
      { conditions: [{ type: 'flag', id: 'ch2_shrine_open' }], lines: [L('洞穴の まものは みずの こうげきが とくい。かみなりや くさの わざが あると らくだって！')] },
      { conditions: [{ type: 'chapterAtLeast', n: 3 }], lines: [L('みずが きれいに なって、水路の さかなも もどってきたよ！ ありがとう！')] },
    ],
  },
  {
    id: 'boatman', name: '船頭のトマ', townId: 'mizuna',
    talks: [
      { conditions: [], lines: [L('ちかごろ 水路の みずが にごってな……。水音の洞穴の ほうから、へんな 音が するんじゃ。')] },
      { conditions: [{ type: 'stageCleared', id: '2-2' }], lines: [L('洞穴の 下には、ふるい 水路が ある。わしの じいさまの ころには もう だれも ちかよらなかった 場所じゃ。')] },
      { conditions: [{ type: 'chapterAtLeast', n: 3 }], lines: [L('みずが すみきって、ふねも よく すすむわい。北の 高原へ いくなら、風に 気を つけるんじゃぞ。')] },
    ],
  },
  // ---- 風見の村カゼノ（第3章）
  {
    id: 'goh', name: '見はりのゴウ', townId: 'kazeno',
    talks: [
      { conditions: [], lines: [L('まもの使いか……。へんな まねは するなよ。')] },
      { conditions: [{ type: 'flag', id: 'ch3_trusted' }], lines: [L('宿屋は むりょうだ。塔へ いく まえに よく やすんでいけ。')] },
      { conditions: [{ type: 'chapterAtLeast', n: 4 }], lines: [L('風が もどってから、村の みんなも わらうように なった。また いつでも こいよ。')] },
    ],
  },
  {
    id: 'fuu', name: '村の子フウ', townId: 'kazeno',
    talks: [
      { conditions: [], lines: [L('風が さかさまに ふくから、たこあげが できないんだ……。')] },
      { conditions: [{ type: 'stageCleared', id: '3-2' }], lines: [L('ねえねえ、谷の 番人を やっつけたって ほんと？ すっごーい！')] },
      { conditions: [{ type: 'chapterAtLeast', n: 4 }], lines: [L('見て！ たこが 空まで とんでる！ {luna}も のってみる？')] },
    ],
  },
  {
    id: 'kazami', name: '村長カザミ', townId: 'kazeno',
    talks: [
      { conditions: [], lines: [L('この 村は 風と ともに 生きてきた。だが いまの 風は、まるで だれかに ひっぱられて いるようじゃ。')] },
      { conditions: [{ type: 'stageCleared', id: '3-2' }], lines: [L('逆風の塔は 高原の いただき。北東の 高原入口から いけるぞ。')] },
      { conditions: [{ type: 'chapterAtLeast', n: 4 }], lines: [L('旅の扉から、ほかの 町へも とべるように なった。つかれたら いつでも かえってきなさい。')] },
    ],
  },
  {
    id: 'hakase', name: '研究者ホルン', townId: 'kazeno',
    talks: [
      { conditions: [], lines: [L('図鑑を 系統ごとに ならべると、にた まものの ちがいが よく わかるよ。')] },
      { conditions: [{ type: 'flag', id: 'ch3_hakase' }], lines: [L('戦闘で あいての 名前の よこに 弱点が 出るはずだ。かみなりや だいちの わざも うまく つかってね。')] },
      { conditions: [{ type: 'chapterAtLeast', n: 4 }], lines: [L('黒い 結晶……あれは 響晶の なれのはて かもしれない。しらべておくよ。')] },
    ],
  },
  {
    id: 'watcher', name: '風見番のナギサ', townId: 'kazeno',
    talks: [
      { conditions: [], lines: [L('ここは 風見台。高原の 風の むきを 毎日 しらべているの。'), L('ひと月まえから、風は 谷から 塔へ むかって すいこまれているわ。まるで 塔の うえに なにかが いるみたい。')] },
      { conditions: [{ type: 'stageCleared', id: '3-2' }], lines: [L('谷の 風は すこし もどった。でも 塔の まわりは まだ ぎゃくむきよ。')] },
      { conditions: [{ type: 'chapterAtLeast', n: 4 }], lines: [L('風が ほんとうの むきに もどったわ！ ……でも 南の 空に、ときどき 黒い かげが 見えるの。')] },
    ],
  },
];
export const NPC_BY_ID: Record<string, NpcDefinition> = Object.fromEntries(NPCS.map((n) => [n.id, n]));

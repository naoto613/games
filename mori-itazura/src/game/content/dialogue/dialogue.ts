// 会話データ。条件に合う最初のエントリーから始まり、選択肢の効果でクエストや持ち物が変わる。
import type { Condition } from '../../systems/Conditions';

export type DialogueEffect =
  | { startQuest: string }
  | { give: string; count?: number; as?: string }   // プレイヤー → NPC
  | { receive: string; count?: number }             // NPC → プレイヤー
  | { money: number }
  | { setFlag: string }
  | { openShop: 'buy' | 'sell' }
  | { spawnLitter: true }
  | { sleep: true }
  | { save: true };

export interface DialogueChoice { text: string; cond?: Condition[]; effects?: DialogueEffect[]; next?: string }
export interface DialogueNode { text: string; choices?: DialogueChoice[]; next?: string; effects?: DialogueEffect[]; mood?: 'happy' | 'sad' | 'surprise' }
export interface NpcDialogue { entries: { cond?: Condition[]; node: string }[]; nodes: Record<string, DialogueNode> }

const BYE: DialogueChoice = { text: 'またね' };

export const SPEAKER: Record<string, string> = { sign: 'かんばん', den: 'コロの おうち' };

export const DIALOGUE: Record<string, NpcDialogue> = {
  sign: {
    entries: [{ node: 'read' }],
    nodes: {
      read: { text: '「もりの キャンプじょうへ ようこそ！ たきびの ひろば・みずうみの さんばし・ばいてん・レンジャーごや が あります。」', next: 'read2' },
      read2: { text: '「ちゅうい：さいきん、ごはんを ねらう もりの どうぶつが でます。たべものから めを はなさないように！ ── レンジャー」', choices: [{ text: 'とじる' }] },
    },
  },
  den: {
    entries: [{ node: 'home' }],
    nodes: {
      home: { text: 'コロの おうち。ここなら だれにも みつからない。なにを する？', choices: [
        { text: 'ねる（あさまで）', effects: [{ sleep: true }] },
        { text: 'きろくする（セーブ）', effects: [{ save: true }], next: 'saved' },
        { text: 'やめる' },
      ] },
      saved: { text: 'きょうの ぼうけんを きろくした！', choices: [{ text: 'とじる' }] },
    },
  },
  dad: {
    entries: [
      { cond: [{ flag: 'teddy_returned' }], node: 'thanks' },
      { cond: [{ flag: 'heist_done' }], node: 'heist' },
      { node: 'hello' },
    ],
    nodes: {
      hello: { text: 'やあ、ちいさな キャンパーさん。きょうは ピクニック びよりだね。', choices: [{ text: 'こんにちは！', next: 'tip' }, BYE] },
      tip: { text: 'このへんは もりの どうぶつが ごはんを ねらって くるらしい。バスケットから めを はなさないように しないとな。', choices: [BYE] },
      heist: { text: 'さっき バスケットの ごはんが へっていたんだ。…まさか きみじゃ ないよね？', choices: [{ text: 'ち、ちがうよ！', next: 'heist2' }, BYE] },
      heist2: { text: 'はっはっは、じょうだんだよ。きっと もりの いたずらっこの しわざさ。', choices: [BYE] },
      thanks: { text: 'むすめの ぬいぐるみを みつけて くれたんだって？ ほんとうに ありがとう！', choices: [BYE], mood: 'happy' },
    },
  },
  mom: {
    entries: [{ node: 'hello' }],
    nodes: {
      hello: { text: 'あら、すてきな ぼうしね。キャンプは はじめて？', choices: [{ text: 'おすすめは ある？', next: 'tip' }, { text: 'ソラちゃんは げんき？', next: 'kid' }, BYE] },
      tip: { text: 'ばいてんの マシュマロを たきびで あぶると とっても おいしいのよ。よるの たきびは ほんとうに きれい。', choices: [BYE] },
      kid: { text: 'ソラったら、だいじな くまの ぬいぐるみを なくしちゃって しょんぼり しているの。', choices: [BYE] },
    },
  },
  kid: {
    entries: [
      { cond: [{ questActive: 'lost_teddy' }, { hasItem: 'teddy_bear' }], node: 'found' },
      { cond: [{ questActive: 'lost_teddy' }], node: 'searching' },
      { cond: [{ questCompleted: 'lost_teddy' }], node: 'friend' },
      { cond: [{ disguised: false }], node: 'animal' },
      { node: 'sad' },
    ],
    nodes: {
      animal: { text: 'わあ！ どうぶつさんだ！ …ねえ、どうぶつさん。ソラの くまちゃん しらない？', next: 'sad2' },
      sad: { text: 'えーん…。ソラの くまちゃんが いなくなっちゃったの…。', next: 'sad2', mood: 'sad' },
      sad2: { text: 'かぜが びゅーって ふいて、みずうみの ほうへ とんでっちゃった…。', choices: [{ text: 'さがして あげる！', effects: [{ startQuest: 'lost_teddy' }], next: 'thanks' }, BYE], mood: 'sad' },
      thanks: { text: 'ほんと!? ありがとう！ みずうみの まんなかの しまの ほうに とんでいったの！', choices: [BYE], mood: 'happy' },
      searching: { text: 'くまちゃん、みつかった？ しまに いくには さんばしの ボートが いいって パパが いってた！', choices: [BYE] },
      found: { text: 'あっ！ それ、ソラの くまちゃん！！', choices: [{ text: 'ぬいぐるみを かえす', effects: [{ give: 'teddy_bear' }], next: 'reward' }, { text: 'まだ かえさない', next: 'pout' }], mood: 'surprise' },
      pout: { text: 'えー！ いじわる〜！', choices: [BYE] },
      reward: { text: 'ありがとう！！ ずっと いっしょ だからね、くまちゃん。これ、おれいの クッキーと おこづかい！', choices: [BYE], mood: 'happy' },
      friend: { text: 'くまちゃんも ありがとうって いってるよ！ また あそぼうね！', choices: [BYE], mood: 'happy' },
    },
  },
  ranger: {
    entries: [
      { cond: [{ outfit: 'ranger_hat' }], node: 'hat' },
      { cond: [{ questActive: 'trash_job' }, { hasItem: 'litter', count: 5 }], node: 'deliver' },
      { cond: [{ questActive: 'trash_job' }], node: 'working' },
      { cond: [{ questCompleted: 'disguise' }], node: 'offer' },
      { node: 'hello' },
    ],
    nodes: {
      hello: { text: 'やあ。さいきん ごはんを ぬすむ どうぶつが でるらしい。みかけたら おしえてくれ。', choices: [BYE] },
      hat: { text: 'ん？ その ぼうし… わしの ぼうしに そっくり だな…？', choices: [{ text: 'き、きのせい だよ', next: 'bye' }] },
      bye: { text: 'ふーむ…。', choices: [] },
      offer: { text: 'やあ、ちいさな キャンパーさん。たのみが あるんだが、キャンプじょうに おちている ゴミを 5こ ひろって きてくれないか？ おれいは するよ。', choices: [{ text: 'まかせて！', effects: [{ startQuest: 'trash_job' }, { spawnLitter: true }], next: 'accepted' }, { text: 'いまは いいや' }] },
      accepted: { text: 'たすかるよ！ ひろった ゴミは わしに わたしてくれ。', choices: [BYE] },
      working: { text: 'ゴミは 5こ たのむよ。ベンチの そばや みちばたに おちているはずだ。', choices: [BYE] },
      deliver: { text: 'おお、ゴミを あつめて くれたのか！', choices: [{ text: 'ゴミを わたす', effects: [{ give: 'litter', count: 5 }], next: 'paid' }, BYE] },
      paid: { text: 'ありがとう！ これは おれいだ。また たのむよ。', choices: [BYE], mood: 'happy' },
    },
  },
  shop: {
    entries: [{ node: 'hello' }],
    nodes: {
      hello: { text: 'いらっしゃい！ ちいさな おきゃくさん。なにに する？', choices: [{ text: 'かいもの', effects: [{ openShop: 'buy' }] }, { text: 'うりたい', effects: [{ openShop: 'sell' }] }, { text: 'さようなら' }] },
    },
  },
  fisher: {
    entries: [
      { cond: [{ questActive: 'fisher_pupil' }, { any: [{ hasItem: 'fish' }, { hasItem: 'big_fish' }] }], node: 'show' },
      { cond: [{ questActive: 'fisher_pupil' }], node: 'tips' },
      { cond: [{ questCompleted: 'fisher_pupil' }], node: 'master' },
      { node: 'hello' },
    ],
    nodes: {
      hello: { text: 'おや、めずらしい おきゃくさんだ。つりは いいぞぉ。こころが しずかに なる。', choices: [{ text: 'つりを おしえて！', effects: [{ startQuest: 'fisher_pupil' }], next: 'teach' }, BYE] },
      teach: { text: 'よしよし。つりざおは ばいてんで うっておる。さんばしの さきで いとを たらして、うきが しずんだら すかさず あげるんじゃ。', choices: [BYE] },
      tips: { text: 'うきが ピクッと しずんだ しゅんかんが しょうぶじゃ。あせらず まつのが コツだよ。', choices: [BYE] },
      show: { text: 'おお、つれたか！ どれ、みせて ごらん。', choices: [
        { text: 'さかなを みせる', cond: [{ hasItem: 'fish' }], effects: [{ give: 'fish' }], next: 'praise' },
        { text: 'おおきな さかなを みせる', cond: [{ hasItem: 'big_fish' }], effects: [{ give: 'big_fish' }], next: 'praise' },
        BYE] },
      praise: { text: 'みごとな もんじゃ！ きょうから きみは わしの でしだ。この ぼうしを あげよう。', choices: [BYE], mood: 'happy' },
      master: { text: 'わしの でしよ、きょうも おおものを ねらえ！ さかなは ばいてんで たかく うれるぞ。', choices: [BYE], mood: 'happy' },
    },
  },
  camper: {
    entries: [{ node: 'hello' }],
    nodes: {
      hello: { text: 'よう！ いい おとだろ？ この ギター。', choices: [{ text: 'なにか おもしろい はなし ある？', next: 'rumor' }, BYE] },
      rumor: { text: 'レンジャーの ガンさん、こやの つくえで よく いねむり してるんだぜ。それと… ほくとうの もりに むかしの おたからが うまってる って うわさだ。ばいてんに ちずが あったかな。', choices: [BYE] },
    },
  },
};

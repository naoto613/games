/*
 * ステージデータ（ゲームルールのデータ部分）
 * 画面コンポーネントからは独立させ、ステージを増やすときはこの形式でオブジェクトを追加する。
 * 座標は町の観察エリアに対する 0〜100 の相対値（x: 横, y: 縦）。
 */
(function (root) {
  'use strict';
  const OY = (root.OY = root.OY || {});

  OY.STAGES = OY.STAGES || {};

  OY.STAGES.s1 = {
    id: 's1',
    name: '商店街の小さな演奏会',
    intro: [
      {
        title: 'ある日の横丁',
        body: [
          'パン屋のマルは、新作パンを誰かに知ってほしい。',
          '子どものココは、退屈でしかたがない。',
          '演奏家のネネは、聴いてくれる人がいなくて落ちこんでいる。',
          'あなたは横丁を見守る、ちょっとおせっかいな存在。住人に命令はできないけれど、物を使って「きっかけ」を与えることはできる。'
        ]
      },
      {
        title: '遊びかた',
        body: [
          '① 住人や場所をタップすると、ようすを観察できる。',
          '② 下のアイテムを選ぶと、使える相手が光る。',
          '③ 光っている相手をタップすると、アイテムを使う。',
          'きっかけが連鎖して、広場に「小さな演奏会」が開かれたらクリア！'
        ]
      }
    ],

    // 背景の飾り（タップ不可）
    decor: [
      { type: 'sky', x: 0, y: 0, w: 100, h: 36 },
      { type: 'ground', x: 0, y: 33, w: 100, h: 67 },
      { type: 'shop', x: 54, y: 7, w: 43, h: 25, label: '古道具 ふくろう' },
      { type: 'bunting', x: 0, y: 4, w: 100, h: 6 },
      { type: 'tree', x: 1, y: 56, w: 15, h: 17 },
      { type: 'tree', x: 84, y: 76, w: 15, h: 17 },
      { type: 'lamp', x: 47, y: 25, w: 4, h: 16 },
      { type: 'lamp', x: 47, y: 72, w: 4, h: 16 },
      { type: 'stand', x: 77, y: 40, w: 8, h: 11 },
      { type: 'table', x: 36, y: 39, w: 13, h: 6 },
      { type: 'flowers', x: 60, y: 86, w: 20, h: 6 }
    ],

    locations: [
      {
        id: 'LOC-01',
        name: 'パン屋',
        zone: { x: 3, y: 6, w: 44, h: 28 },
        art: 'bakery',
        sign: 'マルのパン',
        description: '焼きたての香りがする小さなパン屋。店先には「本日 新作」の札が出ている。'
      },
      {
        id: 'LOC-02',
        name: 'ベンチ',
        zone: { x: 5, y: 78, w: 36, h: 12 },
        art: 'bench',
        description: '木陰のベンチ。風船売りが置いていった風船が一つ、結んである。'
      },
      {
        id: 'LOC-03',
        name: '広場',
        zone: { x: 26, y: 38, w: 70, h: 33 },
        art: 'square',
        description: '横丁の真ん中の石畳の広場。小さな舞台もあるのに、今日はがらんとしている。'
      }
    ],

    characters: [
      {
        id: 'CH-01',
        name: 'マル',
        role: 'パン屋の店主',
        avatar: '👨‍🍳',
        locationId: 'LOC-01',
        state: 'waiting',
        goal: '新作パンを誰かに知ってもらいたい',
        personality: '真面目だが宣伝が苦手',
        slots: { 'LOC-01': { x: 21, y: 40 }, 'LOC-03': { x: 82, y: 61 } },
        states: {
          waiting: {
            mood: '😔',
            label: 'しょんぼり',
            observe: '店の前で新作パンを並べている。でも、通りには誰もいない。',
            lines: ['新作なんだけどなあ……見てもらえないなあ', '呼びこみ？ む、無理無理……']
          },
          interested: {
            mood: '❗',
            label: '気になる',
            observe: '広場のほうを、しきりに気にしている。',
            lines: ['おや？ 広場から音が……']
          },
          at_square: {
            mood: '😳',
            label: 'そわそわ',
            observe: '広場に来たものの、手ぶらでそわそわしている。新作パンは店に置いてきてしまったらしい。',
            lines: ['しまった、パンを店に置いてきちゃった……', '人は集まってるのに、見せるパンがない……']
          },
          showing_bread: {
            mood: '😄',
            label: 'にこにこ',
            observe: '新作パンを高く掲げて、みんなに紹介している。',
            lines: ['焼きたての「横丁クロワッサン」、いかがですか！']
          }
        }
      },
      {
        id: 'CH-02',
        name: 'ココ',
        role: '子ども',
        avatar: '🧒',
        locationId: 'LOC-02',
        state: 'bored',
        goal: '退屈を解消したい',
        personality: '好奇心旺盛で気が散りやすい',
        slots: { 'LOC-02': { x: 33, y: 77 }, 'LOC-03': { x: 40, y: 58 } },
        states: {
          bored: {
            mood: '😑',
            label: 'たいくつ',
            observe: 'ベンチで足をぶらぶらさせている。すぐそばに風船が結んであるのに、気づいていないようだ。',
            lines: ['なにか面白いことないかな', 'ひまだなあ……']
          },
          curious: {
            mood: '✨',
            label: 'わくわく',
            observe: '風船を握りしめて、目を輝かせている。',
            lines: ['もっと広いところで飛ばしたい！']
          },
          moving_to_square: {
            mood: '💨',
            label: 'かけあし',
            observe: '風船を持って走っている。',
            lines: ['広場まで競争だー！']
          },
          playing: {
            mood: '😆',
            label: 'あそび中',
            observe: '広場で風船を追いかけて、けらけら笑っている。',
            lines: ['見て見て！ 風船、高く上がった！', 'あはは、まてまてー！']
          }
        }
      },
      {
        id: 'CH-03',
        name: 'ネネ',
        role: '演奏家',
        avatar: '👩‍🎤',
        prop: '🎻',
        locationId: 'LOC-03',
        state: 'discouraged',
        goal: '演奏を誰かに聴いてほしい',
        personality: '音楽好きだが少し自信がない',
        slots: { 'LOC-03': { x: 63, y: 46 } },
        states: {
          discouraged: {
            mood: '😞',
            label: 'しょんぼり',
            observe: 'バイオリンを抱えたまま、うつむいている。譜面台の楽譜は風で落ちてしまったようだ。',
            lines: ['誰も聴いていないし、今日はもう帰ろうかな', '……弾いても、ね']
          },
          encouraged: {
            mood: '🙂',
            label: 'やる気',
            observe: 'ココの笑い声に顔を上げた。弾きたい曲の楽譜を探して、きょろきょろしている。',
            lines: ['あの子のために一曲……あれ、楽譜どこだっけ？']
          },
          playing_music: {
            mood: '🎶',
            label: '演奏中',
            observe: '楽しそうにワルツを弾いている。音が横丁じゅうに響く。',
            lines: ['♪ラララ〜 横丁のワルツ〜', '聴いてくれて、ありがとう！']
          }
        }
      }
    ],

    items: [
      {
        id: 'IT-01',
        name: '風船',
        icon: '🎈',
        locationId: 'LOC-02',
        pos: { x: 10, y: 69 },
        used: false,
        description: 'ベンチに結ばれた赤い風船。ふわふわ揺れている。'
      },
      {
        id: 'IT-02',
        name: '楽譜',
        icon: '🎼',
        locationId: 'LOC-03',
        pos: { x: 89, y: 47 },
        used: false,
        description: '譜面台から落ちた楽譜。「横丁のワルツ」と書いてある。'
      },
      {
        id: 'IT-03',
        name: '新作パン',
        icon: '🥐',
        locationId: 'LOC-01',
        pos: { x: 41, y: 40 },
        used: false,
        description: '店先に並んだ新作「横丁クロワッサン」。甘くて香ばしい匂いがする。'
      }
    ],

    /*
     * イベント定義
     *  kind: 'intervention' … プレイヤーの介入で発生
     *        'chain'        … 状態が揃うと自動で発生（定義順に評価）
     *  condition.require / condition.all の各要素:
     *        { characterId, state?: [..], locationId? } または { itemUsed: id } または { event: id }
     */
    events: [
      {
        id: 'EV-001',
        kind: 'intervention',
        title: 'ココと風船',
        condition: {
          type: 'item_on_character',
          itemId: 'IT-01',
          characterId: 'CH-02',
          characterState: ['bored', 'curious']
        },
        effects: [
          { type: 'use_item', itemId: 'IT-01', holderId: 'CH-02' },
          { type: 'set_character_state', characterId: 'CH-02', state: 'curious' }
        ],
        message: 'ココの目がキラッとした！',
        speaker: 'CH-02',
        line: 'わあ、風船だ！ もっと広いところで飛ばしたい！',
        once: true
      },
      {
        id: 'EV-002',
        kind: 'chain',
        condition: { type: 'state', all: [{ characterId: 'CH-02', state: ['curious'] }] },
        effects: [
          { type: 'set_character_state', characterId: 'CH-02', state: 'moving_to_square' },
          { type: 'move_character', characterId: 'CH-02', locationId: 'LOC-03' }
        ],
        message: 'ココは広場へ走っていった',
        speaker: 'CH-02',
        line: '広場まで競争だー！',
        once: true
      },
      {
        id: 'EV-003',
        kind: 'chain',
        condition: {
          type: 'state',
          all: [{ characterId: 'CH-02', state: ['moving_to_square'], locationId: 'LOC-03' }]
        },
        effects: [{ type: 'set_character_state', characterId: 'CH-02', state: 'playing' }],
        message: '風船遊びが始まった',
        speaker: 'CH-02',
        line: 'それーっ！ まてまてー！',
        once: true
      },
      {
        id: 'EV-004',
        kind: 'chain',
        condition: {
          type: 'state',
          all: [
            { characterId: 'CH-02', state: ['playing'] },
            { characterId: 'CH-03', state: ['discouraged'] }
          ]
        },
        effects: [{ type: 'set_character_state', characterId: 'CH-03', state: 'encouraged' }],
        message: 'ネネは子どもの笑い声に気づいた',
        speaker: 'CH-03',
        line: 'あの子、楽しそう……。一曲だけ弾いてみようかな。でも、楽譜はどこ？',
        once: true
      },
      {
        id: 'EV-005',
        kind: 'intervention',
        title: 'ネネと楽譜',
        condition: {
          type: 'item_on_character',
          itemId: 'IT-02',
          characterId: 'CH-03',
          characterState: ['encouraged']
        },
        effects: [
          { type: 'use_item', itemId: 'IT-02', holderId: 'CH-03' },
          { type: 'set_character_state', characterId: 'CH-03', state: 'playing_music' }
        ],
        message: 'ネネはもう一曲演奏することにした',
        speaker: 'CH-03',
        line: 'あった、わたしの楽譜！ 聴いてね、「横丁のワルツ」',
        once: true
      },
      {
        id: 'EV-006',
        kind: 'chain',
        condition: {
          type: 'state',
          all: [
            { characterId: 'CH-03', state: ['playing_music'] },
            { characterId: 'CH-01', state: ['waiting'] }
          ]
        },
        effects: [{ type: 'set_character_state', characterId: 'CH-01', state: 'interested' }],
        message: 'マルは広場の音に気づいた',
        speaker: 'CH-01',
        line: 'おや、いい音……。広場に人がいるのかな？',
        once: true
      },
      {
        id: 'EV-007',
        kind: 'chain',
        condition: { type: 'state', all: [{ characterId: 'CH-01', state: ['interested'] }] },
        effects: [
          { type: 'set_character_state', characterId: 'CH-01', state: 'at_square' },
          { type: 'move_character', characterId: 'CH-01', locationId: 'LOC-03' }
        ],
        message: 'マルは音につられて広場へ向かった',
        speaker: 'CH-01',
        line: 'しまった、新作パンを店に置いてきちゃった……',
        once: true
      },
      // 新作パンの紹介には、いくつかのきっかけがある（どれか1つで成立）
      {
        id: 'EV-009',
        kind: 'intervention',
        title: 'マルの勇気',
        route: 'self',
        condition: {
          type: 'item_on_character',
          itemId: 'IT-03',
          characterId: 'CH-01',
          characterState: ['at_square']
        },
        effects: [
          { type: 'use_item', itemId: 'IT-03', holderId: 'CH-01' },
          { type: 'set_character_state', characterId: 'CH-01', state: 'showing_bread' }
        ],
        message: 'マルは深呼吸して、新作パンを高く掲げた',
        speaker: 'CH-01',
        line: 'み、みなさん！ 焼きたての「横丁クロワッサン」です！',
        once: true
      },
      {
        id: 'EV-010',
        kind: 'intervention',
        title: 'ココの「おいしい！」',
        route: 'coco',
        condition: {
          type: 'item_on_character',
          itemId: 'IT-03',
          characterId: 'CH-02',
          characterState: ['playing'],
          require: [{ characterId: 'CH-01', state: ['at_square'] }]
        },
        effects: [
          { type: 'use_item', itemId: 'IT-03', holderId: 'CH-01' },
          { type: 'set_character_state', characterId: 'CH-01', state: 'showing_bread' }
        ],
        message: 'ココの「おいしい！」の声に、マルの背中が押された',
        speaker: 'CH-02',
        line: 'このパン、さくさくでおいしい！ ねえ、どこのパン？',
        once: true
      },
      {
        id: 'EV-011',
        kind: 'intervention',
        title: 'パンの歌',
        route: 'nene',
        condition: {
          type: 'item_on_character',
          itemId: 'IT-03',
          characterId: 'CH-03',
          characterState: ['playing_music'],
          require: [{ characterId: 'CH-01', state: ['at_square'] }]
        },
        effects: [
          { type: 'use_item', itemId: 'IT-03', holderId: 'CH-01' },
          { type: 'set_character_state', characterId: 'CH-01', state: 'showing_bread' }
        ],
        message: 'ネネは香りにつられて、曲を「パンの歌」にアレンジした',
        speaker: 'CH-03',
        line: '♪さくさく〜 横丁の〜 焼きたてクロワッサン〜♪',
        once: true
      },
      {
        id: 'EV-012',
        kind: 'intervention',
        title: '広場に広がる香り',
        route: 'square',
        condition: {
          type: 'item_on_location',
          itemId: 'IT-03',
          locationId: 'LOC-03',
          require: [{ characterId: 'CH-01', state: ['at_square'] }]
        },
        effects: [
          { type: 'use_item', itemId: 'IT-03', holderId: 'CH-01' },
          { type: 'set_character_state', characterId: 'CH-01', state: 'showing_bread' }
        ],
        message: '焼きたての香りが広場に広がり、みんながマルを振り返った',
        speaker: 'CH-01',
        line: 'あ、えっと……し、新作です！ 横丁クロワッサン！',
        once: true
      },
      {
        id: 'EV-008',
        kind: 'chain',
        final: true,
        condition: {
          type: 'state',
          all: [
            { characterId: 'CH-02', state: ['playing'], locationId: 'LOC-03' },
            { characterId: 'CH-03', state: ['playing_music'] },
            { characterId: 'CH-01', state: ['showing_bread'], locationId: 'LOC-03' }
          ]
        },
        effects: [{ type: 'clear_stage' }],
        message: '小さな演奏会が始まった！',
        once: true
      }
    ],

    /*
     * 不成立時のリアクション（状態は変えない）
     *  上から順に評価し、最初に合ったものを使う。
     *  title があるものは「見つけた反応」として数える。
     */
    reactions: [
      { id: 'RE-01', itemId: 'IT-01', targetId: 'CH-01', title: '値札になる風船',
        lines: ['マルは風船を見て、値札に使えないか考えている', 'マル「風船に『新作あります』って書いたら……いや、恥ずかしいな」'] },
      { id: 'RE-02', itemId: 'IT-01', targetId: 'CH-03', title: '見上げる風船',
        lines: ['ネネは風船をぼんやり見上げた。「子どもなら喜びそうね」', 'ネネ「わたしより、元気な子に渡してあげて」'] },
      { id: 'RE-03', itemId: 'IT-01', targetId: 'LOC-03', title: '漂う風船',
        lines: ['風船が広場の上をふわふわ漂う。でも、見上げる人はいない'] },
      { id: 'RE-04', itemId: 'IT-01', targetId: 'LOC-01', title: '看板と風船',
        lines: ['パン屋の看板に風船を寄せてみた。マルが照れくさそうに目をそらした'] },
      { id: 'RE-05', itemId: 'IT-01', targetId: 'LOC-02',
        lines: ['風船はベンチに結ばれたまま、ゆらゆら揺れている'] },

      { id: 'RE-06', itemId: 'IT-02', targetId: 'CH-02', title: '逆さまの楽譜',
        lines: ['ココは楽譜を逆さまに眺めている', 'ココ「おたまじゃくしがいっぱい！ ……読めない」'] },
      { id: 'RE-07', itemId: 'IT-02', targetId: 'CH-01', title: 'レシピじゃない',
        lines: ['マル「楽譜？ パンのレシピなら読めるんだけど……」'] },
      { id: 'RE-08', itemId: 'IT-02', targetId: 'CH-03', when: { state: ['discouraged'] }, title: 'ため息の楽譜',
        lines: ['ネネは楽譜を見つめ、ため息をついた。「聴いてくれる人がいればね……」', 'ネネ「弾いても、誰も足を止めないもの」'] },
      { id: 'RE-09', itemId: 'IT-02', targetId: 'LOC-03', title: 'めくれる楽譜',
        lines: ['楽譜が風にめくられて、ネネがちらりとこちらを見た'] },

      { id: 'RE-10', itemId: 'IT-03', targetId: 'CH-01', when: { state: ['waiting', 'interested'] }, title: '並べ直すパン',
        lines: ['マルはパンを並べ直した。「通りに誰もいないんじゃなあ……」', 'マル「味には自信があるんだけど……」'] },
      { id: 'RE-11', itemId: 'IT-03', targetId: 'CH-02', when: { state: ['bored', 'curious', 'moving_to_square'] }, title: 'くんくん',
        lines: ['ココはパンの匂いをくんくん。「おいしそう。でも、いまは遊びたい気分！」'] },
      { id: 'RE-12', itemId: 'IT-03', targetId: 'CH-02', when: { state: ['playing'] }, title: 'あとで食べる',
        lines: ['ココ「パン？ あとで食べる！ いまは風船！」'] },
      { id: 'RE-13', itemId: 'IT-03', targetId: 'CH-03', when: { state: ['discouraged', 'encouraged'] }, title: 'パンの香り',
        lines: ['ネネはパンの香りに気づいた。でも、今は演奏が気になっているようだ'] },
      { id: 'RE-14', itemId: 'IT-03', targetId: 'LOC-03', title: '空っぽの広場に香り',
        lines: ['パンの香りが広場に広がった。……でも、パンを紹介する人がいない'] },
      { id: 'RE-15', itemId: 'IT-03', targetId: 'LOC-01',
        lines: ['パンを店先に戻した。マルの店は今日も静かだ'] }
    ],

    // 介入の手がかり（操作ガイドに表示）。上から最初に合ったものを使う。
    hints: [
      { all: [{ characterId: 'CH-02', state: ['bored'] }],
        soft: '退屈そうなココ。そばに、気を引くものはないかな？',
        direct: '風船を選んで、ココに渡してみよう' },
      { all: [{ characterId: 'CH-03', state: ['encouraged'] }],
        soft: 'ネネはやる気が出てきた。でも、何かを探しているみたい',
        direct: '楽譜を選んで、ネネに渡してみよう' },
      { all: [{ characterId: 'CH-01', state: ['at_square'] }],
        soft: 'マルは広場に来たけれど、手ぶらでそわそわしている',
        direct: '新作パンを選んで、マル（またはココ・ネネ・広場）に使ってみよう' }
    ],

    objectives: [
      { text: 'ココが広場で風船遊びを始める', all: [{ characterId: 'CH-02', state: ['playing'], locationId: 'LOC-03' }] },
      { text: 'ネネが演奏を始める', all: [{ characterId: 'CH-03', state: ['playing_music'] }] },
      { text: 'マルが広場で新作パンを紹介する', all: [{ characterId: 'CH-01', state: ['showing_bread'], locationId: 'LOC-03' }] },
      { text: '「小さな演奏会」が開かれる', all: [{ event: 'EV-008' }] }
    ],

    ending: {
      base: '風船を追いかける笑い声、もう一曲のワルツ、焼きたてのクロワッサン。誰に命令されたわけでもない小さなきっかけが連なって、静かな横丁に小さな演奏会が開かれた。',
      routes: {
        self: 'マルは自分の声で、はじめて新作を紹介できた。明日は、もう少し大きな声が出せそうだ。',
        coco: 'ココの「おいしい！」が、いちばんの宣伝になった。子どもの正直な声には、かなわない。',
        nene: 'ネネの即興「パンの歌」は、横丁の新しい名物になりそうだ。',
        square: '焼きたての香りに背中を押されて、マルは広場で声を上げた。'
      }
    }
  };
})(typeof window !== 'undefined' ? window : globalThis);

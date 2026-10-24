// フィールド（区域）の定義。地形・出入口・人物・調査対象・イベントをデータとして持つ。
import { S, N, SET, REC, ITEM, Q, IF, W, TOAST, EXP, SOUND, type Cmd, type Talk } from './script';

export interface Warp { x: number; y: number; to: string; tx: number; ty: number; dir?: 0 | 1 | 2 | 3; cond?: string; blocked?: string }
export interface NpcDef { id: string; name: string; x: number; y: number; sprite: string; dir?: 0 | 1 | 2 | 3; cond?: string; talk: Talk[] }
export interface ObjDef {
  id: string;
  x: number;
  y: number;
  kind: 'inspect' | 'chest' | 'enemy' | 'bed';
  cond?: string;
  /** 観測で見つける隠しもの（条件を満たすまで見えない・調べられない） */
  hiddenCond?: string;
  talk?: Talk[];
  item?: string;
  n?: number;
  battle?: string;
  /** 倒しても区域に入り直すと復活する */
  respawn?: boolean;
  sprite?: string;
  label?: string;
}
export interface PatchDef { cond: string; tiles: [number, number, string][] }
export interface MapDef {
  id: string;
  name: string;
  theme: 'archive' | 'town' | 'home' | 'corridor' | 'tower' | 'top' | 'east';
  bgm: string;
  tiles: string[];
  warps: Warp[];
  npcs: NpcDef[];
  objs: ObjDef[];
  patches?: PatchDef[];
  onEnter?: Talk[];
  /** 夜の色かぶせ */
  night?: string;
}

// ---------- 地形づくりの道具 ----------

type G = string[][];
const grid = (w: number, h: number, ch: string): G => Array.from({ length: h }, () => Array.from({ length: w }, () => ch));
const rect = (g: G, x: number, y: number, w: number, h: number, ch: string) => {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (g[j] && g[j][i] !== undefined) g[j][i] = ch;
};
const put = (g: G, x: number, y: number, ch: string) => { if (g[y] && g[y][x] !== undefined) g[y][x] = ch; };
const border = (g: G, ch: string) => {
  const h = g.length, w = g[0].length;
  rect(g, 0, 0, w, 1, ch); rect(g, 0, h - 1, w, 1, ch); rect(g, 0, 0, 1, h, ch); rect(g, w - 1, 0, 1, h, ch);
};
/** 屋根（上）と壁（下2段）の建物。door は左端からの位置 */
const building = (g: G, x: number, y: number, w: number, h: number, door?: number) => {
  rect(g, x, y, w, h - 2, 'R');
  rect(g, x, y + h - 2, w, 2, 'B');
  for (let i = 1; i < w - 1; i += 2) put(g, x + i, y + h - 2, 'W');
  if (door !== undefined) put(g, x + door, y + h - 1, 'D');
};
const rows = (g: G) => g.map(r => r.join(''));

// ---------- 共通のイベント断片 ----------

const MQ1_CHECK = IF('q:mq1=1 & r:r_bell_log & r:r_repair & r:r_diary & r:r_work', [
  Q('mq1', 2),
  N('4つの記録が揃った。ヘルドの机か、メニューの「記録」→「仮説」から仮説を立てられる。'),
]);

const PROLOGUE_CHECK = IF('q:mq0=1 & r:r_dishes & r:r_note & r:r_neighbor', [
  N('——遠くで、何かが「欠けた」音がした。'),
  N('記録保管所の方角だ。'),
  SET('corridor_open'),
  Q('mq0', 2),
  S('セイル', '保管所……？ 行ってみよう'),
]);

const BR_CHECK = IF('q:sq1=1 & r:r_br_receipt & r:r_br_diary & r:r_br_pillar', [
  Q('sq1', 2),
  N('橋があった証拠は揃った。……だが、橋が「ない」ことを示す記録もあるかもしれない。記録保管所のヘルドに聞いてみよう。'),
]);

const FL_CHECK = IF('q:sq2=1 & r:r_fl_order & r:r_fl_grave & r:r_fl_rumor | q:sq2=1 & r:r_fl_order & r:r_fl_grave & r:r_dran_memory', [
  Q('sq2', 2),
  N('ネリの朝の理由を、献花台で一つの原因として認められそうだ。'),
]);

const DRAN_MEM: Cmd[] = [
  S('ドラン', '……白い花。胸に白い花を挿した、背の高い男がいた。俺は……そいつを守れなかった'),
  S('ドラン', '名前が出てこない。顔も霞んでる。だが、守れなかったことだけは覚えてる'),
  REC('r_dran_memory'),
];

const GATE_DONE: Cmd[] = [Q('mq1', 99), Q('mq2', 1), EXP(60), { t: 'sp', n: 1 }, TOAST('鐘楼に入れるようになった'), { t: 'save' }];

const HYPOTHESIS: Cmd = {
  t: 'puzzle', id: 'p_town',
  out: {
    o_solved: [
      S('セイル', '鐘の音と住人の行動の因果は切れている。それなのに住人は動いている'),
      S('セイル', '……鐘の代わりに、何かが住人を動かしている。そして失われた原因は、鐘楼の中にある'),
      S('ヘルド', '鐘楼か。門番のガルトは頑固だぞ。……だが、記録は嘘をつかない。行ってきなさい'),
      SET('hypo_done'), Q('mq1', 3), EXP(30),
      N('鐘楼の門を調べてみよう。'),
    ],
  },
  cancel: [S('ヘルド', '焦ることはない。記録は逃げないよ')],
};

const MINA: Cmd[] = [
  { t: 'warp', map: 'town', x: 16, y: 9, dir: 0 },
  N('鐘楼を降りると、門の前に見知らぬ女性が立っていた。'),
  S('ミナ', 'あなたが編纂士ね。私はミナ。逆流林から来たの'),
  S('ミナ', 'この街の因果が書き換わるのを、森から「先に」見ていた。あそこでは、結果の方が原因より先に届くから'),
  IF('f:end_share', [S('ミナ', '……矛盾を抱えたまま直したのね。私には、できなかったやり方')]),
  IF('f:end_bell', [S('ミナ', '正しい形に戻した。ええ、それが一番、矛盾が少ない。……正しいかどうかは、別だけど')]),
  IF('f:end_free', [S('ミナ', '縛りを解いた。でも、ほどけた糸はどこかで別の矛盾になる。それは覚えておいて')]),
  IF('f:end_keep', [S('ミナ', '何も変えなかったのね。……昔の私と、同じ選択')]),
  S('ミナ', 'イオラ——あなたのお母さんの名前を、森の記録で見たことがある。世界簿の底へ向かうなら、逆流林を通ることになるわ'),
  S('ミナ', 'また会いましょう。……森では、先に「また会った」結果が見えるから'),
  N('ミナは、まだ起きていない足跡をたどるように去っていった。'),
];

const CH_END: Cmd[] = [
  Q('mq3', 99), EXP(150), { t: 'heal' },
  ...MINA,
  SET('chapter1_done'),
  { t: 'summary' },
  { t: 'end' },
  { t: 'save' },
];

const END_A: Cmd[] = [
  SOUND('bell'), { t: 'flash' },
  N('鐘が鳴った。三日ぶりに——いや、数百年ぶりに、本物の音で。'),
  N('街じゅうの窓が一斉に開く。住人たちは鐘の音に背中を押されるように、いつもの朝を始めた。'),
  S('トワ', '……あれ。わたし、どうしてここに'),
  S('セイル', '君は、ずっと街の朝を支えていたんだ'),
  S('トワ', '……そっか。じゃあ、これからはちゃんと起きて、鐘を撞くね。それが鐘守の役目だもの'),
  N('トワは笑った。けれどその笑顔は、少しだけ、決められた形をしていた。'),
  W('stability', 20), W('restore', 2), W('repaired', 1), SET('end_bell'),
  ...CH_END,
];
const END_B: Cmd[] = [
  N('鐘は鳴らない。代わりに、街のあちこちで、ばらばらの時間に窓が開いた。'),
  N('六時に起きる者。七時まで眠る者。夜明け前から歩き出す者。'),
  S('トワ', '……ん。……朝？ わたし、鐘楼にいる……どうして？'),
  S('セイル', 'もう、君が街を動かさなくていいんだ'),
  S('トワ', '……じゃあ、わたし、海が見たい。ずっと鐘楼の窓からしか、見たことがなかったの'),
  N('街の歩調は乱れた。けれど、誰かの意志が勝手に使われることは、もうない。'),
  W('stability', -10), W('free', 2), W('repaired', 1), SET('end_free'),
  ...CH_END,
];
const END_C: Cmd[] = [
  SOUND('bell'), { t: 'flash' },
  N('鐘が鳴った。けれどそれは、命令ではなかった。'),
  N('「朝が来たよ」——その知らせを受け取って、住人たちはそれぞれの理由で一日を始める。パンを焼く者、花を供える者、もう少し眠る者。'),
  S('トワ', '……鐘の音、きれい。ねえ、明日はわたしが撞いてもいい？ 撞きたいから撞くの'),
  S('セイル', 'ああ。君が撞きたい朝に'),
  IF('p:dran', [S('ドラン', '命令じゃなく合図、か。……戦場のラッパも、そうだったらよかったんだがな')]),
  N('鐘の音と、ばらばらの朝。矛盾しているはずの二つが、同じ街に並んでいた。'),
  N('鐘の内側の世界簿の断片が、かすかに震えた。そういう書き方もあるのか、と驚いたように。'),
  W('stability', 10), W('keep', 2), W('repaired', 2), SET('end_share'),
  ITEM('bookmark'), N('鐘の内側から「余白の栞」が見つかった。'),
  ...CH_END,
];
const END_D: Cmd[] = [
  N('セイルは、何も変えなかった。'),
  N('翌朝も街は六時ちょうどに動き出し、トワは眠ったまま鐘楼に登り、音のない鐘を撞いた。'),
  IF('p:dran', [
    S('ドラン', '……それがお前さんの答えか'),
    S('セイル', '街が崩れるよりは、と思ったんです'),
    S('ドラン', 'そうか。……俺は、あのガキの寝顔を忘れんぞ'),
  ]),
  N('街は完全に安定した。安定しすぎるほどに。'),
  W('stability', 25), W('trust', -10), W('restore', 1), SET('end_keep'),
  ...CH_END,
];

const MORNING_PUZZLE: Cmd = {
  t: 'puzzle', id: 'p_morning',
  out: { o_share: END_C, o_bell: END_A, o_free: END_B, o_keep: END_D },
  cancel: [N('（決めるのは今でなくてもいい。鐘を調べれば、もう一度考えられる）')],
};

const KING_BATTLE: Cmd = { t: 'battle', id: 'b_king', win: [
      N('沈黙の王は砕け、腕に抱えていた鐘の舌が床に転がった。'),
      ITEM('clapper'), SET('king_beaten'), Q('mq2', 99), { t: 'sp', n: 1 },
      S('トワ', '……ん……'),
      N('トワはまだ眠っている。けれど、その腕は止まっていた。'),
      S('セイル', '（鐘の舌はここにある。トワの意志は、まだ街に繋がれている。……どうする）'),
      Q('mq3', 1), { t: 'margin', n: 'full' },
      N('余白が満ちた。世界の未確定が、この場所に集まっている。'),
      MORNING_PUZZLE,
    ] };


/** 章の結末ごとに台詞を変える */
const endLines = (who: string, lines: { bell: string; free: string; share: string; keep: string }): Talk => ({
  cond: 'f:chapter1_done',
  ev: [
    IF('f:end_bell', [S(who, lines.bell)]),
    IF('f:end_free', [S(who, lines.free)]),
    IF('f:end_share', [S(who, lines.share)]),
    IF('f:end_keep', [S(who, lines.keep)]),
  ],
});

// ---------- 記録保管所 ----------

function archiveTiles(): string[] {
  const g = grid(20, 14, '.');
  border(g, '#');
  rect(g, 1, 1, 18, 1, '=');
  for (const y of [6, 11]) { rect(g, 1, y, 18, 1, '='); for (const x of [2, 6, 10, 11, 15, 18]) put(g, x, y, '.'); }
  rect(g, 2, 3, 2, 1, 'T'); rect(g, 5, 3, 2, 1, 'T');
  rect(g, 14, 3, 3, 1, 'c');
  rect(g, 2, 8, 6, 2, 'r');
  put(g, 13, 9, 'T'); put(g, 15, 9, 'T');
  put(g, 9, 13, 'D'); put(g, 10, 13, 'D');
  return rows(g);
}

const ARCHIVE: MapDef = {
  id: 'archive', name: '記録保管所', theme: 'archive', bgm: 'archive', night: '!f:chapter1',
  tiles: archiveTiles(),
  warps: [
    { x: 9, y: 13, to: 'town', tx: 5, ty: 6, dir: 2 },
    { x: 10, y: 13, to: 'town', tx: 5, ty: 6, dir: 2 },
    { x: 10, y: 1, to: 'corridor', tx: 3, ty: 6, dir: 1, cond: 'f:corridor_open' },
  ],
  patches: [{ cond: 'f:corridor_open', tiles: [[10, 1, 'V']] }],
  npcs: [
    {
      id: 'held', name: 'ヘルド', x: 15, y: 2, sprite: 'held', dir: 2,
      talk: [
        { cond: '!f:chapter1 & !r:r_death', ev: [
          S('ヘルド', 'まだ残っていたのか、セイル。第三区の死亡記録の整理なら明日でいい'),
          S('ヘルド', '……いや、お前は言っても聞かんな。左奥の棚だ。終わったら灯りを落としていけ'),
        ] },
        { cond: '!f:chapter1 & !f:corridor_open', ev: [
          S('ヘルド', 'イオラ？ ……聞かん名だな。お前は十年前から一人で暮らしているだろう。私が身元引受人になったのを忘れたか'),
          S('セイル', '（昨日、母さんと夕食を食べた。……そのはずだ）'),
          S('ヘルド', '顔色が悪い。今日はもう帰れ。家はすぐそこだろう'),
        ] },
        { cond: '!f:chapter1', ev: [
          S('ヘルド', '……なんだ、あの棚は。あそこに通路などなかったはずだ'),
          S('ヘルド', '記録にない場所には、記録にないものがいる。気をつけろ、セイル'),
          IF('!f:held_potion', [ITEM('potion', 2), SET('held_potion'), N('回復薬を2つ受け取った。')]),
        ] },
        { cond: 'q:sq1=2 & !r:r_br_collapse', ev: [
          S('ヘルド', '運河の橋？ 公文書では百年前に崩落している。……ほら、この記録だ'),
          REC('r_br_collapse'), Q('sq1', 3),
          N('橋が存在しないことを示す記録。……読み返すと、何かが引っかかる。'),
          IF('x:12', [N('インクだけが新しい。百年前の紙に、三日前の文字が書かれている。'), REC('r_br_forged')],
            [N('（違和感の正体がつかめない。観測力があれば……。右の公文書の棚でまた見直せる）')]),
          N('運河のほとりで、橋を復元できそうだ。'),
        ] },
        { cond: 'q:mq1=1', ev: [
          S('ヘルド', '鐘撞き記録なら左下の棚にある。修理記録は私が預かっている。……ああ、これだ'),
          IF('!r:r_repair', [REC('r_repair')]),
          S('ヘルド', '街の人々にも話を聞くといい。記録に残らないことは、人の口に残っているものだ'),
          MQ1_CHECK,
        ] },
        { cond: 'q:mq1=2', ev: [
          S('ヘルド', '記録が揃ったか。私の机を使いなさい。記録同士をどう繋ぐか、仮説を立ててみるといい'),
          HYPOTHESIS,
        ] },
        { cond: 'q:mq1=3', ev: [S('ヘルド', '鐘楼の門は門番のガルトが守っている。……どう通るかは、君の編纂次第だな')] },
        endLines('ヘルド', {
          bell: '鐘が鳴るようになったな。……記録士セイル、君の報告書は見事だった。不思議と、君の字は懐かしい',
          free: '鐘は鳴らないままか。だが街の顔つきは変わった。……記録の仕事が増えるな、記録士くん',
          share: '鐘の音を聞くと、なぜか君のことを「お前」と呼びたくなる。……妙なものだ、セイル',
          keep: '街は静かだ。静かすぎる。……君は、それでよかったのかね',
        }),
        { ev: [S('ヘルド', '鐘楼の中か。気をつけて行きなさい、記録士セイル。……なぜかな、君を「お前」と呼びたくなる')] },
      ],
    },
  ],
  objs: [
    {
      id: 'shelf_death', x: 3, y: 6, kind: 'inspect', label: '第三区の死亡記録',
      talk: [
        { cond: '!r:r_death', ev: [
          N('第三区、死亡記録。綴りをめくる指が、ある名前で止まった。'),
          N('「イオラ。十年前の冬に死亡」'),
          S('セイル', '……母さん？'),
          S('セイル', '嘘だ。今朝も「行ってらっしゃい」と言われた。昨日の夜も、一緒にスープを……'),
          N('記録者の署名欄だけが、不自然に空白だった。'),
          REC('r_death'), Q('mq0', 1),
          S('セイル', '……家に帰ろう。母さんがいるはずだ'),
        ] },
        { ev: [N('第三区の死亡記録。母の名前は、まだそこにある。')] },
      ],
    },
    {
      id: 'shelf_bell', x: 7, y: 11, kind: 'inspect', label: '鐘撞き記録',
      talk: [
        { cond: 'f:chapter1 & !r:r_bell_log', ev: [
          N('鐘撞き記録の綴り。毎朝六時、鐘を撞く——数百年分の記録が、三日前で途切れている。'),
          N('最後の三日間、撞き手の欄にだけ名前がある。「トワ」。鐘は鳴っていないのに。'),
          REC('r_bell_log'), MQ1_CHECK,
        ] },
        { cond: 'f:chapter1', ev: [N('鐘撞き記録。三日前で途切れ、撞き手の欄に「トワ」とある。')] },
        { ev: [N('古い記録の棚。')] },
      ],
    },
    {
      id: 'shelf_public', x: 17, y: 6, kind: 'inspect', label: '公文書の棚',
      talk: [
        { cond: 'r:r_br_collapse & !r:r_br_forged', ev: [
          IF('x:12', [
            N('崩落記録をもう一度、光にかざす。……インクだけが新しい。百年前の紙に、三日前の文字が書かれている。'),
            REC('r_br_forged'),
          ], [N('崩落記録を見直したが、違和感の正体がつかめない。（観測力が足りない。記録針や観測薬があれば……）')]),
        ] },
        { ev: [N('公文書の棚。灰鐘市の公的な記録が整然と並ぶ。')] },
      ],
    },
    {
      id: 'desk', x: 5, y: 3, kind: 'inspect', label: '閲覧机',
      talk: [
        { cond: 'q:mq1=2', ev: [N('閲覧机に記録を広げ、仮説を立ててみる。'), HYPOTHESIS] },
        { ev: [N('閲覧机。ここで記録を広げて、仮説を立てられる。')] },
      ],
    },
  ],
  onEnter: [
    { cond: '!f:p_start', ev: [
      { t: 'scene', title: '序章　存在しない母親', lines: [
        'この世界では、あらゆる出来事に原因がある。',
        '扉が開いているのは、誰かが開けたから。街があるのは、街ができるまでの歴史があったから。',
        'ある日を境に、世界から「原因」だけが消え始めた。',
        '結果だけを残して。',
      ] },
      N('灰鐘市・記録保管所。閉館の鐘は、今日も鳴らなかった。'),
      S('セイル', '（第三区の死亡記録の整理、あと少しだ。……左奥の棚だったな）'),
      SET('p_start'),
      TOAST('移動：タップした場所へ歩く／矢印キー・WASD　調べる：対象をタップ／Enter・Space'),
    ] },
  ],
};

// ---------- 灰鐘市（鐘楼地区） ----------

function townTiles(): string[] {
  const g = grid(36, 28, ':');
  border(g, 't');
  rect(g, 28, 0, 2, 28, '~');
  put(g, 35, 14, ':');
  // 東岸の細い緑地
  rect(g, 30, 1, 5, 26, '"');
  for (const [x, y] of [[31, 3], [33, 6], [31, 10], [33, 19], [31, 22], [33, 25]]) put(g, x, y, 't');
  rect(g, 30, 14, 5, 1, ':');
  // 鐘楼
  rect(g, 13, 1, 8, 7, 'C');
  put(g, 16, 7, 'G'); put(g, 17, 7, 'G');
  // 記録保管所・パン屋・帳簿室
  building(g, 2, 1, 8, 5, 3);
  building(g, 2, 8, 6, 4, 2);
  building(g, 9, 9, 5, 4, 3);
  // 市場
  for (const x of [3, 4, 6, 7, 9, 10]) put(g, x, 15, 's');
  // 広場
  rect(g, 16, 13, 2, 2, 'o');
  for (const [x, y] of [[15, 11], [18, 11], [15, 16], [18, 16]]) put(g, x, y, 'l');
  // 花屋と献花台
  rect(g, 23, 10, 3, 1, 'f');
  put(g, 24, 4, 'a'); put(g, 23, 4, 'f'); put(g, 25, 4, 'f');
  // 宿屋兼酒場とテラス
  building(g, 19, 18, 7, 4, 3);
  put(g, 20, 23, 'T'); put(g, 23, 23, 'T');
  // セイルの家・コラの家
  building(g, 2, 21, 5, 4, 2);
  building(g, 8, 22, 4, 3);
  // 緑地
  rect(g, 13, 20, 4, 5, '"');
  put(g, 13, 20, 't'); put(g, 16, 24, 't');
  rect(g, 22, 1, 5, 2, '"');
  put(g, 26, 1, 't');
  // 運河の橋脚
  put(g, 27, 13, 'p'); put(g, 27, 15, 'p'); put(g, 30, 13, 'p'); put(g, 30, 15, 'p');
  return rows(g);
}

const TOWN: MapDef = {
  id: 'town', name: '灰鐘市・鐘楼地区', theme: 'town', bgm: 'town', night: '!f:chapter1',
  tiles: townTiles(),
  warps: [
    { x: 5, y: 5, to: 'archive', tx: 9, ty: 12, dir: 0 },
    { x: 4, y: 24, to: 'home', tx: 5, ty: 7, dir: 0 },
    { x: 4, y: 11, to: '', tx: 0, ty: 0, cond: 'f:never', blocked: 'パン屋。焼きたての香りがする。店主のマルタは店先にいるようだ。' },
    { x: 12, y: 12, to: '', tx: 0, ty: 0, cond: 'f:never', blocked: '帳簿係オルネの帳簿室。中は帳簿の山だ。' },
    { x: 22, y: 21, to: '', tx: 0, ty: 0, cond: 'f:never', blocked: '宿屋兼酒場「鈍色の杯」。今は満室らしい。おかみのハンナはテラスにいる。' },
    { x: 16, y: 7, to: 'tower1', tx: 8, ty: 12, dir: 0, cond: 'f:gate_open' },
    { x: 17, y: 7, to: 'tower1', tx: 9, ty: 12, dir: 0, cond: 'f:gate_open' },
    { x: 35, y: 14, to: 'east', tx: 1, ty: 8, dir: 3, cond: 'f:bridge' },
  ],
  patches: [
    { cond: 'f:gate_open', tiles: [[16, 7, 'D'], [17, 7, 'D']] },
    { cond: 'f:bridge', tiles: [[28, 14, 'k'], [29, 14, 'k']] },
  ],
  npcs: [
    {
      id: 'kora', name: 'コラ', x: 7, y: 25, sprite: 'kora', dir: 2,
      talk: [
        { cond: '!f:chapter1 & !r:r_neighbor', ev: [
          S('コラ', 'あら、セイル。こんな夜更けにどうしたの'),
          S('セイル', 'コラさん、母さんを見ませんでしたか'),
          S('コラ', 'お母さん？ あなたは十年前から一人暮らしでしょう。……忘れたの？'),
          S('コラ', '……ああ、そうだ。明日の朝もパンを二つ焼いておくわね。あなたの分と……あら、もう一つは誰の分だったかしら'),
          REC('r_neighbor'), PROLOGUE_CHECK,
        ] },
        { cond: '!f:chapter1', ev: [S('コラ', '二つ目のパン……誰の分だったかしら。毎朝焼いているのに')] },
        endLines('コラ', {
          bell: '鐘が鳴ると、パンが二つ焼き上がるの。……ねえ、二つ目は、あなたのお母さんの分だった気がするのよ',
          free: '今朝は寝坊しちゃった！ でもパンは二つ焼いたわ。……二つ目は、誰かのために焼きたいの',
          share: '鐘の音で目が覚めて、焼きたいから二つ焼いたの。一つはあなたに。もう一つは……いつか分かる気がする',
          keep: 'パンを二つ焼いたわ。毎朝、六時に。……毎朝、六時に',
        }),
        { ev: [S('コラ', 'おはよう、セイル。パンを二つ焼いたの。……二つ目は、あなたが持っていって')] },
      ],
    },
    {
      id: 'garth', name: 'ガルト', x: 15, y: 8, sprite: 'garth', dir: 2, cond: 'f:chapter1',
      talk: [
        endLines('ガルト', {
          bell: '鐘が鳴ると背筋が伸びる。六時に門、煙が上がればパン。……決まってるってのは、楽なもんだ',
          free: '今日は持ち場を離れて釣りでもするか。……門番が門を離れる理由なんて、考えたこともなかったよ',
          share: '鐘が鳴ったら、パンを買いに行く。命令じゃない。俺がそうしたいからだ。……こういうのもいいな',
          keep: '六時より鐘楼門の警備。六時より鐘楼門の警備。……なあ、俺は何を守ってるんだっけな',
        }),
        { cond: 'f:gate_open', ev: [
          IF('f:gate_route=1', [S('ガルト', 'パンを買いに行く習慣、思い出したよ。……なんで忘れてたんだろうな。マルタのパンはうまいんだ')]),
          IF('f:gate_route=2', [S('ガルト', 'ドラン隊長……と呼ぶと、なぜかしっくり来る。何の隊だったのかは、さっぱりだが')]),
          IF('f:gate_route=3', [S('ガルト', '門が勝手に開いてる。俺はここにいるのに。……俺がいる意味って、何なんだろうな')]),
        ] },
        { ev: [
          S('ガルト', '鐘楼は立入禁止だ。鐘が鳴らないのは時計組合の仕事で、俺の仕事は門を守ることだ'),
          S('セイル', '毎朝、何か用事があったりしませんか'),
          S('ガルト', '用事？ ……そういえば、朝は何かあった気がするんだが。思い出せん。とにかく俺は六時からここにいる。そう決まってる'),
          IF('!r:r_gate_duty', [N('ガルトは勤務表を見せてくれた。欄外に古い書き込みがある。'), REC('r_gate_duty')]),
          SET('met_garth'),
        ] },
      ],
    },
    {
      id: 'marta', name: 'マルタ', x: 5, y: 12, sprite: 'marta', dir: 2, cond: 'f:chapter1',
      talk: [
        { cond: '!r:r_diary', ev: [
          S('マルタ', 'いらっしゃい！ ……え、鐘？ そうなのよ、三日も鳴ってないの'),
          S('マルタ', 'なのにね、私ちゃんと六時に起きて、窯に火を入れてるの。誰にも起こされてないのに。変でしょう？'),
          S('マルタ', '日記にもそう書いたのよ。読んでみる？'),
          REC('r_diary'), MQ1_CHECK,
        ] },
        { cond: 'f:met_garth & !r:r_smoke', ev: [
          S('セイル', '門番のガルトさんを知っていますか'),
          S('マルタ', 'ガルトさん？ 毎朝、窯の煙が上がるとパンを買いに来てたわよ'),
          S('マルタ', '……あら、そういえば三日前から来てないわね。どうしたのかしら'),
          REC('r_smoke'),
        ] },
        endLines('マルタ', {
          bell: '鐘の音で起きて、窯に火を入れる。やっぱりこれよね！ 毎日同じパンが、毎日同じだけ売れるの',
          free: '今朝は八時に起きちゃった。でもね、ゆっくり生地をこねたら、新しいパンができたの。食べてく？',
          share: '鐘が「朝だよ」って教えてくれるの。起きるかどうかは私の勝手。……でも、起きたくなるのよね',
          keep: 'いらっしゃい。六時に起きて、窯に火を入れたわ。六時に起きて、窯に、火を',
        }),
        { ev: [S('マルタ', '窯の煙は毎朝六時に上がるの。……それを合図に動いていた人も、いたのかしらね')] },
      ],
    },
    {
      id: 'orne', name: 'オルネ', x: 11, y: 13, sprite: 'orne', dir: 2, cond: 'f:chapter1',
      talk: [
        { cond: '!r:r_work', ev: [
          S('オルネ', '開店記録？ 見せてもいいけど、面白いものじゃないよ。全店、六時ちょうど開店。一軒の遅れもない'),
          S('オルネ', '鐘が鳴らなくなってからも、だ。誰も時計を見ていないのに。おかしいと思わないかい？'),
          REC('r_work'), MQ1_CHECK,
        ] },
        endLines('オルネ', {
          bell: '開店記録は今日も完璧。六時ちょうど。……完璧すぎて、帳簿をつける意味があるのか分からなくなるね',
          free: '開店時間がばらばらで帳簿が大変だよ！ ……でも、遅れて開いた店に行列ができてた。面白いね',
          share: '鐘から十分以内に、みんな好きな順で開ける。帳簿に「理由」の欄を足したよ',
          keep: '全店、六時ちょうど開店。……三日分、同じ数字を書いている気がする。いや、三年分かな',
        }),
        { ev: [S('オルネ', '記録は事実を書くもの。でも、事実の理由までは書いてくれないんだよねえ')] },
      ],
    },
    {
      id: 'peck', name: 'ペック', x: 4, y: 14, sprite: 'peck', dir: 2, cond: 'f:chapter1',
      talk: [
        { cond: 'f:end_free | f:end_share', ev: [S('ペック', 'いらっしゃい！ 今朝から仕入れを自分で選んでみたんだ。見ていってくれ'), { t: 'shop', id: 'peck_free' }] },
        { ev: [S('ペック', 'いらっしゃい、記録士さん。品ぞろえはいつも通り。……いつも通りしか、できないんでね'), { t: 'shop', id: 'peck' }] },
      ],
    },
    {
      id: 'fruit', name: '果物売り', x: 9, y: 14, sprite: 'citizen', dir: 2, cond: 'f:chapter1',
      talk: [
        { cond: 'q:sq2>=1 & !r:r_fl_rumor', ev: [
          S('果物売り', 'ネリさん？ 旦那さんは流行り病で亡くなったって聞いたけどね'),
          S('果物売り', '……いつの話だっけ。そもそも、そんな病が流行ったかなあ'),
          REC('r_fl_rumor'), FL_CHECK,
        ] },
        { ev: [S('果物売り', 'リンゴは六時に並べる。理由？ 六時だからさ')] },
      ],
    },
    {
      id: 'neri', name: 'ネリ', x: 24, y: 11, sprite: 'neri', dir: 2, cond: 'f:chapter1',
      talk: [
        { cond: '!f:sq2s', ev: [
          S('ネリ', 'おはよう。……私ね、白い花を一輪、毎朝あそこの献花台に供えるの。でも、誰のためなのかしら'),
          S('ネリ', '注文票には宛先がないの。私が書いているのに'),
          REC('r_fl_order'), Q('sq2', 1), SET('sq2s'), FL_CHECK,
        ] },
        { cond: 'f:fl_war', ev: [S('ネリ', 'ヨアンのこと、思い出させてくれてありがとう。……痛いけど、空っぽよりずっといい')] },
        { cond: 'f:fl_sick', ev: [S('ネリ', '病気だったのよね。……そう思うと、少しだけ眠れるようになったの')] },
        { ev: [S('ネリ', '花は誰かに届くために咲くのよね。……届け先が分からなくても')] },
      ],
    },
    {
      id: 'timo', name: 'ティモ', x: 12, y: 19, sprite: 'timo', dir: 2, cond: 'f:chapter1',
      talk: [
        endLines('ティモ', {
          bell: 'ごーん！ って鳴ったよ！ トワお姉ちゃん、起きてる顔で鐘を撞いてた！',
          free: '今日はね、学校に行く前に運河を見に行ったんだ。いつもと違う道！',
          share: '鐘が鳴ったら、ぼくは走る！ 走りたいから！',
          keep: 'トワお姉ちゃん、今日も目をつむったまま登ってった。……お姉ちゃん、いつ起きるの？',
        }),
        { ev: [S('ティモ', '鐘楼のお姉ちゃん、毎朝のぼってくんだよ。目をつむったまま！ ……でも鐘は鳴らないの')] },
      ],
    },
    {
      id: 'walker', name: '通りの男', x: 21, y: 14, sprite: 'citizen2', dir: 3, cond: 'f:chapter1',
      talk: [
        { cond: 'f:end_free | f:end_share', ev: [S('通りの男', '今朝は別の道を歩いてみたんだ。花屋の前に、あんなきれいな花があったなんて')] },
        { ev: [S('通りの男', '毎朝この道を歩く。家から広場まで、百二十歩。……理由？ 考えたこともないよ')] },
      ],
    },
    {
      id: 'pirika', name: 'ピリカ', x: 21, y: 8, sprite: 'pirika', dir: 2, cond: 'f:chapter1',
      talk: [
        { cond: '!f:gate_open', ev: [
          S('ピリカ', '時計組合見習いのピリカです！ 先月、鐘の舌を新品に替えたばかりなのに鳴らないなんて……組合の恥です！'),
          S('ピリカ', '修理記録なら記録保管所に提出済みです。ヘルドさんに聞いてみてください'),
        ] },
        { cond: '!f:sq3s', ev: [
          S('ピリカ', '門、開いたんですね！ お願いがあります。鐘楼の二階に組合の保管庫があるんですけど、仕掛けが変になって開かないんです'),
          S('ピリカ', '北と南の錘を同時に下げると開くはずなのに、南を下げると北が上がっちゃうんです。……ずっと下げたまま「止めておく」方法があればなあ'),
          REC('r_vault'), Q('sq3', 1), SET('sq3s'),
          S('ピリカ', 'そうそう、二階の床には昔の礎石があって、文字が刻まれてるらしいんです。私には見えなかったけど……観測が得意な人なら'),
        ] },
        { cond: 'q:sq3=99', ev: [S('ピリカ', '保管庫、開けてくれてありがとうございます！ 保留時計は差し上げます。組合長には内緒で！')] },
        { ev: [S('ピリカ', '保管庫、お願いしますね！ 二階の東側です')] },
      ],
    },
    {
      id: 'bold', name: 'ボルド', x: 26, y: 16, sprite: 'bold', dir: 1, cond: 'f:chapter1',
      talk: [
        { cond: '!f:sq1s', ev: [
          S('ボルド', 'おや、記録士さん。わしは毎週、東岸のルーメの店に買い物に行くんじゃよ。橋を渡ってな'),
          S('セイル', '橋……？ 運河に橋はありませんよ'),
          S('ボルド', '何を言う。ほれ、先週の領収書もある。……おや？ 橋は、どこじゃ？'),
          REC('r_br_receipt'), Q('sq1', 1), SET('sq1s'),
          S('ボルド', '宿のハンナが、橋を渡った旅人の日記を預かっとるはずじゃ。それと、そこの橋脚を見てごらん'),
          BR_CHECK,
        ] },
        { cond: 'f:bridge', ev: [S('ボルド', 'ほれ見ろ、橋はあったじゃろう！ ……あった、んじゃよな？')] },
        { cond: 'q:sq1=3', ev: [S('ボルド', '橋脚はそこにある。あとは橋が「建った理由」さえあればのう')] },
        { ev: [S('ボルド', '橋脚は運河のほとりじゃ。新しい石組みじゃろう？')] },
      ],
    },
    {
      id: 'hanna', name: 'ハンナ', x: 24, y: 22, sprite: 'hanna', dir: 2, cond: 'f:chapter1',
      talk: [
        { cond: 'q:sq1>=1 & !r:r_br_diary', ev: [
          S('ハンナ', '旅人の日記？ ああ、忘れ物で預かってるよ。……「朝、運河の橋を渡り東岸の倉庫街へ。橋の欄干には鐘の紋章」'),
          S('ハンナ', 'うちの前の運河に、そんな橋あったかねえ'),
          REC('r_br_diary'), BR_CHECK,
        ] },
        { cond: 'q:mq1>=1 & !p:dran', ev: [S('ハンナ', 'テラスの大男？ ドランっていう元兵隊さ。毎朝ここで同じ酒を一杯だけ飲んで、ぼんやりしてる')] },
        { ev: [
          S('ハンナ', 'いらっしゃい。ひと休みしていくかい？ 10灰貨だよ'),
          { t: 'choice', opts: [
            { label: '休む（10灰貨）', cond: 'g:gold>=10', ev: [{ t: 'gold', n: -10 }, { t: 'heal' }, { t: 'margin', n: 'full' }, N('ひと休みした。HP・AP・余白が回復した。'), { t: 'save' }] },
            { label: 'やめておく', ev: [] },
          ] },
        ] },
      ],
    },
    {
      id: 'dran', name: 'ドラン', x: 21, y: 23, sprite: 'dran', dir: 2, cond: 'f:chapter1 & !p:dran',
      talk: [
        { cond: 'q:mq1>=1', ev: [
          S('ドラン', '……記録士か。俺に何の用だ'),
          S('セイル', '鐘のことを調べています。街の人がなぜ毎朝同じように動けるのか'),
          S('ドラン', '同じように、か。俺もそうだ。毎朝ここで同じ酒を一杯。なぜかは知らん'),
          N('ドランは懐から、一枚の紙を出した。'),
          REC('r_dran_paper'),
          S('ドラン', '除隊証だ。戦役の名前だけが抜け落ちてる。戦った理由は消えたのに、剣の振り方だけは体が覚えてやがる'),
          S('ドラン', '門番のガルト……あいつは、たぶん俺の部下だった。どこの軍の、何の戦争かは思い出せんがな'),
          S('ドラン', '原因がなくても、結果は残る。……お前さん、それを直す仕事をしてるんだろう？'),
          S('セイル', '直せるかどうかは、分かりません。でも、調べています'),
          S('ドラン', 'なら付き合おう。どうせ毎朝同じ酒を飲むだけの身だ'),
          { t: 'join', who: 'dran' },
          N('ドランが仲間になった！'),
          N('そのとき、テラスの石畳の一部が、ふっと「欠けた」。'),
          S('ドラン', '下がってろ、記録士！'),
          { t: 'battle', id: 'b_plaza', win: [
            S('ドラン', '……体が勝手に動いた。妙なもんだ'),
            S('セイル', '（ドランさんの剣には迷いがない。原因を失っても、結果は確かに残っている）'),
            TOAST('ドランの「崩し」は、敵の強化や溜めを解除して行動の条件を崩す'),
          ] },
          { t: 'save' },
        ] },
        { ev: [S('ドラン', '……毎朝この一杯を飲む。なぜかは知らん。それで困ったこともない')] },
      ],
    },
    {
      id: 'towa_town', name: 'トワ', x: 19, y: 17, sprite: 'towa', dir: 2, cond: 'f:end_free | f:end_share',
      talk: [
        { cond: 'f:end_free', ev: [S('トワ', '海、見てきたよ！ 東岸の倉庫街の向こうに、ちょっとだけ見えるの。……明日はもっと遠くまで行くんだ')] },
        { ev: [S('トワ', '今朝の鐘、わたしが撞いたの。撞きたかったから。……ねえ、セイル。理由があるって、こんなに気持ちいいんだね')] },
      ],
    },
  ],
  objs: [
    {
      id: 'gate', x: 16, y: 7, kind: 'inspect', cond: '!f:gate_open', label: '鐘楼の門',
      talk: [
        { cond: '!f:chapter1', ev: [N('鐘楼の門。夜は固く閉ざされている。')] },
        { cond: 'q:mq1>=3', ev: [{
          t: 'puzzle', id: 'p_gate',
          out: {
            o_smoke: [
              N('窯の煙が細く立ちのぼる。ガルトがふいに顔を上げた。'),
              S('ガルト', '……そうだ。煙が上がったら、パンを買いに行くんだった。なんで忘れてたんだ？'),
              N('ガルトはパン屋の方へ歩いていった。門は開いたままだ。'),
              SET('gate_open'), SET('gate_route', 1), W('stability', 5), W('restore', 1), W('repaired', 1),
              ...GATE_DONE,
            ],
            o_dran: [
              S('ドラン', 'おい、ガルト！'),
              S('ガルト', '……っ！ その声……隊長？ いや、隊長って誰の……'),
              S('ドラン', 'いいから、ちょっと付き合え。昔話がしたい'),
              N('ガルトは戸惑いながらも持ち場を離れ、ドランと話し込み始めた。'),
              S('ガルト', '……あんたの声を聞くと背筋が伸びる。理由は分からんが。これ、持っていってくれ'),
              ITEM('badge'), N('「門番の徽章」を受け取った。'),
              SET('gate_open'), SET('gate_route', 2), W('trust', 5), W('keep', 1), W('repaired', 1),
              ...GATE_DONE,
            ],
            o_force: [
              N('門番の役目と門のつながりが断ち切られ、門がぎい、と開いた。ガルトは持ち場に立ったまま、それに気づかない。'),
              N('……門の周囲の空間が、矛盾に耐えかねて歪む。'),
              { t: 'battle', id: 'b_gate', win: [
                S('ガルト', '……なんで門が開いてるんだ。俺はここにいるのに'),
                SET('gate_open'), SET('gate_route', 3), W('stability', -5), W('free', 1),
                ...GATE_DONE,
              ] },
            ],
          },
          cancel: [N('（門を調べれば、もう一度編集できる）')],
        }] },
        { ev: [N('鐘楼の門。ガルトが守っている。……まずは鐘が鳴らない理由を調べよう。')] },
      ],
    },
    { id: 'gate2', x: 17, y: 7, kind: 'inspect', cond: '!f:gate_open', label: '鐘楼の門', talk: [{ ev: [N('鐘楼の門。左の扉の前で調べてみよう。')] }] },
    {
      id: 'grave', x: 24, y: 4, kind: 'inspect', label: '献花台',
      talk: [
        { cond: '!f:chapter1', ev: [N('名前の削れた献花台。暗くてよく見えない。')] },
        { cond: '!r:r_fl_grave', ev: [
          N('広場の隅の献花台。白い花が一輪。台座の名前は削れて読めない。'),
          REC('r_fl_grave'),
          IF('p:dran & !r:r_dran_memory', DRAN_MEM),
          IF('q:sq2>=1', [FL_CHECK]),
        ] },
        { cond: 'p:dran & !r:r_dran_memory', ev: [...DRAN_MEM, FL_CHECK] },
        { cond: 'q:sq2=2', ev: [{
          t: 'puzzle', id: 'p_florist',
          out: {
            o_war: [
              N('ドランの記憶と、帰らなかった人とが、一本の線で結ばれた。'),
              S('ドラン', '……ヨアン。そうだ、ヨアンだ。白い花は、ネリさんが持たせたお守りだった'),
              S('ドラン', '俺はあいつを連れて帰れなかった。……すまない'),
              N('いつの間にか、ネリが献花台の前に立っていた。'),
              S('ネリ', '……ヨアン。そう、あの人はヨアン。思い出せて、よかった。痛いけど、よかった'),
              W('trust', 15), W('keep', 1),
              ITEM('ring'), N('ネリから「共鳴環」を受け取った。夫婦で分け合っていた指輪だという。'),
              Q('sq2', 99), EXP(80), SET('fl_war'),
            ],
            o_sick: [
              N('「病で亡くなった」という原因が、ネリの朝を静かに支えた。'),
              S('ネリ', 'そう……病気だったのね。少し、楽になった気がする'),
              IF('p:dran', [S('ドラン', '（……それで、あいつの死は無かったことになるのか）'), S('ドラン', '……いや。お前さんの選んだことだ')]),
              W('trust', -10), W('restore', 1), W('stability', 3),
              ITEM('needle'), N('ネリから「記録針」を受け取った。夫の形見だという。'),
              Q('sq2', 99), EXP(80), SET('fl_sick'),
            ],
          },
          cancel: [N('（献花台を調べれば、もう一度編集できる）')],
        }] },
        { ev: [N('名前の削れた献花台。白い花が風に揺れている。')] },
      ],
    },
    {
      id: 'canal', x: 28, y: 14, kind: 'inspect', cond: '!f:bridge', label: '運河',
      talk: [
        { cond: 'q:sq1>=1 & !r:r_br_pillar', ev: [
          N('運河の両岸に、橋を支えていたとしか思えない石組みがある。表面は新しく、苔も生えていない。'),
          REC('r_br_pillar'), BR_CHECK,
        ] },
        { cond: 'q:sq1=3', ev: [{
          t: 'puzzle', id: 'p_bridge',
          out: {
            o_clean: [
              N('ことり、と音がして——運河に石の橋が架かっていた。欄干には鐘の紋章。崩落記録の文字は、紙の上から消えていた。'),
              S('ボルド', 'ほれ、あったじゃろう！'),
              SET('bridge'), SET('bridge_clean'), Q('sq1', 99), W('repaired', 1), W('restore', 1), EXP(70),
              TOAST('東岸の倉庫街へ行けるようになった'),
            ],
            o_keep: [
              N('ことり、と音がして——運河に石の橋が架かっていた。欄干には鐘の紋章。'),
              N('崩落記録も、そのまま残っている。この街には「崩落した橋」と「架かっている橋」が、同時に存在する。'),
              S('ボルド', 'ほれ、あったじゃろう！ ……じゃが、なぜか崩れた橋の夢も見るんじゃ'),
              SET('bridge'), SET('bridge_keep'), Q('sq1', 99), W('repaired', 1), W('keep', 1), EXP(70),
              TOAST('東岸の倉庫街へ行けるようになった'),
            ],
          },
          cancel: [N('（運河を調べれば、もう一度編集できる）')],
        }] },
        { ev: [N('運河。向こう岸に倉庫街が見える。両岸に、真新しい石組みがある。')] },
      ],
    },
    {
      id: 'fountain', x: 16, y: 13, kind: 'inspect', label: '噴水',
      talk: [
        { cond: 'f:end_bell | f:end_share', ev: [N('噴水。水音が戻っている。')] },
        { ev: [N('噴水。水は流れているのに、水音だけが聞こえない。')] },
      ],
    },
    {
      id: 'tower_wall', x: 14, y: 7, kind: 'inspect', label: '鐘楼',
      talk: [{ ev: [N('灰鐘市の鐘楼。この街の朝は、数百年この鐘とともにあった。')] }],
    },
  ],
};

// ---------- セイルの家 ----------

function homeTiles(): string[] {
  const g = grid(12, 9, ',');
  border(g, '#');
  put(g, 1, 1, '='); put(g, 9, 1, 'x'); put(g, 10, 1, 'x');
  put(g, 1, 3, 'b'); put(g, 1, 4, 'b');
  rect(g, 5, 3, 2, 2, 'T');
  put(g, 10, 3, 'c'); put(g, 10, 4, 'c');
  put(g, 9, 6, 'T');
  rect(g, 3, 6, 3, 1, 'r');
  put(g, 5, 8, 'D');
  return rows(g);
}

const HOME: MapDef = {
  id: 'home', name: 'セイルの家', theme: 'home', bgm: 'home', night: '!f:chapter1',
  tiles: homeTiles(),
  warps: [{ x: 5, y: 8, to: 'town', tx: 4, ty: 25, dir: 2 }],
  npcs: [],
  objs: [
    {
      id: 'dishes', x: 5, y: 3, kind: 'inspect', label: '食卓',
      talk: [
        { cond: '!r:r_dishes', ev: [
          N('食卓に、使い込まれた食器が二人分。片方には、昨日のスープの跡が残っている。'),
          S('セイル', '昨日、母さんと食べた。……やっぱり、夢じゃない'),
          REC('r_dishes'), PROLOGUE_CHECK,
        ] },
        { ev: [N('二人分の食器。')] },
      ],
    },
    { id: 'dishes2', x: 6, y: 4, kind: 'inspect', label: '食卓', talk: [{ ev: [N('母の椅子。座面がまだ少しへこんでいる。')] }] },
    { id: 'wardrobe', x: 1, y: 1, kind: 'inspect', label: '衣装棚', talk: [{ ev: [N('母の服が掛かっている。ほんのりと、母の匂いがした。')] }] },
    {
      id: 'desk', x: 9, y: 6, kind: 'inspect', label: '机',
      talk: [
        { cond: '!r:r_note', ev: [
          N('机の上に、母の筆跡の手記が置かれていた。'),
          N('「あなたが私を思い出したとき、世界はもう一度、私を失うでしょう。」'),
          S('セイル', '……どういう意味だよ、母さん'),
          REC('r_note'), PROLOGUE_CHECK,
        ] },
        { ev: [N('母の手記。「あなたが私を思い出したとき、世界はもう一度、私を失うでしょう。」')] },
      ],
    },
    {
      id: 'bed', x: 1, y: 3, kind: 'bed', label: 'ベッド',
      talk: [
        { cond: '!f:chapter1', ev: [N('……眠れるはずがない。')] },
        { ev: [{ t: 'choice', q: '休みますか？（HP・AP・余白が回復し、自動セーブします）', opts: [
          { label: '休む', ev: [{ t: 'heal' }, { t: 'margin', n: 'full' }, N('ひと眠りした。体も、世界の余白も、少しだけ満ちた。'), { t: 'save' }] },
          { label: 'やめておく', ev: [] },
        ] }] },
      ],
    },
    { id: 'kitchen', x: 10, y: 3, kind: 'inspect', label: '台所', talk: [{ ev: [N('鍋が二つ。母はいつも、大きい方でスープを作っていた。')] }] },
  ],
};

// ---------- 欠因の回廊 ----------

const MOTHER_PUZZLE: Cmd = {
        t: 'puzzle', id: 'p_mother',
        out: {
          o_restore: [
            { t: 'flash' }, SOUND('restore'),
            { t: 'scene', lines: ['——セイル、朝ごはんよ。', '——また夜更かししたの？ 記録より、自分のことを書きなさい。', '——行ってらっしゃい。'] },
            S('セイル', '……母さん。母さんの声だ。思い出せる'),
            N('けれど、その声は指の間から零れる砂のように、少しずつ薄れていく。'),
            N('……どこかで、誰かの記憶が一つ、ほどけた。'),
            SET('p_edit_done'), W('restore', 1), W('repaired', 1), EXP(40), Q('mq0', 4),
            N('回廊の奥で、何かが目を覚ました。'),
          ],
        },
        cancel: [N('（目録札を調べれば、もう一度編集できる）')],
      };


function corridorTiles(): string[] {
  const g = grid(30, 12, 'v');
  const carve = (x: number, y: number, w: number, h: number) => rect(g, x, y, w, h, '_');
  carve(1, 4, 5, 5);
  carve(6, 6, 9, 1);
  carve(12, 1, 1, 6);
  carve(12, 1, 7, 1);
  carve(18, 1, 1, 9);
  carve(14, 9, 5, 1);
  carve(18, 5, 6, 1);
  carve(23, 2, 1, 8);
  carve(23, 9, 6, 1);
  carve(24, 2, 5, 6);
  // 隠し部屋（入口は観測で見つかる）
  carve(8, 8, 4, 3);
  put(g, 1, 6, 'S');
  for (const [x, y] of [[2, 4], [4, 8], [25, 2], [28, 7], [9, 10]]) put(g, x, y, 'V');
  return rows(g);
}

const CORRIDOR: MapDef = {
  id: 'corridor', name: '欠因の回廊', theme: 'corridor', bgm: 'corridor',
  tiles: corridorTiles(),
  warps: [{ x: 1, y: 6, to: 'archive', tx: 10, ty: 2, dir: 2 }],
  patches: [{ cond: 'x:12', tiles: [[12, 9, '_'], [13, 9, '_']] }],
  npcs: [],
  objs: [
    { id: 'e1', x: 9, y: 6, kind: 'enemy', battle: 'b_corr1', respawn: true, sprite: 'moth', cond: 'f:p_tut' },
    { id: 'e2', x: 12, y: 3, kind: 'enemy', battle: 'b_corr2', respawn: true, sprite: 'eater', cond: 'f:p_tut' },
    { id: 'e3', x: 18, y: 7, kind: 'enemy', battle: 'b_corr3', respawn: true, sprite: 'eater', cond: 'f:p_tut' },
    { id: 'e_deep', x: 26, y: 9, kind: 'enemy', battle: 'b_corr_deep', respawn: false, sprite: 'beast', cond: 'f:chapter1' },
    { id: 'c_deep', x: 28, y: 9, kind: 'chest', item: 'bookmark', cond: 'f:chapter1' },
    { id: 'c_hid1', x: 9, y: 9, kind: 'chest', item: 'shard', n: 2 },
    { id: 'c_hid2', x: 10, y: 9, kind: 'chest', item: 'crystal' },
    { id: 'c_corr', x: 14, y: 9, kind: 'chest', item: 'potion', n: 2 },
    {
      id: 'card', x: 25, y: 3, kind: 'inspect', label: '目録札',
      talk: [
        { cond: '!r:r_handwriting', ev: [
          N('床に、目録札が一枚落ちていた。'),
          N('母と同じ筆跡。日付は——昨日。「欠因の回廊・閲覧済み」'),
          S('セイル', '母さんは、昨日ここにいた……？'),
          REC('r_handwriting'),
          N('セイルの視界に、出来事と出来事を結ぶ「線」が浮かび上がる。'),
          S('セイル', 'これが……因果？ 繋がっていない線がある。繋げられる、気がする'),
          MOTHER_PUZZLE,
        ] },
        { cond: 'f:p_edit_done', ev: [N('母の筆跡の目録札。')] },
        { cond: '!f:p_edit_done', ev: [MOTHER_PUZZLE] },
      ],
    },
    {
      id: 'shelf_boss', x: 26, y: 6, kind: 'enemy', battle: 'b_shelf', sprite: 'shelf', cond: 'f:p_edit_done & !f:p_shelf',
      talk: [{ ev: [
        N('書架がきしみ、白紙の頁がざわめいた。'),
        { t: 'battle', id: 'b_shelf', win: [
          N('書架が崩れ、白紙の頁が雪のように舞った。'),
          N('頁の一枚に、母の筆跡で一行だけ書かれていた。'),
          N('「世界簿の底で待っています。——でも、来なくていい」'),
          SET('p_shelf'), Q('mq0', 99),
          { t: 'scene', lines: ['回廊を抜けると、窓の外が白み始めていた。', '三日前から鳴らない鐘の代わりに、街は今朝も、六時ちょうどに動き出す。'] },
          { t: 'warp', map: 'archive', x: 15, y: 4, dir: 0 },
          S('ヘルド', '……おや。閉館中だぞ。君は……ああ、記録士の……すまない、名前は何だったかな'),
          S('セイル', '……ヘルドさん？ セイルです。十年、あなたの下で働いてきた'),
          S('ヘルド', '十年？ はは、冗談はよしてくれ。私は弟子を取ったことがない。……取ったことは、ないはずだ'),
          N('ヘルドは、机の横の空いた二つ目の椅子を、不思議そうに見つめていた。'),
          REC('r_held_lost'),
          S('セイル', '（母さんの存在を一つ繋いだ代わりに、ヘルドさんの中の「僕」が一つ、ほどけた……）'),
          S('セイル', '（修復は、無償じゃない）'),
          N('母の記憶も、もう霞み始めていた。顔は思い出せる。声は——もう、半分しか。'),
          S('セイル', '（それでも確かめたい。世界がなぜ、こうなったのか）'),
          { t: 'title', text: '第一章', sub: '繰り返される街' },
          SET('chapter1'), { t: 'heal' }, { t: 'margin', n: 'full' },
          S('ヘルド', 'ところで記録士くん。気づいているかね。……鐘が鳴らないんだ。三日前から'),
          S('ヘルド', 'なのに街は、毎朝六時ちょうどに動き出す。誰も鐘を聞いていないのに'),
          S('ヘルド', '調べてくれないか。記録保管所の仕事として'),
          Q('mq1', 1),
          N('4つの記録を集めよう。鐘撞き記録（左下の棚）、修理記録（ヘルド）、そして街の人々の話。'),
          { t: 'save' },
        ] },
      ] }],
    },
    {
      id: 'shelf_sleep', x: 26, y: 6, kind: 'inspect', sprite: 'shelf', cond: '!f:p_edit_done', label: '書架',
      talk: [{ ev: [N('中身のない本が積み上がった書架。眠っているように、静かだ。')] }],
    },
  ],
  onEnter: [
    { cond: '!f:p_tut', ev: [
      N('記録にない回廊。壁も床も、ところどころが四角く「欠けて」いる。'),
      Q('mq0', 2),
      N('欠けた床の向こうから、何かが這い出してきた。'),
      { t: 'battle', id: 'b_tutorial', win: [
        SET('p_tut'), Q('mq0', 3),
        S('セイル', '（敵が何をするかだけじゃない。それが「成立する条件」が見えた……）'),
        N('回廊の奥へ進もう。母の手がかりがあるかもしれない。'),
      ] },
    ] },
  ],
};

// ---------- 東岸の倉庫街 ----------

function eastTiles(): string[] {
  const g = grid(22, 16, ':');
  border(g, 't');
  put(g, 0, 8, ':');
  building(g, 3, 1, 5, 4);
  building(g, 10, 1, 6, 4);
  building(g, 3, 10, 6, 4);
  building(g, 14, 11, 6, 4);
  for (const [x, y] of [[17, 7], [18, 7], [12, 13], [2, 6], [19, 2]]) put(g, x, y, 'x');
  rect(g, 8, 7, 3, 1, 'c');
  rect(g, 15, 8, 2, 2, 'v');
  put(g, 6, 8, 'V'); put(g, 13, 4, 'V');
  return rows(g);
}

const EAST: MapDef = {
  id: 'east', name: '東岸の倉庫街', theme: 'east', bgm: 'town',
  tiles: eastTiles(),
  warps: [{ x: 0, y: 8, to: 'town', tx: 34, ty: 14, dir: 3 }],
  npcs: [
    {
      id: 'lume', name: 'ルーメ', x: 9, y: 6, sprite: 'lume', dir: 2,
      talk: [{ ev: [
        S('ルーメ', 'いらっしゃい！ ……あら、橋が戻ったのね。先週もボルドさんが来たはずなのに、変な感じ'),
        { t: 'shop', id: 'lume' },
      ] }],
    },
  ],
  objs: [
    { id: 'ee1', x: 6, y: 5, kind: 'enemy', battle: 'b_east1', respawn: true, sprite: 'moth' },
    { id: 'ee2', x: 13, y: 9, kind: 'enemy', battle: 'b_east2', respawn: true, sprite: 'beast' },
    { id: 'ee3', x: 17, y: 5, kind: 'enemy', battle: 'b_east3', respawn: true, sprite: 'shade' },
    { id: 'ec1', x: 20, y: 3, kind: 'chest', item: 'severblade' },
    { id: 'ec2', x: 2, y: 14, kind: 'chest', item: 'crystal' },
    { id: 'ec3', x: 11, y: 14, kind: 'chest', item: 'shard' },
    { id: 'ec4', x: 20, y: 9, kind: 'chest', item: 'lens', n: 2, hiddenCond: 'x:11' },
    { id: 'evoid', x: 15, y: 8, kind: 'inspect', label: '欠けた地面', talk: [{ ev: [N('地面が四角く欠けている。向こう側には何もない。……何も「書かれていない」。')] }] },
  ],
};

// ---------- 鐘楼 ----------

function towerTiles(w: number, h: number): G {
  const g = grid(w, h, '_');
  border(g, '#');
  return g;
}

function tower1Tiles(): string[] {
  const g = towerTiles(18, 14);
  for (const [x, y] of [[2, 1], [5, 1], [12, 1], [15, 1], [1, 6], [16, 6], [4, 10], [13, 10]]) put(g, x, y, 'g');
  rect(g, 3, 5, 2, 1, 'g');
  rect(g, 13, 5, 2, 1, 'g');
  put(g, 2, 3, 'T');
  put(g, 8, 1, 'S'); put(g, 9, 1, 'S');
  put(g, 8, 2, 'G'); put(g, 9, 2, 'G');
  put(g, 8, 13, 'D'); put(g, 9, 13, 'D');
  rect(g, 6, 7, 1, 3, 'p'); rect(g, 11, 7, 1, 3, 'p');
  return rows(g);
}

const TOWER1: MapDef = {
  id: 'tower1', name: '鐘楼・一階（歯車室）', theme: 'tower', bgm: 'tower',
  tiles: tower1Tiles(),
  warps: [
    { x: 8, y: 13, to: 'town', tx: 16, ty: 8, dir: 2 },
    { x: 9, y: 13, to: 'town', tx: 17, ty: 8, dir: 2 },
    { x: 8, y: 1, to: 'tower2', tx: 8, ty: 11, dir: 0, cond: 'f:t1_door' },
    { x: 9, y: 1, to: 'tower2', tx: 9, ty: 11, dir: 0, cond: 'f:t1_door' },
  ],
  patches: [{ cond: 'f:t1_door', tiles: [[8, 2, '_'], [9, 2, '_']] }],
  npcs: [],
  objs: [
    { id: 't1e1', x: 4, y: 8, kind: 'enemy', battle: 'b_t1a', respawn: true, sprite: 'sentinel' },
    { id: 't1e2', x: 13, y: 8, kind: 'enemy', battle: 'b_t1b', respawn: true, sprite: 'shade', cond: '!f:t1_gear' },
    { id: 't1c1', x: 16, y: 11, kind: 'chest', item: 'hipotion' },
    { id: 't1c2', x: 1, y: 11, kind: 'chest', item: 'ether', n: 2 },
    {
      id: 'diagram', x: 2, y: 3, kind: 'inspect', label: '図面',
      talk: [
        { cond: '!r:r_gear', ev: [N('机の上に歯車室の図面が広げられている。'), N('「分銅が下がると歯車が回り、歯車が回ると上階の扉が開く」……扉と影について、誰かが書き足している。'), REC('r_gear')] },
        { ev: [N('歯車室の図面。')] },
      ],
    },
    {
      id: 'note2', x: 15, y: 4, kind: 'inspect', label: '紙片',
      talk: [
        { cond: '!r:r_mother2', ev: [
          N('歯車の隙間に、紙片が挟まっていた。'),
          N('「結果から原因を辿れるなら、その逆もできるはず。矢印の向きを疑いなさい」'),
          S('セイル', '母さんの字だ……どうしてこんなところに'),
          REC('r_mother2'), { t: 'unlock', op: 'invert' },
          TOAST('因果編集「反転」が使えるようになった'),
        ] },
        { ev: [N('母の二枚目の手記。「矢印の向きを疑いなさい」')] },
      ],
    },
    {
      id: 't1door', x: 8, y: 2, kind: 'inspect', cond: '!f:t1_door', label: '上階への扉',
      talk: [
        { cond: 'r:r_gear | r:r_mother2', ev: [{
          t: 'puzzle', id: 'p_gear',
          out: {
            o_gear: [
              N('分銅が沈み、歯車が軋みながら回り始めた。巻き込まれた影が、ほどけて消えていく。'),
              N('上階への扉が開いた。'),
              SET('t1_door'), SET('t1_gear'), Q('mq2', 2), EXP(40),
            ],
            o_invert: [
              N('扉と影の矢印が、逆を向いた。徘徊する影に押されるように、扉が開く。'),
              N('……影たちが、開いた扉から上階へ流れ込んでいった。'),
              SET('t1_door'), SET('t2_flood'), Q('mq2', 2), EXP(40),
            ],
          },
          cancel: [N('（扉を調べれば、もう一度編集できる）')],
        }] },
        { ev: [N('上階への扉。固く閉ざされている。仕掛けを調べる必要がありそうだ。')] },
      ],
    },
    { id: 't1door2', x: 9, y: 2, kind: 'inspect', cond: '!f:t1_door', label: '上階への扉', talk: [{ ev: [N('上階への扉。左の扉の前で調べてみよう。')] }] },
  ],
  onEnter: [{ cond: '!f:t1_enter', ev: [
    N('鐘楼の内部。止まった歯車が、壁一面に並んでいる。'),
    N('鐘の音のない塔は、時計の中に閉じ込められたように静かだ。'),
    SET('t1_enter'),
  ] }],
};

function tower2Tiles(): string[] {
  const g = towerTiles(18, 14);
  rect(g, 12, 1, 1, 12, '#');
  rect(g, 13, 1, 4, 3, '#');
  rect(g, 13, 9, 4, 4, '#');
  put(g, 12, 6, 'G');
  put(g, 8, 12, 'S'); put(g, 9, 12, 'S');
  put(g, 8, 1, 'S'); put(g, 9, 1, 'S');
  for (const [x, y] of [[1, 4], [1, 8], [11, 3], [11, 9]]) put(g, x, y, 'g');
  put(g, 3, 1, 'q');
  rect(g, 5, 8, 2, 1, 'x');
  return rows(g);
}

const TOWER2: MapDef = {
  id: 'tower2', name: '鐘楼・二階（組合の間）', theme: 'tower', bgm: 'tower',
  tiles: tower2Tiles(),
  warps: [
    { x: 8, y: 12, to: 'tower1', tx: 8, ty: 2, dir: 2 },
    { x: 9, y: 12, to: 'tower1', tx: 9, ty: 2, dir: 2 },
    { x: 8, y: 1, to: 'tower3', tx: 7, ty: 10, dir: 0 },
    { x: 9, y: 1, to: 'tower3', tx: 8, ty: 10, dir: 0 },
  ],
  patches: [{ cond: 'f:vault_open', tiles: [[12, 6, '_']] }],
  npcs: [],
  objs: [
    { id: 't2e1', x: 5, y: 6, kind: 'enemy', battle: 'b_t2a', respawn: true, sprite: 'attendant' },
    { id: 't2e2', x: 10, y: 4, kind: 'enemy', battle: 'b_t2b', respawn: true, sprite: 'beast' },
    { id: 't2f1', x: 3, y: 10, kind: 'enemy', battle: 'b_t2flood', respawn: true, sprite: 'shade', cond: 'f:t2_flood' },
    { id: 't2f2', x: 10, y: 9, kind: 'enemy', battle: 'b_t2flood', respawn: true, sprite: 'shade', cond: 'f:t2_flood' },
    { id: 't2c1', x: 2, y: 6, kind: 'chest', item: 'hammer' },
    { id: 't2v1', x: 14, y: 5, kind: 'chest', item: 'clock' },
    { id: 't2v2', x: 15, y: 7, kind: 'chest', item: 'crystal', n: 2 },
    { id: 't2v3', x: 16, y: 5, kind: 'chest', item: 'gold200' },
    {
      id: 'inscription', x: 3, y: 1, kind: 'inspect', label: '碑文',
      talk: [
        { cond: '!r:r_inscription', ev: [
          N('壁の石像の台座に、碑文が刻まれている。'),
          N('「王は見られることを拒む。打たれることではなく、打たれて『在る』と知られることを拒む。知られるたび、王は石を纏う」'),
          REC('r_inscription'),
          S('セイル', '打たれることではなく、知られること……攻撃と防御の間に、もう一つ出来事が挟まっているのか'),
        ] },
        { ev: [N('沈黙の王の碑文。「知られるたび、王は石を纏う」')] },
      ],
    },
    {
      id: 'signal', x: 2, y: 10, kind: 'inspect', hiddenCond: 'x:14', label: '礎石',
      talk: [
        { cond: '!r:r_signal', ev: [
          N('床の礎石に、かすれた文字が刻まれている。目を凝らさなければ見えないほど薄い。'),
          N('「この鐘は命令ではない。朝が来たことを、皆で分け合うための合図である」'),
          REC('r_signal'),
          S('セイル', '鐘は、命令じゃなかった……？ 世界簿が書き換える前の、最初の「原因」だ'),
        ] },
        { ev: [N('最初の鐘の由来が刻まれた礎石。')] },
      ],
    },
    {
      id: 'vault', x: 12, y: 6, kind: 'inspect', cond: '!f:vault_open', label: '組合保管庫',
      talk: [
        { cond: 'q:sq3=1 & u:hold', ev: [{
          t: 'puzzle', id: 'p_vault',
          out: { o_open: [N('北の錘が下がったまま、南の錘も沈んだ。重い扉が開く。'), SET('vault_open'), Q('sq3', 99), EXP(50)] },
          cancel: [N('（保管庫を調べれば、もう一度編集できる）')],
        }] },
        { cond: 'q:sq3=1', ev: [N('二つの錘の仕掛け。南を下げると北が上がる。……何かを「確定させずに止めておく」力がなければ開けられそうにない。')] },
        { ev: [N('時計組合の保管庫。鍵穴はなく、錘の仕掛けで閉じている。組合の人に聞いてみよう。')] },
      ],
    },
  ],
  onEnter: [{ cond: '!f:t2_enter', ev: [
    N('上の階へ向かう足音がする。……見上げると、寝間着の少女が階段を登っていくところだった。'),
    S('セイル', '女の子……眠ってる？'),
    N('少女の足取りは、一歩ごとに揺らいでいた。踏み出したのか、まだなのか。その一歩が「確定していない」ように見える。'),
    S('セイル', '（結果を確定させないまま、止めておく……あれは、因果の「保留」だ）'),
    { t: 'unlock', op: 'hold' }, SET('t2_enter'),
    TOAST('因果編集「保留」が使えるようになった（保留できる出来事は明示される）'),
    IF('f:t2_flood', [N('……一階から流れ込んだ影が、そこらじゅうを徘徊している。')]),
  ] }],
};

function tower3Tiles(): string[] {
  const g = towerTiles(16, 12);
  rect(g, 7, 3, 2, 2, 'Y');
  put(g, 7, 11, 'S'); put(g, 8, 11, 'S');
  for (const [x, y] of [[2, 2], [13, 2], [2, 8], [13, 8]]) put(g, x, y, 'p');
  return rows(g);
}

const TOWER3: MapDef = {
  id: 'tower3', name: '鐘楼・頂', theme: 'top', bgm: 'top',
  tiles: tower3Tiles(),
  warps: [
    { x: 7, y: 11, to: 'tower2', tx: 8, ty: 2, dir: 2 },
    { x: 8, y: 11, to: 'tower2', tx: 9, ty: 2, dir: 2 },
  ],
  npcs: [
    {
      id: 'towa', name: 'トワ', x: 8, y: 6, sprite: 'towa', dir: 0, cond: '!f:chapter1_done | f:end_bell | f:end_keep',
      talk: [
        { cond: 'f:end_bell', ev: [S('トワ', '毎朝六時に鐘を撞くの。それが鐘守の役目。……役目って、安心するね。少しだけ、窮屈だけど')] },
        { ev: [N('トワは眠ったまま、小さく唇を動かしている。'), S('トワ', '……あさ……みんなの、あさ……')] },
      ],
    },
  ],
  objs: [
    {
      id: 'bell', x: 7, y: 4, kind: 'inspect', label: '灰鐘',
      talk: [
        { cond: 'f:king_beaten & !f:chapter1_done', ev: [N('鐘の舌を手に、鐘を見上げる。'), MORNING_PUZZLE] },
        { cond: 'f:end_bell | f:end_share', ev: [N('灰鐘。舌が戻り、朝ごとに音を響かせている。')] },
        { ev: [N('舌のない鐘。触れると、鳴らないはずの音が、指先にだけ響いた気がした。')] },
      ],
    },
    { id: 'bell2', x: 8, y: 4, kind: 'inspect', label: '灰鐘', talk: [{ ev: [N('巨大な鐘。内側に、何かが貼りついている。')] }] },
  ],
  onEnter: [{ cond: '!f:towa_scene', ev: [
    N('鐘楼の頂。巨大な鐘が吊られている。'),
    N('その下で、少女が舌のない鐘を撞いていた。音は鳴らない。それでも少女は、決まった回数だけ腕を振る。'),
    S('セイル', '君は……トワ？'),
    N('返事はない。少女は眠ったまま、鐘を撞き続けている。'),
    N('鐘の内側に、世界簿の断片が貼りついていた。'),
    N('「灰鐘市の習慣の原因：鐘の音 → 切断。代替原因：鐘守トワの意志を充当」'),
    REC('r_will'), REC('r_towa'),
    S('セイル', '街の人たちが鐘なしで動けていたのは……この子の意志を、鐘の代わりに使っていたからだ'),
    IF('p:dran', [S('ドラン', 'ガキ一人の意志で、街一つを回してたってのか。……胸糞の悪い話だ')]),
    N('鐘の影から、王冠を戴いた石像が立ち上がった。腕には、鐘の舌を抱えている。'),
    S('沈黙の王', '…………'),
    S('セイル', '（あれが、切り離された「鐘の音」の原因を抱えている……！）'),
    IF('!r:r_inscription', [S('セイル', '（あの王の仕組みが分からない。二階の碑文を読んでおくべきだったか……）')]),
    SET('towa_scene'), Q('mq2', 3), { t: 'save' },
    KING_BATTLE,
  ] },
  { cond: 'f:towa_scene & !f:king_beaten', ev: [
    N('鐘の影で、沈黙の王が再び立ち上がった。'),
    { t: 'choice', q: '沈黙の王に挑みますか？', opts: [
      { label: '挑む', ev: [KING_BATTLE] },
      { label: 'いったん退く（二階へ戻る）', ev: [{ t: 'warp', map: 'tower2', x: 8, y: 2, dir: 2 }] },
    ] },
  ] }],
};

export const MAPS: MapDef[] = [ARCHIVE, TOWN, HOME, CORRIDOR, EAST, TOWER1, TOWER2, TOWER3];
export const MAP_MAP = new Map(MAPS.map(m => [m.id, m]));

export const WALKABLE = new Set(['.', ',', 'r', '"', ':', 'D', 'V', 'S', 'k', '_']);

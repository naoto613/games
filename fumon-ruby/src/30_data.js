// ================================================================ moves / items / monster instances
// fx: anim kind; eff: secondary effect
const MOVES = {
  tackle: { n: 'たいあたり', t: 'ノーマル', p: 40, a: 100, pp: 35, fx: 'hit' },
  scratch: { n: 'ひっかく', t: 'ノーマル', p: 40, a: 100, pp: 35, fx: 'slash' },
  peck: { n: 'つつく', t: 'ひこう', p: 35, a: 100, pp: 35, fx: 'hit' },
  growl: { n: 'なきごえ', t: 'ノーマル', p: 0, a: 100, pp: 40, fx: 'sound', eff: { foe: 'atk', d: -1 } },
  tailwhip: { n: 'しっぽをふる', t: 'ノーマル', p: 0, a: 100, pp: 30, fx: 'wiggle', eff: { foe: 'def', d: -1 } },
  harden: { n: 'かたくなる', t: 'ノーマル', p: 0, a: 0, pp: 30, fx: 'shine', eff: { self: 'def', d: 1 } },
  swords: { n: 'つるぎのまい', t: 'ノーマル', p: 0, a: 0, pp: 20, fx: 'shine', eff: { self: 'atk', d: 2 } },
  agility: { n: 'こうそくいどう', t: 'エスパー', p: 0, a: 0, pp: 30, fx: 'shine', eff: { self: 'spd', d: 2 } },
  recover: { n: 'じこさいせい', t: 'ノーマル', p: 0, a: 0, pp: 10, fx: 'heal', eff: { heal: 0.5 } },
  quick: { n: 'でんこうせっか', t: 'ノーマル', p: 40, a: 100, pp: 30, fx: 'dash', pri: 1 },
  bite: { n: 'かみつく', t: 'ノーマル', p: 60, a: 100, pp: 25, fx: 'bite' },
  crunch: { n: 'かみくだく', t: 'ノーマル', p: 80, a: 100, pp: 15, fx: 'bite', eff: { foe: 'def', d: -1, ch: 0.2 } },
  bodyslam: { n: 'のしかかり', t: 'ノーマル', p: 85, a: 100, pp: 15, fx: 'hit', eff: { st: 'まひ', ch: 0.3 } },
  ember: { n: 'ひのこ', t: 'ほのお', p: 40, a: 100, pp: 25, fx: 'fire', eff: { st: 'やけど', ch: 0.1 } },
  flamewheel: { n: 'かえんぐるま', t: 'ほのお', p: 60, a: 100, pp: 25, fx: 'fire', eff: { st: 'やけど', ch: 0.1 } },
  flamethrower: { n: 'かえんほうしゃ', t: 'ほのお', p: 90, a: 100, pp: 15, fx: 'fire', eff: { st: 'やけど', ch: 0.1 } },
  blast: { n: 'だいもんじ', t: 'ほのお', p: 110, a: 85, pp: 5, fx: 'bigfire', eff: { st: 'やけど', ch: 0.1 } },
  peck2: { n: 'ほのおのキック', t: 'ほのお', p: 70, a: 100, pp: 20, fx: 'fire' },
  watergun: { n: 'みずでっぽう', t: 'みず', p: 40, a: 100, pp: 25, fx: 'water' },
  pulse: { n: 'みずのはどう', t: 'みず', p: 60, a: 100, pp: 20, fx: 'water' },
  surf: { n: 'なみのり', t: 'みず', p: 90, a: 100, pp: 15, fx: 'wave' },
  absorb: { n: 'すいとる', t: 'くさ', p: 25, a: 100, pp: 25, fx: 'drain', eff: { drain: 0.5 } },
  megadrain: { n: 'メガドレイン', t: 'くさ', p: 50, a: 100, pp: 15, fx: 'drain', eff: { drain: 0.5 } },
  razor: { n: 'はっぱカッター', t: 'くさ', p: 55, a: 95, pp: 25, fx: 'leaf', crit: 1 },
  leafblade: { n: 'リーフブレード', t: 'くさ', p: 90, a: 100, pp: 15, fx: 'leaf', crit: 1 },
  sleeppowder: { n: 'ねむりごな', t: 'くさ', p: 0, a: 75, pp: 15, fx: 'powder', eff: { st: 'ねむり', ch: 1 } },
  poisonpowder: { n: 'どくのこな', t: 'むし', p: 0, a: 75, pp: 35, fx: 'powder', eff: { st: 'どく', ch: 1 } },
  thundershock: { n: 'でんきショック', t: 'でんき', p: 40, a: 100, pp: 30, fx: 'zap', eff: { st: 'まひ', ch: 0.1 } },
  spark: { n: 'スパーク', t: 'でんき', p: 65, a: 100, pp: 20, fx: 'zap', eff: { st: 'まひ', ch: 0.3 } },
  thunderbolt: { n: '10まんボルト', t: 'でんき', p: 90, a: 100, pp: 15, fx: 'bolt', eff: { st: 'まひ', ch: 0.1 } },
  thunderwave: { n: 'でんじは', t: 'でんき', p: 0, a: 100, pp: 20, fx: 'zap', eff: { st: 'まひ', ch: 1 } },
  rockthrow: { n: 'いわおとし', t: 'いわ', p: 50, a: 90, pp: 15, fx: 'rock' },
  rockslide: { n: 'いわなだれ', t: 'いわ', p: 75, a: 90, pp: 10, fx: 'rock' },
  stoneedge: { n: 'ストーンエッジ', t: 'いわ', p: 100, a: 80, pp: 5, fx: 'rock', crit: 1 },
  mudslap: { n: 'どろかけ', t: 'じめん', p: 20, a: 100, pp: 10, fx: 'mud', eff: { foe: 'acc', d: -1, ch: 1 } },
  mudshot: { n: 'マッドショット', t: 'じめん', p: 55, a: 95, pp: 15, fx: 'mud', eff: { foe: 'spd', d: -1, ch: 1 } },
  quake: { n: 'じしん', t: 'じめん', p: 100, a: 100, pp: 10, fx: 'quake' },
  magmabreak: { n: 'マグマブレイク', t: 'じめん', p: 120, a: 90, pp: 5, fx: 'magma' },
  gust: { n: 'かぜおこし', t: 'ひこう', p: 40, a: 100, pp: 35, fx: 'wind' },
  wing: { n: 'つばさでうつ', t: 'ひこう', p: 60, a: 100, pp: 35, fx: 'slash' },
  airslash: { n: 'エアスラッシュ', t: 'ひこう', p: 75, a: 95, pp: 15, fx: 'wind' },
  bravebird: { n: 'ブレイブバード', t: 'ひこう', p: 110, a: 100, pp: 10, fx: 'dash' },
  string: { n: 'いとをはく', t: 'むし', p: 0, a: 95, pp: 40, fx: 'string', eff: { foe: 'spd', d: -1 } },
  bugbite: { n: 'むしくい', t: 'むし', p: 50, a: 100, pp: 20, fx: 'bite' },
  leechlife: { n: 'きゅうけつ', t: 'むし', p: 30, a: 100, pp: 15, fx: 'drain', eff: { drain: 0.5 } },
  xscissor: { n: 'シザークロス', t: 'むし', p: 80, a: 100, pp: 15, fx: 'slash' },
  confusion: { n: 'ねんりき', t: 'エスパー', p: 50, a: 100, pp: 25, fx: 'psy' },
  psybeam: { n: 'サイケこうせん', t: 'エスパー', p: 65, a: 100, pp: 20, fx: 'psy' },
  psychic: { n: 'サイコキネシス', t: 'エスパー', p: 90, a: 100, pp: 10, fx: 'psy', eff: { foe: 'def', d: -1, ch: 0.1 } },
  hypnosis: { n: 'さいみんじゅつ', t: 'エスパー', p: 0, a: 65, pp: 20, fx: 'psy', eff: { st: 'ねむり', ch: 1 } },
  dragonbreath: { n: 'りゅうのいぶき', t: 'ドラゴン', p: 60, a: 100, pp: 20, fx: 'bigfire', eff: { st: 'まひ', ch: 0.3 } },
  dragonclaw: { n: 'ドラゴンクロー', t: 'ドラゴン', p: 80, a: 100, pp: 15, fx: 'slash' },
};
const STAT_N = { atk: 'こうげき', def: 'ぼうぎょ', spd: 'すばやさ', acc: 'めいちゅう' };
const ST_SHORT = { 'まひ': 'まひ', 'やけど': 'やけど', 'ねむり': 'ねむり', 'どく': 'どく' };
const ST_COL = { 'まひ': '#d8b020', 'やけど': '#e05030', 'ねむり': '#8888a0', 'どく': '#a050c0' };

const ITEMS = {
  potion: { n: 'きずぐすり', price: 200, heal: 20, desc: 'HPを 20 かいふく', use: 'mon' },
  superpotion: { n: 'いいきずぐすり', price: 500, heal: 60, desc: 'HPを 60 かいふく', use: 'mon' },
  hyperpotion: { n: 'すごいきずぐすり', price: 1000, heal: 200, desc: 'HPを 200 かいふく', use: 'mon' },
  fullheal: { n: 'なんでもなおし', price: 250, cure: true, desc: 'まひ・やけど・ねむり・どくを なおす', use: 'mon' },
  revive: { n: 'げんきのかけら', price: 1500, revive: true, desc: 'きぜつした ふーモンを げんきにする', use: 'mon' },
  ball: { n: 'ふーモンボール', price: 200, ball: 1, desc: 'やせいの ふーモンを つかまえる ボール', use: 'ball' },
  great: { n: 'スーパーボール', price: 600, ball: 1.5, desc: 'つかまえやすい ボール', use: 'ball' },
  ultra: { n: 'ハイパーボール', price: 1200, ball: 2, desc: 'とても つかまえやすい ボール', use: 'ball' },
  repel: { n: 'むしよけスプレー', price: 350, repel: 100, desc: 'しばらく やせいの ふーモンが でにくくなる', use: 'field' },
  redorb: { n: 'あかいたま', key: true, desc: 'だいちの ちからを ひめた ふしぎな たま' },
  shoes: { n: 'ランニングシューズ', key: true, desc: 'Bボタンを おしながら あるくと はしれる' },
};

const expFor = lv => Math.floor(lv * lv * lv * 0.6);
function calcStats(m) {
  const b = MON[m.sp].b, lv = m.lv;
  const hp = Math.floor(b[0] * 2 * lv / 100) + lv + 10;
  const s = i => Math.floor(b[i] * 2 * lv / 100) + 5;
  const dh = hp - (m.maxhp || hp);
  m.maxhp = hp; m.atk = s(1); m.def = s(2); m.spd = s(3);
  if (m.hp == null) m.hp = hp; else if (m.hp > 0) m.hp = Math.min(hp, m.hp + Math.max(0, dh));
}
function movesAt(sp, lv) {
  const list = MON[sp].mv.filter(([l]) => l <= lv).map(x => x[1]);
  return [...new Set(list)].slice(-4);
}
function makeMon(sp, lv, o = {}) {
  const m = { sp, lv, exp: expFor(lv), hp: null, st: null, moves: [] };
  calcStats(m);
  m.moves = (o.moves || movesAt(sp, lv)).map(id => ({ id, pp: MOVES[id].pp }));
  return m;
}
const monName = m => m.nick || MON[m.sp].name;
const monTypes = m => MON[m.sp].t;
function healMon(m) { m.hp = m.maxhp; m.st = null; for (const mv of m.moves) mv.pp = MOVES[mv.id].pp; }

// ================================================================ data
const PARTY_DEF = {
  sieg: { name: 'ジーク', full: 'ジーク・ヴァルド', title: '下町の一匹狼', age: 21, hp: 420, tp: 80, atk: 38, def: 22, mat: 16, mdef: 16, role: 'player', desc: '帝都アウレリアの下町で暮らす元騎士。口は悪いが面倒見がよく、理不尽を見過ごせない。' },
  lucia: { name: 'リュシア', full: 'リュシア・エルフェン', title: '城を抜け出した令嬢', age: 18, hp: 360, tp: 140, atk: 26, def: 22, mat: 34, mdef: 30, role: 'healer', desc: '貴族街の令嬢。星核に頼らず癒しの術を使える不思議な力を持つ。世間知らずだが芯は強い。' },
  noa: { name: 'ノア', full: 'ノア・ブリッツ', title: '天才星核術士', age: 15, hp: 300, tp: 160, atk: 18, def: 14, mat: 46, mdef: 32, role: 'mage', desc: '星核研究の若き天才。人付き合いは苦手で口より先に術が出る。星核のことになると目の色が変わる。' },
};
const GROW = 0.13;
function statOf(id, lv) {
  const d = PARTY_DEF[id], g = 1 + (lv - 1) * GROW;
  return { mhp: Math.round(d.hp * (1 + (lv - 1) * 0.16)), mtp: Math.round(d.tp * (1 + (lv - 1) * 0.08)), atk: Math.round(d.atk * g), def: Math.round(d.def * g), mat: Math.round(d.mat * g), mdef: Math.round(d.mdef * g) };
}
const expNext = lv => Math.floor(60 * Math.pow(lv, 1.5));

// ---------------------------------------------------------------- Sieg's artes
// hit: { t, r: reach, arc: half angle, dmg, kb, lift, stun, fs, up(hit air), aoe:radius around self, y }
const ARTES = {
  souseninn: { name: '蒼閃刃', en: 'Azure Fang', dir: 'n', tier: 'base', lv: 1, tp: 7, clip: 'upSlashWave', dur: 0.62, cancel: 0.42, proj: [{ t: 0.22, kind: 'wave', speed: 15, life: 0.7, dmg: 1.45, kb: 3, fs: 'blue', stun: 0.45 }], fs: 'blue', desc: '地を這う衝撃波を放つ' },
  garou: { name: '牙狼撃', en: 'Fang Rush', dir: 'f', tier: 'base', lv: 1, tp: 9, clip: 'thrust', dur: 0.66, cancel: 0.46, lunge: [0.08, 0.3, 13], hits: [{ t: 0.18, r: 2.2, arc: 0.7, dmg: 0.9, kb: 1, stun: 0.4, fs: 'red' }, { t: 0.3, r: 2.4, arc: 0.7, dmg: 1.1, kb: 5, stun: 0.5, fs: 'red' }], fs: 'red', desc: '踏み込みながら鋭い突きを放つ' },
  getsuga: { name: '月牙昇', en: 'Crescent Rise', dir: 'u', tier: 'base', lv: 3, tp: 9, clip: 'rising', dur: 0.72, cancel: 0.5, jump: [0.12, 8.5], hits: [{ t: 0.12, r: 2.0, arc: 0.8, dmg: 0.9, lift: 9, stun: 0.6, fs: 'green' }, { t: 0.26, r: 2.1, arc: 0.8, dmg: 1.0, lift: 7, stun: 0.6, fs: 'green' }], fs: 'green', desc: '斬り上げで敵を宙に打ち上げる' },
  bakusai: { name: '爆砕陣', en: 'Burst Ring', dir: 'd', tier: 'base', lv: 5, tp: 11, clip: 'spin', dur: 0.75, cancel: 0.55, hits: [{ t: 0.15, aoe: 2.6, dmg: 0.7, kb: 2, stun: 0.4, fs: 'blue' }, { t: 0.3, aoe: 2.6, dmg: 0.7, kb: 2, stun: 0.4, fs: 'blue' }, { t: 0.45, aoe: 2.8, dmg: 0.9, kb: 6, stun: 0.5, fs: 'blue', fx: 'ring' }], fs: 'blue', desc: '回転斬りで周囲をなぎ払う' },
  houshu: { name: '崩襲脚', en: 'Falling Talon', dir: 'air', tier: 'base', lv: 2, tp: 7, clip: 'diveKick', dur: 0.55, cancel: 0.45, dive: 18, hits: [{ t: 0.1, r: 1.6, arc: 1.0, dmg: 1.2, kb: 2, stun: 0.5, fs: 'red', onLand: 1, fx: 'ring' }], fs: 'red', desc: '空中から急降下して蹴りつける（空中で術技）' },
  soga: { name: '蒼閃・双牙', en: 'Twin Azure', dir: 'n', tier: 'arcane', lv: 4, tp: 15, clip: 'doubleWave', dur: 0.9, cancel: 0.7, proj: [{ t: 0.2, kind: 'wave', speed: 16, life: 0.75, dmg: 1.3, kb: 2, fs: 'blue', stun: 0.5, big: 1 }, { t: 0.45, kind: 'wave', speed: 18, life: 0.75, dmg: 1.6, kb: 5, fs: 'blue', stun: 0.6, big: 1.4 }], fs: 'blue', desc: '二連の巨大な衝撃波（蒼閃刃から派生）' },
  reppa: { name: '牙狼・烈破', en: 'Fang Barrage', dir: 'f', tier: 'arcane', lv: 7, tp: 17, clip: 'barrage', dur: 1.0, cancel: 0.82, lunge: [0.0, 0.15, 10], hits: [0.12, 0.2, 0.28, 0.36, 0.44].map(t => ({ t, r: 2.2, arc: 0.7, dmg: 0.45, kb: 0.4, stun: 0.4, fs: 'red' })).concat([{ t: 0.62, r: 2.6, arc: 0.8, dmg: 1.4, kb: 7, stun: 0.6, fs: 'red', fx: 'burst' }]), fs: 'red', desc: '高速の連続突きから爆ぜる一撃（牙狼撃から派生）' },
  shoha: { name: '天狼・翔破', en: 'Sky Wolf', dir: 'u', tier: 'arcane', lv: 9, tp: 17, clip: 'skySpin', dur: 1.05, cancel: 0.85, jump: [0.05, 10], hits: [0.1, 0.2, 0.3, 0.4].map(t => ({ t, aoe: 2.4, dmg: 0.5, lift: 5, stun: 0.6, fs: 'green', y: 1 })).concat([{ t: 0.75, aoe: 3.2, dmg: 1.5, kb: 6, stun: 0.7, fs: 'green', onLand: 1, fx: 'ring' }]), slam: 0.55, fs: 'green', desc: '旋回しながら舞い上がり、叩きつける（月牙昇から派生）' },
  enbu: { name: '漸影・円舞', en: 'Shadow Waltz', dir: 'd', tier: 'arcane', lv: 6, tp: 19, clip: 'waltz', dur: 1.05, cancel: 0.85, hits: [0.1, 0.22, 0.34, 0.46, 0.58].map(t => ({ t, aoe: 3.0, dmg: 0.5, kb: 0.5, stun: 0.45, fs: 'blue' })).concat([{ t: 0.74, aoe: 3.4, dmg: 1.3, kb: 7, stun: 0.6, fs: 'blue', fx: 'ring' }]), fs: 'blue', desc: '影を纏う連続回転斬り（爆砕陣から派生）' },
};
const BURST = { name: '宵星狼牙陣', en: 'Burst Arte', hits: 10, dmg: 0.55, fin: 2.4 };
const MYSTIC = { name: '天狼滅牙・宵星', en: 'Mystic Arte', ruby: 'てんろうめつが・よいぼし', dmg: 16 };
// directional arte slots for Sieg: [base, arcane]
const SLOTS = { n: ['souseninn', 'soga'], f: ['garou', 'reppa'], u: ['getsuga', 'shoha'], d: ['bakusai', 'enbu'], air: ['houshu', null] };

// ally artes / spells
const SPELLS = {
  heal: { name: 'ヒールライト', tp: 14, cast: 1.1, kind: 'heal', pow: 0.32, lv: 1 },
  circle: { name: 'ナースサークル', tp: 30, cast: 2.0, kind: 'healAll', pow: 0.3, lv: 5 },
  revive: { name: 'リヴァイヴ', tp: 36, cast: 2.2, kind: 'revive', pow: 0.35, lv: 1 },
  stellar: { name: 'ステラレイ', tp: 15, cast: 1.3, kind: 'pillar', dmg: 1.7, elem: 'light', lv: 3, fs: 'green' },
  blaze: { name: 'ブレイズボルト', tp: 10, cast: 1.0, kind: 'fireballs', dmg: 0.8, n: 3, elem: 'fire', lv: 1, fs: 'red' },
  icicle: { name: 'アイシクルエッジ', tp: 14, cast: 1.4, kind: 'icicle', dmg: 1.7, elem: 'ice', lv: 1, fs: 'blue' },
  spark: { name: 'スパークウェブ', tp: 18, cast: 1.6, kind: 'spark', dmg: 0.45, n: 6, elem: 'thunder', lv: 4, fs: 'green' },
  gaia: { name: 'ガイアブレイク', tp: 28, cast: 2.4, kind: 'gaia', dmg: 2.8, elem: 'earth', lv: 8, fs: 'red' },
  // enemy spells
  eFire: { name: 'ダークフレア', cast: 1.4, kind: 'fireballs', dmg: 0.9, n: 3, elem: 'fire' },
  eThunder: { name: 'ライトニング', cast: 1.6, kind: 'bolt', dmg: 1.4, elem: 'thunder' },
  eMeteor: { name: 'ブラッディ・ノヴァ', cast: 2.6, kind: 'nova', dmg: 2.0, elem: 'dark' },
};
const ALLY_KIT = {
  lucia: { melee: { name: '光翼閃', tp: 6 }, spells: ['heal', 'circle', 'revive', 'stellar'] },
  noa: { melee: null, spells: ['blaze', 'icicle', 'spark', 'gaia'] },
};

// ---------------------------------------------------------------- enemies
const ENEMY = {
  wolf: { name: 'ラガウルフ', model: 'wolf', hp: 170, atk: 30, def: 10, mdef: 8, spd: 6.5, exp: 42, lux: 14, fs: 'red', ai: 'melee', range: 1.8, rad: 0.7, h: 1.1, atks: [{ act: 'bite', dur: 0.75, t: 0.35, r: 2.0, dmg: 1.0, kb: 4 }, { act: 'lunge', dur: 0.9, t: 0.42, r: 2.6, dmg: 1.2, kb: 5, dash: 11 }], drops: [['gummy', 0.12]] },
  wolf2: { name: 'ブラッドウルフ', model: 'wolf2', hp: 380, atk: 52, def: 22, mdef: 16, spd: 7.5, exp: 85, lux: 26, fs: 'green', ai: 'melee', range: 1.9, rad: 0.8, h: 1.2, atks: [{ act: 'bite', dur: 0.7, t: 0.3, r: 2.1, dmg: 1.0, kb: 4 }, { act: 'lunge', dur: 0.85, t: 0.38, r: 2.8, dmg: 1.3, kb: 6, dash: 13 }], drops: [['gummy', 0.15], ['lemon', 0.08]] },
  beetle: { name: 'ストーンビートル', model: 'beetle', hp: 290, atk: 34, def: 26, mdef: 6, spd: 3.5, exp: 58, lux: 22, fs: 'blue', ai: 'charger', range: 2.0, rad: 0.9, h: 1.0, armor: 1, atks: [{ act: 'bite', dur: 0.8, t: 0.4, r: 2.0, dmg: 1.0, kb: 5 }, { act: 'charge', dur: 1.3, t: 0.3, r: 1.8, dmg: 1.3, kb: 8, dash: 12, multi: 1 }], drops: [['gummy', 0.2]] },
  beetle2: { name: 'アメジストビートル', model: 'beetle2', hp: 620, atk: 62, def: 44, mdef: 14, spd: 4, exp: 140, lux: 40, fs: 'red', ai: 'charger', range: 2.2, rad: 1.1, h: 1.2, armor: 2, atks: [{ act: 'bite', dur: 0.8, t: 0.4, r: 2.3, dmg: 1.0, kb: 5 }, { act: 'charge', dur: 1.3, t: 0.3, r: 2.0, dmg: 1.4, kb: 9, dash: 14, multi: 1 }], drops: [['mix', 0.12]] },
  bloom: { name: 'ポイズンブルーム', model: 'bloom', hp: 140, atk: 28, def: 8, mdef: 18, spd: 0, exp: 36, lux: 12, fs: 'green', ai: 'turret', range: 12, rad: 0.7, h: 1.6, atks: [{ act: 'shoot', dur: 0.9, t: 0.45, proj: 'seed', dmg: 1.0, kb: 3 }, { act: 'bite', dur: 0.8, t: 0.35, r: 1.8, dmg: 1.0, kb: 4, near: 1 }], drops: [['lemon', 0.1]] },
  bloom2: { name: 'ミラージュブルーム', model: 'bloom2', hp: 320, atk: 50, def: 16, mdef: 30, spd: 0, exp: 76, lux: 24, fs: 'red', ai: 'turret', range: 13, rad: 0.8, h: 1.9, atks: [{ act: 'shoot', dur: 0.8, t: 0.4, proj: 'seed', n: 3, dmg: 0.8, kb: 3 }, { act: 'bite', dur: 0.8, t: 0.35, r: 2.0, dmg: 1.0, kb: 4, near: 1 }], drops: [['lemon', 0.15]] },
  assassin: { name: '赤眼の刺客', model: 'assassin', hp: 150, atk: 24, def: 8, mdef: 8, spd: 6, exp: 30, lux: 30, fs: 'red', ai: 'human', range: 1.6, rad: 0.45, h: 1.7, atks: [{ clip: 'eSlash', dur: 0.6, t: 0.25, r: 1.8, dmg: 1.0, kb: 3 }, { clip: 'eLunge', dur: 0.8, t: 0.35, r: 2.4, dmg: 1.2, kb: 4, dash: 10 }], drops: [['gummy', 0.5]] },
  soldier: { name: '魔導兵', model: 'soldier', hp: 520, atk: 60, def: 34, mdef: 26, spd: 4.5, exp: 150, lux: 45, fs: 'blue', ai: 'human', guard: 0.35, range: 2.4, rad: 0.5, h: 1.8, atks: [{ clip: 'eHeavy', dur: 1.0, t: 0.5, r: 2.8, dmg: 1.3, kb: 6 }, { clip: 'eSlash', dur: 0.7, t: 0.3, r: 2.4, dmg: 1.0, kb: 3 }], drops: [['mix', 0.1], ['bottle', 0.05]] },
  // bosses
  bear: { name: '森の主 グランベア', model: 'bear', hp: 3200, atk: 64, def: 30, mdef: 20, spd: 5, exp: 900, lux: 400, fs: 'red', ai: 'bear', boss: 1, range: 3.2, rad: 1.7, h: 3.4, armor: 3, atks: [{ act: 'bite', dur: 0.9, t: 0.45, r: 3.4, dmg: 1.0, kb: 6 }, { act: 'slam', dur: 1.3, t: 0.68, aoe: 4.5, dmg: 1.4, kb: 9, shake: 1 }, { act: 'roar', dur: 1.2, t: 0.4, aoe: 7, dmg: 0.4, kb: 10, roar: 1 }, { act: 'charge', dur: 1.5, t: 0.3, r: 2.6, dmg: 1.3, kb: 10, dash: 14, multi: 1 }], drops: [['bottle', 1]] },
  garmo: { name: '盗賊魔導士 ガルモ', model: 'garmo', hp: 3600, atk: 66, def: 30, mdef: 40, spd: 4, exp: 1200, lux: 600, fs: 'green', ai: 'mage', boss: 1, range: 2.2, rad: 0.55, h: 1.9, armor: 2, atks: [{ clip: 'eSlash', dur: 0.8, t: 0.35, r: 2.4, dmg: 1.1, kb: 6 }], spells: ['eFire', 'eThunder', 'eMeteor'], drops: [['mix', 1]] },
  behemoth: { name: '星喰獣 ノクス・ベヒモス', model: 'behemoth', hp: 7600, atk: 82, def: 38, mdef: 32, spd: 5.5, exp: 0, lux: 0, fs: 'blue', ai: 'behemoth', boss: 1, range: 4.6, rad: 2.6, h: 5, armor: 4, atks: [{ act: 'bite', dur: 1.0, t: 0.5, r: 4.8, dmg: 1.1, kb: 7 }, { act: 'slam', dur: 1.4, t: 0.72, aoe: 6, dmg: 1.4, kb: 10, shake: 1 }, { act: 'charge', dur: 1.6, t: 0.3, r: 3.4, dmg: 1.4, kb: 12, dash: 15, multi: 1 }, { act: 'breath', dur: 2.0, t: 0.8, beam: 1, dmg: 0.35, kb: 2 }, { act: 'roar', dur: 1.2, t: 0.4, aoe: 9, dmg: 0.3, kb: 12, roar: 1 }], drops: [] },
};
// encounter groups for field symbols
const GROUPS = {
  town: [['assassin', 'assassin']],
  field: [['wolf', 'wolf'], ['wolf', 'wolf', 'bloom'], ['beetle', 'wolf'], ['bloom', 'bloom', 'wolf'], ['beetle', 'beetle']],
  forest: [['wolf2', 'wolf2'], ['bloom2', 'wolf2', 'bloom'], ['beetle', 'wolf2', 'wolf'], ['bloom2', 'bloom2', 'beetle']],
  ruins: [['soldier', 'soldier'], ['beetle2', 'soldier'], ['soldier', 'wolf2', 'wolf2'], ['beetle2', 'beetle2']],
};

// ---------------------------------------------------------------- items & recipes
const ITEMS = {
  gummy: { name: 'リンゴグミ', price: 40, desc: '味方1人の HP を 35% 回復', use: (c) => c.hp > 0 && heal(c, c.mhp * 0.35) },
  lemon: { name: 'レモングミ', price: 60, desc: '味方1人の TP を 30% 回復', use: (c) => c.hp > 0 && healTP(c, c.mtp * 0.3) },
  mix: { name: 'ミックスグミ', price: 130, desc: '味方1人の HP 40%・TP 25% を回復', use: (c) => c.hp > 0 && (heal(c, c.mhp * 0.4), healTP(c, c.mtp * 0.25), true) },
  bottle: { name: 'ライフボトル', price: 150, desc: '戦闘不能の味方を HP 30% で復活', use: (c) => c.hp <= 0 && (c.hp = Math.round(c.mhp * 0.3), true), dead: 1 },
};
const RECIPES = {
  sandwich: { name: 'サンドイッチ', cost: 20, desc: '全員の HP を 30% 回復', fx: c => heal(c, c.mhp * 0.3) },
  onigiri: { name: 'おにぎり', cost: 20, desc: '全員の TP を 35% 回復', fx: c => healTP(c, c.mtp * 0.35) },
  stew: { name: 'シチュー', cost: 45, desc: '全員の HP を 60% 回復', fx: c => heal(c, c.mhp * 0.6) },
  curry: { name: 'マーボーカレー', cost: 90, desc: '全員の HP・TP を完全回復', fx: c => (heal(c, c.mhp), healTP(c, c.mtp)) },
};
function heal(c, v) { if (c.hp <= 0) return false; const b = c.hp; c.hp = Math.min(c.mhp, Math.round(c.hp + v)); return c.hp > b || true; }
function healTP(c, v) { c.tp = Math.min(c.mtp, Math.round(c.tp + v)); return true; }

// ---------------------------------------------------------------- save state
const S = {
  flags: {}, party: ['sieg'], lux: 120, items: { gummy: 4, lemon: 2, bottle: 1 }, recipes: ['sandwich'],
  chars: {}, area: 'town', pos: null, skitsSeen: {}, fsCount: 0, battles: 0, maxCombo: 0, time: 0, chefs: {},
};
function initChar(id, lv = 1) {
  const st = statOf(id, lv);
  S.chars[id] = Object.assign({ id, lv, exp: 0, hp: st.mhp, tp: st.mtp }, st);
}
function totalExpFor(lv) { let s = 0; for (let i = 1; i < lv; i++) s += expNext(i); return s; }
function gainExp(id, n) {
  const c = S.chars[id]; let ups = 0;
  c.exp += n;
  while (c.exp >= expNext(c.lv)) {
    c.exp -= expNext(c.lv); c.lv++; ups++;
    const st = statOf(id, c.lv); const dh = st.mhp - c.mhp, dt = st.mtp - c.mtp;
    Object.assign(c, st); c.hp += dh; c.tp += dt;
  }
  return ups;
}
function saveGame() { try { localStorage.setItem('stellaNoctis.save', JSON.stringify(S)); return true; } catch (_) { return false; } }
function loadGame() { try { const d = JSON.parse(localStorage.getItem('stellaNoctis.save')); if (!d) return false; Object.assign(S, d); return true; } catch (_) { return false; } }
function hasSave() { try { return !!localStorage.getItem('stellaNoctis.save'); } catch (_) { return false; } }

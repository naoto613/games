'use strict';
// ===== 武器 =====
// 0: バスター / 1〜8: ボス武器
const WEAPONS = [
  { id: 'buster', name: 'リオバスター', en: 'R.BUSTER', a: '#22b8c8', b: '#eef4ff', s: '#ff4058', cost: 0, desc: 'ためうちで つよい いちげき' },
  { id: 'flare', name: 'フレアウェーブ', en: 'FLARE WAVE', a: '#ff5a1f', b: '#ffd23a', s: '#ffe9a0', cost: 2, desc: 'じめんを はしる ほのおの なみ' },
  { id: 'bubble', name: 'バブルシーカー', en: 'BUBBLE SEEKER', a: '#2a6cff', b: '#a6ecff', s: '#ffffff', cost: 1, desc: 'てきを おいかける あわ' },
  { id: 'volt', name: 'ボルトフォーク', en: 'VOLT FORK', a: '#e8c400', b: '#4a3aa0', s: '#fff6a0', cost: 2, desc: '3ほうこうに とぶ でんげき' },
  { id: 'ice', name: 'フロストランス', en: 'FROST LANCE', a: '#68c8ff', b: '#ffffff', s: '#c0f0ff', cost: 2, desc: 'てきを つらぬき こおらせる やり' },
  { id: 'rock', name: 'ロックバウンド', en: 'ROCK BOUND', a: '#9a6a3a', b: '#e8cc98', s: '#ffb040', cost: 2, desc: 'はねる いわ。ヒビの はいった かべも くだく' },
  { id: 'cyclone', name: 'ゲイルツイスター', en: 'GALE TWISTER', a: '#2cc890', b: '#e8fff4', s: '#9ff0d0', cost: 3, desc: 'たつまき。のると たかく まいあがれる' },
  { id: 'star', name: 'ステラノヴァ', en: 'STELLA NOVA', a: '#a050ff', b: '#ffe680', s: '#ff9af0', cost: 7, desc: 'がめんの てき すべてに ダメージ' },
  { id: 'leaf', name: 'ヴァインリーフ', en: 'VINE LEAF', a: '#36a040', b: '#c8f070', s: '#ff8ab0', cost: 3, desc: 'まわりを まもる はっぱ。もういちど うつと とばす' },
];

// ===== ボス =====
// weak: そのボスに よく効く 武器番号 / weapon: 倒すと もらえる 武器番号
const BOSSES = {
  volca: { name: 'ヴォルカ・ギア', en: 'VOLCA GEAR', weapon: 1, weak: 2, stage: 'volca', helm: 'flame',
    a: '#d8401a', b: '#ffb424', c: '#3a1a12', eye: '#fff36a', line: 'おれの ほのおで とかしてやる！' },
  aqua: { name: 'アクア・ギア', en: 'AQUA GEAR', weapon: 2, weak: 3, stage: 'aqua', helm: 'fin',
    a: '#1a64d8', b: '#7ee0ff', c: '#0c2448', eye: '#ffffff', line: 'しんかいの そこへ ごあんない♪' },
  spark: { name: 'スパーク・ギア', en: 'SPARK GEAR', weapon: 3, weak: 5, stage: 'spark', helm: 'horn',
    a: '#e8c000', b: '#5a46c0', c: '#1c1440', eye: '#7ff7ff', line: 'ビリビリ しびれさせて やるぜ！' },
  frost: { name: 'フロスト・ギア', en: 'FROST GEAR', weapon: 4, weak: 7, stage: 'frost', helm: 'crystal',
    a: '#5ab8f0', b: '#f0faff', c: '#1a3a5a', eye: '#2a4aff', line: 'こおりつく がいい…。' },
  terra: { name: 'テラ・ギア', en: 'TERRA GEAR', weapon: 5, weak: 6, stage: 'terra', helm: 'rock',
    a: '#8a5a30', b: '#d8b070', c: '#3a2410', eye: '#ffcc33', line: 'いわより かたい この からだ！' },
  gale: { name: 'ゲイル・ギア', en: 'GALE GEAR', weapon: 6, weak: 4, stage: 'gale', helm: 'wing',
    a: '#22b888', b: '#f0fff8', c: '#0e3a30', eye: '#ffffff', line: 'かぜに のれない やつは おちろ！' },
  stella: { name: 'ステラ・ギア', en: 'STELLA GEAR', weapon: 7, weak: 8, stage: 'stella', helm: 'star',
    a: '#9048f0', b: '#ffe070', c: '#22104a', eye: '#ff9af0', line: 'ほしくずに なりなさい。' },
  vine: { name: 'ヴァイン・ギア', en: 'VINE GEAR', weapon: 8, weak: 1, stage: 'vine', helm: 'leaf',
    a: '#2e9a3a', b: '#e8d050', c: '#123a14', eye: '#ff5a8a', line: 'もりの いかりを しるがいい！' },
  // ステージの中ボス・ラスボス
  guard: { name: 'ガードロイド', en: 'GUARDROID', weak: 0, big: true, a: '#6a7a98', b: '#ffcc33', c: '#20283a', eye: '#ff4040' },
  drone: { name: 'ノクス・ドローン', en: 'NOX DRONE', weak: 4, big: true, a: '#5a3a7a', b: '#ff4080', c: '#1a0e2a', eye: '#ff4040' },
  nox1: { name: 'ノクス・タイタン', en: 'NOX TITAN', weak: 5, big: true, a: '#3a2a50', b: '#c02a4a', c: '#140a20', eye: '#ff3050' },
  nox2: { name: 'ノクス・コア', en: 'NOX CORE', weak: 3, big: true, a: '#2a1a40', b: '#ff2a6a', c: '#0a0412', eye: '#ffe040' },
};
const FIRST4 = ['volca', 'aqua', 'spark', 'frost'];
const SECOND4 = ['terra', 'gale', 'stella', 'vine'];
const ALL8 = FIRST4.concat(SECOND4);

// ===== テーマ（見た目と環境） =====
const THEMES = {
  intro: { bg: 'city', sky: ['#0e1638', '#3a3f86', '#a05a8a'], tile: '#56607a', hi: '#9aa4be', lo: '#2a3044', cap: '#e8c040', style: 'metal', enemy: '#e05a3a', enemy2: '#ffd040' },
  volca: { bg: 'volcano', sky: ['#1a0404', '#5a1408', '#c0461a'], tile: '#5e3428', hi: '#a85a3a', lo: '#2a120c', cap: '#ff8a2a', style: 'rock', enemy: '#ff7a20', enemy2: '#3a2a2a' },
  aqua: { bg: 'sea', sky: ['#02142a', '#063a6a', '#0a7aa8'], tile: '#2a6070', hi: '#5ab0b0', lo: '#103038', cap: '#f0a0b0', style: 'coral', enemy: '#ffb030', enemy2: '#2a90ff', water: true },
  spark: { bg: 'factory', sky: ['#06041a', '#1a1040', '#3a2070'], tile: '#3c3c56', hi: '#7c7ca8', lo: '#1a1a2a', cap: '#ffe040', style: 'metal', enemy: '#ffe040', enemy2: '#5a46c0' },
  frost: { bg: 'snow', sky: ['#6a98d8', '#a8d0f8', '#eaf6ff'], tile: '#8cc0e6', hi: '#ffffff', lo: '#4a7aa8', cap: '#ffffff', style: 'ice', enemy: '#3a7ad0', enemy2: '#ffffff', ice: true },
  terra: { bg: 'canyon', sky: ['#4a2a14', '#a0602a', '#f0b060'], tile: '#7a5634', hi: '#b8885a', lo: '#3a2614', cap: '#c8a060', style: 'rock', enemy: '#c08040', enemy2: '#504030' },
  gale: { bg: 'sky', sky: ['#2a70d0', '#6aaaf0', '#d0ecff'], tile: '#dfe6f2', hi: '#ffffff', lo: '#8a98b8', cap: '#ffffff', style: 'cloud', enemy: '#20b080', enemy2: '#ffffff' },
  stella: { bg: 'space', sky: ['#000006', '#0a0420', '#24104a'], tile: '#44446a', hi: '#9898cc', lo: '#1c1c34', cap: '#ffe070', style: 'metal', enemy: '#b060ff', enemy2: '#ffe070', lowgrav: true },
  vine: { bg: 'jungle', sky: ['#04140a', '#0e3a18', '#2a6a2a'], tile: '#4a3620', hi: '#6a4a2a', lo: '#22160a', cap: '#58b030', style: 'organic', enemy: '#e0d040', enemy2: '#2e9a3a' },
  mid: { bg: 'crater', sky: ['#0a0210', '#2a0a2a', '#7a1a3a'], tile: '#4a3a4a', hi: '#8a6a8a', lo: '#1a101a', cap: '#c040ff', style: 'rock', enemy: '#c040ff', enemy2: '#ff4080' },
  final: { bg: 'fortress', sky: ['#04020a', '#140a22', '#3a0a1a'], tile: '#3a3048', hi: '#6a5a82', lo: '#16101e', cap: '#ff2a5a', style: 'brick', enemy: '#ff2a5a', enemy2: '#7a5aa0' },
};

// ===== ステージ（簡易 DSL） =====
// F n: 平地 / U n,D n: 段差 / P n: 穴 / S n: トゲ地帯 / L n: はしごで n 段のぼる / O n: 浮き足場の穴
// M n: 動く足場の穴 / FP n: 落ちる足場の穴 / C n: スライディングで通る低い通路 / B: 壊せる壁
// E:種類 敵 / I:種類 アイテム / K 中間ポイント / X:種類 ギミック / BOSS ボス部屋
const STAGES = {
  intro: { theme: 'intro', name: 'ハイウェイ・ゼロ', boss: 'guard',
    map: 'F14 E:walker F8 U1 F6 E:shell F6 P2 F6 E:flyer F8 I:bolt5 U2 F4 E:turret F6 D2 F6 O8 F6 E:hopper F8 K F6 C5 F4 E:flyer F6 U1 F8 E:shell F6 D1 F4 I:hpL F8 BOSS' },
  volca: { theme: 'volca', name: 'マグマ・ファウンドリ', boss: 'volca', seed: 1,
    map: 'F12 E:walker F6 X:lava2 F5 E:shell F6 U1 F6 X:fire F6 X:fire F5 X:lava3 F6 E:hopper F6 U2 F4 E:turret F6 D1 F4 M8 F6 E:flyer F6 X:lava2 F3 X:lava2 F6 I:bolt5 K F6 L4 F6 E:shell F6 X:fire F5 X:fire F6 D3 F4 E:walker F6 O8 F6 B F3 I:etank F4 E:big F14 U1 F6 X:lava3 F6 E:flyer F8 I:hpL F6 BOSS' },
  aqua: { theme: 'aqua', name: 'ディープ・アクアリウム', boss: 'aqua', seed: 2,
    map: 'F12 E:flyer F6 U2 F6 E:shell F6 P3 F6 E:hopper F6 S10 F6 U2 F4 E:turret F6 D2 F6 O12 F6 I:bolt5 K F8 E:flyer F8 E:flyer F6 C4 F6 L5 F6 E:walker F6 S10 F4 D3 F6 E:big F14 M8 F6 E:flyer F10 I:hpL F6 BOSS' },
  spark: { theme: 'spark', name: 'サンダー・ファクトリー', boss: 'spark', seed: 3,
    map: 'F12 E:walker F6 X:beam F6 X:beam F6 U1 F6 E:turret F6 P3 F4 E:shell F6 M8 F6 E:flyer F6 C5 F6 I:bolt5 K F6 X:beam F4 X:beam F6 L4 F8 E:hopper F6 D2 F4 S10 F6 B F3 I:etank F4 E:big F14 X:beam F6 E:flyer F8 I:hpL F6 BOSS' },
  frost: { theme: 'frost', name: 'フローズン・ピーク', boss: 'frost', seed: 4,
    map: 'F12 E:walker F6 X:icicle F4 X:icicle F6 P2 F6 E:hopper F6 U2 F6 E:shell F6 O8 F6 E:turret F6 I:bolt5 K F6 X:icicle F4 X:icicle F4 X:icicle F6 D2 F4 P2 F6 L4 F6 E:flyer F8 FP9 F6 E:big F14 D2 F6 E:walker F8 I:hpL F6 BOSS' },
  terra: { theme: 'terra', name: 'クエイク・キャニオン', boss: 'terra', seed: 5,
    map: 'F12 E:hopper F6 X:rocks8 F8 E:shell F6 B F3 I:bolt5 F4 U2 F6 E:turret F6 P3 F6 E:walker F6 C5 F6 K F6 X:rocks10 F10 E:hopper F6 L5 F6 B F3 I:etank F4 E:flyer F6 D3 F4 M8 F6 E:big F14 F6 I:hpL F6 BOSS' },
  gale: { theme: 'gale', name: 'スカイ・ガーデン', boss: 'gale', seed: 6,
    map: 'F12 E:flyer F6 P3 F4 X:wind12 F12 E:shell F4 FP9 F6 E:bomber F6 U2 F6 FP9 F4 I:bolt5 K F6 E:turret F6 X:wind10 F10 E:flyer F4 O8 F6 E:hopper F6 FP12 F6 E:big F14 E:bomber F8 I:hpL F6 BOSS' },
  stella: { theme: 'stella', name: 'スター・オービット', boss: 'stella', seed: 7,
    map: 'F12 E:flyer F6 P4 F6 E:shell F6 O12 F6 U2 F4 E:turret F6 P4 F4 E:hopper F6 I:bolt5 K F6 M10 F6 E:flyer F6 S10 F6 L5 F6 E:bomber F6 D3 F4 P4 F6 B F3 I:etank F4 E:big F14 E:flyer F8 I:hpL F6 BOSS' },
  vine: { theme: 'vine', name: 'グリーン・ラビリンス', boss: 'vine', seed: 8,
    map: 'F12 E:hopper F6 S6 F6 E:shell F4 L5 F6 E:flyer F6 D2 F4 S10 F6 E:walker F6 P3 F6 U2 F6 E:turret F4 I:bolt5 K F6 C4 F6 E:hopper F6 L3 F4 O8 F4 E:flyer F6 D4 F6 S10 F6 E:big F14 F6 I:hpL F6 BOSS' },
  mid: { theme: 'mid', name: 'ブラック・クレーター', boss: 'drone', seed: 9,
    map: 'F12 E:walker F6 E:flyer F6 X:lava3 F6 X:beam F6 U2 F6 X:icicle F4 X:icicle F6 E:shell F6 M8 F6 I:bolt5 K F6 E:hopper F6 S10 F6 E:big F14 E:turret F6 I:hpL F6 BOSS' },
  final: { theme: 'final', name: 'ノクス・フォートレス', boss: 'rush', seed: 10,
    map: 'F12 E:walker F6 E:shell F6 X:beam F6 U2 F6 E:turret F6 O8 F6 E:flyer F6 S10 F6 K F6 C5 F6 E:big F14 L4 F6 E:bomber F6 X:fire F5 X:fire F6 D3 F4 FP9 F6 E:hopper F6 M8 F6 I:etank K F6 E:big F14 F6 I:hpL F6 BOSS' },
};

// ===== ショップ =====
const SHOP = [
  { id: 'etank', name: 'Eカン', desc: 'ポーズ画面で ライフを ぜんかいふく', price: 40, max: 4 },
  { id: 'wtank', name: 'Wカン', desc: 'ポーズ画面で ぶきエネルギーを ぜんかいふく', price: 40, max: 4 },
  { id: 'life', name: '1UP', desc: 'のこりにんずうが ふえる', price: 30, max: 9 },
  { id: 'quick', name: 'クイックチャージ', desc: 'ためうちの じかんが みじかくなる', price: 100, max: 1 },
  { id: 'saver', name: 'エナジーセーバー', desc: 'ぶきエネルギーの しょうひが はんぶんに', price: 150, max: 1 },
  { id: 'guard', name: 'ショックガード', desc: 'むてきじかんでなくても トゲで いっぱつアウトに ならない', price: 120, max: 1 },
  { id: 'armor', name: 'ハードアーマー', desc: 'うける ダメージが へる', price: 200, max: 1 },
  { id: 'magnet', name: 'ボルトマグネット', desc: 'ボルトが すいよせられる', price: 80, max: 1 },
];

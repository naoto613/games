// なかまに つける 名前の こうほ（はじめから 入っている ランダムな名前）
export const NAME_POOL = [
  'ポコ', 'ピピ', 'モチ', 'ルル', 'チャコ', 'ミント', 'ソラ', 'コロ', 'タマ', 'ハク', 'ピノ', 'ララ', 'ムギ', 'ココ', 'ナナ', 'ポポ',
  'キキ', 'リン', 'ユキ', 'ベル', 'ノア', 'レオ', 'ジジ', 'ププ', 'モモ', 'クー', 'テト', 'ヒカリ', 'ゴン', 'ガブ', 'ザック', 'ボルト',
  'ライ', 'シロ', 'クロ', 'ゴロ', 'トト', 'ミミ', 'マル', 'チビ', 'ダイ', 'ジン', 'カイ', 'ルナ', 'ステラ', 'ミルク', 'あんこ', 'きなこ',
  'だいふく', 'おもち', 'ぽてと', 'ちくわ', 'こむぎ', 'わらび', 'つくし', 'どんぐり', 'ガルド', 'ブレイズ', 'シエル', 'フィズ',
];

/** 手持ちと かぶらない 名前を ランダムに えらぶ */
export function randomName(rand: () => number, used: Iterable<string> = []): string {
  const taken = new Set(used);
  const free = NAME_POOL.filter((n) => !taken.has(n));
  const pool = free.length ? free : NAME_POOL;
  return pool[Math.floor(rand() * pool.length)];
}

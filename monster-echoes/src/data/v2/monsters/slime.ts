// スライム系（001〜020）。tools/v2/gen_monsters.py で 仕様書の 表から 生成。
// def(番号, 名前, 系統, 属性, 役割, ランク, 成長型, 特徴, { slug: ファイル名 })
import { def } from './def';

export const SLIME = [
  def(1, 'ルナスライム', 'slime', 'light', 'support', 1, 'late', '主人公の相棒。成長型万能役', { slug: 'luna_slime' }),
  def(2, 'バブルミニ', 'slime', 'water', 'support', 1, 'early', '初期回復役', { slug: 'bubble_mini' }),
  def(3, 'モスゼリー', 'slime', 'shadow', 'status', 1, 'balanced', '毒付与', { slug: 'moss_jelly' }),
  def(4, 'フレアゼリー', 'slime', 'fire', 'attacker', 1, 'balanced', '火属性アタッカー', { slug: 'flare_jelly' }),
  def(5, 'フロストゼリー', 'slime', 'ice', 'status', 1, 'balanced', '敵の速度を低下', { slug: 'frost_jelly' }),
  def(6, 'スパークゼリー', 'slime', 'thunder', 'status', 1, 'balanced', '麻痺攻撃', { slug: 'spark_jelly' }),
  def(7, 'ストーンゼリー', 'slime', 'earth', 'tank', 2, 'endure', '防御型', { slug: 'stone_jelly' }),
  def(8, 'ウインドゼリー', 'slime', 'wind', 'speed', 2, 'early', '高速型', { slug: 'wind_jelly' }),
  def(9, 'ミストジェリー', 'slime', 'water', 'status', 2, 'balanced', '回避・状態異常', { slug: 'mist_jelly' }),
  def(10, 'グラスゼリー', 'slime', 'light', 'support', 2, 'balanced', '回復補助', { slug: 'grass_jelly' }),
  def(11, 'アイアンゼリー', 'slime', 'earth', 'tank', 2, 'endure', '物理タンク', { slug: 'iron_jelly' }),
  def(12, 'シャドウゼリー', 'slime', 'shadow', 'status', 2, 'balanced', '弱体化', { slug: 'shadow_jelly' }),
  def(13, 'ブロンズスライム', 'slime', 'earth', 'attacker', 1, 'early', '序盤の物理型', { slug: 'bronze_slime' }),
  def(14, 'シルバースライム', 'slime', 'light', 'tank', 3, 'endure', '魔法耐性型', { slug: 'silver_slime' }),
  def(15, 'ゴールドスライム', 'slime', 'light', 'tank', 4, 'endure', '高防御・希少種', { slug: 'gold_slime' }),
  def(16, 'プリズムスライム', 'slime', 'light', 'special', 3, 'variable', '属性切替型', { slug: 'prism_slime' }),
  def(17, 'メタルスピリット', 'slime', 'wind', 'tank', 4, 'endure', '高速・高耐性', { slug: 'metal_spirit' }),
  def(18, 'キングゼリー', 'slime', 'water', 'support', 3, 'balanced', '全体支援型', { slug: 'king_jelly' }),
  def(19, 'スターゼリー', 'slime', 'light', 'support', 4, 'balanced', '高位回復型', { slug: 'star_jelly' }),
  def(20, 'エターナルスライム', 'slime', 'light', 'support', 5, 'late', '伝説級・成長型', { slug: 'eternal_slime' }),
];

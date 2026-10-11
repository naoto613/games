// スライム系（001〜020）。tools/v2/gen_monsters.py で 仕様書の 表から 生成。
// def(番号, 名前, 属性, 役割, ランク, 成長型, 特徴)
import { def } from './def';

export const SLIME = [
  def(1, 'ルナスライム', 'slime', 'light', 'support', 1, 'late', '主人公の相棒。成長型万能役'),
  def(2, 'バブルミニ', 'slime', 'water', 'support', 1, 'early', '初期回復役'),
  def(3, 'モスゼリー', 'slime', 'shadow', 'status', 1, 'balanced', '毒付与'),
  def(4, 'フレアゼリー', 'slime', 'fire', 'attacker', 1, 'balanced', '火属性アタッカー'),
  def(5, 'フロストゼリー', 'slime', 'ice', 'status', 1, 'balanced', '敵の速度を低下'),
  def(6, 'スパークゼリー', 'slime', 'thunder', 'status', 1, 'balanced', '麻痺攻撃'),
  def(7, 'ストーンゼリー', 'slime', 'earth', 'tank', 2, 'endure', '防御型'),
  def(8, 'ウインドゼリー', 'slime', 'wind', 'speed', 2, 'early', '高速型'),
  def(9, 'ミストジェリー', 'slime', 'water', 'status', 2, 'balanced', '回避・状態異常'),
  def(10, 'グラスゼリー', 'slime', 'light', 'support', 2, 'balanced', '回復補助'),
  def(11, 'アイアンゼリー', 'slime', 'earth', 'tank', 2, 'endure', '物理タンク'),
  def(12, 'シャドウゼリー', 'slime', 'shadow', 'status', 2, 'balanced', '弱体化'),
  def(13, 'ブロンズスライム', 'slime', 'earth', 'attacker', 1, 'early', '序盤の物理型'),
  def(14, 'シルバースライム', 'slime', 'light', 'tank', 3, 'endure', '魔法耐性型'),
  def(15, 'ゴールドスライム', 'slime', 'light', 'tank', 4, 'endure', '高防御・希少種'),
  def(16, 'プリズムスライム', 'slime', 'light', 'special', 3, 'variable', '属性切替型'),
  def(17, 'メタルスピリット', 'slime', 'wind', 'tank', 4, 'endure', '高速・高耐性'),
  def(18, 'キングゼリー', 'slime', 'water', 'support', 3, 'balanced', '全体支援型'),
  def(19, 'スターゼリー', 'slime', 'light', 'support', 4, 'balanced', '高位回復型'),
  def(20, 'エターナルスライム', 'slime', 'light', 'support', 5, 'late', '伝説級・成長型'),
];

// 虫系（061〜080）。tools/v2/gen_monsters.py で 仕様書の 表から 生成。
// def(番号, 名前, 属性, 役割, ランク, 成長型, 特徴)
import { def } from './def';

export const BUG = [
  def(61, 'ストームビー', 'bug', 'wind', 'speed', 1, 'early', '高速攻撃'),
  def(62, 'アイアンビートル', 'bug', 'earth', 'tank', 1, 'endure', '防御型'),
  def(63, 'フェザーモス', 'bug', 'wind', 'speed', 1, 'early', '回避型'),
  def(64, 'フレアマンティス', 'bug', 'fire', 'attacker', 1, 'balanced', '火物理'),
  def(65, 'フロストスパイダー', 'bug', 'ice', 'status', 1, 'balanced', '減速・拘束'),
  def(66, 'ポイズンシケーダ', 'bug', 'shadow', 'status', 1, 'balanced', '毒型'),
  def(67, 'サンダーホーネット', 'bug', 'thunder', 'speed', 2, 'early', '雷高速型'),
  def(68, 'コクーンガード', 'bug', 'earth', 'special', 2, 'variable', '防御・変身'),
  def(69, 'クリスタルスコーピオン', 'bug', 'earth', 'tank', 2, 'endure', '反撃・高防御'),
  def(70, 'サンドワーム', 'bug', 'earth', 'attacker', 2, 'balanced', '地属性範囲攻撃'),
  def(71, 'ナイトモス', 'bug', 'shadow', 'caster', 2, 'balanced', '影魔法'),
  def(72, 'グラスドラゴンフライ', 'bug', 'wind', 'support', 2, 'balanced', '風支援'),
  def(73, 'ブレイズビートル', 'bug', 'fire', 'attacker', 3, 'balanced', '火耐性・反撃'),
  def(74, 'ミラージュバタフライ', 'bug', 'wind', 'status', 3, 'balanced', '幻惑'),
  def(75, 'アビスセンチピード', 'bug', 'shadow', 'status', 3, 'balanced', '毒・連続攻撃'),
  def(76, 'スカイホッパー', 'bug', 'wind', 'support', 3, 'balanced', '高速支援'),
  def(77, 'ルーンスパイダー', 'bug', 'light', 'special', 3, 'variable', '魔法封じ'),
  def(78, 'エンシェントスカラベ', 'bug', 'earth', 'tank', 4, 'endure', '高耐性'),
  def(79, 'クイーンアラクネ', 'bug', 'shadow', 'status', 4, 'balanced', '状態異常支配'),
  def(80, '星喰い甲虫', 'bug', 'light', 'special', 5, 'late', '伝説級・強化解除'),
];

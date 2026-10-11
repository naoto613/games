// 鳥系（081〜100）。tools/v2/gen_monsters.py で 仕様書の 表から 生成。
// def(番号, 名前, 属性, 役割, ランク, 成長型, 特徴)
import { def } from './def';

export const BIRD = [
  def(81, 'フェザーバット', 'bird', 'wind', 'speed', 1, 'early', '初期高速型'),
  def(82, 'フロストバード', 'bird', 'ice', 'caster', 1, 'balanced', '氷魔法'),
  def(83, 'アッシュバット', 'bird', 'fire', 'speed', 1, 'early', '火属性高速型'),
  def(84, 'サンダーレイヴン', 'bird', 'thunder', 'caster', 1, 'balanced', '雷魔法'),
  def(85, 'スカイモール', 'bird', 'wind', 'support', 1, 'balanced', '回避・支援'),
  def(86, 'ミストフクロウ', 'bird', 'water', 'support', 1, 'balanced', '回復・幻惑'),
  def(87, 'ブレードイーグル', 'bird', 'wind', 'attacker', 2, 'balanced', '物理アタッカー'),
  def(88, 'ナイトクロウ', 'bird', 'shadow', 'status', 2, 'balanced', '影属性・弱体化'),
  def(89, 'フレイムフェニックス', 'bird', 'fire', 'support', 2, 'balanced', '火属性蘇生'),
  def(90, 'アイスフェニックス', 'bird', 'ice', 'support', 2, 'balanced', '氷属性蘇生'),
  def(91, 'ライトニングホーク', 'bird', 'thunder', 'speed', 2, 'early', '雷高速攻撃'),
  def(92, 'セレスティアルバード', 'bird', 'light', 'support', 2, 'balanced', '光支援'),
  def(93, 'クラウドウィング', 'bird', 'wind', 'caster', 3, 'balanced', '風魔法・範囲攻撃'),
  def(94, 'スターウィスプ', 'bird', 'light', 'caster', 3, 'balanced', '光魔法'),
  def(95, 'アストラルフェニックス', 'bird', 'light', 'support', 4, 'balanced', '高位蘇生'),
  def(96, 'グリフォン', 'bird', 'wind', 'attacker', 3, 'balanced', '物理・風攻撃'),
  def(97, '風喰いグリフォン', 'bird', 'wind', 'attacker', 4, 'offense', 'ボス系統の配合素材候補'),
  def(98, '天穹獣アストラ', 'bird', 'light', 'attacker', 5, 'late', '伝説級'),
  def(99, '永劫の氷鳥', 'bird', 'ice', 'attacker', 5, 'late', '伝説級'),
  def(100, '原初の翼', 'bird', 'light', 'special', 5, 'late', '伝説級・属性切替'),
];

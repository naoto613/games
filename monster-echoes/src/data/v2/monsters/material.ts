// 物質系（121〜140）。tools/v2/gen_monsters.py で 仕様書の 表から 生成。
// def(番号, 名前, 属性, 役割, ランク, 成長型, 特徴)
import { def } from './def';

export const MATERIAL = [
  def(121, 'コケゴーレム', 'material', 'earth', 'tank', 1, 'endure', '序盤タンク'),
  def(122, 'ストーンゴーレム', 'material', 'earth', 'tank', 1, 'endure', '物理タンク'),
  def(123, 'アイアンゴーレム', 'material', 'earth', 'tank', 2, 'endure', '高防御'),
  def(124, 'クリスタルゴーレム', 'material', 'ice', 'tank', 2, 'endure', '魔法耐性'),
  def(125, 'ラヴァゴーレム', 'material', 'fire', 'attacker', 2, 'balanced', '火攻撃'),
  def(126, 'ランタンゴースト', 'material', 'light', 'support', 1, 'balanced', '光支援'),
  def(127, 'ルーンランタン', 'material', 'light', 'support', 2, 'balanced', '魔法補助'),
  def(128, 'アーマーナイト', 'material', 'earth', 'tank', 2, 'endure', '物理タンク'),
  def(129, 'ブレードナイト', 'material', 'wind', 'attacker', 2, 'balanced', '物理攻撃'),
  def(130, 'ミラーメイジ', 'material', 'ice', 'special', 2, 'variable', '反射・魔法'),
  def(131, 'フォートレス', 'material', 'earth', 'tank', 2, 'endure', '防御特化'),
  def(132, 'メカビートル', 'material', 'thunder', 'speed', 2, 'early', '高速物理型'),
  def(133, 'マグネットナイト', 'material', 'thunder', 'special', 3, 'variable', '敵の行動妨害'),
  def(134, 'アンティークドール', 'material', 'shadow', 'status', 3, 'balanced', '状態異常'),
  def(135, 'クロックワーカー', 'material', 'thunder', 'special', 3, 'variable', '行動順操作'),
  def(136, 'エンシェントガーディアン', 'material', 'earth', 'tank', 4, 'endure', '高耐性'),
  def(137, '星屑の機兵', 'material', 'light', 'attacker', 4, 'offense', '光属性攻撃'),
  def(138, '虚空の巨像', 'material', 'shadow', 'tank', 4, 'endure', '影属性タンク'),
  def(139, '原初の機神', 'material', 'light', 'special', 5, 'late', '伝説級・耐性切替'),
  def(140, '永遠の守護像', 'material', 'earth', 'support', 5, 'late', '伝説級・防御支援'),
];

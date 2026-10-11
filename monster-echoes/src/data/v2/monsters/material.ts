// 物質系（121〜140）。tools/v2/gen_monsters.py で 仕様書の 表から 生成。
// def(番号, 名前, 系統, 属性, 役割, ランク, 成長型, 特徴, { slug: ファイル名 })
import { def } from './def';

export const MATERIAL = [
  def(121, 'コケゴーレム', 'material', 'earth', 'tank', 1, 'endure', '序盤タンク', { slug: 'moss_golem' }),
  def(122, 'ストーンゴーレム', 'material', 'earth', 'tank', 1, 'endure', '物理タンク', { slug: 'stone_golem' }),
  def(123, 'アイアンゴーレム', 'material', 'earth', 'tank', 2, 'endure', '高防御', { slug: 'iron_golem' }),
  def(124, 'クリスタルゴーレム', 'material', 'ice', 'tank', 2, 'endure', '魔法耐性', { slug: 'crystal_golem' }),
  def(125, 'ラヴァゴーレム', 'material', 'fire', 'attacker', 2, 'balanced', '火攻撃', { slug: 'lava_golem' }),
  def(126, 'ランタンゴースト', 'material', 'light', 'support', 1, 'balanced', '光支援', { slug: 'lantern_ghost' }),
  def(127, 'ルーンランタン', 'material', 'light', 'support', 2, 'balanced', '魔法補助', { slug: 'rune_lantern' }),
  def(128, 'アーマーナイト', 'material', 'earth', 'tank', 2, 'endure', '物理タンク', { slug: 'armor_knight' }),
  def(129, 'ブレードナイト', 'material', 'wind', 'attacker', 2, 'balanced', '物理攻撃', { slug: 'blade_knight' }),
  def(130, 'ミラーメイジ', 'material', 'ice', 'special', 2, 'variable', '反射・魔法', { slug: 'mirror_mage' }),
  def(131, 'フォートレス', 'material', 'earth', 'tank', 2, 'endure', '防御特化', { slug: 'fortress' }),
  def(132, 'メカビートル', 'material', 'thunder', 'speed', 2, 'early', '高速物理型', { slug: 'mecha_beetle' }),
  def(133, 'マグネットナイト', 'material', 'thunder', 'special', 3, 'variable', '敵の行動妨害', { slug: 'magnet_knight' }),
  def(134, 'アンティークドール', 'material', 'shadow', 'status', 3, 'balanced', '状態異常', { slug: 'antique_doll' }),
  def(135, 'クロックワーカー', 'material', 'thunder', 'special', 3, 'variable', '行動順操作', { slug: 'clock_worker' }),
  def(136, 'エンシェントガーディアン', 'material', 'earth', 'tank', 4, 'endure', '高耐性', { slug: 'ancient_guardian' }),
  def(137, '星屑の機兵', 'material', 'light', 'attacker', 4, 'offense', '光属性攻撃', { slug: 'stardust_soldier' }),
  def(138, '虚空の巨像', 'material', 'shadow', 'tank', 4, 'endure', '影属性タンク', { slug: 'void_colossus' }),
  def(139, '原初の機神', 'material', 'light', 'special', 5, 'late', '伝説級・耐性切替', { slug: 'primal_machine_god' }),
  def(140, '永遠の守護像', 'material', 'earth', 'support', 5, 'late', '伝説級・防御支援', { slug: 'eternal_guardian_statue' }),
];

// 竜系（161〜180）。tools/v2/gen_monsters.py で 仕様書の 表から 生成。
// def(番号, 名前, 系統, 属性, 役割, ランク, 成長型, 特徴, { slug: ファイル名 })
import { def } from './def';

export const DRAGON = [
  def(161, 'ファイアドラゴン', 'dragon', 'fire', 'attacker', 2, 'balanced', '火属性物理型', { slug: 'fire_dragon' }),
  def(162, 'アイスクリル', 'dragon', 'ice', 'attacker', 2, 'balanced', '氷属性攻撃', { slug: 'ice_krill' }),
  def(163, 'ストームドラゴン', 'dragon', 'wind', 'attacker', 2, 'balanced', '風範囲攻撃', { slug: 'storm_dragon' }),
  def(164, 'サンダードレイク', 'dragon', 'thunder', 'speed', 2, 'early', '雷属性高速型', { slug: 'thunder_drake' }),
  def(165, 'ダークドラゴン', 'dragon', 'shadow', 'attacker', 2, 'balanced', '影属性アタッカー', { slug: 'dark_dragon' }),
  def(166, 'グリーンドラゴン', 'dragon', 'earth', 'status', 2, 'balanced', '毒・持久戦', { slug: 'green_dragon' }),
  def(167, 'サンドドラゴン', 'dragon', 'earth', 'tank', 3, 'endure', '地属性タンク', { slug: 'sand_dragon' }),
  def(168, 'ミストドラゴン', 'dragon', 'water', 'status', 3, 'balanced', '幻惑・回避', { slug: 'mist_dragon' }),
  def(169, 'スノードラゴン', 'dragon', 'ice', 'tank', 3, 'endure', '氷属性タンク', { slug: 'snow_dragon' }),
  def(170, 'ツリードラゴン', 'dragon', 'earth', 'support', 3, 'balanced', '回復・防御', { slug: 'tree_dragon' }),
  def(171, 'タイドドラゴン', 'dragon', 'water', 'attacker', 3, 'balanced', '水範囲攻撃', { slug: 'tide_dragon' }),
  def(172, 'クラウドドラゴン', 'dragon', 'wind', 'caster', 3, 'balanced', '風魔法', { slug: 'cloud_dragon' }),
  def(173, 'カオスビースト', 'dragon', 'shadow', 'special', 4, 'variable', '複合属性攻撃', { slug: 'chaos_beast' }),
  def(174, 'ルーンドラゴン', 'dragon', 'light', 'support', 4, 'balanced', '魔法支援', { slug: 'rune_dragon' }),
  def(175, '灰冠竜グレイヴ', 'dragon', 'earth', 'attacker', 4, 'balanced', '物理・弱体化', { slug: 'grave' }),
  def(176, '紅蓮帝ヴォルガ', 'dragon', 'fire', 'attacker', 4, 'offense', '火属性高火力', { slug: 'volga' }),
  def(177, '氷鏡竜ミラージュ', 'dragon', 'ice', 'special', 4, 'variable', '氷反射型', { slug: 'mirage' }),
  def(178, '虚空竜ノクス', 'dragon', 'shadow', 'attacker', 4, 'offense', '影属性高位', { slug: 'nox' }),
  def(179, '星界竜アストリオン', 'dragon', 'light', 'attacker', 4, 'offense', '光属性高位', { slug: 'astrion' }),
  def(180, '原初の竜', 'dragon', 'light', 'special', 5, 'late', '伝説級・複合属性', { slug: 'primal_dragon' }),
];

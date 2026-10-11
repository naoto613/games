// 鳥系（081〜100）。tools/v2/gen_monsters.py で 仕様書の 表から 生成。
// def(番号, 名前, 系統, 属性, 役割, ランク, 成長型, 特徴, { slug: ファイル名 })
import { def } from './def';

export const BIRD = [
  def(81, 'フェザーバット', 'bird', 'wind', 'speed', 1, 'early', '初期高速型', { slug: 'feather_bat' }),
  def(82, 'フロストバード', 'bird', 'ice', 'caster', 1, 'balanced', '氷魔法', { slug: 'frost_bird' }),
  def(83, 'アッシュバット', 'bird', 'fire', 'speed', 1, 'early', '火属性高速型', { slug: 'ash_bat' }),
  def(84, 'サンダーレイヴン', 'bird', 'thunder', 'caster', 1, 'balanced', '雷魔法', { slug: 'thunder_raven' }),
  def(85, 'スカイモール', 'bird', 'wind', 'support', 1, 'balanced', '回避・支援', { slug: 'sky_mole' }),
  def(86, 'ミストフクロウ', 'bird', 'water', 'support', 1, 'balanced', '回復・幻惑', { slug: 'mist_owl' }),
  def(87, 'ブレードイーグル', 'bird', 'wind', 'attacker', 2, 'balanced', '物理アタッカー', { slug: 'blade_eagle' }),
  def(88, 'ナイトクロウ', 'bird', 'shadow', 'status', 2, 'balanced', '影属性・弱体化', { slug: 'night_crow' }),
  def(89, 'フレイムフェニックス', 'bird', 'fire', 'support', 2, 'balanced', '火属性蘇生', { slug: 'flame_phoenix' }),
  def(90, 'アイスフェニックス', 'bird', 'ice', 'support', 2, 'balanced', '氷属性蘇生', { slug: 'ice_phoenix' }),
  def(91, 'ライトニングホーク', 'bird', 'thunder', 'speed', 2, 'early', '雷高速攻撃', { slug: 'lightning_hawk' }),
  def(92, 'セレスティアルバード', 'bird', 'light', 'support', 2, 'balanced', '光支援', { slug: 'celestial_bird' }),
  def(93, 'クラウドウィング', 'bird', 'wind', 'caster', 3, 'balanced', '風魔法・範囲攻撃', { slug: 'cloud_wing' }),
  def(94, 'スターウィスプ', 'bird', 'light', 'caster', 3, 'balanced', '光魔法', { slug: 'star_wisp' }),
  def(95, 'アストラルフェニックス', 'bird', 'light', 'support', 4, 'balanced', '高位蘇生', { slug: 'astral_phoenix' }),
  def(96, 'グリフォン', 'bird', 'wind', 'attacker', 3, 'balanced', '物理・風攻撃', { slug: 'griffon' }),
  def(97, '風喰いグリフォン', 'bird', 'wind', 'attacker', 4, 'offense', 'ボス系統の配合素材候補', { slug: 'wind_eater_griffon' }),
  def(98, '天穹獣アストラ', 'bird', 'light', 'attacker', 5, 'late', '伝説級', { slug: 'astra' }),
  def(99, '永劫の氷鳥', 'bird', 'ice', 'attacker', 5, 'late', '伝説級', { slug: 'eternal_ice_bird' }),
  def(100, '原初の翼', 'bird', 'light', 'special', 5, 'late', '伝説級・属性切替', { slug: 'primal_wing' }),
];

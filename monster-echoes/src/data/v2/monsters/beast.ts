// 獣系（021〜040）。tools/v2/gen_monsters.py で 仕様書の 表から 生成。
// def(番号, 名前, 系統, 属性, 役割, ランク, 成長型, 特徴, { slug: ファイル名 })
import { def } from './def';

export const BEAST = [
  def(21, 'マグマドッグ', 'beast', 'fire', 'attacker', 1, 'balanced', '火属性物理役', { slug: 'magma_dog' }),
  def(22, 'ウインドキャット', 'beast', 'wind', 'speed', 1, 'early', '高速アタッカー', { slug: 'wind_cat' }),
  def(23, 'バークボア', 'beast', 'earth', 'tank', 1, 'endure', '序盤タンク', { slug: 'bark_boar' }),
  def(24, 'スノーフォックス', 'beast', 'ice', 'speed', 1, 'early', '氷・回避型', { slug: 'snow_fox' }),
  def(25, 'ブレードウルフ', 'beast', 'wind', 'attacker', 1, 'balanced', '連続攻撃', { slug: 'blade_wolf' }),
  def(26, 'ナイトウルフ', 'beast', 'shadow', 'attacker', 1, 'balanced', '影属性アタッカー', { slug: 'night_wolf' }),
  def(27, 'サンドライオン', 'beast', 'earth', 'attacker', 2, 'endure', '防御崩し', { slug: 'sand_lion' }),
  def(28, 'サンダーリンクス', 'beast', 'thunder', 'speed', 2, 'early', '雷属性高速役', { slug: 'thunder_lynx' }),
  def(29, 'クラウドモール', 'beast', 'wind', 'support', 2, 'balanced', '支援型', { slug: 'cloud_mole' }),
  def(30, 'フレイムタイガー', 'beast', 'fire', 'attacker', 2, 'offense', '高火力型', { slug: 'flame_tiger' }),
  def(31, 'グレイベア', 'beast', 'earth', 'tank', 2, 'endure', 'タンク', { slug: 'gray_bear' }),
  def(32, 'アイシクルディア', 'beast', 'ice', 'support', 2, 'balanced', '氷属性支援', { slug: 'icicle_deer' }),
  def(33, 'サンライズレオ', 'beast', 'light', 'attacker', 3, 'balanced', '光属性アタッカー', { slug: 'sunrise_leo' }),
  def(34, 'ダスクジャッカル', 'beast', 'shadow', 'status', 3, 'balanced', '状態異常型', { slug: 'dusk_jackal' }),
  def(35, 'ストームバイソン', 'beast', 'thunder', 'attacker', 3, 'balanced', '範囲物理攻撃', { slug: 'storm_bison' }),
  def(36, 'ルーンフォックス', 'beast', 'light', 'support', 3, 'balanced', '魔法支援', { slug: 'rune_fox' }),
  def(37, 'アビスパンサー', 'beast', 'shadow', 'speed', 3, 'early', '影属性高速役', { slug: 'abyss_panther' }),
  def(38, 'セレスティアルウルフ', 'beast', 'wind', 'attacker', 4, 'offense', '高位風属性', { slug: 'celestial_wolf' }),
  def(39, 'フェンリルガード', 'beast', 'ice', 'tank', 4, 'endure', '防御・反撃', { slug: 'fenrir_guard' }),
  def(40, 'ムーンビースト', 'beast', 'light', 'special', 5, 'late', '伝説級・属性変化', { slug: 'moon_beast' }),
];

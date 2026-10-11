// 虫系（061〜080）。tools/v2/gen_monsters.py で 仕様書の 表から 生成。
// def(番号, 名前, 系統, 属性, 役割, ランク, 成長型, 特徴, { slug: ファイル名 })
import { def } from './def';

export const BUG = [
  def(61, 'ストームビー', 'bug', 'wind', 'speed', 1, 'early', '高速攻撃', { slug: 'storm_bee' }),
  def(62, 'アイアンビートル', 'bug', 'earth', 'tank', 1, 'endure', '防御型', { slug: 'iron_beetle' }),
  def(63, 'フェザーモス', 'bug', 'wind', 'speed', 1, 'early', '回避型', { slug: 'feather_moth' }),
  def(64, 'フレアマンティス', 'bug', 'fire', 'attacker', 1, 'balanced', '火物理', { slug: 'flare_mantis' }),
  def(65, 'フロストスパイダー', 'bug', 'ice', 'status', 1, 'balanced', '減速・拘束', { slug: 'frost_spider' }),
  def(66, 'ポイズンシケーダ', 'bug', 'shadow', 'status', 1, 'balanced', '毒型', { slug: 'poison_cicada' }),
  def(67, 'サンダーホーネット', 'bug', 'thunder', 'speed', 2, 'early', '雷高速型', { slug: 'thunder_hornet' }),
  def(68, 'コクーンガード', 'bug', 'earth', 'special', 2, 'variable', '防御・変身', { slug: 'cocoon_guard' }),
  def(69, 'クリスタルスコーピオン', 'bug', 'earth', 'tank', 2, 'endure', '反撃・高防御', { slug: 'crystal_scorpion' }),
  def(70, 'サンドワーム', 'bug', 'earth', 'attacker', 2, 'balanced', '地属性範囲攻撃', { slug: 'sand_worm' }),
  def(71, 'ナイトモス', 'bug', 'shadow', 'caster', 2, 'balanced', '影魔法', { slug: 'night_moth' }),
  def(72, 'グラスドラゴンフライ', 'bug', 'wind', 'support', 2, 'balanced', '風支援', { slug: 'glass_dragonfly' }),
  def(73, 'ブレイズビートル', 'bug', 'fire', 'attacker', 3, 'balanced', '火耐性・反撃', { slug: 'blaze_beetle' }),
  def(74, 'ミラージュバタフライ', 'bug', 'wind', 'status', 3, 'balanced', '幻惑', { slug: 'mirage_butterfly' }),
  def(75, 'アビスセンチピード', 'bug', 'shadow', 'status', 3, 'balanced', '毒・連続攻撃', { slug: 'abyss_centipede' }),
  def(76, 'スカイホッパー', 'bug', 'wind', 'support', 3, 'balanced', '高速支援', { slug: 'sky_hopper' }),
  def(77, 'ルーンスパイダー', 'bug', 'light', 'special', 3, 'variable', '魔法封じ', { slug: 'rune_spider' }),
  def(78, 'エンシェントスカラベ', 'bug', 'earth', 'tank', 4, 'endure', '高耐性', { slug: 'ancient_scarab' }),
  def(79, 'クイーンアラクネ', 'bug', 'shadow', 'status', 4, 'balanced', '状態異常支配', { slug: 'queen_arachne' }),
  def(80, '星喰い甲虫', 'bug', 'light', 'special', 5, 'late', '伝説級・強化解除', { slug: 'star_eater_beetle' }),
];

// 神秘系（181〜200）。tools/v2/gen_monsters.py で 仕様書の 表から 生成。
// def(番号, 名前, 系統, 属性, 役割, ランク, 成長型, 特徴, { slug: ファイル名 })
import { def } from './def';

export const MYSTIC = [
  def(181, 'ダークアイ', 'mystic', 'shadow', 'status', 1, 'balanced', '弱体化', { slug: 'dark_eye' }),
  def(182, 'ルーンフェアリー', 'mystic', 'light', 'support', 1, 'balanced', '魔法支援', { slug: 'rune_fairy' }),
  def(183, 'プリズムウィッチ', 'mystic', 'light', 'special', 2, 'variable', '属性切替', { slug: 'prism_witch' }),
  def(184, 'スターシーカー', 'mystic', 'light', 'caster', 2, 'balanced', '高速魔法型', { slug: 'star_seeker' }),
  def(185, '時空の番人', 'mystic', 'thunder', 'special', 3, 'variable', '行動順制御', { slug: 'spacetime_keeper' }),
  def(186, '星喰いフェニックス', 'mystic', 'fire', 'support', 4, 'balanced', '蘇生・高火力', { slug: 'star_eater_phoenix' }),
  def(187, '月影の調律師', 'mystic', 'shadow', 'support', 4, 'balanced', '高位支援・隠しボス系統', { slug: 'moonshadow_tuner' }),
  def(188, '原初の番人', 'mystic', 'light', 'special', 4, 'variable', '防御・反射', { slug: 'primal_keeper' }),
  def(189, '天空の賢者', 'mystic', 'light', 'support', 4, 'balanced', '魔法支援', { slug: 'sky_sage' }),
  def(190, '永劫の氷帝', 'mystic', 'ice', 'attacker', 4, 'offense', '氷属性高位', { slug: 'eternal_ice_emperor' }),
  def(191, '無限の影王', 'mystic', 'shadow', 'attacker', 4, 'offense', '影属性高位', { slug: 'infinite_shadow_king' }),
  def(192, '光影の双獣', 'mystic', 'light', 'special', 4, 'variable', '光・影の複合型', { slug: 'light_shadow_twins' }),
  def(193, '世界の観測者', 'mystic', 'light', 'special', 4, 'variable', '敵の行動予測', { slug: 'world_observer' }),
  def(194, '夢幻の女神', 'mystic', 'light', 'support', 4, 'balanced', '回復・状態異常', { slug: 'dream_goddess' }),
  def(195, '深淵の双頭王', 'mystic', 'water', 'special', 4, 'variable', '複合属性ボス系統', { slug: 'abyss_twinhead_king' }),
  def(196, '朽ちた古樹竜', 'mystic', 'earth', 'tank', 4, 'endure', '高耐久・持久戦', { slug: 'withered_tree_dragon' }),
  def(197, '無限機構', 'mystic', 'thunder', 'special', 4, 'variable', '行動順操作・防御', { slug: 'infinite_mechanism' }),
  def(198, '星辰の王', 'mystic', 'light', 'special', 4, 'variable', '属性切替', { slug: 'star_king' }),
  def(199, '虚無の王ノクティル', 'mystic', 'shadow', 'attacker', 4, 'offense', '最終ボス系統', { slug: 'noctil' }),
  def(200, 'ルナフィアの守り手', 'mystic', 'light', 'attacker', 5, 'late', '真の伝説級', { slug: 'lunafia_guardian' }),
];

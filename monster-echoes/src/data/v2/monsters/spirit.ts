// 霊体系（141〜160）。tools/v2/gen_monsters.py で 仕様書の 表から 生成。
// def(番号, 名前, 属性, 役割, ランク, 成長型, 特徴)
import { def } from './def';

export const SPIRIT = [
  def(141, 'ゴーストビル', 'spirit', 'shadow', 'status', 1, 'early', '序盤の弱体化役'),
  def(142, 'ミストレイス', 'spirit', 'water', 'status', 1, 'balanced', '幻惑型'),
  def(143, 'ナイトウィスプ', 'spirit', 'shadow', 'caster', 1, 'balanced', '影魔法'),
  def(144, 'メモリーゴースト', 'spirit', 'light', 'support', 1, 'balanced', '記憶系支援'),
  def(145, 'ミラーレイス', 'spirit', 'shadow', 'special', 2, 'variable', '反射・幻惑'),
  def(146, 'エクリプスバット', 'spirit', 'shadow', 'speed', 2, 'early', '高速影攻撃'),
  def(147, 'ソウルランタン', 'spirit', 'light', 'support', 2, 'balanced', '回復・支援'),
  def(148, 'ウィスパー', 'spirit', 'shadow', 'status', 2, 'balanced', '状態異常'),
  def(149, 'グリーフスピリット', 'spirit', 'shadow', 'status', 2, 'balanced', '弱体化'),
  def(150, 'セレモニアルゴースト', 'spirit', 'light', 'support', 2, 'balanced', '蘇生補助'),
  def(151, 'ルーンファントム', 'spirit', 'light', 'caster', 2, 'balanced', '魔法型'),
  def(152, 'アビスレイス', 'spirit', 'shadow', 'attacker', 2, 'balanced', '影範囲攻撃'),
  def(153, '夢喰い', 'spirit', 'shadow', 'special', 3, 'variable', '睡眠・夢状態'),
  def(154, '記憶喰らい', 'spirit', 'shadow', 'special', 3, 'variable', '強化解除'),
  def(155, 'メモリーイーター', 'spirit', 'shadow', 'special', 3, 'variable', '能力吸収'),
  def(156, '静寂の精霊', 'spirit', 'ice', 'special', 3, 'variable', '行動制御'),
  def(157, '時渡りの幽霊', 'spirit', 'light', 'special', 3, 'variable', '行動順操作'),
  def(158, '忘却の女王', 'spirit', 'shadow', 'status', 4, 'balanced', '高位弱体化'),
  def(159, '永劫の案内人', 'spirit', 'light', 'support', 4, 'balanced', '高位支援'),
  def(160, '原初の魂', 'spirit', 'light', 'support', 5, 'late', '伝説級・蘇生支援'),
];

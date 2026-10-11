// 植物系（041〜060）。tools/v2/gen_monsters.py で 仕様書の 表から 生成。
// def(番号, 名前, 属性, 役割, ランク, 成長型, 特徴)
import { def } from './def';

export const PLANT = [
  def(41, 'モスラット', 'plant', 'earth', 'status', 1, 'early', '序盤の毒役'),
  def(42, 'リーフアント', 'plant', 'earth', 'attacker', 1, 'balanced', '物理補助'),
  def(43, 'グリーンスプライト', 'plant', 'light', 'support', 1, 'balanced', '回復支援'),
  def(44, 'キノコ兵', 'plant', 'shadow', 'status', 1, 'balanced', '状態異常'),
  def(45, 'ブロッサムウィッチ', 'plant', 'wind', 'caster', 1, 'balanced', '魔法攻撃'),
  def(46, 'トゲボール', 'plant', 'earth', 'tank', 1, 'balanced', '反撃型'),
  def(47, 'ネムリバナ', 'plant', 'shadow', 'status', 2, 'balanced', '睡眠付与'),
  def(48, 'バインドツリー', 'plant', 'earth', 'status', 2, 'balanced', '拘束型'),
  def(49, 'サンフラワーガード', 'plant', 'light', 'support', 2, 'balanced', '防御・回復'),
  def(50, 'ポイズンオーキッド', 'plant', 'shadow', 'status', 2, 'balanced', '毒特化'),
  def(51, 'フレイムリリー', 'plant', 'fire', 'caster', 2, 'balanced', '火魔法'),
  def(52, 'フロストローズ', 'plant', 'ice', 'caster', 2, 'balanced', '氷魔法'),
  def(53, 'サンダーヴァイン', 'plant', 'thunder', 'attacker', 3, 'balanced', '雷攻撃'),
  def(54, 'ミストマッシュ', 'plant', 'water', 'status', 3, 'balanced', '回避・幻惑'),
  def(55, 'フォレストタイタン', 'plant', 'earth', 'tank', 3, 'endure', '高HPタンク'),
  def(56, '古樹の番人', 'plant', 'earth', 'support', 3, 'balanced', '防御・回復'),
  def(57, 'メモリーフェアリー', 'plant', 'light', 'support', 3, 'balanced', '記憶・支援'),
  def(58, 'ルーンブロッサム', 'plant', 'light', 'caster', 4, 'offense', '高位魔法型'),
  def(59, 'エルダードライアド', 'plant', 'light', 'support', 4, 'balanced', '高位回復型'),
  def(60, '世界樹の精', 'plant', 'light', 'support', 5, 'late', '伝説級・回復支援'),
];

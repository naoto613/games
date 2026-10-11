// 水棲系（101〜120）。tools/v2/gen_monsters.py で 仕様書の 表から 生成。
// def(番号, 名前, 属性, 役割, ランク, 成長型, 特徴)
import { def } from './def';

export const WATER = [
  def(101, 'クラブリン', 'water', 'water', 'tank', 1, 'endure', '序盤タンク'),
  def(102, 'コーラルスネイル', 'water', 'water', 'support', 1, 'balanced', '防御・回復'),
  def(103, 'アトラフィッシュ', 'water', 'water', 'speed', 2, 'early', '高速水攻撃'),
  def(104, 'アクアバット', 'water', 'water', 'speed', 1, 'early', '水属性高速型'),
  def(105, 'アビスイール', 'water', 'thunder', 'special', 2, 'variable', '雷・水複合攻撃'),
  def(106, 'シェルナイト', 'water', 'water', 'tank', 2, 'endure', '防御型'),
  def(107, 'ディープジェリー', 'water', 'shadow', 'status', 2, 'balanced', '状態異常'),
  def(108, 'タイドサーペント', 'water', 'water', 'attacker', 2, 'balanced', '水範囲攻撃'),
  def(109, 'ネレイド', 'water', 'water', 'support', 2, 'balanced', '回復・支援'),
  def(110, 'ミズチ', 'water', 'water', 'caster', 2, 'balanced', '水魔法'),
  def(111, 'スノークラブ', 'water', 'ice', 'tank', 2, 'endure', '氷防御型'),
  def(112, 'ブリザードシャーク', 'water', 'ice', 'attacker', 2, 'balanced', '氷物理型'),
  def(113, 'サンダーオルカ', 'water', 'thunder', 'attacker', 3, 'balanced', '雷範囲攻撃'),
  def(114, 'ミラージュシェル', 'water', 'water', 'special', 3, 'variable', '反射・防御'),
  def(115, 'アビスホエール', 'water', 'water', 'tank', 4, 'endure', '超高HPタンク'),
  def(116, '深海司祭ネレウス', 'water', 'water', 'support', 4, 'balanced', '高位支援・水魔法'),
  def(117, 'ルーンマーメイド', 'water', 'light', 'support', 3, 'balanced', '状態異常回復'),
  def(118, '海底の巨獣', 'water', 'water', 'attacker', 4, 'offense', '高位物理型'),
  def(119, '深淵のウロコ王', 'water', 'water', 'attacker', 4, 'offense', '高位ボス系統'),
  def(120, '原初の海竜', 'water', 'water', 'attacker', 5, 'late', '伝説級'),
];

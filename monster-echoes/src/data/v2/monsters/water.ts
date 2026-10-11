// 水棲系（101〜120）。tools/v2/gen_monsters.py で 仕様書の 表から 生成。
// def(番号, 名前, 系統, 属性, 役割, ランク, 成長型, 特徴, { slug: ファイル名 })
import { def } from './def';

export const WATER = [
  def(101, 'クラブリン', 'water', 'water', 'tank', 1, 'endure', '序盤タンク', { slug: 'crablin' }),
  def(102, 'コーラルスネイル', 'water', 'water', 'support', 1, 'balanced', '防御・回復', { slug: 'coral_snail' }),
  def(103, 'アトラフィッシュ', 'water', 'water', 'speed', 2, 'early', '高速水攻撃', { slug: 'atla_fish' }),
  def(104, 'アクアバット', 'water', 'water', 'speed', 1, 'early', '水属性高速型', { slug: 'aqua_bat' }),
  def(105, 'アビスイール', 'water', 'thunder', 'special', 2, 'variable', '雷・水複合攻撃', { slug: 'abyss_eel' }),
  def(106, 'シェルナイト', 'water', 'water', 'tank', 2, 'endure', '防御型', { slug: 'shell_knight' }),
  def(107, 'ディープジェリー', 'water', 'shadow', 'status', 2, 'balanced', '状態異常', { slug: 'deep_jelly' }),
  def(108, 'タイドサーペント', 'water', 'water', 'attacker', 2, 'balanced', '水範囲攻撃', { slug: 'tide_serpent' }),
  def(109, 'ネレイド', 'water', 'water', 'support', 2, 'balanced', '回復・支援', { slug: 'nereid' }),
  def(110, 'ミズチ', 'water', 'water', 'caster', 2, 'balanced', '水魔法', { slug: 'mizuchi' }),
  def(111, 'スノークラブ', 'water', 'ice', 'tank', 2, 'endure', '氷防御型', { slug: 'snow_crab' }),
  def(112, 'ブリザードシャーク', 'water', 'ice', 'attacker', 2, 'balanced', '氷物理型', { slug: 'blizzard_shark' }),
  def(113, 'サンダーオルカ', 'water', 'thunder', 'attacker', 3, 'balanced', '雷範囲攻撃', { slug: 'thunder_orca' }),
  def(114, 'ミラージュシェル', 'water', 'water', 'special', 3, 'variable', '反射・防御', { slug: 'mirage_shell' }),
  def(115, 'アビスホエール', 'water', 'water', 'tank', 4, 'endure', '超高HPタンク', { slug: 'abyss_whale' }),
  def(116, '深海司祭ネレウス', 'water', 'water', 'support', 4, 'balanced', '高位支援・水魔法', { slug: 'nereus' }),
  def(117, 'ルーンマーメイド', 'water', 'light', 'support', 3, 'balanced', '状態異常回復', { slug: 'rune_mermaid' }),
  def(118, '海底の巨獣', 'water', 'water', 'attacker', 4, 'offense', '高位物理型', { slug: 'seabed_behemoth' }),
  def(119, '深淵のウロコ王', 'water', 'water', 'attacker', 4, 'offense', '高位ボス系統', { slug: 'abyss_scale_king' }),
  def(120, '原初の海竜', 'water', 'water', 'attacker', 5, 'late', '伝説級', { slug: 'primal_sea_dragon' }),
];

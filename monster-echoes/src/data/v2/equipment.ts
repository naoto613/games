// そうび（Q10：モンスター 1体に アクセサリ 1つ。第3章で 基本、第4章で 工房の 強化、第7章で 特殊効果）。
// HP は ふやさない（戦闘の あとの HP を そのまま もどせるように）。
import type { ResistKey, Stats } from '../types';

export type EquipStat = Exclude<keyof Stats, 'hp' | 'mp'>;
export type EquipDef = {
  id: string;
  name: string;
  price: number;
  stats: Partial<Record<EquipStat, number>>;
  resist?: Partial<Record<ResistKey, number>>;
  /** どこで かえるか（町の ID）。ない ものは ひろう・もらう だけ */
  shops: string[];
  description: string;
};

export const EQUIPS: EquipDef[] = [
  { id: 'windcharm', name: 'かぜのおまもり', price: 0, stats: { speed: 4 }, resist: { wind: 1 }, shops: [], description: 'すばやさ +4・かぜに つよく なる。' },
  { id: 'cloudfeather', name: 'くものはねかざり', price: 0, stats: { speed: 10 }, shops: [], description: 'すばやさ +10。くものように かるい。' },
  { id: 'powerring', name: 'ちからのゆびわ', price: 320, stats: { attack: 6 }, shops: ['kazeno'], description: 'こうげき +6。' },
  { id: 'guardbangle', name: 'まもりのうでわ', price: 320, stats: { defense: 6 }, shops: ['kazeno'], description: 'しゅび +6。' },
  { id: 'magicbrooch', name: 'まりょくのブローチ', price: 320, stats: { magic: 6 }, shops: ['kazeno'], description: 'まりょく +6。' },
  { id: 'calmbead', name: 'しずめのたま', price: 280, stats: { spirit: 6 }, shops: ['kazeno'], description: 'せいしん +6。じゅもんや いきに つよく なる。' },
  { id: 'earthcharm', name: 'だいちのおまもり', price: 260, stats: { defense: 2 }, resist: { earth: 1 }, shops: ['kazeno'], description: 'しゅび +2・だいちに つよく なる。' },
  { id: 'stormcharm', name: 'らいめいのおまもり', price: 260, stats: { spirit: 2 }, resist: { thunder: 1 }, shops: ['kazeno'], description: 'せいしん +2・かみなりに つよく なる。' },
];
export const EQUIP_BY_ID: Record<string, EquipDef> = Object.fromEntries(EQUIPS.map((e) => [e.id, e]));

/** そうびの こうかの みじかい 説明（「こうげき+6 かぜ↑」など） */
const STAT_JA: Record<EquipStat, string> = { attack: 'こうげき', defense: 'しゅび', speed: 'すばやさ', magic: 'まりょく', spirit: 'せいしん' };
const RES_JA: Partial<Record<ResistKey, string>> = { fire: 'ほのお', water: 'みず', ice: 'こおり', wind: 'かぜ', earth: 'だいち', thunder: 'かみなり', light: 'ひかり', shadow: 'かげ' };
export function equipSummary(e: EquipDef): string {
  const a = Object.entries(e.stats).map(([k, v]) => `${STAT_JA[k as EquipStat]}+${v}`);
  const b = Object.entries(e.resist ?? {}).map(([k, v]) => `${RES_JA[k as ResistKey] ?? k}${(v ?? 0) > 0 ? '↑' : '↓'}`);
  return [...a, ...b].join(' ');
}

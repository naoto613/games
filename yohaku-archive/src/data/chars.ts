// 仲間キャラクター
export type CharId = 'seil' | 'dran';
export type StatKey = 'hp' | 'ap' | 'atk' | 'def' | 'obs' | 'edit';

export interface CharDef {
  id: CharId;
  name: string;
  role: string;
  belief: string;
  base: Record<StatKey, number>;
  grow: Record<StatKey, number>;
  equip: { weapon: string | null; armor: string | null; acc: string | null };
}

export const CHARS: Record<CharId, CharDef> = {
  seil: {
    id: 'seil', name: 'セイル', role: '編纂', belief: '事実を修復すれば、正しい世界に戻れる。',
    base: { hp: 62, ap: 10, atk: 9, def: 6, obs: 8, edit: 10 },
    grow: { hp: 7, ap: 0.8, atk: 1.6, def: 1.1, obs: 0.9, edit: 1.2 },
    equip: { weapon: 'quill', armor: 'coat', acc: null },
  },
  dran: {
    id: 'dran', name: 'ドラン', role: '干渉', belief: '失われた歴史も含めて、自分の人生である。',
    base: { hp: 92, ap: 8, atk: 14, def: 9, obs: 4, edit: 2 },
    grow: { hp: 11, ap: 0.6, atk: 2.2, def: 1.6, obs: 0.4, edit: 0.2 },
    equip: { weapon: 'sabre', armor: 'vest', acc: null },
  },
};

export const MAX_LEVEL = 20;

/** 次のレベルまでに必要な経験値 */
export function expToNext(level: number): number {
  return 16 * level + 6 * level * level;
}

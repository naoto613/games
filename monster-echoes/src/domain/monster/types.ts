import type { Resistances, Stats, Tactic } from '../../data/types';

export type Sex = 'A' | 'B' | 'unknown';

/** プレイヤーが持つモンスター個体（種族マスタとは分けて持つ） */
export type MonsterInstance = {
  id: string;
  speciesId: string;
  nickname?: string;
  sex: Sex;
  level: number;
  experience: number;
  plusValue: number;
  /** 最大値としての能力（hp, mp は最大HP・最大MP） */
  stats: Stats;
  hp: number;
  mp: number;
  skills: string[];
  resistances: Resistances;
  wildness: number;
  parentIds: [string, string] | null;
  /** 親の種族（親が手放されても系図を表示できるように） */
  parentSpeciesIds: [string, string] | null;
  generation: number;
  obtainedFrom: string;
  createdAt: number;
  favorite: boolean;
  /** 特技枠がいっぱいで覚えられなかった特技（プレイヤーが選ぶまで保留） */
  pendingSkills: string[];
  /** このモンスターだけの作戦（未設定ならパーティ全体の作戦） */
  tactic?: Tactic;
  // ---- v2（SCHEMA v5）
  /** 個体の できごと（仲間になった・配合・ボスを たおした など） */
  history?: { at: number; kind: string; text: string }[];
  /** お気に入り・育成中・配合候補 などの ラベル（仕様 17.2） */
  labels?: string[];
  /** 親として 配合に つかった 回数 */
  breedingCount?: number;
};

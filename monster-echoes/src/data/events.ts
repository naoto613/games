// ダンジョンの 固有イベント（データ定義）。ばしょ・条件・ほうしゅう・ストーリーへの えいきょうを ここに まとめる。
// 発生の判定は Game（application）、ひょうじは ui/screens/events.ts が おこなう。
import type { EnemySpec, Reward } from './types';

export type EventKind =
  | 'story' // ものがたりの てがかり（しらべる）
  | 'trail' // ひかる あしあと（つながる てがかり）
  | 'nest' // めずらしい モンスターの すみか（せんとうに なる）
  | 'hidden' // かくし とびら（みつけると へやが ひらく）
  | 'vault'; // たからばこより 貴重な ほうもつこ

/** 会話の ぶんきに つかう パーティの じょうほう */
export type EventContext = { partySpecies: string[]; partyFamilies: string[] };

export type EventDef = {
  id: string;
  areaId: string;
  /** なんかいめの フロアに あるか（0 はじまり） */
  floorIndex: number;
  kind: EventKind;
  /** かならず たっしている ひつような ストーリーフラグ */
  requires?: string[];
  /** このフラグが たっていたら でない（取得ずみ など） */
  hiddenWhen?: string[];
  /** この しゅぞくを もっていたら でない */
  notOwned?: string;
  /** 見つけたときの メッセージ */
  pages: string[];
  /** パーティに おうじて つけたす メッセージ */
  react?: (c: EventContext) => string[];
  setFlags?: string[];
  rewards?: Reward[];
  /** nest: たたかう あいて */
  encounter?: EnemySpec;
  /** hidden: とびらの おくの ほうもつこ（vault）の ID */
  vaultId?: string;
  /** ぼうけんメモに のる ひとこと */
  memo?: string;
};

/**
 * v1 の エリア（はじまりのもり など）の 固有イベントは v2 の 世界への 切りかえ（Phase 1）で はずした。
 * 仕組み（足あと・すみか・隠し扉）は のこしてあり、Phase 2 で 珍しい魔物の 痕跡（仕様 16）に つかう。
 */
export const EVENTS: EventDef[] = [];

export const EVENT_BY_ID: Record<string, EventDef> = Object.fromEntries(EVENTS.map((e) => [e.id, e]));
export const eventsOnFloor = (areaId: string, floorIndex: number) => EVENTS.filter((e) => e.areaId === areaId && e.floorIndex === floorIndex);

// ---------------------------------------------------------------- ぼうけんメモ（フラグが たつと のる）

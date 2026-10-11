// モンスター200種（v2）。番号順に ならべる。
import type { MonsterDefinition } from '../types';
import { SLIME } from './slime';
import { BEAST } from './beast';
import { PLANT } from './plant';
import { BUG } from './bug';
import { BIRD } from './bird';
import { WATER } from './water';
import { MATERIAL } from './material';
import { SPIRIT } from './spirit';
import { DRAGON } from './dragon';
import { MYSTIC } from './mystic';

export const MONSTERS2: MonsterDefinition[] = [...SLIME, ...BEAST, ...PLANT, ...BUG, ...BIRD, ...WATER, ...MATERIAL, ...SPIRIT, ...DRAGON, ...MYSTIC];
export const MONSTER2_BY_ID: Record<string, MonsterDefinition> = Object.fromEntries(MONSTERS2.map((m) => [m.id, m]));
export const MONSTER2_BY_NAME: Record<string, MonsterDefinition> = Object.fromEntries(MONSTERS2.map((m) => [m.name, m]));
export const monsterNo = (no: number) => MONSTER2_BY_ID[`m${String(no).padStart(3, '0')}`];

/**
 * 要確認事項 Q16: 章の詳細に 出てくるが 200種の 表に ない 名前は、表の 近い 種に よみかえる。
 * 出現テーブルを 書くときは この 表を とおして ID に する。
 */
export const WILD_ALIASES: Record<string, string> = {
  グリーンピクシー: 'm043', // グリーンスプライト
  ライトニングキッド: 'm028', // サンダーリンクス
  深海ワーム: 'm075', // アビスセンチピード
  フロストウィスプ: 'm156', // 静寂の精霊
  フレイムモール: 'm125', // ラヴァゴーレム（083 アッシュバット も おなじ 役まわり）
  ボルケーノタートル: 'm131', // フォートレス
  スカーレットデーモン: 'm186', // 星喰いフェニックス（終盤のみ）
  シャドウモス: 'm071', // ナイトモス
  ヴォイドメイジ: 'm130', // ミラーメイジ（151 ルーンファントム も おなじ 役まわり）
};
/** 名前（別名を ふくむ）から モンスターID */
export function monsterIdOf(name: string): string | undefined {
  return WILD_ALIASES[name] ?? MONSTER2_BY_NAME[name]?.id;
}

/** v1 の 種族 → v2 の ID（セーブの 引き継ぎ用。計画書 §6.1） */
export const LEGACY_SPECIES_MAP: Record<string, string> = {
  lunaslime: 'm001', magmadog: 'm021', stonegolem: 'm121', frostbird: 'm082', sandworm: 'm070', leafant: 'm042',
  thunderkids: 'm028', darkeye: 'm181', metalspirit: 'm017', firedragon: 'm161', windcat: 'm022', icekrill: 'm162',
  greensprite: 'm043', devilcrab: 'm101', ghostbill: 'm141', darkdragon: 'm165', kinoborg: 'm044', lightningleo: 'm033',
  goldslime: 'm015', chaosdragon: 'm178',
  mintslime: 'm010', flameslime: 'm004', shadowdog: 'm026', icewolf: 'm024', claygolem: 'm122', rubykrill: 'm124',
  blazebird: 'm083', thunderbird: 'm084', venomworm: 'm075', magmaworm: 'm073', rosefant: 'm045', aquasprite: 'm109',
  redeye: 'm148', hellbill: 'm143', icedragon: 'm169', crimsondragon: 'm176', moonleo: 'm040', bluecrab: 'm111',
  poisonborg: 'm050', echoslime: 'm014',
};

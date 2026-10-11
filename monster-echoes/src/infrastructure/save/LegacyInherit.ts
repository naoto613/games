// 旧版（v1 の 40種の 世界）の セーブを v2 の 世界へ 引き継ぐ（要確認事項 Q9・計画書 §6.1）。
// のこす：モンスター（レベル・＋値・とくぎ・ニックネーム・性別・野生値・系図）、道具、お金、牧場の 広さ、図鑑。
// かえる：種族を v2 の ID に（対応表）、耐性は v2 の 種族の もの。物語は 第1章から やりなおし。
// v1 の 内容（エリア・ボス・闘技場）が v2 に おきかわる とき（Phase 1 の 切りかえ）に 移行として 実行する。
import type { SaveData } from '../../application/GameState';
import { getSpecies } from '../../data/monsters';
import { getSkill } from '../../data/skills';
import { LEGACY_SPECIES_MAP } from '../../data/v2/monsters';
import { initialChapterProgress } from '../../domain/progression/ChapterEngine';
import { initialProgress } from '../../domain/progression/ProgressionEngine';
import { maxLevelOf } from '../../domain/monster/Growth';
import { speciesResistances } from '../../domain/monster/MonsterFactory';
import type { MonsterInstance } from '../../domain/monster/types';

/** v1 の 種族ID → v2 の ID（v2 の ID は そのまま） */
export const toV2Species = (id: string): string => LEGACY_SPECIES_MAP[id] ?? id;
const mapList = (xs: readonly string[]) => [...new Set(xs.map(toV2Species))];

/** 引き継げない（表に ない）種族が ないか */
export function unknownLegacySpecies(save: SaveData): string[] {
  const ids = [...save.monsters.map((m) => m.speciesId), ...save.discoveredSpeciesIds, ...save.ownedSpeciesIds];
  return [...new Set(ids.filter((id) => !/^m\d{3}$/.test(id) && !LEGACY_SPECIES_MAP[id]))];
}

function inheritMonster(m: MonsterInstance, now: number): MonsterInstance {
  const speciesId = toV2Species(m.speciesId);
  const sp = getSpecies(speciesId);
  // とくぎは すべて v2 の 表に ある（v1 の 特技は のこしてある）。ない ものは 外す
  const known = (id: string) => { try { getSkill(id); return true; } catch { return false; } };
  const out: MonsterInstance = {
    ...m,
    speciesId,
    parentSpeciesIds: m.parentSpeciesIds ? [toV2Species(m.parentSpeciesIds[0]), toV2Species(m.parentSpeciesIds[1])] : null,
    resistances: speciesResistances(sp),
    skills: m.skills.filter(known),
    pendingSkills: m.pendingSkills.filter(known),
    history: [...(m.history ?? []), { at: now, kind: 'inherit', text: `${getSpecies(m.speciesId).name}から ${sp.name}として 引き継がれた` }],
    labels: m.labels ?? [],
    breedingCount: m.breedingCount ?? 0,
  };
  // v2 の レベル上限を こえていたら（ふつうは おきない）上限に あわせる
  const cap = maxLevelOf(out);
  if (out.level > cap) out.level = cap;
  return out;
}

/**
 * 引き継ぎ：あたらしい セーブを かえす（元の データは かえない）。
 * 2回 よんでも 結果は おなじ（すでに 引き継いだ ものは そのまま）。
 */
export function inheritLegacy(save: SaveData, now = Date.now()): SaveData {
  if (save.v2.legacy?.inherited) return save;
  const unknown = unknownLegacySpecies(save);
  if (unknown.length) throw new Error(`引き継げない 種族: ${unknown.join(', ')}`);
  return {
    ...save,
    monsters: save.monsters.map((m) => inheritMonster(m, now)),
    discoveredSpeciesIds: mapList(save.discoveredSpeciesIds),
    ownedSpeciesIds: mapList(save.ownedSpeciesIds),
    breedingHistory: save.breedingHistory.map((h) => ({
      ...h,
      childSpeciesId: toV2Species(h.childSpeciesId),
      parents: h.parents.map((p) => ({ ...p, speciesId: toV2Species(p.speciesId) })) as typeof h.parents,
    })),
    // 物語は 第1章から（v1 の 進行も はじめから）。探索中なら 街へ もどす
    progress: { ...initialProgress(), tutorialFlags: save.progress.tutorialFlags },
    chapters: initialChapterProgress(),
    story: { seen: [], records: [] },
    expedition: null,
    v2: { ...save.v2, legacy: { fromSchema: save.v2.legacy?.fromSchema ?? save.schemaVersion, at: now, inherited: true } },
  };
}

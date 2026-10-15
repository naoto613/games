// 旧版（v1 の 40種の 世界）の セーブを v2 の 世界へ 引き継ぐ（要確認事項 Q9・計画書 §6.1）。
// のこす：モンスター（レベル・＋値・とくぎ・ニックネーム・性別・野生値・系図）、道具、お金、牧場の 広さ、図鑑。
// かえる：種族を v2 の ID に（対応表）、耐性は v2 の 種族の もの。物語は 第1章から やりなおし。
// v1 の 内容（エリア・ボス・闘技場）が v2 に おきかわる とき（Phase 1 の 切りかえ）に 移行として 実行する。
import type { SaveData } from '../../application/GameState';
import { getSpecies } from '../../data/monsters';
import { getSkill } from '../../data/skills';
import { LEGACY_SPECIES_MAP } from '../../data/v2/monsters';
import { enterStage, initialChapterProgress } from '../../domain/progression/ChapterEngine';
import { createRng } from '../../core/Random';
import { findTile, loadMap } from '../../domain/dungeon/DungeonEngine';
import { createMonster } from '../../domain/monster/MonsterFactory';
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
  let monsters = save.monsters.map((m) => inheritMonster(m, now));
  let partyIds = save.partyIds;
  // 相棒の ルナスライムが いなければ（にがした など）あらためて 仲間に する
  if (!monsters.some((m) => m.speciesId === 'm001')) {
    const luna = createMonster('m001', createRng(now >>> 0), { level: 3, sex: 'B', obtainedFrom: 'story', existingIds: new Set(monsters.map((m) => m.id)), now });
    monsters = [...monsters, luna];
    partyIds = [luna.id, ...partyIds].slice(0, 3);
  }
  // 記念品：旧版で たおした ボスの かずに おうじて ちいさなメダル（Q9）
  const medals = save.progress.defeatedBossIds.length * 2;
  const ch = enterStage(initialChapterProgress(), '1-1');
  const town = loadMap('liefel');
  return {
    ...save,
    monsters,
    partyIds,
    discoveredSpeciesIds: mapList([...save.discoveredSpeciesIds, 'm001']),
    ownedSpeciesIds: mapList([...save.ownedSpeciesIds, 'm001']),
    breedingHistory: save.breedingHistory.map((h) => ({
      ...h,
      childSpeciesId: toV2Species(h.childSpeciesId),
      parents: h.parents.map((p) => ({ ...p, speciesId: toV2Species(p.speciesId) })) as typeof h.parents,
    })),
    inventory: medals ? { ...save.inventory, medal: (save.inventory.medal ?? 0) + medals } : save.inventory,
    // 物語は 第1章から（はじめの 物語は 見た ことに して、リーフェルの 広場から）
    player: { ...save.player, townMap: 'liefel', townPos: findTile(town, 'P')!, townDir: 'up' },
    progress: { ...initialProgress(), unlockedAreas: [], tutorialFlags: save.progress.tutorialFlags, storyFlags: { ch1_light_seen: true, partner_joined: true } },
    chapters: ch.ok ? ch.value.progress : initialChapterProgress(),
    story: { seen: ['ch1_night_light', 'ch1_rescue_luna'], records: [] },
    expedition: null,
    v2: { ...save.v2, legacy: { fromSchema: save.v2.legacy?.fromSchema ?? save.schemaVersion, at: now, inherited: true } },
  };
}

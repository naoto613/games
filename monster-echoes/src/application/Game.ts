import { AREAS, BOSSES, getArea, getArenaRank } from '../data/areas';
import { canWalk, generateRoomFloor, step as roomStep, type RoomTileMap } from '../domain/dungeon/RoomGen';
import { BALANCE } from '../data/balance';
import { getItem, ITEM_LIST } from '../data/items';
import { getSpecies } from '../data/monsters';
import type { Condition, EnemySpec, Reward, Tactic } from '../data/types';
import { createRng, type Rng } from '../core/Random';
import { err, ok, type Result } from '../core/Result';
import { battleRewards, createBattle, expForMember, resolveTurn } from '../domain/battle/BattleEngine';
import type { BattleState, TurnInput, TurnResult } from '../domain/battle/types';
import { BREEDING_ERROR_TEXT, checkBreedable, executeBreeding, previewBreeding, type BreedingPreview } from '../domain/breeding/BreedingEngine';
import { generateFloor } from '../domain/dungeon/FloorGen';
import { DIRS, encounterChance, findTile, isPassable, loadMap, rollEncounter, tileAt, type Dir, type Pos, type TileMap } from '../domain/dungeon/DungeonEngine';
import { gainExperience, resolvePendingSkill, type LevelUpEvent } from '../domain/monster/Growth';
import { createMonster, displayName } from '../domain/monster/MonsterFactory';
import type { MonsterInstance } from '../domain/monster/types';
import { useFieldSkill as useFieldSkillDomain } from '../domain/monster/FieldSkills';
import { getSkill } from '../data/skills';
import { allMet, conditionMet, initialProgress, refreshUnlocks } from '../domain/progression/ProgressionEngine';
import { recruitChance, rollRecruit } from '../domain/recruitment/RecruitmentEngine';
import { weightedPick } from '../core/Random';
import { DEX_REWARDS, MEDAL_PRIZES, getTownMap, WARP_POINTS } from '../data/town';
import { SPECIES_LIST } from '../data/monsters';
import { eventsOnFloor, EVENT_BY_ID, type EventContext, type EventDef } from '../data/events';
import { eventAvailable, overlayEvents, type EventState } from '../domain/events/EventEngine';
import { defaultSettings, defaultV2State, GAME_VERSION, SCHEMA_VERSION, type SaveData, type StoryLog } from './GameState';
import { canEnterStage, clearStage, enterStage, hasFeature, initialChapterProgress, type ChapterProgress, type Unlocked } from '../domain/progression/ChapterEngine';
import type { FeatureId } from '../data/world/chapters';
import { LUNA_REACTIONS, NPC_BY_ID, STORY_EVENT_BY_ID, STORY_EVENTS } from '../data/story';
import type { LunaSituation, StoryAction, StoryLine, StoryTrigger } from '../data/story/types';
import { allCond, eventsFor, lunaReaction, markSeen, npcLines, renderLines, type StoryContext } from '../domain/story/StoryEngine';
import { EQUIP_BY_ID, type EquipDef } from '../data/v2/equipment';
import { withEquipment } from '../domain/monster/Equipment';

export type BattleContext =
  | { kind: 'wild' }
  | { kind: 'boss'; bossId: string }
  | { kind: 'arena'; rankId: string; index: number }
  | { kind: 'practice' };

export type EventResult = { def: EventDef; pages: string[]; rewards: Reward[]; battle: EnemySpec[] | null };
export type BattleSession = { state: BattleState; context: BattleContext; /** はじめて であう しゅぞく（図鑑に はじめて とうろくされる） */ firstSeen: string[]; /** はじめて たたかう ボスか */ firstBoss: boolean };

export type LevelUpReport = { monsterId: string; name: string; events: LevelUpEvent[] };
export type BattleSummary = {
  outcome: 'win' | 'lose' | 'escape';
  exp: number;
  gold: number;
  levelUps: LevelUpReport[];
  recruit: { speciesId: string; level: number; name: string } | null;
  recruitBlocked: boolean;
  goldLost: number;
  boss: { bossId: string; texts: string[]; story: string[]; rewards: Reward[] } | null;
  arena: { rankId: string; index: number; cleared: boolean; rewards: Reward[] } | null;
  unlocked: { areas: string[]; ranks: string[] };
  /** v2：章の 進行で 解放された もの（ボスを たおして 章クリア など） */
  chapter: Unlocked | null;
};

export type MoveResult =
  | { kind: 'blocked' }
  | { kind: 'moved'; encounter: EnemySpec[] | null; /** 毒の床を ふんだ 回数 */ poison?: number; /** すべった・ながされた */ slid?: boolean }
  | { kind: 'stairs' }
  | { kind: 'exit' }
  | { kind: 'chest'; reward: Reward | null; pos: Pos }
  | { kind: 'spring'; used: boolean }
  | { kind: 'boss'; bossId: string }
  | { kind: 'npc'; id: string }
  | { kind: 'warp'; to: string }
  | { kind: 'locked'; text: string }
  | { kind: 'gate'; areaIds: string[]; closed?: string; warps?: string[] }
  /** 町の しらべられる もの（石碑 など） */
  | { kind: 'spot'; target: string }
  /** ダンジョンの 物語イベント（しらべると おこる） */
  | { kind: 'storyEvent'; id: string }
  /** ボスの いない ステージの さいごの 出口（ステージクリア） */
  | { kind: 'stageClear' }
  | { kind: 'event'; eventId: string };

export interface SaveSink {
  save(data: SaveData): Promise<void>;
}

/** 店に並ぶ品物（進行で増える） */
/** エリアの n かいめの フロア（シードから 自動生成） */
export function floorMap(areaId: string, floorIndex: number, seed: number): TileMap {
  const area = getArea(areaId);
  const f = area.floors[floorIndex];
  const last = floorIndex === area.floors.length - 1;
  if (area.stageId) {
    // v2：ボスの へやは 専用、それ いがいは 部屋テンプレート型（Q14）。さいごの 階の > は ステージの 出口
    if (f.bossId) return generateFloor({ id: f.id, theme: area.theme, first: false, last: true, boss: true, spring: false }, seed);
    return generateRoomFloor({ id: f.id, theme: area.theme, first: floorIndex === 0, last: false, spring: !!f.spring, gimmicks: f.gimmicks, events: (f.storyEvents ?? []).map((id) => ({ id, kind: 'story' })) }, seed);
  }
  const events = eventsOnFloor(areaId, floorIndex).filter((e) => e.kind !== 'vault').map((e) => ({ id: e.id, kind: e.kind, vaultId: e.vaultId }));
  return generateFloor({ id: f.id, theme: area.theme, first: floorIndex === 0, last, boss: !!f.bossId, spring: floorIndex === 1 && !last, events }, seed);
}

export function shopItems(s: SaveData): string[] {
  const list = ['herb', 'curegrass', 'jerky', 'returnwing', 'bonemeat', 'mpdrop'];
  // 第1章を こえると つよい 回復と にくも ならぶ
  if (s.chapters.chapter >= 2) list.push('bigherb', 'lifeleaf');
  if (s.chapters.chapter >= 3) list.push('primemeat');
  return ITEM_LIST.filter((i) => list.includes(i.id)).map((i) => i.id);
}

/** はじめの 物語（夜の光 → ルナスライムを たすける）は 名前を きめた あとに タイトル画面で みせる */
export const INTRO_EVENTS = ['ch1_night_light', 'ch1_rescue_luna'];

export function newGameState(name: string, rng: Rng, now = Date.now()): SaveData {
  // 相棒の ルナスライム（はじめの 物語で なかまに なる。ここでは その あとの 状態を つくる）
  const luna = createMonster('m001', rng, { level: 3, sex: 'B', obtainedFrom: 'story', existingIds: new Set(), now });
  luna.history = [{ at: now, kind: 'join', text: 'リーフェルの 森の 入口で たすけられ、相棒に なった' }];
  const town = loadMap('liefel');
  const ch = enterStage(initialChapterProgress(), '1-1');
  return {
    schemaVersion: SCHEMA_VERSION,
    gameVersion: GAME_VERSION,
    savedAt: now,
    player: { name, gold: 120, tactic: 'attack', playTimeSec: 0, townMap: 'liefel', townPos: findTile(town, 'P')!, townDir: 'up' },
    monsters: [luna],
    partyIds: [luna.id],
    storageIds: [],
    capacity: BALANCE.storageCapacityStart,
    inventory: { herb: 5, jerky: 3, returnwing: 2 },
    progress: { ...initialProgress(), unlockedAreas: [], storyFlags: { ch1_light_seen: true, partner_joined: true } },
    discoveredSpeciesIds: ['m001'],
    ownedSpeciesIds: ['m001'],
    breedingHistory: [],
    expedition: null,
    settings: defaultSettings(),
    chapters: ch.ok ? ch.value.progress : initialChapterProgress(),
    story: { seen: [...INTRO_EVENTS], records: [] },
    v2: defaultV2State(),
  };
}

const addUnique = (arr: string[], v: string) => (arr.includes(v) ? arr : [...arr, v]);

/**
 * ゲームのユースケースをまとめたクラス。画面はここのメソッドを呼ぶだけで、ルールは持たない。
 * 各メソッドは成功したときだけ state を置きかえる（途中で失敗しても半端な状態にならない）。
 */
export class Game {
  state: SaveData;
  battle: BattleSession | null = null;
  rng: Rng;
  private sink: SaveSink | null;
  private saving: Promise<void> = Promise.resolve();
  lastSaveError: unknown = null;

  constructor(state: SaveData, opts: { rng?: Rng; sink?: SaveSink | null } = {}) {
    this.state = { ...state, storageIds: state.monsters.map((m) => m.id).filter((id) => !state.partyIds.includes(id)) };
    this.rng = opts.rng ?? createRng((Date.now() ^ (Math.random() * 1e9)) >>> 0);
    this.sink = opts.sink ?? null;
    // 自動生成マップに なる まえの セーブ: フロアの スタートから やりなおす
    const ex = this.state.expedition;
    if (ex && (ex.pos.x < 0 || !isPassable(floorMap(ex.areaId, ex.floorIndex, ex.mapSeed), ex.pos.x, ex.pos.y))) {
      this.state.expedition = { ...ex, pos: findTile(floorMap(ex.areaId, ex.floorIndex, ex.mapSeed), 'S')!, openedChests: ex.openedChests.filter((k) => !k.startsWith(`${ex.floorIndex}:`)) };
    }
  }

  // ---------------------------------------------------------------- 保存
  /** 保存が おわるたびに よばれる（画面の すみに きろくマークを だす） */
  onSaved: ((ok: boolean) => void) | null = null;
  /** 保存（直列化して、同時に二重保存しない）。失敗は lastSaveError に残し、呼び出し側に伝える。 */
  save(): Promise<void> {
    const snapshot: SaveData = structuredClone({ ...this.state, savedAt: Date.now(), storageIds: this.storageIds() });
    this.saving = this.saving.catch(() => {}).then(async () => {
      if (!this.sink) return;
      try {
        await this.sink.save(snapshot);
        this.lastSaveError = null;
        this.onSaved?.(true);
      } catch (e) {
        this.lastSaveError = e;
        this.onSaved?.(false);
        throw e;
      }
    });
    return this.saving;
  }
  private autosave() {
    this.save().catch(() => {});
  }

  // ---------------------------------------------------------------- 参照
  monster(id: string) {
    return this.state.monsters.find((m) => m.id === id);
  }
  get party(): MonsterInstance[] {
    return this.state.partyIds.map((id) => this.monster(id)!).filter(Boolean);
  }
  storageIds() {
    return this.state.monsters.map((m) => m.id).filter((id) => !this.state.partyIds.includes(id));
  }
  get flags(): Record<string, boolean> {
    return this.state.progress.storyFlags;
  }
  private update(fn: (s: SaveData) => void) {
    const s = structuredClone(this.state);
    fn(s);
    s.storageIds = s.monsters.map((m) => m.id).filter((id) => !s.partyIds.includes(id));
    this.state = s;
    this.autosaveSoon();
  }
  /** オートセーブ: かわった あと すこし まって まとめて 保存（あるくたびに かきこまない） */
  private saveTimer: ReturnType<typeof setTimeout> | null = null;
  private autosaveSoon() {
    if (!this.sink || this.saveTimer) return;
    this.saveTimer = setTimeout(() => { this.saveTimer = null; this.autosave(); }, 1200);
  }
  /** まって いる オートセーブを すぐ おこなう（アプリを とじる ときなど） */
  flushSave(): Promise<void> {
    if (this.saveTimer) { clearTimeout(this.saveTimer); this.saveTimer = null; }
    return this.save();
  }
  private replaceMonster(s: SaveData, m: MonsterInstance) {
    s.monsters = s.monsters.map((x) => (x.id === m.id ? m : x));
  }

  // ---------------------------------------------------------------- まち
  addPlayTime(sec: number) {
    this.state = { ...this.state, player: { ...this.state.player, playTimeSec: this.state.player.playTimeSec + sec } };
  }
  setTownPos(pos: Pos, dir: Dir) {
    this.state = { ...this.state, player: { ...this.state.player, townPos: pos, townDir: dir } };
  }
  /** みんなの作戦をまとめて変える（個別の作戦も上書きする） */
  setTactic(t: Tactic) {
    this.update((s) => {
      s.player.tactic = t;
      s.monsters = s.monsters.map((m) => (s.partyIds.includes(m.id) ? { ...m, tactic: t } : m));
    });
    this.syncBattleTactics();
    this.autosave();
  }
  /** 1体ごとの作戦 */
  setMonsterTactic(monsterId: string, t: Tactic) {
    const m = this.monster(monsterId);
    if (!m) return;
    this.update((s) => this.replaceMonster(s, { ...m, tactic: t }));
    this.syncBattleTactics();
    this.autosave();
  }
  tacticOf(m: MonsterInstance): Tactic {
    return m.tactic ?? this.state.player.tactic;
  }
  /** 戦闘中なら、戦っているモンスターの作戦も合わせる */
  private syncBattleTactics() {
    if (!this.battle) return;
    const st = structuredClone(this.battle.state);
    st.tactic = this.state.player.tactic;
    for (const c of st.allies) {
      const m = c.instanceId ? this.monster(c.instanceId) : undefined;
      if (m) c.tactic = this.tacticOf(m);
    }
    this.battle = { ...this.battle, state: st };
  }
  /** なかまになったモンスターを、パーティの誰かと入れかえる（outId の個体は牧場へ） */
  swapIntoParty(inId: string, outId: string): Result<void> {
    const ids = this.state.partyIds.map((id) => (id === outId ? inId : id));
    if (!this.state.partyIds.includes(outId)) return err('いれかえる あいてが パーティに いません。');
    return this.setParty(ids);
  }
  setSettings(patch: Partial<SaveData['settings']>) {
    this.update((s) => Object.assign(s.settings, patch));
    this.autosave();
  }
  setFlag(id: string) {
    this.update((s) => (s.progress.storyFlags[id] = true));
  }
  setTutorial(id: string) {
    this.update((s) => (s.progress.tutorialFlags[id] = true));
  }

  // ---- v2 の 章・街・機能（data/world/chapters.ts）
  get chapters(): ChapterProgress {
    return this.state.chapters;
  }
  hasFeature(f: FeatureId): boolean {
    return hasFeature(this.chapters, f);
  }
  /** ステージに 着いた。解放された 機能・街を かえす */
  enterStage(stageId: string): Result<Unlocked> {
    const r = enterStage(this.chapters, stageId);
    if (!r.ok) return r;
    this.update((s) => (s.chapters = r.value.progress));
    return ok(r.value.unlocked);
  }
  // ---- v2 の 物語（data/story・domain/story/StoryEngine）
  get story(): StoryLog {
    return this.state.story;
  }
  storyContext(): StoryContext {
    const partner = this.state.monsters.find((m) => m.speciesId === 'm001');
    return {
      chapters: this.chapters, flags: this.state.progress.storyFlags, seen: this.story.seen,
      partySpecies: this.party.map((m) => m.speciesId), ownedSpecies: this.state.ownedSpeciesIds,
      playerName: this.state.player.name, partnerName: partner ? displayName(partner) : 'ルナスライム',
    };
  }
  /**
   * きっかけに あう 物語イベントを すべて おこす（台詞を かえし、フラグ・道具・仲間などを 反映）。
   * 一度きりの イベントは 二度と おこらない。
   */
  runStory(trigger: StoryTrigger): { id: string; lines: StoryLine[] }[] {
    const out: { id: string; lines: StoryLine[] }[] = [];
    for (const e of eventsFor(this.storyContext(), STORY_EVENTS, trigger)) {
      // まえの イベントで 条件が かわる ことが あるので もういちど たしかめる
      if (!allCond(this.storyContext(), e.conditions)) continue;
      this.update((s) => (s.story = { ...this.story, seen: markSeen(this.story.seen, e.id) }));
      for (const a of e.actions) this.applyStoryAction(a);
      // 台詞は 反映の あとに つくる（あたらしい 相棒の 名前などを つかう）
      out.push({ id: e.id, lines: renderLines(this.storyContext(), e.lines) });
    }
    if (out.length) this.autosave();
    return out;
  }
  private applyStoryAction(a: StoryAction) {
    switch (a.type) {
      case 'setFlag': this.setFlag(a.id); return;
      case 'giveItem': this.update((s) => (s.inventory[a.itemId] = (s.inventory[a.itemId] ?? 0) + a.count)); return;
      case 'giveEquip': this.update((s) => { const o = s.v2.equipment.owned; o[a.equipId] = (o[a.equipId] ?? 0) + a.count; }); return;
      case 'gold': this.update((s) => (s.player = { ...s.player, gold: s.player.gold + a.amount })); return;
      case 'heal': this.healAll(); return;
      case 'clearStage': {
        const done = this.chapters.clearedStages.includes(a.id);
        this.clearStage(a.id);
        // ステージクリアで おこる 物語（章クリアの あとの 案内など）
        if (!done) this.queueStory(this.runStory({ kind: 'clearStage', target: a.id }));
        return;
      }
      case 'battle': this.storyBattle = a.enemies; return;
      case 'record':
        this.update((s) => {
          const st = this.story;
          if (!st.records.some((r) => r.id === a.id)) s.story = { ...st, records: [...st.records, { id: a.id, title: a.title }] };
        });
        return;
      case 'giveMonster': {
        const m = createMonster(a.speciesId, this.rng, { level: a.level, obtainedFrom: 'story', existingIds: new Set(this.state.monsters.map((x) => x.id)) });
        if (a.nickname) m.nickname = a.nickname;
        this.update((s) => {
          s.monsters.push(m);
          // 相棒は かならず パーティの 先頭に いれる
          if (a.partner) s.partyIds = [m.id, ...s.partyIds].slice(0, BALANCE.partySize);
          else if (s.partyIds.length < BALANCE.partySize) s.partyIds.push(m.id);
          s.ownedSpeciesIds = addUnique(s.ownedSpeciesIds, a.speciesId);
          s.discoveredSpeciesIds = addUnique(s.discoveredSpeciesIds, a.speciesId);
        });
        return;
      }
    }
  }
  /** NPC に はなしかける（章ごとに かわる 台詞） */
  talkTo(npcId: string): StoryLine[] {
    const npc = NPC_BY_ID[npcId];
    if (!npc) return [];
    const ev = this.runStory({ kind: 'talk', target: npcId });
    if (ev.length) return ev.flatMap((e) => e.lines);
    return npcLines(this.storyContext(), npc) ?? [];
  }
  /** ルナスライムの 反応（一度きりの 反応は 見た ことを のこす） */
  lunaSays(situation: LunaSituation): string | null {
    const r = lunaReaction(this.storyContext(), LUNA_REACTIONS, situation);
    if (!r) return null;
    if (r.once) this.update((s) => (s.story = { ...this.story, seen: markSeen(this.story.seen, r.id) }));
    return r.text;
  }

  /** ステージを クリアした（章の 最後なら 章クリア）。解放された ものを かえす */
  clearStage(stageId: string): Result<Unlocked> {
    const r = clearStage(this.chapters, stageId);
    if (!r.ok) return r;
    this.update((s) => (s.chapters = r.value.progress));
    // 第2章クリア：牧場の 拡張（仕様 15）
    if (r.value.unlocked.features.includes('ranchExpand')) this.update((s) => (s.capacity += BALANCE.ranchExpandAmount));
    this.autosave();
    return ok(r.value.unlocked);
  }

  // ---- そうび（Q10：アクセサリ 1つ）
  equipOf(monsterId: string): EquipDef | undefined {
    const id = this.state.v2.equipment.equipped[monsterId];
    return id ? EQUIP_BY_ID[id] : undefined;
  }
  /** もっているが だれも つけていない 数 */
  equipFree(equipId: string): number {
    const eq = this.state.v2.equipment;
    const used = Object.entries(eq.equipped).filter(([mid, e]) => e === equipId && this.state.monsters.some((m) => m.id === mid)).length;
    return Math.max(0, (eq.owned[equipId] ?? 0) - used);
  }
  /** そうびを つける（null で はずす）。ほかの こが つけている ものは つけられない */
  equip(monsterId: string, equipId: string | null): Result<void> {
    if (!this.hasFeature('equipment')) return err('まだ そうびは つかえない。');
    if (!this.monster(monsterId)) return err('モンスターが いません。');
    if (equipId) {
      if (!EQUIP_BY_ID[equipId]) return err('そんな そうびは ない。');
      if (this.state.v2.equipment.equipped[monsterId] !== equipId && this.equipFree(equipId) <= 0) return err('あまっている ものが ない。');
    }
    this.update((s) => {
      const e = { ...s.v2.equipment.equipped };
      if (equipId) e[monsterId] = equipId; else delete e[monsterId];
      s.v2 = { ...s.v2, equipment: { ...s.v2.equipment, equipped: e } };
    });
    this.autosave();
    return ok(undefined);
  }
  buyEquip(equipId: string): Result<void> {
    const e = EQUIP_BY_ID[equipId];
    if (!e) return err('そんな そうびは ない。');
    if (!this.spendGold(e.price)) return err('おかねが たりない。');
    this.update((s) => { const o = s.v2.equipment.owned; o[equipId] = (o[equipId] ?? 0) + 1; });
    this.autosave();
    return ok(undefined);
  }
  /** いなくなった モンスターの そうびを もどす（配合・にがす の あと） */
  private tidyEquipment() {
    const ids = new Set(this.state.monsters.map((m) => m.id));
    const e = this.state.v2.equipment.equipped;
    if (Object.keys(e).every((k) => ids.has(k))) return;
    this.update((s) => { s.v2 = { ...s.v2, equipment: { ...s.v2.equipment, equipped: Object.fromEntries(Object.entries(e).filter(([k]) => ids.has(k))) } }; });
  }

  /** 旅の扉で とべる 町（着いた ことが あり、いま いる 町 いがい） */
  warpTargets(): string[] {
    // いま いる 町（'kazeno_shrine' → 'kazeno'）
    const here = this.state.player.townMap.split('_')[0];
    return Object.keys(WARP_POINTS).filter((t) => this.chapters.towns.includes(t) && t !== here);
  }
  warpTo(townId: string): Result<void> {
    if (!this.hasFeature('doorWarp')) return err('まだ ほかの 扉へは とべない。');
    const w = WARP_POINTS[townId];
    if (!w || !this.chapters.towns.includes(townId)) return err('まだ いった ことの ない 町だ。');
    this.update((s) => { s.player.townMap = w.map; s.player.townPos = { x: w.x, y: w.y }; s.player.townDir = w.dir; s.chapters = { ...s.chapters, currentTown: townId }; });
    this.autosave();
    return ok(undefined);
  }

  /** おかねを はらう（たりなければ false） */
  spendGold(n: number): boolean {
    if (this.state.player.gold < n) return false;
    this.update((s) => (s.player = { ...s.player, gold: s.player.gold - n }));
    return true;
  }
  healAll() {
    this.update((s) => {
      s.monsters = s.monsters.map((m) => ({ ...m, hp: m.stats.hp, mp: m.stats.mp }));
    });
    this.autosave();
  }

  setParty(ids: string[]): Result<void> {
    if (!ids.length) return err('すくなくとも 1たいは つれていきましょう。');
    if (ids.length > BALANCE.partySize) return err(`つれていけるのは ${BALANCE.partySize}たい までです。`);
    if (new Set(ids).size !== ids.length) return err('おなじ モンスターを ふたつの わくに いれられません。');
    if (ids.some((id) => !this.monster(id))) return err('モンスターが みつかりません。');
    this.update((s) => (s.partyIds = [...ids]));
    this.autosave();
    return ok(undefined);
  }

  buy(itemId: string, count: number): Result<void> {
    const it = getItem(itemId);
    if (!shopItems(this.state).includes(itemId)) return err('その しなものは うっていません。');
    const cost = it.price * count;
    if (count <= 0 || cost > this.state.player.gold) return err('おかねが たりません。');
    this.update((s) => {
      s.player.gold -= cost;
      s.inventory[itemId] = (s.inventory[itemId] ?? 0) + count;
    });
    this.autosave();
    return ok(undefined);
  }
  sell(itemId: string, count: number): Result<void> {
    const it = getItem(itemId);
    if (it.category === 'key') return err('だいじな ものは うれません。');
    if ((this.state.inventory[itemId] ?? 0) < count || count <= 0) return err('もっていません。');
    this.update((s) => {
      s.inventory[itemId] -= count;
      if (!s.inventory[itemId]) delete s.inventory[itemId];
      s.player.gold += Math.floor(it.price / 2) * count;
    });
    this.autosave();
    return ok(undefined);
  }

  /** フィールドで道具を使う */
  useFieldItem(itemId: string, monsterId: string | null): Result<string> {
    const it = getItem(itemId);
    if ((this.state.inventory[itemId] ?? 0) <= 0) return err('もっていません。');
    if (!it.field) return err('ここでは つかえません。');
    const m = monsterId ? this.monster(monsterId) : undefined;
    let msg = '';
    switch (it.category) {
      case 'heal':
        if (!m || m.hp <= 0) return err('たおれている モンスターには つかえません。');
        if (m.hp >= m.stats.hp) return err('HPは まんたんです。');
        msg = `${displayName(m)}の HPが ${Math.min(it.power, m.stats.hp - m.hp)} かいふくした！`;
        this.update((s) => this.replaceMonster(s, { ...m, hp: Math.min(m.stats.hp, m.hp + it.power) }));
        break;
      case 'mp':
        if (!m || m.hp <= 0) return err('たおれている モンスターには つかえません。');
        if (m.mp >= m.stats.mp) return err('MPは まんたんです。');
        msg = `${displayName(m)}の MPが ${Math.min(it.power, m.stats.mp - m.mp)} かいふくした！`;
        this.update((s) => this.replaceMonster(s, { ...m, mp: Math.min(m.stats.mp, m.mp + it.power) }));
        break;
      case 'revive':
        if (!m || m.hp > 0) return err('たおれている モンスターに つかいましょう。');
        msg = `${displayName(m)}は いきかえった！`;
        this.update((s) => this.replaceMonster(s, { ...m, hp: Math.max(1, Math.floor((m.stats.hp * it.power) / 100)) }));
        break;
      case 'meat': {
        if (!m) return err('モンスターを えらんでください。');
        const w = Math.max(0, m.wildness - Math.round(it.power * BALANCE.recruitment.meatWildnessRate));
        msg = m.wildness > 0 ? `${displayName(m)}は よろこんで たべた！ やせいが ${m.wildness - w} へった。` : `${displayName(m)}は うれしそうに たべた！`;
        this.update((s) => this.replaceMonster(s, { ...m, wildness: w }));
        break;
      }
      case 'escape':
        if (!this.state.expedition) return err('いまは つかえません。');
        msg = 'かえりのはねを たかく なげた！';
        this.update((s) => (s.expedition = null));
        break;
      default:
        return err('いまは つかう ひつようが ありません。');
    }
    this.update((s) => {
      s.inventory[itemId] -= 1;
      if (!s.inventory[itemId]) delete s.inventory[itemId];
    });
    this.autosave();
    return ok(msg);
  }

  /** メニューで回復・蘇生の特技を使う（パーティのモンスターが使い手・対象） */
  useFieldSkill(casterId: string, skillId: string, targetId: string | null): Result<string> {
    const r = useFieldSkillDomain(this.party, casterId, skillId, targetId);
    if (!r.ok) return r;
    const caster = this.monster(casterId)!;
    const sk = getSkill(skillId);
    this.update((s) => { for (const m of r.value.party) this.replaceMonster(s, m); });
    const lines = r.value.healed.map(({ id, amount, revived }) => {
      const n = displayName(this.monster(id)!);
      return revived ? `${n}は いきかえった！` : sk.category === 'cure' ? `${n}の からだが もとに もどった！` : `${n}の HPが ${amount} かいふくした！`;
    });
    this.autosave();
    return ok(`${displayName(caster)}は ${sk.name}を つかった！\n${lines.join('\n')}`);
  }

  release(monsterId: string): Result<void> {
    const m = this.monster(monsterId);
    if (!m) return err('モンスターが みつかりません。');
    if (m.favorite) return err('おきにいりの モンスターは にがせません。');
    if (this.state.monsters.length <= 1) return err('さいごの 1たいは にがせません。');
    if (this.state.partyIds.length === 1 && this.state.partyIds[0] === monsterId) return err('パーティが いなくなって しまいます。');
    this.update((s) => {
      s.monsters = s.monsters.filter((x) => x.id !== monsterId);
      s.partyIds = s.partyIds.filter((x) => x !== monsterId);
    });
    this.tidyEquipment();
    this.autosave();
    return ok(undefined);
  }
  toggleFavorite(monsterId: string) {
    const m = this.monster(monsterId);
    if (!m) return;
    this.update((s) => this.replaceMonster(s, { ...m, favorite: !m.favorite }));
    this.autosave();
  }
  rename(monsterId: string, name: string) {
    const m = this.monster(monsterId);
    if (!m) return;
    const n = name.trim().slice(0, 8);
    this.update((s) => this.replaceMonster(s, { ...m, nickname: n || undefined }));
    this.autosave();
  }
  resolvePending(monsterId: string, skillId: string, forget: string | null) {
    const m = this.monster(monsterId);
    if (!m) return;
    this.update((s) => this.replaceMonster(s, resolvePendingSkill(m, skillId, forget)));
    this.autosave();
  }

  /** まちで 1 歩うごく。人・ふんすい・とびらは ぶつかると話しかける。 */
  townMove(dir: Dir): MoveResult {
    const def = getTownMap(this.state.player.townMap);
    const map = loadMap(def.id);
    const { townPos } = this.state.player;
    const [dx, dy] = DIRS[dir];
    const nx = townPos.x + dx, ny = townPos.y + dy;
    const t = tileAt(map, nx, ny);
    // 出入り口・階段
    const link = def.links.find((l) => l.x === nx && l.y === ny);
    if (link) {
      if (link.cond && !link.cond.every((c) => this.condMet(c))) {
        this.setTownPos(townPos, dir);
        return { kind: 'locked', text: link.locked ?? 'とびらは かたく とざされている。' };
      }
      this.update((s) => { s.player.townMap = link.to; s.player.townPos = { x: link.tx, y: link.ty }; s.player.townDir = link.dir; });
      this.arriveTown(link.to);
      return { kind: 'warp', to: link.to };
    }
    if (t === 'G' && def.gates) {
      this.setTownPos(townPos, dir);
      // 物語で ひらく 扉（ミズナの 祠 など）
      if (def.gateFlag && !this.state.progress.storyFlags[def.gateFlag]) return { kind: 'gate', areaIds: [], closed: def.gateFlagText ?? def.gateClosed };
      // 旅の扉（祠）からは、ほかの 町の 扉へも とべる（扉間移動）
      const warps = def.theme === 'shrine' && this.hasFeature('doorWarp') ? this.warpTargets() : undefined;
      return { kind: 'gate', areaIds: def.gates, closed: def.gateClosed, warps };
    }
    if (t === 'V' && def.spots?.[`${nx},${ny}`]) {
      this.setTownPos(townPos, dir);
      return { kind: 'spot', target: def.spots[`${nx},${ny}`] };
    }
    if (/[0-9]/.test(t)) {
      this.setTownPos(townPos, dir);
      return { kind: 'npc', id: def.npcs[t]?.id ?? t };
    }
    if (t === 'F') {
      this.setTownPos(townPos, dir);
      return { kind: 'npc', id: 'fountain' };
    }
    if (!isPassable(map, nx, ny)) {
      this.setTownPos(townPos, dir);
      return { kind: 'blocked' };
    }
    this.setTownPos({ x: nx, y: ny }, dir);
    return { kind: 'moved', encounter: null };
  }
  currentTownMap() {
    return getTownMap(this.state.player.townMap);
  }
  /** 条件（v1 の フラグ・ボス・闘技場と、v2 の ステージ・機能） */
  condMet(c: Condition): boolean {
    if (c.type === 'stage') return this.chapters.clearedStages.includes(c.id);
    if (c.type === 'feature') return hasFeature(this.chapters, c.id as FeatureId);
    return conditionMet(this.state.progress, c);
  }
  /** 町に 着いた：はじめて なら 章の ステージに 着いた ことに して 物語を おこす（街の ステージは 着けば クリア） */
  private arriveTown(mapId: string) {
    const stageId = getTownMap(mapId).stageId;
    if (!stageId || this.chapters.clearedStages.includes(stageId) || !canEnterStage(this.chapters, stageId).ok) return;
    const before = this.chapters.features;
    this.enterStage(stageId);
    this.queueStory(this.runStory({ kind: 'enterStage', target: stageId }));
    if (stageId !== '1-1') this.clearStage(stageId);
    this.noteUnlocked(before);
  }

  // ---- 画面に みせる 物語（台詞の じゅんばん）と 物語から はじまる 戦闘
  private storyQueue: { id: string; lines: StoryLine[] }[] = [];
  private storyBattle: EnemySpec[] | null = null;
  /** 新しく 解放された 機能（画面で 「〜が つかえるように なった」を 出す） */
  private unlockedQueue: FeatureId[] = [];
  private queueStory(xs: { id: string; lines: StoryLine[] }[]) {
    this.storyQueue.push(...xs);
  }
  private noteUnlocked(before: readonly FeatureId[]) {
    this.unlockedQueue.push(...this.chapters.features.filter((f) => !before.includes(f)));
  }
  /** まだ 見せていない 物語・解放・戦闘を とりだす（とりだすと きえる） */
  takeStory(): { story: { id: string; lines: StoryLine[] }[]; unlocked: FeatureId[]; battle: EnemySpec[] | null } {
    const out = { story: this.storyQueue, unlocked: this.unlockedQueue, battle: this.storyBattle };
    this.storyQueue = [];
    this.unlockedQueue = [];
    this.storyBattle = null;
    return out;
  }
  /** 町や ダンジョンで しらべる 物語イベント */
  inspect(target: string): boolean {
    const before = this.chapters.features;
    const r = this.runStory({ kind: 'manual', target });
    this.queueStory(r);
    this.noteUnlocked(before);
    return r.length > 0;
  }

  // ---------------------------------------------------------------- やりこみ
  /** ちいさなメダルを こうかんする */
  exchangeMedal(prizeId: string): Result<string> {
    const prize = MEDAL_PRIZES.find((x) => x.id === prizeId);
    if (!prize) return err('その しなものは ありません。');
    if ((this.state.inventory.medal ?? 0) < prize.cost) return err('メダルが たりません。');
    let msg = `${prize.name}を もらった！`;
    if (prize.id === 'egg') {
      if (this.state.monsters.length >= this.state.capacity) return err('ぼくじょうが いっぱいです。');
      const pool = SPECIES_LIST.filter((sp) => sp.rarity === 3);
      const sp = pool[Math.floor(this.rng.next() * pool.length)];
      const m = createMonster(sp.id, this.rng, { level: 1, plusValue: 2, obtainedFrom: 'egg', existingIds: new Set(this.state.monsters.map((x) => x.id)) });
      this.update((s) => { s.monsters.push(m); s.discoveredSpeciesIds = addUnique(s.discoveredSpeciesIds, sp.id); s.ownedSpeciesIds = addUnique(s.ownedSpeciesIds, sp.id); });
      msg = `ひかりのたまごが われて…\n${sp.name}が うまれた！（ぼくじょうに いるよ）`;
    }
    this.update((s) => {
      s.inventory.medal -= prize.cost;
      if (!s.inventory.medal) delete s.inventory.medal;
      const add = (id: string, n: number) => (s.inventory[id] = (s.inventory[id] ?? 0) + n);
      if (prize.id === 'bonemeat2') add('bonemeat', 2);
      if (prize.id === 'lifeleaf2') add('lifeleaf', 2);
      if (prize.id === 'primemeat') add('primemeat', 1);
      if (prize.id === 'capacity') s.capacity += 5;
    });
    this.autosave();
    return ok(msg);
  }
  /** 図鑑の ごほうびで まだ もらっていないもの（もらえる ものは すべて うけとる） */
  claimDexRewards(): { count: number; medals: number; items: Record<string, number> }[] {
    const seen = this.state.discoveredSpeciesIds.length;
    const got = DEX_REWARDS.filter((r) => seen >= r.count && !this.state.progress.storyFlags[`dex${r.count}`]);
    if (!got.length) return [];
    this.update((s) => {
      for (const r of got) {
        s.progress.storyFlags[`dex${r.count}`] = true;
        s.inventory.medal = (s.inventory.medal ?? 0) + r.medals;
        for (const [id, n] of Object.entries(r.items)) s.inventory[id] = (s.inventory[id] ?? 0) + n;
      }
    });
    this.autosave();
    return got;
  }
  /** おくの まきばの おじさん: たびから かえるたびに おみやげ */
  takeRanchGift(): boolean {
    if (!this.state.progress.storyFlags.ranchGift) return false;
    this.update((s) => { s.progress.storyFlags.ranchGift = false; s.inventory.jerky = (s.inventory.jerky ?? 0) + 2; });
    this.autosave();
    return true;
  }
  /** かんきゃくせきの れんしゅうじあい（パーティと おなじくらいの つよさ） */
  startPracticeBattle(): Result<BattleSession> {
    if (!this.party.some((m) => m.hp > 0)) return err('うごける モンスターが いません。');
    const lv = Math.max(2, Math.round(this.party.reduce((a, m) => a + m.level, 0) / this.party.length));
    const maxRarity = this.state.progress.storyFlags.champion ? 3 : this.state.progress.defeatedBossIds.includes('boss_cave') ? 2 : 1;
    const pool = SPECIES_LIST.filter((sp) => sp.rarity <= maxRarity && this.state.discoveredSpeciesIds.includes(sp.id));
    const pickOne = () => pool[Math.floor(this.rng.next() * pool.length)]?.id ?? 'lunaslime';
    const enemies = [0, 1, 2].map(() => ({ speciesId: pickOne(), level: lv, recruitable: false }));
    return ok(this.beginBattle('arena', enemies, { kind: 'practice' }));
  }

  // ---------------------------------------------------------------- 配合
  breedingWorld() {
    // 配合の 条件に つかう フラグ（物語の フラグ＋章で 解放された 機能）
    const flags = { ...this.flags, highBreeding: this.hasFeature('highBreeding'), legendBreeding: this.hasFeature('legendBreeding'), skillInherit: this.hasFeature('skillInherit'), skillInheritPlus: this.hasFeature('skillInheritPlus') };
    return { monsters: this.state.monsters, partyIds: this.state.partyIds, capacity: this.state.capacity, flags };
  }
  breedCheck(aId: string, bId: string): Result<BreedingPreview> {
    const c = checkBreedable(this.breedingWorld(), aId, bId);
    if (!c.ok) return err(BREEDING_ERROR_TEXT[c.error]);
    return ok(previewBreeding(c.value.a, c.value.b, this.breedingWorld().flags));
  }
  breed(aId: string, bId: string, skills: string[]): Result<MonsterInstance> {
    const r = executeBreeding(this.breedingWorld(), aId, bId, skills, this.rng);
    if (!r.ok) return err(r.error === 'skills' ? 'とくぎの えらびかたが ただしく ありません。' : BREEDING_ERROR_TEXT[r.error]);
    const { world, child, history } = r.value;
    this.update((s) => {
      s.monsters = world.monsters;
      s.partyIds = world.partyIds;
      s.breedingHistory = [...s.breedingHistory, history].slice(-200);
      s.discoveredSpeciesIds = addUnique(s.discoveredSpeciesIds, child.speciesId);
      s.ownedSpeciesIds = addUnique(s.ownedSpeciesIds, child.speciesId);
    });
    this.tidyEquipment();
    this.autosave();
    return ok(child);
  }

  // ---------------------------------------------------------------- 探索
  canStartExpedition(areaId: string): Result<void> {
    const area = getArea(areaId);
    if (area.stageId) {
      const c = canEnterStage(this.chapters, area.stageId);
      if (!c.ok) return c;
    } else if (!this.state.progress.unlockedAreas.includes(areaId)) return err('まだ その とびらは ひらいていない。');
    if (!this.party.some((m) => m.hp > 0)) return err('うごける モンスターが いません。いずみで かいふくしましょう。');
    return ok(undefined);
  }
  startExpedition(areaId: string): Result<void> {
    const c = this.canStartExpedition(areaId);
    if (!c.ok) return c;
    // はいるたびに ちがう シード → フロアの 形・たからばこの ばしょが かわる
    const mapSeed = Math.floor(this.rng.next() * 0x7fffffff);
    const map = floorMap(areaId, 0, mapSeed);
    this.update((s) => (s.progress.storyFlags.ranchGift = true));
    this.update((s) => (s.expedition = { areaId, floorIndex: 0, mapSeed, pos: findTile(map, 'S')!, dir: 'down', openedChests: [], springUsed: false, stepsSinceBattle: 0, eventsDone: [], switches: [] }));
    const stageId = getArea(areaId).stageId;
    if (stageId) {
      const before = this.chapters.features;
      this.enterStage(stageId);
      this.queueStory(this.runStory({ kind: 'enterStage', target: stageId }));
      this.queueStory(this.runStory({ kind: 'floor', target: stageId, floor: 1 }));
      this.noteUnlocked(before);
    }
    this.autosave();
    return ok(undefined);
  }
  get floor() {
    const ex = this.state.expedition;
    if (!ex) return null;
    const area = getArea(ex.areaId);
    return { area, floor: area.floors[ex.floorIndex], index: ex.floorIndex };
  }
  currentMap(): TileMap | null {
    const ex = this.state.expedition;
    if (!ex) return null;
    const map = floorMap(ex.areaId, ex.floorIndex, ex.mapSeed);
    if (!getArea(ex.areaId).stageId) return overlayEvents(map, this.eventState());
    // v2：見おわった 物語イベント（一度きり）は 消える
    const done = Object.entries(map.events ?? {}).filter(([, id]) => STORY_EVENT_BY_ID[id] && STORY_EVENT_BY_ID[id].once !== false && this.story.seen.includes(id));
    if (!done.length) return map;
    const tiles = map.tiles.map((r) => r.slice());
    const events = { ...map.events };
    for (const [k] of done) { const [x, y] = k.split(',').map(Number); tiles[y][x] = '.'; delete events[k]; }
    return { ...map, tiles, events };
  }
  private eventState(): EventState {
    return { flags: this.state.progress.storyFlags, owned: this.state.ownedSpeciesIds, done: this.state.expedition?.eventsDone ?? [] };
  }
  private eventContext(): EventContext {
    const party = this.party;
    return { partySpecies: party.map((m) => m.speciesId), partyFamilies: [...new Set(party.map((m) => getSpecies(m.speciesId).familyId))] };
  }
  /** 固有イベントを しらべた。メッセージ・ほうしゅう・せんとう あいてを かえす（発生していなければ null） */
  triggerEvent(eventId: string): EventResult | null {
    const def = EVENT_BY_ID[eventId];
    if (!def || !this.state.expedition) return null;
    // かくし とびらは ひらいた あとも とおれる（もういちど しらべたら そのまま）
    if (!eventAvailable(def, this.eventState())) return null;
    const rewards = def.rewards ?? [];
    this.update((s) => {
      if (def.kind === 'hidden' || def.kind === 'nest') s.expedition!.eventsDone.push(def.id);
      else s.progress.storyFlags[`ev_${def.id}`] = true;
      for (const f of def.setFlags ?? []) s.progress.storyFlags[f] = true;
      for (const r of rewards) this.applyReward(s, r);
    });
    this.autosave();
    return { def, pages: [...def.pages, ...(def.react?.(this.eventContext()) ?? [])], rewards, battle: def.encounter ? [def.encounter] : null };
  }
  leaveExpedition() {
    this.update((s) => (s.expedition = null));
    this.autosave();
  }
  /** 探索マップで 1 歩うごく。宝箱・ボス・いずみは ぶつかると調べる。 */
  move(dir: Dir): MoveResult {
    const ex = this.state.expedition;
    const map = this.currentMap();
    if (!ex || !map) return { kind: 'blocked' };
    const [dx, dy] = DIRS[dir];
    const nx = ex.pos.x + dx, ny = ex.pos.y + dy;
    const t = tileAt(map, nx, ny);
    const setDir = () => this.update((s) => (s.expedition!.dir = dir));
    if (t === 'C') {
      setDir();
      return this.openChest({ x: nx, y: ny });
    }
    if (t === 'H') {
      setDir();
      return this.useSpring();
    }
    if (t === 'B') {
      setDir();
      return { kind: 'boss', bossId: this.floor!.floor.bossId! };
    }
    if (t === 'V' || t === 'Z') {
      setDir();
      const id = map.events?.[`${nx},${ny}`];
      if (id && STORY_EVENT_BY_ID[id]) return { kind: 'storyEvent', id };
      return id ? { kind: 'event', eventId: id } : { kind: 'blocked' };
    }
    // v2 の ギミック（水流・氷で すべる、扉は スイッチで ひらく、毒の床）
    const room = 'gimmicks' in map ? (map as RoomTileMap) : null;
    let to = { x: nx, y: ny }, poison = 0, slid = false, switched: string[] = [];
    if (room) {
      if (!canWalk(room, nx, ny, ex.switches ?? [])) { setDir(); return { kind: 'blocked' }; }
      const r = roomStep(room, ex.pos, dir, ex.switches ?? []);
      to = r.pos; poison = r.poisonSteps; slid = r.path.length > 1; switched = r.switched;
    } else if (!isPassable(map, nx, ny)) {
      setDir();
      return { kind: 'blocked' };
    }
    let encounter: EnemySpec[] | null = null;
    this.update((s) => {
      const e = s.expedition!;
      e.pos = to;
      e.dir = dir;
      e.stepsSinceBattle += 1;
      if (switched.length) e.switches = [...(e.switches ?? []), ...switched];
      // 毒の床：最大HP の 割合ずつ へる（たおれは しない）
      if (poison) s.monsters = s.monsters.map((m) => (s.partyIds.includes(m.id) && m.hp > 0 ? { ...m, hp: Math.max(1, m.hp - Math.max(1, Math.floor(m.stats.hp * BALANCE.dungeon.poisonFloorRate)) * poison) } : m));
    });
    const tt = tileAt(map, to.x, to.y);
    const lastFloor = this.floor!.index === this.floor!.area.floors.length - 1;
    if (tt === '>' && lastFloor) return { kind: 'stageClear' };
    if (tt === '>') return { kind: 'stairs' };
    if (tt === 'E') return { kind: 'exit' };
    const e = this.state.expedition!;
    // ボスの へやには やせいの てきは でない
    if (!this.floor!.floor.bossId && this.rng.next() < encounterChance(e.stepsSinceBattle)) {
      encounter = rollEncounter(this.floor!.floor.encounterTableId, this.rng, e.lastLead);
      this.update((s) => {
        s.expedition!.stepsSinceBattle = 0;
        s.expedition!.lastLead = encounter![0].speciesId;
      });
    }
    return { kind: 'moved', encounter, poison, slid };
  }
  /** ボスの いない ステージを さいごまで すすんだ：ステージクリアして 町へ もどる */
  finishStage(): Unlocked | null {
    const ex = this.state.expedition;
    const stageId = ex ? getArea(ex.areaId).stageId : undefined;
    if (!ex || !stageId) return null;
    const before = this.chapters.features;
    const r = this.clearStage(stageId);
    this.queueStory(this.runStory({ kind: 'clearStage', target: stageId }));
    this.noteUnlocked(before);
    this.update((s) => (s.expedition = null));
    this.autosave();
    return r.ok ? r.value : null;
  }
  private openChest(pos: Pos): MoveResult {
    const ex = this.state.expedition!;
    const key = `${ex.floorIndex}:${pos.x},${pos.y}`;
    if (ex.openedChests.includes(key)) return { kind: 'chest', reward: null, pos };
    const reward = weightedPick(this.rng, this.floor!.floor.chestTable);
    this.update((s) => {
      s.expedition!.openedChests.push(key);
      this.applyReward(s, reward);
    });
    return { kind: 'chest', reward, pos };
  }
  private useSpring(): MoveResult {
    if (this.state.expedition!.springUsed) return { kind: 'spring', used: true };
    this.update((s) => {
      s.expedition!.springUsed = true;
      s.monsters = s.monsters.map((m) => (s.partyIds.includes(m.id) ? { ...m, hp: m.stats.hp, mp: m.stats.mp } : m));
    });
    this.autosave();
    return { kind: 'spring', used: false };
  }
  /** 次のフロアへ */
  descend(): boolean {
    const ex = this.state.expedition;
    if (!ex) return false;
    const area = getArea(ex.areaId);
    if (ex.floorIndex + 1 >= area.floors.length) return false;
    const map = floorMap(ex.areaId, ex.floorIndex + 1, ex.mapSeed);
    this.update((s) => {
      s.expedition = { ...s.expedition!, floorIndex: ex.floorIndex + 1, pos: findTile(map, 'S')!, dir: 'down', springUsed: false, stepsSinceBattle: 0, switches: [] };
    });
    const stageId = area.stageId;
    if (stageId) this.queueStory(this.runStory({ kind: 'floor', target: stageId, floor: ex.floorIndex + 2 }));
    if (BALANCE.dungeon.autosaveAtFloorChange) this.autosave();
    return true;
  }
  isOpened(pos: Pos) {
    const ex = this.state.expedition;
    return !!ex && ex.openedChests.includes(`${ex.floorIndex}:${pos.x},${pos.y}`);
  }

  private applyReward(s: SaveData, r: Reward) {
    if (r.type === 'gold') s.player.gold += r.amount;
    else if (r.type === 'item') s.inventory[r.itemId] = (s.inventory[r.itemId] ?? 0) + r.count;
    else s.capacity += r.amount;
  }

  // ---------------------------------------------------------------- 戦闘
  private beginBattle(kind: BattleState['kind'], enemies: EnemySpec[], context: BattleContext) {
    // そうび（アクセサリ）の こうかを かさねて 戦闘に はいる
    const st = createBattle(kind, this.party.map((m) => withEquipment(m, this.equipOf(m.id))), enemies, this.state.player.tactic);
    const firstSeen = [...new Set(enemies.map((e) => e.speciesId))].filter((id) => !this.state.discoveredSpeciesIds.includes(id));
    const firstBoss = context.kind === 'boss' && !this.state.progress.defeatedBossIds.includes(context.bossId);
    this.update((s) => {
      for (const e of enemies) s.discoveredSpeciesIds = addUnique(s.discoveredSpeciesIds, e.speciesId);
    });
    this.battle = { state: st, context, firstSeen, firstBoss };
    return this.battle;
  }
  startWildBattle(enemies: EnemySpec[]) {
    return this.beginBattle('wild', enemies, { kind: 'wild' });
  }
  startBossBattle(bossId: string) {
    return this.beginBattle('boss', BOSSES[bossId].enemies, { kind: 'boss', bossId });
  }
  canEnterArena(rankId: string): Result<void> {
    if (!this.state.progress.unlockedArenaRanks.includes(rankId)) return err('まだ さんか できません。');
    if (!this.party.some((m) => m.hp > 0)) return err('うごける モンスターが いません。');
    return ok(undefined);
  }
  startArenaBattle(rankId: string, index: number) {
    const rank = getArenaRank(rankId);
    const b = rank.battles[index];
    const sess = this.beginBattle('arena', b.enemies.map((e) => ({ ...e, recruitable: false })), { kind: 'arena', rankId, index });
    if (b.tactic) sess.state.enemyTactic = b.tactic;
    return sess;
  }

  /** 戦闘で使える道具か（持っているか）を確認してから 1 ターン進める */
  battleTurn(input: TurnInput): Result<TurnResult> {
    const b = this.battle;
    if (!b) return err('せんとう ちゅうでは ありません。');
    if (input.player.kind === 'item') {
      const it = getItem(input.player.itemId);
      if (!b.state.canUseItems) return err('ここでは どうぐを つかえません。');
      if (!it.battle || (this.state.inventory[it.id] ?? 0) <= 0) return err('その どうぐは つかえません。');
      if (it.category === 'meat' && !b.state.canRecruit) return err('ここでは にくを なげられません。');
    }
    const r = resolveTurn(b.state, input, this.rng);
    this.battle = { ...b, state: r.state };
    if (Object.keys(r.itemsUsed).length)
      this.update((s) => {
        for (const [id, n] of Object.entries(r.itemsUsed)) {
          s.inventory[id] = Math.max(0, (s.inventory[id] ?? 0) - n);
          if (!s.inventory[id]) delete s.inventory[id];
        }
      });
    return ok(r);
  }

  /** 戦闘を終わらせて結果を反映する（HP・経験値・お金・なかま化・進行） */
  finishBattle(): BattleSummary {
    const b = this.battle!;
    const st = b.state;
    const outcome = st.outcome ?? 'escape';
    const summary: BattleSummary = { outcome, exp: 0, gold: 0, levelUps: [], recruit: null, recruitBlocked: false, goldLost: 0, boss: null, arena: null, unlocked: { areas: [], ranks: [] }, chapter: null };
    const s = structuredClone(this.state);
    // HP/MP を個体へ戻す
    for (const c of st.allies) {
      const m = s.monsters.find((x) => x.id === c.instanceId);
      if (m) Object.assign(m, { hp: c.hp, mp: c.mp });
    }
    if (outcome === 'win') {
      const r = battleRewards(st);
      summary.exp = r.exp;
      summary.gold = b.context.kind === 'arena' || b.context.kind === 'practice' ? 0 : r.gold;
      s.player.gold += summary.gold;
      for (const c of st.allies) {
        const m = s.monsters.find((x) => x.id === c.instanceId);
        if (!m || c.hp <= 0) continue;
        const g = gainExperience(m, expForMember(r, m.level), this.rng);
        const wild = Math.max(0, g.monster.wildness - BALANCE.recruitment.wildnessPerBattle - g.events.length * BALANCE.recruitment.wildnessPerLevel);
        Object.assign(m, g.monster, { wildness: wild });
        if (g.events.length) summary.levelUps.push({ monsterId: m.id, name: displayName(m), events: g.events });
      }
      if (b.context.kind === 'wild') {
        const avg = st.allies.reduce((a, c) => a + c.level, 0) / Math.max(1, st.allies.length);
        const joiner = rollRecruit(st, avg, this.rng);
        if (joiner) {
          if (s.monsters.length >= s.capacity) summary.recruitBlocked = true;
          else summary.recruit = { speciesId: joiner.speciesId, level: joiner.level, name: getSpecies(joiner.speciesId).name };
        }
      }
      if (b.context.kind === 'boss') {
        const boss = BOSSES[b.context.bossId];
        summary.boss = { bossId: boss.id, texts: boss.defeatText, story: boss.story ?? [], rewards: boss.rewards };
        if (!s.progress.defeatedBossIds.includes(boss.id)) {
          s.progress.defeatedBossIds.push(boss.id);
          for (const r2 of boss.rewards) this.applyReward(s, r2);
        } else s.player.gold += 50;
        for (const f of boss.setFlags) s.progress.storyFlags[f] = true;
        s.expedition = null;
      }
      if (b.context.kind === 'arena') {
        const rank = getArenaRank(b.context.rankId);
        const cleared = b.context.index + 1 >= rank.battles.length;
        summary.arena = { rankId: rank.id, index: b.context.index, cleared, rewards: cleared ? rank.rewards : [] };
        if (cleared) {
          const first = !s.progress.clearedArenaRanks.includes(rank.id);
          if (first) {
            s.progress.clearedArenaRanks.push(rank.id);
            for (const r2 of rank.rewards) this.applyReward(s, r2);
          } else {
            s.player.gold += Math.floor(((rank.rewards.find((x) => x.type === 'gold') as { amount: number } | undefined)?.amount ?? 100) / 4);
            summary.arena.rewards = [];
          }
          for (const f of rank.setFlags) s.progress.storyFlags[f] = true;
          this.recoverParty(s, 'full');
        } else this.recoverParty(s, rank.betweenBattleRecovery);
      }
    } else if (outcome === 'lose') {
      if (b.context.kind === 'arena' || b.context.kind === 'practice') {
        if (b.context.kind === 'arena') summary.arena = { rankId: b.context.rankId, index: b.context.index, cleared: false, rewards: [] };
      } else {
        summary.goldLost = Math.floor(s.player.gold * BALANCE.dungeon.defeatGoldLossRate);
        s.player.gold -= summary.goldLost;
        s.expedition = null;
      }
      // 全滅したら まちの いずみで 目をさます（図鑑や進行は失わない）
      this.recoverParty(s, 'full');
    }
    const u = refreshUnlocks(s.progress);
    s.progress = u.progress;
    summary.unlocked = { areas: u.newAreas, ranks: u.newRanks };
    s.storageIds = s.monsters.map((m) => m.id).filter((id) => !s.partyIds.includes(id));
    this.state = s;
    this.battle = null;
    // v2：ボスを たおしたら 物語（章の 決着）と ステージクリア
    if (outcome === 'win' && b.context.kind === 'boss') {
      const bossId = b.context.bossId;
      const before = this.chapters.features;
      const chapterBefore = this.chapters.chapter;
      this.queueStory(this.runStory({ kind: 'bossDefeated', target: bossId }));
      const area = AREAS.find((a) => a.floors.some((f) => f.bossId === bossId));
      if (area?.stageId && !this.chapters.clearedStages.includes(area.stageId)) this.clearStage(area.stageId);
      const added = this.chapters.features.filter((f) => !before.includes(f));
      this.noteUnlocked(before);
      if (added.length || this.chapters.chapter !== chapterBefore) summary.chapter = { features: added, towns: [], stages: [], chapter: this.chapters.chapter !== chapterBefore ? chapterBefore : undefined };
    }
    // 物語から はじまった 戦闘（なかま化の 練習）の あとも 物語の つづきを みせられるように
    this.autosave();
    return summary;
  }

  private recoverParty(s: SaveData, mode: 'none' | 'partial' | 'full') {
    if (mode === 'none') return;
    s.monsters = s.monsters.map((m) => {
      if (!s.partyIds.includes(m.id)) return m;
      if (mode === 'full') return { ...m, hp: m.stats.hp, mp: m.stats.mp };
      return { ...m, hp: Math.max(m.hp, Math.ceil(m.stats.hp * 0.4)), mp: Math.max(m.mp, Math.ceil(m.stats.mp * 0.3)) };
    });
  }

  /** なかまになりたそうなモンスターを迎える */
  acceptRecruit(speciesId: string, level: number): Result<MonsterInstance> {
    if (this.state.monsters.length >= this.state.capacity) return err('ぼくじょうが いっぱいです。');
    const m = createMonster(speciesId, this.rng, {
      level,
      wildness: BALANCE.recruitment.initialWildness,
      obtainedFrom: this.floor?.area.id ?? 'wild',
      existingIds: new Set(this.state.monsters.map((x) => x.id)),
    });
    this.update((s) => {
      s.monsters.push(m);
      if (s.partyIds.length < BALANCE.partySize) s.partyIds.push(m.id);
      s.ownedSpeciesIds = addUnique(s.ownedSpeciesIds, speciesId);
    });
    this.autosave();
    return ok(m);
  }

  // ---------------------------------------------------------------- 進行
  unlockedAreas() {
    return AREAS.map((a) => ({ area: a, open: this.state.progress.unlockedAreas.includes(a.id), conditionsMet: allMet(this.state.progress, a.unlockConditions) }));
  }
  recruitPreview(enemyKey: string): number {
    const b = this.battle;
    if (!b) return 0;
    const e = b.state.enemies.find((x) => x.key === enemyKey);
    if (!e) return 0;
    const avg = b.state.allies.reduce((a, c) => a + c.level, 0) / Math.max(1, b.state.allies.length);
    return recruitChance(e, avg);
  }
}

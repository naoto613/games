import { AREAS, BOSSES, getArea, getArenaRank } from '../data/areas';
import { BALANCE } from '../data/balance';
import { getItem, ITEM_LIST } from '../data/items';
import { getSpecies } from '../data/monsters';
import type { EnemySpec, Reward, Tactic } from '../data/types';
import { createRng, type Rng } from '../core/Random';
import { err, ok, type Result } from '../core/Result';
import { battleRewards, createBattle, expForMember, resolveTurn } from '../domain/battle/BattleEngine';
import type { BattleState, TurnInput, TurnResult } from '../domain/battle/types';
import { BREEDING_ERROR_TEXT, checkBreedable, executeBreeding, previewBreeding, type BreedingPreview } from '../domain/breeding/BreedingEngine';
import { DIRS, encounterChance, findTile, isPassable, loadMap, rollEncounter, tileAt, type Dir, type Pos, type TileMap } from '../domain/dungeon/DungeonEngine';
import { gainExperience, resolvePendingSkill, type LevelUpEvent } from '../domain/monster/Growth';
import { createMonster, displayName } from '../domain/monster/MonsterFactory';
import type { MonsterInstance } from '../domain/monster/types';
import { useFieldSkill as useFieldSkillDomain } from '../domain/monster/FieldSkills';
import { getSkill } from '../data/skills';
import { allMet, initialProgress, refreshUnlocks } from '../domain/progression/ProgressionEngine';
import { recruitChance, rollRecruit } from '../domain/recruitment/RecruitmentEngine';
import { weightedPick } from '../core/Random';
import { defaultSettings, GAME_VERSION, SCHEMA_VERSION, type SaveData } from './GameState';

export type BattleContext =
  | { kind: 'wild' }
  | { kind: 'boss'; bossId: string }
  | { kind: 'arena'; rankId: string; index: number };

export type BattleSession = { state: BattleState; context: BattleContext };

export type LevelUpReport = { monsterId: string; name: string; events: LevelUpEvent[] };
export type BattleSummary = {
  outcome: 'win' | 'lose' | 'escape';
  exp: number;
  gold: number;
  levelUps: LevelUpReport[];
  recruit: { speciesId: string; level: number; name: string } | null;
  recruitBlocked: boolean;
  goldLost: number;
  boss: { bossId: string; texts: string[]; rewards: Reward[] } | null;
  arena: { rankId: string; index: number; cleared: boolean; rewards: Reward[] } | null;
  unlocked: { areas: string[]; ranks: string[] };
};

export type MoveResult =
  | { kind: 'blocked' }
  | { kind: 'moved'; encounter: EnemySpec[] | null }
  | { kind: 'stairs' }
  | { kind: 'exit' }
  | { kind: 'chest'; reward: Reward | null; pos: Pos }
  | { kind: 'spring'; used: boolean }
  | { kind: 'boss'; bossId: string }
  | { kind: 'npc'; id: string };

export interface SaveSink {
  save(data: SaveData): Promise<void>;
}

/** 店に並ぶ品物（進行で増える） */
export function shopItems(s: SaveData): string[] {
  const list = ['herb', 'curegrass', 'jerky', 'returnwing', 'bonemeat', 'mpdrop'];
  if (s.progress.defeatedBossIds.includes('boss_forest')) list.push('bigherb', 'lifeleaf');
  if (s.progress.defeatedBossIds.includes('boss_cave')) list.push('primemeat');
  return ITEM_LIST.filter((i) => list.includes(i.id)).map((i) => i.id);
}

export function newGameState(name: string, rng: Rng, now = Date.now()): SaveData {
  const ids = new Set<string>();
  const a = createMonster('lumipon', rng, { level: 3, sex: 'B', obtainedFrom: 'gift', existingIds: ids, now });
  ids.add(a.id);
  const b = createMonster('kogemaru', rng, { level: 3, sex: 'A', obtainedFrom: 'gift', existingIds: ids, now });
  const town = loadMap('town');
  return {
    schemaVersion: SCHEMA_VERSION,
    gameVersion: GAME_VERSION,
    savedAt: now,
    player: { name, gold: 120, tactic: 'attack', playTimeSec: 0, townPos: findTile(town, 'P')!, townDir: 'up' },
    monsters: [a, b],
    partyIds: [a.id, b.id],
    storageIds: [],
    capacity: BALANCE.storageCapacityStart,
    inventory: { herb: 5, jerky: 3, returnwing: 2 },
    progress: initialProgress(),
    discoveredSpeciesIds: ['lumipon', 'kogemaru'],
    ownedSpeciesIds: ['lumipon', 'kogemaru'],
    breedingHistory: [],
    expedition: null,
    settings: defaultSettings(),
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
  }

  // ---------------------------------------------------------------- 保存
  /** 保存（直列化して、同時に二重保存しない）。失敗は lastSaveError に残し、呼び出し側に伝える。 */
  save(): Promise<void> {
    const snapshot: SaveData = structuredClone({ ...this.state, savedAt: Date.now(), storageIds: this.storageIds() });
    this.saving = this.saving.catch(() => {}).then(async () => {
      if (!this.sink) return;
      try {
        await this.sink.save(snapshot);
        this.lastSaveError = null;
      } catch (e) {
        this.lastSaveError = e;
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
    const map = loadMap('town');
    const { townPos } = this.state.player;
    const [dx, dy] = DIRS[dir];
    const nx = townPos.x + dx, ny = townPos.y + dy;
    const t = tileAt(map, nx, ny);
    if (/[0-9]|F|G/.test(t)) {
      this.setTownPos(townPos, dir);
      return { kind: 'npc', id: t };
    }
    if (!isPassable(map, nx, ny)) {
      this.setTownPos(townPos, dir);
      return { kind: 'blocked' };
    }
    this.setTownPos({ x: nx, y: ny }, dir);
    return { kind: 'moved', encounter: null };
  }

  // ---------------------------------------------------------------- 配合
  breedingWorld() {
    return { monsters: this.state.monsters, partyIds: this.state.partyIds, capacity: this.state.capacity, flags: this.flags };
  }
  breedCheck(aId: string, bId: string): Result<BreedingPreview> {
    const c = checkBreedable(this.breedingWorld(), aId, bId);
    if (!c.ok) return err(BREEDING_ERROR_TEXT[c.error]);
    return ok(previewBreeding(c.value.a, c.value.b, this.flags));
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
    this.autosave();
    return ok(child);
  }

  // ---------------------------------------------------------------- 探索
  canStartExpedition(areaId: string): Result<void> {
    if (!this.state.progress.unlockedAreas.includes(areaId)) return err('まだ その とびらは ひらいていない。');
    if (!this.party.some((m) => m.hp > 0)) return err('うごける モンスターが いません。いずみで かいふくしましょう。');
    return ok(undefined);
  }
  startExpedition(areaId: string): Result<void> {
    const c = this.canStartExpedition(areaId);
    if (!c.ok) return c;
    const area = getArea(areaId);
    const map = loadMap(area.floors[0].mapTemplateId);
    this.update((s) => (s.expedition = { areaId, floorIndex: 0, pos: findTile(map, 'S')!, dir: 'down', openedChests: [], springUsed: false, stepsSinceBattle: 0 }));
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
    const f = this.floor;
    return f ? loadMap(f.floor.mapTemplateId) : null;
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
    if (!isPassable(map, nx, ny)) {
      setDir();
      return { kind: 'blocked' };
    }
    let encounter: EnemySpec[] | null = null;
    this.update((s) => {
      const e = s.expedition!;
      e.pos = { x: nx, y: ny };
      e.dir = dir;
      e.stepsSinceBattle += 1;
    });
    if (t === '>') return { kind: 'stairs' };
    if (t === 'E') return { kind: 'exit' };
    const e = this.state.expedition!;
    if (this.rng.next() < encounterChance(e.stepsSinceBattle)) {
      encounter = rollEncounter(this.floor!.floor.encounterTableId, this.rng, e.lastLead);
      this.update((s) => {
        s.expedition!.stepsSinceBattle = 0;
        s.expedition!.lastLead = encounter![0].speciesId;
      });
    }
    return { kind: 'moved', encounter };
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
    const map = loadMap(area.floors[ex.floorIndex + 1].mapTemplateId);
    this.update((s) => {
      s.expedition = { ...s.expedition!, floorIndex: ex.floorIndex + 1, pos: findTile(map, 'S')!, dir: 'down', springUsed: false, stepsSinceBattle: 0 };
    });
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
    const st = createBattle(kind, this.party, enemies, this.state.player.tactic);
    this.update((s) => {
      for (const e of enemies) s.discoveredSpeciesIds = addUnique(s.discoveredSpeciesIds, e.speciesId);
    });
    this.battle = { state: st, context };
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
    const summary: BattleSummary = { outcome, exp: 0, gold: 0, levelUps: [], recruit: null, recruitBlocked: false, goldLost: 0, boss: null, arena: null, unlocked: { areas: [], ranks: [] } };
    const s = structuredClone(this.state);
    // HP/MP を個体へ戻す
    for (const c of st.allies) {
      const m = s.monsters.find((x) => x.id === c.instanceId);
      if (m) Object.assign(m, { hp: c.hp, mp: c.mp });
    }
    if (outcome === 'win') {
      const r = battleRewards(st);
      summary.exp = r.exp;
      summary.gold = b.context.kind === 'arena' ? 0 : r.gold;
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
        summary.boss = { bossId: boss.id, texts: boss.defeatText, rewards: boss.rewards };
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
      if (b.context.kind === 'arena') {
        summary.arena = { rankId: b.context.rankId, index: b.context.index, cleared: false, rewards: [] };
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

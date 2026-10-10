import { describe, expect, it } from 'vitest';
import { createRng } from '../../src/core/Random';
import { Game, newGameState } from '../../src/application/Game';
import { MemorySaveRepository } from '../../src/infrastructure/save/SaveRepository';
import { createMonster } from '../../src/domain/monster/MonsterFactory';
import { findTile } from '../../src/domain/dungeon/DungeonEngine';
import type { Dir } from '../../src/domain/dungeon/DungeonEngine';

function fight(g: Game, meat?: string) {
  for (let i = 0; i < 60 && !g.battle!.state.outcome; i++) {
    const enemy = g.battle!.state.enemies.find((e) => e.hp > 0);
    const useMeat = meat && i === 0 && (g.state.inventory[meat] ?? 0) > 0 && enemy;
    const r = g.battleTurn({ mode: 'auto', player: useMeat ? { kind: 'item', itemId: meat!, target: enemy!.key } : { kind: 'none' } });
    if (!r.ok) throw new Error(r.error);
  }
  return g.finishBattle();
}

/** BFS で目的のタイルの隣まで歩く */
function walkTo(g: Game, target: string): ReturnType<Game['move']> | null {
  const map = g.currentMap()!;
  const goal = findTile(map, target)!;
  for (let guard = 0; guard < 400; guard++) {
    const ex = g.state.expedition!;
    const prev = new Map<string, Dir | null>([[`${ex.pos.x},${ex.pos.y}`, null]]);
    const q = [ex.pos];
    let first: Dir | null = null;
    outer: while (q.length) {
      const p = q.shift()!;
      for (const [d, [dx, dy]] of Object.entries({ up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }) as [Dir, [number, number]][]) {
        const x = p.x + dx, y = p.y + dy, k = `${x},${y}`;
        if (prev.has(k)) continue;
        const ch = map.tiles[y]?.[x];
        if (x === goal.x && y === goal.y) {
          // 経路を逆にたどって最初の一歩を求める
          let cur = `${p.x},${p.y}`, dir: Dir = d;
          while (prev.get(cur)) {
            dir = prev.get(cur)!;
            const [ddx, ddy] = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
            const [cx, cy] = cur.split(',').map(Number);
            cur = `${cx - ddx},${cy - ddy}`;
          }
          first = dir;
          break outer;
        }
        if (!ch || '#~CHBT'.includes(ch)) continue;
        prev.set(k, d);
        q.push({ x, y });
      }
    }
    if (!first) return null;
    const r = g.move(first);
    if (r.kind === 'moved' && r.encounter) {
      g.startWildBattle(r.encounter);
      const s = fight(g, 'jerky');
      if (s.outcome === 'lose') return { kind: 'blocked' };
      g.healAll(); // フローの確認が目的なので、戦闘ごとに回復しておく
      if (s.recruit) g.acceptRecruit(s.recruit.speciesId, s.recruit.level);
      continue;
    }
    if (r.kind !== 'moved') return r;
  }
  return null;
}

describe('ゲームループ（探索→戦闘→仲間化→配合→保存→再開）', () => {
  it('一連の流れが成立する', async () => {
    const repo = new MemorySaveRepository();
    const g = new Game(newGameState('テスト', createRng(1), 0), { rng: createRng(2), sink: repo });
    expect(g.startExpedition('forest').ok).toBe(true);
    // 1F → 2F → 3F → ボス
    for (let f = 0; f < 2; f++) {
      const r = walkTo(g, '>');
      expect(r?.kind, `floor ${f}`).toBe('stairs');
      g.descend();
    }
    // ボスの前にパーティを全回復（テストを安定させるため）
    g.healAll();
    const br = walkTo(g, 'B');
    expect(br?.kind).toBe('boss');
    g.startBossBattle('boss_forest');
    const sum = fight(g);
    expect(['win', 'lose']).toContain(sum.outcome);
    await g.save();
    // 再開
    const loaded = await repo.load();
    expect(loaded.kind).toBe('ok');
    if (loaded.kind !== 'ok') return;
    const g2 = new Game(loaded.data, { rng: createRng(3), sink: repo });
    expect(g2.state.monsters).toEqual(g.state.monsters);
    expect(g2.state.inventory).toEqual(g.state.inventory);
    expect(g2.state.progress).toEqual(g.state.progress);
  });

  it('配合プレビュー → 確定 → 子が戦闘に出られる → 保存して再開', async () => {
    const repo = new MemorySaveRepository();
    const s = newGameState('テスト', createRng(1), 0);
    const g = new Game(s, { rng: createRng(5), sink: repo });
    const a = createMonster('kogemaru', createRng(10), { level: 12, sex: 'A' });
    const b = createMonster('yorufukuro', createRng(11), { level: 12, sex: 'B' });
    g.state.monsters.push(a, b);
    expect(g.setParty([a.id, b.id]).ok).toBe(true);
    const pv = g.breedCheck(a.id, b.id);
    if (!pv.ok) throw new Error(pv.error);
    expect(pv.value.speciesId).toBe('homurawolf');
    const r = g.breed(a.id, b.id, pv.value.skills.recommended);
    if (!r.ok) throw new Error(r.error);
    expect(g.state.partyIds).toEqual([r.value.id]);
    expect(g.monster(a.id)).toBeUndefined();
    expect(g.state.ownedSpeciesIds).toContain('homurawolf');
    g.startExpedition('forest');
    g.startWildBattle([{ speciesId: 'mossglow', level: 1 }]);
    expect(g.battle!.state.allies[0].speciesId).toBe('homurawolf');
    fight(g);
    await g.save();
    const l = await repo.load();
    expect(l.kind === 'ok' && l.data.monsters.find((m) => m.id === r.value.id)?.speciesId).toBe('homurawolf');
  });

  it('保存に失敗してもエラーを握りつぶさず、状態は壊れない', async () => {
    const repo = new MemorySaveRepository();
    const g = new Game(newGameState('テスト', createRng(1), 0), { rng: createRng(2), sink: repo });
    repo.failNext = true;
    await expect(g.save()).rejects.toThrow();
    expect(g.lastSaveError).toBeTruthy();
    await g.save();
    expect(g.lastSaveError).toBeNull();
  });

  it('未来のバージョンのセーブは読み込まず、上書きしない', async () => {
    const repo = new MemorySaveRepository();
    repo.data = { ...newGameState('x', createRng(1), 0), schemaVersion: 99 };
    const l = await repo.load();
    expect(l.kind).toBe('error');
    if (l.kind === 'error') expect(l.error).toBe('future');
  });

  it('全滅するとお金を一部失って町へ。図鑑・進行は残る', () => {
    const g = new Game(newGameState('テスト', createRng(1), 0), { rng: createRng(2) });
    g.startExpedition('forest');
    g.state.discoveredSpeciesIds.push('madoidake');
    g.startWildBattle([{ speciesId: 'homurawolf', level: 30 }, { speciesId: 'homurawolf', level: 30 }]);
    const s = fight(g);
    expect(s.outcome).toBe('lose');
    expect(s.goldLost).toBe(60);
    expect(g.state.player.gold).toBe(60);
    expect(g.state.expedition).toBeNull();
    expect(g.state.discoveredSpeciesIds).toContain('madoidake');
    expect(g.party.every((m) => m.hp === m.stats.hp)).toBe(true);
  });

  it('闘技場: 突破で報酬と次の解放', () => {
    const g = new Game(newGameState('テスト', createRng(1), 0), { rng: createRng(2) });
    g.state.progress.defeatedBossIds.push('boss_forest');
    g.state.progress.unlockedArenaRanks.push('arenaF');
    const strong = [0, 1, 2].map((i) => createMonster('homurawolf', createRng(50 + i), { level: 25, plusValue: 4 }));
    g.state.monsters.push(...strong);
    g.setParty(strong.map((m) => m.id));
    for (let i = 0; i < 3; i++) {
      g.startArenaBattle('arenaF', i);
      const s = fight(g);
      expect(s.outcome).toBe('win');
      expect(s.arena?.cleared).toBe(i === 2);
    }
    expect(g.state.progress.clearedArenaRanks).toContain('arenaF');
    expect(g.state.inventory.bonemeat).toBe(2);
  });
});

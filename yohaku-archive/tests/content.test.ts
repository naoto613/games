import { describe, expect, it } from 'vitest';
import { PUZZLES } from '../src/data/puzzles';
import { MAPS, MAP_MAP, WALKABLE, type MapDef } from '../src/data/maps';
import { RECORD_MAP } from '../src/data/records';
import { BATTLE_MAP, ENEMIES } from '../src/data/enemies';
import { ITEM_MAP, SHOP_STOCK } from '../src/data/items';
import { QUEST_MAP } from '../src/data/quests';
import { PUZZLE_MAP } from '../src/data/puzzles';
import type { Cmd, Talk } from '../src/data/script';
import {
  applyOp, availableOps, emptyEdit, evaluate, metOutcomes, opCost, validateGraph, type GraphDef, type GraphEdit, type Op,
} from '../src/engine/causal';

/** 余白 budget 以内・矛盾許容量 tol 以内で到達できる結末を幅優先で探す */
function reachable(g: GraphDef, budget: number, tol: number, extra?: (t: string) => boolean | undefined) {
  const found = new Map<string, number>();
  const seen = new Set<string>();
  const key = (e: GraphEdit) => JSON.stringify([g.links.map(l => (e.links[l.id] ?? l.state) === 'intact'), e.inverted, e.held]);
  const queue: { e: GraphEdit; spent: number }[] = [{ e: emptyEdit(), spent: 0 }];
  while (queue.length) {
    const { e, spent } = queue.shift()!;
    const k = key(e);
    if (seen.has(k)) continue;
    seen.add(k);
    for (const o of metOutcomes(g, e, extra)) if (!found.has(o.id) || found.get(o.id)! > spent) found.set(o.id, spent);
    const before = evaluate(g, e).contras.length;
    const targets = [...g.links.map(l => ({ kind: 'link' as const, id: l.id })), ...g.nodes.map(n => ({ kind: 'node' as const, id: n.id }))];
    for (const t of targets) {
      for (const op of availableOps(g, e, t) as Op[]) {
        const c = opCost(g, t, op, { costDown: 0 });
        if (spent + c > budget) continue;
        const next = applyOp(g, e, t, op);
        const after = evaluate(g, next).contras.length;
        if (after > Math.max(tol + (g.tolerance ?? 0), before)) continue;
        queue.push({ e: next, spent: spent + c });
      }
    }
  }
  return found;
}

describe('因果パズルのデータ', () => {
  it('参照切れがない', () => {
    for (const g of PUZZLES) expect(validateGraph(g)).toEqual([]);
  });

  it('記録IDがすべて存在する', () => {
    for (const g of PUZZLES) {
      for (const n of g.nodes) for (const r of n.requires ?? []) expect(RECORD_MAP.has(r), `${g.id}/${n.id}:${r}`).toBe(true);
      for (const l of g.links) for (const r of l.requires ?? []) expect(RECORD_MAP.has(r), `${g.id}/${l.id}:${r}`).toBe(true);
    }
  });

  it('どの結末も、想定の余白と矛盾許容量で到達できる', () => {
    const budgets: Record<string, number> = { p_mother: 3, p_town: 0, p_gate: 4, p_gear: 4, p_vault: 3, p_bridge: 6, p_florist: 3, p_morning: 7 };
    for (const g of PUZZLES) {
      const found = reachable(g, budgets[g.id] ?? 6, 1, t => (t.startsWith('w:') ? true : undefined));
      for (const o of g.outcomes ?? []) expect(found.has(o.id), `${g.id} の ${o.id}`).toBe(true);
    }
  });

  it('複数の解き方があるパズルでは、結末ごとに費用が異なる', () => {
    const gate = reachable(PUZZLE_MAP.get('p_gate')!, 6, 1);
    expect(gate.get('o_dran')).toBe(1);
    expect(gate.get('o_smoke')).toBe(2);
    expect(gate.get('o_force')).toBe(3);
  });

  it('保留は順番が大事（先に南を繋ぐと開かない）', () => {
    const g = PUZZLE_MAP.get('p_vault')!;
    let e = applyOp(g, emptyEdit(), { kind: 'link', id: 'v2' }, 'connect');
    e = applyOp(g, e, { kind: 'node', id: 'north' }, 'hold');
    expect(evaluate(g, e).active.has('open')).toBe(false);
    let f = applyOp(g, emptyEdit(), { kind: 'node', id: 'north' }, 'hold');
    f = applyOp(g, f, { kind: 'link', id: 'v2' }, 'connect');
    expect(evaluate(g, f).active.has('open')).toBe(true);
  });

  it('隠し結末（合図）は世界の方針が条件', () => {
    const g = PUZZLE_MAP.get('p_morning')!;
    const no = reachable(g, 7, 1, t => (t.startsWith('w:') ? false : undefined));
    expect(no.has('o_share')).toBe(false);
    expect(no.has('o_bell')).toBe(true);
  });
});

function walk(cmds: Cmd[], f: (c: Cmd) => void) {
  for (const c of cmds) {
    f(c);
    if (c.t === 'choice') c.opts.forEach(o => walk(o.ev, f));
    if (c.t === 'if') { walk(c.then, f); walk(c.else ?? [], f); }
    if (c.t === 'puzzle') { Object.values(c.out).forEach(v => walk(v, f)); walk(c.cancel ?? [], f); }
    if (c.t === 'battle') { walk(c.win ?? [], f); walk(c.lose ?? [], f); walk(c.escape ?? [], f); }
  }
}

function allTalks(m: MapDef): Talk[] {
  return [...m.npcs.flatMap(n => n.talk), ...m.objs.flatMap(o => o.talk ?? []), ...(m.onEnter ?? [])];
}

describe('区域とイベントのデータ', () => {
  it('地形の行の長さがそろっている', () => {
    for (const m of MAPS) {
      const w = m.tiles[0].length;
      for (const r of m.tiles) expect(r.length, m.id).toBe(w);
    }
  });

  it('出入口の行き先が存在し、歩ける場所に着く', () => {
    for (const m of MAPS) {
      for (const w of m.warps) {
        if (!w.to) continue;
        const t = MAP_MAP.get(w.to);
        expect(t, `${m.id}→${w.to}`).toBeDefined();
        const ch = t!.tiles[w.ty]?.[w.tx];
        expect(WALKABLE.has(ch) || ch === 'G', `${m.id}→${w.to} (${w.tx},${w.ty}) '${ch}'`).toBe(true);
      }
    }
  });

  it('人物と調査対象が区域の内側にいる', () => {
    for (const m of MAPS) {
      const h = m.tiles.length, w = m.tiles[0].length;
      for (const p of [...m.npcs, ...m.objs]) {
        expect(p.x >= 0 && p.x < w && p.y >= 0 && p.y < h, `${m.id}/${p.id}`).toBe(true);
      }
      for (const n of m.npcs) expect(WALKABLE.has(m.tiles[n.y][n.x]), `${m.id}/${n.id} の足元`).toBe(true);
    }
  });

  it('すべての出入口と人物に、到着地点から歩いて行ける（地形の変化をすべて反映した状態）', () => {
    for (const m of MAPS) {
      const t = m.tiles.map(r => r.split(''));
      for (const p of m.patches ?? []) for (const [x, y, ch] of p.tiles) t[y][x] = ch;
      const arrivals = MAPS.flatMap(o => o.warps.filter(w => w.to === m.id).map(w => [w.tx, w.ty]));
      if (m.id === 'archive') arrivals.push([9, 4]);
      const seen = new Set<string>();
      const q = [...arrivals];
      while (q.length) {
        const [x, y] = q.shift()!;
        const k = `${x},${y}`;
        if (seen.has(k)) continue;
        if (!t[y] || !(WALKABLE.has(t[y][x]))) continue;
        seen.add(k);
        q.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
      }
      const near = (x: number, y: number) => [[x, y], [x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1], [x, y + 2], [x, y - 2]].some(([a, b]) => seen.has(`${a},${b}`));
      for (const w of m.warps) if (w.to) expect(near(w.x, w.y), `${m.id} 出入口 (${w.x},${w.y})`).toBe(true);
      for (const p of [...m.npcs, ...m.objs]) expect(near(p.x, p.y), `${m.id}/${p.id}`).toBe(true);
    }
  });

  it('スクリプトの参照（記録・戦闘・パズル・アイテム・クエスト）が正しい', () => {
    for (const m of MAPS) {
      for (const tk of allTalks(m)) walk(tk.ev, c => {
        if (c.t === 'rec') expect(RECORD_MAP.has(c.id), c.id).toBe(true);
        if (c.t === 'battle') expect(BATTLE_MAP.has(c.id), c.id).toBe(true);
        if (c.t === 'item') expect(ITEM_MAP.has(c.id), c.id).toBe(true);
        if (c.t === 'quest') { expect(QUEST_MAP.has(c.id), c.id).toBe(true); expect(QUEST_MAP.get(c.id)!.stages[c.stage], `${c.id}:${c.stage}`).toBeDefined(); }
        if (c.t === 'shop') expect(SHOP_STOCK[c.id], c.id).toBeDefined();
        if (c.t === 'warp') expect(MAP_MAP.has(c.map), c.map).toBe(true);
        if (c.t === 'puzzle') {
          const g = PUZZLE_MAP.get(c.id);
          expect(g, c.id).toBeDefined();
          for (const o of g!.outcomes ?? []) expect(c.out[o.id], `${c.id} の結末 ${o.id} に処理がない`).toBeDefined();
        }
      });
      for (const o of m.objs) {
        if (o.battle) expect(BATTLE_MAP.has(o.battle), o.battle).toBe(true);
        if (o.item && !o.item.startsWith('gold')) expect(ITEM_MAP.has(o.item), o.item).toBe(true);
      }
    }
  });

  it('敵の因果グラフに参照切れがない', () => {
    for (const e of ENEMIES) {
      const g: GraphDef = {
        id: e.id, title: e.name,
        nodes: [...e.nodes, { id: 'p.atk', label: '', x: 0, y: 0 }],
        links: e.links,
      };
      expect(validateGraph(g)).toEqual([]);
      for (const it of e.intents) if (it.node) expect(e.nodes.some(n => n.id === it.node), `${e.id}/${it.id}`).toBe(true);
      expect(e.intents[e.intents.length - 1].node, `${e.id} の最後の行動は無条件`).toBeUndefined();
    }
    for (const b of BATTLE_MAP.values()) for (const id of b.enemies) expect(ENEMIES.some(e => e.id === id), id).toBe(true);
  });
});

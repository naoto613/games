// 固有イベントの ルール（発生しているか・マップへの はんえい）。画面や保存には よらない 純粋な ロジック。
import type { EventDef } from '../../data/events';
import { EVENT_BY_ID } from '../../data/events';
import type { TileMap } from '../dungeon/DungeonEngine';

export type EventState = { flags: Record<string, boolean>; owned: string[]; done: string[] };

/** いま その イベントが 起こせる（見えている）か */
export function eventAvailable(def: EventDef, st: EventState): boolean {
  if (def.requires?.some((f) => !st.flags[f])) return false;
  if (def.hiddenWhen?.some((f) => st.flags[f])) return false;
  if (def.notOwned && st.owned.includes(def.notOwned)) return false;
  if (def.kind === 'nest') return !st.done.includes(def.id); // にげても この たびでは もう でない。つぎの たびで また あえる
  if (def.kind === 'hidden') return true; // とびらは ほうもつこを とるまで ある
  return !st.flags[`ev_${def.id}`]; // いちどきり（story / trail / vault）
}

/** マップに イベントの ようすを かさねる（おわった もの・まだ 出ない ものは ふつうの ゆか／かべに もどす） */
export function overlayEvents(map: TileMap, st: EventState): TileMap {
  const ev = map.events;
  if (!ev || !Object.keys(ev).length) return map;
  const tiles = map.tiles.map((r) => r.slice());
  for (const [pos, id] of Object.entries(ev)) {
    const def = EVENT_BY_ID[id];
    const [x, y] = pos.split(',').map(Number);
    if (!def) { tiles[y][x] = tiles[y][x] === 'Z' ? '#' : '.'; continue; }
    if (def.kind === 'hidden') {
      if (st.done.includes(id)) tiles[y][x] = '.'; // ひらいた とびら（ひらいた あとは ずっと とおれる）
      else if (!eventAvailable(def, st)) tiles[y][x] = '#';
      continue;
    }
    if (!eventAvailable(def, st)) tiles[y][x] = '.';
  }
  return { ...map, tiles };
}

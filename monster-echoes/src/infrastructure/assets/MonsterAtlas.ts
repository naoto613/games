// モンスター200体の ドット絵アトラス（assets/monsters/atlas.png・atlas.json）を 起動時に 読みこむ。
// 読みこめなかった ときは null の まま（よびだしがわで かわりの 絵を だす）。

export type AtlasCell = { x: number; y: number; size: number; foot: number; bbox: [number, number, number, number]; large: boolean };
type AtlasJson = { image: string; width: number; height: number; cells: Record<string, AtlasCell> };

let image: HTMLImageElement | null = null;
let cells: Record<string, AtlasCell> = {};
let loading: Promise<boolean> | null = null;

/** アトラスを 読みこむ（2回目からは おなじ Promise を かえす） */
export function loadMonsterAtlas(base = 'assets/monsters/'): Promise<boolean> {
  if (loading) return loading;
  loading = (async () => {
    try {
      const res = await fetch(base + 'atlas.json');
      if (!res.ok) return false;
      const json = (await res.json()) as AtlasJson;
      const img = new Image();
      img.src = base + json.image;
      await img.decode();
      image = img;
      cells = json.cells;
      return true;
    } catch {
      return false;
    }
  })();
  return loading;
}

export const atlasReady = () => !!image;
export const atlasCell = (id: string): AtlasCell | undefined => cells[id];
export const atlasImage = () => image;
/** テスト用: 読みこみ状態を もどす */
export function resetMonsterAtlas() { image = null; cells = {}; loading = null; }

// ダンジョンの 描画（参考画像3「ダンジョンの画面（しずくのどうくつ）」の 描き方）。
// 地面（草・しげみ・石の ゆか・水）を 1枚の 絵に まとめ、手前の かべは 1つずつ 物体（木・岩の がけ・水晶・滝）として
// 人と 奥行きじゅんに かさねる。森（forest）と 洞窟（cave）に 対応。
import type { TileMap } from '../../domain/dungeon/DungeonEngine';
import type { Gimmick } from '../../domain/dungeon/RoomGen';
import { dirt, grass, hash, TT, water } from './townArt';
import { mkCanvas } from './Pix';

type G = CanvasRenderingContext2D;
export const isWallCh = (ch: string) => ch === '#' || ch === 'T' || ch === 'Z';

const groundCache = new WeakMap<TileMap, HTMLCanvasElement[]>();
const bossCache = new WeakMap<TileMap, HTMLCanvasElement[]>();
/** 地面の 層（水が うごくので 4まい） */
export type ArtTheme = 'forest' | 'cave' | 'highland' | 'tower';
export type RockTheme = Exclude<ArtTheme, 'forest'>;
export const ART_THEMES: readonly string[] = ['forest', 'cave', 'highland', 'tower'];

export function dungeonGround(m: TileMap, theme: ArtTheme, boss = false): HTMLCanvasElement[] {
  return theme === 'forest' ? forestGround(m, boss) : caveGround(m, boss, theme);
}

export function forestGround(m: TileMap, boss = false): HTMLCanvasElement[] {
  const hit = (boss ? bossCache : groundCache).get(m);
  if (hit) return hit;
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= m.w || y >= m.h ? '#' : m.tiles[y][x]);
  const isW = (x: number, y: number) => at(x, y) === '~';
  const frames = [0, 1, 2, 3].map((f) => {
    const [c, g] = mkCanvas(m.w * TT, m.h * TT);
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const ch = at(x, y), ox = x * TT, oy = y * TT;
      if (isWallCh(ch)) {
        // 森の 屋根（葉の かたまり）
        g.fillStyle = '#1c4220'; g.fillRect(ox, oy, TT, TT);
        continue;
      }
      if (ch === '~') { water(g, ox, oy, x, y, f, isW); continue; }
      if (boss && ch === '=') { dirt(g, ox, oy, x, y); continue; }
      grass(g, ox, oy, x, y);
      if (boss) { g.fillStyle = 'rgba(10,30,20,.28)'; g.fillRect(ox, oy, TT, TT); }
      if (ch === ',' && !boss) {
        // しげみ（たけの ながい 草）
        for (let i = 0; i < 14; i++) {
          const gx = ox + 2 + Math.floor(hash(x, y, i + 30) * 27), gy = oy + 8 + Math.floor(hash(y, x, i + 50) * 22);
          g.fillStyle = '#2f7a2c'; g.fillRect(gx, gy - 6, 2, 7);
          g.fillStyle = '#7ccc58'; g.fillRect(gx, gy - 6, 1, 3);
          g.fillStyle = '#3c8432'; g.fillRect(gx + 2, gy - 4, 1, 5);
        }
      }
      // 木かげ（上が かべ）
      if (isWallCh(at(x, y - 1))) {
        const gr = g.createLinearGradient(0, oy, 0, oy + 14);
        gr.addColorStop(0, 'rgba(10,30,10,.45)'); gr.addColorStop(1, 'rgba(10,30,10,0)');
        g.fillStyle = gr; g.fillRect(ox, oy, TT, 14);
      }
    }
    // ボスの へや：ボスの まわりの まほうじん
    if (boss) {
      let bx = -1, by = -1;
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (m.tiles[y][x] === 'B') { bx = x; by = y; }
      if (bx >= 0) {
        const cx = (bx + 0.5) * TT, cy = (by + 1) * TT;
        const gl = g.createRadialGradient(cx, cy, 4, cx, cy, TT * 3);
        gl.addColorStop(0, 'rgba(140,255,170,.35)'); gl.addColorStop(1, 'rgba(140,255,170,0)');
        g.fillStyle = gl; g.fillRect(cx - TT * 3, cy - TT * 3, TT * 6, TT * 6);
        g.strokeStyle = 'rgba(170,255,190,.75)'; g.lineWidth = 2;
        for (const r of [TT * 2.2, TT * 1.7]) { g.beginPath(); g.ellipse(cx, cy, r, r * 0.7, 0, 0, Math.PI * 2); g.stroke(); }
        g.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2, a2 = a + (Math.PI * 2 * 2) / 6;
          g.beginPath(); g.moveTo(cx + Math.cos(a) * TT * 1.7, cy + Math.sin(a) * TT * 1.19); g.lineTo(cx + Math.cos(a2) * TT * 1.7, cy + Math.sin(a2) * TT * 1.19); g.stroke();
          g.fillStyle = 'rgba(200,255,210,.9)'; g.fillRect(cx + Math.cos(a) * TT * 1.95 - 2, cy + Math.sin(a) * TT * 1.36 - 2, 4, 4);
        }
      }
    }
    // 葉の かたまりを かべの 上に かさねる（となりの マスへ すこし はみだして つながる）
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      if (!isWallCh(at(x, y))) continue;
      for (let i = 0; i < 3; i++) {
        const cx = x * TT + 6 + hash(x, y, i) * 20, cy = y * TT + 6 + hash(y, x, i + 3) * 20, r = 9 + hash(x, y, i + 6) * 5;
        const open = (dx: number, dy: number) => !isWallCh(at(x + dx, y + dy));
        if ((open(-1, 0) && cx - r < x * TT) || (open(1, 0) && cx + r > (x + 1) * TT) || (open(0, -1) && cy - r < y * TT) || (open(0, 1) && cy + r > (y + 1) * TT)) continue;
        const leaf = ['#2f7a32', '#357f34', '#2a7030'][i];
        g.fillStyle = '#163a1a'; g.beginPath(); g.arc(cx + 1, cy + 2, r, 0, Math.PI * 2); g.fill();
        g.fillStyle = leaf; g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#4e9a44'; g.beginPath(); g.arc(cx - r * 0.3, cy - r * 0.35, r * 0.5, 0, Math.PI * 2); g.fill();
        g.fillStyle = 'rgba(200,255,160,.35)'; g.fillRect(Math.round(cx - r * 0.45), Math.round(cy - r * 0.55), 3, 2);
      }
    }
    return c;
  });
  if (!boss) groundCache.set(m, frames); else bossCache.set(m, frames);
  return frames;
}

/** ギミックの 絵（毒の沼・水流・氷・スイッチ・扉）。sx, sy は 画面上の マスの 左上 */
export function drawGimmick(g: G, gm: Gimmick, sx: number, sy: number, frame: number, opened: readonly string[]) {
  switch (gm.kind) {
    case 'poison': {
      g.fillStyle = '#5a2a7a'; g.beginPath(); g.ellipse(sx + 16, sy + 17, 15, 12, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#8a3ab8'; g.beginPath(); g.ellipse(sx + 15, sy + 16, 12, 9, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#b86ae0'; g.beginPath(); g.ellipse(sx + 12, sy + 13, 5, 3, 0, 0, Math.PI * 2); g.fill();
      for (let i = 0; i < 3; i++) {
        const t = ((frame + i * 13) % 40) / 40;
        g.fillStyle = `rgba(230,180,255,${0.9 * (1 - t)})`;
        g.beginPath(); g.arc(sx + 8 + i * 8, sy + 18 - t * 8, 1.5 + t * 1.5, 0, Math.PI * 2); g.fill();
      }
      break;
    }
    case 'current': {
      g.fillStyle = '#2f7fd0'; g.fillRect(sx, sy, TT, TT);
      g.fillStyle = '#5aaeec'; g.fillRect(sx + 2, sy + 2, TT - 4, TT - 4);
      const ang = { up: -Math.PI / 2, down: Math.PI / 2, left: Math.PI, right: 0 }[gm.dir];
      const k = (frame % 24) / 24;
      g.save(); g.translate(sx + 16, sy + 16); g.rotate(ang);
      for (const o of [-8, 4]) {
        const x = o + k * 8;
        g.strokeStyle = '#e8f8ff'; g.lineWidth = 2.5;
        g.beginPath(); g.moveTo(x - 5, -6); g.lineTo(x + 2, 0); g.lineTo(x - 5, 6); g.stroke();
      }
      g.restore();
      break;
    }
    case 'wind': {
      // 風の 橋：谷に かかった 木の 橋と、ながれる 風の すじ
      g.fillStyle = '#2a1e3a'; g.fillRect(sx, sy, TT, TT);
      const gr = g.createLinearGradient(0, sy, 0, sy + TT); gr.addColorStop(0, 'rgba(140,180,230,.5)'); gr.addColorStop(1, 'rgba(40,60,110,.2)');
      g.fillStyle = gr; g.fillRect(sx, sy, TT, TT);
      const horiz = gm.dir === 'left' || gm.dir === 'right';
      g.fillStyle = '#9a6a3a';
      for (let i = 0; i < 4; i++) { if (horiz) g.fillRect(sx + 1 + i * 8, sy + 6, 6, 20); else g.fillRect(sx + 6, sy + 1 + i * 8, 20, 6); }
      g.fillStyle = '#6a4424'; if (horiz) { g.fillRect(sx, sy + 5, TT, 2); g.fillRect(sx, sy + 25, TT, 2); } else { g.fillRect(sx + 5, sy, 2, TT); g.fillRect(sx + 25, sy, 2, TT); }
      const ang = { up: -Math.PI / 2, down: Math.PI / 2, left: Math.PI, right: 0 }[gm.dir];
      const k = (frame % 20) / 20;
      g.save(); g.translate(sx + 16, sy + 16); g.rotate(ang);
      g.strokeStyle = 'rgba(240,250,255,.9)'; g.lineWidth = 1.5;
      for (const [o, yy] of [[-14, -7], [-4, 3], [-10, 9]] as [number, number][]) { const x = o + k * 20; g.beginPath(); g.moveTo(x, yy); g.quadraticCurveTo(x + 6, yy - 3, x + 12, yy); g.stroke(); }
      g.restore();
      break;
    }
    case 'ice': {
      g.fillStyle = '#bfe6f8'; g.fillRect(sx, sy, TT, TT);
      g.fillStyle = '#e8f8ff'; g.fillRect(sx + 2, sy + 2, TT - 4, TT - 4);
      g.strokeStyle = 'rgba(120,180,220,.8)'; g.lineWidth = 1;
      g.beginPath(); g.moveTo(sx + 6, sy + 24); g.lineTo(sx + 14, sy + 14); g.lineTo(sx + 26, sy + 8); g.stroke();
      g.fillStyle = '#ffffff'; g.fillRect(sx + 8, sy + 6, 6, 2);
      break;
    }
    case 'switch': {
      const on = opened.includes(gm.id);
      g.fillStyle = '#6a6a7a'; g.beginPath(); g.ellipse(sx + 16, sy + 18, 12, 8, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = on ? '#3ac86a' : '#e8483a'; g.beginPath(); g.ellipse(sx + 16, sy + (on ? 18 : 15), 8, 5, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(sx + 12, sy + (on ? 16 : 13), 4, 2);
      break;
    }
    case 'gate': {
      if (opened.includes(gm.id)) {
        g.fillStyle = 'rgba(60,40,20,.35)'; g.fillRect(sx + 2, sy + 26, 28, 4);
        break;
      }
      // いばらの とびら
      g.fillStyle = '#5a3a1a'; g.fillRect(sx + 2, sy + 2, 4, 28); g.fillRect(sx + 26, sy + 2, 4, 28);
      g.strokeStyle = '#3a6a2a'; g.lineWidth = 3;
      for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(sx + 4, sy + 6 + i * 7); g.bezierCurveTo(sx + 12, sy + 2 + i * 7, sx + 20, sy + 12 + i * 7, sx + 28, sy + 6 + i * 7); g.stroke(); }
      g.fillStyle = '#e8483a'; for (let i = 0; i < 4; i++) g.fillRect(sx + 8 + i * 6, sy + 8 + ((i * 7) % 18), 3, 3);
      break;
    }
  }
}

/** ミニマップ（右上）。かべは すけさせ、床・宝箱・出口を 色で */
export function dungeonMinimap(m: TileMap, s = 3): HTMLCanvasElement {
  const [c, g] = mkCanvas(m.w * s, m.h * s);
  g.fillStyle = 'rgba(8,16,40,.9)'; g.fillRect(0, 0, c.width, c.height);
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    const ch = m.tiles[y][x];
    if (isWallCh(ch)) continue;
    g.fillStyle = ch === 'B' ? '#e86ad8' : ch === '~' ? '#3f92de' : ch === 'C' ? '#ffd84a' : ch === '>' || ch === 'E' ? '#6ad0ff' : ch === 'H' ? '#8fe8ff' : '#7aa0d8';
    g.fillRect(x * s, y * s, s, s);
  }
  return c;
}

/** ボスの へやの もの：こけむした 石の 柱（I）と ひかる きのこ（f） */
const objCache = new Map<string, HTMLCanvasElement>();
export function pillarImg(): HTMLCanvasElement {
  let c = objCache.get('pillar');
  if (c) return c;
  const [cv, g] = mkCanvas(32, 72);
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(16, 68, 14, 4, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#6a6e74'; g.fillRect(6, 12, 20, 56);
  g.fillStyle = '#8a8e94'; g.fillRect(6, 12, 7, 56);
  g.fillStyle = '#4a4e54'; g.fillRect(21, 12, 5, 56);
  g.fillStyle = '#9a9ea4'; g.fillRect(3, 6, 26, 8); g.fillRect(3, 62, 26, 6);
  g.fillStyle = '#5a5e64'; g.fillRect(3, 12, 26, 2);
  for (let i = 0; i < 4; i++) { g.fillStyle = '#4a4e54'; g.fillRect(7, 22 + i * 11, 18, 1); }
  // こけ
  for (const [x, y, r] of [[8, 8, 5], [14, 6, 4], [24, 9, 4], [7, 30, 3], [22, 44, 4], [9, 58, 5], [20, 62, 4]] as [number, number, number][]) {
    g.fillStyle = '#3a7a34'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#6ab84a'; g.beginPath(); g.arc(x - 1, y - 1, r * 0.5, 0, Math.PI * 2); g.fill();
  }
  objCache.set('pillar', cv);
  return cv;
}
export function mushroomImg(f: number): HTMLCanvasElement {
  const k = `mush${f % 8}`;
  let c = objCache.get(k);
  if (c) return c;
  const [cv, g] = mkCanvas(48, 48);
  const a = 0.35 + 0.2 * Math.sin((f % 8) / 8 * Math.PI * 2);
  const gl = g.createRadialGradient(24, 26, 2, 24, 26, 24);
  gl.addColorStop(0, `rgba(150,255,190,${a})`); gl.addColorStop(1, 'rgba(150,255,190,0)');
  g.fillStyle = gl; g.fillRect(0, 0, 48, 48);
  for (const [x, s] of [[18, 1], [30, 0.7]] as [number, number][]) {
    g.fillStyle = '#e8e0c8'; g.fillRect(x - 2 * s, 30, 4 * s, 12 * s);
    g.fillStyle = '#4ac88a'; g.beginPath(); g.ellipse(x, 30, 10 * s, 7 * s, 0, Math.PI, 0); g.fill();
    g.fillStyle = '#b8ffd8'; g.fillRect(x - 5 * s, 25, 3, 2); g.fillRect(x + 2 * s, 27, 2, 2);
  }
  objCache.set(k, cv);
  return cv;
}

// ---------------------------------------------------------------- 洞窟（しずくのどうくつ）
// 洞窟（cave）・峡谷（highland）・塔（tower）は おなじ 描き方で 色と ゆか・かべの 形だけ かえる
type RockPal = {
  rock: string[]; floor: string[]; water: string[];
  dark: string; hi: string; shadow: string; glow: string; ring: string; path: [string, string];
  floorStyle: 'stone' | 'grass' | 'tile'; wallStyle: 'boulder' | 'brick';
};
const PALS: Record<RockTheme, RockPal> = {
  cave: {
    rock: ['#14284c', '#1c3462', '#24427a', '#2e5292', '#3e68aa'], floor: ['#22395e', '#2a4670', '#31527e', '#3a5e8c', '#182c4a'], water: ['#0e3a78', '#14509a', '#1e68b8', '#4a9ae0', '#9ad8ff'],
    dark: '#0a1630', hi: 'rgba(180,220,255,.35)', shadow: 'rgba(0,6,20,.6)', glow: 'rgba(110,200,255,', ring: 'rgba(160,230,255,.8)', path: ['#3a5a8a', '#4a6c9e'], floorStyle: 'stone', wallStyle: 'boulder',
  },
  highland: {
    rock: ['#4a2e1a', '#7a4e2c', '#9a6638', '#bc8048', '#dca66a'], floor: ['#4f9e3c', '#5cae44', '#68bc4c', '#7ccc58', '#3c8432'], water: ['#1f62ae', '#2f7fd0', '#3f92de', '#5aaeec', '#8fd2f8'],
    dark: '#2e1a0e', hi: 'rgba(255,240,200,.4)', shadow: 'rgba(30,16,6,.45)', glow: 'rgba(200,255,200,', ring: 'rgba(230,255,220,.8)', path: ['#b88a54', '#c99a62'], floorStyle: 'grass', wallStyle: 'boulder',
  },
  tower: {
    rock: ['#3a3e52', '#585e74', '#6c7488', '#848ca2', '#a4acc2'], floor: ['#7e8496', '#8e94a6', '#9ea4b6', '#b0b6c6', '#646a7c'], water: ['#1f62ae', '#2f7fd0', '#3f92de', '#5aaeec', '#8fd2f8'],
    dark: '#22263a', hi: 'rgba(230,240,255,.35)', shadow: 'rgba(10,12,30,.5)', glow: 'rgba(255,230,150,', ring: 'rgba(255,230,160,.85)', path: ['#8a3a4a', '#a8485a'], floorStyle: 'tile', wallStyle: 'brick',
  },
};
let CAVE = PALS.cave;
const caveCache = new Map<string, WeakMap<TileMap, HTMLCanvasElement[]>>();
function caveFloor(g: G, ox: number, oy: number, x: number, y: number) {
  const k = CAVE.floor;
  if (CAVE.floorStyle === 'grass') {
    // 高原の 草地（ところどころ 土）
    grass(g, ox, oy, x, y);
    if (hash(x, y, 71) < 0.25) { g.fillStyle = 'rgba(160,110,60,.35)'; g.beginPath(); g.ellipse(ox + 10 + hash(x, y, 72) * 12, oy + 12 + hash(y, x, 73) * 10, 7, 4, 0, 0, Math.PI * 2); g.fill(); }
    return;
  }
  if (CAVE.floorStyle === 'tile') {
    // 塔の 石の タイル（2×2）
    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
      const c = k[Math.floor(hash(x * 2 + i, y * 2 + j, 5) * 3)];
      g.fillStyle = c; g.fillRect(ox + i * 16, oy + j * 16, 16, 16);
      g.fillStyle = k[4]; g.fillRect(ox + i * 16, oy + j * 16 + 15, 16, 1); g.fillRect(ox + i * 16 + 15, oy + j * 16, 1, 16);
      g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(ox + i * 16, oy + j * 16, 15, 1);
    }
    if (hash(x, y, 77) < 0.1) { g.fillStyle = 'rgba(40,40,60,.35)'; g.fillRect(ox + 6, oy + 20, 8, 1); g.fillRect(ox + 13, oy + 20, 1, 5); }
    return;
  }
  g.fillStyle = k[1]; g.fillRect(ox, oy, TT, TT);
  // 石だたみの ような ひらたい 石
  for (let i = 0; i < 5; i++) {
    const sx = ox + Math.floor(hash(x, y, i + 1) * 26), sy = oy + Math.floor(hash(y, x, i + 7) * 26), w = 6 + Math.floor(hash(x, y, i + 13) * 8), h = 4 + Math.floor(hash(x, y, i + 19) * 5);
    g.fillStyle = hash(x, y, i + 31) > 0.5 ? k[2] : k[0];
    g.beginPath(); g.ellipse(sx + w / 2, sy + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = 'rgba(160,200,255,.12)'; g.fillRect(sx + 1, sy, Math.max(1, w - 3), 1);
  }
  // こいしと ぬれた ひかり
  for (let i = 0; i < 6; i++) {
    const px = ox + Math.floor(hash(x, y, i + 40) * 30), py = oy + Math.floor(hash(y, x, i + 50) * 30);
    g.fillStyle = hash(x, y, i + 60) > 0.6 ? k[3] : k[4]; g.fillRect(px, py, 2, 2);
  }
  if (hash(x, y, 77) < 0.12) { g.fillStyle = 'rgba(120,200,255,.25)'; g.beginPath(); g.ellipse(ox + 16, oy + 18, 9, 4, 0, 0, Math.PI * 2); g.fill(); }
}
function caveWater(g: G, ox: number, oy: number, x: number, y: number, f: number, isW: (x: number, y: number) => boolean) {
  const k = CAVE.water;
  g.fillStyle = k[1]; g.fillRect(ox, oy, TT, TT);
  const gr = g.createLinearGradient(0, oy, 0, oy + TT);
  gr.addColorStop(0, 'rgba(60,160,255,.25)'); gr.addColorStop(1, 'rgba(0,20,60,.2)');
  g.fillStyle = gr; g.fillRect(ox, oy, TT, TT);
  for (let i = 0; i < 4; i++) {
    const wx = ox + ((Math.floor(hash(x, y, i) * 24) + f * 3 + i * 5) % 26), wy = oy + 5 + i * 7;
    g.fillStyle = i % 2 ? k[3] : 'rgba(150,220,255,.55)'; g.fillRect(wx, wy, 5, 1);
  }
  // 岸（となりが 水で ない）
  g.fillStyle = 'rgba(180,230,255,.55)';
  if (!isW(x, y - 1)) g.fillRect(ox, oy, TT, 2);
  if (!isW(x - 1, y)) g.fillRect(ox, oy, 2, TT);
  if (!isW(x + 1, y)) g.fillRect(ox + TT - 2, oy, 2, TT);
  g.fillStyle = 'rgba(0,10,40,.35)';
  if (!isW(x, y - 1)) g.fillRect(ox, oy + 2, TT, 3);
}
function caveGround(m: TileMap, boss: boolean, theme: RockTheme = 'cave'): HTMLCanvasElement[] {
  CAVE = PALS[theme];
  const ck = `${theme}:${boss ? 1 : 0}`;
  let cmap = caveCache.get(ck);
  if (!cmap) { cmap = new WeakMap(); caveCache.set(ck, cmap); }
  const hit = cmap.get(m);
  if (hit) return hit;
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= m.w || y >= m.h ? '#' : m.tiles[y][x]);
  const isW = (x: number, y: number) => at(x, y) === '~';
  const frames = [0, 1, 2, 3].map((f) => {
    const [c, g] = mkCanvas(m.w * TT, m.h * TT);
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const ch = at(x, y), ox = x * TT, oy = y * TT;
      if (isWallCh(ch)) { g.fillStyle = CAVE.rock[0]; g.fillRect(ox, oy, TT, TT); continue; }
      if (ch === '~') { caveWater(g, ox, oy, x, y, f, isW); continue; }
      caveFloor(g, ox, oy, x, y);
      if (boss && ch === '=') {
        // ボスへの みち：ひらたい 石の 道
        g.fillStyle = CAVE.path[0]; g.fillRect(ox + 3, oy, TT - 6, TT);
        g.fillStyle = CAVE.path[1]; for (let i = 0; i < 2; i++) g.fillRect(ox + 4, oy + i * 16 + 1, TT - 8, 13);
        g.fillStyle = 'rgba(200,230,255,.18)'; g.fillRect(ox + 4, oy + 1, TT - 8, 1); g.fillRect(ox + 4, oy + 17, TT - 8, 1);
      }
      if (ch === ',' && !boss && theme === 'cave') {
        // こけと ひかる きのこの ような つぶ
        for (let i = 0; i < 8; i++) { g.fillStyle = hash(x, y, i + 90) > 0.5 ? '#2a6a6a' : '#3a8a7a'; g.fillRect(ox + Math.floor(hash(x, y, i + 91) * 28), oy + Math.floor(hash(y, x, i + 92) * 28), 3, 2); }
        if (hash(x, y, 99) < 0.4) { g.fillStyle = '#8af0ff'; g.fillRect(ox + 10 + Math.floor(hash(x, y, 98) * 12), oy + 12, 2, 2); }
      }
      // かべの 影（上が かべ）
      if (isWallCh(at(x, y - 1))) {
        const gr = g.createLinearGradient(0, oy, 0, oy + 16);
        gr.addColorStop(0, CAVE.shadow); gr.addColorStop(1, 'rgba(0,0,0,0)');
        g.fillStyle = gr; g.fillRect(ox, oy, TT, 16);
      }
    }
    if (boss) {
      let bx = -1, by = -1;
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (m.tiles[y][x] === 'B') { bx = x; by = y; }
      if (bx >= 0) {
        const cx = (bx + 0.5) * TT, cy = (by + 1) * TT;
        const gl = g.createRadialGradient(cx, cy, 4, cx, cy, TT * 3.2);
        gl.addColorStop(0, CAVE.glow + '.4)'); gl.addColorStop(1, CAVE.glow + '0)');
        g.fillStyle = gl; g.fillRect(cx - TT * 3.2, cy - TT * 3.2, TT * 6.4, TT * 6.4);
        g.strokeStyle = CAVE.ring; g.lineWidth = 2;
        for (const r of [TT * 2.2, TT * 1.7]) { g.beginPath(); g.ellipse(cx, cy, r, r * 0.7, 0, 0, Math.PI * 2); g.stroke(); }
        g.lineWidth = 1.5;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          g.beginPath(); g.moveTo(cx + Math.cos(a) * TT * 1.7, cy + Math.sin(a) * TT * 1.19); g.lineTo(cx + Math.cos(a) * TT * 2.2, cy + Math.sin(a) * TT * 1.54); g.stroke();
        }
      }
    }
    // 塔：かべの うえは 石づみ
    if (CAVE.wallStyle === 'brick') for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      if (!isWallCh(at(x, y))) continue;
      const ox = x * TT, oy = y * TT;
      g.fillStyle = CAVE.rock[1]; g.fillRect(ox, oy, TT, TT);
      for (let r = 0; r < 4; r++) {
        g.fillStyle = CAVE.rock[0]; g.fillRect(ox, oy + r * 8 + 7, TT, 1);
        for (let bx = (r % 2) * 8; bx < TT; bx += 16) g.fillRect(ox + bx, oy + r * 8, 1, 8);
        g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(ox, oy + r * 8, TT, 1);
      }
    }
    // 岩の かたまり（かべの 上。となりへ すこし はみだす）
    if (CAVE.wallStyle === 'boulder') for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      if (!isWallCh(at(x, y))) continue;
      for (let i = 0; i < 4; i++) {
        const cx = x * TT + 5 + hash(x, y, i) * 22, cy = y * TT + 5 + hash(y, x, i + 3) * 22, r = 7 + hash(x, y, i + 6) * 6;
        const open = (dx: number, dy: number) => !isWallCh(at(x + dx, y + dy));
        if ((open(-1, 0) && cx - r < x * TT) || (open(1, 0) && cx + r > (x + 1) * TT) || (open(0, -1) && cy - r < y * TT) || (open(0, 1) && cy + r > (y + 1) * TT)) continue;
        const k = CAVE.rock;
        g.fillStyle = CAVE.dark; g.beginPath(); g.ellipse(cx + 1, cy + 2, r, r * 0.85, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = k[1 + (i % 2)]; g.beginPath(); g.ellipse(cx, cy, r, r * 0.85, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = k[3]; g.beginPath(); g.ellipse(cx - r * 0.3, cy - r * 0.35, r * 0.45, r * 0.3, 0, 0, Math.PI * 2); g.fill();
        g.fillStyle = CAVE.hi; g.fillRect(Math.round(cx - r * 0.5), Math.round(cy - r * 0.55), 3, 1);
      }
    }
    return c;
  });
  cmap.set(m, frames);
  return frames;
}

/** 手前の かべ（下が 道）の 岩の がけ。32×40（マスの 下に そろえ、上へ 8 はみだす） */
export function rockFaceImg(v: number, theme: RockTheme = 'cave'): HTMLCanvasElement {
  const key = `rockface${theme}${v % 4}`;
  let c = objCache.get(key);
  if (c) return c;
  const [cv, g] = mkCanvas(36, 44);
  const P = PALS[theme], k = P.rock;
  if (P.wallStyle === 'brick') {
    // 塔の かべ：石づみ。ときどき 空の 見える まど
    g.fillStyle = k[2]; g.fillRect(2, 12, 32, 28);
    for (let r = 0; r < 4; r++) {
      g.fillStyle = k[0]; g.fillRect(2, 12 + r * 7 + 6, 32, 1);
      for (let bx = 2 + (r % 2) * 8; bx < 34; bx += 16) g.fillRect(bx, 12 + r * 7, 1, 7);
      g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(2, 12 + r * 7, 32, 1);
    }
    g.fillStyle = k[3]; g.fillRect(2, 9, 32, 4); g.fillStyle = k[4]; g.fillRect(2, 9, 32, 1);
    if (v % 4 === 0) {
      g.fillStyle = k[0]; g.fillRect(11, 16, 14, 18); g.beginPath(); g.ellipse(18, 16, 7, 6, 0, Math.PI, 0); g.fill();
      const sky = g.createLinearGradient(0, 12, 0, 34); sky.addColorStop(0, '#6ab0f0'); sky.addColorStop(1, '#c8e8ff');
      g.fillStyle = sky; g.fillRect(13, 17, 10, 16); g.beginPath(); g.ellipse(18, 17, 5, 4, 0, Math.PI, 0); g.fill();
      g.fillStyle = '#ffffff'; g.fillRect(14, 26, 6, 2); g.fillRect(16, 25, 4, 1);
    }
    g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(2, 38, 32, 2);
    objCache.set(key, cv);
    return cv;
  }
  // 下の がけの 面（ごつごつした 岩を 2〜3こ かさねる）
  const blobs: [number, number, number, number][] = [
    [[9, 30, 10, 13], [26, 31, 11, 12], [18, 22, 9, 9]],
    [[8, 31, 9, 12], [20, 28, 11, 14], [30, 33, 7, 10]],
    [[12, 28, 12, 14], [28, 32, 9, 11]],
    [[7, 32, 8, 11], [18, 30, 10, 13], [29, 27, 8, 12], [16, 21, 7, 7]],
  ][v % 4] as [number, number, number, number][];
  for (const [x, y, rx, ry] of blobs) { g.fillStyle = P.dark; g.beginPath(); g.ellipse(x, y + 1, rx + 1, ry + 1, 0, 0, Math.PI * 2); g.fill(); }
  for (const [x, y, rx, ry] of blobs) {
    const gr = g.createLinearGradient(0, y - ry, 0, y + ry);
    gr.addColorStop(0, k[4]); gr.addColorStop(0.35, k[2]); gr.addColorStop(1, k[1]);
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = P.hi; g.beginPath(); g.ellipse(x - rx * 0.35, y - ry * 0.55, rx * 0.35, ry * 0.15, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(8,20,48,.7)'; g.lineWidth = 1; g.beginPath(); g.moveTo(x + rx * 0.2, y - ry * 0.2); g.lineTo(x + rx * 0.1, y + ry * 0.6); g.stroke();
  }
  // マスの 下に そろえる ため、下を まっすぐ きる
  g.clearRect(0, 40, 36, 4);
  g.fillStyle = theme === 'cave' ? 'rgba(100,180,255,.25)' : 'rgba(0,0,0,.18)'; g.fillRect(2, 38, 32, 2);
  objCache.set(key, cv);
  return cv;
}

/** ひかる 水晶の かたまり（洞窟の かべぎわ・参考画像3） */
export function crystalImg(v: number, f: number): HTMLCanvasElement {
  const key = `crystal${v % 3}:${f % 8}`;
  let c = objCache.get(key);
  if (c) return c;
  const [cv, g] = mkCanvas(48, 64);
  const a = 0.32 + 0.14 * Math.sin(((f % 8) / 8) * Math.PI * 2);
  const gl = g.createRadialGradient(24, 40, 2, 24, 40, 26);
  gl.addColorStop(0, `rgba(120,230,255,${a})`); gl.addColorStop(1, 'rgba(120,230,255,0)');
  g.fillStyle = gl; g.fillRect(0, 0, 48, 64);
  const shards: [number, number, number, number][] = [[[-8, 22, 5, -0.25], [0, 36, 7, 0], [9, 26, 5, 0.22], [-3, 14, 4, -0.1]], [[-6, 30, 6, -0.15], [6, 24, 5, 0.2], [0, 16, 4, 0.05]], [[-9, 18, 4, -0.3], [-1, 30, 6, -0.05], [8, 20, 5, 0.25]]][v % 3] as [number, number, number, number][];
  for (const [dx, h, w, t] of shards) {
    g.save(); g.translate(24 + dx, 58); g.rotate(t);
    g.fillStyle = '#1a6ab0'; g.beginPath(); g.moveTo(-w, 0); g.lineTo(-w * 0.75, -h * 0.82); g.lineTo(0, -h); g.lineTo(w * 0.75, -h * 0.82); g.lineTo(w, 0); g.fill();
    g.fillStyle = '#4ac0f0'; g.beginPath(); g.moveTo(-w * 0.75, -h * 0.82); g.lineTo(0, -h); g.lineTo(0, 0); g.lineTo(-w, 0); g.fill();
    g.fillStyle = '#b8f4ff'; g.beginPath(); g.moveTo(-w * 0.55, -h * 0.75); g.lineTo(-1, -h * 0.95); g.lineTo(-1, -h * 0.35); g.fill();
    g.strokeStyle = '#0a2a5a'; g.lineWidth = 1; g.beginPath(); g.moveTo(-w, 0); g.lineTo(-w * 0.75, -h * 0.82); g.lineTo(0, -h); g.lineTo(w * 0.75, -h * 0.82); g.lineTo(w, 0); g.stroke();
    g.restore();
  }
  g.fillStyle = '#ffffff'; if (f % 8 < 2) g.fillRect(20, 30, 2, 2);
  objCache.set(key, cv);
  return cv;
}

/** 滝（かべの 下が 水の とき）。32×48、マスの 下に そろえる */
export function waterfallImg(f: number): HTMLCanvasElement {
  const key = `fall${f % 8}`;
  let c = objCache.get(key);
  if (c) return c;
  const [cv, g] = mkCanvas(32, 48);
  const gr = g.createLinearGradient(0, 0, 0, 48);
  gr.addColorStop(0, 'rgba(150,220,255,.75)'); gr.addColorStop(1, 'rgba(200,240,255,.95)');
  g.fillStyle = gr; g.fillRect(5, 0, 22, 44);
  for (let i = 0; i < 6; i++) {
    const x = 6 + i * 4, y = ((f * 6 + i * 11) % 48);
    g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(x, y, 1, 10);
    g.fillStyle = 'rgba(80,160,230,.6)'; g.fillRect(x + 2, (y + 20) % 48, 1, 8);
  }
  // しぶき
  for (let i = 0; i < 7; i++) { const a = (i / 7) * Math.PI + (f % 4) * 0.2; g.fillStyle = 'rgba(240,250,255,.9)'; g.beginPath(); g.arc(16 + Math.cos(a) * 12, 44 - Math.sin(a) * 3, 2, 0, Math.PI * 2); g.fill(); }
  objCache.set(key, cv);
  return cv;
}

/** 洞窟の ボスの へや：水晶の 柱（I）と ひかる 水晶の 台（f） */
export function crystalPillarImg(): HTMLCanvasElement {
  let c = objCache.get('cpillar');
  if (c) return c;
  const [cv, g] = mkCanvas(32, 76);
  g.fillStyle = 'rgba(0,0,0,.3)'; g.beginPath(); g.ellipse(16, 72, 14, 4, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#2a4a7a'; g.fillRect(5, 60, 22, 12);
  g.fillStyle = '#3a6098'; g.fillRect(5, 60, 22, 3);
  g.fillStyle = '#1a6ab0'; g.beginPath(); g.moveTo(8, 61); g.lineTo(10, 10); g.lineTo(16, 2); g.lineTo(22, 10); g.lineTo(24, 61); g.fill();
  g.fillStyle = '#4ac0f0'; g.beginPath(); g.moveTo(10, 10); g.lineTo(16, 2); g.lineTo(16, 61); g.lineTo(8, 61); g.fill();
  g.fillStyle = '#b8f4ff'; g.fillRect(12, 12, 2, 40);
  objCache.set('cpillar', cv);
  return cv;
}

/** 洞窟の そと（マップの 外がわ）を うめる 岩の もよう */
const texCache = new Map<string, HTMLCanvasElement>();
export function caveTexture(theme: RockTheme = 'cave'): HTMLCanvasElement {
  const hit = texCache.get(theme);
  if (hit) return hit;
  const [c, g] = mkCanvas(96, 96);
  const CAVE = PALS[theme];
  if (theme === 'tower') {
    // 塔の そと：空と 雲
    const sky = g.createLinearGradient(0, 0, 0, 96); sky.addColorStop(0, '#5a9ae0'); sky.addColorStop(1, '#a8d4fa');
    g.fillStyle = sky; g.fillRect(0, 0, 96, 96);
    for (const [x, y, r] of [[18, 30, 10], [30, 26, 12], [44, 31, 9], [70, 70, 11], [82, 66, 9], [60, 72, 8]] as [number, number, number][]) { g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
    texCache.set(theme, c);
    return c;
  }
  g.fillStyle = CAVE.rock[0]; g.fillRect(0, 0, 96, 96);
  for (let i = 0; i < 26; i++) {
    const cx = hash(i, 1, 3) * 96, cy = hash(i, 2, 3) * 96, r = 7 + hash(i, 3, 3) * 7;
    for (const [dx, dy] of [[0, 0], [96, 0], [-96, 0], [0, 96], [0, -96]]) {
      g.fillStyle = CAVE.dark; g.beginPath(); g.ellipse(cx + dx + 1, cy + dy + 2, r, r * 0.85, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = CAVE.rock[1 + (i % 2)]; g.beginPath(); g.ellipse(cx + dx, cy + dy, r, r * 0.85, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = CAVE.rock[3]; g.beginPath(); g.ellipse(cx + dx - r * 0.3, cy + dy - r * 0.35, r * 0.45, r * 0.3, 0, 0, Math.PI * 2); g.fill();
    }
  }
  texCache.set(theme, c);
  return c;
}

/** 塔の たいまつ（かべぎわ・ボスの へや） */
export function torchImg(f: number): HTMLCanvasElement {
  const key = `torch${f % 6}`;
  let c = objCache.get(key);
  if (c) return c;
  const [cv, g] = mkCanvas(32, 56);
  const gl = g.createRadialGradient(16, 18, 2, 16, 18, 20);
  gl.addColorStop(0, 'rgba(255,200,100,.45)'); gl.addColorStop(1, 'rgba(255,200,100,0)');
  g.fillStyle = gl; g.fillRect(0, 0, 32, 40);
  g.fillStyle = '#5a4a3a'; g.fillRect(14, 24, 4, 30); g.fillStyle = '#8a7a5a'; g.fillRect(11, 22, 10, 4);
  const h = 10 + (f % 3) * 2;
  g.fillStyle = '#ff8a2a'; g.beginPath(); g.moveTo(10, 22); g.quadraticCurveTo(16, 22 - h * 1.6, 22, 22); g.fill();
  g.fillStyle = '#ffe070'; g.beginPath(); g.moveTo(13, 22); g.quadraticCurveTo(16, 22 - h, 19, 22); g.fill();
  objCache.set(key, cv);
  return cv;
}

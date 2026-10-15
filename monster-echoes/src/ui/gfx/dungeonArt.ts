// 森の ダンジョンの 描画（参考画像3「ダンジョンの画面」の 描き方を 森に あてはめる）。
// 地面（草・しげみ・水）を 1枚の 絵に まとめ、かべの マスは 1本ずつ 木として 人と 奥行きじゅんに かさねる。
import type { TileMap } from '../../domain/dungeon/DungeonEngine';
import type { Gimmick } from '../../domain/dungeon/RoomGen';
import { dirt, grass, hash, TT, water } from './townArt';
import { mkCanvas } from './Pix';

type G = CanvasRenderingContext2D;
export const isWallCh = (ch: string) => ch === '#' || ch === 'T' || ch === 'Z';

const groundCache = new WeakMap<TileMap, HTMLCanvasElement[]>();
const bossCache = new WeakMap<TileMap, HTMLCanvasElement[]>();
/** 地面の 層（水が うごくので 4まい） */
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

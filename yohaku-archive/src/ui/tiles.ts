// 地形の描画（16px 単位のドット絵をコードで生成し、区域ごとに 1 枚の絵にまとめる）
export const TS = 16;

interface Theme { floor: string; floor2: string; wall: string; wallTop: string; accent: string }
const THEMES: Record<string, Theme> = {
  archive: { floor: '#4b4339', floor2: '#433c33', wall: '#3a3138', wallTop: '#55474f', accent: '#e2b45e' },
  town: { floor: '#7d7a74', floor2: '#6f6c66', wall: '#4a4650', wallTop: '#5e5866', accent: '#e2b45e' },
  home: { floor: '#7a5838', floor2: '#6a4c30', wall: '#5a4a44', wallTop: '#76625a', accent: '#e8c890' },
  corridor: { floor: '#2c2a36', floor2: '#25232e', wall: '#0c0b10', wallTop: '#1c1a24', accent: '#9a8ad8' },
  tower: { floor: '#4a3c30', floor2: '#40342a', wall: '#3a3430', wallTop: '#56504a', accent: '#c8a040' },
  top: { floor: '#4e4844', floor2: '#44403c', wall: '#34303a', wallTop: '#4a4652', accent: '#c8a040' },
  east: { floor: '#6e6a62', floor2: '#625e57', wall: '#4a4440', wallTop: '#5e5650', accent: '#e2b45e' },
};

function hash(x: number, y: number, k = 0): number {
  let h = (x * 374761393 + y * 668265263 + k * 2147483647) | 0;
  h = (h ^ (h >>> 13)) * 1274126177;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function px(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string) {
  g.fillStyle = c;
  g.fillRect(x, y, w, h);
}

function floorTile(g: CanvasRenderingContext2D, ox: number, oy: number, th: Theme, tx: number, ty: number) {
  px(g, ox, oy, TS, TS, (tx + ty) % 2 ? th.floor : th.floor2);
  px(g, ox, oy + 15, TS, 1, 'rgba(0,0,0,0.12)');
  px(g, ox + 15, oy, 1, TS, 'rgba(0,0,0,0.08)');
  if (hash(tx, ty, 1) > 0.7) px(g, ox + Math.floor(hash(tx, ty, 2) * 12) + 2, oy + Math.floor(hash(tx, ty, 3) * 12) + 2, 2, 1, 'rgba(255,255,255,0.06)');
}

function woodTile(g: CanvasRenderingContext2D, ox: number, oy: number, base: string, tx: number, ty: number) {
  px(g, ox, oy, TS, TS, base);
  for (let i = 0; i < 4; i++) {
    px(g, ox, oy + i * 4 + 3, TS, 1, 'rgba(0,0,0,0.22)');
    const cut = Math.floor(hash(tx, ty * 4 + i, 5) * 16);
    px(g, ox + cut, oy + i * 4, 1, 3, 'rgba(0,0,0,0.18)');
  }
}

function grass(g: CanvasRenderingContext2D, ox: number, oy: number, tx: number, ty: number) {
  px(g, ox, oy, TS, TS, '#5b6e4a');
  for (let i = 0; i < 6; i++) {
    const x = Math.floor(hash(tx, ty, i) * 15), y = Math.floor(hash(tx, ty, i + 9) * 14);
    px(g, ox + x, oy + y, 1, 2, i % 2 ? '#6e8458' : '#4a5c3c');
  }
}

function cobble(g: CanvasRenderingContext2D, ox: number, oy: number, th: Theme, tx: number, ty: number) {
  px(g, ox, oy, TS, TS, th.floor2);
  for (let r = 0; r < 3; r++) {
    const off = (r + ty) % 2 ? 0 : 4;
    for (let c = -1; c < 3; c++) {
      const x = ox + c * 8 + off, y = oy + r * 5 + 1;
      const shade = hash(tx * 3 + c, ty * 3 + r, 7) * 18 - 9;
      g.fillStyle = shadeColor(th.floor, shade);
      g.fillRect(Math.max(ox, x + 1), y, Math.min(7, ox + TS - x - 1), 4);
    }
  }
}

function shadeColor(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const r = Math.max(0, Math.min(255, (n >> 16) + amt));
  const gg = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
  const b = Math.max(0, Math.min(255, (n & 255) + amt));
  return `rgb(${r},${gg},${b})`;
}

function wall(g: CanvasRenderingContext2D, ox: number, oy: number, th: Theme, tx: number, ty: number, below: string | undefined) {
  px(g, ox, oy, TS, TS, th.wall);
  for (let r = 0; r < 4; r++) {
    const off = r % 2 ? 0 : 5;
    px(g, ox, oy + r * 4 + 3, TS, 1, 'rgba(0,0,0,0.25)');
    px(g, ox + ((off + tx * 7) % 10), oy + r * 4, 1, 3, 'rgba(0,0,0,0.2)');
  }
  if (below && below !== '#' && below !== '=') px(g, ox, oy + 13, TS, 3, 'rgba(0,0,0,0.35)');
  else px(g, ox, oy, TS, 4, th.wallTop);
  void ty;
}

function shelf(g: CanvasRenderingContext2D, ox: number, oy: number, tx: number, ty: number) {
  px(g, ox, oy, TS, TS, '#4a3424');
  px(g, ox + 1, oy + 1, 14, 6, '#24180f');
  px(g, ox + 1, oy + 8, 14, 6, '#24180f');
  const cols = ['#7a3a32', '#3a5a6a', '#5a6a3a', '#8a6a3a', '#5a3a5a', '#3a4a6a', '#b0a080'];
  for (const row of [1, 8]) {
    let x = 1;
    while (x < 15) {
      const w = 1 + Math.floor(hash(tx * 16 + x, ty * 2 + row, 11) * 2);
      if (hash(tx * 16 + x, ty + row, 13) > 0.12) {
        const hgt = 4 + Math.floor(hash(tx + x, ty * 5 + row, 3) * 3);
        px(g, ox + x, oy + row + 6 - hgt, w, hgt, cols[Math.floor(hash(x + tx * 5, row + ty * 3, 17) * cols.length)]);
      }
      x += w;
    }
  }
  px(g, ox, oy + 14, TS, 2, '#2a1c12');
}

const ROOFS = [['#3e4658', '#4a5468', '#465064', '#2c3242'], ['#5a3a36', '#6a4640', '#64423c', '#3e2826'], ['#3c4c44', '#485a50', '#44564c', '#2a3630'], ['#4a4058', '#584c68', '#524862', '#322a3e']];
const WALLS = ['#b8aa92', '#a9a2a6', '#c2aa8c', '#9ea6a6', '#b39a88'];

function building(g: CanvasRenderingContext2D, ox: number, oy: number, ch: string, tx: number, ty: number, night: boolean, id: number) {
  if (ch === 'R') {
    const [base, a, b, line] = ROOFS[id % ROOFS.length];
    px(g, ox, oy, TS, TS, base);
    for (let r = 0; r < 4; r++) {
      const off = r % 2 ? 0 : 4;
      for (let c = -1; c < 3; c++) px(g, ox + c * 8 + off + 1, oy + r * 4, 6, 3, r % 2 ? a : b);
      px(g, ox, oy + r * 4 + 3, TS, 1, line);
    }
    return;
  }
  px(g, ox, oy, TS, TS, WALLS[(id * 3 + 1) % WALLS.length]);
  for (let r = 0; r < 4; r++) px(g, ox, oy + r * 4 + 3, TS, 1, 'rgba(90,70,50,0.25)');
  px(g, ox + ((tx * 5) % 12), oy + 4, 1, 3, 'rgba(90,70,50,0.3)');
  if (ch === 'W') {
    px(g, ox + 4, oy + 3, 8, 9, '#3a2c20');
    px(g, ox + 5, oy + 4, 6, 7, night ? '#f0c060' : '#5a7088');
    px(g, ox + 7, oy + 4, 1, 7, '#3a2c20');
    px(g, ox + 5, oy + 7, 6, 1, '#3a2c20');
  }
  if (ch === 'D') {
    px(g, ox + 3, oy + 2, 10, 14, '#3a2414');
    px(g, ox + 4, oy + 3, 8, 13, '#6a4428');
    px(g, ox + 8, oy + 3, 1, 13, '#3a2414');
    px(g, ox + 10, oy + 9, 1, 2, '#e2b45e');
  }
  void ty;
}

/** 区域全体の地形を 1 枚のキャンバスに描く */
export function renderTiles(tiles: string[], theme: string, night: boolean): HTMLCanvasElement {
  const th = THEMES[theme] ?? THEMES.town;
  const h = tiles.length, w = tiles[0].length;
  const cv = document.createElement('canvas');
  cv.width = w * TS; cv.height = h * TS;
  const g = cv.getContext('2d')!;
  const at = (x: number, y: number) => tiles[y]?.[x];
  const outdoor = theme === 'town' || theme === 'east';
  // 建物ごとに屋根と壁の色を変える（つながった建物タイルに番号を振る）
  const bid: number[][] = tiles.map(r => [...r].map(() => -1));
  let nextId = 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!'RBWD'.includes(at(x, y)) || bid[y][x] >= 0) continue;
    const q: [number, number][] = [[x, y]];
    bid[y][x] = nextId;
    while (q.length) {
      const [cx, cy] = q.pop()!;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = cx + dx, ny = cy + dy;
        if (ny < 0 || ny >= h || nx < 0 || nx >= w || bid[ny][nx] >= 0 || !'RBWD'.includes(at(nx, ny))) continue;
        bid[ny][nx] = nextId;
        q.push([nx, ny]);
      }
    }
    nextId++;
  }
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const ch = at(x, y);
    const ox = x * TS, oy = y * TS;
    // 下地
    if (outdoor && !'.,_'.includes(ch)) cobble(g, ox, oy, th, x, y);
    else if (theme === 'home' || ch === ',') woodTile(g, ox, oy, '#7a5838', x, y);
    else if (theme === 'tower' || theme === 'top') woodTile(g, ox, oy, (x + y) % 2 ? th.floor : th.floor2, x, y);
    else floorTile(g, ox, oy, th, x, y);
    switch (ch) {
      case '#': wall(g, ox, oy, th, x, y, at(x, y + 1)); break;
      case 'C': {
        px(g, ox, oy, TS, TS, '#56505a');
        for (let r = 0; r < 2; r++) { px(g, ox, oy + r * 8 + 7, TS, 1, '#3a3640'); px(g, ox + ((r + x) % 2) * 8, oy + r * 8, 1, 7, '#3a3640'); }
        if (at(x, y + 1) !== 'C' && at(x, y + 1) !== 'G') px(g, ox, oy + 13, TS, 3, 'rgba(0,0,0,0.3)');
        break;
      }
      case '=': shelf(g, ox, oy, x, y); break;
      case 'T':
        px(g, ox + 1, oy + 3, 14, 9, '#6a4a2e'); px(g, ox + 1, oy + 3, 14, 2, '#8a6440'); px(g, ox + 2, oy + 12, 2, 4, '#4a3420'); px(g, ox + 12, oy + 12, 2, 4, '#4a3420');
        break;
      case 'c': px(g, ox, oy + 2, TS, 12, '#5a3e28'); px(g, ox, oy + 2, TS, 3, '#7a5838'); px(g, ox, oy + 13, TS, 2, '#3a2818'); break;
      case 'r':
        px(g, ox, oy, TS, TS, '#6a2a2e');
        px(g, ox + 2, oy + 2, 12, 12, '#7a3438');
        if ((x + y) % 2) px(g, ox + 7, oy + 7, 2, 2, '#c8a050');
        break;
      case 'b': px(g, ox + 1, oy, 14, TS, '#5a4430'); px(g, ox + 2, oy + 1, 12, 14, '#d8d4e4'); if (at(x, y - 1) !== 'b') px(g, ox + 3, oy + 2, 10, 4, '#f4f2fa'); break;
      case '~': px(g, ox, oy, TS, TS, '#2e4a5e'); px(g, ox + Math.floor(hash(x, y) * 10), oy + 5, 5, 1, '#48687e'); px(g, ox + Math.floor(hash(y, x) * 10), oy + 11, 4, 1, '#3e5c72'); break;
      case '"': grass(g, ox, oy, x, y); break;
      case ':': break;
      case 'R': case 'B': case 'W': case 'D':
        if (theme === 'archive' || theme === 'home' || theme === 'tower' || theme === 'top') {
          if (ch === 'D') { px(g, ox + 2, oy, 12, TS, '#3a2414'); px(g, ox + 3, oy + 1, 10, 15, '#6a4428'); }
        } else building(g, ox, oy, ch, x, y, night, bid[y][x] + Math.floor(hash(nextId, 3) * 4));
        break;
      case 't':
        grass(g, ox, oy, x, y);
        px(g, ox + 7, oy + 10, 2, 6, '#4a3424');
        g.fillStyle = '#34482e'; g.beginPath(); g.arc(ox + 8, oy + 7, 7, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#42583a'; g.beginPath(); g.arc(ox + 6, oy + 5, 4, 0, Math.PI * 2); g.fill();
        break;
      case 'l': px(g, ox + 7, oy + 4, 2, 12, '#2a2a30'); px(g, ox + 5, oy + 1, 6, 5, '#2a2a30'); px(g, ox + 6, oy + 2, 4, 3, night ? '#ffe090' : '#c8b890'); break;
      case 'f':
        px(g, ox + 1, oy + 4, 14, 11, '#5a3e2a');
        for (let i = 0; i < 6; i++) px(g, ox + 2 + Math.floor(hash(x, y, i) * 11), oy + 5 + Math.floor(hash(y, x, i) * 8), 2, 2, ['#f0f0f0', '#e8d060', '#d87a8a'][i % 3]);
        break;
      case 'o':
        px(g, ox, oy, TS, TS, '#8a8a90');
        px(g, ox + 1, oy + 1, 14, 14, '#9c9ca2');
        px(g, ox + 3, oy + 3, 10, 10, '#3e6278');
        px(g, ox + 5, oy + 6, 4, 1, '#7aa0b8');
        break;
      case 's':
        px(g, ox, oy + 6, TS, 10, '#6a4a30');
        for (let i = 0; i < 4; i++) px(g, ox + i * 4, oy, 4, 6, i % 2 ? '#d8d0c0' : (x % 2 ? '#a84a40' : '#4a6a8a'));
        px(g, ox + 2, oy + 7, 4, 3, '#c8603a'); px(g, ox + 8, oy + 7, 4, 3, '#e8c060');
        break;
      case 'x': px(g, ox + 2, oy + 3, 12, 12, '#7a5a38'); px(g, ox + 2, oy + 3, 12, 2, '#9a7448'); px(g, ox + 2, oy + 8, 12, 1, '#4a3420'); px(g, ox + 7, oy + 3, 1, 12, '#4a3420'); break;
      case 'v': {
        px(g, ox, oy, TS, TS, '#08070c');
        if (hash(x, y, 4) > 0.6) px(g, ox + 4, oy + 4, 8, 8, '#14121c');
        g.strokeStyle = 'rgba(154,138,216,0.12)';
        g.strokeRect(ox + 0.5, oy + 0.5, TS - 1, TS - 1);
        break;
      }
      case 'V':
        for (let i = 0; i < 3; i++) px(g, ox + Math.floor(hash(x, y, i) * 11), oy + Math.floor(hash(y, x, i) * 11), 5, 5, '#08070c');
        break;
      case 'p': px(g, ox + 3, oy, 10, TS, '#8a8690'); px(g, ox + 3, oy, 3, TS, '#a8a4ae'); px(g, ox + 2, oy, 12, 2, '#6a6670'); px(g, ox + 2, oy + 14, 12, 2, '#6a6670'); break;
      case 'g': {
        px(g, ox, oy, TS, TS, th.wall);
        g.fillStyle = '#9a7a3a';
        g.beginPath(); g.arc(ox + 8, oy + 8, 6, 0, Math.PI * 2); g.fill();
        for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; px(g, ox + 7 + Math.round(Math.cos(a) * 7), oy + 7 + Math.round(Math.sin(a) * 7), 2, 2, '#9a7a3a'); }
        g.fillStyle = th.wall; g.beginPath(); g.arc(ox + 8, oy + 8, 2.5, 0, Math.PI * 2); g.fill();
        break;
      }
      case 'S':
        for (let i = 0; i < 4; i++) px(g, ox, oy + i * 4, TS, 4, shadeColor(th.floor, 20 - i * 10));
        for (let i = 0; i < 4; i++) px(g, ox, oy + i * 4 + 3, TS, 1, 'rgba(0,0,0,0.3)');
        break;
      case 'k': px(g, ox, oy, TS, TS, '#8a847a'); px(g, ox, oy, TS, 2, '#6a6458'); px(g, ox, oy + 14, TS, 2, '#6a6458'); for (let i = 0; i < 4; i++) px(g, ox + i * 4, oy + 2, 1, 12, 'rgba(0,0,0,0.12)'); px(g, ox + 6, oy, 4, 2, '#c8a040'); break;
      case 'G':
        px(g, ox, oy, TS, TS, '#2a2228');
        for (let i = 0; i < 4; i++) px(g, ox + 1 + i * 4, oy, 2, TS, '#5a5a64');
        px(g, ox, oy + 3, TS, 2, '#5a5a64'); px(g, ox, oy + 11, TS, 2, '#5a5a64');
        break;
      case 'Y': {
        const left = at(x - 1, y) !== 'Y';
        const top = at(x, y - 1) !== 'Y';
        if (left && top) {
          g.fillStyle = '#8a6a2e';
          g.beginPath(); g.moveTo(ox + 6, oy + 2); g.lineTo(ox + 26, oy + 2); g.quadraticCurveTo(ox + 30, oy + 20, ox + 31, oy + 28); g.lineTo(ox + 1, oy + 28); g.quadraticCurveTo(ox + 2, oy + 20, ox + 6, oy + 2); g.fill();
          px(g, ox + 1, oy + 26, 30, 3, '#6a4e20');
          px(g, ox + 8, oy + 6, 3, 16, 'rgba(255,230,160,0.25)');
          px(g, ox + 14, oy - 2, 4, 4, '#3a3036');
        }
        break;
      }
      case 'q': px(g, ox + 4, oy + 10, 8, 6, '#6a6670'); px(g, ox + 5, oy + 1, 6, 10, '#8a8690'); px(g, ox + 6, oy + 2, 4, 3, '#a8a4ae'); break;
      case 'a': px(g, ox + 2, oy + 6, 12, 10, '#7a7680'); px(g, ox + 2, oy + 6, 12, 2, '#9a96a0'); px(g, ox + 7, oy + 2, 2, 5, '#f0f0f0'); px(g, ox + 6, oy + 1, 4, 2, '#ffffff'); break;
    }
  }
  return cv;
}

/** 歩けない地形かどうか（描画とは別に、当たり判定は data/maps の WALKABLE を使う） */
export function isWaterLike(ch: string): boolean {
  return ch === '~';
}

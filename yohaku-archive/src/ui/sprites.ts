// キャラクター・敵・地形をキャンバスに描く（画像ファイルを使わず、すべてコードで描画）
export interface Palette { H: string; S: string; E: string; C: string; c: string; P: string; B: string; A: string; long?: boolean; beard?: boolean; kid?: boolean; ghost?: boolean }

export const PALETTES: Record<string, Palette> = {
  seil: { H: '#2f2a44', S: '#f0d2b4', E: '#1a1a22', C: '#56708e', c: '#3f546c', P: '#33343f', B: '#2a221c', A: '#e2b45e' },
  dran: { H: '#6a5844', S: '#d8b08a', E: '#1a1a22', C: '#6e4f38', c: '#523a28', P: '#3a3a30', B: '#2a221c', A: '#9a9a9a', beard: true },
  held: { H: '#cfcfcf', S: '#ecc8a8', E: '#1a1a22', C: '#4a4a5c', c: '#383848', P: '#2e2e38', B: '#222', A: '#8a7a5a', beard: true },
  kora: { H: '#a8704a', S: '#f2d0b2', E: '#1a1a22', C: '#8a6a88', c: '#6c506a', P: '#4a3a4a', B: '#2a221c', A: '#ece4d4', long: true },
  marta: { H: '#c0603c', S: '#f2d0b2', E: '#1a1a22', C: '#ebe0c6', c: '#c9b996', P: '#6a4a3a', B: '#2a221c', A: '#c04a40' },
  peck: { H: '#2c2c2c', S: '#e0b890', E: '#1a1a22', C: '#5a7a4a', c: '#45603a', P: '#3a3a30', B: '#2a221c', A: '#d0c080' },
  orne: { H: '#707a8a', S: '#ecc8a8', E: '#1a1a22', C: '#4a5a7a', c: '#3a4860', P: '#2e2e38', B: '#222', A: '#d8d8d8' },
  neri: { H: '#e2cc94', S: '#f4d8be', E: '#1a1a22', C: '#e0e8e0', c: '#b8c4b8', P: '#7a8a7a', B: '#4a4a40', A: '#ffffff', long: true },
  timo: { H: '#a0502e', S: '#f2d0b2', E: '#1a1a22', C: '#d08040', c: '#a8622e', P: '#4a5a7a', B: '#2a221c', A: '#f0e070', kid: true },
  pirika: { H: '#e07040', S: '#f2d0b2', E: '#1a1a22', C: '#806040', c: '#634a30', P: '#4a3a2a', B: '#2a221c', A: '#d8b440' },
  bold: { H: '#e6e6e6', S: '#e0b896', E: '#1a1a22', C: '#706050', c: '#58483a', P: '#3a3a30', B: '#2a221c', A: '#a08060', beard: true },
  hanna: { H: '#50302c', S: '#f0cdb0', E: '#1a1a22', C: '#8a3a3a', c: '#6c2c2c', P: '#3a2a2a', B: '#2a221c', A: '#e8d8b0', long: true },
  garth: { H: '#5a4030', S: '#e0b896', E: '#1a1a22', C: '#4a5c4a', c: '#384838', P: '#33382f', B: '#222', A: '#c8a440' },
  towa: { H: '#c8d2ea', S: '#f6e2d4', E: '#55607a', C: '#eceef8', c: '#c8cce0', P: '#d8dcec', B: '#a8acc0', A: '#9ab0e0', long: true, kid: true },
  mina: { H: '#3f7466', S: '#f0d2b4', E: '#1a1a22', C: '#3a5a50', c: '#2a443c', P: '#2a3430', B: '#1e2420', A: '#c8e0a0', long: true },
  lume: { H: '#806090', S: '#f0d0b0', E: '#1a1a22', C: '#a07040', c: '#80582e', P: '#4a3a30', B: '#2a221c', A: '#e0c070' },
  citizen: { H: '#504030', S: '#e8c4a0', E: '#1a1a22', C: '#7a7a6a', c: '#5e5e50', P: '#3a3a30', B: '#2a221c', A: '#b0a080' },
  citizen2: { H: '#303040', S: '#e8c4a0', E: '#1a1a22', C: '#6a5a4a', c: '#524436', P: '#33333a', B: '#222', A: '#a0a0b0' },
};

const BODY_DOWN = [
  '....OOOO....', '...OHHHHO...', '..OHHHHHHO..', '..OHHHHHHO..', '..OHSSSSHO..', '..OSESSESO..', '..OSSSSSSO..', '...OSSSSO...',
  '..OCCAACCO..', '.OCCCAACCCO.', '.OSCCCCCCSO.', '.OSCCCCCCSO.', '..OCCCCCCO..', '..OccccccO..',
];
const BODY_UP = [
  '....OOOO....', '...OHHHHO...', '..OHHHHHHO..', '..OHHHHHHO..', '..OHHHHHHO..', '..OHHHHHHO..', '..OHHHHHHO..', '...OSSSSO...',
  '..OCCCCCCO..', '.OCCCCCCCCO.', '.OSCCCCCCSO.', '.OSCCCCCCSO.', '..OCCCCCCO..', '..OccccccO..',
];
const BODY_SIDE = [
  '....OOOO....', '...OHHHHO...', '..OHHHHHHO..', '..OHHHHHHO..', '..OSSHHHHO..', '..OESSHHHO..', '..OSSSSSHO..', '...OSSSSO...',
  '...OCCCCO...', '..OCCCACCO..', '..OSCCCCCO..', '..OSCCCCCO..', '...OCCCCO...', '...OccccO...',
];
const LEGS_STAND = ['...OPPPPO...', '...OPOOPO...', '...OBOOBO...', '...OO..OO...'];
const LEGS_A = ['...OPPPPO...', '..OPO.OPO...', '..OBO..OBO..', '..OO....OO..'];
const LEGS_B = ['...OPPPPO...', '...OPO.OPO..', '..OBO..OBO..', '..OO....OO..'];
const LEGS_SIDE = ['...OPPPO....', '...OPOPO....', '...OBOBO....', '...OOOOO....'];
const LEGS_SIDE_A = ['...OPPPO....', '..OPO.OPO...', '..OBO.OBO...', '..OO..OO....'];

const spriteCache = new Map<string, HTMLCanvasElement>();

/** dir: 0上 1右 2下 3左, frame: 0〜3 */
export function charSprite(key: string, dir: number, frame: number): HTMLCanvasElement {
  const ck = `${key}:${dir}:${frame}`;
  const hit = spriteCache.get(ck);
  if (hit) return hit;
  const pal = PALETTES[key] ?? PALETTES.citizen;
  const body = dir === 0 ? BODY_UP : dir === 2 ? BODY_DOWN : BODY_SIDE;
  const side = dir === 1 || dir === 3;
  const step = frame % 2 === 1 ? (frame === 1 ? 'A' : 'B') : '';
  const legs = side ? (step ? LEGS_SIDE_A : LEGS_SIDE) : step === 'A' ? LEGS_A : step === 'B' ? LEGS_B : LEGS_STAND;
  const rows = [...body, ...legs].map(r => r.split(''));
  if (pal.long) {
    for (let y = 4; y <= 10; y++) {
      if (dir === 2) { if (rows[y][1] === '.' || rows[y][1] === 'O') rows[y][1] = 'H'; if (rows[y][10] === '.' || rows[y][10] === 'O') rows[y][10] = 'H'; rows[y][2] = rows[y][2] === 'O' ? 'H' : rows[y][2]; rows[y][9] = rows[y][9] === 'O' ? 'H' : rows[y][9]; }
      if (dir === 0) for (let x = 2; x <= 9; x++) if (y <= 10 && rows[y][x] !== '.' && rows[y][x] !== 'O') rows[y][x] = 'H';
      if (side && y <= 9) { rows[y][8] = 'H'; rows[y][9] = 'H'; }
    }
  }
  if (pal.beard && dir === 2) { rows[6][4] = 'b'; rows[6][5] = 'b'; rows[6][6] = 'b'; rows[6][7] = 'b'; rows[7][5] = 'b'; rows[7][6] = 'b'; }
  if (pal.beard && side) { rows[6][3] = 'b'; rows[6][4] = 'b'; rows[7][4] = 'b'; }
  const W = 12, Hh = rows.length;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = Hh;
  const g = cv.getContext('2d')!;
  const colors: Record<string, string> = { O: '#14121a', H: pal.H, S: pal.S, E: pal.E, C: pal.C, c: pal.c, P: pal.P, B: pal.B, A: pal.A, b: pal.H };
  for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) {
    const ch = rows[y][dir === 1 ? W - 1 - x : x];
    if (ch === '.') continue;
    g.fillStyle = colors[ch] ?? '#f0f';
    g.fillRect(x, y, 1, 1);
  }
  spriteCache.set(ck, cv);
  return cv;
}

// ---------- 敵 ----------

/** 欠因の表現：四角い欠けを描く */
function holes(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, n: number, seed: number, t: number) {
  let s = seed;
  const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = 0; i < n; i++) {
    const hx = x + r() * w, hy = y + r() * h, hs = (0.05 + r() * 0.08) * Math.min(w, h);
    if (Math.sin(t * 1.3 + i) > -0.6) g.clearRect(Math.round(hx), Math.round(hy), Math.ceil(hs), Math.ceil(hs));
  }
}

export function drawEnemy(g: CanvasRenderingContext2D, art: string, cx: number, cy: number, size: number, t: number, seed = 1): void {
  const s = size;
  g.save();
  g.translate(cx, cy);
  const bob = Math.sin(t * 2.4 + seed) * s * 0.03;
  g.translate(0, bob);
  g.lineJoin = 'round';
  switch (art) {
    case 'moth': {
      const flap = Math.sin(t * 9 + seed) * 0.25 + 0.85;
      g.fillStyle = '#e8e4da';
      for (const sx of [-1, 1]) {
        g.beginPath();
        g.ellipse(sx * s * 0.22 * flap, -s * 0.06, s * 0.24 * flap, s * 0.18, sx * 0.4, 0, Math.PI * 2);
        g.fill();
        g.beginPath();
        g.ellipse(sx * s * 0.16 * flap, s * 0.14, s * 0.15 * flap, s * 0.12, -sx * 0.3, 0, Math.PI * 2);
        g.fill();
      }
      g.fillStyle = '#5c5648';
      g.fillRect(-s * 0.04, -s * 0.2, s * 0.08, s * 0.42);
      g.strokeStyle = '#5c5648'; g.lineWidth = s * 0.02;
      g.beginPath(); g.moveTo(-s * 0.02, -s * 0.2); g.lineTo(-s * 0.1, -s * 0.32); g.moveTo(s * 0.02, -s * 0.2); g.lineTo(s * 0.1, -s * 0.32); g.stroke();
      g.fillStyle = '#14121a';
      for (const sx of [-1, 1]) g.fillRect(sx * s * 0.24 * flap - s * 0.05, -s * 0.1, s * 0.1, s * 0.1);
      break;
    }
    case 'eater': {
      g.fillStyle = '#2a2433';
      g.beginPath(); g.ellipse(0, s * 0.08, s * 0.32, s * 0.24, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#3c3448';
      g.beginPath(); g.ellipse(-s * 0.06, 0, s * 0.2, s * 0.14, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#f2ead8';
      for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(-s * 0.18 + i * s * 0.09, s * 0.14); g.lineTo(-s * 0.14 + i * s * 0.09, s * 0.24); g.lineTo(-s * 0.1 + i * s * 0.09, s * 0.14); g.fill(); }
      g.fillStyle = '#e2b45e';
      g.fillRect(-s * 0.16, -s * 0.04, s * 0.07, s * 0.07); g.fillRect(s * 0.08, -s * 0.04, s * 0.07, s * 0.07);
      break;
    }
    case 'shade': {
      const grd = g.createLinearGradient(0, -s * 0.4, 0, s * 0.4);
      grd.addColorStop(0, 'rgba(20,16,30,0.95)'); grd.addColorStop(1, 'rgba(20,16,30,0.1)');
      g.fillStyle = grd;
      g.beginPath();
      g.moveTo(0, -s * 0.42);
      g.bezierCurveTo(s * 0.3, -s * 0.38, s * 0.28, 0, s * 0.34, s * 0.4);
      for (let i = 0; i < 6; i++) g.lineTo(s * 0.34 - (i + 0.5) * s * 0.113, s * (i % 2 ? 0.4 : 0.28));
      g.lineTo(-s * 0.34, s * 0.4);
      g.bezierCurveTo(-s * 0.28, 0, -s * 0.3, -s * 0.38, 0, -s * 0.42);
      g.fill();
      g.fillStyle = '#d8d0ff';
      g.fillRect(-s * 0.12, -s * 0.2, s * 0.06, s * 0.03); g.fillRect(s * 0.06, -s * 0.2, s * 0.06, s * 0.03);
      break;
    }
    case 'beast': {
      g.fillStyle = '#3a3040';
      g.beginPath(); g.ellipse(0, s * 0.02, s * 0.36, s * 0.2, 0, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(s * 0.3, -s * 0.12, s * 0.15, s * 0.13, 0, 0, Math.PI * 2); g.fill();
      g.fillRect(-s * 0.3, s * 0.1, s * 0.08, s * 0.26); g.fillRect(-s * 0.12, s * 0.12, s * 0.08, s * 0.24);
      g.fillRect(s * 0.08, s * 0.12, s * 0.08, s * 0.24); g.fillRect(s * 0.22, s * 0.1, s * 0.08, s * 0.26);
      // 断絶の亀裂
      g.strokeStyle = '#e0607a'; g.lineWidth = s * 0.025;
      g.beginPath(); g.moveTo(-s * 0.1, -s * 0.18); g.lineTo(-s * 0.02, -s * 0.02); g.lineTo(-s * 0.1, s * 0.06); g.lineTo(0, s * 0.18); g.stroke();
      g.fillStyle = '#ffd070';
      g.fillRect(s * 0.33, -s * 0.16, s * 0.05, s * 0.05);
      g.fillStyle = '#e8e0d0';
      g.beginPath(); g.moveTo(s * 0.4, -s * 0.06); g.lineTo(s * 0.46, s * 0.0); g.lineTo(s * 0.38, s * 0.0); g.fill();
      break;
    }
    case 'sentinel': {
      g.fillStyle = '#8a6a3a';
      g.fillRect(-s * 0.18, -s * 0.3, s * 0.36, s * 0.5);
      g.fillStyle = '#b08848';
      g.fillRect(-s * 0.14, -s * 0.26, s * 0.28, s * 0.18);
      g.strokeStyle = '#3a2a18'; g.lineWidth = s * 0.02;
      g.beginPath(); g.arc(0, -s * 0.17, s * 0.07, 0, Math.PI * 2); g.stroke();
      const a = t * 2;
      g.beginPath(); g.moveTo(0, -s * 0.17); g.lineTo(Math.cos(a) * s * 0.06, -s * 0.17 + Math.sin(a) * s * 0.06); g.stroke();
      g.fillStyle = '#6a5030';
      g.fillRect(-s * 0.32, -s * 0.2, s * 0.12, s * 0.08); g.fillRect(s * 0.2, -s * 0.2, s * 0.12, s * 0.08);
      g.save(); g.translate(s * 0.3, -s * 0.12); g.rotate(Math.sin(t * 3) * 0.5);
      g.fillStyle = '#9a9aa8'; g.fillRect(-s * 0.02, 0, s * 0.04, s * 0.3); g.beginPath(); g.arc(0, s * 0.32, s * 0.07, 0, Math.PI * 2); g.fill();
      g.restore();
      g.fillStyle = '#5a4428';
      g.fillRect(-s * 0.14, s * 0.2, s * 0.1, s * 0.18); g.fillRect(s * 0.04, s * 0.2, s * 0.1, s * 0.18);
      break;
    }
    case 'attendant': {
      g.fillStyle = '#7a7884';
      g.beginPath(); g.moveTo(0, -s * 0.36); g.lineTo(s * 0.24, s * 0.4); g.lineTo(-s * 0.24, s * 0.4); g.closePath(); g.fill();
      g.fillStyle = '#d8d4cc';
      g.beginPath(); g.ellipse(0, -s * 0.26, s * 0.1, s * 0.12, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#5a5864';
      g.fillRect(-s * 0.16, s * 0.0, s * 0.32, s * 0.04);
      break;
    }
    case 'shelf': {
      g.fillStyle = '#4a3424';
      g.fillRect(-s * 0.34, -s * 0.42, s * 0.68, s * 0.84);
      g.fillStyle = '#2a1e14';
      for (let r = 0; r < 4; r++) g.fillRect(-s * 0.3, -s * 0.38 + r * s * 0.2, s * 0.6, s * 0.16);
      const cols = ['#e8e4da', '#d8d0c0', '#f0ece4'];
      for (let r = 0; r < 4; r++) for (let i = 0; i < 7; i++) {
        if ((r * 7 + i + seed) % 4 === 0) continue;
        g.fillStyle = cols[(r + i) % 3];
        g.fillRect(-s * 0.29 + i * s * 0.083, -s * 0.36 + r * s * 0.2 + ((i * 3) % 2) * s * 0.02, s * 0.07, s * 0.14 - ((i * 3) % 2) * s * 0.02);
      }
      g.fillStyle = 'rgba(240,236,228,0.9)';
      for (let i = 0; i < 3; i++) {
        const px = Math.sin(t * 1.4 + i * 2) * s * 0.4, py = -s * 0.5 + ((t * 0.3 + i * 0.33) % 1) * s;
        g.save(); g.translate(px, py); g.rotate(t + i); g.fillRect(-s * 0.04, -s * 0.03, s * 0.08, s * 0.06); g.restore();
      }
      break;
    }
    case 'king': {
      g.fillStyle = '#6a6a74';
      g.beginPath(); g.moveTo(-s * 0.3, s * 0.42); g.lineTo(-s * 0.22, -s * 0.12); g.lineTo(s * 0.22, -s * 0.12); g.lineTo(s * 0.3, s * 0.42); g.fill();
      g.fillStyle = '#84848e';
      g.beginPath(); g.ellipse(0, -s * 0.22, s * 0.13, s * 0.14, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#c8a440';
      g.beginPath(); g.moveTo(-s * 0.13, -s * 0.32); g.lineTo(-s * 0.13, -s * 0.44); g.lineTo(-s * 0.06, -s * 0.37); g.lineTo(0, -s * 0.46); g.lineTo(s * 0.06, -s * 0.37); g.lineTo(s * 0.13, -s * 0.44); g.lineTo(s * 0.13, -s * 0.32); g.fill();
      g.fillStyle = '#3a3a44';
      g.fillRect(-s * 0.06, -s * 0.24, s * 0.12, s * 0.02);
      // 抱えた鐘の舌
      g.fillStyle = '#a07a3a';
      g.beginPath(); g.ellipse(0, s * 0.12, s * 0.07, s * 0.14, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#5a5a64';
      g.fillRect(-s * 0.22, s * 0.04, s * 0.44, s * 0.06);
      break;
    }
  }
  if (art !== 'moth' && art !== 'shade') holes(g, -s * 0.36, -s * 0.42, s * 0.72, s * 0.84, art === 'king' ? 7 : 4, seed * 31 + art.length, t);
  g.restore();
}

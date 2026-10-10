// マップのタイル（16×16）と人物（16×16、4方向×2コマ）のドット絵
import { E, P, Pix, R, RR, flipH, shade } from './Pix';

export const TILE = 16;
export type Theme = 'town' | 'forest' | 'cave' | 'highland';

const PAL: Record<Theme, { floor: string; floor2: string; wall: string; wallHi: string; wallLo: string; water: string; dot: string }> = {
  town: { floor: '#7cc860', floor2: '#6ab850', wall: '#3a8a3a', wallHi: '#5ab050', wallLo: '#235a23', water: '#4a90e0', dot: '#a8e080' },
  forest: { floor: '#78c058', floor2: '#68b048', wall: '#2e7a32', wallHi: '#4aa848', wallLo: '#1a4a20', water: '#3a80d0', dot: '#a0d878' },
  cave: { floor: '#8a7a6a', floor2: '#7a6a5a', wall: '#4a4048', wallHi: '#6a6070', wallLo: '#2a2228', water: '#2a5a9a', dot: '#a09080' },
  highland: { floor: '#b8c868', floor2: '#a8b858', wall: '#a08058', wallHi: '#c8a878', wallLo: '#6a5038', water: '#4aa0e0', dot: '#d8e090' },
};

// 決まった位置にだけ小さな模様を置く（見た目のばらつき）
const hash = (x: number, y: number) => ((x * 73856093) ^ (y * 19349663)) >>> 0;

function floorTile(p: Pix, th: Theme, x: number, y: number, deco: boolean) {
  const c = PAL[th];
  p.rect(0, 0, 16, 16, c.floor);
  const h = hash(x, y);
  for (let i = 0; i < 5; i++) {
    const px = (h >> (i * 5)) % 16, py = (h >> (i * 3 + 2)) % 16;
    p.px(px, py, i % 2 ? c.floor2 : c.dot);
  }
  if (th === 'forest' || th === 'town' || th === 'highland') {
    const tx = h % 12 + 2, ty = (h >> 8) % 12 + 2;
    p.px(tx, ty, c.floor2); p.px(tx + 2, ty, c.floor2); p.px(tx + 1, ty - 1, c.floor2);
  }
  if (deco) {
    if (th === 'cave') {
      for (const [dx, dy] of [[3, 4], [10, 9], [6, 12]]) p.part(E(dx, dy, 1.5, 1), '#9a8a7a');
    } else {
      const cols = ['#ff7aa0', '#fff070', '#ffffff', '#a0a0ff'];
      for (let i = 0; i < 3; i++) {
        const fx = 2 + ((h >> (i * 4)) % 12), fy = 2 + ((h >> (i * 4 + 2)) % 12);
        const col = cols[(h >> i) % cols.length];
        p.px(fx, fy, col); p.px(fx - 1, fy, col); p.px(fx + 1, fy, col); p.px(fx, fy - 1, col); p.px(fx, fy + 1, '#f0d040');
        p.px(fx, fy, '#f0d040');
      }
    }
  }
}

function pathTile(p: Pix, x: number, y: number) {
  p.rect(0, 0, 16, 16, '#d8c090');
  const h = hash(x, y);
  for (let i = 0; i < 4; i++) p.part(RR(((h >> (i * 4)) % 12), ((h >> (i * 4 + 2)) % 12), 4, 3, 1), '#c8b080', { flat: true, ol: '#b09868' });
}

function wallTile(p: Pix, th: Theme, x: number, y: number) {
  const c = PAL[th];
  if (th === 'forest' || th === 'town') {
    floorTile(p, th, x, y, false);
    p.part(R(7, 11, 3, 4), '#7a5030');
    p.part(E(8, 7, 7, 6.5), c.wall, { hi: c.wallHi, lo: c.wallLo });
    const h = hash(x, y);
    if (h % 3 === 0) { p.px(5, 5, '#ff5050'); p.px(10, 8, '#ff5050'); }
  } else if (th === 'cave') {
    p.rect(0, 0, 16, 16, c.wall);
    p.part(RR(0, 0, 9, 7, 2), c.wall, { hi: c.wallHi, lo: c.wallLo, ol: c.wallLo });
    p.part(RR(8, 2, 8, 7, 2), c.wall, { hi: c.wallHi, lo: c.wallLo, ol: c.wallLo });
    p.part(RR(2, 8, 10, 8, 2), c.wall, { hi: c.wallHi, lo: c.wallLo, ol: c.wallLo });
  } else {
    p.rect(0, 0, 16, 16, c.wall);
    p.part(P(0, 16, 3, 2, 9, 0, 16, 4, 16, 16), c.wall, { hi: c.wallHi, lo: c.wallLo, ol: c.wallLo });
    p.hline(2, 13, 9, c.wallLo); p.hline(4, 15, 13, c.wallLo);
  }
}

function waterTile(p: Pix, th: Theme, frame: number) {
  const c = PAL[th].water;
  p.rect(0, 0, 16, 16, c);
  for (let i = 0; i < 3; i++) {
    const y = (i * 5 + frame) % 16, x = (i * 7) % 12;
    p.hline(x, x + 3, y, shade(c, 1.4));
  }
}

function chestTile(p: Pix, th: Theme, x: number, y: number, open: boolean) {
  floorTile(p, th, x, y, false);
  if (open) {
    p.part(RR(2, 7, 12, 7, 1), '#8a5020', { flat: true });
    p.part(R(3, 8, 10, 3), '#3a2010', { flat: true, noOl: true });
    p.part(RR(2, 3, 12, 4, 1), '#b07030');
  } else {
    p.part(RR(2, 4, 12, 10, 2), '#c07a30', { hi: '#e8a050' });
    p.hline(2, 13, 8, '#6a3a10');
    p.part(R(7, 7, 2, 3), '#f0d040', { flat: true });
  }
}

function portalTile(p: Pix, th: Theme, x: number, y: number, frame: number, col = '#4ab0ff') {
  floorTile(p, th, x, y, false);
  p.part(E(8, 8, 6.5, 5.5), shade(col, 0.6), { flat: true });
  for (let i = 0; i < 3; i++) {
    const a = (frame * 0.6 + i * 2.1);
    const r = 4 - i;
    p.px(8 + Math.round(Math.cos(a) * r * 1.2), 8 + Math.round(Math.sin(a) * r), '#ffffff');
    p.px(8 + Math.round(Math.cos(a + 3.1) * r * 1.2), 8 + Math.round(Math.sin(a + 3.1) * r), shade(col, 1.5));
  }
  p.part(E(8, 8, 2, 1.5), shade(col, 1.6), { flat: true, noOl: true });
}

function springTile(p: Pix, th: Theme, x: number, y: number, frame: number, used: boolean) {
  floorTile(p, th, x, y, false);
  p.part(E(8, 9, 7, 5), used ? '#6a8aa0' : '#5ac8f0', { hi: '#c0f0ff', ol: '#8a8a9a' });
  if (!used) { const s = frame % 4; p.px(5 + s, 7, '#ffffff'); p.px(11 - s, 10, '#ffffff'); }
}

function roofTile(p: Pix, x: number) {
  p.rect(0, 0, 16, 16, '#c84a3a');
  for (let y = 3; y < 16; y += 4) p.hline(0, 15, y, '#8a2a20');
  for (let y = 0; y < 16; y += 4) for (let i = (y / 4) % 2 ? 0 : 4; i < 16; i += 8) p.px(i + (x % 2), y + 1, '#e87a60');
}
function houseWallTile(p: Pix, x: number) {
  p.rect(0, 0, 16, 16, '#f0e0c0');
  p.hline(0, 15, 15, '#b0a080');
  if (x % 2 === 0) { p.part(R(4, 4, 8, 7), '#7ac0e8', { flat: true, ol: '#6a5030' }); p.hline(4, 11, 7, '#6a5030'); }
}
function counterTile(p: Pix) {
  p.rect(0, 0, 16, 16, '#f0e0c0');
  p.part(R(0, 9, 16, 7), '#a06a30', { hi: '#c8904a' });
}
function fountainTile(p: Pix, frame: number) {
  pathTile(p, 0, 0);
  p.part(E(8, 9, 7.5, 6), '#a0a8b8', { hi: '#e0e8f0' });
  p.part(E(8, 9, 5.5, 4), '#5ab8f0', { flat: true, ol: '#8090a0' });
  p.part(R(7, 2, 2, 7), '#c0c8d8');
  const s = frame % 3;
  p.px(6 - s, 3 + s, '#c0f0ff'); p.px(10 + s, 3 + s, '#c0f0ff'); p.px(8, 1, '#ffffff');
}

const cache = new Map<string, HTMLCanvasElement>();
/** タイルの絵（座標は模様のばらつき用、frame はアニメ用） */
export function tileSprite(th: Theme, ch: string, x: number, y: number, frame: number, state: { open?: boolean; used?: boolean } = {}): HTMLCanvasElement {
  const anim = ch === '~' || ch === '>' || ch === 'G' || ch === 'E' || ch === 'H' || ch === 'F';
  const variant = ch === '.' || ch === ',' || ch === '#' || ch === 'T' || ch === 'C' || ch === 'S' || ch === 'P' || /[0-9]/.test(ch) || ch === 'H' || ch === 'R' || ch === 'W';
  const f = anim ? frame % 8 : 0;
  const key = `${th}|${ch}|${variant ? `${x % 4},${y % 4}` : ''}|${f}|${state.open ? 1 : 0}${state.used ? 1 : 0}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const p = new Pix(16, 16);
  const vx = x % 4, vy = y % 4;
  switch (ch) {
    case '#': case 'T': wallTile(p, th, vx, vy); break;
    case '~': waterTile(p, th, f); break;
    case ',': floorTile(p, th, vx, vy, true); break;
    case 'C': chestTile(p, th, vx, vy, !!state.open); break;
    case '>': portalTile(p, th, vx, vy, f); break;
    case 'G': portalTile(p, 'town', vx, vy, f, '#b070ff'); break;
    case 'E': portalTile(p, th, vx, vy, f, '#ffd040'); break;
    case 'H': springTile(p, th, vx, vy, f, !!state.used); break;
    case 'R': roofTile(p, vx); break;
    case 'W': houseWallTile(p, vx); break;
    case 'F': fountainTile(p, f); break;
    default:
      if (ch === 'K') counterTile(p);
      else if (th === 'town' && (ch === '.' || ch === 'P' || /[0-9]/.test(ch))) pathTile(p, vx, vy);
      else floorTile(p, th, vx, vy, false);
  }
  const c = p.canvas();
  cache.set(key, c);
  return c;
}

// ---------------------------------------------------------------- 人物
export type PersonLook = { hair: string; skin?: string; top: string; bottom: string; hat?: string; beard?: boolean; scarf?: string; bald?: boolean; braid?: boolean; staff?: boolean };
export type Facing = 'down' | 'up' | 'left' | 'right';

export const LOOKS: Record<string, PersonLook> = {
  hero: { hair: '#7a4a2a', top: '#2a9a8a', bottom: '#3a4a6a', scarf: '#e04a3a' },
  doctor: { hair: '#f0f0f0', top: '#7a5ab0', bottom: '#5a3a8a', beard: true, staff: true },
  lily: { hair: '#f0c860', top: '#f07aa0', bottom: '#f8f0e0', hat: '#ff9ac0', braid: true },
  shop: { hair: '#5a3a2a', top: '#e0e0d0', bottom: '#5a7a3a', bald: true },
  arena: { hair: '#2a2a3a', top: '#3a5ab0', bottom: '#2a3a7a', hat: '#3a5ab0' },
  guard: { hair: '#4a3a2a', top: '#a0a8b8', bottom: '#5a6070', hat: '#c0c8d8' },
  kid: { hair: '#3a2a1a', top: '#f0a030', bottom: '#4a6ab0', hat: '#e04040' },
  granny: { hair: '#d0d0d8', top: '#a07a5a', bottom: '#7a5a4a' },
  scribe: { hair: '#6a4a3a', top: '#4a8a5a', bottom: '#3a5a4a', hat: '#4a8a5a' },
};

function drawPerson(L: PersonLook, dir: Facing, frame: number): Pix {
  const p = new Pix(16, 16);
  const skin = L.skin ?? '#f8d0a8';
  const ol = '#2a1a20';
  const step = frame % 2;
  // あし
  if (dir === 'left' || dir === 'right') {
    p.rect(5 + step, 13, 2, 3, L.bottom); p.rect(9 - step, 13, 2, 3, L.bottom);
  } else {
    p.rect(5, 13, 2, step ? 2 : 3, L.bottom); p.rect(9, 13, 2, step ? 3 : 2, L.bottom);
  }
  // からだ
  p.part(RR(4, 8, 8, 6, 2), L.top, { ol });
  if (L.staff) { p.line(13, 4, 13, 15, '#8a5a2a'); p.px(13, 3, '#60e0ff'); }
  // あたま
  p.part(E(8, 5.5, 4.5, 4.2), skin, { ol, flat: true });
  if (!L.bald) {
    if (dir === 'up') p.part(E(8, 5, 4.6, 4.3), L.hair, { ol });
    else {
      p.part(P(3, 6, 4, 1, 8, 0, 12, 1, 13, 6, 11, 3, 8, 4, 5, 3), L.hair, { ol });
      if (dir === 'left') p.part(R(9, 2, 4, 5), L.hair, { flat: true, ol });
      if (dir === 'right') p.part(R(3, 2, 4, 5), L.hair, { flat: true, ol });
    }
  }
  if (L.hat) p.part(RR(3, 0, 10, 3, 1), L.hat, { ol });
  if (L.braid && dir !== 'right') p.part(E(3, 9, 1.5, 2.5), L.hair, { ol });
  if (L.scarf) { p.rect(4, 8, 8, 2, L.scarf); if (dir !== 'down') p.rect(dir === 'left' ? 11 : dir === 'right' ? 3 : 7, 9, 2, 3, L.scarf); }
  if (dir !== 'up') {
    const ex = dir === 'left' ? [5, 8] : dir === 'right' ? [8, 11] : [6, 10];
    for (const x of ex) { p.px(x, 6, '#20202a'); p.px(x, 7, '#20202a'); }
    if (L.beard) p.part(E(8, 9, 3, 2.5), '#f0f0f0', { ol: '#a0a0a0' });
  }
  return p;
}

const pcache = new Map<string, HTMLCanvasElement>();
export function personSprite(look: string, dir: Facing, frame: number): HTMLCanvasElement {
  const key = `${look}|${dir}|${frame % 2}`;
  const hit = pcache.get(key);
  if (hit) return hit;
  const L = LOOKS[look] ?? LOOKS.kid;
  let c: HTMLCanvasElement;
  if (dir === 'right') c = flipH(personSprite(look, 'left', frame));
  else c = drawPerson(L, dir, frame).canvas();
  pcache.set(key, c);
  return c;
}

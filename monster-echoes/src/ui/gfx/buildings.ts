// まちの たてもの（外観）。ばしょごとに 屋根・かべ・とびら・かんばんが ちがう。
import { E, P, Pix, R, RR, Sub, mix } from './Pix';

export type BuildingStyle = 'lab' | 'ranch' | 'shop' | 'arena' | 'shrine';
export type BldState = { style: BuildingStyle; /** たてものの ひだりはしから 何タイル目か */ rel: number; /** たてものの はば */ w: number; /** かんばんを かける タイルか */ sign?: boolean; /** とびらの 位置か */ door?: boolean };

const h2 = (x: number, y: number) => {
  let n = (x * 374761393 + y * 668265263) | 0;
  n = Math.imul(n ^ (n >>> 13), 1274126177);
  return ((n ^ (n >>> 16)) >>> 0) / 4294967296;
};
const OL = '#1c1424';

/** かんばん（とびらの うえに かかる） */
function emblem(p: Pix, st: BuildingStyle) {
  // くさりと ばんの わく
  p.rect(5, 0, 0.8, 3.5, '#3a2a1a'); p.rect(10.2, 0, 0.8, 3.5, '#3a2a1a');
  p.part(RR(2.5, 3, 11, 10, 1.6), '#f6e8c4', { ol: '#4a2e14', hi: '#fffbe8' });
  p.part(RR(3.4, 3.9, 9.2, 8.2, 1), mix('#f6e8c4', '#c8a870', 0.25), { flat: true, noOl: true });
  switch (st) {
    case 'lab': // ふらこ
      p.part(R(7.3, 4.6, 1.4, 2.6), '#d8e8f0', { ol: '#3a4a5a' });
      p.part(P(8, 6.4, 11.4, 11.4, 4.6, 11.4), '#58d870', { ol: '#1a5a2a', hi: '#b8ffc8' });
      p.part(E(7, 9.6, 0.7, 0.7), '#ffffff', { flat: true, noOl: true });
      p.part(E(9.4, 8.2, 0.5, 0.5), '#e8ffe8', { flat: true, noOl: true });
      break;
    case 'ranch': // ばてい
      p.part(E(8, 8.2, 3.6, 3.6), '#8a8a9a', { ol: '#3a3a4a', hi: '#d8d8e8' });
      p.part(E(8, 8.6, 2, 2), '#f6e8c4', { flat: true, noOl: true });
      p.part(R(5.4, 9.4, 5.2, 3.2), '#f6e8c4', { flat: true, noOl: true });
      for (const x of [4.8, 10.6]) p.rect(x, 10.5, 0.6, 1, '#3a3a4a');
      break;
    case 'shop': // ふくろと コイン
      p.part(E(8, 9.4, 3.8, 3), '#b88a4a', { ol: '#4a2e10', hi: '#e8c080' });
      p.part(R(6.6, 5.6, 2.8, 1.6), '#8a5a28', { ol: '#3a2008' });
      p.part(E(8, 9.6, 1.6, 1.6), '#ffd860', { ol: '#7a5a08', hi: '#fff4b0' });
      break;
    case 'arena': // ふたつの けん
      p.line(4.6, 4.6, 11.4, 11.6, '#dce4f0', 1.3);
      p.line(11.4, 4.6, 4.6, 11.6, '#dce4f0', 1.3);
      for (const [x, y] of [[4.4, 11.2], [11.6, 11.2]]) p.part(E(x, y, 1, 1), '#e8b030', { ol: '#5a3a08' });
      p.part(E(8, 8, 1.2, 1.2), '#d83a3a', { ol: '#5a1010' });
      break;
    case 'shrine': // ひかりの けっしょう
      p.part(P(8, 4.2, 11, 7.6, 8, 12.2, 5, 7.6), '#6ad0ff', { ol: '#1a4a8a', hi: '#e8fcff' });
      p.part(P(8, 4.2, 9.6, 7.6, 8, 12.2), '#3aa0e8', { flat: true, noOl: true });
      break;
  }
}

// ---------------------------------------------------------------- 屋根
export function roofStyled(p: Pix, b: BldState, f: number) {
  const { style, rel, w } = b;
  switch (style) {
    case 'lab': {
      p.rect(0, 0, 16, 16, '#3a2262');
      for (let row = 0; row < 4; row++)
        for (let i = -1; i < 3; i++) {
          const x = i * 8 + (row % 2) * 4, y = row * 4;
          p.part(Sub(E(x + 4, y + 2.5, 4.2, 3.4), R(x - 1, y - 2, 10, 2.2)), (row + i + rel) % 2 ? '#7a52bc' : '#8e66cc', { ol: '#26144a', hi: '#b898ec' });
        }
      if (rel % 2 === 1 && rel !== w - 2) p.part(P(8, 5, 9.2, 7.2, 11.5, 8, 9.2, 8.8, 8, 11, 6.8, 8.8, 4.5, 8, 6.8, 7.2), '#ffd860', { flat: true, ol: '#6a4a08' });
      if (rel === w - 2) { p.part(R(8.6, 0, 4.4, 8), '#8a4a3a', { ol: '#3a1a10', hi: '#c07a60' }); p.rect(8.2, 0, 5.2, 1.4, '#4a2418'); }
      break;
    }
    case 'ranch': {
      p.rect(0, 0, 16, 16, '#8a1c18');
      for (let y = 0; y < 16; y += 2) { p.rect(0, y, 16, 1.4, y % 4 ? '#b02a22' : '#a0261e'); p.rect(0, y + 1.4, 16, 0.6, '#5a100c'); }
      p.rect(0, 0, 16, 1.6, '#5a100c'); p.rect(0, 14, 16, 2, '#f0e8d8'); p.rect(0, 13.6, 16, 0.5, '#8a7a6a');
      if (rel % 2 === 0) { p.line(2, 3, 14, 12, '#f0e8d8', 0.9); p.line(14, 3, 2, 12, '#f0e8d8', 0.9); }
      if (rel === 1) { p.part(R(8.6, 0, 4, 8), '#9a8a7a', { ol: '#3a3028', hi: '#d8c8b0' }); p.rect(8.2, 0, 4.8, 1.4, '#5a4a40'); }
      break;
    }
    case 'shop': {
      p.rect(0, 0, 16, 16, '#d8cfae');
      for (let x = 0; x < 16; x += 8) p.rect(x, 0, 4, 16, '#3a9a4a');
      p.rect(0, 0, 16, 1.4, '#1e5a2a');
      for (let k = 0; k < 4; k++) {
        const col = k % 2 === 0 ? '#3a9a4a' : '#d8cfae';
        p.part(E(2 + k * 4, 13.5, 2, 2.4), col, { ol: '#1e5a2a' });
      }
      p.rect(0, 11.6, 16, 0.5, '#2a7a3a');
      break;
    }
    case 'arena': {
      p.rect(0, 0, 16, 16, '#243078');
      for (let row = 0; row < 4; row++)
        for (let i = -1; i < 3; i++) {
          const x = i * 8 + (row % 2) * 4, y = row * 4;
          p.part(Sub(E(x + 4, y + 2.5, 4.2, 3.4), R(x - 1, y - 2, 10, 2.2)), (row + i) % 2 ? '#3a4aa0' : '#4a5cb4', { ol: '#141c50', hi: '#8a9ae0' });
        }
      p.rect(0, 0, 16, 1.4, '#e8c040'); p.rect(0, 14.6, 16, 1.4, '#e8c040');
      // たれまく（はたはた ゆれる）
      if (rel === 1 || rel === w - 2) {
        const sw = Math.sin((f / 16) * Math.PI * 2 + rel) * 0.8;
        p.part(P(5.5, 3, 10.5, 3, 10.5 + sw, 15, 8, 12.5, 5.5 + sw, 15), '#d83a3a', { ol: '#5a1010', hi: '#ff8a7a' });
        p.part(E(8 + sw * 0.5, 7, 1.4, 1.4), '#ffd860', { flat: true, noOl: true });
      }
      if (rel === Math.floor(w / 2)) {
        const fl = Math.sin((f / 16) * Math.PI * 2) * 0.9;
        p.rect(7.6, 0, 0.9, 9, '#c8c8d8');
        p.part(P(8.5, 0.6, 14, 2 + fl, 8.5, 4.6), '#ffd860', { ol: '#6a4a08' });
      }
      break;
    }
    case 'shrine': {
      p.rect(0, 0, 16, 16, '#d4def4');
      for (let row = 0; row < 4; row++)
        for (let i = -1; i < 3; i++) {
          const x = i * 8 + (row % 2) * 4, y = row * 4;
          p.part(Sub(E(x + 4, y + 2.5, 4.2, 3.4), R(x - 1, y - 2, 10, 2.2)), (row + i + rel) % 2 ? '#eef2fc' : '#dfe8fa', { ol: '#8a9ac8', hi: '#ffffff' });
        }
      p.rect(0, 0, 16, 2, '#3a5ac0'); p.rect(0, 2, 16, 0.8, '#e8c860');
      p.rect(0, 13.4, 16, 2.6, '#3a5ac0'); p.rect(0, 13, 16, 0.8, '#e8c860');
      if (rel === Math.floor(w / 2)) {
        const g = 0.6 + 0.4 * Math.sin((f / 16) * Math.PI * 2);
        p.part(E(8, 8, 6.4, 6.4), mix('#d4def4', '#7ad0ff', 0.45 * g), { flat: true, noOl: true });
        p.part(P(8, 1.5, 11.5, 7.5, 8, 14.5, 4.5, 7.5), '#6ad0ff', { ol: '#1a4a8a', hi: '#e8fcff' });
        p.part(P(8, 1.5, 10, 7.5, 8, 14.5), '#3aa0e8', { flat: true, noOl: true });
      }
      break;
    }
  }
  if (b.sign) emblem(p, style);
}

// ---------------------------------------------------------------- かべ
export function wallStyled(p: Pix, b: BldState, wx: number) {
  const { style, rel } = b;
  const even = rel % 2 === 0;
  switch (style) {
    case 'lab': {
      p.rect(0, 0, 16, 16, '#cfc6e6');
      for (let y = 3; y < 14; y += 4) p.rect(0, y, 16, 0.5, '#b0a6d0');
      p.rect(0, 0, 16, 1.4, '#4a3a6a'); p.rect(0, 14, 16, 2, '#5a4a7a');
      if (even) {
        p.part(E(8, 8, 4.2, 4.2), '#4a3a6a', { ol: '#26144a', hi: '#8a7ab0' });
        p.part(E(8, 8, 3.2, 3.2), '#8aecff', { flat: true, noOl: true });
        p.part(P(5.6, 6, 8, 5, 9.4, 6.4), '#e0fcff', { flat: true, noOl: true });
        p.rect(4.8, 7.7, 6.4, 0.7, '#4a3a6a'); p.rect(7.7, 4.8, 0.7, 6.4, '#4a3a6a');
      } else {
        p.rect(7, 2, 2, 11, '#a898c8'); p.part(E(8, 6, 1.8, 1.8), '#7af0c0', { flat: true, ol: '#2a6a4a' });
      }
      break;
    }
    case 'ranch': {
      p.rect(0, 0, 16, 16, '#8a3e28');
      for (let x = 0; x < 16; x += 3) { p.rect(x, 0, 2.4, 16, (x / 3 + rel) % 2 ? '#a0482e' : '#92402a'); p.rect(x + 2.4, 0, 0.6, 16, '#4a1c10'); }
      p.rect(0, 14, 16, 2, '#f0e8d8');
      if (even) {
        p.part(R(4, 3.5, 8, 7), '#ffe8a0', { ol: '#4a2810' });
        p.rect(7.7, 3.5, 0.6, 7, '#6a4020'); p.rect(4, 6.8, 8, 0.6, '#6a4020');
        for (const x of [2.2, 11.8]) p.part(R(x, 3.5, 2, 7), '#3a7a4a', { ol: '#123a1a' });
        p.part(R(3, 11, 10, 2.4), '#7a5028', { ol: '#3a2008' });
        for (const [x, c] of [[4.5, '#ff6a8a'], [7, '#ffe070'], [9.5, '#ff6a8a'], [12, '#ffffff']] as [number, string][]) p.part(E(x, 10.6, 1, 1), c, { flat: true, noOl: true });
      } else {
        // わらたば
        p.part(RR(3, 7, 10, 7, 1.5), '#e0c060', { ol: '#6a4a10', hi: '#fff0a0' });
        p.line(3.5, 10, 12.5, 10, '#a88a30', 0.6); p.line(3.5, 12, 12.5, 12, '#a88a30', 0.6);
      }
      break;
    }
    case 'shop': {
      p.rect(0, 0, 16, 16, '#f0e4c4');
      p.rect(0, 14, 16, 2, '#3a7a4a'); p.rect(0, 0, 16, 1.2, '#c8b88a');
      if (even) {
        p.part(RR(1.5, 2.5, 13, 10, 1), '#6a4a2a', { ol: '#2a1808' });
        p.part(R(2.6, 3.6, 10.8, 7.8), '#a8dcf4', { flat: true, noOl: true });
        p.part(P(2.6, 3.6, 8, 3.6, 4.6, 11.4, 2.6, 11.4), '#d8f4ff', { flat: true, noOl: true });
        p.part(R(2.6, 9.2, 10.8, 2.2), '#8a5a2a', { flat: true, noOl: true });
        p.part(E(4.6, 8, 1.3, 1.3), '#e84a4a', { ol: '#6a1010' }); p.part(E(7.2, 7.6, 0.9, 1.7), '#4ad0a0', { ol: '#0a4a3a' });
        p.part(RR(9, 6.2, 3, 3, 0.8), '#e8c040', { ol: '#6a4a08' });
      } else {
        p.part(RR(3.5, 6, 9, 8, 0.8), '#b8854a', { ol: '#4a2e10', hi: '#e0b070' });
        p.line(3.8, 9, 12.2, 9, '#7a5428', 0.6); p.line(3.8, 11.5, 12.2, 11.5, '#7a5428', 0.6);
        p.part(E(8, 5.4, 2.2, 1.6), '#58c858', { ol: '#144a14' });
      }
      break;
    }
    case 'arena': {
      p.rect(0, 0, 16, 16, '#9ca4b8');
      for (let row = 0; row < 4; row++) {
        const off = (row + rel) % 2 ? 4 : 0;
        p.rect(0, row * 4, 16, 0.6, '#6a728a');
        for (let i = 0; i < 3; i++) p.rect(off + i * 8, row * 4, 0.6, 4, '#6a728a');
        p.rect(0, row * 4 + 0.6, 16, 0.5, '#c8cedc');
      }
      p.rect(0, 14, 16, 2, '#5a6278');
      if (even) { p.part(RR(6.4, 3, 3.2, 8, 1.4), '#1a1c2c', { ol: '#3a4058' }); p.rect(7.7, 3.4, 0.6, 7, '#4a4e64'); }
      else {
        p.part(P(4, 3, 12, 3, 12, 9, 8, 14, 4, 9), '#2a4ab8', { ol: '#10204a', hi: '#6a8af0' });
        p.part(P(8, 4, 11, 4, 11, 8.6, 8, 12, 5, 8.6, 5, 4), '#e8c040', { flat: true, noOl: true });
        p.part(P(8, 5.4, 9.6, 8, 8, 10.4, 6.4, 8), '#2a4ab8', { flat: true, noOl: true });
      }
      break;
    }
    case 'shrine': {
      p.rect(0, 0, 16, 16, '#eef0fa');
      p.rect(0, 14, 16, 2, '#3a5ac0'); p.rect(0, 13.4, 16, 0.7, '#e8c860'); p.rect(0, 0, 16, 1.2, '#c8d0ec');
      // はしら
      for (const x of [0, 13]) { p.part(R(x, 0, 3, 14), '#fafaff', { ol: '#8a9ac8', hiT: 0.3 }); p.rect(x + 1, 1, 0.5, 12, '#c8d0ec'); }
      if (even) {
        p.part(P(8, 3, 11.4, 8, 8, 13, 4.6, 8), '#5ac0ff', { ol: '#1a4a8a' });
        p.part(P(8, 5, 9.8, 8, 8, 11, 6.2, 8), '#d8f6ff', { flat: true, noOl: true });
      }
      break;
    }
  }
  void wx;
}

// ---------------------------------------------------------------- とびら
export function doorStyled(p: Pix, b: BldState, wx: number) {
  wallStyled(p, { ...b, rel: 1 }, wx);
  switch (b.style) {
    case 'lab':
      p.part(RR(3, 2.5, 10, 13.5, 4.5), '#3a2062', { ol: '#150a30', hi: '#6a48a8' });
      p.part(E(8, 8.4, 3.2, 3.2), '#8aecff', { ol: '#1a5a7a' });
      for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; p.part(R(8 + Math.cos(a) * 3.4 - 0.5, 8.4 + Math.sin(a) * 3.4 - 0.5, 1, 1), '#8aecff', { flat: true, noOl: true }); }
      p.part(E(8, 8.4, 1.2, 1.2), '#3a2062', { flat: true, noOl: true });
      p.part(E(11, 12, 0.7, 0.7), '#f0d040', { flat: true, ol: '#6a4a08' });
      break;
    case 'ranch':
      p.part(R(2, 2.5, 12, 13.5), '#a0301f', { ol: '#3a0c08', hi: '#d8604a' });
      p.rect(7.7, 2.5, 0.7, 13.5, '#3a0c08');
      p.line(2.5, 3, 7.4, 15.6, '#f0e8d8', 0.9); p.line(7.4, 3, 2.5, 15.6, '#f0e8d8', 0.9);
      p.line(8.6, 3, 13.5, 15.6, '#f0e8d8', 0.9); p.line(13.5, 3, 8.6, 15.6, '#f0e8d8', 0.9);
      p.rect(2, 2.5, 12, 0.9, '#f0e8d8');
      break;
    case 'shop':
      p.part(RR(3, 2.5, 10, 13.5, 1.5), '#8a5a2a', { ol: '#2a1608', hi: '#b88048' });
      p.part(R(4.6, 4, 6.8, 6.4), '#a8dcf4', { ol: '#3a2a10' });
      p.part(P(4.6, 4, 8, 4, 5.6, 10.4, 4.6, 10.4), '#e0f8ff', { flat: true, noOl: true });
      p.part(RR(5.4, 11.2, 5.2, 2.6, 0.6), '#ffd860', { ol: '#6a4a08' });
      p.part(E(11.2, 9, 0.7, 0.7), '#f0d040', { flat: true, ol: '#6a4a08' });
      break;
    case 'arena':
      p.part(RR(2, 1.5, 12, 14.5, 5.5), '#e8c040', { ol: '#5a3a08', hi: '#fff0a0' });
      p.part(RR(3.4, 3, 9.2, 13, 4.4), '#22242e', { ol: '#0a0a12' });
      for (const x of [5.2, 7.4, 9.6, 11.4]) p.rect(x, 3.6, 0.6, 12.4, '#8a8aa0');
      p.rect(3.4, 8, 9.2, 0.7, '#8a8aa0');
      break;
    case 'shrine':
      p.part(RR(2.6, 1, 10.8, 15, 5.4), '#fafaff', { ol: '#8a9ac8', hi: '#ffffff' });
      p.part(RR(4, 2.6, 8, 13.4, 4), '#7ab8ff', { flat: true, noOl: true });
      p.part(RR(5.2, 4.4, 5.6, 11.6, 2.8), '#e0f4ff', { flat: true, noOl: true });
      p.part(E(8, 9, 1.4, 2.4), '#ffffff', { flat: true, noOl: true });
      break;
  }
}

// ---------------------------------------------------------------- まちの かざり（ランプ・はなだん・いど）
export function lampTile(p: Pix, baseDraw: () => void, f: number) {
  baseDraw();
  p.part(E(8, 14.2, 3.4, 1.2), '#000000', { flat: true, noOl: true });
  p.part(R(7.2, 5, 1.6, 9.4), '#3a3a4a', { ol: OL });
  p.part(R(5.4, 13, 5.2, 2), '#4a4a5c', { ol: OL });
  const g = 0.75 + 0.25 * Math.sin((f / 16) * Math.PI * 2);
  p.part(E(8, 4.2, 4.4, 4.2), mix('#ffd870', '#ffffff', 0), { flat: true, noOl: true });
  p.part(RR(5.6, 1.8, 4.8, 5, 1), mix('#fff0b0', '#ffc040', 1 - g), { ol: OL, hi: '#ffffff' });
  p.part(P(5, 1.8, 8, 0, 11, 1.8), '#3a3a4a', { ol: OL });
}
export function flowerBed(p: Pix, baseDraw: () => void, wx: number, wy: number) {
  baseDraw();
  p.part(RR(1, 6.5, 14, 8, 1.6), '#8a5a2a', { ol: '#3a2008', hi: '#b88048' });
  p.part(R(1.8, 7.2, 12.4, 3), '#4a3018', { flat: true, noOl: true });
  const cols = ['#ff6a8a', '#ffe070', '#ffffff', '#b090ff', '#ff9a50'];
  for (let i = 0; i < 5; i++) {
    const x = 2.6 + i * 2.7, y = 5.2 + (i % 2) * 1.2, c = cols[Math.floor(h2(wx * 7 + i, wy * 3) * cols.length)];
    p.rect(x - 0.2, y + 0.5, 0.5, 3.2, '#3a8a3a');
    for (const [dx, dy] of [[-0.8, 0], [0.8, 0], [0, -0.8], [0, 0.8]]) p.part(E(x + dx, y + dy, 0.7, 0.7), c, { flat: true, noOl: true });
    p.part(E(x, y, 0.5, 0.5), '#f0c030', { flat: true, noOl: true });
  }
}
export function wellTile(p: Pix, baseDraw: () => void) {
  baseDraw();
  p.part(E(8, 14.3, 6.4, 1.4), '#000000', { flat: true, noOl: true });
  p.part(R(2.4, 6.5, 11.2, 7.6), '#9a9aa8', { ol: '#3a3a4a', hi: '#d0d0dc' });
  for (let y = 8; y < 14; y += 2.4) p.rect(2.4, y, 11.2, 0.5, '#6a6a7a');
  p.part(E(8, 6.8, 5.6, 2), '#2a4a7a', { ol: '#3a3a4a' });
  p.part(E(8, 6.8, 4.2, 1.2), '#58b0f0', { flat: true, noOl: true });
  for (const x of [3.4, 12]) p.part(R(x, 1.5, 0.9, 6), '#7a4a24', { ol: '#2a1408' });
  p.part(P(2.4, 2.4, 8, 0.2, 13.6, 2.4, 12.6, 3.4, 3.4, 3.4), '#b8402a', { ol: '#4a1408', hi: '#e87a60' });
}

/*
 * art.js: イラスト素材（SVG）
 *  町の背景・建物・植栽・小物・住人・アイテムを、同じ線・同じ光源（左上）・同じアイソメトリック視点で描く。
 *  ゲームルールは持たない。座標は町のグリッド（gx: 右下方向, gy: 左下方向, z: 高さ）。
 */
(function (root) {
  'use strict';
  const OY = (root.OY = root.OY || {});

  /* ---------- 共通の色・線 ---------- */
  const C = {
    ink: '#59483F',
    sky: '#CDEBE4',
    sky2: '#E4F4EE',
    cloud: '#F4FBF7',
    paving: '#EBDDC0',
    paving2: '#E2D1AF',
    curb: '#D8C3A0',
    soil: '#C98A5B',
    soilDark: '#A86E47',
    grass: '#A6CB8C',
    grassDark: '#86B172',
    leaf: '#8DBB83',
    leafDark: '#6E9E6B',
    autumn: '#E8876D',
    autumn2: '#F0A86E',
    trunk: '#8A5A3E',
    cream: '#F3E4C8',
    creamDark: '#E4CFAC',
    butter: '#F7D778',
    coral: '#E8876D',
    red: '#E85D5D',
    green: '#7FA37A',
    greenDark: '#5F8560',
    roofRed: '#C9694B',
    roofGreen: '#6E9E78',
    wood: '#A8744E',
    woodDark: '#7E5539',
    glass: '#CFE8EA',
    glassHi: '#F2FBFA',
    ivory: '#FFF8E9',
    bread: '#E2A355',
    breadDark: '#C27F38'
  };
  const LW = 1.6;
  const LINE = `stroke="${C.ink}" stroke-width="${LW}" stroke-linejoin="round" stroke-linecap="round"`;
  const THIN = `stroke="${C.ink}" stroke-width="1" stroke-linejoin="round" stroke-linecap="round"`;

  /* ---------- 投影 ---------- */
  const TW = 50;
  const TH = 25;
  const OX = 300;
  const OYB = 205;
  const N = 12;
  const VB = { x: 72, y: 36, w: 456, h: 510 }; // ゲーム中（左右の角を少し切って大きく見せる）
  const VB_FULL = { x: 0, y: 30, w: 600, h: 515 }; // タイトル・サムネイル用（町全体）

  const r1 = (n) => Math.round(n * 10) / 10;
  function P(gx, gy, z) {
    return [OX + ((gx - gy) * TW) / 2, OYB + ((gx + gy) * TH) / 2 - (z || 0)];
  }
  const pts = (a) => a.map((p) => r1(p[0]) + ',' + r1(p[1])).join(' ');
  const poly = (a, fill, extra) => `<polygon points="${pts(a)}" fill="${fill}" ${extra === undefined ? LINE : extra}/>`;

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    let r = (n >> 16) & 255;
    let g = (n >> 8) & 255;
    let b = n & 255;
    const t = amt < 0 ? 0 : 255;
    const p = Math.abs(amt);
    r = Math.round((t - r) * p + r);
    g = Math.round((t - g) * p + g);
    b = Math.round((t - b) * p + b);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  /** 直方体（見える3面：上・左前(+gy)・右前(+gx)） */
  function box(x0, y0, x1, y1, z0, h, col, opt) {
    opt = opt || {};
    const top = opt.top || col;
    const left = opt.left || shade(col, -0.07);
    const right = opt.right || shade(col, -0.2);
    const z1 = z0 + h;
    let s = '';
    s += poly([P(x0, y1, z0), P(x1, y1, z0), P(x1, y1, z1), P(x0, y1, z1)], left, opt.line);
    s += poly([P(x1, y0, z0), P(x1, y1, z0), P(x1, y1, z1), P(x1, y0, z1)], right, opt.line);
    s += poly([P(x0, y0, z1), P(x1, y0, z1), P(x1, y1, z1), P(x0, y1, z1)], top, opt.line);
    return s;
  }

  /** +gx 面（右下向き）のローカル座標。x: 面の左端から右へ（1マス=25）、y: 下向き（= -z） */
  function faceX(gx, gyLeft, z0) {
    const [ex, ey] = P(gx, gyLeft, z0 || 0);
    return `matrix(1,-0.5,0,1,${r1(ex)},${r1(ey)})`;
  }
  /** +gy 面（左下向き）のローカル座標。x: 面の左端(gx小)から右へ */
  function faceY(gy, gxLeft, z0) {
    const [ex, ey] = P(gxLeft, gy, z0 || 0);
    return `matrix(1,0.5,0,1,${r1(ex)},${r1(ey)})`;
  }

  /** 地面の円（アイソメトリックの楕円） */
  function isoEllipse(gx, gy, r, z) {
    const [cx, cy] = P(gx, gy, z || 0);
    return { cx, cy, rx: r * 35.355, ry: r * 17.678 };
  }
  const ell = (e, fill, extra) =>
    `<ellipse cx="${r1(e.cx)}" cy="${r1(e.cy)}" rx="${r1(e.rx)}" ry="${r1(e.ry)}" fill="${fill}" ${extra === undefined ? LINE : extra}/>`;

  function hull(points) {
    const p = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lower = [];
    for (const q of p) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop();
      lower.push(q);
    }
    const upper = [];
    for (const q of p.slice().reverse()) {
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop();
      upper.push(q);
    }
    return lower.slice(0, -1).concat(upper.slice(0, -1));
  }

  /* ---------- 小さな部品 ---------- */

  /** 窓（面ローカル座標で描く） */
  function windowLocal(x, y, w, h, frame) {
    frame = frame || C.wood;
    return (
      `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1.5" fill="${frame}" ${LINE}/>` +
      `<rect x="${x + 2.5}" y="${y + 2.5}" width="${w - 5}" height="${h - 5}" fill="${C.glass}" ${THIN}/>` +
      `<path d="M${x + 4} ${y + h - 6} L${x + w * 0.55} ${y + 4}" stroke="${C.glassHi}" stroke-width="3" stroke-linecap="round" opacity=".9"/>` +
      `<path d="M${x + w / 2} ${y + 2.5} V${y + h - 2.5} M${x + 2.5} ${y + h / 2} H${x + w - 2.5}" ${THIN} fill="none"/>`
    );
  }

  function croissant(x, y, s, rot) {
    return `<g transform="translate(${x} ${y}) rotate(${rot || 0}) scale(${s || 1})">
      <path d="M-9 2 Q-9 -7 0 -7.5 Q9 -7 9 2 Q6 -0.5 3 0.5 Q0 -1.5 -3 0.5 Q-6 -0.5 -9 2 Z" fill="${C.bread}" ${LINE}/>
      <path d="M-4.5 -6.5 Q-3.5 -2.5 -3.5 0.3 M0 -7.3 V-1.4 M4.5 -6.5 Q3.5 -2.5 3.5 0.3" fill="none" stroke="${C.breadDark}" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M-5 -5.5 Q-2 -6.6 1 -6.4" fill="none" stroke="#F6D49A" stroke-width="1.4" stroke-linecap="round"/>
    </g>`;
  }

  function loaf(x, y, s) {
    return `<g transform="translate(${x} ${y}) scale(${s || 1})">
      <path d="M-7 1 Q-7 -6 0 -6 Q7 -6 7 1 Z" fill="${C.bread}" ${THIN}/>
      <path d="M-3 -4.5 L-1.5 -2 M1 -5 L2.5 -2.5" stroke="${C.breadDark}" stroke-width="1" stroke-linecap="round"/>
    </g>`;
  }

  function note(x, y, s, color) {
    color = color || C.ink;
    return `<g transform="translate(${x} ${y}) scale(${s || 1})"><ellipse cx="0" cy="0" rx="3.2" ry="2.4" transform="rotate(-20)" fill="${color}"/><path d="M2.8 -1 V-12 Q6 -10 7 -7" fill="none" stroke="${color}" stroke-width="1.5" stroke-linecap="round"/></g>`;
  }

  function sparkle(x, y, s, color) {
    return `<path transform="translate(${x} ${y}) scale(${s || 1})" d="M0 -5 Q0.8 -0.8 5 0 Q0.8 0.8 0 5 Q-0.8 0.8 -5 0 Q-0.8 -0.8 0 -5 Z" fill="${color || C.butter}" stroke="${C.ink}" stroke-width="0.8"/>`;
  }

  function balloonShape(x, y, s) {
    return `<g transform="translate(${x} ${y}) scale(${s || 1})">
      <path d="M0 0 Q-10 -1 -10 -13 Q-10 -25 0 -25 Q10 -25 10 -13 Q10 -1 0 0 Z" fill="${C.red}" ${LINE}/>
      <path d="M-1.8 0.2 L1.8 0.2 L0 3 Z" fill="${C.red}" ${THIN}/>
      <path d="M-5 -19 Q-4 -22 -1 -22.5" fill="none" stroke="#FFD2C8" stroke-width="2.4" stroke-linecap="round"/>
      <ellipse cx="-5.6" cy="-14.5" rx="1.2" ry="2.4" fill="#FFD2C8"/>
    </g>`;
  }

  function scoreSheet(x, y, s, rot) {
    let lines = '';
    [-15, -7].forEach((yy) => {
      for (let i = 0; i < 4; i++) lines += `M-8 ${yy + i * 1.7} H8 `;
    });
    return `<g transform="translate(${x} ${y}) rotate(${rot || 0}) scale(${s || 1})">
      <path d="M-9 -21 H6 L10 -17 V3 H-9 Z" fill="#FFFDF5" ${LINE}/>
      <path d="M6 -21 V-17 H10" fill="${C.creamDark}" ${THIN}/>
      <path d="${lines}" stroke="#9C8A7E" stroke-width="0.6" fill="none"/>
      <ellipse cx="-3" cy="-11.6" rx="1.4" ry="1.05" fill="${C.ink}"/><path d="M-1.7 -11.8 V-16" stroke="${C.ink}" stroke-width=".8"/>
      <ellipse cx="2.5" cy="-13.2" rx="1.4" ry="1.05" fill="${C.ink}"/><path d="M3.8 -13.4 V-17.6" stroke="${C.ink}" stroke-width=".8"/>
      <ellipse cx="-1" cy="-3.4" rx="1.4" ry="1.05" fill="${C.ink}"/><path d="M0.3 -3.6 V-7.6" stroke="${C.ink}" stroke-width=".8"/>
      <ellipse cx="4.5" cy="-5" rx="1.4" ry="1.05" fill="${C.ink}"/><path d="M5.8 -5.2 V-9.4" stroke="${C.ink}" stroke-width=".8"/>
      <rect x="-9" y="-1" width="19" height="4" fill="${C.coral}" ${THIN}/>
    </g>`;
  }

  function basketOfBread(x, y, s) {
    return `<g transform="translate(${x} ${y}) scale(${s || 1})">
      ${croissant(-5, -9, 0.9, -12)}${croissant(5, -10, 0.9, 10)}${croissant(0, -13, 0.95, 0)}
      <path d="M-14 -8 H14 L11 4 H-11 Z" fill="#C99A5B" ${LINE}/>
      <path d="M-12.5 -3 H12.5 M-11.5 1 H11.5" stroke="${C.woodDark}" stroke-width="0.9"/>
      <path d="M-7 -8 L-6 4 M0 -8 V4 M7 -8 L6 4" stroke="${C.woodDark}" stroke-width="0.9"/>
      <rect x="-6" y="-21" width="12" height="7" rx="1.5" fill="${C.ivory}" ${THIN} transform="rotate(-6)"/>
      <text x="0" y="-15.6" font-size="5" text-anchor="middle" fill="${C.red}" font-weight="900" transform="rotate(-6)">NEW</text>
    </g>`;
  }

  /* ---------- 植栽・街具 ---------- */

  function tree(gx, gy, o) {
    o = o || {};
    const [x, y] = P(gx, gy);
    const s = o.s || 1;
    const c1 = o.color || C.leaf;
    const c2 = shade(c1, -0.16);
    const c3 = shade(c1, 0.22);
    const H = 40 * s;
    let out = `<g>`;
    out += `<ellipse cx="${x}" cy="${y}" rx="${16 * s}" ry="${7 * s}" fill="rgba(89,72,63,.18)"/>`;
    out += `<path d="M${x - 3.5 * s} ${y} Q${x - 2 * s} ${y - H * 0.6} ${x - 4 * s} ${y - H} L${x + 4 * s} ${y - H} Q${x + 2 * s} ${y - H * 0.6} ${x + 3.5 * s} ${y} Z" fill="${C.trunk}" ${LINE}/>`;
    out += `<path d="M${x} ${y - H * 0.75} L${x + 9 * s} ${y - H * 1.05}" stroke="${C.trunk}" stroke-width="${3 * s}" stroke-linecap="round"/>`;
    const blobs = [
      [-14, -52, 15],
      [12, -54, 15],
      [0, -66, 17],
      [-6, -42, 12],
      [9, -42, 12]
    ];
    blobs.forEach(([dx, dy, r]) => (out += `<circle cx="${x + dx * s}" cy="${y + dy * s}" r="${r * s}" fill="${c2}" ${LINE}/>`));
    blobs.forEach(([dx, dy, r]) => (out += `<circle cx="${x + dx * s - 2 * s}" cy="${y + dy * s - 2.5 * s}" r="${r * s * 0.78}" fill="${c1}"/>`));
    out += `<circle cx="${x - 5 * s}" cy="${y - 70 * s}" r="${6 * s}" fill="${c3}" opacity=".8"/>`;
    out += `<circle cx="${x - 17 * s}" cy="${y - 56 * s}" r="${4.5 * s}" fill="${c3}" opacity=".8"/>`;
    out += `<path d="M${x + 4 * s} ${y - 48 * s} q3 -2 6 0 M${x - 12 * s} ${y - 44 * s} q3 -2 6 0" fill="none" stroke="${c2}" stroke-width="1.2" stroke-linecap="round"/>`;
    return out + '</g>';
  }

  function conifer(gx, gy, s, color) {
    const [x, y] = P(gx, gy);
    const c = color || C.autumn;
    const d = shade(c, -0.15);
    let out = `<ellipse cx="${x}" cy="${y}" rx="${10 * s}" ry="${5 * s}" fill="rgba(89,72,63,.18)"/>`;
    out += `<rect x="${x - 2.5 * s}" y="${y - 10 * s}" width="${5 * s}" height="${10 * s}" fill="${C.trunk}" ${LINE}/>`;
    [
      [0, 13],
      [-12, 11],
      [-23, 8.5]
    ].forEach(([dy, w]) => {
      out += `<path d="M${x - w * s} ${y + (dy - 8) * s} L${x} ${y + (dy - 30) * s} L${x + w * s} ${y + (dy - 8) * s} Q${x} ${y + (dy - 4) * s} ${x - w * s} ${y + (dy - 8) * s} Z" fill="${d}" ${LINE}/>`;
      out += `<path d="M${x - w * 0.55 * s} ${y + (dy - 11) * s} L${x - 1 * s} ${y + (dy - 27) * s} L${x - 1 * s} ${y + (dy - 9) * s} Z" fill="${c}"/>`;
    });
    return out;
  }

  function bush(gx, gy, s, color) {
    const [x, y] = P(gx, gy);
    const c = color || C.leaf;
    const d = shade(c, -0.15);
    let out = `<ellipse cx="${x}" cy="${y}" rx="${16 * s}" ry="${6 * s}" fill="rgba(89,72,63,.16)"/>`;
    [
      [-9, -7, 9],
      [8, -7, 9],
      [0, -12, 10]
    ].forEach(([dx, dy, r]) => (out += `<circle cx="${x + dx * s}" cy="${y + dy * s}" r="${r * s}" fill="${d}" ${LINE}/>`));
    [
      [-10, -9, 6],
      [7, -9, 6],
      [-1.5, -14.5, 7]
    ].forEach(([dx, dy, r]) => (out += `<circle cx="${x + dx * s}" cy="${y + dy * s}" r="${r * s}" fill="${c}"/>`));
    return out;
  }

  function flowers(gx, gy, colors) {
    const [x, y] = P(gx, gy);
    let out = '';
    (colors || [C.red, C.butter, '#F2A7B8', '#FFFFFF', C.red]).forEach((c, i) => {
      const dx = (i - 2) * 6;
      const dy = (i % 2) * 3;
      out += `<path d="M${x + dx} ${y + dy} V${y + dy - 7}" stroke="${C.leafDark}" stroke-width="1.4"/>`;
      out += `<circle cx="${x + dx}" cy="${y + dy - 8}" r="2.8" fill="${c}" stroke="${C.ink}" stroke-width=".9"/>`;
      out += `<circle cx="${x + dx}" cy="${y + dy - 8}" r="1" fill="${C.butter}"/>`;
    });
    return out;
  }

  function lamp(gx, gy) {
    const [x, y] = P(gx, gy);
    return `<ellipse cx="${x}" cy="${y}" rx="7" ry="3" fill="rgba(89,72,63,.2)"/>
      <rect x="${x - 3.5}" y="${y - 5}" width="7" height="5" fill="#4F6B5A" ${LINE}/>
      <rect x="${x - 1.6}" y="${y - 74}" width="3.2" height="70" fill="#4F6B5A" ${LINE}/>
      <path d="M${x} ${y - 74} q0 -6 7 -7" fill="none" stroke="#4F6B5A" stroke-width="2.4"/>
      <path d="M${x + 2} ${y - 80} h10 l-2 9 h-6 z" fill="${C.butter}" ${LINE}/>
      <path d="M${x + 1} ${y - 81} h12 l-2 -4 h-8 z" fill="#4F6B5A" ${LINE}/>
      <circle cx="${x + 7}" cy="${y - 75}" r="9" fill="${C.butter}" opacity=".25"/>`;
  }

  function utilityPole(gx, gy) {
    const [x, y] = P(gx, gy);
    return `<ellipse cx="${x}" cy="${y}" rx="8" ry="3" fill="rgba(89,72,63,.2)"/>
      <rect x="${x - 2.6}" y="${y - 150}" width="5.2" height="150" fill="#C9AF8A" ${LINE}/>
      <rect x="${x - 15}" y="${y - 138}" width="30" height="3.6" fill="#B79A74" ${LINE}/>
      <rect x="${x - 11}" y="${y - 124}" width="22" height="3.2" fill="#B79A74" ${LINE}/>
      <rect x="${x - 7}" y="${y - 104}" width="8" height="11" rx="1.5" fill="#8C8C82" ${LINE}/>
      <rect x="${x + 1}" y="${y - 96}" width="7" height="9" rx="1.5" fill="#8C8C82" ${LINE}/>
      <path d="M${x - 15} ${y - 136} Q${x - 60} ${y - 120} ${x - 110} ${y - 150} M${x + 15} ${y - 136} Q${x + 40} ${y - 128} ${x + 70} ${y - 140}" fill="none" stroke="${C.ink}" stroke-width=".9" opacity=".6"/>`;
  }

  function bicycle(gx, gy, color) {
    const [x, y] = P(gx, gy);
    const c = color || C.red;
    return `<ellipse cx="${x}" cy="${y}" rx="17" ry="4" fill="rgba(89,72,63,.18)"/>
      <g transform="translate(${x} ${y - 9})">
        <circle cx="-10" cy="0" r="8" fill="none" ${LINE}/><circle cx="10" cy="0" r="8" fill="none" ${LINE}/>
        <circle cx="-10" cy="0" r="1.5" fill="${C.ink}"/><circle cx="10" cy="0" r="1.5" fill="${C.ink}"/>
        <path d="M-10 0 L-2 -10 L7 -10 L10 0 M-2 -10 L1 0 L7 -10 M1 0 L-10 0" fill="none" stroke="${c}" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="M-4 -13 h5" stroke="${C.ink}" stroke-width="2.6" stroke-linecap="round"/>
        <path d="M7 -10 L6 -15 h4" fill="none" stroke="${C.ink}" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M5 -15 h7 v-6 h-7 z" fill="#C99A5B" ${THIN}/>
      </g>`;
  }

  function hedge(x0, y0, x1, y1) {
    let out = box(x0, y0, x1, y1, 0, 8, '#C9A27A');
    out += box(x0 + 0.08, y0 + 0.08, x1 - 0.08, y1 - 0.08, 8, 13, C.leaf, { top: shade(C.leaf, 0.1) });
    for (let gy = y0 + 0.35; gy < y1; gy += 0.55) {
      const [x, y] = P(x1 - 0.1, gy, 21);
      out += `<circle cx="${x}" cy="${y}" r="5.5" fill="${shade(C.leaf, 0.08)}" ${LINE}/>`;
    }
    for (let gx = x0 + 0.35; gx < x1; gx += 0.55) {
      const [x, y] = P(gx, y1 - 0.1, 21);
      out += `<circle cx="${x}" cy="${y}" r="5.5" fill="${shade(C.leaf, 0.08)}" ${LINE}/>`;
    }
    out += flowersOnBox(x0, y0, x1, y1, 24);
    return out;
  }

  function flowersOnBox(x0, y0, x1, y1, z) {
    let out = '';
    const cols = [C.red, '#FFFFFF', C.butter, '#F2A7B8'];
    let k = 0;
    for (let gx = x0 + 0.3; gx < x1 - 0.1; gx += 0.45) {
      for (let gy = y0 + 0.3; gy < y1 - 0.1; gy += 0.45) {
        const [x, y] = P(gx, gy, z);
        out += `<circle cx="${r1(x)}" cy="${r1(y)}" r="2.2" fill="${cols[k++ % cols.length]}" stroke="${C.ink}" stroke-width=".7"/>`;
      }
    }
    return out;
  }

  function bench(gx0, gy0, gx1, gy1) {
    // 座面は +gx 向き（手前に座る）
    let out = '';
    const leg = (gx, gy) => box(gx, gy, gx + 0.1, gy + 0.1, 0, 13, C.woodDark);
    out += `<polygon points="${pts([P(gx0 - 0.1, gy0, 0), P(gx1 + 0.2, gy0, 0), P(gx1 + 0.2, gy1 + 0.1, 0), P(gx0 - 0.1, gy1 + 0.1, 0)])}" fill="rgba(89,72,63,.16)"/>`;
    out += box(gx0 - 0.05, gy0 + 0.1, gx0 + 0.07, gy0 + 0.22, 0, 36, C.woodDark);
    out += box(gx0 - 0.05, gy1 - 0.22, gx0 + 0.07, gy1 - 0.1, 0, 36, C.woodDark);
    out += box(gx0 - 0.06, gy0, gx0 + 0.04, gy1, 22, 6, C.wood);
    out += box(gx0 - 0.06, gy0, gx0 + 0.04, gy1, 30, 6, C.wood);
    out += leg(gx1 - 0.15, gy0 + 0.1) + leg(gx1 - 0.15, gy1 - 0.2);
    out += box(gx0, gy0, gx1, gy1, 13, 4, C.wood, { top: shade(C.wood, 0.12) });
    return out;
  }

  function table(gx, gy) {
    let out = `<polygon points="${pts([P(gx - 0.35, gy - 0.35), P(gx + 0.35, gy - 0.35), P(gx + 0.35, gy + 0.35), P(gx - 0.35, gy + 0.35)])}" fill="rgba(89,72,63,.16)"/>`;
    out += box(gx - 0.28, gy + 0.18, gx - 0.2, gy + 0.26, 0, 18, C.woodDark);
    out += box(gx + 0.2, gy + 0.18, gx + 0.28, gy + 0.26, 0, 18, C.woodDark);
    out += box(gx + 0.2, gy - 0.26, gx + 0.28, gy - 0.18, 0, 18, C.woodDark);
    out += box(gx - 0.34, gy - 0.34, gx + 0.34, gy + 0.34, 18, 4, '#C9A27A', { top: '#F4E9D2' });
    return out;
  }

  function musicStand(gx, gy, withSheet) {
    const [x, y] = P(gx, gy);
    return `<ellipse cx="${x}" cy="${y}" rx="9" ry="3.5" fill="rgba(89,72,63,.2)"/>
      <path d="M${x - 7} ${y + 1} L${x} ${y - 6} L${x + 7} ${y + 1} M${x} ${y - 6} V${y - 34}" fill="none" stroke="#4A4040" stroke-width="2.2" stroke-linecap="round"/>
      <path d="M${x - 12} ${y - 34} L${x + 12} ${y - 34} L${x + 10} ${y - 50} L${x - 10} ${y - 50} Z" fill="#4A4040" ${LINE}/>
      ${withSheet ? `<g transform="translate(${x} ${y - 36}) scale(.85)">${scoreSheet(0, 0, 1, 0)}</g>` : ''}`;
  }

  /* ---------- 建物 ---------- */

  function bakery() {
    // 足元 gx 0..3, gy 1..6 / 正面は +gx 面
    const X0 = 0,
      X1 = 3,
      Y0 = 1,
      Y1 = 6,
      F1 = 78,
      F2 = 64,
      RZ = F1 + F2,
      RIDGE = RZ + 44;
    let s = '';
    // 側面・正面の壁
    s += box(X0, Y0, X1, Y1, 0, F1, C.cream, { right: '#E9D3AE', left: '#F6EAD3' });
    s += box(X0, Y0, X1, Y1, F1, F2, '#F6E2C4', { right: '#EDCDA6', left: '#F8EAD2' });
    // 1階と2階の間の帯
    s += box(X0, Y0, X1 + 0.08, Y1 + 0.08, F1 - 4, 6, C.woodDark);
    // 正面（+gx 面）ローカル描画：幅 125（gy 6→1）
    s += `<g transform="${faceX(X1, Y1, 0)}">
      <rect x="0" y="-74" width="125" height="74" fill="${C.green}" ${LINE}/>
      <rect x="0" y="-8" width="125" height="8" fill="${C.greenDark}" ${LINE}/>
      <rect x="7" y="-62" width="64" height="48" rx="2" fill="${C.woodDark}" ${LINE}/>
      <rect x="10.5" y="-58.5" width="57" height="41" fill="#FBEFD3" ${THIN}/>
      <path d="M10.5 -38 H67.5 M10.5 -24 H67.5" stroke="${C.wood}" stroke-width="2"/>
      ${loaf(20, -40, 1)}${loaf(36, -40, 0.9)}${croissant(53, -39.5, 0.8, 0)}
      ${croissant(19, -25.5, 0.75, -8)}${loaf(33, -26, 0.85)}${loaf(47, -26, 0.85)}${croissant(60, -25.5, 0.75, 8)}
      <path d="M14 -56 L32 -30" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".55"/>
      <rect x="82" y="-64" width="30" height="64" rx="2" fill="${C.woodDark}" ${LINE}/>
      <rect x="85" y="-61" width="24" height="61" fill="${C.wood}" ${THIN}/>
      <rect x="89" y="-55" width="16" height="20" rx="1.5" fill="${C.glass}" ${THIN}/>
      <circle cx="105" cy="-30" r="1.6" fill="${C.butter}" stroke="${C.ink}" stroke-width=".8"/>
      <rect x="88" y="-22" width="18" height="10" rx="1" fill="${C.ivory}" ${THIN}/>
      <text x="97" y="-15" font-size="5.4" text-anchor="middle" fill="${C.ink}" font-weight="800">OPEN</text>
    </g>`;
    // 2階の窓と看板（+gx 面）
    s += `<g transform="${faceX(X1, Y1, F1)}">
      ${windowLocal(8, -54, 24, 34, C.woodDark)}
      ${windowLocal(93, -54, 24, 34, C.woodDark)}
      <rect x="36" y="-50" width="53" height="22" rx="3" fill="${C.woodDark}" ${LINE}/>
      <rect x="38.5" y="-47.5" width="48" height="17" rx="2" fill="${C.ivory}" ${THIN}/>
      <text x="62.5" y="-35" font-size="10.5" text-anchor="middle" fill="${C.woodDark}" font-weight="900">マルのパン</text>
      <rect x="4" y="-21" width="32" height="7" fill="#C9A27A" ${THIN}/>
      <rect x="89" y="-21" width="32" height="7" fill="#C9A27A" ${THIN}/>
    </g>`;
    // 2階の植木鉢の花
    [
      [3.04, 5.3],
      [3.04, 1.9]
    ].forEach(([gx, gy]) => {
      for (let i = 0; i < 4; i++) {
        const [x, y] = P(gx + 0.02, gy - i * 0.22, F1 + 10);
        s += `<circle cx="${r1(x)}" cy="${r1(y)}" r="3.2" fill="${i % 2 ? C.red : C.leaf}" stroke="${C.ink}" stroke-width=".8"/>`;
      }
    });
    // 側面（+gy 面）の小窓
    s += `<g transform="${faceY(Y1, X0, 0)}">${windowLocal(22, -58, 26, 30, C.wood)}</g>`;
    s += `<g transform="${faceY(Y1, X0, F1)}">${windowLocal(25, -48, 20, 28, C.wood)}</g>`;
    // 雨どい
    s += `<path d="${'M' + pts([P(X1 + 0.04, Y1 + 0.04, 0), P(X1 + 0.04, Y1 + 0.04, RZ)]).replace(' ', ' L')}" stroke="#9A8C80" stroke-width="2.4"/>`;
    // ひさし（ストライプ）
    const AZ0 = 76,
      AZ1 = 60,
      AX = 0.62;
    const segs = 10;
    for (let i = 0; i < segs; i++) {
      const a = Y1 - 0.1 - (i * (Y1 - Y0 - 0.2)) / segs;
      const b = Y1 - 0.1 - ((i + 1) * (Y1 - Y0 - 0.2)) / segs;
      s += poly([P(X1, a, AZ0), P(X1, b, AZ0), P(X1 + AX, b, AZ1), P(X1 + AX, a, AZ1)], i % 2 ? C.ivory : C.red, THIN);
    }
    s += poly([P(X1, Y1 - 0.1, AZ0), P(X1, Y0 + 0.1, AZ0), P(X1 + AX, Y0 + 0.1, AZ1), P(X1 + AX, Y1 - 0.1, AZ1)], 'none');
    // ひさしの垂れ（スカラップ）
    s += `<g transform="${faceX(X1 + AX, Y1 - 0.1, AZ1)}">`;
    const w = (Y1 - Y0 - 0.2) * 25;
    for (let i = 0; i < segs; i++) {
      const x0 = (i * w) / segs;
      s += `<path d="M${r1(x0)} 0 h${r1(w / segs)} v3 q${r1(-w / segs / 2)} 7 ${r1(-w / segs)} 0 z" fill="${(segs - 1 - i) % 2 ? C.ivory : C.red}" ${THIN}/>`;
    }
    s += `</g>`;
    // 屋根（棟は gy 方向）
    const OH = 0.25;
    s += poly([P(X0, Y1, RZ), P(X1, Y1, RZ), P((X0 + X1) / 2, Y1, RIDGE)], '#F6E2C4');
    s += `<g transform="${faceY(Y1, X0, RZ)}">${windowLocal(30, -30, 15, 18, C.woodDark)}</g>`;
    s += poly(
      [P(X1 + OH, Y0 - OH, RZ - 6), P(X1 + OH, Y1 + OH, RZ - 6), P((X0 + X1) / 2, Y1 + OH, RIDGE), P((X0 + X1) / 2, Y0 - OH, RIDGE)],
      C.roofRed
    );
    for (let k = 1; k < 5; k++) {
      const t = k / 5;
      const gx = X1 + OH + ((X0 + X1) / 2 - X1 - OH) * t;
      const z = RZ - 6 + (RIDGE - RZ + 6) * t;
      s += `<path d="M${pts([P(gx, Y0 - OH, z)])} L${pts([P(gx, Y1 + OH, z)])}" stroke="${shade(C.roofRed, -0.22)}" stroke-width="1.1"/>`;
    }
    s += poly([P(X0 - OH, Y1 + OH, RZ - 6), P((X0 + X1) / 2, Y1 + OH, RIDGE), P((X0 + X1) / 2, Y1 + OH + 0.12, RIDGE - 3), P(X0 - OH, Y1 + OH + 0.12, RZ - 9)], shade(C.roofRed, -0.1));
    s += poly([P(X1 + OH, Y1 + OH, RZ - 6), P((X0 + X1) / 2, Y1 + OH, RIDGE), P((X0 + X1) / 2, Y1 + OH + 0.12, RIDGE - 3), P(X1 + OH, Y1 + OH + 0.12, RZ - 9)], shade(C.roofRed, -0.1));
    // 煙突
    s += box(0.9, 2.0, 1.4, 2.5, RZ + 20, 32, '#C98A6B');
    s += `<path d="M${pts([P(1.15, 2.25, RZ + 56)])} q-6 -8 0 -14 q6 -6 0 -14" fill="none" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" opacity=".8"/>`;
    return s;
  }

  function cafe() {
    // 足元 gx 4..9, gy 0..3 / 正面は +gy 面
    const X0 = 4,
      X1 = 9,
      Y0 = 0,
      Y1 = 3,
      F1 = 72,
      F2 = 60,
      RZ = F1 + F2,
      RIDGE = RZ + 38;
    let s = '';
    s += box(X0, Y0, X1, Y1, 0, F1, '#E9C9A0', { left: '#F0D5B0', right: '#D8B48A' });
    s += box(X0, Y0, X1, Y1, F1, F2, '#F2DCC0', { left: '#F5E3CA', right: '#E0C3A0' });
    s += box(X0, Y0, X1 + 0.08, Y1 + 0.08, F1 - 4, 6, C.greenDark);
    // 正面 1階（幅 125：gx 4→9）
    s += `<g transform="${faceY(Y1, X0, 0)}">
      <rect x="0" y="-70" width="125" height="70" fill="${C.woodDark}" ${LINE}/>
      <rect x="8" y="-58" width="58" height="44" rx="2" fill="${C.wood}" ${LINE}/>
      <rect x="11" y="-55" width="52" height="38" fill="${C.glass}" ${THIN}/>
      <path d="M37 -55 V-17 M11 -36 H63" stroke="${C.wood}" stroke-width="2"/>
      <path d="M16 -50 L28 -24" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".6"/>
      <rect x="14" y="-22" width="18" height="5" fill="#E0B98A" ${THIN}/>
      <circle cx="47" cy="-24" r="4" fill="${C.ivory}" ${THIN}/><path d="M51 -25 q3 0 2 3" fill="none" ${THIN}/>
      <rect x="80" y="-62" width="32" height="62" rx="2" fill="${C.wood}" ${LINE}/>
      <rect x="83" y="-59" width="26" height="59" fill="#B98760" ${THIN}/>
      <path d="M80 -62 h32 v20 h-32 z" fill="#3F5F7A" ${LINE}/>
      <path d="M90.7 -62 v20 M101.3 -62 v20" stroke="#2F4A60" stroke-width="1"/>
      <text x="85.5" y="-48" font-size="7" text-anchor="middle" fill="#fff" font-weight="800">喫</text>
      <text x="106.5" y="-48" font-size="7" text-anchor="middle" fill="#fff" font-weight="800">茶</text>
      <rect x="0" y="-6" width="125" height="6" fill="#6B4632" ${LINE}/>
    </g>`;
    // 正面 2階
    s += `<g transform="${faceY(Y1, X0, F1)}">
      ${windowLocal(10, -50, 26, 32, C.greenDark)}
      ${windowLocal(89, -50, 26, 32, C.greenDark)}
      <rect x="6" y="-18" width="34" height="7" fill="${C.green}" ${THIN}/>
      <rect x="85" y="-18" width="34" height="7" fill="${C.green}" ${THIN}/>
      <rect x="42" y="-46" width="42" height="24" rx="3" fill="${C.greenDark}" ${LINE}/>
      <rect x="44.5" y="-43.5" width="37" height="19" rx="2" fill="${C.ivory}" ${THIN}/>
      <text x="63" y="-30.5" font-size="8.6" text-anchor="middle" fill="${C.greenDark}" font-weight="900">ふくろう</text>
    </g>`;
    // 窓上の小さな日よけ
    const sa = (a, b) => {
      let out = '';
      const n = 5;
      for (let i = 0; i < n; i++) {
        const g0 = a + ((b - a) * i) / n;
        const g1 = a + ((b - a) * (i + 1)) / n;
        out += poly([P(g0, Y1, 66), P(g1, Y1, 66), P(g1, Y1 + 0.42, 56), P(g0, Y1 + 0.42, 56)], i % 2 ? C.ivory : C.green, THIN);
      }
      return out;
    };
    s += sa(X0 + 0.3, X0 + 2.65);
    // 提灯
    [X0 + 3.1, X0 + 4.7].forEach((gx) => {
      const [x, y] = P(gx, Y1 + 0.12, 64);
      s += `<path d="M${x} ${y - 6} V${y - 2}" stroke="${C.ink}" stroke-width="1"/><ellipse cx="${x}" cy="${y + 5}" rx="5" ry="7" fill="${C.red}" ${LINE}/><path d="M${x - 5} ${y + 3} h10 M${x - 5} ${y + 7} h10" stroke="#B8443E" stroke-width=".9"/><rect x="${x - 2.5}" y="${y - 2.5}" width="5" height="2" fill="${C.ink}"/>`;
    });
    // 側面（+gx 面）の窓
    s += `<g transform="${faceX(X1, Y1, F1)}">${windowLocal(25, -48, 24, 30, C.greenDark)}</g>`;
    s += `<g transform="${faceX(X1, Y1, 0)}">${windowLocal(22, -54, 28, 32, C.wood)}</g>`;
    // 屋根（棟は gx 方向）
    const OH = 0.25;
    const RY = (Y0 + Y1) / 2;
    s += poly([P(X1, Y0, RZ), P(X1, Y1, RZ), P(X1, RY, RIDGE)], '#E0C3A0');
    s += poly([P(X0 - OH, Y1 + OH, RZ - 6), P(X1 + OH, Y1 + OH, RZ - 6), P(X1 + OH, RY, RIDGE), P(X0 - OH, RY, RIDGE)], C.roofGreen);
    for (let k = 1; k < 4; k++) {
      const t = k / 4;
      const gy = Y1 + OH + (RY - Y1 - OH) * t;
      const z = RZ - 6 + (RIDGE - RZ + 6) * t;
      s += `<path d="M${pts([P(X0 - OH, gy, z)])} L${pts([P(X1 + OH, gy, z)])}" stroke="${shade(C.roofGreen, -0.22)}" stroke-width="1.1"/>`;
    }
    s += poly([P(X1 + OH, Y1 + OH, RZ - 6), P(X1 + OH, RY, RIDGE), P(X1 + OH + 0.12, RY, RIDGE - 3), P(X1 + OH + 0.12, Y1 + OH, RZ - 9)], shade(C.roofGreen, -0.2));
    s += poly([P(X1 + OH, Y0 - OH, RZ - 6), P(X1 + OH, RY, RIDGE), P(X1 + OH + 0.12, RY, RIDGE - 3), P(X1 + OH + 0.12, Y0 - OH, RZ - 9)], shade(C.roofGreen, -0.2));
    // 屋根の上の小窓
    s += box(6.1, 1.9, 6.9, 2.6, RZ + 8, 20, '#F2DCC0');
    s += poly([P(6.0, 2.7, RZ + 28), P(7.0, 2.7, RZ + 28), P(6.5, 2.7, RZ + 40)], C.roofGreen);
    s += `<g transform="${faceY(2.6, 6.1, RZ + 8)}">${windowLocal(4, -17, 12, 14, C.greenDark)}</g>`;
    return s;
  }

  /* ---------- 地面 ---------- */

  function ground() {
    let s = '';
    const T = 26;
    // 土台の側面
    s += poly([P(0, N, 0), P(N, N, 0), P(N, N, -T), P(0, N, -T)], C.soil);
    s += poly([P(N, 0, 0), P(N, N, 0), P(N, N, -T), P(N, 0, -T)], C.soilDark);
    s += poly([P(0, N, 0), P(N, N, 0), P(N, N, -7), P(0, N, -7)], '#E8C49A');
    s += poly([P(N, 0, 0), P(N, N, 0), P(N, N, -7), P(N, 0, -7)], '#D9AC7E');
    // 舗装
    s += poly([P(0, 0), P(N, 0), P(N, N), P(0, N)], C.paving);
    let tiles = '';
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        if ((i * 7 + j * 3) % 5 === 0) tiles += pts([P(i + 0.06, j + 0.06), P(i + 0.94, j + 0.06), P(i + 0.94, j + 0.94), P(i + 0.06, j + 0.94)]) + '|';
      }
    }
    tiles
      .split('|')
      .filter(Boolean)
      .forEach((p) => (s += `<polygon points="${p}" fill="${C.paving2}"/>`));
    let grid = '';
    for (let i = 1; i < N; i++) {
      grid += `M${pts([P(i, 0)])} L${pts([P(i, N)])} M${pts([P(0, i)])} L${pts([P(N, i)])} `;
    }
    s += `<path d="${grid}" stroke="${C.ink}" stroke-opacity=".1" stroke-width="1"/>`;
    // 店の前の歩道（少し濃い）と縁石
    s += poly([P(3, 0.6), P(3.9, 0.6), P(3.9, 6.6), P(3, 6.6)], '#E4D2B0', 'stroke="none"');
    s += poly([P(3.9, 3), P(10, 3), P(10, 3.9), P(3.9, 3.9)], '#E4D2B0', 'stroke="none"');
    s += `<path d="M${pts([P(3.9, 0.6)])} L${pts([P(3.9, 3.9)])} L${pts([P(10, 3.9)])}" stroke="${C.curb}" stroke-width="2.4" fill="none"/>`;
    // 庭（芝生）
    s += poly([P(0, 6.6), P(3.4, 6.6), P(3.4, N), P(0, N)], C.grass);
    s += poly([P(3.4, 6.6), P(3.4, N), P(3.4, N, 4), P(3.4, 6.6, 4)], '#C9B08A', THIN);
    s += poly([P(0, 6.6), P(3.4, 6.6), P(3.4, 6.6, 4), P(0, 6.6, 4)], '#C9B08A', THIN);
    for (let k = 0; k < 18; k++) {
      const gx = 0.3 + ((k * 37) % 30) / 10;
      const gy = 6.9 + ((k * 53) % 48) / 10;
      const [x, y] = P(gx, gy);
      s += `<path d="M${r1(x - 2)} ${r1(y)} l1 -3 l1 3 l1 -2.5 l1 2.5" fill="none" stroke="${C.grassDark}" stroke-width="1"/>`;
    }
    // 庭の飛び石
    [
      [3.0, 8.4],
      [2.4, 8.9],
      [1.8, 9.5]
    ].forEach(([gx, gy]) => (s += ell(isoEllipse(gx, gy, 0.22), '#E7DCC6', THIN)));
    // 広場
    const pl = isoEllipse(7.2, 7.2, 2.65);
    s += ell(pl, C.curb);
    s += ell(isoEllipse(7.2, 7.2, 2.45), '#EFE3CB', THIN);
    let ring = '';
    for (let a = 0; a < 360; a += 10) {
      const rad = (a * Math.PI) / 180;
      const gx = 7.2 + Math.cos(rad) * 2.2;
      const gy = 7.2 + Math.sin(rad) * 2.2;
      const [x, y] = P(gx, gy);
      ring += `<ellipse cx="${r1(x)}" cy="${r1(y)}" rx="5.4" ry="2.7" fill="${(a / 10) % 2 ? '#DCC7A4' : '#E5D3B3'}"/>`;
    }
    s += ring;
    // 中央のモザイク
    const c0 = P(7.2, 7.2);
    s += ell(isoEllipse(7.2, 7.2, 0.8), '#E3CFAC', THIN);
    s += `<path d="M${c0[0]} ${c0[1] - 12} L${c0[0] + 6} ${c0[1]} L${c0[0]} ${c0[1] + 12} L${c0[0] - 6} ${c0[1]} Z M${c0[0] - 24} ${c0[1]} L${c0[0]} ${c0[1] - 3} L${c0[0] + 24} ${c0[1]} L${c0[0]} ${c0[1] + 3} Z" fill="${C.coral}" opacity=".55"/>`;
    // 広場から手前へのレンガ道
    s += poly([P(6.4, 9.6), P(8.0, 9.6), P(8.0, N), P(6.4, N)], '#E2B48E', 'stroke="none"');
    let bricks = '';
    for (let gy = 9.8; gy < N; gy += 0.4) bricks += `M${pts([P(6.4, gy)])} L${pts([P(8.0, gy)])} `;
    s += `<path d="${bricks}" stroke="#C98F66" stroke-width="1"/>`;
    s += `<path d="M${pts([P(6.4, 9.6)])} L${pts([P(6.4, N)])} M${pts([P(8.0, 9.6)])} L${pts([P(8.0, N)])}" stroke="#C98F66" stroke-width="1.6"/>`;
    // 枯れ葉
    [
      [5.2, 6.2, C.autumn],
      [9.9, 8.6, C.butter],
      [5.6, 11.2, C.autumn],
      [10.8, 5.2, C.autumn2]
    ].forEach(([gx, gy, c]) => {
      const [x, y] = P(gx, gy);
      s += `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="1.4" fill="${c}" transform="rotate(25 ${x} ${y})"/>`;
    });
    return s;
  }

  function sky(opts) {
    if (opts && opts.noSky) return '';
    return `<rect x="-200" y="-200" width="1000" height="1000" fill="url(#oy-sky)"/>
      <g fill="${C.cloud}" opacity=".95">
        <path d="M60 210 q-4 -26 22 -30 q8 -26 36 -18 q20 -18 42 4 q26 -2 24 22 q16 10 4 24 h-118 q-16 -2 -10 -2 z"/>
        <path d="M410 100 q-2 -18 18 -20 q10 -20 34 -10 q20 -8 28 12 q18 4 12 22 h-86 q-10 -2 -6 -4 z"/>
        <path d="M470 250 q0 -14 14 -16 q8 -14 24 -6 q14 -2 16 12 q10 4 6 14 h-58 q-4 -2 -2 -4 z" opacity=".8"/>
      </g>`;
  }

  /* ---------- 住人 ---------- */

  function limb(x1, y1, cx, cy, x2, y2, color, w) {
    const d = `M${x1} ${y1} Q${cx} ${cy} ${x2} ${y2}`;
    return `<path d="${d}" fill="none" stroke="${C.ink}" stroke-width="${w + 2.8}" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round"/>`;
  }

  function eyes(kind, hx, hy, look) {
    const lx = look || 0;
    const out = [];
    [-6, 6].forEach((dx) => {
      const x = hx + dx;
      const y = hy + 1;
      switch (kind) {
        case 'half':
          out.push(`<ellipse cx="${x + lx}" cy="${y + 0.8}" rx="2" ry="1.3" fill="${C.ink}"/><path d="M${x - 3} ${y - 0.5} H${x + 3}" stroke="${C.ink}" stroke-width="1.5" stroke-linecap="round"/>`);
          break;
        case 'wide':
          out.push(`<ellipse cx="${x + lx}" cy="${y}" rx="2.6" ry="3.3" fill="${C.ink}"/><circle cx="${x + lx - 0.9}" cy="${y - 1.3}" r="1.1" fill="#fff"/><circle cx="${x + lx + 0.8}" cy="${y + 1}" r=".5" fill="#fff"/>`);
          break;
        case 'happy':
          out.push(`<path d="M${x - 3} ${y + 1} Q${x} ${y - 3.5} ${x + 3} ${y + 1}" fill="none" stroke="${C.ink}" stroke-width="1.6" stroke-linecap="round"/>`);
          break;
        case 'closed':
          out.push(`<path d="M${x - 3} ${y - 0.5} Q${x} ${y + 2.5} ${x + 3} ${y - 0.5}" fill="none" stroke="${C.ink}" stroke-width="1.6" stroke-linecap="round"/>`);
          break;
        case 'down':
          out.push(`<ellipse cx="${x + lx}" cy="${y + 1.5}" rx="1.9" ry="1.9" fill="${C.ink}"/>`);
          break;
        default:
          out.push(`<ellipse cx="${x + lx}" cy="${y}" rx="2" ry="2.6" fill="${C.ink}"/><circle cx="${x + lx - 0.6}" cy="${y - 1}" r=".7" fill="#fff"/>`);
      }
    });
    return out.join('');
  }

  function brows(kind, hx, hy) {
    const y = hy - 5;
    switch (kind) {
      case 'sad':
        return `<path d="M${hx - 9} ${y + 0.5} L${hx - 3.5} ${y - 1.8} M${hx + 3.5} ${y - 1.8} L${hx + 9} ${y + 0.5}" stroke="${C.ink}" stroke-width="1.4" stroke-linecap="round"/>`;
      case 'up':
        return `<path d="M${hx - 9} ${y - 2} Q${hx - 6} ${y - 4.5} ${hx - 3} ${y - 2.5} M${hx + 3} ${y - 2.5} Q${hx + 6} ${y - 4.5} ${hx + 9} ${y - 2}" fill="none" stroke="${C.ink}" stroke-width="1.4" stroke-linecap="round"/>`;
      case 'flat':
        return `<path d="M${hx - 9} ${y} H${hx - 3.5} M${hx + 3.5} ${y} H${hx + 9}" stroke="${C.ink}" stroke-width="1.4" stroke-linecap="round"/>`;
      default:
        return '';
    }
  }

  function mouth(kind, hx, hy) {
    const y = hy + 8;
    const red = '#B5524A';
    switch (kind) {
      case 'frown':
        return `<path d="M${hx - 3} ${y + 1} Q${hx} ${y - 1.8} ${hx + 3} ${y + 1}" fill="none" stroke="${C.ink}" stroke-width="1.4" stroke-linecap="round"/>`;
      case 'flat':
        return `<path d="M${hx - 2.5} ${y} H${hx + 2.5}" stroke="${C.ink}" stroke-width="1.4" stroke-linecap="round"/>`;
      case 'smile':
        return `<path d="M${hx - 3.5} ${y - 1} Q${hx} ${y + 3} ${hx + 3.5} ${y - 1}" fill="none" stroke="${C.ink}" stroke-width="1.4" stroke-linecap="round"/>`;
      case 'open':
        return `<path d="M${hx - 4.5} ${y - 1.5} Q${hx} ${y + 6} ${hx + 4.5} ${y - 1.5} Z" fill="${red}" ${THIN}/><path d="M${hx - 2.4} ${y + 1.8} Q${hx} ${y + 0.2} ${hx + 2.4} ${y + 1.8}" fill="none" stroke="#F2A7A0" stroke-width="1.2"/>`;
      case 'o':
        return `<ellipse cx="${hx}" cy="${y + 0.5}" rx="2.2" ry="2.8" fill="${red}" ${THIN}/>`;
      case 'wavy':
        return `<path d="M${hx - 4} ${y} q1 -1.6 2 0 q1 1.6 2 0 q1 -1.6 2 0 q1 1.6 2 0" fill="none" stroke="${C.ink}" stroke-width="1.3" stroke-linecap="round"/>`;
      default:
        return '';
    }
  }

  /**
   * 汎用の人物（足元が原点、正面向き。左右反転は外側で）
   * pose: { tilt, lean, hands:[[lx,ly],[rx,ry]], feet:[[lx,ly],[rx,ry]], dy, eyes, brows, mouth, look }
   */
  function figure(o, pose) {
    const hx = 0;
    const hy = -58 + (pose.dy || 0);
    const by = pose.dy || 0;
    const sh = o.torsoW || 11;
    const [hl, hr] = pose.hands;
    const [fl, fr] = pose.feet || [
      [-5, 0],
      [5, 0]
    ];
    let s = '';
    s += `<ellipse class="ch-shadow" cx="0" cy="0" rx="15" ry="5" fill="rgba(89,72,63,.25)"/>`;
    s += o.behind ? o.behind(pose) : '';
    // 脚
    s += `<g class="ch-legs">`;
    s += limb(-4, -20 + by, -4.5, -10 + by, fl[0], fl[1] - 3, o.legs, 5.2);
    s += limb(4, -20 + by, 4.5, -10 + by, fr[0], fr[1] - 3, o.legs, 5.2);
    s += `<path d="M${fl[0] - 4.5} ${fl[1]} Q${fl[0] - 4.5} ${fl[1] - 5.5} ${fl[0]} ${fl[1] - 5} Q${fl[0] + 4} ${fl[1] - 4.5} ${fl[0] + 3.5} ${fl[1]} Z" fill="${o.shoes}" ${LINE}/>`;
    s += `<path d="M${fr[0] - 3.5} ${fr[1]} Q${fr[0] - 4} ${fr[1] - 4.5} ${fr[0]} ${fr[1] - 5} Q${fr[0] + 4.5} ${fr[1] - 5.5} ${fr[0] + 4.5} ${fr[1]} Z" fill="${o.shoes}" ${LINE}/>`;
    s += `</g>`;
    s += `<g class="ch-upper" transform="rotate(${pose.lean || 0} 0 ${-20 + by})">`;
    // 胴体
    s += o.torso ? o.torso(by, sh) : `<path d="M${-sh} ${-42 + by} Q${-sh - 2} ${-30 + by} ${-sh - 1} ${-17 + by} L${sh + 1} ${-17 + by} Q${sh + 2} ${-30 + by} ${sh} ${-42 + by} Q0 ${-46 + by} ${-sh} ${-42 + by} Z" fill="${o.top}" ${LINE}/>`;
    // 腕
    const arm = (sx, h) => {
      const mx = (sx + h[0]) / 2 + (sx < 0 ? -3 : 3);
      const my = (-38 + by + h[1]) / 2;
      return limb(sx, -38 + by, mx, my, h[0], h[1], o.sleeve || o.top, 4.8) + `<circle cx="${h[0]}" cy="${h[1]}" r="3.3" fill="${o.skin}" ${LINE}/>`;
    };
    s += o.backHandItem ? o.backHandItem(pose) : '';
    s += arm(-sh + 1, hl);
    s += arm(sh - 1, hr);
    s += o.handItem ? o.handItem(pose) : '';
    // 頭
    s += `<g class="ch-head" transform="rotate(${pose.tilt || 0} 0 ${-42 + by})">`;
    s += o.hairBack ? o.hairBack(hx, hy) : '';
    s += `<circle cx="${hx - 15.5}" cy="${hy + 1}" r="3.4" fill="${o.skin}" ${LINE}/><circle cx="${hx + 15.5}" cy="${hy + 1}" r="3.4" fill="${o.skin}" ${LINE}/>`;
    s += `<circle cx="${hx}" cy="${hy}" r="${o.headR || 16}" fill="${o.skin}" ${LINE}/>`;
    s += `<ellipse cx="${hx - 9.5}" cy="${hy + 5}" rx="3.2" ry="2" fill="#F2A7A0" opacity=".6"/><ellipse cx="${hx + 9.5}" cy="${hy + 5}" rx="3.2" ry="2" fill="#F2A7A0" opacity=".6"/>`;
    s += eyes(pose.eyes, hx, hy, pose.look);
    s += brows(pose.brows, hx, hy);
    s += o.nose ? o.nose(hx, hy) : '';
    s += mouth(pose.mouth, hx, hy);
    s += o.hair ? o.hair(hx, hy) : '';
    s += `</g>`;
    s += o.frontItem ? o.frontItem(pose) : '';
    s += pose.extra || '';
    s += `</g>`;
    return s;
  }

  const MARU = {
    skin: '#F5CDAA',
    top: '#FBF6EC',
    legs: '#6B5446',
    shoes: '#5A3E2E',
    torsoW: 12.5,
    torso: (by, sh) =>
      `<path d="M${-sh} ${-42 + by} Q${-sh - 3} ${-30 + by} ${-sh - 2} ${-16 + by} L${sh + 2} ${-16 + by} Q${sh + 3} ${-30 + by} ${sh} ${-42 + by} Q0 ${-46 + by} ${-sh} ${-42 + by} Z" fill="#FBF6EC" ${LINE}/>` +
      `<path d="M-9 ${-36 + by} H9 L11 ${-13 + by} H-11 Z" fill="#B97A50" ${LINE}/>` +
      `<path d="M-9 ${-36 + by} L-11 ${-42 + by} M9 ${-36 + by} L11 ${-42 + by}" stroke="#B97A50" stroke-width="2"/>` +
      `<rect x="-5" y="${-28 + by}" width="10" height="7" rx="1.5" fill="#C98A5B" ${THIN}/>` +
      `<path d="M-11 ${-24 + by} H11" stroke="#A86E47" stroke-width="1.2"/>`,
    hair: (x, y) =>
      `<path d="M${x - 14} ${y - 2} Q${x - 15} ${y + 6} ${x - 12} ${y + 8} L${x - 11} ${y - 2} Z M${x + 14} ${y - 2} Q${x + 15} ${y + 6} ${x + 12} ${y + 8} L${x + 11} ${y - 2} Z" fill="#6B4A36" ${THIN}/>` +
      `<circle cx="${x - 9}" cy="${y - 22}" r="7.5" fill="#fff" ${LINE}/><circle cx="${x + 9}" cy="${y - 22}" r="7.5" fill="#fff" ${LINE}/><circle cx="${x}" cy="${y - 26}" r="9.5" fill="#fff" ${LINE}/>` +
      `<path d="M${x - 13} ${y - 17} Q${x} ${y - 21} ${x + 13} ${y - 17} L${x + 13} ${y - 10} Q${x} ${y - 13} ${x - 13} ${y - 10} Z" fill="#fff" ${LINE}/>` +
      `<path d="M${x - 4} ${y - 30} q3 -3 7 -1" fill="none" stroke="#E4DCD0" stroke-width="2" stroke-linecap="round"/>`,
    nose: (x, y) =>
      `<path d="M${x} ${y + 3.5} q1.8 1.5 0 3" fill="none" stroke="${C.ink}" stroke-width="1.1" stroke-linecap="round"/>` +
      `<path d="M${x - 6.5} ${y + 7.5} Q${x - 3} ${y + 4.6} ${x} ${y + 6.6} Q${x + 3} ${y + 4.6} ${x + 6.5} ${y + 7.5} Q${x + 3} ${y + 8.6} ${x} ${y + 7.4} Q${x - 3} ${y + 8.6} ${x - 6.5} ${y + 7.5} Z" fill="#6B4A36"/>`
  };

  const COCO = {
    skin: '#F7D2B3',
    top: C.butter,
    legs: '#F7D2B3',
    shoes: C.red,
    torsoW: 10,
    headR: 16.5,
    torso: (by, sh) =>
      `<path d="M${-sh} ${-40 + by} Q${-sh - 2} ${-30 + by} ${-sh - 1} ${-22 + by} L${sh + 1} ${-22 + by} Q${sh + 2} ${-30 + by} ${sh} ${-40 + by} Q0 ${-44 + by} ${-sh} ${-40 + by} Z" fill="${C.butter}" ${LINE}/>` +
      `<path d="M${-sh - 1.4} ${-31 + by} H${sh + 1.4}" stroke="${C.coral}" stroke-width="3"/>` +
      `<path d="M${-sh - 1} ${-23 + by} L${-sh - 2} ${-14 + by} L-1 ${-14 + by} L0 ${-18 + by} L1 ${-14 + by} L${sh + 2} ${-14 + by} L${sh + 1} ${-23 + by} Z" fill="#6FA3C8" ${LINE}/>`,
    hair: (x, y) =>
      `<path d="M${x - 16} ${y + 1} Q${x - 18} ${y - 18} ${x} ${y - 18} Q${x + 18} ${y - 18} ${x + 16} ${y + 1} Q${x + 13} ${y - 6} ${x + 8} ${y - 7} Q${x + 6} ${y - 3} ${x + 2} ${y - 8} Q${x - 2} ${y - 3} ${x - 6} ${y - 8} Q${x - 11} ${y - 4} ${x - 16} ${y + 1} Z" fill="#5A3B2A" ${LINE}/>` +
      `<path d="M${x - 2} ${y - 18} q2 -6 6 -5 q-3 1 -2 5" fill="#5A3B2A" ${LINE}/>` +
      `<path d="M${x - 8} ${y - 13} q4 -3 9 -2" fill="none" stroke="#8A6248" stroke-width="1.6" stroke-linecap="round"/>`
  };

  const NENE = {
    skin: '#F6D0B4',
    top: '#5E9C8F',
    legs: '#4F4450',
    shoes: '#7E5539',
    torsoW: 10.5,
    torso: (by, sh) =>
      `<path d="M${-sh} ${-42 + by} Q${-sh - 2} ${-32 + by} ${-sh - 1} ${-26 + by} L${-sh - 6} ${-12 + by} Q0 ${-9 + by} ${sh + 6} ${-12 + by} L${sh + 1} ${-26 + by} Q${sh + 2} ${-32 + by} ${sh} ${-42 + by} Q0 ${-46 + by} ${-sh} ${-42 + by} Z" fill="#5E9C8F" ${LINE}/>` +
      `<path d="M-6 ${-42 + by} L0 ${-35 + by} L6 ${-42 + by}" fill="${C.ivory}" ${THIN}/>` +
      `<path d="M${-sh - 1} ${-26 + by} H${sh + 1}" stroke="#4A7F73" stroke-width="2"/>`,
    hairBack: (x, y) => `<path d="M${x - 16} ${y - 2} Q${x - 20} ${y + 18} ${x - 14} ${y + 22} L${x + 14} ${y + 22} Q${x + 20} ${y + 18} ${x + 16} ${y - 2} Z" fill="#6B4A6E" ${LINE}/>`,
    hair: (x, y) =>
      `<path d="M${x - 16.5} ${y + 3} Q${x - 18} ${y - 18} ${x} ${y - 17} Q${x + 18} ${y - 18} ${x + 16.5} ${y + 3} Q${x + 12} ${y - 9} ${x + 2} ${y - 9} Q${x - 4} ${y - 4} ${x - 9} ${y - 8} Q${x - 13} ${y - 4} ${x - 16.5} ${y + 3} Z" fill="#6B4A6E" ${LINE}/>` +
      `<ellipse cx="${x + 3}" cy="${y - 17}" rx="15" ry="5.5" fill="${C.coral}" transform="rotate(-10 ${x + 3} ${y - 17})" ${LINE}/>` +
      `<circle cx="${x + 4}" cy="${y - 23}" r="2" fill="${C.coral}" ${THIN}/>` +
      `<path d="M${x - 7} ${y - 19} q5 -3 11 -2" fill="none" stroke="#F4A890" stroke-width="1.6" stroke-linecap="round"/>`
  };

  function violin(x, y, rot, s) {
    return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s || 1})">
      <rect x="-1.4" y="-24" width="2.8" height="14" rx="1" fill="#3E2C24" ${THIN}/>
      <circle cx="0" cy="-25" r="2.2" fill="#8A4F2A" ${THIN}/>
      <path d="M0 -12 Q-6 -12 -5.5 -7 Q-3.5 -4 -6 -1 Q-7 5 0 5 Q7 5 6 -1 Q3.5 -4 5.5 -7 Q6 -12 0 -12 Z" fill="#B5652F" ${LINE}/>
      <path d="M-2.5 -6 q-1 2 0 4 M2.5 -6 q1 2 0 4" fill="none" stroke="#3E2C24" stroke-width=".9"/>
      <path d="M0 -22 V2" stroke="#F3E4C8" stroke-width=".6"/>
      <rect x="-2.5" y="1" width="5" height="1.6" fill="#3E2C24"/>
    </g>`;
  }
  const bow = (x1, y1, x2, y2) =>
    `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="#3E2C24" stroke-width="1.6" stroke-linecap="round"/><path d="M${x1} ${y1} L${x2} ${y2}" stroke="#E9DFC9" stroke-width=".6" transform="translate(0 1.4)"/>`;

  const CHAR_POSES = {
    'CH-01': {
      waiting: { tilt: -8, lean: 2, hands: [[-6, -24], [6, -24]], eyes: 'down', brows: 'sad', mouth: 'frown', dy: 1 },
      interested: {
        tilt: 6,
        hands: [[-14, -26], [14, -50]],
        eyes: 'wide',
        brows: 'up',
        mouth: 'o',
        extra: `<path d="M-22 -86 l-5 -6 M-14 -92 l-2 -7 M-30 -78 l-7 -3" stroke="${C.red}" stroke-width="2.2" stroke-linecap="round"/>`
      },
      at_square: {
        tilt: -4,
        hands: [[-3, -27], [3, -27]],
        eyes: 'dot',
        look: -1,
        brows: 'sad',
        mouth: 'wavy',
        extra: `<path d="M17 -70 q-4 6 0 8 q4 -2 0 -8 z" fill="#BFE5F2" ${THIN}/>`
      },
      showing_bread: {
        tilt: 4,
        hands: [[15, -55], [31, -60]],
        eyes: 'happy',
        brows: 'up',
        mouth: 'open',
        extra: `<g><ellipse cx="28" cy="-64" rx="14" ry="3.8" fill="#C9A27A" ${LINE}/>${croissant(21, -67, 0.75, -8)}${croissant(34, -67, 0.75, 8)}${croissant(27.5, -71, 0.8, 0)}</g>` +
          sparkle(-20, -80, 1, C.butter) + sparkle(40, -82, 0.8, C.butter)
      }
    },
    'CH-02': {
      bored: {
        tilt: 10,
        lean: -3,
        hands: [[-12, -20], [12, -20]],
        eyes: 'half',
        brows: 'flat',
        mouth: 'flat',
        dy: 2,
        extra: `<circle cx="20" cy="-76" r="1.4" fill="${C.ink}"/><circle cx="25" cy="-79" r="1.4" fill="${C.ink}"/><circle cx="30" cy="-82" r="1.4" fill="${C.ink}"/>`
      },
      curious: {
        tilt: -6,
        lean: 7,
        hands: [[-13, -24], [15, -44]],
        eyes: 'wide',
        brows: 'up',
        mouth: 'o',
        balloon: [26, -86],
        extra: sparkle(-20, -78, 1) + sparkle(-26, -64, 0.7)
      },
      moving_to_square: {
        lean: 9,
        hands: [[-15, -32], [14, -42]],
        feet: [[-10, -1], [9, 0]],
        eyes: 'happy',
        brows: 'up',
        mouth: 'open',
        balloon: [-6, -92]
      },
      playing: {
        tilt: 4,
        hands: [[-16, -50], [15, -52]],
        feet: [[-7, -2], [7, -2]],
        eyes: 'happy',
        brows: 'up',
        mouth: 'open',
        dy: -3,
        balloon: [12, -104],
        extra: sparkle(-22, -80, 0.9, C.butter)
      }
    },
    'CH-03': {
      discouraged: {
        tilt: -10,
        lean: -2,
        hands: [[-12, -22], [12, -21]],
        eyes: 'down',
        brows: 'sad',
        mouth: 'frown',
        dy: 1,
        violin: 'down'
      },
      encouraged: {
        tilt: 4,
        hands: [[-4, -32], [8, -30]],
        eyes: 'dot',
        look: 1.5,
        brows: 'up',
        mouth: 'smile',
        violin: 'hold'
      },
      playing_music: {
        tilt: -12,
        hands: [[-22, -46], [17, -46]],
        eyes: 'closed',
        brows: 'up',
        mouth: 'smile',
        violin: 'play',
        extra: `<g class="ch-notes">${note(-26, -84, 1.1, '#7B5BA6')}${note(22, -92, 1, C.coral)}${note(30, -70, 0.85, '#5E9C8F')}</g>`
      }
    }
  };

  function characterSVG(id, state) {
    const pose = Object.assign({}, CHAR_POSES[id][state]);
    if (id === 'CH-01') {
      return `<g transform="scale(1.06)">${figure(MARU, pose)}</g>`;
    }
    if (id === 'CH-02') {
      const o = Object.assign({}, COCO);
      if (pose.balloon) {
        const h = pose.hands[1];
        const [bx, by] = pose.balloon;
        o.behind = () => `<g class="ch-balloon"><path d="M${h[0]} ${h[1]} Q${(h[0] + bx) / 2 + 6} ${(h[1] + by) / 2} ${bx} ${by + 2}" fill="none" stroke="${C.ink}" stroke-width="1"/>${balloonShape(bx, by, 1)}</g>`;
      }
      return `<g transform="scale(.86)">${figure(o, pose)}</g>`;
    }
    const o = Object.assign({}, NENE);
    if (pose.violin === 'down') o.handItem = () => violin(13, -9, 172, 0.95) + bow(-12, -21, -16, 2);
    else if (pose.violin === 'hold') o.backHandItem = () => violin(1, -28, -38, 0.95) + bow(10, -31, 16, -10);
    else if (pose.violin === 'play') o.frontItem = () => violin(-9, -41, -72, 1) + bow(17, -47, -14, -30);
    return `<g transform="scale(.98)">${figure(o, pose)}</g>`;
  }

  /** 顔だけのアイコン（メッセージ欄など） */
  function portraitSVG(id, state) {
    const vb = id === 'CH-02' ? '-22 -82 44 44' : id === 'CH-01' ? '-24 -96 48 48' : '-24 -86 48 48';
    return `<svg viewBox="${vb}" aria-hidden="true" focusable="false">${characterSVG(id, state)}</svg>`;
  }


  /* ---------- 見物人（演奏会に集まる人） ---------- */

  const MASTER = {
    skin: '#F2C9A5',
    top: '#FBF6EC',
    sleeve: '#FBF6EC',
    legs: '#4A4040',
    shoes: '#3E2C24',
    torsoW: 11.5,
    torso: (by, sh) =>
      `<path d="M${-sh} ${-42 + by} Q${-sh - 2} ${-30 + by} ${-sh - 1} ${-17 + by} L${sh + 1} ${-17 + by} Q${sh + 2} ${-30 + by} ${sh} ${-42 + by} Q0 ${-46 + by} ${-sh} ${-42 + by} Z" fill="#FBF6EC" ${LINE}/>` +
      `<path d="M${-sh} ${-41 + by} L-3 ${-30 + by} L-3 ${-17 + by} L${-sh - 1} ${-17 + by} Q${-sh - 2} ${-30 + by} ${-sh} ${-41 + by} Z M${sh} ${-41 + by} L3 ${-30 + by} L3 ${-17 + by} L${sh + 1} ${-17 + by} Q${sh + 2} ${-30 + by} ${sh} ${-41 + by} Z" fill="#4F6B5A" ${THIN}/>` +
      `<path d="M-2 ${-42 + by} L0 ${-38 + by} L2 ${-42 + by}" fill="#7B3F3F" ${THIN}/>`,
    hair: (x, y) =>
      `<path d="M${x - 15.5} ${y - 1} Q${x - 16} ${y - 15} ${x} ${y - 16} Q${x + 16} ${y - 15} ${x + 15.5} ${y - 1} Q${x + 12} ${y - 8} ${x} ${y - 9} Q${x - 12} ${y - 8} ${x - 15.5} ${y - 1} Z" fill="#B9B2AA" ${LINE}/>` +
      `<circle cx="${x - 6}" cy="${y + 1}" r="4.6" fill="none" ${THIN}/><circle cx="${x + 6}" cy="${y + 1}" r="4.6" fill="none" ${THIN}/><path d="M${x - 1.4} ${y + 1} H${x + 1.4}" ${THIN}/>`
  };

  const GRANNY = {
    skin: '#F3D2BC',
    top: '#9C7BB0',
    legs: '#8A776A',
    shoes: '#6B4A36',
    torsoW: 11,
    torso: (by, sh) =>
      `<path d="M${-sh} ${-40 + by} Q${-sh - 2} ${-30 + by} ${-sh - 1} ${-24 + by} L${-sh - 4} ${-12 + by} Q0 ${-9 + by} ${sh + 4} ${-12 + by} L${sh + 1} ${-24 + by} Q${sh + 2} ${-30 + by} ${sh} ${-40 + by} Q0 ${-44 + by} ${-sh} ${-40 + by} Z" fill="#9C7BB0" ${LINE}/>` +
      `<path d="M${-sh - 2} ${-24 + by} L${-sh - 4} ${-12 + by} Q0 ${-9 + by} ${sh + 4} ${-12 + by} L${sh + 2} ${-24 + by} Z" fill="#B97A50" ${LINE}/>` +
      `<circle cx="0" cy="${-35 + by}" r="1.2" fill="${C.ivory}"/><circle cx="0" cy="${-30 + by}" r="1.2" fill="${C.ivory}"/>`,
    hair: (x, y) =>
      `<circle cx="${x}" cy="${y - 18}" r="6.5" fill="#D9D3CC" ${LINE}/>` +
      `<path d="M${x - 15.5} ${y + 1} Q${x - 17} ${y - 15} ${x} ${y - 15} Q${x + 17} ${y - 15} ${x + 15.5} ${y + 1} Q${x + 10} ${y - 8} ${x} ${y - 8} Q${x - 10} ${y - 8} ${x - 15.5} ${y + 1} Z" fill="#D9D3CC" ${LINE}/>` +
      `<path d="M${x - 6} ${y - 11} q6 -3 12 0" fill="none" stroke="#B9B2AA" stroke-width="1.2"/>`
  };

  const CLAP = { hands: [[-3, -42], [4, -43]], eyes: 'happy', brows: 'up', mouth: 'open', tilt: 4 };

  function extraSVG(kind) {
    if (kind === 'master') return `<g transform="scale(1.02)">${figure(MASTER, CLAP)}</g>`;
    if (kind === 'granny') return `<g transform="scale(.9)">${figure(GRANNY, Object.assign({}, CLAP, { tilt: -4, mouth: 'smile' }))}</g>`;
    // ねこ（すわってしっぽを振る）
    return `<g transform="scale(.95)">
      <ellipse cx="0" cy="0" rx="10" ry="3.5" fill="rgba(89,72,63,.22)"/>
      <path class="cat-tail" d="M7 -3 Q16 -4 15 -14 Q14 -19 18 -20" fill="none" stroke="${C.ink}" stroke-width="5.4" stroke-linecap="round"/>
      <path class="cat-tail" d="M7 -3 Q16 -4 15 -14 Q14 -19 18 -20" fill="none" stroke="#F0A86E" stroke-width="3" stroke-linecap="round"/>
      <path d="M-8 0 Q-10 -14 0 -16 Q10 -14 8 0 Z" fill="#F0A86E" ${LINE}/>
      <path d="M-3 -1 V-6 M3 -1 V-6" stroke="${C.ink}" stroke-width="1"/>
      <path d="M-9 -24 L-8 -33 L-3 -27 M9 -24 L8 -33 L3 -27" fill="#F0A86E" ${LINE}/>
      <circle cx="0" cy="-22" r="9" fill="#F0A86E" ${LINE}/>
      <path d="M-4 -29 l1.5 3 M0 -30.5 v3 M4 -29 l-1.5 3" stroke="#C97A45" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M-5 -22 q1.5 -2 3 0 M2 -22 q1.5 -2 3 0" fill="none" stroke="${C.ink}" stroke-width="1.2" stroke-linecap="round"/>
      <path d="M-1.2 -19 h2.4 l-1.2 1.4 z" fill="#E88A8A"/>
      <path d="M0 -17.6 q-1.6 1.8 -3 .6 M0 -17.6 q1.6 1.8 3 .6" fill="none" stroke="${C.ink}" stroke-width=".9"/>
    </g>`;
  }

  /* ---------- 反応のしるし（頭の上にぽんと出る） ---------- */

  function markSVG(kind) {
    switch (kind) {
      case 'notice':
        return `<path d="M0 6 L-4 -1 Q-11 -3 -11 -11 Q-11 -20 0 -20 Q11 -20 11 -11 Q11 -3 4 -1 Z" fill="${C.ivory}" ${LINE}/>
          <path d="M-1.6 -16 H1.6 L1 -8 H-1 Z" fill="${C.red}"/><circle cx="0" cy="-4.8" r="1.7" fill="${C.red}"/>`;
      case 'spark':
        return sparkle(-9, -6, 1.3, C.butter) + sparkle(8, -14, 1.6, C.butter) + sparkle(10, 2, 0.9, '#fff');
      case 'joy':
        return `<path d="M0 -4 C-4 -9 -11 -6 -9 -1 C-8 2 -3 4 0 7 C3 4 8 2 9 -1 C11 -6 4 -9 0 -4 Z" fill="${C.coral}" ${LINE}/>
          <path d="M-15 -10 l-4 -3 M15 -10 l4 -3 M-14 2 l-5 0 M14 2 l5 0" stroke="${C.ink}" stroke-width="1.6" stroke-linecap="round"/>`;
      case 'music':
        return note(-7, 2, 1.4, '#7B5BA6') + note(7, -6, 1.2, C.coral);
      default:
        return '';
    }
  }

  /** 手渡しで飛ぶアイテムの絵 */
  function itemFlySVG(id) {
    if (id === 'IT-01') return balloonShape(0, 10, 1);
    if (id === 'IT-02') return scoreSheet(0, 8, 1, -8);
    return croissant(0, 0, 1.3, -6);
  }

  function cloudSVG(w) {
    return `<svg viewBox="0 0 120 50" width="${w}" aria-hidden="true"><path d="M8 46 q-6 -16 12 -20 q4 -18 26 -14 q12 -14 30 -2 q22 -4 22 16 q14 4 10 20 z" fill="${C.cloud}"/></svg>`;
  }

  /* ---------- アイテム（町の中の見た目・アイコン） ---------- */

  function itemSceneSVG(id) {
    if (id === 'IT-01') {
      // ベンチの端に結んだ風船
      return `<g class="it-balloon"><path d="M0 -14 Q-6 -34 -10 -52" fill="none" stroke="${C.ink}" stroke-width="1"/>${balloonShape(-10, -52, 1.15)}</g>`;
    }
    if (id === 'IT-02') {
      return `<ellipse cx="0" cy="0" rx="12" ry="4" fill="rgba(89,72,63,.18)"/><g transform="translate(0 0)">${scoreSheet(-4, 0, 1.15, -8)}${scoreSheet(5, 0, 1.15, 10)}</g>`;
    }
    return `<g>${basketOfBread(0, -24, 1.05)}</g>`;
  }

  function itemIconSVG(id) {
    const inner =
      id === 'IT-01'
        ? `<path d="M0 6 Q4 14 -2 20" fill="none" stroke="${C.ink}" stroke-width="1"/>${balloonShape(0, 6, 1.1)}`
        : id === 'IT-02'
        ? scoreSheet(0, 11, 1.25, -6)
        : `${croissant(0, 6, 1.6, 0)}`;
    return `<svg viewBox="-16 -22 32 36" aria-hidden="true" focusable="false">${inner}</svg>`;
  }

  /* ---------- 町全体 ---------- */

  /** 動かない飾り（スプライトとして奥行き順に並べる） */
  function decorSprites() {
    return [
      { gx: 1.4, gy: 8.0, svg: tree(1.4, 8.0, { color: C.autumn, s: 1.05 }) },
      { gx: 2.4, gy: 10.6, svg: tree(2.4, 10.6, { color: C.leaf, s: 0.9 }) },
      { gx: 1.7, gy: 9.5, svg: conifer(1.7, 9.5, 1, C.autumn) },
      { gx: 3.0, gy: 7.3, svg: bush(3.0, 7.3, 0.9) },
      { gx: 2.6, gy: 11.0, svg: bush(2.6, 11.0, 0.8, C.leafDark) },
      { gx: 2.9, gy: 9.3, svg: flowers(2.9, 9.3) },
      { gx: 4.55, gy: 9.85, svg: bench(4.3, 9.1, 4.8, 10.6) },
      { gx: 3.75, gy: 5.2, svg: table(3.75, 5.2) },
      { gx: 3.55, gy: 6.75, svg: lamp(3.55, 6.75) },
      { gx: 10.3, gy: 6.1, svg: lamp(10.3, 6.1) },
      { gx: 10.2, gy: 1.8, svg: utilityPole(10.2, 1.8) },
      { gx: 10.7, gy: 3.4, svg: bicycle(10.7, 3.4, C.red) },
      { gx: 10.6, gy: 9.6, svg: hedge(9.6, 9.2, 11.6, 10.0) },
      { gx: 10.4, gy: 11.2, svg: bush(10.4, 11.2, 0.85) },
      { gx: 8.6, gy: 11.3, svg: flowers(8.6, 11.3, [C.butter, '#fff', C.red, C.butter, '#F2A7B8']) },
      { gx: 8.3, gy: 4.4, key: 'stand', svg: '' }
    ];
  }

  function sceneBackgroundSVG(opts) {
    return (
      sky(opts) +
      ground() +
      tree(1.6, 0.2, { color: C.autumn2, s: 1.25 }) +
      conifer(0.4, 0.9, 1.1, C.leafDark) +
      bakery() +
      cafe()
    );
  }

  const defs = `<defs><linearGradient id="oy-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.sky}"/><stop offset="1" stop-color="${C.sky2}"/></linearGradient></defs>`;

  /** 場所のタップ領域（町のグリッドから多角形を作る） */
  function locationHit(art) {
    if (art === 'bakery') {
      const c = [];
      [
        [0, 1],
        [3, 1],
        [3, 6],
        [0, 6],
        [3.6, 1],
        [3.6, 6]
      ].forEach(([gx, gy]) => [0, 142].forEach((z) => c.push(P(gx, gy, z))));
      c.push(P(1.5, 0.75, 186), P(1.5, 6.25, 186));
      return { type: 'poly', points: pts(hull(c)) };
    }
    if (art === 'bench') {
      const c = [];
      [
        [4.0, 8.8],
        [5.0, 8.8],
        [5.0, 11.0],
        [4.0, 11.0]
      ].forEach(([gx, gy]) => [0, 38].forEach((z) => c.push(P(gx, gy, z))));
      return { type: 'poly', points: pts(hull(c)) };
    }
    const e = isoEllipse(7.2, 7.2, 2.65);
    return { type: 'ellipse', cx: r1(e.cx), cy: r1(e.cy), rx: r1(e.rx), ry: r1(e.ry) };
  }

  /** 静止画の町（タイトル・サムネイル用）。住人も初期状態で置く */
  function staticTownSVG(stage) {
    const sprites = decorSprites().map((d) => ({ gx: d.gx, gy: d.gy, svg: d.key === 'stand' ? musicStand(d.gx, d.gy, false) : d.svg }));
    stage.characters.forEach((c) => {
      const g = c.slots[c.locationId];
      const [x, y] = P(g.gx, g.gy);
      sprites.push({ gx: g.gx, gy: g.gy, svg: `<g transform="translate(${r1(x)} ${r1(y)})${c.facing === 'left' ? ' scale(-1 1)' : ''}">${characterSVG(c.id, c.state)}</g>` });
    });
    stage.items.forEach((it) => {
      const [x, y] = P(it.pos.gx, it.pos.gy);
      sprites.push({ gx: it.pos.gx, gy: it.pos.gy, svg: `<g transform="translate(${r1(x)} ${r1(y)})">${itemSceneSVG(it.id)}</g>` });
    });
    sprites.sort((a, b) => a.gx + a.gy - (b.gx + b.gy) || a.gx - b.gx);
    return `<svg viewBox="${VB_FULL.x} ${VB_FULL.y} ${VB_FULL.w} ${VB_FULL.h}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${defs}${sceneBackgroundSVG()}${sprites.map((s) => s.svg).join('')}</svg>`;
  }

  function toPct(gx, gy, z) {
    const [x, y] = P(gx, gy, z);
    return { x: ((x - VB.x) / VB.w) * 100, y: ((y - VB.y) / VB.h) * 100, sx: x, sy: y };
  }

  OY.Art = {
    C,
    VB,
    P,
    toPct,
    defs,
    sceneBackgroundSVG,
    decorSprites,
    musicStand,
    locationHit,
    characterSVG,
    portraitSVG,
    itemSceneSVG,
    itemIconSVG,
    itemFlySVG,
    extraSVG,
    markSVG,
    cloudSVG,
    staticTownSVG,
    note,
    sparkle,
    balloonShape,
    croissant,
    scoreSheet
  };
})(typeof window !== 'undefined' ? window : globalThis);

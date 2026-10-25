// キャラクター（ふーたん・なかま）と いしょうパーツの え（SVG）。
// すべて 400×640 の きょうつう ざひょうで かくので、どの くみあわせでも ずれない。
(function () {
  const KP = (window.KP = window.KP || {});
  let uidN = 0;
  const uid = (p) => p + (++uidN).toString(36);
  KP.uid = uid;

  // ---- いろ ----
  const PAL = {
    lav: { base: '#C9B5F5', light: '#EEE6FF', mid: '#B39CEE', dark: '#8C6FD6', deep: '#6A4FB0', line: '#7A5FB8' },
    pink: { base: '#F8BCD6', light: '#FFE9F2', mid: '#F29CC2', dark: '#E07AA8', deep: '#C2548A', line: '#C9668F' },
    mint: { base: '#BDEBDC', light: '#EAFBF5', mid: '#9EDDC8', dark: '#6FC3A8', deep: '#3F9C83', line: '#5AAA92' },
    blue: { base: '#BCD4FA', light: '#EAF2FF', mid: '#9DBDF4', dark: '#6F98E2', deep: '#4A6FC0', line: '#5F86CC' },
    yellow: { base: '#FFE59A', light: '#FFF8DC', mid: '#FFD772', dark: '#F2B94A', deep: '#C98C25', line: '#D29A3A' },
    white: { base: '#FFFFFF', light: '#FFFFFF', mid: '#F3EEFA', dark: '#DCD2EE', deep: '#B3A5CF', line: '#A897C8' },
    navy: { base: '#5A5FA8', light: '#8E92D6', mid: '#4C5097', dark: '#3A3D7C', deep: '#2A2C5E', line: '#2E3068' },
    black: { base: '#4A4458', light: '#6E6880', mid: '#3C3748', dark: '#2C2836', deep: '#1E1A26', line: '#1E1A26' },
    peach: { base: '#FFD3BE', light: '#FFF0E8', mid: '#FDBCA0', dark: '#F29B7C', deep: '#D2735A', line: '#D98468' },
  };
  KP.PAL = PAL;
  const SKIN = { base: '#FFEDE4', sh: '#F9D3C6', line: '#D9A497', blush: '#FF9DB8' };
  const GOLD = { base: '#FFE08A', light: '#FFF6CF', dark: '#E9B44C', line: '#C99234' };
  KP.GOLD = GOLD;

  const mirror = (s) => `<g transform="translate(400 0) scale(-1 1)">${s}</g>`;
  KP.mirror = mirror;

  function lg(id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) {
    return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops
      .map((s) => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`)
      .join('')}</linearGradient>`;
  }
  function rg(id, stops, cx = 0.5, cy = 0.5, r = 0.5, fx, fy) {
    return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${fx != null ? ` fx="${fx}" fy="${fy}"` : ''}>${stops
      .map((s) => `<stop offset="${s[0]}" stop-color="${s[1]}"${s[2] != null ? ` stop-opacity="${s[2]}"` : ''}/>`)
      .join('')}</radialGradient>`;
  }
  KP.lg = lg;
  KP.rg = rg;

  // ほし・ハート（ちいさな かざり）
  function star(cx, cy, r, fill, stroke, sw = 1.5, inner = 0.45) {
    let d = '';
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * inner : r;
      d += (i ? 'L' : 'M') + (cx + Math.cos(a) * rr).toFixed(1) + ',' + (cy + Math.sin(a) * rr).toFixed(1);
    }
    return `<path d="${d}Z" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"` : ''}/>`;
  }
  function heart(cx, cy, s, fill, stroke, sw = 1.5) {
    const d = `M${cx},${cy + s * 0.9} C${cx - s * 1.3},${cy + s * 0.1} ${cx - s * 1.1},${cy - s * 0.95} ${cx},${cy - s * 0.35} C${cx + s * 1.1},${cy - s * 0.95} ${cx + s * 1.3},${cy + s * 0.1} ${cx},${cy + s * 0.9}Z`;
    return `<path d="${d}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round"` : ''}/>`;
  }
  function sparkle(cx, cy, r, fill = '#fff', op = 1) {
    const k = r * 0.22;
    return `<path d="M${cx},${cy - r} Q${cx + k},${cy - k} ${cx + r},${cy} Q${cx + k},${cy + k} ${cx},${cy + r} Q${cx - k},${cy + k} ${cx - r},${cy} Q${cx - k},${cy - k} ${cx},${cy - r}Z" fill="${fill}" opacity="${op}"/>`;
  }
  KP.star = star;
  KP.heart = heart;
  KP.sparkle = sparkle;

  // ---- リボン（かざり よう。cx,cy を まんなかに） ----
  function bow(cx, cy, s, C, g, opt = {}) {
    // g: グラデーション id（なければ base いろ）
    const f = g ? `url(#${g})` : C.base;
    const tails = opt.tails !== false;
    let o = '';
    if (tails) {
      o += `<path d="M${cx - 4 * s},${cy + 4 * s} C${cx - 10 * s},${cy + 18 * s} ${cx - 16 * s},${cy + 30 * s} ${cx - 20 * s},${cy + 40 * s} L${cx - 10 * s},${cy + 36 * s} L${cx - 6 * s},${cy + 44 * s} C${cx - 4 * s},${cy + 30 * s} ${cx - 1 * s},${cy + 16 * s} ${cx},${cy + 6 * s}Z" fill="${C.mid}" stroke="${C.line}" stroke-width="${1.6}" stroke-linejoin="round"/>`;
      o += `<path d="M${cx + 4 * s},${cy + 4 * s} C${cx + 10 * s},${cy + 18 * s} ${cx + 16 * s},${cy + 30 * s} ${cx + 20 * s},${cy + 40 * s} L${cx + 10 * s},${cy + 36 * s} L${cx + 6 * s},${cy + 44 * s} C${cx + 4 * s},${cy + 30 * s} ${cx + 1 * s},${cy + 16 * s} ${cx},${cy + 6 * s}Z" fill="${C.mid}" stroke="${C.line}" stroke-width="${1.6}" stroke-linejoin="round"/>`;
    }
    const loop = (dir) =>
      `<path d="M${cx},${cy} C${cx + dir * 8 * s},${cy - 16 * s} ${cx + dir * 30 * s},${cy - 22 * s} ${cx + dir * 32 * s},${cy - 8 * s} C${cx + dir * 34 * s},${cy + 4 * s} ${cx + dir * 26 * s},${cy + 14 * s} ${cx},${cy + 2 * s}Z" fill="${f}" stroke="${C.line}" stroke-width="1.8" stroke-linejoin="round"/>` +
      `<path d="M${cx + dir * 6 * s},${cy - 2 * s} C${cx + dir * 14 * s},${cy - 10 * s} ${cx + dir * 22 * s},${cy - 12 * s} ${cx + dir * 26 * s},${cy - 6 * s}" fill="none" stroke="${C.dark}" stroke-width="1.4" opacity=".55" stroke-linecap="round"/>` +
      `<path d="M${cx + dir * 12 * s},${cy - 12 * s} C${cx + dir * 18 * s},${cy - 15 * s} ${cx + dir * 24 * s},${cy - 15 * s} ${cx + dir * 27 * s},${cy - 12 * s}" fill="none" stroke="#fff" stroke-width="${2 * s}" opacity=".8" stroke-linecap="round"/>`;
    o += loop(-1) + loop(1);
    o += `<ellipse cx="${cx}" cy="${cy}" rx="${6.5 * s}" ry="${7.5 * s}" fill="${C.dark}" stroke="${C.line}" stroke-width="1.6"/>`;
    o += `<ellipse cx="${cx - 1.5 * s}" cy="${cy - 2.5 * s}" rx="${2.2 * s}" ry="${2.6 * s}" fill="#fff" opacity=".7"/>`;
    return o;
  }
  KP.bow = bow;

  // ---- め ----
  // みぎめ（がめん みぎ）を かいて、ひだりは はんてん
  function eyeOpen(cx, cy, E, id, look = 0) {
    const ix = cx + look;
    return (
      // しろめ
      `<path d="M${cx - 18},${cy - 4} C${cx - 18},${cy - 20} ${cx + 18},${cy - 22} ${cx + 19},${cy - 4} C${cx + 20},${cy + 14} ${cx + 12},${cy + 25} ${cx},${cy + 25} C${cx - 12},${cy + 25} ${cx - 19},${cy + 12} ${cx - 18},${cy - 4}Z" fill="#fff"/>` +
      // くろめ
      `<ellipse cx="${ix}" cy="${cy + 3}" rx="14.5" ry="20" fill="url(#${id}i)"/>` +
      `<ellipse cx="${ix}" cy="${cy - 1}" rx="8" ry="11" fill="${E.deep}" opacity=".75"/>` +
      `<path d="M${ix - 11},${cy + 12} Q${ix},${cy + 22} ${ix + 11},${cy + 12} Q${ix},${cy + 17} ${ix - 11},${cy + 12}Z" fill="${E.glow}" opacity=".9"/>` +
      `<ellipse cx="${ix}" cy="${cy + 3}" rx="14.5" ry="20" fill="none" stroke="${E.deep}" stroke-width="1.6"/>` +
      // かげ（うえ）
      `<path d="M${cx - 18},${cy - 4} C${cx - 18},${cy - 20} ${cx + 18},${cy - 22} ${cx + 19},${cy - 4} C${cx + 10},${cy - 12} ${cx - 10},${cy - 12} ${cx - 18},${cy - 4}Z" fill="${E.deep}" opacity=".35"/>` +
      // ハイライト
      `<ellipse cx="${ix - 5}" cy="${cy - 7}" rx="5.6" ry="6.6" fill="#fff"/>` +
      `<circle cx="${ix + 6}" cy="${cy + 10}" r="2.6" fill="#fff"/>` +
      sparkle(ix + 5, cy - 3, 3.4, '#fff', 0.9) +
      // うわまつげ
      `<path d="M${cx - 22},${cy - 3} C${cx - 16},${cy - 22} ${cx + 10},${cy - 26} ${cx + 21},${cy - 12} L${cx + 28},${cy - 18} L${cx + 24},${cy - 8} L${cx + 27},${cy - 4} L${cx + 21},${cy - 4} C${cx + 12},${cy - 18} ${cx - 10},${cy - 18} ${cx - 20},${cy}Z" fill="${E.lash}"/>` +
      // したまつげ
      `<path d="M${cx - 10},${cy + 26} Q${cx + 2},${cy + 29} ${cx + 12},${cy + 23}" fill="none" stroke="${E.lash}" stroke-width="1.3" opacity=".55" stroke-linecap="round"/>`
    );
  }
  function eyeHappy(cx, cy, E) {
    return (
      `<path d="M${cx - 17},${cy + 6} Q${cx},${cy - 14} ${cx + 17},${cy + 6}" fill="none" stroke="${E.lash}" stroke-width="4.5" stroke-linecap="round"/>` +
      `<path d="M${cx + 15},${cy + 1} L${cx + 23},${cy - 4}" stroke="${E.lash}" stroke-width="3" stroke-linecap="round"/>`
    );
  }
  function eyeSurprise(cx, cy, E, id) {
    return (
      `<ellipse cx="${cx}" cy="${cy + 2}" rx="17" ry="22" fill="#fff"/>` +
      `<ellipse cx="${cx}" cy="${cy + 3}" rx="10" ry="14" fill="url(#${id}i)" stroke="${E.deep}" stroke-width="1.4"/>` +
      `<circle cx="${cx - 3}" cy="${cy - 3}" r="4" fill="#fff"/>` +
      `<path d="M${cx - 21},${cy - 6} C${cx - 14},${cy - 26} ${cx + 12},${cy - 28} ${cx + 22},${cy - 12} L${cx + 26},${cy - 16} L${cx + 23},${cy - 6} C${cx + 12},${cy - 20} ${cx - 10},${cy - 20} ${cx - 19},${cy - 3}Z" fill="${E.lash}"/>`
    );
  }

  // ---- かみがた ----
  // H: {base, light, dark, line}
  function hairBack(style, H, g) {
    const f = `url(#${g}b)`;
    const st = `stroke="${H.line}" stroke-width="2.2" stroke-linejoin="round"`;
    if (style === 'long') {
      const half = `<path d="M200,64 C150,62 108,90 102,146 C96,204 104,262 92,328 C82,388 66,440 84,500 C92,528 108,544 128,548 C120,526 124,506 134,492 C140,518 156,532 176,534 C164,508 166,474 172,444 C176,420 186,400 200,396Z" fill="${f}" ${st}/>` +
        `<path d="M110,250 C104,310 92,380 98,450" fill="none" stroke="${H.dark}" stroke-width="2" opacity=".5" stroke-linecap="round"/>` +
        `<path d="M128,300 C124,360 120,420 138,480" fill="none" stroke="${H.dark}" stroke-width="2" opacity=".45" stroke-linecap="round"/>`;
      return half + mirror(half);
    }
    if (style === 'twin') {
      const half = `<path d="M200,66 C150,64 112,92 108,150 C106,190 112,220 126,236 L200,236Z" fill="${f}" ${st}/>` +
        // ツインテール
        `<path d="M112,112 C70,120 56,190 62,260 C66,320 50,380 60,430 C66,456 82,470 98,474 C90,450 96,432 106,420 C110,446 122,460 140,462 C128,430 134,392 132,350 C130,290 140,220 130,150Z" fill="${f}" ${st}/>` +
        `<path d="M86,180 C76,250 78,330 74,400" fill="none" stroke="${H.dark}" stroke-width="2" opacity=".5" stroke-linecap="round"/>` +
        `<path d="M110,200 C104,270 112,340 108,420" fill="none" stroke="${H.dark}" stroke-width="2" opacity=".4" stroke-linecap="round"/>`;
      return half + mirror(half);
    }
    if (style === 'odango') {
      // おだんご（うえに ふたつ）＋ みじかい うしろがみ
      const half = `<circle cx="128" cy="78" r="38" fill="${f}" ${st}/>` +
        `<path d="M104,66 Q126,48 150,62 M106,90 Q128,104 152,92" fill="none" stroke="${H.dark}" stroke-width="2" opacity=".5" stroke-linecap="round"/>` +
        `<path d="M200,64 C150,62 108,90 104,148 C100,196 104,232 112,256 C124,264 140,262 150,254 L200,254Z" fill="${f}" ${st}/>`;
      return half + mirror(half);
    }
    if (style === 'bob') {
      const half = `<path d="M200,64 C148,62 106,92 102,150 C98,200 100,240 98,272 C106,288 124,292 140,284 C150,290 162,288 170,280 L200,280Z" fill="${f}" ${st}/>`;
      return half + mirror(half);
    }
    if (style === 'pony') {
      const half = `<path d="M200,64 C150,62 108,90 104,148 C100,200 106,236 112,262 C124,270 140,268 150,258 L200,258Z" fill="${f}" ${st}/>`;
      // サイドポニー（がめん みぎ）
      const pony = `<path d="M276,96 C330,96 352,150 346,214 C340,280 362,330 350,384 C344,410 326,424 308,426 C318,404 314,386 304,374 C298,398 284,410 266,410 C280,380 276,344 286,300 C296,250 300,180 270,130Z" fill="${f}" ${st}/>` +
        `<path d="M320,160 C330,220 322,290 330,360" fill="none" stroke="${H.dark}" stroke-width="2" opacity=".5" stroke-linecap="round"/>`;
      return half + mirror(half) + pony;
    }
    return '';
  }

  // まえがみ（けたば を かさねる）
  function strand(x0, y0, xt, yt, w, bend) {
    const my = (y0 + yt) / 2;
    return `M${x0 - w / 2},${y0} C${x0 - w / 2 + bend},${my} ${xt - w * 0.18 + bend * 0.3},${yt - 26} ${xt},${yt} C${xt + w * 0.12 + bend * 0.2},${yt - 30} ${x0 + w / 2 + bend},${my} ${x0 + w / 2},${y0}Z`;
  }
  const BANG_STRANDS = [
    [146, 104, 122, 214, 40, -14], [254, 104, 278, 214, 40, 14],
    [162, 96, 140, 178, 40, -8], [238, 96, 262, 178, 40, 8],
    [180, 92, 164, 164, 40, -4], [220, 92, 238, 166, 40, 4],
    [196, 90, 190, 156, 36, -2], [210, 92, 214, 150, 30, 2],
  ];
  const CAP = `M108,200 C100,118 146,64 200,64 C254,64 300,118 292,200 C284,150 254,112 200,108 C146,112 116,150 108,200Z`;

  function sideLocks(style, H, g) {
    const f = `url(#${g}f)`;
    const st = `stroke="${H.line}" stroke-width="2.2" stroke-linejoin="round"`;
    let side;
    if (style === 'bob') {
      side = `<path d="M114,140 C102,190 104,240 110,278 C116,290 130,292 140,280 C134,250 136,214 142,170Z" fill="${f}" ${st}/>`;
    } else if (style === 'pony' || style === 'twin' || style === 'odango') {
      side = `<path d="M118,140 C106,200 110,250 108,300 C108,316 116,326 126,330 C122,312 128,296 134,282 C138,240 138,200 142,160Z" fill="${f}" ${st}/>`;
    } else {
      side = `<path d="M120,136 C106,190 116,236 108,280 C102,306 98,330 108,350 C114,362 126,366 134,362 C124,350 124,336 130,322 C138,300 134,270 138,240 C140,210 140,186 146,160Z" fill="${f}" ${st}/>` +
        `<path d="M126,190 C122,240 124,280 114,330" fill="none" stroke="${H.dark}" stroke-width="1.6" opacity=".5" stroke-linecap="round"/>`;
    }
    return `<g class="kp-locks">${side}</g><g class="kp-locks r">${mirror(side)}</g>`;
  }
  function hairFront(style, H, g) {
    const f = `url(#${g}f)`;
    const st = `stroke="${H.line}" stroke-width="2.2" stroke-linejoin="round"`;
    let o = '';
    o += `<path d="${CAP}" fill="${f}" ${st}/>`;
    for (const b of BANG_STRANDS) o += `<path d="${strand(...b)}" fill="${f}" ${st}/>`;
    o += `<path d="M112,176 C108,112 150,67 200,67 C250,67 292,112 288,176 C276,142 250,120 200,118 C150,120 124,142 112,176Z" fill="${f}"/>`;
    o += `<path d="M108,200 C100,118 146,64 200,64 C254,64 300,118 292,200" fill="none" ${st}/>`;
    // すじ
    o += `<path d="M170,100 Q160,130 160,150 M214,96 Q222,126 230,150 M146,120 Q140,140 140,160 M254,120 Q262,140 262,160" fill="none" stroke="${H.dark}" stroke-width="1.6" opacity=".45" stroke-linecap="round"/>`;
    // てんしの わ
    o += `<path d="M138,108 Q200,80 262,108" fill="none" stroke="${H.light}" stroke-width="7" stroke-linecap="round" opacity=".85"/>`;
    o += `<path d="M152,104 Q200,88 248,104" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" opacity=".8"/>`;
    // アホげ
    o += `<path d="M196,68 C192,46 206,34 220,38 C208,42 204,54 206,68Z" fill="${f}" ${st}/>`;
    if (style === 'twin') {
      // ゴム
      o += `<circle cx="112" cy="116" r="9" fill="${H.tie || '#FF8FB8'}" stroke="${H.line}" stroke-width="1.6"/>` +
        `<circle cx="288" cy="116" r="9" fill="${H.tie || '#FF8FB8'}" stroke="${H.line}" stroke-width="1.6"/>`;
    }
    if (style === 'odango') {
      o += bow(128, 112, 0.42, { ...PAL.pink, base: H.tie || '#F8BCD6' }, null, { tails: false }) + mirror(bow(128, 112, 0.42, { ...PAL.pink, base: H.tie || '#F8BCD6' }, null, { tails: false }));
    }
    if (style === 'pony') {
      o += `<circle cx="282" cy="104" r="9" fill="${H.tie || '#FF8FB8'}" stroke="${H.line}" stroke-width="1.6"/>`;
    }
    return o;
  }

  // ---- うで ----
  const POSES = {
    stand: { L: [[160, 296], [138, 346], [134, 392]], R: [[240, 296], [270, 344], [288, 316]], wand: 14 },
    cheer: { L: [[160, 296], [122, 322], [94, 300]], R: [[240, 296], [282, 260], [300, 208]], wand: 10 },
    wave: { L: [[160, 296], [116, 290], [110, 238]], R: [[240, 296], [270, 344], [288, 316]], wand: 14 },
    hips: { L: [[160, 296], [130, 330], [160, 352]], R: [[240, 296], [270, 330], [240, 352]], wand: null },
    joy: { L: [[160, 296], [124, 280], [118, 232]], R: [[240, 296], [276, 280], [282, 232]], wand: 20 },
    tea: { L: [[160, 296], [140, 344], [176, 360]], R: [[240, 296], [262, 344], [226, 352]], wand: null },
  };
  KP.POSES = POSES;

  function arm(P, skin) {
    const d = `M${P[0][0]},${P[0][1]} Q${P[1][0]},${P[1][1]} ${P[2][0]},${P[2][1]}`;
    return `<path d="${d}" fill="none" stroke="${skin.line}" stroke-width="22" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${skin.base}" stroke-width="18.5" stroke-linecap="round"/>`;
  }
  function hand(p, skin) {
    return `<circle cx="${p[0]}" cy="${p[1]}" r="11.5" fill="${skin.base}" stroke="${skin.line}" stroke-width="1.8"/>` +
      `<path d="M${p[0] - 5},${p[1] + 3} q5,4 10,0" fill="none" stroke="${skin.line}" stroke-width="1.3" stroke-linecap="round" opacity=".7"/>`;
  }

  // ---- からだ ----
  function legs(skin) {
    const L = `<path d="M174,420 L198,420 L196,520 Q194,560 194,592 L178,592 Q176,560 175,520Z" fill="${skin.base}" stroke="${skin.line}" stroke-width="1.8" stroke-linejoin="round"/>` +
      `<path d="M182,512 q6,4 10,0" fill="none" stroke="${skin.line}" stroke-width="1.2" opacity=".6"/>`;
    return L + mirror(L);
  }
  function torso(skin) {
    return (
      `<path d="M188,240 L188,282 Q200,290 212,282 L212,240Z" fill="${skin.base}" stroke="${skin.line}" stroke-width="1.8"/>` +
      `<path d="M188,250 Q200,266 212,250 L212,262 Q200,274 188,262Z" fill="${skin.sh}"/>` +
      `<path d="M160,284 Q200,274 240,284 Q252,290 250,302 L236,354 Q200,360 164,354 L150,302 Q148,290 160,284Z" fill="${skin.base}" stroke="${skin.line}" stroke-width="1.8"/>`
    );
  }
  // したぎ（なにも きていない ときの キャミソールと ペチコート）
  function camisole() {
    return `<path d="M164,290 Q200,300 236,290 L240,356 Q200,364 160,356Z" fill="#FFFFFF" stroke="#C9B8E6" stroke-width="1.8"/>` +
      `<path d="M172,292 L174,280 M228,292 L226,280" stroke="#C9B8E6" stroke-width="3" stroke-linecap="round"/>` + bow(200, 300, 0.35, PAL.pink, null, { tails: false });
  }
  function petticoat() {
    return `<path d="M166,346 Q200,354 234,346 L262,432 Q200,446 138,432Z" fill="#FFFFFF" stroke="#C9B8E6" stroke-width="1.8"/>` + lace(138, 262, 432, 6, '#E5DAF6');
  }

  // スカラップ（なみなみ）レース
  function lace(x0, x1, y, r, col, stroke = '#C9B8E6', sag = 8) {
    const n = Math.max(3, Math.round((x1 - x0) / (r * 2)));
    const w = (x1 - x0) / n;
    let d = `M${x0},${y} `;
    for (let i = 0; i < n; i++) {
      const xa = x0 + i * w, xb = xa + w;
      const ya = y + sag * Math.sin(Math.PI * (i / n)), yb = y + sag * Math.sin(Math.PI * ((i + 1) / n));
      d += `C${xa + w * 0.05},${ya + r * 1.6} ${xb - w * 0.05},${yb + r * 1.6} ${xb},${yb} `;
    }
    d += `L${x1},${y - 2} Q${(x0 + x1) / 2},${y + sag - 2} ${x0},${y - 2}Z`;
    return `<path d="${d}" fill="${col}" stroke="${stroke}" stroke-width="1.5" stroke-linejoin="round"/>`;
  }
  KP.lace = lace;

  // ---- いしょう ----
  // それぞれ (C: いろ, g: グラデーション id の あたま) → { layer: svg }
  // layer: shoesB（くつ）, skirt, top, dress, sleeves, ribbon, hair, magic
  const PARTS = {};
  KP.PARTS = PARTS;

  const sleevesPuff = (C, f, white) => {
    const fill = white ? '#FFFFFF' : f;
    const half = `<path d="M158,284 C136,280 124,296 128,314 C130,328 144,334 158,330 C166,322 170,300 168,288Z" fill="${fill}" stroke="${white ? '#C9B8E6' : C.line}" stroke-width="1.8" stroke-linejoin="round"/>` +
      `<path d="M136,300 Q146,296 156,304" fill="none" stroke="${white ? '#DCD0F0' : C.dark}" stroke-width="1.5" opacity=".7"/>` +
      `<path d="M130,322 Q144,336 160,328" fill="none" stroke="${white ? '#C9B8E6' : C.line}" stroke-width="3" stroke-linecap="round"/>`;
    return half + mirror(half);
  };

  PARTS.blouse = (C, g) => ({
    defs: lg(g + 't', [[0, C.light], [0.5, C.base], [1, C.mid]]),
    top:
      `<path d="M160,284 Q200,276 240,284 Q252,290 250,304 L240,360 Q200,370 160,360 L150,304 Q148,290 160,284Z" fill="url(#${g}t)" stroke="${C.line}" stroke-width="1.8" stroke-linejoin="round"/>` +
      // むなもと の えり
      `<path d="M178,280 Q200,300 222,280 L226,288 Q200,312 174,288Z" fill="#fff" stroke="${C.line}" stroke-width="1.6"/>` +
      `<path d="M200,300 L200,356" stroke="${C.dark}" stroke-width="1.5" opacity=".5"/>` +
      `<circle cx="200" cy="318" r="3" fill="#fff" stroke="${C.line}" stroke-width="1.2"/><circle cx="200" cy="336" r="3" fill="#fff" stroke="${C.line}" stroke-width="1.2"/>` +
      `<path d="M168,300 Q164,330 170,356 M232,300 Q236,330 230,356" fill="none" stroke="${C.dark}" stroke-width="1.4" opacity=".4"/>` +
      lace(158, 242, 356, 5, '#fff', C.line, 6),
    sleeves: sleevesPuff(C, `url(#${g}t)`, true),
  });

  PARTS.sailor = (C, g) => ({
    defs: lg(g + 't', [[0, '#fff'], [1, '#F4F0FB']]) + lg(g + 'c', [[0, C.base], [1, C.dark]]),
    top:
      `<path d="M160,284 Q200,276 240,284 Q252,290 250,304 L242,362 Q200,372 158,362 L150,304 Q148,290 160,284Z" fill="url(#${g}t)" stroke="#B9A9D9" stroke-width="1.8"/>` +
      `<path d="M158,282 Q200,272 242,282 L250,318 L224,316 L200,350 L176,316 L150,318Z" fill="url(#${g}c)" stroke="${C.line}" stroke-width="1.8" stroke-linejoin="round"/>` +
      `<path d="M156,308 L178,308 L200,340 L222,308 L244,308" fill="none" stroke="#fff" stroke-width="2.5"/>` +
      `<path d="M186,342 L200,354 L214,342 L210,364 L200,358 L190,364Z" fill="${C.dark}" stroke="${C.line}" stroke-width="1.4"/>` +
      `<path d="M162,356 Q200,366 238,356" fill="none" stroke="${C.mid}" stroke-width="3"/>`,
    sleeves: (() => {
      const half = `<path d="M158,284 C138,282 128,298 132,316 C134,326 146,330 158,326 C164,316 168,300 166,288Z" fill="#fff" stroke="#B9A9D9" stroke-width="1.8"/>` +
        `<path d="M134,318 Q146,328 160,322" fill="none" stroke="${C.dark}" stroke-width="4" stroke-linecap="round"/>`;
      return half + mirror(half);
    })(),
  });

  PARTS.hearttop = (C, g) => ({
    defs: lg(g + 't', [[0, C.light], [0.6, C.base], [1, C.dark]]),
    top:
      `<path d="M162,288 Q200,282 238,288 L246,302 L238,362 Q200,372 162,362 L154,302Z" fill="url(#${g}t)" stroke="${C.line}" stroke-width="1.8"/>` +
      // レースの むね
      lace(160, 240, 288, 5, '#fff', C.line, -2) +
      `<path d="M176,304 L186,356 M224,304 L214,356" stroke="${C.dark}" stroke-width="1.5" opacity=".5"/>` +
      `<path d="M188,312 L212,312 M190,326 L210,326 M191,340 L209,340" stroke="#fff" stroke-width="2" stroke-linecap="round"/>` +
      heart(200, 330, 10, C.dark, C.line) +
      `<ellipse cx="196" cy="326" rx="3" ry="2.4" fill="#fff" opacity=".8"/>`,
    sleeves: (() => {
      const half = `<path d="M160,288 C146,280 132,290 134,304 C136,316 150,318 160,312Z" fill="${C.base}" stroke="${C.line}" stroke-width="1.8"/>` + lace(134, 160, 310, 4, '#fff', C.line, 2);
      return half + mirror(half);
    })(),
  });

  // スカート
  function skirtPleats(x0, y0, x1, y1, X0, X1, n, col) {
    let o = '';
    for (let i = 1; i < n; i++) {
      const t = i / n;
      const xa = x0 + (x1 - x0) * t, xb = X0 + (X1 - X0) * t;
      o += `<path d="M${xa},${y0} Q${(xa + xb) / 2 + (t - 0.5) * 6},${(y0 + y1) / 2} ${xb},${y1}" fill="none" stroke="${col}" stroke-width="1.5" opacity=".5"/>`;
    }
    return o;
  }
  PARTS.frill = (C, g) => ({
    defs: lg(g + 's', [[0, C.base], [1, C.mid]]),
    skirt:
      petticoat() +
      `<path d="M166,346 Q200,354 234,346 L284,438 Q200,462 116,438Z" fill="url(#${g}s)" stroke="${C.line}" stroke-width="1.8" stroke-linejoin="round"/>` +
      skirtPleats(166, 352, 234, 352, 116, 284, 7, C.dark) +
      lace(116, 284, 436, 7, C.light, C.line, 10) +
      `<path d="M164,344 Q200,354 236,344 L238,358 Q200,368 162,358Z" fill="${C.dark}" stroke="${C.line}" stroke-width="1.6"/>` +
      `<path d="M128,420 Q200,442 272,420" fill="none" stroke="#fff" stroke-width="2.5" opacity=".7" stroke-dasharray="2 7" stroke-linecap="round"/>`,
  });
  PARTS.tutu = (C, g) => ({
    defs: rg(g + 's', [[0, C.light], [0.7, C.base], [1, C.mid]], 0.5, 0.2, 0.8),
    skirt:
      `<path d="M168,348 Q200,356 232,348 Q280,372 300,404 Q296,414 284,412 Q280,422 266,418 Q258,428 244,422 Q232,432 218,424 Q200,434 182,424 Q168,432 156,422 Q142,428 134,418 Q120,422 116,412 Q104,414 100,404 Q120,372 168,348Z" fill="url(#${g}s)" stroke="${C.line}" stroke-width="1.8" stroke-linejoin="round"/>` +
      `<path d="M168,360 Q200,370 232,360 Q270,380 286,400 Q260,394 240,404 Q220,396 200,406 Q180,396 160,404 Q140,394 114,400 Q130,380 168,360Z" fill="${C.light}" opacity=".7"/>` +
      `<path d="M164,344 Q200,354 236,344 L238,358 Q200,368 162,358Z" fill="${C.dark}" stroke="${C.line}" stroke-width="1.6"/>` +
      star(150, 396, 5, '#fff') + star(250, 396, 5, '#fff') + star(200, 412, 5, '#fff') + sparkle(126, 390, 4) + sparkle(276, 388, 4),
  });
  PARTS.starskirt = (C, g) => ({
    defs: lg(g + 's', [[0, C.mid], [1, C.deep]]),
    skirt:
      petticoat() +
      `<path d="M166,346 Q200,354 234,346 Q250,380 280,434 Q200,454 120,434 Q150,380 166,346Z" fill="url(#${g}s)" stroke="${C.line}" stroke-width="1.8"/>` +
      star(150, 412, 6, GOLD.base) + star(186, 392, 4.5, '#fff') + star(222, 420, 6, GOLD.base) + star(252, 396, 4.5, '#fff') + star(200, 372, 4, GOLD.base) +
      sparkle(170, 424, 4, '#fff') + sparkle(240, 374, 3.5, '#fff') +
      `<path d="M120,434 Q200,454 280,434" fill="none" stroke="${GOLD.base}" stroke-width="3"/>` +
      `<path d="M164,344 Q200,354 236,344 L238,358 Q200,368 162,358Z" fill="${C.dark}" stroke="${C.line}" stroke-width="1.6"/>` + star(200, 352, 5, GOLD.base, GOLD.line, 1),
  });

  // ワンピース
  PARTS.princess = (C, g) => ({
    defs: lg(g + 'd', [[0, C.light], [0.35, C.base], [1, C.mid]]) + lg(g + 'u', [[0, C.base], [1, C.dark]]),
    dress:
      // うしろの スカート
      `<path d="M168,346 Q200,354 232,346 Q290,420 312,480 Q200,512 88,480 Q110,420 168,346Z" fill="url(#${g}u)" stroke="${C.line}" stroke-width="1.8"/>` +
      lace(88, 312, 478, 8, '#fff', C.line, 14) +
      // まえの スカート（ひらいた カーテン）
      `<path d="M168,346 Q200,354 232,346 Q262,400 276,458 Q240,446 200,476 Q160,446 124,458 Q138,400 168,346Z" fill="url(#${g}d)" stroke="${C.line}" stroke-width="1.8"/>` +
      skirtPleats(176, 356, 224, 356, 132, 268, 5, C.dark) +
      `<path d="M124,458 Q160,446 200,476 Q240,446 276,458" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>` +
      `<path d="M150,430 Q166,424 178,440 Q190,428 200,446 Q210,428 222,440 Q234,424 250,430" fill="none" stroke="${C.light}" stroke-width="2" opacity=".9"/>` +
      // ボディス
      `<path d="M162,286 Q200,278 238,286 Q250,292 248,304 L238,358 Q200,368 162,358 L152,304 Q150,292 162,286Z" fill="url(#${g}d)" stroke="${C.line}" stroke-width="1.8"/>` +
      `<path d="M176,284 Q200,300 224,284 L228,292 Q200,312 172,292Z" fill="#fff" stroke="${C.line}" stroke-width="1.5"/>` +
      `<path d="M182,306 L200,356 L218,306" fill="none" stroke="${C.dark}" stroke-width="1.6" opacity=".55"/>` +
      `<path d="M162,354 Q200,366 238,354 L238,364 Q200,376 162,364Z" fill="${C.dark}" stroke="${C.line}" stroke-width="1.5"/>` +
      star(132, 470, 4.5, '#fff') + star(268, 470, 4.5, '#fff') + sparkle(108, 456, 4, '#fff') + sparkle(292, 456, 4, '#fff'),
    sleeves: sleevesPuff(C, `url(#${g}d)`, true),
  });
  PARTS.starry = (C, g) => ({
    defs: lg(g + 'd', [[0, '#8E92D6'], [0.5, '#5A5FA8'], [1, '#3A3D7C']]) + lg(g + 'v', [[0, '#C9B5F5', 0.9], [1, '#F8BCD6', 0.6]]),
    dress:
      `<path d="M168,346 Q200,354 232,346 Q296,420 318,488 Q200,520 82,488 Q104,420 168,346Z" fill="url(#${g}d)" stroke="#2E3068" stroke-width="1.8"/>` +
      // ベール
      `<path d="M168,350 Q130,420 110,480 Q200,500 290,480 Q270,420 232,350Z" fill="url(#${g}v)" opacity=".55"/>` +
      [[120, 470], [150, 430], [180, 460], [210, 410], [240, 450], [270, 470], [196, 490], [160, 395], [250, 400], [226, 482]]
        .map(([x, y], i) => (i % 3 ? star(x, y, 4 + (i % 2) * 2, i % 2 ? GOLD.base : '#fff') : sparkle(x, y, 5, '#fff')))
        .join('') +
      `<path d="M82,488 Q200,520 318,488" fill="none" stroke="${GOLD.base}" stroke-width="3.5"/>` +
      `<path d="M162,286 Q200,278 238,286 Q250,292 248,304 L238,358 Q200,368 162,358 L152,304 Q150,292 162,286Z" fill="url(#${g}d)" stroke="#2E3068" stroke-width="1.8"/>` +
      `<path d="M176,284 Q200,300 224,284 L228,292 Q200,312 172,292Z" fill="${GOLD.light}" stroke="${GOLD.line}" stroke-width="1.5"/>` +
      `<path d="M162,354 Q200,366 238,354 L238,364 Q200,376 162,364Z" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="1.5"/>` +
      `<path d="M206,316 a13,13 0 1,1 -4,-18 a10,10 0 1,0 4,18Z" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="1.2"/>` + star(208, 330, 4, '#fff'),
    sleeves: (() => {
      const half = `<path d="M158,284 C136,280 124,296 128,314 C130,328 144,334 158,330 C166,322 170,300 168,288Z" fill="#8E92D6" stroke="#2E3068" stroke-width="1.8"/>` + star(146, 308, 4, GOLD.base) +
        `<path d="M130,322 Q144,336 160,328" fill="none" stroke="${GOLD.base}" stroke-width="3" stroke-linecap="round"/>`;
      return half + mirror(half);
    })(),
  });
  PARTS.magicdress = (C, g) => ({
    defs: lg(g + 'd', [[0, '#fff'], [0.4, C.light], [1, C.base]]) + lg(g + 'u', [[0, C.mid], [1, C.dark]]),
    dress:
      // 3だんの フリル
      `<path d="M168,346 Q200,354 232,346 Q276,396 294,452 Q200,476 106,452 Q124,396 168,346Z" fill="url(#${g}u)" stroke="${C.line}" stroke-width="1.8"/>` +
      lace(106, 294, 450, 7, C.light, C.line, 12) +
      `<path d="M168,346 Q200,354 232,346 Q258,380 270,416 Q200,436 130,416 Q142,380 168,346Z" fill="url(#${g}d)" stroke="${C.line}" stroke-width="1.8"/>` +
      lace(130, 270, 414, 6, '#fff', C.line, 10) +
      `<path d="M170,346 Q200,354 230,346 Q240,366 246,384 Q200,398 154,384 Q160,366 170,346Z" fill="${C.base}" stroke="${C.line}" stroke-width="1.6"/>` +
      heart(144, 436, 6, '#fff') + heart(256, 436, 6, '#fff') + heart(200, 446, 6, '#fff') +
      `<path d="M162,286 Q200,278 238,286 Q250,292 248,304 L238,358 Q200,368 162,358 L152,304 Q150,292 162,286Z" fill="url(#${g}d)" stroke="${C.line}" stroke-width="1.8"/>` +
      `<path d="M170,290 Q200,310 230,290" fill="none" stroke="${C.dark}" stroke-width="2"/>` +
      `<path d="M172,330 L228,330" stroke="${C.mid}" stroke-width="10" opacity=".6"/>` +
      `<path d="M162,354 Q200,366 238,354 L238,364 Q200,376 162,364Z" fill="${C.dark}" stroke="${C.line}" stroke-width="1.5"/>`,
    sleeves: sleevesPuff(C, `url(#${g}d)`, false),
  });

  // くつ
  function shoeShape(C, f, strap) {
    const half = `<path d="M173,584 L199,584 Q201,598 202,610 Q204,628 186,629 Q166,630 166,616 Q166,600 173,584Z" fill="${f}" stroke="${C.line}" stroke-width="1.8" stroke-linejoin="round"/>` +
      `<path d="M172,612 Q176,622 186,622" fill="none" stroke="#fff" stroke-width="2.6" opacity=".7" stroke-linecap="round"/>` +
      (strap ? `<path d="M174,596 Q186,600 198,596" fill="none" stroke="${C.dark}" stroke-width="3"/>` : '');
    return half + mirror(half);
  }
  PARTS.pumps = (C, g) => ({
    defs: lg(g + 'k', [[0, C.base], [1, C.dark]]),
    shoes:
      `<path d="M176,560 L196,560 L196,588 L176,588Z" fill="#fff" stroke="#C9B8E6" stroke-width="1.4"/>` + mirror(`<path d="M176,560 L196,560 L196,588 L176,588Z" fill="#fff" stroke="#C9B8E6" stroke-width="1.4"/>`) +
      shoeShape(C, `url(#${g}k)`, true) + bow(186, 600, 0.32, PAL.pink, null, { tails: false }) + mirror(bow(186, 600, 0.32, PAL.pink, null, { tails: false })),
  });
  PARTS.boots = (C, g) => ({
    defs: lg(g + 'k', [[0, C.light], [1, C.base]]),
    shoes: (() => {
      const half = `<path d="M170,520 Q186,514 200,520 L200,610 Q204,630 188,630 Q160,632 160,620 Q160,610 172,606Z" fill="url(#${g}k)" stroke="${C.line}" stroke-width="1.8" stroke-linejoin="round"/>` +
        `<path d="M168,520 Q186,512 202,520 L202,534 Q186,528 168,534Z" fill="#fff" stroke="${C.line}" stroke-width="1.5"/>` +
        heart(186, 556, 5, C.dark) + `<path d="M162,620 Q180,628 198,622" fill="none" stroke="${C.dark}" stroke-width="3"/>`;
      return half + mirror(half);
    })(),
  });
  PARTS.strap = (C, g) => ({
    defs: lg(g + 'k', [[0, C.base], [1, C.dark]]),
    shoes: (() => {
      const sock = `<path d="M175,540 L197,540 L197,590 L175,590Z" fill="#fff" stroke="#C9B8E6" stroke-width="1.4"/>` + lace(173, 199, 540, 3, '#fff', '#C9B8E6', 0);
      return sock + mirror(sock) + shoeShape(C, `url(#${g}k)`, true) +
        `<circle cx="197" cy="597" r="2.6" fill="${GOLD.base}" stroke="${GOLD.line}"/>` + mirror(`<circle cx="197" cy="597" r="2.6" fill="${GOLD.base}" stroke="${GOLD.line}"/>`);
    })(),
  });
  PARTS.glass = (C, g) => ({
    defs: lg(g + 'k', [[0, '#FFFFFF', 0.95], [1, '#BFE3FF', 0.85]]),
    shoes: shoeShape({ ...PAL.blue, line: '#8CB4E8', dark: '#9DBDF4' }, `url(#${g}k)`, false) + sparkle(168, 616, 4) + mirror(sparkle(168, 616, 4)) + star(194, 606, 4, GOLD.base) + mirror(star(194, 606, 4, GOLD.base)),
  });

  // かみかざり
  PARTS.hairbows = (C, g) => ({
    defs: lg(g + 'h', [[0, C.light], [0.5, C.base], [1, C.dark]]),
    hair: bow(114, 128, 0.85, C, g + 'h') + bow(286, 128, 0.85, C, g + 'h'),
  });
  PARTS.bigbow = (C, g) => ({
    defs: lg(g + 'h', [[0, C.light], [0.5, C.base], [1, C.dark]]),
    hair: bow(200, 62, 1.25, C, g + 'h', { tails: false }),
  });
  PARTS.starpins = (C, g) => ({
    hair: star(262, 104, 13, GOLD.base, GOLD.line, 1.6) + star(282, 130, 9, C.base, C.line, 1.4) + star(124, 112, 9, GOLD.base, GOLD.line, 1.4) + sparkle(258, 100, 3),
  });
  PARTS.flowers = (C, g) => {
    const fl = (x, y, r, col) => {
      let o = '';
      for (let i = 0; i < 5; i++) {
        const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
        o += `<circle cx="${(x + Math.cos(a) * r * 0.9).toFixed(1)}" cy="${(y + Math.sin(a) * r * 0.9).toFixed(1)}" r="${r * 0.7}" fill="${col.base}" stroke="${col.line}" stroke-width="1.2"/>`;
      }
      return o + `<circle cx="${x}" cy="${y}" r="${r * 0.45}" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="1"/>`;
    };
    let o = '';
    const pts = [[118, 150], [130, 112], [158, 86], [200, 74], [242, 86], [270, 112], [282, 150]];
    pts.forEach(([x, y], i) => {
      if (i % 2) o += `<ellipse cx="${x}" cy="${y + 8}" rx="9" ry="5" fill="#9EDDC8" stroke="#5AAA92" stroke-width="1.2" transform="rotate(${i * 20 - 60} ${x} ${y + 8})"/>`;
    });
    pts.forEach(([x, y], i) => (o += fl(x, y, i === 3 ? 13 : 10, i % 2 ? PAL.white : C)));
    return { hair: o };
  };
  PARTS.tiara = (C, g) => ({
    defs: lg(g + 'h', [[0, GOLD.light], [0.5, GOLD.base], [1, GOLD.dark]]),
    hair:
      `<path d="M140,96 L152,70 L168,88 L184,56 L200,82 L216,56 L232,88 L248,70 L260,96 Q200,80 140,96Z" fill="url(#${g}h)" stroke="${GOLD.line}" stroke-width="1.8" stroke-linejoin="round"/>` +
      `<path d="M138,96 Q200,78 262,96 L260,104 Q200,88 140,104Z" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="1.6"/>` +
      `<path d="M200,64 l10,14 l-10,14 l-10,-14Z" fill="${C.base}" stroke="${C.line}" stroke-width="1.5"/>` +
      `<circle cx="168" cy="92" r="4.5" fill="${PAL.pink.base}" stroke="${PAL.pink.line}"/><circle cx="232" cy="92" r="4.5" fill="${PAL.pink.base}" stroke="${PAL.pink.line}"/>` +
      sparkle(196, 70, 4) + sparkle(250, 70, 5) + sparkle(150, 64, 4),
  });
  PARTS.usamimi = (C, g) => {
    const ear = `<path d="M150,92 C132,40 130,-6 152,-10 C172,-12 176,40 170,90Z" fill="#fff" stroke="#C9B8E6" stroke-width="2"/>` +
      `<path d="M153,82 C142,44 142,4 152,2 C163,2 166,44 163,82Z" fill="${C.base}" opacity=".9"/>`;
    return {
      hair: `<path d="M126,120 Q200,40 274,120" fill="none" stroke="${C.dark}" stroke-width="8" stroke-linecap="round"/>` +
        `<g transform="rotate(-14 160 90)">${ear}</g>` + mirror(`<g transform="rotate(-14 160 90)">${ear}</g>`) + bow(250, 92, 0.5, PAL.pink, null, { tails: false }),
    };
  };
  PARTS.crown2 = (C, g) => ({
    hair: `<path d="M244,96 C238,70 262,60 270,80 C276,62 300,70 290,96Z" fill="${C.base}" stroke="${C.line}" stroke-width="1.6"/>` + heart(267, 92, 9, C.dark, C.line) + sparkle(258, 76, 3),
  });

  // むねの リボン
  PARTS.chestbow = (C, g) => ({
    defs: lg(g + 'r', [[0, C.light], [0.5, C.base], [1, C.dark]]),
    ribbon: bow(200, 300, 0.95, C, g + 'r'),
  });
  PARTS.brooch = (C, g) => ({
    defs: rg(g + 'r', [[0, '#fff'], [0.4, C.base], [1, C.dark]], 0.4, 0.35, 0.7),
    ribbon:
      `<path d="M184,292 Q200,286 216,292 L224,310 Q200,326 176,310Z" fill="#fff" stroke="${C.line}" stroke-width="1.4"/>` +
      `<circle cx="200" cy="302" r="16" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="1.8"/>` + heart(200, 302, 10.5, `url(#${g}r)`, C.line) + sparkle(195, 297, 3.4),
  });
  PARTS.starbrooch = (C, g) => ({
    ribbon: bow(200, 300, 0.7, C, null) + star(200, 302, 14, GOLD.base, GOLD.line, 1.8) + sparkle(196, 296, 3),
  });

  // まほうの アイテム（て の いち を 0,0 に かく。うえ むき）
  PARTS.starwand = (C, g) => ({
    defs: lg(g + 'm', [[0, GOLD.light], [1, GOLD.base]]),
    magic:
      `<path d="M-4,14 L-3,-92 L3,-92 L4,14Z" fill="#fff" stroke="${C.line}" stroke-width="1.8"/>` +
      `<path d="M-3,-20 L3,-30 M-3,-44 L3,-54 M-3,-68 L3,-78" stroke="${C.base}" stroke-width="3"/>` +
      `<g transform="translate(0 -110)">${star(0, 0, 24, `url(#${g}m)`, GOLD.line, 2)}${star(0, 0, 11, '#fff', null, 0, 0.5)}<path d="M0,10 C-12,20 -18,34 -14,44" fill="none" stroke="${C.base}" stroke-width="4" stroke-linecap="round"/>${sparkle(18, -20, 5)}${sparkle(-20, -14, 4)}</g>` +
      bow(0, -88, 0.45, PAL.pink, null),
  });
  PARTS.heartwand = (C, g) => ({
    defs: lg(g + 'm', [[0, '#FFE9F2'], [0.5, '#F8BCD6'], [1, '#E07AA8']]),
    magic:
      `<path d="M-4,14 L-3,-86 L3,-86 L4,14Z" fill="${PAL.pink.light}" stroke="${PAL.pink.line}" stroke-width="1.8"/>` +
      `<g transform="translate(0 -110)"><circle r="28" fill="none" stroke="${GOLD.base}" stroke-width="4"/>${heart(0, 2, 22, `url(#${g}m)`, PAL.pink.line, 2)}<ellipse cx="-8" cy="-6" rx="5" ry="4" fill="#fff" opacity=".8"/>${sparkle(26, -26, 6)}${sparkle(-28, 20, 4)}</g>` +
      `<path d="M-12,-82 C-20,-90 -30,-86 -28,-78 M12,-82 C20,-90 30,-86 28,-78" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`,
  });
  PARTS.moonrod = (C, g) => ({
    defs: lg(g + 'm', [[0, GOLD.light], [1, GOLD.dark]]),
    magic:
      `<path d="M-4,14 L-3,-90 L3,-90 L4,14Z" fill="${C.base}" stroke="${C.line}" stroke-width="1.8"/>` +
      `<g transform="translate(0 -112)"><path d="M10,-28 A30,30 0 1,0 10,28 A22,22 0 1,1 10,-28Z" fill="url(#${g}m)" stroke="${GOLD.line}" stroke-width="2"/>${star(12, 0, 11, '#fff', C.line, 1.4)}${sparkle(-24, -24, 5)}</g>` +
      `<circle cy="-88" r="7" fill="${C.dark}" stroke="${C.line}" stroke-width="1.5"/>`,
  });
  PARTS.bunnywand = (C, g) => ({
    magic:
      `<path d="M-4,14 L-3,-80 L3,-80 L4,14Z" fill="#fff" stroke="${C.line}" stroke-width="1.8"/>` +
      `<g transform="translate(0 -104)">` +
      `<path d="M-12,-14 C-20,-48 -10,-58 -4,-52 C0,-44 -2,-26 -4,-14Z M12,-14 C20,-48 10,-58 4,-52 C0,-44 2,-26 4,-14Z" fill="#fff" stroke="#C9B8E6" stroke-width="1.8"/>` +
      `<path d="M-9,-20 C-14,-42 -9,-48 -6,-46 C-4,-40 -5,-28 -6,-20Z M9,-20 C14,-42 9,-48 6,-46 C4,-40 5,-28 6,-20Z" fill="${C.base}"/>` +
      `<circle r="22" fill="#fff" stroke="#C9B8E6" stroke-width="2"/>` +
      `<ellipse cx="-8" cy="-2" rx="3.4" ry="4.4" fill="#6A4FB0"/><ellipse cx="8" cy="-2" rx="3.4" ry="4.4" fill="#6A4FB0"/>` +
      `<circle cx="-9" cy="-4" r="1.4" fill="#fff"/><circle cx="7" cy="-4" r="1.4" fill="#fff"/>` +
      `<path d="M-3,6 q3,3 6,0" fill="none" stroke="#C2548A" stroke-width="1.6" stroke-linecap="round"/>` +
      `<ellipse cx="-14" cy="6" rx="4" ry="2.4" fill="${SKIN.blush}" opacity=".6"/><ellipse cx="14" cy="6" rx="4" ry="2.4" fill="${SKIN.blush}" opacity=".6"/>` +
      `</g>` + bow(0, -80, 0.42, PAL.pink, null),
  });

  // ---- かお ----
  function face(expr, E, id, skin, mk = {}) {
    let o = '';
    const fc = `M124,170 C122,120 150,92 200,92 C250,92 278,120 276,170 C276,206 256,240 224,254 C210,260 190,260 176,254 C144,240 124,206 124,170Z`;
    o += `<path d="${fc}" fill="${skin.base}" stroke="${skin.line}" stroke-width="2"/>`;
    // ほお
    o += `<ellipse cx="146" cy="214" rx="17" ry="10" fill="url(#${id}k)"/><ellipse cx="254" cy="214" rx="17" ry="10" fill="url(#${id}k)"/>`;
    o += `<path d="M139,212 l4,-5 M146,213 l4,-5 M153,214 l4,-5 M247,214 l4,-5 M254,213 l4,-5 M261,212 l4,-5" stroke="#FF7FA5" stroke-width="1.4" stroke-linecap="round" opacity=".6"/>`;
    if (mk.cheek) o += `<ellipse cx="146" cy="212" rx="21" ry="12" fill="${mk.cheek}" opacity=".5"/><ellipse cx="254" cy="212" rx="21" ry="12" fill="${mk.cheek}" opacity=".5"/>`;
    // アイシャドウ
    if (mk.shadow) {
      const sh = (cx, cy) => `<path d="M${cx - 23},${cy - 2} C${cx - 20},${cy - 34} ${cx + 20},${cy - 38} ${cx + 27},${cy - 10} C${cx + 12},${cy - 22} ${cx - 10},${cy - 22} ${cx - 23},${cy - 2}Z" fill="${mk.shadow}" opacity=".6"/>`;
      o += sh(236, 186) + `<g transform="translate(400 0) scale(-1 1)">${sh(236, 186)}</g>`;
    }
    // まゆ
    const brow = expr === 'surprise' ? -6 : expr === 'sad' ? 4 : 0;
    o += `<path d="M150,${146 + brow} Q164,${140 + brow} 176,${146 + brow}" fill="none" stroke="${E.lash}" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>`;
    o += `<path d="M224,${146 + brow} Q236,${140 + brow} 250,${146 + brow}" fill="none" stroke="${E.lash}" stroke-width="2.4" stroke-linecap="round" opacity=".7"/>`;
    // め
    const R = (s) => s;
    const L = (s) => `<g transform="translate(400 0) scale(-1 1)">${s}</g>`;
    const blinkD = `style="animation-delay:-${(Math.random() * 4).toFixed(2)}s"`;
    if (expr === 'happy' || expr === 'joy') {
      o += R(eyeHappy(236, 186, E)) + L(eyeHappy(236, 186, E));
    } else if (expr === 'wink') {
      o += R(eyeHappy(236, 186, E)) + L(eyeOpen(236, 186, E, id));
    } else if (expr === 'surprise') {
      o += R(eyeSurprise(236, 186, E, id)) + L(eyeSurprise(236, 186, E, id));
    } else {
      const look = expr === 'lookL' ? -4 : expr === 'lookR' ? 4 : 0;
      o += `<g class="kp-eyes" ${blinkD}>` + R(eyeOpen(236, 186, E, id, look)) + L(eyeOpen(236, 186, E, id, -look)) + `</g>`;
    }
    if (mk.lash && !['happy', 'joy'].includes(expr)) {
      const ls = `<path d="M254,176 l9,-8 M257,183 l11,-5 M250,170 l6,-10" stroke="${E.lash}" stroke-width="2.4" stroke-linecap="round"/>`;
      o += ls + (expr === 'wink' ? '' : `<g transform="translate(400 0) scale(-1 1)">${ls}</g>`);
    }
    if (mk.sticker) {
      // ほっぺの シール（かみに かくれない ように かおの うちがわ）
      const st = mk.sticker === 'heart' ? heart(250, 216, 9, '#FF8FB8', '#fff', 1.8) : mk.sticker === 'moon' ? `<path d="M255,205 a11,11 0 1,0 2.5,20 a8.5,8.5 0 1,1 -2.5,-20Z" fill="#FFE08A" stroke="#fff" stroke-width="1.8"/>` : star(250, 216, 10, '#FFE08A', '#fff', 1.8);
      o += st + sparkle(263, 204, 4, '#fff');
    }
    // はな
    o += `<path d="M199,214 q2,2 4,0" fill="none" stroke="${skin.line}" stroke-width="1.6" stroke-linecap="round"/>`;
    const lip = mk.lip || '#B8406A';
    // くち
    if (expr === 'surprise') {
      o += `<ellipse cx="200" cy="234" rx="7" ry="8.5" fill="${lip}" stroke="#8E2C52" stroke-width="1.5"/><ellipse cx="200" cy="238" rx="4" ry="3" fill="#FF9AB4"/>`;
    } else if (expr === 'joy' || expr === 'wink') {
      o += `<path d="M184,226 Q200,226 216,226 Q214,248 200,250 Q186,248 184,226Z" fill="${lip}" stroke="#8E2C52" stroke-width="1.6" stroke-linejoin="round"/>` +
        `<path d="M190,242 Q200,236 210,242 Q206,249 200,249 Q194,249 190,242Z" fill="#FF9AB4"/>` +
        `<path d="M186,227 L214,227 L213,231 L187,231Z" fill="#fff"/>`;
    } else if (expr === 'cat') {
      o += `<path d="M186,228 q7,8 14,0 q7,8 14,0" fill="none" stroke="#8E2C52" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
    } else if (expr === 'sad') {
      o += `<path d="M190,236 Q200,230 210,236" fill="none" stroke="#8E2C52" stroke-width="2.2" stroke-linecap="round"/>`;
    } else {
      o += `<path d="M188,228 Q200,229 212,228 Q209,243 200,244 Q191,243 188,228Z" fill="${lip}" stroke="#8E2C52" stroke-width="1.5" stroke-linejoin="round"/>` +
        `<path d="M193,238 Q200,234 207,238 Q204,243 200,243 Q196,243 193,238Z" fill="#FF9AB4"/>`;
    }
    if (mk.lip) o += `<ellipse cx="195" cy="231" rx="3" ry="1.6" fill="#fff" opacity=".8"/>`;
    return o;
  }

  // ---- きゃら ぜんたい ----
  // opt: { hair:{style, color}, eye, outfit:{slot:{type,color}}, pose, expr }
  const EYES = {
    lav: { top: '#4B2C7A', mid: '#8E5BD0', bot: '#E7BDF7', deep: '#3A1E5E', glow: '#F6D6FF', lash: '#4A2A63' },
    pink: { top: '#7A2C52', mid: '#D45B95', bot: '#FFC4DE', deep: '#5A1E3E', glow: '#FFE0EE', lash: '#5E2A44' },
    blue: { top: '#22406E', mid: '#4C86D8', bot: '#BFE4FF', deep: '#16304E', glow: '#DDF2FF', lash: '#283C5E' },
    green: { top: '#1F5A4A', mid: '#3FAA8A', bot: '#C4F2E2', deep: '#123E33', glow: '#DCFBF0', lash: '#2A4A42' },
    amber: { top: '#6E4214', mid: '#D08A2C', bot: '#FFE2A6', deep: '#4E2C0A', glow: '#FFF2D0', lash: '#5A3A22' },
  };
  KP.EYES = EYES;
  const HAIRS = {
    lav: { base: '#C7B0F2', light: '#F1EAFF', dark: '#9A7FDB', deep: '#7D61C4', line: '#7458B8', tip: '#F3C8EC', tie: '#F8BCD6' },
    pink: { base: '#F9BCD4', light: '#FFEAF2', dark: '#EC8FB6', deep: '#D7709C', line: '#C25E88', tie: '#FFE08A', tip: '#FFE3EF' },
    blue: { base: '#AFCBF6', light: '#EAF3FF', dark: '#7FA4E6', deep: '#6188D0', line: '#5576BC', tie: '#FFE08A' },
    yellow: { base: '#FFE39A', light: '#FFF8DE', dark: '#F5C55C', deep: '#E2A93C', line: '#C48E2C', tie: '#F8BCD6' },
    mint: { base: '#B4E8D6', light: '#ECFCF6', dark: '#7FCDB2', deep: '#5CB396', line: '#4C9C82', tie: '#F8BCD6' },
    silver: { base: '#E4E2F2', light: '#FFFFFF', dark: '#BDB8D8', deep: '#A29CC6', line: '#8D86B4', tie: '#F8BCD6', tip: '#F4E6F6' },
    brown: { base: '#D9AE8C', light: '#F6E3D2', dark: '#B5835E', deep: '#9A6A48', line: '#875C40', tie: '#F8BCD6' },
  };
  KP.HAIRS = HAIRS;

  const LAYERS = ['shoes', 'skirt', 'top', 'dress', 'ribbon'];

  KP.drawChar = function (opt) {
    const id = uid('k');
    const H = HAIRS[opt.hairColor || 'lav'];
    const E = EYES[opt.eyeColor || 'lav'];
    const style = opt.hairStyle || 'long';
    const pose = POSES[opt.pose || 'stand'];
    const out = opt.outfit || {};
    let defs = '';
    defs += lg(id + 'b', [[0, H.base], [0.45, H.dark], [0.85, H.base], [1, H.tip || H.light]]);
    defs += lg(id + 'f', [[0, H.dark], [0.25, H.base], [0.6, H.base], [1, H.dark]]);
    defs += lg(id + 'i', [[0, E.top], [0.45, E.mid], [1, E.bot]]);
    defs += rg(id + 'k', [[0, SKIN.blush, 0.75], [1, SKIN.blush, 0]]);

    // パーツを くみたてる
    const parts = {};
    const layer = { back: '', shoes: '', skirt: '', top: '', dress: '', sleeves: '', ribbon: '', hair: '', magic: '' };
    const wearing = {};
    for (const slot in out) {
      const it = out[slot];
      if (!it) continue;
      const fn = PARTS[it.type];
      if (!fn) continue;
      const r = fn(PAL[it.color] || PAL.lav, id + slot);
      parts[slot] = r;
      wearing[slot] = true;
      if (r.defs) defs += r.defs;
    }
    const has = (s) => !!parts[s];
    for (const slot in parts) {
      const r = parts[slot];
      if (r.back && !((slot === 'tops' || slot === 'skirt') && has('onepiece'))) layer.back += r.back;
      if (slot === 'onepiece') {
        layer.dress += r.dress || '';
        layer.sleeves += r.sleeves || '';
      } else if (slot === 'tops') {
        if (has('onepiece')) continue;
        layer.top += r.top || '';
        layer.sleeves += r.sleeves || '';
      } else if (slot === 'skirt') {
        if (has('onepiece')) continue;
        layer.skirt += r.skirt || '';
      } else if (slot === 'shoes') layer.shoes += r.shoes || '';
      else if (slot === 'hair') layer.hair += r.hair || '';
      else if (slot === 'ribbon') layer.ribbon += r.ribbon || '';
      else if (slot === 'magic') layer.magic += r.magic || '';
    }
    if (!has('onepiece')) {
      if (!has('tops')) layer.top = camisole();
      if (!has('skirt')) layer.skirt = petticoat();
    }

    let o = `<defs>${defs}${rg(id + 'sh', [[0, '#3A2458', 0.28], [1, '#3A2458', 0]])}</defs>`;
    if (!opt.noShadow) o += `<ellipse cx="200" cy="630" rx="96" ry="16" fill="url(#${id}sh)"/>`;
    o += layer.back;
    o += `<g class="kp-hairback">${hairBack(style, H, id)}</g>`;
    o += legs(SKIN);
    o += layer.shoes || shoeShape(PAL.white, '#fff', false);
    o += torso(SKIN);
    o += `<g class="kp-skirt">${layer.skirt}</g>` + layer.top + `<g class="kp-dress">${layer.dress}</g>` + layer.ribbon;
    o += `<g class="kp-face">` + face(opt.expr || 'smile', E, id, SKIN, opt.makeup || {}) + sideLocks(style, H, id) + `</g>`;
    // うで・もちもの
    o += arm(pose.L, SKIN) + arm(pose.R, SKIN);
    o += layer.sleeves;
    if (layer.magic && pose.wand != null) {
      const h = pose.R[2];
      o += `<g transform="translate(${h[0]} ${h[1]}) rotate(${pose.wand})">${layer.magic}</g>`;
    }
    o += hand(pose.L[2], SKIN) + hand(pose.R[2], SKIN);
    o += `<g class="kp-head">` + hairFront(style, H, id) + layer.hair + `</g>`;
    return o;
  };

  // パーツ だけの え（アイコン よう）
  KP.drawPart = function (slot, type, color) {
    const id = uid('p');
    const r = PARTS[type](PAL[color] || PAL.lav, id);
    let o = `<defs>${r.defs || ''}</defs>` + (r.back || '');
    if (slot === 'magic') return o + `<g transform="translate(0 0)">${r.magic}</g>`;
    if (slot === 'tops') return o + (r.top || '') + (r.sleeves || '');
    if (slot === 'onepiece') return o + (r.dress || '') + (r.sleeves || '');
    return o + (r.skirt || r.shoes || r.hair || r.ribbon || '');
  };
  KP._a = { sleevesPuff, shoeShape, petticoat, skirtPleats, SKIN };
  KP.PART_VIEW = {
    tops: '116 262 168 120',
    skirt: '96 330 208 140',
    onepiece: '70 262 260 260',
    shoes: '150 510 100 126',
    hair: '90 -20 220 200',
    ribbon: '160 266 80 80',
    magic: '-50 -150 100 180',
  };

  KP.svg = (vb, inner, cls = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" class="${cls}">${inner}</svg>`;
})();

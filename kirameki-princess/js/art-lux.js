// ごうかな いしょう（ボールガウン・ローズ・マーメイド・ウェディング・ゆきのじょおう・にじいろ・ジュエル・ちょうちょ・マント・オーロラ と こもの）
(function () {
  const KP = window.KP;
  const { PAL, GOLD, lg, rg, star, heart, sparkle, bow, mirror, lace, PARTS } = KP;
  const { shoeShape, petticoat } = KP._a;

  // ルビーと きんいろ
  PAL.red = { base: '#F27A8E', light: '#FFE1E6', mid: '#E5566F', dark: '#C93A57', deep: '#9E2442', line: '#A8324D' };
  PAL.gold = { base: '#FFE08A', light: '#FFF6CF', mid: '#FFD15E', dark: '#E9B44C', deep: '#C98C25', line: '#C99234' };

  const bodice = (f, line) => `<path d="M162,286 Q200,278 238,286 Q250,292 248,304 L238,358 Q200,368 162,358 L152,304 Q150,292 162,286Z" fill="${f}" stroke="${line}" stroke-width="1.8"/>`;
  const belt = (f, line) => `<path d="M162,352 Q200,364 238,352 L238,364 Q200,376 162,364Z" fill="${f}" stroke="${line}" stroke-width="1.5"/>`;
  // ほうせき（ひしがた）
  const gem = (x, y, r, C) =>
    `<path d="M${x},${y - r} L${x + r * 0.78},${y} L${x},${y + r} L${x - r * 0.78},${y}Z" fill="${C.base}" stroke="${C.line}" stroke-width="1.3" stroke-linejoin="round"/>` +
    `<path d="M${x},${y - r} L${x + r * 0.78},${y} L${x},${y + r * 0.2}Z" fill="#fff" opacity=".45"/>` +
    `<path d="M${x - r * 0.78},${y} L${x},${y + r} L${x},${y + r * 0.2}Z" fill="${C.dark}" opacity=".35"/>`;
  // しずくの ほうせき
  const drop = (x, y, r, C) =>
    `<path d="M${x},${y - r * 1.3} Q${x + r},${y - r * 0.1} ${x + r * 0.9},${y + r * 0.4} A${r * 0.92},${r * 0.92} 0 1,1 ${x - r * 0.9},${y + r * 0.4} Q${x - r},${y - r * 0.1} ${x},${y - r * 1.3}Z" fill="${C.base}" stroke="${C.line}" stroke-width="1.3"/>` +
    `<ellipse cx="${x - r * 0.3}" cy="${y + r * 0.1}" rx="${r * 0.28}" ry="${r * 0.45}" fill="#fff" opacity=".7"/>`;
  const pearl = (x, y, r = 3.4) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="#C9B8E6" stroke-width="1"/><circle cx="${x - r * 0.3}" cy="${y - r * 0.3}" r="${r * 0.35}" fill="#F3EEFA"/>`;
  // ばら
  const rose = (x, y, r, C) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.base}" stroke="${C.line}" stroke-width="1.4"/>` +
    `<path d="M${x - r * 0.55},${y + r * 0.1} Q${x - r * 0.5},${y - r * 0.6} ${x + r * 0.1},${y - r * 0.55} Q${x + r * 0.6},${y - r * 0.4} ${x + r * 0.5},${y + r * 0.15} Q${x + r * 0.3},${y + r * 0.55} ${x - r * 0.1},${y + r * 0.4} Q${x - r * 0.35},${y + r * 0.2} ${x - r * 0.15},${y - r * 0.1} Q${x + r * 0.05},${y - r * 0.3} ${x + r * 0.2},${y}" fill="none" stroke="${C.dark}" stroke-width="1.5" stroke-linecap="round"/>` +
    `<path d="M${x - r * 0.7},${y + r * 0.6} Q${x},${y + r * 1.05} ${x + r * 0.7},${y + r * 0.6}" fill="none" stroke="${C.light}" stroke-width="1.4" opacity=".9"/>`;
  const leaf = (x, y, s, rot) => `<path transform="translate(${x} ${y}) rotate(${rot})" d="M0,0 Q${s * 0.5},${-s * 0.45} ${s},0 Q${s * 0.5},${s * 0.45} 0,0Z" fill="#9EDC9A" stroke="#5FA86A" stroke-width="1.2"/>`;
  // ゆきの けっしょう
  const flake = (x, y, r, col = '#fff', w = 1.6) => {
    let d = '';
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3, c = Math.cos(a), s = Math.sin(a);
      const ex = x + c * r, ey = y + s * r, mx = x + c * r * 0.55, my = y + s * r * 0.55;
      const b = r * 0.3, a1 = a + 0.7, a2 = a - 0.7;
      d += `M${x},${y} L${ex.toFixed(1)},${ey.toFixed(1)} M${mx.toFixed(1)},${my.toFixed(1)} l${(Math.cos(a1) * b).toFixed(1)},${(Math.sin(a1) * b).toFixed(1)} M${mx.toFixed(1)},${my.toFixed(1)} l${(Math.cos(a2) * b).toFixed(1)},${(Math.sin(a2) * b).toFixed(1)} `;
    }
    return `<path d="${d}" stroke="${col}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
  };
  // きんの ししゅう（くるくる）
  const curl = (x, y, s, col = GOLD.base) =>
    `<path d="M${x - s},${y} q${s * 0.5},${-s * 0.9} ${s},0 q${s * 0.5},${s * 0.9} ${s},0 M${x},${y - s * 0.2} q${-s * 0.4},${s * 0.9} 0,${s * 1.1} q${s * 0.4},${-s * 0.2} 0,${-s * 1.1}" fill="none" stroke="${col}" stroke-width="2" stroke-linecap="round"/>`;
  // とがった はなびらの すそ
  function petals(x0, x1, y, n, h, fill, line, curve = 0) {
    const w = (x1 - x0) / n;
    let o = '';
    for (let i = 0; i < n; i++) {
      const xa = x0 + i * w, xb = xa + w, cx = xa + w / 2;
      const yy = y + curve * Math.sin(Math.PI * ((i + 0.5) / n));
      o += `<path d="M${xa - 3},${yy - 4} C${xa - w * 0.18},${yy + h * 0.6} ${cx - w * 0.3},${yy + h * 0.95} ${cx},${yy + h} C${cx + w * 0.3},${yy + h * 0.95} ${xb + w * 0.18},${yy + h * 0.6} ${xb + 3},${yy - 4}Z" fill="${fill}" stroke="${line}" stroke-width="1.5" stroke-linejoin="round"/>` +
        `<path d="M${cx},${yy + h * 0.15} L${cx},${yy + h * 0.8}" stroke="#fff" stroke-width="1.4" opacity=".45" stroke-linecap="round"/>`;
    }
    return o;
  }
  const puff = (fill, line, trim) => {
    const half = `<path d="M158,284 C134,278 120,296 125,316 C128,332 146,338 160,332 C168,322 172,300 168,288Z" fill="${fill}" stroke="${line}" stroke-width="1.8" stroke-linejoin="round"/>` +
      `<path d="M134,294 Q146,290 156,300 M132,312 Q144,306 158,316" fill="none" stroke="#fff" stroke-width="1.6" opacity=".55"/>` +
      `<path d="M127,324 Q144,340 162,332" fill="none" stroke="${trim}" stroke-width="4.5" stroke-linecap="round"/>` +
      `<circle cx="145" cy="335" r="3" fill="#fff" stroke="${line}" stroke-width="1"/>`;
    return half + mirror(half);
  };

  // ================= ワンピース =================
  // ① ロイヤル ボールガウン
  PARTS.ballgown = (C, g) => ({
    defs: lg(g + 'd', [[0, '#fff'], [0.3, C.light], [1, C.base]]) +
      lg(g + 'u', [[0, C.mid], [0.28, C.base], [0.5, C.light], [0.72, C.base], [1, C.mid]], 0, 0, 1, 0),
    dress:
      `<path d="M166,348 Q200,356 234,348 C264,384 318,452 330,560 Q200,594 70,560 C82,452 136,384 166,348Z" fill="url(#${g}u)" stroke="${C.line}" stroke-width="1.8"/>` +
      lace(70, 330, 558, 9, '#fff', C.line, 18) +
      `<path d="M70,560 Q200,594 330,560" fill="none" stroke="${GOLD.dark}" stroke-width="7"/><path d="M70,560 Q200,594 330,560" fill="none" stroke="${GOLD.base}" stroke-width="4"/>` +
      `<path d="M74,550 Q200,582 326,550" fill="none" stroke="${GOLD.light}" stroke-width="2" stroke-dasharray="2 6" stroke-linecap="round"/>` +
      // まんなかの パネル
      `<path d="M186,362 L214,362 L252,578 Q200,588 148,578Z" fill="${C.light}" stroke="${GOLD.dark}" stroke-width="2.2"/>` +
      [400, 446, 494, 542].map((y, i) => curl(200, y, 8 + i * 2)).join('') +
      [420, 470, 520].map((y) => gem(200, y, 6, C)).join('') +
      // ドレープ
      `<path d="M112,452 Q150,498 186,462 L186,474 Q150,512 108,466Z" fill="${C.light}" stroke="${C.line}" stroke-width="1.5" opacity=".95"/>` +
      mirror(`<path d="M112,452 Q150,498 186,462 L186,474 Q150,512 108,466Z" fill="${C.light}" stroke="${C.line}" stroke-width="1.5" opacity=".95"/>`) +
      [0, 1, 2, 3, 4, 5].map((i) => pearl(116 + i * 13, 466 + Math.sin(((i + 0.5) / 6) * Math.PI) * 22, 3)).join('') +
      mirror([0, 1, 2, 3, 4, 5].map((i) => pearl(116 + i * 13, 466 + Math.sin(((i + 0.5) / 6) * Math.PI) * 22, 3)).join('')) +
      bow(110, 456, 0.38, C, null, { tails: false }) + bow(290, 456, 0.38, C, null, { tails: false }) +
      `<path d="M120,420 Q112,480 100,540 M280,420 Q288,480 300,540" fill="none" stroke="#fff" stroke-width="5" opacity=".35" stroke-linecap="round"/>` +
      sparkle(130, 520, 5) + sparkle(270, 512, 5) + sparkle(150, 410, 3.5) + sparkle(256, 404, 3.5) + star(98, 548, 4, '#fff') + star(302, 548, 4, '#fff') +
      // ボディス
      bodice(`url(#${g}d)`, C.line) +
      `<path d="M156,292 Q200,308 244,292" fill="none" stroke="${GOLD.dark}" stroke-width="5" stroke-linecap="round"/><path d="M156,292 Q200,308 244,292" fill="none" stroke="${GOLD.base}" stroke-width="2.6" stroke-linecap="round"/>` +
      `<path d="M178,312 L200,350 L222,312" fill="none" stroke="${GOLD.dark}" stroke-width="2"/>` +
      `<path d="M188,322 L212,322 M191,334 L209,334" stroke="${GOLD.base}" stroke-width="2" stroke-linecap="round"/>` +
      belt(GOLD.base, GOLD.line) + gem(200, 362, 8, C) + drop(200, 306, 6, C) + sparkle(194, 300, 2.6),
    sleeves: puff(`url(#${g}d)`, C.line, GOLD.base),
  });

  // ② ローズドレス
  PARTS.rosegown = (C, g) => ({
    defs: lg(g + 'd', [[0, C.light], [0.5, C.base], [1, C.mid]]) + lg(g + 'u', [[0, C.base], [1, C.dark]]),
    dress:
      `<path d="M166,348 Q200,356 234,348 C266,390 314,456 322,552 Q200,584 78,552 C86,456 134,390 166,348Z" fill="url(#${g}u)" stroke="${C.line}" stroke-width="1.8"/>` +
      lace(78, 322, 550, 8, C.light, C.line, 18) +
      // まきついた はなびら
      `<path d="M200,358 C150,400 112,470 104,548 Q150,530 186,562 C176,486 184,416 200,358Z" fill="${C.mid}" stroke="${C.line}" stroke-width="1.6"/>` +
      mirror(`<path d="M200,358 C150,400 112,470 104,548 Q150,530 186,562 C176,486 184,416 200,358Z" fill="${C.mid}" stroke="${C.line}" stroke-width="1.6"/>`) +
      `<path d="M172,356 C140,400 124,452 126,508 Q160,488 192,512 C186,452 190,400 200,358Z" fill="url(#${g}d)" stroke="${C.line}" stroke-width="1.6"/>` +
      mirror(`<path d="M172,356 C140,400 124,452 126,508 Q160,488 192,512 C186,452 190,400 200,358Z" fill="url(#${g}d)" stroke="${C.line}" stroke-width="1.6"/>`) +
      `<path d="M182,356 C164,392 158,420 160,456 Q182,442 200,462 Q218,442 240,456 C242,420 236,392 218,356Z" fill="${C.base}" stroke="${C.line}" stroke-width="1.5"/>` +
      `<path d="M140,420 Q132,470 128,500 M260,420 Q268,470 272,500 M118,500 Q112,520 110,540 M282,500 Q288,520 290,540" fill="none" stroke="#fff" stroke-width="3" opacity=".5" stroke-linecap="round"/>` +
      // ばらの かざり
      leaf(150, 372, 16, 200) + leaf(150, 372, 14, 120) + rose(152, 366, 13, C) + rose(172, 378, 9, C) + rose(140, 384, 8, C) +
      [[96, 550], [140, 566], [200, 574], [260, 566], [304, 550], [200, 466], [130, 512], [270, 512]].map(([x, y]) => leaf(x, y, 12, 160) + rose(x, y - 4, 8, C)).join('') +
      sparkle(230, 430, 4) + sparkle(120, 470, 4) + sparkle(276, 486, 4) +
      // ボディス（ハートの むなもと）
      bodice(`url(#${g}d)`, C.line) +
      `<path d="M158,290 Q178,280 200,296 Q222,280 242,290" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="M186,310 Q200,330 214,310 M184,330 Q200,350 216,330" fill="none" stroke="${C.dark}" stroke-width="1.6" opacity=".6"/>` +
      belt(C.dark, C.line) + rose(200, 360, 8, C),
    sleeves: (() => {
      const half = leaf(150, 292, 14, 190) + rose(160, 290, 10, C) + `<path d="M170,288 Q166,276 176,272" fill="none" stroke="${C.line}" stroke-width="2"/>`;
      return half + mirror(half);
    })(),
  });

  // ③ マーメイドドレス
  PARTS.mermaid = (C, g) => {
    let scales = '';
    for (let r = 0; r < 6; r++) {
      const y = 372 + r * 18, n = 5, x0 = 166 + r * 0.6, x1 = 234 - r * 0.6, w = (x1 - x0) / n;
      for (let i = 0; i < n + (r % 2 ? 0 : 1); i++) {
        const x = x0 + i * w - (r % 2 ? 0 : w / 2);
        if (x < x0 - 4 || x > x1 + 4) continue;
        scales += `<path d="M${(x - w / 2).toFixed(1)},${y} Q${x.toFixed(1)},${y + 14} ${(x + w / 2).toFixed(1)},${y}" fill="none" stroke="#fff" stroke-width="1.5" opacity=".6"/>`;
      }
    }
    const fin = `M168,476 Q120,522 82,578 Q120,566 146,580 Q172,566 200,582 Q228,566 254,580 Q280,566 318,578 Q280,522 232,476Z`;
    return {
      defs: lg(g + 'd', [[0, C.light], [0.45, C.base], [1, C.dark]]) + lg(g + 'f', [[0, C.base, 0.95], [1, C.light, 0.75]]) +
        lg(g + 's', [[0, '#fff'], [0.5, C.light], [1, C.base]], 0, 0, 1, 1),
      dress:
        `<path d="${fin}" fill="url(#${g}f)" stroke="${C.line}" stroke-width="1.8" stroke-linejoin="round"/>` +
        `<path d="M200,486 L120,568 M200,486 L160,576 M200,486 L200,578 M200,486 L240,576 M200,486 L280,568" stroke="#fff" stroke-width="2" opacity=".55"/>` +
        `<path d="M162,348 Q200,356 238,348 Q248,420 236,482 Q200,494 164,482 Q152,420 162,348Z" fill="url(#${g}d)" stroke="${C.line}" stroke-width="1.8"/>` +
        scales +
        `<path d="M164,482 Q200,494 236,482" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>` +
        [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => pearl(166 + i * 8.5, 482 + Math.sin(((i + 0.5) / 9) * Math.PI) * 10, 3)).join('') +
        // かいがらの かざり
        `<g transform="translate(232 470)"><path d="M0,0 L-11,-14 Q0,-22 11,-14Z" fill="${PAL.pink.light}" stroke="${PAL.pink.line}" stroke-width="1.3"/><path d="M0,0 L-5,-17 M0,0 L0,-19 M0,0 L5,-17" stroke="${PAL.pink.line}" stroke-width="1" opacity=".7"/></g>` +
        sparkle(176, 404, 3.5) + sparkle(224, 440, 3.5) + sparkle(110, 560, 4) + sparkle(292, 560, 4) +
        `<circle cx="134" cy="530" r="4" fill="none" stroke="#fff" stroke-width="1.4" opacity=".8"/><circle cx="270" cy="520" r="5" fill="none" stroke="#fff" stroke-width="1.4" opacity=".8"/>` +
        bodice(`url(#${g}s)`, C.line) +
        `<g transform="translate(200 318)"><path d="M0,10 L-16,-8 Q0,-20 16,-8Z" fill="${PAL.pink.light}" stroke="${PAL.pink.line}" stroke-width="1.5"/><path d="M0,10 L-8,-14 M0,10 L0,-16 M0,10 L8,-14" stroke="${PAL.pink.line}" stroke-width="1.2" opacity=".7"/></g>` +
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => pearl(160 + i * 8.9, 290 + Math.sin(((i + 0.5) / 10) * Math.PI) * 10, 2.8)).join('') + pearl(200, 336, 4.2) +
        belt(C.dark, C.line),
      sleeves: (() => {
        const half = `<path d="M162,288 C140,280 122,290 122,306 C136,302 148,308 162,316Z" fill="url(#${g}f)" stroke="${C.line}" stroke-width="1.6"/>` +
          `<path d="M156,292 L130,300 M158,300 L134,306" stroke="#fff" stroke-width="1.4" opacity=".7"/>`;
        return half + mirror(half);
      })(),
    };
  };

  // ④ ウェディングドレス（ながい トレーン）
  PARTS.wedding = (C, g) => {
    let dots = '';
    [[130, 470], [160, 500], [190, 476], [220, 506], [250, 474], [276, 500], [146, 430], [206, 440], [258, 430], [116, 520], [286, 530], [170, 540], [234, 544]]
      .forEach(([x, y]) => (dots += `<g opacity=".8">${[0, 72, 144, 216, 288].map((a) => `<circle cx="${(x + Math.cos((a * Math.PI) / 180) * 4).toFixed(1)}" cy="${(y + Math.sin((a * Math.PI) / 180) * 4).toFixed(1)}" r="2.4" fill="#fff" stroke="${C.dark}" stroke-width=".8"/>`).join('')}<circle cx="${x}" cy="${y}" r="1.6" fill="${GOLD.base}"/></g>`));
    return {
      defs: lg(g + 'd', [[0, '#fff'], [0.6, C.light], [1, C.base]]) + lg(g + 't', [[0, C.light, 0.95], [1, '#fff', 0.85]]),
      back:
        `<path d="M170,350 Q96,470 30,606 Q200,640 370,606 Q304,470 230,350Z" fill="url(#${g}t)" stroke="${C.dark}" stroke-width="1.6"/>` +
        lace(30, 370, 604, 9, '#fff', C.dark, 30) + sparkle(64, 590, 5) + sparkle(338, 590, 5),
      dress:
        `<path d="M166,348 Q200,356 234,348 Q292,440 306,566 Q200,592 94,566 Q108,440 166,348Z" fill="url(#${g}d)" stroke="${C.dark}" stroke-width="1.8"/>` +
        lace(94, 306, 564, 8, '#fff', C.dark, 22) +
        lace(104, 296, 512, 7, '#fff', C.dark, 18).replace('fill="#fff"', 'fill="#fff" opacity=".85"') +
        lace(122, 278, 456, 6, '#fff', C.dark, 12).replace('fill="#fff"', 'fill="#fff" opacity=".8"') +
        dots +
        `<path d="M112,520 Q104,450 140,390 M288,520 Q296,450 260,390" fill="none" stroke="#fff" stroke-width="5" opacity=".6" stroke-linecap="round"/>` +
        bodice(`url(#${g}d)`, C.dark) +
        `<path d="M160,290 Q180,282 200,294 Q220,282 240,290" fill="none" stroke="${C.dark}" stroke-width="1.6"/>` +
        lace(158, 242, 288, 5, '#fff', C.dark, -2) +
        `<path d="M184,308 Q200,322 216,308 M182,326 Q200,340 218,326" fill="none" stroke="${C.dark}" stroke-width="1.3" opacity=".6"/>` +
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => pearl(164 + i * 7.2, 360 + Math.sin(((i + 0.5) / 11) * Math.PI) * 8, 3)).join('') +
        bow(232, 356, 0.42, { ...C, base: '#fff', mid: C.light, line: C.dark }, null),
      sleeves: (() => {
        const half = `<path d="M160,286 C140,280 126,294 128,310 C138,316 150,316 162,312Z" fill="#fff" fill-opacity=".75" stroke="${C.dark}" stroke-width="1.5"/>` +
          `<circle cx="140" cy="300" r="1.8" fill="${C.dark}" opacity=".6"/><circle cx="150" cy="306" r="1.8" fill="${C.dark}" opacity=".6"/>` + lace(128, 162, 310, 4, '#fff', C.dark, 2);
        return half + mirror(half);
      })(),
    };
  };

  // ⑤ ゆきの じょおう ドレス（すける マント）
  PARTS.snowqueen = (C, g) => {
    let icicles = '';
    for (let i = 0; i < 12; i++) {
      const x = 104 + i * 17.5, y = 566 + Math.sin(((i + 0.5) / 12) * Math.PI) * 18;
      icicles += `<path d="M${x - 6},${y - 3} L${x},${y + 10 + (i % 3) * 4} L${x + 6},${y - 3}Z" fill="#fff" stroke="${C.line}" stroke-width="1.1" stroke-linejoin="round"/>`;
    }
    return {
      defs: lg(g + 'd', [[0, '#fff'], [0.4, C.light], [1, C.base]]) + lg(g + 'u', [[0, C.light], [0.6, C.base], [1, C.mid]]) +
        lg(g + 'c', [[0, C.light, 0.7], [1, C.base, 0.45]]),
      back:
        `<path d="M158,290 Q96,440 56,604 Q200,628 344,604 Q304,440 242,290Z" fill="url(#${g}c)" stroke="${C.line}" stroke-width="1.4" stroke-opacity=".7"/>` +
        flake(96, 560, 12, '#fff', 1.8) + flake(304, 556, 12, '#fff', 1.8) + flake(124, 470, 9) + flake(278, 460, 9) + flake(78, 600, 7) + flake(322, 598, 7) +
        sparkle(110, 520, 5) + sparkle(292, 512, 5),
      dress:
        `<path d="M166,348 Q200,356 234,348 Q272,452 294,568 Q200,590 106,568 Q128,452 166,348Z" fill="url(#${g}u)" stroke="${C.line}" stroke-width="1.8"/>` +
        `<path d="M196,360 Q170,460 150,572 M206,360 Q236,460 252,576 M180,362 Q150,460 126,566" fill="none" stroke="#fff" stroke-width="2.2" opacity=".55"/>` +
        icicles +
        flake(150, 500, 11) + flake(246, 470, 13) + flake(200, 540, 9) + flake(176, 420, 7) + flake(226, 400, 7) + flake(124, 548, 7) + flake(276, 540, 8) +
        sparkle(214, 510, 4) + sparkle(160, 452, 3.5) +
        bodice(`url(#${g}d)`, C.line) +
        // こおりの ひしがた もよう
        `<path d="M170,300 L186,320 L170,340 M186,300 L200,320 L186,340 L200,356 M214,300 L200,320 L214,340 L200,356 M230,300 L214,320 L230,340" fill="none" stroke="#fff" stroke-width="1.8" opacity=".85"/>` +
        gem(200, 320, 9, { ...C, base: '#E8F7FF', line: C.line, dark: C.base }) +
        `<path d="M158,290 Q200,304 242,290" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>` +
        belt('#fff', C.line) + [174, 190, 210, 226].map((x) => `<path d="M${x},${360} l3,4 l-3,4 l-3,-4Z" fill="${C.base}"/>`).join(''),
      sleeves: (() => {
        const half = `<path d="M160,286 C132,284 118,306 122,330 C134,340 150,336 162,330 Z" fill="url(#${g}c)" stroke="${C.line}" stroke-width="1.5"/>` + flake(140, 312, 6) +
          `<path d="M122,330 Q140,344 162,330" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`;
        return half + mirror(half);
      })(),
    };
  };

  // ⑥ にじいろ ドレス
  const RAINBOW = [PAL.pink, PAL.peach, PAL.yellow, PAL.mint, PAL.blue, PAL.lav];
  PARTS.rainbow = (C, g) => {
    let tiers = '';
    for (let i = RAINBOW.length - 1; i >= 0; i--) {
      const R = RAINBOW[i], y = 372 + i * 30, half = 40 + i * 25;
      tiers += `<path d="M${200 - half * 0.62},${y - 26} L${200 + half * 0.62},${y - 26} L${200 + half},${y + 12} Q200,${y + 28} ${200 - half},${y + 12}Z" fill="${R.base}" stroke="${R.line}" stroke-width="1.6" stroke-linejoin="round"/>` +
        lace(200 - half, 200 + half, y + 11, 6, R.light, R.line, 16) +
        sparkle(200 - half * 0.5, y, 3) + star(200 + half * 0.55, y + 2, 3.5, '#fff');
    }
    return {
      defs: lg(g + 'd', [[0, '#fff'], [1, '#F6F0FF']]),
      dress:
        tiers +
        `<path d="M166,346 Q200,356 234,346 L240,358 Q200,370 160,358Z" fill="#fff" stroke="#B9A9D9" stroke-width="1.5"/>` +
        bodice(`url(#${g}d)`, '#B9A9D9') +
        RAINBOW.map((R, i) => `<path d="M${158 + i * 1},${300 + i * 9} Q200,${310 + i * 9} ${242 - i * 1},${300 + i * 9}" fill="none" stroke="${R.mid}" stroke-width="5" opacity=".9"/>`).join('') +
        star(200, 316, 10, GOLD.base, GOLD.line, 1.6) + sparkle(196, 312, 2.6) +
        bow(234, 358, 0.48, PAL.lav, null),
      sleeves: (() => {
        const half = `<path d="M158,284 C136,280 124,296 128,314 C130,328 144,334 158,330 C166,322 170,300 168,288Z" fill="#fff" stroke="#B9A9D9" stroke-width="1.8"/>` +
          RAINBOW.slice(0, 4).map((R, i) => `<path d="M${131 + i},${318 + i * 4} Q${144},${330 + i * 4} ${159},${326 + i * 2}" fill="none" stroke="${R.mid}" stroke-width="2.4" stroke-linecap="round"/>`).join('');
        return half + mirror(half);
      })(),
    };
  };

  // ⑦ ジュエルドレス
  PARTS.jewel = (C, g) => {
    const sk = `M166,348 Q200,356 234,348 Q296,440 312,560 Q200,588 88,560 Q104,440 166,348Z`;
    let lat = '';
    for (let i = -6; i <= 6; i++) {
      lat += `<path d="M${200 + i * 30},${350} L${200 + i * 30 + 150},${600} M${200 + i * 30},${350} L${200 + i * 30 - 150},${600}" stroke="${GOLD.base}" stroke-width="1.6" opacity=".75"/>`;
    }
    let gems = '';
    for (let r = 0; r < 7; r++) for (let i = -r - 1; i <= r + 1; i++) {
      const x = 200 + i * 30 + (r % 2 ? 15 : 0), y = 365 + r * 30 + 15;
      if (Math.abs(x - 200) > 30 + r * 17) continue;
      gems += (r + i) % 3 === 0 ? gem(x, y, 4.5, C) : `<circle cx="${x}" cy="${y}" r="2" fill="#fff"/>`;
    }
    let hem = '';
    for (let i = 0; i < 9; i++) {
      const x = 102 + i * 24.5, y = 566 + Math.sin(((i + 0.5) / 9) * Math.PI) * 16;
      hem += `<path d="M${x},${y - 4} L${x},${y + 4}" stroke="${GOLD.line}" stroke-width="1.4"/>` + drop(x, y + 12, 5.4, i % 2 ? C : { ...PAL.white, base: '#F3F8FF', line: '#A9B6D8' });
    }
    return {
      defs: lg(g + 'd', [[0, C.light], [0.45, C.base], [1, C.dark]]) + lg(g + 'u', [[0, C.mid], [0.5, C.base], [1, C.dark]], 0, 0, 1, 1) +
        `<clipPath id="${g}k"><path d="${sk}"/></clipPath>`,
      dress:
        `<path d="${sk}" fill="url(#${g}u)" stroke="${C.line}" stroke-width="1.8"/>` +
        `<g clip-path="url(#${g}k)">${lat}${gems}</g>` +
        `<path d="M88,560 Q200,588 312,560" fill="none" stroke="${GOLD.dark}" stroke-width="6"/><path d="M88,560 Q200,588 312,560" fill="none" stroke="${GOLD.base}" stroke-width="3"/>` +
        hem + sparkle(132, 500, 5) + sparkle(270, 470, 5) + sparkle(222, 540, 4) +
        bodice(`url(#${g}d)`, C.line) +
        `<path d="M160,290 L178,286 L190,300 L200,288 L210,300 L222,286 L240,290" fill="none" stroke="${GOLD.base}" stroke-width="3" stroke-linejoin="round"/>` +
        `<path d="M178,312 L222,312 L210,346 L190,346Z" fill="none" stroke="${GOLD.base}" stroke-width="1.8"/>` +
        gem(200, 326, 14, C) + sparkle(194, 318, 3.4) + gem(176, 330, 5, C) + gem(224, 330, 5, C) +
        belt(GOLD.base, GOLD.line) + [176, 188, 200, 212, 224].map((x, i) => (i === 2 ? gem(x, 362, 6, C) : `<circle cx="${x}" cy="${361 + Math.abs(x - 200) * -0.05}" r="2.6" fill="#fff" stroke="${GOLD.line}" stroke-width=".8"/>`)).join(''),
      sleeves: (() => {
        const half = `<path d="M162,286 C146,280 132,286 132,298 Q148,300 162,306Z" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="1.5"/>` +
          drop(138, 308, 4.2, C) + drop(150, 310, 4.2, C) + `<circle cx="146" cy="292" r="3" fill="#fff"/>`;
        return half + mirror(half);
      })(),
    };
  };

  // ⑧ ちょうちょ ドレス（おおきな はね）
  PARTS.butterfly = (C, g) => {
    const half =
      `<path d="M196,310 C170,230 92,190 64,226 C42,256 70,312 186,330Z" fill="url(#${g}w)" stroke="${C.line}" stroke-width="2"/>` +
      `<path d="M190,334 C140,340 92,380 104,424 C116,456 168,420 194,346Z" fill="url(#${g}w)" stroke="${C.line}" stroke-width="2"/>` +
      `<path d="M78,232 C96,214 130,222 150,250 C130,252 100,252 78,232Z" fill="${C.dark}" opacity=".5"/>` +
      `<circle cx="96" cy="262" r="10" fill="#fff" stroke="${C.line}" stroke-width="1.4"/><circle cx="96" cy="262" r="5" fill="${C.mid}"/>` +
      `<circle cx="128" cy="292" r="6" fill="#fff" opacity=".85"/><circle cx="72" cy="246" r="4" fill="#fff" opacity=".85"/>` +
      `<circle cx="126" cy="404" r="8" fill="#fff" stroke="${C.line}" stroke-width="1.3"/><circle cx="126" cy="404" r="4" fill="${C.mid}"/><circle cx="150" cy="376" r="4.5" fill="#fff" opacity=".85"/>` +
      `<path d="M186,318 C150,280 110,250 80,240 M186,338 C150,360 124,392 116,418" fill="none" stroke="${C.line}" stroke-width="1.4" opacity=".55"/>` +
      sparkle(84, 300, 5) + sparkle(110, 440, 4);
    const wing = half;
    return {
      defs: lg(g + 'w', [[0, '#fff', 0.95], [0.5, C.light, 0.95], [1, C.base, 0.95]], 0, 0, 1, 1) + lg(g + 'd', [[0, C.light], [0.5, C.base], [1, C.mid]]),
      back: `<g transform="translate(196 318) scale(1.45) translate(-196 -318)">${wing + mirror(wing)}</g>`,
      dress:
        `<path d="M166,348 Q200,356 234,348 Q270,400 290,456 Q200,476 110,456 Q130,400 166,348Z" fill="url(#${g}d)" stroke="${C.line}" stroke-width="1.8"/>` +
        petals(110, 290, 440, 8, 34, C.base, C.line, 14) +
        petals(126, 274, 404, 6, 30, C.light, C.line, 10) +
        `<path d="M166,348 Q200,356 234,348 Q246,372 252,392 Q200,404 148,392 Q154,372 166,348Z" fill="${C.mid}" stroke="${C.line}" stroke-width="1.6"/>` +
        sparkle(150, 430, 4) + sparkle(250, 428, 4) + sparkle(200, 470, 4) +
        bodice(`url(#${g}d)`, C.line) +
        lace(158, 242, 288, 5, '#fff', C.line, -2) +
        // むねの ちょうちょ
        `<g transform="translate(200 324)"><path d="M0,0 C-8,-16 -24,-18 -24,-6 C-24,4 -10,4 0,0 C-10,4 -20,12 -14,18 C-8,22 -2,10 0,0Z" fill="${C.dark}" stroke="${C.line}" stroke-width="1.3"/>` +
        `<path d="M0,0 C8,-16 24,-18 24,-6 C24,4 10,4 0,0 C10,4 20,12 14,18 C8,22 2,10 0,0Z" fill="${C.dark}" stroke="${C.line}" stroke-width="1.3"/><ellipse cx="0" cy="2" rx="2.4" ry="8" fill="${C.deep}"/>` +
        `<circle cx="-14" cy="-6" r="3" fill="#fff" opacity=".8"/><circle cx="14" cy="-6" r="3" fill="#fff" opacity=".8"/></g>` +
        belt(C.dark, C.line),
      sleeves: (() => {
        const half = `<path d="M160,288 C140,276 120,284 122,302 C138,300 150,306 162,314Z" fill="url(#${g}w)" stroke="${C.line}" stroke-width="1.5"/>`;
        return half + mirror(half);
      })(),
    };
  };

  // ⑨ ロイヤル マント ドレス
  PARTS.royalcape = (C, g) => {
    let ermine = '';
    for (let i = 0; i < 9; i++) {
      const x = 60 + i * 35, y = 600 + Math.sin(((i + 0.5) / 9) * Math.PI) * 12;
      ermine += `<path d="M${x},${y - 6} q2,6 0,10 q-2,-4 0,-10Z" fill="#2C2836"/>`;
    }
    return {
      defs: lg(g + 'c', [[0, C.mid], [0.5, C.base], [1, C.dark]], 0, 0, 1, 0) + lg(g + 'd', [[0, '#fff'], [0.5, GOLD.light], [1, GOLD.base]]) + lg(g + 'u', [[0, C.base], [1, C.dark]]),
      back:
        `<path d="M156,288 Q90,450 40,606 Q200,634 360,606 Q310,450 244,288Z" fill="url(#${g}c)" stroke="${C.line}" stroke-width="1.8"/>` +
        `<path d="M40,606 Q200,634 360,606 L364,592 Q200,620 36,592Z" fill="#fff" stroke="#C9B8E6" stroke-width="1.6"/>` +
        `<path d="M40,606 Q32,500 70,440 L84,446 Q50,510 54,602Z" fill="#fff" stroke="#C9B8E6" stroke-width="1.4"/>` +
        mirror(`<path d="M40,606 Q32,500 70,440 L84,446 Q50,510 54,602Z" fill="#fff" stroke="#C9B8E6" stroke-width="1.4"/>`) +
        ermine + `<path d="M48,520 q2,6 0,10 q-2,-4 0,-10Z M352,520 q2,6 0,10 q-2,-4 0,-10Z" fill="#2C2836"/>` +
        [[90, 520], [130, 470], [280, 480], [316, 530], [110, 570], [292, 574]].map(([x, y]) => star(x, y, 6, GOLD.base, GOLD.line, 1)).join(''),
      dress:
        `<path d="M166,348 Q200,356 234,348 Q286,440 300,566 Q200,590 100,566 Q114,440 166,348Z" fill="url(#${g}d)" stroke="${GOLD.line}" stroke-width="1.8"/>` +
        `<path d="M184,360 L216,360 L246,580 Q200,588 154,580Z" fill="url(#${g}u)" stroke="${GOLD.dark}" stroke-width="2"/>` +
        [400, 450, 500, 548].map((y) => curl(200, y, 9)).join('') +
        [425, 475, 525].map((y) => gem(200, y, 5.5, PAL.blue)).join('') +
        lace(100, 300, 564, 8, '#fff', GOLD.line, 20) +
        `<path d="M120,520 Q114,450 150,390 M280,520 Q286,450 250,390" fill="none" stroke="#fff" stroke-width="4" opacity=".55" stroke-linecap="round"/>` +
        bodice(`url(#${g}u)`, C.line) +
        `<path d="M180,292 L200,356 L220,292" fill="url(#${g}d)" stroke="${GOLD.line}" stroke-width="1.4"/>` +
        [306, 322, 338].map((y) => `<circle cx="200" cy="${y}" r="3.4" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="1"/>`).join('') +
        belt(GOLD.base, GOLD.line) + gem(200, 362, 7, PAL.red),
      sleeves: (() => {
        // けがわの えり
        const half = `<path d="M200,288 Q172,276 152,284 Q130,294 132,312 Q150,318 164,306 Q180,298 200,300Z" fill="#fff" stroke="#C9B8E6" stroke-width="1.6"/>` +
          `<path d="M150,296 q2,6 0,10 q-2,-4 0,-10Z M170,292 q2,6 0,10 q-2,-4 0,-10Z" fill="#2C2836"/>`;
        return half + mirror(half) + `<path d="M190,300 L200,312 L210,300" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="1.2"/>` + gem(200, 300, 5, PAL.red);
      })(),
    };
  };

  // ⑩ オーロラ ドレス
  PARTS.aurora = (C, g) => ({
    defs: lg(g + 'u', [[0, C.light], [0.3, PAL.pink.base], [0.55, PAL.mint.base], [0.8, PAL.blue.base], [1, C.base]]) +
      lg(g + 'v', [[0, '#fff', 0.1], [0.5, '#fff', 0.55], [1, '#fff', 0.1]], 0, 0, 1, 0) + lg(g + 'd', [[0, '#fff'], [0.5, C.light], [1, C.base]]),
    dress:
      `<path d="M166,348 Q200,356 234,348 Q300,440 322,560 Q262,548 236,578 Q200,560 164,578 Q138,548 78,560 Q100,440 166,348Z" fill="url(#${g}u)" stroke="${C.line}" stroke-width="1.8" stroke-linejoin="round"/>` +
      `<path d="M176,352 Q150,450 130,560 Q170,540 196,566 Q186,450 200,356Z" fill="url(#${g}v)"/>` +
      `<path d="M224,352 Q262,450 288,556 Q246,540 220,568 Q226,450 206,356Z" fill="url(#${g}v)"/>` +
      `<path d="M100,500 Q160,470 200,500 Q240,530 300,500" fill="none" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round"/>` +
      `<path d="M120,440 Q170,420 200,444 Q230,468 282,440" fill="none" stroke="#fff" stroke-width="2.4" opacity=".5" stroke-linecap="round"/>` +
      [[118, 540], [150, 470], [190, 520], [230, 450], [262, 500], [292, 540], [210, 400], [170, 410]].map(([x, y], i) => (i % 2 ? sparkle(x, y, 5) : star(x, y, 4, '#fff'))).join('') +
      bodice(`url(#${g}d)`, C.line) +
      `<path d="M158,290 Q200,304 242,290" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>` +
      `<path d="M176,316 Q200,300 224,316 Q200,336 176,316Z" fill="${PAL.mint.light}" stroke="${C.line}" stroke-width="1.2"/>` + gem(200, 316, 7, C) +
      belt(C.dark, C.line) + star(200, 362, 6, GOLD.base, GOLD.line, 1),
    sleeves: (() => {
      const half = `<path d="M162,288 C142,276 120,288 118,312 Q130,326 146,318 Q156,310 162,314Z" fill="url(#${g}v)" stroke="${C.line}" stroke-width="1.4" stroke-opacity=".7"/>` +
        `<path d="M162,288 C142,276 120,288 118,312" fill="none" stroke="${PAL.pink.mid}" stroke-width="2" opacity=".6"/>`;
      return half + mirror(half);
    })(),
  });

  // ================= スカート・トップス =================
  PARTS.ballskirt = (C, g) => ({
    defs: lg(g + 's', [[0, C.mid], [0.3, C.base], [0.5, C.light], [0.7, C.base], [1, C.mid]], 0, 0, 1, 0),
    skirt:
      `<path d="M166,346 Q200,354 234,346 C262,384 314,452 324,556 Q200,588 76,556 C86,452 138,384 166,346Z" fill="url(#${g}s)" stroke="${C.line}" stroke-width="1.8"/>` +
      lace(76, 324, 554, 9, '#fff', C.line, 18) +
      `<path d="M76,556 Q200,588 324,556" fill="none" stroke="${GOLD.dark}" stroke-width="6"/><path d="M76,556 Q200,588 324,556" fill="none" stroke="${GOLD.base}" stroke-width="3"/>` +
      `<path d="M98,500 Q200,530 302,500" fill="none" stroke="${GOLD.base}" stroke-width="2.4" stroke-dasharray="3 7" stroke-linecap="round"/>` +
      [[130, 520], [170, 532], [230, 532], [270, 520], [200, 536]].map(([x, y]) => curl(x, y, 6)).join('') +
      `<path d="M124,420 Q114,480 104,540 M276,420 Q286,480 296,540" fill="none" stroke="#fff" stroke-width="5" opacity=".35" stroke-linecap="round"/>` +
      sparkle(150, 450, 4) + sparkle(252, 470, 4) +
      `<path d="M164,344 Q200,354 236,344 L238,358 Q200,368 162,358Z" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="1.6"/>` + gem(200, 356, 6, C),
  });
  PARTS.tulle = (C, g) => ({
    defs: lg(g + 's', [[0, C.base, 0.95], [1, C.light, 0.85]]),
    skirt:
      `<path d="M166,346 Q200,354 234,346 Q300,440 318,548 Q200,572 82,548 Q100,440 166,346Z" fill="url(#${g}s)" stroke="${C.line}" stroke-width="1.6"/>` +
      `<path d="M168,350 Q200,358 232,350 Q284,440 300,532 Q200,554 100,532 Q116,440 168,350Z" fill="${C.light}" opacity=".55"/>` +
      `<path d="M170,354 Q200,362 230,354 Q268,430 280,508 Q200,528 120,508 Q132,430 170,354Z" fill="#fff" opacity=".4"/>` +
      `<path d="M82,548 Q100,556 118,548 Q136,560 154,552 Q172,564 190,556 Q208,566 226,556 Q244,564 262,552 Q280,560 298,548 Q310,554 318,548" fill="none" stroke="${C.line}" stroke-width="1.6"/>` +
      [[120, 520], [150, 460], [180, 500], [220, 440], [250, 510], [280, 530], [200, 540], [166, 410], [240, 400]].map(([x, y], i) => (i % 3 ? `<circle cx="${x}" cy="${y}" r="2.4" fill="#fff"/>` : sparkle(x, y, 5))).join('') +
      `<path d="M164,344 Q200,354 236,344 L238,358 Q200,368 162,358Z" fill="${C.dark}" stroke="${C.line}" stroke-width="1.6"/>` + bow(232, 352, 0.4, C, null),
  });
  PARTS.royaltop = (C, g) => ({
    defs: lg(g + 't', [[0, C.light], [0.5, C.base], [1, C.mid]]),
    top:
      `<path d="M160,284 Q200,276 240,284 Q252,290 250,304 L240,360 Q200,370 160,360 L150,304 Q148,290 160,284Z" fill="url(#${g}t)" stroke="${C.line}" stroke-width="1.8"/>` +
      // ジャボ（むなもとの フリル）
      `<path d="M186,284 Q200,296 214,284 Q222,300 212,312 Q222,322 210,334 Q216,346 200,350 Q184,346 190,334 Q178,322 188,312 Q178,300 186,284Z" fill="#fff" stroke="${C.line}" stroke-width="1.5"/>` +
      `<path d="M190,312 Q200,318 210,312 M190,334 Q200,340 210,334" fill="none" stroke="${C.line}" stroke-width="1.2" opacity=".6"/>` +
      gem(200, 298, 6, C) +
      [312, 332, 352].map((y) => `<circle cx="176" cy="${y}" r="3" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="1"/><circle cx="224" cy="${y}" r="3" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="1"/>`).join('') +
      `<path d="M160,356 Q200,368 240,356" fill="none" stroke="${GOLD.base}" stroke-width="3.5"/>`,
    sleeves: (() => {
      const half = `<path d="M158,284 C134,278 120,296 125,316 C128,332 146,338 160,332 C168,322 172,300 168,288Z" fill="url(#${g}t)" stroke="${C.line}" stroke-width="1.8"/>` +
        // きんの かたかざり
        `<path d="M168,286 Q150,276 138,288 Q150,292 166,296Z" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="1.3"/>` +
        `<path d="M140,290 L138,302 M146,292 L145,304 M152,293 L152,305" stroke="${GOLD.dark}" stroke-width="2" stroke-linecap="round"/>` +
        `<path d="M127,324 Q144,340 162,332" fill="none" stroke="${GOLD.base}" stroke-width="4" stroke-linecap="round"/>` + lace(126, 162, 330, 4, '#fff', C.line, 6);
      return half + mirror(half);
    })(),
  });

  // ================= かみかざり =================
  PARTS.grandtiara = (C, g) => ({
    defs: lg(g + 'h', [[0, GOLD.light], [0.5, GOLD.base], [1, GOLD.dark]]),
    hair:
      `<path d="M132,100 L140,76 L156,90 L166,58 L184,80 L200,34 L216,80 L234,58 L244,90 L260,76 L268,100 Q200,82 132,100Z" fill="url(#${g}h)" stroke="${GOLD.line}" stroke-width="1.8" stroke-linejoin="round"/>` +
      `<path d="M150,92 Q160,74 172,86 Q180,70 192,82 M208,82 Q220,70 228,86 Q240,74 250,92" fill="none" stroke="#fff" stroke-width="2" opacity=".7"/>` +
      `<path d="M130,100 Q200,80 270,100 L268,110 Q200,92 132,110Z" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="1.6"/>` +
      [146, 162, 178, 222, 238, 254].map((x) => pearl(x, 99 - (x < 200 ? (x - 130) : (270 - x)) * 0.12, 2.8)).join('') +
      drop(200, 66, 10, C) + gem(166, 74, 6, C) + gem(234, 74, 6, C) + drop(200, 100, 5, C) +
      `<circle cx="200" cy="34" r="5" fill="#fff" stroke="${GOLD.line}" stroke-width="1.2"/>` +
      sparkle(188, 56, 4) + sparkle(258, 62, 6) + sparkle(142, 64, 5),
  });
  PARTS.rosecrown = (C, g) => ({
    hair:
      `<path d="M120,118 Q200,52 280,118" fill="none" stroke="#7CC08A" stroke-width="6" stroke-linecap="round"/>` +
      [[124, 112, 160], [150, 86, 200], [178, 72, 220], [222, 72, 140], [250, 86, 160], [276, 112, 200]].map(([x, y, r]) => leaf(x, y, 14, r)).join('') +
      [[132, 104, 11], [160, 82, 13], [200, 70, 15], [240, 82, 13], [268, 104, 11]].map(([x, y, r], i) => rose(x, y, r, i % 2 ? { ...C, base: C.light, dark: C.mid } : C)).join('') +
      pearl(180, 70, 3) + pearl(220, 70, 3) + sparkle(286, 84, 5),
  });
  PARTS.veil = (C, g) => ({
    defs: lg(g + 'v', [[0, '#fff', 0.85], [1, C.light, 0.6]]),
    back: `<path d="M150,80 Q104,240 64,560 Q200,600 336,560 Q296,240 250,80 Q200,60 150,80Z" fill="url(#${g}v)" stroke="${C.dark}" stroke-width="1.2" stroke-opacity=".6"/>` +
      lace(64, 336, 558, 9, '#fff', C.dark, 30).replace('fill="#fff"', 'fill="#fff" opacity=".85"') +
      sparkle(96, 470, 5) + sparkle(306, 440, 5) + sparkle(120, 300, 4) + sparkle(286, 280, 4),
    hair:
      `<path d="M152,84 Q112,180 90,346 Q104,356 124,346 Q122,220 164,96Z" fill="#fff" opacity=".55" stroke="${C.dark}" stroke-width="1" stroke-opacity=".5"/>` +
      mirror(`<path d="M152,84 Q112,180 90,346 Q104,356 124,346 Q122,220 164,96Z" fill="#fff" opacity=".55" stroke="${C.dark}" stroke-width="1" stroke-opacity=".5"/>`) +
      `<path d="M140,92 Q200,64 260,92" fill="none" stroke="${GOLD.base}" stroke-width="5" stroke-linecap="round"/>` +
      [[160, 80], [184, 72], [216, 72], [240, 80]].map(([x, y]) => [0, 72, 144, 216, 288].map((a) => `<circle cx="${(x + Math.cos((a * Math.PI) / 180) * 5).toFixed(1)}" cy="${(y + Math.sin((a * Math.PI) / 180) * 5).toFixed(1)}" r="4" fill="#fff" stroke="${C.dark}" stroke-width="1"/>`).join('') + `<circle cx="${x}" cy="${y}" r="2.6" fill="${GOLD.base}"/>`).join('') +
      pearl(200, 68, 4) + sparkle(258, 64, 5),
  });
  PARTS.snowcrown = (C, g) => ({
    defs: lg(g + 'h', [[0, '#fff'], [0.5, C.light], [1, C.base]]),
    hair:
      `<path d="M136,102 L146,70 L158,94 L170,50 L184,90 L200,26 L216,90 L230,50 L242,94 L254,70 L264,102 Q200,86 136,102Z" fill="url(#${g}h)" stroke="${C.line}" stroke-width="1.8" stroke-linejoin="round"/>` +
      `<path d="M200,34 L200,86 M170,58 L174,88 M230,58 L226,88" stroke="#fff" stroke-width="2" opacity=".8"/>` +
      `<path d="M134,102 Q200,84 266,102 L264,110 Q200,94 136,110Z" fill="#fff" stroke="${C.line}" stroke-width="1.5"/>` +
      flake(200, 96, 7, C.dark, 1.4) + gem(170, 100, 4, C) + gem(230, 100, 4, C) +
      sparkle(212, 40, 5) + sparkle(150, 60, 4) + sparkle(262, 60, 4),
  });

  // ================= むね・もちもの・くつ =================
  PARTS.jewelneck = (C, g) => {
    let o = '';
    for (let i = 0; i <= 14; i++) {
      const t = i / 14, x = 170 + t * 60, y = 286 + Math.sin(t * Math.PI) * 26;
      o += i % 2 ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.4" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width=".8"/>` : gem(x, y, 3.6, C);
    }
    return { ribbon: o + `<circle cx="200" cy="314" r="5" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="1"/>` + drop(200, 330, 9, C) + sparkle(194, 324, 3) + drop(184, 320, 4, C) + drop(216, 320, 4, C) };
  };
  PARTS.scepter = (C, g) => ({
    defs: lg(g + 'm', [[0, GOLD.light], [1, GOLD.dark]], 0, 0, 1, 0) + rg(g + 'o', [[0, '#fff'], [0.4, C.light], [1, C.base]], 0.35, 0.3, 0.7),
    magic:
      `<path d="M-5,16 L-4,-90 L4,-90 L5,16Z" fill="url(#${g}m)" stroke="${GOLD.line}" stroke-width="1.6"/>` +
      `<path d="M-6,-20 L6,-20 M-6,-50 L6,-50" stroke="${GOLD.line}" stroke-width="3"/>` + gem(0, -35, 4, C) + gem(0, -65, 4, C) +
      `<path d="M-14,-92 Q0,-100 14,-92 L10,-86 L-10,-86Z" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="1.4"/>` +
      `<circle cx="0" cy="-114" r="20" fill="url(#${g}o)" stroke="${C.line}" stroke-width="1.8"/>` +
      `<path d="M-20,-114 Q0,-104 20,-114 M0,-134 L0,-94" fill="none" stroke="${GOLD.base}" stroke-width="2.6"/>` +
      `<path d="M0,-134 L0,-150 M-7,-143 L7,-143" stroke="${GOLD.dark}" stroke-width="4" stroke-linecap="round"/>` +
      sparkle(-8, -122, 5) + sparkle(22, -136, 5),
  });
  PARTS.fan = (C, g) => {
    let ribs = '';
    for (let i = 0; i <= 8; i++) {
      const a = (-160 + i * 17.5) * (Math.PI / 180);
      ribs += `<path d="M0,0 L${(Math.cos(a) * 62).toFixed(1)},${(Math.sin(a) * 62).toFixed(1)}" stroke="${C.line}" stroke-width="1.2" opacity=".6"/>`;
    }
    const a0 = (-160 * Math.PI) / 180, a1 = (-20 * Math.PI) / 180;
    const P = (a, r) => `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
    return {
      magic:
        `<g transform="translate(0 -40)"><path d="M0,0 L${P(a0, 66)} A66,66 0 0,1 ${P(a1, 66)}Z" fill="${C.base}" stroke="${C.line}" stroke-width="1.8"/>` +
        `<path d="M${P(a0, 52)} A52,52 0 0,1 ${P(a1, 52)}" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="3 5" opacity=".8"/>` +
        lace(-62, 62, -60, 6, '#fff', C.line, -14).replace('<path', `<path transform="translate(0 -6)"`) +
        ribs + heart(0, -30, 9, C.dark, C.line) + `<circle cx="0" cy="0" r="5" fill="${GOLD.base}" stroke="${GOLD.line}"/></g>` +
        `<path d="M-3,14 L-2,-36 L2,-36 L3,14Z" fill="${C.dark}" stroke="${C.line}" stroke-width="1.2"/>` + bow(0, 6, 0.4, C, null),
    };
  };
  PARTS.bouquet = (C, g) => ({
    magic:
      `<path d="M-14,16 L-6,-40 L6,-40 L14,16Z" fill="#fff" stroke="#C9B8E6" stroke-width="1.6"/>` +
      `<path d="M-8,-10 L8,-10" stroke="${C.dark}" stroke-width="5"/>` + bow(0, -10, 0.55, C, null) +
      leaf(-20, -50, 18, 200) + leaf(20, -50, 18, -20) + leaf(-6, -84, 16, 250) +
      rose(-16, -62, 12, C) + rose(14, -64, 12, { ...C, base: '#fff', dark: C.base, light: '#fff' }) + rose(0, -80, 13, C) + rose(-2, -52, 10, { ...C, base: C.light, dark: C.mid }) +
      pearl(-24, -80, 3) + pearl(24, -84, 3) + pearl(10, -96, 3) + sparkle(28, -98, 5),
  });
  PARTS.jewelheels = (C, g) => ({
    defs: lg(g + 'k', [[0, C.light], [0.5, C.base], [1, C.dark]]),
    shoes: shoeShape(C, `url(#${g}k)`, false) + mirror(gem(186, 596, 5.5, C)) + gem(186, 596, 5.5, C) +
      `<path d="M176,590 Q186,586 196,590" fill="none" stroke="${GOLD.base}" stroke-width="2.4"/>` + mirror(`<path d="M176,590 Q186,586 196,590" fill="none" stroke="${GOLD.base}" stroke-width="2.4"/>`) +
      sparkle(172, 612, 3.5) + mirror(sparkle(172, 612, 3.5)),
  });

  // ながい ドレスは アイコンの わくを ひろく
  const LONG = '40 262 320 340', WIDE = '20 210 360 410';
  KP.PART_VIEW_TYPE = Object.assign(KP.PART_VIEW_TYPE || {}, {
    ballgown: LONG, rosegown: LONG, mermaid: LONG, aurora: LONG, rainbow: LONG, jewel: LONG,
    wedding: WIDE, snowqueen: WIDE, royalcape: WIDE, butterfly: '0 120 400 380',
    ballskirt: '66 330 268 270', tulle: '66 330 268 260',
    veil: '50 30 300 360', fan: '-75 -125 150 160', bouquet: '-50 -125 100 160',
  });
})();

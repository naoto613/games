// ついかの いしょう・かぐ・かべがみ（400×640 の きょうつう ざひょう）
(function () {
  const KP = window.KP;
  const { PAL, GOLD, lg, rg, star, heart, sparkle, bow, mirror, lace, PARTS, FURN } = KP;
  const { sleevesPuff, shoeShape, petticoat, skirtPleats } = KP._a;
  const waist = (C) => `<path d="M164,344 Q200,354 236,344 L238,358 Q200,368 162,358Z" fill="${C.dark}" stroke="${C.line}" stroke-width="1.6"/>`;
  const bodice = (f, line) => `<path d="M162,286 Q200,278 238,286 Q250,292 248,304 L238,358 Q200,368 162,358 L152,304 Q150,292 162,286Z" fill="${f}" stroke="${line}" stroke-width="1.8"/>`;

  // ---------- トップス ----------
  PARTS.cardigan = (C, g) => ({
    defs: lg(g + 't', [[0, C.light], [1, C.base]]),
    top:
      bodice('#fff', '#C9B8E6') +
      `<path d="M182,290 L200,300 L218,290" fill="none" stroke="#C9B8E6" stroke-width="1.6"/>` +
      // ひらいた カーディガン
      `<path d="M160,284 Q176,280 190,290 L196,362 Q176,366 158,360 L150,304 Q148,290 160,284Z" fill="url(#${g}t)" stroke="${C.line}" stroke-width="1.8"/>` +
      mirror(`<path d="M160,284 Q176,280 190,290 L196,362 Q176,366 158,360 L150,304 Q148,290 160,284Z" fill="url(#${g}t)" stroke="${C.line}" stroke-width="1.8"/>`) +
      heart(186, 318, 4.5, C.dark) + heart(186, 340, 4.5, C.dark) + mirror(heart(186, 318, 4.5, C.dark) + heart(186, 340, 4.5, C.dark)) +
      `<path d="M158,354 Q176,360 196,356 M204,356 Q224,360 242,354" fill="none" stroke="${C.dark}" stroke-width="3" stroke-dasharray="1 4" stroke-linecap="round"/>` +
      `<path d="M166,300 Q164,326 168,350" fill="none" stroke="#fff" stroke-width="3" opacity=".6" stroke-linecap="round"/>`,
    sleeves: sleevesPuff(C, `url(#${g}t)`, false),
  });
  PARTS.idoltop = (C, g) => ({
    defs: lg(g + 't', [[0, '#fff'], [0.4, C.light], [1, C.base]]),
    top:
      bodice(`url(#${g}t)`, C.line) +
      lace(156, 244, 290, 5, '#fff', C.line, -2) + lace(160, 240, 302, 5, C.light, C.line, -2) +
      `<path d="M176,330 L200,362 L224,330" fill="${C.dark}" opacity=".35"/>` +
      star(200, 330, 13, GOLD.base, GOLD.line, 1.8) + sparkle(196, 326, 3) +
      `<path d="M160,356 Q200,368 240,356" fill="none" stroke="${C.dark}" stroke-width="3"/>`,
    sleeves: (() => {
      const half = `<path d="M160,286 C142,280 128,296 132,312 C134,322 148,324 160,318Z" fill="#fff" stroke="${C.line}" stroke-width="1.8"/>` + lace(130, 160, 316, 4, C.light, C.line, 2) + star(146, 302, 4, C.base);
      return half + mirror(half);
    })(),
  });

  // ---------- スカート ----------
  PARTS.tiered = (C, g) => ({
    skirt:
      petticoat() +
      `<path d="M126,412 L274,412 L290,446 Q200,464 110,446Z" fill="${C.base}" stroke="${C.line}" stroke-width="1.8"/>` + lace(110, 290, 444, 6, '#fff', C.line, 10) +
      `<path d="M140,380 L260,380 L276,418 Q200,434 124,418Z" fill="${C.light}" stroke="${C.line}" stroke-width="1.8"/>` + lace(124, 276, 416, 6, C.base, C.line, 9) +
      `<path d="M166,346 Q200,354 234,346 L262,388 Q200,402 138,388Z" fill="${C.base}" stroke="${C.line}" stroke-width="1.8"/>` + lace(138, 262, 386, 6, '#fff', C.line, 8) +
      waist(C) + bow(232, 354, 0.4, C, null, { tails: false }),
  });
  PARTS.heartskirt = (C, g) => ({
    defs: lg(g + 's', [[0, C.light], [1, C.base]]),
    skirt:
      petticoat() +
      `<path d="M166,346 Q200,354 234,346 L280,436 Q200,456 120,436Z" fill="url(#${g}s)" stroke="${C.line}" stroke-width="1.8"/>` +
      [[150, 400], [178, 380], [204, 410], [232, 384], [254, 414], [190, 432], [226, 436], [140, 428], [262, 430]].map(([x, y], i) => heart(x, y, 6 + (i % 2) * 2, i % 3 ? C.dark : '#fff')).join('') +
      lace(120, 280, 434, 7, '#fff', C.line, 10) + waist(C),
  });

  // ---------- ワンピース ----------
  PARTS.idol = (C, g) => ({
    defs: lg(g + 'd', [[0, '#fff'], [0.35, C.light], [1, C.base]]) + lg(g + 'u', [[0, C.base], [1, C.dark]]),
    back: `<g opacity=".95">${bow(200, 352, 2.0, C, null)}</g>`,
    dress:
      `<path d="M166,346 Q200,354 234,346 Q280,390 298,438 Q200,462 102,438 Q120,390 166,346Z" fill="#fff" stroke="${C.line}" stroke-width="1.6"/>` + lace(102, 298, 436, 6, C.light, C.line, 12) +
      `<path d="M166,346 Q200,354 234,346 Q268,384 280,420 Q240,412 200,432 Q160,412 120,420 Q132,384 166,346Z" fill="url(#${g}u)" stroke="${C.line}" stroke-width="1.8"/>` +
      `<path d="M120,420 Q160,412 200,432 Q240,412 280,420" fill="none" stroke="${GOLD.base}" stroke-width="3"/>` +
      star(150, 404, 6, '#fff') + star(250, 404, 6, '#fff') + star(200, 416, 7, GOLD.base) +
      bodice(`url(#${g}d)`, C.line) +
      lace(158, 242, 290, 5, '#fff', C.line, -2) +
      `<path d="M168,322 L232,322 M170,338 L230,338" stroke="${C.mid}" stroke-width="4" opacity=".6"/>` +
      star(200, 316, 11, GOLD.base, GOLD.line, 1.6) +
      `<path d="M162,354 Q200,366 238,354 L238,364 Q200,376 162,364Z" fill="${C.dark}" stroke="${C.line}" stroke-width="1.5"/>`,
    sleeves: (() => {
      const half = `<path d="M160,286 C142,280 128,296 132,312 C134,322 148,324 160,318Z" fill="url(#${g}d)" stroke="${C.line}" stroke-width="1.8"/>` + lace(130, 160, 316, 4, '#fff', C.line, 2);
      return half + mirror(half);
    })(),
  });
  PARTS.fairy = (C, g) => {
    const wing = `<path d="M196,300 C150,230 70,226 62,270 C56,304 110,320 186,316Z" fill="url(#${g}w)" stroke="${C.line}" stroke-width="1.8" opacity=".9"/>` +
      `<path d="M190,322 C140,330 90,360 104,392 C116,416 160,380 192,330Z" fill="url(#${g}w)" stroke="${C.line}" stroke-width="1.8" opacity=".9"/>` +
      `<path d="M180,304 C140,276 100,268 80,276 M180,324 C150,346 126,366 118,384" fill="none" stroke="#fff" stroke-width="2" opacity=".8"/>` + sparkle(96, 270, 6) + sparkle(120, 380, 5);
    let petals = '';
    for (let i = 0; i < 7; i++) {
      const x = 118 + i * 27.5;
      petals += `<path d="M${x - 16},${400 + Math.abs(3 - i) * -3} Q${x},${470 - Math.abs(3 - i) * 4} ${x + 16},${400 + Math.abs(3 - i) * -3}Z" fill="${i % 2 ? C.base : C.light}" stroke="${C.line}" stroke-width="1.6"/>`;
    }
    return {
      defs: lg(g + 'w', [[0, '#FFFFFF', 0.95], [1, C.base, 0.75]]) + lg(g + 'd', [[0, C.light], [1, C.base]]),
      back: wing + mirror(wing),
      dress:
        petals +
        `<path d="M166,346 Q200,354 234,346 Q262,380 274,410 Q200,426 126,410 Q138,380 166,346Z" fill="url(#${g}d)" stroke="${C.line}" stroke-width="1.8"/>` +
        `<path d="M146,404 q10,-14 20,0 q10,-14 20,0 q10,-14 20,0 q10,-14 20,0 q10,-14 20,0 q10,-14 20,0" fill="none" stroke="#fff" stroke-width="2" opacity=".8"/>` +
        bodice(`url(#${g}d)`, C.line) +
        // はっぱの えり
        `<path d="M172,286 Q186,302 200,292 Q214,302 228,286 Q214,290 200,284 Q186,290 172,286Z" fill="#9EDDC8" stroke="#4C9C82" stroke-width="1.4"/>` +
        `<circle cx="200" cy="330" r="7" fill="${PAL.pink.base}" stroke="${PAL.pink.line}" stroke-width="1.4"/>` + [0, 1, 2, 3, 4].map((i) => { const a = i * 1.2566 - 1.57; return `<circle cx="${200 + Math.cos(a) * 9}" cy="${330 + Math.sin(a) * 9}" r="4.5" fill="#fff" stroke="${PAL.pink.line}" stroke-width="1"/>`; }).join('') + `<circle cx="200" cy="330" r="4" fill="${GOLD.base}"/>` +
        `<path d="M162,354 Q200,366 238,354 L238,362 Q200,374 162,362Z" fill="#9EDDC8" stroke="#4C9C82" stroke-width="1.4"/>`,
      sleeves: sleevesPuff(C, `url(#${g}d)`, false),
    };
  };

  // ---------- くつ ----------
  PARTS.sandal = (C, g) => ({
    shoes: shoeShape(C, '#fff', false) +
      `<path d="M172,594 Q186,604 200,594 M172,606 Q186,614 200,606" fill="none" stroke="${C.dark}" stroke-width="3.4" stroke-linecap="round"/>` + mirror(`<path d="M172,594 Q186,604 200,594 M172,606 Q186,614 200,606" fill="none" stroke="${C.dark}" stroke-width="3.4" stroke-linecap="round"/>`) +
      heart(186, 590, 6, C.base, C.line) + mirror(heart(186, 590, 6, C.base, C.line)),
  });
  PARTS.ballet = (C, g) => {
    const lace2 = `<path d="M176,560 L198,574 M198,560 L176,574 M176,574 L198,588 M198,574 L176,588" stroke="${C.dark}" stroke-width="2.4" stroke-linecap="round"/>`;
    return {
      defs: lg(g + 'k', [[0, C.light], [1, C.base]]),
      shoes: lace2 + mirror(lace2) + shoeShape(C, `url(#${g}k)`, false) + bow(186, 590, 0.32, C, null, { tails: false }) + mirror(bow(186, 590, 0.32, C, null, { tails: false })),
    };
  };

  // ---------- かみかざり ----------
  PARTS.catears = (C, g) => {
    const ear = `<path d="M132,108 L126,48 L176,82Z" fill="${C.base}" stroke="${C.line}" stroke-width="2" stroke-linejoin="round"/><path d="M138,98 L134,62 L164,84Z" fill="${PAL.pink.base}"/>`;
    return { hair: ear + mirror(ear) + bow(250, 96, 0.45, PAL.pink, null, { tails: false }) };
  };
  PARTS.beret = (C, g) => ({
    defs: rg(g + 'h', [[0, C.light], [1, C.base]], 0.4, 0.3, 0.8),
    hair: `<ellipse cx="222" cy="94" rx="80" ry="30" fill="url(#${g}h)" stroke="${C.line}" stroke-width="2" transform="rotate(12 222 94)"/>` +
      `<path d="M224,64 l2,-12" stroke="${C.line}" stroke-width="4" stroke-linecap="round"/>` + heart(268, 104, 7, "#fff") + star(188, 92, 5, "#fff"),
  });
  PARTS.heartclips = (C, g) => ({
    hair: heart(130, 132, 11, C.base, C.line, 2) + heart(146, 112, 8, '#fff', C.line, 1.6) + mirror(heart(130, 132, 11, C.base, C.line, 2) + heart(146, 112, 8, '#fff', C.line, 1.6)) + sparkle(124, 126, 2.5),
  });
  PARTS.crown = (C, g) => ({
    defs: lg(g + 'h', [[0, GOLD.light], [1, GOLD.dark]]),
    hair: `<g transform="rotate(-10 200 80)"><path d="M160,96 L156,52 L180,72 L200,42 L220,72 L244,52 L240,96Z" fill="url(#${g}h)" stroke="${GOLD.line}" stroke-width="2" stroke-linejoin="round"/>` +
      `<rect x="158" y="88" width="84" height="12" rx="4" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="1.6"/>` +
      `<circle cx="200" cy="74" r="6" fill="${C.base}" stroke="${C.line}" stroke-width="1.4"/><circle cx="174" cy="94" r="3.5" fill="${PAL.pink.base}"/><circle cx="226" cy="94" r="3.5" fill="${PAL.pink.base}"/>` +
      `<circle cx="156" cy="50" r="4" fill="${GOLD.light}" stroke="${GOLD.line}"/><circle cx="200" cy="40" r="4" fill="${GOLD.light}" stroke="${GOLD.line}"/><circle cx="244" cy="50" r="4" fill="${GOLD.light}" stroke="${GOLD.line}"/></g>` + sparkle(258, 56, 6),
  });
  PARTS.ribbonband = (C, g) => ({
    defs: lg(g + 'h', [[0, C.light], [0.5, C.base], [1, C.dark]]),
    hair: `<path d="M118,128 Q200,48 282,128" fill="none" stroke="${C.dark}" stroke-width="9" stroke-linecap="round"/><path d="M118,128 Q200,48 282,128" fill="none" stroke="${C.base}" stroke-width="5" stroke-linecap="round"/>` + bow(250, 82, 1.0, C, g + 'h', { tails: false }),
  });

  // ---------- むねの かざり ----------
  PARTS.pearls = (C, g) => {
    let o = '';
    for (let i = 0; i <= 12; i++) {
      const t = i / 12, x = 174 + t * 52, y = 288 + Math.sin(t * Math.PI) * 22;
      o += `<circle cx="${x}" cy="${y}" r="3.6" fill="#fff" stroke="#C9B8E6" stroke-width="1.1"/>`;
    }
    return { ribbon: o + heart(200, 322, 8, PAL.pink.base, PAL.pink.line) + sparkle(197, 318, 2.4) };
  };
  PARTS.scarf = (C, g) => ({
    ribbon: `<path d="M180,288 Q200,300 220,288 L218,296 Q200,306 182,296Z" fill="${C.base}" stroke="${C.line}" stroke-width="1.6"/>` +
      `<path d="M192,298 L176,312 L186,316 L194,304Z M208,298 L224,312 L214,316 L206,304Z" fill="${C.base}" stroke="${C.line}" stroke-width="1.6"/>` +
      `<path d="M196,302 L190,334 L200,328 L210,334 L204,302Z" fill="${C.mid}" stroke="${C.line}" stroke-width="1.6"/>` +
      `<circle cx="200" cy="300" r="5" fill="${C.dark}" stroke="${C.line}" stroke-width="1.4"/>`,
  });
  PARTS.choker = (C, g) => ({
    ribbon: `<path d="M187,272 Q200,278 213,272" fill="none" stroke="${C.dark}" stroke-width="5" stroke-linecap="round"/>` +
      `<path d="M200,276 l7,9 l-7,9 l-7,-9Z" fill="${C.base}" stroke="${C.line}" stroke-width="1.4"/>` + sparkle(198, 282, 2.4) + bow(200, 300, 0.55, C, null),
  });

  // ---------- まほうの アイテム ----------
  const stick = (C, len = 90, col = '#fff') => `<path d="M-4,14 L-3,-${len} L3,-${len} L4,14Z" fill="${col}" stroke="${C.line}" stroke-width="1.8"/>`;
  PARTS.crystalwand = (C, g) => ({
    defs: lg(g + 'm', [[0, '#FFFFFF'], [0.5, '#D9E6FF'], [1, C.base]], 0, 0, 1, 1),
    magic: stick(C, 86, C.light) +
      `<g transform="translate(0 -112)"><path d="M0,-30 L18,-6 L10,24 L-10,24 L-18,-6Z" fill="url(#${g}m)" stroke="${C.line}" stroke-width="2" stroke-linejoin="round"/>` +
      `<path d="M0,-30 L4,-6 L0,24 M-18,-6 L4,-6 L18,-6 M-10,24 L4,-6 L10,24" fill="none" stroke="#fff" stroke-width="1.4" opacity=".9"/>${sparkle(22, -26, 7)}${sparkle(-24, 14, 5)}</g>` +
      `<path d="M-12,-84 Q0,-94 12,-84" fill="none" stroke="${GOLD.base}" stroke-width="5" stroke-linecap="round"/>`,
  });
  PARTS.flowerwand = (C, g) => {
    let f = '';
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; f += `<ellipse cx="${Math.cos(a) * 15}" cy="${Math.sin(a) * 15}" rx="11" ry="8" fill="${C.base}" stroke="${C.line}" stroke-width="1.6" transform="rotate(${i * 60} ${Math.cos(a) * 15} ${Math.sin(a) * 15})"/>`; }
    return {
      magic: stick(PAL.mint, 84, '#9EDDC8') +
        `<path d="M0,-50 q-20,-6 -24,-22 q16,2 24,18Z" fill="#9EDDC8" stroke="#4C9C82" stroke-width="1.4"/>` +
        `<g transform="translate(0 -104)">${f}<circle r="9" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="1.6"/>${sparkle(26, -22, 6)}</g>`,
    };
  };
  PARTS.ribbonwand = (C, g) => ({
    magic: stick(C, 96, '#fff') + star(0, -108, 13, GOLD.base, GOLD.line, 1.8) +
      `<path d="M0,-96 C40,-80 -36,-60 18,-40 C60,-24 -20,-10 30,6" fill="none" stroke="${C.base}" stroke-width="8" stroke-linecap="round"/>` +
      `<path d="M0,-96 C40,-80 -36,-60 18,-40 C60,-24 -20,-10 30,6" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".7"/>`,
  });
  PARTS.parasol = (C, g) => ({
    defs: lg(g + 'm', [[0, C.light], [1, C.base]]),
    magic: `<path d="M-2,14 L-2,-110 L2,-110 L2,14 Q2,24 -8,22" fill="#fff" stroke="${C.line}" stroke-width="1.8"/>` +
      `<path d="M-64,-96 Q0,-160 64,-96 Q48,-88 32,-96 Q16,-88 0,-96 Q-16,-88 -32,-96 Q-48,-88 -64,-96Z" fill="url(#${g}m)" stroke="${C.line}" stroke-width="2"/>` +
      lace(-64, 64, -96, 5, '#fff', C.line, 0) + `<path d="M0,-150 L0,-96 M-32,-140 Q-20,-110 -32,-96 M32,-140 Q20,-110 32,-96" fill="none" stroke="${C.dark}" stroke-width="1.4" opacity=".5"/>` +
      `<circle cy="-150" r="5" fill="${GOLD.base}"/>` + heart(-30, -116, 6, '#fff') + heart(30, -116, 6, '#fff'),
  });
  PARTS.mic = (C, g) => ({
    magic: `<path d="M-5,14 L-6,-56 L6,-56 L5,14Z" fill="${C.base}" stroke="${C.line}" stroke-width="1.8"/>` +
      `<circle cy="-72" r="20" fill="#E9EEF8" stroke="${C.line}" stroke-width="2"/><path d="M-16,-80 H16 M-18,-70 H18 M-14,-60 H14" stroke="#B9C4DA" stroke-width="2"/>` +
      `<path d="M-10,-50 L10,-50" stroke="${GOLD.base}" stroke-width="5" stroke-linecap="round"/>` + star(0, -50, 7, GOLD.base, GOLD.line, 1) + sparkle(22, -96, 7) + bow(0, -40, 0.4, PAL.pink, null),
  });
  PARTS.compact = (C, g) => ({
    defs: rg(g + 'm', [[0, '#fff'], [1, '#D9E6FF']]),
    magic: `<g transform="translate(0 -36)"><circle r="30" fill="${C.base}" stroke="${C.line}" stroke-width="2.4"/>` +
      `<circle r="22" fill="url(#${g}m)" stroke="${GOLD.line}" stroke-width="2"/>` + heart(0, 2, 12, C.mid, C.line) + sparkle(-10, -10, 4) + `</g>` +
      `<path d="M-6,0 L6,0 L4,14 L-4,14Z" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="1.4"/>`,
  });

  // ---------- かぐ ----------
  F_add();
  function F_add() {
    FURN.vanity = {
      w: 220, h: 270, draw: (C, id) =>
        `<defs>${lg(id + 'g', [[0, '#EAF6FF'], [0.5, '#FFFFFF'], [1, '#D6E6FA']], 0, 0, 1, 1)}</defs>` +
        `<path d="M40,130 L40,40 A70,70 0 0,1 180,40 L180,130Z" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="3" transform="translate(0 6)"/>` +
        `<path d="M52,132 L52,46 A58,58 0 0,1 168,46 L168,132Z" fill="url(#${id}g)" stroke="${GOLD.line}" stroke-width="2"/>` +
        `<path d="M78,70 L100,48 M74,96 L116,54" stroke="#fff" stroke-width="7" stroke-linecap="round"/>` +
        `<rect x="6" y="140" width="208" height="26" rx="10" fill="${C.mid}" stroke="${C.line}" stroke-width="2.6"/>` +
        `<path d="M14,166 L206,166 L200,250 L20,250Z" fill="${C.base}" stroke="${C.line}" stroke-width="2.6"/>` +
        KP.lace(14, 206, 166, 8, '#fff', C.line, 6) +
        `<rect x="40" y="190" width="60" height="40" rx="6" fill="${C.light}" stroke="${C.line}" stroke-width="2"/><rect x="120" y="190" width="60" height="40" rx="6" fill="${C.light}" stroke="${C.line}" stroke-width="2"/>` +
        heart(70, 210, 6, C.dark) + heart(150, 210, 6, C.dark) +
        `<rect x="24" y="248" width="14" height="20" rx="4" fill="${C.dark}"/><rect x="182" y="248" width="14" height="20" rx="4" fill="${C.dark}"/>` +
        // こすめ
        `<path d="M22,140 L22,118 Q30,108 38,118 L38,140Z" fill="#FFD3E6" stroke="#C9668F" stroke-width="1.6"/><circle cx="30" cy="110" r="5" fill="${GOLD.base}"/>` +
        `<rect x="186" y="122" width="16" height="18" rx="4" fill="#BDEBDC" stroke="#4C9C82" stroke-width="1.4"/>` + bow(110, 16, 0.6, PAL.pink, null, { tails: false }),
    };
    FURN.chandelier = {
      w: 220, h: 200, wall: true, draw: (C, id) => {
        let o = `<defs>${rg(id + 'g', [[0, '#FFF6CF', 0.8], [1, '#FFF6CF', 0]])}</defs><ellipse cx="110" cy="120" rx="110" ry="80" fill="url(#${id}g)"/>`;
        o += `<path d="M110,0 L110,40" stroke="${GOLD.line}" stroke-width="3"/>`;
        o += `<path d="M30,96 Q110,150 190,96" fill="none" stroke="${GOLD.base}" stroke-width="7"/><path d="M60,70 Q110,104 160,70" fill="none" stroke="${GOLD.base}" stroke-width="6"/>`;
        o += `<path d="M110,40 L30,96 M110,40 L190,96 M110,40 L60,70 M110,40 L160,70" stroke="${GOLD.line}" stroke-width="2"/>`;
        [[30, 96], [70, 118], [110, 124], [150, 118], [190, 96], [60, 70], [160, 70]].forEach(([x, y], i) => {
          o += `<path d="M${x},${y} L${x},${y + 22}" stroke="${GOLD.line}" stroke-width="1.4"/><path d="M${x},${y + 22} l7,10 l-7,12 l-7,-12Z" fill="#fff" stroke="${C.line}" stroke-width="1.4"/>`;
          o += `<rect x="${x - 5}" y="${y - 22}" width="10" height="18" rx="3" fill="#fff" stroke="${C.line}" stroke-width="1.2"/><path d="M${x},${y - 34} q5,6 0,10 q-5,-4 0,-10Z" fill="#FFB347"/>`;
        });
        return o + `<circle cx="110" cy="40" r="10" fill="${C.base}" stroke="${C.line}" stroke-width="2"/>` + sparkle(110, 150, 8);
      },
    };
    FURN.piano = {
      w: 240, h: 210, draw: (C, id) =>
        `<rect x="14" y="30" width="212" height="120" rx="16" fill="${C.base}" stroke="${C.line}" stroke-width="3"/>` +
        `<rect x="30" y="44" width="180" height="40" rx="8" fill="${C.light}" stroke="${C.line}" stroke-width="2"/>` +
        `<path d="M60,64 l6,-12 l2,16 M150,58 l6,-10 l2,14" fill="none" stroke="${C.dark}" stroke-width="2.4" stroke-linecap="round"/><circle cx="60" cy="66" r="4" fill="${C.dark}"/><circle cx="150" cy="60" r="4" fill="${C.dark}"/>` +
        `<rect x="10" y="100" width="220" height="34" rx="4" fill="#fff" stroke="${C.line}" stroke-width="2.4"/>` +
        Array.from({ length: 12 }, (_, i) => `<path d="M${10 + (i + 1) * 18.3},100 V134" stroke="#D9CBF2" stroke-width="1.6"/>`).join('') +
        Array.from({ length: 11 }, (_, i) => ([2, 6, 9].includes(i) ? '' : `<rect x="${22 + i * 18.3}" y="100" width="10" height="20" rx="2" fill="#5A4A7A"/>`)).join('') +
        `<rect x="22" y="150" width="16" height="56" rx="6" fill="${C.dark}"/><rect x="202" y="150" width="16" height="56" rx="6" fill="${C.dark}"/>` +
        heart(120, 22, 12, PAL.pink.base, PAL.pink.line) + `<rect x="80" y="160" width="80" height="20" rx="8" fill="${C.mid}" stroke="${C.line}" stroke-width="2"/>`,
    };
    FURN.unicorn = {
      w: 230, h: 210, draw: (C, id) =>
        `<path d="M10,180 Q115,230 220,180" fill="none" stroke="${C.dark}" stroke-width="12" stroke-linecap="round"/>` +
        `<path d="M50,182 L60,130 M180,182 L170,130" stroke="#fff" stroke-width="12" stroke-linecap="round"/><path d="M50,182 L60,130 M180,182 L170,130" stroke="${C.line}" stroke-width="2" stroke-linecap="round" opacity=".4"/>` +
        `<ellipse cx="115" cy="120" rx="76" ry="36" fill="#fff" stroke="${C.line}" stroke-width="2.6"/>` +
        `<path d="M44,118 C10,110 10,160 30,170 C30,150 40,140 50,132Z" fill="${C.base}" stroke="${C.line}" stroke-width="2"/>` +
        `<path d="M160,100 L176,40 Q196,20 214,36 L220,64 Q208,74 196,66 L186,112Z" fill="#fff" stroke="${C.line}" stroke-width="2.6"/>` +
        `<path d="M196,30 L206,0 L212,32Z" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="1.6"/>` +
        `<path d="M176,40 C150,40 140,70 150,100 C160,80 168,70 180,64 C176,80 180,96 188,104Z" fill="${C.base}" stroke="${C.line}" stroke-width="2"/>` +
        `<circle cx="204" cy="48" r="3.6" fill="#4A2A63"/><ellipse cx="208" cy="58" rx="5" ry="3" fill="#FF9DB8" opacity=".6"/>` +
        `<path d="M90,100 Q110,90 130,100 L128,116 Q110,108 92,116Z" fill="${C.light}" stroke="${C.line}" stroke-width="1.6"/>` + heart(110, 128, 8, C.base),
    };
    FURN.balloons = {
      w: 160, h: 280, draw: (C, id) => {
        const b = (x, y, c, d) => `<path d="M${x},${y + 36} Q${x - 6},${y + 80} 80,250" fill="none" stroke="#B3A5CF" stroke-width="2"/><ellipse cx="${x}" cy="${y}" rx="30" ry="36" fill="${c}" stroke="${d}" stroke-width="2.4"/><ellipse cx="${x - 10}" cy="${y - 14}" rx="7" ry="11" fill="#fff" opacity=".6"/>`;
        return b(40, 70, '#F8BCD6', '#E07AA8') + b(118, 64, '#BCD4FA', '#6F98E2') + b(80, 40, C.base, C.line) + b(60, 120, '#FFE59A', '#E9B44C') + b(104, 126, '#BDEBDC', '#6FC3A8') +
          `<path d="M70,246 L90,246 L84,276 L76,276Z" fill="${C.dark}"/>` + bow(80, 244, 0.6, PAL.pink, null);
      },
    };
    FURN.pouf = {
      w: 130, h: 90, draw: (C, id) =>
        `<defs>${rg(id + 'a', [[0, '#fff'], [1, C.base]], 0.4, 0.3, 0.8)}</defs>` +
        `<path d="M8,40 Q8,84 65,86 Q122,84 122,40Z" fill="${C.mid}" stroke="${C.line}" stroke-width="2.6"/>` +
        `<ellipse cx="65" cy="38" rx="58" ry="26" fill="url(#${id}a)" stroke="${C.line}" stroke-width="2.6"/>` + KP.lace(8, 122, 46, 6, '#fff', C.line, 14) +
        `<circle cx="65" cy="36" r="5" fill="${C.dark}"/>`,
    };
    FURN.dollhouse = {
      w: 200, h: 230, draw: (C, id) =>
        `<rect x="22" y="90" width="156" height="136" rx="8" fill="#fff" stroke="${C.line}" stroke-width="2.6"/>` +
        `<path d="M8,96 L100,14 L192,96Z" fill="${C.base}" stroke="${C.line}" stroke-width="2.6" stroke-linejoin="round"/>` +
        heart(100, 66, 12, '#fff') +
        `<rect x="40" y="110" width="50" height="44" rx="6" fill="#EAF6FF" stroke="${C.line}" stroke-width="2"/><rect x="110" y="110" width="50" height="44" rx="6" fill="#EAF6FF" stroke="${C.line}" stroke-width="2"/>` +
        `<path d="M65,110 V154 M40,132 H90 M135,110 V154 M110,132 H160" stroke="#fff" stroke-width="3"/>` +
        `<path d="M84,226 L84,180 Q100,164 116,180 L116,226Z" fill="${C.dark}" stroke="${C.line}" stroke-width="2"/><circle cx="110" cy="204" r="3" fill="${GOLD.base}"/>` +
        `<rect x="30" y="176" width="40" height="12" rx="6" fill="#F8BCD6"/><rect x="130" y="176" width="40" height="12" rx="6" fill="#F8BCD6"/>` +
        `<circle cx="38" cy="172" r="5" fill="#E0465E"/><circle cx="56" cy="170" r="5" fill="#FFE59A"/><circle cx="146" cy="170" r="5" fill="#C9B5F5"/>`,
    };
    FURN.garland = {
      w: 320, h: 100, wall: true, draw: (C, id) => {
        let o = `<path d="M6,14 Q160,90 314,14" fill="none" stroke="#9EDDC8" stroke-width="3"/>`;
        for (let i = 0; i < 9; i++) {
          const t = (i + 0.5) / 9, x = 6 + t * 308, y = 14 + Math.sin(t * Math.PI) * 38;
          const cs = [C, PAL.pink, PAL.yellow, PAL.mint, PAL.blue][i % 5];
          o += `<circle cx="${x}" cy="${y + 16}" r="12" fill="${cs.base}" opacity=".45"/>` + (i % 2 ? heart(x, y + 14, 8, cs.base, cs.line, 1.4) : star(x, y + 14, 9, cs.base, cs.line, 1.4));
        }
        return o;
      },
    };
    FURN.cakestand = {
      w: 140, h: 210, draw: (C, id) =>
        `<path d="M66,30 V196" stroke="${GOLD.line}" stroke-width="4"/>` +
        `<ellipse cx="70" cy="196" rx="44" ry="10" fill="#fff" stroke="${C.line}" stroke-width="2.4"/>` +
        `<ellipse cx="70" cy="140" rx="62" ry="12" fill="#fff" stroke="${C.line}" stroke-width="2.4"/>` +
        `<ellipse cx="70" cy="84" rx="46" ry="10" fill="#fff" stroke="${C.line}" stroke-width="2.4"/>` +
        // おかし
        `<path d="M22,140 Q22,118 36,116 Q50,118 50,140Z" fill="#FFD3E6" stroke="#C9668F" stroke-width="1.6"/><circle cx="36" cy="112" r="5" fill="#E0465E"/>` +
        `<path d="M86,140 Q86,118 100,116 Q114,118 114,140Z" fill="${C.base}" stroke="${C.line}" stroke-width="1.6"/><circle cx="100" cy="112" r="5" fill="#E0465E"/>` +
        `<ellipse cx="56" cy="78" rx="12" ry="6" fill="#C9B5F5" stroke="#8C6FD6" stroke-width="1.4"/><ellipse cx="86" cy="78" rx="12" ry="6" fill="#BDEBDC" stroke="#4C9C82" stroke-width="1.4"/>` +
        star(70, 22, 12, GOLD.base, GOLD.line, 1.8) + heart(66, 190, 6, '#F8BCD6'),
    };
    FURN.heartlamp = {
      w: 110, h: 150, draw: (C, id) =>
        `<defs>${rg(id + 'g', [[0, '#FFF6CF', 0.9], [1, '#FFF6CF', 0]])}</defs><circle cx="55" cy="56" r="56" fill="url(#${id}g)"/>` +
        heart(55, 60, 36, C.base, C.line, 3) + `<ellipse cx="42" cy="44" rx="8" ry="6" fill="#fff" opacity=".7"/>` +
        `<path d="M48,92 L62,92 L66,136 L44,136Z" fill="#fff" stroke="${C.line}" stroke-width="2"/><ellipse cx="55" cy="140" rx="30" ry="8" fill="${C.mid}" stroke="${C.line}" stroke-width="2.2"/>`,
    };
    FURN.flowervase = {
      w: 110, h: 170, draw: (C, id) => {
        const fl = (x, y, col) => [0, 1, 2, 3, 4].map((i) => { const a = i * 1.2566 - 1.57; return `<circle cx="${x + Math.cos(a) * 9}" cy="${y + Math.sin(a) * 9}" r="7" fill="${col.base}" stroke="${col.line}" stroke-width="1.2"/>`; }).join('') + `<circle cx="${x}" cy="${y}" r="5" fill="${GOLD.base}"/>`;
        return `<path d="M55,96 L30,40 M55,96 L55,26 M55,96 L82,44" stroke="#6FC3A8" stroke-width="3"/>` + fl(30, 40, PAL.pink) + fl(55, 24, C) + fl(82, 44, PAL.yellow) +
          `<path d="M34,90 L76,90 Q86,120 72,164 L38,164 Q24,120 34,90Z" fill="#EAF6FF" stroke="#8CB4E8" stroke-width="2.4" opacity=".95"/>` +
          `<path d="M44,104 Q40,130 46,150" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>` + bow(55, 100, 0.4, C, null, { tails: false });
      },
    };
    FURN.rainbow = {
      w: 240, h: 140, wall: true, draw: (C, id) => {
        const cols = ['#F8BCD6', '#FFE59A', '#BDEBDC', '#BCD4FA', '#C9B5F5'];
        let o = '';
        cols.forEach((c, i) => (o += `<path d="M${20 + i * 14},120 A${100 - i * 14},${100 - i * 14} 0 0,1 ${220 - i * 14},120" fill="none" stroke="${c}" stroke-width="14"/>`));
        o += `<ellipse cx="34" cy="120" rx="34" ry="18" fill="#fff" stroke="#DCD0F0" stroke-width="2"/><ellipse cx="206" cy="120" rx="34" ry="18" fill="#fff" stroke="#DCD0F0" stroke-width="2"/>`;
        return o + sparkle(120, 34, 8, GOLD.base);
      },
    };
  }

  // ---------- かべがみ・ゆか ----------
  KP.WALLS.clouds = { name: 'くも', draw: (id, W = 1000) => `<defs><pattern id="${id}w" width="160" height="120" patternUnits="userSpaceOnUse"><rect width="160" height="120" fill="#E3F0FF"/><ellipse cx="40" cy="40" rx="26" ry="12" fill="#fff"/><ellipse cx="52" cy="34" rx="16" ry="12" fill="#fff"/><ellipse cx="120" cy="96" rx="22" ry="10" fill="#fff"/>${KP.sparkle(120, 30, 5, '#FFF1B8')}</pattern></defs><rect width="${W}" height="640" fill="url(#${id}w)"/>` };
  KP.WALLS.bunny = { name: 'うさぎ', draw: (id, W = 1000) => `<defs><pattern id="${id}w" width="110" height="110" patternUnits="userSpaceOnUse"><rect width="110" height="110" fill="#FFF3F8"/><g transform="translate(18 14) scale(0.18)" opacity=".55">${KP.drawBunny('happy')}</g>${heart(84, 84, 7, '#FFD6E7')}</pattern></defs><rect width="${W}" height="640" fill="url(#${id}w)"/>` };
  KP.FLOORS.heart = { name: 'ハート', draw: (id, W = 1000, Hf = 360) => `<defs><pattern id="${id}p" width="90" height="90" patternUnits="userSpaceOnUse"><rect width="90" height="90" fill="#F6EEFF"/>${heart(22, 24, 8, '#E6DBFF')}${heart(67, 68, 8, '#FFD9E8')}</pattern></defs><rect y="640" width="${W}" height="${Hf}" fill="url(#${id}p)"/>` };
  KP.FLOORS.star = { name: 'ほし', draw: (id, W = 1000, Hf = 360) => `<defs><linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5A5FA8"/><stop offset="1" stop-color="#3A3D7C"/></linearGradient><pattern id="${id}p" width="100" height="100" patternUnits="userSpaceOnUse">${star(25, 30, 6, '#FFE59A')}${KP.sparkle(75, 70, 5, '#fff')}</pattern></defs><rect y="640" width="${W}" height="${Hf}" fill="url(#${id}f)"/><rect y="640" width="${W}" height="${Hf}" fill="url(#${id}p)"/>` };
})();

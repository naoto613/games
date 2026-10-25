// ぴょんた・かぐ・はいけいの え（SVG）
(function () {
  const KP = window.KP;
  const { PAL, GOLD, lg, rg, star, heart, sparkle, bow, mirror, uid } = KP;

  // ---- ぴょんた（200×220） ----
  // expr: normal / happy / surprise / notify / sleep
  KP.drawBunny = function (expr = 'normal', opt = {}) {
    const id = uid('b');
    const L = '#B9A4E4';
    const ear = (inner) =>
      `<path d="M78,70 C58,20 62,-20 82,-22 C104,-22 106,26 98,72Z" fill="#fff" stroke="${L}" stroke-width="2.4"/>` +
      `<path d="M82,62 C70,26 72,-6 83,-10 C95,-10 96,28 92,62Z" fill="url(#${id}e)"/>`;
    const earL = `<g transform="rotate(${expr === 'surprise' ? -4 : -12} 90 74)">${ear()}</g>`;
    const earR = expr === 'sleep'
      ? `<g transform="translate(200 0) scale(-1 1) rotate(-60 90 74)">${ear()}</g>`
      : `<g transform="translate(200 0) scale(-1 1) rotate(${expr === 'surprise' ? -4 : -12} 90 74)">${ear()}</g>`;
    let o = `<defs>${lg(id + 'e', [[0, '#C9B5F5'], [1, '#F8BCD6']])}${rg(id + 'b', [[0, '#FFFFFF'], [0.75, '#FBF8FF'], [1, '#E9E1FA']], 0.45, 0.35, 0.65)}${rg(id + 'k', [[0, '#FF9DB8', 0.8], [1, '#FF9DB8', 0]])}</defs>`;
    o += earL + earR;
    // からだ
    o += `<ellipse cx="100" cy="178" rx="50" ry="40" fill="url(#${id}b)" stroke="${L}" stroke-width="2.4"/>`;
    o += `<ellipse cx="66" cy="208" rx="18" ry="11" fill="#fff" stroke="${L}" stroke-width="2.2"/><ellipse cx="134" cy="208" rx="18" ry="11" fill="#fff" stroke="${L}" stroke-width="2.2"/>`;
    o += `<ellipse cx="62" cy="208" rx="6" ry="4" fill="#F8BCD6" opacity=".7"/><ellipse cx="138" cy="208" rx="6" ry="4" fill="#F8BCD6" opacity=".7"/>`;
    // て
    if (expr === 'happy' || expr === 'notify') {
      o += `<ellipse cx="52" cy="150" rx="12" ry="15" fill="#fff" stroke="${L}" stroke-width="2.2" transform="rotate(-30 52 150)"/>` +
        `<ellipse cx="148" cy="150" rx="12" ry="15" fill="#fff" stroke="${L}" stroke-width="2.2" transform="rotate(30 148 150)"/>`;
    } else {
      o += `<ellipse cx="74" cy="178" rx="12" ry="14" fill="#fff" stroke="${L}" stroke-width="2.2"/><ellipse cx="126" cy="178" rx="12" ry="14" fill="#fff" stroke="${L}" stroke-width="2.2"/>`;
    }
    // あたま
    o += `<ellipse cx="100" cy="110" rx="62" ry="54" fill="url(#${id}b)" stroke="${L}" stroke-width="2.4"/>`;
    o += `<path d="M84,62 C88,50 98,50 100,60 C102,48 114,50 116,62" fill="#fff" stroke="${L}" stroke-width="2"/>`;
    // かお
    const eyeN = (x) =>
      `<ellipse cx="${x}" cy="112" rx="10" ry="13" fill="url(#${id}i)"/><ellipse cx="${x}" cy="112" rx="10" ry="13" fill="none" stroke="#4A2A63" stroke-width="1.6"/>` +
      `<circle cx="${x - 3}" cy="106" r="4" fill="#fff"/><circle cx="${x + 4}" cy="118" r="1.8" fill="#fff"/>`;
    o = o.replace('</defs>', lg(id + 'i', [[0, '#4B2C7A'], [0.5, '#8E5BD0'], [1, '#E7BDF7']]) + '</defs>');
    if (expr === 'happy') {
      o += `<path d="M64,114 Q74,102 84,114 M116,114 Q126,102 136,114" fill="none" stroke="#4A2A63" stroke-width="3.6" stroke-linecap="round"/>`;
    } else if (expr === 'sleep') {
      o += `<path d="M64,112 Q74,120 84,112 M116,112 Q126,120 136,112" fill="none" stroke="#4A2A63" stroke-width="3.2" stroke-linecap="round"/>`;
    } else if (expr === 'surprise') {
      o += `<circle cx="74" cy="110" r="9" fill="#fff" stroke="#4A2A63" stroke-width="2"/><circle cx="74" cy="111" r="5" fill="#4A2A63"/><circle cx="126" cy="110" r="9" fill="#fff" stroke="#4A2A63" stroke-width="2"/><circle cx="126" cy="111" r="5" fill="#4A2A63"/>`;
    } else {
      o += eyeN(74) + eyeN(126);
    }
    o += `<ellipse cx="56" cy="128" rx="11" ry="7" fill="url(#${id}k)"/><ellipse cx="144" cy="128" rx="11" ry="7" fill="url(#${id}k)"/>`;
    o += `<path d="M96,124 Q100,128 104,124" fill="#F29CC2" stroke="#C9668F" stroke-width="1.4"/>`;
    if (expr === 'surprise') o += `<ellipse cx="100" cy="138" rx="5" ry="6" fill="#C2548A"/>`;
    else if (expr === 'happy' || expr === 'notify') o += `<path d="M90,132 Q100,148 110,132Z" fill="#C2548A" stroke="#8E2C52" stroke-width="1.4"/><path d="M95,139 Q100,136 105,139 Q102,144 100,144 Q98,144 95,139Z" fill="#FF9AB4"/>`;
    else o += `<path d="M92,132 q4,5 8,0 q4,5 8,0" fill="none" stroke="#8E2C52" stroke-width="1.8" stroke-linecap="round"/>`;
    // くびの リボン
    o += bow(100, 160, 0.62, PAL.pink, null);
    if (expr === 'notify') o += `<g class="kp-bang">${star(168, 54, 16, GOLD.base, GOLD.line, 2)}${sparkle(186, 30, 6, GOLD.base)}</g>`;
    if (expr === 'sleep') o += `<text x="150" y="60" font-size="26" fill="#9A7FDB" font-weight="800">z</text><text x="170" y="38" font-size="18" fill="#9A7FDB" font-weight="800">z</text>`;
    if (opt.hat) o += opt.hat;
    return o;
  };

  // ---- かぐ ----
  // それぞれ { w, h, ground(あしもとの たかさ y), draw(C, id) } ローカル ざひょうは 0..w, 0..h（あしもと = h）
  const F = {};
  KP.FURN = F;

  F.bed = {
    w: 300, h: 260, draw: (C, id) =>
      `<defs>${lg(id + 'a', [[0, C.light], [1, C.base]])}${lg(id + 'q', [[0, '#fff'], [1, C.light]])}</defs>` +
      // ヘッドボード（ハート）
      `<path d="M150,150 C60,110 20,40 70,14 C104,-4 140,16 150,40 C160,16 196,-4 230,14 C280,40 240,110 150,150Z" fill="url(#${id}a)" stroke="${C.line}" stroke-width="3"/>` +
      `<path d="M150,128 C84,98 56,48 86,32 C110,20 136,34 150,60 C164,34 190,20 214,32 C244,48 216,98 150,128Z" fill="none" stroke="#fff" stroke-width="4" opacity=".8"/>` +
      `<rect x="16" y="120" width="16" height="130" rx="8" fill="${C.mid}" stroke="${C.line}" stroke-width="2.5"/><rect x="268" y="120" width="16" height="130" rx="8" fill="${C.mid}" stroke="${C.line}" stroke-width="2.5"/>` +
      `<circle cx="24" cy="116" r="12" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="2"/><circle cx="276" cy="116" r="12" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="2"/>` +
      // マットレス
      `<rect x="24" y="150" width="252" height="70" rx="22" fill="#fff" stroke="${C.line}" stroke-width="2.5"/>` +
      // まくら
      `<rect x="54" y="132" width="86" height="40" rx="18" fill="url(#${id}q)" stroke="${C.line}" stroke-width="2.2"/><rect x="160" y="132" width="86" height="40" rx="18" fill="url(#${id}q)" stroke="${C.line}" stroke-width="2.2"/>` +
      // かけぶとん
      `<path d="M20,176 Q150,160 280,176 L284,226 Q150,244 16,226Z" fill="url(#${id}a)" stroke="${C.line}" stroke-width="2.5"/>` +
      KP.lace(16, 284, 226, 8, '#fff', C.line, 10) +
      heart(90, 200, 9, '#fff') + heart(150, 196, 9, '#fff') + heart(210, 200, 9, '#fff') +
      `<rect x="30" y="236" width="14" height="22" rx="4" fill="${C.dark}"/><rect x="256" y="236" width="14" height="22" rx="4" fill="${C.dark}"/>`,
  };
  F.sofa = {
    w: 260, h: 170, draw: (C, id) =>
      `<defs>${lg(id + 'a', [[0, C.light], [1, C.base]])}</defs>` +
      `<path d="M30,90 C26,20 80,6 130,26 C180,6 234,20 230,90Z" fill="url(#${id}a)" stroke="${C.line}" stroke-width="3"/>` +
      `<circle cx="80" cy="54" r="4" fill="${C.dark}"/><circle cx="130" cy="50" r="4" fill="${C.dark}"/><circle cx="180" cy="54" r="4" fill="${C.dark}"/>` +
      `<rect x="40" y="88" width="180" height="40" rx="16" fill="${C.base}" stroke="${C.line}" stroke-width="2.5"/>` +
      `<rect x="8" y="70" width="48" height="80" rx="24" fill="url(#${id}a)" stroke="${C.line}" stroke-width="3"/><rect x="204" y="70" width="48" height="80" rx="24" fill="url(#${id}a)" stroke="${C.line}" stroke-width="3"/>` +
      `<rect x="30" y="118" width="200" height="34" rx="12" fill="${C.mid}" stroke="${C.line}" stroke-width="2.5"/>` +
      `<path d="M24,152 l-4,16 h14 l4,-16Z M236,152 l4,16 h-14 l-4,-16Z" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="2"/>` +
      heart(130, 106, 9, '#fff', null),
  };
  F.mirror = {
    w: 150, h: 280, draw: (C, id) =>
      `<defs>${lg(id + 'g', [[0, '#EAF6FF'], [0.5, '#FFFFFF'], [1, '#D6E6FA']], 0, 0, 1, 1)}</defs>` +
      `<rect x="10" y="190" width="130" height="80" rx="10" fill="${C.base}" stroke="${C.line}" stroke-width="3"/>` +
      `<rect x="20" y="214" width="110" height="10" rx="5" fill="${C.light}"/><circle cx="75" cy="244" r="6" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="1.5"/>` +
      `<ellipse cx="75" cy="100" rx="62" ry="86" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="3"/>` +
      `<ellipse cx="75" cy="100" rx="50" ry="74" fill="url(#${id}g)" stroke="${GOLD.line}" stroke-width="2"/>` +
      `<path d="M48,60 L70,40 M44,86 L84,46" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".9"/>` +
      bow(75, 18, 0.7, PAL.pink, null, { tails: false }) + star(30, 160, 8, '#fff') + star(122, 40, 7, '#fff'),
  };
  F.closet = {
    w: 190, h: 300, draw: (C, id) =>
      `<defs>${lg(id + 'a', [[0, C.light], [1, C.base]])}</defs>` +
      `<path d="M10,60 Q95,-10 180,60 L180,286 L10,286Z" fill="url(#${id}a)" stroke="${C.line}" stroke-width="3"/>` +
      `<path d="M28,74 Q60,34 92,40 L92,240 L28,240Z M98,40 Q130,34 162,74 L162,240 L98,240Z" fill="#fff" stroke="${C.line}" stroke-width="2.5" opacity=".9"/>` +
      `<path d="M40,90 Q60,62 84,58 L84,228 L40,228Z M106,58 Q130,62 150,90 L150,228 L106,228Z" fill="${C.light}" opacity=".7"/>` +
      `<circle cx="84" cy="150" r="6" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="1.6"/><circle cx="106" cy="150" r="6" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="1.6"/>` +
      `<rect x="28" y="250" width="134" height="28" rx="8" fill="${C.mid}" stroke="${C.line}" stroke-width="2"/><circle cx="95" cy="264" r="5" fill="${GOLD.base}"/>` +
      heart(95, 24, 12, PAL.pink.base, PAL.pink.line) + `<rect x="14" y="286" width="16" height="12" rx="3" fill="${C.dark}"/><rect x="160" y="286" width="16" height="12" rx="3" fill="${C.dark}"/>`,
  };
  F.rug = {
    w: 320, h: 110, flat: true, draw: (C, id) =>
      `<defs>${rg(id + 'a', [[0, '#fff'], [0.6, C.light], [1, C.base]])}</defs>` +
      `<ellipse cx="160" cy="55" rx="156" ry="50" fill="url(#${id}a)" stroke="${C.line}" stroke-width="3"/>` +
      `<ellipse cx="160" cy="55" rx="128" ry="38" fill="none" stroke="${C.mid}" stroke-width="4" stroke-dasharray="2 10" stroke-linecap="round"/>` +
      heart(160, 54, 14, C.mid, null) + star(90, 56, 8, '#fff') + star(230, 56, 8, '#fff'),
  };
  F.light = {
    w: 110, h: 260, draw: (C, id) =>
      `<defs>${rg(id + 'g', [[0, '#FFF6CF', 0.9], [1, '#FFF6CF', 0]])}${lg(id + 'a', [[0, C.light], [1, C.base]])}</defs>` +
      `<circle cx="55" cy="60" r="56" fill="url(#${id}g)"/>` +
      `<path d="M52,100 L52,244 L58,244 L58,100Z" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="1.6"/>` +
      `<ellipse cx="55" cy="248" rx="34" ry="10" fill="${C.mid}" stroke="${C.line}" stroke-width="2.4"/>` +
      `<path d="M24,100 Q20,60 34,30 Q55,22 76,30 Q90,60 86,100Z" fill="url(#${id}a)" stroke="${C.line}" stroke-width="2.6"/>` +
      KP.lace(22, 88, 100, 5, '#fff', C.line, 2) + `<path d="M40,40 Q36,60 38,86" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7" fill="none"/>`,
  };
  F.shelf = {
    w: 200, h: 250, draw: (C, id) =>
      `<rect x="8" y="10" width="184" height="236" rx="14" fill="${C.base}" stroke="${C.line}" stroke-width="3"/>` +
      `<rect x="20" y="22" width="160" height="62" rx="6" fill="${C.light}"/><rect x="20" y="94" width="160" height="62" rx="6" fill="${C.light}"/><rect x="20" y="166" width="160" height="66" rx="6" fill="${C.light}"/>` +
      // ほん
      [['#F8BCD6', 30], ['#BCD4FA', 44], ['#FFE59A', 58], ['#BDEBDC', 72], ['#C9B5F5', 86]].map(([c, x], i) => `<rect x="${x}" y="${38 + (i % 2) * 6}" width="12" height="${46 - (i % 2) * 6}" rx="2" fill="${c}" stroke="#9A86C8" stroke-width="1.4"/>`).join('') +
      `<circle cx="146" cy="66" r="16" fill="#fff" stroke="#C9B8E6" stroke-width="2"/>` + heart(146, 66, 8, PAL.pink.base) +
      // ぬいぐるみ・びん
      `<path d="M40,156 Q36,120 54,118 Q72,120 68,156Z" fill="#BFE3FF" stroke="#8CB4E8" stroke-width="2" opacity=".9"/>` + star(54, 138, 6, GOLD.base) +
      `<rect x="100" y="126" width="56" height="30" rx="6" fill="${PAL.pink.base}" stroke="${PAL.pink.line}" stroke-width="2"/>` + bow(128, 126, 0.4, PAL.lav, null, { tails: false }) +
      `<circle cx="60" cy="210" r="18" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="2"/>` + star(60, 210, 9, '#fff') +
      `<path d="M110,232 L110,196 Q130,180 150,196 L150,232Z" fill="${PAL.mint.base}" stroke="${PAL.mint.line}" stroke-width="2"/>`,
  };
  F.plush = {
    w: 130, h: 140, draw: (C, id) => `<g transform="translate(5 16) scale(0.6)">${KP.drawBunny('happy')}</g>`.replace(/#F8BCD6/g, C.base),
  };
  F.bear = {
    w: 130, h: 140, draw: (C, id) =>
      `<circle cx="34" cy="30" r="18" fill="${C.base}" stroke="${C.line}" stroke-width="2.4"/><circle cx="96" cy="30" r="18" fill="${C.base}" stroke="${C.line}" stroke-width="2.4"/>` +
      `<circle cx="34" cy="30" r="9" fill="${C.light}"/><circle cx="96" cy="30" r="9" fill="${C.light}"/>` +
      `<ellipse cx="65" cy="110" rx="44" ry="30" fill="${C.base}" stroke="${C.line}" stroke-width="2.4"/>` +
      `<circle cx="65" cy="62" r="40" fill="${C.base}" stroke="${C.line}" stroke-width="2.4"/>` +
      `<ellipse cx="65" cy="76" rx="16" ry="12" fill="${C.light}"/><ellipse cx="65" cy="70" rx="5" ry="4" fill="#4A2A63"/>` +
      `<circle cx="50" cy="56" r="5" fill="#4A2A63"/><circle cx="80" cy="56" r="5" fill="#4A2A63"/><circle cx="48" cy="54" r="1.6" fill="#fff"/><circle cx="78" cy="54" r="1.6" fill="#fff"/>` +
      `<ellipse cx="38" cy="72" rx="7" ry="4" fill="#FF9DB8" opacity=".6"/><ellipse cx="92" cy="72" rx="7" ry="4" fill="#FF9DB8" opacity=".6"/>` +
      bow(65, 100, 0.5, PAL.pink, null, { tails: false }) +
      `<ellipse cx="34" cy="132" rx="14" ry="8" fill="${C.base}" stroke="${C.line}" stroke-width="2"/><ellipse cx="96" cy="132" rx="14" ry="8" fill="${C.base}" stroke="${C.line}" stroke-width="2"/>`,
  };
  F.plant = {
    w: 130, h: 220, draw: (C, id) => {
      let o = '';
      const leaves = [[65, 30, 0], [36, 70, -40], [94, 70, 40], [28, 112, -60], [102, 112, 60], [50, 50, -20], [80, 50, 20]];
      for (const [x, y, r] of leaves)
        o += `<g transform="rotate(${r} ${x} ${y + 30})"><path d="M${x},${y - 24} C${x + 22},${y} ${x + 16},${y + 30} ${x},${y + 40} C${x - 16},${y + 30} ${x - 22},${y} ${x},${y - 24}Z" fill="#9EDDC8" stroke="#4C9C82" stroke-width="2"/><path d="M${x},${y - 14} L${x},${y + 34}" stroke="#4C9C82" stroke-width="1.4" opacity=".6"/></g>`;
      o += `<circle cx="40" cy="40" r="6" fill="${PAL.pink.base}"/><circle cx="96" cy="88" r="6" fill="${PAL.pink.base}"/><circle cx="64" cy="18" r="6" fill="${GOLD.base}"/>`;
      o += `<path d="M28,140 L102,140 L92,214 Q65,222 38,214Z" fill="${C.base}" stroke="${C.line}" stroke-width="2.6"/>`;
      o += `<rect x="22" y="132" width="86" height="20" rx="8" fill="${C.mid}" stroke="${C.line}" stroke-width="2.4"/>` + heart(65, 180, 10, '#fff');
      return o;
    },
  };
  F.stardeco = {
    w: 240, h: 120, wall: true, draw: (C, id) => {
      let o = `<path d="M6,20 Q120,80 234,20" fill="none" stroke="${C.dark}" stroke-width="2.5"/>`;
      const pts = [[30, 40, GOLD], [75, 58, C], [120, 64, GOLD], [165, 58, C], [210, 40, GOLD]];
      pts.forEach(([x, y, c], i) => (o += `<path d="M${x},${y - 12} L${x},${y}" stroke="${C.dark}" stroke-width="1.6"/>` + star(x, y + 16, 18, c.base, c.line, 2)));
      return o + sparkle(52, 90, 6, GOLD.base) + sparkle(190, 96, 6, GOLD.base);
    },
  };
  F.cushion = {
    w: 120, h: 110, draw: (C, id) =>
      `<defs>${rg(id + 'a', [[0, '#fff'], [1, C.base]], 0.4, 0.35, 0.7)}</defs>` +
      heart(60, 56, 50, `url(#${id}a)`, C.line, 3) + KP.lace(26, 94, 98, 4, '#fff', C.line, 0).replace(/^/, '') + sparkle(42, 40, 7),
  };
  F.starlamp = {
    w: 120, h: 160, draw: (C, id) =>
      `<defs>${rg(id + 'g', [[0, '#FFF6CF', 0.95], [1, '#FFF6CF', 0]])}</defs><circle cx="60" cy="60" r="60" fill="url(#${id}g)"/>` +
      star(60, 64, 44, GOLD.base, GOLD.line, 3) + star(60, 64, 22, '#fff', null, 0, 0.5) +
      `<path d="M50,104 L70,104 L76,148 L44,148Z" fill="${C.base}" stroke="${C.line}" stroke-width="2.4"/><ellipse cx="60" cy="150" rx="32" ry="8" fill="${C.mid}" stroke="${C.line}" stroke-width="2.4"/>`,
  };
  F.teatable = {
    w: 220, h: 160, draw: (C, id) =>
      `<ellipse cx="110" cy="70" rx="100" ry="28" fill="#fff" stroke="${C.line}" stroke-width="3"/>` +
      KP.lace(14, 206, 74, 7, '#fff', C.line, 22) +
      `<path d="M96,100 L90,150 L130,150 L124,100Z" fill="${C.base}" stroke="${C.line}" stroke-width="2.4"/><ellipse cx="110" cy="152" rx="40" ry="8" fill="${C.mid}" stroke="${C.line}" stroke-width="2.4"/>` +
      // ティーセット
      `<path d="M86,40 Q84,66 106,68 Q128,66 126,40Z" fill="#fff" stroke="${C.line}" stroke-width="2"/><path d="M126,46 Q140,46 136,58 Q132,62 124,60" fill="none" stroke="${C.line}" stroke-width="2"/><path d="M86,46 Q72,40 70,30" fill="none" stroke="${C.line}" stroke-width="3"/><ellipse cx="106" cy="38" rx="20" ry="5" fill="${C.base}" stroke="${C.line}" stroke-width="2"/><circle cx="106" cy="30" r="5" fill="${GOLD.base}" stroke="${GOLD.line}"/>` +
      heart(106, 54, 6, C.base) +
      `<path d="M40,62 Q40,74 52,74 Q64,74 64,62Z" fill="#fff" stroke="${C.line}" stroke-width="2"/><path d="M156,62 Q156,74 168,74 Q180,74 180,62Z" fill="#fff" stroke="${C.line}" stroke-width="2"/>` +
      `<circle cx="150" cy="52" r="10" fill="${PAL.pink.base}" stroke="${PAL.pink.line}" stroke-width="1.6"/><circle cx="150" cy="44" r="4" fill="#E0465E"/>`,
  };
  F.musicbox = {
    w: 140, h: 150, draw: (C, id) =>
      `<rect x="10" y="80" width="120" height="66" rx="12" fill="${C.base}" stroke="${C.line}" stroke-width="3"/>` +
      `<rect x="4" y="68" width="132" height="22" rx="10" fill="${C.mid}" stroke="${C.line}" stroke-width="2.6"/>` +
      `<path d="M70,68 L70,40" stroke="${GOLD.line}" stroke-width="3"/><ellipse cx="70" cy="66" rx="30" ry="6" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="1.6"/>` +
      // まわる ひと
      `<circle cx="70" cy="22" r="9" fill="#FFEDE4" stroke="#D9A497" stroke-width="1.6"/><path d="M60,18 Q70,4 80,18" fill="#C7B0F2" stroke="#7458B8" stroke-width="1.4"/><path d="M70,30 L56,56 Q70,62 84,56Z" fill="${PAL.pink.base}" stroke="${PAL.pink.line}" stroke-width="1.6"/>` +
      heart(70, 114, 14, '#fff', C.line) + `<path d="M108,104 l6,-10 l2,14" fill="none" stroke="${C.dark}" stroke-width="2.4" stroke-linecap="round"/><circle cx="108" cy="106" r="4" fill="${C.dark}"/>`,
  };
  F.castle = {
    w: 160, h: 200, draw: (C, id) =>
      `<rect x="30" y="80" width="100" height="116" rx="6" fill="${C.light}" stroke="${C.line}" stroke-width="2.6"/>` +
      `<rect x="8" y="60" width="34" height="136" rx="4" fill="#fff" stroke="${C.line}" stroke-width="2.4"/><rect x="118" y="60" width="34" height="136" rx="4" fill="#fff" stroke="${C.line}" stroke-width="2.4"/>` +
      `<path d="M4,62 L25,18 L46,62Z M114,62 L135,18 L156,62Z" fill="${C.base}" stroke="${C.line}" stroke-width="2.4"/><path d="M46,82 L80,20 L114,82Z" fill="${C.mid}" stroke="${C.line}" stroke-width="2.4"/>` +
      `<path d="M62,196 L62,150 Q80,128 98,150 L98,196Z" fill="${C.dark}" stroke="${C.line}" stroke-width="2"/>` +
      heart(80, 108, 10, PAL.pink.base, PAL.pink.line) + star(25, 12, 6, GOLD.base) + star(135, 12, 6, GOLD.base) + star(80, 14, 7, GOLD.base),
  };

  // ---- へやの はいけい（1000×1000） ----
  const WALLS = {
    stripe: { name: 'ストライプ', draw: (id, W = 1000) => `<defs><pattern id="${id}w" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#F3ECFF"/><rect width="30" height="60" fill="#EADFFF"/></pattern></defs><rect width="${W}" height="640" fill="url(#${id}w)"/>` },
    dots: { name: 'みずたま', draw: (id, W = 1000) => `<defs><pattern id="${id}w" width="70" height="70" patternUnits="userSpaceOnUse"><rect width="70" height="70" fill="#FFF0F6"/><circle cx="17" cy="17" r="7" fill="#FFD6E7"/><circle cx="52" cy="52" r="7" fill="#FFD6E7"/></pattern></defs><rect width="${W}" height="640" fill="url(#${id}w)"/>` },
    stars: { name: 'ほしぞら', draw: (id, W = 1000) => `<defs><pattern id="${id}w" width="120" height="120" patternUnits="userSpaceOnUse"><rect width="120" height="120" fill="#E9F0FF"/>${star(30, 30, 9, '#FFF1B8')}${star(90, 84, 7, '#D7E3FF')}${sparkle(84, 24, 5, '#fff')}</pattern></defs><rect width="${W}" height="640" fill="url(#${id}w)"/>` },
    hearts: { name: 'ハート', draw: (id, W = 1000) => `<defs><pattern id="${id}w" width="90" height="90" patternUnits="userSpaceOnUse"><rect width="90" height="90" fill="#F2FBF7"/>${heart(22, 24, 9, '#CFEFE4')}${heart(67, 68, 9, '#FFD9E8')}</pattern></defs><rect width="${W}" height="640" fill="url(#${id}w)"/>` },
    lace: { name: 'クリーム', draw: (id, W = 1000) => `<defs><pattern id="${id}w" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="#FFF8EC"/><path d="M40,10 l6,30 l-6,30 l-6,-30Z" fill="#FBEBD2"/></pattern></defs><rect width="${W}" height="640" fill="url(#${id}w)"/>` },
  };
  const FLOORS = {
    wood: { name: 'もくめ', draw: (id, W = 1000, Hf = 360) => `<defs><linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5DEC8"/><stop offset="1" stop-color="#EBC9AA"/></linearGradient><pattern id="${id}p" width="200" height="60" patternUnits="userSpaceOnUse"><path d="M0,59 H200 M100,0 V30 M30,30 V60 M170,30 V60 M0,30 H200" stroke="#D9B08C" stroke-width="2" opacity=".55"/></pattern></defs><rect y="640" width="${W}" height="${Hf}" fill="url(#${id}f)"/><rect y="640" width="${W}" height="${Hf}" fill="url(#${id}p)"/>` },
    check: { name: 'チェック', draw: (id, W = 1000, Hf = 360) => `<defs><pattern id="${id}p" width="100" height="100" patternUnits="userSpaceOnUse"><rect width="100" height="100" fill="#FFE6F0"/><rect width="50" height="50" fill="#FFF6FA"/><rect x="50" y="50" width="50" height="50" fill="#FFF6FA"/></pattern></defs><rect y="640" width="${W}" height="${Hf}" fill="url(#${id}p)"/>` },
    carpet: { name: 'ふわふわ', draw: (id, W = 1000, Hf = 360) => `<defs><linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E4D8FB"/><stop offset="1" stop-color="#D2C2F4"/></linearGradient><pattern id="${id}p" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="10" cy="10" r="2" fill="#fff" opacity=".5"/><circle cx="30" cy="30" r="2" fill="#fff" opacity=".5"/></pattern></defs><rect y="640" width="${W}" height="${Hf}" fill="url(#${id}f)"/><rect y="640" width="${W}" height="${Hf}" fill="url(#${id}p)"/>` },
    mint: { name: 'ミント', draw: (id, W = 1000, Hf = 360) => `<defs><pattern id="${id}p" width="80" height="80" patternUnits="userSpaceOnUse"><rect width="80" height="80" fill="#DDF5EC"/><path d="M0,40 H80 M40,0 V80" stroke="#fff" stroke-width="3"/></pattern></defs><rect y="640" width="${W}" height="${Hf}" fill="url(#${id}p)"/>` },
  };
  KP.WALLS = WALLS;
  KP.FLOORS = FLOORS;

  // まど（かべの かざり）
  KP.drawWindow = function (x, y, w, h, night) {
    const id = uid('w');
    return `<g transform="translate(${x} ${y})"><defs>${lg(id + 's', night ? [[0, '#5A5FA8'], [1, '#B39CEE']] : [[0, '#BFE3FF'], [0.7, '#EAF6FF'], [1, '#FFE9F2']])}</defs>` +
      `<path d="M0,${h} L0,${w / 2} A${w / 2},${w / 2} 0 0,1 ${w},${w / 2} L${w},${h}Z" fill="url(#${id}s)" stroke="#fff" stroke-width="14"/>` +
      `<path d="M0,${h} L0,${w / 2} A${w / 2},${w / 2} 0 0,1 ${w},${w / 2} L${w},${h}Z" fill="none" stroke="#C9B8E6" stroke-width="3"/>` +
      // そとの けしき
      `<path d="M10,${h - 40} Q${w * 0.3},${h - 90} ${w * 0.55},${h - 50} Q${w * 0.8},${h - 100} ${w - 10},${h - 50} L${w - 10},${h - 8} L10,${h - 8}Z" fill="#CDEFD9" opacity=".9"/>` +
      `<g transform="translate(${w * 0.6} ${h - 150}) scale(0.5)">${F.castle.draw(PAL.lav, id + 'c')}</g>` +
      `<ellipse cx="${w * 0.3}" cy="${h * 0.35}" rx="30" ry="12" fill="#fff" opacity=".9"/><ellipse cx="${w * 0.36}" cy="${h * 0.32}" rx="20" ry="12" fill="#fff" opacity=".9"/>` +
      (night ? star(w * 0.25, h * 0.25, 8, '#FFF1B8') + star(w * 0.7, h * 0.18, 6, '#FFF1B8') : sparkle(w * 0.75, h * 0.25, 8, '#fff')) +
      `<path d="M${w / 2},6 V${h} M0,${h * 0.55} H${w}" stroke="#fff" stroke-width="8"/>` +
      `</g>`;
  };
  KP.drawCurtains = function (x, y, w, h, C = PAL.pink) {
    const id = uid('c');
    const half = `<path d="M${x - 30},${y - 20} Q${x + 30},${y + h * 0.4} ${x + 10},${y + h * 0.62} Q${x + 30},${y + h * 0.8} ${x - 10},${y + h + 10} L${x - 40},${y + h + 10} L${x - 40},${y - 20}Z" fill="url(#${id}c)" stroke="${C.line}" stroke-width="2.6"/>` +
      `<path d="M${x - 20},${y} Q${x + 10},${y + h * 0.4} ${x},${y + h * 0.6}" fill="none" stroke="#fff" stroke-width="3" opacity=".6"/>` +
      `<ellipse cx="${x + 8}" cy="${y + h * 0.62}" rx="14" ry="8" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="2"/>`;
    const mir = `<g transform="translate(${2 * x + w} 0) scale(-1 1)">${half}</g>`;
    return `<defs>${lg(id + 'c', [[0, C.light], [1, C.base]], 0, 0, 1, 0)}</defs>` + half + mir +
      `<path d="M${x - 50},${y - 30} Q${x + w / 2},${y + 10} ${x + w + 50},${y - 30} L${x + w + 50},${y - 50} L${x - 50},${y - 50}Z" fill="${C.base}" stroke="${C.line}" stroke-width="2.6"/>` +
      KP.lace(x - 50, x + w + 50, y - 30, 8, '#fff', C.line, 34);
  };

  KP.drawRoomBG = function (room, W = 1000, H = 1000) {
    const id = uid('r');
    let o = (WALLS[room.wallpaperId] || WALLS.stripe).draw(id, W);
    o += (FLOORS[room.floorId] || FLOORS.wood).draw(id, W, H - 640);
    o += `<rect y="620" width="${W}" height="26" fill="#fff" stroke="#E2D6F6" stroke-width="3"/>`;
    o += `<path d="M0,640 H${W}" stroke="#D9CBF2" stroke-width="4"/>`;
    o += KP.drawWindow(W / 2 - 110, 120, 220, 300);
    o += KP.drawCurtains(W / 2 - 110, 120, 220, 300, PAL[room.curtain || 'pink']);
    return o;
  };

  // ---- ちいさな アイコン ----
  const I = {};
  KP.ICONS = I;
  I.dress = (c = '#B39CEE') => `<path d="M38,14 L50,20 L62,14 L66,30 L60,36 L76,82 Q50,92 24,82 L40,36 L34,30Z" fill="${c}" stroke="#fff" stroke-width="4" stroke-linejoin="round"/><path d="M40,36 Q50,42 60,36" fill="none" stroke="#fff" stroke-width="3"/>${heart(50, 56, 6, '#fff')}`;
  I.search = (c = '#7FA4E6') => `<circle cx="44" cy="42" r="22" fill="#EAF3FF" stroke="${c}" stroke-width="8"/><path d="M60,58 L80,78" stroke="${c}" stroke-width="12" stroke-linecap="round"/><path d="M34,34 Q38,28 46,28" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>`;
  I.house = (c = '#F29CC2') => `<path d="M14,48 L50,16 L86,48" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/><path d="M24,46 L24,84 L76,84 L76,46 L50,24Z" fill="#fff" stroke="${c}" stroke-width="5" stroke-linejoin="round"/>${heart(50, 62, 10, c)}`;
  I.friends = (c = '#F2B94A') => `<circle cx="34" cy="40" r="14" fill="#fff" stroke="${c}" stroke-width="5"/><circle cx="66" cy="40" r="14" fill="#fff" stroke="${c}" stroke-width="5"/><path d="M12,84 Q14,60 34,60 Q54,60 56,84Z M44,84 Q46,60 66,60 Q86,60 88,84Z" fill="${c}" stroke="#fff" stroke-width="3"/>${heart(50, 22, 8, '#F29CC2')}`;
  I.album = (c = '#9A7FDB') => `<rect x="18" y="16" width="64" height="70" rx="8" fill="#fff" stroke="${c}" stroke-width="6"/><rect x="28" y="28" width="44" height="32" rx="4" fill="#E9E1FA"/>${heart(50, 44, 9, '#F29CC2')}<path d="M30,70 H70 M30,78 H56" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`;
  I.back = (c = '#9A7FDB') => `<path d="M58,22 L30,50 L58,78" fill="none" stroke="${c}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`;
  I.home = (c = '#9A7FDB') => `<path d="M14,50 L50,18 L86,50" fill="none" stroke="${c}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="M26,46 V82 H74 V46" fill="none" stroke="${c}" stroke-width="9" stroke-linejoin="round"/>`;
  I.sound = (c = '#9A7FDB') => `<path d="M18,40 H32 L52,22 V78 L32,60 H18Z" fill="${c}"/><path d="M62,36 Q72,50 62,64 M70,26 Q88,50 70,74" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`;
  I.mute = (c = '#B3A5CF') => `<path d="M18,40 H32 L52,22 V78 L32,60 H18Z" fill="${c}"/><path d="M64,38 L84,62 M84,38 L64,62" stroke="${c}" stroke-width="7" stroke-linecap="round"/>`;
  I.reset = (c = '#9A7FDB') => `<path d="M28,34 A26,26 0 1,1 26,62" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round"/><path d="M14,20 L28,38 L46,26" fill="none" stroke="${c}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>`;
  I.dice = (c = '#F29CC2') => `<rect x="18" y="18" width="64" height="64" rx="16" fill="#fff" stroke="${c}" stroke-width="7"/><circle cx="36" cy="36" r="6" fill="${c}"/><circle cx="64" cy="64" r="6" fill="${c}"/><circle cx="50" cy="50" r="6" fill="${c}"/>${sparkle(84, 16, 10, GOLD.base)}`;
  I.save = (c = '#F29CC2') => heart(50, 52, 34, c, '#fff', 5) + sparkle(76, 22, 9, GOLD.base);
  I.magic = (c = '#F2B94A') => `<path d="M24,82 L60,40" stroke="#fff" stroke-width="12" stroke-linecap="round"/><path d="M24,82 L60,40" stroke="${c}" stroke-width="6" stroke-linecap="round"/>${star(66, 32, 22, GOLD.base, GOLD.line, 3)}${sparkle(28, 26, 9, '#fff')}`;
  I.trash = (c = '#E07AA8') => `<path d="M24,30 H76 M40,30 V20 H60 V30 M30,30 L34,84 H66 L70,30" fill="none" stroke="${c}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>`;
  I.flip = (c = '#9A7FDB') => `<path d="M46,18 V82 L14,82Z" fill="${c}"/><path d="M54,18 V82 L86,82Z" fill="none" stroke="${c}" stroke-width="5" stroke-linejoin="round"/>`;
  I.palette = (c = '#9A7FDB') => `<circle cx="50" cy="50" r="34" fill="#fff" stroke="${c}" stroke-width="6"/><circle cx="36" cy="38" r="8" fill="#F8BCD6"/><circle cx="58" cy="32" r="8" fill="#BDEBDC"/><circle cx="68" cy="52" r="8" fill="#FFE59A"/><circle cx="40" cy="62" r="8" fill="#BCD4FA"/>`;
  I.check = (c = '#6FC3A8') => `<path d="M22,52 L42,72 L80,30" fill="none" stroke="${c}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>`;
  I.wall = () => `<rect x="14" y="14" width="72" height="72" rx="10" fill="#F3ECFF" stroke="#B39CEE" stroke-width="5"/><path d="M30,14 V86 M50,14 V86 M70,14 V86" stroke="#D9C9FA" stroke-width="7"/>`;
  I.floor = () => `<path d="M10,70 L30,30 H70 L90,70Z" fill="#F5DEC8" stroke="#D9B08C" stroke-width="5" stroke-linejoin="round"/><path d="M36,30 L28,70 M50,30 V70 M64,30 L72,70" stroke="#D9B08C" stroke-width="3"/>`;
  I.tea = (c = '#F29CC2') => `<path d="M20,40 Q20,80 50,80 Q80,80 80,40Z" fill="#fff" stroke="${c}" stroke-width="6"/><path d="M80,48 Q94,50 88,62 Q84,68 74,66" fill="none" stroke="${c}" stroke-width="6"/><path d="M38,30 Q34,20 40,12 M54,30 Q50,20 56,12" fill="none" stroke="#B39CEE" stroke-width="4" stroke-linecap="round"/>${heart(50, 56, 8, c)}`;
  I.show = (c = '#9A7FDB') => `<path d="M50,10 L20,90 H80Z" fill="#FFF6CF" opacity=".9"/>${star(50, 30, 16, GOLD.base, GOLD.line, 3)}<path d="M28,80 Q50,70 72,80" stroke="${c}" stroke-width="6" fill="none" stroke-linecap="round"/>`;
  I.camera = (c = '#7FA4E6') => `<rect x="12" y="30" width="76" height="52" rx="12" fill="#fff" stroke="${c}" stroke-width="6"/><path d="M34,30 L40,18 H60 L66,30" fill="${c}"/><circle cx="50" cy="56" r="14" fill="#EAF3FF" stroke="${c}" stroke-width="5"/>${heart(50, 56, 5, '#F29CC2')}`;
  I.call = (c = '#6FC3A8') => `<circle cx="40" cy="36" r="16" fill="#fff" stroke="${c}" stroke-width="6"/><path d="M14,86 Q16,58 40,58 Q64,58 66,86Z" fill="${c}"/><path d="M76,30 V58 M62,44 H90" stroke="#F29CC2" stroke-width="9" stroke-linecap="round"/>`;
  I.bye = (c = '#B3A5CF') => `<circle cx="40" cy="36" r="16" fill="#fff" stroke="${c}" stroke-width="6"/><path d="M14,86 Q16,58 40,58 Q64,58 66,86Z" fill="${c}"/><path d="M64,44 H90" stroke="${c}" stroke-width="9" stroke-linecap="round"/>`;
  I.music = (c = '#F29CC2') => `<path d="M38,70 V24 L76,16 V60" fill="none" stroke="${c}" stroke-width="7" stroke-linejoin="round"/><ellipse cx="30" cy="72" rx="12" ry="9" fill="${c}"/><ellipse cx="68" cy="62" rx="12" ry="9" fill="${c}"/>`;
  I.smile = (c = '#F2B94A') => `<circle cx="50" cy="50" r="34" fill="#FFF6CF" stroke="${c}" stroke-width="6"/><circle cx="38" cy="44" r="5" fill="#6A4FB0"/><circle cx="62" cy="44" r="5" fill="#6A4FB0"/><path d="M34,60 Q50,76 66,60" fill="none" stroke="#C2548A" stroke-width="5" stroke-linecap="round"/>`;
  I.heart = (c = '#F29CC2') => heart(50, 52, 36, c, '#fff', 5) + `<ellipse cx="34" cy="38" rx="7" ry="5" fill="#fff" opacity=".7"/>`;
  I.star = (c = GOLD.base) => star(50, 52, 38, c, GOLD.line, 4) + sparkle(78, 18, 8, '#fff');
  I.cake = (c = '#F29CC2') => `<rect x="20" y="46" width="60" height="36" rx="8" fill="#FFF6E8" stroke="${c}" stroke-width="5"/><path d="M20,56 Q30,64 40,56 Q50,64 60,56 Q70,64 80,56" fill="none" stroke="${c}" stroke-width="5"/><circle cx="50" cy="36" r="9" fill="#E0465E"/>`;
  I.flower = (c = '#F29CC2') => [0, 1, 2, 3, 4].map((i) => { const a = i * 1.2566 - 1.57; return `<circle cx="${50 + Math.cos(a) * 22}" cy="${46 + Math.sin(a) * 22}" r="17" fill="${c}" stroke="#fff" stroke-width="4"/>`; }).join('') + `<circle cx="50" cy="46" r="12" fill="#FFE08A"/>`;
  I.book = (c = '#6F98E2') => `<path d="M50,26 Q30,14 12,18 V80 Q30,76 50,86 Q70,76 88,80 V18 Q70,14 50,26Z" fill="#fff" stroke="${c}" stroke-width="6" stroke-linejoin="round"/><path d="M50,26 V86" stroke="${c}" stroke-width="5"/>${heart(31, 46, 7, '#F29CC2')}${star(69, 46, 8, '#FFE08A')}`;
  I.lock = () => `<rect x="24" y="44" width="52" height="40" rx="10" fill="#E9E1FA" stroke="#B3A5CF" stroke-width="5"/><path d="M34,44 V34 A16,16 0 0,1 66,34 V44" fill="none" stroke="#B3A5CF" stroke-width="6"/>`;
  I.question = () => `<circle cx="50" cy="50" r="36" fill="#F3ECFF" stroke="#C9B8E6" stroke-width="5" stroke-dasharray="6 6"/><text x="50" y="66" text-anchor="middle" font-size="44" font-weight="900" fill="#C9B8E6" font-family="sans-serif">?</text>`;
  KP.icon = (name, ...a) => KP.svg('0 0 100 100', I[name](...a), 'ico');
})();

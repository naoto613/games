// おはなし（ストーリー）の え：どうぶつ・おくち・むしばきん・たべもの・はいけい
(function () {
  const KP = window.KP;
  const { PAL, GOLD, lg, rg, star, heart, sparkle, bow, mirror, lace, PARTS, uid } = KP;

  // ---------- ふく：ナース・エプロン ----------
  PARTS.nurse = (C, g) => ({
    defs: lg(g + 'd', [[0, '#fff'], [1, C.light]]),
    dress:
      `<path d="M166,346 Q200,354 234,346 Q270,400 282,446 Q200,466 118,446 Q130,400 166,346Z" fill="url(#${g}d)" stroke="${C.line}" stroke-width="1.8"/>` +
      lace(118, 282, 444, 6, C.base, C.line, 10) +
      `<path d="M162,286 Q200,278 238,286 Q250,292 248,304 L238,358 Q200,368 162,358 L152,304 Q150,292 162,286Z" fill="url(#${g}d)" stroke="${C.line}" stroke-width="1.8"/>` +
      `<path d="M176,284 Q200,302 224,284 L228,292 Q200,314 172,292Z" fill="${C.base}" stroke="${C.line}" stroke-width="1.5"/>` +
      `<rect x="214" y="316" width="18" height="18" rx="4" fill="#fff" stroke="${C.line}" stroke-width="1.4"/><path d="M223,319 V331 M217,325 H229" stroke="${C.dark}" stroke-width="3"/>` +
      `<path d="M162,354 Q200,366 238,354 L238,364 Q200,376 162,364Z" fill="${C.base}" stroke="${C.line}" stroke-width="1.5"/>` + heart(200, 410, 8, C.base),
    sleeves: KP._a.sleevesPuff(C, `url(#${g}d)`, false),
  });
  PARTS.nursecap = (C, g) => ({
    hair: `<path d="M150,92 Q200,52 250,92 L244,104 Q200,84 156,104Z" fill="#fff" stroke="${C.line}" stroke-width="2"/>` +
      `<rect x="192" y="74" width="16" height="16" rx="3" fill="${C.base}"/><path d="M200,77 V87 M195,82 H205" stroke="#fff" stroke-width="3"/>`,
  });
  PARTS.apron = (C, g) => ({
    defs: lg(g + 'd', [[0, C.light], [1, C.base]]),
    dress:
      `<path d="M166,346 Q200,354 234,346 Q272,400 286,470 Q200,492 114,470 Q128,400 166,346Z" fill="url(#${g}d)" stroke="${C.line}" stroke-width="1.8"/>` +
      `<path d="M162,286 Q200,278 238,286 Q250,292 248,304 L238,358 Q200,368 162,358 L152,304 Q150,292 162,286Z" fill="url(#${g}d)" stroke="${C.line}" stroke-width="1.8"/>` +
      // エプロン
      `<path d="M176,300 L224,300 L230,350 Q262,404 256,456 Q200,470 144,456 Q138,404 170,350Z" fill="#fff" stroke="#C9B8E6" stroke-width="1.8"/>` +
      lace(144, 256, 454, 5, '#fff', '#C9B8E6', 8) + `<path d="M176,300 L166,284 M224,300 L234,284" stroke="#fff" stroke-width="5"/>` +
      `<rect x="180" y="380" width="40" height="30" rx="6" fill="${C.light}" stroke="#C9B8E6" stroke-width="1.4"/>` + heart(200, 394, 6, C.base) +
      `<path d="M162,350 Q200,360 238,350" fill="none" stroke="${C.dark}" stroke-width="3"/>`,
    sleeves: KP._a.sleevesPuff(C, `url(#${g}d)`, false),
  });

  // ---------- どうぶつ（240×300） ----------
  const ANI = {
    bear: { fur: '#D9AE8C', light: '#F6E3D2', line: '#9A6A48', ear: 'round' },
    cat: { fur: '#FFE3C2', light: '#FFF6EC', line: '#C9906A', ear: 'tri', stripe: '#F2B98A' },
    dog: { fur: '#F5E6D3', light: '#FFFFFF', line: '#B5835E', ear: 'flop', earc: '#C99A70' },
    panda: { fur: '#FFFFFF', light: '#FFFFFF', line: '#7A7A8E', ear: 'round', earc: '#4A4A5E', patch: '#4A4A5E' },
    pig: { fur: '#FFD3DE', light: '#FFE9EF', line: '#D98AA0', ear: 'tri', snout: '#FFB8C8' },
    rabbit: { fur: '#FFFFFF', light: '#FFFFFF', line: '#B9A4E4', ear: 'long' },
  };
  KP.ANI = ANI;
  function aniEars(A, cx, cy, r) {
    const ec = A.earc || A.fur;
    if (A.ear === 'round') return `<circle cx="${cx - r * 0.72}" cy="${cy - r * 0.72}" r="${r * 0.32}" fill="${ec}" stroke="${A.line}" stroke-width="2.2"/><circle cx="${cx + r * 0.72}" cy="${cy - r * 0.72}" r="${r * 0.32}" fill="${ec}" stroke="${A.line}" stroke-width="2.2"/>` +
      (A.earc ? '' : `<circle cx="${cx - r * 0.72}" cy="${cy - r * 0.72}" r="${r * 0.16}" fill="${A.light}"/><circle cx="${cx + r * 0.72}" cy="${cy - r * 0.72}" r="${r * 0.16}" fill="${A.light}"/>`);
    if (A.ear === 'tri') {
      const e = `<path d="M${cx - r * 0.85},${cy - r * 0.3} L${cx - r * 0.75},${cy - r * 1.15} L${cx - r * 0.2},${cy - r * 0.8}Z" fill="${A.fur}" stroke="${A.line}" stroke-width="2.2" stroke-linejoin="round"/><path d="M${cx - r * 0.72},${cy - r * 0.48} L${cx - r * 0.68},${cy - r * 0.95} L${cx - r * 0.36},${cy - r * 0.76}Z" fill="#FFB8C8"/>`;
      return e + `<g transform="translate(${2 * cx} 0) scale(-1 1)">${e}</g>`;
    }
    if (A.ear === 'long') {
      const e = `<path d="M${cx - r * 0.45},${cy - r * 0.8} C${cx - r * 0.8},${cy - r * 2} ${cx - r * 0.2},${cy - r * 2.1} ${cx - r * 0.12},${cy - r * 0.9}Z" fill="#fff" stroke="${A.line}" stroke-width="2.2"/>`;
      return e + `<g transform="translate(${2 * cx} 0) scale(-1 1)">${e}</g>`;
    }
    return '';
  }
  function aniFace(A, cx, cy, r, expr) {
    let o = '';
    if (A.patch) o += `<ellipse cx="${cx - r * 0.36}" cy="${cy + r * 0.02}" rx="${r * 0.22}" ry="${r * 0.28}" fill="${A.patch}" transform="rotate(-20 ${cx - r * 0.36} ${cy})"/><ellipse cx="${cx + r * 0.36}" cy="${cy + r * 0.02}" rx="${r * 0.22}" ry="${r * 0.28}" fill="${A.patch}" transform="rotate(20 ${cx + r * 0.36} ${cy})"/>`;
    if (A.stripe) o += `<path d="M${cx - 12},${cy - r * 0.95} l4,${r * 0.3} M${cx},${cy - r} v${r * 0.32} M${cx + 12},${cy - r * 0.95} l-4,${r * 0.3}" stroke="${A.stripe}" stroke-width="5" stroke-linecap="round"/>`;
    o += `<ellipse cx="${cx}" cy="${cy + r * 0.36}" rx="${r * 0.42}" ry="${r * 0.3}" fill="${A.light}"/>`;
    const ex = r * 0.36, ey = cy - r * 0.02;
    const eyeCol = A.patch ? '#fff' : '#3A2A4A';
    if (expr === 'happy' || expr === 'open') {
      o += `<path d="M${cx - ex - 9},${ey + 3} Q${cx - ex},${ey - 8} ${cx - ex + 9},${ey + 3} M${cx + ex - 9},${ey + 3} Q${cx + ex},${ey - 8} ${cx + ex + 9},${ey + 3}" fill="none" stroke="${A.patch ? '#fff' : '#3A2A4A'}" stroke-width="4" stroke-linecap="round"/>`;
    } else if (expr === 'sad') {
      o += `<path d="M${cx - ex - 9},${ey - 8} L${cx - ex + 6},${ey - 3} M${cx + ex + 9},${ey - 8} L${cx + ex - 6},${ey - 3}" stroke="${A.line}" stroke-width="3" stroke-linecap="round"/>`;
      o += `<ellipse cx="${cx - ex}" cy="${ey + 4}" rx="6" ry="8" fill="${eyeCol === '#fff' ? '#3A2A4A' : eyeCol}"/><ellipse cx="${cx + ex}" cy="${ey + 4}" rx="6" ry="8" fill="${eyeCol === '#fff' ? '#3A2A4A' : eyeCol}"/>`;
      o += `<path d="M${cx + ex + 10},${ey + 10} q4,10 0,14 q-5,-4 0,-14Z" fill="#BFE3FF" stroke="#7FA4E6" stroke-width="1.4"/>`;
    } else {
      const ec = A.patch ? '#3A2A4A' : eyeCol;
      o += `<ellipse cx="${cx - ex}" cy="${ey}" rx="${expr === 'surprise' ? 8 : 7}" ry="${expr === 'surprise' ? 10 : 9}" fill="${ec}"/><ellipse cx="${cx + ex}" cy="${ey}" rx="${expr === 'surprise' ? 8 : 7}" ry="${expr === 'surprise' ? 10 : 9}" fill="${ec}"/>`;
      o += `<circle cx="${cx - ex - 2}" cy="${ey - 3}" r="2.6" fill="#fff"/><circle cx="${cx + ex - 2}" cy="${ey - 3}" r="2.6" fill="#fff"/>`;
      if (A.patch) o += `<circle cx="${cx - ex}" cy="${ey}" r="10" fill="none" stroke="#fff" stroke-width="2.4"/><circle cx="${cx + ex}" cy="${ey}" r="10" fill="none" stroke="#fff" stroke-width="2.4"/>`;
    }
    o += `<ellipse cx="${cx - r * 0.6}" cy="${cy + r * 0.3}" rx="${r * 0.14}" ry="${r * 0.08}" fill="#FF9DB8" opacity=".6"/><ellipse cx="${cx + r * 0.6}" cy="${cy + r * 0.3}" rx="${r * 0.14}" ry="${r * 0.08}" fill="#FF9DB8" opacity=".6"/>`;
    // はな・くち
    if (A.snout) o += `<ellipse cx="${cx}" cy="${cy + r * 0.26}" rx="${r * 0.22}" ry="${r * 0.15}" fill="${A.snout}" stroke="${A.line}" stroke-width="2"/><ellipse cx="${cx - 6}" cy="${cy + r * 0.26}" rx="3" ry="4" fill="${A.line}"/><ellipse cx="${cx + 6}" cy="${cy + r * 0.26}" rx="3" ry="4" fill="${A.line}"/>`;
    else o += `<ellipse cx="${cx}" cy="${cy + r * 0.22}" rx="${r * 0.1}" ry="${r * 0.07}" fill="#4A3048"/>`;
    const my = cy + r * (A.snout ? 0.48 : 0.4);
    if (expr === 'open') o += `<ellipse cx="${cx}" cy="${my + 6}" rx="${r * 0.2}" ry="${r * 0.18}" fill="#8E2C52"/><ellipse cx="${cx}" cy="${my + 12}" rx="${r * 0.12}" ry="${r * 0.08}" fill="#FF9AB4"/>`;
    else if (expr === 'sad') o += `<path d="M${cx - 9},${my + 6} Q${cx},${my - 2} ${cx + 9},${my + 6}" fill="none" stroke="#4A3048" stroke-width="2.4" stroke-linecap="round"/>`;
    else if (expr === 'surprise') o += `<ellipse cx="${cx}" cy="${my + 4}" rx="6" ry="7" fill="#8E2C52"/>`;
    else o += `<path d="M${cx - 12},${my} Q${cx - 6},${my + 8} ${cx},${my} Q${cx + 6},${my + 8} ${cx + 12},${my}" fill="none" stroke="#4A3048" stroke-width="2.4" stroke-linecap="round"/>` + (expr === 'happy' ? `<path d="M${cx - 7},${my + 4} Q${cx},${my + 16} ${cx + 7},${my + 4}Z" fill="#FF9AB4"/>` : '');
    return o;
  }
  // wear: { kind:'apron'|'coat'|'bib'|'chef', color }
  KP.drawAnimal = function (kind, expr = 'smile', wear = {}) {
    const A = ANI[kind] || ANI.bear;
    const id = uid('a');
    let o = `<defs>${rg(id + 'f', [[0, '#fff'], [0.5, A.fur], [1, A.fur]], 0.4, 0.3, 0.8)}</defs>`;
    // からだ
    o += `<ellipse cx="120" cy="236" rx="64" ry="58" fill="${A.fur}" stroke="${A.line}" stroke-width="2.4"/>`;
    o += `<ellipse cx="120" cy="244" rx="36" ry="34" fill="${A.light}"/>`;
    if (wear.kind === 'coat') {
      o += `<path d="M62,212 Q120,190 178,212 L184,290 Q120,300 56,290Z" fill="#fff" stroke="#B9C4DA" stroke-width="2.2"/><path d="M120,200 L120,292 M104,196 L120,232 L136,196" fill="none" stroke="#B9C4DA" stroke-width="2.2"/>` +
        `<rect x="138" y="244" width="22" height="20" rx="4" fill="#EAF3FF" stroke="#B9C4DA" stroke-width="1.6"/><path d="M146,236 v12" stroke="#6F98E2" stroke-width="3"/>`;
    } else if (wear.kind === 'apron') {
      const c = PAL[wear.color || 'mint'];
      o += `<path d="M84,212 L156,212 L164,292 Q120,300 76,292Z" fill="${c.base}" stroke="${c.line}" stroke-width="2.2"/><rect x="104" y="244" width="32" height="24" rx="5" fill="${c.light}" stroke="${c.line}" stroke-width="1.6"/>`;
    } else if (wear.kind === 'bib') {
      o += `<path d="M86,196 Q120,214 154,196 L150,236 Q120,250 90,236Z" fill="#EAF6FF" stroke="#8CB4E8" stroke-width="2"/>`;
    }
    // て・あし
    const paw = (x, y) => `<ellipse cx="${x}" cy="${y}" rx="16" ry="18" fill="${A.fur}" stroke="${A.line}" stroke-width="2.2"/>`;
    o += expr === 'sad' ? paw(66, 236) + paw(176, 150) : paw(62, 236) + paw(178, 236);
    o += `<ellipse cx="88" cy="290" rx="24" ry="14" fill="${A.fur}" stroke="${A.line}" stroke-width="2.2"/><ellipse cx="152" cy="290" rx="24" ry="14" fill="${A.fur}" stroke="${A.line}" stroke-width="2.2"/>`;
    // あたま
    o += aniEars(A, 120, 112, 74);
    o += `<ellipse cx="120" cy="112" rx="78" ry="70" fill="url(#${id}f)" stroke="${A.line}" stroke-width="2.4"/>`;
    o += aniFace(A, 120, 112, 74, expr);
    if (expr === 'sad') o += paw(176, 150);
    if (wear.kind === 'coat') o += `<path d="M58,70 Q120,20 182,70" fill="none" stroke="#6A6FB8" stroke-width="5"/><circle cx="120" cy="38" r="20" fill="#EAF3FF" stroke="#B9C4DA" stroke-width="3"/><circle cx="120" cy="38" r="8" fill="#fff"/>` + sparkle(128, 30, 4);
    if (wear.kind === 'chef') o += `<path d="M80,60 Q70,20 100,26 Q110,0 140,14 Q170,10 162,50 L158,64 Q120,54 84,64Z" fill="#fff" stroke="#C9B8E6" stroke-width="2.2"/>`;
    if (wear.kind === 'apron' && wear.band) o += `<path d="M50,84 Q120,50 190,84" fill="none" stroke="${PAL[wear.color || 'mint'].base}" stroke-width="10" stroke-linecap="round"/>`;
    return o;
  };

  // ---------- おくちの アップ（600×600） ----------
  KP.TEETH = (() => {
    const t = [];
    for (let i = 0; i < 6; i++) { const x = 190 + i * 44; t.push({ x, y: 268 + Math.abs(2.5 - i) * 7, up: true }); }
    for (let i = 0; i < 6; i++) { const x = 190 + i * 44; t.push({ x, y: 452 - Math.abs(2.5 - i) * 7, up: false }); }
    return t;
  })();
  KP.MOUTH_PATH = 'M140,226 Q300,196 460,226 Q500,380 448,500 Q300,560 152,500 Q100,380 140,226Z';
  KP.drawMouthView = function (kind, opt = {}) {
    const A = ANI[kind] || ANI.bear;
    const id = uid('m');
    let o = `<defs>${rg(id + 'f', [[0, '#fff'], [0.6, A.fur], [1, A.fur]], 0.5, 0.3, 0.8)}<clipPath id="${id}c"><path d="${KP.MOUTH_PATH}"/></clipPath>${rg(id + 'l', [[0, '#FFFFFF', 0.4], [1, '#FFFFFF', 0]], 0.5, 0.45, 0.5)}</defs>`;
    o += `<rect width="600" height="600" fill="${A.fur}"/><ellipse cx="300" cy="260" rx="420" ry="380" fill="url(#${id}f)"/>`;
    if (A.patch) o += `<ellipse cx="170" cy="110" rx="70" ry="56" fill="${A.patch}"/><ellipse cx="430" cy="110" rx="70" ry="56" fill="${A.patch}"/>`;
    // め
    const eye = (x) => opt.happy ? `<path d="M${x - 28},118 Q${x},88 ${x + 28},118" fill="none" stroke="${A.patch ? '#fff' : '#3A2A4A'}" stroke-width="9" stroke-linecap="round"/>`
      : `<ellipse cx="${x}" cy="110" rx="20" ry="26" fill="#3A2A4A"/><circle cx="${x - 6}" cy="100" r="7" fill="#fff"/>` + (opt.nervous ? `<path d="M${x - 30},72 L${x + 26},84" stroke="${A.line}" stroke-width="5" stroke-linecap="round"/>` : '');
    o += eye(170) + eye(430);
    o += `<ellipse cx="96" cy="190" rx="40" ry="22" fill="#FF9DB8" opacity=".55"/><ellipse cx="504" cy="190" rx="40" ry="22" fill="#FF9DB8" opacity=".55"/>`;
    // くち
    o += `<path d="${KP.MOUTH_PATH}" fill="#9E3A5E" stroke="${A.line}" stroke-width="6"/>`;
    o += `<g clip-path="url(#${id}c)"><ellipse cx="300" cy="360" rx="120" ry="80" fill="#6E1E3E"/><ellipse cx="300" cy="500" rx="150" ry="70" fill="#F27A9A"/><path d="M300,450 V540" stroke="#D85A80" stroke-width="5"/>`;
    // は
    KP.TEETH.forEach((t, i) => {
      const h = 58, w = 38;
      const y0 = t.up ? t.y - h / 2 : t.y - h / 2;
      o += `<rect class="tooth" data-i="${i}" x="${t.x - w / 2}" y="${y0}" width="${w}" height="${h}" rx="14" fill="${opt.shine ? '#FFFFFF' : '#FFFDF6'}" stroke="#E6DCCB" stroke-width="2.4"/>`;
      o += `<path d="M${t.x - 10},${y0 + 10} q4,-4 10,-2" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    });
    o += `<path d="M140,226 Q300,250 460,226 L460,220 Q300,190 140,220Z" fill="#E86A92"/><path d="M152,500 Q300,476 448,500 L448,510 Q300,540 152,510Z" fill="#E86A92"/>`;
    if (opt.light) o += `<ellipse cx="300" cy="370" rx="240" ry="200" fill="url(#${id}l)"/>`;
    o += `</g>`;
    if (!opt.light) o += `<path d="${KP.MOUTH_PATH}" fill="#1E0A20" opacity=".72"/>`;
    o += `<path d="${KP.MOUTH_PATH}" fill="none" stroke="${A.line}" stroke-width="6"/>`;
    return o;
  };
  KP.drawGerm = function (x, y, s = 1, variant = 0, beaten = false) {
    const cols = [['#B79BEA', '#7C5CC4'], ['#9EDC9A', '#4C9C5A'], ['#F3B37C', '#C9783E']][variant % 3];
    const t = `translate(${x} ${y}) scale(${s})`;
    if (beaten) return `<g transform="${t}"><circle r="22" fill="#fff" opacity=".9"/><circle cx="-14" cy="-10" r="12" fill="#fff" opacity=".9"/><circle cx="14" cy="-8" r="13" fill="#fff" opacity=".9"/>${sparkle(18, -22, 6, '#BFE3FF')}</g>`;
    return `<g transform="${t}"><path d="M0,-24 Q10,-34 14,-22 Q28,-22 24,-8 Q34,2 24,12 Q24,28 8,24 Q0,34 -8,24 Q-24,28 -24,12 Q-34,2 -24,-8 Q-28,-22 -14,-22 Q-10,-34 0,-24Z" fill="${cols[0]}" stroke="${cols[1]}" stroke-width="2.6"/>` +
      `<path d="M-12,-8 L-4,-4 M12,-8 L4,-4" stroke="${cols[1]}" stroke-width="3" stroke-linecap="round"/><circle cx="-8" cy="2" r="4.5" fill="#3A2A4A"/><circle cx="8" cy="2" r="4.5" fill="#3A2A4A"/><circle cx="-9" cy="0" r="1.5" fill="#fff"/><circle cx="7" cy="0" r="1.5" fill="#fff"/>` +
      `<path d="M-8,12 L-4,9 L0,12 L4,9 L8,12" fill="none" stroke="#3A2A4A" stroke-width="2.2" stroke-linejoin="round"/>` +
      `<path d="M-4,-24 L-8,-34 M6,-24 L10,-34" stroke="${cols[1]}" stroke-width="3" stroke-linecap="round"/></g>`;
  };
  KP.drawFoam = (x, y, n) => Array.from({ length: n }, (_, i) => `<circle cx="${x + Math.cos(i * 2.1) * (10 + i * 3)}" cy="${y + Math.sin(i * 2.1) * (8 + i * 2)}" r="${8 + (i % 3) * 3}" fill="#fff" stroke="#DDEBFF" stroke-width="1.4" opacity=".95"/>`).join('');

  // ---------- たべもの（100×100） ----------
  const FOOD = {};
  KP.FOOD = FOOD;
  FOOD.carrot = { name: 'にんじん', d: `<path d="M30,30 L74,76 Q82,84 74,88 Q66,92 58,82Z" transform="rotate(10 50 50)" fill="#FF9A4A" stroke="#D8691E" stroke-width="3"/><path d="M28,26 q-14,-14 -6,-20 q10,4 10,16 q4,-14 14,-14 q4,10 -10,20Z" fill="#6FC3A8" stroke="#3F9C83" stroke-width="2.4"/><path d="M44,44 l8,-4 M54,56 l8,-4 M62,68 l6,-3" stroke="#D8691E" stroke-width="2.4" stroke-linecap="round"/>` };
  FOOD.potato = { name: 'じゃがいも', d: `<ellipse cx="50" cy="54" rx="36" ry="28" fill="#E6C08A" stroke="#B08850" stroke-width="3" transform="rotate(-12 50 54)"/><circle cx="36" cy="48" r="3" fill="#B08850"/><circle cx="58" cy="62" r="3" fill="#B08850"/><circle cx="64" cy="44" r="2.6" fill="#B08850"/>` };
  FOOD.onion = { name: 'たまねぎ', d: `<path d="M50,20 Q60,40 78,56 Q84,86 50,88 Q16,86 22,56 Q40,40 50,20Z" fill="#F5D6A8" stroke="#C99A5E" stroke-width="3"/><path d="M50,24 Q46,56 50,86 M50,24 Q66,56 62,86 M50,24 Q34,56 38,86" fill="none" stroke="#C99A5E" stroke-width="1.6" opacity=".6"/><path d="M50,22 q-4,-10 0,-14 q4,4 0,14" fill="#9EDDC8" stroke="#3F9C83" stroke-width="2"/>` };
  FOOD.tomato = { name: 'トマト', d: `<circle cx="50" cy="56" r="32" fill="#F0506E" stroke="#C23452" stroke-width="3"/><path d="M36,28 L50,36 L64,28 L58,40 L70,42 L50,44 L30,42 L42,40Z" fill="#6FC3A8" stroke="#3F9C83" stroke-width="2"/><ellipse cx="38" cy="50" rx="6" ry="9" fill="#fff" opacity=".5"/>` };
  FOOD.lettuce = { name: 'レタス', d: `<circle cx="50" cy="54" r="34" fill="#BDEBA0" stroke="#6FAE5A" stroke-width="3"/><path d="M24,46 Q50,30 76,46 M22,62 Q50,46 78,62 M30,76 Q50,64 70,76" fill="none" stroke="#6FAE5A" stroke-width="2.4"/>` };
  FOOD.strawberry = { name: 'いちご', d: `<path d="M50,90 C16,64 20,30 50,32 C80,30 84,64 50,90Z" fill="#F0506E" stroke="#C23452" stroke-width="3"/><path d="M34,28 L50,38 L66,28 L58,22 L50,30 L42,22Z" fill="#6FC3A8" stroke="#3F9C83" stroke-width="2"/>${[[40, 50], [58, 48], [48, 64], [62, 64], [38, 66], [50, 78]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="2" ry="3" fill="#FFE59A"/>`).join('')}` };
  FOOD.banana = { name: 'バナナ', d: `<path d="M20,30 Q24,78 78,80 Q86,78 84,72 Q40,66 32,26Z" fill="#FFE07A" stroke="#D2A43A" stroke-width="3"/><path d="M18,30 L22,22 L30,26" fill="#8A6A3A" stroke="#6A4A2A" stroke-width="2"/><path d="M30,40 Q38,64 70,72" fill="none" stroke="#D2A43A" stroke-width="2" opacity=".6"/>` };
  FOOD.apple = { name: 'りんご', d: `<path d="M50,32 C30,20 14,38 18,60 C22,84 40,92 50,86 C60,92 78,84 82,60 C86,38 70,20 50,32Z" fill="#F0506E" stroke="#C23452" stroke-width="3"/><path d="M50,32 Q48,18 56,12" stroke="#8A6A3A" stroke-width="4" fill="none"/><path d="M54,22 q14,-10 22,0 q-12,8 -22,0Z" fill="#6FC3A8"/><ellipse cx="34" cy="48" rx="6" ry="10" fill="#fff" opacity=".45"/>` };
  FOOD.bread = { name: 'パン', d: `<path d="M16,56 Q14,28 50,26 Q86,28 84,56 L80,82 Q50,90 20,82Z" fill="#F2C27C" stroke="#B5835E" stroke-width="3"/><path d="M30,40 Q34,34 40,40 M46,38 Q50,32 56,38 M62,40 Q66,34 72,40" fill="none" stroke="#B5835E" stroke-width="2.4"/>` };
  FOOD.egg = { name: 'たまご', d: `<rect x="14" y="44" width="72" height="38" rx="8" fill="#F5E6D3" stroke="#C9A27E" stroke-width="3"/>${[30, 50, 70].map((x) => `<ellipse cx="${x}" cy="44" rx="10" ry="13" fill="#FFF8EE" stroke="#D9C2A2" stroke-width="2"/>`).join('')}` };
  FOOD.cheese = { name: 'チーズ', d: `<path d="M14,70 L86,70 L86,48 L28,30 L14,48Z" fill="#FFD772" stroke="#D29A3A" stroke-width="3" stroke-linejoin="round"/><circle cx="36" cy="56" r="5" fill="#F2B94A"/><circle cx="62" cy="60" r="4" fill="#F2B94A"/><circle cx="72" cy="52" r="3" fill="#F2B94A"/>` };
  FOOD.milk = { name: 'ぎゅうにゅう', d: `<path d="M30,30 L50,16 L70,30 L70,88 L30,88Z" fill="#fff" stroke="#8CB4E8" stroke-width="3" stroke-linejoin="round"/><rect x="30" y="46" width="40" height="26" fill="#BCD4FA"/><ellipse cx="50" cy="59" rx="10" ry="7" fill="#fff"/><path d="M30,30 L70,30" stroke="#8CB4E8" stroke-width="3"/>` };
  FOOD.curry = { name: 'カレールー', d: `<rect x="18" y="26" width="64" height="52" rx="6" fill="#F2B94A" stroke="#C98C25" stroke-width="3"/><path d="M28,62 Q50,72 72,62 Q70,48 50,48 Q30,48 28,62Z" fill="#A86B2A"/><ellipse cx="50" cy="40" rx="18" ry="6" fill="#fff" opacity=".7"/>` };
  FOOD.icecream = { name: 'アイス', d: `<path d="M30,48 L50,92 L70,48Z" fill="#F2C27C" stroke="#B5835E" stroke-width="3" stroke-linejoin="round"/><path d="M36,56 L60,56 M40,66 L58,66" stroke="#B5835E" stroke-width="2"/><circle cx="50" cy="38" r="22" fill="#FFD3E6" stroke="#E07AA8" stroke-width="3"/><circle cx="50" cy="16" r="6" fill="#F0506E"/>` };
  FOOD.juice = { name: 'ジュース', d: `<path d="M30,26 L70,26 L64,90 L36,90Z" fill="#FFE59A" stroke="#D29A3A" stroke-width="3" stroke-linejoin="round" opacity=".95"/><path d="M58,26 L66,8" stroke="#F29CC2" stroke-width="5" stroke-linecap="round"/><circle cx="44" cy="40" r="7" fill="#FF9A4A" stroke="#D8691E" stroke-width="2"/>` };
  FOOD.cookie = { name: 'クッキー', d: `<circle cx="50" cy="52" r="32" fill="#E6B07A" stroke="#B5835E" stroke-width="3"/>${[[38, 42], [60, 40], [50, 58], [36, 64], [64, 64]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4.5" fill="#7A4A2A"/>`).join('')}` };
  KP.foodSVG = (k) => KP.svg('0 0 100 100', FOOD[k].d);

  // コイン
  KP.coin = (x = 50, y = 50, r = 40) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFE08A" stroke="#D29A3A" stroke-width="${r * 0.12}"/><circle cx="${x}" cy="${y}" r="${r * 0.72}" fill="none" stroke="#F2C35A" stroke-width="${r * 0.08}"/>` + star(x, y, r * 0.42, '#F2B94A', null) + sparkle(x - r * 0.4, y - r * 0.45, r * 0.18, '#fff');

  // できあがりの おりょうり
  KP.DISH = {
    curry: `<ellipse cx="150" cy="120" rx="130" ry="50" fill="#fff" stroke="#C9B8E6" stroke-width="5"/><ellipse cx="150" cy="116" rx="104" ry="36" fill="#FFFBEF"/><path d="M58,120 Q66,84 116,84 Q150,86 152,120 Q110,144 58,120Z" fill="#fff" stroke="#E6DCCB" stroke-width="3"/><path d="M146,92 Q226,82 246,116 Q212,148 146,142Z" fill="#C98C25" stroke="#A86B2A" stroke-width="2"/><circle cx="190" cy="108" r="11" fill="#FF9A4A"/><rect x="204" y="118" width="20" height="16" rx="5" fill="#F5D6A8"/><circle cx="170" cy="126" r="9" fill="#E6C08A"/>` + heart(96, 104, 9, '#F8BCD6'),
    sand: `<ellipse cx="150" cy="130" rx="130" ry="42" fill="#fff" stroke="#C9B8E6" stroke-width="5"/>` + [70, 150, 230].map((x) => `<g transform="translate(${x - 40} 50)"><path d="M0,70 L40,0 L80,70Z" fill="#F6E1B8" stroke="#C99A5E" stroke-width="3"/><path d="M10,60 L70,60" stroke="#9EDC9A" stroke-width="7"/><path d="M14,52 L66,52" stroke="#FFE07A" stroke-width="6"/><path d="M20,44 L60,44" stroke="#F0506E" stroke-width="6"/></g>`).join(''),
    parfait: `<path d="M100,20 L200,20 L176,150 L124,150Z" fill="#F7F2FF" stroke="#C9B8E6" stroke-width="5" opacity=".95"/><path d="M106,50 L194,50 L188,84 L112,84Z" fill="#FFD3E6"/><path d="M112,84 L188,84 L182,116 L118,116Z" fill="#FFF8DC"/><path d="M118,116 L182,116 L176,150 L124,150Z" fill="#F0506E" opacity=".7"/><circle cx="150" cy="22" r="26" fill="#fff" stroke="#E6DCCB" stroke-width="3"/>${FOOD.strawberry.d.replace(/^/, '<g transform="translate(150 -14) scale(.4)">')}</g><path d="M130,160 L170,160 L176,176 L124,176Z" fill="#C9B8E6"/>`,
  };

  // ---------- はいけい（750×1000） ----------
  KP.BG = {};
  KP.BG.kitchen = () => {
    const id = uid('kt');
    return `<defs><pattern id="${id}t" width="60" height="60" patternUnits="userSpaceOnUse"><rect width="60" height="60" fill="#FFF8F0"/><rect width="58" height="58" x="1" y="1" fill="#FFF1F6" rx="4"/></pattern>${lg(id + 'f', [[0, '#F5DEC8'], [1, '#EBC9AA']])}</defs>` +
      `<rect width="750" height="1000" fill="url(#${id}t)"/>` + KP.drawWindow(270, 90, 210, 250) +
      `<rect y="760" width="750" height="240" fill="url(#${id}f)"/>` +
      // れいぞうこ
      `<rect x="20" y="230" width="170" height="530" rx="20" fill="#EAF3FF" stroke="#9DBDF4" stroke-width="4"/><path d="M20,420 H190" stroke="#9DBDF4" stroke-width="4"/><rect x="160" y="300" width="10" height="80" rx="5" fill="#9DBDF4"/><rect x="160" y="460" width="10" height="100" rx="5" fill="#9DBDF4"/>` + heart(90, 330, 14, '#F8BCD6') + star(70, 500, 12, '#FFE59A') +
      // だい
      `<rect x="200" y="600" width="550" height="40" rx="8" fill="#fff" stroke="#E2D6F6" stroke-width="4"/><rect x="210" y="640" width="540" height="120" fill="#F8BCD6" stroke="#E07AA8" stroke-width="3"/>` +
      `<rect x="250" y="660" width="140" height="80" rx="8" fill="#FFE3EF" stroke="#E07AA8" stroke-width="2"/><rect x="420" y="660" width="140" height="80" rx="8" fill="#FFE3EF" stroke="#E07AA8" stroke-width="2"/><rect x="590" y="660" width="140" height="80" rx="8" fill="#FFE3EF" stroke="#E07AA8" stroke-width="2"/>` +
      // コンロ
      `<rect x="520" y="570" width="200" height="32" rx="6" fill="#B9C4DA" stroke="#8A94AE" stroke-width="3"/><circle cx="570" cy="586" r="10" fill="#6A7490"/><circle cx="670" cy="586" r="10" fill="#6A7490"/>` +
      // たな
      `<rect x="520" y="200" width="210" height="16" rx="4" fill="#D9AE8C"/><circle cx="560" cy="180" r="20" fill="#FFE59A" stroke="#D29A3A" stroke-width="3"/><rect x="600" y="160" width="40" height="40" rx="6" fill="#BDEBDC" stroke="#4C9C82" stroke-width="3"/><path d="M680,200 L680,150 Q700,140 712,150 L712,200Z" fill="#F8BCD6" stroke="#C9668F" stroke-width="3"/>`;
  };
  KP.BG.street = (light = 'red') => {
    const id = uid('st');
    let o = `<defs>${lg(id + 's', [[0, '#BFE3FF'], [1, '#FFF0F6']])}</defs><rect width="750" height="1000" fill="url(#${id}s)"/>`;
    o += `<ellipse cx="140" cy="120" rx="70" ry="24" fill="#fff"/><ellipse cx="560" cy="80" rx="60" ry="20" fill="#fff"/>`;
    // おみせ
    const shop = (x, w, aw, aw2, sign, icon) => `<rect x="${x}" y="230" width="${w}" height="330" fill="#FFF8F0" stroke="#E2D6F6" stroke-width="4"/>` +
      `<path d="M${x - 10},300 L${x + w + 10},300 L${x + w},250 L${x},250Z" fill="${aw}"/>` + Array.from({ length: 6 }, (_, i) => `<path d="M${x + (i * w) / 6},250 L${x + ((i + 0.5) * w) / 6},250 L${x + ((i + 0.5) * w) / 6 - 4},300 L${x + (i * w) / 6 - 10},300Z" fill="${aw2}"/>`).join('') +
      `<path d="M${x - 10},300 ${Array.from({ length: 6 }, (_, i) => `q${(w + 20) / 12},20 ${(w + 20) / 6},0`).join(' ')}" fill="${aw}" stroke="${aw2}" stroke-width="2"/>` +
      `<rect x="${x + 20}" y="180" width="${w - 40}" height="56" rx="14" fill="#fff" stroke="${aw2}" stroke-width="4"/><text x="${x + w / 2 + 16}" y="218" text-anchor="middle" font-size="28" font-weight="800" fill="#493B6B" font-family="'M PLUS Rounded 1c',sans-serif">${sign}</text><g transform="translate(${x + 30} 184) scale(.48)">${icon}</g>` +
      `<rect x="${x + w / 2 - 50}" y="400" width="100" height="160" rx="10" fill="#EAF6FF" stroke="${aw2}" stroke-width="4"/><path d="M${x + w / 2},400 V560" stroke="${aw2}" stroke-width="3"/>` +
      `<rect x="${x + 16}" y="340" width="70" height="60" rx="6" fill="#EAF6FF" stroke="${aw2}" stroke-width="3"/><rect x="${x + w - 86}" y="340" width="70" height="60" rx="6" fill="#EAF6FF" stroke="${aw2}" stroke-width="3"/>`;
    o += shop(30, 320, '#BDEBDC', '#6FC3A8', 'やおや', FOOD.carrot.d) + shop(400, 320, '#BCD4FA', '#6F98E2', 'マーケット', FOOD.milk.d);
    o += `<rect y="560" width="750" height="80" fill="#F2E6FA"/><rect y="640" width="750" height="190" fill="#B9B4CC"/>`;
    for (let i = 0; i < 7; i++) o += `<rect x="${200 + i * 50}" y="650" width="30" height="170" fill="#fff" opacity=".95"/>`;
    o += `<path d="M0,735 H180 M570,735 H750" stroke="#fff" stroke-width="6" stroke-dasharray="30 24"/>`;
    o += `<rect y="830" width="750" height="170" fill="#F2E6FA"/>`;
    // しんごう
    o += `<rect x="640" y="660" width="12" height="190" fill="#8A94AE"/><rect x="616" y="560" width="60" height="110" rx="14" fill="#5A5F7A"/>` +
      `<circle cx="646" cy="590" r="18" fill="${light === 'red' ? '#FF5A6A' : '#5A3040'}"/><circle cx="646" cy="638" r="18" fill="${light === 'green' ? '#5ADC8A' : '#2E4A3A'}"/>` +
      (light === 'red' ? `<circle cx="646" cy="590" r="28" fill="#FF5A6A" opacity=".3"/>` : `<circle cx="646" cy="638" r="28" fill="#5ADC8A" opacity=".3"/>`);
    return o;
  };
  KP.BG.shop = (kind) => {
    const c = kind === 'yaoya' ? { wall: '#EFFBF5', shelf: '#D9AE8C', acc: '#6FC3A8' } : { wall: '#EEF4FF', shelf: '#B9C4DA', acc: '#6F98E2' };
    let o = `<rect width="750" height="1000" fill="${c.wall}"/>`;
    for (let i = 0; i < 9; i++) o += `<path d="M${i * 90},0 V560" stroke="#fff" stroke-width="20" opacity=".6"/>`;
    o += `<path d="M0,0 L750,0 L750,70 ${Array.from({ length: 10 }, (_, i) => `Q${750 - i * 75 - 37},110 ${750 - (i + 1) * 75},70`).join(' ')}Z" fill="${c.acc}" opacity=".85"/>`;
    o += [180, 400].map((y) => `<rect x="30" y="${y}" width="690" height="22" rx="6" fill="${c.shelf}"/><rect x="30" y="${y + 22}" width="690" height="10" fill="#000" opacity=".06"/>`).join('');
    o += `<rect y="760" width="750" height="240" fill="#F5DEC8"/><rect x="0" y="600" width="750" height="170" fill="#fff" stroke="#E2D6F6" stroke-width="4"/>`;
    o += `<rect x="520" y="560" width="180" height="70" rx="10" fill="#B9C4DA" stroke="#8A94AE" stroke-width="3"/><rect x="540" y="574" width="80" height="28" rx="4" fill="#DFF7E6"/>`;
    return o;
  };
  KP.BG.clinic = () => {
    const id = uid('cl');
    return `<defs>${lg(id + 'w', [[0, '#E9FBF4'], [1, '#D4F2E6']])}</defs><rect width="750" height="1000" fill="url(#${id}w)"/>` +
      `<rect y="700" width="750" height="300" fill="#F3ECFF"/><path d="M0,700 H750" stroke="#fff" stroke-width="10"/>` +
      KP.drawWindow(500, 100, 200, 240) +
      // ポスター
      `<rect x="60" y="120" width="170" height="210" rx="12" fill="#fff" stroke="#9EDDC8" stroke-width="5"/><path d="M110,180 Q110,150 145,150 Q180,150 180,180 Q180,230 166,280 Q160,290 154,262 Q148,240 145,240 Q140,240 136,262 Q130,290 124,280 Q110,230 110,180Z" fill="#fff" stroke="#B9C4DA" stroke-width="4"/>` +
      `<circle cx="132" cy="196" r="5" fill="#3A2A4A"/><circle cx="158" cy="196" r="5" fill="#3A2A4A"/><path d="M134,212 Q145,222 156,212" stroke="#C2548A" stroke-width="3" fill="none"/>` + sparkle(196, 150, 10, '#FFE59A') + sparkle(96, 300, 7, '#9EDDC8') +
      // いす
      `<path d="M220,720 Q240,560 300,540 L470,520 Q500,520 500,550 L480,700 Z" fill="#9EDDC8" stroke="#3F9C83" stroke-width="4"/><rect x="330" y="700" width="40" height="140" fill="#B9C4DA"/><ellipse cx="350" cy="850" rx="110" ry="22" fill="#B9C4DA"/>` +
      // ライト
      `<path d="M640,700 V420 L470,380" fill="none" stroke="#B9C4DA" stroke-width="12" stroke-linecap="round"/><ellipse cx="460" cy="384" rx="44" ry="26" fill="#fff" stroke="#B9C4DA" stroke-width="5"/>`;
  };
  KP.BG.runway = () => {
    const id = uid('rw');
    let o = `<defs>${lg(id + 's', [[0, '#2E2458'], [0.55, '#6A4FB0'], [1, '#B98AD8']])}${lg(id + 'r', [[0, '#F7E9FF'], [1, '#FFFFFF']])}${lg(id + 'l', [[0, '#FFF6CF', 0.55], [1, '#FFF6CF', 0]])}</defs><rect width="750" height="1000" fill="url(#${id}s)"/>`;
    for (let i = 0; i < 30; i++) o += sparkle((i * 131) % 750, (i * 67) % 380, 4 + (i % 3) * 2, '#fff', 0.7);
    // ライト
    [120, 375, 630].forEach((x) => (o += `<path d="M${x - 20},0 L${x + 20},0 L${x + 150},640 L${x - 150},640Z" fill="url(#${id}l)"/>`));
    // カーテン・ぶたい
    o += `<rect x="215" y="180" width="320" height="200" rx="10" fill="#4A3A80" stroke="#FFE59A" stroke-width="4"/><text x="375" y="250" text-anchor="middle" font-size="34" font-weight="800" fill="#FFE59A" font-family="'M PLUS Rounded 1c',sans-serif">きらめき</text><text x="375" y="300" text-anchor="middle" font-size="30" font-weight="800" fill="#fff" font-family="'M PLUS Rounded 1c',sans-serif">コレクション</text>` + star(255, 240, 12, '#FFE59A') + star(495, 240, 12, '#FFE59A');
    // ランウェイ
    o += `<path d="M300,380 L450,380 L700,1000 L50,1000Z" fill="url(#${id}r)" stroke="#E6DBFF" stroke-width="4"/>`;
    for (let i = 0; i < 9; i++) { const t = i / 8, y = 380 + t * t * 620, hw = 75 + t * t * 250; o += `<circle cx="${375 - hw - 8}" cy="${y}" r="${3 + t * 6}" fill="#FFE59A"/><circle cx="${375 + hw + 8}" cy="${y}" r="${3 + t * 6}" fill="#FFE59A"/>`; }
    // おきゃくさん
    const head = (x, y, c) => `<circle cx="${x}" cy="${y}" r="26" fill="${c}" opacity=".85"/><path d="M${x - 40},${y + 70} Q${x},${y + 10} ${x + 40},${y + 70}Z" fill="${c}" opacity=".85"/>`;
    [[30, 760], [100, 860], [20, 940], [130, 960], [720, 760], [650, 860], [730, 940], [620, 960]].forEach(([x, y], i) => (o += head(x, y, ['#3A2E66', '#4A3A80', '#2E2458'][i % 3])));
    return o;
  };
  KP.drawLetter = () =>
    `<defs>${lg('lt', [[0, '#FFF6FA'], [1, '#FFE3EF']])}</defs><rect x="20" y="40" width="360" height="250" rx="18" fill="url(#lt)" stroke="#E07AA8" stroke-width="5"/>` +
    `<path d="M20,60 L200,170 L380,60" fill="none" stroke="#F29CC2" stroke-width="4"/>` + heart(200, 170, 22, '#E07AA8', '#fff', 3) +
    `<text x="200" y="240" text-anchor="middle" font-size="22" font-weight="800" fill="#C2548A" font-family="'M PLUS Rounded 1c',sans-serif">しょうたいじょう</text>` + star(60, 260, 12, '#FFE59A') + star(340, 260, 12, '#FFE59A') + sparkle(350, 70, 10, '#FFE59A');
  KP.drawTrophy = () =>
    `<path d="M70,20 L130,20 L126,80 Q100,104 74,80Z" fill="#FFE08A" stroke="#C99234" stroke-width="5"/><path d="M70,30 Q40,30 46,56 Q52,74 74,72 M130,30 Q160,30 154,56 Q148,74 126,72" fill="none" stroke="#C99234" stroke-width="5"/>` +
    `<rect x="92" y="96" width="16" height="30" fill="#FFE08A" stroke="#C99234" stroke-width="4"/><rect x="66" y="124" width="68" height="24" rx="6" fill="#F29CC2" stroke="#C2548A" stroke-width="4"/>` + star(100, 50, 16, '#fff', null) + sparkle(150, 16, 10, '#fff');
  KP.drawTrafficIcon = (light) => `<rect x="30" y="6" width="40" height="88" rx="12" fill="#5A5F7A"/><circle cx="50" cy="30" r="13" fill="${light === 'red' ? '#FF5A6A' : '#5A3040'}"/><circle cx="50" cy="68" r="13" fill="${light === 'green' ? '#5ADC8A' : '#2E4A3A'}"/>`;

  // おけしょうの どうぐ
  KP.MAKEUP_ICON = {
    lip: (c) => `<rect x="38" y="54" width="24" height="38" rx="4" fill="#FFE08A" stroke="#C99234" stroke-width="3"/><path d="M40,56 L40,24 Q50,8 60,24 L60,56Z" fill="${c}" stroke="#8E2C52" stroke-width="3"/>`,
    cheek: (c) => `<circle cx="50" cy="56" r="34" fill="#fff" stroke="#E2D6F6" stroke-width="4"/><circle cx="50" cy="56" r="24" fill="${c}"/><path d="M70,20 L86,4" stroke="#D9AE8C" stroke-width="8" stroke-linecap="round"/>`,
    shadow: (c) => `<rect x="14" y="26" width="72" height="52" rx="12" fill="#fff" stroke="#E2D6F6" stroke-width="4"/><circle cx="36" cy="52" r="14" fill="${c}"/><circle cx="64" cy="52" r="14" fill="${c}" opacity=".6"/>`,
    sticker: (k) => (k === 'heart' ? heart(50, 54, 30, '#FF8FB8', '#fff', 4) : k === 'moon' ? `<path d="M62,18 a34,34 0 1,0 10,62 a26,26 0 1,1 -10,-62Z" fill="#FFE08A" stroke="#fff" stroke-width="4"/>` : star(50, 52, 34, '#FFE08A', '#fff', 4)) + sparkle(80, 20, 9, '#fff'),
    lash: () => `<path d="M16,64 Q50,30 84,64" fill="none" stroke="#4A2A63" stroke-width="7" stroke-linecap="round"/><path d="M26,52 l-8,-14 M40,44 l-4,-16 M56,42 l2,-16 M70,48 l8,-14" stroke="#4A2A63" stroke-width="5" stroke-linecap="round"/>`,
  };
})();

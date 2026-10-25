// たんけんの ばしょ（750×1000）。spots は タップできる ところ。
(function () {
  const KP = window.KP;
  const { PAL, GOLD, lg, rg, star, heart, sparkle, bow, uid, FURN } = KP;

  const flower = (x, y, r, C, center = GOLD.base) => {
    let o = '';
    for (let i = 0; i < 5; i++) {
      const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
      o += `<circle cx="${(x + Math.cos(a) * r).toFixed(1)}" cy="${(y + Math.sin(a) * r).toFixed(1)}" r="${r * 0.78}" fill="${C.base}" stroke="${C.line}" stroke-width="1.4"/>`;
    }
    return o + `<circle cx="${x}" cy="${y}" r="${r * 0.55}" fill="${center}" stroke="${GOLD.line}" stroke-width="1"/>`;
  };
  const tulip = (x, y, C) =>
    `<path d="M${x},${y} L${x},${y + 40}" stroke="#6FC3A8" stroke-width="4"/><path d="M${x},${y + 30} q-14,-6 -16,-20 q12,2 16,16" fill="#9EDDC8" stroke="#4C9C82" stroke-width="1.4"/>` +
    `<path d="M${x - 12},${y - 18} L${x - 6},${y - 6} L${x},${y - 20} L${x + 6},${y - 6} L${x + 12},${y - 18} Q${x + 14},${y + 6} ${x},${y + 6} Q${x - 14},${y + 6} ${x - 12},${y - 18}Z" fill="${C.base}" stroke="${C.line}" stroke-width="1.8"/>`;
  const bush = (x, y, w, h, flowers, id) => {
    let o = `<path d="M${x - w / 2},${y} C${x - w / 2 - 10},${y - h * 0.6} ${x - w * 0.25},${y - h * 1.05} ${x},${y - h} C${x + w * 0.25},${y - h * 1.05} ${x + w / 2 + 10},${y - h * 0.6} ${x + w / 2},${y}Z" fill="url(#${id})" stroke="#4C9C82" stroke-width="2.4"/>`;
    o += `<path d="M${x - w * 0.3},${y - h * 0.55} q${w * 0.1},-${h * 0.25} ${w * 0.25},-${h * 0.2} M${x + w * 0.05},${y - h * 0.7} q${w * 0.1},-${h * 0.2} ${w * 0.25},-${h * 0.1}" fill="none" stroke="#DDF7EC" stroke-width="4" stroke-linecap="round" opacity=".8"/>`;
    (flowers || []).forEach(([dx, dy, C]) => (o += flower(x + dx, y + dy, 8, C)));
    return o;
  };
  const tree = (x, y, s, id) =>
    `<path d="M${x - 16 * s},${y} Q${x - 10 * s},${y - 90 * s} ${x - 14 * s},${y - 150 * s} L${x + 14 * s},${y - 150 * s} Q${x + 10 * s},${y - 90 * s} ${x + 16 * s},${y}Z" fill="#D9AE8C" stroke="#9A6A48" stroke-width="2.4"/>` +
    `<circle cx="${x}" cy="${y - 200 * s}" r="${90 * s}" fill="url(#${id})" stroke="#4C9C82" stroke-width="2.4"/>` +
    `<circle cx="${x - 70 * s}" cy="${y - 150 * s}" r="${56 * s}" fill="url(#${id})" stroke="#4C9C82" stroke-width="2.4"/>` +
    `<circle cx="${x + 70 * s}" cy="${y - 150 * s}" r="${56 * s}" fill="url(#${id})" stroke="#4C9C82" stroke-width="2.4"/>` +
    `<circle cx="${x}" cy="${y - 140 * s}" r="${60 * s}" fill="url(#${id})"/>` +
    `<path d="M${x - 40 * s},${y - 250 * s} q30,-20 60,-6" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".5"/>`;

  KP.SCENES = {};

  // ---- ひみつの にわ ----
  KP.SCENES.garden = function () {
    const id = uid('g');
    const defs =
      lg(id + 's', [[0, '#BFE3FF'], [0.55, '#EAF6FF'], [1, '#FFF0F6']]) +
      lg(id + 'h', [[0, '#CDEFD9'], [1, '#A9E0C4']]) +
      lg(id + 'g', [[0, '#C8EFC0'], [1, '#9FD9A8']]) +
      lg(id + 'b', [[0, '#A8E3C6'], [1, '#6FC3A8']]) +
      lg(id + 'w', [[0, '#CFEFFF'], [1, '#9DCDF4']]) +
      rg(id + 'r', [[0.7, '#fff', 0], [0.78, '#FFB3C7', 0.5], [0.84, '#FFE59A', 0.5], [0.9, '#BDEBDC', 0.5], [0.96, '#BCD4FA', 0.5], [1, '#fff', 0]], 0.5, 1, 1);
    let bg = `<defs>${defs}</defs>`;
    bg += `<rect width="750" height="1000" fill="url(#${id}s)"/>`;
    bg += `<ellipse cx="375" cy="560" rx="460" ry="420" fill="url(#${id}r)" opacity=".8"/>`;
    bg += `<g opacity=".9" transform="translate(470 210) scale(0.95)">${FURN.castle.draw(PAL.lav, id + 'c')}</g>`;
    bg += `<path d="M0,430 Q180,340 380,420 Q560,350 750,420 L750,600 L0,600Z" fill="url(#${id}h)"/>`;
    bg += `<rect y="480" width="750" height="520" fill="url(#${id}g)"/>`;
    bg += `<path d="M300,1000 Q340,760 380,560 Q400,520 430,520 Q420,560 430,620 Q470,820 560,1000Z" fill="#FFF3DF" stroke="#F1D9B8" stroke-width="3"/>`;
    for (let i = 0; i < 14; i++) {
      const x = (i * 97) % 750, y = 620 + ((i * 53) % 340);
      bg += `<path d="M${x},${y} q4,-12 8,0 M${x + 10},${y + 4} q4,-10 8,0" fill="none" stroke="#7FCDB2" stroke-width="2.4" stroke-linecap="round"/>`;
    }
    const spots = [
      { id: 'cloud', x: 160, y: 130, r: 80, draw: `<ellipse cx="160" cy="140" rx="80" ry="34" fill="#fff"/><ellipse cx="130" cy="118" rx="44" ry="32" fill="#fff"/><ellipse cx="186" cy="110" rx="40" ry="36" fill="#fff"/>${sparkle(232, 96, 8, '#FFE59A')}` },
      { id: 'tree', x: 110, y: 420, r: 100, draw: tree(110, 560, 1.15, id + 'b') + `<ellipse cx="96" cy="430" rx="14" ry="18" fill="#9A6A48"/>` },
      { id: 'birdhouse', x: 640, y: 420, r: 70, draw: `<rect x="634" y="440" width="12" height="130" fill="#D9AE8C" stroke="#9A6A48" stroke-width="2"/><path d="M596,400 L640,360 L684,400Z" fill="#F29CC2" stroke="#C9668F" stroke-width="2.4"/><rect x="606" y="398" width="68" height="56" rx="6" fill="#FFF6E8" stroke="#C9668F" stroke-width="2.4"/><circle cx="640" cy="424" r="11" fill="#9A6A48"/>` },
      { id: 'bushL', x: 120, y: 640, r: 90, draw: bush(120, 690, 220, 130, [[-50, -70, PAL.pink], [30, -90, PAL.white], [60, -40, PAL.pink]], id + 'b') },
      { id: 'bushR', x: 640, y: 660, r: 90, draw: bush(640, 712, 220, 130, [[-40, -80, PAL.yellow], [40, -60, PAL.lav]], id + 'b') },
      { id: 'pond', x: 560, y: 840, r: 100, draw: `<ellipse cx="570" cy="850" rx="140" ry="56" fill="url(#${id}w)" stroke="#7FA4E6" stroke-width="3"/><ellipse cx="530" cy="840" rx="30" ry="10" fill="#9EDDC8" stroke="#4C9C82" stroke-width="2"/>${flower(530, 834, 7, PAL.pink)}<path d="M600,840 q20,-8 40,0" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>` },
      { id: 'mushroom', x: 210, y: 860, r: 70, draw: `<path d="M196,880 L194,920 Q210,930 226,920 L224,880Z" fill="#FFF6E8" stroke="#D9AE8C" stroke-width="2.4"/><path d="M150,884 Q150,820 210,816 Q270,820 270,884Q210,898 150,884Z" fill="#F29CC2" stroke="#C9668F" stroke-width="2.6"/><circle cx="186" cy="846" r="10" fill="#fff"/><circle cx="232" cy="840" r="8" fill="#fff"/><circle cx="212" cy="866" r="6" fill="#fff"/>` },
      { id: 'flowers', x: 380, y: 720, r: 80, draw: [[320, 700, PAL.pink], [350, 740, PAL.lav], [390, 700, PAL.yellow], [420, 744, PAL.pink], [450, 706, PAL.blue], [300, 744, PAL.yellow]].map(([x, y, C]) => tulip(x, y, C)).join('') },
      { id: 'bench', x: 300, y: 560, r: 70, draw: `<rect x="236" y="540" width="130" height="14" rx="6" fill="#fff" stroke="#C9B8E6" stroke-width="2.4"/><rect x="236" y="510" width="130" height="24" rx="10" fill="#F3ECFF" stroke="#C9B8E6" stroke-width="2.4"/><path d="M246,554 v30 M356,554 v30" stroke="#C9B8E6" stroke-width="6" stroke-linecap="round"/>${heart(301, 522, 7, '#F8BCD6')}` },
      { id: 'basket', x: 470, y: 940, r: 60, draw: `<path d="M420,930 Q420,970 470,972 Q520,970 520,930Z" fill="#F5DEC8" stroke="#B5835E" stroke-width="2.6"/><path d="M426,930 Q470,880 514,930" fill="none" stroke="#B5835E" stroke-width="5"/><circle cx="450" cy="930" r="12" fill="#E0465E"/><circle cx="476" cy="926" r="12" fill="#FFE59A"/><circle cx="494" cy="932" r="11" fill="#E0465E"/>` },
      { id: 'grass', x: 90, y: 940, r: 70, draw: `<path d="M40,980 Q50,900 70,950 Q80,880 100,948 Q116,890 126,960 Q140,920 150,980Z" fill="#9EDDC8" stroke="#4C9C82" stroke-width="2.4"/>${flower(80, 930, 7, PAL.white)}${flower(120, 920, 7, PAL.yellow)}` },
    ];
    return { bg, spots, ground: 'garden' };
  };

  // ---- まほうの おうち（ひろま） ----
  KP.SCENES.house = function () {
    const id = uid('h');
    let bg = KP.drawRoomBG({ wallpaperId: 'stripe', floorId: 'wood', curtain: 'lav' }, 750);
    bg += `<defs>${lg(id + 'a', [[0, '#EEE6FF'], [1, '#C9B5F5']])}</defs>`;
    const spots = [
      { id: 'clock', x: 120, y: 160, r: 60, draw: `<circle cx="120" cy="160" r="52" fill="#fff" stroke="#C9B8E6" stroke-width="6"/>${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => { const a = i * Math.PI / 6; return `<circle cx="${120 + Math.sin(a) * 40}" cy="${160 - Math.cos(a) * 40}" r="3" fill="#C9B8E6"/>`; }).join('')}<path d="M120,160 V128 M120,160 L144,170" stroke="#9A7FDB" stroke-width="5" stroke-linecap="round"/>${heart(120, 160, 6, '#F29CC2')}` },
      { id: 'painting', x: 620, y: 170, r: 70, draw: `<rect x="560" y="110" width="124" height="110" rx="8" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="3"/><rect x="574" y="124" width="96" height="82" rx="4" fill="#EAF6FF"/><path d="M574,206 Q610,170 640,190 Q656,180 670,190 L670,206Z" fill="#CDEFD9"/>${star(640, 148, 10, GOLD.base)}${heart(600, 160, 9, '#F8BCD6')}` },
      { id: 'shelf', x: 110, y: 520, r: 100, draw: `<g transform="translate(10 390)">${FURN.shelf.draw(PAL.lav, id + 's')}</g>` },
      { id: 'teatable', x: 400, y: 730, r: 100, draw: `<g transform="translate(290 640)">${FURN.teatable.draw(PAL.pink, id + 't')}</g>` },
      { id: 'chest', x: 620, y: 600, r: 80, draw: `<rect x="548" y="572" width="146" height="90" rx="12" fill="#F8BCD6" stroke="#C9668F" stroke-width="3"/><path d="M548,590 Q621,520 694,590Z" fill="#F29CC2" stroke="#C9668F" stroke-width="3"/><rect x="548" y="586" width="146" height="14" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="2"/><rect x="608" y="596" width="26" height="30" rx="6" fill="${GOLD.base}" stroke="${GOLD.line}" stroke-width="2"/>${heart(621, 640, 10, '#fff')}` },
      { id: 'vase', x: 650, y: 470, r: 60, draw: `<rect x="600" y="500" width="100" height="16" rx="6" fill="#fff" stroke="#C9B8E6" stroke-width="2.4"/><path d="M632,500 Q620,470 636,452 L664,452 Q680,470 668,500Z" fill="#BCD4FA" stroke="#5F86CC" stroke-width="2.4"/>${flower(636, 430, 8, PAL.pink)}${flower(664, 424, 8, PAL.yellow)}${flower(650, 404, 8, PAL.lav)}` },
      { id: 'cushion', x: 200, y: 800, r: 70, draw: `<g transform="translate(140 740)">${FURN.cushion.draw(PAL.lav, id + 'c')}</g>` },
      { id: 'toybox', x: 600, y: 860, r: 80, draw: `<rect x="530" y="820" width="150" height="100" rx="14" fill="#BDEBDC" stroke="#3F9C83" stroke-width="3"/><rect x="520" y="806" width="170" height="26" rx="10" fill="#9EDDC8" stroke="#3F9C83" stroke-width="3"/>${star(605, 872, 18, GOLD.base, GOLD.line, 2)}<circle cx="560" cy="800" r="16" fill="#F29CC2" stroke="#C9668F" stroke-width="2"/>` },
      { id: 'curtain', x: 300, y: 250, r: 60, draw: `` },
      { id: 'rugcorner', x: 380, y: 920, r: 70, draw: `<ellipse cx="380" cy="930" rx="120" ry="34" fill="#EEE6FF" stroke="#B39CEE" stroke-width="3"/>${heart(380, 928, 10, '#C9B5F5')}` },
    ];
    return { bg, spots, ground: 'house' };
  };
})();

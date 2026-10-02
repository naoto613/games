// ================================================================ tiles (16x16, drawn procedurally)
const hsh = (x, y, s = 0) => { const v = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453; return v - Math.floor(v); };
const TP = {
  grass: '#8ed46a', grassD: '#6cb850', grassL: '#b4e888', path: '#e8d49a', pathD: '#cdb37a', pathL: '#f6e6b8',
  tall: '#48a848', tallD: '#2a7a34', tallO: '#1a5028', tree: '#3c9a48', treeD: '#256c34', treeL: '#6cc864', treeO: '#163c22', trunk: '#8a5a30',
  water: '#4c8ef0', waterD: '#3870d0', waterL: '#a8d4ff', sand: '#f2dea0', sandD: '#d8c080',
  wood: '#d8a868', woodD: '#b07c44', woodL: '#ecc48a', wall: '#f4ecd8', wallD: '#c8b898', tile: '#f0f0f0', tileD: '#c8d0d8',
  cave: '#a88a68', caveD: '#86684c', caveL: '#c4a684', caveW: '#6c5038', caveWD: '#4a3424',
  ash: '#a8a8a0', ashD: '#888880', ashL: '#cacac4', lava: '#f05020', lavaL: '#ffb040', rock: '#a07850', rockD: '#785434', rockL: '#c49a70',
  ruin: '#c8b490', ruinD: '#a08c68', ruinL: '#e2d2b0', gym: '#d0d4e0', gymD: '#a8acc0',
};
const TILE_DEF = {};  // ch -> {solid, enc, frames:[canvas], over, ledge, water}
function defTile(ch, props, draw, frames = 1) {
  const imgs = [];
  for (let f = 0; f < frames; f++) { const p = new Pix(16, 16); draw(p, f); imgs.push(p.canvas()); }
  TILE_DEF[ch] = Object.assign({ solid: false, enc: 0, frames: imgs }, props);
}
function grassBase(p, seed = 0) {
  p.rect(0, 0, 16, 16, TP.grass);
  for (let i = 0; i < 5; i++) {
    const x = Math.floor(hsh(i, seed, 1) * 14) + 1, y = Math.floor(hsh(i, seed, 2) * 13) + 2;
    p.px(x, y, TP.grassD); p.px(x + 1, y - 1, TP.grassD); p.px(x - 1, y - 1, TP.grassD);
  }
  for (let i = 0; i < 3; i++) p.px(Math.floor(hsh(i, seed, 3) * 16), Math.floor(hsh(i, seed, 4) * 16), TP.grassL);
}
function buildTiles() {
  defTile('.', {}, p => grassBase(p, 1));
  defTile(';', {}, p => grassBase(p, 7));
  const tuft = (p, bx, by, h, cA, cB, cO, cL) => {
    // three blades fanning out
    const bl = [[-2, -1], [0, 0], [2, 1]];
    for (const [dx, lean] of bl) {
      const hh = dx === 0 ? h : h - 2;
      for (let k = 0; k <= hh; k++) { const x = bx + dx + Math.round(lean * k / hh * 1.5), y = by - k; p.px(x, y, k === hh ? cO : dx === 0 ? cA : cB); if (k > hh - 3 && dx === 0) p.px(x, y, cL); }
      p.px(bx + dx + Math.round(lean * 1.5) - 1, by - hh, cO); p.px(bx + dx + Math.round(lean * 1.5) + 1, by - hh, cO);
    }
    p.px(bx - 3, by, cO); p.px(bx + 3, by, cO); p.hline(bx - 2, bx + 2, by + 1, cO);
  };
  defTile(',', { enc: 1, over: true }, (p) => {
    p.rect(0, 0, 16, 16, '#58b048');
    for (let i = 0; i < 6; i++) p.px(Math.floor(hsh(i, 33) * 16), Math.floor(hsh(i, 34) * 16), '#469a3a');
    tuft(p, 4, 7, 5, '#3c9a3c', '#2e8434', TP.tallO, '#7ccc5c');
    tuft(p, 12, 6, 4, '#3c9a3c', '#2e8434', TP.tallO, '#7ccc5c');
    tuft(p, 8, 14, 5, '#3c9a3c', '#2e8434', TP.tallO, '#7ccc5c');
    tuft(p, 0, 14, 4, '#3c9a3c', '#2e8434', TP.tallO, '#7ccc5c');
    tuft(p, 16, 14, 4, '#3c9a3c', '#2e8434', TP.tallO, '#7ccc5c');
  });
  defTile('a', { enc: 1, over: true }, (p) => {
    p.rect(0, 0, 16, 16, '#b0b0a8');
    for (let i = 0; i < 6; i++) p.px(Math.floor(hsh(i, 35) * 16), Math.floor(hsh(i, 36) * 16), '#989890');
    for (const [x, y, h] of [[4, 7, 5], [12, 6, 4], [8, 14, 5], [0, 14, 4], [16, 14, 4]]) tuft(p, x, y, h, '#a0a098', '#8c8c84', '#505048', '#e0e0d8');
  });
  defTile('A', {}, p => {
    p.rect(0, 0, 16, 16, TP.ash);
    for (let i = 0; i < 8; i++) p.px(Math.floor(hsh(i, 3) * 16), Math.floor(hsh(i, 4) * 16), i % 2 ? TP.ashD : TP.ashL);
  });
  defTile(':', {}, p => {
    p.rect(0, 0, 16, 16, TP.path);
    for (let i = 0; i < 6; i++) p.px(Math.floor(hsh(i, 9) * 16), Math.floor(hsh(i, 8) * 16), i % 3 ? TP.pathD : TP.pathL);
  });
  defTile('=', {}, p => {
    p.rect(0, 0, 16, 16, TP.sand);
    for (let i = 0; i < 7; i++) p.px(Math.floor(hsh(i, 19) * 16), Math.floor(hsh(i, 18) * 16), i % 3 ? TP.sandD : '#fff4d0');
  });
  defTile('T', { solid: true }, p => {
    p.rect(0, 0, 16, 16, TP.grass);
    p.rect(6, 11, 4, 4, TP.trunk); p.rect(6, 11, 1, 4, '#5c3818'); p.rect(9, 11, 1, 4, '#5c3818');
    p.part(E(8, 7, 7.4, 6.6), TP.tree, { ol: TP.treeO, hi: TP.treeL, lo: TP.treeD });
    p.px(5, 4, TP.treeL); p.px(6, 3, TP.treeL); p.px(4, 6, TP.treeL);
    p.px(10, 9, TP.treeD); p.px(11, 8, TP.treeD); p.px(4, 9, TP.treeD);
    p.hline(5, 11, 15, TP.grassD);
  });
  defTile('Y', { solid: true }, p => {  // palm tree on sand
    p.rect(0, 0, 16, 16, TP.sand);
    p.rect(7, 6, 3, 9, '#b07840'); for (let y = 7; y < 15; y += 2) p.hline(7, 9, y, '#8a5a30');
    p.part(P(8, 4, 1, 7, 3, 3), '#3cb04c'); p.part(P(8, 4, 15, 7, 13, 2), '#3cb04c'); p.part(P(8, 5, 4, 11, 8, 3), '#2c9040');
    p.part(P(8, 5, 12, 11, 8, 3), '#2c9040'); p.part(E(8, 4, 2), '#7a4a20');
  });
  defTile('~', { solid: true, water: true }, (p, f) => {
    p.rect(0, 0, 16, 16, TP.water);
    for (let i = 0; i < 3; i++) {
      const y = (i * 5 + 2) % 16, x0 = Math.floor((i * 7 + f * 2) % 16);
      for (let k = 0; k < 4; k++) p.px((x0 + k) % 16, y, k === 0 || k === 3 ? TP.waterD : TP.waterL);
    }
    p.px((f * 4 + 3) % 16, 13, '#ffffff');
  }, 4);
  defTile('f', {}, (p, f) => {
    grassBase(p, 3);
    const fl = (x, y, c) => { p.px(x, y - 1, c); p.px(x - 1, y, c); p.px(x + 1, y, c); p.px(x, y + 1, c); p.px(x, y, '#fff070'); };
    const o = f ? 1 : 0;
    fl(4 + o, 4, '#f05068'); fl(11 - o, 10, '#f8f8f8'); fl(5, 12 + o, '#f8d020');
  }, 2);
  defTile('F', { solid: true }, p => {
    grassBase(p, 5);
    p.rect(0, 6, 16, 2, '#fff'); p.rect(0, 10, 16, 2, '#fff'); p.hline(0, 15, 8, '#a0a0a0'); p.hline(0, 15, 12, '#a0a0a0');
    for (const x of [1, 9]) { p.rect(x, 3, 3, 12, '#fff'); p.rect(x + 2, 3, 1, 12, '#b0b0b0'); p.hline(x, x + 2, 15, '#808080'); }
  });
  defTile('_', { ledge: true }, p => {
    grassBase(p, 11);
    p.rect(0, 9, 16, 4, '#6cb850'); p.hline(0, 15, 9, '#4a8a3a'); p.hline(0, 15, 12, '#3a7030'); p.rect(0, 13, 16, 1, '#2a5a28');
  });
  defTile('#', { solid: true }, p => {
    p.rect(0, 0, 16, 16, TP.rock);
    for (let y = 0; y < 16; y += 4) { p.hline(0, 15, y, TP.rockD); p.hline(0, 15, y + 1, TP.rockL); }
    for (let i = 0; i < 4; i++) p.px(Math.floor(hsh(i, 41) * 16), Math.floor(hsh(i, 42) * 16), TP.rockD);
  });
  defTile('^', { solid: true }, p => {
    grassBase(p, 2);
    p.part(E(8, 9, 7, 6), '#b0a090', { ol: '#504538' }); p.px(5, 6, '#e0d4c4'); p.px(6, 5, '#e0d4c4');
  });
  defTile('y', {}, p => {
    p.rect(0, 0, 16, 16, TP.water);
    for (let x = 0; x < 16; x += 4) { p.rect(x, 0, 4, 16, TP.wood); p.rect(x, 0, 1, 16, TP.woodD); }
    p.hline(0, 15, 0, TP.woodD); p.hline(0, 15, 15, TP.woodD);
  });
  defTile('n', { solid: true, sign: true }, p => {
    grassBase(p, 6);
    p.rect(7, 9, 2, 6, '#7a4a20');
    p.part(RR(2, 2, 12, 8, 1), '#c88a48', { ol: '#5a3410', flat: true }); p.hline(4, 11, 5, '#8a5a28'); p.hline(4, 9, 7, '#8a5a28');
  });
  defTile('N', { solid: true, sign: true }, p => {  // sign on path
    p.rect(0, 0, 16, 16, TP.path);
    p.rect(7, 9, 2, 6, '#7a4a20');
    p.part(RR(2, 2, 12, 8, 1), '#c88a48', { ol: '#5a3410', flat: true }); p.hline(4, 11, 5, '#8a5a28'); p.hline(4, 9, 7, '#8a5a28');
  });
  // ---- interiors
  defTile('o', {}, p => {
    p.rect(0, 0, 16, 16, TP.wood);
    for (let y = 0; y < 16; y += 4) p.hline(0, 15, y, TP.woodD);
    p.px(4, 2, TP.woodD); p.px(12, 6, TP.woodD); p.px(7, 10, TP.woodD); p.px(2, 14, TP.woodD); p.hline(9, 13, 1, TP.woodL);
  });
  defTile('O', {}, p => {
    p.rect(0, 0, 16, 16, TP.tile); p.hline(0, 15, 15, TP.tileD); for (let y = 0; y < 16; y++) p.px(15, y, TP.tileD); p.px(1, 1, '#ffffff');
  });
  defTile('w', { solid: true }, p => {
    p.rect(0, 0, 16, 16, TP.wall); p.rect(0, 12, 16, 4, '#d8c4a0'); p.hline(0, 15, 12, '#a08c68'); p.hline(0, 15, 15, '#806c48');
    for (let x = 2; x < 16; x += 8) for (let y = 2; y < 11; y += 4) p.px(x + (y % 8 ? 4 : 0), y, '#e4d8c0');
  });
  defTile('W', { solid: true }, p => { p.rect(0, 0, 16, 16, '#3a3048'); p.hline(0, 15, 15, '#5a5070'); });
  defTile('b', { solid: true }, p => {
    p.rect(0, 0, 16, 16, '#8a5a30'); p.rect(1, 1, 14, 14, '#5c3818');
    const cols = ['#e04848', '#4878e0', '#48b060', '#e0c048', '#a060d0'];
    for (const y of [2, 9]) for (let x = 2; x < 14; x += 2) p.rect(x, y, 2, 5, cols[(x + y) % 5]);
    p.hline(1, 14, 7, '#8a5a30'); p.hline(1, 14, 14, '#8a5a30');
  });
  defTile('t', { solid: true }, p => {
    p.rect(0, 0, 16, 16, TP.wood);
    p.part(RR(0, 2, 15, 10, 2), '#c07838', { ol: '#5a3410' }); p.rect(2, 12, 2, 3, '#7a4a20'); p.rect(12, 12, 2, 3, '#7a4a20');
  });
  defTile('p', { solid: true, pc: true }, p => {
    p.rect(0, 0, 16, 16, TP.wall); p.rect(0, 12, 16, 4, '#d8c4a0');
    p.part(RR(2, 1, 12, 9, 1), '#d0d0d8', { ol: '#404050' }); p.rect(4, 3, 8, 5, '#58c8f0'); p.px(5, 4, '#e0ffff');
    p.rect(1, 11, 14, 4, '#b0b0b8'); p.hline(1, 14, 15, '#606068');
  });
  defTile('k', { solid: true }, p => {
    p.rect(0, 0, 16, 16, '#e05878'); p.rect(0, 0, 16, 5, '#f8f0f0'); p.hline(0, 15, 5, '#a03050'); p.hline(0, 15, 15, '#802040'); p.rect(0, 9, 16, 1, '#f08098');
  });
  defTile('K', { solid: true }, p => {
    p.rect(0, 0, 16, 16, '#4870d0'); p.rect(0, 0, 16, 5, '#f8f0f0'); p.hline(0, 15, 5, '#2a4a90'); p.hline(0, 15, 15, '#203070'); p.rect(0, 9, 16, 1, '#78a0f0');
  });
  defTile('m', { mat: true }, p => {
    p.rect(0, 0, 16, 16, TP.wood); p.rect(1, 3, 14, 10, '#d04848'); p.rect(2, 4, 12, 8, '#e86868');
    for (let x = 3; x < 13; x += 3) p.rect(x, 6, 1, 4, '#f8c0c0');
  });
  defTile('B', { solid: true }, p => {
    p.rect(0, 0, 16, 16, TP.wood);
    p.part(RR(1, 0, 14, 16, 2), '#f0f0ff', { ol: '#505070' }); p.rect(2, 1, 12, 4, '#ffffff'); p.rect(2, 6, 12, 9, '#f070a0'); p.hline(2, 13, 6, '#c04878');
  });
  defTile('v', { solid: true, tv: true }, p => {
    p.rect(0, 0, 16, 16, TP.wall); p.rect(0, 12, 16, 4, '#d8c4a0');
    p.part(RR(1, 2, 14, 11, 1), '#505060', { ol: '#202028' }); p.rect(3, 4, 10, 7, '#80d0f0'); p.px(4, 5, '#ffffff');
  });
  defTile('P', { solid: true }, p => {
    p.rect(0, 0, 16, 16, TP.wood);
    p.part(R(4, 10, 8, 5), '#c06838'); p.part(E(8, 6, 6, 5), '#3ca050'); p.px(6, 4, '#7ad070');
  });
  defTile('Q', { solid: true }, p => {
    p.rect(0, 0, 16, 16, TP.tile); p.hline(0, 15, 15, TP.tileD);
    p.part(R(4, 10, 8, 5), '#c06838'); p.part(E(8, 6, 6, 5), '#3ca050'); p.px(6, 4, '#7ad070');
  });
  defTile('q', { solid: true }, p => {
    p.rect(0, 0, 16, 16, '#5a4a3a');
    p.part(R(1, 2, 14, 13), '#c89858', { ol: '#5a3a18' }); p.hline(2, 13, 8, '#9a6a30'); p.line(2, 3, 13, 14, '#9a6a30');
  });
  defTile('j', {}, p => { p.rect(0, 0, 16, 16, '#5a4a3a'); p.hline(0, 15, 7, '#4a3a2a'); p.hline(0, 15, 15, '#4a3a2a'); });
  defTile('S', {}, p => {  // stairs
    p.rect(0, 0, 16, 16, TP.wood);
    for (let y = 0; y < 16; y += 4) { p.rect(0, y, 16, 3, '#b07c44'); p.hline(0, 15, y + 3, '#6a4420'); }
  });
  // ---- cave / mountain
  defTile('c', { enc: 0.6 }, p => {
    p.rect(0, 0, 16, 16, TP.cave);
    for (let i = 0; i < 7; i++) p.px(Math.floor(hsh(i, 51) * 16), Math.floor(hsh(i, 52) * 16), i % 2 ? TP.caveD : TP.caveL);
  });
  defTile('e', { mat: true }, p => {
    p.rect(0, 0, 16, 16, TP.cave);
    p.part(E(8, 9, 7, 5), '#181010', { ol: TP.caveD, flat: true }); p.hline(3, 12, 6, '#302020');
  });
  defTile('C', { solid: true }, p => {
    p.rect(0, 0, 16, 16, TP.caveW);
    for (let i = 0; i < 4; i++) { const x = Math.floor(hsh(i, 61) * 12), y = Math.floor(hsh(i, 62) * 12); p.part(E(x + 2, y + 2, 3, 2), '#7c6044', { ol: TP.caveWD }); }
  });
  defTile('*', { solid: true, gem: true }, p => {
    p.rect(0, 0, 16, 16, TP.cave);
    p.part(P(8, 1, 13, 7, 8, 15, 3, 7), '#f04878', { ol: '#801838', hi: '#ffb0c8' }); p.px(7, 4, '#ffffff');
  });
  defTile('V', {}, p => {
    p.rect(0, 0, 16, 16, '#8c6c58');
    for (let i = 0; i < 8; i++) p.px(Math.floor(hsh(i, 71) * 16), Math.floor(hsh(i, 72) * 16), i % 2 ? '#6c4c3a' : '#a88a74');
  });
  defTile('l', { solid: true }, (p, f) => {
    p.rect(0, 0, 16, 16, TP.lava);
    for (let i = 0; i < 4; i++) { const x = Math.floor((hsh(i, 81) * 16 + f * 3) % 16), y = Math.floor(hsh(i, 82) * 16); p.rect(x, y, 3, 2, TP.lavaL); }
    p.px((f * 5) % 16, (f * 3 + 7) % 16, '#fff0a0');
  }, 4);
  // ---- ruins / gym / league
  defTile('u', {}, p => {
    p.rect(0, 0, 16, 16, TP.ruin); p.hline(0, 15, 0, TP.ruinD); for (let y = 0; y < 16; y++) p.px(0, y, TP.ruinD);
    p.hline(1, 15, 1, TP.ruinL); p.px(6, 9, TP.ruinD); p.px(11, 5, TP.ruinD);
  });
  defTile('U', { solid: true }, p => {
    p.rect(0, 0, 16, 16, '#6c5c48');
    for (let y = 0; y < 16; y += 5) { p.hline(0, 15, y, '#4c3c2c'); for (let x = (y % 10 ? 4 : 0); x < 16; x += 8) for (let k = 0; k < 5; k++) p.px(x, y + k, '#4c3c2c'); }
    p.hline(0, 15, 1, '#8c7c64');
  });
  defTile('g', {}, p => {
    p.rect(0, 0, 16, 16, TP.gym); p.rect(0, 0, 8, 8, '#dce0ec'); p.rect(8, 8, 8, 8, '#dce0ec'); p.hline(0, 15, 15, TP.gymD); for (let y = 0; y < 16; y++) p.px(15, y, TP.gymD);
  });
  defTile('G', { solid: true }, p => {
    p.rect(0, 0, 16, 16, TP.gym);
    p.part(E(8, 9, 7, 6), '#a08870', { ol: '#403020' }); p.px(5, 6, '#d0c0a8'); p.px(6, 5, '#d0c0a8');
  });
  defTile('Z', { solid: true }, p => {  // gym statue
    p.rect(0, 0, 16, 16, TP.gym);
    p.part(R(3, 10, 10, 5), '#8890a8'); p.part(E(8, 6, 4, 5), '#c8ccdc'); p.px(7, 4, '#ffffff');
  });
  defTile('r', {}, p => {
    p.rect(0, 0, 16, 16, '#c02840'); p.rect(0, 0, 2, 16, '#e8c048'); p.rect(14, 0, 2, 16, '#e8c048'); p.px(7, 7, '#d84058');
  });
  defTile('R', {}, p => { p.rect(0, 0, 16, 16, '#2a2440'); for (let i = 0; i < 4; i++) p.px(Math.floor(hsh(i, 91) * 16), Math.floor(hsh(i, 92) * 16), '#3a3458'); p.hline(0, 15, 15, '#1a1630'); });
  defTile('x', { solid: true }, p => p.rect(0, 0, 16, 16, '#000000'));
  defTile('h', { solid: true, water: true }, (p, f) => {  // hot spring
    p.rect(0, 0, 16, 16, '#78c8e0');
    for (let i = 0; i < 3; i++) p.px((i * 5 + f * 2) % 16, (i * 6 + 3) % 16, '#e0ffff');
  }, 4);
}
buildTiles();
const tileAt = (ch) => TILE_DEF[ch] || TILE_DEF['.'];

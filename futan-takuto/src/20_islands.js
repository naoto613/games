// ================================================================ island layouts (north = -z)
const Puzzle = {};
function buildIslands() {
  // ---------- ふーたんの しま (home)
  const H = defIsland({ id: 'home', name: 'ふーたんの しま', sub: 'おたんじょうびの しま', x: 0, z: 0, R: 64, pal: 'green',
    blobs: [[0, 0, 64, 0.9, 14], [0, -4, 50, 2.4, 5], [-20, -22, 15, 8, 3.5], [24, -18, 9, 4.6, 3]],
    ramps: [[-6, -8, 2.4, -15, -15, 8, 2.8], [13, -12, 2.4, 19, -16, 4.6, 2.4]],
    dock: { x: 0, z: 63, a: 0 }, spawn: { x: 0, z: 20 } });
  buildTerrain(H);
  house(H, 12, 6, 0.3, { chimney: true });
  house(H, -16, 9, -0.4, { r: 5, wall: 0xe8d8b8, roof: 0xc87a3a, roof2: 0xa86428 });
  house(H, 30, 2, 1.2, { r: 3.6, wall: 0xf0e6d0 });
  stall(H, 20, 22, -0.5);
  [[-6, 16], [-8, 20]].forEach(([x, z]) => dummy(H, x, z));
  [[16, 11], [8, 12.5], [17.5, 8], [-11, 14], [33, 6]].forEach(([x, z]) => pot(H, x, z));
  for (let i = 0; i < 9; i++) { const a = i / 9 * TAU + 0.3; palm(H, Math.cos(a) * 54, Math.sin(a) * 54, 1 + (i % 3) * 0.12, 0.3); }
  [[-30, 0], [-28, 16], [26, -30], [-4, -30], [34, -12], [-36, -10], [8, -34]].forEach(([x, z], i) => tree(H, x, z, 1 + (i % 2) * 0.2));
  [[-24, -26], [-17, -19], [-21, -17]].forEach(([x, z]) => flowers(H, x, z, 5));
  [[4, 28], [-24, 26], [6, -16], [28, -4], [-32, 6]].forEach(([x, z]) => flowers(H, x, z, 3));
  for (let i = 0; i < 18; i++) { const a = i * 2.39, r = 14 + (i * 7) % 28; const x = Math.cos(a) * r, z = Math.sin(a) * r; if (Math.hypot(x - 12, z - 6) > 7 && Math.hypot(x + 16, z - 9) > 8 && Math.hypot(x - 20, z - 22) > 4) grass(H, x, z); }
  rock(H, 38, 30, 1.6); rock(H, -40, 28, 1.3); rock(H, 46, -20, 1.8);
  sign(H, 5, 44, 0, 'ここは <b>ふーたんの しま</b>。<br>みなみの さんばしから うみへ でられるよ。');
  sign(H, 18, 17, 0.2, '<b>おみせ</b> ─ キラキラで おかいもの できるよ！');
  pier(H, 0, 47, 0, 60);
  H.rickySpot = { x: -20, z: -24 };
  // ---------- もりの しま
  const F = defIsland({ id: 'forest', name: 'もりの しま', sub: 'おおきな きの すむ しま', x: -430, z: -230, R: 58, pal: 'forest',
    blobs: [[0, 0, 58, 0.9, 13], [0, 0, 46, 2.6, 4], [6, -10, 13, 12, 2], [30, -30, 4.2, 7, 1.0]],
    ramps: [[-16, 6, 2.6, -14, -14, 7, 3], [-14, -14, 7, -2, -20, 12, 3]],
    dock: { x: 0, z: 58, a: 0 }, spawn: { x: 0, z: 40 } });
  buildTerrain(F);
  Puzzle.deku = dekuTree(F, -6, 22);
  for (let i = 0; i < 26; i++) {
    const a = i * 2.17 + 0.4, r = 22 + (i * 11) % 20; const x = Math.cos(a) * r, z = Math.sin(a) * r;
    if (Math.hypot(x + 6, z - 22) < 10 || Math.hypot(x - 6, z + 10) < 16 || Math.hypot(x - 30, z + 30) < 8 || Math.abs(x) < 4 && z > 30) continue;
    if (Math.hypot(x + 15, z + 4) < 6) continue;
    tree(F, x, z, 1.1 + (i % 3) * 0.2, i % 2 ? 0x3ea830 : 0x52bf3c);
  }
  for (let i = 0; i < 8; i++) { const a = i / 8 * TAU; palm(F, Math.cos(a) * 52, Math.sin(a) * 52, 1, 0.35); }
  [[-20, 20], [10, 30], [-26, -6], [20, 10], [16, 22], [-10, 36]].forEach(([x, z], i) => mushroom(F, x, z, 1 + (i % 2) * 0.6));
  for (let i = 0; i < 14; i++) { const a = i * 1.7, r = 10 + (i * 5) % 30; grass(F, Math.cos(a) * r + 2, Math.sin(a) * r + 14); }
  [[-4, 32], [4, 32], [12, 34]].forEach(([x, z]) => pot(F, x, z));
  sign(F, 6, 44, 0, '<b>もりの しま</b><br>デクじいさまが まもる もり。');
  pier(F, 0, 45, 0, 56);
  Puzzle.pearlG = { I: F, x: 30, z: -30, y: 7 };
  // ---------- ひの やま (fire)
  const R = defIsland({ id: 'fire', name: 'ひの やま', sub: 'りゅうの すむ かざん', x: 440, z: -270, R: 58, pal: 'fire',
    blobs: [[0, 0, 58, 0.9, 12], [0, 0, 48, 2, 3], [0, 0, 30, 5, 2], [8, -4, 18, 10, 2], [10, -6, 12, 15, 2]],
    ramps: [[-38, 10, 2, -26, -8, 5, 3], [-18, 16, 5, -2, 8, 10, 3], [16, 6, 10, 12, -2, 15, 3]],
    dock: { x: -58, z: 8, a: -Math.PI / 2 }, spawn: { x: -46, z: 8 } });
  buildTerrain(R);
  Puzzle.fire1 = fireGate(R, -28.4, -4.4, Math.atan2(-12, 18), 6.4);
  Puzzle.fire2 = fireGate(R, 14.8, 3.6, Math.atan2(4, 8), 6.4);
  Puzzle.gate = stoneGate(R, -13.2, 13.6, Math.atan2(-16, 8), 6.6);
  // block + switch
  const sw = new THREE.Group(); sw.add(at(mk(G.cyl(1.25, 1.35, 0.25, 16), 0xe8a020, 0.03), 0, 0.12, 0)); sw.add(at(mk(G.cyl(0.5, 0.5, 0.27, 3), 0xfff4c0, 0), 0, 0.14, 0));
  sw.userData.static = 1; place(R, sw, -21, 8);
  const blk = new THREE.Group(); const bm = mk(G.box(2.4, 2.4, 2.4), 0xb8a890, 0.05); bm.position.y = 1.2; blk.add(bm);
  for (const s of [-1, 1]) { const e = mk(G.box(1.2, 1.2, 0.1), 0x8a7a64, 0); e.position.set(0, 1.2, s * 1.22); blk.add(e); const e2 = mk(G.box(0.1, 1.2, 1.2), 0x8a7a64, 0); e2.position.set(s * 1.22, 1.2, 0); blk.add(e2); }
  place(R, blk, -21, 0);
  Puzzle.block = { g: blk, sw, I: R, lx: -21, lz: 0, z0: 0, z1: 8, col: addCol(R, -21, 0, 1.6), moving: 0, solved: false, push: 0 };
  [[-34, 22], [-40, -10], [26, 30], [34, -20], [0, 36], [-10, -34]].forEach(([x, z], i) => rock(R, x, z, 1.2 + (i % 3) * 0.5, 0x8a6a5a));
  [[-44, 0], [-44, 16]].forEach(([x, z]) => torch(R, x, z));
  [[-30, 18], [-24, 22], [-6, 30]].forEach(([x, z]) => pot(R, x, z));
  [[-8, -22], [-20, -16]].forEach(([x, z]) => pot(R, x, z));
  sign(R, -44, 4, -Math.PI / 2, '<b>ひの やま</b><br>てっぺんに りゅうの ルルーが すんでいる。');
  pier(R, -56, 8, -46, 8);
  // lava + smoke at summit
  const lava = new THREE.Mesh(new THREE.CircleGeometry(3.2, 20), new THREE.MeshBasicMaterial({ color: 0xff6a1a })); lava.rotation.x = -Math.PI / 2; lava.position.set(14, 15.06, -10); R.group.add(lava);
  Things.anim.push(() => lava.material.color.setHSL(0.05 + Math.sin(World.t * 2) * 0.02, 1, 0.55));
  R.smoke = { x: R.x + 14, y: 15, z: R.z - 10 };
  // ---------- くじらの いりえ (whale)
  const W = defIsland({ id: 'whale', name: 'くじらの いりえ', sub: 'やさしい くじらの うみ', x: 60, z: 430, R: 40, pal: 'green',
    blobs: [[0, 0, 40, 0.9, 10], [0, -2, 28, 2.2, 3]], dock: { x: 0, z: -40, a: Math.PI }, spawn: { x: 0, z: -26 } });
  buildTerrain(W);
  for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + 0.2; palm(W, Math.cos(a) * 32, Math.sin(a) * 32, 1.1, 0.35); }
  house(W, 6, 4, Math.PI, { r: 3.4, wall: 0xd8f0ff, roof: 0x3a8de8, roof2: 0x2a6ac8 });
  [[-8, -6], [-10, 4]].forEach(([x, z]) => pot(W, x, z));
  for (let i = 0; i < 8; i++) grass(W, Math.cos(i * 2) * 14, Math.sin(i * 2) * 14 - 2);
  flowers(W, -6, 10, 5);
  sign(W, 4, -30, Math.PI, '<b>くじらの いりえ</b><br>くじらの ジャブは きょうそうが だいすき！');
  pier(W, 0, -38, 0, -28);
  // ---------- かみさまの とう (tower)
  const T = defIsland({ id: 'tower', name: 'かみさまの とう', sub: 'うみの まんなかの いのりの ばしょ', x: 0, z: -500, R: 34, pal: 'holy',
    blobs: [[0, -24, 6, 1.8, 2], [21, 12, 6, 1.8, 2], [-21, 12, 6, 1.8, 2]], noDock: true, noShore: true });
  T.blobs.forEach(b => b.nf = true);
  buildTerrain(T);
  Puzzle.statues = [statue(T, 0, -24, 0, 0x5df05a), statue(T, 21, 12, -2.1, 0xff6a4a), statue(T, -21, 12, 2.1, 0x5ab0ff)];
  Puzzle.statues[0].g.rotation.y = 0; Puzzle.statues[1].g.rotation.y = Math.atan2(-21, -12); Puzzle.statues[2].g.rotation.y = Math.atan2(21, -12);
  // tower (rises later)
  const tw = new THREE.Group();
  tw.add(at(mk(G.cyl(9, 11, 6, 16), 0xe8e0c8, 0.08), 0, 3, 0));
  tw.add(at(mk(G.cyl(6, 7.5, 24, 16), 0xf4ecd8, 0.08), 0, 18, 0));
  for (let i = 0; i < 3; i++) tw.add(at(mk(G.cyl(7.8, 7.8, 0.8, 16), 0xe8b830, 0.04), 0, 9 + i * 7, 0));
  tw.add(at(mk(G.cone(7.5, 8, 16), 0x3a8de8, 0.08), 0, 34, 0));
  tw.add(at(mk(G.sph(1.2, 12, 10), 0xffd84a, 0.04), 0, 38.6, 0));
  tw.position.y = -50; tw.visible = false; T.group.add(tw); Puzzle.tower = tw;
  T.towerCol = addCol(T, 0, 0, 0.1); T.towerCol.on = false;
  // ---------- まものの とりで (fortress)
  const M = defIsland({ id: 'fortress', name: 'まものの とりで', sub: 'おおどり ガルガの すみか', x: 0, z: -1000, R: 72, pal: 'rock', noSand: true,
    blobs: [[0, 0, 72, 1.3, 6], [0, 15, 36, 4, 1.5], [0, -25, 24, 10, 1.5], [0, -42, 16, 17, 1.5]],
    ramps: [[0, 62, 1.3, 0, 47, 4, 4], [-26, 10, 4, -16, -20, 10, 3.2], [18, -18, 10, 8, -32, 17, 3.2]],
    dock: { x: 0, z: 70, a: 0 }, spawn: { x: 0, z: 58 } });
  buildTerrain(M);
  pier(M, 0, 60, 0, 72, 3.2, 1.4);
  // outer walls & towers
  wall(M, -30, 40, 18, 2, 6, 0x5a5666); wall(M, 30, 40, 18, 2, 6, 0x5a5666);
  towerC(M, -36, 22, 3, 9); towerC(M, 36, 22, 3, 9);
  towerC(M, -22, -40, 3.5, 16); towerC(M, 22, -40, 3.5, 16);
  [[-12, 44], [12, 44], [-34, 0], [34, 0]].forEach(([x, z]) => flag(M, x, z, 7));
  [[-8, 30], [8, 30], [-28, 28], [28, 28]].forEach(([x, z]) => torch(M, x, z));
  [[10, 36], [12, 34], [-14, 20], [-16, 22], [20, 8]].forEach(([x, z]) => pot(M, x, z));
  // barrels to hide behind
  [[-6, 22], [6, 14], [-12, 8], [14, 22], [0, 6]].forEach(([x, z]) => { const b = mk(G.cyl(0.9, 0.9, 1.8, 12), 0x8a5a34, 0.04); b.add(at(mk(G.cyl(0.95, 0.95, 0.15, 12), 0x4a4a52, 0), 0, 0.5, 0)); b.add(at(mk(G.cyl(0.95, 0.95, 0.15, 12), 0x4a4a52, 0), 0, -0.5, 0)); b.userData.static = 1; place(M, b, x, z, tH(M, x, z) + 0.9); addCol(M, x, z, 1.0); });
  // spiky fence around arena
  for (let i = 0; i < 22; i++) { const a = i / 22 * TAU; if (Math.abs(angDiff(a, Math.atan2(10, 8))) < 0.35) continue; const s = mk(G.cone(0.3, 2.4, 6), 0x3a3446, 0.03); s.userData.static = 1; place(M, s, Math.cos(a) * 15.3, -42 + Math.sin(a) * 15.3, 17 + 1.0); }
  Puzzle.nest = { I: M, x: 0, z: -53 };
  // ---------- small treasure islets
  const islets = [
    ['islet1', 'ヤシの こじま', 290, 170, 'r50'], ['islet2', 'ひだりての こじま', -320, 300, 'heart'], ['islet3', 'きたかぜの こじま', -720, -560, 'r100'],
    ['islet4', 'ひがしの こじま', 600, -720, 'heart'], ['islet5', 'みなみの こじま', 360, 600, 'r50'],
  ];
  islets.forEach(([id, name, x, z, content], i) => {
    const I = defIsland({ id, name, sub: 'ちいさな しま', x, z, R: 18, pal: 'green', blobs: [[0, 0, 18, 0.9, 7], [0, 0, 9, 1.8, 2]], dock: { x: 0, z: 19, a: 0 }, spawn: { x: 0, z: 9 } });
    buildTerrain(I); palm(I, -3, -2, 1.1, 0.4); if (i % 2) palm(I, 4, 3, 0.9, 0.3);
    chest(I, 2, -3, 0.3, id, content); grass(I, -5, 4); grass(I, 5, -5);
  });
  // ---------- sea stacks (scenery)
  [['stack1', 160, -250], ['stack2', -200, -640], ['stack3', 260, -880], ['stack4', -560, 60], ['stack5', 700, -60]].forEach(([id, x, z], i) => {
    const I = defIsland({ id, name: '', x, z, R: 14, pal: 'green', blobs: [[0, 0, 11, 13 + i * 3, 3], [3, 4, 6, 4, 2]], noDock: true });
    buildTerrain(I); tree(I, 0, 0, 1.2);
  });
  for (const I of Islands) mergeStatic(I.group, ch => ch.userData.static);
  buildShore();
}

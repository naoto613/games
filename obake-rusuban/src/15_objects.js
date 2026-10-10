// ================================================================ interactive objects (possessable things, chain props)
// pos: [x, y, z, ry] local to its floor (or function(day) -> same)
const HIDE_TXT = ['', 'ひくい', 'ふつう', 'たかい', 'あんぜん'];
const MOVE_TXT = { none: 'うごけない', sway: 'ゆれるだけ', little: 'すこし', high: 'たかい' };
function faceTex(draw) { return cTex(128, 128, draw); }
const OBJDEF = {};
function defObj(id, d) { d.id = id; OBJDEF[id] = d; }

// ---------------------------------------------------------------- living
defObj('tv', {
  name: 'テレビ', desc: 'ふるい ブラウン管テレビ。そうたは 17時の アニメを かかさない。',
  pos: d => d >= 8 ? [-4.8, 0.55, 0.5, 0] : [-7.5, 0.55, 2.7, Math.PI / 2], pick: [1.0, 0.9, 0.9], pickY: 0.42,
  host: { hide: 2, move: 'none' },
  st0: () => ({ on: false }),
  model(o) {
    const g = new THREE.Group();
    RB(g, 0.95, 0.78, 0.8, '#6a5a50', 0, 0.39, -0.05, 0.08);
    RB(g, 0.85, 0.08, 0.7, '#8a7a6a', 0, 0.8, -0.05, 0.04);
    o.scr = mesh(G.rbox(0.68, 0.52, 0.04, 0.06), new THREE.MeshStandardMaterial({ color: 0x2a3438, emissive: 0x000000, roughness: 0.3 }), false, false); at(o.scr, -0.08, 0.42, 0.36); g.add(o.scr);
    for (const yy of [0.55, 0.35]) { const k = mesh(G.cyl(0.04, 0.04, 0.05, 10), M('#c8b8a8'), false, false); k.rotation.x = Math.PI / 2; at(k, 0.36, yy, 0.36); g.add(k); }
    for (const s of [-1, 1]) { const a = mesh(G.cyl(0.012, 0.012, 0.6, 5), M('#aaa', { metalness: 0.6 }), false, false); a.rotation.z = s * 0.5; at(a, s * 0.14, 1.05, -0.1); g.add(a); }
    return g;
  },
  refresh(o) { o.scr.material.emissive.setHex(o.st.on ? 0x8ac0e8 : 0x000000); o.scr.material.emissiveIntensity = o.st.on ? 0.9 : 0; },
  tick(o, dt) { if (o.st.on) o.scr.material.emissiveIntensity = 0.75 + Math.sin(performance.now() * 0.02) * 0.08 + Math.random() * 0.06; },
  acts: [
    { id: 'on', label: 'テレビを つける', cost: 1, sound: 0.7, can: o => !o.st.on, do(o) { o.st.on = true; Sound.sfx('tv'); } },
    { id: 'off', label: 'テレビを けす', cost: 1, sound: 0.3, can: o => o.st.on, do(o) { o.st.on = false; } },
  ],
});
defObj('remocon', {
  name: 'リモコン', desc: 'テレビの リモコン。いつも テーブルの うえ。',
  pos: d => d >= 8 ? [-4.5, 0.48, 2.0, 0.3] : [-5.4, 0.48, 2.4, 0.3], pick: [0.5, 0.3, 0.6],
  host: { hide: 1, move: 'none' },
  st0: () => ({ hidden: false }),
  model(o) {
    const g = new THREE.Group();
    RB(g, 0.16, 0.05, 0.38, '#3a3a40', 0, 0.025, 0, 0.02);
    [['#e05a4a', -0.04, -0.12], ['#fff', 0.04, -0.12], ['#5a9ae0', -0.04, -0.02], ['#5ae08a', 0.04, -0.02], ['#ddd', 0, 0.08]].forEach(([c, x, z]) => { const b = mesh(G.cyl(0.022, 0.022, 0.02, 8), M(c), false, false); at(b, x, 0.055, z); g.add(b); });
    return g;
  },
  refresh(o) {
    const s = O.sofa; const sp = s ? s.pos : new V3(-3.3, 0, 2.7);
    if (o.st.hidden) o.target = new V3(sp.x + (World.layout === 'B' ? 0 : -0.1), 0.03, sp.z + (World.layout === 'B' ? -0.05 : 0.4));
    else o.target = o.home.clone();
  },
  acts: [
    { id: 'hide', label: 'ソファの 下に かくす', cost: 1, sound: 0.15, can: o => !o.st.hidden && !O.sofa.st.moved, do(o) { o.st.hidden = true; } },
  ],
});
defObj('sofa', {
  name: 'ソファ', pos: d => d >= 8 ? [-4.8, 0, 3.75, Math.PI] : [-3.3, 0, 2.7, -Math.PI / 2], pick: null,
  st0: () => ({ moved: false }),
  occ: [2.8, 1.1, 0.95],
  model(o) {
    const g = new THREE.Group(); const c1 = '#7a9a6a', c2 = '#8aac7a';
    RB(g, 2.8, 0.36, 1.05, c1, 0, 0.26, 0, 0.12);
    RB(g, 1.28, 0.2, 0.86, c2, -0.66, 0.52, 0.06, 0.1); RB(g, 1.28, 0.2, 0.86, c2, 0.66, 0.52, 0.06, 0.1);
    RB(g, 2.8, 0.7, 0.3, c1, 0, 0.68, -0.4, 0.14);
    RB(g, 0.26, 0.55, 1.05, c1, -1.38, 0.5, 0, 0.12); RB(g, 0.26, 0.55, 1.05, c1, 1.38, 0.5, 0, 0.12);
    for (const [a, b] of [[-1.25, -0.4], [1.25, -0.4], [-1.25, 0.4], [1.25, 0.4]]) RB(g, 0.1, 0.1, 0.1, '#5a3a24', a, 0.05, b, 0.03);
    return g;
  },
  refresh(o) {
    if (o.st.moved) o.target = World.layout === 'B' ? o.home.clone().add(new V3(0, 0, -0.9)) : o.home.clone().add(new V3(0, 0, -1.7));
    else o.target = o.home.clone();
  },
});
defObj('kuma', {
  name: 'くまの ぬいぐるみ', desc: 'そうたの たからもの。あんぜんだけど、そうたに だっこされると いっしょに うごく。',
  pos: d => d >= 4 ? [-7.0, 0.62, 4.5, Math.PI / 2] : (d >= 8 ? [-4.0, 0.6, 3.9, Math.PI] : [-3.4, 0.6, 3.9, -Math.PI / 2]), pick: [0.6, 0.7, 0.6], pickY: 0.3,
  floorFn: d => d >= 4 ? 2 : 1,
  host: { hide: 3, move: 'none', kind: 'plush' },
  st0: () => ({ turned: false }),
  model(o) {
    const g = new THREE.Group(); const c = '#c8905a', c2 = '#e8c098';
    const b = mesh(G.sph(0.22, 16, 12), M(c), true, false); b.scale.set(1, 1.05, 0.9); at(b, 0, 0.22, 0); g.add(b);
    const h = mesh(G.sph(0.18, 16, 12), M(c), true, false); at(h, 0, 0.52, 0.02); g.add(h);
    for (const s of [-1, 1]) { const e = mesh(G.sph(0.07, 10, 8), M(c), false, false); at(e, s * 0.13, 0.66, 0); g.add(e); const a = mesh(G.sph(0.08, 10, 8), M(c), false, false); at(a, s * 0.2, 0.25, 0.08); g.add(a); const l = mesh(G.sph(0.09, 10, 8), M(c), false, false); at(l, s * 0.12, 0.05, 0.12); g.add(l); }
    const mz = mesh(G.sph(0.08, 10, 8), M(c2), false, false); mz.scale.z = 0.7; at(mz, 0, 0.49, 0.17); g.add(mz);
    for (const s of [-1, 1]) { const e = mesh(G.sph(0.022, 8, 6), M('#222'), false, false); at(e, s * 0.07, 0.56, 0.17); g.add(e); }
    const rb = mesh(G.tor(0.07, 0.025, 6, 12), M('#e05a6a'), false, false); at(rb, 0, 0.37, 0.1); g.add(rb);
    return g;
  },
  refresh(o) { o.targetRy = o.homeRy + (o.st.turned ? Math.PI * 0.6 : 0); },
  acts: [
    { id: 'turn', label: 'むきを かえる', cost: 1, sound: 0.05, can: o => !o.st.turned, do(o) { o.st.turned = true; } },
  ],
});
function curtainModel(o, w = 1.5) {
  const g = new THREE.Group();
  const rod = mesh(G.cyl(0.03, 0.03, w + 0.3, 8), M('#8a6448'), false, false); rod.rotation.x = Math.PI / 2; at(rod, 0, 2.15, 0); g.add(rod);
  o.panels = [];
  for (const s of [-1, 1]) {
    const p = new THREE.Group(); at(p, 0, 2.12, s * w * 0.32); g.add(p);
    for (let i = 0; i < 4; i++) RB(p, 0.08, 1.75, 0.2, i % 2 ? (o.def.col2 || '#e8c0a0') : (o.def.col || '#f0d0b0'), (i % 2) * 0.05, -0.88, (i - 1.5) * 0.17 * s, 0.04);
    o.panels.push(p);
  }
  return g;
}
const curtainTick = (o, dt) => {
  const sw = o.st.sway || 0; if (sw > 0) o.st.sway = Math.max(0, sw - dt * 0.4);
  const t = performance.now() * 0.006;
  o.panels.forEach((p, i) => { p.rotation.z = Math.sin(t + i) * 0.22 * (o.st.sway || 0) + (o.possessed ? Math.sin(t * 0.5 + i) * 0.02 : 0); p.rotation.x = Math.sin(t * 0.7 + i * 2) * 0.12 * (o.st.sway || 0); });
};
defObj('curtain', {
  name: 'カーテン', desc: 'リビングの まどの カーテン。ゆれるだけだが、おなじ へやの どこへでも こっそり うつれる。',
  pos: [-7.88, 0, 4.4, 0], pick: [0.4, 1.9, 1.6], pickY: 1.2,
  host: { hide: 2, move: 'sway', kind: 'curtain' },
  st0: () => ({ sway: 0 }),
  model(o) { return curtainModel(o); },
  tick: curtainTick,
  acts: [{ id: 'sway', label: 'ふわっと ゆらす', cost: 1, sound: 0.15, do(o) { o.st.sway = 1; Sound.sfx('sway'); } }],
});
defObj('kingyo', {
  name: 'きんぎょばち', desc: 'きんぎょの「ぎんちゃん」。みずを はねさせると、ねこが びっくりする。',
  pos: [-1.6, 0.82, 0.48, 0], pick: [0.6, 0.6, 0.6], pickY: 0.25,
  host: { hide: 1, move: 'none' },
  model(o) {
    const g = new THREE.Group();
    const w = mesh(G.sph(0.24, 16, 12), new THREE.MeshStandardMaterial({ color: 0x9ad0e8, transparent: true, opacity: 0.45, roughness: 0.1 }), false, false); w.scale.y = 0.85; at(w, 0, 0.21, 0); g.add(w);
    const gl = mesh(G.sph(0.27, 18, 12), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, roughness: 0.05 }), false, false); gl.scale.y = 0.9; at(gl, 0, 0.23, 0); g.add(gl);
    o.fish = new THREE.Group(); const f = mesh(G.sph(0.06, 10, 8), M('#f06a2a'), false, false); f.scale.set(1.4, 0.9, 0.7); o.fish.add(f);
    const tl = mesh(G.cone(0.05, 0.08, 6), M('#f08a4a'), false, false); tl.rotation.z = Math.PI / 2; at(tl, -0.1, 0, 0); o.fish.add(tl);
    at(o.fish, 0, 0.2, 0); g.add(o.fish);
    return g;
  },
  tick(o, dt) { const t = performance.now() * 0.001 * (1 + (o.st.splash || 0) * 4); o.fish.position.set(Math.cos(t) * 0.1, 0.2 + Math.sin(t * 1.7) * 0.03, Math.sin(t) * 0.1); o.fish.rotation.y = -t - Math.PI / 2; if (o.st.splash) o.st.splash = Math.max(0, o.st.splash - dt); },
  st0: () => ({ splash: 0 }),
  acts: [{ id: 'splash', label: 'ぱしゃっと はねさせる', cost: 1, sound: 0.45, do(o) { o.st.splash = 2; Sound.sfx('splash'); Parts.burst(o.g.parent, o.pos.clone().add(new V3(0, 0.5, 0)), 10, { col: 0x9ad0ff, size: 0.12, life: 0.7, spd: 1.2, up: 2, g: 6 }); } }],
});
defObj('robo', {
  name: 'そうじロボット', desc: 'まるい そうじロボット。のりうつると 部屋を またいで にげられるが、おとで バレやすい。',
  pos: d => [-0.7, 0.0, 4.85, -Math.PI / 2], pick: [0.8, 0.4, 0.8], pickY: 0.1,
  host: { hide: 1, move: 'high', kind: 'robot' },
  st0: () => ({ run: false }),
  model(o) {
    const g = new THREE.Group();
    RB(g, 0.06, 0.04, 0.06, '#000', 0, 0, 0);
    const b = mesh(G.rcyl(0.34, 0.12, 0.04, 22), M('#f4f2ee'), true, false); at(b, 0, 0.08, 0); g.add(b);
    const t = mesh(G.rcyl(0.26, 0.03, 0.01, 22), M('#3a3a44'), false, false); at(t, 0, 0.15, 0); g.add(t);
    o.led = mesh(G.sph(0.03, 8, 6), new THREE.MeshBasicMaterial({ color: 0x5ae08a }), false, false); at(o.led, 0.18, 0.17, 0); g.add(o.led);
    const bp = mesh(G.tor(0.33, 0.025, 6, 20, Math.PI), M('#9a9aa4'), false, false); bp.rotation.x = Math.PI / 2; bp.rotation.z = -Math.PI / 2; at(bp, 0, 0.08, 0); g.add(bp);
    return g;
  },
  acts: [
    { id: 'go', label: 'そうじを はじめる', cost: 1, sound: 0.4, can: o => !o.st.run, do(o) { o.st.run = true; Robo.start(); } },
  ],
});
defObj('piano', {
  name: 'ピアノ', desc: 'まえに すんでいた人が のこした ピアノ。いつも ぬのが かかっている。',
  pos: d => d >= 8 ? [-7.45, 0, 3.0, Math.PI / 2] : [-6.6, 0, 0.5, 0], pick: [2.0, 1.4, 0.8], pickY: 0.7,
  host: { hide: 2, move: 'none' }, days: [6, 99],
  occ: [2.0, 0.7, 1.3],
  st0: () => ({ cloth: true }),
  model(o) {
    const g = new THREE.Group();
    RB(g, 2.0, 1.3, 0.65, '#3a2a26', 0, 0.65, 0, 0.06);
    RB(g, 2.0, 0.08, 0.38, '#3a2a26', 0, 0.75, 0.48, 0.03);
    RB(g, 1.8, 0.05, 0.22, '#f8f4ec', 0, 0.8, 0.45, 0.02);
    for (let i = 0; i < 16; i++) RB(g, 0.05, 0.05, 0.13, '#222', -0.84 + i * 0.112 + (i % 7 === 2 || i % 7 === 6 ? 99 : 0), 0.84, 0.4, 0.01);
    RB(g, 0.08, 0.75, 0.08, '#2a1a16', -0.9, 0.38, 0.5, 0.02); RB(g, 0.08, 0.75, 0.08, '#2a1a16', 0.9, 0.38, 0.5, 0.02);
    o.cloth = new THREE.Group(); g.add(o.cloth);
    RB(o.cloth, 2.1, 0.06, 0.75, '#c8b0d8', 0, 1.33, 0, 0.03);
    RB(o.cloth, 2.1, 0.7, 0.05, '#c8b0d8', 0, 1.0, 0.38, 0.02);
    RB(o.cloth, 2.1, 0.5, 0.05, '#b8a0c8', 0, 0.95, -0.36, 0.02);
    return g;
  },
  refresh(o) { o.cloth.visible = o.st.cloth; },
  acts: [
    { id: 'cloth', label: 'ぬのを ずらす', cost: 1, sound: 0.15, can: o => o.st.cloth, do(o) { o.st.cloth = false; } },
    { id: 'key', label: 'ポロンと ならす', cost: 1, sound: 0.8, can: o => !o.st.cloth, do(o) { [523, 659, 784].forEach((f, i) => setTimeout(() => Sound.sfx('piano', f), i * 150)); } },
  ],
});
defObj('radio', {
  name: 'ふるい ラジオ', desc: 'おとうさんの 実家から もってきた 木の ラジオ。',
  pos: d => d >= 9 ? [-1.6, 0.82, 0.5, 0] : [14.5, 0.9, -4.85, 0], pick: [0.7, 0.55, 0.5], pickY: 0.25, days: [8, 99],
  floorFn: () => 1,
  host: { hide: 2, move: 'none', warm: 1 },
  st0: () => ({ on: false }),
  model(o) {
    const g = new THREE.Group();
    RB(g, 0.62, 0.42, 0.32, '#9a5a2a', 0, 0.21, 0, 0.08);
    RB(g, 0.3, 0.26, 0.02, '#e8d8b0', -0.1, 0.22, 0.16, 0.02);
    for (let i = 0; i < 4; i++) RB(g, 0.26, 0.015, 0.025, '#7a4a20', -0.1, 0.13 + i * 0.06, 0.17, 0.005);
    o.dial = mesh(G.rcyl(0.06, 0.03, 0.01, 12), new THREE.MeshStandardMaterial({ color: 0xf4e4b0, emissive: 0x000000 }), false, false); o.dial.rotation.x = Math.PI / 2; at(o.dial, 0.18, 0.26, 0.16); g.add(o.dial);
    const k = mesh(G.cyl(0.035, 0.035, 0.04, 10), M('#3a2a1a'), false, false); k.rotation.x = Math.PI / 2; at(k, 0.18, 0.1, 0.17); g.add(k);
    return g;
  },
  refresh(o) { o.dial.material.emissive.setHex(o.st.on ? 0xffb040 : 0); o.dial.material.emissiveIntensity = o.st.on ? 0.8 : 0; },
  tick(o, dt) { if (o.st.on) { o._n = (o._n || 0) - dt; if (o._n < 0) { o._n = 2.2; if (o.g.visible && World.phase === 'chain') Sound.sfx('radio'); Parts.add(o.g.parent, o.pos.clone().add(new V3(rnd(-0.2, 0.2), 0.6, 0.1)), { col: 0xffe0a0, size: 0.18, vy: 0.5, life: 1.4, star: true }); } } },
  acts: [
    { id: 'on', label: 'スイッチを いれる', cost: 1, sound: 0.6, can: o => !o.st.on, do(o) { o.st.on = true; Sound.sfx('radio'); } },
    { id: 'off', label: 'スイッチを きる', cost: 1, sound: 0.2, can: o => o.st.on, do(o) { o.st.on = false; } },
  ],
});
defObj('kago', {
  name: 'せんたくかご', pos: [-2.5, 0, -2.9, 0], pick: null,
  st0: () => ({ full: false, spilled: false, letter: false }),
  model(o) {
    const g = new THREE.Group();
    const b = mesh(G.cyl(0.42, 0.34, 0.4, 16, 1, true), new THREE.MeshStandardMaterial({ color: 0xd8b878, side: THREE.DoubleSide }), true, false); at(b, 0, 0.2, 0); g.add(b);
    const bt = mesh(G.cyl(0.34, 0.34, 0.03, 16), M('#c8a868'), false, false); at(bt, 0, 0.02, 0); g.add(bt);
    o.cloths = new THREE.Group(); g.add(o.cloths);
    [['#f4f4f4', 0, 0], ['#8ab8e8', 0.15, 0.1], ['#f0a8b8', -0.15, -0.05], ['#f4e08a', 0.05, -0.18]].forEach(([c, x, z]) => { const s = mesh(G.sph(0.2, 10, 8), M(c), false, false); s.scale.y = 0.5; at(s, x, 0.38, z); o.cloths.add(s); });
    o.letterM = RB(g, 0.24, 0.02, 0.16, '#f4ecd0', 0.05, 0.5, 0.05, 0.01); o.letterM.rotation.y = 0.4;
    o.spill = new THREE.Group(); g.add(o.spill);
    [['#f4f4f4', 0.6, 0.2], ['#8ab8e8', 0.9, -0.3], ['#f0a8b8', 0.3, 0.6], ['#f4e08a', 1.1, 0.4], ['#a8d8a8', 0.7, 0.8]].forEach(([c, x, z]) => { const s = mesh(G.sph(0.26, 10, 8), M(c), false, true); s.scale.y = 0.3; at(s, x, 0.06, z); o.spill.add(s); });
    return g;
  },
  refresh(o) { o.cloths.visible = o.st.full && !o.st.spilled; o.spill.visible = o.st.spilled; o.letterM.visible = !!o.st.letter && !o.st.spilled; },
});

// ---------------------------------------------------------------- kitchen
defObj('tokei', {
  name: 'かべどけい', desc: 'だいどころの 時計。そうたは アニメの じかんを これで たしかめる。',
  pos: [2.75, 1.95, 0.12, 0], pick: [0.7, 0.7, 0.3],
  host: { hide: 2, move: 'none' },
  st0: () => ({ off: 0 }),
  model(o) {
    const g = new THREE.Group();
    const r = mesh(G.rcyl(0.34, 0.08, 0.03, 26), M('#8a5a34'), false, false); r.rotation.x = Math.PI / 2; g.add(r);
    const ft = faceTex((x, w, h) => { x.fillStyle = '#fbf6ea'; x.beginPath(); x.arc(64, 64, 62, 0, TAU); x.fill(); x.fillStyle = '#4a3428'; x.font = 'bold 20px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; for (let i = 1; i <= 12; i++) { const a = i / 12 * TAU - Math.PI / 2; x.fillText(String(i), 64 + Math.cos(a) * 46, 64 + Math.sin(a) * 46); } });
    const f = mesh(new THREE.CircleGeometry(0.29, 26), new THREE.MeshBasicMaterial({ map: ft }), false, false); at(f, 0, 0, 0.045); g.add(f);
    o.hh = new THREE.Group(); o.mh = new THREE.Group(); at(o.hh, 0, 0, 0.05); at(o.mh, 0, 0, 0.055); g.add(o.hh, o.mh);
    RB(o.hh, 0.035, 0.15, 0.01, '#3a2a20', 0, 0.065, 0, 0.005); RB(o.mh, 0.025, 0.23, 0.01, '#3a2a20', 0, 0.1, 0, 0.005);
    const c = mesh(G.sph(0.025, 8, 6), M('#c84a3a'), false, false); at(c, 0, 0, 0.06); g.add(c);
    return g;
  },
  tick(o) { const t = World.time + (o.st.off || 0); o.mh.rotation.z = -(t % 60) / 60 * TAU; o.hh.rotation.z = -((t / 60) % 12) / 12 * TAU; },
  acts: [
    { id: 'fast5', label: '5ふん すすめる', cost: 1, sound: 0.05, can: o => o.st.off < 15, do(o) { o.st.off += 5; Sound.sfx('clock'); } },
    { id: 'back', label: 'じこくを もどす', cost: 1, sound: 0.05, can: o => o.st.off > 0, do(o) { o.st.off = 0; Sound.sfx('clock'); } },
  ],
});
defObj('reizoko', {
  name: 'れいぞうこ', desc: 'なかに はいると あんぜん。でも そとの ようすは 見えず、足音だけが きこえる。',
  pos: [7.3, 0, 0.55, 0], pick: [0.95, 2.1, 0.9], pickY: 1.0,
  host: { hide: 4, move: 'none', kind: 'inner' },
  occ: [0.95, 0.9, 2.1],
  st0: () => ({ shuffled: false, pudding: true }),
  model(o) {
    const g = new THREE.Group();
    RB(g, 0.95, 2.05, 0.85, '#f0ead6', 0, 1.02, 0, 0.1);
    RB(g, 0.9, 0.02, 0.02, '#c8c0a8', 0, 1.35, 0.43, 0.01);
    RB(g, 0.06, 0.4, 0.05, '#c8c0a8', 0.36, 1.65, 0.45, 0.02); RB(g, 0.06, 0.3, 0.05, '#c8c0a8', 0.36, 1.05, 0.45, 0.02);
    const mg = mesh(G.rbox(0.18, 0.12, 0.02, 0.02), M('#e05a6a'), false, false); at(mg, -0.2, 1.75, 0.44); g.add(mg);
    const mg2 = mesh(G.rbox(0.12, 0.12, 0.02, 0.02), M('#5a9ae0'), false, false); at(mg2, 0.05, 1.6, 0.44); g.add(mg2);
    return g;
  },
  acts: [
    { id: 'shuffle', label: 'なかみを ならべかえる', cost: 1, sound: 0.1, can: o => !o.st.shuffled, do(o) { o.st.shuffled = true; } },
  ],
});
defObj('kyusu', {
  name: 'きゅうすと ゆのみ', desc: 'のりうつると あたたかくなる。かんの するどい 人には 気づかれやすい。',
  pos: [4.3, 0.8, 3.0, 0], pick: [0.7, 0.4, 0.6], pickY: 0.15,
  host: { hide: 2, move: 'little', warm: 1 },
  st0: () => ({ cups: 1, taken: false }),
  model(o) {
    const g = new THREE.Group();
    RB(g, 0.62, 0.03, 0.42, '#8a5a34', 0, 0.015, 0, 0.02);
    const pot = mesh(G.sph(0.13, 14, 10), M('#6a8a6a'), true, false); pot.scale.y = 0.85; at(pot, -0.1, 0.13, 0); g.add(pot);
    const sp = mesh(G.cyl(0.02, 0.035, 0.14, 8), M('#6a8a6a'), false, false); sp.rotation.z = -0.9; at(sp, 0.02, 0.15, 0); g.add(sp);
    const hd = mesh(G.tor(0.07, 0.015, 6, 12, Math.PI * 1.2), M('#3a3a2a'), false, false); at(hd, -0.1, 0.24, 0); g.add(hd);
    o.cups = [];
    for (let i = 0; i < 3; i++) { const c = mesh(G.cyl(0.05, 0.04, 0.09, 12), M('#e8e0d0'), false, false); at(c, 0.14 + (i % 2) * 0.12, 0.06, -0.08 + i * 0.09); g.add(c); o.cups.push(c); }
    return g;
  },
  refresh(o) { o.cups.forEach((c, i) => c.visible = i < o.st.cups); },
  acts: [
    { id: 'cups', label: 'ゆのみを ふたつ ならべる', cost: 1, sound: 0.1, can: o => o.st.cups < 2, do(o) { o.st.cups = 2; } },
  ],
});

// ---------------------------------------------------------------- hall
defObj('denwa', {
  name: 'くろでんわ', desc: 'ジリリリ…と ならすと、だれかが でる。',
  pos: [-0.55, 0.6, -0.6, Math.PI / 2], pick: [0.6, 0.5, 0.6], pickY: 0.15,
  host: { hide: 2, move: 'none' }, days: [3, 99],
  st0: () => ({ ring: 0 }),
  model(o) {
    const g = new THREE.Group();
    RB(g, 0.36, 0.14, 0.34, '#1e1e22', 0, 0.07, 0, 0.06);
    const d = mesh(G.rcyl(0.11, 0.02, 0.008, 16), M('#e8e0d0'), false, false); at(d, 0, 0.15, 0.04); g.add(d);
    o.recv = RB(g, 0.42, 0.07, 0.1, '#1e1e22', 0, 0.2, -0.08, 0.04);
    return g;
  },
  tick(o, dt) { if (o.st.ring > 0) { o.recv.position.y = 0.2 + Math.abs(Math.sin(performance.now() * 0.05)) * 0.03; } else o.recv.position.y = 0.2; },
  acts: [
    { id: 'ring', label: 'ベルを ならす', cost: 1, sound: 1, phase: 'chain', can: o => !o.st.ring, do(o) { o.st.ring = 1; Sound.sfx('ring'); } },
  ],
});
defObj('kasatate', {
  name: 'かさたて', desc: 'かさが 3本。おとうさん・おかあさん・あかりの ぶん。',
  pos: [-7.35, 0, -1.55, 0], pick: [0.5, 1.0, 0.5], pickY: 0.5,
  host: { hide: 2, move: 'none' }, days: [3, 99],
  st0: () => ({ hid: false, taken: 0 }),
  model(o) {
    const g = new THREE.Group();
    const c = mesh(G.cyl(0.18, 0.16, 0.5, 14, 1, true), new THREE.MeshStandardMaterial({ color: 0x5a7a9a, side: THREE.DoubleSide }), true, false); at(c, 0, 0.25, 0); g.add(c);
    o.umbs = [];
    [['#2a3a6a', -0.06, 0.05], ['#e86a8a', 0.07, -0.02], ['#5ab8a8', -0.01, -0.08]].forEach(([col, x, z], i) => {
      const u = new THREE.Group(); at(u, x, 0, z); u.rotation.z = (i - 1) * 0.12; g.add(u);
      const p = mesh(G.cyl(0.07, 0.03, 0.95, 8), M(col), false, false); at(p, 0, 0.55, 0); u.add(p);
      const hk = mesh(G.tor(0.05, 0.012, 6, 10, Math.PI), M('#6a4a2a'), false, false); at(hk, 0.05, 1.05, 0); u.add(hk);
      o.umbs.push(u);
    });
    return g;
  },
  refresh(o) { o.umbs.forEach((u, i) => u.visible = !(o.st.hid && i === 2) && i >= o.st.taken); },
  acts: [
    { id: 'hide', label: 'かさを 1本 かくす', cost: 1, sound: 0.1, can: o => !o.st.hid, do(o) { o.st.hid = true; } },
  ],
});
defObj('slipper', {
  name: 'スリッパ', desc: 'げんかんの スリッパ。',
  pos: [-6.3, 0, -1.6, -Math.PI / 2], pick: [0.6, 0.3, 0.6], days: [11, 99],
  host: { hide: 1, move: 'none' },
  st0: () => ({ hidden: false }),
  model(o) {
    const g = new THREE.Group(); o.sl = [];
    for (const s of [-1, 1]) { const p = new THREE.Group(); at(p, s * 0.12, 0, 0); g.add(p); RB(p, 0.14, 0.04, 0.32, '#8a9ad8', 0, 0.02, 0, 0.02); RB(p, 0.15, 0.06, 0.14, '#6a7ab8', 0, 0.06, 0.08, 0.03); o.sl.push(p); }
    return g;
  },
  refresh(o) { o.sl[1].visible = !o.st.hidden; },
  acts: [{ id: 'hide', label: 'かたほう かくす', cost: 1, sound: 0.05, can: o => !o.st.hidden, do(o) { o.st.hidden = true; } }],
});

// ---------------------------------------------------------------- washitsu
defObj('oshiire', {
  name: 'おしいれ', desc: 'なかは あんぜん。でも そとは 見えず、足音だけで 家族の いばしょを さぐる。',
  pos: [2.2, 0, -5.28, 0], pick: [2.3, 2.1, 0.4], pickY: 1.0, days: [4, 99],
  host: { hide: 4, move: 'none', kind: 'inner' },
  st0: () => ({ rattle: 0 }),
  model(o) {
    const g = new THREE.Group();
    RB(g, 2.4, 2.1, 0.16, '#8a6448', 0, 1.05, -0.02, 0.03);
    o.fs = [];
    for (const s of [-1, 1]) { const p = new THREE.Group(); at(p, s * 0.56, 0, 0.07); g.add(p); RB(p, 1.12, 1.95, 0.05, '#f4ecd8', 0, 1.05, 0, 0.02); RB(p, 1.12, 0.05, 0.06, '#8a6448', 0, 1.3, 0, 0.01); for (const yy of [0.5, 1.7]) { const c = mesh(G.rcyl(0.18, 0.01, 0.004, 14), M('#c8b8e0'), false, false); c.rotation.x = Math.PI / 2; at(c, s * 0.15, yy, 0.03); p.add(c); } o.fs.push(p); }
    return g;
  },
  tick(o, dt) { if (o.st.rattle > 0) { o.st.rattle -= dt; o.fs.forEach((p, i) => p.position.z = 0.07 + Math.sin(performance.now() * 0.06 + i) * 0.025); } },
  acts: [{ id: 'rattle', label: 'ガタガタ させる', cost: 1, sound: 0.6, do(o) { o.st.rattle = 1.2; Sound.sfx('clatter'); } }],
});
defObj('megane', {
  name: 'おばあちゃんの めがね', desc: 'ないと おばあちゃんは なにも 見えない。',
  pos: [4.5, 0.43, -2.45, 0.4], pick: [0.4, 0.3, 0.4], days: [7, 99],
  host: { hide: 1, move: 'none' },
  st0: () => ({ hidden: false }),
  model(o) {
    const g = new THREE.Group();
    for (const s of [-1, 1]) { const r = mesh(G.tor(0.055, 0.01, 6, 14), M('#7a5a3a'), false, false); r.rotation.x = Math.PI / 2; at(r, s * 0.07, 0.02, 0); g.add(r); }
    RB(g, 0.04, 0.012, 0.012, '#7a5a3a', 0, 0.02, 0, 0.004);
    return g;
  },
  refresh(o) { o.target = o.st.hidden ? new V3(5.25, 0.11, -2.6) : o.home.clone(); },
  acts: [{ id: 'hide', label: 'ざぶとんの 下へ', cost: 1, sound: 0.05, can: o => !o.st.hidden, do(o) { o.st.hidden = true; } }],
});

// ---------------------------------------------------------------- garden / shed
defObj('hoshi', {
  name: 'せんたくもの', desc: 'にわの ものほし。シーツに のりうつると ひらひら ゆれる。',
  pos: [12.0, 0, 2.2, 0], pick: [3.0, 1.8, 0.6], pickY: 1.2,
  host: { hide: 2, move: 'sway', kind: 'curtain' },
  st0: () => ({ taken: false, sway: 0 }),
  model(o) {
    const g = new THREE.Group();
    for (const s of [-1, 1]) RB(g, 0.08, 1.9, 0.08, '#8a8a90', s * 1.5, 0.95, 0, 0.03);
    const p = mesh(G.cyl(0.025, 0.025, 3.1, 8), M('#c0c0c8'), false, false); p.rotation.z = Math.PI / 2; at(p, 0, 1.85, 0); g.add(p);
    o.panels = [];
    [['#f8f8f4', -0.9, 0.9], ['#8ab8e8', 0.1, 0.6], ['#f0b0c0', 0.8, 0.5]].forEach(([c, x, h]) => { const q = new THREE.Group(); at(q, x, 1.83, 0); g.add(q); RB(q, x === -0.9 ? 0.9 : 0.5, h, 0.03, c, 0, -h / 2, 0, 0.02); o.panels.push(q); });
    return g;
  },
  tick: curtainTick,
  refresh(o) { o.panels.forEach(p => p.visible = !o.st.taken); },
  acts: [{ id: 'sway', label: 'ひらひら させる', cost: 1, sound: 0.1, do(o) { o.st.sway = 1; } }],
});
defObj('hako', {
  name: 'だんボールの 山', desc: 'ものおきの だんボール。おくに なにか ありそう。',
  pos: [14.6, 0, -3.4, 0], pick: [1.2, 1.4, 1.0], pickY: 0.6, days: [8, 8],
  host: { hide: 3, move: 'none' },
  st0: () => ({ fallen: false }),
  model(o) {
    const g = new THREE.Group(); o.bx = [];
    [[0, 0.3, 0, 0.9, 0.6, 0.7], [0.05, 0.85, 0.02, 0.7, 0.5, 0.6], [-0.05, 1.28, 0, 0.5, 0.36, 0.45]].forEach(([x, y, z, w, h, d], i) => { const b = RB(g, w, h, d, i % 2 ? '#c8a070' : '#b88c5a', x, y, z, 0.03); RB(b, w * 0.9, 0.04, 0.12, '#e8d8b0', 0, h / 2, 0, 0.01); o.bx.push(b); b.userData.p0 = b.position.clone(); });
    return g;
  },
  refresh(o) { o.bx.forEach((b, i) => { if (o.st.fallen) { b.position.set(b.userData.p0.x + 0.5 + i * 0.25, b.userData.h0 || (0.3 - (i ? 0 : 0)), b.userData.p0.z + 0.5 + i * 0.2); b.position.y = i === 0 ? 0.3 : 0.25; b.rotation.y = i * 0.6; b.rotation.z = i ? 0.2 : 0; } else { b.position.copy(b.userData.p0); b.rotation.set(0, 0, 0); } }); },
  acts: [{ id: 'fall', label: 'がらがらっと くずす', cost: 1, sound: 0.8, can: o => !o.st.fallen, do(o) { o.st.fallen = true; Sound.sfx('thud'); } }],
});
defObj('tegami', {
  name: 'ふるい 手紙', desc: 'ものおきの おくに あった 手紙の たば。なぜか なつかしい。',
  pos: d => d >= 14 ? [7.4, 0.77, 2.5, -Math.PI / 2] : [16.8, 0.62, -4.7, 0], floorFn: d => d >= 14 ? 2 : 1, pick: [0.6, 0.4, 0.5], days: [8, 99],
  host: { hide: 2, move: 'little', warm: 1 },
  st0: () => ({ glow: false, flown: false }),
  model(o) {
    const g = new THREE.Group();
    RB(g, 0.5, 0.18, 0.36, '#7a5a3a', 0, 0.09, 0, 0.03);
    o.env = new THREE.Group(); g.add(o.env);
    RB(o.env, 0.34, 0.03, 0.22, '#f4ecd0', 0, 0.2, 0, 0.01); const s = mesh(G.cyl(0.03, 0.03, 0.01, 10), M('#c84a3a'), false, false); at(s, 0, 0.22, 0); o.env.add(s);
    o.glowS = new THREE.Sprite(new THREE.SpriteMaterial({ map: Parts.tex, color: 0xffe8a0, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, opacity: 0 })); o.glowS.scale.set(1.2, 1.2, 1.2); at(o.glowS, 0, 0.3, 0); g.add(o.glowS);
    return g;
  },
  refresh(o) { o.env.visible = !o.st.flown; },
  tick(o) { o.glowS.material.opacity = o.st.glow ? 0.5 + Math.sin(performance.now() * 0.004) * 0.25 : 0; },
  acts: [
    { id: 'glow', label: 'ぼんやり ひからせる', cost: 1, sound: 0.05, can: o => !o.st.glow, do(o) { o.st.glow = true; } },
    { id: 'fly', label: 'ふわっと とばす', cost: 1, sound: 0.1, can: o => !o.st.flown && !o.st.landed && World.day >= 10 && World.day < 14, do(o) { o.st.landed = 1; o.target = World.doorOpen('d_sh') ? new V3(15.4, 0.02, -0.5) : new V3(16.0, 0.05, -3.0); } },
  ],
});

// ---------------------------------------------------------------- 2F kodomo
defObj('randoseru', {
  name: 'ランドセル', desc: 'そうたの ランドセル。なかは あんぜんだが、そとは 見えない。',
  pos: [-0.75, 0, 0.6, 0], pick: [0.55, 0.65, 0.5], pickY: 0.3, floorFn: () => 2, days: [4, 99],
  host: { hide: 4, move: 'none', kind: 'inner' },
  model(o) {
    const g = new THREE.Group();
    RB(g, 0.48, 0.55, 0.3, '#d0383a', 0, 0.3, 0, 0.1);
    RB(g, 0.5, 0.3, 0.32, '#b02a2c', 0, 0.48, 0.02, 0.1);
    const b = mesh(G.rbox(0.1, 0.06, 0.02, 0.02), M('#d8b048'), false, false); at(b, 0, 0.36, 0.18); g.add(b);
    return g;
  },
});
defObj('bidama', {
  name: 'ビーだま', desc: 'ころがすと、ドアの そとへ。かいだんを ころころ おちていく。',
  pos: [-4.4, 0, 2.2, 0], pick: [0.6, 0.3, 0.6], floorFn: () => 2, days: [4, 99],
  host: { hide: 1, move: 'little' },
  st0: () => ({ rolled: false }),
  model(o) {
    const g = new THREE.Group();
    ['#5ab8e8', '#e85a7a', '#7ae05a', '#e8c84a', '#b07ae8'].forEach((c, i) => { const m = mesh(G.sph(0.06, 10, 8), new THREE.MeshStandardMaterial({ color: c, roughness: 0.1, transparent: true, opacity: 0.85 }), false, false); at(m, Math.cos(i * 1.3) * 0.13, 0.06, Math.sin(i * 1.3) * 0.13); g.add(m); });
    return g;
  },
  acts: [{ id: 'roll', label: 'ころがす', cost: 1, sound: 0.5, can: o => !o.st.rolled, do(o) { o.st.rolled = true; Sound.sfx('roll'); Marbles.start(o); } }],
});
defObj('mezamashi', {
  name: 'めざまし時計', desc: 'そうたの めざまし。ならすと、下の 部屋まで きこえる。',
  pos: [-2.15, 0.77, 0.4, 0.2], pick: [0.4, 0.4, 0.4], floorFn: () => 2, days: [4, 99],
  host: { hide: 2, move: 'none' },
  st0: () => ({ ring: 0 }),
  model(o) {
    const g = new THREE.Group();
    const b = mesh(G.rcyl(0.12, 0.08, 0.03, 18), M('#e8584a'), false, false); b.rotation.x = Math.PI / 2; at(b, 0, 0.14, 0); g.add(b);
    const f = mesh(new THREE.CircleGeometry(0.09, 16), MB('#fffaf0'), false, false); at(f, 0, 0.14, 0.045); g.add(f);
    for (const s of [-1, 1]) { const bl = mesh(G.sph(0.05, 10, 8, 0, TAU, 0, Math.PI / 2), M('#d8b048', { metalness: 0.5 }), false, false); at(bl, s * 0.07, 0.25, 0); bl.rotation.z = -s * 0.5; g.add(bl); }
    for (const s of [-1, 1]) RB(g, 0.02, 0.06, 0.02, '#333', s * 0.07, 0.03, 0, 0.005);
    return g;
  },
  tick(o, dt) { if (o.st.ring > 0) { o.g.rotation.z = Math.sin(performance.now() * 0.08) * 0.12; o._n = (o._n || 0) - dt; if (o._n < 0) { o._n = 0.9; if (World.phase === 'chain') Sound.sfx('alarm'); } } else o.g.rotation.z = 0; },
  acts: [{ id: 'ring', label: 'ジリリリ！と ならす', cost: 1, sound: 0.9, can: o => !o.st.ring, do(o) { o.st.ring = 1; Sound.sfx('alarm'); } }],
});
defObj('kaichu', {
  name: 'かいちゅうでんとう', desc: 'そうたが さがしものに つかう。かくすと ライトで てらされない。',
  pos: [-1.1, 0.77, 0.75, 1.2], pick: [0.4, 0.3, 0.4], floorFn: () => 2, days: [4, 99],
  host: { hide: 1, move: 'none' },
  st0: () => ({ hidden: false }),
  model(o) {
    const g = new THREE.Group();
    const b = mesh(G.cyl(0.04, 0.04, 0.24, 10), M('#f4c84a'), false, false); b.rotation.z = Math.PI / 2; at(b, 0, 0.04, 0); g.add(b);
    const h = mesh(G.cyl(0.06, 0.045, 0.08, 12), M('#e8a83a'), false, false); h.rotation.z = Math.PI / 2; at(h, 0.15, 0.05, 0); g.add(h);
    return g;
  },
  refresh(o) { o.target = o.st.hidden ? new V3(-6.6, 0.02, 2.3) : o.home.clone(); },
  acts: [{ id: 'hide', label: 'ベッドの 下へ', cost: 1, sound: 0.05, can: o => !o.st.hidden, do(o) { o.st.hidden = true; } }],
});
defObj('e', {
  name: 'そうたの え', desc: 'クレヨンで かいた え。',
  pos: [-1.9, 0.77, 0.55, 0], pick: [0.6, 0.2, 0.5], floorFn: () => 2, days: [4, 99],
  host: { hide: 2, move: 'none' },
  st0: () => ({ rolled: false, drawn: false }),
  model(o) {
    const g = new THREE.Group();
    o.paper = mesh(G.box(0.5, 0.01, 0.36), new THREE.MeshStandardMaterial({ map: cTex(128, 96, (x, w, h) => { x.fillStyle = '#fffaf0'; x.fillRect(0, 0, w, h); x.strokeStyle = '#5a8ad8'; x.lineWidth = 4; x.beginPath(); x.arc(40, 50, 16, 0, TAU); x.stroke(); x.fillStyle = '#f4c84a'; x.beginPath(); x.arc(104, 18, 10, 0, TAU); x.fill(); x.fillStyle = '#5aa85a'; x.fillRect(0, 84, w, 12); x.fillStyle = '#e8584a'; x.fillRect(70, 50, 20, 34); }) }), false, false); at(o.paper, 0, 0.005, 0); g.add(o.paper);
    o.cr = []; ['#e8584a', '#5a8ad8', '#f4c84a'].forEach((c, i) => { const k = mesh(G.cyl(0.015, 0.015, 0.14, 6), M(c), false, false); k.rotation.z = Math.PI / 2; at(k, 0.1, 0.02, -0.25 - i * 0.04); g.add(k); o.cr.push(k); });
    return g;
  },
  acts: [{ id: 'roll', label: 'クレヨンを ころがす', cost: 1, sound: 0.15, can: o => !o.st.rolled, do(o) { o.st.rolled = true; o.cr.forEach((k, i) => k.position.x = 0.3 + i * 0.05); } }],
});

// ---------------------------------------------------------------- 2F shinshitsu
defObj('pc', {
  name: 'おかあさんの パソコン', desc: 'ほんやくの しごと用。でんげんを きると…？',
  pos: [7.45, 0.75, 1.6, -Math.PI / 2], pick: [0.8, 0.7, 0.9], pickY: 0.3, floorFn: () => 2, days: [5, 99],
  host: { hide: 2, move: 'none', warm: 1 },
  st0: () => ({ off: false }),
  model(o) {
    const g = new THREE.Group();
    RB(g, 0.55, 0.45, 0.45, '#e8e0cc', 0, 0.3, -0.1, 0.06);
    o.scr = mesh(G.rbox(0.42, 0.32, 0.02, 0.03), new THREE.MeshStandardMaterial({ color: 0x2a4a6a, emissive: 0x6a9ad8, emissiveIntensity: 0.6 }), false, false); at(o.scr, 0, 0.32, 0.13); g.add(o.scr);
    RB(g, 0.5, 0.03, 0.18, '#e8e0cc', 0, 0.02, 0.32, 0.02);
    return g;
  },
  refresh(o) { o.scr.material.emissiveIntensity = o.st.off ? 0 : 0.6; },
  acts: [{ id: 'off', label: 'でんげんを きる', cost: 1, sound: 0.15, can: o => !o.st.off, do(o) { o.st.off = true; } }],
});
defObj('tansu2', {
  name: 'ようふくだんす', desc: 'なかは あんぜん。そとは 見えない。',
  pos: [3.0, 0, 0.42, 0], pick: [1.6, 1.7, 0.6], pickY: 0.8, floorFn: () => 2, days: [4, 99],
  host: { hide: 4, move: 'none', kind: 'inner' },
  occ: [1.6, 0.6, 1.7],
  model(o) {
    const g = new THREE.Group();
    RB(g, 1.6, 1.7, 0.6, '#9a6a44', 0, 0.85, 0, 0.05);
    RB(g, 0.02, 1.5, 0.02, '#6a4a2a', 0, 0.9, 0.31, 0.01);
    for (const s of [-1, 1]) RB(g, 0.04, 0.2, 0.04, '#d8b048', s * 0.08, 0.95, 0.32, 0.01);
    return g;
  },
});
defObj('nekutai', {
  name: 'ネクタイかけ', desc: 'おとうさんの ネクタイ。',
  pos: [1.2, 1.4, 0.12, 0], pick: [0.6, 0.6, 0.3], floorFn: () => 2, days: [11, 99],
  host: { hide: 2, move: 'none' },
  st0: () => ({ hidden: false }),
  model(o) {
    const g = new THREE.Group();
    RB(g, 0.5, 0.04, 0.06, '#8a6448', 0, 0, 0, 0.01);
    o.ties = []; ['#3a5a9a', '#9a3a4a'].forEach((c, i) => { const t = RB(g, 0.08, 0.5, 0.02, c, -0.1 + i * 0.2, -0.27, 0.03, 0.02); o.ties.push(t); });
    return g;
  },
  refresh(o) { o.ties[0].visible = !o.st.hidden; },
  acts: [{ id: 'hide', label: 'ネクタイを かくす', cost: 1, sound: 0.05, can: o => !o.st.hidden, do(o) { o.st.hidden = true; } }],
});

// ---------------------------------------------------------------- 2F hall2
defObj('denki', {
  name: 'ろうかの でんき', desc: '2かいの ろうかは くらくて、そうたは こわがる。',
  pos: [-0.12, 1.3, -3.6, -Math.PI / 2], pick: [0.3, 0.5, 0.5], floorFn: () => 2, days: [4, 99],
  host: { hide: 2, move: 'none' },
  st0: () => ({ on: false }),
  model(o) {
    const g = new THREE.Group();
    RB(g, 0.16, 0.24, 0.03, '#f4f0e4', 0, 0, 0, 0.02);
    o.sw = RB(g, 0.06, 0.08, 0.03, '#d8d0c0', 0, 0, 0.02, 0.01);
    return g;
  },
  refresh(o) { o.sw.rotation.x = o.st.on ? -0.4 : 0.4; World.hallLight && World.hallLight(o.st.on); },
  acts: [
    { id: 'on', label: 'でんきを つける', cost: 1, sound: 0.05, can: o => !o.st.on, do(o) { o.st.on = true; } },
    { id: 'off', label: 'でんきを けす', cost: 1, sound: 0.05, can: o => o.st.on, do(o) { o.st.on = false; } },
  ],
});

// ---------------------------------------------------------------- 2F akari
defObj('camera', {
  name: 'あかりの カメラ', desc: '写真部の フィルムカメラ。',
  pos: [1.8, 0.77, -5.0, 0.3], pick: [0.4, 0.3, 0.4], floorFn: () => 2, days: [5, 99],
  host: { hide: 2, move: 'none' },
  st0: () => ({ shot: 0 }),
  model(o) {
    const g = new THREE.Group();
    RB(g, 0.3, 0.18, 0.12, '#2a2a30', 0, 0.09, 0, 0.03);
    const l = mesh(G.cyl(0.06, 0.06, 0.08, 14), M('#4a4a50'), false, false); l.rotation.x = Math.PI / 2; at(l, 0, 0.09, 0.09); g.add(l);
    const gl = mesh(G.cyl(0.045, 0.045, 0.01, 14), M('#5a7aa8', { roughness: 0.1 }), false, false); gl.rotation.x = Math.PI / 2; at(gl, 0, 0.09, 0.135); g.add(gl);
    RB(g, 0.06, 0.04, 0.06, '#c8c8c8', 0.1, 0.2, 0, 0.01);
    return g;
  },
  acts: [{ id: 'shoot', label: 'シャッターを きる', cost: 1, sound: 0.3, do(o) { o.st.shot++; Sound.sfx('shutter'); flashAt(o); } }],
});
defObj('album', {
  name: 'アルバム', desc: 'あかりの アルバム。ひみつの 写真が はいっている。',
  pos: [2.9, 0.77, -5.0, 0], pick: [0.5, 0.2, 0.4], floorFn: () => 2, days: [5, 99],
  host: { hide: 2, move: 'none' },
  st0: () => ({ open: false }),
  model(o) {
    const g = new THREE.Group();
    o.closed = RB(g, 0.34, 0.07, 0.26, '#5a8a6a', 0, 0.035, 0, 0.02);
    o.opened = new THREE.Group(); g.add(o.opened);
    const pt = cTex(128, 64, (x, w, h) => { x.fillStyle = '#fffaf0'; x.fillRect(0, 0, w, h); const c = ['#e8b8a0', '#a8c8e8', '#e8d8a0', '#c8e8b8']; for (let i = 0; i < 4; i++) { x.fillStyle = '#fff'; x.fillRect(8 + (i % 2) * 30 + (i > 1 ? 64 : 0), 8 + (i % 2) * 22, 26, 22); x.fillStyle = c[i]; x.fillRect(10 + (i % 2) * 30 + (i > 1 ? 64 : 0), 10 + (i % 2) * 22, 22, 16); } x.fillStyle = '#ccc'; x.fillRect(63, 0, 2, h); });
    const p = mesh(G.box(0.66, 0.02, 0.26), new THREE.MeshStandardMaterial({ map: pt }), false, false); at(p, 0, 0.012, 0); o.opened.add(p);
    return g;
  },
  refresh(o) { o.closed.visible = !o.st.open; o.opened.visible = o.st.open; },
  acts: [{ id: 'open', label: 'ぱらっと ひらく', cost: 1, sound: 0.1, can: o => !o.st.open, do(o) { o.st.open = true; Sound.sfx('page'); } }],
});
defObj('juden', {
  name: 'スマホの じゅうでんき', desc: 'ぬいておくと、あかりの スマホの でんちが きれる。',
  pos: [7.6, 0.25, -3.1, -Math.PI / 2], pick: [0.4, 0.4, 0.4], floorFn: () => 2, days: [5, 99],
  host: { hide: 1, move: 'none' },
  st0: () => ({ unplug: false }),
  model(o) {
    const g = new THREE.Group();
    RB(g, 0.12, 0.18, 0.03, '#f4f0e4', 0, 0, 0, 0.02);
    o.plug = RB(g, 0.06, 0.08, 0.06, '#fff', 0, 0, 0.05, 0.01);
    const c = mesh(G.cyl(0.01, 0.01, 0.4, 5), M('#fff'), false, false); at(c, 0, -0.2, 0.06); o.plug.add(c);
    return g;
  },
  refresh(o) { o.plug.position.set(o.st.unplug ? 0.18 : 0, o.st.unplug ? -0.2 : 0, 0.05); o.plug.rotation.z = o.st.unplug ? 1.2 : 0; },
  acts: [{ id: 'unplug', label: 'プラグを ぬく', cost: 1, sound: 0.05, can: o => !o.st.unplug, do(o) { o.st.unplug = true; } }],
});
defObj('hondana', {
  name: 'あかりの 本だな', desc: 'まんがや 写真の 本が ぎっしり。おとすと 下の 部屋まで ひびく。',
  pos: [0.6, 0, -1.0, Math.PI / 2], pick: [0.6, 1.6, 1.2], pickY: 0.8, floorFn: () => 2, days: [7, 99],
  host: { hide: 2, move: 'none' },
  occ: [0.5, 1.2, 1.6],
  st0: () => ({ fallen: false }),
  model(o) {
    const g = new THREE.Group();
    RB(g, 1.2, 1.6, 0.45, '#c8a07a', 0, 0.8, 0, 0.04);
    for (let r = 0; r < 3; r++) RB(g, 1.1, 0.04, 0.4, '#a8805a', 0, 0.35 + r * 0.45, 0.02, 0.01);
    o.books = new THREE.Group(); g.add(o.books);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 6; i++) RB(o.books, 0.13, 0.34, 0.3, ['#e86a6a', '#6a9ae8', '#f4c84a', '#7ac87a', '#c88ae8'][(i + r) % 5], -0.4 + i * 0.16, 0.55 + r * 0.45, 0.04, 0.01);
    o.pile = new THREE.Group(); g.add(o.pile);
    for (let i = 0; i < 7; i++) { const b = RB(o.pile, 0.32, 0.06, 0.24, ['#e86a6a', '#6a9ae8', '#f4c84a', '#7ac87a'][i % 4], rnd(-0.5, 0.5), 0.03 + (i % 3) * 0.06, 0.6 + rnd(0, 0.5), 0.01); b.rotation.y = rnd(0, 3); }
    return g;
  },
  refresh(o) { o.books.children.forEach((b, i) => b.visible = !o.st.fallen || i >= 6); o.pile.visible = o.st.fallen; },
  acts: [{ id: 'drop', label: 'ほんを どさっと おとす', cost: 1, sound: 0.9, can: o => !o.st.fallen, do(o) { o.st.fallen = true; Sound.sfx('thud'); setTimeout(() => Sound.sfx('clatter'), 120); } }],
});
defObj('curtain2', {
  name: 'あかりの へやの カーテン', desc: 'ゆれるだけだが、おなじ へやの どこへでも こっそり うつれる。', col: '#f4c8d4', col2: '#f8d8e0',
  pos: [7.88, 0, -3.3, 0], pick: [0.4, 1.9, 1.6], pickY: 1.2, floorFn: () => 2, days: [4, 99],
  host: { hide: 2, move: 'sway', kind: 'curtain' },
  st0: () => ({ sway: 0 }),
  model(o) { return curtainModel(o, 1.4); },
  tick: curtainTick,
  acts: [{ id: 'sway', label: 'ふわっと ゆらす', cost: 1, sound: 0.15, do(o) { o.st.sway = 1; Sound.sfx('sway'); } }],
});
defObj('curtain3', {
  name: 'そうたの へやの カーテン', desc: 'ゆれるだけだが、おなじ へやの どこへでも こっそり うつれる。', col: '#b8d8f0', col2: '#cfe4f4',
  pos: [-7.88, 0, 1.4, 0], pick: [0.4, 1.9, 1.4], pickY: 1.2, floorFn: () => 2, days: [4, 99],
  host: { hide: 2, move: 'sway', kind: 'curtain' },
  st0: () => ({ sway: 0 }),
  model(o) { return curtainModel(o, 1.2); },
  tick: curtainTick,
  acts: [{ id: 'sway', label: 'ふわっと ゆらす', cost: 1, sound: 0.15, do(o) { o.st.sway = 1; Sound.sfx('sway'); } }],
});

// doors become possessable objects too
for (const [id, d] of Object.entries(DOORS)) {
  if (d.kind === 'open' || d.ext || d.noWall) continue;
  const m = (d.a + d.b) / 2;
  defObj('door_' + id, {
    name: d.name, desc: 'しめると、むこうの 部屋の 音や 視線が とどきにくくなる。', door: id, days: id === 'd_sh' ? [8, 99] : [1, 99],
    pos: d.axis === 'x' ? [d.c, 0, m, 0] : [m, 0, d.c, 0], floorFn: () => d.floor, pick: d.axis === 'x' ? [0.4, 2.1, d.b - d.a] : [d.b - d.a, 2.1, 0.4], pickY: 1.05,
    room: d.rooms[0] === 'outside' ? d.rooms[1] : d.rooms[0], rooms: d.rooms,
    host: { hide: 2, move: 'none', kind: 'door' },
    model() { return new THREE.Group(); },
    acts: [
      { id: 'close', label: 'しめる', cost: 1, sound: 0.4, can: o => World.doorOpen(id), do(o) { World.setDoor(id, false); Sound.sfx('door'); } },
      { id: 'open', label: 'あける', cost: 1, sound: 0.3, can: o => !World.doorOpen(id), do(o) { World.setDoor(id, true); Sound.sfx('door'); } },
    ],
  });
}

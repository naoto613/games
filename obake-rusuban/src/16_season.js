// ================================================================ seasonal things + how every thing can scare
// ---- new models
defObj('hashira', {
  name: 'はしらどけい', pos: [2.55, 0, 0.32, 0], pick: [0.7, 2.0, 0.5], pickY: 1.0,
  host: { hide: 2, move: 'none' }, occ: [0.6, 0.4, 1.9],
  model(o) {
    const g = new THREE.Group();
    RB(g, 0.62, 1.9, 0.36, '#7a4a2a', 0, 0.95, 0, 0.05);
    RB(g, 0.7, 0.12, 0.42, '#5a3420', 0, 1.92, 0, 0.04);
    const ft = cTex(128, 128, (x) => { x.fillStyle = '#fbf3de'; x.beginPath(); x.arc(64, 64, 60, 0, TAU); x.fill(); x.fillStyle = '#4a3428'; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; x.fillRect(64 + Math.cos(a) * 48 - 3, 64 + Math.sin(a) * 48 - 3, 6, 6); } });
    const f = mesh(new THREE.CircleGeometry(0.22, 24), new THREE.MeshBasicMaterial({ map: ft }), false, false); at(f, 0, 1.55, 0.19); g.add(f);
    o.hand = RB(g, 0.02, 0.16, 0.01, '#2a1a10', 0, 1.62, 0.2, 0.005);
    RB(g, 0.4, 0.8, 0.02, '#dfeef4', 0, 0.75, 0.18, 0.02);
    o.pend = new THREE.Group(); at(o.pend, 0, 1.15, 0.12); g.add(o.pend);
    RB(o.pend, 0.02, 0.5, 0.02, '#c8a048', 0, -0.25, 0, 0.005);
    const bob = mesh(G.rcyl(0.08, 0.02, 0.01, 14), M('#e0b850', { metalness: 0.5, roughness: 0.3 }), false, false); bob.rotation.x = Math.PI / 2; at(bob, 0, -0.52, 0); o.pend.add(bob);
    return g;
  },
  tick(o, dt) { const k = 1 + (o.st.ring || 0) * 3; o.pend.rotation.z = Math.sin(performance.now() * 0.003) * 0.18 * k; if (o.st.ring) o.st.ring = Math.max(0, o.st.ring - dt * 0.5); o.hand.rotation.z = -(World.time % 60) / 60 * TAU; },
});
defObj('hina', {
  name: 'ひなにんぎょう', pos: () => [-1.7, 0, 4.7, Math.PI], pick: [1.3, 1.1, 0.8], pickY: 0.5,
  host: { hide: 2, move: 'none' },
  model(o) {
    const g = new THREE.Group();
    for (let i = 0; i < 3; i++) RB(g, 1.2 - i * 0.25, 0.28, 0.7 - i * 0.18, '#c8303a', 0, 0.14 + i * 0.28, -0.1 + i * 0.09, 0.03);
    const doll = (x, y, z, c) => { const b = mesh(G.cone(0.1, 0.22, 10), M(c), false, false); at(b, x, y + 0.11, z); g.add(b); const h = mesh(G.sph(0.06, 10, 8), M('#fbf0e4'), false, false); at(h, x, y + 0.26, z); g.add(h); const hr = mesh(G.sph(0.063, 10, 8, 0, TAU, 0, Math.PI / 2), M('#1a1a1a'), false, false); at(hr, x, y + 0.27, z - 0.005); g.add(hr); };
    doll(-0.16, 0.84, 0.08, '#3a3a7a'); doll(0.16, 0.84, 0.08, '#c83a5a');
    for (let i = 0; i < 3; i++) doll(-0.3 + i * 0.3, 0.56, 0.0, '#f4f0e8');
    o.lamps = [];
    for (const s of [-1, 1]) { const l = mesh(G.cyl(0.05, 0.06, 0.14, 8), new THREE.MeshStandardMaterial({ color: 0xffe8b0, emissive: 0xffc860, emissiveIntensity: 0.4 }), false, false); at(l, s * 0.42, 0.92, 0.12); g.add(l); o.lamps.push(l); }
    return g;
  },
  tick(o) { const t = performance.now() * 0.01; o.lamps.forEach((l, i) => l.rotation.z = Math.sin(t + i) * 0.4 * (o.st.sway || 0)); if (o.st.sway) o.st.sway = Math.max(0, o.st.sway - 0.01); },
});
defObj('koinobori', {
  name: 'こいのぼり', pos: () => [15.4, 0, 3.4, 0], pick: [2.4, 3.6, 1.0], pickY: 2.6,
  host: { hide: 2, move: 'sway', kind: 'curtain' },
  model(o) {
    const g = new THREE.Group();
    const p = mesh(G.cyl(0.05, 0.06, 4.0, 8), M('#c8b08a')); at(p, 0, 2.0, 0); g.add(p);
    o.panels = [];
    [['#2a4a9a', 3.5, 1.2], ['#d03a3a', 2.9, 1.0], ['#f4a0b0', 2.35, 0.8]].forEach(([c, y, l]) => {
      const q = new THREE.Group(); at(q, 0, y, 0); g.add(q);
      const b = mesh(G.cyl(0.18, 0.08, l, 10, 1, true), new THREE.MeshStandardMaterial({ color: c, side: THREE.DoubleSide }), false, false); b.rotation.z = Math.PI / 2; at(b, l / 2, 0, 0); q.add(b);
      const e = mesh(G.sph(0.05, 8, 6), M('#fff'), false, false); at(e, 0.08, 0.05, 0.16); q.add(e);
      o.panels.push(q);
    });
    return g;
  },
  st0: () => ({ sway: 0 }),
  tick(o, dt) { const t = performance.now() * 0.003; const sw = o.st.sway || 0; o.panels.forEach((q, i) => { q.rotation.y = Math.sin(t + i) * 0.3 + sw * Math.sin(t * 6 + i) * 1.2; q.rotation.z = Math.sin(t * 1.3 + i) * 0.08; }); if (sw) o.st.sway = Math.max(0, sw - dt * 0.5); },
});
defObj('senpuki', {
  name: 'せんぷうき', pos: () => [6.4, 0, -1.0, -2.4], pick: [0.6, 1.2, 0.6], pickY: 0.6,
  host: { hide: 2, move: 'none' },
  model(o) {
    const g = new THREE.Group();
    const b = mesh(G.rcyl(0.25, 0.06, 0.02, 16), M('#f4f4f0'), true, false); at(b, 0, 0.03, 0); g.add(b);
    RB(g, 0.06, 0.8, 0.06, '#e8e8e4', 0, 0.45, 0, 0.02);
    o.head = new THREE.Group(); at(o.head, 0, 0.92, 0); g.add(o.head);
    const cage = mesh(G.tor(0.26, 0.015, 6, 20), M('#8ab8e0'), false, false); at(cage, 0, 0, 0.08); o.head.add(cage);
    o.blades = new THREE.Group(); at(o.blades, 0, 0, 0.08); o.head.add(o.blades);
    for (let i = 0; i < 3; i++) { const bl = mesh(G.rbox(0.09, 0.22, 0.01, 0.03), M('#8ab8e0'), false, false); bl.position.y = 0.1; const p = new THREE.Group(); p.rotation.z = i * TAU / 3; p.add(bl); o.blades.add(p); }
    RB(o.head, 0.14, 0.14, 0.14, '#f4f4f0', 0, 0, -0.05, 0.05);
    return g;
  },
  st0: () => ({ wind: 0 }),
  tick(o, dt) { o.blades.rotation.z += dt * (8 + (o.st.wind || 0) * 30); o.head.rotation.y = Math.sin(performance.now() * 0.0008) * 0.6 * (1 + (o.st.wind || 0)); if (o.st.wind) o.st.wind = Math.max(0, o.st.wind - dt * 0.3); },
});
defObj('furin', {
  name: 'ふうりん', pos: () => [7.62, 2.0, 2.9, -Math.PI / 2], pick: [0.4, 0.6, 0.4], pickY: -0.1,
  host: { hide: 1, move: 'none' },
  model(o) {
    const g = new THREE.Group();
    const c = mesh(G.sph(0.12, 14, 10, 0, TAU, 0, Math.PI * 0.6), new THREE.MeshStandardMaterial({ color: 0xbfe4f8, transparent: true, opacity: 0.7, side: THREE.DoubleSide }), false, false); g.add(c);
    o.paper = new THREE.Group(); at(o.paper, 0, -0.05, 0); g.add(o.paper);
    RB(o.paper, 0.004, 0.22, 0.004, '#fff', 0, -0.11, 0, 0.001); RB(o.paper, 0.1, 0.18, 0.005, '#f4a0b0', 0, -0.3, 0, 0.004);
    return g;
  },
  st0: () => ({ sway: 0 }),
  tick(o, dt) { o.paper.rotation.x = Math.sin(performance.now() * 0.004) * (0.1 + (o.st.sway || 0)); if (o.st.sway) o.st.sway = Math.max(0, o.st.sway - dt * 0.4); },
});
defObj('sudare', {
  name: 'すだれ', pos: () => [9.45, 0, -2.6, Math.PI / 2], pick: [0.3, 2.0, 1.8], pickY: 1.2,
  host: { hide: 2, move: 'sway', kind: 'curtain' },
  model(o) {
    const g = new THREE.Group(); o.panels = [];
    const p = new THREE.Group(); at(p, 0, 2.2, 0); g.add(p);
    for (let i = 0; i < 18; i++) RB(p, 1.6, 0.05, 0.02, i % 2 ? '#c8a868' : '#d8b878', 0, -0.06 - i * 0.075, 0, 0.01);
    o.panels.push(p);
    return g;
  },
  st0: () => ({ sway: 0 }),
  tick(o, dt) { o.panels[0].rotation.x = Math.sin(performance.now() * 0.005) * 0.25 * (o.st.sway || 0); if (o.st.sway) o.st.sway = Math.max(0, o.st.sway - dt * 0.4); },
});
defObj('lantern', {
  name: 'かぼちゃランタン', pos: () => [-1.6, 0, 4.7, Math.PI], pick: [0.7, 0.7, 0.7], pickY: 0.3,
  host: { hide: 2, move: 'none' },
  model(o) {
    const g = new THREE.Group();
    const b = mesh(G.sph(0.32, 16, 12), M('#e8822a'), true, false); b.scale.y = 0.8; at(b, 0, 0.27, 0); g.add(b);
    const st = mesh(G.cyl(0.04, 0.05, 0.12, 6), M('#5a7a3a'), false, false); at(st, 0, 0.55, 0); g.add(st);
    o.eyes = mesh(G.plane(0.4, 0.2), new THREE.MeshBasicMaterial({ map: cTex(128, 64, x => { x.fillStyle = '#ffd040'; x.beginPath(); x.moveTo(20, 40); x.lineTo(40, 10); x.lineTo(56, 40); x.fill(); x.beginPath(); x.moveTo(72, 40); x.lineTo(88, 10); x.lineTo(108, 40); x.fill(); }), transparent: true }), false, false); at(o.eyes, 0, 0.36, 0.31); g.add(o.eyes);
    o.mouth = mesh(G.plane(0.3, 0.1), new THREE.MeshBasicMaterial({ map: cTex(128, 48, x => { x.fillStyle = '#ffd040'; x.beginPath(); x.moveTo(8, 10); for (let i = 0; i <= 8; i++) x.lineTo(8 + i * 14, i % 2 ? 40 : 18); x.lineTo(120, 10); x.fill(); }), transparent: true }), false, false); at(o.mouth, 0, 0.2, 0.3); g.add(o.mouth);
    return g;
  },
  st0: () => ({ glow: 0 }),
  tick(o, dt) { const k = 0.5 + (o.st.glow || 0); o.eyes.material.opacity = Math.min(1, k); o.mouth.position.y = 0.2 + (o.st.glow > 0.5 ? Math.sin(performance.now() * 0.05) * 0.02 : 0); if (o.st.glow) o.st.glow = Math.max(0, o.st.glow - dt * 0.4); },
});
defObj('ochiba', {
  name: 'おちばの 山', pos: () => [12.6, 0, -2.4, 0], pick: [1.6, 0.7, 1.4], pickY: 0.25,
  host: { hide: 3, move: 'none' },
  model(o) {
    const g = new THREE.Group();
    for (let i = 0; i < 14; i++) { const l = mesh(G.sph(rnd(0.2, 0.32), 8, 6), M(pick(['#e8902a', '#d0582a', '#e8c040', '#b8682a'])), true, false); l.scale.y = 0.45; at(l, rnd(-0.6, 0.6), rnd(0.05, 0.3), rnd(-0.5, 0.5)); g.add(l); }
    return g;
  },
});
defObj('denkiL', {
  name: 'リビングの でんき', pos: () => [-0.12, 1.3, 1.2, -Math.PI / 2], pick: [0.4, 0.5, 0.5],
  host: { hide: 2, move: 'none' },
  model(o) { const g = new THREE.Group(); RB(g, 0.16, 0.24, 0.03, '#f4f0e4', 0, 0, 0, 0.02); o.sw = RB(g, 0.06, 0.08, 0.03, '#d8d0c0', 0, 0, 0.02, 0.01); return g; },
});
defObj('kotatsu', {
  name: 'こたつ', pos: () => [4.2, 0, -2.6, 0], pick: [1.8, 0.8, 1.8], pickY: 0.35,
  host: { hide: 4, move: 'none', kind: 'inner' },
  model(o) {
    const g = new THREE.Group();
    RB(g, 1.8, 0.4, 1.8, '#d86a5a', 0, 0.22, 0, 0.12);
    RB(g, 1.5, 0.06, 1.5, '#a8743e', 0, 0.45, 0, 0.03);
    for (let i = 0; i < 9; i++) { const m = mesh(G.sph(0.06, 8, 6), M('#f0902a'), false, false); at(m, -0.12 + (i % 3) * 0.12, 0.52 + Math.floor(i / 3) * 0.03, 0.1 - Math.floor(i / 3) * 0.06); if (i < 5) g.add(m); }
    o.mikan = new THREE.Group(); g.add(o.mikan); const mk = mesh(G.sph(0.08, 10, 8), M('#f08a20'), false, false); at(mk, 0.45, 0.53, 0.35); o.mikan.add(mk);
    return g;
  },
  refresh(o) { o.mikan.visible = !!World.flags.mikan; },
});
defObj('xtree', {
  name: 'クリスマスツリー', pos: () => [-1.6, 0, 4.6, 0], pick: [1.0, 2.0, 1.0], pickY: 1.0,
  host: { hide: 2, move: 'none' },
  model(o) {
    const g = new THREE.Group();
    RB(g, 0.4, 0.3, 0.4, '#b8584a', 0, 0.15, 0, 0.05);
    for (let i = 0; i < 3; i++) { const c = mesh(G.cone(0.6 - i * 0.15, 0.7, 10), M('#3a8a4a'), true, false); at(c, 0, 0.6 + i * 0.42, 0); g.add(c); }
    const star = mesh(G.sph(0.08, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd84a }), false, false); at(star, 0, 1.75, 0); g.add(star);
    o.balls = [];
    for (let i = 0; i < 9; i++) { const a = i * 2.3, r = 0.45 - (i % 3) * 0.12; const b = mesh(G.sph(0.05, 8, 6), new THREE.MeshStandardMaterial({ color: pick([0xe04a4a, 0xf4c84a, 0x5a8ae0]), emissive: 0x333333 }), false, false); at(b, Math.cos(a) * r, 0.55 + (i % 3) * 0.42, Math.sin(a) * r); g.add(b); o.balls.push(b); b.userData.p0 = b.position.clone(); }
    return g;
  },
  st0: () => ({ blink: 0, drop: 0 }),
  tick(o, dt) {
    o.balls.forEach((b, i) => { b.material.emissiveIntensity = o.st.blink > 0 ? (Math.sin(performance.now() * 0.03 + i) > 0 ? 2 : 0) : 0.3; });
    if (o.st.blink) o.st.blink = Math.max(0, o.st.blink - dt);
    const b = o.balls[0]; if (o.st.drop > 0) { o.st.drop -= dt; b.position.y = Math.max(0.05, b.position.y - dt * 3); } else b.position.copy(b.userData.p0);
  },
});
defObj('yukidaruma', {
  name: 'ゆきだるま', pos: () => [14.6, 0, 2.4, -0.4], pick: [0.9, 1.3, 0.9], pickY: 0.6,
  host: { hide: 2, move: 'none' },
  model(o) {
    const g = new THREE.Group();
    const b = mesh(G.sph(0.42, 16, 12), M('#f8f8fc'), true, false); at(b, 0, 0.4, 0); g.add(b);
    o.head = new THREE.Group(); at(o.head, 0, 0.98, 0); g.add(o.head);
    const h = mesh(G.sph(0.28, 16, 12), M('#f8f8fc'), true, false); o.head.add(h);
    for (const s of [-1, 1]) { const e = mesh(G.sph(0.035, 8, 6), M('#222'), false, false); at(e, s * 0.09, 0.05, 0.25); o.head.add(e); }
    const n = mesh(G.cone(0.04, 0.18, 8), M('#f08a2a'), false, false); n.rotation.x = Math.PI / 2; at(n, 0, 0, 0.32); o.head.add(n);
    const bk = mesh(G.cyl(0.2, 0.24, 0.2, 12), M('#c84a3a'), false, false); at(bk, 0, 0.27, 0); o.head.add(bk);
    return g;
  },
  st0: () => ({ spin: 0, roll: 0 }),
  tick(o, dt) {
    if (o.st.spin > 0) { o.st.spin -= dt; o.head.rotation.y += dt * 8; } else o.head.rotation.y = damp(o.head.rotation.y % TAU, 0, 3, dt);
    if (o.st.roll > 0) { o.st.roll -= dt; o.g.rotation.x = Math.sin(o.st.roll * 6) * 0.3; o.pos.x = o.home.x + Math.sin((2 - o.st.roll) * 1.5) * 0.8; o.target = o.pos.clone(); } else if (o.st.roll < 0) { o.st.roll = 0; o.target = o.home.clone(); o.g.rotation.x = 0; }
  },
});

// ---- how each thing scares: s = small (tap), b = big (hold)
const SCARE = {
  hashira: { s: ['針が カチッ', 12], b: ['鐘が ボーン', 30], far: 1, tip: '部屋じゅうに きこえる' },
  curtain: { s: ['ふわっと ゆれる', 10], b: ['バサッと はためく', 28], window: 1, tip: 'まどの そばの 子に よく きく' },
  curtain2: { s: ['ふわっと ゆれる', 10], b: ['バサッと はためく', 28], window: 1, tip: 'まどの そばの 子に よく きく' },
  curtain3: { s: ['ふわっと ゆれる', 10], b: ['バサッと はためく', 28], window: 1, tip: 'まどの そばの 子に よく きく' },
  kuma: { s: ['首を かしげる', 11], b: ['ころんと ころがる', 26], lure: 1, tip: 'ちいさな 子が ちかよってくる' },
  tv: { s: ['画面が ちらつく', 13], b: ['チャンネルが かわる', 32], brave: 1, tip: 'つよがりの 子にも きく' },
  reizoko: { s: ['ブーンと うなる', 12], b: ['とびらが パタンと ひらく', 32], tip: 'だいどころで だけ' },
  kingyo: { s: ['ぽちゃん', 10], b: ['ばしゃっ！', 26], tip: '' },
  kyusu: { s: ['ふたが カタッ', 10], b: ['ゆのみが ガタン', 26], tip: '' },
  oshiire: { s: ['ふすまが カタッ', 12], b: ['ガタガタッ！', 32], tip: 'なかは みつかりにくい' },
  randoseru: { s: ['ふたが パカッ', 10], b: ['どさっと たおれる', 26], tip: 'なかは みつかりにくい' },
  tansu2: { s: ['ギィ…', 12], b: ['とびらが バーン', 30], tip: 'なかは みつかりにくい' },
  mezamashi: { s: ['チッ チッ', 10], b: ['ジリリリ！', 30], tip: '' },
  piano: { s: ['ポロン', 12], b: ['ジャーン！', 34], far: 1, tip: 'となりの 部屋にも ひびく' },
  hondana: { s: ['本が ずれる', 11], b: ['本が ドサッ', 34], tip: '' },
  hoshi: { s: ['ひらり', 9], b: ['ばさばさっ', 24], tip: '' },
  hina: { s: ['目が きらり', 13], b: ['ぼんぼりが ゆれる', 30], tip: '' },
  koinobori: { s: ['はためく', 10], b: ['ぐるんと まわる', 28], tip: 'にわの 子に' },
  senpuki: { s: ['首を ふる', 10], b: ['つよい 風', 26], wind: 1, tip: '大きい 風で 部屋の カーテンや ふうりんも ゆれる' },
  furin: { s: ['チリン', 10], b: ['チリンチリン！', 24], far: 1, tip: '' },
  sudare: { s: ['さらさら', 9], b: ['ばさっ', 24], tip: '' },
  lantern: { s: ['目が ひかる', 13], b: ['ケタケタ わらう', 34], tip: '' },
  ochiba: { s: ['カサッ', 9], b: ['ぶわっと まいあがる', 28], tip: '' },
  denkiL: { s: ['でんきが チカチカ', 14], b: ['まっくら！', 34], light: 1, tip: '部屋じゅうの 子に きく' },
  kotatsu: { s: ['ふとんが もぞっ', 12], b: ['ガタン！', 30], tip: 'なかは みつかりにくい。でも 足を いれてくる子が…' },
  xtree: { s: ['ライトが てんめつ', 12], b: ['オーナメントが ポロッ', 28], tip: '' },
  yukidaruma: { s: ['首が くるり', 13], b: ['ころころ ころがる', 32], tip: 'にわの 子に' },
  door: { s: ['ギィ…', 11], b: ['バタン！', 30], tip: '' },
};
function scareDef(o) { return SCARE[o.id] || (o.def.door ? SCARE.door : null); }
// visual of a scare
function scareFx(o, big) {
  const s = o.st; o.wig = big ? 1.0 : 0.45;
  switch (o.id) {
    case 'curtain': case 'curtain2': case 'curtain3': case 'hoshi': case 'sudare': case 'koinobori': s.sway = big ? 1 : 0.35; Sound.sfx('sway'); break;
    case 'hashira': s.ring = big ? 1 : 0.2; Sound.sfx(big ? 'bong' : 'clock'); break;
    case 'tv': s.on = true; o.def.refresh(o); Sound.sfx('tv'); setTimeout(() => { s.on = false; o.def.refresh(o); }, big ? 2500 : 700); break;
    case 'kingyo': s.splash = big ? 2 : 0.6; Sound.sfx('splash'); if (big) Parts.burst(o.g.parent, o.pos.clone().add(new V3(0, 0.5, 0)), 10, { col: 0x9ad0ff, size: 0.12, life: 0.7, spd: 1.2, up: 2, g: 6 }); break;
    case 'mezamashi': if (big) { s.ring = 1; setTimeout(() => s.ring = 0, 2500); } Sound.sfx(big ? 'alarm' : 'clock'); break;
    case 'piano': Sound.sfx('piano', 523); if (big) [392, 466, 554, 659].forEach((f, i) => setTimeout(() => Sound.sfx('piano', f), i * 30)); break;
    case 'hondana': if (big) { s.fallen = true; o.def.refresh(o); Sound.sfx('thud'); setTimeout(() => { s.fallen = false; o.def.refresh(o); }, 7000); } else Sound.sfx('knock'); break;
    case 'hina': s.sway = big ? 1 : 0.3; Sound.sfx(big ? 'rattle' : 'star'); break;
    case 'senpuki': s.wind = big ? 1 : 0.3; Sound.sfx('sway'); break;
    case 'furin': s.sway = big ? 1 : 0.3; Sound.sfx(big ? 'furin2' : 'furin'); break;
    case 'lantern': s.glow = big ? 1.5 : 0.8; Sound.sfx(big ? 'cackle' : 'star'); break;
    case 'ochiba': Sound.sfx('leaves'); if (big) Parts.burst(o.g.parent, o.pos.clone().add(new V3(0, 0.3, 0)), 18, { col: 0xe8902a, size: 0.18, life: 1.4, spd: 1.6, up: 3, g: 2 }); break;
    case 'denkiL': o.sw.rotation.x = big ? 0.5 : 0; World.darkRoom = { room: 'living', t: big ? 4 : 0.8, flick: !big }; Sound.sfx('switch'); break;
    case 'kotatsu': Sound.sfx(big ? 'rattle' : 'knock'); break;
    case 'xtree': if (big) { s.drop = 3; Sound.sfx('jingle'); } else { s.blink = 2; Sound.sfx('star'); } break;
    case 'yukidaruma': if (big) { s.roll = 2; Sound.sfx('roll'); } else { s.spin = 0.8; Sound.sfx('knock'); } break;
    case 'kuma': if (big) { o.target = o.home.clone().add(new V3(0.4, -0.5, 0.3)); setTimeout(() => o.target = o.home.clone(), 6000); } Sound.sfx('knock'); break;
    default:
      if (o.def.door) { const id = o.def.door; World.setDoor(id, !World.doorOpen(id)); if (big) setTimeout(() => World.setDoor(id, true), 2500); Sound.sfx('door'); }
      else Sound.sfx(big ? 'rattle' : 'knock');
  }
  Parts.burst(o.g.parent, o.pos.clone().add(new V3(0, 0.6, 0)), big ? 12 : 5, { col: 0xdfeaff, size: 0.12, life: 0.8, spd: 0.9, up: 1.4, add: true, star: true });
}
// things in the house per season
const BASE_OBJS = ['sofa', 'tv', 'kuma', 'curtain', 'curtain3', 'curtain2', 'kingyo', 'reizoko', 'kyusu', 'oshiire', 'randoseru', 'tansu2', 'mezamashi', 'piano', 'hashira',
  'door_d_lk', 'door_d_lh', 'door_d_hw', 'door_d_kw', 'door_d_2k', 'door_d_2a', 'door_d_2s'];
const SEASON_OBJS = {
  1: BASE_OBJS.concat(['hina', 'koinobori', 'hoshi']),
  2: BASE_OBJS.concat(['senpuki', 'furin', 'sudare', 'hoshi']),
  3: BASE_OBJS.concat(['lantern', 'hondana', 'ochiba', 'denkiL']),
  4: BASE_OBJS.filter(x => x !== 'kingyo').concat(['kotatsu', 'xtree', 'yukidaruma']),
};
const NEW_OBJS = { 1: ['hina', 'koinobori'], 2: ['senpuki', 'furin', 'sudare'], 3: ['lantern', 'hondana', 'ochiba', 'denkiL'], 4: ['kotatsu', 'xtree', 'yukidaruma'] };

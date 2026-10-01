// ================================================================ portraits (rendered from the 3D models)
const PORTRAIT = {};
function makePortraits() {
  const rt = new THREE.WebGLRenderTarget(192, 192);
  const sc = new THREE.Scene();
  sc.add(new THREE.HemisphereLight(0xffffff, 0x9a88a8, 0.9));
  const dl = new THREE.DirectionalLight(0xffffff, 0.6); dl.position.set(-2, 3, 4); sc.add(dl);
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  const list = [
    ['futan', () => makeChef('futan'), [0, 0.98, 2.2], [0, 0.88, 0]],
    ['ricky', () => makeChef('ricky'), [0, 0.84, 1.9], [0, 0.76, 0]],
    ['enchou', () => makeEnchou(), [0, 1.0, 2.6], [0, 0.9, 0]],
    ['hara', () => makeHarapekon(), [0, 1.4, 5.2], [0, 1.15, 0]],
    ['hara2', () => { const h = makeHarapekon(); h.cute = 1; animHarapekon(h, {}, 0.016); return h; }, [0, 1.4, 5.2], [0, 1.15, 0]],
    ['pochi', () => makeDog(), [0, 0.4, 1.5], [0, 0.32, 0]],
  ];
  const buf = new Uint8Array(192 * 192 * 4);
  const prevClear = renderer.getClearColor(new THREE.Color()), prevA = renderer.getClearAlpha();
  for (const [k, mk, cp, tp] of list) {
    const P = mk(); sc.add(P.g);
    cam.position.set(...cp); cam.lookAt(...tp);
    renderer.setRenderTarget(rt); renderer.setClearColor(0x000000, 0); renderer.clear();
    renderer.render(sc, cam);
    renderer.readRenderTargetPixels(rt, 0, 0, 192, 192, buf);
    const c = document.createElement('canvas'); c.width = c.height = 192; const x = c.getContext('2d');
    const id = x.createImageData(192, 192);
    for (let y = 0; y < 192; y++) id.data.set(buf.subarray((191 - y) * 192 * 4, (192 - y) * 192 * 4), y * 192 * 4);
    x.putImageData(id, 0, 0);
    PORTRAIT[k] = c.toDataURL();
    sc.remove(P.g); disposeTree(P.g);
  }
  renderer.setRenderTarget(null); renderer.setClearColor(prevClear, prevA);
  rt.dispose();
}
const NAMES = { futan: 'ふーたん', ricky: 'リッキー', enchou: 'タマネギ えんちょう', hara: 'ハラペコン', hara2: 'ハラペコン', pochi: 'ポチ' };

// ================================================================ story set
const Story = {
  root: new THREE.Group(), built: false, C: {}, steps: [], i: 0, done: null, camFrom: null, camTo: null, camT: 1, ctl: new Ctl(['all', 'pad0']), wait: 0, look: new V3(),
  build() {
    if (this.built) return; this.built = true;
    const r = this.root; scene.add(r); r.visible = false;
    const gr = mesh(new THREE.PlaneGeometry(80, 80), 0x8ad86a, false, true); gr.rotation.x = -Math.PI / 2; r.add(gr);
    const yard = mesh(new THREE.CircleGeometry(7, 24), 0xf2d8a0, false, true); yard.rotation.x = -Math.PI / 2; yard.position.set(0, 0.01, 1); r.add(yard);
    // kindergarten
    const b = new THREE.Group(); b.position.set(0, 0, -4.5); r.add(b); this.school = b;
    b.add(at(mesh(G.box(9, 3, 3), 0xfff0c8, true, true), 0, 1.5, 0));
    for (const s of [-1, 1]) { const rf = mesh(G.box(9.6, 0.22, 2.1), 0xff6a8a); rf.rotation.x = s * 0.55; rf.position.set(0, 3.45, s * 0.86); b.add(rf); }
    const gab = mesh(G.cyl(1.0, 1.0, 9.2, 3), 0xffe0b0); gab.rotation.z = Math.PI / 2; gab.rotation.x = Math.PI / 2; gab.scale.set(1, 1, 0.55); gab.position.y = 3.3; b.add(gab);
    for (let k = -1; k <= 1; k++) { b.add(at(mesh(G.box(1.4, 1.0, 0.1), 0x9ad8ff, false), k * 2.8, 1.45, 1.51)); }
    b.add(at(mesh(G.box(1.1, 1.8, 0.1), 0xc8904a, false), 0, 0.9, 1.52));
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 0.8), new THREE.MeshBasicMaterial({ map: signTex('ひまわり ようちえん', '#fff6e2', '#e8344a', 400, 72) })); sg.position.set(0, 2.62, 1.56); b.add(sg);
    // sunflowers & trees
    for (let k = 0; k < 9; k++) { const f = new THREE.Group(); f.position.set(-6 + k * 1.5, 0, -2.6 + (k % 2) * 0.3); r.add(f); f.add(at(mesh(G.cyl(0.04, 0.04, 1.2, 5), 0x4ab03a), 0, 0.6, 0)); const h = mesh(G.cyl(0.25, 0.25, 0.06, 10), 0xffd82a); h.rotation.x = Math.PI / 2 - 0.3; h.position.y = 1.25; f.add(h); f.add(at(mesh(G.cyl(0.12, 0.12, 0.08, 8), 0x7a4a1a), 0, 1.27, 0.03)).rotation.x = Math.PI / 2 - 0.3; }
    for (const [x, z] of [[-8, -1], [8, -1], [-9, 4], [9, 5], [-6, 8], [7, 9]]) { const t = new THREE.Group(); t.position.set(x, 0, z); r.add(t); t.add(at(mesh(G.cyl(0.2, 0.25, 1.4, 6), 0x8a5a3a), 0, 0.7, 0)); t.add(at(mesh(G.ico(1.2, 0), 0x3fae4a), 0, 2.1, 0)); }
    // slide
    const sl = new THREE.Group(); sl.position.set(5.2, 0, 0.5); sl.rotation.y = -0.6; r.add(sl);
    sl.add(at(mesh(G.box(0.9, 1.8, 0.9), 0x59b2ff), 0, 0.9, -1)); const ramp = mesh(G.box(0.7, 0.08, 2.4), 0xffcf2e); ramp.rotation.x = 0.62; ramp.position.set(0, 0.95, 0.4); sl.add(ramp);
    // picnic sheet + bento (ending)
    const pic = new THREE.Group(); pic.visible = false; r.add(pic); this.picnic = pic;
    const sheet = mesh(G.box(4.2, 0.03, 3), 0xff4f3a, false, true); sheet.position.set(0, 0.02, 1.4); pic.add(sheet);
    for (let k = -2; k <= 2; k++) pic.add(at(mesh(G.box(0.12, 0.031, 3), 0xffffff, false, true), k * 0.8, 0.025, 1.4));
    const foods = [['🍙'], ['🍔'], ['🍣'], ['🍛'], ['🥗'], ['🥣']];
    foods.forEach((f, k) => { const pl = { kind: 'plate', dirty: false, n: 1, items: [] }; pl.items = RECIPES[['onigiri', 'burger', 'sushi', 'curry', 'salad', 'soup'][k]].items.slice(); const m = plateModel(pl); m.position.set(-1.5 + (k % 3) * 1.5, 0.04, 0.9 + Math.floor(k / 3) * 1.0); pic.add(m); });
    // characters
    const C = this.C;
    C.futan = makeChef('futan'); C.ricky = makeChef('ricky'); C.enchou = makeEnchou(); C.pochi = makeDog(); C.hara = makeHarapekon();
    for (const k in C) r.add(C[k].g);
    C.hara.g.scale.setScalar(3.2);
  },
  reset(kind) {
    const C = this.C;
    C.futan.g.position.set(-1.0, 0, 1.6); C.futan.g.rotation.y = 0.2;
    C.ricky.g.position.set(0.1, 0, 2.0); C.ricky.g.rotation.y = 0;
    C.enchou.g.position.set(1.6, 0, 1.2); C.enchou.g.rotation.y = -0.4;
    C.pochi.g.position.set(-2.1, 0, 2.3); C.pochi.g.rotation.y = 0.5;
    C.hara.g.position.set(0, -9, -9); C.hara.cute = 0; C.hara.g.scale.setScalar(3.2);
    C.hara.bodyM.color.setHex(0x8a52d8); C.hara.bellyM.color.setHex(0xd2b2ff); for (const th of C.hara.teeth) th.visible = true;
    const hats = kind !== 'intro';
    C.futan.hat.visible = hats; C.ricky.hat.visible = hats;
    this.picnic.visible = kind === 'ending';
    this.anim = {}; this.sky = 0;
  },
  play(name, done) {
    this.build(); this.reset(name);
    this.steps = SCRIPTS[name](this); this.i = -1; this.done = done;
    APP.mode = 'story'; setView('story');
    $('#story').classList.remove('hide');
    Music.play(name === 'ending' ? 'ending' : 'story');
    this.next();
  },
  next() {
    this.i++;
    if (this.i >= this.steps.length) return this.finish();
    const s = this.steps[this.i];
    if (s.fx) s.fx();
    if (s.music) Music.play(s.music);
    if (s.cam) { this.camFrom = { p: camera.position.clone(), l: this.look.clone() }; this.camTo = { p: new V3(...s.cam[0]), l: new V3(...s.cam[1]) }; this.camT = this.i === 0 ? 1 : 0; if (this.i === 0) { camera.position.copy(this.camTo.p); this.look.copy(this.camTo.l); } }
    const bub = $('#bub');
    bub.classList.toggle('nar', !s.who);
    bub.querySelector('.nm').textContent = s.who ? NAMES[s.who] : '';
    bub.querySelector('.pt img').src = s.who ? PORTRAIT[s.who] : '';
    bub.querySelector('.tx').innerHTML = s.t;
    bub.classList.remove('boom'); if (s.boom) { void bub.offsetWidth; bub.classList.add('boom'); }
    this.talker = s.who; this.wait = 0.35;
    if (s.sfx) Sound.sfx(s.sfx);
    Voice.say(s.t, s.who === 'hara' ? 0.6 : s.who === 'enchou' ? 0.9 : s.who === 'ricky' ? 1.7 : s.who === 'hara2' ? 1.2 : 1.4, s.who === 'hara' ? 0.9 : 1.05);
  },
  finish() {
    $('#story').classList.add('hide'); Voice.stop();
    const d = this.done; this.done = null; d && d();
  },
  skip() { this.finish(); },
  update(dt) {
    this.ctl.poll(); this.wait -= dt;
    if (this.ctl.pressed.pick && this.wait <= 0) { Sound.sfx('click'); this.next(); }
    const C = this.C, a = this.anim, tk = w => this.talker === w;
    animChef(C.futan, { talk: tk('futan'), cheer: a.cheer, sad: a.scared, happy: a.cheer }, dt);
    animChef(C.ricky, { talk: tk('ricky'), cheer: a.cheer, sad: a.scared, happy: a.cheer }, dt);
    animEnchou(C.enchou, { talk: tk('enchou'), cheer: a.cheer, worry: a.scared }, dt);
    animDog(C.pochi, dt, a.cheer || a.scared);
    animHarapekon(C.hara, { roar: a.roar, eat: a.eat }, dt);
    if (a.haraY != null) C.hara.g.position.y = damp(C.hara.g.position.y, a.haraY, 2.2, dt);
    if (a.haraZ != null) C.hara.g.position.z = damp(C.hara.g.position.z, a.haraZ, 2.2, dt);
    if (a.haraS != null) C.hara.g.scale.setScalar(damp(C.hara.g.scale.x, a.haraS, 2.5, dt));
    this.sky = damp(this.sky, a.dark ? 1 : 0, 2, dt);
    scene.background.setHex(0x9fdcff).lerp(new THREE.Color(0x3a2a5a), this.sky);
    hemi.intensity = 0.78 - this.sky * 0.35;
    if (a.shake) { camera.position.x += rnd(-0.05, 0.05); camera.position.y += rnd(-0.05, 0.05); }
    if (this.camT < 1) { this.camT = Math.min(1, this.camT + dt / 1.1); const k = smooth(0, 1, this.camT); camera.position.lerpVectors(this.camFrom.p, this.camTo.p, k); this.look.lerpVectors(this.camFrom.l, this.camTo.l, k); }
    camera.lookAt(this.look);
  },
};
$('#bub').addEventListener('click', () => { if (APP.mode === 'story' && Story.wait <= 0) { Sound.unlock(); Sound.sfx('click'); Story.next(); } });
$('#skip').addEventListener('click', () => { if (APP.mode === 'story') Story.skip(); });

const WIDE = [[0, 3.2, 9.5], [0, 1.4, 0]];
const SCRIPTS = {
  intro: S => [
    { cam: WIDE, t: 'ここは ひまわり ようちえん。<br>きょうは たのしい おべんとう パーティーの ひ！' },
    { who: 'enchou', cam: [[1.2, 1.6, 4.4], [1.5, 1.0, 1.2]], t: 'みんな〜！ きょうは おべんとう パーティーじゃ！ たのしみじゃのう！' },
    { who: 'futan', cam: [[-0.8, 1.2, 3.8], [-0.8, 0.85, 1.6]], t: 'わーい！ ふーたん、 おりょうり だいすき！', fx: () => S.anim.cheer = 1 },
    { who: 'ricky', cam: [[0.1, 1.0, 3.8], [0.1, 0.7, 2.0]], t: 'ぼくも おてつだい する〜！' },
    { who: 'pochi', cam: [[-1.8, 0.8, 3.8], [-2.1, 0.4, 2.3]], t: 'ワン ワン！' },
    { cam: [[0, 2.4, 10.5], [0, 3, -4]], t: 'そのとき…… ゴゴゴゴゴ……！', sfx: 'rumble', boom: 1, music: 'scary', fx: () => { S.anim.cheer = 0; S.anim.scared = 1; S.anim.dark = 1; S.anim.shake = 1; S.anim.haraY = 0; S.anim.haraZ = -7.5; } },
    { who: 'hara', cam: [[0, 4.5, 6], [0, 5, -7.5]], t: 'グオ〜〜！ おなかが ペッコペコだ〜〜！', sfx: 'roar', boom: 1, fx: () => { S.anim.shake = 0; S.anim.roar = 1; setTimeout(() => S.anim.roar = 0, 1400); } },
    { who: 'hara', t: 'おれさまは ハラペコン！ ようちえんの ごちそうを ぜーんぶ よこせ〜！' },
    { who: 'hara', t: 'おなかが いっぱいに ならなかったら…… ようちえんごと たべちゃうぞ〜！', sfx: 'roar', boom: 1, fx: () => { S.anim.roar = 1; setTimeout(() => S.anim.roar = 0, 1200); } },
    { who: 'futan', cam: [[-0.5, 1.4, 4.5], [-0.5, 0.9, 1.6]], t: 'えーっ！ そんなの こまる〜！' },
    { who: 'hara', cam: [[0, 4.5, 6], [0, 5, -7.5]], t: 'なのかご に また くるからな！ それまでに ごちそうを たくさん つくれるように なっておけ〜！ グワッハッハ！' },
    { cam: WIDE, t: 'ハラペコンは じめんの なかへ もぐって いった……', fx: () => { S.anim.haraY = -10; S.anim.dark = 0; S.anim.scared = 0; }, music: 'story' },
    { who: 'enchou', cam: [[1.2, 1.6, 4.4], [1.5, 1.0, 1.2]], t: 'たいへんじゃ……！ ふーたん、 リッキー！ ふたりに おねがいが ある！', fx: () => S.anim.scared = 0 },
    { who: 'enchou', t: 'まちの いろんな キッチンで おりょうりの しゅぎょうを するのじゃ！ そして ハラペコンを おなか いっぱいに するのじゃ！' },
    { who: 'enchou', t: 'これを かぶるのじゃ。 シェフの ぼうしじゃ！', fx: () => { S.C.futan.hat.visible = true; S.C.ricky.hat.visible = true; Sound.sfx('star'); } },
    { who: 'futan', cam: [[-0.4, 1.3, 4.2], [-0.4, 0.9, 1.8]], t: 'まかせて！ ふーたん シェフと リッキー シェフ、 しゅっぱつ しんこう〜！', fx: () => S.anim.cheer = 1 },
    { who: 'enchou', cam: WIDE, t: 'ようちえん バスで いくのじゃ！ ちずの はたの ところで ステージが はじまるぞ〜！' },
  ],
  boss: S => [
    { cam: WIDE, t: 'やくそくの ひ。 ようちえんに…… ゴゴゴゴ……！', sfx: 'rumble', music: 'scary', fx: () => { S.anim.dark = 1; S.anim.haraY = 0; S.anim.haraZ = -7.5; S.anim.scared = 1; } },
    { who: 'hara', cam: [[0, 4.5, 6], [0, 5, -7.5]], t: 'グオ〜！ やくそくの ひだ！ ごちそうを もってこ〜い！', sfx: 'roar', boom: 1, fx: () => { S.anim.roar = 1; setTimeout(() => S.anim.roar = 0, 1400); } },
    { who: 'futan', cam: [[-0.4, 1.3, 4.2], [-0.4, 0.9, 1.8]], t: 'まけないよ！ しゅぎょうの せいか、 みせてあげる！', fx: () => { S.anim.scared = 0; S.anim.cheer = 1; } },
    { who: 'ricky', cam: [[0.1, 1.0, 3.8], [0.1, 0.7, 2.0]], t: 'おなか いっぱいに してあげるね！' },
    { who: 'enchou', cam: WIDE, t: 'ハラペコンの おなかを ごちそうで いっぱいに するのじゃ！ いくぞ〜！' },
  ],
  ending: S => [
    { cam: [[0, 4.5, 7], [0, 4.5, -7.5]], t: 'ハラペコンの おなかが…… ぽっこ〜ん！', fx: () => { S.anim.haraY = 0; S.anim.haraZ = -7.5; S.anim.eat = 1; S.anim.dark = 0; }, sfx: 'chomp' },
    { who: 'hara', t: 'ぷは〜…… おなか いっぱい……。 こんなに おいしい ごはん、 うまれて はじめて たべた……' },
    { cam: WIDE, t: 'ポンッ！', sfx: 'star', boom: 1, fx: () => { S.C.hara.cute = 1; S.anim.haraS = 1.1; S.anim.haraZ = -1.2; S.anim.eat = 0; for (let k = 0; k < 30; k++) Parts.add(new V3(rnd(-2, 2), rnd(0.5, 3), rnd(-3, -0.5)), { col: [0xff8ac0, 0xffcf2e, 0xffffff][k % 3], star: true, size: 0.3, life: 1.5, vy: rnd(0.5, 1.5), g: 1 }); } },
    { who: 'hara2', cam: [[0, 1.3, 3.3], [0, 1.0, -1.2]], t: 'じつは ずっと ひとりぼっちで……。 いっしょに ごはんを たべる ともだちが ほしかったんだ……' },
    { who: 'futan', cam: [[-0.4, 1.3, 4.2], [-0.4, 0.9, 1.6]], t: 'じゃあ、 きょうから ともだちだよ！ みんなで いっしょに たべよう！', fx: () => S.anim.cheer = 1 },
    { who: 'ricky', cam: [[0.1, 1.0, 3.8], [0.1, 0.7, 2.0]], t: 'みんなで たべると、 もっと おいしいんだよ！' },
    { who: 'enchou', cam: [[1.2, 1.6, 4.4], [1.5, 1.0, 1.2]], t: 'ふーたん、 リッキー、 りっぱな シェフに なったのう！ じまんの せいとじゃ！' },
    { cam: [[0, 3.6, 8.5], [0, 0.6, 0.8]], t: 'みんなで…… いただきまーす！', fx: () => { S.anim.cheer = 1; Sound.sfx('fanfare'); } },
    { cam: [[0, 5, 10], [0, 1, 0]], t: '🍳 ふーたんの はちゃめちゃ キッチン 🍳<br><b>おしまい</b>　あそんで くれて ありがとう！' },
  ],
};

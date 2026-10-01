// ================================================================ particles / effects
const FX = { list: [], pool: [], grp: new THREE.Group(), mats: {} };
scene.add(FX.grp);
function fxMat(key, tex, color, add) {
  const k = key + color;
  if (!FX.mats[k]) FX.mats[k] = new THREE.SpriteMaterial({ map: tex, color, transparent: true, depthWrite: false, blending: add === false ? THREE.NormalBlending : THREE.AdditiveBlending });
  return FX.mats[k];
}
// spawn one particle
function fxP(o) {
  const s = new THREE.Sprite(o.mat || fxMat('dot', TX.dot, o.color || 0xffffff, o.add));
  s.position.copy(o.p); s.scale.setScalar(o.size || 0.3); s.material = s.material.clone(); s.material.opacity = o.op == null ? 1 : o.op;
  FX.grp.add(s);
  FX.list.push({ s, v: o.v ? o.v.clone() : new V3(), g: o.g || 0, life: o.life || 0.8, t: 0, size: o.size || 0.3, grow: o.grow || 0, drag: o.drag || 0, op: o.op == null ? 1 : o.op, rot: o.rot || 0, to: o.to || null, toK: o.toK || 0 });
}
function updateFX(dt) {
  for (let i = FX.list.length - 1; i >= 0; i--) {
    const p = FX.list[i]; p.t += dt;
    if (p.t >= p.life) { FX.grp.remove(p.s); p.s.material.dispose(); FX.list.splice(i, 1); continue; }
    if (p.to) { const d = p.to.clone().sub(p.s.position); p.v.lerp(d.multiplyScalar(p.toK), Math.min(1, dt * 6)); }
    p.v.y -= p.g * dt; if (p.drag) p.v.multiplyScalar(Math.exp(-p.drag * dt));
    p.s.position.addScaledVector(p.v, dt);
    const k = p.t / p.life;
    p.s.scale.setScalar(Math.max(0.001, p.size * (1 + p.grow * k)));
    p.s.material.opacity = p.op * (k < 0.15 ? k / 0.15 : 1 - (k - 0.15) / 0.85);
    if (p.rot) p.s.material.rotation += p.rot * dt;
  }
}
const rv = (s) => new V3((Math.random() - 0.5) * s, (Math.random() - 0.5) * s, (Math.random() - 0.5) * s);
function fxBurst(p, color, n, spd, size, life, g) { for (let i = 0; i < n; i++) fxP({ p: p.clone().add(rv(0.3)), v: rv(spd).add(new V3(0, spd * 0.3, 0)), color, size: size * (0.6 + Math.random() * 0.8), life: life * (0.6 + Math.random() * 0.6), g: g || 0, drag: 2 }); }
function fxSlash(p, color) {
  // crescent swoosh made of a few stretched sprites
  for (let i = 0; i < 14; i++) { const a = -1.1 + i / 13 * 2.2; fxP({ p: p.clone().add(new V3(Math.cos(a) * 0.7, Math.sin(a) * 0.7 + 0.1, 0.3)), v: new V3(Math.cos(a), Math.sin(a), 0).multiplyScalar(1.5), color: color || 0xffffff, size: 0.35 - Math.abs(a) * 0.12, life: 0.28 }); }
  fxBurst(p, 0xfff2b0, 14, 4, 0.18, 0.4);
}
function fxFireball(from, to, color, big) {
  return new Promise(res => {
    const n = 18, dur = 0.45;
    for (let i = 0; i < n; i++) setTimeout(() => { const k = i / n; const p = from.clone().lerp(to, k).add(new V3(0, Math.sin(k * Math.PI) * 0.8, 0)); fxP({ mat: fxMat('fl', TX.flame, color || 0xff8a30), p, v: rv(0.5), size: big ? 0.9 : 0.55, life: 0.35 }); }, i * dur * 1000 / n);
    setTimeout(() => { fxBurst(to, color || 0xff7a20, big ? 40 : 24, big ? 6 : 4, 0.4, 0.7, -1); for (let i = 0; i < 8; i++) fxP({ mat: fxMat('fl', TX.flame, color || 0xff8a30), p: to.clone().add(rv(0.6)), v: new V3(0, 2 + Math.random() * 2, 0), size: 0.7, life: 0.6, grow: 0.5 }); res(); }, dur * 1000);
  });
}
function fxStars(p, color) { for (let i = 0; i < 22; i++) fxP({ mat: fxMat('st', TX.star, color || 0xfff2a0), p: p.clone().add(new V3((Math.random() - 0.5) * 1.6, 2.4 + Math.random() * 1.2, (Math.random() - 0.5) * 1.6)), v: new V3(0, -5 - Math.random() * 2, 0), size: 0.35, life: 0.5 + Math.random() * 0.2, rot: 6 }); setTimeout(() => fxBurst(p, color || 0xfff2a0, 26, 4, 0.25, 0.6), 420); }
function fxHeal(p) { for (let i = 0; i < 26; i++) { const a = Math.random() * 6.28, r = 0.4 + Math.random() * 0.3; fxP({ p: p.clone().add(new V3(Math.cos(a) * r, Math.random() * 0.4, Math.sin(a) * r)), v: new V3(0, 1.2 + Math.random() * 1.5, 0), color: i % 3 ? 0x8aff9a : 0xffffff, size: 0.18 + Math.random() * 0.12, life: 1.0 + Math.random() * 0.5 }); } }
function fxWind(p) { for (let i = 0; i < 40; i++) { const a = i / 40 * 12, r = 0.3 + i / 40 * 1.0; fxP({ p: p.clone().add(new V3(Math.cos(a) * r, i / 40 * 2, Math.sin(a) * r)), v: new V3(-Math.sin(a) * 3, 1, Math.cos(a) * 3), color: 0xd8fff0, size: 0.2, life: 0.6, op: 0.8 }); } }
function fxColumn(p, color) { for (let i = 0; i < 30; i++) fxP({ mat: fxMat('fl', TX.flame, color || 0xff7a20), p: p.clone().add(new V3((Math.random() - 0.5) * 0.8, Math.random() * 0.3, (Math.random() - 0.5) * 0.8)), v: new V3(0, 3 + Math.random() * 4, 0), size: 0.8, life: 0.7, grow: 0.6 }); fxBurst(p, color || 0xffaa40, 20, 5, 0.3, 0.7); }
function fxSleep(p) { for (let i = 0; i < 3; i++) setTimeout(() => fxP({ mat: fxMat('zz', ZZZ_TEX(), 0xffffff, false), p: p.clone().add(new V3(0.2 * i, 0, 0)), v: new V3(0.3, 0.9, 0), size: 0.45, life: 1.4, grow: 0.5 }), i * 250); }
let _zzz; function ZZZ_TEX() { if (!_zzz) _zzz = canvasTex(64, 64, x => { x.font = '900 52px sans-serif'; x.fillStyle = '#bfe0ff'; x.strokeStyle = '#1a2a5a'; x.lineWidth = 6; x.textAlign = 'center'; x.textBaseline = 'middle'; x.strokeText('Z', 32, 34); x.fillText('Z', 32, 34); }, true, false); return _zzz; }
function fxDark(p) { for (let i = 0; i < 30; i++) fxP({ p: p.clone().add(rv(1.6)), v: rv(1).add(new V3(0, 0.8, 0)), color: i % 2 ? 0x9a40ff : 0x40107a, size: 0.4, life: 0.9, add: true }); }
function fxBreath(from, to) { for (let i = 0; i < 50; i++) setTimeout(() => { const d = to.clone().sub(from).add(rv(2.5)).normalize().multiplyScalar(9 + Math.random() * 3); fxP({ mat: fxMat('fl', TX.flame, i % 2 ? 0xff7a20 : 0xffc040), p: from.clone(), v: d, size: 0.6, life: 0.65, grow: 1.6 }); }, i * 14); }
function fxThunder(p) {
  const pts = []; let q = p.clone().add(new V3(0, 9, 0));
  for (let i = 0; i < 12; i++) { pts.push(q.clone()); q = q.clone().add(new V3((Math.random() - 0.5) * 0.8, -0.75, (Math.random() - 0.5) * 0.8)); }
  pts.push(p.clone());
  const g = new THREE.BufferGeometry().setFromPoints(pts);
  const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xe0d0ff, transparent: true })); FX.grp.add(l);
  for (const pt of pts) fxP({ p: pt, color: 0xc8b0ff, size: 0.9, life: 0.35 });
  setTimeout(() => { FX.grp.remove(l); g.dispose(); }, 260);
  fxBurst(p, 0xd8c8ff, 30, 6, 0.3, 0.6);
}
function fxHero(p) { for (let i = 0; i < 60; i++) fxP({ p: p.clone().add(new V3((Math.random() - 0.5) * 1.2, 6 - Math.random() * 6, (Math.random() - 0.5) * 1.2)), v: new V3(0, -2, 0), color: i % 3 ? 0xfff6c0 : 0x9ad0ff, size: 0.5 + Math.random() * 0.4, life: 0.8 }); fxStars(p, 0xffffff); }
function screenFlash(color, op, ms) { const f = $('#flash'); f.style.background = color || '#fff'; f.style.transition = 'none'; f.style.opacity = op || 0.7; requestAnimationFrame(() => { f.style.transition = `opacity ${ms || 300}ms`; f.style.opacity = 0; }); }
// floating damage numbers
const _pv = new V3();
function dmgNum(pos, text, cls) {
  const e = document.createElement('div'); e.className = 'dmg ' + (cls || ''); e.textContent = text; document.body.appendChild(e);
  const t0 = performance.now(), base = pos.clone();
  const step = () => {
    const k = (performance.now() - t0) / 1100; if (k > 1) { e.remove(); return; }
    _pv.copy(base); _pv.y += 0.3 + k * 0.6; _pv.project(camera);
    e.style.left = ((_pv.x * 0.5 + 0.5) * innerWidth) + 'px'; e.style.top = ((-_pv.y * 0.5 + 0.5) * innerHeight - Math.sin(Math.min(k * 3, 1) * Math.PI) * 18) + 'px';
    e.style.opacity = k > 0.75 ? (1 - k) / 0.25 : 1;
    requestAnimationFrame(step);
  };
  step();
}
// encounter swirl transition
function swirl() {
  return new Promise(res => {
    const c = document.createElement('canvas'); c.width = innerWidth; c.height = innerHeight; Object.assign(c.style, { position: 'fixed', inset: '0', zIndex: 58, pointerEvents: 'none' }); document.body.appendChild(c);
    const x = c.getContext('2d'), t0 = performance.now(), W = c.width, H = c.height, R = Math.hypot(W, H) / 2;
    const step = () => {
      const k = (performance.now() - t0) / 700;
      x.clearRect(0, 0, W, H); x.fillStyle = '#000';
      const n = 12;
      for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2 + k * 3, a1 = a0 + Math.PI * 2 / n * Math.min(1, k * 1.15); x.beginPath(); x.moveTo(W / 2, H / 2); x.arc(W / 2, H / 2, R * 1.1, a0, a1); x.closePath(); x.fill(); }
      if (k < 1) requestAnimationFrame(step); else { $('#fade').style.transition = 'none'; $('#fade').style.opacity = '1'; c.remove(); res(); }
    };
    step();
  });
}

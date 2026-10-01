// ================================================================ vehicle models
// All vehicles face +z. Right-hand drive (Japan): driver sits at -x.
const VT = {};
const VEH = [];
function profileGeo(pts, width, bevel) {
  const s = new THREE.Shape();
  pts.forEach((p, i) => {
    if (p.arc) s.absarc(p.arc[0], p.arc[1], p.arc[2], Math.PI, 0, true);
    else if (i === 0) s.moveTo(p[0], p[1]); else s.lineTo(p[0], p[1]);
  });
  const b = bevel == null ? 0.05 : bevel;
  const g = new THREE.ExtrudeGeometry(s, { depth: width - b * 2, bevelEnabled: b > 0, bevelThickness: b, bevelSize: b, bevelSegments: 2, curveSegments: 10 });
  g.translate(0, 0, -(width - b * 2) / 2);
  g.rotateY(-Math.PI / 2);
  return g;
}
// lower body outline with wheel arches. f/r: front/rear axle positions, ar: arch radius
function lowerBody(L, y0, yf, yh, yb, yr, f, r, ar, nose, tail) {
  tail = Math.max(tail, -L / 2 + 0.25); nose = Math.min(nose, L / 2 - 0.2);
  return [[-L / 2, y0 + 0.08], [r - ar, y0], { arc: [r, y0, ar] }, [f - ar, y0], { arc: [f, y0, ar] }, [L / 2 - 0.05, y0],
    [L / 2, y0 + 0.2], [L / 2, yf - 0.06], [L / 2 - 0.08, yf], [nose, yh], [tail, yb], [-L / 2 + 0.08, yr], [-L / 2, yr - 0.1]];
}
function boxR(gb, x, y, z, w, h, d, c) { gb.add(UNIT_BOX, M(x, y, z, 0, w, h, d), c); }

function defineVehicles() {
  const C = (h) => col(h);
  const mk = (name, o) => { VT[name] = Object.assign({ name, maxV: 22, acc: 8, brake: 14, maxSteer: 0.6, wr: 0.33, mass: 1, seatY: 0.85, seatZ: -0.15, seatX: -0.38, max: 20 }, o); return VT[name]; };

  // ---------- sedan
  {
    const L = 4.6, W = 1.8, f = 1.38, r = -1.32, wr = 0.33;
    const body = new GB(), glass = new GB(), trim = new GB(), lights = new GB();
    body.add(profileGeo(lowerBody(L, 0.3, 0.72, 0.95, 1.0, 0.92, f, r, wr + 0.06, 1.05, -1.55), W, 0.07));
    glass.add(profileGeo([[1.1, 0.9], [0.32, 1.38], [-0.9, 1.4], [-1.6, 0.96]], W * 0.86, 0.04));
    body.add(profileGeo([[0.36, 1.33], [0.26, 1.42], [-0.92, 1.44], [-1.02, 1.36]], W * 0.88, 0.03));
    for (const s of [-1, 1]) {
      body.add(UNIT_BOX, M(s * W * 0.43, 1.15, -0.32, 0, 0.05, 0.5, 0.12));
      body.add(UNIT_BOX, M(s * W * 0.435, 1.14, 0.71, 0, 0.05, 0.07, 0.9, 0.55));
      trim.add(UNIT_BOX, M(s * (W / 2 + 0.08), 1.0, 0.95, 0, 0.16, 0.1, 0.18), C(0x222222)); // mirrors
      lights.add(UNIT_BOX, M(s * (W / 2 - 0.3), 0.74, L / 2 - 0.04, 0, 0.42, 0.12, 0.1), C(0xdfe8ee));
      lights.add(UNIT_BOX, M(s * (W / 2 - 0.28), 0.82, -L / 2 + 0.03, 0, 0.42, 0.13, 0.08), C(0xa8100c));
    }
    trim.add(UNIT_BOX, M(0, 0.45, L / 2 - 0.01, 0, W * 0.98, 0.22, 0.1), C(0x2b2c2e));
    trim.add(UNIT_BOX, M(0, 0.45, -L / 2 + 0.01, 0, W * 0.98, 0.22, 0.1), C(0x2b2c2e));
    trim.add(UNIT_BOX, M(0, 0.62, L / 2 + 0.02, 0, 0.9, 0.14, 0.04), C(0x111111));
    trim.add(UNIT_BOX, M(0, 0.48, L / 2 + 0.06, 0, 0.34, 0.17, 0.02), C(0xf4f4f0));
    trim.add(UNIT_BOX, M(0, 0.62, -L / 2 - 0.02, 0, 0.34, 0.17, 0.02), C(0xf4f4f0));
    mk('sedan', { label: 'セダン', L, W, H: 1.45, wb: f - r, f, r, wr, track: W / 2 - 0.12, body: body.build(), glass: glass.build(), trim: trim.build(), lights: lights.build(), colors: [0xf4f4f2, 0x111214, 0x8f9499, 0x2a3f6e, 0x7a1d1d, 0xc4c7ca, 0x3e4a3d, 0xd6cfc0], max: 18 });
  }
  // ---------- kei (boxy small)
  {
    const L = 3.4, W = 1.48, f = 1.08, r = -1.05, wr = 0.28;
    const body = new GB(), glass = new GB(), trim = new GB(), lights = new GB();
    body.add(profileGeo(lowerBody(L, 0.28, 0.8, 0.92, 0.98, 0.98, f, r, wr + 0.05, 1.3, -1.62), W, 0.08));
    glass.add(profileGeo([[1.32, 0.9], [0.85, 1.48], [-1.6, 1.52], [-1.66, 0.96]], W * 0.9, 0.05));
    body.add(profileGeo([[0.9, 1.44], [0.8, 1.6], [-1.62, 1.62], [-1.66, 1.48]], W * 0.92, 0.04));
    for (const s of [-1, 1]) {
      body.add(UNIT_BOX, M(s * W * 0.45, 1.2, -0.3, 0, 0.05, 0.6, 0.12));
      trim.add(UNIT_BOX, M(s * (W / 2 + 0.07), 1.0, 0.8, 0, 0.14, 0.12, 0.16), C(0x222222));
      lights.add(UNIT_BOX, M(s * (W / 2 - 0.22), 0.8, L / 2 - 0.03, 0, 0.32, 0.2, 0.08), C(0xdfe8ee));
      lights.add(UNIT_BOX, M(s * (W / 2 - 0.12), 0.85, -L / 2 + 0.02, 0, 0.16, 0.36, 0.06), C(0xa8100c));
    }
    trim.add(UNIT_BOX, M(0, 0.42, L / 2, 0, W, 0.24, 0.1), C(0x2b2c2e)); trim.add(UNIT_BOX, M(0, 0.42, -L / 2, 0, W, 0.24, 0.1), C(0x2b2c2e));
    trim.add(UNIT_BOX, M(0, 0.48, L / 2 + 0.06, 0, 0.34, 0.17, 0.02), C(0xf2d43a)); trim.add(UNIT_BOX, M(0, 0.7, -L / 2 - 0.02, 0, 0.34, 0.17, 0.02), C(0xf2d43a));
    mk('kei', { label: 'けいじどうしゃ', L, W, H: 1.65, wb: f - r, f, r, wr, track: W / 2 - 0.1, maxV: 18, acc: 7, seatX: -0.3, seatY: 0.9, body: body.build(), glass: glass.build(), trim: trim.build(), lights: lights.build(), colors: [0xf6f6f4, 0xe9d9a8, 0x9cc7d9, 0xd94f45, 0x6aa36c, 0xf2b8c6, 0x55585c], max: 14 });
  }
  // ---------- sports
  {
    const L = 4.4, W = 1.92, f = 1.36, r = -1.3, wr = 0.34;
    const body = new GB(), glass = new GB(), trim = new GB(), lights = new GB();
    body.add(profileGeo(lowerBody(L, 0.24, 0.58, 0.82, 0.9, 0.86, f, r, wr + 0.05, 0.8, -1.2), W, 0.09));
    glass.add(profileGeo([[0.88, 0.8], [0.0, 1.16], [-0.7, 1.17], [-1.3, 0.88]], W * 0.82, 0.04));
    body.add(profileGeo([[0.05, 1.12], [-0.02, 1.2], [-0.7, 1.21], [-0.8, 1.14]], W * 0.84, 0.03));
    trim.add(UNIT_BOX, M(0, 1.0, -L / 2 + 0.25, 0, W * 0.92, 0.05, 0.32), C(0x151515)); // spoiler
    for (const s of [-1, 1]) {
      trim.add(UNIT_BOX, M(s * 0.7, 0.92, -L / 2 + 0.3, 0, 0.06, 0.18, 0.12), C(0x151515));
      lights.add(UNIT_BOX, M(s * (W / 2 - 0.32), 0.58, L / 2 - 0.12, 0, 0.46, 0.08, 0.2, -0.4), C(0xe8f0f6));
      lights.add(UNIT_BOX, M(s * (W / 2 - 0.35), 0.74, -L / 2 + 0.02, 0, 0.5, 0.08, 0.06), C(0xc0140e));
      trim.add(UNIT_BOX, M(s * (W / 2 + 0.07), 0.9, 0.62, 0, 0.14, 0.08, 0.16), C(0x151515));
    }
    trim.add(UNIT_BOX, M(0, 0.34, L / 2 - 0.02, 0, W * 0.96, 0.18, 0.1), C(0x151515));
    trim.add(UNIT_BOX, M(0, 0.34, -L / 2 + 0.02, 0, W * 0.96, 0.18, 0.1), C(0x151515));
    mk('sports', { label: 'スポーツカー', L, W, H: 1.2, wb: f - r, f, r, wr, track: W / 2 - 0.14, maxV: 34, acc: 12, maxSteer: 0.55, seatY: 0.62, seatX: -0.4, seatZ: -0.35, body: body.build(), glass: glass.build(), trim: trim.build(), lights: lights.build(), colors: [0xd0201a, 0xf2c200, 0x1d5fd1, 0xf4f4f2, 0x111111, 0xff7a00], max: 5 });
  }
  // ---------- police (sedan based)
  {
    const B = VT.sedan, trim = new GB(), lights = new GB();
    trim.add(B.trim, new THREE.Matrix4());
    for (const s of [-1, 1]) {
      trim.add(UNIT_BOX, M(s * (B.W / 2 + 0.005), 0.72, 0.0, 0, 0.02, 0.36, 2.3), C(0xf4f4f2)); // white doors band
      lights.add(UNIT_BOX, M(s * (B.W / 2 - 0.3), 0.74, B.L / 2 - 0.04, 0, 0.42, 0.12, 0.1), C(0xdfe8ee));
      lights.add(UNIT_BOX, M(s * (B.W / 2 - 0.28), 0.82, -B.L / 2 + 0.03, 0, 0.42, 0.13, 0.08), C(0xa8100c));
    }
    trim.add(UNIT_BOX, M(0, 1.5, -0.35, 0, 1.2, 0.08, 0.3), C(0x222222));
    trim.add(UNIT_BOX, M(0, 1.47, -0.35, 0, 1.24, 0.05, 1.1), C(0xf4f4f2)); // white roof
    lights.add(UNIT_BOX, M(0, 1.6, -0.35, 0, 1.15, 0.14, 0.26), C(0xa01010));
    mk('police', Object.assign({}, B, { name: 'police', label: 'パトカー', maxV: 27, acc: 10, trim: trim.build(), lights: lights.build(), colors: [0x16181b], max: 7, siren: 'police' }));
    VT.police.body = B.body; VT.police.glass = B.glass;
  }
  // ---------- ice cream van
  {
    const L = 5.0, W = 2.0, f = 1.65, r = -1.5, wr = 0.36;
    const body = new GB(), glass = new GB(), trim = new GB(), lights = new GB();
    body.add(profileGeo(lowerBody(L, 0.36, 1.0, 1.08, 1.08, 1.08, f, r, wr + 0.06, 1.85, -2.45), W, 0.06));
    body.add(profileGeo([[1.2, 1.06], [1.2, 2.6], [-2.5, 2.6], [-2.5, 1.06]], W, 0.06));
    glass.add(profileGeo([[2.4, 1.05], [1.6, 1.85], [1.2, 1.9], [1.2, 1.05]], W * 0.9, 0.04));
    body.add(profileGeo([[1.6, 1.82], [1.5, 2.0], [1.2, 2.0], [1.2, 1.82]], W * 0.92, 0.03));
    // serving window, stripes, giant cone
    trim.add(UNIT_BOX, M(-W / 2 - 0.01, 1.7, -0.6, 0, 0.04, 0.9, 1.9), C(0x2b3a44));
    trim.add(UNIT_BOX, M(-W / 2 - 0.25, 2.2, -0.6, 0, 0.5, 0.06, 2.0, 0, 0.25), C(0xff8fb0));
    for (const s of [-1, 1]) trim.add(UNIT_BOX, M(s * (W / 2 + 0.005), 1.25, -0.6, 0, 0.02, 0.2, 3.7), C(0xff6f9a));
    trim.add(new THREE.ConeGeometry(0.35, 0.9, 16).rotateX(Math.PI), M(0, 3.05, -0.8), C(0xd9a25a));
    trim.add(new THREE.SphereGeometry(0.42, 16, 12), M(0, 3.55, -0.8), C(0xf7b5c8));
    trim.add(new THREE.SphereGeometry(0.32, 16, 12), M(0, 3.95, -0.8), C(0xfff2dc));
    trim.add(UNIT_BOX, M(0, 0.5, L / 2, 0, W, 0.24, 0.1), C(0xdddddd)); trim.add(UNIT_BOX, M(0, 0.5, -L / 2, 0, W, 0.24, 0.1), C(0xdddddd));
    for (const s of [-1, 1]) {
      lights.add(UNIT_BOX, M(s * (W / 2 - 0.3), 0.85, L / 2 + 0.01, 0, 0.36, 0.2, 0.06), C(0xdfe8ee));
      lights.add(UNIT_BOX, M(s * (W / 2 - 0.2), 0.95, -L / 2 - 0.01, 0, 0.2, 0.3, 0.06), C(0xa8100c));
    }
    mk('ice', { label: 'アイスクリーム カー', L, W, H: 2.6, wb: f - r, f, r, wr, track: W / 2 - 0.14, maxV: 19, acc: 6.5, seatY: 1.05, seatZ: 0.7, seatX: -0.45, body: body.build(), glass: glass.build(), trim: trim.build(), lights: lights.build(), colors: [0xfbfaf6], max: 2, siren: 'ice' });
  }
  // ---------- fire truck
  {
    const L = 7.4, W = 2.3, f = 2.6, r = -1.9, wr = 0.45;
    const body = new GB(), glass = new GB(), trim = new GB(), lights = new GB();
    body.add(profileGeo(lowerBody(L, 0.5, 1.2, 1.3, 1.3, 1.3, f, r, wr + 0.08, 3.6, -3.65), W, 0.06));
    body.add(profileGeo([[3.7, 1.25], [3.62, 2.7], [2.0, 2.75], [2.0, 1.25]], W, 0.06)); // cab
    glass.add(profileGeo([[3.72, 1.6], [3.66, 2.5], [2.6, 2.55], [2.6, 1.6]], W * 1.01, 0.02));
    body.add(UNIT_BOX, M(0, 1.95, -0.9, 0, W, 1.4, 5.4));
    // ladder + rails + stripe + lights
    for (const s of [-1, 1]) trim.add(UNIT_BOX, M(s * 0.45, 2.85, -0.6, 0, 0.08, 0.12, 6.4), C(0xd8dcdf));
    for (let k = 0; k < 16; k++) trim.add(UNIT_BOX, M(0, 2.85, -3.6 + k * 0.4, 0, 0.9, 0.05, 0.05), C(0xd8dcdf));
    trim.add(UNIT_BOX, M(0, 2.7, -3.4, 0, 1.2, 0.3, 0.6), C(0x666a6e));
    for (const s of [-1, 1]) { trim.add(UNIT_BOX, M(s * (W / 2 + 0.005), 1.5, 0, 0, 0.02, 0.16, 7.2), C(0xf4f4f2)); for (let k = 0; k < 4; k++) trim.add(UNIT_BOX, M(s * (W / 2 + 0.01), 1.95, -2.9 + k * 1.3, 0, 0.02, 1.0, 1.1), C(0xb01c16)); }
    trim.add(UNIT_BOX, M(0, 0.62, L / 2 + 0.02, 0, W, 0.3, 0.15), C(0xc8c8c8));
    trim.add(UNIT_BOX, M(0.7, 1.55, L / 2 - 0.25, 0, 0.3, 0.3, 0.3), C(0xd8b030)); // bell
    lights.add(UNIT_BOX, M(0, 2.85, 2.9, 0, 1.6, 0.16, 0.3), C(0xd01010));
    for (const s of [-1, 1]) { lights.add(UNIT_BOX, M(s * (W / 2 - 0.3), 1.0, L / 2 + 0.02, 0, 0.36, 0.22, 0.06), C(0xdfe8ee)); lights.add(UNIT_BOX, M(s * (W / 2 - 0.2), 1.0, -L / 2 - 0.01, 0, 0.22, 0.3, 0.06), C(0xa8100c)); }
    mk('fire', { label: 'しょうぼうしゃ', L, W, H: 3.0, wb: f - r, f, r, wr, track: W / 2 - 0.18, maxV: 20, acc: 6, maxSteer: 0.5, seatY: 1.55, seatZ: 3.05, seatX: -0.5, mass: 2.5, body: body.build(), glass: glass.build(), trim: trim.build(), lights: lights.build(), colors: [0xc8201a], max: 2, siren: 'fire' });
  }
  // ---------- kindergarten bus
  {
    const L = 7.0, W = 2.2, f = 2.4, r = -2.0, wr = 0.42;
    const body = new GB(), glass = new GB(), trim = new GB(), lights = new GB();
    body.add(profileGeo([[-L / 2, 0.55], [r - wr - 0.08, 0.45], { arc: [r, 0.45, wr + 0.08] }, [f - wr - 0.08, 0.45], { arc: [f, 0.45, wr + 0.08] }, [L / 2, 0.45], [L / 2, 1.3], [L / 2 - 0.4, 2.75], [-L / 2 + 0.1, 2.8], [-L / 2, 2.6]], W, 0.12));
    glass.add(profileGeo([[L / 2 + 0.01, 1.35], [L / 2 - 0.36, 2.6], [L / 2 - 1.0, 2.6], [L / 2 - 1.0, 1.35]], W * 0.96, 0.03));
    for (const s of [-1, 1]) for (let k = 0; k < 5; k++) glass.add(UNIT_BOX, M(s * (W / 2 + 0.01), 2.0, L / 2 - 1.55 - k * 1.1, 0, 0.04, 0.8, 0.95));
    for (const s of [-1, 1]) { trim.add(UNIT_BOX, M(s * (W / 2 + 0.015), 1.2, 0, 0, 0.02, 0.18, L - 0.3), C(0x2f7de0)); }
    trim.add(UNIT_BOX, M(0, 0.6, L / 2 + 0.03, 0, W, 0.26, 0.1), C(0x333333)); trim.add(UNIT_BOX, M(0, 0.6, -L / 2 - 0.03, 0, W, 0.26, 0.1), C(0x333333));
    // cute ears on the roof (kindergarten bus)
    for (const s of [-1, 1]) trim.add(new THREE.SphereGeometry(0.32, 14, 10), M(s * 0.7, 2.8, L / 2 - 0.9, 0, 1, 1, 0.5), C(0xf0b020));
    for (const s of [-1, 1]) { lights.add(UNIT_BOX, M(s * (W / 2 - 0.3), 0.95, L / 2 + 0.02, 0, 0.36, 0.22, 0.06), C(0xdfe8ee)); lights.add(UNIT_BOX, M(s * (W / 2 - 0.2), 1.0, -L / 2 - 0.02, 0, 0.22, 0.32, 0.06), C(0xa8100c)); }
    mk('bus', { label: 'ようちえん バス', L, W, H: 2.8, wb: f - r, f, r, wr, track: W / 2 - 0.16, maxV: 18, acc: 5.5, maxSteer: 0.52, seatY: 1.35, seatZ: 2.8, seatX: -0.55, mass: 2.5, body: body.build(), glass: glass.build(), trim: trim.build(), lights: lights.build(), colors: [0xf6c818], max: 2 });
  }

  // ---------- instanced meshes per type
  const paint = new THREE.MeshPhysicalMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.32, metalness: 0.35, clearcoat: 1, clearcoatRoughness: 0.06, envMapIntensity: 1.2 });
  const glassM = new THREE.MeshStandardMaterial({ color: 0x1a2128, roughness: 0.04, metalness: 0.6, transparent: true, opacity: 0.78, envMapIntensity: 1.6, vertexColors: true });
  const trimM = new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.5, metalness: 0.15 });
  const lightM = new THREE.MeshBasicMaterial({ vertexColors: true });
  for (const k in VT) {
    const T = VT[k];
    T.im = {};
    for (const [part, mat] of [['body', paint], ['glass', glassM], ['trim', trimM], ['lights', lightM]]) {
      const m = new THREE.InstancedMesh(T[part], mat, T.max); m.count = 0; m.castShadow = part !== 'glass' && part !== 'lights'; m.receiveShadow = part === 'body' || part === 'trim'; m.frustumCulled = false;
      m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      if (part === 'body') { m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(T.max * 3), 3); }
      scene.add(m); T.im[part] = m;
    }
    T.used = 0;
  }
  const tire = new THREE.CylinderGeometry(1, 1, 1, 22).rotateZ(Math.PI / 2);
  const rim = new GB();
  rim.add(new THREE.CylinderGeometry(0.68, 0.68, 1.04, 18).rotateZ(Math.PI / 2), M(0, 0, 0), col(0xc9ccd0));
  for (let k = 0; k < 5; k++) rim.add(UNIT_BOX, M(0, 0, 0, 0, 1.08, 0.1, 0.62, k * Math.PI / 5 * 2), col(0x8a8d91));
  WHEELS.tire = new THREE.InstancedMesh(tire, new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.85 }), 200);
  WHEELS.rim = new THREE.InstancedMesh(rim.build(), new THREE.MeshStandardMaterial({ color: 0xffffff, vertexColors: true, roughness: 0.25, metalness: 0.9 }), 200);
  for (const w of [WHEELS.tire, WHEELS.rim]) { w.count = 0; w.castShadow = true; w.frustumCulled = false; w.instanceMatrix.setUsage(THREE.DynamicDrawUsage); scene.add(w); }
  // driver heads
  WHEELS.head = new THREE.InstancedMesh(new THREE.SphereGeometry(0.115, 12, 10), new THREE.MeshStandardMaterial({ color: 0xd9a888, roughness: 0.7 }), 80);
  WHEELS.hair = new THREE.InstancedMesh(new THREE.SphereGeometry(0.125, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), new THREE.MeshStandardMaterial({ color: 0x1c1612, roughness: 0.8 }), 80);
  for (const w of [WHEELS.head, WHEELS.hair]) { w.count = 0; w.frustumCulled = false; scene.add(w); }
  // blob shadows under cars (soft contact)
  WHEELS.blob = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: TX.blob, transparent: true, depthWrite: false, opacity: 0.7, polygonOffset: true, polygonOffsetFactor: -4 }), 80);
  WHEELS.blob.count = 0; WHEELS.blob.frustumCulled = false; scene.add(WHEELS.blob);
}
const WHEELS = {};

// ================================================================ vehicle object
let vehId = 0;
function spawnVehicle(type, x, z, h, opts) {
  const T = VT[type]; if (T.used >= T.max) return null;
  const v = Object.assign({
    id: vehId++, type, T, x, z, y: groundY(x, z), h, vx: 0, vz: 0, vy: 0, vf: 0, pitch: 0, roll: 0, steer: 0, spin: 0,
    ai: 'park', driver: false, color: pick(T.colors), slot: T.used++, air: false, stopT: 0, honkT: 0, siren: false, bumpT: 0, stuckT: 0, lane: null, mission: false, hp: 3
  }, opts || {});
  T.im.body.setColorAt(v.slot, new THREE.Color(v.color));
  T.im.body.instanceColor.needsUpdate = true;
  for (const p in T.im) T.im[p].count = T.used;
  VEH.push(v);
  return v;
}
function removeVehicle(v) {
  // swap with the last slot of its type
  const T = v.T, last = VEH.find(o => o.T === T && o.slot === T.used - 1);
  if (last && last !== v) { last.slot = v.slot; T.im.body.setColorAt(last.slot, new THREE.Color(last.color)); T.im.body.instanceColor.needsUpdate = true; }
  T.used--; for (const p in T.im) T.im[p].count = T.used;
  VEH.splice(VEH.indexOf(v), 1);
  if (v.sirenMesh) { scene.remove(v.sirenMesh); }
}
function setVehColor(v, c) { v.color = c; v.T.im.body.setColorAt(v.slot, new THREE.Color(c)); v.T.im.body.instanceColor.needsUpdate = true; }

const _vm = new THREE.Matrix4(), _wm = new THREE.Matrix4(), _tmp = new THREE.Matrix4();
function renderVehicles(dt) {
  let wi = 0, hi = 0, bi = 0;
  const camP = camera.position;
  for (const v of VEH) {
    const T = v.T;
    _e.set(v.pitch, v.h, v.roll, 'YXZ'); _q.setFromEuler(_e);
    _vm.compose(_v.set(v.x, v.y, v.z), _q, _s.set(1, 1, 1));
    for (const p in T.im) T.im[p].setMatrixAt(v.slot, _vm);
    // wheels
    v.spin += v.vf * dt / T.wr;
    const near = (v.x - camP.x) ** 2 + (v.z - camP.z) ** 2 < 160 * 160;
    if (near) for (const [ax, steer] of [[T.f, true], [T.r, false]]) for (const s of [-1, 1]) {
      _e.set(v.spin, steer ? -v.steer * T.maxSteer * 0.8 : 0, 0, 'YXZ'); _q.setFromEuler(_e);
      _tmp.compose(_v.set(s * T.track, T.wr - (v.air ? 0.08 : 0), ax), _q, _s.set(0.26, T.wr, T.wr));
      _wm.multiplyMatrices(_vm, _tmp);
      WHEELS.tire.setMatrixAt(wi, _wm);
      _tmp.compose(_v.set(s * (T.track + 0.002), T.wr, ax), _q, _s.set(0.27, T.wr, T.wr));
      _wm.multiplyMatrices(_vm, _tmp);
      WHEELS.rim.setMatrixAt(wi, _wm); wi++;
    }
    if (v.driver && v.ai !== 'player') {
      _tmp.makeTranslation(T.seatX, T.seatY + 0.42, T.seatZ); _wm.multiplyMatrices(_vm, _tmp);
      WHEELS.head.setMatrixAt(hi, _wm); _tmp.makeTranslation(T.seatX, T.seatY + 0.45, T.seatZ - 0.01); _wm.multiplyMatrices(_vm, _tmp); WHEELS.hair.setMatrixAt(hi, _wm); hi++;
    }
    if (near) {
      _e.set(0, v.h, 0, 'YXZ'); _q.setFromEuler(_e);
      _wm.compose(_v.set(v.x, groundY(v.x, v.z) + 0.02, v.z), _q, _s.set(T.W * 1.25, 1, T.L * 1.12));
      WHEELS.blob.setMatrixAt(bi++, _wm);
    }
    // siren light bar
    if (T.siren === 'police' || T.siren === 'fire') {
      if (!v.sirenMesh) {
        const g = new THREE.Group();
        const a = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.28), new THREE.MeshBasicMaterial({ color: 0xff2020, toneMapped: false }));
        const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.16, 0.28), new THREE.MeshBasicMaterial({ color: T.siren === 'police' ? 0xff2020 : 0xff2020, toneMapped: false }));
        a.position.x = -0.3; b.position.x = 0.3; g.add(a, b); g.userData = { a, b }; v.sirenMesh = g; scene.add(g);
      }
      const g = v.sirenMesh;
      g.visible = v.siren;
      if (v.siren) {
        g.position.set(v.x, v.y, v.z); g.rotation.set(v.pitch, v.h, v.roll, 'YXZ');
        g.updateMatrix();
        const t = performance.now() / 1000, on = Math.sin(t * 14) > 0;
        g.userData.a.position.set(-0.3, T.siren === 'police' ? 1.62 : 2.88, T.siren === 'police' ? -0.35 : 2.9);
        g.userData.b.position.set(0.3, g.userData.a.position.y, g.userData.a.position.z);
        g.userData.a.material.color.setHex(on ? 0xff2a2a : 0x401010); g.userData.b.material.color.setHex(on ? 0x401010 : 0xff2a2a);
      }
    }
  }
  WHEELS.tire.count = WHEELS.rim.count = wi; WHEELS.head.count = WHEELS.hair.count = hi; WHEELS.blob.count = bi;
  for (const w of [WHEELS.tire, WHEELS.rim, WHEELS.head, WHEELS.hair, WHEELS.blob]) w.instanceMatrix.needsUpdate = true;
  for (const k in VT) for (const p in VT[k].im) VT[k].im[p].instanceMatrix.needsUpdate = true;
}

// ================================================================ collision helpers
function vAxes(v) { const fx = Math.sin(v.h), fz = Math.cos(v.h); return [fx, fz, fz, -fx]; }
const _hit = { nx: 0, nz: 0, d: 0 };
function obbBox(cx, cz, hl, hw, fx, fz, b) {
  const lx = fz, lz = -fx;
  const bx = (b.x0 + b.x1) / 2, bz = (b.z0 + b.z1) / 2, bhx = (b.x1 - b.x0) / 2, bhz = (b.z1 - b.z0) / 2;
  const dx = cx - bx, dz = cz - bz;
  let best = 1e9, nx = 0, nz = 0;
  const axes = [1, 0, 0, 1, fx, fz, lx, lz];
  for (let k = 0; k < 8; k += 2) {
    const ax = axes[k], az = axes[k + 1];
    const rA = hl * Math.abs(fx * ax + fz * az) + hw * Math.abs(lx * ax + lz * az);
    const rB = bhx * Math.abs(ax) + bhz * Math.abs(az);
    const dist = dx * ax + dz * az, ov = rA + rB - Math.abs(dist);
    if (ov <= 0) return null;
    if (ov < best) { best = ov; const s = dist < 0 ? -1 : 1; nx = ax * s; nz = az * s; }
  }
  _hit.nx = nx; _hit.nz = nz; _hit.d = best; return _hit;
}
function obbCircle(cx, cz, hl, hw, fx, fz, ox, oz, r) {
  const lx = fz, lz = -fx, dx = ox - cx, dz = oz - cz;
  const a = clamp(dx * fx + dz * fz, -hl, hl), l = clamp(dx * lx + dz * lz, -hw, hw);
  const px = cx + fx * a + lx * l, pz = cz + fz * a + lz * l;
  let ex = px - ox, ez = pz - oz, d = Math.hypot(ex, ez);
  if (d >= r) return null;
  if (d < 1e-4) { ex = cx - ox; ez = cz - oz; d = Math.hypot(ex, ez) || 1; _hit.nx = ex / d; _hit.nz = ez / d; _hit.d = r; return _hit; }
  _hit.nx = ex / d; _hit.nz = ez / d; _hit.d = r - d; return _hit;
}
function obbObb(a, b) {
  const [afx, afz, alx, alz] = vAxes(a), [bfx, bfz, blx, blz] = vAxes(b);
  const ahl = a.T.L / 2, ahw = a.T.W / 2, bhl = b.T.L / 2, bhw = b.T.W / 2;
  const dx = a.x - b.x, dz = a.z - b.z;
  let best = 1e9, nx = 0, nz = 0;
  const axes = [afx, afz, alx, alz, bfx, bfz, blx, blz];
  for (let k = 0; k < 8; k += 2) {
    const ax = axes[k], az = axes[k + 1];
    const rA = ahl * Math.abs(afx * ax + afz * az) + ahw * Math.abs(alx * ax + alz * az);
    const rB = bhl * Math.abs(bfx * ax + bfz * az) + bhw * Math.abs(blx * ax + blz * az);
    const dist = dx * ax + dz * az, ov = rA + rB - Math.abs(dist);
    if (ov <= 0) return null;
    if (ov < best) { best = ov; const s = dist < 0 ? -1 : 1; nx = ax * s; nz = az * s; }
  }
  _hit.nx = nx; _hit.nz = nz; _hit.d = best; return _hit;
}

// ================================================================ physics drive (player / chasers)
const _cq = [];
function driveVehicle(v, thr, steer, hb, dt) {
  const T = v.T;
  let fx = Math.sin(v.h), fz = Math.cos(v.h);
  let vf = v.vx * fx + v.vz * fz, vl = v.vx * fz - v.vz * fx;
  const g = groundY(v.x, v.z);
  if (!v.air) {
    if (thr > 0) { if (vf < -0.3) vf = Math.min(0, vf + T.brake * thr * dt); else vf += T.acc * thr * Math.max(0, 1 - vf / T.maxV) * dt; }
    else if (thr < 0) { if (vf > 0.3) vf = Math.max(0, vf + T.brake * thr * dt); else vf += T.acc * 0.7 * thr * Math.max(0, 1 + vf / (T.maxV * 0.3)) * dt; }
    else { const dr = (0.5 + Math.abs(vf) * 0.06) * dt * 2.2; vf = Math.abs(vf) <= dr ? 0 : vf - Math.sign(vf) * dr; }
    if (hb) vf *= Math.exp(-1.4 * dt);
    v.steer = damp(v.steer, steer, 7, dt);
    const sa = v.steer * T.maxSteer / (1 + Math.abs(vf) * 0.045);
    let yaw = -vf * Math.tan(sa) / T.wb;
    if (hb && Math.abs(vf) > 5) yaw *= 1.45;
    v.h += yaw * dt;
    vl *= Math.exp(-(hb ? 1.6 : 9) * dt);
    v.slip = Math.abs(vl);
    fx = Math.sin(v.h); fz = Math.cos(v.h);
    v.vx = fx * vf + fz * vl; v.vz = fz * vf - fx * vl;
  } else {
    v.vx *= Math.exp(-0.05 * dt); v.vz *= Math.exp(-0.05 * dt);
  }
  v.vf = vf;
  v.x += v.vx * dt; v.z += v.vz * dt;
  vertical(v, dt);
  return collideVehicle(v);
}
function vertical(v, dt) {
  const T = v.T, fx = Math.sin(v.h), fz = Math.cos(v.h);
  const g = groundY(v.x, v.z);
  if (!v.air) {
    const prev = v.y;
    if (g < v.y - 0.25 && Math.abs(v.vf) > 6) {
      // left a ramp
      v.air = true; v.vy = v.gvy || 0; v.airT = 0;
    } else {
      v.y = damp(v.y, g, 30, dt);
      v.gvy = (v.y - prev) / Math.max(dt, 1e-3);
      const gf = groundY(v.x + fx * T.L * 0.4, v.z + fz * T.L * 0.4), gb = groundY(v.x - fx * T.L * 0.4, v.z - fz * T.L * 0.4);
      v.pitch = damp(v.pitch, -Math.atan2(gf - gb, T.L * 0.8), 14, dt);
      v.roll = damp(v.roll, clamp(-v.vf * v.steer * 0.006, -0.06, 0.06), 6, dt);
    }
  }
  if (v.air) {
    v.airT += dt;
    v.vy -= 13 * dt; v.y += v.vy * dt;
    v.pitch = damp(v.pitch, clamp(-v.vy * 0.04, -0.35, 0.35), 2, dt);
    if (v.y <= g) { v.y = g; v.air = false; v.landV = -v.vy; v.vy = 0; if (v.onLand) v.onLand(v); }
  }
}
function collideVehicle(v) {
  const T = v.T, [fx, fz] = vAxes(v), hl = T.L / 2, hw = T.W / 2;
  let impact = 0, hitWhat = null;
  colQuery(v.x, v.z, hl + 1, _cq);
  for (const o of _cq) {
    let h;
    if (o.t === 'b') { if (v.y > o.h - 0.2) continue; h = obbBox(v.x, v.z, hl, hw, fx, fz, o); }
    else {
      if (v.y > o.h) continue;
      h = obbCircle(v.x, v.z, hl, hw, fx, fz, o.x, o.z, o.r);
      if (h && o.prop) { const sp = Math.hypot(v.vx, v.vz); if (sp > 2.5) { knockProp(o.prop, v.vx, v.vz, sp); continue; } }
    }
    if (!h) continue;
    v.x += h.nx * h.d; v.z += h.nz * h.d;
    const vn = v.vx * h.nx + v.vz * h.nz;
    if (vn < 0) { v.vx -= 1.25 * vn * h.nx; v.vz -= 1.25 * vn * h.nz; v.vx *= 0.85; v.vz *= 0.85; if (-vn > impact) { impact = -vn; hitWhat = o; } }
  }
  // vehicles
  for (const o of VEH) {
    if (o === v || Math.abs(o.x - v.x) > 9 || Math.abs(o.z - v.z) > 9) continue;
    if (Math.abs(o.y - v.y) > 1.6) continue;
    const h = obbObb(v, o); if (!h) continue;
    const dyn = o.ai === 'park' || o.ai === 'police' || o.ai === 'player';
    const mv = v.T.mass, mo = dyn ? o.T.mass : 1e9, kv = mo / (mv + mo), ko = mv / (mv + mo);
    v.x += h.nx * h.d * kv; v.z += h.nz * h.d * kv;
    if (dyn) { o.x -= h.nx * h.d * ko; o.z -= h.nz * h.d * ko; }
    const rvx = v.vx - (o.vx || 0), rvz = v.vz - (o.vz || 0), vn = rvx * h.nx + rvz * h.nz;
    if (vn < 0) {
      const j = -1.3 * vn;
      v.vx += h.nx * j * kv; v.vz += h.nz * j * kv;
      if (dyn) { o.vx -= h.nx * j * ko; o.vz -= h.nz * j * ko; }
      if (-vn > impact) { impact = -vn; hitWhat = o; }
      if (o.ai === 'lane') { o.bumpT = 1.6; o.honkT = 0.1; }
      if (o.onBump) o.onBump(o, -vn, v);
    }
  }
  return impact > 0 ? { impact, what: hitWhat } : null;
}
// parked/bumped dynamic vehicles slide to a stop
function settleVehicle(v, dt) {
  const k = Math.exp(-3 * dt);
  v.vx *= k; v.vz *= k; v.vf = 0;
  if (Math.abs(v.vx) + Math.abs(v.vz) > 0.05) { v.x += v.vx * dt; v.z += v.vz * dt; collideVehicle(v); }
  vertical(v, dt);
}

// ================================================================ lane traffic AI
const TI = RW + 1.5;
const nodePos = (i, j) => [roadC(i), roadC(j)];
function laneSpawn(v, i, j, dx, dz, s, lo) {
  v.lane = { i, j, dx, dz, s, lo, mode: 'seg', turn: null };
  lanePos(v); v.ai = 'lane'; v.driver = true;
}
function lanePos(v) {
  const L = v.lane;
  if (L.mode === 'seg') {
    const [nx, nz] = nodePos(L.i, L.j), lx = L.dz, lz = -L.dx;
    v.x = nx + L.dx * L.s + lx * L.lo; v.z = nz + L.dz * L.s + lz * L.lo;
    v.h = Math.atan2(L.dx, L.dz);
  } else {
    const t = L.turn, u = t.t, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u;
    v.x = a * t.p0[0] + b * t.p1[0] + c * t.p2[0]; v.z = a * t.p0[1] + b * t.p1[1] + c * t.p2[1];
    const tx = 2 * (1 - u) * (t.p1[0] - t.p0[0]) + 2 * u * (t.p2[0] - t.p1[0]), tz = 2 * (1 - u) * (t.p1[1] - t.p0[1]) + 2 * u * (t.p2[1] - t.p1[1]);
    v.h = Math.atan2(tx, tz);
  }
}
function randomLaneSpawn(v, avoidX, avoidZ, minD) {
  for (let tries = 0; tries < 40; tries++) {
    const horiz = RND() < 0.5, k = ri(0, NB), s0 = ri(0, NB - 1);
    let i, j, dx, dz;
    if (horiz) { j = k; const fwd = RND() < 0.5; dx = fwd ? 1 : -1; dz = 0; i = fwd ? s0 : s0 + 1; }
    else { i = k; const fwd = RND() < 0.5; dz = fwd ? 1 : -1; dx = 0; j = fwd ? s0 : s0 + 1; }
    const s = rr(TI + 4, P - TI - 6), lo = RND() < 0.5 ? 1.75 : 5.25;
    const [nx, nz] = nodePos(i, j), x = nx + dx * s + dz * lo, z = nz + dz * s - dx * lo;
    if (avoidX != null && Math.hypot(x - avoidX, z - avoidZ) < minD) continue;
    if (VEH.some(o => o !== v && Math.hypot(o.x - x, o.z - z) < 9)) continue;
    laneSpawn(v, i, j, dx, dz, s, lo); v.y = 0; v.vx = v.vz = 0; v.air = false;
    return true;
  }
  return false;
}
function chooseTurn(i, j, dx, dz, prefer) {
  const opts = [];
  for (const [ndx, ndz] of [[dx, dz], [dz, -dx], [-dz, dx]]) {
    const ni = i + ndx, nj = j + ndz;
    if (ni < 0 || nj < 0 || ni > NB || nj > NB) continue;
    opts.push([ndx, ndz]);
  }
  if (!opts.length) return [-dx, -dz];
  if (prefer) { opts.sort((a, b) => prefer(a) - prefer(b)); return opts[0]; }
  // prefer straight a bit
  if (opts.length > 1 && opts[0][0] === dx && opts[0][1] === dz && RND() < 0.45) return opts[0];
  return pick(opts);
}
function beginTurn(v, prefer) {
  const L = v.lane, ni = L.i + L.dx, nj = L.j + L.dz, [nx, nz] = nodePos(ni, nj);
  const [ndx, ndz] = chooseTurn(ni, nj, L.dx, L.dz, prefer);
  const lx = L.dz, lz = -L.dx, nlx = ndz, nlz = -ndx, lo = L.lo;
  const p0 = [v.x, v.z];
  const p2 = [nx + ndx * TI + nlx * lo, nz + ndz * TI + nlz * lo];
  let p1;
  if (ndx === L.dx && ndz === L.dz) p1 = [(p0[0] + p2[0]) / 2, (p0[1] + p2[1]) / 2];
  else if (ndx === -L.dx && ndz === -L.dz) p1 = [nx + L.dx * 6, nz + L.dz * 6];
  else p1 = [nx + lx * lo + nlx * lo, nz + lz * lo + nlz * lo];
  let len = 0, px = p0[0], pz = p0[1];
  for (let k = 1; k <= 8; k++) { const u = k / 8, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u; const x = a * p0[0] + b * p1[0] + c * p2[0], z = a * p0[1] + b * p1[1] + c * p2[1]; len += Math.hypot(x - px, z - pz); px = x; pz = z; }
  L.mode = 'turn'; L.turn = { p0, p1, p2, len, t: 0, ni, nj, ndx, ndz, straight: ndx === L.dx && ndz === L.dz };
}
function laneObstacleGap(v, fx, fz, ignoreAI) {
  let gap = 99;
  const W = v.T.W / 2 + 0.2;
  const test = (x, z, r, hl) => {
    const dx = x - v.x, dz = z - v.z, along = dx * fx + dz * fz;
    if (along <= 0 || along > 32) return;
    const lat = Math.abs(dx * fz - dz * fx);
    if (lat > W + r) return;
    const g = along - v.T.L / 2 - hl;
    if (g < gap) gap = g;
  };
  for (const o of VEH) {
    if (o === v || Math.abs(o.x - v.x) > 34 || Math.abs(o.z - v.z) > 34) continue;
    if (ignoreAI && o.ai === 'lane') continue;
    // only count vehicles roughly going the same way or stopped across our path
    test(o.x, o.z, o.T.W / 2, o.T.L / 2 * 0.8);
  }
  if (PLAYER && !PLAYER.veh) test(PLAYER.x, PLAYER.z, 0.4, 0.3);
  for (const p of PEDS) if (p.onRoad) test(p.x, p.z, 0.4, 0.3);
  return gap;
}
function updateLaneAI(v, dt) {
  const L = v.lane;
  const cruise = v.cruise || 10;
  let target = cruise;
  const fx = Math.sin(v.h), fz = Math.cos(v.h);
  if (v.bumpT > 0) { v.bumpT -= dt; target = 0; }
  // obstacle
  const gap = laneObstacleGap(v, fx, fz, v.ignoreT > 0);
  if (v.ignoreT > 0) v.ignoreT -= dt;
  const want = Math.sqrt(Math.max(0, 2 * 5 * (gap - 2.2)));
  if (want < target) { target = want; if (gap < 4) { v.stuckT += dt; if (v.stuckT > 5) { v.ignoreT = 2.5; v.stuckT = 0; } } }
  else v.stuckT = 0;
  // red light
  if (L.mode === 'seg' && !v.ignoreLights) {
    const axis = L.dx ? 'x' : 'z', st = tlState(axis);
    const stopS = P - 12.1 - v.T.L / 2;
    if (st !== 0 && L.s < stopS + 0.3) {
      const d = stopS - L.s;
      if (!(st === 1 && d < 4)) { const w2 = Math.sqrt(Math.max(0, 2 * 5 * Math.max(0, d))); if (w2 < target) target = w2; }
    }
  }
  if (L.mode === 'turn' && !L.turn.straight) target = Math.min(target, 6);
  // accelerate / brake
  const acc = target > v.vf ? 3.5 : 9;
  v.vf = v.vf + clamp(target - v.vf, -acc * dt, acc * dt);
  if (v.vf < 0.02) v.vf = 0;
  const ds = v.vf * dt;
  if (L.mode === 'seg') {
    L.s += ds;
    if (L.s >= P - TI) { beginTurn(v, v.routePrefer); }
  } else {
    const t = L.turn; t.t += ds / t.len;
    if (t.t >= 1) { L.i = t.ni; L.j = t.nj; L.dx = t.ndx; L.dz = t.ndz; L.s = TI; L.mode = 'seg'; L.turn = null; }
  }
  const ox = v.x, oz = v.z;
  lanePos(v);
  v.vx = (v.x - ox) / Math.max(dt, 1e-4); v.vz = (v.z - oz) / Math.max(dt, 1e-4);
  v.y = 0; v.pitch = damp(v.pitch, 0, 5, dt); v.roll = 0;
  v.steer = 0;
  if (v.honkT > 0) { v.honkT -= dt; if (v.honkT <= 0 && distToPlayer(v) < 30) { AU.honk(0.5); } }
}
function distToPlayer(o) { return Math.hypot(o.x - PLAYER.x, o.z - PLAYER.z); }

// convert a free (parked) vehicle back into lane traffic at a far spot
function recycleToLane(v) {
  return randomLaneSpawn(v, PLAYER.x, PLAYER.z, 90);
}

// ================================================================ chaser AI (police / missions)
function nearestNode(x, z) { return [clamp(Math.round((x + HALF) / P), 0, NB), clamp(Math.round((z + HALF) / P), 0, NB)]; }
function chaseAI(v, tx, tz, dt, maxV) {
  const d = Math.hypot(tx - v.x, tz - v.z);
  let gx = tx, gz = tz;
  if (d > 30) {
    // waypoint routing on the road grid
    if (!v.wp || Math.hypot(v.wp[0] - v.x, v.wp[1] - v.z) < 9) {
      const [ci, cj] = v.wp ? v.wpN : nearestNode(v.x, v.z);
      const [ti, tj] = nearestNode(tx, tz);
      let best = null, bd = 1e9;
      for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [0, 0]]) {
        const ni = ci + di, nj = cj + dj; if (ni < 0 || nj < 0 || ni > NB || nj > NB) continue;
        if (v.wpPrev && v.wpPrev[0] === ni && v.wpPrev[1] === nj) continue;
        const dd = Math.abs(ni - ti) + Math.abs(nj - tj) + (di === 0 && dj === 0 ? (v.wp ? 99 : 0.5) : 0);
        if (dd < bd) { bd = dd; best = [ni, nj]; }
      }
      v.wpPrev = v.wpN; v.wpN = best; v.wp = nodePos(best[0], best[1]);
    }
    gx = v.wp[0]; gz = v.wp[1];
  } else { v.wp = null; v.wpPrev = null; }
  const ang = Math.atan2(gx - v.x, gz - v.z), diff = angWrap(ang - v.h);
  let thr = Math.abs(diff) > 1.2 ? 0.35 : 1, steer = clamp(-diff * 2, -1, 1);
  if (v.vf > (maxV || v.T.maxV * 0.8)) thr = 0;
  if (d < 6) thr = Math.min(thr, (d - 3) * 0.3);
  // unstick
  if (Math.abs(v.vf) < 1 && thr > 0.3) v.stuckT += dt; else v.stuckT = Math.max(0, v.stuckT - dt);
  if (v.revT > 0) { v.revT -= dt; thr = -1; steer = -steer; }
  else if (v.stuckT > 1.4) { v.revT = 1.1; v.stuckT = 0; }
  return driveVehicle(v, thr, steer, false, dt);
}

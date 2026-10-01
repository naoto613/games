// ================================================================ world layout
const WS = 640, WH = WS / 2;
const PL = {
  village: { x: 0, z: 178, r: 40, h: 3.6, name: 'ひかりむら', sub: 'HIKARI VILLAGE' },
  cave: { x: 176, z: 70, r: 11, h: 7.5, name: 'どんぐりの どうくつ', sub: 'ACORN CAVE' },
  forest: { x: -150, z: -96, r: 34, h: 4.2, name: 'もりの まち ポプラ', sub: 'POPLAR TOWN' },
  lake: { x: 150, z: -146, r: 46 },
  shrine: { x: 150, z: -146, r: 11, h: 1.9, name: 'みずうみの ほこら', sub: 'LAKE SHRINE' },
  castle: { x: 0, z: -236, r: 44, h: 13, name: 'よふかし まおうの しろ', sub: 'CASTLE OF NIGHT' },
  bridge: { x: 0 },
};
function riverZ(x) { return -14 + 12 * Math.sin(x * 0.018) + 5 * Math.sin(x * 0.05 + 1); }
PL.bridge.z = riverZ(0);
const ROADS = [
  [[0, 160], [2, 120], [-4, 70], [0, 30], [0, PL.bridge.z + 16]],
  [[0, PL.bridge.z - 16], [0, -40], [-36, -66], [-80, -84], [-118, -94]],
  [[16, 168], [60, 140], [104, 112], [140, 88], [166, 72]],
  [[0, -40], [46, -62], [100, -78], [140, -88], [150, -96]],
  [[0, -40], [4, -100], [-6, -150], [0, -192]],
];
const N1 = makeNoise2(101, 128), N2 = makeNoise2(202, 128), N3 = makeNoise2(303, 64);
function segDist(px, pz, ax, az, bx, bz) {
  const dx = bx - ax, dz = bz - az, l = dx * dx + dz * dz;
  const t = l ? clamp(((px - ax) * dx + (pz - az) * dz) / l, 0, 1) : 0;
  return Math.hypot(px - ax - dx * t, pz - az - dz * t);
}
function roadDist(x, z) {
  let d = 1e9;
  for (const r of ROADS) for (let i = 0; i < r.length - 1; i++) d = Math.min(d, segDist(x, z, r[i][0], r[i][1], r[i + 1][0], r[i + 1][1]));
  return d;
}
function ridged(x, z) { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 4; i++) { const n = 1 - Math.abs(N2(x * f, z * f) * 2 - 1); s += a * n * n; f *= 2.1; a *= 0.5; } return s; }
function edgeDist(x, z) { const p = 6, ax = Math.abs(x) / WH, az = Math.abs(z) / WH; return Math.pow(Math.pow(ax, p) + Math.pow(az, p), 1 / p) * WH; }
function rawHeight(x, z) {
  let h = 3.2 + (fbm(N1, x * 0.011 + 20, z * 0.011 + 20, 5) - 0.5) * 16 + (fbm(N3, x * 0.06, z * 0.06, 3) - 0.5) * 1.6;
  // outer mountains
  const ed = edgeDist(x, z), m = sstep(228, 300, ed);
  h += m * (22 + 70 * ridged(x * 0.012, z * 0.012));
  // cave mountain (joined to the east range)
  { const dx = x - 236, dz = z - 70, g = Math.exp(-(dx * dx * 0.6 + dz * dz) / (2 * 46 * 46)); h += g * (44 + 30 * ridged(x * 0.02 + 5, z * 0.02)); }
  // hills behind the castle
  { const dx = x, dz = z + 290, g = Math.exp(-(dx * dx * 0.25 + dz * dz) / (2 * 40 * 40)); h += g * 50 * (0.7 + 0.5 * ridged(x * 0.02, z * 0.02 + 7)); }
  return h;
}
function heightAt(x, z) {
  let h = rawHeight(x, z);
  // places: flatten
  for (const k of ['village', 'cave', 'forest', 'castle']) {
    const p = PL[k], d = Math.hypot(x - p.x, z - p.z), w = k === 'castle' ? 30 : k === 'cave' ? 16 : 26;
    const t = 1 - sstep(p.r, p.r + w, d);
    h = lerp(h, p.h + (k === 'castle' ? 0 : (fbm(N3, x * 0.05, z * 0.05, 2) - 0.5) * 0.6), t);
  }
  // roads: smooth toward a low-frequency version
  const rd = roadDist(x, z);
  if (rd < 12) { const t = (1 - sstep(2.5, 12, rd)) * 0.75; const lo = 3.2 + (fbm(N1, x * 0.011 + 20, z * 0.011 + 20, 2) - 0.5) * 12; h = lerp(h, Math.max(lo, h - 2), t); }
  // river
  const dr = Math.abs(z - riverZ(x));
  h = lerp(h, Math.min(h, 1.4), 1 - sstep(14, 34, dr));
  h = lerp(h, -2.4, 1 - sstep(8.5, 15, dr));
  // lake + island
  const dl = Math.hypot(x - PL.lake.x, z - PL.lake.z);
  h = lerp(h, Math.min(h, 1.2), 1 - sstep(PL.lake.r, PL.lake.r + 22, dl));
  h = lerp(h, -3.2, 1 - sstep(PL.lake.r - 10, PL.lake.r + 4, dl));
  h = lerp(h, PL.shrine.h, 1 - sstep(PL.shrine.r, PL.shrine.r + 6, dl));
  return h;
}
// masks: x = road, y = town plaza (cobble)
function maskAt(x, z) {
  const rd = roadDist(x, z) + (N3(x * 0.3, z * 0.3) - 0.5) * 1.6;
  let road = 1 - sstep(1.6, 3.2, rd);
  let town = 0;
  for (const k of ['village', 'forest']) { const p = PL[k], d = Math.hypot(x - p.x, z - p.z); town = Math.max(town, 1 - sstep(p.r * 0.32, p.r * 0.32 + 2, d)); }
  { const p = PL.castle, d = Math.hypot(x - p.x, z - p.z); town = Math.max(town, 1 - sstep(p.r - 6, p.r - 3, d)); }
  { const p = PL.cave, d = Math.hypot(x - p.x, z - p.z); road = Math.max(road, 1 - sstep(p.r - 3, p.r, d)); }
  return [road, town];
}

// ================================================================ heightmap cache
const HMN = Q.terr + 1, HMS = WS / Q.terr;
const HM = new Float32Array(HMN * HMN);
const MK = new Float32Array(HMN * HMN * 2);
function buildHeightmap() {
  for (let j = 0; j < HMN; j++) for (let i = 0; i < HMN; i++) {
    const x = -WH + i * HMS, z = -WH + j * HMS;
    HM[j * HMN + i] = heightAt(x, z);
    const m = maskAt(x, z); MK[(j * HMN + i) * 2] = m[0]; MK[(j * HMN + i) * 2 + 1] = m[1];
  }
}
function terrainY(x, z) {
  const fx = clamp((x + WH) / HMS, 0, HMN - 1.001), fz = clamp((z + WH) / HMS, 0, HMN - 1.001);
  const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j, k = j * HMN + i;
  // match the triangle split of the mesh (a-b-c / b-d-c)
  const a = HM[k], b = HM[k + 1], c = HM[k + HMN], d = HM[k + HMN + 1];
  if (u + v <= 1) return a + (b - a) * u + (c - a) * v;
  return d + (c - d) * (1 - u) + (b - d) * (1 - v);
}
function roadMaskAt(x, z) {
  const i = clamp(Math.round((x + WH) / HMS), 0, HMN - 1), j = clamp(Math.round((z + WH) / HMS), 0, HMN - 1);
  return MK[(j * HMN + i) * 2] + MK[(j * HMN + i) * 2 + 1];
}

// ================================================================ terrain mesh
const WORLD = new THREE.Group(); scene.add(WORLD);
const TU = { tDirt: { value: null }, tRock: { value: null }, tSand: { value: null }, tCobble: { value: null }, tGrass: { value: null }, uNight: { value: 0 } };
function buildTerrain() {
  const n = HMN, pos = new Float32Array(n * n * 3), uv = new Float32Array(n * n * 2), msk = new Float32Array(n * n * 2);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const k = j * n + i, x = -WH + i * HMS, z = -WH + j * HMS;
    pos[k * 3] = x; pos[k * 3 + 1] = HM[k]; pos[k * 3 + 2] = z;
    uv[k * 2] = x / 4; uv[k * 2 + 1] = z / 4;
    msk[k * 2] = MK[k * 2]; msk[k * 2 + 1] = MK[k * 2 + 1];
  }
  const idx = new Uint32Array((n - 1) * (n - 1) * 6); let q = 0;
  for (let j = 0; j < n - 1; j++) for (let i = 0; i < n - 1; i++) {
    const a = j * n + i, b = a + 1, c = a + n, d = c + 1;
    idx[q++] = a; idx[q++] = c; idx[q++] = b; idx[q++] = b; idx[q++] = c; idx[q++] = d;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setAttribute('aMask', new THREE.BufferAttribute(msk, 2));
  g.setIndex(new THREE.BufferAttribute(idx, 1));
  g.computeVertexNormals();
  TU.tDirt.value = TX.dirt; TU.tRock.value = TX.rock; TU.tSand.value = TX.sand; TU.tCobble.value = TX.cobble; TU.tGrass.value = TX.grass;
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.95, metalness: 0, normalMap: TX.groundN, normalScale: new THREE.Vector2(0.9, 0.9), envMapIntensity: 0.6 });
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, TU);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nattribute vec2 aMask; varying vec2 vMask; varying vec3 vWP; varying vec3 vWN;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvMask = aMask; vWP = (modelMatrix * vec4(position,1.0)).xyz; vWN = normal;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>
uniform sampler2D tDirt, tRock, tSand, tCobble, tGrass; uniform float uNight;
varying vec2 vMask; varying vec3 vWP; varying vec3 vWN;`)
      .replace('#include <map_fragment>', `
{
  vec2 p = vWP.xz;
  vec3 g1 = texture2D(tGrass, p / 5.0).rgb, g2 = texture2D(tGrass, p / 23.0 + 0.37).rgb;
  float macro = texture2D(tRock, p / 190.0).r;
  vec3 grass = mix(g1, g2, 0.35);
  grass *= mix(vec3(0.82, 0.95, 0.72), vec3(1.15, 1.08, 0.8), smoothstep(0.3, 0.62, macro));
  vec3 dirt = texture2D(tDirt, p / 4.0).rgb;
  vec3 rx = texture2D(tRock, vWP.zy / 9.0).rgb, rz = texture2D(tRock, vWP.xy / 9.0).rgb, ry = texture2D(tRock, p / 9.0).rgb;
  vec3 bw = pow(abs(vWN), vec3(4.0)); bw /= (bw.x + bw.y + bw.z);
  vec3 rock = rx * bw.x + ry * bw.y + rz * bw.z;
  vec3 sand = texture2D(tSand, p / 3.0).rgb;
  vec3 cob = texture2D(tCobble, p / 2.0).rgb;
  float slope = 1.0 - vWN.y;
  float wR = smoothstep(0.24, 0.42, slope + (macro - 0.5) * 0.15);
  float wS = 1.0 - smoothstep(0.5, 1.6, vWP.y + (macro - 0.5) * 0.8);
  float hi = smoothstep(26.0, 60.0, vWP.y + macro * 20.0);
  vec3 c = grass;
  c = mix(c, dirt * vec3(0.95, 0.92, 0.85), vMask.x);
  c = mix(c, cob, vMask.y);
  c = mix(c, sand, wS);
  c = mix(c, rock, max(wR, hi * 0.85));
  c *= mix(1.0, 0.55, smoothstep(-0.2, -2.0, vWP.y));
  diffuseColor.rgb *= c;
}`)
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(0.95, 0.55, 1.0 - smoothstep(-0.4, 0.2, vWP.y));');
  };
  const m = new THREE.Mesh(g, mat); m.receiveShadow = true; m.frustumCulled = false;
  WORLD.add(m);
}

// ================================================================ water
const WU = { uTime: { value: 0 } };
let waterMat;
function buildWater() {
  waterMat = new THREE.MeshPhysicalMaterial({ color: new THREE.Color(0.03, 0.12, 0.13), roughness: 0.06, metalness: 0, normalMap: TX.waterN, normalScale: new THREE.Vector2(0.28, 0.28), envMapIntensity: 1.1, transparent: true, opacity: 0.86, clearcoat: 0 });
  waterMat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, WU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform float uTime; varying vec2 vUv2;')
      .replace('#include <uv_vertex>', '#include <uv_vertex>\nvUv2 = vUv * 0.7 + vec2(-uTime * 0.013, uTime * 0.009); vUv = vUv + vec2(uTime * 0.02, uTime * 0.011);');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec2 vUv2;')
      .replace('#include <normal_fragment_maps>', `
vec3 mapN = normalize(texture2D( normalMap, vUv ).xyz * 2.0 - 1.0 + texture2D( normalMap, vUv2 ).xyz * 2.0 - 1.0);
mapN.xy *= normalScale;
normal = perturbNormal2Arb( - vViewPosition, normal, mapN, faceDirection );`);
  };
  const S = WS, g = new THREE.PlaneGeometry(S, S, 1, 1).rotateX(-Math.PI / 2);
  const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * S / 14, uv.getY(i) * S / 14);
  const w = new THREE.Mesh(g, waterMat); w.position.y = -0.15; w.receiveShadow = true; w.renderOrder = 2;
  WORLD.add(w);
}

// ================================================================ grass (GPU, follows the camera)
const GU = { uTime: { value: 0 }, uCenter: { value: new THREE.Vector2() }, uPlayer: { value: new V3() }, uHM: { value: null }, uR: { value: lowEnd ? 17 : 24 }, uNight: { value: 0 } };
let grassMesh;
function buildGrass() {
  // data texture: r = height, g = density
  const d = new Float32Array(HMN * HMN * 4);
  for (let j = 0; j < HMN; j++) for (let i = 0; i < HMN; i++) {
    const k = j * HMN + i, x = -WH + i * HMS, z = -WH + j * HMS;
    const hh = HM[k];
    const sl = Math.abs(HM[Math.min(k + 1, HM.length - 1)] - HM[Math.max(k - 1, 0)]) + Math.abs(HM[Math.min(k + HMN, HM.length - 1)] - HM[Math.max(k - HMN, 0)]);
    let den = 1 - sstep(0.6, 1.6, sl / HMS);
    den *= sstep(0.7, 1.8, hh) * (1 - sstep(24, 40, hh));
    den *= 1 - clamp(MK[k * 2] * 1.4 + MK[k * 2 + 1] * 2, 0, 1);
    den *= 0.55 + 0.45 * fbm(N3, x * 0.04, z * 0.04, 2) * 1.6;
    for (const pk of ['village', 'forest']) { const p = PL[pk]; den *= sstep(p.r * 0.75, p.r + 6, Math.hypot(x - p.x, z - p.z)); }
    d[k * 4] = hh; d[k * 4 + 1] = clamp(den, 0, 1);
  }
  const tex = new THREE.DataTexture(d, HMN, HMN, THREE.RGBAFormat, THREE.FloatType);
  tex.magFilter = tex.minFilter = THREE.NearestFilter; tex.needsUpdate = true;
  GU.uHM.value = tex;
  // blade
  const base = new THREE.BufferGeometry();
  const bp = [-0.028, 0, 0, 0.028, 0, 0, -0.021, 0.4, 0, 0.021, 0.4, 0, -0.011, 0.75, 0, 0.011, 0.75, 0, 0, 1, 0];
  base.setAttribute('position', new THREE.Float32BufferAttribute(bp, 3));
  base.setAttribute('normal', new THREE.Float32BufferAttribute(new Array(21).fill(0).map((_, i) => i % 3 === 1 ? 1 : 0), 3));
  base.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4, 3, 5, 4, 4, 5, 6]);
  const g = new THREE.InstancedBufferGeometry(); g.index = base.index; g.attributes.position = base.attributes.position; g.attributes.normal = base.attributes.normal;
  const N = Q.grass, R = GU.uR.value, off = new Float32Array(N * 4);
  const r = mulberry(55);
  for (let i = 0; i < N; i++) { off[i * 4] = r() * R * 2; off[i * 4 + 1] = r() * R * 2; off[i * 4 + 2] = r(); off[i * 4 + 3] = r() * 6.283; }
  g.setAttribute('aOff', new THREE.InstancedBufferAttribute(off, 4));
  g.instanceCount = N;
  const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8, side: THREE.DoubleSide, envMapIntensity: 0.6 });
  mat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, GU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', `#include <common>
attribute vec4 aOff; uniform float uTime; uniform vec2 uCenter; uniform vec3 uPlayer; uniform sampler2D uHM; uniform float uR;
varying vec3 vGC;
vec4 hmS(vec2 p) {
  vec2 f = (p + ${WH.toFixed(1)}) / ${HMS.toFixed(6)};
  vec2 i = floor(f); vec2 u = f - i;
  float N = ${HMN.toFixed(1)};
  vec4 a = texture2D(uHM, (i + 0.5) / N), b = texture2D(uHM, (i + vec2(1.5, 0.5)) / N), c = texture2D(uHM, (i + vec2(0.5, 1.5)) / N), d = texture2D(uHM, (i + 1.5) / N);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}`)
      .replace('#include <beginnormal_vertex>', 'vec3 objectNormal = vec3(0.0, 1.0, 0.0);')
      .replace('#include <begin_vertex>', `
vec2 wp = uCenter + mod(aOff.xy - uCenter + uR, 2.0 * uR) - uR;
vec4 hs = hmS(wp);
float dc = length(wp - uCenter);
float keep = step(aOff.z, hs.y) * (1.0 - smoothstep(uR * 0.7, uR, dc));
float H = (0.13 + aOff.z * 0.24) * keep * (0.6 + hs.y * 0.5);
float t = position.y;
float ca = cos(aOff.w), sa = sin(aOff.w);
vec3 transformed = vec3(position.x * ca, 0.0, position.x * sa);
vec2 wind = vec2(sin(uTime * 1.7 + wp.x * 0.35 + wp.y * 0.2) + sin(uTime * 2.9 + wp.y * 0.6) * 0.4, cos(uTime * 1.3 + wp.x * 0.25) * 0.5) * 0.09;
vec2 away = wp - uPlayer.xz; float pd = length(away);
vec2 push = pd < 0.9 ? normalize(away + 0.0001) * (0.9 - pd) * 0.9 : vec2(0.0);
vec2 bend = (wind + push) * t * t;
transformed += vec3(bend.x, t * H, bend.y);
transformed.y *= 1.0 - length(push) * 0.4;
transformed.xz += wp; transformed.y += hs.x - 0.02;
vGC = mix(vec3(0.13, 0.22, 0.05), vec3(0.3, 0.42, 0.11) + aOff.z * vec3(0.08, 0.06, -0.03), t) * (0.75 + fract(aOff.w * 3.7) * 0.4);
`);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vGC;')
      .replace('#include <color_fragment>', 'diffuseColor.rgb *= vGC;');
  };
  // shadow depth also needs the same displacement
  const dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking });
  grassMesh = new THREE.Mesh(g, mat); grassMesh.frustumCulled = false; grassMesh.receiveShadow = true; grassMesh.castShadow = false;
  WORLD.add(grassMesh);
}

// ================================================================ trees / rocks / bushes
const COLL = { cell: 8, map: new Map() }; // circle colliders: {x,z,r}
function addCol(x, z, r, tag) {
  const o = { x, z, r, tag };
  const c = COLL.cell, i0 = Math.floor((x - r) / c), i1 = Math.floor((x + r) / c), j0 = Math.floor((z - r) / c), j1 = Math.floor((z + r) / c);
  for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) { const k = i + ',' + j; let a = COLL.map.get(k); if (!a) COLL.map.set(k, a = []); a.push(o); }
  return o;
}
const BOXES = []; // oriented boxes for buildings: {x,z,hw,hd,c,s,tag}
function addBox(x, z, w, d, rot, tag) { const o = { x, z, hw: w / 2, hd: d / 2, c: Math.cos(rot || 0), s: Math.sin(rot || 0), tag, on: true }; BOXES.push(o); return o; }
function nearPlace(x, z, pad) {
  for (const k of ['village', 'forest', 'castle', 'cave']) { const p = PL[k]; if (Math.hypot(x - p.x, z - p.z) < p.r + pad) return true; }
  if (Math.hypot(x - PL.lake.x, z - PL.lake.z) < PL.lake.r + 6) return true;
  if (Math.abs(z - riverZ(x)) < 18) return true;
  return false;
}
function leafCluster(tex, r, n, seed, flat) {
  // crossed cards arranged on a sphere -> reads as a dense foliage clump
  const rnd = mulberry(seed), parts = new GB();
  const q = new THREE.PlaneGeometry(1, 1);
  for (let i = 0; i < n; i++) {
    const u = rnd() * 2 - 1, a = rnd() * 6.283, s = Math.sqrt(1 - u * u);
    const px = Math.cos(a) * s * r * 0.75, py = u * r * (flat || 0.7), pz = Math.sin(a) * s * r * 0.75;
    const sz = r * (0.9 + rnd() * 0.6);
    parts.add(q, M(px, py, pz, rnd() * 6.283, sz, sz, sz, (rnd() - 0.5) * 1.6, (rnd() - 0.5) * 1.6), null);
  }
  return parts;
}
function treeGeos(kind) {
  const trunk = new GB(), leaves = new GB();
  if (kind === 0) { // broadleaf oak
    const t = new THREE.CylinderGeometry(0.22, 0.42, 4.2, 9, 3); t.translate(0, 2.1, 0);
    trunk.add(t, null, null, (i, u, v) => [u * 2, v * 3]);
    for (const [a, l, y] of [[0.4, 2.2, 2.8], [2.6, 1.9, 3.3], [4.4, 2.0, 2.6]]) {
      const b = new THREE.CylinderGeometry(0.07, 0.14, l, 6); b.translate(0, l / 2, 0);
      trunk.add(b, M(0, y, 0, a, 1, 1, 1, 0, 0.9), null, (i, u, v) => [u, v * 2]);
    }
    const cl = [[0, 5.6, 0, 2.6], [1.7, 4.8, 0.6, 1.9], [-1.5, 4.9, -0.7, 2.0], [0.4, 4.6, -1.6, 1.8], [-0.6, 4.4, 1.6, 1.8], [0.2, 6.6, 0.3, 1.7]];
    cl.forEach(([x, y, z, r], k) => { const c = leafCluster(TX.leaf, r, 16, 9 + k, 0.75); const g = c.build(); g.translate(x, y, z); leaves.add(g, null, new THREE.Color().setHSL(0.27 + k * 0.006, 0.5, 0.42 + (y - 4.4) * 0.06)); });
  } else { // pine
    const t = new THREE.CylinderGeometry(0.12, 0.3, 6.5, 8, 2); t.translate(0, 3.25, 0);
    trunk.add(t, null, null, (i, u, v) => [u * 1.5, v * 4]);
    for (let k = 0; k < 6; k++) {
      const y = 2.2 + k * 1.05, r = 2.1 * (1 - k / 6.5);
      const c = leafCluster(TX.pine, r, 14, 40 + k, 0.35); const g = c.build(); g.translate(0, y, 0);
      leaves.add(g, null, new THREE.Color().setHSL(0.33, 0.35, 0.36 + k * 0.03));
    }
    const top = leafCluster(TX.pine, 0.6, 6, 77, 0.8).build(); top.translate(0, 8.4, 0); leaves.add(top, null, new THREE.Color().setHSL(0.33, 0.35, 0.5));
  }
  return [trunk.build(), leaves.build()];
}
const TREES = [];
function buildTrees() {
  const barkM = stdMat({ map: TX.bark, roughness: 0.95 });
  const leafM = new THREE.MeshStandardMaterial({ map: TX.leaf, alphaTest: 0.45, side: THREE.DoubleSide, roughness: 0.75, vertexColors: true, envMapIntensity: 0.7 });
  const pineM = leafM.clone(); pineM.map = TX.pine;
  // brighten leaves that face the sun a bit (fake translucency)
  for (const lm of [leafM, pineM]) lm.onBeforeCompile = sh => { sh.fragmentShader = sh.fragmentShader.replace('#include <lights_fragment_end>', '#include <lights_fragment_end>\nreflectedLight.indirectDiffuse += diffuseColor.rgb * 0.12;'); };
  const geos = [treeGeos(0), treeGeos(1)];
  const lists = [[], []];
  const r = mulberry(777);
  let tries = 0;
  while ((lists[0].length + lists[1].length) < Q.trees && tries++ < Q.trees * 30) {
    const x = (r() - 0.5) * (WS - 30), z = (r() - 0.5) * (WS - 30);
    const h = terrainY(x, z);
    if (h < 1.0 || h > 45) continue;
    if (nearPlace(x, z, 10)) continue;
    if (roadDist(x, z) < 6) continue;
    const sl = Math.hypot(terrainY(x + 1, z) - terrainY(x - 1, z), terrainY(x, z + 1) - terrainY(x, z - 1)) / 2;
    if (sl > 0.75) continue;
    const forest = fbm(N1, x * 0.018 + 50, z * 0.018 - 30, 3);
    const edge = sstep(200, 260, edgeDist(x, z));
    // denser forests around the forest town & the edges
    const fz = Math.exp(-((x - PL.forest.x) ** 2 + (z - PL.forest.z) ** 2) / (2 * 80 * 80));
    if (forest + fz * 0.35 + edge * 0.3 < 0.5 + (r() - 0.5) * 0.16) continue;
    const pine = r() < 0.25 + edge * 0.5 + (h > 14 ? 0.4 : 0);
    const s = (pine ? 0.8 : 0.75) + r() * 0.55;
    lists[pine ? 1 : 0].push({ x, y: h - 0.2, z, s, rot: r() * 6.28 });
    addCol(x, z, 0.45 * s, 'tree');
    TREES.push({ x, z });
  }
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e3 = new THREE.Euler(), sv = new V3(), pv = new V3(), cc = new THREE.Color();
  lists.forEach((list, sp) => {
    const tm = new THREE.InstancedMesh(geos[sp][0], barkM, list.length), lm = new THREE.InstancedMesh(geos[sp][1], sp ? pineM : leafM, list.length);
    list.forEach((o, i) => {
      e3.set((r() - 0.5) * 0.06, o.rot, (r() - 0.5) * 0.06); q.setFromEuler(e3); sv.set(o.s, o.s * (0.9 + r() * 0.25), o.s); pv.set(o.x, o.y, o.z);
      m4.compose(pv, q, sv); tm.setMatrixAt(i, m4); lm.setMatrixAt(i, m4);
      const v = 0.8 + r() * 0.35; lm.setColorAt(i, cc.setRGB(v * (0.95 + r() * 0.15), v, v * 0.9));
    });
    for (const m of [tm, lm]) { m.castShadow = true; m.receiveShadow = true; WORLD.add(m); }
  });
  // rocks
  const rg = new THREE.DodecahedronGeometry(1, 1);
  { const p = rg.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); const k = 1 + (N3(x * 3 + 10, z * 3 + y * 2) - 0.5) * 0.5; p.setXYZ(i, x * k, y * k * 0.8, z * k); } rg.computeVertexNormals(); }
  const rockM = stdMat({ map: TX.rock, normalMap: TX.rockN, roughness: 0.9 });
  const rl = [];
  for (let t = 0; t < 2600 && rl.length < 340; t++) {
    const x = (r() - 0.5) * (WS - 20), z = (r() - 0.5) * (WS - 20), h = terrainY(x, z);
    if (h < 0.5 || nearPlace(x, z, 4) || roadDist(x, z) < 4) continue;
    const big = r() < 0.15 + sstep(200, 250, edgeDist(x, z)) * 0.5;
    const s = big ? 1.2 + r() * 2.2 : 0.25 + r() * 0.5;
    rl.push([x, h - s * 0.25, z, s]);
    if (s > 0.6) addCol(x, z, s * 0.9, 'rock');
  }
  const rm = new THREE.InstancedMesh(rg, rockM, rl.length);
  rl.forEach(([x, y, z, s], i) => { e3.set(r() * 3, r() * 3, r() * 3); q.setFromEuler(e3); sv.set(s * (0.9 + r() * 0.5), s * (0.6 + r() * 0.3), s); pv.set(x, y, z); m4.compose(pv, q, sv); rm.setMatrixAt(i, m4); });
  rm.castShadow = rm.receiveShadow = true; WORLD.add(rm);
  // bushes with flowers
  const bushG = leafCluster(TX.leaf, 0.7, 12, 999, 0.6).build(); bushG.translate(0, 0.45, 0);
  const bushM = leafM.clone(); bushM.vertexColors = false;
  const bl = [];
  for (let t = 0; t < 4000 && bl.length < 700; t++) {
    const x = (r() - 0.5) * (WS - 30), z = (r() - 0.5) * (WS - 30), h = terrainY(x, z);
    if (h < 1 || h > 30 || roadDist(x, z) < 3.5 || nearPlace(x, z, 2)) continue;
    if (fbm(N1, x * 0.03, z * 0.03, 2) < 0.5) continue;
    bl.push([x, h, z, 0.6 + r() * 0.8]);
  }
  const bm = new THREE.InstancedMesh(bushG, bushM, bl.length);
  bl.forEach(([x, y, z, s], i) => { e3.set(0, r() * 6, 0); q.setFromEuler(e3); sv.set(s, s * 0.8, s); pv.set(x, y, z); m4.compose(pv, q, sv); bm.setMatrixAt(i, m4); bm.setColorAt(i, cc.setHSL(0.25 + r() * 0.08, 0.5, 0.55 + r() * 0.2)); });
  bm.castShadow = true; bm.receiveShadow = true; WORLD.add(bm);
  // flowers (tiny emissive-ish dots on stems)
  const fl = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 6, 4), stdMat({ roughness: 0.6 }), 1600);
  let fi = 0;
  for (let t = 0; t < 12000 && fi < 1600; t++) {
    const x = (r() - 0.5) * (WS - 40), z = (r() - 0.5) * (WS - 40), h = terrainY(x, z);
    if (h < 1.2 || h > 20 || roadDist(x, z) < 2.5 || nearPlace(x, z, -6)) continue;
    if (fbm(N3, x * 0.08, z * 0.08, 2) < 0.55) continue;
    pv.set(x, h + 0.22 + r() * 0.15, z); sv.setScalar(0.8 + r() * 0.6); m4.compose(pv, q.identity(), sv); fl.setMatrixAt(fi, m4);
    fl.setColorAt(fi, cc.set(pick([0xffffff, 0xfff27a, 0xff9ac8, 0xb7a6ff, 0xff7a6a, 0xffffff]))); fi++;
  }
  fl.count = fi; WORLD.add(fl);
}

// ================================================================ overworld collision
function overworldBlocked(x, z, r, fromY) {
  if (Math.abs(x) > WH - 18 || Math.abs(z) > WH - 18) return true;
  const c = COLL.cell, i0 = Math.floor((x - r - 3) / c), i1 = Math.floor((x + r + 3) / c), j0 = Math.floor((z - r - 3) / c), j1 = Math.floor((z + r + 3) / c);
  for (let i = i0; i <= i1; i++) for (let j = j0; j <= j1; j++) {
    const a = COLL.map.get(i + ',' + j); if (!a) continue;
    for (const o of a) { if (o.off) continue; const dx = x - o.x, dz = z - o.z; if (dx * dx + dz * dz < (o.r + r) * (o.r + r)) return o; }
  }
  for (const b of BOXES) {
    if (!b.on) continue;
    const dx = x - b.x, dz = z - b.z;
    if (Math.abs(dx) > b.hw + b.hd + r + 1 && Math.abs(dz) > b.hw + b.hd + r + 1) continue;
    const lx = dx * b.c - dz * b.s, lz = dx * b.s + dz * b.c;
    if (Math.abs(lx) < b.hw + r && Math.abs(lz) < b.hd + r) return b;
  }
  return null;
}

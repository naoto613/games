// ================================================================ core utils
const $ = s => document.querySelector(s);
const V3 = THREE.Vector3;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);
const angWrap = a => Math.atan2(Math.sin(a), Math.cos(a));
const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const RND = mulberry(20261001);
const rr = (a, b) => a + (b - a) * RND();
const ri = (a, b) => Math.floor(rr(a, b + 1));
const pick = a => a[Math.floor(RND() * a.length)];
const isTouch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
const lowEnd = isTouch && Math.min(screen.width, screen.height) < 700;
const Q = { pr: Math.min(devicePixelRatio || 1, isTouch ? (lowEnd ? 1.25 : 1.6) : 2), shadow: lowEnd ? 1024 : 2048 };

// tileable value noise
function makeNoise2(seed, period) {
  const r = mulberry(seed), P = period, g = new Float32Array(P * P);
  for (let i = 0; i < g.length; i++) g[i] = r();
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi;
    const x0 = ((xi % P) + P) % P, y0 = ((yi % P) + P) % P, x1 = (x0 + 1) % P, y1 = (y0 + 1) % P;
    const u = smooth(fx), v = smooth(fy);
    return lerp(lerp(g[y0 * P + x0], g[y0 * P + x1], u), lerp(g[y1 * P + x0], g[y1 * P + x1], u), v);
  };
}
function fbm(n, x, y, oct) { let s = 0, a = 0.5, f = 1, t = 0; for (let k = 0; k < oct; k++) { s += a * n(x * f, y * f); t += a; f *= 2; a *= 0.5; } return s / t; }

// ================================================================ renderer / scene
const canvas = $('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Q.pr);
renderer.setSize(innerWidth, innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.78;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = false;
const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.2, 6000);

// ================================================================ sun / sky
const SUN = new V3();
{ const el = 0.62, az = 2.35; SUN.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)).normalize(); }
const skyU = {
  sunPosition: { value: SUN.clone().multiplyScalar(4000) }, up: { value: new V3(0, 1, 0) },
  turbidity: { value: 2.6 }, rayleigh: { value: 1.3 }, mieCoefficient: { value: 0.003 }, mieDirectionalG: { value: 0.82 },
  hazeCol: { value: new THREE.Color(0x9fb4c8) }
};
const skyMat = new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `
uniform vec3 sunPosition; uniform float rayleigh; uniform float turbidity; uniform float mieCoefficient; uniform vec3 up;
varying vec3 vWorldPosition; varying vec3 vSunDirection; varying float vSunfade; varying vec3 vBetaR; varying vec3 vBetaM; varying float vSunE;
const float e = 2.718281828459045;
const vec3 totalRayleigh = vec3( 5.804542996261093E-6, 1.3562911419845635E-5, 3.0265902468824876E-5 );
const vec3 MieConst = vec3( 1.8399918514433978E14, 2.7798023919660528E14, 4.0790479543861094E14 );
const float cutoffAngle = 1.6110731556870734; const float steepness = 1.5; const float EE = 1000.0;
float sunIntensity( float c ) { c = clamp( c, -1.0, 1.0 ); return EE * max( 0.0, 1.0 - pow( e, -( ( cutoffAngle - acos( c ) ) / steepness ) ) ); }
vec3 totalMie( float T ) { float c = ( 0.2 * T ) * 10E-18; return 0.434 * c * MieConst; }
void main() {
  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  gl_Position.z = gl_Position.w;
  vSunDirection = normalize( sunPosition );
  vSunE = sunIntensity( dot( vSunDirection, up ) );
  vSunfade = 1.0 - clamp( 1.0 - exp( ( sunPosition.y / 450000.0 ) ), 0.0, 1.0 );
  float rayleighCoefficient = rayleigh - ( 1.0 * ( 1.0 - vSunfade ) );
  vBetaR = totalRayleigh * rayleighCoefficient;
  vBetaM = totalMie( turbidity ) * mieCoefficient;
}`,
  fragmentShader: `
varying vec3 vWorldPosition; varying vec3 vSunDirection; varying float vSunfade; varying vec3 vBetaR; varying vec3 vBetaM; varying float vSunE;
uniform float mieDirectionalG; uniform vec3 up; uniform vec3 hazeCol;
const float pi = 3.141592653589793;
const float rayleighZenithLength = 8.4E3; const float mieZenithLength = 1.25E3;
const float sunAngularDiameterCos = 0.99993;
const float THREE_OVER_SIXTEENPI = 0.05968310365946075; const float ONE_OVER_FOURPI = 0.07957747154594767;
float rayleighPhase( float cosTheta ) { return THREE_OVER_SIXTEENPI * ( 1.0 + pow( cosTheta, 2.0 ) ); }
float hgPhase( float cosTheta, float g ) { float g2 = pow( g, 2.0 ); float inverse = 1.0 / pow( 1.0 - 2.0 * g * cosTheta + g2, 1.5 ); return ONE_OVER_FOURPI * ( ( 1.0 - g2 ) * inverse ); }
void main() {
  vec3 direction = normalize( vWorldPosition - cameraPosition );
  float zenithAngle = acos( max( 0.0, dot( up, direction ) ) );
  float inverse = 1.0 / ( cos( zenithAngle ) + 0.15 * pow( 93.885 - ( ( zenithAngle * 180.0 ) / pi ), -1.253 ) );
  float sR = rayleighZenithLength * inverse; float sM = mieZenithLength * inverse;
  vec3 Fex = exp( -( vBetaR * sR + vBetaM * sM ) );
  float cosTheta = dot( direction, vSunDirection );
  float rPhase = rayleighPhase( cosTheta * 0.5 + 0.5 );
  vec3 betaRTheta = vBetaR * rPhase;
  float mPhase = hgPhase( cosTheta, mieDirectionalG );
  vec3 betaMTheta = vBetaM * mPhase;
  vec3 Lin = pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * ( 1.0 - Fex ), vec3( 1.5 ) );
  Lin *= mix( vec3( 1.0 ), pow( vSunE * ( ( betaRTheta + betaMTheta ) / ( vBetaR + vBetaM ) ) * Fex, vec3( 1.0 / 2.0 ) ), clamp( pow( 1.0 - dot( up, vSunDirection ), 5.0 ), 0.0, 1.0 ) );
  vec3 L0 = vec3( 0.1 ) * Fex;
  float sundisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta );
  L0 += ( vSunE * 19000.0 * Fex ) * sundisk;
  vec3 texColor = ( Lin + L0 ) * 0.04 + vec3( 0.0, 0.0003, 0.00075 );
  vec3 retColor = pow( texColor, vec3( 1.0 / ( 1.2 + ( 1.2 * vSunfade ) ) ) );
  retColor *= 0.52;
  // soft clouds
  if ( direction.y > 0.0 ) {
    vec2 cp = direction.xz / ( direction.y + 0.12 ) * 1.6;
    float n = 0.0, a = 0.5; vec2 q = cp;
    for ( int i = 0; i < 5; i++ ) { n += a * ( sin( q.x * 1.7 + sin( q.y * 1.3 ) * 1.4 ) * 0.5 + 0.5 ) * ( sin( q.y * 2.1 + sin( q.x * 0.9 ) * 1.2 ) * 0.5 + 0.5 ); q = mat2( 1.6, 1.2, -1.2, 1.6 ) * q + 3.1; a *= 0.5; }
    float cl = smoothstep( 0.46, 0.7, n ) * smoothstep( 0.0, 0.25, direction.y ) * 0.75;
    vec3 cc = mix( vec3( 0.8, 0.83, 0.88 ), vec3( 1.02, 0.96, 0.88 ), pow( max( cosTheta, 0.0 ), 3.0 ) );
    retColor = mix( retColor, cc, cl * ( 1.0 - sundisk ) );
  }
  retColor = mix( retColor, hazeCol, ( 1.0 - smoothstep( -0.03, 0.12, direction.y ) ) * ( 1.0 - sundisk ) );
  gl_FragColor = vec4( retColor, 1.0 );
  #include <tonemapping_fragment>
  #include <encodings_fragment>
}`
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(4500, 40, 20), skyMat);
sky.frustumCulled = false; sky.renderOrder = -10;
scene.add(sky);
scene.fog = new THREE.FogExp2(0x9fb4c8, 0.0017);

// ================================================================ lights
const hemi = new THREE.HemisphereLight(0xa8c8ff, 0x5a5044, 0.42);
scene.add(hemi);
const sunLight = new THREE.DirectionalLight(0xffe6c4, 2.35);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(Q.shadow, Q.shadow);
{ const c = sunLight.shadow.camera; c.left = -70; c.right = 70; c.top = 70; c.bottom = -70; c.near = 1; c.far = 600; }
sunLight.shadow.bias = -0.0005; sunLight.shadow.normalBias = 0.05;
scene.add(sunLight, sunLight.target);
function updateSun(px, pz) {
  // snap to texel grid to keep shadows from swimming
  const tex = 140 / Q.shadow;
  const sx = Math.round(px / tex) * tex, sz = Math.round(pz / tex) * tex;
  sunLight.target.position.set(sx, 0, sz);
  sunLight.position.set(sx + SUN.x * 300, SUN.y * 300, sz + SUN.z * 300);
}

let envRT = null;
function buildEnv(extra) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const es = new THREE.Scene();
  es.add(new THREE.Mesh(sky.geometry, skyMat));
  // a dim ground so reflections show a horizon
  const g = new THREE.Mesh(new THREE.CircleGeometry(4000, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x3d4044 }));
  g.position.y = -2; es.add(g);
  if (extra) es.add(extra);
  envRT = pmrem.fromScene(es, 0.02, 1, 5000);
  scene.environment = envRT.texture;
  pmrem.dispose();
}

// ================================================================ procedural textures
function canvasTex(w, h, draw, srgb, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.encoding = THREE.sRGBEncoding;
  if (rep !== false) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  t.anisotropy = maxAniso;
  return t;
}
// draw noise speckle into ctx
function noiseFill(x, w, h, base, amp, seed, scale, oct) {
  const n = makeNoise2(seed, 64), img = x.getImageData(0, 0, w, h), d = img.data;
  const r0 = base[0], g0 = base[1], b0 = base[2];
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const v = (fbm(n, i / w * scale, j / h * scale, oct || 4) - 0.5) * amp + (Math.random() - 0.5) * amp * 0.35;
    const k = (j * w + i) * 4; d[k] = clamp(r0 + v, 0, 255); d[k + 1] = clamp(g0 + v, 0, 255); d[k + 2] = clamp(b0 + v, 0, 255); d[k + 3] = 255;
  }
  x.putImageData(img, 0, 0);
}
function heightToNormal(srcCanvasDraw, w, h, strength) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); srcCanvasDraw(x, w, h);
  const s = x.getImageData(0, 0, w, h).data, out = x.createImageData(w, h), o = out.data;
  const H = (i, j) => s[((((j + h) % h) * w) + ((i + w) % w)) * 4] / 255;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const dx = (H(i + 1, j) - H(i - 1, j)) * strength, dy = (H(i, j + 1) - H(i, j - 1)) * strength;
    const l = Math.hypot(dx, dy, 1), k = (j * w + i) * 4;
    o[k] = (-dx / l * 0.5 + 0.5) * 255; o[k + 1] = (dy / l * 0.5 + 0.5) * 255; o[k + 2] = (1 / l) * 255; o[k + 3] = 255;
  }
  x.putImageData(out, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = maxAniso; return t;
}

const TX = {};
function buildTextures() {
  // asphalt
  TX.asphalt = canvasTex(512, 512, (x, w, h) => {
    noiseFill(x, w, h, [62, 63, 66], 30, 3, 8, 5);
    for (let i = 0; i < 2600; i++) { x.fillStyle = `rgba(${RND() < 0.5 ? '210,210,205' : '20,20,22'},${rr(0.08, 0.35)})`; x.fillRect(RND() * w, RND() * h, rr(0.6, 2), rr(0.6, 2)); }
    // patches & cracks
    for (let i = 0; i < 5; i++) { x.fillStyle = `rgba(30,30,32,${rr(0.12, 0.25)})`; x.beginPath(); x.ellipse(RND() * w, RND() * h, rr(30, 90), rr(20, 60), RND() * 3, 0, 7); x.fill(); }
    x.strokeStyle = 'rgba(15,15,15,.45)'; x.lineWidth = 1.2;
    for (let i = 0; i < 6; i++) { let px = RND() * w, py = RND() * h; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 9; k++) { px += rr(-14, 14); py += rr(-14, 14); x.lineTo(px, py); } x.stroke(); }
  }, true);
  TX.asphaltN = heightToNormal((x, w, h) => { noiseFill(x, w, h, [128, 128, 128], 120, 5, 32, 3); }, 256, 256, 1.6);
  // sidewalk interlocking tiles
  TX.walk = canvasTex(512, 512, (x, w, h) => {
    noiseFill(x, w, h, [128, 124, 118], 18, 7, 6, 4);
    const n = 8, s = w / n;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const t = rr(-14, 14) + ((i + j) % 5 === 0 ? -18 : 0);
      x.fillStyle = `rgba(${t > 0 ? '255,250,240' : '40,35,30'},${Math.abs(t) / 120})`; x.fillRect(i * s + 1, j * s + 1, s - 2, s - 2);
    }
    x.strokeStyle = 'rgba(60,55,50,.55)'; x.lineWidth = 2;
    for (let i = 0; i <= n; i++) { x.beginPath(); x.moveTo(i * s, 0); x.lineTo(i * s, h); x.stroke(); x.beginPath(); x.moveTo(0, i * s); x.lineTo(w, i * s); x.stroke(); }
  }, true);
  TX.walkN = heightToNormal((x, w, h) => {
    x.fillStyle = '#ccc'; x.fillRect(0, 0, w, h); const n = 8, s = w / n; x.strokeStyle = '#333'; x.lineWidth = 3;
    for (let i = 0; i <= n; i++) { x.beginPath(); x.moveTo(i * s, 0); x.lineTo(i * s, h); x.stroke(); x.beginPath(); x.moveTo(0, i * s); x.lineTo(w, i * s); x.stroke(); }
  }, 256, 256, 2.5);
  // grass
  TX.grass = canvasTex(512, 512, (x, w, h) => {
    noiseFill(x, w, h, [72, 98, 44], 40, 11, 6, 5);
    for (let i = 0; i < 9000; i++) { const g = ri(70, 140); x.strokeStyle = `rgba(${g * 0.55 | 0},${g},${g * 0.35 | 0},${rr(0.2, 0.5)})`; x.beginPath(); const px = RND() * w, py = RND() * h; x.moveTo(px, py); x.lineTo(px + rr(-1.5, 1.5), py - rr(2, 6)); x.stroke(); }
  }, true);
  // dirt / sand (playground)
  TX.sand = canvasTex(256, 256, (x, w, h) => { noiseFill(x, w, h, [176, 152, 112], 36, 13, 10, 4); }, true);
  // concrete (roofs, walls)
  TX.concrete = canvasTex(512, 512, (x, w, h) => {
    noiseFill(x, w, h, [150, 148, 142], 30, 17, 5, 5);
    for (let i = 0; i < 30; i++) { x.fillStyle = `rgba(40,38,34,${rr(0.03, 0.09)})`; x.fillRect(RND() * w, RND() * h, rr(4, 60), rr(40, 200)); }
  }, true);
  // water ripples normal
  TX.waterN = heightToNormal((x, w, h) => {
    const n = makeNoise2(23, 32), img = x.createImageData(w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const v = fbm(n, i / w * 8, j / h * 8, 4); const k = (j * w + i) * 4; img.data[k] = img.data[k + 1] = img.data[k + 2] = v * 255; img.data[k + 3] = 255; }
    x.putImageData(img, 0, 0);
  }, 256, 256, 3);
  // blob shadow
  TX.blob = canvasTex(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 2, 32, 32, 31); g.addColorStop(0, 'rgba(0,0,0,.75)'); g.addColorStop(0.6, 'rgba(0,0,0,.35)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }, false, false);
  TX.dot = canvasTex(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.35, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }, false, false);
  TX.flame = canvasTex(64, 128, (x) => {
    const g = x.createRadialGradient(32, 92, 2, 32, 80, 50); g.addColorStop(0, 'rgba(255,250,210,1)'); g.addColorStop(0.25, 'rgba(255,190,60,.95)'); g.addColorStop(0.6, 'rgba(240,80,10,.6)'); g.addColorStop(1, 'rgba(120,20,0,0)');
    x.fillStyle = g; x.beginPath(); x.moveTo(32, 2); x.quadraticCurveTo(62, 70, 52, 108); x.quadraticCurveTo(32, 128, 12, 108); x.quadraticCurveTo(2, 70, 32, 2); x.fill();
  }, false, false);
}

// ================================================================ geometry merge helper
const IDM = new THREE.Matrix4();
class GB {
  constructor() { this.p = []; this.n = []; this.u = []; this.c = []; this.idx = []; this.vc = 0; }
  add(geo, m, col, uvs) {
    m = m || IDM;
    const g = geo.index ? geo : geo; const pa = g.attributes.position, na = g.attributes.normal, ua = g.attributes.uv;
    const nm = new THREE.Matrix3().getNormalMatrix(m), v = new V3();
    const base = this.vc;
    const cr = col ? col.r : 1, cg = col ? col.g : 1, cb = col ? col.b : 1;
    for (let i = 0; i < pa.count; i++) {
      v.fromBufferAttribute(pa, i).applyMatrix4(m); this.p.push(v.x, v.y, v.z);
      if (na) { v.fromBufferAttribute(na, i).applyMatrix3(nm).normalize(); this.n.push(v.x, v.y, v.z); } else this.n.push(0, 1, 0);
      if (ua) { const s = uvs ? uvs(i, ua.getX(i), ua.getY(i)) : null; if (s) this.u.push(s[0], s[1]); else this.u.push(ua.getX(i), ua.getY(i)); } else this.u.push(0, 0);
      this.c.push(cr, cg, cb);
    }
    if (g.index) { const ix = g.index.array; for (let i = 0; i < ix.length; i++) this.idx.push(ix[i] + base); }
    else for (let i = 0; i < pa.count; i++) this.idx.push(base + i);
    this.vc += pa.count;
    return this;
  }
  build() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.u, 2));
    g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    g.setIndex(this.vc > 65000 ? new THREE.Uint32BufferAttribute(this.idx, 1) : new THREE.Uint16BufferAttribute(this.idx, 1));
    g.computeBoundingSphere(); g.computeBoundingBox();
    return g;
  }
  get empty() { return this.vc === 0; }
}
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new V3(), _v = new V3();
function M(x, y, z, ry, sx, sy, sz, rx, rz) {
  _e.set(rx || 0, ry || 0, rz || 0, 'YXZ'); _q.setFromEuler(_e); _s.set(sx == null ? 1 : sx, sy == null ? 1 : sy, sz == null ? 1 : sz);
  return new THREE.Matrix4().compose(_v.set(x, y, z), _q, _s);
}
const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);
// box UVs in world units: tile size (tu, tv) for side faces; top face uses tu both ways
function boxWorldUV(w, h, d, tu, tv, uOff, vOff) {
  uOff = uOff || 0; vOff = vOff || 0;
  return (i, u, v) => {
    const face = Math.floor(i / 4);
    if (face === 0 || face === 1) return [u * d / tu + uOff, v * h / tv + vOff];
    if (face === 2 || face === 3) return [u * w / tu, v * d / tu];
    return [u * w / tu + uOff, v * h / tv + vOff];
  };
}
const col = h => new THREE.Color(h);
const BG = new Map(); // material -> GB for static world
function sadd(mat, geo, m, c, uvs) { let b = BG.get(mat); if (!b) { b = new GB(); BG.set(mat, b); } b.add(geo, m, c, uvs); }
function flushStatic(opts) {
  for (const [mat, b] of BG) {
    if (b.empty) continue;
    const mesh = new THREE.Mesh(b.build(), mat);
    mesh.castShadow = mat.userData.cast !== false; mesh.receiveShadow = true; mesh.matrixAutoUpdate = false;
    scene.add(mesh);
  }
  BG.clear();
}

// ================================================================ core utils
const $ = s => document.querySelector(s);
const V3 = THREE.Vector3;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = t => t * t * (3 - 2 * t);
const sstep = (a, b, x) => smooth(clamp((x - a) / (b - a), 0, 1));
const angWrap = a => Math.atan2(Math.sin(a), Math.cos(a));
const lerpAng = (a, b, t) => a + angWrap(b - a) * t;
const damp = (a, b, k, dt) => lerp(a, b, 1 - Math.exp(-k * dt));
const sleep = ms => new Promise(r => setTimeout(r, ms));
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
let RND = mulberry(20261001);
const rr = (a, b) => a + (b - a) * RND();
const ri = (a, b) => Math.floor(rr(a, b + 1));
const pick = a => a[Math.floor(RND() * a.length)];
const mr = (a, b) => a + (b - a) * Math.random();
const mi = (a, b) => Math.floor(mr(a, b + 1));
const mpick = a => a[Math.floor(Math.random() * a.length)];
const isTouch = matchMedia('(pointer:coarse)').matches || 'ontouchstart' in window;
const lowEnd = /low/.test(location.search) || (isTouch && Math.min(screen.width, screen.height) < 700);
const Q = {
  pr: Math.min(devicePixelRatio || 1, isTouch ? (lowEnd ? 1.3 : 1.7) : 2),
  shadow: lowEnd ? 1024 : 2048,
  terr: lowEnd ? 320 : 480,
  grass: lowEnd ? 26000 : 70000,
  trees: lowEnd ? 1100 : 2000,
};

// value noise (tileable) + fbm
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
function fbm(n, x, y, oct) { let s = 0, a = 0.5, f = 1, t = 0; for (let k = 0; k < oct; k++) { s += a * n(x * f, y * f); t += a; f *= 2.03; a *= 0.5; } return s / t; }

// ================================================================ renderer / scene
const canvas = $('#c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Q.pr);
renderer.setSize(innerWidth, innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.82;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const maxAniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, innerWidth / innerHeight, 0.15, 5000);
addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });

// ================================================================ sun / sky
const SUN = new V3();
{ const el = 0.72, az = 2.6; SUN.set(Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)).normalize(); }
const skyU = {
  sunPosition: { value: SUN.clone().multiplyScalar(4000) }, up: { value: new V3(0, 1, 0) },
  turbidity: { value: 2.4 }, rayleigh: { value: 1.25 }, mieCoefficient: { value: 0.003 }, mieDirectionalG: { value: 0.82 },
  hazeCol: { value: new THREE.Color(0xa9bccb) }, uNight: { value: 0 }, uTime: { value: 0 }, uCloud: { value: 1 }
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
uniform float mieDirectionalG; uniform vec3 up; uniform vec3 hazeCol; uniform float uNight; uniform float uTime; uniform float uCloud;
const float pi = 3.141592653589793;
const float rayleighZenithLength = 8.4E3; const float mieZenithLength = 1.25E3;
const float sunAngularDiameterCos = 0.99993;
const float THREE_OVER_SIXTEENPI = 0.05968310365946075; const float ONE_OVER_FOURPI = 0.07957747154594767;
float rayleighPhase( float cosTheta ) { return THREE_OVER_SIXTEENPI * ( 1.0 + pow( cosTheta, 2.0 ) ); }
float hgPhase( float cosTheta, float g ) { float g2 = pow( g, 2.0 ); float inverse = 1.0 / pow( 1.0 - 2.0 * g * cosTheta + g2, 1.5 ); return ONE_OVER_FOURPI * ( ( 1.0 - g2 ) * inverse ); }
float h21( vec2 p ) { p = fract( p * vec2( 123.34, 456.21 ) ); p += dot( p, p + 45.32 ); return fract( p.x * p.y ); }
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
  float sundisk = smoothstep( sunAngularDiameterCos, sunAngularDiameterCos + 0.00002, cosTheta ) * ( 1.0 - uNight );
  L0 += ( vSunE * 19000.0 * Fex ) * sundisk;
  vec3 texColor = ( Lin + L0 ) * 0.04 + vec3( 0.0, 0.0003, 0.00075 );
  vec3 retColor = pow( texColor, vec3( 1.0 / ( 1.2 + ( 1.2 * vSunfade ) ) ) );
  retColor *= 0.52;
  // night (the demon king's darkness): deep violet gradient + stars + moon
  vec3 nc = mix( vec3( 0.06, 0.03, 0.10 ), vec3( 0.005, 0.006, 0.02 ), smoothstep( -0.05, 0.6, direction.y ) );
  vec2 sp = direction.xz / ( abs( direction.y ) + 0.35 ) * 220.0;
  float st = step( 0.9965, h21( floor( sp ) ) ) * smoothstep( 0.02, 0.2, direction.y );
  st *= 0.6 + 0.4 * sin( uTime * 3.0 + h21( floor( sp ) + 7.0 ) * 40.0 );
  nc += vec3( 0.9, 0.9, 1.0 ) * st;
  vec3 md = normalize( vec3( -0.4, 0.35, -0.85 ) );
  float mc = dot( direction, md );
  nc += vec3( 0.95, 0.85, 1.0 ) * smoothstep( 0.9993, 0.9995, mc ) * 1.6 + vec3( 0.25, 0.12, 0.35 ) * pow( max( mc, 0.0 ), 60.0 );
  retColor = mix( retColor, nc, uNight );
  // soft clouds
  if ( direction.y > 0.0 ) {
    vec2 cp = direction.xz / ( direction.y + 0.12 ) * 1.6 + vec2( uTime * 0.004, 0.0 );
    float n = 0.0, a = 0.5; vec2 q = cp;
    for ( int i = 0; i < 5; i++ ) { n += a * ( sin( q.x * 1.7 + sin( q.y * 1.3 ) * 1.4 ) * 0.5 + 0.5 ) * ( sin( q.y * 2.1 + sin( q.x * 0.9 ) * 1.2 ) * 0.5 + 0.5 ); q = mat2( 1.6, 1.2, -1.2, 1.6 ) * q + 3.1; a *= 0.5; }
    float cl = smoothstep( 0.44, 0.7, n ) * smoothstep( 0.0, 0.25, direction.y ) * 0.8 * uCloud;
    vec3 cc = mix( vec3( 0.82, 0.85, 0.9 ), vec3( 1.04, 0.97, 0.88 ), pow( max( cosTheta, 0.0 ), 3.0 ) );
    cc = mix( cc, vec3( 0.09, 0.05, 0.13 ), uNight );
    retColor = mix( retColor, cc, cl * ( 1.0 - sundisk ) );
  }
  retColor = mix( retColor, hazeCol, ( 1.0 - smoothstep( -0.03, 0.12, direction.y ) ) * ( 1.0 - sundisk ) );
  gl_FragColor = vec4( retColor, 1.0 );
  #include <tonemapping_fragment>
  #include <encodings_fragment>
}`
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(4000, 40, 20), skyMat);
sky.frustumCulled = false; sky.renderOrder = -10;
scene.add(sky);
scene.fog = new THREE.FogExp2(0xa9bccb, 0.0042);

// ================================================================ lights
const hemi = new THREE.HemisphereLight(0xb4d0ff, 0x5c5240, 0.5);
scene.add(hemi);
const sunLight = new THREE.DirectionalLight(0xffecd0, 2.5);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(Q.shadow, Q.shadow);
const SHR = 42;
{ const c = sunLight.shadow.camera; c.left = -SHR; c.right = SHR; c.top = SHR; c.bottom = -SHR; c.near = 1; c.far = 500; }
sunLight.shadow.bias = -0.0004; sunLight.shadow.normalBias = 0.04;
scene.add(sunLight, sunLight.target);
function updateSun(px, py, pz) {
  const tex = SHR * 2 / Q.shadow;
  const sx = Math.round(px / tex) * tex, sz = Math.round(pz / tex) * tex;
  sunLight.target.position.set(sx, py, sz);
  sunLight.position.set(sx + SUN.x * 200, py + SUN.y * 200, sz + SUN.z * 200);
}

// environment maps (day + night), swapped as darkness changes
const ENV = { day: null, night: null };
function buildEnv() {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const mk = (n) => {
    const es = new THREE.Scene();
    skyU.uNight.value = n; skyU.uCloud.value = 0.5;
    es.add(new THREE.Mesh(sky.geometry, skyMat));
    const g = new THREE.Mesh(new THREE.CircleGeometry(3000, 24).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: n > 0.5 ? 0x08060c : 0x40463a }));
    g.position.y = -2; es.add(g);
    return pmrem.fromScene(es, 0.02, 1, 4000).texture;
  };
  ENV.day = mk(0); ENV.night = mk(1);
  skyU.uNight.value = 0; skyU.uCloud.value = 1;
  pmrem.dispose();
  scene.environment = ENV.day;
}

// atmosphere: n = darkness 0..1, inside = dungeon mode
const ATM = { n: -1, dungeon: null };
const _c1 = new THREE.Color(), _c2 = new THREE.Color();
function setAtmos(n, force) {
  if (!force && Math.abs(n - ATM.n) < 0.003) return;
  ATM.n = n;
  skyU.uNight.value = n;
  _c1.set(0xa9bccb); _c2.set(0x1a1226);
  const fc = _c1.clone().lerp(_c2, n);
  scene.fog.color.copy(fc); skyU.hazeCol.value.copy(fc);
  scene.fog.density = lerp(0.0042, 0.0085, n);
  sunLight.intensity = lerp(2.5, 0.42, n);
  sunLight.color.set(0xffecd0).lerp(_c2.set(0x9c8cff), n);
  hemi.intensity = lerp(0.5, 0.32, n);
  hemi.color.set(0xb4d0ff).lerp(_c2.set(0x6a58a8), n);
  hemi.groundColor.set(0x5c5240).lerp(_c2.set(0x1c1424), n);
  renderer.toneMappingExposure = lerp(0.82, 0.92, n);
  scene.environment = n > 0.55 ? ENV.night : ENV.day;
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
function noiseFill(x, w, h, base, amp, seed, scale, oct, grain) {
  const n = makeNoise2(seed, 64), img = x.getImageData(0, 0, w, h), d = img.data;
  const r0 = base[0], g0 = base[1], b0 = base[2], gr = grain == null ? 0.35 : grain;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const v = (fbm(n, i / w * scale, j / h * scale, oct || 4) - 0.5) * amp * 2 + (Math.random() - 0.5) * amp * gr;
    const k = (j * w + i) * 4; d[k] = clamp(r0 + v, 0, 255); d[k + 1] = clamp(g0 + v, 0, 255); d[k + 2] = clamp(b0 + v * 0.9, 0, 255); d[k + 3] = 255;
  }
  x.putImageData(img, 0, 0);
}
function heightToNormal(drawH, w, h, strength) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); drawH(x, w, h);
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
// stones / bricks pattern helper: draws into ctx, returns nothing. mode 'brick' | 'cobble' | 'flag'
function stonePattern(x, w, h, o) {
  const r = mulberry(o.seed || 1);
  if (o.mode === 'brick') {
    const rows = o.rows, bh = h / rows;
    for (let j = 0; j < rows; j++) {
      const cols = o.cols, bw = w / cols, off = (j % 2) * bw * 0.5;
      for (let i = -1; i < cols + 1; i++) {
        const v = (r() - 0.5) * (o.var || 40);
        const c = o.col.map(q => clamp(q + v + (r() - 0.5) * 10, 0, 255) | 0);
        x.fillStyle = `rgb(${c})`;
        x.fillRect(i * bw + off + o.gap, j * bh + o.gap, bw - o.gap * 2, bh - o.gap * 2);
      }
    }
  } else {
    const n = o.n || 60, pts = [];
    for (let i = 0; i < n; i++) pts.push([r() * w, r() * h]);
    // voronoi-ish by drawing rounded blobs
    for (const [px, py] of pts) {
      const v = (r() - 0.5) * (o.var || 40);
      const c = o.col.map(q => clamp(q + v, 0, 255) | 0);
      const rad = o.size * (0.7 + r() * 0.5);
      for (const [ox, oy] of [[0, 0], [w, 0], [-w, 0], [0, h], [0, -h]]) {
        x.fillStyle = `rgb(${c})`;
        x.beginPath(); x.ellipse(px + ox, py + oy, rad, rad * (0.7 + r() * 0.3), r() * 3, 0, 7); x.fill();
      }
    }
  }
}

const TX = {};
function buildTextures() {
  // ---- terrain
  TX.grass = canvasTex(512, 512, (x, w, h) => {
    noiseFill(x, w, h, [74, 102, 40], 22, 11, 6, 5);
    for (let i = 0; i < 14000; i++) { const g = ri(70, 150); x.strokeStyle = `rgba(${g * 0.6 | 0},${g},${g * 0.32 | 0},${rr(0.2, 0.55)})`; x.lineWidth = rr(0.6, 1.4); x.beginPath(); const px = RND() * w, py = RND() * h; x.moveTo(px, py); x.lineTo(px + rr(-2, 2), py - rr(2, 7)); x.stroke(); }
    for (let i = 0; i < 260; i++) { x.fillStyle = `rgba(${pick(['255,255,240', '255,236,90', '240,170,220', '200,220,255'])},${rr(0.35, 0.8)})`; x.beginPath(); x.arc(RND() * w, RND() * h, rr(0.8, 1.8), 0, 7); x.fill(); }
  }, true);
  TX.dirt = canvasTex(512, 512, (x, w, h) => {
    noiseFill(x, w, h, [132, 106, 74], 22, 13, 8, 5);
    for (let i = 0; i < 5000; i++) { const v = ri(60, 190); x.fillStyle = `rgba(${v},${v * 0.86 | 0},${v * 0.66 | 0},${rr(0.25, 0.7)})`; x.beginPath(); x.arc(RND() * w, RND() * h, rr(0.6, 2.6), 0, 7); x.fill(); }
  }, true);
  TX.rock = canvasTex(512, 512, (x, w, h) => {
    noiseFill(x, w, h, [116, 110, 102], 30, 17, 5, 6);
    x.strokeStyle = 'rgba(30,26,22,.4)';
    for (let i = 0; i < 40; i++) { x.lineWidth = rr(0.6, 2); let px = RND() * w, py = RND() * h; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 8; k++) { px += rr(-20, 20); py += rr(-6, 12); x.lineTo(px, py); } x.stroke(); }
    for (let i = 0; i < 200; i++) { x.fillStyle = `rgba(${pick(['90,110,60', '160,160,150', '60,56,50'])},${rr(0.1, 0.35)})`; x.beginPath(); x.arc(RND() * w, RND() * h, rr(2, 10), 0, 7); x.fill(); }
  }, true);
  TX.rockN = heightToNormal((x, w, h) => { noiseFill(x, w, h, [128, 128, 128], 70, 19, 10, 5); }, 256, 256, 3);
  TX.sand = canvasTex(256, 256, (x, w, h) => { noiseFill(x, w, h, [190, 172, 132], 16, 23, 12, 4, 0.8); }, true);
  TX.groundN = heightToNormal((x, w, h) => { noiseFill(x, w, h, [128, 128, 128], 60, 29, 16, 4, 0.6); }, 256, 256, 1.5);
  // ---- town / buildings
  TX.cobble = canvasTex(512, 512, (x, w, h) => {
    x.fillStyle = '#4a4339'; x.fillRect(0, 0, w, h);
    stonePattern(x, w, h, { mode: 'cobble', n: 150, size: 24, col: [148, 138, 122], var: 46, seed: 3 });
    noiseOverlay(x, w, h, 31, 0.25);
  }, true);
  TX.cobbleN = heightToNormal((x, w, h) => { x.fillStyle = '#222'; x.fillRect(0, 0, w, h); stonePattern(x, w, h, { mode: 'cobble', n: 150, size: 24, col: [200, 200, 200], var: 40, seed: 3 }); x.filter = 'blur(2px)'; x.drawImage(x.canvas, 0, 0); x.filter = 'none'; }, 512, 512, 4);
  TX.plaster = canvasTex(512, 512, (x, w, h) => {
    noiseFill(x, w, h, [226, 214, 190], 12, 37, 6, 5);
    for (let i = 0; i < 26; i++) { x.fillStyle = `rgba(110,90,60,${rr(0.03, 0.08)})`; x.beginPath(); x.ellipse(RND() * w, RND() * h, rr(10, 60), rr(20, 90), 0, 0, 7); x.fill(); }
    const g = x.createLinearGradient(0, h * 0.75, 0, h); g.addColorStop(0, 'rgba(70,60,40,0)'); g.addColorStop(1, 'rgba(70,60,40,.25)'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  }, true);
  TX.wood = canvasTex(256, 512, (x, w, h) => {
    x.fillStyle = '#5a3c22'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 220; i++) { x.strokeStyle = `rgba(${pick(['30,18,8', '120,84,50', '80,52,28'])},${rr(0.2, 0.6)})`; x.lineWidth = rr(0.5, 2.5); const px = RND() * w; x.beginPath(); x.moveTo(px, 0); x.bezierCurveTo(px + rr(-6, 6), h * 0.3, px + rr(-6, 6), h * 0.6, px + rr(-4, 4), h); x.stroke(); }
    for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(30,16,6,.5)'; x.beginPath(); x.ellipse(RND() * w, RND() * h, rr(2, 5), rr(5, 10), 0, 0, 7); x.fill(); }
  }, true);
  TX.planks = canvasTex(512, 512, (x, w, h) => {
    const n = 8, s = h / n;
    for (let j = 0; j < n; j++) {
      const v = rr(-20, 20); x.fillStyle = `rgb(${120 + v | 0},${88 + v | 0},${56 + v | 0})`; x.fillRect(0, j * s, w, s);
      for (let i = 0; i < 60; i++) { x.strokeStyle = `rgba(${pick(['50,30,14', '160,120,80'])},${rr(0.1, 0.4)})`; x.lineWidth = rr(0.5, 1.5); const py = j * s + RND() * s; x.beginPath(); x.moveTo(0, py); x.lineTo(w, py + rr(-3, 3)); x.stroke(); }
      x.fillStyle = 'rgba(20,12,4,.7)'; x.fillRect(0, j * s, w, 2);
      const cut = RND() * w; x.fillRect(cut, j * s, 2, s);
    }
  }, true);
  TX.roof = canvasTex(512, 512, (x, w, h) => {
    x.fillStyle = '#3a1e14'; x.fillRect(0, 0, w, h);
    const rows = 16, bh = h / rows;
    for (let j = 0; j < rows; j++) {
      const cols = 12, bw = w / cols, off = (j % 2) * bw * 0.5;
      for (let i = -1; i <= cols; i++) {
        const v = rr(-26, 26);
        const g = x.createLinearGradient(0, j * bh, 0, j * bh + bh);
        g.addColorStop(0, `rgb(${150 + v | 0},${70 + v * 0.6 | 0},${48 + v * 0.4 | 0})`); g.addColorStop(1, `rgb(${96 + v | 0},${42 + v * 0.5 | 0},${30 + v * 0.3 | 0})`);
        x.fillStyle = g; x.beginPath(); x.roundRect ? x.roundRect(i * bw + off + 1, j * bh, bw - 2, bh + 2, [0, 0, 8, 8]) : x.rect(i * bw + off + 1, j * bh, bw - 2, bh + 2); x.fill();
      }
    }
    noiseOverlay(x, w, h, 41, 0.18);
  }, true);
  TX.roofN = heightToNormal((x, w, h) => { const rows = 16, bh = h / rows; for (let j = 0; j < rows; j++) { const g = x.createLinearGradient(0, j * bh, 0, j * bh + bh); g.addColorStop(0, '#333'); g.addColorStop(1, '#ddd'); x.fillStyle = g; x.fillRect(0, j * bh, w, bh); } }, 256, 256, 3);
  TX.roofB = canvasTex(512, 512, (x, w, h) => { // slate blue roof for castle
    x.fillStyle = '#1c2430'; x.fillRect(0, 0, w, h);
    stonePattern(x, w, h, { mode: 'brick', rows: 16, cols: 10, gap: 1.5, col: [58, 78, 108], var: 26, seed: 7 });
    noiseOverlay(x, w, h, 43, 0.2);
  }, true);
  TX.stone = canvasTex(512, 512, (x, w, h) => {
    x.fillStyle = '#5e5850'; x.fillRect(0, 0, w, h);
    stonePattern(x, w, h, { mode: 'brick', rows: 8, cols: 4, gap: 3, col: [176, 168, 152], var: 34, seed: 9 });
    noiseOverlay(x, w, h, 47, 0.3);
  }, true);
  TX.stoneN = heightToNormal((x, w, h) => { x.fillStyle = '#111'; x.fillRect(0, 0, w, h); stonePattern(x, w, h, { mode: 'brick', rows: 8, cols: 4, gap: 4, col: [220, 220, 220], var: 30, seed: 9 }); x.filter = 'blur(3px)'; x.drawImage(x.canvas, 0, 0); x.filter = 'none'; }, 512, 512, 5);
  TX.dark = canvasTex(512, 512, (x, w, h) => {
    x.fillStyle = '#120e18'; x.fillRect(0, 0, w, h);
    stonePattern(x, w, h, { mode: 'brick', rows: 8, cols: 4, gap: 3, col: [70, 58, 86], var: 26, seed: 11 });
    noiseOverlay(x, w, h, 53, 0.35);
    for (let i = 0; i < 30; i++) { x.fillStyle = `rgba(150,60,220,${rr(0.04, 0.12)})`; x.fillRect(RND() * w, RND() * h, rr(2, 4), rr(10, 60)); }
  }, true);
  TX.shrine = canvasTex(512, 512, (x, w, h) => {
    x.fillStyle = '#2a3c44'; x.fillRect(0, 0, w, h);
    stonePattern(x, w, h, { mode: 'brick', rows: 6, cols: 3, gap: 3, col: [120, 150, 156], var: 22, seed: 13 });
    noiseOverlay(x, w, h, 59, 0.3);
    for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(60,110,50,${rr(0.15, 0.4)})`; x.beginPath(); x.ellipse(RND() * w, RND() * h, rr(4, 26), rr(3, 12), 0, 0, 7); x.fill(); }
  }, true);
  TX.cave = canvasTex(512, 512, (x, w, h) => {
    noiseFill(x, w, h, [92, 78, 64], 34, 61, 6, 6);
    x.strokeStyle = 'rgba(20,14,10,.5)';
    for (let i = 0; i < 70; i++) { x.lineWidth = rr(1, 3); let px = RND() * w, py = RND() * h; x.beginPath(); x.moveTo(px, py); for (let k = 0; k < 6; k++) { px += rr(-30, 30); py += rr(-14, 14); x.lineTo(px, py); } x.stroke(); }
  }, true);
  TX.caveN = heightToNormal((x, w, h) => { noiseFill(x, w, h, [128, 128, 128], 80, 67, 8, 6, 0.4); }, 256, 256, 4);
  TX.cloth = canvasTex(128, 128, (x, w, h) => { noiseFill(x, w, h, [200, 200, 200], 10, 71, 32, 2, 1); for (let i = 0; i < w; i += 2) { x.fillStyle = 'rgba(0,0,0,.05)'; x.fillRect(i, 0, 1, h); x.fillRect(0, i, w, 1); } }, true);
  TX.bark = canvasTex(256, 256, (x, w, h) => {
    x.fillStyle = '#4a3a2c'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 160; i++) { x.strokeStyle = `rgba(${pick(['24,16,10', '110,96,80', '70,56,40'])},${rr(0.3, 0.8)})`; x.lineWidth = rr(1, 4); const px = RND() * w; x.beginPath(); x.moveTo(px, 0); for (let y = 0; y <= h; y += 32) x.lineTo(px + rr(-4, 4), y); x.stroke(); }
  }, true);
  TX.leaf = canvasTex(256, 256, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) {
      const px = w / 2 + (RND() - 0.5) * w * 0.86 * Math.sqrt(RND()), py = h / 2 + (RND() - 0.5) * h * 0.86 * Math.sqrt(RND());
      if (Math.hypot(px - w / 2, py - h / 2) > w * 0.45) continue;
      const v = rr(0.7, 1.25);
      x.fillStyle = `rgb(${62 * v | 0},${96 * v | 0},${34 * v | 0})`;
      x.save(); x.translate(px, py); x.rotate(RND() * 7); x.beginPath(); x.ellipse(0, 0, rr(5, 9), rr(2.5, 4), 0, 0, 7); x.fill();
      x.strokeStyle = 'rgba(20,40,10,.4)'; x.lineWidth = 0.6; x.beginPath(); x.moveTo(-6, 0); x.lineTo(6, 0); x.stroke(); x.restore();
    }
  }, true, false);
  TX.pine = canvasTex(256, 256, (x, w, h) => {
    x.clearRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      const a = RND() * 7, rad = Math.sqrt(RND()) * w * 0.44;
      const px = w / 2 + Math.cos(a) * rad, py = h / 2 + Math.sin(a) * rad;
      const v = rr(0.7, 1.2);
      x.strokeStyle = `rgb(${34 * v | 0},${64 * v | 0},${36 * v | 0})`; x.lineWidth = rr(1, 2);
      x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * rr(6, 14), py + Math.sin(a) * rr(6, 14)); x.stroke();
    }
  }, true, false);
  // ---- misc
  TX.waterN = heightToNormal((x, w, h) => {
    const n = makeNoise2(83, 32), img = x.createImageData(w, h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const v = fbm(n, i / w * 8, j / h * 8, 4); const k = (j * w + i) * 4; img.data[k] = img.data[k + 1] = img.data[k + 2] = v * 255; img.data[k + 3] = 255; }
    x.putImageData(img, 0, 0);
  }, 256, 256, 3);
  TX.blob = canvasTex(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 2, 32, 32, 31); g.addColorStop(0, 'rgba(0,0,0,.7)'); g.addColorStop(0.6, 'rgba(0,0,0,.3)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }, false, false);
  TX.dot = canvasTex(64, 64, (x) => { const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.3, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); }, false, false);
  TX.star = canvasTex(64, 64, (x) => {
    x.translate(32, 32); x.fillStyle = '#fff'; x.shadowColor = '#fff'; x.shadowBlur = 8; x.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 9 : 26, a = i * Math.PI / 5 - Math.PI / 2; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fill();
  }, false, false);
  TX.flame = canvasTex(64, 128, (x) => {
    const g = x.createRadialGradient(32, 92, 2, 32, 80, 50); g.addColorStop(0, 'rgba(255,250,210,1)'); g.addColorStop(0.25, 'rgba(255,190,60,.95)'); g.addColorStop(0.6, 'rgba(240,80,10,.6)'); g.addColorStop(1, 'rgba(120,20,0,0)');
    x.fillStyle = g; x.beginPath(); x.moveTo(32, 2); x.quadraticCurveTo(62, 70, 52, 108); x.quadraticCurveTo(32, 128, 12, 108); x.quadraticCurveTo(2, 70, 32, 2); x.fill();
  }, false, false);
  TX.smoke = canvasTex(64, 64, (x) => { for (let i = 0; i < 8; i++) { const g = x.createRadialGradient(32 + rr(-10, 10), 32 + rr(-10, 10), 0, 32, 32, 28); g.addColorStop(0, 'rgba(255,255,255,.25)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); } }, false, false);
}
function noiseOverlay(x, w, h, seed, amt) {
  const n = makeNoise2(seed, 32), img = x.getImageData(0, 0, w, h), d = img.data;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    const v = (fbm(n, i / w * 8, j / h * 8, 3) - 0.5) * 255 * amt + (Math.random() - 0.5) * 30 * amt;
    const k = (j * w + i) * 4; d[k] = clamp(d[k] + v, 0, 255); d[k + 1] = clamp(d[k + 1] + v, 0, 255); d[k + 2] = clamp(d[k + 2] + v, 0, 255);
  }
  x.putImageData(img, 0, 0);
}
function textTex(lines, o) {
  o = o || {};
  const w = o.w || 512, h = o.h || 128;
  return canvasTex(w, h, (x) => {
    if (o.bg) { x.fillStyle = o.bg; x.fillRect(0, 0, w, h); }
    x.fillStyle = o.color || '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.font = `${o.weight || 900} ${o.size || 64}px "Shippori Mincho B1","Hiragino Mincho ProN",serif`;
    if (o.stroke) { x.strokeStyle = o.stroke; x.lineWidth = o.sw || 6; }
    const L = Array.isArray(lines) ? lines : [lines];
    L.forEach((s, i) => { const y = h / 2 + (i - (L.length - 1) / 2) * (o.lh || (o.size || 64) * 1.15); if (o.stroke) x.strokeText(s, w / 2, y); x.fillText(s, w / 2, y); });
  }, true, false);
}

// ================================================================ geometry merge helper
const IDM = new THREE.Matrix4();
class GB {
  constructor() { this.p = []; this.n = []; this.u = []; this.c = []; this.idx = []; this.vc = 0; }
  add(geo, m, col, uvs) {
    m = m || IDM;
    const g = geo; const pa = g.attributes.position, na = g.attributes.normal, ua = g.attributes.uv;
    const nm = new THREE.Matrix3().getNormalMatrix(m), v = new V3();
    const base = this.vc;
    const cr = col ? col.r : 1, cg = col ? col.g : 1, cb = col ? col.b : 1;
    for (let i = 0; i < pa.count; i++) {
      v.fromBufferAttribute(pa, i).applyMatrix4(m); this.p.push(v.x, v.y, v.z);
      if (na) { v.fromBufferAttribute(na, i).applyMatrix3(nm).normalize(); this.n.push(v.x, v.y, v.z); } else this.n.push(0, 1, 0);
      if (ua) { const s = uvs ? uvs(i, ua.getX(i), ua.getY(i), pa.getX(i), pa.getY(i), pa.getZ(i)) : null; if (s) this.u.push(s[0], s[1]); else this.u.push(ua.getX(i), ua.getY(i)); } else this.u.push(0, 0);
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
const _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new V3(), _v = new V3();
function M(x, y, z, ry, sx, sy, sz, rx, rz) {
  _e.set(rx || 0, ry || 0, rz || 0, 'YXZ'); _q.setFromEuler(_e); _s.set(sx == null ? 1 : sx, sy == null ? 1 : sy, sz == null ? 1 : sz);
  return new THREE.Matrix4().compose(_v.set(x, y, z), _q, _s);
}
const UNIT_BOX = new THREE.BoxGeometry(1, 1, 1);
// world-space planar UV: projects each vertex onto the face plane of its normal in world units / tile
function worldUV(m, tile) {
  const v = new V3(), nrm = new V3(), nm = new THREE.Matrix3().getNormalMatrix(m);
  return (geo) => (i) => {
    v.fromBufferAttribute(geo.attributes.position, i).applyMatrix4(m);
    nrm.fromBufferAttribute(geo.attributes.normal, i).applyMatrix3(nm).normalize();
    const ax = Math.abs(nrm.x), ay = Math.abs(nrm.y), az = Math.abs(nrm.z);
    if (ay >= ax && ay >= az) return [v.x / tile, v.z / tile];
    if (ax >= az) return [v.z / tile, v.y / tile];
    return [v.x / tile, v.y / tile];
  };
}
const col = h => new THREE.Color(h);
// static batches: material -> GB, flushed into a group
const BG = new Map();
function sadd(mat, geo, m, c, tile) {
  let b = BG.get(mat); if (!b) { b = new GB(); BG.set(mat, b); }
  b.add(geo, m, c, tile ? worldUV(m || IDM, tile)(geo) : null);
}
function flushStatic(parent) {
  for (const [mat, b] of BG) {
    if (b.empty) continue;
    const mesh = new THREE.Mesh(b.build(), mat);
    mesh.castShadow = mat.userData.cast !== false; mesh.receiveShadow = true; mesh.matrixAutoUpdate = false;
    parent.add(mesh);
  }
  BG.clear();
}
function stdMat(o) {
  const m = new THREE.MeshStandardMaterial(Object.assign({ roughness: 0.85, metalness: 0 }, o));
  return m;
}

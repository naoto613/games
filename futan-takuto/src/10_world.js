// ================================================================ world: sky / sea / clouds / wind / terrain
const World = { t: 0, wind: { dir: Math.PI, str: 1 }, moodK: 0 };

// ---------- moods (lerped)
const MOODS = {
  day: { top: 0x2f8ff0, hor: 0xc4ecff, deep: 0x1767c9, light: 0x3fa2ee, shallow: 0x3fe0d8, amb: 0.56, sun: 0.56, sunCol: 0xfff6e0 },
  storm: { top: 0x2a2440, hor: 0x6a6280, deep: 0x23305a, light: 0x3a4a7a, shallow: 0x4a7a8a, amb: 0.42, sun: 0.3, sunCol: 0xc0b0ff },
  sunset: { top: 0x4a5ad0, hor: 0xffb47a, deep: 0x2a50a0, light: 0x6a7ad0, shallow: 0xffa080, amb: 0.5, sun: 0.6, sunCol: 0xffc080 },
  dusk: { top: 0x3a3a90, hor: 0xb08ac0, deep: 0x203a80, light: 0x3a5aa0, shallow: 0x5aa0c0, amb: 0.48, sun: 0.45, sunCol: 0xffd0b0 },
};
const mood = {}; for (const k in MOODS.day) mood[k] = typeof MOODS.day[k] === 'number' && k !== 'amb' && k !== 'sun' ? new THREE.Color(MOODS.day[k]) : MOODS.day[k];
let moodTarget = 'day', moodMix = null;
function applyMood(dt) {
  // blend: base target + optional storm proximity (World.stormK)
  const a = MOODS[moodTarget], b = MOODS.storm, k = World.stormK || 0;
  const tc = new THREE.Color();
  for (const key of ['top', 'hor', 'deep', 'light', 'shallow', 'sunCol']) {
    tc.setHex(a[key]); if (k > 0) tc.lerp(new THREE.Color(b[key]), k);
    mood[key].lerp(tc, 1 - Math.exp(-2 * dt));
  }
  mood.amb = damp(mood.amb, lerp(a.amb, b.amb, k), 2, dt);
  mood.sun = damp(mood.sun, lerp(a.sun, b.sun, k), 2, dt);
  hemi.intensity = mood.amb + (World.flash || 0); sun.intensity = mood.sun; sun.color.copy(mood.sunCol);
  skyMat.uniforms.top.value.copy(mood.top); skyMat.uniforms.hor.value.copy(mood.hor);
  scene.fog.color.copy(mood.hor); renderer.setClearColor(mood.hor);
  seaMat.uniforms.deep.value.copy(mood.deep); seaMat.uniforms.light.value.copy(mood.light);
  seaMat.uniforms.shallow.value.copy(mood.shallow); seaMat.uniforms.fogC.value.copy(mood.hor);
}
function setMood(m, instant) { moodTarget = m; if (instant) { const a = MOODS[m]; for (const k of ['top', 'hor', 'deep', 'light', 'shallow', 'sunCol']) mood[k].setHex(a[k]); mood.amb = a.amb; mood.sun = a.sun; } }

// ---------- sky dome
const skyMat = new THREE.ShaderMaterial({
  uniforms: { top: { value: new THREE.Color(0x2f8ff0) }, hor: { value: new THREE.Color(0xc4ecff) } },
  vertexShader: 'varying vec3 vP;void main(){vP=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader: 'uniform vec3 top,hor;varying vec3 vP;void main(){float h=clamp(vP.y,0.0,1.0);vec3 c=mix(hor,top,pow(h,0.5));gl_FragColor=vec4(c,1.0);}',
  side: THREE.BackSide, depthWrite: false, fog: false
});
const sky = new THREE.Mesh(new THREE.SphereGeometry(2000, 32, 16), skyMat);
sky.renderOrder = -10; scene.add(sky);
// sun (toon disc with rings)
const sunSpr = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
  const g = x.createRadialGradient(128, 128, 30, 128, 128, 128); g.addColorStop(0, 'rgba(255,250,220,.7)'); g.addColorStop(1, 'rgba(255,250,220,0)');
  x.fillStyle = g; x.fillRect(0, 0, 256, 256);
  x.fillStyle = 'rgba(255,255,240,.5)'; x.beginPath(); x.arc(128, 128, 62, 0, TAU); x.fill();
  x.fillStyle = '#fffef4'; x.beginPath(); x.arc(128, 128, 46, 0, TAU); x.fill();
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), fog: false, depthWrite: false, transparent: true }));
  s.scale.set(260, 260, 1); s.renderOrder = -9; scene.add(s); return s;
})();

// ---------- clouds (puffy toon)
const clouds = [];
const cloudMat = new THREE.MeshToonMaterial({ color: 0xffffff, gradientMap: gradTex, emissive: 0x5a6a90, fog: false });
function makeCloud(r) {
  const g = new THREE.Group(); const n = 4 + Math.floor(r() * 4);
  for (let i = 0; i < n; i++) {
    const s = 14 + r() * 18;
    const m = new THREE.Mesh(G.sph(1, 12, 8), cloudMat);
    m.scale.set(s * 1.3, s * 0.8, s);
    m.position.set((i - n / 2) * 16 + r() * 8, r() * 8 + (i % 2) * 5, r() * 14 - 7);
    g.add(m);
  }
  return g;
}
const cloudRoot = new THREE.Group(); scene.add(cloudRoot);
(() => { const r = mulberry(7); for (let i = 0; i < 46; i++) { const c = makeCloud(r); const a = r() * TAU, d = 500 + r() * 1300; c.position.set(Math.cos(a) * d, 150 + r() * 140, Math.sin(a) * d - 300); c.rotation.y = r() * TAU; c.userData.static = 1; cloudRoot.add(c); clouds.push(c); } mergeStatic(cloudRoot, () => true); })();

// ---------- sea
const MAXI = 16;
const seaMat = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 }, deep: { value: new THREE.Color(0x1767c9) }, light: { value: new THREE.Color(0x3fa2ee) }, shallow: { value: new THREE.Color(0x3fe0d8) },
    fogC: { value: new THREE.Color(0xc4ecff) }, fogN: { value: 200 }, fogF: { value: 1250 },
    shoreTex: { value: null }, isl: { value: Array.from({ length: MAXI }, () => new THREE.Vector4(0, 0, 0, 0)) },
  },
  vertexShader: `uniform float time;varying vec3 vW;varying float vD;
float wave(vec2 p){return sin(p.x*0.09+time*1.1)*0.18+sin(p.y*0.11-time*0.9)*0.16+sin((p.x+p.y)*0.05+time*0.6)*0.22;}
void main(){vec4 w=modelMatrix*vec4(position,1.0);w.y+=wave(w.xz);vW=w.xyz;vec4 mv=viewMatrix*w;vD=-mv.z;gl_Position=projectionMatrix*mv;}`,
  fragmentShader: `uniform float time;uniform vec3 deep,light,shallow,fogC;uniform float fogN,fogF;uniform sampler2D shoreTex;uniform vec4 isl[${MAXI}];
varying vec3 vW;varying float vD;
vec2 h2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453);}
// scattered crescent wave marks (one per cell, some cells empty)
float marks(vec2 p,float t){vec2 i=floor(p),f=fract(p);float m=0.0;
  for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y));vec2 h=h2(i+g);
    if(h.x>0.55)continue;
    float ph=fract(t*0.18+h.y);float life=sin(ph*3.14159);
    vec2 c=g+0.25+0.5*h+vec2(ph*0.35,0.0);vec2 d=f-c;d.x*=0.75;
    float r=0.2+0.12*h.y;float ring=abs(length(d)-r);
    float arc=smoothstep(0.02,-0.08,d.y);
    m=max(m,(1.0-smoothstep(0.018,0.045,ring))*arc*life);}
  return m;}
void main(){
  float md=999.0;
  for(int i=0;i<${MAXI};i++){vec4 I=isl[i];if(I.w<0.5)continue;vec2 dv=vW.xz-I.xy;float dd=length(dv);if(dd>I.w+60.0)continue;
    float a=atan(dv.y,dv.x)/6.2831853+0.5;float r=texture2D(shoreTex,vec2(a,I.z)).r*170.0;md=min(md,dd-r);}
  vec2 p=vW.xz*0.16;
  float line=marks(p,time)*(1.0-smoothstep(60.0,160.0,vD));
  float n=sin(vW.x*0.011+time*0.15)*sin(vW.z*0.013-time*0.12)+0.3*sin(vW.x*0.05+vW.z*0.04);
  vec3 c=mix(deep,light,smoothstep(-0.35,0.5,vW.y)*0.55+smoothstep(0.2,0.9,n)*0.18);
  float sh=1.0-smoothstep(0.0,30.0,md);
  c=mix(c,shallow,sh*0.85);
  float wob=sin(atan(vW.z,vW.x)*40.0+time*2.0)*0.4+sin(vW.x*0.7+vW.z*0.6+time*1.7)*0.5;
  float foam=1.0-smoothstep(1.6+wob,2.4+wob,md);
  float ring=mod(time*1.6,7.0)+2.5;foam=max(foam,(1.0-smoothstep(0.0,0.45,abs(md-ring)))*(1.0-ring/10.0)*0.9);
  c=mix(c,vec3(1.0),max(line*0.9,foam*step(-3.0,md)));
  float f=smoothstep(fogN,fogF,vD);c=mix(c,fogC,f);
  gl_FragColor=vec4(c,1.0);}`,
});
const sea = new THREE.Mesh(new THREE.PlaneGeometry(2600, 2600, 130, 130).rotateX(-Math.PI / 2), seaMat);
scene.add(sea);
function waveH(x, z) { const t = World.t; return Math.sin(x * 0.09 + t * 1.1) * 0.18 + Math.sin(z * 0.11 - t * 0.9) * 0.16 + Math.sin((x + z) * 0.05 + t * 0.6) * 0.22; }

// ---------- wind lines (camera-facing ribbons that curl)
const windLines = [];
const windMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false, fog: false });
const WL_N = 26;
function makeWindLine() {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(WL_N * 2 * 3), 3));
  const idx = []; for (let i = 0; i < WL_N - 1; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  geo.setIndex(idx);
  const m = new THREE.Mesh(geo, windMat); m.frustumCulled = false; scene.add(m);
  return { m, life: 0, max: 1, x: 0, y: 0, z: 0, curl: 1, len: 10 };
}
for (let i = 0; i < 9; i++) windLines.push(makeWindLine());
const _tmp = new V3(), _tmp2 = new V3();
function updateWind(dt, center, strength) {
  const wd = World.wind.dir, dx = Math.sin(wd), dz = Math.cos(wd);
  const camPos = camera.position;
  for (const w of windLines) {
    w.life += dt;
    if (w.life > w.max) {
      if (Math.random() > strength) { w.m.visible = false; w.life = w.max - 0.1; continue; }
      w.life = 0; w.max = 1.6 + Math.random() * 1.2; w.m.visible = true;
      const a = Math.random() * TAU, d = 6 + Math.random() * 26;
      w.x = center.x + Math.cos(a) * d - dx * 14; w.z = center.z + Math.sin(a) * d - dz * 14; w.y = center.y + 1 + Math.random() * 7;
      w.curl = Math.random() < 0.5 ? 1 : -1; w.len = 12 + Math.random() * 10;
    }
    const k = w.life / w.max;
    const pos = w.m.geometry.attributes.position.array;
    // path: straight along wind, then a curl loop near the end
    const head = k * 1.35, tail = Math.max(0, head - 0.42);
    for (let i = 0; i < WL_N; i++) {
      const u = lerp(tail, head, i / (WL_N - 1));
      let px, py, pz;
      if (u < 0.7) { const s = u * w.len; px = w.x + dx * s; pz = w.z + dz * s; py = w.y + Math.sin(u * 6) * 0.3; }
      else {
        const s0 = 0.7 * w.len, th = (u - 0.7) / 0.65 * TAU * 0.95, R = 1.5;
        const fx = Math.sin(th) * R, fy = (1 - Math.cos(th)) * R;
        px = w.x + dx * (s0 + fx); pz = w.z + dz * (s0 + fx);
        py = w.y + fy * w.curl * 0.8 + Math.sin(0.7 * 6) * 0.3;
        px += -dz * fy * 0.25 * w.curl; pz += dx * fy * 0.25 * w.curl;
      }
      _tmp.set(px, py, pz);
      // width: taper at ends
      const tw = Math.sin(Math.PI * i / (WL_N - 1)) * 0.11 * (1 - Math.abs(k - 0.5) * 1.2);
      _tmp2.subVectors(camPos, _tmp).normalize();
      let ux = -dz * _tmp2.y, uy = dz * _tmp2.x - dx * _tmp2.z, uz = dx * _tmp2.y; const L = Math.hypot(ux, uy, uz) || 1; ux /= L; uy /= L; uz /= L;
      pos[i * 6] = px + ux * tw; pos[i * 6 + 1] = py + uy * tw; pos[i * 6 + 2] = pz + uz * tw;
      pos[i * 6 + 3] = px - ux * tw; pos[i * 6 + 4] = py - uy * tw; pos[i * 6 + 5] = pz - uz * tw;
    }
    w.m.geometry.attributes.position.needsUpdate = true;
  }
}

// ================================================================ islands: height fields + colliders
const Islands = [], ISL = {};
function defIsland(o) {
  Object.assign(o, { blobs: o.blobs || [], ramps: o.ramps || [], plats: o.plats || [], cols: [], boxes: [], active: o.active !== false });
  o.group = new THREE.Group(); o.group.position.set(o.x, 0, o.z); scene.add(o.group);
  Islands.push(o); ISL[o.id] = o; return o;
}
function terrH(I, lx, lz, shore) {
  let h = -8;
  for (const b of I.blobs) {
    if (b.off || (shore && b.nf)) continue;
    const d = Math.hypot(lx - b[0], lz - b[1]); if (d >= b[2]) continue;
    const t = 1 - smooth(b[2] - b[4], b[2], d);
    const v = lerp(-8, b[3], t); if (v > h) h = v;
  }
  for (const r of I.ramps) {
    const [x1, z1, h1, x2, z2, h2, w] = r; const vx = x2 - x1, vz = z2 - z1, L2 = vx * vx + vz * vz;
    const t = clamp(((lx - x1) * vx + (lz - z1) * vz) / L2, 0, 1);
    const p = Math.hypot(x1 + vx * t - lx, z1 + vz * t - lz); if (p >= w) continue;
    const v = lerp(-8, lerp(h1, h2, t), 1 - smooth(w - 0.7, w, p)); if (v > h) h = v;
  }
  if (h > 0.6) h += (Math.sin(lx * 0.31 + lz * 0.17) * Math.sin(lz * 0.27 - lx * 0.11)) * 0.12;
  return h;
}
function islandAt(x, z) {
  for (const I of Islands) { if (!I.active) continue; const dx = x - I.x, dz = z - I.z; if (dx * dx + dz * dz < (I.R + 14) * (I.R + 14)) return I; }
  return null;
}
function groundH(x, z) {
  const I = islandAt(x, z); if (!I) return -8;
  const lx = x - I.x, lz = z - I.z; let h = terrH(I, lx, lz);
  for (const p of I.plats) if (!p.off && lx >= p[0] && lx <= p[2] && lz >= p[1] && lz <= p[3] && p[4] > h) h = p[4];
  return h;
}
// collision: circles {x,z,r,on?} + boxes in world coords
function addCol(I, x, z, r, extra) { const c = Object.assign({ x: I.x + x, z: I.z + z, r, on: true }, extra || {}); I.cols.push(c); return c; }
function collide(I, p, rad, yFeet) {
  if (!I) return false; let hit = false;
  for (const c of I.cols) {
    if (!c.on) continue; if (c.top != null && yFeet >= c.top - 0.05) continue;
    const dx = p.x - c.x, dz = p.z - c.z, rr = c.r + rad, d2 = dx * dx + dz * dz;
    if (d2 < rr * rr) { const d = Math.sqrt(d2) || 0.001; p.x = c.x + dx / d * rr; p.z = c.z + dz / d * rr; hit = c; }
  }
  for (const b of I.boxes) {
    if (!b.on) continue; if (b.top != null && yFeet >= b.top - 0.05) continue;
    const x1 = b.x1 - rad, x2 = b.x2 + rad, z1 = b.z1 - rad, z2 = b.z2 + rad;
    if (p.x > x1 && p.x < x2 && p.z > z1 && p.z < z2) {
      const dl = p.x - x1, dr = x2 - p.x, du = p.z - z1, dd = z2 - p.z, m = Math.min(dl, dr, du, dd);
      if (m === dl) p.x = x1; else if (m === dr) p.x = x2; else if (m === du) p.z = z1; else p.z = z2; hit = b;
    }
  }
  return hit;
}
function addBox(I, cx, cz, w, d, extra) { const b = Object.assign({ x1: I.x + cx - w / 2, x2: I.x + cx + w / 2, z1: I.z + cz - d / 2, z2: I.z + cz + d / 2, on: true }, extra || {}); I.boxes.push(b); return b; }

// ---------- terrain mesh
const PAL = {
  green: { sand: 0xf6e3a2, sandW: 0xe8cc84, grass: 0x84d24c, grass2: 0x74c63e, cliff: 0xdcb47c, cliff2: 0xc89a62 },
  forest: { sand: 0xf2df9c, sandW: 0xe0c47c, grass: 0x6cc84a, grass2: 0x5ab83c, cliff: 0xb88a5a, cliff2: 0xa47848 },
  fire: { sand: 0xe0bc8a, sandW: 0xc8a070, grass: 0xbc8a5c, grass2: 0xac7a4e, cliff: 0x8a5a3c, cliff2: 0x74482e },
  rock: { sand: 0xb8b4b0, sandW: 0x9a9690, grass: 0x8a8692, grass2: 0x7e7a88, cliff: 0x6a6676, cliff2: 0x5a5666 },
  holy: { sand: 0xf4ecc8, sandW: 0xe0d4a8, grass: 0xd8f0b8, grass2: 0xc8e8a8, cliff: 0xd8d0c0, cliff2: 0xc4bcac },
};
function buildTerrain(I) {
  if (I.terrain) { I.group.remove(I.terrain); I.terrain.geometry.dispose(); }
  const S = I.R + 12, step = I.R > 40 ? 1.15 : 0.8, n = Math.ceil(2 * S / step);
  const geo = new THREE.PlaneGeometry(2 * S, 2 * S, n, n).rotateX(-Math.PI / 2);
  const pos = geo.attributes.position, cnt = pos.count, col = new Float32Array(cnt * 3);
  const P = PAL[I.pal || 'green'], c = new THREE.Color(), hs = new Float32Array(cnt);
  for (let i = 0; i < cnt; i++) { const x = pos.getX(i), z = pos.getZ(i); hs[i] = terrH(I, x, z); pos.setY(i, hs[i]); }
  for (let i = 0; i < cnt; i++) {
    const x = pos.getX(i), z = pos.getZ(i), h = hs[i];
    const e = 0.6, gx = terrH(I, x + e, z) - terrH(I, x - e, z), gz = terrH(I, x, z + e) - terrH(I, x, z - e);
    const slope = Math.hypot(gx, gz) / (2 * e);
    if (slope > 1.1 && h > 0.3) c.setHex(Math.floor(h / 1.3) % 2 ? P.cliff : P.cliff2);
    else if (h < 0.15) c.setHex(P.sandW);
    else if (h < 1.25 && !I.noSand) c.setHex(P.sand);
    else c.setHex((Math.sin(x * 0.21) + Math.sin(z * 0.23 + x * 0.05)) > 0.4 ? P.grass2 : P.grass);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  // drop deep triangles
  const idx = geo.index.array, keep = [];
  for (let i = 0; i < idx.length; i += 3) { if (Math.max(hs[idx[i]], hs[idx[i + 1]], hs[idx[i + 2]]) > -3) keep.push(idx[i], idx[i + 1], idx[i + 2]); }
  geo.setIndex(keep); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, TM(0xffffff, { vertexColors: true }));
  I.group.add(m); I.terrain = m;
}
// shoreline polar texture for sea foam/shallows
const SHORE_W = 256;
let shoreTex = null;
function shoreRadius(I, a) {
  const ca = Math.cos(a), sa = Math.sin(a);
  for (let r = I.R + 12; r > 0; r -= 0.5) if (terrH(I, ca * r, sa * r, true) > -0.25) return r;
  return 0;
}
function buildShore() {
  const data = new Uint8Array(SHORE_W * MAXI * 4);
  Islands.forEach((I, row) => {
    if (row >= MAXI) return;
    I.row = row;
    for (let i = 0; i < SHORE_W; i++) {
      const a = (i + 0.5) / SHORE_W * TAU - Math.PI; // matches atan(y,x)/TAU+0.5
      const r = I.active && !I.noShore ? shoreRadius(I, a) : 0;
      data[(row * SHORE_W + i) * 4] = clamp(Math.round(r / 170 * 255), 0, 255);
    }
  });
  if (!shoreTex) {
    shoreTex = new THREE.DataTexture(data, SHORE_W, MAXI, THREE.RGBAFormat);
    shoreTex.wrapS = THREE.RepeatWrapping; shoreTex.magFilter = shoreTex.minFilter = THREE.LinearFilter;
    seaMat.uniforms.shoreTex.value = shoreTex;
  } else { shoreTex.image.data.set(data); }
  shoreTex.needsUpdate = true;
  Islands.forEach((I, row) => { if (row < MAXI) seaMat.uniforms.isl.value[row].set(I.x, I.z, (row + 0.5) / MAXI, I.active && !I.noShore ? I.R + 12 : 0); });
}

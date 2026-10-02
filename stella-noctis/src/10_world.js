// ================================================================ sky
const SKY = {
  title: { top: 0x0a1030, mid: 0x3a2a6a, hor: 0xff8a5a, sun: 0xffb070, sunD: [-0.2, 0.02, -1], stars: 1, cloud: 0.5, vesper: 1, fog: 0x5a3a6a, fogN: 120, fogF: 900, amb: [0x8a7ac8, 0x4a3050, 0.7], light: [0xffb890, 0.7] },
  town: { top: 0x3c6fd0, mid: 0x93bfea, hor: 0xffd6a2, sun: 0xffe0a0, sunD: [-0.6, 0.35, -0.5], stars: 0, cloud: 0.8, vesper: 0, fog: 0xe8d8c0, fogN: 90, fogF: 700, amb: [0xcfe0ff, 0x8a7458, 0.66], light: [0xfff0d0, 0.78] },
  field: { top: 0x2f6fd6, mid: 0x86bff0, hor: 0xe6f2ff, sun: 0xfff2c0, sunD: [0.4, 0.6, -0.5], stars: 0, cloud: 1, vesper: 0, fog: 0xcfe4f6, fogN: 120, fogF: 900, amb: [0xcfe0ff, 0x7a8a58, 0.66], light: [0xfff4dc, 0.78] },
  forest: { top: 0x4a8ad0, mid: 0x9ccfc0, hor: 0xd8ecc8, sun: 0xfff0b0, sunD: [0.3, 0.8, 0.2], stars: 0, cloud: 0.6, vesper: 0, fog: 0x7aa888, fogN: 30, fogF: 190, amb: [0xb0e0c8, 0x3a5a38, 0.7], light: [0xfff0c8, 0.62] },
  ruins: { top: 0x161b44, mid: 0x5a3f86, hor: 0xff9466, sun: 0xff9060, sunD: [0.1, 0.05, -1], stars: 0.6, cloud: 0.7, vesper: 1, fog: 0x6a4a78, fogN: 60, fogF: 420, amb: [0x9a8ad8, 0x4a3a48, 0.7], light: [0xffa070, 0.72] },
  dusk: { top: 0x0e1438, mid: 0x4a3478, hor: 0xffa070, sun: 0xffa070, sunD: [-0.3, 0.03, -1], stars: 0.9, cloud: 0.6, vesper: 1, fog: 0x8a5a78, fogN: 120, fogF: 800, amb: [0x9a8ad8, 0x5a4048, 0.68], light: [0xffb080, 0.7] },
};
function makeSky(scene) {
  const u = {
    top: { value: new THREE.Color() }, mid: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunC: { value: new THREE.Color() },
    sunD: { value: new V3(0, 1, 0) }, stars: { value: 0 }, cloud: { value: 1 }, vesper: { value: 0 }, t: { value: 0 }, vsD: { value: new V3(-0.25, 0.32, -1).normalize() },
  };
  const m = new THREE.ShaderMaterial({
    uniforms: u, side: THREE.BackSide, depthWrite: false, fog: false,
    vertexShader: 'varying vec3 vD;void main(){vD=normalize(position);vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.);gl_Position=p.xyww;}',
    fragmentShader: `uniform vec3 top,mid,hor,sunC,sunD,vsD;uniform float stars,cloud,vesper,t;
varying vec3 vD;
float h21(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=n2(p)*a;p*=2.03;a*=.5;}return s;}
void main(){vec3 d=normalize(vD);float h=d.y;
vec3 c=mix(hor,mid,smoothstep(-.02,.28,h));c=mix(c,top,smoothstep(.25,.9,h));
c=mix(c,hor*.55,smoothstep(0.,-.25,h));
float s=max(dot(d,normalize(sunD)),0.);c+=sunC*(pow(s,900.)*3.+pow(s,30.)*.35+pow(s,4.)*.18);
if(stars>0.){vec2 g=floor(vec2(atan(d.z,d.x)*180.,asin(clamp(h,-1.,1.))*180.));float r=h21(g);float st=step(.9935,r)*smoothstep(.05,.5,h)*(.6+.4*sin(t*2.+r*80.));c+=vec3(st)*stars;}
if(vesper>0.){float v=max(dot(d,normalize(vsD)),0.);c+=vec3(1.,.95,.8)*(pow(v,6000.)*4.+pow(v,400.)*.6+pow(v,40.)*.08)*vesper;}
if(h>0.){vec2 uv=d.xz/(h+.12);float n=fbm(uv*1.1+vec2(t*.006,t*.002));float cl=smoothstep(.52,.7,n)*smoothstep(0.,.18,h)*cloud;
float lit=smoothstep(.55,.85,fbm(uv*1.1+vec2(t*.006,t*.002)+normalize(sunD).xz*.08));
vec3 cc=mix(mix(hor,vec3(1.),.6),mix(sunC,vec3(1.),.4),.4+lit*.5);cc=mix(cc,mid*.9,.25*(1.-lit));
c=mix(c,cc,cl*.92);}
gl_FragColor=vec4(c,1.);}`
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), m);
  mesh.renderOrder = -10; mesh.frustumCulled = false;
  scene.add(mesh);
  const lights = makeLights(scene, {});
  scene.fog = new THREE.Fog(0xffffff, 100, 800);
  return {
    mesh, u, lights, set(p) {
      u.top.value.set(p.top); u.mid.value.set(p.mid); u.hor.value.set(p.hor); u.sunC.value.set(p.sun);
      u.sunD.value.set(...p.sunD).normalize(); u.stars.value = p.stars; u.cloud.value = p.cloud; u.vesper.value = p.vesper;
      scene.fog.color.set(p.fog); scene.fog.near = p.fogN; scene.fog.far = p.fogF;
      lights.amb.color.set(p.amb[0]); lights.amb.groundColor.set(p.amb[1]); lights.amb.intensity = p.amb[2];
      lights.sun.color.set(p.light[0]); lights.sun.intensity = p.light[1];
      const sd = new V3(...p.sunD).normalize(); lights.sun.position.set(sd.x, Math.max(0.35, sd.y), sd.z);
    }, update(dt, cam) { mesh.position.copy(cam.position); u.t.value += dt; }
  };
}

// ================================================================ textures
const TEX = {};
function noiseFill(x, w, h, base, vary, n = 4000, sz = [1, 3]) {
  x.fillStyle = base; x.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) { const v = (Math.random() - .5) * vary; x.fillStyle = `rgba(${v > 0 ? '255,255,255' : '0,0,0'},${Math.abs(v)})`; const s = rnd(sz[0], sz[1]); x.fillRect(Math.random() * w, Math.random() * h, s, s); }
}
TEX.grass = canTex(256, 256, (x, w, h) => {
  noiseFill(x, w, h, '#d8d8d8', 0.25, 3000);
  for (let i = 0; i < 900; i++) { const px = Math.random() * w, py = Math.random() * h, l = rnd(4, 10); x.strokeStyle = `rgba(${Math.random() < .5 ? '255,255,255' : '40,60,30'},${rnd(.08, .22)})`; x.lineWidth = 1.5; x.beginPath(); x.moveTo(px, py); x.lineTo(px + rnd(-2, 2), py - l); x.stroke(); }
}, [1, 1]);
TEX.cobble = canTex(256, 256, (x, w, h) => {
  x.fillStyle = '#6a6058'; x.fillRect(0, 0, w, h);
  const R = mulberry(7);
  for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) {
    const cx = col * 32 + (row % 2) * 16 + R() * 4, cy = row * 32 + R() * 4, l = 200 + R() * 40 | 0;
    x.fillStyle = `rgb(${l},${l - 10},${l - 26})`; x.beginPath(); x.ellipse(cx, cy + 16, 14 + R() * 2, 13 + R() * 2, R(), 0, TAU); x.fill();
    x.fillStyle = 'rgba(255,255,255,.18)'; x.beginPath(); x.ellipse(cx - 3, cy + 12, 8, 6, 0, 0, TAU); x.fill();
  }
}, [1, 1]);
TEX.tiles = canTex(256, 256, (x, w, h) => {
  x.fillStyle = '#5a5450'; x.fillRect(0, 0, w, h);
  const R = mulberry(11);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const l = 175 + R() * 50 | 0; x.fillStyle = `rgb(${l},${l - 6},${l - 2})`; x.fillRect(c * 64 + 2, r * 64 + 2, 60, 60); x.strokeStyle = 'rgba(0,0,0,.15)'; x.beginPath(); x.moveTo(c * 64 + R() * 60, r * 64 + 2); x.lineTo(c * 64 + R() * 60, r * 64 + 62); x.stroke(); }
  noiseFill(x, 0, 0, 'rgba(0,0,0,0)', 0.2, 0);
  for (let i = 0; i < 2000; i++) { x.fillStyle = `rgba(0,0,0,${rnd(0, .08)})`; x.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
}, [1, 1]);
TEX.dirt = canTex(256, 256, (x, w, h) => { noiseFill(x, w, h, '#d0c8b8', 0.25, 5000, [1, 4]); }, [1, 1]);
TEX.plaster = canTex(128, 128, (x, w, h) => { noiseFill(x, w, h, '#f0ece4', 0.12, 1500, [1, 3]); }, [1, 1]);
TEX.wood = canTex(64, 256, (x, w, h) => { x.fillStyle = '#c8c0b8'; x.fillRect(0, 0, w, h); for (let i = 0; i < 40; i++) { x.strokeStyle = `rgba(0,0,0,${rnd(.04, .15)})`; x.beginPath(); const px = Math.random() * w; x.moveTo(px, 0); x.bezierCurveTo(px + 4, h * .3, px - 4, h * .6, px + 2, h); x.stroke(); } }, [1, 1]);
TEX.roof = canTex(128, 128, (x, w, h) => { x.fillStyle = '#c8c8c8'; x.fillRect(0, 0, w, h); for (let r = 0; r < 8; r++) for (let c = 0; c < 9; c++) { x.fillStyle = `rgba(0,0,0,${.06 + Math.random() * .08})`; x.fillRect(c * 16 - (r % 2) * 8, r * 16 + 10, 15, 6); x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(c * 16 - (r % 2) * 8, r * 16, 15, 3); } }, [1, 1]);
TEX.stone = canTex(128, 128, (x, w, h) => { noiseFill(x, w, h, '#d6d0c8', 0.2, 2500, [1, 4]); x.strokeStyle = 'rgba(0,0,0,.18)'; for (let r = 0; r < 4; r++) { x.beginPath(); x.moveTo(0, r * 32); x.lineTo(w, r * 32); x.stroke(); for (let c = 0; c < 3; c++) { const px = c * 48 + (r % 2) * 24; x.beginPath(); x.moveTo(px, r * 32); x.lineTo(px, r * 32 + 32); x.stroke(); } } }, [1, 1]);
TEX.runes = canTex(1024, 64, (x, w, h) => {
  x.clearRect(0, 0, w, h); x.strokeStyle = '#fff'; x.lineWidth = 2.5; x.shadowColor = '#fff'; x.shadowBlur = 6;
  x.beginPath(); x.moveTo(0, 6); x.lineTo(w, 6); x.moveTo(0, 58); x.lineTo(w, 58); x.stroke();
  const R = mulberry(3);
  for (let i = 0; i < 40; i++) {
    const cx = i * 25.6 + 12; x.beginPath();
    for (let k = 0; k < 4; k++) { const a = R() * TAU, b = R() * TAU, r1 = 6 + R() * 10; x.moveTo(cx + Math.cos(a) * r1, 32 + Math.sin(a) * r1); x.lineTo(cx + Math.cos(b) * r1, 32 + Math.sin(b) * r1); }
    if (R() < .5) x.arc(cx, 32, 4 + R() * 8, 0, TAU);
    x.stroke();
  }
});
TEX.runes.wrapS = THREE.RepeatWrapping;
TEX.circle = canTex(512, 512, (x, w, h) => {
  // magic circle glyph
  x.translate(256, 256); x.strokeStyle = '#fff'; x.fillStyle = '#fff'; x.shadowColor = '#fff'; x.shadowBlur = 8;
  const ring = (r, lw) => { x.lineWidth = lw; x.beginPath(); x.arc(0, 0, r, 0, TAU); x.stroke(); };
  ring(246, 5); ring(230, 2); ring(160, 3); ring(150, 1.5); ring(70, 2);
  x.lineWidth = 2.5; for (let k = 0; k < 2; k++) { x.beginPath(); for (let i = 0; i <= 6; i++) { const a = i / 6 * TAU * 2 + k * Math.PI / 6 + Math.PI / 2; x.lineTo(Math.cos(a) * 150, Math.sin(a) * 150); } x.stroke(); }
  x.font = 'bold 22px serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
  const gl = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ';
  for (let i = 0; i < 36; i++) { x.save(); const a = i / 36 * TAU; x.rotate(a); x.fillText(gl[i % gl.length], 0, -195); x.restore(); }
  for (let i = 0; i < 12; i++) { x.save(); x.rotate(i / 12 * TAU); x.fillText(gl[(i * 5) % gl.length], 0, -110); x.restore(); }
});

// ================================================================ terrain
function makeTerrain(parent, size, seg, hf, cf, tex, rep = 40, cx = 0, cz = 0) {
  const g = new THREE.PlaneGeometry(size, size, seg, seg).rotateX(-Math.PI / 2);
  const p = g.attributes.position, col = new Float32Array(p.count * 3), c = new THREE.Color();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + cx, z = p.getZ(i) + cz; p.setY(i, hf(x, z)); p.setX(i, x); p.setZ(i, z);
    cf(x, z, c); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * rep, uv.getY(i) * rep);
  g.computeVertexNormals();
  const t = tex.clone(); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  const m = new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true, map: t }));
  parent.add(m);
  return m;
}

// ================================================================ vegetation / props
const grassUniform = { value: 0 };
function grassField(parent, count, sampler, colA = 0x6aa848, colB = 0xc0e878) {
  const g = new THREE.BufferGeometry();
  const pos = [], col = [], ca = new THREE.Color(colA), cb = new THREE.Color(colB);
  for (let k = 0; k < 3; k++) {
    const a = k / 3 * Math.PI + 0.3, dx = Math.cos(a) * 0.05, dz = Math.sin(a) * 0.05, lx = Math.cos(a + 1.2) * 0.06, lz = Math.sin(a + 1.2) * 0.06;
    pos.push(-dx + lx, 0, -dz + lz, dx + lx, 0, dz + lz, lx * 2.2, 0.3, lz * 2.2);
    col.push(ca.r, ca.g, ca.b, ca.r, ca.g, ca.b, cb.r, cb.g, cb.b);
  }
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  const mat = new THREE.MeshLambertMaterial({ vertexColors: true, side: THREE.DoubleSide });
  mat.onBeforeCompile = sh => {
    sh.uniforms.gt = grassUniform;
    sh.vertexShader = 'uniform float gt;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n#ifdef USE_INSTANCING\nvec2 ip=instanceMatrix[3].xz;\n#else\nvec2 ip=vec2(0.);\n#endif\ntransformed.x+=sin(gt*1.8+ip.x*.35+ip.y*.2)*position.y*.22;transformed.z+=cos(gt*1.4+ip.y*.3)*position.y*.12;');
  };
  const ms = [];
  for (let i = 0; i < count; i++) { const s = sampler(i); if (s) { const k = s[3] || rnd(0.8, 1.4); ms.push(mat4(s[0], s[1], s[2], Math.random() * TAU, k, k * rnd(0.8, 1.3), k)); } }
  const im = new THREE.InstancedMesh(g, mat, ms.length);
  ms.forEach((m, i) => im.setMatrixAt(i, m));
  im.frustumCulled = false;
  parent.add(im); return im;
}
const GEO = {
  blob: new THREE.IcosahedronGeometry(1, 1),
  trunk: new THREE.CylinderGeometry(0.22, 0.38, 1, 7).translate(0, 0.5, 0),
  cone: new THREE.ConeGeometry(1, 1, 8).translate(0, 0.5, 0),
  rock: new THREE.DodecahedronGeometry(1, 0),
  flower: new THREE.SphereGeometry(0.09, 6, 4),
  pillar: new THREE.CylinderGeometry(0.7, 0.75, 1, 12).translate(0, 0.5, 0),
  boxU: new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0),
};
// broadleaf trees: list of [x,y,z,scale]
function trees(parent, list, palette = [0x4f9a3a, 0x6ab048, 0x3f8a40, 0x82b84a], trunkC = 0x7a5a3a) {
  const tm = [], fm = [], fc = [];
  for (const [x, y, z, s] of list) {
    const h = 2.2 * s;
    tm.push(mat4(x, y, z, Math.random() * TAU, s, h, s));
    const col = new THREE.Color(pick(palette));
    const blobs = [[0, h + 1.2 * s, 0, 1.6], [0.9, h + 0.6 * s, 0.3, 1.15], [-0.8, h + 0.7 * s, -0.4, 1.2], [0.1, h + 2.1 * s, -0.2, 1.1]];
    for (const [bx, by, bz, bs] of blobs) { fm.push(mat4(x + bx * s, y + by, z + bz * s, Math.random() * TAU, bs * s * rnd(.9, 1.1), bs * s * 0.85, bs * s)); fc.push(col.clone().multiplyScalar(rnd(.9, 1.08))); }
  }
  inst(parent, GEO.trunk, trunkC, tm, 0.04);
  const im = inst(parent, GEO.blob, 0xffffff, fm, 0.05);
  fc.forEach((c, i) => im.setColorAt(i, c)); im.instanceColor.needsUpdate = true;
}
function pines(parent, list, col = 0x2f6a48) {
  const tm = [], fm = [], fc = [];
  for (const [x, y, z, s] of list) {
    tm.push(mat4(x, y, z, 0, s * 0.8, 1.6 * s, s * 0.8));
    const c = new THREE.Color(col).multiplyScalar(rnd(.85, 1.15));
    for (let k = 0; k < 3; k++) { fm.push(mat4(x, y + (1.2 + k * 1.3) * s, z, Math.random(), (2.1 - k * 0.55) * s, 2.4 * s, (2.1 - k * 0.55) * s)); fc.push(c); }
  }
  inst(parent, GEO.trunk, 0x6a4a30, tm, 0.04);
  const im = inst(parent, GEO.cone, 0xffffff, fm, 0.05);
  fc.forEach((c, i) => im.setColorAt(i, c)); im.instanceColor.needsUpdate = true;
}
function rocks(parent, list, col = 0x9a948a) {
  inst(parent, GEO.rock, col, list.map(([x, y, z, s]) => mat4(x, y + s * 0.3, z, Math.random() * TAU, s * rnd(1, 1.4), s * rnd(.6, .9), s, rnd(-.2, .2))), 0.04);
}
function flowers(parent, list) {
  const cols = [0xffffff, 0xffd84a, 0xff8ab0, 0xb08aff, 0x8ad0ff];
  const im = new THREE.InstancedMesh(GEO.flower, BM(0xffffff), list.length);
  list.forEach(([x, y, z], i) => { im.setMatrixAt(i, mat4(x, y + 0.35, z, 0, 1)); im.setColorAt(i, new THREE.Color(pick(cols))); });
  parent.add(im); return im;
}

// half-timbered house. returns collider box
function house(parent, x, z, w, d, h, ry, o = {}) {
  const g = grp(parent, x, o.y || 0, z); g.rotation.y = ry;
  const wallC = o.wall || 0xf2e8d8, timber = o.timber || 0x6a4a34, roofC = o.roof || pick([0x3a5a9a, 0xb04a3a, 0x4a7a6a, 0x8a5a9a]);
  const base = mk(G.box(w + 0.2, 1, d + 0.2), 0x9a948a, 0.03, TM(0xb0aaa0, { map: TEX.stone })); base.position.y = 0.5; g.add(base);
  const body = mk(G.box(w, h - 1, d), 0, 0.03, TM(wallC, { map: TEX.plaster })); body.position.y = 1 + (h - 1) / 2; g.add(body);
  // timbers
  const tb = TM(timber);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) at(ad(g, new THREE.Mesh(G.box(0.22, h - 1, 0.22), tb)), sx * w / 2, 1 + (h - 1) / 2, sz * d / 2);
  at(ad(g, new THREE.Mesh(G.box(w + 0.1, 0.2, d + 0.1), tb)), 0, 1 + (h - 1) * 0.5, 0);
  for (let i = -1; i <= 1; i += 2) { const b = ad(g, new THREE.Mesh(G.box(0.16, (h - 1) * 0.7, 0.05), tb)); b.position.set(i * w / 4, 1 + (h - 1) * 0.5, d / 2 + 0.03); b.rotation.z = i * 0.5; }
  // roof (prism)
  const rh = Math.min(w, d) * 0.55;
  const shape = new THREE.Shape(); shape.moveTo(-w / 2 - 0.5, 0); shape.lineTo(0, rh); shape.lineTo(w / 2 + 0.5, 0); shape.lineTo(-w / 2 - 0.5, 0);
  const rg = new THREE.ExtrudeGeometry(shape, { depth: d + 0.8, bevelEnabled: false }); rg.translate(0, 0, -(d + 0.8) / 2);
  const rf = mk(rg, 0, 0.04, TM(roofC, { map: TEX.roof })); rf.position.y = h; g.add(rf);
  // door & windows
  const door = ad(g, new THREE.Mesh(G.box(1.1, 2, 0.1), TM(0x5a3a28, { map: TEX.wood }))); door.position.set(o.doorX || 0, 1.0 + 0.0, d / 2 + 0.05);
  const winM = TM(0x2a3a5a), sill = TM(0x7a5a3a);
  for (const wx of [-w / 3, w / 3]) {
    if (Math.abs(wx - (o.doorX || 0)) < 1) continue;
    at(ad(g, new THREE.Mesh(G.box(0.9, 1, 0.08), winM)), wx, 2.3, d / 2 + 0.04);
    at(ad(g, new THREE.Mesh(G.box(1.1, 0.12, 0.25), sill)), wx, 1.75, d / 2 + 0.1);
    if (Math.random() < 0.6) { const fb = ad(g, new THREE.Mesh(G.box(1, 0.25, 0.3), TM(0x8a5a3a))); fb.position.set(wx, 1.65, d / 2 + 0.3); for (let k = 0; k < 4; k++) at(ad(g, new THREE.Mesh(GEO.flower, BM(pick([0xff6a8a, 0xffd84a, 0xffffff])))), wx - 0.35 + k * 0.23, 1.85, d / 2 + 0.3).scale.setScalar(1.6); }
  }
  for (const wx of [-w / 3, w / 3]) at(ad(g, new THREE.Mesh(G.box(0.9, 0.9, 0.08), winM)), wx, h - 1.0, d / 2 + 0.04);
  // chimney
  if (o.chimney !== false) at(ad(g, mk(G.box(0.6, 1.6, 0.6), 0x8a7a6a, 0.03)), w / 4, h + rh * 0.6, 0);
  return { x, z, hw: w / 2 + 0.3, hd: d / 2 + 0.3, ry };
}
// barrier rings (結界)
function barrierRings(parent, cx, cy, cz, R, n = 3) {
  const g = grp(parent, cx, cy, cz);
  const rings = [];
  for (let i = 0; i < n; i++) {
    const rg = grp(g); rg.rotation.x = Math.PI / 2 + (i - 1) * 0.16; rg.rotation.z = i * 0.7;
    const r = R * (1 - i * 0.12);
    const tor = new THREE.Mesh(new THREE.TorusGeometry(r, 0.5 + R * 0.004, 6, 128), new THREE.MeshBasicMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }));
    rg.add(tor);
    const tex = TEX.runes.clone(); tex.needsUpdate = true; tex.wrapS = THREE.RepeatWrapping; tex.repeat.set(6, 1);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(r, r, R * 0.05, 128, 1, true), new THREE.MeshBasicMaterial({ map: tex, color: 0x9ad8ff, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
    band.rotation.x = Math.PI / 2; rg.add(band);
    rings.push({ rg, tex, sp: (i % 2 ? -1 : 1) * (0.02 + i * 0.01) });
  }
  return { g, update(dt) { for (const r of rings) { r.rg.rotation.z += r.sp * dt; r.tex.offset.x += r.sp * dt * 0.5; } } };
}
// save point (glowing sphere w/ rings)
function savePoint(parent, x, y, z) {
  const g = grp(parent, x, y, z);
  const core = new THREE.Mesh(G.sph(0.45, 20, 14), new THREE.MeshBasicMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.85 }));
  core.position.y = 1.4; g.add(core);
  const gl = glowSprite(0x88ccff, 4); gl.position.y = 1.4; g.add(gl);
  const rings = [];
  for (let i = 0; i < 3; i++) {
    const r = new THREE.Mesh(G.tor(0.75 + i * 0.12, 0.025, 6, 48), new THREE.MeshBasicMaterial({ color: i === 1 ? 0xffe7a8 : 0x9ad8ff, transparent: true, opacity: 0.9, blending: THREE.AdditiveBlending }));
    r.position.y = 1.4; g.add(r); rings.push(r);
  }
  const base = new THREE.Mesh(new THREE.CircleGeometry(1.3, 32).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ map: TEX.circle, color: 0x8ad0ff, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
  base.position.y = 0.05; g.add(base);
  let t = Math.random() * 10;
  return { g, x, z, update(dt) { t += dt; core.position.y = gl.position.y = 1.4 + Math.sin(t * 1.5) * 0.1; rings.forEach((r, i) => { r.position.y = core.position.y; r.rotation.x = t * (0.6 + i * 0.3) + i; r.rotation.y = t * (0.4 - i * 0.2); }); base.rotation.y = t * 0.3; gl.material.opacity = 0.7 + Math.sin(t * 3) * 0.2; } };
}
// fireflies / motes
function motes(parent, n, cx, cz, R, y0, y1, col = 0xd8ff8a) {
  const g = new THREE.BufferGeometry(); const p = new Float32Array(n * 3), ph = [];
  for (let i = 0; i < n; i++) { p[i * 3] = cx + rnd(-R, R); p[i * 3 + 1] = rnd(y0, y1); p[i * 3 + 2] = cz + rnd(-R, R); ph.push(Math.random() * 10); }
  g.setAttribute('position', new THREE.BufferAttribute(p, 3));
  const pts = new THREE.Points(g, new THREE.PointsMaterial({ color: col, size: 0.35, map: glowTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  parent.add(pts); let t = 0;
  return { update(dt) { t += dt; const a = g.attributes.position; for (let i = 0; i < n; i++) { a.array[i * 3] += Math.sin(t * 0.7 + ph[i]) * dt * 0.4; a.array[i * 3 + 1] += Math.cos(t * 0.9 + ph[i] * 2) * dt * 0.25; a.array[i * 3 + 2] += Math.cos(t * 0.6 + ph[i]) * dt * 0.4; } a.needsUpdate = true; pts.material.opacity = 0.7 + Math.sin(t * 2) * 0.3; } };
}
function lightShaft(parent, x, y, z, h, w, col = 0xfff4c0) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.4, w, h, 12, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.04, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide, fog: false }));
  m.position.set(x, y + h / 2, z); m.rotation.z = 0.25; parent.add(m); return m;
}
// fountain
function fountain(parent, x, z, withWater) {
  const g = grp(parent, x, 0, z);
  const st = TM(0xd8d0c4, { map: TEX.stone });
  const basin = mk(G.cyl(4.2, 4.4, 0.8, 28), 0, 0.04, st); basin.position.y = 0.4; g.add(basin);
  const inner = new THREE.Mesh(G.cyl(3.7, 3.7, 0.1, 28), TM(withWater ? 0x4aa8e8 : 0x8a8274)); inner.position.y = 0.72; g.add(inner);
  const col = mk(G.cyl(0.5, 0.7, 2.4, 14), 0, 0.03, st); col.position.y = 1.6; g.add(col);
  const bowl = mk(G.cyl(1.6, 0.7, 0.5, 20), 0, 0.03, st); bowl.position.y = 2.9; g.add(bowl);
  // astra socket
  const sock = mk(G.cyl(0.3, 0.4, 0.6, 10), 0x8a7a5a, 0.02); sock.position.y = 3.4; g.add(sock);
  const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.42), new THREE.MeshBasicMaterial({ color: 0x6ad8ff, transparent: true, opacity: 0.9 }));
  gem.position.y = 4.1; g.add(gem); gem.visible = !!withWater;
  const gl = glowSprite(0x6ad8ff, 2.6); gl.position.y = 4.1; g.add(gl); gl.visible = !!withWater;
  let water = null;
  if (withWater) {
    water = new THREE.Mesh(G.cyl(0.25, 1.4, 2.2, 16, true), new THREE.MeshBasicMaterial({ color: 0xbfe8ff, transparent: true, opacity: 0.45, side: THREE.DoubleSide }));
    water.position.y = 2.2; g.add(water);
  }
  let t = 0;
  return { g, setWater(v) { inner.material = TM(v ? 0x4aa8e8 : 0x8a8274); gem.visible = gl.visible = v; }, update(dt) { t += dt; gem.rotation.y += dt; gem.position.y = 4.1 + Math.sin(t * 2) * 0.1; if (water) water.scale.y = 1 + Math.sin(t * 8) * 0.03; } };
}

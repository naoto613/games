// ================================================================ city layout
const NB = 6, P = 72, RW = 7, SW = 4.5, HALF = NB * P / 2, EDGE = HALF + RW + 18, CURB = 0.15;
const roadC = i => -HALF + i * P;              // road centre line coordinate (i = 0..NB)
const PLAN = [
  'AAATAA',
  'ADDPFA',
  'RDKPID',
  'SDDDDA',
  'RRDGDJ',
  'RHRRRR'];
const blockType = (i, j) => (i < 0 || j < 0 || i >= NB || j >= NB) ? '' : PLAN[j][i];
const blockRect = (i, j) => ({ x0: roadC(i) + RW, x1: roadC(i + 1) - RW, z0: roadC(j) + RW, z1: roadC(j + 1) - RW });
const lotRect = (i, j) => ({ x0: roadC(i) + RW + SW, x1: roadC(i + 1) - RW - SW, z0: roadC(j) + RW + SW, z1: roadC(j + 1) - RW - SW });
const blockCenter = (i, j) => ({ x: (roadC(i) + roadC(i + 1)) / 2, z: (roadC(j) + roadC(j + 1)) / 2 });
const AREA_NAMES = { A: 'みなとまち', D: 'えきまえ ダウンタウン', R: 'ひだまり じゅうたくがい', P: 'どんぐり こうえん', K: 'ひまわり ようちえん', F: 'しょうぼうしょ', I: 'アイス ストリート', S: 'けいさつしょ', G: 'ガソリンスタンド', T: 'ちびっこ タワー', H: 'ぼくの おうち', J: 'ジャンプ パーク' };

// ---------------------------------------------------------------- colliders
const COL = { boxes: [], circles: [], grid: new Map(), cell: 8 };
function colKey(cx, cz) { return cx * 1000 + cz; }
function colInsert(o, x0, z0, x1, z1) {
  const c = COL.cell;
  for (let cx = Math.floor(x0 / c); cx <= Math.floor(x1 / c); cx++) for (let cz = Math.floor(z0 / c); cz <= Math.floor(z1 / c); cz++) {
    const k = colKey(cx, cz); let a = COL.grid.get(k); if (!a) { a = []; COL.grid.set(k, a); } a.push(o);
  }
}
function addBox(x0, z0, x1, z1, h, y0) { const o = { t: 'b', x0: Math.min(x0, x1), z0: Math.min(z0, z1), x1: Math.max(x0, x1), z1: Math.max(z0, z1), h, y0: y0 || 0 }; COL.boxes.push(o); colInsert(o, o.x0, o.z0, o.x1, o.z1); return o; }
function addCircle(x, z, r, h, extra) { const o = Object.assign({ t: 'c', x, z, r, h: h || 3 }, extra); COL.circles.push(o); colInsert(o, x - r, z - r, x + r, z + r); return o; }
const _qs = new Set();
function colQuery(x, z, rad, out) {
  out.length = 0; _qs.clear(); const c = COL.cell;
  for (let cx = Math.floor((x - rad) / c); cx <= Math.floor((x + rad) / c); cx++) for (let cz = Math.floor((z - rad) / c); cz <= Math.floor((z + rad) / c); cz++) {
    const a = COL.grid.get(colKey(cx, cz)); if (!a) continue;
    for (const o of a) if (!_qs.has(o)) { _qs.add(o); if (!o.off) out.push(o); }
  }
  return out;
}

// ---------------------------------------------------------------- ground height
const RAMPS = [];
function inRect(x, z, r, pad) { pad = pad || 0; return x >= r.x0 - pad && x <= r.x1 + pad && z >= r.z0 - pad && z <= r.z1 + pad; }
function onRaised(x, z) {
  if (Math.abs(x) > EDGE || Math.abs(z) > EDGE) return false;
  if (Math.abs(x) > HALF + RW || Math.abs(z) > HALF + RW) return true; // promenade
  const i = Math.floor((x + HALF) / P), j = Math.floor((z + HALF) / P);
  if (i < 0 || j < 0 || i >= NB || j >= NB) return false;
  return inRect(x, z, blockRect(i, j));
}
function groundY(x, z) {
  let g = onRaised(x, z) ? CURB : 0;
  if (Math.abs(x) > EDGE + 0.5 || Math.abs(z) > EDGE + 0.5) g = -1.4;
  for (const r of RAMPS) {
    const dx = x - r.x, dz = z - r.z, c = Math.cos(r.h), s = Math.sin(r.h);
    const along = dx * s + dz * c, lat = dx * c - dz * s;
    if (Math.abs(lat) <= r.w / 2 && along >= -r.len / 2 && along <= r.len / 2) {
      const t = (along + r.len / 2) / r.len; g = Math.max(g, r.base + t * r.top);
    }
  }
  return g;
}
function districtAt(x, z) {
  if (Math.abs(x) > HALF || Math.abs(z) > HALF) return 'みなと プロムナード';
  const i = clamp(Math.floor((x + HALF) / P), 0, NB - 1), j = clamp(Math.floor((z + HALF) / P), 0, NB - 1);
  return AREA_NAMES[blockType(i, j)] || '';
}

// ---------------------------------------------------------------- materials
const MAT = {};
function stdMat(o, cast) { const m = new THREE.MeshStandardMaterial(Object.assign({ vertexColors: true }, o)); m.userData.cast = cast !== false; return m; }
function facadeTex(seed, draw) {
  const w = 512, h = 512;
  const ca = document.createElement('canvas'); ca.width = w; ca.height = h; const a = ca.getContext('2d');
  const cb = document.createElement('canvas'); cb.width = w; cb.height = h; const b = cb.getContext('2d');
  const r = mulberry(seed);
  const rect = (x, y, ww, hh, c, rough, metal) => { a.fillStyle = c; a.fillRect(x, y, ww, hh); b.fillStyle = `rgb(0,${rough * 255 | 0},${metal * 255 | 0})`; b.fillRect(x, y, ww, hh); };
  draw(a, b, rect, r, w, h);
  const ta = new THREE.CanvasTexture(ca); ta.encoding = THREE.sRGBEncoding; ta.wrapS = ta.wrapT = THREE.RepeatWrapping; ta.anisotropy = maxAniso;
  const tb = new THREE.CanvasTexture(cb); tb.wrapS = tb.wrapT = THREE.RepeatWrapping; tb.anisotropy = maxAniso;
  const m = new THREE.MeshStandardMaterial({ map: ta, roughnessMap: tb, metalnessMap: tb, roughness: 1, metalness: 1, vertexColors: true, envMapIntensity: 1.1 });
  m.userData.cast = true;
  return m;
}
function grain(a, w, h, amt, r) { for (let i = 0; i < 3000; i++) { a.fillStyle = `rgba(${r() < 0.5 ? '0,0,0' : '255,255,255'},${amt * r()})`; a.fillRect(r() * w, r() * h, 2, 2); } }
// window helper (curtains/blinds variation)
function win(rect, a, r, x, y, w, h, glass, dark) {
  rect(x, y, w, h, glass, 0.08, 0.75);
  const k = r();
  if (k < 0.35) rect(x + 2, y + 2, w * rr2(r, 0.25, 0.6), h - 4, ['#d9cdb4', '#cfd6dc', '#e6dfcf', '#bfa98a'][(r() * 4) | 0], 0.9, 0);
  else if (k < 0.5) { for (let yy = y + 3; yy < y + h * rr2(r, 0.3, 0.9); yy += 4) rect(x + 1, yy, w - 2, 2, '#c8c8c2', 0.7, 0); }
  else if (k < 0.62) rect(x + 1, y + 1, w - 2, h - 2, dark, 0.25, 0.1);
  // reflection gradient
  const g = a.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, 'rgba(255,255,255,.10)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,.05)');
  a.fillStyle = g; a.fillRect(x, y, w, h);
}
function rr2(r, a, b) { return a + (b - a) * r(); }

function buildMaterials() {
  MAT.asphalt = stdMat({ map: TX.asphalt, normalMap: TX.asphaltN, normalScale: new THREE.Vector2(0.5, 0.5), roughness: 0.93 }, false);
  MAT.walk = stdMat({ map: TX.walk, normalMap: TX.walkN, normalScale: new THREE.Vector2(0.6, 0.6), roughness: 0.88 }, false);
  MAT.curb = stdMat({ map: TX.concrete, roughness: 0.9, color: 0xa9a6a0 });
  MAT.grass = stdMat({ map: TX.grass, roughness: 0.97 }, false);
  MAT.sand = stdMat({ map: TX.sand, roughness: 1 }, false);
  MAT.concrete = stdMat({ map: TX.concrete, roughness: 0.92 });
  MAT.mark = stdMat({ color: 0xeceae4, roughness: 0.75, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }, false);
  MAT.metal = stdMat({ color: 0x9a9da0, roughness: 0.42, metalness: 0.8 });
  MAT.paint = stdMat({ color: 0xffffff, roughness: 0.55, metalness: 0.05 });
  MAT.plastic = stdMat({ color: 0xffffff, roughness: 0.4, metalness: 0 });
  MAT.wood = stdMat({ color: 0x8a6440, roughness: 0.85 });
  MAT.glow = new THREE.MeshBasicMaterial({ vertexColors: true, toneMapped: false }); MAT.glow.userData.cast = false;
  MAT.ao = new THREE.MeshBasicMaterial({ map: canvasTex(4, 64, (x, w, h) => { const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, false, false), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3 });
  MAT.ao.userData.cast = false;
  MAT.water = new THREE.MeshStandardMaterial({ color: 0x1b3f4d, roughness: 0.06, metalness: 0.1, normalMap: TX.waterN, normalScale: new THREE.Vector2(0.35, 0.35), envMapIntensity: 1.25 });
  TX.waterN.repeat.set(180, 180);
  MAT.pond = new THREE.MeshStandardMaterial({ color: 0x2c4a3c, roughness: 0.05, metalness: 0.1, normalMap: TX.waterN, normalScale: new THREE.Vector2(0.2, 0.2) });

  // ---- facades (tile = 12m x 14m : 4 bays x 4 floors, 128px each)
  MAT.fac = [];
  // 0: blue glass curtain wall
  MAT.fac.push(facadeTex(1, (a, b, rect, r) => {
    rect(0, 0, 512, 512, '#9aa3ab', 0.35, 0.85);
    for (let f = 0; f < 4; f++) for (let k = 0; k < 8; k++) {
      const x = k * 64 + 3, y = f * 128 + 3;
      const t = r() * 18 | 0; rect(x, y, 58, 104, `rgb(${70 + t},${92 + t},${112 + t})`, 0.05, 0.92);
      rect(x, y + 106, 58, 16, '#4c5660', 0.3, 0.6);
    }
  }));
  // 1: concrete office with ribbon windows
  MAT.fac.push(facadeTex(2, (a, b, rect, r) => {
    rect(0, 0, 512, 512, '#bdb6a8', 0.85, 0); grain(a, 512, 512, 0.06, r);
    for (let f = 0; f < 4; f++) {
      rect(0, f * 128 + 30, 512, 70, '#3a4550', 0.08, 0.7);
      for (let k = 0; k < 4; k++) for (let m = 0; m < 3; m++) win(rect, a, r, k * 128 + m * 42 + 2, f * 128 + 32, 40, 66, '#45525e', '#20262c');
      rect(0, f * 128 + 100, 512, 6, '#9e978a', 0.8, 0);
    }
  }));
  // 2: beige tiled apartment with balconies
  MAT.fac.push(facadeTex(3, (a, b, rect, r) => {
    rect(0, 0, 512, 512, '#d8cbb3', 0.8, 0);
    for (let y = 0; y < 512; y += 8) rect(0, y, 512, 1, 'rgba(120,100,80,.25)', 0.8, 0);
    for (let f = 0; f < 4; f++) for (let k = 0; k < 4; k++) {
      const x = k * 128, y = f * 128;
      win(rect, a, r, x + 14, y + 14, 70, 88, '#3a4652', '#1d2328');
      rect(x + 90, y + 24, 26, 34, '#3a4652', 0.1, 0.6);
      rect(x + 4, y + 70, 120, 46, '#e9e4da', 0.75, 0); // balcony wall
      rect(x + 4, y + 68, 120, 4, '#b8b0a2', 0.6, 0.2);
      if (r() < 0.45) rect(x + 20 + r() * 50, y + 60, 18, 22, ['#e86a6a', '#6aa0e8', '#f2d36b', '#fff'][(r() * 4) | 0], 0.9, 0); // laundry
      if (r() < 0.5) rect(x + 96, y + 88, 24, 24, '#cfcfca', 0.6, 0.2); // aircon
      rect(x + 124, y, 4, 128, '#c5b79e', 0.8, 0);
    }
  }));
  // 3: brick
  MAT.fac.push(facadeTex(4, (a, b, rect, r) => {
    rect(0, 0, 512, 512, '#8a4a36', 0.9, 0);
    for (let y = 0; y < 512; y += 8) for (let x = (y / 8) % 2 ? -8 : 0; x < 512; x += 16) { const t = r() * 30 - 15 | 0; rect(x + 1, y + 1, 14, 6, `rgb(${150 + t},${78 + t / 2},${58 + t / 3})`, 0.92, 0); }
    for (let f = 0; f < 4; f++) for (let k = 0; k < 4; k++) {
      const x = k * 128 + 34, y = f * 128 + 22;
      rect(x - 6, y - 6, 72, 92, '#d8d0c0', 0.8, 0);
      win(rect, a, r, x, y, 60, 80, '#33404a', '#1c2228');
      rect(x + 28, y, 4, 80, '#eae4d8', 0.6, 0); rect(x, y + 38, 60, 4, '#eae4d8', 0.6, 0);
    }
  }));
  // 4: white modern apartment
  MAT.fac.push(facadeTex(5, (a, b, rect, r) => {
    rect(0, 0, 512, 512, '#e9e7e2', 0.7, 0); grain(a, 512, 512, 0.04, r);
    for (let f = 0; f < 4; f++) for (let k = 0; k < 4; k++) {
      const x = k * 128, y = f * 128;
      win(rect, a, r, x + 10, y + 12, 108, 80, '#2f3a44', '#1a2026');
      rect(x + 6, y + 70, 116, 36, 'rgba(160,190,200,.75)', 0.15, 0.3); // glass balcony
      rect(x + 6, y + 68, 116, 3, '#888', 0.3, 0.8);
      rect(x, y + 106, 128, 22, '#d5d2cb', 0.7, 0);
    }
  }));
  // 5: grey-green glass tower
  MAT.fac.push(facadeTex(6, (a, b, rect, r) => {
    rect(0, 0, 512, 512, '#62686b', 0.3, 0.9);
    for (let f = 0; f < 4; f++) for (let k = 0; k < 4; k++) {
      const t = r() * 14 | 0; rect(k * 128 + 6, f * 128 + 4, 116, 112, `rgb(${84 + t},${108 + t},${104 + t})`, 0.04, 0.95);
      rect(k * 128 + 62, f * 128 + 4, 4, 112, '#5a6064', 0.3, 0.9);
    }
  }));
  // 6: house siding (cream)
  MAT.fac.push(facadeTex(7, (a, b, rect, r) => {
    rect(0, 0, 512, 512, '#e6dcc6', 0.8, 0);
    for (let y = 0; y < 512; y += 12) { rect(0, y, 512, 2, 'rgba(110,95,70,.35)', 0.8, 0); }
    for (let f = 0; f < 4; f++) for (let k = 0; k < 2; k++) {
      const x = k * 256 + 70, y = f * 128 + 24;
      rect(x - 5, y - 5, 110, 86, '#fbf8f2', 0.6, 0);
      win(rect, a, r, x, y, 100, 76, '#36424c', '#1c2228');
      rect(x + 48, y, 4, 76, '#fbf8f2', 0.6, 0);
    }
  }));
  // shop atlas (8 shops, 2 cols x 4 rows of 512x256)
  MAT.shop = buildShopAtlas();
  // roof bits
  MAT.roofTile = stdMat({ map: canvasTex(256, 256, (x, w, h) => { noiseFill(x, w, h, [70, 74, 82], 18, 31, 4, 3); for (let y = 0; y < h; y += 16) { x.fillStyle = 'rgba(0,0,0,.35)'; x.fillRect(0, y, w, 3); x.fillStyle = 'rgba(255,255,255,.08)'; x.fillRect(0, y + 3, w, 2); } }, true), roughness: 0.6, metalness: 0.2 });
}

function buildShopAtlas() {
  const W = 1024, H = 1024;
  const ca = document.createElement('canvas'); ca.width = W; ca.height = H; const a = ca.getContext('2d');
  const cb = document.createElement('canvas'); cb.width = W; cb.height = H; const b = cb.getContext('2d');
  const shops = [['パン', '#b5651d', '🥐'], ['ケーキ', '#e87aa0', '🍰'], ['おもちゃ', '#2f7de1', '🧸'], ['コンビニ', '#1aa053', '🍙'], ['カフェ', '#5b4636', '☕'], ['ほんや', '#7a3fb0', '📚'], ['はなや', '#e85a7a', '🌷'], ['ラーメン', '#c9302c', '🍜']];
  const r = mulberry(99);
  shops.forEach((s, n) => {
    const ox = (n % 2) * 512, oy = Math.floor(n / 2) * 256;
    const rect = (x, y, w, h, c, rough, metal) => { a.fillStyle = c; a.fillRect(ox + x, oy + y, w, h); b.fillStyle = `rgb(0,${rough * 255 | 0},${metal * 255 | 0})`; b.fillRect(ox + x, oy + y, w, h); };
    rect(0, 0, 512, 256, '#8d8780', 0.85, 0);
    rect(0, 0, 512, 64, s[1], 0.45, 0.05);                 // sign band
    rect(0, 60, 512, 6, '#2a2a2a', 0.4, 0.6);
    a.font = '900 42px "Hiragino Sans","Noto Sans JP",sans-serif'; a.textBaseline = 'middle'; a.textAlign = 'center';
    a.fillStyle = '#fff'; a.fillText(s[2] + ' ' + s[0] + ' ' + s[2], ox + 256, oy + 33);
    // awning stripes
    for (let k = 0; k < 16; k++) rect(k * 32, 66, 32, 18, k % 2 ? '#f4efe6' : s[1], 0.8, 0);
    // display windows
    rect(14, 92, 300, 156, '#2a3238', 0.06, 0.7);
    for (let k = 0; k < 3; k++) { rect(24, 120 + k * 42, 280, 4, '#9a8a70', 0.6, 0); for (let m = 0; m < 9; m++) if (r() < 0.8) rect(28 + m * 30, 100 + k * 42, 22, 20, `hsl(${r() * 360},50%,${50 + r() * 25}%)`, 0.6, 0); }
    const g = a.createLinearGradient(ox + 14, oy + 92, ox + 314, oy + 248); g.addColorStop(0, 'rgba(255,255,255,.18)'); g.addColorStop(0.45, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,.08)');
    a.fillStyle = g; a.fillRect(ox + 14, oy + 92, 300, 156);
    // door
    rect(340, 92, 140, 164, '#3a3a3a', 0.4, 0.6); rect(348, 100, 58, 150, '#2b3a44', 0.05, 0.75); rect(414, 100, 58, 150, '#2b3a44', 0.05, 0.75);
    rect(400, 160, 4, 30, '#ccc', 0.3, 0.9); rect(416, 160, 4, 30, '#ccc', 0.3, 0.9);
  });
  const ta = new THREE.CanvasTexture(ca); ta.encoding = THREE.sRGBEncoding; ta.anisotropy = maxAniso;
  const tb = new THREE.CanvasTexture(cb); tb.anisotropy = maxAniso;
  const m = new THREE.MeshStandardMaterial({ map: ta, roughnessMap: tb, metalnessMap: tb, roughness: 1, metalness: 1, vertexColors: true });
  m.userData.cast = false;
  return m;
}

// sign texture (single canvas material)
function signMat(text, bg, fg, w, h, font) {
  const t = canvasTex(w || 512, h || 128, (x, W, H) => {
    x.fillStyle = bg; x.fillRect(0, 0, W, H);
    x.strokeStyle = 'rgba(0,0,0,.25)'; x.lineWidth = 8; x.strokeRect(4, 4, W - 8, H - 8);
    x.fillStyle = fg; x.font = `900 ${font || H * 0.55}px "Hiragino Sans","Noto Sans JP",sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, W / 2, H / 2 + 2);
  }, true, false);
  const m = new THREE.MeshStandardMaterial({ map: t, roughness: 0.5, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: 0.18 });
  return m;
}
function addSign(text, bg, fg, x, y, z, ry, w, h) {
  const m = signMat(text, bg, fg, 512, Math.round(512 * h / w));
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m);
  mesh.position.set(x, y, z); mesh.rotation.y = ry; scene.add(mesh);
  const back = new THREE.Mesh(new THREE.BoxGeometry(w + 0.2, h + 0.2, 0.15), MAT_SIMPLE(0x333333));
  back.position.set(x - Math.sin(ry) * 0.09, y, z - Math.cos(ry) * 0.09); back.rotation.y = ry; back.castShadow = true; scene.add(back);
  return mesh;
}
const _simple = {};
function MAT_SIMPLE(c, rough, metal) { const k = c + '_' + rough + '_' + metal; return _simple[k] || (_simple[k] = new THREE.MeshStandardMaterial({ color: c, roughness: rough == null ? 0.6 : rough, metalness: metal || 0 })); }

// ---------------------------------------------------------------- wall / roof helpers
const PLANE = new THREE.PlaneGeometry(1, 1);
function addWalls(mat, x0, z0, x1, z1, y0, y1, tu, tv, c) {
  const w = x1 - x0, d = z1 - z0, h = y1 - y0, cy = (y0 + y1) / 2, vo = y0 / tv;
  const uvf = (len, uo) => (i, u, v) => [u * len / tu + uo, v * h / tv + vo];
  sadd(mat, PLANE, M((x0 + x1) / 2, cy, z1, 0, w, h, 1), c, uvf(w, x0 / tu));
  sadd(mat, PLANE, M((x0 + x1) / 2, cy, z0, Math.PI, w, h, 1), c, uvf(w, -x1 / tu));
  sadd(mat, PLANE, M(x1, cy, (z0 + z1) / 2, Math.PI / 2, d, h, 1), c, uvf(d, -z1 / tu));
  sadd(mat, PLANE, M(x0, cy, (z0 + z1) / 2, -Math.PI / 2, d, h, 1), c, uvf(d, z0 / tu));
}
function addFlat(mat, x0, z0, x1, z1, y, tu, c) {
  const w = x1 - x0, d = z1 - z0;
  sadd(mat, PLANE, M((x0 + x1) / 2, y, (z0 + z1) / 2, 0, w, d, 1, -Math.PI / 2), c, (i, u, v) => [(x0 + u * w) / tu, (-z1 + v * d) / tu]);
}
function addBoxMesh(mat, x, y, z, w, h, d, ry, c, tu) {
  sadd(mat, UNIT_BOX, M(x, y, z, ry || 0, w, h, d), c, tu ? boxWorldUV(w, h, d, tu, tu) : null);
}
function addAO(x0, z0, x1, z1, y) {
  const s = 1.1; y = y + 0.012;
  sadd(MAT.ao, PLANE, M((x0 + x1) / 2, y, z1 + s / 2, 0, x1 - x0, s, 1, -Math.PI / 2, 0));
  sadd(MAT.ao, PLANE, M((x0 + x1) / 2, y, z0 - s / 2, Math.PI, x1 - x0, s, 1, -Math.PI / 2));
  sadd(MAT.ao, PLANE, M(x1 + s / 2, y, (z0 + z1) / 2, Math.PI / 2, z1 - z0, s, 1, -Math.PI / 2));
  sadd(MAT.ao, PLANE, M(x0 - s / 2, y, (z0 + z1) / 2, -Math.PI / 2, z1 - z0, s, 1, -Math.PI / 2));
}
// Note: for AO planes we need the gradient to fade away from the wall. PlaneGeometry v=1 is the far edge after rotation; handled via texture (dark at bottom = v 0)

// ---------------------------------------------------------------- building
const BUILDINGS = [];
function building(x0, z0, x1, z1, H, fac, opts) {
  opts = opts || {};
  const y0 = CURB;
  addWalls(MAT.fac[fac], x0, z0, x1, z1, y0, y0 + H, 12, 14);
  // shopfronts on street-facing sides
  if (opts.shops) {
    for (const side of opts.shops) shopRow(x0, z0, x1, z1, side, y0);
  }
  // roof + parapet
  addFlat(MAT.concrete, x0, z0, x1, z1, y0 + H, 8, col(0x9a968e));
  const pt = 0.35, ph = 1.0, top = y0 + H + ph / 2, cc = col(0xb8b2a6);
  addBoxMesh(MAT.concrete, (x0 + x1) / 2, top, z0 + pt / 2, x1 - x0, ph, pt, 0, cc, 4);
  addBoxMesh(MAT.concrete, (x0 + x1) / 2, top, z1 - pt / 2, x1 - x0, ph, pt, 0, cc, 4);
  addBoxMesh(MAT.concrete, x0 + pt / 2, top, (z0 + z1) / 2, pt, ph, z1 - z0 - pt * 2, 0, cc, 4);
  addBoxMesh(MAT.concrete, x1 - pt / 2, top, (z0 + z1) / 2, pt, ph, z1 - z0 - pt * 2, 0, cc, 4);
  // rooftop clutter
  const r = mulberry((x0 * 13 + z0 * 7) | 0);
  const w = x1 - x0, d = z1 - z0;
  if (!opts.plainRoof) {
    if (w > 8 && d > 8) {
      const sx = x0 + 2 + r() * (w - 8), sz = z0 + 2 + r() * (d - 8);
      addBoxMesh(MAT.concrete, sx + 2, y0 + H + 1.4, sz + 2, 4, 2.8, 4, 0, col(0xc9c3b6), 4);
      const n = 1 + (r() * 4 | 0);
      for (let k = 0; k < n; k++) addBoxMesh(MAT.metal, x0 + 1.5 + r() * (w - 3), y0 + H + 0.5, z0 + 1.5 + r() * (d - 3), 1.4, 1, 0.9, (r() * 2 | 0) * Math.PI / 2, col(0xe0e0dc));
      if (r() < 0.6) { const tx = x0 + 2 + r() * (w - 4), tz = z0 + 2 + r() * (d - 4); sadd(MAT.metal, CYL, M(tx, y0 + H + 2.4, tz, 0, 1.6, 2.2, 1.6), col(0xd8d4cc)); for (const [ox, oz] of [[-.6, -.6], [.6, -.6], [-.6, .6], [.6, .6]]) addBoxMesh(MAT.metal, tx + ox, y0 + H + 0.65, tz + oz, 0.12, 1.3, 0.12); }
    }
  }
  addAO(x0, z0, x1, z1, CURB);
  addBox(x0, z0, x1, z1, y0 + H + 1);
  BUILDINGS.push({ x0, z0, x1, z1, h: y0 + H });
}
function shopRow(x0, z0, x1, z1, side, y0) {
  // side: 'n' (z0), 's' (z1), 'w' (x0), 'e' (x1)
  const len = (side === 'n' || side === 's') ? x1 - x0 : z1 - z0;
  const n = Math.max(1, Math.round(len / 9)), seg = len / n, hh = 4.2, off = 0.06;
  for (let k = 0; k < n; k++) {
    const v = (Math.abs((x0 * 3 + z0 * 5 + k * 7) | 0)) % 8, u0 = (v % 2) * 0.5, v0 = 1 - (Math.floor(v / 2) + 1) * 0.25;
    const uvs = (i, u, vv) => [u0 + u * 0.5, v0 + vv * 0.25];
    const c = k * seg + seg / 2, cy = y0 + hh / 2;
    let m;
    if (side === 's') m = M(x0 + c, cy, z1 + off, 0, seg, hh, 1);
    else if (side === 'n') m = M(x1 - c, cy, z0 - off, Math.PI, seg, hh, 1);
    else if (side === 'e') m = M(x1 + off, cy, z1 - c, Math.PI / 2, seg, hh, 1);
    else m = M(x0 - off, cy, z0 + c, -Math.PI / 2, seg, hh, 1);
    sadd(MAT.shop, PLANE, m, null, uvs);
  }
  // awning shelf (casts a nice shadow line)
  const ad = 1.1, ay = y0 + hh - 0.15;
  if (side === 's') addBoxMesh(MAT.plastic, (x0 + x1) / 2, ay, z1 + ad / 2, x1 - x0, 0.12, ad, 0, col(0x55575a));
  if (side === 'n') addBoxMesh(MAT.plastic, (x0 + x1) / 2, ay, z0 - ad / 2, x1 - x0, 0.12, ad, 0, col(0x55575a));
  if (side === 'e') addBoxMesh(MAT.plastic, x1 + ad / 2, ay, (z0 + z1) / 2, ad, 0.12, z1 - z0, 0, col(0x55575a));
  if (side === 'w') addBoxMesh(MAT.plastic, x0 - ad / 2, ay, (z0 + z1) / 2, ad, 0.12, z1 - z0, 0, col(0x55575a));
}
const CYL = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
const CYL8 = new THREE.CylinderGeometry(0.5, 0.5, 1, 8);
const SPH = new THREE.SphereGeometry(0.5, 16, 12);

// gable-roof house
function house(cx, cz, w, d, ry, r) {
  const wallC = col(pick([0xffffff, 0xf3ead8, 0xe8e2d6, 0xdcd4c2, 0xf0e6e0]));
  const h = 5.6;
  const hw = ry ? d : w, hd = ry ? w : d;
  const x0 = cx - hw / 2, x1 = cx + hw / 2, z0 = cz - hd / 2, z1 = cz + hd / 2;
  addWalls(MAT.fac[6], x0, z0, x1, z1, CURB, CURB + h, 12, 14, wallC);
  addFlat(MAT.concrete, x0, z0, x1, z1, CURB + h, 8);
  // roof prism
  const roofC = col(pick([0x3b4250, 0x5a3b30, 0x2f4a3f, 0x6b6b70, 0x834236]));
  const rh = 2.2, ov = 0.5;
  const shape = new THREE.Shape(); const L = (ry ? hd : hw) / 2 + ov;
  shape.moveTo(-L, 0); shape.lineTo(L, 0); shape.lineTo(0, rh); shape.lineTo(-L, 0);
  const g = new THREE.ExtrudeGeometry(shape, { depth: (ry ? hw : hd) + ov * 2, bevelEnabled: false });
  g.translate(0, 0, -((ry ? hw : hd) + ov * 2) / 2);
  sadd(MAT.roofTile, g, M(cx, CURB + h, cz, ry ? Math.PI / 2 : 0), roofC, (i, u, v) => [u * 0.25, v * 0.25]);
  // door + step
  const doorSide = r() < 0.5 ? 1 : -1;
  addBoxMesh(MAT.wood, cx + (ry ? 0 : hw * 0.25), CURB + 1.05, ry ? cz : cz + doorSide * (hd / 2 + 0.03), ry ? 0.06 : 1.0, 2.1, ry ? 1.0 : 0.06, ry ? Math.PI / 2 : 0, col(0x6e4a2e));
  addAO(x0, z0, x1, z1, CURB);
  addBox(x0, z0, x1, z1, CURB + h + rh);
  BUILDINGS.push({ x0, z0, x1, z1, h: CURB + h });
}
function wallFence(x0, z0, x1, z1, h, c, gaps) {
  // low concrete-block wall around a lot (Japanese "block-bei"); gaps: list of [axis,pos,width]
  const t = 0.18, cc = col(c || 0xc9c4b8);
  const seg = (ax0, az0, ax1, az1) => {
    const w = Math.abs(ax1 - ax0) || t, d = Math.abs(az1 - az0) || t;
    addBoxMesh(MAT.concrete, (ax0 + ax1) / 2, CURB + h / 2, (az0 + az1) / 2, w, h, d, 0, cc, 2);
    addBox(Math.min(ax0, ax1) - t / 2, Math.min(az0, az1) - t / 2, Math.max(ax0, ax1) + t / 2, Math.max(az0, az1) + t / 2, CURB + h);
  };
  const cut = (a0, a1, fixed, horiz) => {
    let parts = [[a0, a1]];
    for (const gp of gaps || []) if (gp[0] === (horiz ? 'z' : 'x') && Math.abs(gp[3] - fixed) < 0.5) {
      const np = []; for (const [p0, p1] of parts) { const g0 = gp[1] - gp[2] / 2, g1 = gp[1] + gp[2] / 2; if (g1 <= p0 || g0 >= p1) np.push([p0, p1]); else { if (g0 > p0) np.push([p0, g0]); if (g1 < p1) np.push([g1, p1]); } } parts = np;
    }
    for (const [p0, p1] of parts) horiz ? seg(p0, fixed, p1, fixed) : seg(fixed, p0, fixed, p1);
  };
  cut(x0, x1, z0, true); cut(x0, x1, z1, true); cut(z0, z1, x0, false); cut(z0, z1, x1, false);
}

// ---------------------------------------------------------------- instanced decor (trees etc.)
const INST = {};
function instGroup(name, geo, mat, max, cast) {
  const m = new THREE.InstancedMesh(geo, mat, max); m.count = 0; m.castShadow = cast !== false; m.receiveShadow = true; m.frustumCulled = false;
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  INST[name] = m; scene.add(m); return m;
}
function instAdd(name, m4, c) { const im = INST[name]; if (im.count >= im.instanceMatrix.count) return -1; const i = im.count++; im.setMatrixAt(i, m4); if (c) im.setColorAt(i, c); return i; }

function makeFoliageGeo() {
  const gb = new GB(), n = makeNoise2(41, 16);
  const blobs = [[0, 0, 0, 1.6], [0.9, 0.5, 0.3, 1.1], [-0.8, 0.4, -0.4, 1.15], [0.2, 1.1, -0.2, 1.0], [-0.3, -0.3, 0.9, 1.0], [0.3, -0.2, -1.0, 0.95]];
  for (const [x, y, z, s] of blobs) {
    const g = new THREE.IcosahedronGeometry(s, 1);
    const p = g.attributes.position, v = new V3();
    const cs = [];
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i); const d = 1 + (n(v.x * 2 + 5, v.z * 2 + v.y * 1.3) - 0.5) * 0.45; v.multiplyScalar(d); p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    const gg = g.toNonIndexed ? g : g;
    gb.add(gg, M(x, y, z, 0));
  }
  const geo = gb.build();
  // AO: darker underneath
  const p = geo.attributes.position, c = geo.attributes.color;
  for (let i = 0; i < p.count; i++) { const k = clamp(0.55 + (p.getY(i) + 1.2) * 0.22, 0.5, 1.05); c.setXYZ(i, k, k, k); }
  return geo;
}
function buildDecorInstances() {
  const leafMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, vertexColors: true, map: TX.grass });
  const barkMat = new THREE.MeshStandardMaterial({ color: 0x5a4636, roughness: 0.95 });
  instGroup('leaf', makeFoliageGeo(), leafMat, 700);
  instGroup('trunk', new THREE.CylinderGeometry(0.13, 0.22, 1, 7).translate(0, 0.5, 0), barkMat, 700);
  // utility pole
  instGroup('pole', new THREE.CylinderGeometry(0.14, 0.19, 1, 8).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ color: 0x9c968a, roughness: 0.85 }), 400);
  const armGeo = new GB();
  armGeo.add(UNIT_BOX, M(0, 0, 0, 0, 1.8, 0.1, 0.12)); armGeo.add(UNIT_BOX, M(0, -1.2, 0, 0, 1.4, 0.1, 0.12));
  armGeo.add(CYL8, M(0.75, 0.12, 0, 0, 0.1, 0.18, 0.1)); armGeo.add(CYL8, M(-0.75, 0.12, 0, 0, 0.1, 0.18, 0.1)); armGeo.add(CYL8, M(0, 0.12, 0, 0, 0.1, 0.18, 0.1));
  armGeo.add(CYL, M(0, -2.2, 0.32, 0, 0.5, 0.9, 0.5)); // transformer
  instGroup('poleArm', armGeo.build(), new THREE.MeshStandardMaterial({ color: 0x6b6d70, roughness: 0.6, metalness: 0.4, vertexColors: true }), 400);
  // street lamp head (arm + lamp) attached to poles
  const lampGeo = new GB();
  lampGeo.add(UNIT_BOX, M(0, 0, 0.9, 0, 0.08, 0.08, 1.8)); lampGeo.add(UNIT_BOX, M(0, -0.08, 1.75, 0, 0.32, 0.12, 0.6));
  instGroup('lamp', lampGeo.build(), new THREE.MeshStandardMaterial({ color: 0x8f9296, roughness: 0.5, metalness: 0.6, vertexColors: true }), 400);
  // traffic light housings (horizontal Japanese type)
  const tlGeo = new GB();
  tlGeo.add(UNIT_BOX, M(0, 0, 0, 0, 1.25, 0.42, 0.28));
  tlGeo.add(UNIT_BOX, M(0, 0.24, 0.14, 0, 1.3, 0.04, 0.3, 0.5));
  instGroup('tlBox', tlGeo.build(), new THREE.MeshStandardMaterial({ color: 0x7c7f82, roughness: 0.45, metalness: 0.5, vertexColors: true }), 200);
  instGroup('tlLamp', new THREE.CylinderGeometry(0.15, 0.15, 0.05, 14).rotateX(Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0xffffff, toneMapped: false }), 600, false);
  instGroup('tlPole', new THREE.CylinderGeometry(0.1, 0.12, 1, 8).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ color: 0x8b8e91, roughness: 0.45, metalness: 0.6 }), 200);
  instGroup('tlArm', new THREE.BoxGeometry(1, 0.1, 0.1).translate(0.5, 0, 0), new THREE.MeshStandardMaterial({ color: 0x8b8e91, roughness: 0.45, metalness: 0.6 }), 200);
  // vending machine
  const vmTex = canvasTex(128, 256, (x, w, h) => {
    x.fillStyle = '#f2f2f0'; x.fillRect(0, 0, w, h);
    x.fillStyle = '#d42a2a'; x.fillRect(0, 0, w, 26);
    x.fillStyle = '#e8f2ff'; x.fillRect(8, 32, w - 16, 120);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { x.fillStyle = `hsl(${(r * 6 + c) * 37 % 360},70%,55%)`; x.fillRect(12 + c * 18, 38 + r * 29, 12, 22); x.fillStyle = '#2a2'; x.fillRect(13 + c * 18, 61 + r * 29, 10, 3); }
    x.fillStyle = '#333'; x.fillRect(w - 30, 160, 16, 28); x.fillStyle = '#222'; x.fillRect(14, 210, w - 28, 30);
  }, true, false);
  const vmM = new THREE.MeshStandardMaterial({ map: vmTex, roughness: 0.35, emissive: 0xffffff, emissiveMap: vmTex, emissiveIntensity: 0.25 });
  instGroup('vend', new THREE.BoxGeometry(1, 1.83, 0.8).translate(0, 0.915, 0), [MAT_SIMPLE(0xe8e8e6, 0.4), MAT_SIMPLE(0xe8e8e6, 0.4), MAT_SIMPLE(0xd8d8d6, 0.4), MAT_SIMPLE(0xe8e8e6, 0.4), vmM, MAT_SIMPLE(0xe8e8e6, 0.4)], 150);
  // bench
  const bg = new GB();
  bg.add(UNIT_BOX, M(0, 0.45, 0, 0, 1.8, 0.06, 0.45), col(0x8a6440)); bg.add(UNIT_BOX, M(0, 0.75, -0.22, 0, 1.8, 0.4, 0.05, -0.15), col(0x8a6440));
  bg.add(UNIT_BOX, M(-0.75, 0.22, 0, 0, 0.06, 0.45, 0.42), col(0x333333)); bg.add(UNIT_BOX, M(0.75, 0.22, 0, 0, 0.06, 0.45, 0.42), col(0x333333));
  instGroup('bench', bg.build(), new THREE.MeshStandardMaterial({ roughness: 0.7, vertexColors: true }), 80);
}

// ---------------------------------------------------------------- traffic lights state
const TL = { t: 0, lamps: [] };   // lamps: {i, axis:'x'|'z', k:0 blue,1 yellow,2 red}
function tlState(axis) {
  // cycle 26s: x green 0-10, yellow 10-12.5, allred 12.5-13, z green 13-23, yellow 23-25.5, allred 25.5-26
  const t = TL.t % 26;
  if (axis === 'x') return t < 10 ? 0 : t < 12.5 ? 1 : 2;
  return t >= 13 && t < 23 ? 0 : t >= 23 && t < 25.5 ? 1 : 2;
}
const TLC = [new THREE.Color(0x10c8a0), new THREE.Color(0xffb020), new THREE.Color(0xff2a1a)];
const TLOFF = new THREE.Color(0x202326);
let tlLast = '';
function updateTrafficLights(dt) {
  TL.t += dt;
  const sx = tlState('x'), sz = tlState('z'), key = sx + '' + sz;
  if (key === tlLast) return; tlLast = key;
  const im = INST.tlLamp;
  for (const l of TL.lamps) { const s = l.axis === 'x' ? sx : sz; im.setColorAt(l.i, l.k === s ? TLC[s] : TLOFF); }
  im.instanceColor.needsUpdate = true;
}

// ---------------------------------------------------------------- breakable props (dynamic)
const PROPS = [];
function propTypes() {
  const cone = new GB();
  cone.add(new THREE.ConeGeometry(0.2, 0.62, 14).translate(0, 0.35, 0), M(0, 0, 0), col(0xff5a14));
  cone.add(new THREE.CylinderGeometry(0.125, 0.155, 0.1, 14), M(0, 0.33, 0), col(0xffffff));
  cone.add(UNIT_BOX, M(0, 0.02, 0, 0, 0.42, 0.04, 0.42), col(0xff5a14));
  const bin = new GB();
  bin.add(new THREE.CylinderGeometry(0.3, 0.27, 0.85, 16).translate(0, 0.425, 0), M(0, 0, 0), col(0x2f6b4a));
  bin.add(new THREE.CylinderGeometry(0.32, 0.32, 0.08, 16), M(0, 0.88, 0), col(0x24533a));
  const post = new GB();
  post.add(new THREE.CylinderGeometry(0.22, 0.22, 1.1, 18).translate(0, 0.55, 0), M(0, 0, 0), col(0xd2261c));
  post.add(new THREE.SphereGeometry(0.22, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2), M(0, 1.1, 0), col(0xd2261c));
  post.add(UNIT_BOX, M(0, 0.95, 0.2, 0, 0.26, 0.04, 0.06), col(0x222222));
  const hyd = new GB();
  hyd.add(new THREE.CylinderGeometry(0.14, 0.17, 0.75, 14).translate(0, 0.375, 0), M(0, 0, 0), col(0xd8301f));
  hyd.add(new THREE.SphereGeometry(0.15, 14, 8), M(0, 0.76, 0), col(0xd8301f));
  hyd.add(new THREE.CylinderGeometry(0.06, 0.06, 0.42, 10).rotateZ(Math.PI / 2), M(0, 0.55, 0), col(0xb8b8b8));
  const box = new GB();
  box.add(UNIT_BOX, M(0, 0.25, 0, 0, 0.6, 0.5, 0.5), col(0xb08a5a));
  const mat = new THREE.MeshStandardMaterial({ roughness: 0.55, vertexColors: true });
  const T = { cone: [cone.build(), 80, 0.3], bin: [bin.build(), 220, 0.35], post: [post.build(), 120, 0.3], hyd: [hyd.build(), 120, 0.22], box: [box.build(), 200, 0.38] };
  for (const k in T) instGroup('p_' + k, T[k][0], mat, T[k][1]);
  return T;
}
let PT;
function addProp(type, x, z, ry) {
  const p = { type, x, z, y: CURB, ry: ry || 0, ox: x, oz: z, oy: CURB, ory: ry || 0, vx: 0, vy: 0, vz: 0, rx: 0, rz: 0, wx: 0, wz: 0, wy: 0, state: 0, t: 0, r: PT[type][2] };
  const im = INST['p_' + type]; if (im.count >= im.instanceMatrix.count) return null;
  p.i = im.count++;
  p.col = addCircle(x, z, p.r, 1, { prop: p });
  PROPS.push(p); setPropMatrix(p);
  return p;
}
function setPropMatrix(p) { INST['p_' + p.type].setMatrixAt(p.i, M(p.x, p.y, p.z, p.ry, 1, 1, 1, p.rx, p.rz)); INST['p_' + p.type].instanceMatrix.needsUpdate = true; }

// ---------------------------------------------------------------- build city
const SPOTS = {};   // named world positions
const PARKING = []; // parked car spots {x,z,h,type}
const PED_LOOPS = [];
function buildCity(progress) {
  const r = mulberry(777);
  // ---- base asphalt + sea + seawall
  addFlat(MAT.asphalt, -EDGE, -EDGE, EDGE, EDGE, 0, 9);
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(6000, 6000).rotateX(-Math.PI / 2), MAT.water);
  sea.position.y = -1.4; sea.receiveShadow = true; scene.add(sea); WORLD.sea = sea;
  for (const s of [-1, 1]) {
    addBoxMesh(MAT.curb, 0, -2, s * (EDGE + 0.5), EDGE * 2 + 2, 4.3, 1, 0, col(0xa8a49a), 3);
    addBoxMesh(MAT.curb, s * (EDGE + 0.5), -2, 0, 1, 4.3, EDGE * 2, 0, col(0xa8a49a), 3);
    // tetrapod-ish rocks at the base of seawall
  }
  // ---- promenade ring
  const pr = HALF + RW;
  const promo = [[-EDGE, -EDGE, EDGE, -pr], [-EDGE, pr, EDGE, EDGE], [-EDGE, -pr, -pr, pr], [pr, -pr, EDGE, pr]];
  for (const [x0, z0, x1, z1] of promo) {
    addFlat(MAT.walk, x0, z0, x1, z1, CURB, 3);
    addWalls(MAT.curb, x0, z0, x1, z1, 0, CURB, 3, 3);
  }
  // railing
  const railC = col(0xd8dcdf);
  for (const s of [-1, 1]) for (const ax of [0, 1]) {
    for (let t = -EDGE; t <= EDGE; t += 2.5) { const x = ax ? s * (EDGE - 0.3) : t, z = ax ? t : s * (EDGE - 0.3); addBoxMesh(MAT.metal, x, CURB + 0.55, z, 0.07, 1.1, 0.07, 0, railC); }
    for (const yy of [0.55, 1.08]) { if (ax) addBoxMesh(MAT.metal, s * (EDGE - 0.3), CURB + yy, 0, 0.06, 0.06, EDGE * 2, 0, railC); else addBoxMesh(MAT.metal, 0, CURB + yy, s * (EDGE - 0.3), EDGE * 2, 0.06, 0.06, 0, railC); }
    if (ax) addBox(s * (EDGE - 0.3) - 0.2, -EDGE, s * (EDGE - 0.3) + 0.2, EDGE, 1.3); else addBox(-EDGE, s * (EDGE - 0.3) - 0.2, EDGE, s * (EDGE - 0.3) + 0.2, 1.3);
  }
  // promenade trees & benches
  for (let t = -EDGE + 12; t < EDGE - 10; t += 16) for (const s of [-1, 1]) {
    tree(t, s * (EDGE - 6), 1.25 + r() * 0.4, r); tree(s * (EDGE - 6), t, 1.25 + r() * 0.4, r);
    if (r() < 0.35) { instAdd('bench', M(t + 5, CURB, s * (EDGE - 2.2), s > 0 ? Math.PI : 0)); }
  }
  distantLand();
  progress(0.3);

  // ---- blocks
  for (let j = 0; j < NB; j++) for (let i = 0; i < NB; i++) {
    const br = blockRect(i, j), t = blockType(i, j);
    // raised slab
    addFlat(t === 'P' ? MAT.walk : MAT.walk, br.x0, br.z0, br.x1, br.z1, CURB, 3);
    addWalls(MAT.curb, br.x0, br.z0, br.x1, br.z1, 0, CURB, 3, 3, col(0xcfccc4));
    buildBlock(i, j, t, r);
    sidewalkFurniture(i, j, t, r);
    PED_LOOPS.push({ i, j, x0: br.x0 + SW * 0.45, x1: br.x1 - SW * 0.45, z0: br.z0 + SW * 0.45, z1: br.z1 - SW * 0.45 });
  }
  progress(0.55);
  roadMarkings();
  intersections(r);
  progress(0.7);
}
const WORLD = {};
function distantLand() {
  const n = makeNoise2(91, 32), gb = new GB();
  const isl = [[-900, -1300, 520, 160], [700, -1500, 700, 230], [1500, -300, 450, 120], [-1500, 400, 600, 190], [300, 1600, 520, 140], [-700, 1450, 380, 90]];
  for (const [x, z, r, h] of isl) {
    const g = new THREE.CircleGeometry(r, 48, 0, Math.PI * 2); g.rotateX(-Math.PI / 2);
    const cg = new THREE.ConeGeometry(r, h, 48, 6, true);
    const p = cg.attributes.position;
    for (let i = 0; i < p.count; i++) { const vx = p.getX(i), vy = p.getY(i), vz = p.getZ(i); const k = (vy + h / 2) / h; const d = 1 + (fbm(n, vx / 180 + x, vz / 180 + z, 3) - 0.5) * 0.6 * (1 - k * 0.5); p.setXYZ(i, vx * d, vy * (0.7 + fbm(n, vx / 90, vz / 90, 2) * 0.6), vz * d); }
    cg.computeVertexNormals();
    gb.add(cg, M(x, h / 2 - 8, z), col(0x5d6e5a));
  }
  const m = new THREE.Mesh(gb.build(), new THREE.MeshLambertMaterial({ vertexColors: true, fog: false, color: 0x8193a3, emissive: 0x58687a, emissiveIntensity: 0.55 }));
  scene.add(m);
}

function tree(x, z, s, r) {
  const h = (2.6 + r() * 1.4) * s;
  instAdd('trunk', M(x, CURB, z, r() * 6, s * 1.2, h + 0.6, s * 1.2));
  const c = new THREE.Color().setHSL(0.22 + r() * 0.08, 0.35 + r() * 0.2, 0.32 + r() * 0.12);
  instAdd('leaf', M(x, CURB + h + 1.2 * s, z, r() * 6, s * (0.95 + r() * 0.2), s * (0.9 + r() * 0.25), s * (0.95 + r() * 0.2)), c);
  addCircle(x, z, 0.3 * s, 6);
}

function buildBlock(i, j, t, r) {
  const L = lotRect(i, j), cx = (L.x0 + L.x1) / 2, cz = (L.z0 + L.z1) / 2, W = L.x1 - L.x0;
  const snap = v => Math.max(6, Math.floor(v / 3) * 3);
  if (t === 'D' || t === 'A') {
    // split into 2 or 4 parcels
    const split = r() < 0.5 ? 2 : 4, g = 3;
    const parcels = split === 4 ? [[L.x0, L.z0, cx - g / 2, cz - g / 2], [cx + g / 2, L.z0, L.x1, cz - g / 2], [L.x0, cz + g / 2, cx - g / 2, L.z1], [cx + g / 2, cz + g / 2, L.x1, L.z1]]
      : (r() < 0.5 ? [[L.x0, L.z0, cx - g / 2, L.z1], [cx + g / 2, L.z0, L.x1, L.z1]] : [[L.x0, L.z0, L.x1, cz - g / 2], [L.x0, cz + g / 2, L.x1, L.z1]]);
    const dist = Math.hypot(cx, cz) / HALF;
    for (const [a0, b0, a1, b1] of parcels) {
      const w = snap(a1 - a0 - 1), d = snap(b1 - b0 - 1);
      const px = (a0 + a1) / 2, pz = (b0 + b1) / 2;
      // push towards street edges
      const x0 = (px < cx ? a0 : a1 - w), z0 = (pz < cz ? b0 : b1 - d);
      let floors, fac;
      if (t === 'D') { floors = Math.round(lerp(14, 5, dist) + r() * 8); fac = pick([0, 1, 5, 0, 1, 4]); }
      else { floors = 3 + (r() * 5 | 0); fac = pick([2, 3, 4, 2]); }
      const shops = [];
      if (x0 <= L.x0 + 0.1) shops.push('w'); if (x0 + w >= L.x1 - 0.1) shops.push('e'); if (z0 <= L.z0 + 0.1) shops.push('n'); if (z0 + d >= L.z1 - 0.1) shops.push('s');
      building(x0, z0, x0 + w, z0 + d, floors * 3.5, fac, { shops: r() < 0.75 ? shops : [] });
    }
  } else if (t === 'R' || t === 'H') {
    // 4 houses with block walls
    const q = [[L.x0, L.z0, cx, cz], [cx, L.z0, L.x1, cz], [L.x0, cz, cx, L.z1], [cx, cz, L.x1, L.z1]];
    q.forEach(([a0, b0, a1, b1], k) => {
      const hx = (a0 + a1) / 2, hz = (b0 + b1) / 2;
      const isHome = t === 'H' && k === 3;
      // gate faces the street side
      const gx = k % 2 ? a1 : a0, gz = k < 2 ? b0 : b1;
      wallFence(a0 + 0.4, b0 + 0.4, a1 - 0.4, b1 - 0.4, 1.2, isHome ? 0xe0d6c0 : null, [['z', hx, 4.5, gz + (k < 2 ? 0.4 : -0.4)]]);
      house(hx, hz + (k < 2 ? 2 : -2), 11 + r() * 3, 9 + r() * 2, 0, r);
      // garden tree & car port
      tree(a0 + 3 + r() * 2, k < 2 ? b1 - 3 : b0 + 3, 0.7, r);
      if (isHome) { SPOTS.home = { x: hx, z: gz + 3.2, h: Math.PI }; addSign('ちびっこの おうち', '#f6efe0', '#5a3a2a', hx + 4, CURB + 1.6, gz - 0.25 * (k < 2 ? -1 : 1) + (k < 2 ? 0 : 0.05), k < 2 ? Math.PI : 0, 3, 0.7); }
    });
  } else if (t === 'P') {
    // park: grass, paths, trees, pond, playground bits
    addFlat(MAT.grass, L.x0, L.z0, L.x1, L.z1, CURB + 0.01, 6);
    addFlat(MAT.sand, cx - 2, L.z0, cx + 2, L.z1, CURB + 0.02, 4); addFlat(MAT.sand, L.x0, cz - 2, L.x1, cz + 2, CURB + 0.02, 4);
    if (j === 1) {
      // pond
      const pond = new THREE.Mesh(new THREE.CircleGeometry(9, 40).rotateX(-Math.PI / 2), MAT.pond); pond.position.set(cx + 12, CURB - 0.05, cz - 11); scene.add(pond);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(9, 0.35, 8, 48).rotateX(Math.PI / 2), MAT_SIMPLE(0x9a948a, 0.9)); rim.position.set(cx + 12, CURB + 0.05, cz - 11); rim.receiveShadow = true; scene.add(rim);
      addCircle(cx + 12, cz - 11, 9, 0.6);
      SPOTS.pond = { x: cx + 12, z: cz - 11 };
      // stunt ramp in the park lawn
      ramp(cx - 12, cz + 12, 0, 3.2, 9, 1.8);
      SPOTS.parkLawn = { x: cx - 12, z: cz - 12 };
    } else {
      // fountain
      const fb = new THREE.Mesh(new THREE.CylinderGeometry(4, 4.3, 0.6, 40), MAT_SIMPLE(0xb8b2a6, 0.8)); fb.position.set(cx, CURB + 0.3, cz); fb.castShadow = fb.receiveShadow = true; scene.add(fb);
      const fw = new THREE.Mesh(new THREE.CircleGeometry(3.7, 40).rotateX(-Math.PI / 2), MAT.pond); fw.position.set(cx, CURB + 0.52, cz); scene.add(fw);
      const fc = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 1.6, 16), MAT_SIMPLE(0xc8c2b6, 0.7)); fc.position.set(cx, CURB + 1.1, cz); fc.castShadow = true; scene.add(fc);
      addCircle(cx, cz, 4.3, 0.7);
      SPOTS.fountain = { x: cx, z: cz };
      SPOTS.catLady = { x: cx + 6, z: cz + 9 };
    }
    for (let k = 0; k < 16; k++) { const x = lerp(L.x0 + 3, L.x1 - 3, r()), z = lerp(L.z0 + 3, L.z1 - 3, r()); if (Math.abs(x - cx) > 4 && Math.abs(z - cz) > 4 && (j !== 1 || Math.hypot(x - cx - 12, z - cz + 11) > 11) && (j !== 1 || Math.hypot(x - cx + 12, z - cz - 12) > 7)) tree(x, z, 1.4 + r() * 0.6, r); }
    for (let k = 0; k < 6; k++) instAdd('bench', M(cx + (k % 2 ? 3.2 : -3.2), CURB, L.z0 + 6 + k * 7, k % 2 ? -Math.PI / 2 : Math.PI / 2));
  } else if (t === 'K') {
    // kindergarten: L-shaped 2 storey, playground with fence
    building(L.x0, L.z0, L.x0 + 30, L.z0 + 12, 7.5, 4, { plainRoof: true });
    building(L.x0, L.z0 + 12, L.x0 + 12, L.z0 + 30, 7.5, 4, { plainRoof: true });
    addSign('🌻 ひまわり ようちえん 🌻', '#fff6c8', '#d4572a', L.x0 + 18, CURB + 6.2, L.z0 + 12.25, 0, 10, 1.6);
    // colourful band
    addBoxMesh(MAT.paint, L.x0 + 15, CURB + 3.6, L.z0 + 12.08, 30, 0.35, 0.1, 0, col(0xf2a33a));
    addFlat(MAT.sand, L.x0 + 13, L.z0 + 13, L.x1 - 1, L.z1 - 1, CURB + 0.02, 4);
    playground(L.x0 + 30, L.z0 + 30, r);
    wallFence(L.x0 + 12.5, L.z0 + 12.5, L.x1 - 0.3, L.z1 - 0.3, 1.1, 0xf4d24a, [['z', L.x0 + 30, 5, L.z1 - 0.3]]);
    SPOTS.kinder = { x: L.x0 + 30, z: L.z1 + 2.5 };
    SPOTS.kinderRoad = { x: L.x0 + 30, z: roadC(j + 1) - 3.5 };
  } else if (t === 'F') {
    building(L.x0, L.z0 + 14, L.x1, L.z1, 10.5, 1, {});
    // garage doors facing north (z0 side)
    for (let k = 0; k < 3; k++) { addBoxMesh(MAT.paint, L.x0 + 8 + k * 12, CURB + 2.4, L.z0 + 13.9, 8, 4.6, 0.2, 0, col(0xc8261e)); for (let s = 0; s < 6; s++) addBoxMesh(MAT.paint, L.x0 + 8 + k * 12, CURB + 0.6 + s * 0.75, L.z0 + 13.78, 7.8, 0.06, 0.06, 0, col(0x8a1a14)); }
    addSign('しょうぼうしょ', '#c8261e', '#fff', (L.x0 + L.x1) / 2, CURB + 6.3, L.z0 + 13.85, Math.PI, 9, 1.4);
    // drill tower
    building(L.x1 - 7, L.z1 - 7, L.x1, L.z1, 22, 1, { plainRoof: true });
    SPOTS.fire = { x: L.x0 + 20, z: L.z0 + 6, h: Math.PI };
  } else if (t === 'S') {
    building(L.x0, L.z0, L.x1 - 16, L.z1, 14, 1, {});
    addSign('けいさつしょ', '#1d3f8a', '#fff', L.x1 - 15.85, CURB + 6, cz, Math.PI / 2, 9, 1.4);
    addBoxMesh(MAT.paint, L.x1 - 15.8, CURB + 3, cz - 4, 0.3, 0.6, 0.6, 0, col(0xe82020));
    SPOTS.police = { x: L.x1 - 7, z: cz, h: Math.PI / 2 };
    PARKING.push({ x: L.x1 - 8, z: L.z0 + 6, h: 0, type: 'police' }, { x: L.x1 - 8, z: L.z1 - 6, h: Math.PI, type: 'police' });
  } else if (t === 'I') {
    building(L.x0, L.z0, cx - 2, L.z1, 17.5, 2, { shops: ['w', 'n'] });
    // ice cream shop pavilion
    building(cx + 4, cz - 6, L.x1, cz + 8, 4.2, 4, { plainRoof: true });
    const cone = new THREE.Group();
    const c1 = new THREE.Mesh(new THREE.ConeGeometry(1.1, 3, 20).rotateX(Math.PI), MAT_SIMPLE(0xd9a25a, 0.7)); c1.position.y = 1.5;
    const c2 = new THREE.Mesh(new THREE.SphereGeometry(1.25, 20, 14), MAT_SIMPLE(0xf7b5c8, 0.5)); c2.position.y = 3.2;
    const c3 = new THREE.Mesh(new THREE.SphereGeometry(1.0, 20, 14), MAT_SIMPLE(0xfff2dc, 0.5)); c3.position.y = 4.4;
    cone.add(c1, c2, c3); cone.traverse(o => o.castShadow = true); cone.position.set((cx + 4 + L.x1) / 2, CURB + 4.2, cz + 1); scene.add(cone); WORLD.iceCone = cone;
    addSign('🍦 アイスクリーム 🍦', '#ffd7e4', '#c2185b', cx + 3.9, CURB + 3.2, cz + 1, -Math.PI / 2, 8, 1.3);
    SPOTS.ice = { x: cx + 1, z: L.z1 + 1, h: Math.PI / 2 };
  } else if (t === 'G') {
    // gas station: canopy + pumps, open lot
    addFlat(MAT.concrete, L.x0, L.z0, L.x1, L.z1, CURB + 0.01, 6, col(0xb0aca4));
    const can = [cx - 4, cz + 6];
    addBoxMesh(MAT.paint, can[0], CURB + 5.4, can[1], 22, 0.8, 12, 0, col(0xf2f2f0));
    addBoxMesh(MAT.paint, can[0], CURB + 5.4, can[1] + 6.02, 22, 0.8, 0.05, 0, col(0x1b6fd1));
    addBoxMesh(MAT.paint, can[0], CURB + 5.4, can[1] - 6.02, 22, 0.8, 0.05, 0, col(0x1b6fd1));
    for (const ox of [-7, 0, 7]) { addBoxMesh(MAT.paint, can[0] + ox, CURB + 2.5, can[1], 0.4, 5, 0.4, 0, col(0xeeeeee)); addBox(can[0] + ox - 0.3, can[1] - 0.3, can[0] + ox + 0.3, can[1] + 0.3, 5.5); for (const oz of [-1.6, 1.6]) { addBoxMesh(MAT.paint, can[0] + ox, CURB + 0.85, can[1] + oz, 0.9, 1.7, 0.6, 0, col(0xe3e3e0)); addBoxMesh(MAT.paint, can[0] + ox, CURB + 1.45, can[1] + oz, 0.92, 0.3, 0.62, 0, col(0x1b6fd1)); addBox(can[0] + ox - 0.45, can[1] + oz - 0.3, can[0] + ox + 0.45, can[1] + oz + 0.3, 1.8); } }
    building(L.x1 - 12, L.z0, L.x1, L.z0 + 10, 4.2, 4, { shops: ['w'], plainRoof: true });
    addSign('⛽ ちびっこ ガソリン', '#1b6fd1', '#fff', can[0], CURB + 5.4, can[1] - 6.06, Math.PI, 9, 0.75);
    SPOTS.gas = { x: cx - 4, z: L.z0 + 3, h: Math.PI };
    PARKING.push({ x: cx - 15, z: cz - 12, h: Math.PI / 2, type: 'sports' });
  } else if (t === 'T') {
    tower(cx, cz);
    addFlat(MAT.grass, L.x0, L.z0, L.x1, L.z1, CURB + 0.01, 6);
    for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; tree(cx + Math.cos(a) * 19, cz + Math.sin(a) * 19, 1.1, r); }
    SPOTS.tower = { x: cx, z: cz };
  } else if (t === 'J') {
    addFlat(MAT.concrete, L.x0, L.z0, L.x1, L.z1, CURB + 0.01, 5, col(0xc4c0b8));
    ramp(cx, cz - 14, 0, 4, 10, 2.4);
    ramp(cx, cz + 14, Math.PI, 4, 10, 2.4);
    ramp(cx - 14, cz, Math.PI / 2, 3.2, 8, 1.6);
    addSign('ジャンプ パーク', '#111', '#ffd23f', L.x1 + 0.2, CURB + 3, cz, Math.PI / 2, 8, 1.4);
    for (let k = 0; k < 14; k++) addProp('cone', cx + 14 + (k % 2) * 3, L.z0 + 4 + k * 3, 0);
    SPOTS.jump = { x: cx, z: cz };
  }
}
function ramp(x, z, h, w, len, top) {
  const r = { x, z, h, w, len, top, base: CURB };
  RAMPS.push(r);
  // wedge mesh
  const shape = new THREE.Shape(); shape.moveTo(-len / 2, 0); shape.lineTo(len / 2, 0); shape.lineTo(len / 2, top); shape.lineTo(-len / 2, 0);
  const g = new THREE.ExtrudeGeometry(shape, { depth: w, bevelEnabled: false }); g.translate(0, 0, -w / 2); g.rotateY(-Math.PI / 2);
  // after rotateY(-90): shape x -> world z(+)? local along axis = +z
  sadd(MAT.paint, g, M(x, CURB, z, h), col(0xf2c230));
  // stripes
  const sg = new THREE.PlaneGeometry(w * 0.98, 0.5);
  const ang = Math.atan2(top, len), L2 = Math.hypot(top, len);
  for (let k = 1; k < 6; k += 2) {
    const t = k / 6, along = -len / 2 + t * len, y = CURB + t * top + 0.02;
    sadd(MAT.paint, sg, M(x + Math.sin(h) * along, y, z + Math.cos(h) * along, h, 1, 1, 1, -Math.PI / 2 + ang), col(0x222222));
  }
  r.L2 = L2;
  return r;
}
function playground(cx, cz, r) {
  // slide
  const g = new THREE.Group();
  const red = MAT_SIMPLE(0xe0442f, 0.5), blue = MAT_SIMPLE(0x2f7de0, 0.5), yel = MAT_SIMPLE(0xf2c230, 0.5), steel = MAT_SIMPLE(0xc0c4c8, 0.3, 0.8);
  const add = (geo, mat, x, y, z, rx, ry, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx || 0, ry || 0, rz || 0); m.castShadow = m.receiveShadow = true; g.add(m); return m; };
  add(new THREE.BoxGeometry(2, 0.15, 2), blue, -8, 2, -6);
  for (const [ox, oz] of [[-.9, -.9], [.9, -.9], [-.9, .9], [.9, .9]]) add(new THREE.CylinderGeometry(0.06, 0.06, 2.4, 8), steel, -8 + ox, 1.2, -6 + oz);
  add(new THREE.BoxGeometry(0.9, 0.08, 4.4), red, -8, 1.05, -2.2, -0.45);
  add(new THREE.BoxGeometry(0.9, 0.08, 2.6), yel, -8, 1.0, -9, 0.75);
  // swings
  for (const ox of [-1.6, 1.6]) add(new THREE.CylinderGeometry(0.07, 0.07, 3, 8), steel, 2 + ox, 1.5, -8, 0, 0, 0.25 * Math.sign(ox));
  add(new THREE.CylinderGeometry(0.07, 0.07, 5.2, 8), steel, 2, 2.9, -8, 0, 0, Math.PI / 2);
  for (const ox of [-0.8, 0.8]) { add(new THREE.BoxGeometry(0.6, 0.06, 0.3), red, 2 + ox, 0.55, -8); add(new THREE.CylinderGeometry(0.015, 0.015, 2.3, 4), steel, 2 + ox - 0.25, 1.7, -8); add(new THREE.CylinderGeometry(0.015, 0.015, 2.3, 4), steel, 2 + ox + 0.25, 1.7, -8); }
  // jungle gym
  for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) { add(new THREE.CylinderGeometry(0.04, 0.04, 2.4, 6), yel, -2 + a * 1.2, 1.2, 0 + b * 1.2); }
  for (let y = 0.6; y < 2.5; y += 0.6) { for (let a = 0; a < 3; a++) add(new THREE.CylinderGeometry(0.035, 0.035, 2.4, 6), blue, -0.8, y, a * 1.2, Math.PI / 2, 0, Math.PI / 2 * 0); for (let b = 0; b < 3; b++) add(new THREE.CylinderGeometry(0.035, 0.035, 2.4, 6), red, -2 + b * 1.2 - 0, y, 1.2, 0, 0, Math.PI / 2); }
  g.position.set(cx - 6, CURB, cz - 4); scene.add(g);
  addBox(cx - 6 - 9, cz - 4 - 7, cx - 6 - 7, cz - 4 - 5, 2.4);
  addBox(cx - 6 - 2.2, cz - 4 - 0.2, cx - 6 + 0.6, cz - 4 + 2.6, 2.4);
}
function tower(cx, cz) {
  const gb = new GB(), H = 110;
  const red = col(0xd8462a), white = col(0xf2f0ea);
  const levels = 16;
  for (let k = 0; k < levels; k++) {
    const y0 = k / levels * H, y1 = (k + 1) / levels * H, w0 = lerp(9, 1.6, Math.pow(k / levels, 0.75)), w1 = lerp(9, 1.6, Math.pow((k + 1) / levels, 0.75));
    const c = k % 2 ? white : red;
    for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      const a = new V3(sx * w0, y0, sz * w0), b = new V3(sx * w1, y1, sz * w1), len = a.distanceTo(b);
      const m = new THREE.Matrix4().lookAt(a, b, new V3(0, 1, 0)); const q = new THREE.Quaternion().setFromRotationMatrix(m);
      const mid = a.clone().add(b).multiplyScalar(0.5);
      gb.add(new THREE.BoxGeometry(0.5, 0.5, len), new THREE.Matrix4().compose(mid, q, new V3(1, 1, 1)), c);
    }
    // ring + braces
    for (let s = 0; s < 4; s++) {
      const ang = s * Math.PI / 2, w = w1;
      gb.add(UNIT_BOX, M(Math.sin(ang) * w, y1, Math.cos(ang) * w, ang, w * 2, 0.3, 0.3), c);
      const bl = Math.hypot(w0 + w1, y1 - y0);
      gb.add(UNIT_BOX, M(Math.sin(ang) * (w0 + w1) / 2, (y0 + y1) / 2, Math.cos(ang) * (w0 + w1) / 2, ang, 0.18, bl, 0.18, 0, Math.atan2(w0 + w1, y1 - y0) * 0.9), c);
      gb.add(UNIT_BOX, M(Math.sin(ang) * (w0 + w1) / 2, (y0 + y1) / 2, Math.cos(ang) * (w0 + w1) / 2, ang, 0.18, bl, 0.18, 0, -Math.atan2(w0 + w1, y1 - y0) * 0.9), c);
    }
  }
  // observation deck
  gb.add(new THREE.CylinderGeometry(4.6, 4.2, 4, 24), M(0, H * 0.42, 0), white);
  gb.add(new THREE.CylinderGeometry(4.65, 4.65, 1.6, 24), M(0, H * 0.42 + 0.4, 0), col(0x30404c));
  gb.add(new THREE.CylinderGeometry(0.25, 0.4, 16, 8), M(0, H + 8, 0), red);
  const mesh = new THREE.Mesh(gb.build(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0.3 }));
  mesh.position.set(cx, CURB, cz); mesh.castShadow = mesh.receiveShadow = true; scene.add(mesh);
  for (const [sx, sz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) addBox(cx + sx * 9 - 1, cz + sz * 9 - 1, cx + sx * 9 + 1, cz + sz * 9 + 1, 20);
}

function sidewalkFurniture(i, j, t, r) {
  const br = blockRect(i, j);
  // utility poles + street lamps along each side, set back 0.6m from curb
  const edges = [
    { a: [br.x0, br.z0], b: [br.x1, br.z0], n: [0, 1] }, { a: [br.x0, br.z1], b: [br.x1, br.z1], n: [0, -1] },
    { a: [br.x0, br.z0], b: [br.x0, br.z1], n: [1, 0] }, { a: [br.x1, br.z0], b: [br.x1, br.z1], n: [-1, 0] }];
  edges.forEach((e, ei) => {
    const len = Math.hypot(e.b[0] - e.a[0], e.b[1] - e.a[1]), dx = (e.b[0] - e.a[0]) / len, dz = (e.b[1] - e.a[1]) / len;
    const facing = Math.atan2(-e.n[0], -e.n[1]); // towards road
    let prev = null;
    for (let s = 7; s < len - 5; s += 13) {
      const x = e.a[0] + dx * s + e.n[0] * 0.65, z = e.a[1] + dz * s + e.n[1] * 0.65;
      const k = Math.round(s / 13);
      if ((k + ei) % 2 === 0) {
        // pole with lamp
        if (t === 'P' || t === 'T') { tree(x + e.n[0] * 0.6, z + e.n[1] * 0.6, 1.3 + r() * 0.3, r); continue; }
        const h = 9.5;
        instAdd('pole', M(x, CURB, z, 0, 1, h, 1));
        instAdd('poleArm', M(x, CURB + h - 0.4, z, facing + Math.PI / 2));
        instAdd('lamp', M(x, CURB + 6, z, facing));
        addCircle(x, z, 0.22, h);
        if (prev && t !== 'D') wires(prev, [x, z], CURB + h - 0.25, facing);
        prev = [x, z];
      } else if (t === 'D' || t === 'A' || t === 'I' || t === 'G') {
        tree(x + e.n[0] * 0.3, z + e.n[1] * 0.3, 1.15 + r() * 0.3, r);
      } else {
        // props on residential side
        const pr = r();
        if (pr < 0.25) addProp('post', x + e.n[0] * 0.4, z + e.n[1] * 0.4, facing);
        else if (pr < 0.5) addProp('hyd', x, z, facing);
        else if (pr < 0.7) addProp('bin', x + e.n[0] * 0.8, z + e.n[1] * 0.8, 0);
      }
    }
    // vending machines and bins at building fronts
    if (t !== 'P' && t !== 'T' && r() < 0.55) {
      const s = 14 + r() * (len - 28), x = e.a[0] + dx * s + e.n[0] * (SW - 0.55), z = e.a[1] + dz * s + e.n[1] * (SW - 0.55);
      instAdd('vend', M(x, CURB, z, facing)); addCircle(x, z, 0.6, 1.9);
      addProp('bin', x + dx * 1.1, z + dz * 1.1, 0);
    }
    if (r() < 0.25 && t !== 'P') { const s = 20 + r() * (len - 40); for (let k = 0; k < 3; k++) addProp('box', e.a[0] + dx * (s + k * 0.7) + e.n[0] * (SW - 0.6), e.a[1] + dz * (s + k * 0.7) + e.n[1] * (SW - 0.6), r()); }
  });
}
const WIRE_PTS = [];
function wires(a, b, y, facing) {
  for (const off of [-0.75, 0, 0.75]) {
    const N = 8;
    for (let k = 0; k < N; k++) {
      const t0 = k / N, t1 = (k + 1) / N;
      const sag = t => -Math.sin(t * Math.PI) * 0.55;
      WIRE_PTS.push(lerp(a[0], b[0], t0) + Math.sin(facing) * off, y + 0.12 + sag(t0), lerp(a[1], b[1], t0) + Math.cos(facing) * off,
        lerp(a[0], b[0], t1) + Math.sin(facing) * off, y + 0.12 + sag(t1), lerp(a[1], b[1], t1) + Math.cos(facing) * off);
    }
  }
}
function flushWires() {
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(WIRE_PTS, 3));
  const l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0x202020, transparent: true, opacity: 0.7 }));
  scene.add(l);
}

function roadMarkings() {
  const W = col(0xeceae4), Y = col(0xe8b830);
  const q = (x, z, w, d, c) => sadd(MAT.mark, PLANE, M(x, 0.012, z, 0, w, d, 1, -Math.PI / 2), c);
  for (let k = 0; k <= NB; k++) for (let s = 0; s < NB; s++) {
    const rc = roadC(k), a = roadC(s) + RW + 5, b = roadC(s + 1) - RW - 5, mid = (a + b) / 2, len = b - a;
    // roads along x (constant z = rc) and along z (constant x = rc)
    for (const along of ['x', 'z']) {
      const put = (o, l, w, c) => along === 'x' ? q(mid + 0, rc + o, l, w, c) : q(rc + o, mid, w, l, c);
      put(-0.13, len, 0.13, Y); put(0.13, len, 0.13, Y);
      put(-6.6, len + 9, 0.16, W); put(6.6, len + 9, 0.16, W);
      for (let t = a + 2; t < b - 2; t += 8) {
        const dm = t + 2.5;
        if (along === 'x') { q(dm, rc - 3.5, 5, 0.13, W); q(dm, rc + 3.5, 5, 0.13, W); }
        else { q(rc - 3.5, dm, 0.13, 5, W); q(rc + 3.5, dm, 0.13, 5, W); }
      }
    }
  }
  // crosswalks & stop lines
  for (let i = 0; i <= NB; i++) for (let j = 0; j <= NB; j++) {
    const x = roadC(i), z = roadC(j);
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ni = i + dx, nj = j + dz; if (ni < 0 || nj < 0 || ni > NB || nj > NB) continue;
      const d0 = RW + 1.2;
      for (let s = -6; s <= 6; s += 1.2) {
        if (dx) q(x + dx * (d0 + 1.5), z + s, 3, 0.55, W); else q(x + s, z + dz * (d0 + 1.5), 0.55, 3, W);
      }
      // stop line on the incoming (left-hand) lanes: incoming traffic travels -d, keeps left
      const sl = d0 + 3.6;
      if (dx) q(x + dx * sl, z + (dx > 0 ? -1 : 1) * -3.5, 0.4, 6.6, W); else q(x + (dz > 0 ? 1 : -1) * -3.5, z + dz * sl, 6.6, 0.4, W);
    }
  }
}
function intersections(r) {
  for (let i = 0; i <= NB; i++) for (let j = 0; j <= NB; j++) {
    const x = roadC(i), z = roadC(j);
    // a signal on each approach, mounted at the far-left corner (Japan)
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const ni = i + dx, nj = j + dz; if (ni < 0 || nj < 0 || ni > NB || nj > NB) continue;
      // traffic from direction (dx,dz) travels (-dx,-dz); it sees the light on the far side
      const tx = -dx, tz = -dz; // travel dir
      const lx = tz, lz = -tx;  // left of travel
      const px = x + tx * (RW + 1.0) + lx * (RW + 1.0), pz = z + tz * (RW + 1.0) + lz * (RW + 1.0);
      if (!onRaised(px, pz)) continue;
      instAdd('tlPole', M(px, CURB, pz, 0, 1, 5.6, 1));
      addCircle(px, pz, 0.18, 6);
      instAdd('tlArm', M(px, CURB + 5.4, pz, Math.atan2(lz, -lx), 3.2, 1, 1));
      const bx = px - lx * 3.0, bz = pz - lz * 3.0, face = Math.atan2(-tx, -tz);
      instAdd('tlBox', M(bx, CURB + 5.4, bz, face));
      const axis = tx ? 'x' : 'z';
      for (let k = 0; k < 3; k++) {
        // left-to-right as seen by the driver: blue, yellow, red
        const off = (1 - k) * 0.4;
        const ox = bx + lx * off - tx * 0.15, oz = bz + lz * off - tz * 0.15;
        const ix = instAdd('tlLamp', M(ox, CURB + 5.4, oz, face), TLOFF);
        TL.lamps.push({ i: ix, axis, k: [0, 1, 2][k] });
      }
    }
  }
}

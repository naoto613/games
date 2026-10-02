// ================================================================ buildings (multi-tile objects)
const BUILD = {};
function roof(p, x, y, w, h, col, colD) {
  p.part(P(x - 2, y + h, x + 4, y, x + w - 4, y, x + w + 1, y + h), col, { ol: shade(col, 0.35), hiT: 0.9, loT: -0.9 });
  for (let yy = y + 3; yy < y + h; yy += 3) for (let xx = x; xx < x + w; xx++) if (((xx + yy) >> 1) % 4 === 0) p.px(xx, yy, colD);
  for (let yy = y + 3; yy < y + h; yy += 3) p.hline(x + 1 - Math.floor((yy - y) / h * 4), x + w - 2 + Math.floor((yy - y) / h * 3), yy, colD);
  p.hline(x - 1, x + w, y + h, shade(col, 0.35));
}
function wallBlock(p, x, y, w, h, col) {
  p.part(R(x, y, w, h), col, { ol: shade(col, 0.4), flat: true });
  p.hline(x, x + w - 1, y + h - 1, shade(col, 0.7));
  p.hline(x, x + w - 1, y, shade(col, 0.8));
}
function windowAt(p, x, y, w = 10, h = 8) {
  p.part(R(x, y, w, h), '#6ab8e8', { ol: '#304060', flat: true });
  p.hline(x, x + w - 1, y + (h >> 1), '#f0f0f0'); for (let yy = y; yy < y + h; yy++) p.px(x + (w >> 1), yy, '#f0f0f0');
  p.px(x + 1, y + 1, '#e0f8ff'); p.px(x + 2, y + 1, '#e0f8ff');
}
function doorAt(p, x, y, col = '#8a5a30') {
  p.part(R(x + 2, y + 1, 12, 15), col, { ol: '#3a2410', flat: true });
  p.rect(x + 4, y + 3, 8, 6, '#3a2a20'); p.px(x + 11, y + 10, '#f0d060');
}
function defBuild(name, w, h, doorDx, draw) {
  const p = new Pix(w * 16, h * 16); draw(p, w * 16, h * 16);
  BUILD[name] = { w, h, doorDx, img: p.canvas() };
}
function buildBuildings() {
  const house = (rc) => (p, W_, H_) => {
    wallBlock(p, 3, 30, W_ - 6, H_ - 30, '#f4ecd8');
    roof(p, 3, 2, W_ - 6, 28, rc, shade(rc, 0.8));
    windowAt(p, 10, 38); windowAt(p, W_ - 21, 38);
    doorAt(p, 32, 48);
  };
  defBuild('house', 5, 4, 2, house('#e04848'));
  defBuild('houseB', 5, 4, 2, house('#4878d8'));
  defBuild('houseG', 5, 4, 2, house('#48a868'));
  defBuild('lab', 7, 4, 3, (p, W_, H_) => {
    wallBlock(p, 2, 28, W_ - 4, H_ - 28, '#e8e8f0');
    roof(p, 2, 4, W_ - 4, 24, '#7888a8', '#5a6888');
    windowAt(p, 10, 36, 14); windowAt(p, 30, 36, 10); windowAt(p, 72, 36, 10); windowAt(p, 88, 36, 14);
    doorAt(p, 48, 48, '#8890a8');
    p.part(R(44, 8, 24, 10), '#ffffff', { ol: '#404858', flat: true }); p.part(E(56, 13, 3), '#48b060');
  });
  defBuild('center', 6, 4, 3, (p, W_, H_) => {
    wallBlock(p, 2, 28, W_ - 4, H_ - 28, '#f8f0f0');
    roof(p, 2, 4, W_ - 4, 24, '#f05878', '#d03858');
    p.part(R(4, 28, W_ - 8, 6), '#f05878', { ol: '#802040', flat: true });
    windowAt(p, 10, 38, 16); windowAt(p, W_ - 26, 38, 16);
    p.part(R(48, 46, 16, 18), '#a8e0f8', { ol: '#304060', flat: true }); p.hline(48, 63, 54, '#d8f0ff'); for (let y = 46; y < 64; y++) p.px(56, y, '#d8f0ff');
    // heart emblem
    p.part(U(E(52, 13, 4), E(60, 13, 4), P(48, 14, 64, 14, 56, 23)), '#ffffff', { ol: '#a02040', flat: true });
    p.part(U(E(53, 13, 2), E(59, 13, 2), P(51, 14, 61, 14, 56, 20)), '#f05878', { noOl: true, flat: true });
  });
  defBuild('mart', 5, 4, 2, (p, W_, H_) => {
    wallBlock(p, 3, 28, W_ - 6, H_ - 28, '#f0f4f8');
    roof(p, 3, 4, W_ - 6, 24, '#4878e0', '#3058b8');
    p.part(R(5, 28, W_ - 10, 6), '#4878e0', { ol: '#203878', flat: true });
    windowAt(p, 8, 38, 14);
    p.part(R(32, 46, 16, 18), '#a8e0f8', { ol: '#304060', flat: true }); p.hline(32, 47, 54, '#d8f0ff'); for (let y = 46; y < 64; y++) p.px(40, y, '#d8f0ff');
    windowAt(p, 56, 38, 14);
    p.part(RR(30, 8, 20, 12, 2), '#ffffff', { ol: '#203878', flat: true });
    p.part(P(35, 12, 45, 12, 44, 18, 36, 18), '#f0a030'); p.line(37, 12, 39, 10, '#704010'); p.line(43, 12, 41, 10, '#704010');
  });
  const gym = (stripe) => (p, W_, H_) => {
    wallBlock(p, 2, 34, W_ - 4, H_ - 34, '#d8dce8');
    roof(p, 2, 4, W_ - 4, 30, '#8890a8', '#6a7088');
    p.part(R(4, 34, W_ - 8, 6), stripe, { ol: shade(stripe, 0.4), flat: true });
    windowAt(p, 10, 46, 18); windowAt(p, W_ - 28, 46, 18);
    p.part(R(48, 62, 16, 18), '#a8e0f8', { ol: '#304060', flat: true }); p.hline(48, 63, 70, '#d8f0ff'); for (let y = 62; y < 80; y++) p.px(56, y, '#d8f0ff');
    p.part(P(56, 8, 59, 15, 66, 15, 60, 20, 63, 27, 56, 23, 49, 27, 52, 20, 46, 15, 53, 15), '#f8d040', { ol: '#806010' });
  };
  defBuild('gymRock', 7, 5, 3, gym('#a07850'));
  defBuild('gymElec', 7, 5, 3, gym('#f0c020'));
  defBuild('gymFire', 7, 5, 3, gym('#f05020'));
  defBuild('cave', 3, 2, 1, (p, W_, H_) => {
    p.part(U(E(24, 22, 24, 18), R(0, 18, 48, 14)), '#8a6a50', { ol: '#3a2818' });
    p.part(U(E(24, 22, 9, 10), R(15, 22, 18, 10)), '#100808', { noOl: true, flat: true });
    p.px(10, 10, '#b09070'); p.px(12, 8, '#b09070'); p.px(36, 9, '#b09070');
  });
  defBuild('ruin', 5, 4, 2, (p, W_, H_) => {
    p.part(P(4, 64, 8, 14, 40, 0, 72, 14, 76, 64), '#b8a078', { ol: '#4a3a24' });
    for (let y = 20; y < 64; y += 8) p.hline(8, 72, y, '#8c7454');
    p.part(U(E(40, 44, 9, 10), R(31, 44, 18, 20)), '#100808', { noOl: true, flat: true });
    p.part(P(40, 14, 46, 22, 40, 30, 34, 22), '#e02040', { ol: '#600010', hi: '#ff90a0' });
  });
  defBuild('league', 9, 6, 4, (p, W_, H_) => {
    wallBlock(p, 4, 40, W_ - 8, H_ - 40, '#f0e8f8');
    roof(p, 4, 6, W_ - 8, 34, '#c02840', '#981830');
    for (let x = 12; x < W_ - 12; x += 22) { p.part(R(x, 44, 8, 50), '#ffffff', { ol: '#8070a0' }); }
    p.part(R(64, 76, 16, 20), '#e8c048', { ol: '#604010', flat: true }); p.rect(66, 78, 12, 16, '#302030');
    p.part(P(72, 8, 76, 18, 86, 18, 78, 24, 82, 34, 72, 28, 62, 34, 66, 24, 58, 18, 68, 18), '#f8d040', { ol: '#806010' });
  });
  defBuild('truck', 4, 3, -1, (p, W_, H_) => {
    p.part(RR(2, 4, 44, 36, 2), '#f0f0f0', { ol: '#505060' });
    p.part(RR(46, 14, 16, 26, 3), '#3870d8', { ol: '#182860' }); p.rect(50, 18, 9, 8, '#a8e0f8');
    p.part(E(14, 42, 5), '#303038'); p.part(E(36, 42, 5), '#303038'); p.part(E(54, 42, 5), '#303038');
    p.part(R(8, 14, 32, 10), '#f08030', { flat: true, ol: '#803010' });
  });
  defBuild('boat', 4, 3, -1, (p, W_, H_) => {
    p.part(P(2, 24, 62, 24, 54, 44, 10, 44), '#f8f8f8', { ol: '#304060' }); p.rect(10, 34, 44, 3, '#e04848');
    p.part(R(20, 10, 20, 14), '#e8e0d0', { ol: '#605040' }); p.rect(24, 14, 4, 4, '#80c8f0'); p.rect(32, 14, 4, 4, '#80c8f0');
  });
  defBuild('statue', 1, 2, -1, (p) => {
    p.part(R(2, 18, 12, 13), '#a8acc0', { ol: '#404458' }); p.part(E(8, 10, 5, 8), '#c8ccdc', { ol: '#404458' }); p.px(6, 6, '#ffffff');
  });
}
buildBuildings();

// ================================================================ title / main
let titleT = 0;
function drawTitle() {
  titleT++;
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#2a0810'); g.addColorStop(0.6, '#801828'); g.addColorStop(1, '#f06030');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  // rays
  ctx.save(); ctx.translate(120, 120);
  for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2 + titleT * 0.003; ctx.fillStyle = i % 2 ? 'rgba(255,200,120,0.07)' : 'rgba(255,120,80,0.05)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 260, a, a + Math.PI / 16); ctx.fill(); }
  ctx.restore();
  // magma ground
  ctx.fillStyle = '#401010'; ctx.beginPath(); ctx.moveTo(0, 140); for (let x = 0; x <= W; x += 10) ctx.lineTo(x, 136 + Math.sin(x * 0.08) * 4); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
  for (let i = 0; i < 18; i++) { const x = (i * 37 + titleT * 0.6) % W, y = H - ((titleT * 0.8 + i * 29) % 70); ctx.fillStyle = i % 2 ? '#ffb040' : '#ff6020'; ctx.fillRect(x, y, 2, 2); }
  // legend
  const pulse = 0.5 + Math.sin(titleT * 0.05) * 0.5;
  ctx.globalAlpha = 0.35 + pulse * 0.3; ctx.fillStyle = '#ff4060'; ctx.beginPath(); ctx.ellipse(120, 112, 56 + pulse * 6, 40 + pulse * 4, 0, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
  const img = monImg(24); ctx.drawImage(img, 120 - 46, 156 - 92 - Math.floor(Math.sin(titleT * 0.04) * 2), 92, 92);
  // logo
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.font = `30px ${FONT}`; ctx.lineJoin = 'round';
  ctx.strokeStyle = '#1a2a6a'; ctx.lineWidth = 6; ctx.strokeText('ふーモン', 120, 8);
  const lg = ctx.createLinearGradient(0, 10, 0, 40); lg.addColorStop(0, '#fff8a0'); lg.addColorStop(1, '#f8b820');
  ctx.fillStyle = lg; ctx.fillText('ふーモン', 120, 8);
  ctx.font = `22px ${FONT}`;
  ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 5; ctx.strokeText('ルビー', 120, 40);
  const rg = ctx.createLinearGradient(0, 40, 0, 62); rg.addColorStop(0, '#ff6080'); rg.addColorStop(1, '#a00828');
  ctx.fillStyle = rg; ctx.fillText('ルビー', 120, 40);
  ctx.restore();
  // gem sparkle
  const sx = 150 + Math.sin(titleT * 0.02) * 4; if ((titleT >> 4) % 3 === 0) { ctx.fillStyle = '#fff'; ctx.fillRect(sx, 44, 1, 5); ctx.fillRect(sx - 2, 46, 5, 1); }
  ctx.fillStyle = 'rgba(40,0,10,0.55)'; ctx.fillRect(56, 63, 128, 13); txt('〜ふーたんと だいちの ルビドン〜', 120, 64, '#ffe0c0', '#401010', 9, 'center');
  if (!TITLE.menu && (titleT >> 5) % 2 === 0) txt(isTouch ? 'A ボタンを おしてね' : 'PRESS START', 120, 146, '#ffffff', '#401010', 10, 'center');
  txt('©FU-TAN ADVANCE', 236, 150, 'rgba(255,255,255,0.4)', null, 6, 'right');
}
const TITLE = { menu: false };
async function titleScreen() {
  MODE = 'title'; TITLE.menu = false;
  AU.bgm('title');
  UI.fade = 1; await fadeIn(30);
  for (; ;) {
    await tick();
    if (btnp('A') || btnp('ST') || IN.tap) break;
  }
  AU.sfx('ok');
  for (; ;) {
    TITLE.menu = true;
    const save = store.get(SAVE_KEY);
    const items = []; if (save) items.push('つづきから'); items.push('はじめから', 'せってい');
    const r = await choose(items, { x: 70, y: 96, w: 100, cancel: false });
    const k = items[r];
    if (k === 'せってい') { await optionsMenu(); continue; }
    if (k === 'はじめから' && save) {
      await say('はじめから あそぶと、 まえの レポートは つぎに レポートを かいた ときに きえちゃうよ。 いい？', { keep: true });
      const ok = await yesno({ y: 76 }); closeMsg(); if (!ok) continue;
    }
    await fadeOut(24);
    TITLE.menu = false;
    if (k === 'つづきから') return loadGame(save);
    return newGame();
  }
}
function resetG() {
  for (const k of Object.keys(G)) delete G[k];
  Object.assign(G, { party: [], box: [], bag: {}, money: 3000, badges: [], flags: {}, seen: {}, caught: {}, repel: 0, center: { map: 'home1', x: 4, y: 4 }, time: 0, steps: 0 });
}
async function newGame() {
  resetG();
  F.pl = null;
  await profIntro();
  loadMap('truck', 3, 2, 'D');
  MODE = 'field';
  F.lock++;
  await fadeIn(30);
  F.lock--;
  await runScript(introTruck);
}
async function loadGame(s) {
  resetG();
  Object.assign(G, s.G);
  F.pl = null;
  loadMap(s.map, s.x, s.y, s.dir);
  MODE = 'field';
  await fadeIn(20);
}

renderFn = () => {
  if (MODE === 'field') drawField();
  else if (MODE === 'title') drawTitle();
  else { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); }
  drawUI();
};
updaters.push(fieldUpdate);

// debug hooks (for testing)
window.__fm = { G, F, MAPS, MON, loadMap, makeMon, setFlag, battle, warp, get MODE() { return MODE; }, get B() { return B; }, get MSG() { return MSG; }, UI };

(async function boot() {
  try { await Promise.race([document.fonts.load(`11px ${FONT}`), new Promise(r => setTimeout(r, 2500))]); } catch (e) { }
  if (DEBUG && /warp=/.test(location.search)) {
    const m = location.search.match(/warp=(\w+),(\d+),(\d+)/);
    resetG(); G.party = [makeMon(1, 30), makeMon(3, 30), makeMon(5, 30)]; G.starter = 1;
    for (const f of ['momHome', 'arrived', 'starter', 'dex', 'truckStop', 'rival1']) setFlag(f);
    G.bag = { ball: 20, potion: 10, shoes: 1 };
    loadMap(m[1], +m[2], +m[3], 'D'); MODE = 'field'; UI.fade = 0;
    return;
  }
  await titleScreen();
})();

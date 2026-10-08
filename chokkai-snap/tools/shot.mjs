// 見た目の確認用スクリーンショット: npx http-server -p 8123 -s . & NODE_PATH=$(npm root -g) node tools/shot.mjs S2 /tmp/s2 ["Pixel 7 landscape"] [x y zoom]
// -a.png = 開始時の俯瞰、-b.png = 指定位置に寄った画面
import { createRequire } from 'node:module';
const { chromium, devices } = createRequire(import.meta.url)('playwright');
const [,, stage, out, dev = 'Pixel 7 landscape', zoomx, zoomy, zoom] = process.argv;
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices[dev] });
const page = await ctx.newPage();
const errs = [];
page.on('pageerror', e => errs.push(String(e)));
page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
await page.goto('http://localhost:8123/?debug&v=' + Date.now());
await page.waitForTimeout(500);
await page.evaluate(id => { game.progress.tutorialDone = true; game.startStage(id); }, stage);
await page.waitForTimeout(4500);
await page.screenshot({ path: out + '-a.png' });
if (zoom) { await page.evaluate(([x, y, z]) => { const r = game.renderer; r.cam.x = +x; r.cam.y = +y; r.cam.zoom = +z; r.clampCam(); }, [zoomx, zoomy, zoom]); await page.waitForTimeout(2500); await page.screenshot({ path: out + '-b.png' }); }
console.log(errs.join('\n') || 'ok');
await browser.close();

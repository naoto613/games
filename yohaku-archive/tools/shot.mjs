// 実ブラウザでの確認用スクリーンショット: node tools/shot.mjs [幅] [高さ] [出力先]
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [w = 390, h = 844, out = 'shot'] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) }, deviceScaleFactor: 2 });
page.on('console', m => { if (m.type() === 'error') console.log('console:', m.text()); });
page.on('pageerror', e => console.log('pageerror:', e.message));
await page.goto('http://127.0.0.1:8765/yohaku-archive/');
await page.waitForTimeout(1200);
await page.screenshot({ path: `${out}-title.png` });
await browser.close();

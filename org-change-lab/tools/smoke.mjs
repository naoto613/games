// 全画面を開いてコンソールエラーがないか確認する（node tools/smoke.mjs [URL]）
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const base = process.argv[2] || 'http://127.0.0.1:8799/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(e.message));
page.on('dialog', (d) => d.accept());
await page.goto(base);
await page.waitForSelector('.hero');
await page.getByRole('button', { name: 'サンプルデータを見る' }).click();
await page.waitForSelector('.initiative-card');
const ids = await page.$$eval('.initiative-card-title a', (as) => as.map((a) => a.getAttribute('href')));
for (const href of ids) {
  for (const tab of ['overview', 'analysis', 'interventions', 'stakeholders', 'execution', 'learning']) {
    await page.goto(base + href + '/' + tab);
    await page.waitForSelector('.tab-body');
    await page.waitForTimeout(50);
  }
}
for (const s of ['knowledge', 'ai', 'data', 'privacy', 'about']) { await page.goto(base + '#/settings/' + s); await page.waitForSelector('.tab-body'); }
await page.goto(base + '#/new'); await page.waitForSelector('form');
console.log(errors.length ? errors.join('\n') : 'no errors');
await browser.close();

// 主要画面のスクリーンショット（node tools/shot.mjs [URL] [出力先] [幅] [高さ]）
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const [base = 'http://127.0.0.1:8799/', out = 'tools/out', w = '1280', hgt = '900'] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(hgt) } });
await page.goto(base);
await page.waitForSelector('.hero');
if (await page.getByRole('button', { name: 'サンプルデータを見る' }).count()) {
  await page.getByRole('button', { name: 'サンプルデータを見る' }).click();
  await page.waitForSelector('.initiative-card');
}
await page.screenshot({ path: `${out}/${w}-home.png`, fullPage: true });
const href = await page.$$eval('.initiative-card-title a', (as) => as.find((a) => a.textContent.includes('CRM')).getAttribute('href'));
for (const tab of ['overview', 'analysis', 'interventions', 'execution']) {
  await page.goto(base + href + '/' + tab);
  await page.waitForSelector('.tab-body');
  await page.waitForTimeout(100);
  await page.screenshot({ path: `${out}/${w}-${tab}.png`, fullPage: true });
}
await browser.close();

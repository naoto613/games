const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const base = process.env.TREASURE_TEST_URL || 'http://127.0.0.1:8765/nijiiro-treasure/';
const artifacts = fs.mkdtempSync(path.join(os.tmpdir(), 'nijiiro-treasure-'));
const key = 'nijiiro-treasure.v1';

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || (fs.existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),
    args: ['--no-sandbox']
  });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const errors = [], failures = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) failures.push(response.url()); });
    await page.goto(base);
    const closeDialog = async (dialog, button) => {
      await Promise.all([
        page.evaluate(id => new Promise(resolve => document.getElementById(id).addEventListener('close', () => resolve(), { once: true })), dialog),
        button ? page.locator(button).tap() : page.keyboard.press('Escape')
      ]);
    };
    assert.equal(await page.locator('.island-card').count(), 3);
    assert.equal(await page.locator('#soundButton').getAttribute('aria-pressed'), 'false');
    await page.screenshot({ path: path.join(artifacts, 'home-phone.png') });
    await page.locator('[data-island="0"]').tap();

    const target = async () => {
      const name = await page.locator('#clue > p').first().innerText();
      return page.getByRole('button', { name: `${name}を しらべる`, exact: true });
    };
    const collectKey = async () => {
      const button = await target();
      await button.tap();
      await page.waitForTimeout(1100);
    };
    // Incorrect guesses encourage and reveal a hint; they never remove progress.
    const correctId = await (await target()).getAttribute('data-spot');
    const wrong = page.locator(`.spot:not([data-spot="${correctId}"]):not(:disabled)`);
    await wrong.first().tap();
    await wrong.first().tap();
    assert.equal(await page.locator('.spot.hinted').count(), 1);
    assert.equal(await page.locator('.key-slot.got').count(), 0);
    await collectKey();
    assert.equal(await page.locator('.key-slot.got').count(), 1);
    // Reload and map navigation preserve a partially completed expedition.
    const clue = await page.locator('#clue > p').first().innerText();
    await page.reload();
    assert.match(await page.locator('[data-island="0"]').innerText(), /つづきから/);
    await page.locator('[data-island="0"]').tap();
    assert.equal(await page.locator('.key-slot.got').count(), 1);
    assert.equal(await page.locator('#clue > p').first().innerText(), clue);
    await page.locator('#mapButton').tap();
    await page.locator('[data-island="0"]').tap();
    assert.equal(await page.locator('.key-slot.got').count(), 1);
    // A hint appears after inactivity, and album pauses the hint timer.
    await page.locator('#albumButton').tap();
    await page.waitForTimeout(13000);
    assert.equal(await page.locator('.spot.hinted').count(), 0);
    await closeDialog('albumDialog', '#albumClose');
    await page.waitForTimeout(13000);
    assert.equal(await page.locator('.spot.hinted').count(), 1);
    await collectKey();
    await page.locator('#hintButton').tap();
    assert.equal(await page.locator('.spot.hinted').count(), 1);
    await collectKey();
    assert.equal(await page.locator('.key-slot.got').count(), 3);
    assert.equal(await page.locator('#chestButton').isVisible(), true);
    await page.reload();
    await page.locator('[data-island="0"]').tap();
    assert.equal(await page.locator('#chestButton').isVisible(), true, 'A ready chest survives a reload');
    await page.locator('#chestButton').tap();
    assert.equal(await page.locator('#rewardDialog').evaluate(el => el.open), true);
    assert.equal(await page.locator('#albumCount').innerText(), '1 / 9');
    await page.screenshot({ path: path.join(artifacts, 'reward-phone.png') });
    console.log('PASS: clues, incorrect guesses, hints, saved progress, first chest.');
    // All 9 rewards are reachable by actual touch, without injecting game progress.
    for (let trip = 1; trip < 9; trip++) {
      await closeDialog('rewardDialog', '#rewardNext');
      await page.waitForFunction(() => !document.getElementById('rewardDialog').open);
      await collectKey(); await collectKey(); await collectKey();
      await page.locator('#chestButton').tap();
      assert.equal(await page.locator('#albumCount').innerText(), `${trip + 1} / 9`);
    }
    console.log('PASS: all 9 treasures collected by touch.');
    assert.match(await page.locator('#rewardText').innerText(), /ぜんぶ みつけた/);
    await closeDialog('rewardDialog');
    await page.waitForFunction(() => !document.getElementById('home').hidden);
    await page.locator('#albumButton').tap();
    assert.equal(await page.locator('.treasure-card:not(.unknown)').count(), 9);
    await page.screenshot({ path: path.join(artifacts, 'album-phone.png') });
    await closeDialog('albumDialog', '#albumClose');
    await page.reload();
    assert.equal(await page.locator('#albumCount').innerText(), '9 / 9');
    // Replay after completion, rapid taps, and opening the album during a key animation.
    await page.locator('[data-island="2"]').tap();
    const button = await target();
    await button.evaluate(el => { el.click(); el.click(); el.click(); });
    await page.locator('#albumButton').tap();
    await closeDialog('albumDialog', '#albumClose');
    assert.equal(await page.locator('.key-slot.got').count(), 1);
    await collectKey(); await collectKey();
    await page.locator('#chestButton').tap();
    assert.equal(await page.locator('#albumCount').innerText(), '9 / 9');
    await closeDialog('rewardDialog', '#rewardHome');
    await page.locator('[data-island="1"]').tap();
    await page.locator('#listenButton').tap();
    assert.equal(await page.locator('#soundButton').getAttribute('aria-pressed'), 'true');
    await page.locator('#soundButton').tap();
    assert.equal(await page.locator('#soundButton').getAttribute('aria-pressed'), 'false');
    // Large non-overlapping search targets and no horizontal overflow on supported layouts.
    for (const [width, height] of [[320, 568], [390, 844], [844, 390], [820, 1180], [1440, 1000]]) {
      await page.setViewportSize({ width, height });
      const layout = await page.evaluate(() => {
        const scene = document.getElementById('scene').getBoundingClientRect();
        const spots = [...document.querySelectorAll('.spot')].map(el => {
          const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, right: r.right, bottom: r.bottom, width: r.width, height: r.height };
        });
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          valid: spots.every(r => r.width >= 48 && r.height >= 48 && r.x >= scene.x && r.right <= scene.right && r.y >= scene.y && r.bottom <= scene.bottom),
          overlap: spots.some((r, i) => spots.slice(i + 1).some(s => r.x < s.right && r.right > s.x && r.y < s.bottom && r.bottom > s.y))
        };
      });
      assert.deepEqual(layout, { overflow: false, valid: true, overlap: false }, `${width} × ${height}`);
      await page.screenshot({ path: path.join(artifacts, `play-${width}.png`), fullPage: true });
    }
    // Keyboard-only users can choose a target and open a chest, and dialogs restore focus.
    const keyboardTarget = await target();
    await keyboardTarget.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(1100);
    assert.equal(await page.locator('.key-slot.got').count(), 1);
    assert.equal(await page.locator('.spot:focus').count(), 1);
    await page.locator('#albumButton').click(); await closeDialog('albumDialog');
    assert.equal(await page.locator('#albumButton:focus').count(), 1);
    // Invalid saved sessions are ignored; valid collection IDs are kept and deduplicated.
    await page.evaluate(key => localStorage.setItem(key, JSON.stringify({ version: 1, collection: [0, 0, 99, '1', 2], session: { island: 50, found: 0 } })), key);
    await page.reload();
    assert.equal(await page.locator('#albumCount').innerText(), '2 / 9');
    await page.locator('[data-island="0"]').click();
    assert.equal(await page.locator('.key-slot.got').count(), 0);
    await page.evaluate(key => localStorage.setItem(key, '{ broken'), key);
    await page.reload();
    assert.equal(await page.locator('#albumCount').innerText(), '0 / 9');
    // A browser denying persistence still permits an entire round.
    const blocked = await context.newPage();
    blocked.on('pageerror', error => errors.push(error.message));
    await blocked.addInitScript(() => {
      Storage.prototype.getItem = () => { throw new DOMException('blocked', 'SecurityError'); };
      Storage.prototype.setItem = () => { throw new DOMException('blocked', 'QuotaExceededError'); };
      window.SpeechSynthesisUtterance = undefined;
      window.AudioContext = undefined;
    });
    await blocked.goto(base);
    await blocked.locator('[data-island="0"]').tap();
    assert.equal(await blocked.locator('#storageNotice').isVisible(), true);
    await blocked.locator('#listenButton').tap();
    for (let i = 0; i < 3; i++) {
      const name = await blocked.locator('#clue > p').first().innerText();
      await blocked.getByRole('button', { name: `${name}を しらべる`, exact: true }).tap();
      await blocked.waitForTimeout(1100);
    }
    await blocked.locator('#chestButton').tap();
    assert.equal(await blocked.locator('#albumCount').innerText(), '1 / 9');
    assert.deepEqual(errors, [], 'No browser errors');
    assert.deepEqual(failures, [], 'No missing assets');
    console.log('PASS: all 9 treasures, replay, hints, touch, keyboard, reload, rapid taps, dialogs, audio fallback, corrupted/blocked storage, 5 responsive layouts.');
    console.log('Screenshots:', artifacts);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

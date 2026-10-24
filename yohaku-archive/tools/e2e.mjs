// 実ブラウザ（Playwright）で序章〜第一章の結末までを通しプレイし、要所のスクリーンショットを撮る
// 使い方: (リポジトリのルートで python3 -m http.server 8765) → node tools/e2e.mjs [出力先ディレクトリ] [幅] [高さ]
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');

const [out = '.', w = '390', h = '844'] = process.argv.slice(2);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) }, deviceScaleFactor: 2 });
page.setDefaultTimeout(6000);
const errors = [];
page.on('pageerror', e => { errors.push(e.message); console.log('pageerror:', e.message); });
page.on('console', m => { if (m.type() === 'error') { errors.push(m.text()); console.log('console:', m.text()); } });
await page.goto('http://127.0.0.1:8765/yohaku-archive/');
await page.waitForTimeout(800);
await page.evaluate(() => { window.GAME_FAST = true; });

let shotN = 0;
const shot = async name => { shotN++; await page.screenshot({ path: `${out}/${String(shotN).padStart(2, '0')}-${name}.png` }); };
const mode = () => page.evaluate(() => document.body.dataset.mode);
const sleep = ms => page.waitForTimeout(ms);

/** 会話・場面・パネルを送って、探索に戻るまで待つ */
async function pump(opts = {}) {
  let idle = 0;
  for (let i = 0; i < 400; i++) {
    if (await page.$('.editor')) return 'editor';
    if (await page.$('.battle') && !(await page.$('.dlg')) && !(await page.$('.overlay'))) return 'battle';
    const dlg = await page.$('.dlg');
    if (dlg) { await dlg.click(); await sleep(40); await dlg.click().catch(() => {}); idle = 0; continue; }
    const ch = await page.$$('.choice .opt:not(.off)');
    if (ch.length) { await ch[opts.choice ?? 0].click(); idle = 0; continue; }
    const sc = await page.$('.scene, .titlecard');
    if (sc) { await sc.click().catch(() => {}); await sleep(120); idle = 0; continue; }
    const pb = await page.$('.overlay .panel-btns button');
    if (pb) { if (opts.panelShot) { await shot(opts.panelShot); opts.panelShot = null; } await pb.click(); idle = 0; continue; }
    if ((await mode()) === 'field') { idle++; if (idle > 3) return 'field'; }
    await sleep(80);
  }
  return 'timeout';
}

async function where() { return page.evaluate(() => ({ map: GAME.s.map, x: GAME.field.x, y: GAME.field.y })); }

/** タップと同じ経路で移動・調べる */
async function go(x, y) {
  for (let tries = 0; tries < 5; tries++) {
    await page.evaluate(([x, y]) => GAME.field.goTo(x, y), [x, y]);
    for (let i = 0; i < 200; i++) {
      await sleep(60);
      const st = await page.evaluate(() => ({ busy: GAME.busy(), moving: GAME.field.moving, path: GAME.field.path.length, pending: !!GAME.field.pending }));
      if (st.busy || (!st.moving && !st.path && !st.pending)) break;
    }
    const r = await pump();
    if (r !== 'battle') return r;
    const enc = await page.evaluate(() => GAME.s.map);
    await fight();
    if ((await page.evaluate(() => GAME.s.map)) !== enc) return 'moved';
  }
  return pump();
}

async function edit(target, op, isNode = false) {
  await page.$eval(isNode ? `[data-node="${target}"] rect` : `[data-link="${target}"] .hit`, e => e.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  await page.click(`.op-btn.${op}`);
  await page.click('.preview button.primary');
  await sleep(200);
}
async function commit(label) {
  const btns = await page.$$('.outcome.ok');
  for (const b of btns) {
    if (!label || (await b.innerText()).includes(label)) { await (await b.$('button')).click(); return; }
  }
  throw new Error('結末が確定できない: ' + label);
}

/** 戦闘を自動で進める（攻撃・回復・必要なら因果編集） */
async function fight(strategy) {
  for (let turn = 0; turn < 60; turn++) {
    if (!(await page.$('.battle'))) return pump();
    const dlg = await page.$('.dlg');
    if (dlg) { await dlg.click(); await sleep(60); continue; }
    const pb = await page.$('.overlay .panel-btns button');
    if (pb) { await pb.click(); await sleep(200); continue; }
    if (strategy) await strategy(turn);
    // 各メンバーの行動
    for (let k = 0; k < 3; k++) {
      const cmd = await page.$('.cmd-row .cmd');
      if (!cmd) break;
      const low = await page.evaluate(() => {
        const m = [...document.querySelectorAll('.b-member.active .bar.hp i')][0];
        return m ? parseFloat(m.style.width) : 100;
      });
      const hasPotion = await page.evaluate(() => (GAME.s.inv.potion ?? 0) + (GAME.s.inv.hipotion ?? 0) > 0);
      if (low < 35 && hasPotion) {
        await page.click('text=道具');
        const it = await page.$('.list-item');
        await it.click();
        const ally = await page.$('.b-member.active.pickable') ?? await page.$('.b-member.pickable');
        if (ally) await ally.click();
      } else {
        const dev = await page.$('.cmd.env:not([disabled])');
        if (dev && strategy?.device) { await dev.click(); const t = await page.$('.b-enemy.pickable'); if (t) await t.click(); }
        else {
          await page.click('.cmd-row .cmd >> text=攻撃');
          const uid = await page.evaluate(() => { const c = [...document.querySelectorAll('.b-enemy.pickable')]; let best = null, hp = 1e9; for (const e of c) { const n = parseInt(e.querySelector('.e-num').textContent); if (n < hp) { hp = n; best = e.dataset.uid; } } return best; });
          if (uid) await page.click(`.b-enemy.pickable[data-uid="${uid}"]`);
        }
      }
      await sleep(60);
    }
    // 解決を待つ
    for (let i = 0; i < 120; i++) {
      await sleep(100);
      if (!(await page.$('.battle')) || (await page.$('.cmd-row .cmd')) || (await page.$('.overlay')) || (await page.$('.dlg'))) break;
    }
  }
  return pump();
}

// ---------- 序章 ----------
const START = process.env.START ?? '';
let st;
if (START !== 'tower') {
await shot('title');
await page.click('text=はじめから');
await sleep(300);
await pump();
await shot('archive-night');
await go(3, 6);
console.log('death record:', await page.evaluate(() => GAME.s.records));
await go(9, 13);
console.log('at', await where());
await shot('town-night');
await go(4, 24);
await go(5, 3);
await go(9, 6);
await go(5, 8);
await go(7, 25);
console.log('flags', await page.evaluate(() => ({ open: GAME.s.flags.corridor_open, q: GAME.s.quests })));
await go(5, 5);
await go(10, 1);
// チュートリアル戦闘
await sleep(400);
st = await pump();
console.log('tutorial:', st);
await shot('battle-tutorial');
if (await page.$('.battle')) {
  await page.click('.edit-btn');
  await sleep(200);
  await shot('battle-editor');
  await edit('e0.L1', 'cut');
  await page.click('text=戦闘に戻る');
  await sleep(200);
  await shot('battle-after-cut');
  await fight();
}
console.log('after tutorial', await where(), await page.evaluate(() => GAME.s.members.seil));
await go(25, 3);
console.log('pos after card go', await where(), await page.evaluate(() => GAME.s.records));
st = await pump();
console.log('card:', st);
if (st === 'editor') {
  await shot('editor-mother');
  await edit('L1', 'connect');
  await page.$eval('[data-link="L2"] .hit', e => e.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  await page.click('.op-btn.connect');
  await shot('editor-preview');
  await page.click('.preview button.primary');
  await sleep(300);
  await commit();
  await pump();
}
console.log('edit done', await page.evaluate(() => ({ f: GAME.s.flags.p_edit_done, rec: GAME.s.records.length })));
// 回廊の主
await go(26, 6);
st = await pump();
console.log('boss:', st);
await shot('battle-shelf');
await fight(async turn => {
  if (turn % 2 === 0) {
    await page.click('.edit-btn');
    await sleep(150);
    await edit('e0.P1', 'cut').catch(() => {});
    await page.click('text=戦闘に戻る');
  }
});
await pump();
await shot('chapter1-start');
console.log('chapter1', await page.evaluate(() => ({ ch: GAME.s.flags.chapter1, lv: GAME.s.members.seil.level, map: GAME.s.map })));

// ---------- 第一章 ----------
await go(7, 11); // 鐘撞き記録
await go(15, 2); // ヘルド
await go(9, 13);
await go(5, 12); // マルタ
await go(11, 13); // オルネ
await go(15, 8); // ガルト
await go(5, 12); // マルタ（煙）
await shot('town-day');
await go(21, 23); // ドラン
st = await pump();
if (st === 'battle') await fight();
await pump();
console.log('party', await page.evaluate(() => GAME.s.party), 'mq1', await page.evaluate(() => GAME.s.quests.mq1));
await go(5, 5);
await go(15, 2); // ヘルド → 仮説
st = await pump();
if (st === 'editor') {
  await shot('editor-hypothesis');
  await edit('w1', 'connect');
  await shot('editor-hypothesis-wrong');
  await edit('w1', 'cut');
  for (const l of ['a1', 'a2', 'a3', 'a4', 'a5', 'a6']) await edit(l, 'connect');
  await commit();
  await pump();
}
console.log('mq1 after hypothesis', await page.evaluate(() => GAME.s.quests.mq1));
await go(9, 13);
await go(16, 8);
await page.evaluate(() => { GAME.field.dir = 0; });
await page.evaluate(() => GAME.field.interactFacing());
st = await pump();
if (st === 'editor') {
  await shot('editor-gate');
  await edit('g3', 'connect');
  await commit();
  await pump();
}
console.log('gate', await page.evaluate(() => GAME.s.flags.gate_open));
// サイド：橋（記録を集めて復元）
await go(26, 16); // ボルド
await go(24, 22); // ハンナ
await go(27, 14);
await page.evaluate(() => { GAME.field.dir = 1; GAME.field.interactFacing(); });
await pump();
await go(5, 5);
await go(15, 2); // ヘルド（崩落記録）
await go(9, 13);
await go(27, 14);
await page.evaluate(() => { GAME.field.dir = 1; GAME.field.interactFacing(); });
st = await pump();
if (st === 'editor') {
  await shot('editor-bridge');
  for (const l of ['b1', 'b2', 'b3']) await edit(l, 'connect');
  await edit('b5', 'cut');
  await commit();
  await pump();
}
console.log('bridge', await page.evaluate(() => ({ b: GAME.s.flags.bridge, keep: GAME.s.world.policy.keep })));
await shot('town-bridge');
} else {
  await page.evaluate(async () => {
    const s = GAME.newGameState();
    Object.assign(s.flags, { p_start: 1, corridor_open: 1, p_tut: 1, p_edit_done: 1, p_shelf: 1, chapter1: 1, hypo_done: 1, gate_open: 1, gate_route: 2, bridge: 1, bridge_keep: 1, sq1s: 1, met_garth: 1, dran_joined: 1 });
    s.records.push('r_death', 'r_dishes', 'r_note', 'r_neighbor', 'r_handwriting', 'r_held_lost', 'r_bell_log', 'r_repair', 'r_diary', 'r_work', 'r_gate_duty', 'r_smoke', 'r_dran_paper');
    s.quests = { mq0: 99, mq1: 99, mq2: 1, sq1: 99 };
    s.world.policy.keep = 1;
    s.party = ['seil'];
    s.map = 'town'; s.x = 16; s.y = 9;
    document.querySelector('.title')?.remove();
    await GAME.startWith(s);
  });
  await page.evaluate(() => { GAME.s.party.push('dran'); GAME.s.members.dran = JSON.parse(JSON.stringify(GAME.s.members.seil)); GAME.s.members.dran.id = 'dran'; GAME.s.members.dran.skills = ['d_smash', 'd_break']; GAME.s.members.dran.equip = { weapon: 'sabre', armor: 'vest', acc: null }; });
}
// 鐘楼へ
await page.evaluate(() => { GAME.s.margin = 8; GAME.s.members.seil.level = 8; GAME.s.members.dran.level = 8; GAME.s.inv.potion = 6; for (const c of GAME.s.party) { GAME.s.members[c].hp = 999; } });
await go(16, 8);
await go(16, 7);
await shot('tower1');
await go(15, 4);
await go(2, 3);
await go(8, 3);
await page.evaluate(() => { GAME.field.dir = 0; GAME.field.interactFacing(); });
st = await pump();
if (st === 'editor') {
  await shot('editor-gear');
  await edit('t3', 'invert');
  await commit();
  await pump();
}
await go(8, 1);
await pump();
await shot('tower2');
await go(3, 1);
await page.evaluate(() => { GAME.s.lens.tower2 = true; });
await go(2, 10);
console.log('signal', await page.evaluate(() => GAME.s.records.includes('r_signal')));
await go(8, 1);
st = await pump();
console.log('king:', st);
await shot('battle-king');
await fight(Object.assign(async turn => {
  if (turn === 0 || turn === 2) {
    await page.click('.edit-btn');
    await sleep(150);
    if (turn === 0) await shot('battle-king-editor');
    const ok = await page.$('[data-link="e0.K2"]');
    if (ok) { await edit('e0.K2', 'cut').catch(() => {}); }
    await page.click('text=戦闘に戻る');
  }
}, { device: true }));
st = await pump();
console.log('after king:', st);
if (st === 'editor') {
  await shot('editor-morning');
  await edit('m1', 'connect');
  await edit('m6', 'connect');
  await edit('m5', 'connect');
  await edit('m3', 'cut');
  await shot('editor-morning-share');
  await commit('合図');
  await pump({ panelShot: 'summary' });
}
await shot('ending');
console.log('result', await page.evaluate(() => ({ done: GAME.s.flags.chapter1_done, end: Object.keys(GAME.s.flags).filter(k => k.startsWith('end_')), world: GAME.s.world, map: GAME.s.map })));
await page.evaluate(() => { void GAME.openMenu(); });
await sleep(300);
await shot('menu-status');
await page.click('.menu-tabs >> text=記録');
await shot('menu-records');
await page.click('.menu-tabs >> text=世界');
await shot('menu-world');
console.log('errors:', errors.length);
await browser.close();

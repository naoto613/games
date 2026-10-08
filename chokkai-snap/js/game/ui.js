// 画面 UI：タイトル / ステージ選択 / 図鑑（28,51,65,94章）/ 設定（96章）/ 結果（50章）/ 一時停止（99章）
// デバッグ：Runtime Inspector（45）/ Condition Debugger（46）/ Event Graph（43）/ イベントブラウザ＋Play Event（44）/ チート（100）
import { esc, fmtTime } from './util.js';
import { Renderer, drawPerson } from './render.js';
import { PROPS } from './props.js';
import { eventGraph, validateStage, solveFor, replay as replayPath } from '../engine/validator.js';
import { ANIMATIONS } from '../engine/animations.js';

const $ = s => document.querySelector(s);
const scr = () => $('#screen');

function show(html, overlay = false) {
  const el = scr();
  el.className = 'screen' + (overlay ? ' overlay' : '');
  el.innerHTML = html;
  el.classList.remove('hidden');
  el.scrollTop = 0;
  return el;
}
export function hideScreen() { scr().classList.add('hidden'); scr().innerHTML = ''; }
const on = (sel, fn) => { const el = scr().querySelector(sel); if (el) el.addEventListener('click', fn); };
const onAll = (sel, fn) => scr().querySelectorAll(sel).forEach(el => el.addEventListener('click', () => fn(el)));

function stageStats(g, id) {
  const st = g.stages[id];
  const total = st.events.length;
  const found = st.events.filter(e => g.progress.eventCollection[e.id]?.discovered).length;
  return { total, found, pct: Math.round(found / total * 100) };
}

export function showTitle(g) {
  const p = g.progress;
  const resume = g.pendingRun;
  const errs = g.contentErrors.length && g.settings.debug ? `<p class="note" style="color:#c33">Content Validator: ${g.contentErrors.length} 件のエラー（コンソール参照）</p>` : '';
  show(`<div class="panel" style="text-align:center;max-width:560px">
    <canvas class="titleart" id="tArt" width="1040" height="520"></canvas>
    <h1>ちょっかいスナップ</h1>
    <p class="lead">見て、撮って、ちょっかい。<br>勝手に暮らす人たちを観察して、気になる物を「画像」に取りこみ、だれかに送ってみよう。思いもよらない出来事が、つぎの出来事を呼ぶ……。</p>
    <div class="grid">
      ${resume ? `<button class="btn blue" id="tResume">▶ つづきから（${esc(g.stages[resume.stageId].title)}）</button>` : ''}
      <button class="btn" id="tPlay">あそぶ</button>
      <div class="grid g2">
        <button class="btn sub" id="tTut">チュートリアル${p.tutorialDone ? ' ✓' : ''}</button>
        <button class="btn sub" id="tGallery">イベント図鑑</button>
      </div>
      <button class="btn sub" id="tSettings">設定</button>
    </div>
    ${errs}
    <p class="note" style="margin-top:14px">スマートフォン／タブレットの Chrome 向け（タッチ操作）。横向き推奨。<br>登場人物・台詞・絵・音はすべてこのゲームのオリジナルです。 v${g.version}</p>
  </div>`);
  drawTitleArt(scr().querySelector('#tArt'));
  on('#tPlay', () => { if (!p.tutorialDone) return showTutorialAsk(g); showStageSelect(g); });
  on('#tTut', () => g.startStage('T0'));
  on('#tGallery', () => showGallery(g, null, () => showTitle(g)));
  on('#tSettings', () => showSettings(g, () => showTitle(g)));
  on('#tResume', () => g.startStage(resume.stageId, { resume }));
}

function showTutorialAsk(g) {
  show(`<div class="panel" style="text-align:center"><h2>はじめてですか？</h2>
    <p class="lead">操作を覚える短いチュートリアル（1〜2分）があります。</p>
    <div class="grid"><button class="btn" id="a1">チュートリアルをやる</button><button class="btn sub" id="a2">いきなりステージへ</button></div></div>`, true);
  on('#a1', () => g.startStage('T0'));
  on('#a2', () => { g.progress.tutorialDone = true; g.saveProgress(); showStageSelect(g); });
}

export function showStageSelect(g) {
  const p = g.progress;
  const cards = g.order.map((id, i) => {
    const st = g.stages[id];
    const unlocked = p.unlockedStages.includes(id) || g.settings.debug;
    const s = stageStats(g, id);
    const cleared = p.completedStages.includes(id);
    return `<button class="stage ${unlocked ? '' : 'locked'}" data-id="${id}" ${unlocked ? '' : 'disabled'}>
      <span class="no">STAGE ${i + 1} ${cleared ? '✓ クリア' : ''}</span>
      <span class="tt">${unlocked ? esc(st.title) : '？？？'}</span>
      <span class="meta">${unlocked ? esc(st.subtitle) + '・' + Math.round(st.timeLimitMs * g.diff.time / 1000) + '秒' : '前のステージをクリアすると遊べる'}</span>
      ${unlocked ? `<span class="meta">発見 ${s.found}/${s.total}　ベスト ${p.bestScores[id] || 0}</span><span class="bar"><i style="width:${s.pct}%"></i></span>` : ''}
    </button>`;
  }).join('');
  show(`<div class="panel"><h2>ステージをえらぶ</h2>
    <p class="lead">むずかしさ：${g.diff.label}（設定で変更）</p>
    <div class="stages">${cards}</div>
    <div class="grid g2" style="margin-top:14px"><button class="btn sub" id="sBack">もどる</button><button class="btn sub" id="sGal">イベント図鑑</button></div></div>`);
  onAll('.stage', el => { if (!el.disabled) showStageIntro(g, el.dataset.id); });
  on('#sBack', () => showTitle(g));
  on('#sGal', () => showGallery(g, null, () => showStageSelect(g)));
}

function showStageIntro(g, id) {
  const st = g.stages[id];
  const s = stageStats(g, id);
  show(`<div class="panel" style="text-align:center">
    <div class="note">STAGE ${g.order.indexOf(id) + 1}・${esc(st.subtitle)}</div>
    <h2 style="font-size:28px;margin:4px 0 8px">${esc(st.title)}</h2>
    <p class="lead">${esc(st.intro)}</p>
    <div class="stats"><span>制限時間</span><span>${fmtTime(st.timeLimitMs * g.diff.time * (g.settings.extendedTimer ? 1.5 : 1))}</span><span>発見したイベント</span><span>${s.found} / ${s.total}</span><span>ベストスコア</span><span>${g.progress.bestScores[id] || 0}</span></div>
    <p class="note">人や物をよく見て、何を撮ってだれに送るか考えよう。<br>ステージの「さいごの出来事」を起こせばクリア。</p>
    <div class="grid"><button class="btn" id="iGo">スタート</button><button class="btn sub" id="iBack">もどる</button></div></div>`, true);
  on('#iGo', () => g.startStage(id));
  on('#iBack', () => showStageSelect(g));
}

export function showPause(g) {
  const running = !g.paused;
  show(`<div class="panel" style="text-align:center"><h2>${running ? 'メニュー（時間は進んでいます）' : '一時停止'}</h2>
    ${g.pauseReason === 'rotate' ? '<p class="note">画面の向きが変わったので止めました</p>' : ''}
    <div class="grid">
      <button class="btn" id="pResume">つづける</button>
      <div class="grid g2"><button class="btn sub" id="pGal">図鑑</button><button class="btn sub" id="pSet">設定</button></div>
      ${g.stage.id === 'T0' ? '' : '<button class="btn sub" id="pRetry">さいしょから</button>'}
      <button class="btn sub" id="pQuit">${g.stage.id === 'T0' ? 'チュートリアルをやめる' : 'ステージ選択へ'}</button>
    </div></div>`, true);
  on('#pResume', () => g.resume());
  on('#pGal', () => showGallery(g, g.stage.id, () => showPause(g)));
  on('#pSet', () => showSettings(g, () => showPause(g)));
  on('#pRetry', () => { const id = g.stage.id; g.saves.clearRun(); g.rt.abort(); g.startStage(id); });
  on('#pQuit', () => { const tut = g.stage.id === 'T0'; g.leaveStage(tut); });
}

// ── 図鑑 ──
export function showGallery(g, stageId, back) {
  const tabs = [...g.order];
  let cur = stageId && tabs.includes(stageId) ? stageId : tabs.find(id => g.progress.unlockedStages.includes(id)) || tabs[0];
  const reveal = g.settings.debug && g._revealAll;
  const render = () => {
    const st = g.stages[cur];
    const unlocked = g.progress.unlockedStages.includes(cur) || g.settings.debug;
    const s = stageStats(g, cur);
    const col = g.progress.eventCollection;
    const routes = Object.entries(st.routes).map(([rid, name]) => {
      const evs = st.events.filter(e => e.routeId === rid);
      const f = evs.filter(e => col[e.id]?.discovered).length;
      return `<div class="row" style="min-height:40px"><span style="font-weight:800">${esc(unlocked ? name : '？？？')}</span><span style="width:45%"><span class="bar"><i style="width:${evs.length ? f / evs.length * 100 : 0}%"></i></span></span><span class="note">${f}/${evs.length}</span></div>`;
    }).join('');
    const items = st.events.map(e => {
      const d = col[e.id]?.discovered || reveal;
      return `<li class="${d ? '' : 'unk'}" data-id="${e.id}"><span class="id">${e.id.split('-')[1]}</span><span class="t">${d ? (col[e.id]?.discovered ? '✓ ' : '👁 ') + esc(e.journalText) : '？？？？'}</span><span class="pt">${d ? e.points + 'pt' : ''}</span></li>`;
    }).join('');
    show(`<div class="panel"><h2>イベント図鑑</h2>
      <div class="tabs">${tabs.map((id, i) => `<button data-tab="${id}" class="${id === cur ? 'on' : ''}">STAGE ${i + 1}</button>`).join('')}</div>
      <h3>${unlocked ? esc(st.title) : '？？？'}　<span class="note">${s.found} / ${s.total} 発見（${s.pct}%）</span></h3>
      <div class="bar" style="margin-bottom:10px"><i style="width:${s.pct}%"></i></div>
      ${routes}
      <h3>イベント</h3>
      <ul class="elist">${items}</ul>
      <p class="note">選ぶと他が起きなくなる出来事もあるので、全部を見るには何度も遊ぼう。</p>
      <button class="btn sub" id="gBack" style="margin-top:10px">もどる</button></div>`);
    onAll('[data-tab]', el => { cur = el.dataset.tab; render(); });
    onAll('.elist li', el => { const id = el.dataset.id; if (g.progress.eventCollection[id]?.discovered || reveal) showGalleryItem(g, cur, id, render); });
    on('#gBack', back);
  };
  render();
}

function showGalleryItem(g, stageId, eventId, back) {
  const st = g.stages[stageId];
  const ev = st.events.find(e => e.id === eventId);
  const c = g.progress.eventCollection[eventId] || {};
  const src = st.actors[ev.sourceId] || st.objects[ev.sourceId];
  const tgt = st.actors[ev.targetId] || st.objects[ev.targetId];
  const speech = ev.speechId ? st.speeches[ev.speechId].text.ja : '……';
  const icon = (ANIMATIONS[ev.animationId] || []).find(x => x.type === 'EMOTE')?.params.icon || '';
  show(`<div class="panel">
    <div class="note">${ev.id}・${{ FLAVOR: 'ちょっとした出来事', CHAIN: '連鎖', PROGRESSION: '物語が進む', BRANCH: '分かれ道', TERMINAL: 'さいごの出来事', TIMEOUT: '時間切れ' }[ev.category]}</div>
    <h2>${esc(ev.journalText)}</h2>
    <div class="stats"><span>画像（Source）</span><span>${esc(src.name)}</span><span>相手（Target）</span><span>${esc(tgt.name)}</span><span>スコア</span><span>${ev.points}</span><span>起こした回数</span><span>${c.completedCount || 0}</span>${c.firstDiscoveredAt ? `<span>はじめて見た日</span><span>${new Date(c.firstDiscoveredAt).toLocaleDateString()}</span>` : ''}</div>
    <div class="preview" id="pv"><canvas width="240" height="240"></canvas><div><div style="font-size:30px">${icon}</div><div class="bub" id="pvb">${esc(speech)}</div></div></div>
    <div class="grid g2" style="margin-top:12px"><button class="btn blue" id="pvPlay">▶ 反応を再生</button><button class="btn sub" id="pvBack">もどる</button></div></div>`, true);
  const cv = scr().querySelector('#pv canvas');
  const draw = () => {
    const ctx = cv.getContext('2d');
    ctx.clearRect(0, 0, 240, 240);
    Renderer.prototype.drawThumbInto.call({ stage: st, rt: null }, ctx, ev.targetId, 120, 120, 220);
    Renderer.prototype.drawThumbInto.call({ stage: st, rt: null }, ctx, ev.sourceId, 40, 40, 70);
  };
  draw();
  on('#pvPlay', () => { const b = scr().querySelector('#pvb'); b.style.animation = 'none'; void b.offsetWidth; b.style.animation = ''; cv.style.animation = 'none'; void cv.offsetWidth; cv.style.animation = 'pop .4s'; g.audio.play('success'); });
  on('#pvBack', back);
}

// ── 設定 ──
export function showSettings(g, back) {
  const s = g.settings;
  const seg = (key, opts) => `<div class="seg" data-key="${key}">${opts.map(([v, l]) => `<button data-v="${v}" class="${String(s[key]) === String(v) ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  const tg = key => `<button class="toggle ${s[key] ? 'on' : ''}" data-toggle="${key}" aria-label="${key}"></button>`;
  const rg = (key, min, max, step) => `<input type="range" data-range="${key}" min="${min}" max="${max}" step="${step}" value="${s[key]}">`;
  show(`<div class="panel"><h2>設定</h2>
    <h3>むずかしさ</h3>
    <div class="row"><label>モード</label>${seg('difficulty', [['EASY', 'やさしい'], ['NORMAL', 'ふつう'], ['CLASSIC', 'クラシック']])}</div>
    <p class="note">やさしい：当たり判定1.5倍・時間+30%・出来事のあと自動で寄る／クラシック：ヒントなし・時間短め・メニュー中も時間が進む</p>
    <div class="row"><label>ヒントの強さ</label>${seg('hintLevel', [[0, 'なし'], [1, '弱'], [2, '中'], [3, '強']])}</div>
    <div class="row"><label>時間延長（+50%）</label>${tg('extendedTimer')}</div>
    <h3>見やすさ・操作</h3>
    <div class="row"><label>字幕サイズ</label>${seg('fontSize', [['S', '小'], ['M', '中'], ['L', '大']])}</div>
    <div class="row"><label>くっきり表示（色覚サポート）</label>${tg('highContrast')}</div>
    <div class="row"><label>動きを減らす</label>${tg('reducedMotion')}</div>
    <div class="row"><label>フラッシュを減らす</label>${tg('reducedFlash')}</div>
    <div class="row"><label>ズーム上限</label>${seg('zoomCap', [[2, '2倍'], [3, '3倍'], [4, '4倍']])}</div>
    <div class="row"><label>長押しで名前を表示</label>${tg('longPress')}</div>
    <div class="row"><label>ダブルタップで寄る</label>${tg('doubleTap')}</div>
    <div class="row"><label>カメラ感度</label>${rg('camSensitivity', 0.5, 2, 0.1)}</div>
    <h3>音</h3>
    <div class="row"><label>BGM</label>${rg('bgm', 0, 1, 0.05)}</div>
    <div class="row"><label>効果音</label>${rg('se', 0, 1, 0.05)}</div>
    <h3>そのほか</h3>
    <div class="row"><label>開発者ツール（デバッグ）</label>${tg('debug')}</div>
    <div class="row"><label>記録を消す</label><button class="btn sub small" id="sReset" style="width:auto">リセット</button></div>
    <button class="btn" id="sBack" style="margin-top:12px">もどる</button></div>`);
  const apply = () => { g.applySettings(); g.saveProgress(); };
  scr().querySelectorAll('.seg').forEach(el => el.querySelectorAll('button').forEach(b => b.addEventListener('click', () => {
    const v = b.dataset.v; const key = el.dataset.key;
    s[key] = isNaN(Number(v)) ? v : Number(v);
    el.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    apply();
  })));
  onAll('[data-toggle]', el => { const k = el.dataset.toggle; s[k] = !s[k]; el.classList.toggle('on', s[k]); apply(); });
  scr().querySelectorAll('[data-range]').forEach(el => el.addEventListener('input', () => { s[el.dataset.range] = Number(el.value); apply(); }));
  on('#sReset', () => {
    if (!confirm('図鑑・スコア・解放状況をすべて消しますか？')) return;
    const settings = { ...s };
    g.progress = { schemaVersion: 3, unlockedStages: ['S1'], completedStages: [], bestScores: {}, eventCollection: {}, tutorialDone: false, settings };
    g.saveProgress(); g.saves.clearRun(); g.pendingRun = null;
    g.toast('記録を消しました');
  });
  on('#sBack', back);
}

// ── 結果画面（50章） ──
export function showResult(g, { result, rt, stage, newly, unlocked, isTut, replay }) {
  const done = stage.events.filter(e => rt.state.completedEvents.has(e.id));
  const timeoutEv = stage.timeoutEventId && rt.state.completedEvents.has(stage.timeoutEventId);
  const missedRoutes = Object.entries(stage.routes).filter(([rid]) => stage.events.some(e => e.routeId === rid && !rt.state.completedEvents.has(e.id) && e.category !== 'TIMEOUT')).map(([, n]) => n);
  const clear = result === 'CLEAR';
  const next = g.order[g.order.indexOf(stage.id) + 1];
  const title = isTut ? 'チュートリアル完了！' : clear ? 'STAGE CLEAR' : 'STAGE ENDED';
  show(`<div class="panel" style="text-align:center">
    <div class="big">${title}</div>
    ${replay ? '<p class="note">（リプレイ）</p>' : ''}
    ${isTut ? '<p class="lead">これで操作はばっちり。本編のステージに挑戦しよう！</p>' : `
    <div class="stats" style="text-align:left">
      <span>Score</span><span>${rt.state.score}</span>
      <span>Events</span><span>${done.filter(e => e.category !== 'TIMEOUT').length} / ${stage.events.length}</span>
      <span>New Discoveries</span><span>+${newly.length}</span>
      <span>${clear ? 'TIME（残り）' : 'TIME'}</span><span>${clear ? fmtMs(rt.remainingMs) : '00:00.0'}</span>
    </div>`}
    ${unlocked ? `<p class="lead">🎉 STAGE ${g.order.indexOf(unlocked) + 1}「${esc(g.stages[unlocked].title)}」が遊べるようになった！</p>` : ''}
    ${!isTut ? `<h3 style="text-align:left">EVENT JOURNAL</h3><ul class="elist" style="text-align:left">${done.map(e => `<li><span class="t">${e.category === 'TIMEOUT' ? '⏰' : '✓'} ${esc(e.journalText)}</span><span class="pt">${e.points ? '+' + e.points : ''}</span></li>`).join('') || '<li class="unk">なにも起きなかった……</li>'}</ul>` : ''}
    ${!clear && !isTut ? `<h3 style="text-align:left">今回起きなかったこと</h3><p class="note" style="text-align:left">${missedRoutes.length ? missedRoutes.map(n => '・' + esc(n) + '……まだ何か起きそう').join('<br>') : 'ほとんど見つけた！ あとは最後のひと押し。'}</p>${timeoutEv ? '' : ''}` : ''}
    <div class="grid" style="margin-top:14px">
      ${clear && next && !isTut && g.progress.unlockedStages.includes(next) ? '<button class="btn" id="rNext">つぎのステージへ</button>' : ''}
      ${isTut ? '<button class="btn" id="rSelect">ステージ選択へ</button>' : '<button class="btn ' + (clear ? 'sub' : '') + '" id="rRetry">もういちど</button>'}
      ${!isTut ? '<div class="grid g2"><button class="btn sub" id="rSelect">ステージ選択</button><button class="btn sub" id="rReplay">リプレイを見る</button></div>' : ''}
      ${g.settings.debug && !isTut ? '<button class="btn sub small" id="rLog">操作ログを書き出す（JSON）</button>' : ''}
    </div></div>`);
  on('#rNext', () => { g.leaveStage(); showStageIntro(g, next); });
  on('#rRetry', () => { const id = stage.id; g.leaveStage(); g.startStage(id); });
  on('#rSelect', () => g.leaveStage());
  on('#rReplay', () => { g.leaveStage(); g.startReplay(); });
  on('#rLog', () => exportLog(g));
}
function fmtMs(ms) { const s = ms / 1000; return String(Math.floor(s / 60)).padStart(2, '0') + ':' + (s % 60).toFixed(1).padStart(4, '0'); }

function exportLog(g) {
  const data = g.rt ? { stageId: g.stage.id, seed: g.rt.state.seed, actionLog: g.rt.state.actionLog, journal: g.rt.state.journal } : g.lastRun;
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `actionlog-${data.stageId}-${Date.now()}.json`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// ── デバッグメニュー（100章：スマホでは Debug Menu から選択） ──
export function showDebug(g) {
  const wasPaused = g.paused;
  g.paused = true;
  const r = g.renderer;
  const close = () => { g.paused = wasPaused && g.pauseReason; hideScreen(); g.lastFrame = performance.now(); };
  show(`<div class="panel dbg"><h2>デバッグ</h2>
    <div class="grid g2">
      <button class="btn sub small" data-c="hit">当たり判定 ${r.debug.hitboxes ? 'ON' : 'OFF'}</button>
      <button class="btn sub small" data-c="ids">イベントID ${r.debug.ids ? 'ON' : 'OFF'}</button>
      <button class="btn sub small" data-c="clock">時計 ${g.clockStopped ? '停止中' : '動作中'}</button>
      <button class="btn sub small" data-c="plus">+30 秒</button>
      <button class="btn sub small" data-c="force">次のイベントを強制</button>
      <button class="btn sub small" data-c="vis">全オブジェクト表示</button>
      <button class="btn sub small" data-c="reveal">図鑑を全表示 ${g._revealAll ? 'ON' : 'OFF'}</button>
      <button class="btn sub small" data-c="graph">イベントグラフ</button>
      <button class="btn sub small" data-c="log">操作ログ書き出し</button>
      <button class="btn sub small" data-c="insp">Inspector</button>
      <button class="btn sub small" data-c="events">イベント一覧 / Play Event</button>
      <button class="btn sub small" data-c="validate">Validator</button>
      <button class="btn sub small" data-c="unlock">全ステージ解放</button>
      <button class="btn sub small" data-c="timeout">残り 5 秒にする</button>
    </div>
    <button class="btn" id="dClose" style="margin-top:12px">閉じる</button></div>`, true);
  onAll('[data-c]', el => {
    const c = el.dataset.c, rt = g.rt;
    if (c === 'hit') r.debug.hitboxes = !r.debug.hitboxes;
    if (c === 'ids') r.debug.ids = !r.debug.ids;
    if (c === 'clock' && rt) { g.clockStopped = !g.clockStopped; if (g.clockStopped) { g._limit = rt.state.timeLimitMs; rt.state.timeLimitMs = 1e12; } else rt.state.timeLimitMs = g._limit + rt.state.worldTimeMs - rt.state.worldTimeMs; }
    if (c === 'plus' && rt) rt.state.timeLimitMs += 30000;
    if (c === 'timeout' && rt) rt.state.timeLimitMs = rt.state.worldTimeMs + 5000;
    if (c === 'force' && rt) { const ev = rt.hintCandidate(); if (ev) { rt.forceEvent(ev.id); g.toast('強制: ' + ev.id); } else g.toast('起こせるイベントがない'); }
    if (c === 'vis' && rt) { for (const o of Object.values(rt.state.objects)) if (o.state === 'HIDDEN') o.state = 'VISIBLE'; for (const a of Object.values(rt.state.actors)) a.visible = true; }
    if (c === 'reveal') g._revealAll = !g._revealAll;
    if (c === 'graph') return showGraph(g, () => showDebug(g));
    if (c === 'log') exportLog(g);
    if (c === 'insp') { $('#inspector').classList.toggle('hidden'); return close(); }
    if (c === 'events') return showEventBrowser(g, () => showDebug(g));
    if (c === 'validate') return showValidator(g, () => showDebug(g));
    if (c === 'unlock') { g.progress.unlockedStages = [...g.order]; g.saveProgress(); }
    showDebug(g); g.paused = true;
  });
  on('#dClose', close);
}

export function renderInspector(g) {
  const rt = g.rt;
  if (!rt) return;
  const s = rt.state;
  const lines = [];
  lines.push(`STAGE: ${s.stageId}  STATUS: ${s.status}`);
  lines.push(`TIME: ${(rt.remainingMs / 1000).toFixed(1)}  t=${(s.t / 1000).toFixed(1)}`);
  lines.push(`SCORE: ${s.score}`);
  lines.push(`CAM: ${g.renderer.cam.x.toFixed(0)},${g.renderer.cam.y.toFixed(0)} x${g.renderer.cam.zoom.toFixed(2)}`);
  lines.push('', 'Captured:', '  ' + (s.capturedSourceId || '-'));
  lines.push('', 'Completed:');
  for (const id of s.completedEvents) lines.push('  ✓ ' + id);
  lines.push('', 'Invalidated:');
  for (const id of s.invalidatedEvents) lines.push('  ✗ ' + id);
  lines.push('', 'Flags:');
  for (const [k, v] of Object.entries(s.flags)) lines.push(`  ${k} = ${JSON.stringify(v)}`);
  lines.push('', 'Counters:');
  for (const [k, v] of Object.entries(s.counters)) lines.push(`  ${k} = ${v}`);
  lines.push('', 'Available now:');
  for (const ev of g.stage.events) { const st = rt.eventStatus(ev.id); if (st === 'AVAILABLE' || st === 'ARMED') lines.push(`  ${st === 'ARMED' ? '◎' : '○'} ${ev.id} ${ev.sourceId}→${ev.targetId}`); }
  lines.push('', 'Actors:');
  for (const [k, a] of Object.entries(s.actors)) if (a.visible) lines.push(`  ${k} state=${a.state}${a.path ? ' moving' : ''}`);
  $('#inspector').textContent = lines.join('\n');
}

function treeHtml(nodes) {
  return '<ul style="padding-left:14px;margin:2px 0">' + nodes.map(n => `<li><span class="${n.ok ? 'ok' : 'ng'}">${n.ok ? '✓' : '✗'}</span> ${esc(n.label)}${n.children ? treeHtml(n.children) : ''}</li>`).join('') + '</ul>';
}

function showEventBrowser(g, back) {
  const st = g.stage || g.stages[g.order[0]];
  const rt = g.rt;
  const items = st.events.map(e => {
    const status = rt && rt.stage === st ? rt.eventStatus(e.id) : '-';
    return `<li style="padding:6px 0;border-bottom:1px dashed #ddd"><b class="status-${status}">${e.id}</b> [${status}] ${esc(e.journalText)}<br><span class="note">${e.sourceId} → ${e.targetId} / ${e.category} p${e.priority} ${e.exclusiveGroupId ? 'group=' + e.exclusiveGroupId : ''}</span><br>
      <button class="btn sub small" style="width:auto;display:inline-flex" data-cd="${e.id}">条件</button>
      <button class="btn sub small" style="width:auto;display:inline-flex" data-play="${e.id}">Play Event</button>
      ${rt ? `<button class="btn sub small" style="width:auto;display:inline-flex" data-force="${e.id}">Force</button>` : ''}
      <div data-tree="${e.id}"></div></li>`;
  }).join('');
  show(`<div class="panel dbg"><h2>${st.id} イベント一覧</h2><ul style="padding:0">${items}</ul><button class="btn" id="eBack">もどる</button></div>`, true);
  onAll('[data-cd]', el => {
    const id = el.dataset.cd;
    const box = scr().querySelector(`[data-tree="${id}"]`);
    if (!rt) { box.textContent = 'ステージ中に使えます'; return; }
    const ex = rt.explainEvent(id);
    box.innerHTML = treeHtml(ex.tree) + `<div>Result: <b class="status-${ex.status}">${ex.status === 'AVAILABLE' || ex.status === 'ARMED' ? 'AVAILABLE' : ex.status}</b>${ex.status === 'LOCKED' ? ' Reason: ' + esc(ex.tree.filter(n => !n.ok).map(n => n.label).join(', ') + ' required') : ''}</div>`;
  });
  onAll('[data-play]', el => playEvent(g, el.dataset.play));
  onAll('[data-force]', el => { rt.forceEvent(el.dataset.force); g.paused = false; hideScreen(); });
  on('#eBack', back);
}

// Play Event（44章）：そのイベントに必要な状態へワールドを自動セットして演出を再生
export function playEvent(g, id) {
  const st = g.stage || g.stages[id.split('-')[0]];
  const res = solveFor(st, id, { allowTerminal: true, maxNodes: 4000 });
  if (!res.ok) { g.toast(id + ' へ到達する手順が見つからない'); return; }
  const prep = res.path.slice(0, -1);
  const last = res.path[res.path.length - 1];
  g.startStage(st.id);
  const rt = g.rt;
  const keep = rt.opts.presentDelayMs;
  rt.opts.presentDelayMs = 0;
  replayPath(st, prep, rt);
  rt.opts.presentDelayMs = keep;
  g.renderer.fx = []; g.renderer.bubbles.clear(); g.renderer.reacts.clear();
  if (last && last[0] !== 'WAIT') {
    const p = rt.pos(last[1]);
    if (p) g.renderer.focus(p.x, p.y - 80, 1.4, 0);
    setTimeout(() => { rt.capture(last[0]); g.updateCard(true); setTimeout(() => g.sendTo(last[1]), 500); }, 400);
  }
}

function showValidator(g, back) {
  const out = [];
  for (const id of [...g.order, 'T0']) {
    const st = g.stages[id];
    const { errors, warns } = validateStage(st);
    out.push(`<h3>${id} ${esc(st.title)}（${st.events.length} events）</h3>`);
    out.push(errors.length ? errors.map(e => `<div class="ng">[ERROR] ${esc(e)}</div>`).join('') : '<div class="ok">ERROR なし</div>');
    out.push(warns.map(w => `<div>[WARN] ${esc(w)}</div>`).join(''));
    const c = solveFor(st, st.clearEventId, { allowTerminal: true, maxNodes: 3000 });
    out.push(`<div class="${c.ok ? 'ok' : 'ng'}">終端 ${st.clearEventId}: ${c.ok ? '到達可能（' + c.path.length + '手）' : '到達不能'}</div>`);
  }
  show(`<div class="panel dbg"><h2>Content Validator</h2>${out.join('')}<p class="note">全イベントの到達可能性は node tools/validate.mjs で検査</p><button class="btn" id="vBack">もどる</button></div>`, true);
  on('#vBack', back);
}

// Event Graph（43章）：requires / blocks / invalidates / queues / exclusive を色分けした層状グラフ
function showGraph(g, back) {
  let cur = g.stage ? g.stage.id : g.order[0];
  const render = () => {
    const st = g.stages[cur];
    const { nodes, edges } = eventGraph(st);
    const depth = {};
    const req = id => edges.filter(e => e.to === id && (e.type === 'requires' || e.type === 'requires-any' || e.type === 'queues')).map(e => e.from);
    const dep = (id, seen = new Set()) => { if (depth[id] != null) return depth[id]; if (seen.has(id)) return 0; seen.add(id); const r = req(id); depth[id] = r.length ? 1 + Math.max(...r.map(x => dep(x, seen))) : 0; return depth[id]; };
    nodes.forEach(n => dep(n.id));
    const cols = {};
    nodes.forEach(n => (cols[depth[n.id]] ||= []).push(n));
    const W = 150, H = 46, pos = {};
    let maxRow = 0;
    Object.entries(cols).forEach(([d, list]) => list.forEach((n, i) => { pos[n.id] = { x: 10 + d * (W + 40), y: 10 + i * (H + 12) }; maxRow = Math.max(maxRow, i); }));
    const width = 10 + (Math.max(...Object.keys(cols).map(Number)) + 1) * (W + 40), height = 20 + (maxRow + 1) * (H + 12);
    const color = { requires: '#2a7ac2', 'requires-any': '#7aaee0', blocks: '#c94b4b', invalidates: '#e08a00', queues: '#2f9e6a', exclusive: '#b05fd0' };
    const catColor = { FLAVOR: '#fff', CHAIN: '#e3f2ff', PROGRESSION: '#ffe9f2', BRANCH: '#fff4d6', TERMINAL: '#ffd0d0', TIMEOUT: '#ddd' };
    const col = g.progress.eventCollection;
    const svgEdges = edges.filter(e => pos[e.from] && pos[e.to]).map(e => {
      const a = pos[e.from], b = pos[e.to];
      const x1 = a.x + W, y1 = a.y + H / 2, x2 = b.x, y2 = b.y + H / 2;
      const dash = e.type === 'exclusive' || e.type === 'blocks' ? ' stroke-dasharray="5 4"' : '';
      if (e.type === 'exclusive' || x2 <= x1) return `<path d="M${a.x + W / 2},${a.y + H} C${a.x + W / 2 + 60},${(a.y + b.y) / 2 + H} ${b.x + W / 2 + 60},${(a.y + b.y) / 2} ${b.x + W / 2},${b.y}" fill="none" stroke="${color[e.type]}" stroke-width="1.5"${dash} opacity=".7"/>`;
      return `<path d="M${x1},${y1} C${x1 + 30},${y1} ${x2 - 30},${y2} ${x2},${y2}" fill="none" stroke="${color[e.type]}" stroke-width="1.8"${dash} marker-end="url(#ar)"/>`;
    }).join('');
    const svgNodes = nodes.map(n => { const p = pos[n.id]; const d = col[n.id]?.discovered; return `<g><rect x="${p.x}" y="${p.y}" width="${W}" height="${H}" rx="8" fill="${catColor[n.category]}" stroke="${d ? '#2f9e6a' : '#888'}" stroke-width="${d ? 2.5 : 1}"/><text x="${p.x + 6}" y="${p.y + 16}" font-size="11" font-weight="700">${n.id} ${n.points}pt</text><text x="${p.x + 6}" y="${p.y + 32}" font-size="10">${esc(n.source)}→${esc(n.target)}</text></g>`; }).join('');
    show(`<div class="panel dbg" style="max-width:96vw"><h2>イベントグラフ</h2>
      <div class="tabs">${[...g.order, 'T0'].map(id => `<button data-tab="${id}" class="${id === cur ? 'on' : ''}">${id}</button>`).join('')}</div>
      <div class="note">青=requires 水色=any 赤点線=blocks 橙=invalidates 緑=queues 紫点線=排他グループ／枠が緑=図鑑で発見済み</div>
      <div class="graph"><svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><defs><marker id="ar" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#555"/></marker></defs>${svgEdges}${svgNodes}</svg></div>
      <button class="btn" id="grBack" style="margin-top:10px">もどる</button></div>`, true);
    onAll('[data-tab]', el => { cur = el.dataset.tab; render(); });
    on('#grBack', back);
  };
  render();
}

// タイトルのイラスト（ゲーム内と同じ描画部品で描く）
function drawTitleArt(cv) {
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const g = ctx.createLinearGradient(0, 0, 0, 300);
  g.addColorStop(0, '#5aaee6'); g.addColorStop(1, '#cdeaff');
  ctx.fillStyle = g; ctx.fillRect(0, 0, 1040, 520);
  PROPS.cloud(ctx, 180, 110, 70, {}); PROPS.cloud(ctx, 760, 80, 55, {}); PROPS.sun(ctx, 930, 150, 120, {});
  PROPS.mountain(ctx, 330, 300, 190, { color: '#3d6fa3', wide: 1.3, snow: true }); PROPS.mountain(ctx, 640, 300, 140, { color: '#4f8a5a', wide: 1.4 });
  ctx.fillStyle = '#8fd060'; ctx.fillRect(0, 300, 1040, 220);
  ctx.fillStyle = '#b0b4ba'; ctx.fillRect(0, 380, 1040, 70); ctx.fillStyle = 'rgba(255,255,255,.8)'; for (let x = 20; x < 1040; x += 120) ctx.fillRect(x, 412, 60, 6);
  PROPS.house(ctx, 820, 330, 150, { color: '#fff2dc', roof: '#d8503c' }); PROPS.tree(ctx, 90, 340, 190, {}); PROPS.pine(ctx, 990, 330, 130, {});
  PROPS.car(ctx, 560, 450, 60, { color: '#f2c43a' }); PROPS.bench(ctx, 330, 360, 45, {}); PROPS.lamp(ctx, 690, 380, 120, {});
  PROPS.cat(ctx, 960, 505, 70, { color: '#2a2a2a', stripes: false });
  const people = [
    [200, 500, { hair: 'spiky', hairColor: '#222', shirt: '#3ab0a0', pants: '#2a5ab0', kid: true, h: 170 }, 'RIGHT', 'happy', 'jump'],
    [430, 500, { hair: 'long', hairColor: '#7a3a1a', shirt: '#f2a8c8', pants: '#555', acc: ['ribbon'], h: 210, skirt: true }, 'RIGHT', 'surprised', 'none'],
    [650, 505, { hair: 'short', hairColor: '#2a2a2a', shirt: '#4a6a9a', pants: '#3a3a44', acc: ['glasses', 'camera'], h: 220 }, 'LEFT', 'normal', 'none'],
    [850, 500, { hair: 'bald', hairColor: '#e8e8e8', shirt: '#8a7a5a', pants: '#4a4a3a', acc: ['beard'], old: true, h: 200 }, 'LEFT', 'angry', 'none'],
  ];
  for (const [x, y, L, f, face, body] of people) { ctx.save(); ctx.translate(x, y); ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.beginPath(); ctx.ellipse(0, 0, L.h * 0.2, L.h * 0.05, 0, 0, Math.PI * 2); ctx.fill(); drawPerson(ctx, L, f, face, null, body, 0.5, 2); ctx.restore(); }
  // カメラのフレーム（「撮る」）
  ctx.strokeStyle = '#fff'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  const fx = 560, fy = 150, fw = 160, fh = 120;
  for (const [x, y, dx, dy] of [[fx, fy, 1, 1], [fx + fw, fy, -1, 1], [fx, fy + fh, 1, -1], [fx + fw, fy + fh, -1, -1]]) { ctx.beginPath(); ctx.moveTo(x + dx * 34, y); ctx.lineTo(x, y); ctx.lineTo(x, y + dy * 34); ctx.stroke(); }
}

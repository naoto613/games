/*
 * event-engine.js: 介入の判定・イベントキュー処理（1件ずつ順番に再生）
 */
(function (root) {
  'use strict';
  const OY = (root.OY = root.OY || {});

  const MAX_QUEUE = 20; // キューの上限
  const MAX_STEPS = 50; // 1回の連鎖で処理するイベント数の上限
  const CARD_MIN_MS = 350; // カードを最低限表示する時間（連打による読み飛ばし防止）
  const CARD_MS = 2600; // カードの自動送り時間

  function createEventEngine(opts) {
    const { stage, state, ui } = opts;
    const Rules = OY.Rules;
    const GS = OY.GameState;
    const log = opts.log || ((...a) => console.warn('[おせっかい横丁]', ...a));

    let running = false;
    let gen = 0; // リセットで増える世代番号。古い処理ループを無効化する
    let skipRequested = false;
    let skippable = false;
    const reactionCounts = {}; // 同じリアクションの繰り返し抑制
    const discovered = new Set(); // セッション中に見つけた反応（リトライしても残る）

    /** ポーズ中は進まない待機。端末スリープやタブ切り替えで時間が飛んでも一気に進めない */
    function wait(ms, canSkip) {
      const myGen = gen;
      return new Promise((resolve) => {
        let elapsed = 0;
        let last = performance.now();
        skippable = !!canSkip;
        const timer = setInterval(() => {
          const now = performance.now();
          const dt = Math.min(now - last, 100);
          last = now;
          if (state.screen !== 'paused') elapsed += dt;
          const skipped = canSkip && skipRequested;
          if (myGen !== gen || skipped || elapsed >= ms) {
            clearInterval(timer);
            skippable = false;
            skipRequested = false;
            resolve(myGen === gen);
          }
        }, 40);
      });
    }

    function skip() {
      if (running && skippable && state.screen === 'resolving') skipRequested = true;
    }

    function enqueue(ev) {
      if (!ev) {
        log('イベント定義が見つかりません');
        return false;
      }
      if (ev.once !== false && (state.triggeredEventIds.includes(ev.id) || state.eventQueue.includes(ev.id))) {
        return false; // 重複実行を防ぐ
      }
      if (state.eventQueue.length >= MAX_QUEUE) {
        throw new Error('イベントキューが上限（' + MAX_QUEUE + '）を超えました');
      }
      state.eventQueue.push(ev.id);
      return true;
    }

    async function run() {
      if (running) return;
      running = true;
      const myGen = gen;
      GS.setBaseScreen(state, 'resolving');
      ui.render();
      let steps = 0;
      try {
        while (state.eventQueue.length) {
          if (++steps > MAX_STEPS) throw new Error('連鎖が長すぎるため停止しました');
          const id = state.eventQueue.shift();
          const ev = Rules.getEvent(stage, id);
          if (!ev) {
            log('イベント定義が見つかりません: ' + id);
            continue;
          }
          if (ev.once !== false && state.triggeredEventIds.includes(ev.id)) continue;
          state.triggeredEventIds.push(ev.id);
          if (ev.route) state.route = ev.route;
          GS.applyEffects(state, ev.effects);
          ui.render();
          ui.showEventCard(ev);
          if (!(await wait(CARD_MIN_MS, false))) return;
          if (!(await wait(CARD_MS - CARD_MIN_MS, true))) return;
          ui.hideEventCard();
          if (ev.final) {
            ui.celebrate();
            if (!(await wait(1800, false))) return;
          } else if (!(await wait(180, false))) return;
          const next = Rules.findNextChainEvent(stage, state);
          if (next) enqueue(next);
        }
      } catch (err) {
        log(err);
        state.eventQueue.length = 0;
        ui.hideEventCard();
        ui.warn('うまく進まなかったので、いったん止めました。続けて遊べます。');
      } finally {
        if (myGen === gen) {
          running = false;
          state.eventQueue.length = 0;
          if (Rules.isCleared(state)) {
            GS.setBaseScreen(state, 'cleared');
            ui.render();
            ui.showClear(summary());
          } else {
            GS.setBaseScreen(state, 'playing');
            ui.render();
            ui.afterResolve();
          }
        }
      }
    }

    /** アイテムを対象（住人／場所）に使う */
    function intervene(itemId, targetId) {
      if (!Rules.canAcceptInput(state)) return { ok: false, reason: 'locked' };
      const item = state.items[itemId];
      if (!item || item.used) return { ok: false, reason: 'no-item' };
      state.stats.interventions++;
      state.selectedItemId = null;
      state.selectedTargetId = null;
      const ev = Rules.findInterventionEvent(stage, state, itemId, targetId);
      if (ev) {
        state.stats.missStreak = 0;
        discovered.add(ev.id);
        enqueue(ev);
        run();
        return { ok: true, event: ev };
      }
      const re = Rules.findReaction(stage, state, itemId, targetId);
      const n = reactionCounts[re.id] || 0;
      reactionCounts[re.id] = n + 1;
      let text;
      let repeated = false;
      if (n < re.lines.length) {
        text = re.lines[n];
      } else {
        repeated = true;
        text = re.lines[n % re.lines.length];
      }
      if (re.title) discovered.add(re.id);
      state.stats.reactions++;
      state.stats.missStreak++;
      ui.render();
      ui.showReaction({ reaction: re, text, targetId, itemId, repeated, isNew: n === 0 && !!re.title });
      return { ok: false, reaction: re };
    }

    function summary() {
      const all = Rules.discoverables(stage);
      return {
        route: state.route,
        interventions: state.stats.interventions,
        reactions: state.stats.reactions,
        seconds: Math.round((Date.now() - state.stats.startedAt) / 1000),
        discoveries: all.map((d) => ({ ...d, found: discovered.has(d.id) })),
        foundCount: all.filter((d) => discovered.has(d.id)).length,
        total: all.length
      };
    }

    /** リトライ時：処理中の連鎖を破棄 */
    function reset() {
      gen++;
      running = false;
      skipRequested = false;
      skippable = false;
      Object.keys(reactionCounts).forEach((k) => delete reactionCounts[k]);
    }

    return {
      intervene,
      skip,
      reset,
      summary,
      isRunning: () => running,
      discoveredCount: () => discovered.size,
      _enqueue: enqueue,
      _run: run
    };
  }

  OY.createEventEngine = createEventEngine;
})(typeof window !== 'undefined' ? window : globalThis);

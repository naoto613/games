/*
 * main.js: 初期化・画面遷移の起点
 */
(function (root) {
  'use strict';
  const OY = root.OY;
  const GS = OY.GameState;

  const stage = OY.STAGES.s1;
  const state = GS.create(stage);
  const ui = OY.createRenderer(stage, state);
  const engine = OY.createEventEngine({ stage, state, ui });

  function isInGame() {
    const s = GS.baseScreen(state);
    return s === 'playing' || s === 'resolving';
  }

  function beginPlay() {
    engine.reset();
    GS.reset(state, stage, 'playing');
    state.stats.startedAt = Date.now();
    ui.setPausedVisual(false);
    ui.resetVisuals();
    ui.render();
    ui.layout();
    guardBack();
  }

  function toTitle() {
    engine.reset();
    GS.reset(state, stage, 'title');
    ui.setPausedVisual(false);
    ui.resetVisuals();
    ui.render();
  }

  function pause() {
    if (state.screen !== 'playing' && state.screen !== 'resolving') return;
    state.prevScreen = state.screen;
    state.screen = 'paused';
    ui.closeGoal();
    ui.setPausedVisual(true);
    ui.render();
  }

  function resume() {
    if (state.screen !== 'paused') return;
    state.screen = state.prevScreen || 'playing';
    state.prevScreen = null;
    ui.setPausedVisual(false);
    ui.render();
  }

  const actions = {
    start() {
      state.screen = 'intro';
      ui.renderIntro(0);
      ui.render();
    },
    'intro-next'() {
      const p = ui.introPage();
      if (p < stage.intro.length - 1) ui.renderIntro(p + 1);
      else beginPlay();
    },
    'intro-skip'() {
      beginPlay();
    },
    goal() {
      if (isInGame()) ui.openGoal();
    },
    'close-goal'() {
      ui.closeGoal();
    },
    'more-hint'() {
      ui.moreHint();
    },
    pause,
    resume,
    async retry() {
      if (await ui.confirm('はじめからやり直しますか？\nいまの進みぐあいは消えます。')) beginPlay();
    },
    'retry-now'() {
      beginPlay();
    },
    async 'to-title-confirm'() {
      if (await ui.confirm('タイトルに戻りますか？\nいまの進みぐあいは消えます。')) toTitle();
    },
    'to-title'() {
      toTitle();
    },
    'confirm-yes'() {
      ui.answerConfirm(true);
    },
    'confirm-no'() {
      ui.answerConfirm(false);
    },
    'toggle-msg'() {
      ui.toggleMessage();
    },
    'error-retry'() {
      ui.hideError();
      try {
        beginPlay();
      } catch (e) {
        location.reload();
      }
    },
    'error-reload'() {
      location.reload();
    }
  };

  const input = OY.createInputController({ stage, state, ui, engine, actions });

  /* ブラウザの戻る操作：ゲーム中はポーズ画面を経由させる */
  function guardBack() {
    if (!(history.state && history.state.oy)) {
      try {
        history.pushState({ oy: true }, '');
      } catch (e) {
        /* file:// などで失敗しても遊べる */
      }
    }
  }
  window.addEventListener('popstate', () => {
    if (isInGame() || state.screen === 'paused') {
      pause();
      guardBack();
    }
  });

  /* タブ切り替え・スリープ時は一時停止（イベントの二重実行や読み逃しを防ぐ） */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
  });

  /* 画面サイズ・回転 */
  let raf = 0;
  const relayout = () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(ui.layout);
  };
  window.addEventListener('resize', relayout);
  window.addEventListener('orientationchange', relayout);
  if (window.visualViewport) window.visualViewport.addEventListener('resize', relayout);
  if (window.ResizeObserver) new ResizeObserver(relayout).observe(ui.el.wrap);

  /* 住人のひとりごと（しばらく操作がないとき） */
  setInterval(() => {
    if (!document.hidden && input.idleFor() > 5000) ui.chatter();
  }, 6000);

  /* 例外時：操作不能にならないよう、エラー表示とやり直し手段を出す */
  function onFatal(err) {
    console.error('[おせっかい横丁]', err);
    ui.showError('処理中にエラーが起きました。やり直すと、はじめから遊べます。');
  }
  window.addEventListener('error', (e) => onFatal(e.error || e.message));
  window.addEventListener('unhandledrejection', (e) => onFatal(e.reason));

  ui.render();
  ui.layout();

  // デバッグ・テスト用
  root.game = { stage, state, ui, engine, input, actions };
})(window);

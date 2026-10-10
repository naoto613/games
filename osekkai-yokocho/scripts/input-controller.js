/*
 * input-controller.js: タップ入力・選択状態・操作ロック
 */
(function (root) {
  'use strict';
  const OY = (root.OY = root.OY || {});

  function createInputController({ stage, state, ui, engine, actions }) {
    const Rules = OY.Rules;
    let lastInputAt = 0;

    function selectItem(id) {
      if (!Rules.canAcceptInput(state)) return;
      const it = state.items[id];
      if (!it) return;
      if (it.used) {
        ui.toast(`${it.name}はもう使った`);
        return;
      }
      state.selectedTargetId = null;
      if (state.selectedItemId === id) {
        state.selectedItemId = null;
        ui.render();
        ui.deselectMessage();
        return;
      }
      state.selectedItemId = id;
      ui.render();
      ui.describeItem(id);
    }

    function tapTarget(id, kind) {
      if (!Rules.canAcceptInput(state)) return;
      if (state.selectedItemId) {
        engine.intervene(state.selectedItemId, id);
        ui.render();
        return;
      }
      state.selectedTargetId = id;
      ui.render();
      if (kind === 'character') ui.describeCharacter(id);
      else ui.describeLocation(id);
    }

    function deselect() {
      if (!Rules.canAcceptInput(state)) return;
      if (!state.selectedItemId && !state.selectedTargetId) return;
      const hadItem = !!state.selectedItemId;
      state.selectedItemId = null;
      state.selectedTargetId = null;
      ui.render();
      if (hadItem) ui.deselectMessage();
    }

    function onClick(e) {
      lastInputAt = Date.now();
      const actionEl = e.target.closest('[data-action]');
      if (actionEl) {
        const fn = actions[actionEl.dataset.action];
        if (fn) fn(actionEl);
        return;
      }
      if (e.target.closest('#event-card')) {
        engine.skip();
        return;
      }
      if (state.screen === 'resolving' && e.target.closest('#town, #tray')) {
        engine.skip();
        return;
      }
      const itemEl = e.target.closest('[data-item]');
      if (itemEl) return selectItem(itemEl.dataset.item);
      const charEl = e.target.closest('[data-char]');
      if (charEl) return tapTarget(charEl.dataset.char, 'character');
      const locEl = e.target.closest('[data-loc]');
      if (locEl) return tapTarget(locEl.dataset.loc, 'location');
      if (e.target.closest('#town')) deselect();
    }

    function onKey(e) {
      // SVG の場所（role=button）は Enter / Space でも選べる
      if ((e.key === 'Enter' || e.key === ' ') && e.target.closest && e.target.closest('[data-loc][role=button]')) {
        e.preventDefault();
        onClick({ target: e.target });
        return;
      }
      if (e.key !== 'Escape') return;
      if (!document.getElementById('ov-confirm').hidden) return actions['confirm-no']();
      if (!document.getElementById('ov-goal').hidden) return actions['close-goal']();
      if (state.screen === 'paused') return actions.resume();
      if (state.selectedItemId || state.selectedTargetId) return deselect();
      if (state.screen === 'playing' || state.screen === 'resolving') actions.pause();
    }

    document.getElementById('app').addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);

    return {
      idleFor: () => Date.now() - lastInputAt,
      selectItem,
      tapTarget,
      deselect
    };
  }

  OY.createInputController = createInputController;
})(typeof window !== 'undefined' ? window : globalThis);

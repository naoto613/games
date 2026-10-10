/*
 * game-state.js: 初期状態の生成・状態更新・リセット
 */
(function (root) {
  'use strict';
  const OY = (root.OY = root.OY || {});

  function clone(v) {
    return JSON.parse(JSON.stringify(v));
  }

  function byId(list) {
    const map = {};
    list.forEach((o) => {
      if (map[o.id]) throw new Error('ID が重複しています: ' + o.id);
      map[o.id] = o;
    });
    return map;
  }

  /** ステージ定義から GameState を作る */
  function create(stage) {
    const characters = {};
    stage.characters.forEach((c) => {
      characters[c.id] = {
        id: c.id,
        name: c.name,
        locationId: c.locationId,
        state: c.state,
        goal: c.goal,
        dialogueKey: c.id + ':' + c.state
      };
    });
    const items = {};
    stage.items.forEach((it) => {
      items[it.id] = {
        id: it.id,
        name: it.name,
        locationId: it.locationId,
        used: !!it.used,
        holderId: null,
        icon: it.icon
      };
    });
    const locations = clone(byId(stage.locations));
    byId(stage.characters); // ID 一意性チェック
    byId(stage.items);
    return {
      stageId: stage.id,
      screen: 'title',
      prevScreen: null,
      selectedItemId: null,
      selectedTargetId: null,
      eventQueue: [],
      triggeredEventIds: [],
      characters,
      items,
      locations,
      stageCleared: false,
      route: null,
      stats: { interventions: 0, reactions: 0, missStreak: 0, startedAt: 0 }
    };
  }

  /** 状態を初期化（画面は引数で指定） */
  function reset(state, stage, screen) {
    const fresh = create(stage);
    Object.keys(state).forEach((k) => delete state[k]);
    Object.assign(state, fresh, { screen: screen || 'title' });
    return state;
  }

  /** 効果を1件適用する */
  function applyEffect(state, effect) {
    switch (effect.type) {
      case 'set_character_state': {
        const c = state.characters[effect.characterId];
        if (!c) throw new Error('キャラクターが見つかりません: ' + effect.characterId);
        c.state = effect.state;
        c.dialogueKey = c.id + ':' + c.state;
        break;
      }
      case 'move_character': {
        const c = state.characters[effect.characterId];
        if (!c) throw new Error('キャラクターが見つかりません: ' + effect.characterId);
        if (!state.locations[effect.locationId]) throw new Error('場所が見つかりません: ' + effect.locationId);
        c.locationId = effect.locationId;
        break;
      }
      case 'use_item': {
        const it = state.items[effect.itemId];
        if (!it) throw new Error('アイテムが見つかりません: ' + effect.itemId);
        it.used = true;
        it.holderId = effect.holderId || null;
        if (state.selectedItemId === it.id) state.selectedItemId = null;
        break;
      }
      case 'clear_stage':
        state.stageCleared = true;
        break;
      default:
        throw new Error('未知の効果: ' + effect.type);
    }
  }

  function applyEffects(state, effects) {
    (effects || []).forEach((e) => applyEffect(state, e));
  }

  /** ポーズ中でも「本来の画面」を書き換えられるようにする */
  function setBaseScreen(state, screen) {
    if (state.screen === 'paused') state.prevScreen = screen;
    else state.screen = screen;
  }

  function baseScreen(state) {
    return state.screen === 'paused' ? state.prevScreen : state.screen;
  }

  OY.GameState = { create, reset, applyEffect, applyEffects, setBaseScreen, baseScreen, clone };
})(typeof window !== 'undefined' ? window : globalThis);

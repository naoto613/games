/*
 * game-rules.js: 条件評価・介入可能条件・リアクション選択・クリア判定
 * DOM には触れない（状態とステージ定義だけを見る）。
 */
(function (root) {
  'use strict';
  const OY = (root.OY = root.OY || {});

  /** 条件句1つ（キャラ状態・位置／アイテム使用／イベント発生済み）を評価 */
  function clauseHolds(state, cl) {
    if (cl.event) return state.triggeredEventIds.includes(cl.event);
    if (cl.itemUsed) return !!(state.items[cl.itemUsed] && state.items[cl.itemUsed].used);
    if (cl.characterId) {
      const c = state.characters[cl.characterId];
      if (!c) return false;
      if (cl.state && !cl.state.includes(c.state)) return false;
      if (cl.locationId && c.locationId !== cl.locationId) return false;
      return true;
    }
    return false;
  }

  function allHold(state, list) {
    return (list || []).every((cl) => clauseHolds(state, cl));
  }

  function isTriggered(state, ev) {
    return ev.once !== false && state.triggeredEventIds.includes(ev.id);
  }

  function targetKind(stage, targetId) {
    if (stage.characters.some((c) => c.id === targetId)) return 'character';
    if (stage.locations.some((l) => l.id === targetId)) return 'location';
    return null;
  }

  /** 介入（アイテム→対象）で成立するイベントを探す */
  function findInterventionEvent(stage, state, itemId, targetId) {
    const item = state.items[itemId];
    if (!item || item.used) return null;
    return (
      stage.events.find((ev) => {
        if (ev.kind !== 'intervention' || isTriggered(state, ev)) return false;
        const cond = ev.condition;
        if (cond.itemId !== itemId) return false;
        if (cond.type === 'item_on_character') {
          if (cond.characterId !== targetId) return false;
          const c = state.characters[targetId];
          if (cond.characterState && !cond.characterState.includes(c.state)) return false;
        } else if (cond.type === 'item_on_location') {
          if (cond.locationId !== targetId) return false;
        } else {
          return false;
        }
        return allHold(state, cond.require);
      }) || null
    );
  }

  /** 不成立時のリアクションを探す（見つからなければ汎用） */
  function findReaction(stage, state, itemId, targetId) {
    const kind = targetKind(stage, targetId);
    const found = stage.reactions.find((r) => {
      if (r.itemId !== itemId || r.targetId !== targetId) return false;
      if (r.when && r.when.state && kind === 'character') {
        if (!r.when.state.includes(state.characters[targetId].state)) return false;
      }
      return true;
    });
    if (found) return found;
    const name = kind === 'character' ? state.characters[targetId].name : kind === 'location' ? state.locations[targetId].name : '';
    return {
      id: 'RE-default-' + itemId + '-' + targetId,
      generic: true,
      lines: kind === 'character' ? [name + 'は不思議そうに首をかしげた'] : ['ここでは使い道がなさそうだ']
    };
  }

  /** 次に発生する連鎖イベント（定義順で最初に条件を満たすもの） */
  function findNextChainEvent(stage, state) {
    return (
      stage.events.find(
        (ev) => ev.kind === 'chain' && !isTriggered(state, ev) && ev.condition.type === 'state' && allHold(state, ev.condition.all)
      ) || null
    );
  }

  function getEvent(stage, id) {
    return stage.events.find((e) => e.id === id) || null;
  }

  /** 選択中アイテムを使える（反応が返る）対象。成立する対象は strong に入る */
  function targetsForItem(stage, state, itemId) {
    const item = state.items[itemId];
    const result = { all: [], strong: [] };
    if (!item || item.used) return result;
    stage.characters.forEach((c) => {
      result.all.push(c.id);
      if (findInterventionEvent(stage, state, itemId, c.id)) result.strong.push(c.id);
    });
    stage.locations.forEach((l) => {
      result.all.push(l.id);
      if (findInterventionEvent(stage, state, itemId, l.id)) result.strong.push(l.id);
    });
    return result;
  }

  function canAcceptInput(state) {
    return state.screen === 'playing' && !state.stageCleared;
  }

  function isCleared(state) {
    return state.stageCleared;
  }

  function objectives(stage, state) {
    return stage.objectives.map((o) => ({ text: o.text, done: allHold(state, o.all) }));
  }

  function currentHint(stage, state) {
    return stage.hints.find((h) => allHold(state, h.all)) || null;
  }

  /** 「見つけた反応」の対象一覧（タイトル付きの反応＋介入イベント） */
  function discoverables(stage) {
    const list = [];
    stage.events.filter((e) => e.kind === 'intervention').forEach((e) => list.push({ id: e.id, title: e.title, type: 'event' }));
    stage.reactions.filter((r) => r.title).forEach((r) => list.push({ id: r.id, title: r.title, type: 'reaction' }));
    return list;
  }

  OY.Rules = {
    clauseHolds,
    allHold,
    findInterventionEvent,
    findReaction,
    findNextChainEvent,
    getEvent,
    targetsForItem,
    targetKind,
    canAcceptInput,
    isCleared,
    objectives,
    currentHint,
    discoverables
  };
})(typeof window !== 'undefined' ? window : globalThis);

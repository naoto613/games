// Unit / Event / Graph テスト（61/62/63 章）。実行: node tests/run.mjs
import { evalCondition, evalAll, compileDSL } from '../js/engine/condition.js';
import { normalizeStage } from '../js/engine/content.js';
import { StageRuntime, selectByPriority } from '../js/engine/runtime.js';
import { solveFor, replay, makeSolverRuntime, validateStage } from '../js/engine/validator.js';
import { migrate, SCHEMA_VERSION } from '../js/game/save.js';
import { RAW_STAGES, STAGE_ORDER } from '../js/content/index.js';
import { TUTORIAL } from '../js/content/tutorial.js';

let pass = 0, fail = 0;
const test = (name, fn) => { try { fn(); pass++; console.log('ok   ' + name); } catch (e) { fail++; console.log('FAIL ' + name + '\n     ' + e.message); } };
const eq = (a, b, m = '') => { if (JSON.stringify(a) !== JSON.stringify(b)) throw new Error(`${m} expected ${JSON.stringify(b)} got ${JSON.stringify(a)}`); };
const ok = (v, m = 'assert') => { if (!v) throw new Error(m); };

// ── ConditionEvaluator ──
const ctx = { completed: new Set(['A', 'B']), counters: { c: 3 }, flags: { f: 'x' }, actors: { p: { state: 'HAPPY', visible: true } }, objects: { o: { state: 'HIDDEN' } }, remainingMs: 5000 };
test('条件: eventDone / eventNotDone', () => { ok(evalCondition({ eventDone: 'A' }, ctx)); ok(!evalCondition({ eventDone: 'Z' }, ctx)); ok(evalCondition({ eventNotDone: 'Z' }, ctx)); });
test('条件: any / all / not', () => { ok(evalCondition({ all: [{ eventDone: 'A' }, { any: [{ eventDone: 'Z' }, { eventDone: 'B' }] }] }, ctx)); ok(evalCondition({ not: { eventDone: 'Z' } }, ctx)); });
test('条件: カウンタ・フラグ・状態・時間', () => {
  ok(evalCondition({ countAtLeast: { id: 'c', value: 3 } }, ctx)); ok(!evalCondition({ countAtMost: { id: 'c', value: 2 } }, ctx));
  ok(evalCondition({ flagEquals: { id: 'f', value: 'x' } }, ctx)); ok(evalCondition({ actorStateEquals: { actorId: 'p', value: 'HAPPY' } }, ctx));
  ok(evalCondition({ objectStateEquals: { objectId: 'o', value: 'HIDDEN' } }, ctx)); ok(!evalCondition({ objectVisible: 'o' }, ctx));
  ok(evalCondition({ timeRemainingAtLeastMs: 5000 }, ctx)); ok(!evalCondition({ timeRemainingAtMostMs: 4000 }, ctx));
  ok(evalCondition({ anyEventDone: ['Z', 'A'] }, ctx)); ok(!evalCondition({ allEventsDone: ['A', 'Z'] }, ctx));
});
test('条件: 未知のキーはエラー', () => { let threw = false; try { evalCondition({ foo: 1 }, ctx); } catch { threw = true; } ok(threw); });
test('Condition DSL → JSON', () => {
  eq(compileDSL('DONE(S1-E03) AND NOT DONE(S1-E18) AND COUNT(S1-hotpot-hint) >= 3'),
    { all: [{ eventDone: 'S1-E03' }, { not: { eventDone: 'S1-E18' } }, { countAtLeast: { id: 'S1-hotpot-hint', value: 3 } }] });
  ok(evalAll([compileDSL('DONE(A) OR DONE(Z)')], ctx));
});

// ── EventSelector ──
test('EventSelector: priority → sortOrder で決定的', () => {
  eq(selectByPriority([{ id: 'a', priority: 4, sortOrder: 2 }, { id: 'b', priority: 9, sortOrder: 5 }, { id: 'c', priority: 9, sortOrder: 1 }]).id, 'c');
  eq(selectByPriority([]), null);
});

const mini = () => normalizeStage({
  id: 'X', title: 't', timeLimitMs: 10000, world: { width: 1000, height: 600 }, clearEventId: 'X-E9', timeoutEventId: 'X-E8',
  actors: { a: { name: 'A', x: 100, y: 300 }, b: { name: 'B', x: 300, y: 300 } },
  objects: { o1: { name: 'o1', emoji: '⭐', x: 200, y: 300 }, o2: { name: 'o2', emoji: '⭐', x: 250, y: 300 }, h: { name: 'h', emoji: '⭐', x: 250, y: 300, hidden: true } },
  events: [
    { id: 'X-E1', s: 'o1', t: 'a', cat: 'BRANCH', group: 'g', title: '1', fx: [{ type: 'SPAWN_OBJECT', objectId: 'h' }, { type: 'SET_FLAG', id: 'f', value: 1 }] },
    { id: 'X-E2', s: 'o2', t: 'a', cat: 'BRANCH', group: 'g', title: '2' },
    { id: 'X-E3', s: 'h', t: 'b', cat: 'CHAIN', requires: ['X-E1'], title: '3', fx: [{ type: 'QUEUE_EVENT', eventId: 'X-E4', delayMs: 100 }] },
    { id: 'X-E4', s: 'o1', t: 'b', cat: 'FLAVOR', title: '4' },
    { id: 'X-E5', s: 'o2', t: 'b', cat: 'FLAVOR', triggerCountMin: 3, title: '5' },
    { id: 'X-E8', s: 'o1', t: 'b', cat: 'TIMEOUT', title: 'to' },
    { id: 'X-E9', s: 'o2', t: 'b', cat: 'TERMINAL', requires: ['X-E3'], title: 'end' },
  ],
});
const run = st => { const rt = new StageRuntime(st, { presentDelayMs: 0 }); rt.start(); return rt; };
const act = (rt, s, t) => { rt.capture(s); const r = rt.send(t); rt.flush(); return r; };

test('ExclusiveGroupResolver: 最初の 1 つ以外は INVALIDATED', () => {
  const rt = run(mini());
  eq(act(rt, 'o1', 'a').event.id, 'X-E1');
  ok(rt.state.invalidatedEvents.has('X-E2'));
  eq(act(rt, 'o2', 'a').type, 'NO_EFFECT');
  eq(rt.eventStatus('X-E2'), 'INVALIDATED');
});
test('連鎖：hidden の Source は SPAWN 後に撮れる・QUEUE_EVENT が発生', () => {
  const rt = run(mini());
  eq(rt.capture('h').reason, 'HIDDEN');
  act(rt, 'o1', 'a');
  ok(rt.capture('h').ok);
  rt.send('b'); rt.flush();
  ok(rt.state.completedEvents.has('X-E3')); ok(rt.state.completedEvents.has('X-E4'), 'queued');
  eq(rt.state.flags.f, 1);
});
test('triggerCountMin：3 回目で発生', () => {
  const rt = run(mini());
  eq(act(rt, 'o2', 'b').type, 'NO_EFFECT'); eq(act(rt, 'o2', 'b').type, 'NO_EFFECT');
  eq(act(rt, 'o2', 'b').event.id, 'X-E5');
});
test('ScoreSystem：カテゴリ点・同一イベントは 1 回だけ', () => {
  const rt = run(mini());
  act(rt, 'o1', 'a'); act(rt, 'o1', 'a');
  eq(rt.state.score, 5);
});
test('StageClock：時間切れでタイムアウト終端・通常終端は起きない', () => {
  const rt = run(mini());
  act(rt, 'o1', 'a'); rt.capture('h'); rt.send('b'); rt.flush();
  rt.update(20000); rt.flush();
  ok(rt.state.completedEvents.has('X-E8')); ok(!rt.state.completedEvents.has('X-E9'));
  eq(rt.state.status, 'TIMEOUT');
});
test('誤操作ペナルティ 0.75 秒', () => {
  const rt = run(mini());
  act(rt, 'o2', 'a'); // E2 発生
  const t0 = rt.state.worldTimeMs;
  act(rt, 'o2', 'a');
  eq(rt.state.worldTimeMs - t0, 750);
});
test('serialize / restore（クラッシュ復旧）', () => {
  const rt = run(mini());
  act(rt, 'o1', 'a');
  const snap = rt.serialize();
  const rt2 = run(mini()); rt2.restore(snap);
  ok(rt2.state.completedEvents.has('X-E1')); ok(rt2.state.invalidatedEvents.has('X-E2')); eq(rt2.state.objects.h.state, 'VISIBLE');
});
test('リトライは新しい StageRunState（93章）', () => {
  const rt = run(mini()); act(rt, 'o1', 'a'); rt.reset();
  eq(rt.state.completedEvents.size, 0); eq(rt.state.score, 0);
});
test('決定性：同じ seed・同じ操作で同じ状態（131章）', () => {
  const st = normalizeStage(RAW_STAGES.S1);
  const a = new StageRuntime(st, { seed: 7 }); const b = new StageRuntime(st, { seed: 7 });
  for (const rt of [a, b]) { rt.start(); for (let i = 0; i < 300; i++) rt.update(33); rt.capture('cat'); rt.send('mother'); for (let i = 0; i < 300; i++) rt.update(33); }
  eq(JSON.stringify(a.serialize().actors), JSON.stringify(b.serialize().actors));
});

// ── SaveDataMigrator ──
test('SaveDataMigrator: v1 → v3', () => {
  const m = migrate({ discovered: ['S1-E01'], unlockedStages: ['S1', 'S2'] });
  eq(m.schemaVersion, SCHEMA_VERSION); ok(m.eventCollection['S1-E01'].discovered); ok(m.settings.difficulty);
  eq(migrate(null).unlockedStages, ['S1']);
});

// ── ステージ1 テストケース（62章） ──
const S1 = normalizeStage(RAW_STAGES.S1);
const s1 = () => makeSolverRuntime(S1);
const done = (rt, id) => rt.state.completedEvents.has(id);
test('TC-S1-01 Tissue → Father => E01', () => { const rt = s1(); act(rt, 'tissue', 'father'); ok(done(rt, 'S1-E01')); });
test('TC-S1-02 Stove → Mother before E03 => E17 blocked', () => { const rt = s1(); act(rt, 'knob', 'mother'); ok(!done(rt, 'S1-E17')); });
test('TC-S1-03 Cat → Mother => E03', () => { const rt = s1(); act(rt, 'cat', 'mother'); ok(done(rt, 'S1-E03')); });
test('TC-S1-04 E03 completed → Stove → Mother => E17', () => { const rt = s1(); act(rt, 'cat', 'mother'); act(rt, 'knob', 'mother'); ok(done(rt, 'S1-E17')); });
test('TC-S1-05 E17 + Window => E18', () => { const rt = replay(S1, [['cat', 'mother'], ['knob', 'mother'], ['window', 'father']], s1()); ok(done(rt, 'S1-E18')); });
test('TC-S1-06 E17 + Electric Carpet => E19', () => { const rt = replay(S1, [['cat', 'mother'], ['knob', 'mother'], ['carpet', 'father']], s1()); ok(done(rt, 'S1-E19')); });
test('TC-S1-07 E18 then E19 => E19 blocked', () => { const rt = replay(S1, [['cat', 'mother'], ['knob', 'mother'], ['window', 'father'], ['carpet', 'father']], s1()); ok(!done(rt, 'S1-E19')); ok(rt.state.invalidatedEvents.has('S1-E19')); });
test('TC-S1-08 E18 then Bug → Child => E21', () => { const rt = replay(S1, [['cat', 'mother'], ['knob', 'mother'], ['window', 'father'], ['bug', 'child']], s1()); ok(done(rt, 'S1-E21')); });
test('TC-S1-09 Trigger final while time > 0 => E25', () => {
  const rt = replay(S1, [['cat', 'mother'], ['knob', 'mother'], ['window', 'father'], ['daughter', 'father'], ['daughter', 'mother'], ['daughter', 'child'], ['hotpot', 'daughter'], ['knob', 'mother']], s1());
  ok(done(rt, 'S1-E25')); eq(rt.state.status, 'CLEAR'); ok(!done(rt, 'S1-E24'));
});
test('TC-S1-10 Time reaches 0 before final => E24', () => {
  const rt = new StageRuntime(S1, { presentDelayMs: 0 }); rt.start(); rt.update(S1.timeLimitMs + 10); rt.flush();
  ok(done(rt, 'S1-E24')); eq(rt.state.status, 'TIMEOUT'); ok(!done(rt, 'S1-E25'));
});
test('排他：E20 後は E21/E23 が無効、E22 も無効', () => {
  const rt = replay(S1, [['cat', 'mother'], ['knob', 'mother'], ['window', 'father'], ['bug', 'father']], s1());
  for (const id of ['S1-E21', 'S1-E22', 'S1-E23']) ok(rt.state.invalidatedEvents.has(id), id);
});
test('鍋の味つけは 1 つだけ（S1-SOUP-SEASONING）', () => {
  const rt = replay(S1, [['sugar', 'child'], ['soy', 'father']], s1());
  ok(done(rt, 'S1-E14')); ok(!done(rt, 'S1-E15'));
});

// ── 全ステージ終端テスト（63章）と Graph テスト（61.3） ──
for (const id of [...STAGE_ORDER, 'T0']) {
  const st = normalizeStage(id === 'T0' ? TUTORIAL : RAW_STAGES[id]);
  test(`${id}: Content Validator にエラーがない`, () => { const { errors } = validateStage(st); eq(errors, []); });
  test(`${id}: 終端 ${st.clearEventId} に到達でき CLEAR になる`, () => {
    const r = solveFor(st, st.clearEventId, { allowTerminal: true, maxNodes: 6000 });
    ok(r.ok, 'unreachable');
    const rt = replay(st, r.path);
    eq(rt.state.status, 'CLEAR');
  });
  if (st.timeoutEventId) test(`${id}: 時間切れで ${st.timeoutEventId}`, () => {
    const rt = new StageRuntime(st, { presentDelayMs: 0 }); rt.start(); rt.update(st.timeLimitMs + 10); rt.flush();
    ok(rt.state.completedEvents.has(st.timeoutEventId)); eq(rt.state.status, 'TIMEOUT');
  });
  else test(`${id}: 時間切れでステージ終了（タイムアウト終端なし）`, () => {
    const rt = new StageRuntime(st, { presentDelayMs: 0 }); rt.start(); rt.update(st.timeLimitMs + 10); rt.flush();
    eq(rt.state.status, 'TIMEOUT');
  });
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

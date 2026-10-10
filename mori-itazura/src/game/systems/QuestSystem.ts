// データ駆動のクエスト（設計書 11）。前提条件・目標（トリガー）・効果・報酬・つづきのイベントをデータで定義する。
import type { GameState } from '../core/GameState';
import type { EventBus, GameEvents } from '../core/EventBus';
import { Condition, CondCtx, checkAll } from './Conditions';

export type QuestStatus = 'Locked' | 'Available' | 'Active' | 'Completed' | 'Failed';

export type Trigger =
  | { event: keyof GameEvents; match?: Record<string, string | number | boolean>; count?: number }
  | { have: string; count?: number }
  | { conds: Condition[] };

export interface Objective { text: string; trigger: Trigger; target?: string }

export type WorldEffect =
  | { setFlag: string }
  | { removeItem: string; count?: number }
  | { toast: string };

export type Reward = { money: number } | { item: string; count?: number } | { achievement: string };

export interface QuestDef {
  id: string;
  title: string;
  description: string;
  giver?: string;
  prerequisites: Condition[];
  autoStart?: boolean;
  repeatable?: boolean;
  objectives: Objective[];
  effects: WorldEffect[];
  rewards: Reward[];
  followUpEventIds: string[];
}

export interface QuestHooks {
  addItem: (id: string, n: number, source: string) => void;
  removeItem: (id: string, n: number) => void;
  addMoney: (n: number) => void;
  achieve: (id: string) => void;
}

export class QuestSystem {
  private defs = new Map<string, QuestDef>();
  private busy = false;

  constructor(private state: GameState, private bus: EventBus, defs: QuestDef[], private ctx: () => CondCtx, private hooks: QuestHooks) {
    for (const d of defs) this.defs.set(d.id, d);
    bus.onAny((e) => this.onEvent(e.type, e.payload as Record<string, unknown>));
  }

  get all() { return [...this.defs.values()]; }
  def(id: string) { return this.defs.get(id); }

  status(id: string): QuestStatus {
    const p = this.state.progress;
    if (p.activeQuestIds.includes(id)) return 'Active';
    if (p.completedQuestIds.includes(id) && !this.defs.get(id)?.repeatable) return 'Completed';
    if (this.state.flag('quest_failed_' + id)) return 'Failed';
    const d = this.defs.get(id);
    if (!d) return 'Locked';
    if (p.completedQuestIds.includes(id) && d.repeatable) return checkAll(d.prerequisites, this.ctx()) ? 'Available' : 'Completed';
    return checkAll(d.prerequisites, this.ctx()) ? 'Available' : 'Locked';
  }

  step(id: string) { return this.state.progress.questSteps[id] ?? 0; }

  currentObjective(id: string): Objective | undefined {
    const d = this.defs.get(id);
    return d?.objectives[this.step(id)];
  }

  start(id: string) {
    const d = this.defs.get(id);
    if (!d || this.status(id) !== 'Available') return false;
    const p = this.state.progress;
    p.activeQuestIds.push(id);
    p.questSteps[id] = 0;
    this.state.data.progress.counters['q_' + id] = 0;
    this.bus.emit('quest:started', { questId: id });
    this.bus.emit('toast', { text: `クエスト「${d.title}」`, kind: 'info', icon: 'quest' });
    this.evaluate();
    return true;
  }

  fail(id: string) {
    const p = this.state.progress;
    p.activeQuestIds = p.activeQuestIds.filter((q) => q !== id);
    this.state.setFlag('quest_failed_' + id);
  }

  /** 自動で始まるクエストと、状態で満たされる目標を確認する */
  evaluate() {
    if (this.busy) return;
    this.busy = true;
    try {
      for (let guard = 0; guard < 8; guard++) {
        let changed = false;
        for (const d of this.defs.values()) {
          if (d.autoStart && this.status(d.id) === 'Available' && !this.state.progress.completedQuestIds.includes(d.id)) {
            const p = this.state.progress;
            p.activeQuestIds.push(d.id);
            p.questSteps[d.id] = 0;
            this.bus.emit('quest:started', { questId: d.id });
            changed = true;
          }
        }
        for (const id of [...this.state.progress.activeQuestIds]) {
          const o = this.currentObjective(id);
          if (!o) continue;
          const t = o.trigger;
          let done = false;
          if ('have' in t) done = this.ctx().itemCount(t.have) >= (t.count ?? 1);
          else if ('conds' in t) done = checkAll(t.conds, this.ctx());
          if (done) { this.advance(id); changed = true; }
        }
        if (!changed) break;
      }
    } finally { this.busy = false; }
  }

  private onEvent(type: string, payload: Record<string, unknown>) {
    if (type.startsWith('quest:') || type === 'toast') return;
    for (const id of [...this.state.progress.activeQuestIds]) {
      const o = this.currentObjective(id);
      if (!o || !('event' in o.trigger) || o.trigger.event !== type) continue;
      const m = o.trigger.match;
      if (m && !Object.entries(m).every(([k, v]) => payload?.[k] === v)) continue;
      const key = 'q_' + id;
      const inc = typeof payload?.count === 'number' && type === 'item:obtained' ? (payload.count as number) : 1;
      const n = this.state.addCount(key, inc);
      if (n >= (o.trigger.count ?? 1)) this.advance(id);
      else this.bus.emit('quest:progress', { questId: id });
    }
    this.evaluate();
  }

  private advance(id: string) {
    const d = this.defs.get(id)!;
    const p = this.state.progress;
    p.questSteps[id] = this.step(id) + 1;
    this.state.data.progress.counters['q_' + id] = 0;
    if (p.questSteps[id] >= d.objectives.length) this.complete(id);
    else this.bus.emit('quest:progress', { questId: id });
  }

  private complete(id: string) {
    const d = this.defs.get(id)!;
    const p = this.state.progress;
    p.activeQuestIds = p.activeQuestIds.filter((q) => q !== id);
    if (!p.completedQuestIds.includes(id)) p.completedQuestIds.push(id);
    this.state.addCount('done_' + id);
    for (const e of d.effects) {
      if ('setFlag' in e) this.state.setFlag(e.setFlag);
      else if ('removeItem' in e) this.hooks.removeItem(e.removeItem, e.count ?? 1);
      else if ('toast' in e) this.bus.emit('toast', { text: e.toast });
    }
    for (const r of d.rewards) {
      if ('money' in r) this.hooks.addMoney(r.money);
      else if ('item' in r) this.hooks.addItem(r.item, r.count ?? 1, 'quest');
      else if ('achievement' in r) this.hooks.achieve(r.achievement);
    }
    this.bus.emit('quest:completed', { questId: id });
    for (const f of d.followUpEventIds) {
      const fd = this.defs.get(f);
      if (fd?.autoStart) continue; // evaluate() が始める
    }
  }

  /** HUD に出す「いまの目的」 */
  tracked(): { quest: QuestDef; objective: Objective; progress?: string } | null {
    const act = this.state.progress.activeQuestIds;
    for (let i = act.length - 1; i >= 0; i--) {
      const q = this.defs.get(act[i]);
      const o = q && this.currentObjective(q.id);
      if (q && o) {
        let progress: string | undefined;
        if ('event' in o.trigger && (o.trigger.count ?? 1) > 1) progress = `${this.state.count('q_' + q.id)}/${o.trigger.count}`;
        if ('have' in o.trigger && (o.trigger.count ?? 1) > 1) progress = `${Math.min(this.ctx().itemCount(o.trigger.have), o.trigger.count!)}/${o.trigger.count}`;
        return { quest: q, objective: o, progress };
      }
    }
    return null;
  }
}

// 会話の進行。条件に合う最初のエントリーから始め、選択肢の効果を反映する。
import { DIALOGUE, DialogueEffect, DialogueNode } from '../content/dialogue/dialogue';
import { CondCtx, checkAll } from './Conditions';

export interface DialogueHooks {
  effect(e: DialogueEffect, npcId: string): void;
  close(npcId: string): void;
}

export class DialogueSystem {
  npcId: string | null = null;
  nodeId: string | null = null;

  constructor(private ctx: () => CondCtx, private hooks: DialogueHooks) {}

  open(npcId: string) {
    const d = DIALOGUE[npcId];
    if (!d) return false;
    const e = d.entries.find((x) => checkAll(x.cond, this.ctx()));
    if (!e) return false;
    this.npcId = npcId;
    this.go(e.node);
    return true;
  }

  get node(): DialogueNode | null {
    if (!this.npcId || !this.nodeId) return null;
    return DIALOGUE[this.npcId].nodes[this.nodeId] ?? null;
  }

  private go(id: string | undefined) {
    if (!id || !this.npcId) return this.close();
    this.nodeId = id;
    const n = this.node;
    if (!n) return this.close();
    for (const e of n.effects ?? []) this.hooks.effect(e, this.npcId);
  }

  /** 表示する選択肢（条件を満たすもの） */
  choices() {
    const n = this.node;
    if (!n) return [];
    if (!n.choices) return [{ text: n.next ? '▶' : 'とじる', idx: -1 }];
    return n.choices.map((c, idx) => ({ c, idx })).filter(({ c }) => checkAll(c.cond, this.ctx())).map(({ c, idx }) => ({ text: c.text, idx }));
  }

  choose(idx: number) {
    const n = this.node;
    if (!n || !this.npcId) return;
    const id = this.npcId;
    if (idx < 0 || !n.choices) { this.go(n.next); return; }
    const c = n.choices[idx];
    if (!c) return;
    for (const e of c.effects ?? []) this.hooks.effect(e, id);
    if (this.npcId !== id) return; // 効果で閉じた
    this.go(c.next);
  }

  close() {
    const id = this.npcId;
    this.npcId = null;
    this.nodeId = null;
    if (id) this.hooks.close(id);
  }
}

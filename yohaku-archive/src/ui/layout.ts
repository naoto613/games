// 因果編集画面のノード配置（横長は原因→結果を左から右、縦長は上から下へ）
import type { NodeDef } from '../engine/causal';

export function wrapLabel(s: string, max = 9): string[] {
  const out: string[] = [];
  let cur = '';
  for (const ch of s) {
    cur += ch;
    if (cur.length >= max && !'、。）」』'.includes(ch)) { out.push(cur); cur = ''; }
  }
  if (cur) out.push(cur);
  if (out.length > 3) { out.length = 3; out[2] = out[2].slice(0, -1) + '…'; }
  return out;
}

export function nodePos(n: NodeDef, portrait: boolean): { x: number; y: number } {
  return portrait ? { x: 10 + n.y * 1.2, y: 8 + n.x * 0.92 } : { x: 12 + n.x * 1.0, y: 7 + n.y * 0.9 };
}

export function nodeBox(n: NodeDef, portrait: boolean): { x: number; y: number; w: number; h: number } {
  const lines = wrapLabel(n.label);
  const { x, y } = nodePos(n, portrait);
  const w = portrait ? 19.5 : 21, h = 3.1 * lines.length + 3;
  return { x: x - w / 2, y: y - h / 2, w, h };
}

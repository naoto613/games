// 小さな条件式: "f:gateOpen & !r:r_diary | q:mq1>=2"
// '|' は '&' より弱い。'!' は否定。括弧は使わない（データを読みやすく保つため）。
export function evalCond(expr: string | undefined, resolve: (term: string) => boolean): boolean {
  if (!expr || !expr.trim()) return true;
  return expr.split('|').some(orPart =>
    orPart.split('&').every(raw => {
      let t = raw.trim();
      if (!t) return true;
      let neg = false;
      while (t.startsWith('!')) { neg = !neg; t = t.slice(1).trim(); }
      const v = resolve(t);
      return neg ? !v : v;
    }),
  );
}

/** "q:mq1>=2" のような比較を解く。 */
export function compare(actual: number, op: string, want: number): boolean {
  switch (op) {
    case '>=': return actual >= want;
    case '<=': return actual <= want;
    case '>': return actual > want;
    case '<': return actual < want;
    case '!=': return actual !== want;
    default: return actual === want;
  }
}

export const CMP_RE = /^([^<>=!]+)(>=|<=|!=|=|<|>)(-?\d+)$/;

// 町の 配置を くみたてる（参考画像3「町の画面」の 描き方に あわせる）。
// 「地面」（草・石畳・円形広場・土の道・水・橋）と「物体」（建物・木・噴水・街灯・花壇・柵 など）を わけて もつ。
// 当たり判定の 文字の 行（MAPS）と、描画用の 地面・物体（TownArt）を いっしょに つくる。

/** 地面の 種類（描画用） */
export type Ground = ',' | '.' | 'o' | ':' | '~' | '=' | '_';
// , 草  . 石畳  o 円形広場の 石  : 土の 道  ~ 水  = 橋（たて・よこは 自動）  _ 石だん

export type BuildingStyle = 'manor' | 'dome' | 'shop' | 'barn' | 'cottage' | 'hut' | 'mill' | 'inn' | 'lab';
export type TownObject =
  | { kind: 'building'; style: BuildingStyle; x: number; y: number; w: number; h: number; door: number; label?: string; roof?: string }
  | { kind: 'tree'; x: number; y: number; variant: number }
  | { kind: 'bush'; x: number; y: number; variant: number }
  | { kind: 'fountain'; x: number; y: number }
  | { kind: 'lamp'; x: number; y: number }
  | { kind: 'flowers'; x: number; y: number; variant: number }
  | { kind: 'fence'; x: number; y: number; dir: 'h' | 'v' }
  | { kind: 'bench'; x: number; y: number }
  | { kind: 'barrel'; x: number; y: number }
  | { kind: 'sign'; x: number; y: number }
  | { kind: 'stone'; x: number; y: number }
  | { kind: 'arch'; x: number; y: number; w: number }
  | { kind: 'well'; x: number; y: number }
  | { kind: 'rock'; x: number; y: number; variant: number }
  /** 風車の はね（うごく。x, y は 軸の マス） */
  | { kind: 'blades'; x: number; y: number }
  /** 風に まがった 木（高原） */
  | { kind: 'windtree'; x: number; y: number; variant: number };

export type TownArt = { w: number; h: number; ground: string[]; objects: TownObject[] };

/** 当たり判定の 文字（DungeonEngine の BLOCK に ふくまれる もの） */
const SOLID = 'Q';

export class TownBuilder {
  ground: string[][];
  solid: string[][];
  objects: TownObject[] = [];
  constructor(public w: number, public h: number, base: Ground = ',') {
    this.ground = Array.from({ length: h }, () => Array(w).fill(base));
    this.solid = Array.from({ length: h }, () => Array(w).fill(''));
  }
  private in(x: number, y: number) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  /** 地面を ぬる */
  fill(x: number, y: number, w: number, h: number, g: Ground) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (this.in(i, j)) this.ground[j][i] = g;
    return this;
  }
  /** 円形の 広場 */
  circle(cx: number, cy: number, r: number, g: Ground = 'o') {
    for (let j = Math.floor(cy - r); j <= Math.ceil(cy + r); j++) for (let i = Math.floor(cx - r); i <= Math.ceil(cx + r); i++) {
      if (this.in(i, j) && (i + 0.5 - cx) ** 2 + (j + 0.5 - cy) ** 2 <= r * r) this.ground[j][i] = g;
    }
    return this;
  }
  /** 線（道・川）：点を じゅんに つなぐ 太さ t の 線 */
  path(pts: [number, number][], g: Ground, t = 1) {
    for (let k = 0; k + 1 < pts.length; k++) {
      const [x0, y0] = pts[k], [x1, y1] = pts[k + 1];
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
      for (let s = 0; s <= n; s++) {
        const x = Math.round(x0 + ((x1 - x0) * s) / (n || 1)), y = Math.round(y0 + ((y1 - y0) * s) / (n || 1));
        this.fill(x - Math.floor((t - 1) / 2), y - Math.floor((t - 1) / 2), t, t, g);
      }
    }
    return this;
  }
  /** 当たり判定を つける（文字を 指定すると その 文字＝ NPC・扉 など） */
  block(x: number, y: number, w = 1, h = 1, ch = SOLID) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (this.in(i, j)) this.solid[j][i] = ch;
    return this;
  }
  mark(x: number, y: number, ch: string) { if (this.in(x, y)) this.solid[y][x] = ch; return this; }
  /** 建物：footprint（w×h）を ふさぎ、下の 段の door 列を 扉（D）に する */
  building(style: BuildingStyle, x: number, y: number, w: number, h: number, door: number, label?: string, roof?: string) {
    this.objects.push({ kind: 'building', style, x, y, w, h, door, label, roof });
    this.block(x, y, w, h);
    this.mark(x + door, y + h - 1, 'D');
    return this;
  }
  tree(x: number, y: number) { this.objects.push({ kind: 'tree', x, y, variant: (x * 7 + y * 13) % 4 }); return this.block(x, y); }
  /** 木を ならべる（四角の わく・森の ふち） */
  trees(x: number, y: number, w: number, h: number, density = 1) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (((i * 31 + j * 17) % 100) / 100 < density) this.tree(i, j);
    return this;
  }
  bush(x: number, y: number) { this.objects.push({ kind: 'bush', x, y, variant: (x + y) % 3 }); return this.block(x, y); }
  fountain(cx: number, cy: number) { this.objects.push({ kind: 'fountain', x: cx - 1, y: cy - 1 }); this.block(cx - 1, cy - 1, 3, 3); return this.mark(cx, cy + 1, 'F'); }
  lamp(x: number, y: number) { this.objects.push({ kind: 'lamp', x, y }); return this.block(x, y); }
  flowers(x: number, y: number, w = 1) { for (let i = 0; i < w; i++) { this.objects.push({ kind: 'flowers', x: x + i, y, variant: (x + i + y) % 4 }); this.block(x + i, y); } return this; }
  fence(x: number, y: number, len: number, dir: 'h' | 'v') {
    for (let k = 0; k < len; k++) { const fx = dir === 'h' ? x + k : x, fy = dir === 'h' ? y : y + k; this.objects.push({ kind: 'fence', x: fx, y: fy, dir }); this.block(fx, fy); }
    return this;
  }
  bench(x: number, y: number) { this.objects.push({ kind: 'bench', x, y }); return this.block(x, y); }
  barrel(x: number, y: number) { this.objects.push({ kind: 'barrel', x, y }); return this.block(x, y); }
  sign(x: number, y: number) { this.objects.push({ kind: 'sign', x, y }); return this.block(x, y); }
  well(x: number, y: number) { this.objects.push({ kind: 'well', x, y }); return this.block(x, y); }
  blades(x: number, y: number) { this.objects.push({ kind: 'blades', x, y }); return this; }
  windtree(x: number, y: number) { this.objects.push({ kind: 'windtree', x, y, variant: (x * 5 + y * 3) % 3 }); return this.block(x, y); }
  windtrees(x: number, y: number, w: number, h: number, density = 1) {
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (((i * 31 + j * 17) % 100) / 100 < density) this.windtree(i, j);
    return this;
  }
  rock(x: number, y: number) { this.objects.push({ kind: 'rock', x, y, variant: (x * 3 + y) % 3 }); return this.block(x, y); }
  /** しらべられる 石碑（V） */
  stone(x: number, y: number) { this.objects.push({ kind: 'stone', x, y }); return this.mark(x, y, 'V'); }
  /** ダンジョンへの 入口の アーチ（まんなかが G） */
  arch(x: number, y: number, w: number) { this.objects.push({ kind: 'arch', x, y, w }); this.block(x, y, w, 1); return this.mark(x + Math.floor(w / 2), y, 'G'); }
  /** 当たり判定の 行（DungeonEngine 用）。水は ~、木は T、ものは Q、扉は D、人は 数字 */
  rows(): string[] {
    return this.ground.map((row, y) => row.map((g, x) => {
      const s = this.solid[y][x];
      if (s) return s;
      return g === '~' ? '~' : '.';
    }).join(''));
  }
  art(): TownArt {
    return { w: this.w, h: this.h, ground: this.ground.map((r) => r.join('')), objects: this.objects };
  }
}

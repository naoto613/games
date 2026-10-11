// モンスターのドット絵。「モンスター図鑑（全20種）」の設定画から 1ドットずつ 起こした データ（spriteData.ts）を描く。
// データは tools/sprites/extract.py で 生成する。
import { mkCanvas, tint } from './Pix';
import { ALPH, FACING, SPRITE_DATA, SPRITE_SMALL, type SpriteData } from './spriteData';

// 色ちがいの なかま（スライムの 色ちがい と おなじ やりかた）。もとの 絵の 色あい（r: 度の はんい）だけを ずらして べつの モンスターに する。
type Recolor = { r: [number, number]; d: number; s?: number; l?: number; minS?: number };
export const VARIANTS: Record<string, { base: string; rules: Recolor[] }> = {
  echoslime: { base: 'lunaslime', rules: [{ r: [170, 260], d: 62, s: 0.62, l: 0.1 }] },
  mintslime: { base: 'lunaslime', rules: [{ r: [170, 260], d: -92 }] },
  flameslime: { base: 'lunaslime', rules: [{ r: [170, 260], d: 172, s: 1.1 }] },
  shadowdog: { base: 'magmadog', rules: [{ r: [330, 65], d: 250, minS: 0.3 }] },
  icewolf: { base: 'magmadog', rules: [{ r: [330, 65], d: 172, minS: 0.3 }] },
  claygolem: { base: 'stonegolem', rules: [{ r: [70, 170], d: -88, minS: 0.3 }] },
  rubykrill: { base: 'icekrill', rules: [{ r: [180, 250], d: 140 }] },
  blazebird: { base: 'frostbird', rules: [{ r: [180, 250], d: 165, s: 1.1 }] },
  thunderbird: { base: 'frostbird', rules: [{ r: [180, 250], d: -160, s: 1.15, l: 0.04 }] },
  venomworm: { base: 'sandworm', rules: [{ r: [20, 60], d: 240, s: 1.3, minS: 0.2 }] },
  magmaworm: { base: 'sandworm', rules: [{ r: [20, 60], d: -36, s: 1.7, minS: 0.2 }] },
  rosefant: { base: 'leafant', rules: [{ r: [70, 170], d: 212, minS: 0.3 }] },
  aquasprite: { base: 'greensprite', rules: [{ r: [70, 140], d: 72 }] },
  redeye: { base: 'darkeye', rules: [{ r: [250, 310], d: 82 }] },
  hellbill: { base: 'ghostbill', rules: [{ r: [240, 300], d: 112, s: 1.1 }] },
  icedragon: { base: 'firedragon', rules: [{ r: [330, 65], d: 190, minS: 0.3 }] },
  crimsondragon: { base: 'darkdragon', rules: [{ r: [240, 320], d: 84, s: 1.1 }] },
  moonleo: { base: 'lightningleo', rules: [{ r: [30, 70], d: 142, minS: 0.3 }] },
  bluecrab: { base: 'devilcrab', rules: [{ r: [335, 25], d: 215, minS: 0.3 }] },
  poisonborg: { base: 'kinoborg', rules: [{ r: [335, 25], d: 285, minS: 0.3 }] },
};

function rgb2hsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
}
function hsl2rgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
}
const inHue = (h: number, [a, b]: [number, number]) => (a <= b ? h >= a && h <= b : h >= a || h <= b);
function recolor(sd: SpriteData, rules: Recolor[]): SpriteData {
  const pal = sd.pal.map((hex) => {
    const [h, s, l] = rgb2hsl(parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16));
    for (const r of rules) {
      if (s < (r.minS ?? 0.15) || !inHue(h, r.r)) continue;
      const [R, G, B] = hsl2rgb((h + r.d + 360) % 360, Math.min(1, s * (r.s ?? 1)), Math.min(0.95, Math.max(0.05, l + (r.l ?? 0))));
      return [R, G, B].map((v) => v.toString(16).padStart(2, '0')).join('');
    }
    return hex;
  });
  return { ...sd, pal };
}
const variantCache = new Map<string, SpriteData>();
/** 絵の データ（色ちがいは もとの データから 色を ずらして つくる） */
function dataOf(id: string, small: boolean): SpriteData {
  const set = small ? SPRITE_SMALL : SPRITE_DATA;
  if (set[id]) return set[id];
  const v = VARIANTS[id];
  if (!v) return set.lunaslime;
  const key = `${id}:${small ? 1 : 0}`;
  let d = variantCache.get(key);
  if (!d) { d = recolor(set[v.base], v.rules); variantCache.set(key, d); }
  return d;
}

const CODE = new Map<string, number>([...ALPH].map((ch, i) => [ch, i]));

/** パレット＋ランレングスの データを キャンバスに ひらく */
function decode(sd: SpriteData): HTMLCanvasElement {
  const [c, g] = mkCanvas(sd.w, sd.h);
  const img = g.createImageData(sd.w, sd.h);
  const pal = sd.pal.map((hex) => [parseInt(hex.slice(0, 2), 16), parseInt(hex.slice(2, 4), 16), parseInt(hex.slice(4, 6), 16)]);
  let p = 0;
  for (let i = 0; i + 1 < sd.d.length; i += 2) {
    const col = CODE.get(sd.d[i])!;
    const n = CODE.get(sd.d[i + 1])!;
    if (col > 0) {
      const [r, gg, b] = pal[col - 1];
      for (let k = 0; k < n; k++) { const o = (p + k) * 4; img.data[o] = r; img.data[o + 1] = gg; img.data[o + 2] = b; img.data[o + 3] = 255; }
    }
    p += n;
  }
  g.putImageData(img, 0, 0);
  return c;
}

/** 正方形の キャンバスに 下そろえ・中央で おく（よびだしがわは 正方形で 描くので 形が くずれない） */
function square(src: HTMLCanvasElement, pad: number): HTMLCanvasElement {
  const size = Math.max(src.width, src.height) + pad * 2;
  const [c, g] = mkCanvas(size, size);
  g.drawImage(src, Math.floor((size - src.width) / 2), size - pad - src.height);
  return c;
}

const cache = new Map<string, HTMLCanvasElement>();

/**
 * モンスターの絵。
 * small=フィールドで ついてくる・リストの アイコン用の ちいさい絵（約34px）
 * distorted=ゆがみ（紫の もやを まとう）
 */
export function monsterSprite(id: string, opts: { distorted?: boolean; small?: boolean } = {}): HTMLCanvasElement {
  const key = `${id}:${opts.distorted ? 1 : 0}:${opts.small ? 1 : 0}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const pad = opts.small ? 1 : 4;
  let c = square(decode(dataOf(id, !!opts.small)), pad);
  if (opts.distorted) {
    const [c2, g] = mkCanvas(c.width, c.height);
    const aura = tint(c, '#3a0a52');
    const s = opts.small ? 1 : 2;
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1.5, -1], [1.5, 1], [-1, 1.5]]) { g.globalAlpha = 0.45; g.drawImage(aura, dx * s, dy * s); }
    g.globalAlpha = 1;
    g.drawImage(tint(c, '#7a2aa8', 0.28), 0, 0);
    c = c2;
  }
  cache.set(key, c);
  return c;
}

/** もとの絵の 向き（1=右むき, -1=左むき, 0=正面） */
export const spriteFacing = (id: string) => FACING[VARIANTS[id]?.base ?? id] ?? 0;
/** 右を むかせたい（right=true）／左を むかせたい ときに 左右反転が いるか */
export const needFlip = (id: string, right: boolean) => {
  const f = spriteFacing(id);
  return right ? f < 0 : f > 0;
};

export const hasSprite = (id: string) => id in SPRITE_DATA || id in VARIANTS;
export const SPRITE_IDS = [...Object.keys(SPRITE_DATA), ...Object.keys(VARIANTS)];

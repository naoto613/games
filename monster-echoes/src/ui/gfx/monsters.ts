// モンスターのドット絵。「モンスター図鑑（全20種）」の設定画から 1ドットずつ 起こした データ（spriteData.ts）を描く。
// データは tools/sprites/extract.py で 生成する。
import { mkCanvas, tint } from './Pix';
import { ALPH, FACING, SPRITE_DATA, SPRITE_SMALL, type SpriteData } from './spriteData';

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
  const set = opts.small ? SPRITE_SMALL : SPRITE_DATA;
  const pad = opts.small ? 1 : 4;
  let c = square(decode(set[id] ?? set.lunaslime), pad);
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
export const spriteFacing = (id: string) => FACING[id] ?? 0;
/** 右を むかせたい（right=true）／左を むかせたい ときに 左右反転が いるか */
export const needFlip = (id: string, right: boolean) => {
  const f = spriteFacing(id);
  return right ? f < 0 : f > 0;
};

export const hasSprite = (id: string) => id in SPRITE_DATA;
export const SPRITE_IDS = Object.keys(SPRITE_DATA);

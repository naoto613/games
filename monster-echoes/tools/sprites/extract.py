# モンスター図鑑の画像（zukan.jpg）から 20 体のドット絵を切り出し、
# パレット＋ランレングスの データ（src/ui/gfx/spriteData.ts）に変換する。
#   python3 tools/sprites/extract.py [プレビューpngの出力先]
import sys, os, json
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
SRC = np.asarray(Image.open(os.path.join(HERE, 'zukan.jpg')).convert('RGB')).astype(np.int32)

COLS = [12, 200, 378, 562, 740]
ROWS = [665, 859, 1058, 1251]
IDS = ['lunaslime', 'magmadog', 'stonegolem', 'frostbird', 'sandworm',
       'leafant', 'thunderkids', 'darkeye', 'metalspirit', 'firedragon',
       'windcat', 'icekrill', 'greensprite', 'devilcrab', 'ghostbill',
       'darkdragon', 'kinoborg', 'lightningleo', 'goldslime', 'chaosdragon']
# 右どなりの ちいさい絵（バリエーション）を まぜないための 右はし（カード左からの px）と、
# 部品として のこす 重心xの 上限
CUT = {'magmadog': 111, 'sandworm': 104, 'thunderkids': 102, 'devilcrab': 101, 'firedragon': 104,
       'darkdragon': 116, 'chaosdragon': 112, 'windcat': 97, 'metalspirit': 93, 'kinoborg': 89,
       'lunaslime': 88, 'leafant': 88, 'frostbird': 91, 'stonegolem': 97, 'darkeye': 96,
       'icekrill': 95, 'greensprite': 93, 'ghostbill': 92, 'lightningleo': 96, 'goldslime': 95}
# かこまれた 背景を ぬく 最小サイズ（白い ハイライトを けさないように）
ENCLOSED = {'stonegolem': 50, 'thunderkids': 60}
# もとの絵の向き（右むき=1 / 正面=0 / 左むき=-1）
FACING = {'magmadog': 1, 'frostbird': 1, 'sandworm': 1, 'thunderkids': 1, 'firedragon': 1, 'windcat': 0,
          'darkdragon': 1, 'chaosdragon': 1, 'lightningleo': -1}


def extract(i, sid):
    l, t = COLS[i % 5], ROWS[i // 5]
    cut = CUT.get(sid, 96)
    a = SRC[t + 3:t + 98, l + 3:l + cut].copy()
    h, w, _ = a.shape
    # 背景（クリーム色）を 外がわから ぬりつぶして とりのぞく
    border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    bg = np.median(border, axis=0)
    dist = np.sqrt(((a - bg) ** 2).sum(-1))
    lum = a.mean(-1)
    sat = a.max(-1) - a.min(-1)
    near = (dist < 42) | ((lum > 215) & (sat < 38))
    lab, _ = ndimage.label(near)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bgmask = np.isin(lab, list(edge))
    # かこまれた すきま（うでと からだの あいだ など）も 背景色に ちかくて ある程度 大きければ ぬく
    tight = dist < 20
    tl, tn = ndimage.label(tight)
    for k in range(1, tn + 1):
        sz = (tl == k).sum()
        if sz >= 4 and os.environ.get('DBG'): print(sid, 'enclosed', sz, ndimage.center_of_mass(tl == k))
        if sz >= ENCLOSED.get(sid, 99999): bgmask |= tl == k
    fg = ~bgmask
    # 部品ごとに 分けて、文字・バッジ・となりの絵を のぞく
    clab, n = ndimage.label(fg, structure=np.ones((3, 3)))
    keep = np.zeros_like(fg)
    sizes = ndimage.sum(fg, clab, range(1, n + 1))
    big = int(np.argmax(sizes)) + 1
    by, bx = ndimage.find_objects(clab)[big - 1]
    for k in range(1, n + 1):
        sl = ndimage.find_objects(clab)[k - 1]
        ys, xs = np.nonzero(clab == k)
        if len(ys) < 3: continue
        cx, cy = xs.mean(), ys.mean()
        if k != big:
            if sl[0].start > 88: continue  # 下の せつめい文
            if cx > cut - 6: continue
            # 本体から はなれすぎた ものは のぞく
            if cy < by.start - 14 or cy > by.stop + 4 or cx < bx.start - 14 or cx > bx.stop + 10: continue
        keep |= clab == k
    # ふちの にじみ（背景とまざった あかるい ピクセル）を けずる
    for _ in range(2):
        halo = keep & ndimage.binary_dilation(~keep) & (((dist < 125) & (lum > 125)) | (dist < 60))
        keep &= ~halo
    keep = ndimage.binary_opening(keep, structure=np.ones((1, 1)))
    ys, xs = np.nonzero(keep)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    rgb = a[y0:y1, x0:x1].astype(np.uint8)
    m = keep[y0:y1, x0:x1]
    return rgb, m


def quantize(rgb, m, colors):
    px = rgb[m]
    img = Image.fromarray(px.reshape(1, -1, 3), 'RGB')
    q = img.quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = np.array(q.getpalette()[:colors * 3]).reshape(-1, 3)
    idx = np.zeros(m.shape, np.int32)
    idx[m] = np.asarray(q).reshape(-1) + 1
    return idx, pal


def outline_dark(idx, pal):
    """ふちを いちばん くらい 色で しめて、ドット絵らしい りんかくに する"""
    m = idx > 0
    lum = pal.mean(1)
    dark = int(np.argmin(lum)) + 1
    # すでに暗い ふちは そのまま。あかるい ふちだけ 1px そとに りんかくを たす
    pad = np.pad(idx, 1)
    pm = pad > 0
    ring = ndimage.binary_dilation(pm, structure=np.ones((3, 3))) & ~pm
    # あかるい色に となりあう そとがわ だけ
    near_light = np.zeros_like(pm)
    for dy in (-1, 0, 1):
        for dx in (-1, 0, 1):
            sh = np.roll(np.roll(pad, dy, 0), dx, 1)
            near_light |= (sh > 0) & (lum[np.maximum(sh - 1, 0)] > 95)
    pad[ring & near_light] = dark
    return pad


def small(rgb, m, size):
    """フィールドで ついてくる用の ちいさい絵（面積平均で 縮小）"""
    h, w = m.shape
    s = size / max(h, w)
    nw, nh = max(1, round(w * s)), max(1, round(h * s))
    rgba = np.zeros((h, w, 4), np.uint8)
    rgba[..., :3] = rgb
    rgba[..., 3] = m * 255
    pre = rgba.astype(np.float32)
    pre[..., :3] *= pre[..., 3:4] / 255
    im = Image.fromarray(pre.clip(0, 255).astype(np.uint8), 'RGBA').resize((nw, nh), Image.BOX)
    r = np.asarray(im).astype(np.float32)
    al = r[..., 3]
    ok = al > 110
    col = np.zeros((nh, nw, 3), np.uint8)
    col[ok] = (r[ok][:, :3] * 255 / al[ok][:, None]).clip(0, 255).astype(np.uint8)
    return col, ok


def rle(idx):
    out = []
    flat = idx.reshape(-1)
    i = 0
    while i < len(flat):
        j = i
        while j < len(flat) and flat[j] == flat[i] and j - i < 63: j += 1
        out.append((flat[i], j - i))
        i = j
    return out


ALPH = ''.join(chr(c) for c in range(35, 127) if chr(c) not in '\\')  # 91文字


def encode(idx, pal):
    # 1ラン = 色(1文字) + ながさ(1文字, 1..63) 。色は 0=とうめい
    s = []
    for c, n in rle(idx):
        s.append(ALPH[c] + ALPH[n])
    return {'w': int(idx.shape[1]), 'h': int(idx.shape[0]), 'pal': ['%02x%02x%02x' % tuple(int(v) for v in p) for p in pal], 'd': ''.join(s)}


def main():
    prev = sys.argv[1] if len(sys.argv) > 1 else None
    big_out, small_out, sheet = {}, {}, []
    for i, sid in enumerate(IDS):
        rgb, m = extract(i, sid)
        idx, pal = quantize(rgb, m, 40)
        big_out[sid] = encode(outline_dark(idx, pal), pal)
        srgb, sm = small(rgb, m, 34)
        sidx, spal = quantize(srgb, sm, 24)
        small_out[sid] = encode(outline_dark(sidx, spal), spal)
        if prev:
            sheet.append((sid, idx, pal, sidx, spal))
    ts = ['// tools/sprites/extract.py で モンスター図鑑の画像から 生成（てで へんしゅう しない）',
          '// 1ラン = 色(1文字) + ながさ(1文字)。文字は ALPH の なかの いち。色 0 は とうめい。',
          'export type SpriteData = { w: number; h: number; pal: string[]; d: string };',
          'export const ALPH = ' + json.dumps(ALPH) + ';',
          'export const FACING: Record<string, number> = ' + json.dumps(FACING) + ';',
          'export const SPRITE_DATA: Record<string, SpriteData> = ' + json.dumps(big_out, ensure_ascii=False) + ';',
          'export const SPRITE_SMALL: Record<string, SpriteData> = ' + json.dumps(small_out, ensure_ascii=False) + ';', '']
    open(os.path.join(ROOT, 'src', 'ui', 'gfx', 'spriteData.ts'), 'w').write('\n'.join(ts))
    if prev:
        S = 4
        cell = 130 * S
        img = Image.new('RGB', (cell * 5, cell * 4), (40, 44, 60))
        for k, (sid, idx, pal, sidx, spal) in enumerate(sheet):
            def toimg(ix, pl):
                d = outline_dark(ix, pl)
                plp = np.vstack([[0, 0, 0], pl, ]).astype(np.uint8)
                lum = pl.mean(1)
                plp = np.vstack([[0, 0, 0], pl]).astype(np.uint8)
                rgba = np.zeros(d.shape + (4,), np.uint8)
                rgba[..., :3] = plp[d]
                rgba[..., 3] = (d > 0) * 255
                return Image.fromarray(rgba, 'RGBA')
            b = toimg(idx, pal)
            b = b.resize((b.width * S, b.height * S), Image.NEAREST)
            s = toimg(sidx, spal)
            s = s.resize((s.width * S, s.height * S), Image.NEAREST)
            ox, oy = (k % 5) * cell, (k // 5) * cell
            img.paste(b, (ox + 4, oy + 4), b)
            img.paste(s, (ox + cell - s.width - 4, oy + cell - s.height - 4), s)
        img.save(prev)


main()

# 参考画像1（docs/v2/ref/monster-zukan-200.png）から モンスター200体の ドット絵を 切り出す。
#   python3 tools/v2/extract_monsters.py
# 出力:
#   assets/monsters/mon_###_slug.png   64×64・透過（絵は 下そろえ・中央）
#   assets/monsters/manifest.json      ID・名前・原寸・状態（ok / placeholder）
#   docs/v2/qa/sheet.png               200体の 一覧（目で たしかめる用）
# 参考画像の マスの いち（行優先で 番号順）で ID を きめる（要確認事項 Q3）。
import json, os, re, sys
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, HERE)
from slugs import SLUGS  # noqa: E402

SRC = os.path.join(ROOT, 'docs', 'v2', 'ref', 'monster-zukan-200.png')
OUT = os.path.join(ROOT, 'assets', 'monsters')
CANVAS = 64
FOOT = 58  # 足もとの 高さ（キャンバスの 上から）
LARGE, LARGE_FOOT = 96, 88  # 大型モンスター（表示領域が 48 を こえる もの）
# かこまれた 背景を ぬく 個体と その 最小サイズ（ハイライトと まちがえない ものだけ）
ENCLOSED = {}

# パネルの いち（タイトル帯と 枠の 解析で もとめた もの）: [x0, x1] と [y0（タイトル帯の 下）, y1]
PANEL_X = [(11, 324), (335, 632), (643, 935), (944, 1229), (1239, 1526)]
PANEL_Y = [(81, 396), (432, 743)]


def runs(mask1d, gap=2, minlen=1):
    """True が つづく はんいを かえす（gap 以下の すきまは つなげる）"""
    out, s, last = [], None, None
    for i, v in enumerate(mask1d):
        if v:
            if s is None:
                s = i
            elif last is not None and i - last > gap + 1:
                out.append((s, last)); s = i
            last = i
    if s is not None:
        out.append((s, last))
    return [r for r in out if r[1] - r[0] + 1 >= minlen]


def panel_cells(img, x0, x1, y0, y1):
    """パネルの なかの 20マスの 絵の はんい（行優先）"""
    p = img[y0:y1, x0 + 4:x1 - 4]
    bg = np.median(p.reshape(-1, 3), 0)
    d = np.sqrt(((p - bg) ** 2).sum(-1))
    m = d > 40
    rows = m.sum(1) > 8
    blocks = runs(rows, gap=2, minlen=3)
    bands = [b for b in blocks if b[1] - b[0] >= 22]  # 絵の段（番号・名前の 行は ひくい）
    if len(bands) != 4:
        raise RuntimeError(f'panel {x0},{y0}: bands {bands}')
    cells = []
    for (r0, r1) in bands:
        cols = m[r0:r1 + 1].sum(0) > 0
        cr = runs(cols, gap=7, minlen=6)
        if len(cr) != 5:
            # すきまが うまく とれない ときは 5等分
            w = p.shape[1] / 5
            cr = [(int(i * w + 3), int((i + 1) * w - 3)) for i in range(5)]
        for (c0, c1) in cr:
            cells.append((x0 + 4 + c0, y0 + r0, x0 + 4 + c1 + 1, y0 + r1 + 1))
    return cells


def cut(img, box, pad=3, enclosed=0):
    x0, y0, x1, y1 = box
    a = img[max(0, y0 - pad):y1 + pad, max(0, x0 - pad):x1 + pad].copy()
    border = np.concatenate([a[0], a[-1], a[:, 0], a[:, -1]])
    bg = np.median(border, 0)
    dist = np.sqrt(((a - bg) ** 2).sum(-1))
    lum = a.mean(-1)
    # 外がわから 背景色に ちかい ところを ぬりつぶす
    near = dist < 34
    lab, _ = ndimage.label(near)
    edge = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bgm = np.isin(lab, list(edge))
    # かこまれた 背景（あしの すきま など）は 指定した 個体だけ ぬく（白い ハイライトを けさないため）
    if enclosed:
        tight = dist < 16
        tl, tn = ndimage.label(tight)
        for k in range(1, tn + 1):
            if (tl == k).sum() >= enclosed:
                bgm |= tl == k
    fg = ~bgm
    # ふちの にじみを けずる
    for _ in range(2):
        halo = fg & ndimage.binary_dilation(~fg) & (dist < 70) & (lum > 150)
        fg &= ~halo
    # ちいさい ゴミを のぞく（ただし 本体の ちかくの キラキラは のこす）
    lab2, n2 = ndimage.label(fg, structure=np.ones((3, 3)))
    if n2 == 0:
        return None, None
    sizes = ndimage.sum(fg, lab2, range(1, n2 + 1))
    big = int(np.argmax(sizes)) + 1
    keep = np.zeros_like(fg)
    objs = ndimage.find_objects(lab2)
    body_bottom = objs[big - 1][0].stop
    for k in range(1, n2 + 1):
        top = objs[k - 1][0].start
        # 本体より 下に ある もの（番号の 文字）は のぞく
        if k != big and top >= body_bottom - 1:
            continue
        if sizes[k - 1] >= 3 or k == big:
            keep |= lab2 == k
    ys, xs = np.nonzero(keep)
    y0, y1, x0, x1 = ys.min(), ys.max() + 1, xs.min(), xs.max() + 1
    return a[y0:y1, x0:x1].astype(np.uint8), keep[y0:y1, x0:x1]


def quantize(rgb, m, colors=32):
    px = rgb[m]
    q = Image.fromarray(px.reshape(1, -1, 3), 'RGB').quantize(colors=colors, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = np.array(q.getpalette()[:colors * 3]).reshape(-1, 3).astype(np.uint8)
    out = np.zeros(rgb.shape, np.uint8)
    out[m] = pal[np.asarray(q).reshape(-1)]
    return out


def outline(rgba):
    """あかるい ふちに 1px の くらい りんかくを たす（背景色に たよらない 見た目に する）"""
    a = rgba[..., 3] > 0
    rgb = rgba[..., :3].astype(int)
    lum = rgb.mean(-1)
    # そとがわ（キャンバスの はしから つながる とうめい部分）だけに りんかくを つける
    lab, _ = ndimage.label(~a)
    ext = np.isin(lab, list(set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}))
    ring = ndimage.binary_dilation(a, structure=np.ones((3, 3))) & ext
    out = rgba.copy()
    ys, xs = np.nonzero(ring)
    for y, x in zip(ys, xs):
        y0, y1, x0, x1 = max(0, y - 1), y + 2, max(0, x - 1), x + 2
        nb = a[y0:y1, x0:x1]
        if nb.any() and lum[y0:y1, x0:x1][nb].max() > 110:
            out[y, x] = (28, 20, 36, 255)
    return out


def main():
    img = np.asarray(Image.open(SRC).convert('RGB')).astype(np.int32)
    names = json.load(open(os.path.join(ROOT, 'tools', 'v2', 'names.json'), encoding='utf-8'))
    os.makedirs(OUT, exist_ok=True)
    cells = []
    for (y0, y1) in PANEL_Y:
        for (x0, x1) in PANEL_X:
            cells.extend(panel_cells(img, x0, x1, y0, y1))
    assert len(cells) == 200, len(cells)
    manifest = []
    sheet = Image.new('RGBA', (CANVAS * 20, CANVAS * 10), (150, 160, 180, 255))
    for i, box in enumerate(cells):
        no = i + 1
        rgb, m = cut(img, box, enclosed=ENCLOSED.get(no, 0))
        status = 'ok'
        size = CANVAS
        if m is not None and max(m.shape) > 46:  # りんかく 1px ずつを ふくめて 48 を こえる もの
            size = LARGE  # 大型モンスター（仕様 13.1）
        foot = FOOT if size == CANVAS else LARGE_FOOT
        canvas = np.zeros((size, size, 4), np.uint8)
        if rgb is None or m.sum() < 120:
            status = 'placeholder'
        else:
            q = quantize(rgb, m)
            h, w = m.shape
            if w > size - 4 or h > foot - 2:
                status = 'placeholder'
            else:
                ox, oy = (size - w) // 2, foot - h
                canvas[oy:oy + h, ox:ox + w, :3] = q
                canvas[oy:oy + h, ox:ox + w, 3] = m * 255
                canvas = outline(canvas)
        file = f'mon_{no:03d}_{SLUGS[no]}.png'
        Image.fromarray(canvas, 'RGBA').save(os.path.join(OUT, file))
        manifest.append({'id': f'm{no:03d}', 'no': no, 'name': names[str(no)], 'file': file, 'canvas': size, 'foot': foot, 'large': size != CANVAS,
                         'w': int(m.shape[1]) if m is not None else 0, 'h': int(m.shape[0]) if m is not None else 0,
                         'source': list(map(int, box)), 'status': status})
        tile = Image.fromarray(canvas, 'RGBA')
        if size != CANVAS:  # 一覧では 64 に おさめて ならべる（足もとを そろえる）
            tile = tile.crop(((size - CANVAS) // 2, foot - FOOT, (size - CANVAS) // 2 + CANVAS, foot - FOOT + CANVAS))
        sheet.alpha_composite(tile, ((i % 20) * CANVAS, (i // 20) * CANVAS))
    json.dump({'source': 'docs/v2/ref/monster-zukan-200.png', 'canvas': CANVAS, 'foot': FOOT, 'monsters': manifest},
              open(os.path.join(OUT, 'manifest.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    os.makedirs(os.path.join(ROOT, 'docs', 'v2', 'qa'), exist_ok=True)
    sheet.resize((sheet.width * 2, sheet.height * 2), Image.NEAREST).save(os.path.join(ROOT, 'docs', 'v2', 'qa', 'sheet.png'))
    bad = [x['no'] for x in manifest if x['status'] != 'ok']
    print('done', len(manifest), 'placeholder:', bad)


if __name__ == '__main__':
    main()

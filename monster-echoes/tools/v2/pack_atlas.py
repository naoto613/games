# assets/monsters/mon_*.png を 1まいの アトラスに まとめる（ゲームの 起動時に 1回で 読みこむため）。
#   python3 tools/v2/pack_atlas.py
# 出力: assets/monsters/atlas.png ・ atlas.json（id → いち・大きさ・足もと・絵の はんい）
import json, os
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DIR = os.path.join(ROOT, 'assets', 'monsters')
man = json.load(open(os.path.join(DIR, 'manifest.json'), encoding='utf-8'))
W = 1024
items = sorted(man['monsters'], key=lambda m: (-m['canvas'], m['no']))
x = y = row_h = 0
cells, placed = {}, []
for m in items:
    s = m['canvas']
    if x + s > W:
        x, y, row_h = 0, y + row_h, 0
    im = Image.open(os.path.join(DIR, m['file'])).convert('RGBA')
    a = np.asarray(im)[..., 3] > 0
    ys, xs = np.nonzero(a)
    cells[m['id']] = {'x': x, 'y': y, 'size': s, 'foot': m['foot'], 'bbox': [int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1], 'large': m['large']}
    placed.append((im, x, y))
    x += s
    row_h = max(row_h, s)
H = y + row_h
atlas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
for im, px, py in placed:
    atlas.paste(im, (px, py))
atlas.save(os.path.join(DIR, 'atlas.png'), optimize=True)
json.dump({'image': 'atlas.png', 'width': W, 'height': H, 'cells': cells}, open(os.path.join(DIR, 'atlas.json'), 'w'), separators=(',', ':'))
print('atlas', W, H, os.path.getsize(os.path.join(DIR, 'atlas.png')) // 1024, 'KB')

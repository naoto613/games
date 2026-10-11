# モンスター200体の ドット絵の 品質チェック（仕様 13.4）。docs/v2/qa/REPORT.md を つくる。
#   python3 tools/v2/qa_monsters.py
import json, os
import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
man = json.load(open(os.path.join(ROOT, 'assets', 'monsters', 'manifest.json'), encoding='utf-8'))
mons = man['monsters']
alpha, colors, issues = {}, {}, []
for m in mons:
    im = np.asarray(Image.open(os.path.join(ROOT, 'assets', 'monsters', m['file'])).convert('RGBA'))
    a = im[..., 3] > 0
    big = np.zeros((96, 96), bool)
    oy, ox = 88 - m['foot'], (96 - a.shape[1]) // 2
    big[oy:oy + a.shape[0], ox:ox + a.shape[1]] = a
    alpha[m['no']] = big
    px = im[a][:, :3].astype(float)
    colors[m['no']] = px.mean(0) if len(px) else np.zeros(3)
    ys, xs = np.nonzero(a)
    if m['status'] != 'ok':
        issues.append(f"- {m['no']:03d} {m['name']}: status={m['status']}")
    elif im.shape[:2] != ((96, 96) if m['large'] else (64, 64)):
        issues.append(f"- {m['no']:03d} {m['name']}: キャンバスの 大きさが ちがう {im.shape[:2]}")
    elif not m['large'] and (xs.max() - xs.min() + 1 > 48 or ys.max() - ys.min() + 1 > 48):
        issues.append(f"- {m['no']:03d} {m['name']}: 表示領域が 48×48 を こえる（{xs.max() - xs.min() + 1}×{ys.max() - ys.min() + 1}）")

# シルエットの にかよい（IoU）と 色の ちかさ
pairs = []
nos = [m['no'] for m in mons]
for i, a in enumerate(nos):
    for b in nos[i + 1:]:
        A, B = alpha[a], alpha[b]
        iou = (A & B).sum() / max(1, (A | B).sum())
        cd = float(np.linalg.norm(colors[a] - colors[b]))
        if iou >= 0.85 and cd < 40:
            pairs.append((iou, cd, a, b))
pairs.sort(reverse=True)
name = {m['no']: m['name'] for m in mons}
lines = [
    '# モンスター ドット絵 QA レポート',
    '',
    f"- 対象: {len(mons)}体（`assets/monsters/`、元画像 `{man['source']}`）",
    f"- 問題: {len(issues)}件",
    f"- 大型（96×96）: {sum(1 for m in mons if m['large'])}体：" + '、'.join(f"{m['no']:03d}" for m in mons if m['large']),
    '',
    '## 問題のある個体（未完成アセット）',
    '',
    *(issues or ['- なし']),
    '',
    '## 形も 色も にている 組（シルエットの IoU ≥ 0.85 かつ 平均色の差 < 40。要確認事項 Q4：画像どおりに 再現し、能力・役割・発光で 差を つける）',
    '',
    '| IoU | 色の差 | A | B |',
    '|---|---|---|---|',
    *[f'| {iou:.2f} | {cd:.0f} | {a:03d} {name[a]} | {b:03d} {name[b]} |' for iou, cd, a, b in pairs],
    '',
]
os.makedirs(os.path.join(ROOT, 'docs', 'v2', 'qa'), exist_ok=True)
open(os.path.join(ROOT, 'docs', 'v2', 'qa', 'REPORT.md'), 'w', encoding='utf-8').write('\n'.join(lines))
print('issues', len(issues), 'similar pairs', len(pairs))

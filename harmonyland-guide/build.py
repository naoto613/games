#!/usr/bin/env python3
"""data/*.json から js/data-fallback.js を生成し、配布用 ZIP を作る。

  python3 build.py

- js/data-fallback.js : index.html をファイルとして直接開いた（file://）ときに JSON を fetch できないための同梱データ。
  JSON を編集したら必ず再生成する。
- harmonyland-guide.zip : 配布物（index.html / css / js / data / assets / README.md ほか）。
"""
import json, os, zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
NAMES = ['app-config', 'facilities', 'shows', 'sources', 'opening-info']

data = {}
for n in NAMES:
    with open(os.path.join(HERE, 'data', n + '.json'), encoding='utf-8') as f:
        data[n] = json.load(f)  # 壊れた JSON はここでエラーにする

js = ('/* 自動生成ファイル（build.py）。直接編集しないこと。編集は data/*.json に行い、python3 build.py で再生成する。 */\n'
      'window.HL_BUNDLED_DATA = ' + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
with open(os.path.join(HERE, 'js', 'data-fallback.js'), 'w', encoding='utf-8') as f:
    f.write(js)

INCLUDE = ['index.html', 'README.md', 'manifest.webmanifest', 'sw.js', 'build.py', 'css', 'js', 'data', 'assets']
zpath = os.path.join(HERE, 'harmonyland-guide.zip')
with zipfile.ZipFile(zpath, 'w', zipfile.ZIP_DEFLATED) as z:
    for item in INCLUDE:
        p = os.path.join(HERE, item)
        if os.path.isdir(p):
            for root, _, files in os.walk(p):
                for fn in sorted(files):
                    full = os.path.join(root, fn)
                    z.write(full, os.path.join('harmonyland-guide', os.path.relpath(full, HERE)))
        else:
            z.write(p, os.path.join('harmonyland-guide', item))
print('generated js/data-fallback.js and harmonyland-guide.zip')

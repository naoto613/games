// 開発用: すべてのドット絵を一覧表示する（node tools/shot.mjs で撮影）
import { SPRITE_IDS, monsterSprite } from '../src/ui/gfx/monsters';
const root = document.body;
root.style.cssText = 'margin:0;background:#9ab;display:flex;flex-wrap:wrap;gap:8px;padding:8px';
for (const id of SPRITE_IDS) for (const d of [false, true]) {
  if (d) continue;
  const c = monsterSprite(id, { distorted: d });
  c.style.cssText = 'width:192px;height:192px;image-rendering:pixelated;background:#fff';
  root.append(c);
}
(window as any).ready = true;

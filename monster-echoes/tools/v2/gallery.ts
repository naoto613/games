// 開発用: モンスター200体の ギャラリー（原寸・ゲーム内の 大きさ・小さい版・4つの うごき）
// node tools/v2/gallery.mjs <出力dir> で 撮影する。
import { loadMonsterAtlas } from '../../src/infrastructure/assets/MonsterAtlas';
import { flashSprite, monsterSprite, spriteFoot } from '../../src/ui/gfx/monsters';
import { drawWithPose, motionPose, type MotionKind } from '../../src/ui/gfx/motion';
import { backdrop, BD_W, BD_H } from '../../src/ui/gfx/backdrops';
import { MONSTERS2 } from '../../src/data/v2/monsters';

(async () => {
  await loadMonsterAtlas('../../assets/monsters/');
  const root = document.body;
  root.style.cssText = 'margin:0;background:#1a1d2e;color:#dde;font:11px sans-serif;padding:8px';
  const mode = new URLSearchParams(location.search).get('mode') ?? 'grid';
  if (mode === 'grid') {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:grid;grid-template-columns:repeat(10,1fr);gap:4px';
    for (const m of MONSTERS2) {
      const cell = document.createElement('div');
      cell.style.cssText = 'background:#2c3150;border-radius:4px;text-align:center;padding:2px';
      const c = monsterSprite(m.id);
      c.style.cssText = 'width:96px;height:96px;image-rendering:pixelated';
      const s = monsterSprite(m.id, { small: true });
      s.style.cssText = 'width:36px;height:36px;image-rendering:pixelated;vertical-align:bottom';
      cell.append(c, s, Object.assign(document.createElement('div'), { textContent: `${String(m.no).padStart(3, '0')} ${m.name}` }));
      wrap.append(cell);
    }
    root.append(wrap);
  } else {
    // 戦闘背景の うえで 4つの うごきを ならべる
    const ids = (new URLSearchParams(location.search).get('ids') ?? 'm001,m021,m161,m115').split(',');
    const kinds: [MotionKind, number][] = [['idle', 0], ['attack', 9], ['hit', 1], ['faint', 12]];
    for (const id of ids) {
      const cv = document.createElement('canvas');
      cv.width = BD_W * 2; cv.height = BD_H / 2 + 40;
      const g = cv.getContext('2d')!;
      g.imageSmoothingEnabled = false;
      g.drawImage(backdrop('forest'), 0, BD_H / 2 - 20, BD_W, BD_H / 2 + 20, 0, 0, BD_W * 2, BD_H / 2 + 40);
      const sp = monsterSprite(id);
      kinds.forEach(([k, t], i) => {
        const h = Math.min(150, sp.height), w = Math.round(sp.width * (h / sp.height));
        const foot = (spriteFoot(id) ?? sp.height) * (h / sp.height);
        const x = 90 + i * 170, by = cv.height - 8 + (h - foot);
        drawWithPose(g, sp, flashSprite(sp), x, by, w, h, motionPose(k, t));
        g.fillStyle = '#fff'; g.fillText(k, x - 10, 12);
      });
      root.append(cv, document.createElement('br'));
    }
  }
  (window as unknown as { ready: boolean }).ready = true;
})();

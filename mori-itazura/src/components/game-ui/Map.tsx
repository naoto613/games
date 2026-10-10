// ちず：キャンプ場を上から見た図に、主人公・人・目的地・宝の×を描く
import { useEffect, useRef } from 'react';
import { useGame } from './hooks';
import { Panel } from './Inventory';
import { CAMPSITE as L } from '../../game/content/areas/campsite';
import { lakeSdf, pathFactor } from '../../game/world/Terrain';

let baseCache: HTMLCanvasElement | null = null;
const R = 44, PX = 6;

function base() {
  if (baseCache) return baseCache;
  const c = document.createElement('canvas');
  c.width = c.height = R * 2 * PX;
  const g = c.getContext('2d')!;
  const img = g.createImageData(c.width, c.height);
  for (let j = 0; j < c.height; j += 2) for (let i = 0; i < c.width; i += 2) {
    const x = i / PX - R, z = j / PX - R;
    let col = [126, 170, 86];
    const r = Math.hypot(x, z);
    if (r > 41) col = [74, 112, 64];
    else if (lakeSdf(x, z) < 0) col = [86, 186, 196];
    else if (pathFactor(x, z) < 1) col = [214, 170, 112];
    else if (lakeSdf(x, z) < 1.5) col = [226, 204, 150];
    for (let dj = 0; dj < 2; dj++) for (let di = 0; di < 2; di++) {
      const k = ((j + dj) * c.width + i + di) * 4;
      img.data[k] = col[0]; img.data[k + 1] = col[1]; img.data[k + 2] = col[2]; img.data[k + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
  const P = (x: number, z: number) => [(x + R) * PX, (z + R) * PX] as const;
  const box = (x: number, z: number, w: number, d: number, fill: string, label: string) => {
    const [a, b] = P(x - w / 2, z - d / 2);
    g.fillStyle = fill; g.fillRect(a, b, w * PX, d * PX);
    g.fillStyle = '#3a2a1a'; g.font = '900 15px sans-serif'; g.textAlign = 'center';
    g.fillText(label, a + (w * PX) / 2, b - 5);
  };
  box(L.cabin.pos[0], L.cabin.pos[1], L.cabin.w, L.cabin.d, '#9b4a35', 'レンジャーごや');
  box(L.shop.pos[0], L.shop.pos[1], 2.6, 3.2, '#5f9c8a', 'ばいてん');
  box(L.picnic.table1.pos[0], L.picnic.table1.pos[1], 2.1, 1.6, '#b27a45', 'ピクニック');
  box(L.den.pos[0], L.den.pos[1], 3, 3, '#6b4a32', 'おうち');
  box(L.parking.min[0] + 5.5, 33.5, 11, 7, 'rgba(120,110,100,.35)', 'ちゅうしゃじょう');
  const [fx, fz] = P(L.campfire.pos[0], L.campfire.pos[1]);
  g.fillStyle = '#f2a93b'; g.beginPath(); g.arc(fx, fz, 9, 0, 7); g.fill();
  g.fillStyle = '#3a2a1a'; g.fillText('たきび', fx, fz - 14);
  for (const t of L.tents) { const [a, b] = P(t.pos[0], t.pos[1]); g.fillStyle = '#e79a35'; g.beginPath(); g.moveTo(a, b - 10); g.lineTo(a + 10, b + 8); g.lineTo(a - 10, b + 8); g.fill(); }
  const [dx, dz] = P(L.dock.x0, L.dock.z);
  g.fillStyle = '#b98a57'; g.fillRect(dx - 6.6 * PX, dz - 5, 6.6 * PX, 10);
  g.fillStyle = '#1f5d6b'; g.fillText('みずうみ', ...P(L.lake.c[0], L.lake.c[1] + 4));
  baseCache = c;
  return c;
}

export function MapPanel() {
  const g = useGame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let raf = 0;
    const draw = () => {
      const cv = ref.current;
      if (!cv) return;
      const ctx = cv.getContext('2d')!;
      const b = base();
      ctx.drawImage(b, 0, 0, cv.width, cv.height);
      const k = cv.width / b.width;
      const P = (x: number, z: number) => [(x + R) * PX * k, (z + R) * PX * k] as const;
      // 宝の×
      if (g.inv.has('treasure_map') && !g.state.flag('treasure_dug')) {
        const [x, z] = P(L.treasure[0], L.treasure[1]);
        ctx.strokeStyle = '#d8332b'; ctx.lineWidth = 5; ctx.beginPath();
        ctx.moveTo(x - 9, z - 9); ctx.lineTo(x + 9, z + 9); ctx.moveTo(x + 9, z - 9); ctx.lineTo(x - 9, z + 9); ctx.stroke();
      }
      for (const n of g.npcs) {
        const [x, z] = P(n.pos.x, n.pos.z);
        ctx.fillStyle = n.state === 'Chasing' ? '#e5483b' : '#f7f2e6';
        ctx.strokeStyle = '#333'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(x, z, 6, 0, 7); ctx.fill(); ctx.stroke();
      }
      const t = g.questTarget();
      if (t) { const [x, z] = P(t.x, t.z); ctx.fillStyle = '#2aa9e0'; ctx.beginPath(); ctx.moveTo(x, z - 11); ctx.lineTo(x + 8, z); ctx.lineTo(x, z + 11); ctx.lineTo(x - 8, z); ctx.fill(); }
      const p = g.player;
      const [px, pz] = P(p.pos.x, p.pos.z);
      ctx.save(); ctx.translate(px, pz); ctx.rotate(-p.facing + Math.PI);
      ctx.fillStyle = '#c0532c'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(0, -11); ctx.lineTo(8, 8); ctx.lineTo(0, 4); ctx.lineTo(-8, 8); ctx.closePath(); ctx.stroke(); ctx.fill();
      ctx.restore();
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [g]);
  return (
    <Panel title="ちず" onClose={() => g.openPanel(null)}>
      <div className="map"><canvas ref={ref} width={528} height={528} /></div>
      <div className="legend"><span className="lg p">▲ コロ</span><span className="lg n">● ひと</span><span className="lg q">◆ もくてき</span>{g.inv.has('treasure_map') && <span className="lg x">✕ おたから</span>}</div>
    </Panel>
  );
}

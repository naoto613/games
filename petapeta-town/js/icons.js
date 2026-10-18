/* アイコン（パネル・ふきだし・アルバム用）をキャンバスで作ってキャッシュ */
'use strict';
(() => {
  const cache = new Map();
  const dpr = () => Math.min(3, Math.max(2, window.devicePixelRatio || 1));
  const mk = (size) => {
    const cv = document.createElement('canvas');
    const d = dpr();
    cv.width = cv.height = Math.round(size * d);
    const c = cv.getContext('2d');
    c.scale(d, d);
    return [cv, c];
  };
  const drawFit = (c, size, w, h, draw, pad = 0.14) => {
    const k = (size * (1 - pad * 2)) / Math.max(w, h);
    c.save();
    c.translate(size / 2, size / 2 + (h * k) / 2);
    c.scale(k, k);
    draw(c);
    c.restore();
  };
  PT.iconCache = {
    item(id, size = 96) {
      const key = 'i:' + id + ':' + size;
      if (cache.has(key)) return cache.get(key);
      const it = PT.ITEMS[id];
      const [cv, c] = mk(size);
      if (it) drawFit(c, size, it.w, it.h, (cc) => it.draw(cc, 400, { color: '#ff5d78' }));
      cache.set(key, cv);
      return cv;
    },
    char(cid, size = 96) {
      const key = 'c:' + cid + ':' + size;
      if (cache.has(key)) return cache.get(key);
      const cv = PT.charIcon(cid, size);
      cache.set(key, cv);
      return cv;
    },
    charFull(cid, size = 160, face = 'happy') {
      const key = 'cf:' + cid + ':' + size + face;
      if (cache.has(key)) return cache.get(key);
      const cv = PT.charIcon(cid, size, { full: true, face });
      cache.set(key, cv);
      return cv;
    },
    fix(type, size = 96) {
      const key = 'f:' + type + ':' + size;
      if (cache.has(key)) return cache.get(key);
      const f = PT.FIX[type];
      const [cv, c] = mk(size);
      if (f) {
        const st = { type, w: f.w, h: f.h, col: '#ff9f6b', label: 'おみせ', goods: 'food', drawing: 0 };
        if (type === 'sea') { c.fillStyle = '#4fb3ea'; PT.G.rr(c, 8, 30, size - 16, size - 50, 14); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 4; c.beginPath(); c.moveTo(14, 50); c.quadraticCurveTo(size / 2, 36, size - 14, 50); c.stroke(); }
        else if (type === 'skystar') { c.fillStyle = '#2c2f6b'; PT.G.circ(c, size / 2, size / 2, size * 0.42); c.fill(); PT.G.star(c, size / 2, size / 2, size * 0.25, size * 0.11); c.fillStyle = '#fff6b8'; c.fill(); }
        else drawFit(c, size, f.w, type === 'planet' ? 160 : f.h, (cc) => f.draw(cc, 400, st), 0.1);
      }
      cache.set(key, cv);
      return cv;
    },
    any(id, size = 96) {
      if (PT.CHARS[id]) return this.char(id, size);
      if (PT.ITEMS[id]) return this.item(id, size);
      if (PT.FIX[id]) return this.fix(id, size);
      return this.item('star', size);
    },
  };

  /* ステージのサムネイル（背景＋遊具＋キャラ） */
  PT.stageThumb = (stage, w = 400) => {
    const key = 'thumb:' + stage.id + ':' + w;
    if (cache.has(key)) return cache.get(key);
    const h = Math.round((w * 9) / 16);
    const cv = document.createElement('canvas');
    const d = dpr();
    cv.width = Math.round(w * d); cv.height = Math.round(h * d);
    const c = cv.getContext('2d');
    const s = (w / PT.W) * d;
    c.scale(s, s);
    PT._polishStage = stage.id; stage.bg(c, PT.seeded(stage.num * 977)); if (PT.polishBg) PT.polishBg(c, stage);
    const ents = [];
    stage.fixtures.forEach(([type, x, y, o]) => ents.push({ y, draw: () => { const f = PT.FIX[type]; if (f.hidden) return; c.save(); c.translate(x, y); f.draw(c, 400, Object.assign({ type, w: f.w, h: f.h }, o || {})); c.restore(); } }));
    stage.spawn.forEach(([cid, x, y]) => ents.push({ y, draw: () => PT.drawChar(c, { def: PT.CHARS[cid], cid, x, y, z: 0, pose: 'idle', poseT: 0, face: 'happy', wear: {}, seed: x, scale: 1, look: 0 }, 300) }));
    ents.sort((a, b) => a.y - b.y).forEach((e) => e.draw());
    cache.set(key, cv);
    return cv;
  };
})();

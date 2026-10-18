/* ポン！と おける たてもの（スタンプ）。いちばん したの だんの まんなかが タップした マス */
'use strict';
(() => {
  // . = そのまま、_ = くうきに する
  const L = {
    r: 'roofred', b: 'roofblue', w: 'wallwhite', k: 'wallpink', g: 'glass', d: 'door', p: 'plank', c: 'castle', s: 'star', l: 'leaves', o: 'log',
    f: 'fence', a: 'sand', i: 'brick', h: 'choco', y: 'candy', e: 'cake', q: 'cookie', x: 'rainbow', t: 'stone', W: 'water', n: 'ladder', m: 'lamp',
    F: 'flower', M: 'mushroom', G: 'grass', u: 'heart', j: 'gem', z: 'gold', S: 'snow', C: 'cloud', B: 'bounce', N: 'note',
  };
  const S = (PT.STAMPS = {});
  const add = (id, name, rows) => { S[id] = { id, name, rows, w: rows[0].length, h: rows.length }; };
  add('house', 'あかい やねの おうち', [
    '....r....',
    '...rrr...',
    '..rrrrr..',
    '.rrrrrrr.',
    'rrrrrrrrr',
    '.wwwwwww.',
    '.wg_m_gw.',
    '.w_____d.',
    '.w_____d.',
    '.ppppppp.',
  ]);
  add('pinkhouse', 'ピンクの おうち', [
    '....b....',
    '...bbb...',
    '..bbbbb..',
    '.bbbbbbb.',
    'bbbbbbbbb',
    '.kkkukkk.',
    '.kg___gk.',
    '.d_____d.',
    '.d_____d.',
    '.ppppppp.',
  ]);
  add('castle', 'おしろ', [
    '.b.......b.',
    'bbb.....bbb',
    'ccc..j..ccc',
    'cgc.ccc.cgc',
    'ccc.c_c.ccc',
    'ccccccccccc',
    'c____s____c',
    'cg_______gc',
    'd_________d',
    'd_________d',
    'czzzzzzzzzc',
  ]);
  add('candyhouse', 'おかしの いえ', [
    '....h....',
    '...hhh...',
    '..hhhhh..',
    '.hhhhhhh.',
    'yyyyyyyyy',
    '.qqqqqqq.',
    '.qg_u_gq.',
    '.q_____d.',
    '.q_____d.',
    '.eeeeeee.',
  ]);
  add('tree', 'き', [
    '.lll.',
    'lllll',
    'lllll',
    '.lll.',
    '..o..',
    '..o..',
  ]);
  add('bigtree', 'おおきな き', [
    '..lll..',
    '.lllll.',
    'lllllll',
    'lllllll',
    '.lllll.',
    '..lol..',
    '...o...',
    '...o...',
    '...o...',
  ]);
  add('tower', 'たかい とう', [
    '.r.',
    'rmr',
    'g_g',
    'i_i',
    'ini',
    'ini',
    'ini',
    'ini',
    'ini',
    'ind',
    'ind',
  ]);
  add('bridge', 'はし', [
    'f.f.f.f.f',
    'ppppppppp',
    '.o.....o.',
    '.o.....o.',
  ]);
  add('rainbowbridge', 'にじの はし', [
    '..xxxxx..',
    '.xx___xx.',
    'xx_____xx',
    'x_______x',
  ]);
  add('pyramid', 'ピラミッド', [
    '....z....',
    '...aaa...',
    '..aaaaa..',
    '.aaaaaaa.',
    'aaaaaaaaa',
  ]);
  add('pool', 'プール', [
    't_______t',
    'tWWWWWWWt',
    'tWWWWWWWt',
    'ttttttttt',
  ]);
  add('garden', 'おはなばたけ', [
    'FMFFFMF',
    'GGGGGGG',
  ]);
  add('snowman', 'ゆきだるま', [
    '.h.',
    'SSS',
    '.S.',
    'SSS',
    'SSS',
  ]);
  add('cloudisland', 'くもの しま', [
    '.F.F.',
    'GGGGG',
    'CCCCC',
    '.CCC.',
  ]);
  add('stage', 'おんがく ステージ', [
    'N.N.N.N',
    'BBBBBBB',
  ]);
  PT.STAMP_LIST = ['house', 'pinkhouse', 'castle', 'candyhouse', 'tree', 'bigtree', 'tower', 'bridge', 'rainbowbridge', 'pool', 'garden', 'pyramid', 'snowman', 'cloudisland', 'stage'];
  PT.stampCell = (ch) => (ch === '.' ? -1 : ch === '_' ? 0 : PT.BLOCK[L[ch]].code);

  /* パネル用：ちいさな ブロックで かいた え */
  PT.stampIcon = (id, size = 96) => {
    const st = S[id]; const cv = document.createElement('canvas');
    const dpr = Math.min(3, Math.max(2, window.devicePixelRatio || 1)); const px = Math.round(size * dpr); cv.width = cv.height = px;
    const c = cv.getContext('2d');
    const cell = Math.floor((px * 0.9) / Math.max(st.w, st.h));
    const ox = (px - cell * st.w) / 2, oy = (px - cell * st.h) / 2;
    st.rows.forEach((row, y) => [...row].forEach((ch, x) => {
      const code = PT.stampCell(ch); if (code <= 0) return;
      const b = PT.BLOCKS[code];
      let v = b.variants ? b.variants[0] : (x * 7 + y * 3) % 3;
      if (b.door) v = (st.rows[y + 1] && st.rows[y + 1][x] === ch) ? 'top' : 'bottom';
      c.drawImage(PT.tileImg(b, v, cell * 2), ox + x * cell, oy + y * cell, cell, cell);
    }));
    return cv;
  };
})();

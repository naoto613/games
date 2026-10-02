// ================================================================ anime bust portraits (SVG)
const PORTRAIT = {
  sieg: { skin: '#f8dfcb', skinS: '#e2b8a0', hair: '#25203a', hairL: '#4a4270', eye: '#7a52b0', style: 'long', cloth: '#26222e', clothL: '#3e3850', trim: '#7a5ab0', neck: 'v' },
  lucia: { skin: '#fde6d8', skinS: '#ecc0ac', hair: '#f2a4c0', hairL: '#ffd0e0', eye: '#2f9a68', style: 'bob', cloth: '#f8f4ff', clothL: '#ffffff', trim: '#d86a9a', neck: 'high', band: '#e8c97a', fem: 1 },
  noa: { skin: '#f9dcc4', skinS: '#e6b89c', hair: '#c8622c', hairL: '#f09050', eye: '#e09a1a', style: 'spiky', cloth: '#2a8a8a', clothL: '#40a8a8', trim: '#ffc83a', neck: 'scarf', goggles: 1, fem: 1 },
  garmo: { skin: '#e4c4ac', skinS: '#c8a088', hair: '#6a2a2a', hairL: '#8a3a3a', eye: '#ff3a3a', style: 'bald', cloth: '#4a1a4a', clothL: '#6a2a6a', trim: '#d8b05a', neck: 'robe', beard: '#6a2a2a', old: 1 },
  elder: { skin: '#f2d4bc', skinS: '#d8b098', hair: '#e8e8e8', hairL: '#ffffff', eye: '#5a5a5a', style: 'bald', cloth: '#7a6a4a', clothL: '#9a8a6a', trim: '#5a4a3a', neck: 'robe', beard: '#f0f0f0', old: 1 },
  kid: { skin: '#fbe0cc', skinS: '#e8bca4', hair: '#8a5a2a', hairL: '#b07a40', eye: '#3a6aa0', style: 'spiky', cloth: '#4a8ad8', clothL: '#6aa8f0', trim: '#ffffff', neck: 'v', kid: 1 },
  woman: { skin: '#f8dcc8', skinS: '#e4b8a0', hair: '#6a3a2a', hairL: '#8a5a40', eye: '#6a4a2a', style: 'bob', cloth: '#e8d8b0', clothL: '#f8ecd0', trim: '#9a4a3a', neck: 'high', fem: 1 },
  merchant: { skin: '#f0c8a8', skinS: '#d4a488', hair: '#3a2a1a', hairL: '#5a4030', eye: '#3a2a1a', style: 'short', cloth: '#3a7a5a', clothL: '#4a9a70', trim: '#d8b05a', neck: 'v', beard: '#3a2a1a' },
  knight: { skin: '#f8dfcb', skinS: '#e2b8a0', hair: '#d8c070', hairL: '#f8e8a0', eye: '#3a5aa0', style: 'short', cloth: '#d8dce8', clothL: '#ffffff', trim: '#3a5ad0', neck: 'high' },
  assassin: { skin: '#d8b8a8', skinS: '#b8988a', hair: '#2a1a1a', hairL: '#4a2a2a', eye: '#ff2020', style: 'hood', cloth: '#2a1a24', clothL: '#3a2434', trim: '#8a1a1a', neck: 'scarf' },
  chef: { skin: '#f8dcc8', skinS: '#e2b8a0', hair: '#ffffff', hairL: '#ffffff', eye: '#3a2a1a', style: 'chef', cloth: '#ffffff', clothL: '#ffffff', trim: '#d83a3a', neck: 'scarf', beard: '#5a3a2a' },
};
function portrait(id, ex = 'normal', flip) {
  const P = PORTRAIT[id]; if (!P) return '';
  const u = 'p' + id + Math.random().toString(36).slice(2, 7);
  const kid = P.kid ? 1 : 0;
  let s = `<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg"${flip ? ' style="transform:scaleX(-1)"' : ''}><defs>
<linearGradient id="${u}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.hairL}"/><stop offset=".5" stop-color="${P.hair}"/></linearGradient>
<radialGradient id="${u}e" cx=".5" cy=".7" r=".7"><stop offset="0" stop-color="${P.eye}" stop-opacity=".55"/><stop offset=".55" stop-color="${P.eye}"/><stop offset="1" stop-color="#140c1c"/></radialGradient>
<linearGradient id="${u}c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P.clothL}"/><stop offset="1" stop-color="${P.cloth}"/></linearGradient></defs>`;
  const st = P.style;
  // back hair
  if (st === 'long') s += `<path d="M56,92 C46,52 72,32 100,32 C128,32 154,52 144,92 L152,170 L160,236 L40,236 L48,170 Z" fill="url(#${u}h)"/>`;
  else if (st === 'bob') s += `<path d="M54,98 C48,54 74,34 100,34 C126,34 152,54 146,98 L150,152 Q136,166 126,146 L74,146 Q64,166 50,152 Z" fill="url(#${u}h)"/>`;
  else if (st === 'spiky') s += `<path d="M58,104 L44,84 L60,78 L50,52 L72,58 L76,32 L94,46 L110,26 L118,48 L140,36 L136,60 L158,62 L142,84 L156,100 L140,104 Z" fill="url(#${u}h)"/>`;
  else if (st === 'hood') s += `<path d="M44,240 L46,120 C44,50 76,26 100,26 C124,26 156,50 154,120 L156,240 Z" fill="#2a1a24"/><path d="M58,120 C56,60 80,40 100,40 C120,40 144,60 142,120" fill="#140a12"/>`;
  else if (st === 'short') s += `<path d="M60,100 C54,56 76,38 100,38 C124,38 146,56 140,100 Z" fill="url(#${u}h)"/>`;
  // body
  const sh = kid ? 'M44,240 C48,206 70,194 90,190 L110,190 C130,194 152,206 156,240 Z' : 'M22,240 C26,200 56,184 86,178 L114,178 C144,184 174,200 178,240 Z';
  s += `<path d="M88,150 L88,186 Q100,194 112,186 L112,150 Z" fill="${P.skinS}"/>`;
  s += `<path d="${sh}" fill="url(#${u}c)"/>`;
  if (P.neck === 'v') s += `<path d="M86,178 L100,${kid ? 214 : 222} L114,178 Z" fill="${P.skin}"/><path d="M80,180 L100,${kid ? 216 : 226} L120,180" fill="none" stroke="${P.trim}" stroke-width="5"/><path d="M60,196 L74,240 M140,196 L126,240" stroke="${P.trim}" stroke-width="3"/>`;
  if (P.neck === 'high') s += `<path d="M84,166 L84,188 Q100,198 116,188 L116,166 Q100,172 84,166Z" fill="${P.clothL}" stroke="${P.trim}" stroke-width="3"/><circle cx="100" cy="206" r="7" fill="${P.trim}" stroke="#e8c97a" stroke-width="2"/><path d="M40,214 Q100,234 160,214" stroke="${P.trim}" stroke-width="4" fill="none"/>`;
  if (P.neck === 'scarf') s += `<path d="M76,176 Q100,196 124,176 L130,192 Q100,212 70,192 Z" fill="${P.trim}"/><path d="M108,196 L118,240 L132,236 L120,192 Z" fill="${P.trim}"/>`;
  if (P.neck === 'robe') s += `<path d="M84,176 L100,240 L116,176" fill="none" stroke="${P.trim}" stroke-width="5"/>`;
  // face
  const fy = kid ? 6 : 0;
  s += `<g transform="translate(0,${fy})">`;
  s += `<path d="M64,98 C62,140 82,168 100,173 C118,168 138,140 136,98 C136,62 64,62 64,98 Z" fill="${P.skin}"/>`;
  s += `<path d="M66,118 C70,150 86,166 100,170 C88,160 76,140 72,118Z" fill="${P.skinS}" opacity=".5"/>`;
  s += `<ellipse cx="64" cy="122" rx="6" ry="10" fill="${P.skin}"/><ellipse cx="136" cy="122" rx="6" ry="10" fill="${P.skin}"/>`;
  // eyes
  const eye = (m) => {
    const T = m ? 'transform="translate(200,0) scale(-1,1)"' : '';
    let e = `<g ${T}>`;
    if (ex === 'happy' || ex === 'laugh') e += `<path d="M72,122 Q83,111 95,121" fill="none" stroke="#1a1020" stroke-width="3.5" stroke-linecap="round"/>`;
    else if (ex === 'closed') e += `<path d="M72,120 Q83,126 95,120" fill="none" stroke="#1a1020" stroke-width="3" stroke-linecap="round"/>`;
    else {
      const half = ex === 'smirk' || ex === 'tired', sur = ex === 'surprise', ang = ex === 'angry';
      const top = half ? 116 : ang ? 113 : 109;
      e += `<path d="M71,118 Q83,${top - 2} 96,${top + 4} Q93,130 83,131 Q74,129 71,118Z" fill="#fff"/>`;
      e += `<clipPath id="${u}k${m}"><path d="M71,118 Q83,${top - 2} 96,${top + 4} Q93,130 83,131 Q74,129 71,118Z"/></clipPath>`;
      e += `<g clip-path="url(#${u}k${m})"><ellipse cx="84" cy="121" rx="${sur ? 5.5 : 7.5}" ry="${sur ? 7.5 : 10}" fill="url(#${u}e)"/><ellipse cx="84" cy="122" rx="${sur ? 2.5 : 3.5}" ry="${sur ? 3.5 : 5}" fill="#120a18"/>`;
      e += `<circle cx="81" cy="116" r="${sur ? 2 : 3}" fill="#fff"/><circle cx="87" cy="126" r="1.4" fill="#fff" opacity=".8"/>`;
      if (P.old) e += `<rect x="60" y="100" width="40" height="${half ? 18 : 12}" fill="${P.skin}"/>`;
      e += `</g>`;
      e += `<path d="M68,${top + 9} Q82,${top - 4} 98,${top + 4}" fill="none" stroke="#1a1020" stroke-width="${P.fem ? 4 : 3.4}" stroke-linecap="round"/>`;
      if (P.fem) e += `<path d="M68,${top + 9} L64,${top + 6}" stroke="#1a1020" stroke-width="2.5" stroke-linecap="round"/>`;
      if (P.old) e += `<path d="M72,132 Q83,135 94,131" fill="none" stroke="${P.skinS}" stroke-width="1.5"/>`;
    }
    // brows
    const bw = { normal: 'M72,103 Q84,98 95,102', angry: 'M72,98 Q85,101 96,108', sad: 'M72,105 Q84,100 95,96', surprise: 'M72,98 Q84,92 95,96', smirk: 'M72,104 Q84,100 95,103', happy: 'M72,102 Q84,96 95,100', laugh: 'M72,102 Q84,96 95,100', tired: 'M72,106 Q84,103 95,103', closed: 'M72,104 Q84,100 95,102' }[ex] || 'M72,103 Q84,98 95,102';
    e += `<path d="${bw}" fill="none" stroke="${P.style === 'bald' ? P.beard || P.hair : P.hair}" stroke-width="${P.old ? 4 : 2.6}" stroke-linecap="round" filter="brightness(.6)"/>`;
    return e + '</g>';
  };
  s += eye(0) + eye(1);
  if (P.style === 'hood' || id === 'garmo') s += `<circle cx="84" cy="121" r="9" fill="#ff2020" opacity=".25"/><circle cx="116" cy="121" r="9" fill="#ff2020" opacity=".25"/>`;
  // nose + mouth
  s += `<path d="M100,134 L98,142 L101,143" fill="none" stroke="${P.skinS}" stroke-width="1.6" stroke-linecap="round"/>`;
  const mouth = {
    normal: `<path d="M94,154 Q100,156 106,154" fill="none" stroke="#7a3a3a" stroke-width="2" stroke-linecap="round"/>`,
    smile: `<path d="M92,151 Q100,160 108,151 Q100,155 92,151Z" fill="#a03a4a" stroke="#7a2a3a" stroke-width="1.2"/>`,
    happy: `<path d="M90,150 Q100,164 110,150 Q100,154 90,150Z" fill="#a03a4a" stroke="#7a2a3a" stroke-width="1.2"/>`,
    laugh: `<path d="M88,149 Q100,168 112,149 Q100,153 88,149Z" fill="#8a2a3a"/><path d="M92,159 Q100,165 108,159" fill="#ff8a9a"/>`,
    angry: `<path d="M92,155 L108,152" stroke="#7a3a3a" stroke-width="2.5" stroke-linecap="round"/><path d="M94,154 L106,152" stroke="#fff" stroke-width="1"/>`,
    surprise: `<ellipse cx="100" cy="155" rx="4.5" ry="6" fill="#8a2a3a"/>`,
    sad: `<path d="M94,157 Q100,152 106,157" fill="none" stroke="#7a3a3a" stroke-width="2" stroke-linecap="round"/>`,
    smirk: `<path d="M92,155 Q102,157 109,150" fill="none" stroke="#7a3a3a" stroke-width="2.2" stroke-linecap="round"/>`,
    tired: `<path d="M94,155 L106,155" stroke="#7a3a3a" stroke-width="2" stroke-linecap="round"/>`,
    closed: `<path d="M94,154 Q100,157 106,154" fill="none" stroke="#7a3a3a" stroke-width="2" stroke-linecap="round"/>`,
  }[ex] || '';
  s += mouth;
  if (P.fem && (ex === 'happy' || ex === 'smile' || ex === 'laugh' || ex === 'sad')) s += `<ellipse cx="78" cy="140" rx="8" ry="4" fill="#ff8aa0" opacity=".35"/><ellipse cx="122" cy="140" rx="8" ry="4" fill="#ff8aa0" opacity=".35"/>`;
  if (ex === 'angry') s += `<path d="M126,90 l6,-4 m-3,8 l7,-1 m-8,-10 l1,-7" stroke="#d02a2a" stroke-width="2.5" stroke-linecap="round"/>`;
  if (ex === 'tired' || ex === 'sweat') s += `<path d="M138,100 q4,8 0,12 q-4,-4 0,-12z" fill="#8ad0ff" stroke="#3a7ab0" stroke-width="1"/>`;
  if (P.beard) s += `<path d="M74,146 Q78,184 100,192 Q122,184 126,146 Q114,162 100,162 Q86,162 74,146Z" fill="${P.beard}"/><path d="M90,150 Q100,146 110,150" stroke="${P.beard}" stroke-width="5" fill="none"/>` + (ex === 'laugh' || ex === 'happy' || ex === 'surprise' ? `<ellipse cx="100" cy="158" rx="6" ry="4" fill="#5a1a2a"/>` : '');
  // front hair
  if (st === 'long') s += `<path d="M62,104 C56,56 80,38 100,38 C122,38 146,56 138,104 L132,82 L128,108 L118,76 L112,102 L103,70 L95,104 L86,74 L79,108 L72,82 L66,112 Z" fill="url(#${u}h)"/><path d="M64,90 L52,186 L62,166 L58,214 L74,150 L72,108Z" fill="url(#${u}h)"/><path d="M136,90 L148,186 L138,166 L142,214 L126,150 L128,108Z" fill="url(#${u}h)"/><path d="M84,52 Q100,44 118,52" stroke="${P.hairL}" stroke-width="4" fill="none" opacity=".7"/>`;
  else if (st === 'bob') s += `<path d="M60,108 C56,58 80,40 100,40 C120,40 144,58 140,108 L132,92 L127,112 L116,86 L108,106 L99,84 L91,108 L82,86 L74,110 L68,92 Z" fill="url(#${u}h)"/><path d="M60,96 Q52,140 58,160 L72,150 L70,110Z" fill="url(#${u}h)"/><path d="M140,96 Q148,140 142,160 L128,150 L130,110Z" fill="url(#${u}h)"/><path d="M82,54 Q100,46 120,54" stroke="#fff" stroke-width="4" fill="none" opacity=".45"/>`;
  else if (st === 'spiky') s += `<path d="M60,110 L62,74 C70,48 86,42 100,42 C120,42 136,52 140,74 L142,112 L132,92 L128,110 L118,86 L110,106 L100,82 L92,108 L84,88 L76,110 L70,92 Z" fill="url(#${u}h)"/>`;
  else if (st === 'short') s += `<path d="M62,104 C58,60 80,42 100,42 C122,42 144,60 138,104 L130,86 L122,98 L112,80 L100,94 L88,80 L78,98 L70,86 Z" fill="url(#${u}h)"/>`;
  else if (st === 'bald') s += `<path d="M64,100 C62,60 80,46 100,46 C120,46 138,60 136,100 C130,80 120,70 100,70 C80,70 70,80 64,100Z" fill="${P.skin}"/><path d="M64,104 Q60,86 68,80 L70,104Z M136,104 Q140,86 132,80 L130,104Z" fill="${P.hair}"/><path d="M84,58 Q100,52 116,58" stroke="#fff" stroke-width="3" fill="none" opacity=".4"/>`;
  else if (st === 'hood') s += `<path d="M58,118 C56,64 78,46 100,46 C122,46 144,64 142,118 C136,84 120,74 100,74 C80,74 64,84 58,118Z" fill="#2a1a24"/><path d="M70,150 Q100,170 130,150 L130,175 Q100,190 70,175Z" fill="#8a1a1a"/>`;
  else if (st === 'chef') s += `<path d="M64,96 C60,70 80,58 100,58 C120,58 140,70 136,96Z" fill="#fff" stroke="#ddd"/><path d="M62,70 C50,40 76,20 92,32 C100,10 128,16 126,36 C150,30 156,62 138,72 Z" fill="#fff" stroke="#ddd" stroke-width="2"/>`;
  if (P.goggles) s += `<g><circle cx="82" cy="70" r="13" fill="#9ae0ff" stroke="#8a6a3a" stroke-width="5"/><circle cx="118" cy="70" r="13" fill="#9ae0ff" stroke="#8a6a3a" stroke-width="5"/><rect x="92" y="66" width="16" height="6" fill="#8a6a3a"/><circle cx="78" cy="66" r="3.5" fill="#fff"/><circle cx="114" cy="66" r="3.5" fill="#fff"/></g>`;
  if (P.band) s += `<path d="M62,78 Q100,52 138,78" fill="none" stroke="${P.band}" stroke-width="4"/><path d="M100,58 l5,-8 l5,8 l-5,6z" fill="#7ad0ff" stroke="${P.band}" stroke-width="2" transform="translate(-5,0)"/>`;
  s += '</g></svg>';
  return s;
}

// ================= characters (drawn at the origin = feet) =================
const BODY={
  kid:{hr:12.5,hy:-34,sy:-23,hip:-11,arm:10},
  adult:{hr:11.5,hy:-50,sy:-38,hip:-19,arm:15},
  elder:{hr:11.5,hy:-46,sy:-35,hip:-17,arm:13}
};
// o: {age, fem, skin, hair, hairCol, top, topCol, botCol, shoe, hat, hatCol, acc:{glasses,balloon,...}, pose, swim, s}
function drawPerson(c,o){
  const B=BODY[o.age||'adult'],hr=B.hr,hy=B.hy,sy=B.sy,hip=B.hip;
  const top=o.top||'shirt',tc=o.topCol||'#e8504a',bc=o.botCol||'#4d5a78',sk=o.skin||SKIN;
  const A=o.acc||{};
  c.save();ink(c,1.6);
  if(o.s)c.scale(o.s,o.s);
  if(o.swim){c.translate(0,-hip+3);c.save();c.beginPath();c.rect(-60,-140,120,140+hip-3);c.clip()}
  // ---- back layer ----
  if(A.balloon){c.lineWidth=1;line(c,9,sy+6,16,hy-34);c.lineWidth=1.6;ell(c,16,hy-42,8,9.5);FS(c,A.balloon);ell(c,13.5,hy-45,2,3,-.4);F(c,'rgba(255,255,255,.7)')}
  if(top==='astro'||top==='diver'){rr(c,-11,sy-1,22,hip-sy+4,5);FS(c,top==='astro'?'#d8dde4':'#f2b233')}
  if(A.backpack){rr(c,-10,sy,20,hip-sy+1,5);FS(c,A.backpack)}
  if(top==='princess'||top==='knight'){c.beginPath();c.moveTo(-8,sy);c.lineTo(8,sy);c.lineTo(13,-3);c.lineTo(-13,-3);c.closePath();FS(c,top==='knight'?'#c9433a':shade(tc,-.15))}
  // back hair
  const hc=o.hairCol||HAIR,hs=o.hair||'short';
  if(hs==='long'||hs==='pattsun'){rr(c,-hr-1.5,hy-4,2*hr+3,hr+10,6);FS(c,hc)}
  if(hs==='bob'){c.beginPath();c.moveTo(-hr-1.5,hy);c.bezierCurveTo(-hr-2,hy-hr*1.7,hr+2,hy-hr*1.7,hr+1.5,hy);c.quadraticCurveTo(hr+3,hy+8,hr,hy+11);c.quadraticCurveTo(0,hy+13,-hr,hy+11);c.quadraticCurveTo(-hr-3,hy+8,-hr-1.5,hy);c.closePath();FS(c,hc)}
  if(hs==='pony'){ell(c,hr+1,hy+5,4.5,8,-.4);FS(c,hc)}
  if(hs==='twin'){ell(c,-hr-3,hy+4,4.5,7.5,.4);FS(c,hc);ell(c,hr+3,hy+4,4.5,7.5,-.4);FS(c,hc)}
  // ---- legs ----
  const legC=o.legCol||(top==='astro'?'#eef1f5':top==='diver'?'#2c3a4e':top==='knight'?'#aab1bb':(o.fem&&!o.pants)||top==='swim'?sk:bc);
  const spread=o.pose==='walk'?3:0;
  for(const k of[-1,1]){rr(c,k*3.4-2.6+k*spread*.5,hip-1,5.2,-hip-1.5,2.4);FS(c,legC)}
  const shoe=o.shoe||'#5b4236';
  for(const k of[-1,1]){ell(c,k*3.6+k*spread*.5,-1.6,3.8,2.4);FS(c,top==='diver'?'#2f6fd0':shoe)}
  // ---- bottom & top ----
  const sw=o.age==='kid'?9:10;
  switch(top){
  case 'smock':
    c.beginPath();c.moveTo(-sw+1,sy);c.lineTo(sw-1,sy);c.quadraticCurveTo(sw+4,hip,sw+3.5,hip+4);c.lineTo(-sw-3.5,hip+4);c.quadraticCurveTo(-sw-4,hip,-sw+1,sy);c.closePath();FS(c,tc);
    c.beginPath();c.moveTo(-5,sy+.5);c.quadraticCurveTo(0,sy+6,5,sy+.5);c.closePath();FS(c,'#fff');
    for(let i=0;i<2;i++){circ(c,0,sy+7+i*5,1.1);F(c,'#fff')}break;
  case 'dress':case 'princess':{const lo=top==='princess'?-3:hip+5;
    c.beginPath();c.moveTo(-7,sy);c.lineTo(7,sy);c.quadraticCurveTo(10,hip,sw+5,lo);c.lineTo(-sw-5,lo);c.quadraticCurveTo(-10,hip,-7,sy);c.closePath();FS(c,tc);
    if(o.apron){rr(c,-6,sy+5,12,lo-sy-6,3);FS(c,'#fff')}
    if(top==='princess'){c.lineWidth=1;for(let i=0;i<3;i++){c.beginPath();c.moveTo(-sw-4+i*2,lo-4-i*5);c.quadraticCurveTo(0,lo-1-i*5,sw+4-i*2,lo-4-i*5);c.stroke()}c.lineWidth=1.6}break}
  case 'yukata':
    c.beginPath();c.moveTo(-8,sy);c.lineTo(8,sy);c.lineTo(9,-4);c.lineTo(-9,-4);c.closePath();FS(c,tc);
    c.fillStyle='rgba(255,255,255,.75)';for(let i=0;i<5;i++){circ(c,-5+(i%3)*5,sy+6+Math.floor(i/3)*9+(i%2)*3,1.6);c.fill()}
    rr(c,-8.5,hip-6,17,5,1.5);FS(c,o.obi||'#f6c63a');
    c.beginPath();c.moveTo(-4,sy);c.lineTo(0,sy+7);c.lineTo(4,sy);c.stroke();break;
  case 'swim':
    rr(c,-8,sy,16,hip-sy+1,5);FS(c,sk);
    if(o.fem){rr(c,-8,sy+3,16,hip-sy-2,4);FS(c,tc)}else{rr(c,-8,hip-5,16,7,2.5);FS(c,tc)}
    if(A.ring){ell(c,0,hip-3,14,5);c.lineWidth=5;c.strokeStyle=LN;c.stroke();c.lineWidth=3.2;c.strokeStyle=A.ring;c.stroke();ink(c)}break;
  case 'astro':
    rr(c,-10,sy-1,20,hip-sy+4,7);FS(c,'#f4f6fa');rr(c,-5,sy+4,10,6,2);FS(c,tc);break;
  case 'diver':
    rr(c,-9,sy,18,hip-sy+3,6);FS(c,'#2c3a4e');rr(c,-9,sy+5,18,3,1);F(c,tc);break;
  case 'knight':
    rr(c,-10,sy,20,hip-sy+3,5);FS(c,'#c3c8cf');c.beginPath();c.moveTo(0,sy+2);c.lineTo(0,hip);c.stroke();
    rr(c,-6,sy+4,12,8,3);FS(c,tc);break;
  case 'ski':
    rr(c,-8.5,hip-3,17,6,2);FS(c,bc);rr(c,-sw-.5,sy-1,2*sw+1,hip-sy+3,7);FS(c,tc);c.lineWidth=1;line(c,0,sy+1,0,hip);c.lineWidth=1.6;break;
  case 'happi':
    rr(c,-8.5,hip-3,17,6,2);FS(c,bc);rr(c,-sw,sy,2*sw,hip-sy+3,4);FS(c,tc);rr(c,-4,sy,8,hip-sy+2,2);FS(c,'#fff');
    rr(c,-sw,hip-4,2*sw,4,1);F(c,'#fff');break;
  case 'coat':
    rr(c,-sw,sy,2*sw,hip-sy+9,5);FS(c,tc);c.lineWidth=1;line(c,0,sy+1,0,hip+8);for(let i=0;i<3;i++){circ(c,2.5,sy+5+i*5,.9);F(c,LN)}c.lineWidth=1.6;break;
  case 'safari':
    rr(c,-8.5,hip-3,17,7,2);FS(c,'#c8b07a');rr(c,-sw,sy,2*sw,hip-sy+2,4);FS(c,tc);c.lineWidth=1;line(c,0,sy+1,0,hip-1);rr(c,-7,sy+4,5,4,1);c.stroke();c.lineWidth=1.6;break;
  default: // shirt
    if(o.fem&&!o.pants){c.beginPath();c.moveTo(-8,hip-3);c.lineTo(8,hip-3);c.lineTo(11,hip+5);c.lineTo(-11,hip+5);c.closePath();FS(c,bc)}
    else{rr(c,-8.5,hip-3,17,7,2);FS(c,bc)}
    rr(c,-sw,sy,2*sw,hip-sy+1,5);FS(c,tc);
    if(o.stripe){c.save();rr(c,-sw,sy,2*sw,hip-sy+1,5);c.clip();c.fillStyle=o.stripe;for(let y=sy+3;y<hip;y+=5)c.fillRect(-sw,y,2*sw,2.2);c.restore();rr(c,-sw,sy,2*sw,hip-sy+1,5);c.stroke()}
  }
  if(A.scarf){rr(c,-8,sy-2,16,5,2.5);FS(c,A.scarf);rr(c,2,sy+1,4.5,9,2);FS(c,A.scarf)}
  if(A.bag){c.lineWidth=1.2;line(c,-6,sy,8,hip-2);c.lineWidth=1.6;rr(c,5,hip-5,9,8,2);FS(c,A.bag)}
  // ---- arms ----
  const armC=top==='swim'?sk:top==='astro'?'#f4f6fa':top==='diver'?'#2c3a4e':top==='knight'?'#c3c8cf':top==='yukata'||top==='happi'||top==='smock'||top==='ski'||top==='coat'||top==='princess'?tc:(o.short?sk:tc);
  const arm=(k,hx,hy2)=>{c.lineWidth=5.2;c.strokeStyle=LN;line(c,k*(sw-2),sy+3,hx,hy2);c.lineWidth=3;c.strokeStyle=armC;line(c,k*(sw-2),sy+3,hx,hy2);ink(c);circ(c,hx,hy2,2.4);FS(c,top==='astro'||top==='ski'?'#f4f6fa':top==='knight'?'#aab1bb':sk)};
  const ay=sy+B.arm;
  if(o.pose==='wave'||A.balloon||A.flag)arm(1,sw+5,sy-9);else arm(1,sw+2,ay);
  if(o.pose==='cheer')arm(-1,-sw-5,sy-9);else arm(-1,-sw-2,ay);
  if(A.flag){c.lineWidth=1.2;line(c,sw+5,sy-6,sw+5,sy-30);c.lineWidth=1.6;poly(c,[[sw+5,sy-30],[sw+17,sy-26],[sw+5,sy-22]]);FS(c,A.flag)}
  if(A.ice){poly(c,[[-sw-5,ay-2],[-sw+1,ay-2],[-sw-2,ay+6]]);FS(c,'#e8b46a');circ(c,-sw-2,ay-4,3.6);FS(c,A.ice)}
  if(A.cotton){c.lineWidth=1.2;line(c,-sw-2,ay,-sw-2,ay-12);c.lineWidth=1.6;circ(c,-sw-2,ay-16,6.5);FS(c,'#ffd3e6')}
  if(A.fan){ell(c,-sw-4,ay-6,6,6);FS(c,A.fan);line(c,-sw-2,ay,-sw-4,ay-2)}
  if(A.camera){rr(c,-6,sy+6,12,8,2);FS(c,'#3b3533');circ(c,0,sy+10,2.5);FS(c,'#9fd0ea')}
  if(A.parasol){c.lineWidth=1.3;line(c,sw+2,ay,sw+4,hy-hr-6);c.lineWidth=1.6;c.beginPath();c.moveTo(sw+4-20,hy-hr-2);c.quadraticCurveTo(sw+4,hy-hr-24,sw+24,hy-hr-2);c.closePath();FS(c,A.parasol)}
  if(A.net){c.lineWidth=1.3;line(c,sw+2,ay,sw+12,sy-18);c.lineWidth=1.6;circ(c,sw+14,sy-22,5);c.fillStyle='rgba(255,255,255,.6)';c.fill();c.stroke()}
  if(A.sword){c.lineWidth=2.4;line(c,sw+2,ay,sw+6,sy-16);ink(c)}
  // ---- head ----
  if(hs==='bun'){circ(c,0,hy-hr-2,5);FS(c,hc)}
  circ(c,0,hy,hr);FS(c,sk);
  // face
  const ey=hy+2.5;
  if(top==='diver'||o.mask){rr(c,-hr+1,ey-6,2*hr-2,9,4);FS(c,'#bfe6f5');c.lineWidth=2.2;line(c,hr-1,ey-2,hr+4,hy-hr-2);ink(c)}
  if(o.age==='elder'&&!o.openEyes){c.lineWidth=1.5;for(const k of[-1,1]){c.beginPath();c.arc(k*4.6,ey+.5,2.2,Math.PI*1.1,Math.PI*1.9);c.stroke()}c.lineWidth=1.6}
  else if(o.happy){c.lineWidth=1.7;for(const k of[-1,1]){c.beginPath();c.arc(k*4.6,ey+1,2.4,Math.PI*1.1,Math.PI*1.9);c.stroke()}c.lineWidth=1.6}
  else{for(const k of[-1,1]){ell(c,k*4.6,ey,1.9,2.4);F(c,'#2a1c1c');circ(c,k*4.6-.6,ey-.9,.7);F(c,'#fff')}}
  ell(c,-8,ey+4,2.3,1.4);F(c,'rgba(255,110,140,.4)');ell(c,8,ey+4,2.3,1.4);F(c,'rgba(255,110,140,.4)');
  c.lineWidth=1.3;c.beginPath();c.arc(0,ey+4.2,2.2,Math.PI*.15,Math.PI*.85);c.stroke();c.lineWidth=1.6;
  if(A.mustache){ell(c,-2.5,ey+3.5,3,1.4,.2);F(c,hc);ell(c,2.5,ey+3.5,3,1.4,-.2);F(c,hc)}
  if(A.glasses){c.lineWidth=1.2;circ(c,-4.6,ey,3.4);c.stroke();circ(c,4.6,ey,3.4);c.stroke();line(c,-1.2,ey,1.2,ey);c.lineWidth=1.6}
  // front hair
  c.fillStyle=hc;
  switch(hs){
  case 'bald':c.beginPath();c.arc(0,hy,hr,Math.PI*.95,Math.PI*1.05);c.stroke();ell(c,-hr+1,hy+1,2.6,4);FS(c,hc);ell(c,hr-1,hy+1,2.6,4);FS(c,hc);break;
  case 'spiky':c.beginPath();c.moveTo(-hr-1,hy+1);for(let i=0;i<=6;i++){const a=Math.PI+i/6*Math.PI;c.lineTo(Math.cos(a)*(hr+(i%2?5:1)),hy+Math.sin(a)*(hr+(i%2?5:1)))}c.lineTo(hr+1,hy+1);c.quadraticCurveTo(0,hy-6,-hr-1,hy+1);c.closePath();FS(c,hc);break;
  case 'curly':for(let i=0;i<7;i++){const a=Math.PI*(1.02+i*.16);circ(c,Math.cos(a)*hr,hy+Math.sin(a)*hr,4.2);FS(c,hc)}break;
  case 'bob':case 'pattsun':
    c.beginPath();c.moveTo(-hr-1,hy+4);c.quadraticCurveTo(-hr-1.5,hy-hr-1,0,hy-hr-1);c.quadraticCurveTo(hr+1.5,hy-hr-1,hr+1,hy+4);c.lineTo(hr-2,hy-2);
    for(let i=0;i<=6;i++)c.lineTo(hr-3-i*((2*hr-6)/6),hy-3.5+(i%2?1.4:0));c.lineTo(-hr+2,hy-2);c.closePath();FS(c,hc);break;
  default: // short, long, pony, twin, bun
    c.beginPath();c.moveTo(-hr-.5,hy+2);c.quadraticCurveTo(-hr-1,hy-hr-1.5,0,hy-hr-1);c.quadraticCurveTo(hr+1,hy-hr-1.5,hr+.5,hy+2);c.quadraticCurveTo(hr-3,hy-5,3,hy-6);c.quadraticCurveTo(-1,hy-3,-4,hy-6.5);c.quadraticCurveTo(-hr+2,hy-5,-hr-.5,hy+2);c.closePath();FS(c,hc);
    if(hs==='twin'||hs==='pony'){circ(c,hs==='twin'?-hr+1:hr-1,hy-4,2);F(c,o.ribbon||'#f28fb7')}
  }
  // hats
  const hcol=o.hatCol||'#e8504a';
  switch(o.hat){
  case 'yochien':ell(c,0,hy-4,hr+5,4.2);FS(c,hcol);c.beginPath();c.arc(0,hy-5,hr-.5,Math.PI,0);c.closePath();FS(c,hcol);c.lineWidth=1;c.beginPath();c.moveTo(-hr+.5,hy-3);c.quadraticCurveTo(0,hy+hr+3,hr-.5,hy-3);c.stroke();c.lineWidth=1.6;break;
  case 'cap':c.beginPath();c.arc(0,hy-4,hr,Math.PI,0);c.closePath();FS(c,hcol);ell(c,hr-1,hy-4,7,2.4,-.1);FS(c,hcol);break;
  case 'straw':ell(c,0,hy-6,hr+7,4);FS(c,'#ecd08a');c.beginPath();c.arc(0,hy-7,hr-2,Math.PI,0);c.closePath();FS(c,'#ecd08a');rr(c,-hr+2,hy-9,2*hr-4,3,1);F(c,hcol);break;
  case 'sunhat':ell(c,0,hy-5,hr+9,4.5);FS(c,hcol);c.beginPath();c.arc(0,hy-6,hr-2,Math.PI,0);c.closePath();FS(c,hcol);break;
  case 'beanie':c.beginPath();c.arc(0,hy-3,hr+.5,Math.PI,0);c.closePath();FS(c,hcol);rr(c,-hr-1,hy-5,2*hr+2,4.5,2);FS(c,shade(hcol,-.15));circ(c,0,hy-hr-4,3.2);FS(c,'#fff');break;
  case 'hachimaki':rr(c,-hr,hy-7,2*hr,3.6,1.5);FS(c,hcol);break;
  case 'crown':poly(c,[[-7,hy-hr+2],[-7,hy-hr-7],[-3.5,hy-hr-3],[0,hy-hr-9],[3.5,hy-hr-3],[7,hy-hr-7],[7,hy-hr+2]]);FS(c,'#f6c63a');break;
  case 'tiara':poly(c,[[-6,hy-hr+3],[-3,hy-hr-2],[0,hy-hr-5],[3,hy-hr-2],[6,hy-hr+3]]);FS(c,'#f6e27a');circ(c,0,hy-hr-1,1.4);F(c,hcol);break;
  case 'party':poly(c,[[-6,hy-hr+3],[6,hy-hr+3],[1,hy-hr-12]]);FS(c,hcol);circ(c,1,hy-hr-12,2);FS(c,'#fff');break;
  case 'safari':ell(c,0,hy-5,hr+6,3.6);FS(c,'#d9c08a');c.beginPath();c.arc(0,hy-6,hr-1,Math.PI,0);c.closePath();FS(c,'#d9c08a');rr(c,-hr+1,hy-8,2*hr-2,2.5,1);F(c,'#8a6a3a');break;
  case 'knight':c.beginPath();c.arc(0,hy-1,hr+1.5,Math.PI*.9,Math.PI*2.1);c.closePath();FS(c,'#c3c8cf');rr(c,-hr+2,hy-2,2*hr-4,3,1);F(c,'#3b3533');ell(c,0,hy-hr-6,3,6,.3);FS(c,hcol);break;
  case 'witch':ell(c,0,hy-6,hr+8,3.6);FS(c,hcol);poly(c,[[-hr+1,hy-7],[hr-1,hy-7],[5,hy-hr-18]]);FS(c,hcol);break;
  case 'chef':rr(c,-hr+2,hy-hr-9,2*hr-4,12,5);FS(c,'#fff');break;
  case 'beret':ell(c,-2,hy-hr+1,hr+1,4.5,-.15);FS(c,hcol);break;
  case 'goggle':c.beginPath();c.arc(0,hy-3,hr+.5,Math.PI,0);c.closePath();FS(c,hcol);rr(c,-8,hy-hr+3,16,5,2.5);FS(c,'#9fd0ea');break;
  case 'bow':heart(c,hr-3,hy-hr+2,3.4);FS(c,hcol);break;
  case 'flower':for(let i=0;i<5;i++){circ(c,hr-3+Math.cos(i*1.26)*2.6,hy-hr+3+Math.sin(i*1.26)*2.6,1.9);FS(c,hcol)}circ(c,hr-3,hy-hr+3,1.4);F(c,'#f6c63a');break;
  case 'antenna':for(const k of[-1,1]){c.lineWidth=1.3;line(c,k*4,hy-hr+1,k*8,hy-hr-10);ink(c);circ(c,k*8,hy-hr-11,2.4);FS(c,hcol)}break;
  case 'mermaid':for(let i=0;i<3;i++){poly(c,[[-5+i*5,hy-hr+3],[-3+i*5,hy-hr-3],[-1+i*5,hy-hr+3]]);FS(c,'#f7d8e6')}break;
  }
  if(top==='astro'||o.helmet){circ(c,0,hy,hr+5);c.fillStyle='rgba(190,225,255,.35)';c.fill();c.lineWidth=2.4;c.strokeStyle='#eef1f5';c.stroke();ink(c);c.stroke();ell(c,-6,hy-7,3,5,.6);F(c,'rgba(255,255,255,.75)')}
  if(o.swim){c.restore();c.lineWidth=1.4;c.strokeStyle='rgba(255,255,255,.95)';ell(c,0,0,15,3.6);c.stroke();ink(c)}
  c.restore();
}

// ---- the family ----
const LOOK_FUTAN={age:'kid',fem:true,skin:SKIN,hair:'bob',hairCol:HAIR,top:'smock',topCol:FUTAN_SMOCK,hat:'yochien',hatCol:FUTAN_HAT,shoe:'#e8483a',legCol:SKIN};
const LOOK_MAMA={age:'adult',fem:true,hair:'pattsun',hairCol:'#4a2a1a',top:'dress',topCol:'#e8483a',apron:true,shoe:'#5a3a6a'};
const LOOK_PAPA={age:'adult',hair:'short',hairCol:'#3a2a20',top:'shirt',topCol:'#2f5fa8',botCol:'#d8c4a0',shoe:'#7a4a2a',acc:{scarf:'#e8a020',glasses:true},s:1.08};
// stage outfits keep the family recognisable
function familyLook(base,st,who){
  const o=JSON.parse(JSON.stringify(base));
  const fit=st.family&&st.family[who];if(fit)Object.assign(o,fit);
  return o;
}
// リッキー: baby fairy that floats (drawn live, origin = point on the ground under her)
function drawRicky(c,t,o){
  o=o||{};c.save();ink(c,1.4);
  if(o.s)c.scale(o.s,o.s);
  ell(c,0,0,8,2.6);F(c,'rgba(40,0,40,.14)');
  c.translate(0,-30-Math.sin(t*3)*3-(o.hop||0));
  const fa=Math.sin(t*14)*.35;
  for(const k of[-1,1]){c.save();c.translate(k*6,-6);c.rotate(k*(-.5+fa));ell(c,k*7,0,7.5,4.5);FS(c,'#fff');c.strokeStyle='#bcd8ff';line(c,k*3,0,k*11,0);c.restore();ink(c,1.4)}
  rr(c,-8,-9,16,14,6);FS(c,'#fff');c.strokeStyle='#f3dc5a';c.lineWidth=2.2;line(c,-5,-8,-6,3);line(c,5,-8,6,3);ink(c,1.4);
  ell(c,-4,5.5,3,2.2);FS(c,SKIN);ell(c,4,5.5,3,2.2);FS(c,SKIN);
  const HY=-20;ell(c,0,HY,12.5,11.5);FS(c,SKIN);
  c.beginPath();c.moveTo(-12.3,HY+1);c.bezierCurveTo(-14,HY-15,14,HY-15,12.3,HY+1);c.quadraticCurveTo(10,HY-5,6.5,HY-5.5);c.lineTo(4.5,HY-2.5);c.lineTo(2,HY-6.5);c.lineTo(-1,HY-3);c.lineTo(-3.5,HY-6.5);c.lineTo(-6.5,HY-3.5);c.quadraticCurveTo(-10,HY-5.5,-12.3,HY+1);c.closePath();FS(c,HAIR);
  c.strokeStyle=HAIR;c.lineWidth=1.8;c.beginPath();c.moveTo(-2,HY-10);c.quadraticCurveTo(-5,HY-15,-2,HY-17);c.moveTo(2,HY-10);c.quadraticCurveTo(3,HY-15,6.5,HY-15.5);c.stroke();ink(c,1.4);
  const blink=((t+1.9)%4.1)<.14;
  if(blink||o.happy){c.lineWidth=1.6;for(const k of[-1,1]){c.beginPath();c.arc(k*4.6,HY+3,2.2,Math.PI*1.1,Math.PI*1.9);c.stroke()}c.lineWidth=1.4}
  else{ell(c,-4.6,HY+2.4,2.2,2.6);F(c,'#1d1216');ell(c,4.6,HY+2.4,2.2,2.6);F(c,'#1d1216');circ(c,-5.3,HY+1.5,.85);F(c,'#fff');circ(c,3.9,HY+1.5,.85);F(c,'#fff')}
  ell(c,-8,HY+6,2.6,1.6);F(c,'rgba(255,120,150,.35)');ell(c,8,HY+6,2.6,1.6);F(c,'rgba(255,120,150,.35)');
  circ(c,0,HY+8,3);FS(c,'#ffd0e0');circ(c,0,HY+8,1.4);F(c,'#ff9ccf');
  circ(c,-7,-10,2.7);FS(c,SKIN);circ(c,7,-10,2.7);FS(c,SKIN);
  c.restore();
}

// ---- animals (origin = feet) ----
function drawAnimal(c,k,col){
  c.save();ink(c,1.5);
  const eye=(x,y)=>{circ(c,x,y,1.4);F(c,'#2a1c1c')};
  switch(k){
  case 'dog':{const cc=col||'#e8c8a0';c.lineWidth=4;c.strokeStyle=LN;line(c,11,-12,15,-19);c.lineWidth=2.4;c.strokeStyle=cc;line(c,11,-12,15,-19);ink(c,1.5);
    for(const x of[-8,-3,5,9]){rr(c,x-1.6,-8,3.4,8,1.5);FS(c,cc)}ell(c,1,-10,12,6);FS(c,cc);circ(c,-11,-16,6.5);FS(c,cc);ell(c,-15,-15,2.6,5,.4);FS(c,shade(cc,-.3));eye(-12,-17);circ(c,-17,-14,1.3);F(c,'#2a1c1c');rr(c,-14,-11,6,2,1);F(c,'#e8504a');break}
  case 'cat':{const cc=col||'#3b3533';c.lineWidth=3.6;c.strokeStyle=LN;c.beginPath();c.moveTo(9,-6);c.quadraticCurveTo(17,-8,15,-18);c.stroke();c.lineWidth=2.2;c.strokeStyle=cc;c.stroke();ink(c,1.5);
    ell(c,3,-7,9,7);FS(c,cc);for(const s of[-1,1]){poly(c,[[-6+s*4,-17],[-6+s*6.5,-23],[-6+s*.5,-19]]);FS(c,cc)}circ(c,-6,-14,6);FS(c,cc);
    circ(c,-8,-14.5,1.3);F(c,cc==='#3b3533'?'#f3d36b':'#2a1c1c');circ(c,-4,-14.5,1.3);F(c,cc==='#3b3533'?'#f3d36b':'#2a1c1c');break}
  case 'bird':{const cc=col||'#a9adb5';ell(c,0,-6,7,5);FS(c,cc);circ(c,-6,-10,3.8);FS(c,cc);poly(c,[[-9.5,-10],[-13,-9],[-9.5,-8.5]]);FS(c,'#e9a64a');eye(-7,-11);c.lineWidth=1;line(c,-1,-1,-1,0);line(c,2,-1,2,0);break}
  case 'duck':{const cc=col||'#fff';ell(c,0,-5,10,6);FS(c,cc);circ(c,-8,-12,4.6);FS(c,cc);poly(c,[[-12,-12],[-17,-10.5],[-12,-9.5]]);FS(c,'#f2a33a');eye(-9,-13);break}
  case 'crab':{const cc=col||'#e8504a';for(const s of[-1,1]){c.lineWidth=1.4;line(c,s*6,-4,s*11,0);line(c,s*5,-5,s*12,-3);circ(c,s*11,-11,3.4);FS(c,cc);ink(c,1.5)}ell(c,0,-6,8,5);FS(c,cc);eye(-2.5,-10);eye(2.5,-10);break}
  case 'fish':{const cc=col||'#f28b2f';poly(c,[[8,-8],[15,-13],[15,-3]]);FS(c,cc);ell(c,0,-8,10,6);FS(c,cc);eye(-5,-9);c.lineWidth=1;line(c,2,-13,2,-3);break}
  case 'penguin':{ell(c,0,-11,8,11);FS(c,'#2f3340');ell(c,0,-9,5.5,8);FS(c,'#fff');eye(-2.5,-17);eye(2.5,-17);poly(c,[[-2,-14.5],[2,-14.5],[0,-12]]);FS(c,'#f2a33a');ell(c,-3,-.5,3,1.5);F(c,'#f2a33a');ell(c,3,-.5,3,1.5);F(c,'#f2a33a');break}
  case 'rabbit':{const cc=col||'#fff';ell(c,2,-7,8,6.5);FS(c,cc);circ(c,-5,-13,5.5);FS(c,cc);ell(c,-7,-24,2.2,6,-.15);FS(c,cc);ell(c,-3,-24,2.2,6,.15);FS(c,cc);eye(-7,-14);break}
  case 'monkey':{ell(c,0,-9,7,8);FS(c,'#a8703f');circ(c,0,-20,6.5);FS(c,'#a8703f');ell(c,0,-19,4.5,4);F(c,'#f3d0a8');circ(c,-7,-20,2.6);FS(c,'#f3d0a8');circ(c,7,-20,2.6);FS(c,'#f3d0a8');eye(-2,-20);eye(2,-20);break}
  }
  c.restore();
}

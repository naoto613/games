// ================= characters =================
const HAIR='#2b1d22',SKIN='#ffe4d4',LN='#5b2c47';
// ふーちゃん  o:{t,s,cure,doc,pose:'idle'|'run'|'win'|'cast'|'point'|'hold'|'think',moving,dir,happy,ouch,item:'lens',spin,look}
function drawFutan(c,x,y,o={}){
  const t=o.t??T,cure=!!o.cure,pose=o.pose||'idle',mv=o.moving;
  c.save();c.translate(x,y);c.scale(o.s||1,o.s||1);
  if(!o.noShadow){c.fillStyle='rgba(40,0,40,.18)';ell(c,0,0,14,4.5);}
  const bob=pose==='win'?Math.abs(Math.sin(t*6))*3:mv?Math.abs(Math.sin(t*13))*2.2:Math.sin(t*3)*.8;
  c.translate(0,-bob-(o.lift||0));if(o.dir<0)c.scale(-1,1);if(o.spin!=null)c.scale(Math.cos(o.spin)||.02,1);
  c.lineJoin='round';c.lineCap='round';c.strokeStyle=LN;c.lineWidth=1.5;
  const HY=-41,sw=mv?Math.sin(t*13):0;
  if(cure){for(const k of[-1,1]){const w=Math.sin(t*6+k)*3;c.fillStyle=k<0?'#ff5fa8':'#ff8cc6';c.beginPath();c.moveTo(k*3,-20);c.bezierCurveTo(k*10,-16,k*14+w,-10,k*18+w,-2);c.lineTo(k*12+w,-3);c.bezierCurveTo(k*9,-9,k*6,-14,k*1,-18);c.closePath();c.fill();c.stroke();}}
  // back hair
  c.fillStyle=HAIR;c.beginPath();c.moveTo(-16.5,HY);c.bezierCurveTo(-18,HY-23,18,HY-23,16.5,HY);c.quadraticCurveTo(18.5,HY+11,15.5,HY+16);c.quadraticCurveTo(0,HY+19,-15.5,HY+16);c.quadraticCurveTo(-18.5,HY+11,-16.5,HY);c.closePath();c.fill();c.stroke();
  if(cure){c.fillStyle=HAIR;for(const k of[-1,1]){const s2=Math.sin(t*5+k)*1.5;c.beginPath();c.moveTo(k*14,HY+4);c.quadraticCurveTo(k*(24+s2),HY+14,k*(19+s2),HY+28);c.quadraticCurveTo(k*15,HY+18,k*12,HY+10);c.closePath();c.fill();c.stroke();}}
  // legs
  for(const k of[-1,1]){const lf=Math.max(0,k*sw)*3,lx=k*4-2.5;c.fillStyle=SKIN;rr(c,lx,-11-lf,5,8,2);c.fill();c.stroke();
    if(cure){c.fillStyle='#fff';rr(c,lx-1,-6.5-lf,7,7,2.5);c.fill();c.stroke();c.fillStyle='#ff6fae';c.fillRect(lx-.6,-6-lf,6.2,1.8);}
    else{c.fillStyle='#ff9ac4';rr(c,lx-1,-4-lf,7,4.5,2);c.fill();c.stroke();}}
  // skirt
  if(cure){c.fillStyle='#fff';for(let i=0;i<7;i++)circ(c,-13.5+i*4.5,-8.4,2.9);
    const g=c.createLinearGradient(0,-23,0,-8);g.addColorStop(0,'#ffb0d8');g.addColorStop(1,'#ff5fa8');c.fillStyle=g;
    c.beginPath();c.moveTo(-7,-23);c.lineTo(7,-23);c.quadraticCurveTo(12,-16,15,-10);for(let i=0;i<5;i++){const x0=15-i*6;c.quadraticCurveTo(x0-3,-6.8,x0-6,-10);}c.quadraticCurveTo(-12,-16,-7,-23);c.closePath();c.fill();c.stroke();
    c.fillStyle='rgba(255,255,255,.85)';heartP(c,-7,-14,1.7);c.fill();heartP(c,7,-14,1.7);c.fill();heartP(c,0,-12,1.7);c.fill();}
  else{c.fillStyle='#7ea6d8';c.beginPath();c.moveTo(-7,-19);c.lineTo(7,-19);c.lineTo(10,-9);c.lineTo(-10,-9);c.closePath();c.fill();c.stroke();}
  // body
  if(cure){c.fillStyle='#fff';rr(c,-7.5,-29.5,15,9.5,4);c.fill();c.stroke();c.fillStyle='#ff8cc6';c.fillRect(-7,-22,14,2.2);}
  else{c.fillStyle='#fff';rr(c,-8.5,-29.5,17,12.5,4);c.fill();c.stroke();const cols=['#5ac8f0','#ff7ab0','#ffd84a','#3fae5a','#e84a4a','#3a5ac8'];for(let i=0;i<6;i++){c.fillStyle=cols[i];circ(c,-5+(i%3)*5,-26+(i/3|0)*4.5,1.7);}}
  if(o.doc&&!cure){c.fillStyle='#fdfdff';c.beginPath();c.moveTo(-9.5,-30);c.lineTo(9.5,-30);c.lineTo(12,-6);c.lineTo(-12,-6);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(0,-30);c.lineTo(0,-6);c.stroke();
    c.fillStyle='#ff6f91';c.fillRect(-1.2,-26,2.4,6);c.fillRect(-3,-24.2,6,2.4);
    c.strokeStyle='#4a78c0';c.lineWidth=1.4;c.beginPath();c.moveTo(-5,-30);c.quadraticCurveTo(-7,-19,-3,-16);c.moveTo(5,-30);c.quadraticCurveTo(7,-19,3,-16);c.stroke();c.fillStyle='#c8d4e8';circ(c,3,-15.5,2);c.strokeStyle=LN;c.lineWidth=1;c.stroke();c.lineWidth=1.5;}
  let rh=null;
  const arm=(k,hx,hy)=>{const sx=k*7,sy=-27;c.strokeStyle=LN;c.lineWidth=5;c.beginPath();c.moveTo(sx,sy);c.lineTo(hx,hy);c.stroke();c.strokeStyle=o.doc&&!cure?'#fdfdff':SKIN;c.lineWidth=3;c.stroke();c.lineWidth=1.5;c.strokeStyle=LN;c.fillStyle=cure?'#fff':SKIN;circ(c,hx,hy,2.7);c.stroke();
    c.fillStyle=cure?'#ff8cc6':o.doc?'#fdfdff':'#fff';circ(c,sx,sy+.5,cure?4.2:3.6);c.stroke();if(k>0)rh=[hx,hy];};
  if(pose==='win'){arm(-1,-21,HY-12+Math.sin(t*8)*1.5);arm(1,21,HY-12-Math.sin(t*8)*1.5);}
  else if(pose==='cast'){arm(-1,-10,-18);arm(1,19,-32);}
  else if(pose==='point'){arm(-1,-10,-17);arm(1,20,-36+Math.sin(t*4));}
  else if(pose==='hold'){arm(-1,-4,-22);arm(1,4,-22);}
  else if(pose==='think'){arm(-1,-10,-17);arm(1,5,-33);}
  else{arm(-1,-10,-17+sw*2.5);arm(1,10,-17-sw*2.5);}
  if(cure)bow(c,0,-26.5,'#ff4f9a',.9);
  // head
  c.fillStyle=SKIN;c.beginPath();c.ellipse(0,HY+2,14.5,13.5,0,0,TAU);c.fill();c.stroke();
  const blink=((t+.7)%3.6)<.13,lk=(o.look||0)*1.2;
  for(const k of[-1,1]){const ex=k*5.6+lk,ey=HY+5;
    if(blink||o.happy){c.lineWidth=1.9;c.beginPath();c.arc(ex,ey+1.5,3,Math.PI*1.1,Math.PI*1.9);c.stroke();c.lineWidth=1.5;}
    else if(o.ouch){c.lineWidth=1.8;c.beginPath();c.moveTo(ex-2.5*k,ey-2);c.lineTo(ex+2*k,ey);c.lineTo(ex-2.5*k,ey+2);c.stroke();c.lineWidth=1.5;}
    else{c.fillStyle='#3a1f2e';ell(c,ex,ey,3.2,4.1);const g=c.createLinearGradient(0,ey-1,0,ey+4);g.addColorStop(0,'#3a1f2e');g.addColorStop(1,cure?'#ee5aa6':'#8a5a3a');c.fillStyle=g;ell(c,ex,ey+1.1,2.4,2.8);
      c.fillStyle='#fff';ell(c,ex-1,ey-1.5,1.3,1.6);circ(c,ex+1.2,ey+2,.7);
      c.lineWidth=2;c.beginPath();c.ellipse(ex,ey,3.4,4.3,0,Math.PI*1.15,Math.PI*1.85);c.stroke();c.beginPath();c.moveTo(ex+k*3,ey-2.4);c.lineTo(ex+k*4.6,ey-3.6);c.stroke();c.lineWidth=1.5;}}
  c.fillStyle='rgba(255,110,150,.35)';ell(c,-9.2,HY+10,3,1.8);ell(c,9.2,HY+10,3,1.8);
  if(o.talk){c.fillStyle='#e0506a';ell(c,0,HY+11.3,2.6,.8+Math.abs(Math.sin(t*15))*2.2);c.stroke();}
  else if(o.ouch){c.fillStyle='#e0506a';ell(c,0,HY+11.5,1.8,2.2);}
  else if(pose==='think'){c.beginPath();c.moveTo(-2,HY+11);c.lineTo(2,HY+10.5);c.stroke();}
  else{c.fillStyle='#e0506a';c.beginPath();c.moveTo(-3,HY+10);c.quadraticCurveTo(0,HY+14.5,3,HY+10);c.closePath();c.fill();c.stroke();c.fillStyle='#fff';c.fillRect(-2,HY+10.2,4,.9);}
  // bangs
  c.fillStyle=HAIR;c.beginPath();c.moveTo(-15.5,HY+11);c.quadraticCurveTo(-17.5,HY-6,-10,HY-11);c.quadraticCurveTo(0,HY-15,10,HY-11);c.quadraticCurveTo(17.5,HY-6,15.5,HY+11);c.lineTo(13,HY+4);c.lineTo(11.5,HY+.5);
  [9,6,3,0,-3,-6,-9].forEach((bx,i)=>c.lineTo(bx,HY+(i%2?-.8:1)));c.lineTo(-11.5,HY+.5);c.lineTo(-13,HY+4);c.closePath();c.fill();c.stroke();
  // detective cap
  const capC=cure?'#ff7ab8':'#c98aa6',capD=cure?'#e0508e':'#a86a86';
  c.fillStyle=capC;c.beginPath();c.moveTo(-15.8,HY-6);c.bezierCurveTo(-16.5,HY-25,16.5,HY-25,15.8,HY-6);c.closePath();c.fill();c.stroke();
  c.strokeStyle=hexA(capD,.8);c.lineWidth=1;c.beginPath();c.moveTo(0,HY-20);c.quadraticCurveTo(-6,HY-12,-8,HY-6);c.moveTo(0,HY-20);c.quadraticCurveTo(6,HY-12,8,HY-6);c.stroke();c.strokeStyle=LN;c.lineWidth=1.5;
  c.fillStyle=capD;c.beginPath();c.moveTo(-17,HY-6.5);c.quadraticCurveTo(0,HY-1,17,HY-6.5);c.quadraticCurveTo(0,HY-9.5,-17,HY-6.5);c.fill();c.stroke();
  c.fillStyle=capC;circ(c,0,HY-20.5,1.8);c.stroke();
  if(cure){c.fillStyle='#fff';for(const k of[-1,1]){c.beginPath();c.moveTo(k*3,HY-13);c.quadraticCurveTo(k*9,HY-19,k*11,HY-14);c.quadraticCurveTo(k*8,HY-13,k*9,HY-11);c.quadraticCurveTo(k*6,HY-11,k*3,HY-12);c.fill();c.stroke();}
    c.fillStyle='#ffd84a';heartP(c,0,HY-13,3.4);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.8)';circ(c,-1.2,HY-14,.9);bow(c,12,HY-16,'#ff4f9a',.75);}
  else if(o.doc){c.fillStyle='#fff';circ(c,0,HY-13,4.2);c.stroke();c.fillStyle='#ff6f91';c.fillRect(-.9,HY-15.5,1.8,5);c.fillRect(-2.5,HY-13.9,5,1.8);}
  else{c.fillStyle='rgba(255,255,255,.85)';ell(c,0,HY-13,4.8,3.4);c.fillStyle='#8a6a7a';circ(c,-1.6,HY-13,.7);circ(c,1.6,HY-13,.7);}
  if(o.item==='lens'&&rh)drawIcon(c,'lens',rh[0]+3,rh[1]-6,.42);
  if(o.item==='wand'&&rh){c.save();c.translate(rh[0],rh[1]);c.rotate(-.4);c.fillStyle='#fff';rr(c,-1,-4,2,14,1);c.fill();c.stroke();c.fillStyle='#ffe36a';starP(c,0,-8,6,2.7);c.fill();c.stroke();c.fillStyle='#ff8cc0';heartP(c,0,-8,1.8);c.fill();c.restore();}
  c.restore();}

// リッキー（あかちゃんの ようせい）o:{t,s,nurse,cure,happy,dir,ground}
function drawRicky(c,x,y,o={}){const t=o.t??T;c.save();c.translate(x,y);c.scale(o.s||1,o.s||1);
  if(!o.noShadow){c.fillStyle='rgba(40,0,40,.14)';ell(c,0,0,9,3);}
  c.translate(0,-(o.ground?8:22)-Math.sin(t*3)*3-(o.hop||0));if(o.dir<0)c.scale(-1,1);
  c.lineJoin='round';c.lineCap='round';c.strokeStyle=LN;c.lineWidth=1.4;
  const fa=Math.sin(t*14)*.35;for(const k of[-1,1]){c.save();c.translate(k*6,-6);c.rotate(k*(-.5+fa));c.fillStyle=o.cure?'#ffe6f4':'#fff';c.beginPath();c.ellipse(k*7,0,7.5,4.5,0,0,TAU);c.fill();c.stroke();c.strokeStyle=o.cure?'#ff9ccf':'#bcd8ff';c.beginPath();c.moveTo(k*3,0);c.lineTo(k*11,0);c.stroke();c.restore();}
  c.fillStyle=o.cure?'#ffd0e8':'#fff';rr(c,-8,-9,16,14,6);c.fill();c.stroke();c.strokeStyle=o.cure?'#ff7ab8':'#f3dc5a';c.lineWidth=2.2;c.beginPath();c.moveTo(-5,-8);c.lineTo(-6,3);c.moveTo(5,-8);c.lineTo(6,3);c.stroke();c.strokeStyle=LN;c.lineWidth=1.4;
  if(o.nurse){c.fillStyle='#fff';rr(c,-8,-9,16,14,6);c.fill();c.stroke();c.fillStyle='#ff6f91';c.fillRect(-1,-6,2,6);c.fillRect(-3,-4,6,2);}
  c.fillStyle=SKIN;ell(c,-4,5.5,3,2.2);c.stroke();ell(c,4,5.5,3,2.2);c.stroke();
  const HY=-20;c.fillStyle=SKIN;c.beginPath();c.ellipse(0,HY,12.5,11.5,0,0,TAU);c.fill();c.stroke();
  c.fillStyle=HAIR;c.beginPath();c.moveTo(-12.3,HY+1);c.bezierCurveTo(-14,HY-15,14,HY-15,12.3,HY+1);c.quadraticCurveTo(10,HY-5,6.5,HY-5.5);c.lineTo(4.5,HY-2.5);c.lineTo(2,HY-6.5);c.lineTo(-1,HY-3);c.lineTo(-3.5,HY-6.5);c.lineTo(-6.5,HY-3.5);c.quadraticCurveTo(-10,HY-5.5,-12.3,HY+1);c.closePath();c.fill();c.stroke();
  c.strokeStyle=HAIR;c.lineWidth=1.8;c.beginPath();c.moveTo(-2,HY-10);c.quadraticCurveTo(-5,HY-15,-2,HY-17);c.moveTo(2,HY-10);c.quadraticCurveTo(3,HY-15,6.5,HY-15.5);c.stroke();c.strokeStyle=LN;c.lineWidth=1.4;
  if(o.nurse){c.fillStyle='#fff';c.beginPath();c.moveTo(-7,HY-9);c.lineTo(7,HY-9);c.lineTo(5,HY-15);c.lineTo(-5,HY-15);c.closePath();c.fill();c.stroke();c.fillStyle='#ff6f91';c.fillRect(-.8,HY-14.5,1.6,4.5);c.fillRect(-2.3,HY-13,4.6,1.6);}
  if(o.cure){bow(c,7,HY-10,'#ff5fa8',.6);c.fillStyle='#ffe36a';starP(c,-7,HY-11,3.2,1.4);c.fill();c.stroke();}
  const blink=((t+1.9)%4.1)<.14;
  if(blink||o.happy){c.lineWidth=1.6;for(const k of[-1,1]){c.beginPath();c.arc(k*4.6,HY+3,2.2,Math.PI*1.1,Math.PI*1.9);c.stroke();}c.lineWidth=1.4;}
  else{c.fillStyle='#1d1216';ell(c,-4.6,HY+2.4,2.2,2.6);ell(c,4.6,HY+2.4,2.2,2.6);c.fillStyle='#fff';circ(c,-5.3,HY+1.5,.85);circ(c,3.9,HY+1.5,.85);}
  c.fillStyle='rgba(255,120,150,.35)';ell(c,-8,HY+6,2.6,1.6);ell(c,8,HY+6,2.6,1.6);
  if(o.talk){c.fillStyle='#d0506a';ell(c,0,HY+8,2,1+Math.abs(Math.sin(t*14))*1.4);}
  else{c.fillStyle='#ffd0e0';circ(c,0,HY+8,3);c.stroke();c.fillStyle='#ff9ccf';circ(c,0,HY+8,1.4);}
  c.fillStyle=SKIN;circ(c,-7,-10,2.7);c.stroke();circ(c,7,-10,2.7);c.stroke();
  c.restore();}

// かいとう クロニャン  mood:''|'sad'|'happy'
function drawKuro(c,x,y,s,t,mood=''){c.save();c.translate(x,y);c.scale(s,s);c.translate(0,-52+Math.sin(t*2)*3);c.lineJoin='round';c.strokeStyle='#1a1026';c.lineWidth=2.4;
  c.fillStyle='#4a2a6a';c.beginPath();c.moveTo(-6,-10);c.quadraticCurveTo(-46,20+Math.sin(t*4)*6,-30,52);c.lineTo(30,52);c.quadraticCurveTo(46,20+Math.sin(t*4+1)*6,6,-10);c.closePath();c.fill();c.stroke();c.fillStyle='#ff4d6d';c.beginPath();c.moveTo(-26,48);c.lineTo(26,48);c.lineTo(22,52);c.lineTo(-22,52);c.fill();
  c.fillStyle=gfill(c,-4,20,24,'#3a3050');c.beginPath();c.ellipse(0,24,18,24,0,0,TAU);c.fill();c.stroke();c.fillStyle='#fff';c.beginPath();c.moveTo(-6,4);c.lineTo(0,14);c.lineTo(6,4);c.fill();
  c.fillStyle=gfill(c,-4,-18,24,'#3a3050');c.beginPath();c.arc(0,-14,20,0,TAU);c.fill();c.stroke();for(const sd of[-1,1]){c.beginPath();c.moveTo(sd*16,-24);c.lineTo(sd*18,-44);c.lineTo(sd*4,-32);c.closePath();c.fill();c.stroke();c.fillStyle='#ff8cb0';c.beginPath();c.moveTo(sd*14,-27);c.lineTo(sd*16,-38);c.lineTo(sd*8,-31);c.closePath();c.fill();c.fillStyle=gfill(c,-4,-18,24,'#3a3050');}
  if(mood!=='happy'){c.fillStyle='#fff';c.beginPath();c.moveTo(-22,-18);c.quadraticCurveTo(0,-26,22,-18);c.lineTo(20,-8);c.quadraticCurveTo(0,-14,-20,-8);c.closePath();c.fill();c.stroke();
    for(const sd of[-1,1]){c.fillStyle='#ffd23a';ell(c,sd*9,-14,4.2,3.4);c.fillStyle='#1a1026';ell(c,sd*9,-14,1.4,3);}}
  else{c.lineWidth=2.2;for(const sd of[-1,1]){c.beginPath();c.arc(sd*8,-12,4,Math.PI*1.1,Math.PI*1.9);c.stroke();}c.fillStyle='rgba(255,120,160,.5)';ell(c,-13,-6,4,2.4);ell(c,13,-6,4,2.4);}
  if(drawKuro.talk){c.fillStyle='#6a1a3a';ell(c,0,-3,5,1.5+Math.abs(Math.sin(t*15))*3.5);}c.strokeStyle='#1a1026';c.lineWidth=2;c.beginPath();if(mood==='sad'){c.arc(0,-2,5,Math.PI*1.2,Math.PI*1.8);}else if(mood==='happy'){c.arc(0,-6,5,.2,Math.PI-.2);}else{c.moveTo(-6,-4);c.quadraticCurveTo(0,1,7,-5);}c.stroke();
  if(mood==='sad'){c.fillStyle='#8ad8ff';ell(c,-12,-4,2,3);}
  c.strokeStyle='#ddd';c.lineWidth=1;for(const sd of[-1,1])for(const d of[-2,2]){c.beginPath();c.moveTo(sd*12,-4+d);c.lineTo(sd*26,-5+d*1.6);c.stroke();}c.strokeStyle='#1a1026';c.lineWidth=2.4;
  c.fillStyle='#1a1026';c.beginPath();c.ellipse(0,-36,24,5,0,0,TAU);c.fill();rr(c,-13,-60,26,26,4);c.fill();c.fillStyle='#ff4d6d';c.fillRect(-13,-40,26,4);
  c.strokeStyle='#3a3050';c.lineWidth=5;c.beginPath();c.moveTo(14,40);c.quadraticCurveTo(40,34,36,10+Math.sin(t*3)*6);c.stroke();c.restore();}

// やみの まじょ ドロドロン   o:{kind:true -> やさしい かお}
function drawWitch(c,x,y,s,t,o={}){const D='#1a0820',V={cape:'#2a0a3a',hair:'#8a3ab8',robe:'#5a1a7a',robe2:'#2a0a3a',orb:o.kind?'#ff9ccf':'#b04aff',eye:'#ff3a8a'};c.save();c.translate(x,y);
  c.fillStyle='rgba(30,0,40,.25)';ell(c,0,0,32*s,8*s);
  c.scale(s,s);c.translate(0,-24+Math.sin(t*2)*4);
  c.lineJoin='round';c.lineCap='round';c.lineWidth=1.8;c.strokeStyle=D;
  if(!o.kind){c.fillStyle='#1c0a26';for(const k of[-1,1]){const f=Math.sin(t*4)*6;c.beginPath();c.moveTo(k*8,-38);c.quadraticCurveTo(k*40,-72-f,k*64,-46-f);c.quadraticCurveTo(k*52,-40,k*54,-26);c.quadraticCurveTo(k*42,-30,k*40,-14);c.quadraticCurveTo(k*28,-20,k*10,-18);c.closePath();c.fill();c.stroke();}}
  c.fillStyle=V.cape;c.beginPath();c.moveTo(-11,-40);c.quadraticCurveTo(-30,-5,-33,22+Math.sin(t*3)*3);c.lineTo(33,22+Math.sin(t*3+1)*3);c.quadraticCurveTo(30,-5,11,-40);c.closePath();c.fill();c.stroke();
  c.fillStyle=V.hair;c.beginPath();c.moveTo(-13,-58);c.quadraticCurveTo(-22,-30,-16,-14);c.lineTo(16,-14);c.quadraticCurveTo(22,-30,13,-58);c.closePath();c.fill();c.stroke();
  const g=c.createLinearGradient(0,-40,0,22);g.addColorStop(0,o.kind?'#c07ae0':V.robe);g.addColorStop(1,o.kind?'#8a4ab8':V.robe2);c.fillStyle=g;c.beginPath();c.moveTo(-9,-40);c.lineTo(9,-40);c.quadraticCurveTo(14,-10,24,18);for(let i=0;i<6;i++){c.lineTo(24-i*8-4,24);c.lineTo(24-(i+1)*8,18);}c.quadraticCurveTo(-14,-10,-9,-40);c.closePath();c.fill();c.stroke();
  c.fillStyle=D;c.fillRect(-11,-25,22,4);c.fillStyle=V.orb;c.beginPath();c.moveTo(0,-28);c.lineTo(4,-23);c.lineTo(0,-18);c.lineTo(-4,-23);c.closePath();c.fill();c.stroke();
  c.strokeStyle=D;c.lineWidth=6;c.beginPath();c.moveTo(-9,-38);c.lineTo(-17,-25);c.lineTo(-10,-19);c.stroke();c.strokeStyle=V.robe;c.lineWidth=3.5;c.stroke();
  c.strokeStyle='#2a1030';c.lineWidth=3;c.beginPath();c.moveTo(25,-54);c.lineTo(22,20);c.stroke();
  c.strokeStyle=D;c.lineWidth=6;c.beginPath();c.moveTo(9,-38);c.lineTo(23,-30);c.stroke();c.strokeStyle=V.robe;c.lineWidth=3.5;c.stroke();
  c.lineWidth=1.8;c.strokeStyle=D;c.fillStyle='#f0e0f4';circ(c,23.5,-30,3);c.stroke();
  drawGlow(c,V.orb,25,-60,16+Math.sin(t*6)*2,.8);c.fillStyle=V.orb;circ(c,25,-60,6);c.stroke();c.fillStyle='rgba(255,255,255,.7)';circ(c,23,-62,2);
  const HY=-54;c.fillStyle='#f0e0f4';c.beginPath();c.ellipse(0,HY,11,12,0,0,TAU);c.fill();c.stroke();
  if(o.kind){c.lineWidth=1.6;for(const k of[-1,1]){c.beginPath();c.arc(k*5,HY+1,2.6,Math.PI*1.1,Math.PI*1.9);c.stroke();}c.fillStyle='rgba(255,120,160,.45)';ell(c,-7,HY+5,2.4,1.4);ell(c,7,HY+5,2.4,1.4);
    c.strokeStyle='#c04a7a';c.beginPath();c.arc(0,HY+5,3,.3,Math.PI-.3);c.stroke();c.strokeStyle=D;}
  else{for(const k of[-1,1]){c.fillStyle=V.eye;c.beginPath();c.moveTo(k*1.8,HY+1);c.lineTo(k*9,HY-3.5);c.lineTo(k*7.5,HY+3);c.closePath();c.fill();c.lineWidth=1.2;c.stroke();c.fillStyle=D;circ(c,k*5.5,HY+.6,1.3);
      c.lineWidth=1.6;c.beginPath();c.moveTo(k*2,HY-3.5);c.lineTo(k*9,HY-7);c.stroke();}
    c.strokeStyle='#8a1a5a';c.lineWidth=1.8;c.beginPath();c.moveTo(-4,HY+6.5);c.quadraticCurveTo(0,HY+9,5,HY+5);c.stroke();c.strokeStyle=D;}
  c.lineWidth=1.8;c.fillStyle=V.hair;c.beginPath();c.moveTo(-11.5,HY+3);c.quadraticCurveTo(-13,HY-14,0,HY-13);c.quadraticCurveTo(13,HY-14,11.5,HY+3);c.lineTo(9,HY-5);c.lineTo(4,HY-3);c.lineTo(1,HY-8);c.lineTo(-4,HY-4);c.lineTo(-9,HY-6);c.closePath();c.fill();c.stroke();
  c.fillStyle=o.kind?'#6a3a9a':'#3a1458';c.beginPath();c.ellipse(0,HY-10,21,4.5,0,0,TAU);c.fill();c.stroke();c.beginPath();c.moveTo(-11,HY-11);c.quadraticCurveTo(-5,HY-30,12,HY-42);c.quadraticCurveTo(4,HY-26,11,HY-11);c.closePath();c.fill();c.stroke();
  c.fillStyle=o.kind?'#ff8cc6':'#b01a5a';for(let i=0;i<5;i++){const a=i/5*TAU;circ(c,-6+Math.cos(a)*2.2,HY-15+Math.sin(a)*2.2,2);}c.fillStyle='#ff5a9a';circ(c,-6,HY-15,1.4);
  c.restore();}

// ---------- どうぶつ ----------
const AN={
  cat:{b:'#f5a55a',belly:'#fff4e0',ear:'cat',inner:'#ffc0c8',snout:'cat',tail:'long',mark:'stripe'},
  kuroneko:{b:'#4a4058',belly:'#8a8098',ear:'cat',inner:'#ff9cb8',snout:'cat',tail:'long'},
  dog:{b:'#e8c08a',belly:'#fff6e8',ear:'flop',earC:'#b0804a',snout:'dog',tail:'short'},
  rabbit:{b:'#ffffff',belly:'#fff',ear:'long',inner:'#ffb8d0',snout:'cat',tail:'puff'},
  bear:{b:'#b07a4a',belly:'#e8c898',ear:'round',snout:'bear',tail:'puff'},
  panda:{b:'#ffffff',belly:'#fff',ear:'round',earC:'#2a2a33',snout:'bear',mark:'panda',limb:'#2a2a33'},
  pig:{b:'#ffb8c8',belly:'#ffd0dc',ear:'tri',snout:'pig',tail:'curl'},
  fox:{b:'#ff9a4a',belly:'#fff',ear:'cat',inner:'#fff',snout:'fox',tail:'bushy'},
  raccoon:{b:'#9a9aa8',belly:'#e8e8f0',ear:'round',snout:'fox',mark:'mask',tail:'ring'},
  mouse:{b:'#c8c8d4',belly:'#eee',ear:'big',inner:'#ffb8d0',snout:'cat',tail:'thin'},
  lion:{b:'#ffc85a',belly:'#fff0c0',ear:'round',snout:'bear',mane:'#d8742a',tail:'tuft'},
  sheep:{b:'#fff',belly:'#fff',ear:'side',face:'#f5dcc8',snout:'bear',wool:1},
  elephant:{b:'#a8b8d0',belly:'#c8d4e4',ear:'eleph',snout:'trunk'},
  penguin:{bird:'penguin'},owl:{bird:'owl'},crow:{bird:'crow'},chick:{bird:'chick'},turtle:{bird:'turtle'},
};
// o:{t,happy,sad,sick,sleep,mouth:'open',acc:[...],hold:iconKey,noShadow}
function drawAnimal(c,k,x,y,s,o={}){const A=AN[k]||AN.cat,t=o.t??T;c.save();c.translate(x,y);c.scale(s,s);
  if(!o.noShadow){c.fillStyle='rgba(40,0,40,.16)';ell(c,0,0,30,7);}
  const bob=o.happy?Math.abs(Math.sin(t*6))*4:Math.sin(t*2.4)*1.2;c.translate(0,-bob);
  c.lineJoin='round';c.lineCap='round';c.strokeStyle=LN;c.lineWidth=2.4;
  const acc=o.acc||[];
  if(A.bird)drawBird(c,A.bird,t,o);
  else{
    const B=A.b,limb=A.limb||B;
    // tail
    c.fillStyle=B;c.save();c.translate(22,-18);
    switch(A.tail){case'long':c.lineWidth=7;c.strokeStyle=LN;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(22,-4+Math.sin(t*3)*4,18,-30);c.stroke();c.lineWidth=4;c.strokeStyle=B;c.stroke();break;
      case'puff':c.fillStyle=A.belly;circ(c,2,4,8);c.stroke();break;
      case'short':c.rotate(-.8+Math.sin(t*10)*.3);ell(c,8,0,10,5);c.stroke();break;
      case'curl':c.strokeStyle=shade(B,-.2);c.lineWidth=3;c.beginPath();c.arc(8,0,5,0,TAU*.8);c.stroke();break;
      case'bushy':c.rotate(-.5+Math.sin(t*3)*.15);c.fillStyle=B;ell(c,14,-8,11,20,.4);c.stroke();c.fillStyle='#fff';ell(c,20,-24,6,6);break;
      case'ring':c.rotate(-.4);ell(c,12,-6,9,20,.3);c.stroke();c.fillStyle='#4a4a5a';for(let i=0;i<3;i++){c.save();c.translate(12,-6);c.rotate(.3);c.fillRect(-8,-14+i*10,16,4);c.restore();}break;
      case'thin':c.strokeStyle='#e8a0b8';c.lineWidth=2.5;c.beginPath();c.moveTo(0,0);c.bezierCurveTo(20,4,20,-20,30,-18+Math.sin(t*4)*3);c.stroke();break;
      case'tuft':c.strokeStyle=B;c.lineWidth=3;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(18,-2,20,-18);c.stroke();c.fillStyle=A.mane;circ(c,20,-20,5);break;}
    c.restore();c.strokeStyle=LN;c.lineWidth=2.4;
    // feet
    c.fillStyle=gfill(c,-12,-6,10,limb);ell(c,-12,-5,10,6.5);c.stroke();ell(c,12,-5,10,6.5);c.stroke();
    // body
    if(A.wool){c.fillStyle='#fff';for(let i=0;i<10;i++){const a=i/10*TAU;circ(c,Math.cos(a)*20,-32+Math.sin(a)*22,10);}c.stroke();}
    c.fillStyle=gfill(c,-6,-40,28,B);ell(c,0,-32,25,27);c.stroke();
    c.fillStyle=A.belly||B;ell(c,0,-27,15,17);
    if(acc.includes('doc')){c.fillStyle='#fdfdff';c.beginPath();c.moveTo(-19,-50);c.lineTo(19,-50);c.quadraticCurveTo(27,-25,22,-8);c.lineTo(-22,-8);c.quadraticCurveTo(-27,-25,-19,-50);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(0,-50);c.lineTo(0,-8);c.stroke();c.strokeStyle='#4a78c0';c.lineWidth=2.4;c.beginPath();c.moveTo(-8,-52);c.quadraticCurveTo(-10,-34,0,-32);c.quadraticCurveTo(10,-34,8,-52);c.stroke();c.fillStyle='#c8d4e8';circ(c,0,-31,3.5);c.strokeStyle=LN;c.lineWidth=2.4;}
    if(acc.includes('apron')){c.fillStyle='#fff';rr(c,-15,-44,30,34,8);c.fill();c.stroke();c.fillStyle='#ff8cb0';heartP(c,0,-28,5);c.fill();}
    // arms
    const armY=-40;c.fillStyle=gfill(c,-20,armY,10,limb);
    if(o.hold){c.save();c.translate(-14,armY+10);c.rotate(-.9);ell(c,0,0,7,11);c.stroke();c.restore();c.save();c.translate(14,armY+10);c.rotate(.9);ell(c,0,0,7,11);c.stroke();c.restore();drawIcon(c,o.hold,0,armY+8,.9);}
    else{const w=o.happy?Math.sin(t*10)*.4:0;c.save();c.translate(-22,armY);c.rotate(.5+w);ell(c,0,8,7,12);c.stroke();c.restore();c.save();c.translate(22,armY);c.rotate(-.5-w);ell(c,0,8,7,12);c.stroke();c.restore();}
    if(acc.some(a=>a.startsWith('scarf'))){const col=acc.find(a=>a.startsWith('scarf')).split(':')[1]||'#ff5a6a';c.fillStyle=col;rr(c,-20,-56,40,10,5);c.fill();c.stroke();c.save();c.translate(10,-48);c.rotate(.25);rr(c,-5,0,10,20,3);c.fill();c.stroke();c.restore();}
    // head
    const HY=-74;
    if(A.mane){c.fillStyle=A.mane;for(let i=0;i<14;i++){const a=i/14*TAU;circ(c,Math.cos(a)*30,HY+Math.sin(a)*30,11);}c.fillStyle=A.mane;circ(c,0,HY,32);}
    const ec=A.earC||B;
    if(A.ear==='cat'){for(const sd of[-1,1]){c.fillStyle=ec;c.beginPath();c.moveTo(sd*8,HY-22);c.lineTo(sd*24,HY-38);c.lineTo(sd*26,HY-12);c.closePath();c.fill();c.stroke();c.fillStyle=A.inner||'#ffc0c8';c.beginPath();c.moveTo(sd*12,HY-22);c.lineTo(sd*22,HY-32);c.lineTo(sd*23,HY-16);c.closePath();c.fill();}}
    if(A.ear==='long'){for(const sd of[-1,1]){c.save();c.translate(sd*11,HY-30);c.rotate(sd*(.15+Math.sin(t*2+sd)*.05));c.fillStyle=B;ell(c,0,-10,8,24);c.stroke();c.fillStyle=A.inner;ell(c,0,-10,4,18);c.restore();}}
    if(A.ear==='round'){for(const sd of[-1,1]){c.fillStyle=ec;circ(c,sd*20,HY-20,10);c.stroke();if(!A.earC){c.fillStyle=shade(B,.3);circ(c,sd*20,HY-20,5);}}}
    if(A.ear==='big'){for(const sd of[-1,1]){c.fillStyle=B;circ(c,sd*22,HY-20,15);c.stroke();c.fillStyle=A.inner;circ(c,sd*22,HY-20,9);}}
    if(A.ear==='tri'){for(const sd of[-1,1]){c.fillStyle=B;c.beginPath();c.moveTo(sd*8,HY-22);c.lineTo(sd*22,HY-34);c.lineTo(sd*24,HY-14);c.closePath();c.fill();c.stroke();}}
    if(A.ear==='eleph'){for(const sd of[-1,1]){c.fillStyle=B;ell(c,sd*30,HY,18,24);c.stroke();c.fillStyle='#f0c8d8';ell(c,sd*30,HY,11,16);}}
    c.fillStyle=gfill(c,-6,HY-6,28,A.face||B);ell(c,0,HY,27,25);c.stroke();
    if(A.wool){c.fillStyle='#fff';for(let i=0;i<7;i++)circ(c,-18+i*6,HY-22+Math.abs(i-3)*2,7);}
    if(A.ear==='side'){for(const sd of[-1,1]){c.fillStyle=A.face;ell(c,sd*28,HY-4,10,5,sd*.3);c.stroke();}}
    if(A.ear==='flop'){for(const sd of[-1,1]){c.save();c.translate(sd*22,HY-12);c.rotate(sd*(.3+Math.sin(t*3)*.08));c.fillStyle=ec;ell(c,sd*2,12,9,17);c.stroke();c.restore();}}
    if(A.mark==='stripe'){c.fillStyle=shade(B,-.25);for(const dx of[-8,0,8])rr(c,dx-2,HY-25,4,10,2),c.fill();}
    if(A.mark==='panda'){c.fillStyle='#2a2a33';for(const sd of[-1,1])ell(c,sd*10,HY-1,8,10,sd*.5);}
    if(A.mark==='mask'){c.fillStyle='#4a4a5a';rr(c,-22,HY-8,44,14,7);c.fill();}
    // eyes
    const ey=HY-2;
    if(o.happy){c.lineWidth=2.6;for(const sd of[-1,1]){c.beginPath();c.arc(sd*10,ey+2,4.5,Math.PI*1.1,Math.PI*1.9);c.stroke();}c.lineWidth=2.4;}
    else if(o.sleep){c.lineWidth=2.4;for(const sd of[-1,1]){c.beginPath();c.arc(sd*10,ey,4.5,.2,Math.PI-.2);c.stroke();}}
    else if(o.sick||o.sad){c.lineWidth=2.4;for(const sd of[-1,1]){c.fillStyle='#2a1a22';ell(c,sd*10,ey+1,3.4,3.4);c.beginPath();c.moveTo(sd*5,ey-6);c.lineTo(sd*14,ey-8+(o.sad?4:2));c.stroke();}}
    else{for(const sd of[-1,1]){c.fillStyle='#2a1a22';ell(c,sd*10,ey,4.2,5.2);c.fillStyle='#fff';circ(c,sd*10-1.4,ey-1.8,1.6);}}
    // snout
    c.lineWidth=2;const sy=HY+9;
    if(A.snout==='cat'){c.fillStyle='#ff8ca8';c.beginPath();c.moveTo(-3.5,sy-3);c.lineTo(3.5,sy-3);c.lineTo(0,sy+1);c.closePath();c.fill();}
    else if(A.snout==='dog'||A.snout==='bear'){c.fillStyle=A.snout==='dog'?'#fff6e8':shade(B,.35);ell(c,0,sy+2,12,9);c.fillStyle='#2a1a22';ell(c,0,sy-2,5,3.5);}
    else if(A.snout==='pig'){c.fillStyle='#ff9cb4';ell(c,0,sy+1,10,7);c.stroke();c.fillStyle='#c0506a';ell(c,-3.5,sy+1,1.8,2.6);ell(c,3.5,sy+1,1.8,2.6);}
    else if(A.snout==='fox'){c.fillStyle='#fff';c.beginPath();c.moveTo(-16,sy-4);c.quadraticCurveTo(0,sy+14,16,sy-4);c.quadraticCurveTo(0,sy+2,-16,sy-4);c.fill();c.fillStyle='#2a1a22';ell(c,0,sy,4,3);}
    else if(A.snout==='trunk'){c.fillStyle=B;c.beginPath();c.moveTo(-6,sy-6);c.quadraticCurveTo(-8,sy+18,4+Math.sin(t*2)*3,sy+26);c.lineTo(10+Math.sin(t*2)*3,sy+22);c.quadraticCurveTo(6,sy+12,6,sy-6);c.closePath();c.fill();c.stroke();}
    // mouth
    c.strokeStyle=LN;c.lineWidth=2;const my=sy+5;
    if(o.mouth==='open'){c.fillStyle='#b83a5a';ell(c,0,my+3,7,8);c.stroke();c.fillStyle='#ff8ca0';ell(c,0,my+7,4.5,3);}
    else if(o.talk){c.fillStyle='#b83a5a';ell(c,0,my+3,5,1.5+Math.abs(Math.sin(t*15))*4.5);c.stroke();}
    else if(o.sad||o.sick){c.beginPath();c.arc(0,my+5,4,Math.PI*1.15,Math.PI*1.85);c.stroke();}
    else if(A.snout!=='trunk'){c.beginPath();c.arc(-3.5,my,3.5,.1,Math.PI-.1);c.stroke();c.beginPath();c.arc(3.5,my,3.5,.1,Math.PI-.1);c.stroke();}
    c.fillStyle=o.sick?'rgba(255,60,80,.45)':'rgba(255,110,150,.35)';ell(c,-17,HY+6,5,3);ell(c,17,HY+6,5,3);
    if(o.sick){c.fillStyle='#8ad8ff';c.beginPath();c.moveTo(24,HY-18);c.quadraticCurveTo(30,HY-8,24,HY-6);c.quadraticCurveTo(18,HY-8,24,HY-18);c.fill();}
    // accessories
    for(const a of acc){const [ak,col]=a.split(':');
      if(ak==='chef'){c.fillStyle='#fff';c.lineWidth=2.2;rr(c,-16,HY-34,32,12,3);c.fill();c.stroke();for(const dx of[-12,0,12])circ(c,dx,HY-42,11);c.beginPath();for(const dx of[-12,0,12]){c.moveTo(dx+11,HY-42);c.arc(dx,HY-42,11,0,TAU);}c.stroke();c.fillStyle='#fff';rr(c,-15,HY-40,30,10,2);c.fill();}
      if(ak==='glasses'){c.strokeStyle='#3a2a4a';c.lineWidth=2.2;c.beginPath();c.arc(-10,ey,7,0,TAU);c.moveTo(17,ey);c.arc(10,ey,7,0,TAU);c.moveTo(-3,ey);c.lineTo(3,ey);c.stroke();c.fillStyle='rgba(200,240,255,.3)';circ(c,-10,ey,6);circ(c,10,ey,6);}
      if(ak==='bow')bow(c,-16,HY-18,col||'#ff5fa2',1.3);
      if(ak==='cap'){c.fillStyle=col||'#5aa8ff';c.beginPath();c.arc(0,HY-12,22,Math.PI,TAU);c.closePath();c.fill();c.stroke();ell(c,-14,HY-12,16,4);c.stroke();}
      if(ak==='crown'){c.fillStyle='#ffd23a';c.beginPath();c.moveTo(-14,HY-20);c.lineTo(-16,HY-38);c.lineTo(-7,HY-28);c.lineTo(0,HY-42);c.lineTo(7,HY-28);c.lineTo(16,HY-38);c.lineTo(14,HY-20);c.closePath();c.fill();c.stroke();}
      if(ak==='mirror'){c.fillStyle='#e8eef8';c.strokeStyle='#8a9ab8';rr(c,-22,HY-26,44,5,2);c.fill();c.stroke();c.fillStyle='#fff';circ(c,0,HY-26,8);c.stroke();c.fillStyle='#bfe8ff';circ(c,0,HY-26,5);c.strokeStyle=LN;}
      if(ak==='mask'){c.fillStyle='#fff';rr(c,-14,sy-6,28,16,5);c.fill();c.stroke();c.beginPath();c.moveTo(-14,sy-2);c.lineTo(-24,sy-8);c.moveTo(14,sy-2);c.lineTo(24,sy-8);c.stroke();}
      if(ak==='band'){c.fillStyle='#ffe0c0';c.save();c.translate(-12,HY-16);c.rotate(-.4);rr(c,-10,-4,20,8,3);c.fill();c.stroke();c.restore();}
      if(ak==='key'){c.save();c.translate(18,-60);c.rotate(.3);drawIcon(c,'key',0,0,.5);c.restore();}
    }
    if(o.sleep){txt(c,'Z',24,HY-34+Math.sin(t*2)*3,16,'#8a7ab8');txt(c,'z',34,HY-46+Math.sin(t*2+1)*3,12,'#8a7ab8');}
  }
  c.restore();}
function drawBird(c,k,t,o){const ey=-72;
  const eyes=(ex,r)=>{if(o.happy){c.lineWidth=2.4;for(const sd of[-1,1]){c.beginPath();c.arc(sd*ex,ey+2,r,Math.PI*1.1,Math.PI*1.9);c.stroke();}}
    else if(o.sick||o.sad||o.sleep){c.lineWidth=2.4;for(const sd of[-1,1]){c.beginPath();c.arc(sd*ex,ey,r*.9,.2,Math.PI-.2);c.stroke();}}
    else for(const sd of[-1,1]){c.fillStyle='#2a1a22';ell(c,sd*ex,ey,r*.8,r);c.fillStyle='#fff';circ(c,sd*ex-1.2,ey-1.8,r*.35);}};
  if(k==='penguin'){c.fillStyle='#ffb03a';ell(c,-10,-4,10,5);c.stroke();ell(c,10,-4,10,5);c.stroke();
    c.fillStyle=gfill(c,-8,-60,40,'#3a4058');ell(c,0,-48,30,46);c.stroke();c.fillStyle='#fff';ell(c,0,-36,20,32);ell(c,-9,-70,10,12);ell(c,9,-70,10,12);
    for(const sd of[-1,1]){c.fillStyle='#3a4058';c.save();c.translate(sd*28,-44);c.rotate(sd*(.3+(o.happy?Math.sin(t*10)*.4:0)));ell(c,0,8,7,18);c.stroke();c.restore();}
    eyes(9,4.5);c.fillStyle='#ffb03a';c.beginPath();c.moveTo(-6,-62);c.lineTo(6,-62);c.lineTo(0,-54);c.closePath();c.fill();c.stroke();}
  if(k==='owl'){c.fillStyle='#ffb03a';ell(c,-10,-3,8,4);ell(c,10,-3,8,4);
    c.fillStyle=gfill(c,-8,-60,40,'#b07a4a');ell(c,0,-48,32,46);c.stroke();c.fillStyle='#f0d8a8';ell(c,0,-30,20,24);
    c.strokeStyle='#c09a6a';for(let i=0;i<3;i++){c.beginPath();c.moveTo(-8,-38+i*8);c.lineTo(-4,-34+i*8);c.lineTo(0,-38+i*8);c.lineTo(4,-34+i*8);c.lineTo(8,-38+i*8);c.stroke();}c.strokeStyle=LN;
    for(const sd of[-1,1]){c.fillStyle='#b07a4a';c.beginPath();c.moveTo(sd*16,-86);c.lineTo(sd*28,-104);c.lineTo(sd*6,-92);c.closePath();c.fill();c.stroke();c.fillStyle='#fff';circ(c,sd*13,ey,12);c.stroke();}
    if(o.happy||o.sick||o.sleep||o.sad)eyes(13,6);else for(const sd of[-1,1]){c.fillStyle='#ffb03a';circ(c,sd*13,ey,8);c.fillStyle='#111';circ(c,sd*13,ey,4.5);c.fillStyle='#fff';circ(c,sd*13-2,ey-2,1.6);}
    c.fillStyle='#ffb03a';c.beginPath();c.moveTo(-5,-62);c.lineTo(5,-62);c.lineTo(0,-52);c.closePath();c.fill();c.stroke();
    if((o.acc||[]).includes('glasses')){c.strokeStyle='#3a2a4a';c.lineWidth=2;c.beginPath();c.arc(-13,ey,13,0,TAU);c.moveTo(26,ey);c.arc(13,ey,13,0,TAU);c.stroke();}
    if((o.acc||[]).includes('cap')){c.fillStyle='#3a3a5a';c.fillRect(-20,-110,40,6);c.beginPath();c.moveTo(-24,-110);c.lineTo(0,-120);c.lineTo(24,-110);c.lineTo(0,-102);c.closePath();c.fill();c.stroke();}}
  if(k==='crow'){c.strokeStyle='#ffb03a';c.lineWidth=3;for(const sd of[-1,1]){c.beginPath();c.moveTo(sd*9,-10);c.lineTo(sd*9,0);c.moveTo(sd*9,0);c.lineTo(sd*3,4);c.moveTo(sd*9,0);c.lineTo(sd*15,4);c.stroke();}c.strokeStyle='#111';c.lineWidth=2.4;
    c.fillStyle=gfill(c,-8,-40,40,'#2a2a3a');ell(c,0,-36,26,30);c.stroke();for(const sd of[-1,1]){c.save();c.translate(sd*24,-38);c.rotate(sd*(.3+(o.happy?Math.sin(t*10)*.4:0)));ell(c,0,4,10,22);c.stroke();c.restore();}
    circ(c,0,-78,24);c.stroke();eyes(9,4.5);c.fillStyle='#ffb03a';c.beginPath();c.moveTo(-8,-72);c.lineTo(8,-72);c.lineTo(0,-58);c.closePath();c.fill();c.stroke();}
  if(k==='chick'){c.fillStyle='#ffb03a';ell(c,-8,-3,7,4);ell(c,8,-3,7,4);c.fillStyle=gfill(c,-8,-50,40,'#ffe04a');ell(c,0,-44,32,40);c.stroke();
    for(const sd of[-1,1]){c.save();c.translate(sd*30,-44);c.rotate(sd*(.4+(o.happy?Math.sin(t*12)*.4:0)));ell(c,0,4,7,14);c.stroke();c.restore();}
    eyes(11,5);c.fillStyle='#ff8a3a';c.beginPath();c.moveTo(-6,-64);c.lineTo(6,-64);c.lineTo(0,-56);c.closePath();c.fill();c.stroke();c.fillStyle='rgba(255,110,150,.35)';ell(c,-18,-60,5,3);ell(c,18,-60,5,3);
    c.fillStyle='#ffe04a';c.beginPath();c.moveTo(-3,-84);c.quadraticCurveTo(0,-96,4,-86);c.fill();c.stroke();}
  if(k==='turtle'){c.fillStyle='#8ad08a';for(const sd of[-1,1]){ell(c,sd*16,-4,10,6);c.stroke();ell(c,sd*30,-38,8,12,sd*.6);c.stroke();}
    c.fillStyle=gfill(c,-8,-40,40,'#3a9a5a');ell(c,0,-32,30,30);c.stroke();c.fillStyle='#ffe8a8';ell(c,0,-28,18,20);c.strokeStyle='#d8b870';for(let i=0;i<3;i++){c.beginPath();c.moveTo(-14,-38+i*9);c.lineTo(14,-38+i*9);c.stroke();}c.strokeStyle=LN;
    c.fillStyle=gfill(c,-6,-80,24,'#8ad08a');ell(c,0,-74,22,20);c.stroke();eyes(8,4);c.beginPath();c.arc(0,-66,5,.2,Math.PI-.2);c.stroke();c.fillStyle='rgba(255,110,150,.35)';ell(c,-14,-68,4,2.5);ell(c,14,-68,4,2.5);}
  if(o.mouth==='open'||(o.talk&&Math.sin(t*15)>0)){c.fillStyle='#b83a5a';ell(c,0,-58,5,5);c.stroke();}
  if((o.acc||[]).some(a=>a.startsWith('scarf'))){const col=(o.acc.find(a=>a.startsWith('scarf')).split(':')[1])||'#5aa8ff';c.fillStyle=col;c.strokeStyle=LN;c.lineWidth=2.2;rr(c,-20,-54,40,9,4);c.fill();c.stroke();}
  if((o.acc||[]).includes('band')){c.fillStyle='#ffe0c0';c.save();c.translate(-16,-10);c.rotate(-.3);rr(c,-9,-4,18,8,3);c.fill();c.stroke();c.restore();}
  if(o.sick){c.fillStyle='rgba(255,60,80,.45)';ell(c,-16,-62,5,3);ell(c,16,-62,5,3);}
}
// あるじの いちに あわせた からだの ばしょ（おいしゃさん よう）
const PART={head:[0,-74],mouth:[0,-62],belly:[0,-30],paw:[24,-36],leg:[12,-10],face:[0,-66],nose:[0,-66]};

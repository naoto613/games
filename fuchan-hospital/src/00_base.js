// ================= base (ふーちゃんのまち から流用: 絵・音・声・パーティクル・UI) =================
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const TAU=Math.PI*2,clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,rand=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.random()*a.length|0];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a;};
const ease=t=>t<0?0:t>1?1:t*t*(3-2*t),easeOut=t=>1-Math.pow(1-clamp(t,0,1),3),elastic=t=>t>=1?1:1-Math.pow(2,-9*t)*Math.cos(t*14);
const FONT='"M PLUS Rounded 1c","Hiragino Maru Gothic ProN",sans-serif',POP='"Mochiy Pop One","M PLUS Rounded 1c",sans-serif';
function rr(c,x,y,w,h,r){c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);}
function ell(c,x,y,rx,ry){c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);c.fill();}
function circ(c,x,y,r){c.beginPath();c.arc(x,y,Math.max(.1,r),0,TAU);c.fill();}
function shade(hex,a){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=a<0?0:255,t=Math.abs(a);r=Math.round(r+(f-r)*t);g=Math.round(g+(f-g)*t);b=Math.round(b+(f-b)*t);return'#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}
function star(c,x,y,r1,r2,n=5,rot=-Math.PI/2){c.beginPath();for(let i=0;i<n*2;i++){const r=i%2?r2:r1,a=rot+i*Math.PI/n;c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}c.closePath();}
function heartP(c,x,y,s){c.beginPath();c.moveTo(x,y+s*.9);c.bezierCurveTo(x-s*1.3,y+s*.1,x-s*.8,y-s*.9,x,y-s*.3);c.bezierCurveTo(x+s*.8,y-s*.9,x+s*1.3,y+s*.1,x,y+s*.9);c.closePath();}
const HERO={line:'#5a3a44'};
function bow(c,x,y,s,col){c.strokeStyle=HERO.line;c.lineWidth=1;c.fillStyle=col;
  c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x-s*1.4,y-s*1.1,x-s*1.5,y+s*.1);c.quadraticCurveTo(x-s*1.1,y+s*.9,x,y);c.fill();c.stroke();
  c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+s*1.4,y-s*1.1,x+s*1.5,y+s*.1);c.quadraticCurveTo(x+s*1.1,y+s*.9,x,y);c.fill();c.stroke();
  c.beginPath();c.moveTo(x-s*.2,y+s*.2);c.lineTo(x-s*.7,y+s*1.4);c.lineTo(x-s*.1,y+s*1.1);c.closePath();c.fill();c.stroke();
  c.beginPath();c.moveTo(x+s*.2,y+s*.2);c.lineTo(x+s*.7,y+s*1.4);c.lineTo(x+s*.1,y+s*1.1);c.closePath();c.fill();c.stroke();
  c.fillStyle=shade(col,-.15);circ(c,x,y,s*.42);c.stroke();c.lineWidth=1.1;}
// soft 3D shading
function gfill(c,x,y,r,col,hi=.38,lo=-.16){const g=c.createRadialGradient(x-r*.35,y-r*.45,r*.05,x,y,r*1.15);g.addColorStop(0,shade(col,hi));g.addColorStop(.6,col);g.addColorStop(1,shade(col,lo));return g;}
function vfill(c,y0,y1,col,hi=.18,lo=-.12){const g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,shade(col,hi));g.addColorStop(1,shade(col,lo));return g;}
let T=0;
// ================= characters =================
const FU={hair:'#2e211f',hairH:'#7a5a50',skin:'#fde8dc',skinS:'#efcdbd',line:'#4a3036'};
function handItem(c,k,x,y,t){c.save();c.translate(x,y);c.lineWidth=1.1;c.strokeStyle=FU.line;
  switch(k){
    case'uchiwa':c.rotate(-.3);c.fillStyle='#e8b070';c.fillRect(-.8,-2,1.6,9);c.fillStyle=gfill(c,0,-9,8,'#ff8cc0');c.beginPath();c.arc(0,-9,7.5,0,TAU);c.fill();c.stroke();c.fillStyle='#fff';for(let i=0;i<5;i++){const a=i/5*TAU;circ(c,Math.cos(a)*2.3,-9+Math.sin(a)*2.3,1.6);}c.fillStyle='#ffd23a';circ(c,0,-9,1.2);break;
    case'kakigori':c.fillStyle='rgba(200,230,255,.9)';c.beginPath();c.moveTo(-5,-4);c.lineTo(5,-4);c.lineTo(3.5,5);c.lineTo(-3.5,5);c.closePath();c.fill();c.stroke();c.fillStyle='#ff5a78';c.beginPath();c.arc(0,-4,6,Math.PI,TAU);c.fill();c.fillStyle='#ff8ca0';circ(c,-2,-7,1.6);c.fillStyle='#fff';circ(c,2,-8,1.3);break;
    case'wand':c.rotate(-.4);c.fillStyle='#fff';c.fillRect(-.9,-4,1.8,14);c.strokeRect(-.9,-4,1.8,14);c.fillStyle='#ffe36a';star(c,0,-8,6,2.7);c.fill();c.stroke();c.fillStyle='#ff8cc0';heartP(c,0,-8,1.8);c.fill();if(Math.sin(t*6)>.5){c.fillStyle='#fff';star(c,5,-14,2,.8,4);c.fill();}break;
    case'bag':c.fillStyle=gfill(c,0,4,7,'#ff8cc0');rr(c,-5,0,10,8,3);c.fill();c.stroke();c.beginPath();c.arc(0,0,3.5,Math.PI,TAU);c.stroke();c.fillStyle='#fff';heartP(c,0,4,1.5);c.fill();break;
    case'balloon2':c.strokeStyle='#8a7a9a';for(const [dx,col] of [[-7,'#5aa8ff'],[7,'#ffd23a'],[0,'#ff6f91']]){c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(dx*.5,-10,dx,-22);c.stroke();c.fillStyle=gfill(c,dx,-27,7,col);c.beginPath();c.ellipse(dx,-28+(dx?4:0),6,7.5,0,0,TAU);c.fill();}break;
    case'balloon':c.strokeStyle='#8a7a9a';c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(3,-10,0,-20);c.stroke();c.fillStyle=gfill(c,0,-26,8,'#ff6f91');c.strokeStyle=FU.line;heartP(c,0,-27,8);c.fill();c.stroke();break;
    case'flower':c.strokeStyle='#4cae4a';c.lineWidth=1.3;c.beginPath();c.moveTo(0,4);c.lineTo(0,-8);c.stroke();c.fillStyle='#ffd23a';for(let i=0;i<6;i++){const a=i/6*TAU;circ(c,Math.cos(a)*3,-10+Math.sin(a)*3,2.2);}c.fillStyle='#ff8a3a';circ(c,0,-10,1.6);break;
  }c.restore();}
const FUHEAD={y:-44,r:10};
function drawFuka(c,x,y,o){
  const C=o.outfit||OUTFIT0,L=FU.line,t=o.t??T;
  c.save();c.translate(x,y);const sc=(o.sc||3)*.9;c.scale(sc,sc);if(o.alpha!=null)c.globalAlpha=o.alpha;
  const mv=o.moving,sw=mv?Math.sin(t*10):0;let bob=mv?Math.abs(Math.sin(t*10))*1.2:Math.sin(t*2.2)*.3;if(o.cheer)bob=Math.abs(Math.sin(t*6))*2.4;if(o.dance)bob=Math.abs(Math.sin(t*8))*2.6;
  c.fillStyle='rgba(60,30,60,.2)';ell(c,0,0,11-bob*.5,3.2);
  const dir=o.dir||0,side=dir===1||dir===2,back=dir===3;if(dir===1)c.scale(-1,1);
  c.translate(0,-bob);if(o.sq)c.scale(1+o.sq*.1,1-o.sq*.1);if(o.dance)c.rotate(Math.sin(t*4)*.07);
  c.lineJoin='round';c.lineCap='round';c.lineWidth=.9;c.strokeStyle=L;
  const style=C.style||'dress',yuk=style==='yukata',mag=style==='magic';const HY=-49,fx=side?2.6:0;
  const hairF=()=>gfill(c,-2,HY-5,15,FU.hair,.22,-.2);
  // back hair & pigtails
  c.fillStyle=hairF();c.beginPath();c.ellipse(0,HY-1,11.6,12.6,0,0,TAU);c.fill();c.stroke();
  if(back){c.beginPath();c.moveTo(-11.4,HY);c.quadraticCurveTo(-11,HY+11,-7,HY+12);c.lineTo(7,HY+12);c.quadraticCurveTo(11,HY+11,11.4,HY);c.closePath();c.fill();c.stroke();}
  for(const s of[-1,1]){if(side&&s<0)continue;c.fillStyle=hairF();c.beginPath();c.moveTo(s*8.6,HY+5);c.quadraticCurveTo(s*13.8,HY+10,s*11.6,HY+18);c.quadraticCurveTo(s*9.4,HY+20,s*8.4,HY+14);c.closePath();c.fill();c.stroke();c.fillStyle='#161012';rr(c,s*9.6-1.7,HY+6.2,3.4,2.3,1);c.fill();}
  // magic cape (behind)
  if(mag){c.fillStyle=vfill(c,-36,-14,'#ffd6ea',.1,-.08);c.beginPath();c.moveTo(-7,-35);c.lineTo(7,-35);c.lineTo(13,-15);c.quadraticCurveTo(0,-12,-13,-15);c.closePath();c.fill();c.stroke();c.save();c.clip();c.strokeStyle='rgba(255,110,170,.5)';c.lineWidth=.8;for(let k=-14;k<14;k+=3.2){c.beginPath();c.moveTo(k,-36);c.lineTo(k,-12);c.stroke();}for(let k=-36;k<-12;k+=3.2){c.beginPath();c.moveTo(-14,k);c.lineTo(14,k);c.stroke();}c.restore();c.strokeStyle=L;c.lineWidth=.9;}
  // legs / feet
  const lift=s=>mv?Math.max(0,s*sw)*1.6:0,shift=s=>side?-s*sw*2.2:0;
  if(yuk){for(const s of[-1,1]){const px=s*3.2+shift(s),ly=-lift(s);c.fillStyle=FU.skin;c.beginPath();c.ellipse(px,ly-1.7,2.5,1.6,0,0,TAU);c.fill();c.stroke();c.fillStyle='#d8b07a';c.fillRect(px-2.8,ly-.6,5.6,1.3);c.strokeRect(px-2.8,ly-.6,5.6,1.3);c.strokeStyle=C.boots||'#ff5f9a';c.lineWidth=1;c.beginPath();c.moveTo(px-1.8,ly-1.6);c.lineTo(px,ly-3);c.lineTo(px+1.8,ly-1.6);c.stroke();c.strokeStyle=L;c.lineWidth=.9;}}
  else{for(const s of[-1,1]){const px=s*3.3+shift(s),ly=-lift(s);c.fillStyle=gfill(c,px,-8,6,FU.skin,.35,-.08);rr(c,px-1.7,ly-14,3.4,11.5,1.5);c.fill();c.stroke();c.fillStyle='#fff';rr(c,px-1.8,ly-5.6,3.6,2.6,.8);c.fill();c.fillStyle=gfill(c,px,ly-2,4,mag?'#ff5fa2':(C.boots||'#ff8cc0'));rr(c,px-2.3,ly-(mag?9:3.4),5,mag?9:3.4,[1.4,1.4,1,1]);c.fill();c.stroke();c.beginPath();c.ellipse(px+.6,ly-1,2.9,1.3,0,0,TAU);c.fill();c.stroke();}}
  // body
  if(yuk){const lg=c.createLinearGradient(-10,0,10,0);lg.addColorStop(0,shade(C.dress,-.08));lg.addColorStop(.4,shade(C.dress,.12));lg.addColorStop(1,shade(C.dress,-.14));c.fillStyle=lg;
    c.beginPath();c.moveTo(-7.8,-35.6);c.lineTo(7.8,-35.6);c.lineTo(9.4,-2.4);c.quadraticCurveTo(0,-1.4,-9.4,-2.4);c.closePath();c.fill();c.stroke();
    c.save();c.clip();const P=C.pat||['#ff8cbc','#c9a2e6'];[[-5,-8],[4,-7],[-2,-31],[5,-30],[-6,-21],[1,-12],[7,-13],[-3,-16],[5,-20],[-7,-4],[2,-4]].forEach(([a,b],i)=>{c.fillStyle=P[i%2];for(let k=0;k<5;k++){const an=k/5*TAU;circ(c,a+Math.cos(an)*1.05,b+Math.sin(an)*1.05,.85);}c.fillStyle='#fff6b0';circ(c,a,b,.45);});c.restore();
    if(!back){c.beginPath();c.moveTo(-4.4,-35.6);c.lineTo(3.2,-2.4);c.stroke();c.fillStyle='#fff';c.beginPath();c.moveTo(-4.6,-35.8);c.lineTo(0,-29.6);c.lineTo(4.6,-35.8);c.lineTo(2.6,-35.8);c.lineTo(0,-32);c.lineTo(-2.6,-35.8);c.closePath();c.fill();c.stroke();}
    c.fillStyle=vfill(c,-27.6,-22.6,C.ribbon);rr(c,-8.1,-27.6,16.2,5,1.2);c.fill();c.stroke();c.strokeStyle=shade(C.ribbon,.45);c.lineWidth=.8;c.beginPath();c.moveTo(-8,-25.1);c.lineTo(8,-25.1);c.stroke();c.strokeStyle=L;c.lineWidth=.9;
    if(back){c.fillStyle=C.ribbon;for(const s of[-1,1]){c.beginPath();c.ellipse(s*5.8,-26,5.8,3.6,s*.25,0,TAU);c.fill();c.stroke();c.beginPath();c.moveTo(s*1.2,-23.5);c.lineTo(s*4.2,-14);c.lineTo(s*1.6,-15);c.closePath();c.fill();c.stroke();}c.fillStyle=shade(C.ribbon,-.1);circ(c,0,-25.6,2.2);c.stroke();}}
  else{const skc=mag?'#ff7ab8':C.dress;c.fillStyle=vfill(c,-25,-11,skc,.15,-.1);c.beginPath();c.moveTo(-6.4,-25);c.lineTo(6.4,-25);c.lineTo(11.6+sw*.4,-12);c.quadraticCurveTo(0,-10.4,-11.6+sw*.4,-12);c.closePath();c.fill();c.stroke();
    c.fillStyle=mag?'#fff':(C.skirt||'#fff');c.beginPath();c.moveTo(-11.3,-13.4);c.quadraticCurveTo(0,-11.8,11.3,-13.4);c.lineTo(11.6+sw*.4,-12);c.quadraticCurveTo(0,-10.4,-11.6+sw*.4,-12);c.closePath();c.fill();
    if(mag){c.fillStyle='#fff';for(let k=-10;k<=10;k+=2.5)circ(c,k,-11.4,1.3);}
    c.fillStyle=gfill(c,-1,-31,9,mag?'#ffffff':C.dress);rr(c,-6.6,-35.6,13.2,11,[3,3,1,1]);c.fill();c.stroke();c.fillStyle=mag?'#ff3d8a':C.ribbon;c.fillRect(-6.8,-26,13.6,1.8);
    if(!back){c.fillStyle='#fff';c.beginPath();c.moveTo(-3.6,-35.6);c.lineTo(0,-32.6);c.lineTo(3.6,-35.6);c.closePath();c.fill();c.stroke();if(mag){bow(c,0,-31,3.4,'#ff3d8a');c.fillStyle='#ffe36a';heartP(c,0,-30.8,1.3);c.fill();}else bow(c,0,-25.2,2,C.ribbon);}}
  const coat=o.coat||C.coat;
  if(coat&&!back){const cf=vfill(c,-36,-8,coat,.12,-.1);c.fillStyle=cf;for(const s of[-1,1]){c.beginPath();c.moveTo(s*2.2,-35.8);c.lineTo(s*7.9,-35.4);c.quadraticCurveTo(s*10.6,-22,s*11.8,-8.6);c.quadraticCurveTo(s*7,-7.6,s*2,-8.4);c.lineTo(s*1.6,-24);c.closePath();c.fill();c.stroke();
      c.fillStyle=shade(coat,-.06);c.beginPath();c.moveTo(s*2.2,-35.8);c.lineTo(s*5.6,-35.6);c.lineTo(s*3.2,-28);c.closePath();c.fill();c.stroke();c.fillStyle=cf;}
    if(C.coatPat)coatPattern(c,C.coatPat);
    c.fillStyle=shade(coat,-.08);rr(c,-9.6,-19,5,4.4,1);c.fill();c.stroke();c.fillStyle='#5aa8ff';c.fillRect(-8.6,-21.4,1,3.6);c.fillStyle='#ff5f9a';c.fillRect(-7,-21,1,3.2);
    c.fillStyle='#fff';circ(c,2.8,-22,.7);circ(c,2.8,-16,.7);c.fillStyle='#5aa8ff';rr(c,5.2,-31.5,3.6,4.4,.8);c.fill();c.fillStyle='#fff';c.fillRect(6.6,-30.8,.8,3);c.fillRect(5.6,-29.7,2.8,.8);}
  if(o.steth&&!back){c.strokeStyle='#5a6a8a';c.lineWidth=1.1;c.beginPath();c.moveTo(-4.4,-36.4);c.quadraticCurveTo(-6.4,-28,-2.4,-26);c.moveTo(4.4,-36.4);c.quadraticCurveTo(6.4,-28,2.4,-26);c.moveTo(-2.4,-26);c.quadraticCurveTo(0,-24.6,2.4,-26);c.moveTo(0,-25.2);c.quadraticCurveTo(-1,-21,1.6,-19.4);c.stroke();c.fillStyle=gfill(c,1.6,-18.4,2.6,'#c8d4e8');c.strokeStyle=L;c.lineWidth=.8;circ(c,1.8,-18.2,2.1);c.stroke();c.lineWidth=.9;}
  c.fillStyle=FU.skinS;rr(c,-2.2,-39.8,4.4,4.8,1);c.fill();
  // arms
  const sleeve=coat&&!back?coat:yuk?C.dress:mag?'#ffffff':C.dress;let rh=null;
  const arm=(s,hx,hy,raised)=>{const sx=s*7.4,sy=-34;const mx=(sx+hx)/2+s*1.4,my=(sy+hy)/2+.8;
    c.strokeStyle=L;c.lineWidth=4.6;c.beginPath();c.moveTo(sx,sy);c.lineTo(mx,my);c.stroke();c.strokeStyle=sleeve;c.lineWidth=3;c.stroke();
    c.strokeStyle=L;c.lineWidth=3.7;c.beginPath();c.moveTo(mx,my);c.lineTo(hx,hy);c.stroke();c.strokeStyle=yuk?C.dress:FU.skin;c.lineWidth=2.3;c.stroke();
    if(!yuk){c.fillStyle=sleeve;c.beginPath();c.ellipse(sx+(mx-sx)*.3,sy+(my-sy)*.3,2.6,2.2,0,0,TAU);c.fill();c.lineWidth=.9;c.strokeStyle=L;c.stroke();}
    if(yuk&&!raised){c.fillStyle=C.dress;c.lineWidth=.9;c.strokeStyle=L;c.beginPath();c.moveTo(mx-s*.5,my-2);c.lineTo(mx+s*3.4,my-.5);c.lineTo(mx+s*3,my+7);c.quadraticCurveTo(mx+s*1,my+8.5,mx-s*1.2,my+6);c.closePath();c.fill();c.stroke();}
    c.lineWidth=.9;c.strokeStyle=L;c.fillStyle=FU.skin;c.beginPath();c.arc(hx,hy,1.9,0,TAU);c.fill();c.stroke();if(s>0||side)rh=[hx,hy];};
  const aw=mv?sw*2:0;
  if(o.cheer){arm(-1,-13,-51+Math.sin(t*8)*2,1);arm(1,13,-51-Math.sin(t*8)*2,1);if(!o.item){c.fillStyle='#ffe36a';star(c,-14,-54,4.4,1.9);c.fill();c.stroke();star(c,14,-54,4.4,1.9);c.fill();c.stroke();}}
  else if(o.dance){const k=Math.sin(t*8);arm(-1,-13,-44+k*5,1);arm(1,13,-44-k*5,1);}
  else if(o.wave){arm(-1,-9.4,-19);arm(1,13,-50+Math.sin(t*10)*2.5,1);}
  else if(o.hold){arm(-1,-8,-26,1);arm(1,8,-26,1);}
  else if(o.eat){arm(-1,-2.6,-40.5,1);arm(1,2.6,-40.5,1);}
  else if(o.point){arm(-1,-9.4,-19);arm(1,15,-38,1);}
  else if(o.fight){arm(-1,-6,-33,1);arm(1,15,-34+Math.sin(t*6),1);}
  else if(side){arm(0.2,aw*2+1.5,-19);}
  else{arm(-1,-9.4,-19+aw);arm(1,9.4,-19-aw);}
  const item=o.item!==undefined?o.item:C.item;if(item&&item!=='none'&&rh)handItem(c,item,rh[0],rh[1],t);
  // head
  if(!back&&!side){c.fillStyle=FU.skin;for(const s of[-1,1]){c.beginPath();c.ellipse(s*10.1,HY+1.4,1.9,2.8,0,0,TAU);c.fill();c.stroke();}}
  c.fillStyle=gfill(c,-2,HY-3,13,FU.skin,.45,-.08);c.beginPath();c.ellipse(0,HY+.3,10.1,11.2,0,0,TAU);c.fill();c.stroke();
  if(back){c.fillStyle=hairF();c.beginPath();c.ellipse(0,HY-.6,11.4,12.2,0,0,TAU);c.fill();c.stroke();c.strokeStyle='rgba(255,255,255,.25)';c.lineWidth=1.2;c.beginPath();c.arc(-2,HY-4,7,Math.PI*1.1,Math.PI*1.6);c.stroke();}
  else{const ey=HY+2,ex=4,lx=(o.look||0)*.6;const blink=o.blink??((t+(o.seed||0))%3.9>3.78);
    if(o.happy||o.eat||o.cheer||o.dance){c.strokeStyle=L;c.lineWidth=1.1;for(const s of[-1,1]){if(side&&s<0)continue;c.beginPath();c.arc(fx+s*ex,ey+.9,2,Math.PI*1.15,Math.PI*1.85);c.stroke();}}
    else if(blink){c.strokeStyle=L;c.lineWidth=1;for(const s of[-1,1]){if(side&&s<0)continue;c.beginPath();c.moveTo(fx+s*ex-2,ey+.3);c.quadraticCurveTo(fx+s*ex,ey+1.2,fx+s*ex+2,ey+.3);c.stroke();}}
    else for(const s of[-1,1]){if(side&&s<0&&fx)continue;const xx=fx+s*ex;c.fillStyle='#fff';c.beginPath();c.ellipse(xx,ey,2.3,1.75,0,0,TAU);c.fill();
      c.save();c.beginPath();c.ellipse(xx,ey,2.3,1.75,0,0,TAU);c.clip();c.fillStyle='#4a2c22';circ(c,xx+lx,ey+.1,1.45);c.fillStyle='#1a0e0e';circ(c,xx+lx,ey+.1,.75);c.fillStyle='#fff';circ(c,xx+lx-.5,ey-.5,.45);c.restore();
      c.strokeStyle='#2a1a1e';c.lineWidth=.9;c.beginPath();c.ellipse(xx,ey+.15,2.4,1.9,0,Math.PI*1.08,Math.PI*1.92);c.stroke();c.beginPath();c.moveTo(xx+s*2.3,ey-.6);c.lineTo(xx+s*3,ey-1.3);c.stroke();}
    c.fillStyle='rgba(255,120,140,.26)';ell(c,fx-6.2,HY+5.6,2.5,1.5);ell(c,fx+6.2,HY+5.6,2.5,1.5);
    c.strokeStyle='rgba(190,120,110,.75)';c.lineWidth=.7;c.beginPath();c.arc(fx+.2,HY+5.2,.9,.3,2.2);c.stroke();
    c.strokeStyle='#b85a64';c.lineWidth=.8;const my=HY+7.8;
    if(o.eat){const m=Math.abs(Math.sin(t*12));c.fillStyle='#c04a5e';ell(c,fx,my,1.6,.5+m*1.2);}
    else if(o.cheer||o.happy||o.dance){c.fillStyle='#c84a60';c.beginPath();c.moveTo(fx-2.4,my-.4);c.quadraticCurveTo(fx,my+3,fx+2.4,my-.4);c.closePath();c.fill();c.fillStyle='#fff';c.fillRect(fx-1.6,my-.3,3.2,.7);}
    else if(o.oh){c.fillStyle='#c04a5e';ell(c,fx,my+.4,1,1.3);}
    else{c.beginPath();c.moveTo(fx-1.6,my);c.quadraticCurveTo(fx,my+1,fx+1.6,my);c.stroke();}
    c.lineWidth=.9;c.strokeStyle=L;
    c.fillStyle=hairF();c.beginPath();c.moveTo(-10.6,HY+2.5);c.bezierCurveTo(-12.2,HY-15.5,12.2,HY-15.5,10.6,HY+2.5);c.lineTo(9.6,HY-2.6);const bx=[8,6,4,2,0,-2,-4,-6,-8];bx.forEach((xx,i)=>c.lineTo(xx+fx*.4,HY-2.6-(i%2?.9:0)));c.lineTo(-9.6,HY-2.6);c.closePath();c.fill();c.stroke();
    c.strokeStyle='rgba(255,255,255,.28)';c.lineWidth=1.3;c.beginPath();c.arc(-2,HY-6,7,Math.PI*1.15,Math.PI*1.55);c.stroke();c.strokeStyle='rgba(0,0,0,.18)';c.lineWidth=.5;for(const xx of[-5,-1,3,6]){c.beginPath();c.moveTo(xx,HY-10);c.lineTo(xx+.4,HY-3);c.stroke();}c.strokeStyle=L;c.lineWidth=.9;}
  const top=HY-11.5;
  switch(C.acc){
    case'mbow':for(const s of[-1,1])bow(c,s*9.8,HY+7.2,2.4,C.ribbon||'#ff6fa3');break;
    case'hana':for(const [a,b,col] of [[-7.5,HY-8,'#ff8cc0'],[-4,HY-10,'#fff']]){c.fillStyle=col;for(let i=0;i<5;i++){const an=i/5*TAU;circ(c,a+Math.cos(an)*1.5,b+Math.sin(an)*1.5,1.2);}c.fillStyle='#ffc83a';circ(c,a,b,.7);}break;
    case'tiara':c.fillStyle='#ffe36a';c.beginPath();c.moveTo(-6.5,top+2.5);c.lineTo(-4.5,top-2.5);c.lineTo(-2,top+.5);c.lineTo(0,top-4.5);c.lineTo(2,top+.5);c.lineTo(4.5,top-2.5);c.lineTo(6.5,top+2.5);c.closePath();c.fill();c.stroke();c.fillStyle='#ff4d8d';heartP(c,0,top-1,1.3);c.fill();break;
    case'crown':c.fillStyle=gfill(c,0,top-2,8,'#ffd23a');c.beginPath();c.moveTo(-6,top+3);c.lineTo(-7,top-5);c.lineTo(-3,top-1.5);c.lineTo(0,top-7);c.lineTo(3,top-1.5);c.lineTo(7,top-5);c.lineTo(6,top+3);c.closePath();c.fill();c.stroke();c.fillStyle='#ff4d6d';circ(c,0,top,1.2);break;
    case'beret':c.fillStyle=gfill(c,2,top,12,'#ff6f91');c.beginPath();c.ellipse(side?0:2,top+2,12,4.4,-.12,0,TAU);c.fill();c.stroke();circ(c,side?0:2,top-2,1.2);break;
    case'cap':c.fillStyle=gfill(c,0,HY-9,13,'#c98aa4');c.beginPath();c.arc(0,HY-4,12,Math.PI,TAU);c.closePath();c.fill();c.stroke();c.fillStyle=shade('#c98aa4',-.12);c.beginPath();c.ellipse(side?7:0,HY-4,side?7:12.5,3.2,0,0,Math.PI);c.fill();c.stroke();break;
    case'star':c.fillStyle='#ffd23a';star(c,side?3:7,HY-8,3.4,1.5);c.fill();c.stroke();break;
    case'nurse':c.fillStyle='#fff';rr(c,-7,top-1,14,6,2);c.fill();c.stroke();c.fillStyle='#ff4d6d';c.fillRect(-1,top,2,4.4);c.fillRect(-2.2,top+1.2,4.4,2);break;
    case'dhat':{c.fillStyle=gfill(c,0,HY-9,14,'#ff9ac8');c.beginPath();c.ellipse(0,HY-5.5,13.5,3.6,0,0,TAU);c.fill();c.stroke();c.beginPath();c.arc(0,HY-6,10,Math.PI,TAU);c.closePath();c.fill();c.stroke();c.save();c.clip();c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=.8;for(let k=-10;k<11;k+=3){c.beginPath();c.moveTo(k,HY-17);c.lineTo(k,HY-5);c.stroke();}c.restore();c.lineWidth=.9;c.strokeStyle=L;bow(c,side?-5:-7,HY-9,2.6,'#ff3d8a');c.fillStyle='#ffe36a';star(c,side?-5:-7,HY-9,1.4,.6);c.fill();break;}
  }
  c.restore();}
const RK={clap:0,hop:0};
function drawRikki(c,x,y,o={}){const sc=o.sc||2.5,t=o.t??T;c.save();c.translate(x,y);c.scale(sc,sc);const L=FU.line;const WR=o.wear||rkWear();c.lineJoin='round';c.lineCap='round';c.lineWidth=1;c.strokeStyle=L;
  const hp=o.hop??RK.hop,hop=hp>0?Math.sin(hp*Math.PI)*10:0,mv=o.moving,bob=mv?Math.abs(Math.sin(t*9))*2:Math.sin(t*2)*.5;
  c.fillStyle='rgba(60,30,60,.2)';ell(c,0,0,14-hop*.4,3.6);
  c.translate(0,-hop-bob);if(hp>0&&hp<.25)c.scale(1.1,.9);if(o.dir===1)c.scale(-1,1);if(o.dance)c.rotate(Math.sin(t*5)*.12);
  c.fillStyle=gfill(c,0,-4,12,FU.skin,.4,-.1);for(const s of[-1,1]){c.beginPath();c.ellipse(s*7.4,-4,6.2,4.4,s*.15,0,TAU);c.fill();c.stroke();c.beginPath();c.ellipse(s*12.6,-3.4+(mv?Math.sin(t*9+s)*1.2:0),2.6,3,s*.3,0,TAU);c.fill();c.stroke();c.strokeStyle='rgba(200,130,120,.5)';c.lineWidth=.6;c.beginPath();c.moveTo(s*6,-2);c.quadraticCurveTo(s*8,-1,s*10,-2.4);c.stroke();c.strokeStyle=L;c.lineWidth=1;}
  c.fillStyle=gfill(c,-3,-16,13,WR.c,.3,-.08);c.beginPath();c.moveTo(-10,-5);c.quadraticCurveTo(-12,-19,-6,-22);c.lineTo(6,-22);c.quadraticCurveTo(12,-19,10,-5);c.quadraticCurveTo(0,-2,-10,-5);c.closePath();c.fill();c.stroke();
  c.save();c.clip();rkPattern(c,WR);c.restore();
  c.strokeStyle=WR.trim;c.lineWidth=1.4;c.beginPath();c.moveTo(-5,-22);c.lineTo(1,-12);c.moveTo(5,-22);c.lineTo(-1,-15);c.stroke();c.fillStyle=WR.trim;circ(c,2.5,-13,1.2);c.strokeStyle=L;c.lineWidth=1;
  const cl=o.clap??RK.clap;
  const arm=(s,hx,hy)=>{c.strokeStyle=L;c.lineWidth=5.4;c.beginPath();c.moveTo(s*7.5,-18);c.lineTo(hx,hy);c.stroke();c.strokeStyle=FU.skin;c.lineWidth=3.6;c.stroke();c.strokeStyle=WR.c;c.lineWidth=3.8;c.beginPath();c.moveTo(s*7.5,-18);c.lineTo(s*7.5+(hx-s*7.5)*.35,-18+(hy+18)*.35);c.stroke();c.lineWidth=1;c.strokeStyle=L;c.fillStyle=FU.skin;c.beginPath();c.arc(hx,hy,2.6,0,TAU);c.fill();c.stroke();};
  if(cl>0){const k=Math.abs(Math.sin(t*14));for(const s of[-1,1])arm(s,s*(2+k*4),-21);}
  else if(o.wave){arm(-1,-12,-9);arm(1,13,-27+Math.sin(t*10)*2);}
  else if(o.dance){const k=Math.sin(t*8);arm(-1,-13,-25+k*4);arm(1,13,-25-k*4);}
  else if(o.eat){arm(-1,-4,-24);arm(1,4,-24);}
  else if(o.toy!==false&&!mv){const toy=o.toy||SAVE.rk.toy;arm(-1,-7,-15);arm(1,7,-15);rkToy(c,toy,t);c.fillStyle=FU.skin;c.beginPath();c.arc(-7,-15,2.6,0,TAU);c.fill();c.stroke();c.beginPath();c.arc(7,-15,2.6,0,TAU);c.fill();c.stroke();}
  else{const aw=mv?Math.sin(t*9)*3:0;arm(-1,-12,-9+aw);arm(1,12,-9-aw);}
  const hy=-32;c.fillStyle=FU.skin;for(const s of[-1,1]){c.beginPath();c.ellipse(s*12.4,hy+2,2,2.8,0,0,TAU);c.fill();c.stroke();}
  c.fillStyle=gfill(c,-3,hy-4,16,FU.skin,.5,-.1);c.beginPath();c.moveTo(-12.4,hy-2);c.bezierCurveTo(-13.4,hy-16,13.4,hy-16,12.4,hy-2);c.bezierCurveTo(13.6,hy+9,6,hy+12.6,0,hy+12.6);c.bezierCurveTo(-6,hy+12.6,-13.6,hy+9,-12.4,hy-2);c.closePath();c.fill();c.stroke();
  c.fillStyle=gfill(c,-2,hy-12,14,FU.hair,.25,-.15);c.beginPath();c.moveTo(-12.6,hy);c.bezierCurveTo(-14,hy-17,13,hy-18,12.6,hy-2);c.quadraticCurveTo(8,hy-8.5,3,hy-7.5);c.quadraticCurveTo(-3,hy-9,-7,hy-3.5);c.quadraticCurveTo(-9.5,hy-6,-11,hy-4.5);c.quadraticCurveTo(-12.2,hy-2,-12.6,hy);c.closePath();c.fill();c.stroke();
  c.strokeStyle='rgba(255,255,255,.3)';c.beginPath();c.arc(-2,hy-10,6,Math.PI*1.1,Math.PI*1.5);c.stroke();c.strokeStyle=L;
  const happy=o.happy||cl>0||o.dance,blink=(t+1.3)%4.3>4.17,ey=hy+2.6;
  if(happy){c.lineWidth=1.3;for(const s of[-1,1]){c.beginPath();c.arc(s*4.4,ey+.8,1.9,Math.PI*1.1,Math.PI*1.9);c.stroke();}c.lineWidth=1;}
  else if(blink){c.lineWidth=1.2;for(const s of[-1,1]){c.beginPath();c.moveTo(s*4.4-1.8,ey+.6);c.lineTo(s*4.4+1.8,ey+.6);c.stroke();}c.lineWidth=1;}
  else for(const s of[-1,1]){c.fillStyle='#fff';ell(c,s*4.4,ey,2.1,2);c.fillStyle='#2a1a1a';circ(c,s*4.4,ey+.2,1.55);c.fillStyle='#fff';circ(c,s*4.4-.6,ey-.5,.55);}
  c.fillStyle='rgba(255,110,140,.4)';ell(c,-8.2,hy+7,3.2,2.1);ell(c,8.2,hy+7,3.2,2.1);
  c.strokeStyle='rgba(190,120,110,.7)';c.lineWidth=.7;c.beginPath();c.arc(0,hy+6.4,.9,.3,2.8);c.stroke();c.strokeStyle=L;c.lineWidth=1;
  if(o.eat){const m=Math.abs(Math.sin(t*12));c.fillStyle='#d0506a';ell(c,0,hy+9.6,1.8,.5+m*1.5);}
  else if(happy){c.fillStyle='#d0506a';c.beginPath();c.moveTo(-2.4,hy+9);c.quadraticCurveTo(0,hy+12.4,2.4,hy+9);c.closePath();c.fill();}else if(o.oh){c.fillStyle='#d0506a';ell(c,0,hy+9.8,1.6,2);}else{c.fillStyle='#e07a8a';ell(c,0,hy+9.6,1.4,1);}
  rkHat(c,o.hat!==undefined?o.hat:SAVE.rk.hat,hy,t,o.oh);
  c.restore();}
function rkHit(x,y,rx,ry,sc){return Math.abs(x-rx)<16*sc&&y<ry+2*sc&&y>ry-46*sc;}
function rkCheer(){RK.clap=1.4;sfx('giggle');}
const DRESSES=[
  {id:'yukata',style:'yukata',dress:'#fbeaf4',pat:['#ff8cbc','#c9a2e6'],ribbon:'#ff6fa3',sw:'#ffc8e0',ja:'ゆかた',en:'yukata'},
  {id:'yukata2',style:'yukata',dress:'#e8f2ff',pat:['#5aa8ff','#ff8cc0'],ribbon:'#ffc93c',sw:'#bcd8ff',ja:'みずいろの ゆかた',en:'blue yukata'},
  {id:'pink',dress:'#ff8cc0',skirt:'#ffc8e6',ribbon:'#ff4d8d',sw:'#ff8cc0',ja:'ピンク',en:'pink'},
  {id:'yellow',dress:'#ffd84a',skirt:'#fff2a8',ribbon:'#5aa8ff',sw:'#ffd84a',ja:'きいろ',en:'yellow'},
  {id:'mint',dress:'#5fd3a8',skirt:'#b8f0d8',ribbon:'#ff8cc0',sw:'#5fd3a8',ja:'みどり',en:'green'},
  {id:'sky',dress:'#5aa8ff',skirt:'#bfe0ff',ribbon:'#ff4d6d',sw:'#5aa8ff',ja:'あお',en:'blue'},
  {id:'lav',dress:'#b48cff',skirt:'#e0d0ff',ribbon:'#ffd23a',sw:'#b48cff',ja:'むらさき',en:'purple'},
  {id:'red',dress:'#ff4d6d',skirt:'#ffb3c0',ribbon:'#ffd23a',sw:'#ff4d6d',ja:'あか',en:'red'},
  {id:'magic',style:'magic',dress:'#ff7ab8',skirt:'#ffffff',ribbon:'#ff3d8a',sw:'#ff7ab8',ja:'まじかるドレス',en:'magic dress'},
];
const W=600;let H=1000,SC=1,OX=0,OY=0,DPR=1;
function resize(){DPR=Math.min(2,devicePixelRatio||1);const cw=innerWidth,ch=innerHeight;cv.width=Math.round(cw*DPR);cv.height=Math.round(ch*DPR);cv.style.width=cw+'px';cv.style.height=ch+'px';
  H=clamp(W*ch/cw,860,1300);SC=Math.min(cw/W,ch/H);OX=(cw-W*SC)/2;OY=(ch-H*SC)/2;if(scene&&scene.lay)scene.lay();}
addEventListener('resize',resize);
// ================= audio =================
let AC=null,MG=null,BG=null,NB=null;
function audioInit(){if(AC){if(AC.state==='suspended')AC.resume();return;}try{AC=new(window.AudioContext||window.webkitAudioContext)();const comp=AC.createDynamicsCompressor();comp.connect(AC.destination);MG=AC.createGain();MG.gain.value=.34;MG.connect(comp);BG=AC.createGain();BG.gain.value=0;BG.connect(comp);}catch(e){AC=null;}}
function tone(f,d,type='triangle',v=.2,t0=0,slide=0,dest,atk=.01){if(!AC||!SAVE.sound)return;const t=AC.currentTime+Math.max(0,t0);const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,f+slide),t+d);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+atk);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(dest||MG);o.start(t);o.stop(t+d+.03);}
function noise(d,v,freq,t0=0,dest,type='bandpass'){if(!AC||!SAVE.sound)return;if(!NB){NB=AC.createBuffer(1,AC.sampleRate*.6,AC.sampleRate);const a=NB.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;}
  const t=AC.currentTime+Math.max(0,t0),s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=NB;f.type=type;f.frequency.value=freq;f.Q.value=1.1;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(f);f.connect(g);g.connect(dest||MG);s.start(t);s.stop(t+d+.05);}
function sfxBase(k){switch(k){
  case'pop':tone(520,.09,'sine',.28,0,700);break;
  case'tap':tone(880,.06,'sine',.12,0,300);break;
  case'boing':tone(260,.3,'sine',.28,0,380);break;
  case'spark':[1318,1760,2349].forEach((f,i)=>tone(f,.14,'triangle',.13,i*.06));break;
  case'ding':tone(1046,.12,'triangle',.22);tone(1568,.3,'triangle',.2,.1);break;
  case'no':tone(392,.13,'sine',.2);tone(311,.22,'sine',.2,.13);break;
  case'squish':noise(.14,.3,900);break;
  case'water':noise(.14,.1,3000);break;
  case'splash':noise(.3,.3,1500);tone(700,.2,'sine',.08,0,-400);break;
  case'beep':tone(1760,.1,'square',.1);break;
  case'munch':noise(.07,.3,500);noise(.07,.3,500,.16);noise(.07,.3,500,.32);break;
  case'fanfare':[523,659,784,1046,784,1046,1318].forEach((f,i)=>{tone(f,.24,'square',.07,i*.11);tone(f,.3,'triangle',.18,i*.11);});break;
  case'whoosh':noise(.35,.12,800,0,undefined,'lowpass');tone(240,.35,'sine',.1,0,700);break;
  case'honk':tone(392,.16,'square',.09);tone(392,.22,'square',.09,.2);break;
  case'squeak':tone(1400,.12,'sine',.2,0,700);break;
  case'shutter':noise(.05,.4,2000);noise(.08,.3,1200,.07);break;
  case'giggle':[1320,1560,1320,1760].forEach((f,i)=>tone(f,.08,'sine',.12,i*.09,120));break;
  case'crack':noise(.08,.4,1800);tone(900,.05,'square',.06);break;
  case'pour':noise(.7,.12,1200,0,undefined,'lowpass');break;
  case'boom':tone(90,.6,'sine',.4,0,-50);noise(.8,.35,300,0,undefined,'lowpass');break;
  case'launch':tone(300,.6,'sine',.12,0,900);noise(.5,.08,3000);break;
  case'chin':tone(2093,.5,'sine',.2);tone(2637,.6,'sine',.12,.05);break;
  case'coin':tone(1318,.07,'square',.1);tone(1976,.25,'square',.1,.07);break;
  case'tick':tone(1200,.03,'square',.06);break;
  case'bell':tone(1568,.6,'sine',.2);tone(2093,.5,'sine',.1,.02);break;
  case'heart':tone(784,.12,'sine',.2);tone(988,.18,'sine',.18,.1);break;
  case'brush':noise(.12,.18,4000);break;
  case'bite':noise(.06,.35,700);tone(300,.06,'sine',.1);break;
  case'blow':noise(.4,.2,700,0,undefined,'lowpass');break;
  case'snap':tone(1400,.05,'square',.12);tone(700,.08,'triangle',.15,.03);break;
  case'rip':noise(.25,.25,2500);break;
  case'gacha':for(let i=0;i<6;i++)tone(600+i*80,.05,'square',.07,i*.07);break;
  case'open':tone(523,.1,'triangle',.2);tone(784,.1,'triangle',.2,.08);tone(1046,.25,'triangle',.2,.16);noise(.2,.15,3000,.1);break;
}}
// ================= music =================
const _=null;
const SONGS={
  town:{bpm:132,lead:[67,72,76,72,79,_,76,_,77,76,74,76,72,_,67,_,69,72,77,72,81,_,79,_,77,76,74,72,74,_,_,_,76,76,77,79,79,77,76,74,72,72,74,76,76,_,74,_,76,76,77,79,79,77,76,74,72,74,76,74,72,_,_,_],
    roots:[48,48,53,55,48,55,53,48],bell:[_,_,_,_,_,_,_,_,_,_,_,_,84,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,86,_,_,_],drum:'pop'},
  play:{bpm:142,lead:[72,_,74,76,77,_,76,_,74,_,72,_,69,_,_,_,70,_,72,74,76,_,74,_,72,_,70,_,72,_,_,_,77,77,76,74,72,_,74,_,76,76,74,72,70,_,72,_,74,74,72,70,69,_,67,_,65,_,69,72,77,_,_,_],
    roots:[53,53,58,60,53,58,60,53],bell:[],drum:'pop'},
  matsuri:{bpm:124,lead:[74,_,76,74,71,_,69,_,71,74,76,_,74,_,_,_,78,_,76,74,76,_,71,_,69,71,74,_,74,_,_,_,81,_,78,76,74,_,76,_,78,76,74,71,69,_,_,_,71,_,74,76,78,76,74,71,69,_,71,_,74,_,_,_],
    roots:[50,50,55,50,50,55,57,50],bell:[],drum:'taiko'},
  hero:{bpm:156,lead:[69,_,72,76,_,74,72,_,74,_,76,_,79,_,76,_,77,_,76,74,_,72,74,_,76,_,_,_,_,_,_,_,69,_,72,76,_,79,81,_,79,_,77,_,76,_,74,_,72,74,76,_,77,_,79,_,81,_,_,_,84,_,_,_],
    roots:[45,45,41,43,45,45,41,43],bell:[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,88,_,_,_],drum:'pop'},
  fuwa:{bpm:116,lead:[79,_,76,_,77,79,_,_,81,_,79,77,76,_,_,_,74,_,76,77,79,_,76,_,72,_,74,_,72,_,_,_,79,_,84,_,83,81,79,_,81,_,79,_,76,_,_,_,77,76,74,_,76,_,79,_,72,_,_,_,_,_,_,_],
    roots:[48,45,53,55,48,45,53,55],bell:[84,_,_,_,_,_,_,_,88,_,_,_,_,_,_,_,91,_,_,_,_,_,_,_,88,_,_,_,_,_,_,_],drum:'pop'},
};
let curSong=null,bgNext=0,bgStep=0;
const mtof=m=>440*Math.pow(2,(m-69)/12);
function kick(t){if(!AC)return;const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(45,t+.13);g.gain.setValueAtTime(.5,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);o.connect(g);g.connect(BG);o.start(t);o.stop(t+.2);}
function playStep(S,st,t){const dt=t-AC.currentTime,spb=60/S.bpm/2;const m=S.lead[st%S.lead.length];const bar=Math.floor(st/8)%S.roots.length,p=st%8,r=S.roots[bar];
  if(m!=null){tone(mtof(m),spb*1.7,'square',.045,dt,0,BG,.005);tone(mtof(m),spb*1.9,'triangle',.13,dt,0,BG,.005);}
  const bn=[r,_,r+12,_,r+7,_,r+12,r+7][p];if(bn!=null)tone(mtof(bn),spb*.9,'triangle',.26,dt,0,BG,.004);
  if(p%2===1){const ch=[0,4,7,12][((st>>1)%4)];tone(mtof(r+24+ch),spb*.8,'sine',.05,dt,0,BG);}
  const b=S.bell[st%32];if(b)tone(mtof(b),spb*3,'sine',.08,dt,0,BG);
  if(S.drum==='pop'){if(p===0||p===4)kick(t);if(p===2||p===6)noise(.1,.16,1800,dt,BG);noise(.03,p%2?.05:.08,8000,dt,BG,'highpass');}
  else{if(p===0||p===3||p===4)kick(t);if(p===2||p===6){tone(1300,.05,'square',.06,dt,0,BG);tone(900,.06,'triangle',.08,dt,0,BG);}}}
setInterval(()=>{if(!AC||!BG)return;const want=scene&&scene.song!==undefined?scene.song:'play';
  BG.gain.setTargetAtTime(SAVE.sound&&want?(speaking()?.1:.22):0,AC.currentTime,.25);if(!SAVE.sound||!want)return;
  if(want!==curSong){curSong=want;bgStep=0;bgNext=AC.currentTime+.1;}const S=SONGS[want],spb=60/S.bpm/2;
  if(bgNext<AC.currentTime)bgNext=AC.currentTime+.05;
  while(bgNext<AC.currentTime+.22){playStep(S,bgStep,bgNext);bgNext+=spb;bgStep=(bgStep+1)%S.lead.length;}},50);
// ================= voice =================
const hasTTS='speechSynthesis' in window;let JV=null,EV=null;
function pickVoice(v,re,pref){const c=v.filter(x=>re.test(x.lang));for(const p of pref){const f=c.find(x=>p.test(x.name));if(f)return f;}return c.find(x=>x.localService)||c[0]||null;}
function loadVoices(){if(!hasTTS)return;const v=speechSynthesis.getVoices();if(!v.length)return;JV=pickVoice(v,/^ja/i,[/Kyoko|O-ren|Google 日本語|Haruka|Nanami/i]);EV=pickVoice(v,/^en[-_]US/i,[/Samantha|Google US English|Aria|Jenny|Zira|Karen|Allison/i])||pickVoice(v,/^en/i,[/Samantha|Google|Daniel|Karen/i]);}
if(hasTTS){loadVoices();try{speechSynthesis.addEventListener('voiceschanged',loadVoices);}catch(e){speechSynthesis.onvoiceschanged=loadVoices;}}
// 読み上げキュー：日本語→英語 を 1つずつ じゅんばんに（Safari などで 2つめが きえる ことへの たいさく）
const SQ=[];let SCUR=null,SWD=0,SGEN=0,SCAN=0;
function speaking(){return hasTTS&&(!!SCUR||SQ.length>0);}
function speak(text,lang,pitch){if(!SAVE.sound||!hasTTS||!text)return;SQ.push({text,lang,pitch});if(!SCUR&&SQ.length===1){const w=Math.max(0,140-(Date.now()-SCAN));if(w)setTimeout(spNext,w);else spNext();}}
function spNext(){if(SCUR||!SQ.length)return;const q=SQ.shift();if(!JV||!EV)loadVoices();const g=++SGEN;
  try{const u=new SpeechSynthesisUtterance(q.text);const en=q.lang==='en';u.lang=en?'en-US':'ja-JP';const v=en?EV:JV;if(v)u.voice=v;u.rate=en?.85:1.02;u.pitch=q.pitch||(en?1.2:1.35);u.volume=1;SCUR=u;
    const done=()=>{if(g!==SGEN)return;SCUR=null;clearTimeout(SWD);if(SQ.length)setTimeout(spNext,60);};u.onend=done;u.onerror=done;SWD=setTimeout(done,2500+q.text.length*(en?160:200));
    try{speechSynthesis.resume();}catch(e){}speechSynthesis.speak(u);}catch(e){SCUR=null;}}
let TTSOK=0;function ttsUnlock(){if(TTSOK||!hasTTS)return;TTSOK=1;try{loadVoices();const u=new SpeechSynthesisUtterance(' ');u.volume=0;u.lang='en-US';speechSynthesis.speak(u);}catch(e){}}
function hush(){if(!hasTTS)return;SQ.length=0;SGEN++;SCUR=null;clearTimeout(SWD);SCAN=Date.now();try{speechSynthesis.cancel();}catch(e){}}
// Chrome の タッチは ゆびを はなした ときに はじめて 音声が ゆるされるので、pointerup でも アンロックして さいごの セリフを いいなおす
let LASTSAY=null,TTSUP=0;function ttsUnlockUp(){if(TTSUP||!hasTTS)return;TTSUP=1;try{loadVoices();speechSynthesis.resume();if(!speaking()&&LASTSAY&&performance.now()-LASTSAY.t<6000){const L=LASTSAY;hush();for(const [t,l] of L.list)speak(t,l);}}catch(e){}}
let bub=null,card=null;
function say(text){hush();const tx=text.replace(/[☆♪]/g,'');speak(tx);LASTSAY={t:performance.now(),list:[[tx,'ja']]};bub={text,t:0,life:Math.max(2.6,text.length*.17)};}
function sayWord(k,extra){const w=WORDS[k];if(!w)return;hush();if(extra)speak(extra);speak(w[0]);speak(w[1],'en');LASTSAY={t:performance.now(),list:[[w[0],'ja'],[w[1],'en']]};card={k,ja:w[0],en:w[1],t:0};}
function sayPair(ja,en,k){hush();speak(ja);if(en)speak(en,'en');card={k,ja,en,t:0};}
// ================= particles =================
const parts=[];
function burst(x,y,n,kind){for(let i=0;i<n;i++){const a=Math.random()*TAU,s=rand(80,260);parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-120,life:rand(.7,1.3),t:0,kind:kind||pick(['star','heart','dot']),col:pick(['#ffd23a','#ff8cc0','#7ad8ff','#b8a0ff','#8ef0b0','#ff9a5c']),r:rand(6,12),rot:rand(0,6)});}}
function confetti(n){for(let i=0;i<n;i++)parts.push({x:rand(0,W),y:rand(-200,-10),vx:rand(-40,40),vy:rand(120,260),life:rand(2.5,4),t:0,kind:'conf',col:pick(['#ffd23a','#ff8cc0','#7ad8ff','#b8a0ff','#8ef0b0','#ff6f91']),r:rand(6,10),rot:rand(0,6),vr:rand(-6,6)});}
function bubbles(x,y,n){for(let i=0;i<n;i++)parts.push({x:x+rand(-20,20),y:y+rand(-10,10),vx:rand(-30,30),vy:rand(-120,-40),life:rand(.8,1.6),t:0,kind:'bub',r:rand(6,14)});}
function ring(x,y,col){parts.push({x,y,vx:0,vy:0,life:.45,t:0,kind:'ring',col:col||'rgba(255,255,255,.9)',r:10});}
function drops(x,y,n,col){for(let i=0;i<n;i++)parts.push({x:x+rand(-10,10),y,vx:rand(-120,120),vy:rand(-260,-80),life:rand(.6,1),t:0,kind:'drop',col:col||'#7ac8ff'});}
function puff(x,y,n,col){for(let i=0;i<n;i++)parts.push({x:x+rand(-15,15),y:y+rand(-10,10),vx:rand(-60,60),vy:rand(-80,-20),life:rand(.6,1.1),t:0,kind:'puff',col:col||'#fff',r:rand(10,20)});}
function updParts(dt){for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
  if(p.kind==='txt'){p.vy*=.9;}else if(p.kind==='conf'){p.rot+=p.vr*dt;p.vx+=Math.sin(p.t*3)*20*dt;}else if(p.kind==='bub'){p.vx*=.98;}else if(p.kind==='drop'){p.vy+=900*dt;}else if(p.kind==='puff'){p.vx*=.95;p.vy*=.95;p.r+=dt*20;}else if(p.kind==='ring'){p.r+=dt*120;}else if(p.kind==='fw'){p.vx*=.97;p.vy=p.vy*.97+60*dt;}else{p.vy+=380*dt;p.vx*=.98;}
  if(p.t>p.life)parts.splice(i,1);}}
function drawParts(c){for(const p of parts){const a=Math.min(1,(p.life-p.t)*3);c.globalAlpha=Math.max(0,a);
  if(p.kind==='bub'){c.strokeStyle='rgba(120,190,255,.8)';c.lineWidth=2;c.fillStyle='rgba(220,240,255,.45)';c.beginPath();c.arc(p.x,p.y,p.r,0,TAU);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.9)';circ(c,p.x-p.r*.35,p.y-p.r*.35,p.r*.25);}
  else if(p.kind==='drop'){c.fillStyle=p.col;ell(c,p.x,p.y,3,6);}
  else if(p.kind==='puff'){c.globalAlpha=Math.max(0,a*.7);c.fillStyle=p.col;circ(c,p.x,p.y,p.r);}
  else if(p.kind==='ring'){c.strokeStyle=p.col;c.lineWidth=4*(1-p.t/p.life);c.beginPath();c.arc(p.x,p.y,p.r,0,TAU);c.stroke();}
  else if(p.kind==='fw'){c.fillStyle=p.col;circ(c,p.x,p.y,p.r*(1-p.t/p.life*.6));c.globalAlpha=Math.max(0,a*.4);circ(c,p.x,p.y,p.r*2.2);}
  else if(p.kind==='conf'){c.save();c.translate(p.x,p.y);c.rotate(p.rot);c.fillStyle=p.col;c.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);c.restore();}
  else if(p.kind==='txt'){const k=elastic(Math.min(1,p.t*3));c.save();c.translate(p.x,p.y);c.scale(k,k);txtO(c,p.text,0,0,p.r,p.col,'#fff',8);c.restore();}
  else if(p.kind==='note'){c.fillStyle=p.col;c.font=`${p.r*2}px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.fillText('♪',p.x,p.y);}
  else{c.fillStyle=p.col;if(p.kind==='heart'){heartP(c,p.x,p.y,p.r*.8);c.fill();}else if(p.kind==='star'){star(c,p.x,p.y,p.r,p.r*.45,5,p.rot+p.t*4);c.fill();}else circ(c,p.x,p.y,p.r*.5);}}
  c.globalAlpha=1;}
// ================= items (sprite-cached with soft shading) =================
function OL(c,col,w=3){c.strokeStyle=shade(col,-.4);c.lineWidth=w;}
function rawItem(c,k,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);c.lineJoin='round';c.lineCap='round';
  const hl=(x,y,rx,ry)=>{c.fillStyle='rgba(255,255,255,.6)';ell(c,x,y,rx,ry);};
  switch(k){
    case'strawberry':c.fillStyle='#ff4d6d';OL(c,'#ff4d6d');c.beginPath();c.moveTo(0,24);c.bezierCurveTo(-28,4,-24,-18,0,-15);c.bezierCurveTo(24,-18,28,4,0,24);c.fill();c.stroke();c.fillStyle='#fff3a0';for(const[a,b]of[[-9,-3],[7,-5],[0,7],[-10,8],[10,6],[-1,-9],[3,15]])ell(c,a,b,1.7,2.3);c.fillStyle='#4cc06a';OL(c,'#4cc06a',2.5);star(c,0,-16,12,5,6);c.fill();c.stroke();hl(-9,-7,4,3);break;
    case'cherry':c.strokeStyle='#3a8a3a';c.lineWidth=3;c.beginPath();c.moveTo(-10,4);c.quadraticCurveTo(-5,-16,4,-22);c.moveTo(10,6);c.quadraticCurveTo(8,-10,4,-22);c.stroke();c.fillStyle='#6cd08a';ell(c,10,-22,8,4);
      for(const[a,b]of[[-11,9],[10,11]]){c.fillStyle='#ff2a5a';OL(c,'#ff2a5a');c.beginPath();c.arc(a,b,12,0,TAU);c.fill();c.stroke();hl(a-4,b-4,3.5,2.5);}break;
    case'blueberry':for(const[a,b]of[[-10,5],[10,5],[0,-8]]){c.fillStyle='#5a6ae8';OL(c,'#5a6ae8');c.beginPath();c.arc(a,b,12,0,TAU);c.fill();c.stroke();hl(a-4,b-4,3,2);c.fillStyle='#3a3a8a';star(c,a,b+2,3,1.2,5);c.fill();}break;
    case'choco':c.rotate(.2);c.fillStyle='#7a4a2a';OL(c,'#7a4a2a');rr(c,-22,-15,44,30,6);c.fill();c.stroke();c.strokeStyle='#9a6a4a';c.lineWidth=2;for(const a of[-7,7]){c.beginPath();c.moveTo(a,-13);c.lineTo(a,13);c.stroke();}c.beginPath();c.moveTo(-20,0);c.lineTo(20,0);c.stroke();break;
    case'starcandy':c.fillStyle='#ffd23a';OL(c,'#ffb000');star(c,0,0,26,12,5);c.fill();c.stroke();hl(-6,-8,5,3);break;
    case'heartcookie':c.fillStyle='#e8a860';OL(c,'#e8a860');heartP(c,0,-2,24);c.fill();c.stroke();c.fillStyle='#ff8cc0';heartP(c,0,-2,15);c.fill();hl(-7,-8,4,2.5);break;
    case'candle':{c.fillStyle='#fff';OL(c,'#ff8cc0',2.5);rr(c,-6,-26,12,40,4);c.fill();c.stroke();c.strokeStyle='#ff8cc0';c.lineWidth=3;for(let i=0;i<3;i++){c.beginPath();c.moveTo(-6,-18+i*12);c.lineTo(6,-24+i*12);c.stroke();}
      c.strokeStyle='#5a3a2a';c.lineWidth=2;c.beginPath();c.moveTo(0,-26);c.lineTo(0,-31);c.stroke();const f=Math.sin(T*14)*1.5;c.fillStyle='#ffb03a';c.beginPath();c.ellipse(0,-39,6+f*.3,10+f,0,0,TAU);c.fill();c.fillStyle='#fff2a0';ell(c,0,-36,3,5);break;}
    case'apple':c.fillStyle='#ff4d4d';OL(c,'#ff4d4d');c.beginPath();c.moveTo(0,-14);c.bezierCurveTo(14,-26,32,-10,22,10);c.bezierCurveTo(14,28,4,24,0,20);c.bezierCurveTo(-4,24,-14,28,-22,10);c.bezierCurveTo(-32,-10,-14,-26,0,-14);c.fill();c.stroke();
      c.strokeStyle='#7a4a2a';c.lineWidth=3;c.beginPath();c.moveTo(0,-14);c.lineTo(2,-24);c.stroke();c.fillStyle='#4cc06a';OL(c,'#4cc06a',2);c.beginPath();c.ellipse(9,-22,8,4,-.4,0,TAU);c.fill();c.stroke();hl(-11,-4,5,7);break;
    case'banana':c.fillStyle='#ffe04a';OL(c,'#e8b800');c.beginPath();c.moveTo(-24,-12);c.quadraticCurveTo(-18,22,24,10);c.quadraticCurveTo(26,6,22,4);c.quadraticCurveTo(-8,12,-16,-14);c.closePath();c.fill();c.stroke();c.fillStyle='#7a5a2a';ell(c,-21,-13,3,3);break;
    case'carrot':c.fillStyle='#4cc06a';OL(c,'#4cc06a',2.5);for(const a of[-.5,0,.5]){c.save();c.translate(0,-16);c.rotate(a);c.beginPath();c.ellipse(0,-10,5,12,0,0,TAU);c.fill();c.stroke();c.restore();}
      c.fillStyle='#ff9a3a';OL(c,'#ff9a3a');c.beginPath();c.moveTo(-14,-16);c.quadraticCurveTo(0,-22,14,-16);c.quadraticCurveTo(6,10,0,28);c.quadraticCurveTo(-6,10,-14,-16);c.fill();c.stroke();c.strokeStyle='#d8702a';c.lineWidth=2;for(const[a,b]of[[-8,-6],[6,2],[-4,10]]){c.beginPath();c.moveTo(a,b);c.lineTo(a+6,b);c.stroke();}break;
    case'milk':c.fillStyle='#ffffff';OL(c,'#9ab0d8');rr(c,-16,-14,32,40,4);c.fill();c.stroke();c.beginPath();c.moveTo(-16,-14);c.lineTo(0,-28);c.lineTo(16,-14);c.closePath();c.fill();c.stroke();c.fillStyle='#5aa8ff';c.fillRect(-15,0,30,12);c.fillStyle='#fff';circ(c,0,6,4);break;
    case'bread':c.fillStyle='#e8a860';OL(c,'#c8803a');rr(c,-26,-14,52,30,14);c.fill();c.stroke();c.fillStyle='#f4c888';rr(c,-22,-12,44,12,8);c.fill();c.strokeStyle='#c8803a';c.lineWidth=2.5;for(const a of[-10,2,14]){c.beginPath();c.moveTo(a,-10);c.lineTo(a-6,0);c.stroke();}break;
    case'fish':c.fillStyle='#5aa8ff';OL(c,'#3a78d8');c.beginPath();c.moveTo(-26,0);c.quadraticCurveTo(-2,-22,20,-2);c.lineTo(30,-12);c.lineTo(28,12);c.lineTo(20,2);c.quadraticCurveTo(-2,22,-26,0);c.fill();c.stroke();c.fillStyle='#fff';circ(c,-14,-3,4.5);c.fillStyle='#2a2a4a';circ(c,-14,-3,2.3);c.strokeStyle='#bfe0ff';c.lineWidth=2;c.beginPath();c.arc(-2,0,8,-1,1);c.stroke();break;
    case'egg':c.fillStyle='#fffaf0';OL(c,'#d8c8a8');c.beginPath();c.ellipse(0,2,19,24,0,0,TAU);c.fill();c.stroke();hl(-7,-8,5,7);break;
    case'cheese':c.fillStyle='#ffd84a';OL(c,'#e8b000');c.beginPath();c.moveTo(-26,14);c.lineTo(24,14);c.lineTo(24,-6);c.lineTo(-26,-14);c.closePath();c.fill();c.stroke();c.fillStyle='#f0b800';for(const[a,b,r]of[[-12,4,4],[6,6,5],[14,-2,3],[-2,-4,2.5]])circ(c,a,b,r);break;
    case'tomato':c.fillStyle='#ff4d3a';OL(c,'#ff4d3a');c.beginPath();c.ellipse(0,3,24,21,0,0,TAU);c.fill();c.stroke();c.fillStyle='#4cc06a';OL(c,'#4cc06a',2);star(c,0,-16,11,4,5);c.fill();c.stroke();hl(-9,-3,5,6);break;
    case'grapes':c.strokeStyle='#5a8a3a';c.lineWidth=3;c.beginPath();c.moveTo(0,-20);c.lineTo(2,-28);c.stroke();c.fillStyle='#6cd08a';ell(c,10,-24,8,4);for(const[a,b]of[[-12,-12],[0,-12],[12,-12],[-6,0],[6,0],[0,12]]){c.fillStyle='#9a5ad8';OL(c,'#9a5ad8',2);c.beginPath();c.arc(a,b,8,0,TAU);c.fill();c.stroke();hl(a-3,b-3,2.5,2);}break;
    case'bone':c.fillStyle='#fffaf0';OL(c,'#c8b898');rr(c,-18,-7,36,14,6);c.fill();c.stroke();for(const[a,b]of[[-20,-7],[-20,7],[20,-7],[20,7]]){c.beginPath();c.arc(a,b,8,0,TAU);c.fill();c.stroke();}c.fillStyle='#fffaf0';c.fillRect(-18,-6,36,12);break;
    case'bamboo':c.fillStyle='#6cc86a';OL(c,'#3a9a4a');rr(c,-7,-28,14,56,6);c.fill();c.stroke();c.strokeStyle='#3a9a4a';c.lineWidth=2.5;for(const b of[-10,8]){c.beginPath();c.moveTo(-7,b);c.lineTo(7,b);c.stroke();}c.fillStyle='#8ee07a';OL(c,'#3a9a4a',2);c.beginPath();c.ellipse(15,-14,12,5,-.5,0,TAU);c.fill();c.stroke();c.beginPath();c.ellipse(-14,4,11,4.5,.5,0,TAU);c.fill();c.stroke();break;
    case'duck':c.fillStyle='#ffd83a';OL(c,'#e8a800');c.beginPath();c.ellipse(2,8,24,15,0,0,TAU);c.fill();c.stroke();c.beginPath();c.arc(-8,-12,13,0,TAU);c.fill();c.stroke();c.fillStyle='#ff9a3a';OL(c,'#e87a1a',2);c.beginPath();c.ellipse(-22,-9,8,4,0,0,TAU);c.fill();c.stroke();c.fillStyle='#2a2a3a';circ(c,-11,-15,2.6);c.fillStyle='#fff';circ(c,-12,-16,1);c.fillStyle='#ffb3c0';ell(c,-4,-8,3,2);c.fillStyle='#ffe88a';c.beginPath();c.ellipse(8,4,10,6,-.3,0,TAU);c.fill();break;
    case'icepack':c.fillStyle='#9fdcff';OL(c,'#5aa8e8');rr(c,-22,-16,44,34,12);c.fill();c.stroke();c.fillStyle='#ff8cc0';rr(c,-8,-24,16,10,3);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.8)';for(const[a,b]of[[-10,-2],[4,4],[10,-6],[-4,10]]){c.save();c.translate(a,b);c.rotate(.4);c.fillRect(-4,-4,8,8);c.restore();}break;
    case'bandage':c.rotate(-.35);c.fillStyle='#ffd0a8';OL(c,'#e8a878');rr(c,-28,-10,56,20,10);c.fill();c.stroke();c.fillStyle='#fff0e0';rr(c,-9,-8,18,16,4);c.fill();c.fillStyle='#e8a878';for(const a of[-20,-15,15,20])for(const b of[-3,3])circ(c,a,b,1.2);break;
    case'sponge':c.fillStyle='#ffe36a';OL(c,'#e8c000');rr(c,-26,-17,52,34,10);c.fill();c.stroke();c.fillStyle='#f0c830';for(const[a,b,r]of[[-14,-6,3],[2,4,4],[14,-4,3],[-6,8,2.5],[16,8,2]])circ(c,a,b,r);c.fillStyle='rgba(255,255,255,.9)';OL(c,'#9ac8f0',1.5);for(const[a,b,r]of[[-16,-20,6],[-4,-22,8],[10,-20,5]]){c.beginPath();c.arc(a,b,r,0,TAU);c.fill();c.stroke();}break;
    case'shower':c.fillStyle='#d8e0f0';OL(c,'#9aa8c8');rr(c,-6,0,12,36,6);c.fill();c.stroke();c.save();c.rotate(.0);c.beginPath();c.ellipse(0,-6,22,12,0,0,TAU);c.fill();c.stroke();c.restore();c.fillStyle='#8a98b8';for(let i=-2;i<=2;i++)for(const b of[-3,4])circ(c,i*7,-6+b*.6+ (b>0?2:0),1.6);break;
    case'soap':c.fillStyle='#ff9ac8';OL(c,'#e86aa0');rr(c,-24,-13,48,26,11);c.fill();c.stroke();hl(-8,-5,10,4);c.fillStyle='rgba(255,255,255,.9)';OL(c,'#9ac8f0',1.5);for(const[a,b,r]of[[12,-18,6],[22,-10,4]]){c.beginPath();c.arc(a,b,r,0,TAU);c.fill();c.stroke();}break;
    case'bubble':c.fillStyle='rgba(200,235,255,.55)';c.strokeStyle='#7ac0f0';c.lineWidth=3;c.beginPath();c.arc(0,0,24,0,TAU);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.9)';ell(c,-9,-9,6,4);c.strokeStyle='rgba(255,160,220,.6)';c.lineWidth=2;c.beginPath();c.arc(0,0,17,.3,1.4);c.stroke();break;
    case'cart':c.strokeStyle='#ff5a7a';c.lineWidth=4;c.fillStyle='rgba(255,140,170,.25)';c.beginPath();c.moveTo(-26,-16);c.lineTo(24,-16);c.lineTo(18,8);c.lineTo(-20,8);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(-26,-16);c.lineTo(-32,-24);c.stroke();c.fillStyle='#4a4a6a';circ(c,-14,16,5);circ(c,14,16,5);break;
    case'dress':c.fillStyle='#ff8cc0';OL(c,'#ff8cc0');c.beginPath();c.moveTo(-8,-24);c.lineTo(8,-24);c.lineTo(10,-8);c.lineTo(26,22);c.quadraticCurveTo(0,28,-26,22);c.lineTo(-10,-8);c.closePath();c.fill();c.stroke();bow(c,0,-9,4,'#ff4d8d');break;
    case'crown':c.fillStyle='#ffd23a';OL(c,'#e8a800');c.beginPath();c.moveTo(-24,14);c.lineTo(-26,-12);c.lineTo(-12,0);c.lineTo(0,-20);c.lineTo(12,0);c.lineTo(26,-12);c.lineTo(24,14);c.closePath();c.fill();c.stroke();c.fillStyle='#ff4d8d';heartP(c,0,5,6);c.fill();c.fillStyle='#5aa8ff';circ(c,-14,7,3);circ(c,14,7,3);break;
    case'ribbon':bow(c,0,0,11,'#ff5fa2');break;
    case'cake':c.fillStyle='#f5c77a';OL(c,'#d8a050');rr(c,-26,-6,52,28,6);c.fill();c.stroke();c.fillStyle='#ff9ac8';c.fillRect(-25,4,50,5);c.fillStyle='#fff';rr(c,-28,-14,56,12,6);c.fill();c.stroke();rawItem(c,'strawberry',0,-26,.55);break;
    case'medicine':c.fillStyle='#8ac8ff';OL(c,'#5a98e8');rr(c,-14,-16,28,36,6);c.fill();c.stroke();c.fillStyle='#fff';rr(c,-9,-26,18,10,3);c.fill();c.stroke();c.fillStyle='#fff';rr(c,-10,-6,20,16,3);c.fill();c.fillStyle='#ff4d6d';c.fillRect(-2,-4,4,12);c.fillRect(-6,0,12,4);break;
    case'letterA':c.fillStyle='#fff';OL(c,'#ff8cc0');rr(c,-24,-24,48,48,12);c.fill();c.stroke();c.fillStyle='#ff5fa2';c.font=`800 34px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('あ',0,2);break;
    case'letterABC':c.fillStyle='#fff';OL(c,'#5aa8ff');rr(c,-24,-24,48,48,12);c.fill();c.stroke();c.fillStyle='#3a88e8';c.font=`800 34px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('A',0,3);break;
    case'pencil':c.rotate(-.7);c.fillStyle='#ffd23a';OL(c,'#e8a800');c.fillRect(-6,-22,12,34);c.strokeRect(-6,-22,12,34);c.fillStyle='#ffd8b0';c.beginPath();c.moveTo(-6,12);c.lineTo(6,12);c.lineTo(0,26);c.closePath();c.fill();c.stroke();c.fillStyle='#4a3a4a';c.beginPath();c.moveTo(-2,21);c.lineTo(2,21);c.lineTo(0,26);c.fill();c.fillStyle='#ff8cc0';c.fillRect(-6,-28,12,7);break;
    case'thermometer':c.rotate(-.5);c.fillStyle='#fff';OL(c,'#9ab0d8');rr(c,-5,-28,10,44,5);c.fill();c.stroke();c.fillStyle='#ff4d6d';c.fillRect(-1.6,-14,3.2,26);c.beginPath();c.arc(0,18,7,0,TAU);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.7)';circ(c,-2,16,2);c.strokeStyle='#9ab0d8';c.lineWidth=1.5;for(let i=0;i<5;i++){c.beginPath();c.moveTo(2,-22+i*6);c.lineTo(5,-22+i*6);c.stroke();}break;
    case'spray':c.fillStyle='#8ad8ff';OL(c,'#4aa8e8');rr(c,-12,-8,24,34,8);c.fill();c.stroke();c.fillStyle='#fff';rr(c,-8,0,16,14,4);c.fill();c.fillStyle='#4aa8e8';c.fillRect(-1.5,2,3,10);c.fillRect(-5,5.5,10,3);c.fillStyle='#ff8cc0';OL(c,'#e0609a');rr(c,-7,-20,14,13,3);c.fill();c.stroke();rr(c,-2,-26,16,7,3);c.fill();c.stroke();break;
    case'spoon':c.rotate(-.6);c.fillStyle='#e8eef8';OL(c,'#9aa8c8');rr(c,-3,-2,6,30,3);c.fill();c.stroke();c.beginPath();c.ellipse(0,-12,11,13,0,0,TAU);c.fill();c.stroke();c.fillStyle='#ff6fa0';ell(c,0,-11,8,9);c.fillStyle='rgba(255,255,255,.6)';ell(c,-3,-14,3,2);break;
    case'shampoo':c.fillStyle='#ffb3d6';OL(c,'#e070a8');rr(c,-14,-12,28,38,9);c.fill();c.stroke();c.fillStyle='#fff';rr(c,-9,-2,18,16,4);c.fill();c.fillStyle='#ff8cc0';heartP(c,0,5,5);c.fill();c.fillStyle='#fff';OL(c,'#c0a0c8');rr(c,-5,-20,10,9,2);c.fill();c.stroke();rr(c,-2,-28,14,6,3);c.fill();c.stroke();break;
    case'towel':c.fillStyle='#ffd0e4';OL(c,'#f090b8');rr(c,-26,-18,52,36,8);c.fill();c.stroke();c.fillStyle='#ffe6f0';rr(c,-26,-18,52,10,[8,8,0,0]);c.fill();c.strokeStyle='#ff9ac8';c.lineWidth=2;c.setLineDash([4,3]);c.beginPath();c.moveTo(-24,10);c.lineTo(24,10);c.stroke();c.setLineDash([]);c.fillStyle='#fff';heartP(c,12,0,5);c.fill();break;
    case'coin':c.fillStyle='#ffd23a';OL(c,'#d8a000');c.beginPath();c.arc(0,0,20,0,TAU);c.fill();c.stroke();c.strokeStyle='#f0b800';c.lineWidth=2.5;c.beginPath();c.arc(0,0,14,0,TAU);c.stroke();c.fillStyle='#f0b000';star(c,0,0,9,4);c.fill();break;
    case'flour':c.fillStyle='#f4ead8';OL(c,'#c8b090');c.beginPath();c.moveTo(-18,-18);c.quadraticCurveTo(0,-26,18,-18);c.lineTo(22,24);c.quadraticCurveTo(0,30,-22,24);c.closePath();c.fill();c.stroke();c.fillStyle='#ffd23a';c.beginPath();c.ellipse(0,4,9,11,0,0,TAU);c.fill();c.fillStyle='#e8a800';c.fillRect(-1,-4,2,16);break;
    case'whisk':c.rotate(-.5);c.fillStyle='#ff8cc0';OL(c,'#e0609a');rr(c,-4,8,8,22,4);c.fill();c.stroke();c.strokeStyle='#9aa8c8';c.lineWidth=2.2;for(const w of[5,10,14]){c.beginPath();c.ellipse(0,-10,w,20,0,0,TAU);c.stroke();}break;
    case'balloon':c.strokeStyle='#8a7a9a';c.lineWidth=2;c.beginPath();c.moveTo(0,18);c.quadraticCurveTo(6,28,0,38);c.stroke();c.fillStyle=gfill(c,-6,-10,24,'#ff6f91');OL(c,'#ff6f91',2.5);c.beginPath();c.ellipse(0,-6,19,23,0,0,TAU);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.55)';ell(c,-7,-14,5,8);c.fillStyle='#ff6f91';c.beginPath();c.moveTo(-4,17);c.lineTo(4,17);c.lineTo(0,13);c.fill();break;
    case'flower':c.strokeStyle='#4cae4a';c.lineWidth=4;c.beginPath();c.moveTo(0,4);c.lineTo(0,30);c.stroke();c.fillStyle='#6cd08a';c.beginPath();c.ellipse(8,22,9,4,-.5,0,TAU);c.fill();c.fillStyle='#ff8cc0';OL(c,'#ff8cc0',2);for(let i=0;i<5;i++){const a=i/5*TAU;c.beginPath();c.ellipse(Math.cos(a)*10,-6+Math.sin(a)*10,9,7,a,0,TAU);c.fill();c.stroke();}c.fillStyle='#ffd23a';circ(c,0,-6,7);break;
    case'wand':c.rotate(-.4);c.fillStyle='#fff';OL(c,'#c0a0c8',2);rr(c,-2.5,-6,5,36,2);c.fill();c.stroke();c.fillStyle='#ffe36a';OL(c,'#e8b000');star(c,0,-14,15,7);c.fill();c.stroke();c.fillStyle='#ff8cc0';heartP(c,0,-14,5);c.fill();break;
    case'goldfish':{const w=Math.sin(T*8)*.2;c.fillStyle='#ff6a3a';OL(c,'#e04a1a');c.save();c.translate(16,0);c.rotate(w);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(14,-18,20,-10);c.quadraticCurveTo(12,0,20,10);c.quadraticCurveTo(14,18,0,0);c.fill();c.stroke();c.restore();
      c.beginPath();c.ellipse(-2,0,20,13,0,0,TAU);c.fill();c.stroke();c.fillStyle='#fff';circ(c,-12,-3,4);c.fillStyle='#2a1a1a';circ(c,-12,-3,2.2);c.fillStyle='#ffb08a';ell(c,-2,6,10,4);c.fillStyle='rgba(255,255,255,.5)';ell(c,-6,-6,6,2.5);break;}
    case'hanabi':for(let i=0;i<12;i++){const a=i/12*TAU;c.strokeStyle=['#ff5f9a','#ffd23a','#5ad0ff'][i%3];c.lineWidth=4;c.beginPath();c.moveTo(Math.cos(a)*7,Math.sin(a)*7);c.lineTo(Math.cos(a)*24,Math.sin(a)*24);c.stroke();c.fillStyle=c.strokeStyle;circ(c,Math.cos(a)*26,Math.sin(a)*26,3);}c.fillStyle='#fff';circ(c,0,0,5);break;
    case'kakigori':c.fillStyle='rgba(210,235,255,.95)';OL(c,'#8ab8e0');c.beginPath();c.moveTo(-18,-2);c.lineTo(18,-2);c.lineTo(12,26);c.lineTo(-12,26);c.closePath();c.fill();c.stroke();c.fillStyle='#ff5f7a';c.beginPath();c.arc(0,-2,20,Math.PI,TAU);c.fill();c.fillStyle='#ff8ca0';circ(c,-8,-12,5);c.fillStyle='#fff';circ(c,6,-14,4);circ(c,-2,-6,3);c.strokeStyle='#ff8cc0';c.lineWidth=2.5;c.beginPath();c.moveTo(8,-4);c.lineTo(22,-26);c.stroke();break;
    case'palette':c.fillStyle='#f4d8a8';OL(c,'#c89a60');c.beginPath();c.ellipse(0,0,28,21,0,0,TAU);c.fill();c.stroke();c.fillStyle='#fffaf0';circ(c,10,8,5);[['#ff4d6d',-14,-6],['#ffd23a',-4,-12],['#5aa8ff',8,-10],['#6cd08a',16,-2],['#b48cff',-14,6]].forEach(([cc,a,b])=>{c.fillStyle=cc;circ(c,a,b,5);});break;
    case'crayon':c.rotate(-.6);c.fillStyle='#ff5f7a';OL(c,'#d83a5a');rr(c,-7,-20,14,36,3);c.fill();c.stroke();c.beginPath();c.moveTo(-7,-20);c.lineTo(0,-32);c.lineTo(7,-20);c.closePath();c.fill();c.stroke();c.fillStyle='#fff';c.fillRect(-7,-8,14,14);c.fillStyle='#ff5f7a';c.fillRect(-5,-4,10,2);c.fillRect(-5,1,10,2);break;
    case'icecream':c.fillStyle='#e8b070';OL(c,'#c08040');c.beginPath();c.moveTo(-13,0);c.lineTo(13,0);c.lineTo(0,30);c.closePath();c.fill();c.stroke();c.strokeStyle='#c08040';c.lineWidth=1.5;for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(i*5-4,2);c.lineTo(i*5+6,18);c.stroke();}
      c.fillStyle='#ffb3d6';OL(c,'#f080b0');c.beginPath();c.arc(0,-4,14,0,TAU);c.fill();c.stroke();c.fillStyle='#b8f0d8';OL(c,'#60c090');c.beginPath();c.arc(0,-20,11,0,TAU);c.fill();c.stroke();c.fillStyle='#ff2a5a';circ(c,0,-32,4);hl(-5,-8,4,3);break;
    case'puzzle':c.fillStyle='#5ac8ff';OL(c,'#2a98d8');c.beginPath();c.moveTo(-18,-18);c.lineTo(-5,-18);c.arc(0,-18,6,Math.PI,0);c.lineTo(18,-18);c.lineTo(18,-5);c.arc(18,0,6,-Math.PI/2,Math.PI/2);c.lineTo(18,18);c.lineTo(-18,18);c.lineTo(-18,5);c.arc(-18,0,6,Math.PI/2,-Math.PI/2,true);c.closePath();c.fill();c.stroke();hl(-8,-8,5,3);break;
    case'note':c.fillStyle='#ff6fa8';OL(c,'#d84a88');c.beginPath();c.ellipse(-10,16,10,7,-.4,0,TAU);c.fill();c.stroke();c.beginPath();c.ellipse(14,10,10,7,-.4,0,TAU);c.fill();c.stroke();c.fillRect(-2,-20,4,36);c.fillRect(22,-26,4,36);c.beginPath();c.moveTo(-2,-20);c.lineTo(26,-26);c.lineTo(26,-16);c.lineTo(-2,-10);c.closePath();c.fill();break;
    case'xylophone':['#ff5a6a','#ffa03a','#ffe04a','#5ad06a','#4aa8ff','#a86aff'].forEach((cc,i)=>{c.fillStyle=cc;OL(c,cc,2);rr(c,-27+i*9,-20+i*2,8,40-i*4,3);c.fill();c.stroke();});c.fillStyle='#fff';for(let i=0;i<6;i++){circ(c,-23+i*9,-14+i*2,1.5);circ(c,-23+i*9,14-i*2,1.5);}break;
    case'mic':c.fillStyle='#5a5a7a';OL(c,'#3a3a5a');rr(c,-5,2,10,28,4);c.fill();c.stroke();c.fillStyle='#d8d8e8';OL(c,'#9a9ab8');c.beginPath();c.arc(0,-10,13,0,TAU);c.fill();c.stroke();c.strokeStyle='#9a9ab8';c.lineWidth=1.5;for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(i*5,-22);c.lineTo(i*5,2);c.stroke();}c.fillStyle='#ff8cc0';c.fillRect(-5,2,10,5);break;
    case'toothbrush':c.rotate(-.6);c.fillStyle='#5ac8ff';OL(c,'#2a98d8');rr(c,-4,-6,8,38,4);c.fill();c.stroke();rr(c,-6,-26,12,22,4);c.fill();c.stroke();c.fillStyle='#fff';OL(c,'#b0c8e0',1.5);for(let i=0;i<4;i++){rr(c,-10,-24+i*5,6,4,1.5);c.fill();c.stroke();}break;
    case'tooth':c.fillStyle='#fff';OL(c,'#b0c0d8');c.beginPath();c.moveTo(-16,-14);c.quadraticCurveTo(-18,-24,-6,-22);c.quadraticCurveTo(0,-19,6,-22);c.quadraticCurveTo(18,-24,16,-14);c.quadraticCurveTo(14,4,10,20);c.quadraticCurveTo(6,24,3,12);c.quadraticCurveTo(0,6,-3,12);c.quadraticCurveTo(-6,24,-10,20);c.quadraticCurveTo(-14,4,-16,-14);c.closePath();c.fill();c.stroke();c.fillStyle='#2a1a22';circ(c,-6,-8,2);circ(c,6,-8,2);c.strokeStyle='#2a1a22';c.lineWidth=1.8;c.beginPath();c.arc(0,-4,4,.3,Math.PI-.3);c.stroke();c.fillStyle='rgba(255,140,170,.5)';ell(c,-11,-3,3,2);ell(c,11,-3,3,2);break;
    case'cup':c.fillStyle='rgba(180,225,255,.8)';OL(c,'#6ab0e0');c.beginPath();c.moveTo(-16,-20);c.lineTo(16,-20);c.lineTo(12,22);c.lineTo(-12,22);c.closePath();c.fill();c.stroke();c.fillStyle='rgba(90,170,255,.6)';c.beginPath();c.moveTo(-14,-6);c.lineTo(14,-6);c.lineTo(12,22);c.lineTo(-12,22);c.closePath();c.fill();c.fillStyle='rgba(255,255,255,.7)';c.fillRect(-11,-16,4,30);break;
    case'poi':c.strokeStyle='#ff8cc0';c.lineWidth=5;c.beginPath();c.moveTo(0,22);c.lineTo(0,46);c.stroke();c.fillStyle='rgba(255,255,255,.75)';c.beginPath();c.arc(0,0,22,0,TAU);c.fill();c.lineWidth=5;c.stroke();break;
    case'uchiwa':c.fillStyle='#e8b070';c.fillRect(-2,6,4,24);c.fillStyle='#ff8cc0';OL(c,'#e0609a');c.beginPath();c.arc(0,-8,22,0,TAU);c.fill();c.stroke();c.fillStyle='#fff';for(let i=0;i<5;i++){const a=i/5*TAU-Math.PI/2;circ(c,Math.cos(a)*7,-8+Math.sin(a)*7,5);}c.fillStyle='#ffd23a';circ(c,0,-8,3.5);break;
    case'corn':c.fillStyle='#8ee07a';OL(c,'#4aa04a',2);c.beginPath();c.moveTo(-4,24);c.quadraticCurveTo(-20,6,-10,-20);c.lineTo(-2,22);c.fill();c.stroke();c.fillStyle='#ffd84a';OL(c,'#e0a800');c.beginPath();c.ellipse(4,-2,11,24,.15,0,TAU);c.fill();c.stroke();c.fillStyle='#f0b800';for(let y=-18;y<20;y+=6)for(let x=-4;x<=10;x+=6)circ(c,x+(y%12?3:0)-2,y,1.6);c.fillStyle='#8ee07a';c.beginPath();c.moveTo(4,26);c.quadraticCurveTo(22,6,14,-14);c.lineTo(8,22);c.fill();c.stroke();break;
    case'star2':c.fillStyle='#ffd23a';OL(c,'#e8a800');star(c,0,0,24,11);c.fill();c.stroke();break;
  }
  c.restore();}

const DYN=new Set(['candle','goldfish']);const SPR={};
function itemSprite(k){if(SPR[k])return SPR[k];const S=200,cv2=document.createElement('canvas');cv2.width=cv2.height=S;const g=cv2.getContext('2d');rawItem(g,k,S/2,S/2,2.5);
  g.globalCompositeOperation='source-atop';const gr=g.createRadialGradient(S*.36,S*.3,4,S*.5,S*.52,S*.5);gr.addColorStop(0,'rgba(255,255,255,.42)');gr.addColorStop(.42,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(70,20,70,.2)');g.fillStyle=gr;g.fillRect(0,0,S,S);return SPR[k]=cv2;}
function drawItem(c,k,x,y,s=1){if(DYN.has(k))return rawItem(c,k,x,y,s);c.drawImage(itemSprite(k),x-40*s,y-40*s,80*s,80*s);}
// ================= animals =================
function drawBtn(c,x,y,r,col,icon,glow){c.save();c.translate(x,y);if(glow){const p=1+Math.sin(T*6)*.06;c.scale(p,p);c.fillStyle='rgba(255,255,255,.5)';circ(c,0,0,r+10+Math.sin(T*6)*4);}
  c.fillStyle=shade(col,-.28);circ(c,0,5,r);c.fillStyle=gfill(c,0,0,r,col,.3,-.1);circ(c,0,0,r);c.fillStyle='rgba(255,255,255,.4)';ell(c,-r*.28,-r*.42,r*.42,r*.2);
  c.strokeStyle='#fff';c.fillStyle='#fff';c.lineWidth=r*.15;c.lineCap='round';c.lineJoin='round';const q=r;
  switch(icon){
    case'home':c.beginPath();c.moveTo(-q*.48,-q*.02);c.lineTo(0,-q*.46);c.lineTo(q*.48,-q*.02);c.stroke();rr(c,-q*.32,-q*.06,q*.64,q*.46,q*.08);c.fill();c.fillStyle=col;rr(c,-q*.1,q*.12,q*.2,q*.28,q*.06);c.fill();break;
    case'book':c.beginPath();c.moveTo(0,-q*.28);c.quadraticCurveTo(-q*.25,-q*.42,-q*.5,-q*.3);c.lineTo(-q*.5,q*.32);c.quadraticCurveTo(-q*.25,q*.2,0,q*.34);c.quadraticCurveTo(q*.25,q*.2,q*.5,q*.32);c.lineTo(q*.5,-q*.3);c.quadraticCurveTo(q*.25,-q*.42,0,-q*.28);c.closePath();c.fill();c.strokeStyle=col;c.lineWidth=q*.08;c.beginPath();c.moveTo(0,-q*.26);c.lineTo(0,q*.3);c.stroke();c.fillStyle='#ffd23a';star(c,-q*.24,-q*.02,q*.14,q*.06);c.fill();break;
    case'sound':case'mute':c.beginPath();c.moveTo(-q*.45,-q*.14);c.lineTo(-q*.2,-q*.14);c.lineTo(q*.08,-q*.4);c.lineTo(q*.08,q*.4);c.lineTo(-q*.2,q*.14);c.lineTo(-q*.45,q*.14);c.closePath();c.fill();
      if(icon==='sound'){c.lineWidth=q*.1;c.beginPath();c.arc(q*.12,0,q*.22,-.9,.9);c.stroke();c.beginPath();c.arc(q*.12,0,q*.4,-.9,.9);c.stroke();}else{c.lineWidth=q*.12;c.beginPath();c.moveTo(q*.22,-q*.18);c.lineTo(q*.5,q*.18);c.moveTo(q*.5,-q*.18);c.lineTo(q*.22,q*.18);c.stroke();}break;
    case'check':c.lineWidth=q*.2;c.beginPath();c.moveTo(-q*.4,0);c.lineTo(-q*.1,q*.3);c.lineTo(q*.42,-q*.3);c.stroke();break;
    case'retry':c.lineWidth=q*.14;c.beginPath();c.arc(0,0,q*.38,-2.6,1.9);c.stroke();c.beginPath();c.moveTo(-q*.58,-q*.5);c.lineTo(-q*.28,-q*.12);c.lineTo(-q*.02,-q*.5);c.closePath();c.fill();break;
    case'camera':rr(c,-q*.5,-q*.3,q*1,q*.66,q*.14);c.fill();rr(c,-q*.18,-q*.44,q*.36,q*.2,q*.06);c.fill();c.fillStyle=col;circ(c,0,q*.04,q*.24);c.fillStyle='#fff';circ(c,0,q*.04,q*.14);break;
    case'play':c.beginPath();c.moveTo(-q*.25,-q*.4);c.lineTo(q*.45,0);c.lineTo(-q*.25,q*.4);c.closePath();c.fill();break;
    case'next':c.lineWidth=q*.18;c.beginPath();c.moveTo(-q*.15,-q*.36);c.lineTo(q*.22,0);c.lineTo(-q*.15,q*.36);c.stroke();break;
    case'prev':c.lineWidth=q*.18;c.beginPath();c.moveTo(q*.15,-q*.36);c.lineTo(-q*.22,0);c.lineTo(q*.15,q*.36);c.stroke();break;
    case'dice':rr(c,-q*.42,-q*.42,q*.84,q*.84,q*.18);c.fill();c.fillStyle=col;for(const [a,b] of [[-.2,-.2],[.2,.2],[0,0],[.2,-.2],[-.2,.2]])circ(c,a*q,b*q,q*.08);break;
    case'bg':rr(c,-q*.46,-q*.36,q*.92,q*.72,q*.1);c.fill();c.fillStyle=col;c.beginPath();c.moveTo(-q*.4,q*.3);c.lineTo(-q*.1,-q*.05);c.lineTo(q*.1,q*.15);c.lineTo(q*.25,0);c.lineTo(q*.4,q*.3);c.fill();circ(c,q*.2,-q*.18,q*.09);break;
    case'pose':c.fillStyle='#fff';circ(c,0,-q*.28,q*.16);c.lineWidth=q*.13;c.beginPath();c.moveTo(0,-q*.1);c.lineTo(0,q*.18);c.moveTo(-q*.36,-q*.3);c.lineTo(0,-q*.02);c.lineTo(q*.36,-q*.3);c.moveTo(-q*.2,q*.44);c.lineTo(0,q*.18);c.lineTo(q*.2,q*.44);c.stroke();break;
    case'house':c.beginPath();c.moveTo(-q*.5,-q*.02);c.lineTo(0,-q*.44);c.lineTo(q*.5,-q*.02);c.closePath();c.fill();rr(c,-q*.34,-q*.08,q*.68,q*.48,q*.06);c.fill();c.fillStyle=col;heartP(c,0,q*.12,q*.2);c.fill();break;
    case'cart':c.lineWidth=q*.1;c.beginPath();c.moveTo(-q*.5,-q*.34);c.lineTo(-q*.32,-q*.34);c.lineTo(-q*.2,q*.16);c.lineTo(q*.36,q*.16);c.lineTo(q*.46,-q*.2);c.lineTo(-q*.28,-q*.2);c.stroke();circ(c,-q*.14,q*.34,q*.1);circ(c,q*.28,q*.34,q*.1);break;
    case'rotate':c.lineWidth=q*.14;c.beginPath();c.arc(0,0,q*.34,-2.2,2.4);c.stroke();c.beginPath();c.moveTo(-q*.5,-q*.46);c.lineTo(-q*.14,-q*.36);c.lineTo(-q*.38,-q*.08);c.closePath();c.fill();break;
    case'box':rr(c,-q*.42,-q*.1,q*.84,q*.5,q*.08);c.fill();c.beginPath();c.moveTo(-q*.48,-q*.1);c.lineTo(-q*.3,-q*.36);c.lineTo(q*.3,-q*.36);c.lineTo(q*.48,-q*.1);c.closePath();c.fill();c.fillStyle=col;rr(c,-q*.14,q*.02,q*.28,q*.1,q*.05);c.fill();break;
    case'plus':case'minus':c.lineWidth=q*.2;c.beginPath();c.moveTo(-q*.34,0);c.lineTo(q*.34,0);if(icon==='plus'){c.moveTo(0,-q*.34);c.lineTo(0,q*.34);}c.stroke();break;
  }
  c.restore();}
const hitC=(x,y,cx,cy,r)=>Math.hypot(x-cx,y-cy)<r;
function drawBubble(c){if(!bub)return;const a=Math.min(1,bub.t*5,(bub.life-bub.t)*3);if(a<=0)return;c.globalAlpha=a;c.font=`800 22px ${FONT}`;
  const lines=[];let cur='';for(const ch of bub.text){cur+=ch;if(c.measureText(cur).width>320){lines.push(cur);cur='';}}if(cur)lines.push(cur);
  const w=Math.min(360,Math.max(...lines.map(l=>c.measureText(l).width))+36),h=lines.length*28+22,x=W/2-w/2+10,y=bubY();
  c.fillStyle='rgba(90,40,110,.15)';rr(c,x+3,y+5,w,h,22);c.fill();c.fillStyle='#fff';c.strokeStyle='#ffb3d6';c.lineWidth=4;rr(c,x,y,w,h,22);c.fill();c.stroke();c.fillStyle='#5a3a5a';c.textAlign='center';c.textBaseline='middle';lines.forEach((l,i)=>c.fillText(l,x+w/2,y+25+i*28));c.globalAlpha=1;}
function drawCard(c){if(!card)return;const a=Math.min(1,card.t*5,(3-card.t)*3);if(a<=0)return;c.save();c.globalAlpha=a;const sc=elastic(Math.min(1,card.t*2.5))*.2+.8;const y=H*.2;c.translate(W/2,y);c.scale(sc,sc);
  c.fillStyle='rgba(90,40,110,.2)';rr(c,-190,-62,380,132,28);c.fill();c.fillStyle='#fffdf6';c.strokeStyle='#ffc93c';c.lineWidth=5;rr(c,-190,-68,380,132,28);c.fill();c.stroke();
  if(card.k)drawThing(c,card.k,-122,-2,1.35);c.textAlign='center';c.textBaseline='middle';const tx=card.k?48:0;
  c.fillStyle='#ff5fa2';c.font=`800 ${card.ja.length>5?34:44}px ${FONT}`;c.fillText(card.ja,tx,card.en?-22:0);
  if(card.en){c.fillStyle='#3a88e8';c.font=`800 30px ${FONT}`;c.fillText(card.en,tx,30);}c.restore();}
function drawHand(c,x,y,t){c.save();c.translate(x,y);c.rotate(-.35);const p=Math.sin(t*8)*3;c.translate(0,p);c.fillStyle='#fff';c.strokeStyle='#8a6a9a';c.lineWidth=3;
  rr(c,-6,-4,12,34,6);c.fill();c.stroke();rr(c,-18,18,36,34,14);c.fill();c.stroke();c.beginPath();c.moveTo(-6,28);c.lineTo(-6,36);c.moveTo(4,28);c.lineTo(4,36);c.stroke();c.restore();
  c.strokeStyle='rgba(255,95,162,.6)';c.lineWidth=3;c.beginPath();c.arc(x,y,14+((t*2)%1)*18,0,TAU);c.stroke();}
function tray(c,y,h=120){c.fillStyle='rgba(90,40,110,.12)';rr(c,14,y-h/2+6,W-28,h,30);c.fill();c.fillStyle=vfill(c,y-h/2,y+h/2,'#ffffff',0,-.04);rr(c,14,y-h/2,W-28,h,30);c.fill();c.strokeStyle='#ffd0e6';c.lineWidth=4;c.stroke();}
function stepDots(c,n,i,yy=128){const x0=W/2-(n-1)*22+30;for(let k=0;k<n;k++){const x=x0+k*44,y=yy;c.fillStyle=k<i?'#ffd23a':k===i?'#ff8cc0':'rgba(255,255,255,.7)';star(c,x,y-0,k===i?13+Math.sin(T*5)*2:11,5);c.fill();c.strokeStyle=k<i?'#e8a800':'#e0c0d8';c.lineWidth=2;c.stroke();}}
function drawTr(c){const k=tr.t<.35?1-tr.t/.35:(tr.t-.35)/.35;const cw=cv.width/DPR,ch=cv.height/DPR;const R=Math.hypot(cw,ch)/2*easeOut(k);c.setTransform(DPR,0,0,DPR,0,0);
  c.fillStyle='#ff9ac8';c.beginPath();c.rect(0,0,cw,ch);c.arc(cw/2,ch/2,Math.max(.1,R),0,TAU,true);c.fill('evenodd');
  if(k<.2){c.fillStyle='#fff';heartP(c,cw/2,ch/2,40);c.fill();}}
// ================= drag helper =================
class Dr{constructor(o){Object.assign(this,{x:0,y:0,hx:0,hy:0,r:48,held:false,s:1,k:'',rot:0,px:0},o);this.x=this.hx;this.y=this.hy;this.px=this.x;}
  upd(dt){if(!this.held){const f=Math.min(1,dt*12);this.x+=(this.hx-this.x)*f;this.y+=(this.hy-this.y)*f;}const ts=this.held?1.25:1;this.s+=(ts-this.s)*Math.min(1,dt*12);
    const vx=(this.x-this.px)/Math.max(dt,.001);this.px=this.x;this.rot+=(clamp(vx*.0012,-.5,.5)-this.rot)*Math.min(1,dt*10);}
  hit(x,y){return Math.hypot(x-this.x,y-this.y)<this.r;}
  draw(c,sz=1.4){if(this.hidden)return;c.fillStyle='rgba(90,40,110,.15)';ell(c,this.x,this.y+30+(this.held?14:0),30*this.s,8);c.save();c.translate(this.x,this.y-(this.held?14:0));c.rotate(this.rot);drawItem(c,this.k,0,0,sz*this.s);c.restore();}}

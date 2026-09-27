// ================= characters =================
const FU={hair:'#2e211f',hairH:'#7a5a50',skin:'#fde8dc',skinS:'#efcdbd',line:'#4a3036'};
function handItem(c,k,x,y,t){c.save();c.translate(x,y);c.lineWidth=1.1;c.strokeStyle=FU.line;
  switch(k){
    case'uchiwa':c.rotate(-.3);c.fillStyle='#e8b070';c.fillRect(-.8,-2,1.6,9);c.fillStyle=gfill(c,0,-9,8,'#ff8cc0');c.beginPath();c.arc(0,-9,7.5,0,TAU);c.fill();c.stroke();c.fillStyle='#fff';for(let i=0;i<5;i++){const a=i/5*TAU;circ(c,Math.cos(a)*2.3,-9+Math.sin(a)*2.3,1.6);}c.fillStyle='#ffd23a';circ(c,0,-9,1.2);break;
    case'kakigori':c.fillStyle='rgba(200,230,255,.9)';c.beginPath();c.moveTo(-5,-4);c.lineTo(5,-4);c.lineTo(3.5,5);c.lineTo(-3.5,5);c.closePath();c.fill();c.stroke();c.fillStyle='#ff5a78';c.beginPath();c.arc(0,-4,6,Math.PI,TAU);c.fill();c.fillStyle='#ff8ca0';circ(c,-2,-7,1.6);c.fillStyle='#fff';circ(c,2,-8,1.3);break;
    case'wand':c.rotate(-.4);c.fillStyle='#fff';c.fillRect(-.9,-4,1.8,14);c.strokeRect(-.9,-4,1.8,14);c.fillStyle='#ffe36a';star(c,0,-8,6,2.7);c.fill();c.stroke();c.fillStyle='#ff8cc0';heartP(c,0,-8,1.8);c.fill();if(Math.sin(t*6)>.5){c.fillStyle='#fff';star(c,5,-14,2,.8,4);c.fill();}break;
    case'bag':c.fillStyle=gfill(c,0,4,7,'#ff8cc0');rr(c,-5,0,10,8,3);c.fill();c.stroke();c.beginPath();c.arc(0,0,3.5,Math.PI,TAU);c.stroke();c.fillStyle='#fff';heartP(c,0,4,1.5);c.fill();break;
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
  c.fillStyle=FU.skinS;rr(c,-2.2,-39.8,4.4,4.8,1);c.fill();
  // arms
  const sleeve=yuk?C.dress:mag?'#ffffff':C.dress;let rh=null;
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
function drawRikki(c,x,y,o={}){const sc=o.sc||2.5,t=o.t??T;c.save();c.translate(x,y);c.scale(sc,sc);const L=FU.line;c.lineJoin='round';c.lineCap='round';c.lineWidth=1;c.strokeStyle=L;
  const hp=o.hop??RK.hop,hop=hp>0?Math.sin(hp*Math.PI)*10:0,mv=o.moving,bob=mv?Math.abs(Math.sin(t*9))*2:Math.sin(t*2)*.5;
  c.fillStyle='rgba(60,30,60,.2)';ell(c,0,0,14-hop*.4,3.6);
  c.translate(0,-hop-bob);if(hp>0&&hp<.25)c.scale(1.1,.9);if(o.dir===1)c.scale(-1,1);if(o.dance)c.rotate(Math.sin(t*5)*.12);
  c.fillStyle=gfill(c,0,-4,12,FU.skin,.4,-.1);for(const s of[-1,1]){c.beginPath();c.ellipse(s*7.4,-4,6.2,4.4,s*.15,0,TAU);c.fill();c.stroke();c.beginPath();c.ellipse(s*12.6,-3.4+(mv?Math.sin(t*9+s)*1.2:0),2.6,3,s*.3,0,TAU);c.fill();c.stroke();c.strokeStyle='rgba(200,130,120,.5)';c.lineWidth=.6;c.beginPath();c.moveTo(s*6,-2);c.quadraticCurveTo(s*8,-1,s*10,-2.4);c.stroke();c.strokeStyle=L;c.lineWidth=1;}
  c.fillStyle=gfill(c,-3,-16,13,'#fff6fa',.3,-.08);c.beginPath();c.moveTo(-10,-5);c.quadraticCurveTo(-12,-19,-6,-22);c.lineTo(6,-22);c.quadraticCurveTo(12,-19,10,-5);c.quadraticCurveTo(0,-2,-10,-5);c.closePath();c.fill();c.stroke();
  c.save();c.clip();[[-5,-16],[4,-10],[-2,-7],[6,-17],[-7,-9],[1,-14],[7,-6]].forEach(([a,b],i)=>{c.fillStyle=i%2?'#ff9cc4':'#f7b8d6';for(let k=0;k<5;k++){const an=k/5*TAU;circ(c,a+Math.cos(an)*1.2,b+Math.sin(an)*1.2,.95);}});c.restore();
  c.strokeStyle='#ff9cc4';c.lineWidth=1.4;c.beginPath();c.moveTo(-5,-22);c.lineTo(1,-12);c.moveTo(5,-22);c.lineTo(-1,-15);c.stroke();c.fillStyle='#ff9cc4';circ(c,2.5,-13,1.2);c.strokeStyle=L;c.lineWidth=1;
  const cl=o.clap??RK.clap;
  const arm=(s,hx,hy)=>{c.strokeStyle=L;c.lineWidth=5.4;c.beginPath();c.moveTo(s*7.5,-18);c.lineTo(hx,hy);c.stroke();c.strokeStyle=FU.skin;c.lineWidth=3.6;c.stroke();c.strokeStyle='#fff6fa';c.lineWidth=3.8;c.beginPath();c.moveTo(s*7.5,-18);c.lineTo(s*7.5+(hx-s*7.5)*.35,-18+(hy+18)*.35);c.stroke();c.lineWidth=1;c.strokeStyle=L;c.fillStyle=FU.skin;c.beginPath();c.arc(hx,hy,2.6,0,TAU);c.fill();c.stroke();};
  if(cl>0){const k=Math.abs(Math.sin(t*14));for(const s of[-1,1])arm(s,s*(2+k*4),-21);}
  else if(o.wave){arm(-1,-12,-9);arm(1,13,-27+Math.sin(t*10)*2);}
  else if(o.dance){const k=Math.sin(t*8);arm(-1,-13,-25+k*4);arm(1,13,-25-k*4);}
  else if(o.eat){arm(-1,-4,-24);arm(1,4,-24);}
  else if(o.toy!==false&&!mv){arm(-1,-7,-15);arm(1,7,-15);c.save();c.translate(0,-15);c.rotate(Math.sin(t*1.5)*.08);const cols=['#ff5a6a','#ffa03a','#ffe04a','#5ad06a','#4aa8ff','#a86aff'];cols.forEach((cc,i)=>{c.fillStyle=cc;c.fillRect(-7+i*2.33,-5,2.4,10);});c.strokeStyle=L;rr(c,-7,-5,14,10,3);c.stroke();c.fillStyle='rgba(255,255,255,.45)';for(let a=-5;a<=5;a+=3.4)for(const b of[-2.5,1.5])circ(c,a,b,.9);c.restore();c.fillStyle=FU.skin;c.beginPath();c.arc(-7,-15,2.6,0,TAU);c.fill();c.stroke();c.beginPath();c.arc(7,-15,2.6,0,TAU);c.fill();c.stroke();}
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
  else if(happy){c.fillStyle='#d0506a';c.beginPath();c.moveTo(-2.4,hy+9);c.quadraticCurveTo(0,hy+12.4,2.4,hy+9);c.closePath();c.fill();}else{c.fillStyle='#e07a8a';ell(c,0,hy+9.6,1.4,1);}
  c.restore();}
function rkHit(x,y,rx,ry,sc){return Math.abs(x-rx)<16*sc&&y<ry+2*sc&&y>ry-46*sc;}
function rkCheer(){RK.clap=1.4;sfx('giggle');}

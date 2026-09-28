// ================= animals (かんじゃさん) =================
// ear: round/long/tri/flop/mouse/koala/ele/none, tail: puff/curl/long/fluff/none
const AN={
  bear:{c:'#c8905a',b:'#f3d6b0',ear:'round',muz:1,tail:'puff'},
  rabbit:{c:'#ffffff',b:'#ffe0ec',ear:'long',tail:'puff'},
  cat:{c:'#ffb35a',b:'#fff0d8',ear:'tri',wh:1,tail:'long',catm:1},
  dog:{c:'#f4dcb4',b:'#fff6e6',ear:'flop',earC:'#b07a4a',muz:1,tail:'fluff',spot:'#e0b888'},
  panda:{c:'#ffffff',b:'#ffffff',ear:'round',earC:'#3a3a4a',patch:1,tail:'puff'},
  pig:{c:'#ffc0d0',b:'#ffe0e8',ear:'tri',snout:1,tail:'curl'},
  chick:{c:'#ffe04a',b:'#fff3a8',ear:'none',chick:1,tail:'none'},
  hippo:{c:'#b8a8dc',b:'#d8ccf0',ear:'round',earC:'#a898cc',big:1,tail:'puff'},
  fox:{c:'#ff9a4a',b:'#fff6ec',ear:'tri',muz:1,tail:'fluff',earIn:'#5a3a2a',tip:'#fff'},
  koala:{c:'#a8a8b8',b:'#e8e8f0',ear:'koala',koala:1,tail:'none'},
  lion:{c:'#ffc85a',b:'#fff0c8',ear:'round',earC:'#f0a83a',mane:'#e8883a',muz:1,tail:'long'},
  tiger:{c:'#ffa03a',b:'#fff8ec',ear:'round',stripes:1,muz:1,wh:1,tail:'long'},
  mouse:{c:'#c8c8d4',b:'#f4f0f8',ear:'mouse',wh:1,tail:'long',catm:1},
  sheep:{c:'#fffaf0',b:'#ffe8d8',ear:'flop',earC:'#ffd8c8',wool:1,face:'#ffe8d8',tail:'puff'},
  elephant:{c:'#a8b8d8',b:'#c8d4ec',ear:'ele',trunk:1,tail:'none'},
  frog:{c:'#7ad06a',b:'#e0f8c8',ear:'none',frog:1,tail:'none'},
};
const ANK=['bear','rabbit','cat','dog','panda','pig','fox','koala','lion','tiger','mouse','sheep','elephant','frog'];
const ACCS=['none','none','ribbon','cap','glasses','flower','scarf','bowtie','beanie'];
function newPatient(pool){const k=pick(pool||ANK);return{k,acc:pick(ACCS),accC:pick(['#ff5fa2','#5aa8ff','#ffb03a','#6cd08a','#b48cff','#ff4d6d'])};}
function drawAnimal(c,k,x,y,s,st={}){const A=AN[k];if(!A)return drawItem(c,k,x,y-45*s,s*1.6);const t=st.t??T;c.save();c.translate(x,y);
  const hop=st.hop>0?Math.sin(st.hop*Math.PI)*28:0;c.fillStyle='rgba(60,40,80,.16)';ell(c,0,0,(46-hop*.3)*s,11*s);c.scale(s,s);
  const bob=st.happy||st.dance?Math.abs(Math.sin(t*7))*7:Math.sin(t*2.2)*1.5;c.translate(st.shake>0?Math.sin(st.shake*40)*5:0,-bob-hop);if(st.hop>0&&st.hop<.2)c.scale(1.1,.9);if(st.dance)c.rotate(Math.sin(t*5)*.1);
  const breathe=1+Math.sin(t*2.4)*.012;
  const base=A.c==='#ffffff'||A.c==='#fffaf0'?'#e4e0ee':A.c,oc=shade(base,-.4);c.strokeStyle=oc;c.lineWidth=3;c.lineJoin='round';c.lineCap='round';const dark='#33303f';
  const fc=(x,y,r,col)=>gfill(c,x,y,r,col,.42,-.16);
  // tail
  const tw=Math.sin(t*3)*.25;if(A.tail!=='none'){c.save();c.translate(26,-20);c.rotate(tw);c.fillStyle=fc(6,-6,14,A.c);
    if(A.tail==='puff'){c.beginPath();c.arc(8,-2,11,0,TAU);c.fill();c.stroke();}
    else if(A.tail==='curl'){c.strokeStyle=shade('#ffc0d0',-.2);c.lineWidth=5;c.beginPath();c.arc(12,-6,7,Math.PI,TAU*1.1);c.stroke();}
    else if(A.tail==='long'){c.strokeStyle=oc;c.lineWidth=10;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(26,-4,24,-34);c.stroke();c.strokeStyle=A.c;c.lineWidth=6;c.stroke();if(k==='lion'){c.fillStyle=A.mane;circ(c,24,-36,7);}}
    else{c.beginPath();c.ellipse(16,-14,11,22,.6,0,TAU);c.fill();c.stroke();if(A.tip){c.fillStyle=A.tip;ell(c,24,-26,6,7);}}c.restore();}
  // feet
  c.fillStyle=A.patch?dark:fc(0,-5,20,A.c);if(!A.chick){for(const sx of[-1,1]){c.beginPath();c.ellipse(sx*18,-5,14,9,0,0,TAU);c.fill();c.stroke();if(!A.patch&&!A.frog){c.fillStyle=shade(A.b,-.05);ell(c,sx*18,-6,6,4);c.fillStyle=fc(0,-5,20,A.c);}}}
  else{c.fillStyle='#ff9a3a';c.strokeStyle='#d8702a';for(const sx of[-1,1]){c.beginPath();c.moveTo(sx*12,-2);c.lineTo(sx*20,0);c.lineTo(sx*6,1);c.closePath();c.fill();c.stroke();}c.strokeStyle=oc;}
  // body
  c.save();c.translate(0,-36);c.scale(1,breathe);c.fillStyle=fc(0,0,36,A.c);c.beginPath();c.ellipse(0,0,36,33,0,0,TAU);c.fill();c.stroke();
  if(A.wool){c.fillStyle=A.c;for(let i=0;i<10;i++){const a=i/10*TAU;circ(c,Math.cos(a)*32,Math.sin(a)*29,9);}c.strokeStyle=oc;c.lineWidth=2;for(let i=0;i<10;i++){const a=i/10*TAU;c.beginPath();c.arc(Math.cos(a)*32,Math.sin(a)*29,9,a-1.2,a+1.2);c.stroke();}c.lineWidth=3;}
  c.fillStyle=A.b;ell(c,0,6,22,21);if(A.stripes){c.strokeStyle='#5a3a2a';c.lineWidth=3;for(const sx of[-1,1])for(let i=0;i<3;i++){c.beginPath();c.moveTo(sx*34,-12+i*10);c.lineTo(sx*24,-8+i*10);c.stroke();}c.strokeStyle=oc;}
  if(A.spot){c.fillStyle=A.spot;ell(c,-20,-12,8,6);}
  c.restore();
  if(st.gown){c.fillStyle=vfill(c,-66,-8,st.gown,.12,-.08);c.beginPath();c.moveTo(-26,-64);c.quadraticCurveTo(0,-56,26,-64);c.lineTo(34,-14);c.quadraticCurveTo(0,-6,-34,-14);c.closePath();c.fill();c.strokeStyle=shade(st.gown,-.3);c.stroke();c.fillStyle='rgba(255,255,255,.6)';for(let i=0;i<3;i++)circ(c,0,-50+i*12,2.5);c.strokeStyle=oc;}
  if(st.acc==='scarf'){c.fillStyle=st.accC||'#ff5fa2';rr(c,-30,-66,60,12,6);c.fill();rr(c,12,-62,12,26,5);c.fill();}
  if(st.acc==='bowtie'){c.fillStyle=st.accC||'#ff5fa2';c.beginPath();c.moveTo(0,-62);c.lineTo(-12,-68);c.lineTo(-12,-56);c.closePath();c.moveTo(0,-62);c.lineTo(12,-68);c.lineTo(12,-56);c.closePath();c.fill();circ(c,0,-62,3);}
  // arms
  c.fillStyle=A.patch?dark:fc(0,-42,14,A.c);const armUp=st.happy||st.dance?Math.sin(t*7)*8:0;
  if(st.tummy){c.beginPath();c.ellipse(-16,-30,10,15,1.1,0,TAU);c.fill();c.stroke();c.beginPath();c.ellipse(16,-30,10,15,-1.1,0,TAU);c.fill();c.stroke();}
  else if(st.wave){c.beginPath();c.ellipse(-33,-42,10,16,.5,0,TAU);c.fill();c.stroke();c.save();c.translate(30,-58);c.rotate(-1.2+Math.sin(t*10)*.3);c.beginPath();c.ellipse(0,-12,10,16,0,0,TAU);c.fill();c.stroke();c.restore();}
  else{c.beginPath();c.ellipse(-33,-42-armUp,10,16,.5,0,TAU);c.fill();c.stroke();c.beginPath();c.ellipse(33,-42-armUp,10,16,-.5,0,TAU);c.fill();c.stroke();}
  // head
  const hy=-88,earC=A.earC||A.c;c.save();const tilt=(st.tilt||0)+(st.sad?Math.sin(t*1.5)*.03:0);c.translate(0,hy);c.rotate(tilt);c.translate(0,-hy);
  const ew=Math.sin(t*2.7+x)*.06;
  if(A.mane){c.fillStyle=fc(0,hy-6,50,A.mane);c.beginPath();for(let i=0;i<18;i++){const a=i/18*TAU,r=i%2?44:52;c.lineTo(Math.cos(a)*r,hy+2+Math.sin(a)*r);}c.closePath();c.fill();c.strokeStyle=shade(A.mane,-.35);c.stroke();c.strokeStyle=oc;}
  if(A.ear==='round'){for(const sx of[-1,1]){c.fillStyle=fc(sx*25,hy-26,12,earC);c.beginPath();c.arc(sx*25,hy-24,A.big?9:12,0,TAU);c.fill();c.stroke();if(!A.patch){c.fillStyle='#ffb3c8';circ(c,sx*25,hy-24,A.big?4:6);}}}
  else if(A.ear==='long'){for(const sx of[-1,1]){c.save();c.translate(sx*13,hy-30);c.rotate(sx*.18+ew*sx+(st.happy?Math.sin(t*7)*.1*sx:0)+(st.sad?sx*.5:0));c.fillStyle=fc(0,-18,20,A.c);c.beginPath();c.ellipse(0,-16,10,26,0,0,TAU);c.fill();c.stroke();c.fillStyle='#ffc0d8';ell(c,0,-16,5,18);c.restore();}}
  else if(A.ear==='tri'){for(const sx of[-1,1]){c.save();c.translate(sx*22,hy-22);c.rotate(ew*sx);c.translate(-sx*22,-(hy-22));c.fillStyle=A.c;c.beginPath();c.moveTo(sx*30,hy-8);c.lineTo(sx*26,hy-40);c.lineTo(sx*8,hy-28);c.closePath();c.fill();c.stroke();c.fillStyle=A.earIn||'#ffc0d8';c.beginPath();c.moveTo(sx*25,hy-14);c.lineTo(sx*24,hy-32);c.lineTo(sx*13,hy-26);c.closePath();c.fill();c.restore();}}
  else if(A.ear==='mouse'){for(const sx of[-1,1]){c.fillStyle=fc(sx*28,hy-24,20,A.c);c.beginPath();c.arc(sx*28,hy-24,20,0,TAU);c.fill();c.stroke();c.fillStyle='#ffc0d8';circ(c,sx*28,hy-24,12);}}
  else if(A.ear==='koala'){for(const sx of[-1,1]){c.fillStyle=fc(sx*32,hy-14,20,A.c);c.beginPath();c.arc(sx*32,hy-14,19,0,TAU);c.fill();c.stroke();c.fillStyle='#f4f0f8';circ(c,sx*32,hy-12,11);}}
  else if(A.ear==='ele'){for(const sx of[-1,1]){c.save();c.translate(sx*34,hy+2);c.rotate(sx*(.1+Math.sin(t*3)*.08));c.fillStyle=fc(0,0,26,A.c);c.beginPath();c.ellipse(sx*6,0,20,28,0,0,TAU);c.fill();c.stroke();c.fillStyle='#ffc8d8';ell(c,sx*6,2,12,19);c.restore();}}
  c.fillStyle=fc(-8,hy-10,40,A.face||A.c);c.beginPath();c.arc(0,hy,34,0,TAU);c.fill();c.stroke();
  if(A.wool){c.fillStyle=A.c;for(let i=0;i<7;i++){const a=Math.PI*1.05+i/6*Math.PI*.9;circ(c,Math.cos(a)*30,hy+Math.sin(a)*30,11);}}
  if(A.chick){c.fillStyle=A.c;c.beginPath();c.moveTo(-4,hy-32);c.quadraticCurveTo(-2,hy-46,6,hy-44);c.quadraticCurveTo(0,hy-40,4,hy-33);c.fill();c.stroke();}
  if(A.frog){for(const sx of[-1,1]){c.fillStyle=fc(sx*16,hy-30,14,A.c);c.beginPath();c.arc(sx*16,hy-28,14,0,TAU);c.fill();c.stroke();}}
  if(A.ear==='flop'){for(const sx of[-1,1]){c.save();c.translate(sx*28,hy-10);c.rotate(ew*sx*1.5);c.translate(-sx*28,-(hy-10));c.fillStyle=fc(sx*31,hy,16,earC);c.beginPath();c.ellipse(sx*31,hy+4,11,21,sx*-.25,0,TAU);c.fill();c.stroke();c.restore();}}
  if(A.patch){c.fillStyle=dark;for(const sx of[-1,1]){c.save();c.translate(sx*13,hy+2);c.rotate(sx*.5);ell(c,0,0,9,12);c.restore();}}
  if(A.stripes){c.strokeStyle='#5a3a2a';c.lineWidth=3;for(const a of[-9,0,9]){c.beginPath();c.moveTo(a,hy-33);c.lineTo(a*.8,hy-22);c.stroke();}for(const sx of[-1,1])for(const d of[-4,4]){c.beginPath();c.moveTo(sx*34,hy+d);c.lineTo(sx*24,hy+d+2);c.stroke();}c.strokeStyle=oc;}
  if(A.catm){c.strokeStyle=shade(A.c,-.2);c.lineWidth=3;for(const a of[-8,0,8]){c.beginPath();c.moveTo(a,hy-33);c.lineTo(a,hy-24);c.stroke();}c.strokeStyle=oc;}
  if(A.muz){c.fillStyle=A.b;ell(c,0,hy+13,15,11);}
  if(A.big){c.fillStyle=A.b;c.beginPath();c.ellipse(0,hy+16,26,17,0,0,TAU);c.fill();c.stroke();c.fillStyle=oc;ell(c,-9,hy+10,3,4);ell(c,9,hy+10,3,4);}
  if(A.snout){c.fillStyle='#ff9ab8';c.beginPath();c.ellipse(0,hy+10,12,9,0,0,TAU);c.fill();c.stroke();c.fillStyle='#d86a8a';ell(c,-4,hy+10,2.5,3.5);ell(c,4,hy+10,2.5,3.5);}
  if(A.tip){c.fillStyle='#fff';c.beginPath();c.moveTo(-30,hy+6);c.quadraticCurveTo(0,hy+34,30,hy+6);c.quadraticCurveTo(0,hy+18,-30,hy+6);c.fill();}
  // eyes
  const happy=st.happy||st.eat>0||st.dance,blink=((t*1.3+x*.01)%3.6)>3.46;const ey=A.big?hy-8:A.frog?hy-28:hy+2,ex=A.frog?16:13,lk=(st.look||0)*2.5;
  const ecol=A.patch?'#fff':dark;
  if(happy){c.strokeStyle=ecol;c.lineWidth=3.2;for(const sx of[-1,1]){c.beginPath();c.arc(sx*ex,ey+1,5.5,Math.PI*1.1,Math.PI*1.9);c.stroke();}}
  else if(st.cry){c.strokeStyle=ecol;c.lineWidth=3;for(const sx of[-1,1]){c.beginPath();c.moveTo(sx*ex-6,ey);c.lineTo(sx*ex+6,ey+(sx>0?-2:2));c.stroke();}c.fillStyle='rgba(120,200,255,.85)';for(const sx of[-1,1]){const d=(t*1.6+(sx>0?.5:0))%1;ell(c,sx*(ex+4),ey+6+d*26,3.5,5);}}
  else if(blink&&!st.sad){c.strokeStyle=ecol;c.lineWidth=3;for(const sx of[-1,1]){c.beginPath();c.moveTo(sx*ex-5,ey+1);c.quadraticCurveTo(sx*ex,ey+3,sx*ex+5,ey+1);c.stroke();}}
  else{for(const sx of[-1,1]){c.fillStyle=A.patch?'#1a1a2a':dark;ell(c,sx*ex+lk,ey,5.8,7.2);c.fillStyle='#fff';circ(c,sx*ex-2+lk,ey-3,2.4);circ(c,sx*ex+2+lk,ey+2.4,1.1);}
    if(st.sad||st.scared){c.strokeStyle=dark;c.lineWidth=2.5;for(const sx of[-1,1]){c.beginPath();c.moveTo(sx*7,ey-11);c.lineTo(sx*19,ey-7);c.stroke();}}}
  // nose & mouth
  if(A.chick){c.fillStyle='#ff9a3a';c.strokeStyle='#d8702a';c.lineWidth=2;c.beginPath();c.moveTo(-7,hy+10);c.lineTo(7,hy+10);c.lineTo(0,hy+(st.eat>0||st.open?20+Math.sin(t*14)*3:17));c.closePath();c.fill();c.stroke();}
  else if(A.koala){c.fillStyle='#4a4050';ell(c,0,hy+8,8,11);c.fillStyle='rgba(255,255,255,.5)';ell(c,-2,hy+3,2,3);}
  else if(!A.snout&&!A.big&&!A.trunk&&!A.frog){c.fillStyle=k==='rabbit'||A.catm?'#ff8cb0':dark;ell(c,0,hy+(A.muz?8:10),A.muz?6:4,A.muz?4.5:3);}
  c.strokeStyle=dark;c.lineWidth=2.5;const my=hy+(A.big?24:A.snout?22:A.muz?15:A.koala?22:A.frog?10:16);
  if(!A.chick){if(st.open){c.fillStyle='#c83a5a';ell(c,0,my+4,A.frog?16:9,8);c.fillStyle='#ff8cb0';ell(c,0,my+8,5,3);}
    else if(st.eat>0){const o=Math.abs(Math.sin(t*14));c.fillStyle='#c83a5a';ell(c,0,my+3,6,1+o*5);}
    else if(st.cry){c.fillStyle='#c83a5a';ell(c,0,my+4,7,4+Math.abs(Math.sin(t*8))*2);}
    else if(st.sad||st.scared){c.beginPath();c.arc(0,my+8,6,Math.PI*1.2,Math.PI*1.8);c.stroke();}
    else if(happy){c.fillStyle='#c83a5a';c.beginPath();c.arc(0,my,A.frog?12:7,0,Math.PI);c.closePath();c.fill();c.fillStyle='#ff8cb0';ell(c,0,my+4,4,2.5);}
    else if(A.frog){c.beginPath();c.arc(0,my-6,14,.3,Math.PI-.3);c.stroke();}
    else{c.beginPath();c.arc(-4,my,4,0,Math.PI);c.arc(4,my,4,0,Math.PI);c.stroke();}}
  if(A.trunk){const sw=Math.sin(t*2)*6;c.strokeStyle=oc;c.lineWidth=16;c.beginPath();c.moveTo(0,hy+4);c.quadraticCurveTo(sw,hy+30,8+sw,hy+44);c.stroke();c.strokeStyle=A.c;c.lineWidth=11;c.stroke();c.strokeStyle=shade(A.c,-.2);c.lineWidth=1.5;for(let i=0;i<3;i++){c.beginPath();c.moveTo(-5+sw*.3*i,hy+16+i*8);c.lineTo(5+sw*.3*i,hy+16+i*8);c.stroke();}}
  if(A.wh){c.strokeStyle=oc;c.lineWidth=1.8;for(const sx of[-1,1])for(const d of[-3,3]){c.beginPath();c.moveTo(sx*16,hy+12+d);c.lineTo(sx*32,hy+10+d*2);c.stroke();}}
  c.fillStyle=st.sick?'rgba(255,60,80,.55)':'rgba(255,120,150,.42)';ell(c,-22,hy+12,st.sick?9:6.5,st.sick?6:4);ell(c,22,hy+12,st.sick?9:6.5,st.sick?6:4);
  if(st.sweat){c.fillStyle='rgba(140,210,255,.9)';const d=(t*.8)%1;ell(c,30,hy-18+d*14,4,6);}
  // accessories
  const acc=st.acc,ac=st.accC||'#ff5fa2';
  if(acc==='ribbon')bow(c,20,hy-30,9,ac);
  else if(acc==='cap'){c.fillStyle=fc(0,hy-30,30,ac);c.beginPath();c.arc(0,hy-18,26,Math.PI,TAU);c.closePath();c.fill();c.strokeStyle=shade(ac,-.35);c.stroke();c.fillStyle=shade(ac,-.1);c.beginPath();c.ellipse(14,hy-18,22,6,0,0,Math.PI);c.fill();c.stroke();}
  else if(acc==='beanie'){c.fillStyle=fc(0,hy-30,30,ac);c.beginPath();c.arc(0,hy-16,28,Math.PI,TAU);c.closePath();c.fill();c.strokeStyle=shade(ac,-.35);c.stroke();c.fillStyle='#fff';rr(c,-29,hy-20,58,9,4);c.fill();circ(c,0,hy-46,8);}
  else if(acc==='glasses'){c.strokeStyle='#4a3a5a';c.lineWidth=2.5;for(const sx of[-1,1]){c.beginPath();c.arc(sx*ex,ey,10,0,TAU);c.stroke();}c.beginPath();c.moveTo(-ex+10,ey);c.lineTo(ex-10,ey);c.stroke();}
  else if(acc==='flower'){for(let i=0;i<5;i++){const a=i/5*TAU;c.fillStyle=ac;circ(c,-22+Math.cos(a)*6,hy-26+Math.sin(a)*6,5);}c.fillStyle='#ffd23a';circ(c,-22,hy-26,4);}
  c.restore();
  c.restore();}

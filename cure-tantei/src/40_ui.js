// ================= ui / particles / transitions =================
let SHAKE=0,FLASH=0,FLASHCOL='#fff',INS=null,CARD=null,TR=null,scene=null,IDLE=0;
const PARTS=[];
const PCOLS=['#ffd23a','#ff8cc6','#8ad8ff','#ffffff','#b48cff'];
function burst(x,y,n=12,kind='star',col){for(let i=0;i<n;i++){const a=rand(0,TAU),v=rand(80,260);PARTS.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-60,g:300,life:rand(.6,1.1),max:1.1,kind,col:col||pick(PCOLS),r:rand(4,9),rot:rand(0,TAU),vr:rand(-6,6)});}}
function confetti(n=60){for(let i=0;i<n;i++)PARTS.push({x:rand(VX0,VX1),y:VY0-rand(0,300),vx:rand(-40,40),vy:rand(90,220),g:30,life:3.5,max:3.5,kind:'conf',col:pick(['#ff5fa2','#ffd23a','#5aa8ff','#6cd08a','#b48cff','#ff9a2a']),r:rand(4,8),rot:rand(0,TAU),vr:rand(-8,8)});}
function ripple(x,y,col='rgba(255,255,255,.9)'){PARTS.push({x,y,vx:0,vy:0,g:0,life:.45,max:.45,kind:'ring',col,r:10});}
function floatText(x,y,s,col='#ff4f9a',size=28){PARTS.push({x,y,vx:0,vy:-60,g:0,life:1.2,max:1.2,kind:'text',col,s,r:size});}
function updParts(dt){for(let i=PARTS.length-1;i>=0;i--){const p=PARTS[i];p.life-=dt;if(p.life<=0){PARTS.splice(i,1);continue;}p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=(p.vr||0)*dt;if(p.kind==='conf')p.vx+=Math.sin(T*3+i)*20*dt;}}
function drawParts(c){for(const p of PARTS){const a=clamp(p.life/p.max*1.5,0,1);c.globalAlpha=a;c.fillStyle=p.col;
  if(p.kind==='star'){starP(c,p.x,p.y,p.r,p.r*.45,5,p.rot);c.fill();}
  else if(p.kind==='heart'){heartP(c,p.x,p.y,p.r*.8);c.fill();}
  else if(p.kind==='conf'){c.save();c.translate(p.x,p.y);c.rotate(p.rot);c.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);c.restore();}
  else if(p.kind==='ring'){const k=1-p.life/p.max;c.strokeStyle=p.col;c.lineWidth=4*(1-k);c.beginPath();c.arc(p.x,p.y,p.r+k*30,0,TAU);c.stroke();}
  else if(p.kind==='text'){otext(c,p.s,p.x,p.y,p.r,p.col,'#fff');}
  else circ(c,p.x,p.y,p.r*.5);}
  c.globalAlpha=1;}
// ---------- buttons ----------
function drawBtn(c,x,y,w,h,label,col='#ff7ab8',o={}){const pr=o.pulse?1+Math.sin(T*6)*.04:1;c.save();c.translate(x,y);c.scale(pr,pr);
  c.fillStyle=shade(col,-.3);rr(c,-w/2,-h/2+5,w,h,h/2);c.fill();c.fillStyle=vfill(c,-h/2,h/2,col,.25,-.05);rr(c,-w/2,-h/2,w,h,h/2);c.fill();c.strokeStyle='#fff';c.lineWidth=3;c.stroke();
  c.fillStyle='rgba(255,255,255,.3)';rr(c,-w/2+8,-h/2+4,w-16,h*.35,h*.2);c.fill();
  let tx=0;if(o.icon){drawIcon(c,o.icon,-w/2+h*.55,0,h/60);tx=h*.3;}
  otext(c,label,tx,1,o.size||Math.min(24,h*.42),'#fff',shade(col,-.35),'center',FONT);
  if(o.sub)txt(c,o.sub,tx,h*.32,12,'#fff');c.restore();}
function drawRBtn(c,x,y,r,kind,col='#ff8cc6'){c.save();c.translate(x,y);c.fillStyle=shade(col,-.3);circ(c,0,4,r);c.fillStyle=gfill(c,0,0,r,col);circ(c,0,0,r);c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.arc(0,0,r,0,TAU);c.stroke();
  c.fillStyle='#fff';c.strokeStyle='#fff';c.lineWidth=3;c.lineJoin='round';c.lineCap='round';
  if(kind==='home'){c.beginPath();c.moveTo(-r*.5,-r*.02);c.lineTo(0,-r*.48);c.lineTo(r*.5,-r*.02);c.stroke();rr(c,-r*.34,-r*.08,r*.68,r*.48,3);c.fill();}
  else if(kind==='voice'){c.beginPath();c.moveTo(-r*.45,-r*.18);c.lineTo(-r*.2,-r*.18);c.lineTo(r*.08,-r*.42);c.lineTo(r*.08,r*.42);c.lineTo(-r*.2,r*.18);c.lineTo(-r*.45,r*.18);c.closePath();c.fill();c.lineWidth=2.5;c.beginPath();c.arc(r*.1,0,r*.28,-.8,.8);c.stroke();c.beginPath();c.arc(r*.1,0,r*.46,-.8,.8);c.stroke();}
  else if(kind==='next'){c.beginPath();c.moveTo(-r*.25,-r*.4);c.lineTo(r*.4,0);c.lineTo(-r*.25,r*.4);c.closePath();c.fill();}
  else if(kind==='back'){c.beginPath();c.moveTo(r*.25,-r*.4);c.lineTo(-r*.4,0);c.lineTo(r*.25,r*.4);c.closePath();c.fill();}
  else if(kind==='up'){c.beginPath();c.moveTo(-r*.45,r*.25);c.lineTo(0,-r*.35);c.lineTo(r*.45,r*.25);c.closePath();c.fill();}
  else if(kind==='down'){c.beginPath();c.moveTo(-r*.45,-r*.25);c.lineTo(0,r*.35);c.lineTo(r*.45,-r*.25);c.closePath();c.fill();}
  else if(kind==='shield'){c.beginPath();c.moveTo(0,-r*.5);c.quadraticCurveTo(r*.5,-r*.4,r*.45,-r*.1);c.quadraticCurveTo(r*.35,r*.35,0,r*.55);c.quadraticCurveTo(-r*.35,r*.35,-r*.45,-r*.1);c.quadraticCurveTo(-r*.5,-r*.4,0,-r*.5);c.fill();c.fillStyle=col;heartP(c,0,0,r*.2);c.fill();}
  else if(kind==='sound'||kind==='mute'){c.beginPath();c.moveTo(-r*.45,-r*.18);c.lineTo(-r*.2,-r*.18);c.lineTo(r*.08,-r*.42);c.lineTo(r*.08,r*.42);c.lineTo(-r*.2,r*.18);c.lineTo(-r*.45,r*.18);c.closePath();c.fill();if(kind==='mute'){c.beginPath();c.moveTo(r*.2,-r*.2);c.lineTo(r*.5,r*.2);c.moveTo(r*.5,-r*.2);c.lineTo(r*.2,r*.2);c.stroke();}else{c.lineWidth=2.5;c.beginPath();c.arc(r*.1,0,r*.3,-.8,.8);c.stroke();}}
  c.restore();}
function drawTopBar(c){drawRBtn(c,36,34,24,'home','#ff8cc6');drawRBtn(c,364,34,24,'voice','#8a7af0');}
// ---------- instruction panel ----------
function instr(text,who='fu',en){INS={text,who,t:0};say(text,who,en);}
function drawIns(c){if(!INS)return;const k=easeBack(Math.min(1,INS.t*3));c.save();c.translate(200,106);c.scale(k,k);
  c.fillStyle='rgba(90,30,70,.25)';rr(c,-186,-34,372,76,20);c.fill();c.fillStyle='rgba(255,255,255,.96)';rr(c,-186,-38,372,76,20);c.fill();c.strokeStyle='#ff8cc6';c.lineWidth=3.5;c.stroke();
  c.save();c.beginPath();c.arc(-150,0,27,0,TAU);c.fillStyle='#ffe8f4';c.fill();c.clip();
  if(INS.who==='rk')drawRicky(c,-150,54,{s:1.5,noShadow:1,talk:speaking()});else if(INS.who==='kuro')drawKuro(c,-150,50,.55,T);else drawFutan(c,-150,48,{s:1.25,noShadow:1,doc:RUN.doc,cure:RUN.cure,talk:speaking()});c.restore();
  c.strokeStyle='#ff8cc6';c.lineWidth=3;c.beginPath();c.arc(-150,0,27,0,TAU);c.stroke();
  c.font=`800 19px ${FONT}`;const ls=wrap(c,INS.text,300);const size=ls.length>2?16:19;c.font=`800 ${size}px ${FONT}`;const ls2=wrap(c,INS.text,300);
  c.textAlign='left';c.textBaseline='middle';c.fillStyle='#5b2c47';ls2.slice(0,3).forEach((l,i)=>c.fillText(l,-114,(i-(Math.min(3,ls2.length)-1)/2)*size*1.25));c.restore();}
// ---------- word card ----------
function showCard(icon,ja,en){CARD={icon,ja,en,t:0};learn(wordKey(icon));}
function drawCard(c){if(!CARD)return;const t=CARD.t,k=t<.25?easeBack(t/.25):t>2.2?Math.max(0,1-(t-2.2)/.3):1;if(k<=0)return;c.save();c.translate(200,330);c.scale(k,k);
  drawGlow(c,'#fff6a0',0,-20,150,.7);c.fillStyle='rgba(90,30,70,.25)';rr(c,-130,-100,260,210,26);c.fill();c.fillStyle='#fffaf0';rr(c,-130,-106,260,210,26);c.fill();c.strokeStyle='#ffc83a';c.lineWidth=5;c.stroke();
  otext(c,'みつけた！',0,-78,22,'#fff','#ff9a2a','center',FONT);drawIcon(c,CARD.icon,0,-18,1.9);
  if(CARD.ja)txt(c,CARD.ja,0,44,24,'#5b2c47');if(CARD.en)otext(c,CARD.en,0,78,26,'#3a8aff','#fff','center',POP);c.restore();}
// ---------- hint hand ----------
function drawHand(c,x,y){const b=Math.sin(T*8)*6;c.save();c.translate(x+8,y+14+b);c.rotate(-.35);c.fillStyle='#fff';c.strokeStyle=LN;c.lineWidth=2.5;
  rr(c,-5,-26,10,24,5);c.fill();c.stroke();rr(c,-12,-6,26,24,9);c.fill();c.stroke();c.beginPath();c.moveTo(-2,-2);c.lineTo(-2,6);c.moveTo(4,-2);c.lineTo(4,6);c.stroke();c.restore();
  c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=3;c.beginPath();c.arc(x,y,14+((T*2)%1)*16,0,TAU);c.stroke();}
// ---------- transition ----------
function go(next){if(TR){if(TR.sw)TR.queue=next;else TR.next=next;return;}if(scene!==SCN.title)hush();TR={t:0,next,sw:false};}
function updTR(dt){if(!TR)return;TR.t+=dt;if(!TR.sw&&TR.t>=.32){TR.sw=true;scene=TR.next;INS=null;CARD=null;IDLE=0;PARTS.length=0;scene.enter&&scene.enter();}if(TR.t>=.64){const q=TR.queue;TR=null;if(q)go(q);}}
function drawTR(c){if(!TR)return;const k=TR.t<.32?TR.t/.32:1-(TR.t-.32)/.32;c.globalAlpha=clamp(k*1.2,0,1);c.fillStyle='#ffc0e0';c.fillRect(VX0-10,VY0-10,VX1-VX0+20,VY1-VY0+20);
  c.fillStyle='#fff';for(let i=0;i<8;i++){const a=i/8*TAU+T*2;heartP(c,200+Math.cos(a)*80*k,360+Math.sin(a)*80*k,16*k);c.fill();}c.globalAlpha=1;}

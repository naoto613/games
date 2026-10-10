// ================= effects (world space) and speech bubbles (DOM) =================
let NOW=0;
function addFx(f){f.t0=NOW;W.fx.push(f);return f}
function burst(x,y,n,cols,sp){const ps=[];for(let i=0;i<n;i++){const a=rnd(TAU),v=rnd(.4,1)*(sp||160);ps.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-60,c:pick(cols),r:rnd(3,6),rot:rnd(6)})}return addFx({k:'spark',ps,d:1.6})}
function viewRect(){return{x:cam.x,y:cam.y,w:VW/cam.z,h:VH/cam.z}}
// magic effects follow the camera (particles live in 0..1 view space); d:Infinity keeps one running for the rest of the stage
function magicFx(kind,d){const ps=[];const cols=kind==='petals'?['#ffc6d9','#ff9cbc','#fff']:['#e8504a','#f6c63a','#4cad62','#3f7bd6','#f28fb7','#8d5cc8','#7cc8ec'];
  for(let i=0;i<140;i++)ps.push({u:Math.random(),v:Math.random(),s:rnd(.6,1.4),ph:rnd(6.28),c:pick(cols)});
  return addFx({k:'magic',kind,ps,d:d||7,bursts:[]})}
function drawFx(c,t){
  const z=cam.z*DPR;c.setTransform(z,0,0,z,-cam.x*z,-cam.y*z);
  let flash=0;
  for(let i=W.fx.length-1;i>=0;i--){const f=W.fx[i],k=(NOW-f.t0)/f.d;if(k>=1){W.fx.splice(i,1);continue}const dt=NOW-f.t0;
    switch(f.k){
    case 'ring':c.globalAlpha=1-k;c.lineWidth=(f.w||5)/cam.z*1.4;c.strokeStyle=f.col||'#ff6f9f';circ(c,f.x,f.y,(f.r||30)+k*(f.grow||60));c.stroke();c.globalAlpha=1;break;
    case 'spark':for(const p of f.ps){const x=p.x+p.vx*dt,y=p.y+p.vy*dt+140*dt*dt;c.globalAlpha=1-k;star(c,x,y,p.r,p.r*.45);c.fillStyle=p.c;c.fill()}c.globalAlpha=1;break;
    case 'hint':{const a=.5+.5*Math.sin(dt*6);c.globalAlpha=Math.min(1,(1-k)*3)*.9;c.fillStyle='rgba(255,220,120,'+(0.18+a*.12)+')';circ(c,f.x,f.y,f.r);c.fill();c.setLineDash([16/cam.z,10/cam.z]);c.lineWidth=5/cam.z;c.strokeStyle='#ff9a3c';c.stroke();c.setLineDash([]);c.globalAlpha=1;break}
    case 'arrow':{const T=W.fam.futan,ang=Math.atan2(T.y-f.y,T.x-f.x),len=Math.max(40,Math.min(700,Math.hypot(T.x-f.x,T.y-f.y)-50)),hs=Math.max(1,.55/cam.z);c.globalAlpha=Math.min(1,(1-k)*3);
      for(let j=0;j<10;j++){const q=((j/10)+dt*.4)%1,x=f.x+Math.cos(ang)*len*q,y=f.y-40+Math.sin(ang)*len*q;heart(c,x,y,(7+q*5)*hs);c.fillStyle='#ff4f8f';c.fill();c.lineWidth=2*hs;c.strokeStyle='#fff';c.stroke()}
      c.globalAlpha=1;break}
    case 'flash':flash=Math.max(flash,1-k);break;
    case 'magic':drawMagic(c,f,k,dt);break;
    }
  }
  if(flash>0){c.setTransform(DPR,0,0,DPR,0,0);c.fillStyle='rgba(255,255,255,'+flash*.85+')';c.fillRect(0,0,VW,VH)}
}
function drawMagic(c,f,k,dt){
  const v=viewRect(),u=1/cam.z,fade=Math.min(f.d>1e5?.85:1,(1-k)*4,dt*2);c.globalAlpha=fade;
  switch(f.kind){
  case 'rainbow':{const cx=v.x+v.w/2,cy=v.y+v.h*.95,R0=Math.min(v.w,v.h*1.6)*.55;c.globalAlpha=fade*.42;['#e8504a','#f28b2f','#f6c63a','#4cad62','#3f7bd6','#8d5cc8'].forEach((col,i)=>{c.lineWidth=R0*.045;c.strokeStyle=col;c.beginPath();c.arc(cx,cy,R0-i*R0*.045,Math.PI,0);c.stroke()});c.globalAlpha=fade;
    for(const p of f.ps.slice(0,50)){const a=.5+.5*Math.sin(dt*5+p.ph);star(c,v.x+p.u*v.w,v.y+p.v*v.h,(6*p.s*a+2)*u,2*u);c.fillStyle='#fff6b0';c.fill()}break}
  case 'aurora':for(let i=0;i<3;i++){c.fillStyle=['rgba(120,255,190,.25)','rgba(140,200,255,.22)','rgba(220,150,255,.18)'][i];c.beginPath();c.moveTo(v.x,v.y);for(let x=0;x<=v.w;x+=v.w/60)c.lineTo(v.x+x,v.y+v.h*(.18+i*.07)+Math.sin(x/v.w*8+dt*1.5+i)*v.h*.06);c.lineTo(v.x+v.w,v.y);c.closePath();c.fill()}
    for(const p of f.ps.slice(0,40)){circ(c,v.x+p.u*v.w,v.y+p.v*v.h*.5,(1.5+Math.sin(dt*4+p.ph))*u+.5*u);c.fillStyle='#fff';c.fill()}break;
  case 'fireworks':{if(!f.lastB||dt-f.lastB>.4){f.lastB=dt;f.bursts.push({bx:rnd(.1,.9),by:rnd(.08,.4),t:dt,c:pick(['#ff6f9f','#f6c63a','#7cc8ec','#7fd6b4','#ff8a5c','#c79bff'])});if(f.bursts.length>12)f.bursts.shift();if(f.sound&&dt<8)SFX.pop()}
    for(const b of f.bursts){const q=dt-b.t;if(q>1.4)continue;const x=v.x+b.bx*v.w,y=v.y+b.by*v.h,R0=Math.min(v.w,v.h)*.14*Math.min(1,q*2.2);c.globalAlpha=fade*Math.max(0,1-q/1.4);for(let j=0;j<16;j++){const a=j/16*TAU;circ(c,x+Math.cos(a)*R0,y+Math.sin(a)*R0+q*q*20*u,3.2*u);c.fillStyle=b.c;c.fill()}}c.globalAlpha=fade;break}
  case 'stars':for(const p of f.ps.slice(0,18)){const q=((dt*.5+p.ph)%1.6)/1.6,x=v.x+p.u*v.w+q*v.w*.25,y=v.y+p.v*v.h*.5+q*v.h*.18;c.strokeStyle='rgba(255,250,200,'+(1-q)+')';c.lineWidth=3*u;line(c,x,y,x-50*u,y-30*u);star(c,x,y,8*u,3.5*u);c.fillStyle='#fff6b0';c.fill()}break;
  case 'balloons':for(const p of f.ps.slice(0,60)){const q=(dt*.05*p.s+p.v)%1.25,x=v.x+p.u*v.w+Math.sin(dt*1.5+p.ph)*14*u,y=v.y+v.h*(1.15-q);c.lineWidth=1*u;c.strokeStyle=LN;line(c,x,y+12*u*p.s,x+2*u,y+30*u*p.s);ell(c,x,y,9*u*p.s,11*u*p.s);c.fillStyle=p.c;c.fill();c.lineWidth=1.4*u;c.stroke();ell(c,x-3*u*p.s,y-4*u*p.s,2*u*p.s,3*u*p.s);c.fillStyle='rgba(255,255,255,.7)';c.fill()}ink(c);break;
  case 'fishes':for(const p of f.ps.slice(0,70)){const q=(dt*.05*p.s+p.u)%1.3-.15,x=v.x+q*v.w,y=v.y+v.h*(.15+p.v*.7)+Math.sin(dt*3+p.ph)*8*u;c.save();c.translate(x,y);c.scale(u*1.3,u*1.3);poly(c,[[-14,0],[-22,-7],[-22,7]]);c.fillStyle=p.c;c.fill();ell(c,0,0,13,7);c.fill();c.lineWidth=1.4;c.strokeStyle=LN;c.stroke();circ(c,7,-1.5,1.6);c.fillStyle=LN;c.fill();c.restore()}break;
  case 'ufo':{const q=dt*.12,x=v.x+v.w*(.5+.42*Math.sin(q*2.1)),y=v.y+v.h*(.22+.08*Math.sin(q*3.3));c.save();c.translate(x,y);c.scale(u*1.6,u*1.6);
    c.fillStyle='rgba(255,250,180,.25)';poly(c,[[-14,8],[14,8],[46,120],[-46,120]]);c.fill();ink(c,2);ell(c,0,0,40,11);FS(c,'#c7ccd4');c.beginPath();c.arc(0,-3,18,Math.PI,0);c.closePath();c.fillStyle='rgba(160,230,255,.85)';c.fill();c.stroke();
    for(let i=0;i<5;i++){circ(c,-28+i*14,3,3);c.fillStyle=(Math.floor(dt*4)+i)%2?'#f6c63a':'#ff6f9f';c.fill()}c.restore();ink(c);break}
  case 'whale':{const x=((dt*45)%2900)-250,y=470;c.save();c.translate(x,y);ink(c,3);c.beginPath();c.moveTo(-120,10);c.quadraticCurveTo(-130,-50,-40,-58);c.quadraticCurveTo(80,-62,110,0);c.quadraticCurveTo(60,30,-120,10);c.closePath();FS(c,'#5a8ad8');
    poly(c,[[-118,0],[-160,-30],[-150,8],[-165,40]]);FS(c,'#5a8ad8');ell(c,-10,8,70,14);F(c,'#c9dcf5');circ(c,70,-18,5);F(c,LN);c.lineWidth=2;c.beginPath();c.arc(72,-4,12,.3,1.3);c.stroke();
    const sp=(dt%3)<1.6;if(sp){for(let i=0;i<9;i++){const a=-Math.PI/2+(i-4)*.22,r=40+30*Math.sin((dt%3)/1.6*Math.PI);circ(c,40+Math.cos(a)*r*.6,-60+Math.sin(a)*r,6);c.fillStyle='rgba(220,245,255,.9)';c.fill()}}
    c.restore();break}
  default:// petals, confetti, bubbles fall/rise across the view
    for(const p of f.ps){const up=f.kind==='bubbles',q=((dt*.07*p.s+p.v)%1.2)-.1,y=v.y+v.h*(up?1-q:q),x=v.x+p.u*v.w+Math.sin(dt*2+p.ph)*20*u;
      if(up){circ(c,x,y,7*p.s*u);c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=1.6*u;c.stroke();c.fillStyle='rgba(200,240,255,.25)';c.fill()}
      else if(f.kind==='petals'){ell(c,x,y,6*p.s*u,3.5*p.s*u,dt*2+p.ph);c.fillStyle=p.c;c.fill()}
      else{c.save();c.translate(x,y);c.rotate(dt*4+p.ph);c.fillStyle=p.c;c.fillRect(-4*p.s*u,-2.5*p.s*u,8*p.s*u,5*p.s*u);c.restore()}}
  }
  c.globalAlpha=1;
}
// ---- speech bubbles ----
const bubbles=[];
function bubble(it,text,dur,big){
  for(let i=bubbles.length-1;i>=0;i--)if(bubbles[i].it===it){bubbles[i].el.remove();bubbles.splice(i,1)}
  const el=document.createElement('div');el.className='bubble'+(big?' big':'');el.textContent=text;$('fx').appendChild(el);
  bubbles.push({it,el,t0:NOW,d:dur||2});
}
function clearBubbles(){for(const b of bubbles)b.el.remove();bubbles.length=0}
function updateBubbles(){
  for(let i=bubbles.length-1;i>=0;i--){const b=bubbles[i],k=(NOW-b.t0)/b.d;if(k>=1){b.el.remove();bubbles.splice(i,1);continue}
    const it=b.it,hh=it.kind==='ricky'?62:(it.hit?it.hit.hh:40)*(it.scale||1),p=toScreen(it.x,it.y-hh-6);
    const w=b.el.offsetWidth/2;b.el.style.left=clamp(p.x,w+6,VW-w-6)+'px';b.el.style.top=clamp(p.y,b.el.offsetHeight+6,VH)+'px';b.el.style.opacity=k>.85?(1-k)/.15:1}
}
function toast(t){const el=$('toast');el.innerHTML=t;el.classList.toggle('small',t.replace(/<[^>]+>/g,'').length>8);el.classList.remove('show');void el.offsetWidth;el.classList.add('show')}

// ================= effects (world space) and speech bubbles (DOM) =================
let NOW=0;
function addFx(f){f.t0=NOW;W.fx.push(f);return f}
function burst(x,y,n,cols,sp){const ps=[];for(let i=0;i<n;i++){const a=rnd(TAU),v=rnd(.4,1)*(sp||160);ps.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-60,c:pick(cols),r:rnd(3,6),rot:rnd(6)})}return addFx({k:'spark',ps,d:1.6})}
function viewRect(){return{x:cam.x,y:cam.y,w:VW/cam.z,h:VH/cam.z}}
function magicFx(kind,d){const v=viewRect(),ps=[];const n=kind==='fireworks'?0:120;
  for(let i=0;i<n;i++)ps.push({x:v.x+rnd(v.w),y:v.y+rnd(-v.h,v.h),s:rnd(.6,1.4),ph:rnd(6.28),c:pick(kind==='petals'?['#ffc6d9','#ff9cbc','#fff']:kind==='bubbles'?['rgba(255,255,255,.8)']:['#e8504a','#f6c63a','#4cad62','#3f7bd6','#f28fb7','#8d5cc8'])});
  return addFx({k:'magic',kind,ps,d:d||7,v,bursts:[]})}
function drawFx(c,t){
  const z=cam.z*DPR;c.setTransform(z,0,0,z,-cam.x*z,-cam.y*z);
  let flash=0;
  for(let i=W.fx.length-1;i>=0;i--){const f=W.fx[i],k=(NOW-f.t0)/f.d;if(k>=1){W.fx.splice(i,1);continue}const dt=NOW-f.t0;
    switch(f.k){
    case 'ring':c.globalAlpha=1-k;c.lineWidth=(f.w||5)/cam.z*1.4;c.strokeStyle=f.col||'#ff6f9f';circ(c,f.x,f.y,(f.r||30)+k*(f.grow||60));c.stroke();c.globalAlpha=1;break;
    case 'spark':for(const p of f.ps){const x=p.x+p.vx*dt,y=p.y+p.vy*dt+140*dt*dt;c.globalAlpha=1-k;star(c,x,y,p.r,p.r*.45);c.fillStyle=p.c;c.fill()}c.globalAlpha=1;break;
    case 'hint':{const a=.5+.5*Math.sin(dt*6);c.globalAlpha=Math.min(1,(1-k)*3)*.9;c.fillStyle='rgba(255,220,120,'+(0.18+a*.12)+')';circ(c,f.x,f.y,f.r);c.fill();c.setLineDash([16/cam.z,10/cam.z]);c.lineWidth=5/cam.z;c.strokeStyle='#ff9a3c';c.stroke();c.setLineDash([]);c.globalAlpha=1;break}
    case 'arrow':{const T=W.fam.futan,ang=Math.atan2(T.y-f.y,T.x-f.x),len=Math.min(320,Math.hypot(T.x-f.x,T.y-f.y)-60);c.globalAlpha=Math.min(1,(1-k)*3);
      for(let j=0;j<7;j++){const q=((j/7)+dt*.5)%1,x=f.x+Math.cos(ang)*len*q,y=f.y-40+Math.sin(ang)*len*q;heart(c,x,y,7+q*4);c.fillStyle='#ff6f9f';c.fill();c.lineWidth=1.5;c.strokeStyle='#fff';c.stroke()}
      c.globalAlpha=1;break}
    case 'flash':flash=Math.max(flash,1-k);break;
    case 'magic':drawMagic(c,f,k,dt);break;
    }
  }
  if(flash>0){c.setTransform(DPR,0,0,DPR,0,0);c.fillStyle='rgba(255,255,255,'+flash*.85+')';c.fillRect(0,0,VW,VH)}
}
function drawMagic(c,f,k,dt){
  const v=f.v,fade=Math.min(1,(1-k)*4,dt*3);c.globalAlpha=fade;
  switch(f.kind){
  case 'rainbow':{const cx=v.x+v.w/2,cy=v.y+v.h*.9,R0=Math.min(v.w,v.h*1.6)*.55;['#e8504a','#f28b2f','#f6c63a','#4cad62','#3f7bd6','#8d5cc8'].forEach((col,i)=>{c.lineWidth=R0*.05;c.strokeStyle=col;c.beginPath();c.arc(cx,cy,R0-i*R0*.05,Math.PI,0);c.stroke()});
    for(const p of f.ps){const a=.5+.5*Math.sin(dt*5+p.ph);star(c,p.x,p.y+v.h,6*p.s*a+2,2);c.fillStyle='#fff6b0';c.fill()}break}
  case 'aurora':for(let i=0;i<3;i++){c.fillStyle=['rgba(120,255,190,.25)','rgba(140,200,255,.22)','rgba(220,150,255,.18)'][i];c.beginPath();c.moveTo(v.x,v.y);for(let x=0;x<=v.w;x+=20)c.lineTo(v.x+x,v.y+v.h*(.18+i*.07)+Math.sin(x*.01+dt*1.5+i)*v.h*.06);c.lineTo(v.x+v.w,v.y);c.closePath();c.fill()}break;
  case 'fireworks':{if(!f.lastB||dt-f.lastB>.35){f.lastB=dt;f.bursts.push({x:v.x+rnd(.1,.9)*v.w,y:v.y+rnd(.1,.45)*v.h,t:dt,c:pick(['#ff6f9f','#f6c63a','#7cc8ec','#7fd6b4','#ff8a5c','#c79bff'])});if(f.sound)SFX.pop()}
    for(const b of f.bursts){const q=dt-b.t;if(q>1.4)continue;const R0=Math.min(v.w,v.h)*.14*Math.min(1,q*2.2);c.globalAlpha=fade*Math.max(0,1-q/1.4);for(let j=0;j<16;j++){const a=j/16*TAU;circ(c,b.x+Math.cos(a)*R0,b.y+Math.sin(a)*R0+q*q*20,Math.max(1,4/cam.z*1.5));c.fillStyle=b.c;c.fill()}}c.globalAlpha=fade;break}
  case 'stars':for(const p of f.ps.slice(0,24)){const q=((dt*.6+p.ph)%1.5)/1.5,x=p.x+q*260,y=v.y+((p.y-v.y)%v.h+v.h)%v.h*.6+q*160;c.strokeStyle='rgba(255,250,200,'+(1-q)+')';c.lineWidth=3/cam.z*1.4;line(c,x,y,x-60,y-38);star(c,x,y,8,3.5);c.fillStyle='#fff6b0';c.fill()}break;
  default:// petals, confetti, bubbles fall/rise across the view
    for(const p of f.ps){const up=f.kind==='bubbles';const y=up?p.y+v.h*2-((dt*70*p.s)%(v.h*2.2)):p.y+((dt*80*p.s)%(v.h*2.2)),x=p.x+Math.sin(dt*2+p.ph)*20;
      if(f.kind==='bubbles'){circ(c,x,y,7*p.s);c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=1.6;c.stroke();c.fillStyle='rgba(200,240,255,.25)';c.fill()}
      else if(f.kind==='petals'){ell(c,x,y,6*p.s,3.5*p.s,dt*2+p.ph);c.fillStyle=p.c;c.fill()}
      else{c.save();c.translate(x,y);c.rotate(dt*4+p.ph);c.fillStyle=p.c;c.fillRect(-4*p.s,-2.5*p.s,8*p.s,5*p.s);c.restore()}}
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

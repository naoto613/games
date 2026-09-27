// ================= input =================
let idle=0,hintSaid=0;
function toV(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left-OX)/SC,y:(e.clientY-r.top-OY)/SC};}
let ptrId=null;
cv.addEventListener('pointerdown',e=>{audioInit();if(ptrId!==null&&ptrId!==e.pointerId)return;ptrId=e.pointerId;try{cv.setPointerCapture(e.pointerId);}catch(_){}const p=toV(e);idle=0;hintSaid=0;ring(p.x,p.y,'rgba(255,255,255,.9)');
  if(tr)return;if(cel){celDown(p.x,p.y);return;}
  if(scene!==SCN.map&&scene!==SCN.title&&hitC(p.x,p.y,56,60,46)){sfx('tap');go('map');return;}
  if(scene.rkPos&&scene!==SCN.title){const r=scene.rkPos;if(rkHit(p.x,p.y,r.x,r.y,r.sc)){RK.hop=1;rkCheer();say(pick(['りっきー！ きゃっきゃ！','ばぶー！','りっきー にこにこ！','ねえね だいすき！','あーうー！']));burst(r.x,r.y-40*r.sc,8,'heart');return;}}
  if(scene.down)scene.down(p.x,p.y);});
cv.addEventListener('pointermove',e=>{if(e.pointerId!==ptrId)return;const p=toV(e);if(scene.move&&!tr&&!cel)scene.move(p.x,p.y);});
const up=e=>{if(e.pointerId!==ptrId)return;ptrId=null;const p=toV(e);if(scene.up&&!tr&&!cel)scene.up(p.x,p.y);};
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);cv.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('visibilitychange',()=>{if(document.hidden){hush();if(AC)AC.suspend();}else if(AC)AC.resume();});
// ================= loop =================
let last=performance.now();
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;T+=dt;
  try{
  if(tr){tr.t+=dt;if(!tr.sw&&tr.t>=.35){tr.sw=true;scene=SCN[tr.next];parts.length=0;bub=null;card=null;scene.enter&&scene.enter();}if(tr.t>=.7)tr=null;}
  if(bub){bub.t+=dt;if(bub.t>bub.life)bub=null;}if(card){card.t+=dt;if(card.t>3)card=null;}
  if(cel)celUpdate(dt);if(RK.clap>0)RK.clap-=dt;if(RK.hop>0)RK.hop-=dt*2;
  if(!cel&&scene.update)scene.update(dt);
  updParts(dt);
  if(!cel&&!tr&&scene.hint){idle+=dt;if(idle>9&&!hintSaid&&scene.hintText){hintSaid=1;const ht=scene.hintText();if(ht)say(ht);}if(idle>24){idle=8;hintSaid=0;}}
  const c=ctx;c.setTransform(DPR,0,0,DPR,0,0);c.fillStyle=scene.bg||'#fff';c.fillRect(0,0,cv.width,cv.height);
  c.setTransform(DPR*SC,0,0,DPR*SC,DPR*OX,DPR*OY);
  scene.draw(c);
  drawParts(c);
  if(!cel&&!tr&&scene.hint&&idle>6){const h=scene.hint();if(h){const k=h.x2!=null?((T*.7)%1):0;const e=k<.8?k/.8:1;const hx=h.x2!=null?lerp(h.x,h.x2,ease(e)):h.x,hy=h.x2!=null?lerp(h.y,h.y2,ease(e)):h.y;drawHand(c,hx,hy,T);}}
  if(scene!==SCN.map&&scene!==SCN.title)drawBtn(c,56,60,40,'#ff8cc0','home');
  drawCard(c);drawBubble(c);
  if(cel)drawCel(c);
  if(tr)drawTr(c);
  }catch(err){if(!frame.e){frame.e=1;console.error(err);}}
}
resize();scene=SCN.title;scene.enter();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{for(const k in SPR)delete SPR[k];for(const k in STKC)delete STKC[k];if(scene===SCN.school)SCN.school.build();});
requestAnimationFrame(frame);
window.__town={SCN,get scene(){return scene},go,SAVE,celebrate,get cel(){return cel},get H(){return H},celDown,parts};
})();

// ================= input =================
let idle=0,hintSaid=0;
function toV(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left-OX)/SC,y:(e.clientY-r.top-OY)/SC};}
let ptrId=null;
const RKLINES=['りっきー！ きゃっきゃ！','ねえね がんばれー！','ばぶー！','りっきーも おてつだい！','あーうー！','ねえね だいすき！'];
cv.addEventListener('pointerdown',e=>{audioInit();ttsUnlock();if(ptrId!==null&&ptrId!==e.pointerId)return;ptrId=e.pointerId;try{cv.setPointerCapture(e.pointerId);}catch(_){}const p=toV(e);idle=0;hintSaid=0;LOOK.x=p.x;LOOK.on=1;ring(p.x,p.y,'rgba(255,255,255,.9)');
  if(tr)return;if(cel){celDown(p.x,p.y);return;}
  if(!scene.noHome&&hitC(p.x,p.y,56,60,46)){sfx('tap');go(scene.homeTo||'lobby');return;}
  if(scene.rkPos&&!scene.noRk){const r=scene.rkPos;if(rkHit(p.x,p.y,r.x,r.y,r.sc)){RK.hop=1;rkCheer();say(pick(scene.rkLines||RKLINES));burst(r.x,r.y-40*r.sc,8,'heart');return;}}
  if(scene.down)scene.down(p.x,p.y);});
cv.addEventListener('pointermove',e=>{if(e.pointerId!==ptrId)return;const p=toV(e);LOOK.x=p.x;if(scene.move&&!tr&&!cel)scene.move(p.x,p.y);});
const up=e=>{ttsUnlockUp();if(e.pointerId!==ptrId)return;ptrId=null;LOOK.on=0;const p=toV(e);if(scene.up&&!tr&&!cel)scene.up(p.x,p.y);};
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);cv.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('visibilitychange',()=>{if(document.hidden){hush();if(AC)AC.suspend();}else if(AC)AC.resume();});
// ================= loop =================
let last=performance.now();
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000);last=now;T+=dt;
  try{
  if(tr){tr.t+=dt;if(!tr.sw&&tr.t>=.35){tr.sw=true;scene=SCN[tr.next];scene.rkPos=null;scene._rw=null;resetPlay();parts.length=0;bub=null;card=null;scene.enter&&scene.enter();}if(tr.t>=.7)tr=null;}
  if(bub){bub.t+=dt;if(bub.t>bub.life)bub=null;}if(card){card.t+=dt;if(card.t>3)card=null;}
  if(cel)celUpdate(dt);if(RK.clap>0)RK.clap-=dt;if(RK.hop>0)RK.hop-=dt*2;
  if(!cel&&scene.update)scene.update(dt);
  updParts(dt);updFx(dt);updNotes(dt);
  if(!cel&&!tr&&scene.hint){idle+=dt;if(idle>9&&!hintSaid&&scene.hintText){hintSaid=1;const ht=scene.hintText();if(ht)say(ht);}if(idle>24){idle=8;hintSaid=0;}}
  const c=ctx;c.setTransform(DPR,0,0,DPR,0,0);c.fillStyle=scene.bg||'#fff';c.fillRect(0,0,cv.width,cv.height);
  c.setTransform(DPR*SC,0,0,DPR*SC,DPR*OX,DPR*OY);
  c.save();if(SHAKE>0)c.translate(Math.sin(T*90)*SHAKE*24,Math.cos(T*70)*SHAKE*12);scene.draw(c);c.restore();
  if(!scene.noHome)vignette(c);drawParts(c);drawFly(c);drawBanner(c);
  if(!cel&&!tr&&scene.hint&&idle>6){const h=scene.hint();if(h){const k=h.x2!=null?((T*.7)%1):0;const e=k<.8?k/.8:1;const hx=h.x2!=null?lerp(h.x,h.x2,ease(e)):h.x,hy=h.x2!=null?lerp(h.y,h.y2,ease(e)):h.y;drawHand(c,hx,hy,T);}}
  if(!scene.noHome){drawBtn(c,56,60,40,'#ff8cc0','home');if(scene.hud!==false)drawHud(c);}
  drawCard(c);drawBubble(c);drawNotes(c);
  if(cel)drawCel(c);
  if(tr)drawTr(c);
  }catch(err){if(!frame.e){frame.e=1;console.error(err);}}
}
resize();scene=SCN.title;scene.enter();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{for(const k in SPR)delete SPR[k];});
window.__dbg={PLAY,SAVE,WARD,sayWord,sayNum,say,speak,hush};
requestAnimationFrame(frame);
window.__hosp={closeCel(){cel=null;},deco:drawDeco,thumb(cv2){const c=cv2.getContext('2d');c.setTransform(cv2.width/800,0,0,cv2.height/500,0,0);drawThumb(c);},SCN,get scene(){return scene},go,SAVE,celebrate,get cel(){return cel},get H(){return H},celDown,parts};

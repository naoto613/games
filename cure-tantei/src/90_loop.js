// ================= input & loop =================
function toL(e){const r=cv.getBoundingClientRect();return{x:(e.clientX-r.left-OX)/SC,y:(e.clientY-r.top-OY)/SC};}
let ptrId=null;
cv.addEventListener('pointerdown',e=>{audioInit();if(ptrId!==null&&ptrId!==e.pointerId)return;ptrId=e.pointerId;try{cv.setPointerCapture(e.pointerId);}catch(_){}
  const p=toL(e);IDLE=0;ripple(p.x,p.y);if(TR||!scene)return;
  if(scene.isStep){if(inC(p.x,p.y,36,34,30)){sfx('tap');go(SCN.office);return;}if(inC(p.x,p.y,364,34,30)){sfx('tap');replay();return;}if(INS&&inR(p.x,p.y,200,106,372,76)){replay();return;}}
  if(scene.down)scene.down(p.x,p.y);});
cv.addEventListener('pointermove',e=>{if(e.pointerId!==ptrId||TR||!scene)return;const p=toL(e);if(scene.move)scene.move(p.x,p.y);});
const ptrUp=e=>{if(e.pointerId!==ptrId)return;ptrId=null;if(TR||!scene)return;const p=toL(e);if(scene.up)scene.up(p.x,p.y);};
cv.addEventListener('pointerup',ptrUp);cv.addEventListener('pointercancel',ptrUp);cv.addEventListener('contextmenu',e=>e.preventDefault());
document.addEventListener('visibilitychange',()=>{if(document.hidden){hush();if(AC)AC.suspend();}else if(AC)AC.resume();});
let last=performance.now();
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.05,(now-last)/1000*(window.__speed||1));last=now;T+=dt;
  try{
    updTR(dt);
    if(scene){if(scene.update)scene.update(dt);if(scene.fin!=null){scene.fin-=dt;if(scene.fin<=0){scene.fin=null;if(scene.isStep&&!scene._ended){scene._ended=true;stepDone();}}}}
    if(INS)INS.t+=dt;if(CARD){CARD.t+=dt;if(CARD.t>2.6)CARD=null;}IDLE+=dt;if(SHAKE>0)SHAKE-=dt;if(FLASH>0)FLASH-=dt*1.6;
    updParts(dt);bgmTick();
    const c=ctx;c.setTransform(1,0,0,1,0,0);c.fillStyle='#2a1030';c.fillRect(0,0,cv.width,cv.height);
    c.setTransform(DPR*SC,0,0,DPR*SC,DPR*OX,DPR*OY);if(SHAKE>0)c.translate(Math.sin(T*70)*SHAKE*10,Math.cos(T*60)*SHAKE*8);
    if(scene){scene.draw(c);drawParts(c);
      if(scene.isStep){drawIns(c);drawTopBar(c);}
      if(!TR&&IDLE>7&&scene.hint&&!CARD){const h=scene.hint();if(h)drawHand(c,h.x,h.y);}}
    drawCard(c);
    if(FLASH>0){c.globalAlpha=clamp(FLASH,0,1);c.fillStyle=FLASHCOL;c.fillRect(VX0-2,VY0-2,VX1-VX0+4,VY1-VY0+4);c.globalAlpha=1;}
    drawTR(c);
  }catch(err){if(!frame.e){frame.e=1;console.error(err);}}
}
scene=SCN.title;scene.enter();
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{});
requestAnimationFrame(frame);
window.__ct={SCN,SAVE,RUN,CHAPTERS,STEP,get scene(){return scene},go,runSteps,startChapter,stepDone,mkStep,genDoc,genEng,genNum,genAbc,genBattle,genDots};
})();

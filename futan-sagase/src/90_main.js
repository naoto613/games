// ================= input, buttons, main loop =================
const ptrs=new Map();let gest=null;
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});cam.anim=null;
  if(ptrs.size===1)gest={x0:e.clientX,y0:e.clientY,t0:performance.now(),moved:0,multi:false};else if(gest)gest.multi=true});
cv.addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);if(!p)return;
  if(G.state==='found'||G.state==='intro'){p.x=e.clientX;p.y=e.clientY;return}
  if(ptrs.size===1){const dx=e.clientX-p.x,dy=e.clientY-p.y;cam.x-=dx/cam.z;cam.y-=dy/cam.z;clampCam();if(gest)gest.moved+=Math.abs(dx)+Math.abs(dy)}
  else if(ptrs.size===2){const ids=[...ptrs.keys()],o=ptrs.get(ids[0]===e.pointerId?ids[1]:ids[0]);
    const d0=Math.hypot(p.x-o.x,p.y-o.y),d1=Math.hypot(e.clientX-o.x,e.clientY-o.y),mx=(e.clientX+o.x)/2,my=(e.clientY+o.y)/2,pmx=(p.x+o.x)/2,pmy=(p.y+o.y)/2;
    const wp=toWorld(pmx,pmy);if(d0>4&&d1>4)cam.z=clamp(cam.z*d1/d0,zMin(),zMax());cam.x=wp.x-mx/cam.z;cam.y=wp.y-my/cam.z;clampCam()}
  p.x=e.clientX;p.y=e.clientY});
function endPtr(e){if(!ptrs.has(e.pointerId))return;ptrs.delete(e.pointerId);
  if(ptrs.size===0&&gest){if(!gest.multi&&gest.moved<12&&performance.now()-gest.t0<650)onTap(e.clientX,e.clientY);gest=null}}
cv.addEventListener('pointerup',endPtr);cv.addEventListener('pointercancel',e=>{ptrs.delete(e.pointerId);gest=null});
cv.addEventListener('wheel',e=>{e.preventDefault();cam.anim=null;const wp=toWorld(e.clientX,e.clientY);cam.z=clamp(cam.z*Math.exp(-e.deltaY*(e.ctrlKey?.01:.0016)),zMin(),zMax());cam.x=wp.x-e.clientX/cam.z;cam.y=wp.y-e.clientY/cam.z;clampCam()},{passive:false});
window.addEventListener('resize',resize);
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseGame()});
window.addEventListener('keydown',e=>{if(e.key==='Escape'){if(G.state==='paused')resumeGame();else pauseGame()}});

$('playBtn').onclick=()=>{audio();startStage(PROG.max>=0?PROG.next:0)};
$('albumBtn').onclick=openAlbum;$('albumClose').onclick=()=>{$('album').hidden=true;if(G.state==='clear')$('clear').hidden=false};
$('introGo').onclick=go;
$('hintBtn').onclick=useHint;
$('zoomBtn').onclick=()=>{const v=viewRect(),cx=v.x+v.w/2,cy=v.y+v.h/2;if(cam.z>zMin()*1.3)lookAt(cx,cy,zMin(),.6);else lookAt(cx,cy,zMin()*2.6,.6)};
$('menuBtn').onclick=pauseGame;$('resumeBtn').onclick=resumeGame;
$('skipBtn').onclick=()=>{$('pause').hidden=true;G.state='clear';wipe(VW/2,VH/2,()=>startStage((G.si+1)%STAGES.length))};
$('homeBtn').onclick=()=>{$('pause').hidden=true;bgmStop();showTitle()};
document.querySelectorAll('.snd').forEach(b=>b.onclick=()=>{audio();setSound(!SOUND)});setSound(SOUND);

let last=performance.now();
function frame(now){
  const dt=Math.min(.05,(now-last)/1000);last=now;NOW=now/1000;
  if(W){
    if(G.state==='play'||G.state==='hunt'){G.t+=dt;if(Math.floor(G.t)!==Math.floor(G.t-dt))updateHintBtn()}
    if(G.state==='play'&&G.diff&&G.diff.assist){
      if(G.t>45){G.assistT-=dt;if(G.assistT<=0){G.assistT=5;const f=W.fam.futan;f.hop=1;addFx({k:'ring',x:f.x,y:f.y-20,r:8,grow:26,d:.6,col:'#ffd23f',w:3})}}
      if(G.t>75&&!G.autoHint&&G.hints===0){G.autoHint=true;toast('ヒントだよ！');useHint()}
    }
    if(G.futanGlow&&(G.state==='play')){G.glowT-=dt;if(G.glowT<=0){G.glowT=2.5;const f=W.fam.futan;burst(f.x+4,f.y-14,10,['#ffd23f','#fff6b0','#ff8cc0'],70)}}
    for(const it of W.items){if(it.hop>0)it.hop-=dt*1.8;it.walking=false}
    if(G.state!=='paused')stepWalkers(dt);
    if(G.state==='title'){cam.x=clamp(WW/2-VW/2/cam.z+Math.sin(NOW*.08)*300,0,WW);cam.y=clamp(WH/2-VH/2/cam.z+Math.sin(NOW*.05)*150,0,WH);clampCam()}
    stepCam(dt);
  }
  render(NOW);updateBubbles();stepWipe(dt);
  requestAnimationFrame(frame);
}
resize();
window.GAME={G,get W(){return W},startStage,go,onTap,toScreen,showClear,STAGES,useHint,foundSub};
showTitle();
requestAnimationFrame(frame);

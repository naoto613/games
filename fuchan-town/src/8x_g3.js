// ================= shared 3D toolkit =================
const HAS3D=(()=>{try{const c=document.createElement('canvas');return!!(c.getContext('webgl2')||c.getContext('webgl'));}catch(e){return false;}})();
const SCN2D={};
if(HAS3D)setTimeout(()=>need3D(()=>{}),50);
function stage3(o){o=o||{};const s=new THREE.Scene();if(o.fog)s.fog=new THREE.Fog(o.fog,o.fn||40,o.ff||120);const hemi=new THREE.HemisphereLight(o.sky||0xffffff,o.gnd||0xdce8f0,o.hi||.72);s.add(hemi);
  const dl=new THREE.DirectionalLight(0xfff8f0,o.di||.78);dl.position.set(10,22,12);dl.castShadow=o.shadow!==false;dl.shadow.mapSize.set(o.sm||1024,o.sm||1024);const sc=dl.shadow.camera,R=o.sr||16;sc.left=sc.bottom=-R;sc.right=sc.top=R;sc.near=1;sc.far=90;dl.shadow.bias=-.0006;dl.shadow.normalBias=.03;s.add(dl);s.add(dl.target);
  const cam=new THREE.PerspectiveCamera(o.fov||50,W/H,.1,600);return{s,cam,dl,hemi};}
function lightAt(S,x,z,y){S.dl.position.set(x+10,(y||0)+22,z+12);S.dl.target.position.set(x,y||0,z);S.dl.target.updateMatrixWorld();}
function render3(c,S){const r=r3main();S.cam.aspect=W/H;S.cam.updateProjectionMatrix();r.render(S.s,S.cam);c.drawImage(r.domElement,0,0,W,H);}
function ray3(S,x,y){const rc=G3.rc||(G3.rc=new THREE.Raycaster());rc.setFromCamera(new THREE.Vector2(x/W*2-1,-(y/H*2-1)),S.cam);return rc;}
function hitPlane(S,x,y,h){const v=new THREE.Vector3();return ray3(S,x,y).ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),-(h||0)),v)?v:null;}
function pick3(S,x,y,objs){const hits=ray3(S,x,y).intersectObjects(objs,true);for(const h of hits){let o=h.object;while(o&&!o.userData.pk)o=o.parent;if(o)return{o,pt:h.point};}return null;}
function toScr(S,v){const p=v.clone().project(S.cam);return{x:(p.x+1)/2*W,y:(1-p.y)/2*H,vis:p.z<1};}
function tagPk(g,v){g.userData.pk=v||1;return g;}
function loading3(c,fail){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#bfe6ff');g.addColorStop(1,'#ffe6f2');c.fillStyle=g;c.fillRect(-OX/SC,-OY/SC,W+2*OX/SC,H+2*OY/SC);c.textAlign='center';c.textBaseline='middle';
  if(fail){c.fillStyle='#c0508a';c.font=`800 24px ${FONT}`;c.fillText('この きかいでは 3Dが ひらけないみたい…',W/2,H/2);return;}c.fillStyle='#ff8cc0';c.font=`800 26px ${FONT}`;c.fillText('じゅんびちゅう…',W/2,H/2);for(let i=0;i<8;i++){c.globalAlpha=(i+1)/8;circ(c,W/2+Math.cos(T*6+i*.8)*36,H/2+64+Math.sin(T*6+i*.8)*36,8);}c.globalAlpha=1;}
// wrap a scene definition so three.js is loaded and build() runs before update/draw/input
function scene3(def){const o=Object.assign({},def);
  o.enter=function(){this.ready=false;this.fail=false;const run=()=>{if(scene!==this)return;try{r3main();def.build.call(this);this.ready=true;}catch(e){console.error(e);this.fail=true;}};need3D(run);};
  o.update=function(dt){if(this.ready&&def.update)def.update.call(this,dt);};
  o.draw=function(c){if(!this.ready){loading3(c,this.fail);return;}def.draw.call(this,c);};
  for(const k of['down','move','up'])o[k]=function(x,y){if(this.ready&&def[k])def[k].call(this,x,y);};
  o.hint=function(){return this.ready&&def.hint?def.hint.call(this):null;};return o;}
function reg3(id,def){if(SCN[id])SCN2D[id]=SCN[id];SCN[id]=scene3(def);}
// billboard characters (Fu-chan / Rikki / animals drawn with the 2D art)
function charSpr(k,h,opt){const cv2=document.createElement('canvas');cv2.width=200;cv2.height=300;const tx=new THREE.CanvasTexture(cv2);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true,depthWrite:true,alphaTest:.3}));sp.center.set(.5,.03);sp.scale.set(h*2/3,h,1);
  const sh=new THREE.Mesh(geo3('blob',()=>new THREE.CircleGeometry(.5,24)),new THREE.MeshBasicMaterial({color:0x4a3a6a,transparent:true,opacity:.22,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.scale.setScalar(h*.3);
  return Object.assign({k,cv:cv2,tx,sp,sh,h,x:0,y:0,z:0,dir:0,mv:false,jump:0,cheer:0,every:1,fc:0},opt||{});}
function charAdd(S,p){S.s.add(p.sp);S.s.add(p.sh);return p;}
function charUpd(p,dt){if(p.jump>0)p.jump=Math.max(0,p.jump-dt*2.2);if(p.cheer>0)p.cheer-=dt;const jy=Math.sin(p.jump*Math.PI)*p.h*.28;p.sp.position.set(p.x,p.y+jy,p.z);p.sh.position.set(p.x,(p.gy!=null?p.gy:p.y)+.03,p.z);
  p.fc=(p.fc+1)%p.every;if(p.fc)return;const c=p.cv.getContext('2d');c.clearRect(0,0,200,300);
  if(p.k==='fu')drawFuka(c,100,294,{outfit:p.outfit||outfit(),t:T,sc:4.5,dir:p.mv?p.dir:(p.face||0),moving:p.mv,cheer:p.jump>0||p.cheer>0,wave:p.wave,point:p.point});
  else if(p.k==='rk')drawRikki(c,100,294,{sc:4.1,t:T,moving:p.mv,dir:p.mv?p.dir:0,clap:p.jump>0||p.cheer>0?1:0});
  else drawAnimal(c,p.k,100,286,2.3,{t:T+(p.seed||0),happy:p.cheer>0||p.jump>0});p.tx.needsUpdate=true;}
// walk a character toward (x,z); returns true when arrived. Screen direction from camera
function charWalk(p,tx,tz,sp,dt,cam){const dx=tx-p.x,dz=tz-p.z,d=Math.hypot(dx,dz);if(d<.05){p.mv=false;return true;}const st=Math.min(d,sp*dt);p.x+=dx/d*st;p.z+=dz/d*st;p.mv=true;
  if(cam){const r=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,0),f=new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld,2);const sx=dx*r.x+dz*r.z,sz=dx*f.x+dz*f.z;p.dir=Math.abs(sx)>Math.abs(sz)*.7?(sx<0?1:2):(sz>0?0:3);}return false;}
function iconTex(k,bg){return ctex('ic'+k+(bg||''),160,160,c=>{c.fillStyle=bg||'#fff';c.beginPath();c.arc(80,80,78,0,TAU);c.fill();drawThing(c,k,80,80,1.5);});}
function labelTex(txt,col,bg){return ctex('lb'+txt+col+bg,512,128,c=>{c.fillStyle=bg||'#fff';rr(c,4,4,504,120,60);c.fill();c.fillStyle=col||'#5a3a5a';c.font=`800 64px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(txt,256,68,480);});}
function iconDisc(g,k,r,x,y,z,rim){const m=new THREE.Mesh(geo3('disc'+r,()=>new THREE.CylinderGeometry(r,r,.22,36)),[m3(rim||'#ffffff'),new THREE.MeshStandardMaterial({map:iconTex(k),roughness:.6}),new THREE.MeshStandardMaterial({map:iconTex(k),roughness:.6})]);m.rotation.x=Math.PI/2;m.position.set(x,y,z);m.castShadow=true;g.add(m);return m;}
// soft sky backdrop for 3D scenes (2D gradient painted behind the transparent renderer)
function sky3(c,top,bot,clouds){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,top);g.addColorStop(1,bot);c.fillStyle=g;c.fillRect(-OX/SC,-OY/SC,W+2*OX/SC,H+2*OY/SC);if(clouds){cloud(c,(T*8)%(W+300)-150,170,.7,true);cloud(c,(T*5+300)%(W+300)-150,280,.5,true);}}
function tree3(g,x,z,s,col){const t=new THREE.Group();t.position.set(x,0,z);t.scale.setScalar(s||1);g.add(t);C3(t,.18,.26,1.2,'#a8704a',0,0,0,8);S3(t,.9,col||'#58c078',0,1.8,0);S3(t,.7,col?shade(col,.1):'#6cd08a',.35,2.3,.1);S3(t,.6,col||'#4cbe7a',-.3,2.2,-.2);return t;}
function hud3Btn(c,x,y,r,col,ic,lab){drawBtn(c,x,y,r,col,ic);if(lab){c.fillStyle='#fff';c.font=`800 15px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.lineWidth=4;c.strokeStyle='rgba(90,40,110,.6)';c.strokeText(lab,x,y+r+14);c.fillText(lab,x,y+r+14);}}
function starsRow(c,x,y,n,r,of){of=of||3;for(let i=0;i<of;i++){c.fillStyle=i<n?'#ffc21a':'rgba(255,255,255,.75)';star(c,x+(i-(of-1)/2)*r*2.1,y,r,r*.45);c.fill();c.strokeStyle=i<n?'#e89a00':'rgba(150,130,160,.6)';c.lineWidth=1.5;c.stroke();}}

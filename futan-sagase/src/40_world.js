// ================= world: sprites, building a stage, rendering =================
const RS=1.6,BGS=1.25;
const sprCache=new Map();
function makeSprite(key,w,h,draw,res){
  if(key&&sprCache.has(key))return sprCache.get(key);
  res=res||RS;const pad=4,c=mk((w+pad*2)*res,(h+pad*2)*res),x=c.getContext('2d');
  x.scale(res,res);x.translate(w/2+pad,h+pad);draw(x);
  const s={c,ax:w/2+pad,ay:h+pad,w:w+pad*2,h:h+pad*2};if(key)sprCache.set(key,s);return s;
}
function personSprite(look){return makeSprite(null,84,130,x=>drawPerson(x,look))}
function personHit(look){const B=BODY[look.age||'adult'],s=look.s||1;return{hw:12*s,hh:(-B.hy+B.hr+5)*s}}

let W=null; // current world
function buildWorld(st,seed,diff){
  diff=diff||{people:1,decoys:1,hide:0};
  R=rng(seed);
  const w={st,seed,items:[],fx:[],foot:[],fam:{},found:{},t:0};
  // background
  if(st.geo)st.geo(w);
  const bg=mk(WW*BGS,WH*BGS),bx=bg.getContext('2d');bx.scale(BGS,BGS);ink(bx);st.bg(bx,w);w.bg=bg;
  // props
  const L={
    prop(k,x,y,o){o=o||{};const P=PROPS[k];const s=o.s||1;
      const key=k+JSON.stringify(o);const spr=makeSprite(key,P[0]*s,P[1]*s,c=>{ink(c);c.scale(s,s);P[2](c,o)},o.res||1.5);
      const it={kind:'prop',k,x,y,spr,flip:!!o.flip};w.items.push(it);
      if(!o.noFoot)w.foot.push({x0:x-P[0]*s*.42,x1:x+P[0]*s*.42,y0:y-(o.depth||20)*s,y1:y+8});return it},
    block(x0,y0,x1,y1){w.foot.push({x0,y0,x1,y1})}
  };
  st.layout(L,w);
  // crowd
  const pts=[];
  const free=(x,y,d)=>{for(const f of w.foot)if(x>f.x0&&x<f.x1&&y>f.y0&&y<f.y1)return false;for(const p of pts){const dx=p.x-x,dy=(p.y-y)*1.6;if(dx*dx+dy*dy<d*d)return false}return true};
  const spot=(want,d,tries)=>{for(let i=0;i<(tries||400);i++){const x=rnd(40,WW-40),y=rnd(60,WH-20),k=st.walk(x,y,w);if(!k)continue;if(want==='crowd'?!(st.peopleOn||['land']).includes(k):want==='any'?!(st.peopleOn||['land']).includes(k):want&&k!==want)continue;if(free(x,y,d)){pts.push({x,y});return{x,y,k}}}return null};
  w.spot=spot;
  // family first so they get good places
  const margin=(x,y)=>x>160&&x<WW-160&&y>220&&y<WH-120;
  let fp=null;for(let i=0;i<60&&!fp;i++){const s=spot(st.futanSwim?'any':'land',16);if(s&&margin(s.x,s.y))fp=s;else if(s)pts.pop()}
  if(!fp)fp=spot('land',10)||{x:WW/2,y:WH/2,k:'land'};
  const fLook=familyLook(LOOK_FUTAN,st,'futan');if(fp.k==='swim')fLook.swim=true;
  w.fam.futan=addPerson(w,fLook,fp.x,fp.y,'futan');
  if(st.hide&&chance(Math.min(.95,st.hide.p+diff.hide))){const k=pick(st.hide.props);const it=L.prop(k,fp.x+rnd(-8,8),fp.y+rnd(7,12),Object.assign({noFoot:true},st.hide.opts&&st.hide.opts[k]||{}));it.hider=true}
  const far=(want)=>{for(let i=0;i<80;i++){const s=spot(want,16);if(!s)continue;if(Math.hypot(s.x-fp.x,s.y-fp.y)>520&&margin(s.x,s.y))return s;pts.pop()}return spot(want,8)||{x:200,y:WH-200,k:'land'}};
  const mp=far('land');w.fam.mama=addPerson(w,familyLook(LOOK_MAMA,st,'mama'),mp.x,mp.y,'mama');
  const pp=far('land');w.fam.papa=addPerson(w,familyLook(LOOK_PAPA,st,'papa'),pp.x,pp.y,'papa');
  const rp={x:rnd(200,WW-200),y:rnd(300,WH-150)};
  w.fam.ricky={kind:'ricky',x:rp.x,y:rp.y,hx:rp.x,hy:rp.y,ph:0,live:true,hit:{hw:16,hh:62},hop:0};w.items.push(w.fam.ricky);
  // crowd
  const n=Math.round(st.people*diff.people);let made=0;
  for(let i=0;i<n*3&&made<n;i++){const s=spot('crowd',st.gap||15,1);if(!s)continue;const look=st.look(s.k);if(s.k==='swim')look.swim=true;addPerson(w,look,s.x,s.y,'mob');made++}
  // decoys: kids who share one or two things with ふーたん
  const kids=w.items.filter(it=>it.kind==='mob'&&it.look.age==='kid'&&!it.look.swim);shuffle(kids);
  for(let i=0;i<Math.min(Math.round(st.decoys*diff.decoys),kids.length);i++){const it=kids[i],o=it.look;const v=i%3;
    // みつあみだけ同じ／ピンクの みずたまだけ同じ／みつあみ＋ピンク（みずたま なし）
    if(v===0){o.fem=true;o.hair='braid';o.hairCol=pick(HAIRCOLS);o.ribbon=pick(['#3f7bd6','#4cad62','#f6c63a','#fff']);if(o.topCol===FUTAN_PINK)o.topCol='#7cc8ec';o.hat=null}
    else if(v===1){o.top='dress';o.fem=true;o.topCol=FUTAN_PINK;o.dots='#fff';o.hair=pick(['bob','pony','short','curly']);o.hat=null}
    else{o.fem=true;o.hair='braid';o.top='dress';o.topCol=pick([FUTAN_PINK,'#f7a8c8','#e86a9a']);o.dots=null;o.hat=null;o.ribbon=pick(['#e8504a','#fff'])}
    o.acc=Object.assign({},o.acc);delete o.acc.pochette;
    if(st.decoyFix)st.decoyFix(o);
    it.spr=personSprite(o)}
  // animals
  for(const[k,cnt,where]of st.animals||[])for(let i=0;i<cnt;i++){const s=spot(where||'land',12,60);if(!s)continue;
    const col=k==='cat'?pick(['#3b3533','#f7f4ee','#e8a050']):k==='dog'?pick(['#e8c8a0','#f7f4ee','#a8703f']):k==='fish'?pick(['#f28b2f','#f6c63a','#7cc8ec','#f28fb7']):undefined;
    const it={kind:'animal',k,x:s.x,y:s.y,spr:makeSprite('a'+k+col,40,40,c=>drawAnimal(c,k,col)),hit:{hw:13,hh:22},ph:rnd(6.28),hop:0,flip:chance(.5),where:where||'land'};
    if(chance(.5))it.walk={tx:s.x,ty:s.y,wait:rnd(3),sp:k==='fish'?14:18};w.items.push(it)}
  w.items.sort((a,b)=>a.y-b.y);
  return w;
}
function addPerson(w,look,x,y,kind){
  const it={kind,look,x,y,spr:personSprite(look),hit:personHit(look),ph:rnd(6.28),hop:0,flip:chance(.5)};
  if(kind==='mob'&&!look.swim&&chance(w.st.walkers||.1))it.walk={tx:x,ty:y,wait:rnd(4),sp:rnd(12,20)};
  w.items.push(it);return it;
}
function stepWalkers(dt){
  for(const it of W.items){const m=it.walk;if(!m||it.frozen)continue;
    if(m.wait>0){m.wait-=dt;continue}
    const dx=m.tx-it.x,dy=m.ty-it.y,d=Math.hypot(dx,dy);
    if(d<1){m.wait=rnd(1.5,5);for(let i=0;i<8;i++){const a=rnd(TAU),r=rnd(30,110),nx=it.x+Math.cos(a)*r,ny=it.y+Math.sin(a)*r*.5,k=W.st.walk(nx,ny,W);
      if(k&&k===(it.where||'land')&&!W.foot.some(f=>nx>f.x0&&nx<f.x1&&ny>f.y0&&ny<f.y1)){m.tx=nx;m.ty=ny;break}}continue}
    const s=Math.min(d,m.sp*dt);it.x+=dx/d*s;it.y+=dy/d*s;if(Math.abs(dx)>.5)it.flip=dx>0;it.walking=true;
  }
}

// ---------- rendering ----------
const cv=$('cv'),ctx=cv.getContext('2d');
let DPR=1,VW=1,VH=1;
const cam={x:0,y:0,z:.5,anim:null};
function zMin(){return Math.max(VW/WW,VH/WH)}
function zMax(){return Math.max(2.6,zMin()*4)}
function clampCam(){cam.z=clamp(cam.z,zMin(),zMax());const vw=VW/cam.z,vh=VH/cam.z;cam.x=clamp(cam.x,0,Math.max(0,WW-vw));cam.y=clamp(cam.y,0,Math.max(0,WH-vh));if(vw>WW)cam.x=(WW-vw)/2;if(vh>WH)cam.y=(WH-vh)/2}
function resize(){DPR=Math.min(window.devicePixelRatio||1,2);VW=innerWidth;VH=innerHeight;cv.width=VW*DPR;cv.height=VH*DPR;clampCam()}
const toWorld=(sx,sy)=>({x:cam.x+sx/cam.z,y:cam.y+sy/cam.z});
const toScreen=(wx,wy)=>({x:(wx-cam.x)*cam.z,y:(wy-cam.y)*cam.z});
function lookAt(x,y,z,dur){const tz=clamp(z,zMin(),zMax());cam.anim={x0:cam.x,y0:cam.y,z0:cam.z,x1:x-VW/2/tz,y1:y-VH/2/tz,z1:tz,t:0,d:dur||.8}}
function stepCam(dt){const a=cam.anim;if(!a)return;a.t+=dt;const k=Math.min(1,a.t/a.d),e=k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
  cam.z=lerp(a.z0,a.z1,e);cam.x=lerp(a.x0,a.x1,e);cam.y=lerp(a.y0,a.y1,e);clampCam();if(k>=1)cam.anim=null}
function drawItem(c,it,t){
  let y=it.y;const B=it.hop>0?-Math.sin(Math.min(1,it.hop)*Math.PI)*14:0;
  const bob=it.walking?-Math.abs(Math.sin(t*9+it.ph))*1.6:it.kind==='prop'?0:-Math.max(0,Math.sin(t*1.6+it.ph))*.7;
  if(it.kind==='ricky'){c.save();c.translate(it.x,it.y);drawRicky(c,t,{hop:-B,happy:it.happy});c.restore();return}
  if(it.liveLook){c.save();c.translate(it.x,y+B);c.scale(it.scale||1,it.scale||1);drawPerson(c,it.liveLook);c.restore();return}
  const s=it.spr;if(!s)return;
  if(it.flip){c.save();c.translate(it.x,y+B+bob);c.scale(-1,1);c.drawImage(s.c,-s.ax,-s.ay,s.w,s.h);c.restore()}
  else c.drawImage(s.c,it.x-s.ax,y+B+bob-s.ay,s.w,s.h);
}
function renderWorld(c,t,x0,y0,z,vw,vh){
  c.setTransform(z,0,0,z,-x0*z,-y0*z);
  c.drawImage(W.bg,0,0,WW,WH);
  if(W.st.under)W.st.under(c,t,W);
  W.items.sort((a,b)=>a.y-b.y);
  const L=x0-90,Rr=x0+vw+90,T=y0-20,Bt=y0+vh+180;
  for(const it of W.items){if(it.x<L||it.x>Rr||it.y<T||it.y>Bt)continue;drawItem(c,it,t)}
  if(W.st.over)W.st.over(c,t,W);
}
function render(t){
  ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#f3e9da';ctx.fillRect(0,0,cv.width,cv.height);
  if(!W)return;
  renderWorld(ctx,t,cam.x,cam.y,cam.z*DPR,VW/cam.z,VH/cam.z);
  drawFx(ctx,t);
}
// a whole-stage picture for the intro card and the album
function snapshot(w,h){const c=mk(w,h),x=c.getContext('2d');const z=Math.max(w/WW,h/WH);renderWorld(x,0,(WW-w/z)/2,(WH-h/z)/2,z,w/z,h/z);return c}

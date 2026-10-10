// ================= ガチャガチャ・きせかえ・ずかん =================
const GC={cv:null,x:null,W:360,H:560,state:'idle',ang:0,acc:0,auto:0,caps:[],drop:null,open:null,prize:null,after:null,shake:0,t0:0,lastClick:0,raf:0};
function capColor(r){const c=RARITY[r].cap;return pick(c)}
function initCaps(){GC.caps=[];const r=rng(7);for(let i=0;i<18;i++){const rr2=r()<.08?'k':r()<.3?'r':'n';GC.caps.push({x:180+(r()-.5)*170,y:150+r()*80,a:r()*6,r:rr2,col:capColor(rr2),vx:0,vy:0})}}
function drawCapsule(c,x,y,rad,col,rot,open){
  c.save();c.translate(x,y);c.rotate(rot||0);ink(c,2.2);
  const top=col==='rainbow'?(()=>{const g=c.createLinearGradient(-rad,-rad,rad,0);['#ff6f9f','#f6c63a','#7fd6b4','#7cc8ec','#c79bff'].forEach((h,i)=>g.addColorStop(i/4,h));return g})():col;
  const o=open||0;
  c.save();c.translate(-o*rad*1.2,-o*rad*1.6);c.rotate(-o*1.2);c.beginPath();c.arc(0,0,rad,Math.PI,0);c.closePath();c.fillStyle=top;c.fill();c.stroke();ell(c,-rad*.4,-rad*.5,rad*.22,rad*.14,-.5);F(c,'rgba(255,255,255,.7)');c.restore();
  c.save();c.translate(o*rad*1.1,o*rad*1.4);c.rotate(o*.9);c.beginPath();c.arc(0,0,rad,0,Math.PI);c.closePath();c.fillStyle='rgba(255,255,255,.92)';c.fill();c.stroke();c.restore();
  c.restore();
}
function drawMachine(c,t){
  const sh=GC.shake>0?Math.sin(t*60)*GC.shake*4:0;c.save();c.translate(sh,0);ink(c,3);
  // stand + body
  rr(c,70,500,220,22,8);FS(c,'#c9433a');
  rr(c,60,250,240,262,26);FS(c,'#e8504a');rr(c,72,262,216,40,12);FS(c,'#fff6e8');
  c.fillStyle='#e8504a';c.font='900 22px "Mochiy Pop One",sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('ふーたん ガチャ',180,283);
  // coin slot + label
  rr(c,232,318,46,56,10);FS(c,'#fff6e8');rr(c,251,326,8,26,3);FS(c,'#3b3533');c.fillStyle=LN;c.font='900 11px sans-serif';c.fillText('1かい',255,364);
  // handle
  c.save();c.translate(160,370);circ(c,0,0,46);FS(c,'#f7f4ee');circ(c,0,0,34);FS(c,'#ffd0e0');c.rotate(GC.ang);rr(c,-10,-44,20,88,10);FS(c,'#fff');circ(c,0,-34,5);F(c,'#e8504a');c.restore();
  if(GC.state==='idle'&&PROG.gacha.spins>0){c.save();c.translate(160,370);c.rotate(t*2);c.strokeStyle='rgba(255,111,159,.8)';c.lineWidth=4;c.setLineDash([10,9]);circ(c,0,0,58);c.stroke();c.restore();ink(c,3);
    }
  // exit + tray
  rr(c,84,430,70,52,14);FS(c,'#3b2a2a');rr(c,88,434,62,20,10);F(c,'#5a3a3a');rr(c,66,474,106,24,10);FS(c,'#c9433a');
  // dome with capsules
  c.save();circ(c,180,150,125);c.clip();c.fillStyle='rgba(220,240,255,.55)';c.fillRect(40,20,290,270);
  for(const p of GC.caps)drawCapsule(c,p.x,p.y,19,p.col,p.a);
  c.restore();ink(c,3);circ(c,180,150,125);c.stroke();ell(c,130,85,30,16,-.6);F(c,'rgba(255,255,255,.6)');
  rr(c,90,256,180,12,6);FS(c,'#c9433a');c.beginPath();c.arc(180,32,40,Math.PI,0);c.closePath();FS(c,'#e8504a');circ(c,180,-6,10);FS(c,'#f6c63a');
  c.restore();
}
function stepCaps(dt,shaking){for(const p of GC.caps){if(shaking){p.vx+=(Math.random()-.5)*900*dt;p.vy-=Math.random()*700*dt}p.vy+=600*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.a+=p.vx*dt*.05;
  const dx=p.x-180,dy=p.y-150,d=Math.hypot(dx,dy);if(d>100){const k=100/d;p.x=180+dx*k;p.y=150+dy*k;p.vx*=-.4;p.vy*=-.4}p.vx*=.98;p.vy*=.98}
  // capsules push each other apart so they pile up in the dome
  const cs=GC.caps;for(let k=0;k<3;k++)for(let i=0;i<cs.length;i++)for(let j=i+1;j<cs.length;j++){const a=cs[i],b=cs[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||.01;if(d<37){const m=(37-d)/2,nx=dx/d,ny=dy/d;a.x-=nx*m;a.y-=ny*m;b.x+=nx*m;b.y+=ny*m;a.vx*=.9;a.vy*=.9;b.vx*=.9;b.vy*=.9}}}
function pickPrize(){
  const g=PROG.gacha;const lockedKeys=STAGES.filter(s=>s.secret&&!g.keys.includes(s.id));
  if(lockedKeys.length&&Math.random()<.1)return{kind:'key',r:'k',st:lockedKeys[0],n:'ひみつの カギ'};
  const r=pickW([['n',RARITY.n.w],['r',RARITY.r.w],['k',RARITY.k.w]]);const pool=PRIZES.filter(p=>p.r===r);return pick(pool);
}
function turnDone(){
  if(PROG.gacha.spins<=0)return;PROG.gacha.spins--;saveProg();
  GC.caps.splice(Math.floor(Math.random()*GC.caps.length),1);if(GC.caps.length<9)setTimeout(()=>{for(let i=0;i<9;i++){const r=pick(['n','n','r','k']);GC.caps.push({x:180+(Math.random()-.5)*120,y:60,a:Math.random()*6,r,col:capColor(r),vx:0,vy:0})}},2500);
  GC.prize=pickPrize();GC.state='drop';GC.shake=1;SFX.whoosh();
  GC.drop={x:119,y:440,vy:-60,vx:0,a:0,bounces:0,col:GC.prize.kind==='key'?'rainbow':capColor(GC.prize.r)};
  setTimeout(()=>tone(300,0,.15,'triangle',.2,null,180),550);
  updateGachaInfo();
}
function gachaFrame(now){
  if(!GC.cv||$('gacha').hidden){GC.raf=0;return}
  const t=now/1000,dt=Math.min(.05,t-(GC.lt||t));GC.lt=t;const c=GC.x;
  c.setTransform(GC.dpr,0,0,GC.dpr,0,0);c.clearRect(0,0,GC.W,GC.H);
  if(GC.auto>0){const d=Math.min(GC.auto,dt*7);GC.auto-=d;rotateBy(d)}
  if(GC.shake>0)GC.shake=Math.max(0,GC.shake-dt*1.5);
  stepCaps(dt,GC.shake>.3);
  drawMachine(c,t);
  if(GC.state==='drop'||GC.state==='ready'){const d=GC.drop;if(GC.state==='drop'){d.vy+=1400*dt;d.y+=d.vy*dt;d.x+=d.vx*dt;d.a+=d.vx*dt*.05;if(d.y>468){d.y=468;if(d.bounces<3){d.vy=-d.vy*.45;d.vx=(d.bounces?-40:70);d.bounces++;tone(500-d.bounces*80,0,.08,'sine',.12)}else{d.vy=0;d.vx=0;GC.state='ready'}}}
    drawCapsule(c,d.x,d.y,20,d.col,d.a);
    if(GC.state==='ready'){const b=Math.sin(t*6)*3;c.fillStyle='#fff';ink(c,3);rr(c,160,440+b,140,34,14);FS(c,'#fff');c.fillStyle='#e8487a';c.font='900 15px "Zen Maru Gothic",sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('タップで あける！',230,457+b)}}
  if(GC.state==='open'||GC.state==='reveal'){
    const o=GC.open,k=Math.min(1,(t-o.t0)/.5);c.fillStyle='rgba(255,246,236,'+(.85*k)+')';c.fillRect(0,0,GC.W,GC.H);
    const cx=180,cy=230;
    if(GC.state==='reveal'){c.save();c.translate(cx,cy);c.rotate(t*.6);const rc=GC.prize.r==='k'?['#ffe46a','#ff9cd0','#9fe0ff']:GC.prize.r==='r'?['#ffe46a']:['#ffd6e6'];for(let i=0;i<14;i++){c.rotate(TAU/14);c.fillStyle=rc[i%rc.length];c.globalAlpha=.55;poly(c,[[0,0],[-20,-220],[20,-220]]);c.fill()}c.restore();c.globalAlpha=1;
      c.drawImage(o.img,cx-o.img.width/4,cy-o.img.height/4-10,o.img.width/2,o.img.height/2);
      for(let i=0;i<8;i++){const a=t*1.5+i*.8,r=120+Math.sin(t*3+i)*10;star(c,cx+Math.cos(a)*r,cy+Math.sin(a)*r*.7,8,3.5);c.fillStyle='#fff6b0';c.fill()}}
    const wob=GC.state==='open'?Math.sin((t-o.t0)*30)*.25*(1-Math.min(1,(t-o.t0)/.9)):0;
    const op=GC.state==='open'?Math.max(0,((t-o.t0)-.9)/.35):1+(t-o.t1)*2;
    if(op<3)drawCapsule(c,cx,cy+ (GC.state==='reveal'?(t-o.t1)*300:0),56,GC.drop.col,wob,Math.min(op,3));
    if(GC.state==='open'&&t-o.t0>1.25){GC.state='reveal';o.t1=t;revealPrize()}
  }
  GC.raf=requestAnimationFrame(gachaFrame);
}
function rotateBy(d){const before=Math.floor(GC.acc/(Math.PI/2));GC.ang+=d;GC.acc+=d;const after=Math.floor(GC.acc/(Math.PI/2));
  if(after!==before){noise(0,.05,.3,1800);tone(180,0,.05,'square',.05);GC.shake=Math.max(GC.shake,.25)}
  if(GC.acc>=TAU){GC.acc=0;GC.auto=0;turnDone()}}
function prizeImage(p){const c=mk(300,300),x=c.getContext('2d');x.translate(150,280);
  if(p.kind==='wear'){x.scale(4.6,4.6);const L=lookWith({[p.slot]:p.id});drawPerson(x,Object.assign(L,{happy:true}))}
  else if(p.kind==='secret'){x.scale(1.2,1.2);ink(x,4.5);SECRET_BY[p.sid].draw(x)}
  else{x.translate(0,-120);x.rotate(-.5);ink(x,6);circ(x,-50,0,40);FS(x,'#f6c63a');circ(x,-50,0,18);FS(x,'#fff6e8');rr(x,-12,-12,120,24,8);FS(x,'#f6c63a');rr(x,70,8,16,30,4);FS(x,'#f6c63a');rr(x,94,8,14,22,4);FS(x,'#f6c63a');heart(x,-50,0,10);F(x,'#ff6f9f')}
  return c}
function revealPrize(){
  const p=GC.prize,g=PROG.gacha;let isNew=false,msg='';
  if(p.kind==='key'){g.keys.push(p.st.id);isNew=true;msg='ひみつの ステージ「'+p.st.name+'」が ひらいた！'}
  else if(!g.owned[p.id]){g.owned[p.id]=true;isNew=true;msg=p.kind==='wear'?'きせかえ できるように なったよ':'つぎの ステージから まちの どこかに かくれるよ'}
  else{g.stars++;msg='もう もってる！ おまけの ほし +1（'+g.stars+'/5）';if(g.stars>=5){g.stars-=5;g.spins++;msg+=' → ほし 5こで もう1かい！'}}
  saveProg();
  ({k:()=>{SFX.found();SFX.magic()},r:()=>SFX.found(),n:()=>SFX.chime()})[p.r]();
  const info=$('gachaPrize');info.hidden=false;
  info.innerHTML=`<div class="rar r-${p.r}">${RARITY[p.r].name}${isNew?' <b>NEW!</b>':''}</div><div class="pname">${p.kind==='secret'?'かくれキャラ：':p.kind==='key'?'':'きせかえ：'}${p.n}</div><p>${msg}</p>
    <div class="row">${p.kind==='wear'?'<button class="btn" id="gWear">きてみる</button>':''}${p.kind==='key'?'<button class="btn main" id="gGo">いってみる！</button>':''}<button class="btn ${p.kind==='key'?'':'main'}" id="gOk">${g.spins>0?'もう いっかい':'OK'}</button></div>`;
  const ok=$('gOk');ok.onclick=()=>{info.hidden=true;GC.state='idle';GC.open=null;GC.drop=null;updateGachaInfo()};
  const wb=$('gWear');if(wb)wb.onclick=()=>{g.equip[p.slot]=p.id;if(p.slot==='outfit'&&PRIZE_BY[p.id].hood&&g.equip.head&&!isHeadWear(g.equip.head))delete g.equip.head;saveProg();wb.textContent='きたよ！';wb.disabled=true;SFX.pop()};
  const go2=$('gGo');if(go2)go2.onclick=()=>{info.hidden=true;$('gacha').hidden=true;GC.state='idle';$('clear').hidden=true;$('title').hidden=true;$('album').hidden=true;audio();startStage(STAGES.indexOf(p.st))};
}
// ふーたんに ためしに きせた みため（いまの きせかえは そのまま）
function lookWith(eq){const g=PROG.gacha,keep=g.equip;g.equip=eq;const L=futanLook();g.equip=keep;return L}
function isHeadWear(id){return PRIZE_BY[id]&&PRIZE_BY[id].slot==='head'}
function updateGachaInfo(){const g=PROG.gacha;$('gachaInfo').innerHTML=`のこり <b>${g.spins}</b> かい　<span>おまけの ほし ${'★'.repeat(g.stars)}${'☆'.repeat(5-g.stars)}</span>`;$('gachaHint').textContent=g.spins>0?'ハンドルを ゆびで くるっと まわしてね（タップでも まわるよ）':'ステージを クリアすると まわせるよ。まま・パパ・リッキーを ぜんぶ みつけると もう1かい！'}
function openGacha(after){
  GC.after=after||null;const el=$('gacha');el.hidden=false;$('gachaPrize').hidden=true;
  if(!GC.cv){GC.cv=$('gcv');GC.x=GC.cv.getContext('2d');initCaps();bindGacha()}
  GC.dpr=Math.min(2,window.devicePixelRatio||1);GC.cv.width=GC.W*GC.dpr;GC.cv.height=GC.H*GC.dpr;
  GC.state='idle';GC.acc=0;GC.auto=0;updateGachaInfo();audio();
  if(!GC.raf)GC.raf=requestAnimationFrame(gachaFrame);
}
function closeGacha(){if(GC.state==='drop'||GC.state==='open')return;$('gacha').hidden=true;GC.state='idle';const f=GC.after;GC.after=null;if(f)f();else showTitle()}
function bindGacha(){
  const cvs=GC.cv;let drag=null;
  const pos=e=>{const r=cvs.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*GC.W,y:(e.clientY-r.top)/r.height*GC.H}};
  cvs.addEventListener('pointerdown',e=>{const p=pos(e);cvs.setPointerCapture(e.pointerId);
    if(GC.state==='ready'&&Math.hypot(p.x-119,p.y-468)<60||GC.state==='ready'&&p.y>380){GC.state='open';GC.open={t0:performance.now()/1000,img:prizeImage(GC.prize)};SFX.pop();return}
    if(GC.state==='idle'&&PROG.gacha.spins>0&&Math.hypot(p.x-160,p.y-370)<75){drag={a:Math.atan2(p.y-370,p.x-160),moved:0,t0:performance.now()}}});
  cvs.addEventListener('pointermove',e=>{if(!drag||GC.state!=='idle')return;const p=pos(e),a=Math.atan2(p.y-370,p.x-160);let d=a-drag.a;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;drag.a=a;if(d>0)rotateBy(d);drag.moved+=Math.abs(d)});
  cvs.addEventListener('pointerup',()=>{if(drag&&drag.moved<.3&&GC.state==='idle')GC.auto=TAU-GC.acc;drag=null});
  $('gachaClose').onclick=closeGacha;$('gachaCloset').onclick=()=>openCloset();
}
// ---- きせかえ ----
const SLOTS=[['head','あたま'],['outfit','ふく'],['back','せなか'],['face','かお']];
function openCloset(){
  const g=PROG.gacha,el=$('closetGrid');el.innerHTML='';
  const prev=$('closetPrev'),px=prev.getContext('2d');
  const redraw=()=>{px.setTransform(1,0,0,1,0,0);px.clearRect(0,0,prev.width,prev.height);px.translate(prev.width/2,prev.height-10);px.scale(4.2,4.2);drawPerson(px,futanLook())};
  for(const[slot,name]of SLOTS){const items=PRIZES.filter(p=>p.kind==='wear'&&p.slot===slot);const h=document.createElement('h3');h.textContent=name;el.appendChild(h);const row=document.createElement('div');row.className='crow';
    const none=document.createElement('button');none.className='citem'+(!g.equip[slot]?' on':'');none.innerHTML='<span>なし</span>';none.onclick=()=>{delete g.equip[slot];saveProg();openCloset()};row.appendChild(none);
    for(const p of items){const b=document.createElement('button');const own=g.owned[p.id];b.className='citem'+(g.equip[slot]===p.id?' on':'')+(own?'':' lock');
      const c=mk(90,90);if(own){const x=c.getContext('2d');x.translate(45,86);x.scale(1.45,1.45);drawPerson(x,lookWith({[slot]:p.id}))}
      b.appendChild(c);const s=document.createElement('span');s.textContent=own?p.n:'？';b.appendChild(s);
      if(own)b.onclick=()=>{g.equip[slot]=p.id;saveProg();SFX.pop();openCloset()};row.appendChild(b)}
    el.appendChild(row)}
  redraw();$('closet').hidden=false;
}
// ---- ずかん ----
function openZukan(){
  const g=PROG.gacha,el=$('zukanGrid');el.innerHTML='';
  const sec=(title,list,draw)=>{const h=document.createElement('h3');h.textContent=title;el.appendChild(h);const row=document.createElement('div');row.className='crow';for(const p of list){const own=draw(p);row.appendChild(own)}el.appendChild(row)};
  const card=(own,c,label,sub)=>{const b=document.createElement('div');b.className='citem'+(own?'':' lock');if(own)b.appendChild(c);else{const q=document.createElement('div');q.className='q';q.textContent='？';b.appendChild(q)}const s=document.createElement('span');s.textContent=own?label:'？？？';b.appendChild(s);if(sub&&own){const m=document.createElement('small');m.textContent=sub;b.appendChild(m)}return b};
  const wears=PRIZES.filter(p=>p.kind==='wear'),secs=PRIZES.filter(p=>p.kind==='secret');
  const nOwn=Object.keys(g.owned).length+g.keys.length,nAll=PRIZES.length+STAGES.filter(s=>s.secret).length;
  $('zukanCount').textContent=`あつめた かず ${nOwn} / ${nAll}`;
  sec('かくれキャラ',secs,p=>{const c=mk(90,90),x=c.getContext('2d');x.translate(45,86);x.scale(.38,.38);ink(x,4.5);SECRET_BY[p.sid].draw(x);return card(g.owned[p.id],c,p.n,'みつけた '+(g.found[p.sid]||0)+'かい')});
  sec('きせかえ',wears,p=>{const c=mk(90,90),x=c.getContext('2d');x.translate(45,86);x.scale(1.45,1.45);drawPerson(x,lookWith({[p.slot]:p.id}));return card(g.owned[p.id],c,p.n,RARITY[p.r].name)});
  sec('ひみつの カギ',STAGES.filter(s=>s.secret),s=>{const c=prizeImage({kind:'key'});c.style.width='90px';c.style.height='90px';return card(g.keys.includes(s.id),c,s.name)});
  $('zukan').hidden=false;
}
$('closetClose').onclick=()=>{$('closet').hidden=true;if($('gacha').hidden&&G.state==='title')showTitle()};
$('zukanClose').onclick=()=>{$('zukan').hidden=true};
$('titleGacha').onclick=()=>{$('title').hidden=true;openGacha(null)};
$('titleCloset').onclick=()=>{openCloset()};
$('titleZukan').onclick=()=>{openZukan()};

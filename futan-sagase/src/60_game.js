// ================= game flow =================
const G={state:'title',si:0,t:0,hints:0,subs:{},lastHintReady:false};
let PROG=load('fs_prog',{stages:{},next:0,max:-1});if(!PROG.round)PROG.round=1;
// difficulty: the first lap starts gentle and ramps up; every later lap is busier and trickier
function diffFor(i){const k=i/(STAGES.length-1),r=PROG.round;
  if(r<=1)return{people:.8+.2*k,decoys:.4+.6*k,hide:-.25+.25*k,assist:true};
  if(r===2)return{people:1.1,decoys:1.6,hide:.2,assist:false};
  return{people:1.2,decoys:2.2,hide:.35,assist:false}}
const roundName=r=>r<=1?'':r===2?'2しゅうめ':r+'しゅうめ';
const SUBS=[['mama','まま'],['papa','パパ'],['ricky','リッキー']];
function saveProg(){save('fs_prog',PROG)}
function stageRec(id){return PROG.stages[id]||(PROG.stages[id]={clear:0,subs:{},best:0,photo:null})}

function portraitOf(who,size){const c=mk(size,size*1.15),x=c.getContext('2d');const s=size/60;x.translate(size/2,size*1.1);x.scale(s,s);
  if(who==='ricky'){x.translate(0,14);drawRicky(x,1.2,{happy:true})}else drawPerson(x,who==='futan'?LOOK_FUTAN:who==='mama'?LOOK_MAMA:LOOK_PAPA);return c}
function headOf(who,cv2){const x=cv2.getContext('2d'),S=cv2.width;x.clearRect(0,0,S,S);x.save();
  if(who==='ricky'){x.translate(S/2,S*.86);x.scale(S/42,S/42);x.translate(0,14);drawRicky(x,1.2,{happy:true})}
  else{const o=who==='futan'?LOOK_FUTAN:who==='mama'?LOOK_MAMA:LOOK_PAPA,B=BODY[o.age];x.translate(S/2,S*.62);const k=S/34;x.scale(k,k);x.translate(0,-B.hy);drawPerson(x,Object.assign({},o,{s:1}))}
  x.restore()}

function startStage(i){
  G.si=i;const st=STAGES[i];clearBubbles();
  G.diff=diffFor(i);W=buildWorld(st,(Math.random()*4294967296)>>>0,G.diff);G.assistT=0;G.autoHint=false;
  cam.anim=null;cam.z=zMin();cam.x=(WW-VW/cam.z)/2;cam.y=(WH-VH/cam.z)/2;clampCam();
  G.state='intro';G.t=0;G.hints=0;G.subs={};G.lastHintReady=false;
  $('introNum').textContent='ステージ '+(i+1)+' / '+STAGES.length+(PROG.round>1?'　★'+roundName(PROG.round):'');$('introName').textContent=st.name;$('introText').textContent=st.intro;
  const ic=$('introPic'),ix=ic.getContext('2d');ix.drawImage(snapshot(600,400),0,0);
  $('title').hidden=true;$('album').hidden=true;$('clear').hidden=true;$('pause').hidden=true;$('hud').hidden=true;$('intro').hidden=false;
  $('hudStage').textContent=(i+1)+'. '+st.name;
  headOf('futan',$('hudFutan'));renderSlots();bgmStart(st);
}
function go(){
  audio();$('intro').hidden=true;$('hud').hidden=false;G.state='play';G.t=0;
  toast('ふーたんを さがせ！');say('ふーたんは どこかな？');updateHintBtn();
}
function renderSlots(){
  const el=$('slots');el.innerHTML='';
  for(const[k,n]of SUBS){const d=document.createElement('div');d.className='slot'+(G.subs[k]?' got':'');d.id='slot_'+k;const c=mk(80,80);headOf(k,c);
    if(!G.subs[k]){const x=c.getContext('2d');x.globalCompositeOperation='source-in';x.fillStyle='#d8c8b4';x.fillRect(0,0,80,80)}
    d.appendChild(c);const s=document.createElement('span');s.textContent=G.subs[k]?n:'？';d.appendChild(s);el.appendChild(d)}
}
function onTap(sx,sy){
  if(G.state!=='play'&&G.state!=='hunt')return;
  const p=toWorld(sx,sy),it=pickAt(p.x,p.y);
  if(!it){addFx({k:'ring',x:p.x,y:p.y,r:6,grow:18,d:.4,col:'#fff',w:3});return}
  if(it.kind==='futan'&&G.state==='play')return foundFutan(it);
  if((it.kind==='mama'||it.kind==='papa'||it.kind==='ricky')&&!G.subs[it.kind])return foundSub(it);
  react(it);
}
function pickAt(x,y){
  const tol=12/cam.z;let best=null,bestSpecial=null;
  for(const it of W.items){if(!it.hit)continue;
    const hx=it.kind==='ricky'?it.x:it.x,top=it.kind==='ricky'?it.y-62:it.y-it.hit.hh,bot=it.kind==='ricky'?it.y-18:it.y+3;
    if(x<hx-it.hit.hw-tol||x>hx+it.hit.hw+tol||y<top-tol||y>bot+tol)continue;
    if((it.kind==='futan'&&G.state==='play')||((it.kind==='mama'||it.kind==='papa'||it.kind==='ricky')&&!G.subs[it.kind])){if(!bestSpecial||it.kind==='futan')bestSpecial=it}
    const inside=x>=hx-it.hit.hw&&x<=hx+it.hit.hw&&y>=top&&y<=bot;
    if(inside&&(!best||it.y>best.y))best=it}
  return bestSpecial||best;
}
const LINES={kid:['ちがうよ〜','ぼく ふーたんじゃ ないよ','わたし ふーたんじゃ ないよ〜','くすぐったい！','やっほー！','なあに？','いっしょに さがそ！'],
  adult:['ざんねん！','ふーたんちゃん？ みてないなあ','こんにちは！','がんばってね！','おや？','ちがう ちがう'],
  elder:['ほっほっほ','おやまあ','ふーたんちゃんは げんきな こじゃのう','ちがうのう']};
function react(it){
  it.hop=1;
  if(it.kind==='animal'){({cat:SFX.meow,dog:SFX.bark,bird:SFX.tweet,duck:SFX.quack,fish:SFX.splash}[it.k]||SFX.pop)();bubble(it,{cat:'ニャー',dog:'ワン！',bird:'ピピッ',duck:'ガーガー',fish:'ぷくぷく',crab:'チョキチョキ',penguin:'ペタペタ',rabbit:'ぴょん',monkey:'ウキー！'}[it.k]||'！',1.2);return}
  if(it.kind==='futan'){bubble(it,'えへへ',1.2);return}
  if(it.kind==='mama'){bubble(it,'ふーたん、みつかった？',1.6);return}
  if(it.kind==='papa'){bubble(it,'パパは ここだよ〜',1.6);return}
  if(it.kind==='ricky'){it.hop=1;bubble(it,'きゃっきゃっ',1.2);return}
  const pool=LINES[it.look.age]||LINES.adult,extra=W.st.lines||[];
  bubble(it,chance(.25)&&extra.length?pick(extra):pick(pool),1.6);SFX.boing();
}
function foundFutan(it){
  G.state='found';const t=G.t;
  it.frozen=true;it.liveLook=Object.assign({},it.look,{happy:true,pose:'cheer'});it.scale=1.5;it.hop=1;
  SFX.found();bgmStop();
  lookAt(it.x,it.y-30,Math.max(2,zMin()*2.5),1);
  setTimeout(()=>{bubble(it,'みーつけた！',3,true);say('みーつけた！');burst(it.x,it.y-30,40,['#ff6f9f','#f6c63a','#7cc8ec','#7fd6b4','#fff'],200);addFx({k:'ring',x:it.x,y:it.y-25,r:20,grow:70,d:.9,col:'#ff6f9f',w:6})},700);
  const rec=stageRec(W.st.id);rec.clear++;if(!rec.best||t<rec.best)rec.best=t;PROG.max=Math.max(PROG.max,G.si);PROG.next=(G.si+1)%STAGES.length;if(G.si===STAGES.length-1){PROG.round++;G.lapDone=true}else G.lapDone=false;saveProg();
  G.foundAt=t;setTimeout(showClear,2700);
}
function foundSub(it){
  const k=it.kind;G.subs[k]=true;const rec=stageRec(W.st.id);rec.subs[k]=1;saveProg();
  renderSlots();const sl=$('slot_'+k);if(sl)sl.classList.add('pop');
  it.hop=1;SFX.chime();addFx({k:'ring',x:it.x,y:it.y-30,r:14,grow:50,d:.7,col:'#ffb347',w:5});
  if(k==='mama'){bubble(it,'ふーたんなら あっちで みたわよ！',3.5,true);say('ふーたんなら、あっちで みたわよ');addFx({k:'arrow',x:it.x,y:it.y,d:7});toast('まま みっけ！<br><span style="font-size:.5em">ハートの ほうに いるかも</span>')}
  if(k==='papa'){bubble(it,'はい、チーズ！',2.5,true);say('はい、チーズ');setTimeout(()=>{SFX.shutter();addFx({k:'flash',d:.6});rec.photo=photoOfView();saveProg()},500);toast('パパ みっけ！<br><span style="font-size:.5em">しゃしんを とったよ</span>')}
  if(k==='ricky'){it.happy=true;bubble(it,'リッキーの まほう〜！',3,true);say('リッキーの まほう！');SFX.magic();magicFx(W.st.magic,7);
    if(W.st.magic==='fireworks')W.fx[W.fx.length-1].sound=true;
    for(const m of W.items)if(m.kind==='mob'||m.kind==='animal'){const d=Math.hypot(m.x-it.x,m.y-it.y);setTimeout(()=>{m.hop=1},d*1.2)}
    toast('リッキー みっけ！<br><span style="font-size:.5em">まほうで まちが おおさわぎ</span>')}
  if(G.state==='hunt'&&SUBS.every(([s])=>G.subs[s]))setTimeout(()=>{toast('みんな みつけた！');setTimeout(showClear,1600)},1800);
}
function photoOfView(){const c=mk(300,200),x=c.getContext('2d'),v=viewRect(),z=Math.max(300/v.w,200/v.h);renderWorld(x,NOW,v.x+(v.w-300/z)/2,v.y+(v.h-200/z)/2,z,300/z,200/z);try{return c.toDataURL('image/jpeg',.72)}catch(e){return null}}
function fmtT(t){const m=Math.floor(t/60),s=Math.floor(t%60);return m+':'+String(s).padStart(2,'0')}
function showClear(){
  G.state='clear';$('hud').hidden=true;const st=W.st,rec=stageRec(st.id),last=G.si===STAGES.length-1;
  const got=SUBS.filter(([k])=>G.subs[k]).length;
  let h=`<h2>みーつけた！</h2><div class="cast" id="clearCast"></div><p class="lede">${st.name}で ふーたんを みつけたよ<br>タイム ${fmtT(G.foundAt)}${G.hints?'':'　ヒントなし！'}</p>`;
  h+=`<div class="got-row">${SUBS.map(([k,n])=>`<span class="${G.subs[k]?'on':''}">${G.subs[k]?'★':'☆'} ${n}</span>`).join('')}</div>`;
  if(rec.photo)h+=`<img src="${rec.photo}" alt="パパの しゃしん" style="width:100%;border-radius:16px;border:2.5px solid var(--line)">`;
  if(last&&G.lapDone)h+=`<p class="lede" style="color:var(--accent)">ぜんぶの ばしょを まわったよ！ すごい！<br>つぎは ${roundName(PROG.round)}。ひとが ふえて もっと むずかしく なるよ</p>`;
  h+=`<button class="btn main" id="nextBtn">${last?'さいしょの ばしょへ':'つぎの ばしょへ'} ▶</button>`;
  if(got<3)h+=`<button class="btn" id="huntBtn">まま・パパ・リッキーも さがす</button>`;
  h+=`<div class="links"><button class="link" id="clearAlbum">ステージ えらび</button></div>`;
  $('clearPanel').innerHTML=h;
  const cc=$('clearCast');for(const k of['futan','mama','papa','ricky']){const f=document.createElement('figure');const c=portraitOf(k,72);if(k!=='futan'&&!G.subs[k]){const x=c.getContext('2d');x.globalCompositeOperation='source-in';x.fillStyle='#cdbba4';x.fillRect(0,0,c.width,c.height)}f.appendChild(c);cc.appendChild(f)}
  $('clear').hidden=false;
  $('nextBtn').onclick=()=>nextStage();
  const hb=$('huntBtn');if(hb)hb.onclick=()=>{$('clear').hidden=true;$('hud').hidden=false;G.state='hunt';const f=W.fam.futan;f.liveLook=null;f.frozen=true;bgmStart();toast('なかまを さがそう！');say('まま、パパ、リッキーも さがしてね');updateHintBtn()};
  $('clearAlbum').onclick=openAlbum;
}
function nextStage(){$('clear').hidden=true;$('hud').hidden=true;const f=W.fam.futan,p=toScreen(f.x,f.y-30);wipe(p.x,p.y,()=>startStage((G.si+1)%STAGES.length))}
// iris wipe between stages
const wc=$('wipe'),wx=wc.getContext('2d');let WIPE=null;
function wipe(cx,cy,mid){SFX.whoosh();WIPE={cx,cy,t:0,mid,done:false}}
function stepWipe(dt){
  if(!WIPE){wc.style.display='none';return}wc.style.display='block';
  if(wc.width!==VW*DPR){wc.width=VW*DPR;wc.height=VH*DPR}
  const w=WIPE;w.t+=dt;const big=Math.hypot(VW,VH);let r;
  if(w.t<.7)r=big*(1-w.t/.7);else{if(!w.done){w.done=true;w.mid();w.cx=VW/2;w.cy=VH/2}r=w.t<.95?0:big*Math.min(1,(w.t-.95)/.7)}
  wx.setTransform(DPR,0,0,DPR,0,0);wx.clearRect(0,0,VW,VH);wx.fillStyle='#ffe3ee';wx.beginPath();wx.rect(0,0,VW,VH);wx.arc(w.cx,w.cy,Math.max(0,r),0,TAU,true);wx.fill();
  if(r<big*.4){wx.save();wx.translate(VW/2,VH/2);wx.globalAlpha=1-r/(big*.4);const s=Math.min(VW,VH)/260;wx.scale(s,s);drawPerson(wx,Object.assign({},LOOK_FUTAN,{happy:true,pose:'cheer'}));wx.restore()}
  if(w.t>1.65)WIPE=null;
}
function useHint(){
  if(G.state!=='play'&&G.state!=='hunt')return;
  let T=W.fam.futan;if(G.state==='hunt'){const k=SUBS.map(s=>s[0]).find(k=>!G.subs[k]);T=W.fam[k]}
  const r=[320,190,110][Math.min(G.hints,2)];G.hints++;
  const a=rnd(TAU),d=rnd(r*.45),cx=T.x+Math.cos(a)*d,cy=T.y-25+Math.sin(a)*d;
  addFx({k:'hint',x:cx,y:cy,r,d:7});SFX.hint();say('この あたりに いるよ');
  lookAt(cx,cy,Math.min(VW,VH)/(r*2.5),.9);G.lastHint=G.t;updateHintBtn();
}
function updateHintBtn(){const b=$('hintBtn');const ready=G.t-(G.lastHint||0)>25;b.classList.toggle('ready',ready&&(G.state==='play'||G.state==='hunt'));b.textContent=G.state==='hunt'?'ヒント':'ヒント'}
function openAlbum(){
  const el=$('stageList');el.innerHTML='';
  STAGES.forEach((st,i)=>{const rec=PROG.stages[st.id],open=i<=PROG.max+1;
    const d=document.createElement('button');d.className='st'+(open?'':' lock');
    const c=mk(240,160);if(rec&&rec.photo){const im=new Image();im.onload=()=>c.getContext('2d').drawImage(im,0,0,240,160);im.src=rec.photo}else stageThumb(st,c);
    d.appendChild(c);const n=document.createElement('span');n.className='num';n.textContent=i+1;d.appendChild(n);
    const t=document.createElement('div');t.textContent=open?st.name:'？？？';d.appendChild(t);
    const s=document.createElement('div');s.className='got-row';s.innerHTML=['futan','mama','papa','ricky'].map(k=>{const on=k==='futan'?rec&&rec.clear:rec&&rec.subs[k];return `<span class="${on?'on':''}">${{futan:'ふ',mama:'ま',papa:'パ',ricky:'リ'}[k]}</span>`}).join('');d.appendChild(s);
    if(open)d.onclick=()=>{$('album').hidden=true;audio();startStage(i)};el.appendChild(d)});
  $('album').hidden=false;
}
function stageThumb(st,c){const x=c.getContext('2d'),w={st};R=rng(3);if(st.geo)st.geo(w);x.scale(c.width/WW,c.height/WH);ink(x);st.bg(x,w)}
function showTitle(){
  G.state='title';$('hud').hidden=true;$('intro').hidden=true;$('clear').hidden=true;$('pause').hidden=true;$('title').hidden=false;clearBubbles();
  if(!W){W=buildWorld(STAGES[Math.floor(Math.random()*STAGES.length)],(Math.random()*1e9)>>>0);cam.z=zMin()*1.6;cam.x=WW/2-VW/2/cam.z;cam.y=WH/2-VH/2/cam.z;clampCam()}
  const cc=$('cast');if(!cc.children.length)for(const[k,n]of[['futan','ふーたん'],['mama','まま'],['papa','パパ'],['ricky','リッキー']]){const f=document.createElement('figure');f.appendChild(portraitOf(k,84));const cap=document.createElement('figcaption');cap.textContent=n;f.appendChild(cap);cc.appendChild(f)}
  $('playBtn').textContent=PROG.max>=0?'つづきから（'+(PROG.round>1?roundName(PROG.round)+' ':'')+'ステージ '+(PROG.next+1)+'）':'あそぶ';
  const recs=Object.values(PROG.stages),cl=recs.filter(r=>r.clear).length,subs=recs.reduce((n,r)=>n+Object.keys(r.subs||{}).length,0);
  $('titleStats').innerHTML=PROG.max>=0?`<span>クリア ${cl} / ${STAGES.length}</span><span>みつけた なかま ${subs} / ${STAGES.length*3}</span><span>しゃしん ${recs.filter(r=>r.photo).length}まい</span>`:'';
}
function pauseGame(){if(G.state!=='play'&&G.state!=='hunt')return;G.paused=G.state;G.state='paused';$('pause').hidden=false;bgmStop()}
function resumeGame(){if(G.state!=='paused')return;G.state=G.paused;$('pause').hidden=true;bgmStart()}

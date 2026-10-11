// ================= とくべつルール と ボスステージ =================
const RULES={
  normal:{n:'',d:''},
  move:{n:'ふーたんが あるきまわる！',d:'ふーたんが まちを とことこ あるいているよ。うごく ふーたんを つかまえよう'},
  time:{n:'タイムアタック',d:'60びょう いないに みつけると ガチャが +1かい！'},
  dark:{n:'くらやみ たんけん',d:'まっくらな まち。かいちゅうでんとうで てらした ところだけ みえるよ'},
  otoshimono:{n:'おとしもの さがし',d:'ふーたんの おとしもの 3つを あつめてから ふーたんを さがそう'},
  boss:{n:'ボス：かいとう クロニャン',d:'クロニャンが にせものの ふーたんを いっぱい つくったよ。ハートの ポシェットの ほんものを 3かい みつけて やっつけよう！'}
};
// 1しゅうめは さいしょの 2つは ふつう。そのあとは いろいろな ルールが まわってくる
const RULE_ORDER=['normal','normal','move','time','normal','dark','otoshimono','normal','move','dark','time','otoshimono','normal'];
function ruleFor(i){const st=STAGES[i];if(st.boss)return 'boss';if(st.secret)return 'normal';const r=PROG.round;return RULE_ORDER[(i+(r-1)*5)%RULE_ORDER.length]}
// 4つ クリアするごとに ボス
function bossDue(i){return !STAGES[i].secret&&!STAGES[i].boss&&(i+1)%4===0}

// ---- かいとう クロニャン ----
function drawKuro(c,t,mood){c.save();ink(c,2.4);c.translate(0,-52+Math.sin(t*2)*3);const K='#3a3050';
  c.fillStyle='#4a2a6a';c.beginPath();c.moveTo(-6,-10);c.quadraticCurveTo(-46,20+Math.sin(t*4)*6,-30,52);c.lineTo(30,52);c.quadraticCurveTo(46,20+Math.sin(t*4+1)*6,6,-10);c.closePath();c.fill();c.stroke();
  ell(c,0,24,18,24);FS(c,K);poly(c,[[-6,4],[0,14],[6,4]]);F(c,'#fff');
  circ(c,0,-14,20);FS(c,K);for(const sd of[-1,1]){poly(c,[[sd*16,-24],[sd*18,-44],[sd*4,-32]]);FS(c,K);poly(c,[[sd*14,-27],[sd*16,-38],[sd*8,-31]]);F(c,'#ff8cb0')}
  if(mood!=='sad'){c.beginPath();c.moveTo(-22,-18);c.quadraticCurveTo(0,-26,22,-18);c.lineTo(20,-8);c.quadraticCurveTo(0,-14,-20,-8);c.closePath();FS(c,'#fff');for(const sd of[-1,1]){ell(c,sd*9,-14,4.2,3.4);F(c,'#ffd23a');ell(c,sd*9,-14,1.4,3);F(c,'#1a1026')}}
  else{c.lineWidth=2.2;for(const sd of[-1,1]){c.beginPath();c.arc(sd*8,-12,4,Math.PI*1.1,Math.PI*1.9);c.stroke()}ell(c,-12,-4,2,3);F(c,'#8ad8ff');ink(c,2.4)}
  c.lineWidth=2;c.beginPath();if(mood==='sad')c.arc(0,-2,5,Math.PI*1.2,Math.PI*1.8);else{c.moveTo(-6,-4);c.quadraticCurveTo(0,1,7,-5)}c.stroke();
  c.strokeStyle='#ddd';c.lineWidth=1;for(const sd of[-1,1])for(const d of[-2,2])line(c,sd*12,-4+d,sd*26,-5+d*1.6);ink(c,2.4);
  ell(c,0,-36,24,5);F(c,'#1a1026');rr(c,-13,-60,26,26,4);F(c,'#1a1026');c.fillStyle='#ff4d6d';c.fillRect(-13,-40,26,4);
  c.strokeStyle=K;c.lineWidth=5;c.beginPath();c.moveTo(14,40);c.quadraticCurveTo(40,34,36,10+Math.sin(t*3)*6);c.stroke();c.restore()}

// ボスの アジト
Object.assign(PROPS,{
  catstatue:[70,130,(c,o)=>{rr(c,-26,-30,52,30,4);FS(c,'#8a7aa8');ell(c,0,-62,22,30);FS(c,'#5a4a7a');circ(c,0,-100,16);FS(c,'#5a4a7a');for(const s of[-1,1]){poly(c,[[s*6,-112],[s*14,-126],[s*15,-106]]);FS(c,'#5a4a7a')}circ(c,-6,-101,2.4);F(c,'#ffd23a');circ(c,6,-101,2.4);F(c,'#ffd23a')}],
  cage:[70,90,(c,o)=>{rr(c,-30,-80,60,80,6);c.stroke();for(let i=0;i<6;i++)line(c,-26+i*10.4,-78,-26+i*10.4,-2);rr(c,-34,-86,68,8,3);FS(c,'#c7ccd4');rr(c,-34,-6,68,8,3);FS(c,'#c7ccd4')}],
  treasure:[80,60,(c,o)=>{for(let i=0;i<10;i++){circ(c,-26+(i%5)*13,-6-Math.floor(i/5)*9,6);FS(c,'#f6c63a')}rr(c,-30,-36,60,22,4);FS(c,'#a8703f');star(c,0,-46,9,4);FS(c,'#ff8cc0')}],
});
STAGES.push({id:'ajito',boss:true,name:'クロニャンの アジト',intro:'かいとう クロニャンの ひみつきち！ にせものの ふーたんが いっぱい…？',
  music:{tempo:132,scale:'minor',wave:'square',seed:181,root:440,beat:1200},people:190,decoys:6,walkers:.12,
  walk(x,y){if(y<380)return null;return 'land'},
  bg(c,w){grad(c,0,400,['#1c1030','#3a1f52']);c.fillStyle='#6a1f3a';for(let i=0;i<10;i++){c.beginPath();c.moveTo(i*260,0);c.quadraticCurveTo(i*260+130,160,i*260+260,0);c.fill()}
    ink(c,4);c.fillStyle='#2a1840';c.fillRect(800,140,800,260);c.strokeRect(800,140,800,260);c.fillStyle='#ffd23a';c.font='900 40px sans-serif';c.textAlign='center';c.fillText('KURO NYAN',1200,240);
    for(let i=0;i<WW/100;i++)for(let j=0;j<12;j++){c.fillStyle=(i+j)%2?'#4a3060':'#3c2652';c.fillRect(i*100,390+j*100,100,100)}
    c.fillStyle='rgba(255,210,58,.12)';for(let i=0;i<5;i++){poly(c,[[400+i*400,0],[460+i*400,0],[560+i*400,1600],[300+i*400,1600]]);c.fill()}ink(c)},
  layout(L,w){scatter(L,w,'catstatue',8,[60,440,2340,1580],{},300);scatter(L,w,'cage',6,[60,440,2340,1580],{},260);scatter(L,w,'treasure',6,[60,440,2340,1580],{},260);scatter(L,w,'barrel',10,[60,440,2340,1580],{},180)},
  look(){return mobLook({tops:[['robe',1],['shirt',2],['ninja',1]],hats:[['nekomimi',2],[null,2],['witch',.6]],fix:o=>{if(o.top==='ninja')o.legCol=o.topCol;if(o.hat==='nekomimi')o.hatCol=pick(['#3b3533','#5a4a7a','#f7f4ee'])}})},
  animals:[['cat',16]],hide:{p:.4,props:['barrel','treasure']},lines:['ニャー！','クロニャンさまの けらいだニャ'],
  party:{fx:['stars','confetti'],text:'クロニャンの アジトが おまつりに！'}
});

// ---- ルールの じゅんび（startStage の あとに よぶ） ----
function setupRule(){
  const r=G.rule,F=W.fam.futan;W.ruleItems=[];G.timeLeft=0;G.timeOk=false;G.items=0;G.bossHP=0;
  if(r==='move'){F.walk={tx:F.x,ty:F.y,wait:1,sp:16};for(const it of W.items)if(it.kind==='mob'&&!it.walk&&chance(.25))it.walk={tx:it.x,ty:it.y,wait:rnd(3),sp:rnd(12,20)}}
  if(r==='time'){G.timeLeft=PROG.round>1?50:60;G.timeOk=true}
  if(r==='otoshimono'){const kinds=[['bear','くまの ぬいぐるみ'],['shoe','あかい くつ'],['candy','ぺろぺろキャンディ']];
    for(const[k,n]of kinds){const s=W.spot('land',12,300);if(!s)continue;W.items.push({kind:'item',ik:k,n,x:s.x,y:s.y,spr:makeSprite('it_'+k,30,30,c=>drawLostItem(c,k)),hit:{hw:13,hh:26},ph:0,hop:0})}}
  if(r==='boss'){G.bossHP=3;W.boss={x:1200,y:410,mood:'',hit:{hh:300}};makeFakes(4)}
  renderRule();
}
function drawLostItem(c,k){ink(c,1.6);
  if(k==='bear'){for(const s of[-1,1]){circ(c,s*7,-22,4);FS(c,'#c48a5a')}ell(c,0,-8,9,8);FS(c,'#c48a5a');circ(c,0,-18,8);FS(c,'#c48a5a');circ(c,-3,-19,1.2);F(c,LN);circ(c,3,-19,1.2);F(c,LN);ell(c,0,-15,3,2);F(c,'#f3d0a8');heart(c,0,-8,3);F(c,'#ff6f9f')}
  if(k==='shoe'){c.beginPath();c.moveTo(-12,-2);c.lineTo(-12,-12);c.quadraticCurveTo(-4,-16,2,-10);c.quadraticCurveTo(12,-8,13,-2);c.closePath();FS(c,'#e8483a');rr(c,-13,-3,27,4,2);FS(c,'#fff')}
  if(k==='candy'){c.lineWidth=2;line(c,0,0,0,-14);ink(c,1.6);circ(c,0,-20,8);FS(c,'#ff8cc0');c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();c.arc(0,-20,4.5,0,5);c.stroke();ink(c,1.6)}}
// にせものの ふーたん: ほしの ポシェットと ねこの しっぽ
function makeFakes(n){W.items=W.items.filter(i=>i.kind!=='fake');const base=W.fam.futan.look;
  for(let i=0;i<n;i++){const s=W.spot('land',14,300);if(!s)continue;const o=JSON.parse(JSON.stringify(base));o.acc=Object.assign({},o.acc);delete o.acc.pochette;o.acc.starPochette='#ffd23f';o.acc.tail='#3b3533';
    W.items.push({kind:'fake',look:o,x:s.x,y:s.y,spr:personSprite(o),hit:personHit(o),ph:rnd(6.28),hop:0,flip:chance(.5)})}}
function moveFutan(){const F=W.fam.futan;const mobs=W.items.filter(i=>i.kind==='mob'&&Math.hypot(i.x-F.x,i.y-F.y)>500);if(!mobs.length)return;const m=pick(mobs);const x=F.x,y=F.y;F.x=m.x;F.y=m.y;m.x=x;m.y=y}
function ruleTap(it){
  if(G.rule==='otoshimono'){
    if(it.kind==='item'&&!it.got){it.got=true;G.items++;it.hop=1;SFX.chime();burst(it.x,it.y-10,16,['#ffd23f','#ff8cc0','#fff'],100);W.items=W.items.filter(i=>i!==it);toast(it.n+' みっけ！ <span style="font-size:.5em">'+G.items+' / 3</span>');
      if(G.items>=3){setTimeout(()=>toast('ぜんぶ あつめた！<br><span style="font-size:.5em">ふーたんを さがそう</span>'),1400)}renderRule();return true}
    if(it.kind==='futan'&&G.items<3){it.hop=1;bubble(it,'わたしの おとしもの さがして〜',2);return true}}
  if(G.rule==='boss'){
    if(it.kind==='fake'){SFX.boing();burst(it.x,it.y-20,14,['#8d5cc8','#3b3533','#fff'],90);bubble(W.boss,'ニャハハ！ にせものニャ！',1.8);W.items=W.items.filter(i=>i!==it);return true}
    if(it.kind==='futan'&&G.bossHP>1){G.bossHP--;it.hop=1;SFX.found();burst(it.x,it.y-30,26,['#ff6f9f','#f6c63a','#fff'],160);W.boss.mood='angry';
      bubble(it,'たすけて〜！',1.4,true);setTimeout(()=>{bubble(W.boss,['ニャニャ！ まだまだニャ！','ぐぬぬ… つぎは どうかニャ？'][2-G.bossHP]||'ニャー！',2.2,true);addFx({k:'flash',d:.5});SFX.whoosh();moveFutan();makeFakes(4+(3-G.bossHP)*3);lookAt(WW/2,WH/2,zMin(),.6);renderRule()},900);renderRule();return true}
    if(it.kind==='futan'&&G.bossHP===1){G.bossHP=0;W.boss.mood='sad';G.boss=true;setTimeout(()=>{bubble(W.boss,'おぼえてろニャ〜〜！',2.4,true);W.boss.flee=NOW},300);renderRule();return false}}
  return false;
}
function renderRule(){const el=$('rulebar');const r=RULES[G.rule]||RULES.normal;if(!r.n){el.hidden=true;return}el.hidden=false;let s='<b>'+r.n+'</b>';
  if(G.rule==='time')s+=` <span class="${G.timeLeft<=10?'warn':''}">のこり ${Math.ceil(G.timeLeft)}びょう</span>`;
  if(G.rule==='otoshimono')s+=' <span>'+['bear','shoe','candy'].map((k,i)=>i<G.items?'●':'○').join('')+' '+G.items+'/3</span>';
  if(G.rule==='boss')s+=' <span>クロニャン '+'❤'.repeat(G.bossHP)+'♡'.repeat(3-G.bossHP)+'</span>';
  el.innerHTML=s}
function stepRule(dt){
  if(G.rule==='time'&&G.state==='play'&&G.timeOk){const b=Math.ceil(G.timeLeft);G.timeLeft-=dt;if(Math.ceil(G.timeLeft)!==b){renderRule();if(G.timeLeft<=10&&G.timeLeft>0)tone(990,0,.06,'square',.03)}
    if(G.timeLeft<=0){G.timeOk=false;G.timeLeft=0;toast('じかん ぎれ〜<br><span style="font-size:.5em">でも さがしつづけよう！</span>');renderRule()}}
}
// くらやみ: かいちゅうでんとうの あかり（がめんの まんなかと、さいごに さわった ところ）
const darkCv=document.createElement('canvas'),darkX=darkCv.getContext('2d');let lastTouch=null;
function drawDark(c){
  if(G.rule!=='dark'||!(G.state==='play'||G.state==='paused'))return;
  if(darkCv.width!==cv.width||darkCv.height!==cv.height){darkCv.width=cv.width;darkCv.height=cv.height}
  const x=darkX,D=DPR;x.globalCompositeOperation='source-over';x.fillStyle='rgba(8,8,24,.94)';x.fillRect(0,0,darkCv.width,darkCv.height);x.globalCompositeOperation='destination-out';
  const hole=(sx,sy,r)=>{const g=x.createRadialGradient(sx*D,sy*D,r*D*.55,sx*D,sy*D,r*D);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect((sx-r)*D,(sy-r)*D,2*r*D,2*r*D)};
  const R0=Math.min(VW,VH)*.28;hole(VW/2,VH/2,R0);if(lastTouch&&NOW-lastTouch.t<2.5)hole(lastTouch.x,lastTouch.y,R0*.7*(1-(NOW-lastTouch.t)/2.5)+20);
  x.globalCompositeOperation='source-over';c.setTransform(1,0,0,1,0,0);c.drawImage(darkCv,0,0);
  c.setTransform(DPR,0,0,DPR,0,0);c.strokeStyle='rgba(255,240,180,.5)';c.lineWidth=3;circ(c,VW/2,VH/2,R0*.78);c.stroke();
}
function drawBoss(c,t){const b=W&&W.boss;if(!b)return;let y=b.y,x=b.x;if(b.flee){const k=NOW-b.flee;y-=k*k*400;x+=k*300;if(k>3){W.boss=null;return}}
  c.save();c.translate(x,y+Math.sin(t*2)*6);c.scale(3.4,3.4);drawKuro(c,t,b.mood==='sad'?'sad':'');c.restore()}

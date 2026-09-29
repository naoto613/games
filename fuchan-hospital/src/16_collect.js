// ================= やりこみ: かんじゃさん ずかん・キラキラ・きょうの おねがい・スタンプ・メダル =================
SAVE.zk=SAVE.zk||{};SAVE.sh=SAVE.sh||[];SAVE.stamps=SAVE.stamps||0;SAVE.medals=SAVE.medals||[];if(SAVE.daily===undefined)SAVE.daily=null;
RANKS.push([1200,'ほしの ドクター','star doctor'],[1800,'にじの いんちょう','rainbow director'],[2600,'せかいいち ドクター','best doctor in the world']);
const ZK=Object.keys(AN);
const GAMEIDS=()=>ROOMS.filter(r=>r.id!=='dress').map(r=>r.id);
const totPlays=()=>Object.values(SAVE.plays).reduce((a,b)=>a+b,0);
const zkN=()=>ZK.filter(k=>SAVE.zk[k]).length;
let PT_PLAY=[];
// あたらしい かんじゃさんは ときどき キラキラ（めずらしい）
{const _np=newPatient;newPatient=function(pool){const P=_np(pool);if(scene&&scene!==SCN.lobby&&scene!==SCN.title){P.shiny=scene!==SCN.reception&&Math.random()<.08;PT_PLAY.push(P);}return P;};}
{const _dp=drawPt;drawPt=function(c,P,x,y,s,st={}){_dp(c,P,x,y,s,P.shiny?Object.assign({shiny:1},st):st);};}
{const _gp=greetPt;greetPt=function(P,text){_gp(P,text);if(P.shiny&&!P.shinySaid){P.shinySaid=1;sfx('spark');banner('キラキラ かんじゃさん！','#e8a000','めずらしい！ ずかんに のるよ');speak('わあ！ キラキラの めずらしい かんじゃさんだ！');}};}
{const _da=drawAnimal;drawAnimal=function(c,k,x,y,s,o){if(!o||!o.shiny)return _da(c,k,x,y,s,o);
  const cy=y-95*s,g=c.createRadialGradient(x,cy,10*s,x,cy,150*s);g.addColorStop(0,'rgba(255,236,140,.55)');g.addColorStop(1,'rgba(255,236,140,0)');c.fillStyle=g;circ(c,x,cy,150*s);
  c.save();c.shadowColor='#ffd23a';c.shadowBlur=22;_da(c,k,x,y,s,o);c.restore();
  for(let i=0;i<6;i++){const a=T*.8+i*TAU/6,r=(120+Math.sin(T*3+i)*14)*s,tw=.5+.5*Math.sin(T*6+i*2);c.fillStyle=`rgba(255,${200+tw*40|0},60,${.5+tw*.5})`;star(c,x+Math.cos(a)*r,cy+Math.sin(a)*r*.8,(6+tw*7)*s,(2.5+tw*2.5)*s,4);c.fill();}};}
// ---------- きょうの おねがい ----------
function todayKey(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();}
function dailyGet(){if(!SAVE.daily||SAVE.daily.d!==todayKey()){SAVE.daily={d:todayKey(),rooms:shuffle(GAMEIDS()).slice(0,3),done:[],stamped:0};save();}return SAVE.daily;}
// ---------- メダル（とると びょういんの そとに なにかが できる） ----------
const MEDALS=[
  ['first','はじめての おしごと','1かい あそぶ',()=>totPlays()>=1,'flowers','おはなばたけ'],
  ['p10','がんばりやさん','10かい あそぶ',()=>totPlays()>=10,'balloons','ふうせん'],
  ['p30','にんきの おいしゃさん','30かい あそぶ',()=>totPlays()>=30,'fountain','ふんすい'],
  ['p100','でんせつの おいしゃさん','100かい あそぶ',()=>totPlays()>=100,'statue','ふーちゃんの ぞう'],
  ['all1','びょういん たんけん','ぜんぶの へやで あそぶ',()=>GAMEIDS().every(i=>lvOf(i)>=1),'flags','はたかざり'],
  ['all3','びょういん マスター','ぜんぶの へやで 3かい あそぶ',()=>GAMEIDS().every(i=>lvOf(i)>=3),'rainbow','おおきな にじ'],
  ['zk5','ずかん はじめ','かんじゃさん 5しゅるい',()=>zkN()>=5,'trees','なみき'],
  ['zk10','ずかん はかせ','かんじゃさん 10しゅるい',()=>zkN()>=10,'bench','ベンチ'],
  ['zk16','ずかん コンプリート','かんじゃさん ぜんぶ',()=>zkN()>=ZK.length,'animals','どうぶつの ぞう'],
  ['sh1','キラキラ はっけん','キラキラ かんじゃさん 1ぴき',()=>SAVE.sh.length>=1,'sparkle','キラキラ かんばん'],
  ['sh5','キラキラ コレクター','キラキラ 5しゅるい',()=>SAVE.sh.length>=5,'lights','イルミネーション'],
  ['st1','はじめての スタンプ','きょうの おねがいを ぜんぶ クリア',()=>SAVE.stamps>=1,'busstop','バスてい'],
  ['st5','まいにち がんばる','スタンプ 5こ',()=>SAVE.stamps>=5,'clock','とけいとう'],
  ['st10','スタンプ いっぱい','スタンプ 10こ',()=>SAVE.stamps>=10,'playground','こうえんの あそびば'],
  ['rk3','ベテラン ドクター','ランク ベテラン ドクター',()=>rankIdx()>=3,'goldcross','きんいろの マーク'],
  ['rk5','いんちょう せんせい','ランク いんちょう せんせい',()=>rankIdx()>=5,'fireworks','はなび'],
  ['ward','おしゃれ めいじん','おようふく ぜんぶ あつめる',()=>WARD.every(owns),'carpet','レッドカーペット'],
];
const hasDeco=k=>MEDALS.some(m=>m[4]===k&&SAVE.medals.includes(m[0]));
function checkMedals(){for(const m of MEDALS)if(!SAVE.medals.includes(m[0])&&m[3]()){SAVE.medals.push(m[0]);note('メダル ゲット！',m[1],{medal:m},`メダル ゲット！ ${m[1]}。 びょういんの そとに ${m[5]}が できたよ！`);}}
// ---------- おしらせ（トースト） ----------
const NOTES=[];
function note(title,sub,o={},speech){NOTES.push(Object.assign({title,sub,t:0,speech:speech||`${title} ${sub}`},o));}
function updNotes(dt){if(!NOTES.length||cel||tr||(scene!==SCN.lobby&&scene!==SCN.town))return;const n=NOTES[0];if(n.t===0){sfx(n.medal?'hooray':'spark');hush();speak(n.speech);}n.t+=dt;if(n.t>3.4)NOTES.shift();}
function drawNotes(c){if(!NOTES.length||cel||tr||(scene!==SCN.lobby&&scene!==SCN.town))return;const n=NOTES[0];const k=Math.min(1,n.t*4,(3.4-n.t)*4);if(k<=0)return;
  c.save();c.globalAlpha=k;const y=H-160+(1-k)*60,w=W-80;panel(c,40,y-46,w,92,30,n.medal?'#fff8e0':'#fff',n.medal?'#ffd23a':'#ffb3d6',5);
  const ix=96;if(n.an)drawAnimal(c,n.an,ix,y+34,.3,{t:T,happy:1,shiny:n.shiny});else if(n.medal)drawMedal(c,ix,y,30,true,n.medal);else if(n.stamp)drawStamp(c,ix,y,30);else if(n.room){const r=ROOMS.find(q=>q.id===n.room);drawThing(c,r.icon,ix,y,.6);}
  txt(c,n.title,W/2+34,y-16,24,n.medal?'#c87a00':'#ff5fa2');txt(c,n.sub,W/2+34,y+18,19,'#6a5a8a');c.restore();}
// ---------- あそんだ あとに まとめて きろく ----------
{const _c=celebrate;celebrate=function(id,stars=3){if(cel)return;_c(id,stars);if(cel)collectAfter(id);};}
function collectAfter(id){const extra=id==='dentist'?[{k:'hippo'}]:id==='pet'&&scene.k?[{k:scene.k}]:[];const list=[...PT_PLAY,...extra];PT_PLAY=[];const nw=[];
  for(const P of list){if(!AN[P.k])continue;if(!SAVE.zk[P.k]&&!nw.includes(P.k))nw.push(P.k);SAVE.zk[P.k]=(SAVE.zk[P.k]||0)+1;
    if(P.shiny&&!SAVE.sh.includes(P.k)){SAVE.sh.push(P.k);note('キラキラ ずかんに とうろく！',`キラキラの ${WORDS[P.k][0]}`,{an:P.k,shiny:1});}}
  if(nw.length===1)note('ずかんに とうろく！',`${WORDS[nw[0]][0]}  ${WORDS[nw[0]][1]}`,{an:nw[0]},`ずかんに とうろく！ ${WORDS[nw[0]][0]}`);
  else if(nw.length>1)note('ずかんに とうろく！',`${nw.length}しゅるい ふえたよ （${zkN()}/${ZK.length}）`,{an:nw[0]});
  const D=dailyGet();if(D.rooms.includes(id)&&!D.done.includes(id)){D.done.push(id);
    if(D.done.length>=D.rooms.length&&!D.stamped){D.stamped=1;SAVE.stamps++;SAVE.hearts+=30;note('きょうの おねがい ぜんぶ クリア！','スタンプ ポン！  ハート +30',{stamp:1});}
    else note('おねがい クリア！',`${ROOMS.find(r=>r.id===id).name}  あと ${D.rooms.length-D.done.length}つ`,{room:id});}
  checkMedals();save();}
// ---------- え ----------
function drawMedal(c,x,y,r,on,m){c.save();c.translate(x,y);if(on){c.fillStyle='#ff5fa2';c.beginPath();c.moveTo(-r*.5,-r*.6);c.lineTo(-r*.8,-r*1.5);c.lineTo(-r*.2,-r*1.5);c.lineTo(0,-r*.7);c.fill();c.fillStyle='#5aa8ff';c.beginPath();c.moveTo(r*.5,-r*.6);c.lineTo(r*.8,-r*1.5);c.lineTo(r*.2,-r*1.5);c.lineTo(0,-r*.7);c.fill();}
  const g=c.createRadialGradient(-r*.3,-r*.3,r*.1,0,0,r);g.addColorStop(0,on?'#fff6c0':'#f0f0f4');g.addColorStop(1,on?'#e8a800':'#c8c8d4');c.fillStyle=g;circ(c,0,0,r);c.strokeStyle=on?'#c88400':'#b0b0c0';c.lineWidth=r*.1;c.beginPath();c.arc(0,0,r*.78,0,TAU);c.stroke();
  if(on){c.fillStyle='#fff';star(c,0,0,r*.5,r*.22);c.fill();c.fillStyle='rgba(255,255,255,.7)';ell(c,-r*.35,-r*.4,r*.2,r*.12);}else{c.fillStyle='#b0b0c0';rr(c,-r*.28,-r*.05,r*.56,r*.42,r*.08);c.fill();c.strokeStyle='#b0b0c0';c.lineWidth=r*.12;c.beginPath();c.arc(0,-r*.05,r*.2,Math.PI,TAU);c.stroke();}c.restore();}
function drawStamp(c,x,y,r,rot=-.2){c.save();c.translate(x,y);c.rotate(rot);c.strokeStyle='#ff4d6d';c.lineWidth=r*.12;c.beginPath();c.arc(0,0,r,0,TAU);c.stroke();c.fillStyle='rgba(255,77,109,.12)';circ(c,0,0,r);crossSign(c,0,-r*.2,r*.32,'#ff4d6d');txt(c,'よくできました',0,r*.52,r*.26,'#ff4d6d');c.restore();}
// ---------- ずかん・メダル・スタンプ の へや ----------
SCN.book={bg:'#fff8ee',song:'calm',hud:false,noRk:1,
  enter(){if(PREVSC&&PREVSC!==this)this.homeTo=PREVSC===SCN.town?'town':'lobby';this.tab=this.nextTab||'zk';this.nextTab=null;this.sel=null;this.selT=0;dailyGet();say({zk:'かんじゃさん ずかん！ なおした どうぶつが のるよ',md:'メダルを あつめると びょういんの そとが にぎやかに なるよ',st:'きょうの おねがい！ 3つ クリアすると スタンプが もらえるよ'}[this.tab]);},
  update(dt){this.selT+=dt;},
  tabs(){return[['zk','ずかん','#ff8c5a'],['md','メダル','#e8a800'],['st','おねがい','#ff5fa2']].map((q,i)=>({id:q[0],n:q[1],col:q[2],x:W/2+(i-1)*178,y:150}));},
  zkCells(){const top=250,ch=Math.min(200,(H-top-30)/4);return ZK.map((k,i)=>({k,x:W/2+(i%4-1.5)*140,y:top+Math.floor(i/4)*ch+ch/2,h:ch-12}));},
  mdCells(){const top=260,ch=Math.min(150,(H-top-20)/6);return MEDALS.map((m,i)=>({m,x:W/2+(i%3-1)*186,y:top+Math.floor(i/3)*ch+ch/2-10,h:ch}));},
  draw(c){const L=-OX/SC-2,R=W+OX/SC+2,TP=-OY/SC-2;c.fillStyle=vfill(c,TP,H,'#fff4e4',.1,0);c.fillRect(L,TP,R-L,H+OY/SC*2+4);
    c.fillStyle='#f4e4cc';for(let y=0;y<H;y+=48)c.fillRect(L,y,R-L,2);
    txtO(c,{zk:'かんじゃさん ずかん',md:'メダル',st:'きょうの おねがい'}[this.tab],W/2+20,70,34,'#ff5fa2','#fff',8);
    for(const t of this.tabs()){const on=this.tab===t.id;c.fillStyle=on?t.col:'#fff';rr(c,t.x-80,t.y-26,160,52,26);c.fill();c.strokeStyle=t.col;c.lineWidth=4;c.stroke();txt(c,t.n,t.x,t.y+1,22,on?'#fff':t.col);}
    if(this.tab==='zk')this.drawZk(c);else if(this.tab==='md')this.drawMd(c);else this.drawSt(c);},
  drawZk(c){txt(c,`${zkN()} / ${ZK.length} しゅるい`,W/2-110,214,22,'#8a5a3a');c.fillStyle='#ffd23a';star(c,W/2+70,214,12,5);c.fill();txt(c,`キラキラ ${SAVE.sh.length}`,W/2+150,214,22,'#c88400');
    for(const q of this.zkCells()){const n=SAVE.zk[q.k]||0,sh=SAVE.sh.includes(q.k),sel=this.sel===q.k;c.fillStyle=sh?'#fff8d8':n?'#fff':'#efe8e0';rr(c,q.x-64,q.y-q.h/2,128,q.h,18);c.fill();c.strokeStyle=sel?'#ff5fa2':sh?'#ffd23a':n?'#f0c8a0':'#e0d4c8';c.lineWidth=sel?6:4;c.stroke();
      const s=Math.min(.34,q.h/420);if(n){const b=sel?Math.abs(Math.sin(this.selT*8))*10:0;drawAnimal(c,q.k,q.x,q.y+q.h*.22-b,s,{t:T+q.x,happy:1,shiny:sh});txt(c,WORDS[q.k][0],q.x,q.y+q.h*.33,15,'#6a4a3a');c.fillStyle='rgba(255,140,90,.9)';rr(c,q.x+22,q.y-q.h/2+6,38,20,10);c.fill();txt(c,`×${Math.min(n,999)}`,q.x+41,q.y-q.h/2+16,13,'#fff');if(sh){c.fillStyle='#ffd23a';star(c,q.x-44,q.y-q.h/2+18,12,5);c.fill();}}
      else{c.globalAlpha=.13;drawAnimal(c,q.k,q.x,q.y+q.h*.22,s,{t:0});c.globalAlpha=1;txt(c,'？',q.x,q.y-6,40,'#b8a898');}}},
  drawMd(c){txt(c,`${SAVE.medals.length} / ${MEDALS.length} こ`,W/2,214,22,'#8a5a3a');
    for(const q of this.mdCells()){const on=SAVE.medals.includes(q.m[0]),sel=this.sel===q.m[0];const r=Math.min(34,q.h*.26);drawMedal(c,q.x,q.y-q.h*.12,r*(sel?1+Math.abs(Math.sin(this.selT*6))*.12:1),on,q.m);
      txt(c,q.m[1],q.x,q.y+q.h*.26,q.m[1].length>9?13:15,on?'#8a5a00':'#a098a8');if(sel){c.fillStyle='rgba(255,255,255,.95)';}}
    const s=MEDALS.find(m=>m[0]===this.sel);if(s){const on=SAVE.medals.includes(s[0]);panel(c,30,H-120,W-60,100,24,'#fff','#ffd23a',4);txt(c,`${s[1]} ： ${s[2]}`,W/2,H-88,19,'#8a5a00');txt(c,on?`ごほうび： びょういんの そとに ${s[5]}`:`とると： びょういんの そとに ？？？`,W/2,H-52,18,on?'#ff5fa2':'#a098a8');}},
  stCells(){const D=dailyGet();return D.rooms.map((id,i)=>({id,x:W/2+(i-1)*180,y:330}));},
  drawSt(c){const D=dailyGet();panel(c,24,236,W-48,190,24,'#fff','#ffb3d6',4);
    for(const q of this.stCells()){const r=ROOMS.find(z=>z.id===q.id),dn=D.done.includes(q.id);c.fillStyle=dn?'#e8fff0':'#fff4fa';rr(c,q.x-78,q.y-78,156,150,20);c.fill();c.strokeStyle=r.col;c.lineWidth=4;c.stroke();drawThing(c,r.icon,q.x,q.y-20,.9);txt(c,r.name.length>7?r.name.slice(0,7):r.name,q.x,q.y+44,17,'#6a5a8a');
      if(dn){c.save();c.translate(q.x+44,q.y-44);c.rotate(-.2);c.fillStyle='#2ec07a';circ(c,0,0,24);c.strokeStyle='#fff';c.lineWidth=6;c.beginPath();c.moveTo(-11,0);c.lineTo(-3,9);c.lineTo(12,-9);c.stroke();c.restore();}
      else{const b=Math.sin(T*5)*4;c.fillStyle='#ff5fa2';rr(c,q.x-40,q.y+58+b-4,80,26,13);c.fill();txt(c,'いく！',q.x,q.y+71+b-4,15,'#fff');}}
    txt(c,D.stamped?'きょうは ぜんぶ クリア！ また あしたね':'3つ ぜんぶ クリアで スタンプと ハート30！',W/2,452,19,D.stamped?'#2ec07a':'#8a5a9a');
    // スタンプカード
    const top=500,cardN=Math.floor(SAVE.stamps/10),inC=SAVE.stamps%10;panel(c,24,top,W-48,Math.min(360,H-top-30),24,'#fffdf4','#ffd23a',4);txt(c,`スタンプカード ${cardN+1}まいめ （ぜんぶで ${SAVE.stamps}こ）`,W/2,top+30,20,'#8a5a00');
    const sy=top+70,gh=Math.min(130,(Math.min(360,H-top-30)-90)/2);for(let i=0;i<10;i++){const x=W/2+(i%5-2)*104,y=sy+Math.floor(i/5)*gh+gh/2;c.strokeStyle='#e8d8b0';c.lineWidth=3;c.setLineDash([6,6]);c.beginPath();c.arc(x,y,Math.min(40,gh*.38),0,TAU);c.stroke();c.setLineDash([]);if(i<inC)drawStamp(c,x,y,Math.min(38,gh*.36),-.2+(i%3)*.15);else txt(c,String(i+1),x,y,22,'#e0d0b0');}},
  down(x,y){if(hitC(x,y,56,60,46))return;for(const t of this.tabs())if(Math.abs(x-t.x)<80&&Math.abs(y-t.y)<28){if(this.tab!==t.id){sfx('tap');this.nextTab=t.id;this.enter();}return;}
    if(this.tab==='zk'){for(const q of this.zkCells())if(Math.abs(x-q.x)<64&&Math.abs(y-q.y)<q.h/2){sfx('pop');this.sel=q.k;this.selT=0;const n=SAVE.zk[q.k];if(n){hush();speak(`${WORDS[q.k][0]}。 ${n}かい なおしたよ`);speak(WORDS[q.k][1],'en');}else say('まだ あって いない かんじゃさん。 いろんな おへやで あそぶと あえるよ');return;}}
    if(this.tab==='md'){for(const q of this.mdCells())if(Math.abs(x-q.x)<90&&Math.abs(y-q.y)<q.h/2){sfx('pop');this.sel=q.m[0];this.selT=0;const on=SAVE.medals.includes(q.m[0]);say(on?`${q.m[1]}！ びょういんの そとに ${q.m[5]}が あるよ`:`${q.m[2]}と もらえるよ`);return;}}
    if(this.tab==='st'){const D=dailyGet();for(const q of this.stCells())if(Math.abs(x-q.x)<78&&Math.abs(y-q.y)<90){if(D.done.includes(q.id)){sfx('boing');say('これは もう クリア！');}else{sfx('tap');go(q.id);}return;}}},
  hint(){return null;}};

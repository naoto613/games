// ================= ATTRACTION: まじかるたんてい ピンクハート =================
// Original magical-detective heroine story (inspired by magical-girl detective anime; no official characters used).
const MAGIC_OUTFIT={style:'magic',dress:'#ff7ab8',skirt:'#ffffff',ribbon:'#ff3d8a',boots:'#ff5fa2',acc:'dhat'};
function drawNyan(c,x,y,s,t,mood){c.save();c.translate(x,y+Math.sin(t*3)*4);c.scale(s,s);c.lineJoin='round';c.strokeStyle='#3a2a3a';c.lineWidth=2.4;
  c.fillStyle='rgba(255,255,255,.7)';for(const sd of[-1,1]){c.save();c.translate(sd*18,-6);c.rotate(sd*(.4+Math.sin(t*14)*.25));c.beginPath();c.ellipse(sd*8,0,12,7,0,0,TAU);c.fill();c.stroke();c.restore();}
  c.fillStyle=gfill(c,-4,-8,26,'#ffffff',.2,-.1);c.beginPath();c.ellipse(0,0,22,20,0,0,TAU);c.fill();c.stroke();
  c.fillStyle='#3a3040';for(const sd of[-1,1]){c.beginPath();c.moveTo(sd*18,-8);c.lineTo(sd*16,-28);c.lineTo(sd*6,-16);c.closePath();c.fill();c.stroke();}
  c.fillStyle='#3a3040';c.beginPath();c.ellipse(-8,-4,8,7,.3,0,TAU);c.fill();
  c.fillStyle=gfill(c,0,-22,16,'#c89060');c.beginPath();c.ellipse(0,-17,17,5,0,0,TAU);c.fill();c.stroke();c.beginPath();c.arc(0,-18,11,Math.PI,TAU);c.closePath();c.fill();c.stroke();c.fillStyle='#8a5a3a';c.fillRect(-11,-21,22,3);
  const happy=mood==='happy';if(happy){c.lineWidth=2.2;for(const sd of[-1,1]){c.beginPath();c.arc(sd*7,2,3.5,Math.PI*1.1,Math.PI*1.9);c.stroke();}}
  else for(const sd of[-1,1]){c.fillStyle='#fff';circ(c,sd*7,1,4.2);c.fillStyle='#2a8a5a';circ(c,sd*7,1.5,3);c.fillStyle='#111';circ(c,sd*7,1.6,1.6);c.fillStyle='#fff';circ(c,sd*7-1,0,1);}
  c.strokeStyle='#ffd23a';c.lineWidth=1.6;c.beginPath();c.arc(7,1,5.4,0,TAU);c.stroke();c.beginPath();c.moveTo(12,4);c.lineTo(15,12);c.stroke();
  c.fillStyle='#ff8cb0';ell(c,0,6,2,1.4);c.strokeStyle='#3a2a3a';c.lineWidth=1.4;c.beginPath();c.arc(-2,8,2,0,Math.PI);c.arc(2,8,2,0,Math.PI);c.stroke();
  c.strokeStyle='#bbb';c.lineWidth=1;for(const sd of[-1,1])for(const d of[-2,2]){c.beginPath();c.moveTo(sd*10,6+d);c.lineTo(sd*22,5+d*1.6);c.stroke();}
  c.fillStyle='#ff3d8a';bow(c,0,16,3.2,'#ff3d8a');c.restore();}
function drawVillain(c,x,y,s,t,mood){c.save();c.translate(x,y+Math.sin(t*2)*5);c.scale(s,s);c.lineJoin='round';c.strokeStyle='#1a1026';c.lineWidth=2.4;
  c.fillStyle='#4a2a6a';c.beginPath();c.moveTo(-6,-10);c.quadraticCurveTo(-46,20+Math.sin(t*4)*6,-30,52);c.lineTo(30,52);c.quadraticCurveTo(46,20+Math.sin(t*4+1)*6,6,-10);c.closePath();c.fill();c.stroke();c.fillStyle='#ff4d6d';c.beginPath();c.moveTo(-26,48);c.lineTo(26,48);c.lineTo(22,52);c.lineTo(-22,52);c.fill();
  c.fillStyle=gfill(c,-4,20,24,'#3a3050');c.beginPath();c.ellipse(0,24,18,24,0,0,TAU);c.fill();c.stroke();c.fillStyle='#fff';c.beginPath();c.moveTo(-6,4);c.lineTo(0,14);c.lineTo(6,4);c.fill();
  c.fillStyle=gfill(c,-4,-18,24,'#3a3050');c.beginPath();c.arc(0,-14,20,0,TAU);c.fill();c.stroke();for(const sd of[-1,1]){c.beginPath();c.moveTo(sd*16,-24);c.lineTo(sd*18,-44);c.lineTo(sd*4,-32);c.closePath();c.fill();c.stroke();}
  c.fillStyle='#fff';c.beginPath();c.moveTo(-22,-18);c.quadraticCurveTo(0,-26,22,-18);c.lineTo(20,-8);c.quadraticCurveTo(0,-14,-20,-8);c.closePath();c.fill();c.stroke();
  for(const sd of[-1,1]){c.fillStyle='#ffd23a';ell(c,sd*9,-14,4.2,3.4);c.fillStyle='#1a1026';ell(c,sd*9,-14,1.4,3);}
  c.strokeStyle='#1a1026';c.lineWidth=2;c.beginPath();if(mood==='sad'){c.arc(0,-2,5,Math.PI*1.2,Math.PI*1.8);}else{c.moveTo(-6,-4);c.quadraticCurveTo(0,1,7,-5);}c.stroke();
  c.fillStyle='#1a1026';c.beginPath();c.ellipse(0,-36,24,5,0,0,TAU);c.fill();rr(c,-13,-60,26,26,4);c.fill();c.fillStyle='#ff4d6d';c.fillRect(-13,-40,26,4);
  c.strokeStyle='#3a3050';c.lineWidth=5;c.beginPath();c.moveTo(14,40);c.quadraticCurveTo(40,34,36,10+Math.sin(t*3)*6);c.stroke();c.restore();}
function drawSuspect(c,k,x,y,s,t,o={}){if(AN[k])return drawAnimal(c,k,x,y,s,{t,happy:o.happy,sad:o.sad});c.save();c.translate(x,y);c.scale(s,s);c.lineJoin='round';c.lineWidth=3;
  const bob=Math.sin(t*2)*1.5;c.translate(0,-bob);c.fillStyle='rgba(60,40,80,.15)';ell(c,0,bob,40,10);
  if(k==='crow'){c.strokeStyle='#111';c.fillStyle=gfill(c,-8,-50,50,'#2a2a3a');c.beginPath();c.ellipse(0,-40,30,36,0,0,TAU);c.fill();c.stroke();for(const sd of[-1,1]){c.beginPath();c.ellipse(sd*30,-38,12,26,sd*.3,0,TAU);c.fill();c.stroke();}c.beginPath();c.arc(0,-88,26,0,TAU);c.fill();c.stroke();
    c.fillStyle='#ffb03a';c.beginPath();c.moveTo(-8,-84);c.lineTo(8,-84);c.lineTo(0,-70);c.closePath();c.fill();c.stroke();for(const sd of[-1,1]){c.fillStyle='#fff';circ(c,sd*10,-94,6);c.fillStyle='#111';circ(c,sd*10,-93,3.4);}c.strokeStyle='#ffb03a';c.lineWidth=4;for(const sd of[-1,1]){c.beginPath();c.moveTo(sd*10,-6);c.lineTo(sd*10,4);c.moveTo(sd*10,4);c.lineTo(sd*4,8);c.moveTo(sd*10,4);c.lineTo(sd*16,8);c.stroke();}}
  else if(k==='bat'){c.strokeStyle='#2a1a3a';c.fillStyle='#8a5ad8';for(const sd of[-1,1]){c.beginPath();c.moveTo(sd*16,-60);c.lineTo(sd*62,-78+Math.sin(t*6)*6);c.lineTo(sd*54,-50);c.lineTo(sd*44,-56);c.lineTo(sd*36,-40);c.lineTo(sd*16,-40);c.closePath();c.fill();c.stroke();}
    c.fillStyle=gfill(c,-6,-60,40,'#6a4a9a');c.beginPath();c.ellipse(0,-50,26,30,0,0,TAU);c.fill();c.stroke();for(const sd of[-1,1]){c.beginPath();c.moveTo(sd*8,-72);c.lineTo(sd*22,-98);c.lineTo(sd*22,-68);c.closePath();c.fill();c.stroke();}
    for(const sd of[-1,1]){c.fillStyle='#fff';circ(c,sd*10,-58,6);c.fillStyle='#111';circ(c,sd*10,-57,3);}c.fillStyle='#fff';c.beginPath();c.moveTo(-6,-40);c.lineTo(-3,-34);c.lineTo(0,-40);c.fill();}
  else if(k==='owl'){c.strokeStyle='#5a3a1a';c.fillStyle=gfill(c,-8,-50,50,'#b07a4a');c.beginPath();c.ellipse(0,-46,34,44,0,0,TAU);c.fill();c.stroke();c.fillStyle='#f0d8a8';ell(c,0,-30,20,24);
    for(const sd of[-1,1]){c.fillStyle='#fff';circ(c,sd*14,-62,13);c.fillStyle='#ffb03a';circ(c,sd*14,-62,8);c.fillStyle='#111';circ(c,sd*14,-62,4.5);c.fillStyle='#b07a4a';c.beginPath();c.moveTo(sd*18,-84);c.lineTo(sd*28,-100);c.lineTo(sd*8,-88);c.fill();}c.fillStyle='#ffb03a';c.beginPath();c.moveTo(-5,-52);c.lineTo(5,-52);c.lineTo(0,-42);c.fill();}
  else if(k==='raccoon'){drawAnimal(c,'bear',0,0,1,{t});c.fillStyle='#9a9aa8';c.globalAlpha=.55;circ(c,0,-88,34);c.globalAlpha=1;c.fillStyle='#2a2a3a';for(const sd of[-1,1]){c.save();c.translate(sd*13,-86);c.rotate(sd*.3);ell(c,0,0,11,8);c.restore();}for(const sd of[-1,1]){c.fillStyle='#fff';circ(c,sd*13,-86,4);c.fillStyle='#111';circ(c,sd*13,-86,2.4);}
    c.strokeStyle='#4a4a5a';c.fillStyle='#8a8a9a';c.lineWidth=3;c.beginPath();c.ellipse(40,-20,12,28,.6,0,TAU);c.fill();c.stroke();c.fillStyle='#3a3a4a';for(let i=0;i<3;i++){c.save();c.translate(40,-20);c.rotate(.6);c.fillRect(-11,-18+i*12,22,5);c.restore();}}
  c.restore();}
function drawClue(c,k,x,y,s){c.save();c.translate(x,y);c.scale(s,s);c.lineJoin='round';c.lineCap='round';c.lineWidth=2.5;
  switch(k){
    case'feather':c.rotate(-.5);c.fillStyle='#2a2a3a';c.strokeStyle='#111';c.beginPath();c.moveTo(0,24);c.quadraticCurveTo(-16,0,0,-26);c.quadraticCurveTo(16,0,0,24);c.fill();c.stroke();c.strokeStyle='#8a8aa8';c.beginPath();c.moveTo(0,28);c.lineTo(0,-22);c.stroke();break;
    case'print3':c.strokeStyle='#8a5a3a';c.lineWidth=5;for(const dx of[-12,12]){c.save();c.translate(dx,dx>0?-10:10);c.beginPath();c.moveTo(0,10);c.lineTo(0,-8);c.moveTo(0,-2);c.lineTo(-8,-12);c.moveTo(0,-2);c.lineTo(8,-12);c.stroke();c.restore();}break;
    case'crumb':drawItem(c,'cake',0,0,.7);c.fillStyle='#f5c77a';circ(c,18,14,4);circ(c,-16,16,3);break;
    case'wing':c.fillStyle='#8a5ad8';c.strokeStyle='#4a2a7a';c.beginPath();c.moveTo(-20,10);c.lineTo(-10,-20);c.lineTo(22,-14);c.lineTo(14,0);c.lineTo(20,8);c.lineTo(4,6);c.closePath();c.fill();c.stroke();break;
    case'moon':c.fillStyle='#ffe36a';c.strokeStyle='#e8a800';c.beginPath();c.arc(0,0,18,.6,5.7);c.arc(8,-4,14,5.2,1.1,true);c.closePath();c.fill();c.stroke();break;
    case'dust':c.fillStyle='#ffd23a';for(const [a,b,r] of [[-12,-8,8],[8,-12,6],[14,10,9],[-8,12,5],[0,0,4]]){star(c,a,b,r,r*.4);c.fill();}break;
    case'stripe':c.strokeStyle='#4a4a5a';c.fillStyle='#9a9aa8';c.beginPath();c.ellipse(0,0,12,24,.4,0,TAU);c.fill();c.stroke();c.fillStyle='#3a3a4a';for(let i=-1;i<=1;i++){c.save();c.rotate(.4);c.fillRect(-11,i*11-3,22,6);c.restore();}break;
    case'maskprint':c.fillStyle='#4a4a5a';ell(c,0,6,11,9);for(const [a,b] of [[-12,-8],[-4,-14],[4,-14],[12,-8]])circ(c,a,b,4);break;
    case'bone':drawItem(c,'bone',0,0,.9);break;
    case'ribbon':bow(c,0,0,12,'#ff5fa2');c.fillStyle='#ffd23a';circ(c,0,14,7);c.strokeStyle='#c89000';c.beginPath();c.arc(0,14,7,0,TAU);c.stroke();break;
    case'tail':c.rotate(.6);c.fillStyle='#c89060';c.strokeStyle='#8a5a3a';c.beginPath();c.ellipse(0,0,10,24,0,0,TAU);c.fill();c.stroke();c.strokeStyle='#e8c090';for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(-5,i*8);c.lineTo(5,i*8-4);c.stroke();}break;
    case'fishbone':c.strokeStyle='#8a8aa0';c.lineWidth=3;c.beginPath();c.moveTo(-20,0);c.lineTo(16,0);for(let i=-12;i<=8;i+=6){c.moveTo(i,-8);c.lineTo(i,8);}c.stroke();c.fillStyle='#fff';c.strokeStyle='#8a8aa0';c.beginPath();c.moveTo(16,0);c.lineTo(26,-10);c.lineTo(26,10);c.closePath();c.fill();c.stroke();circ(c,-22,0,6);c.stroke();break;
    case'gem':c.fillStyle='#8ad8ff';c.strokeStyle='#3a8ad8';c.beginPath();c.moveTo(-14,-4);c.lineTo(-7,-14);c.lineTo(7,-14);c.lineTo(14,-4);c.lineTo(0,16);c.closePath();c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.7)';c.beginPath();c.moveTo(-7,-14);c.lineTo(0,-4);c.lineTo(-14,-4);c.fill();break;
  }c.restore();}
const CASES=[
  {title:'きえた いちごケーキ',bg:'shop',item:'cake',owner:'cat',
    intro:'たいへん！ ケーキやさんの いちごケーキが きえちゃった！',clues:[['feather','くろい はね'],['print3','とりの あしあと'],['crumb','ケーキの かけら']],
    sus:[['crow',1],['cat',0],['dog',0]],culprit:'カラスさんだったんだね！',mon:{kind:'cake',name:'ケーキモンスター',col:'#ffb3d6'}},
  {title:'よぞらの ほしどろぼう',bg:'night',item:'starcandy',owner:'rabbit',
    intro:'よぞらの おほしさまが ひとつ なくなっちゃった！',clues:[['wing','むらさきの はね'],['moon','つきの かざり'],['dust','ほしの こな']],
    sus:[['owl',0],['bat',1],['rabbit',0]],culprit:'コウモリさんだったんだね！',mon:{kind:'star',name:'ほしモンスター',col:'#ffd23a'}},
  {title:'びじゅつかんの ティアラ',bg:'museum',item:'crown',owner:'panda',
    intro:'びじゅつかんの キラキラ ティアラが ぬすまれた！',clues:[['stripe','しましまの け'],['maskprint','ちいさな あしあと'],['gem','こぼれた ほうせき']],
    sus:[['pig',0],['cat',0],['raccoon',1]],culprit:'アライグマさんだったんだね！',mon:{kind:'gem',name:'ほうせきモンスター',col:'#8ad8ff'}},
  {title:'こうえんの ふうせん',bg:'park',item:'balloon',owner:'rabbit',
    intro:'こうえんの ふうせんやさんの ふうせんが ぜんぶ きえちゃった！',clues:[['bone','ほねの おやつ'],['maskprint','まるい あしあと'],['tail','ふさふさの け']],
    sus:[['owl',0],['dog',1],['pig',0]],culprit:'いぬさんだったんだね！',mon:{kind:'balloon',name:'ふうせんモンスター',col:'#ff6f91'}},
  {title:'なつまつりの きんぎょ',bg:'night',item:'goldfish',owner:'pig',
    intro:'おまつりの きんぎょが いっぴき いなくなっちゃった！',clues:[['fishbone','さかなの ほね'],['ribbon','すずの リボン'],['maskprint','ねこの あしあと']],
    sus:[['cat',1],['bat',0],['panda',0]],culprit:'ねこさんだったんだね！',mon:{kind:'fish',name:'きんぎょモンスター',col:'#ff7a3a'}},
];
function detBg(c,kind,night){if(kind==='shop'){c.fillStyle='#ffe0ee';c.fillRect(-400,0,W+800,H);c.fillStyle='#ffd0e4';for(let x=0;x<W;x+=60)c.fillRect(x,0,30,H*.6);c.fillStyle=vfill(c,H*.6,H,'#e8b890',.05,-.1);c.fillRect(-400,H*.6,W+800,H);
    c.fillStyle='#c8905a';rr(c,30,H*.44,540,40,10);c.fill();c.fillStyle='rgba(210,240,255,.5)';rr(c,40,H*.3,520,H*.14,10);c.fill();c.strokeStyle='#fff';c.lineWidth=4;c.stroke();for(let i=0;i<4;i++)drawItem(c,['cake','heartcookie','cherry','starcandy'][i],110+i*130,H*.4,1.2);}
  else if(kind==='night'){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#141040');g.addColorStop(1,'#3a2a7a');c.fillStyle=g;c.fillRect(-400,0,W+800,H);c.fillStyle='#fff';for(let i=0;i<40;i++){star(c,(i*97)%W,(i*61)%(H*.5),1.5+((i+Math.floor(T*2))%5===0?1.5:0),.6,4);c.fill();}
    c.fillStyle='#fff6b0';circ(c,470,120,40);c.fillStyle='#141040';circ(c,488,108,34);c.fillStyle='#2a4a3a';ell(c,120,H*.72,260,120);ell(c,500,H*.74,240,110);c.fillStyle='#3a5a4a';c.fillRect(-400,H*.72,W+800,H);tree(c,80,H*.7,1,'#2a6a4a');tree(c,520,H*.72,.9,'#2a6a4a');}
  else if(kind==='park'){skyBg(c,'#8fd8ff','#e6f8ff',H*.6);cloud(c,140,120,.8,true);cloud(c,470,200,.6);c.fillStyle=vfill(c,H*.58,H,'#a8e07a',.05,-.08);c.fillRect(-400,H*.58,W+800,H);tree(c,70,H*.6,1);tree(c,540,H*.62,.9,'#6cd07a');c.fillStyle='#e8c090';rr(c,200,H*.44,200,H*.16,10);c.fill();c.fillStyle='#ff8cc0';c.fillRect(190,H*.42,220,20);c.strokeStyle='#8a7a9a';c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.moveTo(250+i*50,H*.44);c.lineTo(250+i*50,H*.33);c.stroke();c.strokeStyle='#bbb';c.setLineDash([4,4]);c.beginPath();c.arc(250+i*50,H*.3,22,0,TAU);c.stroke();c.setLineDash([]);c.strokeStyle='#8a7a9a';}flowers(c,0,W,H*.62,H*.75,4);}
  else{c.fillStyle='#f4ecff';c.fillRect(-400,0,W+800,H);c.fillStyle='#e0d0f8';for(let x=0;x<W;x+=100)c.fillRect(x+40,0,20,H*.62);c.fillStyle=vfill(c,H*.62,H,'#c8b0e8',.1,-.1);c.fillRect(-400,H*.62,W+800,H);
    for(const [x,k] of [[120,'painting'],[300,'crown'],[480,'painting']]){c.fillStyle='#d8a04a';rr(c,x-60,H*.2,120,100,6);c.fill();c.fillStyle='#bfe8ff';c.fillRect(x-48,H*.2+12,96,76);if(k==='crown')drawItem(c,'crown',x,H*.2+50,1.2);else{c.fillStyle='#6cd08a';c.beginPath();c.moveTo(x-48,H*.2+88);c.lineTo(x-10,H*.2+40);c.lineTo(x+48,H*.2+88);c.fill();}}}}
function drawMonster(c,m,x,y,s,t,o){c.save();c.translate(x,y);const wob=Math.sin(t*3)*.05;c.scale(s*(1+wob),s*(1-wob));c.lineJoin='round';c.strokeStyle='#3a1a3a';c.lineWidth=4;
  const pur=o.pur||0,flash=o.flash>0,angry=!pur;c.globalAlpha=1-pur*.8;
  if(o.warn){c.fillStyle=`rgba(255,60,80,${.25+Math.sin(t*20)*.15})`;circ(c,0,0,150);}
  c.fillStyle='rgba(90,20,90,.3)';for(let i=0;i<6;i++){const a=t+i;circ(c,Math.cos(a)*120,Math.sin(a*1.3)*80,10+Math.sin(t*3+i)*4);}
  if(m.kind==='cake'){c.fillStyle=flash?'#fff':gfill(c,-30,-20,140,'#f5c77a');rr(c,-110,-40,220,130,20);c.fill();c.stroke();c.fillStyle=flash?'#fff':m.col;rr(c,-116,-70,232,50,24);c.fill();c.stroke();for(let i=0;i<7;i++){c.beginPath();c.ellipse(-96+i*32,-22,14,20+((i*7)%3)*6,0,0,Math.PI);c.fill();}
    c.fillStyle='#ff4d6d';c.fillRect(-110,20,220,12);for(const dx of[-60,0,60])drawItem(c,'strawberry',dx,-86,1.2);c.save();c.translate(0,-110);drawItem(c,'candle',0,0,1.6);c.restore();
    for(const sd of[-1,1]){c.fillStyle=flash?'#fff':m.col;c.beginPath();c.ellipse(sd*136,10+Math.sin(t*5+sd)*10,22,34,sd*.5,0,TAU);c.fill();c.stroke();}}
  else if(m.kind==='star'){c.fillStyle=flash?'#fff':gfill(c,-30,-30,150,m.col);star(c,0,0,140,70,5,-Math.PI/2+Math.sin(t)*.1);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.5)';star(c,-20,-30,40,18);c.fill();}
  else if(m.kind==='balloon'){c.strokeStyle='#8a7a9a';c.lineWidth=4;c.beginPath();c.moveTo(0,130);c.quadraticCurveTo(30,170,0,210);c.stroke();c.strokeStyle='#3a1a3a';c.lineWidth=4;for(const [dx,dy,r,col] of [[-110,-70,40,'#5aa8ff'],[110,-60,38,'#ffd23a'],[-90,60,34,'#6cd08a'],[100,70,34,'#b48cff']]){c.fillStyle=flash?'#fff':gfill(c,dx-10,dy-10,r,col);c.beginPath();c.ellipse(dx+Math.sin(t*2+dx)*6,dy,r,r*1.15,0,0,TAU);c.fill();c.stroke();}c.fillStyle=flash?'#fff':gfill(c,-30,-40,140,m.col);c.beginPath();c.ellipse(0,0,110,130,0,0,TAU);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.45)';ell(c,-40,-60,20,34);}
  else if(m.kind==='fish'){const w=Math.sin(t*6)*.2;c.save();c.translate(100,0);c.rotate(w);c.fillStyle=flash?'#fff':m.col;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(60,-80,110,-60);c.quadraticCurveTo(70,0,110,60);c.quadraticCurveTo(60,80,0,0);c.fill();c.stroke();c.restore();c.fillStyle=flash?'#fff':gfill(c,-30,-30,130,m.col);c.beginPath();c.ellipse(0,0,130,90,0,0,TAU);c.fill();c.stroke();c.fillStyle='#fff6e0';c.beginPath();c.ellipse(0,50,80,26,0,0,Math.PI);c.fill();for(const sd of[-1,1]){c.fillStyle=flash?'#fff':shade(m.col,.2);c.beginPath();c.ellipse(-10,sd*80,30,16,sd*.4,0,TAU);c.fill();c.stroke();}}
  else{c.fillStyle=flash?'#fff':gfill(c,-30,-30,150,m.col);c.beginPath();c.moveTo(-120,-30);c.lineTo(-60,-110);c.lineTo(60,-110);c.lineTo(120,-30);c.lineTo(0,120);c.closePath();c.fill();c.stroke();c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=3;c.beginPath();c.moveTo(-120,-30);c.lineTo(120,-30);c.moveTo(-60,-110);c.lineTo(-20,-30);c.lineTo(0,120);c.lineTo(20,-30);c.lineTo(60,-110);c.stroke();c.strokeStyle='#3a1a3a';c.lineWidth=4;drawItem(c,'crown',0,-126,1.4);}
  const ey=m.kind==='cake'?10:m.kind==='star'?-6:m.kind==='balloon'?-20:m.kind==='fish'?-10:-50;
  if(angry){for(const sd of[-1,1]){c.fillStyle='#fff';c.beginPath();c.ellipse(sd*34,ey,20,16,0,0,TAU);c.fill();c.stroke();c.fillStyle='#c01a3a';circ(c,sd*30,ey+3,9);c.fillStyle='#1a0a1a';circ(c,sd*30,ey+3,4.5);c.lineWidth=7;c.beginPath();c.moveTo(sd*14,ey-22);c.lineTo(sd*54,ey-12);c.stroke();c.lineWidth=4;}
    c.fillStyle='#6a1a3a';c.beginPath();c.moveTo(-30,ey+30);c.quadraticCurveTo(0,ey+20,30,ey+30);c.quadraticCurveTo(0,ey+56,-30,ey+30);c.fill();c.stroke();c.fillStyle='#fff';for(const dx of[-16,0,16]){c.beginPath();c.moveTo(dx-6,ey+27);c.lineTo(dx,ey+36);c.lineTo(dx+6,ey+27);c.fill();}}
  else{c.lineWidth=5;for(const sd of[-1,1]){c.beginPath();c.arc(sd*32,ey+4,12,Math.PI*1.1,Math.PI*1.9);c.stroke();}c.fillStyle='#ff8cb0';ell(c,-60,ey+22,14,8);ell(c,60,ey+22,14,8);}
  c.restore();}
SCN.detective={bg:'#2a1a4a',song:'hero',
  enter(){this.ph='menu';this.t=0;this.solved=SAVE.det||[];this.lay();say('ここは まじかる たんてい じむしょ！ じけんを えらんでね');},
  lay(){},
  cardP(i){return{x:W/2,y:H*.14+110+i*Math.min(118,(H*.62-110)/4)};},
  startCase(i){this.ci=i;this.cs=CASES[i];this.ph='intro';this.t=0;this.found=[];const slots=shuffle([[130,H*.48],[450,H*.52],[300,H*.7],[180,H*.66],[420,H*.72]]);this.clues=this.cs.clues.map((q,j)=>({k:q[0],ja:q[1],x:slots[j%5][0]+rand(-25,25),y:slots[j%5][1]+rand(-18,18),got:false,hov:0}));
    this.lens={x:W/2,y:H-160,held:false};this.fu={x:120,y:H*.86,hurt:0};this.mon={hp:100,flash:0,warn:0,cd:3,pur:0,shake:0};this.shots=[];this.stars=[];this.shield=0;this.power=0;this.cmb=0;this.maxC=0;this.lastT=-9;this.trace=null;this.beam=0;
    say(this.cs.intro);},
  update(dt){this.t+=dt;const m=this.mon;
    if(this.ph==='search'){for(const q of this.clues){if(q.got)continue;if(Math.hypot(this.lens.x-q.x,this.lens.y-80-q.y)<55){q.hov+=dt;if(q.hov>.35){q.got=true;q.gt=0;this.found.push(q);sfx('ding');rkCheer();burst(q.x,q.y,16,'star');sayPair('みつけた！ '+q.ja,'clue!');if(this.found.length===3)setTimeout(()=>{if(scene===this&&this.ph==='search'){this.ph='deduce';this.t=0;say('てがかりが そろった！ はんにんは だれかな？');}},1800);}}else q.hov=0;}}
    if(this.ph==='reveal'&&this.t>4.2){this.ph='henshin0';this.t=0;say('ニャンたん「ふーちゃん、へんしんだ！ ハートの ペンダントを タッチ！」');}
    if(this.ph==='henshin'&&this.t>4){this.ph='battle';this.t=0;say('いくよ！ モンスターを タッチして こうげき！ あかく ひかったら まもるボタン！');}
    if(this.ph==='battle'){if(this.shield>0)this.shield-=dt;if(m.flash>0)m.flash-=dt;if(this.fu.hurt>0)this.fu.hurt-=dt;
      if(m.warn>0){m.warn-=dt;if(m.warn<=0){for(let i=0;i<3;i++)this.shots.push({x:W/2+(i-1)*60,y:H*.34,t:-i*.18});sfx('launch');}}
      else{m.cd-=dt;if(m.cd<=0&&!this.trace){m.warn=1.3;m.cd=rand(3.5,5);sfx('bell');say(pick(['くるよ！ まもって！','あぶない！ まもるボタン！']));}}
      for(let i=this.shots.length-1;i>=0;i--){const s=this.shots[i];s.t+=dt;if(s.t<0)continue;const k=s.t/.9;s.cx=lerp(s.x,this.fu.x+10,k);s.cy=lerp(s.y,this.fu.y-60,k)-Math.sin(k*Math.PI)*80;
        if(k>=1){this.shots.splice(i,1);if(this.shield>0){sfx('ding');burst(this.fu.x+30,this.fu.y-60,10,'star');this.power=Math.min(1,this.power+.12);if(!this.gsaid){this.gsaid=1;say('ガード！ じょうず！');}}else{this.fu.hurt=.6;sfx('boing');puff(this.fu.x,this.fu.y-50,5,'#ffb3d6');if(Math.random()<.5)say('りっきー「ねえね がんばれ〜！」');}}}
      for(let i=this.stars.length-1;i>=0;i--){const s=this.stars[i];s.t+=dt*2.4;if(s.t>=1){this.stars.splice(i,1);m.hp=Math.max(0,m.hp-rand(6,9)*(1+Math.min(s.p||1,6)*.08));m.flash=.15;m.shake=.3;sfx('pop');burst(W/2+rand(-60,60),H*.34+rand(-40,40),8,'star');this.power=Math.min(1,this.power+.07);}}
      if(m.shake>0)m.shake-=dt;
      if(!this.trace&&(m.hp<=30||this.power>=1)){this.trace=this.makeTrace();this.shots=[];m.warn=0;say('ひっさつわざ！ ハートを ゆびで なぞって！');}}
    if(this.ph==='beam'){if(this.t>1.2)m.pur=Math.min(1,(this.t-1.2)/1.2);if(this.t>3){this.ph='finale';this.t=0;sfx('fanfare');confetti(80);say(`やったー！ ${this.cs.mon.name}が もとに もどったよ！`);setTimeout(()=>{if(scene===this&&this.ph==='finale')say('クロニャン「きょうは このへんに しといて やるニャ〜！」');},2600);}}
    if(this.ph==='finale'&&this.t>6.5){this.ph='clear';SAVE.det=SAVE.det||[];if(!SAVE.det.includes(this.ci))SAVE.det.push(this.ci);save();celebrate('detective',(this.maxC||0)>=10);}},
  makeTrace(){const cx=W/2,cy=H*.46,pts=[];for(let a=0;a<=TAU+.01;a+=TAU/16){const x=16*Math.pow(Math.sin(a),3),y=-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a));pts.push({x:cx+x*9,y:cy+y*9,hit:false});}return{pts,i:0};},
  drawHud(c){const m=this.mon;c.fillStyle='rgba(0,0,0,.3)';rr(c,120,112,360,26,13);c.fill();c.fillStyle=vfill(c,112,138,'#ff4d8d');rr(c,120,112,360*m.hp/100,26,13);c.fill();c.fillStyle='#fff';c.font=`800 16px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(this.cs.mon.name,300,125);
    c.fillStyle='rgba(255,255,255,.4)';rr(c,120,146,360,12,6);c.fill();c.fillStyle='#ffd23a';rr(c,120,146,360*this.power,12,6);c.fill();},
  draw(c){const cs=this.cs;
    if(this.ph==='menu'){c.fillStyle=vfill(c,0,H,'#5a3a2a',.1,-.2);c.fillRect(-400,0,W+800,H);c.fillStyle='#7a5a3a';for(let y=0;y<H;y+=40)c.fillRect(-400,y,W+800,2);
      titleText(c,'まじかる たんてい',W/2,H*.14+10,40,'#ff5fa2');
      CASES.forEach((q,i)=>{const p=this.cardP(i);const ok=(SAVE.det||[]).includes(i);c.save();c.translate(p.x,p.y);c.rotate(((i%3)-1)*.03);c.fillStyle='rgba(0,0,0,.3)';rr(c,-236,-48,480,104,14);c.fill();c.fillStyle='#fff6dc';rr(c,-240,-54,480,104,14);c.fill();c.strokeStyle='#c8905a';c.lineWidth=4;c.stroke();
        c.fillStyle='#ff5fa2';c.font=`800 16px ${FONT}`;c.textAlign='left';c.textBaseline='middle';c.fillText(`じけん ${i+1}`,-150,-32);c.fillStyle='#4a3a2a';c.font=`800 26px ${FONT}`;c.fillText(q.title,-150,4);drawThing(c,q.item,-190,0,1.2);
        if(ok){c.save();c.translate(170,0);c.rotate(-.3);c.strokeStyle='#ff3d6d';c.lineWidth=5;c.beginPath();c.arc(0,0,40,0,TAU);c.stroke();c.fillStyle='#ff3d6d';c.font=`800 20px ${FONT}`;c.textAlign='center';c.fillText('かいけつ',0,2);c.restore();}c.restore();});
      drawFuka(c,120,H-40,{outfit:outfit({acc:'dhat'}),t:this.t,sc:3,item:null,point:1});drawNyan(c,300,H-150,1.4,this.t);drawRikki(c,480,H-40,{sc:2.3,t:this.t});this.rkPos={x:480,y:H-40,sc:2.3};return;}
    detBg(c,cs.bg);
    if(this.ph==='intro'){drawThing(c,cs.item,W/2,H*.4,2.5);c.strokeStyle='#ff4d6d';c.lineWidth=10;c.beginPath();c.moveTo(W/2-60,H*.4-60);c.lineTo(W/2+60,H*.4+60);c.moveTo(W/2+60,H*.4-60);c.lineTo(W/2-60,H*.4+60);c.globalAlpha=.8;c.stroke();c.globalAlpha=1;
      c.fillStyle='rgba(0,0,0,.25)';c.fillRect(-400,H*.55,W+800,H);drawAnimal(c,cs.owner,450,H*.8,1.2,{t:this.t,sad:1});drawFuka(c,160,H*.86,{outfit:outfit({acc:'dhat'}),t:this.t,sc:3.3,oh:1});drawNyan(c,300,H*.62,1.2,this.t);drawBtn(c,W/2,H*.93,44,'#ff6fa8','next',true);}
    else if(this.ph==='search'){c.fillStyle='rgba(20,10,40,.45)';c.fillRect(-400,0,W+800,H);
      const L=this.lens,lx=L.x,ly=L.y-80;c.save();c.beginPath();c.arc(lx,ly,78,0,TAU);c.clip();detBg(c,cs.bg);for(const q of this.clues)if(!q.got){drawClue(c,q.k,q.x,q.y,1.3);c.fillStyle=`rgba(255,240,120,${.3+Math.sin(T*6)*.2})`;circ(c,q.x,q.y,32);drawClue(c,q.k,q.x,q.y,1.3);}c.restore();
      c.strokeStyle='#c89a3a';c.lineWidth=12;c.beginPath();c.arc(lx,ly,80,0,TAU);c.stroke();c.strokeStyle='#ffe08a';c.lineWidth=4;c.stroke();c.strokeStyle='#8a5a2a';c.lineWidth=16;c.beginPath();c.moveTo(lx+56,ly+56);c.lineTo(lx+104,ly+104);c.stroke();c.fillStyle='rgba(255,255,255,.25)';ell(c,lx-30,ly-30,22,12);
      for(const q of this.clues){if(!q.got||q.gt>1)continue;}
      c.fillStyle='#fff6dc';rr(c,40,H-110,520,90,18);c.fill();c.strokeStyle='#c8905a';c.lineWidth=4;c.stroke();for(let i=0;i<3;i++){const x=130+i*170;c.fillStyle='#fff';circ(c,x,H-65,34);c.strokeStyle='#e0c8a0';c.beginPath();c.arc(x,H-65,34,0,TAU);c.stroke();const q=this.found[i];if(q)drawClue(c,q.k,x,H-65,1.1);else{c.fillStyle='#d8c8a8';c.font=`800 30px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('?',x,H-63);}}
      drawNyan(c,520,160,1,this.t);}
    else if(this.ph==='deduce'){c.fillStyle='rgba(20,10,40,.5)';c.fillRect(-400,0,W+800,H);c.fillStyle='#fff';c.font=`800 30px ${FONT}`;c.textAlign='center';c.fillText('はんにんは だれ？',W/2,H*.2);
      this.found.forEach((q,i)=>{const x=150+i*150;c.fillStyle='#fff6dc';circ(c,x,H*.3,36);drawClue(c,q.k,x,H*.3,1.1);});
      cs.sus.forEach(([k],i)=>{const x=110+i*190,y=H*.62;const sh=this.wrong===i&&this.t<.6?Math.sin(this.t*40)*6:0;c.fillStyle='#fff';rr(c,x-85+sh,y-150,170,220,20);c.fill();c.strokeStyle='#ffb3d6';c.lineWidth=5;c.stroke();drawSuspect(c,k,x+sh,y+50,.95,this.t);});
      drawNyan(c,520,H-100,1,this.t);}
    else if(this.ph==='reveal'){const k=cs.sus.find(s=>s[1])[0];drawSuspect(c,k,W/2,H*.62,1.4,this.t,{sad:1});const vs=clamp(this.t-1.2,0,1);if(vs>0){drawVillain(c,W/2,H*.25,1.5*vs,this.t);c.fillStyle=`rgba(90,20,120,${.3*vs})`;c.fillRect(-400,0,W+800,H);}
      if(this.t>2.8){const k2=clamp((this.t-2.8)/1,0,1);drawMonster(c,cs.mon,W/2,H*.45,.4+k2*.6,this.t,{});}}
    else if(this.ph==='henshin0'){c.fillStyle='rgba(40,10,60,.6)';c.fillRect(-400,0,W+800,H);drawMonster(c,cs.mon,W/2,H*.3,.7,this.t,{});drawFuka(c,W/2,H*.86,{outfit:outfit(),t:this.t,sc:3.6,hold:1});
      c.save();c.translate(W/2,H*.62);const p=1+Math.sin(T*6)*.08;c.scale(p,p);c.fillStyle='rgba(255,140,200,.4)';circ(c,0,0,80);c.fillStyle=gfill(c,-10,-10,60,'#ff5fa2');heartP(c,0,4,50);c.fill();c.strokeStyle='#ffd23a';c.lineWidth=8;c.stroke();c.fillStyle='#fff';star(c,0,0,18,8);c.fill();c.restore();drawNyan(c,480,H*.4,1.1,this.t);}
    else if(this.ph==='henshin'){const t=this.t;const g=c.createRadialGradient(W/2,H/2,20,W/2,H/2,H);g.addColorStop(0,'#fff0f8');g.addColorStop(.5,'#ff9ac8');g.addColorStop(1,'#b86af0');c.fillStyle=g;c.fillRect(-400,0,W+800,H);
      c.save();c.translate(W/2,H*.5);c.rotate(t);for(let i=0;i<16;i++){c.fillStyle=i%2?'rgba(255,255,255,.35)':'rgba(255,230,120,.3)';c.beginPath();c.moveTo(0,0);c.arc(0,0,H,i/16*TAU,(i+.5)/16*TAU);c.closePath();c.fill();}c.restore();
      for(let i=0;i<12;i++){const a=t*3+i/12*TAU;c.fillStyle=i%2?'#fff':'#ffd23a';const px=W/2+Math.cos(a)*200,py=H*.5+Math.sin(a)*120;if(i%3)heartP(c,px,py,10);else star(c,px,py,12,5);c.fill();}
      const before=t<1.6;drawFuka(c,W/2,H*.72,{outfit:before?outfit():MAGIC_OUTFIT,t:T,sc:6.5,dir:before?[0,2,3,1][Math.floor(t*8)%4]:0,cheer:!before,item:before?null:'wand'});
      if(t>1.3&&t<1.9){c.fillStyle=`rgba(255,255,255,${1-Math.abs(t-1.6)/.3})`;c.fillRect(-400,0,W+800,H);}
      if(!before){titleText(c,'マジカルたんてい',W/2,H*.13,40,'#ff3d8a');titleText(c,'ピンクハート！',W/2,H*.13+56,46,'#ff5fa2');}}
    else if(this.ph==='battle'||this.ph==='beam'||this.ph==='finale'){const m=this.mon;c.fillStyle='rgba(40,10,60,.35)';c.fillRect(-400,0,W+800,H);
      if(this.ph!=='finale')drawMonster(c,cs.mon,W/2+(m.shake>0?Math.sin(m.shake*60)*8:0),H*.34,.85,this.t,{flash:m.flash,warn:m.warn>0,pur:m.pur});
      else{drawThing(c,cs.item,W/2,H*.3,2.4);drawAnimal(c,cs.sus.find(s=>AN[s[0]])?cs.owner:cs.owner,W/2+170,H*.52,1,{t:this.t,happy:1});drawVillain(c,W/2-150,H*.22-this.t*30,1,this.t,'sad');}
      for(const s of this.shots){if(s.t<0)continue;c.save();c.translate(s.cx,s.cy);if(cs.mon.kind==='cake'){c.fillStyle='#fff0f6';circ(c,0,0,16);c.fillStyle='#ffb3d6';circ(c,4,-4,8);}else if(cs.mon.kind==='star'){c.fillStyle='#ffd23a';star(c,0,0,18,8,5,T*6);c.fill();}else drawClue(c,'gem',0,0,1.1);c.restore();}
      for(const s of this.stars){const x=lerp(this.fu.x+40,W/2,s.t),y=lerp(this.fu.y-70,H*.34,s.t)-Math.sin(s.t*Math.PI)*60;c.fillStyle='#fff';heartP(c,x,y,12);c.fill();c.fillStyle='#ff8cc0';heartP(c,x,y,8);c.fill();}
      const fu=this.fu;drawFuka(c,fu.x+(fu.hurt>0?Math.sin(fu.hurt*40)*6:0),fu.y,{outfit:MAGIC_OUTFIT,t:T,sc:3.6,fight:this.ph==='battle'&&!this.trace,cheer:this.ph!=='battle',item:'wand',oh:fu.hurt>0});
      if(this.shield>0){c.strokeStyle=`rgba(255,140,220,${.5+this.shield*.4})`;c.fillStyle='rgba(255,200,240,.25)';c.lineWidth=6;c.beginPath();c.arc(fu.x+10,fu.y-90,110,-Math.PI*.9,Math.PI*.1);c.fill();c.stroke();}
      drawRikki(c,480,H*.9,{sc:2.4,t:T,clap:1});this.rkPos={x:480,y:H*.9,sc:2.4};c.fillStyle='#ffd23a';c.save();c.translate(505,H*.9-60);c.rotate(Math.sin(T*8)*.5);rr(c,-4,-30,8,34,4);c.fill();c.restore();
      if(this.ph==='battle'&&this.cmb>=3&&this.t-this.lastT<1){c.font=`${30+Math.min(this.cmb,10)*2}px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.lineWidth=8;c.strokeStyle='#fff';c.strokeText(this.cmb+' コンボ！',W/2+150,H*.2);c.fillStyle='#ff3d8a';c.fillText(this.cmb+' コンボ！',W/2+150,H*.2);}
      if(this.ph==='battle'){this.drawHud(c);drawBtn(c,90,H*.64,52,m.warn>0?'#ff4d6d':'#b86af0','check',m.warn>0);c.fillStyle='#fff';c.font=`800 20px ${FONT}`;c.textAlign='center';c.fillText('まもる',90,H*.64+72);
        if(this.trace){const tr2=this.trace;c.fillStyle='rgba(255,255,255,.2)';c.fillRect(-400,0,W+800,H);c.lineWidth=10;c.strokeStyle='rgba(255,255,255,.7)';c.setLineDash([12,12]);c.beginPath();tr2.pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();c.setLineDash([]);
          c.strokeStyle='#ff3d8a';c.lineWidth=14;c.beginPath();tr2.pts.slice(0,tr2.i).forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();const nx=tr2.pts[tr2.i];if(nx){c.fillStyle='#ffd23a';star(c,nx.x,nx.y,18+Math.sin(T*8)*4,8);c.fill();}}}
      if(this.ph==='beam'){const k=clamp(this.t/1.2,0,1);c.strokeStyle='rgba(255,120,200,.8)';c.lineWidth=60*k;c.beginPath();c.moveTo(fu.x+30,fu.y-90);c.lineTo(W/2,H*.34);c.stroke();c.strokeStyle='#fff';c.lineWidth=24*k;c.stroke();for(let i=0;i<6;i++){c.fillStyle='#fff';heartP(c,lerp(fu.x,W/2,((T*2+i/6)%1)),lerp(fu.y-90,H*.34,((T*2+i/6)%1)),10);c.fill();}
        titleText(c,'ピンクハート・シャワー！',W/2,H*.6,34,'#ff3d8a');}}
    if(['reveal','battle','beam','finale'].includes(this.ph))drawNyan(c,540,H*.2,.9,this.t,this.ph==='finale'?'happy':'');},
  down(x,y){const cs=this.cs;
    if(this.ph==='menu'){for(let i=0;i<CASES.length;i++){const p=this.cardP(i);if(Math.abs(x-p.x)<240&&Math.abs(y-p.y)<52){sfx('pop');this.startCase(i);return;}}if(hitC(x,y,300,H-150,50)){sfx('boing');say('ニャンたん「ぼくは たんてい ようせい ニャンたん だニャ！」');}return;}
    if(this.ph==='intro'){if(hitC(x,y,W/2,H*.93,54)||this.t>1){this.ph='search';this.t=0;sfx('whoosh');say('むしめがねを うごかして、てがかりを 3つ さがそう！');}return;}
    if(this.ph==='search'){this.lens.held=true;this.lens.x=x;this.lens.y=y;return;}
    if(this.ph==='deduce'){cs.sus.forEach(([k,ok],i)=>{const cx=110+i*190;if(Math.abs(x-cx)<85&&y>H*.62-150&&y<H*.62+70){if(ok){this.ph='reveal';this.t=0;sfx('fanfare');say(`はんにんは きみだ！ ${cs.culprit}`);setTimeout(()=>{if(scene===this&&this.ph==='reveal'){sfx('boom');say('？？？「ふっふっふ… まほうで モンスターに したのは この かいとう クロニャンさまニャ！」');}},1600);}else{this.wrong=i;this.t=0;sfx('no');say('ちがうみたい… てがかりを よく みてね');}}});return;}
    if(this.ph==='henshin0'){if(hitC(x,y,W/2,H*.62,90)){this.ph='henshin';this.t=0;sfx('henshin');for(let i=0;i<8;i++)tone(600+i*120,.2,'triangle',.15,i*.1);setTimeout(()=>say('マジカル チェンジ！ まじかる たんてい ピンクハート！'),300);}return;}
    if(this.ph==='battle'){if(this.trace){this.tracing=true;this.tr(x,y);return;}
      if(hitC(x,y,90,H*.64,64)){this.shield=1.3;sfx('shield');ring(90,H*.64,'#ffb3e8');return;}
      if(Math.abs(x-W/2)<170&&Math.abs(y-H*.34)<160){this.cmb=(this.t-(this.lastT??-9)<1)?(this.cmb||0)+1:1;this.lastT=this.t;this.maxC=Math.max(this.maxC||0,this.cmb);this.stars.push({t:0,p:this.cmb});sfx('spark');if(this.cmb===10)say('10 コンボ！ すごい！');return;}}},
  tr(x,y){const t2=this.trace;const p=t2.pts[t2.i];if(p&&Math.hypot(x-p.x,y-p.y)<60){t2.i++;sfx('tick');if(t2.i>=t2.pts.length){this.trace=null;this.tracing=false;this.ph='beam';this.t=0;sfx('boom');setTimeout(()=>sfx('fanfare'),900);}}},
  move(x,y){if(this.ph==='search'&&this.lens.held){this.lens.x=x;this.lens.y=y;}if(this.ph==='battle'&&this.tracing)this.tr(x,y);},
  up(){this.lens.held=false;this.tracing=false;},
  hint(){if(this.ph==='menu'){const i=CASES.map((_,i)=>i).find(i=>!(SAVE.det||[]).includes(i))??0;const p=this.cardP(i);return{x:p.x,y:p.y};}
    if(this.ph==='search'){const q=this.clues.find(q=>!q.got);return q?{x:this.lens.x,y:this.lens.y,x2:q.x,y2:q.y+80}:null;}
    if(this.ph==='deduce'){const i=this.cs.sus.findIndex(s=>s[1]);return{x:110+i*190,y:H*.55};}
    if(this.ph==='henshin0')return{x:W/2,y:H*.62};if(this.ph==='battle'){if(this.trace){const p=this.trace.pts[this.trace.i];return p?{x:p.x,y:p.y}:null;}return this.mon.warn>0?{x:90,y:H*.64}:{x:W/2,y:H*.34};}return null;},
  hintText(){return{menu:'じけんを タッチしてね',search:'むしめがねを うごかして さがしてね',deduce:'てがかりに あう どうぶつを タッチ',henshin0:'ハートを タッチして へんしん！',battle:this.trace?'ハートを なぞって！':'モンスターを タッチ！ あかくなったら まもる！'}[this.ph]||'';}};

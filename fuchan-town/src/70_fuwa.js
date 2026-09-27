// ================= ATTRACTION: ふわふわタウン (original pastel mascot friends) =================
const FRIENDS=[
  {id:'miru',name:'ミルル',kind:'bunny',col:'#ffffff',acc:'#ff8cc0',line:'うさぎの ミルルだよ！',snd:'ぴょん'},
  {id:'purin',name:'プリン',kind:'puppy',col:'#fff0b0',acc:'#8a5a3a',line:'プリンだワン！',snd:'わん'},
  {id:'pen',name:'ペンペン',kind:'penguin',col:'#9ad0ff',acc:'#ff9a3a',line:'ペンペンだペン！',snd:'ぺん'},
  {id:'moko',name:'モコ',kind:'sheep',col:'#ece2ff',acc:'#fff6e6',line:'ふわふわ モコだメェ',snd:'めぇ'},
  {id:'kuma',name:'クマロン',kind:'bear',col:'#c8906a',acc:'#ff5f6f',line:'クマロンだクマ！',snd:'くま'}];
const FR=Object.fromEntries(FRIENDS.map(f=>[f.id,f]));
const FW_HEAD=[['none','なし'],['bow','リボン'],['flower','はなかんむり'],['beret','ベレーぼう'],['party','パーティーぼう'],['crown','かんむり']];
const FW_NECK=[['none','なし'],['scarf','マフラー'],['bell','すず'],['ribbon','むねリボン']];
const FW_COLS=['#ff8cc0','#ffd23a','#5aa8ff','#6cd08a','#b48cff','#ff6f5f'];
const FURN=[['bed','ベッド',0],['rug','ラグ',0],['lamp','ライト',0],['table','テーブル',20],['chair','いす',15],['plant','うえき',15],['shelf','ほんだな',30],['sofa','ソファ',40],['teddy','ぬいぐるみ',25],['picture','え',20],['toybox','おもちゃばこ',30],['balloonF','ふうせん',10],['clock','とけい',25],['aquarium','すいそう',50]];
const FWS={get(){if(!SAVE.fw)SAVE.fw={coins:30,day:1,time:0,hearts:{},wishes:[],owned:['bed','rug','lamp'],room:[],wear:{},greet:{},boughtWear:['bow','none','scarf']};const f=SAVE.fw;for(const k of FRIENDS)if(f.hearts[k.id]==null)f.hearts[k.id]=0;if(!f.boughtWear)f.boughtWear=['bow','none','scarf'];return f;}};
function drawFriend(c,f,x,y,s,o={}){const t=o.t??T,W2=o.wear||{};c.save();c.translate(x,y);c.scale(s,s);c.lineJoin='round';c.lineCap='round';const L='#5a4046';c.strokeStyle=L;c.lineWidth=2.6;
  const hop=o.hop>0?Math.sin(o.hop*Math.PI)*16:0,bob=o.dance?Math.abs(Math.sin(t*7))*5:o.walk?Math.abs(Math.sin(t*9))*3:Math.sin(t*2)*1;c.fillStyle='rgba(80,50,80,.18)';ell(c,0,0,26,6);c.translate(0,-bob-hop);if(o.dance)c.rotate(Math.sin(t*5)*.1);if(o.flip)c.scale(-1,1);
  const col=f.col,fl=(x2,y2,r)=>gfill(c,x2,y2,r,col,.25,-.12);
  // feet & body
  c.fillStyle=fl(0,-10,20);for(const sd of[-1,1]){c.beginPath();c.ellipse(sd*9,-3,8,5,0,0,TAU);c.fill();c.stroke();}
  if(f.kind==='penguin'){c.fillStyle='#ffb03a';for(const sd of[-1,1]){c.beginPath();c.ellipse(sd*9,-2,8,4,0,0,TAU);c.fill();c.stroke();}c.fillStyle=fl(0,-16,20);}
  c.beginPath();c.ellipse(0,-17,17,15,0,0,TAU);c.fill();c.stroke();
  if(f.kind==='penguin'||f.kind==='bear'){c.fillStyle=f.kind==='penguin'?'#fff':'#f0d0b0';ell(c,0,-15,10,10);}
  if(f.kind==='bear'){c.fillStyle='#ffd23a';star(c,0,-15,5,2.2);c.fill();}
  const aw=o.wave?Math.sin(t*10)*.6:0;c.fillStyle=fl(0,-20,10);for(const sd of[-1,1]){c.save();c.translate(sd*15,-22);c.rotate(sd*(.6+(sd>0?aw:0))+(o.dance?Math.sin(t*8)*sd*.5:0));c.beginPath();c.ellipse(0,6,5,9,0,0,TAU);c.fill();c.stroke();c.restore();}
  // neck wear
  const nc=W2.col||f.acc;if(W2.neck==='scarf'){c.fillStyle=nc;rr(c,-15,-33,30,8,4);c.fill();c.stroke();rr(c,6,-30,7,14,3);c.fill();c.stroke();}
  else if(W2.neck==='bell'){c.fillStyle='#ff6f91';rr(c,-13,-32,26,4,2);c.fill();c.fillStyle='#ffd23a';circ(c,0,-26,5);c.stroke();}
  else if(W2.neck==='ribbon'){bow(c,0,-30,5,nc);}
  // ears behind head
  const HY=-58;
  if(f.kind==='bunny'){for(const sd of[-1,1]){c.save();c.translate(sd*12,HY-24);c.rotate(sd*.14+Math.sin(t*3+sd)*.04);c.fillStyle=fl(0,-12,22);c.beginPath();c.ellipse(0,-12,9,22,0,0,TAU);c.fill();c.stroke();c.fillStyle='#ffd6e6';ell(c,0,-12,4.5,15);c.restore();}}
  if(f.kind==='bear'){c.fillStyle=fl(0,HY-26,12);for(const sd of[-1,1]){c.beginPath();c.arc(sd*26,HY-20,10,0,TAU);c.fill();c.stroke();c.fillStyle='#f0d0b0';circ(c,sd*26,HY-20,5);c.fillStyle=fl(0,HY-26,12);}}
  // head
  if(f.kind==='sheep'){c.fillStyle='#fffaf0';for(let i=0;i<12;i++){const a=i/12*TAU;c.beginPath();c.arc(Math.cos(a)*32,HY+Math.sin(a)*25,11,0,TAU);c.fill();c.stroke();}c.fillStyle=fl(0,HY,34);c.beginPath();c.ellipse(0,HY+3,27,21,0,0,TAU);c.fill();c.stroke();c.fillStyle='#fffaf0';for(let i=-2;i<=2;i++)circ(c,i*9,HY-17,7);}
  else{c.fillStyle=fl(-6,HY-8,40);c.beginPath();c.ellipse(0,HY,36,29,0,0,TAU);c.fill();c.stroke();}
  if(f.kind==='penguin'){c.fillStyle='#fff';c.beginPath();c.ellipse(0,HY+6,26,19,0,0,TAU);c.fill();}
  if(f.kind==='puppy'){c.fillStyle=f.acc;for(const sd of[-1,1]){c.save();c.translate(sd*32,HY-4);c.rotate(sd*-.3);c.beginPath();c.ellipse(0,10,10,20,0,0,TAU);c.fill();c.stroke();c.restore();}}
  // face (dot eyes)
  const blink=((t*1.1+x*.01)%3.3)>3.18,happy=o.happy||o.dance;const ey=HY+4;
  c.fillStyle='#3a2a2e';for(const sd of[-1,1]){if(happy){c.lineWidth=3;c.beginPath();c.arc(sd*13,ey+2,4,Math.PI*1.15,Math.PI*1.85);c.stroke();c.lineWidth=2.6;}else if(blink){c.fillRect(sd*13-3.5,ey,7,2.2);}else{ell(c,sd*13,ey,3.2,4.4);c.fillStyle='#fff';circ(c,sd*13-1,ey-1.6,1.2);c.fillStyle='#3a2a2e';}}
  if(f.kind==='penguin'){c.fillStyle='#ffb03a';c.beginPath();c.moveTo(-6,ey+8);c.lineTo(6,ey+8);c.lineTo(0,ey+15);c.closePath();c.fill();c.stroke();}
  else if(f.kind==='bunny'){c.fillStyle='#ff8cb0';ell(c,0,ey+8,3,2.2);}
  else{c.fillStyle='#5a3a3a';ell(c,0,ey+8,4,3);}
  if(happy&&f.kind!=='penguin'){c.fillStyle='#e0506a';c.beginPath();c.arc(0,ey+12,4,0,Math.PI);c.closePath();c.fill();}
  c.fillStyle='rgba(255,120,150,.5)';ell(c,-22,ey+8,6,3.6);ell(c,22,ey+8,6,3.6);
  // signature accessory
  if(f.kind==='bunny')bow(c,16,HY-30,6,f.acc);
  if(f.kind==='puppy'&&!W2.head){c.fillStyle='#8a5a3a';c.beginPath();c.ellipse(-4,HY-26,18,7,-.2,0,TAU);c.fill();c.stroke();circ(c,-4,HY-32,3);}
  if(f.kind==='penguin'){c.fillStyle='#fff';c.beginPath();c.moveTo(-14,-32);c.lineTo(14,-32);c.lineTo(0,-22);c.closePath();c.fill();c.stroke();c.fillStyle='#3a78e8';c.fillRect(-14,-33,28,3);}
  if(f.kind==='bear'&&!W2.neck){c.fillStyle=f.acc;rr(c,-15,-33,30,7,3);c.fill();c.stroke();}
  // head wear
  const hc=W2.col||'#ff8cc0',hw=W2.head;const top=HY-(f.kind==='bunny'?26:27);
  if(hw==='bow')bow(c,-16,top+2,6,hc);
  else if(hw==='flower'){for(let i=-3;i<=3;i++){c.fillStyle=[hc,'#fff','#ffd23a'][(i+3)%3];for(let k=0;k<5;k++){const a=k/5*TAU;circ(c,i*9+Math.cos(a)*3,top+2+Math.abs(i)*2+Math.sin(a)*3,2.6);}}}
  else if(hw==='beret'){c.fillStyle=hc;c.beginPath();c.ellipse(4,top-2,22,8,-.15,0,TAU);c.fill();c.stroke();circ(c,4,top-9,3);}
  else if(hw==='party'){c.fillStyle=hc;c.beginPath();c.moveTo(-12,top+4);c.lineTo(0,top-30);c.lineTo(12,top+4);c.closePath();c.fill();c.stroke();c.fillStyle='#fff';circ(c,0,top-30,4);for(let i=0;i<3;i++)circ(c,-4+i*4,top-6-i*8,2);}
  else if(hw==='crown'){c.fillStyle='#ffd23a';c.beginPath();c.moveTo(-14,top+4);c.lineTo(-16,top-12);c.lineTo(-7,top-4);c.lineTo(0,top-16);c.lineTo(7,top-4);c.lineTo(16,top-12);c.lineTo(14,top+4);c.closePath();c.fill();c.stroke();}
  c.restore();}
function drawFurn(c,k,x,y,s){c.save();c.translate(x,y);c.scale(s,s);c.lineJoin='round';c.strokeStyle='#6a4a4a';c.lineWidth=2.5;const G=(col)=>gfill(c,0,-30,60,col,.2,-.12);
  switch(k){
    case'bed':c.fillStyle=G('#ffb3d6');rr(c,-70,-60,140,60,12);c.fill();c.stroke();c.fillStyle='#fff';rr(c,-62,-54,40,22,10);c.fill();c.stroke();c.fillStyle=G('#ff8cc0');rr(c,-20,-50,86,44,10);c.fill();c.stroke();c.fillStyle='#c8905a';rr(c,-74,-86,14,86,5);c.fill();c.stroke();break;
    case'rug':c.fillStyle='rgba(184,140,255,.55)';ell(c,0,0,90,30);c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=4;c.beginPath();c.ellipse(0,0,74,22,0,0,TAU);c.stroke();break;
    case'lamp':c.fillStyle='#c8a0e8';c.fillRect(-3,-70,6,70);ell(c,0,0,16,5);c.fillStyle=G('#fff2a8');c.beginPath();c.moveTo(-20,-70);c.lineTo(20,-70);c.lineTo(12,-96);c.lineTo(-12,-96);c.closePath();c.fill();c.stroke();c.fillStyle='rgba(255,240,160,.25)';circ(c,0,-76,40);break;
    case'table':c.fillStyle=G('#e0a870');rr(c,-50,-50,100,14,6);c.fill();c.stroke();c.fillStyle='#c8905a';c.fillRect(-42,-36,8,36);c.fillRect(34,-36,8,36);drawItem(c,'cake',0,-64,.8);break;
    case'chair':c.fillStyle=G('#ffd84a');rr(c,-22,-80,44,40,10);c.fill();c.stroke();rr(c,-24,-44,48,12,5);c.fill();c.stroke();c.fillStyle='#c8905a';c.fillRect(-20,-32,6,32);c.fillRect(14,-32,6,32);break;
    case'plant':c.fillStyle=G('#ff9a5c');rr(c,-18,-30,36,30,[4,4,10,10]);c.fill();c.stroke();c.fillStyle=G('#6cd08a');for(const [a,b,r] of [[0,-54,20],[-16,-44,14],[16,-44,14]]){circ(c,a,b,r);}c.stroke();c.fillStyle='#ff8cc0';circ(c,6,-62,5);break;
    case'shelf':c.fillStyle=G('#c8905a');rr(c,-44,-120,88,120,6);c.fill();c.stroke();for(let i=0;i<3;i++){c.fillStyle='#a8703a';c.fillRect(-40,-84+i*38,80,5);['#ff6f91','#5aa8ff','#ffd23a','#6cd08a'].forEach((cc,j)=>{c.fillStyle=cc;c.fillRect(-34+j*16,-114+i*38,12,28);});}break;
    case'sofa':c.fillStyle=G('#b48cff');rr(c,-70,-66,140,40,16);c.fill();c.stroke();rr(c,-74,-40,148,34,12);c.fill();c.stroke();c.fillStyle='#fff';heartP(c,-30,-48,7);c.fill();heartP(c,30,-48,7);c.fill();break;
    case'teddy':drawAnimal(c,'bear',0,0,.5,{t:0,happy:1});break;
    case'picture':c.fillStyle='#d8a04a';rr(c,-36,-60,72,60,6);c.fill();c.stroke();c.fillStyle='#bfe8ff';c.fillRect(-28,-52,56,44);c.fillStyle='#ffd23a';circ(c,12,-40,7);c.fillStyle='#6cd08a';c.beginPath();c.moveTo(-28,-8);c.lineTo(-6,-32);c.lineTo(14,-8);c.fill();break;
    case'toybox':c.fillStyle=G('#5aa8ff');rr(c,-40,-40,80,40,6);c.fill();c.stroke();c.fillStyle='#ffd23a';star(c,0,-20,10,4);c.fill();drawItem(c,'duck',-20,-48,.6);drawItem(c,'starcandy',18,-50,.5);break;
    case'balloonF':for(const [a,col] of [[-14,'#ff6f91'],[0,'#ffd23a'],[14,'#5aa8ff']]){c.strokeStyle='#8a7a9a';c.lineWidth=1.5;c.beginPath();c.moveTo(0,0);c.lineTo(a,-70);c.stroke();c.fillStyle=gfill(c,a,-86,16,col);c.beginPath();c.ellipse(a,-86,14,18,0,0,TAU);c.fill();}break;
    case'clock':c.fillStyle=G('#ff8cc0');circ(c,0,-40,26);c.stroke();c.fillStyle='#fff';circ(c,0,-40,20);c.strokeStyle='#5a4046';c.beginPath();c.moveTo(0,-40);c.lineTo(0,-54);c.moveTo(0,-40);c.lineTo(10,-40);c.stroke();break;
    case'aquarium':c.fillStyle='rgba(150,220,255,.7)';rr(c,-50,-70,100,70,8);c.fill();c.stroke();c.fillStyle='#f8e4b0';c.fillRect(-48,-12,96,10);c.save();c.translate(-10+Math.sin(T)*20,-38);c.scale(.6,.6);drawItem(c,'goldfish',0,0,1);c.restore();break;
  }c.restore();}
const CAFE_BASE=[['pink','いちごミルク','strawberry milk','#ffb3d6'],['green','メロンソーダ','melon soda','#8ee07a'],['brown','ココア','cocoa','#a8704a']];
const CAFE_TOP=[['none','なし',''],['cream','ホイップ','whipped cream'],['cherry','さくらんぼ','cherry']];
const CAFE_SIDE=[['none','なし',''],['cookie','クッキー','cookie'],['cake','ケーキ','cake']];
function drawDrink(c,d,x,y,s){c.save();c.translate(x,y);c.scale(s,s);c.lineJoin='round';c.strokeStyle='#6a8ab8';c.lineWidth=3;
  if(d.base){const col=CAFE_BASE.find(b=>b[0]===d.base)[3];const lvl=d.fill??1;c.save();c.beginPath();c.moveTo(-30,-70);c.lineTo(30,-70);c.lineTo(22,0);c.lineTo(-22,0);c.closePath();c.clip();c.fillStyle=col;c.fillRect(-40,-70*lvl,80,80);if(d.base==='green'){c.fillStyle='rgba(255,255,255,.6)';for(let i=0;i<5;i++)circ(c,-12+i*6,-10-((T*30+i*13)%(60*lvl)),2.5);}c.restore();}
  c.fillStyle='rgba(220,240,255,.35)';c.beginPath();c.moveTo(-30,-70);c.lineTo(30,-70);c.lineTo(22,0);c.lineTo(-22,0);c.closePath();c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.5)';c.fillRect(-22,-62,5,54);
  c.strokeStyle='#ff8cc0';c.lineWidth=5;c.beginPath();c.moveTo(10,-66);c.lineTo(24,-104);c.stroke();
  if(d.top==='cream'){c.fillStyle='#fff';c.strokeStyle='#e0e0f0';c.lineWidth=2;for(const [a,b,r] of [[-16,-74,12],[0,-80,14],[16,-74,12],[0,-92,10]]){c.beginPath();c.arc(a,b,r,0,TAU);c.fill();c.stroke();}}
  if(d.top==='cherry')drawItem(c,'cherry',-6,d.top==='cream'?-104:-86,.8);
  c.restore();if(d.side&&d.side!=='none')drawItem(c,d.side==='cookie'?'heartcookie':'cake',x+60*s,y-16*s,.9*s);}
SCN.fuwa={bg:'#ffeef8',song:'fuwa',
  enter(){this.st=FWS.get();if(!this.st.garden)this.st.garden=[...Array(6)].map(()=>({st:0,col:'#ff8cc0',w:-1}));this.ph='town';this.lay();this.initTown();if(!this.st.wishes.length)this.newDay(true);this.rare=Math.random()<.2?{x:-60,y:H*.2,t:0}:null;say(this.rare?'ふわふわタウンへ ようこそ！ あれ？ にじいろの ことりが とんでいるよ！':'ふわふわタウンへ ようこそ！ おともだちと いっしょに あそぼう！');},
  lay(){},
  bld(){return[{id:'cafe',name:'カフェ',x:150,y:H*.3,col:'#ffb3d6',icon:'cake'},{id:'boutique',name:'ブティック',x:450,y:H*.3,col:'#c8b0ff',icon:'dress'},{id:'room',name:'おうち',x:300,y:H*.49,col:'#ffe08a',icon:'heart'},{id:'park',name:'こうえん',x:150,y:H*.68,col:'#9ee07a',icon:'balloon'},{id:'shop',name:'ざっかや',x:450,y:H*.68,col:'#8ad8ff',icon:'coin'},{id:'garden',name:'はなばたけ',x:470,y:H*.88,col:'#ffb0d8',icon:'flower'}];},
  spot(i){const S=[[300,.32],[150,.43],[450,.43],[300,.64],[300,.8],[150,.78],[450,.77]];const q=S[i??Math.floor(Math.random()*S.length)];return{x:q[0]+rand(-20,20),y:H*q[1]+rand(-10,10)};},
  initTown(){this.walkers=FRIENDS.map((f,i)=>({f,x:this.spot(i).x,y:this.spot(i).y,tx:0,ty:0,wait:rand(0,2),hop:0}));this.walkers.forEach(w=>{w.tx=w.x;w.ty=w.y;});},
  newDay(first){const s=this.st;if(!first){s.day++;s.time=0;}s.greet={};const types=['drink','dress','play','visit'];s.wishes=shuffle(FRIENDS).slice(0,3).map((f,i)=>{const ty=types[(i+s.day)%4];const w={id:f.id,type:ty,done:false};if(ty==='drink')w.order=this.randOrder();if(ty==='dress')w.item=pick(['bow','flower','beret','party','crown']);return w;});save();},
  randOrder(){return{base:pick(CAFE_BASE)[0],top:pick(CAFE_TOP)[0],side:pick(CAFE_SIDE)[0]};},
  advance(){const s=this.st;s.time++;if(s.time>=3){this.newDay();say(`よるに なったよ。 おやすみ〜。 ${s.day}にちめの あさ！ あたらしい おねがいが あるよ`);}save();},
  wishOf(id){return this.st.wishes.find(w=>w.id===id&&!w.done);},
  doneWish(id,type){const w=this.st.wishes.find(w=>w.id===id&&w.type===type&&!w.done);if(!w)return false;w.done=true;this.st.hearts[id]+=2;this.st.coins+=20;sfx('fanfare');say(`${FR[id].name}の おねがい かなえたね！ ハート＋2`);const h=this.st.hearts[id];if(h>=6&&!(this.st.gift||{})[id]){this.st.gift=this.st.gift||{};this.st.gift[id]=1;this.st.coins+=50;setTimeout(()=>say(`${FR[id].name}から プレゼント！ コイン 50まい！`),2200);}save();return true;},
  wishIcon(c,w,x,y){c.fillStyle='#fff';c.strokeStyle='#ffb3d6';c.lineWidth=3;c.beginPath();c.arc(x,y,24,0,TAU);c.fill();c.stroke();circ(c,x-18,y+22,5);
    if(w.type==='drink')drawDrink(c,w.order,x-4,y+14,.3);else if(w.type==='dress'){const f={};this.drawWearIcon(c,w.item,x,y,.8);}else if(w.type==='play')drawItem(c,'balloon'in SPR?'starcandy':'starcandy',x,y,.7);else{c.fillStyle='#ff5fa2';heartP(c,x,y,12);c.fill();}},
  drawWearIcon(c,k,x,y,s){c.save();c.translate(x,y);c.scale(s,s);c.strokeStyle='#5a4046';c.lineWidth=2;const hc='#ff8cc0';
    if(k==='bow')bow(c,0,0,9,hc);else if(k==='flower'){for(let i=-2;i<=2;i++){c.fillStyle=[hc,'#fff','#ffd23a'][(i+2)%3];for(let q=0;q<5;q++){const a=q/5*TAU;circ(c,i*9+Math.cos(a)*3,Math.sin(a)*3,2.8);}}}else if(k==='beret'){c.fillStyle=hc;c.beginPath();c.ellipse(0,0,20,8,0,0,TAU);c.fill();c.stroke();}
    else if(k==='party'){c.fillStyle=hc;c.beginPath();c.moveTo(-12,12);c.lineTo(0,-20);c.lineTo(12,12);c.closePath();c.fill();c.stroke();}else if(k==='crown'){c.fillStyle='#ffd23a';c.beginPath();c.moveTo(-14,8);c.lineTo(-16,-10);c.lineTo(-7,-2);c.lineTo(0,-14);c.lineTo(7,-2);c.lineTo(16,-10);c.lineTo(14,8);c.closePath();c.fill();c.stroke();}
    else if(k==='scarf'){c.fillStyle=hc;rr(c,-18,-5,36,10,5);c.fill();c.stroke();}else if(k==='bell'){c.fillStyle='#ffd23a';circ(c,0,0,9);c.stroke();}else if(k==='ribbon')bow(c,0,0,8,'#5aa8ff');else{c.strokeStyle='#ccc';c.lineWidth=4;c.beginPath();c.moveTo(-10,-10);c.lineTo(10,10);c.moveTo(10,-10);c.lineTo(-10,10);c.stroke();}c.restore();},
  hud(c){const s=this.st;c.fillStyle='rgba(255,255,255,.9)';rr(c,W-236,100,220,44,22);c.fill();c.strokeStyle='#ffd23a';c.lineWidth=3;c.stroke();drawItem(c,'coin',W-212,122,.8);c.fillStyle='#8a5a2a';c.font=`800 22px ${FONT}`;c.textAlign='left';c.textBaseline='middle';c.fillText(s.coins,W-190,123);
    const ic=['☀','🌤','🌙'][s.time]||'☀';c.fillText(`${s.day}にちめ ${ic}`,W-128,123);},
  slot(){return this.st.day*10+this.st.time;},
  gP(i){return{x:120+(i%3)*180,y:H*.42+Math.floor(i/3)*H*.2};},
  drawFlower(c,g,x,y){const sw=Math.sin(T*2+x)*.08;c.save();c.translate(x,y);c.rotate(sw);
    if(g.st===1){c.fillStyle='#6a4a2a';circ(c,-8,-4,4);circ(c,6,-6,4);circ(c,0,2,4);}
    else if(g.st>=2){const h=g.st===2?30:g.st===3?60:80;c.strokeStyle='#4cae4a';c.lineWidth=6;c.beginPath();c.moveTo(0,0);c.lineTo(0,-h);c.stroke();c.fillStyle='#6cd08a';for(const sd of[-1,1]){c.beginPath();c.ellipse(sd*14,-h*.4,14,7,sd*.5,0,TAU);c.fill();}
      if(g.st===3){c.fillStyle=g.col;c.beginPath();c.ellipse(0,-h-8,12,18,0,0,TAU);c.fill();}
      if(g.st===4){const p=1+Math.sin(T*3+x)*.05;c.translate(0,-h-10);c.scale(p,p);c.fillStyle=g.col;for(let i=0;i<6;i++){const a=i/6*TAU+T*.3;c.beginPath();c.ellipse(Math.cos(a)*18,Math.sin(a)*18,15,11,a,0,TAU);c.fill();}c.fillStyle='#ffd23a';circ(c,0,0,12);c.fillStyle='#fff';circ(c,-4,-4,3);}}
    c.restore();},
  drawGarden(c){const s=this.st;skyBg(c,'#bfe9ff','#fff0f8',H*.3);c.fillStyle=vfill(c,H*.26,H,'#b8ec9a',.05,-.05);c.fillRect(-400,H*.26,W+800,H);c.fillStyle='#fff';for(let x=0;x<W;x+=40){rr(c,x+4,H*.26,14,70,6);c.fill();}c.fillRect(-10,H*.26+20,W+20,10);
    s.garden.forEach((g,i)=>{const p=this.gP(i);c.fillStyle='#8a5a3a';ell(c,p.x,p.y+10,74,26);c.fillStyle='#a8703a';ell(c,p.x,p.y+4,68,22);if(g.w===this.slot()&&g.st>0&&g.st<4){c.fillStyle='rgba(90,160,255,.35)';ell(c,p.x,p.y+6,60,18);}this.drawFlower(c,g,p.x,p.y);
      if(g.st===4&&Math.sin(T*4+i)>.6){c.fillStyle='#fff';star(c,p.x+30,p.y-100,7,3,4);c.fill();}
      const lab=g.st===0?'たね':g.st===4?'つむ':g.w===this.slot()?'あとでね':'おみず';c.fillStyle=g.st===4?'#ff5fa2':g.st===0?'#8a5a3a':g.w===this.slot()?'#aaa':'#3a8ad8';c.font=`800 16px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(lab,p.x,p.y+50);});
    if(this.can){const k=this.can.t;const p=this.gP(this.can.i);c.save();c.translate(p.x+50,p.y-80);c.rotate(-.5*Math.min(1,k*3));c.fillStyle='#5aa8ff';rr(c,-26,-18,52,36,10);c.fill();c.strokeStyle='#3a88d8';c.lineWidth=5;c.beginPath();c.moveTo(-26,-6);c.lineTo(-52,-24);c.stroke();c.beginPath();c.arc(8,-24,12,Math.PI,TAU);c.stroke();c.restore();for(let i=0;i<4;i++){c.fillStyle='rgba(90,170,255,.8)';circ(c,p.x+rand(-14,14),p.y-50+((k*300+i*20)%60),3);}}
    c.fillStyle='#fff';rr(c,W-200,H*.3,180,50,25);c.fill();c.strokeStyle='#ffb0d8';c.lineWidth=3;c.stroke();c.fillStyle='#ff5fa2';c.font=`800 18px ${FONT}`;c.textAlign='center';c.fillText('はなたば '+(s.bq||0),W-110,H*.3+26);
    drawFuka(c,120,H-30,{outfit:outfit(),t:T,sc:2.4,happy:1,hold:this.picked>0});drawRikki(c,230,H-30,{sc:1.9,t:T});this.rkPos={x:230,y:H-30,sc:1.9};},
  gardenTap(x,y){const s=this.st;for(let i=0;i<6;i++){const p=this.gP(i),g=s.garden[i];if(Math.abs(x-p.x)<80&&y>p.y-130&&y<p.y+60){
      if(g.st===0){g.st=1;g.col=pick(['#ff8cc0','#ffd23a','#b48cff','#ff6f5f','#7ad8ff','#ffffff']);g.w=-1;sfx('pop');burst(p.x,p.y,8,'star');say('たねを うえたよ！ おみずを あげてね');}
      else if(g.st===4){g.st=0;s.bq=(s.bq||0)+1;s.coins+=10;this.picked++;sfx('fanfare');burst(p.x,p.y-90,20,'heart');rkCheer();say(pick(['きれいな おはな！ コイン 10まい！','はなたばに しよう！']));if(this.picked===2){setTimeout(()=>{if(scene===this&&this.ph==='garden'){this.advance();celebrate('fuwa');}},1500);}}
      else if(g.w===this.slot()){sfx('no');say('もう おみずを あげたよ。 また あとで あげようね');}
      else{g.w=this.slot();this.can={i,t:0};sfx('pour');setTimeout(()=>{if(scene===this){g.st=Math.min(4,g.st+1);sfx('spark');burst(p.x,p.y-40,10,'star');this.can=null;say(g.st===4?'わあ！ おはなが さいたよ！ タッチして つもう':g.st===3?'つぼみに なった！':'めが でたよ！');}},900);}
      save();return true;}}return false;},
  backBtn(c){drawBtn(c,56,170,36,'#b48cff','prev');},
  update(dt){const s=this.st;if(this.can)this.can.t+=dt;const R=this.rare;if(R&&!R.got){R.t+=dt;R.x=(R.t*90)%(W+120)-60;R.y=H*.18+Math.sin(R.t*2)*60;}
    if(this.ph==='town'){for(const w of this.walkers){if(w.hop>0)w.hop-=dt*2;if(w.wait>0){w.wait-=dt;continue;}const d=Math.hypot(w.tx-w.x,w.ty-w.y);if(d<4){w.wait=rand(1.5,4);{const sp=this.spot();w.tx=sp.x;w.ty=sp.y;}}else{w.x+=(w.tx-w.x)/d*50*dt;w.y+=(w.ty-w.y)/d*50*dt;w.flip=w.tx<w.x;}}}
    if(this.ph==='cafe'&&this.pour){this.pour.t+=dt;this.cup.fill=Math.min(1,this.pour.t/.8);if(this.pour.t>.8)this.pour=null;}
    if(this.ph==='cafe'&&this.react>0){this.react-=dt;if(this.react<=0)this.nextCustomer();}
    if(this.ph==='park'){this.sw.v+=-Math.sin(this.sw.a)*9*dt;this.sw.v*=Math.pow(.6,dt);this.sw.a+=this.sw.v*dt;for(let i=this.bubs.length-1;i>=0;i--){const b=this.bubs[i];b.y-=b.vy*dt;b.x+=Math.sin(T*2+b.p)*20*dt;if(b.y<100)this.bubs.splice(i,1);}
      if(this.blowing){this.blowT-=dt;if(this.blowT<=0){this.blowT=.12;this.bubs.push({x:470+rand(-10,10),y:H*.55,vy:rand(40,90),r:rand(10,24),p:rand(0,6)});}}
      for(const pf of this.parkF){if(pf.hop>0)pf.hop-=dt*2;const b=this.bubs.find(b=>Math.hypot(b.x-pf.x,b.y-(pf.y-80))<60);if(b&&Math.random()<dt*2){this.bubs.splice(this.bubs.indexOf(b),1);sfx('pop');pf.hop=1;burst(b.x,b.y,5,'heart');}}}
    if(this.photo>0){this.photo+=dt;if(this.photo>2.4&&this.photo<9){this.photo=9;this.advance();celebrate('fuwa');}}},
  draw(c){const s=this.st;const skyC=['#bfe9ff','#ffd8a8','#4a4a9a'][s.time]||'#bfe9ff';
    if(this.ph==='town'){skyBg(c,skyC,'#fff0f8',H*.3);c.fillStyle=vfill(c,H*.22,H,'#b8ec9a',.05,-.05);c.fillRect(-400,H*.22,W+800,H);if(s.time===2){c.fillStyle='rgba(40,30,90,.25)';c.fillRect(-400,0,W+800,H);c.fillStyle='#fff6b0';circ(c,90,80,26);}else sun(c,90,80,30,T*.3);
      c.strokeStyle='#fff3dc';c.lineWidth=40;c.lineCap='round';c.beginPath();c.moveTo(150,H*.3);c.lineTo(300,H*.49);c.lineTo(450,H*.3);c.moveTo(150,H*.68);c.lineTo(300,H*.49);c.lineTo(450,H*.68);c.moveTo(300,H*.49);c.lineTo(300,H*.9);c.stroke();flowers(c,0,W,H*.84,H-20,9);
      for(const b of this.bld()){c.save();c.translate(b.x,b.y);c.fillStyle='rgba(80,50,80,.15)';ell(c,0,70,90,14);c.fillStyle=vfill(c,-60,70,'#fffaf4',.05,-.05);rr(c,-80,-50,160,120,[20,20,6,6]);c.fill();c.strokeStyle=shade(b.col,-.2);c.lineWidth=4;c.stroke();
        c.fillStyle=vfill(c,-110,-40,b.col,.2,-.1);c.beginPath();c.ellipse(0,-50,98,54,0,Math.PI,TAU);c.fill();c.stroke();c.fillStyle='#fff';circ(c,0,-66,26);if(b.icon==='heart'){c.fillStyle='#ff5fa2';heartP(c,0,-64,14);c.fill();}else if(b.icon==='balloon'){c.fillStyle='#ff6f91';c.beginPath();c.ellipse(0,-70,12,15,0,0,TAU);c.fill();}else drawItem(c,b.icon,0,-66,.8);
        c.fillStyle=shade(b.col,-.15);rr(c,-20,20,40,50,[20,20,0,0]);c.fill();c.fillStyle='#bfe8ff';rr(c,-66,-24,36,30,8);c.fill();rr(c,30,-24,36,30,8);c.fill();c.fillStyle='#fff';rr(c,-60,44,120,0,0);c.font=`800 20px ${FONT}`;c.textAlign='center';c.textBaseline='middle';const tw=c.measureText(b.name).width+24;rr(c,-tw/2,-128,tw,30,15);c.fill();c.strokeStyle=b.col;c.lineWidth=3;c.stroke();c.fillStyle=shade(b.col,-.4);c.fillText(b.name,0,-113);c.restore();}
      const list=this.walkers.slice().sort((a,b)=>a.y-b.y);for(const w of list){drawFriend(c,w.f,w.x,w.y,.8,{t:T+w.x,walk:w.wait<=0,flip:w.flip,hop:w.hop,wear:s.wear[w.f.id],happy:w.hop>0});const wi=this.wishOf(w.f.id);if(wi)this.wishIcon(c,wi,w.x+36,w.y-110);
        c.fillStyle='#ff5fa2';c.font=`800 14px ${FONT}`;c.textAlign='center';c.fillText('♥'+s.hearts[w.f.id],w.x,w.y+18);}
      drawFuka(c,200,H*.95,{outfit:outfit(),t:T,sc:2.6,wave:1});drawRikki(c,300,H*.95,{sc:2,t:T});this.rkPos={x:300,y:H*.95,sc:2};
      const R=this.rare;if(R&&!R.got){c.save();c.translate(R.x,R.y);c.fillStyle='rgba(255,255,255,.5)';circ(c,0,0,40);const cols=['#ff6f91','#ffb03a','#ffe36a','#8ee07a','#5ac8ff','#b88aff'];cols.forEach((q,i)=>{c.fillStyle=q;c.beginPath();c.ellipse(-24-i*5,6+i*2,16,5,.4+i*.1,0,TAU);c.fill();});c.fillStyle=gfill(c,-4,-4,22,'#ff9ac8');ell(c,0,0,22,18);const fl=Math.sin(T*18)*.8;c.fillStyle='#ffe36a';c.beginPath();c.ellipse(-2,-10,16,8,-.6+fl,0,TAU);c.fill();c.fillStyle='#fff';circ(c,10,-4,5);c.fillStyle='#222';circ(c,11,-4,2.5);c.fillStyle='#ffb03a';c.beginPath();c.moveTo(20,0);c.lineTo(30,3);c.lineTo(20,6);c.fill();c.restore();if(Math.random()<.2)parts.push({x:R.x-20,y:R.y+rand(-6,6),vx:-40,vy:0,life:.6,t:0,kind:'star',col:pick(cols),r:5});}
      this.hud(c);return;}
    const back=()=>{this.hud(c);this.backBtn(c);};
    if(this.ph==='garden'){this.drawGarden(c);back();return;}
    if(this.ph==='cafe'){c.fillStyle='#ffe6f0';c.fillRect(-400,0,W+800,H);c.fillStyle='#ffd0e4';for(let x=0;x<W;x+=50)c.fillRect(x,0,25,H*.45);c.fillStyle=vfill(c,H*.45,H,'#e8b890',.05,-.1);c.fillRect(-400,H*.45,W+800,H);
      const cu=this.cust;if(cu){drawFriend(c,cu.f,300,H*.4,1.2,{t:T,happy:this.react>0&&this.good,wave:!this.react,wear:s.wear[cu.f.id]});c.fillStyle='#fff';c.strokeStyle='#ffb3d6';c.lineWidth=4;rr(c,360,H*.12,200,150,24);c.fill();c.stroke();drawDrink(c,cu.order,430,H*.12+130,.8);}
      c.fillStyle='#c8905a';rr(c,-20,H*.46,W+40,40,8);c.fill();drawDrink(c,this.cup,300,H*.62,1.3);
      const rows=[CAFE_BASE,CAFE_TOP,CAFE_SIDE];rows.forEach((row,ri)=>{row.forEach((o,i)=>{const p=this.cafeP(ri,i);const sel=this.cup[['base','top','side'][ri]]===o[0];c.fillStyle=sel?'#fff0f7':'#fff';circ(c,p.x,p.y,34);c.strokeStyle=sel?'#ff5fa2':'#eee';c.lineWidth=4;c.beginPath();c.arc(p.x,p.y,34,0,TAU);c.stroke();
        if(ri===0){c.fillStyle=o[3];circ(c,p.x,p.y,22);}else if(o[0]==='none'){c.strokeStyle='#ccc';c.beginPath();c.moveTo(p.x-12,p.y-12);c.lineTo(p.x+12,p.y+12);c.moveTo(p.x+12,p.y-12);c.lineTo(p.x-12,p.y+12);c.stroke();}else if(o[0]==='cream'){c.fillStyle='#fff';c.strokeStyle='#ddd';c.lineWidth=2;for(const [a,b] of [[-8,4],[8,4],[0,-6]]){c.beginPath();c.arc(p.x+a,p.y+b,9,0,TAU);c.fill();c.stroke();}}else drawItem(c,o[0]==='cookie'?'heartcookie':o[0],p.x,p.y,.8);});});
      drawBtn(c,520,H*.62,40,'#4cd08a','check',this.cup.base&&!this.react);c.fillStyle='#8a5a6a';c.font=`800 18px ${FONT}`;c.textAlign='center';c.fillText(`${this.served}/3`,520,H*.62+62);
      drawRikki(c,70,H*.6,{sc:1.8,t:T});this.rkPos={x:70,y:H*.6,sc:1.8};back();}
    else if(this.ph==='boutique'){c.fillStyle='#f4ecff';c.fillRect(-400,0,W+800,H);c.fillStyle='#ebe0ff';for(let x=-400;x<W+400;x+=50)for(let y=0;y<H;y+=50)if(((x+y)/50)%2===0)c.fillRect(x,y,50,50);
      FRIENDS.forEach((f,i)=>{const p={x:70+i*115,y:170};const sel=this.bf===f.id;c.fillStyle=sel?'#fff':'rgba(255,255,255,.6)';circ(c,p.x,p.y,42);c.strokeStyle=sel?'#b48cff':'#fff';c.lineWidth=5;c.beginPath();c.arc(p.x,p.y,42,0,TAU);c.stroke();c.save();c.beginPath();c.arc(p.x,p.y,40,0,TAU);c.clip();drawFriend(c,f,p.x,p.y+60,.62,{t:0,wear:s.wear[f.id]});c.restore();if(this.wishOf(f.id)&&this.wishOf(f.id).type==='dress'){c.fillStyle='#ff5fa2';heartP(c,p.x+30,p.y-30,9);c.fill();}});
      const f=FR[this.bf];c.fillStyle='#fff';rr(c,120,230,360,H*.5-40,30);c.fill();c.strokeStyle='#ffd23a';c.lineWidth=8;c.stroke();drawFriend(c,f,300,H*.5+160,2.7,{t:T,wear:s.wear[f.id],happy:this.pose>0,dance:this.pose>0});
      const wi=this.wishOf(f.id);if(wi&&wi.type==='dress'){c.fillStyle='#fff';rr(c,410,250,120,70,20);c.fill();c.strokeStyle='#ff8cc0';c.lineWidth=3;c.stroke();this.drawWearIcon(c,wi.item,450,285,1);c.fillStyle='#ff5fa2';c.font=`800 16px ${FONT}`;c.fillText('ほしい！',502,288);}
      tray(c,H-150,250);const W2=s.wear[f.id]||{};FW_HEAD.forEach((o,i)=>{const p={x:62+i*95,y:H-210};const sel=(W2.head||'none')===o[0];c.fillStyle=sel?'#fff0f7':'#fafafa';circ(c,p.x,p.y,38);c.strokeStyle=sel?'#ff5fa2':'#eee';c.lineWidth=4;c.beginPath();c.arc(p.x,p.y,38,0,TAU);c.stroke();const lk=o[0]!=='none'&&!s.boughtWear.includes(o[0])&&!(wi&&wi.item===o[0]);if(lk)c.globalAlpha=.3;this.drawWearIcon(c,o[0],p.x,p.y,1);c.globalAlpha=1;if(lk)drawItem(c,'coin',p.x+24,p.y+24,.55);});
      FW_NECK.forEach((o,i)=>{const p={x:62+i*95,y:H-110};const sel=(W2.neck||'none')===o[0];c.fillStyle=sel?'#fff0f7':'#fafafa';circ(c,p.x,p.y,38);c.strokeStyle=sel?'#ff5fa2':'#eee';c.lineWidth=4;c.beginPath();c.arc(p.x,p.y,38,0,TAU);c.stroke();const lk=o[0]!=='none'&&!s.boughtWear.includes(o[0])&&!(wi&&wi.item===o[0]);if(lk)c.globalAlpha=.3;this.drawWearIcon(c,o[0],p.x,p.y,1);c.globalAlpha=1;if(lk)drawItem(c,'coin',p.x+24,p.y+24,.55);});
      FW_COLS.forEach((col,i)=>{const p={x:452+(i%2)*56,y:H-110-Math.floor(i/2)*0+((i/2|0)-1)*0};});
      for(let i=0;i<4;i++){const p={x:440+(i%2)*60,y:H-128+Math.floor(i/2)*44};c.fillStyle=FW_COLS[i];circ(c,p.x,p.y,18);if((W2.col||'')===FW_COLS[i]){c.strokeStyle='#5a4046';c.lineWidth=3;c.beginPath();c.arc(p.x,p.y,21,0,TAU);c.stroke();}}
      drawBtn(c,530,H*.3,40,'#5aa8ff','camera',true);
      if(this.photo>0&&this.photo<9){const k=elastic(Math.min(1,this.photo*2));c.save();c.translate(W/2,H*.42);c.rotate(-.05);c.scale(k,k);c.fillStyle='#fff';rr(c,-160,-200,320,390,10);c.fill();c.fillStyle='#fff0f8';c.fillRect(-140,-180,280,280);c.save();c.beginPath();c.rect(-140,-180,280,280);c.clip();drawFriend(c,f,40,90,1.2,{t:T,wear:s.wear[f.id],happy:1});drawFuka(c,-70,95,{outfit:outfit(),t:T,sc:2.6,cheer:1});c.restore();c.fillStyle='#ff5fa2';c.font=`30px ${POP}`;c.textAlign='center';c.fillText('なかよし！',0,150);c.restore();}
      back();}
    else if(this.ph==='room'){c.fillStyle='#fff0e0';c.fillRect(-400,0,W+800,H*.55);c.fillStyle='rgba(255,180,200,.25)';for(let x=0;x<W;x+=40)c.fillRect(x,0,20,H*.55);c.fillStyle=vfill(c,H*.55,H,'#e8c090',.05,-.08);c.fillRect(-400,H*.55,W+800,H);c.fillStyle='#bfe8ff';rr(c,220,120,160,120,10);c.fill();c.strokeStyle='#fff';c.lineWidth=8;c.stroke();
      const items=s.room.slice().sort((a,b)=>(a.k==='rug'?-1e4:a.y)-(b.k==='rug'?-1e4:b.y));for(const it of items){if(this.drag&&this.drag.it===it)continue;drawFurn(c,it.k,it.x,it.y,it.s||1);}
      const vis=this.visitors||[];vis.forEach((id,i)=>drawFriend(c,FR[id],180+i*120,H*.8,.9,{t:T+i,happy:1,dance:this.party>0,wear:s.wear[id]}));
      drawFuka(c,90,H*.8,{outfit:outfit(),t:T,sc:2.4,happy:1,dance:this.party>0});drawRikki(c,520,H*.8,{sc:1.9,t:T,dance:this.party>0});this.rkPos={x:520,y:H*.8,sc:1.9};
      if(this.drag)drawFurn(c,this.drag.k,this.drag.x,this.drag.y,1.1);
      tray(c,H-80,120);const own=s.owned;c.save();c.beginPath();c.rect(20,H-140,W-40,120);c.clip();own.forEach((k,i)=>{const x=70+i*100-(this.rsc||0);c.save();c.translate(x,H-60);const sb=['shelf','bed','sofa','aquarium'].includes(k)?.4:.6;drawFurn(c,k,0,0,sb);c.restore();});c.restore();
      drawBtn(c,530,H*.3,40,'#4cd08a','check',s.room.length>=3);back();}
    else if(this.ph==='park'){skyBg(c,skyC,'#e8fff0',H*.6);c.fillStyle=vfill(c,H*.55,H,'#9ee07a',.05,-.08);c.fillRect(-400,H*.55,W+800,H);tree(c,540,H*.58,1.2);tree(c,60,H*.56,1,'#6cd07a');flowers(c,0,W,H*.8,H-20,4);
      const sx=200,sy=H*.25;c.strokeStyle='#c8905a';c.lineWidth=10;c.beginPath();c.moveTo(sx-110,H*.65);c.lineTo(sx-80,sy);c.lineTo(sx+80,sy);c.lineTo(sx+110,H*.65);c.stroke();
      const a=this.sw.a,L2=H*.28,px=sx+Math.sin(a)*L2,py=sy+Math.cos(a)*L2;c.strokeStyle='#8a7a9a';c.lineWidth=3;c.beginPath();c.moveTo(sx-24,sy);c.lineTo(px-24,py);c.moveTo(sx+24,sy);c.lineTo(px+24,py);c.stroke();c.fillStyle='#ff8cc0';rr(c,px-34,py-6,68,12,5);c.fill();
      if(this.swF)drawFriend(c,FR[this.swF],px,py,.8,{t:T,happy:Math.abs(this.sw.v)>1,wear:s.wear[this.swF]});
      for(const b of this.bubs){c.fillStyle='rgba(220,240,255,.45)';c.strokeStyle='rgba(150,200,255,.9)';c.lineWidth=2;c.beginPath();c.arc(b.x,b.y,b.r,0,TAU);c.fill();c.stroke();c.fillStyle='#fff';circ(c,b.x-b.r*.35,b.y-b.r*.35,b.r*.22);}
      for(const pf of this.parkF)drawFriend(c,FR[pf.id],pf.x,pf.y,.8,{t:T+pf.x,hop:pf.hop,happy:pf.hop>0,wear:s.wear[pf.id]});
      drawFuka(c,470,H*.8,{outfit:outfit({item:null}),t:T,sc:2.5,hold:1});c.save();c.translate(470,H*.55);c.strokeStyle='#ff8cc0';c.lineWidth=4;c.beginPath();c.arc(0,0,16,0,TAU);c.stroke();c.beginPath();c.moveTo(0,16);c.lineTo(0,60);c.stroke();c.restore();
      drawRikki(c,380,H*.86,{sc:1.8,t:T,clap:RK.clap});this.rkPos={x:380,y:H*.86,sc:1.8};
      c.fillStyle='#fff';rr(c,60,H-80,480,50,25);c.fill();c.fillStyle='#8a5a6a';c.font=`800 18px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(`ブランコを おして！ ${Math.min(10,this.push)}/10   シャボンだまは みぎを ながおし`,300,H-55);back();}
    else if(this.ph==='shop'){c.fillStyle='#e8f8ff';c.fillRect(-400,0,W+800,H);c.fillStyle='#d0f0ff';for(let x=0;x<W;x+=60)c.fillRect(x,0,30,H);titleText(c,'ざっかや',W/2,170,36,'#3a9ae8');
      const list=[...FURN.filter(f=>f[2]>0).map(f=>({t:'furn',k:f[0],n:f[1],p:f[2]})),...[['flower',30],['beret',30],['party',25],['crown',60],['bell',20],['ribbon',20]].map(([k,p])=>({t:'wear',k,n:([...FW_HEAD,...FW_NECK].find(q=>q[0]===k)||[])[1],p}))];this.slist=list;
      list.forEach((it,i)=>{const x=80+(i%4)*147,y=250+Math.floor(i/4)*((H-330)/5);const own=it.t==='furn'?s.owned.includes(it.k):s.boughtWear.includes(it.k);c.fillStyle=own?'#f0fff0':'#fff';rr(c,x-66,y-50,132,120,18);c.fill();c.strokeStyle=own?'#6cd08a':'#bfe0ff';c.lineWidth=3;c.stroke();
        if(it.t==='furn'){c.save();c.translate(x,y+26);drawFurn(c,it.k,0,0,['shelf','bed','sofa','aquarium'].includes(it.k)?.42:.55);c.restore();}else this.drawWearIcon(c,it.k,x,y,1.1);
        c.fillStyle=own?'#3aa860':'#8a5a2a';c.font=`800 16px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(own?'もってる':`🪙${it.p}`,x,y+56);});back();}},
  cafeP(ri,i){return{x:150+i*90,y:H*.72+ri*80};},
  nextCustomer(){if(this.served>=3){this.ph='town';sfx('fanfare');this.advance();celebrate('fuwa');return;}const wi=this.st.wishes.find(w=>w.type==='drink'&&!w.done&&!this.cq.includes(w.id));let f,order;if(wi&&!this.cq.includes(wi.id)){f=FR[wi.id];order=wi.order;}else{f=pick(FRIENDS);order=this.randOrder();}this.cq.push(f.id);this.cust={f,order};this.cup={base:null,top:'none',side:'none',fill:0};this.react=0;
    const b=CAFE_BASE.find(q=>q[0]===order.base);const tp=CAFE_TOP.find(q=>q[0]===order.top),sd=CAFE_SIDE.find(q=>q[0]===order.side);say(`${f.name}「${b[1]}${order.top!=='none'?'に '+tp[1]:''}${order.side!=='none'?'と '+sd[1]:''}を ください！」`);},
  down(x,y){const s=this.st;
    if(this.ph!=='town'&&hitC(x,y,56,170,44)){sfx('tap');this.ph='town';this.initTown();return;}
    if(this.ph==='garden'){this.gardenTap(x,y);return;}
    if(this.ph==='town'&&this.rare&&!this.rare.got&&Math.hypot(x-this.rare.x,y-this.rare.y)<60){this.rare.got=1;s.coins+=50;sfx('fanfare');confetti(80);say('にじいろの ことりを つかまえた！ コイン 50まい！ ラッキー！');setTimeout(()=>{if(scene===this)celebrate('fuwa',true);},1800);return;}
    if(this.ph==='town'){for(const w of this.walkers){if(Math.hypot(x-w.x,y-(w.y-50))<50){w.hop=1;sfx('boing');const wi=this.wishOf(w.f.id);if(!s.greet[w.f.id]){s.greet[w.f.id]=1;s.hearts[w.f.id]++;save();burst(w.x,w.y-80,8,'heart');}
          if(wi){const txt={drink:'カフェで のみものが ほしいな',dress:'ブティックで おしゃれ したいな',play:'こうえんで いっしょに あそぼう！',visit:'ふーちゃんの おうちに いきたいな'}[wi.type];say(`${w.f.name}「${txt}」`);}else say(`${w.f.name}「${w.f.line}」`);return;}}
      for(const b of this.bld())if(Math.abs(x-b.x)<90&&y>b.y-110&&y<b.y+70){sfx('pop');this.enterSub(b.id);return;}return;}
    if(this.ph==='cafe'){if(this.react>0)return;const rows=[CAFE_BASE,CAFE_TOP,CAFE_SIDE];for(let ri=0;ri<3;ri++)rows[ri].forEach((o,i)=>{const p=this.cafeP(ri,i);if(hitC(x,y,p.x,p.y,38)){const key=['base','top','side'][ri];this.cup[key]=o[0];if(ri===0){this.cup.fill=0;this.pour={t:0};sfx('pour');}else sfx('pop');if(o[2])sayPair(o[1],o[2]);}});
      if(hitC(x,y,520,H*.62,46)&&this.cup.base){const o=this.cust.order,cu=this.cup;this.good=o.base===cu.base&&o.top===cu.top&&o.side===cu.side;this.served++;s.coins+=this.good?10:5;this.react=2.2;sfx(this.good?'fanfare':'ding');rkCheer();burst(300,H*.4,this.good?24:8,'heart');
        say(this.good?`${this.cust.f.name}「ぴったり！ おいしい〜！」`:`${this.cust.f.name}「ちょっと ちがうけど ありがとう！」`);if(this.good)this.doneWish(this.cust.f.id,'drink');save();}return;}
    if(this.ph==='boutique'){FRIENDS.forEach((f,i)=>{if(hitC(x,y,70+i*115,170,44)){this.bf=f.id;sfx('tap');say(`${f.name}を おしゃれ しよう！`);}});const W2=s.wear[this.bf]=s.wear[this.bf]||{};
      const wwi=this.wishOf(this.bf);FW_HEAD.forEach((o,i)=>{if(hitC(x,y,62+i*95,H-210,40)){if(o[0]!=='none'&&!s.boughtWear.includes(o[0])&&!(wwi&&wwi.item===o[0])){sfx('no');say('ざっかやさんで かえるよ');return;}W2.head=o[0]==='none'?null:o[0];sfx('spark');this.pose=.8;burst(300,H*.5,10,'star');say(o[1]);save();this.checkDress();}});
      FW_NECK.forEach((o,i)=>{if(hitC(x,y,62+i*95,H-110,40)){if(o[0]!=='none'&&!s.boughtWear.includes(o[0])){sfx('no');say('ざっかやさんで かえるよ');return;}W2.neck=o[0]==='none'?null:o[0];sfx('spark');this.pose=.8;say(o[1]);save();}});
      for(let i=0;i<4;i++)if(hitC(x,y,440+(i%2)*60,H-128+Math.floor(i/2)*44,22)){W2.col=FW_COLS[i];sfx('tap');save();}
      if(hitC(x,y,530,H*.3,46)&&!this.photo){this.photo=.01;sfx('shutter');say('はい チーズ！ なかよし しゃしん！');}return;}
    if(this.ph==='room'){if(hitC(x,y,530,H*.3,46)&&s.room.length>=3){this.party=3;sfx('fanfare');const vw=s.wishes.filter(w=>w.type==='visit'&&!w.done);vw.forEach(w=>this.doneWish(w.id,'visit'));say('おへや パーティー！ みんなで おどろう！');setTimeout(()=>{if(scene===this&&this.ph==='room'){this.advance();celebrate('fuwa');}},2500);return;}
      if(y>H-140){const i=Math.round((x+(this.rsc||0)-70)/100);const k=s.owned[i];if(k){this.drag={k,x,y,fresh:true};sfx('tap');}this.tsx=x;return;}
      for(let i=s.room.length-1;i>=0;i--){const it=s.room[i];if(Math.abs(x-it.x)<60&&y<it.y+10&&y>it.y-100){this.drag={k:it.k,x:it.x,y:it.y,it,ox:x-it.x,oy:y-it.y};return;}}return;}
    if(this.ph==='park'){if(x>400&&y>H*.4&&y<H*.9){this.blowing=true;this.blowT=0;sfx('water');return;}const sx=200,sy=H*.25,L2=H*.28;const px=sx+Math.sin(this.sw.a)*L2,py=sy+Math.cos(this.sw.a)*L2;if(Math.hypot(x-px,y-py)<120){this.sw.v+=2.2*(this.sw.v>=0?1:-1)||2.2;this.push++;sfx('whoosh');rkCheer();if(this.push===10){this.doneWish(this.swF,'play');setTimeout(()=>{if(scene===this&&this.ph==='park'){this.advance();celebrate('fuwa');}},1200);}}return;}
    if(this.ph==='shop'){this.slist.forEach((it,i)=>{const cx=80+(i%4)*147,cy=250+Math.floor(i/4)*((H-330)/5);if(Math.abs(x-cx)<66&&y>cy-50&&y<cy+70){const own=it.t==='furn'?s.owned.includes(it.k):s.boughtWear.includes(it.k);if(own){say('もう もってるよ');return;}if(s.coins<it.p){sfx('no');say('コインが たりないよ。 カフェで おてつだい しよう');return;}s.coins-=it.p;if(it.t==='furn')s.owned.push(it.k);else s.boughtWear.push(it.k);sfx('coin');burst(cx,cy,12,'star');say(`${it.n}を かったよ！`);save();}});}},
  checkDress(){const f=this.bf,W2=this.st.wear[f]||{};const wi=this.wishOf(f);if(wi&&wi.type==='dress'&&W2.head===wi.item)this.doneWish(f,'dress');},
  move(x,y){if(this.ph==='room'&&this.drag){this.drag.x=x-(this.drag.ox||0);this.drag.y=y-(this.drag.oy||0);}},
  up(x,y){this.blowing=false;if(this.ph==='room'&&this.drag){const d=this.drag;this.drag=null;const s=this.st;if(d.it){if(y>H-140){s.room.splice(s.room.indexOf(d.it),1);sfx('whoosh');}else{d.it.x=d.x;d.it.y=clamp(d.y,H*.45,H-150);sfx('pop');}}
      else if(y<H-140){if(s.room.length>=24)s.room.shift();s.room.push({k:d.k,x:d.x,y:clamp(d.y,H*.45,H-150)});sfx('pop');burst(d.x,d.y,8,'star');const n=FURN.find(f=>f[0]===d.k);if(n)say(n[1]);}save();}},
  enterSub(id){const s=this.st;this.ph=id;this.photo=0;this.pose=0;
    if(id==='garden'){this.picked=0;this.can=null;say('はなばたけ！ たねを うえて おみずを あげると おはなが さくよ');}
    if(id==='cafe'){this.served=0;this.cq=[];this.nextCustomer();}
    if(id==='boutique'){const wi=s.wishes.find(w=>w.type==='dress'&&!w.done);this.bf=wi?wi.id:FRIENDS[0].id;say(wi?`${FR[wi.id].name}が おしゃれ したいって！ ほしいものを つけてあげよう`:'おともだちを えらんで おしゃれ しよう！');}
    if(id==='room'){this.visitors=s.wishes.filter(w=>w.type==='visit').map(w=>w.id).slice(0,2);if(!this.visitors.length)this.visitors=[pick(FRIENDS).id];this.party=0;say('おへやを かざろう！ したの かぐを ひっぱってね');}
    if(id==='park'){const wi=s.wishes.find(w=>w.type==='play'&&!w.done);this.swF=wi?wi.id:pick(FRIENDS).id;this.sw={a:0,v:0};this.push=0;this.bubs=[];this.parkF=shuffle(FRIENDS.filter(f=>f.id!==this.swF)).slice(0,2).map((f,i)=>({id:f.id,x:320+i*120,y:H*.72,hop:0}));say(`${FR[this.swF].name}と ブランコ！ ブランコを タッチして おしてね`);}
    if(id==='shop')say('ざっかやさん！ コインで かぐや こものが かえるよ');},
  hint(){if(this.ph==='town'){const w=this.walkers.find(w=>this.wishOf(w.f.id));return w?{x:w.x,y:w.y-50}:null;}if(this.ph==='cafe'){if(!this.cup.base){const i=CAFE_BASE.findIndex(b=>b[0]===this.cust.order.base);const p=this.cafeP(0,i);return{x:p.x,y:p.y};}return{x:520,y:H*.62};}
    if(this.ph==='room')return this.st.room.length<3?{x:70,y:H-60,x2:300,y2:H*.7}:{x:530,y:H*.3};if(this.ph==='park')return{x:200,y:H*.5};if(this.ph==='boutique')return{x:530,y:H*.3};return null;},
  hintText(){return{garden:'たねを うえて おみずを あげよう',town:'おともだちや たてものを タッチしてね',cafe:'ちゅうもんの とおりに つくって みどりの ボタン',room:'かぐを ひっぱって おへやに おいてね',park:'ブランコを タッチして おしてね',boutique:'かざりを えらんで カメラを タッチ',shop:'ほしい ものを タッチしてね'}[this.ph]||'';}};

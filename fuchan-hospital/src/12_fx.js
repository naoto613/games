// ================= wardrobe (ふーちゃん & リッキーの おきがえ) =================
const COATP={heart:{c:'#fff4f8',pat:'heart',pc:'#ff8cc0'},star:{c:'#f2f7ff',pat:'star',pc:'#ffc93c'},dot:{c:'#fffbea',pat:'dot',pc:'#5aa8ff'},candy:{c:'#fff0fa',pat:'stripe',pc:'#c8a8ff'}};
const RKWEAR={flower:{c:'#fff6fa',p:['#ff9cc4','#f7b8d6'],pat:'flower',trim:'#ff9cc4'},mint:{c:'#dff8ec',p:['#5fd3a8'],pat:'dot',trim:'#3cb88a'},sky:{c:'#e3f1ff',p:['#ffc93c','#5aa8ff'],pat:'star',trim:'#5aa8ff'},
  lemon:{c:'#fff6c0',p:['#ffc83a'],pat:'stripe',trim:'#f0a800'},berry:{c:'#ff8c9c',p:['#fff4a0'],pat:'seed',trim:'#4cb84a'},bear:{c:'#d8a878',p:['#f4dcc0'],pat:'belly',trim:'#a8703a'},
  bunny:{c:'#ffffff',p:['#ffc8dc'],pat:'belly',trim:'#ff9cc4'},nurse:{c:'#ffffff',p:['#ff4d6d'],pat:'cross',trim:'#ff4d6d'},dino:{c:'#9ae07a',p:['#5ab84a'],pat:'spots',trim:'#3a983a'}};
const WARD=[
  ['fu','coat','#ffffff','しろい はくい'],['fu','coat','#ffc8e0','ピンクの はくい'],['fu','coat','#bfe0ff','みずいろの はくい'],['fu','coat','#bff0d8','ミントの はくい'],['fu','coat','#e0d0ff','むらさきの はくい'],['fu','coat','#fff2a8','きいろの はくい'],
  ['fu','coat','heart','ハートがらの はくい'],['fu','coat','star','ほしがらの はくい'],['fu','coat','dot','みずたまの はくい'],['fu','coat','candy','しましまの はくい'],
  ['fu','dress','pink','ピンクの ふく'],['fu','dress','yellow','きいろの ふく'],['fu','dress','mint','みどりの ふく'],['fu','dress','sky','あおい ふく'],['fu','dress','lav','むらさきの ふく'],['fu','dress','red','あかい ふく'],['fu','dress','magic','まじかるドレス'],['fu','dress','yukata','ゆかた'],
  ['fu','hat','nurse','ナースキャップ'],['fu','hat','none','ぼうし なし'],['fu','hat','mbow','リボン'],['fu','hat','hana','おはなの かみかざり'],['fu','hat','tiara','ティアラ'],['fu','hat','beret','ベレーぼう'],['fu','hat','crown','かんむり'],['fu','hat','star','ほしの かみかざり'],['fu','hat','cap','キャップ'],
  ['fu','item','none','なにも もたない'],['fu','item','flower','おはな'],['fu','item','balloon','ハートの ふうせん'],['fu','item','wand','まほうの ステッキ'],['fu','item','bag','ハートの バッグ'],['fu','item','balloon2','にじいろ ふうせん'],
  ['rk','wear','flower','おはなの ロンパース'],['rk','wear','mint','みずたまの ロンパース'],['rk','wear','sky','おほしさまの ロンパース'],['rk','wear','lemon','しましまの ロンパース'],['rk','wear','berry','いちごの ロンパース'],['rk','wear','bear','くまさん きぐるみ'],['rk','wear','bunny','うさぎさん きぐるみ'],['rk','wear','nurse','ナースの ロンパース'],['rk','wear','dino','きょうりゅう きぐるみ'],
  ['rk','hat','none','ぼうし なし'],['rk','hat','ribbon','リボン'],['rk','hat','bonnet','ボンネット'],['rk','hat','bear','くまみみ ぼうし'],['rk','hat','bunny','うさみみ ぼうし'],['rk','hat','crown','ちいさな かんむり'],['rk','hat','nurse','ナースキャップ'],['rk','hat','flower','はなかんむり'],
  ['rk','toy','blocks','つみき'],['rk','toy','rattle','ガラガラ'],['rk','toy','bottle','ミルク'],['rk','toy','teddy','くまの ぬいぐるみ'],['rk','toy','duck','あひるさん'],
];
const FREE=['fu:coat:#ffffff','fu:dress:pink','fu:hat:nurse','fu:hat:none','fu:item:none','rk:wear:flower','rk:hat:none','rk:toy:blocks'];
const wkey=w=>w[0]+':'+w[1]+':'+w[2];
function owns(w){const k=typeof w==='string'?w:wkey(w);return FREE.includes(k)||SAVE.owned.includes(k);}
function wearNow(w){if(w[0]==='fu'){if(w[1]==='coat')SAVE.coat=w[2];else if(w[1]==='dress')SAVE.dress=w[2];else if(w[1]==='hat')SAVE.hat=w[2];else SAVE.item=w[2];}else SAVE.rk[w[1]]=w[2];save();}
function isWorn(w){if(w[0]==='fu')return({coat:SAVE.coat,dress:SAVE.dress,hat:SAVE.hat,item:SAVE.item})[w[1]]===w[2];return SAVE.rk[w[1]]===w[2];}
function fuOutfit(extra){const d=DRESSES.find(x=>x.id===SAVE.dress)||DRESSES[2];const cp=COATP[SAVE.coat];return Object.assign({},d,{acc:SAVE.hat,boots:'#ff5f9a',coat:cp?cp.c:SAVE.coat,coatPat:cp||null,item:SAVE.item==='none'?null:SAVE.item},extra||{});}
function rkWear(id){return RKWEAR[id||SAVE.rk.wear]||RKWEAR.flower;}
function coatPattern(c,P){c.save();c.beginPath();for(const s of[-1,1]){c.moveTo(s*2.2,-35.8);c.lineTo(s*7.9,-35.4);c.quadraticCurveTo(s*10.6,-22,s*11.8,-8.6);c.quadraticCurveTo(s*7,-7.6,s*2,-8.4);c.lineTo(s*1.6,-24);c.closePath();}c.clip();c.fillStyle=P.pc;
  for(let y=-35;y<-7;y+=4.2)for(let x=-12;x<13;x+=4.2){const xx=x+((Math.round(y)%2)?2:0);if(P.pat==='heart'){heartP(c,xx,y,1);c.fill();}else if(P.pat==='star'){star(c,xx,y,1.3,.6);c.fill();}else if(P.pat==='dot')circ(c,xx,y,.8);}
  if(P.pat==='stripe'){for(let y=-36;y<-7;y+=3){c.fillRect(-13,y,26,1.3);}}c.restore();}
function rkPattern(c,WR){const P=WR.p;switch(WR.pat){
  case'flower':[[-5,-16],[4,-10],[-2,-7],[6,-17],[-7,-9],[1,-14],[7,-6]].forEach(([a,b],i)=>{c.fillStyle=P[i%P.length];for(let k=0;k<5;k++){const an=k/5*TAU;circ(c,a+Math.cos(an)*1.2,b+Math.sin(an)*1.2,.95);}});break;
  case'dot':c.fillStyle=P[0];for(let y=-20;y<-3;y+=3.4)for(let x=-10;x<11;x+=3.4)circ(c,x+(Math.round(y)%2?1.7:0),y,.9);break;
  case'star':[[-5,-16],[4,-10],[-2,-7],[6,-17],[-7,-9],[1,-14],[7,-6]].forEach(([a,b],i)=>{c.fillStyle=P[i%P.length];star(c,a,b,1.6,.7);c.fill();});break;
  case'stripe':c.fillStyle=P[0];for(let y=-21;y<-3;y+=3.2)c.fillRect(-12,y,24,1.5);break;
  case'seed':c.fillStyle=P[0];for(let y=-19;y<-3;y+=3.6)for(let x=-9;x<10;x+=3.6)ell(c,x+(Math.round(y)%2?1.8:0),y,.5,.8);c.fillStyle='#4cb84a';c.fillRect(-10,-22,20,2.2);break;
  case'belly':c.fillStyle=P[0];ell(c,0,-11,6,7.5);break;
  case'cross':c.fillStyle=P[0];c.fillRect(-1,-16,2,6);c.fillRect(-3,-14,6,2);break;
  case'spots':c.fillStyle=P[0];[[-6,-15],[5,-11],[-3,-7],[6,-18]].forEach(([a,b])=>ell(c,a,b,2,1.5));break;}}
function rkHat(c,hat,hy,t){c.lineWidth=.9;c.strokeStyle=FU.line;switch(hat){
  case'ribbon':bow(c,7,hy-11,2.8,'#ff5fa2');break;
  case'bonnet':c.fillStyle=gfill(c,-2,hy-8,15,'#ffd6e8');c.beginPath();c.arc(0,hy-1,15,Math.PI*1.02,Math.PI*1.98);c.quadraticCurveTo(0,hy-6,-15,hy-1.5);c.fill();c.stroke();c.fillStyle='#fff';for(let i=0;i<9;i++){const a=Math.PI*1.05+i/8*Math.PI*.9;circ(c,Math.cos(a)*15.5,hy-1+Math.sin(a)*15.5,1.3);}bow(c,-11,hy+6,2,'#ff8cc0');break;
  case'bear':c.fillStyle=gfill(c,-2,hy-8,15,'#c8905a');for(const s of[-1,1]){c.beginPath();c.arc(s*10,hy-12,4.2,0,TAU);c.fill();c.stroke();}c.beginPath();c.arc(0,hy-3,14,Math.PI,TAU);c.closePath();c.fill();c.stroke();c.fillStyle='#f3d6b0';for(const s of[-1,1])circ(c,s*10,hy-12,2);break;
  case'bunny':c.fillStyle=gfill(c,-2,hy-8,15,'#ffffff');for(const s of[-1,1]){c.save();c.translate(s*6,hy-14);c.rotate(s*.25+Math.sin(t*3)*.05*s);c.beginPath();c.ellipse(0,-8,3.6,9,0,0,TAU);c.fill();c.stroke();c.fillStyle='#ffc8dc';ell(c,0,-8,1.8,6.5);c.fillStyle='#fff';c.restore();}c.beginPath();c.arc(0,hy-3,14,Math.PI,TAU);c.closePath();c.fill();c.stroke();break;
  case'crown':c.fillStyle=gfill(c,0,hy-16,8,'#ffd23a');c.beginPath();c.moveTo(-6,hy-11);c.lineTo(-7,hy-18);c.lineTo(-3,hy-14.5);c.lineTo(0,hy-20);c.lineTo(3,hy-14.5);c.lineTo(7,hy-18);c.lineTo(6,hy-11);c.closePath();c.fill();c.stroke();c.fillStyle='#ff4d6d';circ(c,0,hy-13,1.1);break;
  case'nurse':c.fillStyle='#fff';rr(c,-7,hy-17,14,6,2);c.fill();c.stroke();c.fillStyle='#ff4d6d';c.fillRect(-1,hy-16.3,2,4.4);c.fillRect(-2.2,hy-15.1,4.4,2);break;
  case'flower':for(let i=0;i<7;i++){const a=Math.PI*1.1+i/6*Math.PI*.8;const x=Math.cos(a)*13,y=hy-1+Math.sin(a)*13;c.fillStyle=['#ff8cc0','#ffd23a','#fff','#b48cff'][i%4];for(let k=0;k<5;k++){const an=k/5*TAU;circ(c,x+Math.cos(an)*1.3,y+Math.sin(an)*1.3,1.1);}c.fillStyle='#ffb03a';circ(c,x,y,.6);}break;}}
function rkToy(c,toy,t){c.save();c.translate(0,-15);c.rotate(Math.sin(t*1.5)*.08);c.strokeStyle=FU.line;c.lineWidth=.9;switch(toy){
  case'rattle':c.rotate(Math.sin(t*9)*.3);c.fillStyle='#ffe08a';c.fillRect(-1,-2,2,9);c.fillStyle=gfill(c,-1,-6,6,'#ff8cc0');c.beginPath();c.arc(0,-6,5,0,TAU);c.fill();c.stroke();c.fillStyle='#fff';circ(c,-1.5,-7.5,1.2);break;
  case'bottle':c.fillStyle='rgba(255,255,255,.95)';rr(c,-3.4,-6,6.8,12,2.5);c.fill();c.stroke();c.fillStyle='#fff6d8';c.fillRect(-3,-1,6,6.6);c.fillStyle='#ff9cc4';rr(c,-3.8,-8,7.6,3,1);c.fill();c.fillStyle='#ffd8b0';ell(c,0,-10,1.8,2.4);break;
  case'teddy':c.fillStyle=gfill(c,-1,-4,8,'#c8905a');for(const s of[-1,1])circ(c,s*4.5,-9.5,2);c.beginPath();c.arc(0,-5,5.2,0,TAU);c.fill();c.stroke();ell(c,0,3,5,4.5);c.fillStyle='#f3d6b0';ell(c,0,-3.5,2.4,1.8);c.fillStyle='#333';circ(c,-2,-6,.7);circ(c,2,-6,.7);circ(c,0,-4,.6);break;
  case'duck':c.fillStyle=gfill(c,-1,-2,8,'#ffe04a');ell(c,0,1,6.5,4.5);c.beginPath();c.arc(-3,-4,3.6,0,TAU);c.fill();c.stroke();c.fillStyle='#ff9a3a';c.beginPath();c.moveTo(-6.4,-4.4);c.lineTo(-9,-3.4);c.lineTo(-6.4,-2.6);c.fill();c.fillStyle='#333';circ(c,-4,-5,.6);break;
  default:{const cols=['#ff5a6a','#ffa03a','#ffe04a','#5ad06a','#4aa8ff','#a86aff'];cols.forEach((cc,i)=>{c.fillStyle=cc;c.fillRect(-7+i*2.33,-5,2.4,10);});rr(c,-7,-5,14,10,3);c.stroke();c.fillStyle='rgba(255,255,255,.45)';for(let a=-5;a<=5;a+=3.4)for(const b of[-2.5,1.5])circ(c,a,b,.9);}}
  c.restore();}
// ================= per-play score / reactions / fx =================
const PLAY={hearts:0,combo:0,best:0};const REACT={k:null,t:0};const FLY=[];let BANNER=null,SHAKE=0,HUDP=0;
function resetPlay(){PLAY.hearts=0;PLAY.combo=0;PLAY.best=0;FLY.length=0;BANNER=null;REACT.t=0;}
const GOODW=['いいね！','じょうず！','すごい！','かんぺき！','てんさい！','さいこう！'];
function good(x,y,n=1,word){PLAY.combo++;PLAY.best=Math.max(PLAY.best,PLAY.combo);const cb=Math.min(PLAY.combo,8);const f=880*Math.pow(2,(cb-1)/12*2);tone(f,.1,'triangle',.2);tone(f*1.5,.25,'triangle',.16,.08);tone(f*2,.3,'sine',.08,.14);
  burst(x,y,8+cb*2,'star');ring(x,y,'#fff6a0');parts.push({x,y:y-30,vx:0,vy:-90,life:1.1,t:0,kind:'txt',text:word||GOODW[Math.min(GOODW.length-1,Math.floor((PLAY.combo-1)/2))],col:['#ff5fa2','#ff9a3a','#4cb8ff','#b86aff'][PLAY.combo%4],r:30+cb*2});
  if(PLAY.combo>=3&&PLAY.combo%3===0)parts.push({x,y:y-76,vx:0,vy:-70,life:1.2,t:0,kind:'txt',text:`コンボ ×${PLAY.combo}`,col:'#ffb000',r:26});
  for(let i=0;i<n+(PLAY.combo>=5?1:0);i++)FLY.push({x0:x,y0:y,t:-i*.12,d:.7+Math.random()*.2,cx:x+rand(-120,120),cy:y-rand(80,200)});
  REACT.k='good';REACT.t=1.3;RK.clap=Math.max(RK.clap,.9);}
function bad(){PLAY.combo=0;sfx('no');REACT.k='bad';REACT.t=1;SHAKE=.25;}
function banner(text,col='#ff5fa2',sub){BANNER={text,col,sub,t:0};sfx('hooray');confetti(50);REACT.k='good';REACT.t=2;RK.clap=2;}
function hudPos(){return{x:W-58,y:58};}
function updFx(dt){if(REACT.t>0)REACT.t-=dt;if(SHAKE>0)SHAKE-=dt;if(HUDP>0)HUDP-=dt*3;if(BANNER){BANNER.t+=dt;if(BANNER.t>2.2)BANNER=null;}
  const hp=hudPos();for(let i=FLY.length-1;i>=0;i--){const f=FLY[i];f.t+=dt;if(f.t>=f.d){FLY.splice(i,1);PLAY.hearts++;HUDP=1;tone(1568+Math.min(PLAY.hearts,20)*20,.06,'sine',.1);}}}
function drawFly(c){const hp=hudPos();for(const f of FLY){if(f.t<0)continue;const k=easeOut(f.t/f.d),x=(1-k)*(1-k)*f.x0+2*(1-k)*k*f.cx+k*k*hp.x,y=(1-k)*(1-k)*f.y0+2*(1-k)*k*f.cy+k*k*hp.y;MED.love(c,x,y,.5+.3*(1-k));}}
function drawHud(c){const hp=hudPos(),s=1+HUDP*.25;c.save();c.translate(hp.x,hp.y);c.scale(s,s);c.fillStyle='rgba(255,255,255,.92)';rr(c,-48,-24,96,48,24);c.fill();c.strokeStyle='#ffb3d6';c.lineWidth=3;c.stroke();MED.love(c,-24,0,.55);txt(c,String(PLAY.hearts),16,2,26,'#ff4d7d');c.restore();}
function drawBanner(c){const B=BANNER;if(!B)return;const a=Math.min(1,B.t*4,(2.2-B.t)*3);const k=elastic(Math.min(1,B.t*2.2));c.save();c.globalAlpha=a;c.translate(W/2,H*.4);c.save();c.rotate(T*.6);c.fillStyle='rgba(255,230,120,.35)';for(let i=0;i<10;i++){c.rotate(TAU/10);c.beginPath();c.moveTo(0,0);c.lineTo(-30,-260);c.lineTo(30,-260);c.fill();}c.restore();
  c.scale(k,k);c.rotate(Math.sin(B.t*6)*.03);c.fillStyle=B.col;rr(c,-230,-56,460,112,56);c.fill();c.strokeStyle='#fff';c.lineWidth=8;c.stroke();c.font=`54px ${POP}`;const fs=Math.min(54,54*400/Math.max(1,c.measureText(B.text).width));txtO(c,B.text,0,B.sub?-12:4,fs,'#fff',shade(B.col,-.35),10);if(B.sub)txt(c,B.sub,0,34,22,'#fff');
  for(let i=0;i<5;i++){c.fillStyle='#ffe36a';star(c,-250+i*125,-70+Math.sin(T*6+i)*8,14,6);c.fill();}c.restore();}
// Fu-chan / Ricky with reactions & idle life
function fu(c,x,y,sc,o={}){const r=REACT.t>0?REACT.k:null;const q=Object.assign({outfit:fuOutfit(),t:T,sc,steth:true},o);
  if(r==='good'&&!q.hold){q.cheer=1;q.point=0;}if(r==='bad'){q.oh=1;q.cheer=0;q.happy=0;}
  if(!q.cheer&&!q.point&&!q.wave&&!q.hold&&!q.dance&&(T%9)<1.2)q.wave=1;
  if(q.look==null&&LOOK.on)q.look=clamp((LOOK.x-x)/200,-1,1);drawFuka(c,x,y,q);}
const LOOK={x:0,on:0};
function rk(scn,c,x,y,sc,o={}){const r=REACT.t>0?REACT.k:null;let w=scn._rw;if(!w||w.bx!==x){w=scn._rw={bx:x,ox:0,tx:0,next:T+3};}
  if(!o.still){if(T>w.next){w.tx=rand(-60,60);w.next=T+rand(4,8);}const d=w.tx-w.ox;const mv=Math.abs(d)>2;if(mv)w.ox+=Math.sign(d)*Math.min(Math.abs(d),28/60);o=Object.assign({moving:mv,dir:mv&&d<0?1:0},o);}
  const q=Object.assign({sc,t:T},o);if(r==='bad'){q.oh=1;q.happy=0;}if(r==='good')q.happy=1;
  drawRikki(c,x+w.ox,y,q);scn.rkPos={x:x+w.ox,y,sc};}
// ================= room decoration =================
function roomBg(c,wall,floor,fy,stripe,deco=[]){const L=-OX/SC-2,R=W+OX/SC+2,TP=-OY/SC-2;c.fillStyle=wall;c.fillRect(L,TP,R-L,fy-TP+4);
  if(stripe){c.fillStyle=stripe;for(let x=Math.floor(L/60)*60;x<R;x+=60)c.fillRect(x,TP,30,fy-TP);}
  const lg=c.createRadialGradient(W/2,TP,40,W/2,TP,H*.8);lg.addColorStop(0,'rgba(255,255,255,.55)');lg.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=lg;c.fillRect(L,TP,R-L,fy-TP);
  // wainscot
  const wy=fy-110;c.fillStyle=shade(wall,-.05);c.fillRect(L,wy,R-L,110);c.fillStyle=shade(wall,.25);c.fillRect(L,wy-6,R-L,8);c.strokeStyle=shade(wall,-.12);c.lineWidth=2;for(let x=Math.floor(L/90)*90+10;x<R;x+=90){rr(c,x,wy+12,70,78,8);c.stroke();}
  for(const d of deco)drawDeco(c,d);
  c.fillStyle=shade(wall,-.18);c.fillRect(L,fy-14,R-L,14);
  c.fillStyle=vfill(c,fy,H,floor,.08,-.12);c.fillRect(L,fy,R-L,H-fy+OY/SC+4);c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=2;for(let x=Math.floor(L/80)*80;x<R;x+=80){c.beginPath();c.moveTo(x,fy);c.lineTo(x+(x-W/2)*.4,H+OY/SC);c.stroke();}
  for(let y=fy+30,k=1;y<H+OY/SC;y+=30+k*10,k++){c.beginPath();c.moveTo(L,y);c.lineTo(R,y);c.stroke();}
  const sg=c.createLinearGradient(0,fy,0,fy+120);sg.addColorStop(0,'rgba(255,255,255,.3)');sg.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=sg;c.fillRect(L,fy,R-L,120);}
function drawDeco(c,d){const [k,x,y,s=1]=d;c.save();c.translate(x,y);c.scale(s,s);c.lineJoin='round';
  switch(k){
    case'window':{const w=d[4]||130,h=d[5]||110;c.fillStyle='#fff';rr(c,-w/2-8,-h/2-8,w+16,h+16,12);c.fill();const g=c.createLinearGradient(0,-h/2,0,h/2);g.addColorStop(0,'#7cc8ff');g.addColorStop(1,'#d8f0ff');c.fillStyle=g;rr(c,-w/2,-h/2,w,h,6);c.fill();c.save();c.beginPath();rr(c,-w/2,-h/2,w,h,6);c.clip();
      c.fillStyle='rgba(255,255,255,.9)';for(let i=0;i<2;i++){const cx=((T*8+i*90)%(w+80))-w/2-40,cy=-h/4+i*h/3;circ(c,cx,cy,12);circ(c,cx+14,cy-5,15);circ(c,cx+30,cy,11);}c.fillStyle='#8ee07a';ell(c,-w/4,h/2,w/2.6,20);ell(c,w/3,h/2+4,w/3,18);c.fillStyle='#ffe36a';circ(c,w/2-22,-h/2+20,11);c.restore();
      c.strokeStyle='#fff';c.lineWidth=7;c.beginPath();c.moveTo(0,-h/2);c.lineTo(0,h/2);c.moveTo(-w/2,0);c.lineTo(w/2,0);c.stroke();c.fillStyle=d[6]||'#ffb3d0';c.beginPath();c.moveTo(-w/2-14,-h/2-12);c.quadraticCurveTo(-w/2+14,0,-w/2-6,h/2+10);c.lineTo(-w/2-20,h/2+10);c.lineTo(-w/2-20,-h/2-12);c.fill();c.beginPath();c.moveTo(w/2+14,-h/2-12);c.quadraticCurveTo(w/2-14,0,w/2+6,h/2+10);c.lineTo(w/2+20,h/2+10);c.lineTo(w/2+20,-h/2-12);c.fill();break;}
    case'plant':c.fillStyle='#e8906a';c.beginPath();c.moveTo(-22,-30);c.lineTo(22,-30);c.lineTo(16,0);c.lineTo(-16,0);c.closePath();c.fill();c.fillStyle='#d8784a';c.fillRect(-24,-34,48,8);for(let i=0;i<7;i++){const a=-Math.PI/2+(i-3)*.38+Math.sin(T*1.5+i)*.04;c.save();c.translate(0,-32);c.rotate(a+Math.PI/2);c.fillStyle=i%2?'#4cb85a':'#6cd07a';c.beginPath();c.ellipse(0,-30,10,30,0,0,TAU);c.fill();c.restore();}break;
    case'clock':{c.fillStyle='#fff';c.strokeStyle='#ff9ac8';c.lineWidth=6;c.beginPath();c.arc(0,0,30,0,TAU);c.fill();c.stroke();c.fillStyle='#b8a0c8';for(let i=0;i<12;i++){const a=i/12*TAU;circ(c,Math.cos(a)*22,Math.sin(a)*22,i%3?1.5:3);}const now=new Date(),hr=(now.getHours()%12+now.getMinutes()/60)/12*TAU,mn=now.getMinutes()/60*TAU,sc2=now.getSeconds()/60*TAU;
      c.strokeStyle='#5a3a6a';c.lineCap='round';c.lineWidth=4;c.beginPath();c.moveTo(0,0);c.lineTo(Math.sin(hr)*13,-Math.cos(hr)*13);c.stroke();c.lineWidth=3;c.beginPath();c.moveTo(0,0);c.lineTo(Math.sin(mn)*20,-Math.cos(mn)*20);c.stroke();c.strokeStyle='#ff4d6d';c.lineWidth=1.5;c.beginPath();c.moveTo(0,0);c.lineTo(Math.sin(sc2)*22,-Math.cos(sc2)*22);c.stroke();c.fillStyle='#ff4d6d';circ(c,0,0,3);break;}
    case'frame':{const kind=d[4]||'heart';c.fillStyle='#f4c890';rr(c,-40,-32,80,64,6);c.fill();c.fillStyle='#fffaf0';rr(c,-32,-24,64,48,4);c.fill();if(kind==='heart'){c.fillStyle='#ff8cc0';heartP(c,0,0,14);c.fill();}else if(kind==='hand'){c.fillStyle='#5aa8ff';circ(c,-10,4,8);c.fillStyle='#8ad0ff';for(let i=0;i<6;i++)circ(c,8+Math.cos(i)*8,-4+Math.sin(i)*8,3);txt(c,'てあらい',0,16,10,'#3a88e8');}else if(kind==='tooth'){drawItem(c,'tooth',0,0,.55);}else if(kind==='rainbow'){for(let i=0;i<5;i++){c.strokeStyle=['#ff6f91','#ffb03a','#ffe04a','#6cd08a','#5aa8ff'][i];c.lineWidth=4;c.beginPath();c.arc(0,16,24-i*4,Math.PI,TAU);c.stroke();}}else drawThing(c,kind,0,0,.45);break;}
    case'shelf':c.fillStyle='#e8c8a0';c.fillRect(-70,0,140,8);c.fillStyle='#d8b088';c.fillRect(-60,8,8,10);c.fillRect(52,8,8,10);MED.bottle(c,-40,-20,.55);MED.kit(c,5,-16,.55);drawItem(c,'duck',48,-16,.45);break;
    case'lamp':c.fillStyle='rgba(255,250,210,.25)';c.beginPath();c.moveTo(-16,0);c.lineTo(-70,160);c.lineTo(70,160);c.lineTo(16,0);c.fill();c.fillStyle='#fff8d8';rr(c,-26,-14,52,18,9);c.fill();c.fillStyle='#e8d8b8';c.fillRect(-2,-60,4,48);break;
    case'poster':{c.fillStyle='#fff';rr(c,-44,-56,88,112,8);c.fill();c.strokeStyle=d[5]||'#9ad0ff';c.lineWidth=4;c.stroke();drawThing(c,d[4]||'germ',0,-12,.8);txt(c,d[6]||'てあらい',0,34,14,'#5a88c8');break;}
    case'bubbles':for(let i=0;i<6;i++){const yy=((T*20+i*40)%240);c.globalAlpha=.4*(1-yy/240);c.strokeStyle='#9ad0ff';c.lineWidth=2;c.beginPath();c.arc(Math.sin(i*2+T)*20+i*8,-yy,6+i%3*2,0,TAU);c.stroke();}c.globalAlpha=1;break;
  }c.restore();}
function vignette(c){const L=-OX/SC-2,R=W+OX/SC+2;const g=c.createRadialGradient(W/2,H/2,H*.35,W/2,H/2,H*.8);g.addColorStop(0,'rgba(80,40,90,0)');g.addColorStop(1,'rgba(80,40,90,.14)');c.fillStyle=g;c.fillRect(L,-OY/SC-2,R-L,H+OY/SC*2+4);}
// ================= celebrate (ごほうび: きせかえ) =================
function celebrate(id,stars=3){if(cel)return;SAVE.plays[id]=(SAVE.plays[id]||0)+1;const r0=rankIdx();const bonus=stars*2+Math.floor(PLAY.best/3);const earned=PLAY.hearts+bonus;SAVE.hearts+=earned;
  const locked=WARD.filter(w=>!owns(w));let gift=null;if(locked.length){gift=pick(locked);SAVE.owned.push(wkey(gift));}save();
  const r1=rankIdx();cel={t:0,id,stars,play:PLAY.hearts,bonus,earned,shown:0,gift,worn:0,tip:pick(TIPS[id]||['よく がんばったね']),rankUp:r1>r0?RANKS[r1]:null,open:0,said:0};
  sfx('fanfare');confetti(100);RK.clap=3;REACT.k='good';REACT.t=4;say(pick(['だいせいこう！','やったね！ よく できました！','すごい！ りっぱな おいしゃさん！']));}
function celUpdate(dt){const C=cel;C.t+=dt;if(C.shown<C.earned&&C.t>1.2){C.acc=(C.acc||0)+dt*Math.max(10,C.earned);while(C.acc>=1&&C.shown<C.earned){C.acc--;C.shown++;tone(1200+C.shown*15,.05,'sine',.08);}}
  if(C.open>0)C.open+=dt;else if(C.t>5.5&&C.gift)celOpen();
  if(C.t>1.5&&Math.random()<dt*2)fireworkAt(rand(80,W-80),rand(H*.1,H*.35));
  if(C.open>1.1&&C.said===0){C.said=1;if(C.gift){hush();speak(`あたらしい おようふく！ ${C.gift[0]==='fu'?'ふーちゃん':'リッキー'}の ${C.gift[3]}！`);}}
  if((C.open>3.4||(!C.gift&&C.t>3))&&C.said<2){C.said=2;if(C.rankUp){sfx('hooray');speak(`ランクアップ！ ${C.rankUp[1]}に なったよ！`);}speak('まめちしき。 '+C.tip);}}
function fireworkAt(x,y){const col=pick(['#ffd23a','#ff8cc0','#7ad8ff','#b8a0ff','#8ef0b0']);for(let i=0;i<22;i++){const a=i/22*TAU;parts.push({x,y,vx:Math.cos(a)*rand(120,200),vy:Math.sin(a)*rand(120,200),life:rand(.8,1.2),t:0,kind:'fw',col,r:4});}tone(rand(600,900),.3,'sine',.05,0,-300);}
function celOpen(){if(cel.open>0||!cel.gift)return;cel.open=.01;sfx('open');burst(W/2,H*.5,36,'star');}
function celBtns(){const y=H*.885;return cel&&cel.gift&&cel.open>0?{retry:{x:W/2-170,y},wear:{x:W/2,y},home:{x:W/2+170,y}}:{retry:{x:W/2-120,y},home:{x:W/2+120,y}};}
function celDown(x,y){const C=cel;if(C.t<.8)return;if(C.gift&&!C.open&&hitC(x,y,W/2,H*.5,110)){celOpen();return;}if(C.t<1.6)return;const b=celBtns();
  if(b.wear&&hitC(x,y,b.wear.x,b.wear.y,56)&&!C.worn){C.worn=1;wearNow(C.gift);sfx('spark');burst(W/2,H*.5,20,'heart');say('きてみたよ！ にあう？');return;}
  if(hitC(x,y,b.retry.x,b.retry.y,56)){sfx('tap');const id=C.id;cel=null;go(id);return;}
  if(hitC(x,y,b.home.x,b.home.y,56)){sfx('tap');cel=null;go('lobby');return;}
  if(C.gift&&!C.open)celOpen();}
function drawGiftPreview(c,g,x,y,s){if(g[0]==='fu'){const o=fuOutfit();if(g[1]==='coat'){const cp=COATP[g[2]];o.coat=cp?cp.c:g[2];o.coatPat=cp||null;}else if(g[1]==='dress'){Object.assign(o,DRESSES.find(d=>d.id===g[2]));}else if(g[1]==='hat')o.acc=g[2];else o.item=g[2]==='none'?null:g[2];drawFuka(c,x,y,{outfit:o,t:T,sc:2.6*s,steth:true,cheer:1});}
  else{const o={sc:2.6*s,t:T,happy:1,wear:rkWear(SAVE.rk.wear),hat:SAVE.rk.hat};if(g[1]==='wear')o.wear=rkWear(g[2]);else if(g[1]==='hat')o.hat=g[2];else o.toy=g[2];drawRikki(c,x,y,o);}}
function drawCel(c){const C=cel,a=Math.min(1,C.t*3);c.save();c.globalAlpha=a*.55;c.fillStyle='#4a2a5a';c.fillRect(-OX/SC-2,-OY/SC-2,W+2*OX/SC+4,H+2*OY/SC+4);c.globalAlpha=a;
  const k=elastic(Math.min(1,C.t*1.6));c.translate(W/2,H/2);c.scale(.6+.4*k,.6+.4*k);c.translate(-W/2,-H/2);
  panel(c,30,H*.07,W-60,H*.88,36,'#fffaf4','#ffb3d6',6);
  txtO(c,'よく できました！',W/2,H*.125,44,'#ff5fa2','#fff',10);
  for(let i=0;i<3;i++){const on=i<C.stars,kk=clamp((C.t-.4-i*.25)*3,0,1),s=elastic(kk);c.save();c.translate(W/2+(i-1)*84,H*.2-(i===1?12:0));c.scale(s,s);c.rotate(on?Math.sin(T*3+i)*.08:0);c.fillStyle=on?'#ffd23a':'#e8e0ea';star(c,0,0,36,16);c.fill();c.strokeStyle=on?'#e8a000':'#d0c0d8';c.lineWidth=4;c.stroke();c.restore();}
  const hy=H*.285;c.fillStyle='#fff0f6';rr(c,70,hy-28,W-140,56,28);c.fill();MED.love(c,110,hy,.7);txt(c,`${C.shown}`,150,hy+2,34,'#ff4d7d','left');txt(c,`おしごと ${C.play}  ボーナス ${C.bonus}`,W-90,hy+2,17,'#a07aa8','right');
  // rank bar
  const ri=rankIdx(),nx=RANKS[ri+1];const by=H*.345;txt(c,RANKS[ri][1],90,by,17,'#8a5a9a','left');if(nx){const p=clamp((SAVE.hearts-(C.earned-C.shown)-RANKS[ri][0])/(nx[0]-RANKS[ri][0]),0,1);c.fillStyle='#f0e0ec';rr(c,250,by-9,W-340,18,9);c.fill();c.fillStyle='#ff8cc0';rr(c,250,by-9,Math.max(18,(W-340)*p),18,9);c.fill();}
  const cy=H*.5;
  if(C.gift){c.save();c.translate(W/2,cy);c.rotate(T*.3);c.globalAlpha=a*.25;c.fillStyle='#ffd23a';for(let i=0;i<12;i++){c.rotate(TAU/12);c.beginPath();c.moveTo(0,0);c.lineTo(-22,-170);c.lineTo(22,-170);c.fill();}c.restore();c.globalAlpha=a;
    if(!C.open){const sh=C.t>1.5?Math.sin(T*22)*.14:0;c.save();c.translate(W/2,cy+Math.abs(Math.sin(T*4))*-8);c.rotate(sh);c.fillStyle=gfill(c,-10,-20,80,'#ff8cc0');rr(c,-80,-50,160,110,14);c.fill();c.fillStyle='#ffd23a';c.fillRect(-12,-50,24,110);c.fillRect(-80,-2,160,16);bow(c,0,-58,22,'#ffd23a');c.restore();
      if(C.t>1)txt(c,'タッチで プレゼントを あけよう！',W/2,cy+96,22,'#8a5a9a');}
    else{const s=elastic(Math.min(1,C.open*1.6));c.save();c.translate(W/2,cy+80);c.scale(s,s);c.fillStyle='#fff';c.strokeStyle='#ffd23a';c.lineWidth=6;c.beginPath();c.ellipse(0,-70,110,110,0,0,TAU);c.fill();c.stroke();drawGiftPreview(c,C.gift,0,20,C.gift[0]==='fu'?1:1.25);c.restore();
      c.save();c.translate(W/2+100,cy-80);c.rotate(.2);c.fillStyle='#ff4d6d';rr(c,-44,-18,88,36,18);c.fill();txt(c,'NEW!',0,1,22,'#fff');c.restore();txt(c,(C.gift[0]==='fu'?'ふーちゃんの ':'リッキーの ')+C.gift[3],W/2,cy+138,24,'#ff5fa2');}}
  else{fu(c,W/2-70,cy+90,2.8,{cheer:1});drawRikki(c,W/2+80,cy+90,{sc:2.2,t:T,clap:1});txt(c,'おようふくは ぜんぶ あつめたよ！',W/2,cy+120,22,'#ff5fa2');}
  let ty=H*.665;if(C.rankUp&&(C.open>0||!C.gift)){c.fillStyle='#ffd23a';rr(c,70,ty-22,W-140,42,21);c.fill();txt(c,`ランクアップ！ ${C.rankUp[1]}`,W/2,ty-1,24,'#8a4a00');ty+=34;}
  if(C.open>0||!C.gift){c.font=`800 20px ${FONT}`;const L=wrapText(c,C.tip,W-170);const bh=L.length*27+48;c.fillStyle='#eaf6ff';rr(c,60,ty,W-120,bh,20);c.fill();c.strokeStyle='#9ad0ff';c.lineWidth=3;c.stroke();txt(c,'まめちしき',W/2,ty+18,18,'#3a88e8');L.forEach((l,i)=>txt(c,l,W/2,ty+44+i*27,20,'#4a3a5a'));}
  if(C.t>1.6){const b=celBtns();drawBtn(c,b.retry.x,b.retry.y,42,'#ffb03a','retry');drawBtn(c,b.home.x,b.home.y,42,'#ff8cc0','home');txt(c,'もういちど',b.retry.x,b.retry.y+58,18,'#8a5a9a');txt(c,'ロビーへ',b.home.x,b.home.y+58,18,'#8a5a9a');
    if(b.wear){drawBtn(c,b.wear.x,b.wear.y,46,C.worn?'#b8b0c8':'#5ac8a0','check',!C.worn);txt(c,C.worn?'きたよ！':'きてみる',b.wear.x,b.wear.y+58,18,'#3a9a7a');}}
  c.restore();}

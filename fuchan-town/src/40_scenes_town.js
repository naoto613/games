// ================= backgrounds =================
function skyBg(c,top,bot,h){const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,top);g.addColorStop(1,bot);c.fillStyle=g;c.fillRect(-400,0,W+800,h);}
function cloud(c,x,y,s,face){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='rgba(120,160,220,.16)';ell(c,6,26,70,14);const g=c.createLinearGradient(0,-50,0,36);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#e6f0ff');c.fillStyle=g;circ(c,-36,6,28);circ(c,0,-8,38);circ(c,36,4,30);ell(c,0,14,66,22);
  if(face){c.fillStyle='#6a5a8a';ell(c,-12,2,3.5,5);ell(c,12,2,3.5,5);c.strokeStyle='#6a5a8a';c.lineWidth=2.5;c.beginPath();c.arc(0,8,6,.2,Math.PI-.2);c.stroke();c.fillStyle='rgba(255,140,180,.5)';ell(c,-22,12,6,3.5);ell(c,22,12,6,3.5);}c.restore();}
function sun(c,x,y,r,rot){c.save();c.translate(x,y);c.rotate(rot);c.fillStyle='rgba(255,230,120,.35)';circ(c,0,0,r*2.2);c.fillStyle='#ffe066';for(let i=0;i<10;i++){c.save();c.rotate(i/10*TAU);rr(c,-7,-r-26,14,22,7);c.fill();c.restore();}c.restore();
  c.fillStyle=gfill(c,x,y,r,'#ffd23a',.4,-.1);circ(c,x,y,r);
  c.fillStyle='#8a5a3a';ell(c,x-r*.32,y-r*.05,4,6);ell(c,x+r*.32,y-r*.05,4,6);c.strokeStyle='#8a5a3a';c.lineWidth=3;c.beginPath();c.arc(x,y+r*.15,r*.28,.2,Math.PI-.2);c.stroke();c.fillStyle='rgba(255,120,120,.45)';ell(c,x-r*.55,y+r*.2,7,4);ell(c,x+r*.55,y+r*.2,7,4);}
function tree(c,x,y,s,col){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='rgba(60,90,40,.18)';ell(c,0,0,40,10);c.fillStyle=vfill(c,-50,0,'#b0784a');rr(c,-8,-50,16,52,6);c.fill();col=col||'#5cc46a';c.fillStyle=gfill(c,0,-80,60,col,.3,-.18);circ(c,0,-80,42);circ(c,-30,-58,28);circ(c,30,-58,28);c.fillStyle='rgba(255,255,255,.25)';circ(c,-14,-96,14);
  c.fillStyle='#ff6f91';circ(c,18,-80,6);circ(c,-22,-66,6);circ(c,6,-104,5);c.restore();}
function flowers(c,x0,x1,y0,y1,seed){let s=seed;const r=()=>{s=(s*9301+49297)%233280;return s/233280;};const cols=['#fff','#ffb3d6','#ffe36a','#c8b0ff','#ff8a8a'];
  for(let x=x0;x<x1;x+=38){const x2=x+r()*30,y=y0+r()*(y1-y0),cc=cols[Math.floor(r()*5)],sw=Math.sin(T*2+x2)*1.5;c.fillStyle='#4cae4a';c.fillRect(x2-1,y,2,10);c.fillStyle=cc;for(let k=0;k<5;k++){const a=k/5*TAU;circ(c,x2+sw+Math.cos(a)*5,y+Math.sin(a)*5,4);}c.fillStyle='#ffd23a';circ(c,x2+sw,y,3);}}
function titleText(c,text,x,y,size,col){c.font=`${size}px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.fillStyle='rgba(90,40,110,.2)';c.fillText(text,x+3,y+5);c.lineWidth=size*.22;c.strokeStyle='#fff';c.strokeText(text,x,y);c.fillStyle=col;c.fillText(text,x,y);}
function bird(c,x,y,t){c.strokeStyle='#5a5a7a';c.lineWidth=3;c.lineCap='round';const f=Math.sin(t*10)*6;c.beginPath();c.moveTo(x-12,y-f);c.quadraticCurveTo(x-6,y-8,x,y);c.quadraticCurveTo(x+6,y-8,x+12,y-f);c.stroke();}

// ================= title =================
SCN.title={bg:'#bfe9ff',song:'town',enter(){},
  draw(c){skyBg(c,'#7fd0ff','#e8f8ff',H);sun(c,500,120,48,T*.3);cloud(c,(T*20)%800-100,220,1,true);cloud(c,(T*14+400)%800-100,340,.7);bird(c,(T*40)%700-50,280,T);bird(c,(T*40+40)%700-50,300,T+.3);
    const hg=c.createLinearGradient(0,H-260,0,H);hg.addColorStop(0,'#b8ec8a');hg.addColorStop(1,'#7ccc5c');c.fillStyle=hg;ell(c,120,H-120,340,170);c.fillStyle='#8ad86a';ell(c,520,H-90,360,170);c.fillStyle='#7ccc5c';c.fillRect(-400,H-100,W+800,120);flowers(c,0,W,H-90,H-20,7);
    const txt='ふーちゃんのまち';c.font=`62px ${POP}`;const tw=c.measureText(txt).width;let x=W/2-tw/2;const cols=['#ff5fa2','#ffb03a','#5aa8ff','#6cd08a','#b86af0','#ff5f6f','#3cc8d8','#ff8cc0'];
    [...txt].forEach((ch,i)=>{const w=c.measureText(ch).width;titleText(c,ch,x+w/2,H*.2+Math.sin(T*4+i*.6)*6,62,cols[i%8]);x+=w;});
    c.font=`800 24px ${FONT}`;c.fillStyle='#5a7ab8';c.textAlign='center';c.fillText('Fu-chan Town',W/2,H*.2+62);
    drawFuka(c,W/2-70,H*.66,{outfit:outfit(),t:T,dir:0,sc:4.8,wave:1});drawRikki(c,W/2+140,H*.66,{sc:3.6,t:T});this.rkPos={x:W/2+140,y:H*.66,sc:3.6};
    drawBtn(c,W/2,H*.8,62,'#ff6fa8','play',true);},
  down(x,y){if(this.rkPos&&rkHit(x,y,this.rkPos.x,this.rkPos.y,this.rkPos.sc))return;sfx('pop');go('map');setTimeout(()=>say('ふーちゃんの まちへ ようこそ！ どこへ いこうかな？'),800);}};

// ================= map =================
const CATS=[
  {id:'c_special',name:'とくべつ',roof:'#ff5f9a',wall:'#fff0f6',icon:'nyan',ja:'とくべつ アトラクション',places:['detective','fuwa']},
  {id:'c_shop',name:'おみせやさん',roof:'#ff8cc0',wall:'#fff4f8',icon:'cake',ja:'おみせの まち',places:['cake','pizza','icecream','sushi','shop','dress','salon']},
  {id:'c_care',name:'おせわの いえ',roof:'#ff9a5a',wall:'#fff6ee',icon:'puppy',ja:'おせわの いえ',places:['doctor','brush','bath','pet','tidy']},
  {id:'c_learn',name:'まなびの もり',roof:'#4cae6a',wall:'#f0fff0',icon:'letterA',ja:'まなびの もり',places:['school','shiri','puzzle','nurie','music','blocks']},
  {id:'c_fun',name:'あそびの ひろば',roof:'#ffa030',wall:'#fff8e8',icon:'ferris',ja:'あそびの ひろば',places:['yuen','crane','dance','festival','zoo','hide','daruma']},
  {id:'c_sports',name:'うんどうかい',roof:'#3a8ad8',wall:'#f0f6ff',icon:'medal',ja:'うんどうかい',places:['race','obst','tama']},
  {id:'c_work',name:'はたらく くるま',roof:'#e8a000',wall:'#fffae8',icon:'excavator',ja:'はたらく くるまの まち',places:['fire','kouji','carwash','airport','farm']},
  {id:'c_adv',name:'ぼうけん',roof:'#7a5ad8',wall:'#f4f0ff',icon:'rocket',ja:'ぼうけんの みなと',places:['space','sea','train','snow']}];
CATS.forEach(q=>q.isCatG=true);
function catOf(id){const q=CATS.find(q=>q.places.includes(id));return q?q.id:null;}
SCN.map={bg:'#a8e488',song:'town',cat:null,
  RG(r){return 890+r*360;},
  lay(){const C=this.cat&&CATS.find(q=>q.id===this.cat);const list=C?C.places.map(id=>PLACES.find(p=>p.id===id)).filter(Boolean):CATS;this.cells=list.map((p,i)=>({p,x:i%2?450:150,G:this.RG(Math.floor(i/2)),s:.8}));this.WH=Math.max(H+10,this.RG(Math.floor((list.length-1)/2))+200);},
  enter(){if(this.nextCat!==undefined){this.cat=this.nextCat;delete this.nextCat;}else if(this.lastId&&!this.lastId.startsWith('c_'))this.cat=catOf(this.lastId);this.lay();if(!this.fu){this.clouds=[...Array(5)].map((_,i)=>({x:i*150+rand(0,80),y:rand(50,150),s:rand(.5,.75),b:0}));this.balloons=[];this.balT=2;this.sunSpin=0;this.birds=[...Array(2)].map(()=>({x:rand(0,W),y:rand(80,160),s:rand(40,70)}));
      this.fu={x:300,y:430,path:[],dir:0,moving:false,jump:0,sp:600};this.trail=[];this.rk={x:240,y:440};this.cam=0;}
    this.opening=null;this.follow=true;this.vy=0;this.pan=null;const fu=this.fu;fu.path=[];fu.moving=false;fu.go=null;if(!this.lastId){fu.x=300;fu.y=430;this.rk.x=240;this.rk.y=440;this.trail=[];}
    if(this.lastId){const cl=this.cells.find(q=>q.p.id===this.lastId);if(cl){fu.x=cl.x;fu.y=cl.G+8;fu.path=[{x:cl.x,y:cl.G+34}];this.rk.x=cl.x+(cl.x<300?50:-50);this.rk.y=cl.G+40;this.trail=[];}}
    this.cam=clamp(fu.y-H*.55,0,this.WH-H);if(this.pendWalk){const cl=this.cells.find(q=>q.p.id===this.pendWalk);this.pendWalk=null;if(cl)setTimeout(()=>{if(scene===this)this.goCell(cl);},500);}
    if(this.cat){const C=CATS.find(q=>q.id===this.cat);setTimeout(()=>{if(scene===this&&!this.fu.moving)say(C.ja+'！ どれで あそぶ？');},700);}},
  walkTo(tx,ty,cell){const fu=this.fu,P=[];const onRow=Math.abs(fu.y-ty)<6;
    if(!onRow){if(Math.abs(fu.x-300)>4)P.push({x:300,y:fu.y});P.push({x:300,y:ty});}P.push({x:tx,y:ty});if(cell)P.push({x:cell.x,y:cell.G+6,door:cell});
    let dist=0,px=fu.x,py=fu.y;for(const q of P){dist+=Math.hypot(q.x-px,q.y-py);px=q.x;py=q.y;}fu.sp=clamp(dist/2.4,560,1700);fu.path=P;fu.go=cell||null;this.follow=true;this.vy=0;},
  goCell(cl){if(this.opening)return;sfx('pop');say(cl.p.ja+(cl.p.isCatG?'へ いこう！':'に いこう！'));this.walkTo(cl.x,cl.G+34,cl);},
  toTop(){sfx('whoosh');this.nextCat=null;this.lastId=this.cat;go('map');},
  drawGate(c,C,G){const Tp=G-300,open=this.opening&&this.opening.p===C,col=C.roof;c.lineJoin='round';
    c.fillStyle='rgba(60,50,90,.15)';rr(c,-128,Tp+16,270,300,18);c.fill();
    c.fillStyle=vfill(c,Tp,G,C.wall,.08,-.08);rr(c,-140,Tp+30,280,270,[24,24,4,4]);c.fill();c.strokeStyle=shade(col,-.15);c.lineWidth=5;c.stroke();
    for(const sd of[-1,1]){c.fillStyle=vfill(c,Tp,G,col,.15,-.15);rr(c,sd>0?96:-146,Tp-10,50,310,[20,20,4,4]);c.fill();c.fillStyle=shade(col,.35);circ(c,sd*121,Tp-18,22);c.fillStyle='#ffd23a';star(c,sd*121,Tp-18,12,5);c.fill();}
    c.fillStyle=vfill(c,Tp-40,Tp+40,col,.2,-.1);c.beginPath();c.moveTo(-150,Tp+40);c.quadraticCurveTo(0,Tp-70,150,Tp+40);c.lineTo(150,Tp+60);c.quadraticCurveTo(0,Tp-40,-150,Tp+60);c.closePath();c.fill();
    for(let i=0;i<9;i++){const u=i/8,x=-130+u*260,y=Tp+62-Math.sin(u*Math.PI)*60;c.fillStyle=['#ff5f6f','#ffd23a','#5aa8ff','#6cd08a'][i%4];c.beginPath();c.moveTo(x-9,y);c.lineTo(x+9,y);c.lineTo(x,y+16);c.fill();}
    c.fillStyle='#fff';circ(c,0,Tp-40,40);c.strokeStyle=col;c.lineWidth=5;c.beginPath();c.arc(0,Tp-40,40,0,TAU);c.stroke();drawThing(c,C.icon,0,Tp-40,1.1);
    c.fillStyle='#fff';rr(c,-128,Tp+30,256,48,24);c.fill();c.strokeStyle=col;c.lineWidth=5;c.stroke();c.fillStyle=shade(col,-.35);c.font=`800 30px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(C.name,0,Tp+55,236);
    c.fillStyle='rgba(255,255,255,.92)';rr(c,-88,Tp+90,176,100,16);c.fill();c.strokeStyle=shade(col,.3);c.lineWidth=3;c.stroke();
    const ps=C.places.slice(0,6);ps.forEach((id,i)=>{const pl=PLACES.find(p=>p.id===id);if(!pl)return;const n=ps.length,cols=n>4?3:2,rows=Math.ceil(n/cols);const gx=-88+176*(i%cols+.5)/cols,gy=Tp+86+104*(Math.floor(i/cols)+.5)/rows;drawThing(c,pl.icon,gx,gy,rows>1?.58:.8);});
    const got=STK.filter(s=>C.places.includes(s.place)&&SAVE.stickers.includes(s.id)).length,tot=STK.filter(s=>C.places.includes(s.place)).length;c.fillStyle='#fff';rr(c,-58,Tp+196,116,26,13);c.fill();c.fillStyle=shade(col,-.3);c.font=`800 16px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(`★ ${got}/${tot}`,0,Tp+209);
    c.fillStyle=open?'#4a3050':vfill(c,G-74,G,shade(col,-.1));rr(c,-52,G-74,104,74,[52,52,0,0]);c.fill();if(!open){c.fillStyle='rgba(255,255,255,.3)';rr(c,-40,G-64,80,26,[40,40,4,4]);c.fill();}},
  update(dt){const fu=this.fu;if(this.chestT>0){this.chestT+=dt;if(this.chestT>1.2){this.chestT=0;SAVE.quest.chest=false;newQuest();celebrate('chest');}}if(fu.jump>0)fu.jump=Math.max(0,fu.jump-dt*2.2);
    if(this.opening){this.opening.t+=dt;fu.y-=dt*30;if(this.opening.t>.75){const p=this.opening.p;this.opening=null;if(p.isCatG){this.nextCat=p.id;this.lastId=null;go('map');}else{this.lastId=p.id;go(p.id);}}}
    else if(fu.path.length){const q=fu.path[0],dx=q.x-fu.x,dy=q.y-fu.y,dl=Math.hypot(dx,dy),st=fu.sp*dt;fu.moving=true;
      if(Math.abs(dx)>Math.abs(dy))fu.dir=dx<0?1:2;else fu.dir=dy<0?3:0;
      if(dl<=st){fu.x=q.x;fu.y=q.y;fu.path.shift();if(q.door){fu.path=[];fu.moving=false;fu.dir=3;this.opening={p:q.door.p,t:0};sfx('open');}}else{fu.x+=dx/dl*st;fu.y+=dy/dl*st;}}
    else fu.moving=false;
    const lt=this.trail[this.trail.length-1];if(!lt||Math.hypot(lt.x-fu.x,lt.y-fu.y)>6){this.trail.push({x:fu.x,y:fu.y});if(this.trail.length>40)this.trail.shift();}
    const rt=this.trail[Math.max(0,this.trail.length-13)];if(rt&&(fu.moving||this.opening)){const rk=this.rk;const dx=rt.x-rk.x,dy=rt.y-rk.y;rk.moving=Math.hypot(dx,dy)>3;rk.dir=Math.abs(dx)>Math.abs(dy)?(dx<0?1:2):(dy<0?3:0);rk.x+=dx*Math.min(1,dt*10);rk.y+=dy*Math.min(1,dt*10);}else this.rk.moving=false;
    if(this.follow){const tc=clamp(fu.y-H*.55,0,this.WH-H);this.cam+=(tc-this.cam)*Math.min(1,dt*5);}else if(!this.pan&&this.vy){this.cam=clamp(this.cam+this.vy*dt,0,this.WH-H);this.vy*=Math.pow(.04,dt);if(Math.abs(this.vy)<8)this.vy=0;}
    for(const cl of this.clouds){cl.x+=dt*10;if(cl.x>W+120)cl.x=-120;if(cl.b>0)cl.b-=dt;}
    for(const b of this.birds){b.x+=b.s*dt;if(b.x>W+60){b.x=-60;b.y=rand(80,170);}}
    this.balT-=dt;if(this.balT<=0){this.balT=rand(5,9);this.balloons.push({x:rand(60,W-60),y:this.cam+H+60,col:pick(['#ff6f91','#ffd23a','#5aa8ff','#6cd08a','#b48cff']),t:rand(0,6)});}
    for(let i=this.balloons.length-1;i>=0;i--){const bl=this.balloons[i];bl.y-=70*dt;bl.t+=dt;if(bl.y<this.cam-150)this.balloons.splice(i,1);}
    if(this.sunSpin>0)this.sunSpin-=dt;},
  drawBuilding(c,p,G){const x=0,w=280,h=290,L=x-w/2,Tp=G-h;const open=this.opening&&this.opening.p===p;const beat=Math.abs(Math.sin(T*Math.PI*132/60));
    c.fillStyle='rgba(60,50,90,.15)';rr(c,L+12,Tp+16,w,h,18);c.fill();
    if(p.id==='bath'){c.fillStyle='#e87a6a';rr(c,x+70,Tp-70,34,60,6);c.fill();for(let i=0;i<3;i++){const t=(T*.5+i/3)%1;c.fillStyle=`rgba(255,255,255,${.8*(1-t)})`;circ(c,x+87+Math.sin(t*6)*8,Tp-80-t*80,10+t*14);}}
    if(p.id==='detective'){c.fillStyle=vfill(c,Tp-150,Tp,'#9a6ae8',.15,-.1);rr(c,x-46,Tp-120,92,130,8);c.fill();c.fillStyle='#5a2ab0';c.beginPath();c.moveTo(x-60,Tp-112);c.lineTo(x,Tp-176);c.lineTo(x+60,Tp-112);c.closePath();c.fill();
      c.fillStyle='#fff6d0';circ(c,x,Tp-76,26);c.strokeStyle='#ffd23a';c.lineWidth=5;c.beginPath();c.arc(x,Tp-76,26,0,TAU);c.stroke();c.fillStyle='#ff5fa2';heartP(c,x,Tp-76,12+Math.sin(T*4)*1.5);c.fill();
      SPECIAL_THING.heartgem(c,x,Tp-186+Math.sin(T*2)*4,.8);for(let i=0;i<4;i++){const a=T*1.5+i*1.57;c.fillStyle='#ffe36a';star(c,x+Math.cos(a)*80,Tp-120+Math.sin(a)*30,7,3,4);c.fill();}}
    if(p.id==='fuwa'){c.lineWidth=16;['#ff8cc0','#ffd23a','#8ef0b0','#7ad8ff','#b8a0ff'].forEach((cc,i)=>{c.strokeStyle=cc;c.globalAlpha=.75;c.beginPath();c.arc(x,Tp+30,190-i*15,Math.PI*1.05,Math.PI*1.95);c.stroke();});c.globalAlpha=1;
      cloud(c,x-170,Tp-10,.7,true);cloud(c,x+170,Tp-10,.7,true);}
    if(p.id==='school'){c.fillStyle='#fff6e6';rr(c,x-34,Tp-96,68,90,8);c.fill();c.fillStyle='#ff5f6f';c.beginPath();c.moveTo(x-46,Tp-90);c.lineTo(x,Tp-132);c.lineTo(x+46,Tp-90);c.closePath();c.fill();c.save();c.translate(x,Tp-58);c.rotate(Math.sin(T*3)*.3);c.fillStyle='#ffd23a';c.beginPath();c.arc(0,0,16,Math.PI,TAU);c.lineTo(16,6);c.lineTo(-16,6);c.fill();c.fillStyle='#e8a800';circ(c,0,10,5);c.restore();}
    const wg=c.createLinearGradient(L,0,L+w,0);wg.addColorStop(0,shade(p.wall,.1));wg.addColorStop(.5,p.wall);wg.addColorStop(1,shade(p.wall,-.08));c.fillStyle=wg;rr(c,L,Tp,w,h,[18,18,4,4]);c.fill();c.strokeStyle=shade(p.wall,-.18);c.lineWidth=4;c.stroke();
    c.fillStyle=vfill(c,Tp-60,Tp+14,p.roof,.18,-.1);
    if(['doctor','bath','school','brush','detective'].includes(p.id)){c.beginPath();c.moveTo(L-22,Tp+14);c.lineTo(x,Tp-60);c.lineTo(L+w+22,Tp+14);c.closePath();c.fill();c.fillStyle=shade(p.roof,.25);c.beginPath();c.moveTo(L-8,Tp+6);c.lineTo(x,Tp-44);c.lineTo(x+10,Tp-40);c.lineTo(L+6,Tp+12);c.fill();}
    else if(['dress','cake','music','fuwa'].includes(p.id)){c.beginPath();c.ellipse(x,Tp+10,w/2+16,70,0,Math.PI,TAU);c.fill();c.fillStyle=shade(p.roof,.3);for(let i=0;i<5;i++){c.beginPath();c.ellipse(x-w/2+28+i*56,Tp+10,28,16,0,0,Math.PI);c.fill();}}
    else{rr(c,L-14,Tp-26,w+28,40,14);c.fill();}
    if(p.id!=='zoo'){for(let i=0;i<8;i++){c.fillStyle=i%2?'#fff':p.roof;c.beginPath();const sx=L+8+i*(w-16)/8,sw=(w-16)/8;c.moveTo(sx,Tp+120);c.lineTo(sx+sw,Tp+120);c.lineTo(sx+sw,Tp+140);c.quadraticCurveTo(sx+sw/2,Tp+152,sx,Tp+140);c.closePath();c.fill();}}
    if(p.id==='cake')drawItem(c,'cake',x,Tp-58,2.2);
    if(p.id==='dress')drawItem(c,'crown',x,Tp-72+Math.sin(T*3)*3,1.4);
    if(p.id==='doctor'){c.fillStyle='#ff4d6d';c.fillRect(x-8,Tp-40,16,40);c.fillRect(x-20,Tp-28,40,16);}
    if(p.id==='shop')drawItem(c,'cart',x,Tp-50,1.6);
    if(p.id==='zoo'){for(const [dx,k] of [[-80,'rabbit'],[80,'panda']])drawAnimal(c,k,x+dx,Tp+4,.62,{t:T+dx});}
    if(p.id==='festival'){c.strokeStyle='#6a4a3a';c.lineWidth=2;c.beginPath();c.moveTo(L-10,Tp-20);c.quadraticCurveTo(x,Tp+20,L+w+10,Tp-20);c.stroke();for(let i=0;i<6;i++){const lx=L+10+i*52,ly=Tp-16+Math.sin(i/5*Math.PI)*28;c.fillStyle='rgba(255,220,120,.35)';circ(c,lx,ly+14,20);c.fillStyle=gfill(c,lx,ly+12,14,i%2?'#ff4a3a':'#ffffff');ell(c,lx,ly+14,11,14);c.fillStyle='#3a2a2a';c.fillRect(lx-7,ly-1,14,3);c.fillRect(lx-7,ly+27,14,3);}}
    if(p.id==='nurie'){drawItem(c,'crayon',x-60,Tp-40,1.6);drawItem(c,'palette',x+50,Tp-44,1.5);for(const [a,b,cc] of [[-90,190,'#ff5f7a'],[95,200,'#5aa8ff'],[-100,240,'#ffd23a'],[100,250,'#6cd08a']]){c.fillStyle=cc;c.globalAlpha=.6;circ(c,x+a,Tp+b,12);c.globalAlpha=1;}}
    if(p.id==='puzzle'){c.save();c.translate(x,Tp-70);c.rotate(Math.sin(T*2)*.1);drawItem(c,'puzzle',0,0,1.9);c.restore();}
    if(p.id==='detective'){c.save();c.translate(x+104,Tp+40);c.rotate(Math.sin(T*2)*.15);SPECIAL_THING.lens(c,0,0,1);c.restore();drawNyan(c,x-112,Tp+196,.42,T,'happy');}
    if(p.id==='fuwa'){drawFriend(c,FR.miru,x-104,Tp+4,.55,{t:T,wave:1});drawFriend(c,FR.purin,x+104,Tp+4,.55,{t:T+1});c.fillStyle='#ff8cc0';heartP(c,x,Tp-52+Math.sin(T*3)*4,16);c.fill();}
    if(p.id==='yuen'){SPECIAL_THING.ferris(c,x+90,Tp-60,2.2);SPECIAL_THING.cotton(c,x-90,Tp-40,1.4);}
    if(p.id==='space'){c.save();c.translate(x+80,Tp-70-Math.abs(Math.sin(T*2))*10);c.rotate(.3);SPECIAL_THING.rocket(c,0,0,1.8);c.restore();c.fillStyle='#ffd23a';star(c,x-70,Tp-80,16,7);c.fill();star(c,x-30,Tp-110,10,4);c.fill();}
    if(p.id==='train'){drawEngine(c,x,Tp-8,.5,'#ff5f6f',T);}
    if(p.id==='sea'){c.fillStyle='#7ac8ff';for(let i=0;i<5;i++){c.beginPath();c.arc(x-120+i*60,Tp-10,30,Math.PI,TAU);c.fill();}drawSea(c,'whale',x+30,Tp-60,.4,T);}
    if(p.id==='snow'){c.fillStyle='#fff';for(let i=0;i<7;i++)circ(c,x-150+i*50,Tp-22,24);SPECIAL_THING.snowman(c,x+70,Tp-70,1.9);}
    if(p.id==='pizza'){SPECIAL_THING.pizza(c,x,Tp-50,2);SPECIAL_THING.chefhat(c,x+100,Tp-40,1.4);}
    if(p.id==='icecream'){SPECIAL_THING.icecone(c,x-70,Tp-50,2);SPECIAL_THING.sundae(c,x+70,Tp-40,1.6);}
    if(p.id==='sushi'){c.fillStyle='#3a2a4a';rr(c,x-150,Tp-24,300,30,6);c.fill();SPECIAL_THING.nigiri(c,x-50,Tp-60,1.6);SPECIAL_THING.maki(c,x+60,Tp-54,1.4);}
    if(p.id==='salon'){SPECIAL_THING.lionface(c,x,Tp-70,1.6);SPECIAL_THING.scissors(c,x+110,Tp-40,1.4);}
    if(p.id==='carwash'){drawCarS(c,x,Tp-4,.42,'#ff5f6f',T);for(let i=0;i<4;i++){c.fillStyle='rgba(255,255,255,.8)';circ(c,x-80+i*50,Tp-100-((T*40+i*20)%40),8);}}
    if(p.id==='farm'){drawTractor(c,x-40,Tp-4,.5,T);SPECIAL_THING.pumpkin(c,x+100,Tp-30,1.4);}
    if(p.id==='kouji'){drawExcavator(c,x-20,Tp-4,.4,0,T);SPECIAL_THING.tcone(c,x+110,Tp-30,1.3);}
    if(p.id==='tidy'){SPECIAL_THING.toybox(c,x-70,Tp-40,1.6);SPECIAL_THING.recyclebin(c,x+80,Tp-40,1.5);}
    if(p.id==='pet'){drawAnimal(c,'dog',x-50,Tp+4,.5,{t:T,happy:1});drawAnimal(c,'cat',x+60,Tp+4,.45,{t:T+1,happy:1});}
    if(p.id==='airport'){drawPlane(c,x,Tp-70+Math.sin(T*2)*6,.5,T,-.1);}
    if(p.id==='crane'){c.fillStyle='#ff6fae';rr(c,x-50,Tp-120,100,120,10);c.fill();c.fillStyle='#e8f6ff';rr(c,x-40,Tp-110,80,70,6);c.fill();drawClaw(c,x+Math.sin(T)*20,Tp-96,.8,.3);drawAnimal(c,'bear',x-14,Tp-42,.18,{t:0});}
    if(p.id==='blocks'){SPECIAL_THING.blocktower(c,x-70,Tp-60,1.6);SPECIAL_THING.blockhouse(c,x+70,Tp-40,1.6);}
    if(p.id==='dance'){SPECIAL_THING.discoball(c,x,Tp-80,1.8);drawItem(c,'note',x-90,Tp-60-Math.abs(Math.sin(T*4))*10,1.2);drawItem(c,'note',x+90,Tp-60-Math.abs(Math.cos(T*4))*10,1.2);}
    if(p.id==='fire'){drawFireTruck(c,x,Tp-6,.5,T,0,1);}
    if(p.id==='race'){drawMedal(c,x-70,Tp-60,1.6,'#ffd23a');SPECIAL_THING.flagcheck(c,x+70,Tp-60,1.8);}
    if(p.id==='obst'){SPECIAL_THING.hurdle(c,x-60,Tp-30,1.8);SPECIAL_THING.anpan(c,x+70,Tp-70+Math.sin(T*3)*5,1.4);}
    if(p.id==='tama'){drawBasket(c,x-40,Tp-90,.6,'#ff5f6f',1);drawBasket(c,x+80,Tp-70,.45,'#f4f4f8',1);}
    if(p.id==='shiri'){SPECIAL_THING.wordchain(c,x,Tp-66,2.2);}
    if(p.id==='hide'){SPECIAL_THING.bushpeek(c,x-90,Tp-30,2);SPECIAL_THING.boxpeek(c,x+90,Tp-30,1.8);}
    if(p.id==='daruma'){SPECIAL_THING.daruma(c,x,Tp-70+Math.abs(Math.sin(T*3))*-8,2.2);SPECIAL_THING.stopsign(c,x+110,Tp-50,1.4);}
    if(p.id==='music'){drawItem(c,'note',x,Tp-80-beat*10,1.5);}
    if(p.id==='brush'){drawItem(c,'tooth',x-30,Tp-78,1.5);c.save();c.translate(x+50,Tp-80);c.rotate(Math.sin(T*6)*.3);drawItem(c,'toothbrush',0,0,1.4);c.restore();}
    c.fillStyle='#fff';circ(c,x,Tp+64,50);c.strokeStyle=p.roof;c.lineWidth=6;c.beginPath();c.arc(x,Tp+64,50,0,TAU);c.stroke();drawThing(c,p.icon,x,Tp+64,1.45);
    for(const wx of[L+22,L+w-82]){c.fillStyle=vfill(c,Tp+168,Tp+220,'#bfe8ff',.2,-.1);rr(c,wx,Tp+168,60,52,10);c.fill();c.strokeStyle='#fff';c.lineWidth=5;c.stroke();c.beginPath();c.moveTo(wx+30,Tp+168);c.lineTo(wx+30,Tp+220);c.stroke();c.fillStyle='rgba(255,255,255,.5)';c.fillRect(wx+6,Tp+174,10,20);}
    c.fillStyle=open?'#4a3050':vfill(c,G-120,G,shade(p.roof,-.15));rr(c,x-40,G-120,80,120,[40,40,0,0]);c.fill();if(!open){c.fillStyle='#ffd23a';circ(c,x+24,G-58,6);c.fillStyle='rgba(255,255,255,.3)';rr(c,x-28,G-104,56,40,[28,28,4,4]);c.fill();}
    else{c.fillStyle=shade(p.roof,-.15);c.beginPath();c.moveTo(x+40,G);c.lineTo(x+40,G-120);c.lineTo(x+62,G-110);c.lineTo(x+62,G+6);c.closePath();c.fill();}
    const got=STK.filter(s=>s.place===p.id&&SAVE.stickers.includes(s.id)).length;for(let i=0;i<3;i++){c.fillStyle=i<got?'#ffd23a':'rgba(255,255,255,.7)';star(c,x-34+i*34,Tp+112,12,5.5);c.fill();c.strokeStyle=i<got?'#e8a800':'#d8c8e0';c.lineWidth=2;c.stroke();}},
  draw(c){const cam=this.cam,WH=this.WH;c.save();c.translate(0,-cam);
    if(cam<340){skyBg(c,'#6fc8ff','#e6f8ff',330);sun(c,500,90,34,T*.3+this.sunSpin*6);for(const b of this.birds)bird(c,b.x,b.y,T+b.s);for(const cl of this.clouds)cloud(c,cl.x,cl.y-(cl.b>0?Math.sin(cl.b*12)*8:0),cl.s,true);
      c.fillStyle='#c8ecf8';for(let i=-1;i<5;i++){const x=i*170+40;c.beginPath();c.moveTo(x-110,330);c.lineTo(x,220);c.lineTo(x+110,330);c.fill();}}
    c.fillStyle=vfill(c,300,WH,'#a8e488',.05,-.05);c.fillRect(-400,Math.max(310,cam),W+800,H+10);
    const y0=Math.max(360,cam-20),y1=Math.min(WH-60,cam+H+20);
    if(y1>y0){c.fillStyle='#f3e3c8';c.fillRect(262,y0,76,y1-y0);c.fillStyle='#e6d0ae';for(let y=Math.floor(y0/44)*44;y<y1;y+=44){c.fillRect(262,y,76,3);}c.strokeStyle='#fff';c.lineWidth=4;c.setLineDash([22,18]);c.beginPath();c.moveTo(300,y0);c.lineTo(300,y1);c.stroke();c.setLineDash([]);}
    c.fillStyle='#f3e3c8';rr(c,40,360,520,120,40);c.fill();c.fillStyle='#ffd0e6';circ(c,150,420,48);c.fillStyle='#8fd8ff';circ(c,150,420,38);for(let i=0;i<5;i++){const t2=(T*1.5+i/5)%1;c.fillStyle=`rgba(255,255,255,${1-t2})`;circ(c,150+Math.sin(i*2)*12,400-t2*40,5);}
    c.fillStyle='#ff8cc0';rr(c,160,300,280,52,26);c.fill();c.strokeStyle='#fff';c.lineWidth=4;c.stroke();c.fillStyle='#fff';c.font=`30px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.fillText(this.cat?CATS.find(q=>q.id===this.cat).name:'ふーちゃんのまち',300,327,270);
    for(const cl of this.cells){if(cl.G<cam-60||cl.G-420>cam+H)continue;c.fillStyle='#f3e3c8';c.fillRect(20,cl.G,560,56);c.fillStyle='#e6d0ae';c.fillRect(20,cl.G,560,4);c.fillStyle='#fff';for(let i=0;i<5;i++)c.fillRect(268+i*14,cl.G+8,8,44);}
    for(let r=0;r*360+890<WH;r++){const G=this.RG(r);if(G<cam-200||G-400>cam+H)continue;for(const x of [16,584]){c.fillStyle='#6cd07a';circ(c,x,G-160,26);circ(c,x,G-120,22);}flowers(c,0,30,G-100,G-20,r);flowers(c,570,W,G-100,G-20,r+3);}
    for(const cl of this.cells){if(cl.G<cam-60||cl.G-440>cam+H)continue;const p=cl.p,o=this.opening&&this.opening.p===p;const bump=o?1+Math.sin(this.opening.t*18)*.03:1;c.save();c.translate(cl.x,cl.G);c.scale(cl.s*bump,cl.s*bump);if(p.isCatG)this.drawGate(c,p,0);else this.drawBuilding(c,p,0);c.restore();
      c.font=`800 24px ${FONT}`;const tw=p.isCatG?200:c.measureText(p.name).width+30;const ly=p.isCatG?cl.G-252:cl.G-252;if(!p.isCatG){c.fillStyle='#fff';rr(c,cl.x-tw/2,ly-19,tw,38,19);c.fill();c.strokeStyle=p.roof;c.lineWidth=4;c.stroke();c.fillStyle=shade(p.roof,-.35);c.textAlign='center';c.textBaseline='middle';c.fillText(p.name,cl.x,ly+1);}
      if(p.big||p.nw||p.isCatG&&p.places.some(id=>{const q=PLACES.find(z=>z.id===id);return q&&(q.nw||q.big);})){c.fillStyle='#ff5f6f';rr(c,cl.x+tw/2-24,ly-34,52,24,12);c.fill();c.fillStyle='#fff';c.font=`800 14px ${FONT}`;c.fillText('NEW',cl.x+tw/2+2,ly-21);}
      const q=SAVE.quest;const inQ=p.isCatG?q.list.some(id=>p.places.includes(id)&&!q.done.includes(id)):q.list.includes(p.id);if(inQ){const tx=cl.x-tw/2-26,ty=ly;if(!p.isCatG&&q.done.includes(p.id)){c.fillStyle='#6cd08a';circ(c,tx,ty,18);c.strokeStyle='#fff';c.lineWidth=5;c.beginPath();c.moveTo(tx-8,ty);c.lineTo(tx-2,ty+7);c.lineTo(tx+9,ty-8);c.stroke();}
        else{const by=ty+Math.sin(T*5+cl.x)*6;c.fillStyle='#ff5f6f';c.beginPath();c.arc(tx,by,22,0,TAU);c.fill();c.strokeStyle='#fff';c.lineWidth=3;c.stroke();c.fillStyle='#fff';c.font=`900 28px ${FONT}`;c.fillText('！',tx,by+1);}}}
    if(!this.cat&&(SAVE.quest.chest||this.chestT>0)){drawChest(c,480,440,.8,this.chestT>0?easeOut(this.chestT):0,T);if(!this.chestT){c.font=`800 22px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.lineWidth=6;c.strokeStyle='#fff';const ty2=360+Math.sin(T*5)*4;c.strokeText('タッチ！',480,ty2);c.fillStyle='#ff5fa2';c.fillText('タッチ！',480,ty2);}}
    const fu=this.fu,rk=this.rk,o=this.opening;const jy=fu.jump>0?Math.sin(fu.jump*Math.PI)*50:0;const fa=o?Math.max(0,1-o.t*1.3):1;
    const drawR=()=>drawRikki(c,rk.x,rk.y,{sc:1.6,t:T,moving:rk.moving,dir:rk.moving?rk.dir:0,toy:!rk.moving&&!fu.moving});
    const drawF=()=>{c.globalAlpha=fa;drawFuka(c,fu.x,fu.y-jy,{outfit:outfit(),t:T,sc:2.1,dir:fu.moving||o?fu.dir:0,moving:fu.moving||!!o,wave:!fu.moving&&!o&&fu.jump<=0,cheer:fu.jump>0});c.globalAlpha=1;};
    if(rk.y<fu.y){drawR();drawF();}else{drawF();drawR();}this.rkPos=null;
    for(const bl of this.balloons){const x=bl.x+Math.sin(bl.t*1.5)*14;c.strokeStyle='#8a7a9a';c.lineWidth=2;c.beginPath();c.moveTo(x,bl.y+36);c.quadraticCurveTo(x+8,bl.y+60,x,bl.y+90);c.stroke();c.fillStyle=gfill(c,x,bl.y,32,bl.col);c.beginPath();c.ellipse(x,bl.y,28,34,0,0,TAU);c.fill();c.fillStyle='rgba(255,255,255,.5)';ell(c,x-9,bl.y-12,7,10);}
    c.restore();
    const k=cam/Math.max(1,this.WH-H);c.fillStyle='rgba(255,255,255,.6)';rr(c,W-14,150,8,H-230,4);c.fill();c.fillStyle='#ff8cc0';rr(c,W-18,150+k*(H-230-40),16,40,8);c.fill();
    {const q=SAVE.quest;c.fillStyle='rgba(255,255,255,.92)';rr(c,12,14,300,92,26);c.fill();c.strokeStyle='#ffb03a';c.lineWidth=4;c.stroke();c.fillStyle='#ffb03a';rr(c,22,4,104,26,13);c.fill();c.fillStyle='#fff';c.font=`800 16px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('おねがい',74,17);
      q.list.forEach((id,i)=>{const p=PLACES.find(p=>p.id===id),x=70+i*96,y=64,dn=q.done.includes(id);c.fillStyle=dn?'#e8fbe8':'#fff6e8';circ(c,x,y,34);c.strokeStyle=dn?'#6cd08a':'#ffd08a';c.lineWidth=3;c.beginPath();c.arc(x,y,34,0,TAU);c.stroke();if(p)drawThing(c,p.icon,x,y,.75);
        if(dn){c.fillStyle='#6cd08a';circ(c,x+24,y+22,13);c.strokeStyle='#fff';c.lineWidth=4;c.beginPath();c.moveTo(x+18,y+22);c.lineTo(x+23,y+27);c.lineTo(x+31,y+16);c.stroke();}});}
    drawBtn(c,W-56,60,40,'#ff8cc0','book',SAVE.stickers.length>0&&(T%6)<1);drawBtn(c,W-150,60,40,'#7ab8ff',SAVE.sound?'sound':'mute');
    if(this.cat){drawBtn(c,56,158,40,'#8ab8e8','prev');c.fillStyle='#fff';rr(c,20,202,72,26,13);c.fill();c.fillStyle='#3a6a9a';c.font=`800 15px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('まちへ',56,215);}
    if(cam>500&&!this.fu.moving){drawBtn(c,W-60,H-70,34,'#ffb03a','prev');c.fillStyle='#8a5a1a';c.font=`800 14px ${FONT}`;c.textAlign='center';c.fillText('うえへ',W-60,H-22);}},
  down(x,y){this.vy=0;this.pan={sy:y,ly:y,moved:false,c0:this.cam,lt:performance.now(),v:0};},
  move(x,y){const p=this.pan;if(!p)return;const dy=y-p.sy;if(Math.abs(dy)>14)p.moved=true;if(p.moved){this.follow=false;this.cam=clamp(p.c0-dy,0,this.WH-H);const now=performance.now(),dt=Math.max(1,now-p.lt)/1000;p.v=(p.ly-y)/dt;p.ly=y;p.lt=now;}},
  up(x,y){const p=this.pan;this.pan=null;if(!p)return;if(p.moved){this.vy=clamp(p.v,-3000,3000);return;}this.tap(x,y);},
  tap(x,y0){if(this.opening)return;
    if(hitC(x,y0,W-56,60,46)){sfx('tap');go('book');return;}
    if(hitC(x,y0,W-150,60,46)){SAVE.sound=!SAVE.sound;save();if(!SAVE.sound)hush();else sfx('ding');return;}
    if(this.cat&&hitC(x,y0,56,170,50)){this.toTop();return;}
    if(x<320&&y0<110){const q=SAVE.quest;sfx('tap');if(q.chest){say('おねがい ぜんぶ クリア！ たからばこは まちの ひろばに あるよ');if(this.cat){this.toTop();return;}this.follow=true;this.walkTo(420,470);return;}const i=Math.max(0,Math.min(2,Math.round((x-70)/96)));const id=q.list[i];const cl=this.cells.find(c2=>c2.p.id===id);if(cl&&!q.done.includes(id)){this.goCell(cl);}else if(!q.done.includes(id)&&catOf(id)){this.nextCat=catOf(id);this.lastId=null;this.pendWalk=id;say(placeName(id)+'に いこう！');go('map');}else say('おねがい！ '+q.list.filter(i=>!q.done.includes(i)).map(placeName).join('と ')+'で あそぼう！');return;}
    if(this.cam>500&&!this.fu.moving&&hitC(x,y0,W-60,H-70,44)){sfx('whoosh');this.follow=false;this.vy=-3000;return;}
    const y=y0+this.cam;
    for(let i=this.balloons.length-1;i>=0;i--){const bl=this.balloons[i];if(Math.hypot(x-bl.x,y-bl.y)<44){this.balloons.splice(i,1);sfx('pop');burst(x,y0,16);return;}}
    if(!this.cat&&SAVE.quest.chest&&!this.chestT&&Math.abs(x-480)<80&&y>380&&y<480){this.chestT=.01;sfx('open');say('たからばこ オープン！');return;}
    if(hitC(x,y,500,90,50)){this.sunSpin=1;sfx('spark');burst(x,y0,14,'star');say('おひさま ぽかぽか！');return;}
    for(const b of this.birds)if(hitC(x,y,b.x,b.y,34)){sfx('squeak');b.y-=30;burst(x,y0,6,'heart');sayPair('とり','bird');return;}
    const fu=this.fu;if(Math.abs(x-fu.x)<50&&y>fu.y-170&&y<fu.y+10){fu.jump=1;sfx('boing');say(pick(['やっほー！','あそぼう！','たのしいね！','ジャンプ！']));burst(x,y0-60,8,'heart');return;}
    if(rkHit(x,y,this.rk.x,this.rk.y,1.6)){RK.hop=1;rkCheer();say(pick(['りっきー！ きゃっきゃ！','ばぶー！','ねえね まって〜！']));burst(x,y0-30,8,'heart');return;}
    for(const cl of this.cells){if(Math.abs(x-cl.x)<118&&y>cl.G-290&&y<cl.G+20){this.goCell(cl);burst(x,y0,10,'star');return;}}
    for(const cl of this.cells){if(y>cl.G&&y<cl.G+56){sfx('tap');this.walkTo(clamp(x,40,560),cl.G+34);return;}}
    if(x>262&&x<338&&y>380){sfx('tap');this.walkTo(300,y);return;}
    if(y>360&&y<480){sfx('tap');this.walkTo(300,430);this.fu.path.push({x:clamp(x,60,540),y:430});return;}
    for(const cl of this.clouds)if(Math.abs(x-cl.x)<80*cl.s&&Math.abs(y-cl.y)<45*cl.s){cl.b=.6;sfx('boing');for(let i=0;i<10;i++)parts.push({x:x+rand(-40,40),y:y0+20,vx:0,vy:rand(100,200),life:1,t:0,kind:'drop',col:'#7ac8ff'});return;}},
  hint(){if(this.fu.moving||this.opening)return null;if(SAVE.quest.chest&&!this.cat){const y=440-this.cam;return y>100&&y<H-40?{x:480,y}:{x:70,y:64};}const q=SAVE.quest;const cl=this.cells.find(cl=>cl.p.isCatG?q.list.some(id=>cl.p.places.includes(id)&&!q.done.includes(id)):q.list.includes(cl.p.id)&&!q.done.includes(cl.p.id));if(!cl)return this.cat?{x:56,y:158}:null;const y=cl.G-120-this.cam;if(y>140&&y<H-60)return{x:cl.x,y};const i=Math.max(0,q.list.findIndex(id=>cl.p.isCatG?cl.p.places.includes(id):id===cl.p.id));return{x:70+i*96,y:64};},
  hintText(){return SAVE.quest.chest?'たからばこを タッチしてね！':'「！」の たてものを タッチ！ うえの おねがいを タッチしても いけるよ';}};

// ================= cake =================
SCN.cake={bg:'#ffe6f0',song:'play',
  colors:[['#ffffff','しろ','white'],['#ffb3d6','ピンク','pink'],['#9a643a','ちゃいろ','brown'],['#a8ecc8','みどり','green'],['#fff09a','きいろ','yellow'],['#cdb8ff','むらさき','purple']],
  tops:['strawberry','cherry','blueberry','choco','starcandy','heartcookie','candle'],
  enter(){Object.assign(this,{step:0,added:[],stir:0,lastA:null,stirring:false,bake:0,baking:false,cream:null,smooth:false,creamT:0,placed:[],dr:null,bites:0,fin:0,cc:null,act:null,eater:0,eatT:0});this.lay();
    this.ing=[new Dr({k:'egg',hx:150,hy:H-80,r:56}),new Dr({k:'flour',hx:300,hy:H-80,r:56}),new Dr({k:'milk',hx:450,hy:H-80,r:56})];
    this.cells=[];for(let y=-40;y<=40;y+=18)for(let x=-160;x<=160;x+=18)if((x/165)**2+(y/44)**2<=1)this.cells.push({x,y,col:null});
    const ci=Math.random()*this.colors.length|0,tp=pick(this.tops.slice(0,6));this.cust={k:pick(['bear','rabbit','cat','dog','panda','pig']),cream:this.colors[ci][0],cj:this.colors[ci][1],top:tp,hop:0,react:0};this.perfect=false;
    this.rainbow=Math.random()<(lvOf('cake')>=2?.35:.15);
    say(`${WORDS[this.cust.k][0]}さんの ちゅうもん！ 「${this.cust.cj}の クリームで ${WORDS[tp][0]}を のせた ケーキ ください！」`);setTimeout(()=>{if(scene===this&&this.step===0)say('ざいりょうを ボウルに いれてね');},5200);},
  lay(){this.cx=300;this.cy=H*.46;},
  pal(i){return{x:70+i*92,y:165};},
  trayP(i){return{x:58+i*81,y:H-78};},
  chk(){return{x:520,y:H-205};},
  bowlC(){return{x:300,y:this.cy-30};},
  update(dt){for(const d of this.ing)d.upd(dt);if(this.act){this.act.t+=dt;if(this.act.t>1){const k=this.act.k;this.act=null;this.added.push(k);sfx('ding');if(this.added.length===3){say('ぐるぐる まぜよう！ ボウルの なかを ゆびで ぐるぐる まわしてね');}}}
    if(this.creamT<1)this.creamT=Math.min(1,this.creamT+dt*2);if(this.eatT>0)this.eatT-=dt;
    if(this.baking){this.bake+=dt/4;if(Math.floor(this.bake*8)!==Math.floor((this.bake-dt/4)*8))sfx('tick');if(this.bake>=1){this.baking=false;this.bake=1;sfx('chin');rkCheer();burst(300,this.cy-40,24,'star');if(this.rainbow){confetti(60);sfx('fanfare');say('わあ！ ひみつの レインボーケーキが やけたよ！ つぎは クリームを ぬろう');}else say('やけた！ ふわふわ！ つぎは クリームを ぬろう');setTimeout(()=>{if(scene===this&&this.step===1){this.step=2;}},1400);}}
    if(this.cust.hop>0)this.cust.hop-=dt*2;if(this.fin>0){this.fin+=dt;if(this.fin>2&&this.fin<9){this.fin=9;celebrate('cake',this.perfect);}}},
  batterCol(){const k=clamp(this.stir/(TAU*4),0,1);return this.added.length<3?'#fff4c8':(k<1?'#fff0b8':'#ffe39a');},
  drawBowl(c){const b=this.bowlC(),lvl=this.added.length/3;
    c.fillStyle='rgba(90,40,110,.15)';ell(c,b.x,b.y+150,150,20);
    c.fillStyle='#cfe0f0';ell(c,b.x,b.y,180,52);
    if(lvl>0){c.save();c.beginPath();c.ellipse(b.x,b.y,176,50,0,0,TAU);c.clip();c.fillStyle=this.batterCol();ell(c,b.x,b.y+(1-lvl)*16,170*Math.min(1,.6+lvl*.4),46);
      if(this.added.length>=3){const k=clamp(this.stir/(TAU*4),0,1);c.strokeStyle='rgba(230,190,110,.6)';c.lineWidth=3;for(let i=0;i<3;i++){c.beginPath();c.ellipse(b.x,b.y,40+i*40,12+i*11,0,this.stir+i,this.stir+i+3.5);c.stroke();}
        if(k<1){c.fillStyle='#fffaf0';for(let i=0;i<14*(1-k);i++){const a=i*2.3+this.stir*.2;circ(c,b.x+Math.cos(a)*(40+i*7),b.y+Math.sin(a)*(10+i*2),5);}}}
      if(this.added.includes('egg')){c.fillStyle='#ffc83a';ell(c,b.x+30+Math.sin(this.stir)*40,b.y+2,14*(1-clamp(this.stir/(TAU*2),0,1)),8*(1-clamp(this.stir/(TAU*2),0,1)));}c.restore();}
    const g=c.createLinearGradient(b.x-180,0,b.x+180,0);g.addColorStop(0,'#b8d8f0');g.addColorStop(.35,'#f4fbff');g.addColorStop(1,'#a8c8e8');c.fillStyle=g;c.beginPath();c.ellipse(b.x,b.y,180,160,0,0,Math.PI);c.closePath();c.fill();c.strokeStyle='#8ab0d8';c.lineWidth=4;c.stroke();
    c.strokeStyle='#fff';c.lineWidth=8;c.beginPath();c.ellipse(b.x,b.y,180,52,0,0,TAU);c.stroke();c.strokeStyle='#8ab0d8';c.lineWidth=2;c.stroke();
    c.fillStyle='#ff9ac8';for(let i=0;i<5;i++){heartP(c,b.x-90+i*45,b.y+70+Math.sin(i)*6,7);c.fill();}},
  drawOven(c){const cy=this.cy,k=this.bake;c.fillStyle='rgba(90,40,110,.15)';rr(c,118,cy-170,380,340,34);c.fill();c.fillStyle=vfill(c,cy-180,cy+160,'#ffb3d6',.2,-.12);rr(c,110,cy-180,380,340,34);c.fill();c.strokeStyle='#e070a8';c.lineWidth=5;c.stroke();
    c.fillStyle='#3a2a40';rr(c,150,cy-140,300,190,26);c.fill();const glow=this.baking?.5+Math.sin(T*8)*.1:k>=1?.2:0;c.fillStyle=`rgba(255,150,60,${glow})`;rr(c,150,cy-140,300,190,26);c.fill();
    c.fillStyle='#8a8aa0';c.fillRect(170,cy+20,260,6);c.fillStyle='#c0c0d0';rr(c,200,cy-4,200,26,6);c.fill();
    const h=24+ease(k)*56;c.fillStyle=gfill(c,280,cy-h,80,k>.6?(this.rainbow?['#ff8a9a','#ffe36a','#9ee68a','#7ac8ff','#b89aff'][Math.floor(T*6)%5]:'#e8a850'):'#fff0b8');rr(c,206,cy-h+2,188,h,[30,30,4,4]);c.fill();
    if(this.baking){c.strokeStyle='rgba(255,210,120,.8)';c.lineWidth=4;for(let i=0;i<3;i++){c.beginPath();c.moveTo(220+i*80,cy+44);c.quadraticCurveTo(230+i*80,cy+30,220+i*80,cy+18);c.stroke();}}
    c.fillStyle='rgba(255,255,255,.18)';c.beginPath();c.moveTo(170,cy-130);c.lineTo(240,cy-130);c.lineTo(180,cy+30);c.lineTo(160,cy+30);c.fill();
    c.fillStyle='#fff';rr(c,180,cy+76,140,50,14);c.fill();c.fillStyle='#ff5fa2';c.font=`800 24px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(this.baking?`${Math.ceil((1-k)*4)}`:k>=1?'できた！':'オーブン',250,cy+101);
    const dx=390,dy=cy+101;c.fillStyle='rgba(90,40,110,.2)';circ(c,dx+3,dy+5,40);c.fillStyle=gfill(c,dx,dy,40,this.baking?'#ffb03a':'#ff5f6f');circ(c,dx,dy,38);c.save();c.translate(dx,dy);c.rotate(k*TAU);c.fillStyle='#fff';rr(c,-5,-30,10,26,5);c.fill();c.restore();
    if(this.baking){c.strokeStyle='#fff';c.lineWidth=6;c.beginPath();c.arc(dx,dy,44,-Math.PI/2,-Math.PI/2+k*TAU);c.stroke();}},
  cakeTop(){return{x:this.cx,y:this.cy-40};},
  drawCake(c,noCandle){const {x,y}=this.cakeTop();c.fillStyle='#d8e8ff';ell(c,x,y+116,215,58);c.fillStyle='#fff';ell(c,x,y+110,205,52);
    const sg=c.createLinearGradient(x-165,0,x+165,0);sg.addColorStop(0,'#e8b060');sg.addColorStop(.35,'#f8d890');sg.addColorStop(1,'#d89a48');c.fillStyle=sg;ell(c,x,y+100,165,44);c.fillRect(x-165,y,330,100);
    if(this.rainbow){['#ff8a9a','#ffb36a','#ffe36a','#9ee68a','#7ac8ff','#b89aff'].forEach((q,i)=>{c.fillStyle=q;c.fillRect(x-165,y+8+i*15,330,15);});c.fillStyle='#fff6e0';c.fillRect(x-165,y+53,330,4);}else{c.fillStyle='#ff9ac8';c.fillRect(x-165,y+44,330,14);c.fillStyle='#fff6e0';c.fillRect(x-165,y+58,330,5);}
    if(this.smooth){const k=this.creamT;c.fillStyle=this.cream;c.fillRect(x-165,y,330,16*k+4);for(let i=0;i<12;i++){const xx=x-165+i*30+15,len=(18+((i*37)%3)*16)*k;rr(c,xx-13,y,26,24+len,13);c.fill();}}
    c.save();c.beginPath();c.ellipse(x,y,165,44,0,0,TAU);c.clip();c.fillStyle='#fbd894';c.fillRect(x-170,y-50,340,100);for(const cl of this.cells)if(cl.col){c.fillStyle=cl.col;circ(c,x+cl.x,y+cl.y,17);}
    if(this.smooth){c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=3;for(let i=0;i<3;i++){c.beginPath();c.ellipse(x,y,50+i*40,12+i*10,0,0,TAU);c.stroke();}}c.restore();
    if(this.smooth){c.fillStyle='rgba(255,255,255,.35)';ell(c,x-50,y-12,60,12);}
    const pl=this.placed.slice().sort((a,b)=>a.y-b.y);for(const t of pl){if(noCandle&&t.k==='candle')continue;if(t.k==='candle'&&t.out){c.save();c.translate(t.x,t.y-14);c.fillStyle='#fff';c.fillRect(-6,-26,12,40);c.restore();continue;}const s=elastic(Math.min(1,(T-t.born)*2.5));drawItem(c,t.k,t.x,t.y-14,s);}},
  renderEat(){const oc=document.createElement('canvas');oc.width=480;oc.height=320;const g=oc.getContext('2d');const {x,y}=this.cakeTop();g.translate(-(x-240),-(y-120));this.drawCake(g,true);this.cc={cv:oc,x:x-240,y:y-120};},
  draw(c){const cy=this.cy;
    c.fillStyle='#ffd6e8';for(let x=0;x<W;x+=60)c.fillRect(x,0,30,H);c.fillStyle=vfill(c,cy+90,H,'#f0b890',.05,-.1);c.fillRect(-400,cy+130,W+800,H);c.fillStyle='#e0a070';c.fillRect(-400,cy+130,W+800,14);
    if(this.step===0){this.drawBowl(c);
      if(this.act){const a=this.act,b=this.bowlC(),t=a.t;if(a.k==='egg'){const o=easeOut(t*2)*30;drawItem(c,'egg',b.x-o,b.y-120,1.3);c.save();c.translate(b.x+o,b.y-120);c.rotate(.6*easeOut(t*2));drawItem(c,'egg',0,0,1.3);c.restore();if(t>.2&&t<.8){c.fillStyle='#ffc83a';circ(c,b.x,lerp(b.y-110,b.y,(t-.2)/.6),12);}}
        else if(a.k==='flour'){c.save();c.translate(b.x+40,b.y-130);c.rotate(-1.2*ease(t*3));drawItem(c,'flour',0,0,1.6);c.restore();}
        else{c.save();c.translate(b.x+70,b.y-140);c.rotate(-1.4*ease(t*3));drawItem(c,'milk',0,0,1.6);c.restore();if(t>.25&&t<.9){c.strokeStyle='#fff';c.lineWidth=10;c.beginPath();c.moveTo(b.x+40,b.y-140);c.quadraticCurveTo(b.x+20,b.y-80,b.x+10,b.y);c.stroke();}}}
      if(this.added.length>=3&&this.stirring)drawItem(c,'whisk',this.px,this.py-30,1.8);
      else if(this.added.length>=3){drawItem(c,'whisk',this.bowlC().x+100,this.bowlC().y-60,1.6);const k=clamp(this.stir/(TAU*4),0,1);c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=12;c.beginPath();c.arc(W/2,this.cy+170,30,-Math.PI/2,-Math.PI/2+TAU*k);c.stroke();}
      tray(c,H-80,120);for(const d of this.ing)if(!d.used)d.draw(c,1.5);}
    else if(this.step===1)this.drawOven(c);
    else if(this.step===2){this.drawCake(c);
      this.colors.forEach((col,i)=>{const p=this.pal(i);const sel=this.cream===col[0];c.fillStyle='rgba(90,40,110,.15)';circ(c,p.x+2,p.y+5,36);c.fillStyle=gfill(c,p.x,p.y,36,col[0]==='#ffffff'?'#f4f4ff':col[0]);circ(c,p.x,p.y,sel?40:34);c.strokeStyle=sel?'#ff5fa2':'#fff';c.lineWidth=6;c.beginPath();c.arc(p.x,p.y,sel?40:34,0,TAU);c.stroke();});
      if(this.cream&&!this.smooth){const k=this.cells.filter(c2=>c2.col).length/this.cells.length;c.fillStyle='#fff';rr(c,200,H-230,200,20,10);c.fill();c.fillStyle=this.cream==='#ffffff'?'#ffb3d6':this.cream;rr(c,200,H-230,200*k/.8>200?200:200*k/.8,20,10);c.fill();}
      tray(c,H-78,120);this.tops.forEach((k,i)=>{const p=this.trayP(i);drawItem(c,k,p.x,p.y+(k==='candle'?10:0),1.05);});
      if(this.smooth&&this.placed.length>=4){const p=this.chk();drawBtn(c,p.x,p.y,48,'#4cd08a','check',true);}
      if(this.dr){c.save();c.translate(this.dr.x,this.dr.y-24);c.rotate(this.dr.rot||0);drawItem(c,this.dr.k,0,0,1.3);c.restore();}}
    else{const {x,y}=this.cakeTop();c.fillStyle='#d8e8ff';ell(c,x,y+116,215,58);c.fillStyle='#fff';ell(c,x,y+110,205,52);if(this.cc&&this.bites<7){c.globalAlpha=1;c.drawImage(this.cc.cv,this.cc.x,this.cc.y);}
      for(const t of this.placed)if(t.k==='candle'&&!t.out)drawItem(c,'candle',t.x,t.y-14,1);}
    const eatF=this.step===3&&this.eatT>0&&this.eater===0,eatR=this.step===3&&this.eatT>0&&this.eater===1;
    {const cu=this.cust,cx2=58,cy2=this.step===1?300:430;const jy=cu.hop>0?Math.sin(cu.hop*Math.PI)*30:0;drawAnimal(c,cu.k,cx2,cy2-jy,.62,{t:T,happy:cu.react>0,sad:cu.react<0});
      if(this.step<3){const bx=112,by=cy2-150;c.fillStyle='#fff';c.strokeStyle='#ffb3d6';c.lineWidth=3;rr(c,bx,by,150,74,20);c.fill();c.stroke();c.beginPath();c.moveTo(bx+10,by+60);c.lineTo(bx-12,by+86);c.lineTo(bx+30,by+72);c.fill();
        c.fillStyle=gfill(c,bx+38,by+37,26,cu.cream==='#ffffff'?'#f4f4ff':cu.cream);circ(c,bx+38,by+37,24);c.strokeStyle='#e8d0e0';c.lineWidth=2;c.beginPath();c.arc(bx+38,by+37,24,0,TAU);c.stroke();c.fillStyle='#b08aa0';c.font=`800 22px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('+',bx+72,by+38);drawItem(c,cu.top,bx+110,by+37,.85);}}
    drawFuka(c,70,cy+235,{outfit:outfit(),t:T,dir:0,sc:2.6,eat:eatF,happy:this.step>0&&!eatF,point:this.step===0&&!this.added.length});drawRikki(c,540,cy+220,{sc:2.2,t:T,eat:eatR,happy:this.fin>0});this.rkPos={x:540,y:cy+220,sc:2.2};
    stepDots(c,4,this.step);},
  inTop(x,y){const t=this.cakeTop();return((x-t.x)/165)**2+((y-t.y)/44)**2<=1.35;},
  down(x,y){if(this.fin>0)return;this.px=x;this.py=y;
    if(this.step===0){for(const d of this.ing)if(!d.used&&!this.act&&d.hit(x,y)){d.held=true;this.dr=d;sfx('tap');sayWord(d.k);return;}
      const b=this.bowlC();if(this.added.length>=3&&Math.abs(x-b.x)<200&&Math.abs(y-b.y)<110){this.stirring=true;this.lastA=Math.atan2((y-b.y)*2.6,x-b.x);}return;}
    if(this.step===1){if(!this.baking&&this.bake<1&&(hitC(x,y,390,this.cy+101,60)||hitC(x,y,300,this.cy-40,160))){this.baking=true;sfx('pop');say('オーブン スタート！ やけるまで まってね');}return;}
    if(this.step===2){for(let i=0;i<this.colors.length;i++){const p=this.pal(i);if(hitC(x,y,p.x,p.y,42)){const col=this.colors[i];this.cream=col[0];sfx('squish');sayPair(col[1],col[2]);if(!this.smooth)setTimeout(()=>say('ケーキの うえを ゆびで ぬりぬり しよう'),1500);return;}}
      if(this.smooth&&this.placed.length>=4){const p=this.chk();if(hitC(x,y,p.x,p.y,54)){this.step=3;this.renderEat();sfx('fanfare');const cu=this.cust;this.perfect=this.cream===cu.cream&&this.placed.some(t=>t.k===cu.top);cu.react=this.perfect?1:.5;cu.hop=1;if(this.perfect){confetti(50);burst(58,300,20,'heart');}const cn=this.placed.filter(t=>t.k==='candle').length;say((this.perfect?`${WORDS[cu.k][0]}さん「ちゅうもん ぴったり！ だいせいこう！」 `:`${WORDS[cu.k][0]}さん「すてきな ケーキ！ ありがとう！」 `)+(cn?'ろうそくの ひを ふーって けしてね！ ほのおを タッチ':'いただきまーす！ ケーキを タッチして たべよう'));return;}}
      for(let i=0;i<this.tops.length;i++){const p=this.trayP(i);if(hitC(x,y,p.x,p.y,40)){if(!this.smooth){say('さきに クリームを ぬってね');sfx('no');return;}this.dr={k:this.tops[i],x,y,rot:0,lx:x};sfx('tap');return;}}
      for(let i=this.placed.length-1;i>=0;i--){const t=this.placed[i];if(hitC(x,y,t.x,t.y-14,30)){this.placed.splice(i,1);this.dr={k:t.k,x,y,rot:0,lx:x};sfx('tap');return;}}
      if(this.inTop(x,y)){if(!this.cream){say('クリームの いろを えらんでね');return;}this.painting=true;this.paint(x,y);}return;}
    if(this.step===3){for(const t of this.placed)if(t.k==='candle'&&!t.out&&hitC(x,y,t.x,t.y-50,40)){t.out=true;sfx('blow');puff(t.x,t.y-56,6,'#dddde8');if(this.placed.every(q=>q.k!=='candle'||q.out)){rkCheer();say('おめでとう！ いただきまーす！ ケーキを タッチして たべよう');}return;}
      if(this.placed.some(q=>q.k==='candle'&&!q.out))return;
      const {x:tx,y:ty}=this.cakeTop();if(Math.abs(x-tx)<200&&y>ty-60&&y<ty+120&&this.bites<7){const g=this.cc.cv.getContext('2d');g.globalCompositeOperation='destination-out';const bx=x-this.cc.x,by=y-this.cc.y;for(const [a,b,r] of [[0,0,40],[-30,10,30],[30,10,30],[0,-25,28]]){g.beginPath();g.arc(bx+a,by+b,r,0,TAU);g.fill();}
        this.bites++;this.eater=this.bites%2;this.eatT=.9;sfx('bite');burst(x,y,6,'dot');if(this.bites===3)say('おいしい〜！');if(this.bites===5)say('りっきーも もぐもぐ！');
        if(this.bites>=7){this.fin=.01;say('ごちそうさまでした！');burst(tx,ty+40,30,'heart');}}}},
  paint(x,y){const t=this.cakeTop();for(const cl of this.cells)if(Math.hypot(t.x+cl.x-x,t.y+cl.y-y)<34){if(cl.col!==this.cream){cl.col=this.cream;if(Math.random()<.2)sfx('squish');}}
    if(!this.smooth&&this.cells.filter(c2=>c2.col).length/this.cells.length>=.8){this.smooth=true;this.creamT=0;for(const cl of this.cells)cl.col=this.cream;sfx('spark');burst(t.x,t.y,16,'heart');rkCheer();say('じょうず！ つぎは トッピングを のせてね');}},
  move(x,y){this.px=x;this.py=y;
    if(this.step===0){if(this.dr){this.dr.x=x;this.dr.y=y;}else if(this.stirring){const b=this.bowlC();const a=Math.atan2((y-b.y)*2.6,x-b.x);let d=a-this.lastA;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;this.lastA=a;const before=this.stir;this.stir+=Math.abs(d);if(Math.floor(before/1.2)!==Math.floor(this.stir/1.2))sfx('squish');
      if(before<TAU*4&&this.stir>=TAU*4){sfx('ding');rkCheer();burst(b.x,b.y,20,'star');say('なめらかに なったね！ つぎは オーブンで やこう！ ボタンを タッチ');setTimeout(()=>{if(scene===this){this.step=1;this.bake=0;}},1200);}}}
    if(this.step===2){if(this.dr){this.dr.rot=clamp((x-this.dr.lx)*.02,-.5,.5);this.dr.lx=x;this.dr.x=x;this.dr.y=y;}else if(this.painting)this.paint(x,y);}},
  up(x,y){this.stirring=false;this.painting=false;
    if(this.step===0&&this.dr){const d=this.dr;this.dr=null;d.held=false;const b=this.bowlC();if(Math.hypot(x-b.x,y-b.y)<200&&!this.act){d.used=true;this.act={k:d.k,t:0};if(d.k==='egg')sfx('crack');else if(d.k==='flour'){sfx('whoosh');puff(b.x,b.y-10,14,'#fffaf0');}else sfx('pour');}else sfx('whoosh');return;}
    if(this.step===2&&this.dr){const d=this.dr;this.dr=null;const yy=y-24+14;if(this.inTop(x,yy)){const t=this.cakeTop();const dx=(x-t.x)/165,dy=(yy-t.y)/44,l=Math.hypot(dx,dy),f=l>.9?.9/l:1;this.placed.push({k:d.k,x:t.x+dx*f*165,y:t.y+dy*f*44,born:T});sfx('pop');rkCheer();burst(x,yy-20,8,'star');sayWord(d.k);if(this.placed.length===4)setTimeout(()=>say('できたら みどりの ボタンを おしてね'),2600);}else sfx('whoosh');}},
  hint(){if(this.fin>0)return null;const b=this.bowlC();
    if(this.step===0){const d=this.ing.find(d=>!d.used);if(d&&!this.act)return{x:d.hx,y:d.hy,x2:b.x,y2:b.y};if(this.added.length>=3)return{x:b.x-120,y:b.y,x2:b.x+120,y2:b.y};return null;}
    if(this.step===1)return this.baking?null:{x:390,y:this.cy+101};
    if(this.step===2){if(!this.cream){const p=this.pal(1);return{x:p.x,y:p.y};}if(!this.smooth)return{x:b.x-120,y:this.cy-40,x2:b.x+120,y2:this.cy-40};if(this.placed.length<4){const p=this.trayP(0);return{x:p.x,y:p.y,x2:this.cx,y2:this.cy-40};}const p=this.chk();return{x:p.x,y:p.y};}
    const cd=this.placed.find(t=>t.k==='candle'&&!t.out);if(cd)return{x:cd.x,y:cd.y-50};return{x:this.cx,y:this.cy};},
  hintText(){return['ざいりょうを ボウルに いれて、ぐるぐる まぜよう','まるい ボタンを タッチ','クリームを ぬって トッピングを のせよう','ケーキを タッチして たべよう'][this.step];}};

// ================= doctor =================
const PROB_TXT={fever:'おねつが あるみたい',cut:'ひざを すりむいたみたい',germs:'ばいきんが いっぱい！',tummy:'おなかが いたいみたい'};
SCN.doctor={bg:'#e6f6ff',song:'play',
  enter(){this.queue=shuffle(['bear','rabbit','cat','dog','panda','pig']).slice(0,3);this.pi=0;this.fin=0;this.lay();
    this.tools=['thermometer','icepack','spray','bandage','spoon'].map((k,i)=>new Dr({k,hx:66+i*117,hy:H-80,r:50}));this.dr=null;this.newPatient();},
  lay(){this.ax=340;this.ay=H*.62;this.s=1.9;if(this.tools)this.tools.forEach((t,i)=>{t.hx=66+i*117;t.hy=H-80;});},
  newPatient(){const k=this.queue[this.pi];const emer=this.pi===2&&(lvOf('doctor')>=1||Math.random()<.5);const probs=shuffle(['fever','cut','germs','tummy']).slice(0,emer?3:2);
    this.amb=emer?{x:W+260,t:0,st:'in'}:null;if(emer){sfx('siren');setTimeout(()=>{if(scene===this)say('ピーポーピーポー！ きゅうきゅうしゃが きたよ！ たいへん！');},200);}
    this.p={k,x:760,probs:Object.fromEntries(probs.map(p=>[p,0])),hop:0,meas:0,mist:0,open:0,leave:false,done:false,
      germs:probs.includes('germs')?[...Array(4)].map(()=>({a:rand(-26,26),b:rand(-52,-14),alive:true,ph:rand(0,6)})):[]};
    if(emer){this.p.x=W+400;this.p.wait=true;}
    setTimeout(()=>{if(scene===this)say(`${WORDS[k][0]}さん、${probs.map(p=>PROB_TXT[p]).join('。 ')}`);},emer?3200:900);},
  drawAmb(c,x,y){c.save();c.translate(x,y);c.fillStyle='rgba(60,50,90,.2)';ell(c,0,4,150,14);c.fillStyle=vfill(c,-140,0,'#ffffff',.05,-.1);rr(c,-150,-140,300,136,24);c.fill();c.strokeStyle='#c8d0e0';c.lineWidth=4;c.stroke();
    c.fillStyle='#ff4d6d';c.fillRect(-150,-66,300,14);c.fillStyle='#bfe8ff';rr(c,-136,-124,70,46,10);c.fill();rr(c,70,-124,64,46,10);c.fill();c.fillStyle='#ff4d6d';c.fillRect(-14,-126,28,70);c.fillRect(-44,-106,88,28);
    const on=Math.floor(T*6)%2;c.fillStyle=on?'#ff3030':'#ff9090';rr(c,-24,-162,48,24,8);c.fill();if(on){c.fillStyle='rgba(255,60,60,.3)';circ(c,0,-150,60);}
    c.fillStyle='#4a4a6a';circ(c,-90,-4,24);circ(c,90,-4,24);c.fillStyle='#d8d8e8';circ(c,-90,-4,9);circ(c,90,-4,9);c.restore();},
  head(){return{x:this.p.x,y:this.ay-88*this.s};},mouth(){return{x:this.p.x,y:this.ay-72*this.s};},knee(){return{x:this.p.x+18*this.s,y:this.ay-10*this.s};},
  left(){return Object.values(this.p.probs).filter(v=>v<2).length;},
  update(dt){for(const t of this.tools)t.upd(dt);const p=this.p;
    const am=this.amb;if(am){am.t+=dt;if(am.st==='in'){am.x+=(470-am.x)*Math.min(1,dt*2.5);if(am.t>2.2){am.st='wait';p.x=am.x-60;p.wait=false;sfx('boing');}}else if(am.st==='wait'){if(am.t>4)am.st='out';}else{am.x+=500*dt;if(am.x>W+400)this.amb=null;}}
    if(p.wait){}else if(!p.leave&&Math.abs(p.x-this.ax)>2){p.x+=Math.sign(this.ax-p.x)*Math.min(Math.abs(this.ax-p.x),320*dt);p.walk=true;}else p.walk=false;
    if(p.leave){p.x-=320*dt;p.walk=true;if(p.x<-160){this.pi++;if(this.pi>=3){if(!this.fin){this.fin=.01;celebrate('doctor');}}else this.newPatient();}}
    if(p.hop>0)p.hop-=dt*2;if(p.open>0)p.open-=dt;
    if(p.meas>0){p.meas+=dt;if(p.meas>1.8){p.meas=0;p.probs.fever=1;say('おねつが 38ど！ こおりで ひやして あげよう');}}
    for(const g of p.germs)if(g.alive){g.a+=Math.sin(T*2+g.ph)*dt*20;g.b+=Math.cos(T*1.7+g.ph)*dt*16;g.a=clamp(g.a,-30,30);g.b=clamp(g.b,-60,-10);}
    const sp=this.tools[2];if(sp.held){const k=this.knee();if(Math.random()<dt*30)parts.push({x:sp.x-20,y:sp.y-20,vx:rand(-120,-60),vy:rand(-20,40),life:.5,t:0,kind:'puff',col:'#d8f0ff',r:6});
      if(p.probs.cut===0&&Math.hypot(sp.x-k.x-40,sp.y-k.y)<120){p.mist+=dt;if(p.mist>1){p.probs.cut=1;sfx('ding');say('しゅっしゅっ！ つぎは ばんそうこうを はってね');}}
      for(const g of p.germs)if(g.alive&&Math.hypot(sp.x-40-(p.x+g.a*this.s),sp.y-(this.ay+g.b*this.s))<90){g.alive=false;sfx('pop');burst(p.x+g.a*this.s,this.ay+g.b*this.s,10,'dot');this.germCheck();}}
    if(this.fin>0&&this.fin<9)this.fin+=dt;},
  germCheck(){const p=this.p;if(p.probs.germs===0&&p.germs.every(g=>!g.alive)){p.probs.germs=2;say('ばいきん ぜんぶ やっつけた！');this.check();}},
  draw(c){const {ay,s}=this,p=this.p;
    c.fillStyle='#d6eeff';for(let y=0;y<H;y+=70)c.fillRect(-400,y,W+800,34);c.fillStyle=vfill(c,ay-10,H,'#c8e8c8',.05,-.08);c.fillRect(-400,ay-10,W+800,H);
    c.fillStyle='#fff';rr(c,440,150,120,160,10);c.fill();c.strokeStyle='#9ac8e8';c.lineWidth=4;c.stroke();for(let i=0;i<5;i++){c.fillStyle=['#ff8cc0','#ffd23a','#6cd08a','#5aa8ff','#b48cff'][i];c.fillRect(456,166+i*28,88,14);}
    c.fillStyle='#ff6f91';c.fillRect(492,112,16,48);c.fillRect(476,128,48,16);
    c.fillStyle=vfill(c,ay-70,ay+20,'#bfe0ff');rr(c,this.ax-200,ay-70,400,90,20);c.fill();c.fillStyle='#fff';rr(c,this.ax-190,ay-80,380,70,24);c.fill();
    const happy=this.left()===0;const st={t:T,sick:p.probs.fever===0||p.probs.fever===1,sad:this.left()>=2&&!p.walk,happy,hop:p.walk?Math.abs(Math.sin(T*6))*.5:p.hop,tummy:p.probs.tummy===0&&!p.walk,open:p.open>0||p.meas>0};
    if(this.amb)this.drawAmb(c,this.amb.x,ay-40);
    if(!p.wait)drawAnimal(c,p.k,p.x,ay,s,st);const h=this.head(),m=this.mouth();
    if(p.probs.fever===0||p.probs.fever===1){c.strokeStyle='rgba(255,90,90,.8)';c.lineWidth=4;for(let i=0;i<3;i++){c.beginPath();const bx=h.x-30+i*30,by=h.y-80-Math.sin(T*4+i)*6;c.moveTo(bx,by);c.bezierCurveTo(bx-10,by-12,bx+10,by-22,bx,by-34);c.stroke();}c.fillStyle='#8ad0ff';ell(c,h.x+55,h.y-20+Math.sin(T*3)*4,7,11);}
    if(p.probs.fever===2)drawItem(c,'icepack',h.x,h.y-52,1.1);
    if(p.meas>0){c.save();c.translate(m.x+26,m.y);c.rotate(.4);drawItem(c,'thermometer',0,0,1.3);c.restore();const tv=(36+Math.min(1,p.meas/1.5)*2.5).toFixed(1);c.fillStyle='#fff';rr(c,m.x+50,m.y-90,110,50,16);c.fill();c.strokeStyle='#ff4d6d';c.lineWidth=4;c.stroke();c.fillStyle='#ff4d6d';c.font=`800 28px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(tv+'°',m.x+105,m.y-65);}
    if(p.probs.fever===1){c.fillStyle='#ff4d6d';c.font=`800 22px ${FONT}`;c.textAlign='center';c.fillText('38.5°',h.x+80,h.y-70);}
    const k=this.knee();if(p.probs.cut!==undefined){if(p.probs.cut<2){c.strokeStyle='#ff4d6d';c.lineWidth=4;for(let i=0;i<3;i++){c.beginPath();c.moveTo(k.x-14,k.y-8+i*7);c.lineTo(k.x+14,k.y-12+i*7);c.stroke();}if(p.probs.cut===1){c.fillStyle='rgba(180,230,255,.6)';circ(c,k.x,k.y-4,20);}}else drawItem(c,'bandage',k.x,k.y-4,.85);}
    if(p.probs.tummy===0&&!p.walk){c.strokeStyle='#b86af0';c.lineWidth=3;c.beginPath();for(let a=0;a<TAU*2;a+=.3){const r=a*2.5;c.lineTo(p.x+Math.cos(a+T*3)*r,ay-40*s+Math.sin(a+T*3)*r);}c.stroke();}
    for(const g of p.germs){if(!g.alive)continue;this.drawGerm(c,p.x+g.a*s,ay+g.b*s);}
    drawFuka(c,90,H*.64,{outfit:outfit({acc:'nurse'}),t:T,dir:0,sc:2.8,happy,point:!happy,cheer:happy&&!p.leave});drawRikki(c,540,H-162,{sc:2,t:T,happy});this.rkPos={x:540,y:H-162,sc:2};
    for(let i=0;i<3;i++){const x=W-150+i*44,y=128;c.fillStyle=i<this.pi?'#ffd23a':i===this.pi?'#fff':'rgba(255,255,255,.5)';circ(c,x,y,18);c.strokeStyle='#9ac8e8';c.lineWidth=3;c.stroke();drawAnimal(c,this.queue[i],x,y+15,.22,{t:0,happy:i<this.pi});}
    tray(c,H-80,120);for(const t of this.tools)if(!t.held)t.draw(c,1.3);for(const t of this.tools)if(t.held)t.draw(c,1.5);},
  drawGerm(c,x,y){c.fillStyle=gfill(c,x,y,20,'#8ee07a');c.strokeStyle='#4aa04a';c.lineWidth=3;c.beginPath();for(let i=0;i<10;i++){const a=i/10*TAU,r=i%2?15:20;c.lineTo(x+Math.cos(a+T)*r,y+Math.sin(a+T)*r);}c.closePath();c.fill();c.stroke();
    c.fillStyle='#2a3a2a';circ(c,x-6,y-3,3);circ(c,x+6,y-3,3);c.fillStyle='#fff';circ(c,x-7,y-4,1);circ(c,x+5,y-4,1);c.strokeStyle='#2a3a2a';c.lineWidth=2;c.beginPath();c.arc(x,y+4,5,.2,Math.PI-.2);c.stroke();},
  down(x,y){if(this.fin>0)return;const p=this.p;if(p.walk||p.wait)return;
    for(const g of p.germs){if(!g.alive)continue;const gx=p.x+g.a*this.s,gy=this.ay+g.b*this.s;if(hitC(x,y,gx,gy,40)){g.alive=false;sfx('pop');burst(gx,gy,14,'dot');this.germCheck();return;}}
    for(const t of this.tools)if(t.hit(x,y)){t.held=true;this.dr=t;sfx('tap');sayWord(t.k);return;}
    if(hitC(x,y,p.x,this.ay-60*this.s,90)){p.hop=1;sfx('boing');sayWord(p.k);}},
  move(x,y){if(this.dr){this.dr.x=x;this.dr.y=y;}},
  up(x,y){const t=this.dr;if(!t)return;this.dr=null;t.held=false;const p=this.p;const h=this.head(),m=this.mouth(),k=this.knee();
    const near=(q,r)=>Math.hypot(x-q.x,y-q.y)<r;
    if(t.k==='thermometer'&&p.probs.fever===0&&near(m,120)){p.meas=.01;sfx('beep');say('たいおんを はかるよ… ピピッ');return;}
    if(t.k==='icepack'&&near(h,120)){if(p.probs.fever===1){p.probs.fever=2;sfx('ding');burst(x,y,14);say('つめたくて きもちいい！');this.check();return;}if(p.probs.fever===0){say('まず たいおんけいで おねつを はかろう');sfx('no');return;}}
    if(t.k==='bandage'&&near(k,100)){if(p.probs.cut===1){p.probs.cut=2;sfx('ding');burst(x,y,14,'heart');say('いたいの いたいの とんでいけ〜！');this.check();return;}if(p.probs.cut===0){say('さきに スプレーで しゅっしゅっ しよう');sfx('no');return;}}
    if(t.k==='spoon'&&p.probs.tummy===0&&near(m,110)){p.open=.8;sfx('munch');setTimeout(()=>{if(scene===this&&p.probs.tummy===0){p.probs.tummy=2;sfx('ding');say('ごっくん！ えらいね！');this.check();}},800);return;}
    if(near(h,200)&&t.k!=='spray'){sfx('no');say('それじゃ ないみたい');}},
  check(){rkCheer();const p=this.p;if(this.left()===0&&!p.done){p.done=true;p.hop=1;setTimeout(()=>{sfx('fanfare');say(WORDS[p.k][0]+'さん げんきに なった！ ありがとう！');burst(p.x,this.ay-150,30,'heart');},300);setTimeout(()=>{if(scene===this)p.leave=true;},2600);}},
  hint(){if(this.fin>0||this.p.walk)return null;const p=this.p,h=this.head(),m=this.mouth(),k=this.knee(),T2=i=>this.tools[i];
    if(p.probs.fever===0&&!p.meas)return{x:T2(0).hx,y:T2(0).hy,x2:m.x,y2:m.y};if(p.probs.fever===1)return{x:T2(1).hx,y:T2(1).hy,x2:h.x,y2:h.y};
    if(p.probs.cut===0)return{x:T2(2).hx,y:T2(2).hy,x2:k.x+50,y2:k.y};if(p.probs.cut===1)return{x:T2(3).hx,y:T2(3).hy,x2:k.x,y2:k.y};
    if(p.probs.tummy===0)return{x:T2(4).hx,y:T2(4).hy,x2:m.x,y2:m.y};const g=p.germs.find(g=>g.alive);return g?{x:p.x+g.a*this.s,y:this.ay+g.b*this.s}:null;},
  hintText(){return 'したの どうぐを つかって なおして あげよう';}};

// ================= bath =================
SCN.bath={bg:'#dff4ff',song:'play',
  enter(){this.lay();const hx=this.fx,hy=this.fy+FUHEAD.y*this.s;this.step=0;this.fin=0;
    this.spots=[[-40,-6,20],[38,-20,18],[4,-44,17],[-26,34,16],[30,30,18],[0,60,19]].map(([a,b,r])=>({x:hx+a,y:hy+b,r,st:'dirt',p:0,q:0}));
    const bx=this.bx,by=this.wy+36-30*3.2;this.spots.push({x:bx-14,y:by-6,r:14,st:'dirt',p:0,q:0},{x:bx+13,y:by+10,r:13,st:'dirt',p:0,q:0});
    this.hair=[[-40,-40],[0,-54],[40,-40],[-50,-8]].map(([a,b])=>({x:hx+a,y:hy+b,f:0}));this.hair.push({x:bx,y:by-34,f:0});this.drops=[];
    this.tools=['sponge','shampoo','shower','towel'].map((k,i)=>new Dr({k,hx:90+i*140,hy:H-80,r:56}));this.dr=null;this.ducks=[{x:92,hop:0},{x:540,hop:0}];this.floats=[];this.fT=1;
    say('ふーちゃんも りっきーも どろんこ！ スポンジで ごしごし しよう！');},
  lay(){this.fx=225;this.tx=300;this.bx=450;this.fy=H*.58;this.s=4.8;this.wy=this.fy-92;if(this.tools)this.tools.forEach((t,i)=>{t.hx=90+i*140;t.hy=H-80;});},
  next(){this.step++;sfx('fanfare');rkCheer();
    if(this.step===1)say('ピカピカ！ つぎは シャンプーで あたまを あわあわ！');
    if(this.step===2)say('シャワーで あわを ながそう！');
    if(this.step===3){say('タオルで ふきふき しよう！');const hx=this.fx,hy=this.fy+FUHEAD.y*this.s;this.drops=[...Array(8)].map((_,i)=>({x:hx+rand(-70,70),y:hy+rand(-70,50),on:true}));this.drops.push({x:this.bx-10,y:this.wy-60,on:true},{x:this.bx+15,y:this.wy-40,on:true});}
    if(this.step===4){this.bubT={n:0,goal:12,toys:[]};burst(this.fx,this.fy-200,30,'star');say('ピカピカ！ ごほうびの バブルタイム！ シャボンだまを いっぱい わってね！');}},
  popF(f,x,y){this.floats.splice(this.floats.indexOf(f),1);sfx('pop');bubbles(x,y,4);const b=this.bubT;if(!b||this.fin>0)return;b.n++;
    if(f.toy){b.toys.push(f.toy);sfx('ding');sayWord(f.toy);burst(x,y,10,'star');}
    if(f.rb){sfx('spark');confetti(40);say('にじいろ シャボンだま！ ぜんぶ はじけた！');for(const g of this.floats.slice()){b.n++;bubbles(g.x,g.y,3);if(g.toy)b.toys.push(g.toy);}this.floats.length=0;}
    if(b.n>=b.goal){this.fin=.01;rkCheer();say('バブルタイム だいせいこう！ きもちいいね〜！');}},
  update(dt){for(const t of this.tools)t.upd(dt);for(const d of this.ducks)if(d.hop>0)d.hop-=dt*2;
    const sh=this.tools[2];if(sh.held){if(Math.random()<dt*40)parts.push({x:sh.x+rand(-18,18),y:sh.y-10,vx:rand(-20,20),vy:rand(150,260),life:1.2,t:0,kind:'drop',col:'#7ac8ff'});if(Math.random()<dt*6)sfx('water');
      if(this.step===2){for(const s of this.spots)if(s.st==='foam'&&Math.abs(s.x-sh.x)<80&&s.y>sh.y-20&&s.y<sh.y+380){s.q+=dt*1.8;if(s.q>=1){s.st='gone';sfx('spark');burst(s.x,s.y,8,'star');}}
        for(const h of this.hair)if(h.f>0&&Math.abs(h.x-sh.x)<80&&h.y>sh.y-20&&h.y<sh.y+380){h.f-=dt*1.6;if(h.f<=0){h.f=0;sfx('spark');}}
        if(this.spots.every(s=>s.st!=='foam')&&this.hair.every(h=>h.f<=0))this.next();}}
    this.fT-=dt;if(this.fT<=0){const bt=this.bubT&&this.fin<=0;this.fT=bt?rand(.3,.6):rand(.6,1.4);const f={x:rand(90,510),y:this.wy,r:bt?rand(22,36):rand(12,24),vy:bt?rand(50,90):rand(30,60),t:0};if(bt){const q=Math.random();if(q<.3)f.toy=pick(['duck','starcandy','fish','heartcookie','apple','strawberry']);else if(q<.37)f.rb=true;}this.floats.push(f);}
    for(let i=this.floats.length-1;i>=0;i--){const f=this.floats[i];f.y-=f.vy*dt;f.t+=dt;if(f.y<120)this.floats.splice(i,1);}
    if(this.fin>0){this.fin+=dt;if(this.fin>2.4&&this.fin<9){this.fin=9;celebrate('bath');}}},
  draw(c){const {fx,fy,wy}=this,tx=this.tx;
    c.fillStyle='#e8f8ff';c.fillRect(-400,0,W+800,H);c.strokeStyle='#c8e8f8';c.lineWidth=3;for(let x=0;x<W;x+=60){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke();}for(let y=0;y<H;y+=60){c.beginPath();c.moveTo(-400,y);c.lineTo(W+400,y);c.stroke();}
    c.fillStyle='rgba(255,255,255,.5)';rr(c,60,140,110,130,55);c.fill();c.fillStyle=vfill(c,fy+60,H,'#ffd0e4',.05,-.08);c.fillRect(-400,fy+60,W+800,H);
    c.fillStyle='#f0f6ff';ell(c,tx,wy,250,40);
    drawFuka(c,fx,fy,{outfit:{dress:'#ffb3d6',skirt:'#ffb3d6',ribbon:'#ff8cc0',boots:'#fff',acc:'none'},t:T,dir:0,sc:this.s,happy:this.step>0||this.spots.some(s=>s.st==='foam')});
    drawRikki(c,this.bx,wy+36,{sc:3.2,t:T,happy:this.step>0||RK.clap>0,toy:false});this.rkPos={x:this.bx,y:wy+10,sc:2.2};
    for(const s of this.spots){if(s.st==='dirt'){c.globalAlpha=1-s.p*.6;c.fillStyle='#9a6a4a';for(let i=0;i<5;i++){const a=i/5*TAU;circ(c,s.x+Math.cos(a)*s.r*.45,s.y+Math.sin(a)*s.r*.45,s.r*.55);}c.globalAlpha=1;}
      else if(s.st==='foam'){c.globalAlpha=1-s.q*.8;this.foam(c,s.x,s.y,s.r);c.globalAlpha=1;}}
    for(const h of this.hair)if(h.f>0){c.globalAlpha=Math.min(1,h.f);this.foam(c,h.x,h.y,26*Math.min(1,h.f));c.globalAlpha=1;}
    for(const d of this.drops)if(d.on){c.fillStyle='rgba(120,200,255,.85)';c.beginPath();c.moveTo(d.x,d.y-9);c.quadraticCurveTo(d.x+7,d.y+2,d.x,d.y+6);c.quadraticCurveTo(d.x-7,d.y+2,d.x,d.y-9);c.fill();c.fillStyle='#fff';circ(c,d.x-2,d.y,1.6);}
    c.fillStyle='rgba(120,200,255,.55)';c.fillRect(tx-240,wy,480,fy+60-wy);
    for(const d of this.ducks){const dy=wy+2+Math.sin(T*2+d.x)*4-(d.hop>0?Math.sin(d.hop*Math.PI)*40:0);drawItem(c,'duck',d.x,dy,1.4);}
    const tg=c.createLinearGradient(tx-262,0,tx+262,0);tg.addColorStop(0,'#e8eef8');tg.addColorStop(.3,'#ffffff');tg.addColorStop(1,'#dde6f4');c.fillStyle=tg;rr(c,tx-262,wy+14,524,fy+80-wy,[16,16,60,60]);c.fill();c.strokeStyle='#ffb3d6';c.lineWidth=6;c.stroke();c.fillStyle='#ff9ac8';c.fillRect(tx-262,wy+50,524,14);
    c.fillStyle='rgba(255,255,255,.95)';for(let i=0;i<9;i++)circ(c,tx-230+i*58,wy+14,16+Math.sin(T*2+i)*3);
    c.fillStyle='#e8c0d8';rr(c,tx-230,fy+74,40,40,10);c.fill();rr(c,tx+190,fy+74,40,40,10);c.fill();
    for(const f of this.floats){const fx2=f.x+Math.sin(f.t*2)*10;if(f.toy)drawItem(c,f.toy,fx2,f.y,f.r/34);c.fillStyle=f.rb?`hsla(${(T*200)%360},90%,80%,.55)`:'rgba(220,240,255,.5)';c.strokeStyle=f.rb?`hsl(${(T*200+120)%360},90%,60%)`:'rgba(120,190,255,.8)';c.lineWidth=f.rb?5:2;c.beginPath();c.arc(fx2,f.y,f.r,0,TAU);c.fill();c.stroke();c.fillStyle='#fff';circ(c,f.x+Math.sin(f.t*2)*10-f.r*.35,f.y-f.r*.35,f.r*.25);}
    if(this.bubT){const b=this.bubT;c.fillStyle='rgba(255,255,255,.92)';rr(c,120,112,360,64,32);c.fill();c.strokeStyle='#7ac8ff';c.lineWidth=4;c.stroke();c.fillStyle='#3a8ad8';c.font=`800 24px ${FONT}`;c.textAlign='left';c.textBaseline='middle';c.fillText(`シャボンだま ${Math.min(b.n,b.goal)}/${b.goal}`,140,144);b.toys.slice(-3).forEach((k,i)=>drawItem(c,k,400+i*28,144,.5));}
    tray(c,H-80,120);this.tools.forEach((t,i)=>{if(t.held)return;c.globalAlpha=i===this.step?1:.35;t.draw(c,1.45);c.globalAlpha=1;if(i===this.step&&this.fin<=0){c.strokeStyle=`rgba(255,95,162,${.5+Math.sin(T*5)*.3})`;c.lineWidth=4;c.beginPath();c.arc(t.hx,t.hy,52,0,TAU);c.stroke();}});
    for(const t of this.tools)if(t.held)t.draw(c,1.6);stepDots(c,4,this.step);},
  foam(c,x,y,r){c.fillStyle='#fff';c.strokeStyle='#bfe0ff';c.lineWidth=2;for(let i=0;i<7;i++){const a=i/7*TAU+T*.8;const bx=x+Math.cos(a)*r*.6,by=y+Math.sin(a)*r*.5;c.beginPath();c.arc(bx,by,r*.5,0,TAU);c.fill();c.stroke();}c.fillStyle='rgba(200,230,255,.6)';circ(c,x-r*.2,y-r*.2,r*.2);},
  down(x,y){for(const f of this.floats){if(hitC(x,y,f.x+Math.sin(f.t*2)*10,f.y,f.r+14)){this.popF(f,x,y);return;}}
    for(const d of this.ducks)if(hitC(x,y,d.x,this.wy,50)){d.hop=1;sfx('squeak');sayWord('duck');drops(d.x,this.wy,6);return;}
    if(this.fin>0)return;this.tools.forEach((t,i)=>{if(!this.dr&&t.hit(x,y)){if(i!==this.step){sfx('no');say(['スポンジ','シャンプー','シャワー','タオル'][this.step]+'を つかおう');return;}t.held=true;this.dr=t;t.lx=x;t.ly=y;sfx('tap');sayWord(t.k);}});},
  move(x,y){const t=this.dr;if(!t)return;const d=Math.hypot(x-t.lx,y-t.ly);t.x=x;t.y=y;t.lx=x;t.ly=y;
    if(t.k==='sponge'){for(const s of this.spots){if(s.st!=='dirt')continue;if(Math.hypot(s.x-x,s.y-y)<s.r+40){s.p+=d/240;if(Math.random()<.4)bubbles(x,y,1);if(s.p>=1){s.st='foam';sfx('squish');bubbles(s.x,s.y,6);}}}if(!this.spots.some(q=>q.st==='dirt')&&this.step===0)this.next();}
    if(t.k==='shampoo'){for(const h of this.hair)if(h.f<1&&Math.hypot(h.x-x,h.y-y)<60){h.f=Math.min(1,h.f+d/150);if(Math.random()<.3){bubbles(x,y,1);sfx('squish');}}if(this.hair.every(h=>h.f>=1)&&this.step===1)this.next();}
    if(t.k==='towel'){for(const q of this.drops)if(q.on&&Math.hypot(q.x-x,q.y-y)<50){q.on=false;sfx('tap');burst(q.x,q.y,3,'star');}if(this.drops.every(q=>!q.on)&&this.step===3)this.next();}},
  up(){if(this.dr){this.dr.held=false;this.dr=null;}},
  hint(){if(this.fin>0)return null;if(this.bubT){const f=this.floats.find(f=>f.y>200);return f?{x:f.x,y:f.y}:null;}const t=this.tools[this.step];let g=null;if(this.step===0)g=this.spots.find(s=>s.st==='dirt');else if(this.step===1)g=this.hair.find(h=>h.f<1);else if(this.step===2){g=this.spots.find(s=>s.st==='foam')||this.hair.find(h=>h.f>0);if(g)g={x:g.x,y:g.y-120};}else g=this.drops.find(d=>d.on);return g?{x:t.hx,y:t.hy,x2:g.x,y2:g.y}:null;},
  hintText(){return['スポンジで どろんこを ごしごし','シャンプーを あたまに あわあわ','シャワーで あわを ながそう','タオルで みずを ふきふき','シャボンだまを タッチして わろう'][this.step]||'';}};

// ================= shop =================
const NUMS=[['いち','one'],['に','two'],['さん','three'],['よん','four'],['ご','five']];
SCN.shop={bg:'#fff8e0',song:'play',
  enter(){const pool=shuffle(['apple','banana','carrot','milk','bread','fish','egg','cheese','tomato','grapes']);const n=2+(Math.random()*3|0);this.need=pool.slice(0,n);this.got=[];
    this.items=shuffle(pool.slice(0,8)).map(k=>new Dr({k,r:52}));this.phase='pick';this.kj=null;this.scanned=0;this.dr=null;this.fin=0;this.price=2+(Math.random()*4|0);this.paid=0;this.coins=[];this.lay();
    say('おかいもの しよう！ '+this.need.map(k=>WORDS[k][0]).join('と ')+'を かってね');},
  lay(){this.items&&this.items.forEach((it,i)=>{if(it.inCart||it.scanned)return;it.hx=90+(i%4)*140;it.hy=i<4?H*.42:H*.6;if(!it.held){it.x=it.hx;it.y=it.hy;}});this.cart={x:450,y:H-120};},
  update(dt){for(const it of this.items)it.upd(dt);for(const cn of this.coins)cn.upd(dt);
    const k=this.kj;if(k){k.rot+=k.v*dt;k.acc+=Math.abs(k.v*dt);k.v*=Math.pow(.25,dt);if(Math.floor(k.rot/.8)!==Math.floor((k.rot-k.v*dt)/.8)&&Math.abs(k.v)>.5)sfx('tick');
      if(!k.ball&&k.acc>TAU*1.2){const r=Math.random();const col=r<.25?'gold':r<.55?'red':r<.8?'blue':'white';k.ball={col,t:0};sfx('boing');}
      if(k.ball){k.ball.t+=dt;if(k.ball.t>.9&&!k.ball.said){k.ball.said=1;const B=this.KB[k.ball.col];if(k.ball.col==='gold'){sfx('fanfare');for(let i=0;i<6;i++)tone(1568,.12,'triangle',.18,i*.14);confetti(90);}else{sfx('ding');burst(300,this.kjY()+190,16,'star');}rkCheer();say(B[1]);}
        if(k.ball.t>3.2&&!this.fin)this.fin=.01;}}
    if(this.fin>0){this.fin+=dt;if(this.fin>2.2&&this.fin<9){this.fin=9;celebrate('shop',this.kj&&this.kj.ball&&this.kj.ball.col==='gold');}}},
  KB:{gold:['#ffd23a','カランカラン！ おおあたり〜！ きんいろの たま！','crown','とくしょう'],red:['#ff5a6a','あか！ あたり！ いちごを もらったよ','strawberry','1とう'],blue:['#5aa8ff','あお！ あたり！ ふうせんを もらったよ','balloon','2とう'],white:['#ffffff','しろ！ あめを もらったよ','starcandy','3とう']},
  kjY(){return H*.46;},
  drawKuji(c){const k=this.kj,cx=300,cy=this.kjY();c.fillStyle='#fff3c8';c.fillRect(-400,0,W+800,H);c.fillStyle='#ffe08a';for(let i=0;i<14;i++){c.save();c.translate(cx,cy);c.rotate(i/14*TAU+T*.1);c.fillRect(0,-10,900,20);c.restore();}
    c.fillStyle='#ff5a6a';rr(c,30,100,540,54,16);c.fill();c.fillStyle='#fff';c.font=`800 28px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('ガラガラ くじびき',300,128);
    Object.entries(this.KB).forEach(([kk,B],i)=>{const x=90+i*140,y=200;c.fillStyle='#fff';rr(c,x-62,y-34,124,68,16);c.fill();c.strokeStyle=kk==='gold'?'#ffc21a':'#e8d8c0';c.lineWidth=3;c.stroke();c.fillStyle=gfill(c,x-34,y,16,B[0]);circ(c,x-36,y,15);c.strokeStyle='#caa';c.lineWidth=1.5;c.beginPath();c.arc(x-36,y,15,0,TAU);c.stroke();drawItem(c,B[2],x+22,y-2,.75);c.fillStyle='#8a5a3a';c.font=`800 14px ${FONT}`;c.fillText(B[3],x+22,y+26);});
    c.fillStyle='#b8703a';c.fillRect(cx-150,cy+110,300,26);c.fillRect(cx-120,cy+30,20,90);c.fillRect(cx+100,cy+30,20,90);
    c.save();c.translate(cx,cy);c.rotate(k.rot);c.fillStyle=vfill(c,-130,130,'#ff8c5a',.2,-.2);c.beginPath();for(let i=0;i<8;i++){const a=i/8*TAU+Math.PI/8;c.lineTo(Math.cos(a)*130,Math.sin(a)*130);}c.closePath();c.fill();c.strokeStyle='#c8502a';c.lineWidth=6;c.stroke();
    c.fillStyle='#ffd08a';for(let i=0;i<8;i++){const a=i/8*TAU;circ(c,Math.cos(a)*80,Math.sin(a)*80,10);}c.fillStyle='#c8502a';circ(c,0,0,22);c.strokeStyle='#8a5a3a';c.lineWidth=10;c.beginPath();c.moveTo(0,0);c.lineTo(110,0);c.stroke();c.fillStyle='#ffd23a';circ(c,110,0,18);c.restore();
    c.fillStyle='#fff';rr(c,cx-70,cy+150,140,70,30);c.fill();c.strokeStyle='#e8d0a0';c.lineWidth=4;c.stroke();
    if(k.ball){const t=clamp(k.ball.t/.9,0,1);const B=this.KB[k.ball.col];const bx=lerp(cx+60,cx,t),by=lerp(cy+100,cy+185,t)-Math.sin(t*Math.PI)*40;
      if(k.ball.t>.9){c.save();c.translate(cx,cy+185);c.rotate(T);c.fillStyle=k.ball.col==='gold'?'rgba(255,220,80,.5)':'rgba(255,255,255,.6)';for(let i=0;i<10;i++){c.beginPath();c.moveTo(0,0);c.arc(0,0,120,i/10*TAU,(i+.4)/10*TAU);c.closePath();c.fill();}c.restore();const e=elastic(clamp((k.ball.t-.9)*2,0,1));drawItem(c,B[2],cx,cy+60-e*20,1.8*e);}
      c.fillStyle=gfill(c,bx-6,by-6,20,B[0]);circ(c,bx,by,19);c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=2;c.beginPath();c.arc(bx,by,19,0,TAU);c.stroke();}
    else{c.fillStyle='#8a5a3a';c.font=`800 24px ${FONT}`;c.fillText('ぐるぐる まわしてね！',cx,cy+260);c.fillStyle='#ffd23a';rr(c,cx-150,cy+280,300*clamp(k.acc/(TAU*1.2),0,1),14,7);c.fill();}
    drawFuka(c,90,H-40,{outfit:outfit(),t:T,dir:0,sc:2.8,cheer:!!(k.ball&&k.ball.t>.9)});drawRikki(c,520,H-40,{sc:2.3,t:T,happy:!!k.ball});this.rkPos={x:520,y:H-40,sc:2.3};},
  draw(c){if(this.phase==='kuji'){this.drawKuji(c);stepDots(c,4,3,272);return;}c.fillStyle='#fff3c8';c.fillRect(-400,0,W+800,H);c.fillStyle=vfill(c,H-230,H,'#e8f4d8',.05,-.06);c.fillRect(-400,H-230,W+800,H);
    const n=this.need.length,cw=Math.min(150,440/n);c.fillStyle='rgba(90,40,110,.12)';rr(c,114,106,460,148,20);c.fill();c.fillStyle='#fff';rr(c,110,100,460,148,20);c.fill();c.strokeStyle='#6cd08a';c.lineWidth=5;c.stroke();
    this.need.forEach((k,i)=>{const x=340-(n-1)*cw/2+i*cw,y=150;drawItem(c,k,x,y,1.2);c.fillStyle='#5a4a3a';c.font=`800 20px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(WORDS[k][0],x,y+64);
      if(this.got.includes(k)){c.strokeStyle='#ff5fa2';c.lineWidth=7;c.beginPath();c.moveTo(x-26,y+2);c.lineTo(x-6,y+24);c.lineTo(x+30,y-22);c.stroke();}});
    if(this.phase==='pick'){for(const yy of[H*.42,H*.6]){c.fillStyle='#c8905a';rr(c,20,yy+34,W-40,18,6);c.fill();c.fillStyle='#e0b080';rr(c,20,yy+30,W-40,10,4);c.fill();}
      for(const it of this.items)if(!it.held&&!it.inCart)it.draw(c,1.5);this.drawCart(c);
      drawFuka(c,160,H-40,{outfit:outfit(),t:T,dir:2,sc:3,happy:this.got.length>0,hold:1});for(const it of this.items)if(it.held)it.draw(c,1.7);}
    else if(this.phase==='reg'){const cy=H*.5;c.fillStyle='#ffe0a8';rr(c,-20,cy-190,W+40,120,20);c.fill();drawAnimal(c,'cat',300,cy-60,1.5,{t:T,happy:this.scanned>=n});c.fillStyle='#ff8cc0';rr(c,240,cy-110,120,40,10);c.fill();
      c.fillStyle='#b8c0e0';rr(c,-20,cy-20,W+40,120,16);c.fill();c.fillStyle='#8a92b8';for(let x=((T*60)%40)-40;x<W;x+=40)c.fillRect(x,cy+20,20,6);
      c.fillStyle='#5a6a9a';rr(c,470,cy-110,110,90,12);c.fill();c.fillStyle='#9fe0ff';rr(c,482,cy-100,86,40,8);c.fill();c.fillStyle='#2a3a5a';c.font=`800 22px ${FONT}`;c.textAlign='center';c.fillText(this.scanned+'/'+n,525,cy-80);
      for(const it of this.items)if(it.inCart&&!it.scanned)drawItem(c,it.k,it.x,it.y+Math.sin(T*3+it.x)*3,1.5);
      c.fillStyle='#e8b070';rr(c,200,H-230,200,150,[10,10,24,24]);c.fill();c.fillStyle='#d09050';c.fillRect(200,H-230,200,20);for(const it of this.items)if(it.scanned)drawItem(c,it.k,it.bx,H-240+Math.sin(T*2+it.bx)*2,1.1);
      drawFuka(c,90,H-40,{outfit:outfit(),t:T,dir:0,sc:3,happy:this.scanned>=n,wave:this.scanned<n});drawRikki(c,520,H-40,{sc:2.4,t:T,happy:this.scanned>=n});this.rkPos={x:520,y:H-40,sc:2.4};}
    else{const cy=H*.42;drawAnimal(c,'cat',300,cy-40,1.3,{t:T,happy:this.paid>=this.price});c.fillStyle='#5a6a9a';rr(c,100,cy,400,90,20);c.fill();c.fillStyle='#9fe0ff';rr(c,120,cy+14,360,60,12);c.fill();
      c.fillStyle='#2a3a5a';c.font=`800 38px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(`おかね ${this.price}こ`,300,cy+44);
      c.fillStyle='#fff';rr(c,80,cy+120,440,110,24);c.fill();c.strokeStyle='#ffd23a';c.lineWidth=5;c.stroke();
      for(let i=0;i<this.price;i++){const x=300-(this.price-1)*44+i*88,y=cy+175;if(i<this.paid){drawItem(c,'coin',x,y,1.4);c.fillStyle='#8a5a2a';c.font=`800 20px ${FONT}`;c.fillText(i+1,x,y+44);}else{c.strokeStyle='#e8d8a8';c.lineWidth=4;c.setLineDash([6,6]);c.beginPath();c.arc(x,y,28,0,TAU);c.stroke();c.setLineDash([]);}}
      c.fillStyle=vfill(c,H-190,H-30,'#ff8cc0');rr(c,40,H-190,W-80,160,40);c.fill();c.fillStyle='#ffd0e6';rr(c,60,H-176,W-120,20,10);c.fill();for(const cn of this.coins)if(!cn.used)cn.draw(c,1.4);
      drawRikki(c,540,H*.42+30,{sc:2,t:T,happy:this.paid>=this.price});this.rkPos={x:540,y:H*.42+30,sc:2};}
    stepDots(c,4,this.phase==='pick'?0:this.phase==='reg'?1:2,272);},
  drawCart(c){const {x,y}=this.cart;drawRikki(c,x+62,y-58,{sc:2,t:T,happy:this.got.length>0});this.rkPos={x:x+62,y:y-58,sc:2};
    c.strokeStyle='#ff5a7a';c.lineWidth=7;c.lineJoin='round';c.fillStyle='rgba(255,140,170,.3)';c.beginPath();c.moveTo(x-110,y-90);c.lineTo(x+110,y-90);c.lineTo(x+90,y+20);c.lineTo(x-90,y+20);c.closePath();c.fill();c.stroke();
    c.beginPath();c.moveTo(x-110,y-90);c.lineTo(x-140,y-120);c.stroke();c.fillStyle='#4a4a6a';circ(c,x-60,y+40,14);circ(c,x+60,y+40,14);
    this.items.filter(i=>i.inCart).forEach((it,i)=>drawItem(c,it.k,x-80+i*42,y-62,1.05));},
  down(x,y){if(this.fin>0)return;
    if(this.phase==='kuji'){const k=this.kj;if(k.ball)return;const cy=this.kjY();if(Math.hypot(x-300,y-cy)<200){k.la=Math.atan2(y-cy,x-300);k.v=Math.min(12,k.v+5);sfx('gacha');}return;}
    if(this.phase==='pick'){for(const it of this.items)if(!it.inCart&&it.hit(x,y)){it.held=true;this.dr=it;sfx('tap');sayWord(it.k);return;}}
    else if(this.phase==='reg'){const n=this.need.length;for(const it of this.items)if(it.inCart&&!it.scanned&&hitC(x,y,it.x,it.y,56)){it.scanned=true;it.bx=240+this.scanned*(120/Math.max(1,n-1));this.scanned++;sfx('beep');burst(it.x,it.y,8,'star');sayPair('ピッ！','',it.k);
        if(this.scanned>=n){setTimeout(()=>{if(scene!==this)return;this.phase='pay';this.coins=[...Array(6)].map((_,i)=>new Dr({k:'coin',hx:110+i*76,hy:H-110,r:40}));say(`おかねを ${this.price}こ はらってね`);},1000);}return;}}
    else{for(const cn of this.coins)if(!cn.used&&cn.hit(x,y)){cn.held=true;this.dr=cn;sfx('coin');return;}}},
  move(x,y){if(this.phase==='kuji'){const k=this.kj;if(k.la==null||k.ball)return;const a=Math.atan2(y-this.kjY(),x-300);let d=a-k.la;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;k.la=a;k.v=clamp(k.v+d*12,-9,9);return;}if(this.dr){this.dr.x=x;this.dr.y=y;}},
  up(x,y){if(this.kj)this.kj.la=null;const it=this.dr;if(!it)return;this.dr=null;it.held=false;
    if(this.phase==='pay'){if(y<H*.42+240&&y>H*.42+80&&this.paid<this.price){it.used=true;const nm=NUMS[this.paid];this.paid++;sfx('coin');burst(x,y,8,'star');sayPair(nm[0]+'！',nm[1],'coin');
        if(this.paid>=this.price){setTimeout(()=>{sfx('chin');rkCheer();say('ちょうど です！ おれいに くじびき！ ガラガラを ぐるぐる まわしてね！');},700);setTimeout(()=>{if(scene===this){this.phase='kuji';this.kj={rot:0,v:0,acc:0,ball:null,bt:0,la:null};}},2200);}}return;}
    const {x:cx,y:cy}=this.cart;
    if(x>cx-140&&x<cx+140&&y>cy-150&&y<cy+60){if(this.need.includes(it.k)&&!this.got.includes(it.k)){it.inCart=true;this.got.push(it.k);sfx('ding');rkCheer();burst(x,y,12);sayWord(it.k,'ゲット！');
        if(this.got.length===this.need.length)setTimeout(()=>{this.phase='reg';const cy2=H*.5;this.items.filter(i=>i.inCart).forEach((q,i,a)=>{q.x=q.hx=300-(a.length-1)*65+i*130;q.y=q.hy=cy2+40;});say('レジで ピッ！ おかいものを タッチしてね');},1400);}
      else{sfx('no');say(this.got.includes(it.k)?'それは もう はいってるよ':'それは リストに ないよ〜');}}},
  hint(){if(this.fin>0)return null;if(this.phase==='kuji')return this.kj.ball?null:{x:180,y:this.kjY()-60,x2:420,y2:this.kjY()-60};if(this.phase==='pick'){const it=this.items.find(i=>this.need.includes(i.k)&&!i.inCart);return it?{x:it.hx,y:it.hy,x2:this.cart.x,y2:this.cart.y-50}:null;}
    if(this.phase==='reg'){const it=this.items.find(i=>i.inCart&&!i.scanned);return it?{x:it.x,y:it.y}:null;}const cn=this.coins.find(c2=>!c2.used);return cn?{x:cn.hx,y:cn.hy,x2:300,y2:H*.42+175}:null;},
  hintText(){return this.phase==='kuji'?'ガラガラを ぐるぐる まわしてね':this.phase==='pick'?'リストの ものを カートに いれてね':this.phase==='reg'?'おかいものを タッチして ピッ！':'おかねを うえに いれてね';}};

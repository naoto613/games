// ================= farm =================
const VEG=[['carrot','にんじん','carrot'],['corn','とうもろこし','corn'],['tomato','トマト','tomato'],['pumpkin','かぼちゃ','pumpkin']];
SCN.farm={bg:'#bfe9ff',song:'town',
  enter(){this.ph='plow';this.t=0;this.fin=0;this.plow=mkCells(240,70,26);this.tx=60;this.ty=H*.55;this.drag=false;this.plots=[...Array(6)].map((_,i)=>({x:120+(i%3)*180,y:H*.54-20+Math.floor(i/3)*110,st:-1,g:0,k:VEG[i%4][0],out:false,py:0}));this.basket=[];this.eggs=[];this.milk=0;this.hens=[{x:120,y:H*.52},{x:230,y:H*.56}];
    say('のうじょう！ トラクターを ゆびで うごかして はたけを たがやそう');},
  F(){return{x:300,y:H*.54};},
  update(dt){this.t+=dt;for(const p of this.plots){if(p.st>=0&&p.st<3&&p.wet){p.g+=dt*.8;if(p.g>=1){p.g=0;p.st++;p.wet=false;if(p.st===3){sfx('spark');burst(p.x,p.y-40,8,'star');}}}}
    if(this.plots.every(p=>p.st>=3)&&this.ph==='water'){this.ph='harvest';this.can=null;sfx('fanfare');say('やさいが できた！ ひっぱって しゅうかく しよう');}
    if(this.fin>0){this.fin+=dt;if(this.fin>2.6&&this.fin<9){this.fin=9;celebrate('farm',this.basket.length>=6&&this.milk>=1);}}},
  drawVeg(c,p){const st=p.st;if(st<0)return;const x=p.x,y=p.y-p.py;if(st===0){c.fillStyle='#6a4a2a';circ(c,x-6,y,4);circ(c,x+6,y-2,4);return;}c.strokeStyle='#4cae4a';c.lineWidth=5;const h=st===1?20:st===2?40:52;c.beginPath();c.moveTo(x,y);c.lineTo(x,y-h);c.stroke();c.fillStyle='#6cd08a';for(const sd of[-1,1]){c.beginPath();c.ellipse(x+sd*12,y-h*.7,13,6,sd*.6,0,TAU);c.fill();}
    if(st===3){if(p.k==='carrot'){c.fillStyle='#ff8a3a';c.beginPath();c.moveTo(x-12,y);c.lineTo(x+12,y);c.lineTo(x,y+(p.py>0?46:10));c.closePath();c.fill();}else if(p.k==='corn')drawItem(c,'corn',x,y-40,1.1);else if(p.k==='tomato')drawItem(c,'tomato',x,y-40,1);else SPECIAL_THING.pumpkin(c,x,y-14,1);}},
  draw(c){skyBg(c,'#8fd8ff','#e6f8ff',H*.36);sun(c,500,100,32,T*.3);cloud(c,140,110,.6,true);c.fillStyle=vfill(c,H*.34,H,'#9ee07a',.05,-.08);c.fillRect(-400,H*.34,W+800,H);
    c.fillStyle='#c83a3a';rr(c,380,H*.2,180,H*.16,6);c.fill();c.fillStyle='#fff';c.beginPath();c.moveTo(370,H*.2);c.lineTo(470,H*.12);c.lineTo(570,H*.2);c.fill();c.fillStyle='#fff';rr(c,440,H*.27,60,H*.09,[30,30,0,0]);c.fill();
    const ph=this.ph,F=this.F();
    if(ph==='plow'||ph==='seed'||ph==='water'||ph==='harvest'){c.fillStyle='#b8804a';rr(c,F.x-250,F.y-80,500,200,20);c.fill();if(ph==='plow'){c.fillStyle='#8a5a2a';for(const q of this.plow)if(q.v)circ(c,F.x+q.x,F.y+20+q.y,18);}else{c.fillStyle='#8a5a2a';for(let r=0;r<2;r++){rr(c,F.x-240,F.y-40+r*110,480,40,20);c.fill();}}
      if(ph!=='plow')for(const p of this.plots){if(!p.out)this.drawVeg(c,p);if(p.wet){c.fillStyle='rgba(90,160,255,.35)';ell(c,p.x,p.y+4,40,12);}if(p.st>=0&&p.st<3){c.fillStyle='rgba(255,255,255,.8)';rr(c,p.x-30,p.y+18,60,8,4);c.fill();c.fillStyle='#6cd08a';rr(c,p.x-30,p.y+18,60*(p.st+p.g)/3,8,4);c.fill();}}}
    if(ph==='plow')drawTractor(c,this.tx,this.ty,.8,this.tx/40);
    if(ph==='seed'){c.fillStyle='#fff';c.font=`800 22px ${FONT}`;c.textAlign='center';c.fillText('はたけを タッチして たねを まこう',W/2,H*.84);}
    if(ph==='water'&&this.can){c.save();c.translate(this.can.x,this.can.y);c.rotate(-.4);c.fillStyle='#5aa8ff';rr(c,-30,-22,60,44,10);c.fill();c.strokeStyle='#3a88d8';c.lineWidth=6;c.beginPath();c.moveTo(-30,-10);c.lineTo(-62,-30);c.stroke();c.restore();for(let i=0;i<3;i++)parts.push({x:this.can.x-50+rand(-6,6),y:this.can.y-10,vx:rand(-20,20),vy:200,life:.4,t:0,kind:'drop',col:'#8ad0ff'});}
    if(ph==='water'&&!this.can){c.save();c.translate(W/2,H-90);c.fillStyle='#5aa8ff';rr(c,-30,-22,60,44,10);c.fill();c.restore();c.fillStyle='#fff';c.font=`800 20px ${FONT}`;c.textAlign='center';c.fillText('じょうろ',W/2,H-40);}
    if(ph==='harvest'){c.fillStyle='#c8905a';rr(c,W/2-80,H-120,160,80,[10,10,30,30]);c.fill();this.basket.forEach((k,i)=>{if(k==='pumpkin')SPECIAL_THING.pumpkin(c,W/2-60+i*24,H-124,.6);else drawItem(c,k,W/2-60+i*24,H-124,.7);});c.fillStyle='#fff';c.font=`800 20px ${FONT}`;c.textAlign='center';c.fillText('やさいを うえに ひっぱって ぬこう！',W/2,H*.84);}
    if(ph==='animals'){c.fillStyle='#e8c890';rr(c,40,H*.4,240,H*.3,20);c.fill();c.fillStyle='#c8a060';c.fillRect(40,H*.66,240,10);for(const h of this.hens){this.hen(c,h.x,h.y);}for(const e of this.eggs){if(!e.got){c.fillStyle='#fff6e8';c.beginPath();c.ellipse(e.x,e.y,11,14,0,0,TAU);c.fill();}}
      this.cow(c,440,H*.62);c.fillStyle='#d8d8e8';rr(c,470,H*.64,50,50,6);c.fill();c.fillStyle='#fff';rr(c,472,H*.64+50-48*this.milk,46,48*this.milk,4);c.fill();
      c.fillStyle='#c8905a';rr(c,60,H-120,160,70,[10,10,30,30]);c.fill();this.eggs.filter(e=>e.got).forEach((e,i)=>{c.fillStyle='#fff6e8';c.beginPath();c.ellipse(90+i*30,H-122,11,14,0,0,TAU);c.fill();});
      c.fillStyle='#5a3a2a';c.font=`800 18px ${FONT}`;c.textAlign='center';c.fillText('にわとりを タッチ → たまごを ひろおう',160,H*.38);c.fillText('うしの おちちを タッチ',440,H*.38);}
    drawFuka(c,ph==='animals'?300:540,H*.94,{outfit:outfit({acc:'cap'}),t:T,sc:1.9,point:this.fin<=0,cheer:this.fin>0});drawRikki(c,ph==='animals'?380:450,H*.95,{sc:1.4,t:T,clap:RK.clap});this.rkPos=null;
    stepDots(c,5,{plow:0,seed:1,water:2,harvest:3,animals:4}[ph],128);},
  hen(c,x,y){c.save();c.translate(x,y);c.fillStyle='#fff';c.beginPath();c.ellipse(0,0,30,24,0,0,TAU);c.fill();circ(c,24,-20,14);c.fillStyle='#ff3a3a';c.beginPath();c.moveTo(18,-34);c.lineTo(22,-42);c.lineTo(26,-34);c.lineTo(30,-40);c.lineTo(32,-30);c.fill();c.fillStyle='#ffb03a';c.beginPath();c.moveTo(36,-22);c.lineTo(46,-18);c.lineTo(36,-14);c.fill();c.fillStyle='#222';circ(c,28,-22,2.5);c.restore();},
  cow(c,x,y){c.save();c.translate(x,y);c.fillStyle='#fff';rr(c,-80,-80,150,76,30);c.fill();c.fillStyle='#2a2a2a';ell(c,-40,-60,20,14);ell(c,20,-40,18,12);c.fillStyle='#fff';for(const lx of[-66,-40,34,56])rr(c,lx,-10,14,50,5),c.fill();c.fillStyle='#fff';circ(c,86,-80,34);c.fillStyle='#ffc8d8';ell(c,96,-66,22,14);c.fillStyle='#222';circ(c,80,-90,4);c.fillStyle='#ffc8d8';ell(c,0,-2,20,10);for(const d of[-10,0,10]){c.fillStyle='#ffb0c8';rr(c,d-3,4,6,12,3);c.fill();}c.restore();},
  down(x,y){const ph=this.ph,F=this.F();
    if(ph==='plow'){if(Math.hypot(x-this.tx,y-this.ty+40)<120)this.drag=true;return;}
    if(ph==='seed'){for(const p of this.plots)if(p.st<0&&hitC(x,y,p.x,p.y,60)){p.st=0;sfx('pop');burst(p.x,p.y,6,'dot');if(this.plots.every(q=>q.st>=0)){this.ph='water';sfx('fanfare');say('じょうろで おみずを あげよう！ おおきく なあれ');}return;}return;}
    if(ph==='water'){if(hitC(x,y,W/2,H-90,60)||this.plots.some(p=>hitC(x,y,p.x,p.y,70)))this.can={x,y};return;}
    if(ph==='harvest'){for(const p of this.plots)if(p.st===3&&!p.out&&hitC(x,y,p.x,p.y-30,60)){this.pull={p,sy:y};return;}return;}
    if(ph==='animals'){for(const h of this.hens)if(hitC(x,y,h.x,h.y,40)&&this.eggs.length<4){this.eggs.push({x:h.x+rand(-20,20),y:h.y+30,got:false});sfx('pop');hush();speak('コケコッコー！');return;}
      for(const e of this.eggs)if(!e.got&&hitC(x,y,e.x,e.y,30)){e.got=true;sfx('ding');return;}
      if(Math.abs(x-440)<50&&Math.abs(y-(H*.62))<30){this.milk=Math.min(1,this.milk+.2);sfx('squish');drops(445,H*.62+16,3,'#fff');if(this.milk>=1&&!this.mooed){this.mooed=1;hush();speak('モ〜！');}}
      if(this.eggs.filter(e=>e.got).length>=3&&this.milk>=1&&!this.fin){this.fin=.01;sfx('fanfare');confetti(70);say('やさいも たまごも ぎゅうにゅうも いっぱい！ のうじょう だいせいこう！');}}},
  move(x,y){const F=this.F();if(this.ph==='plow'&&this.drag){this.tx=clamp(x,40,W-40);this.ty=clamp(y,F.y-40,F.y+140);const ch=paintCells(this.plow,F.x,F.y+20,this.tx,this.ty-30,60);if(ch&&Math.random()<.3)sfx('squish');if(cov(this.plow)>.75){this.ph='seed';this.drag=false;sfx('fanfare');say('ふかふかの はたけ！ タッチして たねを まこう');}}
    if(this.can){this.can.x=x;this.can.y=y;for(const p of this.plots)if(p.st>=0&&p.st<3&&Math.abs(p.x-(x-50))<50&&Math.abs(p.y-(y+20))<70&&!p.wet){p.wet=true;sfx('water');}}
    if(this.pull){const p=this.pull.p;p.py=clamp(this.pull.sy-y,0,80);if(p.py>=70){p.out=true;this.basket.push(p.k==='pumpkin'?'pumpkin':p.k);this.pull=null;sfx('pop');burst(p.x,p.y-60,10,'star');const v=VEG.find(q=>q[0]===p.k);sayPair(v[1],v[2]);if(this.plots.every(q=>q.out)){setTimeout(()=>{if(scene===this){this.ph='animals';say('どうぶつの おせわ！ にわとりの たまごと うしの ぎゅうにゅうを あつめよう');}},1500);}}}},
  up(){this.drag=false;this.can=null;if(this.pull){this.pull.p.py=0;this.pull=null;}},
  hint(){const ph=this.ph,F=this.F();if(ph==='plow')return{x:this.tx,y:this.ty-40,x2:F.x+200,y2:F.y+20};if(ph==='seed'){const p=this.plots.find(p=>p.st<0);return p?{x:p.x,y:p.y}:null;}if(ph==='water'){const p=this.plots.find(p=>p.st<3&&!p.wet);return p?{x:W/2,y:H-90,x2:p.x+50,y2:p.y-20}:null;}if(ph==='harvest'){const p=this.plots.find(p=>!p.out);return p?{x:p.x,y:p.y-30,x2:p.x,y2:p.y-120}:null;}
    if(ph==='animals'){const e=this.eggs.find(e=>!e.got);if(e)return{x:e.x,y:e.y};if(this.eggs.length<3)return{x:this.hens[0].x,y:this.hens[0].y};return{x:440,y:H*.62};}return null;},
  hintText(){return{plow:'トラクターを うごかそう',seed:'はたけを タッチ',water:'じょうろで おみず',harvest:'やさいを うえに ひっぱろう',animals:'にわとりと うしの おせわ'}[this.ph]||'';}};

// ================= ゲームセンター A: もぐらたたき / エアホッケー / ブロックくずし / パクパクめいろ / スターシューター =================
// ---------- もぐらたたき ----------
SCN.mogura={bg:'#2a1a4a',song:'arcade',
  enter(){arcInit(this,'mogura',{time:40,th:[600,1200,1900],intro:'もぐらたたき！ でてきた もぐらを タッチして たたこう！ きんいろ もぐらは たくさん てんすう。 ひよこは たたかないでね'});
    this.holes=[...Array(9)].map((_,i)=>({i,st:'none',k:'mole',up:0,t:0,dur:1}));this.sp=.8;this.ham=null;},
  hp(i){const top=280,bot=H-120,rh=(bot-top)/3;return{x:120+(i%3)*180,y:top+rh*(Math.floor(i/3)+.72)};},
  update(dt){const on=arcTick(this,dt);for(const h of this.holes){if(h.st==='up'){h.up=Math.min(1,h.up+dt*7);h.t+=dt;if(h.t>h.dur){h.st='down';if(h.k!=='chick')arcMiss(this);}}else if(h.st==='hit'){h.t+=dt;if(h.t>.45)h.st='down';}else if(h.st==='down'){h.up-=dt*6;if(h.up<=0){h.up=0;h.st='none';}}}
    if(this.ham)this.ham.t+=dt;if(!on)return;const el=this.t0-this.time;this.sp-=dt;
    if(this.sp<=0){const free=this.holes.filter(h=>h.st==='none');const n=el>25?2:1;for(let k=0;k<n&&free.length;k++){const h=free.splice(Math.floor(Math.random()*free.length),1)[0];const r=Math.random();h.k=r<.12?'gold':r<.27&&el>6?'chick':'mole';h.st='up';h.t=0;h.dur=Math.max(.75,1.5-el*.02)+(h.k==='gold'?-.2:0);}this.sp=Math.max(.42,1.05-el*.016);}},
  draw(c){arcBg(c,'#2a1a5a','#5a2a6a');const sh=this.shake>0?Math.sin(T*80)*6:0;c.save();c.translate(sh,0);
    c.fillStyle='#5cbe5a';rr(c,24,250,W-48,H-310,40);c.fill();c.fillStyle='#6cd06a';for(let i=0;i<40;i++){circ(c,40+(i*97)%(W-80),270+(i*53)%(H-340),8);}c.strokeStyle='#ffe24a';c.lineWidth=6;rr(c,24,250,W-48,H-310,40);c.stroke();
    for(const h of this.holes){const p=this.hp(h.i);c.fillStyle='#3a2a1a';ell(c,p.x,p.y,70,24);c.fillStyle='#1a0a0a';ell(c,p.x,p.y+2,60,18);
      if(h.up>0){c.save();c.beginPath();c.rect(p.x-80,p.y-160,160,160);c.clip();const yy=p.y+46-h.up*86;c.save();c.translate(p.x,yy);c.scale(1.5,1.5);
        if(h.k==='chick'){drawAnimal(c,'chick',0,40,.55,{t:T,happy:0});}else{moleFace(c,h.st==='hit');if(h.k==='gold'){c.fillStyle='rgba(255,210,40,.55)';c.beginPath();c.arc(0,0,30,Math.PI,0);c.lineTo(30,30);c.lineTo(-30,30);c.closePath();c.fill();c.fillStyle='#ffe24a';star(c,0,-38,9,4);c.fill();}
          c.fillStyle=h.k==='gold'?'#ffe24a':'#ff6fa8';rr(c,-22,-36,44,10,5);c.fill();}
        if(h.st==='hit'){for(let k=0;k<3;k++){const a=T*6+k*2.1;c.fillStyle='#ffe24a';star(c,Math.cos(a)*26,-40+Math.sin(a)*6,7,3);c.fill();}}c.restore();c.restore();}
      c.fillStyle='#4a8a3a';c.beginPath();c.ellipse(p.x,p.y+6,74,16,0,0,Math.PI);c.fill();}
    if(this.ham&&this.ham.t<.3){const a=this.ham;c.save();c.translate(a.x+40,a.y-30);c.rotate(-1+Math.min(1,a.t*8)*1.3);drawThing(c,'hammer',-30,-10,1.4);c.restore();}
    c.restore();arcHUD(c,this,'もぐらたたき','#ff6f91');},
  down(x,y){if(this.ph!=='play')return;this.ham={x,y,t:0};let hit=false;for(const h of this.holes){const p=this.hp(h.i);if(h.st==='up'&&h.up>.4&&Math.abs(x-p.x)<85&&y>p.y-150&&y<p.y+40){hit=true;
      if(h.k==='chick'){h.st='down';arcMiss(this);sfx('no');hush();speak('ぴよっ！ たたかないで〜');this.shake=.3;}
      else{h.st='hit';h.t=0;const v=arcAdd(this,h.k==='gold'?30:10,p.x,p.y-90,h.k==='gold'?'#ffe24a':'#fff');tone(180,.12,'square',.2,0,-80);noise(.08,.3,900);burst(p.x,p.y-40,h.k==='gold'?18:8,'star');if(h.k==='gold'){sfx('coin');}}break;}}if(!hit)tone(120,.06,'sine',.1);},
  hint(){if(this.ph!=='play')return null;const h=this.holes.find(h=>h.st==='up'&&h.k!=='chick');if(!h)return null;const p=this.hp(h.i);return{x:p.x,y:p.y-40};},
  hintText(){return 'もぐらを タッチ！ ひよこは たたかないでね';}};
// ---------- エアホッケー ----------
SCN.hockey={bg:'#10204a',song:'arcade',
  enter(){arcInit(this,'hockey',{time:75,th:[300,500,700],intro:'エアホッケー！ ゆびで あかい マレットを うごかして、 パックを うえの ゴールに いれよう！ 5てん とったら かち！'});
    this.op=pick(['bear','cat','panda','rabbit','dog']);this.pg=0;this.og=0;this.lay();this.me={x:W/2,y:this.Y1-110,px:W/2,py:this.Y1-110,vx:0,vy:0};this.ai={x:W/2,y:this.Y0+110,vx:0,vy:0};this.reset(1);this.tg=null;this.goalT=0;},
  lay(){this.X0=40;this.X1=W-40;this.Y0=260;this.Y1=H-40;this.GW=110;this.cy=(this.Y0+this.Y1)/2;},
  reset(toMe){this.pk={x:W/2,y:this.cy+(toMe?90:-90),vx:rand(-40,40),vy:0,r:26};},
  update(dt){const on=arcTick(this,dt);const me=this.me,ai=this.ai,pk=this.pk,R=46;
    if(this.tg){me.x+=(this.tg.x-me.x)*Math.min(1,dt*25);me.y+=(this.tg.y-me.y)*Math.min(1,dt*25);}me.x=clamp(me.x,this.X0+R,this.X1-R);me.y=clamp(me.y,this.cy+R,this.Y1-R);me.vx=(me.x-me.px)/Math.max(dt,.001);me.vy=(me.y-me.py)/Math.max(dt,.001);me.px=me.x;me.py=me.y;
    if(!on&&this.ph!=='end')return;if(this.goalT>0){this.goalT-=dt;if(this.goalT<=0)this.reset(this.lastGoal==='ai');return;}if(this.ph==='end')return;
    // AI
    const lv=Math.min(4,this.pg+this.og);const aspd=260+lv*25;let tx=W/2,ty=this.Y0+90;if(pk.y<this.cy+40){tx=pk.x+(pk.x-W/2)*.1;ty=pk.vy<0?pk.y-40:Math.min(pk.y+10,this.cy-R);if(pk.y<ai.y)ty=this.Y0+60;}
    const dx=tx-ai.x,dy=ty-ai.y,d=Math.hypot(dx,dy);ai.vx=0;ai.vy=0;if(d>2){const s=Math.min(d/dt,aspd);ai.vx=dx/d*s;ai.vy=dy/d*s;ai.x+=ai.vx*dt;ai.y+=ai.vy*dt;}ai.x=clamp(ai.x,this.X0+R,this.X1-R);ai.y=clamp(ai.y,this.Y0+R,this.cy-R);
    // puck
    const steps=3;for(let k=0;k<steps;k++){const h=dt/steps;pk.x+=pk.vx*h;pk.y+=pk.vy*h;
      for(const m of[me,ai]){const ddx=pk.x-m.x,ddy=pk.y-m.y,dd=Math.hypot(ddx,ddy);if(dd<R+pk.r&&dd>0){const nx=ddx/dd,ny=ddy/dd;pk.x=m.x+nx*(R+pk.r);pk.y=m.y+ny*(R+pk.r);const rv=(pk.vx-m.vx)*nx+(pk.vy-m.vy)*ny;if(rv<0){pk.vx-=1.9*rv*nx;pk.vy-=1.9*rv*ny;}
        pk.vx+=m.vx*.25;pk.vy+=m.vy*.25;tone(m===me?700:500,.05,'square',.1);if(m===me&&on){this.hits=(this.hits||0)+1;}}}
      const sp=Math.hypot(pk.vx,pk.vy);if(sp>1250){pk.vx*=1250/sp;pk.vy*=1250/sp;}
      if(pk.x<this.X0+pk.r){pk.x=this.X0+pk.r;pk.vx=Math.abs(pk.vx)*.9;tone(300,.04,'square',.06);}if(pk.x>this.X1-pk.r){pk.x=this.X1-pk.r;pk.vx=-Math.abs(pk.vx)*.9;tone(300,.04,'square',.06);}
      const inG=Math.abs(pk.x-W/2)<this.GW-pk.r*.3;
      if(pk.y<this.Y0+pk.r){if(inG&&pk.y<this.Y0-pk.r){this.goal('me');return;}if(!inG){pk.y=this.Y0+pk.r;pk.vy=Math.abs(pk.vy)*.9;tone(300,.04,'square',.06);}}
      if(pk.y>this.Y1-pk.r){if(inG&&pk.y>this.Y1+pk.r){this.goal('ai');return;}if(!inG){pk.y=this.Y1-pk.r;pk.vy=-Math.abs(pk.vy)*.9;tone(300,.04,'square',.06);}}}
    pk.vx*=Math.pow(.7,dt);pk.vy*=Math.pow(.7,dt);if(Math.hypot(pk.vx,pk.vy)<30&&Math.abs(pk.y-this.cy)<30){pk.vy+=(pk.y<this.cy?-1:1)*40*dt;}},
  goal(who){this.lastGoal=who;this.goalT=1.6;this.pk.vx=this.pk.vy=0;this.pk.y=-999;if(who==='me'){this.pg++;arcAdd(this,100,W/2,this.Y0+80,'#ffe24a');sfx('fanfare');confetti(30);hush();speak(pick(['ゴール！','やったー！','すごい シュート！']));this.fever=this.pg>=3?3:0;}
    else{this.og++;arcMiss(this);sfx('no');hush();speak(WORDS[this.op][0]+'の ゴール！ まけないで！');this.shake=.4;}
    if(this.pg>=5){this.score+=Math.max(0,Math.round(this.time))*3;arcEnd(this,'かち！');}else if(this.og>=5)arcEnd(this,'ざんねん！');},
  draw(c){arcBg(c,'#10204a','#2a1060',false);const sh=this.shake>0?Math.sin(T*80)*6:0;c.save();c.translate(sh,0);const X0=this.X0,X1=this.X1,Y0=this.Y0,Y1=this.Y1;
    c.save();c.shadowColor='#4ad0ff';c.shadowBlur=24;c.fillStyle='#e8f6ff';rr(c,X0-14,Y0-14,X1-X0+28,Y1-Y0+28,40);c.fill();c.restore();c.fillStyle='#bfe8ff';rr(c,X0,Y0,X1-X0,Y1-Y0,30);c.fill();
    c.fillStyle='rgba(255,255,255,.35)';for(let y=Y0+20;y<Y1;y+=34)for(let x=X0+20;x<X1;x+=34)circ(c,x,y,2);
    c.strokeStyle='#ff6f91';c.lineWidth=5;c.beginPath();c.moveTo(X0,this.cy);c.lineTo(X1,this.cy);c.stroke();c.beginPath();c.arc(W/2,this.cy,70,0,TAU);c.stroke();c.strokeStyle='#5aa8ff';c.beginPath();c.arc(W/2,Y0,this.GW+30,0,Math.PI);c.stroke();c.beginPath();c.arc(W/2,Y1,this.GW+30,Math.PI,TAU);c.stroke();
    c.fillStyle='#1a1040';rr(c,W/2-this.GW,Y0-18,this.GW*2,16,6);c.fill();rr(c,W/2-this.GW,Y1+2,this.GW*2,16,6);c.fill();
    drawAnimal(c,this.op,X0+60,Y0+70,.42,{t:T,happy:this.lastGoal==='ai'&&this.goalT>0});c.fillStyle='#fff';c.font=`40px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.fillStyle='rgba(58,40,90,.35)';c.fillText(this.og,W/2,this.cy-60);c.fillText(this.pg,W/2,this.cy+62);
    const pk=this.pk;if(pk.y>-100){c.fillStyle='rgba(0,0,0,.2)';ell(c,pk.x+4,pk.y+6,pk.r,pk.r*.9);c.fillStyle='#3a2a5a';circ(c,pk.x,pk.y,pk.r);c.fillStyle='#ffe24a';circ(c,pk.x,pk.y,pk.r*.55);}
    const mal=(m,col,col2)=>{c.fillStyle='rgba(0,0,0,.2)';circ(c,m.x+5,m.y+8,46);c.fillStyle=col2;circ(c,m.x,m.y,46);c.fillStyle=col;circ(c,m.x,m.y,38);c.fillStyle=col2;circ(c,m.x,m.y,18);c.fillStyle='rgba(255,255,255,.5)';circ(c,m.x-8,m.y-8,7);};
    mal(this.ai,'#5aa8ff','#2a60c0');mal(this.me,'#ff6f91','#c0305a');
    if(this.goalT>0){c.font=`70px ${POP}`;c.lineWidth=10;c.strokeStyle='#fff';const t=this.lastGoal==='me'?'ゴール！':'とられた！';c.strokeText(t,W/2,this.cy);c.fillStyle=this.lastGoal==='me'?'#ff4d8d':'#5aa8ff';c.fillText(t,W/2,this.cy);}
    c.restore();arcHUD(c,this,'エアホッケー','#4ab0ff');},
  down(x,y){this.tg={x,y};},move(x,y){this.tg={x,y};},up(){},
  hint(){if(this.ph!=='play'||this.pk.y<this.cy)return null;return{x:this.pk.x,y:this.pk.y+60,x2:this.pk.x,y2:this.pk.y-40};},
  hintText(){return 'ゆびで マレットを うごかして パックを うとう！';}};
// ---------- ブロックくずし ----------
const BRK_LAY=[['XXXXXXX','XXXXXXX','XXXXXXX','XXXXXXX','XXXXXXX'],['.XX.XX.','XXXXXXX','XXXXXXX','.XXXXX.','..XXX..','...X...'],['...X...','..XXX..','.XXXXX.','XXXXXXX','X.X.X.X','XXXXXXX'],['X.X.X.X','.X.X.X.','X.X.X.X','.X.X.X.','XXXXXXX','XXXXXXX'],['XXXXXXX','X.....X','X.XXX.X','X.XXX.X','X.....X','XXXXXXX']];
SCN.breakout={bg:'#1a1040',song:'arcade',
  enter(){arcInit(this,'breakout',{time:120,th:[500,1100,1700],intro:'ブロックくずし！ ゆびを よこに うごかして ボールを はねかえそう。 タッチで ボール はっしゃ！ ブロックを ぜんぶ こわしてね'});
    this.stg=0;this.lays=[BRK_LAY[0],...shuffle(BRK_LAY.slice(1)).slice(0,2)];this.px=W/2;this.pw=150;this.wide=0;this.items=[];this.parts=[];this.setStage();},
  setStage(){const L=this.lays[this.stg],cols=7,bw=(W-60)/cols,bh=34;this.bricks=[];const pal=['#ff6f91','#ffb03a','#ffe24a','#6cd08a','#4ab0ff','#b48cff'];
    L.forEach((row,r)=>[...row].forEach((ch,k)=>{if(ch==='X'){const hard=this.stg>0&&r===0;this.bricks.push({x:30+k*bw,y:250+r*(bh+6),w:bw-6,h:bh,col:hard?'#c0c0d8':pal[(r+this.stg)%6],hp:hard?2:1,it:Math.random()<.14?pick(['wide','multi','star']):null});}}));
    this.balls=[{x:this.px,y:this.PY()-18,vx:0,vy:0,stuck:true}];this.clearT=0;},
  PY(){return H-130;},
  update(dt){const on=arcTick(this,dt);for(const p of this.parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=900*dt;p.t+=dt;}this.parts=this.parts.filter(p=>p.t<.8);if(!on)return;
    if(this.wide>0){this.wide-=dt;}const pw=this.wide>0?230:150;this.pw+=(pw-this.pw)*Math.min(1,dt*8);const PY=this.PY();
    if(this.clearT>0){this.clearT-=dt;if(this.clearT<=0){this.stg++;if(this.stg>=this.lays.length){this.score+=Math.round(this.time)*5;arcEnd(this,'ぜんぶ クリア！');}else{this.setStage();say('ステージ '+(this.stg+1)+'！');}}return;}
    const spd=440+this.stg*50;
    for(const b of this.balls){if(b.stuck){b.x=this.px;b.y=PY-18;continue;}const n=Math.ceil(Math.hypot(b.vx,b.vy)*dt/8);for(let k=0;k<n;k++){const h=dt/n;b.x+=b.vx*h;b.y+=b.vy*h;
        if(b.x<30+12){b.x=42;b.vx=Math.abs(b.vx);}if(b.x>W-42){b.x=W-42;b.vx=-Math.abs(b.vx);}if(b.y<238+12){b.y=250;b.vy=Math.abs(b.vy);}
        if(b.vy>0&&b.y>PY-14&&b.y<PY+10&&Math.abs(b.x-this.px)<this.pw/2+12){const f=(b.x-this.px)/(this.pw/2);const a=clamp(f,-1,1)*1.05;b.vx=Math.sin(a)*spd;b.vy=-Math.cos(a)*spd;b.y=PY-14;tone(600,.05,'square',.1);}
        for(const br of this.bricks){if(br.dead)continue;if(b.x>br.x-12&&b.x<br.x+br.w+12&&b.y>br.y-12&&b.y<br.y+br.h+12){const ox=Math.min(b.x-(br.x-12),br.x+br.w+12-b.x),oy=Math.min(b.y-(br.y-12),br.y+br.h+12-b.y);if(ox<oy)b.vx=-b.vx;else b.vy=-b.vy;
            br.hp--;if(br.hp<=0){br.dead=1;arcAdd(this,10,br.x+br.w/2,br.y,'#fff');tone(900+Math.random()*400,.06,'square',.08);for(let q=0;q<6;q++)this.parts.push({x:br.x+br.w/2,y:br.y+br.h/2,vx:rand(-200,200),vy:rand(-300,0),t:0,col:br.col});if(br.it)this.items.push({k:br.it,x:br.x+br.w/2,y:br.y+br.h/2});}else{tone(400,.05,'square',.08);br.col='#8a8aa8';}break;}}}}
    for(const b of this.balls)if(b.y>H+20)b.dead=1;this.balls=this.balls.filter(b=>!b.dead);
    if(!this.balls.length){arcMiss(this);sfx('no');this.shake=.3;this.balls=[{x:this.px,y:PY-18,vx:0,vy:0,stuck:true}];hush();speak('おっと！ もういちど タッチで はっしゃ');}
    for(const it of this.items){it.y+=200*dt;if(it.y>PY-20&&it.y<PY+20&&Math.abs(it.x-this.px)<this.pw/2+20){it.got=1;sfx('spark');if(it.k==='wide'){this.wide=10;speak('ながーい！');}else if(it.k==='multi'){const b0=this.balls[0];for(const a of[-.5,.5])this.balls.push({x:b0.x,y:b0.y,vx:Math.sin(a)*spd,vy:-Math.cos(a)*spd});speak('ボールが ふえた！');}else{arcAdd(this,50,it.x,it.y,'#ffe24a');}}}
    this.items=this.items.filter(it=>!it.got&&it.y<H+30);
    if(this.bricks.every(b=>b.dead)){this.clearT=2;this.score+=200;this.pops.push({x:W/2,y:H*.45,txt:'ステージ クリア！ +200',t:0,col:'#6cf0a0',big:1});sfx('fanfare');confetti(40);this.items=[];}},
  draw(c){arcBg(c,'#1a1040','#3a1a5a');const sh=this.shake>0?Math.sin(T*80)*6:0;c.save();c.translate(sh,0);c.strokeStyle='#4ad0ff';c.lineWidth=6;c.save();c.shadowColor='#4ad0ff';c.shadowBlur=14;c.beginPath();c.moveTo(30,H);c.lineTo(30,238);c.lineTo(W-30,238);c.lineTo(W-30,H);c.stroke();c.restore();
    for(const br of this.bricks){if(br.dead)continue;c.fillStyle=br.col;rr(c,br.x,br.y,br.w,br.h,8);c.fill();c.fillStyle='rgba(255,255,255,.35)';rr(c,br.x+4,br.y+4,br.w-8,8,4);c.fill();if(br.it){c.fillStyle='#fff';star(c,br.x+br.w/2,br.y+br.h/2+3,7,3);c.fill();}}
    for(const p of this.parts){c.globalAlpha=1-p.t/.8;c.fillStyle=p.col;rr(c,p.x-5,p.y-5,10,10,2);c.fill();}c.globalAlpha=1;
    for(const it of this.items){c.fillStyle={wide:'#4ab0ff',multi:'#ff6fd0',star:'#ffe24a'}[it.k];rr(c,it.x-26,it.y-14,52,28,14);c.fill();c.fillStyle='#fff';c.font=`800 14px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText({wide:'ながい',multi:'ふえる',star:'★'}[it.k],it.x,it.y+1);}
    const PY=this.PY();c.save();c.shadowColor='#ff6fd0';c.shadowBlur=16;c.fillStyle='#ff6fd0';rr(c,this.px-this.pw/2,PY,this.pw,22,11);c.fill();c.restore();c.fillStyle='#fff';rr(c,this.px-this.pw/2+10,PY+4,this.pw-20,6,3);c.fill();
    for(const b of this.balls){c.fillStyle='#fff';c.save();c.shadowColor='#fff';c.shadowBlur=12;circ(c,b.x,b.y,12);c.restore();}
    if(this.balls.some(b=>b.stuck)&&this.ph==='play'){c.fillStyle='#fff';c.font=`800 24px ${FONT}`;c.textAlign='center';c.fillText('タッチで はっしゃ！',W/2,PY-60);}
    stepDots(c,this.lays.length,this.stg,H-40);c.restore();arcHUD(c,this,'ブロックくずし','#ffb03a');},
  down(x,y){if(this.ph!=='play')return;this.px=clamp(x,30+this.pw/2,W-30-this.pw/2);for(const b of this.balls)if(b.stuck){b.stuck=false;const sp=440+this.stg*50;b.vx=rand(-.4,.4)*sp;b.vy=-sp;sfx('launch');}},
  move(x,y){this.px=clamp(x,30+this.pw/2,W-30-this.pw/2);},up(){},
  hint(){if(this.ph!=='play')return null;const b=this.balls[0];if(b&&b.stuck)return{x:W/2,y:this.PY()};return b?{x:this.px,y:this.PY()+10,x2:b.x,y2:this.PY()+10}:null;},
  hintText(){return 'ゆびを よこに うごかして ボールを うけとめよう';}};
// ---------- パクパクめいろ ----------
const PAKU_MAP=['###########','#o...#...o#','#.##.#.##.#','#.........#','#.##.#.##.#','#....#....#','##.#...#.##','#..#.#.#..#','#.........#','#.##.#.##.#','#o.#...#.o#','#.........#','###########'];
SCN.paku={bg:'#0a0a2a',song:'arcade',
  enter(){arcInit(this,'paku',{time:0,th:[700,1400,2200],intro:'パクパクめいろ！ ゆびで すすむ ほうこうを スワイプ。 てんてんを ぜんぶ たべよう！ ひかる たまを たべると おばけを たべられるよ'});this.round=0;this.lives=3;this.newRound();},
  newRound(){this.g=PAKU_MAP.map(r=>[...r]);this.left=0;for(const r of this.g)for(const ch of r)if(ch==='.'||ch==='o')this.left++;this.g[11][5]=' ';this.left--;this.resetPos();this.power=0;},
  resetPos(){this.pl={c:5,r:11,x:5,y:11,d:[0,0],want:[0,0],mouth:0};const cols=['#ff6f91','#4ab0ff','#b48cff'];this.gh=[0,1,2].slice(0,2+this.round).map(i=>({c:4+i,r:6,x:4+i,y:6,d:[0,-1],col:cols[i],home:[4+i,6],sp:2.4+this.round*.5+i*.15,dead:0}));this.inv=1.5;},
  lay(){const cs=Math.min(540/11,(H-470)/13);return{cs,x0:W/2-cs*5.5,y0:250};},
  open(c,r){return this.g[r]&&this.g[r][c]&&this.g[r][c]!=='#';},
  step(e,sp,dt,chooser){let rem=sp*dt;while(rem>0){const tx=e.c+e.d[0],ty=e.r+e.d[1];if(e.d[0]===0&&e.d[1]===0){chooser(e);if(e.d[0]===0&&e.d[1]===0)return;continue;}
      const dist=Math.abs(tx-e.x)+Math.abs(ty-e.y);if(rem<dist){e.x+=e.d[0]*rem;e.y+=e.d[1]*rem;return;}rem-=dist;e.x=tx;e.y=ty;e.c=tx;e.r=ty;chooser(e);if(!this.open(e.c+e.d[0],e.r+e.d[1])){e.d=[0,0];}}},
  update(dt){const on=arcTick(this,dt);if(!on)return;const P=this.pl;if(this.inv>0)this.inv-=dt;if(this.power>0)this.power-=dt;if(this.clearT>0){this.clearT-=dt;if(this.clearT<=0){this.round++;if(this.round>=2){this.score+=this.lives*300;arcEnd(this,'ぜんぶ たべた！');}else{this.newRound();say('つぎの めいろ！ おばけが ふえたよ');}}return;}
    P.mouth+=dt*10;
    this.step(P,5.2,dt,e=>{if((e.want[0]||e.want[1])&&this.open(e.c+e.want[0],e.r+e.want[1]))e.d=e.want.slice();const ch=this.g[e.r][e.c];if(ch==='.'||ch==='o'){this.g[e.r][e.c]=' ';this.left--;if(ch==='o'){this.power=7;arcAdd(this,50,W/2,this.lay().y0-20,'#ffe24a');sfx('spark');hush();speak('パワーアップ！ おばけを たべちゃえ！');}else{this.score+=10;tone(this.left%2?600:800,.04,'square',.06);}if(this.left<=0){this.clearT=2.4;this.score+=500;this.pops.push({x:W/2,y:H*.45,txt:'クリア！ +500',t:0,col:'#6cf0a0',big:1});sfx('fanfare');confetti(50);}}});
    for(const g of this.gh){if(g.dead>0){g.dead-=dt;if(g.dead<=0){g.c=g.home[0];g.r=g.home[1];g.x=g.c;g.y=g.r;g.d=[0,-1];}continue;}
      const sp=this.power>0?g.sp*.55:g.sp;this.step(g,sp,dt,e=>{const opts=[[1,0],[-1,0],[0,1],[0,-1]].filter(d=>this.open(e.c+d[0],e.r+d[1])&&!(d[0]===-e.d[0]&&d[1]===-e.d[1]));const L=opts.length?opts:[[-e.d[0],-e.d[1]]];
        const toward=L.slice().sort((a,b)=>Math.hypot(e.c+a[0]-P.c,e.r+a[1]-P.r)-Math.hypot(e.c+b[0]-P.c,e.r+b[1]-P.r));e.d=(this.power>0?toward[toward.length-1]:Math.random()<.55?toward[0]:pick(L)).slice();});
      if(Math.abs(g.x-P.x)+Math.abs(g.y-P.y)<.7){if(this.power>0){g.dead=3;g.x=-9;const Ly=this.lay();arcAdd(this,200,Ly.x0+P.x*Ly.cs,Ly.y0+P.y*Ly.cs-30,'#6cf0a0');sfx('munch');}else if(this.inv<=0){this.lives--;arcMiss(this);sfx('no');this.shake=.4;if(this.lives<=0){arcEnd(this,'ゲームオーバー');return;}hush();speak('つかまっちゃった！ あと '+this.lives+'かい');this.resetPos();return;}}}},
  draw(c){arcBg(c,'#0a0a2a','#1a0a3a',false);const Ly=this.lay(),cs=Ly.cs,x0=Ly.x0,y0=Ly.y0;const sh=this.shake>0?Math.sin(T*80)*6:0;c.save();c.translate(sh,0);
    for(let r=0;r<13;r++)for(let k=0;k<11;k++){const ch=this.g[r][k],x=x0+k*cs,y=y0+r*cs;if(ch==='#'){c.fillStyle='#2a3aa8';rr(c,x+2,y+2,cs-4,cs-4,cs*.25);c.fill();c.strokeStyle='#6a8aff';c.lineWidth=2;c.stroke();}
      else if(ch==='.'){c.fillStyle='#ffe0b0';circ(c,x+cs/2,y+cs/2,cs*.1);}else if(ch==='o'){c.fillStyle='#ffe24a';circ(c,x+cs/2,y+cs/2,cs*.24+Math.sin(T*8)*2);}}
    for(const g of this.gh){if(g.dead>0)continue;const x=x0+(g.x+.5)*cs,y=y0+(g.y+.5)*cs,sc=this.power>0;const blink=sc&&this.power<2&&Math.floor(T*8)%2;c.save();c.translate(x,y);c.scale(cs/60,cs/60);c.fillStyle=sc?(blink?'#fff':'#3a50e0'):g.col;c.beginPath();c.arc(0,-4,24,Math.PI,0);c.lineTo(24,22);for(let i=0;i<4;i++){c.lineTo(24-i*12-6,16+Math.sin(T*10+i)*3);c.lineTo(24-(i+1)*12,22);}c.closePath();c.fill();
      if(sc){c.fillStyle='#fff';circ(c,-8,-6,3.5);circ(c,8,-6,3.5);c.strokeStyle='#fff';c.lineWidth=2;c.beginPath();for(let i=0;i<5;i++)c.lineTo(-12+i*6,8+(i%2?-3:0));c.stroke();}else{c.fillStyle='#fff';ell(c,-8,-6,6,8);ell(c,8,-6,6,8);c.fillStyle='#2a2a6a';circ(c,-8+g.d[0]*3,-5+g.d[1]*3,3.5);circ(c,8+g.d[0]*3,-5+g.d[1]*3,3.5);}c.restore();}
    const P=this.pl,px=x0+(P.x+.5)*cs,py=y0+(P.y+.5)*cs;if(!(this.inv>0&&Math.floor(T*10)%2)){const ang=Math.atan2(P.d[1],P.d[0]||(P.d[1]?0:1)),m=.1+Math.abs(Math.sin(P.mouth))*.5;c.save();c.translate(px,py);c.rotate(ang);c.fillStyle='#ffd23a';c.beginPath();c.moveTo(0,0);c.arc(0,0,cs*.42,m,TAU-m);c.closePath();c.fill();c.restore();c.fillStyle='#2a1a1a';circ(c,px+(P.d[1]?cs*.14:0),py-cs*.18,cs*.06);c.fillStyle='#ff5f9a';bow(c,px-cs*.2,py-cs*.36,cs/40,'#ff5f9a');}
    for(let i=0;i<this.lives;i++){c.fillStyle='#ff5f9a';heartP(c,40+i*40,H-50,14);c.fill();}
    if(this.power>0){c.fillStyle='#ffe24a';c.font=`800 22px ${FONT}`;c.textAlign='center';c.fillText('パワー '+Math.ceil(this.power),W/2,H-50);}
    const bx=W-110,by=H-110;c.globalAlpha=.55;for(const [dx,dy,a] of [[0,-1,0],[1,0,1],[0,1,2],[-1,0,3]]){c.fillStyle='#ffffff';c.save();c.translate(bx+dx*52,by+dy*52);c.rotate(a*Math.PI/2);c.beginPath();c.moveTo(0,-22);c.lineTo(20,10);c.lineTo(-20,10);c.closePath();c.fill();c.restore();}c.globalAlpha=1;
    c.restore();arcHUD(c,this,'パクパクめいろ','#ffc21a');},
  setDir(dx,dy){const d=Math.abs(dx)>Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)];if(!d[0]&&!d[1])return;const P=this.pl;P.want=d;
    if(P.d[0]===0&&P.d[1]===0){if(this.open(P.c+d[0],P.r+d[1]))P.d=d.slice();}else if(d[0]===-P.d[0]&&d[1]===-P.d[1]){if(P.x!==P.c||P.y!==P.r){P.c+=P.d[0];P.r+=P.d[1];}P.d=d.slice();}},
  down(x,y){this.sw={x,y,done:false};const bx=W-110,by=H-110;if(Math.hypot(x-bx,y-by)<90&&Math.hypot(x-bx,y-by)>18){this.setDir(x-bx,y-by);this.sw.done=true;return;}},
  move(x,y){const s=this.sw;if(!s||s.done)return;if(Math.hypot(x-s.x,y-s.y)>30){this.setDir(x-s.x,y-s.y);s.done=true;}},
  up(x,y){const s=this.sw;this.sw=null;if(!s||s.done||this.ph!=='play')return;const Ly=this.lay(),P=this.pl;this.setDir(x-(Ly.x0+(P.x+.5)*Ly.cs),y-(Ly.y0+(P.y+.5)*Ly.cs));},
  hint(){return null;},hintText(){return 'すすみたい ほうこうへ ゆびで スワイプ！';}};
// ---------- スターシューター ----------
SCN.shooter={bg:'#050520',song:'arcade',
  enter(){arcInit(this,'shooter',{time:0,th:[1500,3000,4500],intro:'スターシューター！ ゆびで うちゅうせんを うごかそう。 たまは じどうで でるよ。 ユーフォーを やっつけよう！'});this.sx=W/2;this.shots=[];this.bombs=[];this.caps=[];this.parts=[];this.wave=0;this.pow=0;this.fire=0;this.hurt=0;this.hits=0;this.newWave();},
  SY(){return H-170;},
  newWave(){this.en=[];this.boss=null;this.ox=0;this.odir=1;if(this.wave<3){const rows=2+this.wave,cols=6;for(let r=0;r<rows;r++)for(let k=0;k<cols;k++)this.en.push({bx:k*80-200,by:300+r*72,x:0,y:0,col:['#6cd08a','#ff6fd0','#4ad0ff','#ffe24a'][r%4],hp:1,dive:0,t:rand(0,6)});say(this.wave?'つぎの ウェーブ！':'いくよ！');}
    else{this.boss={x:W/2,y:330,hp:40,max:40,t:0,hit:0};say('ボスが きた！ がんばれ！');}},
  update(dt){const on=arcTick(this,dt);for(const p of this.parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.t+=dt;}this.parts=this.parts.filter(p=>p.t<.7);if(!on)return;const SY=this.SY();if(this.hurt>0)this.hurt-=dt;if(this.pow>0)this.pow-=dt;
    this.fire-=dt;if(this.fire<=0){this.fire=.2;const xs=this.pow>0?[-22,0,22]:[0];for(const dx of xs)this.shots.push({x:this.sx+dx,y:SY-40,vx:dx*6});tone(1500,.03,'square',.03);}
    for(const s of this.shots){s.y-=900*dt;s.x+=s.vx*dt;}this.shots=this.shots.filter(s=>s.y>200&&!s.dead);
    this.ox+=this.odir*(60+this.wave*20)*dt;if(Math.abs(this.ox)>70)this.odir*=-1;
    for(const e of this.en){e.t+=dt;if(e.dive){e.dive+=dt;e.x+=Math.sin(e.dive*3)*160*dt;e.y+=180*dt;if(e.y>H+40){e.dive=0;e.y=180;}}else{e.x=W/2+e.bx+this.ox;e.y=e.by+Math.sin(e.t*2)*6;if(Math.random()<dt*.06*(1+this.wave))e.dive=.01;}
      if(Math.random()<dt*(.12+this.wave*.05))this.bombs.push({x:e.x,y:e.y+20});}
    const B=this.boss;if(B){B.t+=dt;B.x=W/2+Math.sin(B.t*.8)*180;if(B.hit>0)B.hit-=dt;if(Math.random()<dt*1.4)this.bombs.push({x:B.x+rand(-60,60),y:B.y+40});}
    for(const s of this.shots){for(const e of this.en){if(!e.dead&&Math.abs(s.x-e.x)<34&&Math.abs(s.y-e.y)<30){e.dead=1;s.dead=1;arcAdd(this,20,e.x,e.y-20,'#fff');tone(300,.12,'square',.1,0,-200);noise(.12,.2,1500);for(let q=0;q<10;q++){const a=q/10*TAU;this.parts.push({x:e.x,y:e.y,vx:Math.cos(a)*220,vy:Math.sin(a)*220,t:0,col:e.col});}if(Math.random()<.12)this.caps.push({x:e.x,y:e.y});break;}}
      if(B&&!s.dead&&Math.abs(s.x-B.x)<90&&Math.abs(s.y-B.y)<50){s.dead=1;B.hp--;B.hit=.1;arcAdd(this,5,B.x+rand(-40,40),B.y-50,'#ffe24a');tone(200,.05,'square',.06);if(B.hp<=0){this.boss=null;arcAdd(this,500,B.x,B.y,'#6cf0a0');sfx('boom');confetti(80);for(let q=0;q<30;q++){const a=q/30*TAU;this.parts.push({x:B.x,y:B.y,vx:Math.cos(a)*rand(100,400),vy:Math.sin(a)*rand(100,400),t:0,col:pick(['#ff6fd0','#ffe24a','#4ad0ff'])});}this.score+=Math.max(0,3-this.hits)*300;arcEnd(this,'ボス げきは！');return;}}}
    this.en=this.en.filter(e=>!e.dead);
    for(const b of this.bombs){b.y+=(260+this.wave*30)*dt;if(this.hurt<=0&&Math.abs(b.x-this.sx)<30&&Math.abs(b.y-SY)<30){b.dead=1;this.hurt=1.5;this.hits++;arcMiss(this);sfx('no');this.shake=.4;hush();speak('あいたっ！');}}this.bombs=this.bombs.filter(b=>!b.dead&&b.y<H);
    for(const e of this.en){if(e.dive&&this.hurt<=0&&Math.abs(e.x-this.sx)<40&&Math.abs(e.y-SY)<40){e.dead=1;this.hurt=1.5;this.hits++;arcMiss(this);sfx('no');this.shake=.4;}}
    for(const cp of this.caps){cp.y+=180*dt;if(Math.abs(cp.x-this.sx)<44&&Math.abs(cp.y-SY)<40){cp.got=1;this.pow=8;sfx('spark');hush();speak('トリプル ショット！');}}this.caps=this.caps.filter(c=>!c.got&&c.y<H);
    if(!this.en.length&&!this.boss&&this.ph==='play'){this.wave++;this.bombs=[];this.newWave();}},
  draw(c){const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#050520');g.addColorStop(1,'#2a1050');c.fillStyle=g;c.fillRect(-OX/SC,-OY/SC,W+2*OX/SC,H+2*OY/SC);for(let i=0;i<60;i++){const y=(i*97+T*(40+(i%3)*40))%H;c.fillStyle=i%5?'rgba(255,255,255,.6)':'#ffe24a';circ(c,(i*131)%W,y,i%4?1.2:2.4);}
    const sh=this.shake>0?Math.sin(T*80)*6:0;c.save();c.translate(sh,0);
    for(const e of this.en){c.save();c.translate(e.x,e.y);const w=Math.sin(e.t*6)*.1;c.rotate(w);c.fillStyle=e.col;c.beginPath();c.arc(0,0,26,Math.PI,0);c.lineTo(26,14);for(let i=0;i<4;i++)c.lineTo(20-i*13,6+(i%2?8:0));c.lineTo(-26,14);c.closePath();c.fill();c.fillStyle='#fff';circ(c,-9,-6,7);circ(c,9,-6,7);c.fillStyle='#1a1040';circ(c,-8,-5,3.5);circ(c,10,-5,3.5);c.strokeStyle=e.col;c.lineWidth=3;c.beginPath();c.moveTo(-10,-24);c.lineTo(-16,-36);c.moveTo(10,-24);c.lineTo(16,-36);c.stroke();c.fillStyle='#ffe24a';circ(c,-16,-36,4);circ(c,16,-36,4);c.restore();}
    const B=this.boss;if(B){c.save();c.translate(B.x,B.y);if(B.hit>0)c.globalAlpha=.6;drawThing(c,'ufo',0,0,3.2);c.restore();c.fillStyle='rgba(255,255,255,.3)';rr(c,W/2-150,250,300,16,8);c.fill();c.fillStyle='#ff4d6d';rr(c,W/2-150,250,300*B.hp/B.max,16,8);c.fill();}
    for(const s of this.shots){c.fillStyle='#6cf0ff';rr(c,s.x-4,s.y-14,8,24,4);c.fill();}
    for(const b of this.bombs){c.fillStyle='#ff6f6f';circ(c,b.x,b.y,9);c.fillStyle='#ffd0d0';circ(c,b.x-2,b.y-3,3);}
    for(const cp of this.caps){c.fillStyle='#ffe24a';circ(c,cp.x,cp.y,20);c.fillStyle='#ff6fd0';star(c,cp.x,cp.y,12,5);c.fill();}
    for(const p of this.parts){c.globalAlpha=1-p.t/.7;c.fillStyle=p.col;circ(c,p.x,p.y,5);}c.globalAlpha=1;
    const SY=this.SY();if(!(this.hurt>0&&Math.floor(T*12)%2)){c.fillStyle='rgba(255,180,40,.8)';ell(c,this.sx,SY+42+Math.sin(T*30)*4,10,18);drawThing(c,'starship',this.sx,SY,1.5);}if(this.pow>0){c.strokeStyle='rgba(255,230,80,.6)';c.lineWidth=4;c.beginPath();c.arc(this.sx,SY,56,0,TAU);c.stroke();}
    if(!this.boss&&this.wave<3){c.fillStyle='rgba(255,255,255,.7)';c.font=`800 18px ${FONT}`;c.textAlign='center';c.fillText('ウェーブ '+(this.wave+1)+' / 3',W/2,H-40);}
    c.restore();arcHUD(c,this,'スターシューター','#7a5ad8');},
  down(x,y){this.tx=x;this.sx=clamp(x,40,W-40);},move(x,y){this.sx=clamp(x,40,W-40);},up(){},
  hint(){if(this.ph!=='play')return null;const e=this.en[0]||this.boss;return e?{x:this.sx,y:this.SY(),x2:e.x,y2:this.SY()}:null;},
  hintText(){return 'ゆびで うちゅうせんを よこに うごかそう';}};

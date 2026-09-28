// ================= はいしゃさん =================
SCN.dentist={bg:'#e8fff4',song:'play',
  enter(){this.done=0;this.count=0;this.bossDone=0;this.bossEnd=0;this.mdone=0;this.ddone=0;this.flyT=null;this.shine=0;const lv=lvOf('dentist');this.nt=lv<1?4:lv<3?5:6;this.teeth=[];for(const top of[true,false])for(let i=0;i<this.nt;i++)this.teeth.push({i,top,n:0,cav:0,rev:0,hole:0,fill:0,dp:0,loose:0,out:0});
    const sh=shuffle(this.teeth);sh.slice(0,(lv<1?2:3)+(Math.random()<.4?1:0)).forEach(t=>t.cav=1);const hasLoose=Math.random()<.55;if(hasLoose){const lt=sh.find(t=>!t.cav);lt.loose=1;}
    this.countRow=pick(['all','all','top','bottom']);
    this.steps=[].concat(Math.random()<.75?['count']:[],['mirror','drill','fill'],hasLoose?['loose']:[],['brush','rinse']);this.si=-1;this.miss=0;this.fin=0;this.foam=[];this.rinse=0;this.boss=null;this.minis=[];this.dirt=[];this.shine=0;
    this.bossType=pick(['king','twins','speedy']);
    this.pt=pick([['#b8a8dc','かばさん'],['#ffb3c8','ピンクの かばちゃん'],['#9ad0ff','みずいろの かばくん'],['#a8e0b0','みどりの かばさん'],['#ffd08a','オレンジの かばくん']]);this.acc=pick(['none','ribbon','cap','glasses','flower']);this.accC=pick(['#ff5fa2','#5aa8ff','#ffb03a']);
    this.tools=[];this.lay();say(`${this.pt[1]}の はいしゃさん！ おくちを あーん`);setTimeout(()=>{if(scene===this)this.startStep();},2200);},
  lay(){this.mx=300;this.my=H*.44;this.tw=Math.min(66,380/this.nt);},
  tooth(t){const x=this.mx-(this.nt-1)/2*this.tw+t.i*this.tw,y=t.top?this.my-92:this.my+92;return{x,y};},
  countSet(){return this.teeth.filter(t=>!t.out&&(this.countRow==='all'||(this.countRow==='top')===t.top));},
  startStep(){this.si++;const k=this.steps[this.si];this.key=k;this.prog=0;
    const tr={mirror:'mirror',drill:'drill',fill:'filling',brush:'toothbrush',rinse:'cup',loose:'tweezers'}[k];this.tools=tr?mkTray(trayChoices(tr,['mirror','drill','filling','toothbrush','cup','tweezers'],3),H-80,54):[];this.want=tr;
    if(k==='brush')this.dirt=shuffle(this.teeth.filter(t=>!t.out)).slice(0,4+Math.floor(Math.random()*4)).map((t,i)=>({t,kind:i%2?'germ':'food',hp:1,ph:rand(0,6)}));
    const rowTxt={all:'ぜんぶで',top:'うえの はは',bottom:'したの はは'}[this.countRow];
    const msg={count:`${rowTxt==='ぜんぶで'?'はは ぜんぶで':rowTxt} なんぼん あるかな？ 1ぽんずつ タッチして かぞえよう`,mirror:'デンタルミラーで むしばを さがそう。 ミラーは どれ？',drill:'むしばを ドリルで けずろう。 ドリルは どれ？',fill:'あなに キラキラの つめものを しよう',loose:'ぐらぐらの はが あるよ！ ピンセットで そっと ぬいてあげよう',brush:'はぶらしで ごしごし みがこう！',rinse:'さいごに コップの おみずで ぶくぶく うがい'}[k];
    say(msg);},
  next(d=1.4){const k=this.key;this.tools.forEach(t=>t.hidden=true);setTimeout(()=>{if(scene!==this||this.key!==k)return;this.tools=[];if(this.si+1>=this.steps.length){this.fin=.01;}else{stepClear();this.startStep();}},d*1000);},
  hitBoss(b,n){if(!b||b.hp<=0||b.flee>0)return;b.hp-=n;b.hitT=.25;if(Math.random()<.4)sfx('pop');
    if(b.hp<=0){b.flee=.01;sfx('boom');SHAKE=.3;good(b.x,b.y,2,'やっつけた！');if(b.type==='king'){for(let i=0;i<3;i++)this.minis.push({x:b.x,y:b.y,vx:rand(-160,160),vy:rand(-160,-40),hp:1,t:0});say('ぶんれつした！ ちびばいきんも タッチで やっつけよう！');}}
    else if(Math.random()<.25)say(pick(['いたたた！','やめてくれ〜！','はみがき きらい〜！']));},
  bossesDone(){return this.boss&&this.boss.every(b=>b.hp<=0)&&this.minis.every(m=>m.hp<=0);},
  update(dt){for(const t of this.tools)t.upd(dt);for(const f of this.foam)f.t+=dt;const d=this.tools.find(t=>t.held);if(this.shine>0)this.shine+=dt;
    if(this.boss){for(const B of this.boss){B.t+=dt;if(B.hitT>0)B.hitT-=dt;if(B.flee>0)B.flee+=dt;else{const sp=B.type==='speedy'?2.2:1;B.x=this.mx+Math.sin(B.t*1.3*sp+B.ph)*140;B.y=this.my+Math.sin(B.t*2.1*sp+B.ph)*44;}}
      for(const m of this.minis){if(m.hp<=0)continue;m.t+=dt;m.x+=m.vx*dt;m.y+=m.vy*dt;m.vx*=.98;m.vy*=.98;m.x=clamp(m.x,this.mx-190,this.mx+190);m.y=clamp(m.y,this.my-110,this.my+110);if(m.t>.6){m.vx+=rand(-200,200)*dt;m.vy+=rand(-200,200)*dt;}}
      if(this.bossesDone()&&!this.bossEnd){this.bossEnd=1;confetti(40);say('ばいきん ぜんめつ！ つよい！');setTimeout(()=>{if(scene===this){this.boss=null;this.next(.2);}},1400);}}
    if(d&&this.key==='mirror'){for(const t of this.teeth){const p=this.tooth(t);if(t.cav&&!t.rev&&Math.hypot(d.x+14-p.x,d.y+26-p.y)<60){t.rev=1;good(p.x,p.y,1,'むしば はっけん！');}}if(this.teeth.every(t=>!t.cav||t.rev)&&!this.mdone){this.mdone=1;d.held=false;say(`むしばが ${this.teeth.filter(t=>t.cav).length}ほん あったよ`);this.next(1.8);}}
    if(d&&this.key==='drill'){for(const t of this.teeth){if(!t.cav||t.hole)continue;const p=this.tooth(t);if(Math.hypot(d.x+14-p.x,d.y+30-p.y)<50){t.dp+=dt;if(Math.random()<dt*14)sfx('drill');if(Math.random()<dt*20)parts.push({x:p.x,y:p.y,vx:rand(-80,80),vy:rand(-120,-40),life:.4,t:0,kind:'dot',col:'#8a7a6a',r:5});if(t.dp>1){t.hole=1;good(p.x,p.y,1,'けずれた！');}}}
      if(this.teeth.every(t=>!t.cav||t.hole)&&!this.ddone){this.ddone=1;d.held=false;say('ぜんぶ けずれたよ。 いたくないよ、 がんばったね');this.next(1.8);}}
    if(d&&this.key==='loose'){const t=this.teeth.find(q=>q.loose&&!q.out);if(t){const p=this.tooth(t);if(Math.hypot(d.x-p.x,d.y-p.y)<60){this.prog+=dt;if(Math.random()<dt*6)sfx('squeak');if(this.prog>1.4){t.out=1;d.held=false;this.flyT={x:p.x,y:p.y,t:0};good(p.x,p.y,3,'ぬけた！');SHAKE=.25;say('ぬけた！ ここから おとなの はが はえてくるよ');this.next(2.4);}}else this.prog=Math.max(0,this.prog-dt);}}
    if(this.key==='rinse'&&this.rinse>0){this.rinse+=dt;if(Math.random()<dt*20)drops(this.mx+rand(-150,150),this.my,2,'#9fd8ff');if(this.rinse>1.6){this.rinse=-1;this.foam=[];this.shine=.01;sfx('spark');banner('ピカピカ！','#2ec0a0',`${this.pt[1]} にっこり！`);burst(this.mx,this.my,30,'star');this.next(2.6);}}
    if(this.flyT)this.flyT.t+=dt;
    if(this.fin>0){this.fin+=dt;if(this.fin>.8&&this.fin<9){this.fin=9;celebrate('dentist',starsFor(this.miss));}}},
  drawBoss(c,b){const k=b.flee>0?Math.max(0,1-b.flee):1;const x=b.x+(b.flee>0?b.flee*400:0),y=b.y-(b.flee>0?b.flee*300:0);const sz=b.type==='king'?2.4:b.type==='twins'?1.7:1.5;c.save();c.translate(x,y);c.scale(k*(b.hitT>0?1.15:1),k*(b.hitT>0?.85:1));c.rotate(Math.sin(b.t*3)*.1);MED.germ(c,0,0,sz);
    if(b.type==='king'){c.fillStyle='#ffd23a';c.strokeStyle='#c89000';c.lineWidth=3;c.beginPath();c.moveTo(-30,-44);c.lineTo(-30,-74);c.lineTo(-15,-58);c.lineTo(0,-80);c.lineTo(15,-58);c.lineTo(30,-74);c.lineTo(30,-44);c.closePath();c.fill();c.stroke();}
    else if(b.type==='speedy'){c.strokeStyle='rgba(120,220,120,.6)';c.lineWidth=4;for(let i=0;i<3;i++){c.beginPath();c.moveTo(-40-i*10,-10+i*10);c.lineTo(-60-i*14,-10+i*10);c.stroke();}}
    else{c.fillStyle='#b48cff';bow(c,20,-30,8,'#b48cff');}c.restore();
    if(b.flee<=0){c.fillStyle='rgba(0,0,0,.3)';rr(c,b.x-50,b.y-86,100,12,6);c.fill();c.fillStyle='#ff5f6f';rr(c,b.x-50,b.y-86,100*b.hp/b.max,12,6);c.fill();}},
  draw(c){const mx=this.mx,my=this.my,col=this.pt[0],happy=this.rinse<0||this.fin>0;c.fillStyle=vfill(c,0,H,'#e8fff4',.2,-.05);c.fillRect(-OX/SC-2,-OY/SC-2,W+2*OX/SC+4,H+2*OY/SC+4);
    c.fillStyle='rgba(255,255,255,.7)';for(let i=0;i<7;i++){const x=(i*113+T*10)%(W+100)-50,y=(i*97)%(H*.25)+170;drawItem(c,'tooth',x,y,.45);}drawDeco(c,['lamp',mx,140,1.2]);
    const blink=((T*1.1)%4)>3.85;
    c.fillStyle=gfill(c,mx-60,my-220,280,col);c.beginPath();c.ellipse(mx,my-150,250,140,0,0,TAU);c.fill();c.strokeStyle=shade(col,-.35);c.lineWidth=4;c.stroke();
    for(const s of[-1,1]){c.fillStyle=col;c.beginPath();c.arc(mx+s*170,my-270,26,0,TAU);c.fill();c.stroke();c.fillStyle='#ffb3c8';circ(c,mx+s*170,my-270,12);
      if(happy){c.strokeStyle='#3a3a4a';c.lineWidth=5;c.beginPath();c.arc(mx+s*90,my-222,16,Math.PI*1.1,Math.PI*1.9);c.stroke();}
      else if(blink){c.strokeStyle='#3a3a4a';c.lineWidth=5;c.beginPath();c.moveTo(mx+s*90-18,my-224);c.lineTo(mx+s*90+18,my-224);c.stroke();}
      else{const lk=LOOK.on?clamp((LOOK.x-mx)/300,-1,1)*6:0;c.fillStyle='#fff';circ(c,mx+s*90,my-224,22);c.fillStyle='#3a3a4a';circ(c,mx+s*90+lk,my-220,12);c.fillStyle='#fff';circ(c,mx+s*90-4+lk,my-225,4);if(this.key==='drill'||this.key==='loose'){c.strokeStyle='#3a3a4a';c.lineWidth=4;c.beginPath();c.moveTo(mx+s*70,my-256);c.lineTo(mx+s*106,my-250);c.stroke();}}}
    if(this.acc==='glasses'){c.strokeStyle='#4a3a5a';c.lineWidth=5;for(const s of[-1,1]){c.beginPath();c.arc(mx+s*90,my-224,32,0,TAU);c.stroke();}c.beginPath();c.moveTo(mx-58,my-224);c.lineTo(mx+58,my-224);c.stroke();}
    else if(this.acc==='ribbon')bow(c,mx+120,my-280,26,this.accC);else if(this.acc==='cap'){c.fillStyle=gfill(c,mx,my-290,120,this.accC);c.beginPath();c.ellipse(mx,my-262,150,50,0,Math.PI,TAU);c.fill();c.fillStyle=shade(this.accC,-.15);c.beginPath();c.ellipse(mx+80,my-262,110,18,0,0,Math.PI);c.fill();}
    else if(this.acc==='flower'){for(let i=0;i<5;i++){const a=i/5*TAU;c.fillStyle=this.accC;circ(c,mx-150+Math.cos(a)*16,my-270+Math.sin(a)*16,13);}c.fillStyle='#ffd23a';circ(c,mx-150,my-270,11);}
    c.fillStyle='rgba(255,120,150,.45)';ell(c,mx-180,my-165,22,12);ell(c,mx+180,my-165,22,12);c.fillStyle=shade(col,-.3);ell(c,mx-40,my-170,8,12);ell(c,mx+40,my-170,8,12);
    c.fillStyle=gfill(c,mx,my+150,260,col);c.beginPath();c.ellipse(mx,my+140,250,105,0,0,TAU);c.fill();c.strokeStyle=shade(col,-.35);c.stroke();
    c.fillStyle='#8a2a4a';c.beginPath();c.ellipse(mx,my,225,140,0,0,TAU);c.fill();c.fillStyle='#ff8cae';ell(c,mx,my+50,130,50);c.fillStyle='rgba(255,255,255,.12)';ell(c,mx-60,my-60,80,30);
    for(const t of this.teeth){const p=this.tooth(t),w=this.tw-10;if(t.out){c.fillStyle='#c83a5a';rr(c,p.x-w/2+6,t.top?p.y-20:p.y-2,w-12,20,6);c.fill();c.fillStyle='#fff';rr(c,p.x-8,t.top?p.y-4:p.y-6,16,10,4);c.fill();continue;}
      const wob=t.loose&&!t.out?Math.sin(T*14)*(this.key==='loose'?.18:.08):0;c.save();c.translate(p.x,p.y);c.rotate(wob);c.translate(-p.x,-p.y);
      c.fillStyle=gfill(c,p.x,p.y,40,'#ffffff',.2,-.08);rr(c,p.x-w/2,t.top?p.y-24:p.y-22,w,46,t.top?[4,4,18,18]:[18,18,4,4]);c.fill();c.strokeStyle=t.loose?'#ffb3c8':'#d0d8e8';c.lineWidth=3;c.stroke();c.restore();
      if(t.loose&&!t.out&&this.si>=0){c.strokeStyle='rgba(255,120,160,.8)';c.lineWidth=2;for(const s of[-1,1]){c.beginPath();c.moveTo(p.x+s*(w/2+4),p.y-8);c.lineTo(p.x+s*(w/2+10),p.y-14);c.stroke();}}
      if(t.cav&&!t.hole&&(t.rev||this.key!=='mirror'&&this.si>(this.steps.indexOf('mirror')))){c.fillStyle='#4a3a3a';circ(c,p.x,p.y+(t.top?4:-4),Math.max(2,9-t.dp*6));c.fillStyle='#6a5a4a';circ(c,p.x+4,p.y+(t.top?8:-8),4);}
      if(t.cav&&!t.rev&&this.key==='mirror'){c.fillStyle='rgba(74,58,58,.12)';circ(c,p.x,p.y,8);}
      if(t.hole&&!t.fill){c.fillStyle='#b8b0c0';circ(c,p.x,p.y+(t.top?4:-4),8);c.strokeStyle='#8a8098';c.lineWidth=2;c.stroke();}
      if(t.fill)MED.filling(c,p.x,p.y+(t.top?4:-4),.4);
      if(t.n){c.fillStyle='#ff5fa2';circ(c,p.x,t.top?p.y-44:p.y+44,15);txt(c,String(t.n),p.x,t.top?p.y-43:p.y+45,18,'#fff');}
      if(happy&&Math.sin(T*4+t.i+(t.top?0:3))>.7){c.fillStyle='#fff';star(c,p.x+12,p.y-8,8,3,4);c.fill();}}
    if(this.shine>0&&this.shine<1.2){const sx=mx-260+this.shine*520;const g=c.createLinearGradient(sx-60,0,sx+60,0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(.5,'rgba(255,255,255,.8)');g.addColorStop(1,'rgba(255,255,255,0)');c.save();c.beginPath();c.ellipse(mx,my,225,140,0,0,TAU);c.clip();c.fillStyle=g;c.fillRect(sx-60,my-150,120,300);c.restore();}
    if(this.flyT){const f=this.flyT,k=Math.min(1,f.t/1.2);const x=lerp(f.x,W-80,k),y=f.y-Math.sin(k*Math.PI)*200+(H*.2-f.y)*k*.0;c.save();c.translate(x,lerp(f.y,200,k)-Math.sin(k*Math.PI)*120);c.rotate(f.t*8);drawItem(c,'tooth',0,0,.6);c.restore();if(k>=1){c.fillStyle='#fff';rr(c,W-120,170,80,60,12);c.fill();c.strokeStyle='#ffb3c8';c.lineWidth=3;c.stroke();drawItem(c,'tooth',W-80,200,.45);txt(c,'はの はこ',W-80,242,12,'#ff5fa2');}}
    for(const q of this.dirt){if(q.hp<=0)continue;const p=this.tooth(q.t);const x=p.x+(q.kind==='germ'?Math.sin(T*3+q.ph)*5:0),y=p.y+(q.t.top?12:-12);c.globalAlpha=Math.min(1,.3+q.hp);if(q.kind==='food'){c.fillStyle='#6cd08a';ell(c,x-6,y,8,5);c.fillStyle='#c8905a';ell(c,x+6,y+2,6,4);}else MED.germ(c,x,y,.5);c.globalAlpha=1;}
    for(const f of this.foam){c.globalAlpha=.9;c.fillStyle='#fff';circ(c,f.x,f.y,f.r);c.globalAlpha=1;}
    if(this.boss)for(const b of this.boss)this.drawBoss(c,b);for(const m of this.minis)if(m.hp>0)MED.germ(c,m.x,m.y,.8+Math.sin(T*10)*.05);
    if(this.rinse>0){c.fillStyle='rgba(160,220,255,.5)';c.beginPath();c.ellipse(mx,my,210*Math.min(1,this.rinse*2),130*Math.min(1,this.rinse*2),0,0,TAU);c.fill();}
    if(this.key==='count'&&!this.done)txt(c,`${this.count||0} ほん`,W/2,my+260,40,'#ff5fa2',undefined,POP,400);
    if(this.key==='loose'&&this.prog>0){const t=this.teeth.find(q=>q.loose);if(t){const p=this.tooth(t);progRing(c,p.x,p.y,40,this.prog/1.4);}}
    fu(c,70,H-150,2.2,{point:!happy});rk(this,c,W-66,H-150,1.6);
    if(this.tools.some(t=>!t.hidden)){tray(c,H-80,120);for(const t of this.tools)if(!t.held)t.draw(c,1.3);for(const t of this.tools)if(t.held)t.draw(c,1.6);}
    stepDots(c,this.steps.length,Math.max(0,this.si)+(this.fin>0?1:0));},
  down(x,y){if(this.fin>0||this.si<0)return;
    if(this.boss){for(const m of this.minis)if(m.hp>0&&Math.hypot(x-m.x,y-m.y)<45){m.hp=0;good(m.x,m.y,1,'ポン！');return;}for(const b of this.boss)if(b.flee<=0&&Math.hypot(x-b.x,y-b.y)<70){this.hitBoss(b,1);burst(x,y,8,'star');return;}}
    if(this.key==='count'){if(this.done)return;const set=this.countSet();for(const t of set){const p=this.tooth(t);if(!t.n&&Math.abs(x-p.x)<this.tw/2&&Math.abs(y-p.y)<34){this.count=(this.count||0)+1;t.n=this.count;sfx('pop');burst(p.x,p.y,4,'star');hush();speak(String(this.count));speak(numEn(this.count),'en');
      if(this.count===set.length){this.done=1;setTimeout(()=>{if(scene===this){good(W/2,this.my,2,`${this.count}ほん！`);sayNum(this.count,this.countRow==='all'?'ぜんぶで ':'','ほん！');this.teeth.forEach(t=>t.n=0);this.next(2.4);}},900);}return;}}
      for(const t of this.teeth){const p=this.tooth(t);if(!set.includes(t)&&Math.abs(x-p.x)<this.tw/2&&Math.abs(y-p.y)<34){bad();say(this.countRow==='top'?'うえの はを かぞえてね':'したの はを かぞえてね');return;}}return;}
    for(const t of this.tools){if(t.hit(x,y)){if(t.k!==this.want){this.miss++;wrongTool(t);return;}t.held=true;t.lx=x;t.ly=y;sfx('tap');sayWord(t.k);return;}}
    if(y<this.my-120){sfx('boing');say(pick(['あーん','はいしゃさん ちょっと どきどき','やさしく してね']));}},
  move(x,y){const t=this.tools.find(q=>q.held);if(!t)return;const d=Math.hypot(x-t.lx,y-t.ly);t.x=x;t.y=y;t.lx=x;t.ly=y;
    if(t.k==='toothbrush'&&this.key==='brush'){const bx=x-18,by=y-24;let any=0;if(this.boss&&d>3){for(const b of this.boss)if(b.flee<=0&&Math.hypot(bx-b.x,by-b.y)<70)this.hitBoss(b,d/120);for(const m of this.minis)if(m.hp>0&&Math.hypot(bx-m.x,by-m.y)<45){m.hp=0;good(m.x,m.y,1,'ポン！');}}
      for(const q of this.dirt){if(q.hp<=0)continue;const p=this.tooth(q.t);if(Math.hypot(p.x-bx,p.y-by)<55){q.hp-=d/200;any=1;if(q.hp<=0)good(p.x,p.y,1,q.kind==='germ'?'えいっ！':'ピカッ');}}
      if(d>4&&Math.random()<.35&&Math.abs(y-this.my)<170){this.foam.push({x:bx+rand(-12,12),y:by+rand(-10,10),r:rand(6,12),t:0});if(this.foam.length>80)this.foam.shift();}if(any&&Math.random()<.3)sfx('brush');
      if(!this.boss&&!this.bossDone&&this.dirt.every(q=>q.hp<=0)){this.bossDone=1;const ty=this.bossType;this.boss=ty==='twins'?[0,1].map(i=>({type:'twins',x:this.mx,y:this.my,hp:4,max:4,t:0,hitT:0,flee:0,ph:i*Math.PI})):[{type:ty,x:this.mx,y:this.my,hp:ty==='speedy'?4:6,max:ty==='speedy'?4:6,t:0,hitT:0,flee:0,ph:0}];
        sfx('siren1');say({king:'たいへん！ ばいきんキングが でてきた！',twins:'ふたごの ばいきんが でてきた！',speedy:'すばやい ばいきんが でてきた！'}[ty]+' ごしごし するか タッチで やっつけよう！');}}},
  up(x,y){const t=this.tools.find(q=>q.held);if(!t)return;t.held=false;if(this.key==='loose')this.prog=0;
    if(this.key==='fill'&&t.k==='filling'){const h=this.teeth.find(q=>q.hole&&!q.fill&&Math.hypot(this.tooth(q).x-x,this.tooth(q).y-y)<60);if(h){h.fill=1;sfx('fill');good(this.tooth(h).x,this.tooth(h).y,1,'キラッ');if(this.teeth.every(q=>!q.hole||q.fill)){say('キラキラの つめもので ばっちり！');this.next(1.6);}}}
    if(this.key==='rinse'&&t.k==='cup'&&Math.hypot(x-this.mx,y-this.my)<220&&!this.rinse){this.rinse=.01;sfx('splash');say('ぶくぶく〜 ぺっ！');}},
  hint(){if(this.fin>0||this.si<0)return null;if(this.boss){const m=this.minis.find(m=>m.hp>0);if(m)return{x:m.x,y:m.y};const b=this.boss.find(b=>b.flee<=0);return b?{x:b.x,y:b.y}:null;}
    if(this.key==='count'){if(this.done)return null;const t=this.countSet().find(q=>!q.n);if(!t)return null;const p=this.tooth(t);return{x:p.x,y:p.y};}
    const tl=this.tools.find(q=>q.k===this.want);if(!tl||tl.hidden)return null;let g=null;
    if(this.key==='mirror'){const t=this.teeth.find(q=>q.cav&&!q.rev);if(t){const p=this.tooth(t);g={x:p.x-14,y:p.y-26};}}
    else if(this.key==='drill'){const t=this.teeth.find(q=>q.cav&&!q.hole);if(t){const p=this.tooth(t);g={x:p.x-14,y:p.y-30};}}
    else if(this.key==='fill'){const t=this.teeth.find(q=>q.hole&&!q.fill);if(t)g=this.tooth(t);}
    else if(this.key==='loose'){const t=this.teeth.find(q=>q.loose&&!q.out);if(t)g=this.tooth(t);}
    else if(this.key==='brush'){const q=this.dirt.find(q=>q.hp>0);if(q){const p=this.tooth(q.t);g={x:p.x+18,y:p.y+24};}}
    else if(this.key==='rinse'&&!this.rinse)g={x:this.mx,y:this.my};
    return g?{x:tl.hx,y:tl.hy,x2:g.x,y2:g.y}:null;},
  hintText(){return{count:'はを 1ぽんずつ タッチ',mirror:'ミラーで はを しらべよう',drill:'ドリルを むしばに あてよう',fill:'つめものを あなに いれよう',loose:'ピンセットを ぐらぐらの はに あてて まってね',brush:'はぶらしで ごしごし',rinse:'コップを おくちへ'}[this.key]||'';}};

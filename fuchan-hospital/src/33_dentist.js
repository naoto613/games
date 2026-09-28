// ================= はいしゃさん =================
SCN.dentist={bg:'#e8fff4',song:'play',
  enter(){const lv=lvOf('dentist');this.nt=lv<1?4:lv<3?5:6;this.teeth=[];for(const top of[true,false])for(let i=0;i<this.nt;i++)this.teeth.push({i,top,n:0,cav:0,rev:0,hole:0,fill:0,dp:0});
    shuffle(this.teeth).slice(0,lv<1?2:3).forEach(t=>t.cav=1);this.count=0;this.steps=['count','mirror','drill','fill','brush','rinse'];this.si=-1;this.miss=0;this.fin=0;this.foam=[];this.rinse=0;this.boss=null;this.dirt=[];
    this.pt=pick([['#b8a8dc','かばさん'],['#ffb3c8','ピンクの かばちゃん'],['#9ad0ff','みずいろの かばくん']]);this.tools=[];this.lay();
    say(`${this.pt[1]}の はいしゃさん！ おくちを あーん`);setTimeout(()=>{if(scene===this)this.startStep();},2200);},
  lay(){this.mx=300;this.my=H*.44;this.tw=Math.min(66,380/this.nt);},
  tooth(t){const x=this.mx-(this.nt-1)/2*this.tw+t.i*this.tw,y=t.top?this.my-92:this.my+92;return{x,y};},
  startStep(){this.si++;const k=this.steps[this.si];this.key=k;
    const tr={mirror:'mirror',drill:'drill',fill:'filling',brush:'toothbrush',rinse:'cup'}[k];this.tools=tr?mkTray(trayChoices(tr,['mirror','drill','filling','toothbrush','cup'],3),H-80,54):[];
    if(k==='brush'){this.dirt=shuffle(this.teeth).slice(0,5).map((t,i)=>({t,kind:i%2?'germ':'food',hp:1,ph:rand(0,6)}));}
    const msg={count:'はは なんぼん あるかな？ 1ぽんずつ タッチして かぞえよう',mirror:'デンタルミラーで むしばを さがそう。 ミラーは どれ？',drill:'むしばを ドリルで けずろう。 ドリルは どれ？',fill:'あなに つめものを して ふさごう',brush:'はぶらしで ごしごし みがこう！',rinse:'さいごに コップの おみずで ぶくぶく うがい'}[k];
    say(msg);},
  next(d=1.4){const k=this.key;this.tools.forEach(t=>t.hidden=true);setTimeout(()=>{if(scene!==this||this.key!==k)return;this.tools=[];if(this.si+1>=this.steps.length){this.fin=.01;}else this.startStep();},d*1000);},
  hitBoss(n){const b=this.boss;if(!b||b.hp<=0)return;b.hp-=n;b.hitT=.25;if(Math.random()<.4)sfx('pop');if(b.hp<=0){b.flee=.01;sfx('boom');confetti(40);RK.clap=1.5;say('ばいきんキングを やっつけた！');setTimeout(()=>{if(scene===this){this.boss=null;this.next(.2);}},1600);}else if(Math.random()<.25)say(pick(['いたたた！','やめてくれ〜！','はみがき きらい〜！']));},
  update(dt){for(const t of this.tools)t.upd(dt);for(const f of this.foam)f.t+=dt;const d=this.tools.find(t=>t.held);
    const B=this.boss;if(B){B.t+=dt;if(B.hitT>0)B.hitT-=dt;if(B.flee>0)B.flee+=dt;else{B.x=this.mx+Math.sin(B.t*1.3)*140;B.y=this.my+Math.sin(B.t*2.1)*40;}}
    if(d&&this.key==='mirror'){for(const t of this.teeth){const p=this.tooth(t);if(t.cav&&!t.rev&&Math.hypot(d.x+14-p.x,d.y+26-p.y)<60){t.rev=1;sfx('ding');burst(p.x,p.y,8,'star');say('むしば はっけん！');}}if(this.teeth.every(t=>!t.cav||t.rev)&&!this.mdone){this.mdone=1;d.held=false;this.next(1.6);}}
    if(d&&this.key==='drill'){let any=0;for(const t of this.teeth){if(!t.cav||t.hole)continue;const p=this.tooth(t);if(Math.hypot(d.x+14-p.x,d.y+30-p.y)<50){t.dp+=dt;any=1;if(Math.random()<dt*14)sfx('drill');if(Math.random()<dt*20)parts.push({x:p.x,y:p.y,vx:rand(-80,80),vy:rand(-120,-40),life:.4,t:0,kind:'dot',col:'#8a7a6a',r:5});if(t.dp>1){t.hole=1;sfx('pop');say('けずれた！');}}}
      if(this.teeth.every(t=>!t.cav||t.hole)&&!this.ddone){this.ddone=1;d.held=false;say('ぜんぶ けずれたよ。 いたくないよ、 がんばったね');this.next(1.8);}}
    if(this.key==='rinse'&&this.rinse>0){this.rinse+=dt;if(Math.random()<dt*20)drops(this.mx+rand(-150,150),this.my,2,'#9fd8ff');if(this.rinse>1.6){this.rinse=-1;this.foam=[];sfx('spark');RK.clap=1.5;say(`ピカピカの はに なったね！ ${this.pt[1]} にっこり！`);burst(this.mx,this.my,30,'star');this.next(2);}}
    if(this.fin>0){this.fin+=dt;if(this.fin>.8&&this.fin<9){this.fin=9;celebrate('dentist',starsFor(this.miss));}}},
  drawBoss(c,b){const k=b.flee>0?Math.max(0,1-b.flee):1;const x=b.x+(b.flee>0?b.flee*400:0),y=b.y-(b.flee>0?b.flee*300:0);c.save();c.translate(x,y);c.scale(k*(b.hitT>0?1.15:1),k*(b.hitT>0?.85:1));c.rotate(Math.sin(b.t*3)*.1);MED.germ(c,0,0,2.4);
    c.fillStyle='#ffd23a';c.strokeStyle='#c89000';c.lineWidth=3;c.beginPath();c.moveTo(-30,-44);c.lineTo(-30,-74);c.lineTo(-15,-58);c.lineTo(0,-80);c.lineTo(15,-58);c.lineTo(30,-74);c.lineTo(30,-44);c.closePath();c.fill();c.stroke();c.restore();
    if(b.flee<=0){c.fillStyle='rgba(0,0,0,.3)';rr(c,b.x-60,b.y-100,120,14,7);c.fill();c.fillStyle='#ff5f6f';rr(c,b.x-60,b.y-100,120*b.hp/b.max,14,7);c.fill();}},
  draw(c){const mx=this.mx,my=this.my,col=this.pt[0],happy=this.rinse<0||this.fin>0;c.fillStyle=vfill(c,0,H,'#e8fff4',.2,-.05);c.fillRect(-OX/SC-2,-OY/SC-2,W+2*OX/SC+4,H+2*OY/SC+4);
    c.globalAlpha=.4;for(let i=0;i<6;i++)drawItem(c,'tooth',(i*113)%W+40,(i*97)%(H*.25)+170,.5);c.globalAlpha=1;
    c.fillStyle=gfill(c,mx-60,my-220,280,col);c.beginPath();c.ellipse(mx,my-150,250,140,0,0,TAU);c.fill();c.strokeStyle=shade(col,-.35);c.lineWidth=4;c.stroke();
    for(const s of[-1,1]){c.fillStyle=col;c.beginPath();c.arc(mx+s*170,my-270,26,0,TAU);c.fill();c.stroke();c.fillStyle='#ffb3c8';circ(c,mx+s*170,my-270,12);
      if(happy){c.strokeStyle='#3a3a4a';c.lineWidth=5;c.beginPath();c.arc(mx+s*90,my-222,16,Math.PI*1.1,Math.PI*1.9);c.stroke();}else{c.fillStyle='#fff';circ(c,mx+s*90,my-224,22);c.fillStyle='#3a3a4a';circ(c,mx+s*90,my-220,12);c.fillStyle='#fff';circ(c,mx+s*90-4,my-225,4);}}
    c.fillStyle='rgba(255,120,150,.45)';ell(c,mx-180,my-165,22,12);ell(c,mx+180,my-165,22,12);c.fillStyle=shade(col,-.3);ell(c,mx-40,my-170,8,12);ell(c,mx+40,my-170,8,12);
    c.fillStyle=gfill(c,mx,my+150,260,col);c.beginPath();c.ellipse(mx,my+140,250,105,0,0,TAU);c.fill();c.strokeStyle=shade(col,-.35);c.stroke();
    c.fillStyle='#8a2a4a';c.beginPath();c.ellipse(mx,my,225,140,0,0,TAU);c.fill();c.fillStyle='#ff8cae';ell(c,mx,my+50,130,50);
    for(const t of this.teeth){const p=this.tooth(t),w=this.tw-10;c.fillStyle=gfill(c,p.x,p.y,40,'#ffffff',.2,-.08);rr(c,p.x-w/2,t.top?p.y-24:p.y-22,w,46,t.top?[4,4,18,18]:[18,18,4,4]);c.fill();c.strokeStyle='#d0d8e8';c.lineWidth=3;c.stroke();
      if(t.cav&&!t.hole&&(t.rev||this.key!=='mirror'&&this.si>1)){c.fillStyle='#4a3a3a';circ(c,p.x,p.y+(t.top?4:-4),9-t.dp*4);c.fillStyle='#6a5a4a';circ(c,p.x+4,p.y+(t.top?8:-8),4);}
      if(t.cav&&!t.rev&&this.key==='mirror'){c.fillStyle='rgba(74,58,58,.12)';circ(c,p.x,p.y,8);}
      if(t.hole&&!t.fill){c.fillStyle='#b8b0c0';circ(c,p.x,p.y+(t.top?4:-4),8);c.strokeStyle='#8a8098';c.lineWidth=2;c.stroke();}
      if(t.fill){MED.filling(c,p.x,p.y+(t.top?4:-4),.4);}
      if(t.n){c.fillStyle='#ff5fa2';circ(c,p.x,t.top?p.y-44:p.y+44,15);txt(c,String(t.n),p.x,t.top?p.y-43:p.y+45,18,'#fff');}
      if(happy&&Math.sin(T*4+t.i+(t.top?0:3))>.7){c.fillStyle='#fff';star(c,p.x+12,p.y-8,8,3,4);c.fill();}}
    for(const q of this.dirt){if(q.hp<=0)continue;const p=this.tooth(q.t);const x=p.x+(q.kind==='germ'?Math.sin(T*3+q.ph)*5:0),y=p.y+(q.t.top?12:-12);c.globalAlpha=Math.min(1,.3+q.hp);if(q.kind==='food'){c.fillStyle='#6cd08a';ell(c,x-6,y,8,5);c.fillStyle='#c8905a';ell(c,x+6,y+2,6,4);}else MED.germ(c,x,y,.5);c.globalAlpha=1;}
    for(const f of this.foam){c.globalAlpha=.9;c.fillStyle='#fff';circ(c,f.x,f.y,f.r);c.globalAlpha=1;}
    if(this.boss)this.drawBoss(c,this.boss);
    if(this.rinse>0){c.fillStyle='rgba(160,220,255,.5)';c.beginPath();c.ellipse(mx,my,210*Math.min(1,this.rinse*2),130*Math.min(1,this.rinse*2),0,0,TAU);c.fill();}
    if(this.key==='count'&&!this.done)txt(c,`${this.count} ほん`,W/2,my+260,40,'#ff5fa2',undefined,POP,400);
    fu(c,70,H-150,2.2,{point:!happy,cheer:happy});rk(this,c,W-66,H-150,1.6,{happy});
    if(this.tools.some(t=>!t.hidden)){tray(c,H-80,120);for(const t of this.tools)if(!t.held)t.draw(c,1.3);for(const t of this.tools)if(t.held)t.draw(c,1.6);}
    stepDots(c,this.steps.length,Math.max(0,this.si)+(this.fin>0?1:0));},
  down(x,y){if(this.fin>0||this.si<0)return;
    if(this.boss&&this.boss.flee<=0&&Math.hypot(x-this.boss.x,y-this.boss.y)<70){this.hitBoss(1);burst(x,y,8,'star');return;}
    if(this.key==='count'){if(this.done)return;for(const t of this.teeth){const p=this.tooth(t);if(!t.n&&Math.abs(x-p.x)<this.tw/2&&Math.abs(y-p.y)<34){this.count++;t.n=this.count;sfx('pop');hush();speak(String(this.count));speak(numEn(this.count),'en');
      if(this.count===this.teeth.length){this.done=1;setTimeout(()=>{if(scene===this){sayNum(this.count,'ぜんぶで ','ほん！');this.teeth.forEach(t=>t.n=0);this.next(2.4);}},900);}return;}}return;}
    for(const t of this.tools){if(t.hit(x,y)){const want={mirror:'mirror',drill:'drill',fill:'filling',brush:'toothbrush',rinse:'cup'}[this.key];if(t.k!==want){sfx('no');this.miss++;const w=WORDS[t.k];hush();speak(`それは ${w[0]}`);speak(w[1],'en');card={k:t.k,ja:w[0],en:w[1],t:0};return;}t.held=true;t.lx=x;t.ly=y;sfx('tap');sayWord(t.k);return;}}
    if(y<this.my-120){sfx('boing');say(pick(['あーん','はいしゃさん ちょっと どきどき','やさしく してね']));}},
  move(x,y){const t=this.tools.find(q=>q.held);if(!t)return;const d=Math.hypot(x-t.lx,y-t.ly);t.x=x;t.y=y;t.lx=x;t.ly=y;
    if(t.k==='toothbrush'&&this.key==='brush'){const bx=x-18,by=y-24;let any=0;if(this.boss&&this.boss.flee<=0&&Math.hypot(bx-this.boss.x,by-this.boss.y)<70&&d>3)this.hitBoss(d/120);
      for(const q of this.dirt){if(q.hp<=0)continue;const p=this.tooth(q.t);if(Math.hypot(p.x-bx,p.y-by)<55){q.hp-=d/200;any=1;if(q.hp<=0){sfx('pop');burst(p.x,p.y,8,q.kind==='germ'?'dot':'star');}}}
      if(d>4&&Math.random()<.35&&Math.abs(y-this.my)<170){this.foam.push({x:bx+rand(-12,12),y:by+rand(-10,10),r:rand(6,12),t:0});if(this.foam.length>80)this.foam.shift();}if(any&&Math.random()<.3)sfx('brush');
      if(!this.boss&&!this.bossDone&&this.dirt.every(q=>q.hp<=0)){this.bossDone=1;this.boss={x:this.mx,y:this.my,hp:6,max:6,t:0,hitT:0,flee:0};sfx('siren1');say('たいへん！ ばいきんキングが でてきた！ ごしごし するか タッチで やっつけよう！');}}},
  up(x,y){const t=this.tools.find(q=>q.held);if(!t)return;t.held=false;
    if(this.key==='fill'&&t.k==='filling'){const h=this.teeth.find(q=>q.hole&&!q.fill&&Math.hypot(this.tooth(q).x-x,this.tooth(q).y-y)<60);if(h){h.fill=1;sfx('fill');burst(this.tooth(h).x,this.tooth(h).y,10,'star');if(this.teeth.every(q=>!q.hole||q.fill)){say('キラキラの つめもので ばっちり！');this.next(1.6);}else say('キラキラ！ つぎの あなも');}}
    if(this.key==='rinse'&&t.k==='cup'&&Math.hypot(x-this.mx,y-this.my)<220&&!this.rinse){this.rinse=.01;sfx('splash');say('ぶくぶく〜 ぺっ！');}},
  hint(){if(this.fin>0||this.si<0)return null;if(this.boss)return this.boss.flee>0?null:{x:this.boss.x,y:this.boss.y};
    if(this.key==='count'){if(this.done)return null;const t=this.teeth.find(q=>!q.n);if(!t)return null;const p=this.tooth(t);return{x:p.x,y:p.y};}
    const want={mirror:'mirror',drill:'drill',fill:'filling',brush:'toothbrush',rinse:'cup'}[this.key];const tl=this.tools.find(q=>q.k===want);if(!tl||tl.hidden)return null;let g=null;
    if(this.key==='mirror'){const t=this.teeth.find(q=>q.cav&&!q.rev);if(t){const p=this.tooth(t);g={x:p.x-14,y:p.y-26};}}
    else if(this.key==='drill'){const t=this.teeth.find(q=>q.cav&&!q.hole);if(t){const p=this.tooth(t);g={x:p.x-14,y:p.y-30};}}
    else if(this.key==='fill'){const t=this.teeth.find(q=>q.hole&&!q.fill);if(t)g=this.tooth(t);}
    else if(this.key==='brush'){const q=this.dirt.find(q=>q.hp>0);if(q){const p=this.tooth(q.t);g={x:p.x+18,y:p.y+24};}}
    else if(this.key==='rinse'&&!this.rinse)g={x:this.mx,y:this.my};
    return g?{x:tl.hx,y:tl.hy,x2:g.x,y2:g.y}:null;},
  hintText(){return{count:'はを 1ぽんずつ タッチ',mirror:'ミラーで はを しらべよう',drill:'ドリルを むしばに あてよう',fill:'つめものを あなに いれよう',brush:'はぶらしで ごしごし',rinse:'コップを おくちへ'}[this.key]||'';}};

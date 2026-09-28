// ================= あかちゃんルーム =================
M('milkbottle',(c,o)=>{c.rotate(-.35);const lv=o.lv??1;c.fillStyle='rgba(255,255,255,.9)';OL(c,'#b8c4d8');rr(c,-13,-14,26,42,8);c.fill();c.stroke();c.save();c.beginPath();rr(c,-13,-14,26,42,8);c.clip();c.fillStyle='#fffaf0';c.fillRect(-14,28-40*lv,28,40*lv);c.restore();c.strokeStyle='#c8d0e0';c.lineWidth=1.5;for(let i=0;i<4;i++){c.beginPath();c.moveTo(-13,18-i*8);c.lineTo(-6,18-i*8);c.stroke();}
  c.fillStyle='#ff9ac8';OL(c,'#e070a0');rr(c,-15,-22,30,10,4);c.fill();c.stroke();c.fillStyle='#ffd8b0';OL(c,'#e0b080');c.beginPath();c.ellipse(0,-30,7,9,0,0,TAU);c.fill();c.stroke();});
M('diaper',c=>{c.fillStyle=gfill(c,-4,-4,30,'#ffffff');OL(c,'#b8c8e0');c.beginPath();c.moveTo(-30,-16);c.lineTo(30,-16);c.lineTo(22,6);c.quadraticCurveTo(0,26,-22,6);c.closePath();c.fill();c.stroke();c.fillStyle='#8ad0ff';rr(c,-34,-18,12,10,3);c.fill();rr(c,22,-18,12,10,3);c.fill();c.fillStyle='#ffd23a';star(c,0,-2,7,3);c.fill();});
M('rattle',c=>{c.rotate(-.4);c.fillStyle='#ffe08a';OL(c,'#d0a040');rr(c,-3,2,6,28,3);c.fill();c.stroke();c.fillStyle=gfill(c,-4,-12,16,'#ff8cc0');OL(c,'#d85a90');c.beginPath();c.arc(0,-12,15,0,TAU);c.fill();c.stroke();c.fillStyle='#fff';for(let i=0;i<5;i++){const a=i/5*TAU+T*2;circ(c,Math.cos(a)*8,-12+Math.sin(a)*8,2.5);}c.fillStyle='#5aa8ff';circ(c,0,34,6);});
M('blanket',c=>{c.fillStyle=gfill(c,-6,-6,30,'#bfe0ff');OL(c,'#8ab8e0');c.beginPath();c.moveTo(-30,-20);c.quadraticCurveTo(0,-26,30,-20);c.lineTo(26,22);c.quadraticCurveTo(0,28,-26,22);c.closePath();c.fill();c.stroke();c.fillStyle='#fff';for(let i=0;i<6;i++)star(c,-18+(i%3)*18,-8+Math.floor(i/3)*16,4,1.8),c.fill();c.fillStyle='#ffe36a';c.beginPath();c.arc(14,-6,6,Math.PI*.4,Math.PI*1.6);c.arc(11,-6,5,Math.PI*1.6,Math.PI*.4,true);c.fill();});
Object.assign(WORDS,{milkbottle:['ミルク','milk'],diaper:['おむつ','diaper'],rattle:['ガラガラ','rattle'],blanket:['もうふ','blanket']});
const BNEEDS={milk:{tool:'milkbottle',cue:'おなかが ぐ〜って なってる。 なにが ほしいのかな？',icon:'milkbottle'},diaper:{tool:'diaper',cue:'おしりが きもちわるいみたい。 なにを かえる？',icon:'diaper'},sleep:{tool:'blanket',cue:'ふあ〜 あくびを してる。 ねむいのかな？',icon:'blanket'},bath:{tool:'sponge',cue:'あせで べたべた。 きれいに してあげよう',icon:'sponge'},play:{tool:'rattle',cue:'つまらないよ〜って ないてる。 あそんで ほしいみたい',icon:'rattle'}};
const BNAMES=['もも','そら','はな','ゆう','りん','けい','みお','たろう','こはる','はると'];
SCN.nursery={bg:'#fff4fa',song:'fuwa',
  enter(){const lv=lvOf('nursery');this.n=Math.random()<.5?3:4;this.miss=0;this.fin=0;this.ri=0;this.act=null;this.sub=null;this.tools=[];this.lay();
    const nm=shuffle(BNAMES);this.babies=[...Array(this.n)].map((_,i)=>({name:nm[i]+(Math.random()<.5?'ちゃん':'くん'),wear:rkWear(pick(Object.keys(RKWEAR))),hat:pick(['none','none','bonnet','ribbon','bear','bunny','flower']),st:'ok',rock:0,ra:0,dirt:[],hop:0,sleep:Math.random()<.3}));
    const pool=['milk','diaper','sleep','bath','play'];this.needs=shuffle(pool).concat(shuffle(pool)).slice(0,lv<1?4:5);this.N=this.needs.length;this.count={opts:null};
    say('あかちゃんルームへ ようこそ！ まずは かぞえよう。 あかちゃんは なんにん いるかな？');setTimeout(()=>{if(scene===this)this.count.opts=shuffle([this.n,this.n===3?4:3,this.n===3?2:5]);},1800);},
  lay(){this.gy=H*.66;},
  cx(i){return W/2+(i-(this.n-1)/2)*(this.n>3?144:186);},
  baby(i){return{x:this.cx(i),y:this.gy-14,sc:this.n>3?2.05:2.5};},
  nextNeed(){if(this.ri>=this.N){this.finish();return;}const k=this.needs[this.ri];let i;const cand=this.babies.map((b,j)=>j).filter(j=>this.babies[j].st!=='need');i=pick(cand.filter(j=>j!==this.lastI).length?cand.filter(j=>j!==this.lastI):cand);this.lastI=i;
    const B=this.babies[i];B.st='need';B.need=k;B.sleep=false;B.dirt=k==='bath'?[...Array(4)].map(()=>({a:rand(-16,16),b:rand(-30,-8),hp:1})):[];this.act={i,k,stage:0,prog:0};sfx('squeak');
    this.tools=mkTray(shuffle(Object.values(BNEEDS).map(n=>n.tool)),H-84,48);hush();speak(`${B.name}が ないてる！`);speak('えーん えーん','ja',1.9);speak(BNEEDS[k].cue);bub={text:`${B.name}：${BNEEDS[k].cue}`,t:0,life:4};},
  solve(){const a=this.act,B=this.babies[a.i];B.st='ok';B.hop=1;B.sleep=a.k==='sleep';this.tools=[];this.sub=null;const p=this.baby(a.i);good(p.x,p.y-60,2,a.k==='sleep'?'すやすや':'にこにこ！');
    say(a.k==='sleep'?`${B.name} ねむったよ。 しーっ`:pick([`${B.name} にっこり！`,'ごきげんに なったね！','きゃっきゃ！']));this.act=null;this.ri++;setTimeout(()=>{if(scene===this)this.nextNeed();},2400);},
  finish(){this.babies.forEach(b=>{b.sleep=true;b.st='ok';});banner('みんな すやすや','#ff8cc8','あかちゃんルーム かんりょう！');setTimeout(()=>{if(scene===this)say('みんな ねんね したね。 おやすみなさい');},1000);this.fin=.01;},
  update(dt){for(const t of this.tools)t.upd(dt);for(const b of this.babies){if(b.hop>0)b.hop-=dt*2;b.ra*=.92;}
    const a=this.act;const d=this.tools.find(t=>t.held);
    if(a&&d){const p=this.baby(a.i),B=this.babies[a.i];
      if(a.k==='milk'&&a.stage===0&&d.k==='milkbottle'){if(Math.hypot(d.x-p.x,d.y-(p.y-32*p.sc))<60){a.prog+=dt;d.o={lv:Math.max(0,1-a.prog/2)};if(Math.random()<dt*3)sfx('munch');if(a.prog>2){d.held=false;this.tools=[];a.stage=1;a.pats=0;good(p.x,p.y-60,1,'ごくごく');say('ぜんぶ のんだ！ せなかを トントンして げっぷ させてあげよう');}}}
      if(a.k==='play'&&d.k==='rattle'){if(Math.hypot(d.x-p.x,d.y-(p.y-30*p.sc))<110){const mv=Math.hypot(d.x-(d.px2??d.x),d.y-(d.py2??d.y));a.prog+=mv;if(mv>3&&Math.random()<.3)sfx('tick');if(a.prog>500)this.solve();}d.px2=d.x;d.py2=d.y;}
      if(a.k==='bath'&&(d.k==='sponge'||d.k==='towel')){const mv=Math.hypot(d.x-(d.px2??d.x),d.y-(d.py2??d.y));d.px2=d.x;d.py2=d.y;
        if(a.stage===0&&d.k==='sponge'){for(const q of B.dirt){if(q.hp>0&&Math.hypot(d.x-(p.x+q.a*p.sc),d.y-20-(p.y+q.b*p.sc))<50){q.hp-=mv/140;if(Math.random()<.3)bubbles(d.x,d.y,1);if(q.hp<=0)good(p.x+q.a*p.sc,p.y+q.b*p.sc,1,'あわあわ');}}if(B.dirt.every(q=>q.hp<=0)){d.held=false;a.stage=1;this.tools=mkTray(['towel'],H-84,48);say('タオルで ふきふき');}}
        else if(a.stage===1&&d.k==='towel'&&Math.hypot(d.x-p.x,d.y-(p.y-30*p.sc))<100){a.prog+=mv;if(a.prog>500){d.held=false;this.solve();}}}}
    if(a&&a.k==='sleep'&&a.stage===1){const B=this.babies[a.i];if(a.prog>=1&&!a.done){a.done=1;this.solve();}}
    if(this.fin>0){this.fin+=dt;if(this.fin>3&&this.fin<9){this.fin=9;celebrate('nursery',starsFor(this.miss));}}},
  drawCrib(c,i,front){const x=this.cx(i),y=this.gy,w=this.n>3?136:172,B=this.babies[i];c.save();c.translate(x,y);c.rotate(B.ra);
    if(!front){c.fillStyle='#f8e0c0';rr(c,-w/2,-170,w,170,12);c.fill();c.fillStyle='#fff6fa';rr(c,-w/2+8,-34,w-16,30,10);c.fill();c.fillStyle='#ffd8e8';heartP(c,0,-150,10);c.fill();}
    else{c.strokeStyle='#d8a870';c.lineWidth=6;c.lineCap='round';for(let k=0;k<=6;k++){const bx=-w/2+k*w/6;c.beginPath();c.moveTo(bx,-40);c.lineTo(bx,0);c.stroke();}c.fillStyle='#e8b880';rr(c,-w/2-6,-46,w+12,12,6);c.fill();rr(c,-w/2-6,-6,w+12,12,6);c.fill();rr(c,-w/2-10,-180,12,190,6);c.fill();rr(c,w/2-2,-180,12,190,6);c.fill();c.restore();c.save();c.translate(x,y);c.fillStyle='#ffb3d0';rr(c,-50,14,100,26,12);c.fill();txt(c,B.name,0,27,B.name.length>4?14:17,'#fff');}
    c.restore();},
  draw(c){roomBg(c,'#fff0f8','#f4e0ec',this.gy+20,'#fff8fc',[['window',100,this.gy-270,1,120,96,'#ffc8e0'],['frame',W-90,this.gy-290,1,'rainbow'],['clock',W/2,178,.6]]);
    // mobile toy
    c.strokeStyle='#d8c0d8';c.lineWidth=2;for(let i=0;i<4;i++){const a=T*.8+i*1.57,x=W/2+Math.cos(a)*60,y=240+Math.sin(a)*8;c.beginPath();c.moveTo(W/2,210);c.lineTo(x,y);c.stroke();c.fillStyle=['#ffd23a','#ff8cc0','#8ad0ff','#b8f0a0'][i];star(c,x,y+10,11,5);c.fill();}
    for(let i=0;i<this.n;i++){this.drawCrib(c,i,false);const B=this.babies[i],p=this.baby(i),a=this.act&&this.act.i===i?this.act:null;const cry=B.st==='need'&&!(a&&a.k==='milk'&&a.prog>0);
      c.save();c.translate(this.cx(i),this.gy);c.rotate(B.ra);c.translate(-this.cx(i),-this.gy);
      drawRikki(c,p.x,p.y+(B.st==='need'?Math.abs(Math.sin(T*10))*-2:0),{sc:p.sc,t:T+i,wear:B.wear,hat:B.hat,toy:false,cry,sleep:B.sleep&&!cry,happy:B.hop>0||(a&&a.k==='play'&&a.prog>100),eat:a&&a.k==='milk'&&a.prog>0&&a.stage===0,hop:B.hop});
      for(const q of B.dirt){if(q.hp<=0)continue;c.globalAlpha=q.hp;c.fillStyle='#b8a080';circ(c,p.x+q.a*p.sc,p.y+q.b*p.sc,6);c.globalAlpha=1;}
      if(a&&a.k==='sleep'&&a.stage>=1){c.fillStyle='#bfe0ff';rr(c,p.x-40,p.y-26,80,30,10);c.fill();}
      c.restore();this.drawCrib(c,i,true);
      if(B.sleep&&B.st!=='need')for(let k=0;k<3;k++){const zt=(T*.6+k*.33+i*.2)%1;c.globalAlpha=1-zt;txt(c,'Z',p.x+30+zt*26,p.y-60*p.sc/1.7-zt*40,14+k*4,'#9a8ab8');}c.globalAlpha=1;
      if(B.st==='need'){const k=B.need;c.fillStyle='#fff';circ(c,p.x+50,p.y-120,26);circ(c,p.x+30,p.y-92,6);c.globalAlpha=.9;if(k==='milk')txt(c,'ぐ〜',p.x+50,p.y-120,18,'#c86a8a');else if(k==='diaper'){c.strokeStyle='#b8a060';c.lineWidth=3;for(let j=0;j<3;j++){c.beginPath();c.moveTo(p.x+38+j*12,p.y-108);c.quadraticCurveTo(p.x+30+j*12,p.y-120,p.x+38+j*12,p.y-132);c.stroke();}}else if(k==='sleep')txt(c,'ふあ〜',p.x+50,p.y-120,15,'#8a7ab8');else if(k==='bath')txt(c,'べたべた',p.x+50,p.y-120,12,'#a08060');else txt(c,'ひま〜',p.x+50,p.y-120,15,'#5a88c8');c.globalAlpha=1;}}
    const a=this.act;if(a){const p=this.baby(a.i);if(a.k==='milk'&&a.stage===1){txt(c,`トントン ${a.pats} / 3`,W/2,H-150,28,'#ff5fa2');targetMark(c,p.x,p.y-30*p.sc,50);}
      if(a.k==='diaper'&&a.stage===1){txt(c,'テープを 2つ とめよう',W/2,H-150,26,'#5aa8ff');for(const s of[-1,1]){if(a.tabs&&a.tabs.includes(s))continue;const tx=p.x+s*40,ty=p.y-6;c.fillStyle='#8ad0ff';rr(c,tx-12,ty-8,24,16,4);c.fill();targetMark(c,tx,ty,20);}}
      if(a.k==='sleep'&&a.stage===1){txt(c,'ゆりかごを ゆらゆら',W/2,H-150,26,'#9a7ad8');c.fillStyle='#fff';rr(c,W/2-120,H-120,240,20,10);c.fill();c.fillStyle='#b48cff';rr(c,W/2-120,H-120,240*Math.min(1,a.prog),20,10);c.fill();txtO(c,'◀ ▶',p.x,this.gy+40,30,'#b48cff','#fff',6);if(Math.random()<.05)parts.push({x:p.x+rand(-60,60),y:p.y-60,vx:rand(-20,20),vy:-40,life:1.5,t:0,kind:'note',col:'#b48cff',r:10});}
      if(a.k==='play'&&a.prog>0){c.fillStyle='#fff';rr(c,W/2-120,H-160,240,20,10);c.fill();c.fillStyle='#ff8cc0';rr(c,W/2-120,H-160,240*Math.min(1,a.prog/500),20,10);c.fill();}
      if(a.k==='bath'){c.fillStyle='rgba(191,232,255,.35)';ell(c,p.x,p.y-10,70,20);}}
    if(this.count.opts){panel(c,40,H-190,W-80,170,24,'#fff','#ffb3d6');txt(c,'あかちゃんは なんにん？',W/2,H-166,22,'#8a5a9a');this.count.opts.forEach((n,i)=>numBtn(c,W/2+(i-1)*150,H-86,44,n,['#ff8cc0','#5aa8ff','#ffb03a'][i]));}
    fu(c,62,H-120,2,{point:!!this.act});rk(this,c,W-56,H-120,1.4);
    if(this.tools.some(t=>!t.hidden)){tray(c,H-84,110);for(const t of this.tools)if(!t.held)t.draw(c,1.15);for(const t of this.tools)if(t.held)t.draw(c,1.4);}
    stepDots(c,this.N,this.ri);},
  down(x,y){if(this.fin)return;
    if(this.count.opts){this.count.opts.forEach((n,i)=>{if(hitC(x,y,W/2+(i-1)*150,H-86,50)){if(n===this.n){good(W/2+(i-1)*150,H-86,2);sayNum(n,'',' にん');this.count.opts=null;setTimeout(()=>{if(scene===this)this.nextNeed();},2200);}else{bad();this.miss++;say('ベッドの あかちゃんを 1にんずつ かぞえてね');}}});return;}
    const a=this.act;if(!a)return;const p=this.baby(a.i),B=this.babies[a.i];
    if(a.k==='milk'&&a.stage===1){if(hitC(x,y,p.x,p.y-30*p.sc,70)){a.pats++;sfx('tap');hush();speak('トントン');if(a.pats>=3){sfx('boing');parts.push({x:p.x,y:p.y-90,vx:0,vy:-60,life:1,t:0,kind:'txt',text:'けぷっ',col:'#ff9a3a',r:30});this.solve();}}return;}
    if(a.k==='diaper'&&a.stage===1){for(const s of[-1,1]){if(a.tabs.includes(s))continue;if(hitC(x,y,p.x+s*40,p.y-6,30)){a.tabs.push(s);sfx('snap');if(a.tabs.length>=2)this.solve();return;}}return;}
    if(a.k==='sleep'&&a.stage===1){this.rockX=x;return;}
    for(const t of this.tools){if(t.hit(x,y)){const want=BNEEDS[a.k].tool;if(a.k==='bath'&&a.stage===1&&t.k==='towel'){t.held=true;sayWord('towel');return;}if(t.k!==want){this.miss++;wrongTool(t,BNEEDS[a.k].cue);B.hop=.3;return;}t.held=true;t.px2=x;t.py2=y;sfx('tap');sayWord(t.k);return;}}},
  move(x,y){const a=this.act;const t=this.tools.find(q=>q.held);if(t){t.x=x;t.y=y;}
    if(a&&a.k==='sleep'&&a.stage===1&&this.rockX!=null){const dx=x-this.rockX;this.rockX=x;const B=this.babies[a.i];B.ra=clamp(B.ra+dx*.002,-.12,.12);a.prog=Math.min(1,a.prog+Math.abs(dx)/900);if(Math.random()<.04)tone(pick([523,587,659,784]),.4,'sine',.08);}},
  up(x,y){this.rockX=null;const a=this.act;const t=this.tools.find(q=>q.held);if(!t||!a)return;t.held=false;const p=this.baby(a.i);
    if(a.k==='milk'&&a.stage===0)a.prog=Math.min(a.prog,a.prog);
    if(a.k==='diaper'&&t.k==='diaper'&&Math.hypot(x-p.x,y-(p.y-10))<90){a.stage=1;a.tabs=[];this.tools=[];good(p.x,p.y,1,'おむつ こうかん');say('あたらしい おむつ！ テープを 2つ とめてね');}
    if(a.k==='sleep'&&t.k==='blanket'&&Math.hypot(x-p.x,y-(p.y-20))<100){a.stage=1;a.prog=0;this.tools=[];good(p.x,p.y-20,1,'ふわふわ');say('もうふを かけたよ。 ゆりかごを ゆらゆら ゆらして ねかせてあげよう');}},
  hint(){if(this.fin)return null;if(this.count.opts){const i=this.count.opts.indexOf(this.n);return{x:W/2+(i-1)*150,y:H-86};}const a=this.act;if(!a)return null;const p=this.baby(a.i);
    if(a.k==='milk'&&a.stage===1)return{x:p.x,y:p.y-30*p.sc};
    if(a.k==='diaper'&&a.stage===1){const s=[-1,1].find(s=>!a.tabs.includes(s));return{x:p.x+s*40,y:p.y-6};}
    if(a.k==='sleep'&&a.stage===1)return{x:p.x-70,y:p.y+10,x2:p.x+70,y2:p.y+10};
    const want=a.k==='bath'&&a.stage===1?'towel':BNEEDS[a.k].tool;const t=this.tools.find(q=>q.k===want);if(!t||t.hidden)return null;
    if(a.k==='bath'&&a.stage===0){const q=this.babies[a.i].dirt.find(q=>q.hp>0);if(q)return{x:t.hx,y:t.hy,x2:p.x+q.a*p.sc+rand(-6,6),y2:p.y+q.b*p.sc+20};}
    if(a.k==='milk')return{x:t.hx,y:t.hy,x2:p.x,y2:p.y-32*p.sc};
    return{x:t.hx,y:t.hy,x2:p.x+rand(-20,20),y2:p.y-30*p.sc+rand(-10,10)};},
  hintText(){const a=this.act;if(!a)return this.count.opts?'あかちゃんを かぞえてね':'';return BNEEDS[a.k].cue;}};

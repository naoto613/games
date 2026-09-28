// ================= どうぶつびょういん =================
const PETS=['dog','cat','rabbit','chick','pig','panda'];
SCN.pet={bg:'#fff4e8',song:'fuwa',
  enter(){this.ph='pick';this.pets=shuffle(PETS).slice(0,3);this.k=null;this.miss=0;this.fin=0;this.steps=['weigh','brush','nails','shot','treat','dress'];this.si=-1;this.happy=0;this.acc=null;this.photo=0;this.tools=[];this.lay();
    say('どうぶつびょういん！ きょうの かんじゃさんは だれ？ えらんでね');},
  lay(){this.px=W/2;this.py=H*.6;this.s=1.6;},
  startStep(){this.si++;const k=this.steps[this.si];this.key=k;this.tools=[];const lv=lvOf('pet');
    if(k==='weigh'){this.w={v:1+Math.floor(Math.random()*(lv>=1?9:6)),t:0,opts:null};sfx('roll');say('まずは たいじゅうを はかろう。 はりが とまるまで みてね');}
    if(k==='brush'){this.tangles=[...Array(5)].map(()=>({a:rand(-50,50),b:rand(-120,-30),hp:1}));this.tools=mkTray(trayChoices('brush',['brush','toothbrush','clipper','syringe'],3),H-84);say('けが もじゃもじゃ。 ブラシで とかして あげよう。 ブラシは どれ？');}
    if(k==='nails'){this.nails=[[-18,-4],[18,-4],[-36,-34],[36,-34]].map(([a,b])=>({a,b,cut:0}));this.ncount=0;say('つめが のびてるね。 あしを タッチして つめを きろう');}
    if(k==='shot'){this.prog=0;this.tools=mkTray(trayChoices('syringe',['syringe','brush','steth','bottle'],3),H-84);say('びょうきに ならない よぼうちゅうしゃ。 ちゅうしゃは どれ？');}
    if(k==='treat'){this.eat=0;this.tools=mkTray(['bone'],H-84);say('がんばった ごほうびに おやつを あげよう');}
    if(k==='dress'){say('さいごに おしゃれして しゃしんを とろう！');}},
  next(d=1.4){const k=this.key;this.tools.forEach(t=>t.hidden=true);setTimeout(()=>{if(scene!==this||this.key!==k)return;this.tools=[];if(this.si+1<this.steps.length)this.startStep();},d*1000);},
  P(){return{x:this.px,y:this.py};},
  update(dt){for(const t of this.tools)t.upd(dt);if(this.happy>0)this.happy-=dt;
    if(this.key==='weigh'){const w=this.w;w.t+=dt;if(w.t>2&&!w.opts){w.opts=shuffle([w.v,...shuffle([1,2,3,4,5,6,7,8,9].filter(v=>v!==w.v)).slice(0,2)]);say('なんキロ かな？ はりが さしている かずを えらんでね');}}
    const d=this.tools.find(t=>t.held);
    if(this.key==='shot'&&d&&d.k==='syringe'){const P=this.P();if(Math.hypot(d.x-(P.x+34*this.s),d.y-(P.y-44*this.s))<80){this.prog+=dt;if(this.prog>1.1&&!this.shot){this.shot=1;d.held=false;sfx('ding');this.happy=1;say('ちくっ！ えらいね！ よく がまん できました');this.next(1.8);}}}
    if(this.key==='treat'&&this.eat>0){this.eat+=dt;if(Math.random()<dt*4)sfx('munch');if(this.eat>1.6){this.eat=0;this.happy=1;sfx('heart');burst(this.px,this.py-180,10,'heart');this.next(.6);}}
    if(this.photo>0){this.photo+=dt;if(this.photo>2.4&&!this.fin)this.fin=.01;}if(this.fin>0){this.fin+=dt;if(this.fin>.5&&this.fin<9){this.fin=9;celebrate('pet',starsFor(this.miss));}}},
  draw(c){const L=-OX/SC-2,R=W+OX/SC+2;roomBg(c,'#fff4e8','#f0dcc0',H*.5,'#ffe8d0');
    c.fillStyle='#fff';rr(c,40,150,110,90,12);c.fill();c.strokeStyle='#ffc890';c.lineWidth=4;c.stroke();drawAnimal(c,'dog',72,232,.36,{t:T,happy:1});drawAnimal(c,'cat',118,232,.36,{t:T+1,happy:1});
    if(this.ph==='pick'){txtO(c,'だれを みてあげる？',W/2,230,36,'#ff8a3a','#fff',8);this.pets.forEach((k,i)=>{const x=110+i*190,y=H*.36;panel(c,x-82,y,164,230,24,'#fff','#ffb38a');drawAnimal(c,k,x,y+200,.85,{t:T+i,sad:1});txt(c,WORDS[k][0],x,y+30,24,'#8a5a3a');});fu(c,90,H-40,2.4,{wave:1});rk(this,c,W-80,H-40,1.8);return;}
    const P=this.P(),s=this.s,k=this.key;
    if(k==='weigh'){c.fillStyle=gfill(c,P.x,P.y,120,'#e8eef8');rr(c,P.x-120,P.y-6,240,34,12);c.fill();c.strokeStyle='#9aa8c8';c.lineWidth=4;c.stroke();
      const dx=W-120,dy=250,w=this.w,ang=Math.PI+Math.min(1,w.t/1.6)*(w.v/10)*Math.PI+(w.t<1.6?Math.sin(w.t*18)*.05:0);panel(c,dx-110,dy-100,220,140,20,'#fff','#9aa8c8');for(let i=0;i<=10;i++){const a=Math.PI+i/10*Math.PI;c.strokeStyle='#8a98b8';c.lineWidth=i%5?2:4;c.beginPath();c.moveTo(dx+Math.cos(a)*78,dy+Math.sin(a)*78+20);c.lineTo(dx+Math.cos(a)*90,dy+Math.sin(a)*90+20);c.stroke();txt(c,String(i),dx+Math.cos(a)*62,dy+Math.sin(a)*62+20,i===w.v&&w.opts?22:16,i===w.v&&w.opts?'#ff4d6d':'#6a7a9a');}
      c.strokeStyle='#ff4d6d';c.lineWidth=5;c.beginPath();c.moveTo(dx,dy+20);c.lineTo(dx+Math.cos(ang)*84,dy+20+Math.sin(ang)*84);c.stroke();c.fillStyle='#ff4d6d';circ(c,dx,dy+20,8);txt(c,'kg',dx,dy+2,16,'#8a98b8');}
    const hp=this.happy>0;drawAnimal(c,this.k,P.x,P.y,s,{t:T,happy:hp||k==='dress',eat:this.eat>0?1:0,sad:k==='shot'&&!this.shot,hop:hp?this.happy*.5:0});
    if(k==='brush'||this.si<1)for(const q of this.tangles||[]){if(q.hp<=0)continue;c.globalAlpha=q.hp;c.strokeStyle='#8a6a4a';c.lineWidth=3;c.beginPath();for(let i=0;i<14;i++){const a=i*1.3;c.lineTo(P.x+q.a+Math.cos(a)*(6+i),P.y+q.b+Math.sin(a*1.1)*(5+i*.6));}c.stroke();c.globalAlpha=1;}
    if(k==='nails')for(const n of this.nails){const x=P.x+n.a*s,y=P.y+n.b*s;if(!n.cut){c.fillStyle='#fff';c.strokeStyle='#a89aa8';c.lineWidth=2;for(const o of[-6,0,6]){c.beginPath();c.moveTo(x+o-3,y+8);c.lineTo(x+o,y+20);c.lineTo(x+o+3,y+8);c.closePath();c.fill();c.stroke();}targetMark(c,x,y+6,24);}}
    if(this.si>=3&&this.shot)drawItem(c,'bandage',P.x+34*s,P.y-44*s,.55);
    if(this.acc){const hy=P.y-88*s;if(this.acc==='ribbon')bow(c,P.x+30,hy-50,16,'#ff5fa2');else if(this.acc==='crown')drawItem(c,'crown',P.x,hy-70,1.4);else if(this.acc==='steth')MED.steth(c,P.x,P.y-60*s,1.1);}
    if(k==='weigh'&&this.w.opts){panel(c,40,H-180,W-80,160,24,'#fff','#ffb38a');txt(c,'なんキロ？',W/2,H-156,22,'#8a5a3a');this.w.opts.forEach((n,i)=>numBtn(c,W/2+(i-1)*150,H-84,44,n,['#ff8cc0','#5aa8ff','#ffb03a'][i]));}
    if(k==='nails')txt(c,`つめきり ${this.ncount} / 4`,W/2,H-120,30,'#ff8a3a');
    if(k==='dress'){tray(c,H-84,120);[['ribbon','リボン'],['crown','かんむり'],['steth','ちょうしんき']].forEach(([q,n],i)=>{const x=100+i*140;c.fillStyle=this.acc===q?'#fff0f7':'#fff';rr(c,x-60,H-120,120,72,18);c.fill();c.strokeStyle=this.acc===q?'#ff5fa2':'#ffc0dc';c.lineWidth=4;c.stroke();drawThing(c,q,x,H-92,.6);txt(c,n,x,H-62,15,'#ff5fa2');});drawBtn(c,W-70,H-84,40,'#5aa8ff','camera',!!this.acc);}
    if(this.photo>0){c.fillStyle=`rgba(255,255,255,${Math.max(0,1-this.photo*2)})`;c.fillRect(L,-OY/SC,R-L,H+OY/SC*2);if(this.photo>.4){c.strokeStyle='#fff';c.lineWidth=14;rr(c,P.x-180,P.y-330,360,380,10);c.stroke();}}
    if(this.tools.some(t=>!t.hidden)){tray(c,H-84,120);for(const t of this.tools)if(!t.held)t.draw(c,1.3);for(const t of this.tools)if(t.held)t.draw(c,1.5);const d=this.tools.find(t=>t.held);if(d&&k==='shot'){targetMark(c,P.x+34*s,P.y-44*s);if(this.prog>0)progRing(c,P.x+34*s,P.y-44*s,50,this.prog/1.1);}}
    fu(c,70,H-150,2.1,{point:!hp,cheer:hp});rk(this,c,W-60,H-150,1.5,{happy:hp});
    stepDots(c,this.steps.length,Math.max(0,this.si)+(this.fin>0?1:0));},
  down(x,y){if(this.ph==='pick'){this.pets.forEach((k,i)=>{const bx=110+i*190;if(Math.abs(x-bx)<82&&y>H*.36&&y<H*.36+230){this.k=k;this.ph='care';sfx('pop');hush();speak(`${WORDS[k][0]}ちゃん！`);speak(WORDS[k][1],'en');setTimeout(()=>{if(scene===this)this.startStep();},1400);}});return;}
    if(this.si<0||this.fin)return;const P=this.P(),s=this.s,k=this.key;
    if(k==='weigh'&&this.w.opts){this.w.opts.forEach((n,i)=>{if(hitC(x,y,W/2+(i-1)*150,H-84,50)){if(n===this.w.v){sfx('ding');sayNum(n,'',' キロ');this.happy=1;this.w.opts=[];this.next(2.2);}else{sfx('no');this.miss++;say('はりを よく みてね。 あかい はりの さきの かずだよ');}}});return;}
    if(k==='nails'){for(const n of this.nails){if(!n.cut&&hitC(x,y,P.x+n.a*s,P.y+n.b*s+6,40)){n.cut=1;this.ncount++;sfx('clip');burst(x,y,5,'dot');hush();speak(String(this.ncount));speak(numEn(this.ncount),'en');if(this.ncount>=4){say('ぜんぶ きれたね！ すっきり！');this.happy=1;this.next(1.6);}return;}}}
    if(k==='dress'){[['ribbon'],['crown'],['steth']].forEach(([q],i)=>{if(Math.abs(x-(100+i*140))<60&&Math.abs(y-(H-84))<36){this.acc=q;sfx('spark');this.happy=1;sayWord(q);}});if(this.acc&&hitC(x,y,W-70,H-84,46)&&!this.photo){this.photo=.01;sfx('shutter');confetti(60);say('はい チーズ！ かわいい〜！');}}
    for(const t of this.tools){if(t.hit(x,y)){const want={brush:'brush',shot:'syringe',treat:'bone'}[k];if(t.k!==want){sfx('no');this.miss++;const w=WORDS[t.k];hush();speak(`それは ${w[0]}`);speak(w[1],'en');card={k:t.k,ja:w[0],en:w[1],t:0};return;}t.held=true;t.lx=x;t.ly=y;sfx('tap');sayWord(t.k);return;}}
    if(hitC(x,y,P.x,P.y-80*s,100)){this.happy=.8;sfx('heart');burst(P.x,P.y-150,6,'heart');const k2=this.k;hush();speak(k2==='cat'?'にゃ〜ん':k2==='rabbit'?'ぴょん！':k2==='chick'?'ぴよぴよ':k2==='pig'?'ぶーぶー':k2==='panda'?'もぐもぐ':'わんわん！');}},
  move(x,y){const t=this.tools.find(q=>q.held);if(!t)return;const d=Math.hypot(x-t.lx,y-t.ly);t.x=x;t.y=y;t.lx=x;t.ly=y;const P=this.P();
    if(this.key==='brush'&&t.k==='brush'){for(const q of this.tangles){if(q.hp>0&&Math.hypot(P.x+q.a-(x-10),P.y+q.b-(y-24))<50){q.hp-=d/260;if(Math.random()<.2)sfx('brush');if(q.hp<=0){sfx('spark');burst(P.x+q.a,P.y+q.b,6,'star');}}}
      if(this.tangles.every(q=>q.hp<=0)&&!this.brushed){this.brushed=1;t.held=false;this.happy=1;say('さらさら ふわふわ！');this.next();}}},
  up(x,y){const t=this.tools.find(q=>q.held);if(!t)return;t.held=false;if(this.key==='shot'&&!this.shot)this.prog=0;
    if(this.key==='treat'&&t.k==='bone'&&Math.hypot(x-this.px,y-(this.py-72*this.s))<110&&!this.eat){this.eat=.01;t.hidden=true;say('もぐもぐ おいしい！');}},
  hint(){if(this.ph==='pick')return{x:110,y:H*.36+120};if(this.si<0||this.fin)return null;const P=this.P(),s=this.s,k=this.key;
    if(k==='weigh')return this.w.opts&&this.w.opts.length?{x:W/2+(this.w.opts.indexOf(this.w.v)-1)*150,y:H-84}:null;
    if(k==='nails'){const n=this.nails.find(q=>!q.cut);return n?{x:P.x+n.a*s,y:P.y+n.b*s+6}:null;}
    if(k==='dress')return this.acc?{x:W-70,y:H-84}:{x:100,y:H-84};
    const want={brush:'brush',shot:'syringe',treat:'bone'}[k];const t=this.tools.find(q=>q.k===want);if(!t||t.hidden)return null;
    if(k==='brush'){const q=this.tangles.find(q=>q.hp>0);return q?{x:t.hx,y:t.hy,x2:P.x+q.a+10,y2:P.y+q.b+24}:null;}
    if(k==='shot')return{x:t.hx,y:t.hy,x2:P.x+34*s,y2:P.y-44*s};return{x:t.hx,y:t.hy,x2:P.x,y2:P.y-72*s};},
  hintText(){return{weigh:'はりの さきの かずを えらんでね',brush:'ブラシで もじゃもじゃを とかそう',nails:'あしを タッチ',shot:'ちゅうしゃを うでに',treat:'おやつを おくちへ',dress:'おしゃれを えらんで カメラ'}[this.key]||'えらんでね';}};

// ================= どうぶつびょういん =================
const PETS=['dog','cat','rabbit','chick','pig','panda','mouse','sheep','fox'];
const PETFOOD={dog:'bone',cat:'fish',rabbit:'carrot',chick:'corn',pig:'apple',panda:'bamboo',mouse:'cheese',sheep:'broccoli',fox:'meat'};
const PETACC=[['ribbon','リボン'],['cap','ぼうし'],['glasses','めがね'],['flower','おはな'],['scarf','マフラー'],['bowtie','ちょうネクタイ'],['beanie','ニットぼう']];
SCN.pet={bg:'#fff4e8',song:'fuwa',
  enter(){this.ph='pick';this.pets=shuffle(PETS).slice(0,3);this.k=null;this.miss=0;this.fin=0;this.si=-1;this.happy=0;this.acc=null;this.accC=pick(['#ff5fa2','#5aa8ff','#ffb03a','#4cc86a']);this.photo=0;this.tools=[];this.lay();
    const extra=shuffle(['brush','nails','fleas','ears','bath']).slice(0,2+(lvOf('pet')>=1?1:0));this.steps=['weigh',...extra,...(Math.random()<.7?['shot']:[]),'treat','dress'];this.accOpts=shuffle(PETACC).slice(0,3);
    this.theme=pick([['#fff4e8','#f0dcc0','#ffe8d0'],['#f0f8ff','#d8e8f4','#e4f2ff'],['#f8fff0','#e0f0d0','#eef8e0']]);
    say('どうぶつびょういん！ きょうの かんじゃさんは だれ？ えらんでね');},
  lay(){this.px=W/2;this.py=H*.6;this.s=1.6;},
  P(){return{x:this.px,y:this.py};},
  earP(i){const s=this.s;return{x:this.px+(i?30:-30)*s,y:this.py-114*s};},
  startStep(){this.si++;const k=this.steps[this.si];this.key=k;this.tools=[];this.prog=0;this.flag=0;const lv=lvOf('pet');const nm=WORDS[this.k][0];
    if(k==='weigh'){this.w={v:1+Math.floor(Math.random()*(lv>=1?9:6)),t:0,opts:null};sfx('roll');say(`まずは ${nm}ちゃんの たいじゅうを はかろう。 はりが とまるまで みてね`);}
    if(k==='brush'){this.tangles=[...Array(4+Math.floor(Math.random()*4))].map(()=>({a:rand(-50,50),b:rand(-120,-30),hp:1}));this.tools=mkTray(trayChoices('brush',['brush','toothbrush','clipper','syringe','swab'],3),H-84);say('けが もじゃもじゃ。 ブラシで とかして あげよう。 ブラシは どれ？');}
    if(k==='nails'){this.nails=[[-18,-4],[18,-4],[-36,-34],[36,-34]].map(([a,b])=>({a,b,cut:0}));this.ncount=0;say('つめが のびてるね。 あしを タッチして つめを きろう');}
    if(k==='fleas'){this.fleas=[...Array(4+Math.floor(Math.random()*4))].map(()=>({a:rand(-50,50),b:rand(-140,-20),t:rand(0,2),jump:0,got:0}));this.fc=0;say('かゆい かゆい… ノミが いるよ！ ぴょんぴょん にげる ノミを タッチで つかまえよう！');}
    if(k==='ears'){this.earD=[3,3];this.tools=mkTray(trayChoices('swab',['swab','brush','clipper','spray'],3),H-84);say('おみみの おそうじを しよう。 めんぼうは どれ？');}
    if(k==='bath'){this.bub=0;this.rinse=0;this.dry=0;this.bph='soap';this.tools=mkTray(['sponge'],H-84);say('おふろで あわあわ！ スポンジで ごしごし しよう');}
    if(k==='shot'){this.tools=mkTray(trayChoices('syringe',['syringe','brush','steth','bottle'],3),H-84);say('びょうきに ならない よぼうちゅうしゃ。 ちゅうしゃは どれ？');}
    if(k==='treat'){this.eat=0;const f=PETFOOD[this.k];this.tools=mkTray(shuffle([f,...shuffle(Object.values(PETFOOD).filter(v=>v!==f)).slice(0,2)]),H-84);this.food=f;say(`がんばった ごほうび！ ${nm}ちゃんの すきな たべものは どれかな？`);}
    if(k==='dress')say('さいごに おしゃれして しゃしんを とろう！');},
  next(d=1.4){const k=this.key;this.tools.forEach(t=>t.hidden=true);setTimeout(()=>{if(scene!==this||this.key!==k)return;this.tools=[];if(this.si+1<this.steps.length){stepClear(pick(['OK！','ばっちり！','よしよし！']));this.startStep();}},d*1000);},
  update(dt){for(const t of this.tools)t.upd(dt);if(this.happy>0)this.happy-=dt;const P=this.P(),s=this.s;
    if(this.key==='weigh'){const w=this.w;w.t+=dt;if(w.t>2&&!w.opts){w.opts=shuffle([w.v,...shuffle([1,2,3,4,5,6,7,8,9].filter(v=>v!==w.v)).slice(0,2)]);say('なんキロ かな？ はりが さしている かずを えらんでね');}}
    if(this.key==='fleas')for(const f of this.fleas){if(f.got)continue;f.t+=dt;if(f.t>1.2+Math.random()*.02){f.t=0;f.jump=1;f.a=clamp(f.a+rand(-40,40),-55,55);f.b=clamp(f.b+rand(-40,40),-150,-15);}if(f.jump>0)f.jump-=dt*3;}
    const d=this.tools.find(t=>t.held);
    if(this.key==='shot'&&d&&d.k==='syringe'){if(Math.hypot(d.x-(P.x+34*s),d.y-(P.y-44*s))<80){this.prog+=dt;if(this.prog>1.1&&!this.flag){this.flag=1;d.held=false;good(P.x+34*s,P.y-44*s,2,'ちくっ！');this.happy=1;say('えらいね！ よく がまん できました');this.next(1.8);}}}
    if(this.key==='treat'&&this.eat>0){this.eat+=dt;if(Math.random()<dt*4)sfx('munch');if(this.eat>1.6){this.eat=0;this.happy=1.5;sfx('heart');burst(P.x,P.y-180,10,'heart');this.next(.8);}}
    if(this.key==='bath'&&this.bph==='dry'){this.dry+=dt;if(Math.random()<dt*30)parts.push({x:P.x+rand(-60,60),y:P.y-rand(40,140),vx:rand(-300,300),vy:rand(-200,50),life:.6,t:0,kind:'drop',col:'#8ad0ff'});if(this.dry>1.4&&!this.flag){this.flag=1;good(P.x,P.y-100,2,'ブルブル〜！');this.happy=1.5;say('ブルブルって したら ふわふわ！');this.next(1.6);}}
    if(this.photo>0){this.photo+=dt;if(this.photo>2.6&&!this.fin)this.fin=.01;}if(this.fin>0){this.fin+=dt;if(this.fin>.5&&this.fin<9){this.fin=9;celebrate('pet',starsFor(this.miss));}}},
  draw(c){const L=-OX/SC-2,R=W+OX/SC+2,th=this.theme;roomBg(c,th[0],th[1],H*.5,th[2],[['window',100,H*.5-200,1,120,100],['plant',W-40,H*.5,.8],['frame',W/2+60,H*.5-230,1,'dog']]);
    if(this.ph==='pick'){txtO(c,'だれを みてあげる？',W/2,230,36,'#ff8a3a','#fff',8);this.pets.forEach((k,i)=>{const x=110+i*190,y=H*.36;panel(c,x-82,y,164,230,24,'#fff','#ffb38a');drawAnimal(c,k,x,y+200,.85,{t:T+i,sad:1,shake:Math.sin(T*2+i)>.9?.1:0});txt(c,WORDS[k][0],x,y+30,24,'#8a5a3a');txt(c,WORDS[k][1],x,y+54,16,'#3a88e8');});fu(c,90,H-40,2.4,{wave:1});rk(this,c,W-80,H-40,1.8);return;}
    const P=this.P(),s=this.s,k=this.key;
    if(k==='weigh'){c.fillStyle=gfill(c,P.x,P.y,120,'#e8eef8');rr(c,P.x-120,P.y-6,240,34,12);c.fill();c.strokeStyle='#9aa8c8';c.lineWidth=4;c.stroke();
      const dx=W-120,dy=250,w=this.w,ang=Math.PI+Math.min(1,w.t/1.6)*(w.v/10)*Math.PI+(w.t<1.6?Math.sin(w.t*18)*.05:0);panel(c,dx-110,dy-100,220,140,20,'#fff','#9aa8c8');for(let i=0;i<=10;i++){const a=Math.PI+i/10*Math.PI;c.strokeStyle='#8a98b8';c.lineWidth=i%5?2:4;c.beginPath();c.moveTo(dx+Math.cos(a)*78,dy+Math.sin(a)*78+20);c.lineTo(dx+Math.cos(a)*90,dy+Math.sin(a)*90+20);c.stroke();txt(c,String(i),dx+Math.cos(a)*62,dy+Math.sin(a)*62+20,i===w.v&&w.opts?22:16,i===w.v&&w.opts?'#ff4d6d':'#6a7a9a');}
      c.strokeStyle='#ff4d6d';c.lineWidth=5;c.beginPath();c.moveTo(dx,dy+20);c.lineTo(dx+Math.cos(ang)*84,dy+20+Math.sin(ang)*84);c.stroke();c.fillStyle='#ff4d6d';circ(c,dx,dy+20,8);txt(c,'kg',dx,dy+2,16,'#8a98b8');}
    if(k==='bath'){c.fillStyle=vfill(c,P.y-60,P.y+40,'#bfe8ff',.2,-.05);rr(c,P.x-190,P.y-60,380,90,[10,10,44,44]);c.fill();c.strokeStyle='#8ac0e8';c.lineWidth=5;c.stroke();}
    const hp=this.happy>0;const itch=k==='fleas'&&this.fleas.some(f=>!f.got);
    drawAnimal(c,this.k,P.x,P.y,s,{t:T,happy:hp||k==='dress',eat:this.eat>0?1:0,sad:(k==='shot'&&!this.flag)||itch,hop:hp?this.happy*.5:0,shake:(k==='bath'&&this.bph==='dry'&&!this.flag)?.3:itch&&Math.sin(T*5)>.7?.2:0,acc:this.acc,accC:this.accC,look:LOOK.on?clamp((LOOK.x-P.x)/200,-1,1):0});
    if(k==='brush')for(const q of this.tangles){if(q.hp<=0)continue;c.globalAlpha=q.hp;c.strokeStyle='#8a6a4a';c.lineWidth=3;c.beginPath();for(let i=0;i<14;i++){const a=i*1.3;c.lineTo(P.x+q.a+Math.cos(a)*(6+i),P.y+q.b+Math.sin(a*1.1)*(5+i*.6));}c.stroke();c.globalAlpha=1;}
    if(k==='nails')for(const n of this.nails){const x=P.x+n.a*s,y=P.y+n.b*s;if(!n.cut){c.fillStyle='#fff';c.strokeStyle='#a89aa8';c.lineWidth=2;for(const o of[-6,0,6]){c.beginPath();c.moveTo(x+o-3,y+8);c.lineTo(x+o,y+20);c.lineTo(x+o+3,y+8);c.closePath();c.fill();c.stroke();}targetMark(c,x,y+6,24);}}
    if(k==='fleas'){for(const f of this.fleas){if(f.got)continue;const hop=f.jump>0?Math.sin(f.jump*Math.PI)*24:0;MED.flea(c,P.x+f.a,P.y+f.b-hop,.9);}txt(c,`ノミ ${this.fc} / ${this.fleas.length}`,W/2,H-120,30,'#ff8a3a');if(Math.sin(T*2)>.6)txtO(c,'かゆい〜',P.x+130,P.y-220,24,'#c86a8a','#fff',6);}
    if(k==='ears')for(let i=0;i<2;i++){const e=this.earP(i);if(this.earD[i]>0){c.fillStyle='#b8905a';for(let j=0;j<this.earD[i];j++)circ(c,e.x+Math.cos(j*2)*8,e.y+Math.sin(j*2)*6,5);targetMark(c,e.x,e.y,30);}}
    if(k==='bath'){for(let i=0;i<this.bub;i++){const a=i*2.4;c.fillStyle='rgba(255,255,255,.92)';c.strokeStyle='rgba(150,200,255,.8)';c.lineWidth=2;c.beginPath();c.arc(P.x+Math.cos(a)*(20+i%5*10),P.y-70-Math.sin(a*1.3)*(40+i%4*14),10+i%3*4,0,TAU);c.fill();c.stroke();}c.fillStyle='rgba(255,255,255,.9)';txt(c,{soap:`あわあわ ${Math.min(this.bub,20)} / 20`,rinse:'シャワーで ながそう',dry:'ブルブル〜'}[this.bph],W/2,H-150,26,'#3a88e8');}
    if(this.si>=0&&this.steps.indexOf('shot')>=0&&this.si>this.steps.indexOf('shot'))drawItem(c,'bandage',P.x+34*s,P.y-44*s,.55);
    if(k==='weigh'&&this.w.opts&&this.w.opts.length){panel(c,40,H-180,W-80,160,24,'#fff','#ffb38a');txt(c,'なんキロ？',W/2,H-156,22,'#8a5a3a');this.w.opts.forEach((n,i)=>numBtn(c,W/2+(i-1)*150,H-84,44,n,['#ff8cc0','#5aa8ff','#ffb03a'][i]));}
    if(k==='nails')txt(c,`つめきり ${this.ncount} / 4`,W/2,H-120,30,'#ff8a3a');
    if(k==='dress'){tray(c,H-84,120);this.accOpts.forEach(([q,n],i)=>{const x=110+i*140;c.fillStyle=this.acc===q?'#fff0f7':'#fff';rr(c,x-60,H-120,120,72,18);c.fill();c.strokeStyle=this.acc===q?'#ff5fa2':'#ffc0dc';c.lineWidth=4;c.stroke();txt(c,n,x,H-84,17,'#ff5fa2');});drawBtn(c,W-64,H-84,40,'#5aa8ff','camera',!!this.acc);}
    if(this.photo>0){c.fillStyle=`rgba(255,255,255,${Math.max(0,1-this.photo*2)})`;c.fillRect(L,-OY/SC,R-L,H+OY/SC*2);if(this.photo>.4){c.strokeStyle='#fff';c.lineWidth=14;rr(c,P.x-230,P.y-330,460,400,10);c.stroke();txtO(c,'はい チーズ！',W/2,P.y-350,34,'#ff5fa2','#fff',8);}}
    if(this.tools.some(t=>!t.hidden)){tray(c,H-84,120);for(const t of this.tools)if(!t.held)t.draw(c,1.3);for(const t of this.tools)if(t.held)t.draw(c,1.5);const d=this.tools.find(t=>t.held);if(d&&k==='shot'){targetMark(c,P.x+34*s,P.y-44*s);if(this.prog>0)progRing(c,P.x+34*s,P.y-44*s,50,this.prog/1.1);}}
    const photoPose=this.photo>.4;fu(c,photoPose?P.x-160:70,photoPose?P.y+40:H-150,2.1,{point:!hp&&!photoPose,cheer:photoPose});rk(this,c,photoPose?P.x+160:W-60,photoPose?P.y+40:H-150,1.5,{still:photoPose,clap:photoPose?1:0});
    stepDots(c,this.steps.length,Math.max(0,this.si)+(this.fin>0?1:0));},
  down(x,y){if(this.ph==='pick'){this.pets.forEach((k,i)=>{const bx=110+i*190;if(Math.abs(x-bx)<82&&y>H*.36&&y<H*.36+230){this.k=k;this.ph='care';sfx('pop');hush();speak(`${WORDS[k][0]}ちゃん！`);speak(WORDS[k][1],'en');setTimeout(()=>{if(scene===this)this.startStep();},1400);}});return;}
    if(this.si<0||this.fin)return;const P=this.P(),s=this.s,k=this.key;
    if(k==='weigh'&&this.w.opts){this.w.opts.forEach((n,i)=>{if(hitC(x,y,W/2+(i-1)*150,H-84,50)){if(n===this.w.v){good(W/2+(i-1)*150,H-84,2);sayNum(n,'',' キロ');this.happy=1;this.w.opts=[];this.next(2.2);}else{bad();this.miss++;say('はりを よく みてね。 あかい はりの さきの かずだよ');}}});return;}
    if(k==='nails'){for(const n of this.nails){if(!n.cut&&hitC(x,y,P.x+n.a*s,P.y+n.b*s+6,40)){n.cut=1;this.ncount++;sfx('clip');good(x,y,1,'パチン');hush();speak(String(this.ncount));speak(numEn(this.ncount),'en');if(this.ncount>=4){say('ぜんぶ きれたね！ すっきり！');this.happy=1;this.next(1.6);}return;}}}
    if(k==='fleas'){for(const f of this.fleas){if(f.got)continue;const fx=P.x+f.a,fy=P.y+f.b;if(Math.hypot(x-fx,y-fy)<42){if(Math.random()<.2&&this.fc<this.fleas.length-1){f.t=1.3;sfx('boing');say('にげた！');return;}f.got=1;this.fc++;good(fx,fy,1,'つかまえた！');hush();speak(String(this.fc),'en');if(this.fc>=this.fleas.length){this.happy=1.5;say('ノミ ぜんぶ つかまえた！ かゆくない！');this.next(1.6);}return;}}}
    if(k==='dress'){this.accOpts.forEach(([q,n],i)=>{if(Math.abs(x-(110+i*140))<60&&Math.abs(y-(H-84))<36){this.acc=q;sfx('spark');this.happy=1;burst(P.x,P.y-200,8,'heart');hush();speak(n);}});if(this.acc&&hitC(x,y,W-64,H-84,46)&&!this.photo){this.photo=.01;sfx('shutter');confetti(70);good(P.x,P.y-150,3,'はい チーズ！');}}
    for(const t of this.tools){if(t.hit(x,y)){const want={brush:'brush',shot:'syringe',treat:this.food,ears:'swab',bath:this.bph==='rinse'?'shower':'sponge'}[k];if(t.k!==want){this.miss++;if(k==='treat'){bad();hush();speak(`${WORDS[this.k][0]}ちゃんは ${WORDS[t.k][0]}より ほかの ものが すきみたい`);}else wrongTool(t);return;}t.held=true;t.lx=x;t.ly=y;sfx('tap');sayWord(t.k);return;}}
    if(hitC(x,y,P.x,P.y-80*s,100)){this.happy=.8;sfx('heart');burst(P.x,P.y-150,6,'heart');const k2=this.k;hush();speak({cat:'にゃ〜ん',rabbit:'ぴょん！',chick:'ぴよぴよ',pig:'ぶーぶー',panda:'もぐもぐ',mouse:'ちゅうちゅう',sheep:'めえ〜',fox:'こんこん',dog:'わんわん！'}[k2]||'わーい');}},
  move(x,y){const t=this.tools.find(q=>q.held);if(!t)return;const d=Math.hypot(x-t.lx,y-t.ly);t.x=x;t.y=y;t.lx=x;t.ly=y;const P=this.P();
    if(this.key==='brush'&&t.k==='brush'){for(const q of this.tangles){if(q.hp>0&&Math.hypot(P.x+q.a-(x-10),P.y+q.b-(y-24))<50){q.hp-=d/260;if(Math.random()<.2)sfx('brush');if(q.hp<=0)good(P.x+q.a,P.y+q.b,1,'さらさら');}}
      if(this.tangles.every(q=>q.hp<=0)&&!this.flag){this.flag=1;t.held=false;this.happy=1;say('さらさら ふわふわ！');this.next();}}
    if(this.key==='ears'&&t.k==='swab'){for(let i=0;i<2;i++){const e=this.earP(i);if(this.earD[i]>0&&Math.hypot(x-e.x,y-20-e.y)<50&&d>2){this.prog+=d;if(this.prog>70){this.prog=0;this.earD[i]--;sfx('squish');if(this.earD[i]===0)good(e.x,e.y,1,i?'みぎ OK':'ひだり OK');}}}
      if(this.earD.every(v=>v===0)&&!this.flag){this.flag=1;t.held=false;this.happy=1;say('おみみ すっきり！ よく きこえる！');this.next();}}
    if(this.key==='bath'){if(this.bph==='soap'&&t.k==='sponge'&&Math.hypot(x-P.x,y-(P.y-80))<140&&d>3){this.prog+=d;if(this.prog>40){this.prog=0;this.bub++;sfx('squish');bubbles(x,y,2);if(this.bub>=20){this.bph='rinse';t.held=false;good(P.x,P.y-100,1,'あわあわ！');this.tools=mkTray(['shower'],H-84);say('シャワーで あわを ながそう');}}}
      else if(this.bph==='rinse'&&t.k==='shower'){if(Math.random()<.6)parts.push({x,y,vx:rand(-30,30),vy:220,life:.5,t:0,kind:'drop',col:'#8ad0ff'});if(Math.hypot(x-P.x,y-(P.y-120))<160&&d>2){this.prog+=d;if(this.prog>50){this.prog=0;this.bub=Math.max(0,this.bub-2);sfx('water');if(this.bub===0){this.bph='dry';t.held=false;this.tools=[];this.flag=0;say('ぬれちゃった！');}}}}}},
  up(x,y){const t=this.tools.find(q=>q.held);if(!t)return;t.held=false;if(this.key==='shot'&&!this.flag)this.prog=0;
    if(this.key==='treat'&&t.k===this.food&&Math.hypot(x-this.px,y-(this.py-72*this.s))<110&&!this.eat){this.eat=.01;t.hidden=true;good(this.px,this.py-120,2,'だいすき！');say('もぐもぐ おいしい！');}},
  hint(){if(this.ph==='pick')return{x:110,y:H*.36+120};if(this.si<0||this.fin)return null;const P=this.P(),s=this.s,k=this.key;
    if(k==='weigh')return this.w.opts&&this.w.opts.length?{x:W/2+(this.w.opts.indexOf(this.w.v)-1)*150,y:H-84}:null;
    if(k==='nails'){const n=this.nails.find(q=>!q.cut);return n?{x:P.x+n.a*s,y:P.y+n.b*s+6}:null;}
    if(k==='fleas'){const f=this.fleas.find(q=>!q.got);return f?{x:P.x+f.a,y:P.y+f.b}:null;}
    if(k==='dress')return this.acc?{x:W-64,y:H-84}:{x:110,y:H-84};
    const want={brush:'brush',shot:'syringe',treat:this.food,ears:'swab',bath:this.bph==='rinse'?'shower':'sponge'}[k];const t=this.tools.find(q=>q.k===want);if(!t||t.hidden)return null;
    if(k==='brush'){const q=this.tangles.find(q=>q.hp>0);return q?{x:t.hx,y:t.hy,x2:P.x+q.a+10,y2:P.y+q.b+24}:null;}
    if(k==='ears'){const i=this.earD[0]>0?0:1;const e=this.earP(i);return{x:t.hx,y:t.hy,x2:e.x,y2:e.y+20};}
    if(k==='bath')return{x:t.hx,y:t.hy,x2:P.x+rand(-40,40),y2:P.y-80+rand(-30,30)};
    if(k==='shot')return{x:t.hx,y:t.hy,x2:P.x+34*s,y2:P.y-44*s};return{x:t.hx,y:t.hy,x2:P.x,y2:P.y-72*s};},
  hintText(){return{weigh:'はりの さきの かずを えらんでね',brush:'ブラシで もじゃもじゃを とかそう',nails:'あしを タッチ',fleas:'ノミを タッチ',ears:'めんぼうで おみみを こしこし',bath:'スポンジで あわあわ',shot:'ちゅうしゃを うでに',treat:'すきな たべものを おくちへ',dress:'おしゃれを えらんで カメラ'}[this.key]||'えらんでね';}};

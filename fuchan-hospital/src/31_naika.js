// ================= しんさつしつ（ないか） =================
const DISEASE={
  cold:{intro:'おねつと せきが でるみたい',steps:['thermo','ice','steth','medicine'],fever:1},
  throat:{intro:'のどが いたいみたい',steps:['light','spray','steth','medicine']},
  tummy:{intro:'おなかが いたいみたい',steps:['palp','hot','steth','medicine'],tummy:1},
  vaccine:{intro:'きょうは よぼうちゅうしゃの ひ！ ちょっと こわいな',steps:['steth','shot']},
};
const NSTEP={
  thermo:{tool:'thermometer',q:'おねつを はかる どうぐは どれ？',act:'hold',tg:'arm2',need:1.8},
  ice:{tool:'icepack',q:'おでこを ひやす ものは どれ？',act:'drop',tg:'head'},
  steth:{tool:'steth',q:'しんぞうの おとを きく どうぐは どれ？',act:'hold',tg:'chest',need:.5},
  light:{tool:'light',q:'おくちの なかを てらす どうぐは どれ？',act:'drop',tg:'mouth'},
  spray:{tool:'spray',q:'のどの ばいきんを やっつける ものは どれ？',act:'rub',tg:'mouth'},
  palp:{tool:null,q:'おなかの どこが いたいかな？ やさしく タッチしてみよう',act:'palp',tg:'tummy'},
  hot:{tool:'hotpack',q:'おなかを あたためる ものは どれ？',act:'drop',tg:'tummy'},
  shot:{tool:'syringe',q:'ちゅうしゃは どれ？',act:'hold',tg:'arm',need:1.2},
  medicine:{tool:'bottle',q:'おくすりは どれ？',act:'drop',tg:'mouth'},
};
const NPOOL=['thermometer','icepack','steth','light','spray','hotpack','syringe','bottle','toothbrush','bandage'];
SCN.naika={bg:'#e8f6ff',song:'clinic',
  enter(){const lv=lvOf('naika');const ds=shuffle(lv>=1?['cold','throat','tummy','vaccine']:['cold','throat','tummy']).slice(0,3);this.queue=ds;this.pi=0;this.miss=0;this.fin=0;this.lay();this.newPatient();},
  lay(){this.px=340;this.py=H*.6;this.s=1.75;if(this.tools)this.tools.forEach(t=>{t.hy=H-84;});},
  newPatient(){const d=this.queue[this.pi];this.D=DISEASE[d];this.p={k:pick(ANK.filter(k=>k!=='chick')),x:W+160,walk:1,leave:0,hop:0,shake:0,ice:0,hot:0,open:0,eat:0,cured:0,band:0,germs:[],temp:0,tv:36};this.si=-1;this.tools=[];
    setTimeout(()=>{if(scene===this){say(`${WORDS[this.p.k][0]}さん、 ${this.D.intro}`);}},700);},
  startStep(){this.si++;const key=this.D.steps[this.si];this.st=NSTEP[key];this.key=key;this.prog=0;this.sub=null;
    if(this.st.tool){this.tools=mkTray(trayChoices(this.st.tool,NPOOL),H-84);}else this.tools=[];
    if(key==='palp'){const P=this.P();this.spots=shuffle([-1,0,1]).map((d,i)=>({x:d*46,y:-20+(d===0?-14:8),sore:i===0,done:0}));}
    if(key==='spray'){this.p.open=1;this.p.germs=[...Array(3)].map((_,i)=>({a:(i-1)*16,b:rand(-4,6),alive:1,ph:rand(0,6)}));}
    if(key==='medicine')this.med=null;
    setTimeout(()=>{if(scene===this&&this.key===key)say(this.st.q);},key==='steth'&&this.si===0?2600:400);},
  P(){return{x:this.p.x,y:this.py};},
  tg(name){const p=this.p,s=this.s,y=this.py;switch(name){case'head':return{x:p.x,y:y-112*s};case'mouth':return{x:p.x,y:y-72*s};case'chest':return{x:p.x,y:y-38*s};case'tummy':return{x:p.x,y:y-26*s};case'arm':return{x:p.x+34*s,y:y-44*s};case'arm2':return{x:p.x-36*s,y:y-40*s};}},
  update(dt){const p=this.p;for(const t of this.tools)t.upd(dt);if(p.hop>0)p.hop-=dt*2;if(p.shake>0)p.shake-=dt;
    if(p.walk&&!p.leave){p.x+=Math.sign(this.px-p.x)*Math.min(Math.abs(this.px-p.x),300*dt);if(Math.abs(p.x-this.px)<1){p.walk=0;setTimeout(()=>{if(scene===this&&this.si<0)this.startStep();},1600);}}
    if(p.leave){p.x-=320*dt;if(p.x<-180){this.pi++;if(this.pi>=this.queue.length){if(!this.fin){this.fin=.01;}}else this.newPatient();}}
    if(this.fin>0){this.fin+=dt;if(this.fin>.8&&this.fin<9){this.fin=9;celebrate('naika',starsFor(this.miss));}}
    if(this.si<0||p.cured)return;const st=this.st,key=this.key,d=this.tools.find(t=>t.held);
    if(st.act==='hold'&&d&&!this.sub){const g=this.tg(st.tg);const near=Math.hypot(d.x-g.x,d.y-g.y)<80;if(near){this.prog+=dt;
        if(key==='thermo'){p.temp=Math.min(1,this.prog/st.need);if(Math.random()<dt*6)sfx('tick');}
        if(key==='shot'&&this.prog<.1){p.shake=.4;}
        if(this.prog>=st.need)this.holdDone(key);}}
    if(key==='spray'&&d){let hit=0;for(const g of p.germs){if(!g.alive)continue;const m=this.tg('mouth');const gx=m.x+g.a*this.s,gy=m.y+g.b*this.s;if(Math.random()<dt*20)parts.push({x:d.x-24,y:d.y-24,vx:rand(-140,-60),vy:rand(-10,50),life:.5,t:0,kind:'puff',col:'#d8f0ff',r:6});if(Math.hypot(d.x-30-gx,d.y-30-gy)<70){g.alive=0;hit=1;sfx('pop');burst(gx,gy,10,'dot');}}
      if(hit&&p.germs.every(g=>!g.alive)){say('ばいきん やっつけた！ のどが すっきり！');sfx('ding');this.tools.forEach(t=>t.held=false);p.open=0;this.next(1.4);}}
    if(this.sub&&this.sub.type==='beats'){const b=this.sub;b.t+=dt;if(b.i<b.n&&b.t>.7+b.i*.72){b.i++;sfx('dokkun');b.pop=1;const c=this.tg('chest');burst(c.x,c.y,4,'heart');}if(b.pop>0)b.pop-=dt*3;if(b.i>=b.n&&!b.asked&&b.t>.8+b.n*.72){b.asked=1;const opts=shuffle([b.n,...shuffle([2,3,4,5,6].filter(v=>v!==b.n)).slice(0,2)]);b.opts=opts;say('どっくん どっくん。 なんかい きこえたかな？');}}
    if(this.med&&this.med.give){this.med.give+=dt;if(this.med.give>1.6&&!p.cured)this.cure();}},
  holdDone(key){const p=this.p;this.tools.forEach(t=>t.held=false);
    if(key==='thermo'){const tv=this.D.fever?38.5:36.5;p.tv=tv;p.temp=1;if(this.D.fever){hush();speak('38.5ど！ おねつが あるね');speak('thirty-eight point five','en');bub={text:'38.5ど！ おねつが あるね',t:0,life:3};}else say('36.5ど。 おねつは ないね');sfx('beep');this.next(2.4);}
    else if(key==='steth'){this.tools=[];const lv=lvOf('naika');this.sub={type:'beats',n:2+Math.floor(Math.random()*(lv>=2?5:3)),i:0,t:0,pop:0};say('しーっ！ しんぞうの おとを よく きいてね');}
    else if(key==='shot'){p.band=1;p.hop=1;sfx('ding');say('ちくっ！ よく がんばったね！ ばんそうこうを はったよ');burst(this.tg('arm').x,this.tg('arm').y,12,'star');this.next(2);}},
  next(delay){const key=this.key;this.tools.forEach(t=>t.hidden=true);setTimeout(()=>{if(scene!==this||this.key!==key)return;this.tools=[];if(this.si+1>=this.D.steps.length)this.cure();else this.startStep();},delay*1000);},
  cure(){const p=this.p;if(p.cured)return;p.cured=1;p.ice=0;p.hot=0;p.open=0;p.temp=0;this.tools=[];sfx('fanfare');RK.clap=1.5;burst(p.x,this.py-150,20,'heart');say(pick(['げんきに なった！ ありがとう せんせい！','よくなったよ！ ありがとう！','すっかり げんき！ ありがとう！']));
    setTimeout(()=>{if(scene===this){p.leave=1;this.si=-1;}},2400);},
  drop(t,x,y){const st=this.st,key=this.key,p=this.p;const g=this.tg(st.tg);if(Math.hypot(x-g.x,y-g.y)>110)return;
    if(key==='ice'){p.ice=1;sfx('ding');say('ひんやり きもちいい〜');this.next(1.6);}
    else if(key==='light'){p.open=1;sfx('ding');say('あーん！ のどが あかくなって ばいきんが いるね');this.next(2);}
    else if(key==='hot'){p.hot=1;sfx('ding');say('ぽかぽか あったかい〜');this.next(1.6);}
    else if(key==='medicine'){const lv=lvOf('naika');this.med={n:1+Math.floor(Math.random()*(lv>=1?4:3)),have:0,give:0};this.tools=[];hush();speak(`おくすりを ${this.med.n}こ コップに いれてね`);speak(`${numEn(this.med.n)}`,'en');bub={text:`おくすりを ${this.med.n}こ コップに いれてね`,t:0,life:3.4};}},
  draw(c){const p=this.p,s=this.s,py=this.py;roomBg(c,'#e6f4ff','#cfe8d8',py-40,'#f0f8ff');
    // eye chart & window
    c.fillStyle='#fff';rr(c,440,150,120,160,10);c.fill();c.strokeStyle='#9ac8e8';c.lineWidth=4;c.stroke();[.7,.55,.42,.32,.24].forEach((r,i)=>{const n=i<2?2:3;for(let j=0;j<n;j++)MED.landolt(c,500+(j-(n-1)/2)*(i<2?50:34),178+i*28-(i>2?(i-2)*4:0),r,{a:[0,1.57,3.14,4.71][(i*2+j)%4]});});
    c.fillStyle='#fff';rr(c,this.px-120,py-10,240,22,10);c.fill();c.fillStyle='#9ab8d8';c.fillRect(this.px-8,py+12,16,60);c.fillStyle='#bfd8f0';rr(c,this.px-60,py+66,120,14,7);c.fill();
    const D=this.D;const sick=!p.cured&&this.pi<this.queue.length;const st={t:T,hop:p.walk||p.leave?Math.abs(Math.sin(T*7))*.5:p.hop,sick:sick&&D.fever&&p.ice===0,sad:sick&&!p.walk&&this.key!=='shot'&&!(this.sub&&this.sub.type==='beats'),happy:p.cured||(this.key==='shot'&&p.band),tummy:sick&&D.tummy&&!p.hot&&!p.walk,open:p.open,eat:this.med&&this.med.give>0?1:0,shake:p.shake};
    drawAnimal(c,p.k,p.x,py,s,st);
    const h=this.tg('head'),m=this.tg('mouth');
    if(st.sick){c.strokeStyle='rgba(255,90,90,.8)';c.lineWidth=4;for(let i=0;i<3;i++){c.beginPath();const bx=h.x-30+i*30,by=h.y-60-Math.sin(T*4+i)*6;c.moveTo(bx,by);c.bezierCurveTo(bx-10,by-12,bx+10,by-22,bx,by-34);c.stroke();}c.fillStyle='#8ad0ff';ell(c,h.x+58,h.y+10+Math.sin(T*3)*4,7,11);}
    if(sick&&D.fever&&!p.walk&&Math.sin(T*1.3)>.85)txtO(c,'ごほっ',m.x-110,m.y-20,26,'#8a7aa8','#fff',6);
    if(p.ice)drawItem(c,'icepack',h.x,h.y-30,1.1);if(p.hot)MED.hotpack(c,this.tg('tummy').x,this.tg('tummy').y,.9);if(p.band)drawItem(c,'bandage',this.tg('arm').x,this.tg('arm').y,.6);
    if(p.open&&!p.cured){c.fillStyle='#e8506a';ell(c,m.x,m.y+6,18,15);for(const g of p.germs){if(!g.alive)continue;MED.germ(c,m.x+g.a*s+Math.sin(T*3+g.ph)*3,m.y+g.b*s+6,.42);}}
    if(this.key==='palp'&&this.spots&&!p.cured){const t=this.tg('tummy');for(const sp of this.spots){if(sp.done)continue;c.fillStyle=`rgba(255,200,230,${.5+Math.sin(T*5)*.2})`;circ(c,t.x+sp.x,t.y+sp.y,20);c.strokeStyle='#ff8cc0';c.lineWidth=3;c.beginPath();c.arc(t.x+sp.x,t.y+sp.y,20,0,TAU);c.stroke();}}
    // thermometer readout
    if(this.key==='thermo'&&p.temp>0){const v=(35.5+p.temp*(p.tv>37?3:1)).toFixed(1);panel(c,p.x+80,py-280,140,62,18,'#fff','#ff4d6d',4);txt(c,v+'°',p.x+150,py-249,34,'#ff4d6d');}
    // beats quiz
    const b=this.sub;if(b&&b.type==='beats'){const ch=this.tg('chest');if(b.pop>0){c.globalAlpha=b.pop;MED.love(c,ch.x,ch.y-150,1+(1-b.pop)*.6);c.globalAlpha=1;}for(let i=0;i<b.i;i++)MED.love(c,W/2-(b.n-1)*30+i*60,300,.55);
      if(b.opts){panel(c,40,H-170,W-80,150,24,'#fff','#ffb3d6');txt(c,'どっくん なんかい？',W/2,H-146,22,'#8a5a9a');b.opts.forEach((n,i)=>numBtn(c,W/2+(i-1)*150,H-78,44,n,['#ff8cc0','#5aa8ff','#ffb03a'][i]));}}
    // medicine counting
    const md=this.med;if(md){panel(c,40,H-240,W-80,220,24,'#fff','#a878ff');txt(c,`おくすり ${md.n}こ`,W/2,H-214,26,'#7a4ad8');MED.bottle(c,150,H-110,1.5);
      c.fillStyle='rgba(200,230,255,.8)';c.strokeStyle='#8ab0d8';c.lineWidth=4;c.beginPath();c.moveTo(300,H-170);c.lineTo(420,H-170);c.lineTo(405,H-60);c.lineTo(315,H-60);c.closePath();c.fill();c.stroke();
      for(let i=0;i<md.have;i++)MED.pill(c,330+(i%3)*30,H-80-Math.floor(i/3)*26,.7,{col:['#ff4d6d','#4a9cff','#ffd23a','#4cc86a','#ff8cc8','#a878ff'][i%6]});txt(c,String(md.have),360,H-196,30,'#ff5fa2');
      if(!md.give)drawBtn(c,500,H-110,44,'#4cc86a','check',md.have===md.n);txt(c,'タップで だす',150,H-40,16,'#a07aa8');}
    fu(c,86,py+130,2.5,{point:!p.cured&&this.si>=0,cheer:p.cured});rk(this,c,W-60,py+150,1.6,{happy:p.cured});
    if(this.si>=0&&!p.cured&&this.st.tool&&this.tools.length){const g=this.tg(this.st.tg);if(this.tools.some(t=>t.held&&t.k===this.st.tool))targetMark(c,g.x,g.y);tray(c,H-84,120);for(const t of this.tools)if(!t.held)t.draw(c,1.2);for(const t of this.tools)if(t.held)t.draw(c,1.4);
      const d=this.tools.find(t=>t.held);if(d&&this.st.act==='hold'&&this.prog>0)progRing(c,g.x,g.y,54,this.prog/this.st.need);}
    if(this.key==='palp'&&!p.cured)txt(c,'おなかを タッチ',W/2,H-60,26,'#ff5fa2');
    stepDots(c,this.D.steps.length,Math.max(0,this.si)+(p.cured?1:0));
    txt(c,`かんじゃさん ${Math.min(this.pi+1,this.queue.length)} / ${this.queue.length}`,W/2+30,160,18,'#5a88c8');},
  down(x,y){const p=this.p;if(p.cured||this.si<0)return;
    const b=this.sub;if(b&&b.type==='beats'){if(b.opts){b.opts.forEach((n,i)=>{if(hitC(x,y,W/2+(i-1)*150,H-78,50)){if(n===b.n){sfx('ding');sayNum(n,'',' かい');this.sub=null;this.next(2);}else{sfx('no');this.miss++;say('もういちど よく きいてみよう');this.sub={type:'beats',n:b.n,i:0,t:-.6,pop:0};}}});}return;}
    const md=this.med;if(md){if(md.give)return;if(hitC(x,y,150,H-110,70)){if(md.have>=8){sfx('no');return;}md.have++;sfx('pop');hush();speak(String(md.have));speak(numEn(md.have),'en');}
      else if(x>290&&x<430&&y>H-180&&y<H-50&&md.have>0){md.have--;sfx('tap');}
      else if(hitC(x,y,500,H-110,50)){if(md.have===md.n){md.give=.01;sfx('munch');say(`${md.n}こ ぴったり！ ごっくん！`);}else{sfx('no');this.miss++;say(md.have>md.n?`おおいよ！ ${md.n}こだよ。 コップを タッチすると もどせるよ`:`たりないよ！ ${md.n}こだよ`);}}return;}
    if(this.key==='palp'){const t=this.tg('tummy');for(const sp of this.spots){if(sp.done)continue;if(hitC(x,y,t.x+sp.x,t.y+sp.y,32)){sp.done=1;if(sp.sore){p.shake=.6;sfx('boing');say('いたたた！ そこが いたいの');this.next(1.8);}else{sfx('tap');say('そこは だいじょうぶ');}return;}}return;}
    for(const t of this.tools){if(t.hit(x,y)){if(t.k!==this.st.tool){sfx('no');this.miss++;t.s=1.3;hush();const w=WORDS[t.k];speak(`それは ${w[0]}`);speak(w[1],'en');card={k:t.k,ja:w[0],en:w[1],t:0};return;}t.held=true;t.lx=x;t.ly=y;sfx('tap');sayWord(t.k);return;}}
    if(hitC(x,y,p.x,this.py-80*this.s,90)){p.hop=.6;sfx('boing');}},
  move(x,y){const d=this.tools.find(t=>t.held);if(d){d.x=x;d.y=y;}},
  up(x,y){const d=this.tools.find(t=>t.held);if(!d)return;if(this.st.act==='drop')this.drop(d,x,y);d.held=false;if(this.st.act==='hold'&&!this.sub&&this.prog<this.st.need)this.prog=0;},
  hint(){const p=this.p;if(p.cured||this.si<0||p.walk)return null;if(this.sub&&this.sub.opts){const i=this.sub.opts.indexOf(this.sub.n);return{x:W/2+(i-1)*150,y:H-78};}if(this.sub)return null;
    if(this.med){const md=this.med;if(md.give)return null;return md.have<md.n?{x:150,y:H-110}:md.have>md.n?{x:360,y:H-110}:{x:500,y:H-110};}
    if(this.key==='palp'){const sp=this.spots.find(q=>q.sore);const t=this.tg('tummy');return{x:t.x+sp.x,y:t.y+sp.y};}
    const t=this.tools.find(q=>q.k===this.st.tool);if(!t)return null;const g=this.tg(this.st.tg);return{x:t.hx,y:t.hy,x2:g.x,y2:g.y};},
  hintText(){if(this.med)return `おくすりの びんを タッチして ${this.med.n}こ だそう`;return this.st?this.st.q:'';}};

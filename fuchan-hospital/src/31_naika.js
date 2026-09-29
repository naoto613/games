// ================= しんさつしつ（ないか） =================
const DISEASE={
  cold:{intro:'おねつと せきが でるみたい',steps:['thermo','ice','steth','medicine'],fever:1,tip:'かぜ'},
  throat:{intro:'のどが いたいみたい',steps:['light','spray','steth','medicine'],tip:'のど'},
  tummy:{intro:'おなかが いたいみたい',steps:['palp','hot','steth','medicine'],tummy:1},
  vaccine:{intro:'きょうは よぼうちゅうしゃの ひ！ ちょっと こわいな',steps:['calm','steth','shot']},
  rash:{intro:'からだが かゆくて ぶつぶつが でたみたい',steps:['loupe','cream','medicine'],rash:1},
  eye:{intro:'めが あかくて しょぼしょぼ するみたい',steps:['eyelight','drops'],eye:1},
  ear:{intro:'みみの なかで なにか ガサガサ するみたい',steps:['earlight','bugout','steth'],ear:1},
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
  calm:{tool:null,q:'こわがってる… あたまを なでなで して あげよう',act:'calm',tg:'head'},
  loupe:{tool:'loupe',q:'ぶつぶつを よく みる どうぐは どれ？',act:'rub',tg:'chest'},
  cream:{tool:'cream',q:'ぶつぶつに ぬる おくすりは どれ？',act:'rub',tg:'chest'},
  eyelight:{tool:'light',q:'めを しらべる ライトは どれ？',act:'drop',tg:'eyes'},
  drops:{tool:'eyedrop',q:'めに いれる おくすりは どれ？',act:'drops',tg:'eyes'},
  earlight:{tool:'light',q:'みみの なかを てらす どうぐは どれ？',act:'drop',tg:'ear'},
  bugout:{tool:'tweezers',q:'むしを とりだす どうぐは どれ？',act:'hold',tg:'ear',need:1.4},
};
const NPOOL=['thermometer','icepack','steth','light','spray','hotpack','syringe','bottle','loupe','cream','eyedrop','tweezers','toothbrush','bandage'];
SCN.naika={bg:'#e8f6ff',song:'clinic',
  enter(){this.subDone=0;this.sub=null;this.med=null;const lv=lvOf('naika');const pool=['cold','throat','tummy','rash','eye'].concat(lv>=1?['vaccine','ear']:['vaccine']);this.queue=shuffle(pool).slice(0,3);this.pi=0;this.miss=0;this.fin=0;
    this.theme=pick([['#e6f4ff','#cfe8d8','#f0f8ff'],['#fff0f6','#e8dcf0','#fff8fb'],['#f0fff4','#d8ecd0','#f8fff8']]);this.lay();this.newPatient();},
  lay(){this.px=340;this.py=H*.6;this.s=1.75;if(this.tools)this.tools.forEach(t=>{t.hy=H-84;});},
  newPatient(){const d=this.queue[this.pi];this.D=DISEASE[d];this.dk=d;const P=newPatient(ANK.filter(k=>k!=='frog'||d!=='ear'));
    this.p=Object.assign(P,{x:W+160,walk:1,leave:0,hop:0,shake:0,ice:0,hot:0,open:0,cured:0,band:0,germs:[],temp:0,tv:+(37.8+Math.random()*1.4).toFixed(1),rash:[],redEye:0,drops:[0,0],bug:d==='ear'?1:0,bugT:0,calm:d==='vaccine'&&Math.random()<.7?0:3,lit:0});
    if(this.D.rash)this.p.rash=[...Array(4+Math.floor(Math.random()*3))].map(()=>({a:rand(-26,26),b:rand(-60,-18),rev:0,cr:0}));
    this.si=-1;this.tools=[];this.med=null;this.sub=null;
    setTimeout(()=>{if(scene===this)greetPt(this.p,this.D.intro);},700);},
  startStep(){this.si++;let key=this.D.steps[this.si];if(key==='calm'&&this.p.calm>=3){this.si++;key=this.D.steps[this.si];}this.st=NSTEP[key];this.key=key;this.prog=0;this.sub=null;
    this.tools=this.st.tool?mkTray(trayChoices(this.st.tool,NPOOL),H-84):[];
    if(key==='palp')this.spots=shuffle([-1,0,1]).map((d,i)=>({x:d*46,y:d===0?-34:-12,sore:i===0,done:0}));
    if(key==='spray'){this.p.open=1;this.p.germs=[...Array(3+Math.floor(Math.random()*3))].map((_,i,a)=>({a:(i-(a.length-1)/2)*11,b:rand(-4,8),alive:1,ph:rand(0,6)}));}
    if(key==='calm'){this.p.shake=99;}
    setTimeout(()=>{if(scene===this&&this.key===key)say(this.st.q);},400);},
  tg(name){const p=this.p,s=this.s,y=this.py;switch(name){case'head':return{x:p.x,y:y-116*s};case'mouth':return{x:p.x,y:y-72*s};case'chest':return{x:p.x,y:y-40*s};case'tummy':return{x:p.x,y:y-26*s};case'arm':return{x:p.x+34*s,y:y-44*s};case'arm2':return{x:p.x-36*s,y:y-40*s};
    case'eyes':{const i=this.p.drops[0]<2?0:1;return{x:p.x+(i?13:-13)*s,y:y-86*s-(this.key==='drops'?40:0)};}case'ear':return{x:p.x+36*s,y:y-108*s};}},
  update(dt){const p=this.p;for(const t of this.tools)t.upd(dt);if(p.hop>0)p.hop-=dt*2;if(p.shake>0&&p.shake<90)p.shake-=dt;
    if(p.walk&&!p.leave){p.x+=Math.sign(this.px-p.x)*Math.min(Math.abs(this.px-p.x),300*dt);if(Math.abs(p.x-this.px)<1){p.walk=0;setTimeout(()=>{if(scene===this&&this.si<0)this.startStep();},2000);}}
    if(p.leave){p.x-=320*dt;if(p.x<-180){this.pi++;if(this.pi>=this.queue.length){if(!this.fin)this.fin=.01;}else this.newPatient();}}
    if(this.fin>0){this.fin+=dt;if(this.fin>.8&&this.fin<9){this.fin=9;celebrate('naika',starsFor(this.miss));}}
    if(p.bug&&p.bugT>0){p.bugT+=dt;}
    if(this.si<0||p.cured)return;const st=this.st,key=this.key,d=this.tools.find(t=>t.held);
    if(st.act==='hold'&&d&&!this.sub){const g=this.tg(st.tg),tp=d.tip();if(Math.hypot(tp.x-g.x,tp.y-g.y)<70){this.prog+=dt;
        if(key==='thermo'){p.temp=Math.min(1,this.prog/st.need);if(Math.random()<dt*6)sfx('tick');}
        if(key==='shot'&&this.prog<.1)p.shake=.4;if(key==='bugout'&&Math.random()<dt*8){p.shake=.2;sfx('squeak');}
        if(this.prog>=st.need)this.holdDone(key);}}
    if(st.act==='rub'&&d&&d.k===st.tool){if(key==='spray'){const m=this.tg('mouth');if(Math.random()<dt*20)parts.push({x:d.x-24,y:d.y-24,vx:rand(-140,-60),vy:rand(-10,50),life:.5,t:0,kind:'puff',col:'#d8f0ff',r:6});
        for(const g of p.germs){if(!g.alive)continue;const gx=m.x+g.a*this.s,gy=m.y+g.b*this.s;if(Math.hypot(d.x-30-gx,d.y-30-gy)<70){g.alive=0;good(gx,gy,1,pick(['えいっ！','やっつけた！']));}}
        if(p.germs.every(g=>!g.alive)&&!this.subDone){this.subDone=1;say('ばいきん ぜんぶ やっつけた！ のどが すっきり！');this.tools.forEach(t=>t.held=false);p.open=0;this.next(1.4);}}
      else{const c0=this.tg('chest');for(const r of p.rash){const rx=p.x+r.a*this.s,ry=this.py+r.b*this.s;const tp=d.tip(),dd=key==='loupe'?Math.hypot(tp.x-rx,tp.y-ry):Math.hypot(d.x-20-rx,d.y-20-ry);
          if(key==='loupe'&&!r.rev&&dd<60){r.rev=1;good(rx,ry,1,'みつけた！');}
          if(key==='cream'&&!r.cr&&dd<55){r.w=(r.w||0)+dt;if(Math.random()<dt*10)sfx('squish');if(r.w>.3){r.cr=1;good(rx,ry,1,'ぬりぬり');}}}
        if(!this.subDone&&(key==='loupe'?p.rash.every(r=>r.rev):p.rash.every(r=>r.cr))){this.subDone=1;this.tools.forEach(t=>t.held=false);say(key==='loupe'?`ぶつぶつが ${p.rash.length}こ あったね！`:'ぬりぐすりで かゆいの とんでいけ！');if(key==='loupe')sayNum(p.rash.length,'ぶつぶつ ','こ');this.next(1.8);}}}
    if(st.act==='drops'&&d&&d.k==='eyedrop'){const g=this.tg('eyes'),tp=d.tip();if(Math.abs(tp.x-g.x)<50&&tp.y>g.y-90&&tp.y<g.y+20){this.prog+=dt;if(this.prog>.55){this.prog=0;const i=p.drops[0]<2?0:1;p.drops[i]++;parts.push({x:g.x,y:g.y+10,vx:0,vy:260,life:.18,t:0,kind:'drop',col:'#7ac8ff'});sfx('water');const tot=p.drops[0]+p.drops[1];hush();speak(String(tot),'en');
        if(p.drops[i]>=2)good(g.x,g.y+40,1,i?'みぎも OK！':'ひだり OK！');if(tot>=4){p.redEye=0;d.held=false;say('めぐすり 4てき！ めが すっきり！');this.next(1.6);}}}}
    if(this.sub&&this.sub.type==='beats'){const b=this.sub;b.t+=dt;if(b.i<b.n&&b.t>.7+b.i*.72){b.i++;sfx('dokkun');b.pop=1;const c=this.tg('chest');burst(c.x,c.y,4,'heart');}if(b.pop>0)b.pop-=dt*3;if(b.i>=b.n&&!b.asked&&b.t>.8+b.n*.72){b.asked=1;b.opts=shuffle([b.n,...shuffle([2,3,4,5,6,7].filter(v=>v!==b.n)).slice(0,2)]);say('どっくん どっくん。 なんかい きこえたかな？');}}
    if(this.med&&this.med.give){this.med.give+=dt;if(this.med.give>1.6&&!p.cured)this.cure();}},
  holdDone(key){const p=this.p;this.tools.forEach(t=>t.held=false);
    if(key==='thermo'){p.temp=1;const tv=this.D.fever?p.tv:36.5;p.tvShow=tv;if(this.D.fever){hush();speak(`${tv}ど！ おねつが あるね`);bub={text:`${tv}ど！ おねつが あるね`,t:0,life:3};}else say('36.5ど。 おねつは ないね');good(this.tg('arm2').x,this.tg('arm2').y,1,'ピピッ！');this.next(2.4);}
    else if(key==='steth'){this.tools=[];const lv=lvOf('naika');this.sub={type:'beats',n:2+Math.floor(Math.random()*(lv>=2?6:4)),i:0,t:0,pop:0};say('しーっ！ しんぞうの おとを よく きいてね');}
    else if(key==='shot'){p.band=1;p.hop=1;good(this.tg('arm').x,this.tg('arm').y,2,'ちくっ！');say('よく がんばったね！ ばんそうこうを はったよ');this.next(2);}
    else if(key==='bugout'){p.bug=0;p.bugFly={x:this.tg('ear').x,y:this.tg('ear').y,t:0};good(this.tg('ear').x,this.tg('ear').y,2,'スポッ！');say('ちいさな むしさんが はいってたんだね！ おそとに かえしてあげよう');this.next(2.4);}},
  next(delay){const key=this.key;this.subDone=0;this.tools.forEach(t=>t.hidden=true);setTimeout(()=>{if(scene!==this||this.key!==key)return;this.tools=[];if(this.si+1>=this.D.steps.length)this.cure();else this.startStep();},delay*1000);},
  cure(){const p=this.p;if(p.cured)return;p.cured=1;p.ice=0;p.hot=0;p.open=0;p.temp=0;p.redEye=0;p.rash=[];this.tools=[];this.med=null;banner('なおった！','#4cc86a',`${ptName(p)}さん げんき いっぱい！`);burst(p.x,this.py-150,24,'heart');
    setTimeout(()=>{if(scene===this)say(pick(['げんきに なった！ ありがとう せんせい！','よくなったよ！ ありがとう！','すっかり げんき！ ばいばーい！']));},900);
    setTimeout(()=>{if(scene===this){p.leave=1;this.si=-1;}},3000);},
  drop(t,x,y){const st=this.st,key=this.key,p=this.p;const g=this.tg(st.tg);if(Math.hypot(x-g.x,y-g.y)>110)return;
    if(key==='ice'){p.ice=1;good(g.x,g.y,1,'ひんやり');say('ひんやり きもちいい〜');this.next(1.6);}
    else if(key==='light'){p.open=1;good(g.x,g.y,1,'あーん');say('のどが あかくなって ばいきんが いるね');this.next(1.8);}
    else if(key==='eyelight'){p.redEye=1;good(g.x,g.y,1);say('めが あかいね。 めぐすりを いれよう');this.next(1.8);}
    else if(key==='earlight'){p.lit=1;p.bugT=.01;good(g.x,g.y,1,'あっ！');say('みみの なかに ちいさな むしさんが いる！');this.next(2);}
    else if(key==='hot'){p.hot=1;good(g.x,g.y,1,'ぽかぽか');say('ぽかぽか あったかい〜');this.next(1.6);}
    else if(key==='medicine'){const lv=lvOf('naika');const pc=pick(['#ff4d6d','#4a9cff','#ffd23a','#4cc86a','#ff8cc8','#a878ff']);this.med={n:1+Math.floor(Math.random()*(lv>=1?5:3)),have:0,give:0,col:pc};this.tools=[];hush();speak(`おくすりを ${this.med.n}こ コップに いれてね`);speak(numEn(this.med.n),'en');bub={text:`おくすりを ${this.med.n}こ コップに いれてね`,t:0,life:3.4};}},
  draw(c){const p=this.p,s=this.s,py=this.py,th=this.theme;roomBg(c,th[0],th[1],py-40,th[2],[['window',90,py-300,1,120,100],['poster',230,py-300,1,'germ','#9ad0ff','てあらい'],['clock',W-150,170,.6],['bpwall',W-50,py-190,.9],['sanitizer',32,py-140,.9],['desk',W-96,py-112,.85]]);
    c.fillStyle='#fff';rr(c,440,150,120,160,10);c.fill();c.strokeStyle='#9ac8e8';c.lineWidth=4;c.stroke();[.7,.55,.42,.32,.24].forEach((r,i)=>{const n=i<2?2:3;for(let j=0;j<n;j++)MED.landolt(c,500+(j-(n-1)/2)*(i<2?50:34),178+i*28-(i>2?(i-2)*4:0),r,{a:[0,1.57,3.14,4.71][(i*2+j)%4]});});
    c.fillStyle='#fff';rr(c,this.px-120,py-10,240,22,10);c.fill();c.fillStyle='#9ab8d8';c.fillRect(this.px-8,py+12,16,60);c.fillStyle='#bfd8f0';rr(c,this.px-60,py+66,120,14,7);c.fill();
    const D=this.D;const sick=!p.cured;const scared=this.key==='calm'&&p.calm<3;
    const st={t:T,hop:p.walk||p.leave?Math.abs(Math.sin(T*7))*.5:p.hop,sick:sick&&D.fever&&p.ice===0,sad:sick&&!p.walk&&this.key!=='shot'&&!(this.sub&&this.sub.type==='beats')&&!scared,scared,cry:scared&&p.calm===0,happy:p.cured||(this.key==='shot'&&p.band),tummy:sick&&D.tummy&&!p.hot&&!p.walk,open:p.open,eat:this.med&&this.med.give>0?1:0,shake:scared?Math.max(.05,.3-p.calm*.1):p.shake,sweat:sick&&(D.fever||scared),wave:p.leave,tilt:D.ear&&p.bug?.18:0,look:LOOK.on&&!p.walk?clamp((LOOK.x-p.x)/200,-1,1):0};
    drawPt(c,p,p.x,py,s,st);
    const h=this.tg('head'),m=this.tg('mouth');
    if(st.sick){c.strokeStyle='rgba(255,90,90,.8)';c.lineWidth=4;for(let i=0;i<3;i++){c.beginPath();const bx=h.x-30+i*30,by=h.y-40-Math.sin(T*4+i)*6;c.moveTo(bx,by);c.bezierCurveTo(bx-10,by-12,bx+10,by-22,bx,by-34);c.stroke();}}
    if(sick&&D.fever&&!p.walk&&Math.sin(T*1.3)>.85)txtO(c,'ごほっ',m.x-110,m.y-20,26,'#8a7aa8','#fff',6);
    if(sick&&D.rash&&!p.walk&&Math.sin(T*1.7)>.8)txtO(c,'かゆい〜',m.x+110,m.y-10,24,'#c86a8a','#fff',6);
    if(p.ice)drawItem(c,'icepack',h.x,h.y+10,1.1);if(p.hot)MED.hotpack(c,this.tg('tummy').x,this.tg('tummy').y,.9);if(p.band)drawItem(c,'bandage',this.tg('arm').x,this.tg('arm').y,.6);
    for(const r of p.rash){const rx=p.x+r.a*s,ry=py+r.b*s;if(r.cr){c.fillStyle='rgba(255,255,255,.8)';circ(c,rx,ry,10);}else{c.fillStyle=r.rev||this.key!=='loupe'?'rgba(255,80,100,.8)':'rgba(255,80,100,.18)';for(let k=0;k<3;k++)circ(c,rx+Math.cos(k*2.1)*5,ry+Math.sin(k*2.1)*5,3.5);}}
    if(p.redEye&&!p.cured){c.strokeStyle='rgba(255,60,80,.6)';c.lineWidth=3;for(const sx of[-1,1]){if(p.drops[sx<0?0:1]>=2)continue;c.beginPath();c.arc(p.x+sx*13*s,py-86*s,15,0,TAU);c.stroke();}}
    if(p.bug&&p.lit){const e=this.tg('ear');c.fillStyle='rgba(255,250,180,.5)';circ(c,e.x,e.y,26);MED.bug(c,e.x+Math.sin(T*9)*4,e.y+Math.cos(T*7)*3,.8);}
    if(p.bugFly){const b=p.bugFly;b.t+=1/60;MED.bug(c,b.x+b.t*260,b.y-b.t*200+Math.sin(b.t*20)*16,.8);if(b.t>3)p.bugFly=null;}
    if(p.open&&!p.cured){c.fillStyle='#e8506a';ell(c,m.x,m.y+6,18,15);for(const g of p.germs){if(!g.alive)continue;MED.germ(c,m.x+g.a*s+Math.sin(T*3+g.ph)*3,m.y+g.b*s+6,.42);}}
    if(this.key==='palp'&&this.spots&&!p.cured){const t=this.tg('tummy');for(const sp of this.spots){if(sp.done)continue;c.fillStyle=`rgba(255,200,230,${.5+Math.sin(T*5)*.2})`;circ(c,t.x+sp.x,t.y+sp.y,20);c.strokeStyle='#ff8cc0';c.lineWidth=3;c.beginPath();c.arc(t.x+sp.x,t.y+sp.y,20,0,TAU);c.stroke();}}
    if(this.key==='calm'&&!p.cured){c.fillStyle='rgba(255,255,255,.9)';rr(c,h.x-70,h.y-100,140,34,17);c.fill();for(let i=0;i<3;i++){c.fillStyle=i<p.calm?'#ff5fa2':'#f0d8e4';heartP(c,h.x-36+i*36,h.y-83,10);c.fill();}targetMark(c,h.x,h.y+20,50);}
    if(this.key==='thermo'&&p.temp>0){const v=(35.5+p.temp*((D.fever?p.tv:36.5)-35.5)).toFixed(1);panel(c,p.x+80,py-280,140,62,18,'#fff','#ff4d6d',4);txt(c,v+'°',p.x+150,py-249,34,'#ff4d6d');}
    const b=this.sub;if(b&&b.type==='beats'){const ch=this.tg('chest');if(b.pop>0){c.globalAlpha=b.pop;MED.love(c,ch.x,ch.y-150,1+(1-b.pop)*.6);c.globalAlpha=1;}for(let i=0;i<b.i;i++)MED.love(c,W/2-(b.n-1)*28+i*56,300,.5);
      if(b.opts){panel(c,40,H-170,W-80,150,24,'#fff','#ffb3d6');txt(c,'どっくん なんかい？',W/2,H-146,22,'#8a5a9a');b.opts.forEach((n,i)=>numBtn(c,W/2+(i-1)*150,H-78,44,n,['#ff8cc0','#5aa8ff','#ffb03a'][i]));}}
    const md=this.med;if(md){panel(c,40,H-240,W-80,220,24,'#fff','#a878ff');txt(c,`おくすり ${md.n}こ`,W/2,H-214,26,'#7a4ad8');MED.bottle(c,150,H-110,1.5);
      c.fillStyle='rgba(200,230,255,.8)';c.strokeStyle='#8ab0d8';c.lineWidth=4;c.beginPath();c.moveTo(300,H-170);c.lineTo(420,H-170);c.lineTo(405,H-60);c.lineTo(315,H-60);c.closePath();c.fill();c.stroke();
      for(let i=0;i<md.have;i++)MED.pill(c,330+(i%3)*30,H-80-Math.floor(i/3)*26,.7,{col:md.col});txt(c,String(md.have),360,H-196,30,'#ff5fa2');
      if(!md.give)drawBtn(c,500,H-110,44,'#4cc86a','check',md.have===md.n);txt(c,'タップで だす',150,H-40,16,'#a07aa8');}
    fu(c,86,py+130,2.5,{point:!p.cured&&this.si>=0});rk(this,c,W-60,py+150,1.6);
    if(this.si>=0&&!p.cured&&this.st.tool&&this.tools.some(t=>!t.hidden)){const g=this.tg(this.st.tg);if(this.tools.some(t=>t.held&&t.k===this.st.tool)&&this.st.act!=='rub')targetMark(c,g.x,g.y);tray(c,H-84,120);for(const t of this.tools)if(!t.held)t.draw(c,1.2);for(const t of this.tools)if(t.held)t.draw(c,1.4);
      const d=this.tools.find(t=>t.held);if(d&&this.st.act==='hold'&&this.prog>0)progRing(c,g.x,g.y,54,this.prog/this.st.need);}
    if(this.key==='palp'&&!p.cured)txt(c,'おなかを タッチ',W/2,H-60,26,'#ff5fa2');if(this.key==='calm'&&!p.cured)txt(c,'あたまを なでなで',W/2,H-60,26,'#ff5fa2');
    stepDots(c,this.D.steps.length,Math.max(0,this.si)+(p.cured?1:0));
    txt(c,`かんじゃさん ${Math.min(this.pi+1,this.queue.length)} / ${this.queue.length}`,W/2+30,160,18,'#5a88c8');},
  down(x,y){const p=this.p;if(p.cured||this.si<0)return;
    const b=this.sub;if(b&&b.type==='beats'){if(b.opts){b.opts.forEach((n,i)=>{if(hitC(x,y,W/2+(i-1)*150,H-78,50)){if(n===b.n){good(W/2+(i-1)*150,H-78,2);sayNum(n,'',' かい');this.sub=null;this.next(2);}else{bad();this.miss++;say('もういちど よく きいてみよう');this.sub={type:'beats',n:b.n,i:0,t:-.6,pop:0};}}});}return;}
    const md=this.med;if(md){if(md.give)return;if(hitC(x,y,150,H-110,70)){if(md.have>=9){sfx('no');return;}md.have++;sfx('pop');burst(360,H-120,4,'dot');hush();speak(String(md.have));speak(numEn(md.have),'en');}
      else if(x>290&&x<430&&y>H-180&&y<H-50&&md.have>0){md.have--;sfx('tap');}
      else if(hitC(x,y,500,H-110,50)){if(md.have===md.n){md.give=.01;good(500,H-110,2,'ぴったり！');say(`${md.n}こ ぴったり！ ごっくん！`);}else{bad();this.miss++;say(md.have>md.n?`おおいよ！ ${md.n}こだよ。 コップを タッチすると もどせるよ`:`たりないよ！ ${md.n}こだよ`);}}return;}
    if(this.key==='palp'){const t=this.tg('tummy');for(const sp of this.spots){if(sp.done)continue;if(hitC(x,y,t.x+sp.x,t.y+sp.y,32)){sp.done=1;if(sp.sore){p.shake=.6;good(t.x+sp.x,t.y+sp.y,1,'そこだ！');say('いたたた！ そこが いたいの');this.next(1.8);}else{sfx('tap');say('そこは だいじょうぶ');}return;}}return;}
    if(this.key==='calm'){const h=this.tg('head');if(hitC(x,y,h.x,h.y+20,90)){p.calm++;sfx('heart');burst(h.x,h.y-20,5,'heart');hush();speak(['だいじょうぶだよ','いいこ いいこ','こわくないよ'][p.calm-1]||'');if(p.calm>=3){p.shake=0;good(h.x,h.y,1,'あんしん！');say('ありがとう。 もう こわくない！');this.next(1.6);}}return;}
    for(const t of this.tools){if(t.hit(x,y)){if(t.k!==this.st.tool){this.miss++;wrongTool(t,this.st.q);return;}t.held=true;t.lx=x;t.ly=y;sfx('tap');sayWord(t.k);return;}}
    if(hitC(x,y,p.x,this.py-80*this.s,90)){p.hop=.6;sfx('boing');}},
  move(x,y){const d=this.tools.find(t=>t.held);if(d){d.x=x;d.y=y;}},
  up(x,y){const d=this.tools.find(t=>t.held);if(!d)return;if(this.st.act==='drop'){const tp=d.tip();this.drop(d,tp.x,tp.y);}d.held=false;if(this.st.act==='hold'&&!this.sub&&this.prog<this.st.need)this.prog=0;},
  hint(){const p=this.p;if(p.cured||this.si<0||p.walk)return null;if(this.sub&&this.sub.opts){const i=this.sub.opts.indexOf(this.sub.n);return{x:W/2+(i-1)*150,y:H-78};}if(this.sub)return null;
    if(this.med){const md=this.med;if(md.give)return null;return md.have<md.n?{x:150,y:H-110}:md.have>md.n?{x:360,y:H-110}:{x:500,y:H-110};}
    if(this.key==='palp'){const sp=this.spots.find(q=>q.sore);const t=this.tg('tummy');return{x:t.x+sp.x,y:t.y+sp.y};}
    if(this.key==='calm'){const h=this.tg('head');return{x:h.x,y:h.y+20};}
    const t=this.tools.find(q=>q.k===this.st.tool);if(!t||t.hidden)return null;let g=this.tg(this.st.tg);
    if(this.key==='loupe'||this.key==='cream'){const r=p.rash.find(r=>this.key==='loupe'?!r.rev:!r.cr);if(!r)return null;g=this.key==='loupe'?t.aim({x:p.x+r.a*this.s,y:this.py+r.b*this.s}):{x:p.x+r.a*this.s+20,y:this.py+r.b*this.s+20};}
    else if(this.key!=='spray')g=t.aim(this.st.act==='drops'?{x:g.x,y:g.y-30}:g);
    if(this.key==='spray'){const gm=p.germs.find(q=>q.alive);if(!gm)return null;const m=this.tg('mouth');g={x:m.x+gm.a*this.s+30,y:m.y+gm.b*this.s+30};}
    return{x:t.hx,y:t.hy,x2:g.x,y2:g.y};},
  hintText(){if(this.med)return `おくすりの びんを タッチして ${this.med.n}こ だそう`;return this.st?this.st.q:'';}};

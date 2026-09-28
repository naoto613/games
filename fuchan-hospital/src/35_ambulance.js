// ================= きゅうきゅうしゃ（119 → ばしょ → しゅつどう → おうきゅうてあて → はんそう） =================
const PLACES={park:{ja:'こうえん',en:'park',sky:'#8fd8ff',ground:'#8ee07a',side:'tree'},school:{ja:'がっこう',en:'school',sky:'#a8e0ff',ground:'#c8d8a0',side:'house'},beach:{ja:'うみ',en:'beach',sky:'#7ad0ff',ground:'#ffe8a8',side:'palm'},mountain:{ja:'やま',en:'mountain',sky:'#b8e0ff',ground:'#7ac870',side:'pine'}};
const AIDS={leg:{ja:'あしを いためて うごけない',tool:'splint',done:'そえぎで あしを まもったよ'},head:{ja:'あたまを ぶつけて ちが でてる',tool:'bandage',done:'ばんそうこうで とめたよ'},heat:{ja:'あつくて ふらふら… ねっちゅうしょう',tool:'icepack',done:'ひやして すずしく なったね'},cold:{ja:'さむくて ぶるぶる ふるえてる',tool:'towel',done:'タオルで あたためたよ'}};
SCN.ambulance={bg:'#e8f4ff',song:'hero',
  enter(){this.str=null;this.yieldSaid=0;this.sirenT=0;this.rs=null;this.aidTools=null;this.bt=0;this.whereOpts=null;this.ph='call';this.dial='';this.miss=0;this.fin=0;this.op=0;this.t=0;this.asked=0;this.lay();this.place=pick(Object.keys(PLACES));this.pt=newPatient();
    const aidPool=this.place==='beach'?['heat','leg','head']:this.place==='mountain'?['cold','leg','head']:['leg','head','heat'];this.aid=pick(aidPool);
    say(`たいへん！ ${PLACES[this.place].ja}で ${ptName(this.pt)}さんが こまってる！ きゅうきゅうしゃを よぶ ばんごうは 1・1・9。 でんわを かけよう！`);},
  lay(){this.kx=W/2;this.ky=H*.36;},
  key(i){const r=Math.floor(i/3),c=i%3;return{x:this.kx+(c-1)*96,y:this.ky+80+r*84};},
  keys:['1','2','3','4','5','6','7','8','9','＊','0','＃'],
  startDrive(){this.ph='drive';this.lane=1;this.ax=W/2;this.dist=0;this.goal=8400;this.speed=0;this.cars=[];this.items=[];this.siren=0;this.hearts=0;this.bumpT=0;this.spawn=1;this.boost=0;this.light=null;this.lightAt=2600+Math.random()*2000;
    say('しゅつどう！ サイレンの ボタンを おして、 ひだりと みぎを タッチして すすもう');},
  laneX(l){return W/2+(l-1)*150;},
  update(dt){this.t+=dt;
    if(this.ph==='ringing'){this.op+=dt;if(this.op>2.2&&!this.asked){this.asked=1;hush();speak('はい、 119ばん です。 かじ ですか？ きゅうきゅう ですか？');bub={text:'はい 119ばんです。 かじですか？ きゅうきゅうですか？',t:0,life:4};}}
    if(this.ph==='drive'){const stopL=this.light&&this.light.st==='red'&&!this.siren&&this.light.y<H-260&&this.light.y>H-420;const tgt=this.bumpT>0?120:stopL?0:(this.boost>0?620:this.siren?420:330);this.speed+=(tgt-this.speed)*Math.min(1,dt*2.5);this.dist+=this.speed*dt;if(this.bumpT>0)this.bumpT-=dt;if(this.boost>0){this.boost-=dt;if(Math.random()<dt*30)parts.push({x:this.ax+rand(-20,20),y:H-160,vx:rand(-30,30),vy:rand(100,200),life:.5,t:0,kind:'star',col:pick(['#ffd23a','#ff8cc0','#7ad8ff']),r:7,rot:0});}
      this.ax+=(this.laneX(this.lane)-this.ax)*Math.min(1,dt*10);if(this.siren){this.sirenT=(this.sirenT||0)+dt;if(this.sirenT>1.2){this.sirenT=0;sfx('siren1');}}
      this.spawn-=dt;if(this.spawn<=0&&this.dist<this.goal-800){this.spawn=rand(.8,1.4);const l=Math.floor(Math.random()*3);const r=Math.random();
        if(r<.62)this.cars.push({l,x:this.laneX(l),y:-120,col:pick(['#ff6f91','#5aa8ff','#ffd23a','#6cd08a','#b48cff']),v:rand(120,180),side:0,truck:Math.random()<.25});
        else if(r<.78)this.items.push({l,x:this.laneX(l),y:-80,kind:'cone'});
        const l2=(l+1+Math.floor(Math.random()*2))%3;this.items.push({l:l2,x:this.laneX(l2),y:-80-rand(0,100),kind:Math.random()<.18?'boost':'heart'});}
      if(!this.light&&this.dist>this.lightAt){this.light={y:-120,st:'red',t:0};say('しんごうが あかだ！ サイレンを ならしていれば きゅうきゅうしゃは ちゅういして とおれるよ');}
      if(this.light){this.light.y+=this.speed*dt;this.light.t+=dt;if(this.light.t>6)this.light.st='green';if(this.light.y>H+100){if(!this.light.passed){this.light.passed=1;}this.light=null;this.lightAt=1e9;}}
      const AY=H-230;for(const c of this.cars){c.y+=(this.speed-c.v)*dt;if(this.siren&&c.y>AY-520&&c.y<AY+40&&!c.side){c.side=c.l===0?-1:c.l===2?1:(this.lane===0?1:-1);if(!this.yieldSaid){this.yieldSaid=1;good(c.x,c.y,1,'ゆずってくれた！');say('サイレンを きいて くるまが みちを ゆずってくれたよ！');}}
        const tx=c.side?(c.side<0?46:W-46):this.laneX(c.l);c.x+=(tx-c.x)*Math.min(1,dt*4);
        if(!c.hit&&!c.side&&Math.abs(c.x-this.ax)<70&&Math.abs(c.y-AY)<110){c.hit=1;this.bumpT=.8;this.miss++;bad();sfx('bump');say(this.siren?'あぶない！ よけよう':'サイレンを ならすと くるまが よけてくれるよ！');}}
      this.cars=this.cars.filter(c=>c.y<H+200&&c.y>-400);
      for(const it of this.items){it.y+=this.speed*dt;if(!it.got&&Math.abs(it.x-this.ax)<60&&Math.abs(it.y-AY)<70){it.got=1;if(it.kind==='heart'){this.hearts++;good(it.x,it.y,1,`${this.hearts}！`);hush();speak(String(this.hearts),'en');}else if(it.kind==='boost'){this.boost=2.2;good(it.x,it.y,2,'スピードアップ！');sfx('launch');}else{this.bumpT=.5;sfx('bump');SHAKE=.2;}}}
      this.items=this.items.filter(i=>i.y<H+100&&!i.got);
      if(this.dist>=this.goal){this.ph='rescue';this.rs={st:'aid',t:0,sx:W/2+150,sy:H*.72,on:0,aided:0};sfx('siren');banner('とうちゃく！','#ff4d6d',`ハート ${this.hearts}こ ゲット`);hush();speak(`とうちゃく！ ハートを ${this.hearts}こ あつめたよ`);
        this.aidTools=mkTray(trayChoices(AIDS[this.aid].tool,['splint','bandage','icepack','towel','toothbrush'],3),H-84);
        setTimeout(()=>{if(scene===this)say(`${ptName(this.pt)}さん、 ${AIDS[this.aid].ja}！ まず てあてを しよう。 なにを つかう？`);},2600);}}
    if(this.ph==='rescue'){const r=this.rs;r.t+=dt;for(const t of this.aidTools||[])t.upd(dt);if(r.st==='load'){r.lt=(r.lt||0)+dt;if(r.lt>1.2){this.ph='back';this.bt=0;sfx('siren');say('びょういんへ しゅっぱつ！ ピーポーピーポー');}}}
    if(this.ph==='back'){this.bt+=dt;if(this.bt>4.2&&!this.fin){this.fin=.01;banner('きゅうじょ せいこう！','#ff4d6d');setTimeout(()=>{if(scene===this)say('びょういんに ついた！ もう だいじょうぶ！ ありがとう きゅうきゅうたいいんさん！');},800);}}
    if(this.fin>0){this.fin+=dt;if(this.fin>3&&this.fin<9){this.fin=9;celebrate('ambulance',starsFor(this.miss));}}},
  drawCar(c,x,y,col,truck){c.save();c.translate(x,y);const L=truck?140:112;c.fillStyle='rgba(0,0,0,.18)';rr(c,-34,-L/2+4,72,L,18);c.fill();c.fillStyle=gfill(c,-10,-20,70,col);rr(c,-36,-L/2,72,L,18);c.fill();c.strokeStyle=shade(col,-.3);c.lineWidth=3;c.stroke();c.fillStyle='#bfe8ff';rr(c,-26,-L/2+22,52,26,8);c.fill();if(truck){c.fillStyle=shade(col,.3);rr(c,-32,-10,64,L/2,8);c.fill();}else{rr(c,-24,20,48,18,6);c.fill();}c.fillStyle='#ffe88a';circ(c,-22,L/2-4,5);circ(c,22,L/2-4,5);c.restore();},
  drawAmbTop(c,x,y){c.save();c.translate(x,y);if(this.bumpT>0)c.rotate(Math.sin(this.bumpT*40)*.08);c.fillStyle='rgba(0,0,0,.18)';rr(c,-38,-66,80,136,18);c.fill();c.fillStyle=gfill(c,-10,-20,80,'#ffffff');rr(c,-40,-70,80,136,18);c.fill();c.strokeStyle='#9aa8c0';c.lineWidth=3;c.stroke();
    c.fillStyle='#ff4d6d';c.fillRect(-40,-10,80,12);c.fillStyle='#bfe8ff';rr(c,-30,-62,60,24,8);c.fill();crossSign(c,0,26,14);const on=this.siren&&Math.floor(T*8)%2;c.fillStyle=on?'#ff2030':'#ff9aa0';rr(c,-30,-34,26,12,5);c.fill();c.fillStyle=!on&&this.siren?'#3a8aff':'#a8c8ff';rr(c,4,-34,26,12,5);c.fill();
    if(this.siren){c.fillStyle=`rgba(255,60,60,${on?.25:0})`;circ(c,-17,-28,40);c.fillStyle=`rgba(60,120,255,${on?0:.25})`;circ(c,17,-28,40);}c.restore();},
  sideDeco(c,x,y,kind){if(kind==='tree'){c.fillStyle='#4cae4a';circ(c,x,y,34);c.fillStyle='#6cd06a';circ(c,x-8,y-8,24);}else if(kind==='pine'){c.fillStyle='#3a984a';c.beginPath();c.moveTo(x,y-44);c.lineTo(x+30,y+20);c.lineTo(x-30,y+20);c.fill();c.fillStyle='#fff';c.beginPath();c.moveTo(x,y-44);c.lineTo(x+10,y-24);c.lineTo(x-10,y-24);c.fill();}
    else if(kind==='palm'){c.strokeStyle='#b08050';c.lineWidth=8;c.beginPath();c.moveTo(x,y+20);c.quadraticCurveTo(x+8,y-10,x,y-30);c.stroke();c.fillStyle='#4cb85a';for(let i=0;i<5;i++){c.save();c.translate(x,y-30);c.rotate(i*1.25);c.beginPath();c.ellipse(20,0,22,7,0,0,TAU);c.fill();c.restore();}}
    else{c.fillStyle=pick2(['#ffb3c8','#bfe0ff','#ffe08a'],x+y);rr(c,x-30,y-30,60,56,6);c.fill();c.fillStyle='#ff8a6a';c.beginPath();c.moveTo(x-36,y-28);c.lineTo(x,y-54);c.lineTo(x+36,y-28);c.fill();c.fillStyle='#fff';c.fillRect(x-18,y-14,14,12);c.fillRect(x+4,y-14,14,12);}},
  drawPlaceBg(c,place){const P=PLACES[place],L=-OX/SC-2,R=W+OX/SC+2;c.fillStyle=vfill(c,-OY/SC,H*.55,P.sky,.3,0);c.fillRect(L,-OY/SC-2,R-L,H);
    if(place==='mountain'){c.fillStyle='#9ab8d8';c.beginPath();c.moveTo(L,H*.55);c.lineTo(120,H*.25);c.lineTo(260,H*.55);c.lineTo(380,H*.3);c.lineTo(R,H*.55);c.fill();c.fillStyle='#fff';c.beginPath();c.moveTo(120,H*.25);c.lineTo(150,H*.31);c.lineTo(90,H*.31);c.fill();}
    if(place==='beach'){c.fillStyle='#4aa8e8';c.fillRect(L,H*.42,R-L,H*.13);c.fillStyle='rgba(255,255,255,.7)';for(let i=0;i<6;i++){const x=((i*110+T*30)%(W+100))-50;ell(c,x,H*.47,26,4);}}
    if(place==='school'){c.fillStyle='#fff4e0';rr(c,W/2+20,H*.26,250,H*.29,6);c.fill();c.fillStyle='#ff8a6a';c.fillRect(W/2+20,H*.26,250,20);c.fillStyle='#bfe8ff';for(let i=0;i<4;i++)for(let j=0;j<2;j++)c.fillRect(W/2+40+i*56,H*.31+j*60,36,36);c.fillStyle='#fff';circ(c,W/2+145,H*.24,16);}
    if(place==='park'){for(let i=0;i<3;i++)this.sideDeco(c,470-i*190,H*.44,'tree');c.fillStyle='#ff8cc0';c.fillRect(380,H*.5,6,40);c.fillRect(430,H*.5,6,40);c.fillRect(376,H*.5,64,6);}
    c.fillStyle=P.ground;c.fillRect(L,H*.55,R-L,H);c.fillStyle='#d8d8e0';c.fillRect(L,H*.55,R-L,90);},
  draw(c){const L=-OX/SC-2,R=W+OX/SC+2;
    if(this.ph==='call'||this.ph==='ringing'||this.ph==='where'||this.ph==='go'){c.fillStyle=vfill(c,-OY/SC,H,'#ffe0ea',.1,-.05);c.fillRect(L,-OY/SC-2,R-L,H+OY/SC*2+4);
      panel(c,this.kx-170,this.ky-150,340,H*.62+120,40,'#3a4260','#8a98c0',6);c.fillStyle='#e8f6ff';rr(c,this.kx-146,this.ky-126,292,H*.62+70,24);c.fill();
      if(this.ph==='call'){txt(c,'きゅうきゅうは なんばん？',this.kx,this.ky-96,22,'#5a6a8a');c.fillStyle='#fff';rr(c,this.kx-120,this.ky-70,240,70,16);c.fill();txt(c,this.dial||' ',this.kx,this.ky-34,54,'#ff4d6d',undefined,POP,400);
        const nextD='119'[this.dial.length];this.keys.forEach((k,i)=>{const p=this.key(i);const g=k===nextD&&this.dial.length<3;c.fillStyle=g&&idle>3?'#ffe0ec':'#fff';circ(c,p.x,p.y,36);c.strokeStyle=g&&idle>3?'#ff5fa2':'#c8d4e8';c.lineWidth=4;c.stroke();txt(c,k,p.x,p.y+2,34,'#3a4260');});
        const cp=this.key(13);drawBtn(c,this.kx,cp.y+10,40,'#4cc86a','play',this.dial==='119');txt(c,'でんわ',this.kx,cp.y+66,18,'#4c9a6a');}
      else if(this.ph==='ringing'){txt(c,'119',this.kx,this.ky-60,64,'#ff4d6d',undefined,POP,400);if(!this.asked){const k=(T*2)%1;c.strokeStyle=`rgba(76,200,106,${1-k})`;c.lineWidth=6;c.beginPath();c.arc(this.kx,this.ky+120,40+k*60,0,TAU);c.stroke();MED.phone(c,this.kx,this.ky+120,1.4);txt(c,'プルルル…',this.kx,this.ky+220,28,'#5a6a8a');}
        else{txt(c,'かじ？ きゅうきゅう？',this.kx,this.ky+10,26,'#5a6a8a');[['firetruck','かじ'],['ambulance','きゅうきゅう']].forEach(([k,n],i)=>{const x=this.kx+(i-.5)*140,y=this.ky+140;panel(c,x-62,y-70,124,150,20,'#fff',i?'#ff8cc0':'#ffb03a');drawThing(c,k,x,y-10,1.25);txt(c,n,x,y+56,20,'#5a4a6a');});}}
      else if(this.ph==='where'){txt(c,'ばしょは どこですか？',this.kx,this.ky-90,24,'#5a6a8a');this.whereOpts.forEach((pl,i)=>{const y=this.ky-20+i*130;panel(c,this.kx-130,y-10,260,110,20,'#fff','#9ad0ff');c.save();c.beginPath();rr(c,this.kx-120,y,120,90,12);c.clip();c.translate(this.kx-60,y+45);c.scale(.2,.2);c.translate(-W/2,-H*.5);this.drawPlaceBg(c,pl);c.restore();txt(c,PLACES[pl].ja,this.kx+60,y+34,24,'#3a4a6a');txt(c,PLACES[pl].en,this.kx+60,y+64,16,'#3a88e8');});}
      else{txt(c,'すぐに いきます！',this.kx,this.ky+60,30,'#ff4d6d');MED.ambulance(c,this.kx,this.ky+180,2);}
      fu(c,70,H-30,2.2,{point:1});rk(this,c,W-60,H-30,1.6);return;}
    if(this.ph==='drive'){const P=PLACES[this.place];c.fillStyle=P.ground;c.fillRect(L,-OY/SC-2,R-L,H+OY/SC*2+4);c.fillStyle='#7a7a8a';c.fillRect(W/2-240,-OY/SC-2,480,H+OY/SC*2+4);c.fillStyle='#fff';c.fillRect(W/2-240,-OY/SC,8,H+OY/SC*2);c.fillRect(W/2+232,-OY/SC,8,H+OY/SC*2);
      const off=this.dist%120;for(const lx of[W/2-75,W/2+75])for(let y=-120+off;y<H+120;y+=120)c.fillRect(lx-4,y,8,60);
      for(let y=-200+(this.dist*.5%260);y<H+200;y+=260){for(const s of[-1,1])this.sideDeco(c,W/2+s*286,y,P.side);}
      if(this.light){const l=this.light;c.fillStyle='#fff';c.fillRect(W/2-236,l.y,472,14);for(let i=0;i<8;i++){c.fillStyle='#fff';c.fillRect(W/2-230+i*60,l.y+22,36,10);}c.fillStyle='#5a5a6a';c.fillRect(W/2+246,l.y-110,10,110);rr(c,W/2+226,l.y-150,50,100,10);c.fill();c.fillStyle=l.st==='red'?'#ff3040':'#5a3a3a';circ(c,W/2+251,l.y-126,14);c.fillStyle=l.st==='green'?'#40e070':'#3a5a3a';circ(c,W/2+251,l.y-90,14);}
      for(const it of this.items){if(it.kind==='heart')MED.love(c,it.x,it.y+Math.sin(T*6)*4,.8);else if(it.kind==='boost'){c.save();c.translate(it.x,it.y);c.rotate(T*3);c.fillStyle='#ffd23a';star(c,0,0,26,12);c.fill();c.strokeStyle='#fff';c.lineWidth=3;c.stroke();c.restore();}else{c.fillStyle='#ff8a3a';c.beginPath();c.moveTo(it.x,it.y-28);c.lineTo(it.x+18,it.y+16);c.lineTo(it.x-18,it.y+16);c.fill();c.fillStyle='#fff';c.fillRect(it.x-10,it.y-4,20,6);}}
      for(const car of this.cars)this.drawCar(c,car.x,car.y,car.col,car.truck);this.drawAmbTop(c,this.ax,H-230);
      if(this.boost>0){c.fillStyle='rgba(255,255,255,.35)';for(let i=0;i<8;i++){const x=(i*83+T*900)%W;c.fillRect(x,((i*197+T*1600)%H),3,80);}}
      const p=this.dist/this.goal;c.fillStyle='rgba(255,255,255,.85)';rr(c,120,112,W-240,34,17);c.fill();c.fillStyle='#ff8cc0';rr(c,120,112,Math.max(34,(W-240)*p),34,17);c.fill();MED.ambulance(c,120+Math.max(0,(W-240)*p-17),128,.42);txt(c,PLACES[this.place].ja,W-110,128,16,'#ff4d6d','left');
      MED.love(c,W-150,180,.6);txt(c,`× ${this.hearts}`,W-124,182,26,'#ff4d7d','left');
      drawBtn(c,W/2,H-80,48,this.siren?'#ff4d6d':'#8a98b8','sound',!this.siren);txt(c,this.siren?'ピーポー！':'サイレン',W/2,H-18,20,'#fff');
      txtO(c,'◀',70,H-80,50,'#fff','rgba(0,0,0,.25)',6);txtO(c,'▶',W-70,H-80,50,'#fff','rgba(0,0,0,.25)',6);return;}
    this.drawPlaceBg(c,this.place);
    if(this.ph==='rescue'){const r=this.rs;MED.ambulance(c,140,H*.55+60,2.6);const aidDone=r.aided;
      if(!r.on){drawPt(c,this.pt,r.sx,r.sy,1.2,{t:T,sad:!aidDone,happy:aidDone&&Math.sin(T)>0,shake:this.aid==='cold'&&!aidDone?.2:0,sweat:this.aid==='heat'&&!aidDone,sick:this.aid==='heat'&&!aidDone});
        if(aidDone){const a=this.aid;if(a==='leg')MED.splint(c,r.sx+22,r.sy-8,.6);else if(a==='head')drawItem(c,'bandage',r.sx,r.sy-130,.6);else if(a==='heat')drawItem(c,'icepack',r.sx,r.sy-150,.8);else{c.fillStyle='#ffd0e0';rr(c,r.sx-50,r.sy-60,100,56,14);c.fill();}}
        if(!aidDone&&Math.sin(T*2)>.3)txtO(c,{leg:'いたいよ〜',head:'いたた…',heat:'あつい〜',cold:'さむい〜'}[this.aid],r.sx,r.sy-200,24,'#8a7aa8','#fff',6);}
      if(r.aided){const st=this.str||(this.str=new Dr({k:'stretcher',hx:260,hy:H*.86,r:60}));st.upd(1/60);
        if(r.on){c.save();c.translate(st.x,st.y);MED.stretcher(c,0,0,1.8);drawPt(c,this.pt,0,-14,.8,{t:T});c.restore();if(r.st!=='load'){c.strokeStyle=`rgba(255,95,162,${.5+Math.sin(T*6)*.4})`;c.lineWidth=6;c.setLineDash([12,8]);rr(c,20,H*.55-20,240,150,20);c.stroke();c.setLineDash([]);}}
        else{c.fillStyle='rgba(90,40,110,.15)';ell(c,st.x,st.y+30,60,10);MED.stretcher(c,st.x,st.y,1.8);if(st.held)targetMark(c,r.sx,r.sy-40,70);}}
      else if(this.aidTools){tray(c,H-84,120);for(const t of this.aidTools)if(!t.held)t.draw(c,1.3);for(const t of this.aidTools)if(t.held){targetMark(c,r.sx,r.sy-60,70);t.draw(c,1.5);}}
      fu(c,60,H-150,2.2,{point:1});rk(this,c,W-50,H-150,1.5);}
    else{const k=Math.min(1,this.bt/3.4);c.fillStyle='#fff4fa';hospitalFront(c,W/2+(1-k)*500,H*.55+10,360,260,this.t);MED.ambulance(c,-100+k*(W/2-10+100),H*.55+60,2.2);if(this.fin>0){fu(c,120,H-30,2.4,{cheer:1});drawRikki(c,W-90,H-30,{sc:1.8,t:T,happy:1});drawPt(c,this.pt,W/2,H-40,1,{t:T,happy:1,wave:1});}}},
  down(x,y){if(this.fin)return;
    if(this.ph==='call'){for(let i=0;i<12;i++){const p=this.key(i);if(hitC(x,y,p.x,p.y,40)){const k=this.keys[i];sfx('key');if(this.dial.length>=3)return;const want='119'[this.dial.length];if(k===want){this.dial+=k;ring(p.x,p.y,'#ff8cc0');hush();speak(k==='1'?'いち':'きゅう');if(this.dial==='119')good(this.kx,this.ky-34,1,'119！');}else{this.miss++;bad();this.dial='';say('ちがうよ。 1・1・9 だよ。 もういちど');}return;}}
      const cp=this.key(13);if(this.dial==='119'&&hitC(x,y,this.kx,cp.y+10,48)){this.ph='ringing';this.op=0;sfx('ring');setTimeout(()=>{if(scene===this)sfx('ring');},1000);}return;}
    if(this.ph==='ringing'&&this.asked){[['firetruck'],['ambulance']].forEach(([k],i)=>{const bx=this.kx+(i-.5)*140,by=this.ky+140;if(Math.abs(x-bx)<62&&Math.abs(y-by)<75){if(k==='ambulance'){good(bx,by,1);hush();speak('きゅうきゅう です！');speak('Ambulance, please!','en');this.ph='where';this.whereOpts=shuffle([this.place,...shuffle(Object.keys(PLACES).filter(p=>p!==this.place)).slice(0,2)]);setTimeout(()=>{if(scene===this){hush();speak('ばしょは どこ ですか？');speak(`${ptName(this.pt)}さんが いるのは ${PLACES[this.place].ja}だったね`);}},1600);}
      else{bad();this.miss++;sayWord('firetruck');setTimeout(()=>{if(scene===this)say('しょうぼうしゃは かじの とき。 きょうは けがを した ひとだから きゅうきゅうしゃ だね');},1400);}}});return;}
    if(this.ph==='where'){this.whereOpts.forEach((pl,i)=>{const by=this.ky-20+i*130+45;if(Math.abs(x-this.kx)<130&&Math.abs(y-by)<55){if(pl===this.place){good(this.kx,by,1);hush();speak(`${PLACES[pl].ja} です！`);speak(PLACES[pl].en,'en');this.ph='go';setTimeout(()=>{if(scene===this){hush();speak('わかりました。 すぐに いきます！');sfx('siren');setTimeout(()=>{if(scene===this)this.startDrive();},2400);}},1500);}else{bad();this.miss++;say(`${ptName(this.pt)}さんは ${PLACES[this.place].ja}に いるよ`);}}});return;}
    if(this.ph==='drive'){if(hitC(x,y,W/2,H-80,60)){this.siren=!this.siren;if(this.siren)sfx('siren');else sfx('tap');return;}if(x<W/2)this.lane=Math.max(0,this.lane-1);else this.lane=Math.min(2,this.lane+1);sfx('whoosh');return;}
    if(this.ph==='rescue'){const r=this.rs;if(!r.aided){for(const t of this.aidTools||[]){if(t.hit(x,y)){if(t.k!==AIDS[this.aid].tool){this.miss++;wrongTool(t);return;}t.held=true;sfx('tap');sayWord(t.k);return;}}return;}
      const st=this.str;if(!st)return;if(!r.on&&st.hit(x,y)){st.held=true;st.ox=st.x-x;st.oy=st.y-y;sayWord('stretcher');return;}
      if(r.on&&r.st!=='load'&&x<280&&y>H*.55-30&&y<H*.55+140){this.load();return;}
      if(r.on&&r.st!=='load'&&st.hit(x,y)){st.held=true;st.ox=st.x-x;st.oy=st.y-y;}}},
  load(){const r=this.rs,st=this.str;r.st='load';good(140,H*.55,2,'のせたよ！');st.hx=140;st.hy=H*.55+50;st.x=st.hx;st.y=st.hy;},
  move(x,y){if(this.ph!=='rescue')return;const t=(this.aidTools||[]).find(q=>q.held);if(t){t.x=x;t.y=y;}if(this.str&&this.str.held){this.str.x=x+this.str.ox;this.str.y=y+this.str.oy;}},
  up(x,y){if(this.ph!=='rescue')return;const r=this.rs;const t=(this.aidTools||[]).find(q=>q.held);if(t){t.held=false;if(Math.hypot(x-r.sx,y-(r.sy-60))<120){r.aided=1;this.aidTools=[];good(r.sx,r.sy-80,2,'てあて OK！');say(AIDS[this.aid].done+'！ つぎは たんかで はこぼう');}return;}
    if(!this.str||!this.str.held)return;const st=this.str;st.held=false;
    if(!r.on&&Math.hypot(st.x-r.sx,st.y-(r.sy-30))<120){r.on=1;st.hx=r.sx-40;st.hy=r.sy;good(r.sx,r.sy-60,1,'せーの！');say('たんかに のせたよ！ きゅうきゅうしゃに はこぼう');}
    else if(r.on&&st.x<300&&st.y<H*.55+160)this.load();},
  hint(){if(this.fin)return null;if(this.ph==='call'){if(this.dial==='119')return{x:this.kx,y:this.key(13).y+10};const i=this.keys.indexOf('119'[this.dial.length]);const p=this.key(i);return{x:p.x,y:p.y};}
    if(this.ph==='ringing')return this.asked?{x:this.kx+70,y:this.ky+140}:null;
    if(this.ph==='where'){const i=this.whereOpts.indexOf(this.place);return{x:this.kx,y:this.ky-20+i*130+45};}
    if(this.ph==='drive'){if(!this.siren)return{x:W/2,y:H-80};return null;}
    if(this.ph==='rescue'){const r=this.rs;if(!r.aided){const t=(this.aidTools||[]).find(q=>q.k===AIDS[this.aid].tool);return t?{x:t.hx,y:t.hy,x2:r.sx,y2:r.sy-60}:null;}if(!this.str||r.st==='load')return null;if(!r.on)return{x:this.str.x,y:this.str.y,x2:r.sx,y2:r.sy-30};return{x:this.str.x,y:this.str.y,x2:160,y2:H*.55+40};}return null;},
  hintText(){return{call:'1・1・9 と おして みどりの ボタン',ringing:'きゅうきゅうしゃを えらぼう',where:'ばしょを えらぼう',drive:'ひだり みぎを タッチして ハートを あつめよう',rescue:'てあての どうぐ → たんか'}[this.ph]||'';}};
function pick2(a,seed){return a[Math.abs(Math.floor(seed))%a.length];}

// ================= きゅうきゅうしゃ（119 → しゅつどう → きゅうじょ） =================
SCN.ambulance={bg:'#e8f4ff',song:'hero',
  enter(){this.ph='call';this.dial='';this.miss=0;this.fin=0;this.op=0;this.t=0;this.lay();this.patient=pick(['panda','bear','pig','rabbit']);
    say('たいへん！ こうえんで けがを した ひとが いるよ！ きゅうきゅうしゃを よぶ ばんごうは 1・1・9。 でんわを かけよう！');},
  lay(){this.kx=W/2;this.ky=H*.36;},
  key(i){const r=Math.floor(i/3),c=i%3;return{x:this.kx+(c-1)*96,y:this.ky+80+r*84};},
  keys:['1','2','3','4','5','6','7','8','9','＊','0','＃'],
  startDrive(){this.ph='drive';this.lane=1;this.ax=W/2;this.dist=0;this.goal=7200;this.speed=0;this.cars=[];this.items=[];this.siren=0;this.hearts=0;this.bumpT=0;this.spawn=1;this.hurry=0;
    say('しゅつどう！ サイレンの ボタンを おして、 ひだりと みぎを タッチして すすもう');},
  laneX(l){return W/2+(l-1)*150;},
  update(dt){this.t+=dt;
    if(this.ph==='ringing'){this.op+=dt;if(this.op>2.2&&!this.asked){this.asked=1;hush();speak('はい、 119ばん です。 かじ ですか？ きゅうきゅう ですか？');bub={text:'はい 119ばんです。 かじですか？ きゅうきゅうですか？',t:0,life:4};}}
    if(this.ph==='drive'){const tgt=this.bumpT>0?120:(this.siren?420:330);this.speed+=(tgt-this.speed)*Math.min(1,dt*2);this.dist+=this.speed*dt;if(this.bumpT>0)this.bumpT-=dt;
      this.ax+=(this.laneX(this.lane)-this.ax)*Math.min(1,dt*10);if(this.siren){this.sirenT=(this.sirenT||0)+dt;if(this.sirenT>1.2){this.sirenT=0;sfx('siren1');}}
      this.spawn-=dt;if(this.spawn<=0&&this.dist<this.goal-700){this.spawn=rand(.9,1.5);const l=Math.floor(Math.random()*3);this.cars.push({l,x:this.laneX(l),y:-120,col:pick(['#ff6f91','#5aa8ff','#ffd23a','#6cd08a','#b48cff']),v:rand(120,180),side:0});
        if(Math.random()<.7){const l2=(l+1+Math.floor(Math.random()*2))%3;this.items.push({l:l2,x:this.laneX(l2),y:-80,got:0});}}
      const AY=H-230;for(const c of this.cars){c.y+=(this.speed-c.v)*dt;if(this.siren&&c.y>AY-520&&c.y<AY+40&&!c.side){c.side=c.l===0?-1:c.l===2?1:(this.lane===0?1:-1);if(!this.yieldSaid){this.yieldSaid=1;say('サイレンを きいて くるまが みちを ゆずってくれたよ！');}}
        const tx=c.side?(c.side<0?46:W-46):this.laneX(c.l);c.x+=(tx-c.x)*Math.min(1,dt*4);
        if(!c.hit&&!c.side&&Math.abs(c.x-this.ax)<70&&Math.abs(c.y-AY)<110){c.hit=1;this.bumpT=.8;this.miss++;sfx('bump');say(this.siren?'あぶない！ よけよう':'サイレンを ならすと くるまが よけてくれるよ！');}}
      this.cars=this.cars.filter(c=>c.y<H+200&&c.y>-400);
      for(const it of this.items){it.y+=this.speed*dt;if(!it.got&&Math.abs(it.x-this.ax)<60&&Math.abs(it.y-AY)<70){it.got=1;this.hearts++;sfx('coin');burst(it.x,it.y,6,'heart');hush();speak(String(this.hearts),'en');}}
      this.items=this.items.filter(i=>i.y<H+100&&!i.got);
      if(this.dist>=this.goal){this.ph='rescue';this.rs={st:'stop',t:0,sx:W/2+160,sy:H*.7,on:0};sfx('siren');hush();speak(`とうちゃく！ ハートを ${this.hearts}こ あつめたよ`);speak(`${numEn(this.hearts)} hearts!`,'en');
        setTimeout(()=>{if(scene===this)say(`${WORDS[this.patient][0]}さんが あしを けがしてる！ たんかを ${WORDS[this.patient][0]}さんの ところへ もっていこう`);},2600);}}
    if(this.ph==='rescue'){const r=this.rs;r.t+=dt;if(r.st==='load'){r.lt=(r.lt||0)+dt;if(r.lt>1.2){this.ph='back';this.bt=0;sfx('siren');say('びょういんへ しゅっぱつ！ ピーポーピーポー');}}}
    if(this.ph==='back'){this.bt+=dt;if(this.bt>4.2&&!this.fin){this.fin=.01;RK.clap=2;say('びょういんに ついた！ もう だいじょうぶ！ ありがとう きゅうきゅうたいいんさん！');}}
    if(this.fin>0){this.fin+=dt;if(this.fin>2.4&&this.fin<9){this.fin=9;celebrate('ambulance',starsFor(this.miss));}}},
  drawCar(c,x,y,col){c.save();c.translate(x,y);c.fillStyle='rgba(0,0,0,.18)';rr(c,-34,-54,72,112,18);c.fill();c.fillStyle=gfill(c,-10,-20,70,col);rr(c,-36,-58,72,112,18);c.fill();c.strokeStyle=shade(col,-.3);c.lineWidth=3;c.stroke();c.fillStyle='#bfe8ff';rr(c,-26,-36,52,26,8);c.fill();rr(c,-24,20,48,18,6);c.fill();c.fillStyle='#ffe88a';circ(c,-22,52,5);circ(c,22,52,5);c.restore();},
  drawAmbTop(c,x,y){c.save();c.translate(x,y);if(this.bumpT>0)c.rotate(Math.sin(this.bumpT*40)*.08);c.fillStyle='rgba(0,0,0,.18)';rr(c,-38,-66,80,136,18);c.fill();c.fillStyle=gfill(c,-10,-20,80,'#ffffff');rr(c,-40,-70,80,136,18);c.fill();c.strokeStyle='#9aa8c0';c.lineWidth=3;c.stroke();
    c.fillStyle='#ff4d6d';c.fillRect(-40,-10,80,12);c.fillStyle='#bfe8ff';rr(c,-30,-62,60,24,8);c.fill();crossSign(c,0,26,14);const on=this.siren&&Math.floor(T*8)%2;c.fillStyle=on?'#ff2030':'#ff9aa0';rr(c,-30,-34,26,12,5);c.fill();c.fillStyle=!on&&this.siren?'#3a8aff':'#a8c8ff';rr(c,4,-34,26,12,5);c.fill();
    if(this.siren){c.fillStyle=`rgba(255,60,60,${on?.25:0})`;circ(c,-17,-28,40);c.fillStyle=`rgba(60,120,255,${on?0:.25})`;circ(c,17,-28,40);}c.restore();},
  draw(c){const L=-OX/SC-2,R=W+OX/SC+2;
    if(this.ph==='call'||this.ph==='ringing'){c.fillStyle=vfill(c,-OY/SC,H,'#ffe0ea',.1,-.05);c.fillRect(L,-OY/SC-2,R-L,H+OY/SC*2+4);
      panel(c,this.kx-170,this.ky-150,340,H*.62+120,40,'#3a4260','#8a98c0',6);c.fillStyle='#e8f6ff';rr(c,this.kx-146,this.ky-126,292,H*.62+70,24);c.fill();
      if(this.ph==='call'){txt(c,'きゅうきゅうは なんばん？',this.kx,this.ky-96,22,'#5a6a8a');c.fillStyle='#fff';rr(c,this.kx-120,this.ky-70,240,70,16);c.fill();txt(c,this.dial||' ',this.kx,this.ky-34,54,'#ff4d6d',undefined,POP,400);
        const nextD='119'[this.dial.length];this.keys.forEach((k,i)=>{const p=this.key(i);const g=k===nextD&&this.dial.length<3;c.fillStyle=g&&idle>3?'#ffe0ec':'#fff';circ(c,p.x,p.y,36);c.strokeStyle=g&&idle>3?'#ff5fa2':'#c8d4e8';c.lineWidth=4;c.stroke();txt(c,k,p.x,p.y+2,34,'#3a4260');});
        const cp=this.key(13);drawBtn(c,this.kx,cp.y+10,40,'#4cc86a','play',this.dial==='119');txt(c,'でんわ',this.kx,cp.y+66,18,'#4c9a6a');}
      else{txt(c,'119',this.kx,this.ky-60,64,'#ff4d6d',undefined,POP,400);if(!this.asked){const k=(T*2)%1;c.strokeStyle=`rgba(76,200,106,${1-k})`;c.lineWidth=6;c.beginPath();c.arc(this.kx,this.ky+120,40+k*60,0,TAU);c.stroke();MED.phone(c,this.kx,this.ky+120,1.4);txt(c,'プルルル…',this.kx,this.ky+220,28,'#5a6a8a');}
        else{txt(c,'かじ？ きゅうきゅう？',this.kx,this.ky+10,26,'#5a6a8a');[['firetruck','かじ'],['ambulance','きゅうきゅう']].forEach(([k,n],i)=>{const x=this.kx+(i-.5)*140,y=this.ky+140;panel(c,x-62,y-70,124,150,20,'#fff',i?'#ff8cc0':'#ffb03a');drawThing(c,k,x,y-10,1.25);txt(c,n,x,y+56,20,'#5a4a6a');});}}
      fu(c,70,H-30,2.2,{point:1});rk(this,c,W-60,H-30,1.6);return;}
    if(this.ph==='drive'){c.fillStyle='#8ee07a';c.fillRect(L,-OY/SC-2,R-L,H+OY/SC*2+4);c.fillStyle='#7a7a8a';c.fillRect(W/2-240,-OY/SC-2,480,H+OY/SC*2+4);c.fillStyle='#fff';c.fillRect(W/2-240,-OY/SC,8,H+OY/SC*2);c.fillRect(W/2+232,-OY/SC,8,H+OY/SC*2);
      const off=this.dist%120;for(const lx of[W/2-75,W/2+75])for(let y=-120+off;y<H+120;y+=120)c.fillRect(lx-4,y,8,60);
      for(let y=-200+(this.dist*.5%260);y<H+200;y+=260){for(const s of[-1,1]){c.fillStyle='#4cae4a';circ(c,W/2+s*290,y,34);c.fillStyle='#6cd06a';circ(c,W/2+s*282,y-8,24);}}
      for(const it of this.items)MED.love(c,it.x,it.y+Math.sin(T*6)*4,.8);for(const car of this.cars)this.drawCar(c,car.x,car.y,car.col);this.drawAmbTop(c,this.ax,H-230);
      const p=this.dist/this.goal;c.fillStyle='rgba(255,255,255,.85)';rr(c,120,112,W-180,34,17);c.fill();c.fillStyle='#ff8cc0';rr(c,120,112,Math.max(34,(W-180)*p),34,17);c.fill();MED.ambulance(c,120+Math.max(0,(W-180)*p-17),128,.42);txt(c,'🚩',W-72,128,24,'#fff');
      MED.love(c,W-90,180,.6);txt(c,`× ${this.hearts}`,W-64,182,26,'#ff4d7d','left');
      drawBtn(c,W/2,H-80,48,this.siren?'#ff4d6d':'#8a98b8','sound',!this.siren);txt(c,this.siren?'ピーポー！':'サイレン',W/2,H-18,20,'#fff');
      txtO(c,'◀',70,H-80,50,'#fff','rgba(0,0,0,.25)',6);txtO(c,'▶',W-70,H-80,50,'#fff','rgba(0,0,0,.25)',6);return;}
    // rescue / back
    c.fillStyle=vfill(c,-OY/SC,H*.55,'#8fd8ff',.3,0);c.fillRect(L,-OY/SC-2,R-L,H);c.fillStyle='#8ee07a';c.fillRect(L,H*.55,R-L,H);c.fillStyle='#d8d8e0';c.fillRect(L,H*.55,R-L,90);
    if(this.ph==='rescue'){for(let i=0;i<3;i++){c.fillStyle='#8a5a3a';c.fillRect(470+i*-190,H*.42,16,70);c.fillStyle='#4cae4a';circ(c,478+i*-190,H*.42,50);}
      c.fillStyle='#c8905a';rr(c,380,H*.78,160,14,6);c.fill();
      const r=this.rs;MED.ambulance(c,140,H*.55+60,2.6);
      if(!r.on){drawAnimal(c,this.patient,r.sx,r.sy,1.2,{t:T,sad:1});drawItem(c,'bandage',r.sx+22,r.sy-14,.5);if(Math.sin(T*2)>.3)txtO(c,'いたいよ〜',r.sx,r.sy-190,24,'#8a7aa8','#fff',6);}
      const st=this.str||(this.str=new Dr({k:'stretcher',hx:260,hy:H*.86,r:60}));st.upd(1/60);
      if(r.on){c.save();c.translate(st.x,st.y);MED.stretcher(c,0,0,1.8);drawAnimal(c,this.patient,0,-14,.8,{t:T,happy:0});c.restore();if(r.st!=='load'){c.strokeStyle=`rgba(255,95,162,${.5+Math.sin(T*6)*.4})`;c.lineWidth=6;c.setLineDash([12,8]);rr(c,20,H*.55-20,240,150,20);c.stroke();c.setLineDash([]);}}
      else{c.fillStyle='rgba(90,40,110,.15)';ell(c,st.x,st.y+30,60,10);MED.stretcher(c,st.x,st.y,1.8);if(st.held)targetMark(c,r.sx,r.sy-40,70);}
      fu(c,60,H-20,2.2,{point:1});rk(this,c,W-50,H-20,1.5);}
    else{const k=Math.min(1,this.bt/3.4);hospitalFront(c,W/2+ (1-k)*500,H*.55+10,360,260,this.t);MED.ambulance(c,-100+k*(W/2-10+100),H*.55+60,2.2);if(this.fin>0){fu(c,120,H-30,2.4,{cheer:1});drawRikki(c,W-90,H-30,{sc:1.8,t:T,happy:1});drawAnimal(c,this.patient,W/2,H-40,1,{t:T,happy:1});}}},
  down(x,y){if(this.fin)return;
    if(this.ph==='call'){for(let i=0;i<12;i++){const p=this.key(i);if(hitC(x,y,p.x,p.y,40)){const k=this.keys[i];sfx('key');if(this.dial.length>=3)return;const want='119'[this.dial.length];if(k===want){this.dial+=k;hush();speak(k==='1'?'いち':'きゅう');}else{this.miss++;sfx('no');this.dial='';say('ちがうよ。 1・1・9 だよ。 もういちど');}return;}}
      const cp=this.key(13);if(this.dial==='119'&&hitC(x,y,this.kx,cp.y+10,48)){this.ph='ringing';this.op=0;sfx('ring');setTimeout(()=>{if(scene===this)sfx('ring');},1000);}return;}
    if(this.ph==='ringing'&&this.asked){[['firetruck'],['ambulance']].forEach(([k],i)=>{const bx=this.kx+(i-.5)*140,by=this.ky+140;if(Math.abs(x-bx)<62&&Math.abs(y-by)<75){if(k==='ambulance'){sfx('ding');hush();speak('きゅうきゅう です！ こうえんで けがを した ひとが います');speak('Ambulance, please!','en');this.ph='go';setTimeout(()=>{if(scene===this){hush();speak('わかりました。 すぐに いきます！');sfx('siren');setTimeout(()=>{if(scene===this)this.startDrive();},2600);}},3200);}else{sfx('no');this.miss++;sayWord('firetruck');setTimeout(()=>{if(scene===this)say('しょうぼうしゃは かじの とき。 きょうは けがを した ひとだから きゅうきゅうしゃ だね');},1400);}}});return;}
    if(this.ph==='drive'){if(hitC(x,y,W/2,H-80,60)){this.siren=!this.siren;if(this.siren){sfx('siren');}else sfx('tap');return;}if(x<W/2)this.lane=Math.max(0,this.lane-1);else this.lane=Math.min(2,this.lane+1);sfx('whoosh');return;}
    if(this.ph==='rescue'){const r=this.rs,st=this.str;if(!st)return;if(!r.on&&st.hit(x,y)){st.held=true;st.ox=st.x-x;st.oy=st.y-y;sayWord('stretcher');return;}
      if(r.on&&r.st!=='load'&&x<280&&y>H*.55-30&&y<H*.55+140){r.st='load';sfx('pop');st.hx=140;st.hy=H*.55+50;st.x=st.hx;st.y=st.hy;say('のせたよ！');}
      if(r.on&&r.st!=='load'&&st.hit(x,y)){st.held=true;st.ox=st.x-x;st.oy=st.y-y;}}},
  move(x,y){if(this.ph==='rescue'&&this.str&&this.str.held){this.str.x=x+this.str.ox;this.str.y=y+this.str.oy;}},
  up(x,y){if(this.ph!=='rescue'||!this.str||!this.str.held)return;const st=this.str,r=this.rs;st.held=false;
    if(!r.on&&Math.hypot(st.x-r.sx,st.y-(r.sy-30))<120){r.on=1;st.hx=r.sx-40;st.hy=r.sy;sfx('ding');say('たんかに のせたよ！ きゅうきゅうしゃに はこぼう');}
    else if(r.on&&st.x<300&&st.y<H*.55+160){r.st='load';sfx('pop');st.hx=140;st.hy=H*.55+50;say('のせたよ！');}},
  hint(){if(this.fin)return null;if(this.ph==='call'){if(this.dial==='119')return{x:this.kx,y:this.key(13).y+10};const i=this.keys.indexOf('119'[this.dial.length]);const p=this.key(i);return{x:p.x,y:p.y};}
    if(this.ph==='ringing')return this.asked?{x:this.kx+70,y:this.ky+140}:null;
    if(this.ph==='drive'){if(!this.siren)return{x:W/2,y:H-80};return null;}
    if(this.ph==='rescue'&&this.str){const r=this.rs;if(r.st==='load')return null;if(!r.on)return{x:this.str.x,y:this.str.y,x2:r.sx,y2:r.sy-30};return{x:this.str.x,y:this.str.y,x2:160,y2:H*.55+40};}return null;},
  hintText(){return{call:'1・1・9 と おして みどりの ボタン',ringing:'きゅうきゅうしゃを えらぼう',drive:'ひだり みぎを タッチして ハートを あつめよう',rescue:'たんかを うごかそう'}[this.ph]||'';}};

// ================= firefighter =================
SCN.fire={bg:'#ffe8e0',song:'hero',
  enter(){this.ph='alarm';this.t=0;this.fin=0;this.helm=false;this.d=0;this.v=0;this.cars=[{d:700,k:'bear',col:'#5aa8ff',off:0,move:false},{d:1400,k:'pig',col:'#ffd23a',off:0,move:false},{d:2100,k:'cat',col:'#6cd08a',off:0,move:false}];this.siren=0;
    this.fires=[];this.spray=null;this.lad=0;this.catDown=0;this.ft=0;this.lucky=false;sfx('siren');say('カンカンカン！ かじだ！ ヘルメットを タッチして かぶろう！');},
  win(i){return{x:170+(i%3)*130,y:H*.2+Math.floor(i/3)*150};},
  update(dt){this.t+=dt;if(this.siren>0)this.siren-=dt;
    if(this.ph==='drive'){const car=this.cars.find(c=>!c.move&&c.d>this.d);const block=car&&car.d-this.d<330;if(block){this.v=Math.max(0,this.v-600*dt);if(this.v<5&&!car.said){car.said=1;say('くるまが とおせんぼ！ ウーウーボタンで サイレンを ならそう！');}}else this.v=Math.min(420,this.v+300*dt);this.d+=this.v*dt;
      for(const c of this.cars)if(c.move)c.off=Math.min(1,c.off+dt*2);if(this.d>2700){this.ph='fire';this.t=0;this.setupFire();}}
    if(this.ph==='fire'){this.ft+=dt;const sp=this.spray;if(sp){for(const f of this.fires)if(f.hp>0&&Math.hypot(sp.x-f.x,sp.y-f.y)<80){f.hp-=dt*1.1;if(Math.random()<dt*8)puff(f.x+rand(-20,20),f.y-20,1,'#d8d8e0');if(f.hp<=0){sfx('ding');burst(f.x,f.y,12,'star');rkCheer();const left=this.fires.filter(q=>q.hp>0).length;say(left?pick(['きえた！','ジュワ〜！ あと '+left+'つ']):'ぜんぶ きえた！');if(!left){this.lucky=this.ft<14;setTimeout(()=>{if(scene===this){this.ph='rescue';this.t=0;say('あれ？ うえの まどに ねこちゃんが！ はしごボタンで たすけよう！');}},1400);}}}
        if(Math.random()<dt*30)parts.push({x:sp.x+rand(-10,10),y:sp.y,vx:rand(-60,60),vy:rand(-40,80),life:.5,t:0,kind:'drop',col:'#8ad0ff'});}}
    if(this.ph==='rescue'){if(this.ladGo)this.lad=Math.min(1,this.lad+dt*.6);if(this.catDown>0){this.catDown+=dt;if(this.catDown>2.2&&!this.fin){this.fin=.01;sfx('fanfare');confetti(90);say('ねこちゃんを たすけた！ しょうぼうし ふーちゃん、ありがとう！');}}}
    if(this.fin>0){this.fin+=dt;if(this.fin>3&&this.fin<9){this.fin=9;celebrate('fire',this.lucky);}}},
  setupFire(){this.fires=[0,1,2,3,4].map(i=>{const w=this.win(i);return{x:w.x,y:w.y+40,hp:1};});sfx('boom');say('ついた！ ゆびで おみずを かけて ひを けそう！');},
  draw(c){const ph=this.ph,fh=fukaHead(0,0,1);
    if(ph==='alarm'){c.fillStyle='#fff0e8';c.fillRect(-400,0,W+800,H);c.fillStyle='#e8d0c8';c.fillRect(-400,H*.7,W+800,H);c.fillStyle='#c82a2a';rr(c,40,140,520,70,14);c.fill();c.fillStyle='#fff';c.font=`36px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.fillText('しょうぼうしょ',W/2,176);
      const r=Math.sin(T*30)*.2;c.save();c.translate(W/2,270);c.rotate(r);c.fillStyle='#ffd23a';c.beginPath();c.arc(0,0,40,Math.PI,TAU);c.lineTo(40,10);c.lineTo(-40,10);c.fill();c.fillStyle='#c89000';circ(c,0,16,8);c.restore();
      drawFireTruck(c,W/2+60,H*.66,1.3,T,0,1);
      if(!this.helm){c.fillStyle='#8a6a4a';c.fillRect(440,H*.38,10,30);drawHelmet(c,445,H*.38+40,3+Math.sin(T*5)*.2);drawHand(c,470,H*.38+60,T);}
      drawFuka(c,140,H*.9,{outfit:outfit(),t:T,sc:3,cheer:this.helm,point:!this.helm});if(this.helm)drawHelmet(c,140,H*.9-44*3*.98-4,3.3);drawRikki(c,280,H*.92,{sc:2,t:T,clap:RK.clap});this.rkPos={x:280,y:H*.92,sc:2};
      if(this.helm){drawBtn(c,W/2,H*.5,56,'#ff3a3a','next',true);c.fillStyle='#c82a2a';c.font=`800 24px ${FONT}`;c.textAlign='center';c.fillText('しゅつどう！',W/2,H*.5+80);}return;}
    if(ph==='drive'){const d=this.d;skyBg(c,'#8fd8ff','#e6f8ff',H*.5);for(let i=-1;i<6;i++){const x=i*200-((d*.3)%200);c.fillStyle='#f4e8f0';rr(c,x,H*.3,150,H*.2,6);c.fill();c.fillStyle='#bfe8ff';for(let k=0;k<3;k++)c.fillRect(x+15+k*45,H*.34,30,26);}
      c.fillStyle='#8a8aa0';c.fillRect(-400,H*.5,W+800,H*.3);c.fillStyle='#fff';for(let x=-((d)%120);x<W+120;x+=120)c.fillRect(x,H*.64,60,8);c.fillStyle='#a8e07a';c.fillRect(-400,H*.8,W+800,H);
      for(const car of this.cars){const x=200+(car.d-d);if(x<-200||x>W+200)continue;const y=H*.7-car.off*120;c.save();c.translate(x,y);c.fillStyle=car.col;rr(c,-70,-60,140,50,14);c.fill();rr(c,-40,-92,90,40,14);c.fill();c.fillStyle='#bfe8ff';rr(c,-30,-86,32,26,6);c.fill();c.save();c.beginPath();c.rect(-30,-86,32,26);c.clip();drawAnimal(c,car.k,-14,-52,.3,{t:T,happy:car.move});c.restore();c.fillStyle='#3a3a4a';circ(c,-40,-10,14);circ(c,40,-10,14);c.restore();if(car.move&&car.off<1){c.fillStyle='#fff';c.font=`800 20px ${FONT}`;c.textAlign='center';c.fillText('どうぞ！',x,y-110);}}
      drawFireTruck(c,W*.28,H*.72,.9,d/40,0,this.siren>0);if(this.siren>0){c.fillStyle='#fff';c.font=`36px ${POP}`;c.textAlign='center';c.fillText('ウーウー！',W*.35,H*.42);}
      c.fillStyle='#ff3a3a';circ(c,W/2,H-110,66);c.fillStyle='#fff';c.font=`800 26px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('ウーウー',W/2,H-110);
      c.fillStyle='rgba(255,255,255,.9)';rr(c,110,108,380,30,15);c.fill();c.fillStyle='#ff5f6f';rr(c,110,108,380*clamp(d/2700,0,1),30,15);c.fill();drawFlame(c,500,124,.35,T);return;}
    // fire / rescue scene
    skyBg(c,this.fires.some(f=>f.hp>0)?'#ffb08a':'#8fd8ff','#fff0e0',H*.8);c.fillStyle='#a8e07a';c.fillRect(-400,H*.8,W+800,H);c.fillStyle='#8a8aa0';c.fillRect(-400,H*.78,W+800,40);
    c.fillStyle=vfill(c,H*.08,H*.8,'#f4e0c8',.05,-.08);rr(c,90,H*.08,420,H*.72,10);c.fill();c.fillStyle='#c86a4a';c.fillRect(80,H*.08-16,440,24);
    for(let i=0;i<6;i++){const w=this.win(i);c.fillStyle=this.fires[i]&&this.fires[i].hp>0?'#5a2a1a':'#bfe8ff';rr(c,w.x-45,w.y-40,90,86,8);c.fill();c.strokeStyle='#fff';c.lineWidth=6;c.stroke();}
    const cw=this.win(5);if(this.catDown<=0){drawAnimal(c,'cat',cw.x,cw.y+44,.5,{t:T,sad:ph!=='rescue'||!this.lad,happy:this.lad>=1});}
    for(const f of this.fires)if(f.hp>0)drawFlame(c,f.x,f.y,.6+f.hp*.9,T+f.x);
    for(const f of this.fires)if(f.hp<=0&&Math.random()<.02)puff(f.x,f.y-30,1,'#e8e8f0');
    const tx=150,ty=H*.84;drawFireTruck(c,tx,ty,.9,0,ph==='rescue'?this.lad*.95:0,1);
    const nx=tx+60,ny=ty-150;if(this.spray){const sp=this.spray;c.strokeStyle='rgba(120,200,255,.8)';c.lineWidth=14;c.lineCap='round';c.beginPath();c.moveTo(nx,ny);c.quadraticCurveTo((nx+sp.x)/2,Math.min(ny,sp.y)-80,sp.x,sp.y);c.stroke();c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=5;c.stroke();}
    drawFuka(c,nx-20,ny+14,{outfit:outfit(),t:T,sc:1.8,point:!!this.spray,cheer:ph==='rescue'});drawHelmet(c,nx-20,ny+14-44*1.8-2,2);
    if(this.catDown>0){const k=clamp(this.catDown/1.4,0,1);drawAnimal(c,'cat',lerp(cw.x,nx+30,k),lerp(cw.y+44,ny+10,k),.5,{t:T,happy:1});}
    drawRikki(c,540,H*.95,{sc:1.7,t:T,clap:RK.clap});this.rkPos={x:540,y:H*.95,sc:1.7};
    if(ph==='rescue'&&this.lad<1&&!this.ladGo){drawBtn(c,W/2+60,H*.9,52,'#ffb03a','next',true);c.fillStyle='#8a4a1a';c.font=`800 22px ${FONT}`;c.textAlign='center';c.fillText('はしご',W/2+60,H*.9+74);}
    if(ph==='rescue'&&this.lad>=1&&this.catDown<=0){drawHand(c,cw.x+10,cw.y+20,T);}},
  down(x,y){const ph=this.ph;
    if(ph==='alarm'){if(!this.helm&&Math.abs(x-445)<70&&Math.abs(y-(H*.38+40))<70){this.helm=true;sfx('spark');rkCheer();say('ヘルメット よし！ しゅつどうボタンを タッチ！');return;}if(this.helm&&hitC(x,y,W/2,H*.5,70)){this.ph='drive';this.t=0;sfx('siren');say('しゅつどう！ ウーウー！');}return;}
    if(ph==='drive'){if(hitC(x,y,W/2,H-110,80)){this.siren=1.2;sfx('siren');const car=this.cars.find(c=>!c.move&&c.d>this.d&&c.d-this.d<700);if(car){car.move=true;setTimeout(()=>{if(scene===this){hush();speak(WORDS[car.k][0]+'さん「どうぞ！」');}},300);}}return;}
    if(ph==='fire'){this.spray={x,y};sfx('water');return;}
    if(ph==='rescue'){if(!this.ladGo&&hitC(x,y,W/2+60,H*.9,70)){this.ladGo=true;sfx('whoosh');say('はしごを のばすよ！');return;}const cw=this.win(5);if(this.lad>=1&&this.catDown<=0&&Math.abs(x-cw.x)<80&&Math.abs(y-cw.y)<90){this.catDown=.01;sfx('boing');hush();speak('にゃ〜ん！ ありがとう！');}}},
  move(x,y){if(this.spray){this.spray.x=x;this.spray.y=y;if(Math.random()<.05)sfx('water');}},
  up(){this.spray=null;},
  hint(){const ph=this.ph;if(ph==='alarm')return this.helm?{x:W/2,y:H*.5}:{x:445,y:H*.38+40};if(ph==='drive'){const car=this.cars.find(c=>!c.move&&c.d>this.d&&c.d-this.d<400);return car?{x:W/2,y:H-110}:null;}
    if(ph==='fire'){const f=this.fires.find(f=>f.hp>0);return f?{x:f.x,y:f.y}:null;}if(ph==='rescue'){if(!this.ladGo)return{x:W/2+60,y:H*.9};const cw=this.win(5);return this.lad>=1&&this.catDown<=0?{x:cw.x,y:cw.y}:null;}return null;},
  hintText(){return{alarm:'ヘルメットを タッチ',drive:'くるまが いたら ウーウーボタン',fire:'ひの ところを ゆびで おさえて おみずを かけよう',rescue:'はしごで ねこちゃんを たすけよう'}[this.ph]||'';}};

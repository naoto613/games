// ================= kakekko (race) =================
SCN.race={bg:'#c8a878',song:'play',
  enter(){this.round=0;this.fin=0;this.medals=[];this.setup();},
  setup(){this.ph='ready';this.t=0;this.D=1500;this.relay=this.round===1;const sp=this.relay?[250,272,238]:[232,250,218];
    const ks=this.relay?[['dog','panda'],['cat','pig'],['rabbit','chick']]:[['dog'],['cat'],['rabbit']];
    this.run=[{me:1,x:0,v:0,lane:1,done:0}];ks.forEach((k,i)=>this.run.push({k,x:0,v:0,base:sp[i]*rand(.96,1.04),lane:[0,2,3][i],done:0}));this.order=[];this.pass=false;this.taps=0;
    say(this.relay?'つぎは リレー！ はんぶんで りっきーに バトンタッチ！ いっぱい タッチして はしろう！':'かけっこ！ がめんを いっぱい タッチすると はやく はしれるよ！');setTimeout(()=>{if(scene===this&&this.ph==='ready')this.count();},3200);},
  count(){this.ph='count';this.t=0;hush();speak('いちについて');setTimeout(()=>{if(scene===this){hush();speak('よーい');}},1200);setTimeout(()=>{if(scene===this){this.ph='run';this.t=0;sfx('boom');noise(.2,.4,3000);hush();speak('ドン！');}},2300);},
  laneY(l){return H*.5+l*H*.1;},
  update(dt){this.t+=dt;if(this.ph!=='run'&&this.ph!=='goal'){this.fin>0&&this.tick(dt);return;}
    for(const r of this.run){if(r.done)continue;if(r.me){r.v=Math.max(0,r.v-260*dt);}else{const tgt=r.base*(1+Math.sin(this.t*1.3+r.lane)*.08);r.v+=(tgt-r.v)*Math.min(1,dt*2);}
      r.x+=r.v*dt;if(this.relay&&r.x>=this.D/2&&!r.hand){r.hand=1;if(r.me){this.pass=true;sfx('spark');rkCheer();say('バトンタッチ！ りっきー がんばれ〜！');r.v*=.5;}}
      if(r.x>=this.D){r.done=1;r.x=this.D;this.order.push(r);if(r.me){const pl=this.order.length;sfx(pl===1?'fanfare':'chin');if(pl===1)confetti(70);say(pl===1?'いっとうしょう！ やったー！':`${pl}ばん！ よく がんばったね！`);this.ph='goal';this.t=0;this.medals.push(pl);}}}
    if(this.ph==='goal'&&this.t>3.2){for(const r of this.run)if(!r.done){r.done=1;this.order.push(r);}this.round++;if(this.round>=2){this.fin=.01;this.ph='end';}else this.setup();}
    this.tick(dt);},
  tick(dt){if(this.fin>0){this.fin+=dt;if(this.fin>2&&this.fin<9){this.fin=9;celebrate('race',this.medals.every(m=>m===1));}}},
  draw(c){const me=this.run[0],cam=clamp(me.x-W*.35,0,this.D+200-W);drawSchoolyard(c,H*.42);
    c.fillStyle='#d8b890';c.fillRect(-400,H*.44,W+800,H*.46);for(let l=0;l<=4;l++){c.fillStyle='#fff';c.fillRect(-400,this.laneY(l)-H*.05+4,W+800,4);}
    const sx=x=>x-cam+60;c.fillStyle='#fff';c.fillRect(sx(0)-4,H*.44,8,H*.42);const gx=sx(this.D);c.fillStyle='#fff';c.fillRect(gx-3,H*.44,6,H*.42);if(!this.order.length||!this.order[0].me&&this.ph==='run'||this.ph==='run'){c.strokeStyle='#ff5f6f';c.lineWidth=4;c.beginPath();c.moveTo(gx,H*.44);c.lineTo(gx,H*.86);c.stroke();}SPECIAL_THING.flagcheck(c,gx+30,H*.4,1.4);
    if(this.relay){const hx=sx(this.D/2);c.fillStyle='rgba(255,255,255,.5)';c.fillRect(hx-30,H*.44,60,H*.42);c.fillStyle='#fff';c.font=`800 18px ${FONT}`;c.textAlign='center';c.fillText('バトンゾーン',hx,H*.43);}
    const rs=this.run.slice().sort((a,b)=>a.lane-b.lane);for(const r of rs){const x=sx(r.x),y=this.laneY(r.lane)+H*.04,mv=this.ph==='run'&&!r.done&&r.v>20;
      if(r.me){if(this.relay&&this.pass){drawRikki(c,x,y,{sc:1.6,t:T,moving:mv,dir:2,happy:r.done});SPECIAL_THING.baton(c,x+24,y-50,.6);}else{drawFuka(c,x,y,{outfit:outfit(),t:T*(1+r.v/200),sc:1.7,moving:mv,dir:mv?2:0,cheer:r.done});if(this.relay)SPECIAL_THING.baton(c,x+26,y-70,.6);}
        if(this.relay&&!this.pass){drawRikki(c,sx(this.D/2)+20,y,{sc:1.4,t:T,wave:1});}}
      else{const k=this.relay&&r.x>=this.D/2?r.k[1]||r.k[0]:r.k[0];drawAnimal(c,k,x,y,.6,{t:T,hop:mv?Math.abs(Math.sin(T*12+r.lane))*.6:0,happy:r.done});}}
    const pos=[...this.run].sort((a,b)=>b.x-a.x).indexOf(me)+1;c.fillStyle='rgba(255,255,255,.9)';rr(c,20,112,180,50,25);c.fill();c.fillStyle='#ff5f6f';c.font=`800 24px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(`いま ${pos}ばん`,110,137);
    for(let i=0;i<2;i++){if(this.medals[i])drawMedal(c,W-120+i*60,140,.9,['#ffd23a','#c8c8d8','#e8a060','#aac'][this.medals[i]-1]);else{c.fillStyle='rgba(255,255,255,.6)';circ(c,W-120+i*60,148,18);}}
    if(this.ph==='count'){c.font=`54px ${POP}`;c.textAlign='center';c.fillStyle='#ff5f6f';c.fillText(this.t<1.2?'いちについて':'よーい',W/2,H*.25);}
    if(this.ph==='run'&&this.t<.8){c.font=`90px ${POP}`;c.textAlign='center';c.fillStyle='#ff3a5a';c.fillText('ドン！',W/2,H*.25);}
    if(this.ph==='run'){c.fillStyle='rgba(255,255,255,.85)';rr(c,W/2-170,H-100,340,64,32);c.fill();c.fillStyle='#ff5fa2';c.font=`800 26px ${FONT}`;c.fillText('タッチ タッチ！ はしれ〜！',W/2,H-68);}
    if(this.ph==='goal'){const pl=this.medals[this.medals.length-1];c.fillStyle='rgba(255,255,255,.95)';rr(c,W/2-150,H*.18,300,130,30);c.fill();drawMedal(c,W/2-80,H*.18+70,1.5,['#ffd23a','#c8c8d8','#e8a060','#aac'][pl-1]);c.fillStyle='#ff5fa2';c.font=`40px ${POP}`;c.textAlign='center';c.fillText(`${pl}ばん`,W/2+50,H*.18+70);}},
  down(x,y){if(this.ph!=='run')return;const me=this.run[0];if(me.done)return;me.v=Math.min(this.relay&&this.pass?470:520,me.v+(this.relay&&this.pass?85:95));this.taps++;if(this.taps%3===0)sfx('tap');burst(x,y,2,'star');},
  hint(){return this.ph==='run'?{x:W/2,y:H*.3}:null;},
  hintText(){return 'がめんを どんどん タッチ！';}};

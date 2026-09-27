// ================= obstacle race =================
SCN.obst={bg:'#c8a878',song:'play',
  enter(){this.x=0;this.y=0;this.vy=0;this.v=0;this.ph='ready';this.t=0;this.fin=0;this.st=0;this.stun=0;this.grab=0;this.net=0;
    this.obs=[{k:'hurdle',x:500},{k:'hurdle',x:850},{k:'net',x:1250,w:420},{k:'bread',x:1950},{k:'tire',x:2350,w:360},{k:'hurdle',x:2950},{k:'hurdle',x:3250}];this.GOAL=3650;
    say('しょうがいぶつ きょうそう！ ハードルは タッチで ジャンプ！ あみと タイヤは いっぱい タッチ！ パンは ジャンプして とってね');setTimeout(()=>{if(scene===this){this.ph='count';this.t=0;hush();speak('よーい');setTimeout(()=>{if(scene===this){this.ph='run';this.t=0;sfx('boom');hush();speak('ドン！');}},1200);}},4200);},
  GY(){return H*.72;},
  zone(){return this.obs.find(o=>o.w&&this.x>o.x&&this.x<o.x+o.w);},
  update(dt){this.t+=dt;if(this.fin>0){this.fin+=dt;if(this.fin>3&&this.fin<9){this.fin=9;celebrate('obst',this.st===0);}}if(this.ph!=='run')return;
    if(this.stun>0){this.stun-=dt;return;}const z=this.zone();
    if(z){this.v=Math.max(0,this.v-400*dt);if(!z.said){z.said=1;say(z.k==='net'?'あみの した！ タッチ タッチで すすもう！':'タイヤ！ タッチ タッチで ふみこえよう！');}}
    else this.v=Math.min(300,this.v+500*dt);
    const br=this.obs.find(o=>o.k==='bread'&&!o.got);if(br&&this.x>br.x-40&&this.x<br.x+10&&this.y>-60){this.x=br.x-40;this.v=0;if(!br.said){br.said=1;say('パンの ところ！ タッチで ジャンプして パンを たべよう！');}}
    this.x+=this.v*dt;if(this.y<0||this.vy<0){this.vy+=1900*dt;this.y+=this.vy*dt;if(this.y>=0){this.y=0;this.vy=0;}}
    if(br&&this.y<-80&&Math.abs(this.x-br.x)<60){br.got=true;this.grab=1.2;sfx('munch');rkCheer();say('パン ゲット！ もぐもぐ！');}
    if(this.grab>0)this.grab-=dt;
    for(const o of this.obs)if(o.k==='hurdle'&&!o.hit&&!o.ok&&Math.abs(this.x-o.x)<22){if(this.y>-45){o.hit=true;this.st++;this.stun=.8;this.v=0;sfx('boing');say(pick(['あっ！ ころんじゃった','いたた… だいじょうぶ！']));}else{o.ok=true;sfx('spark');}}
    if(this.x>=this.GOAL){this.ph='goal';this.fin=.01;sfx('fanfare');confetti(80);const m=this.st===0?'きんメダル':this.st<=2?'ぎんメダル':'どうメダル';say(`ゴール！ ${m}！`);}},
  draw(c){const cam=this.x-W*.3,sx=x=>x-cam,gy=this.GY();drawSchoolyard(c,H*.4);c.fillStyle='#d8b890';c.fillRect(-400,gy-40,W+800,90);c.fillStyle='#fff';c.fillRect(-400,gy+48,W+800,4);c.fillRect(-400,gy-42,W+800,4);
    for(const o of this.obs){const x=sx(o.x);if(x<-500||x>W+500)continue;
      if(o.k==='hurdle'){c.save();if(o.hit){c.translate(x,gy);c.rotate(1.2);c.translate(-x,-gy);}SPECIAL_THING.hurdle(c,x,gy-26,1.5);c.restore();}
      else if(o.k==='net'){c.fillStyle='rgba(60,90,60,.5)';c.strokeStyle='#3a6a3a';c.lineWidth=2;const w=o.w;c.beginPath();c.moveTo(x,gy);c.quadraticCurveTo(x+w/2,gy-70+Math.sin(T*3)*4,x+w,gy);c.lineTo(x+w,gy+6);c.lineTo(x,gy+6);c.fill();for(let i=0;i<=w;i+=20){c.beginPath();c.moveTo(x+i,gy-Math.sin(i/w*Math.PI)*70);c.lineTo(x+i,gy+4);c.stroke();}for(let j=1;j<4;j++){c.beginPath();for(let i=0;i<=w;i+=10)c.lineTo(x+i,gy-Math.sin(i/w*Math.PI)*70*j/4);c.stroke();}}
      else if(o.k==='tire'){for(let i=0;i<5;i++)SPECIAL_THING.tire(c,x+30+i*70,gy+10,1.4);}
      else if(o.k==='bread'){c.fillStyle='#8a7a6a';c.fillRect(x-80,gy-230,6,230);c.fillRect(x+80,gy-230,6,230);c.fillRect(x-80,gy-232,166,6);if(!o.got)SPECIAL_THING.anpan(c,x,gy-160+Math.sin(T*3)*6,1.2);}}
    const gx=sx(this.GOAL);c.fillStyle='#fff';c.fillRect(gx-3,gy-60,6,110);if(this.ph!=='goal'){c.strokeStyle='#ff5f6f';c.lineWidth=5;c.beginPath();c.moveTo(gx,gy-110);c.lineTo(gx,gy+50);c.stroke();}SPECIAL_THING.flagcheck(c,gx+30,gy-110,1.4);
    const z=this.zone(),fx=W*.3,fy=gy-this.y+30;
    if(z&&z.k==='net'){c.save();c.translate(fx,fy);c.rotate(-1.4);drawFuka(c,0,0,{outfit:outfit(),t:T,sc:1.6,moving:1,dir:2});c.restore();}
    else drawFuka(c,fx,fy+(this.stun>0?Math.sin(this.stun*30)*3:0),{outfit:outfit(),t:T*(1+this.v/250),sc:1.8,moving:this.v>20,dir:this.v>20?2:0,cheer:this.y<-20||this.ph==='goal',eat:this.grab>0,oh:this.stun>0});
    if(this.grab>0)SPECIAL_THING.anpan(c,fx+10,fy-150,.8*this.grab);
    for(let i=0;i<4;i++){const k=['bear','panda','pig','chick'][i];drawAnimal(c,k,80+i*140,H*.93,.5,{t:T+i,happy:1,hop:Math.abs(Math.sin(T*6+i))*.3});}
    c.fillStyle='rgba(255,255,255,.9)';rr(c,110,108,380,30,15);c.fill();c.fillStyle='#6cd08a';rr(c,110,108,380*clamp(this.x/this.GOAL,0,1),30,15);c.fill();for(const o of this.obs){const px=110+380*o.x/this.GOAL;c.fillStyle='#ff5f6f';circ(c,px,123,5);}
    if(this.ph==='run'&&z){c.font=`36px ${POP}`;c.textAlign='center';c.fillStyle='#ff5fa2';c.fillText('タッチ タッチ！',W/2,H*.3);}
    if(this.ph==='count'){c.font=`60px ${POP}`;c.textAlign='center';c.fillStyle='#ff5f6f';c.fillText('よーい',W/2,H*.3);}
    if(this.ph==='goal'){c.fillStyle='rgba(255,255,255,.95)';rr(c,W/2-160,H*.16,320,120,30);c.fill();drawMedal(c,W/2-90,H*.16+64,1.4,this.st===0?'#ffd23a':this.st<=2?'#c8c8d8':'#e8a060');c.fillStyle='#ff5fa2';c.font=`36px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.fillText('ゴール！',W/2+40,H*.16+60);}},
  down(x,y){if(this.ph!=='run'||this.stun>0)return;const z=this.zone();if(z){this.x+=z.k==='net'?26:32;sfx(z.k==='net'?'squish':'tap');return;}if(this.y===0){this.vy=-760;sfx('boing');}},
  hint(){if(this.ph!=='run')return null;const h=this.obs.find(o=>(o.k==='hurdle'||o.k==='bread')&&!o.ok&&!o.hit&&!o.got&&o.x-this.x<200&&o.x-this.x>-10);return h||this.zone()?{x:W/2,y:H*.4}:null;},
  hintText(){return 'ハードルや パンは タッチで ジャンプ、あみや タイヤは いっぱい タッチ';}};

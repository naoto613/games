// ================= sea =================
Object.assign(SPECIAL_THING,{jelly:(c,x,y,s)=>drawSea(c,'jelly',x,y-6*s,.6*s,0),crab:(c,x,y,s)=>drawSea(c,'crab',x,y+6*s,.6*s,0),seahorse:(c,x,y,s)=>drawSea(c,'seahorse',x,y,.55*s,0),starfish:(c,x,y,s)=>drawSea(c,'starfish',x,y,.7*s,0)});
SCN.sea={bg:'#0a2a5a',song:'fuwa',
  enter(){this.D=H*3;this.sub={x:W/2,y:H*.3,tx:W/2,ty:H*.3,flip:false};this.cy=0;this.photo=[];this.flash=0;this.pic=null;this.chest={x:W/2,y:this.D-130,open:0};this.fin=0;this.drag=false;
    this.cr=[];for(const q of SEA){if(q.k==='whale'&&Math.random()<.35)continue;const n=q.k==='fish'?2:1;for(let i=0;i<n;i++)this.cr.push({k:q.k,x:rand(80,W-80),y:this.D*q.d+rand(-40,40)+i*160,dir:Math.random()<.5?-1:1,sp:q.k==='whale'?30:q.k==='crab'||q.k==='starfish'?(q.k==='crab'?25:0):rand(35,60),ph:rand(0,6),s:q.k==='whale'?1:q.k==='fish'?.9:1.1});}
    say('せんすいかんで うみの たんけん！ ゆびで うごかして、いきものを タッチして しゃしんを とろう！');},
  goal(){return 5;},
  update(dt){const S=this.sub;const dx=S.tx-S.x,dy=S.ty-S.y,dl=Math.hypot(dx,dy);if(dl>4){const sp=Math.min(dl,300*dt);S.x+=dx/dl*sp;S.y+=dy/dl*sp;if(Math.abs(dx)>6)S.flip=dx<0;if(Math.random()<dt*6)bubbles(S.x+(S.flip?80:-80),S.y-this.cy,1);}
    S.x=clamp(S.x,70,W-70);S.y=clamp(S.y,H*.15,this.D-120);this.cy+=(clamp(S.y-H*.45,0,this.D-H)-this.cy)*Math.min(1,dt*4);
    for(const q of this.cr){if(q.k==='jelly')q.y+=Math.sin(T*1.5+q.ph)*20*dt;q.x+=q.dir*q.sp*dt;if(q.x<60||q.x>W-60){q.dir*=-1;q.x=clamp(q.x,60,W-60);}}
    if(this.flash>0)this.flash-=dt*3;if(this.pic){this.pic.t+=dt;if(this.pic.t>2.2)this.pic=null;}
    if(this.chest.open>0){this.chest.open+=dt;if(this.chest.open>2.8&&!this.fin){this.fin=1;celebrate('sea',this.photo.includes('whale'));}}},
  draw(c){const cy=this.cy,D=this.D;const g=c.createLinearGradient(0,-cy,0,D-cy);g.addColorStop(0,'#7fd8ff');g.addColorStop(.4,'#2a8ad8');g.addColorStop(1,'#0a1a4a');c.fillStyle=g;c.fillRect(-400,0,W+800,H);
    c.save();c.translate(0,-cy);
    if(cy<H){c.fillStyle='rgba(255,255,255,.25)';for(let i=0;i<5;i++){c.beginPath();c.moveTo(i*140+Math.sin(T+i)*20,0);c.lineTo(i*140+60,H*.8);c.lineTo(i*140+100,H*.8);c.lineTo(i*140+50+Math.sin(T+i)*20,0);c.fill();}c.fillStyle='#bfefff';for(let x=-20;x<W+40;x+=40){c.beginPath();c.arc(x+Math.sin(T*2+x)*4,0,22,0,Math.PI);c.fill();}}
    c.fillStyle='#e8d8a0';c.beginPath();c.moveTo(-400,D-60);for(let x=-400;x<=W+400;x+=60)c.lineTo(x,D-70+Math.sin(x*.02)*14);c.lineTo(W+400,D+400);c.lineTo(-400,D+400);c.fill();
    for(let i=0;i<9;i++){const x=20+i*72,h=90+(i*37)%80;c.strokeStyle=i%2?'#3aa060':'#5cc46a';c.lineWidth=10;c.lineCap='round';c.beginPath();c.moveTo(x,D-60);for(let k=1;k<6;k++)c.lineTo(x+Math.sin(T*1.5+i+k)*10,D-60-h*k/5);c.stroke();}
    c.fillStyle='#6a6a8a';ell(c,90,D-70,70,40);ell(c,520,D-80,80,46);
    const ch=this.chest;drawChest(c,ch.x,ch.y+20,.9,ch.open>0?easeOut(Math.min(1,ch.open)):0,T);if(ch.open>.8){c.fillStyle='#fff';circ(c,ch.x,ch.y-60-ch.open*20,18);c.fillStyle='rgba(255,255,255,.6)';circ(c,ch.x-6,ch.y-66-ch.open*20,6);drawItem(c,'crown',ch.x,ch.y-110-ch.open*20,1.2);}
    for(const q of this.cr){if(q.y<cy-150||q.y>cy+H+150)continue;const got=this.photo.includes(q.k);drawSea(c,q.k,q.x,q.y+Math.sin(T*2+q.ph)*6,q.s,T+q.ph,q.dir>0);if(!got&&Math.sin(T*4+q.ph)>.7){c.fillStyle='rgba(255,255,255,.8)';star(c,q.x+40,q.y-40,8,3,4);c.fill();}}
    const S=this.sub;drawSub(c,S.x,S.y,1,T,S.flip);drawFuka(c,S.x,S.y+14,{outfit:outfit(),t:T,sc:.9,wave:1});
    c.restore();
    const dep=clamp(cy/(D-H),0,1);if(dep>.1){const sx=S.x,sy=S.y-cy;const lg=c.createRadialGradient(sx,sy,90,sx,sy,380);lg.addColorStop(0,'rgba(0,10,40,0)');lg.addColorStop(1,`rgba(0,10,40,${dep*.7})`);c.fillStyle=lg;c.fillRect(-400,0,W+800,H);}
    c.fillStyle='rgba(255,255,255,.9)';rr(c,20,104,W-40,72,24);c.fill();SEA.forEach((q,i)=>{const x=58+i*69,y=140,got=this.photo.includes(q.k);c.fillStyle=got?'#e8fbff':'#eef2f8';circ(c,x,y,28);c.save();if(!got)c.globalAlpha=.25;c.beginPath();c.arc(x,y,27,0,TAU);c.clip();drawSea(c,q.k,x,y+(q.k==='jelly'?-4:0),q.k==='whale'?.2:q.k==='fish'?.35:.45,0);c.restore();if(got){c.fillStyle='#6cd08a';circ(c,x+20,y+18,8);}});
    c.fillStyle='#fff';c.font=`800 20px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(this.photo.length>=this.goal()?'たからばこを さがそう！ うみの そこへ ↓':`しゃしん ${this.photo.length} / ${this.goal()}`,W/2,200);
    c.fillStyle='rgba(255,255,255,.3)';rr(c,W-22,230,8,H-300,4);c.fill();c.fillStyle='#ffd23a';circ(c,W-18,230+(H-300)*clamp(S.y/D,0,1),9);
    if(this.flash>0){c.fillStyle=`rgba(255,255,255,${this.flash})`;c.fillRect(-400,0,W+800,H);}
    if(this.pic){const p=this.pic,k=elastic(Math.min(1,p.t*2));c.save();c.translate(W/2,H*.5);c.rotate(-.05);c.scale(k,k);c.fillStyle='#fff';rr(c,-130,-150,260,300,10);c.fill();c.fillStyle='#2a8ad8';c.fillRect(-114,-134,228,200);drawSea(c,p.k,0,-34,p.k==='whale'?.8:1.6,T);const q=SEA.find(q=>q.k===p.k);c.fillStyle='#3a5a8a';c.font=`800 26px ${FONT}`;c.textAlign='center';c.fillText(q.ja,0,100);c.font=`800 18px ${FONT}`;c.fillText(q.en,0,128);c.restore();}},
  down(x,y){if(this.fin)return;const wy=y+this.cy,S=this.sub;
    for(const q of this.cr){const r=q.k==='whale'?120:60;if(Math.abs(x-q.x)<r&&Math.abs(wy-q.y)<(q.k==='whale'?70:60)){if(Math.hypot(q.x-S.x,q.y-S.y)>340){sfx('no');say('もっと ちかくに いこう！');S.tx=q.x;S.ty=q.y-60;return;}
      const qq=SEA.find(z=>z.k===q.k);this.flash=1;sfx('shutter');if(!this.photo.includes(q.k)){this.photo.push(q.k);this.pic={k:q.k,t:0};rkCheer();sayPair(qq.ja+'！',qq.en);if(this.photo.length===this.goal())setTimeout(()=>{if(scene===this)say('いきもの いっぱい！ うみの そこの たからばこを あけよう！');},2400);}else{sayPair(qq.ja,qq.en);}return;}}
    const ch=this.chest;if(!ch.open&&Math.abs(x-ch.x)<90&&Math.abs(wy-ch.y)<80){if(this.photo.length<this.goal()){sfx('no');say(`しゃしんを ${this.goal()}まい とったら あけられるよ`);return;}if(Math.hypot(ch.x-S.x,ch.y-S.y)>320){S.tx=ch.x;S.ty=ch.y-80;say('たからばこへ ゴー！');return;}ch.open=.01;sfx('open');confetti(80);say('たからものは しんじゅと かんむり！ やったー！');return;}
    this.drag=true;S.tx=x;S.ty=wy;},
  move(x,y){if(this.drag){this.sub.tx=x;this.sub.ty=y+this.cy;}},
  up(){this.drag=false;},
  hint(){if(this.fin)return null;const S=this.sub;if(this.photo.length>=this.goal()){const ch=this.chest;return{x:ch.x,y:clamp(ch.y-this.cy,250,H-60)};}const q=this.cr.filter(q=>!this.photo.includes(q.k)).sort((a,b)=>Math.hypot(a.x-S.x,a.y-S.y)-Math.hypot(b.x-S.x,b.y-S.y))[0];return q?{x:q.x,y:clamp(q.y-this.cy,250,H-60)}:null;},
  hintText(){return this.photo.length>=this.goal()?'うみの そこの たからばこを タッチ':'いきものに ちかづいて タッチ！';}};

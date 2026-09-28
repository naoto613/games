// ================= けがの てあて（レントゲン・ギプス） =================
SCN.geka={bg:'#fff0f4',song:'clinic',
  enter(){const lv=lvOf('geka');this.frac=lv>=1||Math.random()<.6;this.steps=['wash','spray','bandage'].concat(this.frac?['xray','cast','deco']:[]);this.si=-1;this.miss=0;this.fin=0;
    this.p={k:pick(['bear','rabbit','cat','dog','panda','pig']),x:W+160,walk:1,hop:0,shake:0,band:0,cast:0,deco:[],dirt:[...Array(5)].map(()=>({a:rand(-22,22),b:rand(-12,12),w:0,done:0})),mist:0};
    this.lay();this.tools=[];this.xr={x:W/2,y:H*.3,held:0,found:0,t:0};this.wraps=0;
    setTimeout(()=>{if(scene===this)say(`${WORDS[this.p.k][0]}さんが ころんで けがを しちゃった！ てあてしよう`);},700);},
  lay(){this.px=330;this.py=H*.62;this.s=1.75;},
  knee(){return{x:this.p.x+18*this.s,y:this.py-12*this.s};},
  arm(){return{x:this.p.x+34*this.s,y:this.py-46*this.s};},
  startStep(){this.si++;const k=this.steps[this.si];this.key=k;this.prog=0;
    if(k==='wash')this.tools=mkTray(['shower'],H-84);
    if(k==='spray')this.tools=mkTray(trayChoices('spray',['spray','bandage','thermometer','toothbrush'],3),H-84);
    if(k==='bandage')this.tools=mkTray(trayChoices('bandage',['bandage','spray','icepack','steth'],3),H-84);
    if(k==='xray'){this.tools=[];this.xr={x:W/2,y:H-150,held:0,found:0,t:0};}
    if(k==='cast'){this.tools=[];this.wraps=0;this.cp=0;}
    if(k==='deco'){this.tools=[];this.decoOpts=shuffle(['love','star2','ribbon','crown','chick','steth']).slice(0,4);}
    const msg={wash:'まず おみずで きずぐちを きれいに あらおう。 ごしごし こすってね',spray:'しょうどくを しよう。 ばいきんを やっつける スプレーは どれ？',bandage:'きずに はる ものは どれ？',
      xray:'あれ？ うでも いたいみたい。 レントゲンで ほねを みてみよう！ しかくい まどを うでに うごかしてね',cast:'ほねが おれてる！ ギプスで かためよう。 うでの まわりを ぐるぐる なぞってね',deco:'ギプスに シールを はって かわいく しよう！ 3つ はってね'}[k];
    setTimeout(()=>{if(scene===this&&this.key===k)say(msg);},300);},
  next(d=1.4){const k=this.key;this.tools.forEach(t=>t.hidden=true);setTimeout(()=>{if(scene!==this||this.key!==k)return;this.tools=[];if(this.si+1>=this.steps.length)this.done();else this.startStep();},d*1000);},
  done(){const p=this.p;p.cured=1;p.hop=1;sfx('fanfare');RK.clap=2;burst(p.x,this.py-160,24,'heart');say('いたいの いたいの とんでいけー！ ありがとう せんせい！');setTimeout(()=>{if(scene===this)this.fin=.01;},2200);},
  update(dt){const p=this.p;for(const t of this.tools)t.upd(dt);if(p.hop>0)p.hop-=dt*2;if(p.shake>0)p.shake-=dt;
    if(p.walk){p.x+=Math.sign(this.px-p.x)*Math.min(Math.abs(this.px-p.x),260*dt);if(Math.abs(p.x-this.px)<1){p.walk=0;setTimeout(()=>{if(scene===this&&this.si<0)this.startStep();},2400);}}
    const d=this.tools.find(t=>t.held);
    if(this.key==='spray'&&d&&d.k==='spray'){const k=this.knee();if(Math.random()<dt*30)parts.push({x:d.x-20,y:d.y-20,vx:rand(-120,-60),vy:rand(-20,40),life:.5,t:0,kind:'puff',col:'#d8f0ff',r:6});if(Math.hypot(d.x-40-k.x,d.y-20-k.y)<110){p.mist+=dt;if(p.mist>1.1&&!this.sprayed){this.sprayed=1;sfx('ding');say('しゅっしゅっ！ しょうどく かんりょう！');d.held=false;this.next();}}}
    if(this.key==='xray'){const X=this.xr;if(X.held){const a=this.arm();const dd=Math.hypot(X.x-a.x,X.y-a.y);if(dd<50){X.t+=dt;if(X.t>.9&&!X.found){X.found=1;X.held=0;sfx('xray');say('あった！ ほねが ポキッと おれてるね');this.next(2.4);}}else X.t=Math.max(0,X.t-dt);if(Math.random()<dt*3)sfx('xray');}}
    if(this.fin>0){this.fin+=dt;if(this.fin>.6&&this.fin<9){this.fin=9;celebrate('geka',starsFor(this.miss));}}},
  drawSkeleton(c,x,y,s,crack){c.save();c.translate(x,y);c.scale(s,s);c.strokeStyle='#e8f6ff';c.fillStyle='#e8f6ff';c.lineCap='round';c.lineWidth=6;
    c.beginPath();c.arc(0,-88,26,0,TAU);c.stroke();c.fillStyle='#e8f6ff';ell(c,-10,-90,6,7);ell(c,10,-90,6,7);c.fillStyle='#1a2a4a';ell(c,-10,-90,3,4);ell(c,10,-90,3,4);
    c.lineWidth=5;c.beginPath();c.moveTo(0,-62);c.lineTo(0,-8);c.stroke();for(let i=0;i<4;i++){c.beginPath();c.moveTo(-3,-54+i*9);c.quadraticCurveTo(-24,-50+i*9,-18,-40+i*9);c.moveTo(3,-54+i*9);c.quadraticCurveTo(24,-50+i*9,18,-40+i*9);c.stroke();}
    c.beginPath();c.moveTo(-18,-8);c.quadraticCurveTo(0,-2,18,-8);c.stroke();c.lineWidth=6;c.beginPath();c.moveTo(-12,-6);c.lineTo(-16,8);c.moveTo(12,-6);c.lineTo(16,8);c.stroke();
    c.beginPath();c.moveTo(-18,-58);c.lineTo(-38,-36);c.stroke();c.beginPath();c.moveTo(18,-58);c.lineTo(28,-48);c.moveTo(31,-44);c.lineTo(40,-34);c.stroke();
    for(const [a,b] of[[-18,-58],[-38,-36],[18,-58],[40,-34]]){circ(c,a,b,4);}
    if(crack){c.strokeStyle='#ff4d6d';c.lineWidth=3;c.beginPath();c.moveTo(26,-52);c.lineTo(31,-47);c.lineTo(27,-44);c.lineTo(33,-40);c.stroke();c.strokeStyle=`rgba(255,77,109,${.5+Math.sin(T*8)*.4})`;c.lineWidth=2;c.beginPath();c.arc(30,-46,12,0,TAU);c.stroke();}
    c.restore();},
  draw(c){const p=this.p,s=this.s,py=this.py;roomBg(c,'#ffeef4','#f0dce4',py-40,'#fff6f9');
    c.fillStyle='#fff';rr(c,420,150,150,120,12);c.fill();c.strokeStyle='#ffb3c8';c.lineWidth=4;c.stroke();MED.xray(c,460,210,1);MED.kit(c,530,215,.9);
    c.fillStyle='#fff';rr(c,this.px-130,py-14,260,24,12);c.fill();c.fillStyle='#e8b8c8';c.fillRect(this.px-110,py+10,14,50);c.fillRect(this.px+96,py+10,14,50);
    const sad=!p.cured&&!p.walk;drawAnimal(c,p.k,p.x,py,s,{t:T,hop:p.walk?Math.abs(Math.sin(T*7))*.4:p.hop,sad:sad&&this.key!=='deco',happy:p.cured||this.key==='deco',shake:p.shake});
    const k=this.knee();
    if(!p.band){c.strokeStyle='#ff4d6d';c.lineWidth=4;for(let i=0;i<3;i++){c.beginPath();c.moveTo(k.x-14,k.y-8+i*7);c.lineTo(k.x+14,k.y-12+i*7);c.stroke();}
      for(const q of p.dirt){if(q.done)continue;c.fillStyle='#9a7a5a';circ(c,k.x+q.a,k.y+q.b,6);circ(c,k.x+q.a+5,k.y+q.b+3,4);}
      if(this.key==='spray'&&p.mist>0){c.fillStyle=`rgba(180,230,255,${Math.min(.6,p.mist)})`;circ(c,k.x,k.y-4,22);}}
    else drawItem(c,'bandage',k.x,k.y-4,.8);
    const a=this.arm();
    if(this.frac&&this.si>=0&&this.steps.indexOf('xray')<=this.si&&this.wraps<1&&!p.cured){c.fillStyle='rgba(255,90,120,.35)';circ(c,a.x,a.y,26+Math.sin(T*5)*3);}
    if(this.wraps>0){c.save();c.translate(a.x,a.y);c.rotate(-.5);c.fillStyle='#fff';c.strokeStyle='#b8c4d8';c.lineWidth=3;c.globalAlpha=Math.min(1,.4+this.wraps*.2);rr(c,-20,-34,40,64,18);c.fill();c.stroke();c.globalAlpha=1;c.strokeStyle='#dde4f0';c.lineWidth=2;for(let i=0;i<this.wraps;i++){c.beginPath();c.moveTo(-20,-24+i*16);c.lineTo(20,-18+i*16);c.stroke();}
      for(const q of p.deco)drawThing(c,q.k,q.a,q.b,.34);c.restore();}
    if(this.key==='cast'&&this.wraps<3){c.strokeStyle='rgba(255,95,162,.7)';c.lineWidth=5;c.setLineDash([12,10]);c.lineDashOffset=-T*40;c.beginPath();c.arc(a.x,a.y,62,0,TAU);c.stroke();c.setLineDash([]);if(this.cp>0)progRing(c,a.x,a.y,78,this.cp);
      MED.roll(c,a.x+Math.cos(T*3)*62,a.y+Math.sin(T*3)*62,.6);txt(c,`ぐるぐる ${this.wraps} / 3`,W/2,H-150,28,'#ff5fa2');}
    fu(c,86,py+130,2.5,{point:!p.cured,cheer:p.cured});rk(this,c,W-60,py+150,1.6,{happy:p.cured});
    if(this.key==='xray'&&!p.cured){const X=this.xr;const w=190,h=230;c.save();c.beginPath();rr(c,X.x-w/2,X.y-h/2,w,h,16);c.fillStyle='#1a2a4a';c.fill();c.clip();c.globalAlpha=.9;c.fillStyle='rgba(120,180,255,.25)';c.save();c.translate(p.x,py);c.scale(s,s);c.beginPath();c.ellipse(0,-36,36,33,0,0,TAU);c.fill();c.beginPath();c.arc(0,-88,34,0,TAU);c.fill();c.beginPath();c.ellipse(33,-42,10,16,-.5,0,TAU);c.fill();c.beginPath();c.ellipse(-33,-42,10,16,.5,0,TAU);c.fill();c.restore();
      this.drawSkeleton(c,p.x,py,s,true);c.restore();c.strokeStyle='#8aa0c8';c.lineWidth=8;rr(c,X.x-w/2,X.y-h/2,w,h,16);c.stroke();c.fillStyle='#8aa0c8';rr(c,X.x-40,X.y+h/2-4,80,24,8);c.fill();txt(c,'X-RAY',X.x,X.y+h/2+8,16,'#fff');if(X.t>0)progRing(c,X.x,X.y-h/2-24,16,X.t/.9,'#5ad0ff');}
    if(this.key==='deco'){tray(c,H-84,120);this.decoOpts.forEach((k,i)=>drawThing(c,k,W/2+(i-1.5)*120,H-84,.9));txt(c,`${p.deco.length} / 3`,W/2,H-160,26,'#ff5fa2');}
    if(this.tools.some(t=>!t.hidden)){const d=this.tools.find(t=>t.held);if(d){const g=this.key==='bandage'||this.key==='spray'||this.key==='wash'?k:null;if(g)targetMark(c,g.x,g.y);}if(this.key!=='deco')tray(c,H-84,120);for(const t of this.tools)if(!t.held)t.draw(c,1.3);for(const t of this.tools)if(t.held)t.draw(c,1.5);}
    stepDots(c,this.steps.length,Math.max(0,this.si)+(p.cured?1:0));},
  down(x,y){const p=this.p;if(p.cured||this.si<0)return;
    if(this.key==='xray'){const X=this.xr;if(Math.abs(x-X.x)<95&&Math.abs(y-X.y)<115&&!X.found){X.held=1;X.ox=X.x-x;X.oy=X.y-y;sfx('xray');sayWord('xray');}return;}
    if(this.key==='cast'){this.lastA=null;this.casting=1;return;}
    if(this.key==='deco'){this.decoOpts.forEach((k,i)=>{if(hitC(x,y,W/2+(i-1.5)*120,H-84,50)&&p.deco.length<3){p.deco.push({k,a:rand(-10,10),b:-22+p.deco.length*20});sfx('pop');sayWord(k);burst(this.arm().x,this.arm().y,8,'star');if(p.deco.length>=3){this.decoOpts=[];this.next(1.6);}}});return;}
    for(const t of this.tools){if(t.hit(x,y)){const want={wash:'shower',spray:'spray',bandage:'bandage'}[this.key];if(t.k!==want){sfx('no');this.miss++;const w=WORDS[t.k];hush();speak(`それは ${w[0]}`);speak(w[1],'en');card={k:t.k,ja:w[0],en:w[1],t:0};return;}t.held=true;t.lx=x;t.ly=y;sfx('tap');sayWord(t.k);return;}}
    if(hitC(x,y,p.x,this.py-80*this.s,90)){p.hop=.5;sfx('boing');say(pick(['いたいよ〜','がんばる！','せんせい おねがい！']));}},
  move(x,y){const p=this.p;
    if(this.key==='xray'){const X=this.xr;if(X.held){X.x=x+X.ox;X.y=y+X.oy;}return;}
    if(this.key==='cast'&&this.casting&&this.wraps<3){const a=this.arm();const r=Math.hypot(x-a.x,y-a.y);if(r>25&&r<150){const ang=Math.atan2(y-a.y,x-a.x);if(this.lastA!=null){let d=ang-this.lastA;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;this.cp+=Math.abs(d)/TAU;if(Math.random()<.2)sfx('wrap');if(this.cp>=1){this.cp=0;this.wraps++;sfx('ding');sayNum(this.wraps,'',' かい');if(this.wraps>=3){say('かちかち！ ギプスで しっかり かためたよ');this.next(1.8);}}}this.lastA=ang;}return;}
    const t=this.tools.find(q=>q.held);if(!t)return;const d=Math.hypot(x-t.lx,y-t.ly);t.x=x;t.y=y;t.lx=x;t.ly=y;
    if(this.key==='wash'){if(Math.random()<.6)parts.push({x:x-10,y:y+10,vx:rand(-30,30),vy:220,life:.5,t:0,kind:'drop',col:'#8ad0ff'});const k=this.knee();for(const q of p.dirt){if(!q.done&&Math.hypot(x-(k.x+q.a),y+30-(k.y+q.b))<70){q.w+=d;if(q.w>80){q.done=1;sfx('water');drops(k.x+q.a,k.y+q.b,5);}}}
      if(p.dirt.every(q=>q.done)&&!this.washed){this.washed=1;t.held=false;sfx('ding');say('きれいに なったね！');this.next();}}},
  up(x,y){const p=this.p;this.casting=0;if(this.key==='xray'){this.xr.held=0;return;}const t=this.tools.find(q=>q.held);if(!t)return;t.held=false;
    if(this.key==='bandage'&&t.k==='bandage'){const k=this.knee();if(Math.hypot(x-k.x,y-k.y)<100){p.band=1;sfx('ding');say('ぺたっ！ ばんそうこう ばっちり！');this.next();}}},
  hint(){const p=this.p;if(p.cured||this.si<0||p.walk)return null;const k=this.knee(),a=this.arm();
    if(this.key==='xray'){const X=this.xr;return X.found?null:{x:X.x,y:X.y,x2:a.x,y2:a.y};}
    if(this.key==='cast')return{x:a.x+62,y:a.y,x2:a.x,y2:a.y+62};
    if(this.key==='deco')return this.decoOpts.length?{x:W/2-180,y:H-84}:null;
    const want={wash:'shower',spray:'spray',bandage:'bandage'}[this.key];const t=this.tools.find(q=>q.k===want);if(!t)return null;return{x:t.hx,y:t.hy,x2:k.x+(this.key==='spray'?40:0),y2:k.y+(this.key==='wash'?-30:this.key==='spray'?20:0)};},
  hintText(){return{wash:'おみずを きずに もっていって ごしごし',spray:'スプレーを ひざに もっていこう',bandage:'ばんそうこうを ひざに はろう',xray:'レントゲンの まどを うでに うごかそう',cast:'うでの まわりを ぐるぐる なぞろう',deco:'シールを タッチ'}[this.key]||'';}};

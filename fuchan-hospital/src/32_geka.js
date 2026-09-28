// ================= けがの てあて（すりきず・とげ・たんこぶ・こっせつ） =================
SCN.geka={bg:'#fff0f4',song:'clinic',
  enter(){const lv=lvOf('geka');this.loc=pick(['knee','elbow','forehead']);const extras=shuffle(['splinter','bump','frac','frac']).filter((v,i,a)=>a.indexOf(v)===i).slice(0,lv>=1?2:1+Math.floor(Math.random()*2));this.extras=extras;
    this.limb=pick(['arm','leg']);this.steps=['wash','spray','bandage'];if(extras.includes('splinter'))this.steps.push('splinter');if(extras.includes('bump'))this.steps.push('bump');if(extras.includes('frac'))this.steps.push('xray','cast','deco');
    this.si=-1;this.miss=0;this.fin=0;const P=newPatient();
    this.p=Object.assign(P,{x:W+160,walk:1,hop:0,shake:0,band:0,deco:[],dirt:[...Array(3+Math.floor(Math.random()*5))].map(()=>({a:rand(-20,20),b:rand(-12,12),w:0,done:0})),mist:0,spl:extras.includes('splinter')?1:0,bump:extras.includes('bump')?1:0,bumpS:1,frac:extras.includes('frac')?1:0});
    this.theme=pick([['#ffeef4','#f0dce4','#fff6f9'],['#eef4ff','#d8e4f0','#f6f9ff'],['#fffbe8','#efe4c8','#fffdf4']]);
    this.lay();this.tools=[];this.xr={x:W/2,y:H*.3,held:0,found:0,t:0};this.wraps=0;
    setTimeout(()=>{if(scene===this)greetPt(this.p,pick(['ころんで けがを しちゃった！','こうえんで あそんでたら いたく なっちゃった','じてんしゃで ころんじゃった']));},700);},
  lay(){this.px=330;this.py=H*.62;this.s=1.75;},
  wound(){const p=this.p,s=this.s,y=this.py;return this.loc==='knee'?{x:p.x+18*s,y:y-12*s}:this.loc==='elbow'?{x:p.x-38*s,y:y-38*s}:{x:p.x-8*s,y:y-110*s};},
  spl(){return{x:this.p.x+40*this.s,y:this.py-30*this.s};},
  bumpP(){return{x:this.p.x+14*this.s,y:this.py-120*this.s};},
  limbP(){return this.limb==='arm'?{x:this.p.x+34*this.s,y:this.py-46*this.s}:{x:this.p.x-18*this.s,y:this.py-8*this.s};},
  startStep(){this.si++;const k=this.steps[this.si];this.key=k;this.prog=0;this.done1=0;
    const pool=['shower','spray','bandage','tweezers','icepack','thermometer','steth','toothbrush','cream'];const want={wash:'shower',spray:'spray',bandage:'bandage',splinter:'tweezers',bump:'icepack'}[k];
    this.tools=want?mkTray(trayChoices(want,pool,3),H-84):[];this.want=want==='shower'&&k==='wash'?'shower':want;
    if(k==='xray')this.xr={x:W/2,y:H-150,held:0,found:0,t:0};if(k==='cast'){this.wraps=0;this.cp=0;}if(k==='deco')this.decoOpts=shuffle(['love','star2','ribbon','crown','chick','steth','rikki','germ']).slice(0,4);
    const where={knee:'ひざ',elbow:'ひじ',forehead:'おでこ'}[this.loc];
    const msg={wash:`まず おみずで ${where}の きずを きれいに あらおう。 シャワーで ごしごし！`,spray:'しょうどくを しよう。 ばいきんを やっつける スプレーは どれ？',bandage:'きずに はる ものは どれ？',splinter:'あれ？ てに とげが ささってる！ とげを ぬく どうぐは どれ？',bump:'あたまに たんこぶ！ ひやす ものは どれ？',
      xray:`あれ？ ${this.limb==='arm'?'うで':'あし'}も いたいみたい。 レントゲンで ほねを みてみよう！ しかくい まどを うごかしてね`,cast:'ほねが おれてる！ ギプスで かためよう。 まわりを ぐるぐる なぞってね',deco:'ギプスに シールを はって かわいく しよう！ 3つ はってね'}[k];
    setTimeout(()=>{if(scene===this&&this.key===k)say(msg);},300);},
  next(d=1.4){const k=this.key;this.tools.forEach(t=>t.hidden=true);setTimeout(()=>{if(scene!==this||this.key!==k)return;this.tools=[];if(this.si+1>=this.steps.length)this.done();else{stepClear(pick(['OK！','ばっちり！','クリア！']));this.startStep();}},d*1000);},
  done(){const p=this.p;p.cured=1;p.hop=1;banner('てあて かんりょう！','#ff6f91',`${ptName(p)}さん もう だいじょうぶ！`);burst(p.x,this.py-160,24,'heart');setTimeout(()=>{if(scene===this)say('いたいの いたいの とんでいけー！ ありがとう せんせい！');},1000);setTimeout(()=>{if(scene===this)this.fin=.01;},3200);},
  update(dt){const p=this.p;for(const t of this.tools)t.upd(dt);if(p.hop>0)p.hop-=dt*2;if(p.shake>0)p.shake-=dt;
    if(p.walk){p.x+=Math.sign(this.px-p.x)*Math.min(Math.abs(this.px-p.x),260*dt);if(Math.abs(p.x-this.px)<1){p.walk=0;setTimeout(()=>{if(scene===this&&this.si<0)this.startStep();},2400);}}
    const d=this.tools.find(t=>t.held);
    if(this.key==='spray'&&d&&d.k==='spray'){const k=this.wound();if(Math.random()<dt*30)parts.push({x:d.x-20,y:d.y-20,vx:rand(-120,-60),vy:rand(-20,40),life:.5,t:0,kind:'puff',col:'#d8f0ff',r:6});if(Math.hypot(d.x-40-k.x,d.y-20-k.y)<110){p.mist+=dt;if(p.mist>1.1&&!this.done1){this.done1=1;good(k.x,k.y,1,'しゅっしゅっ');say('しょうどく かんりょう！');d.held=false;this.next();}}}
    if(this.key==='splinter'&&d&&d.k==='tweezers'){const g=this.spl();if(Math.hypot(d.x-g.x,d.y-g.y)<60){this.prog+=dt;p.shake=.15;if(Math.random()<dt*6)sfx('squeak');if(this.prog>1.3&&!this.done1){this.done1=1;p.spl=0;d.held=false;good(g.x,g.y,2,'スポッ！');SHAKE=.2;for(let i=0;i<6;i++)parts.push({x:g.x,y:g.y,vx:rand(80,200),vy:rand(-260,-120),life:1,t:0,kind:'star',col:'#ffd23a',r:8,rot:0});say('とげが ぬけた！ いたく なくなったね');this.next(1.8);}}else this.prog=Math.max(0,this.prog-dt);}
    if(this.key==='bump'&&d&&d.k==='icepack'){const g=this.bumpP();if(Math.hypot(d.x-g.x,d.y-g.y)<70){this.prog+=dt;p.bumpS=Math.max(0,1-this.prog/1.8);if(Math.random()<dt*3)sfx('water');if(this.prog>1.8&&!this.done1){this.done1=1;p.bump=0;d.held=false;good(g.x,g.y,1,'ひんやり');say('たんこぶが ちいさく なったよ');this.next(1.6);}}}
    if(this.key==='xray'){const X=this.xr;if(X.held){const a=this.limbP();const dd=Math.hypot(X.x-a.x,X.y-a.y);if(dd<50){X.t+=dt;if(X.t>.9&&!X.found){X.found=1;X.held=0;sfx('xray');good(a.x,a.y,1,'はっけん！');say('あった！ ほねが ポキッと おれてるね');this.next(2.4);}}else X.t=Math.max(0,X.t-dt);if(Math.random()<dt*3)sfx('xray');}}
    if(this.fin>0){this.fin+=dt;if(this.fin>.6&&this.fin<9){this.fin=9;celebrate('geka',starsFor(this.miss));}}},
  drawSkeleton(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);c.strokeStyle='#e8f6ff';c.fillStyle='#e8f6ff';c.lineCap='round';c.lineWidth=6;
    c.beginPath();c.arc(0,-88,26,0,TAU);c.stroke();ell(c,-10,-90,6,7);ell(c,10,-90,6,7);c.fillStyle='#1a2a4a';ell(c,-10,-90,3,4);ell(c,10,-90,3,4);c.fillStyle='#e8f6ff';
    c.lineWidth=5;c.beginPath();c.moveTo(0,-62);c.lineTo(0,-12);c.stroke();for(let i=0;i<4;i++){c.beginPath();c.moveTo(-3,-54+i*9);c.quadraticCurveTo(-24,-50+i*9,-18,-40+i*9);c.moveTo(3,-54+i*9);c.quadraticCurveTo(24,-50+i*9,18,-40+i*9);c.stroke();}
    c.beginPath();c.ellipse(0,-12,16,7,0,0,TAU);c.stroke();c.lineWidth=6;for(const s2 of[-1,1]){c.beginPath();c.moveTo(s2*10,-8);c.lineTo(s2*18,-4);c.stroke();circ(c,s2*18,-3,5);c.beginPath();c.moveTo(s2*18,-58);c.lineTo(s2*30,-48);c.moveTo(s2*31,-44);c.lineTo(s2*40,-34);c.stroke();circ(c,s2*40,-33,4);}
    const cr=this.limb==='arm'?[31,-46]:[-18,-6];c.strokeStyle='#ff4d6d';c.lineWidth=3;c.beginPath();c.moveTo(cr[0]-5,cr[1]-6);c.lineTo(cr[0],cr[1]-1);c.lineTo(cr[0]-4,cr[1]+2);c.lineTo(cr[0]+2,cr[1]+6);c.stroke();c.strokeStyle=`rgba(255,77,109,${.5+Math.sin(T*8)*.4})`;c.lineWidth=2;c.beginPath();c.arc(cr[0],cr[1],12,0,TAU);c.stroke();
    c.restore();},
  draw(c){const p=this.p,s=this.s,py=this.py,th=this.theme;roomBg(c,th[0],th[1],py-40,th[2],[['window',100,py-300,1,130,100],['shelf',W/2+10,py-250,1],['frame',W-100,py-300,1,'hand']]);
    c.fillStyle='#fff';rr(c,this.px-130,py-14,260,24,12);c.fill();c.fillStyle='#e8b8c8';c.fillRect(this.px-110,py+10,14,50);c.fillRect(this.px+96,py+10,14,50);
    const sad=!p.cured&&!p.walk;const hurt=this.key==='splinter'&&this.prog>0;drawPt(c,p,p.x,py,s,{t:T,hop:p.walk?Math.abs(Math.sin(T*7))*.4:p.hop,sad:sad&&this.key!=='deco'&&!hurt,cry:hurt,happy:p.cured||this.key==='deco',shake:p.shake,look:LOOK.on&&!p.walk?clamp((LOOK.x-p.x)/200,-1,1):0});
    const k=this.wound();
    if(!p.band){c.strokeStyle='#ff4d6d';c.lineWidth=4;for(let i=0;i<3;i++){c.beginPath();c.moveTo(k.x-14,k.y-8+i*7);c.lineTo(k.x+14,k.y-12+i*7);c.stroke();}
      for(const q of p.dirt){if(q.done)continue;c.fillStyle='#9a7a5a';circ(c,k.x+q.a,k.y+q.b,6);circ(c,k.x+q.a+5,k.y+q.b+3,4);}
      if(this.key==='spray'&&p.mist>0){c.fillStyle=`rgba(180,230,255,${Math.min(.6,p.mist)})`;circ(c,k.x,k.y-4,22);}}
    else drawItem(c,'bandage',k.x,k.y-4,.8);
    if(p.spl){const g=this.spl();const pull=this.key==='splinter'?Math.min(1,this.prog/1.3)*14:0;c.save();c.translate(g.x,g.y);c.rotate(-.7);c.fillStyle='#b08050';rr(c,-3,-18-pull,6,24,2);c.fill();c.restore();c.fillStyle='rgba(255,90,110,.35)';circ(c,g.x,g.y,12);}
    if(p.bump){const g=this.bumpP();c.fillStyle=gfill(c,g.x,g.y,20,'#ff9ab0');circ(c,g.x,g.y,4+14*p.bumpS);for(let i=0;i<3;i++){c.fillStyle='#ffd23a';star(c,g.x+Math.cos(T*3+i*2.1)*30,g.y-10+Math.sin(T*3+i*2.1)*10,6,2.5);c.fill();}}
    const a=this.limbP();
    if(p.frac&&this.si>=0&&this.steps.indexOf('xray')<=this.si&&this.wraps<1&&!p.cured){c.fillStyle='rgba(255,90,120,.35)';circ(c,a.x,a.y,26+Math.sin(T*5)*3);}
    if(this.wraps>0){c.save();c.translate(a.x,a.y);c.rotate(this.limb==='arm'?-.5:0);c.fillStyle='#fff';c.strokeStyle='#b8c4d8';c.lineWidth=3;c.globalAlpha=Math.min(1,.4+this.wraps*.2);rr(c,-22,-34,44,64,18);c.fill();c.stroke();c.globalAlpha=1;c.strokeStyle='#dde4f0';c.lineWidth=2;for(let i=0;i<this.wraps;i++){c.beginPath();c.moveTo(-22,-24+i*16);c.lineTo(22,-18+i*16);c.stroke();}
      for(const q of p.deco)drawThing(c,q.k,q.a,q.b,.34);c.restore();}
    if(this.key==='cast'&&this.wraps<3){c.strokeStyle='rgba(255,95,162,.7)';c.lineWidth=5;c.setLineDash([12,10]);c.lineDashOffset=-T*40;c.beginPath();c.arc(a.x,a.y,62,0,TAU);c.stroke();c.setLineDash([]);if(this.cp>0)progRing(c,a.x,a.y,78,this.cp);
      MED.roll(c,a.x+Math.cos(T*3)*62,a.y+Math.sin(T*3)*62,.6);txt(c,`ぐるぐる ${this.wraps} / 3`,W/2,H-150,28,'#ff5fa2');}
    fu(c,86,py+130,2.5,{point:!p.cured});rk(this,c,W-60,py+150,1.6);
    if(this.key==='xray'&&!p.cured){const X=this.xr;const w=190,h=230;c.save();c.beginPath();rr(c,X.x-w/2,X.y-h/2,w,h,16);c.fillStyle='#1a2a4a';c.fill();c.clip();c.fillStyle='rgba(120,180,255,.25)';c.save();c.translate(p.x,py);c.scale(s,s);c.beginPath();c.ellipse(0,-36,36,33,0,0,TAU);c.fill();c.beginPath();c.arc(0,-88,34,0,TAU);c.fill();for(const sx of[-1,1]){c.beginPath();c.ellipse(sx*33,-42,10,16,-sx*.5,0,TAU);c.fill();c.beginPath();c.ellipse(sx*18,-5,14,9,0,0,TAU);c.fill();}c.restore();
      this.drawSkeleton(c,p.x,py,s);c.restore();c.strokeStyle='#8aa0c8';c.lineWidth=8;rr(c,X.x-w/2,X.y-h/2,w,h,16);c.stroke();c.fillStyle='#8aa0c8';rr(c,X.x-40,X.y+h/2-4,80,24,8);c.fill();txt(c,'X-RAY',X.x,X.y+h/2+8,16,'#fff');if(X.t>0)progRing(c,X.x,X.y-h/2-24,16,X.t/.9,'#5ad0ff');}
    if(this.key==='deco'){tray(c,H-84,120);this.decoOpts.forEach((k2,i)=>drawThing(c,k2,W/2+(i-1.5)*120,H-84,.9));txt(c,`${p.deco.length} / 3`,W/2,H-160,26,'#ff5fa2');}
    if(this.tools.some(t=>!t.hidden)){const d=this.tools.find(t=>t.held);if(d){const g=this.key==='splinter'?this.spl():this.key==='bump'?this.bumpP():k;targetMark(c,g.x,g.y);if(this.prog>0&&(this.key==='splinter'||this.key==='bump'))progRing(c,g.x,g.y,44,this.prog/(this.key==='bump'?1.8:1.3));}tray(c,H-84,120);for(const t of this.tools)if(!t.held)t.draw(c,1.3);for(const t of this.tools)if(t.held)t.draw(c,1.5);}
    stepDots(c,this.steps.length,Math.max(0,this.si)+(p.cured?1:0));},
  down(x,y){const p=this.p;if(p.cured||this.si<0)return;
    if(this.key==='xray'){const X=this.xr;if(Math.abs(x-X.x)<95&&Math.abs(y-X.y)<115&&!X.found){X.held=1;X.ox=X.x-x;X.oy=X.y-y;sfx('xray');sayWord('xray');}return;}
    if(this.key==='cast'){this.lastA=null;this.casting=1;return;}
    if(this.key==='deco'){this.decoOpts.forEach((k,i)=>{if(hitC(x,y,W/2+(i-1.5)*120,H-84,50)&&p.deco.length<3){p.deco.push({k,a:rand(-10,10),b:-22+p.deco.length*20});good(this.limbP().x,this.limbP().y,1,'かわいい！');sayWord(k);if(p.deco.length>=3){this.decoOpts=[];this.next(1.6);}}});return;}
    for(const t of this.tools){if(t.hit(x,y)){if(t.k!==this.want){this.miss++;wrongTool(t);return;}t.held=true;t.lx=x;t.ly=y;sfx('tap');sayWord(t.k);return;}}
    if(hitC(x,y,p.x,this.py-80*this.s,90)){p.hop=.5;sfx('boing');say(pick(['いたいよ〜','がんばる！','せんせい おねがい！']));}},
  move(x,y){const p=this.p;
    if(this.key==='xray'){const X=this.xr;if(X.held){X.x=x+X.ox;X.y=y+X.oy;}return;}
    if(this.key==='cast'&&this.casting&&this.wraps<3){const a=this.limbP();const r=Math.hypot(x-a.x,y-a.y);if(r>25&&r<150){const ang=Math.atan2(y-a.y,x-a.x);if(this.lastA!=null){let d=ang-this.lastA;if(d>Math.PI)d-=TAU;if(d<-Math.PI)d+=TAU;this.cp+=Math.abs(d)/TAU;if(Math.random()<.2)sfx('wrap');if(this.cp>=1){this.cp=0;this.wraps++;good(a.x,a.y,1,`${this.wraps}かい！`);sayNum(this.wraps,'',' かい');if(this.wraps>=3){say('かちかち！ ギプスで しっかり かためたよ');this.next(1.8);}}}this.lastA=ang;}return;}
    const t=this.tools.find(q=>q.held);if(!t)return;const d=Math.hypot(x-t.lx,y-t.ly);t.x=x;t.y=y;t.lx=x;t.ly=y;
    if(this.key==='wash'&&t.k==='shower'){if(Math.random()<.6)parts.push({x:x-10,y:y+10,vx:rand(-30,30),vy:220,life:.5,t:0,kind:'drop',col:'#8ad0ff'});const k=this.wound();for(const q of p.dirt){if(!q.done&&Math.hypot(x-(k.x+q.a),y+30-(k.y+q.b))<70){q.w+=d;if(q.w>80){q.done=1;sfx('water');drops(k.x+q.a,k.y+q.b,5);good(k.x+q.a,k.y+q.b,1,'ピカッ');}}}
      if(p.dirt.every(q=>q.done)&&!this.done1){this.done1=1;t.held=false;say('きれいに なったね！');this.next();}}},
  up(x,y){const p=this.p;this.casting=0;if(this.key==='xray'){this.xr.held=0;return;}const t=this.tools.find(q=>q.held);if(!t)return;t.held=false;if(this.key==='splinter'||this.key==='bump'){if(!this.done1&&this.key==='splinter')this.prog=0;}
    if(this.key==='bandage'&&t.k==='bandage'){const k=this.wound();if(Math.hypot(x-k.x,y-k.y)<100){p.band=1;good(k.x,k.y,1,'ぺたっ！');say('ばんそうこう ばっちり！');this.next();}}},
  hint(){const p=this.p;if(p.cured||this.si<0||p.walk)return null;const k=this.wound(),a=this.limbP();
    if(this.key==='xray'){const X=this.xr;return X.found?null:{x:X.x,y:X.y,x2:a.x,y2:a.y};}
    if(this.key==='cast')return{x:a.x+62,y:a.y,x2:a.x,y2:a.y+62};
    if(this.key==='deco')return this.decoOpts.length?{x:W/2-180,y:H-84}:null;
    const t=this.tools.find(q=>q.k===this.want);if(!t||t.hidden)return null;
    if(this.key==='splinter'){const g=this.spl();return{x:t.hx,y:t.hy,x2:g.x,y2:g.y};}if(this.key==='bump'){const g=this.bumpP();return{x:t.hx,y:t.hy,x2:g.x,y2:g.y};}
    return{x:t.hx,y:t.hy,x2:k.x+(this.key==='spray'?40:0),y2:k.y+(this.key==='wash'?-30:this.key==='spray'?20:0)};},
  hintText(){return{wash:'シャワーを きずに もっていって ごしごし',spray:'スプレーを きずに',bandage:'ばんそうこうを きずに はろう',splinter:'ピンセットを とげに あてて まってね',bump:'こおりを たんこぶに あてよう',xray:'レントゲンの まどを うごかそう',cast:'まわりを ぐるぐる なぞろう',deco:'シールを タッチ'}[this.key]||'';}};

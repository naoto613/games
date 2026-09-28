// ================= ゲームセンター B: メダルおとし / ピンボール / バスケット / たいこリズム / ぴょんぴょんみちわたり =================
// ---------- メダルおとし (top-down pusher) ----------
SCN.medal={bg:'#2a1030',song:'arcade',
  enter(){arcInit(this,'medal',{time:90,th:[1200,2400,3600],intro:'メダルおとし！ タッチした ところに メダルが おちるよ。 おしだして まえに おとすと メダルが もらえる！ ほしメダルが おちると ルーレット チャンス！'});
    this.X0=70;this.X1=W-70;this.PT=300;this.SF=this.PT+120+360;this.pt=0;this.pb=this.PT+60;this.coins=[];this.drops=[];this.falls=[];this.won=0;this.have=30;this.rou=null;this.idle=0;this.cool=0;
    let n=0;while(this.coins.length<44&&n<3000){n++;const r=24,x=rand(this.X0+r,this.X1-r),y=rand(this.PT+140,this.SF-10);if(this.coins.every(q=>Math.hypot(q.x-x,q.y-y)>2*r-2))this.coins.push({x,y,r,k:this.coins.length<3?'star':this.coins.length<6?'gold':'n'});}},
  update(dt){const on=arcTick(this,dt);if(this.cool>0)this.cool-=dt;
    this.pt+=dt;const pb0=this.pb;this.pb=this.PT+60+65*(.5-.5*Math.cos(this.pt*TAU/2.6));
    for(const d of this.drops){d.t+=dt*3.2;if(d.t>=1){d.done=1;this.coins.push({x:d.x,y:this.pb+24+Math.random(),r:24,k:d.k});tone(1800,.04,'square',.05);}}this.drops=this.drops.filter(d=>!d.done);
    const C=this.coins,X0=this.X0,X1=this.X1,pb=this.pb;
    for(let it=0;it<5;it++){for(const q of C){if(q.y-q.r<pb){q.y=pb+q.r;}q.x=clamp(q.x,X0+q.r,X1-q.r);}
      for(let i=0;i<C.length;i++)for(let j=i+1;j<C.length;j++){const a=C[i],b=C[j],dx=b.x-a.x,dy=b.y-a.y,d2=dx*dx+dy*dy,m=a.r+b.r;if(d2<m*m&&d2>1e-6){const d=Math.sqrt(d2),o=(m-d),nx=dx/d,ny=dy/d;const la=a.y-a.r<=pb+.5,lb=b.y-b.r<=pb+.5;
        let wa=.5,wb=.5;if(la&&!lb&&ny>0){wa=0;wb=1;}else if(lb&&!la&&ny<0){wa=1;wb=0;}a.x-=nx*o*wa;a.y-=ny*o*wa;b.x+=nx*o*wb;b.y+=ny*o*wb;}}}
    for(const q of C){if(q.y>this.SF){q.gone=1;this.falls.push({x:q.x,y:q.y,t:0,k:q.k});}}this.coins=C.filter(q=>!q.gone);
    for(const f of this.falls){f.t+=dt;if(f.t>.35&&!f.cnt){f.cnt=1;const v=f.k==='gold'?5:1;this.won+=v;this.have+=v;if(this.ph==='play'||this.ph==='end'){this.score+=v*10;}sfx('coin');if(f.k==='gold'){this.pops.push({x:f.x,y:this.SF+30,txt:'きんメダル +5',t:0,col:'#ffe24a'});}if(f.k==='star'&&!this.rou){this.startRou();}}}this.falls=this.falls.filter(f=>f.t<.8);
    if(this.rou){const r=this.rou;r.t+=dt;if(r.t<2.4){r.a+=dt*(14-r.t*5);if(Math.floor(r.a/(TAU/6))!==r.last){r.last=Math.floor(r.a/(TAU/6));tone(1200,.03,'square',.06);}}else if(!r.done){r.done=1;const seg=((Math.floor(((-r.a%TAU)+TAU+TAU/12)%TAU/(TAU/6)))%6+6)%6;const v=[3,5,2,10,3,20][seg];r.v=v;
        if(v>=10){sfx('fanfare');confetti(80);this.fever=6;say(v>=20?'ジャックポット！！':'だいあたり！');}else{sfx('spark');say(v+'まい ゲット！');}this.pops.push({x:W/2,y:H*.4,txt:'メダル '+v+'まい ふってくる！',t:0,col:'#ffe24a',big:1});
        for(let i=0;i<v;i++)setTimeout(()=>{if(scene===this)this.drops.push({x:rand(this.X0+30,this.X1-30),t:rand(-.6,0),k:Math.random()<.08?'gold':'n'});},i*90);}
      else if(r.t>4)this.rou=null;}
    if(!on)return;if(this.have<=0&&!this.drops.length&&!this.rou){this.idle+=dt;if(this.idle>4.5)arcEnd(this,'メダルが なくなった！');}else this.idle=0;},
  draw(c){arcBg(c,'#2a1030','#4a1a4a',false);const X0=this.X0,X1=this.X1,PT=this.PT,SF=this.SF,pb=this.pb;
    c.save();c.shadowColor='#ffe24a';c.shadowBlur=20;c.fillStyle='#ffe6f4';rr(c,X0-30,PT-40,X1-X0+60,SF-PT+90,30);c.fill();c.restore();c.fillStyle='#c8b8e8';rr(c,X0,PT,X1-X0,SF-PT,10);c.fill();c.fillStyle='#b0a0d8';for(let y=PT+20;y<SF;y+=40)c.fillRect(X0,y,X1-X0,2);
    for(let i=0;i<14;i++){c.fillStyle=(i+Math.floor(T*6))%2?'#ffe24a':'#ff6fd0';circ(c,X0-15,PT+i*(SF-PT)/13,6);circ(c,X1+15,PT+i*(SF-PT)/13,6);}
    for(const q of this.coins){c.fillStyle='rgba(60,30,60,.3)';circ(c,q.x+3,q.y+4,q.r);c.fillStyle=q.k==='gold'?'#ffb000':q.k==='star'?'#ff6fd0':'#d8a800';circ(c,q.x,q.y,q.r);c.fillStyle=q.k==='gold'?'#ffe890':q.k==='star'?'#ffc0f0':'#ffd23a';circ(c,q.x,q.y,q.r*.78);
      if(q.k==='star'){c.fillStyle='#fff';star(c,q.x,q.y,12,5);c.fill();}else{c.strokeStyle='rgba(180,120,0,.6)';c.lineWidth=2;c.beginPath();c.arc(q.x,q.y,q.r*.5,0,TAU);c.stroke();}}
    c.fillStyle='#7a5ad8';rr(c,X0,PT-10,X1-X0,pb-PT+10,[0,0,8,8]);c.fill();c.fillStyle='#9a7af8';c.fillRect(X0,pb-12,X1-X0,12);c.fillStyle='#fff';c.font=`800 18px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('▼ タッチで メダルを いれる ▼',W/2,PT+22);
    for(const d of this.drops){if(d.t<0)continue;const y=lerp(PT-60,pb+24,d.t);c.fillStyle='#d8a800';ell(c,d.x,y,24,24*(1-d.t*.5)+2);c.fillStyle='#ffd23a';ell(c,d.x,y,18,18*(1-d.t*.5)+1);}
    for(const f of this.falls){c.globalAlpha=1-f.t/.8;c.fillStyle='#ffd23a';ell(c,f.x,f.y+f.t*120,24,24*(1-f.t));c.globalAlpha=1;}
    c.fillStyle='#ff6fd0';c.fillRect(X0-30,SF,X1-X0+60,10);
    const ty=SF+60;c.fillStyle='rgba(20,10,40,.8)';rr(c,20,ty,W-40,90,24);c.fill();c.fillStyle='#ffe24a';c.font=`800 26px ${FONT}`;c.textAlign='left';c.fillText('のこり メダル',46,ty+30);c.fillStyle='#fff';c.font=`46px ${POP}`;c.fillText(this.have,46,ty+68);
    c.textAlign='right';c.fillStyle='#6cf0a0';c.font=`800 26px ${FONT}`;c.fillText('ゲット',W-46,ty+30);c.fillStyle='#fff';c.font=`46px ${POP}`;c.fillText(this.won,W-46,ty+68);
    if(this.rou){const r=this.rou,cx=W/2,cy=H*.46,R=150;c.fillStyle='rgba(20,10,40,.6)';c.fillRect(-OX/SC,-OY/SC,W+2*OX/SC,H+2*OY/SC);const vals=[3,5,2,10,3,20],cols=['#ff6f91','#4ab0ff','#6cd08a','#ffb03a','#b48cff','#ffe24a'];
      c.save();c.translate(cx,cy);c.rotate(r.a);for(let i=0;i<6;i++){c.fillStyle=cols[i];c.beginPath();c.moveTo(0,0);c.arc(0,0,R,i*TAU/6-TAU/12-Math.PI/2,(i+1)*TAU/6-TAU/12-Math.PI/2);c.closePath();c.fill();c.save();c.rotate(i*TAU/6);c.fillStyle='#fff';c.font=`36px ${POP}`;c.textAlign='center';c.fillText(vals[i]===20?'JP':vals[i],0,-R*.62);c.restore();}c.restore();
      c.fillStyle='#fff';circ(c,cx,cy,30);c.fillStyle='#ff4d6d';c.beginPath();c.moveTo(cx-18,cy-R-24);c.lineTo(cx+18,cy-R-24);c.lineTo(cx,cy-R+10);c.closePath();c.fill();c.fillStyle='#fff';c.font=`40px ${POP}`;c.textAlign='center';c.fillText(r.done?('+'+r.v):'ルーレット！',cx,cy+R+50);}
    arcHUD(c,this,'メダルおとし','#e8a800');},
  startRou(){this.rou={t:0,a:rand(0,TAU),last:-1,done:0};sfx('open');hush();speak('ほしメダル！ ルーレット スタート！');},
  down(x,y){if(this.ph!=='play'||this.rou)return;if(this.have<=0){sfx('no');return;}if(this.cool>0)return;if(y<this.PT-60||y>this.SF+40)return;this.cool=.18;this.have--;const k=Math.random()<.045?'star':Math.random()<.05?'gold':'n';this.drops.push({x:clamp(x,this.X0+26,this.X1-26),t:0,k});sfx('tap');},
  move(){},up(){},
  hint(){if(this.ph!=='play')return null;return{x:W/2,y:this.PT+60};},hintText(){return 'メダルを いれて まえに おしだそう！';}};
// ---------- ピンボール ----------
SCN.pinball={bg:'#140a30',song:'arcade',
  enter(){arcInit(this,'pinball',{time:150,th:[800,2000,3500],intro:'ピンボール！ がめんの どこでも タッチすると フリッパーが うごくよ。 ボールを おとさないように はじこう！'});
    this.X0=50;this.X1=W-50;this.Y0=250;this.yF=H-230;this.balls=3;this.lit=[0,0,0,0,0];this.flip=0;this.fa=[.5,.5];this.fp=[.5,.5];this.bl=[0,0,0];this.saveT=0;this.ball=null;this.slow=0;this.mkWalls();this.spawn();},
  mkWalls(){const X0=this.X0,X1=this.X1,Y0=this.Y0,yF=this.yF,S=[];const cx=W/2,R=(X1-X0)/2;let prev=null;for(let i=0;i<=12;i++){const a=Math.PI+i/12*Math.PI,p=[cx+Math.cos(a)*R,Y0+R*.55+Math.sin(a)*R*.55];if(prev)S.push([prev,p]);prev=p;}
    S.push([[X0,Y0+R*.55],[X0,yF-150]],[[X1,Y0+R*.55],[X1,yF-150]],[[X0,yF-150],[this.PL()[0]-14,yF-8]],[[X1,yF-150],[this.PR()[0]+14,yF-8]]); this.walls=S;
    const my=(Y0+yF)/2-40;this.bumps=[[W/2-100,my-60],[W/2+100,my-60],[W/2,my+50]];},
  PL(){return[W/2-100,this.yF];},PR(){return[W/2+100,this.yF];},FL:88,
  tip(i,a){const P=i?this.PR():this.PL();return[P[0]+(i?-1:1)*Math.cos(a)*this.FL,P[1]+Math.sin(a)*this.FL];},
  spawn(){this.ball={x:W/2+rand(-60,60),y:this.Y0+60,vx:rand(-160,160),vy:0,r:14};this.saveT=6;},
  segHit(b,A,B,rad,vA,vB,e){const abx=B[0]-A[0],aby=B[1]-A[1],L2=abx*abx+aby*aby;let t=((b.x-A[0])*abx+(b.y-A[1])*aby)/L2;t=clamp(t,0,1);const px=A[0]+abx*t,py=A[1]+aby*t;let dx=b.x-px,dy=b.y-py;const d=Math.hypot(dx,dy);const m=b.r+rad;if(d>=m||d===0)return false;
    const nx=dx/d,ny=dy/d;b.x=px+nx*m;b.y=py+ny*m;let cvx=0,cvy=0;if(vA){cvx=lerp(vA[0],vB[0],t);cvy=lerp(vA[1],vB[1],t);}const rvx=b.vx-cvx,rvy=b.vy-cvy,vn=rvx*nx+rvy*ny;if(vn<0){b.vx-=(1+e)*vn*nx;b.vy-=(1+e)*vn*ny;}return true;},
  update(dt){const on=arcTick(this,dt);for(let i=0;i<3;i++)if(this.bl[i]>0)this.bl[i]-=dt;
    const tgt=this.flip?-.42:.5;const tp=[this.tip(0,this.fa[0]),this.tip(1,this.fa[1])];for(let i=0;i<2;i++){this.fp[i]=this.fa[i];const d=tgt-this.fa[i];this.fa[i]+=clamp(d,-dt*16,dt*16);}const tn=[this.tip(0,this.fa[0]),this.tip(1,this.fa[1])];
    if(!on)return;const b=this.ball;if(!b)return;if(this.saveT>0)this.saveT-=dt;const n=8,h=dt/n;
    for(let k=0;k<n;k++){b.vy+=1000*h;b.x+=b.vx*h;b.y+=b.vy*h;
      for(const [A,B] of this.walls)if(this.segHit(b,A,B,3,null,null,.45))tone(400,.02,'square',.03);
      for(let i=0;i<2;i++){const P=i?this.PR():this.PL();const vt=[(tn[i][0]-tp[i][0])/dt,(tn[i][1]-tp[i][1])/dt];const tipNow=[lerp(tp[i][0],tn[i][0],(k+1)/n),lerp(tp[i][1],tn[i][1],(k+1)/n)];if(this.segHit(b,P,tipNow,10,[0,0],vt,.3)){}}
      this.bumps.forEach((q,i)=>{const dx=b.x-q[0],dy=b.y-q[1],d=Math.hypot(dx,dy);if(d<34+b.r&&d>0){const nx=dx/d,ny=dy/d;b.x=q[0]+nx*(34+b.r);b.y=q[1]+ny*(34+b.r);const sp=Math.max(650,Math.hypot(b.vx,b.vy));b.vx=nx*sp;b.vy=ny*sp;if(this.bl[i]<=.05){this.bl[i]=.2;arcAdd(this,30,q[0],q[1]-40,'#ff6fd0');tone(700+i*200,.08,'square',.1);}}});
      const sp=Math.hypot(b.vx,b.vy);if(sp>1500){b.vx*=1500/sp;b.vy*=1500/sp;}}
    for(let i=0;i<5;i++){const tx=W/2-120+i*60,ty=this.Y0+95;if(!this.lit[i]&&Math.hypot(b.x-tx,b.y-ty)<b.r+16){this.lit[i]=1;arcAdd(this,100,tx,ty-30,'#ffe24a');sfx('ding');if(this.lit.every(v=>v)){this.lit=[0,0,0,0,0];arcAdd(this,500,W/2,H*.4,'#6cf0a0');this.fever=6;sfx('fanfare');confetti(50);hush();speak('フィーバー！');}}}
    const mv=Math.hypot(b.x-(this.lx||0),b.y-(this.ly||0));this.stT=(this.stT||0)+dt;if(this.stT>2.5){if(mv<60){b.vy=-600;b.vx=rand(-250,250);b.y-=10;}this.stT=0;this.lx=b.x;this.ly=b.y;}
    if(b.y>H+30){if(this.saveT>0){this.spawn();this.saveT=3;hush();speak('セーフ！ もういっかい');return;}this.balls--;arcMiss(this);sfx('no');this.shake=.3;if(this.balls<=0){this.ball=null;arcEnd(this,'ゲームオーバー');return;}hush();speak('のこり '+this.balls+'こ！');this.spawn();}},
  draw(c){arcBg(c,'#140a30','#301050',false);const X0=this.X0,X1=this.X1,yF=this.yF;const sh=this.shake>0?Math.sin(T*80)*6:0;c.save();c.translate(sh,0);
    c.fillStyle='#24124a';c.beginPath();c.moveTo(this.walls[0][0][0],this.walls[0][0][1]);for(const [A,B] of this.walls.slice(0,12))c.lineTo(B[0],B[1]);c.lineTo(X1,yF-150);c.lineTo(this.PR()[0]+14,yF+60);c.lineTo(this.PL()[0]-14,yF+60);c.lineTo(X0,yF-150);c.closePath();c.fill();
    c.save();c.shadowColor='#4ad0ff';c.shadowBlur=14;c.strokeStyle='#4ad0ff';c.lineWidth=6;for(const [A,B] of this.walls){c.beginPath();c.moveTo(A[0],A[1]);c.lineTo(B[0],B[1]);c.stroke();}c.restore();
    for(let i=0;i<5;i++){const tx=W/2-120+i*60,ty=this.Y0+95;c.fillStyle=this.lit[i]?'#ffe24a':'rgba(255,255,255,.2)';star(c,tx,ty,18,8);c.fill();}
    this.bumps.forEach((q,i)=>{const on=this.bl[i]>0;c.fillStyle='#8a1a6a';circ(c,q[0],q[1]+6,36);c.fillStyle=on?'#fff':'#ff6fd0';circ(c,q[0],q[1],34);c.fillStyle=on?'#ffe24a':'#fff';circ(c,q[0],q[1],20);c.fillStyle='#ff6fd0';star(c,q[0],q[1],10,4);c.fill();});
    for(let i=0;i<2;i++){const P=i?this.PR():this.PL(),tp=this.tip(i,this.fa[i]);c.strokeStyle='#ffe24a';c.lineWidth=22;c.lineCap='round';c.beginPath();c.moveTo(P[0],P[1]);c.lineTo(tp[0],tp[1]);c.stroke();c.strokeStyle='#fff';c.lineWidth=8;c.beginPath();c.moveTo(P[0],P[1]);c.lineTo(tp[0],tp[1]);c.stroke();}
    const b=this.ball;if(b){c.fillStyle='#d8d8e8';circ(c,b.x,b.y,b.r);c.fillStyle='#fff';circ(c,b.x-4,b.y-4,5);}
    for(let i=0;i<this.balls;i++){c.fillStyle='#d8d8e8';circ(c,40+i*34,H-40,12);}if(this.saveT>0&&b){c.fillStyle='#6cf0a0';c.font=`800 20px ${FONT}`;c.textAlign='center';c.fillText('ボール セーブ中',W/2,H-40);}
    c.fillStyle='rgba(255,255,255,.5)';c.font=`800 18px ${FONT}`;c.textAlign='center';c.fillText('どこでも タッチ → フリッパー！',W/2,yF+80);
    c.restore();arcHUD(c,this,'ピンボール','#c040c0');},
  down(x,y){this.flip=1;if(this.ph==='play')tone(250,.05,'square',.06);},move(){},up(){this.flip=0;},
  hint(){const b=this.ball;if(this.ph!=='play'||!b||b.y<this.yF-160)return null;return{x:W/2,y:this.yF+40};},hintText(){return 'ボールが きたら タッチで はじこう！';}};
// ---------- バスケット ----------
SCN.basket={bg:'#1a1040',song:'arcade',
  enter(){arcInit(this,'basket',{time:45,th:[800,1800,3000],intro:'バスケット！ ボールを ゆびで うえに シュッと はじいて ゴールに いれよう！ たくさん いれてね'});this.hx=W/2;this.balls=[];this.rack=0;this.el=0;this.net=0;this.made=0;},
  HY(){return H*.36;},B0(){return{x:W/2,y:H-200};},
  hoopX(t){const k=clamp((t-15)/5,0,1);return W/2+Math.sin(t*1.3)*150*k;},
  update(dt){const on=arcTick(this,dt);if(this.net>0)this.net-=dt;if(on){this.el+=dt;if(this.time<10&&!this.fev){this.fev=1;this.fever=10;say('ラスト スパート！ てんすう 3ばい！');}}this.hx=this.hoopX(this.el);const HY=this.HY(),R=62;if(this.rack>0)this.rack-=dt;
    for(const b of this.balls){const py=b.y;b.vy+=1500*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;b.rot+=dt*6;const sc=this.sc(b.y,b);const rb=30*sc;
      if(!b.done&&b.vy>0&&py<HY&&b.y>=HY&&b.up){const dx=Math.abs(b.x-this.hx);if(dx<R-rb*.5){b.done=1;b.inT=0;const sw=dx<R*.4&&!b.rim;const v=arcAdd(this,sw?30:20,this.hx,HY-70,sw?'#6cf0a0':'#ffe24a');this.made++;this.net=.4;sfx('ding');noise(.15,.2,3000);if(sw)this.pops.push({x:this.hx,y:HY-120,txt:'スウィッシュ！',t:0,col:'#6cf0a0'});}
        else if(dx<R+rb){b.rim=(b.rim||0)+1;b.vy=-Math.abs(b.vy)*.45;b.vx+=(b.x<this.hx?-1:1)*140;b.y=HY-2;tone(500,.06,'square',.1);if(b.rim>3)b.done=2;}}
      if(b.y>HY+20&&b.vy>0)b.low=1;}
    for(const b of this.balls)if(b.y>H+60){if(!b.done||b.done===2)arcMiss(this);b.dead=1;}this.balls=this.balls.filter(b=>!b.dead);},
  sc(y,b){const B0=this.B0(),HY=this.HY();if(b&&b.low&&b.done!==1)return .62;return clamp(1-.38*(B0.y-y)/(B0.y-HY),.6,1);},
  throwB(dx,dy){const B0=this.B0(),HY=this.HY(),g=1500;const pw=clamp(-dy/260,.5,1.7);const apex=HY-70-(pw-1)*140;const hgt=B0.y-apex;const vy0=-Math.sqrt(2*g*hgt);const tUp=-vy0/g,tDn=Math.sqrt(2*Math.max(10,HY-apex)/g),Tt=tUp+tDn;
    const ideal=(this.hoopX(this.el+Tt)-B0.x)/Tt;const vx=lerp(dx*2.4,ideal,.68)+rand(-25,25);this.balls.push({x:B0.x,y:B0.y,vx,vy:vy0*rand(.97,1.03),rot:0,up:1});this.rack=.35;sfx('whoosh');},
  draw(c){arcBg(c,'#1a1040','#402060');const HY=this.HY(),hx=this.hx;c.fillStyle='rgba(255,255,255,.08)';c.beginPath();c.moveTo(0,H-120);c.lineTo(W,H-120);c.lineTo(W+100,H);c.lineTo(-100,H);c.fill();
    c.fillStyle='#fff';rr(c,hx-110,HY-170,220,150,10);c.fill();c.strokeStyle='#ff5f6f';c.lineWidth=6;rr(c,hx-110,HY-170,220,150,10);c.stroke();rr(c,hx-45,HY-110,90,70,4);c.stroke();c.fillStyle='#888';c.fillRect(hx-6,HY-20,12,14);
    const R=62;c.strokeStyle='#ff6a1a';c.lineWidth=8;c.beginPath();c.ellipse(hx,HY,R,14,0,Math.PI,TAU);c.stroke();
    const drawBall=b=>{const s=this.sc(b.y,b),r=30*s;c.save();c.translate(b.x,b.y);c.rotate(b.rot);c.fillStyle='#ff8a2a';circ(c,0,0,r);c.strokeStyle='#8a3a10';c.lineWidth=2.5*s;c.beginPath();c.moveTo(-r,0);c.lineTo(r,0);c.moveTo(0,-r);c.lineTo(0,r);c.stroke();c.beginPath();c.arc(-r*1.05,0,r*.7,-1,1);c.stroke();c.beginPath();c.arc(r*1.05,0,r*.7,Math.PI-1,Math.PI+1);c.stroke();c.restore();};
    for(const b of this.balls)if(b.low||b.done===1)drawBall(b);
    c.strokeStyle='#fff';c.lineWidth=3;const nw=this.net>0?Math.sin(this.net*30)*6:0;for(let i=0;i<=6;i++){const x0=hx-R+i*R/3;c.beginPath();c.moveTo(x0,HY+4);c.lineTo(hx-R*.55+i*R*.55/3+nw,HY+70);c.stroke();}for(let k=1;k<3;k++){c.beginPath();c.moveTo(hx-R+k*8,HY+k*22);c.lineTo(hx+R-k*8,HY+k*22);c.stroke();}
    c.strokeStyle='#ff8a3a';c.lineWidth=8;c.beginPath();c.ellipse(hx,HY,R,14,0,0,Math.PI);c.stroke();
    for(const b of this.balls)if(!(b.low||b.done===1))drawBall(b);
    const B0=this.B0();if(this.rack<=0&&this.ph==='play'){drawBall({x:B0.x,y:B0.y,rot:0});c.fillStyle='rgba(255,255,255,.8)';c.font=`800 20px ${FONT}`;c.textAlign='center';c.fillText('うえに シュッ！',B0.x,B0.y+60);c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=4;c.setLineDash([10,10]);c.beginPath();c.moveTo(B0.x,B0.y-50);c.lineTo(B0.x,B0.y-160-Math.sin(T*4)*20);c.stroke();c.setLineDash([]);}
    c.fillStyle='#fff';c.font=`800 22px ${FONT}`;c.textAlign='left';c.fillText('いれた '+this.made,24,H-40);
    arcHUD(c,this,'バスケット','#ff7a2a');},
  down(x,y){this.sw={x,y,t:T};},move(){},
  up(x,y){const s=this.sw;this.sw=null;if(!s||this.ph!=='play'||this.rack>0)return;const dx=x-s.x,dy=y-s.y;if(dy>-30){if(dy>-30&&Math.abs(dx)<20&&y>H*.5){this.throwB(0,-300);}return;}this.throwB(dx,dy);},
  hint(){if(this.ph!=='play'||this.rack>0)return null;const B=this.B0();return{x:B.x,y:B.y,x2:B.x,y2:B.y-220};},hintText(){return 'ボールを うえに はじこう！';}};
// ---------- たいこリズム ----------
const TAIKO_PAT=[['D','','D',''],['D','','K',''],['D','D','K',''],['K','','D',''],['D','K','D','K'],['D','','D','D'],['K','K','D','']];
SCN.taiko={bg:'#2a0a1a',song:null,
  enter(){arcInit(this,'taiko',{time:0,th:[2500,5000,7500],intro:'たいこリズム！ あかい マークが きたら あかい たいこ、 あおい マークが きたら あおい たいこを たたこう！ きいろは れんだ！'});
    const bpm=pick([110,120,130]);this.bt=60/bpm;this.notes=[];const bars=18;let b=2;for(let bar=0;bar<bars;bar++){if(bar===6||bar===13){this.notes.push({t:b*this.bt,k:'R',len:this.bt*3,hits:0});b+=4;continue;}
      const p=bar<3?TAIKO_PAT[bar%2]:pick(TAIKO_PAT);p.forEach((k,i)=>{if(k)this.notes.push({t:(b+i)*this.bt,k});});if(bar>9&&Math.random()<.4)this.notes.push({t:(b+3.5)*this.bt,k:pick(['D','K'])});b+=4;}
    this.notes.sort((a,b)=>a.t-b.t);this.st=-1;this.lastB=-1;this.judge=null;this.hitA=[0,0];this.danceT=0;this.endAt=b*this.bt+1.5;this.good=0;this.ok=0;this.miss=0;},
  JX:110,SP:380,LY(){return H*.36;},
  don(){tone(110,.2,'sine',.55,0,-40);noise(.06,.25,250,0,undefined,'lowpass');},ka(){tone(1300,.05,'square',.1);noise(.05,.25,4500);},
  update(dt){const on=arcTick(this,dt);for(let i=0;i<2;i++)if(this.hitA[i]>0)this.hitA[i]-=dt;if(this.judge)this.judge.t+=dt;if(this.danceT>0)this.danceT-=dt;if(!on)return;
    this.st+=dt;const bi=Math.floor(this.st/this.bt*2);if(bi!==this.lastB&&this.st>=0){this.lastB=bi;if(bi%2===0){tone(bi%8===0?65:98,.18,'triangle',.18);noise(.03,.08,8000);}else noise(.02,.05,9000);
      const mel=[72,76,79,76,74,77,81,77];if(bi%2===0)tone(440*Math.pow(2,(mel[(bi/2)%8]-69)/12),.14,'square',.035);}
    for(const n of this.notes){if(n.done)continue;if(n.k==='R'){if(this.st>n.t+n.len)n.done=1;continue;}if(this.st-n.t>.2){n.done=1;this.miss++;arcMiss(this);this.judge={txt:'ふか',col:'#9ab0d0',t:0};}}
    if(this.st>this.endAt){const r=(this.good+this.ok*.5)/Math.max(1,this.good+this.ok+this.miss);if(this.miss===0)this.score+=1000;arcEnd(this,this.miss===0?'フルコンボ！':'おしまい！');}},
  hit(k){if(this.ph!=='play')return;this.hitA[k==='D'?0:1]=.12;k==='D'?this.don():this.ka();this.danceT=.3;
    const R=this.notes.find(n=>n.k==='R'&&!n.done&&this.st>=n.t-.1&&this.st<=n.t+n.len);if(R){R.hits++;arcAdd(this,10,this.JX+40,this.LY()-60,'#ffe24a');return;}
    let best=null,bd=9;for(const n of this.notes){if(n.done||n.k==='R')continue;const d=Math.abs(this.st-n.t);if(d<bd){bd=d;best=n;}if(n.t>this.st+.3)break;}
    if(best&&bd<.2){best.done=1;const same=best.k===k;const good=same&&bd<.085;if(good){this.good++;arcAdd(this,30,this.JX,this.LY()-60,'#ffe24a');this.judge={txt:'りょう',col:'#ffb000',t:0};burst(this.JX,this.LY(),10,'star');}else{this.ok++;arcAdd(this,same?15:8,this.JX,this.LY()-60,'#fff');this.judge={txt:'か',col:'#fff',t:0};}}},
  draw(c){arcBg(c,'#2a0a1a','#5a1a2a',false);const LY=this.LY(),JX=this.JX,SP=this.SP;
    c.fillStyle='#1a0a14';rr(c,0,LY-60,W,120,0);c.fill();c.fillStyle='#3a1a2a';c.fillRect(0,LY-56,W,112);c.strokeStyle='#ffe24a';c.lineWidth=3;c.beginPath();c.moveTo(0,LY-58);c.lineTo(W,LY-58);c.moveTo(0,LY+58);c.lineTo(W,LY+58);c.stroke();
    c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=4;c.beginPath();c.arc(JX,LY,44,0,TAU);c.stroke();c.fillStyle='rgba(255,255,255,.12)';circ(c,JX,LY,44);
    for(let i=this.notes.length-1;i>=0;i--){const n=this.notes[i];if(n.done&&n.k!=='R')continue;const x=JX+(n.t-this.st)*SP;if(n.k==='R'){const x2=JX+(n.t+n.len-this.st)*SP;if(x2<0||x>W+60)continue;c.fillStyle='#ffc21a';rr(c,Math.max(x,JX-40)-36,LY-36,Math.max(0,x2-Math.max(x,JX-40))+72,72,36);c.fill();c.fillStyle='#fff';c.font=`800 22px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('れんだ！ '+n.hits,Math.max(x,JX)+60,LY);continue;}
      if(x>W+60||x<-60)continue;const col=n.k==='D'?'#ff4d4d':'#4a9aff';c.fillStyle='#fff';circ(c,x,LY,40);c.fillStyle=col;circ(c,x,LY,34);c.fillStyle='#fff';circ(c,x-10,LY-6,6);circ(c,x+10,LY-6,6);c.fillStyle='#2a1a1a';circ(c,x-10,LY-5,3);circ(c,x+10,LY-5,3);c.strokeStyle='#2a1a1a';c.lineWidth=3;c.beginPath();c.arc(x,LY+6,8,.2,Math.PI-.2);c.stroke();
      c.fillStyle='#fff';c.font=`800 14px ${FONT}`;c.fillText(n.k==='D'?'ドン':'カッ',x,LY+52);}
    if(this.judge&&this.judge.t<.5){c.fillStyle=this.judge.col;c.font=`40px ${POP}`;c.textAlign='center';c.fillText(this.judge.txt,JX,LY-90-this.judge.t*40);}
    const dy=H-230;[['D','#ff4d4d','ドン',W*.27],['K','#4a9aff','カッ',W*.73]].forEach(([k,col,lab,x],i)=>{const a=this.hitA[i]>0,s=a?.94:1;c.save();c.translate(x,dy);c.scale(s,s);c.fillStyle='#8a3a2a';rr(c,-130,10,260,110,30);c.fill();c.fillStyle='#ffd23a';for(let q=0;q<8;q++)circ(c,-110+q*31.4,20,5);
      c.fillStyle='#fff6e8';ell(c,0,0,130,56);c.fillStyle=a?shade(col,.3):col;ell(c,0,0,70,30);c.fillStyle='#fff';c.font=`36px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.fillText(lab,0,2);c.restore();});
    drawFuka(c,W/2,H-60,{outfit:outfit(),t:T,sc:1.3,cheer:this.danceT>0,wave:this.danceT>0});
    arcHUD(c,this,'たいこリズム','#e8483a');},
  down(x,y){if(y<H*.5)return;this.hit(x<W/2?'D':'K');},move(){},up(){},
  hint(){if(this.ph!=='play')return null;const n=this.notes.find(n=>!n.done&&n.t>this.st-.1);if(!n||n.t-this.st>.6)return null;return{x:n.k==='K'?W*.73:W*.27,y:H-230};},hintText(){return 'マークが まるに かさなったら たたこう！';}};
// ---------- ぴょんぴょんみちわたり ----------
SCN.crossy={bg:'#8ad06a',song:'arcade',
  enter(){arcInit(this,'crossy',{time:60,th:[200,450,800],intro:'ぴょんぴょん みちわたり！ タッチで まえに ジャンプ。 くるまに きをつけて、 かわは まるたに のってね！ どこまで いけるかな？'});
    this.rows=[];this.pl={c:3,r:1,x:3,hop:0,dead:0};this.cam=0;this.best=1;this.lives=3;this.inv=0;this.gen(40);},
  CW:W/7,RH:84,
  gen(n){while(this.rows.length<n){const i=this.rows.length;let t='grass';if(i>2){const prev=this.rows[i-1].t;const r=Math.random();t=prev==='grass'?(r<.55?'road':'river'):(r<.35?'grass':prev);if(prev!=='grass'&&this.rows.slice(-3).every(q=>q.t===prev))t='grass';}
      const row={t,objs:[],trees:[],coins:[]};if(t==='grass'){if(i>2){const k=Math.floor(Math.random()*3);for(let q=0;q<k;q++)row.trees.push(Math.floor(Math.random()*7));}if(i>2&&Math.random()<.4)row.coins.push(Math.floor(Math.random()*7));row.trees=row.trees.filter(c=>!row.coins.includes(c));}
      else if(t==='road'){const d=Math.random()<.5?1:-1,sp=(70+Math.random()*90+Math.min(90,i*2))*d,n2=2+Math.floor(Math.random()*2),len=Math.random()<.3?2:1;row.sp=sp;for(let q=0;q<n2;q++)row.objs.push({x:q*(7/n2)+Math.random()*.8,len,col:pick(['#ff5f6f','#4ab0ff','#ffd23a','#b48cff','#6cd08a'])});}
      else{const d=Math.random()<.5?1:-1,sp=(50+Math.random()*50)*d;row.sp=sp;let x=0;while(x<9){const len=2+Math.floor(Math.random()*2);row.objs.push({x,len});x+=len+1+Math.random()*1.2;}}
      this.rows.push(row);}},
  RY(r){return H-240-(r-this.cam)*this.RH;},
  update(dt){const on=arcTick(this,dt);const P=this.pl;if(P.hop>0)P.hop=Math.max(0,P.hop-dt*7);if(this.inv>0)this.inv-=dt;const CW=this.CW;
    for(const row of this.rows){if(row.sp){for(const o of row.objs){o.x+=row.sp/CW*dt;const span=9;if(row.sp>0&&o.x>7.5)o.x-=span;if(row.sp<0&&o.x+o.len<-.5)o.x+=span;}}}
    this.cam+=(Math.max(0,P.r-2.5)-this.cam)*Math.min(1,dt*4);if(!on)return;const row=this.rows[P.r];
    if(row.t==='river'&&P.hop===0){const log=row.objs.find(o=>P.x+.5>o.x+.15&&P.x+.5<o.x+o.len-.15);if(log){P.x+=row.sp/CW*dt;P.c=Math.round(P.x);if(P.x<-.4||P.x>6.4)this.die('ながされちゃった！');}else this.die('ぽちゃん！');}
    if(row.t==='road'&&this.inv<=0){for(const o of row.objs){if(P.x+.75>o.x&&P.x+.25<o.x+o.len){this.die('ぶつかった！');break;}}}
    const cn=row.coins&&row.coins.indexOf(P.c);if(row.coins&&cn>=0&&P.hop===0){row.coins.splice(cn,1);arcAdd(this,20,this.CW*(P.c+.5),this.RY(P.r)-40,'#ffe24a');sfx('coin');}},
  die(msg){if(this.inv>0)return;const P=this.pl;this.lives--;arcMiss(this);sfx('no');this.shake=.4;hush();speak(msg);if(this.lives<=0){arcEnd(this,'ゲームオーバー');return;}let r=P.r;while(r>0&&this.rows[r].t!=='grass')r--;P.r=r;P.c=clamp(Math.round(P.x),0,6);while(this.rows[r].trees.includes(P.c))P.c=(P.c+1)%7;P.x=P.c;this.inv=1.6;},
  move1(dc,dr){if(this.ph!=='play')return;const P=this.pl;if(P.hop>.4)return;const nc=clamp(P.c+dc,0,6),nr=Math.max(Math.floor(this.cam)-1,Math.max(0,P.r+dr));const tr=this.rows[nr];if(tr&&tr.t==='grass'&&tr.trees.includes(nc)){tone(200,.05,'sine',.1);return;}
    P.c=nc;P.x=nc;P.r=nr;P.hop=1;tone(700,.05,'sine',.12,0,300);if(nr>=this.best){if(nr>this.best){this.score+=10;}this.best=Math.max(this.best,nr);}this.gen(nr+30);},
  draw(c){const CW=this.CW,RH=this.RH;const sh=this.shake>0?Math.sin(T*80)*6:0;c.save();c.translate(sh,0);c.fillStyle='#8ad06a';c.fillRect(-OX/SC,-OY/SC,W+2*OX/SC,H+2*OY/SC);
    const r0=Math.max(0,Math.floor(this.cam)-3),r1=Math.min(this.rows.length-1,Math.ceil(this.cam+(H/RH)));
    for(let r=r0;r<=r1;r++){const row=this.rows[r],y=this.RY(r);if(row.t==='grass'){c.fillStyle=r%2?'#8ad06a':'#9ae07a';c.fillRect(-OX/SC,y-RH/2,W+2*OX/SC,RH);}else if(row.t==='road'){c.fillStyle='#6a6a80';c.fillRect(-OX/SC,y-RH/2,W+2*OX/SC,RH);c.fillStyle='rgba(255,255,255,.6)';for(let x=0;x<W;x+=60)c.fillRect(x+10,y-2,30,4);}
      else{c.fillStyle='#4ab0e8';c.fillRect(-OX/SC,y-RH/2,W+2*OX/SC,RH);c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=2;for(let x=-40;x<W;x+=50){const xx=x+(T*20*(row.sp>0?1:-1))%50;c.beginPath();c.arc(xx,y,10,Math.PI*1.1,Math.PI*1.9);c.stroke();}}}
    for(let r=r1;r>=r0;r--){const row=this.rows[r],y=this.RY(r);
      if(row.t==='river')for(const o of row.objs){c.fillStyle='#a8703a';rr(c,o.x*CW+4,y-RH*.34,o.len*CW-8,RH*.68,RH*.3);c.fill();c.fillStyle='#c8904a';rr(c,o.x*CW+10,y-RH*.2,o.len*CW-20,RH*.14,6);c.fill();}
      if(row.t==='grass'){for(const t of row.trees){const x=(t+.5)*CW;c.fillStyle='#8a5a3a';c.fillRect(x-6,y,12,20);c.fillStyle='#3a9a5a';circ(c,x,y-8,30);c.fillStyle='#4cbe6a';circ(c,x-8,y-16,18);}for(const k of row.coins){const x=(k+.5)*CW;c.fillStyle='#e8a800';circ(c,x,y+Math.sin(T*4)*3,16);c.fillStyle='#ffe24a';circ(c,x,y+Math.sin(T*4)*3,12);}}
      if(this.pl.r===r){const P=this.pl,x=(P.x+.5)*CW,hy=Math.sin(P.hop*Math.PI)*28;if(!(this.inv>0&&Math.floor(T*10)%2)){c.fillStyle='rgba(0,0,0,.2)';ell(c,x,y+18,22,8);drawAnimal(c,'chick',x,y+24-hy,.5,{t:T,happy:1});}}
      if(row.t==='road')for(const o of row.objs){const x=o.x*CW,w=o.len*CW;c.fillStyle='rgba(0,0,0,.2)';rr(c,x+6,y-RH*.28+6,w-12,RH*.56,14);c.fill();c.fillStyle=o.col;rr(c,x+6,y-RH*.32,w-12,RH*.56,14);c.fill();c.fillStyle='#bfe8ff';const fx=row.sp>0?x+w-34:x+14;rr(c,fx,y-RH*.24,20,RH*.4,5);c.fill();c.fillStyle='#2a2a3a';for(const wx of[x+20,x+w-32])rr(c,wx,y+RH*.2,14,8,3),c.fill();}}
    c.restore();
    for(let i=0;i<this.lives;i++){c.fillStyle='#ff5f9a';heartP(c,40+i*40,236,14);c.fill();}c.fillStyle='#fff';c.font=`800 22px ${FONT}`;c.textAlign='right';c.lineWidth=5;c.strokeStyle='rgba(40,60,40,.6)';c.strokeText(this.best+' マス',W-24,238);c.fillText(this.best+' マス',W-24,238);
    const by=H-80;[[-1,'prev',W*.18],[0,'up',W/2],[1,'next',W*.82]].forEach(([d,ic,x])=>{c.globalAlpha=.85;if(ic==='up'){c.fillStyle='#ff6fa8';circ(c,x,by,56);c.fillStyle='#fff';c.beginPath();c.moveTo(x,by-28);c.lineTo(x+26,by+14);c.lineTo(x-26,by+14);c.closePath();c.fill();}else drawBtn(c,x,by,44,'#4ab0ff',ic);c.globalAlpha=1;});
    arcHUD(c,this,'みちわたり','#4cae6a');},
  down(x,y){this.sw={x,y};},move(){},
  up(x,y){const s=this.sw;this.sw=null;if(!s)return;const by=H-80;if(Math.abs(y-by)<70){if(Math.abs(x-W/2)<70){this.move1(0,1);return;}if(x<W*.33){this.move1(-1,0);return;}if(x>W*.67){this.move1(1,0);return;}}
    const dx=x-s.x,dy=y-s.y;if(Math.hypot(dx,dy)<30){this.move1(0,1);return;}if(Math.abs(dx)>Math.abs(dy))this.move1(Math.sign(dx),0);else this.move1(0,dy<0?1:-1);},
  hint(){return this.ph==='play'?{x:W/2,y:H-80}:null;},hintText(){return 'タッチで まえに ジャンプ！ くるまに きをつけて';}};

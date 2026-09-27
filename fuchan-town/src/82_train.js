// ================= train =================
const STATIONS=[{d:1000,ja:'いちご えき',icon:'strawberry',col:'#ff6f91'},{d:2500,ja:'どうぶつ えき',icon:'bear',col:'#ffb03a'},{d:4100,ja:'ほしぞら えき',icon:'starcandy',col:'#8a6ad8'}];
SCN.train={bg:'#bfe9ff',song:'play',ST:STATIONS,
  enter(){this.back=false;this.d=0;this.v=0;this.go=false;this.brake=false;this.fin=0;this.si=0;this.arr=null;this.riders=[];this.perf=0;this.honk=0;this.cross={d:1750,honked:false};this.tun=[3100,3450];this.said={};
    this.wait=STATIONS.map(()=>shuffle(['bear','rabbit','cat','dog','panda','pig','chick']).slice(0,2));this.outT=0;
    say('でんしゃの うんてんしゅさん！ みどりの ボタンを おして すすもう。 えきに ついたら あかい ボタンで とまってね');},
  X0(){return W*.62;},GY(){return H*.62;},
  update(dt){const st=STATIONS[this.si];
    if(this.arr){this.arr.t+=dt;const a=this.arr;if(a.t>.6&&a.n<this.wait[this.si].length&&a.t>.6+a.n*1.1){const k=this.wait[this.si][a.n];a.n++;this.riders.push(k);if(this.riders.length>6)this.riders.shift();sfx('pop');hush();speak(WORDS[k][0]+'さん のりました');}
      if(a.t>3.4){this.arr=null;this.si++;if(this.si>=STATIONS.length){this.fin=.01;sfx('fanfare');confetti(80);say(`しゅうてん！ ほしぞら えきに とうちゃく！ ${this.perf>=2?'ぴったり ていしゃ めいじん！':'じょうずに うんてん できたね！'}`);}else{sfx('bell');say('しゅっぱつ しんこう！ みどりの ボタンで すすもう');}}}
    else if(!this.fin){if(this.go&&!this.brake)this.v=Math.min(380,this.v+230*dt);else if(this.brake)this.v=Math.max(0,this.v-520*dt);else this.v=Math.max(0,this.v-40*dt);
      if(this.back){this.v=0;this.d-=140*dt;if(Math.abs(this.d-st.d)<30){this.back=false;}}
      this.d+=this.v*dt;
      if(st&&!this.back&&this.v===0&&Math.abs(this.d-st.d)<150&&this.d>200){const df=Math.abs(this.d-st.d);this.arr={t:0,n:0};const wb=this.bk;this.bk=false;if(df<45&&!wb){this.perf++;sfx('fanfare');say(`${st.ja}！ ぴったり！`);confetti(30);}else{sfx('chin');say(`${st.ja}に つきました！`);}}
      else if(st&&this.d>st.d+150&&!this.back){this.v=Math.max(0,this.v-700*dt);if(this.v===0){this.back=true;this.bk=true;say('いきすぎちゃった！ ちょっと バックするね');}}
      if(st&&!this.said[this.si]&&st.d-this.d<700&&st.d-this.d>0){this.said[this.si]=1;say(`つぎは ${st.ja}！ あかい ボタンで とまってね`);}
      if(!this.cross.warn&&this.cross.d-this.d<600&&this.cross.d-this.d>0){this.cross.warn=1;say('ふみきりだ！ まんなかの ボタンで ポッポーって ならそう');}
      if(this.d>this.tun[0]-this.X0()+100&&!this.said.tun){this.said.tun=1;say('トンネル！ まっくら〜');}}
    if(this.honk>0)this.honk-=dt;
    if(this.fin>0){this.fin+=dt;if(this.fin>3.5&&this.fin<9){this.fin=9;celebrate('train',this.perf>=2);}}},
  wx(wd){return this.X0()+(wd-this.d);},
  draw(c){const gy=this.GY(),d=this.d;skyBg(c,'#8fd8ff','#e6f8ff',gy);sun(c,90,90,30,T*.3);
    for(let i=0;i<5;i++){const x=((i*260-d*.1)%1300+1300)%1300-200;cloud(c,x,120+(i%3)*50,.6,i%2===0);}
    c.fillStyle='#b8e8a0';for(let i=-1;i<6;i++){const x=i*300-((d*.3)%300);c.beginPath();c.ellipse(x,gy,220,120,0,Math.PI,TAU);c.fill();}
    c.fillStyle=vfill(c,gy,H,'#8ad86a',.05,-.1);c.fillRect(-400,gy,W+800,H);
    for(let i=-1;i<10;i++){const x=i*140-((d*.6)%140);tree(c,x,gy-40,.7,i%2?'#5cc46a':'#6cd07a');}
    const cr=this.wx(this.cross.d);if(cr>-200&&cr<W+200){c.fillStyle='#e8d8b0';c.fillRect(cr-50,gy-6,100,H-gy);SPECIAL_THING.crossing(c,cr-80,gy-60,1.4);for(const [k,dx] of [['dog',70],['rabbit',120]])drawAnimal(c,k,cr+dx,gy+110,.5,{t:T+dx,happy:this.cross.honked,hop:this.honk>0?Math.abs(Math.sin(T*10))*.5:0});}
    for(let si=0;si<STATIONS.length;si++){const S=STATIONS[si],x=this.wx(S.d);if(x<-400||x>W+400)continue;c.fillStyle='#d8c8b8';c.fillRect(x-260,gy-40,520,40);c.fillStyle='#fff';c.fillRect(x-260,gy-44,520,6);c.fillStyle=S.col;c.fillRect(x-200,gy-220,12,180);c.fillRect(x+188,gy-220,12,180);rr(c,x-220,gy-250,440,40,10);c.fill();
      c.fillStyle='#fff';rr(c,x-110,gy-310,220,56,16);c.fill();c.strokeStyle=S.col;c.lineWidth=5;c.stroke();c.fillStyle=shade(S.col,-.3);c.font=`800 30px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(S.ja,x+14,gy-282);drawThing(c,S.icon,x-84,gy-282,.6);
      c.strokeStyle='#ff5f6f';c.lineWidth=4;c.setLineDash([10,8]);c.beginPath();c.moveTo(x,gy-40);c.lineTo(x,gy+10);c.stroke();c.setLineDash([]);
      if(si>=this.si)this.wait[si].forEach((k,j)=>{const boarded=si===this.si&&this.arr&&this.arr.n>j;if(!boarded)drawAnimal(c,k,x-60+j*120,gy-40,.55,{t:T+j,happy:1,hop:si===this.si&&this.v===0?Math.abs(Math.sin(T*5+j))*.3:0});});}
    c.fillStyle='#8a6a4a';for(let x=-((d)%40)-40;x<W+40;x+=40)c.fillRect(x,gy+18,22,10);c.fillStyle='#9a9ab0';c.fillRect(-400,gy+10,W+800,6);c.fillStyle='#8a8aa0';c.fillRect(-400,gy+22,W+800,4);
    const X=this.X0(),bump=this.v>0?Math.sin(T*20)*1.5:0;drawCar(c,X-360,gy+14+bump,1,'#5aa8ff',this.riders.slice(3,6));drawCar(c,X-150,gy+14-bump,1,'#ffd23a',this.riders.slice(0,3));drawEngine(c,X+40,gy+14+bump,1,'#ff5f6f',d/60);
    if(this.v>30&&Math.random()<.3)puff(X+5,gy-140,1,'#f4f4f8');
    const t0=this.wx(this.tun[0]),t1=this.wx(this.tun[1]);if(t1>-50&&t0<W+50){const inT=X>t0&&X-360<t1;c.fillStyle='#6a5a4a';c.fillRect(t0,gy-260,t1-t0,280);if(inT){c.fillStyle='rgba(10,10,30,.75)';c.fillRect(-400,0,W+800,H);const g=c.createRadialGradient(X+150,gy-50,10,X+150,gy-50,200);g.addColorStop(0,'rgba(255,240,160,.7)');g.addColorStop(1,'rgba(255,240,160,0)');c.fillStyle=g;circ(c,X+150,gy-50,200);}c.fillStyle='#8a7a6a';c.beginPath();c.ellipse(t0,gy-120,40,140,0,0,TAU);c.fill();c.fillStyle='#2a2a3a';c.beginPath();c.ellipse(t0,gy-100,24,120,0,0,TAU);c.fill();c.fillStyle='#8a7a6a';rr(c,t1-30,gy-270,60,290,20);c.fill();}
    if(this.honk>0){c.fillStyle='#fff';c.font=`36px ${POP}`;c.textAlign='center';c.fillText('ポッポー！',X+60,gy-230-this.honk*40);}
    c.fillStyle='rgba(255,255,255,.9)';rr(c,110,108,380,40,20);c.fill();c.strokeStyle='#9a9ab0';c.lineWidth=4;c.beginPath();c.moveTo(130,128);c.lineTo(470,128);c.stroke();const L=STATIONS[2].d;STATIONS.forEach((S,i)=>{const x=130+340*S.d/L;c.fillStyle=i<this.si?'#ffd23a':S.col;circ(c,x,128,10);});c.fillStyle='#ff5f6f';rr(c,122+340*clamp(d/L,0,1),118,18,20,5);c.fill();
    c.fillStyle='rgba(255,255,255,.85)';rr(c,0,H-200,W,200,0);c.fill();
    const gb=this.go&&!this.brake;c.fillStyle=gb?'#3aa060':'#6cd08a';circ(c,W-110,H-100,70);c.fillStyle='#fff';c.beginPath();c.moveTo(W-130,H-135);c.lineTo(W-80,H-100);c.lineTo(W-130,H-65);c.closePath();c.fill();c.fillStyle='#3a6a4a';c.font=`800 20px ${FONT}`;c.textAlign='center';c.fillText('すすむ',W-110,H-12);
    c.fillStyle=this.brake?'#c83a4a':'#ff5f6f';circ(c,110,H-100,70);c.fillStyle='#fff';rr(c,80,H-122,60,44,8);c.fill();c.fillStyle='#8a2a3a';c.font=`800 20px ${FONT}`;c.fillText('とまる',110,H-12);
    c.fillStyle='#ffd23a';circ(c,W/2,H-110,50);c.fillStyle='#8a5a1a';c.font=`800 22px ${FONT}`;c.textBaseline='middle';c.fillText('ポッポー',W/2,H-110);
    c.fillStyle='#3a3a5a';c.font=`800 22px ${FONT}`;c.fillText(Math.round(this.v/4)+' km',W/2,H-40);},
  down(x,y){if(this.fin>0||this.arr)return;if(hitC(x,y,W-110,H-100,85)){this.go=true;this.brake=false;sfx('tap');return;}if(hitC(x,y,110,H-100,85)){this.brake=true;this.go=false;sfx('tap');return;}
    if(hitC(x,y,W/2,H-110,65)){this.honk=1;sfx('honk');tone(523,.5,'triangle',.2);tone(659,.5,'triangle',.18);const cr=this.cross;if(!cr.honked&&cr.d-this.d<700&&cr.d-this.d>-200){cr.honked=true;rkCheer();say('ふみきりの みんなが てを ふってるよ！');burst(this.wx(cr.d)+90,this.GY()+40,12,'heart');}return;}
    if(hitC(x,y,this.X0()+100,this.GY()-80,120)){this.honk=1;sfx('honk');}},
  up(){this.go=false;this.brake=false;},
  hint(){if(this.fin>0||this.arr)return null;const st=STATIONS[this.si];if(!st)return null;const df=st.d-this.d;if(df<500&&df>-150)return{x:110,y:H-100};if(!this.cross.honked&&this.cross.d-this.d<600&&this.cross.d-this.d>0)return{x:W/2,y:H-110};return{x:W-110,y:H-100};},
  hintText(){return 'みどりで すすむ、あかで とまる。 えきで とまってね';}};

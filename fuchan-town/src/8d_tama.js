// ================= tama-ire =================
function jnum(n){const d=['','いち','に','さん','よん','ご','ろく','なな','はち','きゅう'];if(n<=10)return['','いち','に','さん','よん','ご','ろく','なな','はち','きゅう','じゅう'][n];const t=Math.floor(n/10),o=n%10;return(t>1?d[t]:'')+'じゅう'+(o?d[o]:'');}
SCN.tama={bg:'#c8a878',song:'play',
  enter(){this.ph='ready';this.t=0;this.fin=0;this.balls=[];this.score=0;this.opp=0;this.oppT=1;this.dr=null;this.cnt=null;this.TL=30;
    say('たまいれ！ あかい たまを したから うえに シュッと はじいて かごに いれよう！');setTimeout(()=>{if(scene===this){this.ph='play';this.t=0;sfx('beep');tone(1800,.5,'square',.08);say('スタート！');}},3600);},
  B(){return{x:W/2,y:H*.3};},
  hand(){return{x:W/2-20,y:H*.8};},
  update(dt){this.t+=dt;const B=this.B();
    if(this.ph==='play'){this.oppT-=dt;if(this.oppT<=0){this.oppT=rand(1,2);if(Math.random()<.8)this.opp++;}if(this.t>=this.TL){this.ph='whistle';this.t=0;tone(1800,.8,'square',.1);say('おわり〜！ かごの たまを かぞえよう！');}}
    for(let i=this.balls.length-1;i>=0;i--){const b=this.balls[i];if(b.in){b.t+=dt;if(b.t>.4)this.balls.splice(i,1);continue;}b.vy+=1400*dt;b.x+=b.vx*dt;b.y+=b.vy*dt;
      if(b.vy>0&&!b.checked&&b.y>=B.y-6&&b.y-b.vy*dt<B.y-6){b.checked=true;if(Math.abs(b.x-B.x)<(this.ph==='play'?50:0)){b.in=true;b.t=0;this.score++;sfx('pop');burst(B.x,B.y,6,'star');if(this.score%5===0){rkCheer();say(`${this.score}こ はいった！`);}}else if(Math.abs(b.x-B.x)<70){b.vx=(b.x-B.x)*6;b.vy*=-.3;sfx('tick');}}
      if(b.vy>0&&!b.checked&&Math.abs(b.x-B.x)<90&&b.y<B.y&&b.y>B.y-140)b.vx+=(B.x-b.x)*dt*4;
      if(b.y>H*.9){this.balls.splice(i,1);}}
    if(this.ph==='whistle'&&this.t>2.5){this.ph='count';this.cnt={n:0,t:0,a:this.score,b:this.opp,fly:[]};}
    const C=this.cnt;if(this.ph==='count'){C.t+=dt;for(const f of C.fly){f.t+=dt;}C.fly=C.fly.filter(f=>f.t<1.2);const mx=Math.max(C.a,C.b);if(C.t>clamp(9/Math.max(1,mx),.26,.75)&&C.n<mx){C.t=0;C.n++;hush();speak(jnum(C.n));if(C.n<=C.a)C.fly.push({x:B.x,t:0,col:'#ff4a4a'});if(C.n<=C.b)C.fly.push({x:520,t:0,col:'#ffffff'});sfx('pop');}
      if(C.n>=mx&&C.t>1.4&&!C.done){C.done=1;const win=C.a>C.b,tie=C.a===C.b;sfx(win?'fanfare':'chin');if(win)confetti(90);say(win?`あかぐみの かち！ ${C.a}たい ${C.b}！`:tie?`ひきわけ！ ${C.a}こ ずつ！`:`しろぐみの かち… でも ${C.a}こも いれたね！ すごい！`);this.fin=.01;}}
    if(this.fin>0){this.fin+=dt;if(this.fin>3.4&&this.fin<9){this.fin=9;const C2=this.cnt;celebrate('tama',C2.a-C2.b>=5);}}},
  draw(c){drawSchoolyard(c,H*.38);const B=this.B();
    c.save();c.globalAlpha=.8;drawBasket(c,520,H*.36,.55,'#f4f4f8');c.restore();for(let i=0;i<3;i++)drawAnimal(c,['panda','rabbit','chick'][i],470+i*40,H*.62,.35,{t:T+i,hop:this.ph==='play'?Math.abs(Math.sin(T*6+i))*.5:0});
    drawBasket(c,B.x,B.y,1,'#ff5f6f');
    if(this.ph==='count'){const C=this.cnt;for(const f of C.fly){const k=f.t/1.2;c.fillStyle=f.col;circ(c,f.x+Math.sin(k*3)*20,(f.x===B.x?B.y:H*.36)-Math.sin(k*Math.PI)*160,f.col==='#ffffff'?9:13);}
      c.fillStyle='rgba(255,255,255,.95)';rr(c,W/2-170,H*.08,340,90,30);c.fill();c.font=`54px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.fillStyle='#ff5f6f';c.fillText(C.n,W/2,H*.08+46);
      c.font=`800 22px ${FONT}`;c.fillStyle='#ff4a4a';c.fillText('あか '+Math.min(C.n,C.a),W/2-110,H*.08+46);c.fillStyle='#8a8aa0';c.fillText('しろ '+Math.min(C.n,C.b),W/2+110,H*.08+46);}
    for(const b of this.balls){const r=b.in?13*(1-b.t/.4):13;c.fillStyle=gfill(c,b.x-3,b.y-3,14,'#ff4a4a');circ(c,b.x,b.y,r);}
    for(let i=0;i<12;i++){const x=60+(i%6)*24+(i>5?12:0),y=H*.9-(i>5?16:0);c.fillStyle=gfill(c,x-3,y-3,13,'#ff4a4a');circ(c,x,y,12);}
    const hd=this.hand();drawFuka(c,hd.x,H*.94,{outfit:outfit({acc:'cap'}),t:T,sc:2.1,cheer:this.ph==='play'&&!!this.dr,point:this.ph!=='play'});drawRikki(c,W/2+140,H*.95,{sc:1.6,t:T,clap:RK.clap});this.rkPos={x:W/2+140,y:H*.95,sc:1.6};
    if(this.dr){c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=4;c.setLineDash([8,6]);c.beginPath();c.moveTo(this.dr.sx,this.dr.sy);c.lineTo(this.dr.x,this.dr.y);c.stroke();c.setLineDash([]);c.fillStyle='#ff4a4a';circ(c,this.dr.x,this.dr.y,13);}
    if(this.ph==='play'||this.ph==='ready'){const k=this.ph==='play'?1-this.t/this.TL:1;c.fillStyle='rgba(255,255,255,.9)';circ(c,W-70,140,38);c.fillStyle=k<.25?'#ff5f6f':'#6cd08a';c.beginPath();c.moveTo(W-70,140);c.arc(W-70,140,32,-Math.PI/2,-Math.PI/2+TAU*k);c.closePath();c.fill();
      c.fillStyle='rgba(255,255,255,.9)';rr(c,20,112,190,50,25);c.fill();c.fillStyle='#ff4a4a';c.font=`800 24px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(`はいった ${this.score}`,115,137);}
    if(this.ph==='ready'||this.ph==='play'&&this.t<3){c.fillStyle='rgba(255,255,255,.85)';rr(c,W/2-190,H*.62,380,56,28);c.fill();c.fillStyle='#ff5fa2';c.font=`800 22px ${FONT}`;c.textAlign='center';c.fillText('したから うえへ シュッ！',W/2,H*.62+28);if(this.ph==='play')drawHand(c,W/2,H*.8-((T*1.2)%1)*200,T);}},
  throwB(vx,vy){const hd=this.hand();this.balls.push({x:hd.x+30,y:hd.y-100,vx,vy,checked:false,in:false,t:0});sfx('whoosh');},
  down(x,y){if(this.ph!=='play')return;this.dr={sx:x,sy:y,x,y,t:performance.now()};},
  move(x,y){if(this.dr){this.dr.x=x;this.dr.y=y;}},
  up(x,y){const d=this.dr;this.dr=null;if(!d||this.ph!=='play')return;const dx=x-d.sx,dy=y-d.sy;const hd=this.hand(),B=this.B();
    if(Math.hypot(dx,dy)<25){const T0=1,sx=hd.x+30,sy=hd.y-100;const tx=B.x+rand(-70,70);this.throwB((tx-sx)/T0,(B.y-8-sy-.5*1400*T0*T0)/T0);return;}
    if(dy>-10)return;const ang=Math.atan2(dy,dx),sp=clamp(Math.hypot(dx,dy)*4.5,800,1600);const sx=hd.x+30,sy=hd.y-100;const need=Math.sqrt(2*1400*Math.max(60,sy-B.y+50));const vy=-Math.min(1650,Math.max(need,-Math.sin(ang)*sp));this.throwB(Math.cos(ang)*sp*.7,vy);},
  hint(){return this.ph==='play'&&this.balls.length===0?{x:W/2,y:H*.8,x2:W/2,y2:H*.5}:null;},
  hintText(){return 'ゆびを したから うえに シュッと うごかそう';}};

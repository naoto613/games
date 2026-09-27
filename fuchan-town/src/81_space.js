// ================= space =================
SCN.space={bg:'#0e0a2a',song:'hero',
  RCOLS:['#ff5f6f','#5aa8ff','#ffb03a','#6cd08a','#b48cff'],
  enter(){this.ph='build';this.t=0;this.col=this.RCOLS[0];this.att={nose:0,win:0,fins:0};this.dr=null;this.pl=pick(PLANETS);this.items=[];this.got=0;this.rx=W/2;this.tx=W/2;this.hurt=0;this.lucky=false;this.hi=0;this.flag=null;this.spawn=0;this.comet=null;this.fin=0;
    this.pieces=['nose','win','fins'].map((k,i)=>({k,x:130+i*170,y:H-120,hx:130+i*170,hy:H-120}));say('ロケットを つくろう！ したの パーツを ロケットに くっつけてね');},
  rc(){return{x:W/2,y:H*.52,s:2};},
  tgt(k){const r=this.rc();return{x:r.x,y:r.y+({nose:-135,win:-50,fins:25})[k]*r.s};},
  update(dt){this.t+=dt;if(this.hurt>0)this.hurt-=dt;
    if(this.ph==='count'){const n=Math.floor(this.t);if(n!==this.lastN&&n<3){this.lastN=n;sfx('tick');say(['さん！','に！','いち！'][n]);}if(this.t>3&&!this.gone){this.gone=1;sfx('launch');sfx('boom');say('はっしゃ〜！');}if(Math.random()<.6&&this.t>2)puff(W/2+rand(-60,60),H*.52+120,2,'#e8e8f0');if(this.t>4.2){this.ph='fly';this.t=0;say('ゆびで ロケットを うごかして、ほしを あつめよう！ いわに きをつけて！');}}
    if(this.ph==='fly'){this.rx+=(this.tx-this.rx)*Math.min(1,dt*8);this.spawn-=dt;if(this.spawn<=0&&this.t<17){this.spawn=.42;const rock=Math.random()<.28;this.items.push({x:rand(60,W-60),y:-40,rock,v:rock?rand(220,300):rand(240,320),r:rand(0,6)});}
      if(!this.comet&&this.t>7&&this.t<8&&Math.random()<.5)this.comet={x:-60,y:H*.3,got:false};const cm=this.comet;if(cm&&!cm.got){cm.x+=260*dt;cm.y+=40*dt;if(Math.hypot(cm.x-this.rx,cm.y-(H*.72))<80){cm.got=true;this.lucky=true;sfx('fanfare');confetti(40);say('にじいろの ながれぼし！ ラッキー！');}if(cm.x>W+80)this.comet=null;}
      for(let i=this.items.length-1;i>=0;i--){const it=this.items[i];it.y+=it.v*dt;it.r+=dt*2;if(Math.hypot(it.x-this.rx,it.y-(H*.72))<(it.rock?58:64)){this.items.splice(i,1);if(it.rock){if(this.hurt<=0){this.hurt=.8;sfx('boing');say(pick(['いたっ！','よけて〜！']));}}else{this.got++;sfx('ding');burst(it.x,it.y,8,'star');}continue;}if(it.y>H+50)this.items.splice(i,1);}
      if(this.t>19){this.ph='land';this.t=0;sfx('fanfare');say(`${this.pl.ja}に ついたよ！ ほし ${this.got}こ あつめたね！`);setTimeout(()=>{if(scene===this&&this.ph==='land')say('あれ？ だれか いるよ。 タッチしてみよう');},3000);}}
    if(this.ph==='land'&&this.flag){this.flag.t+=dt;if(this.flag.t>3&&!this.fin){this.fin=1;celebrate('space',this.lucky||this.got>=18);}}},
  draw(c){const ph=this.ph;c.fillStyle='#0e0a2a';c.fillRect(-400,0,W+800,H);
    const sp=ph==='fly'?this.t*300:ph==='count'&&this.t>3?(this.t-3)*300:0;c.fillStyle='#fff';for(let i=0;i<70;i++){const x=(i*97)%W,y=((i*173)%H+sp*(.3+(i%3)*.3))%H;circ(c,x,y,(i%3)*.7+.8);}
    if(ph==='build'||ph==='ready'||ph==='count'){const r=this.rc();const up=ph==='count'&&this.t>3?Math.pow(this.t-3,2)*500:0;
      c.fillStyle='#4a3a6a';rr(c,-400,r.y+110*r.s-10,W+800,H,0);c.fill();c.fillStyle='#8a8aa8';c.fillRect(r.x-120,r.y+50*r.s,240,14);
      c.save();c.translate((ph==='count'?Math.sin(this.t*60)*3:0),-up);drawRocket(c,r.x,r.y,r.s,this.col,ph==='count'&&this.t>2.5,T);
      for(const k of['fins','win','nose']){const p=this.tgt(k);if(this.att[k])drawRocketPart(c,k,p.x,p.y,r.s*(k==='win'?1:1),this.col);else if(ph==='build'){c.globalAlpha=.25+Math.sin(T*4)*.1;drawRocketPart(c,k,p.x,p.y,r.s,'#ffffff');c.globalAlpha=1;}}c.restore();
      if(ph==='build'){this.RCOLS.forEach((col,i)=>{const x=120+i*90,y=170,sel=this.col===col;c.fillStyle=col;circ(c,x,y,sel?34:28);c.strokeStyle='#fff';c.lineWidth=sel?6:3;c.beginPath();c.arc(x,y,sel?34:28,0,TAU);c.stroke();});
        tray(c,H-120,150);for(const p of this.pieces)if(!this.att[p.k])drawRocketPart(c,p.k,p.x,p.y,p===this.dr?1.9:1.4,this.col);}
      if(ph==='ready'){drawBtn(c,W/2,H-130,70,'#ff5f6f','play',true);c.fillStyle='#fff';c.font=`800 28px ${FONT}`;c.textAlign='center';c.fillText('はっしゃ！',W/2,H-30);}
      if(ph==='count'&&this.t<3){c.font=`140px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.fillStyle='#ffd23a';c.fillText(3-Math.floor(this.t),W/2,H*.2);}
      drawFuka(c,90,H*.52+220,{outfit:outfit(),t:T,sc:2.2,cheer:ph!=='build',point:ph==='build'});drawRikki(c,520,H*.52+224,{sc:1.8,t:T,clap:ph==='count'?1:RK.clap});this.rkPos={x:520,y:H*.52+224,sc:1.8};}
    else if(ph==='fly'){const k=clamp((this.t-15)/4,0,1);if(k>0)drawPlanet(c,this.pl,W/2,-200+k*300,120+k*120);
      for(const it of this.items){if(it.rock){c.save();c.translate(it.x,it.y);c.rotate(it.r);c.fillStyle='#8a6a5a';c.strokeStyle='#5a3a2a';c.lineWidth=3;c.beginPath();for(let i=0;i<7;i++){const a=i/7*TAU,rr2=30+((i*13)%3)*6;c.lineTo(Math.cos(a)*rr2,Math.sin(a)*rr2);}c.closePath();c.fill();c.stroke();c.fillStyle='rgba(0,0,0,.2)';circ(c,-8,-6,7);c.restore();}else{c.fillStyle='#ffd23a';star(c,it.x,it.y,22,10,5,it.r);c.fill();c.strokeStyle='#fff';c.lineWidth=2;c.stroke();}}
      const cm=this.comet;if(cm&&!cm.got){for(let i=0;i<6;i++){c.fillStyle=`hsla(${i*60},90%,65%,.7)`;circ(c,cm.x-i*16,cm.y-i*3,14-i*1.5);}c.fillStyle='#fff';star(c,cm.x,cm.y,20,9);c.fill();}
      c.save();c.translate(this.rx,H*.72);c.rotate((this.tx-this.rx)*.004+(this.hurt>0?Math.sin(this.hurt*40)*.2:0));drawRocket(c,0,0,1,this.col,1,T);for(const k of['fins','win','nose'])drawRocketPart(c,k,0,({nose:-135,win:-50,fins:25})[k],1,this.col);c.restore();
      c.fillStyle='rgba(255,255,255,.2)';rr(c,120,112,360,16,8);c.fill();c.fillStyle='#ffd23a';rr(c,120,112,360*clamp(this.t/19,0,1),16,8);c.fill();drawPlanet(c,this.pl,490,120,16);c.fillStyle='#fff';c.font=`800 22px ${FONT}`;c.textAlign='left';c.textBaseline='middle';c.fillText('★ '+this.got,24,150);}
    else{const p=this.pl;drawPlanet(c,{id:'earth',col:'#5ab8f0',sh:'#2a78c0'},470,150,40);c.fillStyle='#6cd08a';ell(c,462,140,14,10);
      c.fillStyle=gfill(c,W/2,H*.55,H*.6,p.col);c.beginPath();c.ellipse(W/2,H*1.15,W*1.1,H*.55,0,0,TAU);c.fill();c.fillStyle='rgba(0,0,0,.08)';for(const [a,b,r] of [[120,.72,40],[420,.8,30],[260,.9,50]])ell(c,a,H*b,r,r*.35);
      drawRocket(c,110,H*.66,1,this.col,0,T);for(const k of['fins','win','nose'])drawRocketPart(c,k,110,H*.66+({nose:-135,win:-50,fins:25})[k],1,this.col);
      const ay=H*.7;drawAlien(c,430,ay,1.4,T,this.hi>0);if(this.hi>0){c.fillStyle='#fff';rr(c,330,ay-270,200,56,20);c.fill();c.fillStyle='#3aa060';c.font=`800 24px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('Hello! こんにちは',430,ay-242);}
      if(this.flag){const f=this.flag;c.fillStyle='#8a8aa8';c.fillRect(f.x-3,f.y-120*Math.min(1,f.t*2),6,120*Math.min(1,f.t*2));if(f.t>.4){c.fillStyle='#ff8cc0';c.beginPath();c.moveTo(f.x+3,f.y-120);c.lineTo(f.x+70+Math.sin(T*6)*4,f.y-100);c.lineTo(f.x+3,f.y-78);c.fill();c.fillStyle='#fff';heartP(c,f.x+26,f.y-100,8);c.fill();}}
      else if(this.hi>0){c.fillStyle='#fff';c.font=`800 24px ${FONT}`;c.textAlign='center';c.fillText('じめんを タッチして はたを たてよう！',W/2,H*.88);}
      drawFuka(c,240,H*.8,{outfit:outfit(),t:T,sc:2.4,wave:!this.flag,cheer:!!this.flag});drawRikki(c,330,H*.82,{sc:1.8,t:T,clap:RK.clap});this.rkPos={x:330,y:H*.82,sc:1.8};
      c.fillStyle='#fff';c.font=`800 26px ${FONT}`;c.textAlign='center';c.fillText(`${p.ja}  ${p.en}`,W/2,190);}
    stepDots(c,4,{build:0,ready:1,count:1,fly:2,land:3}[ph],128);},
  down(x,y){const ph=this.ph;
    if(ph==='build'){for(let i=0;i<5;i++)if(hitC(x,y,120+i*90,170,36)){this.col=this.RCOLS[i];sfx('spark');say(['あか','あお','オレンジ','みどり','むらさき'][i]+'の ロケット！');return;}
      for(const p of this.pieces)if(!this.att[p.k]&&hitC(x,y,p.x,p.y,70)){this.dr=p;sfx('tap');return;}return;}
    if(ph==='ready'){if(hitC(x,y,W/2,H-130,90)){this.ph='count';this.t=0;this.lastN=-1;this.gone=0;sfx('fanfare');}return;}
    if(ph==='fly'){this.tx=clamp(x,50,W-50);return;}
    if(ph==='land'){if(hitC(x,y,430,H*.7-60,90)){this.hi=1;sfx('boing');hush();speak('こんにちは！');speak('Hello!','en');rkCheer();burst(430,H*.7-120,12,'heart');return;}
      if(this.hi>0&&!this.flag&&y>H*.62){this.flag={x:clamp(x,60,W-80),y:Math.max(y,H*.66),t:0};sfx('fanfare');confetti(60);sayPair(this.pl.ja+'に とうちゃく！',this.pl.en);}}},
  move(x,y){if(this.dr){this.dr.x=x;this.dr.y=y;}if(this.ph==='fly')this.tx=clamp(x,50,W-50);},
  up(x,y){const p=this.dr;if(!p)return;this.dr=null;const t=this.tgt(p.k);if(Math.hypot(x-t.x,y-t.y)<120){this.att[p.k]=1;sfx('snap');burst(t.x,t.y,12,'star');rkCheer();say({nose:'とがった あたま！',win:'まどを つけたよ！',fins:'はねを つけたよ！'}[p.k]);
      if(this.att.nose&&this.att.win&&this.att.fins){this.ph='ready';setTimeout(()=>say('かんせい！ あかい ボタンで はっしゃ！'),1400);}}else{p.x=p.hx;p.y=p.hy;sfx('whoosh');}},
  hint(){const ph=this.ph;if(ph==='build'){const p=this.pieces.find(p=>!this.att[p.k]);if(!p)return null;const t=this.tgt(p.k);return{x:p.hx,y:p.hy,x2:t.x,y2:t.y};}if(ph==='ready')return{x:W/2,y:H-130};if(ph==='fly'){const it=this.items.find(i=>!i.rock&&i.y>H*.3);return it?{x:it.x,y:H*.72}:null;}if(ph==='land')return this.hi?(this.flag?null:{x:W/2,y:H*.75}):{x:430,y:H*.7-60};return null;},
  hintText(){return{build:'パーツを ロケットに くっつけてね',ready:'はっしゃボタンを タッチ',fly:'ゆびで ロケットを うごかして ほしを あつめよう',land:'うちゅうじんに タッチして あいさつ'}[this.ph]||'';}};

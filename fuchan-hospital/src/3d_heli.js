// ================= ドクターヘリ =================
M('heli',(c,o)=>{const sp=o.spin??T*30;c.fillStyle='rgba(0,0,0,.12)';ell(c,0,34,40,5);c.strokeStyle='#8a98b0';c.lineWidth=3;c.beginPath();c.moveTo(-26,26);c.lineTo(22,26);c.moveTo(-16,16);c.lineTo(-18,26);c.moveTo(12,16);c.lineTo(14,26);c.stroke();
  c.fillStyle=gfill(c,-6,-6,40,'#ffffff');OL(c,'#9aa8c0');c.beginPath();c.moveTo(-34,-4);c.quadraticCurveTo(-34,-20,-10,-20);c.lineTo(14,-20);c.quadraticCurveTo(34,-18,34,2);c.quadraticCurveTo(30,16,10,16);c.lineTo(-26,16);c.quadraticCurveTo(-34,12,-34,-4);c.closePath();c.fill();c.stroke();
  c.fillStyle='#ff4d6d';c.fillRect(-34,2,68,6);c.beginPath();c.moveTo(-30,-6);c.lineTo(-70,-12);c.lineTo(-70,-4);c.lineTo(-30,4);c.fill();c.fillStyle='#bfe8ff';c.beginPath();c.moveTo(12,-16);c.quadraticCurveTo(30,-14,30,0);c.lineTo(12,0);c.closePath();c.fill();crossSign(c,-10,-6,6);
  c.fillStyle='#5a6a8a';rr(c,-4,-26,8,8,2);c.fill();c.strokeStyle='#5a6a8a';c.lineWidth=3;const w=46*Math.abs(Math.cos(sp));c.beginPath();c.moveTo(-w,-27);c.lineTo(w,-27);c.stroke();c.save();c.translate(-70,-8);c.rotate(sp*1.3);c.beginPath();c.moveTo(0,-9);c.lineTo(0,9);c.stroke();c.restore();});
Object.assign(WORDS,{heli:['ドクターヘリ','helicopter']});
const HDEST={sea:{ja:'うみの しま',sky:['#7ad0ff','#d8f4ff'],ground:'#ffe8a8',far:'#4aa8e8'},mountain:{ja:'やまの うえ',sky:['#a8d8ff','#eaf6ff'],ground:'#7ac870',far:'#9ab8d8'},snow:{ja:'ゆきやま',sky:['#c8d8f0','#f4f8ff'],ground:'#ffffff',far:'#b8c8e0'},boat:{ja:'うみの ふね',sky:['#ffb88a','#ffe8c8'],ground:'#4aa8e8',far:'#ff9a6a'}};
SCN.heli={bg:'#9ad8ff',song:'hero',
  enter(){this.ph='count';this.cd=3;this.miss=0;this.fin=0;this.t=0;this.dest=pick(Object.keys(HDEST));this.P=newPatient();this.hy=H*.45;this.ty=H*.45;this.dist=0;this.goal=6200;this.obs=[];this.items=[];this.spawn=1;this.hearts=0;this.bump=0;this.boost=0;this.hold=0;this.hx=150;this.rope=0;this.lift=0;this.bt=0;
    this.nums=shuffle([1,2,3]);say(`${HDEST[this.dest].ja}で ${ptName(this.P)}さんが まってる！ ドクターヘリで しゅつどう！ 3・2・1 の じゅんに ボタンを おして はっしゃしよう`);},
  numP(i){return{x:W/2+(i-1)*150,y:H-110};},
  update(dt){this.t+=dt;if(this.bump>0)this.bump-=dt;if(this.boost>0)this.boost-=dt;
    if(this.ph==='lift'){this.lt+=dt;this.hy-=dt*160;if(this.lt>1.6){this.ph='fly';this.hy=H*.45;say('とぶよ！ ゆびで うえ したに うごかして、 くもを よけて ハートを あつめよう');}}
    if(this.ph==='fly'){const sp=(this.boost>0?420:260)*(this.bump>0?.5:1);this.dist+=sp*dt;this.hy+=(this.ty-this.hy)*Math.min(1,dt*5);this.hy=clamp(this.hy,170,H-150);
      this.spawn-=dt;if(this.spawn<=0&&this.dist<this.goal-600){this.spawn=rand(.7,1.2);const r=Math.random();const y=rand(190,H-170);if(r<.45)this.obs.push({x:W+80,y,k:'thunder',v:0});else if(r<.65)this.obs.push({x:W+80,y,k:'bird',v:rand(60,120),ph:rand(0,6)});this.items.push({x:W+80+rand(40,160),y:clamp(y+rand(-200,200),190,H-170),k:Math.random()<.15?'star':'heart'});}
      for(const o of this.obs){o.x-=(sp+o.v)*dt;if(o.k==='bird')o.y+=Math.sin(this.t*4+o.ph)*40*dt;if(!o.hit&&Math.abs(o.x-this.hx)<60&&Math.abs(o.y-this.hy)<46){o.hit=1;this.bump=.8;this.miss++;bad();sfx('bump');say(o.k==='thunder'?'かみなりぐもだ！ よけよう':'とりさん ごめんね！');}}
      for(const it of this.items){it.x-=sp*dt;if(!it.got&&Math.abs(it.x-this.hx)<50&&Math.abs(it.y-this.hy)<46){it.got=1;if(it.k==='heart'){this.hearts++;good(it.x,it.y,1,`${this.hearts}！`);hush();speak(String(this.hearts),'en');}else{this.boost=2;good(it.x,it.y,2,'スピードアップ！');sfx('launch');}}}
      this.obs=this.obs.filter(o=>o.x>-100);this.items=this.items.filter(i=>i.x>-100&&!i.got);
      if(this.dist>=this.goal){this.ph='rescue';this.hx=W*.25;this.hy=H*.28;this.px=W*.62+rand(-40,60);banner('とうちゃく！','#ff4d6d',`ハート ${this.hearts}こ`);setTimeout(()=>{if(scene===this)say(`${ptName(this.P)}さんを たすけよう！ ヘリを ${ptName(this.P)}さんの まうえに うごかして、 ${ptName(this.P)}さんを タッチしてね`);},2200);}}
    if(this.ph==='rescue'){if(this.rope>0&&!this.lift){this.rope=Math.min(1,this.rope+dt*.9);if(this.rope>=1)this.lift=.01;}if(this.lift>0){this.lift+=dt;if(this.lift>1.6&&!this.saved){this.saved=1;good(this.hx,this.hy,3,'きゅうじょ せいこう！');say('つかまえた！ びょういんへ もどろう！');setTimeout(()=>{if(scene===this){this.ph='return';this.bt=0;sfx('siren');}},1800);}}}
    if(this.ph==='return'){this.bt+=dt;if(this.bt>4.2&&!this.fin){this.fin=.01;banner('ちゃくりく！','#ff4d6d','ドクターヘリ だいかつやく！');setTimeout(()=>{if(scene===this)say('びょういんに ついた！ おいしゃさんが まってるよ。 もう だいじょうぶ！');},900);}}
    if(this.fin>0){this.fin+=dt;if(this.fin>3&&this.fin<9){this.fin=9;celebrate('heli',starsFor(this.miss));}}},
  sky(c,a,b){const L=-OX/SC-2,R=W+OX/SC+2;const g=c.createLinearGradient(0,-OY/SC,0,H);g.addColorStop(0,a);g.addColorStop(1,b);c.fillStyle=g;c.fillRect(L,-OY/SC-2,R-L,H+OY/SC*2+4);},
  drawCloud(c,x,y,s,dark){c.fillStyle=dark?'#6a6a8a':'rgba(255,255,255,.9)';circ(c,x,y,26*s);circ(c,x+28*s,y-10*s,32*s);circ(c,x+60*s,y,24*s);c.fillRect(x,y,60*s,22*s);if(dark){c.fillStyle='#ffe36a';c.beginPath();c.moveTo(x+26*s,y+16*s);c.lineTo(x+16*s,y+44*s);c.lineTo(x+28*s,y+40*s);c.lineTo(x+20*s,y+66*s);c.lineTo(x+40*s,y+32*s);c.lineTo(x+30*s,y+34*s);c.closePath();c.fill();}},
  drawHospRoof(c,x,y){c.fillStyle='#fff';rr(c,x-160,y,320,H,10);c.fill();c.strokeStyle='#c8d8f0';c.lineWidth=5;c.stroke();c.fillStyle='#ff9ac8';rr(c,x-170,y-16,340,24,12);c.fill();c.fillStyle='#8a98b8';c.beginPath();c.ellipse(x,y-16,90,14,0,0,TAU);c.fill();txt(c,'H',x,y-18,24,'#fff',undefined,POP,400);crossSign(c,x-120,y+60,18);for(let i=0;i<3;i++){c.fillStyle='#aee0ff';rr(c,x-60+i*50,y+40,36,40,6);c.fill();}},
  draw(c){const D=HDEST[this.dest];
    if(this.ph==='count'||this.ph==='lift'){this.sky(c,'#8fd8ff','#e8f8ff');for(let i=0;i<4;i++)this.drawCloud(c,((i*180+this.t*14)%(W+200))-100,120+i*50,.8);this.drawHospRoof(c,W/2,H*.62);
      const spin=this.ph==='lift'?T*40:this.cd<3?T*(10+(3-this.cd)*10):0;MED.heli(c,W/2,(this.ph==='lift'?this.hy:H*.62-50),2.4,{spin});
      if(this.ph==='count'){fu(c,W/2-160,H*.62-18,1.8,{point:1,acc:'cap'});drawRikki(c,W/2+170,H*.62-18,{sc:1.3,t:T,wave:1});panel(c,40,H-200,W-80,180,26,'#fff','#ff8cc0');txt(c,`じゅんばんに ${this.cd}`,W/2,H-176,24,'#ff5fa2');this.nums.forEach((n,i)=>{const p=this.numP(i);numBtn(c,p.x,p.y,48,n,n>this.cd?'#c8c0d0':['#ff8cc0','#5aa8ff','#ffb03a'][i],n===this.cd&&idle>4);});}
      return;}
    if(this.ph==='fly'){this.sky(c,D.sky[0],D.sky[1]);const L=-OX/SC-2,R=W+OX/SC+2;c.fillStyle=D.far;for(let i=0;i<5;i++){const x=((i*220-this.dist*.2)%(W+400)+W+400)%(W+400)-200;c.beginPath();c.moveTo(x,H);c.lineTo(x+110,H-160);c.lineTo(x+220,H);c.fill();}
      for(let i=0;i<5;i++)this.drawCloud(c,((i*170-this.dist*.5)%(W+300)+W+300)%(W+300)-150,140+i*70,.7);
      for(const it of this.items){if(it.k==='heart')MED.love(c,it.x,it.y+Math.sin(T*6+it.x)*4,.8);else{c.save();c.translate(it.x,it.y);c.rotate(T*3);c.fillStyle='#ffd23a';star(c,0,0,26,12);c.fill();c.restore();}}
      for(const o of this.obs){if(o.k==='thunder')this.drawCloud(c,o.x-40,o.y-10,1,1);else{c.save();c.translate(o.x,o.y);c.fillStyle='#5a6a8a';ell(c,0,0,16,10);const fl=Math.sin(this.t*14)*10;c.beginPath();c.moveTo(-4,-2);c.lineTo(-18,-14-fl);c.lineTo(4,-4);c.fill();c.fillStyle='#ffb03a';c.beginPath();c.moveTo(-16,0);c.lineTo(-24,2);c.lineTo(-16,4);c.fill();c.restore();}}
      c.save();c.translate(this.hx,this.hy);c.rotate(this.bump>0?Math.sin(this.bump*30)*.15:(this.ty-this.hy)*.002);MED.heli(c,0,0,1.6,{spin:T*30});c.restore();
      if(this.boost>0){for(let i=0;i<3;i++){c.fillStyle='rgba(255,255,255,.6)';c.fillRect(this.hx-120-i*30,this.hy-10+i*8,60,4);}}
      const p=this.dist/this.goal;c.fillStyle='rgba(255,255,255,.85)';rr(c,120,112,W-240,30,15);c.fill();c.fillStyle='#ff8cc0';rr(c,120,112,Math.max(30,(W-240)*p),30,15);c.fill();txt(c,D.ja,W/2,127,15,'#fff');MED.love(c,W-150,172,.55);txt(c,`× ${this.hearts}`,W-126,174,24,'#ff4d7d','left');
      if(!this.hold&&this.t<8)txt(c,'ゆびで ヘリを うえ・したへ',W/2,H-60,22,'#fff');return;}
    // rescue / return
    if(this.ph==='rescue'){this.sky(c,D.sky[0],D.sky[1]);const gy=H*.74;const L=-OX/SC-2,R=W+OX/SC+2;
      if(this.dest==='sea'){c.fillStyle='#4aa8e8';c.fillRect(L,gy,R-L,H);c.fillStyle=D.ground;ell(c,this.px,gy+10,150,40);c.fillStyle='#4cae4a';circ(c,this.px+90,gy-40,30);}
      else if(this.dest==='boat'){c.fillStyle='#4aa8e8';c.fillRect(L,gy,R-L,H);c.fillStyle='#fff';c.beginPath();c.moveTo(this.px-110,gy-10);c.lineTo(this.px+110,gy-10);c.lineTo(this.px+80,gy+30);c.lineTo(this.px-80,gy+30);c.fill();c.fillStyle='#ff6f91';c.fillRect(this.px-110,gy+4,220,8);}
      else{c.fillStyle=D.far;c.beginPath();c.moveTo(L,gy);c.lineTo(this.px-160,gy-80);c.lineTo(this.px+120,gy-40);c.lineTo(R,gy);c.lineTo(R,H+OY/SC);c.lineTo(L,H+OY/SC);c.fill();c.fillStyle=D.ground;c.fillRect(L,gy,R-L,H);}
      const cy=this.lift>0?lerp(gy-4,this.hy+30+this.rope*0,Math.min(1,this.lift/1.4)):gy-4;const cx=this.lift>0?this.hx:this.px;
      if(!this.saved)drawPt(c,this.P,cx,cy,.9,{t:T,wave:!this.lift,sad:false,happy:this.lift>0});
      c.strokeStyle='#8a7a6a';c.lineWidth=3;if(this.rope>0){const ry=lerp(this.hy+30,gy-60,this.lift>0?Math.max(0,1-this.lift/1.4):this.rope);c.beginPath();c.moveTo(this.hx,this.hy+30);c.lineTo(this.hx,ry);c.stroke();}
      c.save();c.translate(this.hx,this.hy);MED.heli(c,0,0,1.6,{spin:T*30});c.restore();
      if(!this.rope){const al=Math.abs(this.hx-this.px)<36;c.strokeStyle=al?'#4cc86a':'rgba(255,95,162,.7)';c.lineWidth=4;c.setLineDash([10,8]);c.beginPath();c.moveTo(this.hx,this.hy+40);c.lineTo(this.hx,gy-60);c.stroke();c.setLineDash([]);if(!this.dragH)txt(c,'ヘリを ドラッグ',this.hx,this.hy-70,18,'#fff');}
      fu(c,60,H-30,1.8,{point:1});rk(this,c,W-50,H-30,1.3);return;}
    const k=Math.min(1,this.bt/3.6);this.sky(c,'#8fd8ff','#e8f8ff');this.drawHospRoof(c,W/2,H*.62);const hx=lerp(-80,W/2,Math.min(1,k*1.3)),hy=lerp(H*.25,H*.62-50,Math.max(0,(k-.6)/.4));c.save();c.translate(hx,hy);MED.heli(c,0,0,2.2,{spin:T*30});c.restore();
    if(this.fin>0){fu(c,W/2-170,H*.62-18,1.8,{cheer:1});drawPt(c,this.P,W/2+170,H*.62-18,.8,{t:T,happy:1,dance:1});drawRikki(c,W/2+90,H*.62-18,{sc:1.2,t:T,clap:1});}},
  down(x,y){if(this.fin)return;
    if(this.ph==='count'){this.nums.forEach((n,i)=>{const p=this.numP(i);if(hitC(x,y,p.x,p.y,52)){if(n===this.cd){good(p.x,p.y,1,`${n}！`);hush();speak(String(n));speak(numEn(n),'en');sfx('drill');this.cd--;if(this.cd===0){setTimeout(()=>{if(scene===this){banner('はっしゃ！','#ff4d6d');this.ph='lift';this.lt=0;this.hy=H*.62-50;sfx('launch');}},700);}}else if(n<this.cd){bad();this.miss++;say(`つぎは ${this.cd}だよ。 3・2・1 と かぞえてね`);}}});return;}
    if(this.ph==='fly'){this.hold=1;this.ty=y;return;}
    if(this.ph==='rescue'&&!this.rope){if(Math.abs(x-this.hx)<70&&Math.abs(y-this.hy)<50){this.dragH=1;return;}if(Math.abs(x-this.px)<60&&y>H*.5){if(Math.abs(this.hx-this.px)<36){this.rope=.01;sfx('whoosh');hush();speak('ロープを おろすよ！');}else{bad();say(this.hx<this.px?'もうすこし みぎ！':'もうすこし ひだり！');}}}},
  move(x,y){if(this.ph==='fly'&&this.hold)this.ty=y;if(this.ph==='rescue'&&this.dragH&&!this.rope)this.hx=clamp(x,60,W-60);},
  up(){this.hold=0;this.dragH=0;},
  hint(){if(this.fin)return null;if(this.ph==='count'){const i=this.nums.indexOf(this.cd);return i>=0?this.numP(i):null;}
    if(this.ph==='fly'){let y=this.hy;const th=this.obs.find(o=>o.x>this.hx&&o.x<this.hx+260&&Math.abs(o.y-this.hy)<90);const it=this.items.find(i=>i.x>this.hx&&i.x<this.hx+300);if(th)y=th.y>H/2?th.y-180:th.y+180;else if(it)y=it.y;y=clamp(y,190,H-170);return{x:this.hx+40,y,x2:this.hx+41,y2:y};}
    if(this.ph==='rescue'&&!this.rope){if(Math.abs(this.hx-this.px)>=30)return{x:this.hx,y:this.hy,x2:this.px,y2:this.hy};return{x:this.px,y:H*.74-40};}return null;},
  hintText(){return{count:'3・2・1 の じゅんに タッチ',fly:'ゆびで ヘリを うごかそう',rescue:'ヘリを まうえに うごかして かんじゃさんを タッチ'}[this.ph]||'';}};

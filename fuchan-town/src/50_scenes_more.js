// ================= dress up =================
const BGS=[['ピンク','pink'],['さくら','cherry blossoms'],['うみ','sea'],['はなび','fireworks'],['おしろ','castle']];
const POSES=['wave','cheer','dance','hold','point'];
function drawBackdrop(c,i,x,y,w,h){c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
  if(i===0){c.fillStyle='#ffe0f0';c.fillRect(x,y,w,h);c.fillStyle='rgba(255,255,255,.5)';for(let k=0;k<12;k++){heartP(c,x+((k*97)%w),y+((k*61)%h),10);c.fill();}}
  else if(i===1){c.fillStyle=vfill(c,y,y+h,'#bfe8ff',.2,0);c.fillRect(x,y,w,h);c.fillStyle='#ffc0da';for(const [a,b,r] of [[.2,.25,90],[.85,.2,80]])circ(c,x+a*w,y+b*h,r);c.fillStyle='#b07a4a';c.fillRect(x+.2*w-8,y+.25*h,16,h);c.fillRect(x+.85*w-8,y+.2*h,16,h);
    c.fillStyle='#ffb3d6';for(let k=0;k<14;k++){const px=x+((k*83+T*30)%w),py=y+((k*57+T*50)%h);c.save();c.translate(px,py);c.rotate(T+k);ell(c,0,0,6,4);c.restore();}}
  else if(i===2){c.fillStyle=vfill(c,y,y+h*.55,'#7fd0ff',.2,0);c.fillRect(x,y,w,h*.55);c.fillStyle='#4aa8e8';c.fillRect(x,y+h*.45,w,h*.2);c.fillStyle='#f8e4b0';c.fillRect(x,y+h*.62,w,h);c.fillStyle='rgba(255,255,255,.7)';for(let k=0;k<8;k++)circ(c,x+k*50+(T*20)%50,y+h*.62,10);}
  else if(i===3){c.fillStyle=vfill(c,y,y+h,'#1a1446',0,.1);c.fillRect(x,y,w,h);for(let k=0;k<3;k++){const t=(T*.5+k/3)%1,fx=x+w*(.2+k*.3),fy=y+h*(.25+k%2*.1);for(let a=0;a<14;a++){const an=a/14*TAU;c.fillStyle=['#ff5f9a','#ffd23a','#5ad0ff'][k];c.globalAlpha=1-t;circ(c,fx+Math.cos(an)*t*80,fy+Math.sin(an)*t*80,4);}c.globalAlpha=1;}}
  else{c.fillStyle=vfill(c,y,y+h,'#ffe6f4',.1,0);c.fillRect(x,y,w,h);c.fillStyle='#ffc0e0';rr(c,x+w*.2,y+h*.25,w*.6,h*.6,10);c.fill();for(const a of[.2,.5,.8]){c.fillStyle='#ffb0d8';c.fillRect(x+w*a-30,y+h*.12,60,h*.5);c.fillStyle='#b48cff';c.beginPath();c.moveTo(x+w*a-38,y+h*.13);c.lineTo(x+w*a,y+h*.02);c.lineTo(x+w*a+38,y+h*.13);c.fill();}}
  c.restore();}
SCN.dress={bg:'#fff0f8',song:'play',
  THEMES:[['ピンク','#ff8cc0',['pink','yukata','magic']],['みずいろ','#5aa8ff',['sky','yukata2']],['きいろ','#ffd84a',['yellow']],['みどり','#5fd3a8',['mint']],['むらさき','#b48cff',['lav']],['あか','#ff4d6d',['red']]],
  enter(){this.cat='dress';this.changes=0;this.spin=0;this.flash=0;this.photo=0;this.bgI=0;this.pose=0;this.show=null;this.lay();
    const av=this.THEMES.filter(t=>t[2].some(id=>!lockedN('dress',id)));this.theme=pick(av);say(`ファッションショーの おだいは 「${this.theme[0]}の ふく」！ おきがえ しよう！`);},
  match(){return this.theme[2].includes(SAVE.outfit.dress);},
  startShow(){this.photo=0;this.show={t:0,cue:-1,hits:0,flash:0,hearts:[],done:false};sfx('fanfare');say('ファッションショー スタート！ ほしが でたら タッチして ポーズ！');},
  drawShow(c){const S=this.show,k=clamp(S.t/8,0,1);c.fillStyle='#1a1030';c.fillRect(-400,0,W+800,H);
    for(let i=0;i<3;i++){const x=100+i*200+Math.sin(T*.8+i*2)*60;const g=c.createLinearGradient(x,0,W/2,H*.8);g.addColorStop(0,'rgba(255,240,200,.35)');g.addColorStop(1,'rgba(255,240,200,0)');c.fillStyle=g;c.beginPath();c.moveTo(x-20,0);c.lineTo(x+20,0);c.lineTo(W/2+140,H*.85);c.lineTo(W/2-140,H*.85);c.closePath();c.fill();}
    c.fillStyle='#ff8cc0';c.beginPath();c.moveTo(W/2-50,H*.3);c.lineTo(W/2+50,H*.3);c.lineTo(W/2+210,H);c.lineTo(W/2-210,H);c.closePath();c.fill();c.fillStyle='#ffd0e6';for(let i=0;i<8;i++){const t2=((i/8+T*.05)%1);const y=lerp(H*.3,H,t2*t2);c.fillRect(W/2-8,y,16,6+t2*10);}
    c.fillStyle='#3a2a5a';rr(c,W/2-150,H*.18,300,H*.12+10,20);c.fill();c.fillStyle='#ffd23a';c.font=`30px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.fillText('FASHION SHOW',W/2,H*.24);
    const fy=lerp(H*.36,H*.86,ease(k)),fs=lerp(1.6,4.4,ease(k));const pz=S.pz||'wave';drawFuka(c,W/2,fy,{outfit:outfit(),t:T,dir:0,sc:fs,moving:!S.pose&&k<1,[pz]:S.pose>0?1:0,happy:1});
    const aud=['bear','rabbit','cat','dog','panda','pig'];aud.forEach((a,i)=>{const L=i<3,x=L?40+i*50:W-40-(i-3)*50,y=H*.62+(i%3)*H*.12;drawAnimal(c,a,x,y,.5,{t:T+i,happy:S.hits>0,hop:S.cheer>0?Math.abs(Math.sin(T*10+i))*.6:0});});
    for(const h of S.hearts){c.globalAlpha=1-h.t;c.fillStyle='#ff5fa2';heartP(c,h.x,h.y-h.t*120,14);c.fill();c.globalAlpha=1;}
    if(S.cue>=0&&!S.hitCue){const p=1+Math.sin(T*10)*.1;c.save();c.translate(W/2+120,fy-fs*60);c.scale(p,p);c.fillStyle='#ffd23a';star(c,0,0,40,18);c.fill();c.strokeStyle='#fff';c.lineWidth=4;c.stroke();c.restore();drawHand(c,W/2+130,fy-fs*60+20,T);}
    c.fillStyle='rgba(255,255,255,.9)';rr(c,W/2-120,112,240,50,25);c.fill();c.fillStyle='#ff5fa2';c.font=`800 24px ${FONT}`;c.fillText('ポーズ '+S.hits+' / 3',W/2,138);
    if(S.flash>0){c.fillStyle=`rgba(255,255,255,${S.flash})`;c.fillRect(-400,0,W+800,H);}
    if(S.done){c.fillStyle='rgba(255,255,255,.95)';rr(c,60,H*.4,480,150,30);c.fill();c.strokeStyle=this.match()?'#ffd23a':'#ff8cc0';c.lineWidth=6;c.stroke();c.fillStyle='#ff5fa2';c.font=`36px ${POP}`;c.fillText(this.match()?'おだい ぴったり！':'すてき！',W/2,H*.4+55);c.font=`800 24px ${FONT}`;c.fillStyle='#8a5a8a';c.fillText('ハート '+(S.hits*3+(this.match()?5:0))+'こ ゲット！',W/2,H*.4+110);}},
  lay(){this.fx=290;this.fy=H*.62;},
  tabs:[['dress','dress'],['hat','crown'],['shoes','shoe'],['item','wand']],
  tabP(i){return{x:120+i*110,y:165};},
  optP(i){return{x:90+(i%4)*140,y:i<4?H-205:H-95};},
  btnP(i){return{x:540,y:H*.3+i*96};},
  opts(){return this.cat==='dress'?DRESSES:this.cat==='hat'?HATS:this.cat==='shoes'?SHOES:ITEMS_ACC;},
  optId(o){return this.cat==='dress'?o.id:o[0];},
  update(dt){if(this.spin>0)this.spin-=dt;if(this.flash>0)this.flash-=dt*2;if(this.photo>0){this.photo+=dt;if(this.photo>2.4&&this.photo<9){this.photo=9;this.startShow();}}
    const S=this.show;if(S){if(S.flash>0)S.flash-=dt*3;if(S.pose>0)S.pose-=dt;if(S.cheer>0)S.cheer-=dt;for(let i=S.hearts.length-1;i>=0;i--){S.hearts[i].t+=dt;if(S.hearts[i].t>1)S.hearts.splice(i,1);}
      if(!S.done){S.t+=dt*(S.pose>0?.3:1);const ci=[2.2,4.6,7].findIndex(t=>S.t>=t&&S.t<t+1.6);if(ci!==S.cue){S.cue=ci;S.hitCue=false;if(ci>=0)sfx('bell');}
        if(S.t>=8.6){S.done=true;S.dt=0;sfx('fanfare');confetti(this.match()?90:40);say(this.match()?`おだいの ${this.theme[0]}に ぴったり！ だいにんき！`:'すてきな ファッションショー だったね！');}}
      else{S.dt+=dt;if(S.dt>3&&!S.cel){S.cel=1;celebrate('dress',this.match());}}}},
  draw(c){const {fx,fy}=this;if(this.show){this.drawShow(c);return;}
    c.fillStyle='#ffe0f0';for(let x=-400;x<W+400;x+=50)for(let y=0;y<H;y+=50)if(((x+y)/50)%2===0)c.fillRect(x,y,50,50);
    const ax=fx-170,ay=fy-420,aw=340,ah=450;c.save();rr(c,ax,ay,aw,ah,[170,170,20,20]);c.clip();drawBackdrop(c,this.bgI,ax,ay,aw,ah);c.restore();c.strokeStyle='#ffd23a';c.lineWidth=10;rr(c,ax,ay,aw,ah,[170,170,20,20]);c.stroke();
    c.fillStyle='#ffb3d6';ell(c,fx,fy+8,140,26);
    const sp=this.spin>0?[0,2,3,1][Math.floor(this.spin*12)%4]:0,pz=POSES[this.pose];
    drawFuka(c,fx,fy,{outfit:outfit(),t:T,dir:sp,sc:5,happy:this.changes>0,[pz]:1});drawRikki(c,fx+150,fy+6,{sc:2,t:T,dance:this.changes>0});this.rkPos={x:fx+150,y:fy+6,sc:2};
    {const th=this.theme,ok=this.match();c.fillStyle='#fff';rr(c,20,228,150,64,20);c.fill();c.strokeStyle=ok?'#6cd08a':th[1];c.lineWidth=4;c.stroke();c.fillStyle='#8a5a8a';c.font=`800 15px ${FONT}`;c.textAlign='left';c.textBaseline='middle';c.fillText('おだい',34,248);c.fillStyle=th[1];circ(c,50,272,11);c.fillStyle='#5a3a5a';c.font=`800 17px ${FONT}`;c.fillText(th[0],66,273);if(ok){c.fillStyle='#6cd08a';c.font=`900 26px ${FONT}`;c.fillText('✔',136,258);}}
    this.tabs.forEach(([id],i)=>{const p=this.tabP(i),sel=this.cat===id;c.fillStyle=sel?'#ff8cc0':'#fff';circ(c,p.x,p.y,sel?44:38);c.strokeStyle='#ff8cc0';c.lineWidth=5;c.beginPath();c.arc(p.x,p.y,sel?44:38,0,TAU);c.stroke();
      if(id==='dress')drawItem(c,'dress',p.x,p.y,1.1);else if(id==='hat')drawItem(c,'crown',p.x,p.y,1);else if(id==='shoes')this.shoe(c,p.x,p.y,'#ff8cc0');else drawItem(c,'wand',p.x,p.y,1);});
    drawBtn(c,this.btnP(0).x,this.btnP(0).y,40,'#5aa8ff','camera',this.changes>=2&&this.photo<=0);drawBtn(c,this.btnP(1).x,this.btnP(1).y,36,'#6cd08a','bg');drawBtn(c,this.btnP(2).x,this.btnP(2).y,36,'#ffb03a','pose');drawBtn(c,this.btnP(3).x,this.btnP(3).y,36,'#b48cff','dice');
    tray(c,H-150,250);
    this.opts().forEach((o,i)=>{const p=this.optP(i),id=this.optId(o);const cur=this.cat==='dress'?SAVE.outfit.dress===id:this.cat==='hat'?SAVE.outfit.hat===id:this.cat==='shoes'?SAVE.outfit.shoes===id:SAVE.outfit.item===id;const lk=lockedN(this.cat,id);
      c.fillStyle=cur?'#fff0f7':'#fafafa';circ(c,p.x,p.y,46);c.strokeStyle=cur?'#ff5fa2':'#eee';c.lineWidth=5;c.beginPath();c.arc(p.x,p.y,46,0,TAU);c.stroke();
      if(this.cat==='dress'){if(o.style==='yukata'){c.save();c.translate(p.x,p.y);c.fillStyle=o.dress;c.strokeStyle=shade(o.pat[0],-.2);c.lineWidth=3;c.beginPath();c.moveTo(-28,-22);c.lineTo(28,-22);c.lineTo(28,-4);c.lineTo(14,-4);c.lineTo(16,26);c.lineTo(-16,26);c.lineTo(-14,-4);c.lineTo(-28,-4);c.closePath();c.fill();c.stroke();[[-18,-14],[16,-12],[-4,14],[6,4],[-8,-2]].forEach(([a,b],i)=>{c.fillStyle=o.pat[i%2];circ(c,a,b,3.2);});c.fillStyle=o.ribbon;c.fillRect(-15,0,30,8);c.fillStyle='#fff';c.beginPath();c.moveTo(-8,-22);c.lineTo(0,-10);c.lineTo(8,-22);c.closePath();c.fill();c.restore();}
        else{c.save();c.translate(p.x,p.y);c.fillStyle=gfill(c,0,0,28,o.dress);c.strokeStyle=shade(o.dress,-.3);c.lineWidth=3;c.beginPath();c.moveTo(-8,-26);c.lineTo(8,-26);c.lineTo(10,-8);c.lineTo(28,22);c.quadraticCurveTo(0,30,-28,22);c.lineTo(-10,-8);c.closePath();c.fill();c.stroke();c.fillStyle=o.skirt;c.fillRect(-24,14,48,6);bow(c,0,-10,4,o.ribbon);c.restore();}}
      else if(this.cat==='hat'){if(id==='none'){c.strokeStyle='#ccc';c.lineWidth=6;c.beginPath();c.moveTo(p.x-16,p.y-16);c.lineTo(p.x+16,p.y+16);c.moveTo(p.x+16,p.y-16);c.lineTo(p.x-16,p.y+16);c.stroke();}
        else{c.save();c.beginPath();c.arc(p.x,p.y,44,0,TAU);c.clip();drawFuka(c,p.x,p.y+120,{outfit:outfit({acc:id}),t:0,dir:0,sc:2.6,item:null});c.restore();}}
      else if(this.cat==='shoes')this.shoe(c,p.x,p.y,id);
      else{if(id==='none'){c.strokeStyle='#ccc';c.lineWidth=6;c.beginPath();c.moveTo(p.x-16,p.y-16);c.lineTo(p.x+16,p.y+16);c.moveTo(p.x+16,p.y-16);c.lineTo(p.x-16,p.y+16);c.stroke();}else{c.save();c.translate(p.x,p.y+14);c.scale(2.6,2.6);handItem(c,id,0,0,T);c.restore();}}
      if(lk){c.fillStyle='rgba(255,255,255,.75)';circ(c,p.x,p.y,46);c.fillStyle='#b8a0c8';rr(c,p.x-14,p.y-4,28,22,5);c.fill();c.strokeStyle='#b8a0c8';c.lineWidth=5;c.beginPath();c.arc(p.x,p.y-6,9,Math.PI,TAU);c.stroke();c.fillStyle='#8a6a9a';c.font=`800 16px ${FONT}`;c.textAlign='center';c.fillText(lk+'まい',p.x,p.y+34);}});
    if(this.flash>0){c.fillStyle=`rgba(255,255,255,${this.flash})`;c.fillRect(-400,-100,W+800,H+200);}
    if(this.photo>0&&this.photo<9){const k=elastic(Math.min(1,this.photo*2));c.save();c.translate(W/2,H*.42);c.rotate(-.06);c.scale(k,k);c.fillStyle='rgba(90,40,110,.2)';rr(c,-150,-190,310,390,10);c.fill();c.fillStyle='#fff';rr(c,-160,-200,320,390,10);c.fill();
      c.save();c.beginPath();c.rect(-140,-180,280,280);c.clip();drawBackdrop(c,this.bgI,-140,-180,280,280);drawFuka(c,-20,110,{outfit:outfit(),t:T,dir:0,sc:4.2,[pz]:1,happy:1});drawRikki(c,90,110,{sc:2.4,t:T,clap:1});c.restore();
      c.fillStyle='#ff5fa2';c.font=`30px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.fillText('かわいい！',0,150);c.restore();}},
  shoe(c,x,y,col){c.fillStyle=gfill(c,x,y,24,col==='#ffffff'?'#f4f4ff':col);c.strokeStyle=shade(col==='#ffffff'?'#d0d0e0':col,-.3);c.lineWidth=3;c.beginPath();c.moveTo(x-20,y+14);c.lineTo(x-18,y-16);c.lineTo(x-2,y-16);c.lineTo(x,y);c.quadraticCurveTo(x+22,y+2,x+22,y+14);c.closePath();c.fill();c.stroke();c.fillStyle='#fff';c.fillRect(x-20,y+10,42,4);},
  setOpt(o){const id=this.optId(o);const lk=lockedN(this.cat,id);if(lk){sfx('no');say(`シールを ${lk}まい あつめると つかえるよ！`);return false;}
    if(this.cat==='dress'){SAVE.outfit.dress=id;sayPair(o.ja,o.en);}else if(this.cat==='hat'){SAVE.outfit.hat=id;if(o[2])sayPair(o[1],o[2]);else say('なし');}else if(this.cat==='shoes'){SAVE.outfit.shoes=id;sayPair(o[1]+'の くつ',o[2]+' shoes');}else{SAVE.outfit.item=id;if(o[2])sayPair(o[1],o[2]);else say('なし');}return true;},
  down(x,y){const S=this.show;if(S){if(S.cue>=0&&!S.hitCue&&!S.done){S.hitCue=true;S.hits++;S.pose=1.1;S.pz=pick(POSES);S.flash=.8;S.cheer=1;sfx('shutter');rkCheer();for(let i=0;i<6;i++)S.hearts.push({x:rand(40,W-40),y:rand(H*.55,H*.9),t:rand(0,.3)});say(pick(['ポーズ！','きまった！','かわいい〜！','キラキラ！']));}return;}
    if(this.photo>0)return;
    for(let i=0;i<4;i++){const p=this.tabP(i);if(hitC(x,y,p.x,p.y,46)){this.cat=this.tabs[i][0];sfx('tap');say(['ふく','かざり','くつ','もちもの'][i]+'を えらんでね');return;}}
    const b=i=>this.btnP(i);
    if(hitC(x,y,b(0).x,b(0).y,46)){this.flash=1;this.photo=.01;sfx('shutter');setTimeout(()=>say('はい チーズ！ かわいい〜！'),200);return;}
    if(hitC(x,y,b(1).x,b(1).y,42)){this.bgI=(this.bgI+1)%BGS.length;sfx('whoosh');sayPair(BGS[this.bgI][0],BGS[this.bgI][1]);return;}
    if(hitC(x,y,b(2).x,b(2).y,42)){this.pose=(this.pose+1)%POSES.length;sfx('boing');burst(this.fx,this.fy-150,8,'star');say(pick(['ポーズ！','きめっ！','いえーい！']));return;}
    if(hitC(x,y,b(3).x,b(3).y,42)){const ok=l=>l.filter(o=>!lockedN(this.cat==='x'?'':'',''));const pk=(cat,list,f)=>{const av=list.filter(o=>!lockedN(cat,f(o)));return f(pick(av));};
      SAVE.outfit.dress=pk('dress',DRESSES,o=>o.id);SAVE.outfit.hat=pk('hat',HATS,o=>o[0]);SAVE.outfit.shoes=pk('shoes',SHOES,o=>o[0]);SAVE.outfit.item=pk('item',ITEMS_ACC,o=>o[0]);save();this.changes++;this.spin=.7;sfx('spark');burst(this.fx,this.fy-150,20);say('おまかせ コーデ！');return;}
    const os=this.opts();for(let i=0;i<os.length;i++){const p=this.optP(i);if(hitC(x,y,p.x,p.y,50)){if(this.setOpt(os[i])){save();this.changes++;this.spin=.35;sfx('spark');rkCheer();burst(this.fx,this.fy-150,14);if(this.changes===3)setTimeout(()=>say('カメラで しゃしんを とろう！'),2200);}return;}}
    if(hitC(x,y,this.fx,this.fy-150,110)){this.spin=.7;sfx('boing');say('くるりん！');burst(this.fx,this.fy-150,10,'star');}},
  hint(){if(this.show)return null;if(this.photo>0)return null;if(this.changes<2){const p=this.optP(2);return{x:p.x,y:p.y};}const p=this.btnP(0);return{x:p.x,y:p.y};},
  hintText(){return this.changes<2?'したの ふくを タッチしてね':'カメラを タッチしてね';}};

// ================= zoo =================
const ZFOOD={rabbit:'carrot',dog:'bone',cat:'fish',panda:'bamboo',pig:'apple',chick:'corn'};
const ZSND={rabbit:'ぴょんぴょん',dog:'わんわん',cat:'にゃーん',panda:'もぐもぐ',pig:'ぶーぶー',chick:'ぴよぴよ'};
SCN.zoo={bg:'#e8f8d8',song:'play',
  enter(){this.an=shuffle(Object.keys(ZFOOD)).slice(0,4).map(k=>({k,need:2,eat:0,shake:0,hop:0,love:0,happy:false}));this.foods=shuffle(Object.values(ZFOOD));this.dr=null;this.fin=0;this.round=1;this.bush=null;this.lucky=false;this.lay();say('どうぶつに ごはんを あげよう！ みんな 2かい たべるよ');},
  lay(){this.an&&this.an.forEach((a,i)=>{a.x=i%2?440:160;a.y=i<2?H*.4:H*.68;});},
  fP(i){return{x:58+i*97,y:H-78};},
  update(dt){for(const a of this.an){if(a.eat>0){a.eat-=dt;if(a.eat<=0){a.need--;sfx('ding');burst(a.x,a.y-120,10,'heart');rkCheer();if(a.need<=0){say(WORDS[a.k][0]+'さん おなかいっぱい！');}this.check();}}if(a.shake>0)a.shake-=dt;if(a.hop>0)a.hop-=dt*2;}
    if(this.bush)for(const b of this.bush){if(b.sh>0){b.sh-=dt;if(b.sh<=0&&!b.open)this.reveal(b);}if(b.open)b.t+=dt;if(b.what==='egg'&&b.open&&b.t>1.2&&!b.hatch){b.hatch=1;sfx('crack');confetti(40);say('わあ！ きんの たまごから ひよこが うまれたよ！ ラッキー！');this.lucky=true;}}
    if(this.fin>0){this.fin+=dt;if(this.fin>2&&this.fin<9){this.fin=9;celebrate('zoo',this.lucky);}}},
  reveal(b){b.open=true;b.t=0;if(AN[b.what]){sfx('boing');rkCheer();burst(b.x,b.y-80,14,'star');hush();speak('みーつけた！');speak(WORDS[b.what][0]);speak(WORDS[b.what][1],'en');if(this.bush.filter(q=>AN[q.what]).every(q=>q.open)&&this.fin<=0){this.fin=.01;setTimeout(()=>say('みんな みつけた！ かくれんぼ めいじん！'),1200);}}else if(b.what==='egg'){sfx('chin');say('あれ？ きんいろの たまご！');}else{sfx('whoosh');say(pick(['ここには いないね〜','ちょうちょ だった！']));}},
  drawBush(c,b){const sh=b.sh>0?Math.sin(b.sh*40)*6:0;c.save();c.translate(b.x+sh,b.y);c.fillStyle='rgba(40,90,40,.2)';ell(c,0,6,90,16);[[-50,-30,45],[50,-30,45],[0,-60,55],[-30,-10,45],[30,-10,45]].forEach(([a,q,r])=>{c.fillStyle=gfill(c,a-10,q-10,r,'#5cc46a');circ(c,a,q,r);});c.fillStyle='#ff6f91';for(const [a,q] of [[-40,-50],[20,-80],[45,-20],[-10,-20]])circ(c,a,q,6);c.restore();},
  draw(c){skyBg(c,'#8fd8ff','#dff6ff',H*.22);c.fillStyle=vfill(c,H*.2,H,'#a8e07a',.05,-.08);c.fillRect(-400,H*.2,W+800,H);cloud(c,120,90,.7,true);cloud(c,470,70,.55);tree(c,40,H*.22,.8);tree(c,570,H*.22,.9,'#6cd07a');
    for(const y of[H*.2,H*.52]){c.fillStyle='#e8c090';for(let x=-20;x<W+20;x+=36){rr(c,x,y-4,14,44,6);c.fill();}c.fillRect(-20,y+6,W+40,8);c.fillRect(-20,y+26,W+40,8);}
    flowers(c,0,W,H*.24,H*.3,3);
    if(this.round===3){for(const b of this.bush){if(b.open){const e=elastic(clamp(b.t*2,0,1));if(AN[b.what])drawAnimal(c,b.what,b.x,b.y-10-e*30,1.05*e,{t:T+b.x,happy:1,dance:1});else if(b.what==='egg'){if(!b.hatch){c.fillStyle=gfill(c,b.x-8,b.y-70,40,'#ffd23a');ell(c,b.x,b.y-60,28,36);c.fillStyle='#fff';ell(c,b.x-8,b.y-72,6,9);}else{drawAnimal(c,'chick',b.x,b.y-20,1,{t:T,happy:1,dance:1});c.fillStyle='#ffe8a0';c.beginPath();c.moveTo(b.x-30,b.y-10);c.lineTo(b.x-20,b.y-30);c.lineTo(b.x-10,b.y-14);c.lineTo(b.x,b.y-32);c.lineTo(b.x+10,b.y-14);c.lineTo(b.x+20,b.y-30);c.lineTo(b.x+30,b.y-10);c.closePath();c.fill();}}else{for(let i=0;i<2;i++){const bx=b.x+Math.sin(T*2+i*3)*40,by=b.y-100-b.t*40+Math.cos(T*3+i)*10;c.fillStyle=i?'#ffd23a':'#ff8cc0';ell(c,bx-8,by,9,6+Math.sin(T*20)*3);ell(c,bx+8,by,9,6+Math.sin(T*20)*3);}}}this.drawBush(c,b);if(b.open&&AN[b.what]){c.fillStyle='#ff5fa2';c.font=`800 20px ${FONT}`;c.textAlign='center';c.fillText('みつけた！',b.x,b.y+30);}}}
    if(this.round<3)for(const a of this.an){c.fillStyle='rgba(255,255,255,.35)';ell(c,a.x,a.y+4,110,24);
      drawAnimal(c,a.k,a.x,a.y,1.25,{t:T+a.x,happy:a.need<=0&&this.round===1||a.happy,eat:a.eat,shake:a.shake,hop:a.hop,dance:a.happy});
      if(a.eat>0)drawItem(c,ZFOOD[a.k],a.x,a.y-86,.9);
      if(this.round===1&&a.need>0&&a.eat<=0){const bx=a.x+70,by=a.y-190+Math.sin(T*2+a.x)*4;c.fillStyle='#fff';c.strokeStyle='#d8d0e8';c.lineWidth=3;c.beginPath();c.arc(bx,by,36,0,TAU);c.fill();c.stroke();circ(c,bx-30,by+40,8);circ(c,bx-44,by+56,5);drawItem(c,ZFOOD[a.k],bx,by,1.05);c.fillStyle='#ff5fa2';c.font=`800 18px ${FONT}`;c.textAlign='center';c.fillText('×'+a.need,bx+28,by+30);}
      if(this.round===2&&!a.happy){c.fillStyle='#fff';rr(c,a.x-50,a.y+16,100,14,7);c.fill();c.fillStyle='#ff8cc0';rr(c,a.x-50,a.y+16,100*a.love,14,7);c.fill();}
      if(a.happy||a.need<=0&&this.round===1){c.fillStyle='#ff5fa2';heartP(c,a.x+60,a.y-170+Math.sin(T*4)*5,12);c.fill();}}
    drawRikki(c,300,H*.83,{sc:2,t:T,dance:this.fin>0});this.rkPos={x:300,y:H*.83,sc:2};
    if(this.round===1){tray(c,H-78,120);this.foods.forEach((k,i)=>{const p=this.fP(i);drawItem(c,k,p.x,p.y,1.25);});}
    else{drawFuka(c,90,H-30,{outfit:outfit(),t:T,dir:0,sc:2.4,happy:1,wave:1,point:this.round===3});c.fillStyle='#8a6a9a';c.font=`800 24px ${FONT}`;c.textAlign='center';c.fillText(this.round===3?'くさむらを タッチ！ どこに いるかな？':'ゆびで なでなで してね',W/2+40,H-60);}
    if(this.dr){c.save();c.translate(this.dr.x,this.dr.y-10);c.rotate(this.dr.rot||0);drawItem(c,this.dr.k,0,0,1.6);c.restore();}
    stepDots(c,3,this.round-1);},
  down(x,y){if(this.round===3){for(const b of this.bush)if(!b.open&&b.sh<=0&&Math.abs(x-b.x)<90&&y>b.y-120&&y<b.y+20){b.sh=.5;sfx('squish');return;}return;}
    if(this.round===1)for(let i=0;i<this.foods.length;i++){const p=this.fP(i);if(hitC(x,y,p.x,p.y,48)&&this.fin<=0){this.dr={k:this.foods[i],x,y,lx:x,rot:0};sfx('tap');sayWord(this.foods[i]);return;}}
    for(const a of this.an)if(hitC(x,y,a.x,a.y-80,80)){if(this.round===2){this.pet={a,lx:x,ly:y};return;}a.hop=1;sfx('boing');hush();speak(ZSND[a.k]);speak(WORDS[a.k][0]);speak(WORDS[a.k][1],'en');card={k:a.k,ja:WORDS[a.k][0],en:WORDS[a.k][1],t:0};burst(a.x,a.y-150,6,'heart');return;}},
  move(x,y){if(this.dr){this.dr.rot=clamp((x-this.dr.lx)*.02,-.5,.5);this.dr.lx=x;this.dr.x=x;this.dr.y=y;}
    if(this.pet){const p=this.pet,a=p.a,d=Math.hypot(x-p.lx,y-p.ly);p.lx=x;p.ly=y;if(!a.happy&&hitC(x,y,a.x,a.y-80,100)){a.love=Math.min(1,a.love+d/500);if(Math.random()<.15){parts.push({x,y,vx:rand(-30,30),vy:-80,life:1,t:0,kind:'heart',col:'#ff8cc0',r:10});sfx('heart');}
      if(a.love>=1){a.happy=true;sfx('fanfare');rkCheer();hush();speak(ZSND[a.k]);speak('うれしい！');burst(a.x,a.y-120,20,'heart');this.check();}}}},
  up(x,y){this.pet=null;const d=this.dr;if(!d)return;this.dr=null;
    for(const a of this.an){if(!hitC(x,y,a.x,a.y-90,95))continue;if(a.need<=0||a.eat>0){say('もう おなかいっぱい！');return;}
      if(ZFOOD[a.k]===d.k){a.eat=1.4;sfx('munch');say(pick(['もぐもぐ おいしい！','おいしい〜！','ぱくぱく！']));}else{a.shake=.6;sfx('no');say('ちがうよ〜。 ほかの ごはんが いいな');}return;}},
  check(){if(this.round===1&&this.an.every(a=>a.need<=0)){this.round=2;sfx('fanfare');setTimeout(()=>say('みんな おなかいっぱい！ つぎは なでなで してあげよう'),600);}
    else if(this.round===2&&this.an.every(a=>a.happy)){this.round=3;this.lucky=false;sfx('fanfare');const what=shuffle([...this.an.map(a=>a.k),Math.random()<.5?'egg':'none','none']);this.bush=what.map((w,i)=>({x:110+(i%3)*190,y:i<3?H*.42:H*.7,what:w,open:false,sh:0,t:0}));setTimeout(()=>say('つぎは かくれんぼ！ どうぶつたちが くさむらに かくれたよ。 さがしてね！'),600);}},
  hint(){if(this.fin>0)return null;if(this.round===1){const a=this.an.find(a=>a.need>0&&a.eat<=0);if(!a)return null;const i=this.foods.indexOf(ZFOOD[a.k]);const p=this.fP(i);return{x:p.x,y:p.y,x2:a.x,y2:a.y-90};}
    if(this.round===3)return null;const a=this.an.find(a=>!a.happy);return a?{x:a.x-50,y:a.y-80,x2:a.x+50,y2:a.y-80}:null;},
  hintText(){return this.round===1?'ごはんを どうぶつまで ひっぱってね':this.round===3?'くさむらを タッチして さがしてね':'どうぶつを ゆびで なでなで してね';}};

// ================= letters school =================
const HIRA=[['あ','あひる','duck'],['い','いちご','strawberry'],['う','うさぎ','rabbit'],['お','おさかな','fish'],['く','くま','bear'],['ね','ねこ','cat'],['り','りんご','apple'],['に','にんじん','carrot'],['た','たまご','egg'],['ほ','ほね','bone'],['ぱ','ぱんだ','panda'],['け','けーき','cake'],['ぶ','ぶどう','grapes'],['ひ','ひよこ','chick']];
const ABC=[['A','apple','apple'],['B','banana','banana'],['C','cat','cat'],['D','dog','dog'],['E','egg','egg'],['F','fish','fish'],['G','grapes','grapes'],['M','milk','milk'],['P','panda','panda'],['R','rabbit','rabbit'],['S','star','starcandy'],['T','tomato','tomato']];
const NUMW=[['1','いち','one'],['2','に','two'],['3','さん','three'],['4','よん','four'],['5','ご','five'],['6','ろく','six'],['7','なな','seven'],['8','はち','eight'],['9','きゅう','nine']];
SCN.school={bg:'#fff6dc',song:'play',mode:'hira',
  enter(){this.round=0;this.prev=null;this.learned=[];this.bg=null;this.lay();this.next();},
  lay(){this.box={x:100,y:H*.5-200,s:400};if(this.cur)this.build();},
  set(){return this.mode==='hira'?HIRA:this.mode==='abc'?ABC:NUMW;},
  next(){let cur;do cur=pick(this.set());while(cur===this.prev||this.learned.includes(cur));this.prev=this.cur=cur;this.learned.push(cur);this.ok=0;this.phase='trace';this.quiz=null;this.build();this.countItem=pick(['apple','strawberry','starcandy','duck','carrot']);
    if(this.mode==='hira')say(`「${cur[0]}」を ゆびで なぞってね`);else if(this.mode==='abc'){hush();speak('なぞってね');speak(cur[0],'en');bub={text:`「${cur[0]}」を なぞってね`,t:0,life:3};}else say(`すうじの 「${cur[1]}」を なぞってね`);},
  build(){const b=this.box,S=b.s;const oc=document.createElement('canvas');oc.width=oc.height=S;const g=oc.getContext('2d');g.fillStyle='#000';g.font=`800 ${S*.82}px ${FONT}`;g.textAlign='center';g.textBaseline='middle';g.fillText(this.cur[0],S/2,S*.54);
    const d=g.getImageData(0,0,S,S).data;const st=12;this.pts=[];this.grid=new Set();for(let y=0;y<S;y+=st)for(let x=0;x<S;x+=st)if(d[(y*S+x)*4+3]>120){this.pts.push({x:b.x+x,y:b.y+y,hit:false});this.grid.add((x/st|0)+','+(y/st|0));}
    this.strokes=[];this.inN=0;this.allN=0;this.cov=0;},
  nearLetter(x,y){const b=this.box,st=12;const gx=Math.floor((x-b.x)/st),gy=Math.floor((y-b.y)/st);for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++)if(this.grid.has((gx+dx)+','+(gy+dy)))return true;return false;},
  makeQuiz(){const cur=this.cur;let opts;
    if(this.mode==='num'){const n=+cur[0];const s=new Set([n]);while(s.size<3){const m=clamp(n+pick([-2,-1,1,2,3]),1,9);s.add(m);}opts=shuffle([...s]).map(m=>({n:m,ok:m===n}));say(`${cur[1]}こ あるのは どれかな？`);}
    else{const set=this.set().filter(q=>q[0]!==cur[0]);const others=shuffle(set).slice(0,2);opts=shuffle([cur,...others]).map(q=>({k:q[2],w:q[1],ok:q===cur}));
      if(this.mode==='hira')say(`「${cur[0]}」から はじまるのは どれかな？`);else{hush();speak('どれかな？');speak(`${cur[0]} is for...`,'en');bub={text:`「${cur[0]}」は どれかな？`,t:0,life:3};}}
    this.quiz={opts,shake:-1,st:0,ok:false};this.phase='quiz';},
  qP(i){return{x:110+i*190,y:H*.52};},
  update(dt){if(this.ok>0&&this.phase==='trace'){this.ok+=dt;if(this.ok>3&&this.ok<9){this.ok=9;this.makeQuiz();}}
    if(this.quiz){this.quiz.st+=dt;if(this.quiz.okT>0){this.quiz.okT+=dt;if(this.quiz.okT>2.2){this.quiz=null;this.round++;if(this.round>=3)this.startBalloon();else this.next();}}}
    const B=this.bg;if(B&&!B.done){B.sp-=dt;if(B.sp<=0){B.sp=.6;const tg=B.tg[B.i];const need=!B.bl.some(b=>b.ch===tg[0]&&b.y>H*.3);const q=need||Math.random()<.35?tg:pick(this.set());B.bl.push({x:rand(70,W-70),y:H+60,vy:rand(100,150),ch:q[0],q,col:pick(['#ff6f91','#ffd23a','#5aa8ff','#6cd08a','#b48cff','#ff9a5c']),t:rand(0,6),sh:0});}
      for(let i=B.bl.length-1;i>=0;i--){const b=B.bl[i];b.y-=b.vy*dt;b.t+=dt;if(b.sh>0)b.sh-=dt;if(b.y<-90)B.bl.splice(i,1);}}
    if(B&&B.done){B.dt+=dt;if(B.dt>2.4&&!B.cel){B.cel=1;celebrate('school',B.miss===0);}}},
  startBalloon(){this.phase='balloon';this.bg={tg:shuffle(this.learned),i:0,bl:[],sp:0,miss:0,done:false,dt:0};for(let k=0;k<5;k++){const q=k<2?this.learned[k]:pick(this.set());this.bg.bl.push({x:70+k*115,y:H*.45+k%2*H*.2,vy:rand(100,150),ch:q[0],q,col:pick(['#ff6f91','#ffd23a','#5aa8ff','#6cd08a','#b48cff','#ff9a5c']),t:rand(0,6),sh:0});}sfx('fanfare');setTimeout(()=>this.askB(),300);},
  askB(){const B=this.bg,t=B.tg[B.i];if(!t||B.done)return;if(this.mode==='abc'){hush();speak('ふうせんを わってね');speak(t[0],'en');bub={text:`「${t[0]}」の ふうせんを わってね`,t:0,life:3};}else say(`「${this.mode==='num'?t[1]:t[0]}」の ふうせんを わってね！`);},
  sayCh(q){hush();if(this.mode==='abc')speak(q[0],'en');else if(this.mode==='num')speak(q[1]);else speak(q[0]);},
  draw(c){const b=this.box;c.fillStyle='#fff0c8';c.fillRect(-400,0,W+800,H);c.fillStyle='#ffe4a0';for(let y=0;y<H;y+=44)c.fillRect(-400,y,W+800,3);
    if(this.phase==='balloon'){const B=this.bg;skyBg(c,'#8fd8ff','#e6f8ff',H);cloud(c,120,300,.8,true);cloud(c,470,460,.6);
      for(const bl of B.bl){const x=bl.x+Math.sin(bl.t*1.5)*14+(bl.sh>0?Math.sin(bl.sh*50)*8:0);c.strokeStyle='#8a7a9a';c.lineWidth=2;c.beginPath();c.moveTo(x,bl.y+56);c.quadraticCurveTo(x+10,bl.y+90,x,bl.y+130);c.stroke();c.fillStyle=gfill(c,x,bl.y,56,bl.col);c.beginPath();c.ellipse(x,bl.y,48,58,0,0,TAU);c.fill();c.fillStyle='rgba(255,255,255,.45)';ell(c,x-16,bl.y-22,10,16);c.fillStyle='#fff';c.font=`800 52px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(bl.ch,x,bl.y+4);}
      const t=B.tg[Math.min(B.i,B.tg.length-1)];c.fillStyle='rgba(255,255,255,.95)';rr(c,W/2-200,232,400,86,30);c.fill();c.strokeStyle='#ff8cc0';c.lineWidth=5;c.stroke();c.fillStyle='#ff5fa2';c.font=`800 24px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(B.done?'ぜんぶ できた！':'この もじを わってね →',B.done?W/2:W/2-40,275);if(!B.done){c.font=`800 54px ${FONT}`;c.fillText(t[0],W/2+140,277);}
      for(let i=0;i<B.tg.length;i++){c.fillStyle=i<B.i?'#ffd23a':'#fff';star(c,W/2-50+i*50,350,20,9);c.fill();c.strokeStyle='#e8a800';c.lineWidth=2;c.stroke();}
      drawFuka(c,470,H-40,{outfit:outfit(),t:T,dir:0,sc:2.2,cheer:B.done,point:!B.done});drawRikki(c,560,H-40,{sc:1.7,t:T,clap:RK.clap});this.rkPos={x:560,y:H-40,sc:1.7};return;}
    for(const [m,lb,x,col] of [['hira','あいう',180,'#ff8cc0'],['abc','ABC',330,'#5aa8ff'],['num','123',480,'#6cd08a']]){const sel=this.mode===m;c.fillStyle=sel?col:'#fff';rr(c,x-66,150,132,58,29);c.fill();c.strokeStyle=col;c.lineWidth=5;c.stroke();c.fillStyle=sel?'#fff':col;c.font=`800 28px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(lb,x,180);}
    const accent=this.mode==='hira'?'#ff5fa2':this.mode==='abc'?'#3a88e8':'#3aa860';
    if(this.phase==='trace'){c.fillStyle='rgba(90,40,110,.15)';rr(c,b.x-14,b.y-6,b.s+28,b.s+28,30);c.fill();c.fillStyle='#fff';rr(c,b.x-14,b.y-14,b.s+28,b.s+28,30);c.fill();c.strokeStyle=shade(accent,.5);c.lineWidth=6;c.stroke();
      c.strokeStyle='#f0e0e8';c.lineWidth=2;c.setLineDash([10,10]);c.beginPath();c.moveTo(b.x+b.s/2,b.y);c.lineTo(b.x+b.s/2,b.y+b.s);c.moveTo(b.x,b.y+b.s/2);c.lineTo(b.x+b.s,b.y+b.s/2);c.stroke();c.setLineDash([]);
      c.font=`800 ${b.s*.82}px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillStyle=this.ok>0?accent:'#f2e6ee';c.fillText(this.cur[0],b.x+b.s/2,b.y+b.s*.54);
      if(!this.ok){c.fillStyle='#ffd23a';for(const p of this.pts)if(!p.hit&&((p.x+p.y)/12)%5===0)circ(c,p.x+6,p.y+6,2.6);}
      const rain=['#ff5fa2','#ffb03a','#ffd23a','#6cd08a','#5aa8ff','#b86af0'];c.lineCap='round';c.lineJoin='round';
      if(!this.ok)this.strokes.forEach((s,si)=>{c.strokeStyle=rain[si%6];c.lineWidth=30;c.globalAlpha=.85;c.beginPath();s.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));if(s.length===1)c.lineTo(s[0].x+.1,s[0].y);c.stroke();});c.globalAlpha=1;
      if(!this.ok){c.fillStyle='#fff';rr(c,b.x,b.y+b.s+18,b.s,16,8);c.fill();c.fillStyle=accent;rr(c,b.x,b.y+b.s+18,b.s*Math.min(1,this.cov/.78),16,8);c.fill();}
      const py=b.y+b.s+120;if(this.mode==='num'){const n=+this.cur[0];for(let i=0;i<n;i++)drawItem(c,this.countItem,90+(i%5)*56,py-26+Math.floor(i/5)*56,.75);}else{drawThing(c,this.cur[2],130,py,1.5);c.fillStyle=accent;c.font=`800 38px ${FONT}`;c.textAlign='left';c.textBaseline='middle';const w=this.cur[1];c.fillText(w,200,py);const fw=c.measureText(w[0]).width;c.strokeStyle='#ffd23a';c.lineWidth=5;c.beginPath();c.moveTo(200,py+26);c.lineTo(200+fw,py+26);c.stroke();}}
    else if(this.quiz){c.font=`800 120px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillStyle=accent;c.fillText(this.cur[0],W/2,H*.3);
      this.quiz.opts.forEach((o,i)=>{const p=this.qP(i);const sh=this.quiz.shake===i?Math.sin(this.quiz.st*40)*6*Math.max(0,1-this.quiz.st*2):0;const good=this.quiz.okT>0&&o.ok;const sc=good?1+Math.sin(T*8)*.05:1;c.save();c.translate(p.x+sh,p.y);c.scale(sc,sc);
        c.fillStyle='rgba(90,40,110,.15)';rr(c,-82,-92,170,196,24);c.fill();c.fillStyle=good?'#fff6c8':'#fff';rr(c,-85,-98,170,196,24);c.fill();c.strokeStyle=good?'#ffd23a':shade(accent,.5);c.lineWidth=6;c.stroke();
        if(this.mode==='num'){for(let k=0;k<o.n;k++)drawItem(c,'apple',-50+(k%3)*50,-60+Math.floor(k/3)*48,.6);}
        else{drawThing(c,o.k,0,-20,1.5);if(this.quiz.okT>0||this.mode==='abc'){c.fillStyle=accent;c.font=`800 24px ${FONT}`;c.fillText(o.w,0,70);}}c.restore();});}
    drawFuka(c,470,H-40,{outfit:outfit(),t:T,dir:0,sc:2.2,cheer:this.ok>0||this.quiz&&this.quiz.okT>0,point:!this.ok});drawRikki(c,560,H-40,{sc:1.7,t:T,clap:this.ok>0?1:RK.clap});this.rkPos={x:560,y:H-40,sc:1.7};
    for(let i=0;i<3;i++){c.fillStyle=i<this.round?'#ffd23a':'#f0e0c8';star(c,90+i*56,H-60,22,10);c.fill();c.strokeStyle=i<this.round?'#e8a800':'#e0d0b0';c.lineWidth=2;c.stroke();}},
  down(x,y){if(this.phase==='balloon'){const B=this.bg;if(B.done)return;for(let i=B.bl.length-1;i>=0;i--){const bl=B.bl[i];const bx=bl.x+Math.sin(bl.t*1.5)*14;if(Math.abs(x-bx)<56&&Math.abs(y-bl.y)<66){const tg=B.tg[B.i];if(bl.ch===tg[0]){B.bl.splice(i,1);sfx('pop');burst(bx,bl.y,24,'star');rkCheer();this.sayCh(bl.q);B.i++;if(B.i>=B.tg.length){B.done=true;B.dt=0;sfx('fanfare');confetti(70);setTimeout(()=>say(B.miss===0?'ぜんぶ いっぱつで せいかい！ すごい！':'ぜんぶ われたね！ すごい！'),900);}else setTimeout(()=>{if(scene===this&&this.phase==='balloon')this.askB();},1300);}else{bl.sh=.4;sfx('boing');B.miss++;this.sayCh(bl.q);}return;}}return;}
    for(const [m,xx] of [['hira',180],['abc',330],['num',480]])if(hitC(x,y,xx,180,64)&&this.mode!==m){this.mode=m;sfx('tap');this.round=0;this.learned=[];this.bg=null;this.next();return;}
    if(this.phase==='quiz'&&this.quiz&&!this.quiz.okT){this.quiz.opts.forEach((o,i)=>{const p=this.qP(i);if(Math.abs(x-p.x)<85&&Math.abs(y-p.y)<98){if(o.ok){this.quiz.okT=.01;sfx('fanfare');rkCheer();burst(p.x,p.y,24,'star');this.sayWord();}else{this.quiz.shake=i;this.quiz.st=0;sfx('no');say('ちがうよ。 もういちど！');}}});return;}
    const b=this.box;if(this.phase!=='trace'||this.ok||x<b.x-20||x>b.x+b.s+20||y<b.y-20||y>b.y+b.s+20)return;this.drawing=true;this.strokes.push([]);this.add(x,y);},
  move(x,y){if(this.drawing&&!this.ok)this.add(x,y);},
  up(){if(!this.drawing)return;this.drawing=false;if(this.ok)return;if(this.cov>=.78){if(this.inN/Math.max(1,this.allN)>=.5)this.success();else{sfx('no');say('もういちど ゆっくり なぞってね');this.build();}}},
  add(x,y){const s=this.strokes[this.strokes.length-1];const l=s[s.length-1];if(l&&Math.hypot(l.x-x,l.y-y)<5)return;s.push({x,y});this.allN++;if(this.nearLetter(x,y))this.inN++;if(this.allN%5===0)sfx('tap');
    let n=0;for(const p of this.pts){if(!p.hit&&Math.abs(p.x-x)<26&&Math.abs(p.y-y)<26)p.hit=true;if(p.hit)n++;}this.cov=n/Math.max(1,this.pts.length);},
  success(){this.ok=.01;sfx('fanfare');rkCheer();const b=this.box;for(let i=0;i<5;i++)burst(b.x+rand(40,b.s-40),b.y+rand(40,b.s-40),6,'star');this.sayWord();},
  sayWord(){const [ch,w,k]=this.cur;hush();if(this.mode==='hira'){speak(`${ch}！ ${w}の ${ch}！`);speak(WORDS[k]?WORDS[k][1]:'','en');card={k,ja:w,en:WORDS[k]?WORDS[k][1]:'',t:0};}
    else if(this.mode==='abc'){speak(`${ch}! ${ch} is for ${w}!`,'en');speak(WORDS[k]?WORDS[k][0]:'');card={k,ja:WORDS[k]?WORDS[k][0]:'',en:w,t:0};}
    else{speak(`${w}！`);speak(k,'en');card={k:this.countItem,ja:`${ch}  ${w}`,en:k,t:0};}},
  hint(){if(this.phase==='balloon'){const B=this.bg;if(B.done)return null;const bl=B.bl.find(b=>b.ch===B.tg[B.i][0]&&b.y<H-80&&b.y>200);return bl?{x:bl.x,y:bl.y}:null;}if(this.phase==='quiz'){const i=this.quiz.opts.findIndex(o=>o.ok);const p=this.qP(i);return this.quiz.st>6?{x:p.x,y:p.y}:null;}if(this.ok)return null;const p=this.pts.find(p=>!p.hit);return p?{x:p.x+6,y:p.y+6}:null;},
  hintText(){return this.phase==='balloon'?'おなじ もじの ふうせんを タッチ！':this.phase==='quiz'?'ただしい えを タッチしてね':'ゆびで もじを なぞってね';}};

// ================= festival (goldfish + fireworks) =================
SCN.festival={bg:'#2a1a4a',song:'matsuri',
  enter(){this.phase='fish';this.caught=0;this.fin=0;this.fw=0;this.rockets=[];this.lay();const cols=['#ff5a3a','#ff7a2a','#ff5a3a','#2a2a3a','#ff8a5a','#ffffff','#ff5a3a'];
    this.fish=cols.map(col=>({x:this.px+rand(-160,160),y:this.py+rand(-100,100),a:rand(0,TAU),v:rand(40,70),col,flee:0,got:false}));this.lucky=false;this.wn=null;
    if(Math.random()<.45||lvOf('festival')>=2)this.fish.push({x:this.px,y:this.py,a:rand(0,TAU),v:95,col:'#ffd23a',gold:true,flee:0,got:false});this.poi={x:0,y:0,held:false,wet:0,torn:0};this.bowl=[];
    say('きんぎょすくい！ ポイを みずに いれて、きんぎょの ちかくで ゆびを はなすと すくえるよ');},
  lay(){this.px=300;this.py=H*.5;this.rx=240;this.ry=170;},
  inPool(x,y,m=0){return((x-this.px)/(this.rx-m))**2+((y-this.py)/(this.ry-m))**2<=1;},
  update(dt){const po=this.poi;if(this.phase==='wanage')this.updWanage(dt);
    for(const f of this.fish){if(f.got)continue;if(f.flee>0)f.flee-=dt;
      if(po.held&&this.inPool(po.x,po.y)&&Math.hypot(po.x-f.x,po.y-f.y)<90&&po.speed>500){f.a=Math.atan2(f.y-po.y,f.x-po.x);f.flee=.5;}
      f.a+=Math.sin(T*.7+f.v)*dt*.8;const sp=f.flee>0?f.v*3:f.v;f.x+=Math.cos(f.a)*sp*dt;f.y+=Math.sin(f.a)*sp*dt*.8;
      if(!this.inPool(f.x,f.y,40)){f.a=Math.atan2(this.py-f.y,this.px-f.x)+rand(-.5,.5);}}
    if(po.held&&this.inPool(po.x,po.y)&&!po.torn){po.wet+=dt;if(Math.random()<dt*3)ring(po.x,po.y,'rgba(255,255,255,.7)');if(po.wet>6){po.torn=1;sfx('rip');say('やぶれちゃった！ あたらしい ポイだよ');setTimeout(()=>{if(scene===this){po.torn=0;po.wet=0;}},1200);}}
    for(const b of this.bowl)b.t+=dt;
    for(let i=this.rockets.length-1;i>=0;i--){const r=this.rockets[i];r.y-=520*dt;if(Math.random()<.8)parts.push({x:r.x+rand(-2,2),y:r.y+10,vx:0,vy:40,life:.4,t:0,kind:'dot',col:'#ffe0a0',r:5});
      if(r.y<=r.ty){this.rockets.splice(i,1);this.explode(r.x,r.ty);}}
    if(this.phase==='hanabi'&&this.fw>=8&&!this.fin){this.fin=.01;for(let i=0;i<6;i++)setTimeout(()=>{if(scene===this)this.launch(rand(100,500),rand(160,H*.4));},i*300);}
    if(this.fin>0){this.fin+=dt;if(this.fin>3.5&&this.fin<9){this.fin=9;celebrate('festival',this.lucky);}}},
  startWanage(){this.phase='wanage';sfx('fanfare');const ks=shuffle(['duck','crown','balloon','starcandy','heartcookie','kakigori']).slice(0,5);const pos=[[150,.44],[300,.44],[450,.44],[225,.6],[375,.6]];this.wn={rings:3,pz:ks.map((k,i)=>({k,x:pos[i][0],y:H*pos[i][1],got:false,hop:0})),fly:null,won:0,miss:[]};say('つぎは わなげ！ ほしい けいひんを タッチして わっかを なげよう！');},
  throwRing(p){const W2=this.wn;if(W2.fly||W2.rings<=0||p.got)return;W2.rings--;const ok=Math.random()<.7||(W2.rings===0&&W2.won===0);W2.fly={p,t:0,ok,ox:ok?0:rand(-60,60)*(Math.random()<.5?1:-1)||50};sfx('whoosh');},
  updWanage(dt){const W2=this.wn;for(const p of W2.pz)if(p.hop>0)p.hop-=dt*2;const f=W2.fly;if(!f)return;f.t+=dt/.75;if(f.t>=1){W2.fly=null;const p=f.p;if(f.ok){p.got=true;p.hop=1;W2.won++;sfx('ding');rkCheer();burst(p.x,p.y-40,16,'star');sayWord(p.k,'ゲット！');}else{W2.miss.push({x:p.x+f.ox,y:p.y+30});sfx('boing');say(pick(['おしい！','ざんねん！ もういっかい！']));}
    if(W2.rings<=0)setTimeout(()=>{if(scene===this&&this.phase==='wanage'){this.phase='hanabi';sfx('fanfare');say('よるに なったよ。 そらを タッチして はなびを あげよう！ ハートの はなびも あるかも？');}},1800);}},
  drawWanage(c){const W2=this.wn;c.fillStyle='#ffe8c8';rr(c,40,H*.33,520,H*.36,20);c.fill();c.fillStyle='#ff4a5a';for(let i=0;i<7;i++){c.fillStyle=i%2?'#fff':'#ff4a5a';c.fillRect(40+i*74.3,H*.3,74.3,34);}c.fillStyle='#fff';rr(c,210,H*.3+38,180,44,20);c.fill();c.fillStyle='#ff4a5a';c.font=`800 26px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('わなげ',300,H*.3+61);
    for(const p of W2.pz){c.fillStyle='#b8703a';rr(c,p.x-7,p.y-10,14,70,5);c.fill();c.fillStyle='#8a5a3a';ell(c,p.x,p.y+60,40,10);const jy=p.hop>0?Math.sin(p.hop*Math.PI)*40:0;drawItem(c,p.k,p.x,p.y-40-jy,1.1);if(p.got){c.strokeStyle='#ffd23a';c.lineWidth=9;c.beginPath();c.ellipse(p.x,p.y+50,40,11,0,0,TAU);c.stroke();}}
    for(const m of W2.miss){c.strokeStyle='#ff8cc0';c.lineWidth=9;c.beginPath();c.ellipse(m.x,m.y+44,40,11,0,0,TAU);c.stroke();}
    const f=W2.fly;if(f){const t=f.t,tx=f.p.x+f.ox,ty=f.p.y+(f.ok?50:74);const x=lerp(300,tx,t),y=lerp(H-150,ty,t)-Math.sin(t*Math.PI)*200;c.save();c.translate(x,y);c.scale(1,.3+.7*Math.abs(Math.cos(t*9)));c.strokeStyle=f.ok?'#ffd23a':'#ff8cc0';c.lineWidth=9;c.beginPath();c.arc(0,0,38,0,TAU);c.stroke();c.restore();}
    for(let i=0;i<3;i++){c.strokeStyle=i<W2.rings?'#ffd23a':'rgba(255,255,255,.25)';c.lineWidth=8;c.beginPath();c.ellipse(420+i*60,H-60,24,9,0,0,TAU);c.stroke();}
    drawFuka(c,160,H-24,{outfit:outfit(),t:T,dir:0,sc:2.3,cheer:W2.won>0&&!W2.fly,point:!!W2.fly});drawRikki(c,270,H-24,{sc:1.8,t:T,clap:RK.clap});this.rkPos={x:270,y:H-24,sc:1.8};},
  launch(x,ty){this.rockets.push({x,y:H*.75,ty});sfx('launch');},
  explode(x,y){sfx('boom');const col=pick(['#ff5f9a','#ffd23a','#5ad0ff','#8ef0b0','#b88aff','#ff8a3a']),col2=pick(['#fff','#ffe0f0','#fff6c0']);const n=46;const shp=this.fw>=2?pick(['ball','ball','heart','star','smile']):'ball';
    if(shp==='heart'){for(let i=0;i<40;i++){const a=i/40*TAU,hx=16*Math.pow(Math.sin(a),3),hy=-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a));parts.push({x,y,vx:hx*12,vy:hy*12,life:1.5,t:0,kind:'fw',col:'#ff5f9a',r:5});}say('ハートの はなび！');}
    else if(shp==='star'){const V=j=>{const a=j/10*TAU-Math.PI/2,r=j%2?.42:1;return[Math.cos(a)*r,Math.sin(a)*r];};for(let i=0;i<50;i++){const e=Math.floor(i/5),k=(i%5)/5,A=V(e),B=V(e+1);parts.push({x,y,vx:lerp(A[0],B[0],k)*230,vy:lerp(A[1],B[1],k)*230,life:1.5,t:0,kind:'fw',col:'#ffd23a',r:5});}say('おほしさまの はなび！');}
    else if(shp==='smile'){for(let i=0;i<36;i++){const a=i/36*TAU;parts.push({x,y,vx:Math.cos(a)*220,vy:Math.sin(a)*220,life:1.5,t:0,kind:'fw',col:'#ffd23a',r:4});}for(const e of [-1,1])for(let i=0;i<6;i++)parts.push({x,y,vx:e*80+rand(-8,8),vy:-70+rand(-8,8),life:1.5,t:0,kind:'fw',col:'#fff',r:5});for(let i=0;i<14;i++){const a=.3+i/13*(Math.PI-.6);parts.push({x,y,vx:Math.cos(a)*130,vy:Math.sin(a)*130,life:1.5,t:0,kind:'fw',col:'#ff5f9a',r:4});}say('にこにこ はなび！');}
    else for(let i=0;i<n;i++){const a=i/n*TAU,s=rand(160,240);parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1.4,t:0,kind:'fw',col:i%3?col:col2,r:4});}
    if(Math.random()<.5)for(let i=0;i<14;i++){const a=i/14*TAU;parts.push({x,y,vx:Math.cos(a)*90,vy:Math.sin(a)*90,life:1.2,t:0,kind:'fw',col:'#fff',r:3});}this.fw++;rkCheer();if(this.fw===3)say('きれい〜！ たまや〜！');},
  draw(c){const night=this.phase==='hanabi';const g=c.createLinearGradient(0,0,0,H*.5);g.addColorStop(0,night?'#0e0a2a':'#4a2a7a');g.addColorStop(1,night?'#2a1a5a':'#ff9a6a');c.fillStyle=g;c.fillRect(-400,0,W+800,H*.5);
    if(night){c.fillStyle='#fff';for(let i=0;i<30;i++)circ(c,(i*97)%W,(i*53)%(H*.4),1.2+((i+Math.floor(T*2))%3===0?1:0));}
    c.fillStyle='#3a2a2a';c.fillRect(-400,H*.28,W+800,6);c.strokeStyle='#3a2a2a';c.lineWidth=2;c.beginPath();c.moveTo(-10,H*.1);c.quadraticCurveTo(W/2,H*.2,W+10,H*.1);c.stroke();
    for(let i=0;i<7;i++){const lx=20+i*93,ly=H*.1+Math.sin(i/6*Math.PI)*H*.07+10;c.fillStyle='rgba(255,210,120,.3)';circ(c,lx,ly+18,26);c.fillStyle=gfill(c,lx,ly+16,18,i%2?'#ff4a3a':'#fff6e0');ell(c,lx,ly+18,15,19);c.fillStyle='#2a1a1a';c.fillRect(lx-9,ly-2,18,4);c.fillRect(lx-9,ly+36,18,4);c.strokeStyle='rgba(0,0,0,.2)';c.lineWidth=1;for(let k=-2;k<=2;k++){c.beginPath();c.moveTo(lx-14,ly+18+k*6);c.lineTo(lx+14,ly+18+k*6);c.stroke();}}
    c.fillStyle=vfill(c,H*.3,H,'#5a3a2a',.1,-.2);c.fillRect(-400,H*.3,W+800,H);
    if(this.phase==='wanage'){this.drawWanage(c);stepDots(c,3,1);return;}
    if(!night){for(let i=0;i<8;i++){c.fillStyle=i%2?'#fff':'#ff4a5a';c.fillRect(i*75,H*.3,75,40);}c.fillStyle='#fff';rr(c,180,H*.3+44,240,50,20);c.fill();c.fillStyle='#ff4a5a';c.font=`800 28px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('きんぎょすくい',300,H*.3+69);}
    if(!night){c.fillStyle='#3a88d8';ell(c,this.px,this.py+14,this.rx+18,this.ry+22);const wg=c.createRadialGradient(this.px-60,this.py-60,20,this.px,this.py,this.rx);wg.addColorStop(0,'#bfeaff');wg.addColorStop(1,'#5ab8f0');c.fillStyle=wg;ell(c,this.px,this.py,this.rx,this.ry);
      c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=3;for(let i=0;i<5;i++){c.beginPath();c.ellipse(this.px+Math.sin(T+i)*40,this.py+Math.cos(T*.8+i)*30,60+i*20,14+i*4,0,0,Math.PI);c.stroke();}
      for(const f of this.fish){if(f.got)continue;c.save();c.translate(f.x,f.y);c.rotate(f.a+Math.PI);if(f.gold){c.fillStyle='rgba(255,240,150,.5)';circ(c,0,0,30);}this.drawFish(c,f.col);c.restore();if(f.gold&&Math.random()<.1)parts.push({x:f.x+rand(-15,15),y:f.y+rand(-10,10),vx:0,vy:-30,life:.6,t:0,kind:'star',col:'#fff6a0',r:5});}
      const po=this.poi;if(po.held){c.save();c.translate(po.x,po.y);if(po.torn){c.strokeStyle='#ff8cc0';c.lineWidth=5;c.beginPath();c.arc(0,0,22,0,TAU);c.stroke();c.fillStyle='rgba(255,255,255,.6)';c.beginPath();c.moveTo(-18,-8);c.lineTo(-4,4);c.lineTo(-16,12);c.fill();}else{c.globalAlpha=1-Math.min(.5,po.wet/12);drawItem(c,'poi',0,0,1.3);c.globalAlpha=1;}c.restore();}
      else{drawItem(c,'poi',90,H-110,1.4);c.fillStyle='#fff';c.font=`800 18px ${FONT}`;c.textAlign='center';c.fillText('ポイ',90,H-40);}
      c.fillStyle='rgba(200,235,255,.5)';c.strokeStyle='#fff';c.lineWidth=4;c.beginPath();c.arc(490,H-110,62,0,TAU);c.fill();c.stroke();for(const b of this.bowl){c.save();c.translate(490+Math.cos(b.t*.8+b.o)*28,H-100+Math.sin(b.t*1.1+b.o)*20);c.rotate(b.t+b.o);c.scale(.6,.6);this.drawFish(c,b.col);c.restore();}
      c.fillStyle='#fff';c.font=`800 24px ${FONT}`;c.textAlign='center';c.fillText(`${this.caught} / 5`,490,H-20);}
    else{drawFuka(c,200,H*.82,{outfit:outfit({item:'uchiwa'}),t:T,dir:3,sc:3.4});drawRikki(c,330,H*.84,{sc:2.8,t:T,clap:RK.clap});this.rkPos={x:330,y:H*.84,sc:2.8};c.fillStyle='rgba(255,255,255,.8)';c.font=`800 24px ${FONT}`;c.textAlign='center';c.fillText(`はなび ${Math.min(8,this.fw)} / 8`,W/2,H*.62);}
    for(const r of this.rockets){c.fillStyle='#ffe0a0';circ(c,r.x,r.y,4);}
    if(!night){drawFuka(c,215,H-18,{outfit:outfit({item:'kakigori'}),t:T,dir:0,sc:2.1,happy:this.caught>0});drawRikki(c,320,H-18,{sc:1.8,t:T,clap:RK.clap});this.rkPos={x:320,y:H-18,sc:1.8};}
    stepDots(c,3,night?2:0);},
  drawFish(c,col){const w=Math.sin(T*10)*.25;c.fillStyle=col;c.strokeStyle=shade(col==='#ffffff'?'#e0e0e8':col,-.3);c.lineWidth=2;c.save();c.translate(18,0);c.rotate(w);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(14,-16,22,-10);c.quadraticCurveTo(14,0,22,10);c.quadraticCurveTo(14,16,0,0);c.globalAlpha=.85;c.fill();c.stroke();c.restore();c.globalAlpha=1;
    c.fillStyle=gfill(c,0,-2,20,col);c.beginPath();c.ellipse(0,0,20,12,0,0,TAU);c.fill();c.stroke();if(col==='#ffffff'){c.fillStyle='#ff5a3a';circ(c,4,-3,6);}c.fillStyle='#fff';circ(c,-11,-3,4);c.fillStyle='#1a1a1a';circ(c,-12,-3,2.3);},
  down(x,y){if(this.phase==='wanage'){for(const p of this.wn.pz)if(!p.got&&Math.abs(x-p.x)<70&&y>p.y-100&&y<p.y+70){this.throwRing(p);return;}return;}
    if(this.phase==='hanabi'){if(y<H*.6&&this.fw<8){this.launch(x,Math.max(120,y));}return;}
    const po=this.poi;if(po.torn)return;po.held=true;po.x=x;po.y=y;po.lx=x;po.ly=y;po.lt=performance.now();po.speed=0;sfx('tap');},
  move(x,y){const po=this.poi;if(!po.held)return;const now=performance.now();const d=Math.hypot(x-po.lx,y-po.ly),dt=Math.max(1,now-po.lt)/1000;po.speed=d/dt;po.x=x;po.y=y;po.lx=x;po.ly=y;po.lt=now;if(this.inPool(x,y)&&Math.random()<.05)sfx('water');},
  up(x,y){const po=this.poi;if(!po.held)return;po.held=false;if(po.torn||!this.inPool(x,y))return;
    let best=null,bd=60;for(const f of this.fish){if(f.got)continue;const d=Math.hypot(f.x-x,f.y-y);if(d<bd){bd=d;best=f;}}
    if(best){best.got=true;this.caught++;this.bowl.push({col:best.col,t:0,o:rand(0,6)});sfx('splash');drops(x,y,10,'#bfeaff');burst(x,y,10,'star');rkCheer();say(pick(['すくえた！','やったー！','じょうず！']));sayWord('goldfish');
      if(best.gold){this.lucky=true;confetti(60);sfx('fanfare');setTimeout(()=>say('きんの きんぎょ！ ラッキー！'),300);}
      if(this.caught===5){setTimeout(()=>{if(scene!==this)return;this.startWanage();},1500);}}
    else{sfx('splash');drops(x,y,6,'#bfeaff');}},
  hint(){if(this.fin>0)return null;if(this.phase==='wanage'){const p=this.wn.pz.find(p=>!p.got);return p&&!this.wn.fly&&this.wn.rings>0?{x:p.x,y:p.y-40}:null;}if(this.phase==='hanabi')return{x:W/2,y:H*.3};const f=this.fish.find(f=>!f.got);return f?{x:f.x,y:f.y}:null;},
  hintText(){return this.phase==='wanage'?'けいひんを タッチして わっかを なげよう':this.phase==='hanabi'?'そらを タッチしてね':'きんぎょの うえで ゆびを はなしてね';}};

// ================= nurie (coloring) =================
function sPath(x,y,r1,r2,n=5){const p=new Path2D();for(let i=0;i<n*2;i++){const r=i%2?r2:r1,a=-Math.PI/2+i*Math.PI/n;const px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;i?p.lineTo(px,py):p.moveTo(px,py);}p.closePath();return p;}
function cPath(x,y,r){const p=new Path2D();p.arc(x,y,r,0,TAU);return p;}
function eP(x,y,rx,ry){const p=new Path2D();p.ellipse(x,y,rx,ry,0,0,TAU);return p;}
function rP(x,y,w,h,r){const p=new Path2D();if(p.roundRect&&r)p.roundRect(x,y,w,h,r);else p.rect(x,y,w,h);return p;}
function polyP(pts){const p=new Path2D();pts.forEach(([x,y],i)=>i?p.lineTo(x,y):p.moveTo(x,y));p.closePath();return p;}
const PICS=[
  {name:'おうち',make(){const cl=new Path2D();cl.arc(110,90,30,0,TAU);cl.arc(150,72,38,0,TAU);cl.arc(192,92,28,0,TAU);
    return[rP(0,0,480,300),rP(0,300,480,180),cPath(400,78,42),cl,rP(398,270,24,70),cPath(410,232,46),polyP([[96,196],[240,78],[384,196]]),rP(120,196,240,150),rP(210,266,60,80,[30,30,0,0]),rP(138,220,52,46,6),rP(290,220,52,46,6),sPath(60,410,24,11),cPath(160,432,18),sPath(330,420,24,11),cPath(440,410,16)];},
    ex:['#9fd8ff','#8ad86a','#ffd23a','#ffffff','#b0784a','#5cc46a','#ff6fa8','#ffe8d0','#b07a4a','#bfe8ff','#bfe8ff','#ff8cc0','#ffd23a','#b48cff','#ff5f6f']},
  {name:'おさかな',make(){const sand=new Path2D();sand.moveTo(0,400);sand.quadraticCurveTo(240,370,480,400);sand.lineTo(480,480);sand.lineTo(0,480);sand.closePath();
    const sw=(x)=>{const p=new Path2D();p.moveTo(x-10,400);p.quadraticCurveTo(x-30,340,x,300);p.quadraticCurveTo(x+25,260,x+5,220);p.lineTo(x+20,222);p.quadraticCurveTo(x+40,265,x+15,300);p.quadraticCurveTo(x-10,345,x+10,400);p.closePath();return p;};
    return[rP(0,0,480,480),sand,sw(50),sw(430),polyP([[320,230],[420,160],[405,230],[420,300]]),(()=>{const p=new Path2D();p.moveTo(180,170);p.quadraticCurveTo(230,100,280,168);p.closePath();return p;})(),eP(220,230,120,76),cPath(150,212,15),cPath(110,100,18),cPath(78,55,12),cPath(140,48,9),sPath(360,430,28,12),(()=>{const p=new Path2D();p.moveTo(100,450);p.arc(130,450,30,Math.PI,TAU);p.closePath();return p;})()];},
    ex:['#7ad0f8','#f8e4b0','#6cd08a','#4cb85a','#ff9a3a','#ffb03a','#ff6a3a','#ffffff','#e0f6ff','#e0f6ff','#e0f6ff','#ff6f91','#ffb3d6']},
  {name:'アイス',make(){return[rP(0,0,480,480),eP(240,440,170,28),polyP([[168,262],[312,262],[240,428]]),cPath(196,236,62),cPath(286,236,62),cPath(242,164,60),cPath(242,94,20),sPath(78,100,28,12),sPath(404,120,24,10),sPath(408,330,20,9),sPath(70,330,18,8)];},
    ex:['#fff0f8','#d8e8ff','#e8b070','#ffb3d6','#b8f0d8','#fff09a','#ff2a5a','#ffd23a','#b48cff','#5aa8ff','#ff8cc0']},
];
const NCOLS=[['#ff4d6d','あか','red'],['#ff9a3a','オレンジ','orange'],['#ffd23a','きいろ','yellow'],['#6cd08a','みどり','green'],['#5aa8ff','あお','blue'],['#b48cff','むらさき','purple'],['#ff8cc0','ピンク','pink'],['#8a5a3a','ちゃいろ','brown'],['#ffffff','しろ','white'],['#3a3050','くろ','black'],['#9fd8ff','みずいろ','light blue'],['#bfeaa0','きみどり','lime']];
const NSP=[['rainbow','にじいろ','rainbow'],['gold','キラキラ','sparkle'],['dots','みずたま','polka dots']];
function nFill(c,col){if(col==='rainbow'){const g=c.createLinearGradient(0,0,480,480);['#ff6f91','#ffb03a','#ffe36a','#8ee07a','#5ac8ff','#b88aff'].forEach((q,i)=>g.addColorStop(i/5,q));return g;}
  if(col==='gold'){const g=c.createLinearGradient(0,0,480,480);for(let i=0;i<=8;i++)g.addColorStop(i/8,i%2?'#fff3b0':'#ffc21a');return g;}
  if(col==='dots'){if(!nFill.dp){const o=document.createElement('canvas');o.width=o.height=40;const g=o.getContext('2d');g.fillStyle='#ff8cc0';g.fillRect(0,0,40,40);g.fillStyle='#fff';g.beginPath();g.arc(10,10,6,0,TAU);g.arc(30,30,6,0,TAU);g.fill();nFill.dp=o;}return c.createPattern(nFill.dp,'repeat');}return col;}
SCN.nurie={bg:'#fff8e8',song:'play',
  enter(){this.phase='pick';this.sel=6;this.fin=0;this.lucky=false;this.said={};this.lay();say('どの えを ぬろうかな？');},
  lay(){this.ox=60;this.oy=Math.max(150,H*.47-260);this.sc=1;},
  pickP(i){return{x:110+i*190,y:H*.45};},
  palP(i){return{x:55+(i%6)*98,y:i<6?H-150:H-66};},
  spP(i){return{x:190+i*110,y:Math.min(this.oy+540,H-250)};},
  start(i){this.pic=PICS[i];this.regs=this.pic.make().map(p=>({p,col:null,t:0}));this.phase='paint';sfx('pop');say(`${this.pic.name}を ぬろう！ いろを えらんで タッチしてね`);},
  update(dt){for(const r of this.regs||[])if(r.t<1)r.t=Math.min(1,r.t+dt*4);if(this.fin>0){this.fin+=dt;if(this.fin>2.6&&this.fin<9){this.fin=9;celebrate('nurie',this.lucky);}}},
  drawPic(c,regs,x,y,s,thumb,exCols){c.save();c.translate(x,y);c.scale(s,s);c.save();rr(c,0,0,480,480,24);c.clip();c.fillStyle='#fff';c.fillRect(0,0,480,480);
    regs.forEach((r,i)=>{const col=exCols?exCols[i]:r.col;if(col){c.fillStyle=nFill(c,col);c.globalAlpha=exCols?1:ease(r.t);c.fill(r.p);c.globalAlpha=1;if(col==='gold'&&!thumb){c.save();c.clip(r.p);c.fillStyle='#fff';for(let k=0;k<30;k++){const sx=(k*97+i*31)%480,sy=(k*61+i*53)%480;if(Math.sin(T*4+k)>.3){star(c,sx,sy,6,2.5,4);c.fill();}}c.restore();}}});
    c.strokeStyle='#4a3a4a';c.lineWidth=5;c.lineJoin='round';regs.forEach(r=>c.stroke(r.p));c.restore();c.strokeStyle='#e8c8a8';c.lineWidth=10;rr(c,0,0,480,480,24);c.stroke();c.restore();},
  draw(c){c.fillStyle='#fff3dc';c.fillRect(-400,0,W+800,H);c.fillStyle='#ffe8c0';for(let x=-400;x<W+400;x+=40)c.fillRect(x,0,20,H);
    if(this.phase==='pick'){titleText(c,'どれに する？',W/2,H*.25,40,'#ff8c3a');PICS.forEach((p,i)=>{const q=this.pickP(i);const regs=p.make().map(pp=>({p:pp}));c.fillStyle='rgba(90,40,110,.15)';rr(c,q.x-84,q.y-80,172,172,20);c.fill();const mine=SAVE.nurie&&SAVE.nurie[i];this.drawPic(c,regs,q.x-80,q.y-86,1/3,true,mine||p.ex);if(mine){c.fillStyle='#ffd23a';star(c,q.x+70,q.y-80,20,9);c.fill();}c.fillStyle='#8a5a3a';c.font=`800 24px ${FONT}`;c.textAlign='center';c.fillText(p.name,q.x,q.y+110);});
      drawFuka(c,160,H-40,{outfit:outfit(),t:T,dir:0,sc:2.8,point:1});drawRikki(c,440,H-40,{sc:2.3,t:T});this.rkPos={x:440,y:H-40,sc:2.3};return;}
    const k=this.fin>0?1+Math.sin(Math.min(1,this.fin)*Math.PI)*.05:1;this.drawPic(c,this.regs,this.ox-(k-1)*240,this.oy-(k-1)*240,k);
    tray(c,H-108,190);NCOLS.forEach((col,i)=>{const p=this.palP(i);const sel=this.sel===i;c.fillStyle='rgba(90,40,110,.15)';circ(c,p.x+2,p.y+4,34);c.fillStyle=gfill(c,p.x,p.y,34,col[0]==='#ffffff'?'#f6f6ff':col[0]);circ(c,p.x,p.y,sel?38:31);c.strokeStyle=sel?'#ff5fa2':'#eee';c.lineWidth=sel?6:3;c.beginPath();c.arc(p.x,p.y,sel?38:31,0,TAU);c.stroke();if(sel)drawItem(c,'crayon',p.x+26,p.y-26,.7);});
    NSP.forEach((sp,i)=>{const p=this.spP(i),sel=this.sel===100+i;c.fillStyle='rgba(90,40,110,.15)';circ(c,p.x+2,p.y+4,34);c.save();c.beginPath();c.arc(p.x,p.y,sel?38:31,0,TAU);c.clip();c.translate(p.x-240/8,p.y-240/8);c.scale(1/8,1/8);c.fillStyle=nFill(c,sp[0]);c.fillRect(-60,-60,600,600);c.restore();c.strokeStyle=sel?'#ff5fa2':'#fff';c.lineWidth=sel?6:4;c.beginPath();c.arc(p.x,p.y,sel?38:31,0,TAU);c.stroke();c.fillStyle='#8a5a3a';c.font=`800 15px ${FONT}`;c.textAlign='center';c.fillText(sp[1],p.x,p.y+50);if(sel)drawItem(c,'crayon',p.x+26,p.y-26,.7);});
    if(this.fin>0){for(let i=0;i<3;i++){const a=T*3+i*2.1;c.fillStyle=['#ffd23a','#ff8cc0','#7ad8ff'][i];star(c,this.ox+240+Math.cos(a)*270,this.oy+240+Math.sin(a)*270,16,7);c.fill();}}
    const left=this.regs.filter(r=>!r.col).length;if(left===0&&this.fin<=0)drawBtn(c,530,this.oy+440,44,'#4cd08a','check',true);
    else if(this.fin<=0){c.fillStyle='#8a6a5a';c.font=`800 20px ${FONT}`;c.textAlign='center';c.fillText(`のこり ${left}`,530,this.oy+500);}
    drawRikki(c,60,this.oy+520,{sc:1.6,t:T,clap:RK.clap});this.rkPos={x:60,y:this.oy+520,sc:1.6};},
  down(x,y){if(this.phase==='pick'){PICS.forEach((p,i)=>{const q=this.pickP(i);if(Math.abs(x-q.x)<90&&Math.abs(y-q.y)<100)this.start(i);});return;}if(this.fin>0)return;
    for(let i=0;i<NCOLS.length;i++){const p=this.palP(i);if(hitC(x,y,p.x,p.y,42)){this.sel=i;sfx('tap');const col=NCOLS[i];sayPair(col[1],col[2]);return;}}
    for(let i=0;i<NSP.length;i++){const p=this.spP(i);if(hitC(x,y,p.x,p.y,42)){this.sel=100+i;sfx('spark');sayPair(NSP[i][1],NSP[i][2]);return;}}
    if(this.regs.every(r=>r.col)&&hitC(x,y,530,this.oy+440,50)){this.fin=.01;sfx('fanfare');rkCheer();confetti(60);const sp=this.regs.filter(r=>NSP.some(q=>q[0]===r.col)).length;say(sp>=2?'キラキラの すてきな え！ おへやに かざろうね！':'すてきな えが できたね！ おへやに かざろうね！');if(!SAVE.nurie)SAVE.nurie={};SAVE.nurie[PICS.indexOf(this.pic)]=this.regs.map(r=>r.col);save();this.lucky=sp>=3;return;}
    const px=(x-this.ox)/this.sc,py=(y-this.oy)/this.sc;if(px<0||py<0||px>480||py>480)return;
    const HC=this.hc||(this.hc=document.createElement('canvas').getContext('2d'));for(let i=this.regs.length-1;i>=0;i--){if(HC.isPointInPath(this.regs[i].p,px,py)){const r=this.regs[i];r.col=this.sel>=100?NSP[this.sel-100][0]:NCOLS[this.sel][0];r.t=0;sfx(this.sel>=100?'spark':'pop');burst(x,y,6,'star');if(this.regs.every(q=>q.col))setTimeout(()=>say('ぜんぶ ぬれたね！ みどりの ボタンを おしてね'),500);return;}}},
  hint(){if(this.phase==='pick'){const q=this.pickP(0);return{x:q.x,y:q.y};}if(this.fin>0)return null;const r=this.regs.findIndex(r=>!r.col);if(r<0)return{x:530,y:this.oy+440};return null;},
  hintText(){return this.phase==='pick'?'すきな えを タッチしてね':'いろを えらんで、 えの なかを タッチしてね';}};

// ================= puzzle =================
function makePuzzlePic(i){const S=420,oc=document.createElement('canvas');oc.width=oc.height=S;const c=oc.getContext('2d');
  const PC={2:['#ffe0f0','#fff0f8','#f0c090','#e0a070'],3:['#5ec0ee','#8ad8ff','#f0dca8','#e0c890'],4:['#2a2a6a','#5a4a9a','#3a6a4a','#2a5a3a'],5:['#bfe8ff','#e8f8ff','#a8e488','#8ad06a']}[i]||['#8fd8ff','#dff6ff','#8ad86a','#6cc05a'];const g=c.createLinearGradient(0,0,0,S);g.addColorStop(0,PC[0]);g.addColorStop(.6,PC[1]);g.addColorStop(.6,PC[2]);g.addColorStop(1,PC[3]);c.fillStyle=g;c.fillRect(0,0,S,S);
  const saveT=T;
  if(i===0){sun(c,340,70,32,0);cloud(c,110,80,.7,true);tree(c,60,260,.9);flowers(c,0,S,280,400,5);drawFuka(c,160,370,{outfit:OUTFIT0,t:0,dir:0,sc:4,wave:1});drawRikki(c,300,370,{sc:3,t:0,happy:1});}
  else if(i===1){cloud(c,320,70,.8,true);for(const [k,x] of [['bear',100],['rabbit',210],['panda',320]])drawAnimal(c,k,x,360,.95,{t:0,happy:1});c.strokeStyle='#8a7a9a';c.lineWidth=2;for(const [x,col] of [[60,'#ff6f91'],[370,'#ffd23a']]){c.beginPath();c.moveTo(x,180);c.lineTo(x+10,260);c.stroke();c.fillStyle=col;ell(c,x,150,26,32);}}
  else if(i===3){for(const [k,x,y,sc] of [['whale',290,110,1.3],['fish',90,150,1.1],['octopus',120,330,1.2],['crab',300,350,1.1],['starfish',210,380,.9]])drawThing(c,k,x,y,sc);c.fillStyle='rgba(255,255,255,.5)';for(let k=0;k<8;k++)circ(c,40+k*47,60+(k%3)*30,6);}
  else if(i===4){c.fillStyle='#fff6c0';circ(c,320,80,40);c.fillStyle=PC[1];circ(c,338,70,34);c.fillStyle='#ffe890';for(let k=0;k<12;k++){star(c,30+(k*73)%360,30+(k*41)%200,8,3.5);c.fill();}drawAnimal(c,'rabbit',130,370,.9,{t:0,happy:1});drawAnimal(c,'cat',290,370,.9,{t:0,happy:1});}
  else if(i===5){tree(c,340,250,.8);for(const [k,x] of [['pig',90],['chick',200],['dog',310]])drawAnimal(c,k,x,370,.85,{t:0,happy:1});drawItem(c,'carrot',60,230,1.2);drawItem(c,'tomato',160,240,1.1);cloud(c,120,70,.7,true);sun(c,330,60,28,0);}
  else{c.fillStyle='#fff';ell(c,210,330,170,40);drawItem(c,'cake',210,250,3.6);drawItem(c,'strawberry',70,340,1.4);drawItem(c,'heartcookie',350,340,1.4);drawItem(c,'starcandy',80,90,1.3);drawItem(c,'starcandy',340,70,1.1);drawItem(c,'candle',210,110,1.5);}
  return oc;}
SCN.puzzle={bg:'#e8f6ff',song:'play',
  enter(){this.round=0;this.fin=0;this.lucky=false;this.sd=null;this.hunt=null;this.pics=shuffle([0,1,2,3,4,5]).slice(0,3).map(makePuzzlePic);this.lay();this.setup();},
  lay(){this.bx=90;this.by=150;this.bs=420;},
  setupShadow(){this.sd=null;this.done=0;const ks=shuffle(['apple','duck','crown','balloon','cake','carrot','fish','rabbit','panda','strawberry']).slice(0,4);
    const sil=k=>{const o=document.createElement('canvas');o.width=o.height=200;const g=o.getContext('2d');drawThing(g,k,100,100,2.2);g.globalCompositeOperation='source-in';g.fillStyle='#5a6a9a';g.fillRect(0,0,200,200);return o;};
    const tg=shuffle([0,1,2,3]);this.sd={items:ks.map((k,i)=>({k,sil:sil(k),tx:this.bx+105+(tg[i]%2)*210,ty:this.by+105+Math.floor(tg[i]/2)*210,hx:120+i*120,hy:this.by+this.bs+130,x:120+i*120,y:this.by+this.bs+130,placed:false,held:false,sh:0})),dr:null};
    this.pieces=[];say('かげあわせ！ おなじ かたちの かげに いれてね');},
  setup(){this.hunt=null;if(this.round===3){this.setupShadow();return;}this.sd=null;const [cols,rows]=[[2,2],[3,2],[3,3]][this.round];this.cols=cols;this.rows=rows;this.img=this.pics[this.round];this.done=0;const pw=this.bs/cols,ph=this.bs/rows;this.pieces=[];
    const ty0=this.by+this.bs+30,ty1=H-30;const n=cols*rows;const slots=[];const perRow=Math.min(n,3+(n>6?1:0));for(let k=0;k<n;k++){const r=Math.floor(k/perRow),cN=Math.min(perRow,n-r*perRow);slots.push({x:W/2-(cN-1)*70+(k%perRow)*140,y:ty0+60+r*Math.min(120,(ty1-ty0-60)/Math.ceil(n/perRow))});}
    const sl=shuffle(slots);let k=0;for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const s=sl[k++];this.pieces.push({i,j,w:pw,h:ph,tx:this.bx+i*pw+pw/2,ty:this.by+j*ph+ph/2,hx:s.x+rand(-10,10),hy:s.y+rand(-8,8),x:s.x,y:s.y,s:.5,placed:false,held:false,rot:rand(-.2,.2)});}
    this.dr=null;say(['パズル！ ピースを うえの ばしょに はめてね','つぎは 6まい！','さいごは 9まい！ がんばれ！'][this.round]);},
  update(dt){for(const p of this.pieces){if(!p.held&&!p.placed){p.x+=(p.hx-p.x)*Math.min(1,dt*10);p.y+=(p.hy-p.y)*Math.min(1,dt*10);}const ts=p.held||p.placed?1:.5;p.s+=(ts-p.s)*Math.min(1,dt*12);if(p.placed){p.x+=(p.tx-p.x)*Math.min(1,dt*16);p.y+=(p.ty-p.y)*Math.min(1,dt*16);p.rot*=.8;}}
    if(this.sd)for(const it of this.sd.items){if(it.sh>0)it.sh-=dt;if(!it.held){const tx=it.placed?it.tx:it.hx,ty=it.placed?it.ty:it.hy;it.x+=(tx-it.x)*Math.min(1,dt*12);it.y+=(ty-it.y)*Math.min(1,dt*12);}}
    if(this.hunt)this.hunt.t+=dt;
    if(this.done>0){this.done+=dt;if(this.done>2.4&&this.done<9){this.done=9;this.round++;if(this.round>=4)celebrate('puzzle',this.lucky);else this.setup();}}},
  drawPiece(c,p){c.save();c.translate(p.x,p.y);c.rotate(p.held?0:p.rot);c.scale(p.s,p.s);if(!p.placed){c.fillStyle='rgba(60,40,90,.25)';rr(c,-p.w/2+5,-p.h/2+8,p.w,p.h,14);c.fill();}
    c.save();rr(c,-p.w/2,-p.h/2,p.w,p.h,p.placed?0:14);c.clip();c.drawImage(this.img,p.i*p.w,p.j*p.h,p.w,p.h,-p.w/2,-p.h/2,p.w,p.h);c.restore();if(!p.placed){c.strokeStyle='#fff';c.lineWidth=6;rr(c,-p.w/2,-p.h/2,p.w,p.h,14);c.stroke();}c.restore();},
  draw(c){c.fillStyle='#dff0ff';c.fillRect(-400,0,W+800,H);c.fillStyle='rgba(255,255,255,.4)';for(let i=0;i<10;i++){drawItem(c,'puzzle',(i*137)%W,(i*211)%H,.8);}
    c.fillStyle='rgba(60,40,90,.15)';rr(c,this.bx-10,this.by-4,this.bs+20,this.bs+20,20);c.fill();c.fillStyle='#fff';rr(c,this.bx-10,this.by-10,this.bs+20,this.bs+20,20);c.fill();
    c.globalAlpha=.2;c.drawImage(this.img,this.bx,this.by);c.globalAlpha=1;c.strokeStyle='rgba(90,130,200,.35)';c.lineWidth=2;c.setLineDash([8,6]);for(let i=1;i<this.cols;i++){c.beginPath();c.moveTo(this.bx+i*this.bs/this.cols,this.by);c.lineTo(this.bx+i*this.bs/this.cols,this.by+this.bs);c.stroke();}for(let j=1;j<this.rows;j++){c.beginPath();c.moveTo(this.bx,this.by+j*this.bs/this.rows);c.lineTo(this.bx+this.bs,this.by+j*this.bs/this.rows);c.stroke();}c.setLineDash([]);
    if(this.sd){c.fillStyle='#fff';rr(c,this.bx-10,this.by-10,this.bs+20,this.bs+20,20);c.fill();c.strokeStyle='#c8dcf0';c.lineWidth=3;c.beginPath();c.moveTo(this.bx+210,this.by+10);c.lineTo(this.bx+210,this.by+410);c.moveTo(this.bx+10,this.by+210);c.lineTo(this.bx+410,this.by+210);c.stroke();
      for(const it of this.sd.items){c.globalAlpha=it.placed?.15:.9;c.drawImage(it.sil,it.tx-100,it.ty-100);c.globalAlpha=1;}
      tray(c,this.by+this.bs+130,150);for(const it of this.sd.items){const sh=it.sh>0?Math.sin(it.sh*40)*6:0;drawThing(c,it.k,it.x+sh,it.y,it.held?1.9:it.placed?2.2:1.35);}
      drawRikki(c,40,this.by+this.bs+10,{sc:1.4,t:T,clap:RK.clap});this.rkPos={x:40,y:this.by+this.bs+10,sc:1.4};stepDots(c,4,this.round);return;}
    for(const p of this.pieces)if(p.placed)this.drawPiece(c,p);if(this.hunt){for(const st of this.hunt.st){if(st.got){const e=clamp(this.hunt.t-st.gt,0,1);c.globalAlpha=1-e;c.fillStyle='#ffd23a';star(c,st.x,st.y-e*60,26+e*20,12);c.fill();c.globalAlpha=1;}else if(this.hunt.t>1){c.globalAlpha=.35+Math.max(0,Math.sin(T*3+st.x))*.45;c.fillStyle='#fff6a0';star(c,st.x,st.y,15,6);c.fill();c.strokeStyle='#e8a800';c.lineWidth=1.5;c.stroke();c.globalAlpha=1;}}
      c.fillStyle='rgba(255,255,255,.92)';rr(c,W/2-160,this.by+this.bs+24,320,50,25);c.fill();c.fillStyle='#e8a000';c.font=`800 22px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(`かくれほし ${this.hunt.st.filter(q=>q.got).length} / 3`,W/2,this.by+this.bs+49);}
    if(this.done>0){c.fillStyle=`rgba(255,255,255,${Math.max(0,.6-this.done)})`;c.fillRect(this.bx,this.by,this.bs,this.bs);}
    for(const p of this.pieces)if(!p.placed&&!p.held)this.drawPiece(c,p);for(const p of this.pieces)if(p.held)this.drawPiece(c,p);
    drawRikki(c,40,this.by+this.bs+10,{sc:1.4,t:T,clap:RK.clap});this.rkPos={x:40,y:this.by+this.bs+10,sc:1.4};
    stepDots(c,4,this.round);},
  down(x,y){if(this.done>0)return;
    if(this.sd){for(const it of this.sd.items)if(!it.placed&&Math.hypot(x-it.x,y-it.y)<60){it.held=true;this.sd.dr=it;sfx('tap');sayWord(it.k);return;}return;}
    if(this.hunt){if(this.hunt.t<1)return;for(const st of this.hunt.st)if(!st.got&&Math.hypot(x-st.x,y-st.y)<50){st.got=true;st.gt=this.hunt.t;sfx('chin');burst(st.x,st.y,14,'star');rkCheer();if(this.hunt.st.every(q=>q.got)){this.done=.01;sfx('fanfare');say('ほし ぜんぶ みつけた！');confetti(30);}else say(pick(['みつけた！','あった！']));return;}return;}
    for(let i=this.pieces.length-1;i>=0;i--){const p=this.pieces[i];if(p.placed)continue;if(Math.abs(x-p.x)<p.w*p.s/2+10&&Math.abs(y-p.y)<p.h*p.s/2+10){p.held=true;this.dr=p;p.ox=x-p.x;p.oy=y-p.y;this.pieces.splice(i,1);this.pieces.push(p);sfx('tap');return;}}},
  move(x,y){if(this.sd&&this.sd.dr){this.sd.dr.x=x;this.sd.dr.y=y;return;}const p=this.dr;if(p){p.x=x-p.ox*.5;p.y=y-p.oy*.5;}},
  up(x,y){if(this.sd&&this.sd.dr){const it=this.sd.dr;this.sd.dr=null;it.held=false;const hit=this.sd.items.find(q=>!q.placed&&Math.hypot(x-q.tx,y-q.ty)<95);if(hit===it){it.placed=true;sfx('snap');burst(it.tx,it.ty,14,'star');rkCheer();sayWord(it.k,'ぴったり！');if(this.sd.items.every(q=>q.placed)){this.done=.01;this.lucky=true;sfx('fanfare');confetti(40);say('かげあわせ めいじん！');}}else if(hit){it.sh=.5;sfx('no');say('かたちが ちがうみたい');}else sfx('whoosh');return;}
    const p=this.dr;if(!p)return;this.dr=null;p.held=false;if(Math.hypot(p.x-p.tx,p.y-p.ty)<70){p.placed=true;sfx('snap');burst(p.tx,p.ty,10,'star');rkCheer();
      if(this.pieces.every(q=>q.placed)){sfx('fanfare');confetti(30);this.hunt={t:0,st:[...Array(3)].map(()=>({x:this.bx+rand(40,this.bs-40),y:this.by+rand(40,this.bs-40),got:false}))};say('かんせい！ あれ？ えの なかに ほしが 3つ かくれてるよ！ さがしてね');}}else sfx('whoosh');},
  hint(){if(this.done>0)return null;if(this.sd){const it=this.sd.items.find(q=>!q.placed);return it?{x:it.hx,y:it.hy,x2:it.tx,y2:it.ty}:null;}if(this.hunt){const st=this.hunt.st.find(q=>!q.got);return st&&this.hunt.t>1?{x:st.x,y:st.y}:null;}const p=this.pieces.find(q=>!q.placed);return p?{x:p.hx,y:p.hy,x2:p.tx,y2:p.ty}:null;},
  hintText(){return this.sd?'おなじ かたちの かげに いれてね':this.hunt?'えの なかの ほしを タッチ':'ピースを おなじ えの ばしょに はめてね';}};

// ================= music (xylophone) =================
const XNOTES=[60,62,64,65,67,69,71,72],XLAB=['ど','れ','み','ふぁ','そ','ら','し','ど'],XCOL=['#ff5a6a','#ff9a3a','#ffd84a','#6cd08a','#3cc8d8','#5aa8ff','#a86aff','#ff6fb8'];
const XSONGS=[{name:'きらきらぼし',icon:'starcandy',seq:[0,0,4,4,5,5,4,3,3,2,2,1,1,0]},{name:'かえるのうた',icon:'frog',seq:[0,1,2,3,2,1,0,2,3,4,5,4,3,2]},{name:'チューリップ',icon:'flower',seq:[0,1,2,0,1,2,4,2,1,0,1,2,1]}];
SCN.music={bg:'#fbe8ff',song:null,
  enter(){this.song=null;this.si=-1;this.pos=0;this.fin=0;this.rh=null;this.inst=this.inst||0;this.lucky=false;this.hitT=new Array(8).fill(0);this.dance=0;this.last=-1;this.lay();this.songDone=0;say('もっきんを たたいて みよう！ うえの ボタンで きょくも ひけるよ');},
  lay(){this.top=H*.44;},
  barR(i){const w=62,x=30+i*69,h=300-i*20,y=this.top+(300-h)/2;return{x,y,w,h};},
  songP(i){return{x:84+i*144,y:170};},
  INST:[['もっきん','xylophone'],['ピアノ','piano'],['おもちゃ','toy']],
  startRh(){const sq=pick(XSONGS);this.si=-1;this.rh={name:sq.name,notes:sq.seq.map((i,k)=>({i,t:k*.75,hit:0})),t:-2.2,combo:0,max:0,hits:0,per:0,done:false,dt:0,beat:0,fb:0,judge:null};sfx('fanfare');say(`リズムゲーム！ 「${sq.name}」！ おちてくる おとが ぼうに きたら たたいてね`);},
  play(i){const m=XNOTES[i];if(this.inst===1){tone(mtof(m+12),.9,'triangle',.3,0,0,MG,.004);tone(mtof(m),.9,'sine',.15,0,0,MG,.004);tone(mtof(m+24),.25,'square',.03);}else if(this.inst===2){tone(mtof(m+24),.18,'square',.12,0,0,MG,.002);tone(mtof(m+19),.12,'square',.06,.06,0,MG,.002);}else{tone(mtof(m+12),1.1,'sine',.32,0,0,MG,.002);tone(mtof(m+24),.35,'triangle',.12,0,0,MG,.002);tone(mtof(m+31),.15,'sine',.05);}this.hitT[i]=1;this.dance=1.2;const r=this.barR(i);parts.push({x:r.x+r.w/2,y:r.y-10,vx:rand(-40,40),vy:-160,life:1.2,t:0,kind:'note',col:XCOL[i],r:14});
    if(this.si>=0){const seq=XSONGS[this.si].seq;if(seq[this.pos]===i){this.pos++;if(this.pos>=seq.length){this.pos=0;this.songDone++;sfx('fanfare');rkCheer();confetti(40);say('じょうずに ひけたね！');if(!this.fin){this.fin=.01;}}}}},
  update(dt){for(let i=0;i<8;i++)if(this.hitT[i]>0)this.hitT[i]-=dt*3;if(this.dance>0)this.dance-=dt;
    const R=this.rh;if(R){if(R.judge)R.judge.t+=dt;if(!R.done){const pt=R.t;R.t+=dt;if(Math.floor(R.t/.375)!==Math.floor(pt/.375)&&R.t>-1.5){const b=Math.floor(R.t/.375);if(b%2===0)tone(120,.14,'sine',.35,0,-70);else noise(.05,.1,6000,0,MG,'highpass');}
        for(const n of R.notes)if(!n.hit&&R.t-n.t>.32){n.hit=-1;R.combo=0;R.judge={txt:'ミス',col:'#9a8aaa',t:0};}
        if(R.t>R.notes[R.notes.length-1].t+1.2){R.done=true;R.dt=0;const rate=R.hits/R.notes.length;sfx('fanfare');confetti(rate>.7?90:40);say(rate>.9?'パーフェクトに ちかい！ リズムの てんさい！':rate>.6?'じょうず！ ノリノリ だったね！':'たのしかったね！ また やってみよう！');this.lucky=rate>.85;}}
      else{R.dt+=dt;if(R.dt>3&&!this.fin)this.fin=.01;}}
    if(this.fin>0){this.fin+=dt;if(this.fin>2.5&&this.fin<9){this.fin=9;celebrate('music',this.lucky);}}},
  draw(c){c.fillStyle=vfill(c,0,H,'#fbe8ff',.2,-.05);c.fillRect(-400,0,W+800,H);c.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<8;i++){c.font=`${30+i*4}px ${POP}`;c.fillText('♪',(i*83+T*10)%W,(i*131)%(H*.4)+60);}
    const R=this.rh;if(R&&R.combo>=8){c.globalAlpha=.25;c.fillStyle=`hsl(${(T*120)%360},90%,70%)`;c.fillRect(-400,0,W+800,H);c.globalAlpha=1;}
    {const p=this.songP(3),sel=!!R;c.fillStyle=sel?'#ff5fa2':'#fff';rr(c,p.x-66,p.y-34,132,68,34);c.fill();c.strokeStyle='#ff5fa2';c.lineWidth=4;c.stroke();c.fillStyle=sel?'#fff':'#ff5fa2';c.font=`800 20px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('♪ リズム',p.x,p.y);}
    {const ib=this.INST[this.inst];c.fillStyle='#fff';rr(c,W/2-90,232,180,44,22);c.fill();c.strokeStyle='#b48cff';c.lineWidth=3;c.stroke();c.fillStyle='#8a5ab8';c.font=`800 18px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('がっき： '+ib[0]+' ▶',W/2,254);}
    XSONGS.forEach((s,i)=>{const p=this.songP(i),sel=this.si===i;c.fillStyle=sel?'#d86ae8':'#fff';rr(c,p.x-66,p.y-34,132,68,34);c.fill();c.strokeStyle='#d86ae8';c.lineWidth=4;c.stroke();
      if(s.icon==='frog'){c.fillStyle='#6cd08a';circ(c,p.x-40,p.y,18);c.fillStyle='#fff';circ(c,p.x-47,p.y-12,6);circ(c,p.x-33,p.y-12,6);c.fillStyle='#222';circ(c,p.x-47,p.y-12,3);circ(c,p.x-33,p.y-12,3);}else if(s.icon==='flower'){c.save();c.translate(p.x-40,p.y+12);c.scale(2.4,2.4);handItem(c,'flower',0,0,0);c.restore();}else drawItem(c,'starcandy',p.x-40,p.y,.8);
      c.fillStyle=sel?'#fff':'#a84ac8';c.font=`800 13px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(s.name,p.x+18,p.y,96);});
    const bandY=this.top-50;const dz=this.dance>0;drawAnimal(c,'bear',110,bandY,.75,{t:T,dance:dz});drawAnimal(c,'rabbit',300,bandY-10,.75,{t:T+1,dance:dz});drawAnimal(c,'cat',490,bandY,.75,{t:T+2,dance:dz});
    c.fillStyle='#c89060';rr(c,20,this.top+120,560,26,10);c.fill();
    for(let i=0;i<8;i++){const r=this.barR(i),h=this.hitT[i]>0?this.hitT[i]:0;c.save();c.translate(0,h*8);c.fillStyle='rgba(90,40,110,.2)';rr(c,r.x+4,r.y+8,r.w,r.h,14);c.fill();c.fillStyle=vfill(c,r.y,r.y+r.h,XCOL[i],.25,-.12);rr(c,r.x,r.y,r.w,r.h,14);c.fill();c.fillStyle='rgba(255,255,255,.35)';rr(c,r.x+8,r.y+8,10,r.h-16,5);c.fill();
      c.fillStyle='#fff';circ(c,r.x+r.w/2,r.y+18,5);circ(c,r.x+r.w/2,r.y+r.h-18,5);c.fillStyle='#fff';c.font=`800 26px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(XLAB[i],r.x+r.w/2,r.y+r.h/2);
      if(this.si>=0&&XSONGS[this.si].seq[this.pos]===i){c.strokeStyle='#fff';c.lineWidth=6;rr(c,r.x-4,r.y-4,r.w+8,r.h+8,16);c.stroke();c.fillStyle='#ffd23a';star(c,r.x+r.w/2,r.y-30-Math.abs(Math.sin(T*6))*14,18,8);c.fill();}c.restore();}
    if(R){for(const n of R.notes){if(n.hit)continue;const r=this.barR(n.i),dtt=n.t-R.t;if(dtt>1.7)continue;const y=r.y-dtt*(r.y-290)/1.6;c.fillStyle='rgba(255,255,255,.7)';circ(c,r.x+r.w/2,y,26);c.fillStyle=XCOL[n.i];circ(c,r.x+r.w/2,y,21);c.fillStyle='#fff';c.font=`800 16px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(XLAB[n.i],r.x+r.w/2,y+1);}
      c.fillStyle='rgba(255,255,255,.9)';rr(c,20,290-60,150,44,22);c.fill();c.fillStyle='#ff5fa2';c.font=`800 20px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(R.combo>=2?R.combo+' コンボ！':R.name,95,252);
      if(R.judge&&R.judge.t<.7){c.globalAlpha=1-R.judge.t/.7;c.font=`36px ${POP}`;c.fillStyle=R.judge.col;c.fillText(R.judge.txt,W/2,this.top-110-R.judge.t*40);c.globalAlpha=1;}
      if(R.combo>=8){c.font=`40px ${POP}`;c.fillStyle='#ff3d8a';c.fillText('フィーバー！',W/2,this.top+380+Math.sin(T*8)*6);}
      if(R.done){c.fillStyle='rgba(255,255,255,.95)';rr(c,70,this.top-160,460,130,30);c.fill();c.strokeStyle='#ffd23a';c.lineWidth=6;c.stroke();const st=R.hits/R.notes.length>.9?3:R.hits/R.notes.length>.6?2:1;for(let k=0;k<3;k++){c.fillStyle=k<st?'#ffd23a':'#eee';star(c,W/2-70+k*70,this.top-100,28,12);c.fill();}c.fillStyle='#8a5a8a';c.font=`800 20px ${FONT}`;c.fillText(`${R.hits} / ${R.notes.length}  さいだい ${R.max} コンボ`,W/2,this.top-55);}}
    if(this.si>=0){const seq=XSONGS[this.si].seq;const y=this.top+340;seq.forEach((n,k)=>{const x=W/2-(seq.length-1)*19+k*38;c.fillStyle=k<this.pos?XCOL[n]:'#fff';circ(c,x,y,15);c.strokeStyle=XCOL[n];c.lineWidth=3;c.beginPath();c.arc(x,y,15,0,TAU);c.stroke();c.fillStyle=k<this.pos?'#fff':XCOL[n];c.font=`800 13px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(XLAB[n],x,y+1);});}
    const dz2=dz||(R&&R.combo>=8);drawFuka(c,120,H-30,{outfit:outfit(),t:T,dir:0,sc:2.6,dance:dz2});drawRikki(c,470,H-30,{sc:2.3,t:T,dance:dz});this.rkPos={x:470,y:H-30,sc:2.3};},
  barAt(x,y){for(let i=0;i<8;i++){const r=this.barR(i);if(x>r.x-3&&x<r.x+r.w+3&&y>r.y-10&&y<r.y+r.h+10)return i;}return -1;},
  down(x,y){if(Math.abs(x-W/2)<95&&Math.abs(y-254)<26){this.inst=(this.inst+1)%3;sfx('tap');sayPair(this.INST[this.inst][0],this.INST[this.inst][1]);return;}
    {const p=this.songP(3);if(Math.abs(x-p.x)<70&&Math.abs(y-p.y)<36){if(this.rh&&!this.rh.done){this.rh=null;say('じゆうに ひいてね');}else this.startRh();sfx('tap');return;}}
    if(this.rh){const R=this.rh;const b=this.barAt(x,y);if(b<0)return;this.play(b);if(R.done)return;let best=null,bd=.3;for(const n of R.notes)if(!n.hit&&n.i===b&&Math.abs(n.t-R.t)<bd){bd=Math.abs(n.t-R.t);best=n;}
      if(best){best.hit=1;R.hits++;R.combo++;R.max=Math.max(R.max,R.combo);const per=bd<.13;if(per)R.per++;R.judge={txt:per?'パーフェクト！':'グッド！',col:per?'#ff5fa2':'#5aa8ff',t:0};const r=this.barR(b);burst(r.x+r.w/2,r.y,per?14:8,'star');if(R.combo===8){sfx('spark');say('フィーバー！');}}return;}
    for(let i=0;i<3;i++){const p=this.songP(i);if(Math.abs(x-p.x)<70&&Math.abs(y-p.y)<36){this.rh=null;if(this.si===i){this.si=-1;say('じゆうに ひいてね');}else{this.si=i;this.pos=0;say(`${XSONGS[i].name}！ ひかっている ところを たたいてね`);}sfx('tap');return;}}
    const b=this.barAt(x,y);if(b>=0){this.play(b);this.last=b;this.down2=true;}},
  move(x,y){if(!this.down2)return;const b=this.barAt(x,y);if(b>=0&&b!==this.last){this.play(b);this.last=b;}},
  up(){this.down2=false;this.last=-1;},
  hint(){if(this.rh){if(this.rh.done)return null;const n=this.rh.notes.find(n=>!n.hit);if(!n||n.t-this.rh.t>.6)return null;const r=this.barR(n.i);return{x:r.x+r.w/2,y:r.y+40};}if(this.si<0){const p=this.songP(3);return{x:p.x,y:p.y};}const r=this.barR(XSONGS[this.si].seq[this.pos]);return{x:r.x+r.w/2,y:r.y+r.h/2};},
  hintText(){return this.rh?'おとが ぼうに きたら たたいてね':this.si<0?'うえの リズムボタンや きょくを えらんでね':'ひかっている ところを たたいてね';}};

// ================= brush (dentist) =================
SCN.brush={bg:'#e8fff4',song:'play',
  enter(){this.step=0;this.fin=0;this.lay();this.foam=[];this.rinse=0;
    this.dirt=[];const kinds=shuffle(['food','food','germ','germ','germ','food','cav','cav','germ','food','germ','food']).slice(0,7+Math.floor(Math.random()*4));kinds.forEach((k,i)=>{const top=i%2===0;const ti=i%6;this.dirt.push({kind:k,tx:ti,top,hp:k==='cav'?1.6:1,ph:rand(0,6),dx:0,dy:0});});
    this.tools=['toothbrush','cup'].map((k,i)=>new Dr({k,hx:200+i*200,hy:H-80,r:58}));this.dr=null;this.boss=null;this.lucky=false;this.pt=pick([['#b8a8dc','かばさん'],['#ffb3c8','ピンクの かばちゃん'],['#9ad0ff','みずいろの かばくん']]);say(this.pt[1]+'の はを みがいて あげよう！ はぶらしで ごしごし！');},
  hitBoss(n){const b=this.boss;if(!b||b.hp<=0)return;b.hp-=n;b.hitT=.25;if(Math.random()<.5||n>=1)sfx('pop');if(b.hp<=0){b.flee=.01;sfx('boom');confetti(50);rkCheer();say('ばいきんキングを やっつけた！ つよい！');this.lucky=b.fast;setTimeout(()=>{if(scene===this){this.boss=null;this.step=1;sfx('fanfare');say('あわあわ！ コップの おみずで ぶくぶく しよう');}},2000);}else if(Math.random()<.35)say(pick(['いたたた！','やめてくれ〜！','くっ… まだまだ！']));},
  drawBoss(c,b){const k=b.flee>0?Math.max(0,1-b.flee):1;const x=b.x+(b.flee>0?b.flee*400:0),y=b.y-(b.flee>0?b.flee*300:0);c.save();c.translate(x,y);c.scale(k*(b.hitT>0?1.15:1),k*(b.hitT>0?.85:1));c.rotate(Math.sin(b.t*3)*.1);c.fillStyle=b.hitT>0?'#ffffff':gfill(c,-10,-10,60,'#7ad060');c.strokeStyle='#3a8a30';c.lineWidth=5;c.beginPath();for(let i=0;i<16;i++){const a=i/16*TAU,r=i%2?44:58;c.lineTo(Math.cos(a+b.t)*r,Math.sin(a+b.t)*r);}c.closePath();c.fill();c.stroke();
    c.fillStyle='#ffd23a';c.beginPath();c.moveTo(-30,-44);c.lineTo(-30,-74);c.lineTo(-15,-58);c.lineTo(0,-80);c.lineTo(15,-58);c.lineTo(30,-74);c.lineTo(30,-44);c.closePath();c.fill();c.strokeStyle='#c89000';c.lineWidth=3;c.stroke();c.fillStyle='#ff5f6f';circ(c,0,-58,5);
    c.fillStyle='#fff';ell(c,-16,-6,11,13);ell(c,16,-6,11,13);c.fillStyle='#2a2a2a';circ(c,-14,-3,6);circ(c,14,-3,6);c.strokeStyle='#2a2a2a';c.lineWidth=4;c.beginPath();c.moveTo(-28,-22);c.lineTo(-6,-14);c.moveTo(28,-22);c.lineTo(6,-14);c.stroke();c.beginPath();c.arc(0,24,14,Math.PI*1.15,Math.PI*1.85);c.stroke();c.restore();
    if(b.flee<=0){c.fillStyle='rgba(0,0,0,.3)';rr(c,b.x-60,b.y-110,120,14,7);c.fill();c.fillStyle='#ff5f6f';rr(c,b.x-60,b.y-110,120*b.hp/b.max,14,7);c.fill();}},
  lay(){this.mx=300;this.my=H*.46;if(this.tools)this.tools.forEach((t,i)=>{t.hx=200+i*200;t.hy=H-80;});},
  tooth(i,top){const x=this.mx-175+i*70,y=top?this.my-95:this.my+95;return{x,y};},
  dpos(d){const t=this.tooth(d.tx,d.top);return{x:t.x+d.dx+(d.kind==='germ'?Math.sin(T*3+d.ph)*6:0),y:t.y+(d.top?10:-10)+d.dy};},
  update(dt){for(const t of this.tools)t.upd(dt);for(const f of this.foam)f.t+=dt;
    const B=this.boss;if(B){B.t+=dt;if(B.hitT>0)B.hitT-=dt;if(B.flee>0)B.flee+=dt;else{B.x=this.mx+Math.sin(B.t*1.3)*150;B.y=this.my+Math.sin(B.t*2.1)*50;B.fast=B.t<12;}}
    if(this.step===1&&this.rinse>0){this.rinse+=dt;if(Math.random()<dt*20)drops(this.mx+rand(-150,150),this.my,2,'#9fd8ff');if(this.rinse>1.6){this.rinse=0;this.foam=[];this.step=2;sfx('spark');rkCheer();say('ピカピカの はに なったね！ '+this.pt[1]+' にっこり！');this.fin=.01;burst(this.mx,this.my,30,'star');}}
    if(this.fin>0){this.fin+=dt;if(this.fin>2.6&&this.fin<9){this.fin=9;celebrate('brush',this.lucky);}}},
  draw(c){c.fillStyle=vfill(c,0,H,'#e8fff4',.2,-.05);c.fillRect(-400,0,W+800,H);c.fillStyle='rgba(255,255,255,.6)';for(let i=0;i<6;i++)drawItem(c,'tooth',(i*113)%W+40,(i*97)%(H*.3)+60,.6);
    const mx=this.mx,my=this.my,col=this.pt[0],happy=this.step>=2;
    c.fillStyle=gfill(c,mx-60,my-220,280,col);c.beginPath();c.ellipse(mx,my-150,250,150,0,0,TAU);c.fill();c.strokeStyle=shade(col,-.35);c.lineWidth=4;c.stroke();
    for(const s of[-1,1]){c.fillStyle=col;c.beginPath();c.arc(mx+s*170,my-280,26,0,TAU);c.fill();c.stroke();c.fillStyle='#ffb3c8';circ(c,mx+s*170,my-280,12);
      if(happy){c.strokeStyle='#3a3a4a';c.lineWidth=5;c.beginPath();c.arc(mx+s*90,my-230,16,Math.PI*1.1,Math.PI*1.9);c.stroke();}else{c.fillStyle='#fff';circ(c,mx+s*90,my-232,22);c.fillStyle='#3a3a4a';circ(c,mx+s*90,my-228,12);c.fillStyle='#fff';circ(c,mx+s*90-4,my-233,4);}}
    c.fillStyle='rgba(255,120,150,.45)';ell(c,mx-180,my-170,22,12);ell(c,mx+180,my-170,22,12);c.fillStyle=shade(col,-.3);ell(c,mx-40,my-175,8,12);ell(c,mx+40,my-175,8,12);
    c.fillStyle=gfill(c,mx,my+150,260,col);c.beginPath();c.ellipse(mx,my+140,250,110,0,0,TAU);c.fill();c.strokeStyle=shade(col,-.35);c.stroke();
    c.fillStyle='#8a2a4a';c.beginPath();c.ellipse(mx,my,220,140,0,0,TAU);c.fill();c.fillStyle='#ff8cae';ell(c,mx,my+60,130,56);
    for(const top of[true,false])for(let i=0;i<6;i++){const t=this.tooth(i,top);c.fillStyle=gfill(c,t.x,t.y,40,'#ffffff',.2,-.08);rr(c,t.x-28,top?t.y-24:t.y-22,56,46,top?[4,4,20,20]:[20,20,4,4]);c.fill();c.strokeStyle='#d0d8e8';c.lineWidth=3;c.stroke();if(happy&&Math.sin(T*4+i+(top?0:3))>.7){c.fillStyle='#fff';star(c,t.x+14,t.y-10,8,3,4);c.fill();}}
    for(const d of this.dirt){if(d.hp<=0)continue;const p=this.dpos(d);c.globalAlpha=Math.min(1,.3+d.hp);if(d.kind==='food'){c.fillStyle='#6cd08a';ell(c,p.x-6,p.y,8,5);c.fillStyle='#c8905a';ell(c,p.x+6,p.y+2,6,4);}
      else if(d.kind==='cav'){c.fillStyle='#4a3a3a';circ(c,p.x,p.y,9);}else{c.fillStyle='#8ee07a';c.strokeStyle='#4aa04a';c.lineWidth=2;c.beginPath();for(let k=0;k<8;k++){const a=k/8*TAU,r=k%2?9:12;c.lineTo(p.x+Math.cos(a+T*2)*r,p.y+Math.sin(a+T*2)*r);}c.closePath();c.fill();c.stroke();c.fillStyle='#222';circ(c,p.x-3,p.y-1,1.6);circ(c,p.x+3,p.y-1,1.6);}c.globalAlpha=1;}
    for(const f of this.foam){c.globalAlpha=.9;c.fillStyle='#fff';circ(c,f.x,f.y,f.r);c.globalAlpha=1;}
    if(this.boss)this.drawBoss(c,this.boss);
    if(this.rinse>0){c.fillStyle='rgba(160,220,255,.5)';c.beginPath();c.ellipse(mx,my,210*Math.min(1,this.rinse*2),130*Math.min(1,this.rinse*2),0,0,TAU);c.fill();}
    drawFuka(c,75,my+260,{outfit:outfit({acc:'nurse'}),t:T,dir:0,sc:2.3,happy,point:!happy});drawRikki(c,530,my+260,{sc:1.9,t:T,happy});this.rkPos={x:530,y:my+260,sc:1.9};
    tray(c,H-80,120);this.tools.forEach((t,i)=>{if(t.held)return;c.globalAlpha=i===this.step?1:.35;t.draw(c,1.4);c.globalAlpha=1;});for(const t of this.tools)if(t.held)t.draw(c,1.6);stepDots(c,3,this.step);},
  down(x,y){if(this.fin>0)return;if(this.boss&&this.boss.flee<=0&&!this.dr&&Math.hypot(x-this.boss.x,y-this.boss.y)<70){this.hitBoss(1);burst(x,y,8,'star');return;}this.tools.forEach((t,i)=>{if(!this.dr&&t.hit(x,y)){if(i!==this.step){sfx('no');say(this.step===0?'まず はぶらしで みがこう':'コップで ぶくぶく しよう');return;}t.held=true;this.dr=t;t.lx=x;t.ly=y;sfx('tap');sayWord(t.k);}});
    if(!this.dr&&hitC(x,y,this.mx,this.my-200,120)){sfx('boing');say(pick(['あーん','かばさん だよ','はみがき だいすき！']));}},
  move(x,y){const t=this.dr;if(!t)return;const d=Math.hypot(x-t.lx,y-t.ly);t.x=x;t.y=y;t.lx=x;t.ly=y;
    if(t.k==='toothbrush'){const bx=x-18,by=y-24;let any=false;if(this.boss&&this.boss.flee<=0&&Math.hypot(bx-this.boss.x,by-this.boss.y)<70&&d>3){this.hitBoss(d/120);if(Math.random()<.3)burst(bx,by,4,'star');}for(const dd of this.dirt){if(dd.hp<=0)continue;const p=this.dpos(dd);const dist=Math.hypot(p.x-bx,p.y-by);if(dd.kind==='germ'&&dist<90&&dist>40){dd.dx+=(p.x-bx)/dist*d*.15;dd.dx=clamp(dd.dx,-30,30);}if(dist<50){dd.hp-=d/220;any=true;if(dd.hp<=0){sfx('pop');burst(p.x,p.y,8,dd.kind==='germ'?'dot':'star');if(dd.kind==='germ')say(pick(['ばいきん やっつけた！','えいっ！']));}}}
      if(d>4&&Math.random()<.35&&Math.abs(y-this.my)<170){this.foam.push({x:bx+rand(-12,12),y:by+rand(-10,10),r:rand(6,12),t:0});if(this.foam.length>80)this.foam.shift();}if(any&&Math.random()<.3)sfx('brush');
      if(this.step===0&&!this.boss&&this.dirt.every(q=>q.hp<=0)){this.boss={x:this.mx,y:this.my,hp:8,max:8,t:0,hitT:0,flee:0};sfx('siren');say('たいへん！ ばいきんキングが でてきた！ はぶらしで ごしごし するか タッチして やっつけよう！');}}},
  up(x,y){const t=this.dr;if(!t)return;this.dr=null;t.held=false;if(t.k==='cup'&&this.step===1&&Math.hypot(x-this.mx,y-this.my)<220&&!this.rinse){this.rinse=.01;sfx('splash');say('ぶくぶく〜 ぺっ！');}},
  hint(){if(this.fin>0)return null;if(this.boss)return this.boss.flee>0?null:{x:this.boss.x,y:this.boss.y};if(this.step===0){const d=this.dirt.find(q=>q.hp>0);if(!d)return null;const p=this.dpos(d);return{x:this.tools[0].hx,y:this.tools[0].hy,x2:p.x+18,y2:p.y+24};}if(this.step===1&&!this.rinse)return{x:this.tools[1].hx,y:this.tools[1].hy,x2:this.mx,y2:this.my};return null;},
  hintText(){return this.step===0?'はぶらしで はの よごれを ごしごし':'コップを おくちに もっていってね';}};


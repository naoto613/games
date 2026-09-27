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
  enter(){this.cat='dress';this.changes=0;this.spin=0;this.flash=0;this.photo=0;this.bgI=0;this.pose=0;this.lay();say('おきがえ しよう！ すきな ふくを えらんでね');},
  lay(){this.fx=290;this.fy=H*.62;},
  tabs:[['dress','dress'],['hat','crown'],['shoes','shoe'],['item','wand']],
  tabP(i){return{x:120+i*110,y:165};},
  optP(i){return{x:90+(i%4)*140,y:i<4?H-205:H-95};},
  btnP(i){return{x:540,y:H*.3+i*96};},
  opts(){return this.cat==='dress'?DRESSES:this.cat==='hat'?HATS:this.cat==='shoes'?SHOES:ITEMS_ACC;},
  optId(o){return this.cat==='dress'?o.id:o[0];},
  update(dt){if(this.spin>0)this.spin-=dt;if(this.flash>0)this.flash-=dt*2;if(this.photo>0){this.photo+=dt;if(this.photo>2.4&&this.photo<9){this.photo=9;celebrate('dress');}}},
  draw(c){const {fx,fy}=this;
    c.fillStyle='#ffe0f0';for(let x=-400;x<W+400;x+=50)for(let y=0;y<H;y+=50)if(((x+y)/50)%2===0)c.fillRect(x,y,50,50);
    const ax=fx-170,ay=fy-420,aw=340,ah=450;c.save();rr(c,ax,ay,aw,ah,[170,170,20,20]);c.clip();drawBackdrop(c,this.bgI,ax,ay,aw,ah);c.restore();c.strokeStyle='#ffd23a';c.lineWidth=10;rr(c,ax,ay,aw,ah,[170,170,20,20]);c.stroke();
    c.fillStyle='#ffb3d6';ell(c,fx,fy+8,140,26);
    const sp=this.spin>0?[0,2,3,1][Math.floor(this.spin*12)%4]:0,pz=POSES[this.pose];
    drawFuka(c,fx,fy,{outfit:outfit(),t:T,dir:sp,sc:5,happy:this.changes>0,[pz]:1});drawRikki(c,fx+150,fy+6,{sc:2,t:T,dance:this.changes>0});this.rkPos={x:fx+150,y:fy+6,sc:2};
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
  down(x,y){if(this.photo>0)return;
    for(let i=0;i<4;i++){const p=this.tabP(i);if(hitC(x,y,p.x,p.y,46)){this.cat=this.tabs[i][0];sfx('tap');say(['ふく','かざり','くつ','もちもの'][i]+'を えらんでね');return;}}
    const b=i=>this.btnP(i);
    if(hitC(x,y,b(0).x,b(0).y,46)){this.flash=1;this.photo=.01;sfx('shutter');setTimeout(()=>say('はい チーズ！ かわいい〜！'),200);return;}
    if(hitC(x,y,b(1).x,b(1).y,42)){this.bgI=(this.bgI+1)%BGS.length;sfx('whoosh');sayPair(BGS[this.bgI][0],BGS[this.bgI][1]);return;}
    if(hitC(x,y,b(2).x,b(2).y,42)){this.pose=(this.pose+1)%POSES.length;sfx('boing');burst(this.fx,this.fy-150,8,'star');say(pick(['ポーズ！','きめっ！','いえーい！']));return;}
    if(hitC(x,y,b(3).x,b(3).y,42)){const ok=l=>l.filter(o=>!lockedN(this.cat==='x'?'':'',''));const pk=(cat,list,f)=>{const av=list.filter(o=>!lockedN(cat,f(o)));return f(pick(av));};
      SAVE.outfit.dress=pk('dress',DRESSES,o=>o.id);SAVE.outfit.hat=pk('hat',HATS,o=>o[0]);SAVE.outfit.shoes=pk('shoes',SHOES,o=>o[0]);SAVE.outfit.item=pk('item',ITEMS_ACC,o=>o[0]);save();this.changes++;this.spin=.7;sfx('spark');burst(this.fx,this.fy-150,20);say('おまかせ コーデ！');return;}
    const os=this.opts();for(let i=0;i<os.length;i++){const p=this.optP(i);if(hitC(x,y,p.x,p.y,50)){if(this.setOpt(os[i])){save();this.changes++;this.spin=.35;sfx('spark');rkCheer();burst(this.fx,this.fy-150,14);if(this.changes===3)setTimeout(()=>say('カメラで しゃしんを とろう！'),2200);}return;}}
    if(hitC(x,y,this.fx,this.fy-150,110)){this.spin=.7;sfx('boing');say('くるりん！');burst(this.fx,this.fy-150,10,'star');}},
  hint(){if(this.photo>0)return null;if(this.changes<2){const p=this.optP(2);return{x:p.x,y:p.y};}const p=this.btnP(0);return{x:p.x,y:p.y};},
  hintText(){return this.changes<2?'したの ふくを タッチしてね':'カメラを タッチしてね';}};

// ================= zoo =================
const ZFOOD={rabbit:'carrot',dog:'bone',cat:'fish',panda:'bamboo',pig:'apple',chick:'corn'};
const ZSND={rabbit:'ぴょんぴょん',dog:'わんわん',cat:'にゃーん',panda:'もぐもぐ',pig:'ぶーぶー',chick:'ぴよぴよ'};
SCN.zoo={bg:'#e8f8d8',song:'play',
  enter(){this.an=shuffle(Object.keys(ZFOOD)).slice(0,4).map(k=>({k,need:2,eat:0,shake:0,hop:0,love:0,happy:false}));this.foods=shuffle(Object.values(ZFOOD));this.dr=null;this.fin=0;this.round=1;this.lay();say('どうぶつに ごはんを あげよう！ みんな 2かい たべるよ');},
  lay(){this.an&&this.an.forEach((a,i)=>{a.x=i%2?440:160;a.y=i<2?H*.4:H*.68;});},
  fP(i){return{x:58+i*97,y:H-78};},
  update(dt){for(const a of this.an){if(a.eat>0){a.eat-=dt;if(a.eat<=0){a.need--;sfx('ding');burst(a.x,a.y-120,10,'heart');rkCheer();if(a.need<=0){say(WORDS[a.k][0]+'さん おなかいっぱい！');}this.check();}}if(a.shake>0)a.shake-=dt;if(a.hop>0)a.hop-=dt*2;}
    if(this.fin>0){this.fin+=dt;if(this.fin>2&&this.fin<9){this.fin=9;celebrate('zoo');}}},
  draw(c){skyBg(c,'#8fd8ff','#dff6ff',H*.22);c.fillStyle=vfill(c,H*.2,H,'#a8e07a',.05,-.08);c.fillRect(-400,H*.2,W+800,H);cloud(c,120,90,.7,true);cloud(c,470,70,.55);tree(c,40,H*.22,.8);tree(c,570,H*.22,.9,'#6cd07a');
    for(const y of[H*.2,H*.52]){c.fillStyle='#e8c090';for(let x=-20;x<W+20;x+=36){rr(c,x,y-4,14,44,6);c.fill();}c.fillRect(-20,y+6,W+40,8);c.fillRect(-20,y+26,W+40,8);}
    flowers(c,0,W,H*.24,H*.3,3);
    for(const a of this.an){c.fillStyle='rgba(255,255,255,.35)';ell(c,a.x,a.y+4,110,24);
      drawAnimal(c,a.k,a.x,a.y,1.25,{t:T+a.x,happy:a.need<=0&&this.round===1||a.happy,eat:a.eat,shake:a.shake,hop:a.hop,dance:a.happy});
      if(a.eat>0)drawItem(c,ZFOOD[a.k],a.x,a.y-86,.9);
      if(this.round===1&&a.need>0&&a.eat<=0){const bx=a.x+70,by=a.y-190+Math.sin(T*2+a.x)*4;c.fillStyle='#fff';c.strokeStyle='#d8d0e8';c.lineWidth=3;c.beginPath();c.arc(bx,by,36,0,TAU);c.fill();c.stroke();circ(c,bx-30,by+40,8);circ(c,bx-44,by+56,5);drawItem(c,ZFOOD[a.k],bx,by,1.05);c.fillStyle='#ff5fa2';c.font=`800 18px ${FONT}`;c.textAlign='center';c.fillText('×'+a.need,bx+28,by+30);}
      if(this.round===2&&!a.happy){c.fillStyle='#fff';rr(c,a.x-50,a.y+16,100,14,7);c.fill();c.fillStyle='#ff8cc0';rr(c,a.x-50,a.y+16,100*a.love,14,7);c.fill();}
      if(a.happy||a.need<=0&&this.round===1){c.fillStyle='#ff5fa2';heartP(c,a.x+60,a.y-170+Math.sin(T*4)*5,12);c.fill();}}
    drawRikki(c,300,H*.83,{sc:2,t:T,dance:this.fin>0});this.rkPos={x:300,y:H*.83,sc:2};
    if(this.round===1){tray(c,H-78,120);this.foods.forEach((k,i)=>{const p=this.fP(i);drawItem(c,k,p.x,p.y,1.25);});}
    else{drawFuka(c,90,H-30,{outfit:outfit(),t:T,dir:0,sc:2.4,happy:1,wave:1});c.fillStyle='#8a6a9a';c.font=`800 24px ${FONT}`;c.textAlign='center';c.fillText('ゆびで なでなで してね',W/2+40,H-60);}
    if(this.dr){c.save();c.translate(this.dr.x,this.dr.y-10);c.rotate(this.dr.rot||0);drawItem(c,this.dr.k,0,0,1.6);c.restore();}
    stepDots(c,2,this.round-1);},
  down(x,y){if(this.round===1)for(let i=0;i<this.foods.length;i++){const p=this.fP(i);if(hitC(x,y,p.x,p.y,48)&&this.fin<=0){this.dr={k:this.foods[i],x,y,lx:x,rot:0};sfx('tap');sayWord(this.foods[i]);return;}}
    for(const a of this.an)if(hitC(x,y,a.x,a.y-80,80)){if(this.round===2){this.pet={a,lx:x,ly:y};return;}a.hop=1;sfx('boing');hush();speak(ZSND[a.k]);speak(WORDS[a.k][0]);speak(WORDS[a.k][1],'en');card={k:a.k,ja:WORDS[a.k][0],en:WORDS[a.k][1],t:0};burst(a.x,a.y-150,6,'heart');return;}},
  move(x,y){if(this.dr){this.dr.rot=clamp((x-this.dr.lx)*.02,-.5,.5);this.dr.lx=x;this.dr.x=x;this.dr.y=y;}
    if(this.pet){const p=this.pet,a=p.a,d=Math.hypot(x-p.lx,y-p.ly);p.lx=x;p.ly=y;if(!a.happy&&hitC(x,y,a.x,a.y-80,100)){a.love=Math.min(1,a.love+d/500);if(Math.random()<.15){parts.push({x,y,vx:rand(-30,30),vy:-80,life:1,t:0,kind:'heart',col:'#ff8cc0',r:10});sfx('heart');}
      if(a.love>=1){a.happy=true;sfx('fanfare');rkCheer();hush();speak(ZSND[a.k]);speak('うれしい！');burst(a.x,a.y-120,20,'heart');this.check();}}}},
  up(x,y){this.pet=null;const d=this.dr;if(!d)return;this.dr=null;
    for(const a of this.an){if(!hitC(x,y,a.x,a.y-90,95))continue;if(a.need<=0||a.eat>0){say('もう おなかいっぱい！');return;}
      if(ZFOOD[a.k]===d.k){a.eat=1.4;sfx('munch');say(pick(['もぐもぐ おいしい！','おいしい〜！','ぱくぱく！']));}else{a.shake=.6;sfx('no');say('ちがうよ〜。 ほかの ごはんが いいな');}return;}},
  check(){if(this.round===1&&this.an.every(a=>a.need<=0)){this.round=2;sfx('fanfare');setTimeout(()=>say('みんな おなかいっぱい！ つぎは なでなで してあげよう'),600);}
    else if(this.round===2&&this.an.every(a=>a.happy)&&this.fin<=0){this.fin=.01;say('みんな だいすきって！ ありがとう！');}},
  hint(){if(this.fin>0)return null;if(this.round===1){const a=this.an.find(a=>a.need>0&&a.eat<=0);if(!a)return null;const i=this.foods.indexOf(ZFOOD[a.k]);const p=this.fP(i);return{x:p.x,y:p.y,x2:a.x,y2:a.y-90};}
    const a=this.an.find(a=>!a.happy);return a?{x:a.x-50,y:a.y-80,x2:a.x+50,y2:a.y-80}:null;},
  hintText(){return this.round===1?'ごはんを どうぶつまで ひっぱってね':'どうぶつを ゆびで なでなで してね';}};

// ================= letters school =================
const HIRA=[['あ','あひる','duck'],['い','いちご','strawberry'],['う','うさぎ','rabbit'],['お','おさかな','fish'],['く','くま','bear'],['ね','ねこ','cat'],['り','りんご','apple'],['に','にんじん','carrot'],['た','たまご','egg'],['ほ','ほね','bone'],['ぱ','ぱんだ','panda'],['け','けーき','cake'],['ぶ','ぶどう','grapes'],['ひ','ひよこ','chick']];
const ABC=[['A','apple','apple'],['B','banana','banana'],['C','cat','cat'],['D','dog','dog'],['E','egg','egg'],['F','fish','fish'],['G','grapes','grapes'],['M','milk','milk'],['P','panda','panda'],['R','rabbit','rabbit'],['S','star','starcandy'],['T','tomato','tomato']];
const NUMW=[['1','いち','one'],['2','に','two'],['3','さん','three'],['4','よん','four'],['5','ご','five'],['6','ろく','six'],['7','なな','seven'],['8','はち','eight'],['9','きゅう','nine']];
SCN.school={bg:'#fff6dc',song:'play',mode:'hira',
  enter(){this.round=0;this.prev=null;this.lay();this.next();},
  lay(){this.box={x:100,y:H*.5-200,s:400};if(this.cur)this.build();},
  set(){return this.mode==='hira'?HIRA:this.mode==='abc'?ABC:NUMW;},
  next(){let cur;do cur=pick(this.set());while(cur===this.prev);this.prev=this.cur=cur;this.ok=0;this.phase='trace';this.quiz=null;this.build();this.countItem=pick(['apple','strawberry','starcandy','duck','carrot']);
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
    if(this.quiz){this.quiz.st+=dt;if(this.quiz.okT>0){this.quiz.okT+=dt;if(this.quiz.okT>2.2){this.quiz=null;this.round++;if(this.round>=3)celebrate('school');else this.next();}}}},
  draw(c){const b=this.box;c.fillStyle='#fff0c8';c.fillRect(-400,0,W+800,H);c.fillStyle='#ffe4a0';for(let y=0;y<H;y+=44)c.fillRect(-400,y,W+800,3);
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
  down(x,y){for(const [m,xx] of [['hira',180],['abc',330],['num',480]])if(hitC(x,y,xx,180,64)&&this.mode!==m){this.mode=m;sfx('tap');this.round=0;this.next();return;}
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
  hint(){if(this.phase==='quiz'){const i=this.quiz.opts.findIndex(o=>o.ok);const p=this.qP(i);return this.quiz.st>6?{x:p.x,y:p.y}:null;}if(this.ok)return null;const p=this.pts.find(p=>!p.hit);return p?{x:p.x+6,y:p.y+6}:null;},
  hintText(){return this.phase==='quiz'?'ただしい えを タッチしてね':'ゆびで もじを なぞってね';}};

// ================= festival (goldfish + fireworks) =================
SCN.festival={bg:'#2a1a4a',song:'matsuri',
  enter(){this.phase='fish';this.caught=0;this.fin=0;this.fw=0;this.rockets=[];this.lay();const cols=['#ff5a3a','#ff7a2a','#ff5a3a','#2a2a3a','#ff8a5a','#ffffff','#ff5a3a'];
    this.fish=cols.map(col=>({x:this.px+rand(-160,160),y:this.py+rand(-100,100),a:rand(0,TAU),v:rand(40,70),col,flee:0,got:false}));this.poi={x:0,y:0,held:false,wet:0,torn:0};this.bowl=[];
    say('きんぎょすくい！ ポイを みずに いれて、きんぎょの ちかくで ゆびを はなすと すくえるよ');},
  lay(){this.px=300;this.py=H*.5;this.rx=240;this.ry=170;},
  inPool(x,y,m=0){return((x-this.px)/(this.rx-m))**2+((y-this.py)/(this.ry-m))**2<=1;},
  update(dt){const po=this.poi;
    for(const f of this.fish){if(f.got)continue;if(f.flee>0)f.flee-=dt;
      if(po.held&&this.inPool(po.x,po.y)&&Math.hypot(po.x-f.x,po.y-f.y)<90&&po.speed>500){f.a=Math.atan2(f.y-po.y,f.x-po.x);f.flee=.5;}
      f.a+=Math.sin(T*.7+f.v)*dt*.8;const sp=f.flee>0?f.v*3:f.v;f.x+=Math.cos(f.a)*sp*dt;f.y+=Math.sin(f.a)*sp*dt*.8;
      if(!this.inPool(f.x,f.y,40)){f.a=Math.atan2(this.py-f.y,this.px-f.x)+rand(-.5,.5);}}
    if(po.held&&this.inPool(po.x,po.y)&&!po.torn){po.wet+=dt;if(Math.random()<dt*3)ring(po.x,po.y,'rgba(255,255,255,.7)');if(po.wet>6){po.torn=1;sfx('rip');say('やぶれちゃった！ あたらしい ポイだよ');setTimeout(()=>{if(scene===this){po.torn=0;po.wet=0;}},1200);}}
    for(const b of this.bowl)b.t+=dt;
    for(let i=this.rockets.length-1;i>=0;i--){const r=this.rockets[i];r.y-=520*dt;if(Math.random()<.8)parts.push({x:r.x+rand(-2,2),y:r.y+10,vx:0,vy:40,life:.4,t:0,kind:'dot',col:'#ffe0a0',r:5});
      if(r.y<=r.ty){this.rockets.splice(i,1);this.explode(r.x,r.ty);}}
    if(this.phase==='hanabi'&&this.fw>=8&&!this.fin){this.fin=.01;for(let i=0;i<6;i++)setTimeout(()=>{if(scene===this)this.launch(rand(100,500),rand(160,H*.4));},i*300);}
    if(this.fin>0){this.fin+=dt;if(this.fin>3.5&&this.fin<9){this.fin=9;celebrate('festival');}}},
  launch(x,ty){this.rockets.push({x,y:H*.75,ty});sfx('launch');},
  explode(x,y){sfx('boom');const col=pick(['#ff5f9a','#ffd23a','#5ad0ff','#8ef0b0','#b88aff','#ff8a3a']),col2=pick(['#fff','#ffe0f0','#fff6c0']);const n=46;for(let i=0;i<n;i++){const a=i/n*TAU,s=rand(160,240);parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1.4,t:0,kind:'fw',col:i%3?col:col2,r:4});}
    if(Math.random()<.5)for(let i=0;i<14;i++){const a=i/14*TAU;parts.push({x,y,vx:Math.cos(a)*90,vy:Math.sin(a)*90,life:1.2,t:0,kind:'fw',col:'#fff',r:3});}this.fw++;rkCheer();if(this.fw===3)say('きれい〜！ たまや〜！');},
  draw(c){const night=this.phase==='hanabi';const g=c.createLinearGradient(0,0,0,H*.5);g.addColorStop(0,night?'#0e0a2a':'#4a2a7a');g.addColorStop(1,night?'#2a1a5a':'#ff9a6a');c.fillStyle=g;c.fillRect(-400,0,W+800,H*.5);
    if(night){c.fillStyle='#fff';for(let i=0;i<30;i++)circ(c,(i*97)%W,(i*53)%(H*.4),1.2+((i+Math.floor(T*2))%3===0?1:0));}
    c.fillStyle='#3a2a2a';c.fillRect(-400,H*.28,W+800,6);c.strokeStyle='#3a2a2a';c.lineWidth=2;c.beginPath();c.moveTo(-10,H*.1);c.quadraticCurveTo(W/2,H*.2,W+10,H*.1);c.stroke();
    for(let i=0;i<7;i++){const lx=20+i*93,ly=H*.1+Math.sin(i/6*Math.PI)*H*.07+10;c.fillStyle='rgba(255,210,120,.3)';circ(c,lx,ly+18,26);c.fillStyle=gfill(c,lx,ly+16,18,i%2?'#ff4a3a':'#fff6e0');ell(c,lx,ly+18,15,19);c.fillStyle='#2a1a1a';c.fillRect(lx-9,ly-2,18,4);c.fillRect(lx-9,ly+36,18,4);c.strokeStyle='rgba(0,0,0,.2)';c.lineWidth=1;for(let k=-2;k<=2;k++){c.beginPath();c.moveTo(lx-14,ly+18+k*6);c.lineTo(lx+14,ly+18+k*6);c.stroke();}}
    c.fillStyle=vfill(c,H*.3,H,'#5a3a2a',.1,-.2);c.fillRect(-400,H*.3,W+800,H);
    if(!night){for(let i=0;i<8;i++){c.fillStyle=i%2?'#fff':'#ff4a5a';c.fillRect(i*75,H*.3,75,40);}c.fillStyle='#fff';rr(c,180,H*.3+44,240,50,20);c.fill();c.fillStyle='#ff4a5a';c.font=`800 28px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('きんぎょすくい',300,H*.3+69);}
    if(!night){c.fillStyle='#3a88d8';ell(c,this.px,this.py+14,this.rx+18,this.ry+22);const wg=c.createRadialGradient(this.px-60,this.py-60,20,this.px,this.py,this.rx);wg.addColorStop(0,'#bfeaff');wg.addColorStop(1,'#5ab8f0');c.fillStyle=wg;ell(c,this.px,this.py,this.rx,this.ry);
      c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=3;for(let i=0;i<5;i++){c.beginPath();c.ellipse(this.px+Math.sin(T+i)*40,this.py+Math.cos(T*.8+i)*30,60+i*20,14+i*4,0,0,Math.PI);c.stroke();}
      for(const f of this.fish){if(f.got)continue;c.save();c.translate(f.x,f.y);c.rotate(f.a+Math.PI);this.drawFish(c,f.col);c.restore();}
      const po=this.poi;if(po.held){c.save();c.translate(po.x,po.y);if(po.torn){c.strokeStyle='#ff8cc0';c.lineWidth=5;c.beginPath();c.arc(0,0,22,0,TAU);c.stroke();c.fillStyle='rgba(255,255,255,.6)';c.beginPath();c.moveTo(-18,-8);c.lineTo(-4,4);c.lineTo(-16,12);c.fill();}else{c.globalAlpha=1-Math.min(.5,po.wet/12);drawItem(c,'poi',0,0,1.3);c.globalAlpha=1;}c.restore();}
      else{drawItem(c,'poi',90,H-110,1.4);c.fillStyle='#fff';c.font=`800 18px ${FONT}`;c.textAlign='center';c.fillText('ポイ',90,H-40);}
      c.fillStyle='rgba(200,235,255,.5)';c.strokeStyle='#fff';c.lineWidth=4;c.beginPath();c.arc(490,H-110,62,0,TAU);c.fill();c.stroke();for(const b of this.bowl){c.save();c.translate(490+Math.cos(b.t*.8+b.o)*28,H-100+Math.sin(b.t*1.1+b.o)*20);c.rotate(b.t+b.o);c.scale(.6,.6);this.drawFish(c,b.col);c.restore();}
      c.fillStyle='#fff';c.font=`800 24px ${FONT}`;c.textAlign='center';c.fillText(`${this.caught} / 5`,490,H-20);}
    else{drawFuka(c,200,H*.82,{outfit:outfit({item:'uchiwa'}),t:T,dir:3,sc:3.4});drawRikki(c,330,H*.84,{sc:2.8,t:T,clap:RK.clap});this.rkPos={x:330,y:H*.84,sc:2.8};c.fillStyle='rgba(255,255,255,.8)';c.font=`800 24px ${FONT}`;c.textAlign='center';c.fillText(`はなび ${Math.min(8,this.fw)} / 8`,W/2,H*.62);}
    for(const r of this.rockets){c.fillStyle='#ffe0a0';circ(c,r.x,r.y,4);}
    if(!night){drawFuka(c,215,H-18,{outfit:outfit({item:'kakigori'}),t:T,dir:0,sc:2.1,happy:this.caught>0});drawRikki(c,320,H-18,{sc:1.8,t:T,clap:RK.clap});this.rkPos={x:320,y:H-18,sc:1.8};}
    stepDots(c,2,night?1:0);},
  drawFish(c,col){const w=Math.sin(T*10)*.25;c.fillStyle=col;c.strokeStyle=shade(col==='#ffffff'?'#e0e0e8':col,-.3);c.lineWidth=2;c.save();c.translate(18,0);c.rotate(w);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(14,-16,22,-10);c.quadraticCurveTo(14,0,22,10);c.quadraticCurveTo(14,16,0,0);c.globalAlpha=.85;c.fill();c.stroke();c.restore();c.globalAlpha=1;
    c.fillStyle=gfill(c,0,-2,20,col);c.beginPath();c.ellipse(0,0,20,12,0,0,TAU);c.fill();c.stroke();if(col==='#ffffff'){c.fillStyle='#ff5a3a';circ(c,4,-3,6);}c.fillStyle='#fff';circ(c,-11,-3,4);c.fillStyle='#1a1a1a';circ(c,-12,-3,2.3);},
  down(x,y){if(this.phase==='hanabi'){if(y<H*.6&&this.fw<8){this.launch(x,Math.max(120,y));}return;}
    const po=this.poi;if(po.torn)return;po.held=true;po.x=x;po.y=y;po.lx=x;po.ly=y;po.lt=performance.now();po.speed=0;sfx('tap');},
  move(x,y){const po=this.poi;if(!po.held)return;const now=performance.now();const d=Math.hypot(x-po.lx,y-po.ly),dt=Math.max(1,now-po.lt)/1000;po.speed=d/dt;po.x=x;po.y=y;po.lx=x;po.ly=y;po.lt=now;if(this.inPool(x,y)&&Math.random()<.05)sfx('water');},
  up(x,y){const po=this.poi;if(!po.held)return;po.held=false;if(po.torn||!this.inPool(x,y))return;
    let best=null,bd=60;for(const f of this.fish){if(f.got)continue;const d=Math.hypot(f.x-x,f.y-y);if(d<bd){bd=d;best=f;}}
    if(best){best.got=true;this.caught++;this.bowl.push({col:best.col,t:0,o:rand(0,6)});sfx('splash');drops(x,y,10,'#bfeaff');burst(x,y,10,'star');rkCheer();say(pick(['すくえた！','やったー！','じょうず！']));sayWord('goldfish');
      if(this.caught>=5){setTimeout(()=>{if(scene!==this)return;this.phase='hanabi';sfx('fanfare');say('きんぎょ いっぱい！ よるに なったよ。 そらを タッチして はなびを あげよう！');},1500);}}
    else{sfx('splash');drops(x,y,6,'#bfeaff');}},
  hint(){if(this.fin>0)return null;if(this.phase==='hanabi')return{x:W/2,y:H*.3};const f=this.fish.find(f=>!f.got);return f?{x:f.x,y:f.y}:null;},
  hintText(){return this.phase==='hanabi'?'そらを タッチしてね':'きんぎょの うえで ゆびを はなしてね';}};

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
SCN.nurie={bg:'#fff8e8',song:'play',
  enter(){this.phase='pick';this.sel=6;this.fin=0;this.said={};this.lay();say('どの えを ぬろうかな？');},
  lay(){this.ox=60;this.oy=Math.max(150,H*.47-260);this.sc=1;},
  pickP(i){return{x:110+i*190,y:H*.45};},
  palP(i){return{x:55+(i%6)*98,y:i<6?H-150:H-66};},
  start(i){this.pic=PICS[i];this.regs=this.pic.make().map(p=>({p,col:null,t:0}));this.phase='paint';sfx('pop');say(`${this.pic.name}を ぬろう！ いろを えらんで タッチしてね`);},
  update(dt){for(const r of this.regs||[])if(r.t<1)r.t=Math.min(1,r.t+dt*4);if(this.fin>0){this.fin+=dt;if(this.fin>2.6&&this.fin<9){this.fin=9;celebrate('nurie');}}},
  drawPic(c,regs,x,y,s,thumb,exCols){c.save();c.translate(x,y);c.scale(s,s);c.save();rr(c,0,0,480,480,24);c.clip();c.fillStyle='#fff';c.fillRect(0,0,480,480);
    regs.forEach((r,i)=>{const col=exCols?exCols[i]:r.col;if(col){c.fillStyle=col;c.globalAlpha=exCols?1:ease(r.t);c.fill(r.p);c.globalAlpha=1;}});
    c.strokeStyle='#4a3a4a';c.lineWidth=5;c.lineJoin='round';regs.forEach(r=>c.stroke(r.p));c.restore();c.strokeStyle='#e8c8a8';c.lineWidth=10;rr(c,0,0,480,480,24);c.stroke();c.restore();},
  draw(c){c.fillStyle='#fff3dc';c.fillRect(-400,0,W+800,H);c.fillStyle='#ffe8c0';for(let x=-400;x<W+400;x+=40)c.fillRect(x,0,20,H);
    if(this.phase==='pick'){titleText(c,'どれに する？',W/2,H*.25,40,'#ff8c3a');PICS.forEach((p,i)=>{const q=this.pickP(i);const regs=p.make().map(pp=>({p:pp}));c.fillStyle='rgba(90,40,110,.15)';rr(c,q.x-84,q.y-80,172,172,20);c.fill();this.drawPic(c,regs,q.x-80,q.y-86,1/3,true,p.ex);c.fillStyle='#8a5a3a';c.font=`800 24px ${FONT}`;c.textAlign='center';c.fillText(p.name,q.x,q.y+110);});
      drawFuka(c,160,H-40,{outfit:outfit(),t:T,dir:0,sc:2.8,point:1});drawRikki(c,440,H-40,{sc:2.3,t:T});this.rkPos={x:440,y:H-40,sc:2.3};return;}
    const k=this.fin>0?1+Math.sin(Math.min(1,this.fin)*Math.PI)*.05:1;this.drawPic(c,this.regs,this.ox-(k-1)*240,this.oy-(k-1)*240,k);
    tray(c,H-108,190);NCOLS.forEach((col,i)=>{const p=this.palP(i);const sel=this.sel===i;c.fillStyle='rgba(90,40,110,.15)';circ(c,p.x+2,p.y+4,34);c.fillStyle=gfill(c,p.x,p.y,34,col[0]==='#ffffff'?'#f6f6ff':col[0]);circ(c,p.x,p.y,sel?38:31);c.strokeStyle=sel?'#ff5fa2':'#eee';c.lineWidth=sel?6:3;c.beginPath();c.arc(p.x,p.y,sel?38:31,0,TAU);c.stroke();if(sel)drawItem(c,'crayon',p.x+26,p.y-26,.7);});
    const left=this.regs.filter(r=>!r.col).length;if(left===0&&this.fin<=0)drawBtn(c,530,this.oy+440,44,'#4cd08a','check',true);
    else if(this.fin<=0){c.fillStyle='#8a6a5a';c.font=`800 20px ${FONT}`;c.textAlign='center';c.fillText(`のこり ${left}`,530,this.oy+500);}
    drawRikki(c,60,this.oy+520,{sc:1.6,t:T,clap:RK.clap});this.rkPos={x:60,y:this.oy+520,sc:1.6};},
  down(x,y){if(this.phase==='pick'){PICS.forEach((p,i)=>{const q=this.pickP(i);if(Math.abs(x-q.x)<90&&Math.abs(y-q.y)<100)this.start(i);});return;}if(this.fin>0)return;
    for(let i=0;i<NCOLS.length;i++){const p=this.palP(i);if(hitC(x,y,p.x,p.y,42)){this.sel=i;sfx('tap');const col=NCOLS[i];sayPair(col[1],col[2]);return;}}
    if(this.regs.every(r=>r.col)&&hitC(x,y,530,this.oy+440,50)){this.fin=.01;sfx('fanfare');rkCheer();confetti(40);say('すてきな えが できたね！');return;}
    const px=(x-this.ox)/this.sc,py=(y-this.oy)/this.sc;if(px<0||py<0||px>480||py>480)return;
    const HC=this.hc||(this.hc=document.createElement('canvas').getContext('2d'));for(let i=this.regs.length-1;i>=0;i--){if(HC.isPointInPath(this.regs[i].p,px,py)){const r=this.regs[i];r.col=NCOLS[this.sel][0];r.t=0;sfx('pop');burst(x,y,6,'star');if(this.regs.every(q=>q.col))setTimeout(()=>say('ぜんぶ ぬれたね！ みどりの ボタンを おしてね'),500);return;}}},
  hint(){if(this.phase==='pick'){const q=this.pickP(0);return{x:q.x,y:q.y};}if(this.fin>0)return null;const r=this.regs.findIndex(r=>!r.col);if(r<0)return{x:530,y:this.oy+440};return null;},
  hintText(){return this.phase==='pick'?'すきな えを タッチしてね':'いろを えらんで、 えの なかを タッチしてね';}};

// ================= puzzle =================
function makePuzzlePic(i){const S=420,oc=document.createElement('canvas');oc.width=oc.height=S;const c=oc.getContext('2d');
  const g=c.createLinearGradient(0,0,0,S);g.addColorStop(0,i===2?'#ffe0f0':'#8fd8ff');g.addColorStop(.6,i===2?'#fff0f8':'#dff6ff');g.addColorStop(.6,i===2?'#f0c090':'#8ad86a');g.addColorStop(1,i===2?'#e0a070':'#6cc05a');c.fillStyle=g;c.fillRect(0,0,S,S);
  const saveT=T;
  if(i===0){sun(c,340,70,32,0);cloud(c,110,80,.7,true);tree(c,60,260,.9);flowers(c,0,S,280,400,5);drawFuka(c,160,370,{outfit:OUTFIT0,t:0,dir:0,sc:4,wave:1});drawRikki(c,300,370,{sc:3,t:0,happy:1});}
  else if(i===1){cloud(c,320,70,.8,true);for(const [k,x] of [['bear',100],['rabbit',210],['panda',320]])drawAnimal(c,k,x,360,.95,{t:0,happy:1});c.strokeStyle='#8a7a9a';c.lineWidth=2;for(const [x,col] of [[60,'#ff6f91'],[370,'#ffd23a']]){c.beginPath();c.moveTo(x,180);c.lineTo(x+10,260);c.stroke();c.fillStyle=col;ell(c,x,150,26,32);}}
  else{c.fillStyle='#fff';ell(c,210,330,170,40);drawItem(c,'cake',210,250,3.6);drawItem(c,'strawberry',70,340,1.4);drawItem(c,'heartcookie',350,340,1.4);drawItem(c,'starcandy',80,90,1.3);drawItem(c,'starcandy',340,70,1.1);drawItem(c,'candle',210,110,1.5);}
  return oc;}
SCN.puzzle={bg:'#e8f6ff',song:'play',
  enter(){this.round=0;this.fin=0;this.pics=[0,1,2].map(makePuzzlePic);this.lay();this.setup();},
  lay(){this.bx=90;this.by=150;this.bs=420;},
  setup(){const [cols,rows]=[[2,2],[3,2],[3,3]][this.round];this.cols=cols;this.rows=rows;this.img=this.pics[this.round];this.done=0;const pw=this.bs/cols,ph=this.bs/rows;this.pieces=[];
    const ty0=this.by+this.bs+30,ty1=H-30;const n=cols*rows;const slots=[];const perRow=Math.min(n,3+(n>6?1:0));for(let k=0;k<n;k++){const r=Math.floor(k/perRow),cN=Math.min(perRow,n-r*perRow);slots.push({x:W/2-(cN-1)*70+(k%perRow)*140,y:ty0+60+r*Math.min(120,(ty1-ty0-60)/Math.ceil(n/perRow))});}
    const sl=shuffle(slots);let k=0;for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const s=sl[k++];this.pieces.push({i,j,w:pw,h:ph,tx:this.bx+i*pw+pw/2,ty:this.by+j*ph+ph/2,hx:s.x+rand(-10,10),hy:s.y+rand(-8,8),x:s.x,y:s.y,s:.5,placed:false,held:false,rot:rand(-.2,.2)});}
    this.dr=null;say(['パズル！ ピースを うえの ばしょに はめてね','つぎは 6まい！','さいごは 9まい！ がんばれ！'][this.round]);},
  update(dt){for(const p of this.pieces){if(!p.held&&!p.placed){p.x+=(p.hx-p.x)*Math.min(1,dt*10);p.y+=(p.hy-p.y)*Math.min(1,dt*10);}const ts=p.held||p.placed?1:.5;p.s+=(ts-p.s)*Math.min(1,dt*12);if(p.placed){p.x+=(p.tx-p.x)*Math.min(1,dt*16);p.y+=(p.ty-p.y)*Math.min(1,dt*16);p.rot*=.8;}}
    if(this.done>0){this.done+=dt;if(this.done>2.4&&this.done<9){this.done=9;this.round++;if(this.round>=3)celebrate('puzzle');else this.setup();}}},
  drawPiece(c,p){c.save();c.translate(p.x,p.y);c.rotate(p.held?0:p.rot);c.scale(p.s,p.s);if(!p.placed){c.fillStyle='rgba(60,40,90,.25)';rr(c,-p.w/2+5,-p.h/2+8,p.w,p.h,14);c.fill();}
    c.save();rr(c,-p.w/2,-p.h/2,p.w,p.h,p.placed?0:14);c.clip();c.drawImage(this.img,p.i*p.w,p.j*p.h,p.w,p.h,-p.w/2,-p.h/2,p.w,p.h);c.restore();if(!p.placed){c.strokeStyle='#fff';c.lineWidth=6;rr(c,-p.w/2,-p.h/2,p.w,p.h,14);c.stroke();}c.restore();},
  draw(c){c.fillStyle='#dff0ff';c.fillRect(-400,0,W+800,H);c.fillStyle='rgba(255,255,255,.4)';for(let i=0;i<10;i++){drawItem(c,'puzzle',(i*137)%W,(i*211)%H,.8);}
    c.fillStyle='rgba(60,40,90,.15)';rr(c,this.bx-10,this.by-4,this.bs+20,this.bs+20,20);c.fill();c.fillStyle='#fff';rr(c,this.bx-10,this.by-10,this.bs+20,this.bs+20,20);c.fill();
    c.globalAlpha=.2;c.drawImage(this.img,this.bx,this.by);c.globalAlpha=1;c.strokeStyle='rgba(90,130,200,.35)';c.lineWidth=2;c.setLineDash([8,6]);for(let i=1;i<this.cols;i++){c.beginPath();c.moveTo(this.bx+i*this.bs/this.cols,this.by);c.lineTo(this.bx+i*this.bs/this.cols,this.by+this.bs);c.stroke();}for(let j=1;j<this.rows;j++){c.beginPath();c.moveTo(this.bx,this.by+j*this.bs/this.rows);c.lineTo(this.bx+this.bs,this.by+j*this.bs/this.rows);c.stroke();}c.setLineDash([]);
    for(const p of this.pieces)if(p.placed)this.drawPiece(c,p);if(this.done>0){c.fillStyle=`rgba(255,255,255,${Math.max(0,.6-this.done)})`;c.fillRect(this.bx,this.by,this.bs,this.bs);}
    for(const p of this.pieces)if(!p.placed&&!p.held)this.drawPiece(c,p);for(const p of this.pieces)if(p.held)this.drawPiece(c,p);
    drawRikki(c,40,this.by+this.bs+10,{sc:1.4,t:T,clap:RK.clap});this.rkPos={x:40,y:this.by+this.bs+10,sc:1.4};
    stepDots(c,3,this.round);},
  down(x,y){if(this.done>0)return;for(let i=this.pieces.length-1;i>=0;i--){const p=this.pieces[i];if(p.placed)continue;if(Math.abs(x-p.x)<p.w*p.s/2+10&&Math.abs(y-p.y)<p.h*p.s/2+10){p.held=true;this.dr=p;p.ox=x-p.x;p.oy=y-p.y;this.pieces.splice(i,1);this.pieces.push(p);sfx('tap');return;}}},
  move(x,y){const p=this.dr;if(p){p.x=x-p.ox*.5;p.y=y-p.oy*.5;}},
  up(x,y){const p=this.dr;if(!p)return;this.dr=null;p.held=false;if(Math.hypot(p.x-p.tx,p.y-p.ty)<70){p.placed=true;sfx('snap');burst(p.tx,p.ty,10,'star');rkCheer();
      if(this.pieces.every(q=>q.placed)){this.done=.01;sfx('fanfare');say(pick(['できた！ すごーい！','かんせい！ じょうず！']));confetti(30);}}else sfx('whoosh');},
  hint(){if(this.done>0)return null;const p=this.pieces.find(q=>!q.placed);return p?{x:p.hx,y:p.hy,x2:p.tx,y2:p.ty}:null;},
  hintText(){return 'ピースを おなじ えの ばしょに はめてね';}};

// ================= music (xylophone) =================
const XNOTES=[60,62,64,65,67,69,71,72],XLAB=['ど','れ','み','ふぁ','そ','ら','し','ど'],XCOL=['#ff5a6a','#ff9a3a','#ffd84a','#6cd08a','#3cc8d8','#5aa8ff','#a86aff','#ff6fb8'];
const XSONGS=[{name:'きらきらぼし',icon:'starcandy',seq:[0,0,4,4,5,5,4,3,3,2,2,1,1,0]},{name:'かえるのうた',icon:'frog',seq:[0,1,2,3,2,1,0,2,3,4,5,4,3,2]},{name:'チューリップ',icon:'flower',seq:[0,1,2,0,1,2,4,2,1,0,1,2,1]}];
SCN.music={bg:'#fbe8ff',song:null,
  enter(){this.song=null;this.si=-1;this.pos=0;this.fin=0;this.hitT=new Array(8).fill(0);this.dance=0;this.last=-1;this.lay();this.songDone=0;say('もっきんを たたいて みよう！ うえの ボタンで きょくも ひけるよ');},
  lay(){this.top=H*.44;},
  barR(i){const w=62,x=30+i*69,h=300-i*20,y=this.top+(300-h)/2;return{x,y,w,h};},
  songP(i){return{x:150+i*150,y:170};},
  play(i){const m=XNOTES[i];tone(mtof(m+12),1.1,'sine',.32,0,0,MG,.002);tone(mtof(m+24),.35,'triangle',.12,0,0,MG,.002);tone(mtof(m+31),.15,'sine',.05);this.hitT[i]=1;this.dance=1.2;const r=this.barR(i);parts.push({x:r.x+r.w/2,y:r.y-10,vx:rand(-40,40),vy:-160,life:1.2,t:0,kind:'note',col:XCOL[i],r:14});
    if(this.si>=0){const seq=XSONGS[this.si].seq;if(seq[this.pos]===i){this.pos++;if(this.pos>=seq.length){this.pos=0;this.songDone++;sfx('fanfare');rkCheer();confetti(40);say('じょうずに ひけたね！');if(!this.fin){this.fin=.01;}}}}},
  update(dt){for(let i=0;i<8;i++)if(this.hitT[i]>0)this.hitT[i]-=dt*3;if(this.dance>0)this.dance-=dt;if(this.fin>0){this.fin+=dt;if(this.fin>2.5&&this.fin<9){this.fin=9;celebrate('music');}}},
  draw(c){c.fillStyle=vfill(c,0,H,'#fbe8ff',.2,-.05);c.fillRect(-400,0,W+800,H);c.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<8;i++){c.font=`${30+i*4}px ${POP}`;c.fillText('♪',(i*83+T*10)%W,(i*131)%(H*.4)+60);}
    XSONGS.forEach((s,i)=>{const p=this.songP(i),sel=this.si===i;c.fillStyle=sel?'#d86ae8':'#fff';rr(c,p.x-66,p.y-34,132,68,34);c.fill();c.strokeStyle='#d86ae8';c.lineWidth=4;c.stroke();
      if(s.icon==='frog'){c.fillStyle='#6cd08a';circ(c,p.x-40,p.y,18);c.fillStyle='#fff';circ(c,p.x-47,p.y-12,6);circ(c,p.x-33,p.y-12,6);c.fillStyle='#222';circ(c,p.x-47,p.y-12,3);circ(c,p.x-33,p.y-12,3);}else if(s.icon==='flower'){c.save();c.translate(p.x-40,p.y+12);c.scale(2.4,2.4);handItem(c,'flower',0,0,0);c.restore();}else drawItem(c,'starcandy',p.x-40,p.y,.8);
      c.fillStyle=sel?'#fff':'#a84ac8';c.font=`800 15px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(s.name,p.x+14,p.y);});
    const bandY=this.top-50;const dz=this.dance>0;drawAnimal(c,'bear',110,bandY,.75,{t:T,dance:dz});drawAnimal(c,'rabbit',300,bandY-10,.75,{t:T+1,dance:dz});drawAnimal(c,'cat',490,bandY,.75,{t:T+2,dance:dz});
    c.fillStyle='#c89060';rr(c,20,this.top+120,560,26,10);c.fill();
    for(let i=0;i<8;i++){const r=this.barR(i),h=this.hitT[i]>0?this.hitT[i]:0;c.save();c.translate(0,h*8);c.fillStyle='rgba(90,40,110,.2)';rr(c,r.x+4,r.y+8,r.w,r.h,14);c.fill();c.fillStyle=vfill(c,r.y,r.y+r.h,XCOL[i],.25,-.12);rr(c,r.x,r.y,r.w,r.h,14);c.fill();c.fillStyle='rgba(255,255,255,.35)';rr(c,r.x+8,r.y+8,10,r.h-16,5);c.fill();
      c.fillStyle='#fff';circ(c,r.x+r.w/2,r.y+18,5);circ(c,r.x+r.w/2,r.y+r.h-18,5);c.fillStyle='#fff';c.font=`800 26px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(XLAB[i],r.x+r.w/2,r.y+r.h/2);
      if(this.si>=0&&XSONGS[this.si].seq[this.pos]===i){c.strokeStyle='#fff';c.lineWidth=6;rr(c,r.x-4,r.y-4,r.w+8,r.h+8,16);c.stroke();c.fillStyle='#ffd23a';star(c,r.x+r.w/2,r.y-30-Math.abs(Math.sin(T*6))*14,18,8);c.fill();}c.restore();}
    if(this.si>=0){const seq=XSONGS[this.si].seq;const y=this.top+340;seq.forEach((n,k)=>{const x=W/2-(seq.length-1)*19+k*38;c.fillStyle=k<this.pos?XCOL[n]:'#fff';circ(c,x,y,15);c.strokeStyle=XCOL[n];c.lineWidth=3;c.beginPath();c.arc(x,y,15,0,TAU);c.stroke();c.fillStyle=k<this.pos?'#fff':XCOL[n];c.font=`800 13px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(XLAB[n],x,y+1);});}
    drawFuka(c,120,H-30,{outfit:outfit(),t:T,dir:0,sc:2.6,dance:dz});drawRikki(c,470,H-30,{sc:2.3,t:T,dance:dz});this.rkPos={x:470,y:H-30,sc:2.3};},
  barAt(x,y){for(let i=0;i<8;i++){const r=this.barR(i);if(x>r.x-3&&x<r.x+r.w+3&&y>r.y-10&&y<r.y+r.h+10)return i;}return -1;},
  down(x,y){for(let i=0;i<3;i++){const p=this.songP(i);if(Math.abs(x-p.x)<70&&Math.abs(y-p.y)<36){if(this.si===i){this.si=-1;say('じゆうに ひいてね');}else{this.si=i;this.pos=0;say(`${XSONGS[i].name}！ ひかっている ところを たたいてね`);}sfx('tap');return;}}
    const b=this.barAt(x,y);if(b>=0){this.play(b);this.last=b;this.down2=true;}},
  move(x,y){if(!this.down2)return;const b=this.barAt(x,y);if(b>=0&&b!==this.last){this.play(b);this.last=b;}},
  up(){this.down2=false;this.last=-1;},
  hint(){if(this.si<0){const p=this.songP(0);return{x:p.x,y:p.y};}const r=this.barR(XSONGS[this.si].seq[this.pos]);return{x:r.x+r.w/2,y:r.y+r.h/2};},
  hintText(){return this.si<0?'うえの ボタンで きょくを えらんでね':'ひかっている ところを たたいてね';}};

// ================= brush (dentist) =================
SCN.brush={bg:'#e8fff4',song:'play',
  enter(){this.step=0;this.fin=0;this.lay();this.foam=[];this.rinse=0;
    this.dirt=[];const kinds=['food','food','germ','germ','germ','food','cav','cav','germ','food'];kinds.forEach((k,i)=>{const top=i%2===0;const ti=i%6;this.dirt.push({kind:k,tx:ti,top,hp:k==='cav'?1.6:1,ph:rand(0,6),dx:0,dy:0});});
    this.tools=['toothbrush','cup'].map((k,i)=>new Dr({k,hx:200+i*200,hy:H-80,r:58}));this.dr=null;say('かばさんの はを みがいて あげよう！ はぶらしで ごしごし！');},
  lay(){this.mx=300;this.my=H*.46;if(this.tools)this.tools.forEach((t,i)=>{t.hx=200+i*200;t.hy=H-80;});},
  tooth(i,top){const x=this.mx-175+i*70,y=top?this.my-95:this.my+95;return{x,y};},
  dpos(d){const t=this.tooth(d.tx,d.top);return{x:t.x+d.dx+(d.kind==='germ'?Math.sin(T*3+d.ph)*6:0),y:t.y+(d.top?10:-10)+d.dy};},
  update(dt){for(const t of this.tools)t.upd(dt);for(const f of this.foam)f.t+=dt;
    if(this.step===1&&this.rinse>0){this.rinse+=dt;if(Math.random()<dt*20)drops(this.mx+rand(-150,150),this.my,2,'#9fd8ff');if(this.rinse>1.6){this.rinse=0;this.foam=[];this.step=2;sfx('spark');rkCheer();say('ピカピカの はに なったね！ かばさん にっこり！');this.fin=.01;burst(this.mx,this.my,30,'star');}}
    if(this.fin>0){this.fin+=dt;if(this.fin>2.6&&this.fin<9){this.fin=9;celebrate('brush');}}},
  draw(c){c.fillStyle=vfill(c,0,H,'#e8fff4',.2,-.05);c.fillRect(-400,0,W+800,H);c.fillStyle='rgba(255,255,255,.6)';for(let i=0;i<6;i++)drawItem(c,'tooth',(i*113)%W+40,(i*97)%(H*.3)+60,.6);
    const mx=this.mx,my=this.my,col='#b8a8dc',happy=this.step>=2;
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
    if(this.rinse>0){c.fillStyle='rgba(160,220,255,.5)';c.beginPath();c.ellipse(mx,my,210*Math.min(1,this.rinse*2),130*Math.min(1,this.rinse*2),0,0,TAU);c.fill();}
    drawFuka(c,75,my+260,{outfit:outfit({acc:'nurse'}),t:T,dir:0,sc:2.3,happy,point:!happy});drawRikki(c,530,my+260,{sc:1.9,t:T,happy});this.rkPos={x:530,y:my+260,sc:1.9};
    tray(c,H-80,120);this.tools.forEach((t,i)=>{if(t.held)return;c.globalAlpha=i===this.step?1:.35;t.draw(c,1.4);c.globalAlpha=1;});for(const t of this.tools)if(t.held)t.draw(c,1.6);stepDots(c,3,this.step);},
  down(x,y){if(this.fin>0)return;this.tools.forEach((t,i)=>{if(!this.dr&&t.hit(x,y)){if(i!==this.step){sfx('no');say(this.step===0?'まず はぶらしで みがこう':'コップで ぶくぶく しよう');return;}t.held=true;this.dr=t;t.lx=x;t.ly=y;sfx('tap');sayWord(t.k);}});
    if(!this.dr&&hitC(x,y,this.mx,this.my-200,120)){sfx('boing');say(pick(['あーん','かばさん だよ','はみがき だいすき！']));}},
  move(x,y){const t=this.dr;if(!t)return;const d=Math.hypot(x-t.lx,y-t.ly);t.x=x;t.y=y;t.lx=x;t.ly=y;
    if(t.k==='toothbrush'){const bx=x-18,by=y-24;let any=false;for(const dd of this.dirt){if(dd.hp<=0)continue;const p=this.dpos(dd);const dist=Math.hypot(p.x-bx,p.y-by);if(dd.kind==='germ'&&dist<90&&dist>40){dd.dx+=(p.x-bx)/dist*d*.15;dd.dx=clamp(dd.dx,-30,30);}if(dist<50){dd.hp-=d/220;any=true;if(dd.hp<=0){sfx('pop');burst(p.x,p.y,8,dd.kind==='germ'?'dot':'star');if(dd.kind==='germ')say(pick(['ばいきん やっつけた！','えいっ！']));}}}
      if(d>4&&Math.random()<.35&&Math.abs(y-this.my)<170){this.foam.push({x:bx+rand(-12,12),y:by+rand(-10,10),r:rand(6,12),t:0});if(this.foam.length>80)this.foam.shift();}if(any&&Math.random()<.3)sfx('brush');
      if(this.step===0&&this.dirt.every(q=>q.hp<=0)){this.step=1;sfx('fanfare');rkCheer();say('あわあわ！ コップの おみずで ぶくぶく しよう');}}},
  up(x,y){const t=this.dr;if(!t)return;this.dr=null;t.held=false;if(t.k==='cup'&&this.step===1&&Math.hypot(x-this.mx,y-this.my)<220&&!this.rinse){this.rinse=.01;sfx('splash');say('ぶくぶく〜 ぺっ！');}},
  hint(){if(this.fin>0)return null;if(this.step===0){const d=this.dirt.find(q=>q.hp>0);if(!d)return null;const p=this.dpos(d);return{x:this.tools[0].hx,y:this.tools[0].hy,x2:p.x+18,y2:p.y+24};}if(this.step===1&&!this.rinse)return{x:this.tools[1].hx,y:this.tools[1].hy,x2:this.mx,y2:this.my};return null;},
  hintText(){return this.step===0?'はぶらしで はの よごれを ごしごし':'コップを おくちに もっていってね';}};

// ================= sticker book =================
const PAGEBG=[['はらっぱ','meadow'],['うみ','sea'],['よぞら','night sky'],['おしろ','castle']];
function drawPageBg(c,i,x,y,w,h){c.save();rr(c,x,y,w,h,24);c.clip();
  if(i===0){c.fillStyle=vfill(c,y,y+h*.6,'#9fdcff',.2,0);c.fillRect(x,y,w,h);c.fillStyle='#9ee07a';c.beginPath();c.ellipse(x+w*.3,y+h*.7,w*.5,h*.25,0,0,TAU);c.fill();c.fillStyle='#8ad86a';c.fillRect(x,y+h*.72,w,h);cloud(c,x+w*.75,y+h*.18,.6,true);flowers(c,x,x+w,y+h*.78,y+h-10,11);}
  else if(i===1){c.fillStyle=vfill(c,y,y+h,'#5ac8f0',.2,-.15);c.fillRect(x,y,w,h);c.fillStyle='#f8e4b0';c.beginPath();c.moveTo(x,y+h*.85);c.quadraticCurveTo(x+w/2,y+h*.78,x+w,y+h*.85);c.lineTo(x+w,y+h);c.lineTo(x,y+h);c.fill();for(let k=0;k<8;k++){c.fillStyle='rgba(255,255,255,.4)';c.beginPath();c.arc(x+((k*71+T*15)%w),y+h-((k*53+T*30)%h),4+k%3*2,0,TAU);c.fill();}}
  else if(i===2){c.fillStyle=vfill(c,y,y+h,'#2a2a6a',0,.1);c.fillRect(x,y,w,h);c.fillStyle='#fff6b0';circ(c,x+w*.8,y+h*.18,28);c.fillStyle='#2a2a6a';circ(c,x+w*.8+12,y+h*.18-8,24);for(let k=0;k<25;k++){c.fillStyle='#fff';star(c,x+((k*97)%w),y+((k*61)%(h*.8)),2+((k+Math.floor(T*2))%4===0?2:0),1,4);c.fill();}}
  else{c.fillStyle=vfill(c,y,y+h,'#ffe6f4',.1,0);c.fillRect(x,y,w,h);c.fillStyle='#ffc0e0';rr(c,x+w*.15,y+h*.35,w*.7,h*.6,10);c.fill();for(const a of[.2,.5,.8]){c.fillStyle='#ffb0d8';c.fillRect(x+w*a-34,y+h*.18,68,h*.6);c.fillStyle='#b48cff';c.beginPath();c.moveTo(x+w*a-42,y+h*.19);c.lineTo(x+w*a,y+h*.05);c.lineTo(x+w*a+42,y+h*.19);c.fill();}c.fillStyle='#fff';rr(c,x+w*.44,y+h*.7,w*.12,h*.25,[30,30,0,0]);c.fill();}
  c.restore();}
SCN.book={bg:'#fff4fa',song:'town',
  enter(){this.tab='page';this.page=0;this.scroll=0;this.drag=null;this.wig={};this.pend=null;const n=SAVE.stickers.length;say(n?`シールちょう！ ${n}まい あつめたよ。 シールを ページに はって あそぼう！`:'シールちょう！ まちで あそぶと シールが もらえるよ');},
  lay(){},
  area(){return{x:20,y:230,w:W-40,h:H-230-230};},
  owned(){const a=[];for(const s of STK)if(SAVE.stickers.includes(s.id)){a.push({s,shiny:false});if(SAVE.shiny.includes(s.id))a.push({s,shiny:true});}return a;},
  trayY(){return H-120;},
  update(dt){for(const k in this.wig)if(this.wig[k]>0)this.wig[k]-=dt;},
  draw(c){c.fillStyle='#ffe8f4';for(let y=0;y<H;y+=40)c.fillRect(-400,y,W+800,20);
    titleText(c,'シールちょう',W/2+20,58,38,'#ff5fa2');
    const n=SAVE.stickers.length,bx=90,bw=420,by=112;c.fillStyle='#fff';rr(c,bx,by-10,bw,20,10);c.fill();c.fillStyle=vfill(c,by-10,by+10,'#ff8cc0');rr(c,bx,by-10,bw*n/STK.length,20,10);c.fill();c.fillStyle='#8a5a8a';c.font=`800 16px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(`${n}/${STK.length}`,bx+bw+40,by);
    for(const g of GIFTS){const gx=bx+bw*g[0]/STK.length,got=n>=g[0];c.save();c.translate(gx,by);if(!got)c.rotate(Math.sin(T*3+g[0])*.1);c.fillStyle=got?'#ffd23a':'#ff6fa8';rr(c,-13,-13,26,24,5);c.fill();c.fillStyle=got?'#fff':'#ffd23a';c.fillRect(-2.5,-13,5,24);c.fillRect(-13,-4,26,5);c.fillStyle=got?'#ffd23a':'#ff6fa8';c.beginPath();c.ellipse(-6,-16,6,4,.4,0,TAU);c.fill();c.beginPath();c.ellipse(6,-16,6,4,-.4,0,TAU);c.fill();c.restore();}
    for(const [id,lb,x] of [['page','はる',210],['zukan','ずかん',390]]){const sel=this.tab===id;c.fillStyle=sel?'#ff8cc0':'#fff';rr(c,x-80,150,160,54,27);c.fill();c.strokeStyle='#ff8cc0';c.lineWidth=4;c.stroke();c.fillStyle=sel?'#fff':'#ff8cc0';c.font=`800 24px ${FONT}`;c.fillText(lb,x,178);}
    if(this.tab==='page'){const a=this.area();c.fillStyle='rgba(90,40,110,.15)';rr(c,a.x+4,a.y+8,a.w,a.h,24);c.fill();drawPageBg(c,this.page,a.x,a.y,a.w,a.h);c.strokeStyle='#fff';c.lineWidth=6;rr(c,a.x,a.y,a.w,a.h,24);c.stroke();
      c.save();rr(c,a.x,a.y,a.w,a.h,24);c.clip();for(const p of SAVE.pages[this.page]){if(this.drag&&this.drag.placed===p)continue;const w=this.wig[p.uid]>0?Math.sin(this.wig[p.uid]*30)*.2:0;c.save();c.translate(p.x,p.y);c.rotate(p.r+w);drawSticker(c,p.k,0,0,p.s,true,p.sh);c.restore();}c.restore();
      drawBtn(c,a.x+30,a.y+a.h/2,26,'#ffb3d6','prev');drawBtn(c,a.x+a.w-30,a.y+a.h/2,26,'#ffb3d6','next');
      for(let i=0;i<4;i++){c.fillStyle=i===this.page?'#ff5fa2':'#ffd0e6';circ(c,W/2-45+i*30,a.y+a.h+16,7);}c.fillStyle='#b88aa8';c.font=`800 18px ${FONT}`;c.textAlign='center';c.fillText(PAGEBG[this.page][0],W/2,a.y-14);
      const ty=this.trayY();tray(c,ty,170);const own=this.owned();if(!own.length){c.fillStyle='#b88aa8';c.font=`800 20px ${FONT}`;c.fillText('まちで あそんで シールを あつめよう！',W/2,ty);}
      c.save();c.beginPath();c.rect(20,ty-85,W-40,170);c.clip();own.forEach((o,i)=>{const x=80+i*100-this.scroll;if(x<-60||x>W+60)return;drawSticker(c,o.s.k,x,ty,.85,true,o.shiny);});c.restore();
      if(this.drag&&this.drag.moving)drawSticker(c,this.drag.k,this.drag.x,this.drag.y,1.1,true,this.drag.sh);}
    else{const cols=6,cw=(W-40)/cols,top=230,rh=Math.min(cw+6,(H-top-30)/Math.ceil(STK.length/cols));STK.forEach((s,i)=>{const x=20+cw*(i%cols)+cw/2,y=top+rh*Math.floor(i/cols)+rh/2;const own=SAVE.stickers.includes(s.id);const w=this.wig[s.id]>0?Math.sin(this.wig[s.id]*30)*.15:0;c.save();c.translate(x,y);c.rotate(w);drawSticker(c,s.k,0,0,Math.min(cw,rh)/100,own,SAVE.shiny.includes(s.id));c.restore();});}},
  down(x,y){if(hitC(x,y,210,177,80)&&y>148&&y<206){this.tab='page';sfx('tap');return;}if(hitC(x,y,390,177,80)&&y>148&&y<206){this.tab='zukan';sfx('tap');return;}
    const n=SAVE.stickers.length;for(const g of GIFTS){const gx=90+420*g[0]/STK.length;if(hitC(x,y,gx,112,22)){sfx('pop');say(n>=g[0]?`ごほうび ゲット！ 「${g[3]}」が きられるよ`:`シールを ${g[0]}まい あつめると 「${g[3]}」が もらえるよ`);return;}}
    if(this.tab==='zukan'){const cols=6,cw=(W-40)/cols,top=230,rh=Math.min(cw+6,(H-top-30)/Math.ceil(STK.length/cols));STK.forEach((s,i)=>{const cx=20+cw*(i%cols)+cw/2,cy=top+rh*Math.floor(i/cols)+rh/2;if(hitC(x,y,cx,cy,cw/2)){if(SAVE.stickers.includes(s.id)){this.wig[s.id]=.6;sfx('pop');sayWord(s.k);}else{sfx('tap');const p=PLACES.find(p=>p.id===s.place);say(p.ja+'で あそぶと もらえるよ');}}});return;}
    const a=this.area();if(hitC(x,y,a.x+30,a.y+a.h/2,34)){this.page=(this.page+3)%4;sfx('whoosh');sayPair(PAGEBG[this.page][0],PAGEBG[this.page][1]);return;}if(hitC(x,y,a.x+a.w-30,a.y+a.h/2,34)){this.page=(this.page+1)%4;sfx('whoosh');sayPair(PAGEBG[this.page][0],PAGEBG[this.page][1]);return;}
    const ty=this.trayY();if(y>ty-85&&y<ty+85){const own=this.owned();const i=Math.round((x+this.scroll-80)/100);const o=own[i];this.pend={sx:x,sy:y,lx:x,o,scroll0:this.scroll,mode:null};return;}
    const pg=SAVE.pages[this.page];for(let i=pg.length-1;i>=0;i--){const p=pg[i];if(hitC(x,y,p.x,p.y,44*p.s)){pg.splice(i,1);pg.push(p);this.drag={placed:p,k:p.k,sh:p.sh,x:p.x,y:p.y,ox:x-p.x,oy:y-p.y,sx:x,sy:y,moving:false};return;}}},
  move(x,y){const pd=this.pend;if(pd){if(!pd.mode){if(Math.abs(x-pd.sx)>12&&Math.abs(x-pd.sx)>Math.abs(y-pd.sy))pd.mode='scroll';else if(pd.sy-y>14&&pd.o)pd.mode='drag';}
      if(pd.mode==='scroll'){const max=Math.max(0,this.owned().length*100-(W-120));this.scroll=clamp(pd.scroll0-(x-pd.sx),0,max);}
      else if(pd.mode==='drag'){this.drag={k:pd.o.s.k,id:pd.o.s.id,sh:pd.o.shiny,x,y,moving:true,fresh:true};this.pend=null;sfx('tap');}return;}
    const d=this.drag;if(!d)return;if(!d.moving&&Math.hypot(x-d.sx,y-d.sy)>8)d.moving=true;if(d.moving){d.x=x-(d.ox||0);d.y=y-(d.oy||0);}},
  up(x,y){if(this.pend){const pd=this.pend;this.pend=null;if(!pd.mode&&pd.o){sfx('pop');sayWord(pd.o.s.k);}return;}
    const d=this.drag;if(!d)return;this.drag=null;const a=this.area();const pg=SAVE.pages[this.page];
    if(d.placed&&!d.moving){this.wig[d.placed.uid]=.6;sfx('pop');sayWord(d.placed.k);return;}
    const inPage=d.x>a.x&&d.x<a.x+a.w&&d.y>a.y&&d.y<a.y+a.h;
    if(d.placed){if(inPage){d.placed.x=d.x;d.placed.y=d.y;sfx('pop');}else{pg.splice(pg.indexOf(d.placed),1);sfx('whoosh');puff(d.x,d.y,6,'#ffd0e6');}save();return;}
    if(inPage){if(pg.length>=40)pg.shift();const p={uid:Date.now()+Math.random(),k:d.k,sh:d.sh,x:d.x,y:d.y,s:rand(.9,1.15),r:rand(-.25,.25)};pg.push(p);this.wig[p.uid]=.5;sfx('pop');burst(d.x,d.y,8,'star');sayWord(d.k);save();}},
  hint(){if(this.tab!=='page'||!SAVE.stickers.length)return null;const a=this.area();return SAVE.pages[this.page].length?null:{x:80,y:this.trayY(),x2:W/2,y2:a.y+a.h/2};},
  hintText(){return 'したの シールを うえに ひっぱって はってね';}};

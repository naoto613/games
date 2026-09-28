// ================= てあらい きょうしつ =================
M('soap',c=>{c.fillStyle=gfill(c,-4,0,26,'#ffb3d6');OL(c,'#e080b0');rr(c,-18,-10,36,40,8);c.fill();c.stroke();c.fillStyle='#fff';rr(c,-6,-26,12,16,3);c.fill();c.stroke();rr(c,-6,-30,26,8,3);c.fill();c.stroke();c.fillStyle='#fff';heartP(c,0,10,7);c.fill();});
M('uvlamp',c=>{c.rotate(-.4);c.fillStyle='#5a4a8a';OL(c,'#3a2a6a');rr(c,-7,0,14,36,5);c.fill();c.stroke();c.fillStyle=gfill(c,0,-10,16,'#b48cff');OL(c,'#7a4ad8');rr(c,-16,-22,32,24,8);c.fill();c.stroke();c.fillStyle='rgba(200,150,255,.5)';c.beginPath();c.moveTo(-14,-22);c.lineTo(-30,-50);c.lineTo(30,-50);c.lineTo(14,-22);c.fill();});
Object.assign(WORDS,{soap:['せっけん','soap'],uvlamp:['ブラックライト','black light']});
const WSTEPS=[['palms','てのひら','palms'],['backs','てのこう','backs of hands'],['between','ゆびの あいだ','between fingers'],['nails','つめ','fingernails'],['thumbs','おやゆび','thumbs'],['wrists','てくび','wrists']];
const WQUIZ=[['ごはんの まえに する ことは？',[['てあらい','soap',1],['ねんね','blanket',0],['かくれんぼ','ribbon',0]]],['せきや くしゃみが でるときは？',[['マスクを する','mask',1],['ひとに むけて ごほん','germ',0],['おおきな こえで うたう','note',0]]],
  ['そとから かえったら？',[['てあらい と うがい','cup',1],['すぐに おやつ','pudding',0],['そのまま ねる','blanket',0]]],['トイレの あとは？',[['てを あらう','soap',1],['そのまま あそぶ','ribbon',0],['ふくで ふく','towel',0]]],
  ['どうぶつを さわったら？',[['てを あらう','soap',1],['おくちに ゆびを いれる','germ',0],['そのまま ごはん','onigiri',0]]]];
SCN.wash={bg:'#eaf8ff',song:'play',
  enter(){this.dryDone=0;this.rinsed=0;this.uvDone=0;this.qset=null;this.towel=null;this.P=newPatient();this.ph='soap';this.si=0;this.miss=0;this.fin=0;this.push=0;this.pushN=1+Math.floor(Math.random()*3);this.foam=[];this.water=0;this.dry=0;this.uv=null;this.quiz=null;this.qi=0;this.timer=0;this.rub=null;
    this.gcol=pick(['#8ee07a','#b48cff','#ff9ac8','#ffc85a']);this.theme=pick([['#eaf8ff','#d0e8f4','#f4fbff'],['#f0fff4','#d4ecd8','#f8fff8'],['#fff8ec','#f0e0c8','#fffbf4']]);this.lay();this.makeGerms();
    greetPt(this.P,'そとで あそんで てが ばいきん だらけ！ いっしょに てを あらおう');setTimeout(()=>{if(scene===this)say(`まずは せっけんを ${this.pushN}かい プッシュしてね`);},3200);},
  lay(){this.hy=H*.47;this.hx=[W/2-130,W/2+130];this.hk=1.3;},
  zone(k,h){const x=this.hx[h],y=this.hy,sd=h?-1:1,q=this.hk;const Z={palms:[[0,18],[-18,34],[16,4]],backs:[[0,18],[-18,34],[16,4]],between:[[-17,-38],[0,-40],[17,-38]],nails:[[-27,-92],[-9,-104],[9,-104]],thumbs:[[-52,-6],[-58,-26]],wrists:[[-14,82],[14,82]]}[k];return Z.map(([a,b])=>[x+(k==='thumbs'?a*sd:a)*q,y+b*q]);},
  makeGerms(){this.germs=[];for(const [k] of WSTEPS)for(let h=0;h<2;h++){const z=this.zone(k,h);shuffle(z).slice(0,1+Math.floor(Math.random()*z.length)).forEach(([x,y])=>this.germs.push({k,x:x+rand(-5,5),y:y+rand(-5,5),hp:1,ph:rand(0,6)}));}},
  cur(){return WSTEPS[this.si];},
  handsBack(){return this.ph==='wash'&&(this.cur()[0]==='backs'||this.cur()[0]==='nails');},
  drawHand(c,x,y,sd,back){const A=AN[this.P.k];c.save();c.translate(x,y);c.scale(this.hk,this.hk);c.translate(-x,-y);const skin=A.c==='#ffffff'||A.c==='#fffaf0'?'#fff0f4':shade(A.c,.35);const pal=A.b;c.save();c.translate(x,y);c.scale(sd,1);c.lineJoin='round';const oc=shade(skin,-.35);c.strokeStyle=oc;c.lineWidth=4;
    c.fillStyle=gfill(c,-10,40,60,skin);rr(c,-24,60,48,50,12);c.fill();c.stroke();
    [[-27,-50,58],[-9,-60,68],[9,-60,68],[27,-50,58]].forEach(([fx,fy,l])=>{c.fillStyle=gfill(c,fx-4,fy,30,skin);rr(c,fx-9,fy-l/2+14,18,l,9);c.fill();c.stroke();if(back){c.fillStyle='#fff4f6';ell(c,fx,fy-l/2+24,6,8);c.strokeStyle=oc;c.lineWidth=2;c.beginPath();c.ellipse(fx,fy-l/2+24,6,8,0,0,TAU);c.stroke();c.lineWidth=4;}});
    c.save();c.translate(-46,0);c.rotate(-.5);c.fillStyle=gfill(c,0,0,26,skin);rr(c,-10,-28,20,52,10);c.fill();c.stroke();if(back){c.fillStyle='#fff4f6';ell(c,0,-18,5,7);}c.restore();
    c.fillStyle=gfill(c,-10,10,60,back?skin:pal);rr(c,-38,-24,76,92,28);c.fill();c.stroke();if(!back){c.strokeStyle=shade(pal,-.15);c.lineWidth=2;c.beginPath();c.moveTo(-26,6);c.quadraticCurveTo(0,20,26,0);c.moveTo(-20,30);c.quadraticCurveTo(4,38,24,24);c.stroke();}
    else{c.strokeStyle=shade(skin,-.2);c.lineWidth=2;for(const fx of[-27,-9,9,27]){c.beginPath();c.arc(fx,-18,4,Math.PI*1.1,Math.PI*1.9);c.stroke();}}
    c.restore();c.restore();},
  update(dt){if(this.ph==='wash'||this.ph==='rinse')this.timer+=dt;for(const f of this.foam)f.t+=dt;
    if(this.fin>0){this.fin+=dt;if(this.fin>2.6&&this.fin<9){this.fin=9;celebrate('wash',starsFor(this.miss));}}},
  nextStep(){const g=this.germs.filter(q=>q.k===this.cur()[0]);if(g.some(q=>q.hp>0))return;stepClear(`${this.cur()[1]} OK！`);this.si++;if(this.si>=WSTEPS.length){this.ph='rinse';this.water=0;this.rinseP=0;say('ぜんぶ あらえたね！ おみずを だして あわを ながそう。 じゃぐちを タッチ');return;}this.announce();},
  announce(){const s=this.cur();hush();speak(`${this.si+1}。 ${s[1]}`);speak(s[2],'en');speak('ごしごし こすろう');bub={text:`${this.si+1}. ${s[1]}（${s[2]}）を ごしごし`,t:0,life:3.4};},
  draw(c){const th=this.theme;roomBg(c,th[0],th[1],H*.72,th[2],[['window',96,200,1,110,86],['poster',W-86,210,1,'soap','#ffb3d6','てあらい']]);
    // sink
    const sy=H*.72;c.fillStyle='#fff';rr(c,40,sy-30,W-80,70,24);c.fill();c.strokeStyle='#b8d0e8';c.lineWidth=5;c.stroke();c.fillStyle='#d8ecf8';ell(c,W/2,sy+2,200,20);
    const fx=W/2,fy=H*.18+40;c.fillStyle='#b8c4d8';c.fillRect(fx-26,fy-96,52,14);c.fillStyle=vfill(c,fy-90,fy,'#dce4f0',.2,-.1);rr(c,fx-12,fy-86,24,90,8);c.fill();rr(c,fx-12,fy-60,70,20,8);c.fill();c.fillStyle='#c8d4e8';rr(c,fx+40,fy-44,20,12,4);c.fill();c.fillStyle=this.water?'#5aa8ff':'#ff8cc0';circ(c,fx,fy-70,14);
    if(this.water){const g=c.createLinearGradient(fx+46,0,fx+60,0);g.addColorStop(0,'rgba(140,210,255,.5)');g.addColorStop(1,'rgba(90,168,255,.7)');c.fillStyle=g;c.fillRect(fx+42,fy-40,16,sy-fy+30);for(let i=0;i<3;i++)circ(c,fx+50+Math.sin(T*20+i)*6,sy-30,5);}
    const back=this.handsBack();this.drawHand(c,this.hx[0],this.hy,1,back);this.drawHand(c,this.hx[1],this.hy,-1,back);
    if(this.ph==='wash'){const s=this.cur();const zs=[0,1].flatMap(h=>this.zone(s[0],h));for(const [x,y] of zs){c.strokeStyle=`rgba(255,200,80,${.5+Math.sin(T*6)*.3})`;c.lineWidth=4;c.setLineDash([8,6]);c.beginPath();c.arc(x,y,24,0,TAU);c.stroke();c.setLineDash([]);}}
    for(const g of this.germs){if(g.hp<=0)continue;if(this.ph==='wash'&&g.k!==this.cur()[0]&&!['palms','backs'].includes(g.k)&&this.si<WSTEPS.findIndex(s=>s[0]===g.k)){}c.globalAlpha=Math.max(.3,g.hp);MED.germ(c,g.x+Math.sin(T*3+g.ph)*3,g.y+Math.cos(T*2.5+g.ph)*3,.55,{col:this.gcol});c.globalAlpha=1;}
    for(const f of this.foam){c.fillStyle='rgba(255,255,255,.92)';c.strokeStyle='rgba(160,200,240,.6)';c.lineWidth=1.5;c.beginPath();c.arc(f.x,f.y,f.r,0,TAU);c.fill();c.stroke();}
    // UV
    if(this.ph==='uv'){const U=this.uv;c.fillStyle='rgba(30,10,60,.72)';c.fillRect(-OX/SC,-OY/SC,W+2*OX/SC,H+2*OY/SC);const g=c.createRadialGradient(U.x,U.y-40,10,U.x,U.y-40,120);g.addColorStop(0,'rgba(190,140,255,.45)');g.addColorStop(1,'rgba(190,140,255,0)');c.fillStyle=g;circ(c,U.x,U.y-40,120);
      for(const sp of U.spots){if(sp.hp<=0)continue;if(sp.rev){c.fillStyle=`rgba(180,255,120,${.5+Math.sin(T*8)*.3})`;circ(c,sp.x,sp.y,12);c.fillStyle='#e0ffc0';circ(c,sp.x,sp.y,5);}}
      if(!U.spots.every(s=>s.rev)){c.save();c.translate(U.x,U.y);MED.uvlamp(c,0,0,1.4);c.restore();txt(c,'ライトで てらして のこりを さがそう',W/2,H*.12,20,'#e0d0ff');}else txt(c,'ひかっている ところを ゆびで ごしごし！',W/2,H*.12,20,'#e0ffc0');}
    // soap pump
    if(this.ph==='soap'){MED.soap(c,W/2,H*.78+60,1.6);txt(c,`プッシュ ${this.push} / ${this.pushN}`,W/2,H-40,26,'#ff5fa2');targetMark(c,W/2,H*.78+50,50);}
    if(this.ph==='wash'||this.ph==='rinse'){const p=Math.min(1,this.timer/30);c.fillStyle='rgba(255,255,255,.9)';rr(c,120,112,W-240,26,13);c.fill();c.fillStyle='#8ad0ff';rr(c,120,112,Math.max(26,(W-240)*p),26,13);c.fill();txt(c,`${Math.floor(this.timer)}びょう ♪`,W/2,125,15,'#3a88e8');}
    if(this.ph==='wash'){const s=this.cur();panel(c,20,H*.78+14,W-40,110,20,'#fff','#ffc93c');txt(c,`${this.si+1}. ${s[1]}`,W/2,H*.78+50,28,'#ff8a3a');txt(c,s[2],W/2,H*.78+86,20,'#3a88e8');for(let i=0;i<6;i++){c.fillStyle=i<this.si?'#ffd23a':i===this.si?'#ff8cc0':'#eee';circ(c,W/2-100+i*40,H*.78+112,7);}}
    if(this.ph==='rinse')txt(c,this.water?`あわを ながそう ${Math.round(Math.min(1,this.rinseP)*100)}%`:'じゃぐちを タッチ',W/2,H-60,26,'#3a88e8');
    if(this.ph==='dry'){drawItem(c,'towel',this.towel?this.towel.x:W/2,this.towel?this.towel.y:H-90,1.4);txt(c,`ふきふき ${Math.round(this.dry*100)}%`,W/2,H-30,22,'#ff8a3a');}
    if(this.quiz){const Q=this.quiz;panel(c,24,H*.2,W-48,H*.62,26,'#fff','#8ad0ff');txt(c,Q[0],W/2,H*.2+40,24,'#3a88e8');Q.opts.forEach((o,i)=>{const y=H*.2+110+i*((H*.62-130)/3);c.fillStyle=Q.sel===i?(o[2]?'#e8fff0':'#fff0f0'):'#f6fbff';rr(c,54,y-40,W-108,80,20);c.fill();c.strokeStyle='#bfe0ff';c.lineWidth=3;c.stroke();drawThing(c,o[1],110,y,.7);txt(c,o[0],W/2+40,y,22,'#4a4a6a');});}
    drawPt(c,this.P,70,H*.3,.55,{t:T,happy:this.fin>0||(this.ph==='wash'&&PLAY.combo>2),look:.5});
    fu(c,62,H-40,1.9,{point:!this.fin});rk(this,c,W-54,H-40,1.4);
    if(this.ph!=='wash'&&this.ph!=='quiz')stepDots(c,5,{soap:0,rinse:2,dry:3,uv:4}[this.ph]??5);},
  down(x,y){if(this.fin)return;
    if(this.ph==='soap'){if(hitC(x,y,W/2,H*.78+50,70)){this.push++;sfx('squish');bubbles(W/2,H*.78,6);for(let i=0;i<6;i++)this.foam.push({x:W/2+rand(-150,150),y:this.hy+rand(-30,60),r:rand(8,16),t:0});hush();speak(String(this.push),'en');
      if(this.push>=this.pushN){good(W/2,H*.78,1,'プッシュ OK！');this.ph='wash';this.si=0;setTimeout(()=>{if(scene===this)this.announce();},900);}}return;}
    if(this.ph==='rinse'){const fx=W/2,fy=H*.18+40;if(!this.water&&hitC(x,y,fx+20,fy-50,70)){this.water=1;sfx('pour');good(fx,fy,1,'ジャー');return;}this.rub={x,y};return;}
    if(this.ph==='dry'){this.towel={x,y};return;}
    if(this.ph==='uv'){this.rub={x,y};this.uv.x=x;this.uv.y=y;return;}
    if(this.quiz){const Q=this.quiz;Q.opts.forEach((o,i)=>{const yy=H*.2+110+i*((H*.62-130)/3);if(Math.abs(y-yy)<40&&x>54&&x<W-54&&Q.sel==null){Q.sel=i;if(o[2]){good(W/2,yy,2,'せいかい！');hush();speak(o[0]+'！ せいかい！');setTimeout(()=>{if(scene!==this)return;this.qi++;if(this.qi>=2){this.quiz=null;this.fin=.01;banner('てあらい マスター！','#5aa8ff');}else this.newQuiz();},1800);}else{bad();this.miss++;hush();speak('ざんねん。 もういちど かんがえてね');setTimeout(()=>{if(scene===this&&this.quiz)this.quiz.sel=null;},900);}}});return;}
    this.rub={x,y};},
  move(x,y){const r=this.rub;if(this.ph==='dry'&&this.towel){const d=Math.hypot(x-this.towel.x,y-this.towel.y);this.towel={x,y};if(Math.abs(y-this.hy)<130){this.dry=Math.min(1,this.dry+d/1400);if(Math.random()<.1)sfx('squish');if(this.dry>=1&&!this.dryDone){this.dryDone=1;good(W/2,this.hy,2,'さらさら！');this.startUV();}}return;}
    if(!r)return;const d=Math.hypot(x-r.x,y-r.y);r.x=x;r.y=y;
    if(this.ph==='wash'){if(d>2&&Math.random()<.5){this.foam.push({x:x+rand(-14,14),y:y+rand(-14,14),r:rand(6,14),t:0});if(this.foam.length>120)this.foam.shift();}if(d>3&&Math.random()<.2)sfx('brush');
      for(const g of this.germs){if(g.hp<=0||g.k!==this.cur()[0])continue;if(Math.hypot(g.x-x,g.y-y)<42){g.hp-=d/160;if(g.hp<=0){good(g.x,g.y,1,pick(['ピカッ','えいっ','バイバイ ばいきん']));this.nextStep();}}}}
    if(this.ph==='rinse'&&this.water&&Math.abs(y-this.hy)<150){this.rinseP+=d/1600;const n=Math.floor(this.foam.length*(1-Math.min(1,this.rinseP)));while(this.foam.length>n)this.foam.shift();if(Math.random()<.3)drops(x,y,2);if(this.rinseP>=1&&!this.rinsed){this.rinsed=1;this.water=0;this.foam=[];good(W/2,this.hy,2,'つるつる！');this.ph='dry';this.dry=0;say('タオルで ふきふき しよう');}}
    if(this.ph==='uv'){const U=this.uv;U.x=x;U.y=y;for(const sp of U.spots){if(sp.hp<=0)continue;if(!sp.rev&&Math.hypot(sp.x-x,sp.y-(y-40))<80){sp.rev=1;sfx('spark');}}
      if(U.spots.every(s=>s.rev)){for(const sp of U.spots){if(sp.hp>0&&Math.hypot(sp.x-x,sp.y-y)<40){sp.hp-=d/120;if(sp.hp<=0)good(sp.x,sp.y,1,'キラッ');}}if(U.spots.every(s=>s.hp<=0)&&!this.uvDone){this.uvDone=1;setTimeout(()=>{if(scene===this){this.ph='quiz';this.newQuiz();}},1200);say('ばいきん ゼロ！ ピカピカの て！');}}}},
  up(){this.rub=null;if(this.ph==='dry')this.towel=null;},
  startUV(){this.ph='uv';const spots=[];const n=2+Math.floor(Math.random()*3);for(let i=0;i<n;i++){const k=pick(WSTEPS)[0],h=Math.random()<.5?0:1;const z=pick(this.zone(k,h));spots.push({x:z[0]+rand(-6,6),y:z[1]+rand(-6,6),rev:0,hp:1});}this.uv={x:W/2,y:H*.8,spots};say('ブラックライトで チェック！ あらいのこしが ひかって みえるよ');},
  newQuiz(){const q=this.qset||(this.qset=shuffle(WQUIZ));const Q=q[this.qi];this.quiz=[Q[0]];this.quiz.opts=shuffle(Q[1]);this.quiz.sel=null;hush();speak(Q[0]);},
  hint(){if(this.fin)return null;
    if(this.ph==='soap')return{x:W/2,y:H*.78+50};
    if(this.ph==='wash'){const g=this.germs.find(q=>q.hp>0&&q.k===this.cur()[0]);return g?{x:g.x-30,y:g.y,x2:g.x+10,y2:g.y}:null;}
    if(this.ph==='rinse'){if(!this.water)return{x:W/2+20,y:H*.18-10};return{x:W/2-160,y:this.hy,x2:W/2+160,y2:this.hy};}
    if(this.ph==='dry')return{x:W/2-160,y:this.hy,x2:W/2+160,y2:this.hy+20};
    if(this.ph==='uv'){const U=this.uv;const sp=U.spots.find(s=>!s.rev);if(sp)return{x:W/2,y:H*.8,x2:sp.x,y2:sp.y+40};const s2=U.spots.find(s=>s.hp>0);return s2?{x:s2.x-30,y:s2.y,x2:s2.x+10,y2:s2.y}:null;}
    if(this.quiz&&this.quiz.sel==null){const i=this.quiz.opts.findIndex(o=>o[2]);return{x:W/2,y:H*.2+110+i*((H*.62-130)/3)};}return null;},
  hintText(){return{soap:'せっけんを プッシュ',wash:`${this.cur()?this.cur()[1]:''}の ばいきんを ごしごし`,rinse:'おみずで あわを ながそう',dry:'タオルで ふこう',uv:'ライトで てらしてみよう',quiz:'ただしい ものを えらんでね'}[this.ph]||'';}};

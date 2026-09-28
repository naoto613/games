// ================= lobby =================
SCN.lobby={bg:'#fff4fa',song:'clinic',noHome:1,
  enter(){this.lay();this.walker=null;this.nextW=T+2;if(this.greeted)say(pick(['つぎは どこで おしごと する？','どの おへやに いく？','きょうも がんばろうね！']));this.greeted=1;},
  lay(){this.y0=172;this.y1=H-230;this.rh=(this.y1-this.y0)/4;this.cw=178;},
  cell(i){if(i===10){const a=this.cellG(9),b=this.cellG(11);return{x:(this.cellG(10).x+b.x)/2,y:b.y,w:this.cw*2+12,h:this.rh-14};}return this.cellG(i);},
  cellG(i){const col=i%3,row=Math.floor(i/3);return{x:W/2+(col-1)*(this.cw+12),y:this.y0+row*this.rh+this.rh/2,w:this.cw,h:this.rh-14};},
  update(dt){if(!this.walker&&T>this.nextW){const P=newPatient();this.walker=Object.assign(P,{x:-80,dir:1,sp:rand(60,90)});if(Math.random()<.5){this.walker.x=W+80;this.walker.dir=-1;}}
    const w=this.walker;if(w){w.x+=w.dir*w.sp*dt;if(w.x<-120||w.x>W+120){this.walker=null;this.nextW=T+rand(3,7);}}},
  draw(c){const L=-OX/SC-2,R=W+OX/SC+2;c.fillStyle='#fff4fa';c.fillRect(L,-OY/SC-2,R-L,H+OY/SC*2+4);c.fillStyle='#ffe8f3';for(let x=Math.floor(L/60)*60;x<R;x+=60)c.fillRect(x,-OY/SC,30,H);
    c.fillStyle=vfill(c,-OY/SC,150,'#ff9ac8',.1,-.05);c.fillRect(L,-OY/SC-2,R-L,150+OY/SC);c.fillStyle='#fff';for(let x=Math.floor(L/40)*40;x<R;x+=40){c.beginPath();c.arc(x+20,150,20,0,Math.PI);c.fill();}
    crossSign(c,W-52,74,17);txtO(c,'ふーちゃん びょういん',W/2+14,76,38,'#fff','#e0508a',9);
    const ri=rankIdx();c.fillStyle='#fff';rr(c,W-250,108,234,34,17);c.fill();MED.love(c,W-228,125,.5);txt(c,`${SAVE.hearts}`,W-208,126,20,'#ff4d7d','left');txt(c,RANKS[ri][1],W-28,126,16,'#8a5a9a','right');
    for(let i=0;i<11;i++){const r=this.cell(i),R0=ROOMS[i],pl=lvOf(R0.id);const hov=Math.sin(T*3+i)*2;
      c.save();c.translate(r.x,r.y+hov);panel(c,-r.w/2,-r.h/2,r.w,r.h,22,'#ffffff',R0.col,5);c.fillStyle=R0.col;rr(c,-r.w/2,-r.h/2,r.w,26,[22,22,0,0]);c.fill();txt(c,R0.name,0,-r.h/2+14,R0.name.length>9?17:R0.name.length>7?16:19,'#fff');
      if(i<10){const isz=Math.min(1.05,(r.h-60)/70)*(AN[R0.icon]?1.6:R0.icon==='tooth'?1.3:1);drawThing(c,R0.icon,-r.w/2+48,8,isz);if(R0.sub)txt(c,R0.sub,34,r.h/2-22,15,shade(R0.col,-.3));for(let k=0;k<3;k++){c.fillStyle=pl>k?'#ffd23a':'#eee4f0';star(c,22+k*24,-4,10,4.5);c.fill();}}
      else{const s=Math.min(1,(r.h-30)/100);fu(c,-120,r.h/2-6,1.5*s,{happy:1});drawRikki(c,-40,r.h/2-8,{sc:1.3*s,t:T,happy:1});const n=WARD.filter(owns).length;txt(c,`${n} / ${WARD.length}`,90,-8,24,'#3a88e8');txt(c,'おようふく',90,22,16,'#5a88c8');}
      c.restore();}
    c.fillStyle=vfill(c,H-210,H,'#ffd8e8',.1,-.06);c.fillRect(L,H-210,R-L,210+OY/SC+4);
    drawDeco(c,['plant',W-40,H-150,.9]);c.fillStyle='#fff';rr(c,W-270,H-156,210,70,16);c.fill();c.strokeStyle='#ffb3d6';c.lineWidth=4;c.stroke();
    const nx=RANKS[ri+1];txt(c,'つぎの ランクまで',W-165,H-138,16,'#a07aa8');if(nx){const p=(SAVE.hearts-RANKS[ri][0])/(nx[0]-RANKS[ri][0]);c.fillStyle='#ffe0ee';rr(c,W-255,H-118,180,20,10);c.fill();c.fillStyle='#ff6f9a';rr(c,W-255,H-118,Math.max(20,180*p),20,10);c.fill();txt(c,`${nx[0]-SAVE.hearts}`,W-64,H-108,18,'#ff4d7d','right');}else txt(c,'さいこう ランク！',W-165,H-108,20,'#ff4d7d');
    const w=this.walker;if(w){c.save();if(w.dir<0){c.translate(w.x,0);c.scale(-1,1);c.translate(-w.x,0);}drawAnimal(c,w.k,w.x,H-34,.62,{t:T,hop:Math.abs(Math.sin(T*6))*.35,acc:w.acc,accC:w.accC,happy:1});c.restore();}
    fu(c,100,H-20,2.6,{wave:Math.sin(T*.7)>.6});rk(this,c,226,H-22,1.9,{happy:Math.sin(T*.9)>.3});
},
  down(x,y){for(let i=0;i<11;i++){const r=this.cell(i);if(Math.abs(x-r.x)<r.w/2&&Math.abs(y-r.y)<r.h/2){sfx('pop');ring(r.x,r.y,'#fff');go(ROOMS[i].id);return;}}
    const w=this.walker;if(w&&Math.abs(x-w.x)<50&&y>H-120){sfx('boing');hush();speak(`${WORDS[w.k][0]}さん、 こんにちは！`);speak(`Hello, ${WORDS[w.k][1]}!`,'en');card={k:w.k,ja:WORDS[w.k][0],en:WORDS[w.k][1],t:0};return;}
    if(hitC(x,y,100,H-90,70)){sfx('boing');REACT.k='good';REACT.t=1;say(pick(['きょうも おいしゃさんの おしごと がんばるぞ！','ちょうしんきで どきどきを きくのが すき！',`いまは ${RANKS[rankIdx()][1]} だよ！`]));}}};
// ================= dress up =================
const DCATS={fu:[['coat','はくい'],['dress','ふく'],['hat','ぼうし'],['item','もちもの']],rk:[['wear','おようふく'],['hat','ぼうし'],['toy','おもちゃ']]};
SCN.dress={bg:'#eef8ff',song:'calm',hud:false,noRk:1,
  enter(){this.who='fu';this.cat='coat';this.photo=0;this.pose=0;say('おきがえ しよう！ おしごとで もらった おようふくを きせてあげてね');},
  items(){return WARD.filter(w=>w[0]===this.who&&w[1]===this.cat);},
  grid(){const n=this.items().length,cols=5,top=H-300;return this.items().map((w,i)=>({w,x:W/2+(i%cols-2)*112,y:top+Math.floor(i/cols)*128+56}));},
  update(dt){if(this.photo>0){this.photo+=dt;if(this.photo>2.5)this.photo=0;}if(this.pose>0)this.pose-=dt;},
  drawTile(c,g){const {w,x,y}=g,own=owns(w),on=isWorn(w);c.fillStyle=on?'#fff0f7':own?'#fff':'#eef0f6';rr(c,x-50,y-56,100,114,18);c.fill();c.strokeStyle=on?'#ff5fa2':own?'#c8d8f0':'#dde2ec';c.lineWidth=on?6:3;c.stroke();
    c.save();c.beginPath();rr(c,x-50,y-56,100,114,18);c.clip();if(!own){c.globalAlpha=.25;}
    if(w[0]==='fu'){const o=fuOutfit();if(w[1]==='coat'){const cp=COATP[w[2]];o.coat=cp?cp.c:w[2];o.coatPat=cp||null;drawFuka(c,x,y+54,{outfit:o,t:0,sc:1.5,steth:false});}else if(w[1]==='dress'){Object.assign(o,DRESSES.find(d=>d.id===w[2]));o.coat=null;drawFuka(c,x,y+54,{outfit:o,t:0,sc:1.5});}else if(w[1]==='hat'){o.acc=w[2];drawFuka(c,x,y+118,{outfit:o,t:0,sc:2.6});}else{o.item=w[2]==='none'?null:w[2];drawFuka(c,x,y+54,{outfit:o,t:0,sc:1.5});}}
    else{if(w[1]==='wear')drawRikki(c,x,y+44,{sc:2.2,t:0,wear:rkWear(w[2]),hat:'none',toy:false});else if(w[1]==='hat')drawRikki(c,x,y+72,{sc:2.8,t:0,hat:w[2],toy:false});else drawRikki(c,x,y+44,{sc:2.2,t:0,toy:w[2]==='none'?false:w[2],hat:'none'});}
    c.restore();if(!own){c.fillStyle='rgba(255,255,255,.85)';circ(c,x,y-2,30);txt(c,'？',x,y-6,34,'#8a90b0');c.fillStyle='#b8bccc';rr(c,x-12,y+30,24,18,4);c.fill();c.strokeStyle='#b8bccc';c.lineWidth=4;c.beginPath();c.arc(x,y+30,8,Math.PI,TAU);c.stroke();}
    else{c.font=`800 12px ${FONT}`;const nm=w[3].length>9?w[3].slice(0,9)+'…':w[3];c.fillStyle='rgba(255,255,255,.85)';rr(c,x-48,y+36,96,20,8);c.fill();txt(c,nm,x,y+46,12,'#6a5a8a');}},
  draw(c){roomBg(c,'#eef8ff','#d8ecfa',H-330,'#e0f2ff',[['window',110,260,1,150,120,'#bfe0ff'],['lamp',W-120,150]]);
    const pr=this.pose>0;const py=H-350;c.fillStyle='rgba(255,255,255,.55)';ell(c,W/2,py,230,30);
    fu(c,W/2-90,py,Math.min(4.8,(H-560)/62),{happy:1,cheer:pr||this.photo>0,dir:0});drawRikki(c,W/2+120,py,{sc:Math.min(3.2,(H-560)/80),t:T,happy:1,clap:pr?1:0});this.rkPos={x:W/2+120,y:py,sc:3};
    // tabs
    const ty=H-340;[['fu','ふーちゃん','#ff8cc0'],['rk','リッキー','#5aa8ff']].forEach(([id,n,col],i)=>{const x=W/2+(i-.5)*200;c.fillStyle=this.who===id?col:'#fff';rr(c,x-92,ty-50,184,44,22);c.fill();c.strokeStyle=col;c.lineWidth=4;c.stroke();txt(c,n,x,ty-28,22,this.who===id?'#fff':col);});
    panel(c,12,ty,W-24,H-ty-6,24,'#fff','#bfe0ff',4);const cats=DCATS[this.who];cats.forEach(([id,n],i)=>{const x=W/2+(i-(cats.length-1)/2)*134;c.fillStyle=this.cat===id?'#5aa8ff':'#eef6ff';rr(c,x-60,ty+10,120,36,18);c.fill();txt(c,n,x,ty+28,18,this.cat===id?'#fff':'#5a88c8');});
    for(const g of this.grid())this.drawTile(c,g);
    drawBtn(c,W-56,150,38,'#ffb03a','camera',true);
    if(this.photo>0){c.fillStyle=`rgba(255,255,255,${Math.max(0,1-this.photo*2)})`;c.fillRect(-OX/SC,-OY/SC,W+2*OX/SC,H+2*OY/SC);if(this.photo>.3&&this.photo<2.2){c.strokeStyle='#fff';c.lineWidth=14;rr(c,W/2-270,py-330,540,370,14);c.stroke();txtO(c,'はい チーズ！',W/2,py-350,34,'#ff5fa2','#fff',8);}}
    txt(c,`${WARD.filter(owns).length} / ${WARD.length}`,W/2,H-24,16,'#a0b0c8');},
  down(x,y){const ty=H-340;
    [['fu'],['rk']].forEach(([id],i)=>{const bx=W/2+(i-.5)*200;if(Math.abs(x-bx)<92&&Math.abs(y-(ty-28))<24){this.who=id;this.cat=DCATS[id][0][0];sfx('tap');say(id==='fu'?'ふーちゃんの おようふく':'リッキーの おようふく');}});
    const cats=DCATS[this.who];cats.forEach(([id,n],i)=>{const bx=W/2+(i-(cats.length-1)/2)*134;if(Math.abs(x-bx)<60&&Math.abs(y-(ty+28))<20){this.cat=id;sfx('tap');}});
    for(const g of this.grid()){if(Math.abs(x-g.x)<50&&Math.abs(y-g.y)<57){if(!owns(g.w)){sfx('no');say('まだ もっていないよ。 おしごとを がんばると もらえるよ！');}else{wearNow(g.w);sfx('spark');this.pose=1.2;burst(this.who==='fu'?W/2-90:W/2+120,H-520,14,'heart');say(g.w[3]+'！ '+pick(['にあうね！','かわいい！','すてき！']));}return;}}
    if(hitC(x,y,W-56,150,44)&&!this.photo){this.photo=.01;sfx('shutter');confetti(50);}
    if(this.rkPos&&rkHit(x,y,this.rkPos.x,this.rkPos.y,3)){RK.hop=1;rkCheer();say(pick(['りっきー かわいい？','きゃっきゃ！']));}
    else if(hitC(x,y,W/2-90,H-500,90)){sfx('boing');this.pose=1;say(pick(['にあう？','かわいい おいしゃさん！','きょうも がんばるぞ！']));}}};

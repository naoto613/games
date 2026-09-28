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

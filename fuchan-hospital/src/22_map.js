// ================= びょういん マップ（よこから みた たてもの を あるく） =================
const MFH=300,MROOF=280,MSTW=160,MRW=280,MNF=4;
const MGROUND=MROOF+MNF*MFH,MBW=MSTW+4*MRW,MWW=MBW+160,MWH=MGROUND+150;
const MAPF=[['reception','pharmacy','dress','ambulance'],['naika','geka','dentist','body'],['checkup','nursery','wash','meal'],['pet','toy','kids','lounge']];
const MINFO={reception:['うけつけ','ばんごうで よばれるのを まつ ところだよ','#ffe8c8'],pharmacy:['くすりやさん','やくざいしさんが おくすりを わたすよ','#efe4ff'],dress:['ロッカールーム','ここで おきがえ できるよ','#e4f2ff'],ambulance:['きゅうきゅう いりぐち','きゅうきゅうしゃが とまっているよ','#ffe4e8'],
  naika:['しんさつしつ','おいしゃさんが びょうきを みるよ','#e6f4ff'],geka:['げか・レントゲン','けがの てあてや ほねの しゃしんを とるよ','#fff0f4'],dentist:['はいしゃさん','はの びょうきを なおすよ','#e8fff4'],body:['からだの としょしつ','からだの しくみを べんきょう するよ','#fff4ec'],
  checkup:['しょうにか けんしん','こどもの せの たかさや めを しらべるよ','#fff0f8'],nursery:['しんせいじしつ','うまれたての あかちゃんが いるよ','#fff4fa'],wash:['てあらい きょうしつ','てあらいを れんしゅう するよ','#eaf8ff'],meal:['びょうとう','にゅういん している ひとの おへやだよ','#eaffea'],
  pet:['どうぶつびょういん','どうぶつの おいしゃさん じゅういさんが いるよ','#fff4e8'],toy:['ぬいぐるみ びょういん','こわれた ぬいぐるみを なおすよ','#fff6ee'],kids:['キッズルーム','まちじかんに あそぶ おへや','#fffbe0'],lounge:['ラウンジ','ひとやすみ する ところ','#f0f6ff']};
let MAPPOS=null;
function mFloorY(f){return MGROUND-f*MFH;}
SCN.lobby={bg:'#9ad8ff',song:'clinic',noHome:1,noRk:1,hud:false,bubY:108,
  enter(){if(!MAPPOS)MAPPOS={f:0,x:MSTW+MRW*.5};this.fx=MAPPOS.x;this.fy=mFloorY(MAPPOS.f);this.ff=MAPPOS.f;this.wps=[];this.dir=0;this.moving=0;this.hist=[];this.near=null;this.pend=null;this.pan=null;
    this.camX=clamp(this.fx-W/2,0,MWW-W);this.camY=this.camTarget().y;this.follow=1;
    this.npcs=[0,1,2,3].map(f=>Object.assign(newPatient(),{f,x:rand(MSTW+60,MBW-60),tx:rand(MSTW+60,MBW-60),wait:rand(0,3),gown:pick(['#bfe0ff','#ffd0e4','#d8f0c8',null])}));
    this.balls=[...Array(14)].map((_,i)=>({x:rand(10,110),y:rand(0,30),c:pick(['#ff6f91','#ffd23a','#5aa8ff','#6cd08a','#b48cff'])}));
    const nr=this.roomAt(MAPPOS.f,this.fx);if(nr&&MAPPOS.back){this.near=nr;}MAPPOS.back=0;
    if(!this.greeted){this.greeted=1;say('ふーちゃん びょういんへ ようこそ！ いきたい おへやを タッチしてね。 かいだんで うえの かいにも いけるよ');}else say(pick(['つぎは どこへ いく？','どの おへやに いこうかな？','きょうも がんばろうね！']));},
  camTarget(){return{x:clamp(this.fx-W/2,0,MWW-W),y:clamp(this.fy-H*.64,0,Math.max(0,MWH-H))};},
  roomAt(f,x){if(x<MSTW||x>=MBW)return null;const i=Math.floor((x-MSTW)/MRW);return{f,i,id:MAPF[f][i],cx:MSTW+i*MRW+MRW/2};},
  goTo(f,x){const wps=[];let cf=this.ff;const cur=this.wps.length?null:null;
    while(cf<f){wps.push({f:cf,x:150});wps.push({f:cf+1,x:30,climb:1});cf++;}
    while(cf>f){wps.push({f:cf,x:30});wps.push({f:cf-1,x:150,climb:1});cf--;}
    wps.push({f,x});this.wps=wps;this.follow=1;this.panTo=null;},
  update(dt){const sp=this.wps.length&&this.wps[0].climb?170:270;
    if(this.wps.length){const w=this.wps[0],tx=w.x,ty=mFloorY(w.f);const dx=tx-this.fx,dy=ty-this.fy,d=Math.hypot(dx,dy);if(d<3){this.fx=tx;this.fy=ty;this.ff=w.f;this.wps.shift();if(!this.wps.length)this.arrive();}
      else{const k=Math.min(1,sp*dt/d);this.fx+=dx*k;this.fy+=dy*k;if(Math.abs(dx)>.5)this.dir=dx<0?1:2;if(w.climb&&Math.random()<dt*6)sfx('tick');}this.moving=1;this.hist.push([this.fx,this.fy]);if(this.hist.length>200)this.hist.shift();}
    else{this.moving=0;}
    if(this.panTo!=null){this.camX+=(this.panTo-this.camX)*Math.min(1,dt*6);if(Math.abs(this.panTo-this.camX)<1)this.panTo=null;}
    if(this.follow){const t=this.camTarget();this.camX+=(t.x-this.camX)*Math.min(1,dt*4);this.camY+=(t.y-this.camY)*Math.min(1,dt*4);}
    for(const n of this.npcs){if(n.wait>0){n.wait-=dt;continue;}const d=n.tx-n.x;if(Math.abs(d)<3){n.wait=rand(1.5,4);n.tx=rand(MSTW+60,MBW-60);}else{n.x+=Math.sign(d)*Math.min(Math.abs(d),55*dt);n.dir=d<0?-1:1;}}},
  arrive(){const r=this.roomAt(this.ff,this.fx);this.dir=0;if(this.pend&&r&&r.id===this.pend.id){this.near=r;const I=MINFO[r.id];sfx('bell');hush();speak(`ここは ${I[0]}。 ${I[1]}`);bub={text:`ここは ${I[0]}！`,t:0,life:2.6};if(r.id==='kids'||r.id==='lounge')this.near=null;}this.pend=null;},
  rkPosW(){const h=this.hist;const p=h.length>28?h[h.length-28]:[this.fx-70,this.fy];return this.moving?{x:p[0],y:p[1]}:{x:this.rkRest??(this.fx-70),y:this.fy};},
  drawRoom(c,f,i){const id=MAPF[f][i],x=MSTW+i*MRW,top=mFloorY(f)-MFH+22,h=MFH-22,y0=mFloorY(f),I=MINFO[id];
    c.fillStyle=I[2];c.fillRect(x,top,MRW,h);c.fillStyle='rgba(255,255,255,.35)';c.fillRect(x,top,MRW,h*.45);c.fillStyle=shade(I[2],-.06);c.fillRect(x,y0-60,MRW,60);c.fillStyle=shade(I[2],-.14);c.fillRect(x,y0-8,MRW,8);
    const cx=x+MRW/2,t=T;c.save();
    switch(id){
      case'reception':{c.fillStyle='#3a3050';rr(c,cx-60,top+64,120,56,8);c.fill();txt(c,String(1+Math.floor(t/3)%9),cx,top+94,34,'#ff9a3a',undefined,POP,400);c.fillStyle='#c8905a';rr(c,x+16,y0-38,110,12,5);c.fill();drawAnimal(c,'rabbit',x+44,y0-30,.34,{t,acc:'ribbon'});drawAnimal(c,'bear',x+96,y0-30,.34,{t:t+1});
        c.fillStyle='#ffb3d0';rr(c,x+160,y0-70,110,70,[12,12,0,0]);c.fill();c.fillStyle='#fff';c.fillRect(x+160,y0-74,110,8);drawAnimal(c,'cat',x+215,y0-60,.34,{t,acc:'cap',accC:'#fff'});MED.phone(c,x+250,y0-84,.4);break;}
      case'pharmacy':{for(let r=0;r<3;r++){c.fillStyle='#d8c0f0';c.fillRect(x+20,top+40+r*50,150,6);for(let k=0;k<5;k++)MED.bottle(c,x+36+k*30,top+26+r*50,.4);}c.fillStyle='#c8a0f0';rr(c,x+170,y0-80,100,80,[12,12,0,0]);c.fill();c.fillStyle='#fff';rr(c,x+184,y0-150,72,60,8);c.fill();crossSign(c,x+220,y0-120,12);drawAnimal(c,'sheep',x+220,y0-70,.34,{t});break;}
      case'dress':{const cols=['#ff9ac8','#8ad0ff','#ffd23a','#9ae07a'];for(let k=0;k<4;k++){c.fillStyle=cols[k];rr(c,x+16+k*42,top+60,38,h-80,6);c.fill();c.fillStyle='#fff';circ(c,x+46+k*42,top+60+(h-80)/2,3);}c.fillStyle='#e8f6ff';rr(c,x+196,top+50,64,110,30);c.fill();c.strokeStyle='#c8a870';c.lineWidth=5;c.stroke();c.fillStyle='rgba(255,255,255,.7)';ell(c,x+214,top+80,8,20);
        c.strokeStyle='#b0b8c8';c.lineWidth=3;c.beginPath();c.moveTo(x+180,top+40);c.lineTo(x+270,top+40);c.stroke();break;}
      case'ambulance':{c.fillStyle='#ffd0d8';c.fillRect(x+MRW-40,top,40,h);c.fillStyle='#ff4d6d';rr(c,cx-60,top+20,120,34,10);c.fill();txt(c,'きゅうきゅう',cx,top+37,17,'#fff');c.fillStyle=Math.floor(t*4)%2?'#ff3040':'#ff9aa0';circ(c,x+30,top+30,10);MED.stretcher(c,x+70,y0-26,1.2);MED.ambulance(c,x+190,y0-36,1.7);break;}
      case'naika':{c.fillStyle='#fff';rr(c,x+200,top+30,56,72,6);c.fill();c.strokeStyle='#9ac8e8';c.lineWidth=3;c.stroke();[.35,.28,.22,.16].forEach((r,k)=>MED.landolt(c,x+228,top+44+k*16,r,{a:k*1.57}));c.fillStyle='#e0e8f4';rr(c,x+20,y0-50,120,20,8);c.fill();c.fillStyle='#b0c0d8';c.fillRect(x+28,y0-30,8,30);c.fillRect(x+124,y0-30,8,30);
        c.fillStyle='#c8905a';rr(c,x+170,y0-70,100,14,4);c.fill();c.fillStyle='#5a6a8a';rr(c,x+190,y0-116,52,40,5);c.fill();c.fillStyle='#8ad0ff';rr(c,x+195,y0-111,42,30,3);c.fill();MED.steth(c,x+80,y0-80,.6);break;}
      case'geka':{c.fillStyle='#1a2a4a';rr(c,x+20,top+30,120,90,8);c.fill();c.save();c.beginPath();rr(c,x+20,top+30,120,90,8);c.clip();c.strokeStyle='#e8f6ff';c.lineWidth=4;c.beginPath();c.arc(x+80,top+56,14,0,TAU);c.moveTo(x+80,top+70);c.lineTo(x+80,top+110);c.moveTo(x+60,top+80);c.lineTo(x+100,top+80);c.stroke();c.restore();
        c.fillStyle='#fff';rr(c,x+150,y0-56,120,22,8);c.fill();c.fillStyle='#e8b8c8';c.fillRect(x+160,y0-34,8,34);c.fillRect(x+252,y0-34,8,34);drawAnimal(c,'dog',x+210,y0-52,.32,{t,sleep:1});MED.kit(c,x+70,y0-30,.8);break;}
      case'dentist':{c.fillStyle='#5ac8a0';c.beginPath();c.moveTo(x+60,y0-10);c.lineTo(x+100,y0-60);c.lineTo(x+190,y0-60);c.lineTo(x+220,y0-100);c.lineTo(x+236,y0-92);c.lineTo(x+206,y0-44);c.lineTo(x+110,y0-40);c.closePath();c.fill();c.fillStyle='#aab8c8';c.fillRect(x+140,y0-40,12,40);
        c.strokeStyle='#aab8c8';c.lineWidth=5;c.beginPath();c.moveTo(x+60,top+10);c.lineTo(x+60,top+60);c.lineTo(x+140,top+80);c.stroke();c.fillStyle='#fff8c0';ell(c,x+148,top+84,18,10);drawItem(c,'tooth',x+240,top+50,.7);break;}
      case'body':{c.fillStyle='#e8c8a0';for(let r=0;r<3;r++){c.fillRect(x+180,top+40+r*50,90,6);for(let k=0;k<6;k++){c.fillStyle=['#ff8cc0','#5aa8ff','#ffd23a','#6cd08a'][(k+r)%4];c.fillRect(x+186+k*14,top+14+r*50,10,26);}c.fillStyle='#e8c8a0';}
        c.strokeStyle='#f4f4ff';c.lineWidth=5;c.lineCap='round';const sx=x+80,sy=y0-20;c.beginPath();c.arc(sx,sy-160,16,0,TAU);c.moveTo(sx,sy-144);c.lineTo(sx,sy-70);c.moveTo(sx-26,sy-120);c.lineTo(sx+26,sy-120);c.moveTo(sx,sy-70);c.lineTo(sx-16,sy);c.moveTo(sx,sy-70);c.lineTo(sx+16,sy);c.moveTo(sx-26,sy-120);c.lineTo(sx-30,sy-80);c.moveTo(sx+26,sy-120);c.lineTo(sx+30,sy-80);c.stroke();c.strokeStyle='#c8c8d8';c.lineWidth=2;c.stroke();MED.heart(c,x+140,top+60,.7);break;}
      case'checkup':{MED.ruler(c,x+40,y0-80,1.6);MED.scale(c,x+110,y0-16,1);c.fillStyle='#fff';rr(c,x+170,top+30,90,60,6);c.fill();txt(c,'すくすく',x+215,top+60,16,'#ff5fa2');drawRikki(c,x+220,y0-10,{sc:1.1,t,toy:false,wear:rkWear('sky')});break;}
      case'nursery':{c.fillStyle='rgba(200,235,255,.5)';rr(c,x+14,top+40,MRW-28,h-60,12);c.fill();c.strokeStyle='#fff';c.lineWidth=6;c.stroke();for(let k=0;k<3;k++){const bx=x+60+k*80;c.fillStyle='#f8e0c0';rr(c,bx-32,y0-70,64,50,8);c.fill();drawRikki(c,bx,y0-36,{sc:.9,t:t+k,toy:false,sleep:1,wear:rkWear(['flower','mint','lemon'][k]),hat:'none'});c.strokeStyle='#d8a870';c.lineWidth=3;for(let j=0;j<5;j++){c.beginPath();c.moveTo(bx-30+j*15,y0-46);c.lineTo(bx-30+j*15,y0-20);c.stroke();}}break;}
      case'wash':{for(let k=0;k<2;k++){const sx=x+70+k*140;c.fillStyle='#c8e8ff';rr(c,sx-40,top+40,80,60,10);c.fill();c.fillStyle='rgba(255,255,255,.6)';c.fillRect(sx-30,top+48,10,40);c.fillStyle='#fff';rr(c,sx-46,y0-80,92,24,10);c.fill();c.fillStyle='#b8c4d8';c.fillRect(sx-4,y0-104,8,26);MED.soap(c,sx+30,y0-94,.5);c.fillStyle='#fff';c.fillRect(sx-4,y0-56,8,56);}drawDeco(c,['bubbles',x+140,y0-110,1]);break;}
      case'meal':{for(let k=0;k<2;k++){const bx=x+74+k*134;c.fillStyle='#d8e4f4';c.fillRect(bx-60,y0-110,8,110);c.fillStyle='#fff';rr(c,bx-56,y0-44,118,22,8);c.fill();drawAnimal(c,k?'panda':'pig',bx,y0-38,.36,{t:t+k,gown:k?'#ffd0e4':'#bfe0ff',sleep:k});c.fillStyle='#8ad0ff';rr(c,bx-40,y0-50,100,20,8);c.fill();}c.fillStyle='#c8905a';rr(c,x+120,y0-60,40,10,3);c.fill();drawItem(c,'apple',x+140,y0-70,.4);break;}
      case'pet':{for(let k=0;k<2;k++){const bx=x+50+k*80;c.strokeStyle='#b0b8c8';c.lineWidth=3;rr(c,bx-34,y0-80,68,60,6);c.stroke();drawAnimal(c,k?'cat':'dog',bx,y0-24,.34,{t:t+k,happy:1});for(let j=0;j<5;j++){c.beginPath();c.moveTo(bx-34+j*17,y0-80);c.lineTo(bx-34+j*17,y0-20);c.stroke();}}c.fillStyle='#e8eef8';rr(c,x+190,y0-60,80,16,6);c.fill();c.fillStyle='#b0c0d8';c.fillRect(x+226,y0-44,8,44);drawAnimal(c,'rabbit',x+230,y0-60,.3,{t,happy:1});drawItem(c,'bone',x+230,top+50,.6);break;}
      case'toy':{c.fillStyle='#e8c8a0';c.fillRect(x+20,top+80,150,6);['bear','rabbit','cat','dog'].forEach((a,k)=>drawAnimal(c,a,x+38+k*36,top+78,.26,{t:t+k,plush:1,happy:1}));c.fillStyle='#c8905a';rr(c,x+170,y0-54,100,12,4);c.fill();c.fillRect(x+180,y0-42,8,42);c.fillRect(x+254,y0-42,8,42);MED.needle(c,x+200,y0-70,.6);MED.cotton(c,x+245,y0-66,.6);drawAnimal(c,'sheep',x+80,y0-10,.4,{t,plush:1,happy:1});break;}
      case'kids':{c.fillStyle='#ffb3d0';c.beginPath();c.moveTo(x+30,y0);c.lineTo(x+30,y0-120);c.lineTo(x+60,y0-120);c.lineTo(x+150,y0-10);c.lineTo(x+130,y0);c.closePath();c.fill();c.fillStyle='#5aa8ff';rr(c,x+150,y0-50,120,50,10);c.fill();for(const b of this.balls){c.fillStyle=b.c;circ(c,x+160+b.x,y0-40+b.y*.8,8);}drawAnimal(c,'chick',x+200,y0-40,.3,{t,happy:1,dance:1});break;}
      case'lounge':{c.fillStyle='#bfe8ff';rr(c,x+20,top+30,150,100,10);c.fill();c.strokeStyle='#fff';c.lineWidth=6;c.stroke();c.fillStyle='#8ee07a';ell(c,x+95,top+130,70,14);c.fillStyle='#ff9ac8';rr(c,x+30,y0-50,130,30,12);c.fill();rr(c,x+30,y0-74,130,28,12);c.fill();c.fillStyle='#ff4d6d';rr(c,x+200,y0-150,64,150,8);c.fill();c.fillStyle='#fff';rr(c,x+208,y0-140,48,60,4);c.fill();for(let k=0;k<6;k++){c.fillStyle=['#ffd23a','#5aa8ff','#6cd08a'][k%3];rr(c,x+212+(k%3)*15,y0-136+Math.floor(k/3)*28,10,22,3);c.fill();}break;}
    }c.restore();
    // sign
    const g=ROOMS.find(q=>q.id===id);const sw=Math.max(110,I[0].length*16+30);c.fillStyle=g?g.col:'#b8c8e0';rr(c,cx-sw/2,top+4,sw,28,14);c.fill();txt(c,I[0],cx,top+18,I[0].length>9?13:15,'#fff');
    if(g&&g.id!=='dress'){const pl=lvOf(id);for(let k=0;k<3;k++){c.fillStyle=pl>k?'#ffd23a':'rgba(200,200,220,.6)';star(c,cx-16+k*16,top+44,7,3);c.fill();}}
    if(this.near&&this.near.id===id){const by=top+96+Math.sin(T*5)*5;c.fillStyle='rgba(90,40,110,.2)';rr(c,cx-62,by-24,124,52,26);c.fill();c.fillStyle='#ff5fa2';rr(c,cx-64,by-28,128,52,26);c.fill();c.strokeStyle='#fff';c.lineWidth=4;c.stroke();txt(c,'▶ はいる',cx,by-2,22,'#fff');}},
  drawStairs(c,f){const y0=mFloorY(f),top=y0-MFH+22;c.fillStyle='#dfe6f2';c.fillRect(0,top,MSTW,MFH-22);if(f<MNF-1){const y1=mFloorY(f+1);c.fillStyle='#c8d0e0';const n=9;for(let k=0;k<n;k++){const sx=150-(k+1)*(120/n),sy=y0-(k+1)*((y0-y1)/n);c.fillRect(sx,sy,120/n+2,y0-sy);}c.strokeStyle='#a8b4c8';c.lineWidth=4;c.beginPath();c.moveTo(154,y0-60);c.lineTo(34,y1-60);c.stroke();}
    c.fillStyle='#8a98b8';rr(c,16,top+8,64,24,12);c.fill();txt(c,`${f+1}F`,48,top+20,16,'#fff');if(f===0){c.fillStyle='#bfe8ff';rr(c,MSTW-150,y0-120,0,0,0);}},
  draw(c){const L=-OX/SC-2,R=W+OX/SC+2,TP=-OY/SC-2;c.fillStyle=vfill(c,TP,H,'#8fd8ff',.3,0);c.fillRect(L,TP,R-L,H+OY/SC*2+4);
    c.save();c.translate(-Math.round(this.camX),-Math.round(this.camY));const cx0=this.camX-OX/SC-10,cx1=this.camX+W+OX/SC+10,cy0=this.camY-OY/SC-10,cy1=this.camY+H+OY/SC+10;
    for(let i=0;i<5;i++){const x=((i*260+T*12)%(MWW+300))-150,y=60+i*40;c.fillStyle='rgba(255,255,255,.85)';circ(c,x,y,26);circ(c,x+28,y-10,32);circ(c,x+60,y,24);}
    // ground & street
    c.fillStyle='#8ee07a';c.fillRect(-400,MGROUND,MWW+800,40);c.fillStyle='#b8b8c8';c.fillRect(-400,MGROUND+40,MWW+800,110);c.fillStyle='#fff';for(let x=-400;x<MWW+400;x+=90)c.fillRect(x,MGROUND+92,46,6);
    MED.ambulance(c,MBW+80,MGROUND+60,1.6);drawDeco(c,['plant',MBW+40,MGROUND,1]);
    // building
    c.fillStyle='#fff';rr(c,-14,MROOF-40,MBW+28,MNF*MFH+40,[18,18,0,0]);c.fill();c.strokeStyle='#c8d8f0';c.lineWidth=6;c.stroke();
    c.fillStyle='#ff9ac8';rr(c,-24,MROOF-60,MBW+48,30,15);c.fill();crossSign(c,MBW/2,MROOF-120,34);txtO(c,'ふーちゃん びょういん',MBW/2,MROOF-190,46,'#fff','#e0508a',10);
    c.fillStyle='#8a98b8';c.beginPath();c.arc(MBW-160,MROOF-40,56,Math.PI,TAU);c.fill();txt(c,'H',MBW-160,MROOF-66,40,'#fff',undefined,POP,400);
    for(let f=0;f<MNF;f++){const y0=mFloorY(f);if(y0<cy0||y0-MFH>cy1)continue;this.drawStairs(c,f);for(let i=0;i<4;i++){const x=MSTW+i*MRW;if(x+MRW<cx0||x>cx1)continue;this.drawRoom(c,f,i);}
      c.fillStyle='#e0e6f0';c.fillRect(-14,y0-MFH,MBW+28,22);c.fillStyle='#c8d0e0';for(let i=0;i<=4;i++){const x=MSTW+i*MRW;c.fillRect(x-6,y0-MFH+22,12,MFH-150);}}
    c.fillStyle='#d0d8e8';c.fillRect(-14,MGROUND-6,MBW+28,12);
    // npcs
    for(const n of this.npcs){const y=mFloorY(n.f);if(y<cy0||y-120>cy1)continue;c.save();if(n.dir<0){c.translate(n.x,0);c.scale(-1,1);c.translate(-n.x,0);}drawAnimal(c,n.k,n.x,y-8,.46,{t:T+n.f,hop:n.wait>0?0:Math.abs(Math.sin(T*6))*.3,gown:n.gown,acc:n.acc,accC:n.accC});c.restore();}
    // rikki & fu-chan
    const rp=this.rkPosW();drawRikki(c,rp.x,rp.y-6,{sc:1.3,t:T,moving:this.moving,dir:this.dir===1?1:0,happy:!this.moving});this.rkW=rp;
    drawFuka(c,this.fx,this.fy-6,{outfit:fuOutfit(),t:T,sc:1.9,steth:true,moving:this.moving,dir:this.moving?this.dir:0,wave:!this.moving&&(T%7)<1,cheer:REACT.t>0&&REACT.k==='good'});
    if(this.pend){const tx=this.pend.cx,ty=mFloorY(this.pend.f);c.strokeStyle=`rgba(255,95,162,${.6+Math.sin(T*6)*.3})`;c.lineWidth=4;c.beginPath();c.ellipse(tx,ty-4,30,8,0,0,TAU);c.stroke();}
    c.restore();
    // header
    c.fillStyle='rgba(255,154,200,.92)';c.fillRect(L,TP,R-L,96-TP);txtO(c,'ふーちゃん びょういん',W/2-70,50,28,'#fff','#e0508a',8);const ri=rankIdx();c.fillStyle='#fff';rr(c,W-168,30,156,40,20);c.fill();MED.love(c,W-146,50,.5);txt(c,`${SAVE.hearts}`,W-126,51,20,'#ff4d7d','left');txt(c,RANKS[ri][1].replace(' ',''),W-22,51,12,'#8a5a9a','right');
    // floor buttons
    for(let f=0;f<MNF;f++){const bx=W-34,by=H*.5+(1.5-f)*62;const on=this.ff===f;c.fillStyle=on?'#ff8cc0':'rgba(255,255,255,.9)';circ(c,bx,by,24);c.strokeStyle='#ff8cc0';c.lineWidth=3;c.beginPath();c.arc(bx,by,24,0,TAU);c.stroke();txt(c,`${f+1}F`,bx,by+1,16,on?'#fff':'#ff5fa2');}
    const cx=this.panTo??this.camX;if(cx>2)drawBtn(c,44,H-54,34,'#8ad0ff','prev',idle>5);if(cx<MWW-W-2)drawBtn(c,W-44,H-54,34,'#8ad0ff','next',idle>5);},
  down(x,y){this.pan={x,y,cx:this.camX,cy:this.camY,moved:0};},
  move(x,y){const p=this.pan;if(!p)return;const d=Math.hypot(x-p.x,y-p.y);if(d>14)p.moved=1;if(p.moved){this.follow=0;this.panTo=null;this.camX=clamp(p.cx-(x-p.x),0,MWW-W);this.camY=clamp(p.cy-(y-p.y),0,Math.max(0,MWH-H));}},
  up(x,y){const p=this.pan;this.pan=null;if(!p||p.moved)return;this.tap(x,y);},
  tap(x,y){for(let f=0;f<MNF;f++){const bx=W-34,by=H*.5+(1.5-f)*62;if(hitC(x,y,bx,by,28)){sfx('tap');this.pend=null;this.near=null;this.goTo(f,MSTW+40);hush();speak(`${f+1}かい`);return;}}
    if(hitC(x,y,44,H-54,42)){this.follow=0;this.panTo=clamp((this.panTo??this.camX)-MRW,0,MWW-W);sfx('whoosh');return;}if(hitC(x,y,W-44,H-54,42)){this.follow=0;this.panTo=clamp((this.panTo??this.camX)+MRW,0,MWW-W);sfx('whoosh');return;}
    if(y<96)return;const wx=x+this.camX,wy=y+this.camY;
    // fu-chan / rikki
    if(Math.abs(wx-this.fx)<34&&wy>this.fy-120&&wy<this.fy){sfx('boing');REACT.k='good';REACT.t=1;say(pick(['きょうも がんばるぞ！',`いまは ${RANKS[rankIdx()][1]} だよ！`,'どこへ いこうかな？']));return;}
    const rp=this.rkW;if(rp&&Math.abs(wx-rp.x)<26&&wy>rp.y-70&&wy<rp.y){RK.hop=1;rkCheer();say(pick(RKLINES));return;}
    for(const n of this.npcs){const ny=mFloorY(n.f);if(Math.abs(wx-n.x)<30&&wy>ny-70&&wy<ny){sfx('boing');hush();speak(`${WORDS[n.k][0]}さん、 こんにちは！`);speak(`Hello, ${WORDS[n.k][1]}!`,'en');card={k:n.k,ja:WORDS[n.k][0],en:WORDS[n.k][1],t:0};return;}}
    let f=-1;for(let k=0;k<MNF;k++){const y0=mFloorY(k);if(wy<=y0&&wy>y0-MFH)f=k;}if(f<0)return;
    if(wx<MSTW){this.pend=null;this.near=null;this.goTo(f,90);sfx('tap');return;}
    const r=this.roomAt(f,wx);if(!r)return;
    if(r.id==='kids'&&this.near===null&&this.ff===f&&Math.abs(this.fx-r.cx)<60){for(const b of this.balls){b.x=rand(10,110);b.y=rand(-40,30);}sfx('boing');say('ボールプール たのしい！');return;}
    if(r.id==='lounge'&&this.ff===f&&Math.abs(this.fx-r.cx)<60){sfx('coin');say('ジュースで ひとやすみ。 ごくごく！');return;}
    if(this.near&&this.near.id===r.id&&this.near.f===f){this.enterRoom(r);return;}
    this.near=null;this.pend=r;this.goTo(f,r.cx);sfx('tap');const I=MINFO[r.id];hush();speak(`${I[0]}へ いこう！`);},
  enterRoom(r){if(r.id==='kids'||r.id==='lounge')return;sfx('pop');MAPPOS={f:r.f,x:r.cx,back:1};go(r.id);}};

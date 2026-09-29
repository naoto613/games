// ================= びょういん マップ（よこから みた たてもの を あるく） =================
const MFH=300,MROOF=280,MSTW=160,MRW=280;
// たてもの（びょういん と しかいいん）
const BLDS={hosp:{floors:[['reception','pharmacy','dress','ambulance'],['naika','geka','shop','body'],['checkup','nursery','wash','meal'],['pet','toy','kids','lounge'],['eye','heli']],ww:1000,name:'ふーちゃん びょういん',col:'#ff9ac8',oc:'#e0508a',to:'dent',toName:'しかいいん'},
  dent:{floors:[['dreception','dcheck','dxray'],['dtreat','dstain','dfluor'],['dscale','dbaby','dshape'],['dortho','dcrown','dentist']],ww:560,name:'ふーちゃん しかいいん',col:'#5ac8a8',oc:'#2a9a7a',to:'hosp',toName:'びょういん'}};
const NOGAME=['kids','lounge','dreception','shop'];
let MNF,MGROUND,MBW,MWW,MWH,MAPF,CURB='hosp';const MAPPOSB={hosp:null,dent:null};
const MINFO={reception:['うけつけ','ばんごうで よばれるのを まつ ところだよ','#ffe8c8'],pharmacy:['くすりやさん','やくざいしさんが おくすりを わたすよ','#efe4ff'],dress:['ロッカールーム','ここで おきがえ できるよ','#e4f2ff'],ambulance:['きゅうきゅう いりぐち','きゅうきゅうしゃが とまっているよ','#ffe4e8'],
  naika:['しんさつしつ','おいしゃさんが びょうきを みるよ','#e6f4ff'],geka:['げか・レントゲン','けがの てあてや ほねの しゃしんを とるよ','#fff0f4'],dentist:['はいしゃさん','はの びょうきを なおすよ','#e8fff4'],body:['からだの としょしつ','からだの しくみを べんきょう するよ','#fff4ec'],
  checkup:['しょうにか けんしん','こどもの せの たかさや めを しらべるよ','#fff0f8'],nursery:['しんせいじしつ','うまれたての あかちゃんが いるよ','#fff4fa'],wash:['てあらい きょうしつ','てあらいを れんしゅう するよ','#eaf8ff'],meal:['びょうとう','にゅういん している ひとの おへやだよ','#eaffea'],
  eye:['がんか・めがねやさん','めの けんさを して めがねを つくるよ','#eef4ff'],heli:['ヘリポート いりぐち','ドクターヘリで しゅつどう するよ','#ffeef0'],
  pet:['どうぶつびょういん','どうぶつの おいしゃさん じゅういさんが いるよ','#fff4e8'],toy:['ぬいぐるみ びょういん','こわれた ぬいぐるみを なおすよ','#fff6ee'],kids:['キッズルーム','まちじかんに あそぶ おへや','#fffbe0'],lounge:['ラウンジ','ひとやすみ する ところ','#f0f6ff']};
let MAPPOS=null;
function setBld(b){MAPPOSB[CURB]=MAPPOS;CURB=b;const B=BLDS[b];MAPF=B.floors;MNF=MAPF.length;MGROUND=MROOF+MNF*MFH;MBW=MSTW+Math.max(...MAPF.map(q=>q.length))*MRW;MWW=MBW+B.ww;MWH=MGROUND+150;MAPPOS=MAPPOSB[b];}
setBld('hosp');let PENDB=null,PREVSC=null;
{const _g=go;go=function(id){if(!tr&&SCN[id])PREVSC=scene;_g(id);};}
function bldEnter(){// へやから もどった ときは その へやが ある たてものへ
  const pid=Object.keys(SCN).find(k=>SCN[k]===PREVSC);if(!PENDB&&pid)for(const b in BLDS){const fl=BLDS[b].floors;fl.forEach((row,f)=>{const i=row.indexOf(pid);if(i>=0&&b!==CURB){setBld(b);MAPPOS={f,x:MSTW+i*MRW+MRW/2,back:1};}});}
  if(PENDB){const pb=PENDB;PENDB=null;setBld(pb.b);if(pb.fresh)MAPPOS={f:0,x:MSTW+MRW*.5};return 1;}return 0;}
const MEXTRA={naika:[['curtain',80,30,.55,150],['sanitizer',160,110,.7]],geka:[['surglight',190,24,.55]],reception:[['sanitizer',236,110,.7]],
  meal:[['monitor',140,90,.45]],nursery:[['sanitizer',250,70,.6]],checkup:[['bpwall',130,120,.6]],pet:[['sink',220,-80,.5]],dentist:[['sanitizer',250,120,.6]],pharmacy:[['sanitizer',250,70,.6]],eye:[['sanitizer',170,80,.6]]};
function mapRoomReal(c,x,top,h,y0){// てんじょうの あかり・てすり・ゆかの つや
  for(let k=0;k<2;k++){const lx=x+70+k*140;c.fillStyle='#fffef4';rr(c,lx-34,top,68,7,3);c.fill();const g=c.createLinearGradient(0,top,0,top+120);g.addColorStop(0,'rgba(255,252,225,.45)');g.addColorStop(1,'rgba(255,252,225,0)');c.fillStyle=g;c.beginPath();c.moveTo(lx-34,top+7);c.lineTo(lx+34,top+7);c.lineTo(lx+60,top+120);c.lineTo(lx-60,top+120);c.fill();}
  c.fillStyle='#c89a68';c.fillRect(x,y0-96,MRW,6);c.fillStyle='rgba(255,255,255,.35)';c.fillRect(x,y0-96,MRW,2);
  const g=c.createLinearGradient(0,y0-60,0,y0);g.addColorStop(0,'rgba(255,255,255,0)');g.addColorStop(1,'rgba(255,255,255,.22)');c.fillStyle=g;c.fillRect(x,y0-60,MRW,52);
  c.strokeStyle='rgba(0,0,0,.05)';c.lineWidth=1;for(let k=1;k<5;k++){c.beginPath();c.moveTo(x+k*MRW/5,y0-60);c.lineTo(x+k*MRW/5,y0-8);c.stroke();}}
function mFloorY(f){return MGROUND-f*MFH;}
SCN.lobby={bg:'#9ad8ff',song:'clinic',noHome:1,noRk:1,hud:false,bubY:108,
  enter(){const sw=bldEnter();PT_PLAY=[];dailyGet();checkMedals();if(!MAPPOS)MAPPOS={f:0,x:MSTW+MRW*.5};this.fx=MAPPOS.x;this.fy=mFloorY(MAPPOS.f);this.ff=MAPPOS.f;this.wps=[];this.dir=0;this.moving=0;this.hist=[];this.near=null;this.pend=null;this.pan=null;
    this.camX=clamp(this.fx-W/2,0,MWW-W);this.camY=this.camTarget().y;this.follow=1;
    this.npcs=[...Array(MNF).keys()].map(f=>Object.assign(newPatient(),{f,mx:MSTW+MAPF[f].length*MRW-60,x:rand(MSTW+60,MSTW+MAPF[f].length*MRW-60),tx:MSTW+100,wait:rand(0,3),gown:pick(['#bfe0ff','#ffd0e4','#d8f0c8',null])}));
    this.balls=[...Array(14)].map((_,i)=>({x:rand(10,110),y:rand(0,30),c:pick(['#ff6f91','#ffd23a','#5aa8ff','#6cd08a','#b48cff'])}));
    const nr=this.roomAt(MAPPOS.f,this.fx);if(nr&&MAPPOS.back){this.near=nr;}MAPPOS.back=0;
    this.greetedB=this.greetedB||{};if(!this.greetedB[CURB]){this.greetedB[CURB]=1;say(CURB==='dent'?'ふーちゃん しかいいんへ ようこそ！ はいしゃさんの おしごとが 11しゅるい あるよ。 おへやを タッチしてね':'ふーちゃん びょういんへ ようこそ！ いきたい おへやを タッチしてね。 かいだんで うえの かいにも いけるよ');}else say(sw?`${BLDS[CURB].name}に ついたよ！`:pick(['つぎは どこへ いく？','どの おへやに いこうかな？','きょうも がんばろうね！']));},
  camTarget(){return{x:clamp(this.fx-W/2,0,MWW-W),y:clamp(this.fy-H*.64,0,Math.max(0,MWH-H))};},
  roomAt(f,x){if(x<MSTW||x>=MBW)return null;const i=Math.floor((x-MSTW)/MRW);if(i>=MAPF[f].length)return null;return{f,i,id:MAPF[f][i],cx:MSTW+i*MRW+MRW/2};},
  goTo(f,x){const wps=[];let cf=this.ff;const cur=this.wps.length?null:null;
    while(cf<f){wps.push({f:cf,x:150});wps.push({f:cf+1,x:30,climb:1});cf++;}
    while(cf>f){wps.push({f:cf,x:30});wps.push({f:cf-1,x:150,climb:1});cf--;}
    wps.push({f,x});this.wps=wps;this.follow=1;this.panTo=null;},
  update(dt){const sp=this.wps.length&&this.wps[0].climb?640:960;
    if(this.wps.length){const w=this.wps[0],tx=w.x,ty=mFloorY(w.f);const dx=tx-this.fx,dy=ty-this.fy,d=Math.hypot(dx,dy);if(d<3){this.fx=tx;this.fy=ty;this.ff=w.f;this.wps.shift();if(!this.wps.length)this.arrive();}
      else{const k=Math.min(1,sp*dt/d);this.fx+=dx*k;this.fy+=dy*k;if(Math.abs(dx)>.5)this.dir=dx<0?1:2;if(w.climb&&Math.random()<dt*6)sfx('tick');}this.moving=1;this.hist.push([this.fx,this.fy]);if(this.hist.length>200)this.hist.shift();}
    else{this.moving=0;}
    if(this.panTo!=null){this.camX+=(this.panTo-this.camX)*Math.min(1,dt*6);if(Math.abs(this.panTo-this.camX)<1)this.panTo=null;}
    if(this.follow){const t=this.camTarget();this.camX+=(t.x-this.camX)*Math.min(1,dt*10);this.camY+=(t.y-this.camY)*Math.min(1,dt*10);}
    for(const n of this.npcs){if(n.wait>0){n.wait-=dt;continue;}const d=n.tx-n.x;if(Math.abs(d)<3){n.wait=rand(1.5,4);n.tx=rand(MSTW+60,n.mx);}else{n.x+=Math.sign(d)*Math.min(Math.abs(d),55*dt);n.dir=d<0?-1:1;}}},
  arrive(){const r=this.roomAt(this.ff,this.fx);this.dir=0;if(this.pend&&r&&r.id===this.pend.id){this.near=r;const I=MINFO[r.id];sfx('bell');hush();speak(`ここは ${I[0]}。 ${I[1]}`);bub={text:`ここは ${I[0]}！`,t:0,life:2.6};if(NOGAME.includes(r.id))this.near=null;}if(this.pend&&this.pend.door&&this.ff===0&&this.fx>=MWW-200){this.pend=null;sfx('bell');MAPPOS={f:0,x:MSTW+MRW*.5};go('town');return;}this.pend=null;},
  rkPosW(){const h=this.hist;const p=h.length>9?h[h.length-9]:[this.fx-70,this.fy];return this.moving?{x:p[0],y:p[1]}:{x:this.rkRest??(this.fx-70),y:this.fy};},
  drawRoom(c,f,i){const id=MAPF[f][i],x=MSTW+i*MRW,top=mFloorY(f)-MFH+22,h=MFH-22,y0=mFloorY(f),I=MINFO[id];
    c.fillStyle=I[2];c.fillRect(x,top,MRW,h);c.fillStyle='rgba(255,255,255,.35)';c.fillRect(x,top,MRW,h*.45);c.fillStyle=shade(I[2],-.06);c.fillRect(x,y0-60,MRW,60);c.fillStyle=shade(I[2],-.14);c.fillRect(x,y0-8,MRW,8);
    mapRoomReal(c,x,top,h,y0);const cx=x+MRW/2,t=T;c.save();
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
      case'eye':{c.fillStyle='#fff';rr(c,x+20,top+50,90,110,6);c.fill();c.strokeStyle='#9ac8e8';c.lineWidth=3;c.stroke();['あ','い','う'].forEach((ch,k)=>txt(c,ch,x+65,top+74+k*30,24-k*6,'#3a3a5a'));c.fillStyle='#c8d4e8';rr(c,x+140,y0-110,20,110,6);c.fill();c.fillStyle='#5a6a8a';rr(c,x+124,y0-130,52,34,10);c.fill();c.fillStyle='#bfe8ff';circ(c,x+138,y0-113,9);circ(c,x+162,y0-113,9);
        c.fillStyle='#fff';rr(c,x+190,top+60,80,100,8);c.fill();for(let k=0;k<3;k++)drawGlasses(c,x+230,top+84+k*28,.5,GSHAPES[k][0],GCOLS[k][0]);break;}
      case'heli':{c.fillStyle='#ff4d6d';rr(c,cx-70,top+50,140,34,10);c.fill();txt(c,'ドクターヘリ',cx,top+67,16,'#fff');c.fillStyle='#e8eef8';rr(c,x+30,y0-120,80,120,[10,10,0,0]);c.fill();c.fillStyle='#bfe8ff';rr(c,x+40,y0-110,60,50,6);c.fill();txt(c,'▲ おくじょう',x+70,y0-40,12,'#5a88c8');
        c.fillStyle='#8a98b8';rr(c,x+150,y0-70,110,14,6);c.fill();drawAnimal(c,'bear',x+200,y0-70,.3,{t,acc:'cap',accC:'#ff4d6d'});MED.kit(c,x+180,y0-24,.6);break;}
      case'kids':{c.fillStyle='#ffb3d0';c.beginPath();c.moveTo(x+30,y0);c.lineTo(x+30,y0-120);c.lineTo(x+60,y0-120);c.lineTo(x+150,y0-10);c.lineTo(x+130,y0);c.closePath();c.fill();c.fillStyle='#5aa8ff';rr(c,x+150,y0-50,120,50,10);c.fill();for(const b of this.balls){c.fillStyle=b.c;circ(c,x+160+b.x,y0-40+b.y*.8,8);}drawAnimal(c,'chick',x+200,y0-40,.3,{t,happy:1,dance:1});break;}
      case'lounge':{c.fillStyle='#bfe8ff';rr(c,x+20,top+30,150,100,10);c.fill();c.strokeStyle='#fff';c.lineWidth=6;c.stroke();c.fillStyle='#8ee07a';ell(c,x+95,top+130,70,14);c.fillStyle='#ff9ac8';rr(c,x+30,y0-50,130,30,12);c.fill();rr(c,x+30,y0-74,130,28,12);c.fill();c.fillStyle='#ff4d6d';rr(c,x+200,y0-150,64,150,8);c.fill();c.fillStyle='#fff';rr(c,x+208,y0-140,48,60,4);c.fill();for(let k=0;k<6;k++){c.fillStyle=['#ffd23a','#5aa8ff','#6cd08a'][k%3];rr(c,x+212+(k%3)*15,y0-136+Math.floor(k/3)*28,10,22,3);c.fill();}break;}
    }if(DROOM[id])DROOM[id](c,x,top,h,y0);c.restore();for(const d of(MEXTRA[id]||[]))drawDeco(c,[d[0],x+d[1],d[2]<0?y0+d[2]:top+d[2],d[3],d[4]]);
    // sign
    const g=ROOMS.find(q=>q.id===id);const sw=Math.max(110,I[0].length*16+30);c.fillStyle=g?g.col:'#b8c8e0';rr(c,cx-sw/2,top+4,sw,28,14);c.fill();txt(c,I[0],cx,top+18,I[0].length>9?13:15,'#fff');
    const DL=SAVE.daily;if(DL&&DL.d===todayKey()&&DL.rooms.includes(id)){const dn=DL.done.includes(id),b=dn?0:Math.abs(Math.sin(T*4))*-8;c.fillStyle=dn?'#2ec07a':'#ffd23a';rr(c,cx+sw/2-6,top-6+b,dn?64:88,28,14);c.fill();c.strokeStyle='#fff';c.lineWidth=3;c.stroke();txt(c,dn?'クリア':'おねがい',cx+sw/2+(dn?26:38),top+8+b,14,dn?'#fff':'#a05a00');}
    if(g&&g.id!=='dress'){const pl=lvOf(id);for(let k=0;k<3;k++){c.fillStyle=pl>k?'#ffd23a':'rgba(200,200,220,.6)';star(c,cx-16+k*16,top+44,7,3);c.fill();}}
    if(this.near&&this.near.id===id){const by=top+96+Math.sin(T*5)*5;c.fillStyle='rgba(90,40,110,.2)';rr(c,cx-62,by-24,124,52,26);c.fill();c.fillStyle='#ff5fa2';rr(c,cx-64,by-28,128,52,26);c.fill();c.strokeStyle='#fff';c.lineWidth=4;c.stroke();txt(c,'▶ はいる',cx,by-2,22,'#fff');}},
  drawStairs(c,f){const y0=mFloorY(f),top=y0-MFH+22;c.fillStyle='#dfe6f2';c.fillRect(0,top,MSTW,MFH-22);if(f<MNF-1){const y1=mFloorY(f+1);c.fillStyle='#c8d0e0';const n=9;for(let k=0;k<n;k++){const sx=150-(k+1)*(120/n),sy=y0-(k+1)*((y0-y1)/n);c.fillRect(sx,sy,120/n+2,y0-sy);}c.strokeStyle='#a8b4c8';c.lineWidth=4;c.beginPath();c.moveTo(154,y0-60);c.lineTo(34,y1-60);c.stroke();}
    drawDeco(c,['exit',112,top+22,.8]);drawDeco(c,['extinguisher',140,y0-14,.7]);if(f===0)drawDeco(c,['aed',112,top+80,.7]);
    c.fillStyle='#8a98b8';rr(c,16,top+8,64,24,12);c.fill();txt(c,`${f+1}F`,48,top+20,16,'#fff');if(f===0){c.fillStyle='#bfe8ff';rr(c,MSTW-150,y0-120,0,0,0);}},
  draw(c){const L=-OX/SC-2,R=W+OX/SC+2,TP=-OY/SC-2;c.fillStyle=vfill(c,TP,H,'#8fd8ff',.3,0);c.fillRect(L,TP,R-L,H+OY/SC*2+4);
    c.save();c.translate(-Math.round(this.camX),-Math.round(this.camY));const cx0=this.camX-OX/SC-10,cx1=this.camX+W+OX/SC+10,cy0=this.camY-OY/SC-10,cy1=this.camY+H+OY/SC+10;
    for(let i=0;i<5;i++){const x=((i*260+T*12)%(MWW+300))-150,y=60+i*40;c.fillStyle='rgba(255,255,255,.85)';circ(c,x,y,26);circ(c,x+28,y-10,32);circ(c,x+60,y,24);}
    if(CURB==='hosp'&&hasDeco('rainbow')){const R0=MGROUND-mFloorY(MNF-1)+560;['#ff5f6f','#ffa94d','#ffe066','#69db7c','#4dabf7','#748ffc','#b197fc'].forEach((col,i)=>{c.strokeStyle=col;c.globalAlpha=.42;c.lineWidth=26;c.beginPath();c.arc(MWW/2,MGROUND,R0-i*26,Math.PI,TAU);c.stroke();});c.globalAlpha=1;}
    if(CURB==='hosp'&&hasDeco('fireworks'))mapFireworks(c,mFloorY(MNF-1)-MFH);
    // ground & street
    c.fillStyle='#8ee07a';c.fillRect(-400,MGROUND,MWW+800,40);c.fillStyle='#b8b8c8';c.fillRect(-400,MGROUND+40,MWW+800,110);c.fillStyle='#fff';for(let x=-400;x<MWW+400;x+=90)c.fillRect(x,MGROUND+92,46,6);
    const BB=BLDS[CURB];if(CURB==='hosp'){MED.ambulance(c,MBW+80,MGROUND+60,1.6);drawDeco(c,['plant',MBW+40,MGROUND,1]);mapPark(c);}else dentYard(c);mapDoor(c,BB);
    // building
    const TW=(MSTW+MAPF[MNF-1].length*MRW),y4=mFloorY(MNF-1)-MFH;c.fillStyle='#fff';c.strokeStyle='#c8d8f0';c.lineWidth=6;rr(c,-14,y4+MFH-40,MBW+28,(MNF-1)*MFH+40,[18,18,0,0]);c.fill();c.stroke();rr(c,-14,y4-40,TW+28,MFH+40,[18,18,0,0]);c.fill();c.stroke();
    c.fillStyle=BB.col;rr(c,-24,y4-60,TW+48,30,15);c.fill();if(CURB==='hosp')crossSign(c,TW/2,y4-120,34);else{c.fillStyle='#fff';circ(c,TW/2,y4-120,46);drawItem(c,'tooth',TW/2,y4-120,1);}txtO(c,BB.name,TW/2,y4-190,46,'#fff',BB.oc,10);
    const hpx=(TW+MBW)/2+10,hpy=y4+MFH-40;if(CURB==='dent')dentRoof(c,MBW-300,y4-58);else{c.fillStyle='#b8c4d8';rr(c,TW+20,hpy-14,MBW-TW-30,16,6);c.fill();c.fillStyle='#8a98b8';c.beginPath();c.ellipse(hpx,hpy-14,150,22,0,0,TAU);c.fill();c.strokeStyle='#fff';c.lineWidth=4;c.beginPath();c.ellipse(hpx,hpy-14,120,16,0,0,TAU);c.stroke();txt(c,'H',hpx,hpy-15,26,'#fff',undefined,POP,400);MED.heli(c,hpx,hpy-56,2.2,{spin:T*2});
    c.fillStyle='#ff4d6d';for(let k=0;k<4;k++){circ(c,TW+40+k*((MBW-TW-60)/3),hpy-24,Math.floor(T*3+k)%2?6:3);}}
    for(let f=0;f<MNF;f++){const y0=mFloorY(f);if(y0<cy0||y0-MFH>cy1)continue;this.drawStairs(c,f);for(let i=0;i<MAPF[f].length;i++){const x=MSTW+i*MRW;if(x+MRW<cx0||x>cx1)continue;this.drawRoom(c,f,i);}
      const fw=f===MNF-1?MSTW+MAPF[f].length*MRW:MBW;c.fillStyle='#e0e6f0';c.fillRect(-14,y0-MFH,fw+28,22);c.fillStyle='#c8d0e0';for(let i=0;i<=MAPF[f].length;i++){const x=MSTW+i*MRW;c.fillRect(x-6,y0-MFH+22,12,MFH-150);}}
    c.fillStyle='#d0d8e8';c.fillRect(-14,MGROUND-6,MBW+28,12);if(CURB==='hosp')mapBuildDeco(c,TW,y4);
    // npcs
    for(const n of this.npcs){const y=mFloorY(n.f);if(y<cy0||y-120>cy1)continue;c.save();if(n.dir<0){c.translate(n.x,0);c.scale(-1,1);c.translate(-n.x,0);}drawAnimal(c,n.k,n.x,y-8,.46,{t:T+n.f,hop:n.wait>0?0:Math.abs(Math.sin(T*6))*.3,gown:n.gown,acc:n.acc,accC:n.accC});c.restore();}
    // rikki & fu-chan
    const rp=this.rkPosW();drawRikki(c,rp.x,rp.y-6,{sc:1.3,t:T,moving:this.moving,dir:this.dir===1?1:0,happy:!this.moving});this.rkW=rp;
    drawFuka(c,this.fx,this.fy-6,{outfit:fuOutfit(),t:T,sc:1.9,steth:true,moving:this.moving,dir:this.moving?this.dir:0,wave:!this.moving&&(T%7)<1,cheer:REACT.t>0&&REACT.k==='good'});
    if(this.pend){const tx=this.pend.cx,ty=mFloorY(this.pend.f);c.strokeStyle=`rgba(255,95,162,${.6+Math.sin(T*6)*.3})`;c.lineWidth=4;c.beginPath();c.ellipse(tx,ty-4,30,8,0,0,TAU);c.stroke();}
    c.restore();
    // header
    c.fillStyle='rgba(255,154,200,.92)';c.fillRect(L,TP,R-L,96-TP);txtO(c,BLDS[CURB].name,W/2-50,50,26,'#fff',BLDS[CURB].oc,8);c.fillStyle='#fff';rr(c,6,24,78,54,27);c.fill();c.strokeStyle=BLDS[CURB].oc;c.lineWidth=3;c.stroke();c.fillStyle=BLDS[CURB].oc;c.beginPath();c.moveTo(18,50);c.lineTo(32,38);c.lineTo(32,62);c.fill();txt(c,'まち',56,44,15,BLDS[CURB].oc);txt(c,'へ',56,62,13,BLDS[CURB].oc);const ri=rankIdx();c.fillStyle='#fff';rr(c,W-200,30,188,40,20);c.fill();MED.love(c,W-178,50,.5);txt(c,`${SAVE.hearts}`,W-158,51,20,'#ff4d7d','left');const rn=RANKS[ri][1].replace(/ /g,'');txt(c,rn,W-22,51,rn.length>8?10:12,'#8a5a9a','right');
    // floor buttons
    for(let f=0;f<MNF;f++){const bx=W-34,by=H*.5+(2-f)*58;const on=this.ff===f;c.fillStyle=on?'#ff8cc0':'rgba(255,255,255,.9)';circ(c,bx,by,24);c.strokeStyle='#ff8cc0';c.lineWidth=3;c.beginPath();c.arc(bx,by,24,0,TAU);c.stroke();txt(c,`${f+1}F`,bx,by+1,16,on?'#fff':'#ff5fa2');}
    this.drawCollectUI(c);const cx=this.panTo??this.camX;if(cx>2)drawBtn(c,44,H-54,34,'#8ad0ff','prev',idle>5);if(cx<MWW-W-2)drawBtn(c,W-44,H-54,34,'#8ad0ff','next',idle>5);},
  down(x,y){this.pan={x,y,cx:this.camX,cy:this.camY,moved:0};},
  move(x,y){const p=this.pan;if(!p)return;const d=Math.hypot(x-p.x,y-p.y);if(d>14)p.moved=1;if(p.moved){this.follow=0;this.panTo=null;this.camX=clamp(p.cx-(x-p.x),0,MWW-W);this.camY=clamp(p.cy-(y-p.y),0,Math.max(0,MWH-H));}},
  up(x,y){const p=this.pan;this.pan=null;if(!p||p.moved)return;this.tap(x,y);},
  tap(x,y){if(hitC(x,y,40,H*.5-34,30)){sfx('tap');SCN.book.nextTab='zk';go('book');return;}if(hitC(x,y,40,H*.5+50,30)){sfx('tap');SCN.book.nextTab='md';go('book');return;}if(hitC(x,y,44,50,36)){sfx('tap');MAPPOS={f:this.ff,x:this.fx};go('town');return;}if(x>96&&x<W-96&&y>H-94&&y<H-14){sfx('tap');SCN.book.nextTab='st';go('book');return;}
    for(let f=0;f<MNF;f++){const bx=W-34,by=H*.5+(2-f)*58;if(hitC(x,y,bx,by,26)){sfx('tap');this.pend=null;this.near=null;this.goTo(f,MSTW+40);hush();speak(`${f+1}かい`);return;}}
    if(hitC(x,y,44,H-54,42)){this.follow=0;this.panTo=clamp((this.panTo??this.camX)-MRW,0,MWW-W);sfx('whoosh');return;}if(hitC(x,y,W-44,H-54,42)){this.follow=0;this.panTo=clamp((this.panTo??this.camX)+MRW,0,MWW-W);sfx('whoosh');return;}
    if(y<96)return;const wx=x+this.camX,wy=y+this.camY;
    // fu-chan / rikki
    if(Math.abs(wx-this.fx)<34&&wy>this.fy-120&&wy<this.fy){sfx('boing');REACT.k='good';REACT.t=1;say(pick(['きょうも がんばるぞ！',`いまは ${RANKS[rankIdx()][1]} だよ！`,'どこへ いこうかな？']));return;}
    const rp=this.rkW;if(rp&&Math.abs(wx-rp.x)<26&&wy>rp.y-70&&wy<rp.y){RK.hop=1;rkCheer();say(pick(RKLINES));return;}
    for(const n of this.npcs){const ny=mFloorY(n.f);if(Math.abs(wx-n.x)<30&&wy>ny-70&&wy<ny){sfx('boing');hush();speak(`${WORDS[n.k][0]}さん、 こんにちは！`);speak(`Hello, ${WORDS[n.k][1]}!`,'en');card={k:n.k,ja:WORDS[n.k][0],en:WORDS[n.k][1],t:0};return;}}
    let f=-1;for(let k=0;k<MNF;k++){const y0=mFloorY(k);if(wy<=y0&&wy>y0-MFH)f=k;}if(f<0)return;
    if(wx<MSTW){this.pend=null;this.near=null;this.goTo(f,90);sfx('tap');return;}
    if(f===0&&wx>=MBW){this.near=null;const tx=clamp(wx,MBW+40,MWW-120);this.pend=wx>MWW-240?{door:1}:null;this.goTo(0,this.pend?MWW-120:tx);sfx('tap');if(this.pend){hush();speak('まちへ もどろう！');}return;}
    const r=this.roomAt(f,wx);if(!r){if(CURB==='hosp'&&f===MNF-1){const hr={f,i:1,id:'heli',cx:MSTW+MRW*1.5};this.near=null;this.pend=hr;this.goTo(f,hr.cx);sfx('tap');hush();speak('ドクターヘリの ほうへ いこう！');}return;}
    if(r.id==='kids'&&this.near===null&&this.ff===f&&Math.abs(this.fx-r.cx)<60){for(const b of this.balls){b.x=rand(10,110);b.y=rand(-40,30);}sfx('boing');say('ボールプール たのしい！');return;}
    if(r.id==='lounge'&&this.ff===f&&Math.abs(this.fx-r.cx)<60){sfx('coin');say('ジュースで ひとやすみ。 ごくごく！');return;}
    if(r.id==='shop'&&this.ff===f&&Math.abs(this.fx-r.cx)<60){sfx('coin');say(pick(['ばいてんで おかいもの。 おみまいの おはなを ください','パンと ぎゅうにゅうを かったよ','はブラシも うってるね']));return;}
    if(r.id==='dreception'&&this.ff===f&&Math.abs(this.fx-r.cx)<60){sfx('ding');say(pick(['しんさつけんと ほけんしょうを だしてね','よやくの おなまえを どうぞ','まちあいしつで えほんを よんで まってね','はみがき できたかな？']));return;}
    if(this.near&&this.near.id===r.id&&this.near.f===f){this.enterRoom(r);return;}
    this.near=null;this.pend=r;this.goTo(f,r.cx);sfx('tap');const I=MINFO[r.id];hush();speak(`${I[0]}へ いこう！`);},
  drawCollectUI(c){const D=dailyGet();
    [[H*.5-34,'book','#ff8c5a','ずかん'],[H*.5+50,null,'#e8a800','メダル']].forEach(([y,ic,col,lb])=>{c.fillStyle='rgba(90,40,110,.15)';circ(c,42,y+4,30);c.fillStyle='#fff';circ(c,40,y,30);c.strokeStyle=col;c.lineWidth=4;c.beginPath();c.arc(40,y,30,0,TAU);c.stroke();
      if(ic){c.save();c.translate(40,y-4);c.fillStyle=col;const q=40;c.beginPath();c.moveTo(0,-q*.28);c.quadraticCurveTo(-q*.25,-q*.42,-q*.5,-q*.3);c.lineTo(-q*.5,q*.32);c.quadraticCurveTo(-q*.25,q*.2,0,q*.34);c.quadraticCurveTo(q*.25,q*.2,q*.5,q*.32);c.lineTo(q*.5,-q*.3);c.quadraticCurveTo(q*.25,-q*.42,0,-q*.28);c.closePath();c.fill();c.restore();}else drawMedal(c,40,y-2,17,true);
      c.fillStyle='rgba(255,255,255,.9)';rr(c,8,y+22,64,20,10);c.fill();txt(c,lb,40,y+32,13,col);});
    const px=100,pw=W-200,py=H-92;panel(c,px,py,pw,76,24,'rgba(255,255,255,.95)','#ffb3d6',4);txt(c,'きょうの',px+46,py+26,14,'#ff5fa2');txt(c,'おねがい',px+46,py+48,14,'#ff5fa2');
    D.rooms.forEach((id,i)=>{const r=ROOMS.find(q=>q.id===id),x=px+122+i*((pw-150)/3),y=py+38,dn=D.done.includes(id);c.globalAlpha=dn?.5:1;drawThing(c,r.icon,x,y,.5);c.globalAlpha=1;if(dn){c.fillStyle='#2ec07a';circ(c,x+18,y+14,11);c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.moveTo(x+13,y+14);c.lineTo(x+17,y+18);c.lineTo(x+23,y+9);c.stroke();}});
    if(D.stamped)drawStamp(c,px+pw-26,py+38,24);},
  enterRoom(r){if(NOGAME.includes(r.id))return;sfx('pop');MAPPOS={f:r.f,x:r.cx,back:1};go(r.id);}};

// ---------- メダルで ふえる そとの かざり ----------
function mapFireworks(c,y4){for(let i=0;i<3;i++){const ph=(T*.35+i/3)%1,x=MBW*.2+i*MBW*.35+Math.sin(i*7)*80,y=y4-220-i*40;if(ph<.25){c.fillStyle='#fff8c0';circ(c,x,y+(1-ph/.25)*260,4);continue;}const k=(ph-.25)/.75,col=['#ffd23a','#ff8cc0','#7ad8ff'][i];c.globalAlpha=1-k;c.fillStyle=col;for(let j=0;j<16;j++){const a=j/16*TAU;circ(c,x+Math.cos(a)*k*110,y+Math.sin(a)*k*110+k*k*30,5*(1-k)+2);}c.globalAlpha=1;}}
function mapTree(c,x,y,s=1){c.fillStyle='#9a6a3a';rr(c,x-10*s,y-90*s,20*s,90*s,6*s);c.fill();c.fillStyle='#5cc85a';circ(c,x,y-150*s,60*s);circ(c,x-44*s,y-110*s,44*s);circ(c,x+44*s,y-110*s,44*s);c.fillStyle='#7ae07a';circ(c,x-16*s,y-168*s,26*s);}
function mapPark(c){const P=MBW,G=MGROUND+30;
  if(hasDeco('trees')){mapTree(c,P+290,G);mapTree(c,P+950,G,1.1);}
  if(hasDeco('busstop')){c.fillStyle='#8a98b8';c.fillRect(P+226,G-130,8,130);c.fillStyle='#4a88e8';circ(c,P+230,G-140,24);txt(c,'バス',P+230,G-140,15,'#fff');c.fillStyle='#fff';rr(c,P+212,G-100,36,40,4);c.fill();c.fillStyle='#8a98b8';for(let i=0;i<3;i++)c.fillRect(P+218,G-92+i*10,24,3);}
  if(hasDeco('fountain')){const x=P+390;c.fillStyle='#c8d4e4';ell(c,x,G-10,80,20);c.fillStyle='#8ad0ff';ell(c,x,G-14,68,14);c.fillStyle='#c8d4e4';rr(c,x-10,G-70,20,60,6);c.fill();ell(c,x,G-70,34,9);
    for(let i=0;i<8;i++){const k=(T*1.4+i/8)%1,a=(i%2?1:-1)*(20+i*6);c.fillStyle=`rgba(140,210,255,${1-k})`;circ(c,x+a*k*2,G-76-Math.sin(k*Math.PI)*70,5);}c.fillStyle='rgba(200,240,255,.8)';ell(c,x,G-100+Math.sin(T*6)*4,8,26);}
  if(hasDeco('bench')){const x=P+490;c.fillStyle='#b8805a';rr(c,x-44,G-40,88,10,4);c.fill();rr(c,x-44,G-66,88,10,4);c.fill();c.fillStyle='#5a6070';c.fillRect(x-38,G-30,6,30);c.fillRect(x+32,G-30,6,30);}
  if(hasDeco('statue')){const x=P+580;c.fillStyle='#d8d0c0';rr(c,x-46,G-60,92,60,6);c.fill();txt(c,'ふーちゃん',x,G-30,14,'#8a7a5a');c.save();c.globalAlpha=.9;drawFuka(c,x,G-60,{outfit:fuOutfit({coat:'#e8c860',dress:'pink',item:null}),t:0,sc:1.7,steth:true,cheer:1});c.restore();c.fillStyle='rgba(255,236,140,.25)';circ(c,x,G-130,70);}
  if(hasDeco('playground')){const x=P+690;c.strokeStyle='#ff8cc0';c.lineWidth=8;c.beginPath();c.moveTo(x-50,G);c.lineTo(x-50,G-120);c.moveTo(x-20,G);c.lineTo(x-20,G-120);c.stroke();c.lineWidth=4;for(let i=0;i<5;i++){c.beginPath();c.moveTo(x-50,G-20-i*22);c.lineTo(x-20,G-20-i*22);c.stroke();}
    c.fillStyle='#ffd23a';c.beginPath();c.moveTo(x-20,G-120);c.lineTo(x-4,G-120);c.quadraticCurveTo(x+40,G-40,x+70,G-6);c.lineTo(x+56,G);c.quadraticCurveTo(x+24,G-40,x-20,G-100);c.closePath();c.fill();}
  if(hasDeco('clock')){const x=P+810;c.fillStyle='#e8d8c0';c.fillRect(x-26,G-300,52,300);c.fillStyle='#c86a5a';c.beginPath();c.moveTo(x-36,G-300);c.lineTo(x,G-360);c.lineTo(x+36,G-300);c.fill();c.fillStyle='#fff';circ(c,x,G-260,24);c.strokeStyle='#5a4a3a';c.lineWidth=3;c.beginPath();c.arc(x,G-260,24,0,TAU);c.stroke();const d=new Date(),h=(d.getHours()%12+d.getMinutes()/60)/12*TAU,m=d.getMinutes()/60*TAU;c.beginPath();c.moveTo(x,G-260);c.lineTo(x+Math.sin(h)*13,G-260-Math.cos(h)*13);c.moveTo(x,G-260);c.lineTo(x+Math.sin(m)*19,G-260-Math.cos(m)*19);c.stroke();}
  if(hasDeco('animals')){['bear','rabbit','panda'].forEach((k,i)=>{const x=P+880+(i-1)*56;c.fillStyle='#d8d0c0';rr(c,x-24,G-24,48,24,4);c.fill();drawAnimal(c,k,x,G-22,.26,{t:T+i,happy:1});});}}
function mapBuildDeco(c,TW,y4){
  if(hasDeco('flowers')){for(let x=6;x<MBW;x+=26){const col=['#ff8cc0','#ffd23a','#ff6f6f','#b48cff','#fff'][Math.floor(x/26)%5];c.fillStyle='#4cae4c';c.fillRect(x-1,MGROUND+6,2,14);c.fillStyle=col;for(let k=0;k<5;k++){const a=k/5*TAU;circ(c,x+Math.cos(a)*5,MGROUND+6+Math.sin(a)*5,4);}c.fillStyle='#ffd23a';circ(c,x,MGROUND+6,3);}}
  if(hasDeco('carpet')){c.fillStyle='#d8303a';c.beginPath();c.moveTo(MSTW+100,MGROUND);c.lineTo(MSTW+180,MGROUND);c.lineTo(MSTW+220,MGROUND+40);c.lineTo(MSTW+60,MGROUND+40);c.fill();c.fillStyle='#ffd23a';for(const x of[MSTW+70,MSTW+210]){c.fillRect(x-2,MGROUND+6,4,30);circ(c,x,MGROUND+6,5);}}
  if(hasDeco('lights')){for(let f=0;f<MNF;f++){const y=mFloorY(f)-MFH+11,w=f===MNF-1?TW:MBW;for(let x=0;x<w;x+=30){const on=Math.floor(T*3+x/30)%3;c.fillStyle=['#ff8cc0','#ffd23a','#7ad8ff'][(x/30+on)%3|0];c.globalAlpha=.6+.4*Math.sin(T*5+x);circ(c,x,y,4.5);}}c.globalAlpha=1;}
  if(hasDeco('flags')){for(const [x0,x1,y] of[[-14,TW+14,y4-44],[TW+14,MBW+14,y4+MFH-44]]){c.strokeStyle='#a0a8b8';c.lineWidth=2;c.beginPath();c.moveTo(x0,y);c.quadraticCurveTo((x0+x1)/2,y+26,x1,y);c.stroke();const n=Math.floor((x1-x0)/40);for(let i=1;i<n;i++){const t=i/n,x=x0+(x1-x0)*t,yy=y+Math.sin(t*Math.PI)*13*2*t*(1-t)*2;c.fillStyle=['#ff5f6f','#ffd23a','#4dabf7','#69db7c'][i%4];c.beginPath();c.moveTo(x-10,yy);c.lineTo(x+10,yy);c.lineTo(x,yy+20);c.fill();}}}
  if(hasDeco('balloons')){for(const [bx,by] of[[-6,y4-50],[MBW+6,y4+MFH-50]]){for(let i=0;i<5;i++){const x=bx+(i-2)*16+Math.sin(T*1.5+i)*6,y=by-70-(i%2)*24+Math.sin(T*2+i)*5;c.strokeStyle='#a0a8b8';c.lineWidth=1;c.beginPath();c.moveTo(bx,by);c.lineTo(x,y+18);c.stroke();c.fillStyle=['#ff5f6f','#ffd23a','#4dabf7','#ff8cc0','#69db7c'][i];ell(c,x,y,14,18);c.fillStyle='rgba(255,255,255,.5)';ell(c,x-5,y-6,4,6);}}}
  if(hasDeco('goldcross')){const x=TW/2,y=y4-120;c.save();c.translate(x,y);c.rotate(T*.4);c.fillStyle='rgba(255,220,90,.35)';for(let i=0;i<10;i++){c.rotate(TAU/10);c.beginPath();c.moveTo(0,0);c.lineTo(-10,-80);c.lineTo(10,-80);c.fill();}c.restore();crossSign(c,x,y,34,'#e8a800');}
  if(hasDeco('sparkle')){for(let i=0;i<6;i++){const tw=.5+.5*Math.sin(T*4+i*1.7);c.fillStyle=`rgba(255,215,60,${.4+tw*.6})`;star(c,TW/2-280+i*112,y4-190+(i%2?-44:40),8+tw*8,3+tw*3,4);c.fill();}}}

// ---------- となりの たてものへの いりぐち・しかいいんの そと ----------
function mapDoor(c,B){const x=MWW-120,G=MGROUND,col='#ffb03a';c.fillStyle='#c8905a';c.fillRect(x+70,G-150,10,150);c.fillStyle=col;rr(c,x+10,G-190,140,50,12);c.fill();c.strokeStyle='#fff';c.lineWidth=3;c.stroke();txt(c,'まちへ',x+64,G-165,22,'#fff');c.fillStyle='#fff';c.beginPath();c.moveTo(x+128,G-175);c.lineTo(x+142,G-165);c.lineTo(x+128,G-155);c.fill();
  c.fillStyle='#fff4dc';rr(c,x-50,G-130,90,130,[40,40,0,0]);c.fill();c.strokeStyle=col;c.lineWidth=5;c.stroke();c.fillStyle='rgba(200,235,255,.8)';rr(c,x-38,G-116,66,90,[30,30,0,0]);c.fill();c.fillStyle='#ff8c5a';c.beginPath();c.moveTo(x-25,G-66);c.lineTo(x-5,G-86);c.lineTo(x+15,G-66);c.fill();c.fillStyle='#fff';c.fillRect(x-19,G-66,28,20);
  const b=Math.abs(Math.sin(T*3))*6;c.fillStyle='#ffd23a';c.beginPath();c.moveTo(x-5,G-150-b);c.lineTo(x-17,G-170-b);c.lineTo(x+7,G-170-b);c.fill();}
function dentYard(c){const P=MBW,G=MGROUND+30;mapTree(c,P+90,G,.8);c.fillStyle='#fff';rr(c,P+170,G-150,110,120,16);c.fill();c.strokeStyle='#5ac8a8';c.lineWidth=4;c.stroke();txt(c,'しんりょう じかん',P+225,G-128,12,'#2a9a7a');for(let i=0;i<3;i++)txt(c,['9:00〜12:00','14:00〜18:00','にちようは おやすみ'][i],P+225,G-100+i*22,11,'#6a8a80');c.fillStyle='#8a98b8';c.fillRect(P+220,G-30,8,30);
  for(let x=P+20;x<P+420;x+=26){c.fillStyle='#4cae4c';c.fillRect(x-1,MGROUND+6,2,12);c.fillStyle=['#8ee0d0','#fff','#ffd23a'][Math.floor(x/26)%3];circ(c,x,MGROUND+6,5);}}
function dentRoof(c,TW,hpy){const cx=(TW+MBW)/2;c.fillStyle='#8ee07a';rr(c,TW+20,hpy-16,MBW-TW-30,16,6);c.fill();c.save();c.translate(cx,hpy-110+Math.sin(T*2)*4);c.scale(1.8,1.8);drawItem(c,'tooth',0,0,1.4);c.restore();
  c.fillStyle='#3a3a4a';circ(c,cx-16,hpy-120,5);circ(c,cx+16,hpy-120,5);c.strokeStyle='#3a3a4a';c.lineWidth=3;c.beginPath();c.arc(cx,hpy-108,10,.2,Math.PI-.2);c.stroke();c.fillStyle='rgba(255,140,170,.6)';ell(c,cx-30,hpy-106,8,5);ell(c,cx+30,hpy-106,8,5);
  c.save();c.translate(cx+90,hpy-60);c.rotate(-.5+Math.sin(T*3)*.2);drawItem(c,'toothbrush',0,0,1.6);c.restore();for(let i=0;i<5;i++){c.fillStyle=['#ff8cc0','#ffd23a','#8ee0d0'][i%3];circ(c,TW+50+i*50,hpy-20,9);}}

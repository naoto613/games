// ================= rooms =================
const ROOMS=[
  {id:'reception',name:'うけつけ',sub:'ばんごう',icon:'ticket',col:'#ffb03a'},
  {id:'naika',name:'しんさつしつ',sub:'おいしゃさん',icon:'steth',col:'#5aa8ff'},
  {id:'geka',name:'けがの てあて',sub:'レントゲン',icon:'xray',col:'#ff6f91'},
  {id:'dentist',name:'はいしゃさん',sub:'むしば',icon:'tooth',col:'#2ec0a0'},
  {id:'pet',name:'どうぶつ',sub:'びょういん',icon:'dog',col:'#ff9a5a'},
  {id:'ambulance',name:'きゅうきゅうしゃ',sub:'119ばん',icon:'ambulance',col:'#ff4d6d'},
  {id:'pharmacy',name:'くすりやさん',sub:'いろと かず',icon:'bottle',col:'#a878ff'},
  {id:'checkup',name:'けんしん',sub:'リッキー',icon:'rikki',col:'#ff8cc8'},
  {id:'body',name:'からだ ずかん',sub:'えいご',icon:'heart',col:'#e84a5a'},
  {id:'meal',name:'にゅういん',sub:'ごはん',icon:'onigiri',col:'#4cc86a'},
  {id:'stickers',name:'シールちょう',sub:'',icon:'star2',col:'#ffc93c'},
  {id:'dress',name:'きがえ',sub:'',icon:'fuchan',col:'#8ad0ff'},
];
M('fuchan',c=>{drawFuka(c,0,34,{outfit:fuOutfit(),t:0,sc:1.25,steth:true,happy:1});});
function soundBtn(c){drawBtn(c,56,60,36,SAVE.sound?'#8ad0ff':'#b8b0c8',SAVE.sound?'sound':'mute');}
function soundHit(x,y){if(hitC(x,y,56,60,42)){SAVE.sound=!SAVE.sound;save();if(!SAVE.sound)hush();else sfx('tap');return true;}return false;}
function hospitalFront(c,x,y,w,h,t){c.fillStyle='rgba(60,40,90,.15)';rr(c,x-w/2+6,y-h+10,w,h,20);c.fill();c.fillStyle=vfill(c,y-h,y,'#ffffff',.02,-.06);rr(c,x-w/2,y-h,w,h,[20,20,6,6]);c.fill();c.strokeStyle='#c8d8f0';c.lineWidth=4;c.stroke();
  c.fillStyle='#ff9ac8';rr(c,x-w/2-10,y-h-18,w+20,36,18);c.fill();crossSign(c,x,y-h-40,26);
  const cols=5,rows=3;for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){const wx=x-w/2+24+i*(w-48)/cols,wy=y-h+40+j*54;c.fillStyle=(i+j+Math.floor(t))%7===0?'#fff4b0':'#aee0ff';rr(c,wx,wy,(w-48)/cols-14,36,8);c.fill();c.fillStyle='rgba(255,255,255,.6)';c.fillRect(wx+5,wy+5,8,26);}
  c.fillStyle='#bfe8ff';rr(c,x-50,y-78,100,78,[12,12,0,0]);c.fill();c.strokeStyle='#8ab8d8';c.lineWidth=4;c.stroke();c.beginPath();c.moveTo(x,y-78);c.lineTo(x,y);c.stroke();}
// ================= title =================
SCN.title={bg:'#bfe8ff',song:'clinic',noHome:1,
  enter(){this.t=0;this.amb=-200;},
  update(dt){this.t+=dt;this.amb+=dt*180;if(this.amb>W+300)this.amb=-300;},
  draw(c){const L=-OX/SC-2,R=W+OX/SC+2;c.fillStyle=vfill(c,-OY/SC,H*.7,'#8fd8ff',.3,0);c.fillRect(L,-OY/SC-2,R-L,H+OY/SC);
    for(let i=0;i<4;i++){const x=((i*190+T*14)%(W+300))-150,y=90+i*60;c.fillStyle='rgba(255,255,255,.85)';circ(c,x,y,30);circ(c,x+30,y-10,36);circ(c,x+64,y,28);}
    c.fillStyle='#8ee07a';c.fillRect(L,H*.66,R-L,H);c.fillStyle='#d8d8e0';c.fillRect(L,H*.74,R-L,70);c.fillStyle='#fff';for(let x=-40;x<W+40;x+=80)c.fillRect(x+((T*60)%80),H*.74+33,40,5);
    hospitalFront(c,W/2,H*.66,420,300,this.t);
    MED.ambulance(c,this.amb,H*.74+30,1.5);
    c.save();const bob=Math.sin(T*2)*6;txtO(c,'ふーちゃんと リッキーの',W/2,H*.08+bob,32,'#ff5fa2','#fff',9);txtO(c,'キラキラ びょういん',W/2,H*.16+bob,54,'#ff4d8d','#fff',12);c.restore();
    fu(c,150,H*.9,3.2,{wave:1});drawRikki(c,300,H*.9,{sc:2.4,t:T,happy:1,wave:1});drawAnimal(c,'bear',450,H*.9,.9,{t:T,happy:1});
    if(Math.sin(T*4)>-.4)txtO(c,'タッチで はじめる',W/2,H*.96,30,'#fff','#ff5fa2',8);},
  down(x,y){sfx('pop');say('ふーちゃん びょういんへ ようこそ！ いっしょに おいしゃさんの おしごとを しよう！');go('lobby');}};
// ================= lobby =================
SCN.lobby={bg:'#fff4fa',song:'clinic',noHome:1,
  enter(){this.lay();if(!this.greeted){this.greeted=1;}else say(pick(['つぎは どこで おしごと する？','どの おへやに いく？','きょうも がんばろうね！']));},
  lay(){this.y0=178;this.y1=H-220;this.rh=(this.y1-this.y0)/4;this.cw=178;},
  cell(i){const col=i%3,row=Math.floor(i/3);return{x:W/2+(col-1)*(this.cw+12),y:this.y0+row*this.rh+this.rh/2,w:this.cw,h:this.rh-14};},
  draw(c){const L=-OX/SC-2,R=W+OX/SC+2;c.fillStyle='#fff4fa';c.fillRect(L,-OY/SC-2,R-L,H+OY/SC*2+4);c.fillStyle='#ffe8f3';for(let x=Math.floor(L/60)*60;x<R;x+=60)c.fillRect(x,-OY/SC,30,H);
    c.fillStyle=vfill(c,-OY/SC,150,'#ff9ac8',.1,-.05);c.fillRect(L,-OY/SC-2,R-L,150+OY/SC);c.fillStyle='#fff';for(let x=Math.floor(L/40)*40;x<R;x+=40){c.beginPath();c.arc(x+20,150,20,0,Math.PI);c.fill();}
    crossSign(c,W-52,74,17);txtO(c,'ふーちゃん びょういん',W/2+14,76,38,'#fff','#e0508a',9);
    // rank
    const ri=rankIdx(),nx=RANKS[ri+1];c.fillStyle='#fff';rr(c,W-250,110,234,34,17);c.fill();MED.love(c,W-228,127,.5);txt(c,`${SAVE.hearts}`,W-208,128,20,'#ff4d7d','left');txt(c,RANKS[ri][1],W-28,128,16,'#8a5a9a','right');
    for(let i=0;i<12;i++){const r=this.cell(i),R0=ROOMS[i],pl=lvOf(R0.id);const hov=Math.sin(T*3+i)*2;
      c.save();c.translate(r.x,r.y+hov);panel(c,-r.w/2,-r.h/2,r.w,r.h,22,'#ffffff',R0.col,5);c.fillStyle=R0.col;rr(c,-r.w/2,-r.h/2,r.w,26,[22,22,0,0]);c.fill();txt(c,R0.name,0,-r.h/2+14,R0.name.length>7?16:19,'#fff');
      const isz=Math.min(1.05,(r.h-60)/70)*(AN[R0.icon]?1.6:R0.icon==='tooth'?1.3:1);drawThing(c,R0.icon,-r.w/2+48,8,isz);if(R0.sub)txt(c,R0.sub,34,r.h/2-22,15,shade(R0.col,-.3));
      if(i<10){for(let k=0;k<3;k++){c.fillStyle=pl>k?'#ffd23a':'#eee4f0';star(c,22+k*24,-4,10,4.5);c.fill();}}else if(i===10){txt(c,`${SAVE.stickers.length}/${STICKERS.length}`,34,0,22,'#e0a000');}
      c.restore();}
    // floor with fu-chan & rikki
    c.fillStyle=vfill(c,H-200,H,'#ffd8e8',.1,-.06);c.fillRect(L,H-200,R-L,200+OY/SC+4);c.fillStyle='#fff';rr(c,W-250,H-150,210,70,16);c.fill();c.strokeStyle='#ffb3d6';c.lineWidth=4;c.stroke();
    txt(c,'つぎの ランクまで',W-145,H-132,16,'#a07aa8');if(nx){const p=(SAVE.hearts-RANKS[ri][0])/(nx[0]-RANKS[ri][0]);c.fillStyle='#ffe0ee';rr(c,W-235,H-112,180,20,10);c.fill();c.fillStyle='#ff6f9a';rr(c,W-235,H-112,Math.max(20,180*p),20,10);c.fill();txt(c,`${nx[0]-SAVE.hearts}`,W-44,H-102,18,'#ff4d7d','right');}else txt(c,'さいこう ランク！',W-145,H-102,20,'#ff4d7d');
    fu(c,110,H-22,2.6,{wave:Math.sin(T*.7)>.6});rk(this,c,236,H-24,1.9,{happy:Math.sin(T*.9)>.3});
    soundBtn(c);},
  down(x,y){if(soundHit(x,y))return;for(let i=0;i<12;i++){const r=this.cell(i);if(Math.abs(x-r.x)<r.w/2&&Math.abs(y-r.y)<r.h/2){sfx('pop');ring(r.x,r.y,'#fff');go(ROOMS[i].id);return;}}
    if(hitC(x,y,110,H-90,70)){sfx('boing');say(pick(['きょうも おいしゃさんの おしごと がんばるぞ！','ちょうしんきで どきどきを きくのが すき！',`いまは ${RANKS[rankIdx()][1]} だよ！`]));}}};
// ================= sticker book =================
SCN.stickers={bg:'#fffbe8',song:'calm',
  enter(){say(`シールちょう！ ${SAVE.stickers.length}まい あつまったよ。 タッチすると なまえが きけるよ`);this.sel=null;},
  cell(i){const cols=4,rows=Math.ceil(STICKERS.length/cols),y0=178,rh=(H-200-y0)/rows;return{x:W/2+(i%cols-1.5)*136,y:y0+Math.floor(i/cols)*rh+rh/2,r:Math.min(52,rh/2-6)};},
  draw(c){roomBg(c,'#fff4d8','#f4e0b8',H-20,'#fff0c8');txtO(c,'シールちょう',W/2+20,146,36,'#ff9a3a','#fff',9);
    STICKERS.forEach((k,i)=>{const p=this.cell(i),has=SAVE.stickers.includes(k);c.fillStyle=has?'#fff':'rgba(255,255,255,.5)';circ(c,p.x,p.y,p.r);c.strokeStyle=has?'#ffc93c':'#e8d8c0';c.lineWidth=4;c.setLineDash(has?[]:[8,6]);c.beginPath();c.arc(p.x,p.y,p.r,0,TAU);c.stroke();c.setLineDash([]);
      if(has){const s=this.sel===i?1+Math.sin(T*10)*.08:1;drawThing(c,k,p.x,p.y,p.r/50*s);}else txt(c,'？',p.x,p.y,30,'#e0d0b8');});
    txt(c,`${SAVE.stickers.length} / ${STICKERS.length}`,W/2,H-24,24,'#c08a3a');},
  down(x,y){STICKERS.forEach((k,i)=>{const p=this.cell(i);if(hitC(x,y,p.x,p.y,p.r)){if(SAVE.stickers.includes(k)){this.sel=i;sfx('pop');const w=WORDS[k];hush();speak(w[0]);speak(w[1],'en');card={k,ja:w[0],en:w[1],t:0};}else{sfx('no');say('まだ ないよ。 おしごとを すると もらえるよ');}}});}};
// ================= dress up =================
const COATS=[['#ffffff','しろ'],['#ffc8e0','ピンク'],['#bfe0ff','みずいろ'],['#bff0d8','ミント'],['#e0d0ff','むらさき'],['#fff2a8','きいろ']];
const DRS=['pink','yellow','mint','sky','lav','red'];
const HATL=[['nurse','ナース',0],['none','なし',0],['mbow','リボン',0],['hana','おはな',1],['tiara','ティアラ',2],['beret','ベレーぼう',3],['crown','かんむり',4]];
SCN.dress={bg:'#eef8ff',song:'calm',
  enter(){say('きがえよう！ はくいの いろ、 ふく、 ぼうしを えらんでね');},
  rows(){const y0=H-330;return[y0,y0+110,y0+220];},
  draw(c){roomBg(c,'#eef8ff','#d8ecfa',H-340,'#e0f2ff');c.fillStyle='rgba(255,255,255,.7)';circ(c,W/2,H-560,190);
    fu(c,W/2,H-392,Math.min(5.4,(H-520)/58),{happy:1,cheer:Math.sin(T*1.2)>.7});rk(this,c,W-80,H-392,2,{happy:1});
    const [y0,y1,y2]=this.rows();panel(c,14,y0-50,W-28,340,26,'#fff','#bfe0ff',4);
    txt(c,'はくい',46,y0-28,18,'#5a88c8','left');COATS.forEach(([col],i)=>{const x=80+i*88;c.fillStyle=col;circ(c,x,y0+10,30);c.strokeStyle=SAVE.coat===col?'#ff5fa2':'#c8d4e8';c.lineWidth=SAVE.coat===col?7:3;c.stroke();});
    txt(c,'ふく',46,y1-28,18,'#5a88c8','left');DRS.forEach((id,i)=>{const d=DRESSES.find(q=>q.id===id);const x=80+i*88;c.fillStyle=d.dress;circ(c,x,y1+10,30);c.strokeStyle=SAVE.dress===id?'#ff5fa2':'#c8d4e8';c.lineWidth=SAVE.dress===id?7:3;c.stroke();});
    txt(c,'ぼうし',46,y2-28,18,'#5a88c8','left');const ri=rankIdx();HATL.forEach(([id,n,need],i)=>{const x=64+i*79;const lock=ri<need;c.fillStyle=lock?'#eee8f0':'#fff';rr(c,x-36,y2-16,72,56,14);c.fill();c.strokeStyle=SAVE.hat===id?'#ff5fa2':'#c8d4e8';c.lineWidth=SAVE.hat===id?6:3;c.stroke();
      txt(c,lock?'🔒':n,x,y2+12,lock?24:(n.length>4?11:15),lock?'#a090b0':'#6a5a8a');if(lock)txt(c,RANKS[need][1].replace(' ','\n').split('\n')[0],x,y2+54,11,'#a090b0');});},
  down(x,y){const [y0,y1,y2]=this.rows();
    COATS.forEach(([col,n],i)=>{if(hitC(x,y,80+i*88,y0+10,36)){SAVE.coat=col;save();sfx('spark');say(n+'の はくい');}});
    DRS.forEach((id,i)=>{if(hitC(x,y,80+i*88,y1+10,36)){SAVE.dress=id;save();sfx('spark');const d=DRESSES.find(q=>q.id===id);hush();speak(d.ja);speak(d.en,'en');card={k:null,ja:d.ja,en:d.en,t:0};}});
    const ri=rankIdx();HATL.forEach(([id,n,need],i)=>{const hx=64+i*79;if(Math.abs(x-hx)<36&&Math.abs(y-y2-12)<28){if(ri<need){sfx('no');say(`${RANKS[need][1]}に なったら つかえるよ`);}else{SAVE.hat=id;save();sfx('spark');say(n);}}});
    if(hitC(x,y,W/2,H-500,120)){sfx('boing');say(pick(['にあう？','かわいい おいしゃさん！','きょうも がんばるぞ！']));burst(W/2,H-560,8,'heart');}}};
// ================= thumbnail (800x500) =================
function drawThumb(c){const Wt=800,Ht=500;c.fillStyle=vfill(c,0,340,'#8fd8ff',.3,0);c.fillRect(0,0,Wt,Ht);
  for(let i=0;i<4;i++){const x=60+i*210,y=60+(i%2)*40;c.fillStyle='rgba(255,255,255,.9)';circ(c,x,y,26);circ(c,x+26,y-10,32);circ(c,x+56,y,24);}
  c.fillStyle='#8ee07a';c.fillRect(0,340,Wt,Ht);c.fillStyle='#d8d8e0';c.fillRect(0,392,Wt,54);c.fillStyle='#fff';for(let x=10;x<Wt;x+=70)c.fillRect(x,417,36,4);
  hospitalFront(c,590,392,330,230,3);MED.ambulance(c,420,430,1.5);
  txtO(c,'ふーちゃんと リッキーの',230,62,34,'#ff5fa2','#fff',9);txtO(c,'キラキラ',230,128,64,'#ff4d8d','#fff',13);txtO(c,'びょういん',230,200,64,'#ff4d8d','#fff',13);
  fu(c,110,480,3.6,{cheer:1});drawRikki(c,245,478,{sc:2.7,t:.5,happy:1,wave:1});drawAnimal(c,'bear',700,480,.95,{t:0,happy:1});drawItem(c,'bandage',720,440,.6);drawAnimal(c,'dog',330,488,.6,{t:0,happy:1});
  MED.steth(c,360,300,1);MED.syringe(c,50,300,.9);drawItem(c,'tooth',420,300,.9);MED.pill(c,350,240,.8,{col:'#ff8cc8'});MED.love(c,440,230,.6);}

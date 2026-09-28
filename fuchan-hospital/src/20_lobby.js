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
  {id:'dress',name:'ふーちゃんと リッキーの おきがえ',sub:'',icon:'fuchan',col:'#8ad0ff'},
];
M('fuchan',c=>{drawFuka(c,0,34,{outfit:fuOutfit(),t:0,sc:1.25,steth:true,happy:1});});
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
// ================= thumbnail (800x500) =================
function drawThumb(c){const Wt=800,Ht=500;c.fillStyle=vfill(c,0,340,'#8fd8ff',.3,0);c.fillRect(0,0,Wt,Ht);
  for(let i=0;i<4;i++){const x=60+i*210,y=60+(i%2)*40;c.fillStyle='rgba(255,255,255,.9)';circ(c,x,y,26);circ(c,x+26,y-10,32);circ(c,x+56,y,24);}
  c.fillStyle='#8ee07a';c.fillRect(0,340,Wt,Ht);c.fillStyle='#d8d8e0';c.fillRect(0,392,Wt,54);c.fillStyle='#fff';for(let x=10;x<Wt;x+=70)c.fillRect(x,417,36,4);
  hospitalFront(c,590,392,330,230,3);MED.ambulance(c,420,430,1.5);
  txtO(c,'ふーちゃんと リッキーの',230,62,34,'#ff5fa2','#fff',9);txtO(c,'キラキラ',230,128,64,'#ff4d8d','#fff',13);txtO(c,'びょういん',230,200,64,'#ff4d8d','#fff',13);
  fu(c,110,480,3.6,{cheer:1});drawRikki(c,245,478,{sc:2.7,t:.5,happy:1,wave:1});drawAnimal(c,'bear',700,480,.95,{t:0,happy:1});drawItem(c,'bandage',720,440,.6);drawAnimal(c,'dog',330,488,.6,{t:0,happy:1});
  MED.steth(c,360,300,1);MED.syringe(c,50,300,.9);drawItem(c,'tooth',420,300,.9);MED.pill(c,350,240,.8,{col:'#ff8cc8'});MED.love(c,440,230,.6);}

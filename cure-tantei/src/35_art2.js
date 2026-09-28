// ================= だい2ぶ の え（モヤモヤン・あたらしい アイコン・はいけい） =================
Object.assign(WORDS,{ghost:['おばけ','ghost'],snowflake:['ゆき','snow'],snowman:['ゆきだるま','snowman'],mitten:['てぶくろ','mittens'],ticket:['チケット','ticket'],popcorn:['ポップコーン','popcorn'],fog:['もやもや','fog'],smilestar:['えがおの スター','smile star']});
for(const k of['ghost','snowflake','snowman','mitten','ticket','popcorn'])if(!WORD_ORDER.includes(k))WORD_ORDER.push(k);
DIAG.dizzy='めが まわった';
// おばけの おうさま モヤモヤン  o:{kind,sad,talk}
function drawGhost(c,x,y,s,t,o={}){c.save();c.translate(x,y);c.fillStyle='rgba(40,0,50,.16)';ell(c,0,0,26*s,6*s);c.scale(s,s);c.translate(0,-64+Math.sin(t*2.5)*5);
  c.lineJoin='round';c.lineCap='round';c.strokeStyle='#4a3a6a';c.lineWidth=2.4;
  if(!o.kind){c.fillStyle='rgba(150,140,175,.35)';for(let i=0;i<6;i++){const a=t*.8+i*1.05;circ(c,Math.cos(a)*46,26+Math.sin(t*1.3+i)*9,11+Math.sin(t*2+i)*3);}}
  const body=o.kind?'#fff8ff':'#e6ddf6';
  for(const sd of[-1,1]){c.save();c.translate(sd*30,2);c.rotate(sd*(.7+Math.sin(t*4+sd)*.25));c.fillStyle=body;ell(c,0,7,7,13);c.stroke();c.restore();}
  c.fillStyle=gfill(c,-10,-20,50,body,.3,-.12);c.beginPath();c.moveTo(-33,30);c.bezierCurveTo(-40,-52,40,-52,33,30);
  for(let i=0;i<4;i++){const x0=33-i*16.5;c.quadraticCurveTo(x0-8.25,42+Math.sin(t*6+i)*4,x0-16.5,30);}c.closePath();c.fill();c.stroke();
  c.fillStyle='rgba(255,255,255,.6)';ell(c,-14,-18,7,10,-.4);
  // おうかん
  c.fillStyle=gfill(c,0,-40,14,'#ffd23a');c.beginPath();c.moveTo(-13,-30);c.lineTo(-15,-46);c.lineTo(-7,-38);c.lineTo(0,-50);c.lineTo(7,-38);c.lineTo(15,-46);c.lineTo(13,-30);c.closePath();c.fill();c.stroke();c.fillStyle='#b04aff';circ(c,0,-36,2.6);
  // かお
  const ey=-8;
  if(o.kind){c.lineWidth=2.6;for(const sd of[-1,1]){c.beginPath();c.arc(sd*11,ey+2,5,Math.PI*1.1,Math.PI*1.9);c.stroke();}}
  else if(o.sad){for(const sd of[-1,1]){c.fillStyle='#3a2a4a';ell(c,sd*11,ey+2,4,5);c.lineWidth=2;c.beginPath();c.moveTo(sd*5,ey-7);c.lineTo(sd*17,ey-4);c.stroke();}c.fillStyle='#8ad8ff';ell(c,-15,ey+10,2.4,3.6);}
  else{for(const sd of[-1,1]){c.fillStyle='#fff';ell(c,sd*11,ey,7,8);c.stroke();c.fillStyle='#8a4ad8';circ(c,sd*11+1,ey+1,4.2);c.fillStyle='#1a0a2a';circ(c,sd*11+1,ey+1,2);c.fillStyle='#fff';circ(c,sd*11-.5,ey-1.5,1.3);c.lineWidth=2.6;c.beginPath();c.moveTo(sd*4,ey-11);c.lineTo(sd*17,ey-7);c.stroke();}}
  c.fillStyle='rgba(255,120,170,.45)';ell(c,-21,ey+11,5,3);ell(c,21,ey+11,5,3);
  c.strokeStyle='#4a3a6a';c.lineWidth=2.2;const my=ey+16;
  if(o.talk){c.fillStyle='#8a3a6a';ell(c,0,my,5,1.5+Math.abs(Math.sin(t*15))*4);c.stroke();}
  else if(o.kind){c.fillStyle='#c84a78';c.beginPath();c.moveTo(-7,my-2);c.quadraticCurveTo(0,my+7,7,my-2);c.closePath();c.fill();c.stroke();}
  else if(o.sad){c.beginPath();c.arc(0,my+5,5,Math.PI*1.15,Math.PI*1.85);c.stroke();}
  else{c.beginPath();c.moveTo(-8,my-2);c.quadraticCurveTo(0,my+5,9,my-3);c.stroke();c.fillStyle='#fff';c.beginPath();c.moveTo(3,my);c.lineTo(5,my+5);c.lineTo(7,my-1);c.closePath();c.fill();}
  c.restore();}
// あたらしい アイコン（drawIcon から よばれる）
function drawIcon2(c,k){const F=col=>c.fillStyle=col;
  switch(k){
    case'fog':F('rgba(160,150,185,.95)');for(const[a,b,r]of[[-12,4,11],[2,-5,14],[14,5,10],[0,8,12]]){circ(c,a,b,r);}c.strokeStyle='#6a5a8a';c.lineWidth=2.5;c.beginPath();c.arc(0,2,7,0,Math.PI*1.6);c.stroke();c.beginPath();c.arc(-14,6,4,0,Math.PI*1.5);c.stroke();return true;
    case'ghost':drawGhost(c,0,22,.36,T,{});return true;
    case'snowflake':c.strokeStyle='#5ab0f0';c.lineWidth=3;for(let i=0;i<6;i++){c.save();c.rotate(i/6*TAU);c.beginPath();c.moveTo(0,0);c.lineTo(0,-20);c.moveTo(0,-11);c.lineTo(-6,-16);c.moveTo(0,-11);c.lineTo(6,-16);c.stroke();c.restore();}F('#fff');circ(c,0,0,4);return true;
    case'snowman':F('#fff');circ(c,0,9,13);c.stroke();circ(c,0,-9,10);c.stroke();F('#2a2a33');c.fillRect(-9,-22,18,4);c.fillRect(-6,-32,12,11);F('#ff8a2a');c.beginPath();c.moveTo(0,-9);c.lineTo(9,-7);c.lineTo(0,-6);c.fill();F('#2a2a33');circ(c,-3.5,-12,1.6);circ(c,3.5,-12,1.6);F('#ff4a5a');c.fillRect(-9,-2,18,4);return true;
    case'mitten':F('#ff5a6a');c.beginPath();c.moveTo(-10,18);c.lineTo(-12,-8);c.quadraticCurveTo(-12,-20,0,-20);c.quadraticCurveTo(12,-20,11,-6);c.lineTo(12,18);c.closePath();c.fill();c.stroke();c.beginPath();c.ellipse(-14,-2,6,9,-.5,0,TAU);c.fill();c.stroke();F('#fff');rr(c,-12,12,26,8,3);c.fill();c.stroke();return true;
    case'ticket':F('#ffb3d6');c.beginPath();c.moveTo(-22,-12);c.lineTo(22,-12);c.lineTo(22,-4);c.arc(22,0,4,-Math.PI/2,Math.PI/2,true);c.lineTo(22,12);c.lineTo(-22,12);c.lineTo(-22,4);c.arc(-22,0,4,Math.PI/2,-Math.PI/2,true);c.closePath();c.fill();c.stroke();F('#ffd23a');starP(c,-9,0,6,2.6);c.fill();c.setLineDash([2,2]);c.beginPath();c.moveTo(6,-10);c.lineTo(6,10);c.stroke();c.setLineDash([]);return true;
    case'popcorn':F('#fff6d8');for(const[a,b]of[[-8,-12],[0,-16],[8,-12],[-4,-8],[5,-8]]){circ(c,a,b,6);c.stroke();}F('#fff');c.beginPath();c.moveTo(-13,-6);c.lineTo(13,-6);c.lineTo(9,20);c.lineTo(-9,20);c.closePath();c.fill();c.stroke();F('#ff4a5a');for(const x of[-7,1])c.fillRect(x,-5,5,24);return true;
    case'smilestar':drawGlow(c,'#fff6a0',0,0,34,.7);F(gfill(c,-3,-4,22,'#ffd23a',.5));starP(c,0,1,23,11);c.fill();c.stroke();c.lineWidth=2;for(const sd of[-1,1]){c.beginPath();c.arc(sd*5,1,2.5,Math.PI*1.1,Math.PI*1.9);c.stroke();}c.beginPath();c.arc(0,4,4,.2,Math.PI-.2);c.stroke();F('rgba(255,110,150,.5)');ell(c,-9,6,3,2);ell(c,9,6,3,2);return true;
    case'd_dizzy':F('#ffe4d4');circ(c,0,0,20);c.stroke();c.strokeStyle='#8a4ad8';c.lineWidth=2;for(const sd of[-1,1]){c.beginPath();for(let a=0;a<TAU*1.6;a+=.3){const r=a*1.1;c.lineTo(sd*8+Math.cos(a)*r,-2+Math.sin(a)*r);}c.stroke();}c.strokeStyle=LN;c.beginPath();c.arc(0,10,4,Math.PI*1.1,Math.PI*1.9);c.stroke();return true;
  }return false;}
// はいけい
Object.assign(BG,{
  fair(c){c.fillStyle=vgrad(c,VY0,440,['#8fd8ff','#dff4ff','#fff0f8']);c.fillRect(VX0-2,VY0-2,VX1-VX0+4,444-VY0);cloudP(c,70,110,.8);cloudP(c,200,70,.6);
    // かんらんしゃ
    const wx=290,wy=250,R=112;c.strokeStyle='#c8a0e0';c.lineWidth=7;c.beginPath();c.moveTo(wx-60,440);c.lineTo(wx,wy);c.lineTo(wx+60,440);c.stroke();c.lineWidth=5;c.strokeStyle='#ff9ac8';c.beginPath();c.arc(wx,wy,R,0,TAU);c.stroke();c.lineWidth=2;
    const cols=['#ff6f91','#ffd23a','#5aa8ff','#6cd08a','#b48cff','#ff9a2a','#ff8cc6','#5ac8f0'];for(let i=0;i<8;i++){const a=T*.15+i/8*TAU,gx=wx+Math.cos(a)*R,gy=wy+Math.sin(a)*R;c.strokeStyle='#e0b0e8';c.beginPath();c.moveTo(wx,wy);c.lineTo(gx,gy);c.stroke();c.fillStyle=cols[i];rr(c,gx-12,gy,24,20,6);c.fill();c.fillStyle='rgba(255,255,255,.7)';rr(c,gx-8,gy+3,16,7,3);c.fill();}
    c.fillStyle='#ffd23a';circ(c,wx,wy,10);
    // テント
    c.fillStyle='#fff';c.beginPath();c.moveTo(20,440);c.lineTo(20,340);c.lineTo(160,340);c.lineTo(160,440);c.fill();c.fillStyle='#ff5a6a';for(let i=0;i<4;i++)c.fillRect(20+i*35,340,17,100);
    c.beginPath();c.moveTo(8,344);c.lineTo(90,270);c.lineTo(172,344);c.closePath();c.fill();c.fillStyle='#fff';c.beginPath();c.moveTo(90,270);c.lineTo(60,344);c.lineTo(76,344);c.closePath();c.fill();c.beginPath();c.moveTo(90,270);c.lineTo(104,344);c.lineTo(120,344);c.closePath();c.fill();c.fillStyle='#ffd23a';c.beginPath();c.moveTo(90,270);c.lineTo(90,248);c.lineTo(110,256);c.lineTo(90,262);c.fill();
    c.fillStyle='#8a3a4a';rr(c,72,396,36,44,16);c.fill();
    // フラッグ
    c.strokeStyle='#8a7a9a';c.lineWidth=1.5;c.beginPath();c.moveTo(VX0,150);c.quadraticCurveTo(200,200,VX1,150);c.stroke();for(let i=0;i<12;i++){const x=VX0+(i+.5)*(VX1-VX0)/12,k=(x-VX0)/(VX1-VX0),yy=150+Math.sin(k*Math.PI)*25;c.fillStyle=cols[i%8];c.beginPath();c.moveTo(x-9,yy);c.lineTo(x+9,yy);c.lineTo(x,yy+18);c.closePath();c.fill();}
    floorAt(c,440,'#b8e090',.06,-.08);c.fillStyle='#f0d8b0';c.beginPath();c.moveTo(150,VY1);c.quadraticCurveTo(200,520,250,440);c.lineTo(300,440);c.quadraticCurveTo(260,540,300,VY1);c.fill();flowersRow(c,470);},
  snow(c){c.fillStyle=vgrad(c,VY0,430,['#a8d8ff','#dff0ff','#f4faff']);c.fillRect(VX0-2,VY0-2,VX1-VX0+4,434-VY0);
    c.fillStyle='#e8f2ff';c.beginPath();c.moveTo(VX0-10,430);c.lineTo(40,230);c.lineTo(130,430);c.moveTo(80,430);c.lineTo(230,180);c.lineTo(380,430);c.moveTo(300,430);c.lineTo(VX1+40,260);c.lineTo(VX1+60,430);c.fill();
    c.fillStyle='#fff';c.beginPath();c.moveTo(40,230);c.lineTo(22,300);c.lineTo(58,290);c.closePath();c.moveTo(230,180);c.lineTo(196,250);c.lineTo(230,240);c.lineTo(262,256);c.closePath();c.fill();
    for(const[x,s]of[[30,1],[360,1.1],[110,.8],[300,.75]]){c.fillStyle='#3a8a5a';for(let k=0;k<3;k++){c.beginPath();c.moveTo(x-(34-k*8)*s,440-k*26*s);c.lineTo(x,440-(k*26+46)*s);c.lineTo(x+(34-k*8)*s,440-k*26*s);c.fill();}c.fillStyle='#fff';for(let k=0;k<3;k++){c.beginPath();c.moveTo(x-10*s,440-(k*26+34)*s);c.lineTo(x,440-(k*26+46)*s);c.lineTo(x+10*s,440-(k*26+34)*s);c.fill();}}
    floorAt(c,430,'#f4faff',.05,-.08);c.fillStyle='rgba(180,210,240,.4)';for(let i=0;i<6;i++)ell(c,VX0+hash(i,3)*(VX1-VX0),480+hash(i,5)*200,40,8);
    c.fillStyle='#fff';for(let i=0;i<40;i++){const x=VX0+((hash(i,1)*(VX1-VX0)+Math.sin(T+i)*20)%(VX1-VX0+1)),y=VY0+((hash(i,2)*(VY1-VY0)+T*(30+hash(i,4)*30))%(VY1-VY0));circ(c,x,y,1.5+hash(i,6)*2.5);}},
  sky(c){const clear=RUN.flags&&RUN.flags.clear;c.fillStyle=vgrad(c,VY0,VY1,clear?['#ffc0e0','#c0e0ff','#fff0f8']:['#7a6a9a','#a898c0','#d8d0e8']);c.fillRect(VX0-2,VY0-2,VX1-VX0+4,VY1-VY0+4);
    if(clear)drawIcon(c,'rainbow',200,300,6);
    // おしろ
    c.fillStyle=clear?'#f0e8ff':'#8a7aa8';for(const[x,w,h]of[[110,56,200],[200,100,260],[290,56,200]]){rr(c,x-w/2,440-h,w,h,6);c.fill();c.beginPath();c.ellipse(x,440-h,w/2+6,24,0,Math.PI,TAU);c.fill();}
    c.fillStyle=clear?'#ffd23a':'#c8b8e0';for(const[x,y]of[[110,300],[200,230],[290,300],[200,320]]){c.save();c.translate(x,y);c.fillStyle=clear?'#ffe8a0':'#5a4a7a';ell(c,0,0,11,14);c.fillStyle=clear?'#ff9ac8':'#e6ddf6';circ(c,-4,-2,2.4);circ(c,4,-2,2.4);c.restore();}
    if(!clear){c.fillStyle='rgba(140,130,165,.45)';for(let i=0;i<9;i++){const x=VX0+((i*83+T*14)%(VX1-VX0+160))-80;circ(c,x,200+hash(i,3)*200,40+hash(i,4)*30);}}
    // くもの ゆか
    c.fillStyle=clear?'#fff':'#e8e2f2';for(let x=Math.floor(VX0/60)*60-60;x<VX1+60;x+=60)circ(c,x+30,450+Math.sin(x)*6,48);floorAt(c,460,clear?'#fff':'#e8e2f2',.02,-.06);
    c.fillStyle=clear?'rgba(255,240,250,.9)':'rgba(220,210,235,.9)';for(let i=0;i<5;i++)cloudP(c,VX0+hash(i,8)*(VX1-VX0),540+hash(i,9)*150,.9);},
});

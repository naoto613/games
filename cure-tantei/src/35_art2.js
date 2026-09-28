// ================= だい2ぶ の え（モヤモヤン・あたらしい アイコン・はいけい） =================
Object.assign(WORDS,{ghost:['おばけ','ghost'],snowflake:['ゆき','snow'],snowman:['ゆきだるま','snowman'],mitten:['てぶくろ','mittens'],ticket:['チケット','ticket'],popcorn:['ポップコーン','popcorn'],fog:['もやもや','fog'],smilestar:['えがおの スター','smile star'],firefly:['ホタル','firefly'],acorn:['どんぐり','acorn'],mushroom:['きのこ','mushroom'],lantern:['ちょうちん','lantern'],firework:['はなび','fireworks'],pumpkin:['かぼちゃ','pumpkin'],jelly:['ゼリー','jelly']});
for(const k of['ghost','snowflake','snowman','mitten','ticket','popcorn','firefly','acorn','mushroom','lantern','firework','pumpkin','jelly'])if(!WORD_ORDER.includes(k))WORD_ORDER.push(k);
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
  if(!o.nocrown){c.fillStyle=gfill(c,0,-40,14,'#ffd23a');c.beginPath();c.moveTo(-13,-30);c.lineTo(-15,-46);c.lineTo(-7,-38);c.lineTo(0,-50);c.lineTo(7,-38);c.lineTo(15,-46);c.lineTo(13,-30);c.closePath();c.fill();c.stroke();c.fillStyle='#b04aff';circ(c,0,-36,2.6);}else if(o.bow){bow(c,14,-34,o.bow,1);c.strokeStyle='#4a3a6a';c.lineWidth=2.4;}
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
    case'firefly':drawGlow(c,'#e8ff6a',4,6,26,.9);F('#3a3a4a');ell(c,-4,-4,8,6);F('rgba(255,255,255,.7)');ell(c,-6,-12,7,5,-.5);ell(c,4,-12,7,5,.5);F('#f4ff8a');ell(c,6,6,10,8);c.stroke();F('#3a3a4a');circ(c,-12,-4,4);return true;
    case'acorn':F('#b8743a');c.beginPath();c.ellipse(0,5,12,14,0,0,TAU);c.fill();c.stroke();F('#7a4a2a');c.beginPath();c.ellipse(0,-6,15,8,0,Math.PI,TAU);c.lineTo(15,-4);c.lineTo(-15,-4);c.closePath();c.fill();c.stroke();c.fillRect(-1.5,-18,3,6);F('rgba(255,255,255,.4)');ell(c,-4,6,3,5);return true;
    case'mushroom':F('#fff0e0');rr(c,-7,-2,14,20,5);c.fill();c.stroke();F('#ff5a6a');c.beginPath();c.ellipse(0,-4,22,16,0,Math.PI,TAU);c.closePath();c.fill();c.stroke();F('#fff');circ(c,-9,-10,4);circ(c,6,-13,3.5);circ(c,12,-6,2.5);return true;
    case'lantern':c.fillStyle='#3a2a2a';c.fillRect(-8,-22,16,5);c.fillRect(-8,17,16,5);drawGlow(c,'#ffb03a',0,0,30,.6);F('#ff5a4a');c.beginPath();c.ellipse(0,0,15,18,0,0,TAU);c.fill();c.stroke();c.strokeStyle='rgba(120,20,20,.5)';for(const y of[-9,0,9]){c.beginPath();c.ellipse(0,y,15*Math.sqrt(1-y*y/324),2,0,0,TAU);c.stroke();}return true;
    case'firework':for(let i=0;i<12;i++){const a=i/12*TAU;c.strokeStyle=['#ff5fa2','#ffd23a','#5aa8ff','#6cd08a'][i%4];c.lineWidth=3;c.beginPath();c.moveTo(Math.cos(a)*6,Math.sin(a)*6);c.lineTo(Math.cos(a)*20,Math.sin(a)*20);c.stroke();F('#fff');circ(c,Math.cos(a)*22,Math.sin(a)*22,2.2);}F('#fff6a0');circ(c,0,0,5);return true;
    case'pumpkin':F('#ff9a2a');for(const dx of[-10,0,10]){c.beginPath();c.ellipse(dx,4,11,15,0,0,TAU);c.fill();c.stroke();}F('#4cae4a');rr(c,-2,-18,5,8,2);c.fill();c.stroke();F('#3a2a1a');c.beginPath();c.moveTo(-9,-2);c.lineTo(-4,2);c.lineTo(-11,4);c.fill();c.beginPath();c.moveTo(9,-2);c.lineTo(4,2);c.lineTo(11,4);c.fill();c.beginPath();c.moveTo(-8,9);c.quadraticCurveTo(0,15,8,9);c.lineTo(4,10);c.lineTo(0,8);c.lineTo(-4,10);c.closePath();c.fill();return true;
    case'jelly':F('rgba(106,224,200,.9)');c.beginPath();c.moveTo(-16,14);c.lineTo(-12,-12);c.quadraticCurveTo(0,-18,12,-12);c.lineTo(16,14);c.closePath();c.fill();c.stroke();F('#fff');rr(c,-20,12,40,6,3);c.fill();c.stroke();F('#ff4a5a');circ(c,0,-17,5);c.stroke();F('rgba(255,255,255,.6)');ell(c,-6,-2,3,8);return true;
    case'd_dizzy':F('#ffe4d4');circ(c,0,0,20);c.stroke();c.strokeStyle='#8a4ad8';c.lineWidth=2;for(const sd of[-1,1]){c.beginPath();for(let a=0;a<TAU*1.6;a+=.3){const r=a*1.1;c.lineTo(sd*8+Math.cos(a)*r,-2+Math.sin(a)*r);}c.stroke();}c.strokeStyle=LN;c.beginPath();c.arc(0,10,4,Math.PI*1.1,Math.PI*1.9);c.stroke();return true;
  }return false;}
// はいけい
Object.assign(BG,{
  forest(c){const lit=RUN.flags&&RUN.flags.lit;c.fillStyle=vgrad(c,VY0,VY1,lit?['#1a2a5a','#2a4a6a','#1a3a2a']:['#141a30','#1e2a3a','#12201a']);c.fillRect(VX0-2,VY0-2,VX1-VX0+4,VY1-VY0+4);
    c.fillStyle='#fff6c0';circ(c,330,90,26);for(let i=0;i<20;i++){c.fillStyle='rgba(255,255,255,.7)';circ(c,VX0+hash(i,1)*(VX1-VX0),VY0+hash(i,2)*200,1.2);}
    for(let i=-2;i<9;i++){const x=i*60+(i%2)*20,h=180+hash(i,3)*80;c.fillStyle=i%2?'#1a3a2a':'#24483a';c.beginPath();c.moveTo(x-50,440);c.lineTo(x,440-h);c.lineTo(x+50,440);c.fill();c.fillStyle='#3a2a1a';c.fillRect(x-5,420,10,24);}
    floorAt(c,440,'#2a4a2a',.08,-.2);for(const[x,y,s]of[[60,520,1],[330,560,1.2],[180,640,.9]])drawIcon(c,'mushroom',x,y,s);
    const n=lit?40:4;for(let i=0;i<n;i++){const x=VX0+((hash(i,5)*(VX1-VX0)+Math.sin(T*.7+i)*30)%(VX1-VX0)),y=250+hash(i,6)*380+Math.cos(T+i)*14;drawGlow(c,'#e8ff6a',x,y,14,.5+.5*Math.sin(T*3+i));c.fillStyle='#faffc0';circ(c,x,y,2.2);}},
  sweets(c){const col=!(RUN.flags&&RUN.flags.grey);c.fillStyle=vgrad(c,VY0,440,col?['#ffc8e8','#ffe8f4','#fff8fc']:['#c8c0c8','#dcd8dc','#eeeaee']);c.fillRect(VX0-2,VY0-2,VX1-VX0+4,444-VY0);
    cloudP(c,80,100,.8);const P=col?['#ff8cc6','#8ad8ff','#ffe36a','#b48cff','#6ae0c8']:['#aaa','#bbb','#999','#ccc','#b0b0b0'];
    for(const[x,y,r,i]of[[60,350,50,0],[340,340,56,1],[200,300,40,2]]){c.fillStyle=P[i];c.beginPath();c.arc(x,y,r,Math.PI,TAU);c.fill();c.fillStyle='#fff';for(let k=0;k<5;k++)circ(c,x-r+k*r/2,y,r/5);c.fillStyle=P[(i+2)%5];c.fillRect(x-r*.8,y,r*1.6,440-y);}
    for(const[x,i]of[[130,3],[270,4]]){c.fillStyle='#fff';c.fillRect(x-4,300,8,140);c.fillStyle=P[i];for(let k=0;k<6;k++)c.fillRect(x-4,304+k*24,8,10);c.beginPath();c.arc(x,290,24,0,TAU);c.fill();c.strokeStyle='#fff';c.lineWidth=4;c.beginPath();c.arc(x,290,12,0,Math.PI*1.5);c.stroke();}
    floorAt(c,440,col?'#ffd0e4':'#d8d4d8',.1,-.06);c.fillStyle=col?'#ff8cc6':'#aaa';for(let x=Math.floor(VX0/40)*40;x<VX1;x+=40){c.beginPath();c.arc(x+20,440,20,0,Math.PI);c.fill();}
    for(const[k,x,y]of[['donut',60,560],['candy',330,600],['cookie',200,650],['strawberry',120,660]]){if(col)drawIcon(c,k,x,y,1);else{c.globalAlpha=.5;drawIcon(c,k,x,y,1);c.globalAlpha=1;}}},
  library(c){fillAll(c,'#f4e4c8');for(let x=Math.floor(VX0/130)*130;x<VX1;x+=130){c.fillStyle='#a0643a';c.fillRect(x+6,60,118,380);c.fillStyle='#7a4a2a';for(let r=0;r<4;r++){c.fillRect(x+10,70+r*92,110,84);const cols=['#ff6f91','#5aa8ff','#ffd23a','#6cd08a','#b48cff','#ff9a2a'];for(let b=0;b<8;b++){c.fillStyle=cols[(b+r+x)%6];rr(c,x+13+b*13,86+r*92+((b*7)%3)*4,11,66-((b*7)%3)*4,2);c.fill();}c.fillStyle='#7a4a2a';}}
    floorAt(c,440,'#c8905a');c.fillStyle='rgba(120,70,30,.15)';for(let x=Math.floor(VX0/60)*60;x<VX1;x+=60)c.fillRect(x,440,2,VY1-440);
    c.fillStyle='#e0a860';rr(c,90,470,220,20,6);c.fill();c.fillRect(110,490,12,60);c.fillRect(278,490,12,60);drawIcon(c,'book',160,458,.8);drawIcon(c,'glasses',240,462,.8);
    if(!(RUN.flags&&RUN.flags.read)){c.fillStyle='rgba(150,140,175,.35)';for(let i=0;i<7;i++)circ(c,VX0+((i*97+T*12)%(VX1-VX0+100))-50,150+hash(i,3)*260,36);}},
  matsuri(c){c.fillStyle=vgrad(c,VY0,VY1,['#1a1450','#3a2a7a','#5a3a6a']);c.fillRect(VX0-2,VY0-2,VX1-VX0+4,VY1-VY0+4);for(let i=0;i<30;i++){c.fillStyle='rgba(255,255,255,.6)';circ(c,VX0+hash(i,1)*(VX1-VX0),VY0+hash(i,2)*260,1.2);}
    if(RUN.flags&&RUN.flags.hanabi){for(let k=0;k<3;k++){const ph=(T*.5+k*.33)%1,x=80+k*120,y=120+k*30;c.globalAlpha=1-ph;for(let i=0;i<16;i++){const a=i/16*TAU;c.fillStyle=['#ff5fa2','#ffd23a','#5aa8ff','#6cd08a'][(i+k)%4];circ(c,x+Math.cos(a)*ph*80,y+Math.sin(a)*ph*80,3.5);}c.globalAlpha=1;}}
    c.strokeStyle='#3a2a2a';c.lineWidth=2;c.beginPath();c.moveTo(VX0,210);c.quadraticCurveTo(200,260,VX1,210);c.stroke();for(let i=0;i<9;i++){const x=VX0+(i+.5)*(VX1-VX0)/9,k=(x-VX0)/(VX1-VX0);c.save();c.translate(x,210+Math.sin(k*Math.PI)*48+18);c.scale(.8,.8);drawIcon(c,'lantern',0,0,1);c.restore();}
    for(const[x,col]of[[70,'#ff5a6a'],[200,'#5aa8ff'],[330,'#ffb03a']]){c.fillStyle='#e8c090';c.fillRect(x-56,350,112,90);c.fillStyle=col;c.beginPath();c.moveTo(x-64,352);c.lineTo(x-50,318);c.lineTo(x+50,318);c.lineTo(x+64,352);c.closePath();c.fill();c.fillStyle='#fff';for(let k=0;k<4;k++)c.fillRect(x-50+k*28,318,14,34);c.fillStyle='#fff6e0';rr(c,x-40,370,80,24,4);c.fill();}
    floorAt(c,440,'#4a3a3a',.1,-.2);c.fillStyle='rgba(255,200,120,.15)';ell(c,200,470,260,40);},
  haunted(c){c.fillStyle=vgrad(c,VY0,VY1,['#2a1a4a','#4a3a6a','#3a2a4a']);c.fillRect(VX0-2,VY0-2,VX1-VX0+4,VY1-VY0+4);c.fillStyle='#fff6c0';circ(c,320,90,30);
    c.fillStyle='#5a4a6a';c.fillRect(40,140,320,300);c.beginPath();c.moveTo(20,145);c.lineTo(200,50);c.lineTo(380,145);c.closePath();c.fill();c.fillStyle='#4a3a5a';c.fillRect(270,40,40,80);
    for(const[x,y]of[[100,210],[300,210],[100,320],[300,320]]){c.fillStyle='#ffe8a0';rr(c,x-28,y-30,56,60,6);c.fill();c.strokeStyle='#3a2a4a';c.lineWidth=4;c.beginPath();c.moveTo(x,y-30);c.lineTo(x,y+30);c.moveTo(x-28,y);c.lineTo(x+28,y);c.stroke();}
    c.fillStyle='#3a2a2a';rr(c,168,320,64,120,30);c.fill();c.fillStyle='#ffd23a';circ(c,218,385,4);
    floorAt(c,440,'#3a4a3a',.05,-.2);for(const[x,y]of[[60,520],[340,540]])drawIcon(c,'pumpkin',x,y,1.3);
    c.strokeStyle='rgba(255,255,255,.4)';c.lineWidth=1;c.beginPath();c.moveTo(VX0,60);c.lineTo(80,120);c.moveTo(VX0,100);c.lineTo(60,60);c.stroke();
    drawGhost(c,70+Math.sin(T*.6)*20,260,.45,T,{kind:1,nocrown:1});drawGhost(c,330+Math.cos(T*.5)*20,300,.4,T+1,{kind:1,nocrown:1,bow:'#ff8cc6'});},

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

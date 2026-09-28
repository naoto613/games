// ================= backgrounds =================
function fillAll(c,col){c.fillStyle=col;c.fillRect(VX0-2,VY0-2,VX1-VX0+4,VY1-VY0+4);}
function floorAt(c,y,col,hi=.1,lo=-.12){c.fillStyle=vfill(c,y,VY1,col,hi,lo);c.fillRect(VX0-2,y,VX1-VX0+4,VY1-y+2);}
function cloudP(c,x,y,s){c.fillStyle='rgba(255,255,255,.9)';for(const[a,b,r]of[[-24,4,16],[0,-6,22],[24,4,16],[10,8,14],[-10,8,14]])circ(c,x+a*s,y+b*s,r*s);}
function tree(c,x,y,s,col='#5cc46a'){c.fillStyle='#a0643a';rr(c,x-6*s,y-40*s,12*s,40*s,4*s);c.fill();c.fillStyle=gfill(c,x-10*s,y-70*s,40*s,col);for(const[a,b,r]of[[0,-70,30],[-22,-52,22],[22,-52,22]])circ(c,x+a*s,y+b*s,r*s);}
function flowersRow(c,y){for(let i=0;i<14;i++){const x=VX0+((i*97)%Math.max(1,VX1-VX0));const col=['#ff8cc6','#ffd23a','#fff','#b48cff'][i%4];c.fillStyle=col;for(let k=0;k<5;k++){const a=k/5*TAU;circ(c,x+Math.cos(a)*4,y+(i%3)*14+Math.sin(a)*4,3.2);}c.fillStyle='#ffb03a';circ(c,x,y+(i%3)*14,2);}}
function sparkles(c,n,col='#fff',area=[0,LH]){for(let i=0;i<n;i++){const x=VX0+hash(i,3)*(VX1-VX0),y=area[0]+hash(i,7)*(area[1]-area[0]),k=.5+.5*Math.sin(T*3+i);c.globalAlpha=k;c.fillStyle=col;starP(c,x,y,2+k*3,1,4);c.fill();}c.globalAlpha=1;}
const BG={
  title(c){c.fillStyle=vgrad(c,VY0,VY1,['#ffb8dc','#ffd8ec','#fff0f8','#e8d8ff']);c.fillRect(VX0-2,VY0-2,VX1-VX0+4,VY1-VY0+4);
    c.save();c.translate(200,300);c.rotate(T*.1);for(let i=0;i<14;i++){c.fillStyle=i%2?'rgba(255,255,255,.28)':'rgba(255,230,160,.18)';c.beginPath();c.moveTo(0,0);c.arc(0,0,900,i/14*TAU,(i+.5)/14*TAU);c.closePath();c.fill();}c.restore();
    sparkles(c,30,'#fff',[VY0,VY1]);},
  office(c){fillAll(c,'#f6e4c8');c.fillStyle='#f0d6b0';for(let x=Math.floor(VX0/40)*40;x<VX1;x+=40)c.fillRect(x,0,20,430);
    c.fillStyle='#fff';rr(c,120,80,160,130,10);c.fill();c.strokeStyle='#a0643a';c.lineWidth=8;c.stroke();c.fillStyle=vgrad(c,84,206,['#8fd8ff','#dff4ff']);c.fillRect(124,84,152,122);cloudP(c,170,130,.6);cloudP(c,240,170,.4);c.strokeStyle='#a0643a';c.lineWidth=5;c.beginPath();c.moveTo(200,82);c.lineTo(200,208);c.moveTo(122,145);c.lineTo(278,145);c.stroke();
    // shelf
    c.fillStyle='#b8743a';c.fillRect(-10,120,100,10);c.fillRect(-10,200,100,10);[['#ff6f91',0],['#5aa8ff',16],['#ffd23a',30],['#6cd08a',46],['#b48cff',60]].forEach(([col,dx])=>{c.fillStyle=col;rr(c,2+dx,82,13,38,2);c.fill();rr(c,4+dx,162,13,38,2);c.fill();});
    // board
    c.fillStyle='#c8905a';rr(c,300,90,110,120,6);c.fill();c.fillStyle='#e8c89a';rr(c,306,96,98,108,4);c.fill();for(const[a,b,col]of[[322,118,'#fff'],[364,112,'#ffe0f0'],[340,160,'#e0f0ff']]){c.fillStyle=col;c.fillRect(a-14,b-12,28,24);c.fillStyle='#ff4a5a';circ(c,a,b-12,3);}c.strokeStyle='#ff4a5a';c.lineWidth=1.5;c.beginPath();c.moveTo(322,106);c.lineTo(364,100);c.lineTo(340,148);c.stroke();
    floorAt(c,430,'#c8905a');c.fillStyle='rgba(120,70,30,.15)';for(let x=Math.floor(VX0/60)*60;x<VX1;x+=60)c.fillRect(x,430,2,VY1-430);
    c.fillStyle='#ff9ac8';ell(c,200,560,170,36);c.fillStyle='#ffc0dc';ell(c,200,556,150,28);},
  town(c){c.fillStyle=vgrad(c,VY0,440,['#7ec8ff','#d8f0ff']);c.fillRect(VX0-2,VY0-2,VX1-VX0+4,444-VY0);cloudP(c,80,110,.9);cloudP(c,300,70,.7);
    const hs=[['#ffd0e0','#ff6f91'],['#d8f0ff','#5aa8ff'],['#fff0c0','#ffb03a'],['#e0ffd8','#4cae4a']];for(let i=-2;i<8;i++){const x=i*110-40,[w,r]=hs[(i+8)%4];c.fillStyle=w;rr(c,x,280,90,160,4);c.fill();c.fillStyle=r;c.beginPath();c.moveTo(x-8,284);c.lineTo(x+45,236);c.lineTo(x+98,284);c.closePath();c.fill();c.fillStyle='#bfe8ff';rr(c,x+14,310,24,24,3);c.fill();rr(c,x+52,310,24,24,3);c.fill();c.fillStyle='#a0643a';rr(c,x+32,380,26,60,4);c.fill();}
    floorAt(c,440,'#d8d0c8');c.fillStyle='#c0b8b0';for(let x=Math.floor(VX0/50)*50;x<VX1;x+=50)c.fillRect(x,470,30,6);},
  bakery(c){fillAll(c,'#ffe0ee');c.fillStyle='#ffd0e4';for(let x=Math.floor(VX0/60)*60;x<VX1;x+=60)c.fillRect(x,0,30,420);
    c.fillStyle='#ff8cc0';c.beginPath();for(let x=Math.floor(VX0/40)*40;x<VX1+40;x+=40){c.moveTo(x,60);c.arc(x+20,60,20,Math.PI,0,true);}c.fill();c.fillStyle='#fff';for(let x=Math.floor(VX0/40)*40;x<VX1;x+=80)c.fillRect(x,40,40,20);c.fillStyle='#ff8cc0';for(let x=Math.floor(VX0/40)*40+40;x<VX1;x+=80)c.fillRect(x,40,40,20);
    c.fillStyle='#c8905a';rr(c,20,300,360,30,8);c.fill();c.fillStyle='rgba(210,240,255,.5)';rr(c,30,200,340,100,10);c.fill();c.strokeStyle='#fff';c.lineWidth=4;c.stroke();['cake','cookie','donut','strawberry'].forEach((k,i)=>drawIcon(c,k,75+i*85,270,1.1));
    txt(c,'CAKE',200,150,34,'#ff5fa2','center',400,POP);floorAt(c,420,'#e8b890');c.fillStyle='rgba(255,255,255,.25)';for(let x=Math.floor(VX0/80)*80;x<VX1;x+=80)for(let y=420;y<VY1;y+=80){c.fillRect(x+((y/80)%2)*40,y,40,40);}},
  park(c){c.fillStyle=vgrad(c,VY0,420,['#8fd8ff','#e6f8ff']);c.fillRect(VX0-2,VY0-2,VX1-VX0+4,424-VY0);cloudP(c,100,120,.9);cloudP(c,320,200,.6);
    c.fillStyle='#8ad07a';ell(c,60,430,220,70);ell(c,360,440,200,60);floorAt(c,420,'#a8e07a',.05,-.08);tree(c,40,440,1.1);tree(c,370,450,1,'#6cd07a');
    c.fillStyle='#e8c090';rr(c,150,360,100,14,4);c.fill();c.fillRect(160,374,8,40);c.fillRect(232,374,8,40);c.fillStyle='#ff8cc0';rr(c,150,340,100,14,4);c.fill();flowersRow(c,470);},
  museum(c){fillAll(c,'#f4ecff');c.fillStyle='#e0d0f8';for(let x=Math.floor(VX0/100)*100;x<VX1;x+=100)c.fillRect(x+40,0,20,430);
    const cols=RUN.flags&&RUN.flags.color?null:'#fff';for(const[x,k]of[[80,0],[200,1],[320,2]]){c.fillStyle='#d8a04a';rr(c,x-52,140,104,90,6);c.fill();c.fillStyle=cols||'#bfe8ff';c.fillRect(x-42,150,84,70);
      if(!cols){if(k===0){c.fillStyle='#6cd08a';c.beginPath();c.moveTo(x-42,220);c.lineTo(x-10,170);c.lineTo(x+42,220);c.fill();c.fillStyle='#ffd23a';circ(c,x+20,170,10);}else if(k===1)drawIcon(c,'rainbow',x,195,1.5);else drawIcon(c,'flower',x,185,1.3);}
      else{c.strokeStyle='#ddd';c.lineWidth=2;c.setLineDash([4,4]);c.strokeRect(x-36,156,72,58);c.setLineDash([]);}}
    floorAt(c,430,'#c8b0e8',.1,-.1);c.fillStyle='#ff6f91';rr(c,120,420,160,8,4);c.fill();},
  clinic(c){fillAll(c,'#e8f6ff');c.fillStyle='#d8eefa';for(let x=Math.floor(VX0/80)*80;x<VX1;x+=80)c.fillRect(x,0,40,430);
    c.fillStyle='#fff';rr(c,150,70,100,100,50);c.fill();c.fillStyle='#ff6f91';c.fillRect(190,90,20,60);c.fillRect(170,110,60,20);
    c.fillStyle='#fff';rr(c,10,190,90,150,6);c.fill();c.strokeStyle='#b8d0e8';c.lineWidth=3;c.stroke();[['med:pink',35,230],['med:blue',75,230],['med:green',35,290],['med:yellow',75,290]].forEach(([k,x,y])=>drawIcon(c,k,x,y,.8));
    c.fillStyle='#bfe8ff';rr(c,300,190,90,110,6);c.fill();c.strokeStyle='#fff';c.lineWidth=5;c.stroke();
    floorAt(c,430,'#b8e0c8',.1,-.08);},
  school(c){fillAll(c,'#fff4dc');c.fillStyle='#3a6a4a';rr(c,40,90,320,170,8);c.fill();c.strokeStyle='#c8904a';c.lineWidth=10;c.stroke();
    if(!(RUN.flags&&RUN.flags.nonum)){c.fillStyle='#fff';c.font=`800 30px ${FONT}`;c.textAlign='center';c.fillText('1 + 2 = 3',200,150);c.fillText('A B C',200,210);}else{c.fillStyle='rgba(255,255,255,.4)';c.font=`800 30px ${FONT}`;c.textAlign='center';c.fillText('? + ? = ?',200,150);}
    c.fillStyle='#fff';circ(c,340,50,28);c.strokeStyle='#ff7ab8';c.lineWidth=4;c.stroke();c.strokeStyle=LN;c.lineWidth=3;c.beginPath();c.moveTo(340,50);c.lineTo(340,32);c.moveTo(340,50);c.lineTo(352,56);c.stroke();
    floorAt(c,430,'#d8b078');for(const x of[60,200,340]){c.fillStyle='#c8904a';rr(c,x-45,460,90,14,3);c.fill();c.fillRect(x-40,474,8,40);c.fillRect(x+32,474,8,40);}},
  beach(c){c.fillStyle=vgrad(c,VY0,330,['#6ec8ff','#d8f4ff']);c.fillRect(VX0-2,VY0-2,VX1-VX0+4,334-VY0);c.fillStyle='#ffe36a';circ(c,320,90,34);cloudP(c,90,100,.8);
    c.fillStyle=vgrad(c,330,430,['#3aa8e8','#6ad0ff']);c.fillRect(VX0-2,330,VX1-VX0+4,100);c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=3;for(let i=0;i<3;i++){c.beginPath();for(let x=VX0;x<VX1;x+=20)c.lineTo(x,350+i*26+Math.sin(x*.05+T*2+i)*4);c.stroke();}
    floorAt(c,430,'#ffe0a8',.08,-.1);c.fillStyle='rgba(255,255,255,.7)';c.beginPath();for(let x=VX0;x<=VX1;x+=20)c.lineTo(x,430+Math.sin(x*.04+T*1.5)*5);c.lineTo(VX1,440);c.lineTo(VX0,440);c.fill();
    drawIcon(c,'shell',60,640,.8);drawIcon(c,'shell',340,600,.6);c.fillStyle='#ff6f91';c.fillRect(356,440,6,110);c.beginPath();c.moveTo(359,440);c.quadraticCurveTo(300,450,300,480);c.lineTo(420,480);c.quadraticCurveTo(420,450,359,440);c.fill();},
  night(c){c.fillStyle=vgrad(c,VY0,VY1,['#141040','#2a2a6a','#3a2a7a']);c.fillRect(VX0-2,VY0-2,VX1-VX0+4,VY1-VY0+4);
    const gone=RUN.flags&&RUN.flags.nostar;for(let i=0;i<(gone?8:50);i++){const x=VX0+hash(i,1)*(VX1-VX0),y=VY0+hash(i,2)*(430-VY0);c.fillStyle='#fff';c.globalAlpha=.5+.5*Math.sin(T*2+i);starP(c,x,y,1.5+hash(i,4)*2.5,.8,4);c.fill();}c.globalAlpha=1;
    c.fillStyle='#fff6b0';circ(c,320,110,34);c.fillStyle='#1a1450';circ(c,336,100,30);
    c.fillStyle='#2a4a3a';ell(c,80,450,240,70);ell(c,360,460,220,70);floorAt(c,440,'#2a4a3a',.05,-.2);
    c.fillStyle='#e8e0f8';rr(c,150,300,100,150,6);c.fill();c.fillStyle='#c8c0e0';c.beginPath();c.arc(200,300,50,Math.PI,TAU);c.fill();c.fillStyle='#5a4a8a';c.save();c.translate(200,280);c.rotate(-.6);c.fillRect(-8,-40,16,40);c.restore();c.fillStyle='#ffe36a';rr(c,186,390,28,60,4);c.fill();},
  castle(c){c.fillStyle=vgrad(c,VY0,VY1,['#2a0a3a','#5a1a6a','#8a3a8a']);c.fillRect(VX0-2,VY0-2,VX1-VX0+4,VY1-VY0+4);
    c.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<20;i++){starP(c,VX0+hash(i,9)*(VX1-VX0),VY0+hash(i,8)*300,1.5,.6,4);c.fill();}
    c.fillStyle='#3a1a4a';for(const[x,w,h]of[[60,70,260],[200,120,320],[340,70,260]]){c.fillRect(x-w/2,430-h,w,h);c.beginPath();c.moveTo(x-w/2-8,430-h);c.lineTo(x,430-h-60);c.lineTo(x+w/2+8,430-h);c.fill();}
    c.fillStyle='#ffd23a';for(const[x,y]of[[60,240],[200,200],[200,280],[340,240]]){rr(c,x-8,y,16,24,8);c.fill();}
    c.fillStyle='#2a0a2a';rr(c,170,340,60,90,30);c.fill();floorAt(c,430,'#4a2a5a',.05,-.2);},
  dark(c){c.fillStyle=vgrad(c,VY0,VY1,['#1a0a2a','#4a1a5a','#2a0a3a']);c.fillRect(VX0-2,VY0-2,VX1-VX0+4,VY1-VY0+4);
    c.save();c.translate(200,260);c.rotate(-T*.15);for(let i=0;i<10;i++){c.fillStyle=i%2?'rgba(160,60,200,.12)':'rgba(40,0,60,.15)';c.beginPath();c.moveTo(0,0);c.arc(0,0,900,i/10*TAU,(i+.5)/10*TAU);c.closePath();c.fill();}c.restore();sparkles(c,20,'#c080ff',[VY0,VY1]);},
  battle(c){c.fillStyle=vgrad(c,VY0,VY1,['#ffb0d8','#c8a0f0','#8a70e0']);c.fillRect(VX0-2,VY0-2,VX1-VX0+4,VY1-VY0+4);
    c.save();c.translate(200,250);c.rotate(T*.08);for(let i=0;i<16;i++){c.fillStyle=i%2?'rgba(255,255,255,.14)':'rgba(255,240,180,.1)';c.beginPath();c.moveTo(0,0);c.arc(0,0,900,i/16*TAU,(i+.5)/16*TAU);c.closePath();c.fill();}c.restore();
    c.fillStyle='rgba(255,255,255,.25)';ell(c,200,690,260,60);sparkles(c,18,'#fff',[VY0,VY1]);},
};
function drawBG(c,k){(BG[k]||BG.office)(c);}

// ================= items (sprite-cached with soft shading) =================
function OL(c,col,w=3){c.strokeStyle=shade(col,-.4);c.lineWidth=w;}
function rawItem(c,k,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);c.lineJoin='round';c.lineCap='round';
  const hl=(x,y,rx,ry)=>{c.fillStyle='rgba(255,255,255,.6)';ell(c,x,y,rx,ry);};
  switch(k){
    case'strawberry':c.fillStyle='#ff4d6d';OL(c,'#ff4d6d');c.beginPath();c.moveTo(0,24);c.bezierCurveTo(-28,4,-24,-18,0,-15);c.bezierCurveTo(24,-18,28,4,0,24);c.fill();c.stroke();c.fillStyle='#fff3a0';for(const[a,b]of[[-9,-3],[7,-5],[0,7],[-10,8],[10,6],[-1,-9],[3,15]])ell(c,a,b,1.7,2.3);c.fillStyle='#4cc06a';OL(c,'#4cc06a',2.5);star(c,0,-16,12,5,6);c.fill();c.stroke();hl(-9,-7,4,3);break;
    case'cherry':c.strokeStyle='#3a8a3a';c.lineWidth=3;c.beginPath();c.moveTo(-10,4);c.quadraticCurveTo(-5,-16,4,-22);c.moveTo(10,6);c.quadraticCurveTo(8,-10,4,-22);c.stroke();c.fillStyle='#6cd08a';ell(c,10,-22,8,4);
      for(const[a,b]of[[-11,9],[10,11]]){c.fillStyle='#ff2a5a';OL(c,'#ff2a5a');c.beginPath();c.arc(a,b,12,0,TAU);c.fill();c.stroke();hl(a-4,b-4,3.5,2.5);}break;
    case'blueberry':for(const[a,b]of[[-10,5],[10,5],[0,-8]]){c.fillStyle='#5a6ae8';OL(c,'#5a6ae8');c.beginPath();c.arc(a,b,12,0,TAU);c.fill();c.stroke();hl(a-4,b-4,3,2);c.fillStyle='#3a3a8a';star(c,a,b+2,3,1.2,5);c.fill();}break;
    case'choco':c.rotate(.2);c.fillStyle='#7a4a2a';OL(c,'#7a4a2a');rr(c,-22,-15,44,30,6);c.fill();c.stroke();c.strokeStyle='#9a6a4a';c.lineWidth=2;for(const a of[-7,7]){c.beginPath();c.moveTo(a,-13);c.lineTo(a,13);c.stroke();}c.beginPath();c.moveTo(-20,0);c.lineTo(20,0);c.stroke();break;
    case'starcandy':c.fillStyle='#ffd23a';OL(c,'#ffb000');star(c,0,0,26,12,5);c.fill();c.stroke();hl(-6,-8,5,3);break;
    case'heartcookie':c.fillStyle='#e8a860';OL(c,'#e8a860');heartP(c,0,-2,24);c.fill();c.stroke();c.fillStyle='#ff8cc0';heartP(c,0,-2,15);c.fill();hl(-7,-8,4,2.5);break;
    case'candle':{c.fillStyle='#fff';OL(c,'#ff8cc0',2.5);rr(c,-6,-26,12,40,4);c.fill();c.stroke();c.strokeStyle='#ff8cc0';c.lineWidth=3;for(let i=0;i<3;i++){c.beginPath();c.moveTo(-6,-18+i*12);c.lineTo(6,-24+i*12);c.stroke();}
      c.strokeStyle='#5a3a2a';c.lineWidth=2;c.beginPath();c.moveTo(0,-26);c.lineTo(0,-31);c.stroke();const f=Math.sin(T*14)*1.5;c.fillStyle='#ffb03a';c.beginPath();c.ellipse(0,-39,6+f*.3,10+f,0,0,TAU);c.fill();c.fillStyle='#fff2a0';ell(c,0,-36,3,5);break;}
    case'apple':c.fillStyle='#ff4d4d';OL(c,'#ff4d4d');c.beginPath();c.moveTo(0,-14);c.bezierCurveTo(14,-26,32,-10,22,10);c.bezierCurveTo(14,28,4,24,0,20);c.bezierCurveTo(-4,24,-14,28,-22,10);c.bezierCurveTo(-32,-10,-14,-26,0,-14);c.fill();c.stroke();
      c.strokeStyle='#7a4a2a';c.lineWidth=3;c.beginPath();c.moveTo(0,-14);c.lineTo(2,-24);c.stroke();c.fillStyle='#4cc06a';OL(c,'#4cc06a',2);c.beginPath();c.ellipse(9,-22,8,4,-.4,0,TAU);c.fill();c.stroke();hl(-11,-4,5,7);break;
    case'banana':c.fillStyle='#ffe04a';OL(c,'#e8b800');c.beginPath();c.moveTo(-24,-12);c.quadraticCurveTo(-18,22,24,10);c.quadraticCurveTo(26,6,22,4);c.quadraticCurveTo(-8,12,-16,-14);c.closePath();c.fill();c.stroke();c.fillStyle='#7a5a2a';ell(c,-21,-13,3,3);break;
    case'carrot':c.fillStyle='#4cc06a';OL(c,'#4cc06a',2.5);for(const a of[-.5,0,.5]){c.save();c.translate(0,-16);c.rotate(a);c.beginPath();c.ellipse(0,-10,5,12,0,0,TAU);c.fill();c.stroke();c.restore();}
      c.fillStyle='#ff9a3a';OL(c,'#ff9a3a');c.beginPath();c.moveTo(-14,-16);c.quadraticCurveTo(0,-22,14,-16);c.quadraticCurveTo(6,10,0,28);c.quadraticCurveTo(-6,10,-14,-16);c.fill();c.stroke();c.strokeStyle='#d8702a';c.lineWidth=2;for(const[a,b]of[[-8,-6],[6,2],[-4,10]]){c.beginPath();c.moveTo(a,b);c.lineTo(a+6,b);c.stroke();}break;
    case'milk':c.fillStyle='#ffffff';OL(c,'#9ab0d8');rr(c,-16,-14,32,40,4);c.fill();c.stroke();c.beginPath();c.moveTo(-16,-14);c.lineTo(0,-28);c.lineTo(16,-14);c.closePath();c.fill();c.stroke();c.fillStyle='#5aa8ff';c.fillRect(-15,0,30,12);c.fillStyle='#fff';circ(c,0,6,4);break;
    case'bread':c.fillStyle='#e8a860';OL(c,'#c8803a');rr(c,-26,-14,52,30,14);c.fill();c.stroke();c.fillStyle='#f4c888';rr(c,-22,-12,44,12,8);c.fill();c.strokeStyle='#c8803a';c.lineWidth=2.5;for(const a of[-10,2,14]){c.beginPath();c.moveTo(a,-10);c.lineTo(a-6,0);c.stroke();}break;
    case'fish':c.fillStyle='#5aa8ff';OL(c,'#3a78d8');c.beginPath();c.moveTo(-26,0);c.quadraticCurveTo(-2,-22,20,-2);c.lineTo(30,-12);c.lineTo(28,12);c.lineTo(20,2);c.quadraticCurveTo(-2,22,-26,0);c.fill();c.stroke();c.fillStyle='#fff';circ(c,-14,-3,4.5);c.fillStyle='#2a2a4a';circ(c,-14,-3,2.3);c.strokeStyle='#bfe0ff';c.lineWidth=2;c.beginPath();c.arc(-2,0,8,-1,1);c.stroke();break;
    case'egg':c.fillStyle='#fffaf0';OL(c,'#d8c8a8');c.beginPath();c.ellipse(0,2,19,24,0,0,TAU);c.fill();c.stroke();hl(-7,-8,5,7);break;
    case'cheese':c.fillStyle='#ffd84a';OL(c,'#e8b000');c.beginPath();c.moveTo(-26,14);c.lineTo(24,14);c.lineTo(24,-6);c.lineTo(-26,-14);c.closePath();c.fill();c.stroke();c.fillStyle='#f0b800';for(const[a,b,r]of[[-12,4,4],[6,6,5],[14,-2,3],[-2,-4,2.5]])circ(c,a,b,r);break;
    case'tomato':c.fillStyle='#ff4d3a';OL(c,'#ff4d3a');c.beginPath();c.ellipse(0,3,24,21,0,0,TAU);c.fill();c.stroke();c.fillStyle='#4cc06a';OL(c,'#4cc06a',2);star(c,0,-16,11,4,5);c.fill();c.stroke();hl(-9,-3,5,6);break;
    case'grapes':c.strokeStyle='#5a8a3a';c.lineWidth=3;c.beginPath();c.moveTo(0,-20);c.lineTo(2,-28);c.stroke();c.fillStyle='#6cd08a';ell(c,10,-24,8,4);for(const[a,b]of[[-12,-12],[0,-12],[12,-12],[-6,0],[6,0],[0,12]]){c.fillStyle='#9a5ad8';OL(c,'#9a5ad8',2);c.beginPath();c.arc(a,b,8,0,TAU);c.fill();c.stroke();hl(a-3,b-3,2.5,2);}break;
    case'bone':c.fillStyle='#fffaf0';OL(c,'#c8b898');rr(c,-18,-7,36,14,6);c.fill();c.stroke();for(const[a,b]of[[-20,-7],[-20,7],[20,-7],[20,7]]){c.beginPath();c.arc(a,b,8,0,TAU);c.fill();c.stroke();}c.fillStyle='#fffaf0';c.fillRect(-18,-6,36,12);break;
    case'bamboo':c.fillStyle='#6cc86a';OL(c,'#3a9a4a');rr(c,-7,-28,14,56,6);c.fill();c.stroke();c.strokeStyle='#3a9a4a';c.lineWidth=2.5;for(const b of[-10,8]){c.beginPath();c.moveTo(-7,b);c.lineTo(7,b);c.stroke();}c.fillStyle='#8ee07a';OL(c,'#3a9a4a',2);c.beginPath();c.ellipse(15,-14,12,5,-.5,0,TAU);c.fill();c.stroke();c.beginPath();c.ellipse(-14,4,11,4.5,.5,0,TAU);c.fill();c.stroke();break;
    case'duck':c.fillStyle='#ffd83a';OL(c,'#e8a800');c.beginPath();c.ellipse(2,8,24,15,0,0,TAU);c.fill();c.stroke();c.beginPath();c.arc(-8,-12,13,0,TAU);c.fill();c.stroke();c.fillStyle='#ff9a3a';OL(c,'#e87a1a',2);c.beginPath();c.ellipse(-22,-9,8,4,0,0,TAU);c.fill();c.stroke();c.fillStyle='#2a2a3a';circ(c,-11,-15,2.6);c.fillStyle='#fff';circ(c,-12,-16,1);c.fillStyle='#ffb3c0';ell(c,-4,-8,3,2);c.fillStyle='#ffe88a';c.beginPath();c.ellipse(8,4,10,6,-.3,0,TAU);c.fill();break;
    case'icepack':c.fillStyle='#9fdcff';OL(c,'#5aa8e8');rr(c,-22,-16,44,34,12);c.fill();c.stroke();c.fillStyle='#ff8cc0';rr(c,-8,-24,16,10,3);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.8)';for(const[a,b]of[[-10,-2],[4,4],[10,-6],[-4,10]]){c.save();c.translate(a,b);c.rotate(.4);c.fillRect(-4,-4,8,8);c.restore();}break;
    case'bandage':c.rotate(-.35);c.fillStyle='#ffd0a8';OL(c,'#e8a878');rr(c,-28,-10,56,20,10);c.fill();c.stroke();c.fillStyle='#fff0e0';rr(c,-9,-8,18,16,4);c.fill();c.fillStyle='#e8a878';for(const a of[-20,-15,15,20])for(const b of[-3,3])circ(c,a,b,1.2);break;
    case'sponge':c.fillStyle='#ffe36a';OL(c,'#e8c000');rr(c,-26,-17,52,34,10);c.fill();c.stroke();c.fillStyle='#f0c830';for(const[a,b,r]of[[-14,-6,3],[2,4,4],[14,-4,3],[-6,8,2.5],[16,8,2]])circ(c,a,b,r);c.fillStyle='rgba(255,255,255,.9)';OL(c,'#9ac8f0',1.5);for(const[a,b,r]of[[-16,-20,6],[-4,-22,8],[10,-20,5]]){c.beginPath();c.arc(a,b,r,0,TAU);c.fill();c.stroke();}break;
    case'shower':c.fillStyle='#d8e0f0';OL(c,'#9aa8c8');rr(c,-6,0,12,36,6);c.fill();c.stroke();c.save();c.rotate(.0);c.beginPath();c.ellipse(0,-6,22,12,0,0,TAU);c.fill();c.stroke();c.restore();c.fillStyle='#8a98b8';for(let i=-2;i<=2;i++)for(const b of[-3,4])circ(c,i*7,-6+b*.6+ (b>0?2:0),1.6);break;
    case'soap':c.fillStyle='#ff9ac8';OL(c,'#e86aa0');rr(c,-24,-13,48,26,11);c.fill();c.stroke();hl(-8,-5,10,4);c.fillStyle='rgba(255,255,255,.9)';OL(c,'#9ac8f0',1.5);for(const[a,b,r]of[[12,-18,6],[22,-10,4]]){c.beginPath();c.arc(a,b,r,0,TAU);c.fill();c.stroke();}break;
    case'bubble':c.fillStyle='rgba(200,235,255,.55)';c.strokeStyle='#7ac0f0';c.lineWidth=3;c.beginPath();c.arc(0,0,24,0,TAU);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.9)';ell(c,-9,-9,6,4);c.strokeStyle='rgba(255,160,220,.6)';c.lineWidth=2;c.beginPath();c.arc(0,0,17,.3,1.4);c.stroke();break;
    case'cart':c.strokeStyle='#ff5a7a';c.lineWidth=4;c.fillStyle='rgba(255,140,170,.25)';c.beginPath();c.moveTo(-26,-16);c.lineTo(24,-16);c.lineTo(18,8);c.lineTo(-20,8);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(-26,-16);c.lineTo(-32,-24);c.stroke();c.fillStyle='#4a4a6a';circ(c,-14,16,5);circ(c,14,16,5);break;
    case'dress':c.fillStyle='#ff8cc0';OL(c,'#ff8cc0');c.beginPath();c.moveTo(-8,-24);c.lineTo(8,-24);c.lineTo(10,-8);c.lineTo(26,22);c.quadraticCurveTo(0,28,-26,22);c.lineTo(-10,-8);c.closePath();c.fill();c.stroke();bow(c,0,-9,4,'#ff4d8d');break;
    case'crown':c.fillStyle='#ffd23a';OL(c,'#e8a800');c.beginPath();c.moveTo(-24,14);c.lineTo(-26,-12);c.lineTo(-12,0);c.lineTo(0,-20);c.lineTo(12,0);c.lineTo(26,-12);c.lineTo(24,14);c.closePath();c.fill();c.stroke();c.fillStyle='#ff4d8d';heartP(c,0,5,6);c.fill();c.fillStyle='#5aa8ff';circ(c,-14,7,3);circ(c,14,7,3);break;
    case'ribbon':bow(c,0,0,11,'#ff5fa2');break;
    case'cake':c.fillStyle='#f5c77a';OL(c,'#d8a050');rr(c,-26,-6,52,28,6);c.fill();c.stroke();c.fillStyle='#ff9ac8';c.fillRect(-25,4,50,5);c.fillStyle='#fff';rr(c,-28,-14,56,12,6);c.fill();c.stroke();rawItem(c,'strawberry',0,-26,.55);break;
    case'medicine':c.fillStyle='#8ac8ff';OL(c,'#5a98e8');rr(c,-14,-16,28,36,6);c.fill();c.stroke();c.fillStyle='#fff';rr(c,-9,-26,18,10,3);c.fill();c.stroke();c.fillStyle='#fff';rr(c,-10,-6,20,16,3);c.fill();c.fillStyle='#ff4d6d';c.fillRect(-2,-4,4,12);c.fillRect(-6,0,12,4);break;
    case'letterA':c.fillStyle='#fff';OL(c,'#ff8cc0');rr(c,-24,-24,48,48,12);c.fill();c.stroke();c.fillStyle='#ff5fa2';c.font=`800 34px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('あ',0,2);break;
    case'letterABC':c.fillStyle='#fff';OL(c,'#5aa8ff');rr(c,-24,-24,48,48,12);c.fill();c.stroke();c.fillStyle='#3a88e8';c.font=`800 34px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('A',0,3);break;
    case'pencil':c.rotate(-.7);c.fillStyle='#ffd23a';OL(c,'#e8a800');c.fillRect(-6,-22,12,34);c.strokeRect(-6,-22,12,34);c.fillStyle='#ffd8b0';c.beginPath();c.moveTo(-6,12);c.lineTo(6,12);c.lineTo(0,26);c.closePath();c.fill();c.stroke();c.fillStyle='#4a3a4a';c.beginPath();c.moveTo(-2,21);c.lineTo(2,21);c.lineTo(0,26);c.fill();c.fillStyle='#ff8cc0';c.fillRect(-6,-28,12,7);break;
    case'thermometer':c.rotate(-.5);c.fillStyle='#fff';OL(c,'#9ab0d8');rr(c,-5,-28,10,44,5);c.fill();c.stroke();c.fillStyle='#ff4d6d';c.fillRect(-1.6,-14,3.2,26);c.beginPath();c.arc(0,18,7,0,TAU);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.7)';circ(c,-2,16,2);c.strokeStyle='#9ab0d8';c.lineWidth=1.5;for(let i=0;i<5;i++){c.beginPath();c.moveTo(2,-22+i*6);c.lineTo(5,-22+i*6);c.stroke();}break;
    case'spray':c.fillStyle='#8ad8ff';OL(c,'#4aa8e8');rr(c,-12,-8,24,34,8);c.fill();c.stroke();c.fillStyle='#fff';rr(c,-8,0,16,14,4);c.fill();c.fillStyle='#4aa8e8';c.fillRect(-1.5,2,3,10);c.fillRect(-5,5.5,10,3);c.fillStyle='#ff8cc0';OL(c,'#e0609a');rr(c,-7,-20,14,13,3);c.fill();c.stroke();rr(c,-2,-26,16,7,3);c.fill();c.stroke();break;
    case'spoon':c.rotate(-.6);c.fillStyle='#e8eef8';OL(c,'#9aa8c8');rr(c,-3,-2,6,30,3);c.fill();c.stroke();c.beginPath();c.ellipse(0,-12,11,13,0,0,TAU);c.fill();c.stroke();c.fillStyle='#ff6fa0';ell(c,0,-11,8,9);c.fillStyle='rgba(255,255,255,.6)';ell(c,-3,-14,3,2);break;
    case'shampoo':c.fillStyle='#ffb3d6';OL(c,'#e070a8');rr(c,-14,-12,28,38,9);c.fill();c.stroke();c.fillStyle='#fff';rr(c,-9,-2,18,16,4);c.fill();c.fillStyle='#ff8cc0';heartP(c,0,5,5);c.fill();c.fillStyle='#fff';OL(c,'#c0a0c8');rr(c,-5,-20,10,9,2);c.fill();c.stroke();rr(c,-2,-28,14,6,3);c.fill();c.stroke();break;
    case'towel':c.fillStyle='#ffd0e4';OL(c,'#f090b8');rr(c,-26,-18,52,36,8);c.fill();c.stroke();c.fillStyle='#ffe6f0';rr(c,-26,-18,52,10,[8,8,0,0]);c.fill();c.strokeStyle='#ff9ac8';c.lineWidth=2;c.setLineDash([4,3]);c.beginPath();c.moveTo(-24,10);c.lineTo(24,10);c.stroke();c.setLineDash([]);c.fillStyle='#fff';heartP(c,12,0,5);c.fill();break;
    case'coin':c.fillStyle='#ffd23a';OL(c,'#d8a000');c.beginPath();c.arc(0,0,20,0,TAU);c.fill();c.stroke();c.strokeStyle='#f0b800';c.lineWidth=2.5;c.beginPath();c.arc(0,0,14,0,TAU);c.stroke();c.fillStyle='#f0b000';star(c,0,0,9,4);c.fill();break;
    case'flour':c.fillStyle='#f4ead8';OL(c,'#c8b090');c.beginPath();c.moveTo(-18,-18);c.quadraticCurveTo(0,-26,18,-18);c.lineTo(22,24);c.quadraticCurveTo(0,30,-22,24);c.closePath();c.fill();c.stroke();c.fillStyle='#ffd23a';c.beginPath();c.ellipse(0,4,9,11,0,0,TAU);c.fill();c.fillStyle='#e8a800';c.fillRect(-1,-4,2,16);break;
    case'whisk':c.rotate(-.5);c.fillStyle='#ff8cc0';OL(c,'#e0609a');rr(c,-4,8,8,22,4);c.fill();c.stroke();c.strokeStyle='#9aa8c8';c.lineWidth=2.2;for(const w of[5,10,14]){c.beginPath();c.ellipse(0,-10,w,20,0,0,TAU);c.stroke();}break;
    case'balloon':c.strokeStyle='#8a7a9a';c.lineWidth=2;c.beginPath();c.moveTo(0,18);c.quadraticCurveTo(6,28,0,38);c.stroke();c.fillStyle=gfill(c,-6,-10,24,'#ff6f91');OL(c,'#ff6f91',2.5);c.beginPath();c.ellipse(0,-6,19,23,0,0,TAU);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.55)';ell(c,-7,-14,5,8);c.fillStyle='#ff6f91';c.beginPath();c.moveTo(-4,17);c.lineTo(4,17);c.lineTo(0,13);c.fill();break;
    case'flower':c.strokeStyle='#4cae4a';c.lineWidth=4;c.beginPath();c.moveTo(0,4);c.lineTo(0,30);c.stroke();c.fillStyle='#6cd08a';c.beginPath();c.ellipse(8,22,9,4,-.5,0,TAU);c.fill();c.fillStyle='#ff8cc0';OL(c,'#ff8cc0',2);for(let i=0;i<5;i++){const a=i/5*TAU;c.beginPath();c.ellipse(Math.cos(a)*10,-6+Math.sin(a)*10,9,7,a,0,TAU);c.fill();c.stroke();}c.fillStyle='#ffd23a';circ(c,0,-6,7);break;
    case'wand':c.rotate(-.4);c.fillStyle='#fff';OL(c,'#c0a0c8',2);rr(c,-2.5,-6,5,36,2);c.fill();c.stroke();c.fillStyle='#ffe36a';OL(c,'#e8b000');star(c,0,-14,15,7);c.fill();c.stroke();c.fillStyle='#ff8cc0';heartP(c,0,-14,5);c.fill();break;
    case'goldfish':{const w=Math.sin(T*8)*.2;c.fillStyle='#ff6a3a';OL(c,'#e04a1a');c.save();c.translate(16,0);c.rotate(w);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(14,-18,20,-10);c.quadraticCurveTo(12,0,20,10);c.quadraticCurveTo(14,18,0,0);c.fill();c.stroke();c.restore();
      c.beginPath();c.ellipse(-2,0,20,13,0,0,TAU);c.fill();c.stroke();c.fillStyle='#fff';circ(c,-12,-3,4);c.fillStyle='#2a1a1a';circ(c,-12,-3,2.2);c.fillStyle='#ffb08a';ell(c,-2,6,10,4);c.fillStyle='rgba(255,255,255,.5)';ell(c,-6,-6,6,2.5);break;}
    case'hanabi':for(let i=0;i<12;i++){const a=i/12*TAU;c.strokeStyle=['#ff5f9a','#ffd23a','#5ad0ff'][i%3];c.lineWidth=4;c.beginPath();c.moveTo(Math.cos(a)*7,Math.sin(a)*7);c.lineTo(Math.cos(a)*24,Math.sin(a)*24);c.stroke();c.fillStyle=c.strokeStyle;circ(c,Math.cos(a)*26,Math.sin(a)*26,3);}c.fillStyle='#fff';circ(c,0,0,5);break;
    case'kakigori':c.fillStyle='rgba(210,235,255,.95)';OL(c,'#8ab8e0');c.beginPath();c.moveTo(-18,-2);c.lineTo(18,-2);c.lineTo(12,26);c.lineTo(-12,26);c.closePath();c.fill();c.stroke();c.fillStyle='#ff5f7a';c.beginPath();c.arc(0,-2,20,Math.PI,TAU);c.fill();c.fillStyle='#ff8ca0';circ(c,-8,-12,5);c.fillStyle='#fff';circ(c,6,-14,4);circ(c,-2,-6,3);c.strokeStyle='#ff8cc0';c.lineWidth=2.5;c.beginPath();c.moveTo(8,-4);c.lineTo(22,-26);c.stroke();break;
    case'palette':c.fillStyle='#f4d8a8';OL(c,'#c89a60');c.beginPath();c.ellipse(0,0,28,21,0,0,TAU);c.fill();c.stroke();c.fillStyle='#fffaf0';circ(c,10,8,5);[['#ff4d6d',-14,-6],['#ffd23a',-4,-12],['#5aa8ff',8,-10],['#6cd08a',16,-2],['#b48cff',-14,6]].forEach(([cc,a,b])=>{c.fillStyle=cc;circ(c,a,b,5);});break;
    case'crayon':c.rotate(-.6);c.fillStyle='#ff5f7a';OL(c,'#d83a5a');rr(c,-7,-20,14,36,3);c.fill();c.stroke();c.beginPath();c.moveTo(-7,-20);c.lineTo(0,-32);c.lineTo(7,-20);c.closePath();c.fill();c.stroke();c.fillStyle='#fff';c.fillRect(-7,-8,14,14);c.fillStyle='#ff5f7a';c.fillRect(-5,-4,10,2);c.fillRect(-5,1,10,2);break;
    case'icecream':c.fillStyle='#e8b070';OL(c,'#c08040');c.beginPath();c.moveTo(-13,0);c.lineTo(13,0);c.lineTo(0,30);c.closePath();c.fill();c.stroke();c.strokeStyle='#c08040';c.lineWidth=1.5;for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(i*5-4,2);c.lineTo(i*5+6,18);c.stroke();}
      c.fillStyle='#ffb3d6';OL(c,'#f080b0');c.beginPath();c.arc(0,-4,14,0,TAU);c.fill();c.stroke();c.fillStyle='#b8f0d8';OL(c,'#60c090');c.beginPath();c.arc(0,-20,11,0,TAU);c.fill();c.stroke();c.fillStyle='#ff2a5a';circ(c,0,-32,4);hl(-5,-8,4,3);break;
    case'puzzle':c.fillStyle='#5ac8ff';OL(c,'#2a98d8');c.beginPath();c.moveTo(-18,-18);c.lineTo(-5,-18);c.arc(0,-18,6,Math.PI,0);c.lineTo(18,-18);c.lineTo(18,-5);c.arc(18,0,6,-Math.PI/2,Math.PI/2);c.lineTo(18,18);c.lineTo(-18,18);c.lineTo(-18,5);c.arc(-18,0,6,Math.PI/2,-Math.PI/2,true);c.closePath();c.fill();c.stroke();hl(-8,-8,5,3);break;
    case'note':c.fillStyle='#ff6fa8';OL(c,'#d84a88');c.beginPath();c.ellipse(-10,16,10,7,-.4,0,TAU);c.fill();c.stroke();c.beginPath();c.ellipse(14,10,10,7,-.4,0,TAU);c.fill();c.stroke();c.fillRect(-2,-20,4,36);c.fillRect(22,-26,4,36);c.beginPath();c.moveTo(-2,-20);c.lineTo(26,-26);c.lineTo(26,-16);c.lineTo(-2,-10);c.closePath();c.fill();break;
    case'xylophone':['#ff5a6a','#ffa03a','#ffe04a','#5ad06a','#4aa8ff','#a86aff'].forEach((cc,i)=>{c.fillStyle=cc;OL(c,cc,2);rr(c,-27+i*9,-20+i*2,8,40-i*4,3);c.fill();c.stroke();});c.fillStyle='#fff';for(let i=0;i<6;i++){circ(c,-23+i*9,-14+i*2,1.5);circ(c,-23+i*9,14-i*2,1.5);}break;
    case'mic':c.fillStyle='#5a5a7a';OL(c,'#3a3a5a');rr(c,-5,2,10,28,4);c.fill();c.stroke();c.fillStyle='#d8d8e8';OL(c,'#9a9ab8');c.beginPath();c.arc(0,-10,13,0,TAU);c.fill();c.stroke();c.strokeStyle='#9a9ab8';c.lineWidth=1.5;for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(i*5,-22);c.lineTo(i*5,2);c.stroke();}c.fillStyle='#ff8cc0';c.fillRect(-5,2,10,5);break;
    case'toothbrush':c.rotate(-.6);c.fillStyle='#5ac8ff';OL(c,'#2a98d8');rr(c,-4,-6,8,38,4);c.fill();c.stroke();rr(c,-6,-26,12,22,4);c.fill();c.stroke();c.fillStyle='#fff';OL(c,'#b0c8e0',1.5);for(let i=0;i<4;i++){rr(c,-10,-24+i*5,6,4,1.5);c.fill();c.stroke();}break;
    case'tooth':c.fillStyle='#fff';OL(c,'#b0c0d8');c.beginPath();c.moveTo(-16,-14);c.quadraticCurveTo(-18,-24,-6,-22);c.quadraticCurveTo(0,-19,6,-22);c.quadraticCurveTo(18,-24,16,-14);c.quadraticCurveTo(14,4,10,20);c.quadraticCurveTo(6,24,3,12);c.quadraticCurveTo(0,6,-3,12);c.quadraticCurveTo(-6,24,-10,20);c.quadraticCurveTo(-14,4,-16,-14);c.closePath();c.fill();c.stroke();c.fillStyle='#2a1a22';circ(c,-6,-8,2);circ(c,6,-8,2);c.strokeStyle='#2a1a22';c.lineWidth=1.8;c.beginPath();c.arc(0,-4,4,.3,Math.PI-.3);c.stroke();c.fillStyle='rgba(255,140,170,.5)';ell(c,-11,-3,3,2);ell(c,11,-3,3,2);break;
    case'cup':c.fillStyle='rgba(180,225,255,.8)';OL(c,'#6ab0e0');c.beginPath();c.moveTo(-16,-20);c.lineTo(16,-20);c.lineTo(12,22);c.lineTo(-12,22);c.closePath();c.fill();c.stroke();c.fillStyle='rgba(90,170,255,.6)';c.beginPath();c.moveTo(-14,-6);c.lineTo(14,-6);c.lineTo(12,22);c.lineTo(-12,22);c.closePath();c.fill();c.fillStyle='rgba(255,255,255,.7)';c.fillRect(-11,-16,4,30);break;
    case'poi':c.strokeStyle='#ff8cc0';c.lineWidth=5;c.beginPath();c.moveTo(0,22);c.lineTo(0,46);c.stroke();c.fillStyle='rgba(255,255,255,.75)';c.beginPath();c.arc(0,0,22,0,TAU);c.fill();c.lineWidth=5;c.stroke();break;
    case'uchiwa':c.fillStyle='#e8b070';c.fillRect(-2,6,4,24);c.fillStyle='#ff8cc0';OL(c,'#e0609a');c.beginPath();c.arc(0,-8,22,0,TAU);c.fill();c.stroke();c.fillStyle='#fff';for(let i=0;i<5;i++){const a=i/5*TAU-Math.PI/2;circ(c,Math.cos(a)*7,-8+Math.sin(a)*7,5);}c.fillStyle='#ffd23a';circ(c,0,-8,3.5);break;
    case'corn':c.fillStyle='#8ee07a';OL(c,'#4aa04a',2);c.beginPath();c.moveTo(-4,24);c.quadraticCurveTo(-20,6,-10,-20);c.lineTo(-2,22);c.fill();c.stroke();c.fillStyle='#ffd84a';OL(c,'#e0a800');c.beginPath();c.ellipse(4,-2,11,24,.15,0,TAU);c.fill();c.stroke();c.fillStyle='#f0b800';for(let y=-18;y<20;y+=6)for(let x=-4;x<=10;x+=6)circ(c,x+(y%12?3:0)-2,y,1.6);c.fillStyle='#8ee07a';c.beginPath();c.moveTo(4,26);c.quadraticCurveTo(22,6,14,-14);c.lineTo(8,22);c.fill();c.stroke();break;
    case'star2':c.fillStyle='#ffd23a';OL(c,'#e8a800');star(c,0,0,24,11);c.fill();c.stroke();break;
  }
  c.restore();}

const DYN=new Set(['candle','goldfish']);const SPR={};
function itemSprite(k){if(SPR[k])return SPR[k];const S=200,cv2=document.createElement('canvas');cv2.width=cv2.height=S;const g=cv2.getContext('2d');rawItem(g,k,S/2,S/2,2.5);
  g.globalCompositeOperation='source-atop';const gr=g.createRadialGradient(S*.36,S*.3,4,S*.5,S*.52,S*.5);gr.addColorStop(0,'rgba(255,255,255,.42)');gr.addColorStop(.42,'rgba(255,255,255,0)');gr.addColorStop(1,'rgba(70,20,70,.2)');g.fillStyle=gr;g.fillRect(0,0,S,S);return SPR[k]=cv2;}
function drawItem(c,k,x,y,s=1){if(DYN.has(k))return rawItem(c,k,x,y,s);c.drawImage(itemSprite(k),x-40*s,y-40*s,80*s,80*s);}
// ================= animals =================
const AN={bear:{c:'#c8905a',b:'#f3d6b0',ear:'round',muz:1},rabbit:{c:'#ffffff',b:'#ffe0ec',ear:'long'},cat:{c:'#ffb35a',b:'#fff0d8',ear:'tri',wh:1},dog:{c:'#f4dcb4',b:'#fff6e6',ear:'flop',earC:'#b07a4a',muz:1},panda:{c:'#ffffff',b:'#ffffff',ear:'round',earC:'#3a3a4a',patch:1},
  pig:{c:'#ffc0d0',b:'#ffe0e8',ear:'tri',snout:1},chick:{c:'#ffe04a',b:'#fff3a8',ear:'none',chick:1},hippo:{c:'#b8a8dc',b:'#d8ccf0',ear:'round',earC:'#a898cc',big:1}};
function drawAnimal(c,k,x,y,s,st={}){const A=AN[k];if(!A)return drawItem(c,k,x,y-45*s,s*1.6);const t=st.t??T;c.save();c.translate(x,y);
  const hop=st.hop>0?Math.sin(st.hop*Math.PI)*28:0;c.fillStyle='rgba(60,40,80,.15)';ell(c,0,0,(44-hop*.3)*s,11*s);c.scale(s,s);
  const bob=st.happy||st.dance?Math.abs(Math.sin(t*7))*7:Math.sin(t*2.2)*1.5;c.translate(st.shake>0?Math.sin(st.shake*40)*5:0,-bob-hop);if(st.hop>0&&st.hop<.2)c.scale(1.1,.9);if(st.dance)c.rotate(Math.sin(t*5)*.1);
  const base=A.c==='#ffffff'?'#e8e4f0':A.c,oc=shade(base,-.38);c.strokeStyle=oc;c.lineWidth=3;c.lineJoin='round';const dark='#3a3a4a';
  const fc=(x,y,r,col)=>gfill(c,x,y,r,col,.4,-.14);
  c.fillStyle=A.patch?dark:fc(0,-5,20,A.c);if(!A.chick){c.beginPath();c.ellipse(-18,-5,14,9,0,0,TAU);c.fill();c.stroke();c.beginPath();c.ellipse(18,-5,14,9,0,0,TAU);c.fill();c.stroke();}
  else{c.fillStyle='#ff9a3a';c.strokeStyle='#d8702a';for(const sx of[-1,1]){c.beginPath();c.moveTo(sx*12,-2);c.lineTo(sx*20,0);c.lineTo(sx*6,1);c.closePath();c.fill();c.stroke();}c.strokeStyle=oc;}
  c.fillStyle=fc(0,-36,36,A.c);c.beginPath();c.ellipse(0,-36,36,33,0,0,TAU);c.fill();c.stroke();c.fillStyle=A.b;ell(c,0,-30,22,21);
  c.fillStyle=A.patch?dark:fc(0,-42,14,A.c);const armUp=st.happy||st.dance?Math.sin(t*7)*8:0;
  if(st.tummy){c.beginPath();c.ellipse(-16,-30,10,15,1.1,0,TAU);c.fill();c.stroke();c.beginPath();c.ellipse(16,-30,10,15,-1.1,0,TAU);c.fill();c.stroke();}
  else{c.beginPath();c.ellipse(-33,-42-armUp,10,16,.5,0,TAU);c.fill();c.stroke();c.beginPath();c.ellipse(33,-42-armUp,10,16,-.5,0,TAU);c.fill();c.stroke();}
  const hy=-88,earC=A.earC||A.c;
  if(A.ear==='round'){for(const sx of[-1,1]){c.fillStyle=fc(sx*25,hy-26,12,earC);c.beginPath();c.arc(sx*25,hy-24,A.big?9:12,0,TAU);c.fill();c.stroke();if(!A.patch){c.fillStyle='#ffb3c8';circ(c,sx*25,hy-24,A.big?4:6);}}}
  else if(A.ear==='long'){for(const sx of[-1,1]){c.save();c.translate(sx*13,hy-30);c.rotate(sx*.18+(st.happy?Math.sin(t*7)*.1*sx:0));c.fillStyle=fc(0,-18,20,A.c);c.beginPath();c.ellipse(0,-16,10,26,0,0,TAU);c.fill();c.stroke();c.fillStyle='#ffc0d8';ell(c,0,-16,5,18);c.restore();}}
  else if(A.ear==='tri'){for(const sx of[-1,1]){c.fillStyle=A.c;c.beginPath();c.moveTo(sx*30,hy-8);c.lineTo(sx*26,hy-40);c.lineTo(sx*8,hy-28);c.closePath();c.fill();c.stroke();c.fillStyle='#ffc0d8';c.beginPath();c.moveTo(sx*25,hy-14);c.lineTo(sx*24,hy-32);c.lineTo(sx*13,hy-26);c.closePath();c.fill();}}
  c.fillStyle=fc(-8,hy-10,40,A.c);c.beginPath();c.arc(0,hy,34,0,TAU);c.fill();c.stroke();
  if(A.chick){c.fillStyle=A.c;c.beginPath();c.moveTo(-4,hy-32);c.quadraticCurveTo(-2,hy-46,6,hy-44);c.quadraticCurveTo(0,hy-40,4,hy-33);c.fill();c.stroke();}
  if(A.ear==='flop'){for(const sx of[-1,1]){c.fillStyle=fc(sx*31,hy,16,earC);c.beginPath();c.ellipse(sx*31,hy+4,11,21,sx*-.25,0,TAU);c.fill();c.stroke();}}
  if(A.patch){c.fillStyle=dark;for(const sx of[-1,1]){c.save();c.translate(sx*13,hy+2);c.rotate(sx*.5);ell(c,0,0,9,12);c.restore();}}
  if(A.muz){c.fillStyle=A.b;ell(c,0,hy+13,15,11);}
  if(A.big){c.fillStyle=A.b;c.beginPath();c.ellipse(0,hy+16,26,17,0,0,TAU);c.fill();c.stroke();c.fillStyle=oc;ell(c,-9,hy+10,3,4);ell(c,9,hy+10,3,4);}
  if(A.snout){c.fillStyle='#ff9ab8';c.beginPath();c.ellipse(0,hy+10,12,9,0,0,TAU);c.fill();c.stroke();c.fillStyle='#d86a8a';ell(c,-4,hy+10,2.5,3.5);ell(c,4,hy+10,2.5,3.5);}
  if(k==='cat'){c.strokeStyle='#e8903a';c.lineWidth=3;for(const a of[-8,0,8]){c.beginPath();c.moveTo(a,hy-33);c.lineTo(a,hy-24);c.stroke();}c.strokeStyle=oc;}
  const happy=st.happy||st.eat>0||st.dance,blink=((t*1.3+x*.01)%3.6)>3.48;const ey=A.big?hy-8:hy+2;
  if(happy){c.strokeStyle=A.patch?'#fff':dark;c.lineWidth=3;for(const sx of[-1,1]){c.beginPath();c.arc(sx*13,ey+1,5.5,Math.PI*1.1,Math.PI*1.9);c.stroke();}}
  else if(blink&&!st.sad){c.strokeStyle=A.patch?'#fff':dark;c.lineWidth=3;for(const sx of[-1,1]){c.beginPath();c.moveTo(sx*13-5,ey+1);c.lineTo(sx*13+5,ey+1);c.stroke();}}
  else{for(const sx of[-1,1]){c.fillStyle=A.patch?'#1a1a2a':dark;ell(c,sx*13,ey,5.5,7);c.fillStyle='#fff';circ(c,sx*13-2,ey-3,2.2);circ(c,sx*13+2,ey+2,1);}
    if(st.sad){c.strokeStyle=dark;c.lineWidth=2.5;for(const sx of[-1,1]){c.beginPath();c.moveTo(sx*7,ey-11);c.lineTo(sx*19,ey-7);c.stroke();}}}
  if(A.chick){c.fillStyle='#ff9a3a';c.strokeStyle='#d8702a';c.lineWidth=2;c.beginPath();c.moveTo(-7,hy+10);c.lineTo(7,hy+10);c.lineTo(0,hy+(st.eat>0?20+Math.sin(t*14)*3:17));c.closePath();c.fill();c.stroke();}
  else if(!A.snout&&!A.big){c.fillStyle=k==='rabbit'||k==='cat'?'#ff8cb0':dark;ell(c,0,hy+(A.muz?8:10),k==='dog'||k==='bear'?6:4,k==='dog'||k==='bear'?4.5:3);}
  c.strokeStyle=dark;c.lineWidth=2.5;const my=hy+(A.big?24:A.snout?22:A.muz?15:16);
  if(!A.chick){if(st.open){c.fillStyle='#c83a5a';ell(c,0,my+4,9,8);c.fillStyle='#ff8cb0';ell(c,0,my+8,5,3);}
    else if(st.eat>0){const o=Math.abs(Math.sin(t*14));c.fillStyle='#c83a5a';ell(c,0,my+3,6,1+o*5);}
    else if(st.sad){c.beginPath();c.arc(0,my+8,6,Math.PI*1.2,Math.PI*1.8);c.stroke();}
    else if(happy){c.fillStyle='#c83a5a';c.beginPath();c.arc(0,my,7,0,Math.PI);c.closePath();c.fill();c.fillStyle='#ff8cb0';ell(c,0,my+4,4,2.5);}
    else{c.beginPath();c.arc(-4,my,4,0,Math.PI);c.arc(4,my,4,0,Math.PI);c.stroke();}}
  if(A.wh){c.strokeStyle=oc;c.lineWidth=1.8;for(const sx of[-1,1])for(const d of[-3,3]){c.beginPath();c.moveTo(sx*16,hy+12+d);c.lineTo(sx*32,hy+10+d*2);c.stroke();}}
  c.fillStyle=st.sick?'rgba(255,60,80,.55)':'rgba(255,120,150,.45)';ell(c,-22,hy+12,st.sick?9:6,st.sick?6:4);ell(c,22,hy+12,st.sick?9:6,st.sick?6:4);
  c.restore();}
function drawThing(c,k,x,y,s){if(SPECIAL_THING[k])return SPECIAL_THING[k](c,x,y,s);if(AN[k])drawAnimal(c,k,x,y+44*s,s*.42,{t:0});else drawItem(c,k,x,y,s);}
// ================= UI =================
function drawBtn(c,x,y,r,col,icon,glow){c.save();c.translate(x,y);if(glow){const p=1+Math.sin(T*6)*.06;c.scale(p,p);c.fillStyle='rgba(255,255,255,.5)';circ(c,0,0,r+10+Math.sin(T*6)*4);}
  c.fillStyle=shade(col,-.28);circ(c,0,5,r);c.fillStyle=gfill(c,0,0,r,col,.3,-.1);circ(c,0,0,r);c.fillStyle='rgba(255,255,255,.4)';ell(c,-r*.28,-r*.42,r*.42,r*.2);
  c.strokeStyle='#fff';c.fillStyle='#fff';c.lineWidth=r*.15;c.lineCap='round';c.lineJoin='round';const q=r;
  switch(icon){
    case'home':c.beginPath();c.moveTo(-q*.48,-q*.02);c.lineTo(0,-q*.46);c.lineTo(q*.48,-q*.02);c.stroke();rr(c,-q*.32,-q*.06,q*.64,q*.46,q*.08);c.fill();c.fillStyle=col;rr(c,-q*.1,q*.12,q*.2,q*.28,q*.06);c.fill();break;
    case'book':c.beginPath();c.moveTo(0,-q*.28);c.quadraticCurveTo(-q*.25,-q*.42,-q*.5,-q*.3);c.lineTo(-q*.5,q*.32);c.quadraticCurveTo(-q*.25,q*.2,0,q*.34);c.quadraticCurveTo(q*.25,q*.2,q*.5,q*.32);c.lineTo(q*.5,-q*.3);c.quadraticCurveTo(q*.25,-q*.42,0,-q*.28);c.closePath();c.fill();c.strokeStyle=col;c.lineWidth=q*.08;c.beginPath();c.moveTo(0,-q*.26);c.lineTo(0,q*.3);c.stroke();c.fillStyle='#ffd23a';star(c,-q*.24,-q*.02,q*.14,q*.06);c.fill();break;
    case'sound':case'mute':c.beginPath();c.moveTo(-q*.45,-q*.14);c.lineTo(-q*.2,-q*.14);c.lineTo(q*.08,-q*.4);c.lineTo(q*.08,q*.4);c.lineTo(-q*.2,q*.14);c.lineTo(-q*.45,q*.14);c.closePath();c.fill();
      if(icon==='sound'){c.lineWidth=q*.1;c.beginPath();c.arc(q*.12,0,q*.22,-.9,.9);c.stroke();c.beginPath();c.arc(q*.12,0,q*.4,-.9,.9);c.stroke();}else{c.lineWidth=q*.12;c.beginPath();c.moveTo(q*.22,-q*.18);c.lineTo(q*.5,q*.18);c.moveTo(q*.5,-q*.18);c.lineTo(q*.22,q*.18);c.stroke();}break;
    case'check':c.lineWidth=q*.2;c.beginPath();c.moveTo(-q*.4,0);c.lineTo(-q*.1,q*.3);c.lineTo(q*.42,-q*.3);c.stroke();break;
    case'retry':c.lineWidth=q*.14;c.beginPath();c.arc(0,0,q*.38,-2.6,1.9);c.stroke();c.beginPath();c.moveTo(-q*.58,-q*.5);c.lineTo(-q*.28,-q*.12);c.lineTo(-q*.02,-q*.5);c.closePath();c.fill();break;
    case'camera':rr(c,-q*.5,-q*.3,q*1,q*.66,q*.14);c.fill();rr(c,-q*.18,-q*.44,q*.36,q*.2,q*.06);c.fill();c.fillStyle=col;circ(c,0,q*.04,q*.24);c.fillStyle='#fff';circ(c,0,q*.04,q*.14);break;
    case'play':c.beginPath();c.moveTo(-q*.25,-q*.4);c.lineTo(q*.45,0);c.lineTo(-q*.25,q*.4);c.closePath();c.fill();break;
    case'next':c.lineWidth=q*.18;c.beginPath();c.moveTo(-q*.15,-q*.36);c.lineTo(q*.22,0);c.lineTo(-q*.15,q*.36);c.stroke();break;
    case'prev':c.lineWidth=q*.18;c.beginPath();c.moveTo(q*.15,-q*.36);c.lineTo(-q*.22,0);c.lineTo(q*.15,q*.36);c.stroke();break;
    case'dice':rr(c,-q*.42,-q*.42,q*.84,q*.84,q*.18);c.fill();c.fillStyle=col;for(const [a,b] of [[-.2,-.2],[.2,.2],[0,0],[.2,-.2],[-.2,.2]])circ(c,a*q,b*q,q*.08);break;
    case'bg':rr(c,-q*.46,-q*.36,q*.92,q*.72,q*.1);c.fill();c.fillStyle=col;c.beginPath();c.moveTo(-q*.4,q*.3);c.lineTo(-q*.1,-q*.05);c.lineTo(q*.1,q*.15);c.lineTo(q*.25,0);c.lineTo(q*.4,q*.3);c.fill();circ(c,q*.2,-q*.18,q*.09);break;
    case'pose':c.fillStyle='#fff';circ(c,0,-q*.28,q*.16);c.lineWidth=q*.13;c.beginPath();c.moveTo(0,-q*.1);c.lineTo(0,q*.18);c.moveTo(-q*.36,-q*.3);c.lineTo(0,-q*.02);c.lineTo(q*.36,-q*.3);c.moveTo(-q*.2,q*.44);c.lineTo(0,q*.18);c.lineTo(q*.2,q*.44);c.stroke();break;
    case'house':c.beginPath();c.moveTo(-q*.5,-q*.02);c.lineTo(0,-q*.44);c.lineTo(q*.5,-q*.02);c.closePath();c.fill();rr(c,-q*.34,-q*.08,q*.68,q*.48,q*.06);c.fill();c.fillStyle=col;heartP(c,0,q*.12,q*.2);c.fill();break;
    case'cart':c.lineWidth=q*.1;c.beginPath();c.moveTo(-q*.5,-q*.34);c.lineTo(-q*.32,-q*.34);c.lineTo(-q*.2,q*.16);c.lineTo(q*.36,q*.16);c.lineTo(q*.46,-q*.2);c.lineTo(-q*.28,-q*.2);c.stroke();circ(c,-q*.14,q*.34,q*.1);circ(c,q*.28,q*.34,q*.1);break;
    case'rotate':c.lineWidth=q*.14;c.beginPath();c.arc(0,0,q*.34,-2.2,2.4);c.stroke();c.beginPath();c.moveTo(-q*.5,-q*.46);c.lineTo(-q*.14,-q*.36);c.lineTo(-q*.38,-q*.08);c.closePath();c.fill();break;
    case'box':rr(c,-q*.42,-q*.1,q*.84,q*.5,q*.08);c.fill();c.beginPath();c.moveTo(-q*.48,-q*.1);c.lineTo(-q*.3,-q*.36);c.lineTo(q*.3,-q*.36);c.lineTo(q*.48,-q*.1);c.closePath();c.fill();c.fillStyle=col;rr(c,-q*.14,q*.02,q*.28,q*.1,q*.05);c.fill();break;
    case'plus':case'minus':c.lineWidth=q*.2;c.beginPath();c.moveTo(-q*.34,0);c.lineTo(q*.34,0);if(icon==='plus'){c.moveTo(0,-q*.34);c.lineTo(0,q*.34);}c.stroke();break;
  }
  c.restore();}
const hitC=(x,y,cx,cy,r)=>Math.hypot(x-cx,y-cy)<r;
function drawBubble(c){if(!bub)return;const a=Math.min(1,bub.t*5,(bub.life-bub.t)*3);if(a<=0)return;c.globalAlpha=a;c.font=`800 22px ${FONT}`;
  const lines=[];let cur='';for(const ch of bub.text){cur+=ch;if(c.measureText(cur).width>380){lines.push(cur);cur='';}}if(cur)lines.push(cur);
  const w=Math.min(420,Math.max(...lines.map(l=>c.measureText(l).width))+36),h=lines.length*28+22,x=W/2-w/2+30,y=scene===SCN.map?112:24;
  c.fillStyle='rgba(90,40,110,.15)';rr(c,x+3,y+5,w,h,22);c.fill();c.fillStyle='#fff';c.strokeStyle='#ffb3d6';c.lineWidth=4;rr(c,x,y,w,h,22);c.fill();c.stroke();c.fillStyle='#5a3a5a';c.textAlign='center';c.textBaseline='middle';lines.forEach((l,i)=>c.fillText(l,x+w/2,y+25+i*28));c.globalAlpha=1;}
function drawCard(c){if(!card)return;const a=Math.min(1,card.t*5,(3-card.t)*3);if(a<=0)return;c.save();c.globalAlpha=a;const sc=elastic(Math.min(1,card.t*2.5))*.2+.8;const y=H*.2;c.translate(W/2,y);c.scale(sc,sc);
  c.fillStyle='rgba(90,40,110,.2)';rr(c,-190,-62,380,132,28);c.fill();c.fillStyle='#fffdf6';c.strokeStyle='#ffc93c';c.lineWidth=5;rr(c,-190,-68,380,132,28);c.fill();c.stroke();
  if(card.k)drawThing(c,card.k,-122,-2,1.35);c.textAlign='center';c.textBaseline='middle';const tx=card.k?48:0;
  c.fillStyle='#ff5fa2';c.font=`800 ${card.ja.length>5?34:44}px ${FONT}`;c.fillText(card.ja,tx,card.en?-22:0);
  if(card.en){c.fillStyle='#3a88e8';c.font=`800 30px ${FONT}`;c.fillText(card.en,tx,30);}c.restore();}
function drawHand(c,x,y,t){c.save();c.translate(x,y);c.rotate(-.35);const p=Math.sin(t*8)*3;c.translate(0,p);c.fillStyle='#fff';c.strokeStyle='#8a6a9a';c.lineWidth=3;
  rr(c,-6,-4,12,34,6);c.fill();c.stroke();rr(c,-18,18,36,34,14);c.fill();c.stroke();c.beginPath();c.moveTo(-6,28);c.lineTo(-6,36);c.moveTo(4,28);c.lineTo(4,36);c.stroke();c.restore();
  c.strokeStyle='rgba(255,95,162,.6)';c.lineWidth=3;c.beginPath();c.arc(x,y,14+((t*2)%1)*18,0,TAU);c.stroke();}
function tray(c,y,h=120){c.fillStyle='rgba(90,40,110,.12)';rr(c,14,y-h/2+6,W-28,h,30);c.fill();c.fillStyle=vfill(c,y-h/2,y+h/2,'#ffffff',0,-.04);rr(c,14,y-h/2,W-28,h,30);c.fill();c.strokeStyle='#ffd0e6';c.lineWidth=4;c.stroke();}
function stepDots(c,n,i,yy=128){const x0=W/2-(n-1)*22+30;for(let k=0;k<n;k++){const x=x0+k*44,y=yy;c.fillStyle=k<i?'#ffd23a':k===i?'#ff8cc0':'rgba(255,255,255,.7)';star(c,x,y-0,k===i?13+Math.sin(T*5)*2:11,5);c.fill();c.strokeStyle=k<i?'#e8a800':'#e0c0d8';c.lineWidth=2;c.stroke();}}
// ================= places & stickers =================
const PLACES=[
  {id:'detective',name:'たんていじむしょ',wall:'#ffe4f0',roof:'#7a4ad8',icon:'nyan',ja:'まじかる たんていじむしょ',big:1},
  {id:'fuwa',name:'ふわふわタウン',wall:'#fff4fa',roof:'#ffa6cf',icon:'miru',ja:'ふわふわタウン',big:1},
  {id:'cake',name:'けーきやさん',wall:'#ffd0e4',roof:'#ff6fa8',icon:'cake',ja:'ケーキやさん'},
  {id:'doctor',name:'びょういん',wall:'#f4fbff',roof:'#5aa8ff',icon:'thermometer',ja:'びょういん'},
  {id:'bath',name:'おふろ',wall:'#d8f0ff',roof:'#3cc8d8',icon:'duck',ja:'おふろ'},
  {id:'shop',name:'すーぱー',wall:'#fff4c8',roof:'#6cd08a',icon:'apple',ja:'スーパー'},
  {id:'dress',name:'ようふくやさん',wall:'#f0e4ff',roof:'#b48cff',icon:'dress',ja:'ようふくやさん'},
  {id:'zoo',name:'どうぶつえん',wall:'#e6f6c8',roof:'#ff9a5c',icon:'rabbit',ja:'どうぶつえん'},
  {id:'school',name:'もじのがっこう',wall:'#fff0d8',roof:'#ff5f6f',icon:'letterA',ja:'もじの がっこう'},
  {id:'festival',name:'なつまつり',wall:'#ffe8d0',roof:'#ff5a4a',icon:'goldfish',ja:'なつまつり'},
  {id:'nurie',name:'ぬりえやさん',wall:'#fff8e0',roof:'#ffb03a',icon:'palette',ja:'ぬりえやさん'},
  {id:'puzzle',name:'ぱずるやさん',wall:'#e0f4ff',roof:'#3a9ae8',icon:'puzzle',ja:'パズルやさん'},
  {id:'music',name:'おんがくしつ',wall:'#fce4ff',roof:'#d86ae8',icon:'note',ja:'おんがくしつ'},
  {id:'brush',name:'はいしゃさん',wall:'#e8fff4',roof:'#3ac8a0',icon:'toothbrush',ja:'はいしゃさん'},
  {id:'yuen',name:'ゆうえんち',wall:'#fff0f6',roof:'#ff6f91',icon:'ferris',ja:'ゆうえんち'},
  {id:'space',name:'うちゅう',wall:'#e8e4ff',roof:'#5a4ab8',icon:'rocket',ja:'うちゅう'},
  {id:'train',name:'でんしゃ',wall:'#fff6e0',roof:'#3aa060',icon:'train',ja:'でんしゃ'},
  {id:'sea',name:'うみ',wall:'#e0f6ff',roof:'#2a8ad8',icon:'octopus',ja:'うみの たんけん'},
  {id:'snow',name:'ゆきあそび',wall:'#f4faff',roof:'#8ab8e8',icon:'snowman',ja:'ゆきあそび'},
  {id:'shiri',name:'しりとり',wall:'#fff8e0',roof:'#ff9a3a',icon:'wordchain',ja:'しりとり'},
  {id:'hide',name:'かくれんぼ',wall:'#effbe8',roof:'#4cae6a',icon:'bushpeek',ja:'かくれんぼ'},
  {id:'daruma',name:'だるまさん',wall:'#fff0ec',roof:'#e84a4a',icon:'daruma',ja:'だるまさんが ころんだ'},
  {id:'fire',name:'しょうぼうしょ',wall:'#fff0ec',roof:'#d8282e',icon:'firetruck',ja:'しょうぼうしょ'},
  {id:'race',name:'かけっこ',wall:'#f4f8ff',roof:'#3a8ad8',icon:'medal',ja:'こうていの かけっこ'},
  {id:'obst',name:'しょうがいぶつ',wall:'#f0fff4',roof:'#3aa060',icon:'hurdle',ja:'しょうがいぶつ きょうそう'},
  {id:'tama',name:'たまいれ',wall:'#fff4f4',roof:'#ff5f6f',icon:'tamabasket',ja:'たまいれ'},
  {id:'crane',name:'クレーンゲーム',wall:'#fff0f8',roof:'#ff6fae',icon:'claw',ja:'クレーンゲーム'},
  {id:'blocks',name:'つみき',wall:'#fff8e8',roof:'#ffb03a',icon:'blockhouse',ja:'つみきの へや'},
  {id:'dance',name:'ダンス',wall:'#f4ecff',roof:'#8a5ad8',icon:'discoball',ja:'ダンス ステージ'},
  {id:'pizza',name:'ピザやさん',wall:'#fff4e8',roof:'#e84a3a',icon:'pizza',ja:'ピザやさん'},
  {id:'icecream',name:'アイスやさん',wall:'#f0fbff',roof:'#8ad0ff',icon:'icecone',ja:'アイスクリームやさん'},
  {id:'sushi',name:'おすしやさん',wall:'#fff8ec',roof:'#3a2a4a',icon:'nigiri',ja:'おすしやさん'},
  {id:'salon',name:'ヘアサロン',wall:'#fff0f8',roof:'#ff6fae',icon:'scissors',ja:'ヘアサロン'},
  {id:'carwash',name:'くるまやさん',wall:'#eef6ff',roof:'#3a8ad8',icon:'carR',ja:'くるまの しゅうりやさん'},
  {id:'farm',name:'のうじょう',wall:'#fff8e8',roof:'#c83a3a',icon:'tractor',ja:'のうじょう'},
  {id:'kouji',name:'こうじげんば',wall:'#fff8e0',roof:'#e8a000',icon:'excavator',ja:'こうじげんば'},
  {id:'tidy',name:'おかたづけ',wall:'#f4fff0',roof:'#4cae6a',icon:'recyclebin',ja:'おかたづけの へや'},
  {id:'pet',name:'ペットショップ',wall:'#fff4ec',roof:'#ff9a5a',icon:'puppy',ja:'ペットの おせわ'},
  {id:'airport',name:'くうこう',wall:'#eef6ff',roof:'#5aa8ff',icon:'plane',ja:'くうこう'},
  {id:'mojitsuri',name:'ひらがなつり',wall:'#eef8ff',roof:'#3a9ad8',icon:'hirafish',ja:'ひらがな つり',nw:1},
  {id:'kazu',name:'かずの でんしゃ',wall:'#fff4f0',roof:'#ff6f6f',icon:'kazutrain',ja:'かずの でんしゃ',nw:1},
  {id:'tashizan',name:'たしざん',wall:'#f4fff0',roof:'#6cc060',icon:'applebasket',ja:'りんごの たしざん',nw:1},
  {id:'katachi',name:'かたちの くに',wall:'#fff8f0',roof:'#ffa030',icon:'shapes',ja:'かたちの くに',nw:1},
  {id:'iro',name:'いろの まほう',wall:'#fff0f8',roof:'#ff6fa8',icon:'paintpot',ja:'いろの まほう',nw:1},
  {id:'tokei',name:'とけい',wall:'#fffae8',roof:'#e8a000',icon:'clock2',ja:'とけいの いちにち',nw:1},
  {id:'memory',name:'おなじカード',wall:'#f4f0ff',roof:'#8a5ae8',icon:'cards',ja:'おなじ カード さがし',nw:1},
  {id:'tensen',name:'てんつなぎ',wall:'#fffaf0',roof:'#ff8a5a',icon:'dotstar',ja:'てんつなぎ',nw:1},
  {id:'meiro',name:'めいろ',wall:'#f0fff4',roof:'#4cae6a',icon:'maze',ja:'ひよこの めいろ',nw:1},
  {id:'kage',name:'かげあて',wall:'#f4f0fa',roof:'#5a4a8a',icon:'shadowcat',ja:'かげあて クイズ',nw:1},
];
PLACES.forEach((p,i)=>p.x=280+i*400);
const WORLD=280+(PLACES.length-1)*400+280;
const STK=[['cake','cake'],['cake','strawberry'],['cake','candle'],['doctor','bear'],['doctor','bandage'],['doctor','thermometer'],['bath','duck'],['bath','sponge'],['bath','shampoo'],
  ['shop','apple'],['shop','cart'],['shop','coin'],['dress','dress'],['dress','crown'],['dress','wand'],['zoo','rabbit'],['zoo','panda'],['zoo','pig'],['school','letterA'],['school','letterABC'],['school','pencil'],
  ['festival','goldfish'],['festival','hanabi'],['festival','kakigori'],['nurie','palette'],['nurie','crayon'],['nurie','icecream'],['puzzle','puzzle'],['puzzle','chick'],['puzzle','starcandy'],
  ['music','note'],['music','xylophone'],['music','mic'],['brush','toothbrush'],['brush','tooth'],['brush','hippo'],
  ['detective','nyan'],['detective','lens'],['detective','heartgem'],['fuwa','miru'],['fuwa','purin'],['fuwa','penpen'],
  ['yuen','ferris'],['yuen','horse'],['yuen','cotton'],['space','rocket'],['space','saturn'],['space','alien'],['train','train'],['train','ticket'],['train','crossing'],['sea','octopus'],['sea','whale'],['sea','turtle'],['snow','snowman'],['snow','mitten'],['snow','snowflake'],
  ['shiri','wordchain'],['shiri','ablock'],['shiri','speech'],['hide','bushpeek'],['hide','boxpeek'],['hide','gemstone'],['daruma','daruma'],['daruma','stopsign'],['daruma','kendama'],
  ['fire','firetruck'],['fire','helmet'],['fire','hydrant'],['race','medal'],['race','baton'],['race','flagcheck'],['obst','hurdle'],['obst','tire'],['obst','anpan'],['tama','redball'],['tama','tamabasket'],['tama','whistle'],
  ['crane','claw'],['crane','goldstar'],['crane','capsuletoy'],['blocks','blockhouse'],['blocks','blocktower'],['blocks','blockcube'],['dance','discoball'],['dance','maracas'],['dance','ribbonstick'],
  ['pizza','pizza'],['pizza','chefhat'],['pizza','pizzacutter'],['icecream','icecone'],['icecream','sundae'],['icecream','sprinkles'],['sushi','nigiri'],['sushi','maki'],['sushi','teacup'],['salon','lionface'],['salon','scissors'],['salon','dryer'],['carwash','carR'],['carwash','wrench'],['carwash','oilcan'],['farm','tractor'],['farm','pumpkin'],['farm','eggbasket'],['kouji','excavator'],['kouji','hardhat'],['kouji','tcone'],['tidy','toybox'],['tidy','recyclebin'],['tidy','vacuum'],['pet','puppy'],['pet','dogbowl'],['pet','tennisball'],['airport','plane'],['airport','suitcase'],['airport','passport'],['mojitsuri','hirafish'],['mojitsuri','fishrod'],['mojitsuri','bucket'],['kazu','kazutrain'],['kazu','num123'],['kazu','abacus'],['tashizan','applebasket'],['tashizan','applepie'],['tashizan','plussign'],['katachi','shapes'],['katachi','shapehouse'],['katachi','circle'],['iro','paintpot'],['iro','rainbow2'],['iro','colorballoons'],['tokei','clock2'],['tokei','alarm'],['tokei','sunmoon'],['memory','cards'],['memory','qcard'],['memory','magnifier'],['tensen','dotstar'],['tensen','ruler'],['tensen','compass'],['meiro','maze'],['meiro','goalflag'],['meiro','bento'],['kage','shadowcat'],['kage','flashlight'],['kage','shadowhand']].map(([place,k])=>({id:place+'_'+k,place,k}));
const STKC={};
function scal(c,cx,cy,R,n,amp){c.beginPath();for(let i=0;i<=120;i++){const a=i/120*TAU,r=R+amp*Math.cos(n*a);c.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);}c.closePath();}
function stkCol(k){const st=STK.find(q=>q.k===k);const p=st&&PLACES.find(q=>q.id===st.place);return p?p.roof:'#ff8cc0';}
function stkSprite(k,mode){const key=k+'#'+(mode||'n');if(STKC[key])return STKC[key];const S=384,U=S/110,o=document.createElement('canvas');o.width=o.height=S;const g=o.getContext('2d');
  const mk=()=>{const q=document.createElement('canvas');q.width=q.height=S;return q;};
  const ic=mk(),ig=ic.getContext('2d');ig.scale(U,U);drawThing(ig,k,55,53,1.32);
  const sil=(col)=>{const q=mk(),qg=q.getContext('2d');qg.drawImage(ic,0,0);qg.globalCompositeOperation='source-in';qg.fillStyle=col;qg.fillRect(0,0,S,S);return q;};
  const dil=mk(),dg=dil.getContext('2d'),ws=sil('#fff'),R=4.2*U;for(let i=0;i<24;i++){const a=i/24*TAU;dg.drawImage(ws,Math.cos(a)*R,Math.sin(a)*R);}dg.drawImage(ws,0,0);
  if(mode==='g'){const gq=mk(),gg=gq.getContext('2d');gg.drawImage(dil,0,0);gg.globalCompositeOperation='source-in';gg.fillStyle='rgba(200,170,200,.35)';gg.fillRect(0,0,S,S);g.drawImage(gq,0,0);const inner=sil('rgba(150,120,160,.25)');g.drawImage(inner,0,0);STKC[key]=o;return o;}
  const sh=mk(),sg=sh.getContext('2d');sg.drawImage(dil,0,0);sg.globalCompositeOperation='source-in';sg.fillStyle='rgba(80,40,100,.3)';sg.fillRect(0,0,S,S);g.drawImage(sh,U*.8,U*2.4);
  if(mode==='s'){const rq=mk(),rg=rq.getContext('2d');rg.drawImage(dil,0,0);rg.globalCompositeOperation='source-in';const hg=rg.createLinearGradient(0,0,S,S);['#ff9ad8','#ffe36a','#8ef0b0','#7ad8ff','#c8a0ff','#ff9ad8'].forEach((q,i)=>hg.addColorStop(i/5,q));rg.fillStyle=hg;rg.fillRect(0,0,S,S);g.drawImage(rq,0,0);
    const inq=mk(),inq2=inq.getContext('2d');const R2=1.6*U;const ws2=sil('#fff');for(let i=0;i<16;i++){const a=i/16*TAU;inq2.drawImage(ws2,Math.cos(a)*R2,Math.sin(a)*R2);}g.drawImage(inq,0,0);}
  else g.drawImage(dil,0,0);
  g.drawImage(ic,0,0);
  const gl=mk(),gq=gl.getContext('2d');const lg=gq.createLinearGradient(0,0,S*.7,S*.7);lg.addColorStop(0,'rgba(255,255,255,.55)');lg.addColorStop(.45,'rgba(255,255,255,.12)');lg.addColorStop(.5,'rgba(255,255,255,0)');gq.fillStyle=lg;gq.fillRect(0,0,S,S);gq.globalCompositeOperation='destination-in';gq.drawImage(dil,0,0);g.drawImage(gl,0,0);
  STKC[key]=o;return o;}
function drawSticker(c,k,x,y,s,owned,shiny){c.save();c.translate(x,y);c.scale(s,s);
  if(owned){c.drawImage(stkSprite(k,shiny?'s':'n'),-55,-55,110,110);
    if(shiny){c.fillStyle='#fff';for(let i=0;i<4;i++){const a=T*1.4+i*1.57,r=42+Math.sin(T*3+i)*4;star(c,Math.cos(a)*r,Math.sin(a)*r,5+Math.sin(T*6+i)*2,1.8,4);c.fill();}}}
  else c.drawImage(stkSprite(k,'g'),-55,-55,110,110);
  c.restore();}
// ================= celebration: coins reward =================
let cel=null;
const STUDY=new Set(['school','shiri','puzzle','mojitsuri','kazu','tashizan','katachi','iro','tokei','memory','tensen','meiro','kage']);
function coinIcon(c,x,y,r){c.save();c.translate(x,y);c.fillStyle='#e8a000';circ(c,0,r*.1,r);c.fillStyle=gfill(c,-r*.3,-r*.3,r*1.2,'#ffd23a',.35,-.1);circ(c,0,0,r);c.strokeStyle='#fff3b0';c.lineWidth=r*.12;c.beginPath();c.arc(0,0,r*.74,0,TAU);c.stroke();c.fillStyle='#fff6c8';star(c,0,r*.04,r*.46,r*.2);c.fill();c.restore();}
function hanaIcon(c,x,y,r){c.save();c.translate(x,y);c.fillStyle='#d8407a';circ(c,0,r*.1,r);c.fillStyle=gfill(c,-r*.3,-r*.3,r*1.2,'#ff7ab0',.35,-.1);circ(c,0,0,r);c.fillStyle='#ffe0ee';for(let i=0;i<5;i++){const a=i/5*TAU-Math.PI/2;circ(c,Math.cos(a)*r*.42,Math.sin(a)*r*.42,r*.27);}c.fillStyle='#ffd23a';circ(c,0,0,r*.24);c.restore();}
function hanamaru(c,x,y,s,a){c.save();c.translate(x,y);c.scale(s,s);c.globalAlpha*=a==null?1:a;c.strokeStyle='#ff3d5a';c.lineCap='round';c.lineWidth=9;c.beginPath();for(let i=0;i<=220;i++){const t=i/220*TAU*3.2,r=26+i*.26;c.lineTo(Math.cos(t)*r,Math.sin(t)*r*.8);}c.stroke();
  c.lineWidth=8;for(let i=0;i<8;i++){const a2=i/8*TAU;c.beginPath();c.ellipse(Math.cos(a2)*96,Math.sin(a2)*80,26,16,a2,0,TAU);c.stroke();}c.restore();}
function wallet(c,x,y,sc){sc=sc||1;c.save();c.translate(x,y);c.scale(sc,sc);c.fillStyle='rgba(255,255,255,.94)';rr(c,-120,-24,240,48,24);c.fill();c.strokeStyle='#ffc93c';c.lineWidth=3;c.stroke();coinIcon(c,-92,0,17);hanaIcon(c,18,0,17);
  c.fillStyle='#7a5000';c.font=`800 22px ${FONT}`;c.textAlign='left';c.textBaseline='middle';const cc=cel&&cel.dc!=null?cel.dc:SAVE.coins,hh=cel&&cel.dh!=null?cel.dh:SAVE.hana;c.fillText(cc,-68,1,78);c.fillStyle='#c02a6a';c.fillText(hh,42,1,70);c.restore();}
function celebrate(place,lucky){if(cel)return;const chest=place==='chest';
  if(!chest){SAVE.plays[place]=(SAVE.plays[place]||0)+1;}const qd=!chest&&questMark(place);const study=STUDY.has(place);
  const coins=chest?50:10+(lucky?5:0)+(qd?5:0),hana=chest?5:study?3+(lucky?1:0):0;
  const list=chest?STK:STK.filter(s=>s.place===place);const un=list.filter(s=>!SAVE.stickers.includes(s.id));let st=null,shiny=false;
  if(un.length)st=chest?pick(un):un[0];else if(chest||lucky){const ns=list.filter(s=>!SAVE.shiny.includes(s.id));if(ns.length){st=pick(ns);shiny=true;}}
  cel={t:0,ph:'yay',pt:0,place,coins,hana,study,st,shiny,qd,qall:qd&&SAVE.quest.chest,gift:null,dc:SAVE.coins,dh:SAVE.hana,fly:[],sent:0,senth:0,lucky};
  SAVE.coins+=coins;SAVE.hana+=hana;if(st)celGive();save();sfx('fanfare');confetti(chest?160:90);RK.clap=3;
  setTimeout(()=>{if(!cel)return;say(cel.qall?'おねがい ぜんぶ クリア！ マップに たからばこが でたよ！':study?'はなまる！ べんきょう がんばったね！ はなまるコインも もらえたよ！':qd?'おねがい クリア！ コインを もらったよ！':'やったね！ コインを もらったよ！');},400);}
function celGive(){const st=cel.st;const before=SAVE.stickers.length;if(!SAVE.stickers.includes(st.id))SAVE.stickers.push(st.id);if(cel.shiny&&!SAVE.shiny.includes(st.id))SAVE.shiny.push(st.id);
  const g=GIFTS.find(g=>before<g[0]&&SAVE.stickers.length>=g[0]);if(g&&!SAVE.gifts.includes(g[0])){SAVE.gifts.push(g[0]);cel.gift=g;}}
const CEL_WX=W-150,CEL_WY=60;
function celBtns(){return[['retry','#ffb03a',W/2-195],['house','#ff8cc0',W/2-65],['cart','#5ab8ff',W/2+65],['home','#ff6fa8',W/2+195]];}
function drawCel(c){const t=cel.t;const a=Math.min(1,t*3);c.fillStyle=`rgba(255,240,248,${.97*a})`;c.fillRect(-OX/SC-10,-OY/SC-10,W+2*OX/SC+20,H+2*OY/SC+20);
  c.save();c.translate(W/2,H*.4);c.rotate(t*.4);const cols=cel.study?['#ffe0ea','#fff3c0','#ffe8f4','#fff0d0']:['#ffd6ea','#fff3c0','#d6f0ff','#e8dcff'];for(let i=0;i<12;i++){c.fillStyle=cols[i%4];c.globalAlpha=a;c.beginPath();c.moveTo(0,0);c.arc(0,0,900,i/12*TAU,(i+.5)/12*TAU);c.closePath();c.fill();}c.restore();c.globalAlpha=a;
  c.textAlign='center';c.textBaseline='middle';c.font=`54px ${POP}`;c.lineJoin='round';c.lineWidth=10;c.strokeStyle='#fff';const ty=H*.13;const TT=cel.study?'はなまる！':cel.place==='chest'?'たからばこ！':'やったね！';c.strokeText(TT,W/2,ty+Math.sin(T*4)*4);c.fillStyle=cel.study?'#ff3d6a':'#ff5fa2';c.fillText(TT,W/2,ty+Math.sin(T*4)*4);
  if(cel.qd){c.save();c.translate(W/2,ty+62);c.rotate(-.04);c.fillStyle='#fff';rr(c,-150,-22,300,44,22);c.fill();c.strokeStyle='#6cd08a';c.lineWidth=4;c.stroke();c.fillStyle='#3aa060';c.font=`800 22px ${FONT}`;c.fillText(cel.qall?'✔ おねがい ぜんぶ クリア！':'✔ おねがい クリア！',0,1);c.restore();}
  const cy=H*.38;
  if(cel.study){const k=clamp((t-.3)/.35,0,1);const s=k<1?2.4-1.4*easeOut(k):1;c.save();c.translate(W/2,cy);c.rotate(-.15);hanamaru(c,0,0,s*1.25,k);c.restore();}
  else{c.save();c.translate(W/2,cy);const sp=Math.cos(T*3);c.scale(Math.max(.08,Math.abs(sp)),1);coinIcon(c,0,0,90);c.restore();}
  c.font=`800 30px ${FONT}`;c.lineWidth=8;c.strokeStyle='#fff';
  const rows=[['c',`コイン  +${cel.coins}`]];if(cel.hana)rows.push(['h',`はなまるコイン  +${cel.hana}`]);if(cel.st)rows.push(['s',cel.shiny?'キラキラシール ゲット！':'シール ゲット！']);if(cel.gift)rows.push(['g',`ごほうび「${cel.gift[3]}」`]);
  const ry0=H*.52;rows.forEach((r,i)=>{const k=clamp((t-1-i*.45)*3,0,1);if(k<=0)return;const y=ry0+i*62;c.save();c.translate(W/2,y);c.scale(elastic(k),elastic(k));c.fillStyle='rgba(255,255,255,.95)';rr(c,-210,-27,420,54,27);c.fill();c.strokeStyle=r[0]==='h'?'#ff7ab0':r[0]==='g'?'#b48cff':'#ffc93c';c.lineWidth=4;c.stroke();
    if(r[0]==='c')coinIcon(c,-172,0,20);else if(r[0]==='h')hanaIcon(c,-172,0,20);else if(r[0]==='s')drawSticker(c,cel.st.k,-172,0,.36,true,cel.shiny);else{c.fillStyle='#b48cff';c.font=`26px ${FONT}`;c.fillText('🎁',-172,2);}
    c.fillStyle=r[0]==='h'?'#c02a6a':r[0]==='g'?'#7a4ad8':'#7a5000';c.font=`800 24px ${FONT}`;c.fillText(r[1],14,1,340);c.restore();});
  for(const f of cel.fly){const k=easeOut(Math.min(1,f.t));const x=lerp(f.x,f.tx,k)+Math.sin(k*Math.PI)*f.cx,y=lerp(f.y,f.ty,k)-Math.sin(k*Math.PI)*120;if(f.h)hanaIcon(c,x,y,15);else coinIcon(c,x,y,15);}
  wallet(c,CEL_WX,CEL_WY,1.05);
  drawFuka(c,W/2-150,H*.86,{outfit:outfit(),t:T,dir:0,sc:2.6,cheer:1});drawRikki(c,W/2+160,H*.86,{sc:2.2,clap:1,t:T});
  if(cel.ph==='done'){const lab={retry:'もういちど',house:'おうち',cart:'おみせ',home:'まち'};for(const [ic,col,x] of celBtns()){drawBtn(c,x,H*.93,40,col,ic,ic==='cart'&&SAVE.coins>=20);c.fillStyle='#8a5a9a';c.font=`800 16px ${FONT}`;c.fillText(lab[ic],x,H*.93+54);}}
  c.globalAlpha=1;}
function celUpdate(dt){cel.t+=dt;cel.pt+=dt;
  if(cel.ph==='yay'&&cel.t>.9){cel.ph='coins';cel.pt=0;}
  if(cel.ph==='coins'){const nv=Math.min(cel.coins,16),nh=cel.hana;cel.spawn=(cel.spawn||0)+dt;while(cel.spawn>.07&&(cel.sent<nv||cel.senth<nh)){cel.spawn-=.07;const h=cel.sent>=nv;if(h)cel.senth++;else cel.sent++;cel.fly.push({x:W/2+rand(-40,40),y:H*.38+rand(-30,30),tx:CEL_WX+(h?30:-80),ty:CEL_WY,cx:rand(-80,80),t:0,h});}
    if(cel.sent>=nv&&cel.senth>=nh&&!cel.fly.length){cel.ph='done';cel.pt=0;cel.dc=null;cel.dh=null;}}
  for(let i=cel.fly.length-1;i>=0;i--){const f=cel.fly[i];f.t+=dt*1.6;if(f.t>=1){cel.fly.splice(i,1);sfx('coin');if(f.h)cel.dh=Math.min(SAVE.hana,cel.dh+1);else cel.dc=Math.min(SAVE.coins,cel.dc+Math.ceil(cel.coins/Math.min(cel.coins,16)));}}}
function celDown(x,y){if(cel.ph!=='done'){if(cel.t>1){for(const f of cel.fly)f.t=Math.max(f.t,.9);}return;}if(cel.pt<.4)return;
  for(const [ic,,bx] of celBtns())if(hitC(x,y,bx,H*.93,50)){sfx('tap');cel=null;if(ic==='retry')scene.enter();else if(ic==='house')go('myhouse');else if(ic==='cart')go('kagu');else go('map');return;}}
// ================= transitions =================
let tr=null;const SCN={};
function go(name){if(tr)return;tr={t:0,next:name,sw:false};sfx('whoosh');hush();}
function drawTr(c){const k=tr.t<.35?1-tr.t/.35:(tr.t-.35)/.35;const cw=cv.width/DPR,ch=cv.height/DPR;const R=Math.hypot(cw,ch)/2*easeOut(k);c.setTransform(DPR,0,0,DPR,0,0);
  c.fillStyle='#ff9ac8';c.beginPath();c.rect(0,0,cw,ch);c.arc(cw/2,ch/2,Math.max(.1,R),0,TAU,true);c.fill('evenodd');
  if(k<.2){c.fillStyle='#fff';heartP(c,cw/2,ch/2,40);c.fill();}}
// ================= drag helper =================
class Dr{constructor(o){Object.assign(this,{x:0,y:0,hx:0,hy:0,r:48,held:false,s:1,k:'',rot:0,px:0},o);this.x=this.hx;this.y=this.hy;this.px=this.x;}
  upd(dt){if(!this.held){const f=Math.min(1,dt*12);this.x+=(this.hx-this.x)*f;this.y+=(this.hy-this.y)*f;}const ts=this.held?1.25:1;this.s+=(ts-this.s)*Math.min(1,dt*12);
    const vx=(this.x-this.px)/Math.max(dt,.001);this.px=this.x;this.rot+=(clamp(vx*.0012,-.5,.5)-this.rot)*Math.min(1,dt*10);}
  hit(x,y){return Math.hypot(x-this.x,y-this.y)<this.r;}
  draw(c,sz=1.4){if(this.hidden)return;c.fillStyle='rgba(90,40,110,.15)';ell(c,this.x,this.y+30+(this.held?14:0),30*this.s,8);c.save();c.translate(this.x,this.y-(this.held?14:0));c.rotate(this.rot);drawItem(c,this.k,0,0,sz*this.s);c.restore();}}

const SPECIAL_THING={
  nyan:(c,x,y,s)=>drawNyan(c,x,y+4*s,s*.62,0),
  miru:(c,x,y,s)=>drawFriend(c,FR.miru,x,y+34*s,s*.5,{t:0}),
  purin:(c,x,y,s)=>drawFriend(c,FR.purin,x,y+34*s,s*.5,{t:0}),
  penpen:(c,x,y,s)=>drawFriend(c,FR.pen,x,y+34*s,s*.5,{t:0}),
  lens:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);c.lineCap='round';c.strokeStyle='#7a4a2a';c.lineWidth=9;c.beginPath();c.moveTo(10,10);c.lineTo(28,28);c.stroke();
    c.fillStyle='rgba(200,235,255,.8)';c.strokeStyle='#e8b000';c.lineWidth=6;c.beginPath();c.arc(-6,-6,20,0,TAU);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.8)';ell(c,-13,-13,6,4);c.fillStyle='#ff5fa2';heartP(c,-6,-4,6);c.fill();c.restore();},
  heartgem:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#ffd23a';star(c,0,0,30,14,8);c.fill();const g=c.createRadialGradient(-6,-8,2,0,0,24);g.addColorStop(0,'#fff');g.addColorStop(.35,'#ff8cc0');g.addColorStop(1,'#e8307a');c.fillStyle=g;heartP(c,0,2,20);c.fill();c.strokeStyle='#fff';c.lineWidth=2.5;c.stroke();c.fillStyle='rgba(255,255,255,.8)';ell(c,-8,-6,5,3);c.restore();},
};

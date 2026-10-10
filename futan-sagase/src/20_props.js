// ================= props (origin = bottom centre). PROPS[k] = [w, h, draw(c,o)] =================
const PROPS={
  tree:[110,160,(c,o)=>{const g=o.col||'#7cc074';rr(c,-7,-62,14,62,5);FS(c,'#a8703f');
    for(const[x,y,r]of[[0,-112,40],[-30,-88,28],[30,-88,28],[-14,-138,24],[16,-136,22]]){circ(c,x,y,r);FS(c,g)}
    circ(c,-10,-118,16);F(c,shade(g,.15));if(o.fruit)for(let i=0;i<7;i++){circ(c,-28+((i*37)%56),-130+((i*23)%60),4);FS(c,o.fruit)}}],
  sakura:[120,160,(c,o)=>{rr(c,-6,-60,12,60,4);FS(c,'#8a5a44');c.lineWidth=5;line(c,0,-56,-26,-92);line(c,0,-60,24,-96);ink(c);
    for(const[x,y,r]of[[0,-110,40],[-34,-92,28],[34,-94,28],[-16,-136,24],[18,-134,24]]){circ(c,x,y,r);FS(c,'#ffc6d9')}
    for(let i=0;i<14;i++){circ(c,-36+((i*29)%72),-140+((i*17)%70),3);F(c,'#ff9cbc')}}],
  pine:[90,170,(c,o)=>{rr(c,-6,-30,12,30,3);FS(c,'#8a5a44');const g=o.col||'#3f9a5a';
    for(let i=0;i<3;i++){poly(c,[[-42+i*8,-24-i*40],[42-i*8,-24-i*40],[0,-80-i*40]]);FS(c,g);if(o.snow){poly(c,[[-22+i*5,-56-i*40],[22-i*5,-56-i*40],[0,-80-i*40]]);FS(c,'#fff')}}}],
  palm:[120,170,(c,o)=>{c.lineWidth=11;c.strokeStyle=LN;c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(14,-70,6,-140);c.stroke();c.lineWidth=8;c.strokeStyle='#b07a4a';c.stroke();ink(c);
    for(let i=0;i<6;i++){const a=-Math.PI/2+(i-2.5)*.55;c.save();c.translate(6,-140);c.rotate(a+Math.PI/2);ell(c,0,-26,9,30);FS(c,'#5fb35a');c.restore()}
    for(const x of[-3,7]){circ(c,x,-134,5);FS(c,'#8a5a30')}}],
  jungle:[130,170,(c,o)=>{rr(c,-8,-80,16,80,5);FS(c,'#7a5a3a');for(let i=0;i<7;i++){const a=Math.PI*(1.05+i*.15);c.save();c.translate(0,-90);c.rotate(a+Math.PI/2);ell(c,0,-38,13,40);FS(c,i%2?'#3f9a5a':'#5fb35a');c.restore()}}],
  bush:[70,46,(c,o)=>{const g=o.col||'#6fb36a';for(const[x,y,r]of[[-18,-16,16],[18,-16,16],[0,-26,20]]){circ(c,x,y,r);FS(c,g)}if(o.flower)for(let i=0;i<6;i++){circ(c,-22+i*9,-24+(i%2)*10,3.2);FS(c,o.flower)}}],
  rock:[60,40,(c,o)=>{c.beginPath();c.moveTo(-28,0);c.quadraticCurveTo(-30,-26,-6,-34);c.quadraticCurveTo(24,-34,28,0);c.closePath();FS(c,o.col||'#b9b2a8');ell(c,-6,-22,8,4,-.3);F(c,'rgba(255,255,255,.35)')}],
  bench:[70,36,(c,o)=>{for(const x of[-26,22]){rr(c,x,-16,4,16,1);FS(c,'#6d5546')}rr(c,-32,-20,64,6,2);FS(c,'#c48a5a');rr(c,-32,-34,64,6,2);FS(c,'#c48a5a')}],
  lamp:[30,110,(c,o)=>{rr(c,-3,-96,6,96,2);FS(c,'#5a4a42');rr(c,-9,-108,18,14,4);FS(c,o.lit?'#ffe08a':'#fff6dc');rr(c,-11,-110,22,4,2);FS(c,'#5a4a42')}],
  stall:[120,120,(c,o)=>{const col=o.col||'#e8504a';rr(c,-52,-50,104,50,4);FS(c,'#f3e6cf');
    for(let i=0;i<4;i++){rr(c,-52+i*26,-50,13,50,0);F(c,shade(col,.55))}rr(c,-52,-50,104,50,4);c.stroke();
    for(const x of[-50,46]){rr(c,x,-108,4,58,1);FS(c,'#a47554')}
    c.beginPath();c.moveTo(-60,-96);c.lineTo(60,-96);c.lineTo(56,-112);c.lineTo(-56,-112);c.closePath();FS(c,col);
    for(let i=0;i<6;i++){c.beginPath();c.arc(-50+i*20,-96,10,0,Math.PI);c.closePath();FS(c,i%2?'#fff':col)}
    if(o.sign){rr(c,-30,-128,60,18,5);FS(c,'#fff');c.fillStyle=LN;c.font='900 12px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(o.sign,0,-119)}
    const gc=o.goods||['#e8504a','#f6c63a','#4cad62','#f28b2f','#f28fb7'];for(let i=0;i<8;i++){circ(c,-42+i*12,-56,5);FS(c,gc[i%gc.length])}}],
  parasol:[110,100,(c,o)=>{const col=o.col||'#e8504a';c.lineWidth=2.5;line(c,0,0,4,-80);ink(c);c.beginPath();c.moveTo(-50,-66);c.quadraticCurveTo(4,-112,58,-66);c.closePath();FS(c,col);
    for(let i=0;i<3;i++){c.beginPath();c.moveTo(4,-96);c.quadraticCurveTo(-30+i*30,-80,-32+i*36,-66);c.lineTo(-18+i*36,-66);c.quadraticCurveTo(-14+i*30,-82,4,-96);F(c,'#fff')}}],
  sandcastle:[70,60,(c,o)=>{rr(c,-30,-26,60,26,3);FS(c,'#e8c88a');for(const x of[-24,12]){rr(c,x,-48,14,24,2);FS(c,'#e8c88a');poly(c,[[x,-48],[x+14,-48],[x+7,-58]]);FS(c,'#d9b26f')}rr(c,-6,-40,12,16,2);FS(c,'#e8c88a');poly(c,[[1,-40],[1,-56],[12,-51]]);FS(c,'#e8504a')}],
  lifeguard:[60,150,(c,o)=>{for(const x of[-22,18]){c.lineWidth=4;line(c,x,0,x*.6,-90);ink(c)}rr(c,-22,-104,44,16,3);FS(c,'#f7f4ee');c.lineWidth=2;line(c,-14,-40,14,-40);line(c,-17,-70,17,-70);ink(c);
    c.beginPath();c.moveTo(-30,-112);c.quadraticCurveTo(0,-150,30,-112);c.closePath();FS(c,'#e8504a')}],
  balloons:[70,150,(c,o)=>{rr(c,-20,-34,40,34,5);FS(c,'#3f7bd6');for(const s of[-1,1]){circ(c,s*14,-2,6);FS(c,'#5b4236')}
    const cs=['#e8504a','#f6c63a','#4cad62','#3f7bd6','#f28b2f','#8d5cc8','#f28fb7'];c.lineWidth=1;for(let i=0;i<7;i++)line(c,0,-34,-24+i*8,-110+(i%3)*10);ink(c);
    for(let i=0;i<7;i++){ell(c,-24+i*8,-118+(i%3)*10,9,11);FS(c,cs[i])}}],
  popcorn:[60,90,(c,o)=>{rr(c,-24,-58,48,58,5);FS(c,'#e8504a');rr(c,-20,-82,40,26,4);c.fillStyle='rgba(220,240,255,.7)';c.fill();c.stroke();for(let i=0;i<10;i++){circ(c,-14+(i%5)*7,-64-Math.floor(i/5)*7,3.4);FS(c,'#fff6d0')}rr(c,-26,-90,52,8,3);FS(c,'#f6c63a');for(const s of[-1,1]){circ(c,s*16,-2,6);FS(c,'#5b4236')}}],
  fence:[100,40,(c,o)=>{const col=o.col||'#f7f4ee';rr(c,-50,-26,100,5,2);FS(c,col);rr(c,-50,-14,100,5,2);FS(c,col);for(let i=0;i<6;i++){rr(c,-48+i*19,-36,8,36,2);FS(c,col)}}],
  hedge:[120,40,(c,o)=>{rr(c,-58,-36,116,36,14);FS(c,o.col||'#6fb36a');for(let i=0;i<5;i++){circ(c,-44+i*22,-34,10);F(c,shade(o.col||'#6fb36a',.12))}}],
  flowers:[60,30,(c,o)=>{for(let i=0;i<9;i++){const x=-24+((i*13)%48),y=-6-((i*7)%18);c.lineWidth=1.2;line(c,x,0,x,y);ink(c);circ(c,x,y,4);FS(c,o.cols?o.cols[i%o.cols.length]:['#f28fb7','#f6c63a','#e8504a','#fff'][i%4])}}],
  slide:[110,110,(c,o)=>{for(const x of[-40,-10]){rr(c,x,-90,5,90,2);FS(c,'#9fa4ab')}for(let i=0;i<5;i++){rr(c,-40,-18-i*16,35,3,1);FS(c,'#9fa4ab')}rr(c,-44,-96,44,8,3);FS(c,'#f6c63a');
    c.beginPath();c.moveTo(-4,-92);c.quadraticCurveTo(30,-60,52,-4);c.lineTo(40,0);c.quadraticCurveTo(20,-50,-8,-80);c.closePath();FS(c,'#e8504a')}],
  swing:[120,100,(c,o)=>{c.lineWidth=5;line(c,-52,0,-40,-92);line(c,52,0,40,-92);line(c,-44,-92,44,-92);c.lineWidth=1.3;for(const x of[-22,18]){line(c,x-6,-92,x-6,-30);line(c,x+6,-92,x+6,-30)}ink(c);for(const x of[-22,18]){rr(c,x-9,-32,18,5,2);FS(c,'#3f7bd6')}}],
  snowman:[50,80,(c,o)=>{circ(c,0,-22,22);FS(c,'#fff');circ(c,0,-56,15);FS(c,'#fff');circ(c,-5,-58,1.8);F(c,LN);circ(c,5,-58,1.8);F(c,LN);poly(c,[[0,-54],[12,-52],[0,-50]]);FS(c,'#f28b2f');rr(c,-13,-76,26,8,2);FS(c,o.col||'#e8504a');rr(c,-9,-90,18,16,2);FS(c,o.col||'#e8504a');rr(c,-14,-44,28,6,3);FS(c,o.scarf||'#3f7bd6')}],
  igloo:[130,80,(c,o)=>{c.beginPath();c.arc(0,0,60,Math.PI,0);c.closePath();FS(c,'#f4f8ff');c.lineWidth=1;for(let i=1;i<4;i++){c.beginPath();c.arc(0,0,60,Math.PI,0);c.stroke()}for(let y=-15;y>-60;y-=15){line(c,-Math.sqrt(3600-y*y),y,Math.sqrt(3600-y*y),y)}ink(c);c.beginPath();c.arc(30,0,18,Math.PI,0);c.closePath();FS(c,'#3b4a66')}],
  sled:[70,30,(c,o)=>{rr(c,-30,-16,60,10,4);FS(c,o.col||'#e8504a');c.lineWidth=2;c.beginPath();c.moveTo(-34,-2);c.lineTo(28,-2);c.quadraticCurveTo(38,-2,36,-12);c.stroke();ink(c)}],
  lanternpole:[60,150,(c,o)=>{rr(c,-3,-140,6,140,2);FS(c,'#6d5546');rr(c,-28,-140,56,4,2);FS(c,'#6d5546');for(const x of[-20,20]){c.lineWidth=1;line(c,x,-136,x,-128);ink(c);ell(c,x,-114,10,14);FS(c,o.lit?'#ff8a5c':'#f7c6a8');rr(c,x-7,-130,14,3,1);F(c,LN);rr(c,x-7,-101,14,3,1);F(c,LN)}}],
  taiko:[60,60,(c,o)=>{for(const x of[-18,18]){c.lineWidth=3;line(c,0,0,x,-20);ink(c)}rr(c,-24,-52,48,34,10);FS(c,'#c9433a');ell(c,-24,-35,5,17);FS(c,'#f3e1b5');ell(c,24,-35,5,17);FS(c,'#f3e1b5')}],
  giraffe:[90,190,(c,o)=>{for(const x of[-20,-8,10,22]){rr(c,x-3,-50,7,50,3);FS(c,'#f2c25a')}ell(c,0,-62,32,18);FS(c,'#f2c25a');c.save();c.translate(-22,-70);c.rotate(-.25);rr(c,-7,-96,15,100,6);FS(c,'#f2c25a');c.restore();
    ell(c,-48,-160,16,11,-.3);FS(c,'#f2c25a');for(const p of[[-8,-64],[10,-58],[-30,-110],[-36,-136],[14,-70],[-24,-88]]){circ(c,p[0],p[1],5);F(c,'#c98a3a')}circ(c,-52,-163,2);F(c,LN);c.lineWidth=2;line(c,-42,-170,-40,-180);ink(c)}],
  elephant:[130,110,(c,o)=>{for(const x of[-32,-12,14,32]){rr(c,x-8,-38,16,38,5);FS(c,'#a9b0bb')}ell(c,0,-52,52,32);FS(c,'#a9b0bb');circ(c,-50,-62,24);FS(c,'#a9b0bb');ell(c,-30,-62,14,20);FS(c,'#c3c9d2');
    c.lineWidth=11;c.strokeStyle=LN;c.beginPath();c.moveTo(-66,-56);c.quadraticCurveTo(-82,-30,-72,-14);c.stroke();c.lineWidth=8;c.strokeStyle='#a9b0bb';c.stroke();ink(c);circ(c,-56,-68,2.4);F(c,LN)}],
  lion:[90,70,(c,o)=>{for(const x of[-22,-8,10,24]){rr(c,x-4,-22,9,22,3);FS(c,'#e8b05a')}ell(c,4,-30,30,16);FS(c,'#e8b05a');for(let i=0;i<12;i++){const a=i/12*TAU;circ(c,-30+Math.cos(a)*14,-40+Math.sin(a)*14,7);FS(c,'#b0602a')}circ(c,-30,-40,12);FS(c,'#f2c06a');circ(c,-34,-42,1.8);F(c,LN);circ(c,-26,-42,1.8);F(c,LN)}],
  enclosure:[180,40,(c,o)=>{for(let i=0;i<10;i++){rr(c,-90+i*20,-34,4,34,1);FS(c,'#8a6a4a')}rr(c,-90,-30,180,4,1);FS(c,'#8a6a4a');rr(c,-90,-12,180,4,1);FS(c,'#8a6a4a')}],
  coral:[80,90,(c,o)=>{const col=o.col||'#f28fb7';c.lineWidth=9;c.strokeStyle=LN;const br=()=>{c.beginPath();c.moveTo(0,0);c.lineTo(0,-40);c.lineTo(-20,-70);c.moveTo(0,-40);c.lineTo(18,-74);c.moveTo(-10,-55);c.lineTo(-30,-58);c.moveTo(8,-56);c.lineTo(28,-52);c.stroke()};br();c.lineWidth=6;c.strokeStyle=col;br();ink(c)}],
  seaweed:[40,110,(c,o)=>{for(const k of[-1,1]){c.beginPath();c.moveTo(k*6,0);c.bezierCurveTo(k*20,-30,k*-8,-60,k*8,-100);c.bezierCurveTo(k*14,-70,k*-2,-40,k*12,0);c.closePath();FS(c,k<0?'#4cad62':'#3f9a5a')}}],
  clam:[50,36,(c,o)=>{c.beginPath();c.arc(0,-4,22,Math.PI,0);c.closePath();FS(c,'#f7c6d8');c.lineWidth=1;for(let i=1;i<5;i++)line(c,0,-4,Math.cos(Math.PI+i*Math.PI/5)*22,-4+Math.sin(Math.PI+i*Math.PI/5)*22);ink(c);circ(c,0,-8,5);FS(c,'#fff')}],
  chest:[60,50,(c,o)=>{rr(c,-26,-30,52,30,4);FS(c,'#a8703f');c.beginPath();c.moveTo(-26,-30);c.quadraticCurveTo(0,-52,26,-30);c.closePath();FS(c,'#c48a5a');rr(c,-4,-34,8,10,2);FS(c,'#f6c63a');for(let i=0;i<4;i++){circ(c,-18+i*12,-38,3);F(c,'#f6c63a')}}],
  rocket:[90,220,(c,o)=>{for(const s of[-1,1]){poly(c,[[s*20,-40],[s*42,-4],[s*20,-20]]);FS(c,'#e8504a')}c.beginPath();c.moveTo(-22,-20);c.lineTo(-22,-140);c.quadraticCurveTo(0,-210,22,-140);c.lineTo(22,-20);c.closePath();FS(c,'#f4f6fa');
    circ(c,0,-120,11);FS(c,'#7cc8ec');rr(c,-22,-60,44,10,2);FS(c,'#e8504a');poly(c,[[-12,-20],[12,-20],[0,-4]]);FS(c,'#f6c63a')}],
  dome:[150,90,(c,o)=>{c.beginPath();c.arc(0,0,70,Math.PI,0);c.closePath();c.fillStyle='rgba(190,230,255,.55)';c.fill();c.stroke();c.lineWidth=1;for(const a of[.3,.6,.9])line(c,-70*Math.cos(a*Math.PI/2)*0,0,Math.cos(Math.PI*a)*70,-Math.sin(Math.PI*a)*70);ink(c);rr(c,-74,-8,148,8,3);FS(c,'#c7ccd4');circ(c,-20,-40,14);F(c,'rgba(110,200,120,.7)');circ(c,22,-30,10);F(c,'rgba(240,140,180,.7)')}],
  crater:[90,30,(c,o)=>{ell(c,0,-6,40,12);FS(c,'#b8b6c4');ell(c,0,-4,30,7);F(c,'#9a98aa')}],
  flag:[40,110,(c,o)=>{rr(c,-2,-100,4,100,1);FS(c,'#c7ccd4');poly(c,[[2,-100],[36,-90],[2,-78]]);FS(c,o.col||'#e8504a')}],
  tower:[100,220,(c,o)=>{rr(c,-40,-180,80,180,4);FS(c,o.col||'#e9dcc6');for(let i=0;i<5;i++){rr(c,-40+i*18,-196,12,18,1);FS(c,o.col||'#e9dcc6')}rr(c,-12,-130,24,30,10);FS(c,'#5a6a8a');poly(c,[[-48,-196],[48,-196],[0,-250]]);}],
  dragon:[200,170,(c,o)=>{const g=o.col||'#6fbf73';c.beginPath();c.moveTo(60,-30);c.quadraticCurveTo(110,-10,96,-60);c.quadraticCurveTo(90,-20,50,-44);c.closePath();FS(c,g);
    poly(c,[[-10,-90],[30,-150],[50,-80]]);FS(c,shade(g,-.15));for(const x of[-30,-6,20,40]){rr(c,x-6,-34,14,34,5);FS(c,g)}ell(c,6,-56,56,32);FS(c,g);ell(c,4,-48,34,18);F(c,'#e6f2a8');
    c.save();c.translate(-50,-80);c.rotate(-.5);rr(c,-10,-40,22,50,10);FS(c,g);c.restore();ell(c,-78,-118,26,20);FS(c,g);circ(c,-84,-124,3);F(c,LN);for(const x of[-80,-64]){poly(c,[[x,-134],[x+6,-152],[x+10,-132]]);FS(c,'#f6e27a')}}],
  dino:[170,150,(c,o)=>{const g=o.col||'#8fcf6a';c.beginPath();c.moveTo(40,-50);c.quadraticCurveTo(100,-40,110,-10);c.quadraticCurveTo(80,-28,36,-30);c.closePath();FS(c,g);
    for(const x of[-20,16]){rr(c,x-8,-40,18,40,6);FS(c,g)}ell(c,0,-58,46,30);FS(c,g);
    for(let i=0;i<5;i++){poly(c,[[-30+i*15,-82+Math.abs(i-2)*3],[-22+i*15,-100+Math.abs(i-2)*4],[-14+i*15,-82+Math.abs(i-2)*3]]);FS(c,'#f6c63a')}
    c.save();c.translate(-40,-74);c.rotate(-.6);rr(c,-9,-50,20,56,10);FS(c,g);c.restore();ell(c,-74,-118,24,16);FS(c,g);circ(c,-80,-122,2.6);F(c,LN)}],
  egg:[40,50,(c,o)=>{ell(c,0,-22,16,22);FS(c,'#f7f0de');for(let i=0;i<4;i++){circ(c,-8+i*6,-30+(i%2)*14,3);F(c,o.col||'#8fcf6a')}}],
  volcano:[300,220,(c,o)=>{poly(c,[[-150,0],[-40,-200],[40,-200],[150,0]]);FS(c,'#8a6a5a');poly(c,[[-40,-200],[40,-200],[24,-170],[8,-186],[-10,-160],[-26,-180]]);FS(c,'#ff7a3c')}],
  tent:[110,90,(c,o)=>{poly(c,[[-54,0],[0,-80],[54,0]]);FS(c,o.col||'#f28b2f');poly(c,[[-14,0],[0,-40],[14,0]]);FS(c,'#5b4236')}],
  table:[80,50,(c,o)=>{rr(c,-36,-36,72,8,3);FS(c,o.col||'#f7f4ee');for(const x of[-30,26])rr(c,x,-30,4,30,1),FS(c,'#8a6a4a');for(let i=0;i<3;i++){circ(c,-18+i*18,-40,5);FS(c,['#e8504a','#f6c63a','#4cad62'][i])}}],
  sign:[60,70,(c,o)=>{rr(c,-3,-50,6,50,2);FS(c,'#8a6a4a');rr(c,-28,-70,56,26,5);FS(c,o.col||'#fff6dc');if(o.text){c.fillStyle=LN;c.font='900 12px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(o.text,0,-57)}}],
  barrel:[40,50,(c,o)=>{rr(c,-17,-44,34,44,8);FS(c,'#b0784a');c.lineWidth=2;line(c,-17,-34,17,-34);line(c,-17,-10,17,-10);ink(c)}],
  cactus:[50,90,(c,o)=>{rr(c,-9,-84,18,84,9);FS(c,'#5fb35a');rr(c,-26,-56,10,26,5);FS(c,'#5fb35a');rr(c,16,-66,10,30,5);FS(c,'#5fb35a')}],
  mushroom:[50,50,(c,o)=>{rr(c,-6,-26,12,26,4);FS(c,'#f7f0de');c.beginPath();c.arc(0,-24,22,Math.PI,0);c.closePath();FS(c,o.col||'#e8504a');for(const p of[[-10,-34],[6,-38],[12,-28]]){circ(c,p[0],p[1],3.4);F(c,'#fff')}}],
};

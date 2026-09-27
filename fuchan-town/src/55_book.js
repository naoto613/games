// ================= sticker book (world maker) =================
const PAGEBG=[['はらっぱの まち','town'],['もり','forest'],['うみ','sea'],['うちゅう','space'],['おしろ','castle'],['おへや','room']];
const DECOR=['tree','house','flower','cloud','rainbow','fence','mushroom','bench','sunD','heartB','tower','fountain','rock','palm'];
const WALKK=new Set(['bear','rabbit','cat','dog','panda','pig','chick','hippo','nyan','miru','purin','penpen','alien','horse','train']),SWIMK=new Set(['fish','goldfish','octopus','whale','turtle','duck','jelly','crab','seahorse','starfish']),FLYK=new Set(['rocket','balloon','starcandy','note','heartcookie','hanabi','saturn','snowflake','crown','wand']);
function drawDecor(c,k,s){c.save();c.scale(s,s);c.lineJoin='round';
  switch(k){case'tree':tree(c,0,50,1.25);break;
    case'house':c.fillStyle='rgba(60,40,80,.15)';ell(c,0,50,60,10);c.fillStyle=vfill(c,-20,50,'#fff4e0',.05,-.05);rr(c,-48,-10,96,60,6);c.fill();c.fillStyle='#ff6f91';c.beginPath();c.moveTo(-60,-6);c.lineTo(0,-56);c.lineTo(60,-6);c.closePath();c.fill();c.fillStyle='#bfe8ff';rr(c,-34,4,22,20,4);c.fill();c.fillStyle='#b07a4a';rr(c,8,12,24,38,[12,12,0,0]);c.fill();c.fillStyle='#a8505a';c.fillRect(24,-50,12,24);break;
    case'flower':for(let i=-1;i<=1;i++){c.save();c.translate(i*22,i?8:0);drawItem(c,'flower',0,0,1.2);c.restore();}break;
    case'cloud':cloud(c,0,0,.8,true);break;
    case'rainbow':c.lineWidth=12;['#ff6f91','#ffb03a','#ffe36a','#8ee07a','#5ac8ff','#b88aff'].forEach((q,i)=>{c.strokeStyle=q;c.beginPath();c.arc(0,40,86-i*12,Math.PI,TAU);c.stroke();});cloud(c,-78,40,.35);cloud(c,78,40,.35);break;
    case'fence':c.fillStyle='#fff';c.strokeStyle='#d8c8b8';c.lineWidth=2;for(let i=-2;i<=2;i++){c.beginPath();c.moveTo(i*26-9,40);c.lineTo(i*26-9,-10);c.lineTo(i*26,-22);c.lineTo(i*26+9,-10);c.lineTo(i*26+9,40);c.closePath();c.fill();c.stroke();}c.fillRect(-64,0,128,8);c.fillRect(-64,22,128,8);break;
    case'mushroom':c.fillStyle='#fff6e0';rr(c,-12,-4,24,40,8);c.fill();c.fillStyle='#ff5f6f';c.beginPath();c.ellipse(0,-6,40,28,0,Math.PI,TAU);c.fill();c.fillStyle='#fff';circ(c,-16,-18,6);circ(c,10,-24,5);circ(c,22,-12,4);break;
    case'bench':c.fillStyle='#c8905a';rr(c,-54,-10,108,12,4);c.fill();rr(c,-54,-34,108,10,4);c.fill();c.fillStyle='#6a5a5a';c.fillRect(-46,2,8,30);c.fillRect(38,2,8,30);break;
    case'sunD':sun(c,0,0,30,T*.3);break;
    case'heartB':c.strokeStyle='#8a7a9a';c.lineWidth=2;c.beginPath();c.moveTo(0,20);c.quadraticCurveTo(8,40,0,60);c.stroke();c.fillStyle=gfill(c,-8,-10,30,'#ff6f91');heartP(c,0,-6,30);c.fill();c.fillStyle='rgba(255,255,255,.5)';ell(c,-12,-18,6,9);break;
    case'tower':c.fillStyle=vfill(c,-60,50,'#ffd0e6',.1,-.05);c.fillRect(-26,-40,52,90);c.fillStyle='#b48cff';c.beginPath();c.moveTo(-34,-38);c.lineTo(0,-96);c.lineTo(34,-38);c.closePath();c.fill();c.fillStyle='#fff';rr(c,-10,-20,20,26,[10,10,0,0]);c.fill();c.fillStyle='#ffd23a';c.beginPath();c.moveTo(0,-96);c.lineTo(0,-118);c.lineTo(18,-110);c.lineTo(0,-104);c.fill();break;
    case'fountain':c.fillStyle='#d8e0f0';c.beginPath();c.ellipse(0,30,62,18,0,0,TAU);c.fill();c.fillStyle='#8fd8ff';c.beginPath();c.ellipse(0,26,52,12,0,0,TAU);c.fill();c.fillStyle='#d8e0f0';c.fillRect(-7,-20,14,46);c.strokeStyle='rgba(120,200,255,.8)';c.lineWidth=4;for(const sd of[-1,1]){c.beginPath();c.moveTo(0,-22);c.quadraticCurveTo(sd*30,-50,sd*40,20);c.stroke();}break;
    case'rock':c.fillStyle=gfill(c,-10,-10,40,'#b8b0c0');c.beginPath();c.ellipse(0,10,44,28,0,0,TAU);c.fill();c.fillStyle='#8ee07a';ell(c,-20,-8,14,6);break;
    case'palm':c.strokeStyle='#b07a4a';c.lineWidth=12;c.lineCap='round';c.beginPath();c.moveTo(0,50);c.quadraticCurveTo(10,0,0,-50);c.stroke();c.fillStyle='#4cae4a';for(let i=0;i<5;i++){c.save();c.translate(0,-52);c.rotate(-2.4+i*.6);c.beginPath();c.ellipse(34,0,36,10,0,0,TAU);c.fill();c.restore();}break;}
  c.restore();}
function drawWorldBg(c,i,w,h){const sky=(a,b,y1)=>{const g=c.createLinearGradient(0,0,0,y1);g.addColorStop(0,a);g.addColorStop(1,b);c.fillStyle=g;c.fillRect(0,0,w,y1);};
  if(i===0){sky('#6fc8ff','#dff6ff',h*.6);c.fillStyle='#c8ecf8';for(let k=0;k<5;k++){c.beginPath();c.moveTo(k*150-60,h*.5);c.lineTo(k*150+30,h*.3);c.lineTo(k*150+120,h*.5);c.fill();}c.fillStyle='#b8e8a0';c.beginPath();c.ellipse(w*.25,h*.56,w*.45,h*.12,0,0,TAU);c.fill();c.beginPath();c.ellipse(w*.8,h*.58,w*.4,h*.12,0,0,TAU);c.fill();
    c.fillStyle=vfill(c,h*.55,h,'#9ee07a',.05,-.08);c.fillRect(0,h*.55,w,h);for(let k=0;k<6;k++){c.save();c.translate(40+k*95,h*.54);drawDecor(c,'house',.45+((k*37)%3)*.05);c.restore();}
    c.fillStyle='#f3e3c8';c.beginPath();c.moveTo(w*.45,h*.6);c.quadraticCurveTo(w*.2,h*.8,w*.35,h);c.lineTo(w*.6,h);c.quadraticCurveTo(w*.45,h*.8,w*.52,h*.6);c.fill();c.fillStyle='#8fd8ff';c.beginPath();c.ellipse(w*.78,h*.82,90,32,0,0,TAU);c.fill();c.fillStyle='rgba(255,255,255,.5)';ell(c,w*.75,h*.8,40,6);flowers(c,0,w,h*.66,h-10,21);}
  else if(i===1){sky('#bfe8ff','#f0fff0',h*.5);c.fillStyle='rgba(255,250,200,.35)';for(let k=0;k<4;k++){c.beginPath();c.moveTo(w*.7+k*20,0);c.lineTo(w*.2+k*80,h);c.lineTo(w*.3+k*80,h);c.lineTo(w*.75+k*20,0);c.fill();}
    for(let k=0;k<8;k++)tree(c,k*80+10,h*.48,1.3,k%2?'#3a9a5a':'#4cae6a');c.fillStyle=vfill(c,h*.46,h,'#7cc85a',.05,-.1);c.fillRect(0,h*.46,w,h);for(let k=0;k<6;k++)tree(c,k*110+40,h*.55,1.6,k%2?'#2a8a4a':'#3a9a5a');
    c.fillStyle='#6ac8f0';c.beginPath();c.moveTo(0,h*.78);c.bezierCurveTo(w*.3,h*.7,w*.6,h*.9,w,h*.8);c.lineTo(w,h*.9);c.bezierCurveTo(w*.6,h*1,w*.3,h*.8,0,h*.88);c.fill();c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=3;for(let k=0;k<5;k++){c.beginPath();c.moveTo(k*120+20,h*.82);c.lineTo(k*120+60,h*.82);c.stroke();}
    for(const [x,y] of [[60,.66],[480,.7],[260,.95]]){c.save();c.translate(x,h*y);drawDecor(c,'mushroom',.6);c.restore();}flowers(c,0,w,h*.6,h*.74,5);}
  else if(i===2){sky('#8fd8ff','#e0f6ff',h*.3);c.fillStyle=vfill(c,h*.3,h,'#3ab0e8',.1,-.25);c.fillRect(0,h*.3,w,h);c.fillStyle='rgba(255,255,255,.3)';for(let k=0;k<6;k++){c.beginPath();c.moveTo(k*110,h*.32);c.lineTo(k*110+40,h*.9);c.lineTo(k*110+70,h*.9);c.lineTo(k*110+30,h*.32);c.fill();}
    c.fillStyle='#f8e4b0';c.beginPath();c.moveTo(0,h*.3);c.lineTo(w*.28,h*.3);c.quadraticCurveTo(w*.2,h*.36,0,h*.4);c.fill();c.save();c.translate(60,h*.29);drawDecor(c,'palm',.7);c.restore();
    c.fillStyle='#bfefff';for(let x=0;x<w;x+=36){c.beginPath();c.arc(x,h*.3,14,0,Math.PI);c.fill();}
    c.fillStyle='#f0d8a0';c.beginPath();c.moveTo(0,h*.9);c.quadraticCurveTo(w*.5,h*.82,w,h*.9);c.lineTo(w,h);c.lineTo(0,h);c.fill();
    for(let k=0;k<7;k++){const x=30+k*85,hh=60+(k*37)%60;c.strokeStyle=k%2?'#3aa060':'#5cc46a';c.lineWidth=9;c.lineCap='round';c.beginPath();c.moveTo(x,h*.92);for(let j=1;j<5;j++)c.lineTo(x+(j%2?8:-8),h*.92-hh*j/4);c.stroke();}
    for(const [x,col] of [[140,'#ff8ab0'],[430,'#ffb06a']]){c.fillStyle=col;for(let j=0;j<5;j++){c.beginPath();c.ellipse(x+(j-2)*14,h*.88-Math.abs(j-2)*-4-30,8,26,(j-2)*.3,0,TAU);c.fill();}}}
  else if(i===3){const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#0e0a3a');g.addColorStop(1,'#3a2a7a');c.fillStyle=g;c.fillRect(0,0,w,h);c.fillStyle='rgba(200,170,255,.18)';c.beginPath();c.ellipse(w*.5,h*.35,w*.8,60,-.4,0,TAU);c.fill();
    c.fillStyle='#fff';for(let k=0;k<80;k++){const x=(k*97)%w,y=(k*173)%(h*.85);c.globalAlpha=.4+(k%3)*.3;circ(c,x,y,.8+(k%4)*.5);}c.globalAlpha=1;drawPlanet(c,PLANETS[2],w*.78,h*.2,40);drawPlanet(c,PLANETS[1],w*.15,h*.42,24);drawPlanet(c,{id:'earth',col:'#5ab8f0',sh:'#2a78c0'},w*.62,h*.5,18);
    c.fillStyle=vfill(c,h*.8,h,'#d8d0e8',.05,-.15);c.beginPath();c.ellipse(w*.5,h*1.25,w*.9,h*.45,0,0,TAU);c.fill();c.fillStyle='rgba(0,0,0,.08)';for(const [x,y,r] of [[.2,.9,30],[.7,.88,22],[.5,.97,40]])ell(c,w*x,h*y,r,r*.35);}
  else if(i===4){sky('#ffc8e4','#fff4fa',h*.62);cloud(c,w*.2,h*.12,.6,true);c.fillStyle='#ffd8ec';rr(c,w*.18,h*.28,w*.64,h*.36,6);c.fill();for(const x of[.14,.5,.86]){c.save();c.translate(w*x,h*.5);drawDecor(c,'tower',1.3);c.restore();}c.fillStyle='#fff';rr(c,w*.43,h*.46,w*.14,h*.18,[40,40,0,0]);c.fill();c.fillStyle='#b48cff';rr(c,w*.45,h*.48,w*.1,h*.16,[30,30,0,0]);c.fill();
    c.fillStyle=vfill(c,h*.62,h,'#a8e088',.05,-.08);c.fillRect(0,h*.62,w,h);c.fillStyle='#f3e3c8';c.beginPath();c.moveTo(w*.44,h*.64);c.lineTo(w*.56,h*.64);c.lineTo(w*.7,h);c.lineTo(w*.3,h);c.fill();c.save();c.translate(w*.2,h*.82);drawDecor(c,'fountain',.9);c.restore();for(const x of[.82,.9]){c.fillStyle='#5cc46a';circ(c,w*x,h*.78,26);}flowers(c,0,w,h*.7,h-6,33);}
  else{c.fillStyle='#fff0f6';c.fillRect(0,0,w,h*.66);c.fillStyle='#ffe0ee';for(let x=0;x<w;x+=40)c.fillRect(x,0,20,h*.66);c.fillStyle='rgba(255,255,255,.6)';for(let x=10;x<w;x+=80)for(let y=20;y<h*.62;y+=80){heartP(c,x+20,y,7);c.fill();}
    c.fillStyle='#fff';rr(c,w*.55,h*.12,w*.34,h*.3,10);c.fill();c.fillStyle=vfill(c,h*.14,h*.4,'#9fdcff',.2,0);rr(c,w*.57,h*.14,w*.3,h*.26,6);c.fill();c.fillStyle='#fff';c.fillRect(w*.715,h*.14,6,h*.26);c.fillStyle='#ff9ac8';c.fillRect(w*.52,h*.1,w*.06,h*.34);c.fillRect(w*.86,h*.1,w*.06,h*.34);
    c.fillStyle=vfill(c,h*.66,h,'#e8b890',.05,-.08);c.fillRect(0,h*.66,w,h);c.fillStyle='rgba(120,70,40,.15)';for(let y=h*.7;y<h;y+=34)c.fillRect(0,y,w,3);c.fillStyle='#c8a0ff';c.beginPath();c.ellipse(w*.5,h*.86,w*.34,h*.08,0,0,TAU);c.fill();c.fillStyle='#e8d8ff';c.beginPath();c.ellipse(w*.5,h*.86,w*.26,h*.055,0,0,TAU);c.fill();
    c.fillStyle='#c8905a';rr(c,w*.06,h*.3,w*.3,14,4);c.fill();rr(c,w*.06,h*.46,w*.3,14,4);c.fill();drawItem(c,'xylophone',w*.14,h*.26,.8);drawItem(c,'book',w*.28,h*.26,.7);drawItem(c,'duck',w*.14,h*.42,.8);drawItem(c,'cake',w*.28,h*.42,.7);}}
const BGC={};
function worldBg(i,w,h){const key=i+'_'+w+'_'+Math.round(h);if(BGC[key])return BGC[key];const o=document.createElement('canvas');const R=2;o.width=w*R;o.height=h*R;const g=o.getContext('2d');g.scale(R,R);drawWorldBg(g,i,w,h);BGC[key]=o;return o;}
SCN.book={bg:'#fff4fa',song:'town',
  enter(){this.tab='page';this.scroll=0;this.drag=null;this.wig={};this.pend=null;this.sel=null;this.play=false;this.kind='stk';this.page=this.page||0;
    while(SAVE.pages.length<6)SAVE.pages.push([]);if(!Array.isArray(SAVE.pbg))SAVE.pbg=[0,1,2,3,4,5];
    const a=this.area();for(const pg of SAVE.pages)for(const p of pg)if(p.rx==null){p.rx=clamp((p.x-a.x)/a.w,0,1);p.ry=clamp((p.y-a.y)/a.h,0,1);}
    const n=SAVE.stickers.length;say(n?`シールちょう！ シールや かざりを はって、じぶんだけの せかいを つくろう！`:'シールちょう！ かざりを はって あそべるよ。 まちで あそぶと シールも もらえるよ');},
  lay(){},
  area(){return{x:20,y:222,w:W-40,h:Math.max(360,H-222-290)};},
  P(p){const a=this.area();return{x:a.x+p.rx*a.w,y:a.y+p.ry*a.h};},
  owned(){const a=[];for(const s of STK)if(SAVE.stickers.includes(s.id)){a.push({k:s.k,shiny:false});if(SAVE.shiny.includes(s.id))a.push({k:s.k,shiny:true});}return a;},
  list(){return this.kind==='stk'?this.owned():DECOR.map(k=>({k,d:true}));},
  trayY(){return H-100;},
  update(dt){for(const k in this.wig)if(this.wig[k]>0)this.wig[k]-=dt;},
  anim(p){if(!this.play)return{dx:0,dy:0,f:1,sc:1};const ph=(p.uid%100)/10;
    if(WALKK.has(p.k)){const v=Math.sin(T*.5+ph);return{dx:v*70,dy:-Math.abs(Math.sin(T*6+ph))*8,f:Math.cos(T*.5+ph)>0?1:-1,sc:1};}
    if(SWIMK.has(p.k)){return{dx:Math.sin(T*.45+ph)*55,dy:Math.sin(T*1.3+ph)*10,f:Math.cos(T*.45+ph)>0?1:-1,sc:1};}
    if(FLYK.has(p.k)){return{dx:Math.sin(T*.4+ph)*24,dy:Math.sin(T*1.1+ph)*20,f:1,sc:1};}
    return{dx:0,dy:0,f:1,sc:1+Math.sin(T*3+ph)*.05};},
  drawItemP(c,p,x,y){const a=this.anim(p),w=this.wig[p.uid]>0?Math.sin(this.wig[p.uid]*30)*.2:0;c.save();c.translate(x+a.dx,y+a.dy);c.rotate((p.r||0)+w);c.scale((p.f||1)*a.f*a.sc,a.sc);if(p.d)drawDecor(c,p.k,p.s);else drawSticker(c,p.k,0,0,p.s,true,p.sh);c.restore();},
  tb(){const p=this.sel;if(!p)return null;const q=this.P(p),a=this.area();const y=clamp(q.y-70*p.s-50,a.y+30,a.y+a.h-30),x=clamp(q.x,a.x+110,a.x+a.w-110);return[['minus',x-96,y],['plus',x-32,y],['flip',x+32,y],['trash',x+96,y]];},
  draw(c){c.fillStyle='#ffe8f4';for(let y=0;y<H;y+=40)c.fillRect(-400,y,W+800,20);
    titleText(c,'シールちょう',W/2+20,58,38,'#ff5fa2');
    const n=SAVE.stickers.length,bx=90,bw=420,by=112;c.fillStyle='#fff';rr(c,bx,by-10,bw,20,10);c.fill();c.fillStyle=vfill(c,by-10,by+10,'#ff8cc0');rr(c,bx,by-10,bw*n/STK.length,20,10);c.fill();c.fillStyle='#8a5a8a';c.font=`800 16px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(`${n}/${STK.length}`,bx+bw+40,by);
    for(const g of GIFTS){const gx=bx+bw*g[0]/STK.length,got=n>=g[0];c.save();c.translate(gx,by);if(!got)c.rotate(Math.sin(T*3+g[0])*.1);c.fillStyle=got?'#ffd23a':'#ff6fa8';rr(c,-13,-13,26,24,5);c.fill();c.fillStyle=got?'#fff':'#ffd23a';c.fillRect(-2.5,-13,5,24);c.fillRect(-13,-4,26,5);c.restore();}
    for(const [id,lb,x] of [['page','せかいを つくる',200],['zukan','ずかん',430]]){const sel=this.tab===id;c.fillStyle=sel?'#ff8cc0':'#fff';rr(c,x-(id==='page'?110:80),148,id==='page'?220:160,50,25);c.fill();c.strokeStyle='#ff8cc0';c.lineWidth=4;c.stroke();c.fillStyle=sel?'#fff':'#ff8cc0';c.font=`800 22px ${FONT}`;c.fillText(lb,x,174);}
    if(this.tab==='page'){const a=this.area(),bi=SAVE.pbg[this.page]||0;c.fillStyle='rgba(90,40,110,.18)';rr(c,a.x+5,a.y+9,a.w,a.h,26);c.fill();c.save();rr(c,a.x,a.y,a.w,a.h,26);c.clip();c.drawImage(worldBg(bi,a.w,a.h),a.x,a.y,a.w,a.h);
      if(bi===0||bi===4){for(let k=0;k<2;k++)cloud(c,a.x+((k*300+T*12)%(a.w+200))-100,a.y+40+k*50,.55,k===0);}
      if(bi===2){c.fillStyle='rgba(255,255,255,.5)';for(let k=0;k<10;k++){c.beginPath();c.arc(a.x+((k*71)%a.w),a.y+a.h-((k*53+T*30)%(a.h*.6)),3+k%3*2,0,TAU);c.fill();}}
      if(bi===3){c.fillStyle='#fff';for(let k=0;k<6;k++){if(Math.sin(T*3+k)>.6){star(c,a.x+(k*131)%a.w,a.y+(k*89)%(a.h*.6),6,2,4);c.fill();}}}
      const pg=SAVE.pages[this.page];for(const p of pg){if(this.drag&&this.drag.placed===p)continue;const q=this.P(p);this.drawItemP(c,p,q.x,q.y);}
      c.restore();c.strokeStyle='#fff';c.lineWidth=7;rr(c,a.x,a.y,a.w,a.h,26);c.stroke();
      if(this.sel&&!this.play){const q=this.P(this.sel);c.strokeStyle='#ff5fa2';c.lineWidth=3;c.setLineDash([8,6]);c.beginPath();c.arc(q.x,q.y,62*this.sel.s,0,TAU);c.stroke();c.setLineDash([]);
        for(const [id,x,y] of this.tb()){c.fillStyle='#fff';circ(c,x,y,26);c.strokeStyle=id==='trash'?'#ff6f6f':'#ff8cc0';c.lineWidth=3;c.beginPath();c.arc(x,y,26,0,TAU);c.stroke();c.fillStyle=id==='trash'?'#ff5f6f':'#ff5fa2';c.font=`900 26px ${FONT}`;c.textAlign='center';c.textBaseline='middle';
          if(id==='minus')c.fillText('－',x,y+1);else if(id==='plus')c.fillText('＋',x,y+1);else if(id==='flip'){c.font=`900 22px ${FONT}`;c.fillText('⇄',x,y+1);}else{c.fillRect(x-9,y-6,18,18);c.fillRect(x-12,y-11,24,4);c.fillRect(x-4,y-15,8,4);}}}
      drawBtn(c,a.x+26,a.y+a.h/2,24,'#ffb3d6','prev');drawBtn(c,a.x+a.w-26,a.y+a.h/2,24,'#ffb3d6','next');
      const ry=a.y+a.h+34;for(let i=0;i<6;i++){c.fillStyle=i===this.page?'#ff5fa2':'#ffd0e6';circ(c,W/2-62+i*25,ry,7);}
      c.fillStyle='#fff';rr(c,24,ry-24,150,48,24);c.fill();c.strokeStyle='#6cd08a';c.lineWidth=3;c.stroke();c.fillStyle='#3aa060';c.font=`800 18px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('🎨 '+PAGEBG[bi][0],99,ry,138);
      c.fillStyle=this.play?'#ff5fa2':'#fff';rr(c,W-174,ry-24,150,48,24);c.fill();c.strokeStyle='#ff5fa2';c.lineWidth=3;c.stroke();c.fillStyle=this.play?'#fff':'#ff5fa2';c.fillText(this.play?'■ とめる':'▶ うごかす',W-99,ry);
      const ty=this.trayY();for(const [id,lb,x] of [['stk','シール',150],['dec','かざり',290]]){const sel=this.kind===id;c.fillStyle=sel?'#ffb03a':'#fff';rr(c,x-62,ty-108,124,36,18);c.fill();c.strokeStyle='#ffb03a';c.lineWidth=3;c.stroke();c.fillStyle=sel?'#fff':'#c87a1a';c.font=`800 18px ${FONT}`;c.fillText(lb,x,ty-90);}
      tray(c,ty,150);const L=this.list();if(!L.length){c.fillStyle='#b88aa8';c.font=`800 20px ${FONT}`;c.fillText('まちで あそんで シールを あつめよう！',W/2,ty);}
      c.save();c.beginPath();c.rect(20,ty-75,W-40,150);c.clip();L.forEach((o,i)=>{const x=80+i*100-this.scroll;if(x<-60||x>W+60)return;if(o.d){c.save();c.translate(x,ty+4);drawDecor(c,o.k,.55);c.restore();}else drawSticker(c,o.k,x,ty,.8,true,o.shiny);});c.restore();
      if(this.drag&&this.drag.moving&&!this.drag.placed){c.save();c.translate(this.drag.x,this.drag.y);if(this.drag.d)drawDecor(c,this.drag.k,1);else drawSticker(c,this.drag.k,0,0,1.05,true,this.drag.sh);c.restore();}
      if(this.drag&&this.drag.placed&&this.drag.moving){c.save();c.globalAlpha=.9;this.drawItemP(c,this.drag.placed,this.drag.x,this.drag.y);c.restore();}}
    else{const cols=6,cw=(W-40)/cols,top=222,rh=Math.min(cw+6,(H-top-30)/Math.ceil(STK.length/cols));STK.forEach((s,i)=>{const x=20+cw*(i%cols)+cw/2,y=top+rh*Math.floor(i/cols)+rh/2;const own=SAVE.stickers.includes(s.id);const w=this.wig[s.id]>0?Math.sin(this.wig[s.id]*30)*.15:0;c.save();c.translate(x,y);c.rotate(w);drawSticker(c,s.k,0,0,Math.min(cw,rh)/100,own,SAVE.shiny.includes(s.id));c.restore();});}},
  down(x,y){if(y>148&&y<200){if(Math.abs(x-200)<110){this.tab='page';sfx('tap');return;}if(Math.abs(x-430)<80){this.tab='zukan';this.sel=null;sfx('tap');return;}}
    const n=SAVE.stickers.length;for(const g of GIFTS){const gx=90+420*g[0]/STK.length;if(hitC(x,y,gx,112,22)){sfx('pop');say(n>=g[0]?`ごほうび ゲット！ 「${g[3]}」が つかえるよ`:`シールを ${g[0]}まい あつめると 「${g[3]}」が もらえるよ`);return;}}
    if(this.tab==='zukan'){const cols=6,cw=(W-40)/cols,top=222,rh=Math.min(cw+6,(H-top-30)/Math.ceil(STK.length/cols));STK.forEach((s,i)=>{const cx=20+cw*(i%cols)+cw/2,cy=top+rh*Math.floor(i/cols)+rh/2;if(hitC(x,y,cx,cy,cw/2)){if(SAVE.stickers.includes(s.id)){this.wig[s.id]=.6;sfx('pop');sayWord(s.k);}else{sfx('tap');const p=PLACES.find(p=>p.id===s.place);say(p.ja+'で あそぶと もらえるよ');}}});return;}
    const a=this.area(),ry=a.y+a.h+34,pg=SAVE.pages[this.page];
    if(this.sel&&!this.play){const t=this.tb().find(([id,bx,by])=>hitC(x,y,bx,by,30));if(t){const p=this.sel;if(t[0]==='minus'){p.s=Math.max(.45,p.s*.82);sfx('pop');}else if(t[0]==='plus'){p.s=Math.min(2.4,p.s*1.22);sfx('pop');}else if(t[0]==='flip'){p.f=-(p.f||1);sfx('whoosh');}else{pg.splice(pg.indexOf(p),1);this.sel=null;sfx('whoosh');puff(x,y,6,'#ffd0e6');}save();return;}}
    if(hitC(x,y,a.x+26,a.y+a.h/2,32)){this.page=(this.page+5)%6;this.sel=null;sfx('whoosh');sayPair(PAGEBG[SAVE.pbg[this.page]][0],PAGEBG[SAVE.pbg[this.page]][1]);return;}if(hitC(x,y,a.x+a.w-26,a.y+a.h/2,32)){this.page=(this.page+1)%6;this.sel=null;sfx('whoosh');sayPair(PAGEBG[SAVE.pbg[this.page]][0],PAGEBG[SAVE.pbg[this.page]][1]);return;}
    if(Math.abs(y-ry)<26){if(x<180){SAVE.pbg[this.page]=((SAVE.pbg[this.page]||0)+1)%PAGEBG.length;save();sfx('spark');sayPair(PAGEBG[SAVE.pbg[this.page]][0],PAGEBG[SAVE.pbg[this.page]][1]);return;}if(x>W-180){this.play=!this.play;this.sel=null;sfx(this.play?'fanfare':'tap');if(this.play)say('シールたちが うごきだした！');return;}}
    const ty=this.trayY();if(y>ty-110&&y<ty-72){if(Math.abs(x-150)<62){this.kind='stk';this.scroll=0;sfx('tap');return;}if(Math.abs(x-290)<62){this.kind='dec';this.scroll=0;sfx('tap');say('かざりは いくつでも はれるよ！');return;}}
    if(y>ty-75&&y<ty+75){const L=this.list();const i=Math.round((x+this.scroll-80)/100);const o=L[i];this.pend={sx:x,sy:y,o,scroll0:this.scroll,mode:null};return;}
    for(let i=pg.length-1;i>=0;i--){const p=pg[i],q=this.P(p);if(hitC(x,y,q.x,q.y,(p.d?60:46)*p.s)){pg.splice(i,1);pg.push(p);this.sel=p;this.drag={placed:p,x:q.x,y:q.y,ox:x-q.x,oy:y-q.y,sx:x,sy:y,moving:false};return;}}
    this.sel=null;},
  move(x,y){const pd=this.pend;if(pd){if(!pd.mode){if(Math.abs(x-pd.sx)>12&&Math.abs(x-pd.sx)>Math.abs(y-pd.sy))pd.mode='scroll';else if(pd.sy-y>14&&pd.o)pd.mode='drag';}
      if(pd.mode==='scroll'){const max=Math.max(0,this.list().length*100-(W-120));this.scroll=clamp(pd.scroll0-(x-pd.sx),0,max);}
      else if(pd.mode==='drag'){this.drag={k:pd.o.k,d:pd.o.d,sh:pd.o.shiny,x,y,moving:true};this.pend=null;sfx('tap');}return;}
    const d=this.drag;if(!d)return;if(!d.moving&&Math.hypot(x-d.sx,y-d.sy)>8)d.moving=true;if(d.moving){d.x=x-(d.ox||0);d.y=y-(d.oy||0);}},
  up(x,y){if(this.pend){const pd=this.pend;this.pend=null;if(!pd.mode&&pd.o){sfx('pop');if(!pd.o.d)sayWord(pd.o.k);}return;}
    const d=this.drag;if(!d)return;this.drag=null;const a=this.area();const pg=SAVE.pages[this.page];
    if(d.placed&&!d.moving){this.wig[d.placed.uid]=.6;sfx(d.placed.d?'pop':'boing');if(!d.placed.d){const k=d.placed.k;if(AN[k]&&typeof ZSND!=='undefined'&&ZSND[k]){hush();speak(ZSND[k]);}sayWord(k);}burst(x,y,6,'heart');return;}
    const inPage=d.x>a.x&&d.x<a.x+a.w&&d.y>a.y&&d.y<a.y+a.h;const rx=clamp((d.x-a.x)/a.w,0,1),ry=clamp((d.y-a.y)/a.h,0,1);
    if(d.placed){if(inPage){d.placed.rx=rx;d.placed.ry=ry;sfx('pop');}else{pg.splice(pg.indexOf(d.placed),1);this.sel=null;sfx('whoosh');puff(d.x,d.y,6,'#ffd0e6');}save();return;}
    if(inPage){if(pg.length>=60)pg.shift();const p={uid:Math.floor(Math.random()*1e9),k:d.k,d:!!d.d,sh:d.sh,rx,ry,s:d.d?1:1,r:d.d?0:rand(-.15,.15),f:1};pg.push(p);this.sel=p;this.wig[p.uid]=.5;sfx('pop');burst(d.x,d.y,8,'star');if(!d.d)sayWord(d.k);save();}},
  hint(){if(this.tab!=='page')return null;const a=this.area();return SAVE.pages[this.page].length?null:{x:80,y:this.trayY(),x2:W/2,y2:a.y+a.h/2};},
  hintText(){return 'したの シールや かざりを うえに ひっぱって はってね';}};

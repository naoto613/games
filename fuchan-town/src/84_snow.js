// ================= snow =================
SCN.snow={bg:'#e8f4ff',song:'fuwa',
  DECO:[['eyes','おめめ','eyes'],['carrot','にんじんの はな','carrot'],['hat','ぼうし','hat'],['scarf','マフラー','scarf'],['arms','うで','arms'],['buttons','ボタン','buttons']],
  enter(){this.ph='roll';this.fin=0;this.ball={x:150,y:H*.8,r:24};this.target=108;this.body=null;this.head=null;this.trail=[];this.dr=false;this.att={};this.ddr=null;this.alive=0;this.flakes=[];this.caught=0;this.scol=pick(['#ff5f6f','#5aa8ff','#ffb03a','#b48cff']);
    say('ゆきだるまを つくろう！ ゆきだまを ゆびで ころころ ころがして おおきく しよう');},
  field(){return{y0:H*.42,y1:H-120};},
  update(dt){if(Math.random()<dt*5)this.flakes.push({x:rand(0,W),y:-10,v:rand(40,90),s:rand(.5,1),ph:rand(0,6)});for(let i=this.flakes.length-1;i>=0;i--){const f=this.flakes[i];f.y+=f.v*dt;f.x+=Math.sin(T+f.ph)*20*dt;if(f.y>H+10)this.flakes.splice(i,1);}
    if(this.ph==='alive'){this.alive+=dt;if(this.alive>4.5&&!this.fin){this.fin=1;celebrate('snow',Object.keys(this.att).length>=6||this.caught>=10);}}
    if(this.slide){const s=this.slide;s.t+=dt*2;const k=ease(Math.min(1,s.t));this.body.x=lerp(s.x0,W/2,k);this.body.y=lerp(s.y0,H*.74-this.body.r,k);if(s.t>=1)this.slide=null;}},
  sm(){const b=this.body,h=this.head;return{bx:b.x,by:b.y,br:b.r,hx:h?h.x:b.x,hy:h?h.y:b.y-b.r-60,hr:h?h.r:70};},
  drawMan(c){const {bx,by,br,hx,hy,hr}=this.sm(),a=this.att,al=this.alive,hop=al>0?Math.abs(Math.sin(al*5))*30:0,wav=al>0?Math.sin(al*8)*.5:0;c.save();c.translate(0,-hop);
    c.fillStyle='rgba(120,150,200,.25)';ell(c,bx,by+br+hop,br*1.1,18);
    if(a.arms)for(const sd of[-1,1]){c.save();c.translate(bx+sd*br*.8,by-br*.3);c.rotate(sd*(-.5+(sd>0?wav:-wav)));c.strokeStyle='#7a4a2a';c.lineWidth=8;c.lineCap='round';c.beginPath();c.moveTo(0,0);c.lineTo(sd*90,-40);c.moveTo(sd*60,-26);c.lineTo(sd*72,-58);c.moveTo(sd*70,-32);c.lineTo(sd*98,-30);c.stroke();c.restore();}
    drawSnowball(c,bx,by,br);if(a.buttons){c.fillStyle='#2a2a3a';for(let i=0;i<3;i++)circ(c,bx,by-br*.4+i*br*.35,br*.08);}
    if(this.head){drawSnowball(c,hx,hy,hr);
      if(a.scarf){c.fillStyle=this.scol;rr(c,hx-hr*.95,hy+hr*.72,hr*1.9,hr*.32,hr*.15);c.fill();c.save();c.translate(hx+hr*.5,hy+hr*.95);c.rotate(.2+Math.sin(T*3)*.1);rr(c,-hr*.14,0,hr*.3,hr*.8,hr*.1);c.fill();c.restore();c.fillStyle='rgba(255,255,255,.4)';for(let i=0;i<4;i++)c.fillRect(hx-hr*.8+i*hr*.45,hy+hr*.72,hr*.12,hr*.32);}
      if(a.eyes){const bl=al>0&&(al*2)%1.3<.1;c.fillStyle='#2a2a3a';for(const sd of[-1,1]){if(bl)c.fillRect(hx+sd*hr*.32-hr*.1,hy-hr*.15,hr*.2,3);else circ(c,hx+sd*hr*.32,hy-hr*.15,hr*.1);}c.fillStyle='#2a2a3a';for(let i=-2;i<=2;i++)circ(c,hx+i*hr*.14,hy+hr*.38+Math.abs(i)*-hr*.05+(al>0?hr*.05:0),hr*.045);c.fillStyle='rgba(255,140,170,.5)';ell(c,hx-hr*.55,hy+hr*.15,hr*.14,hr*.08);ell(c,hx+hr*.55,hy+hr*.15,hr*.14,hr*.08);}
      if(a.carrot){c.fillStyle='#ff8a3a';c.strokeStyle='#c85a1a';c.lineWidth=2;c.beginPath();c.moveTo(hx-hr*.04,hy-hr*.05);c.lineTo(hx+hr*.62,hy+hr*.08);c.lineTo(hx-hr*.04,hy+hr*.2);c.closePath();c.fill();c.stroke();}
      if(a.hat){c.fillStyle='#ff5f6f';c.strokeStyle='#a83a4a';c.lineWidth=3;rr(c,hx-hr*.95,hy-hr*.85,hr*1.9,hr*.22,hr*.1);c.fill();c.stroke();c.beginPath();c.moveTo(hx-hr*.6,hy-hr*.8);c.lineTo(hx-hr*.5,hy-hr*1.5);c.lineTo(hx+hr*.5,hy-hr*1.5);c.lineTo(hx+hr*.6,hy-hr*.8);c.closePath();c.fill();c.stroke();c.fillStyle='#fff';c.fillRect(hx-hr*.56,hy-hr*1.1,hr*1.12,hr*.14);}}
    c.restore();},
  itemP(i){return{x:60+i*96,y:H-70};},
  drawDeco(c,k,x,y,s){c.save();c.translate(x,y);c.scale(s,s);if(k==='eyes'){c.fillStyle='#2a2a3a';circ(c,-12,0,9);circ(c,12,0,9);}else if(k==='carrot')drawItem(c,'carrot',0,0,.9);else if(k==='hat'){c.fillStyle='#ff5f6f';rr(c,-30,8,60,10,5);c.fill();c.beginPath();c.moveTo(-20,10);c.lineTo(-16,-22);c.lineTo(16,-22);c.lineTo(20,10);c.fill();}else if(k==='scarf'){c.fillStyle=this.scol;rr(c,-30,-8,60,16,8);c.fill();rr(c,8,0,14,30,6);c.fill();}else if(k==='arms'){c.strokeStyle='#7a4a2a';c.lineWidth=6;c.lineCap='round';c.beginPath();c.moveTo(-28,20);c.lineTo(28,-20);c.moveTo(4,-2);c.lineTo(10,-24);c.stroke();}else{c.fillStyle='#2a2a3a';for(let i=0;i<3;i++)circ(c,0,-16+i*16,6);}c.restore();},
  draw(c){skyBg(c,'#bfe0ff','#f0f8ff',H*.45);c.fillStyle='#e0ecf8';for(let i=0;i<5;i++){c.beginPath();c.moveTo(i*160-60,H*.44);c.lineTo(i*160+30,H*.26);c.lineTo(i*160+120,H*.44);c.fill();}
    c.fillStyle=vfill(c,H*.4,H,'#ffffff',0,-.06);c.fillRect(-400,H*.4,W+800,H);tree(c,40,H*.45,.8,'#5a9a7a');tree(c,560,H*.46,.7,'#5a9a7a');c.fillStyle='#fff';for(const x of[40,560]){ell(c,x,H*.45-70,40,14);}
    c.fillStyle='rgba(170,190,220,.35)';for(const t of this.trail)ell(c,t.x,t.y,t.r,t.r*.35);
    if(this.body)this.drawMan(c);
    if(this.ph==='roll'||this.ph==='roll2'||this.ph==='stack'){const b=this.ball;if(b){c.fillStyle='rgba(120,150,200,.25)';ell(c,b.x,b.y+b.r,b.r,b.r*.25);drawSnowball(c,b.x,b.y,b.r);if(this.ph!=='stack'){c.fillStyle='rgba(255,255,255,.9)';rr(c,W/2-120,200,240,26,13);c.fill();c.fillStyle='#5aa8ff';rr(c,W/2-120,200,240*clamp((b.r-24)/(this.target-24),0,1),26,13);c.fill();}}}
    if(this.ph==='stack'){const {bx,by,br}=this.sm();c.strokeStyle='rgba(90,168,255,.6)';c.lineWidth=4;c.setLineDash([10,8]);c.beginPath();c.arc(bx,by-br-this.ball.r*.8,this.ball.r,0,TAU);c.stroke();c.setLineDash([]);}
    if(this.ph==='deco'){tray(c,H-70,120);this.DECO.forEach(([k],i)=>{const p=this.itemP(i);c.globalAlpha=this.att[k]?.25:1;if(this.ddr&&this.ddr.k===k)c.globalAlpha=.25;this.drawDeco(c,k,p.x,p.y,1.1);c.globalAlpha=1;});if(this.ddr)this.drawDeco(c,this.ddr.k,this.ddr.x,this.ddr.y,1.4);
      if(Object.keys(this.att).length>=4){c.fillStyle='rgba(255,255,255,.6)';circ(c,W-70,H*.5,52+Math.sin(T*6)*4);c.fillStyle=gfill(c,W-70,H*.5,46,'#b48cff');circ(c,W-70,H*.5,44);drawItem(c,'wand',W-70,H*.5,1.4);c.fillStyle='#8a5ab8';c.font=`800 18px ${FONT}`;c.textAlign='center';c.fillText('まほう',W-70,H*.5+66);}}
    for(const f of this.flakes){SPECIAL_THING.snowflake(c,f.x,f.y,f.s*.35);}
    drawFuka(c,70,H-130,{outfit:outfit(),t:T,sc:2,dance:this.ph==='alive',cheer:!!this.slide,point:this.ph!=='alive'});drawRikki(c,540,H-130,{sc:1.6,t:T,clap:this.ph==='alive'?1:RK.clap});this.rkPos={x:540,y:H-130,sc:1.6};
    if(this.caught>0){c.fillStyle='#fff';rr(c,W-150,112,130,40,20);c.fill();SPECIAL_THING.snowflake(c,W-125,132,.45);c.fillStyle='#3a88d8';c.font=`800 20px ${FONT}`;c.textAlign='left';c.textBaseline='middle';c.fillText('× '+this.caught,W-100,133);}
    if(this.ph==='alive'){c.font=`38px ${POP}`;c.textAlign='center';c.fillStyle='#5aa8ff';c.fillText('うごいた！',W/2,H*.2+Math.sin(T*5)*6);}
    stepDots(c,4,{roll:0,roll2:1,stack:1,deco:2,alive:3}[this.ph],128);},
  down(x,y){for(let i=this.flakes.length-1;i>=0;i--){const f=this.flakes[i];if(y<H*.42&&hitC(x,y,f.x,f.y,28)){this.flakes.splice(i,1);this.caught++;sfx('chin');burst(x,y,6,'star');if(this.caught%5===0)say(`ゆきの けっしょう ${this.caught}こ！`);return;}}
    const b=this.ball;if((this.ph==='roll'||this.ph==='roll2'||this.ph==='stack')&&b&&Math.hypot(x-b.x,y-b.y)<b.r+50){this.dr=true;this.lx=x;this.ly=y;sfx('tap');return;}
    if(this.ph==='deco'){if(Object.keys(this.att).length>=4&&hitC(x,y,W-70,H*.5,60)){this.ph='alive';this.alive=0.01;sfx('henshin');confetti(60);say('まほうで ゆきだるまが うごいた！ 「ありがとう！ いっしょに おどろう！」');return;}
      this.DECO.forEach(([k],i)=>{const p=this.itemP(i);if(!this.att[k]&&hitC(x,y,p.x,p.y,44)){this.ddr={k,x,y};sfx('tap');}});}},
  move(x,y){if(this.ddr){this.ddr.x=x;this.ddr.y=y;return;}if(!this.dr)return;const b=this.ball,F=this.field();const nx=clamp(x,b.r,W-b.r),ny=clamp(y,F.y0+b.r*.5,F.y1-b.r*.3);const d=Math.hypot(nx-b.x,ny-b.y);b.x=nx;b.y=ny;
    if(this.ph==='stack')return;if(d>1){b.r=Math.min(this.target,b.r+d*.028);if(Math.random()<.4)this.trail.push({x:b.x,y:b.y+b.r*.9,r:b.r*.5});if(this.trail.length>220)this.trail.shift();if(Math.random()<.08)sfx('squish');}
    if(b.r>=this.target){this.dr=false;sfx('fanfare');rkCheer();burst(b.x,b.y,16,'star');
      if(this.ph==='roll'){this.body={x:b.x,y:b.y,r:b.r};this.slide={t:0,x0:b.x,y0:b.y};this.ball={x:120,y:H*.84,r:22};this.target=70;this.ph='roll2';say('おおきな ゆきだま できた！ つぎは あたまの ゆきだまを ころがそう');}
      else{this.ph='stack';say('あたまが できた！ おおきな ゆきだまの うえに のせてね');}}},
  up(x,y){if(this.ddr){const d=this.ddr;this.ddr=null;const {bx,by,br,hx,hy,hr}=this.sm();if(Math.hypot(x-hx,y-hy)<hr*1.6||Math.hypot(x-bx,y-by)<br*1.2){this.att[d.k]=1;sfx('pop');rkCheer();burst(x,y,10,'star');const n=this.DECO.find(q=>q[0]===d.k);sayPair(n[1],n[2]);if(Object.keys(this.att).length===4)setTimeout(()=>{if(scene===this&&this.ph==='deco')say('まほうの ステッキを タッチしてみて！');},1800);}else sfx('whoosh');return;}
    if(this.dr&&this.ph==='stack'){const {bx,by,br}=this.sm(),b=this.ball,ty=by-br-b.r*.8;if(Math.hypot(b.x-bx,b.y-ty)<120){this.head={x:bx,y:ty,r:b.r};this.ball=null;this.ph='deco';sfx('snap');burst(bx,ty,16,'star');rkCheer();say('ゆきだるまの かたちが できた！ かざりを ひっぱって つけてね');}}
    this.dr=false;},
  hint(){const b=this.ball;if(this.ph==='roll'||this.ph==='roll2')return b?{x:b.x,y:b.y,x2:b.x>W/2?b.x-200:b.x+200,y2:b.y}:null;if(this.ph==='stack'){const {bx,by,br}=this.sm();return{x:b.x,y:b.y,x2:bx,y2:by-br-b.r};}
    if(this.ph==='deco'){if(Object.keys(this.att).length>=4)return{x:W-70,y:H*.5};const i=this.DECO.findIndex(([k])=>!this.att[k]);const p=this.itemP(i);const {hx,hy}=this.sm();return{x:p.x,y:p.y,x2:hx,y2:hy};}return null;},
  hintText(){return{roll:'ゆきだまを ころころ ころがしてね',roll2:'ゆきだまを ころころ ころがしてね',stack:'あたまを からだの うえに のせてね',deco:'かざりを ゆきだるまに つけてね'}[this.ph]||'';}};

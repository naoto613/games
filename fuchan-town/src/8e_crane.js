// ================= art: crane / blocks / dance =================
function drawClaw(c,x,y,s,open){c.save();c.translate(x,y);c.scale(s,s);c.strokeStyle='#8a8aa0';c.lineWidth=3;c.fillStyle=gfill(c,-6,-6,20,'#c8c8d8');rr(c,-16,-12,32,20,6);c.fill();
  for(const sd of[-1,1]){c.save();c.translate(sd*10,6);c.rotate(sd*(.25+open*.45));c.strokeStyle='#7a7a90';c.lineWidth=6;c.lineCap='round';c.beginPath();c.moveTo(0,0);c.lineTo(sd*6,24);c.lineTo(0,38);c.stroke();c.restore();}c.restore();}
function drawBlock(c,k,x,y,col,s=1){c.save();c.translate(x,y);c.scale(s,s);c.lineJoin='round';c.strokeStyle=shade(col,-.35);c.lineWidth=3;const g=vfill(c,-70,0,col,.2,-.12);c.fillStyle=g;
  if(k==='cube'){rr(c,-35,-70,70,70,6);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.3)';rr(c,-28,-64,20,56,4);c.fill();}
  else if(k==='rect'){rr(c,-70,-70,140,70,6);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.3)';rr(c,-62,-64,30,56,4);c.fill();}
  else if(k==='tri'){c.beginPath();c.moveTo(-40,0);c.lineTo(0,-70);c.lineTo(40,0);c.closePath();c.fill();c.stroke();}
  else if(k==='roof'){c.beginPath();c.moveTo(-80,0);c.lineTo(0,-72);c.lineTo(80,0);c.closePath();c.fill();c.stroke();}
  else if(k==='cyl'){rr(c,-32,-66,64,66,4);c.fill();c.stroke();c.fillStyle=shade(col,.25);c.beginPath();c.ellipse(0,-66,32,10,0,0,TAU);c.fill();c.stroke();}
  else if(k==='arch'){c.beginPath();c.moveTo(-70,0);c.lineTo(-70,-70);c.lineTo(70,-70);c.lineTo(70,0);c.lineTo(34,0);c.arc(0,0,34,0,Math.PI,true);c.closePath();c.fill();c.stroke();}
  c.restore();}
Object.assign(SPECIAL_THING,{
  claw:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);c.strokeStyle='#8a8aa0';c.lineWidth=2;c.beginPath();c.moveTo(0,-40);c.lineTo(0,-22);c.stroke();drawClaw(c,0,-24,.7,.2);drawAnimal(c,'bear',0,26,.22,{t:0,happy:1});c.restore();},
  goldstar:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);c.fillStyle=gfill(c,-6,-8,34,'#ffd23a');star(c,0,0,30,16);c.fill();c.strokeStyle='#e8a000';c.lineWidth=2.5;c.stroke();c.fillStyle='#5a3a1a';circ(c,-7,-2,2.5);circ(c,7,-2,2.5);c.strokeStyle='#5a3a1a';c.lineWidth=2;c.beginPath();c.arc(0,4,5,.3,Math.PI-.3);c.stroke();c.fillStyle='rgba(255,140,170,.5)';ell(c,-13,4,4,2.5);ell(c,13,4,4,2.5);c.restore();},
  capsuletoy:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#7ad8ff';c.beginPath();c.arc(0,0,26,Math.PI,TAU);c.fill();c.fillStyle='#fff';c.beginPath();c.arc(0,0,26,0,Math.PI);c.fill();c.strokeStyle='rgba(0,0,0,.2)';c.lineWidth=2;c.beginPath();c.arc(0,0,26,0,TAU);c.stroke();c.fillStyle='rgba(255,255,255,.6)';ell(c,-9,-12,7,4);drawItem(c,'starcandy',0,-6,.45);c.restore();},
  blockhouse:(c,x,y,s)=>{c.save();c.translate(x,y+24*s);c.scale(s*.42,s*.42);drawBlock(c,'cube',-35,0,'#5aa8ff');drawBlock(c,'cube',35,0,'#ffd23a');drawBlock(c,'roof',0,-70,'#ff5f6f');c.restore();},
  blocktower:(c,x,y,s)=>{c.save();c.translate(x,y+34*s);c.scale(s*.34,s*.34);drawBlock(c,'cyl',0,0,'#6cd08a');drawBlock(c,'cyl',0,-66,'#b48cff');drawBlock(c,'cube',0,-132,'#ffb03a');drawBlock(c,'tri',0,-202,'#ff5f6f');c.restore();},
  blockcube:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);[['あ','#ff8cc0',-16,14],['い','#8ad0ff',16,14],['う','#ffd23a',0,-16]].forEach(([ch,col,a,b])=>{c.fillStyle=col;rr(c,a-15,b-15,30,30,5);c.fill();c.strokeStyle=shade(col,-.3);c.lineWidth=2;c.stroke();c.fillStyle='#fff';c.font=`800 18px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(ch,a,b+1);});c.restore();},
  discoball:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);c.strokeStyle='#8a8aa0';c.lineWidth=2;c.beginPath();c.moveTo(0,-38);c.lineTo(0,-26);c.stroke();c.fillStyle='#c8c8e0';circ(c,0,0,26);c.save();c.beginPath();c.arc(0,0,26,0,TAU);c.clip();for(let i=-3;i<=3;i++)for(let j=-3;j<=3;j++){c.fillStyle=`hsl(${(i*40+j*70+T*80)%360},70%,${70+((i+j)%2)*15}%)`;c.fillRect(i*8-3.5,j*8-3.5,7,7);}c.restore();c.fillStyle='rgba(255,255,255,.7)';ell(c,-9,-10,6,4);c.restore();},
  maracas:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);for(const [sd,col] of [[-1,'#ff5f6f'],[1,'#ffd23a']]){c.save();c.rotate(sd*.4);c.fillStyle='#c8905a';rr(c,-3,6,6,26,3);c.fill();c.fillStyle=gfill(c,-4,-14,16,col);c.beginPath();c.ellipse(0,-6,13,16,0,0,TAU);c.fill();c.fillStyle='#fff';c.fillRect(-12,-8,24,3);c.restore();}c.restore();},
  ribbonstick:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);c.strokeStyle='#8a6a4a';c.lineWidth=3;c.beginPath();c.moveTo(-20,30);c.lineTo(-4,-10);c.stroke();c.strokeStyle='#ff6fae';c.lineWidth=6;c.lineCap='round';c.beginPath();c.moveTo(-4,-10);for(let i=0;i<30;i++)c.lineTo(-4+i*1.4,-10-Math.sin(i*.4+T*3)*12+i*.6);c.stroke();c.restore();},
});
Object.assign(WORDS,{claw:['クレーンゲーム','claw machine'],goldstar:['きんの ほし','gold star'],capsuletoy:['カプセル','capsule toy'],blockhouse:['つみきの おうち','block house'],blocktower:['つみきの タワー','block tower'],blockcube:['もじつみき','letter blocks'],discoball:['ミラーボール','disco ball'],maracas:['マラカス','maracas'],ribbonstick:['リボン','ribbon']});
// ================= crane game =================
SCN.crane={bg:'#ffe8f4',song:'fuwa',
  enter(){this.coins=5;this.fin=0;this.got=[];this.gold=false;this.cx=300;this.cy=0;this.st='idle';this.t=0;this.mv=0;this.bonus=false;
    const ks=shuffle(['bear','rabbit','cat','panda','pig','chick','duck','crown','balloon','dog']).slice(0,7);const pool=[...ks,'goldstar'];this.pr=shuffle(pool).map((k,i)=>({k,x:170+(i%4)*95+(Math.floor(i/4)%2)*40+rand(-8,8),y:this.floorY()-(i<4?0:60),in:true,r:rand(-.3,.3)}));
    say('クレーンゲーム！ やじるしで うごかして、あかい ボタンで つかもう！ 5かい できるよ');},
  box(){return{x:50,y:H*.16,w:500,h:H*.46};},floorY(){const b=this.box();return b.y+b.h-40;},topY(){return this.box().y+60;},
  drawPrize(c,p,x,y,s){c.save();c.translate(x,y);c.rotate(p.r||0);if(AN[p.k])drawAnimal(c,p.k,0,34*s,.42*s,{t:0,happy:1});else if(p.k==='goldstar'){c.fillStyle='rgba(255,240,150,.5)';circ(c,0,0,44*s);SPECIAL_THING.goldstar(c,0,0,1.3*s);}else drawThing(c,p.k,0,0,1.1*s);c.restore();},
  update(dt){this.t+=dt;const b=this.box();
    if(this.st==='idle'){if(this.mv){this.cx=clamp(this.cx+this.mv*260*dt,b.x+70,b.x+b.w-40);}}
    else if(this.st==='down'){this.cy+=320*dt;const tgt=this.floorY()-60-this.topY();const under=this.pr.filter(p=>p.in&&Math.abs(p.x-this.cx)<50).sort((a,b2)=>a.y-b2.y)[0];const lim=under?under.y-70-this.topY():tgt;if(this.cy>=lim){this.cy=lim;this.st='close';this.t=0;sfx('tick');}}
    else if(this.st==='close'){if(this.t>.45){const cand=this.pr.filter(p=>p.in).map(p=>({p,d:Math.hypot(p.x-this.cx,(p.y-70-this.topY())-this.cy)})).sort((a,b2)=>a.d-b2.d)[0];const d=cand?cand.d:999;const pr=this.bonus?1:d<30?.95:d<55?.72:0;
        if(cand&&Math.random()<pr){this.hold=cand.p;cand.p.in=false;this.slip=!this.bonus&&d>30&&Math.random()<.18;}else this.hold=null;this.st='up';this.t=0;}}
    else if(this.st==='up'){this.cy=Math.max(0,this.cy-260*dt);if(this.hold&&this.slip&&this.cy<60&&!this.slipped){this.slipped=1;this.hold.in=true;this.hold.y=this.floorY()-rand(0,40);this.hold.x=clamp(this.cx+rand(-30,30),b.x+120,b.x+b.w-60);this.hold=null;sfx('boing');say('あ〜っ！ おしい！');}
      if(this.cy<=0){this.st=this.hold?'carry':'reset';this.t=0;if(!this.hold&&!this.slipped){sfx('no');say(pick(['ざんねん！','つかめなかった〜','もう ちょっと！']));}}}
    else if(this.st==='carry'){this.cx=Math.max(b.x+70,this.cx-240*dt);if(this.cx<=b.x+70){this.st='drop';this.t=0;sfx('pop');}}
    else if(this.st==='drop'){if(this.t>.8){const p=this.hold;this.hold=null;this.got.push(p.k);if(p.k==='goldstar'){this.gold=true;sfx('fanfare');confetti(90);say('きんの ほし！ おおあたり〜！');}else{sfx('chin');rkCheer();sayWord(p.k,'ゲット！');burst(120,H*.72,16,'star');}this.st='reset';this.t=0;}}
    else if(this.st==='reset'){if(this.t>1){this.slipped=0;if(this.coins<=0){if(!this.got.length&&!this.bonus){this.bonus=true;this.coins=1;say('サービス！ もう いっかい どうぞ！');}else if(!this.fin){this.fin=.01;sfx('fanfare');say(`けいひん ${this.got.length}こ ゲット！`);}}this.st='idle';}}
    if(this.fin>0){this.fin+=dt;if(this.fin>2.6&&this.fin<9){this.fin=9;celebrate('crane',this.gold);}}},
  draw(c){c.fillStyle='#ffe8f4';c.fillRect(-400,0,W+800,H);c.fillStyle='#ffd0e6';for(let x=0;x<W;x+=60)c.fillRect(x,0,30,H);const b=this.box();
    c.fillStyle=vfill(c,b.y-60,b.y+b.h+200,'#ff6fae',.2,-.15);rr(c,b.x-24,b.y-80,b.w+48,b.h+300,30);c.fill();c.fillStyle='#fff';c.font=`34px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.fillText('クレーンゲーム',W/2,b.y-44);
    for(let i=0;i<14;i++){c.fillStyle=Math.floor(T*4+i)%2?'#fff6a0':'#ffd23a';circ(c,b.x-10+i*(b.w+20)/13,b.y-12,6);}
    c.fillStyle='#e8f6ff';rr(c,b.x,b.y,b.w,b.h,14);c.fill();c.fillStyle='#ffe0ee';c.fillRect(b.x,this.floorY()+8,b.w,b.h-(this.floorY()+8-b.y));c.fillStyle='#c8b0e0';c.fillRect(b.x+20,this.floorY()-60,100,68);c.fillStyle='#4a3050';rr(c,b.x+26,this.floorY()-54,88,50,8);c.fill();c.fillStyle='#fff';c.font=`800 16px ${FONT}`;c.fillText('でぐち',b.x+70,this.floorY()+30);
    for(const p of this.pr)if(p.in)this.drawPrize(c,p,p.x,p.y-40,1.5);
    c.fillStyle='#8a8aa0';c.fillRect(b.x,this.topY()-40,b.w,10);const cy=this.topY()+this.cy;c.strokeStyle='#8a8aa0';c.lineWidth=4;c.beginPath();c.moveTo(this.cx,this.topY()-30);c.lineTo(this.cx,cy);c.stroke();
    const open=this.st==='idle'||this.st==='down'||this.st==='drop'&&this.t>.3?1:this.st==='close'?1-this.t/.45:0;if(this.hold)this.drawPrize(c,this.hold,this.cx,cy+66,1.3);drawClaw(c,this.cx,cy,1.6,open);
    if(this.st==='idle'&&this.coins>0){c.strokeStyle='rgba(255,90,120,.5)';c.lineWidth=3;c.setLineDash([8,8]);c.beginPath();c.moveTo(this.cx,cy+40);c.lineTo(this.cx,this.floorY());c.stroke();c.setLineDash([]);}
    c.fillStyle='rgba(255,255,255,.3)';c.beginPath();c.moveTo(b.x+30,b.y);c.lineTo(b.x+90,b.y);c.lineTo(b.x+30,b.y+b.h);c.lineTo(b.x+10,b.y+b.h);c.fill();c.strokeStyle='#fff';c.lineWidth=6;rr(c,b.x,b.y,b.w,b.h,14);c.stroke();
    const cy2=b.y+b.h+110;const on=this.st==='idle'&&this.coins>0;for(const [dx,ic,m] of [[-200,'prev',-1],[-80,'next',1]])drawBtn(c,W/2+dx,cy2,46,on?'#5aa8ff':'#b8c0d0',ic,this.mv===m);c.fillStyle=on?'#ff3a5a':'#d8a0b0';circ(c,W/2+150,cy2,58);c.fillStyle='rgba(255,255,255,.4)';ell(c,W/2+136,cy2-20,20,10);c.fillStyle='#fff';c.font=`800 22px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('つかむ',W/2+150,cy2);
    for(let i=0;i<5;i++){c.globalAlpha=i<this.coins?1:.25;drawItem(c,'coin',W/2-180+i*44,cy2+84,.8);}c.globalAlpha=1;
    c.fillStyle='rgba(255,255,255,.9)';rr(c,20,H-96,W-40,80,20);c.fill();c.fillStyle='#b88aa8';c.font=`800 16px ${FONT}`;c.textAlign='left';c.fillText('ゲット',34,H-80);this.got.forEach((k,i)=>this.drawPrize(c,{k,r:0},90+i*70,H-52,.7));
    drawFuka(c,W-60,H-100,{outfit:outfit(),t:T,sc:1.6,cheer:this.st==='drop',point:this.st==='idle'});},
  down(x,y){if(this.fin>0)return;const cy2=this.box().y+this.box().h+110;if(this.st!=='idle'||this.coins<=0)return;
    if(hitC(x,y,W/2-200,cy2,56)){this.mv=-1;sfx('tap');return;}if(hitC(x,y,W/2-80,cy2,56)){this.mv=1;sfx('tap');return;}
    if(hitC(x,y,W/2+150,cy2,66)){this.mv=0;this.coins--;this.st='down';this.cy=0;sfx('launch');return;}
    const b=this.box();if(x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h){this.tx=x;this.mv=x<this.cx?-1:1;}},
  move(x,y){if(this.tx!=null&&this.st==='idle'){this.tx=x;this.mv=Math.abs(x-this.cx)<6?0:x<this.cx?-1:1;}},
  up(){this.mv=0;this.tx=null;},
  hint(){if(this.st!=='idle'||this.coins<=0||this.fin>0)return null;const cy2=this.box().y+this.box().h+110;const p=this.pr.find(p=>p.in&&p.k==='goldstar')||this.pr.find(p=>p.in);if(p&&Math.abs(p.x-this.cx)>20)return{x:W/2+(p.x<this.cx?-200:-80),y:cy2};return{x:W/2+150,y:cy2};},
  hintText(){return 'やじるしで うごかして、つかむ ボタン！';}};

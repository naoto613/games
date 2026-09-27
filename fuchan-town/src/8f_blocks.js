// ================= blocks =================
const BS=1.35;
const BMODELS=[
  {name:'おうち',slots:[['cube',-35,0,'#5aa8ff'],['cube',35,0,'#ffd23a'],['roof',0,-70,'#ff5f6f']],extra:['tri','cyl']},
  {name:'タワー',slots:[['cyl',0,0,'#6cd08a'],['cyl',0,-66,'#b48cff'],['cube',0,-132,'#ffb03a'],['tri',0,-202,'#ff5f6f']],extra:['rect','cube']},
  {name:'おしろ',slots:[['arch',0,0,'#ff8cc0'],['cube',-35,-70,'#ffd23a'],['cube',35,-70,'#5aa8ff'],['tri',-35,-140,'#b48cff'],['tri',35,-140,'#b48cff']],extra:['cyl']},
  {name:'でんしゃ',slots:[['rect',-40,0,'#ff5f6f'],['cube',65,0,'#5aa8ff'],['cyl',-80,-70,'#3a3a4a'],['cube',65,-70,'#ffd23a']],extra:['tri','roof']}];
SCN.blocks={bg:'#fff4e0',song:'play',
  enter(){this.mi=0;this.fin=0;this.miss=0;this.order=shuffle([0,1,2,3]).slice(0,3);this.setup();},
  setup(){const M=BMODELS[this.order[this.mi]];this.M=M;this.ph='build';this.t=0;this.placed=[];this.dr=null;this.fall=null;const COLS=['#ff5f6f','#5aa8ff','#ffd23a','#6cd08a','#b48cff','#ff8cc0','#ffb03a'];
    const ks=shuffle([...M.slots.map(s=>({k:s[0],col:s[3]})),...M.extra.map(k=>({k,col:pick(COLS)}))]);this.tray=ks.map((b,i)=>({...b,id:i,used:false}));say(`つみきで 「${M.name}」を つくろう！ おなじ かたちの ところに つみきを おいてね`);},
  base(){return{x:W/2,y:H*.62};},
  trayP(i){const n=this.tray.length;return{x:70+i*(460/Math.max(1,n-1)),y:H-95};},
  sz(k){return{cube:.9,rect:.6,tri:.9,roof:.55,cyl:.9,arch:.6}[k]||.8;},
  update(dt){this.t+=dt;if(this.fall){for(const f of this.fall){f.vy+=1400*dt;f.x+=f.vx*dt;f.y+=f.vy*dt;f.r+=f.vr*dt;const g=this.base().y+20;if(f.y>g){f.y=g;f.vy*=-.35;f.vx*=.7;f.vr*=.6;}}}
    if(this.ph==='boom'&&this.t>2.2){this.mi++;if(this.mi>=3){this.ph='end';this.fin=.01;sfx('fanfare');confetti(90);say('つみき めいじん！ 3つも つくれたね！');}else this.setup();}
    if(this.fin>0){this.fin+=dt;if(this.fin>2.6&&this.fin<9){this.fin=9;celebrate('blocks',this.miss===0);}}},
  draw(c){c.fillStyle='#fff4e0';c.fillRect(-400,0,W+800,H);c.fillStyle='#ffe8c8';for(let x=0;x<W;x+=50)c.fillRect(x,0,25,H*.66);const B=this.base();c.fillStyle=vfill(c,B.y,H,'#e8c090',.05,-.08);c.fillRect(-400,B.y,W+800,H);c.fillStyle='#d8a870';c.fillRect(-400,B.y,W+800,8);
    c.fillStyle='#fff';rr(c,W/2-140,112,280,56,28);c.fill();c.strokeStyle='#ffb03a';c.lineWidth=4;c.stroke();c.fillStyle='#c87a1a';c.font=`800 26px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('おてほん：'+this.M.name,W/2,140);
    c.save();c.translate(W-90,260);c.scale(.36,.36);for(const s of this.M.slots)drawBlock(c,s[0],s[1],s[2],s[3]);c.restore();c.strokeStyle='#ffd08a';c.lineWidth=3;rr(c,W-160,176,140,110,14);c.stroke();
    if(this.fall){for(const f of this.fall){c.save();c.translate(f.x,f.y);c.rotate(f.r);drawBlock(c,f.k,0,0,f.col,BS);c.restore();}}
    else{for(let i=0;i<this.M.slots.length;i++){const s=this.M.slots[i],P=this.placed.find(p=>p.si===i);if(P)drawBlock(c,P.k,B.x+s[1]*BS,B.y+s[2]*BS,P.col,BS);else{c.save();c.globalAlpha=.25+Math.sin(T*4+i)*.08;drawBlock(c,s[0],B.x+s[1]*BS,B.y+s[2]*BS,'#ffffff',BS);c.restore();}}}
    if(this.ph==='done'){const k=Math.min(1,this.t);if(this.M.name==='おうち'){c.fillStyle=`rgba(255,240,150,${k})`;rr(c,B.x-80,B.y-68,40,34,4);c.fill();rr(c,B.x+40,B.y-68,40,34,4);c.fill();drawAnimal(c,'rabbit',B.x+170,B.y,.6,{t:T,happy:1,dance:1});}
      else if(this.M.name==='タワー'){c.fillStyle='#ffd23a';star(c,B.x,B.y-380-Math.sin(T*3)*8,26,11);c.fill();}else if(this.M.name==='おしろ'){for(const dx of[-47,47]){c.fillStyle='#8a6a4a';c.fillRect(B.x+dx-2,B.y-330,4,40);c.fillStyle='#ff5f6f';c.beginPath();c.moveTo(B.x+dx+2,B.y-330);c.lineTo(B.x+dx+28+Math.sin(T*6)*3,B.y-320);c.lineTo(B.x+dx+2,B.y-310);c.fill();}}
      else{c.fillStyle='#4a4a6a';for(const dx of[-120,-30,50,120]){circ(c,B.x+dx,B.y+6,16);}if(Math.random()<.2)puff(B.x-108,B.y-200,1,'#eee');}
      drawBtn(c,W/2,H*.8,52,'#ff5f6f','retry',true);c.fillStyle='#a83a4a';c.font=`800 22px ${FONT}`;c.textAlign='center';c.fillText('ガラガラ こわす',W/2,H*.8+74);}
    if(this.ph==='build'){tray(c,H-95,140);this.tray.forEach((b,i)=>{if(b.used||this.dr&&this.dr.b===b)return;const p=this.trayP(i);c.save();c.translate(p.x,p.y+40);c.scale(this.sz(b.k)*.75,this.sz(b.k)*.75);drawBlock(c,b.k,0,0,b.col);c.restore();});}
    if(this.dr){const d=this.dr;c.save();c.translate(d.x,d.y+35*BS);drawBlock(c,d.b.k,0,0,d.b.col,BS);c.restore();}
    drawFuka(c,70,H*.62+20,{outfit:outfit(),t:T,sc:1.9,cheer:this.ph==='done',point:this.ph==='build'});drawRikki(c,530,H*.62+22,{sc:1.5,t:T,clap:RK.clap});this.rkPos={x:530,y:H*.62+22,sc:1.5};},
  down(x,y){if(this.ph==='done'){if(hitC(x,y,W/2,H*.8,66)){const B=this.base();this.fall=this.placed.map(p=>{const s=this.M.slots[p.si];return{k:p.k,col:p.col,x:B.x+s[1]*BS,y:B.y+s[2]*BS,vx:rand(-260,260),vy:rand(-400,-100),r:0,vr:rand(-6,6)};});this.ph='boom';this.t=0;sfx('boom');for(let i=0;i<5;i++)setTimeout(()=>sfx('tick'),200+i*120);rkCheer();say('ガラガラ〜！ たのしい〜！');}return;}
    if(this.ph!=='build')return;this.tray.forEach((b,i)=>{const p=this.trayP(i);if(!b.used&&Math.abs(x-p.x)<58&&Math.abs(y-p.y)<60){this.dr={b,x,y};sfx('tap');}});},
  move(x,y){if(this.dr){this.dr.x=x;this.dr.y=y;}},
  up(x,y){const d=this.dr;if(!d)return;this.dr=null;const B=this.base();let best=-1,bd=90;this.M.slots.forEach((s,i)=>{if(this.placed.some(p=>p.si===i))return;const cx=B.x+s[1]*BS,cy=B.y+(s[2]-35)*BS;const dd=Math.hypot(x-cx,y+35-35-cy);if(dd<bd){bd=dd;best=i;}});
    if(best<0){sfx('whoosh');return;}const s=this.M.slots[best];if(s[0]!==d.b.k){this.miss++;sfx('no');say('かたちが ちがうみたい。 おなじ かたちを さがしてね');return;}
    d.b.used=true;this.placed.push({si:best,k:d.b.k,col:d.b.col});sfx('snap');burst(B.x+s[1]*BS,B.y+(s[2]-35)*BS,12,'star');rkCheer();
    if(this.placed.length===this.M.slots.length){this.ph='done';this.t=0;sfx('fanfare');confetti(40);say(`${this.M.name}が できた！ すごーい！ こわしても いいよ`);}},
  hint(){if(this.ph==='done')return{x:W/2,y:H*.8};if(this.ph!=='build')return null;const B=this.base();const i=this.M.slots.findIndex((s,i)=>!this.placed.some(p=>p.si===i));if(i<0)return null;const s=this.M.slots[i];const ti=this.tray.findIndex(b=>!b.used&&b.k===s[0]);if(ti<0)return null;const p=this.trayP(ti);return{x:p.x,y:p.y,x2:B.x+s[1]*BS,y2:B.y+(s[2]-35)*BS};},
  hintText(){return this.ph==='done'?'こわす ボタンで ガラガラ！':'おなじ かたちの ばしょに つみきを おいてね';}};

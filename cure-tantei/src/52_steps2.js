// ================= steps: diff（まちがいさがし）/ memory（カードあわせ） =================
// d:{bg, pic:[[icon,x,y,s],...](パネル 320x200 の なか), diffs:[[index,'gone'|icon],...], sky, ground}
const DPW=320,DPH=200,DPX=40;
STEP.diff={
  enter(){const d=this.d;this.bg=d.bg||'office';bgm('search');this.found=[];this.t=0;this.miss=null;
    instr(d.ins||`うえと したの えを くらべて、ちがう ところを ${d.diffs.length}つ さがそう！`,'fu');},
  panelY(k){return k?420:186;},
  update(dt){this.t+=dt;if(this.miss){this.miss.t+=dt;if(this.miss.t>.8)this.miss=null;}},
  drawPanel(c,k){const d=this.d,y0=this.panelY(k);c.save();c.fillStyle='rgba(90,30,70,.25)';rr(c,DPX-2,y0+4,DPW+4,DPH,16);c.fill();
    rr(c,DPX,y0,DPW,DPH,16);c.save();c.clip();c.fillStyle=vgrad(c,y0,y0+DPH*.62,[d.sky||'#9ad8ff','#e8f6ff']);c.fillRect(DPX,y0,DPW,DPH);c.fillStyle=d.ground||'#b8e090';c.fillRect(DPX,y0+DPH*.62,DPW,DPH);
    d.pic.forEach(([ic,x,y,s],i)=>{let k2=ic;if(k){const df=d.diffs.find(q=>q[0]===i);if(df)k2=df[1]==='gone'?null:df[1];}if(k2)drawIcon(c,k2,DPX+x,y0+y,s);});c.restore();
    c.strokeStyle='#fff';c.lineWidth=5;rr(c,DPX,y0,DPW,DPH,16);c.stroke();c.fillStyle=k?'#ff5fa2':'#5aa8ff';rr(c,DPX+8,y0+8,56,24,12);c.fill();txt(c,k?'いま':'まえ',DPX+36,y0+20,14,'#fff','center',900);c.restore();},
  draw(c){const d=this.d;drawBG(c,this.bg);dimContent(c,.35);this.drawPanel(c,0);this.drawPanel(c,1);
    for(const i of this.found){const[,x,y]=d.pic[i];for(const k of[0,1]){c.strokeStyle='#ff3d6d';c.lineWidth=5;c.beginPath();c.arc(DPX+x,this.panelY(k)+y,30,0,TAU);c.stroke();}}
    if(this.miss){c.strokeStyle=`rgba(90,120,200,${1-this.miss.t})`;c.lineWidth=5;c.beginPath();c.moveTo(this.miss.x-12,this.miss.y-12);c.lineTo(this.miss.x+12,this.miss.y+12);c.moveTo(this.miss.x+12,this.miss.y-12);c.lineTo(this.miss.x-12,this.miss.y+12);c.stroke();}
    c.fillStyle='rgba(255,255,255,.92)';rr(c,130,640,140,52,26);c.fill();otext(c,`${this.found.length} / ${d.diffs.length}`,200,667,28,'#ff5fa2','#fff');},
  down(x,y){const d=this.d;if(this.fin!=null)return;let k=-1;for(const kk of[0,1])if(inR(x,y,DPX+DPW/2,this.panelY(kk)+DPH/2,DPW,DPH))k=kk;if(k<0)return;
    const lx=x-DPX,ly=y-this.panelY(k);
    const hit=d.diffs.find(([i])=>!this.found.includes(i)&&Math.hypot(d.pic[i][1]-lx,d.pic[i][2]-ly)<36);
    if(hit){const i=hit[0];this.found.push(i);sfx('find');burst(x,y,14);const n=this.found.length;
      const w=hit[1]==='gone'?null:wordOf(hit[1]),w0=wordOf(d.pic[i][0]);
      say(hit[1]==='gone'?`みつけた！ ${w0?w0[0]+'が ':''}なくなってる！`:`みつけた！ ${w0?w0[0]:''}が ${w?w[0]:''}に なってる！`,'fu');
      if(n===d.diffs.length){confetti(40);setTimeout(()=>{if(scene===this){sfx('ok');say(d.done||'ぜんぶ みつけた！ たんていの め、すごい！','fu');}},1500);finish(this,3.4);}}
    else{this.miss={x,y,t:0};sfx('no');}},
  hint(){const d=this.d;const q=d.diffs.find(([i])=>!this.found.includes(i));if(!q||IDLE<12)return null;const[,x,y]=d.pic[q[0]];return{x:DPX+x,y:this.panelY(1)+y};},
};
// d:{bg, pairs:[icon,...], ins}
STEP.memory={
  enter(){const d=this.d;this.bg=d.bg||'office';bgm('search');this.cards=shuffle(d.pairs.flatMap(k=>[k,k])).map(k=>({k,open:false,done:false,f:0,sh:0}));this.sel=[];this.lock=0;this.t=0;
    instr(d.ins||'カードを 2まい めくって、おなじ えを そろえよう！','fu');},
  pos(i){const n=this.cards.length,cols=4,rows=Math.ceil(n/cols),col=i%cols,row=Math.floor(i/cols);return[200+(col-1.5)*88,(rows>2?390:360)+(row-(rows-1)/2)*112];},
  update(dt){this.t+=dt;for(const cd of this.cards){const tg=cd.open||cd.done?1:0;cd.f+=(tg-cd.f)*Math.min(1,dt*10);cd.sh=Math.max(0,cd.sh-dt);}
    if(this.lock>0){this.lock-=dt;if(this.lock<=0){for(const cd of this.sel)cd.open=false;this.sel=[];}}},
  draw(c){drawBG(c,this.bg);dimContent(c,.3);
    this.cards.forEach((cd,i)=>{const[x,y]=this.pos(i);const sx=Math.abs(Math.cos(cd.f*Math.PI))||.02,face=cd.f>.5;c.save();c.translate(x+(cd.sh>0?Math.sin(cd.sh*40)*5:0),y);c.scale(sx,1);
      if(cd.done)drawGlow(c,'#fff6a0',0,0,60,.6);c.fillStyle='rgba(90,30,70,.25)';rr(c,-37,-45,74,96,14);c.fill();
      if(face){c.fillStyle=cd.done?'#fffbe0':'#fff';rr(c,-37,-48,74,96,14);c.fill();c.strokeStyle=cd.done?'#ffc83a':'#ff9ccf';c.lineWidth=4;c.stroke();drawIcon(c,cd.k,0,-8,1.2);const w=wordOf(cd.k);if(w)txt(c,w[1],0,34,12,'#3a8aff','center',900);}
      else{c.fillStyle=vfill(c,-48,48,'#ff8cc6');rr(c,-37,-48,74,96,14);c.fill();c.strokeStyle='#fff';c.lineWidth=4;c.stroke();c.fillStyle='rgba(255,255,255,.85)';heartP(c,0,-4,14);c.fill();txt(c,'?',0,-2,18,'#ff5fa2','center',900);}
      c.restore();});},
  down(x,y){if(this.lock>0||this.fin!=null)return;this.cards.forEach((cd,i)=>{const[cx,cy]=this.pos(i);if(!inR(x,y,cx,cy,78,98)||cd.open||cd.done)return;if(this.sel.length>=2)return;
      cd.open=true;this.sel.push(cd);sfx('pop');const w=wordOf(cd.k);
      if(this.sel.length===2){const[a,b]=this.sel;if(a.k===b.k){a.done=b.done=true;this.sel=[];sfx('ok');burst(cx,cy,16);learn(wordKey(a.k));say(w?`そろった！ ${w[0]}！`:'そろった！','fu',w&&w[1]);
          if(this.cards.every(q=>q.done)){confetti(50);setTimeout(()=>{if(scene===this)say(this.d.done||'ぜんぶ そろった！','fu');},1600);finish(this,3.2);}}
        else{this.lock=1.1;a.sh=b.sh=.4;if(w)say([[w[1],'en']],'fu');}}
      else if(w)say([[w[1],'en']],'fu');});},
  hint(){if(IDLE<10)return null;const i=this.cards.findIndex(cd=>!cd.done&&!cd.open);if(i<0)return null;const[x,y]=this.pos(i);return{x,y};},
};

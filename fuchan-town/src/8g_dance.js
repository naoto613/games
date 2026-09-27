// ================= dance =================
SCN.dance={bg:'#1a1030',song:null,
  POSES:[['cheer','ばんざい','#ff5f6f'],['point','ポーズ','#ffd23a'],['wave','バイバイ','#5aa8ff'],['spin','くるっ','#6cd08a']],
  enter(){this.ph='ready';this.t=-3;this.fin=0;const N=24+(Math.random()*9|0),gap=pick([.7,.78,.86]),intro=pick([[0,2],[1,3],[0,1,2,3],[3,2,1,0],[0,0,3,3]]),pat=[];for(let i=0;i<N;i++){const k=i<8?intro[i%intro.length]:Math.random()*4|0;pat.push({i:k,t:1.2+i*gap,hit:0});}this.notes=pat;this.combo=0;this.max=0;this.hits=0;this.cur=null;this.curT=0;this.judge=null;
    say('ダンス！ うえから おちてくる マークが ボタンに かさなったら タッチ！ ふーちゃんが おどるよ');setTimeout(()=>{if(scene===this){this.ph='play';this.t=0;}},3000);},
  bx(i){return 90+i*140;},by(){return H-110;},
  update(dt){if(this.judge)this.judge.t+=dt;if(this.curT>0)this.curT-=dt;
    if(this.ph==='play'){const pt=this.t;this.t+=dt;const beat=.39;if(Math.floor(this.t/beat)!==Math.floor(pt/beat)&&this.t>0){const b=Math.floor(this.t/beat);if(b%2===0)tone(110,.14,'sine',.35,0,-60);else noise(.05,.12,7000,0,MG,'highpass');if(b%8===4)noise(.12,.2,1800,0,MG);}
      for(const n of this.notes)if(!n.hit&&this.t-n.t>.3){n.hit=-1;this.combo=0;this.judge={txt:'ミス',col:'#9a8aaa',t:0};}
      if(this.t>this.notes[this.notes.length-1].t+1.2){this.ph='end';this.t=0;const r=this.hits/this.notes.length;sfx('fanfare');confetti(r>.7?100:50);say(r>.9?'パーフェクト ダンサー！ すごすぎる！':r>.6?'ノリノリ ダンス！ じょうず！':'たのしい ダンス だったね！');this.fin=.01;}}
    if(this.fin>0){this.fin+=dt;if(this.fin>3.4&&this.fin<9){this.fin=9;celebrate('dance',this.hits/this.notes.length>.85);}}},
  draw(c){const fever=this.combo>=10;c.fillStyle=fever?`hsl(${(T*60)%360},45%,22%)`:'#1a1030';c.fillRect(-400,0,W+800,H);
    for(let i=0;i<4;i++){const x=80+i*150+Math.sin(T*(1+i*.3)+i)*80;const g=c.createLinearGradient(x,0,W/2,H*.7);const col=['255,120,180','255,220,120','120,200,255','160,255,180'][i];g.addColorStop(0,`rgba(${col},.4)`);g.addColorStop(1,`rgba(${col},0)`);c.fillStyle=g;c.beginPath();c.moveTo(x-18,0);c.lineTo(x+18,0);c.lineTo(W/2+140,H*.66);c.lineTo(W/2-140,H*.66);c.closePath();c.fill();}
    SPECIAL_THING.discoball(c,W/2,120,2);
    c.fillStyle='#3a2a5a';c.beginPath();c.ellipse(W/2,H*.62,260,50,0,0,TAU);c.fill();c.fillStyle='#ff8cc0';c.beginPath();c.ellipse(W/2,H*.6,250,44,0,0,TAU);c.fill();for(let i=0;i<14;i++){const a=i/14*TAU;c.fillStyle=Math.floor(T*6+i)%2?'#fff6a0':'#ffd23a';circ(c,W/2+Math.cos(a)*240,H*.6+Math.sin(a)*40,5);}
    const pz=this.cur&&this.curT>0?this.cur:null;const sp=pz==='spin';drawFuka(c,W/2,H*.6,{outfit:outfit(),t:T,sc:3.2,dir:sp?[0,2,3,1][Math.floor(this.curT*14)%4]:0,cheer:pz==='cheer',point:pz==='point',wave:pz==='wave',dance:!pz&&this.ph==='play'});
    const bop=this.ph==='play'?Math.abs(Math.sin(this.t/.39*Math.PI))*.4:0;drawRikki(c,W/2-170,H*.62,{sc:1.8,t:T,dance:1,hop:bop});drawAnimal(c,'rabbit',W/2+170,H*.62,.6,{t:T,dance:1,hop:bop});
    for(let i=0;i<6;i++)drawAnimal(c,['bear','cat','panda','pig','chick','dog'][i],40+i*104,H*.78,.42,{t:T+i,happy:1,hop:fever?Math.abs(Math.sin(T*8+i))*.7:bop*.5});
    const by=this.by();for(let i=0;i<4;i++){const x=this.bx(i);c.strokeStyle='rgba(255,255,255,.25)';c.lineWidth=2;c.beginPath();c.moveTo(x,170);c.lineTo(x,by-50);c.stroke();}
    if(this.ph==='play'){for(const n of this.notes){if(n.hit)continue;const dt2=n.t-this.t;if(dt2>2)continue;const y=by-dt2*(by-170)/2;const P=this.POSES[n.i];c.fillStyle='rgba(255,255,255,.85)';circ(c,this.bx(n.i),y,30);c.fillStyle=P[2];circ(c,this.bx(n.i),y,25);this.icon(c,n.i,this.bx(n.i),y,.8);}}
    this.POSES.forEach((P,i)=>{const x=this.bx(i);c.fillStyle='rgba(255,255,255,.9)';circ(c,x,by,52);c.fillStyle=P[2];circ(c,x,by,46);this.icon(c,i,x,by-6,1.2);c.fillStyle='#fff';c.font=`800 15px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(P[1],x,by+30);});
    c.fillStyle='rgba(255,255,255,.9)';rr(c,20,112,180,46,23);c.fill();c.fillStyle='#ff5fa2';c.font=`800 20px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(this.combo>=2?`${this.combo} コンボ！`:`ヒット ${this.hits}`,110,135);
    if(fever){c.font=`40px ${POP}`;c.fillStyle='#ffd23a';c.fillText('フィーバー！',W/2,H*.2+Math.sin(T*8)*6);}
    if(this.judge&&this.judge.t<.6){c.globalAlpha=1-this.judge.t/.6;c.font=`38px ${POP}`;c.fillStyle=this.judge.col;c.fillText(this.judge.txt,W/2,H*.3-this.judge.t*40);c.globalAlpha=1;}
    if(this.ph==='end'){const r=this.hits/this.notes.length,st=r>.9?3:r>.6?2:1;c.fillStyle='rgba(255,255,255,.95)';rr(c,W/2-170,H*.24,340,110,30);c.fill();for(let k=0;k<3;k++){c.fillStyle=k<st?'#ffd23a':'#ddd';star(c,W/2-70+k*70,H*.24+44,28,12);c.fill();}c.fillStyle='#8a5a8a';c.font=`800 18px ${FONT}`;c.textAlign='center';c.fillText(`${this.hits}/${this.notes.length}  さいだい ${this.max} コンボ`,W/2,H*.24+90);}},
  icon(c,i,x,y,s){c.save();c.translate(x,y);c.scale(s,s);c.strokeStyle='#fff';c.fillStyle='#fff';c.lineWidth=5;c.lineCap='round';circ(c,0,-12,6);c.beginPath();c.moveTo(0,-6);c.lineTo(0,10);
    if(i===0){c.moveTo(0,-2);c.lineTo(-10,-16);c.moveTo(0,-2);c.lineTo(10,-16);}else if(i===1){c.moveTo(0,-2);c.lineTo(14,-8);c.moveTo(0,-2);c.lineTo(-8,6);}else if(i===2){c.moveTo(0,-2);c.lineTo(-12,-12);c.moveTo(0,-2);c.lineTo(8,6);}else{c.moveTo(-12,0);c.lineTo(12,0);}c.moveTo(0,10);c.lineTo(-7,20);c.moveTo(0,10);c.lineTo(7,20);c.stroke();if(i===3){c.lineWidth=2.5;c.beginPath();c.arc(0,0,18,-.5,2.6);c.stroke();}c.restore();},
  down(x,y){if(this.ph!=='play')return;const by=this.by();for(let i=0;i<4;i++)if(hitC(x,y,this.bx(i),by,62)){this.cur=this.POSES[i][0];this.curT=.45;tone(mtof(72+[0,4,7,12][i]),.25,'triangle',.2);let best=null,bd=.3;for(const n of this.notes)if(!n.hit&&n.i===i&&Math.abs(n.t-this.t)<bd){bd=Math.abs(n.t-this.t);best=n;}
      if(best){best.hit=1;this.hits++;this.combo++;this.max=Math.max(this.max,this.combo);const per=bd<.12;this.judge={txt:per?'パーフェクト！':'グッド！',col:per?'#ff5fa2':'#5aa8ff',t:0};burst(this.bx(i),by-40,per?14:8,'star');if(this.combo===10){sfx('spark');say('フィーバー！');}}return;}},
  hint(){if(this.ph!=='play')return null;const n=this.notes.find(n=>!n.hit);if(!n||n.t-this.t>.5)return null;return{x:this.bx(n.i),y:this.by()};},
  hintText(){return 'マークが ボタンに かさなったら タッチ！';}};

// ================= とけいの いちにち (clock) =================
const TOKEI=[[7,'あさ おきて はみがき','brush teeth','toothbrush',['#ffe6b0','#fff6e0']],[12,'おひるごはん','lunch','bento',['#8fd8ff','#e6f8ff']],[3,'おやつ','snack','cake',['#ffd8a0','#fff0d8']],[6,'ばんごはん','dinner','pizza',['#ff9a6a','#ffd0a0']],[8,'おやすみなさい','good night','sunmoon',['#2a2a6a','#6a5aa8']]];
SCN.tokei={bg:'#fff6e0',song:'fuwa',
  enter(){this.fin=0;this.miss=0;this.i=0;this.newQ();},
  C(){return{x:300,y:H*.58,r:185};},
  newQ(){const q=this.q=TOKEI[this.i];let h0;do h0=1+Math.floor(Math.random()*12);while(h0===q[0]);this.ha=h0/12*TAU;this.ok=0;this.drag=false;
    setTimeout(()=>{if(scene===this){hush();speak(`${q[0]}じに ${q[1]}！`);speak(`みじかい はりを ${NUMJ[q[0]]}に あわせてね`);bub={text:`みじかい はりを 「${q[0]}」に あわせてね`,t:0,life:4};}},400);},
  update(dt){if(this.ok>0){this.ok+=dt;if(this.ok>3.2){this.i++;if(this.i>=TOKEI.length){if(!this.fin)this.fin=.01;this.ok=-1;}else this.newQ();}}
    if(this.fin>0){this.fin+=dt;if(this.fin>.8&&this.fin<9){this.fin=9;celebrate('tokei',this.miss<=2);}}},
  draw(c){const q=this.q,night=q[0]===8&&this.ok>0;const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,q[4][0]);g.addColorStop(1,q[4][1]);c.fillStyle=g;c.fillRect(-400,0,W+800,H);
    if(q[0]===8){c.fillStyle='#fff6c0';for(let i=0;i<24;i++){star(c,(i*97)%W,(i*61)%(H*.3)+100,3+(i%3),1.3);c.fill();}}else sun(c,q[0]===6?80:q[0]===7?90:500,q[0]===12?130:200,34,T*.3);
    c.fillStyle='rgba(255,255,255,.95)';rr(c,40,120,W-80,150,30);c.fill();c.strokeStyle='#ffc93c';c.lineWidth=5;c.stroke();const bj=this.ok>0?Math.abs(Math.sin(this.ok*8))*10:0;drawThing(c,q[3],110,195-bj,1.4);
    c.fillStyle='#5a3a3a';c.font=`800 28px ${FONT}`;c.textAlign='left';c.textBaseline='middle';c.fillText(q[1],180,170,W-240);c.fillStyle='#ff5f9a';c.font=`44px ${POP}`;c.fillText(`${q[0]}じ`,180,226);c.fillStyle='#3a8ad8';c.font=`800 28px ${FONT}`;c.fillText(`${q[0]}:00`,300,228);
    const C=this.C();c.fillStyle='rgba(90,40,90,.15)';circ(c,C.x+6,C.y+10,C.r+14);c.fillStyle='#ff9ec8';circ(c,C.x,C.y,C.r+14);c.fillStyle='#fffdf8';circ(c,C.x,C.y,C.r);
    for(let i=0;i<60;i++){const a=i/60*TAU;c.fillStyle='#d0c0c8';circ(c,C.x+Math.sin(a)*(C.r-14),C.y-Math.cos(a)*(C.r-14),i%5?2:4);}
    for(let n=1;n<=12;n++){const a=n/12*TAU,x=C.x+Math.sin(a)*(C.r-48),y=C.y-Math.cos(a)*(C.r-48);const tg=n===q[0]%12||(n===12&&q[0]===12);if(tg&&this.ok<=0){c.fillStyle=`rgba(255,210,60,${.4+Math.sin(T*5)*.2})`;circ(c,x,y,28);}c.fillStyle=PAST[n%8];c.font=`40px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.fillText(n,x,y+2);}
    const mA=this.drag?(this.ha*12)%TAU:0;c.strokeStyle='#5aa8ff';c.lineWidth=9;c.lineCap='round';c.beginPath();c.moveTo(C.x,C.y);c.lineTo(C.x+Math.sin(mA)*(C.r-30),C.y-Math.cos(mA)*(C.r-30));c.stroke();
    const hx=C.x+Math.sin(this.ha)*(C.r*.55),hy=C.y-Math.cos(this.ha)*(C.r*.55);c.strokeStyle='#ff4d8d';c.lineWidth=16;c.beginPath();c.moveTo(C.x,C.y);c.lineTo(hx,hy);c.stroke();c.fillStyle='#ff4d8d';circ(c,hx,hy,20+(this.drag?4:Math.sin(T*5)*2));c.fillStyle='#fff';heartP(c,hx,hy,8);c.fill();c.fillStyle='#ffd23a';circ(c,C.x,C.y,14);
    c.fillStyle='#fff';c.font=`800 15px ${FONT}`;c.textAlign='center';c.fillText('みじかい はり',hx,hy+34);
    drawFuka(c,90,H*.96,{outfit:outfit(),t:T,sc:1.5,cheer:this.ok>0});drawRikki(c,520,H*.96,{sc:1.2,t:T,clap:this.ok>0?1:0});stepDots(c,5,this.i,H*.24+60);},
  down(x,y){if(this.ok)return;const C=this.C();const d=Math.hypot(x-C.x,y-C.y);if(d<C.r+30){this.drag=true;this.setA(x,y);sfx('tick');}
    else for(let n=1;n<=12;n++){}},
  setA(x,y){const C=this.C();let a=Math.atan2(x-C.x,-(y-C.y));if(a<0)a+=TAU;const prev=Math.round(this.ha/(TAU/12));this.ha=a;const nw=Math.round(a/(TAU/12));if(nw!==prev)sfx('tick');},
  move(x,y){if(this.drag)this.setA(x,y);},
  up(){if(!this.drag)return;this.drag=false;let h=Math.round(this.ha/(TAU/12));if(h===0)h=12;this.ha=h/12*TAU;const q=this.q;hush();
    if(h%12===q[0]%12){this.ok=.01;sfx('bell');confetti(40);speak(`${NUMJ[h]}じ！`);sayPair(q[1],`${NUMEN[q[0]]} o'clock. ${q[2]}`);}
    else{this.miss++;sfx('no');speak(`いまは ${NUMJ[h]}じ。 ${NUMJ[q[0]]}じは どこかな？`);}},
  hint(){if(this.ok)return null;const C=this.C(),q=this.q,a=q[0]/12*TAU;return{x:C.x+Math.sin(this.ha)*C.r*.55,y:C.y-Math.cos(this.ha)*C.r*.55,x2:C.x+Math.sin(a)*(C.r-48),y2:C.y-Math.cos(a)*(C.r-48)};},
  hintText(){return `ピンクの みじかい はりを 「${this.q[0]}」まで まわしてね`;}};

// ================= おなじ カード (memory, English) =================
const MEMK=['apple','banana','strawberry','grapes','cat','dog','rabbit','bear','duck','pig','panda','fish','carrot','tomato','cake','icecream','flower','balloon','crown','rocket'];
SCN.memory={bg:'#f0f0ff',song:'play',
  enter(){this.fin=0;this.miss=0;this.round=0;this.deal();},
  deal(){const n=this.round?8:6,cols=this.round?4:3;this.cols=cols;const ks=shuffle(MEMK.filter(k=>WORDS[k])).slice(0,n);this.cards=shuffle(ks.concat(ks)).map((k,i)=>({k,i,open:1,f:1,got:false,sh:0}));this.sel=[];this.lock=true;this.peek=2.4;this.pairs=0;
    setTimeout(()=>{if(scene===this)say(this.round?'こんどは 8くみ！ よーく おぼえてね':'おなじ カードを さがそう！ まずは よーく おぼえてね');},200);},
  cell(i){const cols=this.cols,rows=Math.ceil(this.cards.length/cols);const cw=Math.min(150,(W-40)/cols),ch=Math.min(cw*1.15,(H*.7)/rows);const x0=W/2-(cols-1)*cw/2,y0=H*.24+ch/2;return{x:x0+(i%cols)*cw,y:y0+Math.floor(i/cols)*ch,w:cw-14,h:ch-14};},
  update(dt){for(const cd of this.cards){const tg=cd.open||cd.got?1:0;cd.f+=(tg-cd.f)*Math.min(1,dt*10);if(cd.sh>0)cd.sh-=dt;}
    if(this.peek>0){this.peek-=dt;if(this.peek<=0){for(const cd of this.cards)cd.open=0;this.lock=false;sfx('whoosh');say('めくって おなじ カードを みつけてね');}}
    if(this.wait>0){this.wait-=dt;if(this.wait<=0){for(const cd of this.sel)if(!cd.got)cd.open=0;this.sel=[];this.lock=false;}}
    if(this.rd>0){this.rd+=dt;if(this.rd>2.5){this.rd=0;this.round++;if(this.round>=2){if(!this.fin)this.fin=.01;}else this.deal();}}
    if(this.fin>0){this.fin+=dt;if(this.fin>.8&&this.fin<9){this.fin=9;celebrate('memory',this.miss<=8);}}},
  draw(c){c.fillStyle='#f0f0ff';c.fillRect(-400,0,W+800,H);c.fillStyle='#e4e4fa';for(let y=0;y<H;y+=48)for(let x=(y/48%2)*24;x<W;x+=48){star(c,x,y,5,2.2);c.fill();}
    c.fillStyle='#fff';rr(c,W/2-150,122,300,50,25);c.fill();c.fillStyle='#8a5ae8';c.font=`800 22px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(`みつけた ${this.pairs} / ${this.cards.length/2}`,W/2,148);
    this.cards.forEach((cd,i)=>{const p=this.cell(i),sx=Math.abs(Math.cos(cd.f*Math.PI)),front=cd.f>.5;c.save();c.translate(p.x+(cd.sh>0?Math.sin(cd.sh*40)*5:0),p.y-(cd.got?Math.abs(Math.sin(T*3+i))*3:0));c.scale(Math.max(.04,sx),1);
      c.fillStyle='rgba(60,40,110,.15)';rr(c,-p.w/2+3,-p.h/2+5,p.w,p.h,16);c.fill();
      if(front){c.fillStyle=cd.got?'#fff8d8':'#fff';rr(c,-p.w/2,-p.h/2,p.w,p.h,16);c.fill();c.strokeStyle=cd.got?'#ffc93c':'#c8b8ff';c.lineWidth=4;c.stroke();drawThing(c,cd.k,0,-8,Math.min(1.3,p.w/100));c.fillStyle='#3a6ab8';c.font=`800 ${Math.round(Math.min(18,p.w/7))}px ${FONT}`;c.fillText(WORDS[cd.k][1],0,p.h/2-18,p.w-8);}
      else{c.fillStyle=gfill(c,-20,-30,p.h,'#9a7aff');rr(c,-p.w/2,-p.h/2,p.w,p.h,16);c.fill();c.strokeStyle='#fff';c.lineWidth=3;rr(c,-p.w/2+8,-p.h/2+8,p.w-16,p.h-16,10);c.stroke();c.fillStyle='rgba(255,255,255,.9)';star(c,0,0,p.w*.2,p.w*.09);c.fill();}
      c.restore();});
    drawFuka(c,80,H*.97,{outfit:outfit(),t:T,sc:1.3,cheer:this.rd>0});stepDots(c,2,this.round,100);},
  down(x,y){if(this.lock||this.rd)return;this.cards.forEach((cd,i)=>{const p=this.cell(i);if(cd.open||cd.got||Math.abs(x-p.x)>p.w/2||Math.abs(y-p.y)>p.h/2)return;cd.open=1;this.sel.push(cd);sfx('pop');sayWord(cd.k);
    if(this.sel.length===2){const [a,b]=this.sel;if(a.k===b.k){a.got=b.got=true;this.sel=[];this.pairs++;sfx('ding');burst(p.x,p.y,12,'star');if(this.cards.every(q=>q.got)){this.rd=.01;sfx('fanfare');confetti(60);setTimeout(()=>{if(scene===this)say('ぜんぶ みつけた！ すごい きおくりょく！');},700);}}
      else{this.lock=true;this.wait=1.1;this.miss++;a.sh=b.sh=.4;}}});},
  hint(){if(this.lock||this.rd)return null;if(this.sel.length===1){const a=this.sel[0];const i=this.cards.findIndex(q=>q!==a&&q.k===a.k);const p=this.cell(i);return idle>14?{x:p.x,y:p.y}:null;}const i=this.cards.findIndex(q=>!q.got);if(i<0)return null;const p=this.cell(i);return{x:p.x,y:p.y};},
  hintText(){return 'カードを 2まい めくって おなじ ものを さがそう';}};

// ================= てんつなぎ (connect the dots) =================
const TENP=[{k:'starcandy',ja:'ほし',en:'star',col:'#ffd23a',lang:'ja',pts:[...Array(10)].map((_,i)=>{const a=i/10*TAU-Math.PI/2,r=i%2?90:210;return[Math.cos(a)*r,Math.sin(a)*r+20];})},
  {k:'fish',ja:'おさかな',en:'fish',col:'#ff9a5a',lang:'en',pts:[[-200,0],[-120,-90],[0,-120],[110,-70],[200,-130],[170,0],[200,130],[110,70],[0,120],[-120,90]]},
  {k:'rocket',ja:'ロケット',en:'rocket',col:'#ff6f8f',lang:'ja',pts:[[0,-230],[70,-110],[70,70],[150,170],[70,150],[40,210],[-40,210],[-70,150],[-150,170],[-70,70],[-70,-110]]}];
SCN.tensen={bg:'#fffaf0',song:'fuwa',
  enter(){this.fin=0;this.miss=0;this.pi=0;this.newP();},
  newP(){this.P=TENP[this.pi];this.n=0;this.drag=null;this.done=0;setTimeout(()=>{if(scene===this){say(this.P.lang==='en'?'えいごで かぞえよう！ 1から じゅんばんに つなげてね':'1から じゅんばんに てんを つなげよう！');}},400);},
  pt(i){const p=this.P.pts[i];return{x:300+p[0]*1.1,y:H*.55+p[1]*1.1};},
  update(dt){if(this.done>0){this.done+=dt;if(this.done>3.4){this.pi++;if(this.pi>=TENP.length){if(!this.fin)this.fin=.01;this.done=-1;}else this.newP();}}
    if(this.fin>0){this.fin+=dt;if(this.fin>.8&&this.fin<9){this.fin=9;celebrate('tensen',this.miss<=3);}}},
  draw(c){c.fillStyle='#fffaf0';c.fillRect(-400,0,W+800,H);c.strokeStyle='#e8f0ff';c.lineWidth=2;for(let y=0;y<H;y+=40){c.beginPath();c.moveTo(-400,y);c.lineTo(W+400,y);c.stroke();}
    const P=this.P,N=P.pts.length,k=this.done>0?Math.min(1,this.done*1.5):0;
    c.save();if(P.k==='rocket'&&this.done>1.2){c.translate(0,-((this.done-1.2)**2)*300);}if(P.k==='fish'&&k>0)c.translate(Math.sin(this.done*6)*10,0);if(P.k==='starcandy'&&k>0){const p=this.pt(0);c.translate(300,H*.55);c.rotate(Math.sin(this.done*3)*.2);c.translate(-300,-H*.55);}
    if(k>0){c.globalAlpha=k;c.fillStyle=P.col;c.beginPath();for(let i=0;i<N;i++){const p=this.pt(i);c.lineTo(p.x,p.y);}c.closePath();c.fill();c.globalAlpha=1;
      if(P.k==='fish'){c.fillStyle='#fff';circ(c,300+130,H*.55-30,18);c.fillStyle='#2a2040';circ(c,300+135,H*.55-30,9);}if(P.k==='starcandy'){c.fillStyle='#5a3a3a';circ(c,265,H*.55+10,8);circ(c,335,H*.55+10,8);c.strokeStyle='#5a3a3a';c.lineWidth=4;c.beginPath();c.arc(300,H*.55+30,18,.2,Math.PI-.2);c.stroke();}
      if(P.k==='rocket'){c.fillStyle='#8fd8ff';circ(c,300,H*.55-40,32);c.strokeStyle='#fff';c.lineWidth=6;c.beginPath();c.arc(300,H*.55-40,32,0,TAU);c.stroke();if(this.done>1)for(let i=0;i<8;i++){c.fillStyle=['#ffd23a','#ff9a3a','#ff5f6f'][i%3];circ(c,300+rand(-30,30),H*.55+240+i*16,18-i*2);}}}
    c.strokeStyle='#5a4a8a';c.lineWidth=7;c.lineCap='round';c.lineJoin='round';c.beginPath();for(let i=0;i<this.n;i++){const p=this.pt(i);c.lineTo(p.x,p.y);}if(this.n>=N){const p=this.pt(0);c.lineTo(p.x,p.y);}c.stroke();
    if(this.drag&&this.n>0&&this.n<=N){const p=this.pt(this.n-1);c.strokeStyle='rgba(90,74,138,.4)';c.setLineDash([10,8]);c.beginPath();c.moveTo(p.x,p.y);c.lineTo(this.drag.x,this.drag.y);c.stroke();c.setLineDash([]);}
    c.restore();
    if(!(this.done>1.2&&P.k==='rocket'))for(let i=0;i<N;i++){const p=this.pt(i),nx=i===this.n%N&&this.done<=0&&!(this.n>=N);c.fillStyle=i<this.n?'#5a4a8a':nx?'#ff4d8d':'#fff';circ(c,p.x,p.y,nx?16+Math.sin(T*6)*3:12);c.strokeStyle='#5a4a8a';c.lineWidth=3;c.beginPath();c.arc(p.x,p.y,nx?16:12,0,TAU);c.stroke();
      const lx=p.x+(p.x>=300?24:-24),ly=p.y-18;c.fillStyle=nx?'#ff4d8d':'#5a4a8a';c.font=`${nx?30:24}px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.fillText(i+1,lx,ly);}
    if(this.done>0){c.fillStyle='#ff4d8d';c.font=`50px ${POP}`;c.textAlign='center';c.lineWidth=8;c.strokeStyle='#fff';c.strokeText(P.ja,W/2,H*.2);c.fillText(P.ja,W/2,H*.2);}
    c.fillStyle='rgba(255,255,255,.9)';rr(c,W/2-130,112,260,44,22);c.fill();c.fillStyle=P.lang==='en'?'#3a8ad8':'#ff6fa8';c.font=`800 20px ${FONT}`;c.textAlign='center';c.fillText(P.lang==='en'?'えいごで かぞえよう':'にほんごで かぞえよう',W/2,135);
    drawFuka(c,70,H*.97,{outfit:outfit(),t:T,sc:1.3,cheer:this.done>0});stepDots(c,3,this.pi,H*.9);},
  sayN(n){hush();if(this.P.lang==='en')speak(NUMEN[n]||String(n),'en');else speak(n<=12?NUMJ[n]:String(n));},
  tryHit(x,y){const N=this.P.pts.length;if(this.n>=N)return;const i=this.n,p=this.pt(i);if(Math.hypot(x-p.x,y-p.y)<42){this.n++;sfx('ding');this.sayN(this.n);burst(p.x,p.y,6,'star');
      if(this.n>=N){this.done=.01;this.drag=null;sfx('fanfare');confetti(60);const P=this.P;setTimeout(()=>{if(scene===this)sayPair(P.ja,P.en);},700);if(P.k==='rocket')setTimeout(()=>{if(scene===this)sfx('launch');},1200);}return true;}return false;},
  down(x,y){if(this.done)return;this.drag={x,y};if(!this.tryHit(x,y)&&this.n>0){const N=this.P.pts.length;for(let j=this.n+1;j<N;j++){const p=this.pt(j);if(Math.hypot(x-p.x,y-p.y)<30){this.miss++;sfx('no');hush();speak(`つぎは ${this.P.lang==='en'?NUMEN[this.n+1]:NUMJ[this.n+1]||this.n+1}`,this.P.lang==='en'?'en':undefined);break;}}}},
  move(x,y){if(!this.drag||this.done)return;this.drag.x=x;this.drag.y=y;this.tryHit(x,y);},
  up(){this.drag=null;},
  hint(){if(this.done)return null;const N=this.P.pts.length;const p=this.pt(this.n%N);if(this.n===0)return{x:p.x,y:p.y};const q=this.pt(this.n-1);return{x:q.x,y:q.y,x2:p.x,y2:p.y};},
  hintText(){return 'ピンクに ひかっている すうじまで ゆびで なぞろう';}};

// ================= めいろ (maze) =================
function genMaze(cols,rows){const cells=[...Array(cols*rows)].map(()=>({w:[1,1,1,1],v:0}));const st=[0];cells[0].v=1;const D=[[0,-1,0,2],[1,0,1,3],[0,1,2,0],[-1,0,3,1]];
  while(st.length){const i=st[st.length-1],x=i%cols,y=Math.floor(i/cols);const nb=D.map(d=>[x+d[0],y+d[1],d[2],d[3]]).filter(([nx,ny])=>nx>=0&&ny>=0&&nx<cols&&ny<rows&&!cells[ny*cols+nx].v);
    if(!nb.length){st.pop();continue;}const [nx,ny,a,b]=pick(nb);const j=ny*cols+nx;cells[i].w[a]=0;cells[j].w[b]=0;cells[j].v=1;st.push(j);}return cells;}
SCN.meiro={bg:'#e8fff0',song:'play',
  enter(){this.fin=0;this.miss=0;this.lv=0;this.stars=0;this.allStars=true;this.newMaze();},
  newMaze(){const S=[[4,5],[5,6],[6,8]][this.lv];this.cols=S[0];this.rows=S[1];this.m=genMaze(S[0],S[1]);this.cs=Math.min(520/this.cols,H*.6/this.rows);this.x0=W/2-this.cols*this.cs/2;this.y0=H*.24;
    this.ch={c:0,x:0,y:0};this.trail=[0];this.goal=this.cols*this.rows-1;const free=shuffle([...Array(this.cols*this.rows).keys()].filter(i=>i!==0&&i!==this.goal));this.items=free.slice(0,3).map(i=>({i,got:false}));this.done=0;this.drag=false;
    setTimeout(()=>{if(scene===this)say(this.lv?'つぎの めいろ！ ほしを あつめて ゴールへ':'ひよこを ゆびで うごかして、 ママの ところへ つれていこう！ ほしも あつめてね');},400);},
  cc(i){return{x:this.x0+(i%this.cols+.5)*this.cs,y:this.y0+(Math.floor(i/this.cols)+.5)*this.cs};},
  cellAt(x,y){const cx=Math.floor((x-this.x0)/this.cs),cy=Math.floor((y-this.y0)/this.cs);if(cx<0||cy<0||cx>=this.cols||cy>=this.rows)return-1;return cy*this.cols+cx;},
  open(a,b){const ax=a%this.cols,ay=Math.floor(a/this.cols),bx=b%this.cols,by=Math.floor(b/this.cols);const dx=bx-ax,dy=by-ay;if(Math.abs(dx)+Math.abs(dy)!==1)return false;const d=dy<0?0:dx>0?1:dy>0?2:3;return!this.m[a].w[d];},
  path(a,b){const prev={},q=[a];prev[a]=-1;while(q.length){const i=q.shift();if(i===b)break;const x=i%this.cols,y=Math.floor(i/this.cols);for(const [dx,dy,d] of [[0,-1,0],[1,0,1],[0,1,2],[-1,0,3]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=this.cols||ny>=this.rows||this.m[i].w[d])continue;const j=ny*this.cols+nx;if(prev[j]===undefined){prev[j]=i;q.push(j);}}}
    if(prev[b]===undefined)return null;const P=[];for(let i=b;i!==a;i=prev[i])P.unshift(i);return P;},
  step(j){this.ch.c=j;const L=this.trail;if(L.length>1&&L[L.length-2]===j)L.pop();else L.push(j);sfx('tick');const it=this.items.find(q=>q.i===j&&!q.got);if(it){it.got=true;this.stars++;const p=this.cc(j);burst(p.x,p.y,12,'star');sfx('coin');hush();speak(`ほし ${NUMJ[this.items.filter(q=>q.got).length]}こ！`);}
    if(j===this.goal){this.done=.01;this.drag=false;if(this.items.some(q=>!q.got))this.allStars=false;sfx('fanfare');confetti(50);setTimeout(()=>{if(scene===this)sayPair('ゴール！ ママに あえたね','goal!');},400);}},
  update(dt){const p=this.cc(this.ch.c);this.ch.x+=(p.x-this.ch.x)*Math.min(1,dt*14);this.ch.y+=(p.y-this.ch.y)*Math.min(1,dt*14);if(this.ch.x===0){this.ch.x=p.x;this.ch.y=p.y;}
    if(this.done>0){this.done+=dt;if(this.done>2.6){this.lv++;if(this.lv>=3){if(!this.fin)this.fin=.01;this.done=-1;}else this.newMaze();}}
    if(this.fin>0){this.fin+=dt;if(this.fin>.8&&this.fin<9){this.fin=9;celebrate('meiro',this.allStars);}}},
  draw(c){c.fillStyle='#e8fff0';c.fillRect(-400,0,W+800,H);c.fillStyle='#d0f4dc';for(let i=0;i<30;i++)circ(c,(i*137)%W,(i*89)%H,6);
    const cs=this.cs,x0=this.x0,y0=this.y0,Wd=this.cols*cs,Hd=this.rows*cs;c.fillStyle='rgba(60,120,80,.15)';rr(c,x0-8,y0-4,Wd+24,Hd+24,18);c.fill();c.fillStyle='#fffdf4';rr(c,x0-12,y0-12,Wd+24,Hd+24,18);c.fill();
    c.strokeStyle='rgba(255,140,190,.55)';c.lineWidth=cs*.34;c.lineCap='round';c.lineJoin='round';c.beginPath();this.trail.forEach(i=>{const p=this.cc(i);c.lineTo(p.x,p.y);});c.stroke();
    const g=this.cc(this.goal);c.fillStyle='#e8c070';ell(c,g.x,g.y+cs*.2,cs*.4,cs*.16);drawAnimal(c,'chick',g.x,g.y+cs*.25,cs/150*1.3,{t:T,happy:this.done>0});c.fillStyle='#ff5f6f';c.save();c.translate(g.x+cs*.1,g.y-cs*.2);c.scale(cs/110,cs/110);c.beginPath();c.moveTo(-10,-6);c.quadraticCurveTo(0,-26,10,-6);c.fill();c.restore();
    for(const it of this.items){if(it.got)continue;const p=this.cc(it.i);c.fillStyle='#ffd23a';star(c,p.x,p.y+Math.sin(T*4+it.i)*3,cs*.26,cs*.11);c.fill();c.strokeStyle='#f0a000';c.lineWidth=2;c.stroke();}
    c.strokeStyle='#4cae6a';c.lineWidth=Math.max(6,cs*.1);c.lineCap='round';c.beginPath();for(let i=0;i<this.m.length;i++){const x=x0+(i%this.cols)*cs,y=y0+Math.floor(i/this.cols)*cs,w=this.m[i].w;if(w[0]){c.moveTo(x,y);c.lineTo(x+cs,y);}if(w[3]){c.moveTo(x,y);c.lineTo(x,y+cs);}if(w[1]&&i%this.cols===this.cols-1){c.moveTo(x+cs,y);c.lineTo(x+cs,y+cs);}if(w[2]&&Math.floor(i/this.cols)===this.rows-1){c.moveTo(x,y+cs);c.lineTo(x+cs,y+cs);}}c.stroke();
    const hop=this.drag?Math.abs(Math.sin(T*12))*4:0;drawAnimal(c,'chick',this.ch.x,this.ch.y+cs*.28-hop,cs/150*.95,{t:T,happy:1});if(this.ch.c===0&&!this.drag&&this.done<=0){c.strokeStyle=`rgba(255,95,160,${.5+Math.sin(T*6)*.3})`;c.lineWidth=4;c.beginPath();c.arc(this.ch.x,this.ch.y,cs*.45,0,TAU);c.stroke();}
    c.fillStyle='#fff';rr(c,W/2-120,120,240,48,24);c.fill();c.fillStyle='#f0a000';star(c,W/2-70,144,14,6);c.fill();c.fillStyle='#8a6a1a';c.font=`800 24px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(`${this.items.filter(q=>q.got).length} / 3`,W/2+20,145);
    drawFuka(c,80,H*.97,{outfit:outfit(),t:T,sc:1.2,cheer:this.done>0});stepDots(c,3,this.lv,H*.94);},
  down(x,y){if(this.done)return;const i=this.cellAt(x,y);if(i<0)return;if(i===this.ch.c||Math.hypot(x-this.ch.x,y-this.ch.y)<this.cs*.7){this.drag=true;return;}if(this.open(this.ch.c,i)){this.step(i);this.drag=true;}else{const P=this.path(this.ch.c,i);if(P&&P.length<=2){P.forEach(j=>{if(!this.done)this.step(j);});this.drag=true;}else{sfx('no');}}},
  move(x,y){if(!this.drag||this.done)return;const i=this.cellAt(x,y);if(i<0||i===this.ch.c)return;if(this.open(this.ch.c,i)){this.step(i);return;}const P=this.path(this.ch.c,i);if(P&&P.length<=3)for(const j of P){if(this.done)break;this.step(j);}},
  up(){this.drag=false;},
  hint(){if(this.done)return null;const P=this.path(this.ch.c,this.goal);if(!P||!P.length)return null;const a=this.cc(this.ch.c),b=this.cc(P[Math.min(P.length-1,2)]);return{x:a.x,y:a.y,x2:b.x,y2:b.y};},
  hintText(){return 'ひよこを ゆびで ひっぱって みちを すすもう';}};

// ================= かげあて (shadow matching) =================
const KAGE_R=[['cat','dog','rabbit'],['apple','banana','strawberry','carrot'],['rocket','train','crown','balloon','cake']];
SCN.kage={bg:'#3a2a5a',song:'fuwa',
  enter(){this.fin=0;this.miss=0;this.r=0;this.newR();},
  newR(){const ks=KAGE_R[this.r].filter(k=>WORDS[k]);this.sh=shuffle(ks.slice()).map((k,i)=>({k,got:false}));const n=this.sh.length;this.sh.forEach((s,i)=>{const cols=n>3?3:n,row=Math.floor(i/cols),inRow=Math.min(cols,n-row*cols);s.x=W/2-(inRow-1)*85+(i%cols)*170;s.y=H*.3+row*190;});
    this.ob=shuffle(ks.slice()).map((k,i)=>({k,hx:W/2-(n-1)*(Math.min(120,540/n)/2)+i*Math.min(120,540/n),hy:H*.82,x:0,y:0,held:false,got:false}));this.ob.forEach(o=>{o.x=o.hx;o.y=o.hy;});this.done=0;this.held=null;
    setTimeout(()=>{if(scene===this)say(this.r?'つぎの かげ！ どれかな？':'かげあて クイズ！ おなじ かたちの かげに はこんでね');},400);},
  update(dt){for(const o of this.ob){if(o.got){o.x+=(o.tx-o.x)*Math.min(1,dt*12);o.y+=(o.ty-o.y)*Math.min(1,dt*12);}else if(!o.held){o.x+=(o.hx-o.x)*Math.min(1,dt*12);o.y+=(o.hy-o.y)*Math.min(1,dt*12);}}
    if(this.done>0){this.done+=dt;if(this.done>2.6){this.r++;if(this.r>=KAGE_R.length){if(!this.fin)this.fin=.01;this.done=-1;}else this.newR();}}
    if(this.fin>0){this.fin+=dt;if(this.fin>.8&&this.fin<9){this.fin=9;celebrate('kage',this.miss<=2);}}},
  draw(c){c.fillStyle='#3a2a5a';c.fillRect(-400,0,W+800,H);c.fillStyle='#fff6dc';rr(c,24,H*.17,W-48,H*.56,24);c.fill();const g=c.createRadialGradient(W/2,H*.45,40,W/2,H*.45,400);g.addColorStop(0,'rgba(255,255,255,.7)');g.addColorStop(1,'rgba(255,230,180,0)');c.fillStyle=g;rr(c,24,H*.17,W-48,H*.56,24);c.fill();
    c.fillStyle='#ff6f8f';for(const sd of[-1,1]){c.beginPath();c.moveTo(W/2+sd*(W/2-20),H*.15);c.quadraticCurveTo(W/2+sd*(W/2-120),H*.3,W/2+sd*(W/2-24),H*.74);c.lineTo(W/2+sd*(W/2+10),H*.74);c.lineTo(W/2+sd*(W/2+10),H*.15);c.fill();}c.fillStyle='#c83a5a';rr(c,0,H*.13,W,40,10);c.fill();
    for(const s of this.sh){if(s.got)continue;c.drawImage(silhouette(s.k),s.x-80,s.y-80,160,160);}
    for(const o of this.ob){if(!o.got)continue;drawThing(c,o.k,o.x,o.y,1.38);}
    c.fillStyle='#5a4a7a';rr(c,10,H*.74,W-20,H*.2,26);c.fill();
    for(const o of this.ob){if(o.got)continue;c.fillStyle='rgba(0,0,0,.2)';ell(c,o.x,o.y+44,34,8);drawThing(c,o.k,o.x,o.y-(o.held?12:0),o.held?1.2:.9);}
    drawFuka(c,72,H*.99,{outfit:outfit(),t:T,sc:1.2,cheer:this.done>0});SPECIAL_THING.flashlight(c,120,H*.9,.8);stepDots(c,3,this.r,H*.11);},
  down(x,y){if(this.done)return;for(const o of this.ob.slice().reverse())if(!o.got&&Math.hypot(x-o.x,y-o.y)<55){this.held=o;o.held=true;sfx('pop');return;}},
  move(x,y){if(this.held){this.held.x=x;this.held.y=y;}},
  up(x,y){const o=this.held;if(!o)return;this.held=null;o.held=false;let best=null,bd=95;for(const s of this.sh){if(s.got)continue;const d=Math.hypot(x-s.x,y-s.y);if(d<bd){bd=d;best=s;}}if(!best)return;
    if(best.k!==o.k){this.miss++;sfx('no');say('ちがう かげ みたい。 よく みてね');return;}best.got=true;o.got=true;o.tx=best.x;o.ty=best.y;sfx('ding');burst(best.x,best.y,12,'star');sayWord(o.k);
    if(this.sh.every(s=>s.got)){this.done=.01;sfx('fanfare');confetti(50);setTimeout(()=>{if(scene===this)say('ぜんぶ あたり！');},1200);}},
  hint(){if(this.done)return null;const o=this.ob.find(o=>!o.got);if(!o)return null;const s=this.sh.find(s=>s.k===o.k);return{x:o.hx,y:o.hy,x2:s.x,y2:s.y};},
  hintText(){return 'したの ものを おなじ かたちの かげに はこんでね';}};

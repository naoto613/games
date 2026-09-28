// ================= steps: talk / search / count / quiz / deduce / dots / lock / abc =================
function dimContent(c,a=.35){c.fillStyle=`rgba(255,255,255,${a})`;c.fillRect(VX0-2,150,VX1-VX0+4,VY1-150);}
// ---------- talk ----------
STEP.talk={
  enter(){const d=this.d;if(d.flag)Object.assign(RUN.flags,d.flag);RUN.doc=!!d.doc;RUN.cure=!!d.cure;this.bg=d.bg||'office';
    bgm(d.bgm||(this.bg==='office'?'office':this.bg==='night'?'night':(this.bg==='castle'||this.bg==='dark')?'boss':'search'));
    this.cast=(d.cast||['fu','rk']).slice();this.emo={};this.li=-1;this.lt=0;this.next();},
  next(){const d=this.d;this.li++;if(this.li>=d.lines.length){hush();finish(this,.05);this.li=d.lines.length-1;return;}
    const[who,text,o={}]=d.lines[this.li];this.lt=0;this.who=who;
    if(o.in&&!this.cast.includes(o.in))this.cast.push(o.in);if(o.out)this.cast=this.cast.filter(k=>k!==o.out);
    if(o.emo)this.emo[who]=o.emo;if(o.set)Object.assign(this.emo,o.set);
    this.show=o.show||null;this.showT=0;
    if(o.fx==='shake'){SHAKE=.5;sfx('drum');}if(o.fx==='boom'){SHAKE=.7;sfx('boom');burst(300,380,20,'star','#b04aff');}if(o.fx==='flash'){FLASH=1;FLASHCOL='#fff';sfx('whoosh');}
    if(o.fx==='confetti'){confetti(70);sfx('fanfare');}if(o.fx==='ring')sfx('ring');if(o.fx==='sparkle'){burst(200,260,24,'star');sfx('find');}if(o.fx==='dark'){FLASH=1;FLASHCOL='#3a0a4a';sfx('boom');}
    if(o.sfx)sfx(o.sfx);if(o.show){sfx('find');learn(wordKey(o.show));}
    say(text,who,o.en);},
  update(dt){this.lt+=dt;this.showT+=dt;},
  pos(){const L=[],R=[];for(const k of this.cast)(k==='fu'||k==='rk'?L:R).push(k);const P={};
    if(L.includes('fu'))P.fu=[82,470];if(L.includes('rk'))P.rk=[L.includes('fu')?150:90,440];
    const xs=R.length===1?[300]:R.length===2?[240,340]:[222,295,368];R.forEach((k,i)=>P[k]=[xs[i]||300,470]);return P;},
  draw(c){const d=this.d;drawBG(c,this.bg);const P=this.pos();
    for(const k of this.cast){const p=P[k];if(!p)continue;const sp=k===this.who;c.save();if(sp){c.translate(p[0],p[1]);c.scale(1.04,1.04);c.translate(-p[0],-p[1]);}
      drawCast(c,k,p[0],p[1],{emo:this.emo[k],cure:d.cure,doc:d.doc,talk:sp&&k==='rk'&&speaking(),seed:k.length});c.restore();
      if(sp&&this.who!=='narr'){c.fillStyle='#ff5fa2';const ty=k==='fu'?p[1]-160:k==='rk'?p[1]-110:k==='kuro'?p[1]-170:k==='witch'?p[1]-190:p[1]-150;c.beginPath();c.moveTo(p[0]-9,ty+Math.sin(T*6)*3);c.lineTo(p[0]+9,ty+Math.sin(T*6)*3);c.lineTo(p[0],ty+12+Math.sin(T*6)*3);c.closePath();c.fill();}}
    if(this.show){const k=easeBack(Math.min(1,this.showT*3));c.save();c.translate(200,270);c.scale(k,k);drawGlow(c,'#fff6a0',0,0,110,.8);c.fillStyle='rgba(255,255,255,.9)';circ(c,0,0,62);c.strokeStyle='#ffc83a';c.lineWidth=5;c.beginPath();c.arc(0,0,62,0,TAU);c.stroke();drawIcon(c,this.show,0,0,2.2);c.restore();
      const w=wordOf(this.show);if(w&&k>.9){otext(c,w[0],200,350,22,'#fff','#ff9a2a','center',FONT);otext(c,w[1],200,380,22,'#fff','#3a8aff','center',POP);}}
    const[who,text]=d.lines[this.li]||['narr',''];const narr=who==='narr';
    c.fillStyle='rgba(90,30,70,.3)';rr(c,14,532,372,176,24);c.fill();c.fillStyle=narr?'rgba(250,244,255,.97)':'rgba(255,255,255,.97)';rr(c,14,526,372,176,24);c.fill();c.strokeStyle=narr?'#b48cff':who==='kuro'||who==='witch'?'#7a4ab8':'#ff8cc6';c.lineWidth=4;c.stroke();
    if(!narr){const nm=nameOf(who);c.font=`900 18px ${FONT}`;const w=c.measureText(nm).width+30;c.fillStyle=who==='kuro'||who==='witch'?'#7a4ab8':who==='rk'?'#ffb03a':who==='fu'?'#ff5fa2':'#5aa8ff';rr(c,28,510,w,32,16);c.fill();txt(c,nm,28+w/2,527,18,'#fff','center',900);}
    const n=para(c,text,34,566,332,21,'#4a2a3a',1.42);
    if(this.lt>.35){c.fillStyle='#ff8cc6';const bx=362,by=684+Math.sin(T*6)*3;c.beginPath();c.moveTo(bx-8,by-6);c.lineTo(bx+8,by-6);c.lineTo(bx,by+4);c.closePath();c.fill();}},
  down(){if(this.lt<.35)return;sfx('tap');this.next();},
  hint(){return this.lt>6?{x:340,y:660}:null;},
};
// ---------- search (むしめがね) ----------
const SEARCH_SLOTS=[[80,230],[200,205],[320,235],[115,335],[290,340],[200,430],[80,480],[320,485],[200,550]];
STEP.search={
  enter(){const d=this.d;this.bg=d.bg;bgm('search');const slots=shuffle(SEARCH_SLOTS);RUN.doc=false;RUN.cure=false;
    this.clues=d.clues.map((q,i)=>{const w=wordOf(q[0])||[];return{k:q[0],ja:q[1]||w[0],en:q[2]||w[1],x:slots[i][0]+rand(-12,12),y:slots[i][1]+rand(-12,12),got:false,hov:0};});
    this.lens={x:200,y:400};this.held=false;this.found=[];this.t=0;
    instr(d.ins||`むしめがねを うごかして、てがかりを ${this.clues.length}つ さがそう！`,'fu');},
  update(dt){this.t+=dt;if(this.fin!=null)return;const L=this.lens;
    for(const q of this.clues){if(q.got)continue;if(Math.hypot(L.x-q.x,L.y-q.y)<46){q.hov+=dt;if(q.hov>.25){q.got=true;this.found.push(q);sfx('find');burst(q.x,q.y,18);showCard(q.k,q.ja,q.en);say(`みつけた！ ${q.ja}`,'fu',q.en);
      if(this.found.length===this.clues.length){finish(this,2.8);setTimeout(()=>{if(scene===this)say(this.d.done||'てがかりが ぜんぶ そろった！','fu');},1600);}}}else q.hov=Math.max(0,q.hov-dt);}},
  draw(c){drawBG(c,this.bg);c.fillStyle='rgba(20,10,40,.58)';c.fillRect(VX0-2,VY0-2,VX1-VX0+4,VY1-VY0+4);const L=this.lens,R=66;
    c.save();c.beginPath();c.arc(L.x,L.y,R,0,TAU);c.clip();drawBG(c,this.bg);c.fillStyle='rgba(255,250,220,.15)';c.fillRect(L.x-R,L.y-R,R*2,R*2);
    for(const q of this.clues)if(!q.got){drawGlow(c,'#fff6a0',q.x,q.y,40,.6+Math.sin(T*6)*.2);drawIcon(c,q.k,q.x,q.y,1.2);}c.restore();
    c.strokeStyle='#8a5a2a';c.lineWidth=16;c.lineCap='round';c.beginPath();c.moveTo(L.x+R*.72,L.y+R*.72);c.lineTo(L.x+R*1.35,L.y+R*1.35);c.stroke();
    c.strokeStyle='#c89a3a';c.lineWidth=11;c.beginPath();c.arc(L.x,L.y,R+2,0,TAU);c.stroke();c.strokeStyle='#ffe08a';c.lineWidth=3;c.stroke();c.fillStyle='rgba(255,255,255,.22)';ell(c,L.x-24,L.y-26,18,10,-.6);
    for(const q of this.clues)if(!q.got&&q.hov>0){c.strokeStyle='#ffd23a';c.lineWidth=5;c.beginPath();c.arc(L.x,L.y,R-6,-Math.PI/2,-Math.PI/2+q.hov/.25*TAU);c.stroke();}
    const n=this.clues.length;c.fillStyle='rgba(255,250,235,.96)';rr(c,20,622,360,86,20);c.fill();c.strokeStyle='#c8905a';c.lineWidth=4;c.stroke();
    for(let i=0;i<n;i++){const x=200+(i-(n-1)/2)*(300/n);c.fillStyle='#fff';circ(c,x,665,32);c.strokeStyle='#e0c8a0';c.lineWidth=3;c.beginPath();c.arc(x,665,32,0,TAU);c.stroke();const q=this.found[i];if(q)drawIcon(c,q.k,x,665,1);else txt(c,'?',x,667,30,'#d8c8a8');}
    if(this.t<3&&!this.held){drawHand(c,L.x+Math.sin(T*2)*40,L.y+70);}},
  down(x,y){this.held=true;this.lens.x=clamp(x,30,370);this.lens.y=clamp(y-80,160,600);},
  move(x,y){if(this.held){this.lens.x=clamp(x,30,370);this.lens.y=clamp(y-80,160,600);}},
  up(){this.held=false;},
  hint(){const q=this.clues.find(q=>!q.got);if(!q)return null;const k=(T*.6)%1;return{x:lerp(this.lens.x,q.x,ease(k)),y:lerp(this.lens.y+80,q.y+80,ease(k))};},
};
// ---------- count ----------
function scatter(n,x0,x1,y0,y1,minD){const pts=[];let tries=0;while(pts.length<n&&tries<3000){tries++;const p=[rand(x0,x1),rand(y0,y1)];if(pts.every(q=>Math.hypot(q[0]-p[0],q[1]-p[1])>=minD))pts.push(p);if(tries%600===0)minD*=.85;}while(pts.length<n)pts.push([rand(x0,x1),rand(y0,y1)]);return pts;}
STEP.count={
  enter(){const d=this.d;this.bg=d.bg||'office';bgm('search');this.n=d.n;this.items=scatter(d.n,55,345,200,560,74).map(p=>({x:p[0],y:p[1],no:0,rot:rand(-.4,.4)}));this.cnt=0;this.ph='tap';this.t=0;
    const w=wordOf(d.icon);instr(d.ins||`${w?w[0]:''}は いくつ あるかな？ タッチして かぞえよう！`,'fu');},
  update(dt){this.t+=dt;if(this.ph==='wait'&&this.t>1.1){this.ph='ask';const n=this.n;const s=new Set([n]);while(s.size<3){const v=n+pick([-2,-1,1,2]);if(v>=1&&v<=20)s.add(v);}this.opts=shuffle([...s]).map(v=>({v,sh:0}));instr('ぜんぶで いくつ？ すうじを タッチしてね','fu');}
    if(this.opts)for(const o of this.opts)o.sh=Math.max(0,o.sh-dt);},
  optP(i){return[80+i*120,640];},
  draw(c){drawBG(c,this.bg);dimContent(c,.3);c.fillStyle='rgba(255,255,255,.88)';rr(c,24,168,352,424,26);c.fill();c.strokeStyle='#ffc0dc';c.lineWidth=4;c.stroke();
    for(const it of this.items){c.save();c.translate(it.x,it.y);c.rotate(it.rot);drawIcon(c,this.d.icon,0,0,1.25);c.restore();if(it.no){c.fillStyle='#ff5fa2';circ(c,it.x+22,it.y-22,15);c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.arc(it.x+22,it.y-22,15,0,TAU);c.stroke();txt(c,String(it.no),it.x+22,it.y-21,18,'#fff','center',900);}}
    if(this.ph==='tap'){c.fillStyle='rgba(255,255,255,.9)';rr(c,120,610,160,70,35);c.fill();otext(c,String(this.cnt),200,646,40,'#ff5fa2','#fff');}
    if(this.opts)this.opts.forEach((o,i)=>{const[x,y]=this.optP(i);const sh=o.sh>0?Math.sin(o.sh*40)*6:0;drawIcon(c,'n:'+o.v,x+sh,y,1.8);});},
  down(x,y){if(this.fin!=null)return;
    if(this.ph==='tap'){for(const it of this.items){if(!it.no&&inC(x,y,it.x,it.y,38)){it.no=++this.cnt;sfx('count',it.no);burst(it.x,it.y,8);say(JA_NUM[it.no],'fu',EN_NUM[it.no]);if(this.cnt===this.n){this.ph='wait';this.t=0;}return;}}return;}
    if(this.ph==='ask')this.opts.forEach((o,i)=>{const[ox,oy]=this.optP(i);if(inC(x,y,ox,oy,46)){if(o.v===this.n){sfx('ok');burst(ox,oy,24);confetti(30);say(`${JA_NUM[this.n]}！ せいかい！`,'fu',EN_NUM[this.n]);this.ph='done';finish(this,2.4);}else{o.sh=.5;sfx('no');say('ちがうみたい。 かぞえた かずを みてね','rk');}}});},
  hint(){if(this.ph==='tap'){const it=this.items.find(i=>!i.no);return it?{x:it.x,y:it.y}:null;}if(this.ph==='ask'){const i=this.opts.findIndex(o=>o.v===this.n);const p=this.optP(i);return{x:p[0],y:p[1]};}return null;},
};
// ---------- quiz (いろいろな せんたく もんだい) ----------
STEP.quiz={
  enter(){this.bg=this.d.bg||'office';bgm(this.d.bgm||'search');this.ri=-1;this.nextRound();},
  nextRound(){this.ri++;const R=this.d.rounds;if(this.ri>=R.length){finish(this,.2);return;}const r=this.r=R[this.ri];this.st='ask';this.rt=0;
    this.opts=shuffle([r.ans,...r.wrong]).map(k=>({k,sh:0,ok:k===r.ans}));this.ask();},
  ask(){const r=this.r;INS={text:r.q,who:r.who||'fu',t:0};const parts=r.say||[[r.q,'ja']];say(parts,r.who||'fu',r.say?null:r.en);},
  update(dt){this.rt+=dt;for(const o of this.opts||[])o.sh=Math.max(0,o.sh-dt);if(this.st==='ok'&&this.rt>2.2)this.nextRound();},
  optP(i){const n=this.opts.length;if(n<=3)return[200+(i-(n-1)/2)*125,590,112,128];return[110+(i%2)*180,520+Math.floor(i/2)*135,160,120];},
  drawTop(c){const tp=this.r.top;if(!tp)return;const cx=200,cy=300;
    c.fillStyle='#fffdfa';rr(c,30,168,340,262,26);c.fill();c.strokeStyle='#ffc0dc';c.lineWidth=4;c.stroke();
    if(tp.icon){if(tp.sil){const k=tp.icon,S=tp.s||3;silhouette(c,s=>drawIcon(s,k,0,0,S),cx,cy,400,'#3a2a4a');if(this.st==='ok')drawIcon(c,k,cx,cy,S*Math.min(1,this.rt*2));}else drawIcon(c,tp.icon,cx,cy,tp.s||3.4);}
    if(tp.listen){const p=1+Math.sin(T*5)*.06;c.save();c.translate(cx,cy);c.scale(p,p);drawRBtn(c,0,0,64,'voice','#5aa8ff');c.restore();txt(c,'タッチで もういちど',cx,cy+100,15,'#8a6a9a');}
    if(tp.row){const n=tp.row.length,w=Math.min(56,320/n);tp.row.forEach((k,i)=>{const x=cx+(i-(n-1)/2)*w;if(k==='?'){c.fillStyle='#fff6c8';rr(c,x-w/2+3,cy-w/2,w-6,w,10);c.fill();c.strokeStyle='#ffb03a';c.lineWidth=3;c.setLineDash([5,4]);c.stroke();c.setLineDash([]);if(this.st==='ok')drawIcon(c,this.r.ans,x,cy,w/56);else txt(c,'?',x,cy+2,30,'#ffb03a');}else drawIcon(c,k,x,cy,w/56);});}
    if(tp.add){const[a,b,k]=tp.add;const grp=(n,x0)=>{for(let i=0;i<n;i++){const col=i%3,row=Math.floor(i/3);const rows=Math.ceil(n/3);drawIcon(c,k,x0+(col-(Math.min(3,n)-1)/2)*40,cy-30+(row-(rows-1)/2)*44,.8);}};grp(a,105);otext(c,'+',cx,cy-30,44,'#fff','#ff5fa2');grp(b,295);otext(c,this.st==='ok'?`${a} + ${b} = ${a+b}`:`${a} + ${b} = ?`,cx,cy+85,34,'#fff','#ff5fa2');}
    if(tp.group){const[k,n]=tp.group;const cols=Math.min(5,n);for(let i=0;i<n;i++){const col=i%cols,row=Math.floor(i/cols);drawIcon(c,k,cx+(col-(cols-1)/2)*58,cy-40+row*62,.95);}}
    if(tp.num!=null)otext(c,String(tp.num),cx,cy,110,'#fff','#ff5fa2');
    if(tp.text)otext(c,tp.text,cx,cy,tp.size||56,'#fff','#3a8aff','center',POP);
    if(tp.an){drawAnimal(c,tp.an,cx,cy+110,1.6,{acc:tp.acc,sick:tp.sick});}},
  draw(c){drawBG(c,this.bg);dimContent(c,.3);this.drawTop(c);
    this.opts.forEach((o,i)=>{const[x,y,w,h]=this.optP(i);const sh=o.sh>0?Math.sin(o.sh*40)*7:0,good=this.st==='ok'&&o.ok;c.save();c.translate(x+sh,y);if(good){c.scale(1.08,1.08);drawGlow(c,'#fff6a0',0,0,90,.8);}
      c.fillStyle='rgba(90,30,70,.2)';rr(c,-w/2,-h/2+5,w,h,20);c.fill();c.fillStyle=good?'#fffbe0':'#fff';rr(c,-w/2,-h/2,w,h,20);c.fill();c.strokeStyle=good?'#ffc83a':'#ff9ccf';c.lineWidth=4;c.stroke();
      const lab=this.r.labels&&this.r.labels[o.k];drawIcon(c,o.k,0,lab?-12:0,lab?1.35:1.6);if(lab)txt(c,lab,0,h/2-18,14,'#5b2c47');
      if(good&&!lab){const w2=wordOf(o.k);if(w2)txt(c,w2[1],0,h/2-14,14,'#3a8aff','center',900);}c.restore();});},
  down(x,y){if(this.st!=='ask'||this.fin!=null)return;const tp=this.r.top;if(tp&&tp.listen&&inC(x,y,200,300,70)){this.ask();return;}
    this.opts.forEach((o,i)=>{const[ox,oy,w,h]=this.optP(i);if(!inR(x,y,ox,oy,w,h))return;
      if(o.ok){this.st='ok';this.rt=0;sfx('ok');burst(ox,oy,22);learn(wordKey(o.k));const r=this.r;say(r.ok||'せいかい！','fu',r.okEn);}
      else{o.sh=.5;sfx('no');const r=this.r;say(r.en?[['ちがうよ。','ja'],[r.en,'en']]:(r.no||'ちがうよ。 もういちど かんがえてみよう'),'rk');}});},
  hint(){if(this.st!=='ask')return null;const i=this.opts.findIndex(o=>o.ok);const p=this.optP(i);return IDLE>12?{x:p[0],y:p[1]}:null;},
};
// ---------- deduce (すいり) ----------
STEP.deduce={
  enter(){const d=this.d;this.bg=d.bg||'office';bgm('search');this.st='ask';this.t=0;this.sh=[0,0,0];instr(d.ins||'てがかりに ぴったりの はんにんは だれかな？','fu');},
  update(dt){this.t+=dt;this.sh=this.sh.map(v=>Math.max(0,v-dt));},
  susP(i){return[70+i*130,450];},
  draw(c){const d=this.d;drawBG(c,this.bg);c.fillStyle='rgba(30,10,50,.45)';c.fillRect(VX0-2,150,VX1-VX0+4,VY1-150);
    c.fillStyle='rgba(255,250,235,.96)';rr(c,20,160,360,110,20);c.fill();c.strokeStyle='#c8905a';c.lineWidth=4;c.stroke();txt(c,'てがかり',200,176,14,'#a0643a');
    d.clues.forEach((q,i)=>{const x=200+(i-(d.clues.length-1)/2)*110;drawIcon(c,q[0],x,215,1);txt(c,q[1],x,254,13,'#5b2c47');});
    d.sus.forEach((id,i)=>{const[x,y]=this.susP(i);const sh=this.sh[i]>0?Math.sin(this.sh[i]*40)*7:0,got=this.st==='got'&&i===d.ok;c.save();c.translate(x+sh,y);
      c.fillStyle='rgba(0,0,0,.25)';rr(c,-58,-150,116,236,18);c.fill();c.fillStyle=got?'#fff6d0':'#fff';rr(c,-58,-156,116,236,18);c.fill();c.strokeStyle=got?'#ff4a6a':'#ffb3d6';c.lineWidth=5;c.stroke();
      const n=NPC[id];drawAnimal(c,n.kind,0,40,.95,{t:T+i,acc:n.acc,sad:got});txt(c,n.name,0,64,13,'#5b2c47');
      if(got){const k=easeBack(Math.min(1,this.t*3));c.save();c.translate(0,-100);c.rotate(-.25);c.scale(k,k);c.strokeStyle='#ff3d6d';c.lineWidth=5;rr(c,-46,-20,92,40,8);c.stroke();txt(c,'はんにん',0,1,22,'#ff3d6d','center',900);c.restore();}c.restore();});
    drawRicky(c,350,640,{s:1.4,t:T});drawFutan(c,52,690,{s:1.6,pose:'think',item:'lens'});},
  down(x,y){const d=this.d;if(this.st!=='ask')return;
    d.clues.forEach((q,i)=>{const cx=200+(i-(d.clues.length-1)/2)*110;if(inC(x,y,cx,215,34)){const w=wordOf(q[0]);say(q[1],'fu',w&&w[1]);}});
    d.sus.forEach((id,i)=>{const[sx,sy]=this.susP(i);if(!inR(x,y,sx,sy-38,116,236))return;
      if(i===d.ok){this.st='got';this.t=0;sfx('fanfare');SHAKE=.3;burst(sx,sy-60,24);say(`はんにんは… ${NPC[id].name}、きみだ！`,'fu');finish(this,3);}
      else{this.sh[i]=.5;sfx('no');say(d.hint||'てがかりを よく みてね','rk');}});},
  hint(){const[x,y]=this.susP(this.d.ok);return IDLE>14?{x,y:y-40}:null;},
};
// ---------- dots (すうじ つなぎ) ----------
const SHAPES={
  star:n=>{const p=[];for(let i=0;i<n;i++){const a=-Math.PI/2+i*TAU/n,r=i%2?.45:1;p.push([Math.cos(a)*r,Math.sin(a)*r]);}return p;},
  clock:n=>{const p=[];for(let k=1;k<=n;k++){const a=(k/n)*TAU-Math.PI/2;p.push([Math.cos(a),Math.sin(a)]);}return p;},
  heart:n=>{const p=[];for(let i=0;i<n;i++){const a=i/n*TAU;p.push([16*Math.pow(Math.sin(a),3)/17,-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))/17]);}return p;},
  path:n=>[[-.95,.95],[-.3,1],[.35,.85],[.05,.45],[-.65,.35],[-.55,-.1],[.15,-.05],[.8,-.2],[.45,-.62],[.95,-.95]].slice(0,n),
  fish:n=>{const p=[[-1,0],[-.6,-.45],[0,-.55],[.45,-.3],[.7,-.05],[1,-.4],[1,.4],[.7,.05],[.45,.3],[0,.55],[-.6,.45]];return p.slice(0,n);},
};
STEP.dots={
  enter(){const d=this.d;this.bg=d.bg||'night';bgm(this.bg==='night'?'night':'search');this.n=d.n||10;const sc=d.shape==='path'?140:130;this.pts=SHAPES[d.shape||'star'](this.n).map(([a,b])=>({x:200+a*sc,y:385+b*sc}));this.i=0;this.t=0;this.done=false;
    instr(d.ins||`1から ${this.n}まで、じゅんばんに タッチしよう！`,'fu');},
  update(dt){this.t+=dt;},
  draw(c){const d=this.d;drawBG(c,this.bg);if(this.bg!=='night')dimContent(c,.35);const P=this.pts,close=d.shape!=='path';
    if(this.done&&close){c.fillStyle=`rgba(255,240,150,${Math.min(.8,this.t)})`;c.beginPath();P.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.closePath();c.fill();drawGlow(c,'#fff6a0',200,385,200,Math.min(.7,this.t));}
    c.strokeStyle='#ff5fa2';c.lineWidth=8;c.lineCap='round';c.lineJoin='round';c.beginPath();for(let i=0;i<this.i;i++){const p=P[i];i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);}if(this.done&&close)c.closePath();c.stroke();
    if(this.done&&d.shape==='clock'){c.strokeStyle=LN;c.lineWidth=6;c.beginPath();c.moveTo(200,385);c.lineTo(200,300);c.moveTo(200,385);c.lineTo(250,410);c.stroke();}
    P.forEach((p,i)=>{const nx=i===this.i&&!this.done;if(nx){drawGlow(c,'#ffe36a',p.x,p.y,40,.8+Math.sin(T*8)*.2);}c.fillStyle=i<this.i?'#ff8cc6':nx?'#ffe36a':'#fff';circ(c,p.x,p.y,nx?22:19);c.strokeStyle=LN;c.lineWidth=2.5;c.beginPath();c.arc(p.x,p.y,nx?22:19,0,TAU);c.stroke();txt(c,String(i+1),p.x,p.y+1,i>=9?16:20,i<this.i?'#fff':'#5b2c47','center',900);});
    if(this.done&&d.reveal){const k=easeBack(Math.min(1,this.t*2));c.save();c.translate(200,d.shape==='path'?250:385);c.scale(k,k);drawIcon(c,d.reveal,0,0,2.2);c.restore();}},
  down(x,y){if(this.done)return;const p=this.pts[this.i];if(inC(x,y,p.x,p.y,40)){this.i++;sfx('count',this.i);burst(p.x,p.y,8);say(JA_NUM[this.i],'fu',EN_NUM[this.i]);
      if(this.i===this.n){this.done=true;this.t=0;sfx('find');confetti(40);setTimeout(()=>{if(scene===this)say(this.d.done||'できた！','fu');},900);finish(this,3.4);}}
    else if(this.pts.some(q=>inC(x,y,q.x,q.y,26))){sfx('no');say([[`つぎは ${JA_NUM[this.i+1]}だよ`,'ja'],[EN_NUM[this.i+1],'en']],'rk');}},
  hint(){const p=this.pts[this.i];return p&&!this.done?{x:p.x,y:p.y}:null;},
};
// ---------- lock (ばんごう あわせ) ----------
STEP.lock={
  enter(){const d=this.d;this.bg=d.bg||'office';bgm('search');this.vals=d.hints.map(()=>0);this.open=false;this.t=0;this.sh=0;instr(d.ins||'えの かずを かぞえて、ばんごうを あわせよう！','fu');},
  colX(i){const n=this.d.hints.length;return 200+(i-(n-1)/2)*120;},
  update(dt){this.t+=dt;},
  draw(c){const d=this.d;drawBG(c,this.bg);dimContent(c,.45);
    d.hints.forEach(([k,n],i)=>{const x=this.colX(i);c.fillStyle='#fff';rr(c,x-55,160,110,140,16);c.fill();c.strokeStyle='#ffb3d6';c.lineWidth=4;c.stroke();
      const cols=n>4?3:2,rows=Math.ceil(n/cols),sz=n>4?.62:.8,gp=n>4?33:44;for(let j=0;j<n;j++){const cc=j%cols,rw=Math.floor(j/cols);drawIcon(c,k,x+(cc-(cols-1)/2)*gp,230+(rw-(rows-1)/2)*(n>4?36:46),sz);}
      drawRBtn(c,x,345,24,'up','#ff8cc6');c.fillStyle='#fffaf0';rr(c,x-40,380,80,86,14);c.fill();c.strokeStyle='#c8905a';c.lineWidth=5;c.stroke();otext(c,String(this.vals[i]),x,425,50,'#ff5fa2','#fff');drawRBtn(c,x,500,24,'down','#8a7af0');});
    const k=this.open?easeBack(Math.min(1,this.t*2)):0;c.save();c.translate(200,610);drawIcon(c,d.box||'chest',0,0,2.2);c.restore();
    c.save();c.translate(200,600-k*30);c.rotate(k*.5);drawIcon(c,'lock',0,0,1.3);c.restore();if(this.open)drawGlow(c,'#fff6a0',200,600,90,.8);},
  down(x,y){if(this.open)return;const d=this.d;d.hints.forEach((h,i)=>{const cx=this.colX(i);let ch=0;if(inC(x,y,cx,345,32))ch=1;if(inC(x,y,cx,500,32))ch=-1;
      if(inR(x,y,cx,230,110,140)){const w=wordOf(h[0]);say(w?w[0]:'','fu',w&&w[1]);}
      if(ch){this.vals[i]=(this.vals[i]+ch+10)%10;sfx('click');say(JA_NUM[this.vals[i]],'fu');
        if(this.vals.every((v,j)=>v===d.hints[j][1])){this.open=true;this.t=0;setTimeout(()=>{if(scene===this){sfx('unlock');confetti(40);say(d.done||'カチャッ！ あいた！','fu');}},400);finish(this,3);}}});},
  hint(){const d=this.d;const i=this.vals.findIndex((v,j)=>v!==d.hints[j][1]);if(i<0)return null;return IDLE>12?{x:this.colX(i),y:this.vals[i]<d.hints[i][1]?345:500}:{x:this.colX(i),y:230};},
};
// ---------- abc (アルファベット) ----------
STEP.abc={
  enter(){const d=this.d;this.bg=d.bg||'office';bgm('search');this.word=d.word;const letters=d.word.split('');const pool='ABCDEFGHIJKLMNOPRSTUW'.split('').filter(l=>!letters.includes(l));
    const tiles=shuffle([...letters,...shuffle(pool).slice(0,9-letters.length)]);this.tiles=tiles.map((l,i)=>({l,x:95+(i%3)*105,y:420+Math.floor(i/3)*92,used:false,sh:0}));this.i=0;this.t=0;
    INS={text:d.ins||`${d.word.split('').join(' ・ ')} の じゅんに タッチしてね`,who:'fu',t:0};say([[d.say||'この じゅんばんに タッチしてね','ja'],[d.word.split('').join(', '),'en']],'fu');},
  slotX(i){const n=this.word.length;return 200+(i-(n-1)/2)*62;},
  update(dt){this.t+=dt;for(const t of this.tiles)t.sh=Math.max(0,t.sh-dt);},
  draw(c){const d=this.d;drawBG(c,this.bg);dimContent(c,.4);
    c.fillStyle='rgba(255,255,255,.95)';rr(c,40,160,320,190,24);c.fill();c.strokeStyle='#8ad0ff';c.lineWidth=4;c.stroke();
    if(d.pic){const k=this.i>=this.word.length?easeBack(Math.min(1,this.t*2)):1;c.save();c.translate(200,222);c.scale(k,k);if(this.i>=this.word.length)drawIcon(c,d.pic,0,0,1.5);else{silhouette(c,s=>drawIcon(s,d.pic,0,0,3),0,0,200,'#c8d8e8');}c.restore();}
    for(let i=0;i<this.word.length;i++){const x=this.slotX(i);if(i<this.i)drawIcon(c,'l:'+this.word[i],x,305,1.05);else{c.strokeStyle=i===this.i?'#ffb03a':'#b8d0e8';c.lineWidth=3;c.setLineDash([5,4]);rr(c,x-24,281,48,48,10);c.stroke();c.setLineDash([]);txt(c,this.word[i],x,306,24,'rgba(90,130,200,.35)','center',900);}}
    for(const t of this.tiles){if(t.used)continue;const sh=t.sh>0?Math.sin(t.sh*40)*6:0;drawIcon(c,'l:'+t.l,t.x+sh,t.y,1.65);}},
  down(x,y){if(this.i>=this.word.length)return;for(const t of this.tiles){if(t.used||!inR(x,y,t.x,t.y,78,78))continue;
      if(t.l===this.word[this.i]){t.used=true;sfx('count',this.i+1);burst(t.x,t.y,10);say([[t.l,'en']],'fu');this.i++;
        if(this.i>=this.word.length){this.t=0;sfx('unlock');confetti(40);const d=this.d;setTimeout(()=>{if(scene===this)say([[this.word.toLowerCase(),'en'],[d.done||'','ja']],'fu');},500);finish(this,3.2);}}
      else{t.sh=.5;sfx('no');say([['つぎは','ja'],[this.word[this.i],'en']],'rk');}return;}},
  hint(){const t=this.tiles.find(t=>!t.used&&t.l===this.word[this.i]);return t?{x:t.x,y:t.y}:null;},
};
// ---------- credits (エンディング) ----------
STEP.credits={
  enter(){bgm('office');this.t=0;say('キュアたんてい ふーちゃん。 おしまい！ あそんでくれて ありがとう！','fu');confetti(80);},
  update(dt){this.t+=dt;if(this.t>4&&Math.random()<dt*2)confetti(6);},
  draw(c){drawBG(c,'title');const y0=740-this.t*42;const L=[['fu','ふーちゃん'],['rk','リッキー'],['kuro','クロニャン'],['witch','ドロドロン'],['neko',''],['inu',''],['panda',''],['kumadoc',''],['fuku',''],['kame',''],['fukuN',''],['arai',''],['kara',''],['pen',''],['usa','']];
    L.forEach(([id,nm],i)=>{const y=y0+i*150;if(y<-100||y>900)return;const x=i%2?270:130;drawCast(c,id,x,y+60,{emo:id==='witch'?'kind':'happy',cure:id==='fu'||id==='rk'});otext(c,nm||nameOf(id),i%2?110:290,y,20,'#fff','#ff5fa2','center',FONT);});
    const ey=y0+L.length*150+80;otext(c,'おしまい',200,Math.max(330,ey),56,'#fff','#ff5fa2');if(ey<=330){drawFutan(c,150,560,{s:2.2,cure:1,pose:'win'});drawRicky(c,250,540,{s:2,cure:1,happy:1});txt(c,'タッチで もどる',200,660,18,'#fff');}},
  down(){const ey=740-this.t*42+15*150+80;if(ey<=340||this.t>40){sfx('tap');finish(this,.1);}else this.t+=2;},
};

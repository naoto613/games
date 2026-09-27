// ================= ばばぬき / すごろく / えいかいわ =================
const CARD_TH=[['animals',['bear','rabbit','cat','dog','panda','pig','chick','hippo']],['fruits',['apple','banana','strawberry','cherry','grapes','tomato','carrot','corn']],['things',['rocket','train','crown','balloon','cake','icecream','flower','note']]];
function drawCard(c,x,y,w,h,k,face,sel,rot){if(!isFinite(x+y+w+h))return;c.save();c.translate(x,y);if(rot)c.rotate(rot);c.fillStyle='rgba(60,30,90,.18)';rr(c,-w/2+3,-h/2+5,w,h,12);c.fill();
  if(face){c.fillStyle=k==='ghost'?'#f4eeff':'#fff';rr(c,-w/2,-h/2,w,h,12);c.fill();c.strokeStyle=sel?'#ffb03a':k==='ghost'?'#b48cff':'#ffc0da';c.lineWidth=sel?5:3;c.stroke();if(k==='ghost')ghostCard(c,0,0,w/110);else drawThing(c,k,0,-2,w/95);}
  else{c.fillStyle=gfill(c,-10,-20,h,'#ff8cc0');rr(c,-w/2,-h/2,w,h,12);c.fill();c.strokeStyle='#fff';c.lineWidth=3;rr(c,-w/2+6,-h/2+6,w-12,h-12,8);c.stroke();c.fillStyle='rgba(255,255,255,.85)';star(c,0,0,w*.2,w*.09);c.fill();}c.restore();}
function ghostCard(c,x,y,s){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#fff';c.beginPath();c.arc(0,-8,30,Math.PI,0);c.lineTo(30,26);for(let i=0;i<4;i++){c.quadraticCurveTo(22-i*15,18,15-i*15,26);}c.lineTo(-30,26);c.closePath();c.fill();c.strokeStyle='#b48cff';c.lineWidth=3;c.stroke();c.fillStyle='#4a3a6a';circ(c,-10,-8,4);circ(c,10,-8,4);c.fillStyle='#ff8cc0';ell(c,0,4,6,4);c.restore();}
SCN.babanuki={bg:'#fff4ec',song:'play',
  enter(){const th=pick(CARD_TH);this.th=th[0];const kinds=shuffle(th[1]).slice(0,5);let deck=[];for(const k of kinds)deck.push({k},{k});deck.push({k:'ghost'});deck=shuffle(deck);
    const ops=shuffle(['bear','rabbit','cat','dog','panda','pig','hippo']).slice(0,2);this.pl=[{name:'ふーちゃん',hand:[],me:1},{name:WORDS[ops[0]][0],k:ops[0],hand:[]},{name:WORDS[ops[1]][0],k:ops[1],hand:[]}];
    deck.forEach((cd,i)=>this.pl[i%3].hand.push(cd));this.pile=[];this.rank=[];this.anim=null;this.fin=0;this.turn=0;this.msg=0;this.face=[0,0,0];this.miss=0;
    for(const p of this.pl){p.hand=this.discardPairs(p,true);}
    this.pl[0].hand=shuffle(this.pl[0].hand);this.wait=1.6;setTimeout(()=>{if(scene===this)say('ばばぬき！ おなじ えの カードは すてられるよ。 おばけの カードを さいごまで もっていたら まけ！ ひだりの こから 1まい ひいてね');},300);},
  discardPairs(p,quiet){const out=[];const cnt={};for(const cd of p.hand){if(cd.k==='ghost'){out.push(cd);continue;}const i=out.findIndex(q=>q.k===cd.k);if(i>=0){out.splice(i,1);this.pile.push(cd.k);if(!quiet){}}else out.push(cd);}return out;},
  alive(){return this.pl.filter(p=>p.hand.length>0);},
  nextTurn(){for(let s=1;s<=3;s++){const i=(this.turn+s)%3;if(this.pl[i].hand.length){this.turn=i;break;}}this.wait=this.turn===0?0:1.1;},
  target(i){for(let s=1;s<=3;s++){const j=(i+s)%3;if(this.pl[j].hand.length)return j;}return -1;},
  handPos(pi,i,n){if(pi===0){const sp=Math.min(90,500/Math.max(1,n));return{x:W/2-(n-1)*sp/2+i*sp,y:H*.8,r:(i-(n-1)/2)*.05};}const sp=Math.min(46,220/Math.max(1,n));const cx=pi===1?150:450,ty=this.turn===0&&this.target(0)===pi;return ty?{x:W/2-(n-1)*Math.min(96,520/n)/2+i*Math.min(96,520/n),y:H*.44,r:0}:{x:cx-(n-1)*sp/2+i*sp,y:H*.3,r:(i-(n-1)/2)*.08};},
  take(from,to,idx){const cd=this.pl[from].hand.splice(idx,1)[0];this.anim={cd,from,to,t:0,sp:this.handPos(from,idx,this.pl[from].hand.length+1)};sfx('whoosh');},
  land(){const a=this.anim;this.anim=null;const p=this.pl[a.to];const pair=p.hand.findIndex(q=>q.k===a.cd.k&&q.k!=='ghost');
    if(pair>=0){p.hand.splice(pair,1);this.pile.push(a.cd.k);this.pop={k:a.cd.k,t:0};sfx('ding');if(a.to===0){sayWord(a.cd.k,'ペア！');this.face[0]=1.5;}else{hush();speak(`${p.name}、 ペア！`);}}
    else{p.hand.push(a.cd);if(a.to===0)p.hand=shuffle(p.hand);if(a.cd.k==='ghost'){if(a.to===0){sfx('boing');say('あっ！ おばけを ひいちゃった！ だれかに ひいてもらおう');this.face[a.from]=2;}else if(a.from===0){sfx('giggle');say(`やった！ ${p.name}が おばけを ひいたよ`);this.face[0]=2;}}else if(a.to===0){sfx('pop');sayWord(a.cd.k);}}
    for(let i=0;i<3;i++){const q=this.pl[i];if(!q.hand.length&&!this.rank.includes(i)){this.rank.push(i);if(i===0){sfx('fanfare');confetti(60);say(`ふーちゃん あがり！ ${this.rank.length}ばん！`);}else{hush();speak(`${q.name} あがり！`);}}}
    const al=this.alive();if(al.length<=1){if(al.length===1)this.rank.push(this.pl.indexOf(al[0]));this.over=1;this.wait=99;const r=this.rank.indexOf(0)+1;setTimeout(()=>{if(scene!==this)return;if(r===3)say('おばけが のこっちゃった！ でも たのしかったね');this.fin=.01;},1500);return;}
    this.nextTurn();},
  update(dt){if(this.pop){this.pop.t+=dt;if(this.pop.t>1.4)this.pop=null;}for(let i=0;i<3;i++)if(this.face[i]>0)this.face[i]-=dt;
    if(this.anim){this.anim.t+=dt*2;if(this.anim.t>=1)this.land();}else if(!this.over){if(this.turn!==0){this.wait-=dt;if(this.wait<=0){const tg=this.target(this.turn);if(tg>=0){const h=this.pl[tg].hand;let idx=Math.floor(Math.random()*h.length);this.take(tg,this.turn,idx);}}}}
    if(this.fin>0){this.fin+=dt;if(this.fin>1&&this.fin<9){this.fin=9;const r=this.rank.indexOf(0)+1;celebrate('babanuki',r===1,r===1?3:r===2?2:1);}}},
  draw(c){c.fillStyle='#fff4ec';c.fillRect(-400,0,W+800,H);c.fillStyle='#8ad08a';rr(c,20,H*.2,W-40,H*.5,40);c.fill();c.fillStyle='#7ac47a';rr(c,34,H*.2+14,W-68,H*.5-28,32);c.fill();
    for(let i=1;i<3;i++){const p=this.pl[i],x=i===1?150:450;drawAnimal(c,p.k,x,H*.25,.62,{t:T+i,happy:this.face[i]>0});c.fillStyle='#fff';rr(c,x-60,H*.13,120,32,16);c.fill();c.fillStyle='#6a4a5a';c.font=`800 17px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(p.name,x,H*.13+16);
      if(this.rank.includes(i)){c.fillStyle='#ffd23a';rr(c,x-40,H*.18,80,28,14);c.fill();c.fillStyle='#8a5a00';c.fillText(`${this.rank.indexOf(i)+1}ばん`,x,H*.18+14);}if(this.turn===i&&!this.over){c.strokeStyle='#ffb03a';c.lineWidth=5;c.beginPath();c.arc(x,H*.2,70,0,TAU);c.stroke();}}
    const pc=this.pile.length;for(let i=0;i<Math.min(pc,14);i++)drawCard(c,W/2+((i*37)%60)-30,H*.58+((i*23)%20)-10,56,76,this.pile[pc-1-i],true,false,((i*53)%40-20)/100);
    if(this.pop){const k=easeOut(Math.min(1,this.pop.t*3));c.globalAlpha=Math.min(1,(1.4-this.pop.t)*3);drawCard(c,W/2-50,H*.48,90*k,120*k,this.pop.k,true);drawCard(c,W/2+50,H*.48,90*k,120*k,this.pop.k,true);c.globalAlpha=1;}
    for(let pi=1;pi<3;pi++){const h=this.pl[pi].hand,big=this.turn===0&&this.target(0)===pi&&!this.over&&!this.anim;h.forEach((cd,i)=>{const q=this.handPos(pi,i,h.length);drawCard(c,q.x,q.y,big?84:44,big?116:62,cd.k,false,false,q.r);});}
    const hh=this.pl[0].hand;hh.forEach((cd,i)=>{const q=this.handPos(0,i,hh.length);drawCard(c,q.x,q.y,84,116,cd.k,true,false,q.r);});
    if(this.anim){const a=this.anim,k=easeOut(Math.min(1,a.t));const to=a.to===0?{x:W/2,y:H*.8}:{x:a.to===1?150:450,y:H*.3};drawCard(c,lerp(a.sp.x,to.x,k),lerp(a.sp.y,to.y,k)-Math.sin(k*Math.PI)*60,70,96,a.cd.k,a.to===0&&k>.5,false,k*TAU*.5);}
    drawFuka(c,70,H*.98,{outfit:outfit(),t:T,sc:1.4,cheer:this.face[0]>0&&this.face[0]<1.6});
    if(this.turn===0&&!this.over&&!this.anim){c.fillStyle='rgba(255,255,255,.93)';rr(c,W/2-150,H*.6,300,44,22);c.fill();c.fillStyle='#ff5f9a';c.font=`800 20px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('カードを 1まい えらんでね',W/2,H*.6+22);}},
  down(x,y){if(this.turn!==0||this.anim||this.over)return;const tg=this.target(0);if(tg<0)return;const h=this.pl[tg].hand;for(let i=h.length-1;i>=0;i--){const q=this.handPos(tg,i,h.length);if(Math.abs(x-q.x)<44&&Math.abs(y-q.y)<60){this.take(tg,0,i);return;}}},
  hint(){if(this.turn!==0||this.anim||this.over)return null;const tg=this.target(0);if(tg<0)return null;const q=this.handPos(tg,0,this.pl[tg].hand.length);return{x:q.x,y:q.y};},
  hintText(){return 'うえの カードから 1まい えらんでね';}};

// ---------------- サイコロすごろく ----------------
const SG_TH=[{n:'もりの すごろく',bg:'#bff0b0',sq:['#ffe6a8','#d8f4c8'],deco:'tree'},{n:'うみの すごろく',bg:'#bfe8ff',sq:['#fff6d8','#d8f0ff'],deco:'fish'},{n:'おかしの すごろく',bg:'#ffe0ee',sq:['#fff0f6','#ffe6b0'],deco:'cake'}];
SCN.sugoroku={bg:'#bff0b0',song:'play',
  enter(){this.th=pick(SG_TH);this.N=26;const ev=[];const pool=['go2','go2','back1','back2','rest','star','star','star','quiz','quiz','quiz','go1','jump'];const idx=shuffle([...Array(this.N-4).keys()].map(i=>i+2)).slice(0,pool.length);this.ev={};shuffle(pool).forEach((e,i)=>this.ev[idx[i]]=e);
    const ops=shuffle(['bear','rabbit','cat','dog','panda','pig','chick']).slice(0,2);this.ps=[{me:1,pos:0,x:0,y:0,rest:0,stars:0},{k:ops[0],pos:0,rest:0,stars:0},{k:ops[1],pos:0,rest:0,stars:0}];this.ps.forEach((p,i)=>{const q=this.sq(0);p.x=q.x;p.y=q.y;});
    this.turn=0;this.die=1;this.roll=0;this.hop=null;this.quiz=null;this.rank=[];this.fin=0;this.wait=0;this.miss=0;this.decoK=this.th.deco;setTimeout(()=>{if(scene===this)say(`${this.th.n}！ サイコロを タッチして ふってね`);},300);},
  sq(i){const cols=5,row=Math.floor(i/cols),k=i%cols,col=row%2?cols-1-k:k;const top=H*.24,bot=H*.84;const rows=Math.ceil(this.N/cols);return{x:90+col*105,y:bot-row*((bot-top)/(rows-1))};},
  update(dt){const p=this.ps[this.turn];
    if(this.roll>0){this.roll-=dt;if(Math.random()<dt*20)this.die=1+Math.floor(Math.random()*6);if(this.roll<=0){this.roll=0;this.die=this.rv;sfx('ding');hush();speak(NUMJ[this.rv]+'！');this.hop={p,left:this.rv,dir:1,t:0,cnt:0};}}
    if(this.hop){const h=this.hop;h.t+=dt;if(h.t>.42){h.t=0;const np=clamp(h.p.pos+h.dir,0,this.N-1);h.p.pos=np;h.left--;h.cnt++;sfx('boing');if(h.p.me){hush();speak(NUMJ[h.cnt]||String(h.cnt));}
        if(h.left<=0||np===this.N-1){this.hop=null;this.landOn(h.p,!!h.back);}}const q=this.sq(h.p.pos);h.p.x+=(q.x-h.p.x)*Math.min(1,dt*14);h.p.y+=(q.y-h.p.y)*Math.min(1,dt*14);}
    for(const pp of this.ps){if(this.hop&&this.hop.p===pp)continue;const q=this.sq(pp.pos);const off=(this.ps.indexOf(pp)-1)*18;pp.x+=(q.x+off-pp.x)*Math.min(1,dt*8);pp.y+=(q.y-pp.y)*Math.min(1,dt*8);}
    if(!this.roll&&!this.hop&&!this.quiz&&!this.over&&this.turn!==0){this.wait-=dt;if(this.wait<=0)this.doRoll();}
    if(this.fin>0){this.fin+=dt;if(this.fin>1&&this.fin<9){this.fin=9;const r=this.rank.indexOf(0)+1;celebrate('sugoroku',r===1,r===1?3:r===2?2:1);}}},
  doRoll(){const p=this.ps[this.turn];if(p.rest){p.rest=0;if(p.me)say('ふーちゃんは おやすみ…');else{hush();speak(`${WORDS[p.k][0]}は おやすみ`);}this.next();return;}this.rv=1+Math.floor(Math.random()*6);this.roll=.9;sfx('gacha');},
  landOn(p,noEv){if(p.pos>=this.N-1){if(!this.rank.includes(this.ps.indexOf(p))){this.rank.push(this.ps.indexOf(p));sfx('fanfare');confetti(p.me?80:20);if(p.me)say(`ゴール！ ${this.rank.length}ばん！`);else{hush();speak(`${WORDS[p.k][0]} ゴール！`);}}
      if(p.me||this.ps.filter(q=>q.pos<this.N-1).length<=1){for(let i=0;i<3;i++)if(!this.rank.includes(i))this.rank.push(i);this.rank=this.rank.slice(0,3);this.over=1;setTimeout(()=>{if(scene===this)this.fin=.01;},1400);return;}this.next();return;}
    const e=noEv?null:this.ev[p.pos];const nm=p.me?'ふーちゃん':WORDS[p.k][0];
    if(e==='go1'||e==='go2'||e==='jump'){const n=e==='jump'?3:e==='go2'?2:1;say(`${nm}、 ${NUMJ[n]}マス すすむ！`);this.hop={p,left:n,dir:1,t:-.5,cnt:0};return;}
    if(e==='back1'||e==='back2'){const n=e==='back2'?2:1;say(`${nm}、 ${NUMJ[n]}マス もどる…`);this.hop={p,left:n,dir:-1,t:-.5,cnt:0,back:1};return;}
    if(e==='rest'){p.rest=1;say(`${nm}、 つぎは いっかい おやすみ`);}
    if(e==='star'){p.stars++;sfx('coin');if(p.me){say('ほしを ゲット！');burst(p.x,p.y-40,14,'star');}}
    if(e==='quiz'&&p.me){this.mkQuiz();return;}
    this.next();},
  mkQuiz(){const t=Math.random()<.5?'en':'num';if(t==='en'){const ks=shuffle(['apple','banana','cat','dog','rabbit','bear','fish','egg','cake','flower','balloon','milk'].filter(k=>WORDS[k])).slice(0,3);const a=ks[0];this.quiz={t,k:a,opts:shuffle(ks).map(k=>({k,txt:WORDS[k][1],ok:k===a})),sh:-1};say(`クイズ！ 「${WORDS[a][0]}」は えいごで どれ？`);}
    else{const n=2+Math.floor(Math.random()*5),k=pick(['apple','strawberry','starcandy','duck']);let o=[n,n+1,n-1].filter(v=>v>0);while(o.length<3)o.push(n+2);this.quiz={t,k,n,opts:shuffle(o).map(v=>({v,txt:String(v),ok:v===n})),sh:-1};say(`クイズ！ ${WORDS[k]?WORDS[k][0]:''}は いくつ？`);}},
  next(){this.turn=(this.turn+1)%3;let g=0;while(this.ps[this.turn].pos>=this.N-1&&g++<3)this.turn=(this.turn+1)%3;this.wait=1;if(this.turn===0&&!this.over)setTimeout(()=>{if(scene===this&&this.turn===0&&!this.roll&&!this.hop)say('ふーちゃんの ばん！ サイコロを タッチ');},600);},
  draw(c){c.fillStyle=this.th.bg;c.fillRect(-400,0,W+800,H);const th=this.th;for(let i=0;i<10;i++){const x=(i*137)%W,y=H*.2+(i*97)%(H*.7);c.globalAlpha=.35;drawThing(c,th.deco==='tree'?'flower':th.deco,x,y,.8);c.globalAlpha=1;}
    c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=26;c.lineJoin='round';c.beginPath();for(let i=0;i<this.N;i++){const q=this.sq(i);i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y);}c.stroke();
    for(let i=0;i<this.N;i++){const q=this.sq(i),e=this.ev[i];c.fillStyle='rgba(60,40,90,.15)';rr(c,q.x-40,q.y-34,84,72,16);c.fill();c.fillStyle=i===0?'#8ad0ff':i===this.N-1?'#ffd23a':th.sq[i%2];rr(c,q.x-42,q.y-38,84,72,16);c.fill();c.strokeStyle='#fff';c.lineWidth=3;c.stroke();
      c.textAlign='center';c.textBaseline='middle';if(i===0||i===this.N-1){c.fillStyle='#fff';c.font=`800 18px ${FONT}`;c.fillText(i?'ゴール':'スタート',q.x,q.y);continue;}
      if(e){const lb={go1:'+1',go2:'+2',jump:'+3',back1:'-1',back2:'-2',rest:'zz',star:'★',quiz:'?'}[e];c.fillStyle={go1:'#3aa860',go2:'#3aa860',jump:'#3aa860',back1:'#e0506a',back2:'#e0506a',rest:'#8a7aaa',star:'#e8a000',quiz:'#3a8ad8'}[e];c.font=`28px ${POP}`;c.fillText(lb,q.x,q.y+2);}else{c.fillStyle='rgba(120,100,140,.35)';c.font=`800 16px ${FONT}`;c.fillText(i,q.x,q.y);}}
    this.ps.slice().reverse().forEach(p=>{const bob=this.hop&&this.hop.p===p?-Math.abs(Math.sin(this.hop.t/.42*Math.PI))*26:0;if(p.me)drawFuka(c,p.x,p.y+22+bob,{outfit:outfit(),t:T,sc:.95,cheer:this.over&&this.rank[0]===0});else drawAnimal(c,p.k,p.x,p.y+26+bob,.36,{t:T,happy:1});});
    c.fillStyle='rgba(255,255,255,.93)';rr(c,20,112,W-40,60,28);c.fill();c.textAlign='center';c.textBaseline='middle';this.ps.forEach((p,i)=>{const x=110+i*190;if(this.turn===i){c.fillStyle='#ffe0a0';rr(c,x-84,118,168,48,22);c.fill();}if(p.me)drawFuka(c,x-50,160,{outfit:outfit(),t:0,sc:.5});else drawAnimal(c,p.k,x-50,163,.24,{t:0});c.fillStyle='#8a6a1a';c.font=`800 18px ${FONT}`;c.fillText(`★${p.stars}  ${Math.min(p.pos,this.N-1)}`,x+20,142);});
    const dx=W-90,dy=H-80,s=this.roll>0?1+Math.sin(T*30)*.08:1;c.save();c.translate(dx,dy);c.rotate(this.roll>0?Math.sin(T*25)*.3:0);c.scale(s,s);c.fillStyle='rgba(60,40,90,.2)';rr(c,-44,-38,92,92,20);c.fill();c.fillStyle='#fff';rr(c,-46,-46,92,92,20);c.fill();c.strokeStyle='#ff8cc0';c.lineWidth=4;c.stroke();
    const P={1:[[0,0]],2:[[-1,-1],[1,1]],3:[[-1,-1],[0,0],[1,1]],4:[[-1,-1],[1,-1],[-1,1],[1,1]],5:[[-1,-1],[1,-1],[0,0],[-1,1],[1,1]],6:[[-1,-1],[1,-1],[-1,0],[1,0],[-1,1],[1,1]]}[this.die];c.fillStyle=this.die===1?'#ff4d5a':'#3a3050';for(const [a,b] of P)circ(c,a*22,b*22,this.die===1?14:9);c.restore();
    if(this.turn===0&&!this.roll&&!this.hop&&!this.quiz&&!this.over){c.fillStyle='#ff5f9a';c.font=`800 18px ${FONT}`;c.fillText('タッチ！',dx,dy-66);}
    if(this.quiz){const q=this.quiz;c.fillStyle='rgba(60,40,90,.4)';c.fillRect(-400,0,W+800,H);c.fillStyle='#fff';rr(c,40,H*.28,W-80,H*.46,30);c.fill();c.fillStyle='#3a8ad8';c.font=`30px ${POP}`;c.fillText('クイズ',W/2,H*.28+40);
      if(q.t==='en'){drawThing(c,q.k,W/2,H*.4,1.6);}else{for(let i=0;i<q.n;i++)drawItem(c,q.k,W/2-(Math.min(q.n,4)-1)*35+(i%4)*70,H*.37+Math.floor(i/4)*60,.8);}
      q.opts.forEach((o,i)=>{const x=W/2-170+i*170,y=H*.62;const sh=q.sh===i?Math.sin(T*40)*5:0;c.fillStyle=o.done?'#e8fbe8':'#fff6fa';rr(c,x-72+sh,y-36,144,72,24);c.fill();c.strokeStyle='#ff8cc0';c.lineWidth=4;c.stroke();c.fillStyle='#5a3a5a';c.font=`800 ${q.t==='en'?22:34}px ${FONT}`;c.fillText(o.txt,x+sh,y+2,130);});}},
  down(x,y){if(this.quiz){const q=this.quiz;q.opts.forEach((o,i)=>{const bx=W/2-170+i*170;if(Math.abs(x-bx)<72&&Math.abs(y-H*.62)<40){if(q.t==='en'){hush();speak(o.txt,'en');}if(o.ok){o.done=1;sfx('fanfare');this.ps[0].stars+=1;setTimeout(()=>{if(scene!==this)return;say('せいかい！ ほし ゲット！ もう 1マス すすもう');this.quiz=null;this.hop={p:this.ps[0],left:1,dir:1,t:-.4,cnt:0,back:1};},900);}else{q.sh=i;this.miss++;sfx('no');setTimeout(()=>{if(this.quiz)this.quiz.sh=-1;},400);}}});return;}
    if(this.turn===0&&!this.roll&&!this.hop&&!this.over&&hitC(x,y,W-90,H-80,70))this.doRoll();},
  hint(){if(this.quiz){const i=this.quiz.opts.findIndex(o=>o.ok);return idle>12?{x:W/2-170+i*170,y:H*.62}:null;}return this.turn===0&&!this.roll&&!this.hop&&!this.over?{x:W-90,y:H-80}:null;},
  hintText(){return this.quiz?'こたえを タッチしてね':'サイコロを タッチしてね';}};

// ---------------- えいかいわ ----------------
const EIK=[['あさ、 おともだちに あったよ','bear','Good morning!','Good morning!',['Good night!','Thank you!'],'おはよう','sunmoon'],
 ['プレゼントを もらったよ','rabbit','This is for you!','Thank you!',["I'm sorry.",'Good morning!'],'ありがとう','ribbon'],
 ['ぶつかっちゃった！','pig','Ouch!',"I'm sorry.",['Happy birthday!',"Let's play!"],'ごめんなさい',null],
 ['よる、 ねる じかんだよ','cat','Good night!','Good night!',['Good morning!','Here you are.'],'おやすみなさい','sunmoon'],
 ['はじめて あった おともだち','panda',"Hi! I'm Panda.",'Nice to meet you!',['Goodbye!',"I'm hungry."],'はじめまして',null],
 ['かえる じかん。 バイバイ！','dog','See you!','Goodbye!',['Good morning!','Thank you!'],'さようなら',null],
 ['おなまえは？ と きかれたよ','chick',"What's your name?",'My name is Fu-chan.',["I'm hungry.","It's red."],'わたしの なまえは ふーちゃん',null],
 ['ケーキを たべたよ','hippo','How is it?',"It's yummy!",["It's cold.",'Good night!'],'おいしい！','cake'],
 ['いっしょに あそびたいな','rabbit','Hello!',"Let's play!",["I'm sorry.",'Goodbye!'],'あそぼう！','balloon'],
 ['おともだちの おたんじょうび！','bear',"It's my birthday!",'Happy birthday!',['Good night!','Ouch!'],'おたんじょうび おめでとう','cake'],
 ['げんき？ と きかれたよ','dog','How are you?',"I'm fine, thank you!",["I'm hungry.",'See you!'],'げんきだよ、 ありがとう',null],
 ['りんごを ちょうだいって','pig','Can I have one?','Here you are.',['Good morning!',"It's my birthday!"],'はい、 どうぞ','apple'],
 ['おなかが ぺこぺこ','cat','Are you hungry?',"Yes, I'm hungry!",["No, I'm sleepy.",'Happy birthday!'],'うん、 おなかが すいた','bread'],
 ['すきな いろを きかれたよ','panda','What color do you like?','I like pink!',['I like apples!',"I'm fine."],'ピンクが すき','palette'],
 ['「ありがとう」って いわれたよ','rabbit','Thank you!',"You're welcome!",["I'm sorry.",'Nice to meet you!'],'どういたしまして',null],
 ['なんさい？ と きかれたよ','bear','How old are you?',"I'm four!",['I like pink!','Goodbye!'],'4さいだよ',null],
 ['かわいい ドレスを みつけたよ','cat','Look!',"It's cute!",["It's scary!",'Good night!'],'かわいい！','dress'],
 ['でんわが なったよ','dog','Ring, ring!','Hello!',['Goodbye!','Thank you!'],'もしもし',null],
 ['おもい にもつ。 てつだって ほしい','chick','What happened?','Help me, please!',["You're welcome!",'Good night!'],'てつだって ください','toybox']];
SCN.eikaiwa={bg:'#eaf4ff',song:'fuwa',
  enter(){this.qs=shuffle(EIK.slice()).slice(0,5);this.qi=0;this.miss=0;this.fin=0;this.newQ();},
  newQ(){const q=this.q=this.qs[this.qi];this.opts=shuffle([q[3],...q[4]]).map(t=>({t,ok:t===q[3],sh:0}));this.sel=-1;this.done=0;this.heard=0;setTimeout(()=>{if(scene===this&&this.q===q)this.play();},500);},
  play(){const q=this.q;hush();speak(q[0]);speak(q[2],'en',1.1);},
  update(dt){for(const o of this.opts)if(o.sh>0)o.sh-=dt;if(this.done>0){this.done+=dt;if(this.done>4.2){this.qi++;if(this.qi>=this.qs.length){if(!this.fin)this.fin=.01;this.done=-1;}else this.newQ();}}
    if(this.fin>0){this.fin+=dt;if(this.fin>.8&&this.fin<9){this.fin=9;celebrate('eikaiwa',this.miss===0,this.miss<=1?3:this.miss<=3?2:1);}}},
  draw(c){const q=this.q;c.fillStyle='#eaf4ff';c.fillRect(-400,0,W+800,H);c.fillStyle='#bfe0a8';c.fillRect(-400,H*.52,W+800,H);c.fillStyle='#d8ecff';for(let i=0;i<6;i++)cloud(c,(i*131)%W,160+(i*47)%120,.4,false);
    c.fillStyle='#fff';rr(c,24,112,W-48,70,26);c.fill();c.strokeStyle='#8ac0ff';c.lineWidth=4;c.stroke();c.fillStyle='#3a5a8a';c.font=`800 24px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(q[0],W/2,147,W-80);
    drawFuka(c,150,H*.6,{outfit:outfit(),t:T,sc:2.2,cheer:this.done>0,wave:this.done>0});drawAnimal(c,q[1],450,H*.62,.95,{t:T,happy:this.done>0});if(q[6])drawThing(c,q[6],300,H*.5,1.1);
    c.fillStyle='#fff';rr(c,330,H*.26,250,86,26);c.fill();c.strokeStyle='#ffb3d6';c.lineWidth=4;c.stroke();c.fillStyle='#fff';c.beginPath();c.moveTo(430,H*.26+84);c.lineTo(450,H*.26+110);c.lineTo(470,H*.26+84);c.fill();c.fillStyle='#c0306a';c.font=`800 24px ${FONT}`;c.fillText(q[2],455,H*.26+36,230);c.font=`16px ${FONT}`;c.fillStyle='#8a8aa8';c.fillText('🔊 タッチで もういちど',455,H*.26+66);
    c.fillStyle=this.done>0?'#fff6d0':'#fff';rr(c,20,H*.3,250,86,26);c.fill();c.strokeStyle='#ffd23a';c.lineWidth=4;c.stroke();c.fillStyle='#5a3a5a';c.font=`800 ${this.done>0?22:40}px ${FONT}`;c.fillText(this.done>0?q[3]:'？',145,H*.3+36,230);if(this.done>0){c.font=`800 17px ${FONT}`;c.fillStyle='#ff5f9a';c.fillText(q[5],145,H*.3+68,230);}
    this.opts.forEach((o,i)=>{const y=H*.72+i*92,sel=this.sel===i,sh=o.sh>0?Math.sin(o.sh*40)*6:0;c.fillStyle=sel?'#fff0d0':'#fff';rr(c,50+sh,y-38,W-100,76,30);c.fill();c.strokeStyle=sel?'#ffb03a':'#b8d4f0';c.lineWidth=sel?6:4;c.stroke();c.fillStyle='#8ac0ff';circ(c,96+sh,y,22);c.fillStyle='#fff';c.font=`800 20px ${FONT}`;c.fillText('🔊',96+sh,y+1);
      c.fillStyle='#2a4a7a';c.font=`800 26px ${FONT}`;c.textAlign='left';c.fillText(o.t,132+sh,y+1,W-200);c.textAlign='center';});
    if(this.sel>=0&&!this.done){c.fillStyle='#ff5f9a';c.font=`800 18px ${FONT}`;c.fillText('もういちど タッチで けってい！',W/2,H*.72-62);}stepDots(c,5,this.qi,H*.2+10);},
  down(x,y){if(this.done)return;if(x>330&&y>H*.26&&y<H*.26+90){this.play();return;}
    this.opts.forEach((o,i)=>{const oy=H*.72+i*92;if(Math.abs(y-oy)<40&&x>50&&x<W-50){hush();speak(o.t,'en');if(this.sel!==i){this.sel=i;sfx('tap');return;}
      if(o.ok){this.done=.01;sfx('fanfare');confetti(40);const q=this.q;setTimeout(()=>{if(scene===this){speak(`「${q[3]}」は 「${q[5]}」 だよ`);}},900);}else{o.sh=.5;this.miss++;sfx('no');setTimeout(()=>{if(scene===this)say('ちがうみたい。 ほかのも きいてみよう');},700);this.sel=-1;}}});},
  hint(){if(this.done)return null;const i=this.opts.findIndex(o=>o.ok);if(idle<14)return{x:W/2,y:H*.72};return{x:W/2,y:H*.72+i*92};},
  hintText(){return 'えいごを きいて、 ぴったりの ことばを えらんでね';}};
Object.assign(SPECIAL_THING,{
  ghostcard:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#f4eeff';rr(c,-24,-32,48,64,8);c.fill();c.strokeStyle='#b48cff';c.lineWidth=3;c.stroke();ghostCard(c,0,2,.6);c.restore();},
  cardfan:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);[-.4,0,.4].forEach((r,i)=>{c.save();c.rotate(r);c.fillStyle=['#ff8cc0','#fff','#8ac0ff'][i];rr(c,-16,-40,32,46,6);c.fill();c.strokeStyle='#e0c0d8';c.lineWidth=2;c.stroke();c.restore();});c.fillStyle='#ff5f6f';heartP(c,0,-20,8);c.fill();c.restore();},
  dice:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);c.rotate(-.15);c.fillStyle='#fff';rr(c,-26,-26,52,52,12);c.fill();c.strokeStyle='#ff8cc0';c.lineWidth=3;c.stroke();c.fillStyle='#3a3050';for(const [a,b] of [[-1,-1],[1,1],[0,0],[1,-1],[-1,1]])circ(c,a*13,b*13,5);c.restore();},
  sgboard:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#bff0b0';rr(c,-32,-28,64,56,10);c.fill();c.strokeStyle='#fff';c.lineWidth=7;c.beginPath();c.moveTo(-22,18);c.lineTo(20,18);c.lineTo(20,0);c.lineTo(-20,0);c.lineTo(-20,-18);c.lineTo(22,-18);c.stroke();c.fillStyle='#ffd23a';star(c,22,-18,7,3);c.fill();c.fillStyle='#ff5f9a';circ(c,-22,18,5);c.restore();},
  pawn:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#ff6fa8';circ(c,0,-16,11);c.beginPath();c.moveTo(-8,-8);c.lineTo(8,-8);c.lineTo(16,20);c.lineTo(-16,20);c.closePath();c.fill();c.fillStyle='#fff';ell(c,-4,-20,3,4);c.restore();},
  hibubble:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#fff';rr(c,-32,-24,64,40,16);c.fill();c.beginPath();c.moveTo(-10,14);c.lineTo(-18,28);c.lineTo(2,14);c.fill();c.strokeStyle='#5aa8ff';c.lineWidth=3;rr(c,-32,-24,64,40,16);c.stroke();c.fillStyle='#3a8ad8';c.font=`800 20px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('Hi!',0,-3);c.restore();},
  abcbook:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#5aa8ff';rr(c,-28,-24,56,48,6);c.fill();c.fillStyle='#fff';rr(c,-24,-20,24,40,3);c.fill();rr(c,0,-20,24,40,3);c.fill();c.fillStyle='#ff5f9a';c.font=`800 14px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('AB',-12,0);c.fillStyle='#3a8ad8';c.fillText('C',12,0);c.restore();},
  onimask:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#ffd23a';for(const sd of[-1,1]){c.beginPath();c.moveTo(sd*10,-20);c.lineTo(sd*20,-38);c.lineTo(sd*22,-16);c.fill();}c.fillStyle='#ff6f6f';circ(c,0,0,24);c.fillStyle='#fff';circ(c,-9,-4,6);circ(c,9,-4,6);c.fillStyle='#3a3050';circ(c,-9,-4,3);circ(c,9,-4,3);c.fillStyle='#fff';c.fillRect(-10,9,20,6);c.restore();},
  sneaker:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#5aa8ff';c.beginPath();c.moveTo(-28,8);c.quadraticCurveTo(-26,-16,-6,-16);c.lineTo(4,-4);c.quadraticCurveTo(24,0,30,8);c.closePath();c.fill();c.fillStyle='#fff';rr(c,-30,6,62,10,5);c.fill();c.strokeStyle='#fff';c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.moveTo(-10+i*6,-12+i*3);c.lineTo(-2+i*6,-8+i*3);c.stroke();}c.restore();}});
Object.assign(WORDS,{ghostcard:['おばけカード','joker'],cardfan:['トランプ','cards'],dice:['サイコロ','dice'],sgboard:['すごろく','board game'],pawn:['コマ','game piece'],hibubble:['こんにちは','hello'],abcbook:['えいごの ほん','English book'],onimask:['おに','ogre'],sneaker:['くつ','shoes']});

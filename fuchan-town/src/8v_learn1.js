// ================= ひらがな つり (hiragana fishing) =================
const MOJI_W=[['cat','ねこ'],['dog','いぬ'],['bear','くま'],['pig','ぶた'],['hippo','かば'],['octopus','たこ'],['crab','かに'],['turtle','かめ'],['horse','うま'],['strawberry','いちご'],['apple','りんご'],['egg','たまご'],['fish','さかな'],['rabbit','うさぎ'],['duck','あひる'],['panda','ぱんだ'],['candle','ろうそく'],['tomato','とまと']];
const MHIRA='あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわ';
SCN.mojitsuri={bg:'#bfe8ff',song:'play',
  enter(){this.fin=0;this.miss=0;this.words=shuffle(MOJI_W.slice()).slice(0,3);this.wi=0;this.hook=null;this.bucket=0;this.newWord();},
  rod(){return{x:150,y:H*.3};},
  slot(i){const n=this.w[1].length;return{x:W/2+60-(n-1)*50+i*100,y:210};},
  newWord(){const w=this.w=this.words[this.wi];this.idx=0;this.wdone=0;this.fish=[];for(let i=0;i<7;i++)this.fish.push(this.mkFish(i));this.ensure();
    setTimeout(()=>{if(scene===this&&this.w===w){hush();speak(`「${w[1]}」を つくろう！`);speak(`「${w[1][0]}」の おさかなを つってね`);bub={text:`「${w[1][0]}」の おさかなを タッチ！`,t:0,life:4};}},this.wi?600:300);},
  mkFish(i){const row=i%4;return{x:rand(60,540),y:H*.47+row*H*.12,v:rand(35,70)*(Math.random()<.5?-1:1),ch:MHIRA[Math.floor(Math.random()*MHIRA.length)],col:pick(['#ff8a5a','#ffb03a','#ff6fb8','#5ab8ff','#b48cff','#6cd08a']),sh:0,run:0,t:rand(0,5)};},
  need(){return this.w[1][this.idx];},
  ensure(){const n=this.need();if(!n)return;const fr=this.fish.filter(f=>!f.hooked);if(!fr.some(f=>f.ch===n))pick(fr).ch=n;const n2=this.w[1][this.idx+1];if(n2&&!fr.some(f=>f.ch===n2)&&Math.random()<.7){const f=pick(fr.filter(f=>f.ch!==n));if(f)f.ch=n2;}},
  update(dt){for(const f of this.fish){if(f.hooked)continue;f.t+=dt;const sp=f.run>0?5:1;f.run=Math.max(0,f.run-dt);f.sh=Math.max(0,f.sh-dt);f.x+=f.v*dt*sp;if(f.x<-60){f.x=W+50;}if(f.x>W+60){f.x=-50;}}
    const h=this.hook;if(h){h.t+=dt;const R=this.rod();if(h.ph==='down'&&h.t>.35){if(h.f.ch===this.need()){h.ph='up';h.t=0;h.f.hooked=true;sfx('splash');drops(h.f.x,h.f.y,8);}else{h.ph='back';h.t=0;h.f.run=1.2;h.f.sh=.5;this.miss++;sfx('no');hush();speak(`それは「${h.f.ch}」だよ。 「${this.need()}」を さがそう`);}}
      else if(h.ph==='up'){const k=Math.min(1,h.t/.6);h.f.x=lerp(h.x0,R.x+40,k);h.f.y=lerp(h.y0,R.y+20,k);if(k>=1){h.ph='fly';h.t=0;}}
      else if(h.ph==='fly'){const s=this.slot(this.idx),k=Math.min(1,h.t/.45);h.f.x=lerp(R.x+40,s.x,easeOut(k));h.f.y=lerp(R.y+20,s.y,easeOut(k))-Math.sin(k*Math.PI)*80;if(k>=1){const ch=h.f.ch;this.fish=this.fish.filter(q=>q!==h.f);this.fish.push(this.mkFish(Math.floor(rand(0,4))));this.idx++;this.bucket++;this.hook=null;sfx('ding');burst(s.x,s.y,10,'star');hush();speak(ch);
          if(this.idx>=this.w[1].length){this.wdone=.01;sfx('fanfare');const w=this.w;setTimeout(()=>{if(scene===this)sayPair(w[1],WORDS[w[0]]?WORDS[w[0]][1]:'',w[0]);},500);}else{this.ensure();setTimeout(()=>{if(scene===this&&!this.wdone){speak(`つぎは「${this.need()}」`);}},500);}}}
      else if(h.ph==='back'&&h.t>.35)this.hook=null;}
    if(this.wdone>0){this.wdone+=dt;if(this.wdone>2.6){this.wi++;if(this.wi>=this.words.length){if(!this.fin)this.fin=.01;}else this.newWord();}}
    if(this.fin>0){this.fin+=dt;if(this.fin>1.2&&this.fin<9){this.fin=9;celebrate('mojitsuri',this.miss<=2);}}},
  draw(c){const g=c.createLinearGradient(0,0,0,H*.38);g.addColorStop(0,'#8fd8ff');g.addColorStop(1,'#e6f8ff');c.fillStyle=g;c.fillRect(-400,0,W+800,H*.38);sun(c,520,90,30,T*.3);
    const wg=c.createLinearGradient(0,H*.36,0,H);wg.addColorStop(0,'#5ec0ee');wg.addColorStop(1,'#2a78c8');c.fillStyle=wg;c.fillRect(-400,H*.36,W+800,H);c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=3;for(let i=0;i<8;i++){const y=H*.42+i*H*.075;c.beginPath();for(let x=-20;x<=W+20;x+=20)c.lineTo(x,y+Math.sin(x/40+T*2+i)*4);c.stroke();}
    c.fillStyle='#b07a4a';rr(c,-40,H*.34,220,26,8);c.fill();c.fillRect(20,H*.34,14,60);c.fillRect(140,H*.34,14,60);
    for(const f of this.fish){if(f.hooked&&this.hook&&this.hook.ph==='fly')continue;lfish(c,f.x+(f.sh>0?Math.sin(f.sh*50)*5:0),f.y+Math.sin(f.t*2)*6,.95,f.col,f.ch,f.v,f.t);}
    const R=this.rod();drawFuka(c,90,H*.345,{outfit:outfit({acc:'cap'}),t:T,sc:1.7,cheer:this.wdone>0});c.strokeStyle='#8a5a3a';c.lineWidth=6;c.lineCap='round';c.beginPath();c.moveTo(110,H*.29);c.lineTo(R.x+40,R.y-50);c.stroke();
    let hx=R.x+40,hy=R.y+40;const h=this.hook;if(h){if(h.ph==='down'||h.ph==='back'){const k=h.ph==='down'?Math.min(1,h.t/.35):1-Math.min(1,h.t/.35);hx=lerp(R.x+40,h.x0,k);hy=lerp(R.y+40,h.y0,k);}else if(h.ph==='up'){hx=h.f.x;hy=h.f.y-20;}}
    c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=2;c.beginPath();c.moveTo(R.x+40,R.y-50);c.lineTo(hx,hy);c.stroke();c.fillStyle='#ff5f6f';circ(c,hx,hy-10,8);c.strokeStyle='#8a8aa0';c.lineWidth=3;c.beginPath();c.arc(hx,hy+2,7,0,Math.PI);c.stroke();
    if(h&&h.ph==='fly')lfish(c,h.f.x,h.f.y,.8,h.f.col,h.f.ch,1,T);
    drawRikki(c,540,H*.345,{sc:1.3,t:T,clap:this.wdone>0?1:0});SPECIAL_THING.bucket(c,470,H*.325,.9);if(this.bucket){c.fillStyle='#fff';c.font=`800 18px ${FONT}`;c.textAlign='center';c.fillText('×'+this.bucket,470,H*.325+40);}
    // word card
    const w=this.w;c.fillStyle='rgba(255,255,255,.95)';rr(c,24,120,W-48,180,28);c.fill();c.strokeStyle='#ffb3d6';c.lineWidth=5;c.stroke();const bj=this.wdone>0?Math.abs(Math.sin(this.wdone*8))*12:0;drawThing(c,w[0],96,212-bj,1.5);
    for(let i=0;i<w[1].length;i++){const s=this.slot(i),got=i<this.idx,cur=i===this.idx;c.fillStyle=got?'#fff0f6':cur?'#fffbe0':'#f4f4f8';rr(c,s.x-42,s.y-42,84,84,18);c.fill();c.strokeStyle=cur?'#ffc93c':got?'#ff8cc0':'#d8d0e0';c.lineWidth=cur?5+Math.sin(T*6)*1.5:3;c.stroke();
      c.font=`800 50px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillStyle=got?'#ff4d8d':'rgba(160,150,180,.35)';c.fillText(w[1][i],s.x,s.y+3);}
    stepDots(c,3,this.wi,H*.35-8);},
  down(x,y){if(this.hook||this.wdone>0||this.fin)return;let best=null,bd=70;for(const f of this.fish){const d=Math.hypot(x-f.x,y-f.y);if(d<bd){bd=d;best=f;}}
    if(best){this.hook={f:best,t:0,ph:'down',x0:best.x,y0:best.y};sfx('whoosh');}else if(y>H*.38){ring(x,y,'rgba(255,255,255,.8)');}},
  hint(){if(this.hook||this.wdone>0)return null;const f=this.fish.find(f=>f.ch===this.need()&&f.x>40&&f.x<560);return f?{x:f.x,y:f.y}:null;},
  hintText(){return `「${this.need()||''}」の おさかなを タッチしてね`;}};

// ================= かずの でんしゃ (counting) =================
SCN.kazu={bg:'#dff4ff',song:'play',
  enter(){this.fin=0;this.miss=0;this.st=0;this.stations=[[1,2,3],[2,3,4],[3,4,5]];this.newSt();},
  carX(i){return 220+i*150+this.tx;},carY(){return H*.4;},
  newSt(){const ns=shuffle(this.stations[this.st].slice());this.cars=ns.map(n=>({n,got:[],ok:false,pop:0}));this.tx=-800;this.ph='in';const tot=ns.reduce((a,b)=>a+b,0)+2;const ks=shuffle(['bear','rabbit','cat','dog','panda','pig','chick','hippo']);
    this.ani=[];for(let i=0;i<tot;i++){const x=60+(i%7)*80,y=H*.66+Math.floor(i/7)*H*.13;this.ani.push({k:ks[i%8],hx:x,hy:y,x,y,held:false,car:-1,t:rand(0,5)});}
    sfx('honk');setTimeout(()=>{if(scene===this){hush();speak(this.st?'つぎの えき！':'かずの でんしゃ！');speak('すうじの かずだけ どうぶつを のせてね');bub={text:'すうじの かずだけ のせてね',t:0,life:3.5};}},900);},
  update(dt){if(this.ph==='in'){this.tx=Math.min(0,this.tx+dt*900);if(this.tx>=0)this.ph='play';}
    if(this.ph==='go'){this.gt+=dt;if(this.gt>1)this.tx+=dt*(300+this.gt*500);if(this.tx>900){this.st++;if(this.st>=3){this.ph='end';if(!this.fin)this.fin=.01;}else this.newSt();}}
    for(const a of this.ani){a.t+=dt;if(!a.held&&a.car<0){a.x+=(a.hx-a.x)*Math.min(1,dt*10);a.y+=(a.hy-a.y)*Math.min(1,dt*10);}}for(const c of this.cars)if(c.pop>0)c.pop-=dt;
    if(this.fin>0){this.fin+=dt;if(this.fin>1.2&&this.fin<9){this.fin=9;celebrate('kazu',this.miss<=1);}}},
  seat(ci,k){const n=this.cars[ci].n;return{x:this.carX(ci)-(n-1)*13+k*26,y:this.carY()-30};},
  draw(c){skyBg(c,'#9ad8ff','#e6f8ff',H*.5);cloud(c,120,120,.6,true);cloud(c,450,170,.45,true);c.fillStyle='#9ee07a';c.fillRect(-400,H*.5,W+800,H);
    c.fillStyle='#c8b8a8';c.fillRect(-400,H*.47,W+800,18);c.fillStyle='#8a6a4a';for(let x=-20;x<W+40;x+=40)c.fillRect(x-(this.tx%40+40)%40*0,H*.47+18,24,10);c.fillStyle='#a0a0b0';c.fillRect(-400,H*.475,W+800,5);
    c.fillStyle='#f0e0c8';rr(c,-20,H*.58,W+40,H*.36,20);c.fill();c.fillStyle='#e0ccb0';c.fillRect(-20,H*.58,W+40,12);c.fillStyle='#ffd23a';c.fillRect(-20,H*.6,W+40,6);
    const cy=this.carY(),tx=this.tx;// loco
    const lx=70+tx;c.fillStyle='#ff5f6f';rr(c,lx-60,cy-70,110,100,14);c.fill();c.fillStyle='#ffd8de';rr(c,lx-44,cy-58,50,40,8);c.fill();c.fillStyle='#3a3050';rr(c,lx+10,cy-110,26,46,6);c.fill();c.fillStyle='#ffd23a';circ(c,lx+48,cy-10,12);
    for(const wx of[-34,26])drawWheel(c,lx+wx,cy+34);if(this.ph==='go'||this.ph==='in')for(let i=0;i<2;i++){const t2=(T*1.5+i/2)%1;c.fillStyle=`rgba(255,255,255,${.8-t2*.8})`;circ(c,lx+23-t2*40,cy-120-t2*60,12+t2*16);}
    this.cars.forEach((cr,i)=>{const x=this.carX(i),pp=cr.pop>0?Math.sin(cr.pop*20)*4:0;c.fillStyle=cr.ok?'#6cd08a':['#5aa8ff','#ffb03a','#b48cff'][i];rr(c,x-68,cy-60+pp,136,90,14);c.fill();c.fillStyle='rgba(255,255,255,.85)';rr(c,x-60,cy-52+pp,120,44,10);c.fill();
      for(let k=0;k<cr.n;k++){const s=this.seat(i,k);c.strokeStyle='rgba(90,80,120,.35)';c.lineWidth=2;c.setLineDash([4,4]);c.beginPath();c.arc(s.x,s.y+pp,11,0,TAU);c.stroke();c.setLineDash([]);}
      cr.got.forEach((a,k)=>{const s=this.seat(i,k);drawAnimal(c,a.k,s.x,s.y+14+pp,.32,{t:T+k,happy:1});});
      drawWheel(c,x-40,cy+34);drawWheel(c,x+40,cy+34);c.fillStyle='#3a3050';c.fillRect(x-76,cy+10,10,6);
      numBadge(c,cr.n,x,cy-96+pp,30,cr.ok?'#6cd08a':'#ff6fa8');c.fillStyle='#fff';c.font=`800 16px ${FONT}`;c.textAlign='center';c.fillText(NUMJ[cr.n],x,cy+6+pp);
      if(cr.ok){c.fillStyle='#ffd23a';star(c,x+56,cy-80,12,5);c.fill();}});
    for(const a of this.ani){if(a.car>=0)continue;drawAnimal(c,a.k,a.x,a.y+(a.held?-10:0),a.held?.75:.62,{t:a.t,happy:a.held});}
    drawFuka(c,540,H*.93,{outfit:outfit({acc:'cap'}),t:T,sc:1.5,point:1});stepDots(c,3,this.st,H*.2);},
  down(x,y){if(this.ph!=='play')return;for(const a of this.ani.slice().reverse()){if(a.car<0&&Math.hypot(x-a.x,y-(a.y-30))<46){this.held=a;a.held=true;sfx('pop');hush();speak(WORDS[a.k]?WORDS[a.k][0]:'');return;}}
    this.cars.forEach((cr,i)=>{if(Math.abs(x-this.carX(i))<68&&Math.abs(y-this.carY())<70&&cr.got.length){hush();speak(cr.got.map((_,k)=>NUMJ[k+1]).join('、 '));cr.pop=.3;}});},
  move(x,y){const a=this.held;if(a){a.x=x;a.y=y+30;}},
  up(x,y){const a=this.held;if(!a)return;this.held=null;a.held=false;const i=this.cars.findIndex((cr,i)=>Math.abs(x-this.carX(i))<75&&y>this.carY()-140&&y<this.carY()+60);if(i<0)return;const cr=this.cars[i];
    if(cr.got.length>=cr.n){this.miss++;sfx('no');cr.pop=.4;say(`${cr.n}の くるまは もう いっぱい！`);return;}
    cr.got.push(a);a.car=i;cr.pop=.2;sfx('boing');hush();speak(NUMJ[cr.got.length]);
    if(cr.got.length===cr.n){cr.ok=true;sfx('ding');setTimeout(()=>{if(scene===this){speak(`${NUMJ[cr.n]}！ ぴったり！`);speak(NUMEN[cr.n],'en');}},350);burst(this.carX(i),this.carY()-60,12,'star');
      if(this.cars.every(q=>q.ok)){this.ph='go';this.gt=0;setTimeout(()=>{if(scene===this){sfx('honk');say('しゅっぱつ しんこう！');}},900);}}},
  hint(){if(this.ph!=='play')return null;const i=this.cars.findIndex(q=>!q.ok);const a=this.ani.find(a=>a.car<0);if(i<0||!a)return null;return{x:a.x,y:a.y-30,x2:this.carX(i),y2:this.carY()-20};},
  hintText(){return 'どうぶつを ひっぱって、 すうじの かずだけ のせよう';}};
function drawWheel(c,x,y){c.fillStyle='#3a3050';circ(c,x,y,16);c.fillStyle='#c8c8d8';circ(c,x,y,7);}

// ================= りんごの たしざん =================
SCN.tashizan={bg:'#eaf8d8',song:'play',
  enter(){this.fin=0;this.miss=0;this.qi=0;const P=[[1,1],[2,1],[1,2],[2,2],[3,1],[1,3],[3,2],[2,3]];this.qs=[pick(P.slice(0,3)),pick(P.slice(1,5)),pick(P.slice(3,8)),pick(P.slice(4,8))];this.newQ();},
  newQ(){const [a,b]=this.qs[this.qi];this.a=a;this.b=b;this.L=[];this.R=[];this.step='a';this.opts=null;this.flying=[];this.cnt=[];this.eq=0;
    this.apples=[...Array(7)].map((_,i)=>{const an=i/7*TAU+.3,r=i%2?95:140;return{x:300+Math.cos(an)*r,y:H*.24+Math.sin(an)*r*.6,st:'tree',sh:0};});
    setTimeout(()=>{if(scene===this)say(`りんごを ${a}こ、 ひだりの おさらに いれよう`);},400);},
  plate(side){return{x:side?440:160,y:H*.6};},
  pos(side,k,n){const p=this.plate(side);const cols=Math.min(n,3);return{x:p.x-(cols-1)*28+(k%3)*56,y:p.y-24-Math.floor(k/3)*44};},
  update(dt){for(const f of this.flying){f.t+=dt*2.6;}this.flying=this.flying.filter(f=>{if(f.t>=1){f.a.st=f.side?'R':'L';return false;}return true;});for(const a of this.apples)if(a.sh>0)a.sh-=dt;if(this.eq>0){this.eq+=dt;if(this.eq>2.6){this.qi++;if(this.qi>=this.qs.length){if(!this.fin)this.fin=.01;this.eq=-1;}else this.newQ();}}
    if(this.fin>0){this.fin+=dt;if(this.fin>1.2&&this.fin<9){this.fin=9;celebrate('tashizan',this.miss<=1);}}},
  draw(c){skyBg(c,'#a8e0ff','#eaf8ff',H*.5);c.fillStyle='#b8e890';c.fillRect(-400,H*.44,W+800,H);
    c.fillStyle='#a8704a';rr(c,280,H*.3,40,H*.16,10);c.fill();c.fillStyle='#58c078';for(const [dx,dy,r] of [[-120,20,90],[120,20,90],[0,-40,120],[-60,40,90],[60,40,90]]){circ(c,300+dx,H*.24+dy,r);}c.fillStyle='#6cd08a';circ(c,260,H*.2,70);
    for(const a of this.apples){if(a.st!=='tree')continue;drawItem(c,'apple',a.x+(a.sh>0?Math.sin(a.sh*40)*4:0),a.y,.9);}
    for(const side of[0,1]){const p=this.plate(side);c.fillStyle='rgba(90,60,40,.15)';ell(c,p.x,p.y+14,130,26);c.fillStyle='#fff';ell(c,p.x,p.y,125,32);c.fillStyle='#f0f0f8';ell(c,p.x,p.y,95,22);const act=(this.step==='a'&&!side)||(this.step==='b'&&side);if(act){c.strokeStyle='#ffc93c';c.lineWidth=5+Math.sin(T*6)*2;c.beginPath();c.ellipse(p.x,p.y,130,36,0,0,TAU);c.stroke();}}
    const draws=[];this.apples.forEach(a=>{if(a.st==='L')draws.push([a,0]);if(a.st==='R')draws.push([a,1]);});for(const side of[0,1]){const arr=this.apples.filter(a=>a.st===(side?'R':'L'));arr.forEach((a,k)=>{const q=this.pos(side,k,arr.length);drawItem(c,side?'apple':'apple',q.x,q.y,.9);const ci=this.cnt.indexOf(a);if(ci>=0)numBadge(c,ci+1,q.x+22,q.y-26,15,'#5aa8ff');});}
    for(const f of this.flying){const q=this.pos(f.side,f.k,f.side?this.b:this.a);const k=easeOut(Math.min(1,f.t));drawItem(c,'apple',lerp(f.a.x,q.x,k),lerp(f.a.y,q.y,k)-Math.sin(k*Math.PI)*80,.9);}
    c.fillStyle='#ff6fa8';c.font=`70px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.fillText('+',300,H*.59);
    const Lc=this.apples.filter(a=>a.st==='L').length,Rc=this.apples.filter(a=>a.st==='R').length;numBadge(c,Lc,160,H*.68,24,Lc===this.a?'#6cd08a':'#ffb03a');numBadge(c,Rc,440,H*.68,24,Rc===this.b&&this.step!=='b'?'#6cd08a':'#ffb03a');
    const ey=H*.78;c.fillStyle='rgba(255,255,255,.9)';rr(c,40,ey-44,W-80,88,30);c.fill();c.strokeStyle='#ffd08a';c.lineWidth=4;c.stroke();c.fillStyle='#5a3a3a';c.font=`54px ${POP}`;
    const s=this.a+this.b;c.fillText(`${this.a} + ${this.b} = ${this.eq>0?s:'?'}`,W/2,ey+2);if(this.eq>0){c.fillStyle='#ff4d8d';c.fillText(s,W/2+150,ey+2);}
    if(this.opts){this.opts.forEach((o,i)=>{const x=150+i*150,y=H*.9;const sh=o.sh>0?Math.sin(o.sh*40)*6:0;c.fillStyle=o.ok&&this.eq>0?'#6cd08a':'#fff';circ(c,x+sh,y,46);c.strokeStyle='#ffb03a';c.lineWidth=5;c.beginPath();c.arc(x+sh,y,46,0,TAU);c.stroke();c.fillStyle='#ff6fa8';c.font=`50px ${POP}`;c.fillText(o.n,x+sh,y+3);});}
    else drawFuka(c,80,H*.95,{outfit:outfit(),t:T,sc:1.5,point:1});
    stepDots(c,4,this.qi,H*.5-20);},
  down(x,y){if(this.eq)return;if(this.step==='a'||this.step==='b'){const side=this.step==='a'?0:1,need=side?this.b:this.a;for(const a of this.apples){if(a.st==='tree'&&Math.hypot(x-a.x,y-a.y)<40){const cur=this.apples.filter(q=>q.st===(side?'R':'L')).length+this.flying.filter(f=>f.side===side).length;if(cur>=need){a.sh=.4;sfx('no');say(`${need}こで いいよ！`);return;}
        a.st='fly';this.flying.push({a,side,k:cur,t:0});sfx('pop');hush();speak(NUMJ[cur+1]);if(cur+1===need){setTimeout(()=>{if(scene!==this)return;if(side===0){this.step='b';say(`${NUMJ[this.a]}こ！ こんどは みぎの おさらに ${this.b}こ いれよう`);}else{this.step='sum';const s=this.a+this.b;let o=[s,s+1,Math.max(1,s-1)===s?s+2:s-1];o=[...new Set(o)];while(o.length<3)o.push(s+o.length);this.opts=shuffle(o).map(n=>({n,ok:n===s,sh:0}));say(`${NUMJ[this.a]} たす ${NUMJ[this.b]} は いくつ？ りんごを タッチして かぞえてね`);}},500);}return;}}return;}
    if(this.step==='sum'){for(const side of[0,1]){const arr=this.apples.filter(a=>a.st===(side?'R':'L'));arr.forEach((a,k)=>{const q=this.pos(side,k,arr.length);if(Math.hypot(x-q.x,y-q.y)<34&&!this.cnt.includes(a)){this.cnt.push(a);sfx('tick');hush();speak(NUMJ[this.cnt.length]);}});}
      if(this.opts)this.opts.forEach((o,i)=>{if(hitC(x,y,150+i*150,H*.9,50)){if(o.ok){this.eq=.01;sfx('fanfare');confetti(40);hush();speak(`${NUMJ[this.a]} たす ${NUMJ[this.b]} は ${NUMJ[o.n]}！`);speak(`${NUMEN[this.a]} plus ${NUMEN[this.b]} is ${NUMEN[o.n]}`,'en');}else{o.sh=.5;this.miss++;sfx('no');this.cnt=[];say('もういちど かぞえてみよう！ りんごを タッチしてね');}}});}},
  hint(){if(this.eq)return null;if(this.step!=='sum'){const a=this.apples.find(a=>a.st==='tree');return a?{x:a.x,y:a.y}:null;}const s=this.a+this.b;if(this.cnt.length<s){const all=[0,1].flatMap(side=>{const arr=this.apples.filter(a=>a.st===(side?'R':'L'));return arr.map((a,k)=>({a,q:this.pos(side,k,arr.length)}));});const nx=all.find(z=>!this.cnt.includes(z.a));return nx?nx.q:null;}const i=this.opts.findIndex(o=>o.ok);return{x:150+i*150,y:H*.9};},
  hintText(){return this.step==='sum'?'りんごを かぞえて こたえを タッチ':'きの りんごを タッチしてね';}};

// ================= かたちの くに (shapes) =================
const KPICS=[{k:'house',ja:'おうち',en:'house',sl:[['sq',300,.56,100],['tri',300,.43,105],['circle',480,.26,42],['rect',230,.6,30]]},
  {k:'rocket',ja:'ロケット',en:'rocket',sl:[['rect',300,.52,70],['tri',300,.345,62],['circle',300,.48,26],['tri',205,.62,40],['tri',395,.62,40]]},
  {k:'cat',ja:'ねこ',en:'cat',sl:[['circle',300,.52,120],['tri',215,.4,44],['tri',385,.4,44],['heart',300,.56,20]]}];
SCN.katachi={bg:'#fff4f0',song:'play',
  enter(){this.fin=0;this.miss=0;this.stage=0;this.done=0;this.setup();},
  setup(){this.pieces=[];this.slots=[];this.held=null;this.done=0;
    if(this.stage===0){const ks=['circle','tri','sq','star','heart'];ks.forEach((k,i)=>this.slots.push({k,x:90+i*105,y:H*.42,s:40,got:false}));shuffle(ks.slice()).forEach((k,i)=>this.addPiece(k,90+i*105,H*.76,40));
      setTimeout(()=>{if(scene===this)say('かたちはめ！ おなじ かたちの あなに いれよう');},400);}
    else{const P=KPICS[this.stage-1];P.sl.forEach(([k,x,yr,s])=>this.slots.push({k,x,y:H*yr,s,got:false}));const ks=shuffle(P.sl.map(q=>q[0]).concat(pick(['star','heart','circle'].filter(k=>!P.sl.some(q=>q[0]===k))||['star'])));
      ks.forEach((k,i)=>{const n=ks.length,x=W/2-(n-1)*(Math.min(110,520/n)/2)+i*Math.min(110,520/n);this.addPiece(k,x,H*.84,Math.min(36,500/n/3))});setTimeout(()=>{if(scene===this)say(`かたちを ならべて ${P.ja}を つくろう！`);},400);}},
  addPiece(k,x,y,s){this.pieces.push({k,hx:x,hy:y,x,y,s,ps:s,held:false,slot:null,col:SHP[k][2]});},
  update(dt){for(const p of this.pieces){if(p.slot){p.x+=(p.slot.x-p.x)*Math.min(1,dt*14);p.y+=(p.slot.y-p.y)*Math.min(1,dt*14);p.s+=(p.slot.s*(this.stage?1:.8)-p.s)*Math.min(1,dt*10);}else if(!p.held){p.x+=(p.hx-p.x)*Math.min(1,dt*12);p.y+=(p.hy-p.y)*Math.min(1,dt*12);p.s+=(p.ps-p.s)*Math.min(1,dt*10);}}
    if(this.done>0){this.done+=dt;if(this.done>3){if(this.stage>=KPICS.length){if(!this.fin)this.fin=.01;this.done=-1;}else{this.stage++;this.setup();}}}
    if(this.fin>0){this.fin+=dt;if(this.fin>1&&this.fin<9){this.fin=9;celebrate('katachi',this.miss<=2);}}},
  draw(c){c.fillStyle='#fff4f0';c.fillRect(-400,0,W+800,H);c.fillStyle='#ffe4dc';for(let y=0;y<H;y+=60)for(let x=(y/60%2)*30;x<W;x+=60)circ(c,x,y,5);
    if(this.stage===0){c.fillStyle='#ffb03a';rr(c,24,H*.32,W-48,H*.2,26);c.fill();c.fillStyle='#ffd08a';rr(c,34,H*.33,W-68,H*.18,20);c.fill();for(const s of this.slots)drawShape(c,s.k,s.x,s.y,s.s,null,'hole');}
    else{const P=KPICS[this.stage-1],k=this.done>0?this.done:0;c.fillStyle='rgba(255,255,255,.9)';rr(c,30,H*.2,W-60,H*.56,30);c.fill();c.strokeStyle='#ffd0e0';c.lineWidth=4;c.stroke();
      c.save();if(P.k==='rocket'&&k>0){c.translate(0,-Math.max(0,k-.8)*k*260);}
      if(P.k==='rocket'&&k>.8){for(let i=0;i<6;i++){c.fillStyle=['#ffd23a','#ff9a3a','#ff5f6f'][i%3];circ(c,300+rand(-20,20),H*.66+i*14,14-i);}}
      for(const s of this.slots)if(!s.got)drawShape(c,s.k,s.x,s.y,s.s,'#b0a0c0','slot');for(const p of this.pieces)if(p.slot)drawShape(c,p.k,p.x,p.y,p.s,p.col);
      if(P.k==='cat'&&k>0){c.fillStyle='#3a3050';circ(c,255,H*.49,10);circ(c,345,H*.49,10);c.strokeStyle='#3a3050';c.lineWidth=3;for(const sd of[-1,1])for(const dy of[-8,8]){c.beginPath();c.moveTo(300+sd*40,H*.57+dy/2);c.lineTo(300+sd*100,H*.57+dy);c.stroke();}}
      if(P.k==='house'&&k>0){for(let i=0;i<3;i++){const t2=(T*.8+i/3)%1;c.fillStyle=`rgba(200,200,210,${.8-t2*.8})`;circ(c,350,H*.33-t2*70,10+t2*14);}}
      c.restore();if(this.done>0){c.fillStyle='#ff4d8d';c.font=`48px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.fillText(P.ja,W/2,H*.25);}}
    for(const p of this.pieces){if(p.slot&&this.stage>0)continue;if(p.slot&&this.stage===0){c.globalAlpha=.9;drawShape(c,p.k,p.x,p.y,p.s,p.col);c.globalAlpha=1;continue;}c.fillStyle='rgba(90,40,110,.12)';ell(c,p.x,p.y+p.s+8,p.s*.9,8);drawShape(c,p.k,p.x,p.y-(p.held?10:0),p.s*(p.held?1.15:1),p.col);}
    drawFuka(c,70,H*.97,{outfit:outfit(),t:T,sc:1.3,cheer:this.done>0});stepDots(c,4,this.stage,128);},
  down(x,y){if(this.done)return;for(const p of this.pieces.slice().reverse())if(!p.slot&&Math.hypot(x-p.x,y-p.y)<p.s+18){this.held=p;p.held=true;sfx('pop');hush();speak(SHP[p.k][0]);return;}},
  move(x,y){if(this.held){this.held.x=x;this.held.y=y;}},
  up(x,y){const p=this.held;if(!p)return;this.held=null;p.held=false;let best=null,bd=90;for(const s of this.slots){if(s.got)continue;const d=Math.hypot(x-s.x,y-s.y);if(d<bd){bd=d;best=s;}}
    if(!best)return;if(best.k!==p.k){this.miss++;sfx('no');say(`${SHP[p.k][0]}は ここじゃ ないみたい`);return;}
    best.got=true;p.slot=best;sfx('snap');burst(best.x,best.y,10,'star');sayPair(SHP[p.k][0],SHP[p.k][1]);
    if(this.slots.every(s=>s.got)){this.done=.01;sfx('fanfare');confetti(50);const P=KPICS[this.stage-1];setTimeout(()=>{if(scene!==this)return;if(P){sayPair(P.ja,P.en);if(P.k==='cat')speak('にゃ〜ん');if(P.k==='rocket')sfx('launch');}else say('ぜんぶ はいった！ すごい！');},600);}},
  hint(){if(this.done)return null;for(const s of this.slots){if(s.got)continue;const p=this.pieces.find(p=>!p.slot&&p.k===s.k);if(p)return{x:p.hx,y:p.hy,x2:s.x,y2:s.y};}return null;},
  hintText(){return 'おなじ かたちの ところに いれてね';}};

// ================= いろの まほう (colors) =================
const IRO={red:['あか','red','#ff4d5a'],orange:['オレンジ','orange','#ff9a3a'],yellow:['きいろ','yellow','#ffd23a'],green:['みどり','green','#4cc060'],blue:['あお','blue','#3a8aff'],purple:['むらさき','purple','#9a5ae8'],pink:['ピンク','pink','#ff8cc0']};
const MIXES=[['red','yellow','orange','carrot'],['blue','yellow','green','bamboo'],['red','blue','purple','grapes']];
function mixCol(a,b,k){const pa=parseInt(a.slice(1),16),pb=parseInt(b.slice(1),16);const ch=s=>[(s>>16)&255,(s>>8)&255,s&255];const A=ch(pa),B=ch(pb);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*k).toString(16).padStart(2,'0')).join('');}
SCN.iro={bg:'#fff8f0',song:'play',
  enter(){this.fin=0;this.miss=0;this.ph='mix';this.mi=0;this.rdone=0;this.newMix();},
  newMix(){const m=MIXES[this.mi];this.m=m;this.poured=[false,false];this.stir=0;this.mdone=0;this.pour=null;setTimeout(()=>{if(scene===this)say(`${IRO[m[0]][0]}と ${IRO[m[1]][0]}を まぜると なにいろ？ えのぐを タッチしてね`);},400);},
  bowlC(){const m=this.m;if(!this.poured[0]&&!this.poured[1])return'#ffffff';if(this.poured[0]!==this.poured[1])return IRO[this.poured[0]?m[0]:m[1]][2];return mixCol(mixCol(IRO[m[0]][2],IRO[m[1]][2],.5),IRO[m[2]][2],Math.min(1,this.stir));},
  newBalloons(){this.ph='balloon';this.bl=[];const ks=['red','blue','yellow','green','pink','purple','orange'];for(let i=0;i<6;i++){const b=this.mkB(ks[i],i);b.y=H*.35+((i*2)%6)*H*.1;this.bl.push(b);}this.targets=shuffle(['red','blue','yellow','green','pink']).slice(0,5);this.ti=0;this.askB();},
  mkB(k,i){return{k,x:70+i*92+rand(-10,10),y:H+rand(40,300),v:rand(40,60),sh:0,pop:0};},
  askB(){const k=this.targets[this.ti];if(!k)return;hush();speak(IRO[k][1]+'!','en');speak(IRO[k][1]+'!','en');bub={text:`「${IRO[k][1]}」の ふうせんは どれ？`,t:0,life:3.5};if(!this.bl.some(b=>b.k===k&&!b.pop)){const b=pick(this.bl);b.k=k;}},
  newRainbow(){this.ph='rainbow';this.ri=0;this.rb=['red','orange','yellow','green','blue','purple'];this.cray=shuffle(this.rb.slice()).map((k,i)=>({k,x:70+i*92,y:H*.82,hx:70+i*92,hy:H*.82,used:false}));this.fill=[0,0,0,0,0,0];say('にじを つくろう！ ひかっている ところの いろの クレヨンを タッチ');},
  update(dt){if(this.pour){this.pour.t+=dt;if(this.pour.t>.8){this.poured[this.pour.i]=true;this.pour=null;if(this.poured.every(Boolean))say('ぐるぐる まぜまぜ しよう！ おさらを ゆびで まわしてね');}}
    if(this.ph==='mix'&&this.mdone>0){this.mdone+=dt;if(this.mdone>3){this.mi++;if(this.mi>=MIXES.length)this.newBalloons();else this.newMix();}}
    if(this.ph==='balloon'){for(const b of this.bl){if(b.pop>0){b.pop+=dt;continue;}b.y-=b.v*dt;if(b.sh>0)b.sh-=dt;if(b.y<H*.2){b.y=H+rand(20,120);}}this.bl=this.bl.filter(b=>b.pop<.5);while(this.bl.length<6){const ks=Object.keys(IRO);this.bl.push(this.mkB(pick(ks),Math.floor(rand(0,6))));}}
    if(this.ph==='rainbow'){for(let i=0;i<6;i++){if(i<this.ri)this.fill[i]=Math.min(1,this.fill[i]+dt*2);}if(this.ri>=6&&!this.fin){this.rdone=(this.rdone||0)+dt;if(this.rdone>2.5)this.fin=.01;}}
    if(this.fin>0){this.fin+=dt;if(this.fin>.8&&this.fin<9){this.fin=9;celebrate('iro',this.miss<=2);}}},
  draw(c){c.fillStyle='#fff8f0';c.fillRect(-400,0,W+800,H);c.fillStyle='#ffeede';for(let x=0;x<W;x+=50)c.fillRect(x,0,25,H);
    if(this.ph==='mix'){const m=this.m;c.fillStyle='rgba(255,255,255,.95)';rr(c,160,H*.14,280,H*.22,24);c.fill();c.strokeStyle='#ffd0e0';c.lineWidth=4;c.stroke();
      const k=this.mdone>0?Math.min(1,this.mdone*1.5):0;c.globalAlpha=1-k;c.drawImage(silhouette(m[3],'#c8c0d0'),300-90,H*.25-90,180,180);c.globalAlpha=k;drawThing(c,m[3],300,H*.25,1.55);c.globalAlpha=1;
      const bc=this.bowlC(),bx=300,by=H*.55;c.fillStyle='rgba(90,60,40,.15)';ell(c,bx,by+70,160,24);c.fillStyle='#fff';c.beginPath();c.ellipse(bx,by,160,60,0,0,Math.PI);c.lineTo(bx-160,by);c.fill();c.fillStyle='#e8e8f0';rr(c,bx-160,by-8,320,16,8);c.fill();
      c.fillStyle=bc;c.beginPath();c.ellipse(bx,by,140,40,0,0,TAU);c.fill();if(this.poured.every(Boolean)&&this.mdone<=0){c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=5;c.beginPath();c.arc(bx,by,70,T*4,T*4+2.5);c.stroke();}
      if(this.mdone>0){c.fillStyle=IRO[m[2]][2];c.font=`46px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.lineWidth=8;c.strokeStyle='#fff';c.strokeText(IRO[m[2]][0],W/2,H*.43);c.fillText(IRO[m[2]][0],W/2,H*.43);}
      [0,1].forEach(i=>{const k2=IRO[m[i]],x=i?470:130,y=H*.8;let ang=0,px=x,py=y;if(this.pour&&this.pour.i===i){const t=this.pour.t;ang=(i?-1:1)*Math.min(1,t*3)*1.2;px=lerp(x,i?380:220,Math.min(1,t*3));py=lerp(y,H*.46,Math.min(1,t*3));if(t>.3){c.fillStyle=k2[2];rr(c,(i?px-50:px+30),py-10,14,H*.55-py,7);c.fill();}}
        if(this.poured[i]&&!(this.pour&&this.pour.i===i))c.globalAlpha=.35;c.save();c.translate(px,py);c.rotate(ang);c.fillStyle='#fff';rr(c,-48,-50,96,100,16);c.fill();c.strokeStyle=k2[2];c.lineWidth=6;c.stroke();c.fillStyle=k2[2];rr(c,-40,-30,80,72,12);c.fill();c.fillStyle='#fff';c.font=`800 22px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(k2[0],0,6);c.restore();c.globalAlpha=1;});
      stepDots(c,3,this.mi,H*.1);}
    else if(this.ph==='balloon'){skyBg(c,'#8fd8ff','#e6f8ff',H);cloud(c,120,200,.6,true);cloud(c,470,320,.5,true);for(const b of this.bl){const col=IRO[b.k][2],x=b.x+(b.sh>0?Math.sin(b.sh*40)*8:0);if(b.pop>0){c.fillStyle=col;for(let i=0;i<8;i++){const a=i/8*TAU;circ(c,x+Math.cos(a)*b.pop*120,b.y+Math.sin(a)*b.pop*120,8*(1-b.pop*2));}continue;}
        c.strokeStyle='#8a7a9a';c.lineWidth=2;c.beginPath();c.moveTo(x,b.y+44);c.quadraticCurveTo(x+10,b.y+80,x,b.y+110);c.stroke();c.fillStyle=gfill(c,x-10,b.y-10,44,col);c.beginPath();c.ellipse(x,b.y,38,46,0,0,TAU);c.fill();c.fillStyle=col;c.beginPath();c.moveTo(x-7,b.y+46);c.lineTo(x+7,b.y+46);c.lineTo(x,b.y+36);c.fill();c.fillStyle='rgba(255,255,255,.5)';ell(c,x-12,b.y-16,9,13);}
      const k=this.targets[this.ti];if(k){c.fillStyle='rgba(255,255,255,.95)';rr(c,W/2-150,H*.13,300,70,35);c.fill();c.strokeStyle='#5aa8ff';c.lineWidth=4;c.stroke();c.fillStyle='#3a6ab8';c.font=`800 36px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(IRO[k][1]+'!',W/2,H*.13+36);}
      stepDots(c,5,this.ti,H*.1-10);}
    else{skyBg(c,'#a8e0ff','#f0faff',H*.7);const cx=300,cy=H*.6;this.rb.forEach((k,i)=>{const r=260-i*34;c.lineWidth=32;c.strokeStyle='rgba(255,255,255,.6)';c.beginPath();c.arc(cx,cy,r,Math.PI,TAU);c.stroke();if(this.fill[i]>0){c.strokeStyle=IRO[k][2];c.beginPath();c.arc(cx,cy,r,Math.PI,Math.PI+Math.PI*this.fill[i]);c.stroke();}
        if(i===this.ri){c.strokeStyle=`rgba(255,210,60,${.5+Math.sin(T*6)*.3})`;c.lineWidth=6;c.setLineDash([12,8]);c.beginPath();c.arc(cx,cy,r+18,Math.PI,TAU);c.arc(cx,cy,r-18,TAU,Math.PI,true);c.closePath();c.stroke();c.setLineDash([]);}});
      cloud(c,cx-240,cy,.7,true);cloud(c,cx+240,cy,.7,true);
      for(const cr of this.cray){if(cr.used)continue;c.save();c.translate(cr.x,cr.y);c.rotate(-.15);c.fillStyle=IRO[cr.k][2];rr(c,-18,-60,36,110,8);c.fill();c.beginPath();c.moveTo(-18,-60);c.lineTo(0,-92);c.lineTo(18,-60);c.fill();c.fillStyle='rgba(255,255,255,.8)';rr(c,-18,-20,36,26,4);c.fill();c.fillStyle=IRO[cr.k][2];c.font=`800 13px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(IRO[cr.k][0],0,-7,34);c.restore();}}
    drawFuka(c,70,H*.97,{outfit:outfit(),t:T,sc:1.3,cheer:this.mdone>0||this.ri>=6});},
  down(x,y){if(this.ph==='mix'){if(this.mdone>0||this.pour)return;const m=this.m;[0,1].forEach(i=>{const bx=i?470:130;if(!this.poured[i]&&Math.abs(x-bx)<60&&Math.abs(y-H*.8)<60){this.pour={i,t:0};sfx('pour');sayPair(IRO[m[i]][0],IRO[m[i]][1]);}});
      if(this.poured.every(Boolean)&&Math.hypot(x-300,(y-H*.55)*2.5)<200){this.stirP={x,y};}return;}
    if(this.ph==='balloon'){const k=this.targets[this.ti];if(!k)return;for(const b of this.bl){if(b.pop>0)continue;if(Math.hypot(x-b.x,y-b.y)<50){if(b.k===k){b.pop=.01;sfx('pop');confetti(20);sayPair(IRO[k][0],IRO[k][1]);this.ti++;if(this.ti>=this.targets.length){setTimeout(()=>{if(scene===this)this.newRainbow();},1500);}else setTimeout(()=>{if(scene===this&&this.ph==='balloon')this.askB();},1300);}else{b.sh=.5;this.miss++;sfx('no');hush();speak(`それは ${IRO[b.k][1]}`,'en');speak(`${IRO[k][1]}!`,'en');}return;}}return;}
    if(this.ph==='rainbow'){for(const cr of this.cray){if(cr.used)continue;if(Math.abs(x-cr.x)<34&&y>cr.y-100&&y<cr.y+60){const k=this.rb[this.ri];if(cr.k===k){cr.used=true;this.ri++;sfx('spark');sayPair(IRO[k][0],IRO[k][1]);if(this.ri>=6){sfx('fanfare');confetti(80);setTimeout(()=>{if(scene===this)sayPair('にじ','rainbow');},900);}}else{this.miss++;sfx('no');say(`つぎは ${IRO[k][0]}！`);}return;}}}},
  move(x,y){if(this.stirP&&this.ph==='mix'&&this.mdone<=0){const d=Math.hypot(x-this.stirP.x,y-this.stirP.y);this.stirP={x,y};this.stir+=d/1400;if(Math.random()<.08)sfx('squish');if(this.stir>=1){this.stir=1;this.mdone=.01;this.stirP=null;sfx('fanfare');confetti(40);const m=this.m;sayPair(IRO[m[2]][0],IRO[m[2]][1]);}}},
  up(){this.stirP=null;},
  hint(){if(this.ph==='mix'){if(this.mdone>0||this.pour)return null;const i=this.poured.indexOf(false);if(i>=0)return{x:i?470:130,y:H*.8};return{x:240,y:H*.55,x2:360,y2:H*.55};}if(this.ph==='balloon'){const b=this.bl.find(b=>b.k===this.targets[this.ti]&&b.y<H-60&&b.y>H*.2);return b?{x:b.x,y:b.y}:null;}const k=this.rb&&this.rb[this.ri];const cr=this.cray&&this.cray.find(q=>q.k===k);return cr?{x:cr.x,y:cr.y-30}:null;},
  hintText(){return this.ph==='mix'?(this.poured.every(Boolean)?'おさらを ぐるぐる まぜてね':'えのぐを タッチしてね'):this.ph==='balloon'?'えいごの いろの ふうせんを タッチ':'ひかっている ところの いろの クレヨンを タッチ';}};

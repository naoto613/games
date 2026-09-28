// ================= にゅういん ごはん（3しょくの えいよう） =================
const FOODG={red:['fish','egg','milk','cheese','meat'],yellow:['bread','onigiri','corn'],green:['carrot','tomato','apple','grapes','banana','broccoli']};
const GINFO={red:['あか','#ff4d6d','からだを つくる','red'],yellow:['きいろ','#f0b800','ちからに なる','yellow'],green:['みどり','#3cb85a','ちょうしを ととのえる','green']};
const GKEYS=['red','yellow','green'];
const gOf=k=>GKEYS.find(g=>FOODG[g].includes(k));
SCN.meal={bg:'#f0fff0',song:'fuwa',
  enter(){this.cured=0;this.ct=0;this.spoon=null;this.items=[];this.cur=null;this.buffet=null;this.queue=[];this.feedT=0;const lv=lvOf('meal');this.mode=Math.random()<.5?'sort':'menu';this.miss=0;this.fin=0;this.ph=this.mode;this.hp=0;this.feedT=0;this.dessert=Math.random()<.6;this.P=newPatient(ANK.filter(k=>k!=='frog'));this.gown=pick(['#bfe0ff','#ffd0e4','#d8f0c8','#fff0b0']);this.lay();this.told={};this.placed={red:[],yellow:[],green:[]};
    if(this.mode==='sort'){const per=lv<1?2:3;this.queue=shuffle(GKEYS.flatMap(g=>shuffle(FOODG[g]).slice(0,per)));this.total=this.queue.length;
      say(`${ptName(this.P)}さんは にゅういんちゅう。 げんきに なる ごはんを つくろう！ たべものを おなじ いろの おさらに のせてね`);setTimeout(()=>{if(scene===this)this.nextFood();},3800);}
    else{this.buffet=shuffle(GKEYS.flatMap(g=>shuffle(FOODG[g]).slice(0,3))).map((k,i)=>({k,i,used:0}));this.total=3;
      say(`${ptName(this.P)}さんの こんだてを つくろう！ あか・きいろ・みどり の たべものを 1つずつ えらんでね`);}},
  lay(){this.bedY=H*.4;this.plY=H*.64;},
  plate(i){return{x:W/2+(i-1)*190,y:this.plY};},
  cell(i){return{x:W/2+(i%3-1)*170,y:H-222+Math.floor(i/3)*80};},
  nextFood(){const k=this.queue.shift();if(!k){this.cur=null;this.startFeed();return;}this.cur=new Dr({k,hx:W/2,hy:H-90,r:60});this.cur.g=gOf(k);},
  startFeed(){this.ph='feed';this.cur=null;this.items=GKEYS.flatMap((g,i)=>this.placed[g].map((k,j)=>({k,g,i,j,eaten:0})));this.need=this.items.length;banner('いただきます！','#4cc86a');hush();setTimeout(()=>{if(scene===this){speak(`ぜんぶで ${this.need}こ！ スプーンで たべさせて あげよう。 たべものを タッチしてね`);speak(`${numEn(this.need)} foods!`,'en');}},900);},
  itemPos(it){const p=this.plate(it.i);const n=this.placed[it.g].length;const a=it.j/Math.max(1,n)*TAU-Math.PI/2,r=n>1?38:0;return{x:p.x+Math.cos(a)*r,y:p.y+Math.sin(a)*r};},
  mouth(){return{x:W/2+20,y:this.bedY-76};},
  update(dt){if(this.cur)this.cur.upd(dt);if(this.spoon){const s=this.spoon;s.t+=dt;if(s.t>.6&&!s.done){s.done=1;this.feedT=.8;sfx('munch');this.hp=Math.min(1,this.hp+1/this.need);good(this.mouth().x,this.mouth().y,1,pick(['もぐもぐ','おいしい！','ぱくっ']));if(!s.dessert&&this.items.every(q=>q.eaten)){setTimeout(()=>{if(scene!==this)return;if(this.dessert){this.ph='dessert';say('ぜんぶ たべたね！ ごほうびの プリンも どうぞ！ タッチしてね');}else this.cure();},1000);}}if(s.t>.9)this.spoon=null;}
    if(this.feedT>0)this.feedT-=dt;
    if(this.cured){this.ct+=dt;if(this.ct>4&&!this.fin)this.fin=.01;}
    if(this.fin>0){this.fin+=dt;if(this.fin>.3&&this.fin<9){this.fin=9;celebrate('meal',starsFor(this.miss));}}},
  cure(){if(this.cured)return;this.ph='done';this.cured=1;this.ct=0;banner('たいいん おめでとう！','#4cc86a',`${ptName(this.P)}さん げんき いっぱい！`);confetti(80);setTimeout(()=>{if(scene===this)say('ごちそうさま！ すっかり げんきに なった！ ありがとう！');},1200);},
  draw(c){roomBg(c,'#eaffea','#d8f0d0',this.bedY+60,'#f4fff4',[['window',100,this.bedY-150,1,130,110,'#c8f0b0'],['frame',W-90,this.bedY-190,1,'heart']]);const bx=W/2+40,by=this.bedY;
    const up=this.cured?Math.min(1,this.ct*1.2):0;
    c.fillStyle='#d8e4f4';rr(c,bx-170,by-150,20,180,8);c.fill();c.fillStyle='#fff';rr(c,bx-160,by-40,330,60,16);c.fill();c.strokeStyle='#b8c8e0';c.lineWidth=4;c.stroke();c.fillStyle='#9ab0d0';c.fillRect(bx-150,by+20,12,50);c.fillRect(bx+146,by+20,12,50);
    c.strokeStyle='#c8d4e8';c.lineWidth=4;c.beginPath();c.moveTo(bx+210,by+60);c.lineTo(bx+210,by-190);c.stroke();c.fillStyle='rgba(200,235,255,.8)';rr(c,bx+196,by-200,28,40,8);c.fill();
    const eat=this.feedT>0?1:0;
    if(!this.cured){c.fillStyle='#fff';rr(c,bx-150,by-110,90,50,20);c.fill();drawPt(c,this.P,bx-20,by-6,1.05,{t:T,sad:this.hp<.3&&this.ph!=='feed',eat,open:this.spoon&&!this.spoon.done,happy:this.hp>=.6&&!eat,gown:this.gown});c.fillStyle='#8ad0ff';rr(c,bx-110,by-54,280,52,16);c.fill();c.strokeStyle='#5aa8e8';c.lineWidth=3;c.stroke();c.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<5;i++)circ(c,bx-80+i*56,by-28,8);}
    else{c.fillStyle='#8ad0ff';rr(c,bx-110,by-54,280,52,16);c.fill();drawPt(c,this.P,bx-20+Math.sin(this.ct*3)*40*up,by+70-up*10,1.05,{t:T,happy:1,dance:1,hop:Math.abs(Math.sin(this.ct*4))*.6,gown:this.gown});for(let i=0;i<3;i++){c.fillStyle=['#ff8cc0','#ffd23a','#b48cff'][i];for(let k=0;k<5;k++){const a=k/5*TAU;circ(c,60+i*30+Math.cos(a)*8,by+40+Math.sin(a)*8,6);}}}
    // health bar
    c.fillStyle='rgba(255,255,255,.9)';rr(c,W-210,158,190,40,20);c.fill();MED.love(c,W-188,178,.45);c.fillStyle='#ffe0ea';rr(c,W-166,170,130,16,8);c.fill();c.fillStyle='#ff6f9a';rr(c,W-166,170,Math.max(16,130*this.hp),16,8);c.fill();txt(c,'げんき',W-100,208,14,'#ff6f9a');
    if(this.ph!=='menu'){c.fillStyle='#f4d8a8';rr(c,20,this.plY-100,W-40,200,24);c.fill();c.strokeStyle='#d8b078';c.lineWidth=4;c.stroke();
    GKEYS.forEach((g,i)=>{const p=this.plate(i),G=GINFO[g];c.fillStyle='#fff';circ(c,p.x,p.y,80);c.strokeStyle=G[1];c.lineWidth=10;c.beginPath();c.arc(p.x,p.y,76,0,TAU);c.stroke();c.fillStyle=G[1];rr(c,p.x-50,p.y-112,100,30,15);c.fill();txt(c,G[0],p.x,p.y-97,18,'#fff');txt(c,G[2],p.x,p.y+104,14,shade(G[1],-.3));});}
    if(this.ph==='feed'||this.ph==='dessert'||this.ph==='done'){for(const it of this.items){if(it.eaten)continue;const q=this.itemPos(it);drawThing(c,it.k,q.x,q.y,this.placed[it.g].length>1?.72:.95);if(this.ph==='feed'&&!this.spoon)targetMark(c,q.x,q.y,34);}}
    else GKEYS.forEach((g,i)=>this.placed[g].forEach((k,j)=>{const q=this.itemPos({g,i,j});drawThing(c,k,q.x,q.y,this.placed[g].length>1?.72:.95);}));
    if(this.spoon){const s=this.spoon,k=Math.min(1,s.t/.6),m=this.mouth();const x=lerp(s.x,m.x,k),y=lerp(s.y,m.y,k)-Math.sin(k*Math.PI)*120;c.save();c.translate(x,y);c.rotate(-.6);c.fillStyle='#e8eef8';rr(c,-4,0,8,50,4);c.fill();c.beginPath();c.ellipse(0,-6,16,12,0,0,TAU);c.fill();c.restore();if(!s.done)drawThing(c,s.k,x,y-10,.5);}
    if(this.ph==='dessert'){MED.pudding(c,W/2,H-110,1.6+Math.sin(T*5)*.05);targetMark(c,W/2,H-110,60);}
    if(this.cur){tray(c,H-90,130);this.cur.draw(c,1.5);txt(c,`${this.total-this.queue.length-1} / ${this.total}`,W-70,H-150,20,'#4cc86a');}
    if(this.ph==='menu'){panel(c,20,H-350,W-40,340,24,'#fff','#c8e8c0');GKEYS.forEach((g,i)=>{const x=W/2+(i-1)*120,G=GINFO[g];c.fillStyle='#fff';circ(c,x,H-300,32);c.strokeStyle=G[1];c.lineWidth=6;c.beginPath();c.arc(x,H-300,30,0,TAU);c.stroke();if(this.placed[g][0])drawThing(c,this.placed[g][0],x,H-300,.6);else txt(c,G[0],x,H-300,16,G[1]);});for(const b of this.buffet){const p=this.cell(b.i);c.globalAlpha=b.used?.3:1;c.fillStyle='#f8fff4';rr(c,p.x-70,p.y-38,140,76,16);c.fill();drawThing(c,b.k,p.x-30,p.y,.7);txt(c,WORDS[b.k][0],p.x+32,p.y-8,WORDS[b.k][0].length>4?11:14,'#5a6a5a');txt(c,WORDS[b.k][1],p.x+32,p.y+14,11,'#3a88e8');c.globalAlpha=1;}}
    fu(c,80,this.bedY+150,2.1,{point:!this.cured});rk(this,c,W-50,this.bedY+150,1.4);},
  down(x,y){if(this.fin)return;
    if(this.cur&&this.cur.hit(x,y)){this.cur.held=true;sfx('tap');sayWord(this.cur.k);return;}
    if(this.ph==='menu'){for(const b of this.buffet){const p=this.cell(b.i);if(!b.used&&Math.abs(x-p.x)<70&&Math.abs(y-p.y)<38){const g=gOf(b.k);const G=GINFO[g];if(this.placed[g].length){bad();this.miss++;hush();speak(`${G[0]}の なかまは もう あるよ。 ほかの いろを えらんでね`);return;}b.used=1;this.placed[g].push(b.k);const i=GKEYS.indexOf(g);good(W/2+(i-1)*120,H-300,1,G[0]+'！');hush();speak(WORDS[b.k][0]);speak(WORDS[b.k][1],'en');speak(`${G[0]}の なかま。 ${G[2]}よ`);if(GKEYS.every(g=>this.placed[g].length)){setTimeout(()=>{if(scene===this)this.startFeed();},1800);}return;}}return;}
    if(this.ph==='feed'&&!this.spoon){for(const it of this.items){if(it.eaten)continue;const q=this.itemPos(it);if(Math.hypot(x-q.x,y-q.y)<44){it.eaten=1;this.spoon={x:q.x,y:q.y,k:it.k,t:0};sfx('whoosh');hush();speak('あーん');return;}}return;}
    if(this.ph==='dessert'&&hitC(x,y,W/2,H-110,70)){this.ph='done2';this.spoon={x:W/2,y:H-110,k:'pudding',t:0,done:0,dessert:1};sfx('whoosh');setTimeout(()=>{if(scene===this){sayWord('pudding');this.cure();}},900);}},
  move(x,y){if(this.cur&&this.cur.held){this.cur.x=x;this.cur.y=y;}},
  up(x,y){const f=this.cur;if(!f||!f.held)return;f.held=false;const i=GKEYS.findIndex((g,i)=>{const p=this.plate(i);return Math.hypot(x-p.x,y-p.y)<95;});if(i<0)return;const g=GKEYS[i];
    if(g===f.g){this.placed[g].push(f.k);good(this.plate(i).x,this.plate(i).y,1,GINFO[g][0]+'！');const G=GINFO[g];let delay=500;if(!this.told[g]){this.told[g]=1;delay=1300;hush();speak(`${G[0]}の なかま！ ${G[2]}よ`);speak(G[3],'en');}this.cur=null;setTimeout(()=>{if(scene===this)this.nextFood();},delay);}
    else{bad();this.miss++;const G=GINFO[f.g];hush();speak(`${WORDS[f.k][0]}は ${G[0]}の なかま。 ${G[2]}よ`);bub={text:`${WORDS[f.k][0]}は ${G[0]}の なかま`,t:0,life:2.6};}},
  hint(){if(this.fin)return null;if(this.cur&&!this.cur.held){const i=GKEYS.indexOf(this.cur.g);const p=this.plate(i);return{x:this.cur.hx,y:this.cur.hy,x2:p.x,y2:p.y};}
    if(this.ph==='menu'){const b=this.buffet.find(b=>!b.used&&!this.placed[gOf(b.k)].length);if(!b)return null;const p=this.cell(b.i);return{x:p.x,y:p.y};}
    if(this.ph==='feed'&&!this.spoon){const it=this.items.find(q=>!q.eaten);if(!it)return null;return this.itemPos(it);}
    if(this.ph==='dessert')return{x:W/2,y:H-110};return null;},
  hintText(){if(this.cur){const G=GINFO[this.cur.g];return`${WORDS[this.cur.k][0]}は ${G[0]}の おさらだよ`;}if(this.ph==='menu')return'あか・きいろ・みどりを 1つずつ';if(this.ph==='feed')return'たべものを タッチして あーん';if(this.ph==='dessert')return'プリンを タッチ';return'';}};

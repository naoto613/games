// ================= shiritori =================
const SHW=[['apple','りんご'],['banana','ばなな'],['fish','さかな'],['egg','たまご'],['tomato','とまと'],['grapes','ぶどう'],['corn','とうもろこし'],['bone','ほね'],['bamboo','たけ'],['duck','あひる'],['bear','くま'],['rabbit','うさぎ'],['cat','ねこ'],['dog','いぬ'],['panda','ぱんだ'],['pig','ぶた'],['chick','ひよこ'],['hippo','かば'],['strawberry','いちご'],['cherry','さくらんぼ'],['candle','ろうそく'],['crown','かんむり'],['cup','こっぷ'],['goldfish','きんぎょ'],['octopus','たこ'],['whale','くじら'],['turtle','かめ'],['crab','かに'],['jelly','くらげ'],['rocket','ろけっと'],['snowman','ゆきだるま'],['horse','うま'],['flower','はな'],['starcandy','ほし'],['note','おんぷ'],['palette','ぱれっと'],['icecream','あいす'],['puzzle','ぱずる'],['mic','まいく'],['toothbrush','はぶらし'],['towel','たおる'],['coin','こいん'],['ticket','きっぷ'],['cotton','わたあめ'],['mitten','てぶくろ'],['cake','けーき'],['carrot','にんじん'],['spoon','すぷーん'],['train','でんしゃ'],['tooth','は']];
const SMALLK={'ゃ':'や','ゅ':'ゆ','ょ':'よ','っ':'つ','ぁ':'あ','ぃ':'い','ぅ':'う','ぇ':'え','ぉ':'お'};
function shLast(w){let s=w.replace(/ー+$/,'');const ch=s[s.length-1];return SMALLK[ch]||ch;}
SCN.shiri={bg:'#fff6dc',song:'play',
  enter(){this.fin=0;this.score=0;this.goal=6;this.chain=[];this.fly=null;this.miss=0;this.nch=0;this.newChain(true);},
  succ(ch,ex){return SHW.filter(q=>q[1][0]===ch&&!(ex||[]).includes(q[0]));},
  newChain(first){const starts=SHW.filter(q=>!q[1].endsWith('ん')&&this.succ(shLast(q[1])).some(n=>this.succ(shLast(n[1])).length));const s0=pick(starts);this.chain=[s0];this.cur=s0;this.nch++;this.makeQ();
    setTimeout(()=>{if(scene===this)this.ask(first);},first?200:1600);},
  makeQ(){const ch=shLast(this.cur[1]),used=this.chain.map(q=>q[0]);let good=this.succ(ch,used);const pref=good.filter(q=>!q[1].endsWith('ん')&&this.succ(shLast(q[1]),used).length);const ans=pick(pref.length&&Math.random()<.85?pref:good);
    const bad=shuffle(SHW.filter(q=>q[1][0]!==ch)).slice(0,2);this.opts=shuffle([ans,...bad]).map(q=>({q,ok:q===ans,sh:0}));this.ch=ch;this.t=0;},
  ask(first){const w=this.cur[1];hush();if(first)speak('しりとり あそび！');speak(`${w}の 「${this.ch}」！`);speak(`「${this.ch}」から はじまる ものは どれかな？`);bub={text:`「${this.ch}」から はじまる ものは どれ？`,t:0,life:4};},
  optP(i){return{x:110+i*190,y:H*.72};},
  update(dt){this.t+=dt;for(const o of this.opts)if(o.sh>0)o.sh-=dt;if(this.fly){this.fly.t+=dt*1.6;if(this.fly.t>=1){const q=this.fly.q;this.fly=null;this.chain.push(q);this.cur=q;this.score++;
      if(this.score>=this.goal){this.fin=.01;sfx('fanfare');confetti(80);say(`しりとり ${this.score}こ つながった！ すごい！`);return;}
      if(q[1].endsWith('ん')){sfx('boing');say(`「${q[1]}」… 「ん」が ついちゃった〜！ あたらしい しりとりを しよう`);this.newChain(false);return;}
      const nx=this.succ(shLast(q[1]),this.chain.map(z=>z[0]));if(!nx.length){sfx('chin');say(`「${shLast(q[1])}」から はじまる ものが もう ないね。 あたらしい しりとり！`);this.newChain(false);return;}
      this.makeQ();this.ask(false);}}
    if(this.fin>0){this.fin+=dt;if(this.fin>3&&this.fin<9){this.fin=9;celebrate('shiri',this.miss===0);}}},
  card(c,q,x,y,s,hl){c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='rgba(90,40,110,.15)';rr(c,-78,-86,160,184,22);c.fill();c.fillStyle='#fff';rr(c,-80,-92,160,184,22);c.fill();c.strokeStyle='#ffd08a';c.lineWidth=5;c.stroke();drawThing(c,q[0],0,-24,1.75);
    const w=q[1];c.font=`800 30px ${FONT}`;c.textAlign='left';c.textBaseline='middle';const tw=c.measureText(w).width;let x0=-tw/2;for(let i=0;i<w.length;i++){const ch=w[i],cw=c.measureText(ch).width;const isL=hl==='last'&&i===w.replace(/ー+$/,'').length-1,isF=hl==='first'&&i===0;if(isL||isF){c.fillStyle=isL?'#ff5f6f':'#5aa8ff';circ(c,x0+cw/2,58,19);c.fillStyle='#fff';}else c.fillStyle='#5a3a2a';c.fillText(ch,x0,59);x0+=cw;}c.restore();},
  draw(c){c.fillStyle='#fff0c8';c.fillRect(-400,0,W+800,H);c.fillStyle='#ffe4a0';for(let y=0;y<H;y+=44)c.fillRect(-400,y,W+800,3);
    c.fillStyle='rgba(255,255,255,.8)';rr(c,20,112,W-40,120,24);c.fill();const shown=this.chain.slice(-4);shown.forEach((q,i)=>{const x=80+i*150,y=172;if(i>0){c.strokeStyle='#ffb03a';c.lineWidth=5;c.beginPath();c.moveTo(x-100,y);c.lineTo(x-50,y);c.stroke();c.fillStyle='#ffb03a';c.beginPath();c.moveTo(x-50,y-9);c.lineTo(x-38,y);c.lineTo(x-50,y+9);c.fill();}drawThing(c,q[0],x,y-12,1);c.fillStyle='#5a3a2a';c.font=`800 18px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(q[1],x,y+38);});
    for(let i=0;i<this.goal;i++){c.fillStyle=i<this.score?'#ffd23a':'#f0e0c8';star(c,W/2-(this.goal-1)*24+i*48,262,18,8);c.fill();}
    if(!this.fly)this.card(c,this.cur,W/2,H*.44,1.25,'last');
    if(this.fin<=0)this.opts.forEach((o,i)=>{if(this.fly&&this.fly.q===o.q)return;const p=this.optP(i);const sh=o.sh>0?Math.sin(o.sh*40)*8:0;this.card(c,o.q,p.x+sh,p.y,.95,this.t>6?'first':null);});
    if(this.fly){const f=this.fly,k=ease(f.t);this.card(c,this.cur,W/2-k*150,H*.44-k*80,1.25-k*.5,'last');this.card(c,f.q,lerp(f.x,W/2,k),lerp(f.y,H*.44,k),lerp(.95,1.25,k),'first');}
    drawFuka(c,70,H-24,{outfit:outfit(),t:T,sc:2,point:!this.fly,cheer:!!this.fly||this.fin>0});drawRikki(c,540,H-24,{sc:1.6,t:T,clap:RK.clap});this.rkPos={x:540,y:H-24,sc:1.6};},
  down(x,y){if(this.fin>0||this.fly)return;if(Math.abs(x-W/2)<100&&Math.abs(y-H*.44)<115){this.ask(false);return;}
    this.opts.forEach((o,i)=>{const p=this.optP(i);if(Math.abs(x-p.x)<85&&Math.abs(y-p.y)<100){if(o.ok){sfx('ding');rkCheer();burst(p.x,p.y,16,'star');hush();speak(`${this.cur[1]}、${o.q[1]}！`);this.fly={q:o.q,x:p.x,y:p.y,t:0};}else{o.sh=.5;this.miss++;sfx('no');hush();speak(`${o.q[1]}は 「${o.q[1][0]}」から はじまるよ`);speak(`「${this.ch}」を さがしてね`);}}});},
  hint(){if(this.fly||this.fin>0||this.t<7)return null;const i=this.opts.findIndex(o=>o.ok);const p=this.optP(i);return{x:p.x,y:p.y};},
  hintText(){return `「${this.ch}」から はじまる えを タッチ`;}};

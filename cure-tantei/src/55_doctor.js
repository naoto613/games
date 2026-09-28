// ================= doctor step (おいしゃさん たんてい) =================
const TOOLS=['thermo','steth','light','xray','lens'];
const TOOL_JA={thermo:'たいおんけい',steth:'ちょうしんき',light:'ライト',xray:'レントゲン',lens:'むしめがね'};
const PX=200,PY=545,PS=2;// patient base
const PP=k=>[PX+PART[k][0]*PS,PY+PART[k][1]*PS];
function toolResult(d,k){const v=d.tools[k];
  if(k==='thermo'){const n=v||36.5;return n>=37.5?`${n}ど！ おねつが あるね`:`${n}ど。 おねつは ないね`;}
  if(k==='steth')return{fast:'ドキドキ はやいね',guru:'おなかが グルグル いってる！',normal:'ドクン ドクン。 げんきな おとだね'}[v||'normal'];
  if(k==='light')return{red:'のどが まっかだ！',tooth:'あっ！ むしばが ある！',ok:'おくちの なかは きれいだね'}[v||'ok'];
  if(k==='xray'){if(!v||v==='ok')return'ほねは だいじょうぶ';const w=wordOf(v);return`おなかに ${w?w[0]:'なにか'}が はいってる！`;}
  if(k==='lens')return{thorn:'て に とげが ささってる！',spots:'ぶつぶつが ある！',scrape:'あしを すりむいてる！',powder:'はなに むらさきの こなが ついてる！',ok:'けがは ないね'}[v||'ok'];}
STEP.doctor={
  enter(){const d=this.d;this.n=NPC[d.pt];bgm('doctor');RUN.doc=true;RUN.cure=false;this.ph='intro';this.t=0;this.used={};this.anim=null;this.ti=-1;this.tt=0;
    this.cond={sick:!!d.sick,thorn:d.tools.lens==='thorn',scrape:d.tools.lens==='scrape',powder:d.tools.lens==='powder'};this.mouth=null;
    say(d.say,d.pt);INS={text:`${this.n.name}「${d.say}」`,who:'fu',t:0};},
  update(dt){const d=this.d;this.t+=dt;this.tt+=dt;
    if(this.ph==='intro'&&this.t>2.6){this.ph='exam';instr(`${this.n.name}を しらべよう！ どうぐを タッチしてね`,'fu');}
    if(this.anim){const a=this.anim;a.t+=dt;if(!a.said&&a.t>1){a.said=1;say(toolResult(d,a.k),'fu');if(d.need.includes(a.k)){sfx('find');burst(PX,PY-100,14);}}
      if(a.t>3){this.anim=null;this.mouth=null;if(d.need.every(k=>this.used[k])&&this.ph==='exam'){this.ph='diag0';this.t=0;}}}
    if(this.ph==='diag0'&&this.t>.4){this.ph='diag';this.dopts=shuffle([d.diag.ans,...d.diag.wrong]).map(k=>({k,sh:0}));
      INS={text:`${this.n.name}は どうして ぐあいが わるいのかな？`,who:'fu',t:0};say([`${this.n.name}は どうして ぐあいが わるいのかな？`,...this.dopts.map(o=>DIAG[o.k]+'？')],'fu');}
    if(this.dopts)for(const o of this.dopts)o.sh=Math.max(0,o.sh-dt);
    if(this.ph==='diagok'&&this.t>2.8)this.nextTreat();
    if(this.ph==='treat')this.updTreat(dt);
    if(this.ph==='end'&&this.t>3.4&&this.fin==null)finish(this,.1);},
  nextTreat(){const d=this.d;this.ti++;this.tt=0;if(this.ti>=d.treat.length){this.ph='end';this.t=0;this.cond={};sfx('fanfare');confetti(70);say(d.end||`げんきに なった！ ありがとう、せんせい！`,d.pt);SAVE.doc=(SAVE.doc||0)+1;save();return;}
    this.ph='treat';const tr=this.tr=Object.assign({},d.treat[this.ti]);tr.done=false;
    if(tr.t==='ice'){tr.ix=200;tr.iy=655;tr.drag=false;tr.temp=d.tools.thermo||38;instr('こおりを おでこに のせてあげよう！ ゆびで はこんでね','fu');}
    if(tr.t==='med'){const others=shuffle(['pink','blue','yellow','green','orange','purple'].filter(k=>k!==tr.col)).slice(0,2);tr.opts=shuffle([tr.col,...others]).map(k=>({k,sh:0}));const w=WORDS[tr.col];INS={text:`「${w[1]}」の おくすりを あげてね（${w[0]}）`,who:'fu',t:0};say([[w[1],'en'],[`${w[0]}の おくすりを あげてね`,'ja']],'fu');}
    if(tr.t==='band'||tr.t==='thorn'){const n=tr.n||3;const base=tr.t==='band'?[[-26,-24],[30,-30],[-8,-6],[22,-60],[-34,-50]]:[[26,-34],[34,-24],[18,-46],[36,-42]];
      tr.spots=base.slice(0,n).map(([a,b])=>({x:PX+a*PS*.9,y:PY+b*PS*.9*(tr.t==='band'?.8:1),on:false,t:0}));tr.cnt=0;
      instr(tr.t==='band'?`すりきずに ばんそうこうを はろう！ ${JA_NUM[n]}か所 タッチしてね`:'とげを ぬいてあげよう！ とげを タッチしてね','fu');}
    if(tr.t==='rub'){tr.area=tr.area||'belly';tr.m=0;tr.px=null;const p=tr.area==='belly'?PP('belly'):tr.area==='mouth'?PP('mouth'):PP('nose');tr.cx=p[0];tr.cy=p[1];if(tr.area==='mouth')this.mouth='open';
      instr({belly:'おなかを ゆびで なでなで してあげよう！',face:'はなの こなを ゆびで ふきふき しよう！',mouth:'ゆびで ゴシゴシ、はみがき しよう！'}[tr.area],'fu');}
    if(tr.t==='sleep'){instr('もうふを タッチして、ねかせてあげよう','fu');}},
  updTreat(dt){const tr=this.tr;if(!tr)return;
    if(tr.t==='ice'&&tr.placed){tr.pt=(tr.pt||0)+dt;const from=this.d.tools.thermo||38;tr.temp=Math.max(36.5,from-tr.pt*.9);if(tr.pt>3.2&&!tr.done){tr.done=true;this.cond.sick=false;sfx('ok');this.after(.6);}}
    if(tr.t==='med'){for(const o of tr.opts)o.sh=Math.max(0,o.sh-dt);if(tr.feed!=null){tr.feed+=dt;if(tr.feed>1&&!tr.done){tr.done=true;sfx('gulp');burst(PP('mouth')[0],PP('mouth')[1],12,'heart');say('ごっくん！ えらいね！','fu');this.cond.sick=false;this.after(1.6);}}}
    if(tr.t==='rub'&&tr.pop!=null){tr.pop+=dt;if(tr.pop>2.8&&!tr.done){tr.done=true;this.after(.2);}}
    if(tr.t==='sleep'&&tr.sl!=null){tr.sl+=dt;if(tr.sl>3.2&&!tr.done){tr.done=true;this.after(.1);}}
    if(tr.wait!=null){tr.wait-=dt;if(tr.wait<=0){tr.wait=null;this.nextTreat();}}},
  after(s){this.tr.wait=s;},
  toolX(i){return 44+i*78;},
  drawPatient(c){const d=this.d,a=this.anim;const tr=this.ph==='treat'?this.tr:null;
    // bed
    c.fillStyle='#fff';rr(c,60,PY-20,280,40,12);c.fill();c.strokeStyle='#b8d0e8';c.lineWidth=4;c.stroke();c.fillStyle='#b8d0e8';c.fillRect(70,PY+20,10,40);c.fillRect(320,PY+20,10,40);c.fillStyle='#ffd8ec';rr(c,64,PY-6,272,14,6);c.fill();
    const sleeping=tr&&tr.t==='sleep'&&tr.sl!=null&&tr.sl<2.6;
    drawAnimal(c,this.n.kind,PX,PY,PS,{acc:this.n.acc,sick:this.cond.sick&&this.ph!=='end',happy:this.ph==='end'||(tr&&tr.t==='sleep'&&tr.sl>2.6),mouth:this.mouth||(a&&a.k==='light'?'open':null),sleep:sleeping});
    if(this.cond.thorn){const sp=tr&&tr.t==='thorn'?tr.spots:[[PX+26*PS*.9,PY-34*PS*.9],[PX+34*PS*.9,PY-24*PS*.9]].map(([x,y])=>({x,y}));for(const s of sp){if(s.on){if(s.t<.8){c.save();c.translate(s.x+s.t*40,s.y-s.t*120);c.rotate(s.t*8);drawIcon(c,'thorn',0,0,.5);c.restore();}continue;}c.save();c.translate(s.x,s.y);c.rotate(.5);drawIcon(c,'thorn',0,0,.5);c.restore();}}
    if(this.cond.scrape||(tr&&tr.t==='band')){const sp=tr&&tr.t==='band'?tr.spots:[{x:PX-26*PS*.9,y:PY-24*PS*.72},{x:PX+30*PS*.9,y:PY-30*PS*.72}];for(const s of sp){if(s.on)drawIcon(c,'band',s.x,s.y,.8);else{c.fillStyle='rgba(255,70,90,.7)';for(let i=0;i<4;i++)c.fillRect(s.x-8+i*4.5,s.y-5,2.5,10);}}}
    if(this.cond.powder){const[nx,ny]=PP('nose');c.fillStyle='rgba(160,90,230,.7)';for(let i=0;i<9;i++)circ(c,nx-18+hash(i,1)*36,ny-8+hash(i,2)*18,3);const tr2=tr&&tr.t==='rub'?tr:null;if(tr2){c.globalAlpha=1-tr2.m;}c.globalAlpha=1;}
    if(tr&&tr.t==='ice'&&tr.placed)drawIcon(c,'ice',PP('head')[0],PP('head')[1]-38,1.2);
    if(sleeping||(tr&&tr.t==='sleep'&&tr.sl!=null)){c.fillStyle='#8ad0ff';rr(c,80,PY-60,240,70,20);c.fill();c.strokeStyle=LN;c.lineWidth=3;c.stroke();c.fillStyle='#fff';for(const x of[120,200,280]){starP(c,x,PY-25,9,4);c.fill();}}},
  zoom(c,fn){const zx=318,zy=250;c.save();drawGlow(c,'#fff',zx,zy,90,.6);c.fillStyle='#fff';circ(c,zx,zy,64);c.beginPath();c.arc(zx,zy,60,0,TAU);c.clip();fn(zx,zy);c.restore();c.strokeStyle='#c89a3a';c.lineWidth=7;c.beginPath();c.arc(zx,zy,62,0,TAU);c.stroke();},
  drawAnim(c){const a=this.anim;if(!a)return;const d=this.d,v=d.tools[a.k],k=Math.min(1,a.t/.5);
    if(a.k==='thermo'){const[x,y]=PP('paw');drawIcon(c,'thermo',x-10,y+10,1.1);const n=Math.min(v||36.5,35+a.t*3.2);const hot=(v||36.5)>=37.5;c.fillStyle='rgba(255,255,255,.95)';rr(c,120,190,160,64,16);c.fill();c.strokeStyle=hot?'#ff4a5a':'#5aa8ff';c.lineWidth=4;c.stroke();otext(c,n.toFixed(1)+' ど',200,223,32,'#fff',hot?'#ff4a5a':'#5aa8ff');}
    if(a.k==='steth'){const[x,y]=PP('belly');drawIcon(c,'steth',x+10,y-10,1.1);const p=1+Math.abs(Math.sin(a.t*(v==='fast'?12:6)))*.3;c.save();c.translate(318,250);c.scale(p,p);drawIcon(c,v==='guru'?'d_tummy':'heart',0,0,1.8);c.restore();otext(c,v==='guru'?'グルグル':v==='fast'?'ドキドキ！':'ドクン ドクン',318,330,22,'#fff','#ff5fa2','center',FONT);}
    if(a.k==='light'){const[x,y]=PP('mouth');drawGlow(c,'#fff6a0',x,y,70,.7);drawIcon(c,'light',x+60,y+30,1.1);if(a.t>.5)this.zoom(c,(zx,zy)=>{c.fillStyle='#e05a7a';c.fillRect(zx-60,zy-60,120,120);c.fillStyle=v==='red'?'#b8001a':'#ff8ca0';ell(c,zx,zy+10,30,26);c.fillStyle='#fff';for(let i=0;i<6;i++){rr(c,zx-54+i*18,zy-60,16,18,4);c.fill();}if(v==='tooth'){c.fillStyle='#4a3a2a';circ(c,zx-10,zy-52,5);}});}
    if(a.k==='xray'){c.fillStyle=`rgba(10,20,60,${.8*k})`;rr(c,110,300,180,250,16);c.fill();c.strokeStyle=`rgba(190,230,255,${k})`;c.lineWidth=4;c.beginPath();c.arc(200,390,34,0,TAU);c.moveTo(200,424);c.lineTo(200,520);for(let i=0;i<4;i++){c.moveTo(166,450+i*14);c.quadraticCurveTo(200,440+i*14,234,450+i*14);}c.moveTo(170,445);c.lineTo(140,500);c.moveTo(230,445);c.lineTo(260,500);c.stroke();
      if(v&&v!=='ok'&&a.t>.8){drawGlow(c,'#ffe36a',200,480,50,.8);drawIcon(c,v,200,480,1.1);}}
    if(a.k==='lens'){const tgt=v==='thorn'?'paw':v==='powder'?'nose':v==='scrape'?'leg':'belly';const[x,y]=PP(tgt);drawIcon(c,'lens',x+4,y+4,1.2);
      if(a.t>.5)this.zoom(c,(zx,zy)=>{c.fillStyle=this.n.kind==='turtle'?'#8ad08a':(AN[this.n.kind].b||'#ffe4d4');c.fillRect(zx-60,zy-60,120,120);if(v==='thorn'){for(const[dx,dy]of[[-12,0],[14,-8]]){c.save();c.translate(zx+dx,zy+dy);c.rotate(.5);drawIcon(c,'thorn',0,0,1.3);c.restore();}}
        else if(v==='spots'){c.fillStyle='#ff6a8a';for(let i=0;i<7;i++)circ(c,zx-40+hash(i,4)*80,zy-40+hash(i,5)*80,6);}else if(v==='scrape'){c.fillStyle='#ff4a5a';for(let i=0;i<5;i++)c.fillRect(zx-24+i*11,zy-18,5,36);}else if(v==='powder'){c.fillStyle='#a060e0';for(let i=0;i<16;i++)circ(c,zx-40+hash(i,6)*80,zy-40+hash(i,7)*80,4);}else otext(c,'OK',zx,zy,40,'#fff','#3ec46a');});}},
  draw(c){const d=this.d;drawBG(c,'clinic');this.drawPatient(c);this.drawAnim(c);
    drawFutan(c,46,600,{s:1.55,doc:1,pose:this.anim?'point':'idle',happy:this.ph==='end'});drawRicky(c,356,560,{s:1.4,nurse:1,happy:this.ph==='end'});
    if(this.ph==='exam'||this.ph==='intro'||this.ph==='diag0'){c.fillStyle='rgba(255,255,255,.95)';rr(c,6,616,388,96,22);c.fill();c.strokeStyle='#8ad0ff';c.lineWidth=4;c.stroke();
      TOOLS.forEach((k,i)=>{const x=this.toolX(i),u=this.used[k],act=this.anim&&this.anim.k===k;c.save();c.translate(x,652);if(!u&&!this.anim&&this.ph==='exam'){const p=1+Math.sin(T*5+i)*.05;c.scale(p,p);}c.fillStyle=act?'#fff6c8':u?'#e8f8e8':'#f0f8ff';circ(c,0,0,31);c.strokeStyle=u?'#6cd08a':'#b8d0e8';c.lineWidth=3;c.beginPath();c.arc(0,0,31,0,TAU);c.stroke();drawIcon(c,k,0,0,1);c.restore();
        txt(c,TOOL_JA[k],x,697,11,'#5b2c47');if(u){c.fillStyle='#3ec46a';circ(c,x+24,628,10);c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.moveTo(x+19,628);c.lineTo(x+23,632);c.lineTo(x+29,624);c.stroke();}
        if(u&&d.need.includes(k)){c.fillStyle='#ffd23a';starP(c,x-24,628,10,4.5);c.fill();c.strokeStyle=LN;c.lineWidth=1.5;c.stroke();}});}
    if(this.ph==='diag'||this.ph==='diagok'){c.fillStyle='rgba(40,20,60,.35)';c.fillRect(VX0-2,560,VX1-VX0+4,VY1-560);this.dopts.forEach((o,i)=>{const x=80+i*120,y=640,good=this.ph==='diagok'&&o.k===d.diag.ans;const sh=o.sh>0?Math.sin(o.sh*40)*6:0;
        c.save();c.translate(x+sh,y);if(good){c.scale(1.08,1.08);drawGlow(c,'#fff6a0',0,0,80,.8);}c.fillStyle=good?'#fffbe0':'#fff';rr(c,-54,-58,108,116,18);c.fill();c.strokeStyle=good?'#ffc83a':'#ff9ccf';c.lineWidth=4;c.stroke();drawIcon(c,'d_'+o.k,0,-12,1.3);txt(c,DIAG[o.k],0,38,14,'#5b2c47');c.restore();});}
    if(this.ph==='treat')this.drawTreat(c);},
  drawTreat(c){const tr=this.tr;if(!tr)return;
    if(tr.t==='ice'){if(!tr.placed)drawIcon(c,'ice',tr.ix,tr.iy,1.5);else{const hot=tr.temp>=37.5;c.fillStyle='rgba(255,255,255,.95)';rr(c,120,190,160,64,16);c.fill();c.strokeStyle=hot?'#ff4a5a':'#5aa8ff';c.lineWidth=4;c.stroke();otext(c,tr.temp.toFixed(1)+' ど',200,223,32,'#fff',hot?'#ff4a5a':'#5aa8ff');}
      if(!tr.placed&&!tr.drag){const[hx,hy]=PP('head');c.strokeStyle='rgba(255,255,255,.9)';c.setLineDash([8,6]);c.lineWidth=4;c.beginPath();c.arc(hx,hy-30,40,0,TAU);c.stroke();c.setLineDash([]);}}
    if(tr.t==='med'){tr.opts.forEach((o,i)=>{const x=110+i*90,sh=o.sh>0?Math.sin(o.sh*40)*6:0;if(tr.feed!=null&&o.k===tr.col)return;c.save();c.translate(x+sh,655);c.fillStyle='rgba(255,255,255,.9)';circ(c,0,0,38);drawIcon(c,'med:'+o.k,0,0,1.5);c.restore();});
      if(tr.feed!=null){const[mx,my]=PP('mouth');const k=Math.min(1,tr.feed);drawIcon(c,'spoon',lerp(200,mx+24,k),lerp(640,my+10,k),1.3);drawIcon(c,'med:'+tr.col,110,655,1.2);}}
    if(tr.t==='band'||tr.t==='thorn'){for(const s of tr.spots)if(!s.on){c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=3;c.beginPath();c.arc(s.x,s.y,20+Math.sin(T*6)*3,0,TAU);c.stroke();}
      c.fillStyle='rgba(255,255,255,.92)';rr(c,130,618,140,70,35);c.fill();drawIcon(c,tr.t==='band'?'band':'tweezers',165,653,.9);otext(c,`${tr.cnt} / ${tr.spots.length}`,225,655,26,'#ff5fa2','#fff');}
    if(tr.t==='rub'){c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=4;c.setLineDash([8,6]);c.beginPath();c.arc(tr.cx,tr.cy,52,0,TAU);c.stroke();c.setLineDash([]);
      c.fillStyle='rgba(255,255,255,.9)';rr(c,70,640,260,30,15);c.fill();c.fillStyle=vfill(c,640,670,'#ff8cc6');rr(c,74,644,252*tr.m,22,11);c.fill();
      if(tr.px!=null)drawIcon(c,tr.area==='mouth'?'toothbrush':tr.area==='face'?'tissue':'heart',tr.px,tr.py,1);
      if(tr.pop!=null&&tr.item){const k=Math.min(1,tr.pop/.8);const[mx,my]=PP('mouth');drawGlow(c,'#fff6a0',lerp(mx,200,k),lerp(my,250,k),60,.8);drawIcon(c,tr.item,lerp(mx,200,k),lerp(my,250,k)-Math.sin(k*Math.PI)*80,1+k);}}
    if(tr.t==='sleep'&&tr.sl==null)drawIcon(c,'blanket',200,650,1.8);},
  down(x,y){const d=this.d;if(this.fin!=null)return;
    if(this.ph==='exam'&&!this.anim){TOOLS.forEach((k,i)=>{if(inC(x,y,this.toolX(i),652,36)){this.anim={k,t:0};this.used[k]=true;sfx('pop');if(k==='light'){say('あーん してね','fu');}if(k==='xray')sfx('whoosh');}});return;}
    if(this.ph==='diag'){this.dopts.forEach((o,i)=>{if(!inR(x,y,80+i*120,640,108,116))return;if(o.k===d.diag.ans){this.ph='diagok';this.t=0;sfx('ok');burst(80+i*120,640,20);say(d.diag.ok||'そうだね！','fu');}else{o.sh=.5;sfx('no');say('ちがうみたい。 しらべた ことを おもいだしてね','rk');}});return;}
    if(this.ph!=='treat')return;const tr=this.tr;if(tr.wait!=null)return;
    if(tr.t==='ice'&&!tr.placed&&inC(x,y,tr.ix,tr.iy,50)){tr.drag=true;}
    if(tr.t==='med'&&tr.feed==null)tr.opts.forEach((o,i)=>{if(!inC(x,y,110+i*90,655,42))return;if(o.k===tr.col){tr.feed=0;sfx('pop');}else{o.sh=.5;sfx('no');const w=WORDS[o.k];say([[`それは ${w[0]}。`,'ja'],[w[1],'en']],'rk');}});
    if((tr.t==='band'||tr.t==='thorn')){for(const s of tr.spots){if(!s.on&&inC(x,y,s.x,s.y,30)){s.on=true;s.t=0;tr.cnt++;sfx(tr.t==='band'?'pop':'jump');burst(s.x,s.y,8,tr.t==='band'?'heart':'star');say(JA_NUM[tr.cnt],'fu',EN_NUM[tr.cnt]);
          if(tr.spots.every(q=>q.on)){if(tr.t==='thorn')this.cond.thorn=false;else this.cond.scrape=false;setTimeout(()=>{if(scene===this)say(tr.t==='band'?'ぜんぶ はれたね！ いたいの いたいの とんでいけ〜！':'とげが ぜんぶ ぬけた！','fu');},700);this.after(2.6);}break;}}}
    if(tr.t==='rub'&&tr.pop==null){tr.px=x;tr.py=y;}
    if(tr.t==='sleep'&&tr.sl==null&&inC(x,y,200,650,60)){tr.sl=0;sfx('heal');say('おやすみなさい','fu','Good night!');}},
  move(x,y){if(this.ph!=='treat')return;const tr=this.tr;
    if(tr.t==='ice'&&tr.drag){tr.ix=x;tr.iy=y;}
    if(tr.t==='rub'&&tr.px!=null&&tr.pop==null&&!tr.done){const dd=Math.hypot(x-tr.px,y-tr.py);if(inC(x,y,tr.cx,tr.cy,80)){tr.m=Math.min(1,tr.m+dd/1100);sfx('scrub');if(Math.random()<.3)PARTS.push({x,y,vx:rand(-30,30),vy:rand(-80,-30),g:0,life:.8,max:.8,kind:tr.area==='mouth'?'dot':'heart',col:tr.area==='mouth'?'#fff':'#ff8cc6',r:rand(5,10)});}
      tr.px=x;tr.py=y;if(tr.m>=1){if(tr.area==='face')this.cond.powder=false;if(tr.item){tr.pop=0;sfx('burp');const w=wordOf(tr.item)||['',''];setTimeout(()=>{if(scene===this){sfx('find');showCard(tr.item,w[0],w[1]);say(`ポンッ！ ${w[0]}が でてきた！`,'fu',w[1]);}},300);}else{tr.pop=1.4;sfx('ok');say(tr.area==='mouth'?'ピカピカに なった！':tr.area==='face'?'きれいに なった！':'おなかが すっきり！','fu');this.cond.sick=false;}}}},
  up(x,y){if(this.ph!=='treat')return;const tr=this.tr;
    if(tr.t==='ice'&&tr.drag){tr.drag=false;const[hx,hy]=PP('head');if(Math.hypot(x-hx,y-(hy-30))<70){tr.placed=true;sfx('heal');const from=Math.floor(this.d.tools.thermo||38);const seq=[];for(let n=from;n>=37;n--)seq.push(JA_NUM[n-30]?`さんじゅう${JA_NUM[n-30]}`:'');say([...seq,'さんじゅうろく！ おねつが さがったよ！'],'fu');}else{tr.ix=200;tr.iy=655;}}
    if(tr.t==='rub')tr.px=null;},
  hint(){const d=this.d;if(this.ph==='exam'&&!this.anim){const k=d.need.find(k=>!this.used[k])||TOOLS.find(k=>!this.used[k]);const i=TOOLS.indexOf(k);return i>=0?{x:this.toolX(i),y:652}:null;}
    if(this.ph==='diag'){const i=this.dopts.findIndex(o=>o.k===d.diag.ans);return IDLE>12?{x:80+i*120,y:640}:null;}
    if(this.ph==='treat'){const tr=this.tr;if(tr.wait!=null)return null;if(tr.t==='ice'&&!tr.placed){const[hx,hy]=PP('head');const k=(T*.6)%1;return{x:lerp(200,hx,ease(k)),y:lerp(655,hy-30,ease(k))};}
      if(tr.t==='med'&&tr.feed==null){const i=tr.opts.findIndex(o=>o.k===tr.col);return{x:110+i*90,y:655};}if(tr.spots){const s=tr.spots.find(s=>!s.on);return s?{x:s.x,y:s.y}:null;}
      if(tr.t==='rub'&&tr.pop==null)return{x:tr.cx+Math.sin(T*6)*40,y:tr.cy};if(tr.t==='sleep'&&tr.sl==null)return{x:200,y:650};}return null;},
};

// ================= ぬいぐるみ びょういん =================
M('needle',c=>{c.rotate(-.7);c.strokeStyle='#a8b4c8';c.lineWidth=4;c.lineCap='round';c.beginPath();c.moveTo(0,-30);c.lineTo(0,26);c.stroke();c.strokeStyle='#fff';c.lineWidth=1.5;c.beginPath();c.ellipse(0,20,1.5,4,0,0,TAU);c.stroke();c.strokeStyle='#ff5fa2';c.lineWidth=2.5;c.beginPath();c.moveTo(0,20);c.quadraticCurveTo(18,30,10,44);c.stroke();});
M('cotton',c=>{c.fillStyle='#fff';c.strokeStyle='#d8dce8';c.lineWidth=2;for(const [a,b,r] of[[-12,4,14],[8,2,16],[0,-10,14],[-4,12,12],[12,12,11]]){c.beginPath();c.arc(a,b,r,0,TAU);c.fill();c.stroke();}c.fillStyle='#fff';circ(c,0,4,14);});
M('dryer',c=>{c.rotate(-.2);c.fillStyle=gfill(c,-6,-6,30,'#ff8cc0');OL(c,'#d85a90');rr(c,-26,-18,44,32,14);c.fill();c.stroke();rr(c,-10,10,14,30,6);c.fill();c.stroke();c.fillStyle='#fff';rr(c,16,-12,14,20,4);c.fill();c.stroke();c.fillStyle='#ffd23a';circ(c,-6,-2,5);});
M('button',(c,o)=>{const col=o.col||'#5aa8ff';c.fillStyle=gfill(c,-3,-3,16,col,.3,-.2);OL(c,shade(col,-.2),2);c.beginPath();c.arc(0,0,15,0,TAU);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.85)';for(const [a,b] of[[-4,-4],[4,-4],[-4,4],[4,4]])circ(c,a,b,2.4);});
Object.assign(WORDS,{needle:['はりと いと','needle and thread'],cotton:['わた','cotton'],dryer:['ドライヤー','hair dryer'],button:['ボタン','button']});
const TOYS=['bear','rabbit','dog','cat','panda','sheep','pig','koala'];
const BCOLS=[['#ff4d6d','あか','red'],['#4a9cff','あお','blue'],['#ffc83a','きいろ','yellow'],['#4cc86a','みどり','green'],['#3a2a2a','くろ','black']];
SCN.toy={bg:'#fff6ee',song:'fuwa',
  enter(){const lv=lvOf('toy');this.owner=newPatient();this.tk=pick(TOYS);const probs=shuffle(['tear','eye','arm','stain','flat']).slice(0,lv<1?2:3);this.probs=probs;this.steps=[];
    if(probs.includes('flat'))this.steps.push('flat');if(probs.includes('stain'))this.steps.push('wash','dry');if(probs.includes('tear'))this.steps.push('cotton','sewT');if(probs.includes('arm'))this.steps.push('armon','sewA');if(probs.includes('eye'))this.steps.push('eyebtn','sewE');this.steps.push('ribbon');
    this.si=-1;this.miss=0;this.fin=0;this.tools=[];this.lay();this.eyeMiss=probs.includes('eye')?(Math.random()<.5?-1:1):0;this.eyeC=pick(BCOLS);this.newEye=null;this.armOff=probs.includes('arm');this.flat=probs.includes('flat')?.72:1;this.pumpN=3+Math.floor(Math.random()*4);this.pumps=0;
    this.stains=probs.includes('stain')?[...Array(3+Math.floor(Math.random()*2))].map(()=>({a:rand(-24,24),b:rand(-60,-16),hp:1})):[];this.bub=[];this.wet=0;this.tear=probs.includes('tear');this.cottonIn=0;this.cottonN=3;this.stitch=null;this.done={};this.bow=null;this.hug=0;this.armX=null;
    greetPt(this.owner,`${WORDS[this.tk][0]}の ぬいぐるみが ${{tear:'やぶれちゃった',eye:'めが とれちゃった',arm:'うでが とれちゃった',stain:'よごれちゃった',flat:'ぺちゃんこに なっちゃった'}[probs[0]]}… なおして くれる？`);
    setTimeout(()=>{if(scene===this)this.startStep();},3600);},
  lay(){this.tx=W/2+30;this.ty=H*.62;this.s=1.7;},
  toyP(a,b){return{x:this.tx+a*this.s,y:this.ty+b*this.s*this.flat};},
  mkStitch(pts){this.stitch={pts:pts.map(([a,b])=>this.toyP(a,b)),i:0};},
  startStep(){this.si++;const k=this.steps[this.si];this.key=k;this.tools=[];this.prog=0;
    const pool=['needle','cotton','sponge','dryer','bandage','toothbrush','steth'];
    const want={flat:'cotton',wash:'sponge',dry:'dryer',cotton:'cotton',sewT:'needle',sewA:'needle',sewE:'needle'}[k];this.want=want;if(want)this.tools=mkTray(trayChoices(want,pool,3),H-84,50);
    if(k==='sewT')this.mkStitch([[-24,-34],[-14,-42],[-4,-32],[6,-42],[16,-32],[24,-40]]);
    if(k==='sewA')this.mkStitch([[26,-56],[34,-50],[26,-44],[34,-38]]);
    if(k==='sewE')this.mkStitch([[this.eyeMiss*13-5,-88],[this.eyeMiss*13+5,-84],[this.eyeMiss*13-5,-80]]);
    if(k==='armon')this.armX={x:W-90,y:H*.44,held:0};
    if(k==='eyebtn')this.btns=shuffle(BCOLS).slice(0,4).concat([]).filter((v,i,a)=>a.indexOf(v)===i);if(k==='eyebtn'&&!this.btns.includes(this.eyeC))this.btns[0]=this.eyeC;if(k==='eyebtn')this.btns=shuffle(this.btns);
    if(k==='ribbon')this.ribs=shuffle(['#ff5fa2','#5aa8ff','#ffc83a','#b48cff']).slice(0,3);
    const nm=WORDS[this.tk][0];
    const msg={flat:`わたが へって ぺちゃんこ。 わたを ${this.pumpN}かい つめよう！ わたは どれ？`,wash:'シミを あらおう。 スポンジは どれ？',dry:'ぬれちゃった。 かわかす どうぐは どれ？',cotton:'やぶれて わたが でてる。 わたを もどそう！',sewT:'はりと いとで チクチク ぬおう。 1から じゅんばんに タッチ！',
      armon:'とれた うでを かたに くっつけよう。 うでを うごかしてね',sewA:'うでを ぬいつけよう。 はりと いとは どれ？',eyebtn:`めの ボタンが とれてる。 もう かたほうと おなじ ${this.eyeC[1]}の ボタンは どれ？`,sewE:'ボタンを ぬいつけよう',ribbon:`さいごに ${nm}に リボンを つけて あげよう！ いろを えらんでね`}[k];
    say(msg);if(k==='eyebtn'){speak(this.eyeC[2],'en');}},
  next(d=1.4){const k=this.key;this.tools.forEach(t=>t.hidden=true);setTimeout(()=>{if(scene!==this||this.key!==k)return;this.tools=[];this.stitch=null;if(this.si+1>=this.steps.length)this.giveBack();else{stepClear(pick(['OK！','ばっちり！','チクチク じょうず！']));this.startStep();}},d*1000);},
  giveBack(){this.hug=.01;banner('なおったよ！','#ff9a3a',`${WORDS[this.tk][0]}さん ピカピカ！`);setTimeout(()=>{if(scene===this)say(`わーい！ ありがとう せんせい！ ${WORDS[this.tk][0]}さん だいじに するね！`);},900);},
  update(dt){for(const t of this.tools)t.upd(dt);const d=this.tools.find(t=>t.held);
    if(this.key==='dry'&&d&&d.k==='dryer'){const p=this.toyP(0,-50);if(Math.hypot(d.x-p.x,d.y-p.y)<150){this.wet=Math.max(0,this.wet-dt*.7);if(Math.random()<dt*20)parts.push({x:d.x-20,y:d.y,vx:rand(-200,-120),vy:rand(-30,30),life:.5,t:0,kind:'puff',col:'#fff4d8',r:6});if(Math.random()<dt*6)tone(300+Math.random()*50,.1,'sawtooth',.02);if(this.wet<=0&&!this.done.dry){this.done.dry=1;d.held=false;good(p.x,p.y,2,'ふわふわ！');this.next();}}}
    if(this.hug>0){this.hug+=dt;if(this.hug>4&&!this.fin)this.fin=.01;}
    if(this.fin>0){this.fin+=dt;if(this.fin>.4&&this.fin<9){this.fin=9;celebrate('toy',starsFor(this.miss));}}},
  draw(c){roomBg(c,'#fff4ea','#f0e0cc',H*.5,'#fffaf2',[['window',96,H*.5-220,1,110,86,'#ffd8b0'],['shelf',W-110,H*.5-180,1]]);
    for(let i=0;i<4;i++)drawAnimal(c,['bear','rabbit','cat','dog'][i],W-170+i*44,H*.5-190,.3,{t:T+i,plush:1,happy:1});
    c.fillStyle='#ffe0e8';rr(c,this.tx-190,this.ty-20,380,60,20);c.fill();c.strokeStyle='#ffb3c8';c.lineWidth=4;c.setLineDash([10,8]);rr(c,this.tx-178,this.ty-12,356,44,16);c.stroke();c.setLineDash([]);
    const hg=this.hug>0;const ox=hg?lerp(this.tx,110,Math.min(1,this.hug/1.2)):this.tx,oy=hg?lerp(this.ty,H*.52,Math.min(1,this.hug/1.2)):this.ty;
    c.save();c.translate(ox,oy);c.scale(1,this.flat);c.translate(-ox,-oy);
    const ec={'-1':this.eyeC[0],'1':this.eyeC[0]};
    drawAnimal(c,this.tk,ox,oy,hg?1.2:this.s,{t:T,plush:1,eyeMiss:this.newEye?0:this.eyeMiss,eyeCol:ec,armOff:this.armOff,happy:hg,acc:this.bow?'ribbon':'none',accC:this.bow});c.restore();
    if(!hg){for(const q of this.stains){if(q.hp<=0)continue;c.globalAlpha=q.hp;c.fillStyle='#9a7a5a';const p=this.toyP(q.a,q.b);circ(c,p.x,p.y,10);circ(c,p.x+8,p.y+4,7);c.globalAlpha=1;}
      if(this.wet>0){c.fillStyle=`rgba(120,190,255,${.35*this.wet})`;const p=this.toyP(0,-50);ell(c,p.x,p.y,70,90);for(let i=0;i<4;i++){c.fillStyle='rgba(120,200,255,.8)';const dy=(T*40+i*20)%60;ell(c,p.x-40+i*26,p.y+30+dy,3,5);}}
      for(const b of this.bub){c.fillStyle='rgba(255,255,255,.9)';circ(c,b.x,b.y,b.r);}
      if(this.tear&&!this.done.sewT){const p=this.toyP(0,-37);c.fillStyle='#fff';for(let i=0;i<Math.max(0,this.cottonN-this.cottonIn);i++){circ(c,p.x-20+i*18,p.y-18-(i%2)*8,12);}c.strokeStyle='#8a5a4a';c.lineWidth=3;c.beginPath();c.moveTo(p.x-40,p.y);for(let i=0;i<8;i++)c.lineTo(p.x-40+i*11,p.y+(i%2?-6:6));c.stroke();}
      if(this.armOff&&this.armX){const A=this.armX;c.save();c.translate(A.x,A.y);c.rotate(-.5);c.fillStyle=gfill(c,0,0,30,AN[this.tk].c==='#ffffff'?'#f4f0f8':AN[this.tk].c);c.strokeStyle='#8a7a6a';c.lineWidth=3;c.beginPath();c.ellipse(0,0,17,27,0,0,TAU);c.fill();c.stroke();c.restore();if(!A.held)targetMark(c,this.toyP(30,-50).x,this.toyP(30,-50).y,30);}
      else if(this.armOff&&!this.armX){const A={x:W-90,y:H*.44};c.save();c.translate(A.x,A.y);c.rotate(-.5);c.fillStyle=AN[this.tk].c==='#ffffff'?'#f4f0f8':AN[this.tk].c;c.strokeStyle='#8a7a6a';c.lineWidth=3;c.beginPath();c.ellipse(0,0,17,27,0,0,TAU);c.fill();c.stroke();c.restore();}}
    const S=this.stitch;if(S){c.strokeStyle='#ff5fa2';c.lineWidth=4;c.beginPath();for(let i=0;i<S.i;i++){const p=S.pts[i];i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y);}c.stroke();S.pts.forEach((p,i)=>{if(i<S.i){c.fillStyle='#ff5fa2';circ(c,p.x,p.y,4);return;}c.fillStyle=i===S.i?'#fff6a0':'rgba(255,255,255,.85)';circ(c,p.x,p.y,13);c.strokeStyle='#ff9ac8';c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,13,0,TAU);c.stroke();txt(c,String(i+1),p.x,p.y+1,14,'#ff5fa2');});}
    if(this.key==='flat'&&!hg){c.fillStyle='#fff';rr(c,W/2-120,H-170,240,20,10);c.fill();c.fillStyle='#ffc8e0';rr(c,W/2-120,H-170,240*this.pumps/this.pumpN,20,10);c.fill();txt(c,`わた ${this.pumps} / ${this.pumpN}`,W/2,H-196,22,'#ff5fa2');}
    if(this.key==='eyebtn'&&!hg){tray(c,H-84,110);this.btns.forEach((b,i)=>{const x=W/2+(i-(this.btns.length-1)/2)*120;MED.button(c,x,H-84,1.6,{col:b[0]});txt(c,b[1],x,H-44,14,'#8a6a5a');});}
    if(this.key==='ribbon'&&!hg){tray(c,H-84,110);this.ribs.forEach((col,i)=>{const x=W/2+(i-1)*150;bow(c,x,H-90,20,col);});}
    if(this.key==='wash'&&this.done.wash)txt(c,'',0,0,1,'#000');
    drawPt(c,this.owner,hg?150:70,H*.52,.75,{t:T,sad:!hg,cry:!hg&&this.si<0,happy:hg,dance:hg&&this.hug>1.2,hop:hg?Math.abs(Math.sin(T*6))*.4:0});
    fu(c,70,H-150,2,{point:!hg,cheer:hg});rk(this,c,W-54,H-150,1.4);
    if(this.tools.some(t=>!t.hidden)){tray(c,H-84,110);for(const t of this.tools)if(!t.held)t.draw(c,1.2);for(const t of this.tools)if(t.held)t.draw(c,1.45);}
    stepDots(c,this.steps.length,Math.max(0,this.si)+(hg?1:0));},
  down(x,y){if(this.fin||this.hug||this.si<0)return;const k=this.key;
    if(k==='armon'){const A=this.armX;if(A&&Math.hypot(x-A.x,y-A.y)<50){A.held=1;sfx('tap');}return;}
    if(k==='eyebtn'){this.btns.forEach((b,i)=>{const bx=W/2+(i-(this.btns.length-1)/2)*120;if(hitC(x,y,bx,H-84,40)){if(b===this.eyeC){this.newEye=b;this.btns=[];good(this.toyP(this.eyeMiss*13,-86).x,this.toyP(0,-86).y,2,'おなじ いろ！');hush();speak(`${b[1]}！`);speak(b[2],'en');this.next(1.4);}else{bad();this.miss++;hush();speak(`それは ${b[1]}。 ${this.eyeC[1]}を さがそう`);speak(b[2],'en');}}});return;}
    if(k==='ribbon'){this.ribs.forEach((col,i)=>{if(hitC(x,y,W/2+(i-1)*150,H-90,50)){this.bow=col;this.ribs=[];good(this.toyP(20,-118).x,this.toyP(0,-118).y,2,'かわいい！');this.next(1.2);}});return;}
    if(this.stitch&&this.tools.length===0){this.stitchHit(x,y);return;}
    for(const t of this.tools){if(t.hit(x,y)){if(t.k!==this.want){this.miss++;wrongTool(t);return;}
      if(k==='flat'||k==='cotton'){this.cottonTap(t);return;}
      if((k==='sewT'||k==='sewA'||k==='sewE')){sayWord('needle');this.tools=[];return;}
      t.held=true;t.px2=x;t.py2=y;sfx('tap');sayWord(t.k);return;}}},
  cottonTap(t){sfx('squish');const p=this.toyP(0,-40);parts.push({x:t.hx,y:t.hy,vx:(p.x-t.hx)*1.6,vy:(p.y-t.hy)*1.6,life:.6,t:0,kind:'puff',col:'#fff',r:16});
    if(this.key==='flat'){this.pumps++;this.flat=Math.min(1,.72+.28*this.pumps/this.pumpN);hush();speak(String(this.pumps));speak(numEn(this.pumps),'en');if(this.pumps>=this.pumpN){good(p.x,p.y,2,'ふっくら！');this.next();}}
    else{this.cottonIn++;hush();speak(String(this.cottonIn),'en');if(this.cottonIn>=this.cottonN){good(p.x,p.y,1,'もどった！');this.next();}}},
  stitchHit(x,y){const S=this.stitch,p=S.pts[S.i];if(!p)return;if(Math.hypot(x-p.x,y-p.y)<30){S.i++;sfx('snap');burst(p.x,p.y,4,'star');hush();speak(String(S.i),'en');if(S.i>=S.pts.length){const k=this.key;good(p.x,p.y,2,'チクチク かんせい！');if(k==='sewT'){this.done.sewT=1;this.tear=false;}if(k==='sewA')this.armOff=false;if(k==='sewE')this.eyeMiss=0;this.next(1.2);}}},
  move(x,y){const k=this.key;if(k==='armon'&&this.armX&&this.armX.held){this.armX.x=x;this.armX.y=y;return;}if(this.stitch&&this.tools.length===0&&ptrId!==null){this.stitchHit(x,y);return;}
    const t=this.tools.find(q=>q.held);if(!t)return;const d=Math.hypot(x-t.px2,y-t.py2);t.x=x;t.y=y;t.px2=x;t.py2=y;
    if(k==='wash'&&t.k==='sponge'){for(const q of this.stains){if(q.hp<=0)continue;const p=this.toyP(q.a,q.b);if(Math.hypot(x-p.x,y-20-p.y)<50){q.hp-=d/200;if(Math.random()<.4)this.bub.push({x:p.x+rand(-20,20),y:p.y+rand(-20,20),r:rand(6,12)});if(q.hp<=0)good(p.x,p.y,1,'ピカピカ');}}
      if(this.stains.every(q=>q.hp<=0)&&!this.done.wash){this.done.wash=1;t.held=false;this.bub=[];this.wet=1;say('きれいに なった！ でも びしょびしょ');this.next();}}},
  up(x,y){const k=this.key;if(k==='armon'&&this.armX&&this.armX.held){this.armX.held=0;const g=this.toyP(30,-50);if(Math.hypot(x-g.x,y-g.y)<60){this.armX=null;this.armOff=true;this.armOn=1;good(g.x,g.y,1,'くっついた！');this.armOff=false;this.armStitchPending=1;this.next(1);}return;}
    const t=this.tools.find(q=>q.held);if(t)t.held=false;},
  hint(){if(this.fin||this.hug||this.si<0)return null;const k=this.key;
    if(k==='armon'){const A=this.armX;if(!A)return null;const g=this.toyP(30,-50);return{x:A.x,y:A.y,x2:g.x,y2:g.y};}
    if(k==='eyebtn'){const i=this.btns.indexOf(this.eyeC);return i<0?null:{x:W/2+(i-(this.btns.length-1)/2)*120,y:H-84};}
    if(k==='ribbon')return this.ribs.length?{x:W/2-150,y:H-90}:null;
    if(this.stitch&&this.tools.length===0){const p=this.stitch.pts[this.stitch.i];return p?{x:p.x,y:p.y}:null;}
    const t=this.tools.find(q=>q.k===this.want);if(!t||t.hidden)return null;
    if(k==='flat'||k==='cotton'||k.startsWith('sew'))return{x:t.hx,y:t.hy};
    if(k==='wash'){const q=this.stains.find(q=>q.hp>0);if(!q)return null;const p=this.toyP(q.a,q.b);return{x:t.hx,y:t.hy,x2:p.x+rand(-8,8),y2:p.y+20};}
    if(k==='dry'){const p=this.toyP(0,-50);return{x:t.hx,y:t.hy,x2:p.x+90,y2:p.y};}return null;},
  hintText(){return{flat:'わたを タッチ',wash:'スポンジで シミを ごしごし',dry:'ドライヤーを あてよう',cotton:'わたを タッチして もどそう',sewT:'はりを えらんで 1から じゅんばんに',sewA:'はりを えらんで じゅんばんに',sewE:'はりを えらんで じゅんばんに',armon:'うでを かたへ',eyebtn:'おなじ いろの ボタン',ribbon:'リボンを えらんでね'}[this.key]||'';}};

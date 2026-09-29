// ================= しかいいん の アトラクション (1) =================
const DZONES=[['みぎうえ',1,-1],['ひだりうえ',1,1],['みぎした',0,-1],['ひだりした',0,1]];
function zoneTeeth(S,z){return S.M.teeth.filter(t=>t.top===!!z[1]&&t.side===z[2]);}// かんじゃさんの みぎ = がめんの ひだり
function zonePos(S,z){const ts=zoneTeeth(S,z),ps=ts.map(t=>dmPos(S.M,t));return{x:ps.reduce((a,p)=>a+p.x,0)/ps.length,y:ps.reduce((a,p)=>a+p.y,0)/ps.length};}
function toothOpt(type,label){return{label,draw(c,x,y){const t={type,i:0,top:true,d:type==='inc'?0:type==='can'?2:4};c.save();c.translate(x,y);c.scale(1.5,1.5);const g=c.createLinearGradient(0,-26,0,26);g.addColorStop(0,'#eef0f4');g.addColorStop(1,'#ffffff');c.fillStyle=g;dmToothPath(c,t,type==='mol'?46:34,type==='mol'?36:46);c.fill();c.strokeStyle='#b8c0cc';c.lineWidth=2;c.stroke();c.restore();}};}
function numOpt(n,ok,unit='ほん'){return{label:`${n}${unit}`,ok,draw(c,x,y){txt(c,String(n),x,y,46,'#2a9a7a',undefined,POP,400);}};}
function chartDraw(c,S,cx,cy){const n=S.M.n,bw=Math.min(26,260/n);panel(c,cx-n*bw/2-20,cy-50,n*bw+40,104,18,'rgba(255,255,255,.95)','#9fe0cf',3);txt(c,'けんしんひょう',cx,cy-36,13,'#2a9a7a');
  for(const top of[true,false])for(let i=0;i<n;i++){const t=S.M.teeth.find(q=>q.top===top&&q.i===i),x=cx+(i-(n-1)/2)*bw,y=cy+(top?-8:22);c.strokeStyle='#c8e0d8';c.lineWidth=1.5;c.strokeRect(x-bw/2+1,y-12,bw-2,24);
    if(t.mark)txt(c,'C',x,y,16,'#ff3a5a');else if(t.seen)txt(c,'○',x,y,13,'#5ac8a8');}
  c.strokeStyle='#9fe0cf';c.lineWidth=2;c.beginPath();c.moveTo(cx,cy-20);c.lineTo(cx,cy+36);c.moveTo(cx-n*bw/2,cy+7);c.lineTo(cx+n*bw/2,cy+7);c.stroke();}
// ---------- 1. しか けんしん ----------
dGame('dcheck',{kind:'baby',
  setup(){const n=this.lv<1?2:this.lv<3?3:4;shuffle(this.M.teeth).slice(0,n).forEach(t=>{t.hid=1;t.cx=rand(-.15,.15);});this.ncav=n;},
  intro(){return greetD(this,'しか けんしんに ようこそ！ おくちの なかを しらべて けんしんひょうに かこう');},
  plan(){const S=this;const st=[];
    if(Math.random()<.5)st.push({type:'quiz',say:'もんだい！ こどもの はは ぜんぶで なんぼん？',hint:'こたえを タッチ',opts:()=>[numOpt(10,0),numOpt(20,1),numOpt(32,0)],right(){sayNum(20,'こどもの はは ','ほん！ おとなに なると 28ほんに なるよ');}});
    else st.push({type:'tap',say:'うえの はを かぞえよう。 1ぽんずつ タッチ！',hint:'うえの はを タッチ',begin(){this.cnt=0;},targets(){return this.M.teeth.filter(t=>t.top).sort((a,b)=>a.i-b.i).map(t=>t.q||(t.q={t}));},r:26,
      tapT(q,p){q.done=1;this.cnt++;q.t.num=this.cnt;sfx('pop');hush();speak(String(this.cnt),'en');},end(){sayNum(this.cnt,'うえの はは ','ほん！ したも 10ぽんで ぜんぶで 20ぽん');return{delay:3};}});
    st.push({type:'rub',tool:'mirror',say:'デンタルミラーで おくちの なかを ぐるっと みよう',hint:'ミラーで 4つの ばしょを みよう',per:90,r:80,begin(){this.M.teeth.forEach(t=>t.num=0);},targets(){return this.zq||(this.zq=DZONES.map(z=>Object.assign({z},zonePos(this,z))));},
      hit(q,p){zoneTeeth(this,q.z).forEach(t=>t.seen=1);sfx('spark');const f=zoneTeeth(this,q.z).filter(t=>t.hid).length;good(p.x,p.y,1,f?'あやしい？':'げんき！');}});
    st.push({type:'rub',tool:'explorer',say:'たんしんで あやしい はを そっと さわって たしかめよう',hint:'たんしんで あやしい はを さわる',per:60,r:34,snd:'tick',targets(){return this.M.teeth.filter(t=>t.hid).map(t=>t.q2||(t.q2={t}));},
      hit(q,p){q.t.cav=.8;q.t.hid=0;sfx('squeak');good(p.x,p.y,1,'むしば！');}});
    st.push({type:'tap',say:'むしばの はに タッチして けんしんひょうに C の しるしを つけよう',hint:'むしばに タッチ',r:30,targets(){return this.M.teeth.filter(t=>t.cav&&!t.mark).map(t=>t.q3||(t.q3={t}));},
      tapT(q,p){q.done=1;q.t.mark=1;sfx('clip');good(p.x,p.y,1,'C');},end(){sayNum(this.ncav,'むしばは ','ほん みつかったよ');return{delay:2.4};}});
    st.push(Math.random()<.5?{type:'quiz',say:'けんしんひょうの C は なんの しるし？',hint:'こたえを タッチ',opts:()=>[{label:'むしば',ok:1,draw:(c,x,y)=>txt(c,'C',x,y,50,'#ff3a5a',undefined,POP,400)},{label:'げんきな は',draw:(c,x,y)=>txt(c,'○',x,y,44,'#5ac8a8')},{label:'ぬけた は',draw:(c,x,y)=>txt(c,'／',x,y,44,'#8a8aa8')}],right(){say('せいかい！ C は むしばの しるし。 えいごの Caries（カリエス）の C だよ');}}
      :{type:'quiz',say:'むしばは なんぼん あった？',hint:'けんしんひょうを みてね',opts:()=>shuffle([this.ncav,this.ncav+1,Math.max(1,this.ncav-1)===this.ncav?this.ncav+2:Math.max(1,this.ncav-1)]).map(n=>numOpt(n,n===this.ncav)),right(){sayNum(this.ncav,'','ほん！ はいしゃさんで なおそうね');}});
    return st;},
  draw(c){dentBg(c,this);dmFace(c,this,{happy:this.fin>0});
    for(const t of this.M.teeth){const p=dmPos(this.M,t);if(t.num){c.fillStyle='#ff5fa2';circ(c,p.x,p.y-p.h*.9,13);txt(c,String(t.num),p.x,p.y-p.h*.9,14,'#fff');}if(t.mark){c.fillStyle='#ff3a5a';circ(c,p.x,p.y+(t.top?-1:1)*p.h*.95,12);txt(c,'C',p.x,p.y+(t.top?-1:1)*p.h*.95,15,'#fff');}}
    chartDraw(c,this,W/2,H-262);this.drawCommon(c);}});
// ---------- 2. レントゲン ----------
dGame('dxray',{kind:'baby',
  setup(){this.view='room';this.side=pick([-1,1]);this.mode=this.lv<1?pick(['cav','buds']):pick(['cav','buds','both']);this.film=0;this.flash=0;
    const molars=this.M.teeth.filter(t=>t.type==='mol'&&t.side===this.side);shuffle(molars).slice(0,this.lv<2?1:2).forEach(t=>t.xcav=1);},
  intro(){return greetD(this,'レントゲンしつ だよ。 はの なかの しゃしんを とろう！');},
  plan(){const sd=this.side<0?'みぎ':'ひだり';const st=[
    {type:'drop',tool:'apron',say:'まずは からだを まもる エプロンを かけてあげよう',hint:'エプロンを からだに',r:110,at(){return{x:W/2,y:H*.56};},ok(){this.apron=1;sfx('wrap');say('ほうしゃせんから からだを まもる エプロンだよ');return{delay:2.2};}},
    {type:'drop',tool:'sensor',say:`${sd}の おくばの よこに センサーを いれよう`,hint:'センサーを おくちの よこに',r:70,at(){return{x:W/2-this.side*-50,y:H*.34};},ok(){this.sensor=1;sfx('clip');say('センサーを かんで うごかないでね');return{delay:1.8};}},
    {type:'tap',say:'ふーちゃんは おへやの そとへ！ ボタンを おして さつえい',hint:'ボタンを タッチ',r:60,targets(){return this.btn||(this.btn=[{x:W-110,y:H-330}]);},
      tapT(q){q.done=1;this.outT=0;hush();[3,2,1].forEach((n,i)=>setTimeout(()=>{if(scene===this){speak(String(n),'en');sfx('beep');}},i*700));setTimeout(()=>{if(scene===this){this.flash=1;sfx('xray');this.view='film';this.film=.01;}},2200);},end(){return{delay:3.4};}}];
    if(this.mode!=='buds')st.push({type:'tap',say:'しゃしんで くろい かげが むしばだよ。 さがして タッチ！',hint:'くろい かげを タッチ',r:34,targets(){return this.M.teeth.filter(t=>t.xcav).map(t=>t.qx||(t.qx=Object.assign({tt:t},this.xpos(t))));},
      tapT(q,p){q.done=1;q.tt.xfound=1;sfx('ding');good(p.x,p.y,1,'むしば！');},end(){say('はの あいだの むしばは めで みても わからないけど レントゲンなら みつかるよ');return{delay:3.2};}});
    if(this.mode!=='cav')st.push({type:'tap',say:'こどもの はの したに おとなの はが かくれているよ！ タッチして かぞえよう',hint:'したに かくれた はを タッチ',r:30,begin(){this.bn=0;},targets(){return this.buds||(this.buds=this.M.teeth.filter(t=>t.type==='inc').slice(0,this.lv<1?4:6).map(t=>Object.assign({tt:t},this.xpos(t,1))));},
      tapT(q,p){q.done=1;this.bn++;sfx('pop');hush();speak(String(this.bn),'en');good(p.x,p.y,1,String(this.bn));},end(){sayNum(this.bn,'おとなの はが ','ほん まっているね');return{delay:2.6};}});
    st.push({type:'quiz',say:'もんだい！ レントゲンで みえるのは なに？',hint:'こたえを タッチ',opts:()=>[{label:'はの なか',ok:1,draw:(c,x,y)=>{c.fillStyle='#1a2a44';rr(c,x-34,y-28,68,56,8);c.fill();c.fillStyle='#e8f4ff';rr(c,x-10,y-20,20,34,6);c.fill();}},{label:'はの いろ',draw:(c,x,y)=>{c.fillStyle='#fff8d0';circ(c,x,y,26);}},{label:'あじ',draw:(c,x,y)=>MED.apple?MED.apple(c,x,y,.8):drawItem(c,'apple',x,y,.8)}],right(){say('せいかい！ レントゲンで はの なかや ほね、 これから はえる はが みえるよ');}});
    return st;},
  xpos(t,bud){const M=this.M,i=t.i,n=M.n,x=W/2+(i-(n-1)/2)*44,y=t.top?H*.34:H*.34+150;return bud?{x,y:y+(t.top?-70:70)}:{x:x+22,y};},
  update(dt){DG.update.call(this,dt);if(this.flash>0)this.flash-=dt*2;if(this.film>0&&this.film<1)this.film=Math.min(1,this.film+dt*1.2);},
  draw(c){const L=-OX/SC-2,R=W+OX/SC+2,TP=-OY/SC-2;
    if(this.view==='room'){roomBg(c,'#eef2f8','#d8dee8',H-230,'#f6f8fc',[['viewer',90,290,.8],['exit',W-80,190,.9]]);
      c.fillStyle='#8a98b8';c.fillRect(W/2+120,180,16,H*.5);c.fillStyle=steel(c,W/2+60,H*.3,W/2+160,H*.3);rr(c,W/2+70,H*.28,110,80,14);c.fill();c.fillStyle='#3a3e4a';circ(c,W/2+90,H*.32,18);txt(c,'X',W/2+140,H*.32,24,'#ffd23a');
      c.fillStyle='#5a88c8';rr(c,W/2-120,H*.62,240,26,10);c.fill();c.fillRect(W/2-12,H*.62,24,H*.2);drawPt(c,this.P,W/2,H*.62+10,1.25,{t:T,sad:!this.apron,happy:this.apron});
      if(this.apron){c.save();c.translate(W/2,H*.62-40);c.scale(1.7,1.5);c.globalAlpha=.95;MED.apron(c,0,0,1);c.restore();}if(this.sensor){MED.sensor(c,W/2-this.side*-50,H*.34+30,.7);}
      const b=this.btn&&this.btn[0];if(b||(this.st&&this.st.type==='tap')){const bx=W-110,by=H-330;c.fillStyle='#fff';rr(c,bx-70,by-70,140,140,20);c.fill();c.strokeStyle='#c8d0dc';c.lineWidth=3;c.stroke();c.fillStyle=Math.sin(T*6)>0?'#ff4d6d':'#ff8c9a';circ(c,bx,by,36);txt(c,'さつえい',bx,by+54,14,'#6a5a8a');}}
    else{c.fillStyle='#0c1420';c.fillRect(L,TP,R-L,H+OY/SC*2+4);const a=this.film;c.globalAlpha=a;txt(c,'レントゲン しゃしん',W/2,190,22,'#bfe0ff');
      const M=this.M,n=M.n;c.fillStyle='rgba(180,200,220,.18)';rr(c,W/2-n*24,H*.34-120,n*48,390,40);c.fill();
      for(const t of M.teeth){const x=W/2+(t.i-(n-1)/2)*44,y=t.top?H*.34:H*.34+150,dir=t.top?-1:1;c.fillStyle='rgba(235,245,255,.92)';c.save();c.translate(x,y);if(!t.top)c.scale(1,-1);dmToothPath(c,t,t.type==='mol'?42:34,t.type==='mol'?40:46);c.fill();c.fillStyle='rgba(200,220,240,.5)';c.fillRect(-6,-58,12,40);c.restore();
        if(t.type==='inc'||this.mode!=='cav'){c.fillStyle='rgba(220,235,255,.55)';ell(c,x,y+dir*72,14,18);}
        if(t.xcav){c.fillStyle=t.xfound?'rgba(255,80,110,.9)':'rgba(10,15,25,.9)';ell(c,x+22,y,8,12);if(t.xfound){c.strokeStyle='#ff5f8a';c.lineWidth=3;c.beginPath();c.arc(x+22,y,20,0,TAU);c.stroke();}}}
      if(this.buds)for(const q of this.buds)if(q.done){c.strokeStyle='#ffd23a';c.lineWidth=3;c.beginPath();c.arc(q.x,q.y,22,0,TAU);c.stroke();}
      c.globalAlpha=1;}
    if(this.flash>0){c.fillStyle=`rgba(255,255,255,${this.flash})`;c.fillRect(L,TP,R-L,H+OY/SC*2+4);}
    this.drawCommon(c);}});
// ---------- 3. むしばの ちりょう ----------
dGame('dtreat',{kind:'baby',
  setup(){const cand=this.M.teeth.filter(t=>t.type==='mol');this.tt=pick(cand);this.tt.cav=this.lv<1?.6:1;this.deep=this.lv>=1||Math.random()<.5;this.water=0;this.puds=[];},
  intro(){return greetD(this,`${this.tt.top?'うえ':'した'}の おくばが いたいんだって。 むしばを なおそう！`);},
  plan(){const tt=this.tt,S=this,P=()=>dmPos(this.M,tt),gum=()=>{const p=P();return{x:p.x,y:p.y+(tt.top?-1:1)*p.h*.9};};const st=[];
    if(this.deep){st.push({type:'rub',tool:'numbgel',say:'まずは はぐきに ぬる ますいを ぬって いたくなくするよ',hint:'ぬる ますいを はぐきに',per:90,r:44,targets(){return this.gq||(this.gq=[Object.assign({},gum())]);},hit(q,p){good(p.x,p.y,1,'ぬりぬり');}});
      st.push({type:'hold',tool:'syringe',say:'ますいの ちゅうしゃ。 ちくっと するけど すぐ おわるよ',hint:'ちゅうしゃを はぐきに あてて まってね',need:1.2,r:44,at:gum,during(){this.scared=.3;},ok(g){good(g.x,g.y,2,'えらい！');say('しびれて きたね。 もう いたくないよ');return{delay:2};}});}
    else st.push({type:'quiz',say:'ちいさい むしばは ますいが いるかな？',hint:'こたえを タッチ',opts:()=>[{label:'いらない',ok:1,draw:(c,x,y)=>txt(c,'◎',x,y,44,'#2ec07a')},{label:'ぜったい いる',draw:(c,x,y)=>MED.syringe(c,x,y,.8)}],right(){say('ちいさい むしばは いたくないから ますいなしで けずれるよ');}});
    st.push({type:'hold',tool:'drill',say:'ドリルで むしばを けずろう。 おみずが でるよ',hint:'ドリルを むしばに',need:2,r:40,at:P,during(dt,g){this.scared=.2;if(Math.random()<dt*14)sfx('drill');if(Math.random()<dt*20)parts.push({x:g.x,y:g.y,vx:rand(-90,90),vy:rand(-140,-40),life:.4,t:0,kind:'drop',col:'#9fd8ff'});this.water=Math.min(1,this.water+dt*.5);tt.cav=Math.max(.1,tt.cav-dt*.4);},
      ok(g){tt.cav=0;tt.hole=1;good(g.x,g.y,1,'けずれた！');say('おくちに おみずが たまったよ。 バキュームで すいとろう');return{delay:1.8};}});
    st.push({type:'rub',tool:'vacuum',say:'バキュームで おみずを ズズズッと すいとろう',hint:'バキュームで おみずを すう',per:70,r:50,snd:'blow',begin(){this.water=1;this.puds=[-120,-20,90].map(dx=>({x:this.M.mx+dx,y:this.M.my+60+rand(-10,10)}));},targets(){return this.puds;},rub(q){this.water=Math.max(0,this.puds.filter(p=>!p.done).length/3-.05);},hit(q,p){good(p.x,p.y,1,'ズズッ');}});
    st.push({type:'hold',tool:'paste',say:'けずった あなに つめものを いれよう',hint:'つめものを あなに',need:1,r:40,at:P,ok(g){tt.hole=0;tt.fill=.5;sfx('squish');good(g.x,g.y,1,'ぴったり');return{delay:1.4};}});
    st.push({type:'hold',tool:'curelight',say:'あおい ひかりを あてて かためるよ。 いっしょに かぞえてね',hint:'ひかりの きかいを つめものに',need:3,r:44,at:P,begin(){this.cnt=0;},during(dt){const n=Math.floor(this.prog)+1;if(n>this.cnt&&n<=3){this.cnt=n;hush();speak(String(n),'en');sfx('beep');}},ok(g){tt.fill=1;sfx('spark');good(g.x,g.y,2,'かたまった！');return{delay:1.6};}});
    st.push({type:'hold',tool:'bitepaper',say:'さいごに かみあわせの かみで カチカチ。 たかい ところが ないか しらべよう',hint:'かみを おくばに',need:1,r:44,at:P,during(){this.bite=1;},ok(g){this.bite=0;this.mark=1;say('あかい てんが ついた ところを すこし けずって ととのえるよ');return{delay:1.6};}});
    st.push({type:'rub',tool:'polisher',say:'みがく きかいで あかい てんを つるつるに',hint:'あかい てんを みがく',per:80,r:36,targets(){return this.mq||(this.mq=[{t:tt}]);},hit(q,p){this.mark=0;this.happy=3;good(p.x,p.y,2,'つるつる！');say('むしば ちりょう かんりょう！ あまい ものの あとは はみがき してね');}});
    return st;},
  draw(c){dentBg(c,this);const b=this.bite?Math.max(.15,1-(this.st&&this.st.t||0)*2):1;dmFace(c,this,{scared:this.scared>0,happy:this.happy>0||this.fin>0,mouth:b});
    const p=dmPos(this.M,this.tt);if(this.mark){c.fillStyle='#e8284a';circ(c,p.x+6,p.y+(this.tt.top?1:-1)*p.h*.3,6);}
    if(this.water>0&&this.puds.length){c.save();c.beginPath();c.ellipse(this.M.mx,this.M.my,this.M.rw+44,this.M.rh+40,0,0,TAU);c.clip();for(const q of this.puds)if(!q.done){c.fillStyle='rgba(150,210,255,.75)';ell(c,q.x,q.y,50+Math.sin(T*4+q.x)*4,18);}c.restore();}
    else if(this.water>0){c.fillStyle=`rgba(150,210,255,${this.water*.6})`;ell(c,this.M.mx,this.M.my+70,150*this.water+20,24);}
    const hd=this.tools.find(t=>t.held&&t.k==='curelight');if(hd){const q=hd.tip();const g=c.createRadialGradient(q.x,q.y,2,q.x,q.y,50);g.addColorStop(0,'rgba(120,170,255,.8)');g.addColorStop(1,'rgba(120,170,255,0)');c.fillStyle=g;circ(c,q.x,q.y,50);}
    this.drawCommon(c);}});
// ---------- 4. そめだし はみがき ----------
dGame('dstain',{kind:'baby',
  setup(){this.gaps=[];},
  intro(){return greetD(this,'ちゃんと みがけて いるかな？ みがきのこしを あかく そめて しらべよう！');},
  plan(){return[
    {type:'rub',tool:'dye',say:'そめだしえきを はに ぬろう。 みがきのこしが あかく なるよ',hint:'そめだしえきを 4つの ばしょに',per:90,r:80,targets(){return this.zq||(this.zq=DZONES.map(z=>Object.assign({z},zonePos(this,z))));},
      hit(q,p){const ts=zoneTeeth(this,q.z);ts.forEach(t=>{const r=Math.random();if(t.type==='mol'||r<.45){t.red=rand(.6,1);t.redH=t.type==='mol'?rand(.5,.9):rand(.3,.5);}});sfx('squish');good(p.x,p.y,1,'まっか！');}},
    {type:'quiz',say:'あかく なった ところは なんだろう？',hint:'こたえを タッチ',opts:()=>[{label:'みがきのこし',ok:1,draw:(c,x,y)=>{c.fillStyle='#e8286a';circ(c,x,y,26);}},{label:'ちが でた',draw:(c,x,y)=>{c.fillStyle='#c81a3a';c.beginPath();c.moveTo(x,y-26);c.quadraticCurveTo(x+22,y+4,x,y+20);c.quadraticCurveTo(x-22,y+4,x,y-26);c.fill();}},{label:'ジュースの いろ',draw:(c,x,y)=>drawItem(c,'cup',x,y,.8)}],right(){say('せいかい！ あかい ところは はこう。 ばいきんの かたまり だよ');}},
    {type:'rub',tool:'toothbrush',say:'はぶらしで あかい ところを ごしごし！ おくばは とくに ていねいに',hint:'あかい はを はぶらしで みがく',per:170,r:40,snd:'brush',targets(){return this.M.teeth.filter(t=>t.red>0).map(t=>t.qb||(t.qb={t}));},
      rub(q,p,d){q.t.red=Math.max(0,q.hp);if(Math.random()<.3)bubbles(p.x,p.y,1);},hit(q,p){q.t.red=0;good(p.x,p.y,1,'ピカッ');}},
    {type:'rub',tool:'floss',say:'はと はの あいだは はぶらしが とどかない。 フロスで おそうじ！',hint:'フロスで はの あいだを',per:80,r:30,begin(){const ts=this.M.teeth.filter(t=>t.type==='inc'&&t.top);this.gaps=[];for(let i=0;i<ts.length-1;i++){const a=dmPos(this.M,ts[i]),b=dmPos(this.M,ts[i+1]);this.gaps.push({x:(a.x+b.x)/2,y:(a.y+b.y)/2+10});}this.gaps=shuffle(this.gaps).slice(0,this.lv<1?2:3);},targets(){return this.gaps;},hit(q,p){good(p.x,p.y,1,'スッキリ');}},
    {type:'quiz',say:'みがきのこしが いちばん おおい ところは どこ？',hint:'こたえを タッチ',opts:()=>[{label:'はと はぐきの さかいめ',ok:1,draw:(c,x,y)=>{c.fillStyle='#e87a94';rr(c,x-30,y-26,60,16,6);c.fill();c.fillStyle='#fff';rr(c,x-24,y-12,48,34,6);c.fill();c.fillStyle='#e8286a';c.fillRect(x-24,y-12,48,8);}},{label:'はの さきっぽ',draw:(c,x,y)=>{c.fillStyle='#fff';rr(c,x-24,y-20,48,40,6);c.fill();}},{label:'くちびる',draw:(c,x,y)=>{c.fillStyle='#ff8cae';ell(c,x,y,30,14);}}],right(){this.happy=3;say('せいかい！ はと はぐきの さかいめと おくばの みぞは みがきのこしが おおいよ');}}];},
  draw(c){dentBg(c,this,['#fff4f8','#f0dce6','#fffafc']);dmFace(c,this,{happy:this.happy>0||this.fin>0});
    for(const g of this.gaps)if(!g.done){c.fillStyle='#e8286a';c.beginPath();c.moveTo(g.x-6,g.y-12);c.lineTo(g.x+6,g.y-12);c.lineTo(g.x,g.y+6);c.fill();}
    const tot=this.M.teeth.reduce((a,t)=>a+(t.red||0),0),pc=Math.round(tot/this.M.teeth.length*100);if(this.si>=1){panel(c,W/2-120,H-300,240,60,20,'#fff','#ffb3d6',3);txt(c,`みがきのこし ${pc}%`,W/2,H-270,24,pc?'#e8286a':'#2ec07a');}
    this.drawCommon(c);}});
// ---------- 5. フッそ と シーラント ----------
dGame('dfluor',{kind:'baby',
  setup(){this.mol=this.M.teeth.filter(t=>t.type==='mol'&&t.d>=4);},
  intro(){return greetD(this,'むしばに ならない ように はを まもる よぼうを しよう！');},
  plan(){const st=[
    {type:'rub',tool:'air',say:'シーラントの まえに エアーで おくばを かわかそう',hint:'エアーで おくばを かわかす',per:70,r:40,snd:'blow',targets(){return this.mol.map(t=>t.qa||(t.qa={t}));},hit(q,p){q.t.dry=1;good(p.x,p.y,1,'かわいた');}},
    {type:'rub',tool:'sealant',say:'おくばの みぞに シーラントを ぬって ふさごう',hint:'シーラントを おくばに',per:90,r:36,targets(){return this.mol.map(t=>t.qs||(t.qs={t}));},hit(q,p){q.t.seal=.5;sfx('squish');good(p.x,p.y,1,'ぬった');}},
    {type:'rub',tool:'curelight',say:'ひかりを あてて かためるよ',hint:'ひかりを シーラントに',per:110,r:36,snd:'beep',targets(){return this.mol.map(t=>t.qc||(t.qc={t}));},hit(q,p){q.t.seal=1;good(p.x,p.y,1,'カチッ');}},
    {type:'rub',tool:'fluor',say:'さいごに フッそを ぜんぶの はに ぬって つよい はに！',hint:'フッそを 4つの ばしょに',per:100,r:80,targets(){return this.zq||(this.zq=DZONES.map(z=>Object.assign({z},zonePos(this,z))));},hit(q,p){zoneTeeth(this,q.z).forEach(t=>t.fl=1);sfx('spark');burst(p.x,p.y,6,'star');good(p.x,p.y,1,'つよく なれ！');}},
    Math.random()<.5?{type:'quiz',say:'フッそを ぬったあと 30ぷんは どうする？',hint:'こたえを タッチ',opts:()=>[{label:'たべない',ok:1,draw:(c,x,y)=>txt(c,'×',x,y,48,'#ff5f6f')},{label:'すぐ ジュース',draw:(c,x,y)=>drawItem(c,'cup',x,y,.8)},{label:'すぐ おかし',draw:(c,x,y)=>drawItem(c,'apple',x,y,.7)}],right(){this.happy=3;say('せいかい！ 30ぷん たべたり のんだり しないと フッそが よく きくよ');}}
     :{type:'quiz',say:'シーラントは はの どこに する？',hint:'こたえを タッチ',opts:()=>[toothOpt('mol','おくばの みぞ'),toothOpt('inc','まえばの さき'),toothOpt('can','とがった は')].map((o,i)=>Object.assign(o,{ok:i===0})),right(){this.happy=3;say('せいかい！ おくばの みぞは むしばに なりやすいから ふさいで まもるよ');}}];
    return st;},
  draw(c){dentBg(c,this,['#eef6ff','#d8e6f4','#f6faff']);dmFace(c,this,{happy:this.happy>0||this.fin>0});
    for(const t of this.mol)if(t.dry&&!t.seal){const p=dmPos(this.M,t);c.fillStyle='rgba(255,255,255,.6)';ell(c,p.x,p.y,p.w*.3,p.h*.2);}
    const hd=this.tools.find(t=>t.held&&t.k==='curelight');if(hd){const q=hd.tip();const g=c.createRadialGradient(q.x,q.y,2,q.x,q.y,50);g.addColorStop(0,'rgba(120,170,255,.8)');g.addColorStop(1,'rgba(120,170,255,0)');c.fillStyle=g;circ(c,q.x,q.y,50);}
    this.drawCommon(c);}});

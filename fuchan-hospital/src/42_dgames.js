// ================= しかいいん の アトラクション (2) =================
// ---------- 6. はいしゃさんの おそうじ（しせき とり） ----------
dGame('dscale',{kind:'baby',
  setup(){this.sk=pick([['おちゃ','150,100,50'],['カレー','210,170,40'],['ぶどうジュース','140,70,150']]);const low=this.M.teeth.filter(t=>!t.top&&t.type!=='mol');shuffle(low).slice(0,this.lv<1?3:5).forEach(t=>t.tar=1);
    shuffle(this.M.teeth.filter(t=>t.top&&t.type==='inc')).slice(0,this.lv<1?3:4).forEach(t=>{t.stn=1;t.stnC=this.sk[1];});this.gaps=[];this.rinse=0;},
  intro(){return greetD(this,`はいしゃさんで はの おそうじ！ しせきと ${this.sk[0]}の よごれを とろう`);},
  plan(){return[
    {type:'quiz',say:'しせきって なんだろう？',hint:'こたえを タッチ',opts:()=>[{label:'かたまった はこう',ok:1,draw:(c,x,y)=>{c.fillStyle='#d6c48c';for(let i=0;i<5;i++)circ(c,x-20+i*10,y+Math.sin(i*2)*6,10);}},{label:'あたらしい は',draw:(c,x,y)=>MED.incisor(c,x,y,1)},{label:'たべもの',draw:(c,x,y)=>drawItem(c,'bread',x,y,.7)}],right(){say('せいかい！ みがきのこしが いしみたいに かたまったのが しせき。 はぶらしでは とれないよ');}},
    {type:'rub',tool:'scaler',say:'スケーラーで ジジジッと しせきを とろう',hint:'スケーラーで きいろい しせきを',per:190,r:36,snd:'drill',targets(){return this.M.teeth.filter(t=>t.tar).map(t=>t.qs||(t.qs={t}));},
      rub(q,p){q.t.tar=Math.max(0,q.hp);if(Math.random()<.4)parts.push({x:p.x,y:p.y+(q.t.top?-10:10),vx:rand(-80,80),vy:rand(-160,-60),life:.5,t:0,kind:'dot',col:'#d6c48c',r:4});},hit(q,p){q.t.tar=0;good(p.x,p.y,1,'とれた！');}},
    {type:'rub',tool:'polisher',say:`みがく きかいで ${this.sk[0]}の よごれを つるつるに`,hint:'よごれた はを みがく',per:170,r:36,snd:'brush',targets(){return this.M.teeth.filter(t=>t.stn).map(t=>t.qp||(t.qp={t}));},
      rub(q,p){q.t.stn=Math.max(0,q.hp);if(Math.random()<.2)bubbles(p.x,p.y,1);},hit(q,p){q.t.stn=0;q.t.fl=1;good(p.x,p.y,1,'ピカピカ');}},
    {type:'rub',tool:'floss',say:'はの あいだも フロスで きれいに',hint:'フロスで はの あいだを',per:70,r:30,begin(){const ts=this.M.teeth.filter(t=>!t.top&&t.type==='inc');this.gaps=[];for(let i=0;i<ts.length-1;i++){const a=dmPos(this.M,ts[i]),b=dmPos(this.M,ts[i+1]);this.gaps.push({x:(a.x+b.x)/2,y:(a.y+b.y)/2-10});}this.gaps=this.gaps.slice(0,3);},targets(){return this.gaps;},hit(q,p){good(p.x,p.y,1,'スッキリ');}},
    {type:'drop',tool:'cup',say:'さいごに おみずで ぶくぶく うがい',hint:'コップを おくちへ',r:160,at(){return{x:this.M.mx,y:this.M.my};},ok(){this.rinse=.01;sfx('splash');say('ぶくぶく〜 ぺっ！ ピカピカに なったね');this.happy=4;return{delay:2.4};}}];},
  update(dt){DG.update.call(this,dt);if(this.rinse>0&&this.rinse<2){this.rinse+=dt;if(Math.random()<dt*20)drops(this.M.mx+rand(-150,150),this.M.my,2,'#9fd8ff');}},
  draw(c){dentBg(c,this);dmFace(c,this,{happy:this.happy>0||this.fin>0});for(const g of this.gaps)if(!g.done){c.fillStyle='#d6c48c';circ(c,g.x,g.y,6);}
    if(this.rinse>0&&this.rinse<2){c.fillStyle=`rgba(160,220,255,${.5*(1-this.rinse/2)})`;ell(c,this.M.mx,this.M.my,220,140);}
    this.drawCommon(c);}});
// ---------- 7. はえかわり ----------
dGame('dbaby',{kind:'baby',
  setup(){const inc=this.M.teeth.filter(t=>t.type==='inc'&&t.d<1);this.lt=this.lv<1?pick(inc.filter(t=>!t.top)):pick(inc);this.lt.loose=1;this.fly=null;this.six=0;this.months=0;},
  intro(){return greetD(this,`${this.lt.top?'うえ':'した'}の まえばが ぐらぐら してるんだって。 はえかわりの じきだね`);},
  plan(){const lt=this.lt,P=()=>dmPos(this.M,lt);return[
    {type:'quiz',say:'こどもの はが ぬけて おとなの はに かわる はえかわり。 なんさいごろから はじまる？',hint:'こたえを タッチ',opts:()=>[numOpt(6,1,'さい'),numOpt(1,0,'さい'),numOpt(20,0,'さい')],right(){sayNum(6,'','さいごろから！ 12さいごろまでに ぜんぶ おとなの はに かわるよ');}},
    {type:'hold',tool:'tweezers',say:'ぐらぐらの はを そっと ぬいてあげよう',hint:'ピンセットを ぐらぐらの はに あてて まってね',need:1.5,r:40,at:P,during(dt){this.scared=.2;if(Math.random()<dt*6)sfx('squeak');},
      ok(g){lt.loose=0;lt.missing=1;this.fly={x:g.x,y:g.y,t:0};SHAKE=.2;good(g.x,g.y,3,'ぬけた！');say('ぬけた！ したから おとなの はが みえてるよ');return{delay:2};}},
    {type:'hold',tool:'gauze',say:'ガーゼを かんで ちを とめよう',hint:'ガーゼを ぬけた ところに',need:1,r:50,at(){const p=P();return{x:p.x,y:p.y+(lt.top?-1:1)*p.h*.3};},ok(g){this.gz=1;good(g.x,g.y,1,'とまった');return{delay:1.4};}},
    {type:'tap',say:'カレンダーを タッチして じかんを すすめよう',hint:'カレンダーを タッチ',r:70,begin(){this.gz=0;},targets(){return this.months>=3?[]:[this.cal||(this.cal={x:W-110,y:H-330})];},
      tapT(q){this.months++;sfx('whoosh');lt.adult=1;lt.grow=this.months/3;hush();speak(['1かげつご','3かげつご','はんとしご'][this.months-1]);if(this.months>=3){q.done=1;this.six=1;this.M.teeth.push({i:-.75,top:true,d:5,type:'mol',side:-1,grow:0,adult:1},{i:this.M.n-.25,top:true,d:5,type:'mol',side:1,grow:0,adult:1},{i:-.75,top:false,d:5,type:'mol',side:-1,grow:0,adult:1},{i:this.M.n-.25,top:false,d:5,type:'mol',side:1,grow:0,adult:1});}},
      end(){say('おとなの はが はえてきた！ おくには 6さいきゅうしも はえたよ。 いちばん だいじな おくばだよ');return{delay:3.4};}},
    {type:'quiz',say:'おとなの はは ぜんぶで なんぼん？ （おやしらずは のぞくよ）',hint:'こたえを タッチ',opts:()=>[numOpt(28,1),numOpt(20,0),numOpt(100,0)],right(){sayNum(28,'おとなの はは ','ほん！ おやしらずを いれると 32ほん');}},
    {type:'quiz',say:`むかしの にほんでは ぬけた ${lt.top?'うえ':'した'}の はを どこに なげたかな？`,hint:'こたえを タッチ',opts:()=>[{label:'えんの した',ok:lt.top,draw:(c,x,y)=>{c.fillStyle='#b8905a';c.fillRect(x-36,y-10,72,10);c.fillStyle='#6a4a2a';c.fillRect(x-30,y,6,24);c.fillRect(x+24,y,6,24);}},{label:'やねの うえ',ok:!lt.top,draw:(c,x,y)=>{c.fillStyle='#c86a5a';c.beginPath();c.moveTo(x-38,y+10);c.lineTo(x,y-24);c.lineTo(x+38,y+10);c.fill();c.fillStyle='#fff4e0';c.fillRect(x-26,y+10,52,20);}},{label:'うみ',draw:(c,x,y)=>{c.fillStyle='#5ab8f0';ell(c,x,y+6,38,16);}}],
      right(){this.happy=4;say(lt.top?'せいかい！ うえの はは えんのしたへ。 したに むかって まっすぐ はえるように ねがったんだよ':'せいかい！ したの はは やねの うえへ。 うえに むかって まっすぐ はえるように ねがったんだよ');}}];},
  update(dt){DG.update.call(this,dt);if(this.fly)this.fly.t+=dt;for(const t of this.M.teeth)if(t.d===5&&t.grow<1)t.grow=Math.min(1,t.grow+dt*.6);},
  draw(c){dentBg(c,this,['#fff8ec','#f0e4d0','#fffcf4']);dmFace(c,this,{happy:this.happy>0||this.fin>0,scared:this.scared>0});const lt=this.lt,p=dmPos(this.M,lt);
    if(lt.missing&&!lt.grow&&!this.gz){c.save();c.globalAlpha=.55;c.fillStyle='#fff';c.translate(p.x,p.y+(lt.top?-1:1)*p.h*.2);if(!lt.top)c.scale(1,-1);dmToothPath(c,lt,p.w*.9,p.h*.5);c.fill();c.restore();}
    if(this.gz){c.fillStyle='#fff';rr(c,p.x-26,p.y-14,52,28,6);c.fill();c.strokeStyle='#d0d8e4';c.stroke();}
    if(this.fly){const k=Math.min(1,this.fly.t/1.2);c.save();c.translate(lerp(this.fly.x,W-80,k),lerp(this.fly.y,200,k)-Math.sin(k*Math.PI)*140);c.rotate(this.fly.t*8);drawItem(c,'tooth',0,0,.6);c.restore();if(k>=1){c.fillStyle='#fff';rr(c,W-130,165,100,74,14);c.fill();c.strokeStyle='#ffb3c8';c.lineWidth=3;c.stroke();drawItem(c,'tooth',W-80,195,.45);txt(c,'にゅうしの はこ',W-80,226,11,'#ff5fa2');}}
    if(this.st&&this.st.type==='tap'&&!this.st.fin){const x=W-110,y=H-330;c.fillStyle='#fff';rr(c,x-64,y-60,128,120,12);c.fill();c.fillStyle='#ff6f6f';rr(c,x-64,y-60,128,32,[12,12,0,0]);c.fill();txt(c,'カレンダー',x,y-44,14,'#fff');txt(c,['いま','1かげつ','3かげつ','6かげつ'][this.months],x,y+12,22,'#6a5a8a');}
    this.drawCommon(c);}});
// ---------- 8. はの かたち ----------
const DFOOD=[['apple','りんごを かじる','inc'],['carrot','にんじんを かじる','inc'],['meat','おにくを ひきさく','can'],['fish','ほしざかなを ひきちぎる','can'],['onigiri','ごはんを すりつぶす','mol'],['corn','まめを すりつぶす','mol']];
const DTYPE={inc:['まえば','きる'],can:['けんし','ひきさく'],mol:['おくば','すりつぶす']};
dGame('dshape',{kind:'adult',
  setup(){this.M=dmNew('adult',300,H*.4,210,120);this.foods=['inc','can','mol'].map(ty=>pick(DFOOD.filter(f=>f[2]===ty)));shuffle(this.foods);this.chomp=null;this.food=null;
    const pickT=ty=>pick(this.M.teeth.filter(t=>t.type===ty&&!t.missing));this.holes=[pickT('inc'),pickT('can'),pickT('mol')];this.holes.forEach(t=>t.gone=1);},
  intro(){return 'はの もけいで はの かたちと やくわりを べんきょう しよう！';},
  plan(){const st=[];for(const f of this.foods)st.push({type:'quiz',say:`${f[1]}ときに つかう はは どれ？`,hint:'こたえを タッチ',begin(){this.food=f;},
      opts:()=>['inc','can','mol'].map(ty=>Object.assign(toothOpt(ty,DTYPE[ty][0]),{ok:ty===f[2]})),right(){this.chomp={ty:f[2],t:0};sfx('munch');sayWord({inc:'incisor',can:'canine',mol:'molar'}[f[2]],`${DTYPE[f[2]][0]}で ${DTYPE[f[2]][1]}。`);}});
    st.push({type:'wait',say:'もけいの はが 3ぼん とれちゃった！ あう かたちの はを はめてね',begin(){this.food=null;this.holes.forEach(t=>{t.missing=1;});setTimeout(()=>{if(scene===this)this.stepDone({delay:.2});},2600);}});
    for(const h of this.holes){const key={inc:'incisor',can:'canine',mol:'molar'}[h.type];st.push({type:'drop',tool:key,pool:['incisor','canine','molar'],say:'ひかっている ところに はいる はは どれかな？',hint:'あう かたちの はを はめよう',r:50,at(){return dmPos(this.M,h);},ok(g){h.missing=0;h.pop=.01;sfx('clip');good(g.x,g.y,1,'ぴったり！');sayWord(key);return{delay:1.6};}});}
    st.push({type:'quiz',say:'6さいごろ おくに はえる いちばん だいじな おくばの なまえは？',hint:'こたえを タッチ',opts:()=>[{label:'6さい きゅうし',ok:1,draw:(c,x,y)=>MED.molar(c,x,y,1.1)},{label:'おやしらず',draw:(c,x,y)=>MED.molar(c,x,y,.8)},{label:'いときりば',draw:(c,x,y)=>MED.canine(c,x,y,1)}],right(){this.happy=3;say('せいかい！ 6さいきゅうしは かむ ちからが いちばん つよい だいじな はだよ');}});
    return st;},
  update(dt){DG.update.call(this,dt);if(this.chomp){this.chomp.t+=dt;if(this.chomp.t>2)this.chomp=null;}},
  draw(c){roomBg(c,'#f4f0ff','#e0d8f0',H-230,'#fbf8ff',[['window',70,300,.9,110,90],['shelf',W-100,300,.9]]);const M=this.M;
    c.fillStyle='#f4eee4';rr(c,M.mx-270,M.my-M.rh-90,540,(M.rh+90)*2,40);c.fill();c.strokeStyle='#d8ccb8';c.lineWidth=4;c.stroke();c.fillStyle='#d8c8b0';rr(c,M.mx-270,M.my-8,540,16,4);c.fill();
    c.save();c.beginPath();c.ellipse(M.mx,M.my,M.rw+50,M.rh+64,0,0,TAU);c.clip();c.fillStyle='#f8f4ec';c.fillRect(0,0,W,H);dmGum(c,M);
    for(const t of M.teeth){if(t.missing)continue;const hl=this.chomp&&this.chomp.ty===t.type;c.save();if(hl){const p=dmPos(M,t);c.translate(0,Math.sin(this.chomp.t*14)*4*(t.top?-1:1));}dmTooth(c,M,t);c.restore();if(hl){const p=dmPos(M,t);c.fillStyle=`rgba(255,210,60,${.4+.3*Math.sin(T*10)})`;circ(c,p.x,p.y,p.w*.6);}}c.restore();
    if(this.food&&!this.chomp){drawThing(c,this.food[0],W/2,M.my+M.rh+140,1.1);}if(this.chomp&&this.chomp.t<1.2){const f=this.foods.find(q=>q[2]===this.chomp.ty);drawThing(c,f[0],W/2+Math.sin(T*20)*6,M.my+M.rh+140,1.1*(1-this.chomp.t*.5));for(let i=0;i<2;i++)parts.push({x:W/2+rand(-30,30),y:M.my+M.rh+140,vx:rand(-100,100),vy:rand(-160,-60),life:.4,t:0,kind:'dot',col:'#e8c890',r:4});}
    if(this.st&&this.st.type==='drop'&&!this.st.fin){const g=this.st.at.call(this);c.fillStyle=`rgba(255,210,60,${.3+.25*Math.sin(T*6)})`;circ(c,g.x,g.y,26);}
    this.drawCommon(c);}});
// ---------- 9. きょうせい ----------
dGame('dortho',{kind:'adult',
  setup(){this.M=dmNew('adult',300,H*.42,200,116);this.M.teeth.forEach(t=>t.adult=1);this.bt=this.M.teeth.filter(t=>t.top&&t.d<4).sort((a,b)=>a.i-b.i);
    shuffle(this.bt).slice(0,this.lv<1?3:5).forEach(t=>{t.cox=rand(-9,9);t.coy=rand(-12,12);t.crot=rand(-.35,.35);});this.fix=0;this.fixT=0;this.wire=0;this.rcol=null;this.months=0;this.applyFix();},
  applyFix(){const k=1-this.fix;for(const t of this.bt){t.ox=(t.cox||0)*k;t.oy=(t.coy||0)*k;t.rot=(t.crot||0)*k;}},
  intro(){return greetD(this,'はが がたがたに はえて きたんだって。 きょうせいで きれいに ならべよう！');},
  plan(){return[
    {type:'quiz',say:'がたがたの はは なにが こまるかな？',hint:'こたえを タッチ',opts:()=>[{label:'みがきにくい',ok:1,draw:(c,x,y)=>drawItem(c,'toothbrush',x,y,.8)},{label:'せが のびない',draw:(c,x,y)=>MED.ruler(c,x,y,.8)},{label:'ねむく なる',draw:(c,x,y)=>txt(c,'Zz',x,y,34,'#8a8ab8')}],right(){say('せいかい！ みがきのこしが ふえたり うまく かめなかったり するよ');}},
    {type:'rub',tool:'bracket',say:'はに ブラケットを 1こずつ つけよう',hint:'ブラケットを はに',per:30,r:30,targets(){return this.bt.map(t=>t.qb||(t.qb={t}));},hit(q,p){q.t.brk=1;sfx('clip');good(p.x,p.y,1,'ピタッ');}},
    {type:'trace',tool:'wire',say:'ワイヤーを ひだりから じゅんばんに とおそう',hint:'ワイヤーを ブラケットに とおす',r:36,path(){return this.bt.map(t=>{const p=dmPos(this.M,t);return{x:p.x,y:p.y+p.h*.05};});},ok(){this.wire=1;sfx('spark');say('ワイヤーの ちからで はが すこしずつ うごくよ');return{delay:1.8};}},
    {type:'quiz',say:'ブラケットに つける わゴムの いろを えらぼう！ すきな いろで いいよ',hint:'すきな いろを タッチ',opts:()=>[['#ff5fa2','ピンク'],['#5aa8ff','あお'],['#ffd23a','きいろ'],['#4cc86a','みどり']].map(([col,n])=>({label:n,ok:1,col,draw:(c,x,y)=>{c.strokeStyle=col;c.lineWidth=8;c.beginPath();c.arc(x,y,20,0,TAU);c.stroke();}})),right(o){this.rcol=o.col;say(`${o.label}の わゴム！ かわいいね`);}},
    {type:'tap',say:'カレンダーを タッチして じかんを すすめよう。 はが うごいて いくよ',hint:'カレンダーを タッチ',r:70,targets(){return this.months>=3?[]:[this.cal||(this.cal={x:W-110,y:H-330})];},
      tapT(q){this.months++;sfx('whoosh');hush();speak(['1かげつご','6かげつご','1ねんご'][this.months-1]);if(this.months>=3)q.done=1;},end(){say('きれいに ならんだ！ きょうせいは じかんを かけて ゆっくり はを うごかすんだよ');this.happy=3;return{delay:3};}},
    {type:'quiz',say:'きょうせい ちゅうの はみがきは どうする？',hint:'こたえを タッチ',opts:()=>[{label:'いつもより ていねいに',ok:1,draw:(c,x,y)=>drawItem(c,'toothbrush',x,y,.8)},{label:'しなくて いい',draw:(c,x,y)=>txt(c,'×',x,y,44,'#ff5f6f')},{label:'1しゅうかんに 1かい',draw:(c,x,y)=>txt(c,'7',x,y,40,'#8a8ab8')}],right(){this.happy=3;say('せいかい！ ブラケットの まわりは よごれが たまりやすいから ていねいに みがこう');}}];},
  update(dt){DG.update.call(this,dt);const tgt=this.months/3;if(this.fix<tgt){this.fix=Math.min(tgt,this.fix+dt*.5);this.applyFix();}},
  draw(c){dentBg(c,this,['#f0f6ff','#dce4f4','#f8fbff']);dmFace(c,this,{happy:this.happy>0||this.fin>0});
    if(this.wire){const ps=this.bt.map(t=>{const p=dmPos(this.M,t);return[p.x,p.y+p.h*.05];});c.strokeStyle=steel(c,ps[0][0],0,ps[ps.length-1][0],0);c.lineWidth=3;c.beginPath();ps.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.stroke();}
    if(this.rcol)for(const t of this.bt){const p=dmPos(this.M,t);c.strokeStyle=this.rcol;c.lineWidth=3;c.beginPath();c.arc(p.x,p.y+p.h*.05,6,0,TAU);c.stroke();}
    if(this.st&&this.st.type==='tap'&&!this.st.fin){const x=W-110,y=H-330;c.fillStyle='#fff';rr(c,x-64,y-60,128,120,12);c.fill();c.fillStyle='#5aa8ff';rr(c,x-64,y-60,128,32,[12,12,0,0]);c.fill();txt(c,'カレンダー',x,y-44,14,'#fff');txt(c,['いま','1かげつ','6かげつ','1ねん'][this.months],x,y+12,22,'#6a5a8a');}
    this.drawCommon(c);}});
// ---------- 10. かぶせもの（ぎしこうぼう） ----------
const SHADES=[['A1','#fbf8ee'],['A2','#f4ecd4'],['A3','#ecdcb8'],['A4','#e0cca0']];
dGame('dcrown',{kind:'adult',
  setup(){this.M=dmNew('adult',300,H*.42,200,116);this.M.teeth.forEach(t=>t.adult=1);this.front=Math.random()<.5;this.tt=this.front?pick(this.M.teeth.filter(t=>t.top&&t.d<1)):pick(this.M.teeth.filter(t=>!t.top&&t.type==='mol'));
    if(this.front)this.tt.chip=1;else{this.tt.cav=1;this.tt.cx=0;}this.sh=pick(SHADES);this.M.teeth.forEach(t=>{if(t!==this.tt)t.col=this.sh[1];});this.view='mouth';this.imp=0;this.model=0;this.cut=[];},
  intro(){return greetD(this,this.front?'まえばが かけちゃったんだって。 かぶせものを つくろう！':'おおきな むしばの あとに かぶせものを つくろう！');},
  plan(){const tt=this.tt,P=()=>dmPos(this.M,tt);return[
    {type:'hold',tool:'drill',say:'かぶせものが はまるように はの かたちを ととのえよう',hint:'ドリルを はに',need:1.6,r:40,at:P,during(dt,g){this.scared=.2;if(Math.random()<dt*14)sfx('drill');},ok(g){tt.chip=0;tt.cav=0;tt.prep=1;good(g.x,g.y,1,'ととのった');return{delay:1.4};}},
    {type:'hold',tool:'impression',say:'かたどりの ねんどを おしあてて かたまるまで まってね',hint:'かたどりを おくちに',need:2.5,r:90,at(){return{x:this.M.mx,y:this.M.my-40};},begin(){this.cnt=0;},during(){const n=Math.floor(this.prog)+1;if(n>this.cnt&&n<=2){this.cnt=n;hush();speak(String(n),'en');}},
      ok(){this.imp=1;sfx('pop');say('かたが とれた！ ぎこうしさんの こうぼうへ いこう');setTimeout(()=>{if(scene===this)this.view='lab';},1200);return{delay:2.4};}},
    {type:'drop',tool:'plaster',say:'かたに せっこうを ながしこんで はの もけいを つくろう',hint:'せっこうを かたへ',r:110,at(){return{x:W/2-120,y:H*.47-50};},ok(){this.model=1;sfx('pour');say('はの もけいが できたよ');return{delay:1.8};}},
    {type:'quiz',say:'となりの はと おなじ いろを えらぼう。 シェードガイドで くらべてね',hint:'となりの はと おなじ いろ',opts:()=>[],right(){good(W/2,H*.3,1,'ぴったりの いろ');say(`${this.sh[0]}の いろ！ となりの はと ならべても わからないね`);},wrong(){return 'となりの はと よく くらべてみて';}},
    {type:'rub',tool:'carver',say:'けずる どうぐで かぶせものの かたちを ととのえよう',hint:'でっぱりを けずる',per:60,r:30,begin(){this.cut=[[-60,-40],[56,-44],[-58,30],[60,26]].map(([dx,dy])=>({x:W/2+110+dx,y:H*.47-70+dy}));},targets(){return this.cut;},hit(q,p){sfx('squish');good(p.x,p.y,1,'シャッ');for(let i=0;i<4;i++)parts.push({x:p.x,y:p.y,vx:rand(-80,80),vy:rand(-120,-40),life:.5,t:0,kind:'dot',col:this.sh[1],r:3});},end(){this.crownDone=1;say('かぶせものが できた！ おくちに もどろう');setTimeout(()=>{if(scene===this)this.view='mouth';},1200);return{delay:2.4};}},
    {type:'drop',tool:'crown',say:'かぶせものを ととのえた はに かぶせよう',hint:'かぶせものを はに',r:50,begin(){this.tools.forEach(t=>t.o={col:this.sh[1]});},at:P,ok(g){tt.prep=0;tt.crownCol=this.sh[1];sfx('clip');good(g.x,g.y,2,'ぴったり！');return{delay:1.4};}},
    {type:'hold',tool:'bitepaper',say:'かみあわせの かみで カチカチ。 ちょうど いいか しらべよう',hint:'かみを かぶせものに',need:1,r:44,at:P,ok(g){this.happy=4;good(g.x,g.y,2,'ばっちり！');say('かぶせもの かんせい！ ぎこうしさんが ひとりひとりに あわせて つくって くれるんだよ');return{delay:2.2};}}];},
  nextStep(){DG.nextStep.call(this);const st=this.st;if(st&&st.type==='quiz'&&this.opts){const others=shuffle(SHADES.filter(s=>s!==this.sh)).slice(0,2);this.opts=shuffle([this.sh,...others]).map(s=>({label:s[0],ok:s===this.sh,draw:(c,x,y)=>{c.fillStyle=s[1];rr(c,x-18,y-32,36,58,[6,6,16,16]);c.fill();c.strokeStyle='#c8ccd6';c.lineWidth=2;c.stroke();}}));}},
  draw(c){if(this.view==='mouth'){dentBg(c,this);dmFace(c,this,{happy:this.happy>0||this.fin>0,scared:this.scared>0});if(this.imp&&this.st&&this.st.tool==='impression'){c.fillStyle='rgba(255,154,200,.6)';ell(c,this.M.mx,this.M.my-30,230,110);}}
    else{roomBg(c,'#fff6ea','#e8d8c0',H-230,'#fffaf2',[['window',80,230,.8,100,80]]);txt(c,'ぎこうしさんの こうぼう',W/2,190,24,'#8a5a3a');const ty=H*.47;
      c.fillStyle='#8a98a8';rr(c,W-150,210,120,110,10);c.fill();c.fillStyle='#3a3e4a';rr(c,W-134,226,88,50,6);c.fill();c.fillStyle=`rgba(255,140,40,${.6+.3*Math.sin(T*3)})`;rr(c,W-128,232,76,38,4);c.fill();txt(c,'やく かま',W-90,296,13,'#fff');
      c.fillStyle='#fff';rr(c,W/2-70,226,140,70,10);c.fill();c.strokeStyle='#d8ccb8';c.lineWidth=2;c.stroke();txt(c,'シェードガイド',W/2,240,12,'#8a5a3a');SHADES.forEach((q,k)=>{const x=W/2-48+k*32;c.save();c.translate(x,272);c.fillStyle=q[1];dmToothPath(c,{type:'inc'},22,30);c.fill();c.strokeStyle='#c8ccd6';c.lineWidth=1.5;c.stroke();c.restore();txt(c,q[0],x,292,9,'#8a5a3a');});
      c.fillStyle='rgba(0,0,0,.08)';rr(c,24,ty+6,W-48,26,6);c.fill();c.fillStyle='#d8b890';rr(c,20,ty,W-40,26,6);c.fill();c.fillStyle='#c8a478';c.fillRect(40,ty+26,14,H-230-ty-26);c.fillRect(W-54,ty+26,14,H-230-ty-26);
      const mx=W/2-120,my=ty-20;c.fillStyle='#e8eef4';ell(c,mx,my+8,130,20);c.fillStyle='#ff9ac8';c.beginPath();c.ellipse(mx,my,120,86,0,Math.PI,TAU);c.lineTo(mx+86,my);c.ellipse(mx,my,86,54,0,0,Math.PI,true);c.closePath();c.fill();c.strokeStyle='#e070a0';c.lineWidth=3;c.stroke();
      for(let k=0;k<7;k++){const a=Math.PI*(1+(k+.5)/7);c.fillStyle=this.model?'#fffaf0':'#e070a0';circ(c,mx+Math.cos(a)*103,my+Math.sin(a)*70,this.model?14:9);}txt(c,this.model?'はの もけい':'かた',mx,my+30,15,'#8a5a3a');
      const cx=W/2+110,cy=ty-70;c.fillStyle='#b8c4d4';rr(c,cx-40,ty-24,80,24,6);c.fill();c.fillRect(cx-6,cy+30,12,ty-24-cy-30);if(this.si>=4){c.save();c.translate(cx,cy);c.scale(3.2,3.2);MED.crown(c,0,0,1,{col:this.sh[1]});c.restore();for(const q of this.cut)if(!q.done){c.fillStyle=this.sh[1];circ(c,q.x,q.y,13);c.strokeStyle='#a8a090';c.lineWidth=2;c.stroke();}}
      c.fillStyle='#fff';rr(c,W/2-54,ty+50,108,120,12);c.fill();c.strokeStyle='#d8ccb8';c.lineWidth=3;c.stroke();txt(c,'となりの は',W/2,ty+70,14,'#8a5a3a');c.save();c.translate(W/2,ty+124);c.fillStyle=this.sh[1];dmToothPath(c,{type:'inc'},46,62);c.fill();c.strokeStyle='#c8ccd6';c.lineWidth=2;c.stroke();c.restore();}
    this.drawCommon(c);}});

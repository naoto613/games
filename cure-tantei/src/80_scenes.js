// ================= scenes: title / office / files / notebook / practice / clear =================
const SCN={};
function backBtn(c){drawRBtn(c,36,34,24,'back','#ff8cc6');}
SCN.title={
  enter(){bgm('office');this.t=0;},
  update(dt){this.t+=dt;},
  draw(c){drawBG(c,'title');const b=Math.sin(T*2)*4;
    c.save();c.translate(200,150+b);c.rotate(-.04);otext(c,'なぞとき プリキュア',0,-58,20,'#fff6a8','#ff4f9a');otext(c,'キュアたんてい',0,-10,44,'#fff','#ff4f9a');otext(c,'ふーちゃん',0,52,58,'#bff4ff','#ff4f9a');c.restore();
    otext(c,'〜 リッキーと ジュエルの なぞ 〜',200,250,17,'#fff','#b86af0','center',FONT);
    drawGlow(c,'#fff',200,450,180,.6);drawFutan(c,150,540,{s:3.2,cure:1,pose:'win',item:'wand'});drawRicky(c,270,480,{s:2.6,cure:1,happy:1});
    drawIcon(c,'gem:#ff7ab8',60,330,1);drawIcon(c,'gem:#5ac8ff',345,350,.9);drawIcon(c,'lens',330,560,1.4);drawIcon(c,'steth',70,560,1.2);
    drawBtn(c,200,620,230,70,'はじめる！','#ff5fa2',{pulse:1,size:28});
    drawRBtn(c,364,34,22,SAVE.mute?'mute':'sound','#8a7af0');txt(c,hasTTS?'5さい〜 ／ こえと おとが でるよ':'この ブラウザでは こえが でません（Safari・Chrome で あそんでね）',200,690,hasTTS?13:11,'#8a5a7a');},
  down(x,y){if(inC(x,y,364,34,28)){SAVE.mute=!SAVE.mute;save();if(SAVE.mute)hush();else say('こえと おとが でるよ！','fu');sfx('tap');return;}
    if(inR(x,y,200,620,240,80)){sfx('henshin');say('キュアたんてい ふーちゃん！ はじまるよ！','fu');go(SCN.office);}},
};
const OFFICE_BTNS=[['files','じけん ファイル','#ff5fa2','letter'],['book','たんてい てちょう','#ffa03a','book'],['practice','れんしゅう','#5aa8ff','star']];
SCN.office={
  enter(){bgm('office');this.t=0;RUN.doc=false;RUN.cure=false;const n=SAVE.cleared;
    const line=()=>say(n===0?'ようこそ、たんてい じむしょへ！ 「じけん ファイル」を タッチして、さいしょの じけんを はじめよう！':n>=8?'まちは へいわ！ れんしゅうや てちょうで あそぼう！':pick(['つぎの じけんが まってるよ！','きょうも たんてい がんばろう！','じけん ファイルを みてみよう！']),'fu');if(speaking())setTimeout(()=>{if(scene===SCN.office)line();},1800);else line();},
  update(dt){this.t+=dt;},
  draw(c){drawBG(c,'office');c.fillStyle='rgba(255,255,255,.9)';rr(c,70,20,260,46,23);c.fill();c.strokeStyle='#c8905a';c.lineWidth=3;c.stroke();txt(c,'たんてい じむしょ',200,44,22,'#a0643a','center',900);
    for(let i=0;i<8;i++){const x=200+(i-3.5)*40,got=i<SAVE.cleared;if(got)drawIcon(c,'gem:'+GEM_COLS[i],x,92,.62);else{c.fillStyle='rgba(120,80,40,.25)';circ(c,x,92,12);}}
    OFFICE_BTNS.forEach(([k,l,col,ic],i)=>drawBtn(c,200,245+i*88,300,70,l,col,{icon:ic,pulse:k==='files'&&SAVE.cleared<8,size:24}));
    drawFutan(c,120,660,{s:2.3,item:'lens',pose:'point'});drawRicky(c,250,625,{s:2});drawRBtn(c,364,34,22,SAVE.mute?'mute':'sound','#8a7af0');},
  down(x,y){if(inC(x,y,364,34,28)){SAVE.mute=!SAVE.mute;save();if(SAVE.mute)hush();else say('こえと おとが でるよ！','fu');sfx('tap');return;}
    OFFICE_BTNS.forEach(([k],i)=>{if(inR(x,y,200,245+i*88,300,74)){sfx('pop');go(SCN[k]);}});
    if(inR(x,y,120,610,70,120)){sfx('tap');say(pick(['わたしは たんていの ふーちゃん！','むしめがねで なんでも みつけちゃう！','へんしんすると キュアふーちゃん！','おいしゃさんも できるんだよ！']),'fu');}
    if(inR(x,y,250,580,60,80)){sfx('baby');burst(250,560,8,'heart');say(pick(['ばぶー！','ねえね だいすき！','リッキーも たんてい！','きゃっきゃ！']),'rk');}},
};
SCN.files={
  enter(){bgm('office');this.t=0;say('どの じけんを しらべる？','fu');},
  update(dt){this.t+=dt;},
  cardY(i){return 118+i*72;},
  draw(c){drawBG(c,'office');c.fillStyle='rgba(60,30,20,.35)';c.fillRect(VX0-2,VY0-2,VX1-VX0+4,VY1-VY0+4);backBtn(c);otext(c,'じけん ファイル',200,40,26,'#fff','#ff5fa2','center',FONT);
    CHAPTERS.forEach((ch,i)=>{const y=this.cardY(i),open=i<=SAVE.cleared,done=i<SAVE.cleared,k=easeBack(clamp(this.t*4-i*.25,0,1));if(k<=0)return;c.save();c.translate(200,y);c.scale(k,k);c.rotate(((i%3)-1)*.012);
      c.fillStyle='rgba(0,0,0,.25)';rr(c,-178,-28,356,62,14);c.fill();c.fillStyle=open?'#fff6dc':'#d8cfc4';rr(c,-180,-32,360,62,14);c.fill();c.strokeStyle=open?'#c8905a':'#a89a8a';c.lineWidth=3;c.stroke();
      c.fillStyle=open?'#ff5fa2':'#a89a8a';circ(c,-150,-1,19);txt(c,String(i+1),-150,0,20,'#fff','center',900);
      if(open){drawIcon(c,ch.icon,-108,-1,.9);txt(c,ch.title,-80,0,18,'#4a3a2a','left',900);}else{drawIcon(c,'lock',-108,-1,.8);txt(c,'？？？',-80,0,18,'#8a7a6a','left',900);}
      if(done){c.save();c.translate(140,0);c.rotate(-.25);c.strokeStyle='#ff3d6d';c.lineWidth=3;c.beginPath();c.arc(0,0,24,0,TAU);c.stroke();txt(c,'かいけつ',0,1,11,'#ff3d6d','center',900);c.restore();}
      else if(open&&SAVE.cp&&SAVE.cp.ci===i&&SAVE.cp.i>0){c.fillStyle='#5aa8ff';rr(c,108,-14,60,26,13);c.fill();txt(c,'つづき',138,0,13,'#fff','center',900);}
      else if(open){c.fillStyle='#ff5fa2';rr(c,112,-14,56,26,13);c.fill();txt(c,'NEW',140,0,13,'#fff','center',900);}c.restore();});},
  down(x,y){if(inC(x,y,36,34,30)){sfx('tap');go(SCN.office);return;}
    CHAPTERS.forEach((ch,i)=>{if(!inR(x,y,200,this.cardY(i),360,64))return;if(i>SAVE.cleared){sfx('no');say('まえの じけんを かいけつすると ひらくよ','rk');return;}sfx('pop');startChapter(i);});},
};
function startChapter(i){const cp=SAVE.cp&&SAVE.cp.ci===i&&SAVE.cp.i>0?SAVE.cp:null;runSteps(CHAPTERS[i].steps,()=>chapterClear(i),{ci:i,start:cp?cp.i:0,flags:cp?cp.flags:{}});}
function chapterClear(i){SAVE.cp=null;if(SAVE.cleared<=i)SAVE.cleared=i+1;SAVE.stars[i]=1;save();SCN.clear.ci=i;go(SCN.clear);}
SCN.clear={
  enter(){this.t=0;bgm('office');sfx('fanfare');confetti(90);const i=this.ci;say(i>=7?'ぜんぶの じけんを かいけつ！ キュアたんてい ふーちゃん、だいかつやく！':`じけん かいけつ！ ひかりの ジュエルを ${JA_NUM[i+1]}こ あつめたよ！`,'fu');},
  update(dt){this.t+=dt;if(this.t>1&&this.t<1.05)sfx('stamp');},
  draw(c){const i=this.ci;drawBG(c,'title');const k=easeBack(clamp((this.t-.6)*2.5,0,1));
    c.save();c.translate(200,150);c.rotate(-.12);c.scale(k*1.2||.001,k*1.2||.001);c.strokeStyle='#ff3d6d';c.lineWidth=8;rr(c,-140,-44,280,88,16);c.stroke();otext(c,'じけん かいけつ！',0,2,34,'#ff3d6d','#fff');c.restore();
    txt(c,`じけん ${i+1}「${CHAPTERS[i].title}」`,200,236,16,'#5b2c47','center',900);
    for(let j=0;j<8;j++){const a=-Math.PI/2+j/8*TAU,x=200+Math.cos(a)*104,y=380+Math.sin(a)*104,got=j<SAVE.cleared;const isNew=j===i;
      if(got){const kk=isNew?easeBack(clamp((this.t-1.4)*2,0,1)):1;if(kk>0){c.save();c.translate(x,y);c.scale(kk,kk);drawIcon(c,'gem:'+GEM_COLS[j],0,0,1.05);c.restore();}}else{c.fillStyle='rgba(120,80,140,.25)';circ(c,x,y,16);}}
    drawFutan(c,180,425,{s:1.3,cure:1,pose:'win'});drawRicky(c,230,405,{s:1.1,cure:1,happy:1});txt(c,`ひかりの ジュエル ${SAVE.cleared} / 8`,200,522,20,'#ff5fa2','center',900);
    if(this.t>1.8){drawBtn(c,200,590,260,62,'じむしょに もどる','#ff8cc6',{size:21});if(i<7)drawBtn(c,200,666,260,62,'つぎの じけんへ','#5aa8ff',{size:21,pulse:1});}},
  down(x,y){if(this.t<1.8)return;if(inR(x,y,200,590,260,66)){sfx('pop');go(SCN.office);}else if(this.ci<7&&inR(x,y,200,666,260,66)){sfx('pop');startChapter(this.ci+1);}},
};
SCN.book={
  enter(){this.tab=0;this.page=0;this.t=0;bgm('office');say('たんてい てちょう だよ。 あつめた ジュエルと、おぼえた ことばが みられるよ','fu');},
  update(dt){this.t+=dt;},
  draw(c){drawBG(c,'office');c.fillStyle='rgba(60,30,20,.3)';c.fillRect(VX0-2,VY0-2,VX1-VX0+4,VY1-VY0+4);backBtn(c);otext(c,'たんてい てちょう',200,40,24,'#fff','#ffa03a','center',FONT);
    c.fillStyle='#fffaf0';rr(c,16,110,368,596,20);c.fill();c.strokeStyle='#e0b070';c.lineWidth=4;c.stroke();
    ['ジュエル','ことば'].forEach((l,i)=>{c.fillStyle=this.tab===i?'#ffa03a':'#f0dcc0';rr(c,40+i*165,74,155,44,14);c.fill();txt(c,l,117+i*165,96,18,this.tab===i?'#fff':'#a0643a','center',900);});
    if(this.tab===0){for(let j=0;j<8;j++){const x=80+(j%4)*80,y=190+Math.floor(j/4)*150,got=j<SAVE.cleared;c.fillStyle=got?'#fff0f8':'#eee';circ(c,x,y,32);if(got){drawIcon(c,'gem:'+GEM_COLS[j],x,y,1.2);}else txt(c,'?',x,y+2,26,'#bbb');
        c.font=`800 11px ${FONT}`;const ls=wrap(c,got?CHAPTERS[j].title:'？？？',74);ls.forEach((l,k)=>txt(c,l,x,y+48+k*14,11,'#5b2c47'));}
      txt(c,`ひかりの ジュエル  ${SAVE.cleared} / 8`,200,470,20,'#ff5fa2','center',900);
      drawIcon(c,'steth',80,540,1);txt(c,`なおした かんじゃさん： ${SAVE.doc||0}にん`,120,540,17,'#5b2c47','left',900);
      drawIcon(c,'heart',80,600,.9);txt(c,`やっつけた モンスター： ${SAVE.wins||0}ひき`,120,600,17,'#5b2c47','left',900);
      drawIcon(c,'book',80,660,.9);txt(c,`おぼえた ことば： ${SAVE.words.filter(w=>WORDS[w]).length}こ`,120,660,17,'#5b2c47','left',900);}
    else{const per=20,pages=Math.ceil(WORD_ORDER.length/per);this.page=clamp(this.page,0,pages-1);const list=WORD_ORDER.slice(this.page*per,this.page*per+per);
      list.forEach((w,j)=>{const x=64+(j%4)*91,y=160+Math.floor(j/4)*96,got=SAVE.words.includes(w);c.fillStyle=got?'#fff':'#f0ece8';rr(c,x-40,y-34,80,86,12);c.fill();c.strokeStyle=got?'#ffb3d6':'#e0d8d0';c.lineWidth=2.5;c.stroke();
        if(got){drawIcon(c,iconOfWord(w),x,y-4,.95);txt(c,WORDS[w][1],x,y+38,12,'#3a8aff','center',900);}else txt(c,'?',x,y+2,26,'#ccc');});
      drawRBtn(c,60,670,22,'back','#ffa03a');drawRBtn(c,340,670,22,'next','#ffa03a');txt(c,`${this.page+1} / ${pages}`,200,670,18,'#a0643a','center',900);}},
  down(x,y){if(inC(x,y,36,34,30)){sfx('tap');go(SCN.office);return;}
    for(let i=0;i<2;i++)if(inR(x,y,117+i*165,96,155,44)){this.tab=i;sfx('tap');return;}
    if(this.tab===1){if(inC(x,y,60,670,30)){this.page--;sfx('tap');return;}if(inC(x,y,340,670,30)){this.page++;sfx('tap');return;}
      const per=20;const list=WORD_ORDER.slice(this.page*per,this.page*per+per);list.forEach((w,j)=>{const cx=64+(j%4)*91,cy=160+Math.floor(j/4)*96;if(inR(x,y,cx,cy+9,80,86)&&SAVE.words.includes(w)){sfx('pop');say(WORDS[w][0],'fu',WORDS[w][1]);burst(cx,cy,6);}});}},
};
// ---------- れんしゅう ----------
const ENG_POOL={thing:['apple','banana','cake','strawberry','fish','star','moon','sun','flower','ball','car','book','key','heart','clock','hat','umbrella','icecream','carrot','grape','crab','octopus','balloon','pencil'],
  animal:['cat','dog','rabbit','bear','pig','penguin','lion','elephant','owl','chick','turtle','mouse','fox','panda','sheep'],color:['red','blue','yellow','green','pink','purple','orange','black','white','brown'],shape:['circle','triangle','square']};
function engRound(cat){const pool=ENG_POOL[cat];const s=shuffle(pool).slice(0,3);const w=WORDS[s[0]];return{q:`「${w[1]}」は どれ？`,say:[[w[1],'en'],['は どれかな？','ja']],top:{listen:true},ans:iconOfWord(s[0]),wrong:s.slice(1).map(iconOfWord),ok:`${w[1]} は ${w[0]}！`,okEn:w[1]};}
function genEng(){const cats=['thing','animal','color','thing','animal','shape'];return[{t:'quiz',bg:'office',rounds:shuffle(cats).slice(0,5).map(engRound)}];}
function addRound(){const a=randi(1,5),b=randi(1,4),n=a+b;const s=new Set();while(s.size<2){const v=n+pick([-2,-1,1,2]);if(v>=1&&v!==n)s.add(v);}const k=pick(['apple','star','candy','fish','flower','cookie']);return{q:`${WORDS[k][0]}が ${a}こ と ${b}こ。 ぜんぶで いくつ？`,top:{add:[a,b,k]},ans:'n:'+n,wrong:[...s].map(v=>'n:'+v),ok:`${a} たす ${b} は ${n}！`,okEn:EN_NUM[n]};}
function numEngRound(){const s=shuffle([1,2,3,4,5,6,7,8,9,10]).slice(0,3);return{q:`「${EN_NUM[s[0]]}」は どの すうじ？`,say:[[EN_NUM[s[0]],'en'],['は どの すうじ？','ja']],top:{listen:true},ans:'n:'+s[0],wrong:s.slice(1).map(v=>'n:'+v),ok:`${EN_NUM[s[0]]} は ${s[0]}！`,okEn:EN_NUM[s[0]]};}
function genNum(){return[{t:'count',bg:'park',icon:pick(['apple','star','flower','fish','candy','pawcat']),n:randi(4,10)},{t:'quiz',bg:'school',rounds:[addRound(),addRound(),numEngRound(),numEngRound()]}];}
const ABC_WORDS=[['CAT','a:cat'],['DOG','a:dog'],['SUN','sun'],['CAKE','cake'],['STAR','star'],['FISH','fish'],['BOOK','book'],['MOON','moon'],['KEY','key'],['PIG','a:pig'],['BEAR','a:bear'],['BALL','ball'],['CAR','car'],['HAT','hat']];
function genAbc(){return shuffle(ABC_WORDS).slice(0,2).map(([w,p])=>({t:'abc',bg:'school',word:w,pic:p,say:'この じゅんばんで タッチしてね',done:(wordOf(p)||[''])[0]}));}
function genDoc(){const T0=pick(['cold','swallow','thorn','scrape','tooth','powder']);const others=k=>shuffle(Object.keys(DIAG).filter(x=>x!==k&&x!=='tired')).slice(0,2);
  const base={t:'doctor',tools:{thermo:36.5,steth:'normal',light:'ok',xray:'ok',lens:'ok'}};
  if(T0==='cold')return[Object.assign(base,{pt:pick(['usa','hitsuji','nezumi','hiyoko']),say:'ハクション！ あたまが あつくて ぼーっと する…',sick:true,tools:Object.assign(base.tools,{thermo:pick([37.8,38,38.5,39]),light:'red',steth:'fast'}),need:['thermo','light'],diag:{ans:'cold',wrong:others('cold'),ok:'かぜを ひいたんだね'},treat:[{t:'ice'},{t:'med',col:pick(['pink','blue','yellow'])},{t:'sleep'}]})];
  if(T0==='swallow'){const it=pick(['ball','key','bell','candy']);return[Object.assign(base,{pt:pick(['inu','zou','buta','lion']),say:'おなかが へんな かんじ…',sick:true,tools:Object.assign(base.tools,{xray:it,steth:'guru'}),need:['steth','xray'],diag:{ans:'swallow',wrong:others('swallow'),ok:`${WORDS[it][0]}を のみこんじゃったんだね`},treat:[{t:'rub',area:'belly',item:it},{t:'med',col:pick(['green','orange'])}]})];}
  if(T0==='thorn')return[Object.assign(base,{pt:pick(['lion','kuma','kitsune']),say:'てが チクチク いたいよ〜',tools:Object.assign(base.tools,{lens:'thorn'}),need:['lens'],diag:{ans:'thorn',wrong:others('thorn'),ok:'とげが ささってたんだね'},treat:[{t:'thorn',n:randi(2,4)}]})];
  if(T0==='scrape')return[Object.assign(base,{pt:pick(['kame','usa','pen']),say:'ころんで あしが ヒリヒリ…',tools:Object.assign(base.tools,{lens:'scrape'}),need:['lens'],diag:{ans:'scrape',wrong:others('scrape'),ok:'すりきずだね'},treat:[{t:'band',n:randi(2,4)}]})];
  if(T0==='tooth')return[Object.assign(base,{pt:pick(['kuma','nezumi','lion']),say:'はが ズキズキ するの…',tools:Object.assign(base.tools,{light:'tooth'}),need:['light'],diag:{ans:'tooth',wrong:others('tooth'),ok:'むしばだね'},treat:[{t:'rub',area:'mouth'},{t:'med',col:pick(['yellow','pink'])}]})];
  return[Object.assign(base,{pt:pick(['buta2','hitsuji']),say:'はなが むずむず… ハクション！',tools:Object.assign(base.tools,{lens:'powder'}),need:['lens'],diag:{ans:'powder',wrong:others('powder'),ok:'へんな こなが ついてたんだね'},treat:[{t:'rub',area:'face'}]})];}
const MONS=[{kind:'cake',name:'ケーキモンスター',col:'#ffb3d6',item:'cake'},{kind:'candy',name:'キャンディモンスター',col:'#ff7ab8',item:'candy'},{kind:'paint',name:'えのぐモンスター',col:'#b48cff',item:'paint'},{kind:'germ',name:'ハクションモンスター',col:'#a060e0',item:'med:pink'},{kind:'clock',name:'すうじモンスター',col:'#ff9a2a',item:'clock'},{kind:'octo',name:'タコモンスター',col:'#ff7a9a',item:'chest'},{kind:'star',name:'ほしモンスター',col:'#ffd23a',item:'star'}];
function genBattle(){const m=MONS[randi(0,Math.min(MONS.length-1,Math.max(0,SAVE.cleared)))];return[{t:'battle',mon:m,lv:randi(1,3),chances:shuffle(['num','color','letter','count','shape','word','add']).slice(0,2),fin:pick(['heart','star','circle','rainbow','diamond','moon']),item:m.item}];}
function genDots(){const s=pick([['star',10,'star','night'],['heart',10,'heart','park'],['fish',11,'fish','beach'],['clock',12,'clock','school']]);return[{t:'dots',shape:s[0],n:s[1],reveal:s[2],bg:s[3],done:'できた！ '+(WORDS[s[2]]?WORDS[s[2]][0]+'だ！':'')}];}
const PRACTICE=[['えいご クイズ','#ff5fa2','apple',genEng,'えいごの ことばを きいて えらぼう'],['かず クイズ','#ffa03a','n:5',genNum,'かぞえたり たしざん したり'],['ABC パズル','#3a8aff','l:A',genAbc,'アルファベットを ならべよう'],
  ['おいしゃさん','#3ec46a','steth',genDoc,'かんじゃさんを なおしてあげよう'],['すうじ つなぎ','#b86af0','star',genDots,'1から じゅんばんに つなごう'],['バトル','#ff4d8d','heart',genBattle,'へんしんして モンスターと たたかおう']];
SCN.practice={
  enter(){bgm('office');this.t=0;say('なにを れんしゅう する？','fu');},
  update(dt){this.t+=dt;},
  draw(c){drawBG(c,'office');c.fillStyle='rgba(30,40,80,.3)';c.fillRect(VX0-2,VY0-2,VX1-VX0+4,VY1-VY0+4);backBtn(c);otext(c,'れんしゅう',200,40,28,'#fff','#5aa8ff','center',FONT);
    PRACTICE.forEach(([l,col,ic,,sub],i)=>{const y=125+i*96;drawBtn(c,200,y,330,74,l,col,{icon:ic,size:24});otext(c,sub,200,y+48,13,'#fff','#6a4a8a','center',FONT);});},
  down(x,y){if(inC(x,y,36,34,30)){sfx('tap');go(SCN.office);return;}
    PRACTICE.forEach(([l,,,gen],i)=>{if(inR(x,y,200,125+i*96,330,78)){sfx('pop');runSteps(gen(),()=>{go(SCN.practice);setTimeout(()=>say('よく できました！ はなまる！','fu'),700);},{mode:'practice'});}});},
};

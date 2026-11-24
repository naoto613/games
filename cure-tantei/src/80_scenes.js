// ================= scenes: title / office / files / notebook / practice / clear =================
const SCN={};
const PART_THEMES=[
  {title:'ひかりの ジュエル',color:'#cf4e88',paper:'#fff6dc',edge:'#c8905a'},
  {title:'モヤモヤンと えがおの スター',color:'#8353b0',paper:'#f7efff',edge:'#a785d0'},
  {title:'ほしぞら れっしゃ',color:'#9469b5',paper:'#fff0de',edge:'#c68bb5'},
];
const RAIL_FIRST=CHAPTERS.findIndex(ch=>ch.part===3);
function chapterIsClear(i){return i>=RAIL_FIRST?i-RAIL_FIRST<SAVE.railCleared:i<SAVE.cleared;}
function chapterIsOpen(i){return i>=RAIL_FIRST?i-RAIL_FIRST<=SAVE.railCleared:i<=SAVE.cleared;}
function chapterCheckpoint(i){
  const cp=SAVE[checkpointKey(i)];
  return cp?.ci===i&&Number.isInteger(cp.i)&&cp.i>0?cp:null;
}
function openFiles(part){SCN.files.requested=part;go(SCN.files);}
function backBtn(c){drawRBtn(c,36,34,24,'back','#ff8cc6');}
SCN.title={
  enter(){bgm('office');this.t=0;},
  update(dt){this.t+=dt;},
  draw(c){drawBG(c,'title');const b=Math.sin(T*2)*4;
    c.save();c.translate(200,150+b);c.rotate(-.04);otext(c,'なぞとき プリキュア',0,-58,20,'#fff6a8','#ff4f9a');otext(c,'キュアたんてい',0,-10,44,'#fff','#ff4f9a');otext(c,'ふーちゃん',0,52,58,'#bff4ff','#ff4f9a');c.restore();
    otext(c,'〜 リッキーと ジュエルの なぞ 〜',200,250,17,'#fff','#b86af0','center',FONT);
    drawGlow(c,'#fff',200,450,180,.6);drawFutan(c,150,540,{s:3.2,cure:1,pose:'win',item:'wand'});drawRicky(c,270,480,{s:2.6,cure:1,happy:1});
    drawIcon(c,'gem:#ff7ab8',60,330,1);drawIcon(c,'gem:#5ac8ff',345,350,.9);drawIcon(c,'lens',330,560,1.4);drawIcon(c,'steth',70,560,1.2);
    drawBtn(c,200,589,244,56,'はじめる！','#ff5fa2',{size:25});
    drawBtn(c,200,653,244,49,'だい3ぶへ','#8665bb',{icon:'star',size:20});
    txt(c,hasTTS?'5さい〜 ／ こえと おとが でるよ':'この ブラウザでは こえが でません',200,700,12,'#76506e');},
  hit(x,y){return inR(x,y,200,589,248,58)?'office':inR(x,y,200,653,248,50)?'rail':null;},
  down(x,y){this.pressed=this.hit(x,y);},
  up(x,y){
    const target=this.pressed;this.pressed=null;
    if(!target||this.hit(x,y)!==target)return;
    if(target==='rail'){sfx('pop');openFiles(3);return;}
    sfx('henshin');say('キュアたんてい ふーちゃん！ はじまるよ！','fu');go(SCN.office);
  },
};
const OFFICE_BTNS=[['files','じけん ファイル','#ff5fa2','letter'],['book','たんてい てちょう','#ffa03a','book'],['practice','れんしゅう','#5aa8ff','star']];
SCN.office={
  enter(){bgm('office');this.t=0;RUN.doc=false;RUN.cure=false;const n=SAVE.cleared;
    const line=()=>say(n===0?'ようこそ、たんてい じむしょへ！ 「じけん ファイル」を タッチして、さいしょの じけんを はじめよう！':n>=RAIL_FIRST?'ほしぞら れっしゃは、じけん ファイルの だい3ぶだよ！':pick(['つぎの じけんが まってるよ！','きょうも たんてい がんばろう！','じけん ファイルを みてみよう！']),'fu');if(speaking())setTimeout(()=>{if(scene===SCN.office)line();},1800);else line();},
  update(dt){this.t+=dt;},
  draw(c){drawBG(c,'office');c.fillStyle='rgba(255,255,255,.9)';rr(c,70,20,260,46,23);c.fill();c.strokeStyle='#c8905a';c.lineWidth=3;c.stroke();txt(c,'たんてい じむしょ',200,44,22,'#a0643a','center',900);
    for(let i=0;i<RAIL_FIRST;i++){const row=i>=8?1:0,x=200+((i%8)-3.5)*38,y=84+row*30;if(chapterIsClear(i))drawIcon(c,rewardIcon(i),x,y,.55);else{c.fillStyle='rgba(120,80,40,.25)';circ(c,x,y,10);}}
    for(let i=RAIL_FIRST;i<CHAPTERS.length;i++){
      const x=200+(i-RAIL_FIRST-1)*33;
      if(chapterIsClear(i))drawIcon(c,rewardIcon(i),x,147,.55);else{c.fillStyle='#ae88b0';starP(c,x,147,9,3.5);c.fill();}
    }
    OFFICE_BTNS.forEach(([k,l,col,ic],i)=>drawBtn(c,200,245+i*88,300,70,l,col,{icon:ic,pulse:k==='files'&&!chapterIsClear(CHAPTERS.length-1),size:24}));
    drawFutan(c,120,660,{s:2.3,item:'lens',pose:'point'});drawRicky(c,250,625,{s:2});},
  down(x,y){
    OFFICE_BTNS.forEach(([k],i)=>{if(inR(x,y,200,245+i*88,300,74)){sfx('pop');go(SCN[k]);}});
    if(inR(x,y,120,610,70,120)){sfx('tap');say(pick(['わたしは たんていの ふーちゃん！','むしめがねで なんでも みつけちゃう！','へんしんすると キュアふーちゃん！','おいしゃさんも できるんだよ！']),'fu');}
    if(inR(x,y,250,580,60,80)){sfx('baby');burst(250,560,8,'heart');say(pick(['ばぶー！','ねえね だいすき！','リッキーも たんてい！','きゃっきゃ！']),'rk');}},
};
SCN.files={
  enter(){
    this.part=this.requested||(SAVE.cleared>=RAIL_FIRST?3:SAVE.cleared>=8?2:1);
    this.requested=null;
    bgm(this.part===3?'night':'office');
    say('どの じけんを しらべる？','fu');
  },
  list(){return CHAPTERS.map((_,i)=>i).filter(i=>chapterPart(i)===this.part);},
  cardY(k){return this.part===3?238+k*127:181+k*63;},
  draw(c){
    const theme=PART_THEMES[this.part-1],isRail=this.part===3;
    drawBG(c,isRail?'railway':'office');
    if(!isRail)fillAll(c,'rgba(63,36,56,.39)');
    backBtn(c);otext(c,'じけん ファイル',200,40,26,'#fff',theme.color,'center',FONT);
    PART_THEMES.forEach(({color},i)=>{
      const x=76+i*124,on=this.part===i+1,locked=i===1&&SAVE.cleared<8;
      c.fillStyle=on?color:'#fff9f5';rr(c,x-58,72,116,44,14);c.fill();
      txt(c,`だい${i+1}ぶ`,x-(locked?7:0),94,18,on?'#fff':locked?'#796c7a':color);
      if(locked)drawIcon(c,'lock',x+38,94,.43);
    });
    txt(c,theme.title,200,139,19,'#fff');
    if(isRail){
      c.strokeStyle='#b992c2';c.lineWidth=3;c.setLineDash([3,8]);c.beginPath();
      c.moveTo(64,218);c.lineTo(64,575);c.stroke();c.setLineDash([]);
      drawRailEngine(c,64,575,1);
      txt(c,`ほしぞらの きっぷ  ${SAVE.railCleared} / ${CHAPTERS.length-RAIL_FIRST}`,200,622,18,'#ffe0a8');
      txt(c,'せんろを まわして、ほしを はこぼう',200,654,16,'#fff2e0');
    }
    this.list().forEach((i,k)=>{
      const ch=CHAPTERS[i],y=this.cardY(k),open=chapterIsOpen(i),done=chapterIsClear(i),cp=chapterCheckpoint(i);
      const h=isRail?88:53,cx=isRail?221:200,w=isRail?318:360;
      c.save();c.translate(cx,y);
      c.fillStyle='rgba(27,16,40,.32)';rr(c,-w/2,-h/2+4,w,h,14);c.fill();
      c.fillStyle=open?theme.paper:isRail?'#cec0d9':'#dfd5d5';
      rr(c,-w/2,-h/2,w,h,14);c.fill();
      c.strokeStyle=open?theme.edge:'#aa9bb6';c.lineWidth=2;c.stroke();
      const left=-w/2;
      if(isRail){
        c.fillStyle=done?'#ffd17d':'#483858';circ(c,left,0,17);
        txt(c,String(k+1),left,0,16,done?'#402640':'#fff');
        drawIcon(c,open?ch.icon:'lock',left+42,-3,.95);
        txt(c,open?ch.title:'？？？',left+65,-13,16,'#4a314a','left');
      }else{
        c.fillStyle=open?theme.color:'#9e8d9e';circ(c,left+28,0,16);
        txt(c,String(i+1),left+28,0,15,'#fff');
        drawIcon(c,open?ch.icon:'lock',left+65,0,.77);
        c.font=`900 16px ${FONT}`;
        const title=open?ch.title:'？？？';
        txt(c,title,left+92,0,Math.min(16,16*190/c.measureText(title).width),'#4a314a','left');
      }
      if(open){
        const label=cp?'つづき':done?'かいけつ':'はじめる';
        const tagX=isRail?left+108:w/2-43,tagY=isRail?19:0;
        c.fillStyle=cp?'#416f9f':done?'#7b4d9f':theme.color;
        rr(c,tagX-36,tagY-12,72,24,12);c.fill();
        txt(c,label,tagX,tagY,12,'#fff');
      }
      c.restore();
    });
    if(this.part===2&&SAVE.cleared>=8)txt(c,'てがかり ノートで すいりしよう',200,681,16,'#fff');
  },
  down(x,y){
    if(inC(x,y,36,34,30)){sfx('tap');go(SCN.office);return;}
    const tab=PART_THEMES.findIndex((_,i)=>inR(x,y,76+i*124,94,116,44));
    if(tab!==-1){
      if(tab===1&&SAVE.cleared<8){sfx('no');say('だい1ぶを ぜんぶ かいけつすると ひらくよ','rk');return;}
      this.part=tab+1;bgm(tab===2?'night':'office');sfx('tap');return;
    }
    const isRail=this.part===3;
    const i=this.list().find((_,k)=>inR(x,y,isRail?221:200,this.cardY(k),isRail?318:360,isRail?88:56));
    if(i===undefined)return;
    if(!chapterIsOpen(i)){sfx('no');say('まえの じけんを かいけつすると ひらくよ','rk');return;}
    sfx('pop');startChapter(i);
  },
};
function rewardIcon(i){
  if(i>=RAIL_FIRST)return ['star','moon','smilestar'][i-RAIL_FIRST];
  return i>=8?'smilestar':'gem:'+GEM_COLS[i];
}
function startChapter(i){
  const {steps}=CHAPTERS[i],cp=chapterCheckpoint(i);
  let start=cp?.i||0;
  if(cp&&cp.v!==2&&chapterPart(i)===2){
    // 旧セーブの番号は、てがかりノートを足す前の並びを指す。
    const original=steps.filter(step=>step.t!=='evidence')[start];
    start=steps.indexOf(original);
  }
  if(start<0||start>=steps.length)start=0;
  runSteps(steps,()=>chapterClear(i),{ci:i,start,flags:start?cp?.flags:{}});
}
function chapterClear(i){
  SAVE[checkpointKey(i)]=null;
  if(i>=RAIL_FIRST)SAVE.railCleared=Math.max(SAVE.railCleared,i-RAIL_FIRST+1);
  else SAVE.cleared=Math.max(SAVE.cleared,i+1);
  SAVE.stars[i]=1;
  save();SCN.clear.ci=i;go(SCN.clear);
}
SCN.clear={
  enter(){
    this.t=0;this.stamped=false;
    const i=this.ci,part=chapterPart(i);
    bgm(part===3?'night':'office');sfx('fanfare');confetti(82);
    const line=i===7?'だい1ぶ かんけつ！ つぎは だい2ぶ！':i===RAIL_FIRST-1?'えがおの スターが ぜんぶ そろったよ！ つぎは ほしぞら れっしゃ。':
      i===CHAPTERS.length-1?'ほしの おまつり だいせいこう！ だい3ぶ かんけつ！':
      part===3?'じけん かいけつ！ ほしぞらの きっぷを もらったよ！':
      part===2?'じけん かいけつ！ えがおの スターを みつけたよ！':'じけん かいけつ！ ひかりの ジュエルを みつけたよ！';
    say(line,'fu');
  },
  update(dt){this.t+=dt;if(this.t>1&&!this.stamped){this.stamped=true;sfx('stamp');}},
  draw(c){
    const i=this.ci,part=chapterPart(i),p2=part===2,isRail=part===3,last=i===CHAPTERS.length-1;
    drawBG(c,isRail?'railway':'title');
    const k=easeBack(clamp((this.t-.35)*2.5,0,1));
    c.save();c.translate(200,150);c.rotate(-.09);c.scale(k||.001,k||.001);
    c.strokeStyle=isRail?'#ffd48c':'#ff3d6d';c.lineWidth=6;rr(c,-141,-38,282,76,16);c.stroke();
    otext(c,last?'おまつり だいせいこう！':'じけん かいけつ！',0,0,last?24:31,isRail?'#ffdd99':'#d83662',isRail?'#4b2c63':'#fff','center',FONT);c.restore();
    txt(c,CHAPTERS[i].title,200,222,19,isRail?'#fff2e1':'#5b2c47');
    const prizes=CHAPTERS.map((_,j)=>j).filter(j=>chapterPart(j)===part);
    prizes.forEach((j,n)=>{
      const a=-Math.PI/2+n/prizes.length*TAU;
      const x=isRail?80+n*120:200+Math.cos(a)*104;
      const y=isRail?330:373+Math.sin(a)*104;
      if(isRail){
        c.fillStyle=chapterIsClear(j)?'#fce3b7':'#55446e';
        rr(c,x-43,y-27,86,54,11);c.fill();
        c.strokeStyle=chapterIsClear(j)?'#c38c80':'#8b759a';c.lineWidth=2;c.stroke();
      }
      if(chapterIsClear(j)){
        const scale=j===i?easeBack(clamp((this.t-1)*2,0,1)):1;
        if(scale>0){c.save();c.translate(x,y);c.scale(scale,scale);drawIcon(c,rewardIcon(j),0,0,1);c.restore();}
      }else if(!isRail){c.fillStyle='rgba(120,80,140,.25)';circ(c,x,y,16);}
    });
    drawFutan(c,167,isRail?505:418,{s:isRail?1.75:1.3,cure:!isRail,pose:'win'});
    drawRicky(c,226,isRail?485:403,{s:isRail?1.4:1.1,cure:!isRail,happy:1});
    if(p2||isRail)drawGhost(c,329,isRail?463:535,.64,T,{kind:1});
    const count=isRail?SAVE.railCleared:p2?Math.max(0,SAVE.cleared-8):Math.min(8,SAVE.cleared);
    const reward=isRail?'ほしぞらの きっぷ':p2?'えがおの スター':'ひかりの ジュエル';
    txt(c,`${reward} ${count} / ${prizes.length}`,200,535,19,isRail?'#ffdd99':'#9a3b75');
    if(this.t>1.8){
      drawBtn(c,200,590,260,53,'じけん ファイルへ',isRail?'#9675bb':'#ff8cc6',{size:20});
      if(!last)drawBtn(c,200,659,260,55,i===7?'だい2ぶへ！':i===RAIL_FIRST-1?'だい3ぶへ！':'つぎの じけんへ',isRail?'#d87ba7':'#5aa8ff',{size:21});
    }
  },
  down(x,y){
    if(this.t<1.8)return;
    if(inR(x,y,200,590,260,53)){sfx('pop');openFiles(chapterPart(this.ci));}
    else if(this.ci<CHAPTERS.length-1&&inR(x,y,200,659,260,55)){sfx('pop');startChapter(this.ci+1);}
  },
};
SCN.book={
  enter(){this.tab=0;this.page=0;this.t=0;bgm('office');say('たんてい てちょう だよ。 あつめた ジュエルと、おぼえた ことばが みられるよ','fu');},
  update(dt){this.t+=dt;},
  draw(c){drawBG(c,'office');c.fillStyle='rgba(60,30,20,.3)';c.fillRect(VX0-2,VY0-2,VX1-VX0+4,VY1-VY0+4);backBtn(c);otext(c,'たんてい てちょう',200,40,24,'#fff','#ffa03a','center',FONT);
    c.fillStyle='#fffaf0';rr(c,16,110,368,596,20);c.fill();c.strokeStyle='#e0b070';c.lineWidth=4;c.stroke();
    ['ジュエル','ことば'].forEach((l,i)=>{c.fillStyle=this.tab===i?'#ffa03a':'#f0dcc0';rr(c,40+i*165,74,155,44,14);c.fill();txt(c,l,117+i*165,96,18,this.tab===i?'#fff':'#a0643a','center',900);});
    if(this.tab===0){for(let j=0;j<8;j++){const x=80+(j%4)*80,y=170+Math.floor(j/4)*118,got=j<SAVE.cleared;c.fillStyle=got?'#fff0f8':'#eee';circ(c,x,y,32);if(got){drawIcon(c,'gem:'+GEM_COLS[j],x,y,1.2);}else txt(c,'?',x,y+2,26,'#bbb');
        c.font=`800 11px ${FONT}`;const ls=wrap(c,got?CHAPTERS[j].title:'？？？',74);ls.forEach((l,k)=>txt(c,l,x,y+44+k*13,11,'#5b2c47'));}
      txt(c,`ひかりの ジュエル  ${Math.min(8,SAVE.cleared)} / 8`,200,396,17,'#ff5fa2','center',900);
      for(let j=0;j<8;j++){const x=53+j*42,got=8+j<SAVE.cleared;c.fillStyle=got?'#fff8e0':'#eee';circ(c,x,440,18);if(got)drawIcon(c,'smilestar',x,440,.7);else txt(c,'?',x,442,16,'#bbb');}txt(c,`えがおの スター  ${Math.max(0,SAVE.cleared-8)} / 8`,200,478,15,'#ffa03a','center',900);
      drawIcon(c,'star',80,518,.76);txt(c,`ほしぞらの きっぷ  ${SAVE.railCleared} / ${CHAPTERS.length-RAIL_FIRST}`,120,518,17,'#5b2c47','left',900);
      drawIcon(c,'steth',80,563,.78);txt(c,`なおした かんじゃさん： ${SAVE.doc||0}にん`,120,563,17,'#5b2c47','left',900);
      drawIcon(c,'heart',80,608,.76);txt(c,`やっつけた モンスター： ${SAVE.wins||0}ひき`,120,608,17,'#5b2c47','left',900);
      drawIcon(c,'book',80,653,.76);txt(c,`おぼえた ことば： ${SAVE.words.filter(w=>WORDS[w]).length}こ`,120,653,17,'#5b2c47','left',900);}
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
const MONS=[{kind:'cake',name:'ケーキモンスター',col:'#ffb3d6',item:'cake'},{kind:'candy',name:'キャンディモンスター',col:'#ff7ab8',item:'candy'},{kind:'paint',name:'えのぐモンスター',col:'#b48cff',item:'paint'},{kind:'germ',name:'ハクションモンスター',col:'#a060e0',item:'med:pink'},{kind:'clock',name:'すうじモンスター',col:'#ff9a2a',item:'clock'},{kind:'octo',name:'タコモンスター',col:'#ff7a9a',item:'chest'},{kind:'star',name:'ほしモンスター',col:'#ffd23a',item:'star'},{kind:'balloon',name:'ふうせんモンスター',col:'#ff6f91',item:'balloon'},{kind:'snowman',name:'ゆきだるまモンスター',col:'#5aa8ff',item:'snowman'},{kind:'mushroom',name:'きのこモンスター',col:'#b86af0',item:'firefly'},{kind:'jelly',name:'ゼリーモンスター',col:'#6ae0c8',item:'cake'},{kind:'book',name:'えほんモンスター',col:'#5aa8ff',item:'book'},{kind:'lantern',name:'ちょうちんモンスター',col:'#ff5a4a',item:'firework'},{kind:'pumpkin',name:'かぼちゃモンスター',col:'#ff9a2a',item:'heart'}];
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

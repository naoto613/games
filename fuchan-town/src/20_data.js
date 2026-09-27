// ================= save / outfits =================
const SKEY='fuchan-town-v1';
const SAVE={stickers:[],shiny:[],pages:[[],[],[],[]],gifts:[],outfit:{dress:'yukata',hat:'none',shoes:'#ff5f9a',item:'none'},sound:true,v:4};
try{Object.assign(SAVE,JSON.parse(localStorage.getItem(SKEY)||'{}'));}catch(e){}
if(SAVE.v!==4){SAVE.v=4;if(!SAVE.outfit||SAVE.outfit.hat==='usamimi'||!SAVE.outfit.hat)SAVE.outfit=Object.assign({dress:'yukata',shoes:'#ff5f9a',item:'none'},SAVE.outfit||{},{hat:'none'});}
if(!Array.isArray(SAVE.shiny))SAVE.shiny=[];if(!Array.isArray(SAVE.pages)||SAVE.pages.length<4)SAVE.pages=[[],[],[],[]];if(!Array.isArray(SAVE.gifts))SAVE.gifts=[];if(!SAVE.outfit.item)SAVE.outfit.item='none';
function save(){try{localStorage.setItem(SKEY,JSON.stringify(SAVE));}catch(e){}}
const DRESSES=[
  {id:'yukata',style:'yukata',dress:'#fbeaf4',pat:['#ff8cbc','#c9a2e6'],ribbon:'#ff6fa3',sw:'#ffc8e0',ja:'ゆかた',en:'yukata'},
  {id:'yukata2',style:'yukata',dress:'#e8f2ff',pat:['#5aa8ff','#ff8cc0'],ribbon:'#ffc93c',sw:'#bcd8ff',ja:'みずいろの ゆかた',en:'blue yukata'},
  {id:'pink',dress:'#ff8cc0',skirt:'#ffc8e6',ribbon:'#ff4d8d',sw:'#ff8cc0',ja:'ピンク',en:'pink'},
  {id:'yellow',dress:'#ffd84a',skirt:'#fff2a8',ribbon:'#5aa8ff',sw:'#ffd84a',ja:'きいろ',en:'yellow'},
  {id:'mint',dress:'#5fd3a8',skirt:'#b8f0d8',ribbon:'#ff8cc0',sw:'#5fd3a8',ja:'みどり',en:'green'},
  {id:'sky',dress:'#5aa8ff',skirt:'#bfe0ff',ribbon:'#ff4d6d',sw:'#5aa8ff',ja:'あお',en:'blue'},
  {id:'lav',dress:'#b48cff',skirt:'#e0d0ff',ribbon:'#ffd23a',sw:'#b48cff',ja:'むらさき',en:'purple'},
  {id:'red',dress:'#ff4d6d',skirt:'#ffb3c0',ribbon:'#ffd23a',sw:'#ff4d6d',ja:'あか',en:'red'},
  {id:'magic',style:'magic',dress:'#ff7ab8',skirt:'#ffffff',ribbon:'#ff3d8a',sw:'#ff7ab8',ja:'まじかるドレス',en:'magic dress'},
];
const HATS=[['none','なし',''],['cap','ぼうし','cap'],['mbow','リボン','ribbon'],['hana','おはな','flowers'],['tiara','ティアラ','tiara'],['beret','ベレーぼう','beret'],['crown','かんむり','crown'],['star','ほし','star'],['dhat','たんていぼうし','detective hat']];
const SHOES=[['#ff5f9a','ピンク','pink'],['#ffffff','しろ','white'],['#ffd23a','きいろ','yellow'],['#5aa8ff','あお','blue'],['#b48cff','むらさき','purple'],['#ff4d6d','あか','red'],['#6cd08a','みどり','green'],['#3a3050','くろ','black']];
const ITEMS_ACC=[['none','なし',''],['uchiwa','うちわ','fan'],['kakigori','かきごおり','shaved ice'],['flower','おはな','flower'],['bag','バッグ','bag'],['wand','ステッキ','magic wand'],['balloon','ふうせん','balloon'],['balloon2','にじいろ ふうせん','rainbow balloons']];
const GIFTS=[[3,'hat','tiara','ティアラ'],[6,'dress','yukata2','みずいろの ゆかた'],[10,'item','wand','ステッキ'],[15,'hat','crown','かんむり'],[20,'dress','lav','むらさきの ドレス'],[25,'item','balloon','ふうせん'],[30,'hat','star','ほしの かざり'],[36,'dress','red','あかい ドレス'],[39,'hat','dhat','たんていぼうし'],[42,'dress','magic','まじかるドレス'],[50,'item','balloon2','にじいろ ふうせん']];
function lockedN(cat,id){const g=GIFTS.find(g=>g[1]===cat&&g[2]===id);return g&&SAVE.stickers.length<g[0]?g[0]:0;}
const OUTFIT0=Object.assign({},DRESSES[0],{acc:'none',boots:'#ff5f9a'});
function outfit(extra){const o=SAVE.outfit;const d=DRESSES.find(x=>x.id===o.dress)||DRESSES[0];return Object.assign({},d,{acc:o.hat,boots:o.shoes,item:o.item==='none'?null:o.item},extra||{});}
// ================= words =================
const WORDS={balloon:['ふうせん','balloon'],flower:['おはな','flower'],strawberry:['いちご','strawberry'],cherry:['さくらんぼ','cherry'],blueberry:['ブルーベリー','blueberry'],choco:['チョコレート','chocolate'],starcandy:['ほし','star'],heartcookie:['クッキー','cookie'],candle:['ろうそく','candle'],
  apple:['りんご','apple'],banana:['バナナ','banana'],carrot:['にんじん','carrot'],milk:['ぎゅうにゅう','milk'],bread:['パン','bread'],fish:['おさかな','fish'],egg:['たまご','egg'],cheese:['チーズ','cheese'],tomato:['トマト','tomato'],grapes:['ぶどう','grapes'],corn:['とうもろこし','corn'],
  bone:['ほね','bone'],bamboo:['たけ','bamboo'],duck:['あひる','duck'],bear:['くま','bear'],rabbit:['うさぎ','rabbit'],cat:['ねこ','cat'],dog:['いぬ','dog'],panda:['パンダ','panda'],pig:['ぶた','pig'],chick:['ひよこ','chick'],hippo:['かば','hippo'],
  icepack:['こおり','ice'],bandage:['ばんそうこう','bandage'],sponge:['スポンジ','sponge'],shower:['シャワー','shower'],cake:['ケーキ','cake'],bubble:['あわ','bubble'],dress:['ドレス','dress'],crown:['かんむり','crown'],ribbon:['リボン','ribbon'],
  letterA:['あ','A'],letterABC:['エービーシー','ABC'],pencil:['えんぴつ','pencil'],cart:['カート','cart'],soap:['せっけん','soap'],thermometer:['たいおんけい','thermometer'],spray:['スプレー','spray'],spoon:['おくすり','medicine'],
  shampoo:['シャンプー','shampoo'],towel:['タオル','towel'],coin:['おかね','coin'],flour:['こむぎこ','flour'],whisk:['あわだてき','whisk'],wand:['ステッキ','magic wand'],goldfish:['きんぎょ','goldfish'],hanabi:['はなび','fireworks'],kakigori:['かきごおり','shaved ice'],
  palette:['パレット','palette'],crayon:['クレヨン','crayon'],icecream:['アイス','ice cream'],puzzle:['パズル','puzzle'],note:['おんぷ','music'],xylophone:['もっきん','xylophone'],mic:['マイク','microphone'],toothbrush:['はぶらし','toothbrush'],tooth:['は','tooth'],cup:['コップ','cup'],poi:['ポイ','poi'],uchiwa:['うちわ','fan']};
// ================= screen =================
const W=600;let H=1000,SC=1,OX=0,OY=0,DPR=1;let scene=null;
function resize(){DPR=Math.min(2,devicePixelRatio||1);const cw=innerWidth,ch=innerHeight;cv.width=Math.round(cw*DPR);cv.height=Math.round(ch*DPR);cv.style.width=cw+'px';cv.style.height=ch+'px';
  H=clamp(W*ch/cw,860,1300);SC=Math.min(cw/W,ch/H);OX=(cw-W*SC)/2;OY=(ch-H*SC)/2;if(scene&&scene.lay)scene.lay();}
addEventListener('resize',resize);
// ================= audio =================
let AC=null,MG=null,BG=null,NB=null;
function audioInit(){if(AC){if(AC.state==='suspended')AC.resume();return;}try{AC=new(window.AudioContext||window.webkitAudioContext)();const comp=AC.createDynamicsCompressor();comp.connect(AC.destination);MG=AC.createGain();MG.gain.value=.34;MG.connect(comp);BG=AC.createGain();BG.gain.value=0;BG.connect(comp);}catch(e){AC=null;}}
function tone(f,d,type='triangle',v=.2,t0=0,slide=0,dest,atk=.01){if(!AC||!SAVE.sound)return;const t=AC.currentTime+Math.max(0,t0);const o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,f+slide),t+d);g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+atk);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(dest||MG);o.start(t);o.stop(t+d+.03);}
function noise(d,v,freq,t0=0,dest,type='bandpass'){if(!AC||!SAVE.sound)return;if(!NB){NB=AC.createBuffer(1,AC.sampleRate*.6,AC.sampleRate);const a=NB.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;}
  const t=AC.currentTime+Math.max(0,t0),s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=NB;f.type=type;f.frequency.value=freq;f.Q.value=1.1;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(f);f.connect(g);g.connect(dest||MG);s.start(t);s.stop(t+d+.05);}
function sfx(k){switch(k){
  case'pop':tone(520,.09,'sine',.28,0,700);break;
  case'tap':tone(880,.06,'sine',.12,0,300);break;
  case'boing':tone(260,.3,'sine',.28,0,380);break;
  case'spark':[1318,1760,2349].forEach((f,i)=>tone(f,.14,'triangle',.13,i*.06));break;
  case'ding':tone(1046,.12,'triangle',.22);tone(1568,.3,'triangle',.2,.1);break;
  case'no':tone(392,.13,'sine',.2);tone(311,.22,'sine',.2,.13);break;
  case'squish':noise(.14,.3,900);break;
  case'water':noise(.14,.1,3000);break;
  case'splash':noise(.3,.3,1500);tone(700,.2,'sine',.08,0,-400);break;
  case'beep':tone(1760,.1,'square',.1);break;
  case'munch':noise(.07,.3,500);noise(.07,.3,500,.16);noise(.07,.3,500,.32);break;
  case'fanfare':[523,659,784,1046,784,1046,1318].forEach((f,i)=>{tone(f,.24,'square',.07,i*.11);tone(f,.3,'triangle',.18,i*.11);});break;
  case'whoosh':noise(.35,.12,800,0,undefined,'lowpass');tone(240,.35,'sine',.1,0,700);break;
  case'honk':tone(392,.16,'square',.09);tone(392,.22,'square',.09,.2);break;
  case'squeak':tone(1400,.12,'sine',.2,0,700);break;
  case'shutter':noise(.05,.4,2000);noise(.08,.3,1200,.07);break;
  case'giggle':[1320,1560,1320,1760].forEach((f,i)=>tone(f,.08,'sine',.12,i*.09,120));break;
  case'crack':noise(.08,.4,1800);tone(900,.05,'square',.06);break;
  case'pour':noise(.7,.12,1200,0,undefined,'lowpass');break;
  case'boom':tone(90,.6,'sine',.4,0,-50);noise(.8,.35,300,0,undefined,'lowpass');break;
  case'launch':tone(300,.6,'sine',.12,0,900);noise(.5,.08,3000);break;
  case'chin':tone(2093,.5,'sine',.2);tone(2637,.6,'sine',.12,.05);break;
  case'coin':tone(1318,.07,'square',.1);tone(1976,.25,'square',.1,.07);break;
  case'tick':tone(1200,.03,'square',.06);break;
  case'bell':tone(1568,.6,'sine',.2);tone(2093,.5,'sine',.1,.02);break;
  case'heart':tone(784,.12,'sine',.2);tone(988,.18,'sine',.18,.1);break;
  case'brush':noise(.12,.18,4000);break;
  case'bite':noise(.06,.35,700);tone(300,.06,'sine',.1);break;
  case'blow':noise(.4,.2,700,0,undefined,'lowpass');break;
  case'snap':tone(1400,.05,'square',.12);tone(700,.08,'triangle',.15,.03);break;
  case'rip':noise(.25,.25,2500);break;
  case'gacha':for(let i=0;i<6;i++)tone(600+i*80,.05,'square',.07,i*.07);break;
  case'open':tone(523,.1,'triangle',.2);tone(784,.1,'triangle',.2,.08);tone(1046,.25,'triangle',.2,.16);noise(.2,.15,3000,.1);break;
}}
// ================= music =================
const _=null;
const SONGS={
  town:{bpm:132,lead:[67,72,76,72,79,_,76,_,77,76,74,76,72,_,67,_,69,72,77,72,81,_,79,_,77,76,74,72,74,_,_,_,76,76,77,79,79,77,76,74,72,72,74,76,76,_,74,_,76,76,77,79,79,77,76,74,72,74,76,74,72,_,_,_],
    roots:[48,48,53,55,48,55,53,48],bell:[_,_,_,_,_,_,_,_,_,_,_,_,84,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,86,_,_,_],drum:'pop'},
  play:{bpm:142,lead:[72,_,74,76,77,_,76,_,74,_,72,_,69,_,_,_,70,_,72,74,76,_,74,_,72,_,70,_,72,_,_,_,77,77,76,74,72,_,74,_,76,76,74,72,70,_,72,_,74,74,72,70,69,_,67,_,65,_,69,72,77,_,_,_],
    roots:[53,53,58,60,53,58,60,53],bell:[],drum:'pop'},
  matsuri:{bpm:124,lead:[74,_,76,74,71,_,69,_,71,74,76,_,74,_,_,_,78,_,76,74,76,_,71,_,69,71,74,_,74,_,_,_,81,_,78,76,74,_,76,_,78,76,74,71,69,_,_,_,71,_,74,76,78,76,74,71,69,_,71,_,74,_,_,_],
    roots:[50,50,55,50,50,55,57,50],bell:[],drum:'taiko'},
  hero:{bpm:156,lead:[69,_,72,76,_,74,72,_,74,_,76,_,79,_,76,_,77,_,76,74,_,72,74,_,76,_,_,_,_,_,_,_,69,_,72,76,_,79,81,_,79,_,77,_,76,_,74,_,72,74,76,_,77,_,79,_,81,_,_,_,84,_,_,_],
    roots:[45,45,41,43,45,45,41,43],bell:[_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,88,_,_,_],drum:'pop'},
  fuwa:{bpm:116,lead:[79,_,76,_,77,79,_,_,81,_,79,77,76,_,_,_,74,_,76,77,79,_,76,_,72,_,74,_,72,_,_,_,79,_,84,_,83,81,79,_,81,_,79,_,76,_,_,_,77,76,74,_,76,_,79,_,72,_,_,_,_,_,_,_],
    roots:[48,45,53,55,48,45,53,55],bell:[84,_,_,_,_,_,_,_,88,_,_,_,_,_,_,_,91,_,_,_,_,_,_,_,88,_,_,_,_,_,_,_],drum:'pop'},
};
let curSong=null,bgNext=0,bgStep=0;
const mtof=m=>440*Math.pow(2,(m-69)/12);
function kick(t){if(!AC)return;const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(45,t+.13);g.gain.setValueAtTime(.5,t);g.gain.exponentialRampToValueAtTime(.001,t+.18);o.connect(g);g.connect(BG);o.start(t);o.stop(t+.2);}
function playStep(S,st,t){const dt=t-AC.currentTime,spb=60/S.bpm/2;const m=S.lead[st%S.lead.length];const bar=Math.floor(st/8)%S.roots.length,p=st%8,r=S.roots[bar];
  if(m!=null){tone(mtof(m),spb*1.7,'square',.045,dt,0,BG,.005);tone(mtof(m),spb*1.9,'triangle',.13,dt,0,BG,.005);}
  const bn=[r,_,r+12,_,r+7,_,r+12,r+7][p];if(bn!=null)tone(mtof(bn),spb*.9,'triangle',.26,dt,0,BG,.004);
  if(p%2===1){const ch=[0,4,7,12][((st>>1)%4)];tone(mtof(r+24+ch),spb*.8,'sine',.05,dt,0,BG);}
  const b=S.bell[st%32];if(b)tone(mtof(b),spb*3,'sine',.08,dt,0,BG);
  if(S.drum==='pop'){if(p===0||p===4)kick(t);if(p===2||p===6)noise(.1,.16,1800,dt,BG);noise(.03,p%2?.05:.08,8000,dt,BG,'highpass');}
  else{if(p===0||p===3||p===4)kick(t);if(p===2||p===6){tone(1300,.05,'square',.06,dt,0,BG);tone(900,.06,'triangle',.08,dt,0,BG);}}}
setInterval(()=>{if(!AC||!BG)return;const want=scene&&scene.song!==undefined?scene.song:'play';
  BG.gain.setTargetAtTime(SAVE.sound&&want?(speaking()?.1:.22):0,AC.currentTime,.25);if(!SAVE.sound||!want)return;
  if(want!==curSong){curSong=want;bgStep=0;bgNext=AC.currentTime+.1;}const S=SONGS[want],spb=60/S.bpm/2;
  if(bgNext<AC.currentTime)bgNext=AC.currentTime+.05;
  while(bgNext<AC.currentTime+.22){playStep(S,bgStep,bgNext);bgNext+=spb;bgStep=(bgStep+1)%S.lead.length;}},50);
// ================= voice =================
const hasTTS='speechSynthesis' in window;let JV=null,EV=null;
function loadVoices(){if(!hasTTS)return;const v=speechSynthesis.getVoices();JV=v.find(x=>/^ja/i.test(x.lang))||null;EV=v.find(x=>/^en[-_]US/i.test(x.lang))||v.find(x=>/^en/i.test(x.lang))||null;}
if(hasTTS){loadVoices();speechSynthesis.onvoiceschanged=loadVoices;}
function speaking(){return hasTTS&&speechSynthesis.speaking;}
function speak(text,lang,pitch){if(!SAVE.sound||!hasTTS||!text)return;try{const u=new SpeechSynthesisUtterance(text);u.lang=lang==='en'?'en-US':'ja-JP';const v=lang==='en'?EV:JV;if(v)u.voice=v;u.rate=lang==='en'?.8:1.02;u.pitch=pitch||1.35;speechSynthesis.speak(u);}catch(e){}}
function hush(){if(hasTTS)try{speechSynthesis.cancel();}catch(e){}}
let bub=null,card=null;
function say(text){hush();speak(text.replace(/[☆♪]/g,''));bub={text,t:0,life:Math.max(2.6,text.length*.17)};}
function sayWord(k,extra){const w=WORDS[k];if(!w)return;hush();if(extra)speak(extra);speak(w[0]);speak(w[1],'en');card={k,ja:w[0],en:w[1],t:0};}
function sayPair(ja,en,k){hush();speak(ja);if(en)speak(en,'en');card={k,ja,en,t:0};}
// ================= particles =================
const parts=[];
function burst(x,y,n,kind){for(let i=0;i<n;i++){const a=Math.random()*TAU,s=rand(80,260);parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-120,life:rand(.7,1.3),t:0,kind:kind||pick(['star','heart','dot']),col:pick(['#ffd23a','#ff8cc0','#7ad8ff','#b8a0ff','#8ef0b0','#ff9a5c']),r:rand(6,12),rot:rand(0,6)});}}
function confetti(n){for(let i=0;i<n;i++)parts.push({x:rand(0,W),y:rand(-200,-10),vx:rand(-40,40),vy:rand(120,260),life:rand(2.5,4),t:0,kind:'conf',col:pick(['#ffd23a','#ff8cc0','#7ad8ff','#b8a0ff','#8ef0b0','#ff6f91']),r:rand(6,10),rot:rand(0,6),vr:rand(-6,6)});}
function bubbles(x,y,n){for(let i=0;i<n;i++)parts.push({x:x+rand(-20,20),y:y+rand(-10,10),vx:rand(-30,30),vy:rand(-120,-40),life:rand(.8,1.6),t:0,kind:'bub',r:rand(6,14)});}
function ring(x,y,col){parts.push({x,y,vx:0,vy:0,life:.45,t:0,kind:'ring',col:col||'rgba(255,255,255,.9)',r:10});}
function drops(x,y,n,col){for(let i=0;i<n;i++)parts.push({x:x+rand(-10,10),y,vx:rand(-120,120),vy:rand(-260,-80),life:rand(.6,1),t:0,kind:'drop',col:col||'#7ac8ff'});}
function puff(x,y,n,col){for(let i=0;i<n;i++)parts.push({x:x+rand(-15,15),y:y+rand(-10,10),vx:rand(-60,60),vy:rand(-80,-20),life:rand(.6,1.1),t:0,kind:'puff',col:col||'#fff',r:rand(10,20)});}
function updParts(dt){for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.t+=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;
  if(p.kind==='conf'){p.rot+=p.vr*dt;p.vx+=Math.sin(p.t*3)*20*dt;}else if(p.kind==='bub'){p.vx*=.98;}else if(p.kind==='drop'){p.vy+=900*dt;}else if(p.kind==='puff'){p.vx*=.95;p.vy*=.95;p.r+=dt*20;}else if(p.kind==='ring'){p.r+=dt*120;}else if(p.kind==='fw'){p.vx*=.97;p.vy=p.vy*.97+60*dt;}else{p.vy+=380*dt;p.vx*=.98;}
  if(p.t>p.life)parts.splice(i,1);}}
function drawParts(c){for(const p of parts){const a=Math.min(1,(p.life-p.t)*3);c.globalAlpha=Math.max(0,a);
  if(p.kind==='bub'){c.strokeStyle='rgba(120,190,255,.8)';c.lineWidth=2;c.fillStyle='rgba(220,240,255,.45)';c.beginPath();c.arc(p.x,p.y,p.r,0,TAU);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.9)';circ(c,p.x-p.r*.35,p.y-p.r*.35,p.r*.25);}
  else if(p.kind==='drop'){c.fillStyle=p.col;ell(c,p.x,p.y,3,6);}
  else if(p.kind==='puff'){c.globalAlpha=Math.max(0,a*.7);c.fillStyle=p.col;circ(c,p.x,p.y,p.r);}
  else if(p.kind==='ring'){c.strokeStyle=p.col;c.lineWidth=4*(1-p.t/p.life);c.beginPath();c.arc(p.x,p.y,p.r,0,TAU);c.stroke();}
  else if(p.kind==='fw'){c.fillStyle=p.col;circ(c,p.x,p.y,p.r*(1-p.t/p.life*.6));c.globalAlpha=Math.max(0,a*.4);circ(c,p.x,p.y,p.r*2.2);}
  else if(p.kind==='conf'){c.save();c.translate(p.x,p.y);c.rotate(p.rot);c.fillStyle=p.col;c.fillRect(-p.r/2,-p.r/4,p.r,p.r/2);c.restore();}
  else if(p.kind==='note'){c.fillStyle=p.col;c.font=`${p.r*2}px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.fillText('♪',p.x,p.y);}
  else{c.fillStyle=p.col;if(p.kind==='heart'){heartP(c,p.x,p.y,p.r*.8);c.fill();}else if(p.kind==='star'){star(c,p.x,p.y,p.r,p.r*.45,5,p.rot+p.t*4);c.fill();}else circ(c,p.x,p.y,p.r*.5);}}
  c.globalAlpha=1;}

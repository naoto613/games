// ================= audio (sfx / original bgm / voice) =================
let AC=null,MG=null,BGG=null,NOISE=null;
let ttsUnlocked=false;
function audioInit(){if(!ttsUnlocked&&'speechSynthesis' in window){ttsUnlocked=true;try{const u=new SpeechSynthesisUtterance(' ');u.volume=0;speechSynthesis.speak(u);}catch(e){}}if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)();MG=AC.createGain();MG.gain.value=.6;MG.connect(AC.destination);BGG=AC.createGain();BGG.gain.value=1;BGG.connect(MG);}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();}
function tone(f,d,type='sine',v=.15,f2=0,when=0,dest){if(!AC||SAVE.mute)return;const t0=AC.currentTime+when,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t0);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t0+d);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v,t0+.01);g.gain.exponentialRampToValueAtTime(.001,t0+d);o.connect(g);g.connect(dest||MG);o.start(t0);o.stop(t0+d+.03);}
function noise(d,v,f,when=0,dest,type='highpass'){if(!AC||SAVE.mute)return;if(!NOISE){NOISE=AC.createBuffer(1,AC.sampleRate*.5,AC.sampleRate);const a=NOISE.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;}
  const t0=AC.currentTime+when,src=AC.createBufferSource(),fl=AC.createBiquadFilter(),g=AC.createGain();src.buffer=NOISE;fl.type=type;fl.frequency.value=f;
  g.gain.setValueAtTime(v,t0);g.gain.exponentialRampToValueAtTime(.001,t0+d);src.connect(fl);fl.connect(g);g.connect(dest||MG);src.start(t0);src.stop(t0+d+.02);}
const lastS={};function thr(k,ms){const n=performance.now();if(lastS[k]&&n-lastS[k]<ms)return false;lastS[k]=n;return true;}
const NOTE=n=>261.63*Math.pow(2,n/12);
const SFX={
  ready(){[1319,1760,2093].forEach((f,i)=>tone(f,.15,'sine',.08,0,i*.08));},
  tap(){tone(900,.06,'sine',.06,1200);},
  pop(){tone(600,.08,'sine',.1,1200);},
  ok(){[784,988,1319].forEach((f,i)=>tone(f,.18,'triangle',.1,0,i*.07));},
  no(){tone(300,.18,'triangle',.08,220);tone(260,.2,'triangle',.07,200,.12);},
  find(){[1047,1319,1568,2093].forEach((f,i)=>tone(f,.22,'sine',.08,0,i*.06));},
  count(n=1){tone(NOTE(12+[0,2,4,5,7,9,11,12,14,16,17,19,21,23,24,26,28,29,31,33][clamp(n-1,0,19)]),.14,'triangle',.1);},
  whoosh(){noise(.3,.08,1200,0,null,'bandpass');tone(300,.3,'sine',.04,900);},
  henshin(){[523,659,784,1047,1319,1568,2093].forEach((f,i)=>tone(f,.5,'triangle',.08,0,i*.08));tone(200,1.4,'sawtooth',.03,2000);},
  shot(){if(thr('shot',40))tone(700+Math.random()*200,.1,'square',.035,1400);},
  hit(){if(thr('hit',40)){tone(380,.08,'square',.05,200);noise(.08,.06,3000);}},
  guard(){tone(1200,.2,'sine',.08,1800);tone(1600,.2,'sine',.05,2400,.05);},
  hurt(){tone(320,.2,'sawtooth',.06,130);noise(.15,.05,800);},
  warn(){for(let i=0;i<2;i++)tone(660,.14,'square',.05,520,i*.2);},
  boom(){tone(160,.5,'triangle',.14,40);noise(.5,.12,300);},
  beam(){tone(400,1.2,'sawtooth',.05,1800);noise(1.2,.06,2000);[1047,1319,1568].forEach((f,i)=>tone(f,.8,'triangle',.06,0,.4+i*.1));},
  fanfare(){[784,784,784,1047,988,1047,1319].forEach((f,i)=>tone(f,.28,'triangle',.12,0,[0,.14,.28,.42,.7,.84,1][i]));},
  heal(){tone(880,.15,'sine',.1,1320);tone(1320,.2,'sine',.08,1760,.1);},
  baby(){tone(1100,.12,'sine',.08,1500);tone(1300,.14,'sine',.07,1700,.13);},
  jump(){tone(400,.15,'sine',.08,900);},
  coin(){tone(1319,.07,'square',.04);tone(1760,.12,'square',.04,0,.06);},
  unlock(){tone(500,.06,'square',.06);tone(900,.08,'square',.06,0,.08);[1047,1319,1568].forEach((f,i)=>tone(f,.2,'triangle',.08,0,.2+i*.08));},
  click(){tone(1500,.03,'square',.04);},
  stamp(){tone(120,.2,'triangle',.18,60);noise(.12,.1,500);},
  ring(){for(let i=0;i<6;i++){tone(1300,.05,'square',.04,0,i*.09);tone(1000,.05,'square',.04,0,i*.09+.045);}},
  sparkle(){if(thr('sp',60))tone(1800+Math.random()*800,.12,'sine',.04);},
  drum(){tone(90,.15,'sine',.2,50);},
  gulp(){tone(300,.1,'sine',.1,150);tone(250,.12,'sine',.1,120,.12);},
  burp(){tone(140,.25,'sawtooth',.08,90);},
  sneeze(){noise(.3,.12,1500);tone(700,.2,'sine',.05,300);},
  scrub(){if(thr('scrub',110))noise(.08,.05,3000);},
};
function sfx(k,a){if(SFX[k])SFX[k](a);}
// ---------- original BGM ----------
const mel=t=>t.trim().split(/\s+/).map(x=>x==='.'?null:+x);
const SONGS={
  office:{bpm:116,lead:'triangle',vol:.05,len:1.6,prog:[[0,4,7],[9,12,16],[5,9,12],[7,11,14]],
    mel:mel(`12 . 16 . 19 . 16 .  21 . 19 . 16 . . .  17 . 16 . 14 . 12 .  14 . . . 19 . . .
             12 . 16 . 19 . 24 .  23 . 21 . 19 . . .  17 . 19 . 21 . 17 .  19 . 14 . 12 . . .`)},
  search:{bpm:128,lead:'square',vol:.022,len:.9,prog:[[9,12,16],[5,9,12],[7,11,14],[4,8,11]],
    mel:mel(`21 . 24 21 . . 19 .  17 . 21 17 . . 16 .  19 . 23 19 . . 17 .  16 . 20 . 23 . . .
             21 . 24 . 28 . 26 24  24 . 21 . 17 . 21 .  23 . 19 . 14 . 19 .  20 . . . 16 . . .`)},
  battle:{bpm:152,lead:'sawtooth',vol:.018,len:1.3,prog:[[0,4,7],[7,11,14],[9,12,16],[5,9,12]],
    mel:mel(`24 . 24 . 23 24 . 19  19 . 21 . 23 . 26 .  24 . 23 . 21 . 19 .  21 . . 17 . 21 24 .
             24 . 28 . 26 24 . 23  23 . 26 . 31 . 26 .  28 . 26 . 24 . 23 .  24 . . . 24 . . .`)},
  boss:{bpm:144,lead:'sawtooth',vol:.018,len:1.3,prog:[[2,5,9],[-2,2,5],[0,4,7],[-3,1,4]],
    mel:mel(`14 . 14 17 . 14 13 .  14 . . 10 . . 14 .  16 . 16 19 . 16 14 .  13 . 16 . 21 . . .
             26 . 24 . 22 . 21 .  22 . 21 . 17 . 14 .  19 . 17 . 16 . 19 .  21 . 20 . 21 . . .`)},
  doctor:{bpm:104,lead:'sine',vol:.06,len:1.8,prog:[[5,9,12],[0,4,7],[2,5,9],[-2,2,5]],
    mel:mel(`17 . 21 . 24 . . .  19 . 16 . 12 . . .  17 . 14 . 21 . 19 .  17 . . . . . . .
             24 . 22 . 21 . 19 .  19 . 21 . 22 . 24 .  26 . 24 . 21 . 17 .  17 . . . 12 . . .`)},
  night:{bpm:96,lead:'triangle',vol:.05,len:2,prog:[[9,12,16],[5,9,12],[0,4,7],[7,11,14]],
    mel:mel(`28 . . 26 24 . . .  21 . . 24 26 . . .  24 . . 23 21 . 19 .  23 . . . . . . .
             28 . 31 . 28 . 26 .  24 . 26 . 28 . . .  24 . 23 . 21 . 19 .  21 . . . . . . .`)},
};
const BGM={song:null,step:0,next:0};
function bgm(name){if(BGM.song!==name){BGM.song=name;BGM.step=0;}}
function bgmTick(){if(!AC||!BGG)return;const sp=speaking();BGG.gain.setTargetAtTime(sp?.35:1,AC.currentTime,.12);
  if(SAVE.mute||!BGM.song||AC.state!=='running')return;const S=SONGS[BGM.song];if(!S)return;
  if(BGM.next<AC.currentTime)BGM.next=AC.currentTime+.05;
  while(BGM.next<AC.currentTime+.25){const spb=60/S.bpm/2,s=BGM.step%S.mel.length,ch=S.prog[(s>>3)%S.prog.length],when=BGM.next-AC.currentTime;
    if(s%4===0)tone(NOTE(ch[0]-24),spb*3,'triangle',.07,0,when,BGG);
    if(s%2===1)tone(NOTE(ch[(s>>1)%3]),spb*1.2,'sine',.025,0,when,BGG);
    if((BGM.song==='battle'||BGM.song==='boss')&&s%2===0)noise(.04,s%8===4?.05:.02,6000,when,BGG);
    const n=S.mel[s];if(n!=null)tone(NOTE(n),spb*S.len,S.lead,S.vol,0,when,BGG);
    BGM.step++;BGM.next+=spb;}}
// ---------- voice (speechSynthesis) ----------
const hasTTS='speechSynthesis' in window;let JV=null,EV=null;
function loadVoices(){if(!hasTTS)return;const v=speechSynthesis.getVoices();JV=v.find(x=>/^ja[-_]JP/i.test(x.lang))||v.find(x=>/^ja/i.test(x.lang))||null;
  EV=v.find(x=>/^en[-_]US/i.test(x.lang)&&/Samantha|Google US|Aria|Jenny|Female/i.test(x.name))||v.find(x=>/^en[-_]US/i.test(x.lang))||v.find(x=>/^en/i.test(x.lang))||null;}
if(hasTTS){loadVoices();try{speechSynthesis.onvoiceschanged=loadVoices;}catch(e){}}
function speaking(){return hasTTS&&speechSynthesis.speaking;}
const VO={fu:[1.45,1.05],rk:[1.95,1.12],kuro:[.8,1.05],witch:[.55,.92],narr:[1.15,1],en:[1.25,.82]};
function speakOne(text,lang,who){if(SAVE.mute||!hasTTS||!text)return;try{const u=new SpeechSynthesisUtterance(text.replace(/[「」『』☆★♪♡・…]/g,' ').replace(/〜/g,'ー'));
  u.lang=lang==='en'?'en-US':'ja-JP';const v=lang==='en'?EV:JV;if(v)u.voice=v;
  const p=lang==='en'?VO.en:(VO[who]||(NPC[who]&&NPC[who].vo)||[1.25,1]);u.pitch=p[0];u.rate=p[1];speechSynthesis.speak(u);}catch(e){}}
function hush(){if(hasTTS)try{speechSynthesis.cancel();}catch(e){}}
let LASTSAY=null;
// say('にほんご', who, 'english')  /  say([['apple','en'],['は どれ？','ja']], who)
function say(parts,who='fu',en){hush();const list=typeof parts==='string'?[[parts,'ja']]:parts.map(p=>typeof p==='string'?[p,'ja']:p);if(en)list.push([en,'en']);
  LASTSAY=[list,who];for(const[t,l]of list)speakOne(t,l,who);}
function replay(){if(LASTSAY){hush();for(const[t,l]of LASTSAY[0])speakOne(t,l,LASTSAY[1]);}}

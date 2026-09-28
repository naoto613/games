// ================= audio (sfx / original bgm / voice) =================
let AC=null,MG=null,BGG=null,NOISE=null;
function audioInit(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)();MG=AC.createGain();MG.gain.value=.6;MG.connect(AC.destination);BGG=AC.createGain();BGG.gain.value=1;BGG.connect(MG);}catch(e){}}if(AC&&AC.state==='suspended')AC.resume();}
function tone(f,d,type='sine',v=.15,f2=0,when=0,dest){if(!AC)return;const t0=AC.currentTime+when,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t0);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t0+d);g.gain.setValueAtTime(0,t0);g.gain.linearRampToValueAtTime(v,t0+.01);g.gain.exponentialRampToValueAtTime(.001,t0+d);o.connect(g);g.connect(dest||MG);o.start(t0);o.stop(t0+d+.03);}
function noise(d,v,f,when=0,dest,type='highpass'){if(!AC)return;if(!NOISE){NOISE=AC.createBuffer(1,AC.sampleRate*.5,AC.sampleRate);const a=NOISE.getChannelData(0);for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;}
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
function bgmTick(){if(!AC||!BGG)return;const sp=speaking()||AC.currentTime<MIC.echoUntil;if(MIC.state==='rec'||MIC.state==='asking'){BGG.gain.setTargetAtTime(0,AC.currentTime,.05);BGM.next=AC.currentTime+.1;return;}BGG.gain.setTargetAtTime(sp?.35:1,AC.currentTime,.12);
  if(!BGM.song||AC.state!=='running')return;const S=SONGS[BGM.song];if(!S)return;
  if(BGM.next<AC.currentTime)BGM.next=AC.currentTime+.05;
  while(BGM.next<AC.currentTime+.25){const spb=60/S.bpm/2,s=BGM.step%S.mel.length,ch=S.prog[(s>>3)%S.prog.length],when=BGM.next-AC.currentTime;
    if(s%4===0)tone(NOTE(ch[0]-24),spb*3,'triangle',.07,0,when,BGG);
    if(s%2===1)tone(NOTE(ch[(s>>1)%3]),spb*1.2,'sine',.025,0,when,BGG);
    if((BGM.song==='battle'||BGM.song==='boss')&&s%2===0)noise(.04,s%8===4?.05:.02,6000,when,BGG);
    const n=S.mel[s];if(n!=null)tone(NOTE(n),spb*S.len,S.lead,S.vol,0,when,BGG);
    BGM.step++;BGM.next+=spb;}}
// ---------- voice (speechSynthesis) ----------
// キラキラびょういん で じっきで きこえた しくみを そのまま つかう：
// じぶんの キューで 1つずつ よみあげ／cancel の あと すこし まつ／speak の まえに resume／さいしょの タッチで アンロック。
const hasTTS='speechSynthesis' in window;let JV=null,EV=null;
function pickVoice(v,re,pref){const c=v.filter(x=>re.test(x.lang));for(const p of pref){const f=c.find(x=>p.test(x.name));if(f)return f;}return c.find(x=>x.localService)||c[0]||null;}
function loadVoices(){if(!hasTTS)return;const v=speechSynthesis.getVoices();if(!v.length)return;JV=pickVoice(v,/^ja/i,[/Kyoko|O-ren|Google 日本語|Haruka|Nanami/i]);EV=pickVoice(v,/^en[-_]US/i,[/Samantha|Google US English|Aria|Jenny|Zira|Karen|Allison/i])||pickVoice(v,/^en/i,[/Samantha|Google|Daniel|Karen/i]);}
if(hasTTS){loadVoices();try{speechSynthesis.addEventListener('voiceschanged',loadVoices);}catch(e){speechSynthesis.onvoiceschanged=loadVoices;}}
const VO={moya:[1.05,1.12],fu:[1.4,1.02],rk:[1.7,1.05],kuro:[.85,1],witch:[.6,.92],narr:[1.2,1],en:[1.2,.85]};
const SQ=[];let SCUR=null,SWD=0,SGEN=0,SCAN=0;
function speaking(){return hasTTS&&(!!SCUR||SQ.length>0);}
function speakOne(text,lang,who){if(!hasTTS||!text)return;const t=text.replace(/[「」『』☆★♪♡・…]/g,' ').replace(/〜/g,'ー').trim();if(!t)return;
  SQ.push({text:t,lang,who});if(!SCUR&&SQ.length===1){const w=Math.max(0,140-(Date.now()-SCAN));if(w)setTimeout(spNext,w);else spNext();}}
function spNext(){if(SCUR||!SQ.length)return;const q=SQ.shift();if(!JV||!EV)loadVoices();const g=++SGEN;
  try{const u=new SpeechSynthesisUtterance(q.text);const en=q.lang==='en';u.lang=en?'en-US':'ja-JP';const v=en?EV:JV;if(v)u.voice=v;
    const p=en?VO.en:(VO[q.who]||(NPC[q.who]&&NPC[q.who].vo)||[1.35,1.02]);u.rate=p[1];u.pitch=clamp(p[0],.5,1.8);u.volume=1;SCUR=u;
    const tag=q.text.slice(0,10);vlog('speak '+tag);u.onstart=()=>vlog('start '+tag);
    const done=(ev)=>{if(ev&&ev.type==='error')vlog('ERROR '+(ev.error||'')+' '+tag);if(g!==SGEN)return;SCUR=null;clearTimeout(SWD);if(SQ.length)setTimeout(spNext,60);};u.onend=done;u.onerror=done;SWD=setTimeout(done,2500+q.text.length*(en?160:200));
    try{speechSynthesis.resume();}catch(e){}speechSynthesis.speak(u);}catch(e){SCUR=null;}}
const VLOG=[];function vlog(m){VLOG.push(((performance.now()/1000)|0)+'s '+m);if(VLOG.length>14)VLOG.shift();}
const VDEBUG=/debug/.test(location.search);
// Chrome の タッチは ゆびを はなした ときに はじめて 音声が ゆるされるので、pointerup でも アンロックする
let TTSUP=0;function ttsUnlockUp(){if(TTSUP||!hasTTS)return;TTSUP=1;vlog('unlock(up) active='+(navigator.userActivation?navigator.userActivation.hasBeenActive:'?'));try{loadVoices();speechSynthesis.resume();if(!speaking()&&LASTSAY)replay();}catch(e){vlog('unlock err '+e.message);}}
let TTSOK=0;function ttsUnlock(){if(TTSOK||!hasTTS)return;TTSOK=1;try{loadVoices();const u=new SpeechSynthesisUtterance(' ');u.volume=0;u.lang='en-US';speechSynthesis.speak(u);}catch(e){}}
function hush(){if(!hasTTS)return;SQ.length=0;SGEN++;SCUR=null;clearTimeout(SWD);SCAN=Date.now();try{speechSynthesis.cancel();}catch(e){}}
let LASTSAY=null;
// say('にほんご', who, 'english')  /  say([['apple','en'],['は どれ？','ja']], who)
function say(parts,who='fu',en){hush();const list=typeof parts==='string'?[[parts,'ja']]:parts.map(p=>typeof p==='string'?[p,'ja']:p);if(en)list.push([en,'en']);
  LASTSAY=[list,who];for(const[t,l]of list)speakOne(t,l,who);}
function replay(){if(LASTSAY){hush();for(const[t,l]of LASTSAY[0])speakOne(t,l,LASTSAY[1]);}}

// ================= sound: everything synthesized + voice =================
let AC=null,MASTER=null,SOUND=load('fs_sound',true);
function audio(){try{if(!AC){AC=new(window.AudioContext||window.webkitAudioContext)();MASTER=AC.createGain();MASTER.gain.value=SOUND?1:0;MASTER.connect(AC.destination)}if(AC.state==='suspended')AC.resume()}catch(e){}}
function setSound(on){SOUND=on;save('fs_sound',on);if(MASTER)MASTER.gain.value=on?1:0;document.querySelectorAll('.snd').forEach(b=>b.textContent=on?'おと：オン':'おと：オフ');if(!on&&window.speechSynthesis)speechSynthesis.cancel()}
function tone(f,t0,dur,type,vol,abs,slide){if(!AC)return;const o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';const t=abs!=null?abs:AC.currentTime+(t0||0);o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+dur);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol||.14,t+.012);g.gain.exponentialRampToValueAtTime(.0008,t+dur);o.connect(g);g.connect(MASTER);o.start(t);o.stop(t+dur+.05)}
function noise(t0,dur,vol,freq){if(!AC)return;const n=AC.sampleRate*dur,b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);const s=AC.createBufferSource();s.buffer=b;const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=freq||1200;const g=AC.createGain();g.gain.value=vol||.2;s.connect(f);f.connect(g);g.connect(MASTER);s.start(AC.currentTime+(t0||0))}
const SFX={
  pop(){tone(660+Math.random()*200,0,.1,'sine',.12,null,1200)},
  boing(){tone(300,0,.25,'triangle',.12,null,180);tone(420,.05,.2,'sine',.06,null,260)},
  found(){[523,659,784,1047,1319].forEach((f,i)=>tone(f,i*.08,.35,'triangle',.13));[1568,2093].forEach((f,i)=>tone(f,.45+i*.1,.5,'sine',.07))},
  chime(){[1047,1319,1568,2093].forEach((f,i)=>tone(f,i*.07,.5,'sine',.08))},
  magic(){for(let i=0;i<12;i++)tone(1200+Math.random()*1800,i*.05,.3,'sine',.05)},
  shutter(){noise(0,.08,.35,3000);noise(.09,.06,.25,2000)},
  whoosh(){noise(0,.6,.18,600)},
  hint(){[880,1175,1568].forEach((f,i)=>tone(f,i*.08,.3,'sine',.08))},
  meow(){tone(700,0,.35,'sawtooth',.03,null,500);tone(900,0,.35,'sine',.06,null,600)},
  bark(){tone(260,0,.12,'square',.06,null,160);tone(260,.16,.12,'square',.06,null,160)},
  tweet(){tone(2200,0,.08,'sine',.06,null,3000);tone(2400,.1,.08,'sine',.06,null,3200)},
  quack(){tone(500,0,.18,'sawtooth',.05,null,350)},
  splash(){noise(0,.35,.25,900)}
};
// BGM: a short generative loop per stage style
const BGM={on:false,next:0,step:0,timer:null,st:null};
const SCALES={major:[0,2,4,7,9,12,14,16],minor:[0,3,5,7,10,12,15,17],lydian:[0,2,4,6,7,11,12,14],japan:[0,2,5,7,9,12,14,17],whole:[0,2,4,6,8,10,12,14]};
function bgmPattern(seed){const r=rng(seed),mel=[];for(let i=0;i<32;i++)mel.push(r()<.2?-1:Math.floor(r()*6));return mel}
function bgmTick(){
  if(!AC||!BGM.on||!BGM.st)return;const m=BGM.st.music,spb=60/m.tempo/2,sc=SCALES[m.scale]||SCALES.major;
  if(BGM.next<AC.currentTime)BGM.next=AC.currentTime+.05;
  while(BGM.next<AC.currentTime+.4){const i=BGM.step%32,n=BGM.pat[i],root=m.root||523.25;
    if(n>=0)tone(root*Math.pow(2,sc[n]/12),0,spb*1.8,m.wave||'triangle',.04,BGM.next);
    if(i%4===0){const b=[0,5,3,4][Math.floor(i/8)%4];tone(root/4*Math.pow(2,sc[b]/12),0,spb*3.5,'sine',.07,BGM.next)}
    if(m.beat&&i%2===1)noise(BGM.next-AC.currentTime,.05,.05,m.beat);
    BGM.next+=spb;BGM.step++}
}
function bgmStart(st){audio();if(!AC)return;BGM.st=st||BGM.st;if(!BGM.st)return;BGM.pat=bgmPattern(BGM.st.music.seed||7);if(BGM.on)return;BGM.on=true;BGM.next=AC.currentTime+.1;BGM.step=0;BGM.timer=setInterval(bgmTick,120)}
function bgmStop(){BGM.on=false;clearInterval(BGM.timer)}
let jaVoice=null;
function say(text){if(!SOUND||!window.speechSynthesis)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text.replace(/[〜！？]/g,m=>m==='〜'?'ー':m));u.lang='ja-JP';u.rate=1.02;u.pitch=1.25;
  if(!jaVoice){const vs=speechSynthesis.getVoices();jaVoice=vs.find(v=>/ja/i.test(v.lang))||null}if(jaVoice)u.voice=jaVoice;speechSynthesis.speak(u)}catch(e){}}

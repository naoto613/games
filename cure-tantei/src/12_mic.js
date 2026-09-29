// ================= マイク：ひっさつわざの きめゼリフを ろくおんして エコーで ながす =================
// ろくおんは MediaRecorder（ない ときは ScriptProcessor）。こえの おおきさは AnalyserNode で みる。
const MIC={ok:!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)&&window.isSecureContext!==false,state:'idle',level:0,peak:0,noise:0,heard:false,t:0,quiet:0,
  stream:null,rec:null,blobs:[],chunks:[],nodes:[],an:null,abuf:null,onDone:null,echoUntil:0,err:'',mode:''};
function micLog(m){if(typeof vlog==='function')vlog('mic '+m);}
// タッチの なかで よぶ（ブラウザが マイクの きょかを きく）
function micStart(onDone){audioInit();hush();Object.assign(MIC,{onDone,blobs:[],chunks:[],level:0,peak:0,noise:0,heard:false,t:0,quiet:0,err:''});
  if(!MIC.ok||!AC){MIC.err='マイクが つかえない ブラウザ';micFinish(null);return;}
  MIC.state='asking';let p;
  try{p=navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:false,autoGainControl:true}});}catch(e){MIC.err=e.message;micFinish(null);return;}
  p.then(st=>{if(MIC.state!=='asking'){st.getTracks().forEach(t=>t.stop());return;}
    MIC.stream=st;if(AC.state!=='running')AC.resume();
    const src=AC.createMediaStreamSource(st),an=AC.createAnalyser();an.fftSize=1024;const z=AC.createGain();z.gain.value=0;src.connect(an);an.connect(z);z.connect(AC.destination);
    MIC.an=an;MIC.abuf=new Float32Array(an.fftSize);MIC.nodes=[src,an,z];
    let useMR=false;
    if(window.MediaRecorder){try{const mr=new MediaRecorder(st);mr.ondataavailable=e=>{if(e.data&&e.data.size)MIC.blobs.push(e.data);};mr.onstop=()=>micDecode();mr.start(250);MIC.rec=mr;useMR=true;MIC.mode='mr '+(mr.mimeType||'');}catch(e){micLog('MR fail '+e.message);}}
    if(!useMR){const sp=AC.createScriptProcessor(2048,1,1);sp.onaudioprocess=e=>{if(MIC.state==='rec')MIC.chunks.push(new Float32Array(e.inputBuffer.getChannelData(0)));};src.connect(sp);sp.connect(z);MIC.nodes.push(sp);MIC.mode='sp';}
    MIC.state='rec';micLog('rec start '+MIC.mode+' sr='+AC.sampleRate);})
  .catch(e=>{MIC.err=(e&&e.name)||'error';micLog('gum err '+MIC.err);MIC.state='denied';micFinish(null);});}
// まいフレーム：こえの おおきさを はかって、しゃべりおわりを みつける
function micTick(dt){if(MIC.state!=='rec'||!MIC.an)return;MIC.an.getFloatTimeDomainData(MIC.abuf);let s=0,pk=0;for(const v of MIC.abuf){s+=v*v;pk=Math.max(pk,Math.abs(v));}
  const rms=Math.sqrt(s/MIC.abuf.length);MIC.t+=dt;MIC.peak=Math.max(MIC.peak,pk);MIC.level=MIC.level*.6+rms*.4;
  if(MIC.t<.35){MIC.noise=Math.max(MIC.noise,rms);return;}
  const th=Math.max(.012,MIC.noise*2.5);
  if(rms>th){MIC.heard=true;MIC.quiet=0;}else if(MIC.heard)MIC.quiet+=dt;
  if((MIC.heard&&MIC.quiet>1.1)||MIC.t>5||(!MIC.heard&&MIC.t>6))micStop();}
function micRelease(){for(const n of MIC.nodes)try{n.disconnect();if(n.onaudioprocess)n.onaudioprocess=null;}catch(e){}MIC.nodes=[];MIC.an=null;if(MIC.stream){MIC.stream.getTracks().forEach(t=>t.stop());MIC.stream=null;}}
// ろくおん おわり（じどう または マイクを もういちど タッチ）
function micStop(){if(MIC.state!=='rec')return;MIC.state='busy';micLog('stop t='+MIC.t.toFixed(1)+' peak='+MIC.peak.toFixed(3)+' heard='+MIC.heard);
  if(MIC.rec&&MIC.rec.state!=='inactive'){try{MIC.rec.stop();}catch(e){micRelease();micDecode();}setTimeout(micRelease,50);}
  else{micRelease();const ch=MIC.chunks,n=ch.reduce((a,b)=>a+b.length,0);if(!n){micFinish(null);return;}const buf=AC.createBuffer(1,n,AC.sampleRate),o=buf.getChannelData(0);let k=0;for(const b of ch){o.set(b,k);k+=b.length;}micFinish(micPrep(buf));}}
function micDecode(){MIC.rec=null;if(!MIC.blobs.length){micFinish(null);return;}const blob=new Blob(MIC.blobs,{type:MIC.blobs[0].type});
  blob.arrayBuffer().then(ab=>new Promise((res,rej)=>{const r=AC.decodeAudioData(ab,res,rej);if(r&&r.then)r.then(res,rej);}))
  .then(buf=>micFinish(micPrep(buf))).catch(e=>{MIC.err='decode '+((e&&e.message)||'');micLog(MIC.err);micFinish(null);});}
// こえの はじまりまで けずって、おおきさを そろえる（ちいさい こえも きこえるように）
function micPrep(src){const n=src.length,sr=src.sampleRate,d=src.getChannelData(0);let pk=0;for(let i=0;i<n;i++)pk=Math.max(pk,Math.abs(d[i]));micLog('buf '+(n/sr).toFixed(1)+'s peak='+pk.toFixed(3));
  if(pk<.004)return null;const th=pk*.12,win=Math.floor(sr*.02);let st=0;for(let i=0;i<n;i+=win){if(Math.abs(d[i])>th||Math.abs(d[Math.min(n-1,i+win>>1)])>th){st=Math.max(0,i-Math.floor(sr*.12));break;}}
  let en=n;for(let i=n-1;i>st;i-=win){if(Math.abs(d[i])>th){en=Math.min(n,i+Math.floor(sr*.25));break;}}
  const len=Math.max(1,en-st),buf=AC.createBuffer(1,len,sr),o=buf.getChannelData(0),g=Math.min(12,.9/pk);for(let i=0;i<len;i++)o[i]=d[st+i]*g;return buf;}
function micFinish(buf){MIC.state=MIC.state==='denied'?'denied':'idle';micRelease();const cb=MIC.onDone;MIC.onDone=null;cb&&cb(buf);}
function micCancel(){if(MIC.state==='rec'||MIC.state==='asking'||MIC.state==='busy'){MIC.onDone=null;MIC.state='idle';if(MIC.rec&&MIC.rec.state!=='inactive'){MIC.rec.onstop=null;try{MIC.rec.stop();}catch(e){}}MIC.rec=null;micRelease();}}
// ヒーローふうの エコーで さいせい。ながさ（びょう）を かえす
function playEcho(buf){if(!AC||!buf)return 0;if(AC.state!=='running')AC.resume();const t0=AC.currentTime+.05;
  const s=AC.createBufferSource();s.buffer=buf;const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=150;const hs=AC.createBiquadFilter();hs.type='highshelf';hs.frequency.value=3000;hs.gain.value=4;
  const comp=AC.createDynamicsCompressor();const dry=AC.createGain();dry.gain.value=1.1;
  const d1=AC.createDelay(1.5);d1.delayTime.value=.27;const fb=AC.createGain();fb.gain.value=.48;const wet=AC.createGain();wet.gain.value=.75;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3200;
  const d2=AC.createDelay(1.5);d2.delayTime.value=.13;const w2=AC.createGain();w2.gain.value=.35;
  s.connect(hp);hp.connect(hs);hs.connect(comp);comp.connect(dry);dry.connect(AC.destination);
  comp.connect(d1);d1.connect(lp);lp.connect(fb);fb.connect(d1);lp.connect(wet);wet.connect(AC.destination);comp.connect(d2);d2.connect(w2);w2.connect(AC.destination);
  s.start(t0);const len=buf.duration+2;MIC.echoUntil=AC.currentTime+len;micLog('echo '+buf.duration.toFixed(1)+'s');return len;}

// ================= マイク：ひっさつわざの きめゼリフを ろくおんして エコーで ながす =================
const MIC={ok:!!(navigator.mediaDevices&&navigator.mediaDevices.getUserMedia)&&window.isSecureContext!==false,state:'idle',level:0,chunks:[],heard:false,t:0,quiet:0,nodes:null,stream:null,onDone:null,echoUntil:0};
// タッチの なかで よぶ（ブラウザが マイクの きょかを きく）
function micStart(onDone){audioInit();hush();MIC.onDone=onDone;MIC.chunks=[];MIC.level=0;MIC.heard=false;MIC.t=0;MIC.quiet=0;
  if(!MIC.ok||!AC){MIC.state='idle';onDone(null);return;}
  MIC.state='asking';
  let p;try{p=navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});}catch(e){MIC.state='idle';onDone(null);return;}
  p.then(st=>{if(MIC.state!=='asking'){st.getTracks().forEach(t=>t.stop());return;}
    MIC.stream=st;if(AC.state==='suspended')AC.resume();
    const src=AC.createMediaStreamSource(st),sp=AC.createScriptProcessor(2048,1,1),z=AC.createGain();z.gain.value=0;src.connect(sp);sp.connect(z);z.connect(AC.destination);
    sp.onaudioprocess=e=>{if(MIC.state!=='rec')return;const d=e.inputBuffer.getChannelData(0);MIC.chunks.push(new Float32Array(d));let s=0;for(let i=0;i<d.length;i++)s+=d[i]*d[i];
      const rms=Math.sqrt(s/d.length),dt=d.length/AC.sampleRate;MIC.level=MIC.level*.6+rms*.4;MIC.t+=dt;
      if(rms>.035){MIC.heard=true;MIC.quiet=0;}else if(MIC.heard)MIC.quiet+=dt;
      if((MIC.heard&&MIC.quiet>1)||MIC.t>4.5||(!MIC.heard&&MIC.t>6))micStop();};
    MIC.nodes=[src,sp,z];MIC.state='rec';})
  .catch(()=>{MIC.state='denied';const cb=MIC.onDone;MIC.onDone=null;cb&&cb(null);});}
function micRelease(){if(MIC.nodes){for(const n of MIC.nodes)try{n.disconnect();}catch(e){}MIC.nodes[1].onaudioprocess=null;MIC.nodes=null;}if(MIC.stream){MIC.stream.getTracks().forEach(t=>t.stop());MIC.stream=null;}}
function micStop(){if(MIC.state!=='rec')return;MIC.state='idle';micRelease();const cb=MIC.onDone;MIC.onDone=null;if(!cb)return;
  if(!MIC.heard||!MIC.chunks.length){cb(null);return;}
  // こえの はじまりまで さきを けずる
  const ch=MIC.chunks;let st=0;for(let i=0;i<ch.length;i++){let s=0;for(let k=0;k<ch[i].length;k++)s+=ch[i][k]*ch[i][k];if(Math.sqrt(s/ch[i].length)>.03){st=Math.max(0,i-2);break;}}
  const use=ch.slice(st),n=use.reduce((a,b)=>a+b.length,0),buf=AC.createBuffer(1,n,AC.sampleRate),out=buf.getChannelData(0);let o=0;for(const b of use){out.set(b,o);o+=b.length;}
  let pk=0;for(let i=0;i<n;i++)pk=Math.max(pk,Math.abs(out[i]));if(pk>0){const g=Math.min(6,.9/pk);for(let i=0;i<n;i++)out[i]*=g;}// おおきさを そろえる
  cb(buf);}
function micCancel(){if(MIC.state==='rec'||MIC.state==='asking'){MIC.state='idle';MIC.onDone=null;micRelease();}}
// ヒーローふうの エコーで さいせい。ながさ（びょう）を かえす
function playEcho(buf){if(!AC||!buf)return 0;const t0=AC.currentTime+.05;
  const s=AC.createBufferSource();s.buffer=buf;const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=150;const hs=AC.createBiquadFilter();hs.type='highshelf';hs.frequency.value=3000;hs.gain.value=4;
  const comp=AC.createDynamicsCompressor();const dry=AC.createGain();dry.gain.value=1.1;
  const d1=AC.createDelay(1.5);d1.delayTime.value=.27;const fb=AC.createGain();fb.gain.value=.48;const wet=AC.createGain();wet.gain.value=.75;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3200;
  const d2=AC.createDelay(1.5);d2.delayTime.value=.13;const w2=AC.createGain();w2.gain.value=.35;
  s.connect(hp);hp.connect(hs);hs.connect(comp);comp.connect(dry);dry.connect(AC.destination);
  comp.connect(d1);d1.connect(lp);lp.connect(fb);fb.connect(d1);lp.connect(wet);wet.connect(AC.destination);comp.connect(d2);d2.connect(w2);w2.connect(AC.destination);
  s.start(t0);const len=buf.duration+2;MIC.echoUntil=AC.currentTime+len;return len;}

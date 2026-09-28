(()=>{"use strict";
// ================= キュアたんてい ふーちゃん : core =================
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const LW=400,LH=720,TAU=Math.PI*2;
let W=0,H=0,DPR=1,SC=1,OX=0,OY=0,VX0=0,VX1=LW,VY0=0,VY1=LH,T=0;
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*DPR|0;cv.height=H*DPR|0;cv.style.width=W+'px';cv.style.height=H+'px';
  SC=Math.min(W/LW,H/LH);OX=(W-LW*SC)/2;OY=(H-LH*SC)/2;VX0=-OX/SC;VX1=LW+OX/SC;VY0=-OY/SC;VY1=LH+OY/SC;}
addEventListener('resize',resize);resize();
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,rand=(a,b)=>a+Math.random()*(b-a),randi=(a,b)=>a+Math.floor(Math.random()*(b-a+1)),pick=a=>a[Math.random()*a.length|0];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a;};
const ease=t=>t<0?0:t>1?1:t*t*(3-2*t),easeOut=t=>1-Math.pow(1-clamp(t,0,1),3),easeBack=t=>{t=clamp(t,0,1);const s=1.7;return 1+(s+1)*Math.pow(t-1,3)+s*Math.pow(t-1,2);};
const FONT='"M PLUS Rounded 1c","Hiragino Maru Gothic ProN","Yu Gothic",sans-serif',POP='"Mochiy Pop One","M PLUS Rounded 1c",sans-serif';
function hash(x,y){let h=(x*374761393+y*668265263)|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296;}

// ---------- save ----------
const SAVE={cleared:0,words:[],cp:null,mute:false,stars:{},doc:0,wins:0};
try{Object.assign(SAVE,JSON.parse(localStorage.getItem('cureTantei')||'{}'));}catch(e){}SAVE.mute=false;
function save(){try{localStorage.setItem('cureTantei',JSON.stringify(SAVE));}catch(e){}}
function learn(k){if(k&&!SAVE.words.includes(k)){SAVE.words.push(k);save();}}

// ---------- draw helpers ----------
function rr(c,x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
function ell(c,x,y,rx,ry,rot=0){c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),rot,0,TAU);c.fill();}
function circ(c,x,y,r){c.beginPath();c.arc(x,y,Math.max(.1,r),0,TAU);c.fill();}
function starP(c,x,y,R,r,n=5,rot=-Math.PI/2){c.beginPath();for(let i=0;i<n*2;i++){const a=rot+i*Math.PI/n,d=i%2?r:R;c.lineTo(x+Math.cos(a)*d,y+Math.sin(a)*d);}c.closePath();}
function heartP(c,x,y,s){c.beginPath();c.moveTo(x,y+s*.95);c.bezierCurveTo(x-s*1.5,y-s*.05,x-s*.8,y-s*1.25,x,y-s*.45);c.bezierCurveTo(x+s*.8,y-s*1.25,x+s*1.5,y-s*.05,x,y+s*.95);c.closePath();}
function shade(hex,a){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=a<0?0:255,t=Math.abs(a);r=Math.round(r+(f-r)*t);g=Math.round(g+(f-g)*t);b=Math.round(b+(f-b)*t);return'#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}
function hexA(h,a){const n=parseInt(h.slice(1),16);return`rgba(${n>>16&255},${n>>8&255},${n&255},${a})`;}
function gfill(c,x,y,r,col,hi=.38,lo=-.16){const g=c.createRadialGradient(x-r*.35,y-r*.45,r*.05,x,y,r*1.15);g.addColorStop(0,shade(col,hi));g.addColorStop(.6,col);g.addColorStop(1,shade(col,lo));return g;}
function vfill(c,y0,y1,col,hi=.18,lo=-.12){const g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,shade(col,hi));g.addColorStop(1,shade(col,lo));return g;}
function vgrad(c,y0,y1,stops){const g=c.createLinearGradient(0,y0,0,y1);stops.forEach((s,i)=>g.addColorStop(i/(stops.length-1),s));return g;}
const glowCache={};
function glow(col){if(glowCache[col])return glowCache[col];const g=document.createElement('canvas');g.width=g.height=64;const c=g.getContext('2d');const gr=c.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,hexA(col,1));gr.addColorStop(.35,hexA(col,.5));gr.addColorStop(1,hexA(col,0));c.fillStyle=gr;c.fillRect(0,0,64,64);return glowCache[col]=g;}
function drawGlow(c,col,x,y,r,a=1){const o=c.globalAlpha;c.globalAlpha=o*a;c.drawImage(glow(col),x-r,y-r,r*2,r*2);c.globalAlpha=o;}
function bow(c,x,y,col,s=1){c.fillStyle=col;for(const k of[-1,1]){c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+k*8*s,y-7*s,x+k*8*s,y);c.quadraticCurveTo(x+k*8*s,y+6*s,x,y);c.fill();c.stroke();c.beginPath();c.moveTo(x,y);c.lineTo(x+k*4*s,y+7*s);c.lineTo(x+k*1.5*s,y+7.5*s);c.closePath();c.fill();c.stroke();}c.fillStyle='#ffd84a';heartP(c,x,y+.3*s,2.4*s);c.fill();c.stroke();}
function txt(c,s,x,y,size,col='#5b2c47',align='center',weight=800,font=FONT){c.font=`${weight} ${size}px ${font}`;c.textAlign=align;c.textBaseline='middle';c.fillStyle=col;c.fillText(s,x,y);}
function otext(c,s,x,y,size,fill='#fff',stroke='#ff4f9a',align='center',font=POP){c.font=`400 ${size}px ${font}`;if(font===FONT)c.font=`900 ${size}px ${font}`;c.textAlign=align;c.textBaseline='middle';c.lineJoin='round';c.lineWidth=Math.max(3,size*.24);c.strokeStyle=stroke;c.strokeText(s,x,y);c.fillStyle=fill;c.fillText(s,x,y);}
function wrap(c,s,maxW){const out=[];for(const para of String(s).split('\n')){let line='';for(const tk0 of para.split(' ')){const tk=line?' '+tk0:tk0;
    if(c.measureText(line+tk).width<=maxW){line+=tk;continue;}
    if(line){out.push(line);line='';}
    if(c.measureText(tk0).width<=maxW){line=tk0;continue;}
    for(const ch of tk0){if(c.measureText(line+ch).width>maxW&&line){out.push(line);line=ch;}else line+=ch;}}
  if(line)out.push(line);}return out;}
function para(c,s,x,y,maxW,size,col,lh=1.35,align='left',weight=800){c.font=`${weight} ${size}px ${FONT}`;const ls=wrap(c,s,maxW);c.textAlign=align;c.textBaseline='middle';c.fillStyle=col;ls.forEach((l,i)=>c.fillText(l,x,y+i*size*lh));return ls.length;}
const inR=(x,y,cx,cy,w,h)=>Math.abs(x-cx)<=w/2&&Math.abs(y-cy)<=h/2;
const inC=(x,y,cx,cy,r)=>(x-cx)*(x-cx)+(y-cy)*(y-cy)<=r*r;
// silhouette (for かげ クイズ)
const silCv=document.createElement('canvas');silCv.width=silCv.height=400;
function silhouette(c,fn,x,y,size,col='#2a1a3a'){const s=silCv.getContext('2d');s.setTransform(1,0,0,1,0,0);s.clearRect(0,0,400,400);s.globalCompositeOperation='source-over';s.save();s.translate(200,200);fn(s);s.restore();s.globalCompositeOperation='source-in';s.fillStyle=col;s.fillRect(0,0,400,400);s.globalCompositeOperation='source-over';c.drawImage(silCv,x-size/2,y-size/2,size,size);}

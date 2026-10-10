'use strict';
// ================= base: utils, rng, drawing helpers =================
const $=id=>document.getElementById(id);
const TAU=Math.PI*2;
const WW=2400,WH=1600;            // world size of every stage
const LN='#4b2e2a';               // outline ink
const SKIN='#ffe0cc',HAIR='#2b1d22';
function rng(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let R=rng(1);
const rnd=(a=1,b)=>b===undefined?R()*a:a+R()*(b-a);
const pick=arr=>arr[Math.floor(R()*arr.length)];
const chance=p=>R()<p;
function pickW(list){let s=0;for(const x of list)s+=x[1];let v=R()*s;for(const x of list)if((v-=x[1])<=0)return x[0];return list[list.length-1][0]}
function shuffle(a){for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function load(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
const clamp=(v,a,b)=>v<a?a:v>b?b:v;
const lerp=(a,b,t)=>a+(b-a)*t;
function mk(w,h){const c=document.createElement('canvas');c.width=Math.max(1,Math.ceil(w));c.height=Math.max(1,Math.ceil(h));return c}
function shade(h,amt){const n=parseInt(h.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const t=amt<0?0:255,p=Math.abs(amt);r=Math.round(r+(t-r)*p);g=Math.round(g+(t-g)*p);b=Math.round(b+(t-b)*p);return '#'+((1<<24)|(r<<16)|(g<<8)|b).toString(16).slice(1)}
function rr(c,x,y,w,h,r){r=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function ell(c,x,y,rx,ry,rot){c.beginPath();c.ellipse(x,y,Math.abs(rx),Math.abs(ry),rot||0,0,TAU)}
function circ(c,x,y,r){c.beginPath();c.arc(x,y,Math.abs(r),0,TAU)}
function F(c,col){c.fillStyle=col;c.fill()}
function FS(c,col){c.fillStyle=col;c.fill();c.stroke()}
function poly(c,pts){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.closePath()}
function star(c,x,y,r1,r2,n){c.beginPath();n=n||5;for(let i=0;i<n*2;i++){const a=-Math.PI/2+i*Math.PI/n,r=i%2?r2:r1;c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r)}c.closePath()}
function heart(c,x,y,s){c.beginPath();c.moveTo(x,y+s*.9);c.bezierCurveTo(x-s*1.6,y-s*.2,x-s*.7,y-s*1.3,x,y-s*.45);c.bezierCurveTo(x+s*.7,y-s*1.3,x+s*1.6,y-s*.2,x,y+s*.9);c.closePath()}
function line(c,x1,y1,x2,y2){c.beginPath();c.moveTo(x1,y1);c.lineTo(x2,y2);c.stroke()}
function ink(c,w){c.strokeStyle=LN;c.lineWidth=w||1.6;c.lineJoin='round';c.lineCap='round'}
const COLS={red:'#e8504a',blue:'#3f7bd6',green:'#4cad62',yellow:'#f6c63a',orange:'#f28b2f',purple:'#8d5cc8',pink:'#f28fb7',sky:'#7cc8ec',white:'#f7f4ee',black:'#3b3533',brown:'#a8703f',gray:'#9fa4ab',navy:'#2f4078',mint:'#7fd6b4',cream:'#f3e1b5'};
const CLIST=Object.values(COLS);
// colours that would look like ふーたん's smock or hat are kept rare for the crowd (set per stage as decoys)
const FUTAN_PINK='#ff8cc0',FUTAN_SMOCK=FUTAN_PINK,FUTAN_BAG='#ffd23f';
const SAFE_TOPS=['#e8504a','#3f7bd6','#4cad62','#f28b2f','#8d5cc8','#7cc8ec','#f7f4ee','#3b3533','#a8703f','#9fa4ab','#2f4078','#7fd6b4','#f3e1b5','#c44a6a','#5a8a6a','#e0a040'];

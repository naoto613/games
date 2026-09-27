(()=>{"use strict";
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const TAU=Math.PI*2,clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,rand=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.random()*a.length|0];
const shuffle=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.random()*(i+1)|0;[a[i],a[j]]=[a[j],a[i]];}return a;};
const ease=t=>t<0?0:t>1?1:t*t*(3-2*t),easeOut=t=>1-Math.pow(1-clamp(t,0,1),3),elastic=t=>t>=1?1:1-Math.pow(2,-9*t)*Math.cos(t*14);
const FONT='"M PLUS Rounded 1c","Hiragino Maru Gothic ProN",sans-serif',POP='"Mochiy Pop One","M PLUS Rounded 1c",sans-serif';
function rr(c,x,y,w,h,r){c.beginPath();if(c.roundRect)c.roundRect(x,y,w,h,r);else c.rect(x,y,w,h);}
function ell(c,x,y,rx,ry){c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,TAU);c.fill();}
function circ(c,x,y,r){c.beginPath();c.arc(x,y,Math.max(.1,r),0,TAU);c.fill();}
function shade(hex,a){const n=parseInt(hex.slice(1),16);let r=n>>16,g=n>>8&255,b=n&255;const f=a<0?0:255,t=Math.abs(a);r=Math.round(r+(f-r)*t);g=Math.round(g+(f-g)*t);b=Math.round(b+(f-b)*t);return'#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);}
function star(c,x,y,r1,r2,n=5,rot=-Math.PI/2){c.beginPath();for(let i=0;i<n*2;i++){const r=i%2?r2:r1,a=rot+i*Math.PI/n;c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}c.closePath();}
function heartP(c,x,y,s){c.beginPath();c.moveTo(x,y+s*.9);c.bezierCurveTo(x-s*1.3,y+s*.1,x-s*.8,y-s*.9,x,y-s*.3);c.bezierCurveTo(x+s*.8,y-s*.9,x+s*1.3,y+s*.1,x,y+s*.9);c.closePath();}
const HERO={line:'#5a3a44'};
function bow(c,x,y,s,col){c.strokeStyle=HERO.line;c.lineWidth=1;c.fillStyle=col;
  c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x-s*1.4,y-s*1.1,x-s*1.5,y+s*.1);c.quadraticCurveTo(x-s*1.1,y+s*.9,x,y);c.fill();c.stroke();
  c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+s*1.4,y-s*1.1,x+s*1.5,y+s*.1);c.quadraticCurveTo(x+s*1.1,y+s*.9,x,y);c.fill();c.stroke();
  c.beginPath();c.moveTo(x-s*.2,y+s*.2);c.lineTo(x-s*.7,y+s*1.4);c.lineTo(x-s*.1,y+s*1.1);c.closePath();c.fill();c.stroke();
  c.beginPath();c.moveTo(x+s*.2,y+s*.2);c.lineTo(x+s*.7,y+s*1.4);c.lineTo(x+s*.1,y+s*1.1);c.closePath();c.fill();c.stroke();
  c.fillStyle=shade(col,-.15);circ(c,x,y,s*.42);c.stroke();c.lineWidth=1.1;}
// soft 3D shading
function gfill(c,x,y,r,col,hi=.38,lo=-.16){const g=c.createRadialGradient(x-r*.35,y-r*.45,r*.05,x,y,r*1.15);g.addColorStop(0,shade(col,hi));g.addColorStop(.6,col);g.addColorStop(1,shade(col,lo));return g;}
function vfill(c,y0,y1,col,hi=.18,lo=-.12){const g=c.createLinearGradient(0,y0,0,y1);g.addColorStop(0,shade(col,hi));g.addColorStop(1,shade(col,lo));return g;}
let T=0;

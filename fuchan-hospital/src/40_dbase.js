// ================= ふーちゃん しかいいん: きょうつう（は の え・どうぐ・すすめかた） =================
Object.assign(WORDS,{explorer:['たんしん','explorer'],scaler:['スケーラー','scaler'],vacuum:['バキューム','suction'],air:['エアー','air syringe'],curelight:['ひかりの きかい','curing light'],
  fluor:['フッそ','fluoride'],sealant:['シーラント','sealant'],dye:['そめだしえき','disclosing liquid'],floss:['フロス','dental floss'],polisher:['みがく きかい','polisher'],bracket:['ブラケット','bracket'],
  wire:['ワイヤー','wire'],crown:['かぶせもの','crown'],impression:['かたどり','impression'],gauze:['ガーゼ','gauze'],apron:['エプロン','lead apron'],sensor:['センサー','X-ray sensor'],numbgel:['ぬる ますい','numbing gel'],
  paste:['つめもの','filling paste'],bitepaper:['かみあわせの かみ','bite paper'],incisor:['まえば','front tooth'],canine:['けんし','canine'],molar:['おくば','molar'],rubber:['わゴム','rubber band'],
  plaster:['せっこう','plaster'],carver:['けずる どうぐ','carver'],xsensor:['センサー','X-ray sensor']});
// ---------- あたらしい どうぐの え ----------
M('explorer',c=>{c.rotate(-.6);c.fillStyle=steel(c,-3,0,3,0);rr(c,-3,-10,6,44,3);c.fill();c.strokeStyle='#7a8494';c.lineWidth=1;for(let i=0;i<6;i++){c.beginPath();c.moveTo(-3,4+i*4);c.lineTo(3,4+i*4);c.stroke();}c.strokeStyle='#9aa4b4';c.lineWidth=2.4;c.beginPath();c.moveTo(0,-10);c.quadraticCurveTo(0,-24,8,-30);c.stroke();});
M('scaler',c=>{c.rotate(-.6);const g=c.createLinearGradient(-6,0,6,0);g.addColorStop(0,'#e8eef6');g.addColorStop(.5,'#fff');g.addColorStop(1,'#c8d0dc');c.fillStyle=g;rr(c,-6,-6,12,42,5);c.fill();c.strokeStyle='#98a4b4';c.lineWidth=1.2;c.stroke();c.fillStyle='#ffd23a';c.fillRect(-6,10,12,3);c.strokeStyle='#8a98b0';c.lineWidth=3;c.beginPath();c.moveTo(0,-6);c.lineTo(0,-20);c.quadraticCurveTo(0,-28,6,-30);c.stroke();c.strokeStyle='#8a96a8';c.lineWidth=3;c.beginPath();c.moveTo(0,36);c.quadraticCurveTo(2,48,-6,56);c.stroke();});
M('vacuum',c=>{c.rotate(.5);c.fillStyle='#e8eef6';rr(c,-7,-6,14,44,6);c.fill();c.strokeStyle='#98a4b4';c.lineWidth=1.4;c.stroke();c.fillStyle='rgba(220,235,255,.9)';c.beginPath();c.moveTo(-7,-6);c.lineTo(-9,-30);c.lineTo(9,-34);c.lineTo(7,-6);c.closePath();c.fill();c.stroke();c.fillStyle='#5aa8ff';c.fillRect(-7,14,14,4);c.strokeStyle='#7a8494';c.lineWidth=4;c.beginPath();c.moveTo(0,38);c.quadraticCurveTo(0,52,10,58);c.stroke();});
M('air',c=>{c.rotate(-.5);c.fillStyle=steel(c,-5,0,5,0);rr(c,-5,-4,10,44,4);c.fill();c.fillStyle='#5aa8ff';rr(c,-7,6,14,6,2);c.fill();c.fillStyle='#ff8cc0';rr(c,-7,14,14,6,2);c.fill();c.strokeStyle='#9aa4b4';c.lineWidth=3;c.beginPath();c.moveTo(0,-4);c.lineTo(0,-18);c.lineTo(6,-28);c.stroke();});
M('curelight',c=>{c.rotate(-.5);c.fillStyle='#f4f6fa';rr(c,-8,-6,16,50,7);c.fill();c.strokeStyle='#a8b4c4';c.lineWidth=1.5;c.stroke();c.fillStyle='#3a88e8';rr(c,-5,8,10,6,2);c.fill();c.fillStyle='rgba(255,170,60,.85)';rr(c,-7,26,14,10,3);c.fill();c.fillStyle='#c8d0dc';c.beginPath();c.moveTo(-5,-6);c.lineTo(-4,-24);c.quadraticCurveTo(0,-32,8,-32);c.lineTo(8,-26);c.lineTo(4,-6);c.closePath();c.fill();c.fillStyle='#8ab8ff';circ(c,8,-29,3.5);});
M('fluor',c=>{c.rotate(-.5);c.fillStyle='#fff';rr(c,-3,-6,6,40,3);c.fill();c.strokeStyle='#c8d0dc';c.lineWidth=1;c.stroke();c.fillStyle='#ffd8ec';ell(c,0,-10,6,9);c.fillStyle='#ff9ac8';circ(c,0,-12,4);});
M('sealant',c=>{c.rotate(-.7);c.fillStyle='rgba(255,255,255,.9)';c.strokeStyle='#98a8c0';c.lineWidth=1.5;rr(c,-7,-10,14,40,4);c.fill();c.stroke();c.fillStyle='rgba(120,190,255,.6)';c.fillRect(-5,4,10,20);c.fillStyle='#3a4050';rr(c,-9,28,18,6,2);c.fill();c.strokeStyle='#8a98b0';c.lineWidth=2.5;c.beginPath();c.moveTo(0,-10);c.lineTo(0,-24);c.lineTo(5,-32);c.stroke();});
M('dye',c=>{c.fillStyle='#fff';rr(c,-12,-4,24,34,5);c.fill();c.strokeStyle='#c8d0dc';c.lineWidth=1.5;c.stroke();c.fillStyle='#ff3a7a';c.fillRect(-10,10,20,18);txt(c,'そめだし',0,4,6,'#ff3a7a');c.save();c.rotate(-.5);c.strokeStyle='#8a98b0';c.lineWidth=2.5;c.beginPath();c.moveTo(6,-4);c.lineTo(2,-26);c.stroke();c.restore();c.fillStyle='#ff6fa0';circ(c,-12,-24,7);c.fillStyle='rgba(255,255,255,.5)';circ(c,-14,-26,2.5);});
M('floss',c=>{c.fillStyle='#8ad0ff';rr(c,-18,-4,36,26,8);c.fill();c.strokeStyle='#4a98d8';c.lineWidth=1.5;c.stroke();c.fillStyle='#fff';c.fillRect(-12,4,24,6);c.strokeStyle='#e8f0ff';c.lineWidth=1.5;c.beginPath();c.moveTo(-4,-4);c.quadraticCurveTo(-8,-18,-2,-30);c.stroke();c.strokeStyle='#ffffff';c.lineWidth=3;c.beginPath();c.moveTo(-10,-30);c.lineTo(6,-30);c.stroke();});
M('polisher',c=>{c.rotate(-.5);c.fillStyle=steel(c,-6,0,6,0);rr(c,-6,-6,12,48,5);c.fill();c.fillStyle='#2ec07a';c.fillRect(-6,12,12,3);c.fillStyle=steel(c,-5,-20,5,-20);c.beginPath();c.moveTo(-5,-6);c.lineTo(-3,-20);c.lineTo(6,-24);c.lineTo(6,-18);c.lineTo(4,-6);c.fill();c.fillStyle='#ffb3d6';rr(c,4,-32,10,12,4);c.fill();});
M('bracket',c=>{c.fillStyle=steel(c,-14,-14,14,14);rr(c,-14,-14,28,28,5);c.fill();c.strokeStyle='#7a8494';c.lineWidth=2;c.stroke();c.fillStyle='#9aa4b4';c.fillRect(-14,-3,28,6);for(const a of[-1,1])for(const b of[-1,1]){c.fillStyle='#c8d0dc';rr(c,a*9-4,b*9-4,8,8,2);c.fill();}});
M('wire',c=>{c.strokeStyle=steel(c,-26,0,26,0);c.lineWidth=4;c.beginPath();c.arc(0,20,30,Math.PI*1.1,Math.PI*1.9);c.stroke();c.fillStyle='#8a98b0';circ(c,-27,8,4);circ(c,27,8,4);});
M('rubber',c=>{const cols=['#ff5fa2','#5aa8ff','#ffd23a','#4cc86a'];cols.forEach((col,i)=>{c.strokeStyle=col;c.lineWidth=5;c.beginPath();c.arc(-12+(i%2)*24,-8+Math.floor(i/2)*20,8,0,TAU);c.stroke();});});
M('crown',(c,o)=>{c.fillStyle=gfill(c,0,-6,26,o.col||'#fbf8ee');c.strokeStyle='#c8ccd6';c.lineWidth=2;c.beginPath();c.moveTo(-20,14);c.lineTo(-22,-8);c.quadraticCurveTo(-18,-20,-8,-16);c.quadraticCurveTo(0,-24,8,-16);c.quadraticCurveTo(18,-20,22,-8);c.lineTo(20,14);c.quadraticCurveTo(0,20,-20,14);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.6)';ell(c,-8,-6,5,8);});
M('impression',c=>{c.fillStyle=steel(c,-26,0,26,0);c.beginPath();c.moveTo(-28,-6);c.quadraticCurveTo(0,-34,28,-6);c.lineTo(22,6);c.quadraticCurveTo(0,-18,-22,6);c.closePath();c.fill();c.fillStyle='#ff9ac8';c.beginPath();c.moveTo(-24,-6);c.quadraticCurveTo(0,-30,24,-6);c.quadraticCurveTo(0,-20,-24,-6);c.fill();c.fillStyle='#b8c0cc';rr(c,-5,4,10,26,3);c.fill();});
M('gauze',c=>{c.fillStyle='#fff';c.strokeStyle='#d0d8e4';c.lineWidth=1.5;rr(c,-18,-12,36,24,5);c.fill();c.stroke();c.strokeStyle='#eef2f8';for(let i=0;i<5;i++){c.beginPath();c.moveTo(-16,-8+i*4);c.lineTo(16,-8+i*4);c.stroke();}});
M('apron',c=>{c.fillStyle='#3a6ab8';c.beginPath();c.moveTo(-24,-26);c.lineTo(24,-26);c.lineTo(28,28);c.quadraticCurveTo(0,34,-28,28);c.closePath();c.fill();c.fillStyle='#fff';ell(c,0,-26,12,6);c.fillStyle='#ffd23a';c.beginPath();c.moveTo(0,-6);c.lineTo(9,8);c.lineTo(-9,8);c.fill();c.fillStyle='#3a6ab8';circ(c,0,4,2.5);});
M('sensor',c=>{c.fillStyle='#3a3e4a';rr(c,-16,-12,32,24,5);c.fill();c.fillStyle='#5a6070';rr(c,-12,-8,24,16,3);c.fill();c.strokeStyle='#3a3e4a';c.lineWidth=3;c.beginPath();c.moveTo(0,12);c.quadraticCurveTo(0,26,12,32);c.stroke();});
M('numbgel',c=>{c.fillStyle='#fff';rr(c,-12,4,24,26,5);c.fill();c.strokeStyle='#c8d0dc';c.lineWidth=1.5;c.stroke();c.fillStyle='#ffb070';c.fillRect(-10,12,20,14);c.save();c.rotate(-.4);c.strokeStyle='#e8d8b8';c.lineWidth=3;c.beginPath();c.moveTo(4,4);c.lineTo(0,-22);c.stroke();c.restore();c.fillStyle='#ffd8b0';circ(c,-9,-22,7);});
M('paste',c=>{c.rotate(-.7);c.fillStyle='#fff';c.strokeStyle='#98a8c0';c.lineWidth=1.5;rr(c,-7,-6,14,34,4);c.fill();c.stroke();c.fillStyle='#f4efe0';c.fillRect(-5,2,10,18);c.fillStyle='#5aa8ff';c.fillRect(-7,22,14,5);c.fillStyle='#e8e0cc';c.beginPath();c.moveTo(-3,-6);c.lineTo(3,-6);c.lineTo(1,-24);c.lineTo(-1,-24);c.fill();});
M('bitepaper',c=>{c.rotate(-.3);c.fillStyle=steel(c,-3,0,3,0);rr(c,-3,-2,6,36,2);c.fill();c.fillStyle='#ff3a5a';rr(c,-16,-26,32,22,3);c.fill();c.fillStyle='#3a6ae8';rr(c,-16,-26,32,6,2);c.fill();});
M('carver',c=>{c.rotate(-.6);c.fillStyle='#8a5a3a';rr(c,-4,-4,8,38,3);c.fill();c.fillStyle=steel(c,-4,-10,4,-10);c.beginPath();c.moveTo(-3,-4);c.lineTo(-5,-22);c.lineTo(0,-30);c.lineTo(5,-22);c.lineTo(3,-4);c.fill();});
M('xsensor',c=>MED.sensor(c,0,0,1));
M('plaster',c=>{c.fillStyle='#ffd0e0';c.beginPath();c.moveTo(-24,-6);c.quadraticCurveTo(0,40,24,-6);c.closePath();c.fill();c.strokeStyle='#e8a0b8';c.lineWidth=2;c.stroke();c.fillStyle='#fff';ell(c,0,-6,22,6);c.save();c.rotate(.5);c.fillStyle=steel(c,-3,-30,3,-30);rr(c,-3,-36,6,30,2);c.fill();c.restore();});
for(const [k,ty] of[['incisor','inc'],['canine','can'],['molar','mol']])M(k,c=>{const t={type:ty};const g=c.createLinearGradient(0,-24,0,24);g.addColorStop(0,'#eef0f4');g.addColorStop(1,'#fff');c.fillStyle=g;dmToothPath(c,t,ty==='mol'?40:30,ty==='mol'?34:42);c.fill();c.strokeStyle='#b8c0cc';c.lineWidth=2;c.stroke();c.fillStyle='#e8d8c8';c.fillRect(-6,-34,12,14);});
Object.assign(TIPD,{plaster:[0,0,0],incisor:[0,0,0],canine:[0,0,0],molar:[0,0,0],crown:[0,0,0],cup:[0,0,0]});
Object.assign(TIPD,{explorer:[8,-30,-.6],scaler:[6,-30,-.6],vacuum:[0,-32,.5],air:[6,-28,-.5],curelight:[8,-30,-.5],fluor:[0,-12,-.5],sealant:[5,-32,-.7],dye:[-12,-24,0],floss:[-2,-30,0],polisher:[9,-30,-.5],numbgel:[-9,-22,0],paste:[0,-24,-.7],bitepaper:[0,-16,-.3],carver:[0,-30,-.6],impression:[0,-14,0],gauze:[0,0,0],bracket:[0,0,0],sensor:[0,0,0]});
const DTOOLS=['mirror','explorer','drill','scaler','vacuum','air','curelight','fluor','sealant','dye','floss','polisher','numbgel','paste','toothbrush','tweezers','syringe','gauze','bracket','bitepaper','cup'];
// ---------- は と おくち ----------
function dmNew(kind='baby',mx=300,my=H*.42,rw=196,rh=112){const n=kind==='baby'?10:14,teeth=[];for(const top of[true,false])for(let i=0;i<n;i++){const d=Math.abs(i-(n-1)/2)-.5;const type=d<2?'inc':d<3?'can':kind==='adult'&&d<5?'pre':'mol';teeth.push({i,top,d,type,side:i<n/2?-1:1});}
  return{kind,n,teeth,mx,my,rw,rh};}
function dmPos(M,t){const u=((t.i+.5)/M.n)*2-1,a=u*1.32,co=Math.cos(a),s=.6+.4*co;const x=M.mx+Math.sin(a)*M.rw+(t.ox||0),y=M.my+(t.top?-1:1)*M.rh*(.3+.52*co)+(t.oy||0);
  const bw=M.kind==='baby'?46:34,w=bw*s*(t.type==='mol'?1.15:t.type==='pre'?1:t.type==='can'?.9:t.d<1?1:.88),h=(M.kind==='baby'?50:46)*s*(t.type==='mol'?.8:t.type==='pre'?.86:t.type==='can'?1.05:1);return{x,y,w,h,s,rot:(t.top?1:-1)*a*.32+(t.rot||0)};}
function dmToothPath(c,t,w,h){const hw=w/2,hh=h/2;c.beginPath();c.moveTo(-hw*.92,-hh);
  if(t.type==='inc'){c.lineTo(-hw,hh*.62);c.quadraticCurveTo(-hw,hh,-hw*.7,hh);c.lineTo(hw*.7,hh);c.quadraticCurveTo(hw,hh,hw,hh*.62);}
  else if(t.type==='can'){c.lineTo(-hw,hh*.3);c.quadraticCurveTo(-hw*.6,hh*.8,0,hh*1.08);c.quadraticCurveTo(hw*.6,hh*.8,hw,hh*.3);}
  else{c.lineTo(-hw,hh*.5);const k=t.type==='mol'?3:2;for(let j=0;j<k;j++){const x0=-hw+j*w/k,x1=x0+w/k;c.quadraticCurveTo((x0+x1)/2,hh*1.12,x1,hh*.62);}}
  c.lineTo(hw*.92,-hh);c.closePath();}
function dmTooth(c,M,t,o={}){const p=dmPos(M,t);if(t.missing&&!t.grow)return p;c.save();c.translate(p.x,p.y);c.rotate(p.rot+(t.loose?Math.sin(T*14)*(o.wob||.08):0));if(!t.top)c.scale(1,-1);
  const g=(t.grow??1),w=p.w*(t.adult?1.12:1)*(t.prep?.72:1),h=p.h*(t.adult?1.18:1)*(t.prep?.78:1);if(g<1){c.translate(0,-h*(1-g)*.9);}
  const col=t.crownCol||t.col||(t.prep?'#efe4cc':'#fbfaf4');const gr=c.createLinearGradient(0,-h/2,0,h/2);gr.addColorStop(0,shade(col,-.06));gr.addColorStop(.35,shade(col,.3));gr.addColorStop(1,col);c.fillStyle=gr;dmToothPath(c,t,w,h);c.fill();c.strokeStyle=t.crownCol?shade(t.crownCol,-.25):'#cfd4de';c.lineWidth=2;c.stroke();
  c.save();dmToothPath(c,t,w,h);c.clip();
  if(t.stn)(c.fillStyle=`rgba(${t.stnC||'150,100,50'},${t.stn*.6})`,c.fillRect(-w/2,-h/2,w,h));
  if(t.plq)(c.fillStyle=`rgba(236,214,120,${t.plq*.7})`,c.fillRect(-w/2,-h/2,w,h*.42));
  if(t.red){c.fillStyle=`rgba(232,40,100,${Math.min(1,t.red)*.8})`;c.fillRect(-w/2,-h/2,w,h*(t.redH||.45));circ(c,-w*.2,h*.05,w*.14);}
  if(t.cav&&!t.fill){c.fillStyle='#5a4030';ell(c,(t.cx||0)*w,h*.08,w*.2*t.cav+2,h*.14*t.cav+2);c.fillStyle='rgba(90,64,48,.35)';ell(c,(t.cx||0)*w,h*.08,w*.3*t.cav+3,h*.2*t.cav+3);}
  if(t.hole&&!t.fill){c.fillStyle='#c8c0cc';ell(c,(t.cx||0)*w,h*.08,w*.24,h*.18);c.strokeStyle='#9a90a8';c.lineWidth=1.5;c.stroke();}
  if(t.fill){c.fillStyle=t.fill<1?'rgba(245,238,215,.95)':'#fbfaf2';ell(c,(t.cx||0)*w,h*.08,w*.24,h*.18);if(t.fill<1){c.strokeStyle='#e0d8b8';c.lineWidth=1;c.stroke();}}
  if(t.seal){c.strokeStyle=t.seal>=1?'rgba(255,255,255,.95)':'rgba(150,200,255,.95)';c.lineWidth=3;c.beginPath();c.moveTo(-w*.3,h*.15);c.lineTo(w*.3,h*.15);c.moveTo(0,-h*.05);c.lineTo(0,h*.35);c.stroke();}
  if(t.tar){c.fillStyle=`rgba(214,196,140,${Math.min(1,t.tar)})`;c.beginPath();c.moveTo(-w/2,-h/2);for(let j=0;j<=6;j++)c.lineTo(-w/2+j*w/6,-h/2+h*(.22+.1*Math.sin(j*2.3+t.i)));c.lineTo(w/2,-h/2);c.fill();}
  c.restore();
  if(t.fl){c.fillStyle=`rgba(255,255,255,${.35+.25*Math.sin(T*5+t.i)})`;ell(c,-w*.2,-h*.05,w*.12,h*.25);}
  if(t.chip){c.fillStyle='#8a2a4a';c.beginPath();c.moveTo(w/2+1,h*.1);c.lineTo(w/2+1,h/2+2);c.lineTo(w*.05,h/2+2);c.closePath();c.fill();}
  if(t.brk){MED.bracket(c,0,h*.05,w/60);}
  c.fillStyle='rgba(255,255,255,.55)';ell(c,-w*.24,-h*.08,w*.08,h*.2);c.restore();return p;}
function dmGum(c,M){c.fillStyle='#e87a94';for(const top of[true,false]){c.beginPath();const pts=[];for(let i=0;i<M.n;i++){const t=M.teeth.find(q=>q.top===top&&q.i===i),p=dmPos(M,t);pts.push([p.x,p.y+(top?-1:1)*p.h*.55]);}
    c.moveTo(pts[0][0]-30,pts[0][1]);for(const q of pts)c.lineTo(q[0],q[1]);c.lineTo(pts[pts.length-1][0]+30,pts[pts.length-1][1]);c.lineTo(pts[pts.length-1][0]+30,M.my+(top?-1:1)*(M.rh+36));c.lineTo(pts[0][0]-30,M.my+(top?-1:1)*(M.rh+36));c.closePath();c.fill();}
  for(const t of M.teeth){if(t.missing&&!t.grow){const p=dmPos(M,t);c.fillStyle='#d8607a';ell(c,p.x,p.y+(t.top?-1:1)*p.h*.42,p.w*.36,p.h*.12);}}}
// かお（どうぶつの かんじゃさんを ちかくから みた ところ）
function dmFace(c,S,o={}){const P=S.P,A=AN[P.k]||AN.bear,M=S.M,mx=M.mx,my=M.my,col=A.c,dk=shade(col,-.3);const happy=o.happy||S.happy>0,scared=o.scared,mouth=o.mouth??1;
  if(A.mane){c.fillStyle=A.mane;c.beginPath();c.ellipse(mx,my-70,330,310,0,0,TAU);c.fill();}
  const eary=my-300;c.fillStyle=A.earC||col;c.strokeStyle=dk;c.lineWidth=4;
  if(A.ear==='long'){for(const s of[-1,1]){c.beginPath();c.ellipse(mx+s*110,eary-110,44,120,s*.15,0,TAU);c.fill();c.stroke();c.fillStyle='#ffc8dc';c.beginPath();c.ellipse(mx+s*110,eary-110,22,90,s*.15,0,TAU);c.fill();c.fillStyle=col;}}
  else if(A.ear==='tri'){for(const s of[-1,1]){c.beginPath();c.moveTo(mx+s*100,eary+30);c.lineTo(mx+s*190,eary-90);c.lineTo(mx+s*220,eary+60);c.closePath();c.fill();c.stroke();}}
  else if(A.ear==='ele'){for(const s of[-1,1]){c.beginPath();c.ellipse(mx+s*250,my-160,110,150,0,0,TAU);c.fill();c.stroke();}}
  else if(A.ear==='flop'){for(const s of[-1,1]){c.beginPath();c.ellipse(mx+s*230,my-190,50,110,s*-.4,0,TAU);c.fill();c.stroke();}}
  else if(A.ear!=='none'){const r=A.ear==='mouse'?80:A.ear==='koala'?70:44;for(const s of[-1,1]){c.beginPath();c.arc(mx+s*185,eary+(A.ear==='mouse'?-10:10),r,0,TAU);c.fill();c.stroke();c.fillStyle=A.ear==='koala'?'#f0f0f6':'#ffc8dc';circ(c,mx+s*185,eary+(A.ear==='mouse'?-10:10),r*.5);c.fillStyle=A.earC||col;}}
  c.fillStyle=gfill(c,mx-60,my-240,300,col);c.beginPath();c.ellipse(mx,my-150,262,168,0,0,TAU);c.fill();c.strokeStyle=dk;c.lineWidth=4;c.stroke();
  if(A.patch){c.fillStyle='#3a3a4a';for(const s of[-1,1]){c.beginPath();c.ellipse(mx+s*92,my-222,40,32,s*.5,0,TAU);c.fill();}}
  if(A.stripes){c.fillStyle='#5a3a2a';for(const s of[-1,1])for(let i=0;i<3;i++){c.beginPath();c.moveTo(mx+s*(250-i*6),my-200+i*34);c.lineTo(mx+s*(190-i*6),my-190+i*34);c.lineTo(mx+s*(250-i*6),my-184+i*34);c.fill();}}
  if(A.wool){c.fillStyle='#fffaf0';for(let i=0;i<7;i++)circ(c,mx-150+i*50,my-300+Math.sin(i)*10,40);}
  const blink=((T*1.1)%4)>3.85,ey=my-222;for(const s of[-1,1]){const ex=mx+s*92;
    if(happy){c.strokeStyle='#3a3a4a';c.lineWidth=6;c.beginPath();c.arc(ex,ey+4,17,Math.PI*1.1,Math.PI*1.9);c.stroke();}
    else if(blink||o.shut){c.strokeStyle='#3a3a4a';c.lineWidth=5;c.beginPath();c.moveTo(ex-18,ey);c.lineTo(ex+18,ey);c.stroke();}
    else{const lk=LOOK.on?clamp((LOOK.x-mx)/300,-1,1)*6:0;c.fillStyle='#fff';circ(c,ex,ey,22);c.fillStyle='#3a3a4a';circ(c,ex+lk,ey+3,13);c.fillStyle='#fff';circ(c,ex-4+lk,ey-2,4.5);
      if(scared){c.strokeStyle='#3a3a4a';c.lineWidth=4;c.beginPath();c.moveTo(ex-s*22,ey-38);c.lineTo(ex+s*14,ey-30);c.stroke();}}}
  if(scared){c.fillStyle='#8ad0ff';c.beginPath();c.moveTo(mx+205,my-250);c.quadraticCurveTo(mx+218,my-226,mx+205,my-216);c.quadraticCurveTo(mx+192,my-226,mx+205,my-250);c.fill();}
  c.fillStyle='rgba(255,120,150,.45)';ell(c,mx-190,my-170,24,13);ell(c,mx+190,my-170,24,13);
  c.fillStyle=A.snout?'#ff9ab8':'#4a3a3a';ell(c,mx,my-178,A.snout?34:18,A.snout?22:12);
  // した あご と エプロン
  c.fillStyle=gfill(c,mx,my+150,262,col);c.beginPath();c.ellipse(mx,my+132,250,106,0,0,TAU);c.fill();c.strokeStyle=dk;c.lineWidth=4;c.stroke();
  const by=my+196;c.fillStyle='#bfe0ff';c.beginPath();c.moveTo(mx-230,by);c.lineTo(mx+230,by);c.lineTo(mx+250,by+160);c.lineTo(mx-250,by+160);c.closePath();c.fill();c.strokeStyle='#8ab8e8';c.lineWidth=2;for(let i=1;i<4;i++){c.beginPath();c.moveTo(mx-240,by+i*36);c.lineTo(mx+240,by+i*36);c.stroke();}
  c.strokeStyle=steel(c,mx-240,by,mx+240,by);c.lineWidth=4;c.beginPath();c.moveTo(mx-230,by+4);c.quadraticCurveTo(mx-270,by-40,mx-252,by-90);c.moveTo(mx+230,by+4);c.quadraticCurveTo(mx+270,by-40,mx+252,by-90);c.stroke();
  // おくち
  const rx=M.rw+44,ry=(M.rh+40)*mouth;c.fillStyle='#7a2040';c.beginPath();c.ellipse(mx,my,rx,Math.max(8,ry),0,0,TAU);c.fill();
  if(mouth>.3){c.save();c.beginPath();c.ellipse(mx,my,rx,ry,0,0,TAU);c.clip();c.fillStyle='#ff8cae';ell(c,mx,my+ry*.55,rx*.55,ry*.42);c.fillStyle='rgba(255,255,255,.1)';ell(c,mx-60,my-ry*.4,90,30);dmGum(c,M);
    for(const t of M.teeth)dmTooth(c,M,t,o);c.restore();}
  c.strokeStyle=shade(col,-.4);c.lineWidth=7;c.beginPath();c.ellipse(mx,my,rx,Math.max(8,ry),0,0,TAU);c.stroke();}
// しかの おへやの はいけい
function dentBg(c,S,th){th=th||['#e6faf4','#d4ece6','#f2fffb'];const L=-OX/SC-2,R=W+OX/SC+2,TP=-OY/SC-2;roomBg(c,th[0],th[1],H-230,th[2],[['window',70,300,.9,110,90],['viewer',W-80,330,.55]]);
  const g=c.createRadialGradient(S.M.mx,S.M.my-40,40,S.M.mx,S.M.my-40,420);g.addColorStop(0,'rgba(255,252,220,.55)');g.addColorStop(1,'rgba(255,252,220,0)');c.fillStyle=g;c.fillRect(L,TP,R-L,H);}
// ---------- すすめかた（ステップ エンジン） ----------
// step: {type:'hold'|'rub'|'tap'|'quiz'|'trace'|'drop'|'wait', tool, say, hint, ...}
const DG={bg:'#e6faf4',song:'play',
  enter(){for(const k of['btn','buds','zq','gq','mq','cal','bite','mark','imp','model','gz','fly','six','apron','sensor','rcol','wire','cnt','bn','outT','crownDone','chomp','food','view','ncav','months','fix'])delete this[k];this.si=-1;this.miss=0;this.fin=0;this.tools=[];this.prog=0;this.st=null;this.happy=0;this.scared=0;this.opts=null;this.lv=lvOf(this.id);this.P=newPatient(this.pool);this.M=dmNew(this.kind||'baby',300,H*.42);
    this.setup();this.steps=this.plan();say(this.intro());this.t0=0;if(this.P.shiny){sfx('spark');banner('キラキラ かんじゃさん！','#e8a000','めずらしい！ ずかんに のるよ');}},
  update(dt){for(const t of this.tools)t.upd(dt);if(this.happy>0)this.happy-=dt;if(this.scared>0)this.scared-=dt;this.t0+=dt;
    if(this.si<0&&this.t0>2.1)this.nextStep();const st=this.st;if(this.fin>0){this.fin+=dt;if(this.fin>.9&&this.fin<9){this.fin=9;celebrate(this.id,starsFor(this.miss));}return;}
    if(!st||st.fin)return;st.t=(st.t||0)+dt;const d=this.tools.find(q=>q.held);
    if(st.type==='hold'&&d&&d.k===st.tool){const g=st.at.call(this),tp=d.tip();if(Math.hypot(tp.x-g.x,tp.y-g.y)<(st.r||60)){this.prog+=dt;if(st.during)st.during.call(this,dt,g);if(this.prog>=st.need){d.held=false;const r=st.ok.call(this,g);this.stepDone(r);}}else this.prog=Math.max(0,this.prog-dt*.6);}
    if(st.upd)st.upd.call(this,dt);},
  nextStep(){this.si++;if(this.si>=this.steps.length){this.fin=.01;this.happy=9;return;}const st=this.st=this.steps[this.si];this.prog=0;st.t=0;st.fin=0;this.opts=null;
    this.tools=st.tool?mkTray(trayChoices(st.tool,st.pool||DTOOLS,st.n||3),H-80,54):[];if(st.begin)st.begin.call(this,st);if(st.type==='quiz')this.opts=shuffle(st.opts.call(this));if(st.say)say(typeof st.say==='function'?st.say.call(this):st.say);},
  stepDone(r){const st=this.st;if(!st||st.fin)return;st.fin=1;const d=r&&r.delay||1.5;this.tools.forEach(t=>t.hidden=true);setTimeout(()=>{if(scene!==this||this.st!==st)return;this.tools=[];if(this.si+1<this.steps.length)stepClear(r&&r.txt);this.nextStep();},d*1000);},
  targets(){const st=this.st;return st&&st.targets?st.targets.call(this).filter(q=>!q.done):[];},
  tpos(q){return q.t?dmPos(this.M,q.t):q;},
  down(x,y){const st=this.st;if(this.fin>0||!st||st.fin)return;
    if(st.type==='quiz'&&this.opts){const os=this.opts,ps=os.map((o,i)=>this.optPos(i));const i=ps.findIndex(p=>Math.abs(x-p.x)<p.w/2&&Math.abs(y-p.y)<p.h/2);if(i>=0){const o=os[i],p=ps[i];if(o.ok){sfx('ding');good(p.x,p.y-40,2,'せいかい！');if(st.right)st.right.call(this,o);this.opts=null;this.stepDone({delay:st.delay||2.2});}else{this.miss++;bad();say(st.wrong?st.wrong.call(this,o):'ざんねん！ もういちど かんがえてね');}}return;}
    if(st.type==='tap'){for(const q of this.targets()){const p=this.tpos(q);if(Math.hypot(x-p.x,y-p.y)<(st.r||34)){st.tapT.call(this,q,p);if(!this.targets().length&&!st.fin)this.stepDone(st.end?st.end.call(this):null);return;}}if(st.miss&&st.miss.call(this,x,y)){this.miss++;bad();}return;}
    for(const t of this.tools){if(t.hit(x,y)&&!t.hidden){if(t.k!==st.tool){this.miss++;wrongTool(t,st.wrongMsg);return;}t.held=true;t.lx=x;t.ly=y;sfx('tap');sayWord(t.k);return;}}
    if(st.tapAny)st.tapAny.call(this,x,y);},
  move(x,y){const t=this.tools.find(q=>q.held);if(!t)return;const dd=Math.hypot(x-t.lx,y-t.ly);t.x=x;t.y=y;t.lx=x;t.ly=y;const st=this.st;if(!st||st.fin)return;const tp=t.tip();
    if(st.type==='rub'&&dd>1){let any=0;for(const q of this.targets()){const p=this.tpos(q);if(Math.hypot(tp.x-p.x,tp.y-p.y)<(st.r||36)){q.hp=(q.hp??1)-dd/(st.per||160);any=1;if(st.rub)st.rub.call(this,q,p,dd);if(q.hp<=0){q.done=1;if(st.hit)st.hit.call(this,q,p);else good(p.x,p.y,1,st.word||'ピカッ');}}}
      if(any&&st.snd&&Math.random()<.3)sfx(st.snd);if(!this.targets().length){t.held=false;this.stepDone(st.end?st.end.call(this):null);}}
    if(st.type==='trace'){const pts=st.path.call(this);const i=this.prog|0;if(i<pts.length){const q=pts[i];if(Math.hypot(tp.x-q.x,tp.y-q.y)<(st.r||40)){this.prog=i+1;sfx('tick');if(st.pt)st.pt.call(this,i,q);if(this.prog>=pts.length){t.held=false;const r=st.ok.call(this);this.stepDone(r);}}}}},
  up(x,y){const t=this.tools.find(q=>q.held);if(!t)return;t.held=false;const st=this.st;if(!st||st.fin)return;const tp=t.tip();
    if(st.type==='drop'){const g=st.at.call(this);if(Math.hypot(tp.x-g.x,tp.y-g.y)<(st.r||90)){const r=st.ok.call(this,g);this.stepDone(r);}}
    if(st.type==='hold'&&!st.keep)this.prog=0;},
  optPos(i){const n=this.opts.length,w=Math.min(170,(W-60)/n-12);return{x:W/2+(i-(n-1)/2)*(w+14),y:H-100,w,h:150};},
  drawOpts(c){if(!this.opts)return;panel(c,16,H-190,W-32,180,26,'rgba(255,255,255,.96)','#9fe0cf',4);this.opts.forEach((o,i)=>{const p=this.optPos(i);c.fillStyle='#f4fffb';rr(c,p.x-p.w/2,p.y-p.h/2+6,p.w,p.h-12,20);c.fill();c.strokeStyle='#5ac8a8';c.lineWidth=4;c.stroke();
    if(o.draw)o.draw.call(this,c,p.x,p.y-18);txt(c,o.label,p.x,p.y+(o.draw?44:0),o.label.length>6?17:22,'#2a7a6a');});},
  hint(){const st=this.st;if(this.fin>0||!st||st.fin)return null;
    if(st.type==='quiz'){if(!this.opts)return null;const i=this.opts.findIndex(o=>o.ok);const p=this.optPos(i);return{x:p.x,y:p.y};}
    if(st.type==='tap'){const q=this.targets()[0];if(!q)return null;const p=this.tpos(q);return{x:p.x,y:p.y};}
    const tl=this.tools.find(q=>q.k===st.tool);if(!tl||tl.hidden)return null;let g=null;
    if(st.type==='hold'||st.type==='drop')g=st.at.call(this);else if(st.type==='rub'){const q=this.targets()[0];if(q)g=this.tpos(q);}else if(st.type==='trace'){const pts=st.path.call(this);g=pts[Math.min(pts.length-1,this.prog|0)];}
    if(!g)return null;const a=tl.aim(g);return{x:tl.hx,y:tl.hy,x2:a.x,y2:a.y};},
  hintText(){const st=this.st;return st?(st.hint||''):'';},
  drawCommon(c){const st=this.st;if(st&&st.type==='hold'&&this.prog>0&&!st.fin){const g=st.at.call(this);progRing(c,g.x,g.y,44,this.prog/st.need);}
    if(st&&!st.fin&&st.type==='trace'){const pts=st.path.call(this);c.setLineDash([8,8]);c.strokeStyle='rgba(255,95,162,.7)';c.lineWidth=4;c.beginPath();pts.forEach((q,i)=>i?c.lineTo(q.x,q.y):c.moveTo(q.x,q.y));c.stroke();c.setLineDash([]);for(let i=0;i<pts.length;i++){c.fillStyle=i<this.prog?'#ffd23a':'#fff';circ(c,pts[i].x,pts[i].y,7);}}
    if(st&&!st.fin&&st.type==='rub'&&st.mark!==false)for(const q of this.targets()){const p=this.tpos(q);targetMark(c,p.x,p.y,Math.min(st.r||36,50)*.9);}
    if(st&&!st.fin&&(st.type==='hold'||st.type==='drop')&&!this.tools.some(q=>q.held)&&st.mark!==false){const g=st.at.call(this);targetMark(c,g.x,g.y,st.r?st.r*.7:40);}
    fu(c,70,H-150,2.2,{point:!this.fin});rk(this,c,W-66,H-150,1.6);
    if(this.tools.some(t=>!t.hidden)){tray(c,H-80,120);for(const t of this.tools)if(!t.held)t.draw(c,1.3);for(const t of this.tools)if(t.held)t.draw(c,1.6);}
    this.drawOpts(c);stepDots(c,this.steps.length,Math.max(0,this.si)+(this.fin>0?1:0));}};
function dGame(id,def){SCN[id]=Object.assign({},DG,{id},def);}
function greetD(S,text){S.P.k=S.P.k||'bear';return`${ptName(S.P)}さん、 ${text}`;}

// ================= stages =================
const SKINS=['#ffe0cc','#f6d0ad','#e8b48d','#c98f68','#9a6440'];
const HAIRCOLS=['#2b1d22','#3a2a20','#5b3a28','#7a4f2e','#2e2624','#94603a','#c9883a'];
const PANTS=['#4d5a78','#6b5444','#7d7f86','#5a6b5a','#3f4558','#2f4078','#8a6a4a'];
// a crowd member for a stage. t: {tops:[[top,w]], hats:[[hat,w]], acc:[[key,p,colFn]], age:[...]}
function mobLook(t){
  const age=pickW(t.age||[['kid',.3],['adult',.52],['elder',.18]]),fem=chance(.5);
  const o={age,fem,skin:pick(SKINS)};
  o.hair=age==='elder'?(fem?pick(['bun','short','curly']):pick(['bald','short'])):fem?pick(['long','pony','twin','bun','curly','pattsun','bob']):pick(['short','spiky','curly','short']);
  o.hairCol=age==='elder'?pick(['#e8e4dc','#cfcac2','#bdb6ac']):pick(HAIRCOLS);
  let tops=t.tops||[['shirt',1]];if(t.topsKid&&age==='kid')tops=t.topsKid;
  o.top=pickW(tops);if(o.top==='dress'&&!fem)o.top='shirt';if(o.top==='princess'&&!fem)o.top='knight';
  o.topCol=pick(t.cols||SAFE_TOPS);o.botCol=pick(PANTS);o.shoe=pick(['#5b4236','#3b3533','#f7f4ee','#e8504a','#3f7bd6']);
  if(chance(.2))o.stripe=pick(['#fff','#3b3533','#f6c63a']);
  if(o.top==='yukata'){o.obi=pick(['#f6c63a','#e8504a','#f28fb7','#fff']);if(!fem)o.top=chance(.5)?'happi':'yukata'}
  const hat=pickW(t.hats||[[null,1]]);if(hat){o.hat=hat;o.hatCol=pick(t.hatCols||SAFE_TOPS)}
  o.acc={};for(const[k,p,v]of t.acc||[])if(chance(p))o.acc[k]=v?v():pick(SAFE_TOPS);
  if(age==='elder'&&chance(.3))o.acc.glasses=true;
  if(t.fix)t.fix(o);
  return o;
}
// ---- background helpers ----
function bgFill(c,col){c.fillStyle=col;c.fillRect(0,0,WW,WH)}
function grad(c,y0,y1,stops){const g=c.createLinearGradient(0,y0,0,y1);stops.forEach((s,i)=>g.addColorStop(i/(stops.length-1),s));c.fillStyle=g;c.fillRect(0,y0,WW,y1-y0)}
function tufts(c,x0,y0,w,h,col,n){c.strokeStyle=col;c.lineWidth=2;for(let i=0;i<n;i++){const x=x0+R()*w,y=y0+R()*h;c.beginPath();c.moveTo(x-3,y);c.lineTo(x-1,y-6);c.moveTo(x,y);c.lineTo(x+1,y-8);c.moveTo(x+3,y);c.lineTo(x+4,y-5);c.stroke()}}
function speckle(c,x0,y0,w,h,cols,n,r){for(let i=0;i<n;i++){c.fillStyle=cols[i%cols.length];circ(c,x0+R()*w,y0+R()*h,(r||2)*(.5+R()));c.fill()}}
function cloud(c,x,y,s,col){c.fillStyle=col||'#fff';for(const[dx,dy,r]of[[0,0,30],[-34,8,22],[34,8,24],[-14,-16,22],[16,-14,20]]){circ(c,x+dx*s,y+dy*s,r*s);c.fill()}}
function pathStroke(c,pts,w,col,edge){c.lineCap='round';c.lineJoin='round';const go=()=>{c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++){const p=pts[i-1],q=pts[i];c.quadraticCurveTo(p[0],p[1],(p[0]+q[0])/2,(p[1]+q[1])/2)}c.lineTo(pts[pts.length-1][0],pts[pts.length-1][1]);c.stroke()};
  if(edge){c.strokeStyle=edge;c.lineWidth=w+10;go()}c.strokeStyle=col;c.lineWidth=w;go();ink(c)}
function sheet(c,x,y,w,h,c1,c2){const s=14;for(let i=0;i<w/s;i++)for(let j=0;j<h/s;j++){c.fillStyle=(i+j)%2?c1:c2;c.fillRect(x+i*s,y+j*s,s,s)}c.strokeStyle='rgba(0,0,0,.15)';c.strokeRect(x,y,Math.ceil(w/s)*s,Math.ceil(h/s)*s);ink(c)}
function inEll(x,y,e){const dx=(x-e.x)/e.rx,dy=(y-e.y)/e.ry;return dx*dx+dy*dy<1}
function scatter(L,w,k,n,area,opts,minD){const placed=[];for(let i=0,tries=0;i<n&&tries<n*40;tries++){const x=area[0]+R()*(area[2]-area[0]),y=area[1]+R()*(area[3]-area[1]);
  if(w.st.walk(x,y,w)!=='land')continue;if(placed.some(p=>Math.hypot(p.x-x,(p.y-y)*1.5)<(minD||120)))continue;if(w.foot.some(f=>x>f.x0-30&&x<f.x1+30&&y>f.y0-20&&y<f.y1+20))continue;
  const o=typeof opts==='function'?opts():Object.assign({},opts||{});L.prop(k,x,y,o);placed.push({x,y});i++}}

const STAGES=[];
// 1 ----------------------------------------------------------------
STAGES.push({id:'park',name:'はるの こうえん',intro:'さくらが まんかいの こうえん。おはなみの ひとで いっぱい！',
  music:{tempo:112,scale:'major',wave:'triangle',seed:11,root:523.25},magic:'petals',people:250,decoys:6,walkers:.12,
  peopleOn:['land'],
  geo(w){w.pond={x:1760,y:470,rx:330,ry:170};w.sand={x:300,y:1150,w:380,h:250}},
  walk(x,y,w){if(y<70)return null;if(inEll(x,y,w.pond))return 'water';return 'land'},
  bg(c,w){bgFill(c,'#a9d88c');tufts(c,0,0,WW,WH,'#8cc472',1400);speckle(c,0,0,WW,WH,['#fff','#ffd6e4','#fff3a0'],420,2.4);
    pathStroke(c,[[-40,880],[500,760],[1000,860],[1400,980],[1900,900],[2440,980]],120,'#eedcb4','#e0c9a0');
    pathStroke(c,[[1100,1640],[1060,1300],[1000,860],[960,500],[900,-40]],100,'#eedcb4','#e0c9a0');
    c.fillStyle='#e0c9a0';circ(c,1000,860,190);c.fill();c.fillStyle='#eedcb4';circ(c,1000,860,178);c.fill();
    const p=w.pond;c.fillStyle='#8e7a5a';ell(c,p.x,p.y+8,p.rx+14,p.ry+12);c.fill();c.fillStyle='#86cfe8';ell(c,p.x,p.y,p.rx,p.ry);c.fill();c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=3;for(let i=0;i<14;i++){const x=p.x-p.rx*.7+R()*p.rx*1.4,y=p.y-p.ry*.6+R()*p.ry*1.2;line(c,x-18,y,x+18,y)}
    for(let i=0;i<7;i++){const a=R()*TAU;c.fillStyle='#6fb36a';ell(c,p.x+Math.cos(a)*p.rx*.7,p.y+Math.sin(a)*p.ry*.6,14,8);c.fill()}
    const s=w.sand;c.fillStyle='#c9a46a';rr(c,s.x-6,s.y-6,s.w+12,s.h+12,14);c.fill();c.fillStyle='#f0d9a0';rr(c,s.x,s.y,s.w,s.h,10);c.fill();speckle(c,s.x,s.y,s.w,s.h,['#e0c588'],120,2);
    for(let i=0;i<11;i++){const x=150+R()*2100,y=200+R()*1300;if(Math.abs(y-880)<120||inEll(x,y,{x:1760,y:470,rx:420,ry:260}))continue;sheet(c,x,y,70+R()*40,50+R()*30,pick(['#e8504a','#3f7bd6','#4cad62','#f28b2f']),'#fff')}
    ink(c)},
  layout(L,w){
    for(let i=0;i<10;i++)L.prop('sakura',60+i*250+rnd(-40,40),rnd(90,150),{s:rnd(.9,1.15)});
    scatter(L,w,'sakura',9,[120,300,2300,1550],()=>({s:rnd(.9,1.2)}),300);
    L.prop('slide',w.sand.x+120,w.sand.y+140);L.prop('swing',w.sand.x+290,w.sand.y+100);
    scatter(L,w,'bush',14,[60,200,2340,1580],()=>({flower:pick(['#f28fb7','#fff','#f6c63a'])}),150);
    scatter(L,w,'bench',8,[200,700,2200,1100],{},220);scatter(L,w,'lamp',6,[200,600,2200,1200],{},300);
    L.prop('stall',600,560,{col:'#f28fb7',sign:'おだんご',goods:['#fff','#f28fb7','#7fd6b4']});L.prop('stall',1450,1300,{col:'#4cad62',sign:'ジュース'});
    L.prop('balloons',1250,640);scatter(L,w,'flowers',12,[80,200,2320,1580],{},140)},
  look(){return mobLook({tops:[['shirt',3],['dress',1.2],['coat',.6]],hats:[[null,5],['cap',1],['straw',.6],['beret',.5],['sunhat',.6],['bow',.6]],acc:[['balloon',.05],['ice',.05],['camera',.04],['bag',.1],['backpack',.06]]})},
  animals:[['dog',8],['bird',14],['cat',3],['duck',8,'water']],
  hide:{p:.45,props:['bush','bench','flowers']},
  lines:['さくら きれいだね','おべんとう おいしい！']
});

// ================= がんか（めがねやさん） =================
const GSHAPES=[['round','まる','round'],['square','しかく','square'],['heart','ハート','heart'],['star','ほし','star']];
const GCOLS=[['#ff4d6d','あか','red'],['#4a9cff','あお','blue'],['#ffb800','きいろ','yellow'],['#4cc86a','みどり','green'],['#ff8cc8','ピンク','pink'],['#a878ff','むらさき','purple']];
function glassLens(c,x,y,r,sh){c.beginPath();if(sh==='square'){rr(c,x-r,y-r*.8,r*2,r*1.6,r*.3);}else if(sh==='heart'){heartP(c,x,y+r*.1,r*.95);}else if(sh==='star'){star(c,x,y,r*1.15,r*.6);}else c.arc(x,y,r,0,TAU);}
function drawGlasses(c,x,y,s,sh,col){c.save();c.translate(x,y);c.scale(s,s);c.lineWidth=4;c.strokeStyle=col;c.fillStyle='rgba(200,235,255,.35)';for(const sx of[-1,1]){glassLens(c,sx*22,0,15,sh);c.fill();c.stroke();}c.beginPath();c.moveTo(-8,-2);c.quadraticCurveTo(0,-8,8,-2);c.stroke();c.beginPath();c.moveTo(-37,-2);c.lineTo(-46,-6);c.moveTo(37,-2);c.lineTo(46,-6);c.stroke();c.fillStyle='rgba(255,255,255,.7)';for(const sx of[-1,1])ell(c,sx*22-6,-6,4,2.5);c.restore();}
M('glasses',c=>{drawGlasses(c,0,0,1.1,'round','#ff5fa2');});
Object.assign(WORDS,{glasses:['めがね','glasses'],lens:['レンズ','lens']});
const EYEPICS=['cat','dog','rabbit','bear','pig','chick','panda','fox','lion','elephant','frog','mouse'];
const HIRA=['あ','い','う','え','お','か','き','く','け','こ','さ','し','す','せ','そ','た','ち','つ','て','と','な','に','ぬ','ね','の'];
SCN.eye={bg:'#f0f6ff',song:'calm',
  enter(){this.P=newPatient(ANK.filter(k=>k!=='frog'));this.need=1+Math.floor(Math.random()*5);this.lens=0;this.ph='lens';this.miss=0;this.fin=0;this.tried=[];this.chars=shuffle(HIRA).slice(0,3);this.pics=shuffle(EYEPICS).slice(0,3);this.want=[pick(GSHAPES),pick(GCOLS)];this.gl=null;this.worn=0;this.ri=0;this.hop=0;this.gd=null;this.lay();
    greetPt(this.P,'こくばんの じが ぼやけて みえないの…');setTimeout(()=>{if(scene===this)say('レンズを かえて、 はっきり みえる ばんごうを さがそう！ 1から 5の ボタンを タッチ');},3000);},
  lay(){this.vx=W/2;this.vy=H*.3;this.vr=Math.min(170,H*.16);this.px=W/2;this.py=H*.66;},
  blur(){if(this.ph!=='lens'&&this.ph!=='solved')return 0;if(!this.lens)return 9;return Math.abs(this.lens-this.need)*3.2;},
  drawChart(c,b){const x=this.vx,y=this.vy,r=this.vr;const content=()=>{c.fillStyle='#fff';c.fillRect(x-r,y-r,r*2,r*2);this.chars.forEach((ch,i)=>txt(c,ch,x+(i-1)*r*.55,y-r*.35,r*.36,'#3a3a5a'));this.pics.forEach((a,i)=>drawAnimal(c,a,x+(i-1)*r*.6,y+r*.62,r/420,{t:0,happy:1}));};
    c.save();c.beginPath();c.arc(x,y,r,0,TAU);c.clip();if(b<.4)content();else{const n=8;c.globalAlpha=.24;for(let k=0;k<n;k++){c.save();const a=k/n*TAU;c.translate(Math.cos(a)*b,Math.sin(a)*b);content();c.restore();}c.globalAlpha=1;c.fillStyle=`rgba(255,255,255,${Math.min(.35,b*.03)})`;c.fillRect(x-r,y-r,r*2,r*2);}
    c.restore();c.strokeStyle='#5a6a8a';c.lineWidth=10;c.beginPath();c.arc(x,y,r,0,TAU);c.stroke();c.strokeStyle='#8a98b8';c.lineWidth=3;c.beginPath();c.arc(x,y,r-7,0,TAU);c.stroke();txt(c,this.ph==='read'?'めがねで みると…':`${ptName(this.P)}さんの みえかた`,x,y-r-18,18,'#5a88c8');},
  lensP(i){return{x:W/2+(i-2)*104,y:H-78};},
  optP(i){return{x:W/2+(i%3-1)*170,y:H-190+Math.floor(i/3)*110};},
  update(dt){if(this.hop>0)this.hop-=dt*2;if(this.fin>0){this.fin+=dt;if(this.fin>2.6&&this.fin<9){this.fin=9;celebrate('eye',starsFor(this.miss));}}},
  draw(c){roomBg(c,'#eef4ff','#d8e4f4',H*.62,'#f6f9ff',[['window',80,H*.62-220,1,100,80],['frame',W-80,H*.62-230,1,'glasses']]);
    c.fillStyle='#fff';rr(c,W-170,H*.62-150,140,100,10);c.fill();c.strokeStyle='#c8d4e8';c.lineWidth=3;c.stroke();for(let i=0;i<3;i++)drawGlasses(c,W-100,H*.62-126+i*30,.55,GSHAPES[i][0],GCOLS[i][0]);
    this.drawChart(c,this.blur());
    const P=this.P,sc=1.25;drawPt(c,P,this.px,this.py,sc,{t:T,sad:this.ph==='lens'&&this.blur()>1,happy:this.hop>0||this.ph==='read'||this.fin>0,hop:this.hop,tilt:this.ph==='lens'&&this.blur()>1?Math.sin(T*1.5)*.08:0});
    const ex=this.px,ey=this.py-86*sc;if(this.worn&&this.gl)drawGlasses(c,ex,ey,sc*.72,this.gl[0][0],this.gl[1][0]);
    if(this.ph==='lens'){c.fillStyle='#fff';rr(c,40,ey-40,110,40,20);c.fill();txt(c,this.lens?`レンズ ${this.lens}`:'レンズ なし',95,ey-20,17,'#5a88c8');tray(c,H-78,110);for(let i=0;i<5;i++){const p=this.lensP(i),n=i+1;c.fillStyle=this.lens===n?'#5aa8ff':this.tried.includes(n)?'#e4ecf8':'#fff';circ(c,p.x,p.y,40);c.strokeStyle='#8ab8e8';c.lineWidth=5;c.beginPath();c.arc(p.x,p.y,40,0,TAU);c.stroke();c.fillStyle='rgba(200,235,255,.5)';circ(c,p.x,p.y,30);txt(c,String(n),p.x,p.y+2,30,this.lens===n?'#fff':'#3a88e8',undefined,POP,400);}}
    if(this.ph==='frame'){panel(c,20,H-260,W-40,250,24,'#fff','#bfe0ff');txt(c,`${this.want[1][1]}の ${this.want[0][1]}の めがね （${this.want[1][2]} ${this.want[0][2]}）`,W/2,H-240,19,'#5a88c8');this.opts.forEach((o,i)=>{const p=this.optP(i);c.fillStyle='#f6faff';rr(c,p.x-76,p.y-44,152,88,18);c.fill();drawGlasses(c,p.x,p.y,1.3,o[0][0],o[1][0]);});}
    if(this.ph==='wear'&&this.gl){const g=this.gd||{x:W/2,y:H-100};drawGlasses(c,g.x,g.y,1.6,this.gl[0][0],this.gl[1][0]);targetMark(c,ex,ey,50);}
    if(this.ph==='read'){c.fillStyle='rgba(255,255,255,.0)';this.pics.forEach((a,i)=>{const x=this.vx+(i-1)*this.vr*.6,y=this.vy+this.vr*.62;if(this.rsel===i){c.strokeStyle='#4cc86a';c.lineWidth=5;c.beginPath();c.arc(x,y-this.vr*.15,this.vr*.25,0,TAU);c.stroke();}});txt(c,`${this.ri} / 2`,W/2,this.vy+this.vr+26,20,'#5a88c8');}
    fu(c,70,H*.62+130,2,{point:!this.fin});rk(this,c,W-56,H*.62+130,1.4);
    stepDots(c,4,{lens:0,solved:0,frame:1,wear:2,read:3}[this.ph]+(this.fin>0?1:0));},
  down(x,y){if(this.fin)return;
    if(this.ph==='lens'){for(let i=0;i<5;i++){const p=this.lensP(i);if(hitC(x,y,p.x,p.y,44)){const n=i+1;this.lens=n;if(!this.tried.includes(n))this.tried.push(n);sfx('tap');hush();speak(`${n}ばんの レンズ`);speak(`lens ${numEn(n)}`,'en');
      if(n===this.need){this.ph='solved';this.hop=1;good(W/2,this.vy,2,'はっきり！');setTimeout(()=>{if(scene!==this)return;say(`はっきり みえる！ ${n}ばんの レンズが ぴったり！`);setTimeout(()=>{if(scene!==this)return;this.ph='frame';const opts=[this.want];while(opts.length<6){const o=[pick(GSHAPES),pick(GCOLS)];if(!opts.some(q=>q[0]===o[0]&&q[1]===o[1]))opts.push(o);}this.opts=shuffle(opts);hush();speak(`${this.want[1][1]}の ${this.want[0][1]}の めがねが いいな`);speak(`${this.want[1][2]} ${this.want[0][2]} glasses, please!`,'en');},2600);},500);}
      else{const d=Math.abs(n-this.need);this.miss+=d>1?1:0;setTimeout(()=>{if(scene===this&&this.lens===n){hush();speak(d===1?'すこし みえる！ おしい！':'まだ ぼやけてる…');}},900);}return;}}return;}
    if(this.ph==='frame'){this.opts.forEach((o,i)=>{const p=this.optP(i);if(Math.abs(x-p.x)<76&&Math.abs(y-p.y)<44){if(o===this.want){this.gl=o;good(p.x,p.y,2,'それ！');hush();speak(`${o[1][1]}の ${o[0][1]}！`);speak(`${o[1][2]} ${o[0][2]}`,'en');this.ph='wear';this.gd={x:W/2,y:H-100};setTimeout(()=>{if(scene===this)say('めがねを かけて あげよう。 おかおへ もっていってね');},1400);}else{bad();this.miss++;hush();speak(`それは ${o[1][1]}の ${o[0][1]}。`);speak(`${this.want[1][2]} ${this.want[0][2]}`,'en');}}});return;}
    if(this.ph==='wear'){const g=this.gd;if(g&&Math.hypot(x-g.x,y-g.y)<80){this.dragG=1;}return;}
    if(this.ph==='read'){this.pics.forEach((a,i)=>{const px=this.vx+(i-1)*this.vr*.6,py=this.vy+this.vr*.62-this.vr*.15;if(Math.hypot(x-px,y-py)<this.vr*.3&&this.rsel==null){if(a===this.rq){this.rsel=i;good(px,py,2,'せいかい！');hush();speak(WORDS[a][0]);speak(WORDS[a][1],'en');this.ri++;setTimeout(()=>{if(scene!==this)return;this.rsel=null;if(this.ri>=2){this.fin=.01;banner('よく みえる！','#5aa8ff','めがね ぴったり！');}else this.askRead();},1600);}else{bad();this.miss++;hush();speak(`それは ${WORDS[a][1]}`,'en');}}});}},
  askRead(){this.rq=pick(this.pics.filter(p=>p!==this.rq));hush();speak('めがねで よく みえるよ！');speak(`I can see a ${WORDS[this.rq][1]}!`,'en');bub={text:`I can see a ${WORDS[this.rq][1]}!`,t:0,life:3};},
  move(x,y){if(this.dragG&&this.gd){this.gd.x=x;this.gd.y=y;}},
  up(x,y){if(this.dragG){this.dragG=0;const ex=this.px,ey=this.py-86*1.25;if(Math.hypot(x-ex,y-ey)<70){this.worn=1;this.gd=null;this.hop=1;good(ex,ey,2,'にあう！');this.ph='read';setTimeout(()=>{if(scene===this)this.askRead();},1400);}}},
  hint(){if(this.fin)return null;if(this.ph==='lens'){const p=this.lensP(this.need-1);return{x:p.x,y:p.y};}if(this.ph==='frame'&&this.opts){const i=this.opts.indexOf(this.want);return this.optP(i);}
    if(this.ph==='wear'&&this.gd)return{x:this.gd.x,y:this.gd.y,x2:this.px,y2:this.py-86*1.25};if(this.ph==='read'&&this.rq&&this.rsel==null){const i=this.pics.indexOf(this.rq);return{x:this.vx+(i-1)*this.vr*.6,y:this.vy+this.vr*.62-this.vr*.15};}return null;},
  hintText(){return{lens:'レンズの ばんごうを かえてみよう',frame:'いわれた いろと かたちの めがね',wear:'めがねを おかおへ',read:'えいごで いわれた どうぶつを タッチ'}[this.ph]||'';}};

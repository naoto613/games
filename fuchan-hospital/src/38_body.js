// ================= からだ ずかん（そと：えいご / なか：ないぞう） =================
const BPARTS=[['head','あたま','head',[[0,-53]],6],['hair','かみのけ','hair',[[-11.2,-37],[11.2,-37]],3.2],['eyes','め','eyes',[[-4,-47],[4,-47]],3],['nose','はな','nose',[[0,-44.3]],2],['mouth','くち','mouth',[[0,-41.2]],2.4],['ears','みみ','ears',[[-10.2,-47.6],[10.2,-47.6]],2.6],
  ['shoulders','かた','shoulders',[[-7.6,-34.5],[7.6,-34.5]],2.6],['hands','て','hands',[[-9.4,-19],[9.4,-19]],3.6],['tummy','おなか','tummy',[[0,-19]],4.4],['knees','ひざ','knees',[[-3.3,-9],[3.3,-9]],2.6],['feet','あし','feet',[[-3.4,-1.8],[3.4,-1.8]],2.8]];
const ORGANS=[['brain','のう','brain','かんがえたり おぼえたり する、 からだの しれいとう だよ'],['lungs','はい','lungs','いきを すって、 さんそを からだに とりいれるよ'],['heart','しんぞう','heart','どっくん どっくん。 ちを からだじゅうに おくる ポンプだよ'],
  ['stomach','い','stomach','たべものを どろどろに とかすよ'],['intestines','ちょう','intestines','とっても ながい くだ。 えいようを からだに とりこむよ'],['bones','ほね','bones','からだを ささえる かたい ほね。 ぎゅうにゅうで つよくなるよ']];
SCN.body={bg:'#fff4f4',song:'calm',
  enter(){this.qset=0;this.pieces=null;this.oq=null;const lv=lvOf('body');this.ph='out';this.qi=0;this.miss=0;this.fin=0;this.hl=null;this.learned=[];this.qs=shuffle(BPARTS).slice(0,5);this.enOnly=lv>=1&&Math.random()<.5;this.inMode=Math.random()<.5?'learn':'puzzle';this.lay();
    this.theme=pick([['#fff0f0','#f4dcdc','#fff8f8'],['#f0f6ff','#dce6f4','#f8fbff'],['#f4fff0','#dcecd4','#f8fff6']]);this.fuSeed=Math.random();
    say(this.enOnly?'からだ ずかん！ きょうは えいごだけで クイズ！ よく きいてね':'からだ ずかん！ ふーちゃんの からだで クイズだよ。 えいごも おぼえよう');setTimeout(()=>{if(scene===this)this.ask();},2800);},
  lay(){this.fs=Math.min(7.2,(H-260)/70);this.fx=W/2;this.fy=H-40;},
  P(ux,uy){const k=this.fs*.9;return{x:this.fx+ux*k,y:this.fy+uy*k};},
  ask(){if(this.ph==='out'){const q=this.qs[this.qi];if(!q)return;const pl=q[2].endsWith('s');hush();if(!this.enOnly)speak(`${q[1]}は どこ？`);speak(pick([`Where ${pl?'are':'is'} your ${q[2]}?`,`Touch your ${q[2]}!`]),'en');bub={text:(this.enOnly?'':`${q[1]}は どこ？  `)+`Touch your ${q[2]}!`,t:0,life:4};}
    else if(this.ph==='quiz'){const q=this.oq[this.qi];if(!q)return;hush();speak(`${q[1]}は どれ？`);speak(`Where is the ${q[2]}?`,'en');bub={text:`${q[1]}は どれ？  ${q[2]}`,t:0,life:3.6};}},
  O(){const cx=W/2,top=Math.max(170,H*.18),hh=(H-top-(this.ph==='in'&&this.inMode==='puzzle'?170:40));return{cx,top,u:hh/100};},
  opos(id){const {cx,top,u}=this.O();return{brain:{x:cx,y:top+12*u,r:9*u},lungs:{x:cx,y:top+40*u,r:10*u},heart:{x:cx+6*u,y:top+43*u,r:5*u},stomach:{x:cx+8*u,y:top+54*u,r:6*u},intestines:{x:cx,y:top+63*u,r:8*u},bones:{x:cx-7*u,y:top+86*u,r:7*u}}[id];},
  startIn(){this.ph='in';this.hl=null;if(this.inMode==='puzzle'){this.pieces=shuffle(ORGANS.map(o=>o[0])).map((id,i)=>({id,hx:W/2+(i-2.5)*92,hy:H-86,x:W/2+(i-2.5)*92,y:H-86,held:0,placed:0}));say('からだの なかの パズル！ したの ぞうきを ただしい ばしょに はめてね');}else say('レントゲンで からだの なかを のぞいてみよう。 ひかっている ところを タッチしてね');},
  update(dt){if(this.hl)this.hl.t+=dt;if(this.pieces)for(const p of this.pieces){if(!p.held&&!p.placed){p.x+=(p.hx-p.x)*Math.min(1,dt*10);p.y+=(p.hy-p.y)*Math.min(1,dt*10);}}if(this.fin>0){this.fin+=dt;if(this.fin>2.4&&this.fin<9){this.fin=9;celebrate('body',starsFor(this.miss));}}},
  drawOrgan(c,id,x,y,r,sc=1){c.save();c.translate(x,y);c.scale(sc,sc);c.lineCap='round';
    if(id==='brain'){c.fillStyle='#ffb0c8';c.strokeStyle='#d0708a';c.lineWidth=3;c.beginPath();c.ellipse(0,0,r,r*.72,0,0,TAU);c.fill();c.stroke();c.beginPath();for(let i=-3;i<=3;i++){c.moveTo(i*r*.26,-r*.6);c.quadraticCurveTo(i*r*.26+8,0,i*r*.26,r*.5);}c.stroke();}
    else if(id==='lungs'){c.fillStyle='#ff9aa8';c.strokeStyle='#c85a6a';c.lineWidth=3;for(const s of[-1,1]){c.beginPath();c.ellipse(s*r*.7,0,r*.6,r*1.05,s*.1,0,TAU);c.fill();c.stroke();}c.strokeStyle='#e8e0f0';c.lineWidth=4;c.beginPath();c.moveTo(0,-r*1.6);c.lineTo(0,-r*.6);c.lineTo(-r*.4,-r*.2);c.moveTo(0,-r*.6);c.lineTo(r*.4,-r*.2);c.stroke();}
    else if(id==='heart'){const hb=1+(Math.sin(T*7)>.6?.12:0);MED.heart(c,0,0,r/26*hb);}
    else if(id==='stomach'){c.fillStyle='#ffc890';c.strokeStyle='#d08a40';c.lineWidth=3;c.beginPath();c.ellipse(0,0,r*1.1,r*.75,-.4,0,TAU);c.fill();c.stroke();}
    else if(id==='intestines'){c.strokeStyle='#ffb07a';c.lineWidth=r*.34;c.beginPath();for(let i=0;i<4;i++){const yy=-r*.7+i*r*.45;c.moveTo(i%2?r:-r,yy);c.lineTo(i%2?-r:r,yy);}c.stroke();c.strokeStyle='#d8804a';c.lineWidth=2;c.stroke();}
    else{c.strokeStyle='#f4fbff';c.fillStyle='#f4fbff';c.lineWidth=r*.5;c.beginPath();c.moveTo(0,-r*1.6);c.lineTo(0,r*1.6);c.stroke();for(const s of[-1,1]){circ(c,-r*.3,s*r*1.7,r*.4);circ(c,r*.3,s*r*1.7,r*.4);}}
    c.restore();},
  drawInside(c){const {cx,top,u}=this.O();const L=-OX/SC-2,R=W+OX/SC+2;c.fillStyle='#1a2448';c.fillRect(L,-OY/SC-2,R-L,H+OY/SC*2+4);c.strokeStyle='rgba(120,180,255,.12)';c.lineWidth=1;for(let x=0;x<W;x+=40){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke();}
    const scan=(T*120)%(H+200)-100;const sg=c.createLinearGradient(0,scan-40,0,scan+40);sg.addColorStop(0,'rgba(120,220,255,0)');sg.addColorStop(.5,'rgba(120,220,255,.12)');sg.addColorStop(1,'rgba(120,220,255,0)');c.fillStyle=sg;c.fillRect(L,scan-40,R-L,80);
    c.fillStyle='rgba(140,200,255,.22)';c.strokeStyle='rgba(200,235,255,.8)';c.lineWidth=4;c.beginPath();c.arc(cx,top+13*u,13*u,0,TAU);c.fill();c.stroke();rr(c,cx-4*u,top+24*u,8*u,6*u,2*u);c.fill();
    rr(c,cx-17*u,top+29*u,34*u,44*u,10*u);c.fill();c.stroke();for(const s of[-1,1]){c.save();c.translate(cx+s*17*u,top+32*u);c.rotate(s*-.35);rr(c,-4*u,0,8*u,34*u,4*u);c.fill();c.stroke();c.restore();rr(c,cx+s*9*u-5*u,top+70*u,10*u,28*u,5*u);c.fill();c.stroke();}
    const puzzle=this.inMode==='puzzle'&&this.ph==='in';
    ORGANS.forEach(([id,ja,en])=>{const q=this.opos(id);if(this.hl&&this.hl.id===id){c.save();c.globalAlpha=.4+Math.sin(T*8)*.2;c.fillStyle='#fff6a0';circ(c,q.x,q.y,q.r*1.5);c.restore();}
      if(puzzle){const pc=this.pieces.find(p=>p.id===id);if(pc.placed)this.drawOrgan(c,id,q.x,q.y,q.r);else{c.strokeStyle=`rgba(255,240,120,${.4+Math.sin(T*4)*.3})`;c.lineWidth=3;c.setLineDash([8,6]);c.beginPath();c.arc(q.x,q.y,q.r*1.1,0,TAU);c.stroke();c.setLineDash([]);txt(c,'？',q.x,q.y,22,'rgba(255,240,160,.8)');}}
      else this.drawOrgan(c,id,q.x,q.y,q.r);});
    ORGANS.forEach(([id,ja,en])=>{const q=this.opos(id);if(this.learned.includes(id)&&this.ph==='in'){const side={brain:1,lungs:-1,heart:1,stomach:1,intestines:-1,bones:1}[id];const w=Math.max(ja.length*20+24,84);const lx=side>0?Math.min(cx+22*u,W-w-6):Math.max(6,cx-22*u-w);const ly=q.y-26;c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=2;c.beginPath();c.moveTo(q.x,q.y);c.lineTo(side>0?lx:lx+w,ly+26);c.stroke();c.fillStyle='rgba(255,255,255,.92)';rr(c,lx,ly,w,52,12);c.fill();txt(c,ja,lx+w/2,ly+16,18,'#3a3a6a');txt(c,en,lx+w/2,ly+38,13,'#3a88e8');}
      else if(this.ph==='in'&&this.inMode==='learn'){c.strokeStyle=`rgba(255,240,120,${.5+Math.sin(T*5)*.4})`;c.lineWidth=3;c.setLineDash([8,6]);c.beginPath();c.arc(q.x,q.y,q.r*1.3,0,TAU);c.stroke();c.setLineDash([]);}});
    if(puzzle){c.fillStyle='rgba(255,255,255,.12)';rr(c,10,H-150,W-20,130,24);c.fill();for(const p of this.pieces){if(p.placed)continue;const q=this.opos(p.id);const s=p.held?1:Math.min(1,36/q.r);c.fillStyle='rgba(255,255,255,.1)';if(!p.held){circ(c,p.x,p.y,40);}this.drawOrgan(c,p.id,p.x,p.y,q.r,s);}}
    txt(c,this.ph==='in'?(puzzle?`パズル ${this.learned.length} / 6`:`からだの なか  ${this.learned.length} / ${ORGANS.length}`):`クイズ ${Math.min(3,this.qi+1)} / 3`,W/2,150,22,'#bfe0ff');},
  draw(c){const th=this.theme;if(this.ph==='out'){roomBg(c,th[0],th[1],H-60,th[2],[['frame',90,220,1,'heart'],['plant',W-40,H-60,.9],['viewer',W-120,300,.8]]);const hl=this.hl&&this.hl.t<1.4;fu(c,this.fx,this.fy,this.fs,{outfit:fuOutfit({coat:null,item:null}),steth:false,happy:hl&&this.hl.ok,oh:hl&&!this.hl.ok,cheer:hl&&this.hl.ok&&this.hl.t<.8,look:0});
      if(this.hl&&this.hl.t<2){const q=BPARTS.find(b=>b[0]===this.hl.id);for(const [ux,uy] of q[3]){const p=this.P(ux,uy);c.strokeStyle=this.hl.ok?'#4cc86a':'#ff9a3a';c.lineWidth=6;c.beginPath();c.arc(p.x,p.y,q[4]*this.fs*.9+10,0,TAU);c.stroke();}}
      txt(c,`${Math.min(this.qi+1,5)} / 5`,W-40,160,22,'#ff5fa2','right');rk(this,c,W-70,H-60,1.6);}
    else{this.drawInside(c);rk(this,c,W-60,H-30-(this.inMode==='puzzle'&&this.ph==='in'?150:0),1.4,{still:1});}},
  hitPart(x,y){let best=null,bd=1e9;for(const q of BPARTS)for(const [ux,uy] of q[3]){const p=this.P(ux,uy);const d=Math.hypot(x-p.x,y-p.y)/(q[4]*this.fs*.9+14);if(d<1&&d<bd){bd=d;best=q;}}return best;},
  hitOrgan(x,y){let best=null,bd=1e9;for(const o of ORGANS){const p=this.opos(o[0]);const d=Math.hypot(x-p.x,y-p.y)/(p.r*1.3+10);if(d<1&&d<bd){bd=d;best=o;}}return best;},
  learnOrgan(o,x,y){this.hl={id:o[0],t:0};hush();speak(o[1]);speak(o[2],'en');speak(o[3]);card={k:o[0]==='heart'?'heart':null,ja:o[1],en:o[2],t:0};if(!this.learned.includes(o[0])){this.learned.push(o[0]);good(x,y,1,o[1]+'！');}else sfx(o[0]==='heart'?'dokkun':'pop');
    if(this.learned.length>=ORGANS.length&&!this.qset){this.qset=1;setTimeout(()=>{if(scene===this){stepClear('ぜんぶ おぼえた！');this.ph='quiz';this.qi=0;this.hl=null;this.pieces=null;this.oq=shuffle(ORGANS).slice(0,3);say('さいごに クイズ！');setTimeout(()=>{if(scene===this)this.ask();},1400);}},5200);}},
  down(x,y){if(this.fin)return;
    if(this.ph==='out'){if(this.qi>=5)return;const q=this.qs[this.qi],hit=this.hitPart(x,y);if(!hit)return;
      if(hit[0]===q[0]){this.hl={id:hit[0],ok:1,t:0};good(x,y,1,hit[2]+'!');hush();speak(hit[1]);speak(hit[2],'en');card={k:null,ja:hit[1],en:hit[2],t:0};this.qi++;
        if(this.qi>=5){setTimeout(()=>{if(scene===this){banner('ぜんもん せいかい！','#e84a5a');setTimeout(()=>{if(scene===this)this.startIn();},2200);}},1200);}else setTimeout(()=>{if(scene===this)this.ask();},1800);}
      else{this.hl={id:hit[0],ok:0,t:0};this.miss++;bad();hush();speak(`そこは ${hit[1]}`);speak(hit[2],'en');}return;}
    if(this.ph==='in'&&this.inMode==='puzzle'){for(const p of this.pieces){if(!p.placed&&Math.hypot(x-p.x,y-p.y)<46){p.held=1;p.ox=p.x-x;p.oy=p.y-y;sfx('tap');const o=ORGANS.find(o=>o[0]===p.id);hush();speak(o[1]);speak(o[2],'en');return;}}return;}
    const o=this.hitOrgan(x,y);if(!o)return;
    if(this.ph==='in'){this.learnOrgan(o,x,y);return;}
    if(this.ph==='quiz'){if(this.qi>=3)return;const q=this.oq[this.qi];if(o[0]===q[0]){this.hl={id:o[0],t:0};good(x,y,2,'せいかい！');hush();speak(o[1]);speak(o[2],'en');this.qi++;if(this.qi>=3){this.fin=.01;banner('からだ はかせ！','#e84a5a');}else setTimeout(()=>{if(scene===this)this.ask();},1800);}else{this.miss++;bad();hush();speak(`それは ${o[1]}`);speak(o[2],'en');}}},
  move(x,y){if(this.pieces){const p=this.pieces.find(p=>p.held);if(p){p.x=x+p.ox;p.y=y+p.oy;}}},
  up(x,y){if(!this.pieces)return;const p=this.pieces.find(p=>p.held);if(!p)return;p.held=0;const q=this.opos(p.id);if(Math.hypot(p.x-q.x,p.y-q.y)<Math.max(50,q.r*1.2)){p.placed=1;p.x=q.x;p.y=q.y;SHAKE=.1;this.learnOrgan(ORGANS.find(o=>o[0]===p.id),q.x,q.y);}
    else{const o=this.hitOrgan(p.x,p.y);if(o&&o[0]!==p.id){this.miss++;bad();hush();speak(`そこは ${o[1]}の ばしょ`);}}},
  hint(){if(this.fin)return null;if(this.ph==='out'){if(this.qi>=5)return null;const q=this.qs[this.qi];const p=this.P(...q[3][0]);return{x:p.x,y:p.y};}
    if(this.ph==='in'){if(this.inMode==='puzzle'){const p=this.pieces.find(p=>!p.placed);if(!p)return null;const q=this.opos(p.id);return{x:p.hx,y:p.hy,x2:q.x,y2:q.y};}const o=ORGANS.find(o=>!this.learned.includes(o[0]));if(!o)return null;const p=this.opos(o[0]);return{x:p.x,y:p.y};}
    if(this.ph==='quiz'&&this.oq&&this.qi<3){const p=this.opos(this.oq[this.qi][0]);return{x:p.x,y:p.y};}return null;},
  hintText(){if(this.ph==='out'&&this.qs[this.qi])return `${this.qs[this.qi][1]}を タッチしてね`;if(this.ph==='in')return this.inMode==='puzzle'?'ぞうきを ただしい ばしょへ':'ひかっている ところを タッチ';return '';}};

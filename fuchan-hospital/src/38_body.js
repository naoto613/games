// ================= からだ ずかん（そと：えいご / なか：ないぞう） =================
const BPARTS=[['head','あたま','head',[[0,-57]],11],['eyes','め','eyes',[[-4,-47],[4,-47]],3.2],['nose','はな','nose',[[0,-44.3]],2.2],['mouth','くち','mouth',[[0,-41.2]],2.6],['ears','みみ','ears',[[-10.2,-47.6],[10.2,-47.6]],3],
  ['hands','て','hands',[[-9.4,-19],[9.4,-19]],4],['tummy','おなか','tummy',[[0,-19]],5],['legs','あし','legs',[[-3.3,-8],[3.3,-8]],3.6]];
const ORGANS=[['brain','のう','brain','かんがえたり おぼえたり する、 からだの しれいとう だよ'],['lungs','はい','lungs','いきを すって、 さんそを からだに とりいれるよ'],['heart','しんぞう','heart','どっくん どっくん。 ちを からだじゅうに おくる ポンプだよ'],
  ['stomach','い','stomach','たべものを どろどろに とかすよ'],['intestines','ちょう','intestines','とっても ながい くだ。 えいようを からだに とりこむよ'],['bones','ほね','bones','からだを ささえる かたい ほね。 ぎゅうにゅうで つよくなるよ']];
SCN.body={bg:'#fff4f4',song:'calm',
  enter(){this.ph='out';this.qi=0;this.miss=0;this.fin=0;this.hl=null;this.learned=[];this.qs=shuffle(BPARTS).slice(0,5);this.lay();
    say('からだ ずかん！ ふーちゃんの からだで クイズだよ。 えいごも おぼえよう');setTimeout(()=>{if(scene===this)this.ask();},2600);},
  lay(){this.fs=Math.min(7.2,(H-260)/70);this.fx=W/2;this.fy=H-40;},
  P(ux,uy){const k=this.fs*.9;return{x:this.fx+ux*k,y:this.fy+uy*k};},
  ask(){const lv=lvOf('body');if(this.ph==='out'){const q=this.qs[this.qi];if(!q)return;hush();if(lv<2)speak(`${q[1]}は どこ？`);speak(`Where ${q[2].endsWith('s')?'are':'is'} your ${q[2]}?`,'en');bub={text:`${q[1]}は どこ？  Where ${q[2].endsWith('s')?'are':'is'} your ${q[2]}?`,t:0,life:4};}
    else if(this.ph==='quiz'){const q=this.oq[this.qi];if(!q)return;hush();speak(`${q[1]}は どれ？`);speak(`Where is the ${q[2]}?`,'en');bub={text:`${q[1]}は どれ？  ${q[2]}`,t:0,life:3.6};}},
  O(){const cx=W/2,top=Math.max(170,H*.2),hh=(H-top-40);return{cx,top,u:hh/100};},
  opos(id){const {cx,top,u}=this.O();return{brain:{x:cx,y:top+12*u,r:9*u},lungs:{x:cx,y:top+40*u,r:10*u},heart:{x:cx+6*u,y:top+43*u,r:5*u},stomach:{x:cx+8*u,y:top+54*u,r:6*u},intestines:{x:cx,y:top+63*u,r:8*u},bones:{x:cx-7*u,y:top+86*u,r:7*u}}[id];},
  update(dt){if(this.hl)this.hl.t+=dt;if(this.fin>0){this.fin+=dt;if(this.fin>1&&this.fin<9){this.fin=9;celebrate('body',starsFor(this.miss));}}},
  drawInside(c){const {cx,top,u}=this.O();const L=-OX/SC-2,R=W+OX/SC+2;c.fillStyle='#1a2448';c.fillRect(L,-OY/SC-2,R-L,H+OY/SC*2+4);c.strokeStyle='rgba(120,180,255,.12)';c.lineWidth=1;for(let x=0;x<W;x+=40){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke();}
    c.fillStyle='rgba(140,200,255,.22)';c.strokeStyle='rgba(200,235,255,.8)';c.lineWidth=4;c.beginPath();c.arc(cx,top+13*u,13*u,0,TAU);c.fill();c.stroke();rr(c,cx-4*u,top+24*u,8*u,6*u,2*u);c.fill();
    rr(c,cx-17*u,top+29*u,34*u,44*u,10*u);c.fill();c.stroke();for(const s of[-1,1]){c.save();c.translate(cx+s*17*u,top+32*u);c.rotate(s*-.35);rr(c,-4*u,0,8*u,34*u,4*u);c.fill();c.stroke();c.restore();rr(c,cx+s*9*u-5*u,top+70*u,10*u,28*u,5*u);c.fill();c.stroke();}
    const on=id=>this.learned.includes(id)||this.hl&&this.hl.id===id;const glow=id=>{if(this.hl&&this.hl.id===id){c.save();c.globalAlpha=.4+Math.sin(T*8)*.2;const p=this.opos(id);c.fillStyle='#fff6a0';circ(c,p.x,p.y,p.r*1.5);c.restore();}};
    ORGANS.forEach(([id])=>glow(id));
    // brain
    let p=this.opos('brain');c.fillStyle='#ffb0c8';c.strokeStyle='#d0708a';c.lineWidth=3;c.beginPath();c.ellipse(p.x,p.y,p.r,p.r*.72,0,0,TAU);c.fill();c.stroke();c.beginPath();for(let i=-3;i<=3;i++){c.moveTo(p.x+i*p.r*.26,p.y-p.r*.6);c.quadraticCurveTo(p.x+i*p.r*.26+8,p.y,p.x+i*p.r*.26,p.y+p.r*.5);}c.stroke();
    // lungs
    p=this.opos('lungs');c.fillStyle='#ff9aa8';c.strokeStyle='#c85a6a';for(const s of[-1,1]){c.beginPath();c.ellipse(p.x+s*p.r*.7,p.y,p.r*.6,p.r*1.05,s*.1,0,TAU);c.fill();c.stroke();}c.strokeStyle='#e8e0f0';c.lineWidth=4;c.beginPath();c.moveTo(p.x,p.y-p.r*1.6);c.lineTo(p.x,p.y-p.r*.6);c.lineTo(p.x-p.r*.4,p.y-p.r*.2);c.moveTo(p.x,p.y-p.r*.6);c.lineTo(p.x+p.r*.4,p.y-p.r*.2);c.stroke();
    // heart
    p=this.opos('heart');const hb=1+(Math.sin(T*7)>.6?.12:0);MED.heart(c,p.x,p.y,p.r/26*hb);
    // stomach
    p=this.opos('stomach');c.fillStyle='#ffc890';c.strokeStyle='#d08a40';c.lineWidth=3;c.beginPath();c.ellipse(p.x,p.y,p.r*1.1,p.r*.75,-.4,0,TAU);c.fill();c.stroke();
    // intestines
    p=this.opos('intestines');c.strokeStyle='#ffb07a';c.lineWidth=p.r*.34;c.lineCap='round';c.beginPath();for(let i=0;i<4;i++){const y=p.y-p.r*.7+i*p.r*.45;c.moveTo(p.x+(i%2?p.r:-p.r),y);c.lineTo(p.x+(i%2?-p.r:p.r),y);}c.stroke();c.strokeStyle='#d8804a';c.lineWidth=2;c.stroke();
    // bones
    p=this.opos('bones');c.strokeStyle='#f4fbff';c.fillStyle='#f4fbff';c.lineWidth=p.r*.5;c.beginPath();c.moveTo(p.x,p.y-p.r*1.6);c.lineTo(p.x,p.y+p.r*1.6);c.stroke();for(const s of[-1,1]){circ(c,p.x-p.r*.3,p.y+s*p.r*1.7,p.r*.4);circ(c,p.x+p.r*.3,p.y+s*p.r*1.7,p.r*.4);}
    ORGANS.forEach(([id,ja,en])=>{const q=this.opos(id);if(this.learned.includes(id)&&this.ph==='in'){const side={brain:1,lungs:-1,heart:1,stomach:1,intestines:-1,bones:1}[id];const {cx,u}=this.O();const w=Math.max(ja.length*20+24,84);const lx=side>0?Math.min(cx+22*u,W-w-6):Math.max(6,cx-22*u-w);const ly=q.y-26;c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=2;c.beginPath();c.moveTo(q.x,q.y);c.lineTo(side>0?lx:lx+w,ly+26);c.stroke();c.fillStyle='rgba(255,255,255,.92)';rr(c,lx,ly,w,52,12);c.fill();txt(c,ja,lx+w/2,ly+16,18,'#3a3a6a');txt(c,en,lx+w/2,ly+38,13,'#3a88e8');}
      else if(this.ph==='in'&&!this.learned.includes(id)){c.strokeStyle=`rgba(255,240,120,${.5+Math.sin(T*5)*.4})`;c.lineWidth=3;c.setLineDash([8,6]);c.beginPath();c.arc(q.x,q.y,q.r*1.3,0,TAU);c.stroke();c.setLineDash([]);}});
    txt(c,this.ph==='in'?`からだの なか  ${this.learned.length} / ${ORGANS.length}`:`クイズ ${this.qi+1} / 3`,W/2,150,22,'#bfe0ff');},
  draw(c){if(this.ph==='out'){roomBg(c,'#fff0f0','#f4dcdc',H-60,'#fff8f8');fu(c,this.fx,this.fy,this.fs,{outfit:fuOutfit({coat:null}),steth:false,happy:this.hl&&this.hl.ok,oh:this.hl&&!this.hl.ok});
      if(this.hl&&this.hl.t<2){const q=BPARTS.find(b=>b[0]===this.hl.id);for(const [ux,uy] of q[3]){const p=this.P(ux,uy);c.strokeStyle=this.hl.ok?'#4cc86a':'#ff9a3a';c.lineWidth=6;c.beginPath();c.arc(p.x,p.y,q[4]*this.fs*.9+10,0,TAU);c.stroke();}}
      txt(c,`${Math.min(this.qi+1,5)} / 5`,W-40,160,22,'#ff5fa2','right');drawRikki(c,W-70,H-60,{sc:1.6,t:T,happy:1});this.rkPos={x:W-70,y:H-60,sc:1.6};}
    else{this.drawInside(c);drawRikki(c,W-60,H-30,{sc:1.4,t:T,happy:1});this.rkPos={x:W-60,y:H-30,sc:1.4};}},
  hitPart(x,y){let best=null,bd=1e9;for(const q of BPARTS)for(const [ux,uy] of q[3]){const p=this.P(ux,uy);const d=Math.hypot(x-p.x,y-p.y)/(q[4]*this.fs*.9+14);if(d<1&&d<bd){bd=d;best=q;}}return best;},
  hitOrgan(x,y){let best=null,bd=1e9;for(const o of ORGANS){const p=this.opos(o[0]);const d=Math.hypot(x-p.x,y-p.y)/(p.r*1.3+10);if(d<1&&d<bd){bd=d;best=o;}}return best;},
  down(x,y){if(this.fin)return;
    if(this.ph==='out'){if(this.qi>=5)return;const q=this.qs[this.qi],hit=this.hitPart(x,y);if(!hit)return;
      if(hit[0]===q[0]){this.hl={id:hit[0],ok:1,t:0};sfx('ding');burst(x,y,10,'star');hush();speak(hit[1]);speak(hit[2],'en');card={k:null,ja:hit[1],en:hit[2],t:0};this.qi++;
        if(this.qi>=5){setTimeout(()=>{if(scene===this){this.ph='in';this.hl=null;say('ぜんもん せいかい！ つぎは レントゲンで からだの なかを のぞいてみよう。 ひかっている ところを タッチしてね');}},2200);}else setTimeout(()=>{if(scene===this)this.ask();},1800);}
      else{this.hl={id:hit[0],ok:0,t:0};this.miss++;sfx('no');hush();speak(`そこは ${hit[1]}`);speak(hit[2],'en');}return;}
    const o=this.hitOrgan(x,y);if(!o)return;
    if(this.ph==='in'){this.hl={id:o[0],t:0};sfx(o[0]==='heart'?'dokkun':'pop');hush();speak(o[1]);speak(o[2],'en');speak(o[3]);card={k:o[0]==='heart'?'heart':null,ja:o[1],en:o[2],t:0};if(!this.learned.includes(o[0]))this.learned.push(o[0]);
      if(this.learned.length>=ORGANS.length&&!this.qset){this.qset=1;setTimeout(()=>{if(scene===this){this.ph='quiz';this.qi=0;this.hl=null;this.oq=shuffle(ORGANS).slice(0,3);say('さいごに クイズ！');setTimeout(()=>{if(scene===this)this.ask();},1400);}},5200);}return;}
    if(this.ph==='quiz'){if(this.qi>=3)return;const q=this.oq[this.qi];if(o[0]===q[0]){this.hl={id:o[0],t:0};sfx('ding');burst(x,y,12,'star');hush();speak('せいかい！ '+o[1]);speak(o[2],'en');this.qi++;if(this.qi>=3){this.fin=.01;RK.clap=2;}else setTimeout(()=>{if(scene===this)this.ask();},1800);}else{this.miss++;sfx('no');hush();speak(`それは ${o[1]}`);speak(o[2],'en');}}},
  hint(){if(this.fin)return null;if(this.ph==='out'){if(this.qi>=5)return null;const q=this.qs[this.qi];const p=this.P(...q[3][0]);return{x:p.x,y:p.y};}
    if(this.ph==='in'){const o=ORGANS.find(o=>!this.learned.includes(o[0]));if(!o)return null;const p=this.opos(o[0]);return{x:p.x,y:p.y};}
    if(this.ph==='quiz'&&this.oq&&this.qi<3){const p=this.opos(this.oq[this.qi][0]);return{x:p.x,y:p.y};}return null;},
  hintText(){if(this.ph==='out'&&this.qs[this.qi])return `${this.qs[this.qi][1]}を タッチしてね`;if(this.ph==='in')return 'ひかっている ところを タッチ';return '';}};

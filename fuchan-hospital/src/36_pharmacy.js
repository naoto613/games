// ================= くすりやさん（いろ・かたち・かず・シロップの めもり） =================
const PCOL=['red','blue','yellow','green','pink'];
const SHAPES=[['circle','まる','circle'],['tri','さんかく','triangle'],['square','しかく','square'],['heart','ハート','heart']];
const SYRUPS=[['#ff8cc8','いちご'],['#b48cff','ぶどう'],['#ffb03a','オレンジ']];
SCN.pharmacy={bg:'#f6f0ff',song:'play',
  enter(){this.pour=0;this.give=0;this.cap=0;const lv=lvOf('pharmacy');this.lv=lv;this.oi=0;this.N=3;this.miss=0;this.fin=0;this.lay();const types=['pills','shape'].concat(['syrup']);this.types=shuffle(types.concat(pick(types))).slice(0,3);this.newOrder();},
  lay(){this.bx=W/2;this.by=H*.6;},
  newOrder(){const lv=this.lv;this.type=this.types[this.oi];this.inb=[];this.cap=0;this.give=0;this.P=newPatient();this.px=-120;this.level=0;this.pour=0;
    if(this.type==='pills'){const nc=lv<1?1+(Math.random()<.4?1:0):lv<2?2:3,mx=lv<1?3:lv<2?4:5;this.order=shuffle(PCOL).slice(0,nc).map(c=>({c,n:1+Math.floor(Math.random()*mx)}));}
    else if(this.type==='shape'){const nc=lv<1?1:2;this.order=shuffle(SHAPES).slice(0,nc).map(s=>({c:s[0],n:1+Math.floor(Math.random()*(lv<1?4:5))}));this.tcol=pick(['#ffffff','#ffe8a0','#c8f0ff','#ffd0e0']);}
    else{this.syr=pick(SYRUPS);this.target=pick(lv<1?[5,10]:[5,10,15]);}
    setTimeout(()=>{if(scene!==this)return;hush();speak(`${ptName(this.P)}さんの しょほうせん。`);this.readOrder();},900);},
  readOrder(){if(this.type==='pills'){for(const o of this.order){speak(`${COLORS[o.c][1]}を ${o.n}こ`);speak(`${numEn(o.n)} ${COLORS[o.c][2]}`,'en');}bub={text:this.order.map(o=>`${COLORS[o.c][1]} ${o.n}こ`).join('、 ')+' いれてね',t:0,life:4};}
    else if(this.type==='shape'){for(const o of this.order){const S=SHAPES.find(s=>s[0]===o.c);speak(`${S[1]}の じょうざいを ${o.n}こ`);speak(`${numEn(o.n)} ${S[2]}${o.n>1?'s':''}`,'en');}bub={text:this.order.map(o=>`${SHAPES.find(s=>s[0]===o.c)[1]} ${o.n}こ`).join('、 ')+' いれてね',t:0,life:4};}
    else{speak(`${this.syr[1]}の シロップを ${this.target}ミリリットル。 めもりまで いれてね`);speak(`${numEn(this.target)} milliliters`,'en');bub={text:`${this.syr[1]}シロップ ${this.target}ml！ めもりの せんまで`,t:0,life:4};}},
  bins(){return this.type==='shape'?SHAPES.map(s=>s[0]):PCOL;},
  jar(i){const n=this.bins().length;return{x:W/2+(i-(n-1)/2)*(n>4?112:130),y:H-90};},
  cnt(c){return this.inb.filter(q=>q===c).length;},
  okNow(){if(this.type==='syrup')return Math.abs(this.level-this.target)<=1;return this.order.every(o=>this.cnt(o.c)===o.n)&&this.inb.length===this.order.reduce((a,o)=>a+o.n,0);},
  update(dt){this.px+=(90-this.px)*Math.min(1,dt*3);if(this.pour&&!this.cap){this.level=Math.min(20,this.level+dt*(this.level>this.target-2.5?2.2:6));if(Math.random()<dt*2)sfx('pour');}
    if(this.give>0){this.give+=dt;if(this.give>2.4){this.oi++;if(this.oi>=this.N){if(!this.fin){this.fin=.01;banner('ぜんぶ おわたし！','#a878ff');}}else this.newOrder();this.give=-1;}}
    if(this.cap>0&&this.cap<1)this.cap=Math.min(1,this.cap+dt*2);
    if(this.fin>0){this.fin+=dt;if(this.fin>2.4&&this.fin<9){this.fin=9;celebrate('pharmacy',starsFor(this.miss));}}},
  drawOrder(c){const oy=170;const rows=this.type==='syrup'?1:this.order.length;panel(c,150,oy,250,70+rows*58,18,'#fff','#a878ff');txt(c,'しょほうせん',275,oy+24,20,'#7a4ad8');crossSign(c,172,oy+24,9);
    if(this.type==='syrup'){const y=oy+68;MED.syrup(c,195,y,.7,{lv:.7,col:this.syr[0]});txt(c,`${this.target} ml`,265,y-8,28,'#7a4ad8');txt(c,`${numEn(this.target)} ml`,265,y+18,13,'#8a7aa8');const ok=Math.abs(this.level-this.target)<=1;txt(c,String(Math.round(this.level)),360,y,26,ok?'#4cc86a':this.level>this.target?'#ff4d6d':'#b0a0c0');return;}
    this.order.forEach((o,i)=>{const y=oy+68+i*58,have=this.cnt(o.c),ok=have===o.n;let col='#7a4ad8',en='';if(this.type==='pills'){const C=COLORS[o.c];MED.pill(c,190,y,.8,{col:C[0]});col=C[0]==='#ffd23a'?'#d8a800':C[0];en=`${numEn(o.n)} ${C[2]}`;}else{const S=SHAPES.find(s=>s[0]===o.c);MED.tablet(c,190,y,.8,{sh:o.c,col:this.tcol});en=`${numEn(o.n)} ${S[2]}`;}
      txt(c,`× ${o.n}`,250,y-8,28,col);txt(c,en,262,y+18,13,'#8a7aa8');txt(c,`${have}`,355,y,26,ok?'#4cc86a':have>o.n?'#ff4d6d':'#b0a0c0');if(ok){c.strokeStyle='#4cc86a';c.lineWidth=5;c.beginPath();c.moveTo(372,y);c.lineTo(380,y+8);c.lineTo(394,y-10);c.stroke();}});},
  draw(c){roomBg(c,'#f4eaff','#e4d8f4',H*.5,'#faf4ff',[['window',80,H*.5-240,1,100,80,'#e0c8ff']]);
    for(let r=0;r<2;r++){c.fillStyle='#d8c0f0';c.fillRect(W-200,170+r*90,180,10);for(let i=0;i<4;i++)MED.bottle(c,W-176+i*44,145+r*90,.5);}
    drawPt(c,this.P,this.px,H*.5,.9,{t:T,happy:this.give>0,hop:this.give>0?Math.abs(Math.sin(T*6))*.5:0,wave:this.give>1.2});
    this.drawOrder(c);
    c.fillStyle=vfill(c,H*.5,H*.5+40,'#c8a0f0',.1,-.1);rr(c,-20,H*.5,W+40,40,8);c.fill();
    const bx=this.bx,by=this.by;c.save();if(this.give>0){const k=Math.min(1,this.give/1.2);c.translate((this.px-bx)*k,-k*120);c.scale(1-k*.4,1-k*.4);}
    if(this.type==='syrup'){c.fillStyle='rgba(255,255,255,.6)';c.strokeStyle='#9ab0d0';c.lineWidth=5;c.beginPath();c.moveTo(bx-80,by-120);c.lineTo(bx+80,by-120);c.lineTo(bx+66,by+90);c.lineTo(bx-66,by+90);c.closePath();c.fill();c.stroke();
      c.save();c.clip();const ly=by+90-this.level/20*210;c.fillStyle=this.syr[0];c.fillRect(bx-90,ly,180,300);c.fillStyle='rgba(255,255,255,.35)';c.fillRect(bx-90,ly,180,6);c.restore();
      for(let v=5;v<=20;v+=5){const y=by+90-v/20*210;c.strokeStyle=v===this.target?'#ff4d6d':'#8a9ab8';c.lineWidth=v===this.target?4:2;c.beginPath();c.moveTo(bx-70,y);c.lineTo(bx-30,y);c.stroke();txt(c,String(v),bx-90,y,16,v===this.target?'#ff4d6d':'#8a9ab8','right');}
      if(this.pour&&!this.cap){c.strokeStyle=this.syr[0];c.lineWidth=10;c.beginPath();c.moveTo(bx+40,by-150);c.quadraticCurveTo(bx+20,by-120,bx+10,by+90-this.level/20*210);c.stroke();}}
    else{c.fillStyle='rgba(255,190,110,.45)';c.strokeStyle='#d88030';c.lineWidth=5;rr(c,bx-90,by-110,180,200,24);c.fill();c.stroke();
      this.inb.forEach((q,i)=>{const x=bx-60+(i%4)*40,y=by+64-Math.floor(i/4)*30;if(this.type==='pills')MED.pill(c,x,y,.7,{col:COLORS[q][0]});else MED.tablet(c,x,y,.8,{sh:q,col:this.tcol});});}
    if(this.cap>0){c.fillStyle='#fff';c.strokeStyle='#b0b8c8';c.lineWidth=4;rr(c,bx-100,by-150-(1-this.cap)*60,200,44,12);c.fill();c.stroke();}
    if(this.cap>=1){c.fillStyle='#fff';rr(c,bx-60,by-60,120,60,10);c.fill();crossSign(c,bx-36,by-30,10);txt(c,ptName(this.P),bx+14,by-30,16,'#7a4ad8');}c.restore();
    if(!this.cap)txt(c,this.type==='syrup'?'コップを タッチで すてる':'びんを タッチで 1こ もどす',bx,by+120,15,'#a090c0');
    tray(c,H-90,130);
    if(this.type==='syrup'){const x=W/2+60;c.save();c.translate(x,H-90);if(this.pour)c.rotate(-.6);c.fillStyle=gfill(c,0,0,40,this.syr[0]);rr(c,-26,-40,52,76,12);c.fill();c.fillStyle='#fff';rr(c,-14,-54,28,18,5);c.fill();rr(c,-18,-16,36,28,6);c.fill();txt(c,this.syr[1],0,-2,12,'#7a4ad8');c.restore();txt(c,'ながおしで そそぐ',x,H-30,14,'#8a7aa8');}
    else this.bins().forEach((q,i)=>{const p=this.jar(i);const col=this.type==='pills'?COLORS[q][0]:'#a878ff';c.fillStyle='rgba(255,255,255,.7)';c.strokeStyle=col;c.lineWidth=4;rr(c,p.x-44,p.y-48,88,86,18);c.fill();c.stroke();
      if(this.type==='pills'){for(let k=0;k<5;k++)MED.pill(c,p.x-20+(k%3)*20,p.y+18-Math.floor(k/3)*20,.45,{col});txt(c,COLORS[q][1],p.x,p.y-30,15,shade(col,-.25));}else{MED.tablet(c,p.x,p.y+8,1,{sh:q,col:this.tcol});txt(c,SHAPES.find(s=>s[0]===q)[1],p.x,p.y-32,14,'#7a4ad8');}});
    if(!this.cap)drawBtn(c,W-64,by-40,40,'#4cc86a','check',this.okNow());
    fu(c,70,by+170,2.1,{point:!this.give});rk(this,c,W-60,by+170,1.5);
    stepDots(c,this.N,this.oi);},
  down(x,y){if(this.fin||this.cap)return;
    if(this.type==='syrup'){if(hitC(x,y,W/2+60,H-90,60)){this.pour=1;return;}if(Math.abs(x-this.bx)<85&&Math.abs(y-this.by)<120&&this.level>0){this.level=0;sfx('splash');say('すてて もういちど');return;}}
    else{const bins=this.bins();for(let i=0;i<bins.length;i++){const p=this.jar(i);if(Math.abs(x-p.x)<46&&Math.abs(y-p.y)<46){if(this.inb.length>=16)return;const q=bins[i];this.inb.push(q);sfx('pop');burst(this.bx,this.by-100,3,'dot');const n=this.cnt(q);
        if(this.type==='pills')sayColorNum(n,q);else{hush();const S=SHAPES.find(s=>s[0]===q);speak(`${S[1]} ${n}こ`);speak(`${numEn(n)} ${S[2]}${n>1?'s':''}`,'en');}const o=this.order.find(o=>o.c===q);if(o&&n===o.n)good(p.x,p.y-40,1,'ぴったり！');return;}}
      if(Math.abs(x-this.bx)<95&&Math.abs(y-this.by)<110&&this.inb.length){let ix=-1;for(let i=this.inb.length-1;i>=0;i--){const q=this.inb[i],o=this.order.find(o=>o.c===q);if(!o||this.cnt(q)>o.n){ix=i;break;}}if(ix<0)ix=this.inb.length-1;this.inb.splice(ix,1);sfx('tap');return;}}
    if(hitC(x,y,W-64,this.by-40,48)){if(this.okNow()){this.cap=.01;good(this.bx,this.by-120,3,'かんせい！');setTimeout(()=>{if(scene===this){this.give=.01;sfx('hooray');say(pick(['はい、 おくすりです。 おだいじに！','ぴったり！ おだいじに！']));}},900);}
      else{bad();this.miss++;if(this.type==='syrup')say(this.level>this.target?`おおすぎ！ ${this.target}の せんまでだよ。 コップを タッチして すてよう`:`たりないよ！ ${this.target}の せんまで いれてね`);
        else{const extra=this.inb.find(q=>!this.order.some(o=>o.c===q));const nm=q=>this.type==='pills'?COLORS[q][1]:SHAPES.find(s=>s[0]===q)[1];if(extra)say(`${nm(extra)}は いらないよ。 びんを タッチして もどそう`);else{const o=this.order.find(o=>this.cnt(o.c)!==o.n);say(this.cnt(o.c)>o.n?`${nm(o.c)}が おおいよ。 ${o.n}こ だよ`:`${nm(o.c)}が たりないよ。 ${o.n}こ だよ`);}}}return;}
    if(Math.abs(x-275)<125&&y>170&&y<260+(this.order?this.order.length:1)*58){hush();this.readOrder();}},
  up(){if(this.pour){this.pour=0;if(this.type==='syrup'){if(Math.abs(this.level-this.target)<=1)this.level=this.target;hush();speak(`${Math.round(this.level)}`);if(this.level===this.target)good(this.bx,this.by-40,1,'めもり ぴったり！');}}},
  hint(){if(this.fin||this.cap||this.give>0)return null;
    if(this.type==='syrup'){if(Math.abs(this.level-this.target)<=(this.pour?.3:1))return{x:W-64,y:this.by-40};if(this.level>this.target+1)return{x:this.bx,y:this.by};const x=W/2+60;return{x,y:H-90,x2:x+1,y2:H-89};}
    const extra=this.inb.find(q=>!this.order.some(o=>o.c===q));if(extra)return{x:this.bx,y:this.by};const o=this.order.find(o=>this.cnt(o.c)!==o.n);if(!o)return{x:W-64,y:this.by-40};if(this.cnt(o.c)>o.n)return{x:this.bx,y:this.by};const p=this.jar(this.bins().indexOf(o.c));return{x:p.x,y:p.y};},
  hintText(){return this.type==='syrup'?'シロップを ながおしして めもりの せんまで':'しょほうせんを みて びんに いれよう';}};

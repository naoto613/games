// ================= くすりやさん（いろ と かず） =================
const PCOL=['red','blue','yellow','green','pink'];
SCN.pharmacy={bg:'#f6f0ff',song:'play',
  enter(){this.oi=0;this.N=3;this.miss=0;this.fin=0;this.lay();this.newOrder();},
  lay(){this.bx=W/2;this.by=H*.6;},
  newOrder(){const lv=lvOf('pharmacy');const nc=lv<1?1:lv<2?2:3,mx=lv<1?3:lv<2?4:5;const cols=shuffle(PCOL).slice(0,nc);this.order=cols.map(c=>({c,n:1+Math.floor(Math.random()*mx)}));this.inb=[];this.cap=0;this.give=0;this.k=pick(ANK);this.px=-120;
    setTimeout(()=>{if(scene!==this)return;hush();speak(`${WORDS[this.k][0]}さんの しょほうせん。`);this.readOrder();bub={text:this.order.map(o=>`${COLORS[o.c][1]} ${o.n}こ`).join('、 ')+' いれてね',t:0,life:4};},900);},
  readOrder(){for(const o of this.order){speak(`${COLORS[o.c][1]}を ${o.n}こ`);speak(`${numEn(o.n)} ${COLORS[o.c][2]}`,'en');}},
  jar(i){return{x:W/2+(i-2)*112,y:H-90};},
  cnt(c){return this.inb.filter(q=>q===c).length;},
  update(dt){this.px+=(90-this.px)*Math.min(1,dt*3);if(this.give>0){this.give+=dt;if(this.give>2.4){this.oi++;if(this.oi>=this.N){if(!this.fin)this.fin=.01;}else this.newOrder();this.give=-1;}}
    if(this.cap>0&&this.cap<1)this.cap=Math.min(1,this.cap+dt*2);
    if(this.fin>0){this.fin+=dt;if(this.fin>.6&&this.fin<9){this.fin=9;celebrate('pharmacy',starsFor(this.miss));}}},
  draw(c){roomBg(c,'#f4eaff','#e4d8f4',H*.5,'#faf4ff');
    // shelves
    for(let r=0;r<2;r++){c.fillStyle='#d8c0f0';c.fillRect(W-200,170+r*90,180,10);for(let i=0;i<4;i++)MED.bottle(c,W-176+i*44,145+r*90,.5);}
    // patient
    drawAnimal(c,this.k,this.px,H*.5,.9,{t:T,happy:this.give>0,hop:this.give>0?Math.abs(Math.sin(T*6))*.5:0});
    // prescription
    const oy=170;panel(c,150,oy,240,70+this.order.length*58,18,'#fff','#a878ff');txt(c,'しょほうせん',270,oy+24,20,'#7a4ad8');crossSign(c,172,oy+24,9);
    this.order.forEach((o,i)=>{const y=oy+68+i*58,C=COLORS[o.c],have=this.cnt(o.c),ok=have===o.n;MED.pill(c,190,y,.8,{col:C[0]});txt(c,`× ${o.n}`,250,y-8,28,C[0]==='#ffd23a'?'#d8a800':C[0]);txt(c,`${numEn(o.n)} ${C[2]}`,250,y+18,14,'#8a7aa8');
      txt(c,`${have}`,350,y,26,ok?'#4cc86a':have>o.n?'#ff4d6d':'#b0a0c0');if(ok){c.strokeStyle='#4cc86a';c.lineWidth=5;c.beginPath();c.moveTo(368,y);c.lineTo(376,y+8);c.lineTo(390,y-10);c.stroke();}});
    // counter
    c.fillStyle=vfill(c,H*.5,H*.5+40,'#c8a0f0',.1,-.1);rr(c,-20,H*.5,W+40,40,8);c.fill();
    // bottle
    const bx=this.bx,by=this.by;c.save();if(this.give>0){c.translate((this.px-bx)*Math.min(1,this.give/1.2),-(Math.min(1,this.give/1.2))*120);}
    c.fillStyle='rgba(255,190,110,.45)';c.strokeStyle='#d88030';c.lineWidth=5;rr(c,bx-90,by-110,180,200,24);c.fill();c.stroke();
    this.inb.forEach((q,i)=>MED.pill(c,bx-60+(i%4)*40,by+64-Math.floor(i/4)*30,.7,{col:COLORS[q][0]}));
    c.fillStyle='#fff';c.strokeStyle='#b0b8c8';c.lineWidth=4;rr(c,bx-100,by-150-(1-this.cap)*60,200,44,12);c.globalAlpha=this.cap>0?1:.0;c.fill();c.stroke();c.globalAlpha=1;
    if(this.cap>=1){c.fillStyle='#fff';rr(c,bx-60,by-60,120,60,10);c.fill();crossSign(c,bx-36,by-30,10);txt(c,WORDS[this.k][0],bx+14,by-30,18,'#7a4ad8');}c.restore();
    if(!this.cap)txt(c,'びんを タッチで 1こ もどす',bx,by+120,15,'#a090c0');
    // jars
    tray(c,H-90,130);PCOL.forEach((q,i)=>{const p=this.jar(i),C=COLORS[q];c.fillStyle='rgba(255,255,255,.7)';c.strokeStyle=C[0];c.lineWidth=4;rr(c,p.x-44,p.y-48,88,86,18);c.fill();c.stroke();for(let k=0;k<5;k++)MED.pill(c,p.x-20+(k%3)*20,p.y+18-Math.floor(k/3)*20,.45,{col:C[0]});txt(c,C[1],p.x,p.y-30,15,shade(C[0],-.25));});
    if(!this.cap)drawBtn(c,W-64,by-40,40,'#4cc86a','check',this.order.every(o=>this.cnt(o.c)===o.n)&&this.inb.length===this.order.reduce((a,o)=>a+o.n,0));
    fu(c,70,by+170,2.1,{point:!this.give,cheer:this.give>0});rk(this,c,W-60,by+170,1.5,{happy:this.give>0});
    stepDots(c,this.N,this.oi);},
  down(x,y){if(this.fin||this.cap)return;
    for(let i=0;i<5;i++){const p=this.jar(i);if(Math.abs(x-p.x)<46&&Math.abs(y-p.y)<46){if(this.inb.length>=16)return;const q=PCOL[i];this.inb.push(q);sfx('pop');burst(this.bx,this.by-100,3,'dot');sayColorNum(this.cnt(q),q);return;}}
    if(Math.abs(x-this.bx)<95&&Math.abs(y-this.by)<110&&this.inb.length){let ix=-1;for(let i=this.inb.length-1;i>=0;i--){const q=this.inb[i],o=this.order.find(o=>o.c===q);if(!o||this.cnt(q)>o.n){ix=i;break;}}if(ix<0)ix=this.inb.length-1;const q=this.inb.splice(ix,1)[0];sfx('tap');hush();speak(`${COLORS[q][1]}を もどしたよ`);return;}
    if(hitC(x,y,W-64,this.by-40,48)){const ok=this.order.every(o=>this.cnt(o.c)===o.n)&&this.inb.length===this.order.reduce((a,o)=>a+o.n,0);
      if(ok){this.cap=.01;sfx('ding');setTimeout(()=>{if(scene===this){this.give=.01;sfx('hooray');RK.clap=1.5;say(pick(['はい、 おくすりです。 おだいじに！','ぴったり！ おだいじに！']));}},900);}
      else{sfx('no');this.miss++;const extra=this.inb.find(q=>!this.order.some(o=>o.c===q));if(extra)say(`${COLORS[extra][1]}は いらないよ。 びんを タッチして もどそう`);else{const o=this.order.find(o=>this.cnt(o.c)!==o.n);say(this.cnt(o.c)>o.n?`${COLORS[o.c][1]}が おおいよ。 ${o.n}こ だよ`:`${COLORS[o.c][1]}が たりないよ。 ${o.n}こ だよ`);}}return;}
    if(Math.abs(x-270)<120&&y>170&&y<250+this.order.length*58){hush();this.readOrder();}},
  hint(){if(this.fin||this.cap)return null;const extra=this.inb.find(q=>!this.order.some(o=>o.c===q));if(extra)return{x:this.bx,y:this.by};const o=this.order.find(o=>this.cnt(o.c)!==o.n);if(!o)return{x:W-64,y:this.by-40};if(this.cnt(o.c)>o.n)return{x:this.bx,y:this.by};const p=this.jar(PCOL.indexOf(o.c));return{x:p.x,y:p.y};},
  hintText(){return'しょほうせんの いろと かずを みて、 びんに いれよう';}};

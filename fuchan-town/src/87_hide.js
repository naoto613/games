// ================= hide and seek =================
const NUM10=['いち','に','さん','し','ご','ろく','しち','はち','きゅう','じゅう'];
SCN.hide={bg:'#bfe9ff',song:'fuwa',
  SCENES:[['こうえん','park'],['おうち','house'],['もり','forest']],
  enter(){this.round=0;this.fin=0;this.lucky=false;this.setup();},
  setup(){this.ph='count';this.n=0;this.t=0;const r=this.round;const kinds=[['bush','slide','bench','tree','box'],['curtain','sofa','box','bed','closet'],['bush','tree','rock','log','mushroom']][r];
    const pos=[[120,.5],[470,.48],[300,.62],[130,.8],[460,.8]];const who=shuffle(['bear','rabbit','cat','dog','panda','pig','chick']).slice(0,3);const pool=shuffle([...who,r===2?'rikki':'none',Math.random()<.3?'gem':'none']);
    this.spots=kinds.map((k,i)=>({k,x:pos[i][0],y:H*pos[i][1],who:pool[i],open:false,sh:0,t:0,peek:rand(0,6)}));this.need=this.spots.filter(s=>s.who!=='none'&&s.who!=='gem').length;this.found=0;
    say(`${this.SCENES[r][0]}で かくれんぼ！ ふーちゃんが おにだよ。 ボタンを タッチして 10まで かぞえよう`);},
  update(dt){this.t+=dt;for(const s of this.spots){if(s.sh>0){s.sh-=dt;if(s.sh<=0&&!s.open)this.reveal(s);}if(s.open)s.t+=dt;}
    if(this.ph==='next'&&this.t>2.4){this.round++;if(this.round>=3){this.ph='end';this.fin=.01;sfx('fanfare');confetti(80);say('かくれんぼ めいじん！ みんな みつけたね！');}else this.setup();}
    if(this.fin>0){this.fin+=dt;if(this.fin>2.6&&this.fin<9){this.fin=9;celebrate('hide',this.lucky);}}},
  reveal(s){s.open=true;s.t=0;if(s.who==='none'){sfx('whoosh');say(pick(['ここには いないね','あれれ？ いないよ','ざんねん！']));return;}
    if(s.who==='gem'){sfx('chin');confetti(40);this.lucky=true;say('キラキラの ほうせき みつけた！ ラッキー！');return;}
    this.found++;sfx('boing');rkCheer();burst(s.x,s.y-80,16,'star');hush();speak('みーつけた！');speak(s.who==='rikki'?'りっきー！':WORDS[s.who][0]+'さん！');if(s.who!=='rikki')speak(WORDS[s.who][1],'en');
    if(this.found>=this.need){this.ph='next';this.t=0;setTimeout(()=>{if(scene===this)say('みんな みつけた！');},1400);}},
  drawObj(c,s){const sh=s.sh>0?Math.sin(s.sh*50)*6:0;c.save();c.translate(s.x+sh,s.y);c.lineJoin='round';
    switch(s.k){case'bush':[[-60,-30,48],[60,-30,48],[0,-62,58],[-30,-8,46],[30,-8,46]].forEach(([a,b,r])=>{c.fillStyle=gfill(c,a-10,b-10,r,'#5cc46a');circ(c,a,b,r);});c.fillStyle='#ff6f91';for(const [a,b] of [[-40,-50],[20,-84],[48,-20]])circ(c,a,b,6);break;
      case'slide':c.fillStyle='#ffb03a';c.save();c.rotate(-.5);rr(c,-20,-120,40,160,10);c.fill();c.restore();c.fillStyle='#5aa8ff';rr(c,20,-140,70,140,8);c.fill();c.fillStyle='#8fd8ff';rr(c,30,-130,50,120,6);c.fill();break;
      case'bench':drawDecor(c,'bench',1.4);c.fillStyle='rgba(60,40,40,.2)';c.fillRect(-72,4,144,40);break;
      case'tree':tree(c,0,20,1.7);c.fillStyle='#8a5a3a';rr(c,-26,-90,52,110,10);c.fill();break;
      case'box':c.fillStyle=vfill(c,-100,0,'#e8b870',.15,-.1);rr(c,-66,-100,132,110,8);c.fill();c.strokeStyle='#b8803a';c.lineWidth=4;c.stroke();c.beginPath();c.moveTo(-66,-60);c.lineTo(66,-60);c.stroke();c.fillStyle='#ffd23a';c.fillRect(-10,-100,20,110);break;
      case'curtain':c.fillStyle='#8a6a4a';c.fillRect(-90,-230,180,10);for(let i=0;i<6;i++){c.fillStyle=i%2?'#ff9ac8':'#ffb3d6';c.beginPath();c.moveTo(-90+i*30,-222);c.lineTo(-60+i*30,-222);c.quadraticCurveTo(-60+i*30+Math.sin(T*2+i)*4,-100,-62+i*30,14);c.lineTo(-92+i*30,14);c.closePath();c.fill();}break;
      case'sofa':c.fillStyle='#b48cff';rr(c,-90,-90,180,60,24);c.fill();rr(c,-100,-40,200,50,16);c.fill();c.fillStyle='#c8a8ff';rr(c,-110,-70,34,80,14);c.fill();rr(c,76,-70,34,80,14);c.fill();break;
      case'bed':c.fillStyle='#fff';rr(c,-100,-60,200,64,14);c.fill();c.fillStyle='#8fd8ff';rr(c,-100,-66,150,70,16);c.fill();c.fillStyle='#c8905a';rr(c,-108,-110,20,120,6);c.fill();c.fillStyle='#fff6f0';rr(c,50,-80,46,28,12);c.fill();break;
      case'closet':c.fillStyle=vfill(c,-220,0,'#e8c090',.1,-.1);rr(c,-70,-220,140,230,10);c.fill();c.strokeStyle='#b8803a';c.lineWidth=4;c.beginPath();c.moveTo(0,-220);c.lineTo(0,10);c.stroke();c.fillStyle='#ffd23a';circ(c,-10,-110,5);circ(c,10,-110,5);break;
      case'rock':c.fillStyle=gfill(c,-20,-60,100,'#b8b0c0');c.beginPath();c.ellipse(0,-40,90,60,0,0,TAU);c.fill();c.fillStyle='#8ee07a';ell(c,-30,-86,24,8);break;
      case'log':c.fillStyle='#b07a4a';rr(c,-100,-70,200,70,34);c.fill();c.fillStyle='#e8c090';c.beginPath();c.ellipse(96,-35,16,35,0,0,TAU);c.fill();c.strokeStyle='#b07a4a';c.beginPath();c.ellipse(96,-35,8,18,0,0,TAU);c.stroke();break;
      case'mushroom':c.save();c.translate(0,-10);drawDecor(c,'mushroom',2.2);c.restore();break;}
    c.restore();},
  drawWho(c,s,peek){const k=s.who;if(k==='none')return;if(k==='gem'){if(!peek){c.fillStyle='#8ad8ff';star(c,s.x,s.y-60-s.t*20,28,12);c.fill();}return;}
    if(peek){const px=s.x+(s.k==='curtain'||s.k==='closet'?0:60),py=s.y-(s.k==='curtain'||s.k==='closet'?20:60);const v=Math.sin(T*2+s.peek);if(v<.4)return;c.save();c.beginPath();c.rect(px-60,py-80,120,80*(v-.4)/.6+10);c.clip();if(k==='rikki')drawRikki(c,px,py+60,{sc:1.4,t:T});else drawAnimal(c,k,px,py+80,.8,{t:T});c.restore();return;}
    const e=elastic(Math.min(1,s.t*2));if(k==='rikki')drawRikki(c,s.x,s.y-20-e*40,{sc:1.8*e,t:T,happy:1,clap:1});else drawAnimal(c,k,s.x,s.y-10-e*40,1*e,{t:T,happy:1,dance:1});},
  draw(c){const r=this.round;if(r===1){c.fillStyle='#fff0f6';c.fillRect(-400,0,W+800,H);c.fillStyle='#ffe0ee';for(let x=0;x<W;x+=40)c.fillRect(x,0,20,H*.55);c.fillStyle=vfill(c,H*.55,H,'#e8b890',.05,-.08);c.fillRect(-400,H*.55,W+800,H);}
    else if(r===2){skyBg(c,'#bfe8ff','#f0fff0',H*.35);c.fillStyle=vfill(c,H*.33,H,'#7cc85a',.05,-.1);c.fillRect(-400,H*.33,W+800,H);for(let k=0;k<7;k++)tree(c,k*95,H*.36,1.2,k%2?'#3a9a5a':'#4cae6a');}
    else{skyBg(c,'#8fd8ff','#e6f8ff',H*.36);cloud(c,140,H*.12,.7,true);c.fillStyle=vfill(c,H*.34,H,'#a8e07a',.05,-.08);c.fillRect(-400,H*.34,W+800,H);flowers(c,0,W,H*.4,H*.95,8);}
    if(this.ph==='count'){c.fillStyle='rgba(255,255,255,.5)';c.fillRect(-400,0,W+800,H);drawFuka(c,W/2-40,H*.62,{outfit:outfit(),t:T,sc:3.6,dir:3});drawRikki(c,W/2+120,H*.64,{sc:2.2,t:T});
      c.fillStyle='#fff';rr(c,W/2-150,H*.12,300,110,30);c.fill();c.strokeStyle='#ffb03a';c.lineWidth=5;c.stroke();c.fillStyle='#ff8c3a';c.font=`60px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.fillText(this.n?`${this.n}`:'?',W/2,H*.12+58);
      for(let i=0;i<10;i++){c.fillStyle=i<this.n?'#ffd23a':'#fff';circ(c,W/2-(9*26)+i*52,H*.3,16);c.strokeStyle='#e8a800';c.lineWidth=2;c.beginPath();c.arc(W/2-(9*26)+i*52,H*.3,16,0,TAU);c.stroke();}
      drawBtn(c,W/2,H*.86,64,'#ffb03a','next',true);c.fillStyle='#8a5a1a';c.font=`800 22px ${FONT}`;c.fillText(this.n<10?'かぞえる':'',W/2,H*.86+88);return;}
    const sp=this.spots.slice().sort((a,b)=>a.y-b.y);for(const s of sp){if(!s.open)this.drawWho(c,s,true);this.drawObj(c,s);if(s.open)this.drawWho(c,s,false);}
    c.fillStyle='rgba(255,255,255,.9)';rr(c,20,112,250,50,25);c.fill();c.fillStyle='#ff8c3a';c.font=`800 20px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(`みつけた ${this.found} / ${this.need}`,145,137);
    for(let i=0;i<3;i++){c.fillStyle=i<this.round?'#ffd23a':i===this.round?'#fff':'rgba(255,255,255,.5)';star(c,W-150+i*50,137,18,8);c.fill();}
    drawFuka(c,W/2,H-20,{outfit:outfit(),t:T,sc:2.2,point:this.ph==='seek',cheer:this.ph!=='seek'});},
  down(x,y){if(this.ph==='count'){if(hitC(x,y,W/2,H*.86,80)&&this.n<10){this.n++;sfx('pop');hush();speak(NUM10[this.n-1]);if(this.n===10){setTimeout(()=>{if(scene===this){hush();speak('もういいかい？');}},700);setTimeout(()=>{if(scene===this){hush();speak('もういいよ〜！');this.ph='seek';this.t=0;bub={text:'もういいよ〜！ どこに かくれたかな？',t:0,life:3};}},2300);}}return;}
    if(this.ph!=='seek')return;for(const s of this.spots){if(!s.open&&s.sh<=0&&Math.abs(x-s.x)<100&&y>s.y-200&&y<s.y+30){s.sh=.45;sfx('squish');return;}}},
  hint(){if(this.ph==='count')return this.n<10?{x:W/2,y:H*.86}:null;if(this.ph!=='seek'||this.t<8)return null;const s=this.spots.find(s=>!s.open&&s.who!=='none'&&s.who!=='gem');return s?{x:s.x,y:s.y-80}:null;},
  hintText(){return this.ph==='count'?'ボタンで 10まで かぞえよう':'かくれていそうな ところを タッチ！';}};

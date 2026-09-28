// ================= うけつけ（ばんごう よび） =================
const ANK=['bear','rabbit','cat','dog','panda','pig','chick','hippo'];
SCN.reception={bg:'#fff6e8',song:'clinic',
  enter(){const lv=lvOf('reception');this.maxN=lv<1?7:lv<3?10:20;this.round=0;this.N=6;this.miss=0;this.fin=0;this.lock=0;this.lay();
    const nums=shuffle([...Array(this.maxN)].map((_,i)=>i+1)).slice(0,5);this.seats=nums.map((n,i)=>({k:pick(ANK),n,x:-120-i*140,tx:this.seatX(i),st:'in',shake:0,hop:0,i}));
    say('うけつけの おしごと！ でんこうけいじばんの ばんごうの ひとを タッチして よんであげてね');setTimeout(()=>{if(scene===this)this.call();},3600);},
  lay(){this.by=H*.6;},
  seatX(i){return 66+i*117;},
  call(){const lv=lvOf('reception');const cand=this.seats.filter(s=>s.st==='sit'||s.st==='in');if(!cand.length)return;const s=pick(cand);this.target=s.n;
    this.mode=lv>=1&&Math.random()<.3&&s.n<=10?'dots':lv>=2&&Math.random()<.35?'en':'num';this.flash=1;sfx('bell');this.callSay();},
  callSay(){const n=this.target;hush();if(this.mode==='dots'){speak('この かずの ばんごうの かた、 どうぞ！');}else if(this.mode==='en'){speak('えいごで よぶよ！');speak(`Number ${n}, please!`,'en');}else{speak(`${n}ばんの かた、 どうぞ！`);speak(`Number ${n}`,'en');}
    bub={text:this.mode==='dots'?'この かずの ばんごうの かた どうぞ！':this.mode==='en'?'えいごで よぶよ！ Number '+numEn(n)+'!':`${n}ばんの かた どうぞ！`,t:0,life:3.2};},
  update(dt){if(this.flash>0)this.flash-=dt;for(const s of this.seats){if(s.shake>0)s.shake-=dt;if(s.hop>0)s.hop-=dt*2;
      if(s.st==='in'){s.x+=Math.sign(s.tx-s.x)*Math.min(Math.abs(s.tx-s.x),340*dt);if(Math.abs(s.tx-s.x)<1)s.st='sit';}
      else if(s.st==='out'){s.x+=330*dt;if(s.x>W+120)s.gone=1;}}
    for(let i=0;i<this.seats.length;i++){const s=this.seats[i];if(s.gone){const used=this.seats.map(q=>q.n);if(used.length>=this.maxN)used.length=0;let n;do n=1+Math.floor(Math.random()*this.maxN);while(used.includes(n));this.seats[i]={k:pick(ANK),n,x:-120,tx:this.seatX(s.i),st:'in',shake:0,hop:0,i:s.i};}}
    if(this.fin>0){this.fin+=dt;if(this.fin>1.6&&this.fin<9){this.fin=9;celebrate('reception',starsFor(this.miss));}}},
  draw(c){const by=this.by;roomBg(c,'#fff0da','#f0d8b8',by-70,'#fff6e6');
    // door
    c.fillStyle='#bfe0ff';rr(c,W-120,by-330,100,200,[14,14,0,0]);c.fill();c.strokeStyle='#8ab0d8';c.lineWidth=5;c.stroke();c.fillStyle='#fff';rr(c,W-112,by-370,84,32,10);c.fill();txt(c,'しんさつしつ',W-70,by-354,13,'#5a88c8');crossSign(c,W-70,by-280,14);
    // board
    const bx=W/2-40,byy=176;panel(c,bx-170,byy-10,340,170,24,'#3a3050','#ffc93c',6);txt(c,'よびだし ばんごう',bx,byy+16,20,'#ffe88a');
    const f=this.flash>0&&Math.sin(this.flash*30)>0;if(this.target){if(this.mode==='dots'){const n=this.target;for(let i=0;i<10;i++){const x=bx-104+(i%5)*52,y=byy+64+Math.floor(i/5)*50;c.strokeStyle='#8a7aa8';c.lineWidth=2;c.strokeRect(x-24,y-23,48,46);if(i<n){c.fillStyle=f?'#fff':'#ff9a3a';circ(c,x,y,17);}}}
      else if(this.mode==='en'){txt(c,numEn(this.target),bx,byy+92,numEn(this.target).length>8?40:56,f?'#fff':'#7ae0ff',undefined,POP,400);}
      else{txt(c,String(this.target),bx,byy+94,96,f?'#fff':'#ff9a3a',undefined,POP,400);}}
    // bench
    c.fillStyle='#c8905a';rr(c,20,by-46,W-150,22,8);c.fill();c.fillStyle='#a8703a';c.fillRect(40,by-24,14,34);c.fillRect(W-160,by-24,14,34);
    for(const s of this.seats){const hop=s.st!=='sit'?Math.abs(Math.sin(T*8))*.5:s.hop;drawAnimal(c,s.k,s.x,by+2,.74,{t:T+s.i,hop,shake:s.shake,happy:s.st==='out'||s.hop>0,sad:s.shake>0});
      if(s.st!=='out'){c.save();c.translate(s.x,by-150+Math.sin(T*2+s.i)*3);c.rotate(Math.sin(T*1.5+s.i)*.05);MED.ticket(c,0,0,1.05,{n:s.n});c.restore();}}
    // desk
    const dy=H-150;c.fillStyle=vfill(c,dy,H,'#ffb3d0',.1,-.1);rr(c,-20,dy,W+40,200,[30,30,0,0]);c.fill();c.fillStyle='#fff';rr(c,-20,dy,W+40,20,[30,30,0,0]);c.fill();txt(c,'うけつけ',W/2,dy+60,34,'#fff',undefined,POP,400);
    fu(c,96,dy+20,2.5,{point:!this.fin,cheer:this.fin>0});rk(this,c,W-90,dy+14,1.8,{happy:this.fin>0});
    stepDots(c,this.N,this.round);},
  down(x,y){if(this.fin)return;const by=this.by;if(Math.abs(x-(W/2-40))<170&&y>166&&y<336){sfx('tap');this.callSay();return;}
    if(this.lock>T)return;
    for(const s of this.seats){if(s.st!=='sit')continue;if(Math.abs(x-s.x)<58&&y>by-190&&y<by+10){
      if(s.n===this.target){s.st='out';s.hop=1;sfx('ding');burst(s.x,by-120,14,'star');sayNum(s.n,'',' ばん');this.round++;this.target=null;this.lock=T+1;
        if(this.round>=this.N){this.fin=.01;RK.clap=2;}else setTimeout(()=>{if(scene===this&&!cel)this.call();},2200);}
      else{s.shake=.6;this.miss++;sfx('no');hush();speak(`ぼくは ${s.n}ばん だよ`);speak(String(s.n),'en');bub={text:`ぼくは ${s.n}ばん だよ`,t:0,life:2.4};}
      return;}}},
  hint(){if(!this.target||this.fin)return null;const s=this.seats.find(q=>q.n===this.target&&q.st==='sit');return s?{x:s.x,y:this.by-60}:null;},
  hintText(){return this.target?'ふだの ばんごうを よく みてね':'';}};

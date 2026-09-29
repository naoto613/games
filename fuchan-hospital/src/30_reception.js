// ================= うけつけ（ばんごう よび） =================
SCN.reception={bg:'#fff6e8',song:'clinic',
  enter(){this.target=null;this.flash=0;const lv=lvOf('reception');this.lv=lv;this.maxN=lv<1?7:lv<3?10:20;this.round=0;this.N=6+Math.min(2,lv);this.miss=0;this.fin=0;this.lock=0;this.lay();
    this.modes=['num','num','dots','fingers'].concat(lv>=1?['en','dots']:[]).concat(lv>=2?['plus','en']:[]);this.door=0;this.events=shuffle(['sleepy','urgent','none','sleepy']).slice(0,2);
    this.theme=pick([['#fff0da','#f0d8b8','#fff6e6','#ffb3d0'],['#eaf6ff','#d4e6f0','#f4faff','#9ad0ff'],['#f4ffe8','#dcecc8','#fbfff4','#bfe8a0'],['#fff0f8','#f0d8e8','#fff8fc','#e0b8ff']]);
    const nums=shuffle([...Array(this.maxN)].map((_,i)=>i+1)).slice(0,5);this.seats=nums.map((n,i)=>Object.assign(newPatient(),{n,x:-120-i*140,tx:this.seatX(i),st:'in',shake:0,hop:0,i,sleep:0,urgent:0}));
    say('うけつけの おしごと！ でんこうけいじばんの ばんごうの ひとを タッチして よんであげてね');setTimeout(()=>{if(scene===this)this.call();},3600);},
  lay(){this.by=H*.6;},
  seatX(i){return 66+i*117;},
  call(){const cand=this.seats.filter(s=>s.st==='sit'||s.st==='in');if(!cand.length)return;
    const ev=this.round===2?this.events[0]:this.round===4?this.events[1]:'none';
    if(ev==='urgent'){const s=pick(cand);s.urgent=1;this.target=s.n;this.mode='urgent';this.flash=1;sfx('siren1');hush();speak('きゅうかんの かんじゃさんです！ あかい ふだの ひとを さきに よんでね');bub={text:'きゅうかん！ あかい ふだの ひとを さきに！',t:0,life:3};return;}
    const s=pick(cand);if(ev==='sleepy')s.sleep=2;this.target=s.n;
    let m=pick(this.modes);if((m==='dots'||m==='fingers')&&s.n>10)m='num';if(m==='plus'&&s.n<2)m='num';this.mode=m;if(m==='plus'){this.pa=1+Math.floor(Math.random()*(s.n-1));this.pb=s.n-this.pa;}
    this.flash=1;sfx('bell');this.callSay();},
  callSay(){const n=this.target;hush();const m=this.mode;
    if(m==='dots'){speak('この かずの ばんごうの かた、 どうぞ！');bub={text:'この かずの ばんごうの かた どうぞ！',t:0,life:3};}
    else if(m==='fingers'){speak('ゆびの かずの ばんごうの かた、 どうぞ！');bub={text:'ゆびの かずの ばんごうの かた どうぞ！',t:0,life:3};}
    else if(m==='en'){speak('えいごで よぶよ！');speak(`Number ${n}, please!`,'en');bub={text:'えいごで よぶよ！ Number '+numEn(n)+'!',t:0,life:3.2};}
    else if(m==='plus'){speak(`${this.pa} たす ${this.pb} ばんの かた！`);bub={text:`${this.pa} たす ${this.pb} ばんの かた どうぞ！`,t:0,life:3.4};}
    else if(m==='urgent'){speak('あかい ふだの ひとを さきに！');}
    else{speak(`${n}ばんの かた、 どうぞ！`);speak(`Number ${n}`,'en');bub={text:`${n}ばんの かた どうぞ！`,t:0,life:3};}
    const s=this.seats.find(q=>q.n===n&&q.sleep);if(s)setTimeout(()=>{if(scene===this&&s.sleep)say('あれ？ ねむっちゃってる！ トントンして おこしてあげて');},2400);},
  update(dt){if(this.flash>0)this.flash-=dt;if(this.door>0)this.door-=dt;for(const s of this.seats){if(s.shake>0)s.shake-=dt;if(s.hop>0)s.hop-=dt*2;
      if(s.st==='in'){s.x+=Math.sign(s.tx-s.x)*Math.min(Math.abs(s.tx-s.x),340*dt);if(Math.abs(s.tx-s.x)<1)s.st='sit';}
      else if(s.st==='out'){s.x+=330*dt;if(s.x>W-150)this.door=.6;if(s.x>W+120)s.gone=1;}}
    for(let i=0;i<this.seats.length;i++){const s=this.seats[i];if(s.gone){const used=this.seats.map(q=>q.n);let n,g=0;do n=1+Math.floor(Math.random()*this.maxN);while(used.includes(n)&&g++<50);this.seats[i]=Object.assign(newPatient(),{n,x:-120,tx:this.seatX(s.i),st:'in',shake:0,hop:0,i:s.i,sleep:0,urgent:0});}}
    if(this.fin>0){this.fin+=dt;if(this.fin>2.2&&this.fin<9){this.fin=9;celebrate('reception',starsFor(this.miss));}}},
  drawBoard(c,bx,byy){panel(c,bx-170,byy-10,340,170,24,'#3a3050','#ffc93c',6);txt(c,'よびだし ばんごう',bx,byy+16,20,'#ffe88a');for(let i=0;i<12;i++){c.fillStyle=Math.floor(T*4+i)%3?'#ffd23a':'#ff8a3a';circ(c,bx-160+i*29,byy-4,3);}
    const f=this.flash>0&&Math.sin(this.flash*30)>0,n=this.target;if(!n)return;const m=this.mode;
    if(m==='dots'){for(let i=0;i<10;i++){const x=bx-104+(i%5)*52,y=byy+64+Math.floor(i/5)*50;c.strokeStyle='#8a7aa8';c.lineWidth=2;c.strokeRect(x-24,y-23,48,46);if(i<n){c.fillStyle=f?'#fff':'#ff9a3a';circ(c,x,y,17);}}}
    else if(m==='fingers'){c.fillStyle='#fff';rr(c,bx-150,byy+34,300,112,14);c.fill();drawFingers(c,bx,byy+110,n,1.25);}
    else if(m==='en')txt(c,numEn(n),bx,byy+92,numEn(n).length>8?40:56,f?'#fff':'#7ae0ff',undefined,POP,400);
    else if(m==='plus')txt(c,`${this.pa} + ${this.pb} = ?`,bx,byy+94,62,f?'#fff':'#8aff9a',undefined,POP,400);
    else if(m==='urgent'){c.fillStyle=f?'#fff':'#ff4d6d';rr(c,bx-80,byy+44,160,90,10);c.fill();txt(c,'きゅうかん',bx,byy+90,28,f?'#ff4d6d':'#fff');}
    else txt(c,String(n),bx,byy+94,96,f?'#fff':'#ff9a3a',undefined,POP,400);},
  draw(c){const by=this.by,th=this.theme;roomBg(c,th[0],th[1],by-70,th[2],[['window',90,by-270,1,110,90,th[3]],['plant',30,by-70,.8],['clock',W-70,176,.7],['aed',W/2+60,by-250,.8],['extinguisher',36,by-150,.8]]);
    const dop=this.door>0;c.fillStyle='#bfe0ff';rr(c,W-120,by-330,100,260,[14,14,0,0]);c.fill();if(dop){c.fillStyle='#fff8d0';rr(c,W-112,by-322,84,252,[10,10,0,0]);c.fill();}c.strokeStyle='#8ab0d8';c.lineWidth=5;rr(c,W-120,by-330,100,260,[14,14,0,0]);c.stroke();c.fillStyle='#fff';rr(c,W-112,by-372,84,32,10);c.fill();txt(c,'しんさつしつ',W-70,by-356,13,'#5a88c8');crossSign(c,W-70,by-280,14);
    this.drawBoard(c,W/2-40,176);
    c.fillStyle='#c8905a';rr(c,20,by-46,W-150,22,8);c.fill();c.fillStyle='#e0a870';rr(c,20,by-46,W-150,8,4);c.fill();c.fillStyle='#a8703a';c.fillRect(40,by-24,14,34);c.fillRect(W-160,by-24,14,34);
    for(const s of this.seats){const hop=s.st!=='sit'?Math.abs(Math.sin(T*8))*.5:s.hop;drawPt(c,s,s.x,by+2,.74,{t:T+s.i,hop,shake:s.shake,happy:s.st==='out'||s.hop>0,sad:s.shake>0,look:s.st==='sit'?-.5:0});
      if(s.sleep){c.fillStyle='rgba(120,100,160,.35)';ell(c,s.x,by-64,28,10);for(let k=0;k<3;k++){const zt=(T*.7+k*.33)%1;c.globalAlpha=1-zt;txt(c,'Z',s.x+20+zt*30,by-120-zt*40,16+k*4,'#8a7aa8');}c.globalAlpha=1;}
      if(s.st!=='out'){c.save();c.translate(s.x,by-150+Math.sin(T*2+s.i)*3);c.rotate(Math.sin(T*1.5+s.i)*.05);MED.ticket(c,0,0,1.05,{n:s.n});if(s.urgent){c.strokeStyle='#ff4d6d';c.lineWidth=6;rr(c,-27,-33,54,66,8);c.stroke();}c.restore();}}
    const dy=H-150;c.fillStyle=vfill(c,dy,H,'#ffb3d0',.1,-.1);rr(c,-20,dy,W+40,200,[30,30,0,0]);c.fill();c.fillStyle='#fff';rr(c,-20,dy,W+40,20,[30,30,0,0]);c.fill();txt(c,'うけつけ',W/2,dy+64,34,'#fff',undefined,POP,400);MED.phone(c,W/2+130,dy+60,.8);MED.kit(c,W/2-140,dy+60,.8);
    fu(c,96,dy+20,2.5,{point:!this.fin});rk(this,c,W-90,dy+14,1.8);
    stepDots(c,this.N,this.round);},
  down(x,y){if(this.fin)return;const by=this.by;if(Math.abs(x-(W/2-40))<170&&y>166&&y<336){sfx('tap');this.callSay();return;}
    if(this.lock>T)return;
    for(const s of this.seats){if(s.st!=='sit')continue;if(Math.abs(x-s.x)<58&&y>by-190&&y<by+10){
      if(s.n===this.target){if(s.sleep){s.sleep--;s.hop=.6;sfx('boing');hush();speak(s.sleep===0?'ふあ〜 おはよう！':'トントン');return;}
        s.st='out';s.hop=1;s.urgent=0;good(s.x,by-120);sayNum(s.n,'',' ばん');this.round++;this.target=null;this.lock=T+1;
        if(this.round>=this.N){this.fin=.01;setTimeout(()=>{if(scene===this)banner('うけつけ かんりょう！','#ffb03a');},400);}else setTimeout(()=>{if(scene===this&&!cel)this.call();},2200);}
      else{s.shake=.6;this.miss++;bad();hush();speak(this.mode==='urgent'?'きゅうかんの ひとが さきだよ':`ぼくは ${s.n}ばん だよ`);if(this.mode!=='urgent')speak(String(s.n),'en');bub={text:`ぼくは ${s.n}ばん だよ`,t:0,life:2.4};}
      return;}}},
  hint(){if(!this.target||this.fin)return null;const s=this.seats.find(q=>q.n===this.target&&q.st==='sit');return s?{x:s.x,y:this.by-60}:null;},
  hintText(){return this.target?'ふだの ばんごうを よく みてね':'';}};

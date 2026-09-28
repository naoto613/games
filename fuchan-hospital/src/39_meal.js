// ================= にゅういん ごはん（3しょくの えいよう） =================
const FOODG={red:['fish','egg','milk','cheese','meat'],yellow:['bread','onigiri','corn'],green:['carrot','tomato','apple','grapes','banana','broccoli']};
const GINFO={red:['あか','#ff4d6d','からだを つくる','red'],yellow:['きいろ','#f0b800','ちからに なる','yellow'],green:['みどり','#3cb85a','ちょうしを ととのえる','green']};
const GKEYS=['red','yellow','green'];
SCN.meal={bg:'#f0fff0',song:'fuwa',
  enter(){const lv=lvOf('meal');const per=lv<1?2:3;this.queue=shuffle(GKEYS.flatMap(g=>shuffle(FOODG[g]).slice(0,per).map(k=>({k,g}))));this.total=this.queue.length;this.placed={red:[],yellow:[],green:[]};this.told={};this.miss=0;this.fin=0;this.ph='sort';this.eat=0;this.k=pick(['bear','rabbit','panda','pig','cat','dog']);this.lay();
    say(`${WORDS[this.k][0]}さんは にゅういんちゅう。 げんきに なる ごはんを つくろう！ たべものを おなじ いろの おさらに のせてね`);setTimeout(()=>{if(scene===this)this.nextFood();},3800);},
  lay(){this.bedY=H*.4;this.plY=H*.64;},
  plate(i){return{x:W/2+(i-1)*190,y:this.plY};},
  nextFood(){const f=this.queue.shift();if(!f){this.cur=null;this.ph='eat';this.eat=.01;hush();speak(`ぜんぶで ${this.total}こ！ いただきます！`);speak(`${numEn(this.total)} foods!`,'en');return;}this.cur=new Dr({k:f.k,hx:W/2,hy:H-90,r:60});this.cur.g=f.g;},
  update(dt){if(this.cur)this.cur.upd(dt);
    if(this.ph==='eat'){this.eat+=dt;if(Math.random()<dt*3)sfx('munch');if(this.eat>4&&!this.cured){this.cured=1;sfx('fanfare');RK.clap=2;confetti(50);say('ごちそうさま！ すっかり げんきに なった！ たいいん おめでとう！');}if(this.eat>7&&!this.fin)this.fin=.01;}
    if(this.fin>0){this.fin+=dt;if(this.fin>.3&&this.fin<9){this.fin=9;celebrate('meal',starsFor(this.miss));}}},
  draw(c){roomBg(c,'#eaffea','#d8f0d0',this.bedY+60,'#f4fff4');const bx=W/2+40,by=this.bedY;
    // window
    c.fillStyle='#bfe8ff';rr(c,40,150,130,110,10);c.fill();c.strokeStyle='#fff';c.lineWidth=8;c.stroke();c.beginPath();c.moveTo(105,150);c.lineTo(105,260);c.stroke();c.fillStyle='#fff';circ(c,80,190,14);circ(c,96,184,16);
    // bed + patient
    const up=this.cured?Math.min(1,(this.eat-4)*1.5):0;
    c.fillStyle='#d8e4f4';rr(c,bx-170,by-150,20,180,8);c.fill();c.fillStyle='#fff';rr(c,bx-160,by-40,330,60,16);c.fill();c.strokeStyle='#b8c8e0';c.lineWidth=4;c.stroke();c.fillStyle='#9ab0d0';c.fillRect(bx-150,by+20,12,50);c.fillRect(bx+146,by+20,12,50);
    if(!this.cured){c.fillStyle='#fff';rr(c,bx-150,by-110,90,50,20);c.fill();drawAnimal(c,this.k,bx-20,by-6,1.05,{t:T,sad:this.ph==='sort',eat:this.ph==='eat'?1:0});c.fillStyle='#8ad0ff';rr(c,bx-110,by-54,280,52,16);c.fill();c.strokeStyle='#5aa8e8';c.lineWidth=3;c.stroke();c.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<5;i++)circ(c,bx-80+i*56,by-28,8);}
    else{drawAnimal(c,this.k,bx-20+Math.sin(T*3)*30*up,by+60-up*20,1.05,{t:T,happy:1,dance:1});c.fillStyle='#8ad0ff';rr(c,bx-110,by-54,280,52,16);c.fill();}
    if(this.ph==='sort'){c.fillStyle='#fff';rr(c,W-120,by-230,100,60,14);c.fill();txt(c,`${this.total-this.queue.length-(this.cur?1:0)} / ${this.total}`,W-70,by-200,22,'#4cc86a');}
    // tray + plates
    c.fillStyle='#f4d8a8';rr(c,20,this.plY-100,W-40,200,24);c.fill();c.strokeStyle='#d8b078';c.lineWidth=4;c.stroke();
    GKEYS.forEach((g,i)=>{const p=this.plate(i),G=GINFO[g];c.fillStyle='#fff';circ(c,p.x,p.y,80);c.strokeStyle=G[1];c.lineWidth=10;c.beginPath();c.arc(p.x,p.y,76,0,TAU);c.stroke();c.fillStyle=G[1];rr(c,p.x-50,p.y-112,100,30,15);c.fill();txt(c,G[0],p.x,p.y-97,18,'#fff');txt(c,G[2],p.x,p.y+104,14,shade(G[1],-.3));
      this.placed[g].forEach((k,j)=>{const a=j/Math.max(1,this.placed[g].length)*TAU-Math.PI/2,r=this.placed[g].length>1?38:0;if(this.ph==='eat'&&this.eat>1+j*.5+i*.9)return;drawThing(c,k,p.x+Math.cos(a)*r,p.y+Math.sin(a)*r,this.placed[g].length>1?.72:.95);});});
    if(this.cur){tray(c,H-90,130);if(this.cur.held){const i=GKEYS.indexOf(this.cur.g);}this.cur.draw(c,1.5);}
    fu(c,80,this.bedY+150,2.1,{point:this.ph==='sort',cheer:!!this.cured});rk(this,c,W-50,H-160,1.4,{happy:!!this.cured});},
  down(x,y){if(this.cur&&this.cur.hit(x,y)){this.cur.held=true;sfx('tap');sayWord(this.cur.k);}},
  move(x,y){if(this.cur&&this.cur.held){this.cur.x=x;this.cur.y=y;}},
  up(x,y){const f=this.cur;if(!f||!f.held)return;f.held=false;const i=GKEYS.findIndex((g,i)=>{const p=this.plate(i);return Math.hypot(x-p.x,y-p.y)<95;});if(i<0)return;const g=GKEYS[i];
    if(g===f.g){this.placed[g].push(f.k);sfx('ding');burst(this.plate(i).x,this.plate(i).y,8,'star');const G=GINFO[g];if(!this.told[g]){this.told[g]=1;hush();speak(`${G[0]}の なかま！ ${G[2]} よ`);speak(G[3],'en');}this.cur=null;setTimeout(()=>{if(scene===this)this.nextFood();},this.told[g]===1?1300:500);this.told[g]=2;}
    else{sfx('no');this.miss++;const G=GINFO[f.g];hush();speak(`${WORDS[f.k][0]}は ${G[0]}の なかま。 ${G[2]}よ`);bub={text:`${WORDS[f.k][0]}は ${G[0]}の なかま`,t:0,life:2.6};}},
  hint(){if(!this.cur||this.cur.held)return null;const i=GKEYS.indexOf(this.cur.g);const p=this.plate(i);return{x:this.cur.hx,y:this.cur.hy,x2:p.x,y2:p.y};},
  hintText(){if(!this.cur)return'';const G=GINFO[this.cur.g];return`${WORDS[this.cur.k][0]}は ${G[0]}の おさらだよ`;}};

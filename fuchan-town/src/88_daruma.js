// ================= daruma-san ga koronda =================
SCN.daruma={bg:'#bfe9ff',song:null,
  ONI:[['bear','くまさん'],['cat','ねこさん'],['panda','パンダさん']],
  enter(){this.round=0;this.fin=0;this.caughtAll=0;this.setup();},
  setup(){this.ph='ready';this.t=0;this.p=0;this.hold=false;this.caught=0;this.touch=false;this.oni=this.ONI[this.round];this.st='chant';this.look=0;this.syl=0;this.grace=0;this.flash=0;this.runT=0;
    this.fr=[{k:'rabbit',p:0,out:false,x:130},{k:'dog',p:0,out:false,x:470}];say(`だるまさんが ころんだ！ おには ${this.oni[1]}。 ${this.oni[1]}が うしろを むいている あいだに すすもう！ ふりむいたら ストップ！`);setTimeout(()=>{if(scene===this&&this.ph==='ready'){this.ph='play';this.startChant();}},4200);},
  startChant(){this.st='chant';this.t=0;const r=this.round;this.dur=pick([2.6,3.2,4,2.2].slice(0,2+r));this.fake=r>=1&&Math.random()<.3;this.syl=0;hush();speak('だるまさんが ころんだ',null);},
  PH:'だるまさんがころんだ',
  Y(p){return lerp(H*.86,H*.4,p);},S(p){return lerp(2.5,1.2,p);},
  update(dt){this.t+=dt;if(this.flash>0)this.flash-=dt;if(this.grace>0)this.grace-=dt;
    if(this.fin>0){this.fin+=dt;if(this.fin>3&&this.fin<9){this.fin=9;celebrate('daruma',this.caughtAll===0);}}
    if(this.ph!=='play')return;
    if(this.st==='chant'){const k=this.t/this.dur;const n=Math.min(10,Math.floor(k*10)+1);if(n!==this.syl){this.syl=n;tone(mtof(64+[0,2,4,2,0,2,4,7,4,0][n-1]),.18,'triangle',.18);}
      if(this.fake&&k>.55&&!this.faked){this.faked=1;this.st='pause';this.t=0;return;}
      if(this.hold)this.p=Math.min(1,this.p+dt*.085);for(const f of this.fr)if(!f.out)f.p=Math.min(.92,f.p+dt*rand(.05,.09));
      if(this.t>=this.dur){this.st='turn';this.t=0;this.grace=.55;sfx('boing');this.look=0;}}
    else if(this.st==='pause'){if(this.hold)this.p=Math.min(1,this.p+dt*.085);if(this.t>.7){this.st='chant';this.t=this.dur*.56;}}
    else if(this.st==='turn'){this.look+=dt;if(this.grace<=0&&this.hold&&!this.caughtNow){this.caughtNow=1;this.caught++;this.caughtAll++;sfx('no');this.flash=.6;say(pick([`${this.oni[1]}「うごいた〜！」 ちょっと もどってね`,'あっ！ みつかった！ ちょっと もどろう']));this.p=Math.max(0,this.p-.25);}
      for(const f of this.fr)if(!f.out&&this.look>.4&&this.look<.45&&Math.random()<.18){f.out=true;f.p=Math.max(0,f.p-.3);setTimeout(()=>{f.out=false;},2500);}
      if(this.look>1.6){this.caughtNow=0;if(this.p>=.92){this.st='near';this.t=0;say('おにの すぐ そば！ タッチボタンで タッチ！');}else this.startChant();}}
    else if(this.st==='near'){if(this.t>6){this.startChant();}}
    else if(this.st==='run'){this.runT+=dt;this.p=Math.max(0,this.p-dt*.5);for(const f of this.fr)f.p=Math.max(0,f.p-dt*.5);if(this.runT>2.4){this.round++;if(this.round>=3){this.ph='end';this.fin=.01;sfx('fanfare');confetti(90);say(this.caughtAll===0?'いちども みつからなかった！ だるまさん めいじん！':'だるまさんが ころんだ クリア！ たのしかったね！');}else{sfx('bell');this.setup();}}}
  },
  draw(c){skyBg(c,'#8fd8ff','#e6f8ff',H*.36);cloud(c,120,H*.1,.7,true);cloud(c,480,H*.16,.5);c.fillStyle=vfill(c,H*.34,H,'#a8e07a',.05,-.08);c.fillRect(-400,H*.34,W+800,H);
    c.fillStyle='#f3e3c8';c.beginPath();c.moveTo(W/2-60,H*.36);c.lineTo(W/2+60,H*.36);c.lineTo(W/2+230,H);c.lineTo(W/2-230,H);c.closePath();c.fill();for(let i=0;i<8;i++){const y=lerp(H*.4,H*.95,i/7);c.fillStyle='rgba(200,170,130,.35)';c.fillRect(W/2-lerp(55,220,(y-H*.36)/(H*.64)),y,lerp(110,440,(y-H*.36)/(H*.64)),3);}
    tree(c,W/2,H*.36,1.8,'#5cc46a');flowers(c,0,W,H*.4,H*.9,4);
    const looking=this.st==='turn'||this.st==='near'||this.st==='run';drawAnimal(c,this.oni[0],W/2,H*.37,.95,{t:T,happy:this.st==='run',shake:this.flash>0?.4:0});if(!looking){c.fillStyle=vfill(c,H*.25,H*.37,'#8a5a3a',.1,-.1);rr(c,W/2-44,H*.25,88,120,30);c.fill();}
    if(this.st==='chant'||this.st==='pause'){const n=this.st==='pause'?6:this.syl;c.font=`800 30px ${FONT}`;c.textAlign='center';c.textBaseline='middle';const L=[...this.PH];const tw=L.length*30;L.forEach((ch,i)=>{c.fillStyle=i<n?'#ff5f6f':'rgba(255,255,255,.7)';c.fillText(ch,W/2-tw/2+15+i*30,H*.2);});if(this.st==='pause'){c.fillStyle='#ff5f6f';c.fillText('…',W/2+tw/2+20,H*.2);}}
    if(looking&&this.st!=='run'){c.fillStyle='#ff3a5a';c.font=`42px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.fillText('ストップ！',W/2,H*.2);c.fillStyle='rgba(255,60,90,.12)';c.fillRect(-400,0,W+800,H);}
    const ents=[...this.fr.map(f=>({f,y:this.Y(f.p)})),{me:1,y:this.Y(this.p)}].sort((a,b)=>a.y-b.y);
    for(const e of ents){if(e.me){const x=W/2+Math.sin(this.p*20)*6*(this.hold&&!looking?1:0);drawFuka(c,x,e.y,{outfit:outfit(),t:T,sc:this.S(this.p),dir:this.st==='run'?0:3,moving:this.hold&&this.st!=='turn'||this.st==='run',oh:this.flash>0});}else{const f=e.f;const sx=lerp(f.x,W/2+(f.x<W/2?-80:80),f.p);drawAnimal(c,f.k,sx,e.y,this.S(f.p)*.5,{t:T,sad:f.out,hop:this.st==='chant'?Math.abs(Math.sin(T*8))*.4:0});}}
    drawRikki(c,60,H*.9,{sc:1.7,t:T,clap:RK.clap});this.rkPos={x:60,y:H*.9,sc:1.7};
    c.fillStyle='rgba(255,255,255,.9)';rr(c,20,112,260,46,23);c.fill();c.fillStyle='#3aa060';rr(c,20,112,260*this.p,46,23);c.fill();c.fillStyle='#5a3a2a';c.font=`800 18px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('おにまで',150,135);
    for(let i=0;i<3;i++){c.fillStyle=i<this.round?'#ffd23a':i===this.round?'#fff':'rgba(255,255,255,.5)';star(c,W-150+i*50,135,18,8);c.fill();}
    if(this.ph==='play'&&this.st==='near'){drawBtn(c,W/2+160,H*.6,64,'#ff5f6f','check',true);c.fillStyle='#fff';c.font=`800 24px ${FONT}`;c.textAlign='center';c.fillText('タッチ！',W/2+160,H*.6+90);}
    else if(this.ph==='play'&&this.st!=='run'){const on=this.hold;c.fillStyle=on?'#3aa060':'#6cd08a';circ(c,W-110,H-110,76);c.fillStyle='#fff';c.font=`800 28px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('すすむ',W-110,H-120);c.font=`800 15px ${FONT}`;c.fillText('おしてる あいだ',W-110,H-86);}
    if(this.st==='run'){c.font=`44px ${POP}`;c.textAlign='center';c.fillStyle='#ff5fa2';c.fillText('タッチ！ にげろ〜！',W/2,H*.2);}},
  down(x,y){if(this.ph!=='play')return;if(this.st==='near'&&hitC(x,y,W/2+160,H*.6,90)){this.st='run';this.runT=0;sfx('fanfare');rkCheer();burst(W/2,H*.35,20,'star');say(`${this.oni[1]}に タッチ！ みんな にげろ〜！`);return;}
    if(this.st!=='run'&&hitC(x,y,W-110,H-110,90))this.hold=true;},
  up(){this.hold=false;},
  hint(){if(this.ph!=='play')return null;if(this.st==='near')return{x:W/2+160,y:H*.6};if(this.st==='chant')return{x:W-110,y:H-110};return null;},
  hintText(){return this.st==='near'?'タッチボタンを おして！':'だるまさんが ころんだ の あいだに すすむボタンを おそう。 ふりむいたら はなしてね';}};
Object.assign(SPECIAL_THING,{
  wordchain:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);[['り','#ff6f91',-26,-10],['ご','#5aa8ff',0,12],['ら','#6cd08a',26,-10]].forEach(([ch,col,dx,dy],i)=>{c.fillStyle='#fff';c.strokeStyle=col;c.lineWidth=3;rr(c,dx-15,dy-15,30,30,7);c.fill();c.stroke();c.fillStyle=col;c.font=`800 18px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(ch,dx,dy+1);});c.strokeStyle='#ffb03a';c.lineWidth=3;c.beginPath();c.moveTo(-12,0);c.lineTo(-10,6);c.moveTo(12,6);c.lineTo(14,0);c.stroke();c.restore();},
  ablock:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);c.rotate(-.1);c.fillStyle='#f0c888';c.beginPath();c.moveTo(-26,-20);c.lineTo(-12,-32);c.lineTo(34,-32);c.lineTo(20,-20);c.fill();c.fillStyle='#d8a868';c.beginPath();c.moveTo(20,-20);c.lineTo(34,-32);c.lineTo(34,16);c.lineTo(20,28);c.fill();c.fillStyle='#ffe0b0';rr(c,-26,-20,46,48,5);c.fill();c.fillStyle='#ff5f6f';c.font=`800 32px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('あ',-3,5);c.restore();},
  speech:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#fff';c.strokeStyle='#ff8cc0';c.lineWidth=3;c.beginPath();c.ellipse(0,-4,34,24,0,0,TAU);c.fill();c.stroke();c.beginPath();c.moveTo(-10,16);c.lineTo(-20,32);c.lineTo(4,19);c.fill();c.fillStyle='#ff5fa2';c.font=`800 16px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('しりとり',0,-3);c.restore();},
  bushpeek:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);for(const sd of[-1,1]){c.fillStyle='#fff';c.strokeStyle='#d8c8d8';c.lineWidth=2;c.beginPath();c.ellipse(sd*9,-20,6,16,sd*.2,0,TAU);c.fill();c.stroke();c.fillStyle='#ffc0d8';ell(c,sd*9,-20,2.5,10);}[[-20,8,20],[20,8,20],[0,-4,22]].forEach(([a,b,r])=>{c.fillStyle=gfill(c,a-5,b-5,r,'#5cc46a');circ(c,a,b,r);});c.fillStyle='#ff6f91';circ(c,-14,0,3);circ(c,16,-4,3);c.restore();},
  boxpeek:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#e8b870';rr(c,-30,-6,60,40,4);c.fill();c.fillStyle='#d8a050';c.save();c.translate(-30,-6);c.rotate(-.5);c.fillRect(0,-4,30,8);c.restore();c.fillStyle='#ffb35a';c.beginPath();c.ellipse(0,-10,20,14,0,Math.PI,TAU);c.fill();c.beginPath();c.moveTo(-18,-14);c.lineTo(-14,-30);c.lineTo(-6,-20);c.fill();c.beginPath();c.moveTo(18,-14);c.lineTo(14,-30);c.lineTo(6,-20);c.fill();c.fillStyle='#2a2a3a';circ(c,-7,-12,3);circ(c,7,-12,3);c.fillStyle='#e8b870';c.fillRect(-30,-8,60,6);c.restore();},
  gemstone:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);drawClue(c,'gem',0,0,1.9);c.restore();},
  daruma:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);c.fillStyle=gfill(c,-8,-10,40,'#ff4a4a');c.beginPath();c.ellipse(0,4,30,34,0,0,TAU);c.fill();c.strokeStyle='#a82a2a';c.lineWidth=2.5;c.stroke();c.fillStyle='#fff6e0';c.beginPath();c.ellipse(0,-4,19,16,0,0,TAU);c.fill();c.fillStyle='#2a2a2a';circ(c,-7,-6,3.2);circ(c,7,-6,3.2);c.strokeStyle='#2a2a2a';c.lineWidth=2;c.beginPath();c.moveTo(-13,-14);c.lineTo(-3,-12);c.moveTo(13,-14);c.lineTo(3,-12);c.stroke();c.beginPath();c.arc(0,2,5,.2,Math.PI-.2);c.stroke();c.fillStyle='#ffd23a';c.font=`800 12px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('ふく',0,24);c.restore();},
  stopsign:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#8a8aa0';c.fillRect(-3,10,6,26);c.fillStyle='#ff3a4a';c.beginPath();for(let i=0;i<8;i++){const a=i/8*TAU+Math.PI/8;c.lineTo(Math.cos(a)*26,-6+Math.sin(a)*26);}c.closePath();c.fill();c.strokeStyle='#fff';c.lineWidth=2.5;c.stroke();c.fillStyle='#fff';c.font=`800 13px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('とまれ',0,-5);c.restore();},
  kendama:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);c.strokeStyle='#8a7a6a';c.lineWidth=1.5;c.beginPath();c.moveTo(0,-4);c.quadraticCurveTo(20,-10,16,-24);c.stroke();c.fillStyle='#e8c090';rr(c,-4,-6,8,40,3);c.fill();rr(c,-16,-2,32,8,4);c.fill();c.fillStyle=gfill(c,10,-32,14,'#ff4a6a');circ(c,16,-28,13);c.fillStyle='rgba(255,255,255,.5)';circ(c,12,-32,4);c.restore();},
});
Object.assign(WORDS,{wordchain:['しりとり','word chain'],ablock:['つみき','block'],speech:['おしゃべり','talking'],bushpeek:['かくれんぼ','hide and seek'],boxpeek:['はこの なか','in the box'],gemstone:['ほうせき','jewel'],daruma:['だるま','daruma doll'],stopsign:['とまれ','stop'],kendama:['けんだま','kendama']});

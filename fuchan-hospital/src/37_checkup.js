// ================= リッキーの けんしん =================
const DIRS=[['up','うえ',-Math.PI/2],['down','した',Math.PI/2],['left','ひだり',Math.PI],['right','みぎ',0]];
SCN.checkup={bg:'#fff0f8',song:'fuwa',noRk:1,rkLines:['りっきー！'],
  enter(){this.steps=['height','weight','eye','ear','shot'];this.si=-1;this.miss=0;this.fin=0;this.tools=[];this.lay();this.cry=0;this.hap=0;
    say('きょうは リッキーの けんこうしんだん！ ふーちゃん せんせい、 よろしくね');setTimeout(()=>{if(scene===this)this.startStep();},2600);},
  lay(){this.gy=H*.66;this.rx=300;},
  startStep(){this.si++;const k=this.steps[this.si];this.key=k;this.tools=[];
    if(k==='height'){this.hv=66+Math.floor(Math.random()*15);this.bar=this.gy-300;this.hdone=0;say('しんちょうを はかろう。 うえの バーを さげて リッキーの あたまに くっつけてね');}
    if(k==='weight'){this.wv=7+Math.floor(Math.random()*5);this.wt=-1;this.wopts=null;say('つぎは たいじゅう。 たいじゅうけいを タッチしてね');}
    if(k==='eye'){this.er=0;this.newC();say('めの けんさ！ Cの あいている ほうの やじるしを タッチしてね');}
    if(k==='ear'){this.ar=0;setTimeout(()=>{if(scene===this&&this.key==='ear')this.newBeep();},2600);this.side=null;say('みみの けんさ。 ピーって きこえた ほうの ボタンを おしてね');}
    if(k==='shot'){this.prog=0;this.tools=mkTray(trayChoices('syringe',['syringe','steth','thermometer','bandage'],3),H-84);say('さいごは よぼうちゅうしゃ。 リッキー がんばれ！ ちゅうしゃは どれ？');}},
  next(d=1.4){const k=this.key;this.tools.forEach(t=>t.hidden=true);setTimeout(()=>{if(scene!==this||this.key!==k)return;this.tools=[];if(this.si+1>=this.steps.length){this.fin=.01;}else this.startStep();},d*1000);},
  newC(){this.cd=pick(DIRS.filter(d=>!this.lastD||d[0]!==this.lastD));this.lastD=this.cd[0];this.cs=[1.9,1.4,1,.7][this.er]||.7;},
  newBeep(){this.side=Math.random()<.5?-1:1;this.bt=0;toneP(1000,.7,this.side,.3);setTimeout(()=>{if(scene===this&&this.key==='ear')toneP(1000,.7,this.side,.3);},1100);},
  rkSc(){return this.hv*2.6/46;},
  update(dt){for(const t of this.tools)t.upd(dt);if(this.cry>0)this.cry-=dt;if(this.hap>0)this.hap-=dt;
    if(this.key==='weight'&&this.wt>=0){this.wt+=dt;if(this.wt<1.5&&Math.random()<dt*14)sfx('tick');if(this.wt>1.6&&!this.wopts){this.wopts=shuffle([this.wv,...shuffle([5,6,7,8,9,10,11,12].filter(v=>v!==this.wv)).slice(0,2)]);say('なんキロ かな？ すうじを よんでね');}}
    if(this.side&&this.bt!=null)this.bt+=dt;
    const d=this.tools.find(t=>t.held);if(this.key==='shot'&&d&&d.k==='syringe'){const a=this.arm();if(Math.hypot(d.x-a.x,d.y-a.y)<70){this.prog+=dt;if(this.prog>1.1&&!this.shot){this.shot=1;d.held=false;this.cry=2.2;sfx('squeak');say('えーん！ … でも なかなかった！ リッキー えらい！ シールを あげるね');setTimeout(()=>{if(scene===this){this.hap=3;RK.clap=2;sfx('hooray');}},2200);this.next(3.4);}}}
    if(this.fin>0){this.fin+=dt;if(this.fin>.6&&this.fin<9){this.fin=9;celebrate('checkup',starsFor(this.miss));}}},
  arm(){const sc=this.key==='height'?this.rkSc():2.8;return{x:this.rx+11*sc,y:this.gy-12*sc};},
  draw(c){roomBg(c,'#fff0f8','#f4dce8',this.gy-20,'#fff6fb');const k=this.key,gy=this.gy,rx=this.rx;
    // mama-chart
    c.fillStyle='#fff';rr(c,440,150,130,120,12);c.fill();c.strokeStyle='#ffb3d6';c.lineWidth=4;c.stroke();txt(c,'すくすく',505,176,18,'#ff5fa2');MED.ruler(c,470,230,.7);MED.scale(c,530,236,.6);
    let sc=2.8;
    if(k==='height'){const px=2.6;sc=this.rkSc();c.fillStyle='#ffe08a';rr(c,rx+70,gy-300,34,300,6);c.fill();c.strokeStyle='#d0a030';c.lineWidth=3;c.stroke();for(let v=0;v<=110;v+=5){const y=gy-v*px;if(y<gy-296)break;c.strokeStyle='#a07020';c.lineWidth=v%10?1.5:3;c.beginPath();c.moveTo(rx+70,y);c.lineTo(rx+70+(v%10?10:18),y);c.stroke();if(v%10===0&&v>0)txt(c,String(v),rx+122,y,14,'#a07020','left');}
      const top=gy-this.hv*px;c.fillStyle='#5aa8ff';rr(c,rx-60,this.bar-8,170,16,8);c.fill();c.fillStyle='#fff';rr(c,rx+84,this.bar-22,30,44,8);c.fill();c.strokeStyle='#5aa8ff';c.lineWidth=3;c.stroke();if(!this.hdone){txt(c,'▼',rx+99,this.bar+2,20,'#5aa8ff');}
      if(this.hdone){panel(c,rx+140,top-40,120,56,16,'#fff','#5aa8ff');txt(c,`${this.hv}cm`,rx+200,top-12,28,'#3a88e8');}}
    if(k==='weight'){c.fillStyle=gfill(c,rx,gy,120,'#f0f4ff');rr(c,rx-110,gy-16,220,40,14);c.fill();c.strokeStyle='#9aa8c8';c.lineWidth=4;c.stroke();c.fillStyle='#3a4260';rr(c,rx-60,gy+30,120,56,10);c.fill();
      const v=this.wt<0?0:this.wt<1.5?Math.floor(Math.random()*20)%13:this.wv;txt(c,this.wt<0?'0':String(v),rx-6,gy+60,40,'#7ae0ff',undefined,POP,400);txt(c,'kg',rx+38,gy+62,16,'#7ae0ff');if(this.wt<0)targetMark(c,rx,gy,80);}
    const rs=k==='eye'?2:k==='ear'?2.6:sc;const ry=k==='eye'?H-150:gy;const rxx=k==='eye'?W-90:rx;
    drawRikki(c,rxx,ry,{sc:rs,t:T,happy:this.hap>0||this.fin>0||this.cry<=0&&this.hdone&&k==='height',toy:k==='ear'||k==='shot'?false:undefined,clap:this.hap>0?1:0,wave:k==='ear'});this.rkPos={x:rxx,y:ry,sc:rs};
    if(this.cry>0){c.fillStyle='#8ad0ff';for(const s of[-1,1]){ell(c,rxx+s*4.4*rs+s*4,ry-29*rs+(2.2-this.cry)*14%20,4,7);}txtO(c,'えーん',rxx,ry-60*rs,26,'#5aa8ff','#fff',6);}
    if(k==='ear'){MED.headphone(c,rxx,ry-40*rs,rs*.62);if(this.side&&this.bt<1.8){const x=rxx+this.side*16*rs;for(let i=0;i<3;i++){c.strokeStyle=`rgba(255,95,162,${.8-i*.25})`;c.lineWidth=4;c.beginPath();c.arc(x,ry-34*rs,14+i*12+((T*30)%12),this.side>0?-.8:Math.PI-.8,this.side>0?.8:Math.PI+.8);c.stroke();}}
      [[-1,'ひだり','left'],[1,'みぎ','right']].forEach(([s,n,e])=>{const x=W/2+s*190,y=H-110;panel(c,x-80,y-50,160,100,24,'#fff',s<0?'#ff8cc0':'#5aa8ff');txt(c,s<0?'◀':'▶',x-50*s*-1+(s<0?-50:50)*0,y-14,30,s<0?'#ff5fa2':'#3a88e8');txt(c,n,x,y+14,24,'#5a4a6a');txt(c,e,x,y+38,14,'#8a7aa8');});
      txt(c,`${this.ar} / 3`,W/2,190,24,'#ff5fa2');}
    if(k==='eye'){const cx=W/2,cy=H*.44;panel(c,cx-150,cy-150,300,300,24,'#fff','#ffb3d6');if(this.cd)MED.landolt(c,cx,cy,this.cs,{a:this.cd[2]});
      DIRS.forEach(([id,n],i)=>{const p=this.arrowP(id);drawBtn(c,p.x,p.y,40,'#ffb03a',id==='left'?'prev':id==='right'?'next':'play',false);});txt(c,`${this.er} / 4`,W/2,190,24,'#ff5fa2');}
    if(k!=='eye')fu(c,90,gy+150,2.4,{point:!this.fin,cheer:this.fin>0||this.hap>0});else fu(c,90,H-40,2.4,{point:1});
    if(k==='weight'&&this.wopts){panel(c,40,H-180,W-80,160,24,'#fff','#ffb3d6');this.wopts.forEach((n,i)=>numBtn(c,W/2+(i-1)*150,H-90,44,n,['#ff8cc0','#5aa8ff','#ffb03a'][i]));}
    if(this.tools.some(t=>!t.hidden)){const a=this.arm();tray(c,H-84,120);for(const t of this.tools)if(!t.held)t.draw(c,1.3);for(const t of this.tools)if(t.held){targetMark(c,a.x,a.y);if(this.prog>0)progRing(c,a.x,a.y,50,this.prog/1.1);t.draw(c,1.5);}}
    if(this.shot&&this.si>=4)drawItem(c,'bandage',this.arm().x,this.arm().y,.5);
    stepDots(c,this.steps.length,Math.max(0,this.si)+(this.fin>0?1:0));},
  arrowP(id){const cx=W/2,cy=H*.44;return{up:{x:cx,y:cy-200},down:{x:cx,y:cy+200},left:{x:cx-210,y:cy},right:{x:cx+210,y:cy}}[id];},
  down(x,y){if(this.fin||this.si<0)return;const k=this.key;
    if(k==='height'&&!this.hdone){if(Math.abs(y-this.bar)<60&&x>this.rx-80&&x<this.rx+140){this.dragBar=1;sfx('tap');}return;}
    if(k==='weight'){if(this.wt<0&&hitC(x,y,this.rx,this.gy,120)){this.wt=0;sfx('roll');}else if(this.wopts){this.wopts.forEach((n,i)=>{if(hitC(x,y,W/2+(i-1)*150,H-90,50)){if(n===this.wv){sfx('ding');sayNum(n,'',' キロ');this.hap=1.5;this.wopts=[];this.next(2.2);}else{sfx('no');this.miss++;say('がめんの すうじを よく みてね');}}});}return;}
    if(k==='eye'){if(!this.cd)return;for(const [id,n] of DIRS){const p=this.arrowP(id);if(hitC(x,y,p.x,p.y,48)){if(id===this.cd[0]){sfx('ding');hush();speak(n);speak(id,'en');card={k:null,ja:n,en:id,t:0};this.er++;this.cd=null;burst(p.x,p.y,8,'star');if(this.er>=4){this.cd=null;say('よく みえてるね！');this.next(1.8);}else setTimeout(()=>{if(scene===this&&this.key==='eye')this.newC();},900);}else{sfx('no');this.miss++;hush();speak(`そこは ${n}。 あいている ところは どこかな？`);}return;}}return;}
    if(k==='ear'&&this.side){[[-1],[1]].forEach(([s])=>{const bx=W/2+s*190;if(Math.abs(x-bx)<80&&Math.abs(y-(H-110))<50){const n=s<0?['ひだり','left']:['みぎ','right'];if(s===this.side){sfx('ding');hush();speak(n[0]);speak(n[1],'en');card={k:null,ja:n[0],en:n[1],t:0};this.ar++;this.side=null;if(this.ar>=3){say('ちゃんと きこえてるね！');this.next(1.8);}else setTimeout(()=>{if(scene===this&&this.key==='ear')this.newBeep();},1500);}else{sfx('no');this.miss++;say('もういちど きいてみよう');setTimeout(()=>{if(scene===this&&this.side)toneP(1000,.7,this.side,.3);},900);this.bt=0;}}});return;}
    for(const t of this.tools){if(t.hit(x,y)){if(t.k!=='syringe'){sfx('no');this.miss++;const w=WORDS[t.k];hush();speak(`それは ${w[0]}`);speak(w[1],'en');card={k:t.k,ja:w[0],en:w[1],t:0};return;}t.held=true;t.lx=x;t.ly=y;sfx('tap');sayWord(t.k);return;}}
    if(this.rkPos&&rkHit(x,y,this.rkPos.x,this.rkPos.y,this.rkPos.sc)){RK.hop=1;rkCheer();say(pick(['りっきー！','きゃっきゃ！','ねえね せんせい！']));}},
  move(x,y){if(this.dragBar){const top=this.gy-this.hv*2.6;this.bar=clamp(y,this.gy-300,top);}const t=this.tools.find(q=>q.held);if(t){t.x=x;t.y=y;}},
  up(x,y){if(this.dragBar){this.dragBar=0;const top=this.gy-this.hv*2.6;if(Math.abs(this.bar-top)<16&&!this.hdone){this.bar=top;this.hdone=1;sfx('ding');sayNum(this.hv,'',' センチ');this.next(2.6);}}const t=this.tools.find(q=>q.held);if(t){t.held=false;if(!this.shot)this.prog=0;}},
  hint(){if(this.fin||this.si<0)return null;const k=this.key;
    if(k==='height')return this.hdone?null:{x:this.rx,y:this.bar,x2:this.rx,y2:this.gy-this.hv*2.6};
    if(k==='weight'){if(this.wt<0)return{x:this.rx,y:this.gy};if(this.wopts&&this.wopts.length)return{x:W/2+(this.wopts.indexOf(this.wv)-1)*150,y:H-90};return null;}
    if(k==='eye')return this.cd?this.arrowP(this.cd[0]):null;
    if(k==='ear')return this.side?{x:W/2+this.side*190,y:H-110}:null;
    const t=this.tools.find(q=>q.k==='syringe');if(!t||t.hidden)return null;const a=this.arm();return{x:t.hx,y:t.hy,x2:a.x,y2:a.y};},
  hintText(){return{height:'あおい バーを したに ひっぱろう',weight:'たいじゅうけいを タッチ',eye:'Cの あいている ほうを タッチ',ear:'ピーの きこえた ほうを タッチ',shot:'ちゅうしゃを リッキーの うでへ'}[this.key]||'';}};

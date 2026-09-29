// ================= battle (へんしん＆プリキュア バトル) =================
function drawMonster(c,m,x,y,s,t,o={}){c.save();c.translate(x,y);const wob=Math.sin(t*3)*.04;
  c.fillStyle='rgba(40,0,50,.25)';ell(c,0,150*s,110*s,20*s);c.scale(s*(1+wob),s*(1-wob));
  const pur=o.pur||0;c.globalAlpha=1-pur*.85;
  if(o.warn){drawGlow(c,'#ff3a5a',0,0,190,.55+Math.sin(t*20)*.2);}
  if(m.kind!=='witch'&&m.kind!=='ghost'){c.fillStyle='rgba(90,20,110,.3)';for(let i=0;i<6;i++){const a=t+i;circ(c,Math.cos(a)*130,Math.sin(a*1.3)*90,9+Math.sin(t*3+i)*4);}}
  c.lineJoin='round';c.lineCap='round';c.strokeStyle='#3a1a3a';c.lineWidth=5;const col=m.col;let ey=-10;
  switch(m.kind){
    case'cake':c.fillStyle=gfill(c,-30,-20,140,'#f5c77a');rr(c,-110,-40,220,130,20);c.fill();c.stroke();c.fillStyle=col;rr(c,-116,-72,232,50,24);c.fill();c.stroke();for(let i=0;i<7;i++){c.beginPath();c.ellipse(-96+i*32,-24,14,20+((i*7)%3)*6,0,0,Math.PI);c.fill();}
      c.fillStyle='#ff4d6d';c.fillRect(-110,24,220,12);for(const dx of[-60,0,60])drawIcon(c,'strawberry',dx,-92,1.3);for(const sd of[-1,1]){c.fillStyle=col;c.beginPath();c.ellipse(sd*136,10+Math.sin(t*5+sd)*10,22,34,sd*.5,0,TAU);c.fill();c.stroke();}ey=12;break;
    case'candy':for(const sd of[-1,1]){c.fillStyle=shade(col,.2);c.beginPath();c.moveTo(sd*90,0);c.lineTo(sd*160,-60+Math.sin(t*6)*10);c.lineTo(sd*150,0);c.lineTo(sd*160,60-Math.sin(t*6)*10);c.closePath();c.fill();c.stroke();}
      c.fillStyle=gfill(c,-30,-30,120,col);circ(c,0,0,110);c.stroke();c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=16;c.beginPath();for(let a=0;a<TAU*1.6;a+=.2){const r=12+a*18;c.lineTo(Math.cos(a+t)*r,Math.sin(a+t)*r);}c.stroke();c.strokeStyle='#3a1a3a';c.lineWidth=5;break;
    case'paint':c.fillStyle=gfill(c,-30,-30,140,col);c.beginPath();for(let i=0;i<=24;i++){const a=i/24*TAU,r=110+Math.sin(a*5+t*3)*12;c.lineTo(Math.cos(a)*r,Math.sin(a)*r*.9);}c.closePath();c.fill();c.stroke();
      ['#ff4a5a','#ffd23a','#3a8aff','#3ec46a'].forEach((cc,i)=>{c.fillStyle=cc;const dx=-75+i*50;c.beginPath();c.moveTo(dx-12,80);c.quadraticCurveTo(dx,130+Math.sin(t*4+i)*14,dx+12,80);c.fill();circ(c,dx+(i%2?-10:14),-40+i*12,12);});
      c.save();c.translate(60,-100);c.rotate(.5+Math.sin(t*3)*.2);drawIcon(c,'brush',0,0,2.4);c.restore();break;
    case'germ':c.fillStyle=col;for(let i=0;i<12;i++){const a=i/12*TAU+t*.5;c.save();c.rotate(a);c.fillRect(-6,-150,12,50);circ(c,0,-150,16);c.restore();}c.fillStyle=gfill(c,-30,-30,130,col);circ(c,0,0,112);c.stroke();c.fillStyle='rgba(255,255,255,.25)';for(const[a,b,r]of[[-50,40,18],[60,50,14],[40,-60,12]])circ(c,a,b,r);break;
    case'clock':for(const sd of[-1,1]){c.fillStyle='#ffd23a';c.beginPath();c.arc(sd*70,-110,34,Math.PI,TAU);c.fill();c.stroke();}c.fillStyle=gfill(c,-30,-30,130,col);circ(c,0,0,118);c.stroke();c.fillStyle='#fff';circ(c,0,0,96);c.stroke();
      for(let k=1;k<=12;k++){const a=k/12*TAU-Math.PI/2;txt(c,String(k),Math.cos(a)*78,Math.sin(a)*78,18,'#5b2c47','center',900);}c.strokeStyle='#5b2c47';c.lineWidth=6;c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(t*2)*60,Math.sin(t*2)*60);c.stroke();c.strokeStyle='#3a1a3a';c.lineWidth=5;ey=-20;break;
    case'octo':c.fillStyle=col;for(let i=0;i<6;i++){const bx=-100+i*40;c.beginPath();c.moveTo(bx-16,40);c.quadraticCurveTo(bx-30+Math.sin(t*4+i)*24,120,bx+Math.sin(t*4+i)*30,160);c.quadraticCurveTo(bx+20,110,bx+16,40);c.fill();c.stroke();c.fillStyle='#ffd0dc';circ(c,bx+Math.sin(t*4+i)*20,120,7);c.fillStyle=col;}
      c.fillStyle=gfill(c,-30,-50,140,col);c.beginPath();c.ellipse(0,-20,120,110,0,0,TAU);c.fill();c.stroke();ey=0;break;
    case'star':c.fillStyle=gfill(c,-30,-30,150,col);starP(c,0,0,150,72,5,-Math.PI/2+Math.sin(t)*.1);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.5)';starP(c,-20,-30,40,18);c.fill();break;
    case'balloon':c.strokeStyle='#8a7a9a';c.lineWidth=3;for(const[dx,dy,r,cc]of[[-118,-70,40,'#5aa8ff'],[112,-80,38,'#ffd23a'],[-100,70,34,'#6cd08a'],[108,64,34,'#b48cff']]){const bx=dx+Math.sin(t*2+dx)*8;c.beginPath();c.moveTo(bx,dy+r);c.quadraticCurveTo(bx*.5,dy+r+30,0,120);c.stroke();}
      c.strokeStyle='#3a1a3a';c.lineWidth=5;for(const[dx,dy,r,cc]of[[-118,-70,40,'#5aa8ff'],[112,-80,38,'#ffd23a'],[-100,70,34,'#6cd08a'],[108,64,34,'#b48cff']]){const bx=dx+Math.sin(t*2+dx)*8;c.fillStyle=gfill(c,bx-10,dy-10,r,cc);c.beginPath();c.ellipse(bx,dy,r,r*1.15,0,0,TAU);c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.5)';ell(c,bx-r*.35,dy-r*.4,r*.18,r*.3);}
      c.fillStyle=gfill(c,-30,-40,140,col);c.beginPath();c.ellipse(0,-10,105,122,0,0,TAU);c.fill();c.stroke();c.fillStyle=shade(col,-.15);c.beginPath();c.moveTo(-12,110);c.lineTo(12,110);c.lineTo(0,126);c.closePath();c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.45)';ell(c,-45,-70,18,32,-.3);ey=-24;break;
    case'mushroom':c.fillStyle=gfill(c,-20,40,90,'#fff0e0');rr(c,-60,-10,120,140,40);c.fill();c.stroke();for(const sd of[-1,1]){c.fillStyle='#fff0e0';c.beginPath();c.ellipse(sd*78,60+Math.sin(t*5+sd)*8,16,26,sd*.5,0,TAU);c.fill();c.stroke();}
      c.fillStyle=gfill(c,-40,-80,150,col);c.beginPath();c.ellipse(0,-30,150,100,0,Math.PI,TAU);c.quadraticCurveTo(0,-5,-150,-30);c.closePath();c.fill();c.stroke();c.fillStyle='#fff';for(const[a,b,r]of[[-80,-70,18],[0,-105,22],[80,-70,18],[-40,-45,12],[45,-48,12]])circ(c,a,b,r);ey=40;break;
    case'jelly':c.fillStyle=hexA(col,.85);c.beginPath();c.moveTo(-120,110);c.lineTo(-95,-70);c.quadraticCurveTo(0,-110+Math.sin(t*6)*8,95,-70);c.lineTo(120,110);c.closePath();c.fill();c.stroke();
      c.fillStyle='#fff';rr(c,-150,100,300,30,15);c.fill();c.stroke();c.fillStyle='#ff4a5a';circ(c,0,-110,26);c.stroke();c.fillStyle='rgba(255,255,255,.55)';ell(c,-60,-20,14,50,.1);ey=10;break;
    case'book':c.fillStyle='#fff';c.beginPath();c.moveTo(0,-90);c.quadraticCurveTo(-70,-110,-150,-90);c.lineTo(-150,100);c.quadraticCurveTo(-70,80,0,100);c.quadraticCurveTo(70,80,150,100);c.lineTo(150,-90);c.quadraticCurveTo(70,-110,0,-90);c.closePath();c.fill();c.stroke();
      c.fillStyle=col;c.fillRect(-156,-96,10,200);c.fillRect(146,-96,10,200);c.beginPath();c.moveTo(0,-90);c.lineTo(0,100);c.stroke();c.strokeStyle='#c0c8d8';c.lineWidth=3;for(let i=0;i<4;i++){c.beginPath();c.moveTo(-130,50+i*12);c.lineTo(-20,50+i*12);c.moveTo(20,50+i*12);c.lineTo(130,50+i*12);c.stroke();}c.strokeStyle='#3a1a3a';c.lineWidth=5;
      c.save();c.translate(0,-90);c.rotate(Math.sin(t*4)*.2);c.fillStyle='#ff5a6a';c.fillRect(-6,0,12,40);c.restore();ey=-20;break;
    case'lantern':c.fillStyle='#3a2a2a';rr(c,-60,-150,120,24,6);c.fill();rr(c,-60,126,120,24,6);c.fill();drawGlow(c,'#ffb03a',0,0,200,.5);c.fillStyle=gfill(c,-30,-30,150,col);c.beginPath();c.ellipse(0,0,120,132,0,0,TAU);c.fill();c.stroke();
      c.strokeStyle='rgba(120,20,20,.45)';c.lineWidth=4;for(const y of[-90,-45,45,90]){c.beginPath();c.ellipse(0,y,120*Math.sqrt(1-y*y/17424),10,0,0,TAU);c.stroke();}c.strokeStyle='#3a1a3a';c.lineWidth=5;ey=-10;break;
    case'pumpkin':c.fillStyle=col;for(const dx of[-80,0,80]){c.beginPath();c.ellipse(dx,10,80,115,0,0,TAU);c.fill();c.stroke();}c.fillStyle='#4cae4a';rr(c,-14,-128,28,40,8);c.fill();c.stroke();
      c.strokeStyle='#4cae4a';c.lineWidth=6;c.beginPath();c.moveTo(10,-110);c.quadraticCurveTo(60,-150,70+Math.sin(t*3)*10,-110);c.stroke();c.strokeStyle='#3a1a3a';c.lineWidth=5;ey=0;break;
    case'snowman':c.fillStyle=gfill(c,-30,40,120,'#ffffff',.1,-.12);circ(c,0,70,98);c.stroke();c.fillStyle=gfill(c,-20,-60,90,'#ffffff',.1,-.12);circ(c,0,-50,74);c.stroke();
      c.strokeStyle='#7a4a2a';c.lineWidth=8;for(const sd of[-1,1]){c.beginPath();c.moveTo(sd*80,20);c.lineTo(sd*150,-30+Math.sin(t*4+sd)*14);c.moveTo(sd*125,-12);c.lineTo(sd*140,-50);c.stroke();}c.strokeStyle='#3a1a3a';c.lineWidth=5;
      c.fillStyle=col;rr(c,-86,6,172,26,12);c.fill();c.stroke();c.save();c.translate(50,20);c.rotate(.3+Math.sin(t*5)*.1);rr(c,-12,0,24,70,8);c.fill();c.stroke();c.restore();
      c.fillStyle='#2a2a3a';for(const y of[60,95,130])circ(c,0,y,9);rr(c,-58,-150,116,22,6);c.fill();rr(c,-42,-210,84,64,6);c.fill();c.fillStyle='#ff4a6a';c.fillRect(-42,-162,84,12);
      c.fillStyle='#ff8a2a';c.beginPath();c.moveTo(-6,-30);c.lineTo(46,-22);c.lineTo(-6,-16);c.closePath();c.fill();c.stroke();ey=-62;break;
  }
  if(m.kind==='witch'){c.globalAlpha=1;drawGlow(c,pur>.5?'#ff9ccf':'#8a2ab8',0,-20,220,.6);drawWitch(c,0,120,2.6,t,{kind:pur>.5});}
  else if(m.kind==='ghost'){c.globalAlpha=1;drawGlow(c,pur>.5?'#ffe0f0':'#7a6a9a',0,-10,230,.7);drawGhost(c,0,130,2.9,t,{kind:pur>.5});}
  else{if(pur<.5){for(const sd of[-1,1]){c.fillStyle='#fff';c.beginPath();c.ellipse(sd*36,ey,22,17,0,0,TAU);c.fill();c.stroke();c.fillStyle='#c01a3a';circ(c,sd*32,ey+3,9);c.fillStyle='#1a0a1a';circ(c,sd*32,ey+3,4.5);c.lineWidth=8;c.beginPath();c.moveTo(sd*14,ey-24);c.lineTo(sd*56,ey-13);c.stroke();c.lineWidth=5;}
      c.fillStyle='#6a1a3a';c.beginPath();c.moveTo(-32,ey+32);c.quadraticCurveTo(0,ey+22,32,ey+32);c.quadraticCurveTo(0,ey+60,-32,ey+32);c.fill();c.stroke();c.fillStyle='#fff';for(const dx of[-17,0,17]){c.beginPath();c.moveTo(dx-6,ey+29);c.lineTo(dx,ey+38);c.lineTo(dx+6,ey+29);c.fill();}}
    else{c.lineWidth=6;for(const sd of[-1,1]){c.beginPath();c.arc(sd*34,ey+4,13,Math.PI*1.1,Math.PI*1.9);c.stroke();}c.fillStyle='#ff8cb0';ell(c,-64,ey+24,15,9);ell(c,64,ey+24,15,9);c.beginPath();c.arc(0,ey+26,14,.2,Math.PI-.2);c.stroke();}}
  if(o.flash){c.globalAlpha=.25;c.fillStyle='#fff';circ(c,0,0,120);}
  c.globalAlpha=1;if(o.dizzy){for(let i=0;i<4;i++){const a=t*4+i/4*TAU;c.fillStyle='#ffe36a';starP(c,Math.cos(a)*90,-150+Math.sin(a)*22,14,6);c.fill();c.strokeStyle='#3a1a3a';c.lineWidth=2;c.stroke();}}
  c.restore();}
const SUPPORT={rk:['リッキー サポート！','リッキー キラキラ サポート！'],kuro:['クロニャン パンチ！','クロニャン パンチ だニャ！'],witch:['ドロドロン マジック！','ドロドロン マジック！']};
const FIN={
  heart:{name:'プリキュア！ ハートフル・シャワー！',col:'#ff5fa2',pts:()=>{const p=[];for(let i=0;i<=18;i++){const a=i/18*TAU;p.push([16*Math.pow(Math.sin(a),3)/16,-(13*Math.cos(a)-5*Math.cos(2*a)-2*Math.cos(3*a)-Math.cos(4*a))/16]);}return p;}},
  star:{name:'プリキュア！ キラキラ・スターシュート！',col:'#ffc83a',pts:()=>{const p=[];for(let i=0;i<=10;i++){const a=-Math.PI/2+i*TAU/10,r=i%2?.45:1;p.push([Math.cos(a)*r,Math.sin(a)*r]);}return p;}},
  circle:{name:'プリキュア！ まんまる・バブル・リング！',col:'#5ac8ff',pts:()=>{const p=[];for(let i=0;i<=16;i++){const a=-Math.PI/2+i/16*TAU;p.push([Math.cos(a)*.9,Math.sin(a)*.9]);}return p;}},
  rainbow:{name:'プリキュア！ レインボー・パレット！',col:'#b48cff',pts:()=>{const p=[];for(let i=0;i<=14;i++){const a=Math.PI+i/14*Math.PI;p.push([Math.cos(a),Math.sin(a)*.9+.4]);}return p;}},
  diamond:{name:'プリキュア！ ダイヤモンド・スプラッシュ！',col:'#6ae0e8',pts:()=>{const q=[[0,-1],[.8,0],[0,1],[-.8,0],[0,-1]],p=[];for(let i=0;i<4;i++)for(let k=0;k<3;k++)p.push([lerp(q[i][0],q[i+1][0],k/3),lerp(q[i][1],q[i+1][1],k/3)]);p.push([0,-1]);return p;}},
  moon:{name:'プリキュア！ ムーンライト・ドリーム！',col:'#ffe36a',pts:()=>{const p=[];for(let i=0;i<=10;i++){const a=Math.PI*.3+i/10*Math.PI*1.4;p.push([Math.cos(a)*-1+.1,Math.sin(a)]);}for(let i=1;i<=7;i++){const a=Math.PI*.3+Math.PI*1.4-i/7*Math.PI*1.4;p.push([Math.cos(a)*-.55+.35,Math.sin(a)*.8]);}return p;}},
  smile:{name:'プリキュア！ スマイル・フレンズ・ハーモニー！',col:'#ffb03a',pts:()=>{const p=[];for(let i=0;i<=8;i++){const a=Math.PI*.95-i/8*Math.PI*.9;p.push([Math.cos(a),Math.sin(a)*.7]);}for(let i=1;i<=8;i++){const a=-Math.PI*.05-i/8*Math.PI*.9;p.push([Math.cos(a)*.9,Math.sin(a)*.55-.05]);}return p;}},
  jewel:{name:'プリキュア！ ジュエル・レインボー・フィナーレ！',col:'#ff7ab8',pts:()=>FIN.heart.pts()},
};
const GEM_COLS=['#ff7ab8','#ff9a2a','#ffd23a','#3ec46a','#5ac8ff','#3a6aff','#a060e0','#ffffff'];
function mkChance(type){const Q={type,orbs:[],cnt:0};
  const three=(keys,ans)=>{Q.orbs=shuffle(keys).map((k,i)=>({k,ok:k===ans,sh:0,x:[100,200,300][i],y:[300,215,300][i]}));};
  if(type==='num'){const s=shuffle([1,2,3,4,5,6,7,8,9]).slice(0,3);const a=s[0];three(s.map(v=>'n:'+v),'n:'+a);Q.text=`すうじの 「${a}」を タッチ！`;Q.say=[[`${JA_NUM[a]}を タッチ！`,'ja'],[EN_NUM[a],'en']];}
  else if(type==='color'){const s=shuffle(['red','blue','yellow','green','pink','purple','orange']).slice(0,3);const w=WORDS[s[0]];three(s.map(v=>'c:'+v),'c:'+s[0]);Q.text=`「${w[1]}」 ${w[0]}を タッチ！`;Q.say=[[w[1],'en'],[`${w[0]}を タッチ！`,'ja']];}
  else if(type==='letter'){const s=shuffle('ABCDEFGHKMOPRST'.split('')).slice(0,3);three(s.map(v=>'l:'+v),'l:'+s[0]);Q.text=`アルファベットの 「${s[0]}」を タッチ！`;Q.say=[[s[0],'en'],['を タッチ！','ja']];}
  else if(type==='shape'){const s=shuffle(['circle','triangle','square']);const w=WORDS[s[0]];three(s.map(v=>'s:'+v),'s:'+s[0]);Q.text=`「${w[1]}」 ${w[0]}を タッチ！`;Q.say=[[w[1],'en'],[`${w[0]}を タッチ！`,'ja']];}
  else if(type==='word'){const s=shuffle(['apple','fish','star','car','cat','dog','ball','flower','cake','book']).slice(0,3);const w=WORDS[s[0]];three(s.map(v=>iconOfWord(v)),iconOfWord(s[0]));Q.text=`「${w[1]}」は どれ？`;Q.say=[[w[1],'en'],['は どれ？','ja']];}
  else if(type==='add'){const a=randi(1,4),b=randi(1,4),n=a+b;const s=new Set([n]);while(s.size<3){const v=n+pick([-2,-1,1,2]);if(v>=1&&v<=9)s.add(v);}three([...s].map(v=>'n:'+v),'n:'+n);Q.text=`${a} たす ${b} は いくつ？`;Q.say=[[`${JA_NUM[a]} たす ${JA_NUM[b]} は いくつ？`,'ja']];}
  else{Q.type='count';const n=randi(3,5);Q.need=n;for(let i=0;i<6;i++){const a=-Math.PI/2+i/6*TAU;Q.orbs.push({k:'star',ok:true,sh:0,x:200+Math.cos(a)*120,y:300+Math.sin(a)*100,got:0});}Q.text=`ほしを ${n}こ タッチ！`;Q.say=[[`ほしを ${JA_NUM[n]}こ タッチ！`,'ja'],[EN_NUM[n]+' stars!','en']];}
  return Q;}
STEP.battle={
  enter(){const d=this.d;this.m={hp:100,x:200,y:300,flash:0,shake:0,warn:0,cd:3,pur:0,t:0};this.lv=d.lv||1;this.hearts=5;this.shots=[];this.bul=[];this.shield=0;this.hurt=0;this.t=0;this.cmb=0;this.lastHit=-9;
    const n=(d.chances||[]).length;this.th=d.chances.map((_,i)=>100*(1-(i+1)/(n+1)));this.ci=0;this.dmg=[4,3.4,2.9][this.lv-1]*(d.boss?.8:1);RUN.cure=false;RUN.doc=false;
    bgm(d.boss?'boss':'battle');if(d.henshin===false){this.ph='intro';this.cure=true;this.t=0;}else{this.ph='pend';this.cure=false;instr('ねえね！ ハートの ペンダントを タッチして、へんしんだよ！','rk');}},
  fx(){return{x:100,y:655};},
  update(dt){const d=this.d,m=this.m;this.t+=dt;m.t+=dt;if(m.flash>0)m.flash-=dt;if(m.shake>0)m.shake-=dt;if(this.hurt>0)this.hurt-=dt;if(this.shield>0)this.shield-=dt;
    if(this.ph==='hen'){if(!this.s1&&this.t>.2){this.s1=1;say('プリキュア！ たんてい チェンジ！','fu');}if(this.t>2.3&&!this.cure){this.cure=true;RUN.cure=true;FLASH=1;FLASHCOL='#fff';sfx('find');burst(200,450,30,'heart');}
      if(!this.s2&&this.t>2.6){this.s2=1;say('ひかりの たんてい！ キュアふーちゃん！','fu');}if(this.t>5.6){this.ph='intro';this.t=0;}}
    if(this.ph==='intro'){if(!this.said){this.said=1;SHAKE=.5;sfx('boom');instr(SAVE.wins?`${d.mon.name}を やっつけよう！`:`${d.mon.name}を タッチして こうげきしよう！`,'fu');}if(this.t>1.2){this.ph='fight';this.t=0;}}
    if(d.boss||this.lv>=2)m.x=200+Math.sin(m.t*.7)*(d.boss?70:50);
    if(this.ph==='fight'){
      if(m.warn>0){m.warn-=dt;if(m.warn<=0){const n=d.boss?4:3;for(let i=0;i<n;i++)this.bul.push({x:m.x+(i-(n-1)/2)*60,y:m.y+40,t:-i*.22,k:this.bulletKind()});sfx('whoosh');}}
      else{m.cd-=dt;if(m.cd<=0&&this.bul.length===0){m.warn=1.4;m.cd=[rand(5,6.5),rand(4,5.5),rand(3.4,4.6)][this.lv-1]*(d.boss?.9:1);sfx('warn');if(!this.gTut){this.gTut=1;instr('あかく ひかったら「まもる」ボタンを タッチ！','rk');}else if(Math.random()<.5)say(pick(['くるよ！ まもって！','あぶない！ まもる！']),'rk');}}
      if(this.ci<this.th.length&&m.hp<=this.th[this.ci]){this.startChance();}
      else if(m.hp<=0){this.ph='trace0';this.t=0;this.bul=[];m.warn=0;sfx('fanfare');instr('いまだ！ ひっさつわざ！ ひかる ほしを ゆびで なぞって！','rk');this.mkTrace();}}
    for(let i=this.bul.length-1;i>=0;i--){const b=this.bul[i];b.t+=dt;if(b.t<0)continue;const k=b.t/1;const f=this.fx();b.cx=lerp(b.x,f.x+10,k);b.cy=lerp(b.y,f.y-60,k)-Math.sin(k*Math.PI)*90;
      if(k>=1){this.bul.splice(i,1);if(this.shield>0){sfx('guard');burst(f.x+20,f.y-70,10,'star');floatText(f.x+30,f.y-120,'ガード！','#8a7af0',26);}else{this.hurt=.6;sfx('hurt');SHAKE=.25;this.hearts--;burst(f.x,f.y-60,6,'heart','#ffb3d6');
        if(this.hearts<=0){this.hearts=5;sfx('heal');burst(f.x,f.y-60,20,'heart');say('ねえね、がんばれ〜！ リッキー ヒール！','rk');}}}}
    for(let i=this.shots.length-1;i>=0;i--){const s=this.shots[i];s.t+=dt*2.8;if(s.t>=1){this.shots.splice(i,1);if(this.ph!=='fight')continue;m.hp=Math.max(0,m.hp-this.dmg*(1+Math.min(this.cmb,10)*.03));m.flash=.12;m.shake=.25;sfx('hit');burst(m.x+rand(-60,60),m.y+rand(-50,50),6,'star');}}
    if(this.ph==='chance'){for(const o of this.Q.orbs)o.sh=Math.max(0,o.sh-dt);}
    if(this.ph==='combo'){if(this.t>.4&&!this.cs){this.cs=1;m.hp=Math.max(0,m.hp-18);m.flash=.3;m.shake=.6;SHAKE=.4;sfx('boom');burst(m.x,m.y,30,'star');}if(this.t>2){this.ph='fight';this.t=0;this.cs=0;}}
    if(this.ph==='trace0'&&this.t>1.2)this.ph='trace';
    if(this.ph==='beam'){const L=this.beamLen||3.2;if(this.t>L-1.9)m.pur=Math.min(1,(this.t-(L-1.9))/1.3);if(this.t>L){this.ph='win';this.t=0;sfx('fanfare');confetti(90);say(d.win||`やったー！ ${d.mon.name}が もとに もどったよ！`,'fu');SAVE.wins=(SAVE.wins||0)+1;save();}}
    if(this.ph==='win'&&this.t>4.2&&this.fin==null)finish(this,.1);},
  bulletKind(){return{cake:'cream',candy:'candy',paint:'paint',germ:'germ',clock:'num',octo:'ink',star:'star',witch:'dark',balloon:'balloon',snowman:'snowflake',ghost:'fog',mushroom:'mushroom',jelly:'jelly',book:'book',lantern:'lantern',pumpkin:'pumpkin'}[this.d.mon.kind]||'star';},
  startChance(){const d=this.d;this.ph='chance';this.t=0;this.bul=[];this.m.warn=0;this.Q=mkChance(d.chances[this.ci]);this.ci++;sfx('ready');INS={text:'チャンス！ '+this.Q.text,who:'rk',t:0};say([['チャンス！','ja'],...this.Q.say],'rk');},
  mkTrace(){const f=FIN[this.d.fin||'heart'];this.tr={pts:f.pts().map(([a,b])=>({x:200+a*125,y:390+b*125})),i:0};},
  draw(c){const d=this.d,m=this.m,f=this.fx();
    if(this.ph==='pend'||this.ph==='hen'){this.drawHen(c);return;}
    drawBG(c,d.boss?'dark':'battle');
    if(this.ph!=='win')drawMonster(c,d.mon,m.x+(m.shake>0?Math.sin(m.shake*60)*8:0),m.y,.72,m.t,{flash:m.flash>0,warn:m.warn>0,pur:m.pur,dizzy:this.ph==='chance'||this.ph==='trace'||this.ph==='trace0'});
    else{if(d.mon.kind==='witch')drawWitch(c,200,330,2,T,{kind:true});else if(d.mon.kind==='ghost'){drawGhost(c,200,380,2,T,{kind:true});drawIcon(c,'smilestar',200,160,2);}else{const k=easeBack(Math.min(1,this.t*1.5));drawGlow(c,'#fff6a0',200,300,120,.8);c.save();c.translate(200,300-Math.sin(T*2)*6);c.scale(k,k);drawIcon(c,d.item||'gem',0,0,3);c.restore();}}
    for(const b of this.bul){if(b.t<0)continue;c.save();c.translate(b.cx,b.cy);c.rotate(b.t*6);
      if(b.k==='cream'){c.fillStyle='#fff0f6';circ(c,0,0,16);c.fillStyle='#ffb3d6';circ(c,4,-4,8);}else if(b.k==='paint'){c.fillStyle=pick(['#ff4a5a','#3a8aff','#ffd23a']);circ(c,0,0,14);}else if(b.k==='ink'){c.fillStyle='#2a1a3a';circ(c,0,0,15);}else if(b.k==='dark'){drawGlow(c,'#b04aff',0,0,30,.9);c.fillStyle='#4a0a6a';circ(c,0,0,12);}else if(b.k==='num')drawIcon(c,'n:'+((Math.floor(b.x)%9)+1),0,0,.7);else drawIcon(c,b.k,0,0,.8);c.restore();}
    for(const s of this.shots){const x=lerp(f.x+30,m.x,s.t),y=lerp(f.y-80,m.y,s.t)-Math.sin(s.t*Math.PI)*60;c.fillStyle='#fff';heartP(c,x,y,13);c.fill();c.fillStyle='#ff6fae';heartP(c,x,y,8);c.fill();}
    // heroes
    const pose=this.ph==='win'?'win':this.ph==='beam'||this.ph==='mic'||this.ph==='mic0'?'cast':this.ph==='fight'?'point':'idle';
    drawFutan(c,f.x+(this.hurt>0?Math.sin(this.hurt*40)*6:0),f.y,{s:2.1,cure:1,pose,ouch:this.hurt>0,happy:this.ph==='win',item:'wand'});
    if(this.shield>0){c.strokeStyle=`rgba(255,140,220,${.5+this.shield*.4})`;c.fillStyle='rgba(255,200,240,.3)';c.lineWidth=6;c.beginPath();c.arc(f.x+10,f.y-70,95,-Math.PI*.95,Math.PI*.05);c.fill();c.stroke();}
    drawRicky(c,300,615,{s:1.8,cure:1,happy:this.ph==='win'||this.ph==='combo'});const al=[].concat(d.ally||[]);if(al.includes('kuro'))drawKuro(c,362,560,.8,T,'happy');if(al.includes('witch'))drawWitch(c,40,560,.75,T,{kind:true});
    // hud
    if(this.ph!=='win'){c.fillStyle='rgba(0,0,0,.3)';rr(c,70,152,260,24,12);c.fill();c.fillStyle=vfill(c,152,176,'#ff4d8d');rr(c,70,152,Math.max(0,260*m.hp/100),24,12);c.fill();c.strokeStyle='#fff';c.lineWidth=2.5;rr(c,70,152,260,24,12);c.stroke();txt(c,d.mon.name,200,165,14,'#fff','center',900);
      for(const t of this.th){c.fillStyle='#ffe36a';starP(c,70+260*t/100,164,8,3.5);c.fill();}}
    if(this.ph==='fight'||this.ph==='intro'){for(let i=0;i<5;i++){c.fillStyle=i<this.hearts?'#ff5fa2':'rgba(255,255,255,.4)';heartP(c,22+i*22,706,9);c.fill();}
      drawRBtn(c,200,668,38,'shield',m.warn>0?'#ff4d6d':'#b86af0');otext(c,'まもる',200,712,15,'#fff',m.warn>0?'#ff4d6d':'#8a4ad0','center',FONT);if(m.warn>0){c.strokeStyle='rgba(255,255,255,.9)';c.lineWidth=4;c.beginPath();c.arc(200,668,46+Math.sin(T*16)*5,0,TAU);c.stroke();}
      if(this.cmb>=3&&this.t-this.lastHit<1)otext(c,this.cmb+' コンボ！',290,210,22+Math.min(this.cmb,8),'#fff','#ff3d8a');}
    if(this.ph==='chance'){c.fillStyle='rgba(255,255,255,.12)';c.fillRect(VX0,VY0,VX1-VX0,VY1-VY0);for(const o of this.Q.orbs){if(o.got)continue;const sh=o.sh>0?Math.sin(o.sh*40)*7:0,by=Math.sin(T*3+o.x)*5;drawGlow(c,'#fff6a0',o.x+sh,o.y+by,58,.8);c.fillStyle='#fff';circ(c,o.x+sh,o.y+by,36);c.strokeStyle='#ffc83a';c.lineWidth=4;c.beginPath();c.arc(o.x+sh,o.y+by,36,0,TAU);c.stroke();drawIcon(c,o.k,o.x+sh,o.y+by,1.15);}
      if(this.Q.type==='count'){c.fillStyle='rgba(255,255,255,.92)';rr(c,140,470,120,54,27);c.fill();otext(c,`${this.Q.cnt} / ${this.Q.need}`,200,498,28,'#ff5fa2','#fff');}}
    if(this.ph==='combo'){const k=Math.min(1,this.t*3);c.strokeStyle='rgba(255,230,120,.85)';c.lineWidth=30*k;c.beginPath();const sp0={rk:[300,590],kuro:[362,500],witch:[40,500]}[this.sup||'rk'];c.moveTo(sp0[0],sp0[1]);c.lineTo(m.x,m.y);c.stroke();c.strokeStyle='#fff';c.lineWidth=10*k;c.stroke();
      otext(c,SUPPORT[this.sup||'rk'][0],200,460,28,'#fff','#ffb03a');}
    if(this.ph==='trace'||this.ph==='trace0'){const tr=this.tr;c.fillStyle='rgba(255,255,255,.18)';c.fillRect(VX0,VY0,VX1-VX0,VY1-VY0);c.lineWidth=12;c.strokeStyle='rgba(255,255,255,.75)';c.setLineDash([12,12]);c.lineCap='round';c.beginPath();tr.pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();c.setLineDash([]);
      c.strokeStyle=FIN[d.fin||'heart'].col;c.lineWidth=16;c.beginPath();tr.pts.slice(0,tr.i).forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();const nx=tr.pts[tr.i];if(nx&&this.ph==='trace'){drawGlow(c,'#ffe36a',nx.x,nx.y,40,.9);c.fillStyle='#ffe36a';starP(c,nx.x,nx.y,20+Math.sin(T*8)*4,9);c.fill();c.strokeStyle=LN;c.lineWidth=2;c.stroke();}}
    if(this.ph==='mic0'||this.ph==='mic'){const F=FIN[d.fin||'heart'],nm=F.name.replace('プリキュア！ ','');c.fillStyle='rgba(40,10,60,.45)';c.fillRect(VX0,VY0,VX1-VX0,VY1-VY0);
      c.fillStyle='rgba(255,255,255,.95)';rr(c,24,190,352,120,24);c.fill();c.strokeStyle=F.col;c.lineWidth=5;c.stroke();otext(c,'プリキュア！',200,228,26,'#fff',F.col);otext(c,nm,200,274,nm.length>12?22:27,'#fff',F.col);
      const rec=this.ph==='mic'&&MIC.state==='rec',ask=this.ph==='mic'&&MIC.state==='asking',lv=rec?clamp(MIC.level*9,0,1):0,p0=this.ph==='mic0'?1+Math.sin(T*6)*.06:1;
      if(rec){for(let k=0;k<3;k++){c.strokeStyle=hexA(F.col,.6-k*.18);c.lineWidth=6;c.beginPath();c.arc(200,450,70+k*16+lv*40,0,TAU);c.stroke();}}
      c.save();c.translate(200,450);c.scale(p0+lv*.25,p0+lv*.25);drawGlow(c,rec?'#ff5a7a':'#fff6a0',0,0,110,.8);c.fillStyle=rec?'#ff4a6a':'#ff7ab8';circ(c,0,0,62);c.strokeStyle='#fff';c.lineWidth=6;c.beginPath();c.arc(0,0,62,0,TAU);c.stroke();
      c.fillStyle='#fff';rr(c,-15,-34,30,48,15);c.fill();c.strokeStyle='#fff';c.lineWidth=5;c.beginPath();c.arc(0,0,24,.15*Math.PI,.85*Math.PI);c.stroke();c.beginPath();c.moveTo(0,24);c.lineTo(0,36);c.moveTo(-12,36);c.lineTo(12,36);c.stroke();c.restore();
      otext(c,rec?(MIC.heard?'いいよ！ おわったら マイクを タッチ':'きいてるよ！ さけんで！'):ask?'マイクを つかって いい？（きょか を おしてね）':this.ph==='mic'?'じゅんび ちゅう…':'マイクを タッチ！',200,548,ask?16:22,'#fff',rec?'#ff4a6a':'#b86af0','center',FONT);
      if(this.ph==='mic0'||ask){c.fillStyle='rgba(255,255,255,.85)';rr(c,120,660,160,40,20);c.fill();txt(c,'マイク なしで',200,680,15,'#8a6a9a','center',900);}}
    if(this.ph==='beam'){const k=clamp(this.t/1,0,1),F=FIN[d.fin||'heart'];c.strokeStyle=hexA(F.col,.8);c.lineWidth=70*k;c.lineCap='round';c.beginPath();c.moveTo(f.x+30,f.y-90);c.lineTo(m.x,m.y);c.stroke();c.strokeStyle='#fff';c.lineWidth=26*k;c.stroke();
      for(let i=0;i<8;i++){const q=(T*2+i/8)%1;c.fillStyle='#fff';heartP(c,lerp(f.x,m.x,q),lerp(f.y-90,m.y,q),11);c.fill();}
      const nm=F.name.replace('プリキュア！ ','');if(this.myVoice)otext(c,'♪ きみの こえ！ ♪',200,400,18,'#fff','#ffb03a','center',FONT);else if(this.micMsg)otext(c,this.micMsg,200,400,14,'#fff','#8a6a9a','center',FONT);otext(c,'プリキュア！',200,440,26,'#fff',F.col);otext(c,nm,200,480,nm.length>12?22:28,'#fff',F.col);}
    if(this.ph==='win')otext(c,'やったー！',200,440,48,'#fff','#ff5fa2');},
  drawHen(c){const t=this.t;
    if(this.ph==='pend'){drawBG(c,'dark');drawMonster(c,this.d.mon,200,230,.45,T,{});drawFutan(c,110,640,{s:2.3,pose:'hold'});drawRicky(c,310,600,{s:1.9});
      c.save();c.translate(200,430);const p=1+Math.sin(T*6)*.08;c.scale(p,p);drawGlow(c,'#ff8cc6',0,0,110,.9);c.fillStyle=gfill(c,-10,-10,60,'#ff5fa2');heartP(c,0,4,46);c.fill();c.strokeStyle='#ffd23a';c.lineWidth=8;c.stroke();c.fillStyle='#fff';starP(c,0,0,17,7);c.fill();c.restore();return;}
    const g=c.createRadialGradient(200,360,20,200,360,700);g.addColorStop(0,'#fff0f8');g.addColorStop(.5,'#ff9ac8');g.addColorStop(1,'#b86af0');c.fillStyle=g;c.fillRect(VX0-2,VY0-2,VX1-VX0+4,VY1-VY0+4);
    c.save();c.translate(200,380);c.rotate(t);for(let i=0;i<16;i++){c.fillStyle=i%2?'rgba(255,255,255,.35)':'rgba(255,230,120,.3)';c.beginPath();c.moveTo(0,0);c.arc(0,0,900,i/16*TAU,(i+.5)/16*TAU);c.closePath();c.fill();}c.restore();
    for(let i=0;i<14;i++){const a=t*3+i/14*TAU;c.fillStyle=i%2?'#fff':'#ffd23a';const px=200+Math.cos(a)*(160-Math.min(t,2)*20),py=380+Math.sin(a)*110;if(i%3)heartP(c,px,py,11);else starP(c,px,py,13,5);c.fill();}
    // ribbons
    c.strokeStyle='rgba(255,95,168,.8)';c.lineWidth=10;for(let k=0;k<2;k++){c.beginPath();for(let i=0;i<30;i++){const a=t*4+i*.25+k*Math.PI;c.lineTo(200+Math.cos(a)*(70+i*2),560-i*12+Math.sin(a)*10);}c.stroke();}
    const before=!this.cure;drawFutan(c,200,610,{s:4.4,cure:!before,spin:before?t*9:null,pose:before?'idle':'win',item:before?null:'wand',t:T});
    if(t>1.9&&t<2.6){c.fillStyle=`rgba(255,255,255,${1-Math.abs(t-2.3)/.35})`;c.fillRect(VX0-2,VY0-2,VX1-VX0+4,VY1-VY0+4);}
    if(!before){drawRicky(c,330,420,{s:1.8,cure:1,happy:1});const k=easeBack(Math.min(1,(t-2.3)*2));c.save();c.translate(200,150);c.scale(k,k);otext(c,'ひかりの たんてい！',0,0,30,'#fff','#ff3d8a');otext(c,'キュアふーちゃん',0,52,42,'#fff','#ff5fa2');c.restore();}
    else otext(c,'プリキュア！ たんてい チェンジ！',200,150,24,'#fff','#ff3d8a');},
  down(x,y){const d=this.d,m=this.m;
    if(this.ph==='pend'){if(inC(x,y,200,430,80)){this.ph='hen';this.t=0;sfx('henshin');INS=null;}return;}
    if(this.ph==='hen'){if(this.t>2.8&&SAVE.wins>0)this.t=Math.max(this.t,5.3);return;}
    if(this.ph==='fight'){if(inC(x,y,200,668,50)){this.shield=1.3;sfx('guard');ripple(200,668,'#ffb3e8');return;}
      if(inR(x,y,m.x,m.y,320,300)){this.cmb=(this.t-this.lastHit<1)?this.cmb+1:1;this.lastHit=this.t;this.shots.push({t:0});sfx('shot');return;}}
    if(this.ph==='chance'){const Q=this.Q;for(const o of Q.orbs){if(o.got||!inC(x,y,o.x,o.y,44))continue;
        if(Q.type==='count'){o.got=1;Q.cnt++;sfx('count',Q.cnt);burst(o.x,o.y,10);say(JA_NUM[Q.cnt],'rk',EN_NUM[Q.cnt]);if(Q.cnt>=Q.need)this.chanceOK();return;}
        if(o.ok){burst(o.x,o.y,20);const w=wordOf(o.k);if(w)learn(wordKey(o.k));this.chanceOK();}else{o.sh=.5;sfx('no');say([['ちがうよ！','ja'],...Q.say],'rk');}return;}}
    if(this.ph==='trace'){this.tracing=true;this.trc(x,y);}
    if(this.ph==='mic0'){if(inC(x,y,200,450,80)){this.micTap();return;}if(inR(x,y,200,680,170,48)){sfx('tap');this.startBeam(null);}}
    if(this.ph==='mic'&&MIC.state==='asking'&&inR(x,y,200,680,170,48)){sfx('tap');micCancel();this.startBeam(null);}
    if(this.ph==='mic'&&MIC.state==='rec'&&MIC.t>.6&&inC(x,y,200,450,80)){sfx('tap');micStop();}},
  chanceOK(){const d=this.d;this.ph='combo';this.t=0;sfx('ok');const sp=['rk',...[].concat(d.ally||[])];this.sup=sp[(this.ci-1+sp.length)%sp.length];say('せいかい！ '+SUPPORT[this.sup][1],this.sup);INS=null;},
  trc(x,y){const tr=this.tr,p=tr.pts[tr.i];if(p&&Math.hypot(x-p.x,y-p.y)<58){tr.i++;sfx('count',Math.min(20,tr.i));if(tr.i>=tr.pts.length){this.tracing=false;if(MIC.ok&&this.d.mic!==false){this.ph='mic0';this.t=0;sfx('ready');const F=FIN[this.d.fin||'heart'];INS={text:'マイクを タッチして、おおきな こえで さけぼう！',who:'rk',t:0};say([['マイクを タッチして、おおきな こえで さけんでね！','ja'],[F.name,'ja']],'rk');}else this.startBeam(null);}}},
  startBeam(buf){const F=FIN[this.d.fin||'heart'];this.ph='beam';this.t=0;INS=null;sfx('beam');let len=0;if(buf){len=playEcho(buf);this.myVoice=true;}else{this.myVoice=false;say(F.name,'fu');}this.beamLen=Math.max(3.2,Math.min(8,len+.6));},
  micTap(){if(this.ph!=='mic0')return;this.ph='mic';this.t=0;const self=this;micStart(buf=>{if(scene!==self||self.ph!=='mic')return;if(!buf){self.micMsg=MIC.err?'マイクが つかえなかったよ（'+MIC.err+'）':'こえが きこえなかったよ';}self.startBeam(buf);});},
  move(x,y){if(this.ph==='trace'&&this.tracing)this.trc(x,y);},
  up(){this.tracing=false;},
  hint(){const m=this.m;if(this.ph==='pend')return{x:200,y:430};if(this.ph==='fight')return m.warn>0?{x:200,y:668}:{x:m.x,y:m.y};
    if(this.ph==='chance'){const o=this.Q.orbs.find(o=>o.ok&&!o.got);return o&&IDLE>10?{x:o.x,y:o.y}:null;}if(this.ph==='trace'){const p=this.tr.pts[this.tr.i];return p?{x:p.x,y:p.y}:null;}if(this.ph==='mic0')return{x:200,y:450};return null;},
};

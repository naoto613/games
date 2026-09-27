// ================= helpers =================
function mkCells(rx,ry,st){const a=[];for(let y=-ry;y<=ry;y+=st)for(let x=-rx;x<=rx;x+=st)if((x/rx)**2+(y/ry)**2<=1)a.push({x,y,v:0});return a;}
function paintCells(cells,cx,cy,x,y,r,key='v'){let ch=0;for(const q of cells)if(!q[key]&&Math.hypot(cx+q.x-x,cy+q.y-y)<r){q[key]=1;ch++;}return ch;}
function cov(cells,key='v'){return cells.filter(q=>q[key]).length/cells.length;}
function customerBubble(c,x,y,drawFn){c.fillStyle='#fff';c.strokeStyle='#ffb3d6';c.lineWidth=3;rr(c,x,y,150,74,20);c.fill();c.stroke();c.beginPath();c.moveTo(x+10,y+60);c.lineTo(x-12,y+86);c.lineTo(x+30,y+72);c.fill();drawFn(x+75,y+37);}
// ================= pizza =================
SCN.pizza={bg:'#fff0e0',song:'play',
  TOPS:[['tomato','トマト'],['cheesePz','チーズ'],['sausage','ソーセージ'],['pepper','ピーマン'],['mush','きのこ'],['corn','コーン']],
  enter(){this.ph='knead';this.t=0;this.fin=0;this.r=60;this.rub=0;this.sauce=mkCells(150,150,18);this.cheese=mkCells(150,150,18);this.tops=[];this.cuts=[];this.eaten=0;this.dr=null;this.bake=0;
    this.cust={k:pick(['bear','cat','dog','panda','pig']),want:pick(['tomato','sausage','pepper','mush','corn'])};this.perfect=false;
    say(`${WORDS[this.cust.k][0]}さんが ピザを ちゅうもん！ まずは きじを ゆびで こねこね のばそう`);},
  P(){return{x:300,y:H*.46};},
  drawTop(c,k,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);if(k==='tomato'){c.fillStyle='#e8302a';circ(c,0,0,14);c.fillStyle='#ff7a6a';circ(c,0,0,9);c.fillStyle='#ffe0a0';for(let i=0;i<4;i++){const a=i*1.6;circ(c,Math.cos(a)*5,Math.sin(a)*5,1.8);}}
    else if(k==='sausage'){c.fillStyle='#d8505a';circ(c,0,0,12);c.fillStyle='#ff8a90';for(const [a,b] of [[-4,-3],[4,2],[-2,5]])circ(c,a,b,2);}
    else if(k==='pepper'){c.strokeStyle='#3aa040';c.lineWidth=5;c.beginPath();c.arc(0,0,11,0,TAU);c.stroke();}
    else if(k==='mush'){c.fillStyle='#e8d0b0';c.beginPath();c.arc(0,-2,12,Math.PI,TAU);c.fill();c.fillRect(-4,-2,8,12);}
    else if(k==='corn'){c.fillStyle='#ffd23a';for(const [a,b] of [[-6,0],[6,-3],[0,6],[3,-8]])ell(c,a,b,4,5);}
    else{c.fillStyle='#fff3a0';for(let i=0;i<5;i++){c.save();c.rotate(i*1.3);c.fillRect(-8,-2,16,4);c.restore();}}c.restore();},
  update(dt){this.t+=dt;if(this.ph==='bake'&&this.baking){this.bake+=dt/3;if(this.bake>=1){this.baking=false;this.bake=1;sfx('chin');say('やけた！ こんどは ゆびで すーっと なぞって ピザを きろう！');setTimeout(()=>{if(scene===this){this.ph='cut';}},1000);}}
    if(this.fin>0){this.fin+=dt;if(this.fin>2.4&&this.fin<9){this.fin=9;celebrate('pizza',this.perfect);}}},
  draw(c){c.fillStyle='#fff0e0';c.fillRect(-400,0,W+800,H);c.fillStyle='#ffe0c8';for(let x=0;x<W;x+=60)c.fillRect(x,0,30,H*.64);c.fillStyle=vfill(c,H*.64,H,'#c8905a',.05,-.1);c.fillRect(-400,H*.64,W+800,H);
    const P=this.P(),ph=this.ph,cu=this.cust;
    drawAnimal(c,cu.k,70,H*.36,.6,{t:T,happy:this.eaten>0||this.perfect,eat:this.eatT>0});customerBubble(c,120,H*.36-190,(x,y)=>{SPECIAL_THING.pizza(c,x-30,y,.8);c.fillStyle='#b08aa0';c.font=`800 20px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('+',x+8,y);this.drawTop(c,cu.want,x+44,y,1.3);});
    if(ph==='bake'){c.fillStyle='#b8704a';rr(c,130,H*.26,340,260,40);c.fill();c.fillStyle='#3a2a2a';rr(c,170,H*.26+50,260,150,70);c.fill();const gl=this.baking?.5+Math.sin(T*10)*.15:0;c.fillStyle=`rgba(255,140,40,${gl})`;rr(c,170,H*.26+50,260,150,70);c.fill();if(!this.baking&&this.bake<1){drawBtn(c,300,H*.26+300,50,'#ff5f6f','play',true);}
      c.save();c.translate(0,this.baking?0:0);c.globalAlpha=this.bake>=1?1:.9;c.restore();c.fillStyle='#fff';c.font=`800 28px ${FONT}`;c.textAlign='center';c.fillText(this.baking?`${Math.ceil((1-this.bake)*3)}`:this.bake>=1?'できた！':'オーブン',300,H*.26+30);}
    else{const r=ph==='knead'?this.r:160;c.fillStyle='rgba(90,40,40,.2)';ell(c,P.x,P.y+14,r+10,r*.3+10);
      c.save();c.translate(P.x,P.y);c.fillStyle=this.bake>=1?'#d89040':'#f4d8a0';circ(c,0,0,r);if(ph!=='knead'){c.fillStyle=this.bake>=1?'#e8a050':'#fae6c0';circ(c,0,0,r-14);
        c.save();c.beginPath();c.arc(0,0,r-16,0,TAU);c.clip();c.fillStyle='#e0402e';for(const q of this.sauce)if(q.v)circ(c,q.x,q.y,15);c.fillStyle=this.bake>=1?'#ffd870':'#fff3a0';for(const q of this.cheese)if(q.v){for(let k=0;k<2;k++){c.save();c.translate(q.x+((k*7)%10)-4,q.y+((k*11)%10)-4);c.rotate(q.x+k);c.fillRect(-7,-2,14,4);c.restore();}}c.restore();
        for(const t of this.tops)this.drawTop(c,t.k,t.x,t.y,1.3);
        c.strokeStyle='#a8703a';c.lineWidth=5;for(const a of this.cuts){c.beginPath();c.moveTo(Math.cos(a)*r,Math.sin(a)*r);c.lineTo(-Math.cos(a)*r,-Math.sin(a)*r);c.stroke();}
        if(this.eaten>0){c.fillStyle='#fff0e0';c.beginPath();c.moveTo(0,0);c.arc(0,0,r+4,-Math.PI/2,-Math.PI/2+this.eaten/8*TAU);c.closePath();c.fill();}}
      c.restore();if(ph==='knead'){c.fillStyle='#fff';rr(c,P.x-120,P.y+190,240,20,10);c.fill();c.fillStyle='#ffb03a';rr(c,P.x-120,P.y+190,240*clamp((this.r-60)/100,0,1),20,10);c.fill();}}
    if(ph==='sauce'||ph==='cheese'){const k=cov(ph==='sauce'?this.sauce:this.cheese);c.fillStyle='#fff';rr(c,P.x-120,P.y+190,240,20,10);c.fill();c.fillStyle=ph==='sauce'?'#e0402e':'#ffd23a';rr(c,P.x-120,P.y+190,240*Math.min(1,k/.75),20,10);c.fill();
      const tx=this.px??500,ty=this.py??H*.8;if(ph==='sauce'){c.save();c.translate(tx+10,ty-40);c.rotate(.5);c.fillStyle='#e0402e';rr(c,-16,-40,32,60,10);c.fill();c.fillStyle='#fff';rr(c,-6,-50,12,14,3);c.fill();c.restore();}else{c.save();c.translate(tx+10,ty-40);c.fillStyle='#ffe07a';rr(c,-22,-30,44,50,8);c.fill();c.fillStyle='#fff';c.font=`800 12px ${FONT}`;c.textAlign='center';c.fillText('チーズ',0,0);c.restore();}}
    if(ph==='top'){tray(c,H-80,120);this.TOPS.filter(t=>t[0]!=='cheesePz').forEach((t,i)=>{this.drawTop(c,t[0],90+i*105,H-80,1.8);});if(this.dr)this.drawTop(c,this.dr.k,this.dr.x,this.dr.y,1.8);if(this.tops.length>=5)drawBtn(c,W-70,H*.64+40,42,'#4cd08a','check',true);}
    if(ph==='cut'){c.fillStyle='#fff';c.font=`800 22px ${FONT}`;c.textAlign='center';c.fillText(`きった かず ${this.cuts.length} / 4`,W/2,H*.8);if(this.sw){c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=4;c.setLineDash([8,6]);c.beginPath();c.moveTo(this.sw.sx,this.sw.sy);c.lineTo(this.sw.x,this.sw.y);c.stroke();c.setLineDash([]);SPECIAL_THING.pizzacutter(c,this.sw.x,this.sw.y,1.4);}}
    drawFuka(c,520,H*.9,{outfit:outfit({acc:'none'}),t:T,sc:2.1,cheer:this.fin>0,point:ph!=='serve'});SPECIAL_THING.chefhat(c,520,H*.9-44*2.1*.98-12,1.2);drawRikki(c,420,H*.93,{sc:1.5,t:T,eat:this.eatT>0});this.rkPos={x:420,y:H*.93,sc:1.5};
    stepDots(c,6,{knead:0,sauce:1,cheese:1,top:2,bake:3,cut:4,serve:5}[ph],128);},
  down(x,y){const P=this.P(),ph=this.ph;this.px=x;this.py=y;this.lx=x;this.ly=y;
    if(ph==='top'){if(this.tops.length>=5&&hitC(x,y,W-70,H*.64+40,52)){this.ph='bake';this.t=0;sfx('fanfare');say('オーブンで やこう！ あかい ボタンを タッチ');return;}this.TOPS.filter(t=>t[0]!=='cheesePz').forEach((t,i)=>{if(hitC(x,y,90+i*105,H-80,46)){this.dr={k:t[0],x,y};sfx('tap');say(t[1]);}});return;}
    if(ph==='bake'){if(!this.baking&&this.bake<1&&hitC(x,y,300,H*.26+300,60)){this.baking=true;sfx('pop');}return;}
    if(ph==='cut'){if(Math.hypot(x-P.x,y-P.y)<220)this.sw={sx:x,sy:y,x,y};return;}
    if(ph==='serve'){if(Math.hypot(x-P.x,y-P.y)<170&&this.eaten<8){this.eaten++;this.eatT=.6;setTimeout(()=>{this.eatT=0;},600);sfx('bite');if(this.eaten===2)say('おいしい〜！');if(this.eaten>=8){this.fin=.01;sfx('fanfare');confetti(60);say(this.perfect?`${WORDS[this.cust.k][0]}さん「ちゅうもん どおり！ さいこうの ピザ！」`:'ごちそうさまでした！');}}return;}},
  move(x,y){const P=this.P(),ph=this.ph;const d=Math.hypot(x-(this.lx??x),y-(this.ly??y));this.lx=x;this.ly=y;this.px=x;this.py=y;
    if(ph==='knead'&&Math.hypot(x-P.x,y-P.y)<this.r+40){this.r=Math.min(160,this.r+d*.06);if(Math.random()<.1)sfx('squish');if(this.r>=160){this.ph='sauce';sfx('spark');say('まるく のびた！ トマトソースを ぬろう');}}
    if(ph==='sauce'){if(paintCells(this.sauce,P.x,P.y,x,y,40)&&Math.random()<.2)sfx('squish');if(cov(this.sauce)>=.75){this.ph='cheese';this.sauce.forEach(q=>q.v=1);sfx('spark');say('つぎは チーズを ぱらぱら！');}}
    else if(ph==='cheese'){paintCells(this.cheese,P.x,P.y,x,y,40);if(cov(this.cheese)>=.75){this.ph='top';this.cheese.forEach(q=>q.v=1);sfx('spark');say('すきな ぐを のせてね！ 5こ いじょう');}}
    if(this.dr){this.dr.x=x;this.dr.y=y;}if(this.sw){this.sw.x=x;this.sw.y=y;}},
  up(x,y){const P=this.P();if(this.dr){const d=this.dr;this.dr=null;if(Math.hypot(x-P.x,y-P.y)<140){this.tops.push({k:d.k,x:x-P.x,y:y-P.y});sfx('pop');burst(x,y,6,'star');if(d.k===this.cust.want&&!this.said){this.said=1;say('ちゅうもんの ぐ！');}}}
    if(this.sw){const s=this.sw;this.sw=null;const dx=x-s.sx,dy=y-s.sy;if(Math.hypot(dx,dy)>160&&this.cuts.length<4){this.cuts.push(Math.atan2(dy,dx));sfx('crack');if(this.cuts.length>=4){this.perfect=this.tops.some(t=>t.k===this.cust.want);this.ph='serve';sfx('fanfare');say('できあがり！ タッチして みんなで たべよう');}}}},
  hint(){const P=this.P(),ph=this.ph;if(ph==='knead'||ph==='sauce'||ph==='cheese')return{x:P.x-100,y:P.y,x2:P.x+100,y2:P.y};if(ph==='top')return this.tops.length>=5?{x:W-70,y:H*.64+40}:{x:90,y:H-80,x2:P.x,y2:P.y};if(ph==='bake')return this.baking?null:{x:300,y:H*.26+300};if(ph==='cut')return{x:P.x-180,y:P.y-60,x2:P.x+180,y2:P.y+60};return{x:P.x,y:P.y};},
  hintText(){return{knead:'ゆびで こねこね',sauce:'ソースを ぬろう',cheese:'チーズを ぱらぱら',top:'ぐを のせよう',bake:'オーブンの ボタン',cut:'ゆびで すーっと なぞって きろう',serve:'タッチして たべよう'}[this.ph]||'';}};

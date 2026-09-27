// ================= amusement park =================
SCN.yuen={bg:'#bfe9ff',song:'play',
  RIDES:[['mgr','メリーゴーランド','merry-go-round'],['fer','かんらんしゃ','Ferris wheel'],['cst','ジェットコースター','roller coaster']],
  enter(){this.ph='menu';this.t=0;this.fin=0;this.lucky=false;this.done=this.done||[];say('ゆうえんちへ ようこそ！ どの のりものに のる？');},
  rideP(i){return[{x:155,y:H*.42},{x:445,y:H*.42},{x:300,y:H*.72}][i];},
  start(id){this.ph=id;this.t=0;this.cnt=0;this.win=false;
    if(id==='mgr'){this.sub='pick';this.rot=0;this.hcol=null;say('メリーゴーランド！ のりたい おうまさんを えらんでね');}
    if(id==='fer'){this.sub='wait';this.rot=0;this.starT=null;say('かんらんしゃ！ ピンクの ゴンドラを タッチして のろう');}
    if(id==='cst'){this.sub='wait';this.u=0;this.lap=0;this.bz={};this.pk=null;say('ジェットコースター！ GOボタンで しゅっぱつ！ てっぺんで タッチすると ばんざい！');}},
  finish(){this.ph='end';this.t=0;sfx('fanfare');confetti(70);if(!this.done.includes(this.rid))this.done.push(this.rid);},
  HC:['#ffffff','#ff9ac8','#9ad0ff','#ffe08a','#c8b0ff','#a8ecc8'],
  ty(u){const b=H*.74;const g=(c0,w,a)=>a*Math.exp(-(((u-c0)/w)**2));return b-g(.22,.09,H*.34)-g(.52,.08,H*.24)-g(.8,.07,H*.17)+Math.sin(u*TAU)*6;},
  tx(u){return 30+u*540;},
  update(dt){this.t+=dt;const ph=this.ph;
    if(ph==='mgr'&&this.sub==='ride'){this.rot+=dt*1.3;const a=this.rot,front=Math.sin(a)>.85;if(front&&!this.inWin){this.inWin=true;this.tapped=false;}if(!front)this.inWin=false;if(this.rot>TAU*3+Math.PI/2){this.rid='mgr';this.lucky=this.cnt>=3;this.finish();say(`たのしかったね！ りっきーに ${this.cnt}かい てを ふったよ！`);}}
    if(ph==='fer'&&this.sub==='ride'){this.rot+=dt*TAU/16;const top=Math.abs((this.rot%TAU)-Math.PI)<.45;if(top&&!this.saidTop){this.saidTop=1;sfx('chin');say('てっぺん！ たかーい！ キラキラの ほしを さがしてタッチ！');this.starT={x:rand(120,480),y:rand(140,260),got:false};}if(this.rot>=TAU){this.rid='fer';this.finish();say('いい けしきだったね！');}}
    if(ph==='cst'&&this.sub==='ride'){const u=this.u;let v;if(u<.22)v=.07;else{const h=this.ty(.22)-this.ty(u);v=(Math.sqrt(Math.max(0,-h)*2*900)+140)/1400;if(Math.random()<dt*2&&this.ty(u+.01)>this.ty(u))sfx('whoosh');}this.u+=v*dt;if(u<.22&&Math.floor(u*60)!==Math.floor(this.u*60))sfx('tick');
      const pk=[.22,.52,.8].find(p=>Math.abs(this.u-p)<.035);this.pk=pk??null;
      if(this.u>=1){this.lap++;if(this.lap>=2){this.sub='stop';this.rid='cst';this.lucky=Object.keys(this.bz).length>=5;this.finish();say(`ばんざい ${Object.keys(this.bz).length}かい！ スリル まんてん！`);}else{this.u=0;say('もう いっかい！');}}}
    if(ph==='end'&&this.t>2.2&&!this.fin){this.fin=1;celebrate('yuen',this.lucky);}},
  drawMenu(c){skyBg(c,'#8fd8ff','#e6f8ff',H*.5);cloud(c,120,120,.7,true);cloud(c,480,90,.55);c.fillStyle=vfill(c,H*.3,H,'#a8e07a',.05,-.08);c.fillRect(-400,H*.3,W+800,H);
    c.fillStyle='#ff6f91';rr(c,60,105,480,60,30);c.fill();c.fillStyle='#fff';c.font=`36px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.fillText('ふーちゃん ゆうえんち',W/2,137);
    for(let i=0;i<12;i++){c.fillStyle=['#ff6f91','#ffd23a','#5aa8ff','#6cd08a'][i%4];c.beginPath();c.moveTo(i*52,175);c.lineTo(i*52+26,205);c.lineTo(i*52+52,175);c.fill();}
    this.RIDES.forEach(([id,ja],i)=>{const p=this.rideP(i);c.fillStyle='rgba(255,255,255,.85)';rr(c,p.x-135,p.y-150,270,260,30);c.fill();c.strokeStyle=['#ff9ac8','#b48cff','#ffb03a'][i];c.lineWidth=6;c.stroke();
      if(id==='mgr'){this.drawCarousel(c,p.x,p.y+40,.42,T,null);}else if(id==='fer'){this.drawWheel(c,p.x,p.y-10,.36,T*.3,false);}else{c.save();c.translate(p.x-150,p.y-150);c.scale(.5,.5);c.strokeStyle='#ff5f6f';c.lineWidth=10;c.beginPath();for(let u=0;u<=1;u+=.02)c.lineTo(20+u*560,420-Math.exp(-(((u-.3)/.12)**2))*300-Math.exp(-(((u-.7)/.1)**2))*200);c.stroke();c.restore();}
      c.fillStyle='#5a3a5a';c.font=`800 22px ${FONT}`;c.fillText(ja,p.x,p.y+88);if(this.done.includes(id)){c.fillStyle='#6cd08a';circ(c,p.x+110,p.y-126,20);c.strokeStyle='#fff';c.lineWidth=5;c.beginPath();c.moveTo(p.x+100,p.y-126);c.lineTo(p.x+107,p.y-118);c.lineTo(p.x+120,p.y-134);c.stroke();}});
    drawFuka(c,90,H-40,{outfit:outfit(),t:T,sc:2.4,point:1});drawRikki(c,520,H-40,{sc:1.9,t:T});this.rkPos={x:520,y:H-40,sc:1.9};},
  drawCarousel(c,cx,cy,s,rot,hcol){c.save();c.translate(cx,cy);c.scale(s,s);const R=240;
    c.fillStyle='#ffd0e6';c.beginPath();c.ellipse(0,80,R+30,60,0,0,TAU);c.fill();c.fillStyle='#ff9ac8';c.fillRect(-R-30,80,2*R+60,30);c.beginPath();c.ellipse(0,110,R+30,60,0,0,Math.PI);c.fill();
    c.fillStyle='#ffd23a';c.fillRect(-14,-300,28,380);
    const hs=[...Array(6)].map((_,i)=>{const a=rot+i*TAU/6;return{i,a,x:Math.cos(a)*R,y:Math.sin(a)*50,z:Math.sin(a)};}).sort((p,q)=>p.z-q.z);
    for(const h of hs){const sc=(.85+h.z*.15)*1.5,bob=Math.sin(rot*3+h.i*2)*20;c.save();c.translate(h.x,h.y+bob);c.scale(sc,sc);drawHorse(c,0,0,1,h.i===0&&hcol?hcol:this.HC[h.i],rot*3);if(h.i===0&&hcol)drawFuka(c,-4,-36,{outfit:outfit(),t:T,sc:1.3,cheer:this.inWin,wave:!this.inWin});c.restore();}
    c.fillStyle='#ff6f91';c.beginPath();c.moveTo(-R-50,-300);c.lineTo(0,-420);c.lineTo(R+50,-300);c.closePath();c.fill();for(let i=0;i<10;i++){c.fillStyle=i%2?'#fff':'#ff6f91';c.beginPath();const x=-R-50+i*(2*R+100)/10;c.moveTo(x,-300);c.lineTo(x+(2*R+100)/10,-300);c.quadraticCurveTo(x+(2*R+100)/20,-270,x,-300);c.fill();}c.fillStyle='#ffd23a';star(c,0,-430,24,10);c.fill();
    for(let i=0;i<12;i++){c.fillStyle=Math.floor(T*4+i)%2?'#fff6a0':'#ffd23a';circ(c,-R-40+i*(2*R+80)/11,-296,7);}c.restore();},
  drawWheel(c,cx,cy,s,rot,ride){c.save();c.translate(cx,cy);c.scale(s,s);const R=240;c.strokeStyle='#8a6ad8';c.lineWidth=10;c.beginPath();c.moveTo(-120,R+100);c.lineTo(0,0);c.lineTo(120,R+100);c.stroke();
    c.strokeStyle='#b48cff';c.lineWidth=8;c.beginPath();c.arc(0,0,R,0,TAU);c.stroke();c.lineWidth=4;c.beginPath();c.arc(0,0,R*.6,0,TAU);c.stroke();
    for(let i=0;i<8;i++){const a=rot+i*TAU/8+Math.PI/2;c.beginPath();c.moveTo(0,0);c.lineTo(Math.cos(a)*R,Math.sin(a)*R);c.stroke();}
    for(let i=0;i<8;i++){const a=rot+i*TAU/8+Math.PI/2,x=Math.cos(a)*R,y=Math.sin(a)*R;c.strokeStyle='#6a5a8a';c.lineWidth=3;c.beginPath();c.moveTo(x,y);c.lineTo(x,y+14);c.stroke();const col=i===0?'#ff6fae':['#ffd23a','#5aa8ff','#6cd08a','#ff9a5c'][i%4];c.fillStyle=col;rr(c,x-36,y+14,72,58,[14,14,20,20]);c.fill();c.fillStyle='#e8f8ff';rr(c,x-26,y+22,52,26,8);c.fill();
      if(i===0&&ride){c.save();c.beginPath();c.rect(x-26,y+22,52,26);c.clip();drawFuka(c,x-10,y+110,{outfit:outfit(),t:T,sc:1.5,wave:1});drawRikki(c,x+15,y+84,{sc:1,t:T});c.restore();}}
    c.fillStyle='#ffd23a';circ(c,0,0,26);c.restore();},
  draw(c){const ph=this.ph;if(ph==='menu'){this.drawMenu(c);return;}const r=this.rid||ph;
    if(ph==='mgr'||r==='mgr'&&ph==='end'){skyBg(c,'#ffd8ec','#fff4fa',H);c.fillStyle='#ffe8f4';c.fillRect(-400,H*.62,W+800,H);
      if(this.sub==='pick'){this.HC.slice(0,6).forEach((col,i)=>{const x=110+(i%3)*190,y=H*.36+Math.floor(i/3)*H*.24;drawHorse(c,x,y,1.1,col,T+i);});c.fillStyle='#8a5a8a';c.font=`800 26px ${FONT}`;c.textAlign='center';c.fillText('のりたい おうまさんを タッチ！',W/2,H*.18);}
      else{this.drawCarousel(c,W/2,H*.55,1,this.rot,this.hcol);drawRikki(c,W/2+150,H*.9,{sc:2.2,t:T,wave:1,happy:1,clap:RK.clap});this.rkPos=null;
        if(this.inWin&&!this.tapped&&ph==='mgr'){c.fillStyle='#fff';rr(c,W/2-150,H*.72,300,56,28);c.fill();c.fillStyle='#ff5fa2';c.font=`800 24px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('いまだ！ タッチで てを ふろう',W/2,H*.72+28);}
        c.fillStyle='#fff';rr(c,20,112,160,44,22);c.fill();c.fillStyle='#ff5fa2';c.font=`800 20px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('バイバイ '+this.cnt,100,134);}}
    else if(ph==='fer'||r==='fer'&&ph==='end'){const top=this.sub==='ride'&&Math.abs((this.rot%TAU)-Math.PI)<.6;skyBg(c,top?'#3a3a8a':'#8fd8ff',top?'#ff9ac8':'#e6f8ff',H*.7);if(top){c.fillStyle='#fff';for(let i=0;i<30;i++)circ(c,(i*97)%W,(i*53)%(H*.4),1.5);}
      cloud(c,(T*20)%800-100,H*.2,.7,true);c.fillStyle=vfill(c,H*.7,H,'#a8e07a',.05,-.08);c.fillRect(-400,H*.7,W+800,H);for(let i=0;i<6;i++){c.fillStyle=['#ffd0e4','#d8f0ff','#fff4c8'][i%3];rr(c,i*110-20,H*.62,90,H*.1,[10,10,0,0]);c.fill();}
      this.drawWheel(c,W/2,H*.44,1,this.rot,true);
      const st=this.starT;if(st&&!st.got&&top){c.fillStyle='#ffd23a';star(c,st.x,st.y,24+Math.sin(T*8)*4,10);c.fill();c.strokeStyle='#fff';c.lineWidth=3;c.stroke();}
      if(this.sub==='wait'){c.fillStyle='#fff';rr(c,W/2-130,H*.86,260,54,27);c.fill();c.fillStyle='#b48cff';c.font=`800 24px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('ゴンドラに タッチ！',W/2,H*.86+27);}}
    else{skyBg(c,'#8fd8ff','#e6f8ff',H);cloud(c,140,150,.7,true);cloud(c,460,110,.5);c.fillStyle=vfill(c,H*.76,H,'#a8e07a',.05,-.08);c.fillRect(-400,H*.76,W+800,H);
      c.strokeStyle='#c8a0e8';c.lineWidth=5;for(let u=0;u<=1;u+=.04){c.beginPath();c.moveTo(this.tx(u),this.ty(u)+6);c.lineTo(this.tx(u),H*.78);c.stroke();}
      c.strokeStyle='#ff5f6f';c.lineWidth=12;c.lineJoin='round';c.beginPath();for(let u=0;u<=1.001;u+=.005)c.lineTo(this.tx(u),this.ty(u));c.stroke();c.strokeStyle='#fff';c.lineWidth=3;c.stroke();
      c.fillStyle='#ffd23a';rr(c,0,H*.74-10,90,20,6);c.fill();
      const u=Math.min(this.u,1),x=this.tx(u),y=this.ty(u),ang=Math.atan2(this.ty(u+.005)-this.ty(u-.005),this.tx(u+.005)-this.tx(u-.005));const bz=this.pk!=null&&this.bz[this.lap+'_'+this.pk];
      c.save();c.translate(x,y-8);c.rotate(ang);c.scale(1.6,1.6);drawFuka(c,-10,-10,{outfit:outfit(),t:T,sc:1.1,cheer:!!bz||this.pk!=null&&!!this.bz[this.lap+'_'+this.pk],oh:this.pk==null&&this.sub==='ride'&&ang>.3});drawRikki(c,16,-8,{sc:.8,t:T,clap:1});c.fillStyle=vfill(c,-24,0,'#ffd23a',.2,-.1);rr(c,-36,-26,70,30,10);c.fill();c.fillStyle='#4a4a6a';circ(c,-22,6,7);circ(c,22,6,7);c.restore();
      if(this.pk!=null&&!bz&&this.sub==='ride'){c.fillStyle='#fff';rr(c,W/2-140,H*.84,280,56,28);c.fill();c.fillStyle='#ff5f6f';c.font=`800 26px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('いまだ！ タッチで ばんざい！',W/2,H*.84+28);}
      if(this.sub==='wait'){drawBtn(c,W/2,H*.88,56,'#ff5f6f','play',true);c.fillStyle='#5a3a5a';c.font=`800 24px ${FONT}`;c.textAlign='center';c.fillText('GO!',W/2,H*.88+80);}
      c.fillStyle='#fff';rr(c,20,112,170,44,22);c.fill();c.fillStyle='#ff5f6f';c.font=`800 20px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('ばんざい '+Object.keys(this.bz).length,105,134);}
    if(ph==='end'){c.font=`44px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.lineWidth=10;c.strokeStyle='#fff';c.strokeText('たのしかった！',W/2,H*.2);c.fillStyle='#ff5fa2';c.fillText('たのしかった！',W/2,H*.2);}},
  down(x,y){const ph=this.ph;
    if(ph==='menu'){for(let i=0;i<3;i++){const p=this.rideP(i);if(Math.abs(x-p.x)<135&&y>p.y-150&&y<p.y+110){sfx('pop');this.start(this.RIDES[i][0]);return;}}return;}
    if(ph==='mgr'){if(this.sub==='pick'){this.HC.forEach((col,i)=>{const hx=110+(i%3)*190,hy=H*.36+Math.floor(i/3)*H*.24;if(Math.abs(x-hx)<80&&y>hy-130&&y<hy+30){this.hcol=col;this.sub='ride';this.rot=-Math.PI/2;sfx('fanfare');say('しゅっぱつ！ ふーちゃんが まえに きたら タッチして りっきーに てを ふろう！');}});return;}
      if(this.inWin&&!this.tapped){this.tapped=true;this.cnt++;sfx('heart');rkCheer();burst(W/2+150,H*.8,14,'heart');say(pick(['りっきー、バイバーイ！','やっほー！','みてみて〜！']));}return;}
    if(ph==='fer'){if(this.sub==='wait'){this.sub='ride';this.saidTop=0;sfx('bell');say('しゅっぱつ！ ゆっくり のぼっていくよ');return;}const st=this.starT;if(st&&!st.got&&hitC(x,y,st.x,st.y,50)){st.got=true;this.lucky=true;sfx('fanfare');confetti(60);say('ながれぼしを つかまえた！ ラッキー！');}return;}
    if(ph==='cst'){if(this.sub==='wait'){if(hitC(x,y,W/2,H*.88,70)){this.sub='ride';sfx('bell');say('カタカタカタ… のぼっていくよ！');}return;}if(this.sub==='ride'&&this.pk!=null){const key=this.lap+'_'+this.pk;if(!this.bz[key]){this.bz[key]=1;sfx('spark');rkCheer();say(pick(['ばんざーい！','きゃー！','ひゃっほー！']));burst(this.tx(this.u),this.ty(this.u)-60,12,'star');}}}},
  hint(){const ph=this.ph;if(ph==='menu'){const i=this.RIDES.findIndex(r=>!this.done.includes(r[0]));const p=this.rideP(i<0?0:i);return{x:p.x,y:p.y};}
    if(ph==='mgr')return this.sub==='pick'?{x:110,y:H*.36-50}:this.inWin&&!this.tapped?{x:W/2,y:H*.75}:null;
    if(ph==='fer'){if(this.sub==='wait')return{x:W/2,y:H*.44+280};const st=this.starT;return st&&!st.got?{x:st.x,y:st.y}:null;}
    if(ph==='cst')return this.sub==='wait'?{x:W/2,y:H*.88}:this.pk!=null?{x:W/2,y:H*.5}:null;return null;},
  hintText(){return this.ph==='menu'?'のりものを えらんでね':'';}};

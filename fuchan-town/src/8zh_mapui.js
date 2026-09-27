// ================= map UI: pick attractions from big cards =================
(function(){const M=SCN.map,oUpdate=M.update,oUp=M.up,oDown=M.down,oMove=M.move,oDraw=M.draw;
  const areaList=()=>HOMEL.map(h=>({C:h,icon:(HOMES.find(q=>q.id===h.id)||{}).icon})).concat(CATS.map(C=>({C,icon:C.icon})));
  M.cardsLay=function(){const n=this.D0.bs.length,cols=3,rows=Math.ceil(n/cols),gap=12,cw=(W-32-gap*(cols-1))/cols,ch=rows>2?170:188,top=H-22-rows*ch-(rows-1)*gap;
    return{n,cols,rows,cw,ch,gap,top,pos:i=>{const r=Math.floor(i/cols),k=i%cols,inRow=Math.min(cols,n-r*cols),x0=W/2-(inRow*cw+(inRow-1)*gap)/2;return{x:x0+k*(cw+gap),y:top+r*(ch+gap)};}};};
  M.listLay=function(){const L=areaList(),cols=3,gap=12,cw=(W-60-gap*2)/3,ch=150,rows=Math.ceil(L.length/cols),top=Math.max(150,H/2-(rows*(ch+gap))/2+30);
    return{L,cw,ch,top,pos:i=>{const r=Math.floor(i/cols),k=i%cols,inRow=Math.min(cols,L.length-r*cols),x0=W/2-(inRow*cw+(inRow-1)*gap)/2;return{x:x0+k*(cw+gap),y:top+r*(ch+gap)};}};};
  M.update=function(dt){oUpdate.call(this,dt);if(!this.ready||this.mode!=='dist'||this.walkIn)return;const D=this.D0,S=D.S,dv=this.dv,R=D.R;
    // aim lower so the shop sits in the upper half, above the card panel
    S.cam.position.set(-Math.sin(dv)*12.5,8.5,Math.cos(dv)*12.5);S.cam.lookAt(Math.sin(dv)*R*.8,-2.4,-Math.cos(dv)*R*.8);
    if(this.pop>0)this.pop=Math.max(0,this.pop-dt*3);};
  M.drawDist=function(c){const D=this.D0,S=D.S,C=this.dc,q=SAVE.quest,b=this.cur();
    c.fillStyle=C.roof;rr(c,W/2-170,112,340,56,28);c.fill();c.strokeStyle='#fff';c.lineWidth=4;c.stroke();c.fillStyle='#fff';c.font=`30px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.fillText(C.name,W/2,142,320);
    const Ly=this.cardsLay();
    if(!this.walkIn&&D.bs.length>1){const ay=Ly.top-150;hud3Btn(c,50,ay,30,C.roof,'prev');hud3Btn(c,W-50,ay,30,C.roof,'next');}
    // panel
    c.fillStyle='rgba(255,255,255,.9)';rr(c,6,Ly.top-58,W-12,H-Ly.top+70,30);c.fill();c.strokeStyle=C.roof;c.lineWidth=4;c.stroke();
    c.fillStyle=shade(C.roof,-.3);c.font=`800 22px ${FONT}`;c.fillText('どれで あそぶ？ タッチしてね',W/2,Ly.top-30);
    D.bs.forEach((o,i)=>{const P=Ly.pos(i),p=o.p,sel=o===b,cw=Ly.cw,ch=Ly.ch;const k=sel?1+(this.pop||0)*.08:1;c.save();c.translate(P.x+cw/2,P.y+ch/2);c.scale(k,k);c.translate(-cw/2,-ch/2);
      c.fillStyle='rgba(60,40,90,.15)';rr(c,3,6,cw,ch,22);c.fill();c.fillStyle=sel?'#fffaf0':'#ffffff';rr(c,0,0,cw,ch,22);c.fill();c.fillStyle=p.wall||'#fff';rr(c,6,6,cw-12,ch*.52,18);c.fill();
      c.strokeStyle=sel?p.roof:shade(p.roof,.45);c.lineWidth=sel?7:3;rr(c,0,0,cw,ch,22);c.stroke();
      const iy=ch*.3;c.fillStyle='#fff';circ(c,cw/2,iy,40);c.strokeStyle=p.roof;c.lineWidth=3;c.beginPath();c.arc(cw/2,iy,40,0,TAU);c.stroke();drawThing(c,p.icon,cw/2,iy,.72);
      c.fillStyle=shade(p.roof,-.4);c.font=`800 ${p.name.length>7?17:20}px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(p.name,cw/2,ch*.66,cw-12);starsRow(c,cw/2,ch*.85,bestOf(p.id),11);
      if(p.nw){c.fillStyle='#ff5f6f';rr(c,cw-58,-10,58,24,12);c.fill();c.fillStyle='#fff';c.font=`800 14px ${FONT}`;c.fillText('NEW',cw-29,2);}
      if(q.list.includes(p.id)){const dn=q.done.includes(p.id),by=14+(dn?0:Math.sin(T*5)*4);c.fillStyle=dn?'#6cd08a':'#ff5f6f';circ(c,14,by,18);c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.arc(14,by,18,0,TAU);c.stroke();c.fillStyle='#fff';c.font=`900 20px ${FONT}`;c.fillText(dn?'✓':'！',14,by+1);}
      if(sel&&!this.walkIn){const g=1+Math.sin(T*6)*.06;c.save();c.translate(cw-26,ch*.3);c.scale(g,g);c.fillStyle='#ff4d8d';circ(c,0,0,24);c.strokeStyle='#fff';c.lineWidth=4;c.beginPath();c.arc(0,0,24,0,TAU);c.stroke();c.fillStyle='#fff';c.beginPath();c.moveTo(-7,-11);c.lineTo(12,0);c.lineTo(-7,11);c.closePath();c.fill();c.restore();
        c.fillStyle='#ff4d8d';rr(c,cw/2-52,ch-16,104,30,15);c.fill();c.fillStyle='#fff';c.font=`800 17px ${FONT}`;c.fillText('あそぶ！',cw/2,ch-1);}
      c.restore();});};
  M.drawTop=(function(o){return function(c){o.call(this,c);if(this.zm)return;
    if(!this.list){const y=H-70,g=1+Math.sin(T*3)*.03;c.save();c.translate(W/2,y);c.scale(g,g);c.fillStyle='rgba(60,40,90,.2)';rr(c,-150,-32,300,72,36);c.fill();c.fillStyle='#ff6fa8';rr(c,-150,-36,300,72,36);c.fill();c.strokeStyle='#fff';c.lineWidth=5;c.stroke();
      c.fillStyle='#fff';for(let i=0;i<3;i++)for(let j=0;j<3;j++){rr(c,-126+j*13,-16+i*13,10,10,3);c.fill();}c.font=`800 24px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('ばしょを えらぶ',20,1);c.restore();return;}
    const Lz=this.listLay();c.fillStyle='rgba(40,30,70,.45)';c.fillRect(-OX/SC,-OY/SC,W+2*OX/SC,H+2*OY/SC);c.fillStyle='#fff8fc';rr(c,14,Lz.top-90,W-28,H-Lz.top+60,30);c.fill();c.strokeStyle='#ff8cc0';c.lineWidth=5;c.stroke();
    c.fillStyle='#d04a8a';c.font=`30px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.fillText('どこへ いく？',W/2,Lz.top-50);drawBtn(c,W-50,Lz.top-86,30,'#b0a0c0',null);c.strokeStyle='#fff';c.lineWidth=5;c.lineCap='round';c.beginPath();c.moveTo(W-60,Lz.top-96);c.lineTo(W-40,Lz.top-76);c.moveTo(W-40,Lz.top-96);c.lineTo(W-60,Lz.top-76);c.stroke();
    const q=SAVE.quest;Lz.L.forEach((a,i)=>{const P=Lz.pos(i),C=a.C,cw=Lz.cw,ch=Lz.ch;c.fillStyle='rgba(60,40,90,.12)';rr(c,P.x+3,P.y+5,cw,ch,20);c.fill();c.fillStyle='#fff';rr(c,P.x,P.y,cw,ch,20);c.fill();c.fillStyle=C.roof;rr(c,P.x,P.y,cw,ch*.56,[20,20,0,0]);c.fill();c.strokeStyle=C.roof;c.lineWidth=4;rr(c,P.x,P.y,cw,ch,20);c.stroke();
      c.fillStyle='#fff';circ(c,P.x+cw/2,P.y+ch*.3,34);if(a.icon)drawThing(c,a.icon,P.x+cw/2,P.y+ch*.3,.6);c.fillStyle=shade(C.roof,-.4);c.font=`800 ${C.name.length>6?16:19}px ${FONT}`;c.fillText(C.name,P.x+cw/2,P.y+ch*.68,cw-10);
      if(!C.home){const n=distStars(C),m=C.places.length*3;c.fillStyle='#ffc21a';star(c,P.x+cw/2-30,P.y+ch*.87,9,4);c.fill();c.fillStyle='#8a6a1a';c.font=`800 15px ${FONT}`;c.fillText(`${n}/${m}`,P.x+cw/2+8,P.y+ch*.87);
        if(q.list.some(id=>C.places.includes(id)&&!q.done.includes(id))){c.fillStyle='#ff5f6f';circ(c,P.x+12,P.y+12,16);c.fillStyle='#fff';c.font=`900 18px ${FONT}`;c.fillText('！',P.x+12,P.y+13);}
        if(C.places.some(id=>{const z=PLACES.find(pp=>pp.id===id);return z&&z.nw;})){c.fillStyle='#ff5f6f';rr(c,P.x+cw-50,P.y-8,50,22,11);c.fill();c.fillStyle='#fff';c.font=`800 13px ${FONT}`;c.fillText('NEW',P.x+cw-25,P.y+3);}}
      else{c.fillStyle='#8a6a8a';c.font=`800 14px ${FONT}`;c.fillText(C.id==='myhouse'?'おうち':'かぐ',P.x+cw/2,P.y+ch*.87);}});};})(M.drawTop);
  M.down=function(x,y){if(this.list){this.pan=null;return;}oDown.call(this,x,y);};
  M.move=function(x,y){if(this.list)return;oMove.call(this,x,y);};
  M.up=function(x,y){if(!this.ready)return;
    if(this.list){const Lz=this.listLay();if(hitC(x,y,W-50,Lz.top-86,40)){this.list=false;sfx('tap');return;}
      for(let i=0;i<Lz.L.length;i++){const P=Lz.pos(i);if(x>P.x&&x<P.x+Lz.cw&&y>P.y&&y<P.y+Lz.ch){this.list=false;const o=this.lms.find(o=>o.C.id===Lz.L[i].C.id);if(o){burst(x,y,10,'star');this.goLm(o);}return;}}
      if(y<Lz.top-100){this.list=false;sfx('tap');}return;}
    const p=this.pan;if(p&&!p.moved){
      if(this.mode==='top'&&!this.zm&&Math.abs(x-W/2)<155&&Math.abs(y-(H-70))<40){this.pan=null;this.list=true;this.path=null;sfx('pop');say('どこへ いく？ タッチしてね');return;}
      if(this.mode==='dist'&&!this.walkIn){const D=this.D0,Ly=this.cardsLay();
        for(let i=0;i<D.bs.length;i++){const P=Ly.pos(i);if(x>P.x&&x<P.x+Ly.cw&&y>P.y&&y<P.y+Ly.ch){this.pan=null;const o=D.bs[i];if(o===this.cur())this.enterB(o);else{this.dv=o.a;this.pop=1;sfx('whoosh');hush();speak(o.p.ja);}return;}}
        const ay=Ly.top-150;if(D.bs.length>1&&hitC(x,y,50,ay,40)){this.pan=null;this.turn(-1);this.pop=1;return;}if(D.bs.length>1&&hitC(x,y,W-50,ay,40)){this.pan=null;this.turn(1);this.pop=1;return;}
        if(y>Ly.top-60){this.pan=null;return;}}}
    oUp.call(this,x,y);};
  M.hint=function(){if(!this.ready||this.zm||this.walkIn||this.path)return null;const q=SAVE.quest;
    if(this.list){const Lz=this.listLay(),i=Lz.L.findIndex(a=>!a.C.home&&q.list.some(id=>a.C.places.includes(id)&&!q.done.includes(id)));if(i<0)return null;const P=Lz.pos(i);return{x:P.x+Lz.cw/2,y:P.y+Lz.ch/2};}
    if(this.mode==='top'){if(q.chest){const p=toScr(this.S,new THREE.Vector3(3.2,1,-.8));return{x:p.x,y:p.y};}return{x:W/2,y:H-70};}
    const D=this.D0,Ly=this.cardsLay(),b=this.cur();let i=D.bs.findIndex(o=>q.list.includes(o.p.id)&&!q.done.includes(o.p.id));if(i<0)i=D.bs.indexOf(b);const P=Ly.pos(i);return{x:P.x+Ly.cw/2,y:P.y+Ly.ch/2};};
  M.hintText=function(){if(this.list)return 'いきたい ばしょを タッチしてね';return this.mode==='top'?'したの「ばしょを えらぶ」か、 たてものを タッチしてね':'カードを タッチ。 もういちど タッチで あそぶよ';};
  const oReset=M.reset;M.reset=function(){this.list=false;this.pop=0;oReset.call(this);};})();

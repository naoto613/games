// ================= まち（びょういん と しかいいん を えらぶ） =================
const TOWNB={hosp:{x:158,w:262,fl:5,col:'#ff9ac8',oc:'#e0508a',name:'びょういん',sub:'おいしゃさんの おしごと'},dent:{x:448,w:238,fl:4,col:'#5ac8a8',oc:'#2a9a7a',name:'しかいいん',sub:'はいしゃさんの おしごと'}};
function bldRooms(b){return BLDS[b].floors.flat().filter(id=>!NOGAME.includes(id)&&id!=='dress');}
SCN.town={bg:'#9ad8ff',song:'clinic',noHome:1,noRk:1,hud:false,
  enter(){this.gy=H*.66;this.fx=W/2;this.tx=null;this.goB=null;this.dir=0;this.t=0;PT_PLAY=[];dailyGet();checkMedals();
    this.greeted?say(pick(['つぎは どっちに いく？','びょういん？ それとも しかいいん？'])):say('ふーちゃんの まちへ ようこそ！ びょういんと しかいいん、 どっちに いく？ たてものを タッチしてね');this.greeted=1;},
  door(b){const B=TOWNB[b];return{x:B.x,y:this.gy};},
  bh(b){const B=TOWNB[b];return B.fl*Math.min(104,(this.gy-240)/5.2);},
  update(dt){this.t+=dt;if(this.tx!=null){const d=this.tx-this.fx;if(Math.abs(d)<4){this.fx=this.tx;this.tx=null;this.dir=0;if(this.goB){const b=this.goB;this.goB=null;sfx('bell');PENDB={b,fresh:1};go('lobby');}}else{this.fx+=Math.sign(d)*Math.min(Math.abs(d),700*dt);this.dir=d<0?1:2;}}},
  drawBld(c,b){const B=TOWNB[b],gy=this.gy,h=this.bh(b),fh=h/B.fl,x0=B.x-B.w/2,top=gy-h,sel=this.goB===b,pul=sel?1+Math.sin(T*10)*.02:1;c.save();c.translate(B.x,gy);c.scale(pul,pul);c.translate(-B.x,-gy);
    c.fillStyle='rgba(60,80,120,.12)';rr(c,x0+8,top+8,B.w,h,14);c.fill();c.fillStyle='#fff';rr(c,x0,top,B.w,h,[16,16,0,0]);c.fill();c.strokeStyle=shade(B.col,-.1);c.lineWidth=5;c.stroke();
    c.fillStyle=B.col;rr(c,x0-12,top-18,B.w+24,26,13);c.fill();
    for(let f=0;f<B.fl;f++){const y=gy-(f+1)*fh;if(f>0){c.fillStyle=shade(B.col,.55);c.fillRect(x0,y+fh-4,B.w,4);}const n=b==='hosp'?4:3;for(let k=0;k<n;k++){const wx=x0+18+k*((B.w-36)/n),ww=(B.w-36)/n-12;if(f===0&&k===Math.floor(n/2)-(b==='hosp'?0:0))continue;c.fillStyle=(Math.floor(T*.5+f*3+k*7)%9===0)?'#fff8c8':'#bfe4ff';rr(c,wx+6,y+12,ww,fh-28,6);c.fill();c.fillStyle='rgba(255,255,255,.6)';c.fillRect(wx+10,y+16,6,fh-38);}}
    // いりぐち
    const dw=64;c.fillStyle=shade(B.col,.3);rr(c,B.x-dw/2-10,gy-86,dw+20,14,6);c.fill();c.fillStyle='rgba(190,230,255,.9)';rr(c,B.x-dw/2,gy-72,dw,72,[6,6,0,0]);c.fill();c.strokeStyle='#8aa8c8';c.lineWidth=2;c.beginPath();c.moveTo(B.x,gy-72);c.lineTo(B.x,gy);c.stroke();
    // かんばん
    const sy=top-70;if(b==='hosp'){crossSign(c,B.x,sy,26);}else{c.fillStyle='#fff';circ(c,B.x,sy,36);drawItem(c,'tooth',B.x,sy,.72);c.fillStyle='#3a3a4a';circ(c,B.x-7,sy-2,2.5);circ(c,B.x+7,sy-2,2.5);c.strokeStyle='#3a3a4a';c.lineWidth=2;c.beginPath();c.arc(B.x,sy+3,5,.2,Math.PI-.2);c.stroke();}
    c.fillStyle=B.col;rr(c,B.x-B.w/2+10,top-44,B.w-20,34,17);c.fill();c.strokeStyle='#fff';c.lineWidth=3;c.stroke();txt(c,`ふーちゃん ${B.name}`,B.x,top-27,19,'#fff');
    if(b==='hosp'){MED.ambulance(c,x0-6,gy+22,.9);}else{c.save();c.translate(B.x+B.w/2+14,gy-40);c.rotate(-.4+Math.sin(T*3)*.15);drawItem(c,'toothbrush',0,0,1.3);c.restore();}
    c.restore();
    // じょうほう
    const rooms=bldRooms(b),done=rooms.filter(id=>lvOf(id)>0).length;const iy=gy+74;c.fillStyle='rgba(255,255,255,.95)';rr(c,B.x-B.w/2,iy-26,B.w,58,20);c.fill();c.strokeStyle=B.col;c.lineWidth=3;c.stroke();
    txt(c,B.sub,B.x,iy-8,15,B.oc);c.fillStyle='#ffd23a';star(c,B.x-92,iy+14,10,4.5);c.fill();txt(c,`あそんだ ${done} / ${rooms.length} おへや`,B.x+10,iy+14,14,'#6a5a8a');
    const D=SAVE.daily;if(D&&D.d===todayKey()&&D.rooms.some(id=>rooms.includes(id)&&!D.done.includes(id))){const by=top-110-Math.abs(Math.sin(T*4))*10;c.fillStyle='#ffd23a';rr(c,B.x+B.w/2-86,by,90,30,15);c.fill();c.strokeStyle='#fff';c.lineWidth=3;c.stroke();txt(c,'おねがい',B.x+B.w/2-41,by+15,15,'#a05a00');}},
  draw(c){const L=-OX/SC-2,R=W+OX/SC+2,TP=-OY/SC-2,gy=this.gy;c.fillStyle=vfill(c,TP,gy,'#8fd8ff',.3,0);c.fillRect(L,TP,R-L,H+OY/SC*2+4);
    c.fillStyle='#fff3a0';circ(c,W-70,150,40);for(let i=0;i<4;i++){const x=((i*190+T*14)%(W+240))-120,y=130+i*46;c.fillStyle='rgba(255,255,255,.85)';circ(c,x,y,24);circ(c,x+26,y-8,30);circ(c,x+56,y,22);}
    c.fillStyle='#a8e0b0';for(let i=-1;i<8;i++){c.beginPath();c.ellipse(i*110,gy,90,50,0,Math.PI,TAU);c.fill();}
    c.fillStyle='#8ee07a';c.fillRect(L,gy,R-L,H);c.fillStyle='#e8dcc8';c.fillRect(L,gy+30,R-L,20);c.fillStyle='#b8b8c8';const ry=gy+130;c.fillRect(L,ry,R-L,Math.max(60,H-120-ry));c.fillStyle='#fff';for(let x=-40;x<W+40;x+=90)c.fillRect(x,ry+Math.max(60,H-120-ry)/2-3,46,6);for(let i=0;i<6;i++){c.fillStyle='#fff';c.fillRect(W/2-90+i*32,ry,18,Math.max(60,H-120-ry));}for(const tx of[20,W-20])mapTree(c,tx,gy+10,.5);
    this.drawBld(c,'hosp');this.drawBld(c,'dent');
    for(let x=10;x<W;x+=34){if(Math.abs(x-TOWNB.hosp.x)<60||Math.abs(x-TOWNB.dent.x)<50)continue;c.fillStyle='#4cae4c';c.fillRect(x-1,gy+4,2,12);c.fillStyle=['#ff8cc0','#ffd23a','#fff'][Math.floor(x/34)%3];circ(c,x,gy+4,5);}
    const fx=this.fx,fy=gy+34,mv=this.tx!=null;drawRikki(c,fx+(this.dir===2?-60:60),fy,{sc:1.5,t:T,moving:mv,dir:this.dir===1?1:0,happy:!mv});drawFuka(c,fx,fy,{outfit:fuOutfit(),t:T,sc:2,steth:true,moving:mv,dir:mv?this.dir:0,wave:!mv&&(T%6)<1});
    // ヘッダー
    c.fillStyle='rgba(255,154,200,.92)';c.fillRect(L,TP,R-L,96-TP);txtO(c,'ふーちゃんの まち',W/2-70,50,28,'#fff','#e0508a',8);const ri=rankIdx();c.fillStyle='#fff';rr(c,W-200,30,188,40,20);c.fill();MED.love(c,W-178,50,.5);txt(c,`${SAVE.hearts}`,W-158,51,20,'#ff4d7d','left');const rn=RANKS[ri][1].replace(/ /g,'');txt(c,rn,W-22,51,rn.length>8?10:12,'#8a5a9a','right');
    // したの ボタン
    const by=H-70;[['zk','ずかん','#ff8c5a'],['md','メダル','#e8a800'],['st','おねがい','#ff5fa2']].forEach(([id,n,col],i)=>{const x=W/2+(i-1)*180;c.fillStyle='rgba(90,40,110,.15)';rr(c,x-78,by-28,156,60,30);c.fill();c.fillStyle='#fff';rr(c,x-80,by-32,160,60,30);c.fill();c.strokeStyle=col;c.lineWidth=4;c.stroke();
      if(id==='zk')drawBtn(c,x-48,by-2,18,col,'book');else if(id==='md')drawMedal(c,x-48,by,15,true);else drawStamp(c,x-48,by-2,16);txt(c,n,x+14,by-2,21,col);});},
  down(x,y){if(this.goB)return;const by=H-70;for(const [i,id] of[[0,'zk'],[1,'md'],[2,'st']]){const bx=W/2+(i-1)*180;if(Math.abs(x-bx)<80&&Math.abs(y-by)<32){sfx('tap');SCN.book.nextTab=id;go('book');return;}}
    for(const b of['hosp','dent']){const B=TOWNB[b],h=this.bh(b);if(Math.abs(x-B.x)<B.w/2+10&&y>this.gy-h-120&&y<this.gy+95){sfx('pop');this.goB=b;this.tx=B.x;hush();speak(`ふーちゃん ${B.name}へ いこう！`);return;}}
    if(Math.abs(x-this.fx)<40&&y>this.gy-100&&y<this.gy+40){sfx('boing');REACT.k='good';REACT.t=1;say(pick(['どっちに いこうかな？','きょうも がんばるぞ！']));}},
  hint(){if(this.goB)return null;const D=SAVE.daily;let b='hosp';if(D&&D.rooms.some(id=>bldRooms('dent').includes(id)&&!D.done.includes(id))&&!D.rooms.some(id=>bldRooms('hosp').includes(id)&&!D.done.includes(id)))b='dent';return{x:TOWNB[b].x,y:this.gy-60};},
  hintText(){return 'いきたい たてものを タッチしてね';}};

// ================= 3D クレーンゲーム =================
const CR_PRIZE=[['teddy',30],['bunny',30],['ball',30],['cushion',25],['blocks',25],['flowers',20],['fishbowl',10],['trophy',5]];
reg3('crane',{bg:'#ffe8f4',song:'fuwa',
  build(){const S=this.S=stage3({sr:9,fov:42,hi:.8});const g=new THREE.Group();S.s.add(g);this.g=g;
    B3(g,9.6,3,9.6,'#ff8cc0',0,-3,0,.3);B3(g,9.8,.3,9.8,'#ffffff',0,0,0,.1);const fl=C3(g,4.4,4.4,.1,'#ffe6f2',0,.3,0,40);fl.scale.set(1,1,1);B3(g,8.8,.2,8.8,'#fff0f7',0,.3,0,.05);
    for(const [x,z] of [[-4.6,-4.6],[4.6,-4.6],[-4.6,4.6],[4.6,4.6]])B3(g,.35,8.4,.35,'#ff6fa8',x,0,z,.08);B3(g,9.8,1.2,9.8,'#ff6fa8',0,8.3,0,.3);const sign=mesh3(g,geo3('crsign',()=>new THREE.PlaneGeometry(6,1)),new THREE.MeshStandardMaterial({map:labelTex('クレーンゲーム','#ff4d8d','#fff6fb'),roughness:.8}),0,8.9,4.95);sign.castShadow=false;
    for(const [w,h,d,x,z,ry] of [[9,7.9,.05,0,-4.5,0],[9,7.9,.05,-4.5,0,Math.PI/2],[9,7.9,.05,4.5,0,Math.PI/2]]){const m=new THREE.Mesh(geo3(`gl${w}`,()=>new THREE.BoxGeometry(w,h,d)),glass('#e6f6ff',.18));m.position.set(x,.4+h/2,z);m.rotation.y=ry;g.add(m);}
    this.chute={x:-3.2,z:3.2};B3(g,2.2,1.4,2.2,'#ffd23a',-3.2,.3,3.2,.2);C3(g,.9,.9,.1,'#5a3a5a',-3.2,1.72,3.2,24);
    this.rail=B3(g,9,.2,.3,'#e0d0ea',0,7.4,0,.05);this.cg=new THREE.Group();g.add(this.cg);this.car=B3(this.cg,.9,.5,.9,'#ffd23a',0,7.1,0,.12);this.cable=C3(this.cg,.03,.03,1,'#8a8aa0',0,0,0,6);this.claw=new THREE.Group();this.cg.add(this.claw);C3(this.claw,.35,.45,.4,'#c8c8d8',0,0,0,16);S3(this.claw,.2,'#ff6fa8',0,.5,0);
    this.prongs=[];for(let i=0;i<3;i++){const pg=new THREE.Group();pg.rotation.y=i/3*TAU;this.claw.add(pg);const arm=new THREE.Group();arm.position.set(0,0,.3);pg.add(arm);const a1=B3(arm,.12,.9,.12,'#c8c8d8',0,-.9,0,.04);const a2=B3(arm,.12,.5,.12,'#b0b0c8',0,-1.15,-.2,.04);a2.rotation.x=.9;this.prongs.push(arm);}
    this.fu=charAdd(S,charSpr('fu',3.2));this.fu.x=-4.6;this.fu.z=6.8;this.fu.face=3;this.rk=charAdd(S,charSpr('rk',2.2));this.rk.x=5;this.rk.z=6.8;
    this.prizes=[];SEEDR=Math.floor(Math.random()*1e6)+1;const pool=[];for(const [id,w] of CR_PRIZE)if(w>10)for(let i=0;i<w/5;i++)pool.push(id);
    for(let i=0;i<11;i++){let x,z,ok,tries=0;do{x=(srand()-.5)*7;z=(srand()-.5)*6-.6;ok=Math.hypot(x-this.chute.x,z-this.chute.z)>2.2&&this.prizes.every(p=>Math.hypot(p.x-x,p.z-z)>1.25);tries++;}while(!ok&&tries<60);
      const id=i===0?'trophy':i===1?'fishbowl':pool[Math.floor(srand()*pool.length)];const d=IT3M[id];const pg=buildItem(d,{});const sc=id==='trophy'?1.5:1.3;pg.scale.setScalar(sc);pg.position.set(x,.5,z);pg.rotation.y=srand()*TAU;g.add(pg);this.prizes.push({id,g:pg,x,z,y:.5,st:'in',rare:id==='trophy'||id==='fishbowl',w:.55});}
    this.cx=-3.2;this.cz=3.2;this.cy=0;this.open=1;this.ph='x';this.tries=6;this.won=[];this.hold=0;this.camV=0;this.msg=0;this.fin=0;this.caught=null;
    setTimeout(()=>{if(scene===this)say('クレーンゲーム！ ピンクの ボタンを おしている あいだ よこに うごくよ。 はなすと とまるよ');},500);},
  btn(){return this.ph==='x'?{x:W/2-110,y:H-120,ic:'next',lab:'よこ →',col:'#ff6fa8'}:this.ph==='z'?{x:W/2+110,y:H-120,ic:'play',lab:'おく ↑',col:'#5aa8ff'}:null;},
  update(dt){const S=this.S;
    if(this.ph==='x'&&this.hold){this.cx=Math.min(3.6,this.cx+dt*1.9);if(this.cx>=3.6)this.relX();}
    if(this.ph==='z'&&this.hold){this.cz=Math.max(-3.6,this.cz-dt*1.9);if(this.cz<=-3.6)this.relZ();}
    if(this.ph==='down'){this.cy+=dt*2.6;const lim=this.floorUnder();if(this.cy>=lim){this.cy=lim;this.ph='grab';this.pt=0;}}
    if(this.ph==='grab'){this.pt+=dt;this.open=Math.max(0,1-this.pt*2);if(this.pt>.6){this.tryGrab();this.ph='up';}}
    if(this.ph==='up'){this.cy-=dt*2.2;if(this.caught&&this.caught.slip&&this.cy<this.caught.slip){this.drop(true);}if(this.cy<=0){this.cy=0;this.ph='home';}}
    if(this.ph==='home'){const dx=this.chute.x-this.cx,dz=this.chute.z-this.cz,d=Math.hypot(dx,dz);if(d<.05){this.ph='release';this.pt=0;}else{const st=Math.min(d,dt*2.6);this.cx+=dx/d*st;this.cz+=dz/d*st;}}
    if(this.ph==='release'){this.pt+=dt;this.open=Math.min(1,this.pt*2);if(this.pt>.3&&this.caught)this.drop(false);if(this.pt>1.2){this.tries--;if(this.tries<=0||this.prizes.every(p=>p.st!=='in')){this.ph='end';this.fin=.01;}else{this.ph='x';this.lastSide=0;say(pick(['つぎも がんばろう！ ピンクの ボタン！','もう いっかい！','ねらって みよう！']));}}}
    for(const p of this.prizes){if(p.st==='fall'){p.vy-=dt*14;p.y+=p.vy*dt;const f=this.surf(p);if(p.y<=f){p.y=f;p.st=p.toWin?'win':'in';if(p.toWin)this.win(p);else{sfx('boing');}}p.g.position.set(p.x,p.y,p.z);}
      if(p.st==='held'){p.x=this.cx;p.z=this.cz;p.y=7.1-this.cy-1.6-1.3;p.g.position.set(p.x,p.y,p.z);p.g.rotation.y+=dt*.8;}if(p.st==='win'){p.g.visible=false;}}
    this.cg.position.set(this.cx,0,this.cz);this.car.position.y=7.1;this.claw.position.y=6.8-this.cy-.2;this.cable.scale.y=Math.max(.05,this.cy+.2);this.cable.position.y=6.9-(this.cy+.2)/2;this.rail.position.z=this.cz;
    for(const a of this.prongs)a.rotation.x=-.2-this.open*.5;
    const side=this.ph==='z'||(this.ph==='down'&&this.lastSide)?1:0;this.camV+=(side-this.camV)*Math.min(1,dt*3);const ang=this.camV*1.15;const R=25;S.cam.position.set(Math.sin(ang)*R,12,Math.cos(ang)*R);S.cam.lookAt(0,3.6,0);
    charUpd(this.fu,dt);charUpd(this.rk,dt);if(this.fin>0){this.fin+=dt;if(this.fin>1.6&&this.fin<9){this.fin=9;const n=this.won.length;celebrate('crane',this.won.some(w=>w==='trophy'),n>=4?3:n>=2?2:1);}}},
  surf(p){let y=.5;for(const q of this.prizes){if(q===p||q.st!=='in')continue;if(Math.hypot(q.x-p.x,q.z-p.z)<.7)y=Math.max(y,q.y+.6);}return y;},
  floorUnder(){let top=.5;for(const p of this.prizes){if(p.st!=='in')continue;if(Math.hypot(p.x-this.cx,p.z-this.cz)<.8)top=Math.max(top,p.y+.9);}return clamp(6.8-.2-1.5-top,0,5.2);},
  tryGrab(){let best=null,bd=.95;for(const p of this.prizes){if(p.st!=='in')continue;const d=Math.hypot(p.x-this.cx,p.z-this.cz);if(d<bd){bd=d;best=p;}}
    if(!best){sfx('no');say('あれれ… なにも つかめなかった');return;}const lv=lvOf('crane'),chance=bd<.35?.95:bd<.6?.75:.45;if(Math.random()<chance){best.st='held';this.caught=best;best.slip=(bd>.5&&Math.random()<.35)?rand(1.2,3):0;sfx('snap');say(best.rare?'すごい！ レアな けいひんを つかんだ！':'つかんだ！');}else{sfx('no');burst(W/2,H*.45,6,'dot');say('おしい！ まんなかを ねらおう');}},
  drop(slip){const p=this.caught;this.caught=null;if(!p)return;p.st='fall';p.vy=0;p.toWin=!slip&&Math.hypot(p.x-this.chute.x,p.z-this.chute.z)<.6;if(slip){sfx('boing');say('あ〜！ おちちゃった…');}},
  win(p){this.won.push(p.id);(SAVE.prizes=SAVE.prizes||[]).push(p.id);if(SAVE.prizes.length>6)SAVE.prizes.shift();save();sfx('fanfare');confetti(p.rare?90:50);const d=IT3M[p.id];setTimeout(()=>{if(scene===this){sayPair(d.n+' ゲット！',d.en);}},300);setTimeout(()=>{if(scene===this)say('とった けいひんは おうちの リビングに かざられるよ！');},2400);},
  relX(){if(this.ph!=='x')return;this.hold=0;this.ph='z';sfx('tick');say('つぎは あおい ボタン！ おくに うごくよ。 よこから みてね');},
  relZ(){if(this.ph!=='z')return;this.hold=0;this.ph='down';this.lastSide=1;sfx('launch');},
  draw(c){sky3(c,'#ffe6f4','#fff6e6',false);c.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<14;i++){const x=(i*97)%W,y=(i*61)%(H*.5);star(c,x,y,6,2.6);c.fill();}render3(c,this.S);
    c.fillStyle='rgba(255,255,255,.93)';rr(c,W/2-150,112,300,56,28);c.fill();c.strokeStyle='#ff8cc0';c.lineWidth=4;c.stroke();for(let i=0;i<6;i++){if(i<this.tries)coinIcon(c,W/2-125+i*40,140,14);else{c.fillStyle='rgba(200,180,200,.4)';circ(c,W/2-125+i*40,140,12);}}
    c.fillStyle='rgba(255,255,255,.9)';rr(c,20,184,W-40,70,24);c.fill();c.fillStyle='#b06a9a';c.font=`800 16px ${FONT}`;c.textAlign='left';c.textBaseline='middle';c.fillText('ゲット:',36,219);this.won.forEach((id,i)=>drawThumb(c,id,120+i*62,219,58));
    const b=this.btn();for(const [ph,x,ic,lab,col] of [['x',W/2-110,'next','よこ →','#ff6fa8'],['z',W/2+110,'play','おく ↑','#5aa8ff']]){const on=this.ph===ph;c.globalAlpha=on?1:.35;const pr=on&&this.hold?.9:1;c.save();c.translate(x,H-120);c.scale(pr,pr);drawBtn(c,0,0,54,col,ic,on&&!this.hold);c.restore();c.fillStyle=on?col:'#aaa';c.font=`800 20px ${FONT}`;c.textAlign='center';c.fillText(lab,x,H-44);c.globalAlpha=1;}
    if(this.ph==='z'){c.fillStyle='rgba(90,168,255,.9)';rr(c,W/2-90,H*.3,180,40,20);c.fill();c.fillStyle='#fff';c.font=`800 18px ${FONT}`;c.fillText('よこから みた ところ',W/2,H*.3+21);}},
  down(x,y){const b=this.btn();if(b&&hitC(x,y,b.x,b.y,70)){this.hold=1;sfx('pop');}},
  up(){if(!this.hold)return;if(this.ph==='x')this.relX();else if(this.ph==='z')this.relZ();},
  hint(){const b=this.btn();return b?{x:b.x,y:b.y}:null;},
  hintText(){return this.ph==='x'?'ピンクの ボタンを おして、 けいひんの まうえで はなそう':'あおい ボタンを おして、 おくの いちで はなそう';}});

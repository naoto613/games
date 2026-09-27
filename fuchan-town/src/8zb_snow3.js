// ================= 3D ゆきあそび =================
const SN_DEC=[['carrot','にんじん','carrot'],['eyes','め','eyes'],['button','ボタン','buttons'],['scarf','マフラー','scarf'],['hat','ぼうし','hat'],['arm','えだ','arms']];
reg3('snow',{bg:'#e8f4ff',song:'fuwa',
  build(){const S=this.S=stage3({sr:16,fov:50,fog:'#eef6ff',fn:30,ff:120,gnd:0xe8f0ff});const g=new THREE.Group();S.s.add(g);this.g=g;
    this.smg=new THREE.Group();g.add(this.smg);const gr=new THREE.Mesh(new THREE.PlaneGeometry(200,200),m3('#e8f2ff',{roughness:.9}));gr.rotation.x=-Math.PI/2;gr.receiveShadow=true;g.add(gr);
    SEEDR=23;this.trees=[];for(let i=0;i<30;i++){const a=srand()*TAU,r=16+srand()*14;this.pine(g,Math.cos(a)*r,Math.sin(a)*r,1+srand()*.6);}for(let i=0;i<9;i++){const a=i/9*TAU+.3,r=10.5+srand()*2;this.pine(g,Math.cos(a)*r,Math.sin(a)*r-2,.9+srand()*.4);}for(let i=0;i<14;i++){const f=S3(g,.5+srand()*.5,'#dfeaff',(srand()-.5)*20,0,(srand()-.5)*16-2,1.4,.35,1);}
    this.flakes=[];for(let i=0;i<60;i++){const f=S3(g,.06,'#ffffff',rand(-14,14),rand(0,12),rand(-14,10));f.castShadow=false;this.flakes.push(f);}
    this.zone=C3(g,1.8,1.8,.04,m3('#9ad0ff',{transparent:true,opacity:.35}),0,0,-2,32);this.zone.castShadow=false;
    this.fu=charAdd(S,charSpr('fu',2.4,{outfit:outfit({acc:'none'})}));this.fu.x=-3;this.fu.z=3;this.rk=charAdd(S,charSpr('rk',1.7));this.rk.x=3.4;this.rk.z=3.4;
    this.balls=[];this.need=[1.35,1,.7];this.bi=0;this.ph='roll';this.decs=[];this.sel=null;this.got=0;this.bumps=0;this.fin=0;this.newBall();
    say('ゆきだるまを つくろう！ ゆきだまを ゆびで ころがすと おおきく なるよ');},
  pine(g,x,z,s){const t=new THREE.Group();t.position.set(x,0,z);t.scale.setScalar(s);g.add(t);C3(t,.2,.25,1,'#8a5a3a',0,0,0,8);for(let i=0;i<3;i++){mesh3(t,geo3('pn'+i,()=>new THREE.ConeGeometry(1.4-i*.35,1.4,10)),'#3a9a6a',0,1.4+i*.8,0);mesh3(t,geo3('ps'+i,()=>new THREE.ConeGeometry(1.2-i*.33,.5,10)),'#ffffff',0,1.95+i*.8,0);}return t;},
  newBall(){const b={r:.35,x:rand(-4,4),z:3.5,m:S3(this.smg,1,'#ffffff',0,0,0),placed:false,rot:new THREE.Quaternion()};b.m.material=m3('#fbfdff',{roughness:.7});this.balls.push(b);this.cur=b;this.target=null;},
  update(dt){const S=this.S;for(const f of this.flakes){f.position.y-=dt*1.2;f.position.x+=Math.sin(T+f.position.z)*dt*.3;if(f.position.y<0)f.position.y=12;}
    if(this.ph==='roll'){const b=this.cur;if(this.target&&!b.placed){const dx=this.target.x-b.x,dz=this.target.z-b.z,d=Math.hypot(dx,dz);if(d>.05){const st=Math.min(d,dt*5);b.x+=dx/d*st;b.z+=dz/d*st;b.x=clamp(b.x,-9,9);b.z=clamp(b.z,-9,6);
        const need=this.need[this.bi];b.r=Math.min(need*1.1,b.r+st*.045);const ax=new THREE.Vector3(dz,0,-dx).normalize();b.rot.premultiply(new THREE.Quaternion().setFromAxisAngle(ax,st/b.r));if(Math.random()<dt*3)sfx('squish');}}
      b.m.position.set(b.x,this.bi===0?b.r:b.r,b.z);b.m.scale.setScalar(b.r);b.m.quaternion.copy(b.rot);
      const ok=b.r>=this.need[this.bi]*.98;if(ok&&!this.okSaid){this.okSaid=1;sfx('ding');say(this.bi===0?'おおきく なった！ あおい まるの ところへ はこんで':'いい おおきさ！ あおい まるへ はこんでね');}
      if(ok&&Math.hypot(b.x,b.z+2)<1.3&&!this.target?.moving){this.stack(b);}}
    if(this.ph==='stack'){this.pt+=dt;const b=this.cur,k=Math.min(1,this.pt/.7),by=this.baseY();b.m.position.set(lerp(b.sx,0,k),lerp(b.sy,by+b.r*.9,k)+Math.sin(k*Math.PI)*2,lerp(b.sz,-2,k));if(k>=1){b.placed=true;b.y=by+b.r*.9;b.x=0;b.z=-2;sfx('boing');this.bi++;this.okSaid=0;if(this.bi>=3){this.ph='deco';this.zone.visible=false;say('ゆきだるまの かんせい！ したの アイテムを えらんで、 ゆきだるまに タッチして かざろう');}else{this.ph='roll';this.newBall();say(this.bi===1?'つぎは からだ！ もう すこし ちいさめに':'さいごは あたま！');}}}
    if(this.ph==='sled')this.sled(dt);
    let cp,ct;if(this.ph==='sled'){const p=this.sl;cp=new THREE.Vector3(p.x*.6,p.y+4.5,p.z+8);ct=new THREE.Vector3(p.x*.8,p.y,p.z-6);}else if(this.ph==='deco'||this.ph==='stack'){cp=new THREE.Vector3(0,6.2,12.5);ct=new THREE.Vector3(0,2.7,-2);}else{cp=new THREE.Vector3(0,11,15);ct=new THREE.Vector3(0,0,0);}
    S.cam.position.lerp(cp,Math.min(1,dt*3));this.ct=(this.ct||ct.clone()).lerp(ct,Math.min(1,dt*3));S.cam.lookAt(this.ct);lightAt(S,this.ct.x,this.ct.z,this.ct.y);charUpd(this.fu,dt);charUpd(this.rk,dt);
    if(this.fin>0){this.fin+=dt;if(this.fin>.8&&this.fin<9){this.fin=9;const st=this.got>=12&&this.bumps<=1?3:this.got>=6?2:1;celebrate('snow',st===3,st);}}},
  baseY(){let y=0;for(const b of this.balls)if(b.placed)y=b.y+b.r*.9;return y;},
  stack(b){this.ph='stack';this.pt=0;b.sx=b.x;b.sy=b.m.position.y;b.sz=b.z;this.target=null;sfx('whoosh');},
  addDec(k,pt,n){const g=new THREE.Group();g.position.copy(pt);this.smg.add(g);const look=pt.clone().add(n);g.lookAt(look);
    if(k==='carrot'){const c=mesh3(g,geo3('carrot',()=>new THREE.ConeGeometry(.12,.6,12)),'#ff8a2a',0,0,.3);c.rotation.x=Math.PI/2;}else if(k==='eyes'||k==='button')S3(g,k==='eyes'?.09:.1,'#2a2a3a',0,0,.03);
    else if(k==='scarf'){const t=TR3(this.smg,.62,.13,'#ff5f6f',0,0,0);const top=this.balls[1];t.position.set(0,top.y+top.r*.72,-2);t.rotation.x=Math.PI/2;this.smg.remove(g);this.decs.push(t);return;}
    else if(k==='hat'){const h=this.balls[2];const hg=new THREE.Group();hg.position.set(0,h.y+h.r*.85,-2);this.smg.add(hg);C3(hg,.45,.5,.6,'#3a3a5a',0,0,0,20);C3(hg,.7,.7,.06,'#3a3a5a',0,0,0,24);C3(hg,.47,.47,.12,'#ff5f6f',0,.12,0,20);this.smg.remove(g);this.decs.push(hg);return;}
    else if(k==='arm'){const a=C3(g,.04,.05,1.3,'#8a5a3a',0,0,.6,6);a.rotation.x=Math.PI/2;const f=C3(g,.03,.03,.4,'#8a5a3a',.12,0,1.1,6);f.rotation.set(Math.PI/2,0,-.6);}
    this.decs.push(g);},
  startSled(){this.ph='sled';this.smg.visible=false;this.zone.visible=false;this.clearSnowman=false;const g=this.g;const L=160;const sl=new THREE.Group();g.add(sl);this.slope=sl;const ramp=new THREE.Mesh(new THREE.PlaneGeometry(22,L+20,10,40),m3('#f4f9ff',{roughness:.9}));ramp.rotation.x=-Math.PI/2;ramp.position.set(0,0,-L/2-10);ramp.receiveShadow=true;sl.add(ramp);sl.position.set(0,0,-6);sl.rotation.x=0;
    this.obs=[];this.stars=[];SEEDR=Math.floor(Math.random()*1e6)+1;for(let z=-20;z>-L;z-=7){const x=(srand()-.5)*14;if(srand()<.55){const t=this.pine(sl,x,z,.9);this.obs.push({x,z,r:1});}else{S3(sl,.8,'#9aa4b8',x,.3,z,1.2,.7,1);this.obs.push({x,z,r:.9});}
      for(let k=0;k<3;k++){const sx=(srand()-.5)*12,sz=z-3-k*1.2;const s=mesh3(sl,starGeo(.4,.12),m3('#ffd23a',{emissive:new THREE.Color('#ffb000'),emissiveIntensity:.4}),sx,.9,sz);this.stars.push({x:sx,z:sz,m:s,got:false});}}
    for(let i=0;i<20;i++){this.pine(sl,-12-Math.random()*4,-i*9,1.2);this.pine(sl,12+Math.random()*4,-i*9,1.2);}const fl=B3(sl,12,3,.3,'#ff5f9a',0,0,-L,.1);
    this.sl={x:0,y:0,z:-6,v:3,tx:0,L};this.sled3=new THREE.Group();g.add(this.sled3);B3(this.sled3,1,.2,1.8,'#ff5f6f',0,.15,0,.1);for(const s of[-1,1])B3(this.sled3,.08,.08,2,'#ffd23a',s*.45,0,-.1,.03);
    say('そりで すべろう！ ゆびで みぎ ひだりに うごかして ほしを あつめよう');sfx('whoosh');},
  sled(dt){const p=this.sl;if(p.done){p.done+=dt;if(p.done>2.4&&!this.fin)this.fin=.01;return;}p.v=Math.min(11,p.v+dt*1.5);if(p.stun>0){p.stun-=dt;p.v=Math.max(2,p.v-dt*10);}p.z-=p.v*dt;p.x+=(p.tx-p.x)*Math.min(1,dt*3);p.x=clamp(p.x,-7,7);
    const lz=p.z+6;for(const o of this.obs){if(Math.abs(o.z-lz)<.8&&Math.abs(o.x-p.x)<o.r&&!o.hit){o.hit=1;p.stun=.8;this.bumps++;sfx('boing');hush();speak('どしーん！');}}
    for(const s of this.stars){if(s.got)continue;s.m.rotation.y+=dt*3;if(Math.abs(s.z-lz)<.9&&Math.abs(s.x-p.x)<1){s.got=true;s.m.visible=false;this.got++;sfx('coin');}}
    if(lz<-p.L+1){p.done=.01;sfx('fanfare');confetti(80);say(`ゴール！ ほしを ${this.got}こ あつめたよ！`);}
    this.sled3.position.set(p.x,.05,p.z);this.sled3.rotation.y=-(p.tx-p.x)*.1;Object.assign(this.fu,{x:p.x,y:.25,z:p.z+.2,mv:false,face:3,dir:3,cheer:p.v>8?1:0});Object.assign(this.rk,{x:p.x+.3,y:.2,z:p.z+.9});},
  draw(c){sky3(c,'#8cc8ff','#e0f0ff',true);render3(c,this.S);const ph=this.ph;c.textAlign='center';c.textBaseline='middle';
    if(ph==='roll'||ph==='stack'){const b=this.cur,need=this.need[Math.min(2,this.bi)];c.fillStyle='rgba(255,255,255,.93)';rr(c,40,112,W-80,56,28);c.fill();c.fillStyle='#5a8ad8';c.font=`800 18px ${FONT}`;c.fillText(['どだい','からだ','あたま'][Math.min(2,this.bi)],90,140);c.fillStyle='#e0eaf8';rr(c,140,130,W-220,20,10);c.fill();c.fillStyle=b.r>=need*.98?'#6cd08a':'#8ac0ff';rr(c,140,130,(W-220)*Math.min(1,b.r/need),20,10);c.fill();}
    if(ph==='deco'){const by=H-120;c.fillStyle='rgba(255,255,255,.94)';rr(c,10,by-60,W-20,170,28);c.fill();SN_DEC.forEach(([k,ja],i)=>{const x=60+i*96,on=this.sel===k;c.fillStyle=on?'#fff0d0':'#f4f8ff';rr(c,x-40,by-44,80,80,16);c.fill();c.strokeStyle=on?'#ffb03a':'#d0e0f0';c.lineWidth=on?5:3;c.stroke();
        if(k==='carrot'){c.fillStyle='#ff8a2a';c.beginPath();c.moveTo(x-20,by-10);c.lineTo(x+22,by-4);c.lineTo(x-20,by+2);c.fill();}else if(k==='eyes'){c.fillStyle='#2a2a3a';circ(c,x-10,by-4,6);circ(c,x+10,by-4,6);}else if(k==='button'){c.fillStyle='#2a2a3a';for(let j=0;j<3;j++)circ(c,x,by-18+j*13,5);}else if(k==='scarf'){c.fillStyle='#ff5f6f';rr(c,x-24,by-12,48,14,7);c.fill();c.fillRect(x+8,by-2,10,22);}else if(k==='hat'){c.fillStyle='#3a3a5a';c.fillRect(x-14,by-24,28,26);c.fillRect(x-22,by+2,44,6);}else{c.strokeStyle='#8a5a3a';c.lineWidth=4;c.beginPath();c.moveTo(x-22,by+10);c.lineTo(x+20,by-14);c.moveTo(x+8,by-7);c.lineTo(x+14,by-22);c.stroke();}
        c.fillStyle='#5a6a8a';c.font=`800 13px ${FONT}`;c.fillText(ja,x,by+26);});if(this.decs.length>=3)hud3Btn(c,W-70,by-110,34,'#6cd08a','check','できた！');}
    if(ph==='sled'){c.fillStyle='rgba(255,255,255,.92)';rr(c,W/2-100,112,200,48,24);c.fill();c.fillStyle='#ffc21a';star(c,W/2-50,136,14,6);c.fill();c.fillStyle='#8a6a1a';c.font=`800 22px ${FONT}`;c.fillText('× '+this.got,W/2+20,137);}},
  down(x,y){if(this.ph==='roll'){const h=hitPlane(this.S,x,y,0);if(h)this.target={x:h.x,z:h.z};return;}
    if(this.ph==='deco'){const by=H-120;for(let i=0;i<SN_DEC.length;i++)if(Math.abs(x-(60+i*96))<42&&Math.abs(y-by)<44){this.sel=SN_DEC[i][0];sfx('tap');sayPair(SN_DEC[i][1],SN_DEC[i][2]);return;}
      if(this.decs.length>=3&&hitC(x,y,W-70,by-110,42)){sfx('fanfare');confetti(60);this.fu.cheer=3;say('すてきな ゆきだるま！ つぎは そりあそびだよ');setTimeout(()=>{if(scene===this)this.startSled();},2200);this.ph='wait';return;}
      if(!this.sel){say('したから かざりを えらんでね');return;}const h=ray3(this.S,x,y).intersectObjects(this.balls.map(b=>b.m),false)[0];if(!h)return;const n=h.face.normal.clone().transformDirection(h.object.matrixWorld);this.addDec(this.sel,h.point,n);sfx('pop');return;}
    if(this.ph==='sled')this.sl.tx=clamp((x-W/2)/(W/2)*7,-7,7);},
  move(x,y){if(this.ph==='roll'){const h=hitPlane(this.S,x,y,0);if(h)this.target={x:h.x,z:h.z};}if(this.ph==='sled')this.sl.tx=clamp((x-W/2)/(W/2)*7,-7,7);},
  up(){if(this.ph==='roll')this.target=null;},
  hint(){if(this.ph==='roll'){const b=this.cur,need=this.need[this.bi];const p=toScr(this.S,new THREE.Vector3(b.x,b.r,b.z));if(b.r<need*.98)return{x:p.x,y:p.y,x2:p.x+(b.x>0?-150:150),y2:p.y};const z=toScr(this.S,new THREE.Vector3(0,0,-2));return{x:p.x,y:p.y,x2:z.x,y2:z.y};}
    if(this.ph==='deco'){if(!this.sel)return{x:60,y:H-120};const b=this.balls[2];if(!b)return null;const p=toScr(this.S,new THREE.Vector3(0,b.y,-2+b.r));return{x:p.x,y:p.y};}return null;},
  hintText(){return this.ph==='roll'?'ゆきだまを ゆびで ころがそう':this.ph==='deco'?'かざりを えらんで ゆきだるまに タッチ':'ゆびで そりを うごかそう';}});

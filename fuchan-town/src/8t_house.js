// ================= ふーちゃんの おうち (3D) =================
SCN.myhouse={bg:'#ffe8f2',song:'fuwa',
  enter(){this.ready=false;this.sel=null;this.drag=null;this.tray=null;this.trayX=0;this.night=false;this.T0=0;
    need3D(()=>{if(scene!==this)return;try{if(!this.sc){r3main();this.build();}this.loadRoom();this.ready=true;}catch(e){console.error(e);this.fail=true;}});
    setTimeout(()=>{if(scene===this)say(invList().some(q=>!IT3M[q.id].decor)?'ふーちゃんの おうち！ したの かぐを タッチして かざろう':'ふーちゃんの おうち！ かぐを うごかしたり タッチして あそぼう');},600);},
  build(){const s=new THREE.Scene();this.sc=s;this.hemi=new THREE.HemisphereLight(0xffffff,0xffd8e8,.62);s.add(this.hemi);
    const dl=new THREE.DirectionalLight(0xfff6ee,.72);dl.position.set(7,14,9);dl.castShadow=true;dl.shadow.mapSize.set(1024,1024);const sc=dl.shadow.camera;sc.left=-9;sc.right=9;sc.top=9;sc.bottom=-9;sc.near=1;sc.far=40;dl.shadow.bias=-.0006;dl.shadow.normalBias=.03;s.add(dl);this.dl=dl;
    this.amb=new THREE.AmbientLight(0xffffff,.2);s.add(this.amb);this.cam=new THREE.PerspectiveCamera(40,W/H,.5,200);this.rc=new THREE.Raycaster();if(this.az==null){this.az=.78;this.zm=1;}
    this.fu=this.mkSprite('fu');this.rk=this.mkSprite('rk');for(const p of[this.fu,this.rk])s.add(p.sp,p.sh);
    this.ring=mesh3(new THREE.Group(),geo3('selring',()=>new THREE.TorusGeometry(1,.06,8,48)),m3('#ff5fa2',{emissive:new THREE.Color('#ff5fa2'),emissiveIntensity:.6}));this.ring.rotation.x=Math.PI/2;this.ring.castShadow=false;s.add(this.ring);
    const sg=new THREE.Group();this.starG=sg;s.add(sg);SEEDR=21;for(let i=0;i<60;i++){const w=srand()<.5,a=srand()*9.6-4.8,y=.6+srand()*4.8;const m=mesh3(sg,geo3('stardot',()=>new THREE.SphereGeometry(.06,6,4)),m3('#fff6b0',{emissive:new THREE.Color('#fff6b0'),emissiveIntensity:1}),w?-4.9:a,y,w?a:-4.9);m.castShadow=false;}sg.visible=false;},
  mkSprite(k){const cv2=document.createElement('canvas');cv2.width=200;cv2.height=300;const tx=new THREE.CanvasTexture(cv2);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tx,transparent:true}));sp.center.set(.5,.03);const h=k==='fu'?3:2.1;sp.scale.set(h*2/3,h,1);
    const sh=new THREE.Mesh(geo3('blob',()=>new THREE.CircleGeometry(.5,24)),new THREE.MeshBasicMaterial({color:0x5a3a6a,transparent:true,opacity:.2,depthWrite:false}));sh.rotation.x=-Math.PI/2;sh.scale.setScalar(k==='fu'?1:.75);
    return{k,cv:cv2,tx,sp,sh,x:k==='fu'?2:3,z:k==='fu'?2.4:3.2,y:0,dir:0,mv:false,path:null,pose:null,jump:0};},
  room(){return SAVE.house.rooms[SAVE.house.cur];},
  garden(){return SAVE.house.cur===2;},
  loadRoom(){const s=this.sc;if(this.rg)s.remove(this.rg);if(this.items)s.remove(this.items);this.objs=[];this.sel=null;this.rg=this.mkRoom();s.add(this.rg);this.items=new THREE.Group();s.add(this.items);
    for(const it of this.room().it)this.spawn(it);this.settle();for(const p of[this.fu,this.rk]){p.path=null;p.pose=null;p.y=0;}this.fu.x=2;this.fu.z=2.4;this.rk.x=3;this.rk.z=3.2;this.setNight(false);},
  mkRoom(){const R=this.room(),g=new THREE.Group(),gar=this.garden();
    B3(g,10.8,1.4,10.8,gar?'#b8845a':'#ffd0e2',0,-1.42,0,.35);const ft=decorTex(R.f);ft.repeat.set(2.5,2.5);const fl=PL3(g,10,10,ft,0,.005,0);fl.rotation.x=-Math.PI/2;fl.userData.floor=1;
    if(!gar){const wt=decorTex(R.w);wt.repeat.set(3.5,2);B3(g,10.6,6,.3,'#ffffff',-.15,0,-5.15,.06);B3(g,.3,6,10.6,'#ffffff',-5.15,0,-.15,.06);
      const nw=PL3(g,10,6,wt,0,3,-4.99);const ww=PL3(g,10,6,wt,-4.99,3,0);ww.rotation.y=Math.PI/2;B3(g,10,.32,.1,'#ffffff',0,0,-4.95,.03);B3(g,.1,.32,10,'#ffffff',-4.95,0,0,.03);
      B3(g,10.7,.2,.4,'#ff9ec8',-.15,5.95,-5.15,.08);B3(g,.4,.2,10.7,'#ff9ec8',-5.15,5.95,-.15,.08);
      // window
      B3(g,2.6,2.2,.16,'#ffffff',2.2,2.1,-4.95,.06);const sky=ctex('winsky',128,110,(c,w,h)=>{const gr=c.createLinearGradient(0,0,0,h);gr.addColorStop(0,'#7ac8ff');gr.addColorStop(1,'#d8f2ff');c.fillStyle=gr;c.fillRect(0,0,w,h);cloud(c,40,40,.35,false);c.fillStyle='#9ee07a';c.fillRect(0,h*.78,w,h);});
      PL3(g,2.2,1.8,sky,2.2,3.2,-4.86,{emissive:new THREE.Color('#ffffff'),emissiveMap:sky,emissiveIntensity:.55});B3(g,.1,1.8,.06,'#ffffff',2.2,2.3,-4.84,.02);B3(g,2.2,.1,.06,'#ffffff',2.2,3.15,-4.84,.02);
      for(const sd of[-1,1]){const cu=S3(g,.5,'#ffb3d6',2.2+sd*1.45,3.2,-4.75,.5,2.4,.3);cu.castShadow=false;}B3(g,3.4,.16,.3,'#ff8cc0',2.2,4.35,-4.8,.06);
      // door
      B3(g,.14,3.6,2,'#ffc8a0',-4.92,0,2.6,.08);S3(g,.09,'#ffd23a',-4.82,1.7,1.9);heartMesh(g,.22,'#ff8cc0',-4.83,2.8,2.6,.05).rotation.y=Math.PI/2;}
    else{for(let i=0;i<17;i++){B3(g,.34,1.3,.12,'#ffffff',-4.8+i*.6,0,-4.9,.08);B3(g,.12,1.3,.34,'#ffffff',-4.9,0,-4.8+i*.6,.08);}B3(g,10,.14,.08,'#ffffff',0,.8,-4.95,.03);B3(g,.08,.14,10,'#ffffff',-4.95,.8,0,.03);
      SEEDR=33;for(let i=0;i<5;i++){S3(g,.8,'#6cd08a',-4.3+i*2.2,.6,-5.6,1,.8,.7);S3(g,.8,'#58c078',-5.6,.6,-4.3+i*2.2,.7,.8,1);}
      const t=new THREE.Group();t.position.set(-6.5,0,-6.5);g.add(t);C3(t,.3,.4,2.5,'#a8704a',0,0,0);for(let i=0;i<5;i++)S3(t,1.1,i%2?'#6cd08a':'#4cbe7a',(srand()-.5)*1.6,3+srand()*1.4,(srand()-.5)*1.6);}
    return g;},
  spawn(it){const def=IT3M[it.id];if(!def||def.decor)return null;const o={it,def,t:rand(0,9),bn:0};const g=buildItem(def,o);o.g=g;g.traverse(m=>{m.userData.o=o;});this.items.add(g);this.objs.push(o);this.place(o);return o;},
  fp(o){const d=o.def,r=(o.it.r||0)%2;return r?[d.fd,d.fw]:[d.fw,d.fd];},
  place(o){const it=o.it,d=o.def;if(d.wall){const off=-4.99+(d.fd||.2)/2;if(it.wl==='w'){o.g.position.set(off,it.y,it.a);o.g.rotation.y=Math.PI/2;}else{o.g.position.set(it.a,it.y,off);o.g.rotation.y=0;}}
    else{o.g.position.set(it.x,it.y||0,it.z);o.g.rotation.y=-(it.r||0)*Math.PI/2;}},
  settle(){for(const o of this.objs){const d=o.def;if(!d.small)continue;let y=0;for(const q of this.objs){if(q===o||!q.def.top)continue;const[fw,fd]=this.fp(q);if(Math.abs(o.it.x-q.it.x)<fw/2&&Math.abs(o.it.z-q.it.z)<fd/2)y=Math.max(y,q.def.top);}o.it.y=y;this.place(o);}},
  clampIt(o){const it=o.it,[fw,fd]=this.fp(o);it.x=clamp(it.x,-5+fw/2,5-fw/2);it.z=clamp(it.z,-5+fd/2,5-fd/2);},
  ray(x,y){this.rc.setFromCamera(new THREE.Vector2(x/W*2-1,-(y/H*2-1)),this.cam);return this.rc;},
  pick(x,y){const hits=this.ray(x,y).intersectObjects(this.items.children,true);for(const h of hits){const o=h.object.userData.o;if(o)return o;}return null;},
  pickP(x,y){const hits=this.ray(x,y).intersectObjects([this.fu.sp,this.rk.sp],false);return hits.length?(hits[0].object===this.fu.sp?this.fu:this.rk):null;},
  floorPt(x,y){const v=new THREE.Vector3();return this.ray(x,y).ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0,1,0),0),v)?v:null;},
  wallPt(x,y){const r=this.ray(x,y).ray,best=[];const vn=new THREE.Vector3(),vw=new THREE.Vector3();
    if(r.intersectPlane(new THREE.Plane(new THREE.Vector3(0,0,1),4.9),vn)&&Math.abs(vn.x)<5.2&&vn.y>0&&vn.y<6.2)best.push({w:'n',a:vn.x,y:vn.y,d:vn.distanceTo(r.origin)});
    if(r.intersectPlane(new THREE.Plane(new THREE.Vector3(1,0,0),4.9),vw)&&Math.abs(vw.z)<5.2&&vw.y>0&&vw.y<6.2)best.push({w:'w',a:vw.z,y:vw.y,d:vw.distanceTo(r.origin)});
    best.sort((a,b)=>a.d-b.d);return best[0]||null;},
  scr(v){const p=v.clone().project(this.cam);return{x:(p.x+1)/2*W,y:(1-p.y)/2*H};},
  oScr(o,dy){const b=new THREE.Box3().setFromObject(o.g);const c=b.getCenter(new THREE.Vector3());c.y=b.max.y+(dy||0);return this.scr(c);},
  camUpd(){const el=.7,dist=34*this.zm,tg=new THREE.Vector3(-.3,1.2,-.3);const cam=this.cam;cam.position.set(tg.x+Math.sin(this.az)*Math.cos(el)*dist,tg.y+Math.sin(el)*dist,tg.z+Math.cos(this.az)*Math.cos(el)*dist);
    const hf=Math.atan(7.7/dist);cam.aspect=W/H;cam.fov=clamp(2*Math.atan(Math.tan(hf)/cam.aspect)*180/Math.PI,20,75);cam.updateProjectionMatrix();cam.lookAt(tg);
    this.cr=new THREE.Vector3(Math.cos(this.az),0,-Math.sin(this.az));},
  setNight(on){this.night=on;if(!this.sc)return;this.starG.visible=on&&!this.garden();this.hemi.intensity=on?.18:.62;this.dl.intensity=on?.15:.72;this.amb.intensity=on?.12:.2;},
  walk(p,x,z,then){p.path={x:clamp(x,-4.5,4.5),z:clamp(z,-4.5,4.5)};p.then=then||null;p.pose=null;p.y=0;},
  updP(p,dt,sp){if(p.jump>0)p.jump=Math.max(0,p.jump-dt*2.2);if(p.path){const dx=p.path.x-p.x,dz=p.path.z-p.z,d=Math.hypot(dx,dz);if(d<.06){p.path=null;p.mv=false;p.dir=0;if(p.then){const f=p.then;p.then=null;f();}}
      else{const st=Math.min(d,sp*dt);p.x+=dx/d*st;p.z+=dz/d*st;p.mv=true;const sx=dx*this.cr.x+dz*this.cr.z,depth=-(dx*Math.sin(this.az)+dz*Math.cos(this.az));p.dir=Math.abs(sx)>Math.abs(depth)*.6?(sx<0?1:2):(depth>0?3:0);}}
    const jy=Math.sin(p.jump*Math.PI)*.8;p.sp.position.set(p.x,p.y+jy,p.z);p.sp.material.rotation=p.pose==='sleep'?Math.PI/2:0;if(p.pose==='sleep')p.sp.position.y=p.y+.2;p.sh.position.set(p.x,.02+p.y,p.z);
    const c=p.cv.getContext('2d');c.clearRect(0,0,200,300);if(p.k==='fu')drawFuka(c,100,294,{outfit:outfit(),t:T,sc:4.5,dir:p.mv?p.dir:0,moving:p.mv,cheer:p.jump>0,wave:!p.mv&&!p.pose&&(T%5)<1});else drawRikki(c,100,294,{sc:4.1,t:T,moving:p.mv,dir:p.mv?p.dir:0,clap:p.jump});p.tx.needsUpdate=true;},
  near(o){const[fw,fd]=this.fp(o);const r=o.it.r||0;const f=[[0,1],[-1,0],[0,-1],[1,0]][r];return{x:o.it.x+f[0]*(fd/2+.6),z:o.it.z+f[1]*(fd/2+.6)};},
  act(o){const d=o.def,pos=this.oScr(o,.3);o.bn=1;
    switch(d.act){
      case'sleep':case'sit':{const n=this.near(o);this.walk(this.fu,n.x,n.z,()=>{const f=this.fu;f.x=o.it.x;f.z=o.it.z;f.y=d.seat;f.pose=d.act;if(d.act==='sleep'){say('おやすみなさ〜い… すやすや');this.zz=3;}else{say(pick(['すわって ひとやすみ','ふかふか〜！','いい きもち！']));}});sayPair(d.n,d.en);break;}
      case'light':o.on=!o.on;o.shade.material.emissiveIntensity=o.on?1:0;if(o.on&&!o.pl){o.pl=new THREE.PointLight(0xffd890,1.1,9);o.pl.position.set(0,2.2,0);o.g.add(o.pl);}if(o.pl)o.pl.visible=!!o.on;sfx(o.on?'ding':'tap');sayPair(o.on?'でんき つけた！':'でんき けした','light '+(o.on?'on':'off'));break;
      case'tv':o.on=!o.on;drawTV(o.on);sfx(o.on?'spark':'tap');if(o.on)say('テレビ！ ふーちゃんが おどってる！');break;
      case'piano':{const sc=[0,2,4,5,7,9,11,12];for(let i=0;i<5;i++){const m=60+pick(sc);tone(mtof(m+12),.5,'triangle',.25,i*.16);setTimeout(()=>{if(scene===this)parts.push({x:pos.x+rand(-40,40),y:pos.y,vx:rand(-30,30),vy:-140,life:1.2,t:0,kind:'note',col:pick(PAST),r:14});},i*160);}sayPair(d.n,d.en);break;}
      case'music':o.v=3;[0,4,7,12,7,4,0].forEach((n,i)=>tone(mtof(72+n),.3,'sine',.2,i*.2));sayPair(d.n,d.en);break;
      case'rock':case'swing':o.kick=1;sfx('boing');sayPair(d.n,d.en);break;
      case'spin':o.v=7;sfx('whoosh');sayPair('ちきゅう','earth');break;
      case'dog':o.kick=1;hush();speak('わんわん！');sfx('squeak');burst(pos.x,pos.y,8,'heart');break;
      case'bubble':bubbles(pos.x,pos.y+40,8);sfx('water');sayPair(d.n,d.en);break;
      case'splash':drops(pos.x,pos.y+30,14);sfx('splash');sayPair(d.n,d.en);break;
      case'stars':confetti(40);sfx('spark');say('ぼうえんきょうで のぞくと… おほしさまが きらきら！');break;
      case'starlamp':this.setNight(!this.night);sfx('spark');say(this.night?'ほしぞら ランプ！ おへやが ほしで いっぱい！':'あさに なったよ！');break;
      case'hug':{const n=this.near(o);this.walk(this.fu,n.x,n.z,()=>{this.fu.jump=1;burst(pos.x,pos.y,10,'heart');sfx('heart');});sayPair(d.n,d.en);break;}
      default:sfx('boing');sayPair(d.n,d.en);}},
  update(dt){if(!this.ready)return;thumbWork();this.T0+=dt;
    for(const o of this.objs){o.t+=dt;if(o.def.anim)o.def.anim(o,o.t,dt);if(o.bn>0){o.bn=Math.max(0,o.bn-dt*2);const k=Math.sin(o.bn*Math.PI*3)*.12*o.bn;o.g.scale.set(1+k,1-k,1+k);}else o.g.scale.set(1,1,1);if(o.on&&o.def.act==='tv'&&(Math.floor(T*20)%2))drawTV(true);}
    if(this.drag&&this.drag.moved&&this.drag.o)this.drag.o.g.position.y+=.3;
    const f=this.fu,r=this.rk;this.camUpd();this.updP(f,dt,3.6);
    if(!r.pose&&Math.hypot(f.x-r.x,f.z-r.z)>1.8&&!r.path&&!f.pose){this.walk(r,f.x+.9,f.z+.6);}if(r.path&&!f.path&&Math.hypot(f.x-r.x,f.z-r.z)<1.2){r.path=null;r.mv=false;}this.updP(r,dt,3.2);
    if(this.zz>0){this.zz-=dt;if(Math.random()<dt*2){const p=this.scr(new THREE.Vector3(f.x,f.y+1.2,f.z));parts.push({x:p.x+20,y:p.y,vx:30,vy:-50,life:1.5,t:0,kind:'note',col:'#9a8aff',r:10});}if(this.zz<=0&&f.pose==='sleep'){f.pose=null;f.y=0;f.jump=1;const n=this.near(this.objs.find(o=>o.def.act==='sleep')||{it:{x:f.x,z:f.z,r:0},def:{fw:1,fd:1}});f.x=n.x;f.z=n.z;say('おはよう！ よく ねたね！');}}
    if(this.sel&&!this.sel.def.wall){const[fw,fd]=this.fp(this.sel);this.ring.visible=true;this.ring.position.set(this.sel.it.x,(this.sel.it.y||0)+.06,this.sel.it.z);const s=Math.max(fw,fd)*.62+Math.sin(T*6)*.05;this.ring.scale.set(s,s,s);}else this.ring.visible=false;},
  trayY(){return H-170;},
  btns(){const B=[];if(this.sel){const y=this.trayY()-58;if(!this.sel.def.wall)B.push(['rotate','#7ab8ff',W/2-120,y]);B.push(['box','#ffb03a',W/2,y]);B.push(['check','#6cd08a',W/2+120,y]);}return B;},
  draw(c){const g=c.createLinearGradient(0,0,0,H);if(this.night){g.addColorStop(0,'#2a2a6a');g.addColorStop(1,'#6a5aa8');}else{g.addColorStop(0,'#bfe6ff');g.addColorStop(1,'#ffe6f2');}c.fillStyle=g;c.fillRect(-OX/SC,-OY/SC,W+2*OX/SC,H+2*OY/SC);
    if(!this.night){cloud(c,120,230,.7,true);cloud(c,470,300,.55,true);}else{c.fillStyle='#fff6c0';for(let i=0;i<30;i++){star(c,(i*97)%W,(i*53)%(H*.6),3+(i%3),1.4);c.fill();}}
    if(this.fail){c.fillStyle='#c0508a';c.font=`800 24px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('この きかいでは 3Dの おうちが',W/2,H/2-20);c.fillText('ひらけないみたい…',W/2,H/2+20);return;}if(!this.ready){c.fillStyle='#ff8cc0';c.font=`800 28px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('おうちを じゅんびちゅう…',W/2,H/2);for(let i=0;i<8;i++){c.globalAlpha=(i+1)/8;circ(c,W/2+Math.cos(T*6+i*.8)*40,H/2+70+Math.sin(T*6+i*.8)*40,8);}c.globalAlpha=1;return;}
    const r=r3main();r.render(this.sc,this.cam);c.drawImage(r.domElement,0,0,W,H);
    // room tabs
    ROOMS.forEach((rm,i)=>{const x=110+i*190,y=132,on=SAVE.house.cur===i;c.fillStyle=on?'#ff6fa8':'rgba(255,255,255,.9)';rr(c,x-84,y-24,168,48,24);c.fill();c.strokeStyle=on?'#fff':'#ffb3d6';c.lineWidth=3;c.stroke();c.fillStyle=on?'#fff':'#c0508a';c.font=`800 22px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(rm[0],x,y+1);});
    wallet(c,W-150,60,.95);
    for(const [ic,col,x,y] of this.btns()){drawBtn(c,x,y,34,col,ic);c.fillStyle='#fff';c.font=`800 15px ${FONT}`;c.textAlign='center';c.lineWidth=4;c.strokeStyle='rgba(90,40,110,.6)';const lb={rotate:'まわす',box:'しまう',check:'OK'}[ic];c.strokeText(lb,x,y+46);c.fillText(lb,x,y+46);}
    // tray
    const ty=this.trayY();c.fillStyle='rgba(255,255,255,.93)';rr(c,8,ty,W-16,162,28);c.fill();c.strokeStyle='#ffb3d6';c.lineWidth=4;c.stroke();
    drawBtn(c,64,ty+70,40,'#5ab8ff','cart',SAVE.coins>=30&&(T%4)<1);c.fillStyle='#3a7ab8';c.font=`800 16px ${FONT}`;c.textAlign='center';c.fillText('おみせ',64,ty+128);
    const L=invList();c.save();c.beginPath();c.rect(124,ty,W-136,162);c.clip();
    if(!L.length){c.fillStyle='#b08aa0';c.font=`800 20px ${FONT}`;c.fillText('ぜんぶ かざったよ！ おみせで かおう',W/2+50,ty+80);}
    L.forEach((q,i)=>{const x=190+i*118+this.trayX,y=ty+66;if(x<60||x>W+60)return;const d=IT3M[q.id],dim=this.garden()&&(d.wall||d.decor&&d.t==='wall')||!this.garden()&&false;c.globalAlpha=dim?.35:1;
      c.fillStyle=d.h?'#fff0f7':'#fffaf2';rr(c,x-54,y-54,108,108,20);c.fill();c.strokeStyle=d.h?'#ff7ab0':d.decor?'#9ad0ff':'#ffd08a';c.lineWidth=3;c.stroke();drawThumb(c,q.id,x,y,100);
      if(d.decor){const cur=this.room()[d.t==='wall'?'w':'f']===q.id;if(cur){c.fillStyle='#6cd08a';rr(c,x-40,y+36,80,22,11);c.fill();c.fillStyle='#fff';c.font=`800 13px ${FONT}`;c.fillText('つかってる',x,y+48);}}
      else if(q.n>1){c.fillStyle='#ff5f9a';circ(c,x+44,y-44,15);c.fillStyle='#fff';c.font=`800 16px ${FONT}`;c.fillText(q.n,x+44,y-43);}
      c.fillStyle='#7a5a6a';c.font=`800 14px ${FONT}`;c.fillText(d.n,x,y+76,112);c.globalAlpha=1;});c.restore();},
  hitBtn(x,y){for(const b of this.btns())if(hitC(x,y,b[2],b[3],40))return b[0];return null;},
  down(x,y){if(!this.ready)return;const ty=this.trayY();
    if(this.hitBtn(x,y)){this.tap0={btn:this.hitBtn(x,y)};return;}
    for(let i=0;i<3;i++)if(Math.abs(x-(110+i*190))<84&&Math.abs(y-132)<26){this.tap0={room:i};return;}
    if(y>ty){this.tray={sx:x,x0:this.trayX,moved:false};return;}
    const o=this.pick(x,y);const p=this.pickP(x,y);
    if(p&&(!o||true)){this.tap0={p};return;}
    if(o){const it=o.it;let ox=0,oz=0;if(!o.def.wall){const f=this.floorPt(x,y);if(f){ox=f.x-it.x;oz=f.z-it.z;}}this.drag={o,sx:x,sy:y,ox,oz,moved:false};return;}
    this.drag={bg:1,sx:x,sy:y,az0:this.az,zm0:this.zm,moved:false};},
  move(x,y){if(this.tray){const t=this.tray;if(Math.abs(x-t.sx)>10)t.moved=true;if(t.moved){const L=invList().length;this.trayX=clamp(t.x0+x-t.sx,Math.min(0,W-200-(L-1)*118-60),0);}return;}
    const d=this.drag;if(!d)return;if(!d.moved&&Math.hypot(x-d.sx,y-d.sy)>12){d.moved=true;if(d.o){this.sel=d.o;sfx('pop');}}if(!d.moved)return;
    if(d.bg){this.az=clamp(d.az0-(x-d.sx)*.006,.12,1.45);this.zm=clamp(d.zm0+(y-d.sy)*.0016,.5,1.25);return;}
    const o=d.o,it=o.it;if(o.def.wall){if(this.garden())return;const p=this.wallPt(x,y);if(p){it.wl=p.w;it.a=clamp(Math.round(p.a*4)/4,-5+o.def.fw/2,5-o.def.fw/2);it.y=clamp(Math.round(p.y*4)/4,1,5.2);this.place(o);}}
    else{const f=this.floorPt(x,y);if(f){it.x=Math.round((f.x-d.ox)*4)/4;it.z=Math.round((f.z-d.oz)*4)/4;this.clampIt(o);this.place(o);this.settle();}}},
  up(x,y){if(!this.ready)return;const t0=this.tap0;this.tap0=null;
    if(this.tray){const t=this.tray;this.tray=null;if(!t.moved)this.trayTap(x);return;}
    if(t0){if(t0.btn)this.doBtn(t0.btn);else if(t0.room!=null){if(SAVE.house.cur!==t0.room){SAVE.house.cur=t0.room;save();this.loadRoom();sfx('whoosh');sayPair(ROOMS[t0.room][0],ROOMS[t0.room][1]);}}
      else if(t0.p){t0.p.jump=1;sfx('boing');burst(x,y-40,8,'heart');if(t0.p===this.fu){if(this.fu.pose){this.fu.pose=null;this.fu.y=0;this.zz=0;}say(pick(['わたしの おうち、 かわいいでしょ！','なにを かざろうかな？','りっきー、 あそぼう！','おうち だいすき！']));}else{RK.hop=1;say(pick(['ばぶー！','きゃっきゃ！','ねえね〜！']));}}return;}
    const d=this.drag;this.drag=null;if(!d)return;
    if(d.o){if(d.moved){this.place(d.o);this.settle();save();sfx('snap');}else{this.sel=d.o;this.act(d.o);}return;}
    if(d.bg&&!d.moved){if(this.sel){this.sel=null;sfx('tap');return;}const f=this.floorPt(x,y);if(f&&Math.abs(f.x)<5&&Math.abs(f.z)<5){this.walk(this.fu,f.x,f.z);sfx('tap');ring(x,y,'rgba(255,140,190,.8)');}}},
  doBtn(b){const o=this.sel;if(!o)return;if(b==='rotate'){o.it.r=((o.it.r||0)+1)%4;this.clampIt(o);this.place(o);this.settle();o.bn=.8;sfx('whoosh');save();}
    else if(b==='box'){const R=this.room();R.it=R.it.filter(q=>q!==o.it);this.items.remove(o.g);this.objs=this.objs.filter(q=>q!==o);this.sel=null;this.settle();save();sfx('pop');say('しまったよ');}
    else{this.sel=null;sfx('ding');}},
  ov(ax,az,aw,ad,bx,bz,bw,bd){return Math.max(0,Math.min(ax+aw/2,bx+bw/2)-Math.max(ax-aw/2,bx-bw/2))*Math.max(0,Math.min(az+ad/2,bz+bd/2)-Math.max(az-ad/2,bz-bd/2));},
  freeSpot(d){if(d.small){for(const q of this.objs){if(!q.def.top)continue;if(this.objs.some(o=>o!==q&&o.def.small&&Math.abs(o.it.x-q.it.x)<.6&&Math.abs(o.it.z-q.it.z)<.6))continue;return{x:q.it.x,z:q.it.z};}}
    let best={x:0,z:0},bs=1e9;for(let x=-5+d.fw/2;x<=5-d.fw/2+1e-6;x+=.5)for(let z=-5+d.fd/2;z<=5-d.fd/2+1e-6;z+=.5){let ov=0;for(const o of this.objs){if(o.def.wall||(o.def.flat&&!d.flat)||(!o.def.flat&&d.flat))continue;const[ow,od]=this.fp(o);ov+=this.ov(x,z,d.fw,d.fd,o.it.x,o.it.z,ow,od);}
      if(!this.garden()&&x<-3.4&&z>1.2&&z<4)ov+=.5;const sc=ov*10+Math.hypot(x-this.fu.x,z-this.fu.z)*.05;if(sc<bs){bs=sc;best={x,z};}}return best;},
  wallSpot(d){let best={wl:'n',a:0,y:3.4},bs=1e9;for(const wl of['n','w'])for(const y of[3.4,4.4,2.4])for(let a=-5+d.fw/2;a<=5-d.fw/2+1e-6;a+=.5){let ov=0;
      if(wl==='n')ov+=this.ov(a,y,d.fw,1.2,2.2,3.2,2.8,2.6);else ov+=this.ov(a,y,d.fw,1.2,2.6,1.8,2.2,3.8);
      for(const o of this.objs){if(!o.def.wall||o.it.wl!==wl)continue;ov+=this.ov(a,y,d.fw,1.2,o.it.a,o.it.y,o.def.fw,1.2);}const sc=ov*10+Math.abs(y-3.4)*.3+Math.abs(a)*.02;if(sc<bs){bs=sc;best={wl,a,y};}}return best;},
  trayTap(x){const L=invList();const i=Math.round((x-190-this.trayX)/118);const q=L[i];if(!q||Math.abs(x-(190+i*118+this.trayX))>56)return;const d=IT3M[q.id];
    if(d.decor){if(this.garden()){say('かべや ゆかは おへやで かえられるよ');return;}const R=this.room(),k=d.t==='wall'?'w':'f';R[k]=q.id;save();this.loadRoom();sfx('spark');confetti(30);sayPair(d.n,d.en);return;}
    if(d.wall&&this.garden()){say('かべに かざる ものは おへやで つかってね');sfx('no');return;}
    const R=this.room(),it={u:++SAVE.house.uid,id:q.id,r:0};if(d.wall)Object.assign(it,this.wallSpot(d));else Object.assign(it,this.freeSpot(d));
    R.it.push(it);const o=this.spawn(it);if(!o)return;this.clampIt(o);this.place(o);this.settle();o.bn=1;this.sel=o;save();sfx('pop');const p=this.oScr(o,.2);burst(p.x,p.y,14,'star');sayPair(d.n,d.en);},
  hint(){if(!this.ready)return null;const L=invList().filter(q=>!IT3M[q.id].decor);if(L.length&&!this.room().it.length)return{x:190+this.trayX,y:this.trayY()+66};return null;},
  hintText(){return 'したの かぐを タッチすると おへやに おけるよ。 ゆびで うごかしてね';}};

// ================= かぐやさん (shop) =================
SCN.kagu={bg:'#fff4e0',song:'town',
  enter(){this.tab=this.tab||'kagu';this.sy=0;this.det=null;this.pan=null;this.ready=!!window.THREE;need3D(()=>{this.ready=true;});setTimeout(()=>{if(scene===this)say('いらっしゃいませ！ かぐやさんだよ。 コインで すきな ものを かってね');},500);},
  gy(){return 400;},
  cards(){const off=this.tab==='hana'?64:0;return shopList(this.tab).map((d,i)=>({d,x:110+(i%3)*190,y:this.gy()+130+off+Math.floor(i/3)*250-this.sy}));},
  maxS(){const n=shopList(this.tab).length;return Math.max(0,this.gy()+Math.ceil(n/3)*250+130-H);},
  price(d){return{v:d.p,h:!!d.h};},
  have(d){return d.decor?!!SAVE.own[d.id]:(SAVE.own[d.id]||0);},
  afford(d){return d.h?SAVE.hana>=d.p:SAVE.coins>=d.p;},
  update(dt){if(this.ready)for(let i=0;i<2;i++)thumbWork();if(this.det)this.det.t+=dt;if(!this.pan&&this.v){this.sy=clamp(this.sy+this.v*dt,0,this.maxS());this.v*=Math.pow(.05,dt);if(Math.abs(this.v)<5)this.v=0;}},
  draw(c){c.fillStyle='#fff4e0';c.fillRect(-OX/SC,-OY/SC,W+2*OX/SC,H+2*OY/SC);c.fillStyle='#ffe8c8';for(let x=-40;x<W+40;x+=60)c.fillRect(x,0,30,this.gy());
    c.fillStyle='#ff8cc0';c.beginPath();c.moveTo(0,160);for(let x=0;x<=W;x+=50){c.quadraticCurveTo(x+25,200,x+50,160);}c.lineTo(W,120);c.lineTo(0,120);c.fill();c.fillStyle='#fff';for(let x=25;x<W;x+=100){c.beginPath();c.moveTo(x-25,120);c.lineTo(x+25,120);c.lineTo(x+25,160);c.quadraticCurveTo(x,200,x-25,160);c.fill();}
    titleText(c,'かぐやさん',W/2-40,245,50,'#ff6fa8');drawAnimal(c,'bear',500,300,.75,{t:T,happy:1});c.fillStyle='#ff8cc0';rr(c,478,262,44,30,8);c.fill();
    wallet(c,W-150,60,.95);
    SHOPCATS.forEach(([k,n],i)=>{const x=110+(i%3)*190,y=318+Math.floor(i/3)*48,on=this.tab===k,hc=k==='hana';c.fillStyle=on?(hc?'#ff4d8d':'#ffa030'):'#fff';rr(c,x-86,y-20,172,40,20);c.fill();c.strokeStyle=hc?'#ff7ab0':'#ffc070';c.lineWidth=3;c.stroke();c.fillStyle=on?'#fff':hc?'#d0306a':'#b06a10';c.font=`800 19px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText((hc?'🌸 ':'')+n,x,y+1);});
    c.save();c.beginPath();c.rect(-OX/SC,this.gy(),W+2*OX/SC,H);c.clip();
    if(this.tab==='hana'){const y=this.gy()+30-this.sy;c.fillStyle='#fff0f7';rr(c,24,y-24,W-48,52,20);c.fill();c.strokeStyle='#ff7ab0';c.lineWidth=3;c.stroke();hanaIcon(c,54,y+2,16);c.fillStyle='#c02a6a';c.font=`800 17px ${FONT}`;c.textAlign='left';c.fillText('べんきょうで もらえる はなまるコインで かえるよ',78,y+3,W-120);c.textAlign='center';}
    for(const cd of this.cards()){if(cd.y<this.gy()-150||cd.y>H+150)continue;const d=cd.d,hv=this.have(d),hc=!!d.h;const x=cd.x,y=cd.y;
      c.fillStyle='rgba(120,70,40,.12)';rr(c,x-84,y-106,172,232,24);c.fill();c.fillStyle=hc?'#fff6fb':'#fff';rr(c,x-86,y-112,172,232,24);c.fill();c.strokeStyle=hc?'#ff7ab0':'#ffd08a';c.lineWidth=hc?5:4;c.stroke();
      c.fillStyle=hc?'#ffe6f2':'#fff4e4';rr(c,x-72,y-98,144,134,18);c.fill();drawThumb(c,d.id,x,y-32,140);
      c.fillStyle='#6a4a3a';c.font=`800 17px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(d.n,x,y+56,160);
      const can=this.afford(d);c.fillStyle=can?(hc?'#ff4d8d':'#ffa030'):'#d8c8c0';rr(c,x-58,y+76,116,34,17);c.fill();if(hc)hanaIcon(c,x-34,y+93,13);else coinIcon(c,x-34,y+93,13);c.fillStyle='#fff';c.font=`800 20px ${FONT}`;c.fillText(d.p,x+10,y+94);
      if(hv){c.fillStyle='#6cd08a';rr(c,x-2,y-110,90,26,13);c.fill();c.fillStyle='#fff';c.font=`800 13px ${FONT}`;c.fillText(d.decor?'もってる':`もってる×${hv}`,x+43,y-97);}}
    c.restore();
    if(this.det)this.drawDet(c);},
  drawDet(c){const D=this.det,d=IT3M[D.id],k=easeOut(Math.min(1,D.t*4));c.fillStyle=`rgba(90,40,90,${.45*k})`;c.fillRect(-OX/SC,-OY/SC,W+2*OX/SC,H+2*OY/SC);
    c.save();c.translate(W/2,H/2);c.scale(.8+.2*elastic(Math.min(1,D.t*2.5)),.8+.2*elastic(Math.min(1,D.t*2.5)));c.translate(-W/2,-H/2);const py=H*.16,ph=H*.7,hc=!!d.h;
    c.fillStyle='#fff';rr(c,40,py,W-80,ph,34);c.fill();c.strokeStyle=hc?'#ff7ab0':'#ffc070';c.lineWidth=6;c.stroke();
    c.fillStyle=hc?'#ffeef6':'#fff4e4';rr(c,70,py+30,W-140,380,26);c.fill();
    if(this.ready&&!d.decor&&!thumbFail){try{const img=pvRender(d.id,D.t*.8);c.drawImage(img,W/2-190,py+25,380,380);}catch(e){thumbFail=true;}}else drawThumb(c,d.id,W/2,py+220,300);
    c.fillStyle='#5a3a3a';c.font=`800 34px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(d.n,W/2,py+450,W-120);c.fillStyle='#3a8ad8';c.font=`800 26px ${FONT}`;c.fillText(d.en,W/2,py+492);
    const hv=this.have(d);if(hv){c.fillStyle='#3aa060';c.font=`800 20px ${FONT}`;c.fillText(d.decor?'もう もってるよ':`いま ${hv}こ もってるよ`,W/2,py+530);}
    const by=py+ph-80,can=this.afford(d)&&!(d.decor&&hv);
    if(D.bought){drawBtn(c,W/2-100,by,44,'#ff8cc0','house',true);drawBtn(c,W/2+100,by,44,'#ffb03a','cart');c.fillStyle='#8a5a9a';c.font=`800 18px ${FONT}`;c.fillText('おうちへ',W/2-100,by+60);c.fillText('つづける',W/2+100,by+60);}
    else{c.fillStyle=can?(hc?'#ff4d8d':'#6cc060'):'#d0c4c0';rr(c,W/2-150,by-38,300,76,38);c.fill();if(can){c.fillStyle='rgba(255,255,255,.35)';rr(c,W/2-140,by-32,280,24,12);c.fill();}
      if(hc)hanaIcon(c,W/2-96,by,22);else coinIcon(c,W/2-96,by,22);c.fillStyle='#fff';c.font=`800 30px ${FONT}`;c.fillText(d.decor&&hv?'もってる':can?`${d.p}  かう！`:`${d.p}`,W/2+14,by+2);
      if(!can&&!(d.decor&&hv)){const need=d.p-(hc?SAVE.hana:SAVE.coins);c.fillStyle=hc?'#c02a6a':'#a07030';c.font=`800 18px ${FONT}`;c.fillText(hc?`あと ${need}こ！ べんきょう アトラクションで あつめよう`:`あと ${need}コイン！ あそんで あつめよう`,W/2,by-58,W-120);}}
    drawBtn(c,W-80,py+10,30,'#b0a0b8','prev');c.restore();},
  down(x,y){if(this.det)return;this.pan={sx:x,sy:y,s0:this.sy,moved:false,ly:y,lt:performance.now(),v:0};this.v=0;},
  move(x,y){const p=this.pan;if(!p)return;if(Math.abs(y-p.sy)>12)p.moved=true;if(p.moved&&p.sy>this.gy()){this.sy=clamp(p.s0-(y-p.sy),0,this.maxS());const now=performance.now(),dt=Math.max(1,now-p.lt)/1000;p.v=(p.ly-y)/dt;p.ly=y;p.lt=now;}},
  up(x,y){if(this.det){this.detTap(x,y);return;}const p=this.pan;this.pan=null;if(!p)return;if(p.moved){this.v=clamp(p.v,-2500,2500);return;}
    SHOPCATS.forEach(([k],i)=>{const bx=110+(i%3)*190,by=318+Math.floor(i/3)*48;if(Math.abs(x-bx)<86&&Math.abs(y-by)<22&&this.tab!==k){this.tab=k;this.sy=0;sfx('tap');if(k==='hana')say('はなまるコーナー！ べんきょうを がんばると もらえる はなまるコインで かえるよ');}});
    if(y<this.gy())return;for(const cd of this.cards())if(Math.abs(x-cd.x)<86&&y>cd.y-112&&y<cd.y+120){this.det={id:cd.d.id,t:0,bought:false};sfx('pop');sayPair(cd.d.n,cd.d.en);return;}},
  detTap(x,y){const D=this.det,d=IT3M[D.id],py=H*.16,ph=H*.7,by=py+ph-80;if(D.t<.3)return;
    if(hitC(x,y,W-80,py+10,44)||y<py-10||y>py+ph+20){this.det=null;sfx('tap');return;}
    if(D.bought){if(hitC(x,y,W/2-100,by,54)){go('myhouse');}else if(hitC(x,y,W/2+100,by,54)){this.det=null;sfx('tap');}return;}
    if(Math.abs(x-W/2)<150&&Math.abs(y-by)<40){const hv=this.have(d);if(d.decor&&hv){say('もう もってるよ！ おうちで つかってね');return;}
      if(!this.afford(d)){sfx('no');say(d.h?'はなまるコインが たりないよ。 べんきょう アトラクションで あつめよう！':'コインが たりないよ。 アトラクションで あそんで あつめよう！');return;}
      if(d.h)SAVE.hana-=d.p;else SAVE.coins-=d.p;SAVE.own[d.id]=d.decor?1:(SAVE.own[d.id]||0)+1;save();D.bought=true;sfx('coin');sfx('fanfare');confetti(70);say(`${d.n}を かったよ！ おうちに かざろう！`);}},
  hint(){return null;}};
Object.assign(SPECIAL_THING,{
  house3:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#ff5f9a';c.beginPath();c.moveTo(-40,-4);c.lineTo(0,-38);c.lineTo(40,-4);c.closePath();c.fill();c.fillStyle='#fff6fa';rr(c,-30,-8,60,44,6);c.fill();c.fillStyle='#ffb3d6';rr(c,-9,12,18,24,5);c.fill();c.fillStyle='#8fd8ff';rr(c,-24,0,14,12,3);c.fill();rr(c,10,0,14,12,3);c.fill();c.fillStyle='#ff5f9a';heartP(c,0,-18,7);c.fill();c.restore();},
  sofa3:(c,x,y,s)=>{c.save();c.translate(x,y);c.scale(s,s);c.fillStyle='#7ac4f5';rr(c,-38,-22,76,34,12);c.fill();c.fillStyle='#8fd3ff';rr(c,-44,-6,88,30,10);c.fill();c.fillStyle='#b8e6ff';rr(c,-30,-2,28,14,6);c.fill();rr(c,2,-2,28,14,6);c.fill();c.fillStyle='#e8b87a';c.fillRect(-38,24,6,8);c.fillRect(32,24,6,8);c.fillStyle='#ffd23a';rr(c,-30,-18,16,14,5);c.fill();c.restore();}});

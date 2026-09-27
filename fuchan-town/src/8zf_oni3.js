// ================= 3D おにごっこ =================
reg3('onigokko',{bg:'#bfe9ff',song:'hero',
  build(){const S=this.S=stage3({sr:18,fov:50});const g=new THREE.Group();S.s.add(g);this.g=g;const gr=C3(g,19,19,.4,'#a8e488',0,-.4,0,48);gr.castShadow=false;
    SEEDR=Math.floor(Math.random()*1e6)+1;for(let i=0;i<30;i++){const a=i/30*TAU,r=17.5+srand()*2;tree3(g,Math.cos(a)*r,Math.sin(a)*r,1.4+srand()*.5,srand()<.3?'#8ad06a':null);}
    this.obs=[];const kinds=[bush3,barrel3,bench3,(q)=>tree3(q,0,0,1.5),flowerbed3,playhouse3,slide3];for(let i=0;i<7;i++){let x,z,ok,tr=0;do{const a=srand()*TAU,r=4+srand()*10;x=Math.cos(a)*r;z=Math.sin(a)*r;ok=this.obs.every(o=>Math.hypot(o.x-x,o.z-z)>4.5);tr++;}while(!ok&&tr<40);const og=new THREE.Group();og.position.set(x,0,z);og.rotation.y=srand()*TAU;g.add(og);kinds[i%kinds.length](og,{});this.obs.push({x,z,r:1.7});}
    this.fu=charAdd(S,charSpr('fu',2.4));this.fu.x=0;this.fu.z=0;this.fu.every=2;this.tgt=null;this.round=0;this.fin=0;this.caught=0;this.hits=0;this.stars=[];this.setRound();},
  setRound(){if(this.pals)for(const p of this.pals){this.S.s.remove(p.sp);this.S.s.remove(p.sh);}if(this.oni){this.S.s.remove(this.oni.sp);this.S.s.remove(this.oni.sh);this.g.remove(this.horns);}for(const s of this.stars)this.g.remove(s.m);this.stars=[];this.pals=[];this.oni=null;this.t=0;this.done=0;this.fu.x=0;this.fu.z=0;
    if(this.round===0){const ks=shuffle(['bear','rabbit','cat','dog','panda','pig','chick','hippo']).slice(0,4);ks.forEach((k,i)=>{const p=charAdd(this.S,charSpr(k,1.9,{k}));const a=i/4*TAU;p.x=Math.cos(a)*8;p.z=Math.sin(a)*8;p.every=3;p.seed=i;p.sp0=2.6+lvOf('onigokko')*.15+i*.15;p.wander=rand(0,TAU);this.pals.push(p);});
      this.fu.outfit=outfit({acc:'none'});setTimeout(()=>{if(scene===this)say('おにごっこ！ ふーちゃんが おにだよ。 ゆびで はしって、 みんなを タッチしよう！');},400);}
    else{const o=this.oni=charAdd(this.S,charSpr('dog',2.2,{k:'dog'}));o.x=9;o.z=-9;o.every=2;this.horns=new THREE.Group();this.g.add(this.horns);for(const s of[-1,1]){const h=mesh3(this.horns,geo3('onihorn',()=>new THREE.ConeGeometry(.16,.5,10)),'#ffd23a',s*.28,0,0);h.rotation.z=-s*.3;}
      for(let i=0;i<10;i++)this.addStar();this.escape=25;setTimeout(()=>{if(scene===this)say('こんどは おにから にげよう！ ほしを あつめながら にげてね');},400);}},
  addStar(){let x,z;do{const a=Math.random()*TAU,r=2+Math.random()*12;x=Math.cos(a)*r;z=Math.sin(a)*r;}while(this.obs.some(o=>Math.hypot(o.x-x,o.z-z)<2));const m=mesh3(this.g,starGeo(.45,.14),m3('#ffd23a',{emissive:new THREE.Color('#ffb000'),emissiveIntensity:.4}),x,1,z);this.stars.push({x,z,m});},
  push(p){for(const o of this.obs){const dx=p.x-o.x,dz=p.z-o.z,d=Math.hypot(dx,dz);if(d<o.r){p.x=o.x+dx/d*o.r;p.z=o.z+dz/d*o.r;}}const r=Math.hypot(p.x,p.z);if(r>15.5){p.x*=15.5/r;p.z*=15.5/r;}},
  update(dt){const S=this.S,fu=this.fu;this.t+=dt;if(fu.stun>0)fu.stun-=dt;
    if(this.tgt&&!this.done&&!(fu.stun>0)){charWalk(fu,this.tgt.x,this.tgt.z,this.round?6.2:6.8,dt,S.cam);this.push(fu);}else fu.mv=false;
    if(this.round===0){for(const p of this.pals){if(p.got){p.cheer=1;continue;}const dx=p.x-fu.x,dz=p.z-fu.z,d=Math.hypot(dx,dz);let vx,vz;if(d<6){vx=dx/d;vz=dz/d;const s=Math.sin(this.t*2+p.seed);vx+=-dz/d*s*.6;vz+=dx/d*s*.6;}else{p.wander+=dt*(Math.random()-.5)*2;vx=Math.cos(p.wander);vz=Math.sin(p.wander);}
        const sp=d<6?p.sp0:1.2;const n=Math.hypot(vx,vz)||1;p.x+=vx/n*sp*dt;p.z+=vz/n*sp*dt;this.push(p);if(Math.hypot(p.x,p.z)>15)p.wander+=Math.PI;p.mv=true;
        if(d<1.1&&!this.done){p.got=1;this.caught++;sfx('fanfare');const q=toScr(S,new THREE.Vector3(p.x,1.5,p.z));burst(q.x,q.y,14,'heart');hush();speak(`${WORDS[p.k][0]} タッチ！`);if(this.pals.every(q=>q.got)){this.done=.01;say('みんな つかまえた！');}}}}
    else{const o=this.oni;if(!this.done){this.escape-=dt;const dx=fu.x-o.x,dz=fu.z-o.z,d=Math.hypot(dx,dz);const sp=(o.rest>0?0:3.3+lvOf('onigokko')*.1+Math.min(1.2,this.t*.03));if(o.rest>0)o.rest-=dt;if(d>.1){o.x+=dx/d*sp*dt;o.z+=dz/d*sp*dt;}this.push(o);o.mv=sp>0;
        if(d<1&&!(fu.stun>0)){this.hits++;fu.stun=1.2;o.rest=1.6;sfx('boing');hush();speak('つかまっちゃった！ にげて！');const lost=Math.min(2,fu.got||0);fu.got=(fu.got||0)-lost;}
        for(const s of this.stars){if(!s.got&&Math.hypot(s.x-fu.x,s.z-fu.z)<1){s.got=1;this.g.remove(s.m);fu.got=(fu.got||0)+1;sfx('coin');}}if(this.stars.filter(s=>!s.got).length<5)this.addStar();
        if(this.escape<=0){this.done=.01;sfx('fanfare');confetti(80);say(`にげきった！ ほしを ${fu.got||0}こ あつめたよ`);}}
      this.horns.position.set(o.x,2.3,o.z);for(const s of this.stars)if(!s.got)s.m.rotation.y+=dt*3;}
    if(this.done>0){this.done+=dt;fu.cheer=1;if(this.done>2.6&&this.done<9){this.done=9;this.round++;if(this.round>=2)this.fin=.01;else this.setRound();}}
    S.cam.position.set(fu.x*.35,21,fu.z*.35+17);S.cam.lookAt(fu.x*.5,0,fu.z*.5);lightAt(S,fu.x*.5,fu.z*.5);charUpd(fu,dt);for(const p of this.pals)charUpd(p,dt);if(this.oni)charUpd(this.oni,dt);
    if(this.fin>0){this.fin+=dt;if(this.fin>.6&&this.fin<9){this.fin=9;const g=this.fu.got||0;const st=this.hits===0&&g>=8?3:this.hits<=2?2:1;celebrate('onigokko',st===3,st);}}},
  draw(c){sky3(c,'#9ad8ff','#e8f8ff',true);render3(c,this.S);c.textAlign='center';c.textBaseline='middle';c.fillStyle='rgba(255,255,255,.93)';rr(c,W/2-160,112,320,56,28);c.fill();c.strokeStyle='#ffb03a';c.lineWidth=4;c.stroke();
    if(this.round===0){this.pals.forEach((p,i)=>{const x=W/2-90+i*60;if(p.got)drawAnimal(c,p.k,x,160,.28,{t:T,happy:1});else{c.fillStyle='#e0e0e8';circ(c,x,140,18);c.fillStyle='#9a9ab0';c.font=`800 20px ${FONT}`;c.fillText('?',x,141);}});}
    else{c.fillStyle='#c0306a';c.font=`800 22px ${FONT}`;c.fillText(`のこり ${Math.max(0,Math.ceil(this.escape))}びょう   ★${this.fu.got||0}`,W/2,140);}
    stepDots(c,2,this.round,190);if(this.oni){const p=toScr(this.S,new THREE.Vector3(this.oni.x,2.9,this.oni.z));c.fillStyle='#ff4d5a';c.font=`800 18px ${FONT}`;c.fillText('おに',p.x,p.y);}
    if(this.tgt){const p=toScr(this.S,new THREE.Vector3(this.tgt.x,0,this.tgt.z));c.strokeStyle='rgba(255,95,160,.7)';c.lineWidth=4;c.beginPath();c.arc(p.x,p.y,18+Math.sin(T*8)*3,0,TAU);c.stroke();}},
  down(x,y){const h=hitPlane(this.S,x,y,0);if(h)this.tgt={x:h.x,z:h.z};},
  move(x,y){const h=hitPlane(this.S,x,y,0);if(h)this.tgt={x:h.x,z:h.z};},
  up(){},
  hint(){if(this.done)return null;const fu=this.fu;if(this.round===0){const p=this.pals.find(p=>!p.got);if(!p)return null;const a=toScr(this.S,new THREE.Vector3(fu.x,1,fu.z)),b=toScr(this.S,new THREE.Vector3(p.x,1,p.z));return{x:a.x,y:a.y,x2:b.x,y2:b.y};}const o=this.oni;const a=toScr(this.S,new THREE.Vector3(fu.x,1,fu.z)),b=toScr(this.S,new THREE.Vector3(fu.x*2-o.x,1,fu.z*2-o.z));return{x:a.x,y:a.y,x2:b.x,y2:b.y};},
  hintText(){return this.round===0?'ゆびで さした ほうへ はしるよ。 おともだちを おいかけよう':'おにと はんたいの ほうへ にげよう';}});

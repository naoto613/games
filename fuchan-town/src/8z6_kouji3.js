// ================= 3D こうじげんば =================
reg3('kouji',{bg:'#fff0d0',song:'hero',
  build(){const S=this.S=stage3({sr:16,fov:50});const g=new THREE.Group();S.s.add(g);this.g=g;
    const gr=new THREE.Mesh(new THREE.PlaneGeometry(90,90),m3('#e8c890'));gr.rotation.x=-Math.PI/2;gr.receiveShadow=true;g.add(gr);for(let i=0;i<14;i++){const c=mesh3(g,geo3('cone',()=>new THREE.ConeGeometry(.45,1.1,16)),'#ff8a3a',-13+i*2,.55,7);C3(g,.36,.36,.14,'#ffffff',-13+i*2,.5,7,16);}
    for(let i=0;i<5;i++)B3(g,3.8,1.2,.2,i%2?'#ffd23a':'#3a3050',-10+i*5,0,-10,.05);tree3(g,-14,-6,1.4);tree3(g,14,-7,1.3);
    // excavator
    const ex=this.ex=new THREE.Group();ex.position.set(0,0,1);g.add(ex);for(const z of[-1.1,1.1]){B3(ex,3.6,.9,.8,'#3a3a4a',0,0,z,.35);}const top=this.exTop=new THREE.Group();top.position.y=.9;ex.add(top);B3(top,3,1.1,2.4,'#ffc21a',-.3,0,0,.25);B3(top,1.3,1.5,1.4,'#ffc21a',.6,1.1,-.4,.2);B3(top,1.1,.9,1.3,m3('#bfe8ff',{roughness:.2}),.75,1.4,-.4,.08);B3(top,.9,.8,2,'#3a3a4a',-1.7,.2,0,.2);
    const boom=this.boom=new THREE.Group();boom.position.set(0,1,.8);top.add(boom);B3(boom,.45,.45,3.6,'#ffc21a',0,-.22,1.8,.12);const arm=this.arm=new THREE.Group();arm.position.set(0,0,3.6);boom.add(arm);B3(arm,.35,2.6,.35,'#ffc21a',0,-2.6,0,.1);
    const bk=this.bucket=new THREE.Group();bk.position.set(0,-2.6,0);arm.add(bk);B3(bk,1.1,.7,.9,'#6a6a78',0,-.5,.2,.12);this.bdirt=S3(bk,.45,'#8a5a3a',0,0,.25,1.1,.5,.9);this.bdirt.visible=false;
    // mound + truck
    this.mound=S3(g,2.2,'#a8703a',-3.3,0,2.8,1,.7,1);this.mLeft=6;
    const tk=this.truck=new THREE.Group();tk.position.set(3.2,0,1.6);tk.rotation.y=-Math.PI/2;g.add(tk);B3(tk,2.2,1.5,1.8,'#ff6f6f',0,.6,2.2,.2);B3(tk,1.9,.8,.1,m3('#bfe8ff',{roughness:.2}),0,1.3,3.1,.03);B3(tk,2.4,.3,3.4,'#5a5a6a',0,.6,-.4,.05);
    this.bed=new THREE.Group();this.bed.position.set(0,.9,-.4);tk.add(this.bed);B3(this.bed,2.4,.15,3.2,'#ffc21a',0,0,0,.05);for(const s of[-1,1])B3(this.bed,.15,1.1,3.2,'#ffc21a',s*1.12,0,0,.04);B3(this.bed,2.4,1.1,.15,'#ffc21a',0,0,-1.55,.04);this.load=B3(this.bed,2.1,1,2.9,'#8a5a3a',0,.1,0,.3);this.load.scale.y=.01;
    for(const x of[-1.1,1.1])for(const z of[-1.2,1.9]){const w=C3(tk,.5,.5,.4,'#3a3050',x,0,z,16);w.rotation.z=Math.PI/2;w.position.y=.5;}
    this.fu=charAdd(S,charSpr('fu',2.4,{outfit:outfit({acc:'cap'})}));this.fu.x=-6;this.fu.z=6;this.rk=charAdd(S,charSpr('rk',1.7));this.rk.x=6.5;this.rk.z=6;
    this.nL=4+Math.floor(Math.random()*3);this.nF=5+Math.floor(Math.random()*3);this.pal=pick([['#ff8cc0','#7ad8ff','#ffd23a','#8ef0b0','#b8a0ff','#ffb07a'],['#f4f0e8','#d8e8f8','#f0e0d0','#e8f4e0','#f8e8f0','#e0e0f0'],['#ff6a6a','#ffb03a','#ffe03a','#6cd08a','#4a9aff','#a07aff']]);this.roof=pick(['star','heart','flag']);this.ph='dig';this.sw=.45;this.lift=.6;this.full=false;this.loads=0;this.dirt=[];this.fin=0;this.perfect=0;this.miss=0;
    this.floors=[];this.hook=null;this.stackTop=0;this.bx=0;
    S.cam.position.set(0,11,19.5);this.ct=new THREE.Vector3(0,1.4,1.6);setTimeout(()=>{if(scene===this)say('こうじげんば！ ゆびで ショベルカーを うごかそう。 したに ひっぱると ほって、 よこで ダンプに はこぶよ');},300);},
  bucketW(){const v=new THREE.Vector3();this.bucket.getWorldPosition(v);return v;},
  update(dt){const S=this.S;
    if(this.ph==='dig'||this.ph==='drive'){this.exTop.rotation.y+=(lerp(-1.07,1.41,this.sw)-this.exTop.rotation.y)*Math.min(1,dt*8);this.boom.rotation.x+=(lerp(-.3,-.95,this.lift)-this.boom.rotation.x)*Math.min(1,dt*8);this.arm.rotation.x=-this.boom.rotation.x;this.bucket.rotation.x=this.full?-.6:.3;
      const b=this.bucketW();if(this.ph==='dig'&&!this.full&&this.mLeft>0&&b.y<1.2&&Math.hypot(b.x+3.3,b.z-2.8)<2.4){this.full=true;this.bdirt.visible=true;this.mLeft--;this.mound.scale.set(.4+this.mLeft*.12,.2+this.mLeft*.1,.4+this.mLeft*.12);sfx('squish');hush();speak('ほった！');}
      const tb=new THREE.Vector3();this.bed.getWorldPosition(tb);if(this.ph==='dig'&&this.full&&Math.hypot(b.x-tb.x,b.z-tb.z)<2.4&&b.y>1.3&&this.release){this.full=false;this.bdirt.visible=false;this.release=false;this.loads++;for(let i=0;i<8;i++){const d=S3(this.g,.25,'#8a5a3a',b.x+rand(-.3,.3),b.y-.5,b.z+rand(-.3,.3));this.dirt.push({m:d,vy:0,ty:tb.y+.3+this.loads*.18});}this.load.scale.y=this.loads/this.nL;sfx('pour');hush();speak(NUMJ[this.loads]+'かい！');
        if(this.loads>=this.nL){this.ph='drive';this.pt=0;sfx('fanfare');say('いっぱいに なった！ ダンプカー しゅっぱつ！');}}this.release=false;}
    for(const d of this.dirt){d.vy-=dt*14;d.m.position.y+=d.vy*dt;if(d.m.position.y<d.ty){this.g.remove(d.m);d.dead=1;}}this.dirt=this.dirt.filter(d=>!d.dead);
    if(this.ph==='drive'){this.pt+=dt;if(this.pt>1)this.truck.position.x+=dt*(this.pt-1)*8;if(this.pt>3.2){this.startCrane();}}
    if(this.ph==='crane'){const hk=this.hook;if(hk&&!hk.drop){hk.t+=dt;hk.x=Math.sin(hk.t*(1.4+this.floors.length*.12))*2.5;hk.m.position.set(hk.x,this.hookY(),0);this.cable.position.x=hk.x;this.trolley.position.x=hk.x;}
      if(hk&&hk.drop){hk.vy-=dt*20;hk.m.position.y+=hk.vy*dt;const land=this.stackTop;if(hk.m.position.y<=land){const off=hk.x-this.bx;if(Math.abs(off)<2.3||!this.floors.length){hk.m.position.y=land;this.floors.push({m:hk.m,x:hk.x});if(this.floors.length>1)this.bx=this.bx*.5+hk.x*.5;else this.bx=hk.x;this.stackTop+=1.6;const perf=Math.abs(off)<.4||this.floors.length===1;if(perf){this.perfect++;sfx('ding');say(pick(['ぴったり！','パーフェクト！','じょうず！']));}else{sfx('tick');}const p=toScr(S,new THREE.Vector3(hk.x,land+.8,0));burst(p.x,p.y,perf?16:6,'star');this.hook=null;
            if(this.floors.length>=this.nF){this.ph='done';this.pt=0;sfx('fanfare');confetti(90);say('ビルが かんせい！ みんなが ひっこしてきたよ！');this.movein();}else setTimeout(()=>{if(scene===this&&this.ph==='crane')this.newHook();},500);}
          else{hk.fall=1;hk.vx=off>0?3:-3;hk.drop=false;this.miss++;sfx('boing');say('おっと！ おちちゃった。 もう いちど！');const m=hk.m;this.hook=null;this.fallers=(this.fallers||[]);this.fallers.push({m,vx:hk.vx,vy:0,t:0});setTimeout(()=>{if(scene===this&&this.ph==='crane')this.newHook();},900);}}}}
    if(this.fallers)for(const f of this.fallers){f.t+=dt;f.vy-=dt*20;f.m.position.x+=f.vx*dt;f.m.position.y=Math.max(0,f.m.position.y+f.vy*dt);f.m.rotation.z-=f.vx*dt*.4;}
    if(this.ph==='done'){this.pt+=dt;if(this.pt>3.6&&!this.fin)this.fin=.01;for(const a of this.tenants||[])a.cheer=1;}
    // camera
    let cp,ct;if(this.ph==='dig'||this.ph==='drive'){cp=new THREE.Vector3(0,11,19.5);ct=new THREE.Vector3(0,1.4,1.6);}else{const top=Math.max(4,this.stackTop+2);cp=new THREE.Vector3(0,top+4.5,23);ct=new THREE.Vector3(0,top-1.5,0);}
    S.cam.position.lerp(cp,Math.min(1,dt*3));this.ct=(this.ct||ct.clone()).lerp(ct,Math.min(1,dt*3));S.cam.lookAt(this.ct);lightAt(S,0,1,this.ph==='crane'?this.stackTop:0);charUpd(this.fu,dt);charUpd(this.rk,dt);for(const a of this.tenants||[])charUpd(a,dt);
    if(this.fin>0){this.fin+=dt;if(this.fin>.6&&this.fin<9){this.fin=9;const st=this.perfect>=4&&this.miss===0?3:this.miss<=2?2:1;celebrate('kouji',st===3,st);}}},
  movein(){this.tenants=[];shuffle(['bear','rabbit','cat','dog','panda','pig','chick','hippo']).slice(0,this.nF).forEach((k,i)=>{const f=this.floors[i];if(!f)return;const a=charAdd(this.S,charSpr(k,1.1,{k}));a.x=f.x+(i%2?1.2:-1.2);a.y=f.m.position.y+.3;a.z=1.9;a.seed=i;a.every=3;this.tenants.push(a);});},
  hookY(){return this.stackTop+4.2;},
  startCrane(){this.ph='crane';this.g.remove(this.ex);this.g.remove(this.truck);this.mound.visible=false;const g=this.g;
    const tw=this.tower=new THREE.Group();tw.position.set(-7,0,-1.5);g.add(tw);for(let i=0;i<16;i++){B3(tw,.18,1,.18,'#ffc21a',-.5,i,-.5,.02);B3(tw,.18,1,.18,'#ffc21a',.5,i,-.5,.02);B3(tw,.18,1,.18,'#ffc21a',-.5,i,.5,.02);B3(tw,.18,1,.18,'#ffc21a',.5,i,.5,.02);if(i%2)B3(tw,1.1,.12,.12,'#ffc21a',0,i,.5,.02);}
    const jib=this.jib=new THREE.Group();jib.position.set(-7,16,1.5);g.add(jib);B3(jib,16,.4,.4,'#ffc21a',5.5,0,0,.08);B3(jib,2,1,1.2,'#e8a000',-2,-.2,0,.15);B3(jib,1.3,1.1,1.3,m3('#bfe8ff',{roughness:.2}),.2,-1.1,0,.1);
    this.trolley=B3(g,.8,.4,.8,'#5a5a6a',0,15.6,1.5,.08);this.cable=C3(g,.03,.03,1,'#555',0,0,1.5,4);this.cable.visible=false;
    B3(g,5.4,.4,4,'#b8b0a8',0,0,0,.08);this.stackTop=.4;this.bx=0;this.newHook();say('クレーンで ビルを つもう！ ゆれている ブロックが まんなかに きたら タッチ！');},
  newHook(){const g=this.g,i=this.floors.length;const f=new THREE.Group();const col=this.pal[i%6];B3(f,4.4,1.6,3.4,col,0,0,0,.12);for(const x of[-1.3,0,1.3])B3(f,.8,.7,.1,m3('#fff6d0',{emissive:new THREE.Color('#fff0b0'),emissiveIntensity:.25}),x,.5,1.72,.04);if(i===this.nF-1){B3(f,4.6,.3,3.6,'#ff5f6f',0,1.6,0,.1);if(this.roof==='star')mesh3(f,starGeo(.5,.15),'#ffd23a',0,2.5,0);else if(this.roof==='heart'){heartMesh(f,.9,'#ff5f9f',0,2.5,0);}else{C3(f,.06,.06,2,'#888',0,1.75,0,6);B3(f,1,.6,.06,'#ff5f6f',.5,3.2,0,.02);}}
    f.position.set(0,this.hookY(),0);g.add(f);this.hook={m:f,t:rand(0,3),x:0,drop:false,vy:0};this.cable.visible=true;this.trolley.position.y=Math.max(15.6,this.hookY()+4);if(this.jib)this.jib.position.y=Math.max(16,this.hookY()+4.4);
    this.cable.scale.y=Math.max(.1,this.trolley.position.y-this.hookY()-1.6);this.cable.position.y=this.hookY()+1.6;this.cable.position.z=0;this.trolley.position.z=0;this.jib.position.z=0;},
  draw(c){sky3(c,'#9ad8ff','#fff4e0',true);render3(c,this.S);
    if(this.ph==='dig'){c.fillStyle='rgba(255,255,255,.92)';rr(c,W/2-150,112,300,50,25);c.fill();c.fillStyle='#8a5a3a';c.font=`800 22px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(`はこんだ ${this.loads} / ${this.nL}`,W/2,138);
      const b=this.bucketW(),p=toScr(this.S,b);c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=3;c.setLineDash([6,6]);c.beginPath();c.arc(p.x,p.y,30,0,TAU);c.stroke();c.setLineDash([]);
      c.fillStyle='rgba(255,255,255,.85)';rr(c,20,H-150,W-40,120,24);c.fill();c.fillStyle='#8a6a3a';c.font=`800 17px ${FONT}`;c.fillText('↓ したに ひっぱる: ほる',W/2,H-118);c.fillText('→ よこ: ダンプへ   ・   はなす: おろす',W/2,H-86);c.fillText(this.full?'ダンプの うえで ゆびを はなそう！':'つちの やまへ ショベルを おろそう',W/2,H-54);}
    if(this.ph==='crane'){c.fillStyle='rgba(255,255,255,.92)';rr(c,W/2-150,112,300,50,25);c.fill();c.fillStyle='#5a6a8a';c.font=`800 22px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(`${this.floors.length} / ${this.nF} かい  ・  ★${this.perfect}`,W/2,138);drawBtn(c,W/2,H-110,54,'#ffb03a','check',!!this.hook);c.fillStyle='#b06a10';c.font=`800 20px ${FONT}`;c.fillText('タッチで おとす',W/2,H-36);}},
  down(x,y){if(this.ph==='dig'){this.drag={sx:x,sy:y,sw0:this.sw,l0:this.lift};return;}if(this.ph==='crane'&&this.hook&&!this.hook.drop){this.hook.drop=true;this.hook.vy=0;this.cable.visible=false;sfx('whoosh');}},
  move(x,y){const d=this.drag;if(!d||this.ph!=='dig')return;this.sw=clamp(d.sw0+(x-d.sx)/260,0,1);this.lift=clamp(d.l0-(y-d.sy)/220,0,1);},
  up(){if(this.ph==='dig'&&this.drag){this.drag=null;this.release=true;}},
  hint(){if(this.ph==='dig'){const b=toScr(this.S,this.bucketW());if(!this.full)return{x:b.x,y:b.y,x2:b.x-40*this.sw*0,y2:b.y+180};return{x:b.x,y:b.y,x2:b.x+200,y2:b.y-100};}if(this.ph==='crane'&&this.hook&&Math.abs(this.hook.x-this.bx)<.6)return{x:W/2,y:H-110};return null;},
  hintText(){return this.ph==='dig'?'ゆびを したに ひっぱって ほろう':'ゆれている ブロックが まんなかに きたら タッチ';}});

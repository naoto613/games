// ================= 3D かくれんぼ =================
function bush3(g){for(let i=0;i<5;i++)S3(g,.9+Math.random()*.3,i%2?'#58c078':'#4cbe6a',(i-2)*.6,.7+(i%2)*.3,Math.sin(i)*.3);}
function box3(g,o){B3(g,1.8,1.4,1.6,'#d8a868',0,0,0,.06);const lid=new THREE.Group();lid.position.set(0,1.4,-.8);g.add(lid);B3(lid,1.9,.12,1.7,'#c89858',0,0,.85,.04);o.lid=lid;}
function slide3(g){for(const x of[-.7,.7]){C3(g,.07,.07,2.6,'#5aa8ff',x,0,-1.4,8);}B3(g,1.6,.14,.9,'#ffd23a',0,2.5,-1.2,.05);const s=B3(g,1.1,.1,3,'#ff6f8f',0,0,0,.05);s.position.set(0,1.3,.3);s.rotation.x=.75;}
function tunnel3(g){const t=mesh3(g,geo3('tun',()=>new THREE.CylinderGeometry(1.1,1.1,3.2,24,1,true,0,Math.PI)),m3('#ff9a4a',{side:THREE.DoubleSide}),0,0,0);t.rotation.z=Math.PI/2;t.rotation.y=Math.PI/2;t.position.y=0;}
function bench3(g){B3(g,2.6,.15,.8,'#c8864a',0,.7,0,.04);B3(g,2.6,.8,.12,'#c8864a',0,.8,-.4,.04);for(const x of[-1.1,1.1])B3(g,.12,.7,.7,'#6a6a78',x,0,0,.03);}
function flowerbed3(g){B3(g,2.4,.5,1.4,'#e8a070',0,0,0,.1);for(let i=0;i<10;i++)flower3(g,-1+(i%5)*.5,.45,i<5?-.3:.3,PAST[i%8],1.5);}
function playhouse3(g){B3(g,2.4,2,2.2,'#fff0f6',0,0,0,.12);prism3(g,2.8,1.3,2.6,'#ff8cc0',0,2,0);B3(g,.8,1.3,.1,'#c86a8a',0,0,1.12,.05);}
function barrel3(g){C3(g,.7,.75,1.4,'#8a5a3a',0,0,0,18);TR3(g,.72,.05,'#5a5a6a',0,.3,0).rotation.x=Math.PI/2;TR3(g,.72,.05,'#5a5a6a',0,1.1,0).rotation.x=Math.PI/2;}
const HIDEK=[['bush',bush3,'しげみ'],['box',box3,'はこ'],['slide',slide3,'すべりだい'],['tunnel',tunnel3,'トンネル'],['bench',bench3,'ベンチ'],['bed',flowerbed3,'はなだん'],['house',playhouse3,'おうち'],['barrel',barrel3,'たる'],['tree',(g)=>tree3(g,0,0,1.7),'き']];
reg3('hide',{bg:'#bfe9ff',song:'fuwa',
  build(){const S=this.S=stage3({sr:16,fov:50});const g=new THREE.Group();S.s.add(g);this.g=g;const gr=C3(g,17,17,.4,'#a8e488',0,-.4,0,48);gr.castShadow=false;const path=TR3(g,7,.9,'#f3e3c8',0,.02,0);path.rotation.x=Math.PI/2;path.scale.z=.05;
    SEEDR=Math.floor(Math.random()*1e6)+1;for(let i=0;i<26;i++){const a=i/26*TAU,r=15+srand()*2;tree3(g,Math.cos(a)*r,Math.sin(a)*r,1.4+srand()*.5,srand()<.3?'#8ad06a':null);}C3(g,1.4,1.6,.6,'#e8e8f4',0,0,0,24);C3(g,1.2,1.2,.62,m3('#8fd8ff',{roughness:.2}),0,.01,0,24);
    this.round=0;this.miss=0;this.found=0;this.az=0;this.dist=27;this.el=.72;this.fin=0;this.fu=charAdd(S,charSpr('fu',2.4));this.fu.x=0;this.fu.z=2.5;this.spots=[];this.friends=[];this.setRound();},
  setRound(){for(const s of this.spots)this.g.remove(s.g);for(const f of this.friends){this.S.s.remove(f.sp);this.S.s.remove(f.sh);}this.spots=[];this.friends=[];const n=this.round?12:8,nf=this.round?5:3;
    const kinds=shuffle(HIDEK.concat(HIDEK)).slice(0,n);kinds.forEach(([k,fn,ja],i)=>{const a=i/n*TAU+(this.round?.2:0),r=i%2?9.5:6.5;const sg=new THREE.Group();sg.position.set(Math.cos(a)*r,0,Math.sin(a)*r);sg.rotation.y=-a+Math.PI/2+rand(-.4,.4);this.g.add(sg);const o={k,ja,g:sg,a,r,friend:null,wig:0};fn(sg,o);tagPk(sg,o);this.spots.push(o);});
    const ks=shuffle(['bear','rabbit','cat','dog','panda','pig','chick','hippo']);shuffle(this.spots.slice()).slice(0,nf).forEach((sp,i)=>{const f=charAdd(this.S,charSpr(ks[i],1.8,{k:ks[i]}));f.every=4;f.seed=i;const out=sp.k==='tree'?new THREE.Vector3(-Math.sin(sp.a),0,Math.cos(sp.a)).multiplyScalar(.75):new THREE.Vector3(Math.cos(sp.a),0,Math.sin(sp.a)).multiplyScalar(-1.25);f.x=sp.g.position.x+out.x;f.z=sp.g.position.z+out.z;f.y=sp.k==='box'||sp.k==='barrel'?-.6:0;f.hy=f.y;f.sp.visible=sp.k!=='box'&&sp.k!=='barrel';sp.friend=f;f.spot=sp;this.friends.push(f);});
    this.found=0;this.t=0;setTimeout(()=>{if(scene===this)say(this.round?'こんどは 5ひき かくれているよ！ ぐるっと まわして さがしてね':'もういいかい？ もういいよ！ ゆびで こうえんを まわして、 かくれている おともだちを さがそう');},400);},
  update(dt){const S=this.S;this.t+=dt;for(const s of this.spots){if(s.wig>0){s.wig-=dt;s.g.rotation.z=Math.sin(s.wig*30)*.06;}else s.g.rotation.z=0;if(s.lid)s.lid.rotation.x=s.open?-1.6:0;}
    for(const f of this.friends){if(f.found){f.y+=(f.hy+(f.jump>0?0:0)-f.y)*dt*4;}else if(this.t>12&&Math.random()<dt*.15){f.spot.wig=.6;sfx('giggle');}}
    if(this.done>0){this.done+=dt;if(this.done>2.6){this.done=0;this.round++;if(this.round>=2){this.fin=.01;}else this.setRound();}}
    const el=this.el,d=this.dist;S.cam.position.set(Math.sin(this.az)*Math.cos(el)*d,Math.sin(el)*d,Math.cos(this.az)*Math.cos(el)*d);S.cam.lookAt(0,.5,0);lightAt(S,0,0);this.fu.x=Math.sin(this.az)*3;this.fu.z=Math.cos(this.az)*3;
    charUpd(this.fu,dt);for(const f of this.friends)charUpd(f,dt);
    if(this.fin>0){this.fin+=dt;if(this.fin>.8&&this.fin<9){this.fin=9;celebrate('hide',this.miss<=2,this.miss<=2?3:this.miss<=6?2:1);}}},
  draw(c){sky3(c,'#9ad8ff','#e8f8ff',true);render3(c,this.S);const nf=this.friends.length;c.fillStyle='rgba(255,255,255,.93)';rr(c,W/2-(nf*56+40)/2,112,nf*56+40,64,30);c.fill();c.strokeStyle='#8ad08a';c.lineWidth=4;c.stroke();
    this.friends.forEach((f,i)=>{const x=W/2-(nf-1)*28+i*56;if(f.found)drawAnimal(c,f.k,x,160,.3,{t:T,happy:1});else{c.fillStyle='#e0e8e0';circ(c,x,144,20);c.fillStyle='#9ab09a';c.font=`800 22px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('?',x,145);}});
    stepDots(c,2,this.round,196);hud3Btn(c,60,H-90,36,'#7ab8ff','prev','まわす');hud3Btn(c,W-60,H-90,36,'#7ab8ff','next','まわす');},
  down(x,y){this.pan={sx:x,sy:y,az0:this.az,d0:this.dist,moved:false};},
  move(x,y){const p=this.pan;if(!p)return;if(Math.hypot(x-p.sx,y-p.sy)>14)p.moved=true;if(p.moved){this.az=p.az0-(x-p.sx)*.008;this.dist=clamp(p.d0+(y-p.sy)*.03,14,30);}},
  up(x,y){const p=this.pan;this.pan=null;if(!p||p.moved)return;if(hitC(x,y,60,H-90,44)){this.az-=.8;sfx('whoosh');return;}if(hitC(x,y,W-60,H-90,44)){this.az+=.8;sfx('whoosh');return;}if(this.done)return;
    for(const f of this.friends){if(f.found||!f.sp.visible)continue;const q=toScr(this.S,new THREE.Vector3(f.x,f.y+1,f.z));if(Math.hypot(q.x-x,q.y-y)<45){this.find(f);return;}}
    const h=pick3(this.S,x,y,this.spots.map(s=>s.g));if(!h)return;const sp=h.o.userData.pk;sp.wig=.5;if(sp.lid)sp.open=true;
    if(sp.friend&&!sp.friend.found)this.find(sp.friend);else{this.miss++;sfx('boing');hush();speak(pick([`${sp.ja}には いないみたい`,'ここじゃ ないね','ちがったかな？']));if(sp.lid)setTimeout(()=>{sp.open=false;},900);}},
  find(f){f.found=true;f.sp.visible=true;f.hy=0;f.y=Math.max(f.y,0);f.jump=1;f.cheer=3;const out=new THREE.Vector3(Math.cos(f.spot.a),0,Math.sin(f.spot.a)).multiplyScalar(2.4);f.x=f.spot.g.position.x+out.x;f.z=f.spot.g.position.z+out.z;this.found++;sfx('fanfare');const q=toScr(this.S,new THREE.Vector3(f.x,1.2,f.z));burst(q.x,q.y,14,'heart');
    hush();speak(`${WORDS[f.k]?WORDS[f.k][0]:''}ちゃん みーつけた！`);if(WORDS[f.k])speak(WORDS[f.k][1],'en');if(this.friends.every(q=>q.found)){this.done=.01;confetti(70);setTimeout(()=>{if(scene===this)say('ぜんいん みつけた！ すごい！');},1500);}},
  hint(){if(this.done||idle<14)return null;const f=this.friends.find(f=>!f.found);if(!f)return null;f.spot.wig=.6;const q=toScr(this.S,f.spot.g.position.clone().add(new THREE.Vector3(0,1,0)));return q.vis?{x:q.x,y:q.y}:{x:W-60,y:H-90};},
  hintText(){return 'ゆれている ところが あやしいよ！ タッチしてみよう';}});

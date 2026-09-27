// ================= 3D かけっこ / しょうがいぶつ (runner) =================
const LANES=[-2.2,0,2.2];
function trackTex(n){return ctex('track'+n,256,512,(c,w,h)=>{c.fillStyle='#e8705a';c.fillRect(0,0,w,h);c.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<600;i++)c.fillRect((i*37)%w,(i*91)%h,2,2);c.fillStyle='#fff';for(let i=0;i<=n;i++)c.fillRect(Math.min(w-6,Math.max(2,i*w/n-2)),0,4,h);});}
function arrowTex(){return ctex('arrow',128,128,(c)=>{c.fillStyle='#ffd23a';c.fillRect(0,0,128,128);c.fillStyle='#ff8a00';for(const y of[20,70]){c.beginPath();c.moveTo(20,y+40);c.lineTo(64,y);c.lineTo(108,y+40);c.lineTo(88,y+40);c.lineTo(64,y+18);c.lineTo(40,y+40);c.fill();}});}
function runnerDef(mode){return{bg:'#bfe8ff',song:mode==='race'?'hero':'play',
  build(){const S=this.S=stage3({sr:14,fov:55,fog:'#dff4ff',fn:40,ff:110});const g=new THREE.Group();S.s.add(g);this.g=g;const L=this.L=mode==='race'?170:230;this.th=pick([{gr:'#9ee07a',sk:['#8fd8ff','#e6f8ff']},{gr:'#f0dca8',sk:['#5ec0ee','#e0f8ff']},{gr:'#e8f2ff',sk:['#a8c8f0','#f4f8ff']},{gr:'#ffc8a0',sk:['#ff9a8a','#ffe6c8']}]);
    this.LN=mode==='race'?[-2.6,-.87,.87,2.6]:LANES;const tt=trackTex(this.LN.length).clone();tt.needsUpdate=true;tt.wrapS=tt.wrapT=THREE.RepeatWrapping;tt.repeat.set(1,(L+80)/8);const tr=new THREE.Mesh(new THREE.PlaneGeometry(7,L+80),new THREE.MeshStandardMaterial({map:tt,roughness:.9}));tr.rotation.x=-Math.PI/2;tr.position.set(0,.01,-L/2+20);tr.receiveShadow=true;g.add(tr);
    for(const s of[-1,1]){const gr=new THREE.Mesh(new THREE.PlaneGeometry(60,L+120),m3(this.th.gr));gr.rotation.x=-Math.PI/2;gr.position.set(s*33.5,0,-L/2+20);gr.receiveShadow=true;g.add(gr);B3(g,.3,.25,L+80,'#ffffff',s*3.6,0,-L/2+20,.05);}
    SEEDR=mode==='race'?9:19;for(let z=10;z>-L-40;z-=7){for(const s of[-1,1]){if(srand()<.55)tree3(g,s*(7+srand()*8),z+srand()*4,.9+srand()*.6,srand()<.3?'#8ad06a':null);else if(srand()<.4)flower3(g,s*(4.5+srand()*2),0,z,PAST[Math.floor(srand()*8)],1.6);}}
    for(let z=-20;z>-L;z-=36){for(const s of[-1,1]){const st=new THREE.Group();st.position.set(s*9,0,z);g.add(st);for(let k=0;k<3;k++)B3(st,1.4,.6+k*.6,12,'#dfe6f0',s*k*1.2,0,0,.05);for(let k=0;k<14;k++)S3(st,.28,PAST[k%8],s*(Math.floor(k/5)*1.2),1+Math.floor(k/5)*.6,-5.5+(k%5)*2.6+(k%2)*.4);}}
    const arch=(z,txt,col)=>{for(const s of[-1,1])B3(g,.4,4.6,.4,col,s*3.9,0,z,.1);const b=B3(g,8.2,1.1,.3,col,0,4.2,z,.15);const lb=mesh3(g,geo3('archl',()=>new THREE.PlaneGeometry(6,.9)),new THREE.MeshStandardMaterial({map:labelTex(txt,col,'#ffffff'),roughness:.8}),0,4.75,z+.17);lb.castShadow=false;};B3(g,7,.02,.3,'#ffffff',0,0,.6,0);arch(-L,'ゴール','#ff5f9a');
    for(let i=0;i<14;i++){const f=B3(g,.5,.5,.1,i%2?'#fff':'#3a3050',-3.25+i*.5,.02,-L,.0);f.rotation.x=-Math.PI/2;f.scale.set(1,1,1);}
    this.objs=[];this.spawn();
    const fu=this.fu=charAdd(S,charSpr('fu',2.4));fu.lane=1;fu.x=this.LN[1];fu.z=2;fu.face=3;fu.every=2;this.rk=null;
    this.ops=[];if(mode==='race'){((a)=>[[a[0],0,7.2],[a[1],2,6.7],[a[2],3,6.3]])(shuffle(['rabbit','bear','pig','cat','dog','panda','hippo','chick'])).forEach(([k,ln,sp],i)=>{const o=charAdd(S,charSpr(k,2));o.x=this.LN[ln];o.z=2;o.lane=ln;o.base=sp+lvOf('race')*.08;o.vel=0;o.seed=i;o.every=3;o.fin=0;this.ops.push(o);});}
    this.sp=0;this.boost=0;this.slow=0;this.jy=0;this.jv=0;this.slide=0;this.hits=0;this.got=0;this.cd=3.2;this.run=false;this.fin=0;this.done=0;this.rank=0;this.fins=[];this.dash=0;this.stumble=0;
    setTimeout(()=>{if(scene===this)say(mode==='race'?'かけっこ！ タッチ タッチで はやく はしれるよ。 よこに スワイプで コースを かえよう':'しょうがいぶつ きょうそう！ うえに スワイプで ジャンプ、 したで しゃがむ、 よこで よけるよ');},300);},
  spawn(){const g=this.g,L=this.L,O=this.objs;SEEDR=Math.floor(Math.random()*1e6)+1;const NL=this.LN.length;const add=(k,ln,z)=>{const o={k,ln,z,x:this.LN[ln],hit:false,g:new THREE.Group()};o.g.position.set(o.x,0,z);g.add(o.g);this.mk(o);O.push(o);return o;};
    if(mode==='race'){for(let z=-14;z>-L+8;z-=9){const r=srand();const ln=Math.floor(srand()*NL);if(r<.3)add('pad',ln,z);else if(r<.5)add('mud',ln,z);else{for(let k=0;k<3;k++)add('star',ln,z-k*1.6);}}}
    else{const lvK=Math.min(3,lvOf('obst'));let z=-14,i=0;const kinds=['hurdle','bar','cone','mud','tire'];while(z>-L+10){const k=i<3?kinds[i]:kinds[Math.floor(srand()*kinds.length)];if(k==='cone'){const free=Math.floor(srand()*3);for(let l=0;l<3;l++)if(l!==free)add('cone',l,z);add('star',free,z);}
      else if(k==='hurdle'||k==='bar'||k==='tire'||k==='mud'){for(let l=0;l<3;l++)add(k,l,z);add('star',Math.floor(srand()*3),z-(k==='bar'?0:0)).y=k==='bar'?.4:1.9;}
      if(srand()<.6)for(let q=0;q<3;q++)add('star',Math.floor(srand()*3),z-5-q*1.4);z-=Math.max(9,15-lvK-i*.25);i++;}}},
  mk(o){const g=o.g;if(o.k==='star'){const m=mesh3(g,starGeo(.35,.12),m3('#ffd23a',{emissive:new THREE.Color('#ffb000'),emissiveIntensity:.35}),0,1,0);o.m=m;}
    else if(o.k==='pad'){const m=new THREE.Mesh(geo3('padg',()=>new THREE.PlaneGeometry(1.8,2.4)),new THREE.MeshStandardMaterial({map:arrowTex(),emissive:new THREE.Color('#ffb000'),emissiveIntensity:.25}));m.rotation.x=-Math.PI/2;m.position.y=.03;g.add(m);}
    else if(o.k==='mud'){const m=C3(g,.95,.95,.04,m3('#8a5a3a',{roughness:.3}),0,0,0,24);m.scale.z=1.2;m.castShadow=false;}
    else if(o.k==='hurdle'){for(const s of[-1,1])B3(g,.12,.9,.12,'#ffffff',s*.8,0,0,.03);const b=B3(g,1.8,.22,.12,'#ff5f6f',0,.72,0,.05);o.m=b;}
    else if(o.k==='bar'){for(const s of[-1,1])B3(g,.14,2,.14,'#5aa8ff',s*.9,0,0,.03);const b=B3(g,1.9,.3,.14,'#ffd23a',0,1.55,0,.06);for(let i=0;i<5;i++)C3(g,.02,.02,.5,'#ffffff',-.8+i*.4,1.05,0,4);o.m=b;}
    else if(o.k==='cone'){mesh3(g,geo3('cone',()=>new THREE.ConeGeometry(.45,1.1,16)),'#ff8a3a',0,.55,0);C3(g,.36,.36,.14,'#ffffff',0,.5,0,16);o.m=g.children[0];}
    else if(o.k==='tire'){const t=TR3(g,.42,.18,'#3a3a4a',0,.45,0);t.rotation.y=Math.PI/2;o.m=t;}},
  lane(d){const fu=this.fu;const n=clamp(fu.lane+d,0,this.LN.length-1);if(n!==fu.lane){fu.lane=n;sfx('whoosh');}},
  jump(){if(this.jy<=0.01&&!this.slide&&this.run){this.jv=7.2;sfx('boing');}},
  duck(){if(this.jy<=0.01&&this.run){this.slide=.8;sfx('whoosh');}},
  update(dt){const S=this.S,fu=this.fu,L=this.L;
    if(this.cd>0){const pc=Math.ceil(this.cd);this.cd-=dt;const nc=Math.ceil(this.cd);if(nc!==pc&&nc>0&&nc<=3){sfx('beep');hush();speak(['','いち','に','さん'][nc]);}if(this.cd<=0){this.run=true;sfx('launch');say('よーい、 どん！');}}
    if(this.run&&!this.done){let base=mode==='race'?5.6:6.8+Math.min(2,lvOf('obst')*.3);this.dash=Math.max(0,this.dash-dt*1.6);if(this.boost>0)this.boost-=dt;if(this.slow>0)this.slow-=dt;if(this.stumble>0)this.stumble-=dt;
      const tgt=this.stumble>0?1:base+this.dash*1.6+(this.boost>0?4:0)-(this.slow>0?2.8:0);this.sp+=(tgt-this.sp)*Math.min(1,dt*3);fu.z-=this.sp*dt;
      this.jv-=dt*18;this.jy=Math.max(0,this.jy+this.jv*dt);if(this.jy<=0)this.jv=0;if(this.slide>0)this.slide-=dt;
      for(const o of this.ops){if(o.fin)continue;o.vel+=((o.base+Math.sin(T*1.3+o.seed*2)*.6)-o.vel)*Math.min(1,dt*2);o.z-=o.vel*dt;o.mv=true;if(o.z<=-L){o.fin=1;this.fins.push(o.k);}}
      for(const o of this.objs){if(o.hit||Math.abs(o.z-fu.z)>.6||o.ln!==fu.lane)continue;this.touch(o);}
      if(fu.z<=-L){this.done=.01;this.fins.push('fu');this.rank=mode==='race'?this.fins.indexOf('fu')+1:0;sfx('fanfare');confetti(90);fu.cheer=4;setTimeout(()=>{if(scene!==this)return;if(mode==='race')say(this.rank===1?'1ばん！ やったー！':`${this.rank}ばん！ よく がんばったね！`);else say(this.hits===0?'ノーミス ゴール！ すごい！':'ゴール！ よく がんばったね');},300);}}
    if(this.done>0){this.done+=dt;for(const o of this.ops){if(!o.fin){o.z-=o.base*dt;if(o.z<=-L){o.fin=1;this.fins.push(o.k);}}}if(this.done>2.8&&!this.fin)this.fin=.01;}
    fu.x+=(this.LN[fu.lane]-fu.x)*Math.min(1,dt*10);fu.y=this.jy;fu.gy=0;fu.mv=this.run&&!this.done&&this.stumble<=0;fu.dir=3;fu.sp.scale.set(1.6,this.slide>0?1.35:2.4,1);
    for(const o of this.objs){if(o.k==='star'&&!o.hit&&o.m){o.m.rotation.y+=dt*3;if(o.y!=null)o.m.position.y=o.y;}if(o.fall){o.fall+=dt;if(o.m)o.m.rotation.x=-Math.min(1.4,o.fall*6);}}
    const cz=fu.z+7.2;S.cam.position.set(fu.x*.5,4.3,cz);S.cam.lookAt(fu.x*.3,1.2,fu.z-7);lightAt(S,0,fu.z-4);charUpd(fu,dt);for(const o of this.ops)charUpd(o,dt);
    if(this.fin>0){this.fin+=dt;if(this.fin>.6&&this.fin<9){this.fin=9;let st;if(mode==='race')st=this.rank===1?3:this.rank===2?2:1;else st=this.hits<=1?3:this.hits<=3?2:1;if(this.got>=10&&st<3&&mode==='race')st++;celebrate(mode,st===3,st);}}},
  touch(o){const fu=this.fu;if(o.k==='star'){const need=o.y||1;if(Math.abs(this.jy+1-need)<1.2||(need<.6&&this.slide>0)||need===1){o.hit=true;o.g.visible=false;this.got++;sfx('coin');const p=toScr(this.S,new THREE.Vector3(fu.x,1.5,fu.z));burst(p.x,p.y,6,'star');}return;}
    if(o.k==='pad'){o.hit=true;this.boost=1.6;sfx('launch');say('ダッシュ！');return;}if(o.k==='mud'){if(this.jy>.5)return;o.hit=true;this.slow=1.2;sfx('squish');return;}
    let ok=false;if(o.k==='hurdle'||o.k==='tire')ok=this.jy>.55;else if(o.k==='bar')ok=this.slide>0;else if(o.k==='cone')ok=false;
    o.hit=true;if(ok){sfx('ding');const p=toScr(this.S,new THREE.Vector3(fu.x,2.5,fu.z));burst(p.x,p.y,6,'heart');return;}
    this.hits++;this.stumble=.7;this.sp=1;o.fall=.01;sfx('boing');hush();speak(pick(['おっとっと！','あいたた','だいじょうぶ！']));for(const q of this.objs)if(q!==o&&Math.abs(q.z-o.z)<.2&&q.k===o.k)q.hit=true;},
  draw(c){const sv=this.th?this.th.sk:['#8fd8ff','#e6f8ff'];sky3(c,sv[0],sv[1],true);render3(c,this.S);const L=this.L,fu=this.fu;
    const bx=40,bw=W-80,by=150;c.fillStyle='rgba(255,255,255,.92)';rr(c,bx-16,by-24,bw+32,48,24);c.fill();c.fillStyle='#e0e8f0';rr(c,bx,by-6,bw,12,6);c.fill();c.fillStyle='#ff8cc0';rr(c,bx,by-6,bw*clamp(-fu.z/L,0,1),12,6);c.fill();
    for(const o of this.ops){const k=clamp(-o.z/L,0,1);c.fillStyle='#fff';circ(c,bx+bw*k,by,13);drawAnimal(c,o.k,bx+bw*k,by+10,.2,{t:T});}c.fillStyle='#ff5f9a';circ(c,bx+bw*clamp(-fu.z/L,0,1),by,15);c.fillStyle='#fff';heartP(c,bx+bw*clamp(-fu.z/L,0,1),by,7);c.fill();
    c.fillStyle='rgba(255,255,255,.92)';rr(c,20,184,150,44,22);c.fill();c.fillStyle='#ffc21a';star(c,48,206,14,6);c.fill();c.fillStyle='#8a6a1a';c.font=`800 22px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('× '+this.got,100,207);
    if(mode==='race'&&this.run){const ahead=this.ops.filter(o=>o.z<fu.z).length+1;c.fillStyle='rgba(255,255,255,.92)';rr(c,W-170,184,150,44,22);c.fill();c.fillStyle=ahead===1?'#ff5f6f':'#5a6a8a';c.font=`30px ${POP}`;c.fillText(`${this.done?this.rank:ahead}い`,W-95,207);}
    if(mode==='obst'){c.fillStyle='rgba(255,255,255,.92)';rr(c,W-170,184,150,44,22);c.fill();c.fillStyle='#5a6a8a';c.font=`800 20px ${FONT}`;c.fillText(`ぶつかった ${this.hits}`,W-95,207);}
    if(this.cd>0){const n=Math.ceil(this.cd);c.font=`120px ${POP}`;c.lineWidth=12;c.strokeStyle='#fff';c.fillStyle='#ff5f9a';const t=n<=3?String(n):'';c.strokeText(t,W/2,H*.4);c.fillText(t,W/2,H*.4);}
    if(this.run&&!this.done){const y=H-100;hud3Btn(c,70,y,42,'#7ab8ff','prev','ひだり');hud3Btn(c,W-70,y,42,'#7ab8ff','next','みぎ');
      if(mode==='race'){hud3Btn(c,W/2,y,54,'#ff6fa8','play','タッチで ダッシュ');}else{hud3Btn(c,W/2-78,y,44,'#ffb03a','plus','ジャンプ');hud3Btn(c,W/2+78,y,44,'#6cd08a','minus','しゃがむ');}}},
  down(x,y){this.sw={x,y,t:performance.now()};},
  up(x,y){const s=this.sw;this.sw=null;if(!s||!this.run||this.done)return;const dx=x-s.x,dy=y-s.y;
    if(Math.hypot(dx,dy)>40){if(Math.abs(dx)>Math.abs(dy))this.lane(dx>0?1:-1);else if(dy<0)this.jump();else this.duck();return;}
    const by=H-100;if(hitC(x,y,70,by,52)){this.lane(-1);return;}if(hitC(x,y,W-70,by,52)){this.lane(1);return;}
    if(mode==='obst'){if(hitC(x,y,W/2-78,by,52)){this.jump();return;}if(hitC(x,y,W/2+78,by,52)){this.duck();return;}this.jump();return;}
    this.dash=Math.min(3,this.dash+.55);sfx('tick');const p=toScr(this.S,new THREE.Vector3(this.fu.x,.5,this.fu.z));parts.push({x:p.x+rand(-20,20),y:p.y,vx:rand(-40,40),vy:-60,life:.5,t:0,kind:'dot',col:'#fff'});},
  hint(){if(!this.run||this.done)return null;if(mode==='race')return{x:W/2,y:H-100};const fu=this.fu;const o=this.objs.find(o=>!o.hit&&o.ln===fu.lane&&o.z<fu.z&&o.z>fu.z-9&&o.k!=='star'&&o.k!=='pad');if(!o)return null;return o.k==='bar'?{x:W/2+78,y:H-100}:o.k==='cone'?{x:W-70,y:H-100}:{x:W/2-78,y:H-100};},
  hintText(){return mode==='race'?'がめんを どんどん タッチすると はやく はしれるよ':'ハードルは ジャンプ、 バーは しゃがむ、 コーンは よけよう';}};}
reg3('race',runnerDef('race'));reg3('obst',runnerDef('obst'));

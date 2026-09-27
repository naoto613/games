// ================= 3D town map: island overview (大分類) + area plaza (小分類) =================
const HOMEL=[{id:'myhouse',name:'わたしの おうち',ja:'ふーちゃんの おうち',lm:'myhouse',pos:[-7,5],roof:'#ff5f9a',home:1},{id:'kagu',name:'かぐやさん',ja:'かぐやさん',lm:'kagu',pos:[7,5],roof:'#ffa030',home:1}];
function distStars(C){return C.places.reduce((a,id)=>a+bestOf(id),0);}
function txtTex(k,txt,bg,fg,font){return ctex('tt'+k,128,128,c=>{c.fillStyle=bg;c.fillRect(0,0,128,128);c.fillStyle=fg||'#fff';c.font=font||`90px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.fillText(txt,64,70);});}
function stripeTex(a,b,n){return ctex('st'+a+b+n,256,32,c=>{for(let i=0;i<n;i++){c.fillStyle=i%2?b:a;c.fillRect(i*256/n,0,256/n+1,32);}});}
function prism3(g,w,h,d,col,x,y,z){const m=mesh3(g,geo3('prism2',()=>{const q=new THREE.CylinderGeometry(1,1,1,3);q.rotateZ(Math.PI/2);q.rotateX(-Math.PI/2);return q;}),m3(col,{flatShading:true}),x,y+h/3,z);m.scale.set(w,h/1.5,d/1.732);return m;}
function awning3(g,w,x,y,z,col){const n=7;for(let i=0;i<n;i++){const b=B3(g,w/n,.1,1.1,i%2?'#ffffff':col,x-w/2+(i+.5)*w/n,y,z,.02);b.rotation.x=.35;}}
function win3(g,x,y,z,w,h){B3(g,w+.2,h+.2,.12,'#ffffff',x,y-.1,z,.04);B3(g,w,h,.14,m3('#bfe8ff',{emissive:new THREE.Color('#9ad8ff'),emissiveIntensity:.25}),x,y,z+.02,.02);}
const LM3={
  myhouse(g){B3(g,5.5,3.6,4.5,'#fff0f6',0,0,0,.3);prism3(g,6.4,2.4,5.2,'#ff5f9a',0,3.6,0);B3(g,.9,1.6,.9,'#ff8cc0',1.6,4.2,-.8,.1);B3(g,1.2,2,.2,'#ff9ec8',0,0,2.26,.1);win3(g,-1.7,1.6,2.25,1,.9);win3(g,1.7,1.6,2.25,1,.9);heartMesh(g,.55,'#ff5f9a',0,3.2,2.3,.15);for(let i=0;i<7;i++)B3(g,.3,.9,.15,'#fff',-3+i,0,3.3,.08);flower3(g,-2.4,0,2.9,'#ff8cc0',1.4);flower3(g,2.4,0,2.9,'#ffd23a',1.4);},
  kagu(g){B3(g,6,3.4,4.4,'#fff8e8',0,0,0,.3);B3(g,6.3,.4,4.7,'#ffa030',0,3.4,0,.12);awning3(g,5.6,0,2.6,2.6,'#ffa030');B3(g,1.4,2,.2,'#c07a3a',0,0,2.22,.08);win3(g,-1.9,1.3,2.22,1.4,1.1);win3(g,1.9,1.3,2.22,1.4,1.1);
    B3(g,3.4,.9,1.4,'#8fd3ff',0,3.8,0,.3);B3(g,3.4,1.2,.5,'#7ac4f5',0,4.2,-.5,.2);for(const s of[-1,1])B3(g,.5,1.1,1.4,'#7ac4f5',s*1.5,3.8,0,.2);B3(g,.8,.7,.3,'#ffd23a',-.8,4.7,-.2,.12);},
  shop(g){const cols=['#ffd6e8','#fff3c0','#d6f0ff'],rf=['#ff6fa8','#ffb03a','#5aa8ff'];for(let i=-1;i<=1;i++){const x=i*2.7;B3(g,2.5,3,3.6,cols[i+1],x,0,0,.2);prism3(g,2.9,1.6,4,rf[i+1],x,3,0);awning3(g,2.4,x,2.3,2.2,rf[i+1]);B3(g,.9,1.6,.15,shade(rf[i+1],-.2),x,0,1.82,.06);}
    C3(g,1.1,1.2,.8,'#fff6fa',0,4.4,0);C3(g,.8,.9,.7,'#ffb3d0',0,5.2,0);C3(g,.55,.6,.6,'#fff6fa',0,5.9,0);S3(g,.28,'#ff3d5a',0,6.7,0);for(let i=0;i<8;i++){const a=i/8*TAU;S3(g,.16,'#ff6fa8',Math.cos(a)*1.05,5.2,Math.sin(a)*1.05);}},
  care(g){B3(g,6.4,3.6,4.4,'#fff6ee',0,0,0,.3);prism3(g,7.2,2.2,5,'#ff9a5a',0,3.6,0);B3(g,1.4,2.2,.2,'#ffb07a',0,0,2.22,.1);win3(g,-2,1.8,2.22,1.2,1);win3(g,2,1.8,2.22,1.2,1);const hc=heartMesh(g,.8,'#ff5f6f',0,4.6,1.2,.25);hc.userData.spin=1;
    C3(g,.9,.8,.7,'#ffffff',-3.8,0,1.8);for(let i=0;i<6;i++)S3(g,.28,'#e6f6ff',-3.8+Math.cos(i)*.5,.9+(i%2)*.2,1.8+Math.sin(i)*.5);dog3(g,3.9,0,2,.9);},
  moji(g){B3(g,7.4,3.4,4,'#ffffff',0,0,0,.25);B3(g,7.6,.35,4.2,'#3a9ad8',0,3.4,0,.1);for(let i=0;i<4;i++)win3(g,-2.8+i*1.9-(i>1?-.0:0),1.9,2.02,1,1);B3(g,2,6,2,'#fff6e0',0,0,-.4,.2);mesh3(g,geo3('pyr4',()=>new THREE.ConeGeometry(1.6,1.8,4)),'#3a9ad8',0,6.9,-.4).rotation.y=Math.PI/4;
    const cf=mesh3(g,geo3('clockc2',()=>new THREE.CircleGeometry(.75,32)),new THREE.MeshStandardMaterial({map:texClock(),roughness:.8}),0,4.9,.62);cf.castShadow=false;
    const lb=B3(g,1.6,1.6,1.6,[m3('#ff6fa8'),m3('#ff6fa8'),m3('#ff6fa8'),m3('#ff6fa8'),new THREE.MeshStandardMaterial({map:txtTex('a','あ','#ff6fa8')}),m3('#ff6fa8')],-4.4,0,1.6,.1);lb.rotation.y=.3;
    const lb2=B3(g,1.2,1.2,1.2,[m3('#6cc0ff'),m3('#6cc0ff'),m3('#6cc0ff'),m3('#6cc0ff'),new THREE.MeshStandardMaterial({map:txtTex('A','A','#6cc0ff')}),m3('#6cc0ff')],4.3,0,1.8,.1);lb2.rotation.y=-.3;},
  kazu(g){const cs=['#ff6f8f','#ffd23a','#5aa8ff','#6cd08a','#b48cff'];for(let i=0;i<5;i++){const c=cs[i],n=String(i+1);const mats=[m3(c),m3(c),m3(c),m3(c),new THREE.MeshStandardMaterial({map:txtTex('n'+n,n,c)}),m3(c)];const b=B3(g,1.8,1.8,1.8,mats,[-2.8,-.9,1,2.9,0][i]+0,[0,0,0,0,1.8][i],[.6,0,.5,0,.2][i],.12);b.rotation.y=[.2,-.1,.15,-.2,0][i];}
    for(let r=0;r<3;r++){C3(g,.04,.04,3.6,'#b07a4a',0,4+r*.7,-1,6).rotation.z=Math.PI/2;for(let k=0;k<4;k++)S3(g,.22,cs[(r+k)%5],-1+k*.5+r*.2,4+r*.7,-1,1,.8,1);}B3(g,.15,2.6,.15,'#b07a4a',-1.9,3.6,-1,.03);B3(g,.15,2.6,.15,'#b07a4a',1.9,3.6,-1,.03);},
  art(g){B3(g,6,3.4,4.4,'#f0fff0',0,0,0,.3);const pal=C3(g,3.6,3.6,.4,'#ffe6b0',0,3.4,0,32);pal.scale.z=.8;const pc=['#ff5f6f','#ffd23a','#5aa8ff','#6cd08a','#b48cff'];pc.forEach((c,i)=>{const a=i/5*Math.PI+.3;S3(g,.45,c,Math.cos(a)*2.2,3.95,-Math.sin(a)*1.4+.3,1,.5,1);});
    B3(g,1.3,2,.2,'#4cae6a',0,0,2.22,.1);win3(g,-1.9,1.6,2.22,1.1,1);win3(g,1.9,1.6,2.22,1.1,1);pc.slice(0,3).forEach((c,i)=>{C3(g,.35,.35,3.2,c,-4+i*.8,0,1.6+i*.3,16);mesh3(g,geo3('crtip',()=>new THREE.ConeGeometry(.35,.7,16)),c,-4+i*.8,3.55,1.6+i*.3);});
    const nt=new THREE.Group();nt.position.set(3.8,0,1.8);g.add(nt);C3(nt,.08,.08,2.8,'#3a3050',.3,0,0,8);S3(nt,.4,'#3a3050',0,.2,0,1.2,.8,1);B3(nt,.8,.2,.12,'#3a3050',.6,2.6,0,.05).rotation.z=-.4;},
  fun(g,o){const wh=new THREE.Group();wh.position.set(-1.5,4.3,-.5);g.add(wh);o.wheel=wh;TR3(wh,3,.12,'#ff8cc0',0,0,0);TR3(wh,1,.1,'#ffd23a',0,0,0);for(let i=0;i<8;i++){const a=i/8*TAU;const sp=B3(wh,.08,3,.08,'#ffffff',0,0,0,0);sp.position.set(Math.cos(a)*1.5,Math.sin(a)*1.5,0);sp.rotation.z=a+Math.PI/2;const cb=B3(wh,.7,.7,.7,PAST[i],Math.cos(a)*3,Math.sin(a)*3-.6,0,.2);cb.userData.gond=1;}
    for(const s of[-1,1]){const l=B3(g,.2,4.6,.2,'#ffffff',-1.5+s*1.2,0,-.5,.05);l.rotation.z=-s*.25;}
    const tent=mesh3(g,geo3('tent',()=>new THREE.ConeGeometry(2,2.4,12)),new THREE.MeshStandardMaterial({map:stripeTex('#ff5f6f','#ffffff',12),roughness:.7}),3,3.3,1);C3(g,2,2,2.1,'#ffe6ea',3,0,1,12);B3(g,.9,1.4,.2,'#ff5f6f',3,0,3,.1);for(let i=0;i<3;i++)S3(g,.35,PAST[i*2],-4+i*.4,5+i*.6,1.5,1,1.2,1);},
  park(g){const tr=TR3(g,3.3,.35,'#e8705a',0,.1,0);tr.rotation.x=Math.PI/2;tr.scale.set(1.2,.9,1);const fl=C3(g,3,3,.06,'#8ad06a',0,0,0,36);fl.scale.set(1.2,1,.9);for(let i=0;i<5;i++){C3(g,.04,.04,2.4,'#ffffff',-3.6+i*1.8,0,-3.2,6);const f=mesh3(g,triGeo(.4,.03),PAST[i],-3.4+i*1.8,2.1,-3.2);f.rotation.z=Math.PI/2;}
    for(const x of[-1.2,1.2]){B3(g,.08,.8,.08,'#fff',x-.5,0,1.2,.02);B3(g,.08,.8,.08,'#fff',x+.5,0,1.2,.02);B3(g,1.1,.15,.1,'#ff5f6f',x,.75,1.2,.03);}tree3(g,-4.2,1.5,1.1);tree3(g,4.2,-1.8,1.2);tree3(g,4,2,.9,'#8ad06a');for(let i=0;i<3;i++)S3(g,.7,'#4cbe7a',-4+i*.6,.4,-2+i*.3,1.2,.8,1);},
  work(g,o){B3(g,5,3.8,4,'#ff6f6f',-1.4,0,0,.25);B3(g,5.2,.4,4.2,'#e84a4a',-1.4,3.8,0,.1);B3(g,2.6,2.4,.2,'#fff3e0',-1.4,0,2.02,.06);for(let i=0;i<4;i++)B3(g,2.6,.06,.24,'#e8d0b8',-1.4,.5+i*.5,2.04,0);S3(g,.3,'#ffd23a',-1.4,3.1,2.1);
    for(let i=0;i<7;i++){B3(g,.12,1,.12,'#ffd23a',2.8,i,-1,.02);B3(g,.12,1,.12,'#ffd23a',3.6,i,-1,.02);}const arm=new THREE.Group();arm.position.set(3.2,7,-1);g.add(arm);o.arm=arm;B3(arm,6,.3,.3,'#ffd23a',1.5,0,0,.05);B3(arm,.8,.8,.8,'#e8a000',-1.2,-.3,0,.1);C3(arm,.02,.02,2.4,'#555',3.8,-2.4,0,4);B3(arm,.6,.6,.6,'#5aa8ff',3.8,-3,0,.08);
    const tk=new THREE.Group();tk.position.set(-1,0,3.4);g.add(tk);B3(tk,2.6,.9,1.2,'#ff5f6f',0,.3,0,.15);B3(tk,.9,.8,1.1,'#ffffff',.9,1.1,0,.12);for(const x of[-.8,.8])for(const z of[-.6,.6]){const w=C3(tk,.28,.28,.2,'#3a3050',x,0,z,14);w.rotation.x=Math.PI/2;w.position.y=.3;}B3(tk,1.8,.14,.3,'#e8e8f0',-.4,1.25,0,.04);},
  port(g,o){for(let i=0;i<5;i++)C3(g,.95-i*.08,1-i*.08,1.4,i%2?'#ffffff':'#ff5f6f',-3,i*1.4,-1,20);C3(g,.7,.7,.9,m3('#fff6b0',{emissive:new THREE.Color('#ffe890'),emissiveIntensity:.8}),-3,7,-1,16);mesh3(g,geo3('lhroof',()=>new THREE.ConeGeometry(.9,.9,16)),'#ff5f6f',-3,8.3,-1);
    const bm=new THREE.Group();bm.position.set(-3,7.45,-1);g.add(bm);o.beam=bm;const beam=mesh3(bm,geo3('beam',()=>new THREE.ConeGeometry(.9,5,16,1,true)),m3('#fff6b0',{transparent:true,opacity:.35,emissive:new THREE.Color('#fff6b0'),side:THREE.DoubleSide}),2.5,0,0);beam.rotation.z=Math.PI/2;beam.castShadow=false;
    B3(g,4,.4,1.6,'#b07a4a',1.6,-.2,2.6,.06);const sh=new THREE.Group();sh.position.set(2.6,-.3,.6);g.add(sh);o.ship=sh;B3(sh,3.2,.9,1.3,'#5aa8ff',0,0,0,.35);B3(sh,1.4,.8,.9,'#ffffff',-.3,.9,0,.12);C3(sh,.06,.06,2.6,'#8a6a4a',.6,.9,0,6);const sl=mesh3(sh,triGeo(.9,.03),'#fff6e0',1.05,2.6,0);sl.rotation.z=-Math.PI/2;
    const sn=mesh3(g,geo3('snowm',()=>new THREE.ConeGeometry(2.2,3.4,6)),'#f4f8ff',3.4,1.7,-2.6);S3(g,.5,'#ffffff',3.4,3.3,-2.6);iconDisc(g,'lens',.7,-.2,1.2,1.4,'#b48cff');}};
SCN.map=scene3({bg:'#8fd8ff',song:'town',noHome:true,
  build(){if(!this.S)this.make();this.reset();},
  make(){const S=this.S=stage3({sr:24,sm:2048,fov:40});const g=new THREE.Group();S.s.add(g);
    const sh=new THREE.Shape();const X0=-15,X1=15,Y0=-13,Y1=76,r=6;sh.moveTo(X0+r,Y0);sh.lineTo(X1-r,Y0);sh.quadraticCurveTo(X1,Y0,X1,Y0+r);sh.lineTo(X1,Y1-r);sh.quadraticCurveTo(X1,Y1,X1-r,Y1);sh.lineTo(X0+r,Y1);sh.quadraticCurveTo(X0,Y1,X0,Y1-r);sh.lineTo(X0,Y0+r);sh.quadraticCurveTo(X0,Y0,X0+r,Y0);
    const ig=new THREE.ExtrudeGeometry(sh,{depth:1.6,bevelEnabled:true,bevelThickness:.4,bevelSize:.6,bevelSegments:3});ig.rotateX(-Math.PI/2);ig.translate(0,-1.6,0);const isl=new THREE.Mesh(ig,[m3('#9ee07a'),m3('#c8905a')]);isl.receiveShadow=true;g.add(isl);
    const sea=new THREE.Mesh(new THREE.PlaneGeometry(400,400),m3('#6cc8f0',{roughness:.3}));sea.rotation.x=-Math.PI/2;sea.position.y=-1.3;sea.receiveShadow=true;g.add(sea);this.waves=[];for(let i=0;i<26;i++){const w=TR3(g,.8,.06,'#ffffff',(i%2?-1:1)*(18+(i*7)%10),-1.2,-70+i*6);w.rotation.x=Math.PI/2;w.castShadow=false;this.waves.push(w);}
    const road=m3('#f3e3c8');B3(g,3,.06,74,road,0,0,-30,.02);const plz=C3(g,5,5,.08,'#f3e3c8',0,0,-3,40);plz.castShadow=false;
    C3(g,1.8,2,.6,'#e8e8f4',0,0,-3,24);C3(g,1.5,1.5,.62,m3('#8fd8ff',{roughness:.2}),0,.02,-3,24);C3(g,.3,.35,1.6,'#e8e8f4',0,0,-3,12);this.drops=[];for(let i=0;i<10;i++){this.drops.push(S3(g,.14,m3('#bfe8ff',{roughness:.1}),0,2,-3));}
    this.lms=[];for(const C of HOMEL.concat(CATS)){const lg=new THREE.Group();lg.position.set(C.pos[0],0,C.pos[1]);g.add(lg);const o={C,g:lg};LM3[C.lm](lg,o);tagPk(lg,o);this.lms.push(o);
      const bx=C.pos[0]>0?1.5:C.pos[0]<0?-1.5:0;if(C.pos[0]!==0)B3(g,Math.abs(C.pos[0])-1,.05,2.2,road,C.pos[0]/2+(C.pos[0]>0?.5:-.5)*0,0,C.pos[1]+3.2,.02);}
    SEEDR=77;for(let i=0;i<46;i++){const side=i%2?1:-1,z=-68+srand()*80,x=side*(12.5+srand()*2);tree3(g,x,z,.8+srand()*.5,srand()<.3?'#8ad06a':null);}for(let i=0;i<40;i++){const x=(srand()-.5)*26,z=-68+srand()*78;if(Math.abs(x)<2.2)continue;if(this.lms.some(o=>Math.abs(o.C.pos[0]-x)<5&&Math.abs(o.C.pos[1]-z)<5))continue;flower3(g,x,0,z,PAST[i%8],1.3);}
    this.chest=new THREE.Group();this.chest.position.set(3.2,0,-.8);g.add(this.chest);B3(this.chest,1.6,.9,1.1,'#c8783a',0,0,0,.1);this.lid=new THREE.Group();this.lid.position.set(0,.9,-.55);this.chest.add(this.lid);B3(this.lid,1.7,.4,1.2,'#e8a050',0,0,.55,.15);B3(this.chest,.3,.4,.1,'#ffd23a',0,.6,.58,.03);tagPk(this.chest,{chest:1});
    this.fu=charAdd(S,charSpr('fu',3.4));this.rk=charAdd(S,charSpr('rk',2.4));this.D={};},
  reset(){this.mode='top';this.path=null;this.zm=null;this.flash=0;this.pan=null;this.vz=0;this.chestT=0;this.dv=0;const last=this.lastId;this.lastId=null;
    const fu=this.fu;fu.x=0;fu.z=2.2;this.rk.x=1.4;this.rk.z=.3;this.fz=-8;
    if(last){const H0=HOMEL.find(h=>h.id===last);const C=CATS.find(q=>q.id===last)||CATS.find(q=>q.places.includes(last));if(H0){fu.x=H0.pos[0]*.7;fu.z=H0.pos[1]+3.2;this.fz=clamp(H0.pos[1]-10,-58,-6);}
      else if(C&&C.id!==last){this.openDist(C,last,true);}else if(C){fu.x=C.pos[0]*.6;fu.z=C.pos[1]+3.4;this.fz=clamp(C.pos[1]-6,-58,-6);}}
    if(this.pend){const id=this.pend;this.pend=null;const C=CATS.find(q=>q.places.includes(id));if(C)this.openDist(C,id,true);}
    this.rk.x=fu.x+1.3;this.rk.z=fu.z+.8;
    setTimeout(()=>{if(scene!==this)return;if(this.mode==='top')say(last?'つぎは どこへ いこうかな？':'ふーちゃんの まちへ ようこそ！ どこへ いこうかな？');else{const C=this.dc;say(C.ja+'！ どれで あそぶ？');}},600);},
  // ---------------- area plaza ----------------
  distScene(C){if(this.D[C.id])return this.D[C.id];const S=stage3({sr:20,fov:52});const g=new THREE.Group();S.s.add(g);const R=13,n=C.places.length;const th=C.roof;
    const gr=C3(g,30,30,.4,'#a8e488',0,-.4,0,64);gr.castShadow=false;const pv=C3(g,9.5,9.5,.06,shade(th,.55),0,0,0,64);pv.castShadow=false;const ring=TR3(g,R-2.6,.5,shade(th,.45),0,.05,0);ring.rotation.x=Math.PI/2;ring.scale.z=.1;ring.castShadow=false;
    for(let i=0;i<24;i++){const a=i/24*TAU;flower3(g,Math.sin(a)*5,0,-Math.cos(a)*5,PAST[i%8],1.1);}
    const bs=[];C.places.forEach((id,i)=>{const p=PLACES.find(q=>q.id===id);if(!p)return;const a=i/n*TAU,bg=new THREE.Group();bg.position.set(Math.sin(a)*R,0,-Math.cos(a)*R);bg.rotation.y=-a;g.add(bg);const o={p,a,g:bg};this.shop3(bg,p,o,i);tagPk(bg,o);bs.push(o);
      const ta=a+Math.PI/n;tree3(g,Math.sin(ta)*(R+.5),-Math.cos(ta)*(R+.5),1.2,i%2?null:'#8ad06a');const la=a+Math.PI/n*.55;C3(g,.08,.1,3,'#ffffff',Math.sin(la)*(R-3.5),0,-Math.cos(la)*(R-3.5),8);S3(g,.3,m3('#fff6c0',{emissive:new THREE.Color('#ffe890'),emissiveIntensity:.6}),Math.sin(la)*(R-3.5),3.1,-Math.cos(la)*(R-3.5));});
    SEEDR=5;for(let i=0;i<30;i++){const a=srand()*TAU,r=R+5+srand()*6;tree3(g,Math.sin(a)*r,-Math.cos(a)*r,1+srand()*.8,srand()<.4?'#8ad06a':null);}
    const fu=charAdd(S,charSpr('fu',2.6)),rk=charAdd(S,charSpr('rk',1.8));return this.D[C.id]={S,bs,fu,rk,R};},
  shop3(g,p,o,i){const w=6,h=4.2,d=4.6,st=i%4;B3(g,w,h,d,p.wall,0,0,0,.3);B3(g,w+.3,.3,d+.3,shade(p.roof,-.05),0,0,0,.1);
    if(st===0)prism3(g,w+.8,2.4,d+.6,p.roof,0,h,0);else if(st===1){const dm=S3(g,2.6,p.roof,0,h,0,1.15,.7,.9);}else if(st===2){B3(g,w+.4,.5,d+.4,p.roof,0,h,0,.15);for(let k=0;k<5;k++)S3(g,.5,k%2?'#ffffff':p.roof,-2.4+k*1.2,h+.5,d/2);}else{B3(g,w+.4,.4,d+.4,p.roof,0,h,0,.12);mesh3(g,geo3('tw',()=>new THREE.ConeGeometry(1.2,2,16)),p.roof,-2,h+1.4,-.6);C3(g,1,1,1.2,'#ffffff',-2,h+.2,-.6,16);}
    awning3(g,w-.6,0,h-1.3,d/2+.45,p.roof);B3(g,1.6,2.5,.2,shade(p.roof,-.25),0,0,d/2+.02,.12);S3(g,.1,'#ffd23a',.55,1.2,d/2+.18);win3(g,-2,1.6,d/2+.02,1.1,1.1);win3(g,2,1.6,d/2+.02,1.1,1.1);
    o.disc=iconDisc(g,p.icon,1.15,0,h+.95,d/2+.5,'#ffffff');o.sign=o.disc;
    for(let k=0;k<2;k++)flower3(g,(k?1:-1)*(w/2+.3),0,d/2,PAST[(i+k)%8],1.3);},
  openDist(C,focus,inst){const D=this.distScene(C);this.dc=C;this.mode='dist';this.D0=D;const i=Math.max(0,C.places.indexOf(focus));this.dv=D.bs[i]?D.bs[i].a:0;this.dvT=this.dv;this.walkIn=null;
    D.fu.x=Math.sin(this.dv)*3;D.fu.z=-Math.cos(this.dv)*3;D.rk.x=D.fu.x+Math.cos(this.dv)*1.4;D.rk.z=D.fu.z+Math.sin(this.dv)*1.4;if(!inst){this.flash=1;sfx('whoosh');setTimeout(()=>{if(scene===this&&this.mode==='dist')say(C.ja+'！ どれで あそぶ？ カードを タッチしてね');},500);}},
  cur(){const D=this.D0;let bi=0,bd=9;D.bs.forEach((b,i)=>{const d=Math.abs(Math.atan2(Math.sin(b.a-this.dv),Math.cos(b.a-this.dv)));if(d<bd){bd=d;bi=i;}});return D.bs[bi];},
  // ---------------- update ----------------
  update(dt){if(this.flash>0)this.flash=Math.max(0,this.flash-dt*2.5);for(const w of this.waves)w.scale.setScalar(1+((T*.4+w.position.z*.1)%1));
    this.drops.forEach((d,i)=>{const t=(T*1.2+i/10)%1,a=i/10*TAU;d.position.set(Math.cos(a)*t*1.3,1.6+Math.sin(t*Math.PI)*1.4,-3+Math.sin(a)*t*1.3);});
    for(const o of this.lms){if(o.wheel)o.wheel.rotation.z+=dt*.4;if(o.wheel)o.wheel.children.forEach(ch=>{if(ch.userData.gond)ch.rotation.z=-o.wheel.rotation.z;});if(o.beam)o.beam.rotation.y+=dt*1.2;if(o.ship)o.ship.position.y=-.3+Math.sin(T*1.5)*.1;if(o.arm)o.arm.rotation.y=Math.sin(T*.4)*.6;o.g.traverse(m=>{if(m.userData.spin)m.rotation.y+=dt*1.5;});}
    const q=SAVE.quest;this.chest.visible=!!(q.chest||this.chestT>0);if(this.chestT>0){this.chestT+=dt;this.lid.rotation.x=-Math.min(1.8,this.chestT*3);if(this.chestT>1.2){this.chestT=0;SAVE.quest.chest=false;newQuest();celebrate('chest');}}else this.lid.rotation.x=0;
    if(this.mode==='top'){const S=this.S,fu=this.fu,rk=this.rk;
      if(!this.pan&&this.vz){this.fz=clamp(this.fz+this.vz*dt,-58,-6);this.vz*=Math.pow(.04,dt);if(Math.abs(this.vz)<.3)this.vz=0;}
      if(this.path&&!this.zm){const tg=this.path[0];if(charWalk(fu,tg[0],tg[1],this.path.fast?16:11,dt,S.cam)){this.path.shift();if(!this.path.length){const cb=this.path.cb;this.path=null;fu.dir=0;if(cb)cb();}}if(this.follow)this.fz+=(clamp(fu.z-8,-58,-6)-this.fz)*Math.min(1,dt*3);}
      if(Math.hypot(rk.x-fu.x-1.3,rk.z-fu.z-.8)>.3)charWalk(rk,fu.x+1.3,fu.z+.8,fu.mv?12:5,dt,S.cam);else rk.mv=false;
      let tgt=new THREE.Vector3(0,0,this.fz),pos=new THREE.Vector3(0,68,this.fz+47);if(this.zm){this.zm.t+=dt;const k=easeOut(Math.min(1,this.zm.t/.8));const L=this.zm.C.pos;pos.lerp(new THREE.Vector3(L[0],9,L[1]+12),k);tgt.lerp(new THREE.Vector3(L[0],2,L[1]),k);if(this.zm.t>.8){const z=this.zm;this.zm=null;if(z.C.home){this.lastId=z.C.id;go(z.C.id);}else{this.openDist(z.C);}}}
      S.cam.position.copy(pos);S.cam.lookAt(tgt);lightAt(S,0,this.fz-6);charUpd(fu,dt);charUpd(rk,dt);}
    else{const D=this.D0,S=D.S,fu=D.fu,rk=D.rk;if(!this.pan){const b=this.cur();let da=Math.atan2(Math.sin(b.a-this.dv),Math.cos(b.a-this.dv));if(!this.walkIn)this.dv+=da*Math.min(1,dt*6);}
      const dv=this.dv,R=D.R;if(this.walkIn){const w=this.walkIn;w.t+=dt;const door=[Math.sin(w.b.a)*(R-2.2),-Math.cos(w.b.a)*(R-2.2)];if(charWalk(fu,door[0],door[1],6,dt,S.cam)&&!w.done){w.done=1;fu.jump=1;setTimeout(()=>{if(scene===this){this.lastId=w.b.p.id;go(w.b.p.id);}},350);}}
      else{const tx=Math.sin(dv)*3,tz=-Math.cos(dv)*3;if(Math.hypot(fu.x-tx,fu.z-tz)>.1)charWalk(fu,tx,tz,8,dt,S.cam);else{fu.mv=false;fu.face=0;}}
      const rx=fu.x+Math.cos(dv)*1.5,rz=fu.z+Math.sin(dv)*1.5;if(Math.hypot(rk.x-rx,rk.z-rz)>.2)charWalk(rk,rx,rz,7,dt,S.cam);else rk.mv=false;
      const cd=this.walkIn?5:11;S.cam.position.set(-Math.sin(dv)*cd,this.walkIn?5:7.2,Math.cos(dv)*cd);S.cam.lookAt(Math.sin(dv)*R*.8,2.6,-Math.cos(dv)*R*.8);lightAt(S,Math.sin(dv)*6,-Math.cos(dv)*6);
      charUpd(fu,dt);charUpd(rk,dt);}},
  // ---------------- draw ----------------
  draw(c){if(this.mode==='top'){sky3(c,'#8fd8ff','#dff4ff',true);render3(c,this.S);this.drawTop(c);}else{const C=this.dc;sky3(c,'#a8dcff',shade(C.wall,-.02),true);render3(c,this.D0.S);this.drawDist(c);}
    if(this.flash>0){c.fillStyle=`rgba(255,255,255,${this.flash})`;c.fillRect(-OX/SC,-OY/SC,W+2*OX/SC,H+2*OY/SC);}
    this.drawHUD(c);},
  drawTop(c){const S=this.S,q=SAVE.quest;for(const o of this.lms){const C=o.C,top=C.home?6.2:C.lm==='port'?9.4:7.6;const p=toScr(S,new THREE.Vector3(C.pos[0],top,C.pos[1]));if(!p.vis||p.y<60||p.y>H+40)continue;
      c.font=`800 21px ${FONT}`;const tw=c.measureText(C.name).width+30,bob=Math.sin(T*2+C.pos[1])*3,y=p.y+bob;c.fillStyle='rgba(60,40,90,.18)';rr(c,p.x-tw/2+3,y-22,tw,44,22);c.fill();c.fillStyle=C.roof;rr(c,p.x-tw/2,y-26,tw,44,22);c.fill();c.strokeStyle='#fff';c.lineWidth=4;c.stroke();
      c.fillStyle='#fff';c.textAlign='center';c.textBaseline='middle';c.fillText(C.name,p.x,y-3);c.fillStyle=C.roof;c.beginPath();c.moveTo(p.x-9,y+17);c.lineTo(p.x+9,y+17);c.lineTo(p.x,y+29);c.fill();
      if(!C.home){const n=distStars(C),m=C.places.length*3;c.fillStyle='rgba(255,255,255,.95)';rr(c,p.x-52,y+32,104,28,14);c.fill();c.fillStyle='#ffc21a';star(c,p.x-30,y+46,10,4.5);c.fill();c.fillStyle='#8a6a1a';c.font=`800 16px ${FONT}`;c.fillText(`${n}/${m}`,p.x+10,y+47);if(n>=m){c.fillStyle='#ffd23a';SPECIAL_THING.crown?drawItem(c,'crown',p.x+tw/2,y-26,.6):0;}
        if(C.places.some(id=>{const z=PLACES.find(pp=>pp.id===id);return z&&z.nw;})){c.fillStyle='#ff5f6f';rr(c,p.x+tw/2-30,y-42,52,22,11);c.fill();c.fillStyle='#fff';c.font=`800 13px ${FONT}`;c.fillText('NEW',p.x+tw/2-4,y-31);}
        if(q.list.some(id=>C.places.includes(id)&&!q.done.includes(id))){const bx=p.x-tw/2-6,by=y-26+Math.sin(T*5)*5;c.fillStyle='#ff5f6f';circ(c,bx,by,19);c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.arc(bx,by,19,0,TAU);c.stroke();c.fillStyle='#fff';c.font=`900 24px ${FONT}`;c.fillText('！',bx,by+1);}}}
    if(this.chest.visible&&!this.chestT){const p=toScr(S,new THREE.Vector3(3.2,2,-.8));c.font=`800 20px ${FONT}`;c.textAlign='center';c.lineWidth=6;c.strokeStyle='#fff';const ty=p.y-10+Math.sin(T*5)*4;c.strokeText('タッチ！',p.x,ty);c.fillStyle='#ff5fa2';c.fillText('タッチ！',p.x,ty);}
    const k=(this.fz+58)/52;c.fillStyle='rgba(255,255,255,.6)';rr(c,W-14,170,8,H-260,4);c.fill();c.fillStyle='#ff8cc0';rr(c,W-18,170+(1-k)*(H-300),16,40,8);c.fill();},
  drawDist(c){const D=this.D0,S=D.S,C=this.dc,q=SAVE.quest,b=this.cur();
    c.fillStyle=C.roof;rr(c,W/2-170,112,340,56,28);c.fill();c.strokeStyle='#fff';c.lineWidth=4;c.stroke();c.fillStyle='#fff';c.font=`30px ${POP}`;c.textAlign='center';c.textBaseline='middle';c.fillText(C.name,W/2,142,320);
    for(const o of D.bs){const p=toScr(S,new THREE.Vector3(Math.sin(o.a)*(D.R-2.4),6.9,-Math.cos(o.a)*(D.R-2.4)));const fr=Math.cos(o.a-this.dv);if(!p.vis||fr<.5)continue;const al=clamp((fr-.5)*3,0,1);c.globalAlpha=al;
      c.font=`800 28px ${FONT}`;const nm=o.p.name,tw=c.measureText(nm).width+40,y=p.y-10;c.fillStyle='#fff';rr(c,p.x-tw/2,y-26,tw,52,26);c.fill();c.strokeStyle=o.p.roof;c.lineWidth=5;c.stroke();c.fillStyle=shade(o.p.roof,-.35);c.fillText(nm,p.x,y+1);
      starsRow(c,p.x,y+46,bestOf(o.p.id),14);if(o.p.nw){c.fillStyle='#ff5f6f';rr(c,p.x+tw/2-34,y-40,56,24,12);c.fill();c.fillStyle='#fff';c.font=`800 14px ${FONT}`;c.fillText('NEW',p.x+tw/2-6,y-28);}
      if(q.list.includes(o.p.id)){const dn=q.done.includes(o.p.id),bx=p.x-tw/2-8,by=y-26+(dn?0:Math.sin(T*5)*5);c.fillStyle=dn?'#6cd08a':'#ff5f6f';circ(c,bx,by,20);c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.arc(bx,by,20,0,TAU);c.stroke();c.fillStyle='#fff';c.font=`900 24px ${FONT}`;c.fillText(dn?'✓':'！',bx,by+1);}c.globalAlpha=1;}
    const n=D.bs.length,bi=D.bs.indexOf(b);for(let i=0;i<n;i++){c.fillStyle=i===bi?C.roof:'rgba(90,70,110,.35)';circ(c,W/2-(n-1)*14+i*28,H-40,i===bi?10:7);}
    if(!this.walkIn){hud3Btn(c,56,H*.62,36,C.roof,'prev');hud3Btn(c,W-56,H*.62,36,C.roof,'next');drawBtn(c,W/2+150,H-100,40,'#ff6fa8','play',true);c.fillStyle='#fff';c.font=`800 18px ${FONT}`;c.lineWidth=5;c.strokeStyle='rgba(200,60,120,.7)';c.strokeText('あそぶ！',W/2+150,H-44);c.fillText('あそぶ！',W/2+150,H-44);}},
  drawHUD(c){const q=SAVE.quest;c.fillStyle='rgba(255,255,255,.92)';rr(c,12,14,300,92,26);c.fill();c.strokeStyle='#ffb03a';c.lineWidth=4;c.stroke();c.fillStyle='#ffb03a';rr(c,22,4,104,26,13);c.fill();c.fillStyle='#fff';c.font=`800 16px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText('おねがい',74,17);
    q.list.forEach((id,i)=>{const p=PLACES.find(p=>p.id===id),x=70+i*96,y=64,dn=q.done.includes(id);c.fillStyle=dn?'#e8fbe8':'#fff6e8';circ(c,x,y,34);c.strokeStyle=dn?'#6cd08a':'#ffd08a';c.lineWidth=3;c.beginPath();c.arc(x,y,34,0,TAU);c.stroke();if(p)drawThing(c,p.icon,x,y,.75);
      if(dn){c.fillStyle='#6cd08a';circ(c,x+24,y+22,13);c.strokeStyle='#fff';c.lineWidth=4;c.beginPath();c.moveTo(x+18,y+22);c.lineTo(x+23,y+27);c.lineTo(x+31,y+16);c.stroke();}});
    drawBtn(c,W-56,60,40,'#ff8cc0','book',SAVE.stickers.length>0&&(T%6)<1);drawBtn(c,W-150,60,40,'#7ab8ff',SAVE.sound?'sound':'mute');wallet(c,W-130,128,.9);
    if(this.mode==='dist'){drawBtn(c,56,178,38,'#8ab8e8','prev');c.fillStyle='#fff';rr(c,16,220,80,26,13);c.fill();c.fillStyle='#3a6a9a';c.font=`800 15px ${FONT}`;c.textAlign='center';c.fillText('まちへ',56,233);}},
  // ---------------- input ----------------
  hudTap(x,y){if(hitC(x,y,W-56,60,46)){sfx('tap');go('book');return true;}if(hitC(x,y,W-150,60,46)){SAVE.sound=!SAVE.sound;save();if(!SAVE.sound)hush();else sfx('ding');return true;}if(Math.abs(x-(W-130))<110&&Math.abs(y-128)<24){sfx('tap');this.lastId=null;go('kagu');return true;}
    if(this.mode==='dist'&&hitC(x,y,56,178,46)){this.toTop();return true;}
    if(x<320&&y<110){const q=SAVE.quest;sfx('tap');if(q.chest){say('おねがい ぜんぶ クリア！ たからばこは ひろばに あるよ');if(this.mode==='dist')this.toTop();this.walkTop(2,0,null);return true;}const i=clamp(Math.round((x-70)/96),0,2),id=q.list[i];if(q.done.includes(id)){say('おねがい！ '+q.list.filter(i=>!q.done.includes(i)).map(placeName).join('と ')+'で あそぼう！');return true;}
      const C=CATS.find(z=>z.places.includes(id));if(!C)return true;say(placeName(id)+'に いこう！');if(this.mode==='dist'&&this.dc===C){const b=this.D0.bs.find(b=>b.p.id===id);this.dvT=b.a;this.dv=b.a;}else{this.mode='top';this.openDist(C,id);}return true;}
    return false;},
  toTop(){const C=this.dc;this.mode='top';this.flash=1;sfx('whoosh');this.fu.x=C.pos[0]*.6;this.fu.z=C.pos[1]+3.4;this.rk.x=this.fu.x+1.3;this.rk.z=this.fu.z+.8;this.fz=clamp(C.pos[1]-6,-58,-6);},
  walkTop(x,z,cb,fast){const fu=this.fu,P=[];if(Math.abs(fu.x)>.3)P.push([0,fu.z]);P.push([0,z]);if(Math.abs(x)>.1)P.push([x,z]);P.cb=cb;P.fast=fast;this.path=P;this.follow=true;},
  goLm(o){const C=o.C;sfx('pop');say(C.ja+(C.home?'に いこう！':'へ いこう！'));const tz=C.pos[1]+3.4,tx=C.pos[0]*.55;this.walkTop(tx,tz,()=>{this.fu.jump=1;this.zm={t:0,C};},true);},
  down(x,y){if(this.zm||(this.D0&&this.walkIn))return;this.pan={sx:x,sy:y,ly:y,lx:x,moved:false,fz0:this.fz,dv0:this.dv,lt:performance.now(),v:0};this.vz=0;},
  move(x,y){const p=this.pan;if(!p)return;if(Math.hypot(x-p.sx,y-p.sy)>14)p.moved=true;if(!p.moved)return;const now=performance.now(),dt=Math.max(1,now-p.lt)/1000;
    if(this.mode==='top'){this.follow=false;this.fz=clamp(p.fz0+(y-p.sy)*.075,-58,-6);p.v=(y-p.ly)*.075/dt;}else{this.dv=p.dv0-(x-p.sx)*.006;}p.ly=y;p.lx=x;p.lt=now;},
  up(x,y){const p=this.pan;this.pan=null;if(!p)return;if(p.moved){if(this.mode==='top')this.vz=clamp(p.v,-60,60);else{const b=this.cur();sfx('whoosh');hush();speak(b.p.ja);}return;}
    if(this.hudTap(x,y))return;
    if(this.mode==='top'){if(this.path&&this.path.fast)return;const h=pick3(this.S,x,y,this.lms.map(o=>o.g).concat(this.chest.visible?[this.chest]:[]));
      if(h&&h.o.userData.pk.chest){if(!this.chestT){this.chestT=.01;sfx('open');say('たからばこ オープン！');}return;}
      if(h){this.goLm(h.o.userData.pk);burst(x,y,10,'star');return;}
      const fp=toScr(this.S,new THREE.Vector3(this.fu.x,2,this.fu.z));if(Math.hypot(x-fp.x,y-fp.y)<50){this.fu.jump=1;sfx('boing');say(pick(['やっほー！','どこへ いこうかな？','たのしいね！']));return;}
      const g=hitPlane(this.S,x,y,0);if(g&&Math.abs(g.x)<13&&g.z>-68&&g.z<10){sfx('tap');ring(x,y,'rgba(255,140,190,.8)');this.walkTop(clamp(g.x,-11,11),g.z,null);}return;}
    // district
    const D=this.D0;if(hitC(x,y,56,H*.62,44)){this.turn(-1);return;}if(hitC(x,y,W-56,H*.62,44)){this.turn(1);return;}
    const b=this.cur();if(hitC(x,y,W/2+150,H-100,50)){this.enterB(b);return;}const h=pick3(D.S,x,y,D.bs.map(o=>o.g));if(h){const o=h.o.userData.pk;if(o===b)this.enterB(b);else{this.dv=o.a;sfx('whoosh');speak(o.p.ja);}return;}
    const fp=toScr(D.S,new THREE.Vector3(D.fu.x,1.5,D.fu.z));if(Math.hypot(x-fp.x,y-fp.y)<60){D.fu.jump=1;sfx('boing');say(pick(['どれに しようかな？','わくわく！','あそぼう！']));}},
  turn(d){const D=this.D0,b=this.cur(),i=D.bs.indexOf(b),n=D.bs.length,nb=D.bs[(i+d+n)%n];let da=Math.atan2(Math.sin(nb.a-this.dv),Math.cos(nb.a-this.dv));if(n===1)return;this.dv+=da;sfx('whoosh');hush();speak(nb.p.ja);},
  enterB(b){if(this.walkIn)return;sfx('pop');say(b.p.ja+'に いこう！');this.walkIn={b,t:0};},
  hint(){if(this.zm||this.walkIn||this.path)return null;const q=SAVE.quest;
    if(this.mode==='top'){if(q.chest){const p=toScr(this.S,new THREE.Vector3(3.2,1,-.8));return{x:p.x,y:p.y};}const o=this.lms.find(o=>!o.C.home&&q.list.some(id=>o.C.places.includes(id)&&!q.done.includes(id)));if(!o)return null;const p=toScr(this.S,new THREE.Vector3(o.C.pos[0],3,o.C.pos[1]));return p.y>140&&p.y<H-40?{x:p.x,y:p.y}:{x:70,y:64};}
    const b=this.cur();if(q.list.includes(b.p.id)&&!q.done.includes(b.p.id))return{x:W/2+150,y:H-100};const t=this.D0.bs.find(o=>q.list.includes(o.p.id)&&!q.done.includes(o.p.id));if(t)return{x:W-56,y:H*.62};return{x:W/2+150,y:H-100};},
  hintText(){return this.mode==='top'?'いきたい ばしょを タッチしてね':'よこに スワイプして えらんで、 あそぶ！を タッチ';}});
SCN2D.map=SCN.map2d;

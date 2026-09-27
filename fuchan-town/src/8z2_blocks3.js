// ================= 3D つみき =================
const BSH=[['cube','しかく','cube'],['roof','さんかく','triangle'],['cyl','まる','cylinder'],['slab','いた','board']];
const BCOL=[['あか','red','#ff5a6a'],['きいろ','yellow','#ffd23a'],['あお','blue','#4a9aff'],['みどり','green','#5cc86a'],['ピンク','pink','#ff8cc0'],['しろ','white','#f4f4f8']];
const BPRINT=[{ja:'おうち',en:'house',c:[[0,0,0,'cube',0],[1,0,0,'cube',0],[0,1,0,'cube',5],[1,1,0,'cube',5],[0,2,0,'roof',2],[1,2,0,'roof',2]]},
  {ja:'ロケット',en:'rocket',c:[[0,0,0,'cyl',5],[0,1,0,'cyl',5],[0,2,0,'cyl',4],[0,3,0,'roof',0],[-1,0,0,'slab',2],[1,0,0,'slab',2]]},
  {ja:'おしろ',en:'castle',c:[[-1,0,0,'cube',4],[0,0,0,'cube',5],[1,0,0,'cube',4],[-1,1,0,'cyl',4],[1,1,0,'cyl',4],[0,1,0,'cube',5],[-1,2,0,'roof',2],[1,2,0,'roof',2],[0,2,0,'slab',1]]},
  {ja:'タワー',en:'tower',c:[[0,0,0,'cube',0],[0,1,0,'cube',1],[0,2,0,'cube',2],[0,3,0,'cyl',3],[0,4,0,'roof',4]]},
  {ja:'はし',en:'bridge',c:[[-1,0,0,'cyl',2],[1,0,0,'cyl',2],[-1,1,0,'slab',0],[0,1,0,'slab',0],[1,1,0,'slab',0]]},
  {ja:'き',en:'tree',c:[[0,0,0,'cyl',1],[0,1,0,'cube',3],[-1,1,0,'cube',3],[1,1,0,'cube',3],[0,2,0,'roof',3]]},
  {ja:'くるま',en:'car',c:[[-1,0,0,'cube',0],[0,0,0,'cube',0],[1,0,0,'cube',0],[0,1,0,'cube',2],[-1,1,0,'slab',5],[1,1,0,'slab',5]]},
  {ja:'ロボット',en:'robot',c:[[-1,0,0,'cube',2],[1,0,0,'cube',2],[-1,1,0,'cube',5],[0,1,0,'cube',5],[1,1,0,'cube',5],[0,2,0,'cube',1],[0,3,0,'cyl',0]]}];
function mkBlock(sh,col,mat){const g=new THREE.Group();const m=mat||m3(col);if(sh==='cube'){B3(g,.96,.96,.96,m,0,0,0,.08);}else if(sh==='slab'){B3(g,.96,.46,.96,m,0,0,0,.06);}else if(sh==='cyl'){C3(g,.46,.46,.96,m,0,0,0,24);}else{const p=prism3(g,.98,.96,.98,col,0,0,0);if(mat)p.material=mat;}
  if(!mat&&sh!=='roof'){const h=sh==='slab'?.46:.96;for(const [dx,dz] of sh==='cyl'?[[0,0]]:[[-.22,-.22],[.22,-.22],[-.22,.22],[.22,.22]])C3(g,.13,.13,.09,m,dx,h,dz,12);}return g;}
reg3('blocks',{bg:'#e8f6ff',song:'play',
  build(){const S=this.S=stage3({sr:8,fov:45});const g=new THREE.Group();S.s.add(g);this.g=g;B3(g,7.8,.5,7.8,'#6cd08a',0,-.5,0,.15);const pl=new THREE.Mesh(new THREE.PlaneGeometry(7.6,7.6),m3('#7ad89a'));pl.rotation.x=-Math.PI/2;pl.position.y=.002;pl.receiveShadow=true;g.add(pl);this.plate=tagPk(pl,{plate:1});
    for(let x=-3;x<=3;x++)for(let z=-3;z<=3;z++)C3(g,.16,.16,.08,'#8ae0a8',x,0,z,10);
    C3(g,9,9.4,.3,'#ffe6b0',0,-.9,0,40);this.fu=charAdd(S,charSpr('fu',2.6));this.fu.x=-3.4;this.fu.z=4.4;this.rk=charAdd(S,charSpr('rk',1.8));this.rk.x=3.6;this.rk.z=4.4;
    this.blocks=new THREE.Group();g.add(this.blocks);this.ghosts=new THREE.Group();g.add(this.ghosts);this.cells={};this.stage=0;this.miss=0;this.sh='cube';this.col=0;this.az=.5;this.dist=16.5;this.erase=false;this.fin=0;this.done=0;this.drops=[];this.bp=shuffle(BPRINT).slice(0,3).sort((a,b)=>a.c.length-b.c.length);this.setStage();},
  setStage(){for(const k in this.cells)this.blocks.remove(this.cells[k].g);this.cells={};while(this.ghosts.children.length)this.ghosts.remove(this.ghosts.children[0]);this.done=0;
    if(this.stage<this.bp.length){const P=this.bp[this.stage];this.need=P.c.map(([x,y,z,sh,ci])=>{const gm=mkBlock(sh,BCOL[ci][2],m3(BCOL[ci][2],{transparent:true,opacity:.32,depthWrite:false}));gm.position.set(x,y,z);gm.children.forEach(m=>{m.castShadow=false;});this.ghosts.add(tagPk(gm,{ghost:1,x,y,z,sh,ci}));return{x,y,z,sh,ci,g:gm,ok:false};});
      setTimeout(()=>{if(scene===this)say(`${P.ja}を つくろう！ かたちと いろを えらんで、 すけている ところを タッチ`);},400);}
    else{this.need=null;setTimeout(()=>{if(scene===this)say('じゆうに つくろう！ ブロックの うえを タッチすると つめるよ。 できたら できた！ボタン');},400);}},
  key(x,y,z){return x+','+y+','+z;},
  place(x,y,z,sh,ci){const k=this.key(x,y,z);if(this.cells[k])return false;const bg=mkBlock(sh,BCOL[ci][2]);bg.position.set(x,y+2.5,z);this.blocks.add(tagPk(bg,{blk:1,x,y,z}));this.cells[k]={g:bg,sh,ci,x,y,z};this.drops.push({g:bg,y,v:0});sfx('pop');return true;},
  update(dt){const S=this.S;for(const d of this.drops){d.v-=dt*30;d.g.position.y+=d.v*dt;if(d.g.position.y<=d.y){d.g.position.y=d.y;if(d.v<-3){d.v=-d.v*.3;sfx('tick');}else{d.v=0;d.done=1;}}}this.drops=this.drops.filter(d=>!d.done);
    if(this.need){const nx=this.nextNeed();this.need.forEach(n=>{if(n.ok)return;const k=n===nx?1+Math.sin(T*6)*.06:1;n.g.scale.setScalar(k);n.g.visible=true;});}
    if(this.done>0){this.done+=dt;this.blocks.rotation.y=Math.min(1,this.done)*0+Math.sin(this.done*3)*.15*Math.max(0,1-this.done/3);if(this.done>3){this.blocks.rotation.y=0;this.stage++;this.setStage();}}
    const el=.62;S.cam.position.set(Math.sin(this.az)*this.dist*Math.cos(el),1.4+Math.sin(el)*this.dist,Math.cos(this.az)*this.dist*Math.cos(el));S.cam.lookAt(0,1.4,0);charUpd(this.fu,dt);charUpd(this.rk,dt);
    if(this.fin>0){this.fin+=dt;if(this.fin>1.8&&this.fin<9){this.fin=9;celebrate('blocks',this.miss<=2,this.miss<=2?3:this.miss<=6?2:1);}}},
  nextNeed(){if(!this.need)return null;const L=this.need.filter(n=>!n.ok&&this.supported(n));return L.sort((a,b)=>a.y-b.y)[0]||this.need.find(n=>!n.ok);},
  supported(n){return n.y===0||!!this.cells[this.key(n.x,n.y-1,n.z)]||this.need.some(m=>m.ok&&Math.abs(m.x-n.x)+Math.abs(m.z-n.z)===1&&m.y===n.y);},
  draw(c){sky3(c,'#bfe8ff','#fff6e8',true);render3(c,this.S);
    const ty=H-200;c.fillStyle='rgba(255,255,255,.94)';rr(c,10,ty,W-20,194,28);c.fill();c.strokeStyle='#9ad0ff';c.lineWidth=4;c.stroke();
    BSH.forEach(([k,ja],i)=>{const x=90+i*140,y=ty+52,on=this.sh===k&&!this.erase;c.fillStyle=on?'#fff6d0':'#f4f8ff';rr(c,x-58,y-40,116,80,20);c.fill();c.strokeStyle=on?'#ffb03a':'#d0e0f0';c.lineWidth=on?5:3;c.stroke();const col=BCOL[this.col][2];
      if(k==='cube')drawShape(c,'sq',x,y-6,20,col);else if(k==='roof')drawShape(c,'tri',x,y-4,22,col);else if(k==='cyl'){c.fillStyle=col;rr(c,x-18,y-26,36,40,4);c.fill();c.fillStyle=shade(col,.2);ell(c,x,y-26,18,7);}else{c.fillStyle=col;rr(c,x-26,y-12,52,18,4);c.fill();}
      c.fillStyle='#5a6a8a';c.font=`800 15px ${FONT}`;c.textAlign='center';c.textBaseline='middle';c.fillText(ja,x,y+28);});
    BCOL.forEach(([ja,en,col],i)=>{const x=60+i*84,y=ty+146,on=this.col===i&&!this.erase;c.fillStyle='rgba(0,0,0,.12)';circ(c,x,y+4,on?30:26);c.fillStyle=col;circ(c,x,y,on?30:26);c.strokeStyle=on?'#ffb03a':'#d8d8e8';c.lineWidth=on?6:3;c.beginPath();c.arc(x,y,on?30:26,0,TAU);c.stroke();});
    if(!this.need){hud3Btn(c,W-60,ty-70,34,this.erase?'#ff6f8f':'#b0a0c0','box',this.erase?'けしてる':'けす');hud3Btn(c,W-150,ty-70,34,'#6cd08a','check','できた！');}
    else{const P=this.bp[this.stage];c.fillStyle='rgba(255,255,255,.93)';rr(c,W/2-130,112,260,50,25);c.fill();c.strokeStyle='#ffb03a';c.lineWidth=4;c.stroke();c.fillStyle='#b06a10';c.font=`800 24px ${FONT}`;c.textAlign='center';c.fillText(`${P.ja} ${this.need.filter(n=>n.ok).length}/${this.need.length}`,W/2,138);}
    stepDots(c,4,this.stage,184);},
  down(x,y){this.pan={sx:x,sy:y,az0:this.az,d0:this.dist,moved:false};},
  move(x,y){const p=this.pan;if(!p)return;if(Math.hypot(x-p.sx,y-p.sy)>14&&p.sy<H-200)p.moved=true;if(p.moved){this.az=p.az0-(x-p.sx)*.008;this.dist=clamp(p.d0+(y-p.sy)*.02,8,18);}},
  up(x,y){const p=this.pan;this.pan=null;if(!p||p.moved)return;const ty=H-200;
    if(y>ty){for(let i=0;i<4;i++)if(Math.abs(x-(90+i*140))<58&&Math.abs(y-(ty+52))<40){this.sh=BSH[i][0];this.erase=false;sfx('tap');sayPair(BSH[i][1],BSH[i][2]);return;}
      for(let i=0;i<6;i++)if(hitC(x,y,60+i*84,ty+146,34)){this.col=i;this.erase=false;sfx('tap');sayPair(BCOL[i][0],BCOL[i][1]);return;}return;}
    if(!this.need&&hitC(x,y,W-60,ty-70,40)){this.erase=!this.erase;sfx('tap');return;}if(!this.need&&hitC(x,y,W-150,ty-70,40)){const n=Object.keys(this.cells).length;if(n<3){say('もう すこし つもう！');return;}this.fin=.01;sfx('fanfare');confetti(90);say('すてきな さくひん！ できあがり！');this.fu.jump=1;return;}
    if(this.done>0||this.fin)return;
    if(this.need){const h=pick3(this.S,x,y,[this.ghosts]);if(!h)return;const d=h.o.userData.pk,n=this.need.find(q=>q.x===d.x&&q.y===d.y&&q.z===d.z);if(!n||n.ok)return;
      if(n.sh!==this.sh||n.ci!==this.col){this.miss++;sfx('no');const s=BSH.find(q=>q[0]===n.sh);say(n.sh!==this.sh?`かたちが ちがうよ。 ${s[1]}の ブロックだよ`:`いろが ちがうよ。 ${BCOL[n.ci][0]}だよ`);return;}
      if(!this.supported(n)){say('したから じゅんばんに つもうね');sfx('no');return;}
      n.ok=true;n.g.visible=false;this.place(n.x,n.y,n.z,n.sh,n.ci);const sp=toScr(this.S,new THREE.Vector3(n.x,n.y+1,n.z));burst(sp.x,sp.y,8,'star');
      if(this.need.every(q=>q.ok)){this.done=.01;const P=this.bp[this.stage];sfx('fanfare');confetti(60);this.fu.jump=1;setTimeout(()=>{if(scene===this)sayPair(P.ja+' できた！',P.en);},600);}return;}
    const h=pick3(this.S,x,y,[this.blocks,this.plate]);if(!h)return;const d=h.o.userData.pk;
    if(this.erase){if(d.blk){const k=this.key(d.x,d.y,d.z),cl=this.cells[k];if(cl){this.blocks.remove(cl.g);delete this.cells[k];sfx('pop');puff(x,y,8,'#fff');}}return;}
    let nx,ny,nz;if(d.plate){nx=clamp(Math.round(h.pt.x),-3,3);nz=clamp(Math.round(h.pt.z),-3,3);ny=0;while(this.cells[this.key(nx,ny,nz)])ny++;}
    else{const lp=h.pt.clone().sub(new THREE.Vector3(d.x,d.y+.5,d.z));const ax=Math.abs(lp.x),ay=Math.abs(lp.y),az=Math.abs(lp.z);nx=d.x;ny=d.y;nz=d.z;if(ay>=ax&&ay>=az)ny+=lp.y>0?1:-1;else if(ax>=az)nx+=lp.x>0?1:-1;else nz+=lp.z>0?1:-1;if(ny<0)return;}
    if(Math.abs(nx)>3||Math.abs(nz)>3||ny>8)return;if(this.place(nx,ny,nz,this.sh,this.col)){const sp=toScr(this.S,new THREE.Vector3(nx,ny+1,nz));burst(sp.x,sp.y,6,'star');}},
  hint(){if(!this.need||this.done)return null;const n=this.nextNeed();if(!n)return null;const ty=H-200;if(n.sh!==this.sh)return{x:90+BSH.findIndex(q=>q[0]===n.sh)*140,y:ty+52};if(n.ci!==this.col)return{x:60+n.ci*84,y:ty+146};const p=toScr(this.S,new THREE.Vector3(n.x,n.y+.5,n.z));return{x:p.x,y:p.y};},
  hintText(){return 'かたちと いろを えらんで、 すけている ブロックを タッチしてね';}});

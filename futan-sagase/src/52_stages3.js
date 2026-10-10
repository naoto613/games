// ================= ひみつの ステージ（ガチャの カギで ひらく） =================
Object.assign(PROPS,{
  burrow:[110,70,(c,o)=>{c.beginPath();c.moveTo(-52,0);c.quadraticCurveTo(-50,-60,0,-62);c.quadraticCurveTo(50,-60,52,0);c.closePath();FS(c,'#8fc66a');for(let i=0;i<6;i++){circ(c,-36+i*14,-50+Math.abs(i-2.5)*5,4);F(c,['#f28fb7','#fff','#f6c63a'][i%3])}
    c.beginPath();c.arc(0,0,20,Math.PI,0);c.closePath();FS(c,'#5a3a28');rr(c,-30,-34,22,14,4);FS(c,'#fff6dc');c.fillStyle=LN;c.font='900 9px sans-serif';c.textAlign='center';c.fillText('うさ',-19,-24)}],
  carrot:[40,40,(c,o)=>{poly(c,[[-6,-14],[6,-14],[0,4]]);FS(c,'#f28b2f');for(const a of[-.5,0,.5]){c.save();c.translate(0,-14);c.rotate(a);ell(c,0,-9,3.4,9);FS(c,'#4cad62');c.restore()}}],
  usu:[70,60,(c,o)=>{rr(c,-26,-40,52,40,10);FS(c,'#b0784a');ell(c,0,-40,26,8);FS(c,'#8a5a38');ell(c,0,-42,18,5);FS(c,'#fff');c.lineWidth=5;line(c,30,-70,8,-44);ink(c);rr(c,22,-86,26,16,5);FS(c,'#c48a5a')}],
  sanbo:[50,70,(c,o)=>{rr(c,-20,-20,40,20,3);FS(c,'#e8c88a');rr(c,-24,-24,48,6,2);FS(c,'#d9b26f');for(let r=0;r<4;r++)for(let i=0;i<4-r;i++){circ(c,-12+i*8+r*4,-30-r*7,4.4);FS(c,'#fff')}}],
  susuki:[60,110,(c,o)=>{for(let i=0;i<5;i++){const a=-.4+i*.2;c.save();c.rotate(a);c.lineWidth=1.6;line(c,0,0,0,-90);ink(c);ell(c,0,-92,4,14);FS(c,'#efe2b8');c.restore()}}],
  lollipop:[50,120,(c,o)=>{rr(c,-2.5,-80,5,80,2);FS(c,'#fff');circ(c,0,-96,22);FS(c,o.col||'#ff8cc0');c.lineWidth=5;c.strokeStyle='#fff';c.beginPath();for(let a=0;a<12;a+=.3){const r=a*1.6;c.lineTo(Math.cos(a)*r,-96+Math.sin(a)*r)}c.stroke();ink(c)}],
  candycane:[50,120,(c,o)=>{c.lineWidth=13;c.strokeStyle=LN;const p=()=>{c.beginPath();c.moveTo(0,0);c.lineTo(0,-80);c.arc(-14,-80,14,0,Math.PI,true);c.stroke()};p();c.lineWidth=10;c.strokeStyle='#fff';p();c.lineWidth=10;c.strokeStyle='#e8504a';c.setLineDash([8,8]);p();c.setLineDash([]);ink(c)}],
  cupcake:[70,80,(c,o)=>{poly(c,[[-24,-32],[24,-32],[18,0],[-18,0]]);FS(c,o.col||'#f6c0d8');for(const x of[-14,-4,6,16]){c.lineWidth=1;line(c,x*.9,-30,x*.8,-2);ink(c)}for(const[x,y,r]of[[-14,-38,13],[14,-38,13],[0,-46,16],[0,-62,9]]){circ(c,x,y,r);FS(c,'#fff6f0')}circ(c,0,-72,6);FS(c,'#e8504a');speckle2(c)}],
  cookiehouse:[160,150,(c,o)=>{rr(c,-62,-90,124,90,6);FS(c,'#c98a4a');poly(c,[[-76,-86],[0,-146],[76,-86]]);FS(c,'#fff6f0');poly(c,[[-66,-90],[0,-138],[66,-90]]);FS(c,'#a86a3a');for(let i=0;i<5;i++){circ(c,-48+i*24,-92,6);FS(c,['#e8504a','#4cad62','#f6c63a','#3f7bd6','#f28fb7'][i])}
    rr(c,-16,-50,32,50,14);FS(c,'#7a4a2a');for(const x of[-44,30]){rr(c,x,-70,22,22,4);FS(c,'#fff6b0');c.lineWidth=1;line(c,x+11,-70,x+11,-48);line(c,x,-59,x+22,-59);ink(c)}}],
  gumdrop:[40,36,(c,o)=>{c.beginPath();c.moveTo(-16,0);c.quadraticCurveTo(-18,-30,0,-30);c.quadraticCurveTo(18,-30,16,0);c.closePath();FS(c,o.col||'#7fd6b4');speckle2(c)}],
});
function speckle2(c){c.fillStyle='rgba(255,255,255,.8)';for(let i=0;i<5;i++){c.fillRect(-10+i*5,-20-(i%2)*8,2,4)}}
const RABBIT_COLS=['#fbfbff','#e8d8c8','#a8805a','#9fa4ab','#3b3533','#f3e1b5'];

// S1 ----------------------------------------------------------------
STAGES.push({id:'usagi',secret:true,name:'うさぎの もり',intro:'ここは うさぎが いっぱいの ひみつの もり！ うさみみの ひとも たくさん いるよ。',
  music:{tempo:124,scale:'major',wave:'triangle',seed:121,root:587.33},people:190,decoys:10,walkers:.12,
  geo(w){w.fields=[{x0:120,y0:200,x1:620,y1:420},{x0:1700,y0:1180,x1:2260,y1:1430},{x0:1650,y0:220,x1:2150,y1:420}]},
  walk(x,y,w){if(y<80)return null;for(const f of w.fields)if(x>f.x0&&x<f.x1&&y>f.y0&&y<f.y1)return 'field';return 'land'},
  bg(c,w){bgFill(c,'#bfe59e');tufts(c,0,0,WW,WH,'#a5d684',1300);speckle(c,0,0,WW,WH,['#fff','#ffd6e4','#fff3a0','#d8c8ff'],700,2.6);
    pathStroke(c,[[-40,700],[500,640],[1000,760],[1500,700],[2000,800],[2440,760]],110,'#ecdcb4','#dcc79c');pathStroke(c,[[1200,-40],[1150,400],[1000,760],[1050,1200],[980,1640]],100,'#ecdcb4','#dcc79c');
    for(const f of w.fields){c.fillStyle='#8a6a48';rr(c,f.x0,f.y0,f.x1-f.x0,f.y1-f.y0,14);c.fill();for(let y=f.y0+24;y<f.y1;y+=34)for(let x=f.x0+18;x<f.x1-10;x+=26){c.fillStyle='#f28b2f';poly(c,[[x-4,y],[x+4,y],[x,y+9]]);c.fill();c.fillStyle='#4cad62';for(const a of[-.5,0,.5]){ell(c,x+Math.sin(a)*5,y-6,2.6,7,a);c.fill()}}}
    ink(c)},
  layout(L,w){scatter(L,w,'tree',10,[60,120,2340,1580],()=>({col:'#86c878'}),280);scatter(L,w,'burrow',9,[80,150,2320,1560],{},260);
    scatter(L,w,'bush',14,[60,120,2340,1580],()=>({flower:pick(['#f28fb7','#fff','#c79bff'])}),160);scatter(L,w,'mushroom',8,[60,150,2340,1580],()=>({col:pick(['#e8504a','#f28fb7'])}),180);
    scatter(L,w,'carrot',20,[60,150,2340,1580],{},90);L.prop('sign',1180,640,{text:'うさぎの もり'})},
  look(){return mobLook({tops:[['shirt',3],['dress',1.4],['coat',.4]],hats:[['usamimi',2],[null,3],['straw',.6],['bow',.6],['flowercrown',.8]],hatCols:['#fbfbff','#f3e1b5','#a9a3b8','#ffd0e4'],acc:[['balloon',.05],['basket',0]],fix:o=>{if(o.hat==='flowercrown')o.hatCol=null}})},
  animals:[['rabbit',100],['rabbit',45,'field']],hide:{p:.5,props:['bush','burrow','mushroom']},lines:['うさぎ かわいい〜','ニンジン どうぞ！'],
  party:{fx:['petals','balloons'],text:'うさぎたちが いっせいに ジャンプ！'}
});
// S2 ----------------------------------------------------------------
STAGES.push({id:'otsukimi',secret:true,name:'おつきみ うさぎの おもちつき',intro:'まんまるの おつきさまの よる。うさぎたちが おもちを ついているよ。',
  music:{tempo:92,scale:'japan',wave:'sine',seed:131,root:523.25},people:180,decoys:12,walkers:.1,
  walk(x,y){if(y<430)return null;return 'land'},
  bg(c,w){grad(c,0,440,['#0f1636','#24305e']);speckle(c,0,0,WW,420,['#fff','#fff6b0'],220,1.6);
    const g=c.createRadialGradient(1200,200,60,1200,200,260);g.addColorStop(0,'rgba(255,240,180,.5)');g.addColorStop(1,'rgba(255,240,180,0)');c.fillStyle=g;c.fillRect(900,-60,600,520);
    c.fillStyle='#fff3c4';circ(c,1200,200,150);c.fill();c.fillStyle='rgba(220,200,140,.55)';ell(c,1160,190,40,26,-.3);c.fill();ell(c,1190,150,14,34,-.2);c.fill();ell(c,1215,150,12,32,.2);c.fill();ell(c,1250,235,30,18);c.fill();
    c.fillStyle='#1c2a3c';for(let i=0;i<16;i++){circ(c,i*170,440,rnd(60,110));c.fill()}
    grad(c,430,WH,['#33503e','#3f5e45']);speckle(c,0,440,WW,1160,['#4a6e52','#2c4434'],900,3);ink(c)},
  over(c,t,w){for(const s of w.lan||[]){const g=c.createRadialGradient(s.x,s.y,4,s.x,s.y,70);g.addColorStop(0,'rgba(255,200,130,.35)');g.addColorStop(1,'rgba(255,200,130,0)');c.fillStyle=g;c.fillRect(s.x-70,s.y-70,140,140)}
    for(let i=0;i<30;i++){const x=(i*197+Math.sin(t+i)*40)%WW,y=460+(i*131)%1100+Math.sin(t*1.3+i)*20;circ(c,x,y,3);c.fillStyle='rgba(220,255,140,'+(.5+.5*Math.sin(t*3+i))+')';c.fill()}},
  layout(L,w){w.lan=[];for(let i=0;i<6;i++){const x=250+i*380+rnd(-40,40),y=rnd(600,1450);L.prop('usu',x,y)}
    scatter(L,w,'sanbo',8,[100,480,2300,1560],{},220);scatter(L,w,'susuki',26,[40,450,2360,1590],()=>({s:rnd(.8,1.2)}),120);
    for(let i=0;i<7;i++){const x=180+i*340,y=i%2?820:1280;L.prop('lanternpole',x,y,{lit:true});w.lan.push({x:x-20,y:y-114},{x:x+20,y:y-114})}},
  look(){return mobLook({tops:[['yukata',5],['shirt',1]],hats:[[null,4],['usamimi',1.4],['flower',.6]],hatCols:['#fbfbff','#f3e1b5','#ffd0e4'],acc:[['fan',.15],['cotton',.05]],fix:o=>{if(o.hat==='flower'&&!o.fem)o.hat=null}})},
  family:{futan:{top:'yukata',topCol:FUTAN_PINK,obi:'#ffd23f'},mama:{top:'yukata',topCol:'#e8483a',obi:'#fff',apron:false},papa:{top:'happi',topCol:'#2f5fa8',botCol:'#3b3533'}},
  decoyFix:o=>{if(o.top==='dress')o.top='yukata'},
  animals:[['rabbit',70]],hide:{p:.5,props:['susuki','sanbo']},lines:['おつきさま きれい','ぺったん ぺったん！'],
  party:{fx:['fireworks','stars'],text:'おつきさまの したで おおきな はなび！'}
});
// S3 ----------------------------------------------------------------
STAGES.push({id:'okashi',secret:true,name:'おかしの くに',intro:'なにもかも おかしで できた あまい くに！ チョコの かわに きを つけて。',
  music:{tempo:128,scale:'major',wave:'square',seed:141,root:659.25,beat:3200},people:200,decoys:12,walkers:.14,
  geo(w){w.river=[[-60,820],[500,760],[900,900],[1300,820],[1800,920],[2460,860]]},
  walk(x,y,w){if(y<300)return null;const r=w.river;for(let i=0;i<r.length-1;i++){const a=r[i],b=r[i+1];if(x>=a[0]&&x<=b[0]){const ry=a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);if(Math.abs(y-ry)<70)return 'water'}}return 'land'},
  bg(c,w){grad(c,0,320,['#ffd6ec','#fff0f8']);cloud(c,300,120,1.4,'#ffffff');cloud(c,1300,90,1.1,'#fff6fb');cloud(c,2100,140,1.3,'#ffffff');
    c.fillStyle='#f7b2d2';for(let i=0;i<6;i++){c.beginPath();c.arc(i*480+120,330,200,Math.PI,0);c.fill()}
    grad(c,300,WH,['#ffe2ee','#ffd2e4']);speckle(c,0,320,WW,1280,['#ff6f9f','#7cc8ec','#f6c63a','#7fd6b4','#c79bff','#fff'],1600,2.4);
    pathStroke(c,w.river,150,'#8a5a3a','#6d4428');c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=4;for(let i=0;i<30;i++){const x=R()*WW;line(c,x-18,860+rnd(-60,60),x+18,860+rnd(-60,60))}
    pathStroke(c,[[1200,320],[1150,860],[1220,1640]],120,'#fff8fb','#f3d8e6');ink(c)},
  layout(L,w){scatter(L,w,'lollipop',12,[60,360,2340,1580],()=>({col:pick(['#ff8cc0','#7cc8ec','#f6c63a','#7fd6b4','#c79bff'])}),180);scatter(L,w,'candycane',10,[60,360,2340,1580],{},180);
    scatter(L,w,'cupcake',9,[60,360,2340,1580],()=>({col:pick(['#f6c0d8','#c8e8ff','#fff0b0'])}),200);scatter(L,w,'gumdrop',16,[60,360,2340,1580],()=>({col:pick(['#ff8cc0','#7cc8ec','#f6c63a','#7fd6b4','#c79bff'])}),120);
    L.prop('cookiehouse',400,560);L.prop('cookiehouse',1950,1350);L.prop('cookiehouse',2150,560,{s:.8})},
  look(){return mobLook({tops:[['shirt',3],['dress',1.6]],hats:[[null,4],['party',1.2],['chef',.4],['bow',.8]],acc:[['cotton',.12],['ice',.12],['balloon',.08]]})},
  animals:[['rabbit',16]],hide:{p:.5,props:['cupcake','gumdrop','lollipop']},lines:['あま〜い！','おなか いっぱい'],
  party:{fx:['confetti','balloons'],text:'おかしの あめが ふってきた！'}
});
const MAIN_STAGES=STAGES.filter(s=>!s.secret).length;

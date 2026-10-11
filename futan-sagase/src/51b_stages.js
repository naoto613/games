// ---- ステージ 11〜13 ----
Object.assign(PROPS,{
  undotent:[150,110,(c,o)=>{const col=o.col||'#3f7bd6';for(const x of[-66,62])rr(c,x,-84,4,84,1),FS(c,'#c7ccd4');rr(c,-72,-98,144,18,4);FS(c,col);for(let i=0;i<8;i++){rr(c,-72+i*18,-82,18,10,0);F(c,i%2?'#fff':col)}rr(c,-72,-98,144,28,4);c.stroke();
    if(o.text){rr(c,-34,-96,68,14,3);FS(c,'#fff');c.fillStyle=LN;c.font='900 10px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText(o.text,0,-89)}}],
  tamaire:[60,170,(c,o)=>{rr(c,-3,-140,6,140,2);FS(c,'#c7ccd4');c.beginPath();c.moveTo(-18,-160);c.lineTo(18,-160);c.lineTo(12,-130);c.lineTo(-12,-130);c.closePath();FS(c,'#f7f4ee');for(let i=0;i<5;i++){circ(c,-10+i*5,-158+(i%2)*3,3.4);FS(c,i%2?'#e8504a':'#fff')}}],
  ballpile:[50,20,(c,o)=>{for(let i=0;i<9;i++){circ(c,-16+(i%5)*8,-4-Math.floor(i/5)*6,3.6);FS(c,o.col||'#e8504a')}}],
  pumpkin:[60,50,(c,o)=>{const s=o.big?1.5:1;c.scale(s,s);for(const x of[-12,0,12]){ell(c,x,-16,11,15);FS(c,'#f28b2f')}rr(c,-3,-34,6,8,2);FS(c,'#4cad62');
    poly(c,[[-11,-20],[-5,-20],[-8,-26]]);F(c,'#3b2a10');poly(c,[[5,-20],[11,-20],[8,-26]]);F(c,'#3b2a10');c.beginPath();c.moveTo(-10,-12);c.lineTo(10,-12);c.lineTo(6,-6);c.lineTo(2,-10);c.lineTo(-2,-6);c.lineTo(-6,-10);c.closePath();F(c,o.lit?'#ffe08a':'#3b2a10')}],
  grave:[50,60,(c,o)=>{c.beginPath();c.moveTo(-18,0);c.lineTo(-18,-34);c.arc(0,-34,18,Math.PI,0);c.lineTo(18,0);c.closePath();FS(c,'#a9a3b8');c.fillStyle=LN;c.font='900 11px sans-serif';c.textAlign='center';c.fillText('BOO',0,-30);ell(c,0,0,24,5);F(c,'#5a4a6a')}],
  spookytree:[120,170,(c,o)=>{c.lineWidth=12;c.strokeStyle=LN;const br=()=>{c.beginPath();c.moveTo(0,0);c.lineTo(0,-90);c.lineTo(-40,-140);c.moveTo(0,-90);c.lineTo(36,-150);c.moveTo(-20,-115);c.lineTo(-52,-118);c.moveTo(18,-120);c.lineTo(50,-112);c.stroke()};br();c.lineWidth=8;c.strokeStyle='#5a4a62';br();ink(c)}],
  car:[130,70,(c,o)=>{const col=o.col||'#f6c63a';rr(c,-58,-40,116,30,10);FS(c,col);c.beginPath();c.moveTo(-34,-40);c.lineTo(-24,-62);c.lineTo(26,-62);c.lineTo(38,-40);c.closePath();FS(c,col);rr(c,-26,-58,22,16,3);FS(c,'#cfe8f5');rr(c,2,-58,24,16,3);FS(c,'#cfe8f5');
    for(const x of[-34,34]){circ(c,x,-10,11);FS(c,'#3b3533');circ(c,x,-10,4);F(c,'#c7ccd4')}if(o.taxi){rr(c,-12,-72,24,10,3);FS(c,'#fff');c.fillStyle=LN;c.font='900 8px sans-serif';c.textAlign='center';c.fillText('TAXI',0,-64)}}],
  bus:[230,110,(c,o)=>{rr(c,-110,-96,220,82,14);FS(c,o.col||'#4cad62');rr(c,-110,-40,220,10,0);F(c,'#fff');for(let i=0;i<6;i++){rr(c,-98+i*34,-86,26,30,4);FS(c,'#cfe8f5')}for(const x of[-70,70]){circ(c,x,-14,16);FS(c,'#3b3533');circ(c,x,-14,6);F(c,'#c7ccd4')}}],
  busstop:[40,110,(c,o)=>{rr(c,-3,-90,6,90,2);FS(c,'#9fa4ab');circ(c,0,-96,16);FS(c,'#e8504a');c.fillStyle='#fff';c.font='900 10px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('バス',0,-96)}],
});
// 11 ----------------------------------------------------------------
STAGES.push({id:'undokai',name:'がっこうの うんどうかい',intro:'あかぐみ しろぐみ がんばれ！ おうえんの ひとで いっぱいの うんどうかい。',
  music:{tempo:140,scale:'major',wave:'square',seed:151,root:587.33,beat:2600},people:230,decoys:12,walkers:.1,
  geo(w){w.track={x:1200,y:1000,rx:720,ry:330}},
  walk(x,y){if(y<360)return null;return 'land'},
  bg(c,w){grad(c,0,360,['#9fd6f5','#dff3fc']);cloud(c,400,80,1.1);cloud(c,1800,110,1.3);
    ink(c,3);c.fillStyle='#f3e8d8';c.fillRect(500,120,1400,250);c.strokeRect(500,120,1400,250);for(let r=0;r<3;r++)for(let i=0;i<12;i++){rr(c,540+i*112,150+r*70,70,46,4);FS(c,'#cfe8f5')}
    rr(c,1150,40,100,90,8);FS(c,'#f3e8d8');circ(c,1200,85,30);FS(c,'#fff');line(c,1200,85,1200,65);line(c,1200,85,1215,92);
    grad(c,360,WH,['#e2c9a0','#d9bd90']);speckle(c,0,360,WW,1240,['#cfb185','#ead7b0'],1200,2);
    const t=w.track;c.strokeStyle='#fff';c.lineWidth=10;for(let i=0;i<4;i++){ell(c,t.x,t.y,t.rx-i*46,t.ry-i*40);c.stroke()}
    c.lineWidth=6;line(c,t.x,t.y+t.ry-150,t.x,t.y+t.ry+10);ink(c);
    for(let r=0;r<2;r++){const y=420+r*20;c.strokeStyle=LN;c.lineWidth=2;c.beginPath();c.moveTo(0,y);c.quadraticCurveTo(WW/2,y+60,WW,y);c.stroke();for(let i=0;i<40;i++){const x=i*62+20,yy=y+Math.sin(i/40*Math.PI)*45;c.fillStyle=['#e8504a','#3f7bd6','#f6c63a','#4cad62','#fff'][i%5];poly(c,[[x,yy],[x+28,yy],[x+14,yy+26]]);c.fill();c.stroke()}}
    ink(c)},
  layout(L,w){const tents=[['#e8504a','あかぐみ'],['#f7f4ee','しろぐみ'],['#3f7bd6','ほんぶ'],['#4cad62','きゅうご'],['#f28b2f','PTA']];
    tents.forEach(([col,text],i)=>L.prop('undotent',260+i*470,560,{col,text}));
    L.prop('tamaire',1050,1000);L.prop('tamaire',1350,1000);scatter(L,w,'ballpile',10,[700,800,1700,1200],()=>({col:pick(['#e8504a','#f7f4ee'])}),120);
    for(let i=0;i<4;i++)L.prop('undotent',200+i*660,1560,{col:pick(['#e8504a','#3f7bd6','#f6c63a']),s:.9})},
  look(){return mobLook({age:[['kid',.55],['adult',.35],['elder',.1]],tops:[['shirt',4],['dress',.6]],topsKid:[['shirt',1]],hats:[[null,3],['cap',3],['hachimaki',1.2],['sunhat',.6]],acc:[['camera',.08],['flag',.06],['bag',.06]],
    fix:o=>{if(o.age==='kid'){o.topCol='#f7f4ee';o.botCol=pick(['#2f4078','#e8504a']);o.hat=pick(['cap','hachimaki']);o.hatCol=pick(['#e8504a','#f7f4ee']);o.short=true}}})},
  animals:[['bird',8],['dog',3]],hide:{p:.5,props:['ballpile','undotent']},lines:['がんばれ〜！','いちばん とるぞ！'],
  party:{fx:['confetti','balloons'],text:'みんなで ばんざい！'}
});
// 12 ----------------------------------------------------------------
STAGES.push({id:'halloween',name:'ハロウィンの よる',intro:'みんな かそうして おかしを もらいに いくよ。トリック オア トリート！',
  music:{tempo:108,scale:'minor',wave:'triangle',seed:161,root:493.88},people:220,decoys:14,walkers:.14,
  walk(x,y){if(y<380)return null;return 'land'},
  bg(c,w){grad(c,0,400,['#2a1840','#5a2e62']);speckle(c,0,0,WW,360,['#fff','#ffd6f0'],160,1.6);c.fillStyle='#ffe9a8';circ(c,1900,130,80);c.fill();
    c.fillStyle='#1e1230';for(const[x,h,wd]of[[200,170,220],[520,220,200],[900,180,260],[1300,240,220],[1650,200,240],[2150,230,260]]){c.fillRect(x-wd/2,400-h,wd,h);poly(c,[[x-wd/2-20,400-h],[x,400-h-90],[x+wd/2+20,400-h]]);c.fill()}
    c.fillStyle='#ffd06a';for(let i=0;i<22;i++){c.fillRect(120+i*104,300-((i*37)%90),16,22)}
    grad(c,380,WH,['#4a3640','#3e2c38']);pathStroke(c,[[-40,900],[600,820],[1200,920],[1800,840],[2440,920]],160,'#7a5a52','#5e4440');speckle(c,0,400,WW,1200,['#5a4450','#33242e'],800,3);ink(c)},
  under(c,t){for(let i=0;i<8;i++){const x=(i*317+t*60)%2600-100,y=80+(i*53)%220+Math.sin(t*3+i)*20;c.fillStyle='#1e1230';c.save();c.translate(x,y);const f=Math.sin(t*12+i)*.5;ell(c,0,0,8,6);c.fill();for(const s of[-1,1]){c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(s*16,-14-f*10,s*28,-2);c.quadraticCurveTo(s*18,2,s*10,4);c.fill()}c.restore()}},
  over(c,t,w){for(const s of w.lan||[]){const g=c.createRadialGradient(s.x,s.y,4,s.x,s.y,60);g.addColorStop(0,'rgba(255,170,80,.35)');g.addColorStop(1,'rgba(255,170,80,0)');c.fillStyle=g;c.fillRect(s.x-60,s.y-60,120,120)}},
  layout(L,w){w.lan=[];scatter(L,w,'spookytree',8,[60,420,2340,1580],{},300);scatter(L,w,'grave',10,[60,420,2340,1580],{},180);
    for(let i=0;i<22;i++){const x=rnd(80,2320),y=rnd(440,1580);if(w.st.walk(x,y)!=='land')continue;L.prop('pumpkin',x,y,{lit:true,big:chance(.3)});w.lan.push({x,y:y-18})}
    L.prop('stall',700,520,{col:'#8d5cc8',sign:'おかし'});L.prop('stall',1700,1500,{col:'#f28b2f',sign:'かぼちゃパイ'})},
  look(){return mobLook({tops:[['robe',1.4],['ninja',.8],['dinosuit',.6],['usagisuit',.5],['knight',.6],['princess',.7],['shirt',1]],hats:[['witch',1.6],['nekomimi',1],['usamimi',.6],[null,1],['dinohood',.4]],acc:[['cape',.12],['wings',.06]],
    fix:o=>{if(o.top==='robe')o.topCol=pick(['#8d5cc8','#3b3533','#2f4078']);if(o.top==='dinosuit'){o.topCol='#7cc86a';o.legCol='#7cc86a';o.hat='dinohood';o.hatCol='#7cc86a'}if(o.top==='usagisuit'){o.topCol='#fbfbff';o.legCol='#fbfbff';o.hat='usahood';o.hatCol='#fbfbff'}if(o.top==='ninja')o.legCol=o.topCol;if(o.hat==='witch')o.hatCol=pick(['#6a3fa0','#3b3533','#2f4078']);if(o.hat==='nekomimi')o.hatCol=pick(['#3b3533','#f7f4ee','#f28b2f']);if(o.acc.cape)o.acc.cape=pick(['#c9433a','#3b3533']);if(o.acc.wings)o.acc.wings='#fff';if(o.top==='princess')o.topCol=pick(['#c79bff','#7cc8ec','#f6e27a'])}})},
  animals:[['cat',10]],hide:{p:.55,props:['pumpkin','grave','spookytree']},lines:['トリック オア トリート！','おかし ちょうだい！','がおー！'],
  party:{fx:['stars','confetti'],text:'おばけかぼちゃが わらいだした！'}
});
// 13 ----------------------------------------------------------------
STAGES.push({id:'eki',name:'えきまえの ひろば',intro:'でんしゃが はしる えきまえ。バスや タクシーも いっぱい！',
  music:{tempo:118,scale:'lydian',wave:'triangle',seed:171,root:523.25,beat:3400},people:240,decoys:12,walkers:.2,
  geo(w){w.road={y0:1180,y1:1380}},
  walk(x,y,w){if(y<430)return null;if(y>w.road.y0&&y<w.road.y1&&!(x>1100&&x<1300))return null;return 'land'},
  bg(c,w){grad(c,0,300,['#bfe3f7','#eaf6ff']);ink(c,3);
    c.fillStyle='#c9b8a2';c.fillRect(0,250,WW,60);c.strokeRect(-10,250,WW+20,60);for(let x=40;x<WW;x+=160){c.fillStyle='#a8957a';c.fillRect(x,310,30,120);c.strokeRect(x,310,30,120)}
    c.fillStyle='#f3e8d8';c.fillRect(800,320,800,140);c.strokeRect(800,320,800,140);c.fillStyle='#3f7bd6';c.fillRect(800,320,800,30);c.fillStyle='#fff';c.font='900 26px sans-serif';c.textAlign='center';c.fillText('ふーたん えき',1200,344);
    for(let i=0;i<5;i++){rr(c,840+i*150,370,110,90,6);FS(c,'#cfe8f5')}
    grad(c,430,WH,['#e8e2d6','#ddd6c8']);for(let i=0;i<WW/80;i++)for(let j=0;j<15;j++)if((i+j)%2){c.fillStyle='rgba(0,0,0,.025)';c.fillRect(i*80,430+j*80,80,80)}
    const r=w.road;c.fillStyle='#6d6a70';c.fillRect(0,r.y0,WW,r.y1-r.y0);c.strokeStyle='#fff';c.lineWidth=6;c.setLineDash([60,40]);line(c,0,(r.y0+r.y1)/2,WW,(r.y0+r.y1)/2);c.setLineDash([]);
    c.fillStyle='#fff';for(let i=0;i<8;i++)c.fillRect(1105+i*25,r.y0+6,14,r.y1-r.y0-12);
    for(const x of[150,600,1700,2200]){c.fillStyle='#f3e8d8';c.fillRect(x-150,440,300,90);c.strokeRect(x-150,440,300,90)}ink(c)},
  under(c,t){const x=((t*160)%3400)-900;c.save();c.translate(x,250);ink(c,3);for(let i=0;i<5;i++){rr(c,i*170,-70,160,66,12);FS(c,i?'#f7f4ee':'#e8504a');rr(c,i*170,-30,160,8,0);F(c,'#3f7bd6');for(let j=0;j<3;j++){rr(c,i*170+14+j*48,-60,36,24,4);FS(c,'#cfe8f5')}}c.restore()},
  layout(L,w){L.prop('bus',500,1300,{col:'#4cad62'});L.prop('bus',2000,1340,{col:'#3f7bd6',flip:true});for(const x of[900,1500,1800])L.prop('car',x,chance(.5)?1260:1360,{col:'#f6c63a',taxi:true,flip:chance(.5)});
    L.prop('busstop',300,1170);L.prop('busstop',1900,1170);scatter(L,w,'lamp',8,[60,560,2340,1580],{},280);scatter(L,w,'tree',6,[60,1420,2340,1580],{},300);scatter(L,w,'bench',6,[60,560,2340,1150],{},250);
    L.prop('stall',300,700,{col:'#e8504a',sign:'えきべん'});L.prop('stall',2100,700,{col:'#f28b2f',sign:'おみやげ'});L.prop('sign',1200,620,{text:'まちあわせ'})},
  look(){return mobLook({tops:[['suit',1.4],['shirt',2],['coat',1.2],['dress',1]],hats:[[null,5],['cap',.6],['beret',.5],['sunhat',.4]],acc:[['bag',.25],['backpack',.15],['parasol',.03]],fix:o=>{if(o.top==='suit'){o.topCol=pick(['#2f4078','#3b3533','#5a6b7a','#7a5a42']);o.botCol=o.topCol;o.tie=pick(['#e8504a','#f6c63a','#4cad62'])}}})},
  animals:[['bird',14]],hide:{p:.5,props:['bench','busstop','lamp']},lines:['でんしゃに のりおくれる〜！','バス まだかな'],
  party:{fx:['balloons','confetti'],text:'でんしゃも バスも おまつりパレード！'}
});

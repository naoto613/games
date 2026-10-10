// ---- more props used by later stages ----
Object.assign(PROPS,{
  boat:[130,80,(c,o)=>{c.lineWidth=2;line(c,6,-30,6,-78);ink(c);poly(c,[[8,-76],[44,-36],[8,-34]]);FS(c,'#fff');c.beginPath();c.moveTo(-56,-30);c.lineTo(56,-30);c.lineTo(40,-8);c.lineTo(-40,-8);c.closePath();FS(c,o.col||'#e8504a');rr(c,-56,-34,112,6,2);FS(c,'#fff')}],
  yagura:[260,300,(c,o)=>{for(const x of[-100,-36,36,100]){rr(c,x-6,-200,12,200,2);FS(c,'#a8703f')}rr(c,-120,-206,240,22,4);FS(c,'#c9433a');rr(c,-120,-206,240,8,2);F(c,'#fff');
    for(let i=0;i<6;i++){c.lineWidth=2;line(c,-100+i*40,-120,-60+i*40,-60);ink(c)}rr(c,-112,-226,224,20,4);FS(c,'#f3e1b5');
    c.beginPath();c.moveTo(-130,-226);c.lineTo(130,-226);c.lineTo(80,-268);c.lineTo(-80,-268);c.closePath();FS(c,'#6d5546');
    for(let i=0;i<7;i++){ell(c,-108+i*36,-188,9,12);FS(c,'#ff8a5c')}rr(c,-30,-262,60,30,6);FS(c,'#c9433a');ell(c,-30,-247,6,15);FS(c,'#f3e1b5');ell(c,30,-247,6,15);FS(c,'#f3e1b5')}],
  torii:[260,230,(c,o)=>{for(const x of[-80,80]){rr(c,x-9,-200,18,200,3);FS(c,'#d8433a')}rr(c,-120,-206,240,18,6);FS(c,'#d8433a');rr(c,-130,-222,260,14,6);FS(c,'#3b3533');rr(c,-100,-170,200,12,3);FS(c,'#d8433a')}],
});
const darken=a=>`rgba(10,16,40,${a})`;

// 2 ----------------------------------------------------------------
STAGES.push({id:'beach',name:'なつの うみ',intro:'あおい うみと しろい すなはま。およいでる ひとも いるよ！',
  music:{tempo:120,scale:'lydian',wave:'triangle',seed:22,root:587.33},magic:'rainbow',people:240,decoys:8,walkers:.08,
  peopleOn:['land','swim'],futanSwim:true,
  walk(x,y){if(y<250)return null;if(y<700)return 'swim';if(y<800)return null;return 'land'},
  bg(c,w){grad(c,0,250,['#8fd2f4','#d9f2fc']);cloud(c,300,90,1.2);cloud(c,1100,60,.9);cloud(c,1900,110,1.3);
    c.fillStyle='#7cc074';c.beginPath();c.ellipse(1600,250,260,60,0,Math.PI,0);c.fill();c.fillStyle='#5fa85a';c.beginPath();c.ellipse(1680,250,120,40,0,Math.PI,0);c.fill();
    grad(c,240,780,['#3fa6d8','#6ccbec','#9fe0f4']);c.strokeStyle='rgba(255,255,255,.55)';c.lineWidth=3;for(let i=0;i<120;i++){const x=R()*WW,y=260+R()*480;c.beginPath();c.arc(x,y,14,Math.PI*1.15,Math.PI*1.85);c.stroke()}
    c.fillStyle='#f3dca8';c.fillRect(0,760,WW,WH-760);c.fillStyle='#fff';c.beginPath();c.moveTo(0,740);for(let x=0;x<=WW;x+=40)c.quadraticCurveTo(x+20,720+Math.sin(x*.02)*14,x+40,745+Math.sin(x*.013)*10);c.lineTo(WW,800);for(let x=WW;x>=0;x-=40)c.quadraticCurveTo(x-20,805,x-40,792+Math.sin(x*.017)*8);c.closePath();c.fill();
    speckle(c,0,800,WW,800,['#e6c98e','#fff3d6','#e0bf85'],900,2);
    for(let i=0;i<16;i++){const x=80+R()*2200,y=880+R()*620,col=pick(['#e8504a','#3f7bd6','#4cad62','#f28fb7','#f6c63a']);c.fillStyle=col;c.save();c.translate(x,y);c.rotate(rnd(-.2,.2));c.fillRect(0,0,60,90);c.fillStyle='#fff';for(let j=0;j<4;j++)c.fillRect(0,10+j*20,60,8);c.restore()}
    ink(c)},
  under(c,t){c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=3;for(let i=0;i<40;i++){const x=(i*173+t*30)%WW,y=270+(i*97)%420;c.beginPath();c.arc(x,y+Math.sin(t*2+i)*4,18,Math.PI*1.2,Math.PI*1.8);c.stroke()}ink(c)},
  layout(L,w){L.prop('boat',400,430,{col:'#e8504a'});L.prop('boat',2000,560,{col:'#3f7bd6',flip:true});L.prop('boat',1250,330,{col:'#f6c63a',s:.8});
    scatter(L,w,'parasol',18,[60,860,2340,1560],()=>({col:pick(['#e8504a','#3f7bd6','#4cad62','#f28fb7','#f28b2f','#8d5cc8'])}),170);
    L.prop('lifeguard',1200,880);scatter(L,w,'sandcastle',6,[100,900,2300,1550],{},200);
    for(const x of[60,2340])for(let i=0;i<3;i++)L.prop('palm',x+rnd(-20,20),900+i*260,{flip:x>1000});
    L.prop('stall',700,1500,{col:'#3f7bd6',sign:'かきごおり',goods:['#e8504a','#7cc8ec','#f6c63a']});L.prop('stall',1800,1480,{col:'#f28b2f',sign:'やきそば'})},
  look(){return mobLook({tops:[['swim',5],['shirt',1]],hats:[[null,4],['sunhat',1],['straw',1],['cap',1],['goggle',.4]],acc:[['ice',.06],['parasol',.03]],fix:o=>{o.short=true;if(o.top==='swim'&&o.age==='kid'&&chance(.4))o.acc.ring=pick(['#f6c63a','#e8504a','#f28fb7','#7fd6b4'])}})},
  family:{futan:{top:'swim',topCol:FUTAN_PINK},mama:{hat:'sunhat',hatCol:'#f7f4ee'},papa:{hat:'straw',hatCol:'#3f7bd6',short:true,acc:{glasses:true}}},
  decoyFix:o=>{if(o.top==='dress')o.top='swim'},
  animals:[['crab',10],['bird',8]],hide:{p:.4,props:['sandcastle','parasol']},lines:['うみ きもちいい〜','かにさん いたよ！']
});
// 3 ----------------------------------------------------------------
STAGES.push({id:'yuenchi',name:'ゆうがたの ゆうえんち',intro:'かんらんしゃが まわる ゆうえんち。ゆうやけで まちが オレンジいろ！',
  music:{tempo:132,scale:'major',wave:'square',seed:33,root:523.25,beat:3000},magic:'fireworks',people:270,decoys:10,walkers:.14,
  geo(w){w.wheel={x:1820,y:330,r:270};w.carou={x:620,y:900,rx:230,ry:110}},
  walk(x,y,w){if(y<590)return null;if(inEll(x,y,w.carou))return null;return 'land'},
  bg(c,w){grad(c,0,600,['#f39a6a','#f8c58e','#ffe6c2']);c.fillStyle='rgba(255,240,200,.9)';circ(c,1300,470,70);c.fill();
    c.strokeStyle='#8a5a6a';c.lineWidth=8;c.beginPath();c.moveTo(-20,520);c.bezierCurveTo(200,120,420,560,640,260);c.bezierCurveTo(760,100,900,420,1060,560);c.stroke();c.lineWidth=4;for(let x=40;x<1060;x+=60){line(c,x,600,x,330+Math.sin(x*.01)*120)}
    c.fillStyle='#e8504a';poly(c,[[1080,600],[1240,360],[1400,600]]);c.fill();c.fillStyle='#fff';for(let i=0;i<4;i++){poly(c,[[1080+i*80,600],[1240,360],[1120+i*80,600]]);c.fill()}
    c.fillStyle='#ecd9c6';c.fillRect(0,590,WW,WH-590);
    for(let i=0;i<WW/60;i++)for(let j=0;j<(WH-590)/60;j++){c.fillStyle=(i+j)%2?'#f1e2d2':'#e6d0bc';c.fillRect(i*60,590+j*60,60,60)}
    pathStroke(c,[[-20,1200],[600,1180],[1200,1250],[1800,1180],[2440,1260]],140,'#d9876a','#c97458');
    const k=w.carou;c.fillStyle='#c97458';ell(c,k.x,k.y+10,k.rx+10,k.ry+10);c.fill();c.fillStyle='#f6e0b0';ell(c,k.x,k.y,k.rx,k.ry);c.fill();
    ink(c)},
  under(c,t,w){const h=w.wheel;c.lineWidth=7;c.strokeStyle='#7a6a8a';line(c,h.x-110,600,h.x,h.y);line(c,h.x+110,600,h.x,h.y);ink(c,3);c.strokeStyle='#e7e0f0';circ(c,h.x,h.y,h.r);c.stroke();circ(c,h.x,h.y,h.r-14);c.stroke();
    const n=12,a0=t*.12;for(let i=0;i<n;i++){const a=a0+i/n*TAU;line(c,h.x,h.y,h.x+Math.cos(a)*h.r,h.y+Math.sin(a)*h.r)}
    for(let i=0;i<n;i++){const a=a0+i/n*TAU,x=h.x+Math.cos(a)*h.r,y=h.y+Math.sin(a)*h.r;rr(c,x-15,y,30,26,8);FS(c,['#e8504a','#f6c63a','#4cad62','#3f7bd6','#f28fb7','#8d5cc8'][i%6])}
    circ(c,h.x,h.y,16);FS(c,'#f6c63a');
    const k=w.carou;ink(c,2);for(let i=0;i<8;i++){const a=t*.6+i/8*TAU,x=k.x+Math.cos(a)*k.rx*.75,y=k.y+Math.sin(a)*k.ry*.6;line(c,x,y-80,x,y);rr(c,x-16,y-30-Math.sin(t*3+i)*8,32,18,8);FS(c,['#fff','#f28fb7','#7cc8ec','#f6c63a'][i%4])}
    c.fillStyle='#e8504a';c.beginPath();c.moveTo(k.x-k.rx-20,k.y-90);c.lineTo(k.x,k.y-190);c.lineTo(k.x+k.rx+20,k.y-90);c.closePath();c.fill();c.stroke();
    for(let i=0;i<6;i++){c.fillStyle='#fff';c.beginPath();c.moveTo(k.x-k.rx-20+i*(2*k.rx+40)/6,k.y-90);c.lineTo(k.x,k.y-190);c.lineTo(k.x-k.rx-20+(i+.5)*(2*k.rx+40)/6,k.y-90);c.closePath();c.fill()}},
  over(c,t){for(let i=0;i<60;i++){const x=i*41,y=640+Math.sin(i*.5)*24;const on=(Math.floor(t*3)+i)%3===0;circ(c,x,y,on?6:4);c.fillStyle=on?'#fff6b0':['#ff8a8a','#8ad0ff','#ffe08a'][i%3];c.fill()}},
  layout(L,w){scatter(L,w,'balloons',4,[200,700,2200,1500],{},400);scatter(L,w,'popcorn',4,[200,700,2200,1500],{},300);
    L.prop('stall',1150,760,{col:'#8d5cc8',sign:'ソフトクリーム',goods:['#fff','#f28fb7','#a8703f']});L.prop('stall',300,1480,{col:'#4cad62',sign:'ジュース'});L.prop('stall',2100,1500,{col:'#f28b2f',sign:'おみやげ'});
    scatter(L,w,'lamp',8,[100,650,2300,1550],{lit:true},260);scatter(L,w,'flag',6,[100,650,2300,1550],()=>({col:pick(['#e8504a','#3f7bd6','#f6c63a'])}),300);scatter(L,w,'bench',6,[100,700,2300,1550],{},260);
    for(let i=0;i<5;i++)L.prop('fence',w.carou.x-200+i*100,w.carou.y+w.carou.ry+30,{col:'#f6c63a'})},
  look(){return mobLook({tops:[['shirt',4],['dress',1.2]],hats:[[null,5],['cap',1],['party',.8],['beret',.4],['bow',.6]],acc:[['balloon',.14],['cotton',.08],['ice',.08],['camera',.05],['backpack',.06]]})},
  animals:[['bird',6]],hide:{p:.4,props:['popcorn','balloons','bench']},lines:['かんらんしゃ のりたい！','ジェットコースター こわかった〜']
});
// 4 ----------------------------------------------------------------
STAGES.push({id:'snow',name:'ゆきやまの スキーじょう',intro:'まっしろな ゆきやま。スキーや ゆきだるまづくりで おおにぎわい！',
  music:{tempo:96,scale:'lydian',wave:'sine',seed:44,root:659.25},magic:'aurora',people:240,decoys:10,walkers:.12,
  geo(w){w.rink={x:1650,y:1180,rx:300,ry:140};w.lodge={x0:150,y0:250,x1:620,y1:470}},
  walk(x,y,w){if(y<320)return null;if(x>w.lodge.x0&&x<w.lodge.x1&&y<w.lodge.y1)return null;return 'land'},
  bg(c,w){grad(c,0,330,['#9fd0f2','#e8f6ff']);
    for(const[x,h,wd]of[[200,240,420],[700,300,520],[1300,260,460],[1900,320,560],[2400,220,400]]){c.fillStyle='#c9dcef';poly(c,[[x-wd/2,330],[x,330-h],[x+wd/2,330]]);c.fill();c.fillStyle='#fff';poly(c,[[x-wd*.16,330-h*.68],[x,330-h],[x+wd*.16,330-h*.68],[x+wd*.06,330-h*.6],[x,330-h*.66],[x-wd*.07,330-h*.6]]);c.fill()}
    grad(c,320,WH,['#f2f8ff','#ffffff']);c.strokeStyle='rgba(150,190,230,.35)';c.lineWidth=5;for(let i=0;i<30;i++){const x=R()*WW;c.beginPath();c.moveTo(x,330);c.bezierCurveTo(x+rnd(-200,200),700,x+rnd(-300,300),1100,x+rnd(-400,400),WH);c.stroke()}
    const l=w.lodge;c.fillStyle='#a8703f';c.fillRect(l.x0+20,l.y0+80,l.x1-l.x0-40,l.y1-l.y0-80);ink(c,3);c.strokeRect(l.x0+20,l.y0+80,l.x1-l.x0-40,l.y1-l.y0-80);
    poly(c,[[l.x0-10,l.y0+90],[(l.x0+l.x1)/2,l.y0-10],[l.x1+10,l.y0+90]]);FS(c,'#8a4a3a');poly(c,[[l.x0-10,l.y0+90],[(l.x0+l.x1)/2,l.y0-10],[l.x1+10,l.y0+90],[l.x1-10,l.y0+70],[(l.x0+l.x1)/2,l.y0+8],[l.x0+10,l.y0+70]]);FS(c,'#fff');
    for(let i=0;i<3;i++){rr(c,l.x0+60+i*120,l.y0+130,70,60,6);FS(c,'#ffe08a')}rr(c,(l.x0+l.x1)/2-30,l.y1-90,60,90,6);FS(c,'#6d4a30');
    c.fillStyle='#fff';c.font='900 30px sans-serif';c.textAlign='center';c.fillText('ロッジ',(l.x0+l.x1)/2,l.y0+118);
    c.strokeStyle='#3b3533';c.lineWidth=3;line(c,1400,1560,2380,380);for(let i=0;i<6;i++){const k=i/5,x=1400+980*k,y=1560-1180*k;c.lineWidth=8;line(c,x,y+150,x,y);c.lineWidth=2;line(c,x+60,y-71,x+60,y-30);rr(c,x+40,y-30,40,16,4);FS(c,'#e8504a')}
    const k=w.rink;c.fillStyle='#9cc6dd';ell(c,k.x,k.y+8,k.rx+12,k.ry+10);c.fill();c.fillStyle='#d4eefa';ell(c,k.x,k.y,k.rx,k.ry);c.fill();c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=3;for(let i=0;i<10;i++){c.beginPath();c.ellipse(k.x+rnd(-100,100),k.y+rnd(-40,40),rnd(40,120),rnd(15,40),rnd(3),0,2);c.stroke()}
    ink(c)},
  over(c,t){c.fillStyle='rgba(255,255,255,.95)';for(let i=0;i<260;i++){const x=(i*97+Math.sin(t*.7+i)*30+t*20)%WW,y=(i*61+t*(40+i%5*12))%WH;circ(c,x,y,2+i%3);c.fill()}},
  layout(L,w){scatter(L,w,'pine',22,[40,340,2360,1580],()=>({snow:true,s:rnd(.8,1.2)}),170);scatter(L,w,'snowman',7,[100,500,2300,1550],()=>({col:pick(['#e8504a','#3f7bd6','#4cad62']),scarf:pick(['#f6c63a','#f28fb7','#e8504a'])}),220);
    L.prop('igloo',900,620);L.prop('igloo',2200,1500);scatter(L,w,'sled',7,[100,500,2300,1550],()=>({col:pick(['#e8504a','#3f7bd6','#f6c63a'])}),200);scatter(L,w,'flag',4,[200,500,2200,1300],()=>({col:pick(['#e8504a','#3f7bd6'])}),400)},
  look(){return mobLook({tops:[['ski',4],['coat',1]],hats:[['beanie',3],['goggle',1.4],[null,.5]],acc:[['scarf',.4]]})},
  family:{futan:{top:'ski',topCol:FUTAN_PINK,botCol:'#f7f4ee'},mama:{top:'coat',topCol:'#e8483a',acc:{scarf:'#fff'}},papa:{top:'coat',topCol:'#2f5fa8',botCol:'#3b3533'}},
  decoyFix:o=>{if(o.top==='dress')o.top='ski'},
  animals:[['rabbit',6],['bird',4]],hide:{p:.5,props:['snowman','sled','pine']},hideOpts:{},lines:['さむ〜い！','ゆきがっせん しよう！']
});
// 5 ----------------------------------------------------------------
STAGES.push({id:'matsuri',name:'よるの なつまつり',intro:'ちょうちんが ひかる よるの おまつり。ゆかたの ひとが いっぱい！',
  music:{tempo:100,scale:'japan',wave:'triangle',seed:55,root:440,beat:1500},magic:'fireworks',people:270,decoys:12,walkers:.14,
  walk(x,y){if(y<400)return null;return 'land'},
  bg(c,w){grad(c,0,420,['#141a3a','#2a3462']);speckle(c,0,0,WW,380,['#fff','#fff6b0'],140,1.6);c.fillStyle='#fff8d8';circ(c,2050,120,50);c.fill();
    c.fillStyle='#10162e';for(let i=0;i<14;i++){circ(c,i*190+rnd(-30,30),400,rnd(70,120));c.fill()}
    c.fillStyle='#3b2a2a';poly(c,[[960,410],[1200,250],[1440,410]]);c.fill();c.fillStyle='#5a3a30';c.fillRect(1000,380,400,60);
    grad(c,400,WH,['#4a3c3c','#5d4b44']);speckle(c,0,400,WW,1200,['#6d5a52','#3f3333'],900,2.2);
    ink(c)},
  over(c,t,w){for(const s of w.lan||[]){const g=c.createRadialGradient(s.x,s.y,4,s.x,s.y,70);g.addColorStop(0,'rgba(255,190,120,.35)');g.addColorStop(1,'rgba(255,190,120,0)');c.fillStyle=g;c.fillRect(s.x-70,s.y-70,140,140)}
    for(let r=0;r<2;r++){const y0=r?520:1060;c.strokeStyle='#3b2a2a';c.lineWidth=2;c.beginPath();c.moveTo(0,y0);for(let x=0;x<=WW;x+=120)c.quadraticCurveTo(x+60,y0+40,x+120,y0);c.stroke();
      for(let x=60;x<WW;x+=120){const y=y0+20;ell(c,x,y+14,11,15);c.fillStyle=(x/120|0)%2?'#ff8a5c':'#ffe08a';c.fill();const g=c.createRadialGradient(x,y+14,4,x,y+14,40);g.addColorStop(0,'rgba(255,200,120,.5)');g.addColorStop(1,'rgba(255,200,120,0)');c.fillStyle=g;c.fillRect(x-40,y-26,80,80)}}
    for(let i=0;i<24;i++){const x=(i*211+Math.sin(t+i)*40)%WW,y=450+(i*137)%1100+Math.sin(t*1.3+i)*20;circ(c,x,y,3);c.fillStyle='rgba(220,255,140,'+(.5+.5*Math.sin(t*3+i))+')';c.fill()}},
  layout(L,w){L.prop('torii',1200,470);L.prop('yagura',1200,1000);w.foot.push({x0:1060,x1:1340,y0:900,y1:1010});L.prop('taiko',1200,1040);
    const names=['りんごあめ','わたあめ','きんぎょすくい','やきそば','おめん','かきごおり','たこやき','ヨーヨー'];w.lan=[];
    for(let i=0;i<8;i++){const x=200+(i%4)*660+(i<4?0:300),y=i<4?560:1520;L.prop('stall',x,y,{col:pick(['#e8504a','#3f7bd6','#f6c63a','#4cad62','#f28fb7']),sign:names[i]});w.lan.push({x,y:y-110})}
    for(let i=0;i<8;i++){const x=150+i*300,y=i%2?1150:780;L.prop('lanternpole',x,y,{lit:true});w.lan.push({x:x-20,y:y-114},{x:x+20,y:y-114})}},
  look(){return mobLook({tops:[['yukata',5],['shirt',1]],hats:[[null,5],['hachimaki',.8],['flower',1]],acc:[['fan',.2],['cotton',.1],['flag',.03]],fix:o=>{if(o.hat==='flower'&&!o.fem)o.hat=null}})},
  family:{futan:{top:'yukata',topCol:FUTAN_PINK,obi:'#ffd23f'},mama:{top:'yukata',topCol:'#e8483a',obi:'#fff',apron:false},papa:{top:'happi',topCol:'#2f5fa8',botCol:'#3b3533'}},
  decoyFix:o=>{if(o.top==='dress')o.top='yukata'},
  animals:[['cat',3]],hide:{p:.4,props:['taiko','barrel']},lines:['たこやき おいしい！','はなび まだかな？']
});
// 6 ----------------------------------------------------------------
STAGES.push({id:'zoo',name:'にぎやか どうぶつえん',intro:'キリンや ゾウが いる どうぶつえん。どうぶつを みる ひとで いっぱい！',
  music:{tempo:120,scale:'major',wave:'triangle',seed:66,root:523.25,beat:2200},magic:'confetti',people:250,decoys:10,walkers:.14,
  geo(w){w.pens=[{x0:80,y0:100,x1:820,y1:560,g:'#e8d29a'},{x0:1580,y0:100,x1:2320,y1:560,g:'#ddd0a0'},{x0:80,y0:1120,x1:680,y1:1540,g:'#d9c49a'}];w.pool={x:1950,y:1300,rx:300,ry:180};w.mtn={x:1200,y:330,rx:270,ry:170}},
  walk(x,y,w){if(y<80)return null;for(const p of w.pens)if(x>p.x0&&x<p.x1&&y>p.y0&&y<p.y1)return null;if(inEll(x,y,w.pool))return inEll(x,y,{x:w.pool.x,y:w.pool.y,rx:w.pool.rx*.62,ry:w.pool.ry*.55})?'water':'peng';if(inEll(x,y,w.mtn))return 'monkey';return 'land'},
  bg(c,w){bgFill(c,'#b8dc96');tufts(c,0,0,WW,WH,'#9ccc7c',900);
    pathStroke(c,[[-40,800],[600,760],[1200,860],[1800,780],[2440,820]],200,'#efe0bf','#e2cfa6');pathStroke(c,[[1200,1640],[1150,1200],[1200,860],[1180,560]],170,'#efe0bf','#e2cfa6');
    for(const p of w.pens){c.fillStyle=p.g;rr(c,p.x0,p.y0,p.x1-p.x0,p.y1-p.y0,20);c.fill();speckle(c,p.x0,p.y0,p.x1-p.x0,p.y1-p.y0,['#cdb27a','#f3e2b5'],200,2.5);
      c.strokeStyle='#8a6a4a';c.lineWidth=5;c.strokeRect(p.x0,p.y0,p.x1-p.x0,p.y1-p.y0)}
    const m=w.mtn;c.fillStyle='#a8957a';ell(c,m.x,m.y,m.rx,m.ry);c.fill();c.fillStyle='#bba78a';ell(c,m.x-30,m.y-30,m.rx*.6,m.ry*.6);c.fill();ink(c,3);ell(c,m.x,m.y,m.rx,m.ry);c.stroke();
    const p=w.pool;c.fillStyle='#d9d4ca';ell(c,p.x,p.y,p.rx,p.ry);c.fill();c.fillStyle='#7fd0ec';ell(c,p.x,p.y,p.rx*.62,p.ry*.55);c.fill();c.strokeStyle='rgba(255,255,255,.7)';c.lineWidth=3;for(let i=0;i<8;i++){const x=p.x+rnd(-120,120),y=p.y+rnd(-60,60);line(c,x-14,y,x+14,y)}
    ink(c)},
  layout(L,w){L.prop('giraffe',300,480,{noFoot:true,s:1.5});L.prop('giraffe',620,380,{noFoot:true,flip:true,s:1.3});L.prop('elephant',1850,470,{noFoot:true,s:1.6});L.prop('elephant',2150,320,{noFoot:true,flip:true,s:1.2});
    L.prop('lion',300,1320,{noFoot:true,s:1.4});L.prop('lion',520,1480,{noFoot:true,flip:true,s:1.3});L.prop('rock',420,1220,{noFoot:true,s:1.6});L.prop('tree',720,180,{noFoot:true});
    for(const p of w.pens)for(let x=p.x0+60;x<p.x1;x+=100)L.prop('enclosure',x+40,p.y1+14,{s:.56,noFoot:true});
    L.prop('sign',900,610,{text:'キリン'});L.prop('sign',1520,610,{text:'ゾウ'});L.prop('sign',740,1100,{text:'ライオン'});L.prop('sign',1600,1180,{text:'ペンギン'});L.prop('sign',1000,560,{text:'おさる'});
    L.prop('stall',1500,1530,{col:'#f28fb7',sign:'アイス',goods:['#fff','#f28fb7','#a8703f']});scatter(L,w,'tree',10,[60,600,2340,1580],{},260);scatter(L,w,'bench',6,[100,600,2300,1550],{},250);scatter(L,w,'bush',8,[60,600,2340,1580],{},200)},
  look(){return mobLook({tops:[['shirt',4],['dress',1],['safari',.6]],hats:[[null,4],['cap',1.2],['safari',.6],['sunhat',.5],['bow',.4]],acc:[['camera',.08],['balloon',.08],['ice',.06],['backpack',.1]],fix:o=>{if(o.top==='safari'){o.topCol='#c8b07a';o.hat='safari'}}})},
  animals:[['penguin',12,'peng'],['monkey',9,'monkey'],['bird',8]],hide:{p:.45,props:['bush','bench','sign']},lines:['キリン おおきい〜！','ゾウさん みた？']
});
// 7 ----------------------------------------------------------------
STAGES.push({id:'sea',name:'うみの そこの たんけん',intro:'ふかい うみの そこ。ダイバーや にんぎょが あつまってるよ！',
  music:{tempo:84,scale:'whole',wave:'sine',seed:77,root:440},magic:'bubbles',people:220,decoys:10,walkers:.12,
  geo(w){w.ship={x0:180,y0:240,x1:900,y1:620}},
  walk(x,y,w){if(y<240)return null;const s=w.ship;if(x>s.x0&&x<s.x1&&y>s.y0&&y<s.y1)return null;return 'land'},
  bg(c,w){grad(c,0,WH,['#5cc4ec','#2f8fcc','#1f5e9e','#1c4f88']);
    c.fillStyle='#e9d6a6';c.beginPath();c.moveTo(0,1080);for(let x=0;x<=WW;x+=100)c.quadraticCurveTo(x+50,1040+Math.sin(x*.01)*40,x+100,1080+Math.sin(x*.007)*30);c.lineTo(WW,WH);c.lineTo(0,WH);c.closePath();c.fill();speckle(c,0,1080,WW,520,['#d8c08a','#fff0cc'],700,2.4);
    c.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<40;i++){ell(c,R()*WW,R()*1000,rnd(30,90),rnd(8,20));c.fill()}
    const s=w.ship;ink(c,3);c.fillStyle='#7a5a42';c.beginPath();c.moveTo(s.x0,s.y0+160);c.lineTo(s.x1,s.y0+120);c.lineTo(s.x1-80,s.y1);c.lineTo(s.x0+60,s.y1);c.closePath();c.fill();c.stroke();
    c.lineWidth=10;c.strokeStyle='#5a4232';line(c,s.x0+330,s.y0+150,s.x0+300,s.y0-120);ink(c,3);c.fillStyle='rgba(240,230,210,.7)';poly(c,[[s.x0+305,s.y0-100],[s.x0+470,s.y0-10],[s.x0+310,s.y0+40]]);c.fill();c.stroke();
    for(let i=0;i<4;i++){circ(c,s.x0+120+i*130,s.y0+250,22);FS(c,'#2a3a5a')}
    c.fillStyle='rgba(20,40,80,.35)';for(let i=0;i<6;i++){c.beginPath();c.arc(rnd(WW),1100,rnd(80,160),Math.PI,0);c.fill()}
    ink(c)},
  under(c,t){c.save();for(let i=0;i<7;i++){const x=i*380+Math.sin(t*.3+i)*60;const g=c.createLinearGradient(x,0,x+200,1400);g.addColorStop(0,'rgba(255,255,255,.18)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;poly(c,[[x,0],[x+90,0],[x+300,1400],[x+160,1400]]);c.fill()}c.restore()},
  over(c,t){c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=2;for(let i=0;i<70;i++){const x=(i*157)%WW+Math.sin(t*2+i)*8,y=WH-((t*(30+i%4*10)+i*233)%WH);circ(c,x,y,3+i%4*1.5);c.stroke()}ink(c)},
  layout(L,w){scatter(L,w,'coral',22,[60,300,2340,1580],()=>({col:pick(['#f28fb7','#f28b2f','#8d5cc8','#e8504a','#f6c63a'])}),140);scatter(L,w,'seaweed',22,[60,300,2340,1580],()=>({s:rnd(.8,1.3)}),130);
    scatter(L,w,'clam',8,[100,1100,2300,1580],{},200);L.prop('chest',700,700);L.prop('chest',2100,1450);scatter(L,w,'rock',8,[100,700,2300,1580],()=>({col:'#7a8aa0'}),250)},
  look(){return mobLook({tops:[['diver',4],['princess',1.2],['swim',.8]],hats:[[null,4],['goggle',.4]],age:[['kid',.3],['adult',.6],['elder',.1]],acc:[],fix:o=>{if(o.top==='princess'){o.topCol=pick(['#7fd6b4','#7cc8ec','#c79bff','#f28fb7']);o.hat='mermaid';o.hair='long'}}})},
  family:{futan:{mask:true},mama:{mask:true},papa:{mask:true,acc:{scarf:'#e8a020'}}},
  animals:[['fish',34],['crab',6]],hide:{p:.5,props:['coral','seaweed','rock']},lines:['ごぼごぼ…','おさかな きれい！']
});
// 8 ----------------------------------------------------------------
STAGES.push({id:'space',name:'つきの うちゅうきち',intro:'ここは つき！ うちゅうひこうしと うちゅうじんが いっぱい！',
  music:{tempo:90,scale:'whole',wave:'sine',seed:88,root:493.88},magic:'stars',people:220,decoys:10,walkers:.1,
  walk(x,y){if(y<500)return null;return 'land'},
  bg(c,w){grad(c,0,520,['#070b22','#18204a']);speckle(c,0,0,WW,520,['#fff','#fff6b0','#bfe0ff'],320,1.8);
    c.fillStyle='#3f7bd6';circ(c,330,230,120);c.fill();c.fillStyle='#4cad62';ell(c,290,200,50,70,.4);c.fill();ell(c,390,280,40,30);c.fill();c.fillStyle='rgba(255,255,255,.6)';ell(c,330,150,70,16,.2);c.fill();
    c.fillStyle='#e8a06a';circ(c,1900,190,70);c.fill();c.strokeStyle='#f6d6a0';c.lineWidth=12;ell(c,1900,190,130,26,-.3);c.stroke();
    grad(c,500,WH,['#d2d0dc','#b2b0c0']);for(let i=0;i<40;i++){const x=R()*WW,y=560+R()*1000,r=rnd(30,90);c.fillStyle='#a3a1b4';ell(c,x,y,r,r*.35);c.fill();c.fillStyle='#bfbdcc';ell(c,x,y-4,r*.75,r*.22);c.fill()}
    c.strokeStyle='rgba(120,118,140,.6)';c.lineWidth=4;c.setLineDash([20,16]);line(c,0,1000,WW,1050);line(c,1200,520,1150,WH);c.setLineDash([]);ink(c)},
  layout(L,w){L.prop('rocket',300,900);L.prop('rocket',2050,760,{s:.8});scatter(L,w,'dome',5,[200,580,2200,1550],{},420);scatter(L,w,'flag',4,[200,600,2200,1500],()=>({col:pick(['#e8504a','#3f7bd6','#f6c63a'])}),400);
    scatter(L,w,'rock',10,[100,560,2300,1580],()=>({col:'#9a98aa'}),200)},
  look(){return mobLook({tops:[['astro',5],['shirt',.7]],hats:[[null,1]],age:[['kid',.3],['adult',.6],['elder',.1]],fix:o=>{if(o.top==='shirt'){o.skin=pick(['#9ad66b','#c79bff','#7fd6b4']);o.hair='bald';o.hairCol=o.skin;o.hat='antenna';o.hatCol=pick(['#f28fb7','#f6c63a','#e8504a'])}}})},
  family:{futan:{helmet:true},mama:{helmet:true},papa:{helmet:true}},
  hide:{p:.4,props:['rock','flag']},lines:['ふわふわ〜','うちゅう たのしい！','ピポパポ']
});
// 9 ----------------------------------------------------------------
STAGES.push({id:'castle',name:'おとぎの くにの おしろ',intro:'おうさまの おしろで ぶとうかい！ きしや おひめさまが あつまってるよ。',
  music:{tempo:104,scale:'lydian',wave:'triangle',seed:99,root:523.25},magic:'rainbow',people:240,decoys:12,walkers:.12,
  geo(w){w.fount={x:1200,y:1080,rx:180,ry:80}},
  walk(x,y,w){if(y<600)return null;if(inEll(x,y,{x:w.fount.x,y:w.fount.y,rx:w.fount.rx+20,ry:w.fount.ry+20}))return null;return 'land'},
  bg(c,w){grad(c,0,620,['#bfe2ff','#ffe2f0']);cloud(c,200,120,1.3,'#fff6fb');cloud(c,2150,90,1.1,'#fff6fb');
    const tw=(x,y,wd,h,roof)=>{c.fillStyle='#f6eef8';c.fillRect(x-wd/2,y-h,wd,h);c.strokeRect(x-wd/2,y-h,wd,h);poly(c,[[x-wd/2-12,y-h],[x,y-h-wd*1.2],[x+wd/2+12,y-h]]);FS(c,roof);for(let i=0;i<2;i++){rr(c,x-12,y-h+40+i*70,24,36,12);FS(c,'#7cc8ec')}};
    ink(c,3);c.fillStyle='#f3e8f4';c.fillRect(700,250,1000,370);c.strokeRect(700,250,1000,370);for(let i=0;i<20;i++){c.fillRect(700+i*50,230,30,24);c.strokeRect(700+i*50,230,30,24)}
    tw(700,620,150,460,'#f28fb7');tw(1700,620,150,460,'#f28fb7');tw(1000,620,110,520,'#7cc8ec');tw(1400,620,110,520,'#7cc8ec');tw(1200,560,170,600,'#c79bff');
    c.fillStyle='#8a5a44';c.beginPath();c.moveTo(1130,620);c.lineTo(1130,520);c.arc(1200,520,70,Math.PI,0);c.lineTo(1270,620);c.closePath();c.fill();c.stroke();
    bgFill2(c);function bgFill2(c){c.fillStyle='#b8e08f';c.fillRect(0,610,WW,WH-610);for(let i=0;i<WW/80;i++)for(let j=0;j<12;j++){if((i+j)%2){c.fillStyle='#acd884';c.fillRect(i*80,610+j*80,80,80)}}}
    pathStroke(c,[[1200,610],[1200,1640]],220,'#f3e6cf','#e2d0b0');pathStroke(c,[[-40,1300],[1200,1300],[2440,1300]],150,'#f3e6cf','#e2d0b0');
    const f=w.fount;c.fillStyle='#e9e0f0';ell(c,f.x,f.y,f.rx+16,f.ry+12);c.fill();c.stroke();c.fillStyle='#9fdcf2';ell(c,f.x,f.y,f.rx,f.ry);c.fill();
    ink(c)},
  under(c,t,w){const f=w.fount;rr(c,f.x-14,f.y-90,28,90,6);FS(c,'#efe6f4');for(let i=0;i<16;i++){const k=(t*.8+i/16)%1,a=i/16*TAU;circ(c,f.x+Math.cos(a)*k*f.rx*.8,f.y-90+k*90-Math.sin(k*Math.PI)*40+Math.sin(a)*k*f.ry*.5,4);c.fillStyle='rgba(255,255,255,.9)';c.fill()}},
  layout(L,w){L.prop('dragon',2050,1250,{col:'#7fcf8a',s:1.7});scatter(L,w,'hedge',10,[60,680,2340,1580],{},220);scatter(L,w,'flowers',12,[60,680,2340,1580],()=>({cols:['#f28fb7','#c79bff','#fff','#f6c63a']}),150);
    scatter(L,w,'mushroom',6,[60,700,2340,1580],()=>({col:pick(['#e8504a','#8d5cc8','#f28fb7'])}),200);scatter(L,w,'tree',6,[60,700,2340,1580],()=>({fruit:'#e8504a',col:'#7fc77a'}),300);scatter(L,w,'flag',6,[100,680,2300,1000],()=>({col:pick(['#f28fb7','#7cc8ec','#c79bff'])}),260)},
  look(){return mobLook({tops:[['knight',1.4],['princess',1.6],['dress',.8],['shirt',.8]],hats:[[null,3],['beret',.6],['witch',.4],['crown',.2],['tiara',.6]],acc:[['flag',.04]],fix:o=>{if(o.top==='knight'){o.hat='knight';o.hatCol=pick(['#e8504a','#3f7bd6','#f6c63a']);if(chance(.5))o.acc.sword=1}if(o.top==='princess'){o.topCol=pick(['#f28fb7','#c79bff','#7cc8ec','#f7f4ee','#f6e27a']);if(!o.hat)o.hat='tiara';o.hatCol='#e8504a'}if(o.hat==='tiara'&&!o.fem)o.hat='crown'}})},
  family:{papa:{hat:'crown'}},
  animals:[['rabbit',6],['bird',8]],hide:{p:.5,props:['hedge','mushroom','flowers']},lines:['ごきげんよう','おしろ ひろ〜い！']
});
// 10 ----------------------------------------------------------------
STAGES.push({id:'dino',name:'きょうりゅうの くに',intro:'むかしむかしの きょうりゅうの くに！ たんけんたいと いっしょに さがそう。',
  music:{tempo:116,scale:'minor',wave:'square',seed:101,root:440,beat:900},magic:'confetti',people:220,decoys:12,walkers:.12,
  geo(w){w.river=[[-60,900],[400,820],[800,960],[1200,880],[1600,1000],[2000,920],[2460,980]]},
  walk(x,y,w){if(y<360)return null;const r=w.river;for(let i=0;i<r.length-1;i++){const a=r[i],b=r[i+1];if(x>=a[0]&&x<=b[0]){const k=(x-a[0])/(b[0]-a[0]),ry=a[1]+(b[1]-a[1])*k;if(Math.abs(y-ry)<70)return 'water'}}return 'land'},
  bg(c,w){grad(c,0,380,['#ffcf8a','#fff0c8']);c.fillStyle='#d9a070';poly(c,[[0,380],[300,220],[600,380]]);c.fill();poly(c,[[400,380],[800,260],[1100,380]]);c.fill();
    c.fillStyle='#8a6a5a';poly(c,[[1500,380],[1780,90],[1900,90],[2200,380]]);c.fill();c.fillStyle='#ff7a3c';poly(c,[[1780,90],[1900,90],[1880,130],[1840,110],[1800,140]]);c.fill();
    grad(c,370,WH,['#a8d878','#8cc464']);speckle(c,0,380,WW,1220,['#7cb85a','#b8e08a'],900,4);
    pathStroke(c,w.river,150,'#6cc0e4','#4f9fc4');c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=3;for(let i=0;i<30;i++){const x=R()*WW;let y=0;for(let j=0;j<w.river.length-1;j++){const a=w.river[j],b=w.river[j+1];if(x>=a[0]&&x<=b[0])y=a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0])}line(c,x-16,y+rnd(-30,30),x+16,y)}
    ink(c)},
  under(c,t){for(let i=0;i<6;i++){const k=(t*.15+i/6)%1;c.fillStyle='rgba(120,110,110,'+(.5-k*.5)+')';circ(c,1840+Math.sin(k*6+i)*30,80-k*120,30+k*60);c.fill()}},
  layout(L,w){for(const[x,y,col,fl]of[[300,560,'#8fcf6a',false],[1100,620,'#f2a35a',true],[2000,600,'#7cc8ec',false],[600,1350,'#c79bff',true],[1500,1400,'#f6c63a',false],[2150,1300,'#f28fb7',true]])L.prop('dino',x,y,{col,flip:fl,s:1.9,depth:30});
    scatter(L,w,'jungle',12,[40,400,2360,1580],{},220);scatter(L,w,'palm',6,[40,400,2360,1580],{},300);scatter(L,w,'egg',8,[100,450,2300,1550],()=>({col:pick(['#8fcf6a','#f28fb7','#7cc8ec'])}),160);
    L.prop('tent',900,1150,{col:'#f28b2f'});L.prop('tent',1750,1180,{col:'#4cad62'});scatter(L,w,'mushroom',5,[100,450,2300,1550],{},200);scatter(L,w,'rock',6,[100,450,2300,1550],{},200)},
  look(){return mobLook({tops:[['safari',4],['shirt',1]],hats:[['safari',3],['cap',1],[null,1]],acc:[['camera',.1],['net',.1],['backpack',.15]],fix:o=>{if(o.top==='safari')o.topCol=pick(['#c8b07a','#a8946a','#d9c08a','#8a9a6a'])}})},
  family:{papa:{acc:{scarf:'#e8a020',glasses:true,camera:true}}},
  animals:[['bird',8],['monkey',5]],hide:{p:.5,props:['jungle','egg','rock']},lines:['きょうりゅう でかい！','たまご みつけた！']
});

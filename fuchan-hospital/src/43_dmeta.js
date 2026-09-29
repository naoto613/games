// ================= しかいいん: へやの とうろく・まめちしき・マップの なかみ =================
ROOMS.push(
  {id:'dcheck',name:'しか けんしん',sub:'けんしんひょう',icon:'explorer',col:'#2ec0a0',dent:1},
  {id:'dxray',name:'はの レントゲン',sub:'はの なか',icon:'sensor',col:'#4a7ae0',dent:1},
  {id:'dtreat',name:'むしばの ちりょう',sub:'ますい・つめもの',icon:'drill',col:'#ff6f91',dent:1},
  {id:'dstain',name:'そめだし はみがき',sub:'みがきのこし',icon:'dye',col:'#e8286a',dent:1},
  {id:'dfluor',name:'フッそと シーラント',sub:'よぼう',icon:'fluor',col:'#5aa8ff',dent:1},
  {id:'dscale',name:'はの おそうじ',sub:'しせき とり',icon:'scaler',col:'#e8a800',dent:1},
  {id:'dbaby',name:'はえかわり',sub:'こどもの は',icon:'tooth',col:'#ff9a3a',dent:1},
  {id:'dshape',name:'はの かたち',sub:'まえば・おくば',icon:'molar',col:'#a878ff',dent:1},
  {id:'dortho',name:'きょうせい',sub:'ならべる',icon:'bracket',col:'#3aa8c8',dent:1},
  {id:'dcrown',name:'かぶせもの',sub:'ぎこうし',icon:'crown',col:'#c8905a',dent:1});
Object.assign(MINFO,{dreception:['うけつけ・まちあい','しんさつけんを だして まつ ところだよ','#eafaf4'],dcheck:['しか けんしん','はを しらべて けんしんひょうに かくよ','#e6faf4'],dxray:['レントゲンしつ','はの なかの しゃしんを とるよ','#eef2fb'],
  dtreat:['ちりょうしつ','むしばを けずって つめものを するよ','#fff0f4'],dstain:['はみがき しどうしつ','みがきのこしを あかく そめて しらべるよ','#fff4f8'],dfluor:['よぼうしつ','フッそと シーラントで はを まもるよ','#eef6ff'],
  dscale:['クリーニングしつ','しせきを とって ピカピカに するよ','#fffbe8'],dbaby:['こどもの はの おへや','はえかわりを べんきょう するよ','#fff8ec'],dshape:['はの もけいしつ','はの かたちと やくわりを しらべるよ','#f6f2ff'],
  dortho:['きょうせいしつ','がたがたの はを きれいに ならべるよ','#eef6ff'],dcrown:['ぎこうしさんの こうぼう','かぶせものを つくるよ','#fff6ea']});
Object.assign(TIPS,{dcheck:['こどもの はは 20ぽん、 おとなの はは 28ほん（おやしらずを いれると 32ほん）','しか けんしんは むしばが ちいさいうちに みつける ために するよ','けんしんひょうの C は むしば、 ○は げんきな はの しるし'],
  dxray:['レントゲンを とる ときは からだを まもる エプロンを かけるよ','はの あいだの むしばは めで みえなくても レントゲンで みつかるよ','こどもの はの したには おとなの はが じゅんびして まっているよ'],
  dtreat:['むしばは しぜんには なおらない。 はやめに はいしゃさんへ','けずる ときに でる おみずは バキュームで すいとるよ','つめものは あおい ひかりを あてると かたまるよ'],
  dstain:['みがきのこしは はと はぐきの さかいめ、 おくばの みぞ、 はの あいだに おおいよ','はぶらしだけだと はの あいだの よごれは 6わりしか とれないんだって','ねる まえの はみがきが いちばん だいじ'],
  dfluor:['フッそは はを つよく して むしばを ふせぐよ','シーラントは おくばの ふかい みぞを ふさいで むしばを ふせぐよ','フッそを ぬった あとは 30ぷん たべたり のんだり しないでね'],
  dscale:['しせきは みがきのこしが かたまった もの。 はぶらしでは とれないよ','はいしゃさんで 3かげつに 1かいくらい おそうじ してもらうと いいよ','おちゃや カレーの いろも はに つくことが あるよ'],
  dbaby:['はえかわりは 6さいごろから 12さいごろまで','6さいきゅうしは いちばん おおきくて だいじな おくば','ぬけた はは えんのしたや やねの うえに なげる ならわしが あったよ'],
  dshape:['まえばは きる、 けんしは ひきさく、 おくばは すりつぶす','けんしは いときりばとも いうよ','よく かむと あごが そだって からだも げんきに なるよ'],
  dortho:['きょうせいは 1ねん いじょう かけて ゆっくり はを うごかすよ','ブラケットと ワイヤーで はを おして ならべるよ','きょうせい ちゅうは いつもより ていねいに はみがき'],
  dcrown:['かぶせものは ぎこうしさんが ひとりひとりに あわせて つくるよ','シェードガイドで となりの はと おなじ いろを えらぶよ','かたどりの ねんどは すこし まつと かたまるよ']});
// マップの へやの なか
function dChair(c,x,y0,s=1,k){c.save();c.translate(x,y0);c.scale(s,s);c.fillStyle='#b8c4d4';c.fillRect(-6,-40,12,40);c.fillStyle='#5ac8a8';rr(c,-70,-60,120,22,10);c.fill();c.save();c.translate(50,-56);c.rotate(-.9);rr(c,-6,-10,70,20,10);c.fill();c.restore();c.fillStyle='#e8eef4';rr(c,-90,-44,30,10,4);c.fill();
  c.strokeStyle='#c8d0dc';c.lineWidth=5;c.beginPath();c.moveTo(-80,-60);c.lineTo(-80,-150);c.lineTo(-20,-170);c.stroke();c.fillStyle=steel(c,-40,-180,0,-170);c.beginPath();c.ellipse(-12,-168,26,10,-.3,0,TAU);c.fill();c.fillStyle='#fffbe0';ell(c,-12,-162,16,4);
  if(k)drawAnimal(c,k,-10,-60,.28,{t:T,gown:'#bfe0ff'});c.restore();}
const DROOM={
  dreception(c,x,top,h,y0){c.fillStyle='#5ac8a8';rr(c,x+150,y0-70,120,70,[12,12,0,0]);c.fill();c.fillStyle='#fff';c.fillRect(x+150,y0-74,120,8);drawAnimal(c,'rabbit',x+210,y0-60,.32,{t:T,acc:'cap',accC:'#5ac8a8'});
    c.fillStyle='rgba(150,220,255,.6)';rr(c,x+20,top+60,110,70,8);c.fill();c.strokeStyle='#fff';c.lineWidth=4;c.stroke();for(let i=0;i<3;i++){const fx=x+40+((T*20+i*40)%80),fy=top+84+i*14;c.fillStyle=['#ff9a3a','#ffd23a','#ff6f91'][i];ell(c,fx,fy,8,5);c.beginPath();c.moveTo(fx-8,fy);c.lineTo(fx-14,fy-5);c.lineTo(fx-14,fy+5);c.fill();}
    c.fillStyle='#ffb3d0';rr(c,x+20,y0-44,110,20,8);c.fill();},
  dcheck(c,x,top,h,y0){dChair(c,x+110,y0,1,'bear');c.fillStyle='#fff';rr(c,x+190,top+50,70,80,6);c.fill();c.strokeStyle='#9fe0cf';c.lineWidth=2;c.stroke();for(let i=0;i<5;i++)txt(c,i===2?'C':'○',x+205+i*10,top+90,10,i===2?'#ff3a5a':'#5ac8a8');},
  dxray(c,x,top,h,y0){c.fillStyle='#e8eef6';c.fillRect(x+60,top+40,14,h-60);c.fillStyle=steel(c,x+60,top+80,x+150,top+80);rr(c,x+70,top+80,90,56,12);c.fill();c.fillStyle='#3a3e4a';circ(c,x+90,top+108,12);drawAnimal(c,'cat',x+120,y0-10,.32,{t:T});c.save();c.translate(x+120,y0-40);c.scale(1.2,1.2);MED.apron(c,0,0,1);c.restore();drawDeco(c,['viewer',x+225,top+80,.5]);},
  dtreat(c,x,top,h,y0){dChair(c,x+120,y0,1,'lion');drawDeco(c,['cart',x+230,y0-50,.55]);},
  dstain(c,x,top,h,y0){c.fillStyle='#fff';rr(c,x+30,top+40,90,60,8);c.fill();c.strokeStyle='#ffb3d6';c.lineWidth=3;c.stroke();for(let i=0;i<4;i++){c.fillStyle=i%2?'#e8286a':'#fff';rr(c,x+42+i*18,top+56,14,24,4);c.fill();c.strokeStyle='#d0d8e0';c.lineWidth=1;c.stroke();}
    drawDeco(c,['sink',x+200,y0-40,.6]);drawItem(c,'toothbrush',x+80,y0-60,.8);drawAnimal(c,'rabbit',x+110,y0-10,.3,{t:T,happy:1});},
  dfluor(c,x,top,h,y0){dChair(c,x+110,y0,1,'panda');c.fillStyle='#fff';rr(c,x+190,top+50,70,70,10);c.fill();c.fillStyle='#8ad0ff';for(let i=0;i<3;i++){star(c,x+208+i*18,top+85,8,3.5);c.fill();}},
  dscale(c,x,top,h,y0){dChair(c,x+120,y0,1,'dog');c.save();c.translate(x+230,top+80);c.rotate(-.4);MED.scaler(c,0,0,1.2);c.restore();},
  dbaby(c,x,top,h,y0){c.fillStyle='#fff';rr(c,x+30,top+50,110,80,12);c.fill();c.strokeStyle='#ffb3c8';c.lineWidth=3;c.stroke();for(let i=0;i<5;i++)drawItem(c,'tooth',x+46+i*20,top+90,.25);txt(c,'はの はこ',x+85,top+118,11,'#ff5fa2');drawAnimal(c,'pig',x+200,y0-10,.34,{t:T,happy:1});},
  dshape(c,x,top,h,y0){c.fillStyle='#f4eee4';rr(c,x+60,y0-110,160,80,20);c.fill();const M=dmNew('adult',x+140,y0-70,56,24);for(const t of M.teeth)dmTooth(c,M,t);c.fillStyle='#c8a478';rr(c,x+40,y0-30,200,12,4);c.fill();},
  dortho(c,x,top,h,y0){dChair(c,x+110,y0,1,'fox');c.fillStyle='#fff';rr(c,x+190,top+50,70,60,10);c.fill();for(let i=0;i<4;i++){MED.bracket(c,x+202+i*16,top+80,.4);}c.strokeStyle='#8a98b0';c.lineWidth=2;c.beginPath();c.moveTo(x+196,top+80);c.lineTo(x+254,top+80);c.stroke();},
  dcrown(c,x,top,h,y0){c.fillStyle='#c8a478';rr(c,x+30,y0-60,220,14,4);c.fill();c.fillRect(x+40,y0-46,10,46);c.fillRect(x+230,y0-46,10,46);MED.crown(c,x+90,y0-80,.9,{col:'#f4ecd4'});MED.plaster(c,x+150,y0-80,.8);drawDeco(c,['lamp',x+200,top+30,.6]);drawAnimal(c,'bear',x+60,y0-10,.3,{t:T,acc:'cap',accC:'#fff'});}};

// ================= gacha prizes: きせかえ・かくれキャラ・ひみつの カギ =================
// ---- かくれキャラ (drawn big at origin = feet, about 200 tall; shrunk when placed in a town) ----
function sEyes(c,cx,cy,gap,r){for(const s of[-1,1]){ell(c,cx+gap*s,cy,r,r*1.3);F(c,'#2c221e');ell(c,cx+gap*s-r*.35,cy-r*.5,r*.4,r*.4);F(c,'#fff')}}
function sCheeks(c,cx,cy,gap){ell(c,cx-gap,cy,6,3.8);F(c,'rgba(244,128,128,.55)');ell(c,cx+gap,cy,6,3.8);F(c,'rgba(244,128,128,.55)')}
function sSmile(c,cx,cy,r){c.lineWidth=3;c.beginPath();c.arc(cx,cy,r,Math.PI*.15,Math.PI*.85);c.stroke();c.lineWidth=4}
function bunny(c,col,inner,o){o=o||{};const cx=0;
  // ears, body, feet, head
  for(const s of[-1,1]){ell(c,cx+s*17,-170,11,36,s*.15);FS(c,col);ell(c,cx+s*17,-166,5,26,s*.15);F(c,inner)}
  ell(c,cx-18,-6,16,9);FS(c,col);ell(c,cx+18,-6,16,9);FS(c,col);
  ell(c,cx,-56,38,44);FS(c,col);ell(c,cx,-50,24,30);F(c,o.belly||'#fff');
  ell(c,cx-36,-66,10,16,.4);FS(c,col);ell(c,cx+36,-66,10,16,-.4);FS(c,col);
  ell(c,cx,-118,44,40);FS(c,col);
  sEyes(c,cx,-120,16,6);sCheeks(c,cx,-104,28);ell(c,cx,-110,4,3);F(c,'#e98a9a');
  c.lineWidth=3;c.beginPath();c.moveTo(cx,-107);c.lineTo(cx,-102);c.moveTo(cx,-102);c.quadraticCurveTo(cx-5,-97,cx-9,-101);c.moveTo(cx,-102);c.quadraticCurveTo(cx+5,-97,cx+9,-101);c.stroke();c.lineWidth=4}
const SECRETS=[
  {id:'shirousa',n:'しろうさぎの ぴょん',line:'ぴょーん！ みつかっちゃった',rabbit:1,draw(c){bunny(c,'#fbfbff','#ffb3cf');heart(c,0,-52,9);F(c,'#ff8cc0')}},
  {id:'tsukiusa',n:'おつきみうさぎ',line:'おもち たべる？ ぺったん！',rabbit:1,draw(c){c.lineWidth=7;line(c,40,-30,62,-150);ink(c,4);rr(c,48,-170,40,26,8);FS(c,'#c48a5a');bunny(c,'#f3f0ea','#ffb3cf');for(let i=0;i<3;i++){circ(c,-40,-30-i*16,9);FS(c,['#fff','#ffd0e0','#c8f0b0'][i])}c.lineWidth=3;line(c,-40,-10,-40,-70);ink(c,4)}},
  {id:'magiusa',n:'てじなし うさぎ',line:'ジャジャーン！ てじなは おしまい',rabbit:1,draw(c){bunny(c,'#a9a3b8','#ffb3cf',{belly:'#fff'});ell(c,0,-160,40,9);FS(c,'#2f2a38');rr(c,-26,-206,52,48,6);FS(c,'#2f2a38');rr(c,-26,-174,52,8,2);F(c,'#e8504a');
    c.lineWidth=5;line(c,42,-70,70,-100);ink(c,4);star(c,74,-106,12,5);FS(c,'#f6e27a');rr(c,-14,-80,28,10,4);FS(c,'#e8504a')}},
  {id:'chocousa',n:'チョコうさぎ',line:'あま〜い におい するでしょ？',rabbit:1,draw(c){bunny(c,'#8a5a3a','#d9a07a',{belly:'#c48a5a'});rr(c,-26,-36,52,30,6);FS(c,'#f3e1b5');c.fillStyle=LN;c.font='900 18px sans-serif';c.textAlign='center';c.fillText('choco',0,-15)}},
  {id:'momousa',n:'ももいろうさぎ ひめ',line:'ごきげんよう、ふーたん',rabbit:1,draw(c){bunny(c,'#ffc2dc','#ff8cc0',{belly:'#fff0f6'});poly(c,[[-22,-150],[-22,-172],[-11,-160],[0,-178],[11,-160],[22,-172],[22,-150]]);FS(c,'#f6c63a');circ(c,0,-162,4);F(c,'#e8504a')}},
  {id:'obake',n:'おばけの ふわり',line:'ばあっ！ みつかっちゃった〜',draw(c){c.beginPath();c.moveTo(-48,-15);c.lineTo(-48,-105);c.arc(0,-105,48,Math.PI,0);c.lineTo(48,-15);
    for(let i=0;i<4;i++){const x0=48-i*24;c.quadraticCurveTo(x0-6,-29,x0-12,-15);c.quadraticCurveTo(x0-18,-1,x0-24,-15)}c.closePath();FS(c,'#fbfbff');
    ell(c,-54,-75,12,8,-.6);FS(c,'#fbfbff');ell(c,54,-75,12,8,.6);FS(c,'#fbfbff');sEyes(c,0,-105,15,6);sCheeks(c,0,-89,26);ell(c,0,-79,7,9);F(c,'#7a3b3b')}},
  {id:'ninja',n:'にんじゃの しのぶ',line:'ドロン！ よく みつけたでござる',draw(c){rr(c,-30,-65,60,52,14);FS(c,'#34303a');rr(c,-34,-19,68,14,6);FS(c,'#34303a');
    c.beginPath();c.moveTo(30,-109);c.quadraticCurveTo(70,-115,76,-85);c.lineTo(64,-87);c.quadraticCurveTo(58,-101,30,-95);c.closePath();FS(c,'#e8504a');
    ell(c,0,-109,42,40);FS(c,'#34303a');rr(c,-34,-123,68,28,12);FS(c,'#fde2c8');rr(c,-44,-119,88,8,4);FS(c,'#e8504a');sEyes(c,0,-107,14,5.5);ell(c,-36,-41,8,8);FS(c,'#fde2c8');ell(c,36,-41,8,8);FS(c,'#fde2c8')}},
  {id:'alien',n:'うちゅうじんの ピポ',line:'ピポパポ！ ちきゅうは たのしいね',draw(c){rr(c,-24,-59,48,46,14);FS(c,'#c7ccd4');ell(c,0,-45,8,8);FS(c,'#f4c534');
    for(const s of[-1,1]){line(c,s*16,-143,s*30,-179);ell(c,s*30,-181,7,7);FS(c,'#f28fb7')}ell(c,0,-105,50,44);FS(c,'#9ad66b');
    for(const s of[-1,1]){ell(c,s*20,-107,13,17,s*.4);F(c,'#1f1a24');ell(c,s*20-4,-114,4,5);F(c,'#fff')}sCheeks(c,0,-81,32);sSmile(c,0,-83,6);rr(c,-22,-19,18,16,6);FS(c,'#9ad66b');rr(c,4,-19,18,16,6);FS(c,'#9ad66b')}},
  {id:'robot',n:'ロボットの ガチャ',line:'ピピッ！ ハッケン サレマシタ',draw(c){rr(c,-34,-65,68,52,10);FS(c,'#9fa4ab');rr(c,-20,-53,40,22,5);FS(c,'#dff1f6');
    rr(c,-26,-15,20,14,4);FS(c,'#6b7078');rr(c,6,-15,20,14,4);FS(c,'#6b7078');line(c,0,-153,0,-175);ell(c,0,-179,7,7);FS(c,'#e8504a');
    rr(c,-44,-153,88,80,16);FS(c,'#c7ccd4');rr(c,-34,-139,68,40,10);FS(c,'#3a3f4a');for(const s of[-1,1]){ell(c,s*15,-119,9,9);F(c,'#7fe0ff')}rr(c,-16,-91,32,8,3);FS(c,'#6b7078')}},
  {id:'panda',n:'パンダの ころん',line:'ころりん！ ササ もってない？',draw(c){ell(c,-20,-9,14,9);FS(c,'#2f3340');ell(c,20,-9,14,9);FS(c,'#2f3340');ell(c,0,-49,44,42);FS(c,'#fbfbff');
    ell(c,-34,-143,14,13);FS(c,'#2f3340');ell(c,34,-143,14,13);FS(c,'#2f3340');ell(c,0,-109,46,40);FS(c,'#fbfbff');
    for(const s of[-1,1]){ell(c,s*17,-109,12,15,s*.5);F(c,'#2f3340');ell(c,s*17,-111,4.5,5.5);F(c,'#fff')}ell(c,0,-93,6,4);F(c,'#2f3340');sCheeks(c,0,-89,30)}},
  {id:'kappa',n:'かっぱの きゅう',line:'きゅうりを さがしに きたんだ',draw(c){rr(c,-28,-65,56,50,16);FS(c,'#6fb36a');ell(c,0,-37,18,18);FS(c,'#e6f2a8');ell(c,0,-107,44,40);FS(c,'#7cc074');
    for(let i=0;i<9;i++){const a=Math.PI*(1.08+i*.105);ell(c,Math.cos(a)*40,-113+Math.sin(a)*34,9,11,a);FS(c,'#3a7a52')}ell(c,0,-141,22,9);FS(c,'#f7f4ee');
    sEyes(c,0,-107,15,5.5);c.beginPath();c.moveTo(-12,-93);c.quadraticCurveTo(0,-81,12,-93);c.closePath();FS(c,'#f4c534')}}
];
const SECRET_BY={};SECRETS.forEach(d=>SECRET_BY[d.id]=d);
function secretSprite(id){return makeSprite('sec_'+id,60,62,c=>{c.scale(.27,.27);ink(c,4.5);SECRET_BY[id].draw(c)},2)}

// ---- the prize list ----
// slot: head / outfit / back / face ; rarity: n(ふつう) r(レア) k(キラキラ)
const PRIZES=[
  {id:'nekomimi',kind:'wear',slot:'head',n:'ねこみみ',r:'n',hat:'nekomimi',hatCol:'#3b3533'},
  {id:'usamimi',kind:'wear',slot:'head',n:'うさみみ',r:'n',hat:'usamimi',hatCol:'#fbfbff'},
  {id:'flowercrown',kind:'wear',slot:'head',n:'はなかんむり',r:'n',hat:'flowercrown'},
  {id:'straw',kind:'wear',slot:'head',n:'むぎわらぼうし',r:'n',hat:'straw',hatCol:'#e8504a'},
  {id:'bigribbon',kind:'wear',slot:'head',n:'おおきな リボン',r:'n',hat:'bigribbon',hatCol:'#3f7bd6'},
  {id:'sunglasses',kind:'wear',slot:'face',n:'ハートの サングラス',r:'n',acc:{sunglasses:'#e8487a'}},
  {id:'sailor',kind:'wear',slot:'outfit',n:'セーラーふく',r:'n',top:'sailor'},
  {id:'tiara',kind:'wear',slot:'head',n:'ティアラ',r:'r',hat:'tiara',hatCol:'#e8504a'},
  {id:'princess',kind:'wear',slot:'outfit',n:'おひめさまドレス',r:'r',top:'princess',topCol:'#ffb0d4',dots:null},
  {id:'ninja',kind:'wear',slot:'outfit',n:'にんじゃの ふく',r:'r',top:'ninja',topCol:'#2f3a5a',legCol:'#2f3a5a'},
  {id:'wizard',kind:'wear',slot:'outfit',n:'まほうつかいの ローブ',r:'r',top:'robe',topCol:'#8d5cc8',dots:null},
  {id:'witchhat',kind:'wear',slot:'head',n:'まほうの ぼうし',r:'r',hat:'witch',hatCol:'#6a3fa0'},
  {id:'dino',kind:'wear',slot:'outfit',n:'きょうりゅうの きぐるみ',r:'r',top:'dinosuit',topCol:'#7cc86a',legCol:'#7cc86a',dots:null,hood:'dinohood',hoodCol:'#7cc86a'},
  {id:'angel',kind:'wear',slot:'back',n:'てんしの はね',r:'r',acc:{wings:'#fff'}},
  {id:'usagi',kind:'wear',slot:'outfit',n:'うさぎの きぐるみ',r:'k',top:'usagisuit',topCol:'#fbfbff',legCol:'#fbfbff',dots:null,hood:'usahood',hoodCol:'#fbfbff'},
  {id:'crown',kind:'wear',slot:'head',n:'おうかん',r:'k',hat:'crown'},
  {id:'cape',kind:'wear',slot:'back',n:'おうさまの マント',r:'k',acc:{cape:'#d8433a'}},
  {id:'rickywings',kind:'wear',slot:'back',n:'リッキーと おそろいの はね',r:'k',acc:{wings:'#dff0ff'}},
  ...SECRETS.map(s=>({id:'sec_'+s.id,kind:'secret',sid:s.id,n:s.n,r:s.rabbit?(s.id==='momousa'||s.id==='magiusa'?'r':'n'):(s.id==='robot'||s.id==='alien'?'r':'n')})),
];
const PRIZE_BY={};PRIZES.forEach(p=>PRIZE_BY[p.id]=p);
const RARITY={n:{name:'ふつう',w:62,cap:['#ffffff','#9fdcf5','#ffd0e4','#c8f0b0']},r:{name:'レア',w:30,cap:['#f6c63a']},k:{name:'キラキラ',w:8,cap:['rainbow']}};
// ふーたんの いまの みため (ステージの ふく ＋ きせかえ)。みつあみ と ハートの ポシェット は いつも のこす
function wearOn(o){
  const eq=(PROG.gacha&&PROG.gacha.equip)||{};
  const out=eq.outfit&&PRIZE_BY[eq.outfit];
  if(out&&!o.helmet&&!o.mask&&o.top!=='swim'){o.top=out.top;if(out.topCol)o.topCol=out.topCol;o.dots=out.dots===undefined?o.dots:out.dots;if(out.legCol)o.legCol=out.legCol;if(out.hood&&!eq.head){o.hat=out.hood;o.hatCol=out.hoodCol}}
  const head=eq.head&&PRIZE_BY[eq.head];if(head&&!o.helmet){o.hat=head.hat;o.hatCol=head.hatCol}
  for(const s of['back','face']){const p=eq[s]&&PRIZE_BY[eq[s]];if(p)o.acc=Object.assign({},o.acc,p.acc)}
  return o;
}
function futanLook(st){const o=familyLook(LOOK_FUTAN,st||{},'futan');return wearOn(o)}

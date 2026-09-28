// ================= save =================
const SKEY='fuchan-hospital-v1';
const SAVE={sound:true,hearts:0,plays:{},coat:'#ffffff',dress:'pink',hat:'nurse',item:'none',rk:{wear:'flower',hat:'none',toy:'blocks'},owned:[],v:2};
try{Object.assign(SAVE,JSON.parse(localStorage.getItem(SKEY)||'{}'));}catch(e){}
if(!Array.isArray(SAVE.owned))SAVE.owned=[];if(!SAVE.rk||typeof SAVE.rk!=='object')SAVE.rk={wear:'flower',hat:'none',toy:'blocks'};if(!SAVE.item)SAVE.item='none';delete SAVE.stickers;SAVE.sound=true;if(!SAVE.plays||typeof SAVE.plays!=='object')SAVE.plays={};
function save(){try{localStorage.setItem(SKEY,JSON.stringify(SAVE));}catch(e){}}
function lvOf(id){return SAVE.plays[id]||0;}
const RANKS=[[0,'みならい ナース','trainee'],[40,'ナース','nurse'],[120,'ドクター','doctor'],[260,'ベテラン ドクター','expert doctor'],[450,'スーパー ドクター','super doctor'],[800,'いんちょう せんせい','hospital director']];
function rankIdx(h=SAVE.hearts){let r=0;RANKS.forEach((q,i)=>{if(h>=q[0])r=i;});return r;}
// ================= words =================
const WORDS={
  bear:['くま','bear'],rabbit:['うさぎ','rabbit'],cat:['ねこ','cat'],dog:['いぬ','dog'],panda:['パンダ','panda'],pig:['ぶた','pig'],chick:['ひよこ','chick'],hippo:['かば','hippo'],
  steth:['ちょうしんき','stethoscope'],thermometer:['たいおんけい','thermometer'],syringe:['ちゅうしゃ','shot'],bandage:['ばんそうこう','bandage'],icepack:['こおりまくら','ice pack'],
  hotpack:['ホットパック','hot pack'],spray:['しょうどく スプレー','spray'],light:['ライト','light'],medicine:['おくすり','medicine'],pill:['おくすり','pill'],bottle:['くすりの びん','bottle'],
  shower:['おみず','water'],xray:['レントゲン','X-ray'],cast:['ギプス','cast'],roll:['ほうたい','bandage roll'],mirror:['デンタルミラー','mirror'],drill:['ドリル','drill'],filling:['つめもの','filling'],
  toothbrush:['はぶらし','toothbrush'],tooth:['は','tooth'],cup:['コップ','cup'],brush:['ブラシ','brush'],clipper:['つめきり','nail clipper'],bone:['ほね','bone'],scale:['たいじゅうけい','scale'],
  ambulance:['サイレンを ならした きゅうきゅうしゃは あかしんごうでも ちゅういして とおれるよ','あつい ひは ねっちゅうしょうに ちゅうい。 こまめに おみずを のもう','きゅうきゅうしゃ','ambulance'],heart:['しんぞう','heart'],love:['ハート','heart'],kit:['きゅうきゅうばこ','first aid kit'],hospital:['びょういん','hospital'],crown:['かんむり','crown'],star2:['ほし','star'],
  germ:['ばいきん','germ'],ticket:['ばんごうふだ','number ticket'],phone:['でんわ','phone'],firetruck:['しょうぼうしゃ','fire truck'],stretcher:['たんか','stretcher'],camera:['カメラ','camera'],
  apple:['りんご','apple'],banana:['バナナ','banana'],carrot:['にんじん','carrot'],milk:['ぎゅうにゅう','milk'],bread:['パン','bread'],fish:['おさかな','fish'],egg:['たまご','egg'],cheese:['チーズ','cheese'],
  tomato:['トマト','tomato'],grapes:['ぶどう','grapes'],corn:['とうもろこし','corn'],onigiri:['おにぎり','rice ball'],rikki:['リッキー','Ricky'],ribbon:['リボン','ribbon'],mask:['マスク','mask'],
  headphone:['ヘッドホン','headphones'],ruler:['しんちょうけい','height meter'],meat:['おにく','meat'],broccoli:['ブロッコリー','broccoli'],
};
const COLORS={red:['#ff4d6d','あか','red'],blue:['#4a9cff','あお','blue'],yellow:['#ffd23a','きいろ','yellow'],green:['#4cc86a','みどり','green'],pink:['#ff8cc8','ピンク','pink'],purple:['#a878ff','むらさき','purple'],orange:['#ff9a3a','オレンジ','orange']};
const EN1=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen'];
const EN10=['','','twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
function numEn(n){if(n<20)return EN1[n];if(n>=100)return 'one hundred';return EN10[Math.floor(n/10)]+(n%10?'-'+EN1[n%10]:'');}
const NJ=['ゼロ','いち','に','さん','よん','ご','ろく','なな','はち','きゅう'];
function numJa(n){if(n<10)return NJ[n];if(n>=100)return 'ひゃく';const t=Math.floor(n/10),o=n%10;return(t===1?'':NJ[t])+'じゅう'+(o?NJ[o]:'');}
function sayNum(n,pre='',post=''){hush();speak(pre+n+post);speak(String(n),'en');LASTSAY={t:performance.now(),list:[[pre+n+post,'ja'],[String(n),'en']]};card={num:n,ja:numJa(n),en:numEn(n),t:0};}
function sayColorNum(n,col){const C=COLORS[col];hush();speak(`${C[1]} ${n}こ`);speak(`${numEn(n)} ${C[2]}`,'en');}
// ================= extra audio =================
function toneP(f,d,pan,v=.25,t0=0){if(!AC||!SAVE.sound)return;const t=AC.currentTime+t0;const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(v,t+.02);g.gain.setValueAtTime(v,t+d-.05);g.gain.linearRampToValueAtTime(.0001,t+d);
  let out=g;if(AC.createStereoPanner){const p=AC.createStereoPanner();p.pan.value=pan;g.connect(p);out=p;}o.connect(g);out.connect(MG);o.start(t);o.stop(t+d+.05);}
function sfx(k){switch(k){
  case'siren':for(let i=0;i<3;i++){tone(960,.38,'square',.045,i*.8);tone(960,.38,'triangle',.12,i*.8);tone(770,.38,'square',.045,i*.8+.4);tone(770,.38,'triangle',.12,i*.8+.4);}break;
  case'siren1':tone(960,.3,'triangle',.1);tone(770,.3,'triangle',.1,.32);break;
  case'dokkun':tone(80,.14,'sine',.7,0,-30);tone(66,.2,'sine',.55,.17,-20);break;
  case'drill':tone(1700,.22,'sawtooth',.035,0,250);noise(.22,.06,5200);break;
  case'xray':tone(180,.5,'sine',.1,0,60);tone(360,.5,'sine',.04,0,120);break;
  case'ring':for(let k=0;k<2;k++)for(let i=0;i<6;i++)tone(i%2?1320:1100,.05,'square',.05,k*.5+i*.05);break;
  case'key':tone(1209,.13,'sine',.14);tone(770,.13,'sine',.14);break;
  case'wrap':noise(.2,.12,1800);tone(500,.12,'sine',.05,0,200);break;
  case'clip':tone(2400,.03,'square',.1);noise(.04,.3,3000);break;
  case'hooray':[784,988,1175,1568].forEach((f,i)=>tone(f,.2,'triangle',.18,i*.08));break;
  case'cheer':sfxBase('fanfare');break;
  case'car':tone(120,.2,'sawtooth',.03,0,40);break;
  case'bump':tone(140,.2,'sine',.35,0,-60);noise(.15,.2,400);break;
  case'roll':for(let i=0;i<8;i++)tone(900+i*60,.04,'square',.04,i*.06);break;
  case'fill':[1568,2093,2637].forEach((f,i)=>tone(f,.18,'sine',.12,i*.05));break;
  default:sfxBase(k);
}}
SONGS.clinic={bpm:116,lead:[72,_,76,_,79,_,76,_,77,_,74,_,72,_,_,_,74,_,77,_,81,_,79,_,77,76,74,_,76,_,_,_,72,_,76,_,79,_,84,_,83,_,81,_,79,_,_,_,77,_,76,_,74,_,79,_,72,_,_,_,_,_,_,_],
  roots:[48,50,53,55,48,45,53,48],bell:[84,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_,88,_,_,_,_,_,_,_,_,_,_,_,_,_,_,_],drum:'pop'};
SONGS.calm={bpm:100,lead:[76,_,_,79,_,_,76,_,74,_,_,72,_,_,_,_,74,_,_,76,_,_,79,_,77,_,_,76,_,_,_,_,72,_,_,76,_,_,79,_,81,_,_,79,_,_,_,_,77,_,76,_,74,_,76,_,72,_,_,_,_,_,_,_],
  roots:[48,43,45,41,48,43,41,48],bell:[],drum:'pop'};
// ================= scene helpers =================
const SCN={};let scene=null,tr=null,cel=null;
function go(id){if(tr||!SCN[id])return;hush();tr={t:0,next:id,sw:false};sfx('whoosh');}
function bubY(){return scene&&scene.bubY!=null?scene.bubY:24;}
function wrapText(c,text,maxW){const out=[];let cur='';for(const ch of text){if(ch==='\n'){out.push(cur);cur='';continue;}const nx=cur+ch;if(c.measureText(nx).width>maxW&&cur){out.push(cur);cur=ch;}else cur=nx;}if(cur)out.push(cur);return out;}
function txt(c,s,x,y,size,col,align='center',font=FONT,wt=800){c.font=`${wt} ${size}px ${font}`;c.textAlign=align;c.textBaseline='middle';c.fillStyle=col;c.fillText(s,x,y);}
function txtO(c,s,x,y,size,col,oc='#fff',ow=6,font=POP){c.font=`${size}px ${font}`;c.textAlign='center';c.textBaseline='middle';c.lineJoin='round';c.strokeStyle=oc;c.lineWidth=ow;c.strokeText(s,x,y);c.fillStyle=col;c.fillText(s,x,y);}
function panel(c,x,y,w,h,r=24,fill='#fff',line='#ffc0dc',lw=4){c.fillStyle='rgba(90,40,110,.14)';rr(c,x+3,y+6,w,h,r);c.fill();c.fillStyle=fill;rr(c,x,y,w,h,r);c.fill();if(line){c.strokeStyle=line;c.lineWidth=lw;c.stroke();}}
function crossSign(c,x,y,s,col='#ff4d6d'){c.fillStyle='#fff';circ(c,x,y,s*1.3);c.fillStyle=col;c.fillRect(x-s*.3,y-s*.9,s*.6,s*1.8);c.fillRect(x-s*.9,y-s*.3,s*1.8,s*.6);}
function numBtn(c,x,y,r,n,col='#5aa8ff',glow){c.save();c.translate(x,y);if(glow){c.fillStyle='rgba(255,255,255,.55)';circ(c,0,0,r+8+Math.sin(T*6)*4);}c.fillStyle=shade(col,-.28);circ(c,0,5,r);c.fillStyle=gfill(c,0,0,r,col,.3,-.1);circ(c,0,0,r);c.fillStyle='rgba(255,255,255,.4)';ell(c,-r*.28,-r*.42,r*.42,r*.2);c.restore();txtO(c,String(n),x,y+2,r*1.05,'#fff',shade(col,-.35),6);}
// ================= medical items =================
const MED={};
function M(k,f){MED[k]=(c,x,y,s=1,o)=>{c.save();c.translate(x,y);c.scale(s,s);c.lineJoin='round';c.lineCap='round';f(c,o||{});c.restore();};}
const hlw=(c,x,y,rx,ry)=>{c.fillStyle='rgba(255,255,255,.6)';ell(c,x,y,rx,ry);};
M('steth',c=>{c.strokeStyle='#5a6a8a';c.lineWidth=5;c.beginPath();c.moveTo(-16,-30);c.quadraticCurveTo(-22,-4,0,4);c.quadraticCurveTo(22,-4,16,-30);c.stroke();c.strokeStyle='#ff6f9a';c.lineWidth=5;c.beginPath();c.moveTo(0,4);c.quadraticCurveTo(-4,18,10,22);c.stroke();
  c.fillStyle='#9aa8c0';circ(c,-16,-31,4);circ(c,16,-31,4);c.fillStyle=gfill(c,12,26,12,'#d8e0f0');OL(c,'#8a98b8');c.beginPath();c.arc(12,26,11,0,TAU);c.fill();c.stroke();c.fillStyle='#b8c4dc';circ(c,12,26,6);hlw(c,8,22,3,2);});
M('syringe',c=>{c.rotate(-.75);c.fillStyle='rgba(220,240,255,.9)';OL(c,'#7a9ac8');rr(c,-7,-20,14,34,3);c.fill();c.stroke();c.fillStyle='rgba(120,200,255,.7)';c.fillRect(-5,-2,10,14);c.strokeStyle='#7a9ac8';c.lineWidth=1.5;for(let i=0;i<5;i++){c.beginPath();c.moveTo(-7,-14+i*6);c.lineTo(-2,-14+i*6);c.stroke();}
  c.fillStyle='#ff8cc0';OL(c,'#e0609a');rr(c,-3,-34,6,14,2);c.fill();c.stroke();rr(c,-10,-38,20,5,2);c.fill();c.stroke();c.fillStyle='#fff';OL(c,'#7a9ac8');rr(c,-10,13,20,4,2);c.fill();c.stroke();c.strokeStyle='#8a98b0';c.lineWidth=2;c.beginPath();c.moveTo(0,17);c.lineTo(0,34);c.stroke();});
M('light',c=>{c.rotate(-.7);c.fillStyle='rgba(255,245,160,.35)';c.beginPath();c.moveTo(-6,-24);c.lineTo(-20,-44);c.lineTo(20,-44);c.lineTo(6,-24);c.closePath();c.fill();c.fillStyle=gfill(c,0,0,20,'#5aa8ff');OL(c,'#2a78d8');rr(c,-6,-24,12,50,5);c.fill();c.stroke();c.fillStyle='#fff8b0';rr(c,-6,-26,12,6,3);c.fill();c.stroke();c.fillStyle='#d8e0f0';c.fillRect(-7,8,14,4);});
M('hotpack',c=>{c.fillStyle=gfill(c,0,0,26,'#ffa05a');OL(c,'#e0703a');rr(c,-26,-18,52,38,14);c.fill();c.stroke();c.fillStyle='#fff';circ(c,-8,-2,2.5);circ(c,8,-2,2.5);c.strokeStyle='#c0502a';c.lineWidth=2;c.beginPath();c.arc(0,4,5,.2,Math.PI-.2);c.stroke();c.fillStyle='rgba(255,90,120,.5)';ell(c,-15,5,4,2.5);ell(c,15,5,4,2.5);
  c.strokeStyle='rgba(255,140,90,.8)';c.lineWidth=3;for(const a of[-10,0,10]){c.beginPath();c.moveTo(a,-24);c.quadraticCurveTo(a-5,-30,a,-36);c.quadraticCurveTo(a+5,-42,a,-46);c.stroke();}});
M('pill',(c,o)=>{c.rotate(-.5);const col=o.col||'#ff4d6d';c.fillStyle=gfill(c,-8,0,14,col);OL(c,col);rr(c,-20,-9,40,18,9);c.fill();c.stroke();c.save();c.beginPath();c.rect(0,-10,22,20);c.clip();c.fillStyle='#fff';rr(c,-20,-9,40,18,9);c.fill();c.restore();OL(c,col);rr(c,-20,-9,40,18,9);c.stroke();hlw(c,-9,-4,6,2.5);});
M('bottle',(c,o)=>{c.fillStyle='rgba(255,170,80,.75)';OL(c,'#d88030');rr(c,-20,-18,40,46,8);c.fill();c.stroke();c.fillStyle='#fff';OL(c,'#b0b8c8');rr(c,-22,-30,44,14,5);c.fill();c.stroke();c.fillStyle='#fff';rr(c,-15,-6,30,22,4);c.fill();crossSign(c,0,5,6);hlw(c,-13,-12,3,6);});
M('xray',c=>{c.fillStyle='#1a2a4a';OL(c,'#8aa0c8');rr(c,-28,-34,56,68,6);c.fill();c.stroke();c.strokeStyle='#dff0ff';c.lineWidth=5;c.beginPath();c.moveTo(-10,-20);c.lineTo(10,20);c.stroke();for(const [a,b] of[[-10,-20],[10,20]]){c.fillStyle='#dff0ff';circ(c,a-3,b-2,5);circ(c,a+3,b+2,5);}c.fillStyle='rgba(120,200,255,.25)';c.fillRect(-28,-34,56,20);});
M('roll',c=>{c.fillStyle='#fff';OL(c,'#b8c4d8');c.beginPath();c.ellipse(0,0,20,24,0,0,TAU);c.fill();c.stroke();c.fillStyle='#e8eef8';ell(c,0,0,9,11);c.strokeStyle='#b8c4d8';c.stroke();c.fillStyle='#fff';c.beginPath();c.moveTo(12,18);c.lineTo(34,30);c.lineTo(30,38);c.lineTo(8,24);c.closePath();c.fill();OL(c,'#b8c4d8');c.stroke();});
M('cast',c=>{c.rotate(-.4);c.fillStyle='#fff';OL(c,'#b8c4d8');rr(c,-12,-30,24,60,10);c.fill();c.stroke();c.strokeStyle='#dde4f0';c.lineWidth=2;for(let i=-24;i<28;i+=8){c.beginPath();c.moveTo(-12,i);c.lineTo(12,i+5);c.stroke();}c.fillStyle='#ff8cc0';heartP(c,0,-6,5);c.fill();c.fillStyle='#ffd23a';star(c,2,14,6,2.6);c.fill();});
M('mirror',c=>{c.rotate(-.6);c.fillStyle='#c8d0e0';OL(c,'#8a98b0');rr(c,-3,-8,6,40,3);c.fill();c.stroke();c.fillStyle=gfill(c,0,-18,12,'#bfe8ff');OL(c,'#8a98b0');c.beginPath();c.arc(0,-18,12,0,TAU);c.fill();c.stroke();hlw(c,-4,-22,4,2.5);});
M('drill',c=>{c.rotate(-.5);c.fillStyle=gfill(c,0,0,20,'#f4f8ff');OL(c,'#9ab0d0');rr(c,-7,-10,14,44,6);c.fill();c.stroke();c.fillStyle='#5ac8ff';c.fillRect(-7,6,14,6);c.fillStyle='#f4f8ff';OL(c,'#9ab0d0');c.beginPath();c.moveTo(-6,-10);c.lineTo(-4,-26);c.lineTo(8,-30);c.lineTo(8,-22);c.lineTo(6,-10);c.closePath();c.fill();c.stroke();c.strokeStyle='#8a98b0';c.lineWidth=2.5;c.beginPath();c.moveTo(4,-26);c.lineTo(4,-36);c.stroke();});
M('filling',c=>{c.fillStyle=gfill(c,0,0,22,'#e8f0ff');OL(c,'#9ab0d8');star(c,0,0,22,10,6);c.fill();c.stroke();c.fillStyle='#fff';star(c,0,0,9,4,4);c.fill();c.fillStyle='#ffd23a';star(c,14,-16,6,2.4,4);c.fill();});
M('brush',c=>{c.rotate(-.5);c.fillStyle=gfill(c,0,0,20,'#e8a868');OL(c,'#b07038');rr(c,-5,0,10,34,5);c.fill();c.stroke();rr(c,-18,-24,36,26,10);c.fill();c.stroke();c.fillStyle='#fff6e8';for(let i=0;i<5;i++)for(let j=0;j<2;j++)circ(c,-12+i*6,-17+j*9,2.2);});
M('clipper',c=>{c.rotate(-.3);c.fillStyle=gfill(c,0,0,20,'#d8e0f0');OL(c,'#8a98b0');rr(c,-22,-7,44,14,6);c.fill();c.stroke();c.fillStyle='#ff8cc0';OL(c,'#d85a90');c.beginPath();c.moveTo(-18,-7);c.lineTo(20,-18);c.lineTo(22,-12);c.lineTo(-14,-2);c.closePath();c.fill();c.stroke();c.fillStyle='#8a98b0';circ(c,16,0,3);});
M('scale',c=>{c.fillStyle=gfill(c,0,0,30,'#f0f4ff');OL(c,'#8a98b8');rr(c,-32,-12,64,32,8);c.fill();c.stroke();c.fillStyle='#fff';c.beginPath();c.arc(0,4,11,0,TAU);c.fill();c.stroke();c.strokeStyle='#ff4d6d';c.lineWidth=2.5;c.beginPath();c.moveTo(0,4);c.lineTo(6,-3);c.stroke();});
M('ambulance',c=>{c.fillStyle='rgba(0,0,0,.15)';ell(c,0,26,36,5);c.fillStyle=gfill(c,-6,-6,36,'#ffffff');OL(c,'#9aa8c0');rr(c,-36,-18,72,40,8);c.fill();c.stroke();c.fillStyle='#ff4d6d';c.fillRect(-36,8,72,6);c.fillStyle='#bfe8ff';rr(c,14,-12,18,12,3);c.fill();crossSign(c,-10,-3,7);
  c.fillStyle=Math.sin(T*10)>0?'#ff3030':'#5aa8ff';rr(c,-6,-26,14,8,3);c.fill();c.fillStyle='#4a4a6a';circ(c,-20,22,7);circ(c,20,22,7);c.fillStyle='#d8d8e8';circ(c,-20,22,3);circ(c,20,22,3);});
M('firetruck',c=>{c.fillStyle='rgba(0,0,0,.15)';ell(c,0,26,36,5);c.fillStyle=gfill(c,-6,-6,36,'#ff4d4d');OL(c,'#c02a2a');rr(c,-36,-16,72,38,8);c.fill();c.stroke();c.fillStyle='#bfe8ff';rr(c,14,-10,18,12,3);c.fill();c.strokeStyle='#e0e0e8';c.lineWidth=3;c.beginPath();c.moveTo(-30,-20);c.lineTo(8,-20);for(let i=-26;i<8;i+=8){c.moveTo(i,-24);c.lineTo(i,-16);}c.stroke();c.fillStyle='#4a4a6a';circ(c,-20,22,7);circ(c,20,22,7);c.fillStyle='#ffd23a';rr(c,-6,-28,12,6,3);c.fill();});
M('love',c=>{c.fillStyle=gfill(c,-6,-6,26,'#ff5f8a');OL(c,'#d83a6a');heartP(c,0,0,26);c.fill();c.stroke();hlw(c,-10,-8,6,4);});
M('heart',c=>{c.fillStyle=gfill(c,-6,-6,26,'#e84a5a');OL(c,'#a82a3a');c.beginPath();c.moveTo(0,26);c.bezierCurveTo(-30,6,-24,-22,-4,-14);c.lineTo(-4,-28);c.lineTo(4,-28);c.lineTo(4,-14);c.bezierCurveTo(24,-22,30,6,0,26);c.closePath();c.fill();c.stroke();c.strokeStyle='#5a8ad8';c.lineWidth=5;c.beginPath();c.moveTo(-12,-16);c.lineTo(-14,-30);c.stroke();hlw(c,-12,-4,5,3);});
M('kit',c=>{c.fillStyle=gfill(c,0,0,30,'#ffffff');OL(c,'#b8c4d8');rr(c,-30,-18,60,42,8);c.fill();c.stroke();c.strokeStyle='#b8c4d8';c.lineWidth=4;c.beginPath();c.moveTo(-10,-18);c.lineTo(-10,-26);c.lineTo(10,-26);c.lineTo(10,-18);c.stroke();crossSign(c,0,3,11);});
M('hospital',c=>{c.fillStyle=gfill(c,0,0,34,'#ffffff');OL(c,'#9ab0d0');rr(c,-30,-24,60,50,4);c.fill();c.stroke();c.fillStyle='#8ad0ff';for(let i=0;i<3;i++)for(let j=0;j<2;j++)c.fillRect(-24+i*18,-2+j*12,10,8);c.fillStyle='#ff9ac8';rr(c,-8,12,16,14,3);c.fill();crossSign(c,0,-32,9);});
M('germ',c=>{c.fillStyle=gfill(c,-4,-4,22,'#8ee07a');c.strokeStyle='#3a9a3a';c.lineWidth=3;c.beginPath();for(let i=0;i<16;i++){const a=i/16*TAU,r=i%2?18:24;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();c.fill();c.stroke();c.fillStyle='#fff';ell(c,-7,-3,5,6);ell(c,7,-3,5,6);c.fillStyle='#222';circ(c,-6,-2,2.6);circ(c,6,-2,2.6);c.strokeStyle='#222';c.lineWidth=2.5;c.beginPath();c.arc(0,9,5,Math.PI*1.1,Math.PI*1.9);c.stroke();});
M('ticket',(c,o)=>{c.fillStyle='#fffbe8';OL(c,'#e0b040');rr(c,-24,-30,48,60,6);c.fill();c.stroke();c.fillStyle='#ffc93c';c.fillRect(-24,-30,48,12);txt(c,String(o.n??1),0,6,30,'#e0602a');});
M('phone',c=>{c.fillStyle=gfill(c,0,0,30,'#5a6a8a');OL(c,'#3a4a6a');rr(c,-18,-32,36,64,8);c.fill();c.stroke();c.fillStyle='#bfe8ff';rr(c,-13,-26,26,16,3);c.fill();c.fillStyle='#fff';for(let i=0;i<3;i++)for(let j=0;j<3;j++)circ(c,-9+i*9,-2+j*9,3);txt(c,'119',0,-18,11,'#ff4d6d');});
M('stretcher',c=>{c.fillStyle='#ff8cc0';OL(c,'#d85a90');rr(c,-36,-8,72,12,5);c.fill();c.stroke();c.fillStyle='#fff';rr(c,-30,-14,20,8,4);c.fill();c.strokeStyle='#8a98b0';c.lineWidth=3;c.beginPath();c.moveTo(-26,4);c.lineTo(-26,18);c.moveTo(26,4);c.lineTo(26,18);c.stroke();c.fillStyle='#4a4a6a';circ(c,-26,20,4);circ(c,26,20,4);});
M('ruler',c=>{c.fillStyle=gfill(c,0,0,30,'#ffe08a');OL(c,'#d0a030');rr(c,-8,-36,16,70,4);c.fill();c.stroke();c.strokeStyle='#a07020';c.lineWidth=2;for(let i=0;i<9;i++){c.beginPath();c.moveTo(-8,-30+i*8);c.lineTo(i%2?-2:2,-30+i*8);c.stroke();}c.fillStyle='#5aa8ff';rr(c,-20,-40,28,6,3);c.fill();});
M('headphone',c=>{c.strokeStyle='#5a6a8a';c.lineWidth=6;c.beginPath();c.arc(0,4,24,Math.PI,TAU);c.stroke();for(const s of[-1,1]){c.fillStyle=gfill(c,s*24,8,12,s<0?'#ff8cc0':'#5aa8ff');OL(c,'#5a6a8a');rr(c,s*24-8,-4,16,24,7);c.fill();c.stroke();}});
M('mask',c=>{c.fillStyle='#fff';OL(c,'#9ab0d0');rr(c,-22,-14,44,28,10);c.fill();c.stroke();c.strokeStyle='#c8d4e8';c.lineWidth=2;for(const y of[-5,2,9]){c.beginPath();c.moveTo(-18,y);c.lineTo(18,y);c.stroke();}c.strokeStyle='#9ab0d0';c.beginPath();c.moveTo(-22,-8);c.lineTo(-32,-12);c.moveTo(22,-8);c.lineTo(32,-12);c.stroke();});
M('onigiri',c=>{c.fillStyle=gfill(c,0,-4,26,'#ffffff');OL(c,'#c8c8d8');c.beginPath();c.moveTo(0,-26);c.quadraticCurveTo(28,14,22,20);c.quadraticCurveTo(0,26,-22,20);c.quadraticCurveTo(-28,14,0,-26);c.closePath();c.fill();c.stroke();c.fillStyle='#2a4a3a';rr(c,-11,6,22,18,3);c.fill();});
M('meat',c=>{c.fillStyle='#fff';OL(c,'#c8c0b0');rr(c,12,-6,20,8,4);c.fill();c.stroke();circ(c,32,-6,5);circ(c,32,2,5);c.fillStyle=gfill(c,-6,-4,24,'#c8603a');OL(c,'#8a3a1a');c.beginPath();c.ellipse(-4,0,22,17,.2,0,TAU);c.fill();c.stroke();hlw(c,-10,-6,6,3);});
M('broccoli',c=>{c.fillStyle='#8ad07a';OL(c,'#4a904a');rr(c,-6,2,12,24,4);c.fill();c.stroke();c.fillStyle=gfill(c,0,-10,24,'#4cb84a');for(const [a,b,r] of[[-12,-6,11],[12,-6,11],[0,-14,13],[-6,2,9],[6,2,9]]){c.beginPath();c.arc(a,b,r,0,TAU);c.fill();c.stroke();}});
M('ribbon',c=>{bow(c,0,0,14,'#ff5fa2');});
M('rikki',c=>{drawRikki(c,0,30,{sc:1.6,t:0,happy:1,toy:false});});
M('landolt',(c,o)=>{const a=o.a||0;c.rotate(a);c.strokeStyle='#222';c.lineWidth=10;c.beginPath();c.arc(0,0,20,.45,TAU-.45);c.stroke();});
function drawThing(c,k,x,y,s=1,o){if(MED[k])return MED[k](c,x,y,s,o);if(AN[k])return drawAnimal(c,k,x,y+44*s,s*.42,{t:0,happy:1});drawItem(c,k,x,y,s);}
// card: show a number too
const _drawCard=drawCard;
drawCard=function(c){if(!card)return;if(card.num==null)return _drawCard(c);const a=Math.min(1,card.t*5,(3-card.t)*3);if(a<=0)return;c.save();c.globalAlpha=a;const sc=elastic(Math.min(1,card.t*2.5))*.2+.8;c.translate(W/2,H*.2);c.scale(sc,sc);
  c.fillStyle='rgba(90,40,110,.2)';rr(c,-170,-62,340,132,28);c.fill();c.fillStyle='#fffdf6';c.strokeStyle='#5aa8ff';c.lineWidth=5;rr(c,-170,-68,340,132,28);c.fill();c.stroke();
  txtO(c,String(card.num),-100,-2,72,'#ff5fa2','#fff',8);txt(c,card.ja,50,-24,card.ja.length>5?28:36,'#ff5fa2');txt(c,card.en,50,26,card.en.length>9?24:30,'#3a88e8');c.restore();};
const TIPS={
  reception:['びょういんでは ばんごうで よばれるよ。 じぶんの ばんごうを おぼえておこう','びょういんの まちあいしつでは しずかに まとうね','ほけんしょうと しんさつけんを わすれずに もっていこう'],
  naika:['めに ゴミが はいったら こすらずに めぐすりや おみずで あらおう','かゆくても かかないで ぬりぐすりを ぬろうね','みみに むしが はいったら すぐに おいしゃさんへ いこう','かぜの ときは あたたかくして、 すいぶんを とって ゆっくり ねようね','そとから かえったら てあらいと うがいで ばいきんを やっつけよう','しんぞうは 1ぷんかんに 80かいから 100かいも どきどき うごいているよ','おねつは からだが ばいきんと たたかっている しるしなんだよ','よぼうちゅうしゃは びょうきに なりにくく する バリアだよ'],
  geka:['とげが ささったら むりに ほじらないで おとなに みせよう','たんこぶは つめたく ひやすと ちいさく なるよ','けがを したら まず おみずで きずぐちを きれいに あらおう','ひとの からだには ほねが およそ 200こ も あるんだよ','ほねを つよく するには ぎゅうにゅうや おさかなの カルシウムが だいじ','レントゲンを つかうと からだの なかの ほねが みえるんだ'],
  dentist:['ぬけた こどもの はの あとから おとなの はが はえてくるよ','こどもの はは 20ぽん、 おとなの はは 32ほん あるよ','あまい ものを たべたら はみがきを しようね','むしばは ミュータンスきん という ばいきんが つくるんだ','はみがきは 1にち 2かい、 ねる まえは とくに ていねいにね','6さい くらいから おとなの はが はえてくるよ'],
  pet:['ノミは どうぶつの けの なかで ぴょんぴょん はねる ちいさな むしだよ','うさぎは にんじん、 ねこは おさかなが だいすき','どうぶつの おいしゃさんは じゅうい さん って いうんだよ','いぬの たいおんは 38ど くらいで、 ひとより すこし たかいんだ','ペットも よぼうちゅうしゃを するよ','ねこは 1にちに 12じかんいじょう ねむるんだって'],
  ambulance:['きゅうきゅうしゃを よぶ でんわばんごうは 119ばん！','119ばんは かじの ときも つかうよ。 かじは しょうぼうしゃ','きゅうきゅうしゃが きたら くるまは みちを ゆずるよ','きゅうきゅうたいいんさんは くるまの なかでも てあてを するよ'],
  pharmacy:['シロップの おくすりは めもりを よく みて はかるよ','おくすりは きめられた かずだけ のもうね','おくすりは おうちの ひとと いっしょに のもうね','おくすりを だす ひとは やくざいし さん って いうよ','カプセルは なかに こなの おくすりが はいっているよ'],
  checkup:['あかちゃんの しんぞうは おとなより はやく うごいているよ','あかちゃんは うまれてから 1ねんで しんちょうが 25センチも のびるよ','しりょくけんさの Cの マークは ランドルトかん って いうんだ','よく ねると せが のびる ホルモンが でるよ','みみは おとを きく だけじゃなく からだの バランスも とっているよ'],
  body:['のうは からだの しれいとう。 かんがえたり おぼえたり するよ','はいは いきを すって さんそを からだに とりこむよ','いぶくろは たべものを どろどろに とかすよ','ちょうは とっても ながくて、 えいようを きゅうしゅう するよ','しんぞうは ちを からだじゅうに おくる ポンプだよ'],
  meal:['デザートは ごはんを ちゃんと たべてから すこしだけ','あかの たべものは ちや にくを つくる','きいろの たべものは からだを うごかす ちからに なる','みどりの たべものは からだの ちょうしを ととのえる','3つの いろを バランスよく たべると げんきに なれるよ'],
};
// ================= tool tray (choose the right tool) =================
// tools: array of keys; target: key; returns index hit
function toolRow(keys,y){const n=keys.length,gap=Math.min(130,(W-60)/n);return keys.map((k,i)=>({k,x:W/2+(i-(n-1)/2)*gap,y}));}
Dr.prototype.draw=function(c,sz=1.4){if(this.hidden)return;c.fillStyle='rgba(90,40,110,.15)';ell(c,this.x,this.y+30+(this.held?14:0),30*this.s,8);c.save();c.translate(this.x,this.y-(this.held?14:0));c.rotate(this.rot);drawThing(c,this.k,0,0,sz*this.s,this.o);c.restore();};
function mkTray(keys,y,r=50){const n=keys.length,gap=Math.min(135,(W-70)/n);return keys.map((k,i)=>new Dr({k,hx:W/2+(i-(n-1)/2)*gap,hy:y,r}));}
function trayChoices(correct,pool,n=4){return shuffle([correct,...shuffle(pool.filter(k=>k!==correct)).slice(0,n-1)]);}
function progRing(c,x,y,r,p,col='#ff5fa2'){c.strokeStyle='rgba(255,255,255,.8)';c.lineWidth=12;c.beginPath();c.arc(x,y,r,0,TAU);c.stroke();c.strokeStyle=col;c.lineWidth=8;c.beginPath();c.arc(x,y,r,-Math.PI/2,-Math.PI/2+TAU*clamp(p,0,1));c.stroke();}
function targetMark(c,x,y,r=46){const k=(T*1.5)%1;c.strokeStyle=`rgba(255,95,162,${.8*(1-k)})`;c.lineWidth=5;c.setLineDash([10,8]);c.beginPath();c.arc(x,y,r+k*16,0,TAU);c.stroke();c.setLineDash([]);}
function starsFor(miss){return miss<=1?3:miss<=3?2:1;}

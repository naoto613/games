// ================= icons & words =================
const COL={red:'#ff4a5a',blue:'#3a8aff',yellow:'#ffd23a',green:'#3ec46a',pink:'#ff8cc6',purple:'#a060e0',orange:'#ff9a2a',black:'#2a2a33',white:'#ffffff',brown:'#a0643a'};
const JA_NUM=['ぜろ','いち','に','さん','よん','ご','ろく','なな','はち','きゅう','じゅう','じゅういち','じゅうに','じゅうさん','じゅうよん','じゅうご','じゅうろく','じゅうなな','じゅうはち','じゅうきゅう','にじゅう'];
const EN_NUM=['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen','twenty'];
const WORDS={
  apple:['りんご','apple'],banana:['バナナ','banana'],cake:['ケーキ','cake'],strawberry:['いちご','strawberry'],candy:['キャンディ','candy'],cookie:['クッキー','cookie'],carrot:['にんじん','carrot'],
  fish:['さかな','fish'],bone:['ほね','bone'],icecream:['アイス','ice cream'],donut:['ドーナツ','donut'],grape:['ぶどう','grapes'],milk:['ミルク','milk'],
  star:['ほし','star'],moon:['つき','moon'],sun:['たいよう','sun'],flower:['はな','flower'],leaf:['はっぱ','leaf'],cloud:['くも','cloud'],rainbow:['にじ','rainbow'],shell:['かいがら','shell'],crab:['かに','crab'],octopus:['たこ','octopus'],
  feather:['はね','feather'],paw:['あしあと','footprint'],pawcat:['ねこの あしあと','footprint'],birdprint:['とりの あしあと','footprint'],key:['かぎ','key'],book:['ほん','book'],pencil:['えんぴつ','pencil'],ball:['ボール','ball'],balloon:['ふうせん','balloon'],
  bell:['すず','bell'],ribbon:['リボン','ribbon'],gem:['ほうせき','jewel'],crown:['かんむり','crown'],clock:['とけい','clock'],paint:['えのぐ','paint'],brush:['ふで','brush'],map:['ちず','map'],letter:['てがみ','letter'],chest:['たからばこ','treasure box'],
  lock:['じょうまえ','lock'],hat:['ぼうし','hat'],glasses:['めがね','glasses'],umbrella:['かさ','umbrella'],powder:['こな','powder'],tail:['しっぽ','tail'],house:['いえ','house'],car:['くるま','car'],heart:['ハート','heart'],
  thermo:['たいおんけい','thermometer'],steth:['ちょうしんき','stethoscope'],light:['ライト','light'],xray:['レントゲン','x-ray'],lens:['むしめがね','magnifying glass'],band:['ばんそうこう','bandage'],med:['くすり','medicine'],ice:['こおり','ice'],tooth:['は','tooth'],toothbrush:['はブラシ','toothbrush'],
  red:['あか','red'],blue:['あお','blue'],yellow:['きいろ','yellow'],green:['みどり','green'],pink:['ピンク','pink'],purple:['むらさき','purple'],orange:['オレンジ','orange'],black:['くろ','black'],white:['しろ','white'],brown:['ちゃいろ','brown'],
  cat:['ねこ','cat'],dog:['いぬ','dog'],rabbit:['うさぎ','rabbit'],bear:['くま','bear'],panda:['パンダ','panda'],pig:['ぶた','pig'],fox:['きつね','fox'],raccoon:['アライグマ','raccoon'],mouse:['ねずみ','mouse'],lion:['ライオン','lion'],
  sheep:['ひつじ','sheep'],elephant:['ぞう','elephant'],penguin:['ペンギン','penguin'],owl:['ふくろう','owl'],crow:['カラス','crow'],chick:['ひよこ','chick'],turtle:['かめ','turtle'],bird:['とり','bird'],
  circle:['まる','circle'],triangle:['さんかく','triangle'],square:['しかく','square'],
};
const WORD_ORDER=Object.keys(WORDS);
// icon key -> word key
function wordKey(k){if(!k)return null;if(k.startsWith('c:')||k.startsWith('a:')||k.startsWith('s:'))return k.slice(2);if(k.startsWith('med:'))return'med';if(k.startsWith('gem'))return'gem';return WORDS[k]?k:null;}
function wordOf(k){if(k&&k.startsWith('n:')){const n=+k.slice(2);return[JA_NUM[n]||String(n),EN_NUM[n]||String(n)];}if(k&&k.startsWith('l:'))return[k.slice(2),k.slice(2)];const w=wordKey(k);return w?WORDS[w]:null;}
function iconOfWord(w){if(COL[w])return'c:'+w;if(AN[w]&&w!=='kuroneko')return'a:'+w;if(w==='circle'||w==='triangle'||w==='square')return's:'+w;if(w==='bird')return'a:chick';return w;}
const DIAG={cold:'かぜ',tummy:'おなか いたい',thorn:'とげ',tooth:'むしば',swallow:'のみこんだ',scrape:'すりきず',powder:'へんな こな',tired:'つかれ'};
function drawIcon(c,k,x,y,s=1){if(!k)return;c.save();c.translate(x,y);c.scale(s,s);c.lineJoin='round';c.lineCap='round';c.lineWidth=2.2;c.strokeStyle=LN;
  if(k.startsWith('c:')){const col=COL[k.slice(2)]||'#ccc';c.fillStyle=col;c.beginPath();for(let i=0;i<12;i++){const a=i/12*TAU,r=i%2?19:23;c.lineTo(Math.cos(a)*r,Math.sin(a)*r);}c.closePath();c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.45)';ell(c,-7,-8,6,4,-.5);c.restore();return;}
  if(k.startsWith('n:')){const n=k.slice(2);c.fillStyle=gfill(c,0,0,24,'#fff6c8');circ(c,0,0,24);c.stroke();otext(c,n,0,2,n.length>1?26:32,'#ff5fa2','#fff',"center",POP);c.restore();return;}
  if(k.startsWith('l:')){const l=k.slice(2);c.fillStyle=gfill(c,0,0,26,'#d8f0ff');rr(c,-22,-22,44,44,10);c.fill();c.stroke();otext(c,l,0,2,30,'#3a6ad8','#fff','center',POP);c.restore();return;}
  if(k.startsWith('a:')){const a=k.slice(2);if(a==='kuro')drawKuro(c,0,22,.36,T);else{const b=AN[a]&&AN[a].bird;drawAnimal(c,a,0,b?24:26,b?.36:.34,{noShadow:1,t:0});}c.restore();return;}
  if(k.startsWith('med:')){const col=COL[k.slice(4)]||k.slice(4);c.fillStyle='rgba(255,255,255,.5)';rr(c,-13,-16,26,34,6);c.fill();c.fillStyle=col;rr(c,-13,-6,26,24,6);c.fill();c.strokeStyle=LN;rr(c,-13,-16,26,34,6);c.stroke();c.fillStyle='#fff';rr(c,-8,-24,16,9,3);c.fill();c.stroke();c.fillStyle='#fff';rr(c,-8,0,16,10,2);c.fill();c.fillStyle='#ff6f91';c.fillRect(-1.2,1.5,2.4,7);c.fillRect(-3.5,3.8,7,2.4);c.restore();return;}
  if(k.startsWith('gem')){const col=k.includes(':')?k.split(':')[1]:'#8ad8ff';drawGlow(c,col,0,0,30,.6);c.fillStyle=gfill(c,-4,-6,22,col,.5);c.beginPath();c.moveTo(-18,-5);c.lineTo(-9,-17);c.lineTo(9,-17);c.lineTo(18,-5);c.lineTo(0,19);c.closePath();c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.7)';c.beginPath();c.moveTo(-9,-17);c.lineTo(0,-5);c.lineTo(-18,-5);c.fill();c.strokeStyle='rgba(255,255,255,.6)';c.lineWidth=1.2;c.beginPath();c.moveTo(-18,-5);c.lineTo(18,-5);c.moveTo(0,-5);c.lineTo(0,19);c.stroke();c.restore();return;}
  if(k.startsWith('s:')){const sh=k.slice(2);c.fillStyle='#8ad0ff';c.beginPath();if(sh==='circle')c.arc(0,0,20,0,TAU);else if(sh==='triangle'){c.moveTo(0,-21);c.lineTo(22,17);c.lineTo(-22,17);c.closePath();}else rr(c,-18,-18,36,36,3);c.fill();c.stroke();c.restore();return;}
  const F=(col)=>c.fillStyle=col;
  switch(k){
    case'cake':F('#fff6ea');rr(c,-20,-4,40,22,4);c.fill();c.stroke();F('#ffb3d6');rr(c,-21,-10,42,10,5);c.fill();c.stroke();F('#ff4d6d');c.fillRect(-20,6,40,4);F('#ff4a5a');circ(c,0,-15,6);c.stroke();F('#4cae4a');c.fillRect(-1,-23,2,4);break;
    case'strawberry':F('#ff4a5a');c.beginPath();c.moveTo(0,20);c.bezierCurveTo(-24,4,-18,-14,0,-12);c.bezierCurveTo(18,-14,24,4,0,20);c.fill();c.stroke();F('#ffe88a');for(const[a,b]of[[-7,-3],[5,-4],[-2,5],[8,5],[-9,8],[0,12]])ell(c,a,b,1.2,1.8);F('#4cae4a');starP(c,0,-14,10,4,5);c.fill();c.stroke();break;
    case'apple':F(gfill(c,-5,-2,22,'#ff4a5a'));c.beginPath();c.moveTo(0,-10);c.bezierCurveTo(-28,-22,-24,24,0,18);c.bezierCurveTo(24,24,28,-22,0,-10);c.fill();c.stroke();c.strokeStyle='#7a4a2a';c.lineWidth=3;c.beginPath();c.moveTo(0,-10);c.lineTo(2,-20);c.stroke();F('#4cae4a');c.strokeStyle=LN;c.lineWidth=2;ell(c,9,-18,7,4,-.4);c.stroke();break;
    case'banana':F('#ffe04a');c.beginPath();c.moveTo(-20,-10);c.quadraticCurveTo(-14,20,20,12);c.quadraticCurveTo(18,6,16,6);c.quadraticCurveTo(-8,8,-12,-12);c.closePath();c.fill();c.stroke();F('#7a5a2a');c.fillRect(-22,-14,6,5);break;
    case'candy':F('#ff8cc6');c.beginPath();c.moveTo(-12,0);c.lineTo(-24,-10);c.lineTo(-24,10);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(12,0);c.lineTo(24,-10);c.lineTo(24,10);c.closePath();c.fill();c.stroke();F(gfill(c,-3,-3,14,'#ff5fa8'));circ(c,0,0,13);c.stroke();c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.arc(0,0,7,0,Math.PI*1.5);c.stroke();break;
    case'cookie':F('#e0a860');circ(c,0,0,20);c.stroke();F('#6a3a1a');for(const[a,b]of[[-8,-6],[6,-9],[-3,6],[9,5],[0,-1]])circ(c,a,b,2.6);break;
    case'carrot':F('#ff8a2a');c.beginPath();c.moveTo(-8,-12);c.lineTo(8,-12);c.lineTo(0,22);c.closePath();c.fill();c.stroke();F('#4cae4a');for(const a of[-.4,0,.4]){c.save();c.translate(0,-12);c.rotate(a);ell(c,0,-8,3,8);c.stroke();c.restore();}break;
    case'fish':F(gfill(c,-4,-2,20,'#5aa8ff'));c.beginPath();c.moveTo(-20,0);c.quadraticCurveTo(0,-16,14,0);c.quadraticCurveTo(0,16,-20,0);c.fill();c.stroke();c.beginPath();c.moveTo(12,0);c.lineTo(24,-10);c.lineTo(24,10);c.closePath();c.fill();c.stroke();F('#fff');circ(c,-10,-2,3.5);F('#111');circ(c,-10,-2,1.8);break;
    case'bone':F('#fff8e8');c.save();c.rotate(-.5);rr(c,-14,-5,28,10,4);c.fill();c.stroke();for(const sx of[-1,1])for(const sy of[-1,1]){circ(c,sx*16,sy*5,6);c.stroke();}rr(c,-14,-5,28,10,4);c.fill();c.restore();break;
    case'icecream':F('#e8b870');c.beginPath();c.moveTo(-12,-2);c.lineTo(12,-2);c.lineTo(0,24);c.closePath();c.fill();c.stroke();F('#ffb3d6');circ(c,0,-8,12);c.stroke();F('#fff6d8');circ(c,-6,-16,8);c.stroke();F('#ff4a5a');circ(c,4,-20,3.5);break;
    case'donut':F('#e8a860');circ(c,0,0,21);c.stroke();F('#ff8cc6');c.beginPath();c.arc(0,0,18,0,TAU);c.fill();F('#fff');circ(c,0,0,7);c.stroke();for(const[a,b,col]of[[-10,-6,'#5aa8ff'],[8,-10,'#ffe04a'],[10,6,'#fff'],[-6,10,'#4cae4a']]){F(col);c.save();c.translate(a,b);c.rotate(a);c.fillRect(-3,-1,6,2.4);c.restore();}break;
    case'grape':F('#9a5ad8');for(const[a,b]of[[-8,-8],[0,-8],[8,-8],[-4,0],[4,0],[0,8]]){circ(c,a,b,6);c.stroke();}F('#4cae4a');ell(c,4,-18,6,3,-.4);c.stroke();break;
    case'milk':F('#fff');c.beginPath();c.moveTo(-12,-8);c.lineTo(0,-20);c.lineTo(12,-8);c.lineTo(12,20);c.lineTo(-12,20);c.closePath();c.fill();c.stroke();F('#5aa8ff');c.fillRect(-11,2,22,8);break;
    case'star':F(gfill(c,-3,-4,22,'#ffd23a',.5));starP(c,0,1,22,10);c.fill();c.stroke();F('rgba(255,255,255,.6)');ell(c,-5,-5,4,3);break;
    case'moon':F('#ffe36a');c.beginPath();c.arc(0,0,20,.6,5.7);c.arc(9,-5,15,5.2,1.1,true);c.closePath();c.fill();c.stroke();break;
    case'sun':F('#ffb03a');for(let i=0;i<8;i++){c.save();c.rotate(i/8*TAU);c.beginPath();c.moveTo(-5,-15);c.lineTo(0,-24);c.lineTo(5,-15);c.fill();c.restore();}F(gfill(c,-3,-3,15,'#ffd23a'));circ(c,0,0,14);c.stroke();break;
    case'flower':for(let i=0;i<5;i++){const a=i/5*TAU;F('#ff8cc6');circ(c,Math.cos(a)*10,Math.sin(a)*10,9);c.stroke();}F('#ffd23a');circ(c,0,0,7);c.stroke();break;
    case'leaf':F('#4cae4a');c.beginPath();c.moveTo(-18,16);c.quadraticCurveTo(-18,-16,18,-18);c.quadraticCurveTo(16,18,-18,16);c.fill();c.stroke();c.beginPath();c.moveTo(-18,16);c.lineTo(10,-10);c.stroke();break;
    case'cloud':F('#fff');for(const[a,b,r]of[[-10,4,10],[2,-4,13],[13,5,9]]){circ(c,a,b,r);c.stroke();}for(const[a,b,r]of[[-10,4,10],[2,-4,13],[13,5,9]])circ(c,a,b,r-1.5);break;
    case'rainbow':c.lineWidth=4.5;['#ff4a5a','#ff9a2a','#ffd23a','#3ec46a','#3a8aff','#a060e0'].forEach((col,i)=>{c.strokeStyle=col;c.beginPath();c.arc(0,14,24-i*4,Math.PI,TAU);c.stroke();});break;
    case'shell':F('#ffc8d8');c.beginPath();c.moveTo(0,18);c.lineTo(-20,-4);c.quadraticCurveTo(0,-26,20,-4);c.closePath();c.fill();c.stroke();for(const a of[-12,-5,5,12]){c.beginPath();c.moveTo(0,18);c.lineTo(a,-12);c.stroke();}break;
    case'crab':F('#ff5a4a');for(const sd of[-1,1]){c.beginPath();c.moveTo(sd*12,-4);c.lineTo(sd*22,-14);c.stroke();circ(c,sd*22,-18,6);c.stroke();for(let i=0;i<3;i++){c.beginPath();c.moveTo(sd*12,2+i*4);c.lineTo(sd*22,6+i*5);c.stroke();}}ell(c,0,4,16,11);c.stroke();F('#fff');circ(c,-5,-8,4);circ(c,5,-8,4);F('#111');circ(c,-5,-8,2);circ(c,5,-8,2);break;
    case'octopus':F('#ff7a9a');for(let i=0;i<5;i++){c.beginPath();c.moveTo(-14+i*7,4);c.quadraticCurveTo(-18+i*9,22,-12+i*8,20);c.lineTo(-10+i*7,6);c.fill();c.stroke();}circ(c,0,-4,15);c.stroke();F('#fff');circ(c,-5,-5,4);circ(c,5,-5,4);F('#111');circ(c,-5,-5,2);circ(c,5,-5,2);break;
    case'feather':c.rotate(-.5);F('#2a2a3a');c.beginPath();c.moveTo(0,24);c.quadraticCurveTo(-14,0,0,-24);c.quadraticCurveTo(14,0,0,24);c.fill();c.stroke();c.strokeStyle='#8a8aa8';c.beginPath();c.moveTo(0,26);c.lineTo(0,-20);c.stroke();break;
    case'paw':case'pawcat':F(k==='paw'?'#8a5a3a':'#4a3a5a');ell(c,0,6,10,8);for(const[a,b]of[[-11,-6],[-4,-13],[4,-13],[11,-6]])ell(c,a,b,4,5);break;
    case'birdprint':c.strokeStyle='#6a4a3a';c.lineWidth=6;c.beginPath();c.moveTo(0,14);c.lineTo(0,0);c.moveTo(0,0);c.lineTo(-12,-14);c.moveTo(0,0);c.lineTo(0,-18);c.moveTo(0,0);c.lineTo(12,-14);c.stroke();F('#6a4a3a');circ(c,0,2,6);circ(c,0,15,4);break;
    case'key':F('#ffd23a');circ(c,-10,0,10);c.stroke();F('#fff6c8');circ(c,-10,0,4);c.stroke();F('#ffd23a');rr(c,-1,-3,24,6,2);c.fill();c.stroke();c.fillRect(14,2,4,8);c.strokeRect(14,2,4,8);break;
    case'book':F('#5aa8ff');rr(c,-18,-16,36,32,4);c.fill();c.stroke();F('#fff');c.fillRect(-14,-12,4,24);F('#ffd23a');starP(c,4,0,7,3);c.fill();break;
    case'pencil':c.rotate(-.7);F('#ffd23a');c.fillRect(-16,-5,26,10);c.strokeRect(-16,-5,26,10);F('#f5d0a8');c.beginPath();c.moveTo(10,-5);c.lineTo(20,0);c.lineTo(10,5);c.closePath();c.fill();c.stroke();F('#2a2a33');circ(c,19,0,1.8);F('#ff8cb0');c.fillRect(-21,-5,5,10);c.strokeRect(-21,-5,5,10);break;
    case'ball':F(gfill(c,-4,-4,20,'#ff5a6a'));circ(c,0,0,19);c.stroke();c.strokeStyle='#fff';c.lineWidth=3;c.beginPath();c.moveTo(-19,0);c.quadraticCurveTo(0,8,19,0);c.stroke();break;
    case'balloon':c.strokeStyle='#8a7a9a';c.beginPath();c.moveTo(0,14);c.quadraticCurveTo(4,20,0,26);c.stroke();c.strokeStyle=LN;F(gfill(c,-4,-8,18,'#ff6f91'));ell(c,0,-4,15,18);c.stroke();F('rgba(255,255,255,.6)');ell(c,-6,-10,4,6);break;
    case'bell':F('#ffd23a');c.beginPath();c.moveTo(-16,12);c.quadraticCurveTo(-14,-18,0,-18);c.quadraticCurveTo(14,-18,16,12);c.closePath();c.fill();c.stroke();F('#c8900a');circ(c,0,15,4);break;
    case'ribbon':bow(c,0,0,'#ff5fa2',2.3);break;
    case'crown':F(gfill(c,0,-4,20,'#ffd23a'));c.beginPath();c.moveTo(-18,14);c.lineTo(-20,-12);c.lineTo(-9,-2);c.lineTo(0,-18);c.lineTo(9,-2);c.lineTo(20,-12);c.lineTo(18,14);c.closePath();c.fill();c.stroke();F('#ff4a6a');circ(c,0,4,4);F('#5aa8ff');circ(c,-10,6,3);circ(c,10,6,3);break;
    case'clock':F('#fff');circ(c,0,0,21);c.stroke();c.strokeStyle='#ff7ab8';c.lineWidth=3;c.beginPath();c.arc(0,0,21,0,TAU);c.stroke();c.strokeStyle=LN;c.lineWidth=2.5;c.beginPath();c.moveTo(0,0);c.lineTo(0,-13);c.moveTo(0,0);c.lineTo(9,4);c.stroke();F('#ff7ab8');circ(c,0,0,2.5);break;
    case'paint':F('#f0d8a8');c.beginPath();c.ellipse(0,0,22,17,0,0,TAU);c.fill();c.stroke();F('#fff');circ(c,8,6,4);c.stroke();for(const[a,b,col]of[[-10,-6,'#ff4a5a'],[0,-10,'#ffd23a'],[10,-6,'#3a8aff'],[-12,5,'#3ec46a']]){F(col);circ(c,a,b,4.5);}break;
    case'brush':c.rotate(-.7);F('#c8904a');c.fillRect(-20,-3,24,6);c.strokeRect(-20,-3,24,6);F('#c0c0c8');c.fillRect(4,-4,6,8);F('#ff5fa2');c.beginPath();c.moveTo(10,-4);c.quadraticCurveTo(24,0,10,4);c.closePath();c.fill();c.stroke();break;
    case'map':F('#fff0c8');c.beginPath();c.moveTo(-20,-14);c.lineTo(-7,-18);c.lineTo(7,-14);c.lineTo(20,-18);c.lineTo(20,14);c.lineTo(7,18);c.lineTo(-7,14);c.lineTo(-20,18);c.closePath();c.fill();c.stroke();c.setLineDash([3,3]);c.strokeStyle='#ff4a5a';c.beginPath();c.moveTo(-14,10);c.quadraticCurveTo(0,-4,10,-6);c.stroke();c.setLineDash([]);c.strokeStyle='#ff4a5a';c.lineWidth=3;c.beginPath();c.moveTo(8,-10);c.lineTo(14,-4);c.moveTo(14,-10);c.lineTo(8,-4);c.stroke();break;
    case'letter':F('#fff');rr(c,-20,-13,40,28,3);c.fill();c.stroke();c.beginPath();c.moveTo(-20,-13);c.lineTo(0,4);c.lineTo(20,-13);c.stroke();F('#ff5fa2');heartP(c,0,3,4);c.fill();break;
    case'chest':F('#b8743a');rr(c,-22,-4,44,22,3);c.fill();c.stroke();F('#d08a4a');c.beginPath();c.moveTo(-22,-4);c.quadraticCurveTo(0,-24,22,-4);c.closePath();c.fill();c.stroke();F('#ffd23a');c.fillRect(-22,-5,44,4);rr(c,-5,-4,10,10,2);c.fill();c.stroke();break;
    case'lock':c.strokeStyle='#8a8a9a';c.lineWidth=5;c.beginPath();c.arc(0,-6,10,Math.PI,TAU);c.stroke();c.strokeStyle=LN;c.lineWidth=2.2;F('#ffd23a');rr(c,-16,-6,32,24,4);c.fill();c.stroke();F(LN);circ(c,0,4,3);c.fillRect(-1.5,4,3,7);break;
    case'hat':F('#2a2030');ell(c,0,12,24,6);c.stroke();rr(c,-14,-18,28,30,3);c.fill();c.stroke();F('#ff4d6d');c.fillRect(-14,4,28,5);break;
    case'glasses':c.strokeStyle='#3a2a4a';c.lineWidth=3;c.beginPath();c.arc(-11,0,9,0,TAU);c.moveTo(20,0);c.arc(11,0,9,0,TAU);c.moveTo(-2,0);c.lineTo(2,0);c.stroke();break;
    case'umbrella':F('#5aa8ff');c.beginPath();c.arc(0,0,22,Math.PI,TAU);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(0,0);c.lineTo(0,16);c.arc(-4,16,4,0,Math.PI);c.stroke();break;
    case'powder':F('#b070e8');c.beginPath();c.moveTo(-22,14);c.quadraticCurveTo(0,-14,22,14);c.closePath();c.fill();c.stroke();F('#fff');for(const[a,b]of[[-8,4],[4,-2],[10,8],[-2,10]]){starP(c,a,b,3,1.2);c.fill();}break;
    case'tail':c.rotate(.5);F('#9a9aa8');ell(c,0,0,10,24);c.stroke();F('#3a3a4a');for(let i=-1;i<=1;i++)c.fillRect(-9,i*11-3,18,6);break;
    case'house':F('#ffe0b0');rr(c,-16,-4,32,24,3);c.fill();c.stroke();F('#ff6f91');c.beginPath();c.moveTo(-22,-2);c.lineTo(0,-22);c.lineTo(22,-2);c.closePath();c.fill();c.stroke();F('#a0643a');rr(c,-5,6,10,14,2);c.fill();break;
    case'car':F('#ff5a6a');rr(c,-22,-6,44,16,6);c.fill();c.stroke();rr(c,-12,-18,24,14,5);c.fill();c.stroke();F('#bfe8ff');rr(c,-8,-15,16,8,3);c.fill();F('#333');circ(c,-12,12,6);circ(c,12,12,6);break;
    case'heart':F(gfill(c,-4,-6,22,'#ff5fa2',.5));heartP(c,0,0,17);c.fill();c.stroke();F('rgba(255,255,255,.6)');ell(c,-7,-6,4,3,-.5);break;
    case'thermo':c.rotate(.6);F('#fff');rr(c,-5,-22,10,34,5);c.fill();c.stroke();F('#ff4a5a');c.fillRect(-2,-8,4,18);circ(c,0,14,7);c.stroke();F('#ff4a5a');circ(c,0,14,5.5);break;
    case'steth':c.strokeStyle='#4a78c0';c.lineWidth=4;c.beginPath();c.moveTo(-12,-18);c.quadraticCurveTo(-14,6,0,8);c.quadraticCurveTo(14,6,12,-18);c.moveTo(0,8);c.quadraticCurveTo(2,18,12,16);c.stroke();c.strokeStyle=LN;c.lineWidth=2;F('#c8d4e8');circ(c,14,16,7);c.stroke();F('#8a9ab8');circ(c,-12,-19,3);circ(c,12,-19,3);break;
    case'light':c.rotate(-.5);F('#5a6a8a');rr(c,-5,-2,10,24,3);c.fill();c.stroke();F('#c8d4e8');rr(c,-8,-12,16,11,3);c.fill();c.stroke();F('#fff6a0');ell(c,0,-13,6,2);drawGlow(c,'#fff6a0',0,-20,14,.8);break;
    case'xray':F('#1a2a4a');rr(c,-20,-20,40,40,5);c.fill();c.stroke();c.strokeStyle='#bfe8ff';c.lineWidth=2.5;c.beginPath();c.arc(0,-8,6,0,TAU);c.moveTo(0,-2);c.lineTo(0,14);for(let i=0;i<3;i++){c.moveTo(-9,2+i*4);c.quadraticCurveTo(0,0+i*4,9,2+i*4);}c.stroke();break;
    case'lens':c.strokeStyle='#8a5a2a';c.lineWidth=6;c.beginPath();c.moveTo(8,8);c.lineTo(20,20);c.stroke();c.strokeStyle=LN;c.lineWidth=2.2;F('rgba(200,240,255,.6)');circ(c,-4,-4,15);c.strokeStyle='#c89a3a';c.lineWidth=5;c.beginPath();c.arc(-4,-4,15,0,TAU);c.stroke();F('rgba(255,255,255,.7)');ell(c,-9,-10,4,3,-.6);break;
    case'band':c.rotate(-.5);F('#ffd8b0');rr(c,-22,-7,44,14,6);c.fill();c.stroke();F('#fff0e0');rr(c,-7,-6,14,12,2);c.fill();F('#e8b890');for(const a of[-3,0,3])for(const b of[-2,2])circ(c,a,b,.9);break;
    case'ice':F('rgba(160,220,255,.9)');rr(c,-18,-14,36,28,8);c.fill();c.stroke();F('#fff');rr(c,-12,-9,10,8,3);c.fill();rr(c,2,-4,10,8,3);c.fill();break;
    case'tooth':F('#fff');c.beginPath();c.moveTo(-14,-14);c.quadraticCurveTo(0,-22,14,-14);c.quadraticCurveTo(18,0,10,18);c.quadraticCurveTo(6,20,4,8);c.lineTo(-4,8);c.quadraticCurveTo(-6,20,-10,18);c.quadraticCurveTo(-18,0,-14,-14);c.fill();c.stroke();break;
    case'toothbrush':c.rotate(-.6);F('#5ad0a0');rr(c,-22,-3,32,6,3);c.fill();c.stroke();F('#fff');rr(c,8,-10,14,8,2);c.fill();c.stroke();F('#8ad8ff');for(let i=0;i<4;i++)c.fillRect(9+i*3.4,-9,2,6);break;
    case'tweezers':c.rotate(-.8);c.strokeStyle='#8a9ab8';c.lineWidth=4;c.beginPath();c.moveTo(-18,0);c.lineTo(18,-5);c.moveTo(-18,0);c.lineTo(18,5);c.stroke();break;
    case'spoon':c.rotate(-.6);F('#d8e0ec');ell(c,12,0,9,6);c.stroke();rr(c,-20,-2,24,4,2);c.fill();c.stroke();break;
    case'thorn':F('#6a4a2a');c.beginPath();c.moveTo(-6,14);c.lineTo(0,-18);c.lineTo(6,14);c.closePath();c.fill();c.stroke();break;
    case'germ':F('#a060e0');for(let i=0;i<8;i++){const a=i/8*TAU;c.beginPath();c.moveTo(Math.cos(a)*14,Math.sin(a)*14);c.lineTo(Math.cos(a)*22,Math.sin(a)*22);c.stroke();circ(c,Math.cos(a)*22,Math.sin(a)*22,3);}circ(c,0,0,15);c.stroke();F('#fff');circ(c,-5,-3,3.5);circ(c,5,-3,3.5);F('#111');circ(c,-5,-3,1.8);circ(c,5,-3,1.8);break;
    case'blanket':F('#8ad0ff');rr(c,-22,-14,44,28,6);c.fill();c.stroke();F('#fff');for(const a of[-12,0,12])starP(c,a,0,4,1.8);c.fill();break;
    case'tissue':F('#e8f0ff');rr(c,-18,-4,36,20,3);c.fill();c.stroke();F('#fff');c.beginPath();c.moveTo(-6,-4);c.quadraticCurveTo(-10,-20,0,-18);c.quadraticCurveTo(10,-20,6,-4);c.fill();c.stroke();break;
    // しんだん
    case'd_cold':drawIcon(c,'tissue',-4,6,.8);F('#8ad8ff');for(const[a,b]of[[10,-14],[16,-6],[18,-18]])circ(c,a,b,3);otext(c,'ハクション',0,-20,9,'#fff','#5aa8ff','center',FONT);break;
    case'd_tummy':F('#ffe4d4');ell(c,0,4,20,18);c.stroke();c.strokeStyle='#ff5a6a';c.lineWidth=3;c.beginPath();for(let a=0;a<TAU*2;a+=.3){const r=a*1.4;c.lineTo(Math.cos(a)*r,4+Math.sin(a)*r);}c.stroke();break;
    case'd_thorn':F('#ffe4d4');ell(c,0,6,16,12);c.stroke();for(const[a,b]of[[-11,-6],[-4,-12],[4,-12],[11,-6]]){ell(c,a,b,5,6);c.stroke();}c.save();c.translate(6,4);c.rotate(.6);drawIcon(c,'thorn',0,0,.45);c.restore();break;
    case'd_tooth':drawIcon(c,'tooth',0,2,.9);F('#4a3a2a');circ(c,5,-5,4);break;
    case'd_swallow':F('#ffe4d4');ell(c,0,4,20,18);c.stroke();drawIcon(c,'candy',0,4,.5);otext(c,'?',14,-14,18,'#ff5fa2','#fff','center',POP);break;
    case'd_scrape':F('#ffe4d4');rr(c,-10,-20,20,40,9);c.fill();c.stroke();F('#ff5a6a');for(let i=0;i<4;i++){c.fillRect(-6+i*3,-2,2,6);}break;
    case'd_powder':F('#ffe4d4');circ(c,0,4,16);c.stroke();drawIcon(c,'powder',0,4,.5);F('#a060e0');for(const[a,b]of[[-14,-14],[12,-16],[16,-4]])circ(c,a,b,3);break;
    case'd_tired':txt(c,'Zzz',0,0,20,'#7a6ab8');break;
    default:if(drawIcon2(c,k))break;F('#ddd');circ(c,0,0,18);c.stroke();txt(c,'?',0,1,18,LN);
  }c.restore();}

/* One shared world and inventory; activities change that world rather than launch games. */
'use strict';
window.TownStory=(()=>{
 const steps=[
  ['ricky','リッキーを あやす','リッキーが ないているよ。おかおを ぷにっと して、ミルクを あげよう。','ribbon'],
  ['dress','おてつだいの ふく','もらった リボンを つかって、したてやさんで へんしんしよう。','dress'],
  ['doctor','くまさんを おてあて','おてつだいの ふくで しんりょうじょへ。くまさんを げんきに しよう。','scanner'],
  ['quiz','どうぶつの ひみつ','ふくろうの もんだいを とくと、うさぎの すきなものが わかるよ。','carrot'],
  ['picnic','うさぎの ピクニック','にんじんと おさらを うさぎに とどけて、ピクニックを はじめよう。','plank'],
  ['bridge','みんなの はし','ピクニックで もらった いたで、かわに はしを かけよう。','shovel'],
  ['search','まいごの おともだち','ひとの あつまる ひろばで、みつあみと ハートの ポシェットの こを さがそう。','camera'],
  ['photo','しゃしんの まほう','しゃしんに とった ジョウロを はなやさんに とどけると、なにが おこるかな？','rope'],
  ['sneak','もりの おとしもの','はしを わたって もりへ。みはりの ひかりを よけて、おとしものを 2つ ひろおう。','berries'],
  ['vault','こっそり たからばこ','もりで あつめた きのみを とどけると、みはりが ひとやすみするよ。','key'],
  ['treasure','ちずの たからもの','2まいの ちずと スコップで、めじるしの あいだを ほってみよう。','goldStar'],
  ['scan','まちの ふしぎな おきゃくさん','スキャナーを かざして みてみよう。うちゅうの なかまが かくれているよ。','blueStar'],
  ['detective','おしろの あんごう','たからの ひかりと うちゅうの ひかりで、おしろの なぞを とこう。','wand'],
  ['finale','おまつりを とりもどそう','まほうの ふくと ステッキで、くろくもを はらおう！','pinkStar']
 ];
 const prerequisites={ricky:[],dress:['ricky'],doctor:['dress'],quiz:[],picnic:['quiz'],bridge:['picnic'],search:[],photo:['search'],sneak:['bridge','photo'],vault:['sneak'],treasure:['vault','search','bridge'],scan:['doctor'],detective:['treasure','scan'],finale:['detective']};
 const items={ribbon:['ribbon','リボン'],dress:['crown','おてつだいの ふく'],scanner:['compass','スキャナー'],carrot:['carrot','にんじん'],plank:['plank','はしの いた'],shovel:['shovel','スコップ'],camera:['camera','カメラ'],rope:['rope','ロープ'],berries:['berry','きのみ'],key:['key','ふるい かぎ'],goldStar:['star','たいようの ひかり'],blueStar:['star','うちゅうの ひかり'],wand:['wand','ステッキ'],pinkStar:['heart','おまつりの ひかり']};
 const nodes=[
  {id:'ricky',x:360,y:640,art:'ricky',name:'リッキー',kind:'person'},
  {id:'dress',x:270,y:350,art:'atelier',name:'リボンの したてや',kind:'building'},
  {id:'doctor',x:660,y:330,art:'hospital',name:'まちの しんりょうじょ',kind:'building'},
  {id:'quiz',x:880,y:640,art:'owl',name:'ふくろう せんせい',kind:'person'},
  {id:'picnic',x:600,y:850,art:'picnic',name:'うさぎの ピクニック',kind:'prop'},
  {id:'search',x:850,y:900,art:'crowd',name:'にぎやかな ひろば',kind:'prop'},
  {id:'photo',x:1050,y:360,art:'flowershop',name:'はなやさん',kind:'building'},
  {id:'bridge',x:1250,y:730,art:'bridge',name:'こわれた はし',kind:'prop'},
  {id:'sneak',x:1540,y:690,art:'tent',name:'こもれびの キャンプ',kind:'prop'},
  {id:'vault',x:1720,y:420,art:'chest',name:'みはりの たからばこ',kind:'prop'},
  {id:'treasure',x:1870,y:900,art:'hole',name:'ひみつの すなち',kind:'prop'},
  {id:'scan',x:680,y:570,art:'crowd',name:'ふしぎな おきゃくさん',kind:'person'},
  {id:'detective',x:2210,y:580,art:'castle',name:'にじいろの おしろ',kind:'building'},
  {id:'finale',x:2250,y:860,art:'cloud',name:'くろくもの しろ',kind:'prop'}
 ];
 const fresh=()=>({version:2,flags:[],outfit:{hair:'twin',color:'pink',dress:'princess'},position:{x:440,y:720},decorations:[],scanCaught:[],night:false});
 const available=(s,id)=>prerequisites[id]?.every(k=>s.flags.includes(k));
 function finish(s,id){if(!steps.some(q=>q[0]===id)||!available(s,id)||s.flags.includes(id))return false;s.flags.push(id);if(id==='finale')s.night=true;return true;}
 const inventory=s=>steps.filter(q=>s.flags.includes(q[0])).map(q=>q[3]);
 function validate(raw){const s=fresh();if(!raw||raw.version!==2)return s;
  // Rebuild in dependency order so a corrupt save cannot skip bridges or story clues.
  const flags=Array.isArray(raw.flags)?raw.flags:[];
  for(const [id]of steps)if(flags.includes(id)&&available(s,id))s.flags.push(id);
  const o=raw.outfit||{};s.outfit={hair:['twin','long','pony','bob','odango'].includes(o.hair)?o.hair:'twin',color:['pink','blue','mint','yellow','lav'].includes(o.color)?o.color:'pink',dress:['princess','starry','magicdress'].includes(o.dress)?o.dress:'princess'};
  const p=raw.position;if(p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&p.x>=70&&p.x<=2380&&p.y>=220&&p.y<=1080)s.position={x:p.x,y:p.y};
  if(s.position.x>1320&&!s.flags.includes('bridge'))s.position={x:440,y:720};
  if(s.position.x>2030&&!s.flags.includes('treasure'))s.position={x:1600,y:750};
  if(Array.isArray(raw.decorations))s.decorations=raw.decorations.filter(d=>d&&['flower','lantern','balloon','star'].includes(d.art)&&Number.isFinite(d.x)&&Number.isFinite(d.y)&&d.x>=80&&d.x<2400&&d.y>=220&&d.y<1100).slice(0,60);
  s.scanCaught=s.flags.includes('doctor')&&Array.isArray(raw.scanCaught)?[...new Set(raw.scanCaught.filter(id=>[0,2].includes(id)))]:[];if(s.flags.includes('scan'))s.scanCaught=[0,2];else if(s.scanCaught.length===2)s.flags.push('scan');s.night=s.flags.includes('finale');return s;
 }
 return{steps,prerequisites,items,nodes,fresh,available,finish,inventory,validate};
})();

/* The rules of a toy world: tools change the scenery, projects grow a shared home. */
(function (root) {
'use strict';
const KEY = 'moco.atelier.v1';
const worlds = {
 forest: {name:'おかしの もり', short:'もり', color:'#8fc9a0', icon:'leaf', projects:[['bloom','おはなの めざめ'],['clinic','きつねの おてあて'],['windmill','ちょうちょの ふうしゃ']]},
 sea: {name:'ソーダの うみ', short:'うみ', color:'#7dcdd4', icon:'shell', projects:[['friend','まいごの ふわり'],['coral','あめの おくりもの'],['boat','うたう ふね']]},
 space: {name:'ほしの サーカス', short:'ほし', color:'#b6a2e0', icon:'star', projects:[['gears','ひかりと かくれんぼ'],['gate','ほしの あんごう'],['skyshow','そらいっぱいの まほう']]}
};
const entries = {
 forest:[['bloom','おはなの めざめ','water','おはなに 3つの しずくを とどけよう。'],['flowerphoto','ちょうちょの しゃしん','camera','さいた おはなを カメラで パシャ。'],['heartbeat','ドクンドクン','steth','きつねに ちょうしんきを あててみよう。'],['wash','ぴかぴかの きず','spray','きずの ちがう ところを きれいに。'],['clinic','おてあて じょうず','bandage','きれいな きずに ばんそうこう。'],['quiz','ふくろうの はかせ','owl','ふくろうの えの もんだいを とこう。'],['windmill','くるくる ふうしゃ','mill','しゃしんと 3つの パーツを ふうしゃへ。'],['puddle','みずたまり ジャンプ','hand','てで みずたまりを 3かい ポン！'],['music','きのこの がっそう','note','3つの きのこを さわってみよう。'],['visitor','もりの おきゃくさん','scope','スコープで しらべて、まほうで ごあいさつ。'],['rainbow','にじいろの おはな','magic','さいた おはなに まほうを。'],['picnic','きのこの おやつ','heart','きのこに おせわを してみよう。']],
 sea:[['friend','まいごを はっけん','moco','いろ・みみ・ぼうしを よく みよう。'],['cloudphoto','くもを つかまえた','camera','くもを しゃしんに とってみよう。'],['rain','しゃしんから あめ！','cloud','くもの しゃしんを サンゴに とどけよう。'],['watercoral','ちいさな みずやり','water','サンゴを じょうろで そだててみよう。'],['coralphoto','サンゴの もり','camera','そだった サンゴを しゃしんに。'],['melody','かいがらの うた','note','ブイの おとを きいて おなじ じゅんばんに。'],['boat','ふねが うたった','boat','なかま・サンゴ・おとを つないで ふねを つくろう。'],['word','びんの えいご','bottle','びんの ことばと おなじ えを えらぼう。'],['visitor','うみの おきゃくさん','scope','スコープの なかには、だれが いる？'],['bubble','しゃぼんの ダンス','magic','そだった サンゴに まほうを。'],['tickle','くもの くすぐり','hand','くもを 3かい くすぐってみよう。'],['friendphoto','ふわりの きねんび','camera','みつけた おともだちを しゃしんに。']],
 space:[['gears','そっと おとどけ','gear','ひかりを よけて、3つの はぐるまを。'],['hide','かくれんぼ めいじん','leaf','かくれる ばしょで ひとやすみ。'],['clue','ランタンの ひみつ','lantern','ランタンを しらべて、かずを かぞえよう。'],['planetphoto','わくせいの しゃしん','camera','わくせいの もようを しゃしんに。'],['gate','あんごうが とけた','gate','かずと えを あわせて とびらを あけよう。'],['shield','ひかりの シールド','shield','くもが ぴかっと したら シールド！'],['skyshow','ほしぞらの ショー','magic','3かい まもって まほうを ながおし。'],['word','ほしの ことば','book','とびらの ことばと えを あわせよう。'],['visitor','ほしの おきゃくさん','scope','スコープと まほうで おともだちに。'],['planetmagic','わくせい だいへんしん','magic','わくせいに まほうを かけてみよう。'],['music','わくせいの おと','note','てで わくせいを 3かい ならそう。'],['cometphoto','ショーの おもいで','camera','ショーが おわった くもを パシャ。']]
};
const questions = [
 {q:'うさぎの すきな ごはんは？',art:'rabbit',choices:['carrot','rock','fish'],answer:'carrot'},
 {q:'そらを とべるのは？',art:'cloud',choices:['fox','bird','shell'],answer:'bird'},
 {q:'うみの おともだちは？',art:'wave',choices:['leaf','fish','owl'],answer:'fish'},
 {q:'よるに ぴかぴか ひかるのは？',art:'moon',choices:['star','carrot','rock'],answer:'star'},
 {q:'あめの ひに つかうのは？',art:'cloud',choices:['umbrella','drum','leaf'],answer:'umbrella'},
 {q:'おはなを げんきに するのは？',art:'flower',choices:['water','rock','hat'],answer:'water'},
 {q:'たまごから うまれるのは？',art:'egg',choices:['bird','star','bottle'],answer:'bird'},
 {q:'あしあとを のこすのは？',art:'paw',choices:['fox','cloud','moon'],answer:'fox'},
 {q:'きに はえているのは？',art:'tree',choices:['leaf','shell','gear'],answer:'leaf'}
];
const newWorld = (round=0) => ({round,flags:[],watered:[],cleaned:[],parts:[],quiz:0,memory:0,gears:[],scan:false,taps:{},code:0,guards:0});
function fresh(){return {schema:3,awake:false,world:'home',look:{color:'peach',ears:'flop',hat:'star'},worlds:{forest:newWorld(),sea:newWorld(),space:newWorld()},earned:[],discoveries:[],photos:[],photo:null,decorations:[],sound:false};}
const ws = (s,id=s.world)=>s.worlds[id];
const has = (s,flag,id=s.world)=>!!ws(s,id)?.flags.includes(flag);
const stars = s=>s.earned.length;
const totalProjects = s=>Object.keys(worlds).reduce((n,w)=>n+worlds[w].projects.filter(([p])=>s.earned.some(e=>e.startsWith(w+':'+p+':'))).length,0);
const unlocked = (s,w)=>w==='home'||(s.awake&&(w==='forest'||(w==='sea'&&worlds.forest.projects.every(([p])=>s.earned.some(e=>e.startsWith('forest:'+p+':'))))||(w==='space'&&worlds.sea.projects.every(([p])=>s.earned.some(e=>e.startsWith('sea:'+p+':'))))));
const tools = s=>['hand','care','camera','build',...(unlocked(s,'sea')?['scope']:[]),...(unlocked(s,'space')?['magic']:[])];
function discover(s,id){if(!entries[id.split(':')[0]]?.some(([key])=>id===id.split(':')[0]+':'+key)||s.discoveries.includes(id))return false;s.discoveries.push(id);return true;}
function flag(s,id){const w=ws(s);if(!w||w.flags.includes(id))return false;w.flags.push(id);return true;}
function award(s,id){const w=ws(s);flag(s,id);const key=s.world+':'+id+':'+w.round;if(!s.earned.includes(key))s.earned.push(key);discover(s,s.world+':'+id);return {ok:true,project:id,reward:true,message:worlds[s.world].projects.find(p=>p[0]===id)[1]+'、できた！'};}
function buildPlan(s){const round=ws(s)?.round||0;return ['circle','triangle','star'].map((shape,i)=>({shape:['circle','triangle','star'][(i+round)%3],rotation:i===1?1:0}));}
function canBuild(s){return s.world==='home'||(s.world==='forest'&&['bloom','clinic','butterflyphoto','quiz'].every(f=>has(s,f)))||(s.world==='sea'&&['friend','coral','melody'].every(f=>has(s,f)));}
function quizQuestion(s){const w=ws(s,'forest');return questions[(w.round*3+Math.min(w.quiz,2))%questions.length];}
function melody(s){const r=ws(s,'sea').round;return [[0,2,1],[1,3,0,2],[2,0,3,1,2]][r];}
function code(s){const r=ws(s,'space').round;return {number:r+2,symbol:['star','moon','sun'][r],word:['STAR','MOON','SUN'][r]};}
function searchTarget(s){return {index:[17,8,20][ws(s,'sea').round],color:['blue','lilac','peach'][ws(s,'sea').round],hat:['heart','leaf','star'][ws(s,'sea').round],ears:['round','flop','point'][ws(s,'sea').round]};}
const decorTypes=s=>['flower','flag','cloud',...(totalProjects(s)>=1?['mushroom','lamp']:[]),...(totalProjects(s)>=3?['wheel','sail','slide']:[]),...(totalProjects(s)>=6?['coral','balloon','moon']:[]),...(totalProjects(s)>=9?['rocket','star','rainbow']:[])];
function perform(s,verb,target,data={}){
 const w=ws(s),world=s.world;let result={ok:true,message:'わあ！ なにが おきたかな？'};
 const found=(id)=>discover(s,world+':'+id);
 const no=(message)=>({ok:false,message});
 if(verb==='wake'){s.awake=true;return {ok:true,message:'モコが おきた！ ふしぎを みつけに いこう。',effect:'wake'};}
 if(verb==='travel'){if(!unlocked(s,target))return no('いまの ばしょで 3つの ひらめきを あつめよう。');s.world=target;s.photo=null;return {ok:true,message:target==='home'?'きみだけの アトリエを つくろう。':worlds[target].name+'へ ようこそ！',effect:'travel'};}
 if(verb==='look'){if(['peach','blue','lilac','mint','yellow'].includes(data.color))s.look.color=data.color;if(['flop','round','point'].includes(data.ears))s.look.ears=data.ears;if(['star','heart','leaf','crown','bow','none'].includes(data.hat))s.look.hat=data.hat;return {ok:true,message:'いいね！ この すがたで でかけよう。',effect:'dress'};}
 if(verb==='decorate'){if(world!=='home'||!decorTypes(s).includes(data.art)||s.decorations.length>=24)return no('かざりは 24こまで おけるよ。');const x=Number(data.x),y=Number(data.y);if(!Number.isFinite(x)||!Number.isFinite(y))return no('じめんに おいてみよう。');s.decorations.push({art:data.art,turn:0,size:1,x:Math.max(9,Math.min(91,x)),y:Math.max(37,Math.min(85,y))});return {ok:true,message:'きみの アトリエが できていく！',effect:'build'};}
 if(['moveDecoration','turnDecoration','sizeDecoration','removeDecoration'].includes(verb)){
  const d=s.decorations[data.index];if(world!=='home'||!d)return no('アトリエの かざりを えらぼう。');
  if(verb==='moveDecoration'){if(!Number.isFinite(data.x)||!Number.isFinite(data.y))return no('じめんに おこう。');d.x=Math.max(9,Math.min(91,data.x));d.y=Math.max(37,Math.min(85,data.y));}
  if(verb==='turnDecoration')d.turn=((d.turn||0)+1)%4;
  if(verb==='sizeDecoration')d.size=d.size===1?1.25:d.size===1.25?.8:1;
  if(verb==='removeDecoration')s.decorations.splice(data.index,1);
  return {ok:true,message:'きみの すきな ばしょと かたちに！',effect:'build'};
 }
 if(verb==='undo'){s.decorations.pop();return {ok:true,message:'ひとつ もどしたよ。'};}
 if(target==='moco'){if(verb==='care')return {ok:true,message:'ぎゅっ。モコも うれしそう！',effect:'heart'};if(verb==='hand')return {ok:true,message:'ぷにっ！ びよーん！',effect:'squish'};}
 if(world==='home'&&verb==='photo'){const snapshot={world:'home',target:'house',round:0,look:{...s.look},level:Math.floor(totalProjects(s)/3),decorations:s.decorations.map(d=>({...d})),id:Date.now()+Math.random()};s.photos.push(snapshot);if(s.photos.length>12)s.photos.shift();s.photo={world:'home',target:'house',id:snapshot.id};return {ok:true,message:'きみの アトリエを パシャ！ おもいでに のこしたよ。',effect:'photo'};}
 if(world==='home')return {ok:true,message:target==='house'?'つくる どうぐで かざってみよう。':'モコと ふしぎを みつけに いこう。',effect:'bounce'};
 if(!w)return no('どこへ いこうかな？');
 if(verb==='remix'){
  if(!worlds[world].projects.every(([p])=>has(s,p)))return no('3つの ひらめきを みつけてから、また あそべるよ。');
  s.worlds[world]=newWorld((w.round+1)%3);s.photo=null;return {ok:true,message:['ふしぎが かわった！ よく みてみよう。','あたらしい おとや もようが まっているよ。'][w.round%2],effect:'remix'};
 }
 if(verb==='scan'){if(!tools(s).includes('scope'))return no('うみへ いけるようになると スコープが とどくよ。');if(target!=='visitor')return {ok:true,message:'このこは いつもの なかまだね。',effect:'scan'};w.scan=true;return {ok:true,message:'あっ、うちゅうの おともだち！ まほうで ごあいさつしよう。',effect:'scan'};}
 if(verb==='magic'){
  if(!tools(s).includes('magic'))return no('うみの ひらめきを あつめると、まほうが とどくよ。');
  if(target==='visitor'){if(!w.scan)return no('まずは スコープで しょうたいを みてみよう。');flag(s,'visitor');found('visitor');return {ok:true,message:'こんにちは！ あたらしい おともだち！',effect:'alien'};}
  if(world==='forest'&&target==='flower'&&has(s,'bloom')){found('rainbow');flag(s,'rainbow');return {ok:true,message:'にじいろの おはなに なった！',effect:'rainbow'};}
  if(world==='sea'&&target==='coral'&&has(s,'coral')){found('bubble');flag(s,'bubble');return {ok:true,message:'しゃぼんだまの ダンス！',effect:'bubbles'};}
  if(world==='space'&&target==='planet'){found('planetmagic');flag(s,'planetmagic');return {ok:true,message:'わくせいが おかしの いろに！',effect:'rainbow'};}
  if(world==='space'&&target==='storm'){if(!has(s,'gate'))return no('まずは とびらの なぞを とこう。');return {ok:true,message:'くもが ぴかっと したら、シールド！',effect:'battle'};}
  return {ok:true,message:'きらきら、ふわり！',effect:'magic'};
 }
 if(verb==='photo'){
  const snapshot={world,target,round:w.round,look:{...s.look},flags:[...w.flags],bloom:has(s,'bloom'),coral:has(s,'coral'),clear:has(s,'skyshow'),id:Date.now()+Math.random()};s.photos.push(snapshot);if(s.photos.length>12)s.photos.shift();s.photo={world,target,id:snapshot.id};
  if(world==='forest'&&target==='flower'&&has(s,'bloom')){flag(s,'butterflyphoto');found('flowerphoto');result.message='ちょうちょの しゃしん！ ふうしゃに とどけてみよう。';}
  else if(world==='sea'&&target==='cloud'){found('cloudphoto');result.message='くもの しゃしん！ サンゴへ とどけたら、どうなる？';}
  else if(world==='sea'&&target==='coral'&&has(s,'coral')){found('coralphoto');result.message='サンゴの もりを パシャ！';}
  else if(world==='sea'&&target==='crowd'&&has(s,'friend')){found('friendphoto');result.message='おともだちと きねんしゃしん！';}
  else if(world==='space'&&target==='planet'){flag(s,'planetphoto');found('planetphoto');result.message='わくせいの もようと ことばを おぼえたよ。';}
  else if(world==='space'&&target==='storm'&&has(s,'skyshow')){found('cometphoto');result.message='ほしぞらの おもいでが とれた！';}
  else result.message='パシャ！ しゃしんを もちあるけるよ。';
  result.effect='photo';return result;
 }
 if(verb==='givePhoto'){
  if(!s.photo)return no('まずは カメラで とってみよう。');
  if(world==='forest'&&target==='mill'&&s.photo.target==='flower'&&has(s,'butterflyphoto')){flag(s,'photoDelivered');return {ok:true,message:'ちょうちょの はねを おてほんに、ふうしゃを つくろう。',effect:'butterfly'};}
  if(world==='sea'&&target==='coral'&&s.photo.target==='cloud'){flag(s,'rain');found('rain');const was=has(s,'coral');if(!was)result=award(s,'coral');else result.message='しゃしんの くもから、あめが ふった！';result.effect='rain';return result;}
  return no('この しゃしんは、べつの ばしょで つかえるかな？');
 }
 if(verb==='water'){
  if(!((world==='forest'&&target==='flower')||(world==='sea'&&target==='coral')))return {ok:true,message:'しずくが きらり！',effect:'water'};
  const cell=Number(data.cell);if(![0,1,2].includes(cell))return no('3つの しずくを タッチしてね。');if(!w.watered.includes(cell))w.watered.push(cell);
  if(w.watered.length===3){const id=world==='forest'?'bloom':'coral';if(world==='sea')found('watercoral');if(!has(s,id))result=award(s,id);else result.message='もっと げんきに なった！';}else result.message='おみずを とどけた！ '+w.watered.length+' / 3';result.effect='water';return result;
 }
 if(world==='forest'&&target==='fox'){
  if(verb==='steth'){flag(s,'diagnosed');found('heartbeat');return {ok:true,message:'ドクンドクン。つぎは きずを きれいに。',effect:'heartbeat'};}
  if(verb==='spray'){if(!has(s,'diagnosed'))return no('まずは ちょうしんきで からだの おとを きこう。');if(![0,1,2].includes(data.cell))return no('きずの 3つの ところを きれいに。');if(!w.cleaned.includes(data.cell))w.cleaned.push(data.cell);if(w.cleaned.length===3){flag(s,'clean');found('wash');}return {ok:true,message:w.cleaned.length===3?'ぴかぴか！ ばんそうこうを はろう。':'きれいに '+w.cleaned.length+' / 3',effect:'spray'};}
  if(verb==='bandage'){if(!has(s,'clean'))return no('しょうどくで きずを きれいに しよう。');if(!has(s,'clinic'))return {...award(s,'clinic'),effect:'heart'};return {ok:true,message:'もう げんき！ ありがとう！',effect:'heart'};}
 }
 if(verb==='quiz'){
  if(world!=='forest')return no('ふくろうに きいてみよう。');const q=quizQuestion(s);if(data.answer!==q.answer)return no('おしい！ えを みて もういちど。');w.quiz=Math.min(3,w.quiz+1);if(w.quiz===3){flag(s,'quiz');found('quiz');}return {ok:true,message:w.quiz===3?'はかせに なった！ ふうしゃの パーツを もらった！':'せいかい！ '+w.quiz+' / 3',effect:'correct'};
 }
 if(verb==='find'){
  if(world!=='sea'||Number(data.index)!==searchTarget(s).index)return no('みみと いろと ぼうしを、もういちど みよう。');if(!has(s,'friend'))return {...award(s,'friend'),effect:'friend'};return {ok:true,message:'もう まいごじゃないよ！',effect:'heart'};
 }
 if(verb==='note'){
  const seq=melody(s);if(world!=='sea')return no('うみの ブイで おとを きこう。');if(data.note!==seq[w.memory]){w.memory=0;return {ok:false,message:'だいじょうぶ。もういちど おとを きこう。',effect:'retrySong'};}w.memory++;if(w.memory===seq.length){flag(s,'melody');found('melody');w.memory=0;return {ok:true,message:'おなじ うたに なった！ おとの パーツを もらった！',effect:'correct'};}return {ok:true,message:w.memory+' / '+seq.length,effect:'note'};
 }
 if(verb==='word'){
  const symbol=world==='sea'?['sun','moon','star'][w.round]:code(s).symbol;if(data.symbol!==symbol)return no('ことばの となりの えも みてみよう。');found('word');return {ok:true,message:'ことばと えが つながった！',effect:'correct'};
 }
 if(verb==='build'){
  if(!canBuild(s))return no(world==='forest'?'おはな・きつね・ふくろうの おてつだいと、ちょうちょの しゃしんを あつめよう。':'なかま・サンゴ・かいがらの うたを あつめよう。');
  if(world==='forest'&&!has(s,'photoDelivered'))return no('ちょうちょの しゃしんを ふうしゃに とどけよう。');
  const plan=buildPlan(s),slot=Number(data.slot);if(!plan[slot]||data.shape!==plan[slot].shape||data.rotation!==plan[slot].rotation)return no('かたちと むきを あわせよう。まわす ボタンも つかえるよ。');
  if(!w.parts.includes(slot))w.parts.push(slot);if(w.parts.length===3&&!has(s,world==='forest'?'windmill':'boat'))return {...award(s,world==='forest'?'windmill':'boat'),effect:'build'};return {ok:true,message:'カチッ！ はまった！ '+w.parts.length+' / 3',effect:'snap'};
 }
 if(verb==='gear'){
  if(world!=='space'||![0,1,2].includes(data.index))return no('はぐるまは 3つ あるよ。');if(!w.gears.includes(data.index))w.gears.push(data.index);if(w.gears.length===3&&!has(s,'gears'))return {...award(s,'gears'),effect:'gear'};return {ok:true,message:'はぐるま '+w.gears.length+' / 3',effect:'gear'};
 }
 if(verb==='hide'){if(world==='space')found('hide');return {ok:true,message:'ここなら あんしん。',effect:'hide'};}
 if(verb==='clue'){if(world==='space'){flag(s,'clue');found('clue');return {ok:true,message:'ランタンの ひかりは '+code(s).number+'こ。',effect:'clue'};}}
 if(verb==='code'){
  if(world!=='space'||!has(s,'gears'))return no('まずは 3つの はぐるまを あつめよう。');
  if(!has(s,'clue')||!has(s,'planetphoto'))return no('ランタンと わくせいを しらべよう。カメラも つかってね。');
  const c=code(s);if(w.code===0){if(Number(data.number)!==c.number)return no('ランタンの ひかりを かぞえよう。');w.code=1;return {ok:true,message:'つぎは '+c.word+' の えを えらぼう。',effect:'correct'};}
  if(data.symbol!==c.symbol)return no('わくせいの もようと おなじ えは どれ？');found('word');if(!has(s,'gate'))return {...award(s,'gate'),effect:'gate'};
 }
 if(verb==='guard'){if(world!=='space'||!has(s,'gate'))return no('まずは とびらを あけよう。');w.guards=Math.min(3,w.guards+1);found('shield');return {ok:true,message:'まもれた！ '+w.guards+' / 3',effect:'shield'};}
 if(verb==='finishShow'){if(world!=='space'||w.guards<3)return no('3かい シールドで まもろう。');if(!has(s,'skyshow'))return {...award(s,'skyshow'),effect:'finale'};return {ok:true,message:'ほしぞらの ショー！',effect:'finale'};}
 if(verb==='hand'){
  w.taps[target]=(w.taps[target]||0)+1;
  if(world==='forest'&&target==='puddle'&&w.taps[target]>=3){found('puddle');result.message='ぴちゃ！ みずの わっかが できた！';result.effect='splash';}
  else if(world==='forest'&&target==='mushrooms'){if(w.taps[target]>=3)found('music');result={ok:true,message:'ポン、ポロン！ きのこが うたう！',effect:'note'};}
  else if(world==='sea'&&target==='cloud'){if(w.taps[target]>=3)found('tickle');result={ok:true,message:'くもが くすぐったそう！',effect:'squish'};}
  else if(world==='space'&&target==='planet'){if(w.taps[target]>=3)found('music');result={ok:true,message:'ポロロン。わくせいの おと！',effect:'note'};}
  else result={ok:true,message:'ちょん！ ほかの どうぐだと、どうなるかな？',effect:'bounce'};
  return result;
 }
 if(verb==='care'&&world==='forest'&&target==='mushrooms'){found('picnic');flag(s,'picnic');return {ok:true,message:'きのこの おやつで ピクニック！',effect:'picnic'};}
 return {ok:true,message:'ちがう どうぐも ためしてみよう。',effect:'bounce'};
}
function goal(s){
 if(!s.awake)return {text:'モコを なでて おこそう',tool:'hand',target:'moco'};
 if(s.world==='home')return totalProjects(s)>=9?{text:'きみだけの アトリエを つくろう！',tool:'build',target:'house'}:{text:'ふしぎな せかいへ でかけよう',tool:'travel',target:'forest'};
 const h=f=>has(s,f),w=ws(s);
 if(s.world==='forest'){
  if(!h('bloom'))return {text:'おはなに おみずを とどけよう',tool:'care',target:'flower',sub:'water'};
  if(!h('clinic'))return {text:!h('diagnosed')?'きつねの おとを きこう':!h('clean')?'きずを きれいに しよう':'ばんそうこうを はろう',tool:'care',target:'fox',sub:!h('diagnosed')?'steth':!h('clean')?'spray':'bandage'};
  if(!h('butterflyphoto'))return {text:'ちょうちょを しゃしんに とろう',tool:'camera',target:'flower'};
  if(!h('quiz'))return {text:'ふくろうの ひみつを とこう',tool:'hand',target:'owl'};
  if(!h('photoDelivered'))return s.photo?.target==='flower'?{text:'しゃしんを ふうしゃへ とどけよう',tool:'photo',target:'mill'}:{text:'ちょうちょの しゃしんを もういちど パシャ',tool:'camera',target:'flower'};
  if(!h('windmill'))return {text:'かたちと むきを あわせて つくろう',tool:'build',target:'mill'};
 }
 if(s.world==='sea'){
  if(!h('friend'))return {text:'まいごの ふわりを さがそう',tool:'hand',target:'crowd'};
  if(!h('coral'))return {text:s.photo?.target==='cloud'?'くもの しゃしんを サンゴへ':'くもを カメラで とってみよう',tool:s.photo?.target==='cloud'?'photo':'camera',target:s.photo?.target==='cloud'?'coral':'cloud'};
  if(!h('melody'))return {text:'かいがらの おとを きいてみよう',tool:'hand',target:'buoy'};
  if(!h('boat'))return {text:'ふねの パーツを あわせよう',tool:'build',target:'boat'};
 }
 if(s.world==='space'){
  if(!h('gears'))return {text:'ひかりを よけて はぐるまを あつめよう',tool:'hand',target:'gears'};
  if(!h('clue'))return {text:'ランタンの ひかりを かぞえよう',tool:'hand',target:'lamps'};
  if(!h('planetphoto'))return {text:'わくせいの もようを パシャ',tool:'camera',target:'planet'};
  if(!h('gate'))return {text:'かずと えで とびらを あけよう',tool:'hand',target:'gate'};
  if(!h('skyshow'))return {text:'くろくもに まほうを とどけよう',tool:'magic',target:'storm'};
 }
 const extra={forest:{puddle:['hand','puddle'],music:['hand','mushrooms'],visitor:[w.scan?'magic':'scope','visitor'],rainbow:['magic','flower'],picnic:['care','mushrooms']},sea:{cloudphoto:['camera','cloud'],rain:[s.photo?.target==='cloud'?'photo':'camera',s.photo?.target==='cloud'?'coral':'cloud'],watercoral:['care','coral'],coralphoto:['camera','coral'],word:['hand','bottle'],visitor:[w.scan?'magic':'scope','visitor'],bubble:['magic','coral'],tickle:['hand','cloud'],friendphoto:['camera','crowd']},space:{hide:['hand','gears'],visitor:[w.scan?'magic':'scope','visitor'],planetmagic:['magic','planet'],music:['hand','planet'],cometphoto:['camera','storm']}};
 const more=entries[s.world].find(([id])=>!s.discoveries.includes(s.world+':'+id)&&extra[s.world][id]&&tools(s).includes(extra[s.world][id][0]));
 if(more){const [nextTool,target]=extra[s.world][more[0]];return {text:more[3],tool:nextTool,target,sub:more[0]==='watercoral'?'water':undefined,complete:true};}
 if(stars(s)===27&&s.discoveries.length===36)return {text:'ぜんぶ はっけん！ アトリエマスター！',tool:'travel',target:'home',complete:true};
 return {text:'あたらしい ふしぎも あそんでみよう！',tool:'hand',target:'remix',complete:true};
}
function validate(raw){
 const s=fresh();if(!raw||raw.schema!==3)return s;
 s.awake=raw.awake===true;s.sound=raw.sound===true;
 if(raw.look)perform(s,'look','',raw.look);
 const validEarned=[];for(const w of Object.keys(worlds))for(const [p]of worlds[w].projects)for(let r=0;r<3;r++)validEarned.push(w+':'+p+':'+r);
 s.earned=Array.isArray(raw.earned)?[...new Set(raw.earned.filter(x=>validEarned.includes(x)))]:[];
 const ids=Object.entries(entries).flatMap(([w,es])=>es.map(([id])=>w+':'+id));s.discoveries=Array.isArray(raw.discoveries)?[...new Set(raw.discoveries.filter(id=>ids.includes(id)))]:[];
 for(const w of Object.keys(worlds)){
  const v=raw.worlds?.[w];if(!v)continue;const z=newWorld([0,1,2].includes(v.round)?v.round:0);
  const flags=['bloom','diagnosed','clean','clinic','butterflyphoto','photoDelivered','quiz','windmill','rainbow','picnic','visitor','friend','rain','coral','melody','boat','bubble','gears','clue','planetphoto','gate','skyshow'];
  z.flags=Array.isArray(v.flags)?[...new Set(v.flags.filter(x=>flags.includes(x)))]:[];
  for(const key of ['watered','cleaned','parts','gears'])z[key]=Array.isArray(v[key])?[...new Set(v[key].filter(n=>[0,1,2].includes(n)))]:[];
  z.quiz=Number.isInteger(v.quiz)?Math.max(0,Math.min(3,v.quiz)):0;z.guards=Number.isInteger(v.guards)?Math.max(0,Math.min(3,v.guards)):0;z.code=v.code===1?1:0;z.scan=v.scan===true;
  for(const key of ['puddle','mushrooms','cloud','planet'])z.taps[key]=Math.min(30,Math.max(0,Number(v.taps?.[key])||0));s.worlds[w]=z;
 }
 s.world=unlocked(s,raw.world)?raw.world:'home';
 if(Array.isArray(raw.decorations))for(const d of raw.decorations.slice(0,24)){if(d&&decorTypes(s).includes(d.art)&&Number.isFinite(d.x)&&Number.isFinite(d.y))s.decorations.push({art:d.art,turn:[0,1,2,3].includes(d.turn)?d.turn:0,size:[.8,1,1.25].includes(d.size)?d.size:1,x:Math.max(9,Math.min(91,d.x)),y:Math.max(37,Math.min(85,d.y))});}
 const targets=['house','flower','fox','owl','mill','puddle','mushrooms','visitor','coral','cloud','buoy','crowd','boat','bottle','gears','gate','storm','lamps','planet','moco'];
 if(Array.isArray(raw.photos))s.photos=raw.photos.filter(p=>p&&(p.world==='home'||worlds[p.world])&&targets.includes(p.target)&&[0,1,2].includes(p.round)).slice(-12).map(p=>({world:p.world,target:p.target,round:p.round,id:Number(p.id)||0,level:[0,1,2,3].includes(p.level)?p.level:0,decorations:Array.isArray(p.decorations)?p.decorations.filter(d=>d&&decorTypes(s).includes(d.art)&&Number.isFinite(d.x)&&Number.isFinite(d.y)).slice(0,24):[],look:{color:['peach','blue','lilac','mint','yellow'].includes(p.look?.color)?p.look.color:'peach',ears:['flop','round','point'].includes(p.look?.ears)?p.look.ears:'flop',hat:['star','heart','leaf','crown','bow','none'].includes(p.look?.hat)?p.look.hat:'star'},flags:Array.isArray(p.flags)?p.flags.filter(f=>typeof f==='string').slice(0,30):[],bloom:!!p.bloom,coral:!!p.coral,clear:!!p.clear}));
 if(raw.photo&&(raw.photo.world==='home'||worlds[raw.photo.world])&&targets.includes(raw.photo.target))s.photo={world:raw.photo.world,target:raw.photo.target,id:Number(raw.photo.id)||0};
 return s;
}
root.LabCore={KEY,worlds,entries,questions,fresh,ws,has,stars,totalProjects,unlocked,tools,discover,buildPlan,canBuild,quizQuestion,melody,code,searchTarget,decorTypes,perform,goal,validate};
})(typeof window==='undefined'?globalThis:window);

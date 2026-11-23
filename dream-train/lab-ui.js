(function(){
'use strict';
const C=LabCore,A=LabArt,$=id=>document.getElementById(id);
let state=C.fresh();try{state=C.validate(JSON.parse(localStorage.getItem(C.KEY)));}catch{}
let suppressClickUntil=0,selectedDecor=null;
let active=false,tool='hand',care='water',piece={shape:'circle',rotation:0},decor='flower',mode=null,bookWorld='forest',photoCarry=false,wrongPeople=new Set(),quizBusy=false,songPlaying=false,songToken=0,battle=null,stealth=null,drag=null,mocoGrab=null,mocoTaps=0,ignoreMocoClick=false,audio,lastFrame=0,rewardTimer,transitionTimer;
const timers=new Set(),reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
const objects={
 home:[['house','きみの アトリエ',51,43,310,208],['wardrobe','モコの おきがえ',79,70,100,69],['travel','そらへ おでかけ',82,31,116,79],['gift','はっけんの きろく',24,31,91,65]],
 forest:[['flower','ねむった おはな',31,40,184,116],['fox','きずついた きつね',66,65,167,111],['owl','ふくろう はかせ',67,25,132,89],['mill','ちょうちょの ふうしゃ',85,43,181,119],['puddle','みずたまり',28,78,146,88],['mushrooms','おんがく きのこ',11,43,124,76],['visitor','ふしぎな おきゃくさん',49,65,90,61]],
 sea:[['cloud','くすぐり くも',26,22,176,110],['coral','ねむった サンゴ',76,62,184,115],['buoy','うたう ブイ',43,66,125,85],['crowd','まいごの おともだち',29,46,175,116],['boat','おとの ふね',67,33,198,129],['bottle','ことばの びん',87,78,83,61],['visitor','ふしぎな おきゃくさん',53,42,88,60]],
 space:[['gears','ひかりと かくれんぼ',25,57,151,100],['gate','ほしの とびら',76,46,215,137],['lamps','ひかりの ランタン',81,20,142,93],['planet','おとの わくせい',30,22,141,96],['storm','いたずら くも',51,36,178,116],['visitor','ふしぎな おきゃくさん',88,74,87,61]]
};
const toolNames={hand:'さわる',care:'おせわ',camera:'カメラ',build:'つくる',scope:'みぬく',magic:'まほう',photo:'しゃしん',travel:'おでかけ'};
const names={water:'じょうろ',steth:'ちょうしんき',spray:'しょうどく',bandage:'ばんそうこう',carrot:'にんじん',rock:'いし',fish:'さかな',fox:'きつね',bird:'ことり',shell:'かいがら',leaf:'はっぱ',star:'ほし',umbrella:'かさ',drum:'たいこ',hat:'ぼうし',bottle:'びん',moon:'つき',sun:'たいよう',gear:'はぐるま',circle:'まる',triangle:'さんかく',flower:'おはな',flag:'はた',cloud:'くも',mushroom:'きのこ',lamp:'ランタン',wheel:'はぐるま',sail:'ほ',slide:'すべりだい',coral:'サンゴ',balloon:'ふうせん',rocket:'ロケット',rainbow:'にじ'};
function later(fn,ms){const t=setTimeout(()=>{timers.delete(t);fn();},ms);timers.add(t);return t;}
function save(){try{localStorage.setItem(C.KEY,JSON.stringify(state));$('saveNotice').hidden=true;}catch{$('saveNotice').hidden=false;}}
function speak(text){if(!state.sound||document.hidden||!window.speechSynthesis||!window.SpeechSynthesisUtterance)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ja-JP';u.rate=.88;u.pitch=1.13;speechSynthesis.speak(u);}catch{}}
function tone(n=0,length=.24){if(!state.sound||document.hidden)return;try{const AC=window.AudioContext||window.webkitAudioContext;if(!audio&&AC)audio=new AC();if(!audio)return;if(audio.state==='suspended')audio.resume().catch(()=>{});const t=audio.currentTime,o=audio.createOscillator(),g=audio.createGain();o.type='sine';o.frequency.value=[523.25,659.25,783.99,1046.5][Math.abs(n)%4];g.gain.setValueAtTime(.065,t);g.gain.exponentialRampToValueAtTime(.001,t+length);o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+length+.03);}catch{}}
function say(text,art='moco',voice=true){$('speechText').textContent=text;$('speechArt').innerHTML=art==='moco'?A.moco(state.look):A.icon(art);if(voice)speak(text);}
function positionOf(id){const n=objects[state.world].find(p=>p[0]===id);return n?{x:n[2],y:n[3]}:{x:16,y:74};}
function fx(id,kind='star',count=10){const p=positionOf(id),colors=['#ffe2a1','#f6c0d3','#b3e5d6','#d3c3f1'];for(let i=0;i<count;i++){const el=document.createElement('span');el.className='effect-particle';el.textContent=kind==='heart'?'♥':kind==='water'||kind==='rain'?'●':kind==='note'?'♪':kind==='bubbles'?'○':kind==='gear'?'✦':'✧';el.style.cssText='left:'+p.x+'%;top:'+p.y+'%;--dx:'+((i%2?-1:1)*(18+Math.random()*65))+'px;--dy:'+(-20-Math.random()*85)+'px;--rot:'+(Math.random()*90-45)+'deg;--pcolor:'+colors[i%4];$('effects').append(el);later(()=>el.remove(),1000);}}
function shapeSVG(shape,rotation=0){let inner=shape==='circle'?'<circle cx="50" cy="50" r="32" fill="#a8dfd6" stroke="#75a8aa" stroke-width="5"/>':shape==='triangle'?'<path d="M50 13 89 84H11Z" fill="#eab0ca" stroke="#b982a7" stroke-width="5"/>':A.star(50,50,38,'#f8d78f');inner+='<circle cx="50" cy="16" r="6" fill="#fff3cf" stroke="#af8b91" stroke-width="2"/>';return A.svg('<g transform="rotate('+rotation*90+' 50 50)">'+inner+'</g>','0 0 100 100');}
function rainAt(id){
 const p=positionOf(id),cloud=document.createElement('span');cloud.className='photo-rain-cloud';cloud.style.left=p.x+'%';cloud.style.top=(p.y-23)+'%';cloud.innerHTML=A.icon('cloud');$('effects').append(cloud);
 for(let i=0;i<16;i++)later(()=>{if(state.world!=='sea')return;const drop=document.createElement('span');drop.className='photo-rain-drop';drop.style.left='calc('+p.x+'% + '+((i%5-2)*12)+'px)';drop.style.top=(p.y-13)+'%';$('effects').append(drop);later(()=>drop.remove(),950);},250+i*75);
 later(()=>cloud.remove(),2400);$('toys').querySelector('[data-id="coral"]')?.classList.add('coral-growing');
}
function action(verb,target,data={},options={}){
 const before=C.stars(state),priorWorld=state.world,r=C.perform(state,verb,target,data);save();
 if(r.effect==='battle'){startBattle();return r;}
 if(r.project){if(['friend','gears','gate'].includes(r.project))mode=null;if(r.project==='gears')stealth=null;if(r.project==='skyshow'){battle=null;mode=null;}}
 if(options.render!==false)render();say(r.message,r.ok?(r.project?'star':r.effect==='photo'?'camera':'moco'):'moco');
 if(r.ok){tone(r.project?3:r.effect==='note'?(C.ws(state)?.taps[target]||0):1);if(target)fx(target,r.effect, r.project?23:8);}
 if(r.effect==='rain')rainAt(target);
 if(r.effect==='photo'){photoCarry=false;$('flash').hidden=reduced();later(()=>$('flash').hidden=true,420);renderPocket();}
 if(r.reward){clearTimeout(rewardTimer);const title=r.message;$('reward').innerHTML='<span>'+A.icon('star')+'</span><div><small>'+ (C.stars(state)>before?'アトリエの ぶひんが とどいた！':'すてきな ひらめき！')+'</small><b>'+title+'</b></div>';$('reward').hidden=false;rewardTimer=setTimeout(()=>$('reward').hidden=true,4200);for(let i=0;i<3;i++)later(()=>tone(i),i*120);}
 if(r.effect==='finale'){for(let i=0;i<6;i++)later(()=>{fx('storm','star',18);fx('planet','heart',13);},i*350);say('そらいっぱいの ショー！ アトリエも おおきく なったよ。','star');}
 if(verb==='travel'&&r.ok){if(priorWorld!==state.world){$('stage').classList.remove('warping');void $('stage').offsetWidth;$('stage').classList.add('warping');later(()=>$('stage').classList.remove('warping'),750);}}
 return r;
}
function clearModes(){selectedDecor=null;mode=null;battle=null;stealth=null;quizBusy=false;songPlaying=false;songToken++;photoCarry=false;drag=null;$('dragGhost').hidden=true;}
function travel(world){if(!C.unlocked(state,world)){say(C.perform(state,'travel',world).message,'star');return;}clearModes();const r=action('travel',world);if(r.ok){tool='hand';render();$('stage').focus({preventScroll:true});}}
function chooseTool(next,sub){
 if(next!=='photo'&&!C.tools(state).includes(next)){say(next==='scope'?'もりの 3つの ひらめきで、スコープが とどくよ。':'うみの 3つの ひらめきで、まほうが とどくよ。','star');return;}
 mode=null;stealth=null;battle=null;songPlaying=false;songToken++;tool=next;photoCarry=next==='photo';if(sub)care=sub;render();
 say(next==='hand'?'さわる・ひっぱる。なにが おきるかな？':next==='care'?'どうぐを えらんで、おせわを してみよう。':next==='camera'?'きになる ものを タッチして パシャ！':next==='build'?(state.world==='home'?'かざりを えらんで、じめんに おこう。':'かたちを えらんで、おなじ あなへ。むきも みよう。'):next==='scope'?'スコープを うごかして、しょうたいを みよう。':next==='photo'?'この しゃしんを どこへ とどけよう？':'きになる ものに まほうを かけよう。',next==='photo'?'camera':next);
}
function start(){active=true;$('intro').hidden=true;$('game').hidden=false;render();say(state.awake?C.goal(state).text:'モコは すやすや。なでたり、びよーんと してみよう。');save();}
function render(){
 if(!active)return;
 const world=state.world,g=C.goal(state),w=C.ws(state),complete=world!=='home'&&C.worlds[world].projects.every(([p])=>C.has(state,p));
 $('stage').dataset.world=world;$('stage').dataset.round=String(w?.round||0);$('stage').classList.toggle('is-photographing',tool==='camera');$('stage').classList.toggle('is-carrying',tool==='photo');$('stage').classList.toggle('is-stealth',!!stealth);
 const building=tool==='build'&&world!=='home'&&C.canBuild(state)&&!C.has(state,world==='forest'?'windmill':'boat')&&world!=='space';$('stage').classList.toggle('is-building',building);
 $('worldName').textContent=world==='home'?'きみの ひみつアトリエ':C.worlds[world].name;$('roundName').textContent=world==='home'?'':(w.round+1)+'つめの ふしぎ';
 $('goalText').textContent=g.text;$('chapterName').textContent=world==='home'?'ひらめきで そだつ、きみだけの おうち。':complete?'みつけた！ つぎは なにを ためそう？':'あそびの なかから、ひらめきを。';$('goalArt').innerHTML=A.icon(g.sub||(g.tool==='photo'?'camera':g.tool));
 $('starCount').textContent=C.stars(state);$('bookCount').textContent=state.discoveries.length+' / 36';$('soundButton').setAttribute('aria-pressed',String(state.sound));$('soundButton').setAttribute('aria-label',state.sound?'こえと おとを けす':'こえと おとを つける');
 $('scenery').innerHTML=A.scene(world,w?.round||0)+(world==='home'?'':'<img class="world-paint" src="./assets/'+world+'.webp" alt="">');
 $('scenery').querySelector('img')?.addEventListener('error',e=>e.target.hidden=true);
 $('projectMarks').innerHTML=world==='home'?'<span class="project-mark done">'+A.icon('home')+'</span>':C.worlds[world].projects.map(([p,name])=>'<span class="project-mark '+(C.has(state,p)?'done':'')+'" title="'+name+'" aria-label="'+name+(C.has(state,p)?'、できた':'、まだ')+'">'+A.icon('star')+'</span>').join('');
 $('toys').innerHTML=objects[world].filter(([id])=>!(id==='gears'&&stealth)).map(([id,name,x,y,size,mobile])=>{
  const done={flower:'bloom',fox:'clinic',mill:'windmill',coral:'coral',crowd:'friend',boat:'boat',gate:'gate',storm:'skyshow',gears:'gears'}[id];const isDone=done&&C.has(state,done);const art=id==='wardrobe'?A.icon('hat'):id==='travel'?A.icon('travel'):id==='gift'?A.icon('star'):A.prop(id,state);
  return '<button class="toy '+(g.target===id&&!complete?'quest-target ':'')+(isDone?'done ':'')+(id==='visitor'&&w?.scan?'scanned ':'')+(building&&id===(world==='forest'?'mill':'boat')?'build-target ':'')+(battle&&id==='storm'?'battle-cloud ':'')+'" data-id="'+id+'" aria-label="'+name+'" style="--x:'+x+'%;--y:'+y+'%;--size:'+size+'px;--mobile:'+mobile+'px"><span class="toy-art">'+art+'</span><span class="toy-name">'+name+'</span></button>';
 }).join('');
 $('decorations').innerHTML=world==='home'?state.decorations.map((d,i)=>'<button class="decoration '+(selectedDecor===i?'chosen':'')+'" data-decoration="'+i+'" aria-label="'+(names[d.art]||d.art)+'の かざりを うごかす" style="left:'+d.x+'%;top:'+d.y+'%;rotate:'+((d.turn||0)*90)+'deg;scale:'+(d.size||1)+'">'+A.icon(d.art)+'</button>').join(''):'';
 $('mocoArt').innerHTML=A.moco(state.look,state.awake?'happy':'sleep');$('moco').classList.toggle('awake',state.awake);$('mocoMood').textContent=state.awake?'':'Z z z';
 if(!stealth){$('moco').style.left='14%';$('moco').style.top='73%';$('moco').classList.remove('walking');$('moco').style.opacity='1';}
 renderTools();renderPocket();renderSecondary();renderPlay();renderNav();
 $('remixButton').hidden=!complete;$('nextWorldButton').hidden=!complete;
 if(complete){const next=world==='forest'?'sea':world==='sea'?'space':'home';$('nextWorldButton').innerHTML='<span>'+A.icon(next==='home'?'home':C.worlds[next].icon)+'</span>'+(next==='home'?'アトリエを みよう':'つぎの せかいへ')+' ↗';$('nextWorldButton').dataset.world=next;}
 renderLens();
}
function renderTools(){const available=C.tools(state);$('tools').innerHTML=['hand','care','camera','build','scope','magic'].map(id=>'<button class="tool-button '+(tool===id?'selected ':'')+(!available.includes(id)?'locked':'')+'" data-tool="'+id+'" aria-label="'+toolNames[id]+(!available.includes(id)?'、まだ':'')+'" aria-pressed="'+(tool===id)+'" aria-disabled="'+!available.includes(id)+'"><span>'+A.icon(id)+'</span><b>'+toolNames[id]+'</b></button>').join('');}
function renderPocket(){const b=$('photoPocket');b.hidden=!state.photo;if(state.photo){const p=state.photos.find(p=>p.id===state.photo.id)||state.photos.slice().reverse().find(p=>p.world===state.photo.world&&p.target===state.photo.target);b.innerHTML=p?A.memory(p):A.icon('camera');b.classList.toggle('selected',photoCarry);}}
function renderSecondary(){
 const el=$('secondary');el.replaceChildren();
 if(battle){el.innerHTML='<div class="battle-controls"><button id="shieldButton"><span>'+A.icon('shield')+'</span>シールド</button><button id="chargeButton" '+(battle.phase==='charge'?'':'disabled')+'><span>'+A.icon('magic')+'</span>まほうを ながおし</button></div>';$('shieldButton').onclick=()=>{if(!battle||battle.phase==='charge')return;battle.shieldUntil=battle.clock+1100;$('moco').classList.add('guarded');tone(0);};$('chargeButton').onpointerdown=e=>{if(battle?.phase==='charge'){battle.holding=true;$('chargeButton').setPointerCapture(e.pointerId);}};$('chargeButton').onpointerup=$('chargeButton').onpointercancel=()=>{if(battle)battle.holding=false;};$('chargeButton').onkeydown=e=>{if((e.key===' '||e.key==='Enter')&&battle?.phase==='charge'){e.preventDefault();battle.holding=true;}};$('chargeButton').onkeyup=()=>{if(battle)battle.holding=false;};return;}
 if(stealth){el.innerHTML='<button class="sub-tool" id="sneakToggle">'+(stealth.slow?'そっと あるく ✓':'はしる！')+'</button><button class="sub-tool" id="leaveStealth">× いったん やめる</button>';$('sneakToggle').onclick=()=>{stealth.slow=!stealth.slow;renderSecondary();};$('leaveStealth').onclick=()=>{stealth=null;mode=null;render();};return;}
 if(tool==='care')el.innerHTML=['water','steth','spray','bandage'].map(id=>'<button class="sub-tool '+(care===id?'selected':'')+'" data-care="'+id+'" aria-label="'+names[id]+'" aria-pressed="'+(care===id)+'"><span>'+A.icon(id)+'</span>'+names[id]+'</button>').join('');
 if(tool==='build'){
  if(state.world==='home'&&selectedDecor!==null){el.innerHTML='<button class="sub-tool" id="turnDecor">↻ まわす</button><button class="sub-tool" id="sizeDecor">↔ おおきさ</button><button class="sub-tool" id="removeDecor">× しまう</button><button class="sub-tool" id="moreDecor">＋ かざり</button>';$('turnDecor').onclick=()=>action('turnDecoration','house',{index:selectedDecor});$('sizeDecor').onclick=()=>action('sizeDecoration','house',{index:selectedDecor});$('removeDecor').onclick=()=>{const index=selectedDecor;selectedDecor=null;action('removeDecoration','house',{index});};$('moreDecor').onclick=()=>{selectedDecor=null;renderSecondary();};return;}
  if(state.world==='home')el.innerHTML='<div class="decor-palette">'+C.decorTypes(state).map(id=>'<button class="sub-tool '+(decor===id?'selected':'')+'" data-decor="'+id+'" aria-label="'+(names[id]||id)+'の かざり" aria-pressed="'+(decor===id)+'"><span>'+A.icon(id)+'</span></button>').join('')+'</div><button class="sub-tool" id="undoButton" aria-label="かざりを ひとつ もどす">↶ もどす</button>';
  else el.innerHTML=['circle','triangle','star'].map(id=>'<button class="sub-tool '+(piece.shape===id?'selected':'')+'" data-piece="'+id+'" aria-label="'+names[id]+'の パーツ" aria-pressed="'+(piece.shape===id)+'"><span class="shape">'+shapeSVG(id,piece.rotation)+'</span>'+names[id]+'</button>').join('')+'<button id="rotateButton" class="sub-tool rotate" aria-label="パーツを 90ど まわす">↻ <small>まわす</small></button>';
 }
 if(tool==='photo')el.innerHTML='<button id="putPhotoAway" class="sub-tool"><span>'+A.icon('camera')+'</span>しゃしんを しまう</button>';
 if(tool==='scope')el.innerHTML='<span class="sub-tool scope-guide">スコープで みて、まほうで ごあいさつ。</span>';
 if(tool==='hand'&&state.world==='home'&&state.awake)el.innerHTML='<button id="quickCloset" class="sub-tool"><span>'+A.icon('hat')+'</span>おきがえ</button><button id="quickBuild" class="sub-tool"><span>'+A.icon('build')+'</span>アトリエを つくる</button>';
 $('undoButton')?.addEventListener('click',()=>action('undo','house'));$('rotateButton')?.addEventListener('click',()=>{piece.rotation=(piece.rotation+1)%4;renderSecondary();tone(piece.rotation);});$('putPhotoAway')?.addEventListener('click',()=>chooseTool('camera'));$('quickCloset')?.addEventListener('click',openCloset);$('quickBuild')?.addEventListener('click',()=>chooseTool('build'));
}
function renderNav(){$('worldNav').innerHTML=[['home','アトリエ','home'],...Object.entries(C.worlds).map(([id,w])=>[id,w.short,w.icon])].map(([id,name,icon])=>'<button class="world-tab '+(state.world===id?'active':'')+'" data-world="'+id+'" aria-label="'+name+'へ でかける" aria-current="'+(state.world===id?'location':'false')+'" aria-disabled="'+!C.unlocked(state,id)+'"><span>'+A.icon(icon)+'</span>'+name+'</button>').join('');}
function panel(title,content,classes=''){return '<section class="mode-panel '+classes+'" aria-label="'+title+'"><div class="mode-heading"><h2>'+title+'</h2><button id="closeMode" aria-label="とじる">×</button></div>'+content+'</section>';}
function renderPlay(){
 const el=$('playLayer');el.replaceChildren();const world=state.world,w=C.ws(state);
 if(tool==='care'){
  const target=world==='forest'&&care==='water'?'flower':world==='sea'&&care==='water'?'coral':world==='forest'&&care==='spray'&&C.has(state,'diagnosed')&&!C.has(state,'clinic')?'fox':null;
  if(target){const p=positionOf(target),arr=care==='spray'?w.cleaned:w.watered;el.innerHTML='<div class="patches" style="left:'+p.x+'%;top:'+(p.y+(target==='fox'?12:18))+'%">'+[0,1,2].map(i=>'<button class="patch '+(arr.includes(i)?'done':'')+'" data-cell="'+i+'" data-target="'+target+'" aria-label="'+(i+1)+'ばんの '+(care==='spray'?'きずを きれいに':'しずくを とどける')+'">'+A.icon(care==='spray'?'spray':'water')+'</button>').join('')+'</div>';}
 }
 if(tool==='build'&&world!=='home'&&C.canBuild(state)&&world!=='space'&&!C.has(state,world==='forest'?'windmill':'boat')){
  el.innerHTML=C.buildPlan(state).map((p,i)=>'<button class="socket '+(w.parts.includes(i)?'snapped':'')+'" style="left:'+(34+i*16)+'%" data-slot="'+i+'" aria-label="'+(i+1)+'ばんの パーツの あな、'+names[p.shape]+'、'+(p.rotation*90)+'ど">'+shapeSVG(p.shape,p.rotation)+'</button>').join('');
 }
 if(mode==='quiz'){
  const q=C.quizQuestion(state);el.innerHTML=panel('ふくろうの ひみつ','<div class="quiz-prompt"><span>'+A.icon(q.art)+'</span><b>'+q.q+'</b></div><div class="quiz-choices">'+q.choices.map(id=>'<button class="answer" data-answer="'+id+'" aria-label="'+(names[id]||id)+'">'+A.icon(id)+'</button>').join('')+'</div><p class="mode-progress">'+w.quiz+' / 3</p>');
 }
 if(mode==='search'){
  const t=C.searchTarget(state);let crowd='';for(let i=0;i<24;i++){let look=i===t.index?t:{color:['peach','blue','lilac','mint','yellow'][i%5],hat:['star','heart','leaf'][Math.floor(i/3)%3],ears:['flop','round','point'][i%3]};if(i!==t.index&&look.color===t.color&&look.hat===t.hat&&look.ears===t.ears)look={...look,hat:'bow'};crowd+='<button class="crowd-person '+(wrongPeople.has(i)?'wrong':'')+'" data-person="'+i+'" aria-label="'+(i===t.index?'てがかりと おなじ おともだち':'ほかの おともだち')+'">'+A.moco(look)+'</button>';}
  el.innerHTML=panel('まいごの ふわりは どこ？','<div class="search-reference"><span>'+A.moco(t)+'</span><p>みみ・いろ・ぼうし。<br>このこを みつけてね。</p></div><div class="crowd-grid">'+crowd+'</div>','search-panel');
 }
 if(mode==='song')el.innerHTML=panel('かいがらの おとを おぼえよう','<div class="note-choices">'+[0,1,2,3].map(i=>'<button class="note-key" style="--note:'+['#d8b1d8','#acd7d3','#e8cc96','#bec7eb'][i]+'" data-note="'+i+'" aria-label="'+['ピンク','みどり','きいろ','あお'][i]+'の かいがら" '+(songPlaying?'disabled':'')+'>♪<small>'+['ピンク','みどり','きいろ','あお'][i]+'</small></button>').join('')+'</div><p id="songWords" class="mode-progress">'+(songPlaying?'まずは きいてね。':'おなじ じゅんばんに タッチ。')+'</p><button id="replaySong" class="sub-tool" style="margin:12px auto 0" '+(songPlaying?'disabled':'')+'>♪ もういちど きく</button>','note-panel');
 if(mode==='word'){
  const symbol=['sun','moon','star'][w.round];el.innerHTML=panel('びんに かいてあるのは？','<div class="word-prompt"><span>'+A.icon(symbol)+'</span><b>'+['SUN','MOON','STAR'][w.round]+'</b></div><div class="quiz-choices">'+['star','sun','moon'].map(id=>'<button class="answer" data-word="'+id+'" aria-label="'+names[id]+'">'+A.icon(id)+'</button>').join('')+'</div>');
 }
 if(mode==='gate'){
  const c=C.code(state);el.innerHTML=panel(w.code?'ことばと えを あわせよう':'ランタンは なんこ？',w.code?'<div class="word-prompt"><b>'+c.word+'</b></div><div class="quiz-choices">'+['moon','star','sun'].map(id=>'<button class="answer" data-symbol="'+id+'" aria-label="'+names[id]+'">'+A.icon(id)+'</button>').join('')+'</div>':'<div class="quiz-choices">'+[2,3,4].map(n=>'<button class="answer number-answer" data-number="'+n+'" aria-label="'+n+'こ">'+n+'</button>').join('')+'</div>');
 }
 if(stealth){
  el.innerHTML='<svg class="stealth-svg" viewBox="0 0 1000 600" preserveAspectRatio="none"><path id="visionCone" fill="#ffe3a63f" stroke="#ffe2ab66" stroke-width="2"/></svg>'+[[230,410],[550,435],[800,390]].map(([x,y])=>'<span class="cover" style="left:'+x/10+'%;top:'+y/6+'%"></span>').join('')+[[260,300],[650,330],[850,210]].map(([x,y],i)=>w.gears.includes(i)?'':'<button class="space-gear" data-gear="'+i+'" style="left:'+x/10+'%;top:'+y/6+'%" aria-label="'+(i+1)+'ばんの はぐるまへ そっと あるく">'+A.icon('gear')+'</button>').join('')+'<div class="alert-meter"><span id="stealthWords">ひかりを よけて、そっと。</span><i><b id="alertFill"></b></i><b>'+w.gears.length+' / 3</b></div>';
 }
 if(battle)el.innerHTML='<div id="battleWords" class="battle-status">'+(battle.phase==='charge'?'まほうを ながおし！':'ひかりを みて シールド！')+'</div><div class="charge-meter"><i id="chargeFill"></i></div>'+(battle.phase==='won'?'<div class="battle-beam"></div>':'');
 $('closeMode')?.addEventListener('click',()=>{mode=null;songPlaying=false;songToken++;render();});$('replaySong')?.addEventListener('click',playSong);
}
function renderLens(){const scanning=tool==='scope'&&state.world!=='home';$('lens').hidden=!scanning;$('revealLayer').innerHTML='';if(scanning){const p=positionOf('visitor');$('revealLayer').innerHTML='<span class="toy" style="--x:'+p.x+'%;--y:'+p.y+'%;--size:96px;--mobile:66px"><span class="toy-art">'+A.icon('alien')+'</span></span>';}else $('revealLayer').style.clipPath='circle(0 at 0 0)';}
function moveLens(e){if(tool!=='scope'||state.world==='home')return;const r=$('stage').getBoundingClientRect(),x=e.clientX-r.left,y=e.clientY-r.top,radius=innerWidth<750?62:77;$('lens').style.left=x+'px';$('lens').style.top=y+'px';$('revealLayer').style.clipPath='circle('+radius+'px at '+x+'px '+y+'px)';const p=positionOf('visitor');if(Math.hypot(x-r.width*p.x/100,y-r.height*p.y/100)<radius*.65&&!C.ws(state).scan){const reply=C.perform(state,'scan','visitor');save();$('toys').querySelector('[data-id="visitor"]')?.classList.add('scanned');say(reply.message,'scope');tone(2);}}
function interact(id,fromDrag=false){
 if(id==='moco'){if(!state.awake){mocoTaps++;fx('moco','heart',5);say(mocoTaps<3?'モコ、まだ ねむそう。もうすこし なでよう。':'おはよう、モコ！');if(mocoTaps>=3){action('wake','moco');say('おはよう！ もりへ でかけてみよう。','travel');}}else action(tool==='care'?'care':'hand','moco');return;}
 if(state.world==='home'){
  if(tool==='camera'){action('photo','house');return;}
  if(id==='wardrobe'){openCloset();return;}if(id==='travel'){travel('forest');return;}if(id==='gift'){openBook();return;}if(id==='house'){say('つくる どうぐで、きみだけの アトリエを かざろう。','build');chooseTool('build');return;}
 }
 if(tool==='photo'){action('givePhoto',id);return;}
 if(tool==='scope'){const r=$('stage').getBoundingClientRect(),p=positionOf(id);moveLens({clientX:r.left+p.x/100*r.width,clientY:r.top+p.y/100*r.height});action('scan',id);return;}
 if(tool==='camera'){action('photo',id);return;}
 if(tool==='magic'){action('magic',id);return;}
 if(tool==='build'){say(C.canBuild(state)?'かたちの パーツを えらんで、おなじ あなへ。':'おてつだいで パーツを あつめよう。','build');return;}
 if(tool==='care'){
  if(care==='water'&&['flower','coral'].includes(id)){if(fromDrag){const cell=[0,1,2].find(i=>!C.ws(state).watered.includes(i))??0;action('water',id,{cell});}else say('3つの しずくを とどけよう。','water');return;}
  if(care==='spray'&&id==='fox'){if(fromDrag){const cell=[0,1,2].find(i=>!C.ws(state).cleaned.includes(i))??0;action('spray',id,{cell});}else if(!C.has(state,'diagnosed'))action('spray',id);else say('きずの 3つの ところを きれいに しよう。','spray');return;}
  if(id==='mushrooms'){action('care',id);return;}
  action(care,id);return;
 }
 if(id==='owl'){if(C.has(state,'quiz')){say('もう はかせだね！ ふうしゃを つくってみよう。','owl');return;}mode='quiz';render();speak(C.quizQuestion(state).q);return;}
 if(id==='crowd'){if(C.has(state,'friend')){say('ふわりも いっしょに あそびたいって！','moco');fx(id,'heart');return;}mode='search';wrongPeople=new Set();render();say('みみと いろと ぼうしが おなじ こを さがそう。');return;}
 if(id==='buoy'){if(C.has(state,'melody')){say('かいがらの うたは おぼえたね。ふねを つくろう。','note');return;}mode='song';playSong();return;}
 if(id==='bottle'){mode='word';render();say('びんの ことばと おなじ えは どれ？','bottle');return;}
 if(id==='gears'){startStealth();return;}
 if(id==='lamps'){action('clue',id);return;}
 if(id==='gate'){
  if(!C.has(state,'gears')||!C.has(state,'clue')||!C.has(state,'planetphoto')){action('code',id);return;}
  if(C.has(state,'gate')){say('とびらの むこうに くろくも！ まほうの でばんだ。','magic');return;}mode='gate';render();say('ランタンの かずと、わくせいの えを あわせよう。','gate');return;
 }
 if(id==='storm'&&!C.has(state,'skyshow')){say('まほうの どうぐで、くもに こえを かけよう。','magic');return;}
 action('hand',id);
}
function playSong(){
 const token=++songToken;C.ws(state).memory=0;songPlaying=true;render();say('まずは おとと いろを おぼえよう。','note');
 const seq=C.melody(state);seq.forEach((n,i)=>{later(()=>{if(mode!=='song'||token!==songToken||document.hidden)return;const b=$('playLayer').querySelector('[data-note="'+n+'"]');b?.classList.add('lit');tone(n,.42);later(()=>b?.classList.remove('lit'),430);},700+i*700);});
 later(()=>{if(mode!=='song'||token!==songToken)return;songPlaying=false;render();say('おなじ じゅんばんに タッチしてみよう。','note');},850+seq.length*700);
}
function startStealth(){mode='stealth';stealth={x:80,y:480,tx:80,ty:480,time:0,alert:0,slow:true,moving:false,hidden:false,seen:false};render();say('じめんを タッチで あるく。しげみで かくれよう。','leaf');$('stage').focus({preventScroll:true});}
function startBattle(){mode=null;stealth=null;const guards=C.ws(state).guards;battle={phase:guards>=3?'charge':'ready',clock:0,start:0,shieldUntil:0,holding:false,charge:0,guarded:false};render();say(guards>=3?'まほうを ながおしして、とどけよう。':'くもが ぴかっと したら シールドを おそう。','magic');}
function stagePoint(e){const r=$('stage').getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*100,y:(e.clientY-r.top)/r.height*100};}
function moveStealth(p){if(!stealth)return;stealth.tx=Math.max(60,Math.min(940,p.x*10));stealth.ty=Math.max(170,Math.min(500,p.y*6));stealth.moving=true;}
function frame(now){const dt=Math.min(.05,(now-lastFrame)/1000||0);lastFrame=now;
 if(active&&!document.hidden&&!document.querySelector('dialog[open]')){
  if(stealth){const f=stealth;f.time+=dt;const angle=Math.PI*.5+Math.sin(f.time*.65)*1.25,gx=500,gy=180,radius=360,half=.34,a=angle-half,b=angle+half;$('visionCone')?.setAttribute('d','M'+gx+' '+gy+'L'+(gx+Math.cos(a)*radius)+' '+(gy+Math.sin(a)*radius)+'A'+radius+' '+radius+' 0 0 1 '+(gx+Math.cos(b)*radius)+' '+(gy+Math.sin(b)*radius)+'Z');
   if(f.moving){const dx=f.tx-f.x,dy=f.ty-f.y,len=Math.hypot(dx,dy),step=(f.slow?160:270)*dt;if(len<=step){f.x=f.tx;f.y=f.ty;f.moving=false;}else{f.x+=dx/len*step;f.y+=dy/len*step;}}
   const hidden=[[230,410],[550,435],[800,390]].some(([x,y])=>Math.hypot(f.x-x,f.y-y)<70);if(hidden&&!f.hidden){C.perform(state,'hide','cover');save();}f.hidden=hidden;
   let diff=Math.atan2(f.y-gy,f.x-gx)-angle;while(diff>Math.PI)diff-=Math.PI*2;while(diff<-Math.PI)diff+=Math.PI*2;f.seen=!hidden&&Math.abs(diff)<half&&Math.hypot(f.x-gx,f.y-gy)<radius;
   const noisy=!f.slow&&f.moving&&!hidden&&Math.hypot(f.x-gx,f.y-gy)<260;f.alert=Math.max(0,Math.min(100,f.alert+dt*(f.seen?39:noisy?24:-38)));
   if(f.alert>=100){f.x=80;f.y=480;f.tx=80;f.ty=480;f.alert=0;f.moving=false;say('あっ、みつかった！ あつめた ものは そのまま。もういちど。','leaf');}
   $('moco').style.left=f.x/10+'%';$('moco').style.top=f.y/6+'%';$('moco').style.opacity=hidden?'.55':'1';$('moco').classList.toggle('walking',f.moving);if($('alertFill'))$('alertFill').style.width=f.alert+'%';if($('stealthWords'))$('stealthWords').textContent=hidden?'かくれているよ。':f.seen?'ひかりが こっちに！':'そっと、そっと。';
   const gearPoints=[[260,300],[650,330],[850,210]];for(let i=0;i<gearPoints.length;i++){if(stealth&&!C.ws(state).gears.includes(i)&&Math.hypot(f.x-gearPoints[i][0],f.y-gearPoints[i][1])<42){action('gear','gears',{index:i});}}
  }
  if(battle){const b=battle;b.clock+=dt*1000;const cloud=$('toys').querySelector('[data-id="storm"]');$('moco').classList.toggle('guarded',b.shieldUntil>b.clock);
   if(b.phase==='ready'&&b.clock-b.start>1700){b.phase='warning';b.start=b.clock;cloud?.classList.add('warning');if($('battleWords'))$('battleWords').textContent='ぴかっ！ シールド！';say('ぴかっ！ シールド！','shield');}
   if(b.phase==='warning'&&b.clock-b.start>1250){b.phase='attack';b.start=b.clock;b.guarded=b.shieldUntil>b.clock;cloud?.classList.remove('warning');fx('storm','star',5);}
   if(b.phase==='attack'&&b.clock-b.start>400){if(b.guarded){C.perform(state,'guard','storm');save();tone(2);say('まもれた！ '+C.ws(state).guards+' / 3','shield');}else say('だいじょうぶ。ぴかっと してから おそう。','shield');b.phase=C.ws(state).guards>=3?'charge':'ready';b.start=b.clock;if($('battleWords'))$('battleWords').textContent=b.phase==='charge'?'みんなの まほうを ながおし！':'もういちど、ひかりを みよう。';renderSecondary();}
   if(b.phase==='charge'&&b.holding){b.charge=Math.min(1,b.charge+dt*.58);if($('chargeFill'))$('chargeFill').style.width=b.charge*100+'%';if(b.charge>=1){b.phase='won';b.holding=false;cloud?.classList.add('cleared');$('playLayer').insertAdjacentHTML('beforeend','<div class="battle-beam"></div>');later(()=>{if(battle===b){$('moco').classList.remove('guarded');action('finishShow','storm');}},900);}}
  }
 }
 requestAnimationFrame(frame);
}
function openBook(){bookWorld=state.world==='home'?'forest':state.world;renderBook();$('book').showModal();}
function renderBook(){$('bookTabs').innerHTML=Object.entries(C.worlds).map(([id,w])=>'<button class="book-tab '+(bookWorld===id?'active':'')+'" data-book-world="'+id+'">'+w.short+' '+state.discoveries.filter(d=>d.startsWith(id+':')).length+' / 12</button>').join('');$('bookGrid').innerHTML=C.entries[bookWorld].map(([id,name,art])=>{const got=state.discoveries.includes(bookWorld+':'+id);return '<button class="discovery '+(got?'got':'locked')+'" data-entry="'+id+'" aria-label="'+(got?name:'まだの はっけん。ヒントを みる')+'"><span>'+ (got?A.icon(art):'?')+'</span><b>'+(got?name:'どんな ふしぎ？')+'</b></button>';}).join('');}
function openCloset(){renderCloset();$('closet').showModal();}
function renderCloset(){$('closetPreview').innerHTML=A.moco(state.look);$('closetChoices').innerHTML=[['color','モコの いろ',[['peach','もも'],['blue','そら'],['lilac','すみれ'],['mint','ミント'],['yellow','ひよこ']]],['ears','みみの かたち',[['flop','たれみみ'],['round','まるみみ'],['point','とんがり']]],['hat','すきな かざり',[['star','おほしさま'],['heart','ハート'],['leaf','はっぱ'],['crown','おうかん'],['bow','リボン'],['none','なし']]]].map(([key,title,opts])=>'<div class="choice-group"><h3>'+title+'</h3><div>'+opts.map(([id,name])=>'<button class="look-choice" data-look="'+key+':'+id+'" aria-pressed="'+(state.look[key]===id)+'">'+name+'</button>').join('')+'</div></div>').join('');}
function openAlbum(){$('albumGrid').innerHTML=state.photos.length?state.photos.slice().reverse().map((p,i)=>'<article class="memory-card"><div>'+A.memory(p)+'</div><p>'+(p.world==='home'?'きみの アトリエ':C.worlds[p.world].name)+' · '+(p.round+1)+'つめの ふしぎ</p><button data-take-photo="'+(state.photos.length-1-i)+'">この しゃしんを もつ</button><button data-download="'+(state.photos.length-1-i)+'">しゃしんを ほぞん ↓</button></article>').join(''):'<div class="album-empty"><span>'+A.icon('camera')+'</span>カメラで パシャ！<br>ここに おもいでが ならぶよ。</div>';$('album').showModal();}
function downloadPhoto(index){const p=state.photos[index];if(!p)return;const str=A.memory(p),src=URL.createObjectURL(new Blob([str],{type:'image/svg+xml'})),img=new Image();img.onload=()=>{const canvas=document.createElement('canvas');canvas.width=800;canvas.height=600;canvas.getContext('2d').drawImage(img,0,0,800,600);canvas.toBlob(blob=>{URL.revokeObjectURL(src);if(!blob)return;const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='moco-memory-'+(index+1)+'.png';a.click();later(()=>URL.revokeObjectURL(url),3000);},'image/png');};img.onerror=()=>URL.revokeObjectURL(src);img.src=src;}
function beginDrag(e,payload){if(e.button!==0&&e.button!==undefined)return;drag={x:e.clientX,y:e.clientY,moved:false,payload,pointer:e.pointerId};}
$('tools').onclick=e=>{const b=e.target.closest('[data-tool]');if(b)chooseTool(b.dataset.tool);};
$('secondary').onclick=e=>{const c=e.target.closest('[data-care]'),p=e.target.closest('[data-piece]'),d=e.target.closest('[data-decor]');if(c){care=c.dataset.care;renderSecondary();renderPlay();tone(0);}if(p){piece.shape=p.dataset.piece;renderSecondary();tone(1);}if(d){decor=d.dataset.decor;renderSecondary();tone(1);}};
$('secondary').onpointerdown=e=>{const c=e.target.closest('[data-care]'),p=e.target.closest('[data-piece]'),d=e.target.closest('[data-decor]');if(c){care=c.dataset.care;beginDrag(e,{type:'care',value:care});}if(p){piece.shape=p.dataset.piece;beginDrag(e,{type:'piece',value:piece.shape});}if(d){decor=d.dataset.decor;beginDrag(e,{type:'decor',value:decor});}};
$('decorations').onpointerdown=e=>{const b=e.target.closest('[data-decoration]');if(!b)return;const index=Number(b.dataset.decoration);beginDrag(e,{type:'move',index,value:state.decorations[index].art});};
$('decorations').onclick=e=>{const b=e.target.closest('[data-decoration]');if(!b)return;e.stopPropagation();selectedDecor=Number(b.dataset.decoration);tool='build';render();say('ひっぱって うごかせるよ。むきや おおきさも かえよう。','build');};
$('decorations').onkeydown=e=>{const b=e.target.closest('[data-decoration]');if(!b)return;const delta={ArrowLeft:[-4,0],ArrowRight:[4,0],ArrowUp:[0,-4],ArrowDown:[0,4]}[e.key];if(!delta)return;e.preventDefault();const index=Number(b.dataset.decoration),d=state.decorations[index];action('moveDecoration','house',{index,x:d.x+delta[0],y:d.y+delta[1]});$('decorations').querySelector('[data-decoration="'+index+'"]').focus({preventScroll:true});};
$('photoPocket').onclick=()=>chooseTool('photo');$('photoPocket').onpointerdown=e=>beginDrag(e,{type:'photo'});
$('worldNav').onclick=e=>{const b=e.target.closest('[data-world]');if(b)travel(b.dataset.world);};$('homeButton').onclick=()=>travel('home');$('nextWorldButton').onclick=()=>travel($('nextWorldButton').dataset.world);$('remixButton').onclick=()=>{clearModes();tool='hand';action('remix','');};
$('stage').onclick=e=>{if(drag?.moved)return;if(e.target.closest('[data-decoration]'))return;const b=e.target.closest('[data-id]');if(b){interact(b.dataset.id);return;}if(e.target.closest('.play-layer,.speech,.world-sign,.project-marks,.next-world,.remix-button')&&e.target!==$('playLayer'))return;if(stealth){moveStealth(stagePoint(e));return;}if(tool==='build'&&state.world==='home'&&!e.target.closest('#moco')){const p=stagePoint(e);action('decorate','house',{art:decor,x:p.x,y:p.y});}};
$('stage').onpointermove=e=>{moveLens(e);if(e.buttons){const b=e.target.closest('[data-cell]');if(b&&tool==='care')action(care,b.dataset.target,{cell:Number(b.dataset.cell)});}};
$('playLayer').onclick=e=>{const cell=e.target.closest('[data-cell]'),slot=e.target.closest('[data-slot]'),answer=e.target.closest('[data-answer]'),person=e.target.closest('[data-person]'),note=e.target.closest('[data-note]'),word=e.target.closest('[data-word]'),number=e.target.closest('[data-number]'),symbol=e.target.closest('[data-symbol]'),gear=e.target.closest('[data-gear]');
 if(cell){action(care,cell.dataset.target,{cell:Number(cell.dataset.cell)});return;}
 if(slot){action('build',state.world==='forest'?'mill':'boat',{slot:Number(slot.dataset.slot),...piece});return;}
 if(answer&&!quizBusy){const r=action('quiz','owl',{answer:answer.dataset.answer},{render:false});if(r.ok){quizBusy=true;answer.classList.add('right');later(()=>{quizBusy=false;if(C.has(state,'quiz'))mode=null;render();if(mode==='quiz')speak(C.quizQuestion(state).q);},650);}else answer.disabled=true;return;}
 if(person){const index=Number(person.dataset.person);const r=action('find','crowd',{index});if(!r.ok){wrongPeople.add(index);renderPlay();}return;}
 if(note&&!songPlaying){tone(Number(note.dataset.note),.36);const r=action('note','buoy',{note:Number(note.dataset.note)});if(r.effect==='retrySong')later(()=>{if(mode==='song')playSong();},650);if(C.has(state,'melody')){mode=null;render();}return;}
 if(word){const r=action('word','bottle',{symbol:word.dataset.word});if(r.ok){mode=null;render();}return;}
 if(number){action('code','gate',{number:Number(number.dataset.number)});return;}if(symbol){action('code','gate',{symbol:symbol.dataset.symbol});return;}
 if(gear){const p=[[260,300],[650,330],[850,210]][Number(gear.dataset.gear)];moveStealth({x:p[0]/10,y:p[1]/6});}
};
$('moco').onclick=e=>{e.stopPropagation();if(ignoreMocoClick){ignoreMocoClick=false;return;}interact('moco');};
$('moco').onpointerdown=e=>{if(tool!=='hand'||stealth)return;mocoGrab={x:e.clientX,y:e.clientY,dx:0,dy:0};$('moco').setPointerCapture(e.pointerId);};
$('moco').onpointermove=e=>{if(!mocoGrab)return;mocoGrab.dx=e.clientX-mocoGrab.x;mocoGrab.dy=e.clientY-mocoGrab.y;const dx=Math.max(-65,Math.min(65,mocoGrab.dx)),dy=Math.max(-65,Math.min(65,mocoGrab.dy));$('mocoArt').style.transform='translate('+dx*.25+'px,'+dy*.25+'px) scale('+(1+Math.abs(dx)*.006)+','+(1+Math.abs(dy)*.006)+') rotate('+dx*.12+'deg)';};
function releaseMoco(){if(!mocoGrab)return;const len=Math.hypot(mocoGrab.dx,mocoGrab.dy),current=$('mocoArt').style.transform;$('mocoArt').style.transform='';if(!reduced())$('mocoArt').animate([{transform:current},{transform:'scale(.92,1.07)'},{transform:'scale(1.04,.96)'},{transform:'none'}],{duration:550,easing:'ease-out'});if(len>18){ignoreMocoClick=true;if(!state.awake){action('wake','moco');say('おはよう、モコ！ もりへ でかけよう。','travel');}else action('hand','moco');}mocoGrab=null;}
$('moco').onpointerup=releaseMoco;$('moco').onpointercancel=()=>{mocoGrab=null;$('mocoArt').style.transform='';};
addEventListener('pointermove',e=>{if(!drag)return;if(Math.hypot(e.clientX-drag.x,e.clientY-drag.y)>8){drag.moved=true;const p=drag.payload;$('dragGhost').hidden=false;$('dragGhost').innerHTML=p.type==='piece'?shapeSVG(p.value,piece.rotation):p.type==='photo'?A.icon('camera'):A.icon(p.value);$('dragGhost').style.left=e.clientX+'px';$('dragGhost').style.top=e.clientY+'px';}});
addEventListener('pointerup',e=>{if(!drag)return;const d=drag;drag=null;$('dragGhost').hidden=true;if(!d.moved)return;suppressClickUntil=performance.now()+300;const hit=document.elementFromPoint(e.clientX,e.clientY),target=hit?.closest('[data-id]'),slot=hit?.closest('[data-slot]');if(d.payload.type==='move'&&hit?.closest('#stage')){const p=stagePoint(e);selectedDecor=d.payload.index;action('moveDecoration','house',{index:selectedDecor,x:p.x,y:p.y});}else if(d.payload.type==='piece'&&slot)action('build',state.world==='forest'?'mill':'boat',{slot:Number(slot.dataset.slot),shape:d.payload.value,rotation:piece.rotation});else if(d.payload.type==='photo'&&target)action('givePhoto',target.dataset.id);else if(d.payload.type==='care'&&target){care=d.payload.value;interact(target.dataset.id,true);}else if(d.payload.type==='decor'&&hit?.closest('#stage')){const p=stagePoint(e);action('decorate','house',{art:d.payload.value,x:p.x,y:p.y});}e.preventDefault();});
addEventListener('click',e=>{if(performance.now()<suppressClickUntil){e.preventDefault();e.stopImmediatePropagation();}},true);
addEventListener('pointercancel',()=>{drag=null;$('dragGhost').hidden=true;});
$('stage').onkeydown=e=>{if(!stealth||e.target!==$('stage'))return;const d={ArrowLeft:[-90,0],ArrowRight:[90,0],ArrowUp:[0,-70],ArrowDown:[0,70]}[e.key];if(d){e.preventDefault();moveStealth({x:(stealth.x+d[0])/10,y:(stealth.y+d[1])/6});}};
$('hintButton').onclick=()=>{const g=C.goal(state);if(g.tool==='travel'){travel(g.target==='travel'?'forest':g.target);return;}chooseTool(g.tool,g.sub);say(g.text,g.tool==='photo'?'camera':g.tool);const el=g.target==='remix'?$('remixButton'):g.target==='moco'?$('moco'):$('toys').querySelector('[data-id="'+g.target+'"]');el?.classList.remove('hint-ring');if(el){void el.offsetWidth;el.classList.add('hint-ring');el.focus({preventScroll:true});}};
$('startButton').onclick=start;$('soundButton').onclick=()=>{state.sound=!state.sound;save();render();if(state.sound){tone(1);speak($('speechText').textContent);}else try{speechSynthesis.cancel();}catch{}};$('listenButton').onclick=()=>{if(!state.sound){state.sound=true;save();render();}speak($('speechText').textContent);};
$('bookButton').onclick=openBook;$('starButton').onclick=()=>{openBook();$('bookHint').textContent=C.stars(state)+'この ひらめき！ アトリエに かえると、もらった ぶひんで あそべるよ。';};$('albumButton').onclick=openAlbum;$('albumGrid').onclick=e=>{const b=e.target.closest('[data-download]');if(b)downloadPhoto(Number(b.dataset.download));const take=e.target.closest('[data-take-photo]');if(take){const p=state.photos[Number(take.dataset.takePhoto)];if(p){state.photo={world:p.world,target:p.target,id:p.id};save();$('album').close();chooseTool('photo');}}};
$('bookTabs').onclick=e=>{const b=e.target.closest('[data-book-world]');if(b){bookWorld=b.dataset.bookWorld;renderBook();}};$('bookGrid').onclick=e=>{const b=e.target.closest('[data-entry]');if(!b)return;const en=C.entries[bookWorld].find(v=>v[0]===b.dataset.entry);$('bookHint').textContent=en[3];speak(en[3]);};
$('closetChoices').onclick=e=>{const b=e.target.closest('[data-look]');if(!b)return;const [key,value]=b.dataset.look.split(':');C.perform(state,'look','',{[key]:value});save();renderCloset();tone(1);};$('dressDone').onclick=()=>{$('closet').close();render();say('この すがたで しゅっぱつ！','hat');};
$('parentButton').onclick=()=>$('parent').showModal();$('introParent').onclick=()=>$('parent').showModal();$('openCloset').onclick=()=>{$('parent').close();openCloset();};
$('resetButton').onclick=()=>$('resetConfirm').hidden=false;$('cancelReset').onclick=()=>$('resetConfirm').hidden=true;$('confirmReset').onclick=()=>{clearModes();timers.forEach(clearTimeout);timers.clear();clearTimeout(rewardTimer);state=C.fresh();tool='hand';care='water';mocoTaps=0;save();$('startButton').querySelector('b').textContent='モコに あいにいく';$('parent').close();$('resetConfirm').hidden=true;$('reward').hidden=true;$('effects').replaceChildren();$('flash').hidden=true;$('moco').classList.remove('guarded');$('moco').style.opacity='1';if(active){render();say('モコを なでて おこそう。');}else $('resumeText').textContent='';};
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$(b.dataset.close).close());document.querySelectorAll('[data-art]').forEach(el=>el.innerHTML=el.dataset.art==='moco'?A.moco(state.look):A.icon(el.dataset.art));
if(state.awake){$('startButton').querySelector('b').textContent='モコと つづきを あそぶ';$('resumeText').textContent=state.discoveries.length+'この はっけんと、'+C.stars(state)+'この ひらめきを おぼえているよ。';}
addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden){save();if(stealth)stealth.moving=false;if(battle)battle.holding=false;if(songPlaying){songToken++;songPlaying=false;renderPlay();}mocoGrab=null;drag=null;$('dragGhost').hidden=true;$('mocoArt').style.transform='';try{speechSynthesis.cancel();}catch{}}});
window.MocoLab={get state(){return state;},get tool(){return tool;},get mode(){return mode;},core:C,chooseTool,travel,save,render};requestAnimationFrame(frame);
})();

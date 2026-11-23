(() => {
'use strict';
const $=id=>document.getElementById(id),S=TownStory,A=TownArt,KEY='nijiiro-town.adventure.v2';
let playerKey='';
let state=S.fresh(),voice=false,active=false,selected='',decorArt=null,scale=.65,pan={x:0,y:0},destination=null,last=0,drag=null,moved=false,toastTimer,audio;
try{state=S.validate(JSON.parse(localStorage.getItem(KEY)));voice=localStorage.getItem(KEY+'.voice')==='true';}catch{}
const reduced=()=>matchMedia('(prefers-reduced-motion:reduce)').matches;
const api=window.Town={get state(){return state;},$: $,get selected(){return selected;},get scale(){return scale;},get active(){return active;},art:A,story:S};
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));$('saveNotice').hidden=true;}catch{$('saveNotice').hidden=false;}}
function say(text){if(!voice||document.hidden||!window.speechSynthesis||!window.SpeechSynthesisUtterance)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ja-JP';u.rate=.87;u.pitch=1.12;speechSynthesis.speak(u);}catch{}}
function tone(n=0){if(!voice||document.hidden)return;try{const C=window.AudioContext||window.webkitAudioContext;if(!audio&&C)audio=new C();if(!audio)return;if(audio.state==='suspended')audio.resume().catch(()=>{});const o=audio.createOscillator(),g=audio.createGain(),t=audio.currentTime;o.frequency.value=[523,659,784,880,1047][n%5];g.gain.setValueAtTime(.065,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g);g.connect(audio.destination);o.start();o.stop(t+.35);}catch{}}
function message(text,speak=true){$('message').textContent=text;if(speak)say(text);}
function toast(text,art='star'){$('toast').innerHTML=A.icon(art)+`<b>${text}</b>`;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,3000);}
function focusOn(x,y){const r=$('viewport').getBoundingClientRect();pan.x=r.width/2-x*scale;pan.y=r.height*.70-y*scale;clampPan();transform();}
function clampPan(){const r=$('viewport').getBoundingClientRect();pan.x=Math.min(40,Math.max(r.width-2500*scale-40,pan.x));pan.y=Math.min(30,Math.max(r.height-1200*scale-30,pan.y));}
function transform(){$('world').style.transform=`translate(${pan.x}px,${pan.y}px) scale(${scale})`;}
function point(e){const r=$('viewport').getBoundingClientRect();return{x:(e.clientX-r.left-pan.x)/scale,y:(e.clientY-r.top-pan.y)/scale};}
function nextGoal(){return S.steps.find(([id])=>!state.flags.includes(id)&&S.available(state,id))||S.steps.at(-1);}
function renderPlayer(){const k=JSON.stringify(state.outfit)+state.flags.includes('detective');if(k!==playerKey){$('player').innerHTML=A.character({...state.outfit,magic:state.flags.includes('detective')});playerKey=k;}$('player').style.left=state.position.x+'px';$('player').style.top=state.position.y+'px';}
function updateGoal(){const next=nextGoal();$('goalTitle').textContent=state.flags.includes('finale')?'おまつりの はじまり！':next[1];$('chapterBadge').textContent=state.flags.includes('finale')?'みんなの おまつり':state.flags.includes('treasure')?'おしろの ひみつへ':state.flags.includes('bridge')?'もりの たからを さがそう':'まちの こまりごとを てつだおう';$('locationBadge').textContent=state.position.x>2030?'にじいろの おしろ':state.position.x>1320?'こもれびの もり':'にじいろの まち';}
function renderInventory(){
 const bag=S.inventory(state);$('inventory').innerHTML=bag.length?bag.map(id=>{const[art,name]=S.items[id];return `<button class="item ${selected===id?'selected':''}" data-item="${id}" aria-pressed="${selected===id}">${A.icon(art)}<span>${name}</span></button>`;}).join(''):'<span class="empty-bag">もらった ものを、ここに いれよう。</span>';
 $('lights').innerHTML=['goldStar','blueStar','pinkStar'].map((id,i)=>`<span class="light ${bag.includes(id)?'got':''}" aria-label="${S.items[id][1]}${bag.includes(id)?'、みつけた':'、まだ'}">${A.icon(i===2?'heart':'star')}</span>`).join('');$('decorateButton').hidden=!state.flags.includes('finale');
}
function renderWorld(){
 $('ground').innerHTML=A.ground(state);$('scenery').innerHTML=A.scenery();
 $('objects').innerHTML=S.nodes.map(n=>{const done=state.flags.includes(n.id),available=S.available(state,n.id);return `<button class="world-node ${n.kind} ${done?'done':''} ${n.id==='finale'&&!done?'dark-cloud':''}" data-node="${n.id}" style="left:${n.x}px;top:${n.y}px" aria-label="${n.name}"><span class="node-art">${A.node(n,state)}</span><span class="node-label">${n.id==='bridge'&&done?'みんなで かけた はし':n.id==='finale'&&done?'おまつりの ひろば':n.name}</span>${!done&&available?'<span class="quest-bubble">！</span>':''}${done?'<span class="done-dot">✓</span>':''}</button>`;}).join('');
 $('placedDecorations').innerHTML=(state.night?A.festival():'')+state.decorations.map(d=>`<span style="left:${d.x}px;top:${d.y}px">${A.icon(d.art)}</span>`).join('');
 $('world').classList.toggle('night',state.night);$('viewport').classList.toggle('night',state.night);renderPlayer();renderInventory();updateGoal();
 if(api.activities?.renderActors)api.activities.renderActors();
}
function finish(id){const ok=S.finish(state,id);if(ok){save();renderWorld();const reward=S.items[S.steps.find(q=>q[0]===id)[3]];toast(`${reward[1]}を てにいれた！`,reward[0]);tone(4);}return ok;}
function start(){active=true;$('titleScreen').hidden=true;$('adventure').hidden=false;scale=innerWidth<650?.58:.73;renderWorld();focusOn(state.position.x,state.position.y);message(state.flags.length?'ぼうけんの つづきを はじめよう。'+nextGoal()[2]:'リッキーが ないているよ。なにが あったのかな？');$('resumeNote').textContent='';save();}
function goHome(){if(!active)return;active=false;destination=null;save();$('adventure').hidden=true;$('titleScreen').hidden=false;$('resumeNote').textContent=`${state.flags.length}この おてつだいを きろくしているよ。`;$('startButton').textContent='ぼうけんの つづきへ →';}
function walk(x,y,callback){
 if(x>1320&&!state.flags.includes('bridge')){message('かわを わたるには、いたで はしを なおそう。うさぎの おてつだいで ざいりょうが もらえるよ。');return;}
 if(x>2030&&!state.flags.includes('treasure')){message('おしろへの みちは たからの ひかりで ひらくよ。もりの たからを さがそう。');return;}
 x=Math.max(70,Math.min(2390,x));y=Math.max(230,Math.min(1080,y));destination={x,y,callback};
 if(reduced()){state.position={x,y};destination=null;renderPlayer();focusOn(x,y);callback?.();save();}
}
function interact(id){
 const n=S.nodes.find(n=>n.id===id);if(!n)return;
 if(!S.available(state,id)){const missing=S.prerequisites[id].filter(k=>!state.flags.includes(k));message(`${n.name}で つかう ものが まだ たりないね。${S.steps.find(q=>q[0]===missing[0])[2]}`);return;}
 if(id==='scan'){if(selected!=='scanner'){message('しんりょうじょで もらった スキャナーを、もちものから えらんでみよう。');return;}}
 api.activities.open(id);
}
function worldClick(e){if(!active||moved)return;const p=point(e),node=e.target.closest('[data-node]'),actor=e.target.closest('[data-actor]');
 if(decorArt){if(state.decorations.length>=60){message('いっぱい かざったね！');return;}state.decorations.push({art:decorArt,x:Math.max(80,Math.min(2390,p.x)),y:Math.max(230,Math.min(1090,p.y))});save();renderWorld();tone(2);return;}
 if(selected==='scanner'&&api.activities.scanning()){api.activities.scanClick(p,actor?.dataset.actor);return;}
 if(node){const n=S.nodes.find(n=>n.id===node.dataset.node);walk(n.x,n.y+70,()=>interact(n.id));}else walk(p.x,p.y);
}
function renderJournal(){
 $('journalMap').innerHTML=`<div class="journal-world"><span>${A.building('atelier',true)}<b>まち</b></span><i>${A.icon(state.flags.includes('bridge')?'bridge':'plank')}</i><span>${A.icon('tent')}<b>もり</b></span><i>${A.icon(state.flags.includes('treasure')?'star':'hole')}</i><span>${A.building('castle',true)}<b>おしろ</b></span></div>`;
 $('journalTasks').innerHTML=S.steps.map(([id,title,desc,item])=>`<button data-task="${id}" class="journal-task ${state.flags.includes(id)?'done':''}"><span>${A.icon(S.items[item][0])}</span><div><b>${title}</b><p>${state.flags.includes(id)?S.items[item][1]+'を てにいれた！':desc}</p></div><i>${state.flags.includes(id)?'✓':S.available(state,id)?'→':'○'}</i></button>`).join('');$('journal').showModal();
}
function animate(now){const dt=Math.min(.04,(now-last)/1000||0);last=now;
 if(active&&!document.hidden){if(destination&&!$('activity').open&&!$('journal').open){const p=state.position,d=destination,dx=d.x-p.x,dy=d.y-p.y,len=Math.hypot(dx,dy),speed=310*dt;$('player').classList.add('walking');if(len<=speed){p.x=d.x;p.y=d.y;destination=null;$('player').classList.remove('walking');renderPlayer();save();d.callback?.();}else{p.x+=dx/len*speed;p.y+=dy/len*speed;renderPlayer();}focusOn(p.x,p.y);updateGoal();}api.activities?.tick?.(now,dt);}
 requestAnimationFrame(animate);
}
$('viewport').addEventListener('pointerdown',e=>{if(e.target.closest('.view-tools,.scanner-controls'))return;drag={x:e.clientX,y:e.clientY,px:pan.x,py:pan.y};moved=false;});
$('viewport').addEventListener('pointermove',e=>{const p=point(e);api.activities?.scanMove?.(p);if(!drag)return;const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(dx,dy)>9){moved=true;destination=null;pan.x=drag.px+dx;pan.y=drag.py+dy;clampPan();transform();}});
addEventListener('pointerup',()=>{drag=null;});$('viewport').addEventListener('pointercancel',()=>{drag=null;moved=true;});$('viewport').onclick=worldClick;
$('viewport').onkeydown=e=>{if(e.target!==$('viewport'))return;const d={ArrowLeft:[-110,0],ArrowRight:[110,0],ArrowUp:[0,-110],ArrowDown:[0,110]}[e.key];if(d){e.preventDefault();walk(state.position.x+d[0],state.position.y+d[1]);}};
$('objects').addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.closest('[data-node]')){e.preventDefault();const n=S.nodes.find(n=>n.id===e.target.closest('[data-node]').dataset.node);walk(n.x,n.y+70,()=>interact(n.id));}});
$('inventory').onclick=e=>{const b=e.target.closest('[data-item]');if(!b)return;selected=selected===b.dataset.item?'':b.dataset.item;decorArt=null;renderInventory();api.activities?.equip?.(selected);if(selected)message(`${S.items[selected][1]}を もったよ。${selected==='scanner'?'ふしぎな おきゃくさんに かざしてみよう。':selected==='camera'?'はなやさんで しゃしんを つかってみよう。':selected==='shovel'?'ちずの めじるしの あいだを ほろう。':'どこで つかえるかな？'}`);};
$('startButton').onclick=start;$('homeButton').onclick=goHome;$('journalButton').onclick=()=>{if(active)renderJournal();else $('about').showModal();};$('closeJournal').onclick=()=>$('journal').close();
$('journalTasks').onclick=e=>{const b=e.target.closest('[data-task]');if(!b)return;const n=S.nodes.find(n=>n.id===b.dataset.task);$('journal').close();focusOn(n.x,n.y);message(S.steps.find(q=>q[0]===n.id)[2]);};
$('hintButton').onclick=()=>{const q=nextGoal();const n=S.nodes.find(n=>n.id===q[0]);focusOn(n.x,n.y);message(q[2]);};$('followButton').onclick=e=>{e.stopPropagation();focusOn(state.position.x,state.position.y);};$('zoomButton').onclick=e=>{e.stopPropagation();scale=scale<.6?.78:.45;focusOn(state.position.x,state.position.y);};
$('listenButton').onclick=()=>{if(!voice)$('soundButton').click();say($('message').textContent);};$('soundButton').onclick=()=>{voice=!voice;$('soundButton').setAttribute('aria-pressed',String(voice));$('soundButton').setAttribute('aria-label',voice?'こえを けす':'こえを つける');try{localStorage.setItem(KEY+'.voice',String(voice));}catch{}if(voice)say(active?$('message').textContent:'にじいろまちへ ようこそ。いっしょに ぼうけんしよう。');else try{speechSynthesis.cancel();}catch{}};
$('aboutButton').onclick=()=>$('about').showModal();$('closeAbout').onclick=()=>$('about').close();$('restartButton').onclick=()=>$('restartConfirm').hidden=false;$('confirmRestart').onclick=()=>{state=S.fresh();selected='';decorArt=null;destination=null;api.activities?.equip?.('');save();$('about').close();$('restartConfirm').hidden=true;$('adventure').hidden=true;$('titleScreen').hidden=false;active=false;$('startButton').textContent='まちへ でかけよう →';$('resumeNote').textContent='';};
$('decorateButton').onclick=()=>{decorArt=decorArt==='flower'?'lantern':decorArt==='lantern'?'balloon':decorArt==='balloon'?'star':decorArt==='star'?null:'flower';message(decorArt?'まちの じめんを タッチして、かざりを おこう。もういちど ボタンで かざりを かえられるよ。':'かざりを しまったよ。');$('decorateButton').textContent=decorArt?'✦ '+({flower:'おはな',lantern:'ランタン',balloon:'ふうせん',star:'おほしさま'}[decorArt])+'を おく':'✦ まちを かざる';};
addEventListener('resize',()=>{if(active)focusOn(state.position.x,state.position.y);});addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden){save();destination=null;api.activities?.pause?.();try{speechSynthesis.cancel();}catch{}}});
Object.assign(api,{save,say,tone,message,toast,finish,renderWorld,renderInventory,focusOn,walk,interact,point});
document.querySelectorAll('[data-art]').forEach(el=>el.innerHTML=A.icon(el.dataset.art));$('titleArt').innerHTML=A.banner();$('soundButton').setAttribute('aria-pressed',String(voice));if(state.flags.length){$('startButton').textContent='ぼうけんの つづきへ →';$('resumeNote').textContent=`${state.flags.length}この おてつだいを きろくしているよ。`;}
requestAnimationFrame(animate);
})();

/* Close-ups are scenes in the same story. No iframe, old game launch or station picker. */
(() => {
'use strict';
const T=Town,$=T.$,A=T.art,S=T.story;
let act=null,scope={x:680,y:570},mode='scan',marked=new Set(),scanner=false,lastTick=0;
const people=[{id:0,x:690,y:580,alien:true},{id:1,x:465,y:530,alien:false},{id:2,x:810,y:490,alien:true}];
function button(id,text,fn,primary=false){const b=document.createElement('button');b.id=id;b.className=primary?'primary-button':'paper-button';b.textContent=text;b.onclick=fn;return b;}
function action(id,text,fn,primary=false){$('activityActions').append(button(id,text,fn,primary));}
function status(text){$('activityStatus').textContent=text;T.say(text);}
function later(fn,ms){const ref=act;const timer=setTimeout(()=>{if(act===ref&&$('activity').open)fn();},ms);act.timers.push(timer);return timer;}
function close(){$('activity').close();}
function done(text){if(act.complete)return;act.complete=true;T.finish(act.id);status(text);$('activityActions').replaceChildren();action('returnToTown','まちで つかってみよう →',close,true);}
function open(id){
 if(id==='scan'){equip('scanner');return;}
 act={id,timers:[],cleanup:[],complete:false,clock:performance.now()};const node=S.nodes.find(n=>n.id===id);
 $('activityPlace').textContent=node.name;$('activityTitle').textContent=S.steps.find(q=>q[0]===id)[1];$('activityIntro').textContent='';$('activityBody').replaceChildren();$('activityActions').replaceChildren();$('activityStatus').textContent='';$('activity').showModal();
 ({ricky,dress,doctor,quiz,picnic,bridge,search,photo,sneak,vault,treasure,detective,finale})[id]();T.say($('activityIntro').textContent);
}
function init(){ $('closeActivity').onclick=close;$('activity').addEventListener('close',()=>{if(!act)return;act.timers.forEach(clearTimeout);act.cleanup.forEach(f=>f());act=null;T.renderWorld();T.message(T.state.flags.includes('finale')?'みんなの ひかりが もどった！ まちを すきに かざって あそぼう。':'もらった ものは、まちの べつの ばしょで つかえるよ。',false);}); }
// ── A spring mesh face, a draggable milk bottle, and the ribbon carried into dress-up. ──
function ricky(){
 $('activityIntro').textContent='リッキーを びよーんと あやして、ミルクを おくちへ。ごきげんに なったら、もっている リボンを かしてくれるって。';
 $('activityBody').innerHTML=`<div class="ricky-scene"><canvas id="rickyFace" width="540" height="540" aria-label="リッキーの おかお。ひっぱって あそぶ" tabindex="0"></canvas><button id="milkTool" class="drag-tool" aria-label="ミルクを おくちに はこぶ">${A.icon('milk')}<span>ミルク</span></button><button id="rickyMouth" class="mouth-target" aria-label="リッキーの おくち"></button><div id="babyMood" class="baby-mood">ぷにぷに してみよう</div></div><div class="activity-tip">おかおを 2かい のばそう。ミルクは ドラッグでも、えらんで おくちを タッチでも。</div>`;
 const canvas=$('rickyFace'),ctx=canvas.getContext('2d'),N=12,nodes=[],side=540,src=new Image();let grab=null,stretches=0,fed=false,milk=false,draggingMilk=false,live=true,loaded=false;
 for(let y=0;y<=N;y++)for(let x=0;x<=N;x++)nodes.push({x:x/N*side,y:y/N*side,dx:0,dy:0,vx:0,vy:0});
 src.onload=()=>{loaded=true;};src.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(A.icon('ricky'));
 function tri(a,b,c){const p=[a,b,c],q=p.map(n=>({x:n.x+n.dx,y:n.y+n.dy}));ctx.save();ctx.beginPath();const cx=(q[0].x+q[1].x+q[2].x)/3,cy=(q[0].y+q[1].y+q[2].y)/3;const edge=q.map(p=>({x:cx+(p.x-cx)*1.09,y:cy+(p.y-cy)*1.09}));ctx.moveTo(edge[0].x,edge[0].y);ctx.lineTo(edge[1].x,edge[1].y);ctx.lineTo(edge[2].x,edge[2].y);ctx.closePath();ctx.clip();const x0=p[0].x,y0=p[0].y,x1=p[1].x,y1=p[1].y,x2=p[2].x,y2=p[2].y,d=x0*(y1-y2)+x1*(y2-y0)+x2*(y0-y1);const m=v=>[(v[0]*(y1-y2)+v[1]*(y2-y0)+v[2]*(y0-y1))/d,(v[0]*(x2-x1)+v[1]*(x0-x2)+v[2]*(x1-x0))/d,(v[0]*(x1*y2-x2*y1)+v[1]*(x2*y0-x0*y2)+v[2]*(x0*y1-x1*y0))/d];const mx=m(q.map(p=>p.x)),my=m(q.map(p=>p.y));ctx.setTransform(mx[0],my[0],mx[1],my[1],mx[2],my[2]);ctx.drawImage(src,0,0,side,side);ctx.restore();}
 function render(){if(!live)return;ctx.clearRect(0,0,side,side);for(const n of nodes){let tx=0,ty=0;if(grab){const w=Math.exp(-(Math.hypot(n.x-grab.ox,n.y-grab.oy)**2)/60000);tx=(grab.x-grab.ox)*w;ty=(grab.y-grab.oy)*w;}n.vx=(n.vx+(tx-n.dx)*.14)*.73;n.vy=(n.vy+(ty-n.dy)*.14)*.73;n.dx+=n.vx;n.dy+=n.vy;}
 if(loaded&&!grab&&nodes.every(n=>Math.abs(n.dx)+Math.abs(n.dy)<.4))ctx.drawImage(src,0,0,side,side);
 else if(loaded)for(let y=0;y<N;y++)for(let x=0;x<N;x++){const i=y*(N+1)+x;tri(nodes[i],nodes[i+1],nodes[i+N+1]);tri(nodes[i+1],nodes[i+N+2],nodes[i+N+1]);}requestAnimationFrame(render);}
 const pt=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.x)/r.width*side,y:(e.clientY-r.y)/r.height*side};};
 canvas.onpointerdown=e=>{const p=pt(e);grab={ox:p.x,oy:p.y,x:p.x,y:p.y};canvas.setPointerCapture(e.pointerId);};
 canvas.onpointermove=e=>{if(grab){const p=pt(e);grab.x=p.x;grab.y=p.y;}};
 const release=()=>{if(grab&&Math.hypot(grab.x-grab.ox,grab.y-grab.oy)>65){stretches++;T.tone(2);$('babyMood').textContent='きゃっきゃ！ '+Math.min(stretches,2)+' / 2';}grab=null;check();};canvas.onpointerup=release;canvas.onpointercancel=()=>grab=null;
 canvas.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();grab={ox:200,oy:220,x:330,y:240};later(release,230);}};
 function check(){if(stretches>=2&&fed)done('にこにこ！ リッキーが リボンを かしてくれたよ。これで したてやさんへ いけるね。');}
 function feed(){if(!milk)return;fed=true;milk=false;T.tone(3);$('babyMood').textContent='ごくごく。げんきに なった！';$('milkTool').classList.add('used');check();}
 $('milkTool').onclick=()=>{milk=true;status('おくちに ミルクを とどけよう。');};$('rickyMouth').onclick=()=>{if(milk)feed();else status('ミルクを えらんで、おくちを タッチしてね。');};
 $('milkTool').onpointerdown=e=>{draggingMilk=true;milk=true;$('milkTool').setPointerCapture(e.pointerId);};$('milkTool').onpointermove=e=>{if(draggingMilk)$('milkTool').style.transform=`translate(${e.offsetX-30}px,${e.offsetY-30}px)`;};$('milkTool').onpointerup=e=>{if(draggingMilk){const r=$('rickyMouth').getBoundingClientRect();if(e.clientX>r.left-35&&e.clientX<r.right+35&&e.clientY>r.top-35&&e.clientY<r.bottom+35)feed();draggingMilk=false;$('milkTool').style.transform='';}};
 act.cleanup.push(()=>{live=false;});requestAnimationFrame(render);
}
// ── Exact Princess Room character layering, shared permanently with the walking avatar. ──
function dress(){
 $('activityIntro').textContent='リッキーの リボンを つけて、おてつだいの ふくを つくろう。かみがた・いろ・ドレスを えらんでね。';
 let chosen=new Set();
 $('activityBody').innerHTML='<div class="dress-scene"><div id="dressPreview"></div><div id="dressChoices"></div></div>';
 function render(){
 $('dressPreview').innerHTML=A.character(T.state.outfit);
 $('dressChoices').innerHTML=[['hair','かみがた',[['twin','ツイン'],['pony','ポニー'],['bob','ボブ']]],['color','すきな いろ',[['pink','ピンク'],['blue','あお'],['mint','みどり'],['yellow','きいろ'],['lav','むらさき']]],['dress','ドレス',[['princess','ふんわり'],['starry','ほしぞら'],['magicdress','まほう']]]].map(([key,title,options])=>`<div class="dress-group"><h3>${title}</h3><div>${options.map(([v,name])=>`<button data-choice="${key}:${v}" aria-pressed="${T.state.outfit[key]===v}" class="choice-chip">${name}</button>`).join('')}</div></div>`).join('');
 $('dressChoices').querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>{const[k,v]=b.dataset.choice.split(':');T.state.outfit[k]=v;chosen.add(k);T.tone(chosen.size);render();$('transformButton').disabled=chosen.size<2;});
 }
 render();action('transformButton','✦ へんしんして おてつだいへ！',()=>{T.save();$('dressPreview').classList.add('transforming');later(()=>done('リボンが きらり！ えらんだ ふくで、しんりょうじょを てつだおう。'),650);},true);$('transformButton').disabled=true;
}
// ── Diagnosis chooses actual tools, then cleaning and dressing a wound by drag/scrub. ──
function doctor(){
 $('activityIntro').textContent='くまさんが ころんじゃった。からだの おとを きいて、きずを きれいに して、おてあてしよう。';
 let phase=0,selected='steth',clean=new Set(),diagnosed=false;
 $('activityBody').innerHTML=`<div class="clinic-scene"><div class="patient">${A.icon('bear')}</div><button id="wound" class="wound" aria-label="くまさんの きずを おてあて"><span>✦</span></button><div id="clinicWords" class="clinic-words">まずは からだの おとを きこう</div></div><div class="tool-tray">${[['steth','ちょうしんき'],['spray','しょうどく'],['bandage','ばんそうこう']].map(([id,name])=>`<button class="tool" data-tool="${id}" aria-pressed="${id===selected}">${A.icon(id)}<span>${name}</span></button>`).join('')}</div>`;
 function pick(id){selected=id;document.querySelectorAll('[data-tool]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.tool===id)));}
 function use(e){
 if(phase===0){if(selected!=='steth'){status('まず ちょうしんきで、からだの おとを きいてみよう。');return;}T.tone(0);later(()=>T.tone(0),160);phase=1;$('clinicWords').textContent='ドクンドクン。げんきな おと！ きずを きれいに しよう。';status('つぎは しょうどく。きずの まわりを なぞってね。');return;}
 if(phase===1){if(selected!=='spray'){status('ばいきんを しょうどくしてから、ばんそうこうを はろう。');return;}const r=$('wound').getBoundingClientRect(),x=e?Math.floor((e.clientX-r.x)/r.width*3):clean.size,y=e?Math.floor((e.clientY-r.y)/r.height*3):0;clean.add(Math.max(0,Math.min(8,y*3+x)));$('wound').style.opacity=String(1-clean.size*.11);$('clinicWords').textContent=`きずを きれいに ${Math.min(clean.size,5)} / 5`;
 if(clean.size>=5){phase=2;$('wound').style.opacity='1';$('wound').classList.add('clean');status('きれいに なった！ ばんそうこうを はろう。');}return;}
 if(selected!=='bandage'){status('ばんそうこうを えらんで、きずに はってね。');return;}$('wound').innerHTML=A.icon('bandage');$('clinicWords').textContent='くまさんが にっこり！';done('ありがとう！ おいしゃさんが スキャナーを かしてくれたよ。まちの ふしぎを しらべよう。');
 }
 document.querySelectorAll('[data-tool]').forEach(b=>{b.onclick=()=>pick(b.dataset.tool);b.onpointerdown=e=>{pick(b.dataset.tool);b.setPointerCapture(e.pointerId);};b.onpointerup=e=>{const r=$('wound').getBoundingClientRect();if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom)use(e);};});
 $('wound').onclick=e=>use(e.detail===0?null:e);$('wound').onpointermove=e=>{if(e.buttons&&phase===1)use(e);};
}
// ── Three animal questions provide the food which is then physically used at the picnic. ──
function quiz(){
 $('activityIntro').textContent='うさぎさんの ごはんを さがしているんだ。どうぶつの ひみつを 3つ といてみよう。';
 const questions=[{q:'うさぎさんが すきな ごはんは？',art:'rabbit',choices:[['carrot','にんじん'],['rock','いし'],['key','かぎ']],answer:'carrot'}, {q:'そらを とべる おともだちは？',art:'cloud',choices:[['turtle','かめ'],['bird','ことり'],['fish','さかな']],answer:'bird'}, {q:'うみで くらす おともだちは？',art:'shell',choices:[['fox','きつね'],['owl','ふくろう'],['fish','さかな']],answer:'fish'}];let index=0,locked=false;
 function render(){const q=questions[index];$('activityBody').innerHTML=`<div class="quiz-prompt">${A.icon(q.art)}<b>${q.q}</b></div><div class="quiz-options">${q.choices.map(([id,name])=>`<button data-answer="${id}">${A.icon(id)}<span>${name}</span></button>`).join('')}</div><div class="step-dots">${questions.map((_,i)=>`<i class="${i<index?'done':''}">${i<index?'✓':'●'}</i>`).join('')}</div>`;T.say(q.q);
 document.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{if(locked)return;if(b.dataset.answer!==q.answer){b.disabled=true;b.classList.add('wrong');status('おしい！ もういちど えらんでみよう。');return;}locked=true;b.classList.add('right');T.tone(3);index++;status('せいかい！');later(()=>{if(index===3)done('にんじんを もらった！ うさぎさんの ピクニックに もっていこう。');else{locked=false;render();}},600);});}
 render();
}
// ── Role-play: arrange the same items in space; food/plate/friend placement forms a reaction. ──
function picnic(){
 $('activityIntro').textContent='うさぎさんが おなか ぺこぺこ。おさらと にんじんを ならべて、ともだちを すわらせよう。';
 const placed=new Set();let selected=null;
 $('activityBody').innerHTML=`<div class="picnic-scene"><div class="picnic-table"></div><button data-drop="plate" class="picnic-drop plate-drop" aria-label="おさらを おく ところ">おさら</button><button data-drop="carrot" class="picnic-drop food-drop" aria-label="にんじんを おく ところ">ごはん</button><button data-drop="rabbit" class="picnic-drop friend-drop" aria-label="うさぎが すわる ところ">おともだち</button><div id="picnicReaction" class="picnic-reaction"></div></div><div class="tool-tray">${[['plate','おさら'],['carrot','にんじん'],['rabbit','うさぎ']].map(([id,name])=>`<button data-picnic="${id}" class="tool">${A.icon(id)}<span>${name}</span></button>`).join('')}</div>`;
 function put(target){if(!selected)return;if(selected!==target){status('それは べつの ばしょが よさそう。えを みてみよう。');return;}const el=document.querySelector(`[data-drop="${target}"]`);el.innerHTML=A.icon(target);placed.add(target);T.tone(placed.size);if(placed.size===3){$('picnicReaction').innerHTML='<b>いただきまーす！</b> ♡ ♡';done('うさぎさんが おれいに はしの いたを くれたよ。かわへ はしを かけよう！');}}
 document.querySelectorAll('[data-picnic]').forEach(b=>{b.onclick=()=>{selected=b.dataset.picnic;};b.onpointerdown=e=>{selected=b.dataset.picnic;b.setPointerCapture(e.pointerId);};b.onpointerup=e=>{const target=[...document.querySelectorAll('[data-drop]')].find(el=>{const r=el.getBoundingClientRect();return e.clientX>=r.x&&e.clientX<=r.right&&e.clientY>=r.y&&e.clientY<=r.bottom;});if(target)put(target.dataset.drop);};});
 document.querySelectorAll('[data-drop]').forEach(b=>b.onclick=()=>put(b.dataset.drop));
}
// ── Construction snaps pieces into structural sockets; the resulting bridge exists in the map. ──
function bridge(){
 $('activityIntro').textContent='おなじ ながさの いたを あなに はめて、てすりと はたを のせよう。つくった はしを、じぶんで わたれるよ。';
 const slots=[{id:'short',label:'みじかい いた',w:42},{id:'long',label:'ながい いた',w:82},{id:'rail',label:'てすり',w:95},{id:'flag',label:'はた',w:28}];let selected=null,placed=new Set();
 $('activityBody').innerHTML=`<div class="build-scene"><div class="build-water"></div>${slots.map((p,i)=>`<button data-build-slot="${p.id}" class="build-slot build-${p.id}" style="--w:${p.w}%" aria-label="${p.label}の ばしょ">${p.label}</button>`).join('')}</div><div class="build-palette">${slots.map(p=>`<button data-part="${p.id}"><span class="part-${p.id}" style="--w:${p.w}%">${p.id==='flag'?'⚑':p.id==='rail'?'╤╤╤':'━'}</span><small>${p.label}</small></button>`).join('')}</div>`;
 function put(id){if(!selected){status('したから パーツを えらんでね。');return;}if(selected!==id){status('かたちが すこし ちがうね。べつの ばしょは どうかな？');return;}placed.add(id);const el=document.querySelector(`[data-build-slot="${id}"]`);el.classList.add('snapped');el.textContent=id==='flag'?'⚑':id==='rail'?'╤╤╤':'✓';T.tone(placed.size);if(placed.size===4)done('はしが かかった！ スコップも みつけたよ。もりの たからを ほれるね。');}
 document.querySelectorAll('[data-part]').forEach(b=>{b.onclick=()=>{selected=b.dataset.part;document.querySelectorAll('[data-part]').forEach(el=>el.classList.toggle('selected',el===b));};b.onpointerdown=e=>{selected=b.dataset.part;b.setPointerCapture(e.pointerId);};b.onpointerup=e=>{const el=[...document.querySelectorAll('[data-build-slot]')].find(el=>{const r=el.getBoundingClientRect();return e.clientX>=r.x&&e.clientX<=r.right&&e.clientY>=r.y&&e.clientY<=r.bottom;});if(el)put(el.dataset.buildSlot);};});document.querySelectorAll('[data-build-slot]').forEach(b=>b.onclick=()=>put(b.dataset.buildSlot));
}
// ── Dense visual search, pan/zoom, close decoys and a distinctive heart bag. ──
function search(){
 $('activityIntro').textContent='みつあみ、ピンクの ふく、ハートの ポシェットの おともだちが まいごだよ。えを うごかして さがそう。';
 const target=17+Math.floor(Math.random()*20);let zoom=1;
 $('activityBody').innerHTML=`<div class="search-reference">${A.character({hair:'twin',color:'pink'})}<span>みつあみ ＋ ピンク ＋ ♡の バッグ</span></div><div id="crowdViewport" class="crowd-viewport"><div id="crowdWorld" class="crowd-world">${Array.from({length:64},(_,i)=>{const good=i===target,col=good?'pink':['pink','lav','mint','blue','yellow'][i%5],hair=good?'twin':['twin','pony','bob'][Math.floor(i/5)%3];return `<button class="crowd-person" data-person="${i}" aria-label="${good?'ハートの ポシェットの おともだち':'まちの ひと'}" style="left:${35+(i%10)*99+(i%2)*13}px;top:${40+Math.floor(i/10)*100}px">${A.character({hair,color:col,dress:i%2?'starry':'princess'})}<span class="pochette">${good?'♥':'★'}</span></button>`;}).join('')}<span class="crowd-tree">${A.icon('tree')}</span></div></div>`;
 document.querySelectorAll('[data-person]').forEach(b=>b.onclick=()=>{if(act.complete)return;if(Number(b.dataset.person)!==target){b.classList.add('hop');status('こんにちは！ ハートの ポシェットの こは あっちかな？');T.tone(1);return;}b.classList.add('found-friend');done('みつけた！ おともだちが カメラと、ちずの はんぶんを くれたよ。はなやさんで つかってみよう。');});
 action('zoomCrowd','＋ おおきく',()=>{zoom=zoom===1?1.3:1;$('crowdWorld').style.zoom=zoom;});
 action('searchHint','？ めじるしの ヒント',()=>{const el=document.querySelector(`[data-person="${target}"]`);$('crowdViewport').scrollTo({left:Math.max(0,el.offsetLeft-150),top:Math.max(0,el.offsetTop-130),behavior:'smooth'});status('この あたりに いたかも。バッグの かたちを よく みてね。');});
}
// ── Camera capture -> give picture -> watering -> bloom -> butterfly -> rope. ──
function photo(){
 $('activityIntro').textContent='おはなが しおれちゃった。カメラで ジョウロを とって、はなやさんに その しゃしんを とどけてみよう。';
 let captured=false,selected=false;
 $('activityBody').innerHTML=`<div class="photo-scene"><button id="photoCan" class="photo-can" aria-label="ジョウロを しゃしんに とる">${A.icon('wateringcan')}</button><button id="photoGardener" class="photo-gardener" aria-label="はなやさんに しゃしんを わたす">${A.icon('bear')}<span>おみずが あれば…</span></button><div id="photoFlower" class="photo-flower">${A.icon('flower')}</div><div id="photoButterfly" class="photo-butterfly" hidden>${A.icon('butterfly')}</div><div id="waterDrops" class="water-drops" hidden>⋰ ⋰ ⋰</div></div><div class="photo-tray"><span class="camera-in-hand">${A.icon('camera')}</span><button id="photoCard" class="photo-card" disabled aria-label="とった しゃしんを えらぶ">しゃしんは まだ ないよ</button></div>`;
 $('photoCan').onclick=()=>{if(captured)return;captured=true;T.tone(3);$('photoCan').classList.add('flash');$('photoCard').disabled=false;$('photoCard').innerHTML=A.icon('wateringcan')+'<small>ジョウロの しゃしん</small>';status('とれた！ しゃしんを えらんで、はなやさんに わたそう。');};
 $('photoCard').onclick=()=>{selected=true;$('photoCard').classList.add('selected');};
 $('photoCard').onpointerdown=e=>{selected=true;$('photoCard').setPointerCapture(e.pointerId);};$('photoCard').onpointerup=e=>{const r=$('photoGardener').getBoundingClientRect();if(e.clientX>=r.x&&e.clientX<=r.right&&e.clientY>=r.y&&e.clientY<=r.bottom)sendPhoto();};
 function sendPhoto(){if(!selected){status('ジョウロの しゃしんを えらんでね。');return;}if(act.busy)return;act.busy=true;$('photoGardener').classList.add('watering');$('waterDrops').hidden=false;status('ジョウロを みて、はなやさんが おみずを あげはじめた！');
 later(()=>{$('photoFlower').classList.add('blooming');$('photoButterfly').hidden=false;status('おはなが さいたら、ちょうちょが とんできた！');},950);
 later(()=>done('ちょうちょを おって、ロープを みつけた！ はしの むこうの もりで つかおう。'),2300);
 }
 $('photoGardener').onclick=sendPhoto;
}
// ── Movement, a sweeping field of view, cover and noisy running; catches keep collected items. ──
function sneak(){
 $('activityIntro').textContent='もりの おとしものを 2つ ひろおう。きいろい ひかりは みはりの め。しげみに はいると かくれられるよ。';
 const world={x:55,y:240,target:null,found:[],alert:0,hidden:false,angle:0,start:performance.now(),sneak:true,won:false};act.stealth=world;
 $('activityBody').innerHTML=`<div id="stealthField" class="stealth-field" tabindex="0" aria-label="もり。じめんを タッチで あるく"><svg class="vision" viewBox="0 0 560 340"><path id="visionCone" fill="#f7d47770" stroke="#dcc474" stroke-width="1"/></svg><span class="cover-bush a">${A.icon('bush')}</span><span class="cover-bush b">${A.icon('bush')}</span><span class="forest-guard">${A.icon('guard')}</span><span id="forestPlayer" class="forest-player">${A.character(T.state.outfit)}</span><button data-berry="0" class="forest-item one" aria-label="ひだりの おとしもの">${A.icon('berry')}</button><button data-berry="1" class="forest-item two" aria-label="みぎの おとしもの">${A.icon('berry')}</button><div class="alert-tray"><span id="stealthState">そっと あるこう</span><i><b id="alertFill"></b></i><span id="berriesCount">0 / 2</span></div></div>`;
 const field=$('stealthField');
 function target(x,y){world.target={x:Math.max(28,Math.min(535,x)),y:Math.max(75,Math.min(312,y))};}
 field.onclick=e=>{const r=field.getBoundingClientRect();target((e.clientX-r.x)/r.width*560,(e.clientY-r.y)/r.height*340);};
 field.onkeydown=e=>{const delta={ArrowLeft:[-38,0],ArrowRight:[38,0],ArrowUp:[0,-38],ArrowDown:[0,38]}[e.key];if(delta){e.preventDefault();target(world.x+delta[0],world.y+delta[1]);}};
 document.querySelectorAll('[data-berry]').forEach(b=>b.onclick=e=>{e.stopPropagation();const id=Number(b.dataset.berry),p=id===0?{x:180,y:145}:{x:465,y:130};target(p.x,p.y);});
 action('sneakToggle','そっと あるく ✓',()=>{world.sneak=!world.sneak;$('sneakToggle').textContent=world.sneak?'そっと あるく ✓':'はしる！ あしおとに ちゅうい';});
 action('forestHint','？ かくれる ヒント',()=>status('ひだりの しげみ→うえの おとしもの→まんなかの しげみ→みぎの おとしもの。ひかりが よそを むくまで まってね。'));
 act.update=(now,dt)=>{
 if(world.won)return;
 const elapsed=(now-world.start)/1000;
 world.angle=Math.PI*.5+Math.sin(elapsed*.85)*1.3;
 const gx=310,gy=105,radius=225,half=.40;
 const a1=world.angle-half,a2=world.angle+half;
 $('visionCone').setAttribute('d',`M${gx} ${gy}L${gx+Math.cos(a1)*radius} ${gy+Math.sin(a1)*radius}A${radius} ${radius} 0 0 1 ${gx+Math.cos(a2)*radius} ${gy+Math.sin(a2)*radius}Z`);
 const moving=!!world.target;
 if(world.target){const dx=world.target.x-world.x,dy=world.target.y-world.y,len=Math.hypot(dx,dy),speed=(world.sneak?82:165)*dt;if(len<speed){world.x=world.target.x;world.y=world.target.y;world.target=null;}else{world.x+=dx/len*speed;world.y+=dy/len*speed;}}
 world.hidden=[{x:125,y:225},{x:360,y:225}].some(p=>Math.hypot(p.x-world.x,p.y-world.y)<47);
 let diff=Math.atan2(world.y-gy,world.x-gx)-world.angle;while(diff>Math.PI)diff-=Math.PI*2;while(diff<-Math.PI)diff+=Math.PI*2;
 const seen=!world.hidden&&Math.abs(diff)<half&&Math.hypot(world.x-gx,world.y-gy)<radius;
 const noisy=moving&&!world.sneak&&!world.hidden&&Math.hypot(world.x-gx,world.y-gy)<155;
 world.alert=Math.max(0,Math.min(100,world.alert+dt*(seen?35:noisy?22:-32)));
 if(world.alert>=100){world.x=55;world.y=240;world.target=null;world.alert=0;status('みつかっちゃった！ ひろった ものは そのまま。しげみを つかって もういちど。');}
 $('forestPlayer').style.left=world.x/560*100+'%';$('forestPlayer').style.top=world.y/340*100+'%';$('forestPlayer').style.opacity=world.hidden?'.45':'1';$('alertFill').style.width=world.alert+'%';$('stealthState').textContent=world.hidden?'かくれているよ':seen?'あっ、みられてる！':noisy?'あしおとが きこえる！':'そっと あるこう';
 [{x:180,y:145},{x:465,y:130}].forEach((p,i)=>{if(!world.found.includes(i)&&Math.hypot(world.x-p.x,world.y-p.y)<27){world.found.push(i);document.querySelector(`[data-berry="${i}"]`).hidden=true;T.tone(3);$('berriesCount').textContent=world.found.length+' / 2';}});
 if(world.found.length===2){world.won=true;done('きのみが あつまった！ たからばこの みはりに とどけたら、ひとやすみしてくれるかも。');}
 };
}
// ── Actual reach/grab cycle, a patrolling light, bushes and an earned distraction. ──
function vault(){
 $('activityIntro').textContent='きのみを みはりに とどけると、おやつの あいだだけ よそを むくよ。そっと たからばこから 3つ とりだそう。';
 let distracted=false,grabbed=0,progress=0,holding=false,finished=false,angle=0;
 $('activityBody').innerHTML=`<div class="vault-scene"><span id="vaultGuard" class="vault-guard">${A.icon('guard')}<b id="guardLook">みているよ</b></span><div id="vaultLight" class="vault-light"></div><button id="vaultChest" class="vault-chest" aria-label="たからばこに てを のばす">${A.icon('chest')}<span id="grabHand">✋</span></button><button id="berryGift" class="berry-gift" aria-label="みはりに きのみを とどける">${A.icon('berry')}<small>きのみを あげる</small></button></div><div class="grab-meter"><i id="grabFill"></i></div><div class="vault-bag" id="vaultBag">？　？　？</div>`;
 $('berryGift').onclick=()=>{distracted=true;$('berryGift').disabled=true;status('もぐもぐ。みはりが おやつを たべはじめた！ よそを むいたら とりだそう。');};
 function touch(){if(finished)return;if(!distracted){status('まずは もってきた きのみを とどけよう。');return;}holding=true;}
 $('vaultChest').onpointerdown=e=>{touch();$('vaultChest').setPointerCapture(e.pointerId);};$('vaultChest').onpointerup=$('vaultChest').onpointercancel=()=>holding=false;
 $('vaultChest').onkeydown=e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();touch();}};$('vaultChest').onkeyup=()=>holding=false;
 act.update=(now,dt)=>{if(finished)return;angle=(Math.sin(now/1200)+1)/2;const watching=!distracted||angle>.6;$('vaultLight').classList.toggle('looking',watching);$('guardLook').textContent=watching?'みているよ':'おやつに むちゅう';$('vaultGuard').classList.toggle('looking-away',!watching);
 if(holding&&distracted){if(watching){progress=Math.max(0,progress-dt*1.2);status('あっ、みている！ てを はなして まとう。');holding=false;}else{progress+=dt*.85;$('grabHand').style.transform=`translateY(${-progress*55}px)`;}}
 $('grabFill').style.width=Math.min(progress,1)*100+'%';
 if(progress>=1){grabbed++;progress=0;T.tone(3);$('vaultBag').innerHTML=[0,1,2].map((_,i)=>i<grabbed?A.icon(['key','clue','star'][i]):'<span>？</span>').join('');if(grabbed>=3){finished=true;done('ふるい かぎと、ちずの はんぶん！ おともだちの ちずと あわせて たからを さがそう。');}}
 };
}
// ── Two map fragments identify a place; a shovel removes spatially different soil cells. ──
function treasure(){
 $('activityIntro').textContent='おともだちの ちずと、たからばこの ちずが つながった！ きのこと おはなの あいだを スコップで ほろう。';
 let place=null,selectedTool=false,dug=new Set();
 $('activityBody').innerHTML=`<div class="combined-map"><span>${A.icon('mushroom')}</span><b>×</b><span>${A.icon('flower')}</span></div><div id="digChoices" class="dig-choices">${[['rock','tree'],['mushroom','flower'],['shell','star']].map((pair,i)=>`<button data-dig-site="${i}" aria-label="${i===1?'きのこと おはな':'ほかの めじるし'}の あいだ"><span>${A.icon(pair[0])}${A.icon(pair[1])}</span>${A.icon('hole')}</button>`).join('')}</div><button id="useShovel" class="paper-button shovel-pick">${A.icon('shovel')}スコップを もつ</button><div id="digSite" class="dig-site" hidden><div class="buried-star">${A.icon('star')}</div><div class="soil-grid">${Array.from({length:9},(_,i)=>`<button data-soil="${i}" aria-label="${i+1}ばんの つちを ほる">·</button>`).join('')}</div></div>`;
 $('useShovel').onclick=()=>{selectedTool=true;$('useShovel').classList.add('selected');status('スコップを もったよ。ちずの めじるしは どこかな？');};
 document.querySelectorAll('[data-dig-site]').forEach(b=>b.onclick=()=>{if(!selectedTool){status('もちものの スコップを もってね。');return;}if(b.dataset.digSite!=='1'){status('ここは ちがったね。ちずの ふたつの めじるしを みよう。');return;}$('digChoices').hidden=true;$('digSite').hidden=false;status('ここだ！ つちを こすって ほりだそう。');});
 function dig(el){if(!el?.matches('[data-soil]')||dug.has(el.dataset.soil)||act.complete)return;dug.add(el.dataset.soil);el.classList.add('dug');T.tone(dug.size);if(dug.size>=7)done('たいようの ひかりだ！ この ひかりで、おしろへの みちが ひらいたよ。');}
 const grid=document.querySelector('.soil-grid');let down=false;grid.onpointerdown=e=>{down=true;grid.setPointerCapture(e.pointerId);dig(e.target.closest('[data-soil]'));};grid.onpointermove=e=>{if(down)dig(document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-soil]'));};grid.onpointerup=grid.onpointercancel=()=>down=false;grid.onclick=e=>dig(e.target.closest('[data-soil]'));
}
// ── Clues obtained in the town combine into a number/English lock, then magical combat. ──
function detective(){
 $('activityIntro').textContent='おしろに あしあとが つづいているよ。ひかりの かずと、まどの えの ことばを くみあわせて、とびらを あけよう。';
 let phase=0,clues=new Set();
 $('activityBody').innerHTML=`<div class="detective-scene"><button data-clue="footprints" aria-label="あしあとを しらべる" class="footprints">● ● ●</button><button data-clue="window" aria-label="まどの えを しらべる" class="clue-window">${A.icon('star')}<small>STAR</small></button><button data-clue="lamp" aria-label="ひかりの かずを しらべる" class="three-lamps">${A.icon('lantern')}${A.icon('lantern')}${A.icon('lantern')}</button></div><div id="clueNotebook" class="clue-notebook"></div><div id="lockChoices" class="lock-choices" hidden></div>`;
 const names={footprints:'あしあとが とびらに つづいている',window:'まどに おほしさま。STARは「ほし」',lamp:'ひかりの ランタンは 3つ'};
 document.querySelectorAll('[data-clue]').forEach(b=>b.onclick=()=>{clues.add(b.dataset.clue);b.classList.add('discovered');$('clueNotebook').innerHTML=[...clues].map(id=>`<p>✓ ${names[id]}</p>`).join('');T.say(names[b.dataset.clue]);if(clues.size===3)renderLock();});
 function renderLock(){const box=$('lockChoices');box.hidden=false;if(phase===0){box.innerHTML='<h3>ランタンの かずは？</h3>'+[2,3,4].map(n=>`<button data-code="${n}">${n}</button>`).join('');box.querySelectorAll('[data-code]').forEach(b=>b.onclick=()=>{if(b.dataset.code!=='3'){status('ランタンを ゆっくり かぞえてみよう。');return;}phase=1;T.tone(2);renderLock();});}
 else{box.innerHTML='<h3>STARは どの え？</h3>'+['moon','star','flower'].map(id=>`<button data-symbol="${id}" aria-label="${id}">${A.icon(id)}</button>`).join('');box.querySelectorAll('[data-symbol]').forEach(b=>b.onclick=()=>{if(b.dataset.symbol!=='star'){status('まどに かかれた えと、ことばを みてみよう。');return;}done('とびらが あいた！ ステッキを みつけたよ。まほうの ふくで くろくもを はらおう。');});}}
}
function finale(){
 $('activityIntro').textContent='みんなの おてつだいが、まほうの ちからに！ くろくもの こうげきを シールドで ふせいで、ハートの まほうを とどけよう。';
 let phase='transform',health=3,shield=0,hits=0,start=0,attackUntil=0,charge=0,holding=false,guarded=false,won=false;
 $('activityBody').innerHTML=`<div class="battle-scene"><div id="battleHero" class="battle-hero">${A.character({...T.state.outfit,dress:'magicdress',magic:true})}</div><div id="battleCloud" class="battle-cloud">${A.icon('cloud')}<b>くろくも</b></div><div id="battleBolt" class="battle-bolt" hidden>ϟ</div><div id="battleBeam" class="battle-beam" hidden>♡ ♡ ♡</div><div id="battleHearts" class="battle-hearts">♡ ♡ ♡</div></div><div class="magic-meter"><i id="magicFill"></i></div>`;
 action('magicTransform','✦ まほうの ふくに へんしん！',()=>{T.state.outfit.dress='magicdress';T.save();T.renderWorld();$('battleHero').classList.add('transforming');phase='ready';$('activityActions').replaceChildren();action('shieldButton','✦ シールド',()=>{if(won)return;shield=act.clock+850;T.tone(1);$('battleHero').classList.add('shielded');later(()=>$('battleHero').classList.remove('shielded'),850);});
 const magic=button('magicButton','♡ まほうを ためる',()=>{},true);$('activityActions').append(magic);magic.disabled=true;magic.onpointerdown=e=>{if(phase==='charge'){holding=true;magic.setPointerCapture(e.pointerId);}};magic.onpointerup=magic.onpointercancel=()=>holding=false;magic.onkeydown=e=>{if((e.key==='Enter'||e.key===' ')&&phase==='charge'){e.preventDefault();holding=true;}};magic.onkeyup=()=>holding=false;start=act.clock;status('くろくもが ぴかっと したら、シールドで ふせごう！');},true);
 act.update=(now,dt)=>{
 if(phase==='transform'||won)return;
 if(phase==='ready'&&now-start>1600){phase='warning';start=now;$('battleCloud').classList.add('warning');status('こうげきが くるよ！ シールド！');}
 if(phase==='warning'&&now-start>950){phase='attack';start=now;$('battleCloud').classList.remove('warning');$('battleBolt').hidden=false;guarded=shield>now;}
 if(phase==='attack'&&now-start>450){$('battleBolt').hidden=true;if(guarded){hits++;T.tone(3);status('まもれた！ '+hits+' / 3');}else{health=Math.max(1,health-1);status('だいじょうぶ！ ぴかっと したら シールドを おそう。');}$('battleHearts').textContent='♡ '.repeat(health);phase=hits>=3?'charge':'ready';start=now;if(phase==='charge'){$('magicButton').disabled=false;status('みんなの ちからが あつまった！ まほうボタンを ながおし！');}}
 if(phase==='charge'&&holding){charge=Math.min(1,charge+dt*.65);$('magicFill').style.width=charge*100+'%';if(charge>=1){won=true;$('battleBeam').hidden=false;$('battleCloud').classList.add('cleared');later(()=>{done('おまつりの ひかりが もどった！ まちの みんなが まっているよ。');T.toast('にじいろの おまつり、はじまるよ！','rainbow');},700);}}
 };
}
// ── The scanner is a world tool: the scope and beam operate on the town's actual NPCs. ──
function renderActors(){
 const root=$('worldFx');root.querySelectorAll('.scan-actor,.scan-scope').forEach(el=>el.remove());
 const caught=T.state.scanCaught||[];
 if(!scanner){const n=document.querySelector('[data-node="scan"]');if(n)n.style.visibility='';return;}
 const n=document.querySelector('[data-node="scan"]');if(n)n.style.visibility='hidden';
 people.forEach(p=>{if(caught.includes(p.id))return;const el=document.createElement('button');el.className='scan-actor';el.dataset.actor=p.id;el.setAttribute('aria-label','まちの おきゃくさん '+(p.id+1));el.style.left=p.x+'px';el.style.top=p.y+'px';el.innerHTML=A.character({hair:['bob','long','pony'][p.id],color:['mint','lav','yellow'][p.id]});root.append(el);});
 const lens=document.createElement('div');lens.className='scan-scope';lens.id='scanScope';lens.setAttribute('aria-hidden','true');root.append(lens);updateScope();
}
function equip(item){
 scanner=item==='scanner'&&T.state.flags.includes('doctor');
 let controls=$('scannerControls');if(!scanner){controls?.remove();renderActors();return;}
 if(!controls){controls=document.createElement('div');controls.id='scannerControls';controls.className='scanner-controls';controls.innerHTML='<button id="scanMode" aria-pressed="true">📡 スキャン</button><button id="beamMode" aria-pressed="false">✦ キャッチ</button><span id="scanCounter"></span>';$('viewport').append(controls);$('scanMode').onclick=e=>{e.stopPropagation();mode='scan';updateMode();};$('beamMode').onclick=e=>{e.stopPropagation();mode='beam';updateMode();};}
 mode='scan';T.focusOn(660,560);renderActors();updateMode();T.message('まちの ひとに スキャナーを かざそう。しょうたいが わかったら「キャッチ」に きりかえてね。');
}
function updateMode(){$('scanMode')?.setAttribute('aria-pressed',String(mode==='scan'));$('beamMode')?.setAttribute('aria-pressed',String(mode==='beam'));if($('scanScope'))$('scanScope').hidden=mode!=='scan';if($('scanCounter'))$('scanCounter').textContent=(T.state.scanCaught?.length||0)+' / 2';}
function updateScope(){const el=$('scanScope');if(!el)return;el.style.left=scope.x+'px';el.style.top=scope.y+'px';el.hidden=mode!=='scan';if(mode!=='scan')return;const caught=T.state.scanCaught||[];
 el.innerHTML=people.filter(p=>p.alien&&!caught.includes(p.id)).map(p=>`<span class="revealed-alien" style="left:${p.x-scope.x+100}px;top:${p.y-scope.y+100}px">${A.icon('alien')}</span>`).join('');
 people.forEach(p=>{if(p.alien&&!caught.includes(p.id)&&Math.hypot(p.x-scope.x,p.y-scope.y)<82){marked.add(p.id);document.querySelector(`[data-actor="${p.id}"]`)?.classList.add('marked');}});
}
function scanMove(p){if(scanner&&mode==='scan'){scope=p;updateScope();}}
function scanClick(p,id){if(!scanner)return;
 if(mode==='scan'){const person=people.find(v=>v.id===Number(id));scope=person?{x:person.x,y:person.y}:p;updateScope();T.message('スコープの なかだけ、しょうたいが みえるよ。');return;}
 const person=id!==undefined?people.find(v=>v.id===Number(id)):people.find(v=>Math.hypot(v.x-p.x,v.y-p.y)<85);
 if(!person||T.state.scanCaught?.includes(person.id))return;
 if(!person.alien){T.message('この ひとは まちの なかまだったね。スキャンで よく たしかめよう。');return;}
 if(!marked.has(person.id)){T.message('まずは スキャンで しょうたいを たしかめよう。');return;}
 T.state.scanCaught??=[];T.state.scanCaught.push(person.id);T.save();T.tone(3);T.toast('うちゅうの おともだちを みつけた！','alien');renderActors();updateMode();
 if(T.state.scanCaught.length===2){T.finish('scan');T.message('うちゅうの ひかりを もらった！ たいようの ひかりと あわせると、おしろの なぞが とけそうだね。');}else T.message('みつけた！ もうひとり かくれているみたい。');
}
function tick(now,dt){if(act&&$('activity').open){act.clock+=dt*1000;act.update?.(act.clock,dt);}if(scanner&&now-lastTick>140){lastTick=now;people.forEach((p,i)=>{const el=document.querySelector(`[data-actor="${p.id}"]`);if(el)el.style.transform=`translate(-50%,-100%) translateY(${Math.sin(now/900+i)*3}px)`;});}}
T.activities={open,equip,renderActors,scanMove,scanClick,scanning:()=>scanner,tick,pause(){if(act?.stealth)act.stealth.target=null;}};
init();
})();

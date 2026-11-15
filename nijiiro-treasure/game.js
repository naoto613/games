/* Exploration, inventory and persistent puzzles; no runtime dependencies. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const SAVE = 'nijiiro-treasure.v2', OLD_SAVE = 'nijiiro-treasure.v1';
  const { islands, prizes } = World;
  let collection = [], bestSecrets = [0,0,0], expeditions = [null,null,null], s = null;
  let sound = false, audio, screen = 'home', selected = '', lastIsland = 0;
  let movement, movementToken = 0, toastTimer, puzzle = null, puzzleTimers = [], frame;
  let nextAfterReward = false, hintLevel = 0, hintGoal = '', returnFocus;
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
  const validIds = (a,max) => Array.isArray(a) ? [...new Set(a.filter(i=>Number.isInteger(i)&&i>=0&&i<=max))] : [];
  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(SAVE));
      if (data?.version === 2) {
        collection = validIds(data.collection,8);
        sound = data.sound === true;
        bestSecrets = [0,1,2].map(i=>Number.isInteger(data.bestSecrets?.[i])?Math.min(5,Math.max(0,data.bestSecrets[i])):0);
        expeditions = [0,1,2].map(i=>{const v=World.validate(data.expeditions?.[i]);return v?.island===i?v:null;});
      } else {
        const old = JSON.parse(localStorage.getItem(OLD_SAVE));
        if (old?.version === 1) { collection = validIds(old.collection,8); sound = old.sound === true; }
      }
    } catch { /* Invalid or unavailable storage never blocks a new expedition. */ }
  }
  function save() {
    try {
      localStorage.setItem(SAVE, JSON.stringify({version:2,collection,bestSecrets,expeditions,sound}));
      $('storageNotice').hidden = true;
    } catch { $('storageNotice').hidden = false; }
  }
  function unlockAudio() {
    if (!sound) return;
    try {
      const Context = window.AudioContext || window.webkitAudioContext;
      if (!audio && Context) audio = new Context();
      if (audio?.state === 'suspended') audio.resume().catch(()=>{});
    } catch { /* Optional sound. */ }
  }
  function tone(note=0, long=false) {
    if (!sound || document.hidden) return;
    unlockAudio();
    if (!audio) return;
    try {
      const o=audio.createOscillator(), g=audio.createGain(), t=audio.currentTime;
      o.type='sine';o.frequency.value=[523,659,784,880,1047][note%5];
      g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.085,t+.02);g.gain.exponentialRampToValueAtTime(.001,t+(long?.5:.23));
      o.connect(g);g.connect(audio.destination);o.start(t);o.stop(t+.6);
    } catch { /* Visual feedback remains available. */ }
  }
  function say(text) {
    if (!sound || document.hidden || !window.speechSynthesis || !window.SpeechSynthesisUtterance) return;
    try {
      speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ja-JP';u.rate=.85;u.pitch=1.1;
      const voice=speechSynthesis.getVoices().find(v=>v.lang.startsWith('ja'));if(voice)u.voice=voice;speechSynthesis.speak(u);
    } catch { /* The full instruction is also visible. */ }
  }
  function stopSpeech() { try { window.speechSynthesis?.cancel(); } catch {} }
  function updateSound() {
    $('soundButton').setAttribute('aria-pressed',String(sound));
    $('soundButton').setAttribute('aria-label',sound?'おとを けす':'おとを つける');
    $('soundLabel').textContent=sound?'おと オン':'おと オフ';$('soundIcon').textContent=sound?'♫':'♪';
  }
  function setSound(value) {
    sound=value;updateSound();save();
    if (sound) unlockAudio(); else {stopSpeech();audio?.suspend().catch(()=>{});}
  }
  function message(text, speak=true) { $('message').textContent=text;if(speak)say(text); }
  function toast(text,art='clue') {
    clearTimeout(toastTimer);$('discovery').innerHTML=`${Art.svg(art)}<b>${text}</b>`;$('discovery').hidden=false;
    toastTimer=setTimeout(()=>$('discovery').hidden=true,2200);
  }
  function burst(x=50,y=50) {
    for(let i=0;i<22;i++) {
      const el=document.createElement('i');el.className='particle';
      el.style.cssText=`--x:${x}%;--y:${y}%;--dx:${Math.cos(i*2.4)*(60+i*3)}px;--dy:${Math.sin(i*2.4)*85+35}px;--color:${['#e4b76e','#e4a99f','#a2b99a','#b7b6d7'][i%4]}`;
      $('sparkles').append(el);setTimeout(()=>el.remove(),1300);
    }
  }
  function mapCount(i) { return collection.filter(id=>Math.floor(id/3)===i).length; }
  function renderHome() {
    $('albumCount').textContent=`${collection.length} / 9`;
    $('islands').innerHTML=islands.map((d,i)=>`<button class="island-card" data-island="${i}" aria-label="${d.name}で あそぶ"><div class="island-preview"><div class="landscape">${Art.landscape(d.type)}</div>${Art.svg(d.puzzleArt,'mini-object')}${Art.svg('bridge','mini-chest')}<span class="island-number">0${i+1}</span></div><div class="island-copy"><div><h3>${d.name}</h3><p>${expeditions[i]?`つづきから · ちず ${World.pieces(expeditions[i])} / 3`:d.intro}<br>3つの エリア · たからもの ${mapCount(i)} / 3</p></div><span class="island-arrow" aria-hidden="true">↗</span></div></button>`).join('');
  }
  function cancelMovement() { movementToken++;clearTimeout(movement);$('player').classList.remove('walking'); }
  function home() {
    cancelMovement();stopSpeech();screen='home';selected='';
    $('play').hidden=true;$('home').hidden=false;renderHome();window.scrollTo(0,0);
    document.querySelector(`[data-island="${lastIsland}"]`)?.focus({preventScroll:true});
  }
  function start(i) {
    cancelMovement();lastIsland=i;s=expeditions[i] ||= World.create(i);screen='play';selected='';hintLevel=0;
    $('home').hidden=true;$('play').hidden=false;$('islandTitle').textContent=islands[i].name;
    renderArea();save();window.scrollTo(0,0);$('mapButton').focus({preventScroll:true});
    message(s.tool?'ぼうけんの つづきを はじめよう！':`${islands[i].friendName}が なにか さがしているよ。はなしてみよう。`);
  }
  function currentGoal() {
    if(!s.tool)return s.gift?'give':'gift';
    if(!s.challenge)return 'challenge';
    if(s.boards.length<3)return 'boards';
    if(!s.bridge)return 'bridge';
    return 'dig';
  }
  function goalText() {
    const d=islands[s.island];
    return {gift:`${d.friendName}の おてつだい`,give:`${d.giftName}を とどけよう`,challenge:d.puzzleName,boards:'はしの ざいりょうを さがそう',bridge:'はしを なおそう',dig:'ちずを よんで ほりだそう'}[currentGoal()];
  }
  function renderDock() {
    const d=islands[s.island], count=World.pieces(s);
    $('guideTitle').textContent=goalText();$('islandStep').textContent=`ちず ${count} / 3`;
    const bag=[];
    if(s.gift&&!s.tool)bag.push(['gift',d.gift,d.giftName]);
    if(s.tool)bag.push(['shovel','shovel','スコップ']);
    if(s.boards.length)bag.push(['boards','plank',s.bridge?'はし かんせい':`いた ${s.boards.length} / 3`]);
    $('inventory').innerHTML=bag.length?bag.map(([id,art,name])=>`<button data-item="${id}" class="inventory-item${selected===id?' selected':''}" aria-pressed="${selected===id}" ${id==='boards'&&s.bridge?'disabled':''}>${Art.svg(art)}<span>${name}</span></button>`).join(''):'<span class="empty-bag">さがして いれてみよう</span>';
    $('journalButton').innerHTML=[s.tool,s.challenge,s.bridge].map((got,i)=>`<span class="map-piece${got?' collected':''}" aria-label="${i+1}まいめ${got?'、みつけた':'、まだ'}">${got?Art.svg(['clue','compass','bridge'][i]):'？'}</span>`).join('');
    $('journalButton').classList.toggle('complete',count===3);
    $('secretCount').innerHTML=`${Art.svg('butterfly')}<span>${s.secrets.length} / 5</span>`;
    const goal=currentGoal();if(goal!==hintGoal){hintGoal=goal;hintLevel=0;}
    $('hintButton').textContent=hintLevel?`✦ ヒント ${hintLevel}/3`:'✦ ヒント';
  }
  function renderArea() {
    const d=islands[s.island];
    $('scene').dataset.biome=d.type;$('scene').dataset.area=String(s.area);
    $('scene').setAttribute('aria-label',d.areas[s.area]);$('sceneBadge').textContent=d.areas[s.area];
    $('scenery').innerHTML=World.scenery(s);$('decorations').innerHTML=World.decorations(s);
    $('areaNav').innerHTML=d.areas.map((name,i)=>`<button data-area="${i}" aria-current="${s.area===i?'location':'false'}"><span>${i===2&&!s.bridge?'♧':s.visits.includes(i)?'●':'○'}</span><b>${name}</b>${i===2&&!s.bridge?'<small>はしの むこう</small>':''}</button>`).join('');
    renderObjects();renderDock();$('discovery').hidden=true;
    $('player').style.left='48%';$('player').style.top='92%';
  }
  function renderObjects() {
    $('spots').innerHTML=World.objects(s).map(obj=>{
      const board=obj.id.startsWith('board')&&s.boards.includes(Number(obj.id.slice(5)));
      const cover=obj.id.startsWith('cover')&&s.inspected.includes(Number(obj.id.slice(5)));
      const done=board||(obj.id==='friend'&&s.tool)||(obj.id==='challenge'&&s.challenge);
      const art=board?'plank':obj.id==='cover'+s.seed%3&&s.gift?islands[s.island].cover[s.seed%3]:obj.art;
      return `<button class="world-object ${obj.id.startsWith('secret')?'secret-object':''} ${done?'done':''} ${cover?'searched':''} ${obj.id==='bridge'&&!s.bridge?'broken':''}" data-object="${obj.id}" style="--x:${obj.x}%;--y:${obj.y}%;--size:${obj.size}px" aria-label="${obj.name}${done?'、できたよ':''}">${obj.pair?`<span class="landmark left">${Art.svg(obj.pair[0])}</span><span class="landmark right">${Art.svg(obj.pair[1])}</span>`:''}<span class="object-art">${Art.svg(art)}</span><span class="object-label">${obj.name}</span>${done?'<i class="done-mark">✓</i>':''}${obj.id==='friend'&&!s.tool?`<span class="want-bubble">${Art.svg(islands[s.island].gift)}</span>`:''}${obj.id==='bridge'&&!s.bridge?'<i class="bridge-break">···</i>':''}</button>`;
    }).join('');
  }
  function travel(area) {
    if(area===2&&!s.bridge){message('はしが こわれているね。いたを 3まい あつめて なおそう。');tone(0);return;}
    cancelMovement();s.area=area;if(!s.visits.includes(area))s.visits.push(area);save();renderArea();
    message(`${islands[s.island].areas[area]}に ついたよ。${area===2?'ちずの めじるしは どこかな？':'きになる ものを しらべよう。'}`);
  }
  function walk(x,y,action) {
    cancelMovement();const token=movementToken;
    $('player').style.left=`${Math.max(8,Math.min(92,x))}%`;$('player').style.top=`${Math.max(35,Math.min(93,y))}%`;
    $('player').classList.add('walking');
    movement=setTimeout(()=>{if(token!==movementToken||screen!=='play')return;$('player').classList.remove('walking');action?.();},reduced()?0:420);
  }
  function discover(text,art,obj) {tone(2);toast(text,art);burst(obj.x,obj.y);renderDock();save();}
  function interact(id) {
    const obj=World.objects(s).find(o=>o.id===id);if(!obj)return;
    const d=islands[s.island];
    if(id.startsWith('secret')) {
      const n=Number(id.slice(6));if(s.secrets.includes(n))return;s.secrets.push(n);bestSecrets[s.island]=Math.max(bestSecrets[s.island],s.secrets.length);
      discover(s.secrets.length===5?'ひみつの ちょうちょ、ぜんぶ みつけた！':'ひみつの ちょうちょ！','butterfly',obj);renderObjects();message('たからものの ほかにも、ひみつが かくれているね。');return;
    }
    if(id.startsWith('cover')) {
      const n=Number(id.slice(5));if(!s.inspected.includes(n))s.inspected.push(n);
      if(n===s.seed%3&&!s.gift){s.gift=true;discover(`${d.giftName}を みつけた！`,d.gift,obj);message(`もちものの ${d.giftName}を えらんで、${d.friendName}に とどけよう。`);}
      else {message(s.gift&&n===s.seed%3?'ここは もう しらべたね。':d.surprises[n]);tone(n);const el=document.querySelector(`[data-object="${id}"]`);el?.classList.add('rustle');setTimeout(()=>el?.classList.remove('rustle'),650);save();}
      renderDock();return;
    }
    if(id==='friend') {
      if(s.tool){message('スコップは たからさがしに つかってね。ちずの かけらも わすれずに！');return;}
      if(selected==='gift'&&s.gift){s.tool=true;selected='';discover('スコップと ちずを もらった！','shovel',obj);renderObjects();message('ありがとう！ はしの むこうに たからが あるんだって。ちずの のこりも さがしてね。');return;}
      message(s.gift?`もちものの ${d.giftName}を タッチしてから、ぼくに わたしてね。`:`${d.giftName}を なくしちゃった。ひろばの どこかに あるはずなんだ。`);return;
    }
    if(id.startsWith('board')) {
      const n=Number(id.slice(5));if(s.boards.includes(n)){message('この いたは もう もちものに あるよ。');return;}
      s.boards.push(n);discover(`はしの いた！ ${s.boards.length} / 3`,'plank',obj);renderObjects();
      message(s.boards.length===3?'いたが そろった！ もちものの いたを えらんで、はしを なおそう。':'これで はしを なおせそう！ ほかの ばしょも さがそう。');return;
    }
    if(id==='bridge') {
      if(s.bridge){travel(2);return;}
      if(s.boards.length<3){message(`はしに いたが 3まい いるよ。あと ${3-s.boards.length}まい、ひろばと この ばしょを さがそう。`);return;}
      if(selected!=='boards'){message('もちものの いたを えらんでから、はしを タッチしてね。');return;}
      openPuzzle('bridge');return;
    }
    if(id==='challenge') {
      if(s.challenge){message('この しかけの ちずは もらったよ。ほかの ぼうけんを つづけよう！');return;}
      openPuzzle(d.puzzle);return;
    }
    if(id.startsWith('dig')) {
      if(World.pieces(s)<3){message('ちずが まだ たりないね。3まい あつめると、ほる ばしょが わかるよ。');return;}
      if(selected!=='shovel'){message('もちものの スコップを えらんで、ほってみよう。');return;}
      if(Number(id.slice(3))!==Math.floor(s.seed/3)%3){tone(1);burst(obj.x,obj.y);message('あれっ、ここには どんぐりだけ。ちずの ふたつの めじるしを みてみよう。');return;}
      openPuzzle('dig');return;
    }
    tone(1);burst(obj.x,obj.y);message(id==='toy0'?'テントに おやつが あった！ ひとやすみして しゅっぱつ！':id==='toy2'?'ランタンが きらり。たからは ちかいかな？':d.surprises[s.area]);
  }
  function hint() {
    if(!s)return;const d=islands[s.island],goal=currentGoal();hintLevel=Math.min(3,hintLevel+1);
    const clues={
      gift:[`${d.friendName}に はなしかけて、ほしいものを きいてみよう。`,`さいしょの ひろばで、しげみや ものの うらを しらべよう。`,`${World.names[d.cover[s.seed%3]]}の ところが あやしいよ。`],
      give:[`ひろった ${d.giftName}は だれの ものかな？`,`したの もちものから ${d.giftName}を えらぼう。`,`${d.friendName}に タッチすると わたせるよ。`],
      challenge:[`となりの エリアで、${d.puzzleName}に ちょうせんしよう。`,'しかけを ひらくと、あそびかたが わかるよ。','むずかしかったら、しかけの「ヒント」を つかってね。'],
      boards:['はしの ざいりょうは、さいしょと となりの エリアに あるよ。','まるたや きりかぶを しらべてみよう。',s.boards.includes(0)?'となりの エリアの ひだりしたと みぎしたを しらべよう。':'さいしょの エリアの まんなか したの まるたを しらべよう。'],
      bridge:['ながさが ちがう いたを、あう あなに はめよう。','もちものの いたを えらんで、こわれた はしを タッチ。','しかけの なかで、いたを えらんで あなを タッチしよう。'],
      dig:['あつめた ちずを ひらいてみよう。','はしの むこうで、ちずの ふたつの めじるしを さがそう。','ふたつの めじるしの あいだを、スコップで ほろう。']
    };
    message(clues[goal][hintLevel-1]);$('hintButton').textContent=`✦ ヒント ${hintLevel}/3`;
  }
  function openJournal() {
    if(!s)return;cancelMovement();stopSpeech();const d=islands[s.island],pair=d.pair[Math.floor(s.seed/3)%3];
    $('journalMap').innerHTML=`<div class="treasure-map"><span class="map-caption">${s.bridge?d.areas[2]:'はしの むこうは…？'}</span><div class="map-landmarks"><span>${s.tool?Art.svg(pair[0]):'<i>？</i>'}</span><b>×</b><span>${s.challenge?Art.svg(pair[1]):'<i>？</i>'}</span></div><p>${World.pieces(s)===3?'ふたつの めじるしの あいだを ほろう！':'ちずの かけらを あつめよう。'}</p></div>`;
    $('journalTasks').innerHTML=[['friend',s.tool,d.friend,`${d.friendName}の おてつだい`],['challenge',s.challenge,d.puzzleArt,d.puzzleName],['bridge',s.bridge,'bridge','はしを なおす']].map(([id,done,art,name])=>`<div class="journal-task">${Art.svg(art)}<span>${name}</span><b>${done?'✓':'○'}</b></div>`).join('');
    $('journalDialog').showModal();
  }
  // Modal puzzle lifetime: all timers and animation frames are cancelled on close.
  function clearPuzzleTimers() {puzzleTimers.forEach(clearTimeout);puzzleTimers=[];cancelAnimationFrame(frame);}
  function later(fn,ms) {const active=puzzle;puzzleTimers.push(setTimeout(()=>{if(puzzle===active&&$('puzzleDialog').open)fn();},ms));}
  function openPuzzle(kind) {
    cancelMovement();clearPuzzleTimers();stopSpeech();puzzle={kind,selected:null,input:[],busy:false,misses:0};
    $('puzzleKicker').textContent=islands[s.island].areas[s.area];
    $('puzzleTitle').textContent={bridge:'こわれた はしを なおそう',music:'ふくろうの うた',fishing:'おさかなを 3びき つろう',wind:'かぜを ふうしゃに とどけよう',dig:'たからを ほりだそう！'}[kind];
    $('puzzleStatus').textContent='';$('puzzleActions').innerHTML='';$('puzzleBody').innerHTML='';$('puzzleDialog').showModal();
    ({bridge:renderBridge,music:renderMusic,fishing:renderFishing,wind:renderWind,dig:renderDig})[kind]();
    say($('puzzleIntro').textContent);
  }
  function puzzleStatus(text) { $('puzzleStatus').textContent=text;say(text); }
  function finishPuzzle(kind) {
    if(!puzzle||puzzle.finished)return;puzzle.finished=true;clearPuzzleTimers();tone(4,true);
    if(kind==='bridge'){s.bridge=true;selected='';}else s.challenge=true;
    save();renderObjects();renderDock();
    $('puzzleStatus').textContent=kind==='bridge'?'はしが つながった！ ちずの かけらも みつけたよ！':'やったね！ ちずの かけらを もらったよ！';
    $('puzzleActions').innerHTML='<button id="puzzleDone" class="primary-button">ちずを もって すすもう →</button>';
    $('puzzleDone').addEventListener('click',()=>{$('puzzleDialog').close();});
    say($('puzzleStatus').textContent);
  }
  function renderBridge() {
    $('puzzleIntro').textContent='いたを えらんで、おなじ ながさの あなに はめよう。';
    const labels=['みじかい','ちゅうくらい','ながい'];
    $('puzzleBody').innerHTML=`<div class="bridge-puzzle">${[2,0,1].map(i=>`<button class="bridge-slot ${s.bridgeSlots.includes(i)?'filled':''}" data-slot="${i}" aria-label="${labels[i]} あな" style="--length:${[43,65,88][i]}%" ${s.bridgeSlots.includes(i)?'disabled':''}><span>${s.bridgeSlots.includes(i)?'✓':'？'}</span></button>`).join('')}</div><div class="board-choices">${[0,1,2].map(i=>`<button data-board="${i}" aria-label="${labels[i]} いた" ${s.bridgeSlots.includes(i)?'disabled':''}><svg viewBox="0 0 110 50" aria-hidden="true"><rect x="${[32,20,6][i]}" y="10" width="${[46,70,98][i]}" height="30" rx="5" fill="#d3a775" stroke="#94714e" stroke-width="2"/><path d="M${[37,25,11][i]} 25h${[36,60,88][i]}" stroke="#f1ce94" stroke-width="3"/></svg><span>${labels[i]}</span></button>`).join('')}</div>`;
    $('puzzleBody').querySelectorAll('[data-board]').forEach(b=>b.onclick=()=>{if(puzzle.finished)return;puzzle.selected=Number(b.dataset.board);document.querySelectorAll('[data-board]').forEach(el=>el.classList.toggle('selected',el===b));tone(0);});
    $('puzzleBody').querySelectorAll('[data-slot]').forEach(b=>b.onclick=()=>{
      if(puzzle.finished)return;const id=Number(b.dataset.slot);
      if(puzzle.selected===null){puzzleStatus('したから いたを えらんでね。');return;}
      if(id!==puzzle.selected){puzzleStatus('ちょっと ながさが ちがうね。ほかの あなは どうかな？');return;}
      if(!s.bridgeSlots.includes(id))s.bridgeSlots.push(id);puzzle.selected=null;save();tone(2);renderBridge();
      if(s.bridgeSlots.length===3)finishPuzzle('bridge');else puzzleStatus('ぴったり！ あと '+(3-s.bridgeSlots.length)+'まい。');
    });
  }
  const notes=['flower','moon','star','heart'], noteNames=['おはな','おつきさま','おほしさま','ハート'];
  function melody() { const n=s.seed+s.musicRound*7;return Array.from({length:3+s.musicRound},(_,i)=>(Math.floor(n/(i+1))+i*3)%4); }
  function renderMusic() {
    $('puzzleIntro').textContent=`ふくろうが ひからせた じゅんばんを おぼえて、まねしよう。${s.musicRound+1} / 2 かいめ。`;
    $('puzzleBody').innerHTML=`<div class="music-owl">${Art.svg('owl')}<div id="musicProgress" class="music-progress"></div></div><div id="melodyHint" class="melody-hint" hidden></div><div class="note-buttons">${notes.map((art,i)=>`<button data-note="${i}" aria-label="${noteNames[i]}">${Art.svg(art)}<span>${noteNames[i]}</span></button>`).join('')}</div>`;
    $('puzzleActions').innerHTML='<button id="playMelody" class="primary-button">♪ おてほんを きく</button><button id="musicHint" class="soft-button">✦ じゅんばんの ヒント</button>';
    $('playMelody').onclick=playMelody;$('musicHint').onclick=()=>{$('melodyHint').hidden=false;$('melodyHint').innerHTML=melody().map(i=>Art.svg(notes[i])).join('<b>→</b>');};
    document.querySelectorAll('[data-note]').forEach(b=>b.onclick=()=>playNote(Number(b.dataset.note)));
    updateMusicProgress();
  }
  function updateMusicProgress() { $('musicProgress').innerHTML=melody().map((n,i)=>`<span class="${i<puzzle.input.length?'filled':''}">${i<puzzle.input.length?'✓':'●'}</span>`).join(''); }
  function playMelody() {
    if(!puzzle||puzzle.kind!=='music'||puzzle.finished)return;clearPuzzleTimers();puzzle.busy=true;puzzle.started=true;puzzle.input=[];updateMusicProgress();
    $('playMelody').disabled=true;document.querySelectorAll('[data-note]').forEach(b=>{b.disabled=true;b.classList.remove('singing');});
    puzzleStatus('よく みて、きいてね。');
    melody().forEach((note,i)=>{
      later(()=>{const b=document.querySelector(`[data-note="${note}"]`);b.classList.add('singing');tone(note,true);$('puzzleStatus').textContent=noteNames[note];},400+i*800);
      later(()=>document.querySelector(`[data-note="${note}"]`)?.classList.remove('singing'),1000+i*800);
    });
    later(()=>{puzzle.busy=false;$('playMelody').disabled=false;document.querySelectorAll('[data-note]').forEach(b=>b.disabled=false);puzzleStatus('つぎは きみの ばん！');},450+melody().length*800);
  }
  function playNote(n) {
    if(puzzle.busy||puzzle.finished)return;
    if(!puzzle.started){puzzleStatus('まずは「おてほんを きく」を おしてね。');return;}
    tone(n,true);const expected=melody()[puzzle.input.length];
    if(n!==expected){puzzle.input=[];updateMusicProgress();puzzleStatus('おしい！ はじめから もういちど。おてほんは なんどでも きけるよ。');return;}
    puzzle.input.push(n);updateMusicProgress();
    if(puzzle.input.length===melody().length){s.musicRound++;save();if(s.musicRound===2){finishPuzzle('music');}else{puzzle.input=[];puzzle.started=false;renderMusic();puzzleStatus('おぼえられたね！ つぎは 4つの おと。');}}
  }
  function renderFishing() {
    $('puzzleIntro').textContent='うきが みどりの ばしょに きたら「つる！」。さかなを 3びき あつめよう。';
    $('puzzleBody').innerHTML=`<div class="fishing-pond">${Art.svg('fish','pond-fish')}<span class="fishing-line"></span><span class="bobber">●</span><div class="catch-count">${s.fish} / 3 ひき</div></div><div class="fishing-meter" role="meter" aria-label="うきの ばしょ" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span class="catch-zone"></span><span class="fishing-cursor">▼</span></div>`;
    $('puzzleActions').innerHTML='<button id="catchFish" class="primary-button">つる！</button><button id="fishingHint" class="soft-button">✦ ゆっくりに する</button>';
    puzzle.slow=false;puzzle.startedAt=performance.now();puzzle.position=0;
    $('fishingHint').onclick=()=>{puzzle.slow=true;puzzleStatus('うきが ゆっくりに なったよ。みどりの ところで つろう。');};
    $('catchFish').onclick=()=>{
      if(puzzle.busy||puzzle.finished)return;
      const target=[35,65,50][s.fish], tolerance=puzzle.slow||puzzle.misses>=3?22:14;
      if(Math.abs(puzzle.position-target)<=tolerance){s.fish++;save();tone(3,true);document.querySelector('.catch-count').textContent=`${s.fish} / 3 ひき`;document.querySelector('.pond-fish').classList.add('caught');puzzle.busy=true;
        if(s.fish===3){finishPuzzle('fishing');return;}puzzleStatus('つれた！ あと '+(3-s.fish)+'ひき。');later(()=>{puzzle.busy=false;document.querySelector('.pond-fish')?.classList.remove('caught');},650);
      } else {puzzle.misses++;puzzleStatus('もうすこし！ うきが みどりに くるまで まとう。');}
    };
    const active=puzzle;
    function animate(now){if(puzzle!==active||!$('puzzleDialog').open||puzzle.finished)return;
      puzzle.position=50+46*Math.sin((now-puzzle.startedAt)/(puzzle.slow?1450:850));
      const meter=document.querySelector('.fishing-meter');meter.setAttribute('aria-valuenow',String(Math.round(puzzle.position)));
      const target=[35,65,50][s.fish], tolerance=puzzle.slow||puzzle.misses>=3?22:14;
      document.querySelector('.catch-zone').style.cssText=`left:${target-tolerance}%;width:${tolerance*2}%`;
      document.querySelector('.fishing-cursor').style.left=`${puzzle.position}%`;
      frame=requestAnimationFrame(animate);
    }
    frame=requestAnimationFrame(animate);
  }
  function renderWind() {
    $('puzzleIntro').textContent='まがった かぜの みちを タッチして まわそう。ひかる かぜを ふうしゃまで つなげてね。';
    const target=[0,2,1];let flow=0;while(flow<3&&s.wind[flow]===target[flow])flow++;
    $('puzzleBody').innerHTML=`<div class="wind-puzzle"><span class="wind-source">かぜ →</span><div class="wind-grid">${[0,1,2].map(i=>`<button class="wind-tile ${i<flow?'flowing':''}" data-pipe="${i}" style="grid-column:${i===2?2:1};grid-row:${i===0?1:2}" aria-label="${i+1}ばんの みちを まわす"><svg viewBox="0 0 100 100" style="transform:rotate(${s.wind[i]*90}deg)" aria-hidden="true"><path d="M0 50H50V100" fill="none" stroke="#b5c4b3" stroke-width="28"/><path d="M0 50H50V100" fill="none" stroke="${i<flow?'#f3d37c':'#f8f5e7'}" stroke-width="17"/><path d="M8 50h20m22 14v20" stroke="${i<flow?'#a57f3b':'#c8c5b9'}" stroke-width="3" stroke-dasharray="4 5"/></svg></button>`).join('')}<span class="wind-goal ${flow===3?'spinning':''}" style="grid-column:2;grid-row:1">${Art.svg('windmill')}</span></div></div>`;
    $('puzzleActions').innerHTML='<button id="windHint" class="soft-button">✦ かぜの ヒント</button>';
    $('windHint').onclick=()=>puzzleStatus(flow===0?'かぜは ひだりから きて、したへ まがるよ。':flow===1?'ひだりしたは、うえから きた かぜを みぎへ。':'みぎしたは、ひだりから きた かぜを うえへ。');
    document.querySelectorAll('[data-pipe]').forEach(b=>b.onclick=()=>{if(puzzle.finished)return;const n=Number(b.dataset.pipe);s.wind[n]=(s.wind[n]+1)%4;save();tone(n);renderWind();});
    if(flow===3)finishPuzzle('wind');
  }
  function renderDig() {
    $('puzzleIntro').textContent='つちを こすって、たからを ほりだそう！ タッチでも ほれるよ。';
    $('puzzleBody').innerHTML=`<div class="dig-site">${Art.svg('chest','buried-chest')}<div class="soil-grid">${Array.from({length:9},(_,i)=>`<button class="soil ${s.dug.includes(i)?'dug':''}" data-soil="${i}" aria-label="${i+1}ばんの つちを ほる" ${s.dug.includes(i)?'disabled':''}><span>${['·','✧','·','·','·','✧','·','·','·'][i]}</span></button>`).join('')}</div></div>`;
    $('puzzleActions').innerHTML='<button id="openTreasure" class="primary-button" hidden>たからばこを あける！</button>';
    $('openTreasure').onclick=openTreasure;
    const grid=document.querySelector('.soil-grid');
    const dig=el=>{
      if(!el?.matches('[data-soil]')||puzzle.finished)return;const id=Number(el.dataset.soil);if(s.dug.includes(id))return;
      s.dug.push(id);el.classList.add('dug');el.disabled=true;tone(id%4);save();updateDig();
    };
    grid.addEventListener('pointerdown',e=>{puzzle.digging=true;grid.setPointerCapture(e.pointerId);dig(e.target.closest('[data-soil]'));});
    grid.addEventListener('pointermove',e=>{if(puzzle?.digging)dig(document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-soil]'));});
    grid.addEventListener('pointerup',()=>{if(puzzle)puzzle.digging=false;});grid.addEventListener('pointercancel',()=>{if(puzzle)puzzle.digging=false;});
    grid.addEventListener('click',e=>dig(e.target.closest('[data-soil]')));
    updateDig();
  }
  function updateDig() {
    $('puzzleStatus').textContent=s.dug.length>=7?'たからばこだ！ あけてみよう！':`もうすこし、なにか みえてきた！ ${s.dug.length} / 7`;
    $('openTreasure').hidden=s.dug.length<7;
    if(s.dug.length>=7)document.querySelectorAll('.soil').forEach(el=>{el.classList.add('dug');el.disabled=true;});
  }
  function openTreasure() {
    if(!s||World.pieces(s)!==3||s.dug.length<7||puzzle?.finished)return;
    puzzle.finished=true;lastIsland=s.island;
    const all=[lastIsland*3,lastIsland*3+1,lastIsland*3+2], unseen=all.filter(i=>!collection.includes(i));
    const options=unseen.length?unseen:all,id=options[Math.floor(Math.random()*options.length)];
    if(!collection.includes(id))collection.push(id);bestSecrets[lastIsland]=Math.max(bestSecrets[lastIsland],s.secrets.length);
    const secrets=s.secrets.length;expeditions[lastIsland]=null;save();
    $('puzzleDialog').close();$('rewardArt').innerHTML=Art.svg(prizes[id][0]);$('rewardTitle').textContent=prizes[id][1];
    $('rewardText').textContent=`じぶんで みつけた たからもの！\nひみつの ちょうちょ ${secrets} / 5\n${collection.length===9?'9この たからもの、ぜんぶ あつまったね！':'ずかんに ぼうけんの おもいでを のこしたよ。'}`;
    $('rewardDialog').showModal();tone(4,true);say('たからばこが あいたよ！ '+prizes[id][1]+'を みつけたね！');renderHome();
  }
  function renderAlbum() {
    $('albumMessage').textContent=`たからもの ${collection.length} / 9 · ひみつの ちょうちょ ${bestSecrets.reduce((a,b)=>a+b,0)} / 15`;
    $('albumGrid').innerHTML=prizes.map(([art,name],id)=>`<article class="treasure-card${collection.includes(id)?'':' unknown'}">${collection.includes(id)?Art.svg(art):'<div class="unknown-art">？</div>'}<h3>${collection.includes(id)?name:'どんな たからかな？'}</h3><p>${islands[Math.floor(id/3)].name}</p></article>`).join('');
  }
  $('islands').onclick=e=>{const b=e.target.closest('[data-island]');if(b)start(Number(b.dataset.island));};
  $('areaNav').onclick=e=>{const b=e.target.closest('[data-area]');if(b)travel(Number(b.dataset.area));};
  $('scene').onclick=e=>{
    if(screen!=='play'||$('puzzleDialog').open)return;unlockAudio();const b=e.target.closest('[data-object]');
    if(b){const obj=World.objects(s).find(o=>o.id===b.dataset.object);if(obj)walk(obj.x,obj.y+10,()=>interact(obj.id));}
    else{const r=$('scene').getBoundingClientRect();walk((e.clientX-r.left)/r.width*100,(e.clientY-r.top)/r.height*100);}
  };
  $('scene').onkeydown=e=>{if(e.target!==$('scene'))return;const deltas={ArrowLeft:[-8,0],ArrowRight:[8,0],ArrowUp:[0,-8],ArrowDown:[0,8]};if(deltas[e.key]){e.preventDefault();const [dx,dy]=deltas[e.key];walk(parseFloat($('player').style.left)+dx,parseFloat($('player').style.top)+dy);}};
  $('inventory').onclick=e=>{const b=e.target.closest('[data-item]');if(!b||b.disabled)return;selected=selected===b.dataset.item?'':b.dataset.item;renderDock();message(selected==='shovel'?'スコップを もったよ。ちずの ばしょを ほろう。':selected==='boards'?'いたを もったよ。はしの ところへ もっていこう。':selected==='gift'?`${islands[s.island].friendName}に とどけよう。`:'どうぐを しまったよ。');};
  $('mapButton').onclick=home;$('hintButton').onclick=hint;$('journalButton').onclick=openJournal;
  $('journalClose').onclick=()=>$('journalDialog').close();
  $('listenButton').onclick=()=>{if(!sound)setSound(true);say($('message').textContent);};
  $('soundButton').onclick=()=>{setSound(!sound);if(sound)say(screen==='play'?$('message').textContent:'さあ、ぼうけんに しゅっぱつしよう！');};
  $('puzzleClose').onclick=()=>$('puzzleDialog').close();
  $('puzzleDialog').addEventListener('close',()=>{clearPuzzleTimers();puzzle=null;if(screen==='play'&&s){renderObjects();renderDock();message(World.pieces(s)===3?'ちずが そろった！ ちずを ひらいて たからの ばしょを さがそう。':goalText(),false);}});
  $('rewardNext').onclick=()=>{nextAfterReward=true;$('rewardDialog').close();};
  $('rewardHome').onclick=()=>$('rewardDialog').close();
  $('rewardDialog').addEventListener('close',()=>{const next=nextAfterReward;nextAfterReward=false;if(next)start((lastIsland+1)%3);else home();});
  $('albumButton').onclick=()=>{cancelMovement();stopSpeech();returnFocus=document.activeElement;renderAlbum();$('albumDialog').showModal();};
  $('albumClose').onclick=()=>$('albumDialog').close();
  $('albumDialog').addEventListener('close',()=>returnFocus?.focus({preventScroll:true}));
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){cancelMovement();stopSpeech();audio?.suspend().catch(()=>{});if($('puzzleDialog').open)$('puzzleDialog').close();}
  });
  load();document.querySelectorAll('[data-art]').forEach(el=>el.innerHTML=Art.svg(el.dataset.art));
  $('welcomeArt').innerHTML=Art.welcome();updateSound();renderHome();
})();

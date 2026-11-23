(() => {
  'use strict';
  const $=id=>document.getElementById(id),catalog=window.DreamCatalog, E=window.DreamEngine;
  const KEY='dream-train.v1',byId=id=>catalog.find(g=>g.id===id);
  const svg=(id,cls='')=>Art.svg(id,cls);
  let state=E.fresh(),voice=false,current=null,frame=null,visit='',offset=0,loadingTimer,leaving=false;
  let filter='すべて',selectedDecoration=null,showingHelp=false,observerReady=false,pendingRoute=null,pendingPark=null;
  try{state=E.validate(JSON.parse(localStorage.getItem(KEY)),catalog);voice=localStorage.getItem(KEY+'.voice')==='true';}catch{}
  function save(){try{localStorage.setItem(KEY,JSON.stringify(state));$('saveNotice').hidden=true;}catch{$('saveNotice').hidden=false;}}
  function say(text){if(!voice||document.hidden||!window.speechSynthesis||!window.SpeechSynthesisUtterance)return;try{speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='ja-JP';u.rate=.86;u.pitch=1.1;speechSynthesis.speak(u);}catch{}}
  function stopVoice(){try{window.speechSynthesis?.cancel();}catch{}}
  function updateVoice(){ $('voiceButton').setAttribute('aria-pressed',String(voice));$('voiceButton').setAttribute('aria-label',voice?'あんないの こえを けす':'あんないの こえを つける');$('voiceButton').textContent=voice?'♫':'♪'; }
  const paints={sage:['#9cbba5','#587a68'],rose:['#d8a6b2','#a37385'],sky:['#a0bfd2','#62859e'],honey:['#dcc089','#a3834f']};
  function trainArt(big=false){
    const [light,dark]=paints[state.paint],w=big?980:860;
    const wagon=(id,i)=>{
      const x=226+i*120,g=byId(id);
      return `<g transform="translate(${x} 0)"><path d="M-12 174h17" stroke="#897860" stroke-width="6"/><rect x="0" y="122" width="108" height="57" rx="13" fill="${i%2?light:'#f1d69f'}" stroke="${dark}" stroke-width="2.5"/><path d="M6 133h95" stroke="#fff7db" stroke-width="3"/><circle cx="23" cy="184" r="13" fill="#f8efda" stroke="${dark}" stroke-width="4"/><circle cx="83" cy="184" r="13" fill="#f8efda" stroke="${dark}" stroke-width="4"/>${g?Art.place(g.art,24,65,65):'<path d="m50 149 4-8 4 8 9 1-7 6 2 9-8-4-8 4 2-9-7-6Z" fill="#b9b59c" opacity=".6"/>'}</g>`;
    };
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 230" aria-hidden="true"><path d="M0 203H980M0 211H980" stroke="#a7a48a" stroke-width="2"/>${Array.from({length:45},(_,i)=>`<path d="M${i*24} 202v12" stroke="#b6aa8b" stroke-width="3"/>`).join('')}<g class="train-smoke" fill="#e3e8d7"><ellipse cx="133" cy="59" rx="20" ry="11"/><ellipse cx="152" cy="36" rx="26" ry="15"/><ellipse cx="187" cy="15" rx="33" ry="16"/></g><g><rect x="41" y="113" width="157" height="66" rx="17" fill="${light}" stroke="${dark}" stroke-width="3"/><path d="M87 117V75h25v42M81 74h38" fill="${dark}" stroke="${dark}" stroke-width="7" stroke-linejoin="round"/><path d="M136 124V66h59v75" fill="${light}" stroke="${dark}" stroke-width="3"/><path d="M129 65h75" stroke="${dark}" stroke-width="9" stroke-linecap="round"/><rect x="145" y="76" width="39" height="36" rx="8" fill="#ffefb8" stroke="${dark}" stroke-width="2"/><path d="M165 77v33" stroke="#d8c8a1" stroke-width="2"/><path d="m41 151-23 26h28" fill="#e1b781" stroke="${dark}" stroke-width="3"/><circle cx="77" cy="179" r="22" fill="#f9e8bd" stroke="${dark}" stroke-width="5"/><circle cx="77" cy="179" r="10" fill="${dark}"/><circle cx="164" cy="183" r="16" fill="#f9e8bd" stroke="${dark}" stroke-width="4"/><path d="M77 179h87" stroke="#ba9c71" stroke-width="5"/><path d="m109 137 4-9 5 9 9 1-7 6 2 10-9-5-8 5 2-10-7-6Z" fill="#fdf1ba" stroke="${dark}" stroke-width="1.5"/></g>${state.cars.map(wagon).join('')}<g fill="#e3b862"><path d="m32 68 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/><path d="m833 98 3 7 7 3-7 3-3 7-3-7-7-3 7-3Z"/></g></svg>`;
  }
  function heroArt(){
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 610 380" aria-hidden="true"><ellipse cx="316" cy="220" rx="255" ry="142" fill="#e7ecdc"/><path d="M89 223q-20-163 208-156 238 8 212 169" fill="none" stroke="#b9cbb8" stroke-width="2" stroke-dasharray="5 9"/>${Art.place('house',75,90,75,-13)}${Art.place('crown',240,22,66,3)}${Art.place('star',450,87,63,14)}${Art.place('rabbit',194,119,160,-6)}${Art.place('fox',366,167,84,7)}${Art.place('flower',83,234,54,-12)}<g transform="translate(49 198) scale(.62)">${trainArt().replace(/<svg[^>]*>|<\/svg>/g,'')}</g><g fill="#c5a568"><path d="m170 61 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z"/><path d="m505 268 3 8 8 3-8 3-3 8-3-8-8-3 8-3Z"/></g></svg>`;
  }
  function renderHub(){
    const stamps=Object.keys(state.stamps).length;
    $('stampCount').textContent=`${stamps} / 15`;$('trainDisplay').innerHTML=trainArt();
    $('trainMessage').textContent=stamps===15?'15えき ぜんぶの スタンプ！ おまつりへ しゅっぱつしよう。':stamps?`${stamps}この せかいの おもいでが のったよ。つぎは どの えきへ いこう？`:'はじめは まっさら。あそんだ おもいでを、わごんに のせよう。';
    $('festivalButton').hidden=stamps!==15;
    $('resumeButton').hidden=!(state.route&&state.route.index<state.route.ids.length);
    const groups=['すべて',...new Set(catalog.map(g=>g.group))];
    $('filters').innerHTML=groups.map(group=>`<button data-filter="${group}" aria-pressed="${filter===group}">${group}</button>`).join('');
    $('stations').innerHTML=catalog.filter(g=>filter==='すべて'||g.group===filter).map(g=>`<button class="station-card" data-station="${g.id}" style="--station:${g.color}"><div class="station-photo"><img src="../thumbs/${g.id}.jpg" alt="" width="800" height="500" loading="lazy"><span class="station-tag">${g.group}</span>${state.stamps[g.id]?'<span class="visited-mark" aria-label="スタンプあり">✓</span>':''}</div><div class="station-body"><div class="station-name"><h3>${g.short}</h3><span>↗</span></div><p>${g.tag}</p><small>${g.name}</small></div></button>`).join('');
  }
  function ticket(game){
    current=game;const r=pendingRoute||state.route, index=r?.ids[r.index]===game.id?r.index:-1;
    $('ticketPhoto').innerHTML=`<img src="../thumbs/${game.id}.jpg" alt="" width="800" height="500"><span style="background:${game.color}">${game.group}</span>`;
    $('ticketKicker').textContent=index>=0?`ぼうけんの ${index+1} / ${r.ids.length} えきめ`:'すきな せかいへ、おでかけ';
    $('ticketTitle').textContent=game.short;$('ticketGoal').textContent=game.goal;$('ticketHint').textContent=(game.orientation==='landscape'?'スマホは よこむきが おすすめだよ。':'')+game.hint;$('ticketIcon').innerHTML=svg(game.icon);
    $('ticketDialog').showModal();say(`${game.short}へ ようこそ。${game.goal}`);
  }
  function single(id){pendingRoute={ids:[id],index:0,earned:[],progress:0};pendingPark=state.route?.ids.length>1&&state.route.index<state.route.ids.length?state.route:state.parkedRoute;ticket(byId(id));}
  function beginRoute(n){pendingRoute=E.plan(catalog,state.stamps,n);pendingPark=null;$('routeDialog').close();ticket(byId(pendingRoute.ids[0]));}
  function mission(){
    const r=state.route,complete=r.progress>=current.target;
    $('missionIcon').innerHTML=svg(complete?current.art:current.icon);
    $('missionBar').classList.toggle('achieved',complete);
    $('missionLabel').textContent=complete?'スタンプと かざりを ゲット！':'このえきの おねがい';
    $('missionText').textContent=showingHelp?current.hint:complete?`${current.reward}が れっしゃに のったよ。まだ あそんでも いいよ！`:current.goal;
    $('missionProgress').textContent=complete?'✓':`${r.progress} / ${current.target}`;
    $('missionNext').hidden=!complete;$('skipButton').textContent=complete?'つぎへ →':'つぎへ →';
  }
  function board(){
    if(!current||!(pendingRoute||state.route))return;
    if(pendingRoute){state.route=pendingRoute;state.parkedRoute=pendingPark;pendingRoute=null;pendingPark=null;}
    $('ticketDialog').close();stopVoice();showingHelp=false;observerReady=false;
    $('hub').hidden=true;$('playScreen').hidden=false;document.body.classList.add('playing');
    $('rideTitle').textContent=current.short;$('rideStop').textContent=`${state.route.index+1} / ${state.route.ids.length} えき · ${current.group}`;
    mission();offset=state.route.progress;state.visits++;save();
    visit=globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random()}`;
    $('frameLoading').hidden=false;$('loadingText').textContent='つぎの せかいへ、しゅっぱつ！';$('retryButton').hidden=true;
    frame=document.createElement('iframe');frame.title=current.name;frame.allow='autoplay; fullscreen; microphone';
    frame.referrerPolicy='same-origin';frame.src=`../${current.id}/?dream=1`;frame.id='gameFrame';
    const expected=new URL(frame.src,location.href).pathname;
    frame.addEventListener('load',()=>{
      if(!frame)return;
      try{
        if(frame.contentWindow.location.pathname!==expected){leaveToMap();return;}
        const bridge=frame.contentDocument.createElement('script');bridge.src=new URL(`./bridge.js?v=1&game=${current.id}&visit=${encodeURIComponent(visit)}`,location.href).href;
        bridge.onerror=()=>loadFailure();frame.contentDocument.body.append(bridge);
        $('frameLoading').hidden=true;clearTimeout(loadingTimer);
      }catch{loadFailure();}
    });
    $('frameSlot').replaceChildren(frame);
    loadingTimer=setTimeout(loadFailure,20000);
    $('leaveButton').focus({preventScroll:true});
  }
  function loadFailure(){if(!frame)return;$('frameLoading').hidden=false;$('loadingText').textContent='よみこみに じかんが かかっているよ。';$('retryButton').hidden=false;}
  async function closeFrame(){
    if(!frame)return;
    clearTimeout(loadingTimer);const f=frame;stopVoice();
    try{
      // Let every game's native autosave/pagehide routine run before its context is destroyed.
      const w=f.contentWindow;
      const final=w.dreamVisitProgress;
      if(final?.token===visit&&final.ready)captureProgress(final.count);
      const flush=[];
      flush.push(w.dreamFlush?.());
      if(current.id==='mori-itazura'&&w.game?.ui?.get().screen==='game')flush.push(w.game.save('dream-train'));
      if(current.id==='monster-echoes')flush.push(w.app?.game?.flushSave());
      if(current.id==='petapeta-craft')w.PT?.save?.saveWorld?.();
      if(current.id==='petapeta-town'){w.PT?.bus?.emit('beforeSave');w.PT?.save?.writeNow?.();}
      w.dispatchEvent(new w.Event('pagehide'));
      await Promise.race([Promise.allSettled(flush),new Promise(resolve=>setTimeout(resolve,2500))]);
    }catch{ /* Closed or unavailable original frame. Its own periodic save remains in place. */ }
    f.remove();if(frame===f)frame=null;$('frameSlot').replaceChildren();save();
  }
  function backToHub(){ $('playScreen').hidden=true;$('hub').hidden=false;document.body.classList.remove('playing');renderHub();window.scrollTo(0,0);$('resumeButton').hidden?$('departButton').focus({preventScroll:true}):$('resumeButton').focus({preventScroll:true}); }
  async function leaveToMap(){if(leaving)return;leaving=true;await closeFrame();backToHub();leaving=false;}
  async function nextStop(){
    if(leaving)return;leaving=true;await closeFrame();
    if(E.next(state)){save();backToHub();ticket(byId(state.route.ids[state.route.index]));}
    else {const finished=state.route;if(state.parkedRoute){state.route=state.parkedRoute;state.parkedRoute=null;}save();backToHub();journeySummary(finished);}
    leaving=false;
  }
  function journeySummary(finished){
    const r=finished||state.route,earned=r?.earned||[];
    $('journeyArt').innerHTML=svg(earned.length?'crown':'compass');
    $('journeyTitle').textContent=earned.length?'わくわく、あつまったね！':'また ぼうけんに いこうね！';
    $('journeyMessage').textContent=`${r?.ids.length||0}えきの たびで、${earned.length}この おねがいを かなえたよ。${earned.length?'かざりを のせて、おもいでの れっしゃを つくろう。':'つぎは どんな はっけんが あるかな？'}`;
    $('journeyStamps').innerHTML=earned.map(id=>`<span title="${byId(id).short}">${svg(byId(id).icon)}</span>`).join('');$('journeyDialog').showModal();say($('journeyTitle').textContent);
  }
  function captureProgress(count){
    const r=state.route;r.progress=Math.max(r.progress,Math.min(current.target,offset+count));
    E.award(state,current); // Do not interrupt the original game's narration.
    save();mission();
  }
  addEventListener('message',event=>{
    const m=event.data;
    if(!frame||event.source!==frame.contentWindow||event.origin!==location.origin||m?.channel!=='dream-train'||m.token!==visit||m.id!==current.id)return;
    if(m.type==='ready'){observerReady=true;return;}
    if(m.type!=='progress'||!Number.isSafeInteger(m.count)||m.count<0||m.count>10000||!observerReady||leaving)return;
    captureProgress(m.count);
  });
  function passport(){
    const n=Object.keys(state.stamps).length;$('passportMessage').textContent=`${n} / 15えきの おねがいを かなえたよ。${n===15?'にじいろの おまつりへ いこう！':'すきな じゅんばんに、あつめてね。'}`;
    $('passportGrid').innerHTML=catalog.map((g,i)=>`<article class="passport-stamp ${state.stamps[g.id]?'earned':''}"><small>STATION ${String(i+1).padStart(2,'0')}</small><span>${svg(g.icon)}</span><h3>${g.short}</h3><p>${state.stamps[g.id]?`たっせい ${state.stamps[g.id]}かい`:'まだの おたのしみ'}</p></article>`).join('');$('passportDialog').showModal();
  }
  function decorate(){selectedDecoration=null;renderDecorations();$('decorateDialog').showModal();}
  function renderDecorations(){
    $('decorationPreview').innerHTML=trainArt();
    $('carSlots').innerHTML=state.cars.map((id,i)=>`<button data-slot="${i}" aria-label="${i+1}ごうしゃに のせる"><small>${i+1}ごうしゃ</small><span>${id?svg(byId(id).art):'＋'}</span></button>`).join('');
    const unlocked=catalog.filter(g=>state.stamps[g.id]);
    $('decorationHint').textContent=unlocked.length?selectedDecoration==='empty'?'あけたい わごんを タッチ。':selectedDecoration?`${byId(selectedDecoration).reward}を、どの わごんに のせる？`:'かざりを えらんで、のせたい わごんを タッチ。':'えきの おねがいを かなえると、かざりが もらえるよ。';
    $('decorationItems').innerHTML=unlocked.map(g=>`<button data-decoration="${g.id}" aria-pressed="${selectedDecoration===g.id}">${svg(g.art)}<span>${g.reward}</span></button>`).join('')+(unlocked.length?`<button data-decoration="empty" aria-pressed="${selectedDecoration==='empty'}"><b>↶</b><span>おろす</span></button>`:'');
    document.querySelectorAll('[data-paint]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.paint===state.paint)));
  }
  function festival(){
    if(Object.keys(state.stamps).length!==15)return;
    $('festival').hidden=false;$('hub').inert=true;$('festivalTrain').innerHTML=trainArt(true);
    $('festivalGuests').innerHTML=catalog.map(g=>`<span>${svg(g.art)}<small>${g.short}</small></span>`).join('');
    const colors=['#f0ce86','#d5b2d8','#9dd5c5','#f1b6ac'];
    $('fireworks').innerHTML=Array.from({length:32},(_,i)=>`<i style="--x:${(i*29+7)%100}%;--y:${(i*17+12)%70}%;--delay:${i*.17}s;--spark:${colors[i%4]}">✦</i>`).join('');
    $('festivalClose').focus();say('15の せかいを めぐったね！ にじいろの おまつりを はじめよう！');
  }
  document.addEventListener('click',e=>{
    const close=e.target.closest('[data-close]');if(close)$(close.dataset.close).close();
    const station=e.target.closest('[data-station]');if(station)single(station.dataset.station);
    const f=e.target.closest('[data-filter]');if(f){filter=f.dataset.filter;renderHub();}
    const route=e.target.closest('[data-route]');if(route)beginRoute(Number(route.dataset.route));
    const deco=e.target.closest('[data-decoration]');if(deco){selectedDecoration=deco.dataset.decoration;renderDecorations();}
    const slot=e.target.closest('[data-slot]');if(slot&&selectedDecoration){state.cars[Number(slot.dataset.slot)]=selectedDecoration==='empty'?null:selectedDecoration;save();renderDecorations();renderHub();}
    const paint=e.target.closest('[data-paint]');if(paint){state.paint=paint.dataset.paint;save();renderDecorations();renderHub();}
  });
  $('departButton').onclick=()=>$('routeDialog').showModal();
  $('resumeButton').onclick=()=>{pendingRoute=null;pendingPark=null;const r=state.route;if(r&&r.index<r.ids.length)ticket(byId(r.ids[r.index]));};
  $('boardButton').onclick=board;$('leaveButton').onclick=leaveToMap;$('skipButton').onclick=nextStop;$('missionNext').onclick=nextStop;
  $('rideHelp').onclick=()=>{showingHelp=!showingHelp;mission();say($('missionText').textContent);};
  $('retryButton').onclick=async()=>{if(leaving)return;leaving=true;await closeFrame();leaving=false;board();};
  $('passportButton').onclick=passport;$('decorateButton').onclick=decorate;
  $('journeyDecorate').onclick=()=>{$('journeyDialog').close();decorate();};
  $('festivalButton').onclick=festival;$('festivalClose').onclick=()=>{$('festival').hidden=true;$('hub').inert=false;stopVoice();$('festivalButton').focus();};
  $('voiceButton').onclick=()=>{voice=!voice;updateVoice();try{localStorage.setItem(KEY+'.voice',String(voice));}catch{}if(voice)say('にじいろ ドリームトレインへ ようこそ。すきな えきへ いこう！');else stopVoice();};
  $('aboutButton').onclick=()=>$('aboutDialog').showModal();
  addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden){save();stopVoice();}});
  $('coverageList').innerHTML=catalog.map(g=>`<details><summary>${g.name}</summary><p>${g.features}</p><p>旅の小目標：${g.goal}</p></details>`).join('');
  document.querySelectorAll('[data-icon]').forEach(el=>el.innerHTML=svg(el.dataset.icon));
  $('heroArt').innerHTML=heroArt();updateVoice();renderHub();
})();

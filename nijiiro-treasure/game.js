/* Static, dependency-free treasure hunt for small children. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const SAVE_KEY = 'nijiiro-treasure.v1';
  const islands = [
    { name: 'こもれびの もり', type: 'forest', intro: 'ことりが うたう、ひみつの もり。', badge: 'こもれび ぽかぽか', objects: [
      ['mushroom', 'きのこ', 'きのこの したを さがしてね。'], ['stump', 'きりかぶ', 'きりかぶの なかを さがしてね。'], ['flower', 'おはな', 'おはなの そばを さがしてね。'], ['bush', 'きのみ', 'きのみの しげみを さがしてね。'], ['rock', 'いし', 'いしの うしろを さがしてね。'], ['log', 'まるた', 'まるたの したを さがしてね。']
    ], prizes: [0, 1, 2] },
    { name: 'きらきらの はまべ', type: 'beach', intro: 'なみの むこうに、なにが ある？', badge: 'なみの おと ざぶーん', objects: [
      ['shell', 'かいがら', 'かいがらの したを さがしてね。'], ['bucket', 'バケツ', 'バケツの なかを さがしてね。'], ['castle', 'すなのおしろ', 'すなの おしろを さがしてね。'], ['coral', 'さんご', 'さんごの そばを さがしてね。'], ['bottle', 'びん', 'びんの そばを さがしてね。'], ['starfish', 'ひとで', 'ひとでの そばを さがしてね。']
    ], prizes: [3, 4, 5] },
    { name: 'ふわふわの そら', type: 'sky', intro: 'にじを わたって、くもの うえ。', badge: 'くもに のって ふわふわ', objects: [
      ['cloud', 'くも', 'にっこり くもの なかを さがしてね。'], ['moon', 'おつきさま', 'おつきさまの そばを さがしてね。'], ['star', 'おほしさま', 'おほしさまの うしろを さがしてね。'], ['balloon', 'ふうせん', 'ふうせんの したを さがしてね。'], ['rainbow', 'にじ', 'ちいさな にじの したを さがしてね。'], ['house', 'おうち', 'おうちの なかを さがしてね。']
    ], prizes: [6, 7, 8] }
  ];
  const prizes = [
    { art: 'gem', name: 'もりの しずく', text: 'はっぱの いろの、きらきら ほうせき。' },
    { art: 'flower', name: 'おひさまの おはな', text: 'いつでも にっこり、げんきな おはな。' },
    { art: 'crown', name: 'もりの おうかん', text: 'どうぶつたちからの プレゼント！' },
    { art: 'pearl', name: 'にじいろ しんじゅ', text: 'うみが そだてた、まあるい たからもの。' },
    { art: 'shell', name: 'うたう かいがら', text: 'ざぶーん。うみの うたが きこえるよ。' },
    { art: 'compass', name: 'ぼうけんの コンパス', text: 'つぎの わくわくは、どっちかな？' },
    { art: 'star', name: 'おほしさまの かけら', text: 'よぞらから とどいた、ひかる おほしさま。' },
    { art: 'rainbow', name: 'ちいさな にじ', text: 'あめの あとも、えがおに なれるね。' },
    { art: 'heart', name: 'そらの ハート', text: 'ぼうけんした きみへ、ありがとう！' }
  ];
  let collection = [], session = null, sound = false, screen = 'home';
  let busy = false, mistakes = 0, hintTimer, advanceTimer, audio;
  let lastIsland = 0, returnFocus = null;
  const shuffle = items => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };
  function validSession(s) {
    const indices = a => Array.isArray(a) && a.every(i => Number.isInteger(i) && i >= 0 && i < 6);
    return s && Number.isInteger(s.island) && s.island >= 0 && s.island < 3 &&
      indices(s.order) && s.order.length === 6 && new Set(s.order).size === 6 &&
      indices(s.targets) && s.targets.length === 3 && new Set(s.targets).size === 3 &&
      Number.isInteger(s.found) && s.found >= 0 && s.found <= 3;
  }
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(SAVE_KEY));
      if (!saved || saved.version !== 1) return;
      if (Array.isArray(saved.collection)) collection = [...new Set(saved.collection.filter(i => Number.isInteger(i) && i >= 0 && i < prizes.length))];
      if (validSession(saved.session)) session = saved.session;
      sound = saved.sound === true;
    } catch { /* Malformed or unavailable storage must never prevent play. */ }
  }
  function save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify({ version: 1, collection, session, sound }));
      $('storageNotice').hidden = true;
    } catch { $('storageNotice').hidden = false; }
  }
  function unlockAudio() {
    if (!sound) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!audio && AudioContext) audio = new AudioContext();
      if (audio?.state === 'suspended') audio.resume().catch(() => {});
    } catch { /* Audio is optional. */ }
  }
  function chime(kind) {
    if (!sound) return;
    unlockAudio();
    if (!audio) return;
    const tones = kind === 'win' ? [523, 659, 784, 1047] : kind === 'key' ? [659, 880, 1047] : [440, 554];
    try {
      tones.forEach((hz, i) => {
        const o = audio.createOscillator(), g = audio.createGain(), t = audio.currentTime + i * .12;
        o.type = 'sine'; o.frequency.value = hz;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.09, t + .015); g.gain.exponentialRampToValueAtTime(.001, t + .32);
        o.connect(g); g.connect(audio.destination); o.start(t); o.stop(t + .35);
      });
    } catch { /* The visual celebration is always available. */ }
  }
  function say(text) {
    if (!sound || document.hidden || !('speechSynthesis' in window) || !window.SpeechSynthesisUtterance) return;
    try {
      speechSynthesis.cancel();
      const speech = new SpeechSynthesisUtterance(text);
      speech.lang = 'ja-JP'; speech.rate = .85; speech.pitch = 1.15;
      const voice = speechSynthesis.getVoices().find(v => v.lang.startsWith('ja'));
      if (voice) speech.voice = voice;
      speechSynthesis.speak(speech);
    } catch { /* Speech availability varies by browser and OS. */ }
  }
  function stopSpeech() { if ('speechSynthesis' in window) speechSynthesis.cancel(); }
  function updateSound() {
    $('soundButton').setAttribute('aria-pressed', String(sound));
    $('soundButton').setAttribute('aria-label', sound ? 'おとを けす' : 'おとを つける');
    $('soundIcon').textContent = sound ? '♫' : '♪';
    $('soundLabel').textContent = sound ? 'おと オン' : 'おと オフ';
  }
  function setSound(enabled) {
    sound = enabled; updateSound(); save();
    if (!sound) { stopSpeech(); if (audio) audio.suspend().catch(() => {}); }
    else unlockAudio();
  }
  function countIsland(i) { return islands[i].prizes.filter(p => collection.includes(p)).length; }
  function renderMap() {
    $('albumCount').textContent = `${collection.length} / 9`;
    $('islands').innerHTML = islands.map((island, i) => `<button class="island-card" data-island="${i}" aria-label="${island.name}${session?.island === i ? '、つづきから' : 'で あそぶ'}"><div class="island-preview"><div class="landscape">${Art.landscape(island.type)}</div>${Art.svg(island.objects[0][0], 'mini-object')}${Art.svg('chest', 'mini-chest')}<span class="island-number">0${i + 1}</span></div><div class="island-copy"><div><h3>${island.name}</h3><p>${session?.island === i ? `つづきから · かぎ ${session.found} / 3` : island.intro}<br>たからもの ${countIsland(i)} / 3</p></div><span class="island-arrow" aria-hidden="true">↗</span></div></button>`).join('');
  }
  function clearTimers() { clearTimeout(hintTimer); clearTimeout(advanceTimer); }
  function home() {
    clearTimers(); stopSpeech(); busy = false; screen = 'home';
    $('home').hidden = false; $('play').hidden = true; renderMap();
    window.scrollTo(0, 0);
    const card = document.querySelector(`[data-island="${lastIsland}"]`);
    card?.focus({ preventScroll: true });
  }
  function start(islandIndex) {
    clearTimers(); unlockAudio(); busy = false; mistakes = 0;
    if (session?.island !== islandIndex) session = { island: islandIndex, order: shuffle([0, 1, 2, 3, 4, 5]), targets: shuffle([0, 1, 2, 3, 4, 5]).slice(0, 3), found: 0 };
    lastIsland = islandIndex; screen = 'play'; save();
    $('home').hidden = true; $('play').hidden = false;
    const island = islands[islandIndex];
    $('islandTitle').textContent = island.name;
    $('scenery').innerHTML = Art.landscape(island.type);
    $('sceneBadge').textContent = island.badge;
    $('scene').setAttribute('aria-label', `${island.name}の たからさがし`);
    renderRound(); window.scrollTo(0, 0);
    $('mapButton').focus({ preventScroll: true });
    say(session.found === 3 ? 'かぎが そろったよ。たからばこを タッチしてね。' : `${island.name}へ ようこそ。${currentClue()[2]}`);
  }
  function currentClue() { return islands[session.island].objects[session.targets[session.found]]; }
  function scheduleHint() {
    clearTimeout(hintTimer);
    if (screen !== 'play' || !session || session.found === 3 || $('albumDialog').open || document.hidden) return;
    hintTimer = setTimeout(() => hint(false), 12000);
  }
  function renderRound() {
    const ready = session.found === 3, island = islands[session.island];
    $('scene').classList.toggle('ready', ready);
    $('spots').innerHTML = session.order.map((id, pos) => {
      const got = session.targets.slice(0, session.found).includes(id), obj = island.objects[id];
      return `<button class="spot${got ? ' checked' : ''}" data-spot="${id}" style="--x:${[20, 50, 80][pos % 3]}%;--y:${pos < 3 ? 44 : 77}%" aria-label="${obj[1]}${got ? '、かぎを みつけたよ' : 'を しらべる'}" ${got || ready ? 'disabled' : ''}>${Art.svg(obj[0])}<span class="spot-label">${obj[1]}</span></button>`;
    }).join('');
    $('keys').innerHTML = [0, 1, 2].map(i => `<span class="key-slot${i < session.found ? ' got' : ''}" aria-label="${i + 1}こめの かぎ${i < session.found ? '、みつけた' : '、まだ'}">${i < session.found ? Art.svg('key') : i + 1}</span>`).join('');
    $('chestButton').hidden = !ready;
    $('hintButton').disabled = ready;
    $('islandStep').textContent = ready ? 'たからばこを あけよう！' : `かぎ ${session.found} / 3`;
    $('guideTitle').textContent = ready ? 'かぎが そろったよ！' : 'ここを さがしてね';
    if (ready) {
      $('clue').innerHTML = `${Art.svg('chest')}<p>たからばこ！</p>`;
      $('message').textContent = 'やったね！\nたからばこを タッチしよう。';
    } else {
      const [art, name, text] = currentClue();
      $('clue').innerHTML = `${Art.svg(art)}<p>${name}</p><p class="clue-note">おなじ えを さがそう</p>`;
      $('message').textContent = text;
    }
    scheduleHint();
  }
  function burst(button) {
    const scene = $('scene').getBoundingClientRect(), rect = button.getBoundingClientRect();
    const x = rect.x - scene.x + rect.width / 2, y = rect.y - scene.y + rect.height / 2;
    for (let i = 0; i < 18; i++) {
      const p = document.createElement('i'); p.className = 'particle';
      p.style.cssText = `--x:${x}px;--y:${y}px;--dx:${Math.cos(i * 2.4) * (65 + i * 3)}px;--dy:${Math.sin(i * 2.4) * 80 + 30}px;--color:${['#e4b76e', '#e4a99f', '#a2b99a', '#c2b4d4'][i % 4]}`;
      $('sparkles').append(p); setTimeout(() => p.remove(), 1200);
    }
  }
  function inspect(button) {
    if (busy || screen !== 'play' || !session || session.found === 3 || button.disabled) return;
    unlockAudio();
    const id = Number(button.dataset.spot);
    if (id !== session.targets[session.found]) {
      mistakes++;
      button.disabled = true;
      button.classList.add('checked');
      button.setAttribute('aria-label', `${islands[session.island].objects[id][1]}、ここには かぎは なかったよ`);
      button.querySelector('.spot-label').textContent = 'みたよ';
      $('message').textContent = ['ここには なかったね。\nつぎは どこかな？', 'だいじょうぶ！\nひかる ところを みてみよう。'][Math.min(mistakes - 1, 1)];
      chime('tap');
      say($('message').textContent);
      if (mistakes >= 2) hint(false);
      return;
    }
    const focusedSpot = document.activeElement === button;
    busy = true; clearTimeout(hintTimer); session.found++; save();
    button.classList.remove('hinted'); button.classList.add('found'); button.innerHTML = `${Art.svg('key')}<span class="spot-label">みつけた！</span>`;
    button.disabled = true;
    $('message').textContent = `かぎを ${session.found}こ みつけたよ！`;
    chime('key'); burst(button); say($('message').textContent);
    advanceTimer = setTimeout(() => {
      busy = false; mistakes = 0; renderRound();
      if (session.found === 3) {
        $('chestButton').focus({ preventScroll: true });
        say('かぎが そろったよ！ たからばこを タッチしてね。');
      } else {
        if (focusedSpot) document.querySelector('.spot:not(:disabled)')?.focus({ preventScroll: true });
        say(currentClue()[2]);
      }
    }, 1000);
  }
  function hint(withVoice = true) {
    if (busy || screen !== 'play' || !session || session.found >= 3 || $('albumDialog').open) return;
    clearTimeout(hintTimer);
    document.querySelector(`[data-spot="${session.targets[session.found]}"]`)?.classList.add('hinted');
    $('message').textContent = `${currentClue()[2]}\nひかる ところを タッチ！`;
    if (withVoice) say($('message').textContent);
  }
  function openChest() {
    if (busy || !session || session.found !== 3) return;
    busy = true; clearTimers(); lastIsland = session.island;
    const candidates = islands[lastIsland].prizes.filter(id => !collection.includes(id));
    const prizeId = shuffle(candidates.length ? candidates : islands[lastIsland].prizes)[0], prize = prizes[prizeId];
    const isNew = !collection.includes(prizeId);
    if (isNew) collection.push(prizeId);
    session = null; save(); renderMap();
    $('rewardArt').innerHTML = Art.svg(prize.art);
    $('rewardTitle').textContent = prize.name;
    $('rewardText').textContent = `${prize.text}\n${collection.length === 9 ? '9この たからもの、ぜんぶ みつけたね！' : isNew ? 'たからもの ずかんに なかまいり！' : 'また であえたね！ なんどでも たからさがし。'}`;
    $('rewardNext').textContent = collection.length === 9 ? 'もういちど あそぶ →' : 'つぎの しまへ →';
    $('rewardDialog').showModal(); chime('win');
    say(`たからばこが あいたよ！ ${prize.name}を みつけたね。${collection.length === 9 ? 'ぜんぶ あつまったよ！ おめでとう！' : ''}`);
  }
  function renderAlbum() {
    $('albumMessage').textContent = collection.length === 9 ? 'ぜんぶ あつまったね！ きみは たからさがしの めいじん！' : `${collection.length} / 9 この たからもの。しまごとに 3つ あるよ。`;
    $('albumGrid').innerHTML = prizes.map((prize, id) => {
      const got = collection.includes(id);
      return `<article class="treasure-card${got ? '' : ' unknown'}">${got ? Art.svg(prize.art) : '<div class="unknown-art" aria-hidden="true">？</div>'}<h3>${got ? prize.name : 'なにが あるかな？'}</h3><p>${islands[Math.floor(id / 3)].name}</p></article>`;
    }).join('');
  }
  $('islands').addEventListener('click', e => { const card = e.target.closest('[data-island]'); if (card) start(Number(card.dataset.island)); });
  $('spots').addEventListener('click', e => { const spot = e.target.closest('[data-spot]'); if (spot) inspect(spot); });
  $('mapButton').addEventListener('click', home);
  $('hintButton').addEventListener('click', () => hint());
  $('listenButton').addEventListener('click', () => {
    if (!sound) setSound(true);
    say(session?.found === 3 ? 'たからばこを タッチしてね。' : session ? currentClue()[2] : 'すきな しまを タッチしてね。');
  });
  $('soundButton').addEventListener('click', () => {
    setSound(!sound);
    if (sound) say(screen === 'play' && session ? session.found === 3 ? 'たからばこを タッチしてね。' : currentClue()[2] : 'ぴょんたと たからさがし。すきな しまを タッチしてね。');
  });
  $('chestButton').addEventListener('click', openChest);
  // A close event also covers Escape and keeps the finished scene from becoming a dead end.
  let nextAfterReward = false;
  $('rewardNext').addEventListener('click', () => { nextAfterReward = true; $('rewardDialog').close(); });
  $('rewardHome').addEventListener('click', () => $('rewardDialog').close());
  $('rewardDialog').addEventListener('close', () => {
    const next = nextAfterReward; nextAfterReward = false;
    if (next) start((lastIsland + 1) % islands.length); else home();
  });
  $('albumButton').addEventListener('click', () => {
    // Complete the short key animation before pausing so no stale transition runs behind the dialog.
    if (busy && session) { clearTimeout(advanceTimer); busy = false; mistakes = 0; renderRound(); }
    clearTimeout(hintTimer); stopSpeech(); returnFocus = document.activeElement; renderAlbum(); $('albumDialog').showModal();
  });
  $('albumClose').addEventListener('click', () => $('albumDialog').close());
  $('albumDialog').addEventListener('close', () => { returnFocus?.focus({ preventScroll: true }); scheduleHint(); });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { stopSpeech(); clearTimeout(hintTimer); if (audio) audio.suspend().catch(() => {}); }
    else scheduleHint();
  });
  load();
  document.querySelectorAll('[data-art]').forEach(el => { el.innerHTML = Art.svg(el.dataset.art); });
  $('welcomeArt').innerHTML = Art.welcome();
  updateSound(); renderMap();
})();

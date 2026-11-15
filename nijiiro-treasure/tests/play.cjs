const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const base=process.env.TREASURE_TEST_URL||'http://127.0.0.1:8766/nijiiro-treasure/';
const artifacts=fs.mkdtempSync(path.join(os.tmpdir(),'nijiiro-expedition-'));
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
 try{
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
  const page=await context.newPage(),errors=[],failures=[];
  page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)failures.push(r.url());});
  await page.goto(base);
  const wait=()=>page.waitForTimeout(100);
  const tap=async(selector)=>{await page.locator(selector).tap();await wait();};
  const object=id=>tap(`[data-object="${id}"]`);
  const area=i=>tap(`button[data-area="${i}"]`);
  const close=async(id,button)=>{
   await Promise.all([page.evaluate(id=>new Promise(resolve=>document.getElementById(id).addEventListener('close',()=>resolve(),{once:true})),id),button?page.locator(button).tap():page.keyboard.press('Escape')]);
  };
  const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('nijiiro-treasure.v2')));
  // Retain v1 rewards, then begin the new game in an independent fresh context.
  const migration=await context.newPage();
  await migration.goto(base);await migration.evaluate(()=>localStorage.setItem('nijiiro-treasure.v1',JSON.stringify({version:1,collection:[0,4,8,8,99],sound:false,session:{island:0,found:2}})));
  await migration.reload();assert.equal(await migration.locator('#albumCount').innerText(),'3 / 9');
  await migration.locator('[data-island="0"]').tap();await migration.waitForTimeout(100);
  assert.deepEqual((await migration.evaluate(()=>JSON.parse(localStorage.getItem('nijiiro-treasure.v2')))).collection,[0,4,8]);
  await migration.evaluate(()=>localStorage.clear());await migration.close();await page.reload();
  await page.screenshot({path:path.join(artifacts,'home-phone.png')});
  await tap('[data-island="0"]');
  await area(2);assert.equal(await page.locator('#scene').getAttribute('data-area'),'0','Bridge blocks the third area');
  await object('friend');assert.match(await page.locator('#message').innerText(),/きのみ/);
  // Hint is progressive and never lights the answer automatically.
  await tap('#hintButton');assert.match(await page.locator('#message').innerText(),/はなしかけて/);
  assert.equal(await page.locator('.hinted').count(),0);
  // Progress survives changing islands, not just a page reload.
  await object('board0');await tap('#mapButton');await tap('[data-island="1"]');await object('board0');
  await tap('#mapButton');await tap('[data-island="0"]');assert.match(await page.locator('[data-item="boards"]').innerText(),/1 \/ 3/);
  await page.reload();await tap('[data-island="0"]');assert.match(await page.locator('[data-item="boards"]').innerText(),/1 \/ 3/);
  async function secrets(){const ids=await page.locator('.secret-object').evaluateAll(es=>es.map(e=>e.dataset.object));for(const id of ids)await object(id);}
  async function helpFriend(){
   await area(0);await secrets();
   for(let i=0;i<3;i++)await object('cover'+i);
   assert.equal(await page.locator('[data-item="gift"]').count(),1);
   await object('friend');assert.equal(await page.locator('[data-item="shovel"]').count(),0,'Gift must be selected to use');
   await tap('[data-item="gift"]');await object('friend');
   assert.equal(await page.locator('[data-item="shovel"]').count(),1);
   await object('board0');
  }
  async function repairBridge(testInterrupt=false){
   await area(1);await secrets();await object('board1');await object('board2');
   await object('bridge');assert.equal(await page.locator('#puzzleDialog').evaluate(e=>e.open),false,'Boards must be selected');
   await tap('[data-item="boards"]');await object('bridge');
   await tap('[data-board="0"]');await tap('[data-slot="2"]');assert.equal(await page.locator('.bridge-slot.filled').count(),0,'Wrong board cannot repair bridge');
   await tap('[data-slot="0"]');
   if(testInterrupt){await close('puzzleDialog','#puzzleClose');await object('bridge');assert.equal(await page.locator('.bridge-slot.filled').count(),1,'Partial bridge retained');}
   for(const id of [1,2]){await tap(`[data-board="${id}"]`);await tap(`[data-slot="${id}"]`);}
   await close('puzzleDialog','#puzzleDone');
   await area(2);assert.equal(await page.locator('#scene').getAttribute('data-area'),'2');
   await object('dig0');assert.match(await page.locator('#message').innerText(),/ちずが まだ/,'Cannot skip puzzle by digging');
   await area(1);
  }
  async function solveChallenge(island,testInterrupt=false){
   await object('challenge');
   if(island===0){
    if(testInterrupt){await tap('#playMelody');await close('puzzleDialog','#puzzleClose');await object('challenge');assert.equal(await page.locator('.music-progress .filled').count(),0);}
    for(let round=0;round<2;round++){
     await tap('#musicHint');
     const sequence=await page.evaluate(()=>[...document.querySelectorAll('#melodyHint svg')].map(svg=>[...document.querySelectorAll('[data-note] svg')].findIndex(note=>note.innerHTML===svg.innerHTML)));
     assert.equal(sequence.length,3+round);assert.ok(sequence.every(n=>n>=0));
     await tap('[data-note="0"]');assert.equal(await page.locator('.music-progress .filled').count(),0,'Listen before attempting');
     await tap('#playMelody');await page.waitForFunction(()=>document.getElementById('puzzleStatus').textContent==='つぎは きみの ばん！');
     await tap(`[data-note="${(sequence[0]+1)%4}"]`);assert.equal(await page.locator('.music-progress .filled').count(),0);
     for(const n of sequence)await tap(`[data-note="${n}"]`);
    }
   }else if(island===1){
    await tap('#fishingHint');
    while(await page.locator('#catchFish').count()){
     await page.waitForFunction(()=>{const meter=document.querySelector('.fishing-meter'),zone=document.querySelector('.catch-zone');if(!meter||!zone)return false;const x=Number(meter.getAttribute('aria-valuenow')),left=parseFloat(zone.style.left),w=parseFloat(zone.style.width);return x>left+5&&x<left+w-5;});
     await tap('#catchFish');await page.waitForTimeout(750);
     if(testInterrupt&&await page.locator('#catchFish').count()){testInterrupt=false;const count=await page.locator('.catch-count').innerText();await close('puzzleDialog','#puzzleClose');await object('challenge');assert.equal(await page.locator('.catch-count').innerText(),count);await tap('#fishingHint');}
    }
   }else{
    for(let i=0;i<3;i++){let n=0;while(!(await page.locator(`[data-pipe="${i}"]`).getAttribute('class')).includes('flowing')){await tap(`[data-pipe="${i}"]`);assert.ok(++n<=4,'Pipe has reachable alignment');}}
   }
   await page.locator('#puzzleDone').waitFor({state:'visible'});
   if(testInterrupt)await page.screenshot({path:path.join(artifacts,'puzzle-'+island+'.png')});
   await close('puzzleDialog','#puzzleDone');
   assert.equal(await page.locator('.map-piece.collected').count(),3);
  }
  async function findTreasure(testInterrupt=false){
   await area(2);await secrets();
   await tap('#journalButton');
   const target=await page.evaluate(()=>{
    const a=[...document.querySelectorAll('.map-landmarks svg')].map(e=>e.innerHTML);
    return [...document.querySelectorAll('[data-object^="dig"]')].find(b=>{const pair=[...b.querySelectorAll('.landmark svg')].map(e=>e.innerHTML);return pair[0]===a[0]&&pair[1]===a[1];})?.dataset.object;
   });assert.ok(target,'Map landmarks identify a digging site');
   await close('journalDialog','#journalClose');
   await object(target);assert.match(await page.locator('#message').innerText(),/スコップを えらんで/);
   await tap('[data-item="shovel"]');
   const wrong='dig'+((Number(target.slice(3))+1)%3);await object(wrong);assert.equal(await page.locator('#puzzleDialog').evaluate(e=>e.open),false,'Wrong landmarks do not uncover chest');
   await object(target);
   await tap('[data-soil="0"]');await tap('[data-soil="1"]');await tap('[data-soil="2"]');
   if(testInterrupt){await close('puzzleDialog','#puzzleClose');await page.reload();const data=await state();const island=data.expeditions.findIndex(e=>e?.dug.length===3);await tap(`[data-island="${island}"]`);await tap('[data-item="shovel"]');await object(target);assert.equal(await page.locator('.soil.dug').count(),3);}
   if(testInterrupt){
    const boxes=await Promise.all([3,4,5,6].map(id=>page.locator(`[data-soil="${id}"]`).boundingBox()));
    await page.mouse.move(boxes[0].x+boxes[0].width/2,boxes[0].y+boxes[0].height/2);await page.mouse.down();
    for(const box of boxes.slice(1))await page.mouse.move(box.x+box.width/2,box.y+box.height/2,{steps:6});
    await page.mouse.up();await wait();
   }else for(const id of [3,4,5,6])await tap(`[data-soil="${id}"]`);
   assert.equal(await page.locator('#openTreasure').isVisible(),true);
   await tap('#openTreasure');assert.equal(await page.locator('#rewardDialog').evaluate(e=>e.open),true);
  }
  // Nine complete adventures exercise all unique challenges, alternate route order and rewards.
  for(let trip=0;trip<9;trip++){
   const island=trip%3;
   if(trip)await close('rewardDialog','#rewardNext');
   await helpFriend();await repairBridge(trip===0);await solveChallenge(island,trip<3);await findTreasure(trip===0);
   assert.equal(await page.locator('#albumCount').innerText(),`${trip+1} / 9`);
   console.log(`PASS: expedition ${trip+1}, island ${island+1}, all tools/bridge/challenge/digging, reward ${trip+1}/9`);
  }
  await page.screenshot({path:path.join(artifacts,'reward.png')});
  await close('rewardDialog');await tap('#albumButton');
  assert.equal(await page.locator('.treasure-card:not(.unknown)').count(),9);assert.match(await page.locator('#albumMessage').innerText(),/15 \/ 15/);
  await close('albumDialog','#albumClose');await page.reload();assert.equal(await page.locator('#albumCount').innerText(),'9 / 9');
  // Default motion: movement can be interrupted safely and does not act in another area.
  await page.emulateMedia({reducedMotion:'no-preference'});await tap('[data-island="0"]');await page.locator('[data-object="board0"]').tap();await area(1);await page.waitForTimeout(500);
  assert.deepEqual((await state()).expeditions[0].boards,[],'Changing areas cancels a pending interaction');
  await page.emulateMedia({reducedMotion:'reduce'});
  // Phone/tablet/desktop layouts: navigation, hit regions and no horizontal overflow.
  for(const [width,height] of [[320,568],[390,844],[680,900],[844,390],[820,1180],[1440,1000]]){
   await page.setViewportSize({width,height});await wait();
   const layout=await page.evaluate(()=>{const r=document.getElementById('scene').getBoundingClientRect();return{overflow:document.documentElement.scrollWidth>innerWidth,valid:[...document.querySelectorAll('.world-object')].every(e=>{const b=e.getBoundingClientRect();return b.width>=44&&b.height>=44&&b.left>=r.left-1&&b.right<=r.right+1&&b.top>=r.top&&b.bottom<=r.bottom;}),nav:[...document.querySelectorAll('button[data-area]')].every(e=>e.getBoundingClientRect().height>=44)};});
   assert.deepEqual(layout,{overflow:false,valid:true,nav:true},`Layout ${width}×${height}`);
   await page.screenshot({path:path.join(artifacts,`play-${width}.png`),fullPage:true});
   await tap('#mapButton');assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Home fits');await tap('[data-island="0"]');
  }
  // Keyboard activation, sound and unavailable APIs.
  await page.locator('[data-object="board1"]').focus();await page.keyboard.press('Enter');await wait();assert.equal((await state()).expeditions[0].boards.includes(1),true);
  await tap('#listenButton');assert.equal(await page.locator('#soundButton').getAttribute('aria-pressed'),'true');await tap('#soundButton');
  // Invalid state is rejected without losing valid collected treasures.
  await page.evaluate(()=>localStorage.setItem('nijiiro-treasure.v2',JSON.stringify({version:2,collection:[0,0,8,99],expeditions:[{island:0,area:2,bridge:false}]})));
  await page.reload();assert.equal(await page.locator('#albumCount').innerText(),'2 / 9');await tap('[data-island="0"]');assert.equal(await page.locator('#scene').getAttribute('data-area'),'0');
  const blocked=await context.newPage();blocked.on('pageerror',e=>errors.push(e.message));await blocked.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('denied');};Storage.prototype.setItem=()=>{throw Error('full');};window.SpeechSynthesisUtterance=undefined;window.AudioContext=undefined;});
  await blocked.goto(base);await blocked.locator('[data-island="0"]').tap();await blocked.locator('#listenButton').tap();assert.equal(await blocked.locator('#storageNotice').isVisible(),true);await blocked.locator('[data-object="board0"]').tap();await blocked.waitForTimeout(200);assert.equal(await blocked.locator('[data-item="boards"]').count(),1);
  assert.deepEqual(errors,[],'No browser exceptions');assert.deepEqual(failures,[],'No missing assets');
  console.log('PASS: migration, all 9 rewards, 15 secrets, partial puzzle resume, island switching, hints, interrupted movement, keyboard, audio fallback, storage fallback, 6 layouts.');console.log('Screenshots:',artifacts);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

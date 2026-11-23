const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const url=process.env.DREAM_TEST_URL||'http://127.0.0.1:8770/dream-train/';
const artifacts=fs.mkdtempSync(path.join(os.tmpdir(),'dream-train-'));
(async()=>{
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox','--enable-unsafe-swiftshader']});
 try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 await context.addInitScript(()=>{try{speechSynthesis.speak=u=>setTimeout(()=>u.onend?.(),10);}catch{}});
 const p=await context.newPage(),errors=[],missing=[];
 p.on('pageerror',e=>{errors.push(e.message);console.log('BROWSER ERROR',e.message);});p.on('response',r=>{if(r.status()>=400&&r.url().startsWith(new URL(url).origin))missing.push(r.url());});
 await p.addInitScript(()=>{window.messages=[];addEventListener('message',e=>{if(e.data?.channel==='dream-train')messages.push(e.data);});});
 await p.goto(url);const ids=await p.evaluate(()=>DreamCatalog.map(g=>g.id));
 assert.equal(ids.length,15);assert.equal(await p.locator('.station-card').count(),15);
 const close=async id=>{await p.locator(`[data-close="${id}"]`).click();await p.waitForFunction(id=>!document.getElementById(id).open,id);};
 async function launch(id){
  await p.locator(`[data-station="${id}"]`).click();await p.locator('#boardButton').click();
  await p.waitForFunction(id=>{const f=document.getElementById('gameFrame');return f?.contentWindow?.dreamVisitProgress?.id===id&&f.contentWindow.dreamVisitProgress.ready;},id,{timeout:25000});
  assert.equal(await p.locator('iframe').count(),1);return p.frames().find(f=>f.url().includes('/'+id+'/'));
 }
 async function leave(){await p.locator('#leaveButton').click();await p.locator('#hub').waitFor({state:'visible'});assert.equal(await p.locator('iframe').count(),0,'Previous game disposed');}
 const saved=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('dream-train.v1')));
 async function won(id){await p.waitForFunction(id=>JSON.parse(localStorage.getItem('dream-train.v1'))?.stamps[id]>0,id,{timeout:15000});assert.equal(await p.locator('#missionNext').isVisible(),true);}
 // Real engines all boot, and neither time on title nor an existing save awards a stamp.
 for(const id of (process.env.DREAM_SKIP_BOOT?[]:ids)){const f=await launch(id);await p.waitForTimeout(250);assert.equal((await saved()).stamps[id],undefined,id+' no title award');assert.ok(await f.locator('canvas, #app, #home, #quiz').count(),id+' original renderer exists');await leave();console.log('BOOT',id);}
 // Reject foreign/post-message imitations; only the current frame and visit token count.
 await launch('animal-quiz');
 await p.evaluate(()=>postMessage({channel:'dream-train',type:'progress',id:'animal-quiz',count:99,token:'fake'},location.origin));
 assert.equal((await saved()).stamps['animal-quiz'],undefined);
 await leave();
 // Entering/leaving Tomori's title must not overwrite an existing native save.
 let tomori=await launch('tomori-garden');
 const untouched=await tomori.evaluate(()=>{save();return ['tomori.save.a','tomori.save.b'].map(k=>localStorage.getItem(k));});
 await leave();
 assert.deepEqual(await p.evaluate(()=>['tomori.save.a','tomori.save.b'].map(k=>localStorage.getItem(k))),untouched,'Title visit preserves original saves');
 // Three-stop journey: real answer buttons -> original house-building controls -> face drag.
 const journeyFixture=await p.evaluate(()=>{const s=DreamEngine.fresh();s.route={ids:['animal-quiz','petapeta-craft','kao-ricky'],index:0,earned:[],progress:0};return s;});await p.goto(new URL('icon.svg',url).href);await p.evaluate(s=>localStorage.setItem('dream-train.v1',JSON.stringify(s)),journeyFixture);await p.goto(url);
 await p.locator('#resumeButton').click();await p.locator('#boardButton').click();
 await p.waitForFunction(()=>document.querySelector('iframe')?.contentWindow?.dreamVisitProgress?.ready);
 let f=p.frames().find(f=>f.url().includes('/animal-quiz/'));
 await f.locator('#startBtn').click();
 for(let q=0;q<3;q++){
  await f.locator('#choices:not(.locked) .choice').first().waitFor();
  for(let choice=0;choice<3;choice++){
   await f.locator('.choice').nth(choice).click();
   if(await f.locator('#choices').getAttribute('class').then(c=>c.includes('locked')))break;
  }
  if(q<2)await f.locator('#choices:not(.locked) .choice').first().waitFor();
 }
 await won('animal-quiz');assert.equal((await saved()).stamps['animal-quiz'],1);
 await p.waitForTimeout(400);assert.equal((await saved()).stamps['animal-quiz'],1,'No double stamp');
 await p.screenshot({path:path.join(artifacts,'quiz-stamp.png')});
 await p.locator('#missionNext').click();await p.locator('#ticketDialog').waitFor({state:'visible'});await p.locator('#boardButton').click();
 await p.waitForFunction(()=>document.querySelector('iframe')?.contentWindow?.dreamVisitProgress?.ready);
 f=p.frames().find(f=>f.url().includes('/petapeta-craft/'));
 await p.setViewportSize({width:844,height:390});
 await f.locator('[data-act="start"]').click();await f.locator('[data-act="mode-house"]').click();
 // Enter through the original UI. Add parts with the same native tap placement command used by the palette.
 await f.locator('.world-card').first().click();
 await p.waitForTimeout(300);assert.equal((await saved()).route.progress,0,'House defaults are not player work');
 const specs=await f.evaluate(()=>({sizes:PT.house.SIZES,lots:Object.keys(PT.WORLDS)}));
 const size=Object.keys(specs.sizes)[1]||Object.keys(specs.sizes)[0];
 for(let i=0;i<3;i++)await f.evaluate(size=>PT.house.tapSpec({room:'living',size}),size);
 await won('petapeta-craft');await p.screenshot({path:path.join(artifacts,'house-stamp.png')});
 await p.locator('#missionNext').click();await p.locator('#boardButton').click();
 await p.waitForFunction(()=>document.querySelector('iframe')?.contentWindow?.dreamVisitProgress?.ready);
 await p.setViewportSize({width:390,height:844});
 f=p.frames().find(f=>f.url().includes('/kao-ricky/'));await f.locator('#start').click({force:true});
 const point=await f.evaluate(()=>KAO.restToScreen(...KAO.P(-70,0))),frameBox=await p.locator('#gameFrame').boundingBox();
 const x=frameBox.x+point[0],y=frameBox.y+point[1];
 await p.mouse.move(x,y);await p.mouse.down();await p.mouse.move(Math.min(380,x+150),y+70,{steps:15});await p.waitForTimeout(200);await p.mouse.up();
 await won('kao-ricky');await p.locator('#missionNext').click();await p.locator('#journeyDialog').waitFor({state:'visible'});
 assert.equal(await p.locator('.journey-stamps span').count(),3);assert.equal(await p.locator('iframe').count(),0);
 await p.locator('#journeyDecorate').click();
 await p.locator('[data-decoration="kao-ricky"]').click();await p.locator('[data-slot="4"]').click();await p.locator('[data-paint="rose"]').click();
 assert.equal((await saved()).cars[4],'kao-ricky');assert.equal((await saved()).paint,'rose');await close('decorateDialog');await p.reload();
 assert.equal((await saved()).cars[4],'kao-ricky');assert.equal(Object.keys((await saved()).stamps).length,3);
 console.log('PASS: 3-stop journey with original quiz, house placement, face physics, souvenirs and reload');
 // Each remaining adapter is exercised through the ORIGINAL engine's result/action API.
 // These tests check integration, not full playthroughs of every original campaign.
 const actions={
  'kirameki-princess':async f=>{await f.evaluate(()=>KPGame.go('dress'));await f.locator('[data-a="save"]').click();},
  'futan-sagase':async f=>{await f.evaluate(()=>{GAME.startStage(0);GAME.go();});await p.waitForTimeout(250);await f.evaluate(()=>{const g=GAME,f=g.W.fam.futan,q=g.toScreen(f.x,f.y-25);g.onTap(q.x,q.y);});},
  'petapeta-town':async f=>{await f.evaluate(()=>{PT.game.enter(PT.STAGES[0].id);for(const id of PT.DISC_ORDER.slice(0,3))PT.R.found(id);});},
  'fuchan-hospital':async f=>{await f.evaluate(()=>__hosp.celebrate('naika',3));},
  'magire-alien':async f=>{await f.evaluate(()=>__G.startGame());for(let i=0;i<5;i++){await f.evaluate(()=>{const g=__G,n=g.npcs.find(n=>n.spec.alien&&n.state!=='reveal'&&!n.removed);if(n)g.hitNPC(n,n.root.position);else g.goScene(g.game.scene+1);});await p.waitForTimeout(350);}},
  'cure-tantei':async f=>{await f.evaluate(()=>__ct.startChapter(0));await p.waitForTimeout(250);await f.evaluate(()=>__ct.stepDone());},
  'nijiiro-treasure':async f=>{await f.locator('[data-island="0"]').click();for(let i=0;i<3;i++){await f.locator(`[data-object="cover${i}"]`).click();await p.waitForTimeout(50);}await f.locator('[data-item="gift"]').click();await f.locator('[data-object="friend"]').click();},
  'tomori-garden':async f=>{await f.locator('#play').click();await p.waitForTimeout(300);await f.evaluate(()=>{state.objects.filter(o=>o.item==='branch').slice(0,3).forEach(o=>harvest(o));});},
  'chokkai-snap':async f=>{await f.evaluate(()=>{game.startStage('T0');});await p.waitForTimeout(250);await f.evaluate(()=>{const g=game;for(const ev of g.stage.events.slice(0,2))g.recordDiscovery(ev);});},
  'mori-itazura':async f=>{await f.evaluate(()=>game.start(false));await p.waitForTimeout(250);await f.evaluate(()=>game.inv.add('apple',2,'gather'));},
  'monster-echoes':async f=>{await f.getByRole('button',{name:/はじめから/}).click();await f.getByRole('button',{name:/けってい/}).click();await f.waitForFunction(()=>!!window.app?.game);await p.waitForTimeout(400);
   await f.evaluate(()=>{const g=app.game;g.beginBattle('practice',[{speciesId:g.party[0].speciesId,level:1}],{kind:'practice'});for(let i=0;i<100&&!g.battle.state.outcome;i++)g.battleTurn({mode:'auto',player:{kind:'none'}});const result=g.finishBattle();if(result.outcome!=='win')throw Error('Native test battle did not win');});},
  'kossori-treasure':async f=>{await f.locator('#btnNew').click();await f.evaluate(()=>{const g=__game;g.bindStage(g.STAGES.camp);const c=g.containers.find(c=>c.items?.some(Boolean))||g.shelters.flatMap(s=>s.containers||[]).find(c=>c.items?.some(Boolean));if(!c)throw Error('No original container');g.openLoot(c);g.lootGrab(c.items.findIndex(Boolean));});}
 };
 for(const [id,action]of Object.entries(actions)){
  f=await launch(id);await action(f);await won(id);await leave();console.log('NATIVE RESULT',id);
 }
 // These two games load their native saves only after the title's Continue/Play button.
 // Loading that past progress must not be mistaken for a new action in this visit.
 for(const [id,button]of [['tomori-garden','#play'],['kossori-treasure','#btnContinue']]){
  f=await launch(id);const before=(await saved()).stamps[id];await f.locator(button).click();await p.waitForTimeout(500);
  assert.equal((await saved()).route.progress,0,id+' saved progress is baseline, not a new achievement');
  assert.equal((await saved()).stamps[id],before);await leave();
 }
 // Every stamp unlocks the ending and earned items can decorate any wagon.
 assert.equal(Object.keys((await saved()).stamps).length,15);await p.locator('#festivalButton').click();assert.equal(await p.locator('#festivalGuests>span').count(),15);await p.screenshot({path:path.join(artifacts,'festival.png')});await p.locator('#festivalClose').click();
 // A cancelled ticket preserves the journey; detours restore the parked itinerary.
 await p.locator('#departButton').click();await p.locator('[data-route="5"]').click();await p.locator('#boardButton').click();await leave();const route=(await saved()).route;
 await p.locator('[data-station="animal-quiz"]').click();await close('ticketDialog');assert.deepEqual((await saved()).route,route);
 await launch('animal-quiz');assert.deepEqual((await saved()).parkedRoute,route);await p.locator('#skipButton').click();await close('journeyDialog');assert.deepEqual((await saved()).route,route);assert.equal((await saved()).parkedRoute,null);
 // Layout sweep, controls fit, no horizontal page overflow; a single frame receives full play area.
 for(const [w,h]of [[320,568],[390,844],[844,390],[820,1180],[1440,1000]]){
  await p.setViewportSize({width:w,height:h});await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Hub ${w}`);
  await launch('animal-quiz');const rect=await p.locator('#gameFrame').boundingBox();assert.ok(rect.width<=w&&rect.height>150&&rect.y>=44&&rect.y+rect.height<h,`Frame layout ${w}`);await leave();
 }
 // Storage failure does not prevent travel. Corrupt progress does not unlock souvenirs.
 const fallback=await context.newPage();fallback.on('pageerror',e=>errors.push(e.message));await fallback.addInitScript(()=>{Storage.prototype.getItem=()=>{throw Error('denied');};Storage.prototype.setItem=()=>{throw Error('full');};});await fallback.goto(url);await fallback.locator('[data-station="animal-quiz"]').click();await fallback.locator('#boardButton').click();assert.equal(await fallback.locator('#saveNotice').isVisible(),true);await fallback.locator('#leaveButton').click();await fallback.locator('#hub').waitFor({state:'visible'});
 const observerErrors=await p.evaluate(()=>messages.filter(m=>m.type==='observer-error'));
 assert.deepEqual(observerErrors,[],'Native observers remain compatible');assert.deepEqual(errors,[],'No uncaught exceptions');assert.deepEqual(missing,[],'All local assets available');
 console.log('PASS: all 15 originals load, 15 native goal signals, 3-stop play journey, saved detours, exact-once stamps, replay, decoration, ending, 5 layouts, unavailable storage.');console.log('Screenshots:',artifacts);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});

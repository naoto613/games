const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const artifacts=fs.mkdtempSync(path.join(os.tmpdir(),'tomori-kids-'));
const base=process.env.TOMORI_TEST_URL||'http://127.0.0.1:8765/tomori-garden/';
(async()=>{
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(fs.existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),args:['--no-sandbox']});
try{
const context=await browser.newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true,deviceScaleFactor:2});
const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto(base);await page.screenshot({path:path.join(artifacts,'title.png')});await page.getByRole('button',{name:'あそぶ！',exact:true}).tap();await page.evaluate(()=>{state.settings.voice=false;});
assert.equal(await page.locator('.storyflow div').count(),3,'First chapter explains the garden/friend/ability loop');
await page.screenshot({path:path.join(artifacts,'first-chapter.png')});
// Follow only touch controls. Simulation time is advanced to avoid real-time walking waits.
let steps=0,plantedShot=false;
for(;steps<130;steps++){
 const done=await page.evaluate(()=>state.project===2);if(done)break;
 if(await page.locator('#modal').evaluate(e=>e.open)){
  const next=['chapterStart','gift','giftDone','helpFriend','project'];let handled=false;
  for(const id of next)if(await page.locator('#'+id).count()){await page.locator('#'+id).tap();handled=true;break;}
  if(!handled&&await page.locator('[data-flower]').count()){if(!plantedShot)await page.screenshot({path:path.join(artifacts,'choose-flower.png')});await page.locator('[data-flower="pink"]').tap();assert.ok(await page.evaluate(()=>growthBursts.length>0),'Planting produces a visible growth ring');handled=true;}assert.ok(handled,'Expected a child-facing progress button');
 }else await page.locator('#nextAction').tap();
 await page.evaluate(()=>{let max=9000;while(navigation&&max-->0)update(1/60);if(navigation)throw Error('Route stuck '+JSON.stringify({p:state.player,next:navPath[0]}));for(let j=0;j<210;j++)update(1/60);});
 if(!plantedShot&&await page.evaluate(()=>state.tiles.some(t=>t.tint==='pink')&&!$('modal').open)){await page.screenshot({path:path.join(artifacts,'first-garden.png')});plantedShot=true;}
}
assert.ok(await page.evaluate(()=>state.tiles.some(t=>t.tint==='pink')),'Player chose and planted a flower color');
assert.equal(await page.evaluate(()=>state.storySeen.length),6,'Each garden introduces its purpose');
assert.ok(steps<130,'All six friends and ending reachable without keyboard or inventory injection');
assert.equal(await page.evaluate(()=>state.residents.every(r=>r.done)&&state.q===8),true);
await page.screenshot({path:path.join(artifacts,'ending.png')});
await page.locator('#keepPlaying').tap();await page.locator('#close').tap();
// Free decorating: tap an empty tile, confirm, walk there, place. No material crafting.
await page.locator('#decorate').tap();await page.locator('[data-decor="flowerPot"]').tap();
const spot=await page.evaluate(()=>{for(let dy=0;dy<=2;dy++)for(let dx=-1;dx<=1;dx++){const x=Math.floor(state.player.x)+dx,y=Math.floor(state.player.y)+dy;if(walkable(x,y)&&!at(x,y)&&!state.tiles[key(x,y)].f)return{x,y,sx:(x+.5)*scale-cam.x,sy:(y+.8)*scale-cam.y};}});
assert.ok(spot);await page.touchscreen.tap(spot.sx,spot.sy);await page.locator('#nextAction').tap();await page.evaluate(()=>{let n=2000;while(navigation&&n--)update(1/60);});
assert.equal(await page.evaluate(({x,y})=>at(x,y)?.type,spot),'flowerPot');await page.locator('#decorate').tap();
// Friendship and bubble play.
await page.locator('#friends').tap();await page.locator('[data-friend="0"]').tap();await page.evaluate(()=>{let n=9000;while(navigation&&n--)update(1/60);});await page.locator('#petFriend').tap();await page.locator('#petArea').tap();assert.match(await page.locator('#petWords').innerText(),/くすぐったい/);await page.locator('#bubbles').tap();const bubble=await page.locator('.bubble').first().boundingBox();await page.touchscreen.tap(bubble.x+bubble.width/2,bubble.y+bubble.height/2);assert.match(await page.locator('#pops').innerText(),/1こ/);await page.locator('#close').tap();
// Preserve completed state across a reload.
assert.equal(await page.evaluate(()=>save()),true);await page.reload();await page.locator('#play').tap();assert.equal(await page.evaluate(()=>state.project===2&&state.residents.every(r=>r.done)&&state.storySeen.length===6&&state.tiles.some(t=>t.tint==='pink')),true);
// Responsive phone/tablet layouts and touch target sizes.
for(const [name,width,height]of [['phone',360,740],['phone-landscape',844,390],['tablet',820,1180],['tablet-landscape',1180,820]]){
 await page.setViewportSize({width,height});await page.waitForTimeout(100);
 const boxes=await page.locator('.dock button').evaluateAll(es=>es.map(e=>{const r=e.getBoundingClientRect();return{x:r.x,y:r.y,w:r.width,h:r.height};}));
 for(const r of boxes){assert.ok(r.w>=48&&r.h>=48,name+' has large touch targets');assert.ok(r.x>=0&&r.x+r.w<=width+1&&r.y+r.h<=height+1,name+' controls fit');}
 assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),name+' no horizontal overflow');
 const overlap=await page.evaluate(()=>{const a=$('collection').getBoundingClientRect(),b=$('hint').getBoundingClientRect();return a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;});assert.equal(overlap,false,name+' friend collection and instructions do not overlap');
 await page.screenshot({path:path.join(artifacts,name+'.png')});
}
// Legacy v1 save without newly introduced scenery; invalid saves do not replace state.
const validation=await page.evaluate(()=>{
const old=initial();old.objects=old.objects.filter(o=>!o.scenic);old.inventory.branch=17;old.q=1;old.gathered=3;old.inventory.marker=1;const clean=validate(JSON.parse(JSON.stringify(old)));const payload=JSON.stringify(clean);localStorage.setItem('tomori.save.a',JSON.stringify({revision:10000,payload,checksum:checksum(payload)}));localStorage.removeItem('tomori.save.b');const loaded=load();let rejected=false;const bad=JSON.parse(JSON.stringify(state));bad.inventory.seed=-1;try{validate(bad);}catch{rejected=true;}return{loaded,branch:state.inventory.branch,q:state.q,rejected};});
assert.deepEqual(validation,{loaded:true,branch:17,q:1,rejected:true});
const legacyActivity=await page.evaluate(()=>{const s=initial();s.q=3;s.gathered=3;s.residents[0]={...s.residents[0],status:2,done:true,home:'first'};s.habitats=[{id:'first',x:7,y:32,resident:'moss'},{id:'unused',x:17,y:39,resident:null,candidate:null,since:null}];s.objects.push({id:'first',x:7,y:32,type:'marker',fixed:false},{id:'unused',x:17,y:39,type:'marker',fixed:false});state=s;cachedActivity=null;const a=nextActivity();return{kind:a.kind,tag:a.tag,relocate:a.relocate};});assert.deepEqual(legacyActivity,{kind:'habitat',tag:'marker',relocate:'unused'});
assert.deepEqual(errors,[],'No page errors');
console.log('PASS: touch journey ('+steps+' steps), decorating, petting, bubbles, reload, v1 save, invalid save, 4 mobile/tablet layouts.');console.log('Screenshots:',artifacts);
}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});

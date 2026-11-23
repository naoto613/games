const {chromium}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs'),os=require('node:os');
const base=process.env.TOWN_TEST_URL||'http://127.0.0.1:8771/dream-train/';
const artifacts=fs.mkdtempSync(path.join(os.tmpdir(),'nijiiro-town-'));
(async()=>{const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});try{
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const p=await context.newPage(),errors=[],missing=[];p.on('pageerror',e=>{errors.push(e.message);console.log('PAGE ERROR',e.message);});p.on('response',r=>{if(r.status()>=400&&r.url().startsWith(new URL(base).origin))missing.push(r.url());});
 await p.goto(base);await p.evaluate(()=>{for(const color of ['pink','blue','mint','yellow','lav'])TownArt.character({color});});await p.screenshot({path:path.join(artifacts,'title.png'),fullPage:true});await p.locator('#startButton').click();assert.equal(await p.locator('iframe').count(),0);
 const flags=()=>p.evaluate(()=>Town.state.flags.slice());
 async function open(id){
  await p.evaluate(id=>{const n=TownStory.nodes.find(n=>n.id===id);Town.focusOn(n.x,n.y);},id);
  await p.locator(`[data-node="${id}"]`).click();await p.locator('#activity').waitFor({state:'visible'});
 }
 async function done(id){await p.locator('#returnToTown').waitFor({state:'visible'});assert.ok((await flags()).includes(id),id+' global consequence');await p.locator('#returnToTown').click();await p.waitForFunction(()=>!document.getElementById('activity').open);console.log('STORY',id);}
 // Pointer and keyboard face stretching use the actual spring-mesh scene.
 await open('ricky');
 const face=await p.locator('#rickyFace').boundingBox();await p.mouse.move(face.x+face.width*.35,face.y+face.height*.4);await p.mouse.down();await p.mouse.move(face.x+face.width*.75,face.y+face.height*.55,{steps:8});await p.mouse.up();
 await p.locator('#rickyFace').focus();await p.keyboard.press('Enter');await p.waitForTimeout(300);
 await p.locator('#milkTool').click();await p.locator('#rickyMouth').click();await done('ricky');
 assert.equal(await p.locator('[data-item="ribbon"]').count(),1);
 await open('dress');await p.locator('[data-choice="hair:pony"]').click();await p.locator('[data-choice="color:blue"]').click();await p.locator('#transformButton').click();await done('dress');
 assert.equal(await p.evaluate(()=>Town.state.outfit.color),'blue');
 await open('doctor');await p.locator('#wound').click();await p.locator('[data-tool="bandage"]').click();await p.locator('#wound').click();assert.equal((await flags()).includes('doctor'),false,'Wrong tool cannot bypass cleaning');
 await p.locator('[data-tool="spray"]').click();
 const wound=await p.locator('#wound').boundingBox();for(const [x,y]of [[.16,.16],[.5,.16],[.83,.16],[.16,.5],[.5,.5]])await p.mouse.click(wound.x+wound.width*x,wound.y+wound.height*y);
 await p.locator('[data-tool="bandage"]').click();await p.locator('#wound').click();await done('doctor');
 // The newly earned scanner operates in the world, not a game frame or game picker.
 await p.locator('[data-item="scanner"]').click();
 for(const id of [0,2]){
  await p.locator('#scanMode').click();const actor=await p.locator(`[data-actor="${id}"]`).boundingBox();await p.mouse.move(actor.x+actor.width/2,actor.y+actor.height*.7);await p.mouse.click(actor.x+actor.width/2,actor.y+actor.height*.7);await p.locator('#beamMode').click();await p.locator(`[data-actor="${id}"]`).click();
 }
 assert.ok((await flags()).includes('scan'));await p.locator('[data-item="scanner"]').click();
 await open('quiz');for(const answer of ['carrot','bird','fish']){await p.locator(`[data-answer="${answer}"]`).click();await p.waitForTimeout(650);}await done('quiz');
 await open('picnic');for(const id of ['plate','carrot','rabbit']){await p.locator(`[data-picnic="${id}"]`).click();await p.locator(`[data-drop="${id}"]`).click();}await done('picnic');
 await open('bridge');for(const id of ['short','long','rail','flag']){await p.locator(`[data-part="${id}"]`).click();await p.locator(`[data-build-slot="${id}"]`).click();}await done('bridge');
 assert.match(await p.locator('[data-node="bridge"]').innerText(),/みんなで かけた/);
 await open('search');await p.getByRole('button',{name:'ハートの ポシェットの おともだち',exact:true}).click();await done('search');
 await open('photo');await p.locator('#photoCan').click();await p.locator('#photoCard').click();await p.locator('#photoGardener').click();await done('photo');
 await p.screenshot({path:path.join(artifacts,'town-changed.png'),fullPage:true});
 // Stealth: walk via cover, retain pickups if seen. Real movement/visibility engine, no flags injected.
 await open('sneak');
 const field=await p.locator('#stealthField').boundingBox();const pos=async(x,y)=>{await p.mouse.click(field.x+field.width*x/560,field.y+field.height*y/340);};
 // Wait for the cone to point away from the northern path, then move to each item.
 await pos(125,225);await p.waitForTimeout(1200);await pos(180,145);await p.waitForTimeout(1700);
 if(!(await p.locator('[data-berry="0"]').isHidden())){await pos(180,145);await p.waitForTimeout(2800);}
 await pos(360,225);await p.waitForTimeout(3100);await pos(465,130);await p.waitForTimeout(2500);
 let tries=0;while(!(await flags()).includes('sneak')&&tries++<5){await pos(465,130);await p.waitForTimeout(6500);}
 await done('sneak');
 await open('vault');await p.locator('#berryGift').click();
 let grabs=0;while(!(await flags()).includes('vault')&&grabs++<12){
  await p.waitForFunction(()=>document.getElementById('guardLook').textContent==='おやつに むちゅう');
  const b=await p.locator('#vaultChest').boundingBox();await p.mouse.move(b.x+b.width*.5,b.y+b.height*.5);await p.mouse.down();await p.waitForTimeout(1300);await p.mouse.up();
 }
 await done('vault');
 await open('treasure');await p.locator('[data-dig-site="1"]').click();assert.equal(await p.locator('#digSite').isVisible(),false,'Need the actual shared shovel');await p.locator('#useShovel').click();await p.locator('[data-dig-site="1"]').click();
 for(let i=0;i<7;i++)await p.locator(`[data-soil="${i}"]`).click();await done('treasure');
 await p.reload();await p.locator('#startButton').click();assert.ok((await flags()).includes('treasure'));assert.equal(await p.evaluate(()=>Town.state.outfit.color),'blue');
 await open('detective');for(const id of ['footprints','window','lamp'])await p.locator(`[data-clue="${id}"]`).click();await p.locator('[data-code="3"]').click();await p.locator('[data-symbol="star"]').click();await done('detective');
 await open('finale');await p.locator('#magicTransform').click();
 for(let i=0;i<3;i++){await p.waitForFunction(()=>document.getElementById('battleCloud').classList.contains('warning'));await p.waitForTimeout(550);await p.locator('#shieldButton').click();await p.waitForTimeout(900);}
 await p.locator('#magicButton').waitFor({state:'visible'});await p.waitForFunction(()=>!document.getElementById('magicButton').disabled);
 const magic=await p.locator('#magicButton').boundingBox();await p.mouse.move(magic.x+magic.width/2,magic.y+magic.height/2);await p.mouse.down();await p.waitForTimeout(1900);await p.mouse.up();await done('finale');
 assert.equal((await flags()).length,14);assert.equal(await p.evaluate(()=>Town.state.night),true);await p.locator('#decorateButton').click();const view=await p.locator('#viewport').boundingBox();await p.mouse.click(view.x+view.width*.4,view.y+view.height*.75);assert.equal(await p.evaluate(()=>Town.state.decorations.length),1);
 await p.screenshot({path:path.join(artifacts,'festival.png'),fullPage:true});
 for(const[width,height]of [[320,568],[390,844],[844,390],[820,1180],[1440,1000]]){await p.setViewportSize({width,height});await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No overflow '+width);await p.screenshot({path:path.join(artifacts,'world-'+width+'.png'),fullPage:true});}
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);assert.equal(await p.locator('iframe').count(),0);
 console.log('PASS: integrated story from first help to festival, shared outfit/tools, scanner in world, dependency gates, reload, decoration, 5 layouts, no frames or missing assets.');console.log('Screenshots:',artifacts);
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});

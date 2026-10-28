const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const artifacts=require('node:fs').mkdtempSync(path.join(require('node:os').tmpdir(),'tomori-test-'));
(async()=>{
const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||(require('node:fs').existsSync('/usr/bin/chromium')?'/usr/bin/chromium':undefined),headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1200,height:800}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await page.goto('http://127.0.0.1:8765/tomori-garden/');
await page.getByRole('button',{name:'はじめから',exact:true}).click();await page.getByRole('button',{name:'この庭ではじめる'}).click();
await page.evaluate(()=>{state.player.x=5.5;state.player.y=35.5;state.player.face=0;target={x:5,y:34};});await page.keyboard.press('e');await page.waitForTimeout(100);
assert.match(await page.locator('#goal').innerText(),/草と花/);
await page.getByRole('button',{name:'バッグ',exact:true}).click();assert.match(await page.locator('#content').innerText(),/よりどころの札/);await page.getByRole('button',{name:'庭へ戻る',exact:true}).click();
const result=await page.evaluate(()=>{
const check=(v,m)=>{if(!v)throw Error(m);};
check(state.inventory.branch===3,'採集');check(state.inventory.marker===1,'目標報酬');
const before=JSON.stringify(state.inventory);check(!craft('board',5),'素材不足拒否');check(before===JSON.stringify(state.inventory),'不足時無消費');
state.player.x=7.5;state.player.y=33.5;check(place(7,32,'marker'),'最初の札');tickHabitats();state.time+=10.1;tickHabitats();check(state.residents[0].status===1,'最初の訪問');
state.residents[0].status=2;state.inventory.seed=3;check(request(0),'最初の納品');check(state.abilities.includes('grow'),'能力習得');check(!request(0),'再納品拒否');
for(const id of Object.keys(names))state.inventory[id]=100;
const layout=[[[10,11,'stoneDecor'],[14,11,'stoneDecor']],[[16,29,'stoneDecor'],[18,29,'stoneDecor'],[17,31,'bench']],[[34,37,'windChime']],[[38,28,'lamp'],[40,28,'lamp'],[39,30,'bench']],[[34,10,'lamp'],[38,10,'lamp'],[36,11,'hut']]];
for(let i=1;i<6;i++){
 if(i===3){state.player.x=23.5;state.player.y=34.5;check(useAbility('break',24,34),'東開放');}
 if(i===5){state.player.x=34.5;state.player.y=24.5;check(useAbility('gust',34,23),'北開放');}
 for(const [x,y,type]of layout[i-1]){state.player.x=x+.5;state.player.y=y+1.5;check(place(x,y,type),'家具配置 '+type);}
 if(i===3)for(const [x,y]of [[31,36],[32,36],[33,36]]){garden('plant',x,y);}
 const [x,y]=suggested[i];state.player.x=x+.5;state.player.y=y+1.5;check(place(x,y,'marker'),'札 '+i);tickHabitats();state.time+=20.1;tickHabitats();check(state.residents[i].status===1,'訪問 '+i);state.residents[i].status=2;check(request(i),'納品 '+i);
}
check(state.residents.every(r=>r.done),'全住人');check(state.q===7,'最終目標');
check(validate(JSON.parse(JSON.stringify(state))).q===7,'セーブ検証');
check(save(),'保存');const count=state.inventory.stone;state.inventory.stone=0;check(load()&&state.inventory.stone===count,'復元');
let rejected=false;const bad=JSON.parse(JSON.stringify(state));bad.inventory.seed=-1;try{validate(bad);}catch{rejected=true;}check(rejected,'不正保存拒否');
state.player.x=36.5;state.player.y=6.5;finalPanel();document.getElementById('project').click();check(state.project===1,'修繕開始');state.time=state.finish;update(1/60);check(state.project===2&&state.q===8,'エンディング');closeModal();
const snap=JSON.stringify(state);check(save(),'最終保存');state=initial();check(load()&&state.ending&&state.residents.every(r=>r.done),'エンディング後再開');
return '採集・不正操作・6住人の訪問と納品・全能力・区画開放・保存復元・最終修繕を確認';});console.log(result);
await page.screenshot({path:path.join(artifacts,'desktop.png')});
await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'建築 B'}).click();await page.getByRole('button',{name:'花を植える（種1）'}).click();assert.equal(await page.locator('#confirm').isVisible(),true);await page.getByRole('button',{name:'閉じる',exact:true}).click();await page.getByRole('button',{name:'選ぶ',exact:true}).click();assert.match(await page.locator('#content').innerText(),/風払い/);await page.getByRole('button',{name:'庭へ戻る',exact:true}).click();await page.screenshot({path:path.join(artifacts,'mobile.png')});assert.deepEqual(errors,[]);console.log('PC・390px UI / console errors: 0');
console.log('Screenshots:',artifacts);await browser.close();
})().catch(e=>{console.error(e);process.exit(1);});

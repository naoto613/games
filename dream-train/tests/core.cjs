const assert=require('node:assert/strict');require('../lab-core.js');const C=globalThis.LabCore;
const s=C.fresh(),doIt=(v,t,d={})=>C.perform(s,v,t,d),go=w=>assert.ok(doIt('travel',w).ok,w);
assert.equal(C.unlocked(s,'forest'),false);doIt('wake','moco');go('forest');
assert.equal(doIt('bandage','fox').ok,false);assert.equal(doIt('build','mill',{slot:0,shape:'circle',rotation:0}).ok,false);
function forest(){
 for(let i=0;i<3;i++)doIt('water','flower',{cell:i});
 doIt('steth','fox');for(let i=0;i<3;i++)doIt('spray','fox',{cell:i});doIt('bandage','fox');
 for(let i=0;i<3;i++)assert.ok(doIt('quiz','owl',{answer:C.quizQuestion(s).answer}).ok);
 doIt('photo','flower');doIt('givePhoto','mill');const plan=C.buildPlan(s);assert.equal(doIt('build','mill',{slot:1,shape:plan[1].shape,rotation:0}).ok,false,'Orientation matters');plan.forEach((p,slot)=>assert.ok(doIt('build','mill',{slot,...p}).ok));
}
function sea(){
 assert.equal(doIt('find','crowd',{index:-1}).ok,false);doIt('find','crowd',{index:C.searchTarget(s).index});doIt('photo','cloud');doIt('givePhoto','coral');
 assert.equal(doIt('build','boat',{slot:0,...C.buildPlan(s)[0]}).ok,false,'Need the remembered song');for(const n of C.melody(s))doIt('note','buoy',{note:n});C.buildPlan(s).forEach((p,slot)=>doIt('build','boat',{slot,...p}));
}
function space(){
 assert.equal(doIt('finishShow','storm').ok,false);for(let i=0;i<3;i++)doIt('gear','gears',{index:i});doIt('hide','cover');doIt('clue','lamps');doIt('photo','planet');assert.equal(doIt('code','gate',{number:99}).ok,false);doIt('code','gate',{number:C.code(s).number});doIt('code','gate',{symbol:C.code(s).symbol});for(let i=0;i<3;i++)doIt('guard','storm');doIt('finishShow','storm');
}
forest();assert.ok(C.unlocked(s,'sea'));go('sea');sea();assert.ok(C.unlocked(s,'space'));go('space');space();assert.equal(C.totalProjects(s),9);assert.equal(C.stars(s),9);
for(const w of ['forest','sea','space']){
 go(w);doIt('scan','visitor');doIt('magic','visitor');
 if(w==='forest'){for(let i=0;i<3;i++){doIt('hand','puddle');doIt('hand','mushrooms');}doIt('care','mushrooms');doIt('magic','flower');}
 if(w==='sea'){for(let i=0;i<3;i++){doIt('water','coral',{cell:i});doIt('hand','cloud');}doIt('photo','coral');doIt('photo','crowd');doIt('magic','coral');doIt('word','bottle',{symbol:'sun'});}
 if(w==='space'){for(let i=0;i<3;i++)doIt('hand','planet');doIt('magic','planet');doIt('photo','storm');}
}
assert.equal(s.discoveries.length,36,'Every advertised discovery is reachable');
for(let r=1;r<3;r++)for(const w of ['forest','sea','space']){go(w);doIt('remix','');assert.equal(C.ws(s).round,r);if(w==='forest')forest();if(w==='sea')sea();if(w==='space')space();}
assert.equal(C.stars(s),27);assert.match(C.goal(s).text,/アトリエマスター/);const before=C.stars(s);doIt('finishShow','storm');assert.equal(C.stars(s),before,'No duplicate rewards');
go('home');doIt('decorate','house',{art:'rocket',x:55,y:72});doIt('photo','house');assert.equal(s.photos.at(-1).decorations.length,1);const restored=C.validate(JSON.parse(JSON.stringify(s)));assert.equal(restored.photos.at(-1).level,3);assert.equal(restored.discoveries.length,36);assert.equal(restored.earned.length,27);assert.equal(restored.decorations.length,1);
const bad=C.validate({schema:3,awake:true,world:'nonsense',earned:['bogus'],discoveries:['<script>'],look:{color:'evil'},worlds:{forest:{round:999,parts:[0,0,5],taps:{puddle:Infinity}}},photos:[null],decorations:[{art:'bogus',x:3,y:4}]});assert.equal(bad.world,'home');assert.equal(bad.earned.length,0);assert.equal(bad.look.color,'peach');assert.equal(bad.worlds.forest.parts.length,1);
console.log('PASS: all 9 projects, all 3 variants, all 36 discoveries, 27 unique stars, locks, tool prerequisites, orientation, shared home, photo snapshots and save validation.');

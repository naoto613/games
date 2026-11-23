const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const context=vm.createContext({window:{},console});
for(const file of ['catalog.js','engine.js'])vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context);
const {DreamCatalog:C,DreamEngine:E}=context.window;
assert.equal(C.length,15);assert.equal(new Set(C.map(g=>g.id)).size,15);
for(const g of C){assert.ok(fs.existsSync(path.join(__dirname,'../..',g.id,'index.html')),g.id+' exists');assert.ok(fs.existsSync(path.join(__dirname,'../../thumbs',g.id+'.jpg')),g.id+' thumbnail');}
for(let seed=0;seed<100;seed++)for(const length of [3,5,15]){
 let n=seed;const r=E.plan(C,{},length,()=>((n=n*1664525+1013904223)>>>0)/2**32);
 assert.equal(r.ids.length,length);assert.equal(new Set(r.ids).size,length);
 for(let i=1;i<r.ids.length;i++)if(i<6)assert.notEqual(C.find(g=>g.id===r.ids[i]).group,C.find(g=>g.id===r.ids[i-1]).group,'Varied opening route');
}
const s=E.fresh();s.route=E.plan(C,{},15,()=>.5);
for(let i=0;i<15;i++){
 const g=C.find(g=>g.id===s.route.ids[s.route.index]);
 assert.equal(E.award(s,g),false,'No stamp for entering an original');
 s.route.progress=g.target;assert.equal(E.award(s,g),true);
 assert.equal(E.award(s,g),false,'No duplicate stamp from repeat notifications');
 assert.equal(E.next(s),i<14);
}
assert.equal(Object.keys(s.stamps).length,15);assert.ok(s.cars.every(id=>id&&s.stamps[id]));
assert.equal(E.next(s),false,'Completed itinerary stays complete');
const valid=E.validate(JSON.parse(JSON.stringify(s)),C);assert.equal(Object.keys(valid.stamps).length,15);
const broken=E.validate({version:1,stamps:{fake:3,[C[0].id]:-1},cars:['fake'],paint:'red',route:{ids:['fake'],index:0,progress:100}},C);
assert.equal(Object.keys(broken.stamps).length,0);assert.equal(broken.paint,'sage');assert.equal(broken.route,null);
const parked=E.plan(C,{},5,()=>.4);parked.index=2;
const detour=E.validate({version:1,route:{ids:[C[0].id],index:0,progress:0},parkedRoute:parked},C);
assert.equal(detour.parkedRoute.index,2,'Detour retains original itinerary');
assert.equal(E.validate({version:1,route:parked,parkedRoute:parked},C).parkedRoute,null,'Only one parked itinerary is permitted');
console.log('PASS: 15 source games/assets, 300 varied routes, all awards, replay protection, corrupt saves, detour resume.');

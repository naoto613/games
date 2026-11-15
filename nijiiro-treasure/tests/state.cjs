// A closed/crashed tab may keep the final puzzle move but miss its map award.
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const World=vm.runInNewContext(fs.readFileSync(path.join(__dirname,'../world.js'),'utf8')+'\nWorld;',{Math});
for(let island=0;island<3;island++){
 const s=World.create(island);
 assert.ok(World.validate(s),'New expedition is valid');
 s.gift=true;s.tool=true;s.boards=[0,1,2];s.bridgeSlots=[0,1,2];
 if(island===0)s.musicRound=2;
 if(island===1)s.fish=3;
 if(island===2)s.wind=[0,2,1];
 const restored=World.validate(JSON.parse(JSON.stringify(s)));
 assert.equal(restored.bridge,true,'Final plank restores bridge reward');
 assert.equal(restored.challenge,true,'Final puzzle move restores challenge reward');
 assert.equal(World.pieces(restored),3,'Recovered game can reach its treasure');
 assert.equal(s.bridge,false,'Validation does not mutate its caller');
 assert.equal(World.validate({...s,seed:-1}),null);
 assert.equal(World.validate({...s,boards:[0,0,1]}),null);
 assert.equal(World.validate({...s,wind:[0,2,9]}),null);
 assert.equal(World.validate({...s,tool:true,gift:false}),null);
}
const locked=World.create(0);locked.area=2;
assert.equal(World.validate(locked),null,'Third area requires a repaired bridge');
const premature=World.create(1);premature.dug=[0];
assert.equal(World.validate(premature),null,'Digging requires a complete map');
console.log('PASS: interrupted reward saves, independent validation, invalid progress and gated areas.');

// ================= story runner / cast =================
const NPC={
  neko:{kind:'cat',name:'ねこの パティシエ',acc:['chef'],vo:[1.55,1.05]},
  pen:{kind:'penguin',name:'ペンギンくん',acc:['scarf:#5aa8ff'],vo:[1.3,1.1]},
  kara:{kind:'crow',name:'カラスさん',vo:[.95,1.05]},
  kuma:{kind:'bear',name:'くまさん',vo:[.8,1]},
  buta:{kind:'pig',name:'ぶたさん',vo:[1.1,1]},
  inu:{kind:'dog',name:'わんちゃん',acc:['scarf:#ff5a6a'],vo:[1.45,1.1]},
  usa:{kind:'rabbit',name:'うさぎさん',acc:['bow:#ff5fa2'],vo:[1.75,1.05]},
  kitsune:{kind:'fox',name:'きつねさん',vo:[1.2,1.05]},
  panda:{kind:'panda',name:'パンダ かんちょう',acc:['glasses'],vo:[1,1]},
  fuku:{kind:'owl',name:'フクロウせんせい',acc:['glasses'],vo:[.9,.95]},
  fukuN:{kind:'owl',name:'ほしみの フクロウ',vo:[.9,.95]},
  arai:{kind:'raccoon',name:'アライグマくん',vo:[1.2,1.1]},
  kumadoc:{kind:'bear',name:'くま せんせい',acc:['doc','mirror'],vo:[.8,1]},
  buta2:{kind:'pig',name:'ぶたくん',vo:[1.2,1.05]},
  nezumi:{kind:'mouse',name:'ねずみくん',vo:[1.8,1.15]},
  gate:{kind:'mouse',name:'もんばんの ねずみ',acc:['cap:#5a3a8a'],vo:[1.7,1.1]},
  hitsuji:{kind:'sheep',name:'ひつじさん',vo:[1.5,1]},
  kame:{kind:'turtle',name:'カメさん',vo:[1,.9]},
  hiyoko:{kind:'chick',name:'ひよこちゃん',vo:[1.9,1.1]},
  zou:{kind:'elephant',name:'ぞうさん',vo:[.8,.95]},
  lion:{kind:'lion',name:'ライオンくん',vo:[.9,1]},
};
const NAMES={fu:'ふーちゃん',rk:'リッキー',kuro:'クロニャン',witch:'ドロドロン',narr:''};
function nameOf(id){return NAMES[id]!=null?NAMES[id]:(NPC[id]?NPC[id].name:id);}
function drawCast(c,id,x,y,o={}){const t=T+(o.seed||0);
  if(id==='fu')drawFutan(c,x,y,{s:2.1,t,talk:o.talk,cure:o.cure,doc:o.doc,happy:o.emo==='happy',ouch:o.emo==='ouch',pose:o.emo==='happy'?'win':o.emo==='think'?'think':o.pose||'idle',item:o.item});
  else if(id==='rk')drawRicky(c,x,y,{s:1.9,t,happy:o.emo==='happy',nurse:o.doc,cure:o.cure,talk:o.talk});
  else if(id==='kuro'){drawKuro.talk=o.talk;drawKuro(c,x,y,1.2,t,o.emo||'');drawKuro.talk=false;}
  else if(id==='witch')drawWitch(c,x,y,1.5,t,{kind:o.emo==='kind'});
  else{const n=NPC[id];if(n)drawAnimal(c,n.kind,x,y,1.15,{t,talk:o.talk,acc:n.acc,happy:o.emo==='happy',sad:o.emo==='sad',sick:o.emo==='sick',sleep:o.emo==='sleep'});}}
const RUN={steps:[],i:0,onEnd:null,ci:-1,flags:{},mode:'story',doc:false,cure:false};
function runSteps(steps,onEnd,opt={}){RUN.steps=steps;RUN.i=opt.start||0;RUN.onEnd=onEnd;RUN.ci=opt.ci??-1;RUN.flags=Object.assign({},opt.flags||{});RUN.mode=opt.mode||'story';startStep();}
function startStep(){const d=RUN.steps[RUN.i];if(RUN.ci>=0&&d.t!=='battle'){SAVE.cp={ci:RUN.ci,i:RUN.i,flags:RUN.flags};save();}go(mkStep(d));}
function stepDone(){RUN.i++;if(RUN.i>=RUN.steps.length){RUN.onEnd&&RUN.onEnd();return;}startStep();}
const STEP={};
function mkStep(d){const s=Object.create(STEP[d.t]);s.d=d;s.isStep=true;s.fin=null;return s;}
function finish(s,delay=1){if(s.fin==null)s.fin=delay;}

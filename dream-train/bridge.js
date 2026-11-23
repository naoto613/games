/* Loaded inside one original game's frame. Observe real actions; never alter rules or saves. */
(() => {
  'use strict';
  const script=new URL(document.currentScript.src), id=script.searchParams.get('game'), token=script.searchParams.get('visit');
  const send=(type,extra={})=>parent.postMessage({channel:'dream-train',type,id,token,...extra},location.origin);
  let count=0, last, ready=false, installed=false, stretched=false;
  const sum=o=>Object.values(o||{}).reduce((a,b)=>a+(Number(b)||0),0);
  const json=k=>{try{return JSON.parse(localStorage.getItem(k));}catch{return null;}};
  const add=n=>{if(!Number.isFinite(n)||n<=0)return;count+=Math.min(n,100);send('progress',{count});};
  function changed(value){if(!Number.isFinite(value))return;if(last!==undefined&&value>last)add(value-last);last=value;}
  function wrap(obj,key,after){if(!obj||typeof obj[key]!=='function')return false;const original=obj[key];obj[key]=function(...args){let before;try{before=after.before?.(this,args);}catch{}const result=original.apply(this,args);try{after.call(this,result,args,before);}catch{}return result;};return true;}
  function sample(){
    try {
      if(id==='animal-quiz'){
        const stars=document.getElementById('stars');if(!stars)return;
        changed([...stars.childNodes].filter(n=>n.nodeType===3).reduce((n,t)=>n+(t.textContent.match(/⭐/g)||[]).length,0));
      }else if(id==='kirameki-princess'){
        if(!window.KPGame)return;const value=window.KPGame.state.exp||0;
        if(last!==undefined&&value>last)add(1);last=value;
      }else if(id==='kao-ricky'){
        if(!window.KAO)return;
        if(window.KAO.S.stretch>120)stretched=true;
        if(stretched&&window.KAO.S.stretch<20){stretched=false;add(1);}
      }else if(id==='magire-alien'){
        if(!window.__G)return;changed(window.__G.game.caught);
      }else if(id==='futan-sagase'){
        if(!window.GAME?.G)return;const value=window.GAME.G.state==='found';
        if(value&&last===false)add(1);last=value;
      }else if(id==='fuchan-hospital'){
        if(!window.__hosp)return;changed(sum(window.__hosp.SAVE.plays));
      }else if(id==='cure-tantei'){
        if(!window.__ct)return;
        const run=window.__ct.RUN;
        if(last&&last.steps===run.steps&&run.i>last.i)add(run.i-last.i);
        last={steps:run.steps,i:run.i};
      }else if(id==='kossori-treasure'){
        if(!window.__game)return;const s=window.__game.S;
        if(document.getElementById('title')?.hidden)changed(s.bag.length+(s.stats.sold||0));else last=undefined;
      }else if(id==='tomori-garden'){
        // Original global lexical binding, read from this same-origin classic script.
        if(typeof state==='undefined')return;
        if(typeof running!=='undefined'&&running)changed(state.gathered+state.q*3+state.residents.filter(r=>r.done).length*3);else last=undefined;
      }else if(id==='nijiiro-treasure'){
        const s=json('nijiiro-treasure.v2');
        const value=(s?.collection?.length||0)*3+(s?.expeditions||[]).reduce((n,e)=>n+(e?Number(e.tool)+Number(e.challenge)+Number(e.bridge):0),0);
        changed(value);
      }else if(id==='petapeta-town'){
        if(!window.PT?.save?.data||!window.PT?.game)return;
        if(!installed){window.PT.bus.on('reaction',()=>add(1));installed=true;}
      }else if(id==='petapeta-craft'){
        if(!window.PT?.house||!window.PT?.play)return;
        if(!installed){
          // H.fresh uses its own internal add(), so merely opening a house earns nothing.
          wrap(window.PT.house,'add',function(result){if(result)add(1);});
          const hook=function(result,args,before){const delta=(window.PT.save.data.placed||0)-before;if(delta>0)add(delta);};
          hook.before=()=>window.PT.save.data.placed||0;wrap(window.PT.play,'placeAt',hook);installed=true;
        }
      }else if(id==='chokkai-snap'){
        if(!window.game?.progress)return;
        if(!installed){wrap(window.game,'recordDiscovery',function(result,args){if(args[0]?.id!==this.stage?.timeoutEventId)add(1);});installed=true;}
      }else if(id==='mori-itazura'){
        if(!window.game?.bus)return;
        if(!installed){window.game.bus.on('item:obtained',e=>{if(!['shop','quest'].includes(e.source))add(e.count||1);});installed=true;}
        if(!['title','game'].includes(window.game.ui?.get().screen))return;
      }else if(id==='monster-echoes'){
        if(!window.app)return;
        if(window.app.game&&!installed){wrap(window.app.game,'finishBattle',function(result){if(result?.outcome==='win'&&result.exp>0)add(1);});installed=true;}
      }else return;
      if(!ready){ready=true;send('ready');}
    }catch(error){send('observer-error',{message:String(error.message).slice(0,120)});}
  }
  // Short polling is for observing progress, never for awarding elapsed play time.
  sample();const interval=setInterval(sample,200);
  // The parent reads once before destroying the frame, so the last action is not lost
  // between two observer ticks. This accessor does not write any original game state.
  Object.defineProperty(window,'dreamVisitProgress',{get(){sample();return {id,token,count,ready};},configurable:true});
  // Tomori's autosave is debounced and its native save() is a global classic-script
  // function. Flush it before leaving instead of waiting for the next game-loop tick.
  window.dreamFlush=()=>{if(id==='tomori-garden'&&typeof running!=='undefined'&&running&&typeof save==='function')return save();};
  function stretchFrame(){if(id==='kao-ricky')sample();if(!document.hidden)requestAnimationFrame(stretchFrame);}
  if(id==='kao-ricky')requestAnimationFrame(stretchFrame);
  addEventListener('pagehide',()=>{sample();clearInterval(interval);});
  send('attached');
})();

/* Pure journey rules, separately tested from the browser integration. */
'use strict';
window.DreamEngine = (() => {
  const fresh=()=>({version:1,stamps:{},cars:[null,null,null,null,null],paint:'sage',route:null,parkedRoute:null,visits:0});
  function validate(raw,catalog){
    const out=fresh(),ids=new Set(catalog.map(g=>g.id));
    if(!raw||raw.version!==1)return out;
    for(const [id,value] of Object.entries(raw.stamps||{}))if(ids.has(id)&&Number.isSafeInteger(value)&&value>0)out.stamps[id]=value;
    if(Array.isArray(raw.cars))out.cars=out.cars.map((_,i)=>ids.has(raw.cars[i])&&out.stamps[raw.cars[i]]?raw.cars[i]:null);
    if(['sage','rose','sky','honey'].includes(raw.paint))out.paint=raw.paint;
    if(Number.isSafeInteger(raw.visits)&&raw.visits>=0)out.visits=raw.visits;
    const r=raw.route;
    if(r&&Array.isArray(r.ids)&&[1,3,5,15].includes(r.ids.length)&&new Set(r.ids).size===r.ids.length&&r.ids.every(id=>ids.has(id))&&Number.isInteger(r.index)&&r.index>=0&&r.index<=r.ids.length){
      const checked=Array.isArray(r.earned)?r.earned.filter(id=>r.ids.slice(0,r.index+1).includes(id)&&out.stamps[id]):[];
      const game=catalog.find(g=>g.id===r.ids[r.index]);
      out.route={ids:r.ids.slice(),index:r.index,earned:[...new Set(checked)],progress:Math.min(game?.target||0,Math.max(0,Number.isInteger(r.progress)?r.progress:0))};
    }
    if(raw.parkedRoute&&out.route?.ids.length===1){
      const parked=validate({...raw,route:raw.parkedRoute,parkedRoute:null},catalog).route;
      if(parked&&parked.ids.length>1&&parked.index<parked.ids.length)out.parkedRoute=parked;
    }
    return out;
  }
  function plan(catalog,stamps,length,random=Math.random){
    const shortTrip=length===3?catalog.filter(g=>!['monster-echoes','cure-tantei','kossori-treasure'].includes(g.id)):catalog;
    let pool=shortTrip.map((g,i)=>({...g,order:i,random:random()}));
    pool.sort((a,b)=>Number(!!stamps[a.id])-Number(!!stamps[b.id])||a.random-b.random);
    const result=[];let group='';
    while(result.length<Math.min(length,catalog.length)){
      let next=pool.findIndex(g=>g.group!==group);if(next<0)next=0;
      const g=pool.splice(next,1)[0];result.push(g.id);group=g.group;
    }
    return {ids:result,index:0,earned:[],progress:0};
  }
  function award(state,game){
    const r=state.route;if(!r||r.ids[r.index]!==game.id||r.progress<game.target)return false;
    if(r.earned.includes(game.id))return false;
    state.stamps[game.id]=(state.stamps[game.id]||0)+1;r.earned.push(game.id);
    const slot=state.cars.indexOf(null);if(slot>=0&&!state.cars.includes(game.id))state.cars[slot]=game.id;
    return true;
  }
  function next(state){
    const r=state.route;if(!r||r.index>=r.ids.length)return false;
    r.index++;r.progress=0;return r.index<r.ids.length;
  }
  return {fresh,validate,plan,award,next};
})();

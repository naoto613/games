// ================= だい3ぶ：ほしぞら れっしゃ =================
const RAIL_DIRECTIONS=[[0,-1],[1,0],[0,1],[-1,0]];
const railOpposite=dir=>(dir+2)%4;

function makeRailBoard(d){
  const tiles=Array(d.cols*d.rows).fill(null);
  const index=([x,y])=>y*d.cols+x;
  const dir=([x,y],[nx,ny])=>RAIL_DIRECTIONS.findIndex(([dx,dy])=>nx-x===dx&&ny-y===dy);
  const route=d.route.map(index);
  d.route.forEach((p,i)=>{
    tiles[route[i]]={
      ports:[i?dir(p,d.route[i-1]):3,i+1<route.length?dir(p,d.route[i+1]):1],
      initial:d.turns[i]||0,
      fixed:i===0||i===route.length-1,
      star:(d.stars||[]).includes(i),
    };
  });
  for(const [x,y,bend,initial=0] of d.extra||[]){
    tiles[index([x,y])]={ports:bend?[0,1]:[1,3],initial};
  }
  return {tiles,route,from:route[0],to:route[route.length-1],cols:d.cols,rows:d.rows,
    stars:(d.stars||[]).length};
}

function traceRail(board,turns){
  const path=[],seen=new Set();
  let i=board.from,inside=3,stars=0;
  while(!seen.has(i)){
    const tile=board.tiles[i];
    const ports=tile?.ports.map(dir=>(dir+turns[i])%4);
    if(!ports?.includes(inside))return {path,stop:i,stars,result:'gap'};
    seen.add(i);
    if(tile.star)stars++;
    const out=ports.find(dir=>dir!==inside);
    path.push({i,inside,out});
    if(i===board.to&&out===1)return {path,stop:i,stars,result:stars===board.stars?'arrived':'stars'};
    const [dx,dy]=RAIL_DIRECTIONS[out],x=i%board.cols+dx,y=Math.floor(i/board.cols)+dy;
    if(x<0||x>=board.cols||y<0||y>=board.rows)return {path,stop:i,stars,result:'gap'};
    i=y*board.cols+x;
    inside=railOpposite(out);
  }
  return {path,stop:i,stars,result:'gap'};
}

function railPoint(x,y,size,a,b,t){
  const [ax,ay]=RAIL_DIRECTIONS[a], [bx,by]=RAIL_DIRECTIONS[b];
  return [x+size*.5*((1-t)*(1-t)*ax+t*t*bx),y+size*.5*((1-t)*(1-t)*ay+t*t*by)];
}

function drawRailTrack(c,x,y,size,a,b,lit){
  const [ax,ay]=RAIL_DIRECTIONS[a], [bx,by]=RAIL_DIRECTIONS[b];
  const r=size/2;
  c.save();
  c.lineCap='round';
  c.strokeStyle=lit?'#916636':'#4b405c';
  c.lineWidth=size*.21;
  for(let n=1;n<=6;n++){
    const t=n/7;
    const [px,py]=railPoint(x,y,size,a,b,t);
    const dx=t*bx-(1-t)*ax,dy=t*by-(1-t)*ay,k=size*.162/Math.hypot(dx,dy);
    c.beginPath();c.moveTo(px-dy*k,py+dx*k);c.lineTo(px+dy*k,py-dx*k);c.stroke();
  }
  c.lineCap='butt';
  c.beginPath();c.moveTo(x+ax*r,y+ay*r);c.quadraticCurveTo(x,y,x+bx*r,y+by*r);
  c.strokeStyle=lit?'#ffdb82':'#c4e4f1';c.lineWidth=size*.19;c.stroke();
  c.strokeStyle=lit?'#945d4c':'#40556e';c.lineWidth=size*.076;c.stroke();
  c.restore();
}

function drawRailEngine(c,x,y,s,angle=0){
  c.save();c.translate(x,y);c.rotate(angle);c.scale(s,s);
  c.fillStyle='rgba(13,17,45,.45)';rr(c,-22,-14,47,31,11);c.fill();
  c.fillStyle='#673f82';
  for(const x0 of [-14,10])for(const y0 of [-13,8]){rr(c,x0-6,y0,12,6,3);c.fill();}
  c.fillStyle='#ff89ad';rr(c,-21,-11,42,22,8);c.fill();
  c.fillStyle='#e673a6';rr(c,-19,-12,18,24,5);c.fill();
  c.fillStyle='#f8d7ff';rr(c,-16,-8,9,16,3);c.fill();
  c.fillStyle='#a34f8a';circ(c,12,0,5.5);
  c.fillStyle='#ffd77e';circ(c,12,0,3.3);rr(c,18,-6,5,12,2);c.fill();
  c.restore();
}

BG.railway=function(c){
  fillAll(c,vgrad(c,VY0,VY1,['#100f35','#292354','#453267','#835280']));
  sparkles(c,36,'#e4cbfb',[VY0,360]);
  drawGlow(c,'#ffc1c5',320,228,190,.52);
  c.fillStyle='#ffdfb6';circ(c,318,215,34);
  c.fillStyle='#b6759a';circ(c,304,212,4);circ(c,323,227,7);circ(c,329,206,3);
  for(let layer=0;layer<3;layer++){
    const y=414+layer*85;
    c.fillStyle=['#3d3466','#322954','#231f4a'][layer];
    c.beginPath();c.moveTo(VX0-60,y);
    for(let x=-760;x<VX1+180;x+=160){
      c.quadraticCurveTo(x+55,y-115-hash(x,layer)*60,x+170,y+14);
    }
    c.lineTo(VX1+20,VY1+20);c.lineTo(VX0-20,VY1+20);c.fill();
  }
  // まちの 窓あかり
  for(let i=-16;i<20;i++){
    const x=25+i*32,y=474+hash(i,7)*53,w=20+hash(i,3)*8,h=25+hash(i,2)*33;
    c.fillStyle='#312448';c.fillRect(x,y-h,w,h+45);
    c.beginPath();c.moveTo(x-4,y-h);c.lineTo(x+w/2,y-h-13);c.lineTo(x+w+4,y-h);c.fill();
    c.fillStyle=hash(i,4)>.35?'#ffd391':'#a488b9';
    rr(c,x+w*.27,y-h+8,6,9,2);c.fill();
  }
  c.fillStyle='#222045';c.fillRect(VX0-2,523,VX1-VX0+4,VY1-521);
};

STEP.rail={
  enter(){
    bgm('night');
    const d=this.d;
    this.board=makeRailBoard(d.board);
    this.size=Math.min(78,320/this.board.cols,306/this.board.rows);
    this.left=200-this.board.cols*this.size/2;
    this.top=372-this.board.rows*this.size/2;
    const stored=RUN.flags.rail?.[d.board.id];
    this.turns=this.board.tiles.map((tile,i)=>tile?.fixed?0:stored?.[i]??tile?.initial??0);
    this.spin=this.turns.map(()=>0);
    this.history=[];
    this.phase='edit';
    this.notice=this.board.stars?'ほしを ひろって えきへ とどけよう':'せんろを つないで えきまで いこう';
    this.result=null;
    this.highlight=-1;
    this.cargo=0;
    instr(d.ins||(this.board.stars?'せんろを まわそう。ほしを ぜんぶ ひろって、えきへ！':'せんろを タッチして まわそう。つながったら しゅっぱつ！'));
  },
  position(i){return [this.left+(i%this.board.cols+.5)*this.size,this.top+(Math.floor(i/this.board.cols)+.5)*this.size];},
  persist(){
    if(RUN.ci<0)return;
    RUN.flags.rail={...RUN.flags.rail,[this.d.board.id]:this.turns.slice()};
    save();
  },
  update(dt){
    this.spin=this.spin.map(a=>a*Math.max(0,1-dt*16));
    if(this.phase!=='run')return;
    this.travel+=dt*4.2;
    const {path,result,stop}=this.result;
    const n=clamp(Math.floor(this.travel),0,path.length);
    while(this.passed<n){
      const {i}=path[this.passed++];
      if(!this.board.tiles[i].star)continue;
      this.cargo++;
      const [x,y]=this.position(i);
      burst(x,y,12,'star','#ffe28e');
      sfx('count',this.cargo);
    }
    if(this.travel<path.length+.25)return;
    if(result==='arrived'){
      this.phase='done';
      this.notice=this.d.done||'とうちゃく！ えきに あかりが ともったよ';
      sfx('fanfare');
      say(this.notice,'fu');
      confetti(52);
      finish(this,2.5);
      return;
    }
    this.phase='edit';
    this.highlight=result==='gap'?stop:-1;
    this.notice=result==='stars'?'まだ ひろっていない ほしが あるよ':'ここで せんろが きれてるよ';
    sfx('tap');
    say(this.notice,'rk');
  },
  draw(c){
    const {board,size}=this;
    drawBG(c,'railway');
    const [sx,sy]=this.position(board.from),[gx,gy]=this.position(board.to);
    txt(c,this.d.label,200,169,21,'#fff1da');
    txt(c,'しゅっぱつ',sx,199,13,'#ffe4aa');
    txt(c,'えき',gx,199,13,'#ffe4aa');
    c.fillStyle='#151832';rr(c,19,211,362,326,20);c.fill();
    c.strokeStyle='#8072ac';c.lineWidth=2;c.stroke();
    const lit=new Set(this.result?.path.slice(0,this.passed).map(p=>p.i));
    board.tiles.forEach((tile,i)=>{
      const [x,y]=this.position(i);
      const hi=i===this.highlight;
      c.fillStyle=!tile?'#1e2343':tile.fixed?'#494164':'#30395c';
      rr(c,x-size/2+2,y-size/2+2,size-4,size-4,9);c.fill();
      c.strokeStyle=hi?'#ffdf8a':tile?.fixed?'#b88ebe':'#43516f';
      c.lineWidth=hi?3:1;c.stroke();
      if(!tile){
        c.fillStyle='#4f557a';starP(c,x,y,5,1.4,4);c.fill();
        return;
      }
      c.save();
      c.translate(x,y);
      c.rotate((this.turns[i]+this.spin[i])*Math.PI/2);
      drawRailTrack(c,0,0,size,tile.ports[0],tile.ports[1],lit.has(i));
      c.restore();
      if(tile.star){
        const collected=lit.has(i);
        if(!collected)drawGlow(c,'#ffd97a',x,y,24,.74);
        c.fillStyle=collected?'#977b9a':'#ffdd85';
        starP(c,x,y,10,4.4);c.fill();
        c.strokeStyle='#312543';c.lineWidth=1.4;c.stroke();
      }
    });
    c.fillStyle=this.phase==='done'?'#ffe390':'#9e7aaa';circ(c,gx+size*.48,gy,7);
    c.strokeStyle='#201b3c';c.lineWidth=2;c.stroke();
    let x=sx-size*.39,y=sy,angle=0;
    if(this.phase==='run'&&this.travel>=0){
      const path=this.result.path,at=Math.min(path.length-1,Math.floor(this.travel));
      const step=path[at];
      const [px,py]=this.position(step.i), t=clamp(this.travel-at,0,1);
      [x,y]=railPoint(px,py,size,step.inside,step.out,t);
      const [ax,ay]=RAIL_DIRECTIONS[step.inside],[bx,by]=RAIL_DIRECTIONS[step.out];
      angle=Math.atan2(t*by-(1-t)*ay,t*bx-(1-t)*ax);
    }else if(this.phase==='done'){x=gx+size*.39;y=gy;}
    drawRailEngine(c,x,y,Math.min(.78,size/73),angle);
    if(board.stars){
      for(let n=0;n<board.stars;n++){
        c.fillStyle=n<this.cargo?'#ffde83':'#61517e';
        starP(c,200+(n-(board.stars-1)/2)*24,554,9,4);c.fill();
      }
    }
    txt(c,this.notice,200,583,16,'#fff2e1');
    const active=this.phase==='edit';
    drawBtn(c,203,646,155,56,this.phase==='done'?'とうちゃく！':'しゅっぱつ',active?'#de7aa1':'#87688b',{size:19});
    drawBtn(c,75,646,92,48,'もどす',active&&this.history.length?'#737fbd':'#5b527a',{size:16});
    drawBtn(c,331,646,92,48,'ヒント',active?'#8671bc':'#5b527a',{size:16});
  },
  down(x,y){
    if(this.phase!=='edit')return;
    if(inR(x,y,203,646,155,56)){
      this.result=traceRail(this.board,this.turns);
      this.phase='run';this.travel=-.35;this.passed=0;this.cargo=0;this.highlight=-1;
      this.notice='ポッポー！ れっしゃが すすむよ';
      tone(560,.26,'sine',.09,480);tone(480,.18,'sine',.08,410,.28);
      return;
    }
    if(inR(x,y,75,646,92,48)){
      const prev=this.history.pop();
      if(prev){const [i,turn]=prev;this.turns[i]=turn;this.spin[i]+=1;this.changed();}
      return;
    }
    if(inR(x,y,331,646,92,48)){
      const i=this.board.route.find(i=>{
        const tile=this.board.tiles[i],period=railOpposite(tile.ports[0])===tile.ports[1]?2:4;
        return this.turns[i]%period!==0;
      });
      this.highlight=i??-1;
      this.notice=i===undefined?'せんろが つながったよ。しゅっぱつ！':'ひかっている せんろを まわそう';
      sfx('tap');say(this.notice,'rk');
      return;
    }
    const col=Math.floor((x-this.left)/this.size),row=Math.floor((y-this.top)/this.size);
    if(col<0||col>=this.board.cols||row<0||row>=this.board.rows)return;
    const i=row*this.board.cols+col,tile=this.board.tiles[i];
    if(!tile||tile.fixed)return;
    this.history.push([i,this.turns[i]]);
    this.turns[i]=(this.turns[i]+1)%4;
    this.spin[i]-=1;
    this.changed();
  },
  changed(){
    if(this.result?.result==='stars')this.notice='ほしを ひろって えきへ とどけよう';
    else this.notice='つながったら しゅっぱつ！';
    this.result=null;this.cargo=0;this.highlight=-1;
    sfx('click');
    this.persist();
  },
};

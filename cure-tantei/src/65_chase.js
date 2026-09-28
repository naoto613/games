// ================= chase (おいかけっこ) =================
const GY=575;
STEP.chase={
  enter(){const d=this.d;this.bg=d.bg||'town';bgm('battle');this.t=0;this.len=d.len||22;this.fy=0;this.vy=0;this.obs=[];this.stars=[];this.spawn=1.4;this.sspawn=.4;this.got=0;this.stun=0;this.scroll=0;this.ph='run';this.ct=0;RUN.cure=false;RUN.doc=false;
    instr(d.ins||`にげる ${d.target==='moya'?'モヤモヤン':'クロニャン'}を おいかけよう！ タッチで ジャンプ！ ほしも あつめてね`,'fu');},
  update(dt){const d=this.d;this.t+=dt;if(this.stun>0)this.stun-=dt;
    if(this.fy>0||this.vy!==0){this.fy+=this.vy*dt;this.vy-=1600*dt;if(this.fy<=0){this.fy=0;this.vy=0;}}
    if(this.ph==='run'){const sp=250*(this.stun>0?.45:1);this.scroll+=sp*dt;
      if(this.t<this.len-2){this.spawn-=dt;if(this.spawn<=0){this.spawn=rand(1.5,2.4);this.obs.push({x:470,k:pick(this.bg==='snow'?['snowman','rock']:this.bg==='beach'?['crab','sand']:this.bg==='night'?['rock','box']:['box','cone']),hit:false});}
        this.sspawn-=dt;if(this.sspawn<=0){this.sspawn=rand(.6,1);const h=pick([40,40,110,150]);this.stars.push({x:470,y:GY-h,got:false});}}
      for(const o of this.obs){o.x-=sp*dt;if(!o.hit&&this.stun<=0&&Math.abs(o.x-100)<30&&this.fy<40){o.hit=true;this.stun=.9;sfx('hurt');SHAKE=.2;say(pick(['いたた！','おっとっと！']),'fu');}}
      for(const s of this.stars){s.x-=sp*dt;if(!s.got&&Math.hypot(s.x-100,s.y-(GY-this.fy-45))<42){s.got=true;this.got++;sfx('coin');floatText(s.x,s.y-20,String(this.got),'#ffb03a',22);}}
      this.obs=this.obs.filter(o=>o.x>-60);this.stars=this.stars.filter(s=>s.x>-60&&!s.got);
      if(this.t>=this.len){this.ph='catch';this.ct=0;sfx('fanfare');const n=Math.min(this.got,20);say(`つかまえた！ ほしは ${JA_NUM[n]}こ あつめたよ！`,'fu',n+' stars!');}}
    if(this.ph==='catch'){this.ct+=dt;if(this.ct>3.2&&this.fin==null)finish(this,.1);}},
  draw(c){const d=this.d;drawBG(c,this.bg);const p=clamp(this.t/this.len,0,1);
    c.fillStyle=this.bg==='beach'?'#f0d090':this.bg==='night'?'#2a3a2a':this.bg==='snow'?'#e4f0fc':this.bg==='fair'?'#e8d0a8':'#c8c0b8';c.fillRect(VX0-2,GY,VX1-VX0+4,VY1-GY);c.fillStyle='rgba(255,255,255,.3)';for(let x=-(this.scroll%80)+VX0-80;x<VX1;x+=80)c.fillRect(x,GY+14,40,8);
    for(const s of this.stars){drawGlow(c,'#fff6a0',s.x,s.y,26,.6);drawIcon(c,'star',s.x,s.y,.8);}
    for(const o of this.obs){c.save();c.translate(o.x,GY);if(o.k==='box'){c.fillStyle='#d8a060';rr(c,-22,-44,44,44,4);c.fill();c.strokeStyle=LN;c.lineWidth=2.5;c.stroke();c.beginPath();c.moveTo(-22,-22);c.lineTo(22,-22);c.stroke();}
      else if(o.k==='cone'){c.fillStyle='#ff8a2a';c.beginPath();c.moveTo(-18,0);c.lineTo(0,-46);c.lineTo(18,0);c.closePath();c.fill();c.strokeStyle=LN;c.lineWidth=2.5;c.stroke();c.fillStyle='#fff';c.fillRect(-9,-24,18,6);}
      else if(o.k==='rock'){c.fillStyle='#8a8aa0';ell(c,0,-18,24,20);c.strokeStyle=LN;c.lineWidth=2.5;c.stroke();}
      else if(o.k==='sand'){c.fillStyle='#e8c070';rr(c,-22,-30,44,30,4);c.fill();c.strokeStyle=LN;c.lineWidth=2.5;c.stroke();c.fillRect(-8,-44,16,14);c.strokeRect(-8,-44,16,14);}
      else if(o.k==='snowman')drawIcon(c,'snowman',0,-30,1.5);else drawIcon(c,'crab',0,-20,1.1);c.restore();}
    const kx=this.ph==='catch'?lerp(330-p*110,160,Math.min(1,this.ct)):330-p*110+Math.sin(this.t*3)*8;
    if(d.target==='moya')drawGhost(c,kx,GY,1,this.t*2,{sad:this.ph==='catch'});else drawKuro(c,kx,GY,.9,this.t*2,this.ph==='catch'?'sad':'');
    drawFutan(c,this.ph==='catch'?lerp(100,110,Math.min(1,this.ct)):100,GY-this.fy,{s:1.9,moving:this.ph==='run'&&this.fy===0,t:this.t,ouch:this.stun>0,pose:this.ph==='catch'?'point':this.fy>0?'win':'run'});
    drawRicky(c,50,GY-80-this.fy*.5,{s:1.3,t:this.t});
    c.fillStyle='rgba(255,255,255,.9)';rr(c,40,160,320,28,14);c.fill();c.fillStyle=vfill(c,160,188,'#ff8cc6');rr(c,44,164,312*p,20,10);c.fill();drawFutan(c,44+312*p,190,{s:.55,noShadow:1});if(d.target==='moya')drawGhost(c,356,200,.3,T);else drawKuro(c,356,196,.22,T);
    c.fillStyle='rgba(255,255,255,.9)';rr(c,290,200,90,40,20);c.fill();drawIcon(c,'star',312,220,.6);otext(c,String(this.got),350,221,22,'#ffb03a','#fff');
    if(this.ph==='catch')otext(c,'つかまえた！',200,330,40,'#fff','#ff5fa2');},
  down(){if(this.ph==='run'&&this.fy===0&&this.vy===0){this.vy=720;sfx('jump');}},
  hint(){const o=this.obs.find(o=>o.x>120&&o.x<260&&!o.hit);return o&&this.fy===0?{x:200,y:420}:null;},
};

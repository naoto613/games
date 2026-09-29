// ================= どうぐの「さきっぽ」で あたりはんてい =================
// [x, y, rotate] … どうぐの え(M/drawItem)の なかでの さきっぽの いち
const TIPD={drill:[6,-33,-.5],mirror:[0,-18,-.6],tweezers:[0,-30,-.6],toothbrush:[-7,-14,-.6],syringe:[0,36,-.75],thermometer:[0,31,-.45],
  light:[0,-40,-.7],loupe:[0,-6,-.5],eyedrop:[0,-33,.3],steth:[12,26,0],swab:[0,-28,-.7]};
function tipRel(k,sz,s,rot,lift){const d=TIPD[k];if(!d)return{x:0,y:-lift};const a=d[2]+rot,co=Math.cos(a),si=Math.sin(a),z=sz*s;return{x:(d[0]*co-d[1]*si)*z,y:(d[0]*si+d[1]*co)*z-lift};}
Dr.prototype.tip=function(){const o=tipRel(this.k,this.dsz||1.4,this.s,this.rot,this.held?14:0);return{x:this.x+o.x,y:this.y+o.y};};
// ヒント（ドラッグさき）: さきっぽが g に くるように ゆびの いちを ずらす
Dr.prototype.aim=function(g){const o=tipRel(this.k,this.hsz||this.dsz||1.4,1.25,0,14);return{x:g.x-o.x,y:g.y-o.y};};
{const _dr=Dr.prototype.draw;Dr.prototype.draw=function(c,sz=1.4){this.dsz=sz;if(this.held)this.hsz=sz;_dr.call(this,c,sz);
  if(this.held&&!this.hidden&&TIPD[this.k]){const p=this.tip(),k=.5+.5*Math.sin(T*10);c.strokeStyle=`rgba(255,95,162,${.45+k*.4})`;c.lineWidth=3;c.beginPath();c.arc(p.x,p.y,7+k*3,0,TAU);c.stroke();c.fillStyle='rgba(255,255,255,.9)';circ(c,p.x,p.y,2.5);}};}

// ================= quests / chest / golden gacha =================
if(!SAVE.plays||typeof SAVE.plays!=='object')SAVE.plays={};
function lvOf(id){return SAVE.plays[id]||0;}
function newQuest(){const prev=SAVE.quest&&SAVE.quest.list||[];let ids;do ids=shuffle(PLACES.map(p=>p.id)).slice(0,3);while(ids.some(i=>prev.includes(i))&&Math.random()<.8);SAVE.quest={list:ids,done:[],chest:false,n:(SAVE.quest&&SAVE.quest.n)||0};save();}
if(!SAVE.quest||!Array.isArray(SAVE.quest.list)||SAVE.quest.list.some(id=>!PLACES.find(p=>p.id===id)))newQuest();
function questMark(place){const q=SAVE.quest;if(q.list.includes(place)&&!q.done.includes(place)){q.done.push(place);if(q.done.length>=q.list.length){q.chest=true;q.n++;}save();return true;}return false;}
function placeName(id){const p=PLACES.find(p=>p.id===id);return p?p.ja:'';}
function drawChest(c,x,y,s,open,t){c.save();c.translate(x,y);c.scale(s,s);
  if(!open){const g=c.createRadialGradient(0,-30,10,0,-30,120);g.addColorStop(0,'rgba(255,240,150,.8)');g.addColorStop(1,'rgba(255,240,150,0)');c.fillStyle=g;circ(c,0,-30,120);c.rotate(Math.sin(t*9)*.05*(Math.sin(t*1.7)>.3?1:0));}
  c.fillStyle='rgba(90,50,40,.25)';ell(c,0,8,80,14);
  c.fillStyle=vfill(c,-50,6,'#c8703a',.15,-.15);rr(c,-70,-50,140,58,8);c.fill();c.strokeStyle='#7a3a1a';c.lineWidth=4;c.stroke();
  c.fillStyle='#ffd23a';c.fillRect(-70,-36,140,10);c.fillRect(-44,-50,12,58);c.fillRect(32,-50,12,58);
  c.save();c.translate(0,-50);c.rotate(-open*1.9);c.fillStyle=vfill(c,-44,0,'#d8804a',.2,-.1);c.beginPath();c.moveTo(-70,0);c.lineTo(-70,-20);c.quadraticCurveTo(0,-60,70,-20);c.lineTo(70,0);c.closePath();c.fill();c.strokeStyle='#7a3a1a';c.stroke();
  c.fillStyle='#ffd23a';c.fillRect(-44,-38,12,38);c.fillRect(32,-38,12,38);c.restore();
  c.fillStyle='#ffd23a';rr(c,-12,-44,24,26,5);c.fill();c.strokeStyle='#c89000';c.lineWidth=2;c.stroke();c.fillStyle='#7a3a1a';circ(c,0,-33,4);
  if(open>0){for(let i=0;i<7;i++){const a=-Math.PI/2+(i-3)*.3;c.strokeStyle=`rgba(255,230,120,${.7*open})`;c.lineWidth=10;c.beginPath();c.moveTo(0,-52);c.lineTo(Math.cos(a)*200*open,-52+Math.sin(a)*200*open);c.stroke();}}
  c.restore();}

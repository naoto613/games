// ================= だい2ぶ：てがかりノート =================
STEP.evidence={
  enter(){
    RUN.doc=false;RUN.cure=false;
    bgm('search');
    this.choices=shuffle(this.d.choices);
    this.mark=null;
    this.hints=0;
    this.message='どれか ひとつ タッチしてね';
    instr(this.d.q);
  },
  cardY(i){return 296+i*91;},
  draw(c){
    drawBG(c,this.d.bg);
    fillAll(c,'rgba(41,24,63,.58)');
    c.fillStyle='#372653';rr(c,19,177,362,503,24);c.fill();
    c.fillStyle='#e5d2fa';rr(c,22,164,356,505,22);c.fill();
    c.fillStyle='#fffbef';rr(c,30,173,340,482,17);c.fill();
    c.fillStyle='#7548a9';rr(c,104,174,192,42,13);c.fill();
    txt(c,'てがかり ノート',200,194,20,'#fff');
    c.font=`800 15px ${FONT}`;
    const witnessLines=wrap(c,this.d.witness,295);
    witnessLines.forEach((line,i)=>txt(c,line,200,235+i*16,15,'#533b6e'));
    this.choices.forEach((choice,i)=>{
      const [icon,label,correct]=choice,y=this.cardY(i);
      const selected=this.mark===choice,help=this.hints>=2&&correct;
      c.fillStyle=selected&&correct?'#def3de':selected?'#f4edfc':help?'#fff3c9':'#f6eeff';
      rr(c,47,y-34,306,68,15);c.fill();
      c.strokeStyle=selected&&correct?'#40936d':help?'#b88120':'#c1a7e5';
      c.lineWidth=help||selected?3:2;c.stroke();
      c.fillStyle='#fff';circ(c,85,y,23);
      drawIcon(c,icon,85,y,.82);
      txt(c,label,122,y,16,'#492c62','left');
      if(selected||help)txt(c,correct?'✓':'↺',327,y,22,correct?'#237452':'#7c5a9c');
    });
    c.font=`800 16px ${FONT}`;
    const lines=wrap(c,this.message,288);
    lines.forEach((line,i)=>txt(c,line,200,547+i*21,16,'#492c62'));
    if(this.fin==null)drawBtn(c,200,615,150,47,'ヒント','#9871ca',{icon:'lens',size:18});
  },
  down(x,y){
    if(this.fin!=null)return;
    if(inR(x,y,200,615,150,47)){
      this.hints++;
      this.message=this.hints>=2?'ひかる カードを みてね。':this.d.hint;
      say(this.message,'rk');
      sfx('tap');
      return;
    }
    const i=this.choices.findIndex((_,j)=>inR(x,y,200,this.cardY(j),306,68));
    if(i<0)return;
    this.mark=this.choices[i];
    if(this.mark[2]){
      this.message=this.d.answer;
      sfx('stamp');
      burst(327,this.cardY(i),15,'star','#ffd670');
      say(this.message,'fu');
      finish(this,3.1);
    }else{
      this.message=this.d.hint;
      sfx('tap');
      say(this.message,'rk');
    }
  },
};

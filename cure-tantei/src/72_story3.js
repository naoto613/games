// ================= だい3ぶ：ほしぞら れっしゃと きえた あかり =================
NPC.conductor={kind:'owl',name:'フクロウ しゃしょう',acc:['cap:#c65c89'],vo:[1.1,1]};
NPC.kohoshi={kind:'chick',name:'こぼしちゃん',acc:['bow:#d36a98'],vo:[1.75,1.02]};

CHAPTERS.push(
  {part:3,title:'ほしぞら えきの きえた あかり',icon:'star',bg:'railway',steps:[
    {t:'talk',bg:'railway',bgm:'night',cast:['fu','rk','conductor'],lines:[
      ['narr','ほしの おまつりの よる。 ふーちゃんたちは、 ほしぞら えきに やってきた。'],
      ['conductor','たいへんだホー！ えきの あかりが きえて、 せんろも バラバラだホー。',{emo:'sad'}],
      ['rk','あっ、 ちいさな あしあと！ せんろの さきまで つづいてるよ。'],
      ['fu','れっしゃで おいかけよう。 せんろは タッチすると まわるよ！',{emo:'happy'}],
    ]},
    {t:'rail',label:'えきまえの せんろ',board:{
      id:'station',cols:3,rows:3,
      route:[[0,1],[1,1],[2,1]],turns:[0,1,0],
    }},
    {t:'talk',bg:'railway',bgm:'night',cast:['fu','rk','conductor'],lines:[
      ['conductor','ポッポー！ れっしゃが うごいたホー！',{emo:'happy'}],
      ['rk','あしあと、 あっちに まがってる！'],
      ['fu','こんどは まがる せんろを つないで、 はしを わたろう！'],
    ]},
    {t:'rail',label:'つきかげ ばし',board:{
      id:'bridge',cols:4,rows:3,
      route:[[0,2],[1,2],[1,1],[2,1],[3,1]],turns:[0,3,2,1,0],
      extra:[[1,0,true,1],[2,2,true,3]],
    }},
    {t:'talk',bg:'railway',bgm:'night',cast:['fu','rk','conductor','moya'],set:{moya:'kind'},lines:[
      ['moya','ふーちゃん！ おまつりの あかりが、 ちいさな ほしに なって とんでったモヤ！'],
      ['fu','あしあとは、 ほしを おいかけた モヤモヤンの だったんだね。'],
      ['conductor','あの ほしを えきへ はこべば、 あかりが もどるホー。'],
      ['fu','よーし。 ほしを ひろう れっしゃで しゅっぱつ！',{emo:'happy',fx:'sparkle'}],
    ]},
  ]},
  {part:3,title:'もりに おちた ほしの かけら',icon:'moon',bg:'railway',steps:[
    {t:'talk',bg:'railway',bgm:'night',cast:['fu','rk','moya'],set:{moya:'kind'},lines:[
      ['moya','もりの なかで、 ちいさな ほしが ひかってるモヤ！'],
      ['fu','ほしの マスを とおるように、 せんろを つなごう！'],
    ]},
    {t:'rail',label:'ほたるの もり',board:{
      id:'woods',cols:4,rows:4,
      route:[[0,2],[1,2],[1,1],[2,1],[2,2],[3,2]],turns:[0,2,3,0,3,0],stars:[2],
      extra:[[1,3,true,3],[2,3,true,0]],
    }},
    {t:'talk',bg:'railway',bgm:'night',cast:['fu','rk','moya','kohoshi'],set:{moya:'kind'},lines:[
      ['kohoshi','あの ほし、 ひろって くれたの？ ありがとう ピヨ！',{emo:'happy'}],
      ['kohoshi','おまつりに おおきな ほしを みせたくて、 かかえて いたら、 ころんじゃった ピヨ。',{emo:'sad'}],
      ['moya','それで ほしが ばらばらに なっちゃったモヤね。'],
      ['fu','だいじょうぶ。 いっしょに あつめよう。 つぎは ほしが ふたつ あるよ！'],
    ]},
    {t:'rail',label:'ほしくずの おか',board:{
      id:'hill',cols:5,rows:4,
      route:[[0,3],[1,3],[1,2],[2,2],[2,1],[2,0],[3,0],[3,1],[4,1]],
      turns:[0,3,0,1,1,2,0,3,0],stars:[3,6],
      extra:[[2,3,false],[3,3,true,3],[3,2,false,1],[1,1,true,1],[0,1,true,2]],
    }},
    {t:'talk',bg:'railway',bgm:'night',cast:['fu','rk','moya','kohoshi'],set:{moya:'kind'},lines:[
      ['narr','あつめた ほしが ならんで、 よぞらに ひかる みちが できた。',{fx:'sparkle'}],
      ['rk','あの みち、 そらの えきまで つづいてる！'],
      ['kohoshi','さいごの ほしは、 きっと あの えきの ちかく ピヨ。'],
    ]},
  ]},
  {part:3,title:'そらの えきと ほしの おまつり',icon:'smilestar',bg:'railway',steps:[
    {t:'talk',bg:'railway',bgm:'night',cast:['fu','rk','moya','kohoshi'],set:{moya:'kind'},lines:[
      ['rk','えきまでの ちかみちを みつけたよ！'],
      ['moya','でも、 ぜんぶの ほしを ひろうには、 まわりみちも だいじモヤ！'],
      ['fu','せんろを よく みて、 ほしを ひとつずつ ひろおう。'],
    ]},
    {t:'rail',label:'くもの てっきょう',board:{
      id:'cloud',cols:5,rows:4,
      route:[[0,1],[1,1],[1,2],[2,2],[2,3],[3,3],[4,3],[4,2],[3,2],[3,1],[4,1]],
      turns:[0,2,1,0,2,1,1,2,0,3,0],stars:[4,9],
      extra:[[2,1,false],[2,0,true,1],[3,0,true,3],[1,0,true,1]],
    }},
    {t:'talk',bg:'railway',bgm:'night',cast:['fu','rk','moya','kohoshi'],set:{moya:'kind'},lines:[
      ['kohoshi','あっ、 のこりの ほしが みっつ！ みえる ピヨ！'],
      ['fu','これが さいごの せんろだね。 みんなで そらの えきに あかりを ともそう！'],
    ]},
    {t:'rail',label:'ほしぞら しゅうてん',done:'ほしが そろった！ おまつりの あかりだ！',board:{
      id:'terminus',cols:5,rows:4,
      route:[[0,2],[1,2],[1,3],[2,3],[2,2],[2,1],[1,1],[1,0],[2,0],[3,0],[3,1],[3,2],[3,3],[4,3]],
      turns:[0,3,0,2,1,2,0,1,1,0,1,0,3,0],stars:[2,7,10],
      extra:[[0,1,true,3],[4,1,true,1],[4,2,false,1]],
    }},
    {t:'talk',bg:'railway',bgm:'night',cast:['fu','rk','moya','kohoshi'],set:{moya:'kind'},lines:[
      ['narr','ポッポー！ れっしゃが つくと、 ほしの あかりが いっせいに ともった。',{fx:'confetti'}],
      ['kohoshi','ほしを ひとりで はこばなくても、 みんなに おねがいして よかったんだね ピヨ。',{emo:'happy'}],
      ['moya','うん！ きょうは みんなで おまつりだモヤ！'],
      ['fu','ほしぞら れっしゃの じけん、 かいけつ！',{emo:'happy',fx:'sparkle'}],
    ]},
  ]}
);

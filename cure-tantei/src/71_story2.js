// ================= だい2ぶ：おばけの おうさま モヤモヤン（じけん 9〜11） =================
Object.assign(NPC,{zouB:{kind:'elephant',name:'ふうせんやの ぞうさん',acc:['cap:#ff6f91'],vo:[.85,.95]}});
CHAPTERS.push(
// ---------------- 9 ----------------
{title:'ゆうえんちの ふうせん どろぼう',icon:'balloon',bg:'fair',part:2,steps:[
  {t:'talk',bg:'office',cast:['fu','rk'],lines:[
    ['narr','ひかりの ジュエルが そろって、まちは へいわに なった… はずだった。'],
    ['kuro','ふーちゃーん！ きょうから たんてい じむしょの じょしゅ ニャ！',{in:'kuro',emo:'happy'}],
    ['rk','クロニャン、たんていの じょしゅ だって！ ばぶー！',{emo:'happy'}],
    ['narr','ジリリリン！',{fx:'ring'}],
    ['zouB','ゆうえんちの ぞうです！ ふうせんが ぜんぶ きえて、はいいろの もやもやが…！'],
    ['fu','もやもや？ みんなで しらべに いこう！',{emo:'happy'}]]},
  {t:'talk',bg:'fair',cast:['fu','rk','zouB','kuro'],set:{kuro:'happy'},lines:[
    ['zouB','あさ おきたら、ふうせんが ひとつも ないんです…',{emo:'sad'}],
    ['kuro','ぼ、ぼくじゃ ないニャ！ もう わるいことは しないニャ！',{emo:'sad'}],
    ['fu','わかってるよ、クロニャン。 いっしょに てがかりを さがそう！',{set:{kuro:'happy'}}],
    ['rk','むしめがね、しゅつどう！',{show:'lens'}]]},
  {t:'search',bg:'fair',clues:[['fog','はいいろの もやもや'],['balloon','われた ふうせん'],['ticket','おちてた チケット']]},
  {t:'diff',bg:'fair',ins:'きのうの しゃしんと いまを くらべて、ちがう ところを 3つ さがそう！',
    pic:[['balloon',50,70,1.1],['balloon',92,56,1.1],['balloon',134,72,1.1],['sun',280,40,.9],['cloud',190,38,.8],['a:elephant',95,152,1.2],['icecream',190,152,1],['popcorn',250,152,1],['flower',30,182,.7],['flower',300,184,.7]],
    diffs:[[1,'gone'],[3,'moon'],[7,'ticket']],done:'ぜんぶ みつけた！ おひさまが おつきさまに なってる… まほうの しわざだ！'},
  {t:'talk',bg:'fair',cast:['fu','rk','hiyoko'],lines:[
    ['hiyoko','ピヨ〜… め が グルグル まわる〜',{emo:'sick'}],
    ['fu','ひよこちゃん！ だいじょうぶ？ すぐ しんさつ するね！']]},
  {t:'doctor',bg:'fair',pt:'hiyoko',say:'コーヒーカップに 10かいも のったら、め が グルグル…',sick:true,
    tools:{thermo:36.6,steth:'fast',light:'ok',xray:'ok',lens:'ok'},need:['steth','thermo'],
    diag:{ans:'dizzy',wrong:['tooth','thorn'],ok:'のりものに のりすぎて、めが まわっちゃったんだね'},
    treat:[{t:'sleep'},{t:'med',col:'orange'}],end:'もう グルグル しない！ ありがとう、せんせい！'},
  {t:'talk',bg:'fair',cast:['fu','rk','hiyoko'],lines:[
    ['hiyoko','はいいろの おばけが 「もっと のるモヤ〜」って、カップを まわしつづけたの！',{emo:'sad'}],
    ['fu','おばけ…？ チケットに 「かんらんしゃ」って かいてある！',{emo:'think'}],
    ['rk','かんらんしゃの うえ、みて！ ふうせんが ひっかかってる！']]},
  {t:'count',bg:'fair',icon:'balloon',n:8,ins:'かんらんしゃに ふうせんが ひっかかってる！ いくつ あるか タッチして かぞえよう'},
  {t:'talk',bg:'fair',cast:['fu','rk','kuro'],set:{kuro:'happy'},lines:[
    ['moya','モヤ〜ン！ ふうせんは ぜんぶ ぼくの ものだモヤ！',{in:'moya',fx:'dark'}],
    ['moya','ぼくは おばけの おうさま、モヤモヤン！ まちじゅう もやもやに してやるモヤ〜！',{fx:'boom'}],
    ['fu','ふうせんは みんなの ものだよ！ かえして！'],
    ['moya','いやだモヤ！ ふうせんモンスター、いけ〜！',{fx:'dark'}],
    ['kuro','ふーちゃん、へんしんニャ！ ぼくも てつだうニャ！']]},
  {t:'battle',mon:{kind:'balloon',name:'ふうせんモンスター',col:'#ff6f91'},lv:2,chances:['color','count'],fin:'heart',item:'balloon',ally:'kuro'},
  {t:'talk',bg:'fair',cure:true,cast:['fu','rk','zouB','moya'],lines:[
    ['narr','ふうせんが そらいっぱいに もどった！',{fx:'confetti'}],
    ['zouB','ありがとう、キュアふーちゃん！',{emo:'happy'}],
    ['moya','く、くやしいモヤ〜！ つぎは もっと すごい いたずらを するモヤ！',{emo:'sad'}],
    ['narr','モヤモヤンは もやもやの なかに きえていった。',{out:'moya'}],
    ['fu','モヤモヤン… なんだか さみしそうな め だったね',{emo:'think'}],
    ['narr','ふうせんの なかから きらきら ひかる スターが でてきた！',{show:'smilestar'}],
    ['rk','えがおの スター だって！ みんなが わらうと ひかるんだよ！',{emo:'happy'}]]},
]},
// ---------------- 10 ----------------
{title:'ゆきやまの こおりの ゆきだるま',icon:'snowflake',bg:'snow',part:2,steps:[
  {t:'talk',bg:'office',cast:['fu','rk'],lines:[
    ['narr','ジリリリン！',{fx:'ring'}],
    ['pen','ゆきやまの ペンギンです！ ゆきだるまが うごきだして… ハ、ハクション！'],
    ['fu','ペンギンくん、かぜ ひいてる？ おいしゃさんの どうぐも もっていこう！'],
    ['witch','わたしも いくわ。 こおりの まほうなら まかせて',{in:'witch',emo:'kind'}],
    ['rk','ドロドロンも いっしょ！ ばぶー！',{emo:'happy'}]]},
  {t:'talk',bg:'snow',doc:true,cast:['fu','rk','pen','witch'],set:{witch:'kind'},lines:[
    ['pen','さむいのは へいきな はずなのに… ハクション！',{emo:'sick'}],
    ['fu','まずは しんさつ しよう！']]},
  {t:'doctor',bg:'snow',pt:'pen',say:'ハクション！ あたまが ぽかぽか あついペン…',sick:true,
    tools:{thermo:38.5,steth:'fast',light:'red',xray:'ok',lens:'ok'},need:['thermo','light'],
    diag:{ans:'cold',wrong:['tummy','scrape'],ok:'ペンギンくんも かぜを ひくんだね！'},
    treat:[{t:'ice'},{t:'med',col:'blue'},{t:'sleep'}],end:'げんきに なったペン！ ありがとう！'},
  {t:'talk',bg:'snow',cast:['fu','rk','pen','witch'],set:{witch:'kind'},lines:[
    ['pen','ゆきだるまは ふぶきの むこうから きたペン'],
    ['witch','この つめたい もやもや… モヤモヤンの まほうの においが するわ'],
    ['rk','ゆきに カードが うもれてる！']]},
  {t:'memory',bg:'snow',pairs:['snowflake','snowman','mitten','fish','star','moon'],ins:'ゆきの なかの カードを めくって、おなじ えを 2まい そろえよう！',done:'ぜんぶ そろった！ カードの うらに ちずが かいてある！'},
  {t:'search',bg:'snow',clues:[['fog','つめたい もやもや'],['mitten','かたほうの てぶくろ'],['crown','ちいさな おうかん']]},
  {t:'abc',bg:'snow',word:'SNOW',pic:'snowflake',say:'こおりの とびらの あいことば！ この じゅんばんで タッチ',done:'ゆき！ こおりの とびらが とけた！'},
  {t:'talk',bg:'snow',cast:['fu','rk','witch'],set:{witch:'kind'},lines:[
    ['moya','モヤ〜ン！ ゆきやまも ぼくの ものだモヤ！',{in:'moya',fx:'shake'}],
    ['fu','モヤモヤン！ みんなを こまらせないで！'],
    ['moya','つかまえられるなら つかまえて みるモヤ〜！',{out:'moya'}],
    ['rk','まてまて〜！ ゆきの うえを はしろう！']]},
  {t:'chase',bg:'snow',target:'moya',len:24},
  {t:'talk',bg:'snow',cast:['fu','rk','witch','moya'],set:{witch:'kind'},lines:[
    ['moya','はぁ はぁ… しつこいモヤ！ ゆきだるまモンスター、こおらせちゃえ！',{fx:'dark'}],
    ['witch','ふーちゃん、わたしの まほうで てつだうわ！'],
    ['fu','いくよ！ プリキュア！']]},
  {t:'battle',mon:{kind:'snowman',name:'ゆきだるまモンスター',col:'#5aa8ff'},lv:3,chances:['letter','word'],fin:'diamond',item:'snowman',ally:'witch'},
  {t:'talk',bg:'snow',cure:true,cast:['fu','rk','pen','moya'],lines:[
    ['narr','ゆきだるまが やさしい かおに もどった！',{fx:'confetti'}],
    ['pen','ゆきだるまくん、おかえり ペン！',{emo:'happy'}],
    ['moya','どうして… どうして だれも ぼくと あそんで くれないモヤ…',{emo:'sad'}],
    ['narr','モヤモヤンは なきながら、くもの うえへ とんでいった。',{out:'moya'}],
    ['witch','あの こ… むかしの わたしと おなじ。 ひとりぼっち なのかも しれないわ',{in:'witch',emo:'kind'}],
    ['fu','こんどは モヤモヤンと ともだちに なろう！',{emo:'happy'}],
    ['narr','ゆきだるまの マフラーから えがおの スターが！',{show:'smilestar'}],
    ['rk','えがおの スター 2こめ！']]},
]},
// ---------------- 11 ----------------
{title:'くもの うえの モヤモヤじょう',icon:'ghost',bg:'sky',part:2,steps:[
  {t:'talk',bg:'sky',flag:{clear:false},cast:['fu','rk','kuro','witch'],set:{witch:'kind',kuro:'happy'},lines:[
    ['narr','2この えがおの スターが ひかって、くもの うえへの みちが できた！',{fx:'sparkle'}],
    ['kuro','あれが モヤモヤじょう ニャ！'],
    ['witch','まちの もやもやは、ぜんぶ あそこから でているわ'],
    ['fu','みんなで いこう！ モヤモヤンに あいに！']]},
  {t:'diff',bg:'sky',sky:'#c8b8e8',ground:'#f4f0fa',ins:'おしろの まどの えを くらべて、ちがう ところを 4つ さがそう！',
    pic:[['cloud',60,45,1],['star',150,35,.8],['moon',280,40,1],['ghost',70,150,1.1],['house',170,120,1.8],['heart',262,118,.9],['balloon',300,160,.9],['bell',232,178,.7],['flower',30,186,.7]],
    diffs:[[1,'gone'],[3,'smilestar'],[5,'star'],[7,'gone']],done:'ぜんぶ みつけた！ とびらが ひらいた！'},
  {t:'lock',bg:'sky',hints:[['cloud',4],['ghost',1],['star',6]],box:'chest',ins:'くもの とびらの ばんごう！ えの かずを かぞえて あわせよう',done:'カチャッ！ くもの とびらが ひらいた！'},
  {t:'talk',bg:'sky',doc:true,cast:['fu','rk','hitsuji'],lines:[
    ['hitsuji','メェ〜… もやもやを すったら、はなが むずむず…',{emo:'sick'}],
    ['fu','おいしゃさん たんていに まかせて！']]},
  {t:'doctor',bg:'sky',pt:'hitsuji',say:'はなが むずむず… ハクション メェ〜',
    tools:{thermo:36.5,steth:'normal',light:'ok',xray:'ok',lens:'powder'},need:['lens'],
    diag:{ans:'powder',wrong:['tooth','dizzy'],ok:'もやもやの こなが はなに ついてたんだね'},
    treat:[{t:'rub',area:'face'},{t:'med',col:'pink'}],end:'すっきり メェ〜！ モヤモヤンの へやは この うえだよ'},
  {t:'memory',bg:'sky',pairs:['heart','star','balloon','ghost'],ins:'モヤモヤンの カードあそび！ おなじ えを 2まい そろえよう',done:'ぜんぶ そろった！ カードあそび、たのしいね！'},
  {t:'abc',bg:'sky',word:'FRIEND',pic:'heart',say:'さいごの とびらの まほうの ことば！ この じゅんばんで タッチ',done:'ともだち！ とびらが ひらいた！'},
  {t:'talk',bg:'sky',cast:['fu','rk','kuro','witch'],set:{witch:'kind',kuro:'happy'},lines:[
    ['moya','ここまで きたモヤ…！？',{in:'moya',fx:'shake'}],
    ['moya','でも どうせ、だれも ぼくと あそんで くれないモヤ！ まちを ぜんぶ もやもやに してやるモヤ！',{fx:'boom'}],
    ['fu','モヤモヤン、ほんとは みんなと あそびたいんでしょ？'],
    ['moya','う、うるさいモヤ！ ぜんぶの もやもやよ、あつまれ〜！',{fx:'dark'}],
    ['witch','みんな、ちからを あわせて！'],
    ['kuro','いくニャ〜！']]},
  {t:'battle',mon:{kind:'ghost',name:'モヤモヤン',col:'#9a8ab8'},lv:3,boss:true,chances:['num','color','letter','add'],fin:'smile',ally:['kuro','witch'],item:'smilestar',
    win:'やったー！ もやもやが ぜんぶ はれたよ！'},
  {t:'talk',bg:'sky',cure:true,flag:{clear:true},cast:['fu','rk','moya'],lines:[
    ['narr','もやもやが はれて、そらに おおきな にじが かかった！',{fx:'confetti'}],
    ['moya','ぼく… みんなと あそびたかった だけ なんだモヤ… ごめんなさい',{emo:'kind'}],
    ['fu','いっしょに あそぼう！ きょうから ともだち だよ！',{emo:'happy'}],
    ['rk','ばぶー！ おばけの ともだち！',{emo:'happy'}],
    ['kuro','なかまが ふえたニャ！',{in:'kuro',emo:'happy'}],
    ['narr','3この えがおの スターが そろって、まちじゅうに えがおが ひろがった！',{show:'smilestar'}]]},
  {t:'talk',bg:'fair',cure:true,cast:['fu','rk','moya','kuro','witch'],set:{witch:'kind',kuro:'happy',moya:'kind'},lines:[
    ['narr','ゆうえんちで、みんなの えがお パーティー！',{fx:'confetti'}],
    ['moya','ふうせん、みんなに かえすモヤ！ いっしょに かんらんしゃ のるモヤ！'],
    ['witch','ふふ、ひとりぼっちより、みんなと いっしょが いちばんね'],
    ['fu','これからも まちの じけんは、キュアたんてい ふーちゃんに おまかせ！',{emo:'happy'}]]},
  {t:'credits',say:'キュアたんてい ふーちゃん だい2ぶ、おしまい！ あそんでくれて ありがとう！',end:'だい2ぶ おしまい',
    list:[['fu','ふーちゃん'],['rk','リッキー'],['moya','モヤモヤン'],['kuro','クロニャン'],['witch','ドロドロン'],['zouB',''],['hiyoko',''],['pen',''],['hitsuji','']]},
]},
);

// ================= story (8 じけん) =================
const CHAPTERS=[
// ---------------- 1 ----------------
{title:'きえた いちごケーキ',icon:'cake',bg:'bakery',gem:0,steps:[
  {t:'talk',bg:'office',lines:[
    ['fu','ここは まちの たんてい じむしょ！ わたしは たんていの ふーちゃん！',{emo:'happy'}],
    ['rk','ばぶー！ リッキーも たんていだよ！',{emo:'happy'}],
    ['narr','ジリリリン！ ジリリリン！',{fx:'ring'}],
    ['fu','はい、たんてい じむしょです！'],
    ['neko','たいへんです！ ケーキやさんの いちごケーキが きえちゃったの！'],
    ['fu','すぐ いきます！ リッキー、しゅっぱつだよ！',{emo:'happy'}]]},
  {t:'talk',bg:'bakery',cast:['fu','rk','neko'],lines:[
    ['neko','いらっしゃい… いちごケーキを ならべて、ちょっと めを はなしたら…',{emo:'sad'}],
    ['neko','ぜんぶ なくなってたの！ おたんじょうびかい に つかう ケーキなのに…'],
    ['fu','だいじょうぶ！ たんていの ふーちゃんに まかせて！'],
    ['rk','むしめがねで しらべよう！',{show:'lens'}]]},
  {t:'search',bg:'bakery',clues:[['feather','くろい はね'],['birdprint','とりの あしあと'],['strawberry','おちてた いちご']]},
  {t:'count',bg:'bakery',icon:'birdprint',n:5,ins:'とりの あしあとが つづいてる！ いくつ あるか タッチして かぞえよう'},
  {t:'talk',bg:'bakery',cast:['fu','rk','pen'],lines:[
    ['pen','ぼく みたよ！ まどから 「ブラック」の なにかが とんでいったよ！'],
    ['fu','ブラック？ それって えいごだね！'],
    ['rk','ねえね、ブラックって なにいろ？']]},
  {t:'quiz',bg:'bakery',rounds:[
    {q:'「black」は どの いろかな？',say:[['black','en'],['は どの いろかな？','ja']],top:{listen:true},ans:'c:black',wrong:['c:red','c:yellow'],ok:'せいかい！ ブラックは くろ！',okEn:'black'},
    {q:'とんでいくのは 「bird」。 bird は どれ？',say:[['bird','en'],['は どれかな？','ja']],top:{listen:true},ans:'a:crow',wrong:['a:cat','a:pig'],ok:'そう！ bird は とり だよ！',okEn:'bird'}]},
  {t:'deduce',bg:'bakery',clues:[['feather','くろい はね'],['birdprint','とりの あしあと'],['c:black','くろい いろ']],sus:['kuma','kara','buta'],ok:1,hint:'くろくて、そらを とべるのは だれかな？'},
  {t:'talk',bg:'bakery',cast:['fu','rk','kara'],lines:[
    ['kara','ごめんなさい… くろい ねこに 「ケーキを もってきたら ピカピカの ほうせきを あげる」って いわれて…',{emo:'sad'}],
    ['fu','くろい ねこ？'],
    ['kuro','ニャーッハッハ！ ケーキは この かいとう クロニャンさまが いただいたニャ！',{in:'kuro',fx:'boom',set:{kara:'sad'}}],
    ['fu','クロニャン！ ケーキを みんなに かえして！'],
    ['kuro','いやだニャ！ やみの まほうで… いでよ、ケーキモンスター！',{fx:'dark'}],
    ['rk','ねえね！ へんしんだよ！']]},
  {t:'battle',mon:{kind:'cake',name:'ケーキモンスター',col:'#ffb3d6'},lv:1,chances:['num'],fin:'heart',item:'cake'},
  {t:'talk',bg:'bakery',cast:['fu','rk','kuro'],cure:true,lines:[
    ['kuro','ぐぬぬ… おぼえてろニャ〜！',{emo:'sad'}],
    ['narr','クロニャンは にげていった。',{out:'kuro'}],
    ['neko','ありがとう、キュアふーちゃん！ ケーキが もどったわ！',{in:'neko',emo:'happy'}],
    ['narr','あれ？ ケーキの なかで なにかが ひかってる…',{show:'gem:#ff7ab8'}],
    ['fu','これは… ひかりの ジュエル？ まちを まもる ふしぎな ほうせきだ！'],
    ['rk','クロニャンは これを ねらってたのかも！ ぜんぶで 8こ あるんだって！'],
    ['fu','じけん かいけつ！ つぎの じけんも まかせてね！',{emo:'happy'}]]},
]},
// ---------------- 2 ----------------
{title:'おなかいたい わんちゃん',icon:'candy',bg:'park',gem:1,steps:[
  {t:'talk',bg:'office',lines:[
    ['narr','ジリリリン！',{fx:'ring'}],
    ['usa','もしもし！ こうえんで わんちゃんが おなかを いたがってるの！'],
    ['fu','きょうは おいしゃさん たんていの でばんだね！'],
    ['rk','リッキーは かんごしさん！ ばぶ！',{emo:'happy'}]]},
  {t:'talk',bg:'park',doc:true,cast:['fu','rk','inu','usa'],lines:[
    ['inu','おなかが… いたいワン…',{emo:'sick'}],
    ['usa','さっき しらない ひとに もらった キャンディを たべてから ずっと こうなの'],
    ['fu','しんさつ してみよう！ どうぐを つかって しらべるよ']]},
  {t:'doctor',pt:'inu',say:'おなかが グルグル… いたいワン…',sick:true,
    tools:{thermo:36.8,steth:'guru',light:'ok',xray:'candy',lens:'ok'},need:['steth','xray'],
    diag:{ans:'swallow',wrong:['cold','thorn'],ok:'おおきな キャンディを のみこんじゃったんだね！'},
    treat:[{t:'rub',area:'belly',item:'candy'},{t:'med',col:'green'}],end:'おなかが なおったワン！ ありがとう、せんせい！'},
  {t:'talk',bg:'park',doc:true,cast:['fu','rk','inu'],lines:[
    ['fu','この キャンディ… まほうの においが する…',{emo:'think'}],
    ['inu','キャンディを くれたのは くろい ぼうしの ねこ だったワン'],
    ['rk','クロニャンだ！ てがかりを さがそう！']]},
  {t:'search',bg:'park',clues:[['candy','キャンディの つつみ'],['pawcat','ねこの あしあと'],['map','おちてた ちず']]},
  {t:'dots',bg:'park',shape:'path',n:10,reveal:'house',ins:'ちずに すうじが かいてある！ 1から 10まで じゅんばんに タッチ！',done:'あしあとは あの おうちに つづいてる！'},
  {t:'talk',bg:'town',cast:['fu','rk','kuro'],lines:[
    ['kuro','ニャニャッ！ もう みつかったニャ！？',{fx:'shake'}],
    ['fu','クロニャン！ へんな キャンディを くばるのは やめて！'],
    ['kuro','つかまえられるものなら つかまえてみるニャ〜！',{out:'kuro'}],
    ['rk','まてまて〜！']]},
  {t:'chase',bg:'town',len:22},
  {t:'talk',bg:'town',cast:['fu','rk','kuro'],lines:[
    ['kuro','はぁ はぁ… しつこいニャ！ それなら… キャンディモンスター！',{fx:'dark'}],
    ['fu','いくよ、リッキー！']]},
  {t:'battle',mon:{kind:'candy',name:'キャンディモンスター',col:'#ff7ab8'},lv:1,chances:['color','count'],fin:'star',item:'candy'},
  {t:'talk',bg:'park',cure:true,cast:['fu','rk','inu','usa'],lines:[
    ['inu','ワンワン！ げんきに なったワン！',{emo:'happy'}],
    ['usa','キャンディが ふつうの キャンディに もどった！',{emo:'happy'}],
    ['narr','キャンディの なかから ひかりの ジュエルが でてきた！',{show:'gem:#ff9a2a'}],
    ['rk','ジュエル 2こめ！ やったね ねえね！',{emo:'happy'}],
    ['fu','でも クロニャンは どうして ジュエルを あつめてるんだろう？',{emo:'think'}]]},
]},
// ---------------- 3 ----------------
{title:'びじゅつかんの きえた いろ',icon:'paint',bg:'museum',gem:2,steps:[
  {t:'talk',bg:'office',flag:{color:false},lines:[
    ['narr','ジリリリン！',{fx:'ring'}],
    ['panda','びじゅつかんの パンダです！ えから いろが ぜんぶ きえちゃった！'],
    ['fu','いろが きえた！？ すぐ いきます！']]},
  {t:'talk',bg:'museum',cast:['fu','rk','panda'],lines:[
    ['panda','みてください… にじの えも はなの えも まっしろ…',{emo:'sad'}],
    ['fu','ほんとだ… いろを とりもどさなきゃ！'],
    ['rk','いろの なまえを えいごで いうと、まほうで いろが もどるかも！']]},
  {t:'quiz',bg:'museum',rounds:[
    {q:'「red」は どの いろ？',say:[['red','en'],['は どの いろ？','ja']],top:{listen:true},ans:'c:red',wrong:['c:blue','c:green'],ok:'red は あか！',okEn:'red'},
    {q:'「blue」は どの いろ？',say:[['blue','en'],['は どの いろ？','ja']],top:{listen:true},ans:'c:blue',wrong:['c:yellow','c:pink'],ok:'blue は あお！',okEn:'blue'},
    {q:'「yellow」は どの いろ？',say:[['yellow','en'],['は どの いろ？','ja']],top:{listen:true},ans:'c:yellow',wrong:['c:purple','c:red'],ok:'yellow は きいろ！',okEn:'yellow'},
    {q:'「green」は どの いろ？',say:[['green','en'],['は どの いろ？','ja']],top:{listen:true},ans:'c:green',wrong:['c:orange','c:blue'],ok:'green は みどり！',okEn:'green'}]},
  {t:'talk',bg:'museum',cast:['fu','rk','panda'],lines:[
    ['narr','でも… えの いろは まだ もどらない。'],
    ['fu','だれかが いろを もっていっちゃったんだ！ しらべよう！']]},
  {t:'search',bg:'museum',clues:[['brush','えのぐの ついた ふで'],['tail','しましまの け'],['paint','こぼれた えのぐ']]},
  {t:'talk',bg:'museum',cast:['fu','rk','fuku'],lines:[
    ['fuku','ホーホー。 よるの けいびで、しましまの しっぽを みたホー'],
    ['fu','しましまの しっぽ… てがかりが そろってきた！']]},
  {t:'deduce',bg:'museum',clues:[['brush','えのぐの ふで'],['tail','しましまの け'],['paint','こぼれた えのぐ']],sus:['kitsune','panda','arai'],ok:2,hint:'しましまの しっぽが あるのは だれかな？'},
  {t:'talk',bg:'museum',cast:['fu','rk','arai'],lines:[
    ['arai','ごめんなさい… クロニャンに たのまれて、いろを たからばこに とじこめたの…',{emo:'sad'}],
    ['arai','でも かぎの ばんごうを わすれちゃった… えの なかに ヒントが あるよ'],
    ['fu','ばんごうを さがそう！']]},
  {t:'lock',bg:'museum',hints:[['brush',2],['paint',4],['star',1]],ins:'えの かずを かぞえて、ばんごうを あわせよう！',done:'カチャッ！ たからばこが あいた！'},
  {t:'talk',bg:'museum',cast:['fu','rk','kuro'],lines:[
    ['kuro','そこまでニャ！ いろは わたさないニャ！',{fx:'boom'}],
    ['kuro','えのぐモンスター、でてこいニャ！',{fx:'dark'}],
    ['fu','みんなの だいじな えを かえして！']]},
  {t:'battle',mon:{kind:'paint',name:'えのぐモンスター',col:'#b48cff'},lv:2,chances:['color','color'],fin:'rainbow',item:'paint'},
  {t:'talk',bg:'museum',cure:true,flag:{color:true},cast:['fu','rk','panda','arai'],lines:[
    ['narr','えに いろが もどった！',{fx:'confetti'}],
    ['panda','きれい！ ありがとう、キュアふーちゃん！',{emo:'happy'}],
    ['arai','ぼくも ごめんなさい… これ、たからばこの そこに あったよ',{show:'gem:#ffd23a'}],
    ['fu','3こめの ひかりの ジュエル！',{emo:'happy'}]]},
]},
// ---------------- 4 ----------------
{title:'びょういんは おおいそがし',icon:'med',bg:'clinic',gem:3,steps:[
  {t:'talk',bg:'office',lines:[
    ['narr','ジリリリン！',{fx:'ring'}],
    ['kumadoc','どうぶつびょういんの くまです。 くしゃみの かんじゃさんが いっぱいで… てつだって ください！'],
    ['fu','おいしゃさん たんてい、しゅつどう！',{emo:'happy'}]]},
  {t:'talk',bg:'clinic',doc:true,cast:['fu','rk','kumadoc'],lines:[
    ['kumadoc','みんな ハクション ハクション… へんなんです'],
    ['rk','まずは かんじゃさんを なおしてあげよう！']]},
  {t:'doctor',pt:'usa',say:'ハクション！ あたまが あつくて ふらふら…',sick:true,
    tools:{thermo:38,steth:'fast',light:'red',xray:'ok',lens:'ok'},need:['thermo','light'],
    diag:{ans:'cold',wrong:['thorn','tooth'],ok:'かぜを ひいちゃったんだね'},
    treat:[{t:'ice'},{t:'med',col:'pink'},{t:'sleep'}],end:'すっきり！ ありがとう、せんせい！'},
  {t:'doctor',pt:'buta2',say:'ハクション！ はなが むずむず するよ〜',
    tools:{thermo:36.5,steth:'normal',light:'ok',xray:'ok',lens:'powder'},need:['lens'],
    diag:{ans:'powder',wrong:['tummy','tooth'],ok:'へんな こなを すいこんじゃったんだね'},
    treat:[{t:'rub',area:'face'},{t:'med',col:'blue'}],end:'くしゃみが とまった！ ありがとう！'},
  {t:'talk',bg:'clinic',doc:true,cast:['fu','rk','kumadoc'],lines:[
    ['fu','この むらさきの こな… きっと くしゃみの もとだ！',{emo:'think'}],
    ['kumadoc','そういえば、くすりの たなの ほうから こなが…']]},
  {t:'search',bg:'clinic',clues:[['powder','むらさきの こな'],['pawcat','ねこの あしあと'],['key','くすりだなの かぎ']]},
  {t:'abc',bg:'clinic',word:'CAT',pic:'a:cat',say:'くすりだなの あいことばは この じゅんばん！',done:'ねこ！ ねこ… もしかして！'},
  {t:'talk',bg:'clinic',cast:['fu','rk','kuro'],lines:[
    ['kuro','ハ… ハ… ハックション！ じぶんで まいた こなで くしゃみが とまらないニャ〜！',{in:'kuro',fx:'shake'}],
    ['fu','やっぱり クロニャン！'],
    ['kuro','ハクション… ハクションモンスター！ ハックション！',{fx:'dark'}]]},
  {t:'battle',mon:{kind:'germ',name:'ハクションモンスター',col:'#a060e0'},lv:2,chances:['letter','num'],fin:'circle',item:'med:pink'},
  {t:'talk',bg:'clinic',cure:true,cast:['fu','rk','kumadoc','kuro'],lines:[
    ['kumadoc','こなが きえて、みんなの くしゃみが とまりました！',{emo:'happy'}],
    ['kuro','ハクション… く、くやしいニャ〜',{emo:'sad'}],
    ['fu','クロニャンも かぜ ひかないように、あったかくしてね'],
    ['kuro','……！ よ、よけいな おせわニャ！',{out:'kuro'}],
    ['narr','くすりだなで ひかりの ジュエルを みつけた！',{show:'gem:#3ec46a'}],
    ['rk','4こめ！ はんぶん あつまったね！',{emo:'happy'}]]},
]},
// ---------------- 5 ----------------
{title:'がっこうの きえた すうじ',icon:'clock',bg:'school',gem:4,steps:[
  {t:'talk',bg:'office',flag:{nonum:true},lines:[
    ['narr','ジリリリン！',{fx:'ring'}],
    ['fuku','フクロウせんせいだホー！ がっこうの とけいから すうじが きえてしまったホー！'],
    ['fu','すうじが きえた！？ たいへん！']]},
  {t:'talk',bg:'school',cast:['fu','rk','fuku','hiyoko'],lines:[
    ['hiyoko','とけいが よめないから、じかんが わからないの〜',{emo:'sad'}],
    ['fu','まずは とけいの すうじを もどそう！']]},
  {t:'dots',bg:'school',shape:'clock',n:12,ins:'とけいの すうじを 1から 12まで じゅんばんに タッチ！',done:'とけいが もどった！'},
  {t:'quiz',bg:'school',rounds:[
    {q:'りんごが 2こ と 1こ。 ぜんぶで いくつ？',top:{add:[2,1,'apple']},ans:'n:3',wrong:['n:2','n:4'],ok:'2 たす 1 は 3！',okEn:'three'},
    {q:'ほしが 3こ と 2こ。 ぜんぶで いくつ？',top:{add:[3,2,'star']},ans:'n:5',wrong:['n:4','n:6'],ok:'3 たす 2 は 5！',okEn:'five'},
    {q:'キャンディが 4こ と 2こ。 ぜんぶで いくつ？',top:{add:[4,2,'candy']},ans:'n:6',wrong:['n:5','n:7'],ok:'4 たす 2 は 6！',okEn:'six'}]},
  {t:'quiz',bg:'school',rounds:[
    {q:'「three」は どの すうじ？',say:[['three','en'],['は どの すうじ？','ja']],top:{listen:true},ans:'n:3',wrong:['n:8','n:5'],ok:'three は 3！',okEn:'three'},
    {q:'「seven」は どの すうじ？',say:[['seven','en'],['は どの すうじ？','ja']],top:{listen:true},ans:'n:7',wrong:['n:1','n:4'],ok:'seven は 7！',okEn:'seven'},
    {q:'「ten」は どの すうじ？',say:[['ten','en'],['は どの すうじ？','ja']],top:{listen:true},ans:'n:10',wrong:['n:6','n:2'],ok:'ten は 10！',okEn:'ten'}]},
  {t:'talk',bg:'school',flag:{nonum:false},cast:['fu','rk','fuku'],lines:[
    ['fuku','こくばんの すうじも もどったホー！ でも はんにんは まだ…'],
    ['fu','きょうしつを しらべてみよう']]},
  {t:'search',bg:'school',clues:[['pencil','おちてた えんぴつ'],['book','すうじの ほん'],['pawcat','ねこの あしあと']]},
  {t:'quiz',bg:'school',rounds:[
    {q:'まどに うつった かげ… これは だれ？',top:{icon:'a:kuro',sil:true,s:3.2},ans:'a:kuro',wrong:['a:cat','a:rabbit'],ok:'やっぱり クロニャンだ！',labels:{'a:kuro':'クロニャン','a:cat':'ねこさん','a:rabbit':'うさぎさん'}}]},
  {t:'talk',bg:'school',cast:['fu','rk','kuro'],lines:[
    ['kuro','ニャハハ！ すうじが あると べんきょう しなきゃ いけないニャ！ だから けしたニャ！',{in:'kuro',fx:'boom'}],
    ['fu','すうじは たのしいよ！ かぞえたり、じかんが わかったり！'],
    ['kuro','うるさいニャ！ すうじモンスター！',{fx:'dark'}]]},
  {t:'battle',mon:{kind:'clock',name:'すうじモンスター',col:'#ff9a2a'},lv:2,chances:['num','add'],fin:'star',item:'clock'},
  {t:'talk',bg:'school',cure:true,cast:['fu','rk','fuku','hiyoko'],lines:[
    ['hiyoko','とけいが チクタク うごいてる！',{emo:'happy'}],
    ['fuku','ありがとうだホー！ おれいに これを どうぞ',{show:'gem:#5ac8ff'}],
    ['fu','5こめの ジュエル！'],
    ['rk','クロニャン、ちょっと さみしそう だったね…'],
    ['fu','うん… なんでだろう',{emo:'think'}]]},
]},
// ---------------- 6 ----------------
{title:'うみの たからばこ',icon:'chest',bg:'beach',gem:5,steps:[
  {t:'talk',bg:'office',lines:[
    ['narr','ジリリリン！',{fx:'ring'}],
    ['kame','うみの カメです… けがを しちゃって… それに たからばこも とられちゃったの…'],
    ['fu','いま いくね！ まずは けがの てあてだ！']]},
  {t:'talk',bg:'beach',doc:true,cast:['fu','rk','kame'],lines:[
    ['kame','いわで あしを すりむいちゃったの…',{emo:'sad'}],
    ['rk','いたいの いたいの とんでいけ〜！']]},
  {t:'doctor',pt:'kame',say:'あしが ヒリヒリ いたいの…',
    tools:{thermo:36.4,steth:'normal',light:'ok',xray:'ok',lens:'scrape'},need:['lens'],
    diag:{ans:'scrape',wrong:['cold','tooth'],ok:'すりきずだね。 ばんそうこうを はろう！'},
    treat:[{t:'band',n:3}],end:'いたくなくなった！ ありがとう！'},
  {t:'talk',bg:'beach',doc:true,cast:['fu','rk','kame'],lines:[
    ['kame','たからばこを もった くろい かげが、はまべを はしっていったの'],
    ['fu','あしあとが のこってるかも！ でも その まえに…'],
    ['kame','うみの なかまの なまえを えいごで おしえてあげる！']]},
  {t:'quiz',bg:'beach',rounds:[
    {q:'「fish」は どれ？',say:[['fish','en'],['は どれ？','ja']],top:{listen:true},ans:'fish',wrong:['crab','octopus'],ok:'fish は さかな！',okEn:'fish'},
    {q:'「crab」は どれ？',say:[['crab','en'],['は どれ？','ja']],top:{listen:true},ans:'crab',wrong:['shell','fish'],ok:'crab は かに！',okEn:'crab'},
    {q:'「octopus」は どれ？',say:[['octopus','en'],['は どれ？','ja']],top:{listen:true},ans:'octopus',wrong:['crab','a:turtle'],ok:'octopus は たこ！',okEn:'octopus'}]},
  {t:'count',bg:'beach',icon:'pawcat',n:7,ins:'すなはまに ねこの あしあと！ いくつ あるかな？ タッチして かぞえよう'},
  {t:'talk',bg:'beach',cast:['fu','rk','kuro'],lines:[
    ['kuro','ニャッ！ また ふーちゃん だニャ！',{in:'kuro',fx:'shake'}],
    ['fu','たからばこを かえして！'],
    ['kuro','いやだニャ〜！',{out:'kuro'}]]},
  {t:'chase',bg:'beach',len:24},
  {t:'talk',bg:'beach',cast:['fu','rk','kuro'],lines:[
    ['kuro','はぁ はぁ… この たからばこ、ばんごうが わからなくて あけられないニャ…'],
    ['fu','それは うみの みんなの たからものだよ！'],
    ['kuro','ドロドロンさまに おこられちゃうニャ… タコモンスター！',{fx:'dark'}],
    ['rk','ドロドロンさま？']]},
  {t:'battle',mon:{kind:'octo',name:'タコモンスター',col:'#ff7a9a'},lv:3,chances:['count','word'],fin:'diamond',item:'chest'},
  {t:'lock',bg:'beach',hints:[['shell',3],['fish',1],['crab',4]],ins:'たからばこを あけよう！ えの かずを かぞえて ばんごうを あわせてね',done:'パカッ！ たからばこが あいた！'},
  {t:'talk',bg:'beach',cure:true,cast:['fu','rk','kame'],lines:[
    ['kame','たからものが もどった！ ありがとう！',{emo:'happy'}],
    ['narr','たからばこの なかに、ひかりの ジュエルが！',{show:'gem:#3a6aff'}],
    ['fu','6こめ！ …クロニャン、「ドロドロンさま」って いってたね',{emo:'think'}],
    ['rk','だれなんだろう…？']]},
]},
// ---------------- 7 ----------------
{title:'よぞらの ほしどろぼう',icon:'star',bg:'night',gem:6,steps:[
  {t:'talk',bg:'office',flag:{nostar:true},lines:[
    ['narr','よる。 ジリリリン！',{fx:'ring'}],
    ['fukuN','てんもんだいの フクロウだホー。 よぞらの ほしが どんどん きえていくホー！'],
    ['fu','おほしさまが！？ いそごう、リッキー！']]},
  {t:'talk',bg:'night',cast:['fu','rk','fukuN'],lines:[
    ['fukuN','みてごらん… せいざが ばらばらだホー',{emo:'sad'}],
    ['rk','ほしを つないで せいざを もどそう！']]},
  {t:'dots',bg:'night',shape:'star',n:10,reveal:'star',ins:'ほしを 1から 10まで じゅんばんに つなごう！',done:'きらきら ぼしの せいざが もどった！'},
  {t:'abc',bg:'night',word:'STAR',pic:'star',say:'よぞらの まほうの ことば！ この じゅんばんで タッチ',done:'ほし！ よぞらが ひかった！'},
  {t:'talk',bg:'night',flag:{nostar:false},cast:['fu','rk','fukuN'],lines:[
    ['narr','ほしが すこし もどってきた！',{fx:'sparkle'}],
    ['fu','てんもんだいの まわりを しらべよう']]},
  {t:'search',bg:'night',clues:[['moon','つきの かざり'],['hat','くろい シルクハット'],['letter','おちてた てがみ']]},
  {t:'talk',bg:'night',cast:['fu','rk'],lines:[
    ['fu','てがみに なにか かいてある… 「たすけて」…？',{show:'letter'}],
    ['rk','この じ、クロニャンの じ だよ！'],
    ['fu','クロニャン… ほんとうは いやだったのかな',{emo:'think'}],
    ['kuro','……みつかっちゃったニャ',{in:'kuro',emo:'sad'}],
    ['kuro','ジュエルと ほしを あつめないと、まじょの ドロドロンさまに おこられるニャ…'],
    ['witch','クロニャン！ なにを グズグズ しているの！',{in:'witch',fx:'dark'}],
    ['witch','わたしは やみの まじょ ドロドロン。 ほしモンスターよ、ぜんぶ まっくらに しておしまい！',{fx:'boom'}],
    ['fu','そんなこと させない！']]},
  {t:'battle',mon:{kind:'star',name:'ほしモンスター',col:'#ffd23a'},lv:3,chances:['letter','shape'],fin:'moon',item:'star'},
  {t:'talk',bg:'night',cure:true,cast:['fu','rk','kuro'],lines:[
    ['narr','よぞらに ほしが ぜんぶ もどった！',{fx:'confetti'}],
    ['kuro','ふーちゃん… ありがとうニャ。 わるいこと して ごめんニャ',{emo:'sad'}],
    ['fu','いっしょに ドロドロンを とめよう！'],
    ['kuro','ドロドロンの おしろは、やみの もりの おくニャ。 これ、かえすニャ',{show:'gem:#a060e0'}],
    ['rk','7こめ！ クロニャン、なかまに なったね！',{emo:'happy'}],
    ['kuro','な、なかまじゃ… ない… かも ニャ',{emo:'happy'}]]},
]},
// ---------------- 8 ----------------
{title:'やみの おしろの けっせん',icon:'crown',bg:'castle',gem:7,steps:[
  {t:'talk',bg:'castle',cast:['fu','rk','kuro'],lines:[
    ['narr','やみの もりの おく… ドロドロンの おしろ。'],
    ['kuro','とびらには 3つの なぞが あるニャ。 ぜんぶ とけたら なかに はいれるニャ'],
    ['fu','たんていの ちからで とこう！']]},
  {t:'abc',bg:'castle',word:'OPEN',pic:'key',say:'だいいちの なぞ！ まほうの ことばを この じゅんばんで タッチ',done:'とびらが ひらいた！'},
  {t:'lock',bg:'castle',hints:[['gem:#b04aff',7],['heart',2],['moon',5]],box:'chest',ins:'だいにの なぞ！ えの かずを かぞえて ばんごうを あわせよう',done:'カチャッ！ だいにの とびらも あいた！'},
  {t:'talk',bg:'castle',doc:true,cast:['fu','rk','gate'],lines:[
    ['gate','うう… はが いたくて もんばんが できないよ…',{emo:'sick'}],
    ['fu','だいさんの なぞは… おいしゃさん だね！']]},
  {t:'doctor',pt:'gate',say:'はが ズキズキ いたいよ〜',
    tools:{thermo:36.6,steth:'normal',light:'tooth',xray:'ok',lens:'ok'},need:['light'],
    diag:{ans:'tooth',wrong:['cold','scrape'],ok:'むしばだね。 はみがき しよう！'},
    treat:[{t:'rub',area:'mouth'},{t:'med',col:'yellow'}],end:'いたくなくなった！ ありがとう！ さあ、とおって！'},
  {t:'talk',bg:'dark',cast:['fu','rk','kuro','witch'],lines:[
    ['witch','よく きたわね… ちいさな たんていさん',{fx:'dark'}],
    ['witch','ひかりの ジュエルを わたしなさい！ まちを ぜんぶ やみに するのよ！'],
    ['kuro','ドロドロンさま！ もう わるいことは やめるニャ！'],
    ['witch','うらぎりものめ！ やみの ちから、みせてあげる！',{fx:'boom'}],
    ['fu','みんなの まちは わたしたちが まもる！ いくよ、リッキー！ クロニャン！']]},
  {t:'battle',mon:{kind:'witch',name:'まじょ ドロドロン',col:'#8a2ab8'},lv:3,boss:true,chances:['num','color','letter'],fin:'jewel',ally:'kuro',item:'gem:#ffffff',
    win:'やったー！ ドロドロンの やみが きえたよ！'},
  {t:'talk',bg:'castle',cure:true,cast:['fu','rk','kuro','witch'],set:{},lines:[
    ['witch','わたし… ずっと ひとりぼっちで さみしかったの…',{emo:'kind'}],
    ['fu','それなら、いっしょに あそぼう！ ともだちに なろう！',{emo:'happy'}],
    ['rk','ばぶー！ ともだち！',{emo:'happy'}],
    ['kuro','ドロドロンさま… よかったニャ',{emo:'happy'}],
    ['narr','8この ひかりの ジュエルが そろって、まちに ひかりが もどった！',{show:'gem:#ffffff',fx:'confetti'}],
    ['fu','じけん かいけつ！ みんな ありがとう！',{emo:'happy'}]]},
  {t:'credits'},
]},
];

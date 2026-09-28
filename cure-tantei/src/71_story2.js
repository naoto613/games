// ================= だい2ぶ：おばけの おうさま モヤモヤン（じけん 9〜16） =================
Object.assign(NPC,{zouB:{kind:'elephant',name:'ふうせんやの ぞうさん',acc:['cap:#ff6f91'],vo:[.85,.95]},usaQ:{kind:'rabbit',name:'うさぎの じょおう',acc:['crown'],vo:[1.6,1]},fukuL:{kind:'owl',name:'としょかんの フクロウ',acc:['glasses'],vo:[.95,.95]},obake:{kind:'ghost',name:'おばけの オバケン',bow:'#ff8cc6',vo:[1.5,1.1]}});
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
    ['rk','えがおの スター だって！ みんなが わらうと ひかるんだよ！',{emo:'happy'}],
    ['kuro','8こ あつめると、ふしぎな ことが おきるらしいニャ！']]},
]},
// ---------------- 10 ----------------
{title:'もりの ホタルが きえた',icon:'firefly',bg:'forest',part:2,steps:[
  {t:'talk',bg:'office',cast:['fu','rk'],flag:{lit:false},lines:[
    ['narr','ジリリリン！',{fx:'ring'}],
    ['kuma','もりの くまです… よるに ひかる ホタルが ぜんぶ いなくなって、もりが まっくらなんです'],
    ['fu','ホタルが！？ もりへ しゅっぱつ！'],
    ['kuro','くらいのは へっちゃら ニャ！ ねこの めは よく みえるニャ！',{in:'kuro',emo:'happy'}]]},
  {t:'talk',bg:'forest',cast:['fu','rk','kuma','kuro'],set:{kuro:'happy'},lines:[
    ['kuma','きのうまで キラキラ ひかって きれいだったのに…',{emo:'sad'}],
    ['fu','だいじょうぶ！ ホタルを さがそう！'],
    ['rk','むしめがね、しゅつどう！',{show:'lens'}]]},
  {t:'search',bg:'forest',clues:[['fog','つめたい もやもや'],['acorn','かじった どんぐり'],['mushroom','はいいろの きのこ']]},
  {t:'quiz',bg:'forest',rounds:[
    {q:'「bear」は どれ？',say:[['bear','en'],['は どれかな？','ja']],top:{listen:true},ans:'a:bear',wrong:['a:rabbit','a:fox'],ok:'bear は くま！',okEn:'bear'},
    {q:'「owl」は どれ？',say:[['owl','en'],['は どれかな？','ja']],top:{listen:true},ans:'a:owl',wrong:['a:chick','a:mouse'],ok:'owl は ふくろう！',okEn:'owl'},
    {q:'「mushroom」は どれ？',say:[['mushroom','en'],['は どれかな？','ja']],top:{listen:true},ans:'mushroom',wrong:['acorn','leaf'],ok:'mushroom は きのこ！',okEn:'mushroom'}]},
  {t:'talk',bg:'forest',cast:['fu','rk','kuma'],lines:[
    ['kuma','いたたた… くらくて、とげの ある えだを さわっちゃったクマ',{emo:'sick'}],
    ['fu','しんさつ しよう！']]},
  {t:'doctor',bg:'forest',pt:'kuma',say:'てが チクチク いたいクマ…',
    tools:{thermo:36.5,steth:'normal',light:'ok',xray:'ok',lens:'thorn'},need:['lens'],
    diag:{ans:'thorn',wrong:['cold','tooth'],ok:'とげが ささってたんだね。 ぬいてあげよう！'},
    treat:[{t:'thorn',n:3}],end:'いたくなくなったクマ！ ありがとう、せんせい！'},
  {t:'talk',bg:'forest',cast:['fu','rk','kuma'],lines:[
    ['kuma','そういえば、はいいろの きのこが ホタルを すいこんでたクマ！'],
    ['rk','ホタルを ひかりの みちで よびもどそう！']]},
  {t:'dots',bg:'forest',shape:'heart',n:10,reveal:'firefly',ins:'ホタルを 1から 10まで じゅんばんに つないで、ひかりの みちを つくろう！',done:'ハートの ひかりの みちが できた！'},
  {t:'talk',bg:'forest',cast:['fu','rk','kuro'],set:{kuro:'happy'},lines:[
    ['moya','モヤ〜ン！ ホタルの ひかりは ぼくが もらったモヤ！',{in:'moya',fx:'dark'}],
    ['moya','くらい ほうが おばけは おちつくモヤ〜'],
    ['fu','でも もりの みんなは こまってるよ！'],
    ['moya','しらないモヤ！ きのこモンスター、いけ〜！',{fx:'dark'}],
    ['kuro','ふーちゃん、へんしんニャ！']]},
  {t:'battle',mon:{kind:'mushroom',name:'きのこモンスター',col:'#b86af0'},lv:2,chances:['count','shape'],fin:'star',item:'firefly',ally:'kuro'},
  {t:'talk',bg:'forest',cure:true,flag:{lit:true},cast:['fu','rk','kuma','moya'],lines:[
    ['narr','ホタルが もりいっぱいに ひかった！',{fx:'confetti'}],
    ['kuma','きれいだクマ〜！ ありがとう！',{emo:'happy'}],
    ['moya','…きれいモヤ。 でも ぼくは ひとりで みるモヤ…',{emo:'sad'}],
    ['narr','モヤモヤンは そっと きえていった。',{out:'moya'}],
    ['fu','モヤモヤン、ひかりを みて ちょっと わらってた…',{emo:'think'}],
    ['narr','ホタルの ひかりが あつまって、えがおの スターに なった！',{show:'smilestar'}],
    ['rk','えがおの スター 2こめ！',{emo:'happy'}]]},
]},
// ---------------- 11 ----------------
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
    ['rk','えがおの スター 3こめ！']]},
]},
// ---------------- 12 ----------------
{title:'おかしの くにの パーティー',icon:'jelly',bg:'sweets',part:2,steps:[
  {t:'talk',bg:'office',cast:['fu','rk'],flag:{grey:true},lines:[
    ['narr','ジリリリン！',{fx:'ring'}],
    ['usaQ','おかしの くにの じょおうです！ パーティーの おかしが ぜんぶ はいいろに なっちゃったの！'],
    ['fu','おかしが はいいろ！？ たいへん！'],
    ['rk','おかし たべたい！ ばぶー！',{emo:'happy'}]]},
  {t:'talk',bg:'sweets',cast:['fu','rk','usaQ'],lines:[
    ['usaQ','これじゃ パーティーが できないわ…',{emo:'sad'}],
    ['fu','まかせて！ たんていと おいしゃさんで かいけつ するよ！']]},
  {t:'memory',bg:'sweets',pairs:['cake','candy','donut','icecream','cookie','strawberry'],ins:'おかしの カードを めくって、おなじ えを 2まい そろえよう！',done:'ぜんぶ そろった！ おかしの なまえ、えいごで いえたね！'},
  {t:'talk',bg:'sweets',doc:true,cast:['fu','rk','usa'],lines:[
    ['usa','は、はが いたい〜！',{emo:'sick'}],
    ['fu','うさぎさん！ すぐ しんさつ するね']]},
  {t:'doctor',bg:'sweets',pt:'usa',say:'はいいろの あめを なめたら、はが ズキズキ…',
    tools:{thermo:36.6,steth:'normal',light:'tooth',xray:'ok',lens:'ok'},need:['light'],
    diag:{ans:'tooth',wrong:['cold','thorn'],ok:'むしばだね。 はみがき しよう！'},
    treat:[{t:'rub',area:'mouth'},{t:'med',col:'pink'}],end:'ピカピカ！ ありがとう、せんせい！'},
  {t:'talk',bg:'sweets',cast:['fu','rk','usa'],lines:[
    ['usa','あめを くれたのは、はいいろの おばけ だったの'],
    ['fu','やっぱり モヤモヤン…',{emo:'think'}],
    ['rk','おかしの くらに なにか ありそう！ でも その まえに、かずの おべんきょう！']]},
  {t:'quiz',bg:'sweets',rounds:[
    {q:'キャンディが 3こ と 2こ。 ぜんぶで いくつ？',top:{add:[3,2,'candy']},ans:'n:5',wrong:['n:4','n:6'],ok:'3 たす 2 は 5！',okEn:'five'},
    {q:'クッキーが 4こ と 3こ。 ぜんぶで いくつ？',top:{add:[4,3,'cookie']},ans:'n:7',wrong:['n:6','n:8'],ok:'4 たす 3 は 7！',okEn:'seven'},
    {q:'いちごが 5こ と 1こ。 ぜんぶで いくつ？',top:{add:[5,1,'strawberry']},ans:'n:6',wrong:['n:5','n:7'],ok:'5 たす 1 は 6！',okEn:'six'}]},
  {t:'lock',bg:'sweets',hints:[['candy',3],['cookie',5],['donut',2]],box:'chest',ins:'おかしの くらの ばんごう！ えの かずを かぞえて あわせよう',done:'カチャッ！ おかしの くらが あいた！'},
  {t:'talk',bg:'sweets',cast:['fu','rk','witch'],set:{witch:'kind'},lines:[
    ['moya','モヤ〜ン… ぼくも パーティー… じゃなくて！ おかしは ぜんぶ はいいろで いいモヤ！',{in:'moya',fx:'shake'}],
    ['rk','いま、パーティーって いった！'],
    ['moya','い、いってないモヤ！ ゼリーモンスター！',{fx:'dark'}],
    ['witch','ふーちゃん、いきましょう！',{in:'witch',emo:'kind'}]]},
  {t:'battle',mon:{kind:'jelly',name:'ゼリーモンスター',col:'#6ae0c8'},lv:2,chances:['add','color'],fin:'circle',item:'cake',ally:'witch'},
  {t:'talk',bg:'sweets',cure:true,flag:{grey:false},cast:['fu','rk','usaQ','witch'],set:{witch:'kind'},lines:[
    ['narr','おかしに いろが もどった！',{fx:'confetti'}],
    ['usaQ','ありがとう！ パーティーを はじめましょう！',{emo:'happy'}],
    ['fu','モヤモヤンも よんで あげたかったな…',{emo:'think'}],
    ['witch','あの こ、パーティーって いってたわね。 ほんとは さみしいのよ'],
    ['narr','パーティーの ケーキの うえで えがおの スターが ひかった！',{show:'smilestar'}],
    ['rk','えがおの スター 4こめ！',{emo:'happy'}]]},
]},
// ---------------- 13 ----------------
{title:'としょかんの きえた えほん',icon:'book',bg:'library',part:2,steps:[
  {t:'talk',bg:'office',cast:['fu','rk'],flag:{read:false},lines:[
    ['narr','ジリリリン！',{fx:'ring'}],
    ['fukuL','としょかんの フクロウだホー。 えほんの えが もやもやで みえなくなって しまったホー'],
    ['fu','えほんが よめないなんて かなしい！ すぐ いくね！']]},
  {t:'talk',bg:'library',cast:['fu','rk','fukuL','kuro'],set:{kuro:'happy'},lines:[
    ['fukuL','ほら、この えほんも… まっしろだホー',{emo:'sad'}],
    ['kuro','もやもやを はらうには、ことばの まほうが いるニャ！',{in:'kuro'}],
    ['fu','よーし、まほうの ことばを さがそう！']]},
  {t:'abc',bg:'library',word:'BOOK',pic:'book',say:'えほんの まほうの ことば！ この じゅんばんで タッチ',done:'ほん！ いっさつめの えほんが もどった！'},
  {t:'diff',bg:'library',sky:'#f4e4c8',ground:'#c8905a',ins:'きのうの としょかんの しゃしんと くらべて、ちがう ところを 3つ さがそう！',
    pic:[['book',50,60,1],['book',95,60,1],['book',140,60,1],['clock',262,52,1],['a:owl',80,152,1.2],['apple',160,108,.8],['pencil',185,162,1],['glasses',250,162,1],['flower',300,172,.8]],
    diffs:[[1,'gone'],[3,'star'],[6,'key']],done:'ぜんぶ みつけた！ おおきな かぎが おちてる…！'},
  {t:'quiz',bg:'library',rounds:[
    {q:'えほんに うつった かげ… これは だれ？',top:{icon:'ghost',sil:true,s:3.2},ans:'ghost',wrong:['a:cat','a:chick'],ok:'モヤモヤンの かげだ！',labels:{'ghost':'おばけ','a:cat':'ねこさん','a:chick':'ひよこちゃん'}}]},
  {t:'search',bg:'library',clues:[['fog','もやもや'],['letter','はいいろの てがみ'],['crown','おうかんの かけら']]},
  {t:'talk',bg:'library',cast:['fu','rk','kuro'],set:{kuro:'happy'},lines:[
    ['fu','てがみに なにか かいてある… 「ぼくと あそんで」…',{show:'letter'}],
    ['rk','モヤモヤンの じ だ！'],
    ['moya','み、みちゃ だめモヤ〜！',{in:'moya',fx:'shake'}],
    ['moya','えほんモンスター！ ぜんぶ もやもやに するモヤ！',{fx:'dark'}]]},
  {t:'battle',mon:{kind:'book',name:'えほんモンスター',col:'#5aa8ff'},lv:3,chances:['letter','word'],fin:'rainbow',item:'book',ally:'kuro'},
  {t:'talk',bg:'library',cure:true,flag:{read:true},cast:['fu','rk','fukuL','moya'],lines:[
    ['narr','えほんに えが もどった！',{fx:'confetti'}],
    ['fukuL','ありがとうだホー！ みんなで よめるホー！',{emo:'happy'}],
    ['moya','えほんの おばけは いつも ひとりぼっち… ぼくと おなじモヤ',{emo:'sad'}],
    ['narr','モヤモヤンは もやもやの なかに きえた。',{out:'moya'}],
    ['fu','モヤモヤンは ひとりぼっちじゃないよ。 きっと つたえよう！'],
    ['narr','えほんの さいごの ページに、えがおの スター！',{show:'smilestar'}],
    ['rk','えがおの スター 5こめ！',{emo:'happy'}]]},
]},
// ---------------- 14 ----------------
{title:'なつまつりの きえた はなび',icon:'firework',bg:'matsuri',part:2,steps:[
  {t:'talk',bg:'office',cast:['fu','rk'],flag:{hanabi:false},lines:[
    ['narr','ジリリリン！',{fx:'ring'}],
    ['kitsune','おまつりの きつねです！ はなびが ぜんぶ しけって、うちあがらないの！'],
    ['fu','はなび みたい！ おまつりへ いこう！',{emo:'happy'}]]},
  {t:'talk',bg:'matsuri',cast:['fu','rk','kitsune'],lines:[
    ['kitsune','もやもやで はなびが しめっちゃったの…',{emo:'sad'}],
    ['rk','やたいで てがかりを さがそう！']]},
  {t:'search',bg:'matsuri',clues:[['fog','しめった もやもや'],['lantern','きえた ちょうちん'],['candy','おちてた あめ']]},
  {t:'count',bg:'matsuri',icon:'lantern',n:9,ins:'ちょうちんが いくつ あるかな？ タッチして かぞえよう'},
  {t:'talk',bg:'matsuri',doc:true,cast:['fu','rk','lion'],lines:[
    ['lion','きんぎょすくいで ころんじゃったガオ…',{emo:'sick'}],
    ['fu','ライオンくん！ てあて しよう！']]},
  {t:'doctor',bg:'matsuri',pt:'lion',say:'ひざが ヒリヒリ いたいガオ…',
    tools:{thermo:36.5,steth:'normal',light:'ok',xray:'ok',lens:'scrape'},need:['lens'],
    diag:{ans:'scrape',wrong:['tooth','dizzy'],ok:'すりきずだね。 ばんそうこうを はろう！'},
    treat:[{t:'band',n:4}],end:'もう いたくないガオ！ ありがとう！'},
  {t:'quiz',bg:'matsuri',rounds:[
    {q:'つぎに くるのは どれ？',top:{row:['firework','lantern','firework','lantern','firework','?']},ans:'lantern',wrong:['candy','star'],ok:'はなび、ちょうちん、の じゅんばん！'},
    {q:'つぎに くるのは どれ？',top:{row:['star','star','heart','star','star','?']},ans:'heart',wrong:['star','moon'],ok:'ほし、ほし、ハート の じゅんばん！'}]},
  {t:'talk',bg:'matsuri',cast:['fu','rk'],lines:[
    ['moya','モヤ〜ン！ はなびの おと、こわいモヤ… だから しめらせたモヤ！',{in:'moya',fx:'shake'}],
    ['fu','こわかったの？'],
    ['moya','こ、こわくないモヤ！ つかまえられるなら つかまえてみるモヤ〜！',{out:'moya'}]]},
  {t:'chase',bg:'matsuri',target:'moya',len:24},
  {t:'talk',bg:'matsuri',cast:['fu','rk','kuro','witch','moya'],set:{kuro:'happy',witch:'kind'},lines:[
    ['moya','はぁ はぁ… ちょうちんモンスター！',{fx:'dark'}],
    ['kuro','ぼくたちも いるニャ！'],
    ['witch','みんなで いくわよ！']]},
  {t:'battle',mon:{kind:'lantern',name:'ちょうちんモンスター',col:'#ff5a4a'},lv:3,chances:['num','shape'],fin:'heart',item:'firework',ally:['kuro','witch']},
  {t:'talk',bg:'matsuri',cure:true,flag:{hanabi:true},cast:['fu','rk','kitsune','moya'],lines:[
    ['narr','ドーン！ よぞらに おおきな はなび！',{fx:'confetti'}],
    ['moya','わぁ… きれいモヤ…',{emo:'kind'}],
    ['fu','ね、こわくないでしょ？ いっしょに みよう！'],
    ['moya','でも… ぼくは わるい おばけモヤ…',{emo:'sad'}],
    ['narr','モヤモヤンは よぞらへ きえていった。',{out:'moya'}],
    ['narr','さいごの はなびが、えがおの スターに なった！',{show:'smilestar'}],
    ['rk','えがおの スター 6こめ！',{emo:'happy'}]]},
]},
// ---------------- 15 ----------------
{title:'おばけやしきの ひみつ',icon:'pumpkin',bg:'haunted',part:2,steps:[
  {t:'talk',bg:'office',cast:['fu','rk','witch','kuro'],set:{witch:'kind',kuro:'happy'},lines:[
    ['narr','モヤモヤンの ことが きになる ふーちゃんたち。'],
    ['witch','モヤモヤンの ふるさと、「おばけやしき」を しらべてみましょう'],
    ['kuro','おばけやしき… ちょ、ちょっと こわいニャ…',{emo:'sad'}],
    ['fu','みんな いっしょなら だいじょうぶ！',{emo:'happy'}]]},
  {t:'talk',bg:'haunted',cast:['fu','rk','obake'],lines:[
    ['narr','ギィィ… とびらが ひらいた。'],
    ['obake','あっ、にんげんの こだオバ！ いらっしゃいオバ〜',{fx:'sparkle'}],
    ['fu','こんにちは！ モヤモヤンを しってる？'],
    ['obake','モヤモヤンは むかし、おばけの みんなと あそんでたオバ。 でも かくれんぼで ずっと みつけて もらえなくて… それから ひとりぼっちオバ'],
    ['rk','ずっと かくれてたの…？']]},
  {t:'search',bg:'haunted',clues:[['pumpkin','かぼちゃの ランタン'],['letter','ふるい てがみ'],['ghost','おばけの らくがき']]},
  {t:'diff',bg:'haunted',sky:'#5a4a7a',ground:'#3a4a3a',ins:'おばけやしきの えを くらべて、ちがう ところを 4つ さがそう！',
    pic:[['moon',280,45,1],['star',60,40,.8],['star',150,55,.7],['ghost',90,110,1],['pumpkin',60,165,1.1],['pumpkin',270,165,1.1],['bell',200,120,.8],['lantern',170,170,.9],['mushroom',320,178,.7]],
    diffs:[[2,'gone'],[3,'smilestar'],[5,'apple'],[6,'heart']],done:'ぜんぶ みつけた！ たんていの め、さすが！'},
  {t:'talk',bg:'haunted',doc:true,cast:['fu','rk','nezumi'],lines:[
    ['nezumi','おなかが へんなの… なにか のみこんじゃった かも…',{emo:'sick'}],
    ['fu','しんさつ しよう！']]},
  {t:'doctor',bg:'haunted',pt:'nezumi',say:'おなかが グルグル… なにか はいってるみたい',sick:true,
    tools:{thermo:36.7,steth:'guru',light:'ok',xray:'key',lens:'ok'},need:['steth','xray'],
    diag:{ans:'swallow',wrong:['cold','scrape'],ok:'かぎを のみこんじゃったんだね！'},
    treat:[{t:'rub',area:'belly',item:'key'},{t:'med',col:'yellow'}],end:'すっきり！ その かぎ、やねうらの かぎ だよ！'},
  {t:'lock',bg:'haunted',hints:[['pumpkin',2],['ghost',3],['star',7]],box:'chest',ins:'やねうらの たからばこ！ えの かずを かぞえて ばんごうを あわせよう',done:'パカッ！ なかには ふるい しゃしんが…'},
  {t:'talk',bg:'haunted',cast:['fu','rk','kuro','witch'],set:{kuro:'happy',witch:'kind'},lines:[
    ['narr','しゃしんには、おばけの みんなと わらう モヤモヤンが うつっていた。',{show:'heart'}],
    ['fu','モヤモヤン、ほんとは わらうのが だいすき なんだ！'],
    ['moya','み、みたモヤね…！ かえすモヤ！',{in:'moya',fx:'dark'}],
    ['moya','かぼちゃモンスター！',{fx:'boom'}],
    ['kuro','くるニャ！ みんなで いくニャ！']]},
  {t:'battle',mon:{kind:'pumpkin',name:'かぼちゃモンスター',col:'#ff9a2a'},lv:3,chances:['letter','add','count'],fin:'moon',item:'heart',ally:['kuro','witch']},
  {t:'talk',bg:'haunted',cure:true,cast:['fu','rk','obake','moya'],lines:[
    ['moya','ぼくの ことなんて… だれも さがして くれなかったモヤ…',{emo:'sad'}],
    ['obake','ちがうオバ！ みんな ずっと さがしてたオバ！'],
    ['moya','え……？'],
    ['narr','モヤモヤンは なきながら、くもの うえへ とんでいった。',{out:'moya'}],
    ['fu','こんどは わたしたちが、モヤモヤンを みつけに いこう！',{emo:'happy'}],
    ['narr','しゃしんが ひかって、えがおの スターが あらわれた！',{show:'smilestar'}],
    ['rk','えがおの スター 7こめ！ あと ひとつ！',{emo:'happy'}]]},
]},
// ---------------- 16 ----------------
{title:'くもの うえの モヤモヤじょう',icon:'ghost',bg:'sky',part:2,steps:[
  {t:'talk',bg:'sky',flag:{clear:false},cast:['fu','rk','kuro','witch'],set:{witch:'kind',kuro:'happy'},lines:[
    ['narr','7この えがおの スターが ひかって、くもの うえへの みちが できた！',{fx:'sparkle'}],
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
    ['obake','モヤモヤン、みーつけた！ だオバ！'],
    ['moya','…みんな… みつけて くれて ありがとうモヤ！',{emo:'kind'}],
    ['narr','8この えがおの スターが そろって、まちじゅうに えがおが ひろがった！',{show:'smilestar'}]]},
  {t:'talk',bg:'fair',cure:true,cast:['fu','rk','moya','kuro','witch'],set:{witch:'kind',kuro:'happy',moya:'kind'},lines:[
    ['narr','ゆうえんちで、みんなの えがお パーティー！',{fx:'confetti'}],
    ['moya','ふうせん、みんなに かえすモヤ！ いっしょに かんらんしゃ のるモヤ！'],
    ['witch','ふふ、ひとりぼっちより、みんなと いっしょが いちばんね'],
    ['fu','これからも まちの じけんは、キュアたんてい ふーちゃんに おまかせ！',{emo:'happy'}]]},
  {t:'credits',say:'キュアたんてい ふーちゃん だい2ぶ、おしまい！ あそんでくれて ありがとう！',end:'だい2ぶ おしまい',
    list:[['fu','ふーちゃん'],['rk','リッキー'],['moya','モヤモヤン'],['kuro','クロニャン'],['witch','ドロドロン'],['obake',''],['zouB',''],['kuma',''],['hiyoko',''],['pen',''],['usaQ',''],['fukuL',''],['kitsune',''],['lion',''],['nezumi',''],['hitsuji','']]},
]},
);

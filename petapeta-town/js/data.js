/* お題（ふしぎ発見モード）・おはなし・ごほうび */
'use strict';
(() => {
  /* goals はどれか1つが起きればOK（正解は1つじゃない） */
  const O = (stage, text, goals, hint) => ({ id: stage + ':' + text, stage, text, goals, hint });
  PT.ODAI = [
    O('home', 'おうちを ひみつきちに できるかな？', ['d_fort', 'd_tent'], ['blanket', 'tent']),
    O('home', 'くらい ところで ひかりを つかってみよう', ['d_shadow', 'd_light'], ['flashlight']),
    O('home', 'ぬいぐるみの おたんじょうびかいを ひらこう！', ['d_bday', 'd_bananabday'], ['teddy', 'cake']),
    O('home', 'だんボールは なにに なるかな？', ['d_boxcar', 'd_rocket', 'd_boxboat', 'd_boxshop', 'd_robot'], ['box']),
    O('home', 'へんな ものを くみあわせてみよう！', ['d_weird', 'd_sillyhat'], ['bucket', 'apple']),
    O('home', 'おもちゃばこには なにが はいってる？', ['d_toybox'], ['toybox']),
    O('park', 'ボールで あそぼう！', ['d_ball', 'd_catch', 'd_bubbleball'], ['ball']),
    O('park', 'すなばで なにか つくろう', ['d_sandcastle', 'd_dig'], ['bucket', 'sandbox']),
    O('park', 'いけに だれか うかべてみよう', ['d_duck', 'd_feedduck', 'd_splash'], ['duck', 'bread']),
    O('park', 'ブランコや すべりだいで あそぼう', ['d_swing', 'd_slide'], ['swing', 'slideP']),
    O('park', 'シャボンだまを おいかけよう', ['d_bubbles', 'd_bubbleball'], ['bubbles']),
    O('shop', 'みんなで おみせやさんを してみよう！', ['d_shop', 'd_boxshop', 'd_register'], ['apron', 'counter']),
    O('shop', 'たなに たべものを ならべよう', ['d_shelf', 'd_bananabday'], ['banana', 'shelf']),
    O('shop', 'かいものかごで おかいもの', ['d_buy'], ['basket']),
    O('shop', 'やくわりを こうたい してみよう', ['d_swap', 'd_mimirole'], ['apron', 'mimi']),
    O('beach', 'すなの おしろを つくろう', ['d_sandcastle', 'd_wave'], ['bucket']),
    O('beach', 'うみで ぱしゃぱしゃ', ['d_sea', 'd_swim', 'd_splashbow'], ['swimring', 'sea']),
    O('beach', 'たからものを さがそう', ['d_shell', 'd_dig'], ['shell']),
    O('beach', 'ビーチで ピクニック', ['d_picnic'], ['parasol', 'onigiri']),
    O('camp', 'キャンプを しよう', ['d_tent', 'd_marsh'], ['tentF', 'tent', 'campfire']),
    O('camp', 'よるの もりを たんけんしよう', ['d_nightsearch', 'd_tanken', 'd_shadow'], ['flashlight', 'explorer']),
    O('camp', 'よぞらの ほしを つないでみよう', ['d_constellation'], ['skystar']),
    O('camp', 'どうぶつと なかよく なろう', ['d_animals'], ['acorn']),
    O('fun', 'のりものに のってみよう', ['d_ferris', 'd_carousel', 'd_unicorn'], ['ferris', 'carousel']),
    O('fun', 'ステージで コンサート！', ['d_concert', 'd_dance'], ['stageF', 'music']),
    O('fun', 'みんなで おいわい しよう', ['d_allparty', 'd_confetti', 'd_firework'], ['confetti']),
    O('clinic', 'ぬいぐるみを げんきに してあげよう', ['d_bedrest', 'd_plushdoc', 'd_recover'], ['teddy', 'doctor']),
    O('clinic', 'おいしゃさんごっこ しよう', ['d_doctor', 'd_plushdoc'], ['doctor']),
    O('kinder', 'みんなで たいそう！', ['d_taiso'], ['music', 'drum']),
    O('kinder', 'がっこうごっこを しよう', ['d_school', 'd_read'], ['bunny', 'book']),
    O('kinder', 'ピアノで うたおう', ['d_piano'], ['piano']),
    O('station', 'でんしゃで おでかけ しよう', ['d_travel', 'd_trainarrive', 'd_train'], ['trainF']),
    O('station', 'かいさつを とおってみよう', ['d_gate'], ['gate']),
    O('space', 'ロケットで うちゅうへ！', ['d_rocketride', 'd_rocket'], ['rocketF', 'box']),
    O('space', 'うちゅうじんに あいたいな', ['d_alien'], ['planet']),
    O('space', 'ふわふわ ジャンプ してみよう', ['d_moonjump', 'd_space'], ['helmet']),
    O('forest', 'まほうを かけてみよう', ['d_fairypond', 'd_wand', 'd_magictree', 'd_witch'], ['fairypond', 'magictree']),
    O('forest', 'きのこで ジャンプ！', ['d_mushroom'], ['mushroom']),
    O('fest', 'ぼんおどりを おどろう', ['d_bonodori'], ['yagura', 'drum']),
    O('fest', 'やたいで あそぼう', ['d_goldfish', 'd_festfood'], ['stall']),
    O('fest', 'よぞらに はなびを あげよう', ['d_firework'], ['firework']),
  ];
  // どのステージでも出せる お題
  PT.ODAI_ANY = [
    O('any', 'ぼうしを かぶせてみよう', ['d_hat', 'd_king', 'd_party', 'd_chef', 'd_space', 'd_witch'], ['explorer', 'crown']),
    O('any', 'みんなで おどろう！', ['d_dance', 'd_parade', 'd_mimic'], ['music', 'drum']),
    O('any', 'おなかが すいたな', ['d_eat', 'd_mokoparty', 'd_meal', 'd_picnic', 'd_restaurant', 'd_cook'], ['apple', 'plate']),
    O('any', 'おともだちと なかよく しよう', ['d_hug', 'd_highfive', 'd_secret', 'd_tickle'], ['lulu', 'pon']),
    O('any', 'かわいい いしょうに きがえよう', ['d_princess', 'd_cute', 'd_ballet', 'd_fairy', 'd_flowercrown', 'd_cat', 'd_love'], ['dress', 'ribbon']),
    O('any', 'おしごとごっこを してみよう', ['d_fire', 'd_police', 'd_doctor', 'd_shop', 'd_chef', 'd_artist'], ['firehat', 'police']),
    O('any', 'たねを うえて そだてよう', ['d_seed', 'd_garden'], ['seed', 'wateringcan']),
    O('any', 'がっきで えんそう しよう', ['d_band', 'd_instrument', 'd_musicbox'], ['guitar', 'trumpet']),
    O('any', 'のりもので おでかけ しよう', ['d_bus', 'd_airplane', 'd_carpet', 'd_drive', 'd_horse', 'd_skate'], ['bus', 'airplane']),
    O('any', 'ふしぎな はこを あけてみよう', ['d_chest', 'd_egg', 'd_lamp'], ['chest', 'egg']),
    O('any', 'みんなで たべよう', ['d_pizza', 'd_kanpai', 'd_suikawari', 'd_picnic'], ['pizza', 'juice']),
    O('any', 'ふしぎな ことを おこそう', ['d_star', 'd_rainbow', 'd_wand', 'd_balloon'], ['star', 'balloon']),
  ];

  (PT.ROYAL_ODAI || []).forEach(([text, goals, hint]) => PT.ODAI_ANY.push(O('any', text, goals, hint)));

  /* おはなしモード：3〜5この できごとを つなぐ。脱線しても OK */
  const S = (stage, id, title, steps, end) => ({ id, stage, title, steps, end });
  const st = (text, goals, hint) => ({ text, goals, hint });
  PT.STORIES = [
    S('home', 'st-bday', 'ぬいぐるみの おたんじょうびかい', [
      st('きょうは くまさんの おたんじょうび！ くまさんを よんであげよう', ['*teddy', '*bunny'], ['teddy']),
      st('パーティーぼうしを かぶって じゅんびしよう', ['d_party', 'd_hat'], ['partyhat']),
      st('ケーキを もってきて！', ['d_bday'], ['cake']),
      st('さいごは みんなで おいわい！', ['d_confetti', 'd_dance', 'd_firework'], ['confetti', 'music']),
    ], 'くまさん、おたんじょうび おめでとう！'),
    S('home', 'st-base', 'ひみつきちを つくろう', [
      st('もうふを ソファに かけてみよう', ['d_fort'], ['blanket', 'sofa']),
      st('ひみつきちは くらいね。ひかりを もってきて', ['d_shadow'], ['flashlight']),
      st('かげえに きょうりゅうが…ほんものも くるかも？', ['d_dino'], ['dino']),
      st('みんなで たんけんに しゅっぱつ！', ['d_tanken'], ['explorer', 'bag']),
    ], 'すごい たんけんたいの できあがり！'),
    S('park', 'st-park', 'こうえんの いちにち', [
      st('まずは ブランコか すべりだいで あそぼう', ['d_swing', 'd_slide'], ['swing', 'slideP']),
      st('ボールで おいかけっこ！', ['d_ball', 'd_catch'], ['ball']),
      st('いけの アヒルさんにも あいさつ', ['d_duck', 'd_feedduck'], ['duck']),
      st('おなかが すいたら ピクニック', ['d_picnic', 'd_mokoparty', 'd_eat'], ['sheet', 'onigiri']),
    ], 'たのしい いちにち だったね！'),
    S('shop', 'st-shop', 'おみせやさんが おおいそがし', [
      st('てんいんさんに エプロンを わたそう', ['d_shop', 'd_register', 'd_boxshop'], ['apron']),
      st('たなに バナナを ならべて！', ['d_shelf'], ['banana']),
      st('おきゃくさんは かいものかごで おかいもの', ['d_buy'], ['basket']),
      st('こんどは やくわりを こうたい！', ['d_swap', 'd_mimirole'], ['apron']),
    ], 'きょうも おみせは だいせいこう！'),
    S('beach', 'st-beach', 'なつの うみの ぼうけん', [
      st('すなはまで おしろを つくろう', ['d_sandcastle'], ['bucket']),
      st('あっ なみが！ どうなるかな？', ['d_wave'], ['bucket']),
      st('うみで ぱしゃぱしゃ あそぼう', ['d_sea', 'd_swim'], ['swimring']),
      st('すなに うもれた たからものを さがせ！', ['d_shell', 'd_dig'], ['shell']),
    ], 'うみの たからもの みつけたね！'),
    S('camp', 'st-camp', 'よるの キャンプ', [
      st('テントを たてて キャンプの じゅんび', ['d_tent'], ['tentF', 'tent']),
      st('たきびで マシュマロを やこう', ['d_marsh'], ['campfire']),
      st('かいちゅうでんとうで もりを てらすと…', ['d_nightsearch', 'd_shadow'], ['flashlight']),
      st('よぞらの ほしを つないで せいざを みつけよう', ['d_constellation'], ['skystar']),
    ], 'おやすみなさい。いい ゆめを！'),
    S('fun', 'st-fun', 'ゆうえんちの パレード', [
      st('かんらんしゃか メリーゴーラウンドに のろう', ['d_ferris', 'd_carousel'], ['ferris', 'carousel']),
      st('ステージで コンサートを ひらこう', ['d_concert'], ['stageF', 'music']),
      st('たいこで パレード！', ['d_parade'], ['drum']),
      st('さいごは はなびで おいわい', ['d_firework', 'd_allparty', 'd_confetti'], ['firework', 'confetti']),
    ], 'ゆめみたいな いちにち！'),
    S('fun', 'st-princess', 'プリンセスの ぶとうかい', [
      st('ドレスや ティアラで おめかし しよう', ['d_princess', 'd_jewel', 'd_mirror', 'd_snowprincess'], ['gown_rose', 'jewelbox']),
      st('ばしゃか おうまで おしろへ', ['d_carriage', 'd_whitehorse'], ['carriage', 'whitehorse']),
      st('ぶとうかいで ワルツを おどろう', ['d_ball', 'd_chandelier', 'd_prince'], ['invitation', 'chandelier']),
      st('のこされた ガラスの くつ…もちぬしは だれ？', ['d_slipper'], ['slipper']),
    ], 'いつまでも なかよく たのしく くらしましたとさ！'),
    S('home', 'st-castle', 'おうちが おしろに', [
      st('おうさまの いすを おいてみよう', ['d_throne'], ['throne']),
      st('おしろの おちゃかいを ひらこう', ['d_royaltea', 'd_royalcake'], ['teaset', 'royalcake']),
      st('レッドカーペットで パレード', ['d_redcarpet', 'd_royal'], ['redcarpet', 'royalcape']),
    ], 'きょうから ここは みんなの おしろ！'),
    S('clinic', 'st-clinic', 'うさぎさんが おねつ', [
      st('うさぎさんを ベッドに ねかせよう', ['d_bedrest'], ['bunny', 'bed']),
      st('おくすりの じかん', ['d_medicine'], ['medshelf']),
      st('げんきに なったら みんなで おいわい', ['d_recover', 'd_confetti', 'd_dance'], ['confetti']),
    ], 'うさぎさん、げんきに なって よかったね！'),
    S('kinder', 'st-kinder', 'ようちえんの いちにち', [
      st('あさは みんなで たいそう', ['d_taiso'], ['music']),
      st('こくばんで おべんきょう', ['d_blackboard', 'd_school'], ['blackboard']),
      st('ピアノで おうた', ['d_piano'], ['piano']),
      st('おひるね しよう', ['d_nap', 'd_sleep'], ['blanket']),
    ], 'また あした あそぼうね！'),
    S('station', 'st-station', 'でんしゃで おでかけ', [
      st('ベンチで でんしゃを まとう', ['d_bench', 'd_trainarrive'], ['bench']),
      st('かいさつで ピッ！', ['d_gate'], ['gate']),
      st('でんしゃに のって しゅっぱつ', ['d_travel'], ['trainF']),
    ], 'おみやげ ありがとう！'),
    S('space', 'st-space', 'うちゅうの たび', [
      st('ヘルメットを かぶって うちゅうひこうしに', ['d_space'], ['helmet']),
      st('ロケットで はっしゃ！', ['d_rocketride', 'd_rocket'], ['rocketF']),
      st('うちゅうじんと ともだちに なろう', ['d_alien'], ['planet']),
    ], 'うちゅうの ともだちが できたね！'),
    S('forest', 'st-forest', 'まほうの もりの ひみつ', [
      st('まほうの きを タップしてみよう', ['d_magictree'], ['magictree']),
      st('いずみに なにかを いれてみよう', ['d_fairypond'], ['fairypond']),
      st('きのこで ぽよーん！', ['d_mushroom'], ['mushroom']),
    ], 'もりの ようせいと なかよしに なったよ！'),
    S('fest', 'st-fest', 'なつまつり', [
      st('やたいで あそぼう', ['d_goldfish', 'd_festfood'], ['stall']),
      st('やぐらで ぼんおどり', ['d_bonodori'], ['yagura']),
      st('はなびを あげよう', ['d_firework'], ['firework']),
    ], 'たのしい おまつり だったね！'),
  ];

  /* ごほうび：はっけんの かずで ふえる（ゆっくり・おまけ） */
  PT.REWARDS = [
    { at: 5, item: 'wand', text: 'まほうの ステッキが つかえるように なったよ！' },
    { at: 10, item: 'rainbow', text: 'にじが つかえるように なったよ！' },
    { at: 15, item: 'firework', text: 'はなびが つかえるように なったよ！' },
    { at: 18, item: 'robotsuit', text: 'ロボットスーツが つかえるように なったよ！' },
    { at: 22, item: 'unicorn', text: 'ユニコーンが つかえるように なったよ！' },
    { at: 28, item: 'witch', text: 'まほうつかいの ぼうしが つかえるように なったよ！' },
  ];
  // 錠前つきアイテムの lock 値を REWARDS に合わせる
  PT.REWARDS.forEach((r) => { if (PT.ITEMS[r.item]) PT.ITEMS[r.item].lock = r.at; });
})();

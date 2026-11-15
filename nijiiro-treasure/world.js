/* The three expeditions share tools, but each has its own setting and puzzle. */
'use strict';
const World = (() => {
  const islands = [
    { name: 'こもれびの もり', type: 'forest', friend: 'fox', friendName: 'こぎつね', gift: 'berry', giftName: 'きのみ', cover: ['bush','mushroom','stump'], areas: ['きのみの ひろば','ふくろうの かわ','ひみつの こみち'], puzzle: 'music', puzzleArt: 'owl', puzzleName: 'ふくろうの うた', intro: 'ふくろうの うたと、こわれた つりばし。', pair: [['mushroom','rock'],['flower','stump'],['bush','log']], decor: ['tree','fern','flower','mushroom'], surprises: ['ちょうちょが とんでいった！','どんぐりが ころころ！','てんとうむしの おうちだった！'] },
    { name: 'きらきらの はまべ', type: 'beach', friend: 'turtle', friendName: 'こがめ', gift: 'seaweed', giftName: 'わかめ', cover: ['shell','bucket','rock'], areas: ['かいがらの すなはま','おさかなの いりえ','ひみつの こじま'], puzzle: 'fishing', puzzleArt: 'fish', puzzleName: 'おさかなの おとどけ', intro: 'さかなを つって、ひみつの こじまへ。', pair: [['shell','coral'],['starfish','rock'],['castle','bottle']], decor: ['shell','coral','starfish','rock'], surprises: ['ちいさな カニが よこあるき！','なみが ざぶーん！','やどかりさんが こんにちは！'] },
    { name: 'ふわふわの そら', type: 'sky', friend: 'bird', friendName: 'ことり', gift: 'ribbon', giftName: 'リボン', cover: ['cloud','house','moon'], areas: ['ことりの にわ','かぜの ふうしゃ','にじの むこう'], puzzle: 'wind', puzzleArt: 'windmill', puzzleName: 'かぜの みち', intro: 'かぜを つないで、にじの むこうへ。', pair: [['star','cloud'],['moon','house'],['flower','rainbow']], decor: ['cloud','star','flower','rainbow'], surprises: ['くもが わたあめ みたい！','おほしさまが くすくす！','そよかぜが くるくる！'] }
  ];
  const prizes = [
    ['gem','もりの しずく'],['flower','おひさまの おはな'],['crown','もりの おうかん'],
    ['pearl','にじいろ しんじゅ'],['shell','うたう かいがら'],['compass','ぼうけんの コンパス'],
    ['star','おほしさまの かけら'],['rainbow','ちいさな にじ'],['heart','そらの ハート']
  ];
  const names = { mushroom:'きのこ',stump:'きりかぶ',bush:'しげみ',rock:'いし',flower:'おはな',log:'まるた',shell:'かいがら',bucket:'バケツ',coral:'さんご',starfish:'ひとで',castle:'すなのおしろ',bottle:'びん',cloud:'くも',house:'おうち',moon:'おつきさま',star:'おほしさま',rainbow:'にじ' };
  const point = (id, art, name, x, y, size=95) => ({ id, art, name, x, y, size });
  function objects(s) {
    const d = islands[s.island], a = s.area, result = [];
    if (a === 0) {
      result.push(point('friend', d.friend, d.friendName, 18, 62, 110));
      [[38,40],[72,42],[78,77]].forEach(([x,y],i) => result.push(point(`cover${i}`,d.cover[i],names[d.cover[i]],x,y,105)));
      result.push(point('board0', 'log', 'たおれた まるた', 46, 79, 110));
      result.push(point('toy0', 'tent', 'たんけんの テント', 17, 29, 90));
    } else if (a === 1) {
      result.push(point('challenge', d.puzzleArt, d.puzzleName, 23, 40, 125));
      result.push(point('board1', 'stump', 'ふるい きりかぶ', 19, 77, 100));
      result.push(point('board2', d.type === 'beach' ? 'bottle' : 'log', 'ながれてきた き', 56, 82, 100));
      result.push(point('bridge', 'bridge', s.bridge ? 'なおった はし' : 'こわれた はし', 67, 49, 155));
      result.push(point('toy1', d.type === 'sky' ? 'balloon' : 'flower', 'ふしぎな あそびば', 52, 26, 80));
    } else {
      [[23,51],[50,76],[79,43]].forEach(([x,y],i) => result.push({...point(`dig${i}`, 'hole', `${names[d.pair[i][0]]}と ${names[d.pair[i][1]]}の あいだ`,x,y,105), pair:d.pair[i]}));
      result.push(point('toy2','lantern','ふるい ランタン',20,84,80));
      result.push(point('toy3',d.type==='sky'?'rainbow':'house','だれかの かくれが',54,30,95));
    }
    const secrets = a === 0 ? [[0,59,59],[1,89,23]] : a === 1 ? [[2,40,60],[3,88,83]] : [[4,70,87]];
    secrets.forEach(([id,x,y]) => { if (!s.secrets.includes(id)) result.push(point(`secret${id}`, 'butterfly', 'ひみつの ちょうちょ', x,y,48)); });
    return result;
  }
  function scenery(s) {
    const type = islands[s.island].type;
    let extra = '';
    if (s.area === 1) extra = `<svg viewBox="0 0 900 580" preserveAspectRatio="none"><path d="M580 0Q500 150 590 270T580 580" fill="none" stroke="${type==='sky'?'#c4bddb':'#8fc9c5'}" stroke-width="85"/><path d="M580 0Q500 150 590 270T580 580" fill="none" stroke="#eff8df" stroke-width="3" stroke-dasharray="30 20"/></svg>`;
    if (s.area === 2) extra = `<svg viewBox="0 0 900 580" preserveAspectRatio="none"><path d="M0 570Q120 290 440 380T900 170" fill="none" stroke="${type==='sky'?'#dacee4':'#e4d4a5'}" stroke-width="55" opacity=".8"/><path d="M0 570Q120 290 440 380T900 170" fill="none" stroke="#fff6d7" stroke-width="3" stroke-dasharray="6 18"/></svg>`;
    return Art.landscape(type) + extra;
  }
  function decorations(s) {
    const d = islands[s.island];
    return Array.from({length:12},(_,i)=> {
      const x = [4,95,8,92,8,94,33,66,39,64,3,96][i], y = [18,18,46,48,91,94,17,18,94,95,69,67][i];
      return `<span style="left:${x}%;top:${y}%;width:${i<2?130:40+(i%3)*10}px;transform:translate(-50%,-50%) rotate(${i%2?9:-8}deg)">${Art.svg(d.decor[(i+s.area)%d.decor.length])}</span>`;
    }).join('');
  }
  function create(island) {
    return { island, area:0, seed:Math.floor(Math.random()*100000), gift:false, tool:false, boards:[], bridge:false, challenge:false, secrets:[], inspected:[], musicRound:0, fish:0, wind:[1,2,3], bridgeSlots:[], dug:[], visits:[0] };
  }
  const pieces = s => Number(s.tool) + Number(s.bridge) + Number(s.challenge);
  function validate(s) {
    const integer=(v,min,max)=>Number.isInteger(v)&&v>=min&&v<=max;
    const list=(v,max)=>Array.isArray(v)&&v.length<=max+1&&new Set(v).size===v.length&&v.every(i=>integer(i,0,max));
    if (!s || !integer(s.island,0,2) || !integer(s.area,0,2) || !integer(s.seed,0,99999) ||
        !['gift','tool','bridge','challenge'].every(k=>typeof s[k]==='boolean') ||
        !list(s.boards,2)||!list(s.secrets,4)||!list(s.inspected,2)||!list(s.bridgeSlots,2)||!list(s.dug,8)||!list(s.visits,2)||
        !integer(s.musicRound,0,2)||!integer(s.fish,0,3)||!Array.isArray(s.wind)||s.wind.length!==3||!s.wind.every(v=>integer(v,0,3))) return null;
    // Recover an interrupted save between placing the last piece and awarding the map.
    s = {...s};
    if (s.bridgeSlots.length===3 && s.boards.length===3) s.bridge=true;
    if ((s.island===0&&s.musicRound===2) || (s.island===1&&s.fish===3) ||
        (s.island===2&&s.wind.every((v,i)=>v===[0,2,1][i]))) s.challenge=true;
    if ((s.area===2&&!s.bridge) || (s.bridge&&(s.boards.length!==3||s.bridgeSlots.length!==3)) || (s.dug.length&&pieces(s)!==3) || (s.tool&&!s.gift)) return null;
    return Object.fromEntries(Object.keys(create(0)).map(k=>[k,s[k]]));
  }
  return { islands, prizes, names, objects, scenery, decorations, create, validate, pieces };
})();

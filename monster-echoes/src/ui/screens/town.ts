import { sfx } from '../../infrastructure/audio/Sound';
import type { App } from '../App';
import { openArena } from './arena';
import { openBreeding } from './breeding';
import { openDex } from './dex';
import { openParty, openSettings } from './menus';
import { openShop } from './shop';
import { startBattle } from './battle';
import { getItem } from '../../data/items';
import { getSpecies } from '../../data/monsters';
import { BREEDING_RECIPES } from '../../data/breeding';
import { DEX_REWARDS, MEDAL_PRIZES } from '../../data/town';
import { btn, h } from '../dom';
import { monIcon } from '../components/monster';

export const NPC_NAMES: Record<string, string> = {
  doctor: 'モンスターはかせ', lily: 'リリィ', shop: 'どうぐや', arena: 'とうぎじょうの うけつけ', scribe: 'きろくがかり', kid: 'こども', granny: 'おばあさん',
  librarian: 'としょがかり', researcher: 'けんきゅういん', farmer: 'まきばの おじさん', medal: 'メダルあつめの ひと', coach: 'コーチ', fountain: 'ふんすい',
};

const KID_TIPS = [
  'にくを なげると モンスターが なかまに なりやすく なるよ。やっつける まえに なげてね！',
  'モンスターが レベル10に なったら、はかせの ところで 配合 できるんだって。',
  'はじめに えらぶ おや（けっとう）の けいとうで、うまれる こが きまるらしいよ。いれかえると ちがう こに なるかも！',
  'なかまに なったばかりの モンスターは やせいが つよくて いうことを きかないんだ。ぼくじょうで にくを あげてみて。',
  'ゆがみに とりつかれた モンスターは ひかりに よわいって、ばあちゃんが いってた。',
  '配合で うまれた こは「+」が ふえるほど よく そだって、レベルの じょうげんも あがるんだ。',
  'めいれいで 1たいずつ うごかすと、ねむらせたり まもったり いろんな たたかいかたが できるよ。',
];

/** まちの人・設備に話しかける */
export async function talkTo(app: App, id: string, field: { updateHud(): void; afterMenu(): void }) {
  const g = app.game!;
  const name = NPC_NAMES[id] ?? '';
  const done = () => field.afterMenu();
  switch (id) {
    case 'doctor': {
      if (!g.state.progress.tutorialFlags.breedTalk) {
        await app.say(['おお、きたか。わしは モンスターの 配合を けんきゅうしておる。', 'レベル10いじょうの ♂と♀を つれてくれば、ふたりの ちからを うけついだ こを うみだせるぞ。', 'ただし おやの 2たいは この せかいの ひかりに かえる。よく かんがえて えらぶのじゃ。'], { speaker: name });
        g.setTutorial('breedTalk');
      }
      const c = await app.ask('なにを するかね？', ['配合する', 'モンスターずかん', 'はなしを きく', 'やめる'], { speaker: name });
      if (c === 0) openBreeding(app, done);
      else if (c === 1) openDex(app);
      else if (c === 2)
        await app.say([
          'はじめに えらぶ おやを「けっとう」という。こどもは だいたい けっとうの けいとうを うけつぐ。',
          'じゃが、とくべつな くみあわせでは まったく ちがう モンスターが うまれることも ある。ずかんに ヒントを かいておいたぞ。',
          'おやを よく そだててから 配合すると、こどもの「+」が おおきくなる。+が おおきい こほど よく そだつのじゃ。',
        ], { speaker: name });
      break;
    }
    case 'lily': {
      if (!g.state.progress.tutorialFlags.ranchTalk) {
        await app.say(['ここは ぼくじょうよ。なかまに した モンスターは みんな ここで あずかるわ。', 'つれていけるのは 3たいまで。たびの まえに えらんでね！'], { speaker: name });
        g.setTutorial('ranchTalk');
      }
      openParty(app, done);
      break;
    }
    case 'shop': {
      const c = await app.ask('いらっしゃい！ なんの ようだい？', ['かう', 'うる', 'やめる'], { speaker: name });
      if (c === 0 || c === 1) openShop(app, c === 0 ? 'buy' : 'sell', done);
      break;
    }
    case 'arena':
      if (!g.state.progress.unlockedArenaRanks.length) {
        await app.say(['ここは とうぎじょう。うでだめしを する ちょうりつしが あつまる ところです。', 'もりの ゆがみを はらった かたなら さんか できますよ。'], { speaker: name });
        break;
      }
      openArena(app, done);
      break;
    case 'scribe': {
      const c = await app.ask('ぼうけんの きろくを つけますか？', ['きろくする', 'せってい', 'やめる'], { speaker: name });
      if (c === 0) await app.saveNow(true);
      if (c === 1) openSettings(app);
      break;
    }
    case 'kid': {
      const i = (g.state.player.playTimeSec / 7 + g.state.monsters.length) | 0;
      await app.say(KID_TIPS[i % KID_TIPS.length], { speaker: name });
      break;
    }
    case 'granny': {
      const p = g.state.progress;
      const shards = ['shard1', 'shard2', 'shard3'].filter((f) => p.storyFlags[f]).length;
      if (p.storyFlags.champion)
        await app.say(['ひかりの クリスタルが もとに もどって、せかいの ゆがみも おさまったねえ。', 'むかし きいた はなしだよ…すいしょうの りゅうと にじの とり、どちらも 配合を かさねた つよい こを あわせると、でんせつの りゅうが うまれるとか。'], { speaker: name });
      else if (shards === 3)
        await app.say(['かけらが 3つ そろったね。あとは とうぎじょうの ルナフィアたいかいで ゆうしょうして、クリスタルを まつる ゆるしを もらうんだよ。'], { speaker: name });
      else
        await app.say([`むかし この まちには ひかりの クリスタルが あったんだよ。くだけて できた ゆがみが、たびのとびらの むこうで モンスターたちを くるしめている…。`, `かけらは いま ${shards}つ。ぜんぶで 3つ あつめておくれ。`], { speaker: name });
      break;
    }
    case 'fountain':
      sfx('heal');
      g.healAll();
      await app.say('いやしの ふんすいだ。\nモンスターたちの HPと MPが すべて かいふくした！');
      break;
    case 'librarian': {
      const got = g.claimDexRewards();
      if (got.length) {
        sfx('levelup');
        for (const r of got) {
          const items = Object.entries(r.items).map(([id, n]) => `${getItem(id).name}×${n}`).join('と ');
          await app.say(`ずかんに ${r.count}しゅるい いじょう のったね！\nごほうびに ちいさなメダル×${r.medals}${items ? `と ${items}` : ''}を どうぞ。`, { speaker: name });
        }
      }
      const next = DEX_REWARDS.find((r) => !g.state.progress.storyFlags[`dex${r.count}`]);
      const c = await app.ask(next ? `いま ${g.state.discoveredSpeciesIds.length}しゅるい。${next.count}しゅるいで また ごほうびが あるよ。` : 'ずかんを かんせいさせたね！ すばらしい！', ['ずかんを みる', 'やめる'], { speaker: name });
      if (c === 0) openDex(app);
      break;
    }
    case 'researcher': {
      await app.say(['ここでは とくべつな 配合を けんきゅうしている。', 'いままでに わかった ことを おしえよう。'], { speaker: name });
      openRecipeNotes(app);
      break;
    }
    case 'farmer':
      if (g.takeRanchGift()) { sfx('chest'); await app.say('たびから かえってきたのかい？ おみやげに ジャーキーを 2こ あげよう！', { speaker: name }); }
      else await app.say(['ここは ひろい まきばだ。あずけた モンスターが のびのび くらしているよ。', 'また たびから かえってきたら よっておくれ。'], { speaker: name });
      break;
    case 'medal':
      openMedalShop(app);
      break;
    case 'coach': {
      const c = await app.ask('れんしゅうじあいを するかい？ いまの パーティと おなじくらいの あいてだ。（けいけんちだけ もらえる）', ['する', 'やめる'], { speaker: name });
      if (c !== 0) break;
      const r = g.startPracticeBattle();
      if (!r.ok) { await app.say(r.error); break; }
      startBattle(app, r.value);
      return;
    }
  }
  field.updateHud();
}

/** メダルこうかん */
function openMedalShop(app: App) {
  const g = app.game!;
  const p = app.panel('メダルこうかん', (body) => {
    body.append(h('div', { class: 'win' }, `ちいさなメダル ${g.state.inventory.medal ?? 0}まい`), h('div', { class: 'small muted' }, 'たからばこ・ボス・ずかんの ごほうびで てに はいるよ。'));
    const list = h('div', { class: 'list' });
    for (const pr of MEDAL_PRIZES) {
      const b = btn(`${pr.cost}まい`, async () => {
        const r = g.exchangeMedal(pr.id);
        if (!r.ok) return app.toast(r.error);
        sfx('chest');
        await app.say(r.value);
        p.refresh();
      }, 'primary');
      b.disabled = (g.state.inventory.medal ?? 0) < pr.cost;
      list.append(h('div', { class: 'win row' }, h('div', { class: 'grow' }, pr.name, h('div', { class: 'small muted' }, pr.desc)), b));
    }
    body.append(list);
  });
}

/** けんきゅういんの メモ: とくべつな配合の ヒント（おやを みたことが あれば ヒント、うまれたら こたえ） */
function openRecipeNotes(app: App) {
  const g = app.game!;
  app.panel('とくべつな 配合の メモ', (body) => {
    for (const r of BREEDING_RECIPES.filter((x) => x.kind === 'special')) {
      const child = getSpecies(r.resultSpeciesId);
      const parents = [r.parentA, r.parentB].map((m) => ('speciesId' in m ? m.speciesId : ''));
      const known = g.state.ownedSpeciesIds.includes(child.id);
      const seen = parents.some((x) => g.state.discoveredSpeciesIds.includes(x));
      body.append(h('div', { class: 'win row' }, monIcon(child.id, 'icon', { silhouette: !known }),
        h('div', { class: 'grow small' }, h('div', { class: 'hl' }, known ? child.name : '？？？'),
          known ? h('div', null, parents.map((x) => getSpecies(x).name).join(' × ')) : h('div', { class: 'muted' }, seen ? r.hint! : 'まだ てがかりが ない…'))));
    }
  });
}

import { sfx } from '../../infrastructure/audio/Sound';
import type { App } from '../App';
import type { Facing } from '../gfx/tiles';
import { openArena } from './arena';
import { openBreeding } from './breeding';
import { openDex } from './dex';
import { openGate } from './gate';
import { openParty, openSettings } from './menus';
import { openShop } from './shop';

type Npc = { look?: string; facing?: Facing; idle?: boolean; name: string };
export const TOWN_NPCS: Record<string, Npc> = {
  '1': { look: 'doctor', name: 'モンスターはかせ' },
  '2': { look: 'lily', name: 'リリィ' },
  '3': { look: 'shop', name: 'どうぐや' },
  '4': { look: 'arena', name: 'とうぎじょうの うけつけ' },
  '5': { look: 'scribe', name: 'きろくがかり' },
  '6': { look: 'kid', name: 'こども', idle: true },
  '7': { look: 'granny', name: 'おばあさん', idle: true },
  F: { name: 'ふんすい' },
  G: { name: 'たびのとびら' },
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
  const name = TOWN_NPCS[id]?.name ?? '';
  const done = () => field.afterMenu();
  switch (id) {
    case '1': {
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
    case '2': {
      if (!g.state.progress.tutorialFlags.ranchTalk) {
        await app.say(['ここは ぼくじょうよ。なかまに した モンスターは みんな ここで あずかるわ。', 'つれていけるのは 3たいまで。たびの まえに えらんでね！'], { speaker: name });
        g.setTutorial('ranchTalk');
      }
      openParty(app, done);
      break;
    }
    case '3': {
      const c = await app.ask('いらっしゃい！ なんの ようだい？', ['かう', 'うる', 'やめる'], { speaker: name });
      if (c === 0 || c === 1) openShop(app, c === 0 ? 'buy' : 'sell', done);
      break;
    }
    case '4':
      if (!g.state.progress.unlockedArenaRanks.length) {
        await app.say(['ここは とうぎじょう。うでだめしを する ちょうりつしが あつまる ところです。', 'もりの ゆがみを はらった かたなら さんか できますよ。'], { speaker: name });
        break;
      }
      openArena(app, done);
      break;
    case '5': {
      const c = await app.ask('ぼうけんの きろくを つけますか？', ['きろくする', 'せってい', 'やめる'], { speaker: name });
      if (c === 0) await app.saveNow(true);
      if (c === 1) openSettings(app);
      break;
    }
    case '6': {
      const i = (g.state.player.playTimeSec / 7 + g.state.monsters.length) | 0;
      await app.say(KID_TIPS[i % KID_TIPS.length], { speaker: name });
      break;
    }
    case '7': {
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
    case 'F':
      sfx('heal');
      g.healAll();
      await app.say('いやしの ふんすいだ。\nモンスターたちの HPと MPが すべて かいふくした！');
      break;
    case 'G':
      openGate(app, done);
      break;
  }
  field.updateHud();
}

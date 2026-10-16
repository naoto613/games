import { sfx } from '../../infrastructure/audio/Sound';
import type { App } from '../App';
import { openBreeding } from './breeding';
import { openDex } from './dex';
import { openParty, openSettings } from './menus';
import { openShop } from './shop';
import { getItem } from '../../data/items';
import { DEX_REWARDS, MEDAL_PRIZES } from '../../data/town';
import { btn, h } from '../dom';
import { NPC_BY_ID } from '../../data/story';
import { playStory, sayLines } from './story';

export const NPC_NAMES: Record<string, string> = {
  lily: 'ぼくじょうの リリィ', shop: 'どうぐや', librarian: 'としょがかり', farmer: 'まきばの おじさん', medal: 'メダルあつめの ひと', fountain: 'ふんすい', merchant: '行商人',
};

/** まちの人・設備に話しかける（会話は data/story/npcs の 会話表。章ごとに かわる） */
export async function talkTo(app: App, id: string, field: { updateHud(): void; afterMenu(): void }) {
  const g = app.game!;
  const name = NPC_BY_ID[id]?.name ?? NPC_NAMES[id] ?? '';
  const done = () => field.afterMenu();
  // 会話表の ある 人は まず その 台詞（物語イベントが あれば そちらが さき）
  if (NPC_BY_ID[id]) {
    await sayLines(app, g.talkTo(id));
    if (await playStory(app, g)) return;
  }
  switch (id) {
    case 'sora': {
      const c = await app.ask('ほかに ようは あるかい？', ['ぼうけんを きろくする', 'せってい', 'なにも ない'], { speaker: name });
      if (c === 0) await app.saveNow(true);
      if (c === 1) openSettings(app);
      break;
    }
    case 'minamo': {
      if (!g.hasFeature('breeding')) break;
      const c = await app.ask('なにを する？', ['配合する', 'モンスターずかん', 'やめる'], { speaker: name });
      if (c === 0) openBreeding(app, done);
      else if (c === 1) openDex(app);
      break;
    }
    case 'lily': {
      if (!g.state.progress.tutorialFlags.ranchTalk) {
        await app.say(['ここは 小さな 牧場よ。なかまに した モンスターは ここで あずかるわ。', 'つれていけるのは 3たいまで。でかける まえに えらんでね！'], { speaker: name });
        g.setTutorial('ranchTalk');
      }
      if (g.state.breedingHistory.length > 0 && !g.state.progress.tutorialFlags.lilyBred) {
        await app.say(['あら…その こ、配合で うまれた こね！', 'おやの ちからを うけついで、とても いきいきしてる。だいじに そだててあげてね。'], { speaker: name });
        g.setTutorial('lilyBred');
      }
      openParty(app, done);
      break;
    }
    case 'merchant':
    case 'shop': {
      const c = await app.ask(id === 'merchant' ? 'たびの 行商人だよ。なにか いるかい？' : 'いらっしゃい！ なんの ようだい？', ['かう', 'うる', 'やめる'], { speaker: name });
      if (c === 0 || c === 1) openShop(app, c === 0 ? 'buy' : 'sell', done);
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
          const items = Object.entries(r.items).map(([iid, n]) => `${getItem(iid).name}×${n}`).join('と ');
          await app.say(`ずかんに ${r.count}しゅるい いじょう のったね！\nごほうびに ちいさなメダル×${r.medals}${items ? `と ${items}` : ''}を どうぞ。`, { speaker: name });
        }
      }
      const next = DEX_REWARDS.find((r) => !g.state.progress.storyFlags[`dex${r.count}`]);
      const c = await app.ask(next ? `いま ${g.state.discoveredSpeciesIds.length}しゅるい。${next.count}しゅるいで また ごほうびが あるよ。` : 'ずかんを かんせいさせたね！ すばらしい！', ['ずかんを みる', 'やめる'], { speaker: name });
      if (c === 0) openDex(app);
      break;
    }
    case 'farmer':
      if (g.takeRanchGift()) { sfx('chest'); await app.say('たびから かえってきたのかい？ おみやげに ジャーキーを 2こ あげよう！', { speaker: name }); }
      else await app.say(['ここは ミズナの 魔物牧場だ。あずけた モンスターが のびのび くらしているよ。', 'パーティの いれかえも ここで できる。'], { speaker: name });
      openParty(app, done);
      break;
    case 'medal':
      openMedalShop(app);
      break;
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

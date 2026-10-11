import { ARENA_RANKS, getArenaRank } from '../../data/areas';
import { getSpecies } from '../../data/monsters';
import { describeCondition } from '../../domain/progression/ProgressionEngine';
import { playBgm, sfx } from '../../infrastructure/audio/Sound';
import type { App } from '../App';
import { btn, h, item } from '../dom';
import { startBattle } from './battle';
import { FieldScreen, rewardText } from './field';

/** 闘技場: ランクを選んで連戦する */
export function openArena(app: App, onClose: () => void) {
  const g = app.game!;
  app.panel('とうぎじょう', (body) => {
    body.append(h('div', { class: 'small muted' }, '3れんせんを かちぬけば ゆうしょう。とうぎじょうでは どうぐと にくは つかえません。'));
    const list = h('div', { class: 'win list' });
    for (const r of ARENA_RANKS) {
      const open = g.state.progress.unlockedArenaRanks.includes(r.id);
      const cleared = g.state.progress.clearedArenaRanks.includes(r.id);
      list.append(item(h('span', null, r.name, cleared ? h('span', { class: 'hl' }, ' ★ゆうしょう') : null,
        h('div', { class: 'small muted' }, open ? r.description : `じょうけん: ${r.entryConditions.map(describeCondition).join('、')}`)), () => rankDetail(r.id), { disabled: !open }));
    }
    body.append(list);
  }, { onClose });

  function rankDetail(id: string) {
    const r = getArenaRank(id);
    app.panel(r.name, (body, foot) => {
      body.append(h('div', { class: 'win small' }, r.description));
      r.battles.forEach((b, i) => body.append(h('div', { class: 'win small' }, h('h3', null, `だい${i + 1}せん ${b.trainer}`),
        h('div', { class: 'muted' }, b.enemies.map((e) => (g.state.discoveredSpeciesIds.includes(e.speciesId) ? getSpecies(e.speciesId).name : '？？？') + ` Lv${e.level}`).join('、')))));
      body.append(h('div', { class: 'win small' }, h('h3', null, 'ゆうしょう しょうひん'), r.rewards.map((x) => h('div', null, rewardText(x))),
        g.state.progress.clearedArenaRanks.includes(r.id) ? h('div', { class: 'muted' }, '（2かいめ いこうは すこしの ゴールド）') : null));
      foot.append(btn('さんかする', async () => {
        const c = g.canEnterArena(id);
        if (!c.ok) return app.toast(c.error);
        if (!(await app.confirm(`${r.name}に さんか しますか？\nいまの パーティで たたかいます。`))) return;
        runRank(app, id, 0);
      }, 'primary grow'));
    });
  }
}

async function runRank(app: App, rankId: string, idx: number) {
  const g = app.game!;
  const r = getArenaRank(rankId);
  const b = r.battles[idx];
  await app.say(`${r.name} だい${idx + 1}せん！\n${b.trainer}が しょうぶを いどんできた！`);
  sfx('encounter');
  startBattle(app, g.startArenaBattle(rankId, idx), async (sum) => {
    if (sum.outcome === 'win' && sum.arena && !sum.arena.cleared) {
      const rec = r.betweenBattleRecovery;
      if (rec !== 'none') await app.say(rec === 'full' ? 'つぎの しあいまでに モンスターたちは すっかり げんきに なった。' : 'つぎの しあいまでに すこし やすむ ことが できた。');
      return runRank(app, rankId, idx + 1);
    }
    if (sum.outcome === 'win' && sum.arena?.cleared) {
      sfx('levelup');
      await app.say(`おめでとう！ ${r.name} ゆうしょうだ！`);
      for (const x of sum.arena.rewards) await app.say(`${rewardText(x)}を てにいれた！`);
      if (rankId === 'arenaD' && sum.arena.rewards.length) await ending(app);
    }
    app.show(new FieldScreen(app));
  });
}

async function ending(app: App) {
  playBgm('town');
  await app.say([
    'ルナフィアたいかいの ゆうしょうしゃとして、まちの ひろばに まねかれた。',
    'あつめた 3つの ひかりのかけらが、ふんすいの うえで ひとつに なっていく…。',
    'ひかりの クリスタルが ふっかつした！',
    'たびのとびらの むこうの ゆがみは しずまり、モンスターたちは おだやかさを とりもどした。',
    `${app.game!.state.player.name}と モンスターたちの なまえは、ルナフィアの ちょうりつしとして ながく かたりつがれた…。`,
    '〜 おしまい 〜',
    '……でも、配合の けんきゅうに おわりは ない。まだ みぬ でんせつの モンスターが いるらしい。',
  ]);
}

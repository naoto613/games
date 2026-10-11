import { AREAS } from '../../data/areas';
import { describeCondition } from '../../domain/progression/ProgressionEngine';
import { sfx } from '../../infrastructure/audio/Sound';
import type { App } from '../App';
import { h, item } from '../dom';

/** 旅の扉: 行き先をえらぶ */
export function openGate(app: App, onClose: () => void) {
  const g = app.game!;
  const p = app.panel('たびのとびら', (body) => {
    body.append(h('div', { class: 'small muted' }, 'とびらの むこうへ でかけよう。とちゅうで かえるには「かえりのはね」か、さいしょの フロアの ひかりの わを つかおう。'));
    if (g.state.monsters.length >= g.state.capacity) body.append(h('div', { class: 'win small bad' }, 'ぼくじょうが いっぱいです。モンスターが なかまに なっても つれて かえれません。'));
    const list = h('div', { class: 'win list' });
    const avg = Math.round(g.party.reduce((a, m) => a + m.level, 0) / Math.max(1, g.party.length));
    for (const a of AREAS) {
      const open = g.state.progress.unlockedAreas.includes(a.id);
      const cleared = g.state.progress.defeatedBossIds.some((b) => a.floors.some((f) => f.bossId === b));
      list.append(item(h('span', null, open ? a.name : '？？？', cleared ? h('span', { class: 'hl' }, ' ★') : null, h('div', { class: 'small muted' }, open ? `${a.description}（めやす Lv${a.recommendedLevel}〜）` : `ひらく じょうけん: ${a.unlockConditions.map(describeCondition).join('、')}`)), async () => {
        const c = g.canStartExpedition(a.id);
        if (!c.ok) return app.toast(c.error, 2200);
        if (avg + 2 < a.recommendedLevel && !(await app.confirm(`めやすは Lv${a.recommendedLevel}〜です。それでも いきますか？`))) return;
        g.startExpedition(a.id);
        sfx('stairs');
        p.close();
        app.toast(g.floor!.floor.name);
      }, { disabled: !open }));
    }
    body.append(list);
  }, { onClose });
}

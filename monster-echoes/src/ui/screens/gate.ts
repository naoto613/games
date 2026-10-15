import { getArea } from '../../data/areas';
import { STAGE_BY_ID } from '../../data/world/chapters';
import { sfx } from '../../infrastructure/audio/Sound';
import type { App } from '../App';
import { h, item } from '../dom';

/** 森の入口・旅の扉：行き先（章の ステージ）を えらぶ。えらんだら onPick */
export function openGate(app: App, areaIds: string[], onPick: (areaId: string) => void, onClose?: () => void) {
  const g = app.game!;
  const p = app.panel('どこへ いく？', (body) => {
    if (g.state.monsters.length >= g.state.capacity) body.append(h('div', { class: 'win small bad' }, 'ぼくじょうが いっぱいです。モンスターが なかまに なっても つれて かえれません。'));
    const list = h('div', { class: 'win list' });
    for (const id of areaIds) {
      const a = getArea(id);
      const st = STAGE_BY_ID[a.stageId ?? ''];
      const can = g.canStartExpedition(id);
      const cleared = !!a.stageId && g.chapters.clearedStages.includes(a.stageId);
      const sub = can.ok ? `${a.description}（${a.floors.length}かい・めやす Lv${a.recommendedLevel}〜）` : can.error;
      list.append(item(h('span', null, st ? `${st.id} ` : '', a.name, cleared ? h('span', { class: 'hl' }, ' ★') : null, h('div', { class: 'small muted' }, sub)), () => {
        if (!can.ok) return app.toast(can.error, 2200);
        sfx('ok');
        onPick(id); // さきに えらんだ ことを つたえる（close の onClose より まえに）
        p.close();
      }, { disabled: !can.ok }));
    }
    body.append(list);
  }, { onClose });
}

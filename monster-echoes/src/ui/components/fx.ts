// 演出の ちいさな オーバーレイ
import { sfx } from '../../infrastructure/audio/Sound';
import { getSpecies } from '../../data/monsters';
import type { App } from '../App';
import { h } from '../dom';
import { monIcon } from './monster';

/** なかまに なった しゅんかん: モンスターを おおきく うかびあがらせる（タップで すぐ とじる） */
export function recruitFx(app: App, speciesId: string, firstTime: boolean): Promise<void> {
  const sp = getSpecies(speciesId);
  sfx('recruit');
  const sparks = Array.from({ length: 12 }, (_, i) => h('i', { class: 'spark', style: `--a:${i * 30}deg;--d:${i % 2 ? 70 : 100}px` }));
  const box = h('div', { class: 'recruitfx' },
    h('div', { class: 'rf-glow' }),
    ...sparks,
    monIcon(speciesId, 'icon rf-sprite'),
    h('div', { class: 'rf-text' }, `${sp.name}が なかまに なった！`, firstTime ? h('div', { class: 'rf-new' }, 'ずかんに なかまとして とうろくされた！') : null));
  app.stage.append(box);
  const ms = app.settings.reduceMotion ? 700 : 1500;
  return new Promise((resolve) => {
    const done = () => { box.remove(); resolve(); };
    box.addEventListener('pointerdown', done, { once: true });
    setTimeout(done, ms);
  });
}

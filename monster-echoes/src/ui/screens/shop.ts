import { getItem } from '../../data/items';
import { shopItems } from '../../application/Game';
import { sfx } from '../../infrastructure/audio/Sound';
import type { App } from '../App';
import { btn, h } from '../dom';

/** 道具屋（かう・うる） */
export function openShop(app: App, mode: 'buy' | 'sell', onClose: () => void) {
  const g = app.game!;
  let tab = mode;
  const p = app.panel('どうぐや', (body) => {
    body.append(h('div', { class: 'row' },
      btn('かう', () => { tab = 'buy'; p.refresh(); }, tab === 'buy' ? 'primary grow' : 'grow'),
      btn('うる', () => { tab = 'sell'; p.refresh(); }, tab === 'sell' ? 'primary grow' : 'grow')),
      h('div', { class: 'win' }, `もちきん ${g.state.player.gold} G`));
    const ids = tab === 'buy' ? shopItems(g.state) : Object.keys(g.state.inventory).filter((id) => g.state.inventory[id] > 0 && getItem(id).category !== 'key');
    const list = h('div', { class: 'win list' });
    if (!ids.length) list.append(h('div', { class: 'muted' }, 'うれる ものが ない。'));
    for (const id of ids) {
      const it = getItem(id);
      const price = tab === 'buy' ? it.price : Math.floor(it.price / 2);
      const has = g.state.inventory[id] ?? 0;
      const act = (n: number) => {
        const r = tab === 'buy' ? g.buy(id, n) : g.sell(id, n);
        if (!r.ok) return app.toast(r.error);
        sfx('buy');
        p.refresh();
      };
      const canBuy = (n: number) => tab === 'buy' ? price * n <= g.state.player.gold : has >= n;
      const b1 = btn('×1', () => act(1)), b5 = btn('×5', () => act(5));
      b1.disabled = !canBuy(1);
      b5.disabled = !canBuy(5);
      list.append(h('div', { class: 'row', style: 'padding:4px 0;border-bottom:1px solid #2a2e48' },
        h('div', { class: 'grow' }, it.name, h('span', { class: 'hl' }, ` ${price}G`), h('span', { class: 'muted small' }, ` もち${has}`), h('div', { class: 'small muted' }, it.description)), b1, b5));
    }
    body.append(list);
  }, { onClose });
}

// もちもの画面：カテゴリ別の一覧・説明・つかう／たべる／きる 等。図鑑と実績も見られる。
import { useMemo, useState } from 'react';
import { useGame, useUI } from './hooks';
import { ITEMS, ITEM_LIST, CATEGORY_LABEL, ItemCategory } from '../../game/content/items/items';
import { ACHIEVEMENTS } from '../../game/content/quests/quests';

const CATS: ItemCategory[] = ['food', 'tool', 'clothing', 'collectible', 'quest'];

export function Inventory() {
  const g = useGame();
  const s = useUI();
  const [tab, setTab] = useState<ItemCategory | 'book'>('food');
  const [sel, setSel] = useState<string | null>(null);
  const entries = useMemo(() => g.state.player.inventory.filter((e) => ITEMS[e.itemId]?.category === tab), [tab, s.invVersion, g]);
  const def = sel ? ITEMS[sel] : null;
  const count = sel ? g.inv.count(sel) : 0;
  const actLabel = def?.useAction === 'eat' ? 'たべる' : def?.useAction === 'equip' ? (s.outfit === def.id ? 'ぬぐ' : 'きる') : def?.useAction === 'read' ? 'ちずを ひらく' : def?.useAction === 'hold' ? (g.player.heldItem === def.id ? 'しまう' : 'もつ') : null;
  return (
    <Panel title="もちもの" onClose={() => g.openPanel(null)}>
      <div className="tabs">
        {CATS.map((c) => <button key={c} className={tab === c ? 'on' : ''} onClick={() => { setTab(c); setSel(null); }}>{CATEGORY_LABEL[c]}</button>)}
        <button className={tab === 'book' ? 'on' : ''} onClick={() => { setTab('book'); setSel(null); }}>ずかん</button>
      </div>
      {tab === 'book' ? <Book /> : (
        <div className="inv">
          <div className="grid">
            {entries.length === 0 && <div className="empty">まだ なにも ない</div>}
            {entries.map((e) => (
              <button key={e.itemId} className={'cell' + (sel === e.itemId ? ' on' : '') + (s.outfit === e.itemId ? ' worn' : '')} onClick={() => setSel(e.itemId)}>
                <img src={g.icons[e.itemId]} alt="" />
                {e.count > 1 && <span className="n">×{e.count}</span>}
                <span className="nm">{ITEMS[e.itemId].name}</span>
              </button>
            ))}
          </div>
          {def && count > 0 && (
            <div className="detail">
              <img src={g.icons[def.id]} alt="" />
              <div>
                <div className="dn">{def.name} {count > 1 && <small>×{count}</small>}</div>
                <div className="dd">{def.description}</div>
                <div className="meta">{def.hunger ? `おなか +${def.hunger}　` : ''}{def.sellPrice > 0 && def.category !== 'quest' ? `うると ${def.sellPrice} コイン` : ''}</div>
                {actLabel && <button className="primary" onClick={() => { const r = g.useItem(def.id); if (r) g.toast(r, 'warn'); }}>{actLabel}</button>}
              </div>
            </div>
          )}
        </div>
      )}
    </Panel>
  );
}

function Book() {
  const g = useGame();
  const disc = g.state.progress.discoveredItemIds;
  const ach = g.state.progress.achievements;
  return (
    <div className="book">
      <div className="bh">みつけた もの {disc.length}/{ITEM_LIST.length}</div>
      <div className="grid small">
        {ITEM_LIST.map((it) => (
          <div key={it.id} className={'cell' + (disc.includes(it.id) ? '' : ' unknown')} title={disc.includes(it.id) ? it.name : '？？？'}>
            <img src={g.icons[it.id]} alt="" />
            <span className="nm">{disc.includes(it.id) ? it.name : '？？？'}</span>
          </div>
        ))}
      </div>
      <div className="bh">じっせき {ach.length}/{Object.keys(ACHIEVEMENTS).length}</div>
      <div className="achs">
        {Object.entries(ACHIEVEMENTS).map(([id, a]) => (
          <div key={id} className={'ach' + (ach.includes(id) ? ' got' : '')}><b>{ach.includes(id) ? '🏅' : '・'} {a.name}</b><span>{ach.includes(id) ? a.desc : '？？？'}</span></div>
        ))}
      </div>
    </div>
  );
}

export function Panel(p: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="panel-wrap" onPointerDown={(e) => { if (e.target === e.currentTarget) p.onClose(); }}>
      <div className={'panel' + (p.wide ? ' wide' : '')}>
        <div className="ph"><h2>{p.title}</h2><button className="close" onClick={p.onClose} aria-label="とじる">×</button></div>
        <div className="pb">{p.children}</div>
      </div>
    </div>
  );
}

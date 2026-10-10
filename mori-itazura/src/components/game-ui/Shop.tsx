// 売店：かう／うる。値段を見せてから取引し、所持金と持ち物を更新する。
import { useState } from 'react';
import { useGame, useUI } from './hooks';
import { Panel } from './Inventory';
import { SHOP } from '../../game/content/items/shop';
import { ITEMS } from '../../game/content/items/items';

export function Shop() {
  const g = useGame();
  const s = useUI();
  const [mode, setMode] = useState<'buy' | 'sell'>(s.shop ?? 'buy');
  const [confirm, setConfirm] = useState<string | null>(null);
  void s.invVersion;
  const sellable = g.state.player.inventory.filter((e) => { const d = ITEMS[e.itemId]; return d && d.sellPrice > 0 && d.category !== 'quest'; });
  return (
    <Panel title="ばいてん" onClose={() => g.closeShop()}>
      <div className="shophead"><img src={g.portraits.shop} alt="" className="face sm" /><span>{mode === 'buy' ? 'なんでも そろってるよ！' : 'いいものなら たかく かうよ！'}</span><div className="chip money"><img src={g.icons.coin} alt="" />{s.money}</div></div>
      <div className="tabs">
        <button className={mode === 'buy' ? 'on' : ''} onClick={() => { setMode('buy'); setConfirm(null); }}>かう</button>
        <button className={mode === 'sell' ? 'on' : ''} onClick={() => { setMode('sell'); setConfirm(null); }}>うる</button>
      </div>
      {mode === 'buy' ? (
        <div className="list">
          {SHOP.map((e) => {
            const def = ITEMS[e.id];
            const owned = g.eco.owns(e);
            const name = e.name ?? def?.name;
            const desc = e.description ?? def?.description;
            return (
              <div key={e.id} className="row">
                {def ? <img src={g.icons[e.id]} alt="" /> : <span className="up">🏠</span>}
                <div className="info"><b>{name}</b><small>{desc}</small></div>
                {confirm === e.id ? (
                  <div className="cf"><button className="primary" onClick={() => { g.buy(e.id); setConfirm(null); }}>{e.price}で かう</button><button onClick={() => setConfirm(null)}>やめる</button></div>
                ) : (
                  <button className="price" disabled={owned || s.money < e.price} onClick={() => setConfirm(e.id)}>{owned ? 'もってる' : <><img src={g.icons.coin} alt="" />{e.price}</>}</button>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="list">
          {sellable.length === 0 && <div className="empty">うれる ものが ない</div>}
          {sellable.map((e) => {
            const def = ITEMS[e.itemId];
            return (
              <div key={e.itemId} className="row">
                <img src={g.icons[e.itemId]} alt="" />
                <div className="info"><b>{def.name} ×{e.count}</b><small>{def.description}</small></div>
                <button className="price" onClick={() => g.sell(e.itemId)}>うる <img src={g.icons.coin} alt="" />{def.sellPrice}</button>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}

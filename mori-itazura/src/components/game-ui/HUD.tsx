// メイン画面の HUD：所持金・おなか・目的・ボタン類。3D 画面を覆いすぎないよう四隅に配置する。
import { useGame, useUI } from './hooks';

export function HUD() {
  const g = useGame();
  const s = useUI();
  const alertCls = s.chased ? 'chase' : s.alert >= 50 ? 'alert' : s.alert >= 20 ? 'odd' : '';
  return (
    <div className="hud">
      <div className="hud-tl">
        <div className="chip money"><img src={g.icons.coin} alt="" />{s.money}</div>
        <div className="chip hunger" title="おなか">
          <span className="hicon">🍎</span>
          <div className="bar"><div className={'fill' + (s.hunger < 25 ? ' low' : '')} style={{ width: s.hunger + '%' }} /></div>
        </div>
        <div className="chip time">{s.timeLabel}<span className="place">{s.place}</span></div>
      </div>
      <div className="hud-tr">
        <button className="rbtn" onClick={() => g.openPanel('inventory')} aria-label="もちもの"><span>👜</span><small>もちもの</small></button>
        <button className="rbtn" onClick={() => g.openPanel('map')} aria-label="ちず"><span>🗺️</span><small>ちず</small></button>
        <button className="rbtn" onClick={() => g.openPanel('menu')} aria-label="メニュー"><span>☰</span><small>メニュー</small></button>
      </div>
      {s.quest && (
        <button className="quest" onClick={() => g.openPanel('quests')}>
          <div className="qt">★ {s.quest.title}</div>
          <div className="qx">{s.quest.text}{s.quest.progress ? `（${s.quest.progress}）` : ''}</div>
        </button>
      )}
      {alertCls && (
        <div className={'alertbar ' + alertCls}>
          {s.chased ? 'おいかけられている！ にげて かくれよう！' : s.alert >= 50 ? 'あやしまれている！' : 'だれかが きづきそう…'}
          <div className="ab"><div style={{ width: s.alert + '%' }} /></div>
        </div>
      )}
      {s.hidden && <div className="hiddenTag">かくれている</div>}
      {s.hint && <div className="hint">{s.hint}</div>}
      <div className="hud-br">
        {s.action && (
          <button className={'act ' + s.action.type} onClick={() => g.act()}>{s.action.label}</button>
        )}
        <div className="row">
          {!s.inBoat && <button className={'sbtn' + (s.sneaking ? ' on' : '')} onClick={() => g.toggleSneak()}>🐾<small>{s.sneaking ? 'しのびあし中' : 'しのびあし'}</small></button>}
          {!s.inBoat && <button className="sbtn" onClick={() => g.jump()}>⤴<small>ジャンプ</small></button>}
        </div>
      </div>
    </div>
  );
}

export function Toasts() {
  const g = useGame();
  const s = useUI();
  return (
    <div className="toasts">
      {s.toasts.map((t) => (
        <div key={t.id} className={'toast ' + t.kind}>{t.icon && g.icons[t.icon] && <img src={g.icons[t.icon]} alt="" />}{t.text}</div>
      ))}
    </div>
  );
}

export function Banner() {
  const s = useUI();
  if (!s.banner) return null;
  return <div className="banner">{s.banner.split('\n').map((l, i) => <div key={i}>{l}</div>)}</div>;
}

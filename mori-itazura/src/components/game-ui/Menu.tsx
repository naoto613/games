// メニュー・クエスト一覧・つりのミニゲーム・タイトル
import { useState } from 'react';
import { useGame, useUI } from './hooks';
import { Panel } from './Inventory';

export function Menu() {
  const g = useGame();
  const s = useUI();
  return (
    <Panel title="メニュー" onClose={() => g.openPanel(null)}>
      <div className="menu">
        <button onClick={() => g.openPanel('quests')}>📜 クエスト</button>
        <button onClick={() => { g.save('manual'); g.openPanel(null); }}>💾 きろくする（セーブ）</button>
        <Volume />
        <div className="qrow">がしつ：
          {(['high', 'medium', 'low'] as const).map((q) => <button key={q} className={s.quality === q ? 'on' : ''} onClick={() => g.setQuality(q)}>{q === 'high' ? 'きれい' : q === 'medium' ? 'ふつう' : 'かるい'}</button>)}
        </div>
        <div className="help">
          <b>あそびかた</b>
          <p>・がめんの どこでも ドラッグで いどう（おおきく ひっぱると はしる）。ものや ひとを タップすると そこへ いって しらべる。</p>
          <p>・ひとに みられると あたまの「?」が たまり、「!」に なると おいかけられる。しげみや テーブルの したに かくれたり、ものかげに にげこもう。</p>
          <p>・しのびあしで ちかづくと みつかりにくい。キャンパーふくで へんそうすると、ひとと はなしたり かいものが できる。</p>
          <p>・ピンチ／ホイールで ズーム。PC では WASD・Shift（はしる）・E（しらべる）・C（しのびあし）・スペース（ジャンプ）。</p>
        </div>
        <small className="fps">{s.fps} fps</small>
      </div>
    </Panel>
  );
}

const LEVELS: [string, number][] = [['なし', 0], ['小', 0.35], ['中', 0.7], ['大', 1]];

function Volume() {
  const g = useGame();
  const [bgm, setBgm] = useState(g.audio.bgmVol);
  const [sfx, setSfx] = useState(g.audio.sfxVol);
  const near = (v: number, x: number) => Math.abs(v - x) < 0.05;
  return (
    <>
      <div className="qrow">おんがく：
        {LEVELS.map(([l, v]) => <button key={l} className={near(bgm, v) ? 'on' : ''} onClick={() => { setBgm(v); g.audio.setVolumes(v, sfx); }}>{l}</button>)}
      </div>
      <div className="qrow">こうかおん：
        {LEVELS.map(([l, v]) => <button key={l} className={near(sfx, v) ? 'on' : ''} onClick={() => { setSfx(v); g.audio.setVolumes(bgm, v); g.audio.play('pickup'); }}>{l}</button>)}
      </div>
    </>
  );
}

export function QuestsPanel() {
  const g = useGame();
  useUI();
  const list = g.quests.all.map((q) => ({ q, st: g.quests.status(q.id) })).filter((x) => x.st !== 'Locked');
  const label: Record<string, string> = { Active: 'すすめている', Available: 'うけられる', Completed: 'クリア', Failed: 'しっぱい', Locked: '' };
  return (
    <Panel title="クエスト" onClose={() => g.openPanel(null)}>
      <div className="quests">
        {list.map(({ q, st }) => (
          <div key={q.id} className={'qcard ' + st}>
            <div className="qh"><b>{q.title}</b><span>{label[st]}</span></div>
            <p>{q.description}</p>
            {st === 'Active' && <ul>{q.objectives.map((o, i) => <li key={i} className={i < g.quests.step(q.id) ? 'done' : i === g.quests.step(q.id) ? 'now' : ''}>{o.text}</li>)}</ul>}
            {st === 'Available' && q.giver && <small>だれかに はなしかけると はじまるかも</small>}
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function Fishing() {
  const g = useGame();
  const f = useUI().fishing;
  if (!f) return null;
  const res: Record<string, string> = { fish: 'さかなが つれた！', big_fish: 'おおものだ！！', old_boot: 'ながぐつ…', old_coin: 'ふるいコインが ひっかかった！' };
  return (
    <div className="fishing">
      <div className={'fmsg ' + f.phase}>{f.phase === 'result' && f.result ? res[f.result] : f.message}</div>
      {f.phase === 'reel' && <div className="reel"><div style={{ width: Math.min(100, (f.taps ?? 0) / 6 * 100) + '%' }} /></div>}
      {f.phase === 'result' && f.result && <img className="catch" src={g.icons[f.result]} alt="" />}
      <button className={'ftap ' + f.phase} onPointerDown={(e) => { e.preventDefault(); g.fishingTap(); }}>
        {f.phase === 'bite' ? '！ いまだ ！' : f.phase === 'reel' ? 'れんだ！' : f.phase === 'result' ? 'もういちど' : 'まつ…'}
      </button>
      <button className="fstop" onClick={() => g.stopFishing()}>つりを やめる</button>
    </div>
  );
}

export function Title() {
  const g = useGame();
  const s = useUI();
  if (s.screen === 'loading') return <div className="loading"><div className="spin" /><p>{s.loadingText}</p></div>;
  if (s.screen !== 'title') return null;
  return (
    <div className="title">
      <div className="logo">
        <img src={g.portraits.player} alt="" />
        <h1><small>もりの</small>いたずら日和</h1>
        <p>ちいさな もりの いたずらっこ「コロ」の キャンプじょう ぼうけん</p>
      </div>
      <div className="tbtns">
        {s.hasSave && <button className="primary" onClick={() => g.start(true)}>つづきから</button>}
        <button className={s.hasSave ? '' : 'primary'} onClick={() => g.start(false)}>はじめから</button>
      </div>
      <small className="note">スマホ・タブレットの Chrome むけ／おとが でます🔊／がめんの どこでも ドラッグで いどう</small>
    </div>
  );
}

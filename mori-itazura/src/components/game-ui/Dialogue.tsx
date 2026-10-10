// 会話パネル：名前・顔・本文・選択肢。3D 画面の下に重ねる。
import { useGame, useUI } from './hooks';

export function Dialogue() {
  const g = useGame();
  const d = useUI().dialogue;
  if (!d) return null;
  return (
    <div className="dlg-wrap" onPointerDown={(e) => e.stopPropagation()}>
      <div className={'dlg ' + (d.mood ?? '')}>
        {d.portrait && <img className="face" src={d.portrait} alt="" />}
        <div className="dbody">
          <div className="dname">{d.name}</div>
          <div className="dtext">{d.text}</div>
          <div className="dchoices">
            {d.choices.map((c, i) => <button key={i} onClick={() => g.chooseDialogue(i)}>{c}</button>)}
          </div>
        </div>
        <button className="close" onClick={() => g.closeDialogue()} aria-label="とじる">×</button>
      </div>
    </div>
  );
}

import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import { Game } from './game/core/Game';
import { GameCtx } from './components/game-ui/hooks';
import css from './components/game-ui/styles.css';

const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);

const game = new Game();
(window as unknown as { game: Game }).game = game;
const root = createRoot(document.getElementById('ui')!);
root.render(<GameCtx.Provider value={game}><App /></GameCtx.Provider>);
game.init(document.getElementById('c') as HTMLCanvasElement, document.getElementById('bubbles')!).catch((e) => {
  console.error(e);
  game.ui.set({ loadingText: 'よみこみに しっぱいしました：' + (e?.message ?? e) });
});

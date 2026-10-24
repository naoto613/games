// エントリーポイント
import css from '../ui/styles.css';
import { Game } from './game';

const style = document.createElement('style');
style.textContent = css;
document.head.append(style);

const app = document.getElementById('app')!;
const game = new Game(app);
(window as unknown as { GAME: Game }).GAME = game;
void game.showTitle();

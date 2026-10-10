import { createContext, useContext, useSyncExternalStore } from 'react';
import type { Game } from '../../game/core/Game';

export const GameCtx = createContext<Game>(null as unknown as Game);
export const useGame = () => useContext(GameCtx);
export function useUI() {
  const g = useGame();
  return useSyncExternalStore(g.ui.subscribe, g.ui.get);
}

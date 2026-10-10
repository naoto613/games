// 画面の組み立て（React は UI だけを担当し、3D の毎フレーム更新はゲームループが行う）
import { HUD, Toasts, Banner } from '../components/game-ui/HUD';
import { Dialogue } from '../components/game-ui/Dialogue';
import { Inventory } from '../components/game-ui/Inventory';
import { Shop } from '../components/game-ui/Shop';
import { MapPanel } from '../components/game-ui/Map';
import { Menu, QuestsPanel, Fishing, Title } from '../components/game-ui/Menu';
import { useUI } from '../components/game-ui/hooks';

export function App() {
  const s = useUI();
  return (
    <>
      {s.screen === 'game' && !s.dialogue && !s.fishing && <HUD />}
      {s.screen === 'game' && <Dialogue />}
      {s.screen === 'game' && <Fishing />}
      {s.panel === 'inventory' && <Inventory />}
      {s.panel === 'map' && <MapPanel />}
      {s.panel === 'menu' && <Menu />}
      {s.panel === 'quests' && <QuestsPanel />}
      {s.shop && <Shop />}
      <Toasts />
      <Banner />
      <Title />
    </>
  );
}

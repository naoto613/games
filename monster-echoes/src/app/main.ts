import { App } from '../ui/App';
import css from '../ui/styles.css';
import { IndexedDbSaveRepository } from '../infrastructure/save/IndexedDbSaveRepository';
import { MemorySaveRepository, type SaveRepository } from '../infrastructure/save/SaveRepository';
import { TitleScreen } from '../ui/screens/title';
import { setSoundEnabled } from '../infrastructure/audio/Sound';

async function boot() {
  const style = document.createElement('style');
  style.textContent = css;
  document.head.append(style);
  let repo: SaveRepository = new IndexedDbSaveRepository();
  let save = null;
  let error: string | null = null;
  try {
    const r = await repo.load();
    if (r.kind === 'ok') save = r.data;
    else if (r.kind === 'error') {
      // こわれた・新しすぎるデータは消さずに退避する
      await repo.backup(r.raw).catch(() => {});
      error = r.error === 'future' ? 'あたらしい バージョンの きろくが あります。ページを さいよみこみ してください。' : 'きろくが こわれていたため、べつの ばしょに ひなんさせました。';
    }
  } catch {
    repo = new MemorySaveRepository();
    error = 'このブラウザでは きろくが のこせません（プライベートモードなど）。';
  }
  const app = new App(repo);
  try {
    const s = JSON.parse(localStorage.getItem('me-settings') ?? 'null');
    if (s) { setSoundEnabled(s.sound !== false); document.body.classList.toggle('large', !!s.largeText); }
  } catch { /* ignore */ }
  if (save) setSoundEnabled(save.settings.sound);
  app.show(new TitleScreen(app, save, error));
  (window as unknown as { app: App }).app = app;
}
boot();

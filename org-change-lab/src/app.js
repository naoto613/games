// アプリの起動・画面の切り替え
import { openIndexedDb, createMemoryDb } from './repositories/db.js';
import { Repository } from './repositories/repository.js';
import { InitiativeService } from './services/initiativeService.js';
import { AnalysisService } from './services/analysisService.js';
import { parseRoute, navigate } from './router.js';
import { h, clear } from './components/dom.js';
import { toast } from './components/ui.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderNewInitiative, renderInitiative } from './pages/initiativeDetail.js';
import { renderSettings } from './pages/settings.js';

const root = document.getElementById('app');
const banner = document.getElementById('storage-banner');

const ctx = {
  repo: null,
  svc: null,
  analysis: null,
  settings: null,
  route: null,
  navigate,
  rerender: () => render({ keepScroll: true }),
  async reloadSettings() {
    ctx.settings = await ctx.repo.getSettings();
    return ctx.settings;
  },
};

function showStorageBanner(message) {
  banner.textContent = message;
  banner.hidden = false;
}

let renderSeq = 0;
async function render({ keepScroll = false } = {}) {
  const seq = ++renderSeq;
  const route = parseRoute();
  const prevRoute = ctx.route;
  ctx.route = route;
  const scrollY = window.scrollY;
  document.querySelectorAll('[data-nav]').forEach((a) => {
    const nav = a.dataset.nav;
    const active = (nav === 'home' && ['dashboard', 'new', 'initiative'].includes(route.name))
      || (nav === 'knowledge' && route.name === 'settings' && route.params.section === 'knowledge')
      || (nav === 'settings' && route.name === 'settings' && route.params.section !== 'knowledge');
    if (active) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
  const view = h('div', { class: 'view' });
  try {
    switch (route.name) {
      case 'dashboard': await renderDashboard(view, ctx); break;
      case 'new': await renderNewInitiative(view, ctx); break;
      case 'initiative': await renderInitiative(view, ctx, route.params); break;
      case 'settings': await renderSettings(view, ctx, route.params); break;
      default:
        view.append(h('div', { class: 'card' }, h('h1', {}, 'ページが見つかりません'), h('p', {}, h('a', { href: '#/' }, 'ホームへ戻る'))));
    }
  } catch (e) {
    console.error(e);
    view.append(h('div', { class: 'alert alert-error', role: 'alert' }, h('p', { class: 'alert-title' }, '画面を表示できませんでした'), h('p', {}, e.message)));
  }
  if (seq !== renderSeq) return; // 後から始まった描画を優先
  clear(root).append(view);
  const samePage = keepScroll || (prevRoute && prevRoute.name === route.name && prevRoute.params.id === route.params.id && route.name !== 'settings');
  if (samePage) window.scrollTo(0, scrollY);
  else {
    window.scrollTo(0, 0);
    const heading = view.querySelector('h1');
    if (heading) { heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true }); }
  }
  const title = view.querySelector('h1')?.textContent;
  document.title = title && route.name !== 'dashboard' ? `${title} | Org Change Lab` : 'Org Change Lab';
}

async function boot() {
  let db;
  try {
    db = await openIndexedDb();
  } catch (e) {
    db = createMemoryDb();
    showStorageBanner(`データを保存できません（IndexedDB の初期化に失敗：${e.message}）。この状態で入力した内容は、ページを閉じると失われます。プライベートブラウズを解除するか、別のブラウザでお試しください。`);
  }
  ctx.repo = new Repository(db);
  ctx.svc = new InitiativeService(ctx.repo);
  ctx.analysis = new AnalysisService(ctx.repo);
  try {
    await ctx.reloadSettings();
  } catch (e) {
    ctx.settings = { aiMode: 'manual', backendUrl: './api', model: 'claude-opus-5-5' };
    toast(`設定を読み込めませんでした：${e.message}`, 'error');
  }
  window.addEventListener('hashchange', () => render());
  window.addEventListener('unhandledrejection', (e) => {
    toast(`処理に失敗しました：${e.reason?.message || e.reason}`, 'error');
  });
  await render();
}

boot();

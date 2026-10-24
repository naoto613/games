// ハッシュルーター（GitHub Pages のような静的ホスティングでもそのまま動く）

const ROUTES = [
  { name: 'dashboard', pattern: /^\/?$/ },
  { name: 'new', pattern: /^\/new\/?$/ },
  { name: 'initiative', pattern: /^\/i\/([^/]+)(?:\/([a-z]+))?\/?$/, keys: ['id', 'tab'] },
  { name: 'settings', pattern: /^\/settings(?:\/([a-z]+))?\/?$/, keys: ['section'] },
];

export function parseRoute(hash = location.hash) {
  const path = decodeURIComponent(hash.replace(/^#/, '')) || '/';
  for (const r of ROUTES) {
    const m = path.match(r.pattern);
    if (m) {
      const params = {};
      (r.keys || []).forEach((k, i) => { params[k] = m[i + 1] || null; });
      return { name: r.name, params, path };
    }
  }
  return { name: 'notfound', params: {}, path };
}

export function navigate(path) {
  const target = `#${path}`;
  if (location.hash === target) window.dispatchEvent(new HashChangeEvent('hashchange'));
  else location.hash = target;
}

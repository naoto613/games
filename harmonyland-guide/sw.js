/* sw.js — 一度開いたあとは通信できなくても基本情報を見られるようにする（HTTPS / localhost のみ） */
var CACHE = 'harmonyland-guide-v2';
var FILES = [
  './', './index.html', './css/style.css', './manifest.webmanifest',
  './js/data-fallback.js', './js/storage.js', './js/app.js', './js/map.js', './js/schedule.js', './js/planner.js',
  './data/app-config.json', './data/facilities.json', './data/shows.json', './data/sources.json', './data/opening-info.json', './data/park-info.json',
  './assets/icon.svg', './assets/map-base.svg'
];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  // ネットワーク優先（データ差し替えをすぐ反映）、失敗したらキャッシュ
  e.respondWith(fetch(req).then(function (res) {
    if (res && res.ok) { var copy = res.clone(); caches.open(CACHE).then(function (c) { c.put(req, copy); }); }
    return res;
  }).catch(function () {
    return caches.match(req, { ignoreSearch: true }).then(function (r) { return r || caches.match('./index.html'); });
  }));
});

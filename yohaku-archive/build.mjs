// src/app/main.ts を 1 つの game.js にまとめる（GitHub Pages ではビルド済みの game.js をそのまま配信する）
import * as esbuild from 'esbuild';
await esbuild.build({
  entryPoints: ['src/app/main.ts'],
  bundle: true,
  minify: true,
  target: ['chrome100', 'safari15'],
  outfile: 'game.js',
  loader: { '.css': 'text' },
  legalComments: 'none',
  logLevel: 'info',
});

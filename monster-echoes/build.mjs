// src/app/main.ts を 1 つの game.js にまとめる（GitHub Pages ではビルド済みの game.js をそのまま配信する）
import * as esbuild from 'esbuild';
const watch = process.argv.includes('--watch');
const opts = {
  entryPoints: ['src/app/main.ts'],
  bundle: true,
  minify: !watch,
  sourcemap: false,
  target: ['chrome100', 'safari15'],
  outfile: 'game.js',
  loader: { '.css': 'text' },
  legalComments: 'none',
  logLevel: 'info',
};
if (watch) { const ctx = await esbuild.context(opts); await ctx.watch(); await ctx.serve({ servedir: '.', port: 8124 }); }
else await esbuild.build(opts);

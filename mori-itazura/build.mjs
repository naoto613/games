// src/main.tsx を 1 つの game.js にまとめる（GitHub Pages ではビルド済みの game.js をそのまま配信する）
import * as esbuild from 'esbuild';
const watch = process.argv.includes('--watch');
const opts = {
  entryPoints: ['src/main.tsx'],
  bundle: true,
  minify: !watch,
  sourcemap: false,
  target: ['chrome100', 'safari15'],
  outfile: 'game.js',
  loader: { '.css': 'text' },
  define: { 'process.env.NODE_ENV': watch ? '"development"' : '"production"' },
  legalComments: 'none',
  logLevel: 'info',
};
if (watch) { const ctx = await esbuild.context(opts); await ctx.watch(); await ctx.serve({ servedir: '.', port: 8123 }); }
else await esbuild.build(opts);

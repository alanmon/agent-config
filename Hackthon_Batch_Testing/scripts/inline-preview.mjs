/**
 * Folds the built CSS + JS into a single prototype-preview.html that runs from a
 * plain file:// open (no dev server, no module/CORS restrictions).
 *
 * Run via `npm run preview:file`.
 *
 * NB: every replace() below uses a *function* replacer. String replacements would
 * expand `$&`, `` $` `` and `$'` inside the minified bundle and silently corrupt it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist-preview');
const out = path.join(root, 'prototype-preview.html');

const js = fs.readFileSync(path.join(dist, 'app.js'), 'utf8');
const cssName = fs.readdirSync(path.join(dist, 'assets')).find((f) => f.endsWith('.css'));
const css = fs.readFileSync(path.join(dist, 'assets', cssName), 'utf8');

if (js.includes('</script')) throw new Error('bundle contains a closing script tag; inlining is unsafe');

let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
html = html.replace(/<script[^>]*src=[^>]*><\/script>/, () => '');
html = html.replace(/<link rel="stylesheet"[^>]*>/, () => `<style>\n${css}\n</style>`);
html = html.replace('</body>', () => `  <script>\n${js}\n  </script>\n</body>`);
html = html.replace(/<title>.*?<\/title>/, () => '<title>Ads Manager → Lead agent hub · Prototype</title>');

fs.writeFileSync(out, html);
console.log(`prototype-preview.html written (${Math.round(html.length / 1024)} kB)`);

#!/usr/bin/env node
// Opens every prebuilt docs demo (public/gen/demos, after `npm run build-demos`)
// in headless Chromium and reports the ones that don't render: an uncaught
// error, the error overlay, an empty page, or the license footer.
//
//   npm run check:demos -- [id-prefix…] [--shots <dir>]
//
// Playwright comes from the examples app (`npm ci --prefix examples`).
import fs from 'node:fs';
import http from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';

const WWW_DIR = path.resolve(import.meta.dirname, '..');
const PUBLIC_DIR = path.join(WWW_DIR, 'public');
const CONCURRENCY = 6;

const args = process.argv.slice(2);
let shotsDir = null;
const prefixes = [];
for (let index = 0; index < args.length; index++) {
  if (args[index] === '--shots') shotsDir = path.resolve(args[++index]);
  else prefixes.push(args[index].replace(/^content\//, ''));
}

const require = createRequire(path.resolve(WWW_DIR, '../examples/package.json'));
const { chromium } = require('@playwright/test');

const manifest = JSON.parse(fs.readFileSync(path.join(PUBLIC_DIR, 'gen/demos/manifest.json'), 'utf8'));
const ids = Object.keys(manifest.demos)
  .filter((id) => !prefixes.length || prefixes.some((prefix) => id.startsWith(prefix)))
  .sort();

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.wasm': 'application/wasm',
  '.svg': 'image/svg+xml',
};
const server = http.createServer((request, response) => {
  const file = path.join(PUBLIC_DIR, decodeURIComponent(new URL(request.url, 'http://x').pathname));
  if (!file.startsWith(PUBLIC_DIR) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
    response.writeHead(404).end();
    return;
  }
  response.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(response);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1100, height: 650 } });
const failures = [];
let done = 0;

async function checkDemo(id) {
  const page = await context.newPage();
  const problems = [];
  page.on('pageerror', (error) => problems.push(`uncaught: ${error.message.split('\n')[0]}`));
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    // a failed request is reported below, with its URL
    if (/Failed to load resource/.test(text)) return;
    problems.push(`console.error: ${text.split('\n')[0].slice(0, 300)}`);
  });
  page.on('requestfailed', (request) => {
    problems.push(`request failed: ${request.url()} (${request.failure()?.errorText})`);
  });
  page.on('response', (response) => {
    if (response.status() >= 400) problems.push(`HTTP ${response.status()}: ${response.url()}`);
  });
  try {
    await page.goto(`${origin}${manifest.demos[id].html}?theme=dark`, { waitUntil: 'load' });
    // rendered: the grid has cells (remote data can take a while), or the
    // page has something else to show
    await page
      .waitForFunction(() => document.querySelector('.InfiniteColumnCell') != null, null, { timeout: 20000 })
      .catch(() => {});
    await page.waitForTimeout(400);
    const state = await page.evaluate(() => ({
      overlay: document.querySelector('#dk-error-overlay')?.textContent ?? null,
      grid: document.querySelector('.Infinite') != null,
      cells: document.querySelectorAll('.InfiniteColumnCell').length,
      text: document.querySelector('#root')?.textContent?.trim().length ?? 0,
      children: document.querySelector('#root')?.childElementCount ?? 0,
      license: /Powered by Infinite Table/i.test(document.body.textContent ?? ''),
    }));
    if (state.overlay) problems.push(`error overlay: ${state.overlay.slice(0, 300)}`);
    if (!state.children) problems.push('nothing rendered');
    else if (!state.grid) problems.push(`no grid rendered (${state.text} chars of text)`);
    else if (!state.cells) problems.push('grid without cells');
    // the invalid-license demo is there to show the footer
    if (state.license && !id.endsWith('invalid-license')) problems.push('license footer shown');
    if (shotsDir) {
      const file = path.join(shotsDir, `${id.replace(/\//g, '__')}.png`);
      fs.mkdirSync(shotsDir, { recursive: true });
      await page.screenshot({ path: file });
    }
  } catch (error) {
    problems.push(`check failed: ${error.message.split('\n')[0]}`);
  }
  await page.close();
  done++;
  if (problems.length) failures.push({ id, problems: [...new Set(problems)] });
  process.stdout.write(`\r${done}/${ids.length}`);
}

const queue = [...ids];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) await checkDemo(queue.shift());
  }),
);
await browser.close();
server.close();

process.stdout.write('\r');
for (const { id, problems } of failures.sort((a, b) => a.id.localeCompare(b.id))) {
  console.log(`${id}\n${problems.map((problem) => `  - ${problem}`).join('\n')}`);
}
console.log(`${ids.length - failures.length}/${ids.length} demo(s) render cleanly`);
if (failures.length) process.exitCode = 1;

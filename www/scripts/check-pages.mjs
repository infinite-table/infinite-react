#!/usr/bin/env node
// Opens docs pages on a running site (`npm run dev`, or a served static
// build) in headless Chromium and checks the docs-kit cards on them: every
// live demo iframe has to render a grid, and no page may log an error.
//
//   npm run check:pages -- <origin> <route | content folder>… [--shots <dir>]
//   npm run check:pages -- http://localhost:3001 /docs/learn/sorting/overview content/docs/learn/columns
//
// Playwright comes from the examples app (`npm ci --prefix examples`).
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

const WWW_DIR = path.resolve(import.meta.dirname, '..');
const CONTENT_DIR = path.join(WWW_DIR, 'content');

const args = process.argv.slice(2);
const origin = args.shift()?.replace(/\/$/, '');
let shotsDir = null;
const routes = [];
for (let index = 0; index < args.length; index++) {
  if (args[index] === '--shots') {
    shotsDir = path.resolve(args[++index]);
  } else if (args[index].startsWith('/')) {
    routes.push(args[index]);
  } else {
    // a content folder: every page in it
    const dir = path.resolve(args[index]);
    for (const name of fs.readdirSync(dir).sort()) {
      if (!name.endsWith('.page.md')) continue;
      const base = name.slice(0, -'.page.md'.length);
      const folder = `/${path.relative(CONTENT_DIR, dir).split(path.sep).join('/')}`;
      routes.push(base === 'index' ? folder : `${folder}/${base}`);
    }
  }
}
if (!origin || !routes.length) {
  console.error('usage: check-pages.mjs <origin> <route | content folder>… [--shots <dir>]');
  process.exit(1);
}

const require = createRequire(path.resolve(WWW_DIR, '../examples/package.json'));
const { chromium } = require('@playwright/test');

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1400, height: 900 } });
let failed = 0;

for (const route of routes) {
  const page = await context.newPage();
  const problems = [];
  // only what the site itself throws or logs, not the CodeSandbox embeds on some pages
  page.on('pageerror', (error) => {
    if (error.stack && !error.stack.includes(origin)) return;
    problems.push(`uncaught: ${error.message.split('\n')[0]}`);
  });
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const from = message.location().url;
    if (from && !from.startsWith(origin)) return;
    const text = message.text().split('\n')[0].slice(0, 300);
    // the license demo logs this on purpose; failed requests are reported with their URL
    if (/Failed to load resource|Infinite Table license|infinite-table\.com|playing fair|^\*+$/.test(text)) return;
    problems.push(`console.error: ${text}`);
  });
  page.on('response', (response) => {
    const url = response.url();
    // (the footer's /llms.txt link is prefetched as a page, which a static server can't answer)
    if (response.status() >= 400 && url.startsWith(origin) && !url.includes('/llms.txt.txt')) {
      problems.push(`HTTP ${response.status()}: ${url}`);
    }
  });

  const response = await page.goto(`${origin}${route}`, { waitUntil: 'load', timeout: 180000 });
  if (!response || response.status() >= 400) problems.push(`HTTP ${response?.status()} for the page`);

  // the reference pages keep each prop's details (and its demos) collapsed
  for (let guard = 0; guard < 2000; guard++) {
    const toggle = page.getByRole('button', { name: 'Show Details' }).first();
    if (!(await toggle.count())) break;
    await toggle.click();
  }

  // demo iframes load lazily: bring each one into view and wait for its grid
  const cards = page.locator('.dk-demo');
  const cardCount = await cards.count();
  let live = 0;
  for (let index = 0; index < cardCount; index++) {
    const card = cards.nth(index);
    if (await card.evaluate((el) => el.classList.contains('dk-demo--code-only'))) continue;
    live++;
    const title =
      (await card.locator('.dk-demo-title').first().textContent({ timeout: 1000 }).catch(() => null)) ?? `demo ${index + 1}`;
    await card.scrollIntoViewIfNeeded();
    const frameElement = card.locator('iframe').first();
    try {
      await frameElement.waitFor({ state: 'attached', timeout: 15000 });
    } catch {
      problems.push(`"${title.trim()}": the preview iframe never mounted`);
      continue;
    }
    const frame = await frameElement.elementHandle().then((handle) => handle.contentFrame());
    try {
      await frame.waitForSelector('.InfiniteColumnCell', { timeout: 30000 });
    } catch {
      const overlay = await frame.locator('#dk-error-overlay').textContent().catch(() => null);
      problems.push(`"${title.trim()}": ${overlay ? `error overlay: ${overlay.slice(0, 200)}` : 'no grid cells after 30s'}`);
    }
  }
  if (shotsDir) {
    fs.mkdirSync(shotsDir, { recursive: true });
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.screenshot({ path: path.join(shotsDir, `${route.replace(/^\//, '').replace(/\//g, '__') || 'home'}.png`), fullPage: true });
  }
  await page.close();
  const unique = [...new Set(problems)];
  if (unique.length) failed++;
  console.log(`${unique.length ? 'FAIL' : 'ok  '} ${route} (${cardCount} card(s), ${live} live)`);
  for (const problem of unique) console.log(`       - ${problem}`);
}
await browser.close();
console.log(`${routes.length - failed}/${routes.length} page(s) ok`);
if (failed) process.exitCode = 1;

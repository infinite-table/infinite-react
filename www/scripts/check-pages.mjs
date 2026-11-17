#!/usr/bin/env node
// Opens docs pages on a running site (`npm run dev`, or a served static
// build) in headless Chromium and checks the docs-kit cards on them: every
// live demo iframe has to render a grid, and no page may log an error.
//
//   npm run check:pages -- <origin> <route | content folder>… [--framework vue] [--color-scheme light|dark] [--shots <dir>]
//   npm run check:pages -- http://localhost:3001 /docs/learn/sorting/overview content/docs/learn/columns
//
// `--framework vue` checks the Vue version of the pages (`/vue/docs/…`): of a
// content folder, the pages with `vue:` in their frontmatter. There, every
// demo has to be the Vue one; a card that still shows the React demo (the
// "React only for now" notice) is listed, and fails the check with
// `--no-fallbacks`.
//
// `--color-scheme light|dark` sets the browser's preferred colour scheme, which
// the site follows when the visitor hasn't picked a mode.
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
let framework = null;
let noFallbacks = false;
let colorScheme = null;
const targets = [];
for (let index = 0; index < args.length; index++) {
  if (args[index] === '--shots') shotsDir = path.resolve(args[++index]);
  else if (args[index] === '--framework') framework = args[++index];
  else if (args[index] === '--no-fallbacks') noFallbacks = true;
  else if (args[index] === '--color-scheme') colorScheme = args[++index];
  else targets.push(args[index]);
}
// React pages have no prefix
const prefix = framework && framework !== 'react' ? `/${framework}` : '';

/** `vue: true`, or `vue:` with the page's own title / description */
function pageHasFramework(file) {
  if (!prefix) return true;
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(fs.readFileSync(file, 'utf8'))?.[1] ?? '';
  const value = new RegExp(`^${framework}:(.*)$`, 'm').exec(frontmatter)?.[1].trim();
  return value != null && value !== 'false';
}

const routes = [];
for (const target of targets) {
  if (target.startsWith('/')) {
    routes.push(target.startsWith(`${prefix}/`) ? target : `${prefix}${target}`);
    continue;
  }
  // a content folder: every page in it
  const dir = path.resolve(target);
  for (const name of fs.readdirSync(dir).sort()) {
    if (!name.endsWith('.page.md') || !pageHasFramework(path.join(dir, name))) continue;
    const base = name.slice(0, -'.page.md'.length);
    const folder = `${prefix}/${path.relative(CONTENT_DIR, dir).split(path.sep).join('/')}`;
    routes.push(base === 'index' ? folder : `${folder}/${base}`);
  }
}
if (!origin || !routes.length) {
  console.error(
    routes.length || !targets.length
      ? 'usage: check-pages.mjs <origin> <route | content folder>… [--framework vue] [--no-fallbacks] [--color-scheme light|dark] [--shots <dir>]'
      : `no ${framework ?? ''} pages in ${targets.join(', ')}`,
  );
  process.exit(1);
}

const require = createRequire(path.resolve(WWW_DIR, '../examples/package.json'));
const { chromium } = require('@playwright/test');

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1400, height: 900 },
  ...(colorScheme ? { colorScheme } : null),
});
let failed = 0;
let fallbackCards = 0;

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
  // a page that doesn't exist for the framework redirects to the React one
  const landed = new URL(page.url()).pathname.replace(/\/$/, '');
  if (prefix && !landed.startsWith(`${prefix}/`)) problems.push(`not a ${framework} page: redirected to ${landed}`);

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
  const fallbacks = [];
  for (let index = 0; index < cardCount; index++) {
    const card = cards.nth(index);
    const isCodeOnly = await card.evaluate((el) => el.classList.contains('dk-demo--code-only'));
    // the card shows the React file: its demo or snippet has no sibling for this framework
    const isFallback = prefix !== '' && (await card.locator('.dk-demo-notice').count()) > 0;
    // (a code card without a title would wait out the timeout: only look when the title is needed)
    if (isCodeOnly && !isFallback) continue;
    const title =
      (await card.locator('.dk-demo-title').first().textContent({ timeout: 1000 }).catch(() => null)) ?? `card ${index + 1}`;
    if (isFallback) fallbacks.push(title.trim());
    if (isCodeOnly) continue;
    live++;
    await card.scrollIntoViewIfNeeded();
    const frameElement = card.locator('iframe').first();
    try {
      await frameElement.waitFor({ state: 'attached', timeout: 15000 });
    } catch {
      problems.push(`"${title.trim()}": the preview iframe never mounted`);
      continue;
    }
    const src = (await frameElement.getAttribute('src')) ?? '';
    if (prefix && !isFallback && !src.includes(`/_${framework}/`)) {
      problems.push(`"${title.trim()}": shows ${src}, not the ${framework} demo`);
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
  fallbackCards += fallbacks.length;
  if (noFallbacks) problems.push(...fallbacks.map((title) => `"${title}": React only`));
  const unique = [...new Set(problems)];
  if (unique.length) failed++;
  console.log(
    `${unique.length ? 'FAIL' : 'ok  '} ${route} (${cardCount} card(s), ${live} live${
      fallbacks.length ? `, ${fallbacks.length} React only` : ''
    })`,
  );
  for (const problem of unique) console.log(`       - ${problem}`);
  if (!noFallbacks) for (const title of fallbacks) console.log(`       · React only: "${title}"`);
}
await browser.close();
console.log(
  `${routes.length - failed}/${routes.length} page(s) ok${
    fallbackCards ? `, ${fallbackCards} card(s) still show the React code` : ''
  }`,
);
if (failed) process.exitCode = 1;

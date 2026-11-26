// The pages of the front of the examples dev servers (examples-dev-server.js):
// the home page at / and its error pages. Same look as the test pages index
// (src/test-index/testPagesIndexApp.ts): the design tokens are read from the
// apps' own stylesheet (src/index.global.css), so the two stay the same, and
// so does the light / dark choice (localStorage, src/test-index/examplesTheme.ts).
//
// The home page: one card per app (its dev server up or not, its test pages,
// its last results) and the recently changed pages and specs, live from the
// test-runner sidecar (scripts/test-runner-results.js).

const fs = require('fs');
const net = require('net');
const path = require('path');

const EXAMPLES_ROOT = path.resolve(__dirname, '..');
const PAGES_DIR = path.join(EXAMPLES_ROOT, 'src', 'pages');
const GLOBAL_CSS = path.join(EXAMPLES_ROOT, 'src', 'index.global.css');

// themeBootScript() of src/test-index/examplesTheme.ts (keep the two the same)
const THEME_BOOT_SCRIPT =
  "(function(){try{if(navigator.webdriver)return;var d=document.documentElement;var t=localStorage.getItem('infinite-tests:theme');if(t!=='light'&&t!=='dark')t='dark';d.setAttribute('data-examples-theme',t);}catch(e){}})();";

const escape = (text) =>
  String(text).replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]),
  );

/** the `:root { --ex-* }` blocks of index.global.css (dark, then light) */
function themeTokens() {
  let css = '';
  try {
    css = fs.readFileSync(GLOBAL_CSS, 'utf8');
  } catch {}
  const blocks = css.match(
    /:root(?:\[data-examples-theme='light'\])?\s*\{[^}]*--ex-[^}]*\}/g,
  );
  return blocks ? blocks.join('\n') : '';
}

const SUFFIXES = {
  react: '.page.tsx',
  vue: '.page.vue',
  angular: '.page.angular.ts',
};

/** the number of test pages of each app (index pages left out) */
function pageCounts() {
  const counts = { react: 0, vue: 0, angular: 0, spec: 0 };
  const stack = [path.join(PAGES_DIR, 'tests')];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;
      if (entry.isDirectory()) {
        if (
          entry.name !== 'node_modules' &&
          !entry.name.endsWith('-snapshots')
        ) {
          stack.push(path.join(dir, entry.name));
        }
        continue;
      }
      if (entry.name.endsWith('.spec.ts')) counts.spec++;
      for (const [app, suffix] of Object.entries(SUFFIXES)) {
        if (entry.name.endsWith(suffix) && entry.name !== `index${suffix}`) {
          counts[app]++;
        }
      }
    }
  }
  return counts;
}

/** whether something listens on `port` (vite and ng serve: on ::1 only) */
async function isUp(port) {
  return (await canConnect(port, '127.0.0.1')) || canConnect(port, '::1');
}

function canConnect(port, host) {
  return new Promise((resolve) => {
    const socket = net.connect({ port, host });
    socket.setTimeout(400);
    const done = (up) => {
      socket.destroy();
      resolve(up);
    };
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
  });
}

const STYLES = `
* , *::before, *::after { box-sizing: border-box; }
body {
  margin: 0;
  background: var(--ex-bg);
  color: var(--ex-fg);
  font: 14px/1.5 var(--ex-font);
  color-scheme: dark;
}
:root[data-examples-theme='light'] body { color-scheme: light; }
a { color: inherit; text-decoration: none; }
.wrap { max-width: 1080px; margin: 0 auto; padding: 40px 24px 80px; display: flex; flex-direction: column; gap: 20px; }
.muted { color: var(--ex-muted); }
code, .mono { font-family: var(--ex-mono); font-size: 12.5px; }
code { color: var(--ex-fg-strong); background: var(--ex-surface-2); border: 1px solid var(--ex-border); padding: 1px 6px; border-radius: 6px; }

header { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
.eyebrow { color: var(--ex-muted); font-size: 13px; display: flex; gap: 8px; align-items: center; }
.eyebrow .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--ex-pass); box-shadow: 0 0 0 3px var(--ex-pass-soft); }
h1 { margin: 6px 0 0; font-size: 30px; font-weight: 680; letter-spacing: -0.025em; color: var(--ex-fg-strong); }
.sub { margin: 4px 0 0; color: var(--ex-muted); }
.icon-button {
  width: 34px; height: 34px; display: inline-flex; align-items: center; justify-content: center;
  border-radius: 9px; border: 1px solid var(--ex-border); background: var(--ex-surface);
  color: var(--ex-fg); cursor: pointer; font: inherit; font-size: 15px; line-height: 1;
}
.icon-button:hover { border-color: var(--ex-border-strong); background: var(--ex-surface-2); }

.apps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
@media (max-width: 820px) { .apps { grid-template-columns: 1fr; } }
.app {
  position: relative; display: flex; flex-direction: column; gap: 14px; padding: 18px;
  background: var(--ex-surface); border: 1px solid var(--ex-border); border-radius: 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
  transition: border-color 140ms, transform 140ms, box-shadow 140ms;
}
.app:hover { border-color: var(--ex-accent); box-shadow: var(--ex-shadow); transform: translateY(-1px); }
.app:focus-visible { outline: 2px solid var(--ex-accent); outline-offset: 2px; }
.app-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.app-name { display: flex; align-items: center; gap: 10px; font-size: 18px; font-weight: 650; color: var(--ex-fg-strong); }
.badge {
  width: 34px; height: 34px; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center;
  font: 700 13px/1 var(--ex-font); color: #fff;
}
.badge.react { background: linear-gradient(135deg, #22d3ee, #0ea5e9); }
.badge.vue { background: linear-gradient(135deg, #34d399, #059669); }
.badge.angular { background: linear-gradient(135deg, #f43f5e, #c026d3); }
.status { font-size: 12px; display: inline-flex; align-items: center; gap: 6px; color: var(--ex-muted); }
.status::before { content: ''; width: 7px; height: 7px; border-radius: 50%; background: var(--ex-muted); }
.status.up { color: var(--ex-pass); }
.status.up::before { background: var(--ex-pass); }
.status.down { color: var(--ex-fail); }
.status.down::before { background: var(--ex-fail); }
.stats { display: flex; gap: 16px; flex-wrap: wrap; }
.stat { display: flex; flex-direction: column; }
.stat b { font-size: 20px; font-weight: 650; color: var(--ex-fg-strong); letter-spacing: -0.01em; }
.stat span { font-size: 12px; color: var(--ex-muted); }
.stat.pass b { color: var(--ex-pass); }
.stat.fail b { color: var(--ex-fail); }
.app-foot { display: flex; justify-content: space-between; align-items: center; color: var(--ex-muted); font-size: 12.5px; }
.app-foot .open { color: var(--ex-accent); font-weight: 600; }

.card { background: var(--ex-surface); border: 1px solid var(--ex-border); border-radius: 16px; }
.card-head { display: flex; align-items: baseline; gap: 10px; padding: 16px 18px 6px; }
.card-head h2 { margin: 0; font-size: 13px; font-weight: 650; color: var(--ex-fg-strong); }
.card-head span { font-size: 12px; color: var(--ex-muted); }
.recent { list-style: none; margin: 0; padding: 4px 10px 12px; }
.recent li { display: flex; align-items: center; gap: 12px; padding: 8px; border-radius: 9px; }
.recent li:hover { background: var(--ex-hover); }
.recent .path { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--ex-fg-strong); }
.chips { display: inline-flex; gap: 4px; flex-wrap: wrap; }
.chip {
  font-size: 11.5px; padding: 2px 9px; border-radius: 999px; border: 1px solid var(--ex-border);
  color: var(--ex-muted); display: inline-flex; align-items: center; gap: 5px; white-space: nowrap;
}
a.chip:hover { color: var(--ex-accent); border-color: var(--ex-accent); }
.chip.changed { color: var(--ex-fg); border-color: var(--ex-border-strong); }
.chip .r { width: 6px; height: 6px; border-radius: 50%; }
.chip .r.pass { background: var(--ex-pass); }
.chip .r.fail { background: var(--ex-fail); }
.time { font-size: 12px; color: var(--ex-muted); white-space: nowrap; min-width: 72px; text-align: right; }
.empty { padding: 4px 18px 16px; color: var(--ex-muted); }

.tips { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
@media (max-width: 820px) { .tips { grid-template-columns: 1fr; } }
.tip { padding: 16px 18px; }
.tip h3 { margin: 0 0 6px; font-size: 13px; color: var(--ex-fg-strong); }
.tip p { margin: 0; color: var(--ex-muted); }
.tip code { display: inline-block; margin-top: 4px; }

.error h1 { font-size: 24px; }
.error p { color: var(--ex-muted); }
.back { color: var(--ex-accent); font-weight: 600; }
`;

function shell(title, body, script = '') {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escape(title)}</title>
<script>${THEME_BOOT_SCRIPT}</script>
<style>
${themeTokens()}
${STYLES}
</style>
</head>
<body>
<div class="wrap">
${body}
</div>
<script>
(function () {
  var KEY = 'infinite-tests:theme';
  var button = document.getElementById('theme');
  if (!button) return;
  function current() {
    return document.documentElement.getAttribute('data-examples-theme') === 'light' ? 'light' : 'dark';
  }
  function render() {
    var dark = current() === 'dark';
    button.textContent = dark ? '\\u2600' : '\\u263E';
    button.title = dark ? 'Switch to the light theme' : 'Switch to the dark theme';
    button.setAttribute('aria-label', button.title);
  }
  function apply(theme) {
    document.documentElement.setAttribute('data-examples-theme', theme);
    render();
  }
  button.addEventListener('click', function () {
    var next = current() === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem(KEY, next); } catch (e) {}
    apply(next);
  });
  // the choice made in another tab (one of the apps)
  window.addEventListener('storage', function (event) {
    if (event.key === KEY) apply(event.newValue === 'light' ? 'light' : 'dark');
  });
  if (navigator.webdriver) button.hidden = true;
  render();
})();
</script>
${script}
</body>
</html>`;
}

const themeButton = `<button type="button" id="theme" class="icon-button"></button>`;

/** an error page (a dev server down, a URL outside the apps) */
function errorPage(title, message, hint = '') {
  return shell(
    title,
    `<header>
  <div>
    <div class="eyebrow"><a class="back" href="/">← Infinite Table examples</a></div>
    <h1>${escape(title)}</h1>
  </div>
  ${themeButton}
</header>
<section class="card error" style="padding: 18px">
  <p style="margin: 0">${message}</p>
  ${hint ? `<p style="margin: 8px 0 0">${hint}</p>` : ''}
</section>`,
  );
}

/** the home page: the three apps, the recent changes */
async function homePage({ apps, testRunnerPort }) {
  const counts = pageCounts();
  const up = Object.fromEntries(
    await Promise.all(
      Object.entries(apps).map(async ([name, app]) => [
        name,
        await isUp(app.port),
      ]),
    ),
  );

  const cards = Object.entries(apps)
    .map(
      ([name, app]) => `<a class="app" href="/${name}/tests" data-app="${name}">
  <div class="app-top">
    <span class="app-name"><span class="badge ${name}">${app.label.slice(
        0,
        1,
      )}</span>${escape(app.label)}</span>
    <span class="status ${up[name] ? 'up' : 'down'}">${
        up[name] ? 'running' : 'not running'
      }</span>
  </div>
  <div class="stats">
    <div class="stat"><b>${counts[name]}</b><span>test pages</span></div>
    <div class="stat pass"><b data-pass>–</b><span>passed</span></div>
    <div class="stat fail"><b data-fail>–</b><span>failed</span></div>
  </div>
  <div class="app-foot"><span class="mono">/${name}/tests</span><span class="open">Open →</span></div>
</a>`,
    )
    .join('\n');

  const body = `<header>
  <div>
    <div class="eyebrow"><span class="dot"></span>Infinite Table · dev</div>
    <h1>Test pages</h1>
    <p class="sub">The React, Vue and Angular test apps on one port, with the same URLs. ${counts.spec} specs.</p>
  </div>
  ${themeButton}
</header>

<section class="apps" aria-label="Apps">
${cards}
</section>

<section class="card" aria-label="Recently changed">
  <div class="card-head"><h2>Recently changed</h2><span>pages and specs, live</span></div>
  <ul class="recent" id="recent"></ul>
  <p class="empty" id="recent-empty">Loading…</p>
</section>

<section class="tips">
  <div class="card tip"><h3>Same page, every app</h3><p>A test page has the same path in the three apps:</p><code>/react/tests/a/b</code> <code>/vue/tests/a/b</code> <code>/angular/tests/a/b</code></div>
  <div class="card tip"><h3>Run the specs</h3><p>The Run buttons of the indexes and of the pages run Playwright in watch mode, on that app.</p></div>
  <div class="card tip"><h3>Keyboard</h3><p><code>/</code> search, <code>↑</code> <code>↓</code> move, <code>←</code> <code>→</code> fold, <code>Enter</code> open, <code>Space</code> run.</p></div>
</section>`;

  const script = `<script>
(function () {
  if (navigator.webdriver) return;
  var RUNNER = location.protocol + '//' + location.hostname + ':${testRunnerPort}';
  var APPS = ${JSON.stringify(
    Object.fromEntries(
      Object.entries(apps).map(([name, app]) => [name, app.label]),
    ),
  )};
  var results = {};
  var recent = [];
  var list = document.getElementById('recent');
  var empty = document.getElementById('recent-empty');

  function esc(text) {
    return String(text).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function ago(ts) {
    var s = Math.max(0, Math.round((Date.now() - ts) / 1000));
    if (s < 45) return 'just now';
    var m = Math.round(s / 60);
    if (m < 60) return m + ' min ago';
    var h = Math.round(m / 60);
    if (h < 24) return h + ' h ago';
    return Math.round(h / 24) + ' d ago';
  }

  function renderCounts() {
    Object.keys(APPS).forEach(function (name) {
      var card = document.querySelector('.app[data-app="' + name + '"]');
      var pages = (results[name] && results[name].pages) || {};
      var pass = 0, fail = 0;
      Object.keys(pages).forEach(function (key) {
        if (pages[key].status === 'pass') pass++; else fail++;
      });
      card.querySelector('[data-pass]').textContent = results[name] ? pass : '\\u2013';
      card.querySelector('[data-fail]').textContent = results[name] ? fail : '\\u2013';
    });
  }

  function renderRecent() {
    if (!recent.length) {
      list.innerHTML = '';
      empty.hidden = false;
      empty.textContent = 'No recent changes.';
      return;
    }
    empty.hidden = true;
    list.innerHTML = recent.slice(0, 10).map(function (change) {
      var chips = Object.keys(APPS).filter(function (name) { return change.files[name]; }).map(function (name) {
        var result = results[name] && results[name].pages[change.pathname];
        var changed = change.kinds[name] ? ' changed' : '';
        return '<a class="chip' + changed + '" href="/' + name + change.pathname + '" title="' +
          (change.kinds[name] ? 'The ' + APPS[name] + ' page changed ' + ago(change.kinds[name]) + '. ' : '') +
          (result ? (result.status === 'pass' ? 'Passed ' : 'Failed ') + ago(result.ts) : 'Not run yet') + '">' +
          (result ? '<span class="r ' + result.status + '"></span>' : '') + APPS[name] + '</a>';
      }).join('');
      var spec = change.kinds.spec ? '<span class="chip changed" title="The spec changed ' + ago(change.kinds.spec) + '">spec</span>' : '';
      return '<li><span class="path mono">' + esc(change.pathname.replace(/^\\/tests\\//, '')) + '</span>' +
        '<span class="chips">' + spec + chips + '</span><span class="time">' + ago(change.ts) + '</span></li>';
    }).join('');
  }

  function load() {
    var projects = Object.keys(APPS);
    Promise.all([fetch(RUNNER + '/recent?limit=20').then(function (r) { if (!r.ok) throw r; return r.json(); })]
      .concat(projects.map(function (name) {
        return fetch(RUNNER + '/results?project=' + name).then(function (r) { if (!r.ok) throw r; return r.json(); });
      })))
      .then(function (all) {
        recent = all[0];
        projects.forEach(function (name, i) { results[name] = all[i + 1]; });
        renderCounts();
        renderRecent();
      })
      .catch(function () {
        empty.hidden = false;
        empty.textContent = 'The test runner (' + RUNNER + ') is not running, or is an older one: restart npm run dev.';
      });
  }

  load();
  try {
    var events = new EventSource(RUNNER + '/events');
    events.addEventListener('change', function (event) {
      var change = JSON.parse(event.data);
      recent = [change].concat(recent.filter(function (item) { return item.pathname !== change.pathname; }));
      renderRecent();
    });
    events.addEventListener('results', function (event) {
      var data = JSON.parse(event.data);
      var own = results[data.project] || { pages: {}, folders: {} };
      Object.assign(own.pages, data.pages);
      Object.assign(own.folders, data.folders);
      results[data.project] = own;
      renderCounts();
      renderRecent();
    });
  } catch (e) {}
  setInterval(renderRecent, 30000);
})();
</script>`;

  return shell('Infinite Table examples', body, script);
}

module.exports = { homePage, errorPage, escape };

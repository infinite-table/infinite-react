// What the test pages indexes show next to the pages, for the test-runner
// sidecar (test-runner-server.js):
//
// - the last result of every spec (pass / fail) and of every folder run, per
//   Playwright project (react / vue / angular), read from the JSON report of
//   each run and kept in .logs/test-status.json, so they outlive the sidecar;
// - the test pages and specs changed most recently (src/pages is watched;
//   at start, the most recently modified files);
// - a stream of both (Server-Sent Events), so open indexes update live.

const fs = require('fs');
const path = require('path');

const EXAMPLES_ROOT = path.resolve(__dirname, '..');
const PAGES_DIR = path.join(EXAMPLES_ROOT, 'src', 'pages');
const STATUS_FILE = path.join(EXAMPLES_ROOT, '.logs', 'test-status.json');

const PROJECTS = ['react', 'vue', 'angular'];
const RECENT_LIMIT = 30;

/** file suffix -> what the file is */
const KINDS = [
  ['.spec.ts', 'spec'],
  ['.page.tsx', 'react'],
  ['.page.vue', 'vue'],
  ['.page.angular.ts', 'angular'],
];

const isHiddenName = (name) =>
  name.startsWith('.') ||
  name.startsWith('_') ||
  name === 'node_modules' ||
  name.endsWith('-snapshots');

/**
 * `src/pages/tests/a/b.page.vue` (absolute, or relative to examples/) ->
 * `{ pathname: '/tests/a/b', kind: 'vue' }`, or null for any other file
 */
function describeFile(file) {
  const absolute = path.resolve(EXAMPLES_ROOT, file);
  const relative = path.relative(PAGES_DIR, absolute);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  const parts = relative.split(path.sep);
  if (parts.some(isHiddenName)) return null;
  const name = parts[parts.length - 1];
  const match = KINDS.find(([suffix]) => name.endsWith(suffix));
  if (!match) return null;
  const [suffix, kind] = match;
  const base = parts.join('/').slice(0, -suffix.length);
  // a folder's index page is the folder: listed by the indexes, not changed
  if (kind !== 'spec' && /(^|\/)index$/.test(base)) return null;
  return { pathname: '/' + base, kind };
}

/** which files a page has: its spec and its React / Vue / Angular pages */
function filesOf(pathname) {
  const base = path.join(PAGES_DIR, ...pathname.split('/').filter(Boolean));
  const has = {};
  for (const [suffix, kind] of KINDS) {
    has[kind] = fs.existsSync(base + suffix);
  }
  return has;
}

// ---------------------------------------------------------------- results

function emptyResults() {
  return Object.fromEntries(
    PROJECTS.map((project) => [project, { pages: {}, folders: {} }]),
  );
}

function loadResults() {
  try {
    const stored = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
    const results = emptyResults();
    for (const project of PROJECTS) {
      Object.assign(results[project].pages, stored?.[project]?.pages);
      Object.assign(results[project].folders, stored?.[project]?.folders);
    }
    return results;
  } catch {
    return emptyResults();
  }
}

const results = loadResults();

function saveResults() {
  try {
    fs.mkdirSync(path.dirname(STATUS_FILE), { recursive: true });
    fs.writeFileSync(STATUS_FILE, JSON.stringify(results, null, 2) + '\n');
  } catch (error) {
    console.error(
      `[test-runner] could not save ${STATUS_FILE}: ${error.message}`,
    );
  }
}

/** the specs of a Playwright JSON report, with their result in `project` */
function specResults(report, project) {
  const byFile = new Map();
  const walk = (suite) => {
    for (const spec of suite.specs ?? []) {
      const file = spec.file ?? suite.file;
      for (const test of spec.tests ?? []) {
        if (test.projectName !== project) continue;
        // expected / flaky: passed (flaky = passed on a retry); unexpected:
        // failed; skipped: no result for this spec
        if (test.status === 'skipped') continue;
        const failed = test.status === 'unexpected';
        byFile.set(
          file,
          (byFile.get(file) ?? 'pass') === 'fail' || failed ? 'fail' : 'pass',
        );
      }
    }
    for (const child of suite.suites ?? []) walk(child);
  };
  for (const suite of report.suites ?? []) walk(suite);
  return byFile;
}

/**
 * Records the result of a run: every spec of the JSON report, and the
 * folder when the run was a folder run. Returns what changed (or null).
 */
function recordRun({ project, mode, pathname, status, reportFile }) {
  if (!PROJECTS.includes(project)) return null;
  const ts = Date.now();
  const changed = { project, pages: {}, folders: {} };

  let report = null;
  try {
    report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
  } catch {}
  if (report) {
    for (const [file, result] of specResults(report, project)) {
      const described = describeFile(path.resolve(EXAMPLES_ROOT, file));
      if (!described || described.kind !== 'spec') continue;
      changed.pages[described.pathname] = { status: result, ts };
    }
  } else if (mode === 'page') {
    // no report (the run crashed before writing it): the exit code
    changed.pages[pathname] = { status, ts };
  }
  if (mode === 'folder') {
    changed.folders[pathname] = { status, ts };
  }
  if (
    !Object.keys(changed.pages).length &&
    !Object.keys(changed.folders).length
  ) {
    return null;
  }
  Object.assign(results[project].pages, changed.pages);
  Object.assign(results[project].folders, changed.folders);
  saveResults();
  broadcast('results', changed);
  return changed;
}

/** `{ pages, folders }` of a project */
function resultsOf(project) {
  return results[project] ?? { pages: {}, folders: {} };
}

/** the last result of one page or folder */
function lastResultOf(project, pathname) {
  const own = resultsOf(project);
  return own.pages[pathname] ?? own.folders[pathname] ?? null;
}

// ---------------------------------------------------------- recent changes

/** pathname -> { pathname, ts, kinds: { spec?: ts, react?: ts, ... } } */
const recent = new Map();

function noteChange(pathname, kind, ts) {
  const entry = recent.get(pathname) ?? { pathname, ts: 0, kinds: {} };
  entry.kinds[kind] = Math.max(entry.kinds[kind] ?? 0, ts);
  entry.ts = Math.max(entry.ts, ts);
  recent.delete(pathname);
  recent.set(pathname, entry);
  // keep the most recent ones
  if (recent.size > RECENT_LIMIT * 2) {
    const sorted = [...recent.values()].sort((a, b) => b.ts - a.ts);
    recent.clear();
    for (const item of sorted.slice(0, RECENT_LIMIT)) {
      recent.set(item.pathname, item);
    }
  }
  return entry;
}

function withFiles(entry) {
  return { ...entry, files: filesOf(entry.pathname) };
}

/** the most recently changed pages, newest first */
function recentChanges(limit = 12) {
  return [...recent.values()]
    .filter((entry) => Object.values(filesOf(entry.pathname)).some(Boolean))
    .sort((a, b) => b.ts - a.ts)
    .slice(0, limit)
    .map(withFiles);
}

/** at start: the most recently modified pages and specs */
function seedRecent() {
  const found = [];
  const stack = [PAGES_DIR];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (isHiddenName(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
        continue;
      }
      const described = describeFile(full);
      if (!described) continue;
      try {
        found.push({ ...described, ts: fs.statSync(full).mtimeMs });
      } catch {}
    }
  }
  found.sort((a, b) => a.ts - b.ts);
  for (const { pathname, kind, ts } of found.slice(-RECENT_LIMIT * 3)) {
    noteChange(pathname, kind, Math.round(ts));
  }
}

function watchPages() {
  const pending = new Map();
  try {
    fs.watch(PAGES_DIR, { recursive: true }, (_event, filename) => {
      if (!filename) return;
      const full = path.join(PAGES_DIR, filename.toString());
      const described = describeFile(full);
      if (!described) return;
      // editors write a file in several steps: one change per file
      clearTimeout(pending.get(full));
      pending.set(
        full,
        setTimeout(() => {
          pending.delete(full);
          const entry = noteChange(
            described.pathname,
            described.kind,
            Date.now(),
          );
          broadcast('change', {
            ...withFiles(entry),
            file: path.relative(EXAMPLES_ROOT, full),
            kind: described.kind,
            removed: !fs.existsSync(full),
          });
        }, 80),
      );
    });
  } catch (error) {
    console.error(
      `[test-runner] could not watch ${PAGES_DIR}: ${error.message}`,
    );
  }
}

// ------------------------------------------------------------------ events

const clients = new Set();

function broadcast(type, data) {
  const message = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const res of clients) {
    try {
      res.write(message);
    } catch {}
  }
}

/** GET /events: Server-Sent Events (`results`, `change`) */
function handleEvents(req, res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
  res.write(': connected\n\n');
  clients.add(res);
  const keepAlive = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {}
  }, 25000);
  const close = () => {
    clearInterval(keepAlive);
    clients.delete(res);
  };
  req.on('close', close);
  res.on('close', close);
}

seedRecent();
watchPages();

module.exports = {
  PROJECTS,
  recordRun,
  resultsOf,
  lastResultOf,
  recentChanges,
  handleEvents,
};

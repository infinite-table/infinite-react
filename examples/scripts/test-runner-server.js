#!/usr/bin/env node
// Tiny sidecar HTTP server that runs Playwright tests on demand for the test
// pages index UI (see src/test-index/RunTestButton.tsx). Started alongside
// `next dev` — not used in production / static export builds.
//
// Endpoints:
//   GET  /health                       -> { ok: true }
//   GET  /check?pathname=/foo/bar      -> { exists, mode: 'page'|'folder'|null,
//                                            spec: string|null, specCount?: number }
//   POST /run  { pathname, watch }     -> NDJSON event stream
//   POST /trigger { pathname }         -> re-run in place over the open stream
//   POST /open { file, line, col }     -> open file in editor (cursor/code)
//
// `pathname` may be a leaf page (`/foo/bar` -> runs `src/pages/foo/bar.spec.ts`)
// or a test folder index (`/foo` -> runs every spec under `src/pages/foo/`
// recursively).
//
// Run: `node scripts/test-runner-server.js` (default port 5599, override via
// `TEST_RUNNER_PORT`).

const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = Number(process.env.TEST_RUNNER_PORT || 5599);
const EXAMPLES_ROOT = path.resolve(__dirname, '..');
const PAGES_DIR = path.join(EXAMPLES_ROOT, 'src', 'pages');

// Tracks the currently-active /run session for each pathname so the /trigger
// endpoint can request an in-place re-run without tearing down the stream.
const activeSessions = new Map();
// Files we'll open in the editor must live somewhere under the monorepo root.
const WORKSPACE_ROOT = path.resolve(EXAMPLES_ROOT, '..');
const EDITOR_CANDIDATES = (
  process.env.EDITOR_CMD ? [process.env.EDITOR_CMD] : []
).concat(['cursor', 'code']);

const inferPaths = (pathname) => {
  const parts = String(pathname || '')
    .split('/')
    .filter(Boolean);
  const base = parts.length === 0 ? PAGES_DIR : path.join(PAGES_DIR, ...parts);
  return {
    // Page-mode (leaf): foo/bar.spec.ts + foo/bar.page.tsx
    specPath: parts.length === 0 ? null : base + '.spec.ts',
    pagePath: parts.length === 0 ? null : base + '.page.tsx',
    // Folder-mode (index): the directory itself, when it exists
    folderPath: base,
  };
};

const isHiddenName = (name) =>
  name.startsWith('.') ||
  name.startsWith('_') ||
  name === 'node_modules' ||
  name.endsWith('-snapshots');

/**
 * Walk a folder recursively and return paths of files matching `match(name)`.
 * Skips hidden / underscored / node_modules / snapshot folders.
 */
const walkFiles = (root, match) => {
  const out = [];
  const stack = [root];
  while (stack.length) {
    const dir = stack.pop();
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch (e) {
      continue;
    }
    for (const entry of entries) {
      if (isHiddenName(entry.name)) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.isFile() && match(entry.name)) {
        out.push(full);
      }
    }
  }
  return out;
};

const isSpecFile = (name) =>
  name.endsWith('.spec.ts') || name.endsWith('.spec.tsx');
const isWatchableFile = (name) =>
  isSpecFile(name) || name.endsWith('.page.tsx') || name.endsWith('.page.ts');

/**
 * Decide which mode the request maps to:
 *   - 'page'   when `<base>.spec.ts` exists
 *   - 'folder' when no leaf spec exists but the directory contains specs
 *   - null     otherwise
 */
const resolveMode = (paths) => {
  if (!paths) return null;
  if (paths.specPath && fs.existsSync(paths.specPath)) {
    return { mode: 'page', target: paths.specPath };
  }
  try {
    const stat = fs.statSync(paths.folderPath);
    if (stat.isDirectory()) {
      // Cheap probe: does the folder contain any spec at all?
      const specs = walkFiles(paths.folderPath, isSpecFile);
      if (specs.length > 0) {
        return { mode: 'folder', target: paths.folderPath, specs };
      }
    }
  } catch (e) {
    // not a directory / doesn't exist
  }
  return null;
};

const setCors = (res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
};

const sendJson = (res, status, data) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
};

const readBody = (req) =>
  new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        reject(new Error('body too large'));
      }
    });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });

const handleCheck = (req, res, url) => {
  const paths = inferPaths(url.searchParams.get('pathname'));
  const resolved = resolveMode(paths);
  if (!resolved) {
    return sendJson(res, 200, { exists: false, spec: null, mode: null });
  }
  if (resolved.mode === 'page') {
    return sendJson(res, 200, {
      exists: true,
      mode: 'page',
      spec: path.relative(EXAMPLES_ROOT, resolved.target),
    });
  }
  return sendJson(res, 200, {
    exists: true,
    mode: 'folder',
    spec: path.relative(EXAMPLES_ROOT, resolved.target),
    specCount: resolved.specs.length,
  });
};

// Try editor candidates in order until one launches successfully. Resolves
// with `{ ok, editor, code, stderr }` so the HTTP response can surface the
// real reason an open failed (rather than reporting a confusing 200).
const openInEditor = (target) =>
  new Promise((resolve) => {
    let i = 0;
    const tryNext = () => {
      if (i >= EDITOR_CANDIDATES.length) {
        const msg = `no editor CLI found (tried: ${EDITOR_CANDIDATES.join(', ')})`;
        console.error(`[test-runner] ${msg}`);
        return resolve({ ok: false, error: msg });
      }
      const editor = EDITOR_CANDIDATES[i++];
      const child = spawn(editor, ['--goto', target], {
        stdio: ['ignore', 'ignore', 'pipe'],
      });
      let stderr = '';
      child.stderr.on('data', (chunk) => {
        stderr += chunk.toString();
      });
      child.on('error', () => tryNext());
      child.on('close', (code) => {
        if (code === 0) {
          return resolve({ ok: true, editor });
        }
        if (i < EDITOR_CANDIDATES.length) {
          return tryNext();
        }
        console.error(
          `[test-runner] ${editor} --goto ${target} exited with code ${code}: ${stderr.trim()}`,
        );
        resolve({ ok: false, editor, code, stderr: stderr.trim() });
      });
    };
    tryNext();
  });

const handleOpen = async (req, res) => {
  let parsed;
  try {
    const body = await readBody(req);
    parsed = body ? JSON.parse(body) : {};
  } catch (e) {
    return sendJson(res, 400, { error: 'Invalid JSON' });
  }

  const { file, line = 1, col = 1 } = parsed;
  if (typeof file !== 'string' || !file) {
    return sendJson(res, 400, { error: 'file required' });
  }

  const abs = path.isAbsolute(file) ? file : path.resolve(EXAMPLES_ROOT, file);
  const rel = path.relative(WORKSPACE_ROOT, abs);
  if (rel.startsWith('..') || path.isAbsolute(rel)) {
    return sendJson(res, 403, { error: 'outside workspace', file: abs });
  }
  if (!fs.existsSync(abs)) {
    return sendJson(res, 404, { error: 'not found', file: abs });
  }

  const target = `${abs}:${Number(line) || 1}:${Number(col) || 1}`;
  console.log(`[test-runner] open ${target}`);
  const result = await openInEditor(target);
  if (!result.ok) {
    return sendJson(res, 502, {
      ok: false,
      error:
        result.error ||
        result.stderr ||
        `editor exited with code ${result.code}`,
      editor: result.editor,
      file: abs,
      line,
      col,
    });
  }
  return sendJson(res, 200, {
    ok: true,
    editor: result.editor,
    file: abs,
    line,
    col,
  });
};

const handleRun = async (req, res) => {
  let parsed;
  try {
    const body = await readBody(req);
    parsed = body ? JSON.parse(body) : {};
  } catch (e) {
    return sendJson(res, 400, { error: 'Invalid JSON' });
  }

  const { pathname, watch = true } = parsed;
  if (typeof pathname !== 'string') {
    return sendJson(res, 400, { error: 'pathname required' });
  }

  const paths = inferPaths(pathname);
  const resolved = resolveMode(paths);
  if (!resolved) {
    return sendJson(res, 404, { error: 'No spec for this page', pathname });
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/x-ndjson');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  const send = (event) => {
    try {
      res.write(JSON.stringify(event) + '\n');
    } catch (e) {
      // socket likely closed
    }
  };

  const relTarget = path.relative(EXAMPLES_ROOT, resolved.target);
  // Files we'll watch + the playwright argument for the run.
  // Page mode: spec + page file. Folder mode: every spec/page under the folder.
  const watchedFiles =
    resolved.mode === 'page'
      ? [paths.specPath, paths.pagePath].filter((f) => f && fs.existsSync(f))
      : walkFiles(resolved.target, isWatchableFile);
  let currentProc = null;
  let stopped = false;
  let pendingRerun = false;
  const watchers = [];

  const startTest = () => {
    if (stopped) return;
    if (currentProc) {
      pendingRerun = true;
      return;
    }
    send({
      type: 'run-start',
      spec: relTarget,
      mode: resolved.mode,
      ts: Date.now(),
    });
    const cmd = process.platform === 'win32' ? 'npx.cmd' : 'npx';
    const args = [
      'playwright',
      'test',
      '--retries=0',
      '--reporter=list',
      relTarget,
    ];
    currentProc = spawn(cmd, args, {
      cwd: EXAMPLES_ROOT,
      env: { ...process.env, FORCE_COLOR: '0' },
    });
    currentProc.stdout.on('data', (chunk) =>
      send({ type: 'stdout', data: chunk.toString() }),
    );
    currentProc.stderr.on('data', (chunk) =>
      send({ type: 'stderr', data: chunk.toString() }),
    );
    currentProc.on('error', (err) =>
      send({ type: 'stderr', data: `[spawn error] ${err.message}\n` }),
    );
    currentProc.on('close', (code, signal) => {
      currentProc = null;
      if (signal === 'SIGTERM' && pendingRerun) {
        // killed because of a file change — don't report as fail
      } else {
        send({
          type: 'run-end',
          code,
          status: code === 0 ? 'pass' : 'fail',
          ts: Date.now(),
        });
      }
      if (pendingRerun && !stopped) {
        pendingRerun = false;
        // small debounce to coalesce rapid file events
        setTimeout(startTest, 100);
      }
    });
  };

  if (watch) {
    for (const file of watchedFiles) {
      try {
        const watcher = fs.watch(file, () => {
          send({
            type: 'change',
            file: path.relative(EXAMPLES_ROOT, file),
            ts: Date.now(),
          });
          if (currentProc) {
            pendingRerun = true;
            try {
              currentProc.kill('SIGTERM');
            } catch (e) {}
          } else {
            startTest();
          }
        });
        watchers.push(watcher);
      } catch (e) {}
    }
    send({
      type: 'watching',
      mode: resolved.mode,
      files: watchedFiles.map((f) => path.relative(EXAMPLES_ROOT, f)),
    });
  }

  // Re-run on demand without disturbing watchers / the open stream. If a run
  // is in flight, kill it and queue a follow-up; otherwise start a new run.
  const triggerRerun = (reason) => {
    if (stopped) return;
    send({ type: 'trigger', reason: reason || 'manual', ts: Date.now() });
    if (currentProc) {
      pendingRerun = true;
      try {
        currentProc.kill('SIGTERM');
      } catch (e) {}
    } else {
      startTest();
    }
  };

  const session = { triggerRerun };
  // Replace any prior session for the same pathname (e.g. a stale connection
  // that wasn't cleaned up yet) — only the most recent one wins.
  activeSessions.set(pathname, session);

  const cleanup = () => {
    if (stopped) return;
    stopped = true;
    if (activeSessions.get(pathname) === session) {
      activeSessions.delete(pathname);
    }
    if (currentProc) {
      try {
        currentProc.kill('SIGTERM');
      } catch (e) {}
    }
    for (const w of watchers) {
      try {
        w.close();
      } catch (e) {}
    }
    try {
      send({ type: 'session-end' });
      res.end();
    } catch (e) {}
  };

  req.on('close', cleanup);
  req.on('aborted', cleanup);
  res.on('close', cleanup);

  startTest();
};

const handleTrigger = async (req, res) => {
  let parsed;
  try {
    const body = await readBody(req);
    parsed = body ? JSON.parse(body) : {};
  } catch (e) {
    return sendJson(res, 400, { error: 'Invalid JSON' });
  }
  const { pathname } = parsed;
  if (typeof pathname !== 'string') {
    return sendJson(res, 400, { error: 'pathname required' });
  }
  const session = activeSessions.get(pathname);
  if (!session) {
    return sendJson(res, 404, { error: 'no active session', pathname });
  }
  session.triggerRerun('manual');
  return sendJson(res, 200, { ok: true });
};

const server = http.createServer(async (req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  try {
    if (req.method === 'GET' && url.pathname === '/health') {
      return sendJson(res, 200, { ok: true });
    }
    if (req.method === 'GET' && url.pathname === '/check') {
      return handleCheck(req, res, url);
    }
    if (req.method === 'POST' && url.pathname === '/open') {
      return await handleOpen(req, res);
    }
    if (req.method === 'POST' && url.pathname === '/run') {
      return await handleRun(req, res);
    }
    if (req.method === 'POST' && url.pathname === '/trigger') {
      return await handleTrigger(req, res);
    }
    return sendJson(res, 404, { error: 'Not found' });
  } catch (e) {
    console.error('[test-runner]', e);
    return sendJson(res, 500, { error: e && e.message ? e.message : String(e) });
  }
});

server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(
      `[test-runner] port ${PORT} is already in use; set TEST_RUNNER_PORT to override`,
    );
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[test-runner] listening on http://127.0.0.1:${PORT}`);
});

#!/usr/bin/env node
/**
 * Re-run the sibling Playwright spec when a test page or spec changes.
 *
 *   node scripts/test-watch.js           # --project=react, watches .page.tsx
 *   node scripts/test-watch.js --vue     # --project=vue, watches .page.vue
 *
 * Watches the tests directory as a folder (not two globs) so Cursor/VS Code
 * atomic saves still fire change events.
 */
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const EXAMPLES_ROOT = path.resolve(__dirname, '..');
const WATCH_DIR = path.join(EXAMPLES_ROOT, 'src', 'pages');
const DEBOUNCE_MS = 200;

const vue = process.argv.includes('--vue');
const project = vue ? 'vue' : 'react';
const pageExt = vue ? '.page.vue' : '.page.tsx';

function toSpec(filePath) {
  if (filePath.endsWith('.spec.ts')) {
    return filePath;
  }
  if (filePath.endsWith(pageExt)) {
    return filePath.slice(0, -pageExt.length) + '.spec.ts';
  }
  return null;
}

function isWatchTarget(filePath) {
  return filePath.endsWith('.spec.ts') || filePath.endsWith(pageExt);
}

let debounceTimer = null;
let pendingSpec = null;
let child = null;

function runSpec(specPath) {
  const rel = path.relative(EXAMPLES_ROOT, specPath);
  if (!fs.existsSync(specPath)) {
    console.log(`\nNo spec for ${rel} — skipped\n`);
    return;
  }

  console.log(`\n${rel} — running (--project=${project})\n`);

  child = spawn(
    'npm',
    ['run', 'play:test', '--', '--retries=0', `--project=${project}`, rel],
    { cwd: EXAMPLES_ROOT, stdio: 'inherit', shell: true },
  );

  child.on('exit', () => {
    child = null;
    if (pendingSpec) {
      const next = pendingSpec;
      pendingSpec = null;
      runSpec(next);
    }
  });
}

function schedule(filePath) {
  const specPath = toSpec(filePath);
  if (!specPath) {
    return;
  }

  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (child) {
      pendingSpec = specPath;
      return;
    }
    runSpec(specPath);
  }, DEBOUNCE_MS);
}

if (!fs.existsSync(WATCH_DIR)) {
  console.error(`Nothing to watch at ${WATCH_DIR}`);
  process.exit(1);
}

try {
  fs.watch(WATCH_DIR, { recursive: true }, (_event, filename) => {
    if (!filename || !isWatchTarget(filename)) {
      return;
    }
    schedule(path.join(WATCH_DIR, filename));
  });
} catch (err) {
  console.error(`Failed to watch ${WATCH_DIR}:`, err.message);
  process.exit(1);
}

console.log(
  `Watching src/pages for .spec.ts and ${pageExt} (project=${project})`,
);

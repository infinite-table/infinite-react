#!/usr/bin/env node
/**
 * Parity of a framework's test pages with the React ones.
 *
 *   node scripts/parity.mjs --project angular           # counts + lists
 *   node scripts/parity.mjs --project angular --strict  # exit 1 on a gap or a stale entry
 *   node scripts/parity.mjs --project vue
 *
 * Lists, for the specs the project runs (playwright.config.ts: no React-only
 * folders, no node-side unit specs):
 * - gaps: specs with a React page and no page of this project
 *   (`.page.angular.ts` / `.page.vue`)
 * - conditions: specs with a `testInfo.project.name` condition (a test that
 *   doesn't run on every project)
 * minus the entries of `parity-allowlist.<project>.json`
 * (`{ entries: [{ spec, test?, reason }] }`: without `test` the whole spec is
 * skipped on the project, with `test` one test of a spec with a condition).
 * An entry is stale when its spec is gone, when a whole-spec entry has a page
 * after all, or when a test entry names a test the spec doesn't have.
 *
 * Without --strict it only reports (most Angular pages aren't ported yet).
 */
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const {
  PAGES_DIR,
  PAGE_EXTENSIONS,
  listSpecs,
  pageFileOf,
  pagelessSpecs,
} = require('./test-specs.cjs');

const EXAMPLES_ROOT = path.resolve(PAGES_DIR, '..', '..');

const argv = process.argv.slice(2);
const option = (name) => {
  const index = argv.indexOf(name);
  return index >= 0 ? argv[index + 1] : undefined;
};
const project = option('--project') ?? 'angular';
const strict = argv.includes('--strict');
const verbose = argv.includes('--verbose') || argv.includes('-v');

if (project === 'react' || !PAGE_EXTENSIONS[project]) {
  console.error(
    `--project must be one of: ${Object.keys(PAGE_EXTENSIONS)
      .filter((name) => name !== 'react')
      .join(', ')}`,
  );
  process.exit(1);
}

const allowlistFile = path.join(
  EXAMPLES_ROOT,
  `parity-allowlist.${project}.json`,
);
const allowlist = fs.existsSync(allowlistFile)
  ? JSON.parse(fs.readFileSync(allowlistFile, 'utf8')).entries ?? []
  : [];

// what the project runs: the same filter as playwright.config.ts
const unit = new Set(pagelessSpecs());
const specs = listSpecs().filter(
  (spec) => !unit.has(spec) && !/^tests\/(lists|hooks)\//.test(spec),
);
const specSet = new Set(specs);

const readSpec = (spec) => fs.readFileSync(path.join(PAGES_DIR, spec), 'utf8');

const wholeSpecEntries = new Map(
  allowlist.filter((entry) => !entry.test).map((entry) => [entry.spec, entry]),
);
const testEntries = allowlist.filter((entry) => entry.test);

const ported = [];
const gaps = [];
const allowedGaps = [];
const conditions = [];
const allowedConditions = [];

for (const spec of specs) {
  const hasReactPage = fs.existsSync(pageFileOf(spec, 'react'));
  const hasPage = fs.existsSync(pageFileOf(spec, project));
  if (hasPage) ported.push(spec);
  else if (hasReactPage) {
    (wholeSpecEntries.has(spec) ? allowedGaps : gaps).push(spec);
  }

  if (/testInfo\.project\.name|project\.name\s*[!=]==/.test(readSpec(spec))) {
    const listed =
      wholeSpecEntries.has(spec) ||
      testEntries.some((entry) => entry.spec === spec);
    (listed ? allowedConditions : conditions).push(spec);
  }
}

const stale = [];
for (const entry of allowlist) {
  if (!specSet.has(entry.spec)) {
    stale.push({ ...entry, why: 'no such spec (or not run on this project)' });
  } else if (!entry.test && fs.existsSync(pageFileOf(entry.spec, project))) {
    stale.push({ ...entry, why: `it has a ${PAGE_EXTENSIONS[project]} page` });
  } else if (entry.test && !readSpec(entry.spec).includes(entry.test)) {
    stale.push({ ...entry, why: 'the spec has no test with this title' });
  }
}

const list = (title, items, always = true) => {
  if (!items.length || (!always && !verbose)) return;
  console.log(`\n${title}:`);
  for (const item of items) console.log(`  ${item}`);
};

console.log(
  `${project} parity (${
    path.relative(process.cwd(), allowlistFile) || allowlistFile
  })`,
);
const rows = [
  [`specs with a page on ${project}`, `${ported.length} / ${specs.length}`],
  [`gaps (React page, no ${project} page)`, gaps.length],
  ['allowlisted (skipped on purpose)', allowedGaps.length],
  ['project-name conditions, unlisted', conditions.length],
  ['project-name conditions, allowlisted', allowedConditions.length],
  ['stale allowlist entries', stale.length],
];
const width = Math.max(...rows.map(([label]) => label.length)) + 2;
for (const [label, value] of rows) {
  console.log(`  ${(label + ':').padEnd(width)}${value}`);
}

list('Gaps (run with --verbose to list them)', gaps, false);
list('Specs with an unlisted project-name condition', conditions);
list(
  'Stale allowlist entries',
  stale.map(
    (entry) =>
      `${entry.spec}${entry.test ? ` > "${entry.test}"` : ''}: ${entry.why}`,
  ),
);

if (strict && (gaps.length || conditions.length || stale.length)) {
  process.exit(1);
}

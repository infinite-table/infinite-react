#!/usr/bin/env node
/**
 * Checks the Angular examples app build (out-angular, `ng build
 * --stats-json`) for the two mistakes that build fine and only fail in the
 * browser:
 * - two copies of Angular: the library resolving `@angular/core` from
 *   another node_modules than the app (e.g. source/node_modules) - NG0203
 *   ("inject() must be called from an injection context") at runtime. The
 *   library dev build lives in examples/.angular-lib for that reason
 * - partial declarations the Angular linker didn't process (`ɵɵngDeclare*`
 *   calls left in the output) - "JIT compiler unavailable" at runtime
 *
 * Runs as the last step of `npm run build:angular`. Removes the stats file
 * afterwards (it would be served with the app).
 */
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.resolve(__dirname, '..', 'out-angular');
const STATS_FILE = path.join(OUT_DIR, 'browser-stats.json');

const problems = [];

if (!fs.existsSync(STATS_FILE)) {
  console.error(
    `[check-angular-build] no ${path.relative(
      process.cwd(),
      STATS_FILE,
    )}: run ng build --stats-json`,
  );
  process.exit(1);
}

const stats = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'));
fs.rmSync(STATS_FILE);

// the inputs are relative to examples/ (the workspace root)
const coreCopies = Object.keys(stats.inputs).filter((input) =>
  /(^|\/)@angular\/core\/fesm2022\/core\.mjs$/.test(input),
);
if (
  coreCopies.length !== 1 ||
  coreCopies[0] !== 'node_modules/@angular/core/fesm2022/core.mjs'
) {
  problems.push(
    `expected one copy of @angular/core, from examples/node_modules - found: ${
      coreCopies.join(', ') || 'none'
    }`,
  );
}

const unlinked = fs
  .readdirSync(OUT_DIR)
  .filter((file) => file.endsWith('.js'))
  .filter((file) =>
    /ɵɵngDeclare|\\u0275\\u0275ngDeclare/.test(
      fs.readFileSync(path.join(OUT_DIR, file), 'utf8'),
    ),
  );
if (unlinked.length) {
  problems.push(
    `partial declarations the Angular linker skipped (ɵɵngDeclare*) in: ${unlinked.join(
      ', ',
    )}`,
  );
}

if (problems.length) {
  console.error(
    '[check-angular-build] the Angular examples app build is broken:',
  );
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log(
  '[check-angular-build] one copy of @angular/core, all partial declarations linked',
);

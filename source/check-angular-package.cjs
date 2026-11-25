/**
 * Guards the build output of @infinite-table/infinite-angular
 * ($INFINITE_OUT_FOLDER, dist-angular by default).
 *
 * Each of these has passed an app's `ng build` and only failed at runtime:
 * - the FESM must contain the literal `ɵɵngDeclare*` calls: when esbuild
 *   escapes them (`ɵ`), the app's Angular linker skips the file and the
 *   app throws "JIT compiler unavailable"
 * - the only bare imports are Angular and rxjs (peer dependencies): anything
 *   else is a dependency the package doesn't declare
 * - the type bundle must have the static Ivy members (`ɵcmp`, `ɵdir`) that
 *   the app's compiler reads to type-check templates, and no React or Vue
 * - a small Angular consumer (angular-types-check/) compiles in full AOT mode
 *   with strict templates against the built package
 *
 * Runs as the last step of `npm run build:angular`.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const outFolder = path.resolve(
  __dirname,
  process.env.INFINITE_OUT_FOLDER || 'dist-angular',
);
const fesmFile = path.join(outFolder, 'fesm2022', 'infinite-angular.mjs');
const dtsFile = path.join(outFolder, 'index.d.ts');

const problems = [];

const fesm = fs.readFileSync(fesmFile, 'utf8');

if (fesm.includes('\\u0275')) {
  problems.push(
    'the FESM has escaped `\\u0275` identifiers: the Angular linker will skip it (esbuild needs charset: utf8)',
  );
}
if (!/ɵɵngDeclare(Component|Directive)\(/.test(fesm)) {
  problems.push(
    'the FESM has no ɵɵngDeclareComponent / ɵɵngDeclareDirective call: it was not compiled by ngc in partial mode',
  );
}
if (/ɵɵdefine(Component|Directive)\(/.test(fesm)) {
  problems.push(
    'the FESM has full-compilation ɵɵdefineComponent calls: libraries must be published in partial compilation mode',
  );
}

const ALLOWED_IMPORT = /^(@angular\/|rxjs($|\/))/;
const importSpecifiers = new Set();
const importPattern =
  /(?:^|[;\n])\s*(?:import|export)\s*(?:[^'";]*?\sfrom\s*)?["']([^"']+)["']/g;
const dynamicImportPattern = /\bimport\(\s*["']([^"']+)["']\s*\)/g;
for (const pattern of [importPattern, dynamicImportPattern]) {
  let match;
  while ((match = pattern.exec(fesm))) {
    importSpecifiers.add(match[1]);
  }
}
const badImports = [...importSpecifiers].filter(
  (specifier) => !ALLOWED_IMPORT.test(specifier),
);
if (badImports.length) {
  problems.push(
    `the FESM imports packages that are not peer dependencies: ${badImports.join(', ')}`,
  );
}

const dts = fs.readFileSync(dtsFile, 'utf8');
const dtsCode = dts
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');
if (!/static ɵ(cmp|dir):/.test(dtsCode)) {
  problems.push(
    'index.d.ts has no static ɵcmp / ɵdir members: it was not bundled from the ngc declarations',
  );
}
const frameworkLines = dtsCode
  .split('\n')
  .filter(
    (line) =>
      /from\s+['"](react(-dom)?|vue)(\/[^'"]*)?['"]/.test(line) ||
      /\bReact(\$\d+)?\.[A-Za-z]/.test(line),
  );
if (frameworkLines.length) {
  problems.push(
    `index.d.ts references React or Vue:\n${frameworkLines
      .slice(0, 10)
      .map((line) => '    ' + line.trim())
      .join('\n')}`,
  );
}

if (problems.length) {
  console.error(
    `${path.relative(__dirname, outFolder)} is not a valid Angular package:\n` +
      problems.map((problem) => `  - ${problem}`).join('\n'),
  );
  process.exit(1);
}

console.log(
  `${path.relative(__dirname, outFolder)}: partial-compiled FESM, peer imports only (${[
    ...importSpecifiers,
  ].join(', ')}), Ivy type declarations.`,
);

// a consumer app compiled with strict templates against the built package
const consumerDir = path.join(__dirname, 'angular-types-check');
const consumerTsconfig = path.join(consumerDir, 'tsconfig.generated.json');
fs.writeFileSync(
  consumerTsconfig,
  JSON.stringify(
    {
      extends: './tsconfig.json',
      compilerOptions: {
        paths: {
          '@infinite-table/infinite-angular': [dtsFile],
        },
      },
    },
    null,
    2,
  ),
);
try {
  execFileSync(
    path.join(__dirname, 'node_modules', '.bin', 'ngc'),
    ['-p', consumerTsconfig],
    { stdio: 'inherit' },
  );
} catch (err) {
  console.error(
    'The Angular consumer (angular-types-check/consumer.ts) does not compile against the built package',
  );
  process.exit(1);
} finally {
  fs.rmSync(consumerTsconfig, { force: true });
}
console.log(
  'The Angular consumer compiles with strict templates (angular-types-check/consumer.ts).',
);

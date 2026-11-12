/**
 * Guards the public types of @infinite-table/infinite-vue.
 *
 * The Vue package only has `vue` as a peer dependency, so its type bundle
 * (dist-vue/index.d.ts) must not reference React in any way. Shared type
 * declarations get their UI-framework types from
 * src/components/types/FrameworkTypes(.vue).ts - importing them from 'react'
 * (or using the global `React` namespace) makes this check fail.
 *
 * Runs as the last step of `npm run build:vue`.
 */
const fs = require('fs');
const path = require('path');

const file = path.resolve(__dirname, 'dist-vue', 'index.d.ts');
const source = fs.readFileSync(file, 'utf8');

// comments may mention React - only code counts
const code = source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

const offenders = code
  .split('\n')
  .filter(
    (line) =>
      /from\s+['"]react(-dom)?(\/[^'"]*)?['"]/.test(line) ||
      /\bReact(\$\d+)?\.[A-Za-z]/.test(line),
  );

if (offenders.length) {
  console.error(
    `dist-vue/index.d.ts references React in ${offenders.length} place(s):\n`,
  );
  offenders.slice(0, 20).forEach((line) => console.error('  ' + line.trim()));
  console.error(
    '\nUse the types from src/components/types/FrameworkTypes instead.',
  );
  process.exit(1);
}

console.log('dist-vue/index.d.ts has no React types.');

// the public types must accept Vue values - type-check a small consumer
// against the built type bundle
const ts = require('typescript');

const consumer = path.resolve(__dirname, 'vue-types-check', 'consumer.ts');
const program = ts.createProgram([consumer], {
  noEmit: true,
  strict: true,
  skipLibCheck: true,
  target: ts.ScriptTarget.ES2020,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  lib: ['lib.es2020.d.ts', 'lib.dom.d.ts'],
  // no ambient @types packages: @types/react must not be picked up
  types: [],
  baseUrl: __dirname,
  paths: {
    '@infinite-table/infinite-vue': ['./dist-vue/index.d.ts'],
  },
});

const diagnostics = ts.getPreEmitDiagnostics(program);

if (diagnostics.length) {
  console.error(
    ts.formatDiagnosticsWithColorAndContext(diagnostics, {
      getCanonicalFileName: (fileName) => fileName,
      getCurrentDirectory: () => __dirname,
      getNewLine: () => '\n',
    }),
  );
  console.error(
    'The types of @infinite-table/infinite-vue do not accept Vue values - see vue-types-check/consumer.ts',
  );
  process.exit(1);
}

console.log('The Vue types accept Vue values (vue-types-check/consumer.ts).');

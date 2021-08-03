const fs = require('fs');
const tsc = require('tsc-prog');

tsc.build({
  basePath: __dirname,
  configFilePath: 'tsconfig.build.json',
  compilerOptions: {
    rootDir: 'src',
    outDir: 'dist',
    declaration: true, // must be set
  },
  bundleDeclaration: {
    entryPoint: 'index.d.ts', // relative to the OUTPUT directory ('dist' here)
  },
});

let contents = fs.readFileSync('./dist/index.d.ts', 'utf8');

contents = contents.replace(/`/g, '');

fs.writeFileSync('./dist/index.d.ts', contents, 'utf8');

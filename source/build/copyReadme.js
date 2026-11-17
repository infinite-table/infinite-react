/**
 * Copies the repo's README into the package being built
 * ($INFINITE_OUT_FOLDER), with the hero image's alt text naming the
 * package's framework. The README is written for the React package.
 */
const fs = require('fs');
const path = require('path');

const HERO_ALT = {
  react: 'The React DataGrid built for speed',
  vue: 'The Vue DataGrid built for speed',
};

const outFolder = process.env.INFINITE_OUT_FOLDER;
if (!outFolder) {
  throw new Error('copyReadme: INFINITE_OUT_FOLDER is not set');
}

const framework = path.basename(outFolder) === 'dist-vue' ? 'vue' : 'react';
const readme = fs.readFileSync(
  path.resolve(__dirname, '../../README.md'),
  'utf8',
);

const from = `alt="${HERO_ALT.react}"`;
if (!readme.includes(from)) {
  throw new Error(`copyReadme: the README has no hero image with ${from}`);
}

fs.writeFileSync(
  path.resolve(__dirname, '..', outFolder, 'README.md'),
  readme.replace(from, `alt="${HERO_ALT[framework]}"`),
);

const fs = require('fs');
const resolve = require('path').resolve;

const sourcePackagePath = resolve(__dirname, '../package.json');

const packageJSON = require(sourcePackagePath);

const toDelete = [
  'devDependencies',
  'husky',
  'prettier',
  'files',
  'lint-staged',
  'scripts',
  'private',
];
toDelete.forEach((key) => delete packageJSON[key]);

['main', 'module', 'typings'].forEach((key) => {
  let value = packageJSON[key];

  value = value.split('/');
  if (value[0] === 'dist') {
    value = value.splice(1).join('/');
  }

  packageJSON[key] = value.join('/');
});

packageJSON.publishedAt = Date.now();
const content = JSON.stringify(packageJSON, null, 2);

const path = resolve(__dirname, '../dist', 'package.json');
fs.writeFile(path, content, 'utf8', (err) => {
  if (err) {
    console.error(err);
    throw err;
  } else {
    console.log(
      'DONE building package.json with version ',
      packageJSON.version,
    );
  }
});

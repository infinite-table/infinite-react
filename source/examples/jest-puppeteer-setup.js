const { toMatchImageSnapshot } = require('jest-image-snapshot');
expect.extend({ toMatchImageSnapshot });

process.env.BASEURL = 'http://localhost:3000/tests';

globalThis.__DEV__ = true;
globalThis.__VERSION__ = require('../package.json').version;
globalThis.__VERSION_TIMESTAMP__ = require('../package.json').publishedAt;
const timeout = process.env.TIMEOUT ? process.env.TIMEOUT * 1 : 5000;
jest.setTimeout(timeout);

global.wait = (time) =>
  new Promise((resolve) => {
    setTimeout(resolve, time);
  });

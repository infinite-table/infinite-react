// global-teardown.js
const { teardown: teardownPuppeteer } = require('jest-environment-puppeteer');

module.exports = async function globalTeardown(globalConfig) {
  await teardownPuppeteer(globalConfig);

  // Your global teardown
  // console.log('DONE');
};

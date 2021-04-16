const width = 1400;
const height = 1200;

const debug = process.env.DEBUG_ENV === 'true';

module.exports = {
  browser: 'chromium',
  browserContext: 'default',
  launch: {
    defaultViewport: {
      width,
      height,
    },
    dumpio: debug,

    devtools: debug,
    headless: !debug,
    // args: ['--no-sandbox', '--disable-dev-shm-usage'],
  },
};

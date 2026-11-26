// The base URL of a test app for Playwright (playwright.config.ts).
//
// The dev servers serve the apps under /react, /vue and /angular (for the
// front of the dev servers, scripts/examples-dev-server.js), the builds the
// tests run on in CI at the root. Which one is running on the port is found
// out by asking for its root: a build serves its index there (200), a dev
// server doesn't (next dev answers 404, vite and ng serve redirect to their
// base path).
//
// Asked once: the answer is passed to the Playwright workers in the
// environment. Not asked on CI, where the apps are always the builds.
const { execFileSync } = require('child_process');

const PROBE = `
fetch(process.argv[1], { redirect: 'manual', signal: AbortSignal.timeout(30000) })
  .then((response) => process.stdout.write(String(response.status)))
  .catch(() => process.stdout.write('down'));
`;

/** `http://localhost:5555/react/` when a dev server runs on `port`, else `http://localhost:5555/` */
function testAppBaseURL(project, port) {
  const root = `http://localhost:${port}/`;
  if (process.env.CI) return root;

  const envName = `INFINITE_TEST_BASE_URL_${project.toUpperCase()}_${port}`;
  if (process.env[envName] === undefined) {
    let status = 'down';
    try {
      status = execFileSync(process.execPath, ['-e', PROBE, root], {
        encoding: 'utf8',
        timeout: 35000,
      });
    } catch {}
    // a server that isn't running: the root, as before (the tests fail on it)
    process.env[envName] =
      status === '200' || status === 'down' ? root : `${root}${project}/`;
  }
  return process.env[envName];
}

module.exports = { testAppBaseURL };

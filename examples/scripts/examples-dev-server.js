#!/usr/bin/env node
// The front of the examples dev servers: the React, Vue and Angular test apps
// on one port (5550, or another one when that is taken by another checkout,
// see scripts/dev-ports.cjs):
//
//   /react/...    -> next dev  (basePath /react, next.config.js)
//   /vue/...      -> vite      (base /vue/, vite.config.ts)
//   /angular/...  -> ng serve  (servePath /angular/, angular.json)
//   /             -> the home page: the three apps, the recently changed
//                    test pages and specs (examples-dev-home.js)
//
// The dev servers serve under those base paths themselves, so the requests
// (and the websockets of their hot reload) go through unchanged. Only in dev:
// the builds the tests run on in CI are served at the root, on their own
// ports.
//
// Run: `npm run dev:front` (part of `npm run dev`).

const http = require('http');
const httpProxy = require('http-proxy');

const { getPort } = require('../../scripts/dev-ports.cjs');
const { errorPage, escape, homePage } = require('./examples-dev-home');

const PORT = getPort('examplesDev');

const APPS = {
  react: { label: 'React', service: 'examples', command: 'npm run dev:next' },
  vue: { label: 'Vue', service: 'examplesVue', command: 'npm run dev:vue' },
  angular: {
    label: 'Angular',
    service: 'examplesAngular',
    command: 'npm run dev:angular',
  },
};

const proxy = httpProxy.createProxyServer({ ws: true, xfwd: true });

/** the app of a request: the first segment of its path */
function appOf(url = '/') {
  const name = url.split(/[/?#]/)[1];
  return Object.prototype.hasOwnProperty.call(APPS, name) ? name : null;
}

function send(res, status, html) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

function target(name) {
  return `http://localhost:${getPort(APPS[name].service)}`;
}

proxy.on('error', (error, req, res) => {
  const name = appOf(req.url);
  // a websocket (`res` is the socket): nothing to answer with
  if (!res || typeof res.writeHead !== 'function') {
    res?.destroy?.();
    return;
  }
  if (res.headersSent) {
    res.end();
    return;
  }
  const app = name ? APPS[name] : null;
  send(
    res,
    502,
    errorPage(
      `The ${app ? app.label : ''} dev server is not running`,
      `<code>${escape(target(name))}</code> did not answer (${escape(
        error.code || error.message,
      )}).`,
      app
        ? `Start it with <code>${escape(
            app.command,
          )}</code> in examples/, or all of them with <code>npm run dev</code>.`
        : '',
    ),
  );
});

const server = http.createServer((req, res) => {
  const name = appOf(req.url);
  if (name) {
    proxy.web(req, res, { target: target(name) });
    return;
  }
  if (req.url === '/' || req.url.startsWith('/?')) {
    homePage({
      apps: Object.fromEntries(
        Object.entries(APPS).map(([app, { label, service }]) => [
          app,
          { label, port: getPort(service) },
        ]),
      ),
      testRunnerPort: getPort('testRunner'),
    }).then(
      (html) => send(res, 200, html),
      (error) => send(res, 500, errorPage('Error', escape(error.message))),
    );
    return;
  }
  // `/tests/a/b` (a URL of the apps before the base paths): the React one
  if (req.method === 'GET' && req.url.startsWith('/tests')) {
    res.writeHead(302, { Location: `/react${req.url}` });
    res.end();
    return;
  }
  send(
    res,
    404,
    errorPage(
      'Not found',
      `<code>${escape(req.url)}</code> is not under /react, /vue or /angular.`,
    ),
  );
});

// the hot reload websockets of the three dev servers
server.on('upgrade', (req, socket, head) => {
  const name = appOf(req.url);
  if (!name) {
    socket.destroy();
    return;
  }
  proxy.ws(req, socket, head, { target: target(name) });
});

server.listen(PORT, () => {
  console.log(`[examples] http://localhost:${PORT}/  (/react, /vue, /angular)`);
});

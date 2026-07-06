'use strict';

const express = require('express');
const compression = require('compression');

// The exact same express app that powers
// https://infinite-table.com/.netlify/functions/json-server
// (all routes are mounted under this prefix inside that app)
const appPath =
  process.env.JSON_SERVER_APP_PATH || './www/functions/json-server/json-server';
const jsonServerApp = require(appPath);

const PREFIX = '/.netlify/functions/json-server';

const app = express();

app.use(compression());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

// Root-level aliases: /developers1k works the same as
// /.netlify/functions/json-server/developers1k
app.use((req, _res, next) => {
  if (!req.url.startsWith(PREFIX)) {
    req.url = PREFIX + (req.url === '/' ? '' : req.url);
  }
  next();
});

app.use(jsonServerApp);

const port = process.env.PORT || 3002;

app.listen(port, () => {
  console.log(`Infinite Table data server listening on port ${port}`);
});

'use strict';

const app = require('./functions/json-server/json-server');

// 3002, or another port when that one is taken by another checkout: picked by
// scripts/with-ports.mjs (`npm run serve:data`)
const port = require('../scripts/dev-ports.cjs').getPort('data');

app.listen(port, () => console.log(`Local app listening on port ${port}!`));

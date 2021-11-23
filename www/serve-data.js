'use strict';

const app = require('./functions/json-server/json-server');

app.listen(3002, () =>
  console.log('Local app listening on port 3002!')
);

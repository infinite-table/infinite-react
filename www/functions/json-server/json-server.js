const cors = require('cors');

const express = require('express');
const serverless = require('serverless-http');

const bodyParser = require('body-parser');
const jsonServer = require('json-server');

const {
  employees,
} = require('../../dataserver/data/employees.json');
const {
  employees: employees50k,
} = require('../../dataserver/data/employees50k.json');
const router = jsonServer.router({
  employees,
  employees10: employees.slice(0, 10),
  employees100: employees.slice(0, 100),
  employees1k: employees.slice(0, 1000),
  employees10k: employees,
  employees20k: employees50k.slice(0, 20000),
  employees30k: employees50k.slice(0, 30000),
  employees40k: employees50k.slice(0, 40000),
  employees50k: employees50k.slice(0, 50000),
});

const app = express();

// if (!process.env.NETLIFY_BUILD) {
app.use(cors());
// }
app.use(bodyParser.json());
app.use('/.netlify/functions/json-server', router); // path must route to lambda

module.exports = app;
module.exports.handler = serverless(app);

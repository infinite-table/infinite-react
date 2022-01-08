const cors = require('cors');

const alasql = require('alasql');
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
const {
  developers,
} = require('../../dataserver/data/developers.json');
const {
  developers: developers50k,
} = require('../../dataserver/data/developers50k.json');

const developers10 = developers.slice(0, 10);
const developers100 = developers.slice(0, 100);
const developers1k = developers.slice(0, 1000);
const developers10k = developers;
const developers20k = developers50k.slice(0, 20000);
const developers30k = developers50k.slice(0, 30000);
const developers40k = developers50k.slice(0, 40000);

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
  developers,
  developers10,
  developers100,
  developers1k,
  developers10k,
  developers20k,
  developers30k,
  developers40k,
  developers50k,
});

const app = express();

// if (!process.env.NETLIFY_BUILD) {
app.use(cors());
// }
app.use(jsonServer.bodyParser);

alasql.tables.developers = { data: developers };
alasql.tables.developers10 = { data: developers10 };
alasql.tables.developers100 = { data: developers100 };
alasql.tables.developers1k = { data: developers1k };
alasql.tables.developers10k = { data: developers10k };
alasql.tables.developers20k = { data: developers20k };
alasql.tables.developers30k = { data: developers30k };
alasql.tables.developers40k = { data: developers40k };
alasql.tables.developers50k = { data: developers50k };

const sqlRoutes = [
  '10',
  '100',
  '1k',
  '10k',
  '20k',
  '30k',
  '40k',
  '50k',
];

sqlRoutes.forEach((name) => {
  app.use(
    `/.netlify/functions/json-server/developers${name}-sql`,
    getSQLRoute(name)
  );
});

function getSQLRoute(routeSuffix) {
  const tableName = `developers${routeSuffix}`;
  return (req, res) => {
    const { query } = req;

    let groupBy = null;
    let pivotBy = null;
    let sortInfo = null;
    try {
      groupBy = JSON.parse(query.groupBy);
    } catch (ex) {
      groupBy = null;
    }
    try {
      pivotBy = JSON.parse(query.pivotBy);
    } catch (ex) {
      pivotBy = null;
    }
    try {
      sortInfo = JSON.parse(query.sortInfo);
    } catch (ex) {
      sortInfo = null;
    }

    let SQL = buildSQL({
      groupBy,
      pivotBy,
      sortInfo,
      tableName,
    });

    res.json(alasql(SQL));
  };
}

app.use('/.netlify/functions/json-server', router); // path must route to lambda

function buildSQL({
  groupBy,
  sortInfo,
  pivotBy,
  tableName,
}) {
  let SQL = `SELECT * FROM ${tableName}`;

  if (groupBy) {
    SQL += ` GROUP BY ${groupBy.map((g) => `${g.field}`)}`;
  }

  if (sortInfo) {
    SQL += ` ORDER BY ${sortInfo.map(
      (s) => `${s.field} ${s.dir === 1 ? 'ASC' : 'DESC'}`
    )}`;
  }

  if (pivotBy) {
    SQL += ` PIVOT ${pivotBy.map((p) => `${p.field}`)}`;
  }

  return SQL;
}
module.exports = app;
module.exports.handler = serverless(app);

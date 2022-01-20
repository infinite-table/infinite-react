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
    let groupKeys = null;
    let pivotBy = null;
    let filterBy = null;
    let sortInfo = null;
    let reducers = null;
    let start = null;
    let limit = null;
    try {
      groupBy = JSON.parse(query.groupBy);
    } catch (ex) {
      groupBy = null;
    }
    try {
      groupKeys = JSON.parse(query.groupKeys);
    } catch (ex) {
      groupKeys = null;
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
    try {
      reducers = JSON.parse(query.reducers);
    } catch (ex) {
      reducers = null;
    }
    try {
      filterBy = JSON.parse(query.filterBy);
    } catch (ex) {
      filterBy = null;
    }

    if (query.start) {
      try {
        start = parseInt(query.start, 10);
      } catch (ex) {
        start = 0;
      }
    }
    if (query.limit) {
      try {
        limit = parseInt(query.limit, 10);
      } catch (ex) {
        limit = null;
      }
    }

    let SQL = buildSQL({
      groupBy,
      groupKeys,
      pivotBy,
      filterBy,
      reducers,
      sortInfo,
      tableName,
    });

    let result = alasql(SQL);
    let totalCount = result.length;

    result =
      limit != null
        ? result.slice(start, start + limit)
        : result.slice(start);

    res.json({
      totalCount,
      length: result.length,
      data: result,
    });
  };
}

app.use('/.netlify/functions/json-server', router); // path must route to lambda

function generatePivotSQL(pivotWithValues, reducers = []) {
  const map = new Map();

  const nesting = pivotWithValues.length;

  pivotWithValues.forEach(({ field, values }) => {
    if (!map.size) {
      values.forEach((value) => {
        (reducers || []).forEach((reducer) => {
          const key = `${reducer.field}_${value}`;
          map.set(key, {
            level: 1,
            pairs: [{ field, value }],
          });
        });
      });
    } else {
      [...map.entries()].forEach(([key, entry]) => {
        values.forEach((value) => {
          let { level } = entry;

          level++;
          const newKey = `${key}_${value}`;

          map.set(newKey, {
            level,
            pairs: entry.pairs.concat({ field, value }),
          });
        });
      });
    }
  });

  // console.log(...map.keys());

  const colsToSelect = [];

  map.forEach((entry, key) => {
    const len = entry.level;
    if (len === nesting) {
      const { pairs } = entry;

      const condition = pairs
        .map(({ field, value }) => `${field} = '${value}'`)
        .join(' AND ');

      reducers.forEach((reducer) => {
        const as =
          reducer.field +
          '_' +
          pairs
            .map(({ value }) => value.replace(/ /g, '_'))
            .join('_');
        colsToSelect.push(
          `SUM(CASE WHEN ${condition} THEN ${reducer.field} ELSE 0 END) as ${as}`
        );
      });
    }
  });

  // console.log(colsToSelect.join('\n'));

  return colsToSelect;
}

function buildSQL({
  groupBy,
  groupKeys,
  sortInfo,
  pivotBy,
  filterBy,
  reducers,
  tableName,
}) {
  var colsToSelect = [];

  if (groupBy) {
    colsToSelect = groupBy.map(
      (col) => `${col.field} as ${col.field}`
    );
    const groupKeysLength = groupKeys
      ? groupKeys.length
      : 0;

    // limit the fields selected by grouping
    colsToSelect.length = Math.min(
      groupKeysLength + 1,
      colsToSelect.length
    );

    if (pivotBy) {
      // colsToSelect = colsToSelect.concat(
      //   pivotBy.map((col) => `${col.field} as ${col.field}`)
      // );

      const pivotByWithValues = pivotBy.map((pivot) => {
        const sql = `select unique(${pivot.field}) as ${pivot.field} from ${tableName}`;
        return {
          field: pivot.field,
          values: alasql(sql).map(
            (row) => row[pivot.field]
          ),
        };
      });

      colsToSelect.push(
        ...generatePivotSQL(pivotByWithValues, reducers)
      );
    }
  }

  if (Array.isArray(reducers)) {
    reducers.forEach(({ field, name }) => {
      colsToSelect.push(`${name}(${field}) as ${field}`);
    });
  }

  let where = '';

  if (Array.isArray(filterBy) && filterBy.length) {
    where = ` WHERE ${filterBy
      .map((f) => `${f.field} = '${f.value}'`)
      .join(' AND ')}`;
  }
  if (Array.isArray(groupKeys) && groupKeys.length) {
    let whereConditionForGroups = [];
    groupBy.forEach(({ field }, index) => {
      const groupKey = groupKeys[index];
      if (groupKey) {
        whereConditionForGroups.push(
          `${field} = '${groupKey}'`
        );
      }
    });

    if (!where) {
      where = ` WHERE ${whereConditionForGroups.join(
        ' AND '
      )}`;
    } else {
      where += ` AND ${whereConditionForGroups.join(
        ' AND '
      )}`;
    }
  }

  let SQL = `SELECT ${colsToSelect}  FROM ${tableName} ${where}`;

  if (groupBy && groupBy.length) {
    SQL += ` GROUP BY ${groupBy.map((g) => `${g.field}`)}`;
  }

  console.log(SQL);
  if (
    (sortInfo && sortInfo.length) ||
    (groupBy && groupBy.length)
  ) {
    SQL += ` ORDER BY ${
      sortInfo
        ? sortInfo.map(
            (s) =>
              `${s.field} ${s.dir === 1 ? 'ASC' : 'DESC'}`
          ) + (groupBy ? ',' : '')
        : ''
    } ${
      groupBy ? groupBy.map((g) => `${g.field} ASC`) : ''
    }`;
  }

  return SQL;
}
module.exports = app;
module.exports.handler = serverless(app);

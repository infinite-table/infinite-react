/**
 * DISCLAIMER:
 *
 * Please DO NOT use this code as a reference
 * or a best-practice guide.
 *
 * This is written to get the job done with the least amount of effort
 * and without any optimization - includes some not-reccomended SQL practices, etc.
 *
 */
const cors = require('cors');
const { DeepMap } = require('@infinite-table/deep-map');

const alasql = require('alasql');
const express = require('express');
const serverless = require('serverless-http');

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

const sqlRoutes = {
  10: 10,
  100: 100,
  '1k': 1_000,
  '10k': 10_000,
  '20k': 20_000,
  '30k': 30_000,
  '40k': 40_000,
  '50k': 50_000,
};

alasql.aggr.CORRECT_AVERAGE = function (
  value,
  accumulator,
  stage
) {
  if (stage == 1) {
    // first call of aggregator - for first line

    var newAccumulator = value != null ? value : 0;

    return newAccumulator;
  } else if (stage == 2) {
    // for every line in the group
    return accumulator + (value || 0);
  } else if (stage == 3) {
    return accumulator || 0;
  }
};
alasql.aggr.CORRECT_AVERAGE = function (
  value,
  accumulator,
  stage
) {
  if (stage == 1) {
    var newAccumulator = value != null ? [value] : [];

    return newAccumulator;
  } else if (stage == 2) {
    if (value != null) {
      accumulator.push(value);
    }
    return accumulator;
  } else if (stage == 3) {
    return accumulator.length
      ? accumulator.reduce((a, b) => a + b) /
          accumulator.length
      : 0;
  }
};

const FNS = {
  avg: 'CORRECT_AVERAGE',
  AVG: 'CORRECT_AVERAGE',
  SUM: 'IMPROVED_SUM',
  sum: 'IMPROVED_SUM',
};

Object.keys(sqlRoutes).forEach((name) => {
  app.use(
    `/.netlify/functions/json-server/developers${name}-sql`,
    getSQLRoute(name, sqlRoutes[name])
  );
});

const MAPPINGS = {
  values: 'values',
  totals: 'totals',
};

const KEY_SEPARATOR = '_';

const CACHE = true;

function getSQLRoute(routeSuffix = '', size) {
  const tableName = `developers${routeSuffix}`;
  return (req, res) => {
    const { query } = req;

    let groupBy = null;
    let groupKeys = null;
    let pivotBy = null;
    let filterBy = null;
    let sortInfo = null;
    let reducers = null;
    let expandedRows = null;

    try {
      groupBy = JSON.parse(query.groupBy);
      if (groupBy && !groupBy.length) {
        groupBy = null;
      }
    } catch (ex) {
      groupBy = null;
    }
    try {
      groupKeys = JSON.parse(query.groupKeys);
    } catch (ex) {
      groupKeys = [];
    }
    try {
      expandedRows = JSON.parse(query.expandedRows);
    } catch (ex) {
      expandedRows = [];
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

    const jsonResult = getResultSet({
      query,
      pivotBy,
      reducers,
      filterBy,
      sortInfo,
      groupBy,
      groupKeys,
      expandedRows,
      tableName,
      size,
    });
    res.json(jsonResult);
  };
}

function getResultSet({
  tableName,
  query,
  pivotBy,
  reducers,
  filterBy,
  sortInfo,
  groupBy,
  groupKeys,
  expandedRows,
  size,
}) {
  let start = null;
  let limit = null;
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

  const reducersByField = (reducers || []).reduce(
    (acc, reducer) => {
      acc[reducer.id || reducer.field] = reducer;
      return acc;
    },
    {}
  );

  const pivotLength = pivotBy ? pivotBy.length : 0;
  const groupByMapByField = (groupBy || []).reduce(
    (acc, group) => {
      acc[group.field] = group;
      return acc;
    },
    {}
  );

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

  let jsonResult;
  if (
    (groupKeys &&
      groupBy &&
      groupKeys.length >= groupBy.length &&
      groupBy.length) ||
    !groupBy
  ) {
    jsonResult = {
      data: result,
      totalCount,
      cache: CACHE,
    };
  } else {
    jsonResult = {
      totalCount,
      mappings: MAPPINGS,
      cache: CACHE,
      data: result.map((x) => {
        const data = {};
        const aggregations = {};
        const pivot = {
          [MAPPINGS.values]: {},
          [MAPPINGS.totals]: {},
        };

        const keyField =
          groupKeys && groupKeys.length
            ? groupBy[groupKeys.length].field
            : groupBy[0]
            ? groupBy[0].field
            : null;
        const keys = keyField
          ? [...groupKeys, x[keyField]]
          : [...groupKeys];
        // console.log(x);

        Object.keys(x).forEach((k) => {
          const theValue =
            typeof x[k] === 'number'
              ? Math.floor(x[k])
              : x[k];

          let exit = false;
          if (reducersByField[k]) {
            aggregations[k] = theValue;
            exit = true;
          }
          if (groupByMapByField[k]) {
            data[k] = theValue;

            exit = true;
          }
          if (exit) {
            return;
          }

          const valueKeys = k.split(KEY_SEPARATOR);
          const reducerKey = valueKeys.pop();
          // console.log(valueKeys);

          const path = [];

          const isLeafNode =
            valueKeys.length === pivotLength;
          if (isLeafNode) {
            let leafContainer = valueKeys.reduce(
              (acc, key, i) => {
                const isLast = i === valueKeys.length - 1;
                // const shouldHaveTotals =
                //   i !== pivotLength - 1;
                acc[key] =
                  acc[key] ||
                  (!isLast
                    ? {
                        [MAPPINGS.values]: {},
                        [MAPPINGS.totals]: {},
                      }
                    : { [MAPPINGS.totals]: {} });

                path.push(key);

                return acc[key][
                  isLast ? MAPPINGS.totals : MAPPINGS.values
                ];
              },
              pivot[MAPPINGS.values]
            );

            leafContainer[reducerKey] = theValue;
          } else {
            let totalsContainer = valueKeys.reduce(
              (acc, key, i) => {
                const shouldHaveTotals =
                  i !== pivotLength - 1;
                acc[key] =
                  acc[key] ||
                  (shouldHaveTotals
                    ? {
                        [MAPPINGS.values]: {},
                        [MAPPINGS.totals]: {},
                      }
                    : { [MAPPINGS.values]: {} });

                return acc[key][MAPPINGS.totals];
              },
              pivot[MAPPINGS.values]
            );

            totalsContainer[reducerKey] = theValue;
          }
        });

        pivot[MAPPINGS.totals] = aggregations;

        return { data, keys, aggregations, pivot };
      }),
    };
  }

  if (expandedRows && expandedRows.length && groupKeys) {
    const expandedKeys = expandedRows.reduce(
      (acc, keys) => {
        acc[JSON.stringify(keys)] = true;
        return acc;
      },
      {}
    );

    jsonResult.data.forEach((data) => {
      if (
        data.keys &&
        expandedKeys[JSON.stringify(data.keys)]
      ) {
        // we should expand this
        data.dataset = getResultSet({
          tableName,
          groupKeys: data.keys,
          expandedRows,
          reducers,
          groupBy,
          query: {
            start: 0,
            limit,
          },
          tableName,
          pivotBy,
          sortInfo,
        });
      }
    });
  }

  // jsonResult.totalCountUnfiltered = size;

  return jsonResult;
}

app.use('/.netlify/functions/json-server', router); // path must route to lambda

function generatePivotSQL(pivotWithValues, reducers = []) {
  const deepMap = new DeepMap();

  pivotWithValues.forEach(({ field, values }, index) => {
    const existingKeys = deepMap.topDownKeys();
    if (existingKeys.length > 0) {
      existingKeys.forEach((key) => {
        if (key.length < index) {
          return;
        }
        values.forEach((value) => {
          const newKey = [...key, value];
          deepMap.set(newKey, { field, value });
        });
      });
    } else {
      values.forEach((value) => {
        const newKey = [value];
        deepMap.set(newKey, { field, value });
      });
    }
  });

  const colsToSelect = [];

  deepMap.visit((value, key) => {
    const condition = key
      .map((k, i) => `${pivotWithValues[i].field} = '${k}'`)
      .join(' AND ');
    reducers.forEach((reducer) => {
      const as =
        key
          .map((k) =>
            `${k}`
              .replace(/ /g, '')
              .replace(/#/g, 'sharp')
              .replace(/-/g, '')
          )
          .join(KEY_SEPARATOR) +
        KEY_SEPARATOR +
        (reducer.id || reducer.field);

      colsToSelect.push(
        `${
          FNS[reducer.name] || reducer.name
        }(CASE WHEN ${condition} THEN ${
          reducer.field
        } ELSE null END) as ${as}`
      );
    });
  });

  console.log(colsToSelect);

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

  let selectAllCols = false;

  if (groupBy) {
    colsToSelect = groupBy.map(
      (col) => `${col.field} as ${col.field}`
    );
    const groupKeysLength = groupKeys
      ? groupKeys.length
      : 0;

    if (
      groupKeysLength >= groupBy.length &&
      groupBy.length
    ) {
      selectAllCols = true;
    } else {
      // limit the fields selected by grouping
      colsToSelect.length = Math.min(
        groupKeysLength + 1,
        colsToSelect.length
      );

      if (pivotBy) {
        const pivotByWithValues = pivotBy.map((pivot) => {
          const sql = `select unique(${pivot.field}) as ${pivot.field} from ${tableName}`;
          return {
            field: pivot.field,
            values: alasql(sql).map(
              (row) => row[pivot.field]
            ),
          };
        });
        // console.log(
        //   'pivotByWithValues',
        //   pivotByWithValues,
        //   'pivotBy',
        //   pivotBy
        // );

        colsToSelect.push(
          ...generatePivotSQL(pivotByWithValues, reducers)
        );
      }
    }
  }

  if (Array.isArray(reducers)) {
    reducers.forEach(({ field, name, id }) => {
      colsToSelect.push(
        `${name}(${field}) as ${id || field}`
      );
    });
  }
  // console.log('colsToSelect', colsToSelect);

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

  // colsToSelect.length = 8;

  // console.log('selectAllCols', selectAllCols);
  if (selectAllCols) {
    colsToSelect = '*';
  }
  let SQL = `SELECT ${colsToSelect}  FROM ${tableName} ${where}`;

  if (groupBy && groupBy.length && !selectAllCols) {
    SQL += ` GROUP BY ${groupBy
      .slice(
        0,
        groupKeys ? groupKeys.length + 1 : groupBy.length
      )
      .map((g) => `${g.field}`)}`;
  }

  if (
    (sortInfo && sortInfo.length) ||
    (groupBy && groupBy.length)
  ) {
    SQL += ` ORDER BY ${
      sortInfo
        ? sortInfo.map(
            (s) =>
              `${s.field} ${s.dir === 1 ? 'ASC' : 'DESC'}`
          ) + (groupBy && groupBy.length ? ',' : '')
        : ''
    } ${
      groupBy ? groupBy.map((g) => `${g.field} ASC`) : ''
    }`;
  }

  // console.log(SQL);
  return SQL;
}
module.exports = app;
module.exports.handler = serverless(app);

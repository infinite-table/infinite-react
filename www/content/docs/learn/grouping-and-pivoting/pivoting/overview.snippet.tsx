// Code shown on the pivoting "Overview" page, one `#region` per snippet.
// Type-checked with the rest of the docs against the current source.
import * as React from 'react';
import {
  DataSource,
  InfiniteTable,
  type DataSourceData,
  type DataSourceDataParams,
  type DataSourcePivotBy,
  type DataSourcePropAggregationReducers,
  type DataSourcePropGroupBy,
  type DataSourcePropPivotBy,
  type DataSourceProps,
  type DataSourceRemoteData,
  type InfiniteTableColumnAggregator,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  country: string;
  city: string;
  stack: string;
  preferredLanguage: string;
  canDesign: 'yes' | 'no';
  age: number;
  salary: number;
};

declare const data: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;

export function Intro() {
  type DATA_TYPE = {
    id: number;
    team: string;
    department: string;
    country: string;
  };
  const data: DATA_TYPE[] = [];
  const columns: InfiniteTablePropColumns<DATA_TYPE> = {};

  //#region intro
  const pivotBy: DataSourcePropPivotBy<DATA_TYPE> = [{ field: 'team' }]
   // field needs to be keyof DATA_TYPE both in `pivotBy` and `groupBy`
  const groupBy: DataSourcePropGroupBy<DATA_TYPE> = [{field: 'department'}, {field: 'country'}];

  <DataSource<DATA_TYPE> primaryKey="id" data={data} pivotBy={pivotBy} groupBy={groupBy}>
  { ({pivotColumns, pivotColumnGroups}) => {
    return <InfiniteTable<DATA_TYPE>
      columns={columns}
      pivotColumns={pivotColumns}
      pivotColumnGroups={pivotColumnGroups}
    />
  } }
  </DataSource>
  //#endregion
  return null;
}

export function groupColumnSortInfo() {
  //#region sorting-the-group-column-and-pivot-columns
  const defaultSortInfo = [{ id: 'group-by', dir: 1 }];
  //#endregion
  return defaultSortInfo;
}

export function SortablePivotColumns() {
  return (
    //#region pivot-column-default-sortable
    <InfiniteTable
      columns={columns}
      pivotColumn={{
        defaultSortable: true,
      }}
    />
    //#endregion
  );
}

export function inheritedPivotColumns() {
  //#region customizing-pivot-columns
  const avgReducer: InfiniteTableColumnAggregator<Developer, any> = {
    initialValue: 0,
    reducer: (acc, sum) => acc + sum,
    done: (sum, arr) => {
      return Math.floor(arr.length ? sum / arr.length : 0);
    },
  };
  const aggregationReducers: DataSourceProps<Developer>['aggregationReducers'] = {
    // will have the same configuration as the `salary` column
    avgSalary: { field: 'salary', ...avgReducer },
    avgAge: {
      field: 'age',
      ...avgReducer,
      pivotColumn: {
        // will have the same configuration as the `preferredLanguage` column
        inheritFromColumn: 'preferredLanguage',
        // but specify a custom default width
        defaultWidth: 500,
      },
    },
  };
  //#endregion
  return aggregationReducers;
}

export function PivotByColumnObject() {
  type DATA_TYPE = Developer;
  //#region pivot-by-column-object
  const pivotBy: DataSourcePivotBy<DATA_TYPE>[] = [
    { field: 'country' },
    { field: 'canDesign', column: { defaultWidth: 400 } },
  ];

  <DataSource primaryKey="id" data={data} pivotBy={pivotBy} />;
  //#endregion
  return null;
}

export function pivotByColumnFunction() {
  type DATA_TYPE = Developer;
  //#region pivot-by-column-function
  const pivotBy: DataSourcePivotBy<DATA_TYPE>[] = [
    { field: 'country' },
    {
      field: 'canDesign',
      column: ({ column }) => {
        return {
          header: column.pivotGroupKey === 'yes' ? 'Designer' : 'Not a Designer',
        };
      },
    },
  ];
  //#endregion
  return pivotBy;
}

export function serverSidePivotingConfig() {
  //#region server-side-pivoting
  const groupBy = [
    { field: 'country' }, // possible values: any valid country
    { field: 'stack' }, // possible values: "backend", "frontend", "full-stack"
  ];
  const pivotBy = [
    { field: 'preferredLanguage' }, // possible values: "TypeScript","JavaScript","Go"
    { field: 'canDesign' }, // possible values: "yes" or "no"
  ];

  const aggregationReducers = {
    salary: { name: 'Salary (avg)', field: 'salary', reducer: 'avg' },
    age: { name: 'Age (avg)', field: 'age', reducer: 'avg' },
  };
  //#endregion
  return { groupBy, pivotBy, aggregationReducers };
}

declare function fetchPivotData(
  params: Pick<
    DataSourceDataParams<Developer>,
    'groupBy' | 'pivotBy' | 'groupKeys' | 'aggregationReducers'
  >,
): Promise<DataSourceRemoteData<Developer>>;

export function ServerSidePivotingDataFunction() {
  //#region server-side-pivoting-data-function

  const dataSource: DataSourceData<Developer> = ({ groupBy, pivotBy, groupKeys, aggregationReducers }) => {
    // make sure you return a Promise that resolves to the correct structure - see details below

    //eg: groupBy: [{ field: 'country' }, { field: 'stack' }],
    //    groupKeys: [], - so we're requesting top-level data

    //eg: groupBy: [{ field: 'country' }, { field: 'stack' }],
    //    groupKeys: ["Canada"], - so we're requesting Canada's data

    //eg: groupBy: [{ field: 'country' }, { field: 'stack' }],
    //    groupKeys: ["Canada"], - so we're requesting Canada's data

    return fetchPivotData({ groupBy, pivotBy, groupKeys, aggregationReducers });
  }

  <DataSource primaryKey="id" lazyLoad data={dataSource} />
  //#endregion
  return null;
}

// placeholders used in the description of the response
declare const SALARY_AGGREGATION_VALUE: number;
declare const AGE_AGGREGATION_VALUE: number;
declare const FOR_EACH_UNIQUE_VALUE: string;

export const serverSidePivotingResponse: DataSourceRemoteData<Developer> =
  //#region server-side-pivoting-response
  {
    data: [
      {
        aggregations: {
          // for each aggregation id, have an entry
          salary: SALARY_AGGREGATION_VALUE,
          age: AGE_AGGREGATION_VALUE,
        },
        data: {
          // data is an object with the common group values
          country: "Canada"
        },
        // the array of keys that uniquely identify this group, including all parent keys
        keys: ["Canada"],
        pivot: {
          totals: {
            // for each aggregation id, have an entry
            salary: SALARY_AGGREGATION_VALUE,
            age: AGE_AGGREGATION_VALUE,
          },
          values: {
            [FOR_EACH_UNIQUE_VALUE]: { // eg: for country
              totals: {
                // for each aggregation, have an entry
                salary: SALARY_AGGREGATION_VALUE,
                age: AGE_AGGREGATION_VALUE,
              },
              values: {
                [FOR_EACH_UNIQUE_VALUE]: { // eg: for stack
                  totals: {
                    salary: SALARY_AGGREGATION_VALUE,
                    age: AGE_AGGREGATION_VALUE,
                  }

                }
              }
            }
          }
        }
      }
    ],
    // the total number of rows in the remote data set
    totalCount: 10,

    // you can map "values" and "totals" above to shorter names

    mappings: {
      values: "values",
      totals: "totals"
    }
  }
  //#endregion
;

// The batching examples below show a request and the response to it.
//
// The request lines are only an illustration of what the `data` function can
// send to the server (the format is up to the app): they are written as
// `name: value` lines, which TypeScript reads as labeled statements.
// The response is the object the `data` function has to resolve to, so it is
// checked against the `DataSourceRemoteData` type.
export function batchingTopLevelGroups() {
  //#region another-pivoting-example-with-batching
  //request:
  groupKeys: [] // empty keys array, so it's a top-level group
  groupBy: [{"field":"country"},{"field":"city"}]
  reducers: [{"field":"salary","id":"avgSalary","name":"avg"},{"field":"age","id":"avgAge","name":"avg"}]
  lazyLoadStartIndex: 0
  lazyLoadBatchSize: 10
  pivotBy: [{"field":"preferredLanguage"},{"field":"canDesign"}]

  //response
  const response: DataSourceRemoteData<Developer> = {
    cache: true,
    totalCount: 20,
    data: [
      {
        data: {country: "Argentina"},
        aggregations: {avgSalary: 20000, avgAge: 30},
        keys: ["Argentina"],
        pivot: {
          totals: {avgSalary: 20000, avgAge: 30},
          values: {
            Csharp: {
              totals: {avgSalary: 19000, avgAge: 29},
              values: {
                no: {totals: {salary: 188897, age: 34}},
                yes: {totals: {salary: 196000, age: 36}}
              }
            },
            Go: {
              totals: {salary: 164509, age: 36},
              values: {
                no: {totals: {salary: 189202, age: 37}},
                yes: {totals: {salary: 143977, age: 35}}
              }
            },
            Java: {
              totals: {salary: 124809, age: 32},
              values: {
                no: {totals: {salary: 129202, age: 47}},
                yes: {totals: {salary: 233977, age: 25}}
              }
            },
            //...
          }
        }
      },
      //...
    ]
  }
  //#endregion
  return response;
}

export function batchingExpandedGroup() {
  //#region batching-expanded-group
  //request:
  groupKeys: ["Argentina"]
  groupBy: [{"field":"country"},{"field":"city"}]
  reducers: [{"field":"salary","id":"avgSalary","name":"avg"},{"field":"age","id":"avgAge","name":"avg"}]
  lazyLoadStartIndex: 0
  lazyLoadBatchSize: 10
  pivotBy: [{"field":"preferredLanguage"},{"field":"canDesign"}]

  //response
  const response: DataSourceRemoteData<Developer> = {
    mappings: {
      totals: "totals",
      values: "values"
    },
    cache: true,
    totalCount: 20,
    data: [
      {
        data: {country: "Argentina", city: "Buenos Aires"},
        aggregations: {avgSalary: 20000, avgAge: 30},
        keys: ["Argentina", "Buenos Aires"],
        pivot: {
          totals: {avgSalary: 20000, avgAge: 30},
          values: {
            Csharp: {
              totals: {avgSalary: 39000, avgAge: 29},
              values: {
                no: {totals: {salary: 208897, age: 34}},
                yes: {totals: {salary: 296000, age: 36}}
              }
            },
            Go: {
              totals: {salary: 164509, age: 36},
              values: {
                no: {totals: {salary: 189202, age: 37}},
                yes: {totals: {salary: 143977, age: 35}}
              }
            },
            Java: {
              totals: {salary: 124809, age: 32},
              values: {
                no: {totals: {salary: 129202, age: 47}},
                yes: {totals: {salary: 233977, age: 25}}
              }
            },
            //...
          }
        }
      },
      //...
    ]
  }
  //#endregion
  return response;
}

// With `mappings`, the `pivot` object has the mapped keys (`t`, `v`), which
// the `DataSourceRemoteData` type does not describe: these two responses are
// plain objects.
export const responseWithMappings =
  //#region response-with-mappings
  {
    totalCount: 20,
    data: {/* ... */},
    pivot: {
      t: {avgSalary: 10000, avgAge: 30},
      v: {
        Go: {
          t: {/* ... */},
          v: {/* ... */}
        },
        Java: {
          t: {/* ... */},
          v: {/* ... */}
        }
      }
    }
  }
  //#endregion
;

export function shortAggregationKeys() {
  //#region short-aggregation-keys
  const aggregationReducers: DataSourcePropAggregationReducers<Developer> =
    {
      s: {
        name: 'Salary (avg)',
        field: 'salary',
        reducer: 'avg',
      },
      a: {
        name: 'Age (avg)',
        field: 'age',
        reducer: 'avg',
      },
    };

  // pivot response
  const response = {
    totalCount: 20,
    data: {/* ... */},
    pivot: {
      t: {s: 10000, a: 30},
      v: {
        Go: {
          t: { s: 10000, a: 30 },
          v: {/* ... */}
        },
        Java: {
          t: {/* ... */},
          v: {/* ... */}
        }
      }
    }
  }
  //#endregion
  return { aggregationReducers, response };
}

// Snippets shown on overview.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  DataSourcePivotBy,
  DataSourcePropAggregationReducers,
  DataSourceProps,
  InfiniteTable,
  InfiniteTableColumnAggregator,
} from '@infinite-table/infinite-react';

{
  //#region intro
  const pivotBy = [{ field: 'team' }]
   // field needs to be keyof DATA_TYPE both in `pivotBy` and `groupBy`
  const groupBy = [{field: 'department'}, {field: 'country'}]

  <DataSource<DATA_TYPE> pivotBy={pivotBy} groupBy={groupBy}>
  { ({pivotColumns, pivotColumnGroups}) => {
    return <InfiniteTable<DATA_TYPE>
      pivotColumns={pivotColumns}
      pivotColumnGroups={pivotColumnGroups}
    />
  } }
  </DataSource>
  //#endregion
}

{
  //#region sorting-the-group-column-and-pivot-columns
  const defaultSortInfo = [{ id: 'group-by', dir: 1 }];
  //#endregion
}

{
  //#region sorting-the-group-column-and-pivot-columns-2
  <InfiniteTable
    pivotColumn={{
      defaultSortable: true,
    }}
  />
  //#endregion
}

{
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
}

{
  //#region customizing-pivot-columns-2
  const pivotBy: DataSourcePivotBy<DATA_TYPE>[] = [
    { field: 'country' },
    { field: 'canDesign', column: { defaultWidth: 400 } },
  ];

  <DataSource pivotBy={pivotBy} />;
  //#endregion
}

{
  //#region customizing-pivot-columns-3
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
}

{
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
}

{
  //#region server-side-pivoting-2

  const dataSource = ({ groupBy, pivotBy, groupKeys, aggregationReducers }) => {
    // make sure you return a Promise that resolves to the correct structure - see details below

    //eg: groupBy: [{ field: 'country' }, { field: 'stack' }],
    //    groupKeys: [], - so we're requesting top-level data

    //eg: groupBy: [{ field: 'country' }, { field: 'stack' }],
    //    groupKeys: ["Canada"], - so we're requesting Canada's data

    //eg: groupBy: [{ field: 'country' }, { field: 'stack' }],
    //    groupKeys: ["Canada"], - so we're requesting Canada's data

  }

  <DataSource lazyLoad data={dataSource}>
  //#endregion
}

{
  //#region server-side-pivoting-3
  {
    data: [
      {
        aggregations: {
          // for each aggregation id, have an entry
          salary: <SALARY_AGGREGATION_VALUE>,
          age: <AGE_AGGREGATION_VALUE>,
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
            salary: <SALARY_AGGREGATION_VALUE>,
            age: <AGE_AGGREGATION_VALUE>,
          },
          values: {
            [for each unique value]: { // eg: for country
              totals: {
                // for each aggregation, have an entry
                salary: <SALARY_AGGREGATION_VALUE>,
                age: <AGE_AGGREGATION_VALUE>,
              },
              values: {
                [for each unique value]: { // eg: for stack
                  totals: {
                    salary: <SALARY_AGGREGATION_VALUE>,
                    age: <AGE_AGGREGATION_VALUE>,
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
}

{
  //#region another-pivoting-example-with-batching
  //request:
  groupKeys: [] // empty keys array, so it's a top-level group
  groupBy: [{"field":"country"},{"field":"city"}]
  reducers: [{"field":"salary","id":"avgSalary","name":"avg"},{"field":"age","id":"avgAge","name":"avg"}]
  lazyLoadStartIndex: 0
  lazyLoadBatchSize: 10
  pivotBy: [{"field":"preferredLanguage"},{"field":"canDesign"}]

  //response
  {
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
}

{
  //#region another-pivoting-example-with-batching-2
  //request:
  groupKeys: ["Argentina"]
  groupBy: [{"field":"country"},{"field":"city"}]
  reducers: [{"field":"salary","id":"avgSalary","name":"avg"},{"field":"age","id":"avgAge","name":"avg"}]
  lazyLoadStartIndex: 0
  lazyLoadBatchSize: 10
  pivotBy: [{"field":"preferredLanguage"},{"field":"canDesign"}]

  //response
  {
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
}

{
  //#region another-pivoting-example-with-batching-3
  {
    totalCount: 20,
    data: {...},
    pivot: {
      t: {avgSalary: 10000, avgAge: 30},
      v: {
        Go: {
          t: {...},
          v: {...}
        },
        Java: {
          t: {...},
          v: {...}
        }
      }
    }
  //#endregion
}

{
  //#region another-pivoting-example-with-batching-4
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
  {
    totalCount: 20,
    data: {...},
    pivot: {
      t: {s: 10000, a: 30},
      v: {
        Go: {
          t: { s: 10000, a: 30 },
          v: {...}
        },
        Java: {
          t: {...},
          v: {...}
        }
      }
    }
  //#endregion
}

export {};

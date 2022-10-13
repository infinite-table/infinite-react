---
title: Pivoting
---

An enteprise-level feature `InfiniteTable` provides is the pivoting functionality. Combined with grouping and advanced aggregation, it unlocks new ways to visualize data.

Pivoting is first defined at the `DataSource` level, via the <PropLink name="pivotBy" /> prop. It's an array of objects, each with a `field` property bound (so `pivotBy[].field` is keyof `DATA_TYPE`) to the `DataSource`.

<Note>

Pivoting generates columns based on the pivoting values, so you have to pass those generated columns into the `<InfiniteTable />` component.

You do that by using a `function` as a direct child of the `DataSource`, and in that function you have access to the generated `pivotColumns` array. Likewise for `pivotColumnGroups`.

</Note>

For more pivoting examples, see [our pivoting demos](/docs/latest/learn/examples/dynamic-pivoting-example)

```ts
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
```

<Sandpack title="Pivoting with avg aggregation">

```ts file=pivoting-example.page.tsx

```

</Sandpack>

## Customizing Pivot Columns

There are a number of ways to customize the pivot columns and <DataSourcePropLink name="pivotBy.columnGroup" nocode>pivot column groups</DataSourcePropLink>. This is something you generally want to do, as they are generated and you might need to tweak column headers, size, etc.

The default behavior for pivot columns generated for aggregations is that they inherit the properties of the original columns bound to the same field as the aggregation.

```ts
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
```

<Sandpack title="Pivot columns inherit from original columns bound to the same field">

```ts file=pivot-column-inherit-example.page.tsx

```

</Sandpack>

Another way to do it is to specify <DataSourcePropLink name="pivotBy.column" />, as either an object, or (more importantly) as a function.
If you pass an object, it will be applied to all pivot columns in the column group generated for the `field` property.

```tsx
const pivotBy: DataSourcePivotBy<DATA_TYPE>[] = [
  { field: 'country' },
  { field: 'canDesign', column: { defaultWidth: 400 } },
];

<DataSource pivotBy={pivotBy} />;
```

In the above example, the `column.defaultWidth=400` will be applied to columns generated for all `canDesign` values corresponding to each country. This is good but not good enough as you might want to customize the pivot column for every value in the pivot. You can do that by passing a function to the `pivotBy.column` property.

```tsx
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
```

<Sandpack title="Pivoting with customized pivot column">

```ts file=pivoting-customize-column-example.page.tsx

```

</Sandpack>

## Total and grand-total columns

In <DPropLink name="pivotBy" nocode>pivot mode</DPropLink> you can configure both <PropLink name="pivotTotalColumnPosition" nocode>total columns</PropLink> and <PropLink name="pivotGrandTotalColumnPosition" nocode>grand-total columns</PropLink>. By default, grand-total columns are not displayed, so you have to explicitly set the <PropLink name="pivotGrandTotalColumnPosition" /> prop for them to be visible.

<Sandpack title="Pivoting with customized position for totals and grand-total columns">

```ts file=../../../reference/pivot-grand-total-column-position-example.page.tsx

```

</Sandpack>

<Note>

**What are grand-total columns?**

For each <DPropLink name="aggregationReducers" nocode>aggregation reducer</DPropLink> specified in the `DataSource`, you can have a total column - this is what <PropLink name="pivotGrandTotalColumnPosition" nocode>grand-total columns</PropLink> basically are.

</Note>

## Server-side pivoting

By default, pivoting is client side. However, if you specify <DataSourcePropLink name="lazyLoad" code>DataSource.lazyLoad</DataSourcePropLink> and provide a function that returns a promise for the <DataSourcePropLink name="data" code>DataSource.data</DataSourcePropLink> prop, the table will use server-pivoted data.

The <DataSourcePropLink name="data" code>DataSource.data</DataSourcePropLink> function is expected to return a promise that resolves to an object with the following shape:

- `totalCount` - the total number of records in the group we're pivoting on
- `data` - an array of objects that describes child groups, each object has the following properties:
  - `keys` - an array of the group keys (usually strings) that uniquely identifies the group, from the root to the current group
  - `data` - an object that describes the common properties of the group
  - `aggregations` - an object that describes the aggregations for the current group
  - `pivot` - the pivoted values and aggregations for each value. This object will have the following properties:
    - `totals` - an object with a key for each aggregation. The value is the aggregated value for the respective aggregation reducer.
    - `values` - an object keyed with the unique values for the pivot field. The values of those keys are objects with the same shape as the `pivot` top-level object, namely `totals` and `values`.

In the example below, let's assume the following practical scenario, with the data-type being a `Developer{country, stack, preferredLanguage, canDesign, age, salary}`.

```tsx
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
```

```tsx

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
```

```js
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
```

<Sandpack title="Server-side pivoting example">

```ts file=remote-pivoting-example.page.tsx

```

</Sandpack>

<Note>

The <PropLink name="groupRenderStrategy" /> prop is applicable even to pivoted tables, but `groupRenderStrategy="inline"` is not supported in this case.

</Note>

### Another pivoting example with batching

Pivoting builds on the same data response as server-side grouping, but adds the pivot values for each group, as we already showed. Another difference is that in pivoting, no leaf rows are rendered or loaded, since this is pivoting and it only works with aggregated data. This means the `DataSource.data` function must always return the same format for the response data.

Just like server-side grouping, server-side pivoting also supports batching - make sure you specify <DataSourcePropLink name="lazyLoad">lazyLoad.batchSize</DataSourcePropLink>.

The example below also shows you how to customize the table rows while records are still loading.

<Sandpack title="Server side pivoting with lazy loding batching">

```ts file=server-side-pivoting-with-lazy-load-batching-example.page.tsx

```

</Sandpack>

Here's another example, that assumes grouping by `country` and `city`, aggregations by `age` and `salary` (average values) and pivot by `preferredLanguage` and `canDesign` (a boolean property):

```tsx
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
```

If we were to scroll down, the next batch of data would have the same structure as the previous one, but with `lazyLoadStartIndex` set to 10 (if `lazyLoad.batchSize = 10`).

Now let's expand the first group and see how the request/response would look like:

```tsx
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
```

<Note>

The response can contain a `mappings` key with values for `totals` and `values` keys - this can be useful for making the server-side pivot response lighter.

If `mappings` would be `{totals: "t", values: "v"}`, the response would look like this:

```tsx
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

```

More-over, you can also give aggregationReducers shorter keys to make the server response even more compact

```tsx
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
```

</Note>

<Note>

Adding a `cache: true` key to the resolved object in the `DataSource.data` call will cache the value for the expanded group, so that when collaped and expanded again, the cached value will be used, and no new call is made to the `DataSource.data` function. This is applicable for both pivoted and/or grouped data. Not passing `cache: true` will make the function call each time the group is expanded.

</Note>

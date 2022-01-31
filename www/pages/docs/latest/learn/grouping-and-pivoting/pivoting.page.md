---
title: Pivoting
---

An enteprise-level feature `InfiniteTable` provides is the pivoting functionality. Combined with grouping and advanced aggregation, it unlocks new ways to visualize data.

Pivoting is first defined at the `DataSource` level, via the <PropLink name="pivotBy" /> prop. It's an array of objects, each with a `field` property bound (so `pivotBy[].field` is keyof `DATA_TYPE`) to the `DataSource`.


<Note>

Pivoting generates columns based on the pivoting values, so you have to pass those generated columns into the `<InfiniteTable />` component.

You do that by using a `function` as a direct child of the `DataSource`, and in that function you have access to the generated `pivotColumns` array. Likewise for `pivotColumnGroups`.

</Note>


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

There are a number of ways to customize the pivot columns. This is something you generally want to do, as they are generated and you might need to tweak column headers, size, etc.

One way to do it is to specify <DPropLink name="pivotBy.column" />, as either an object, or (more importantly) as a function.
If you pass an object, it will be applied to all pivot columns corresponding to the `field` property.


```tsx
const pivotBy: DataSourcePivotBy<DATA_TYPE>[] = [
  { field: 'country' },
  { field: 'canDesign', column: { defaultWidth: 400 } },
];

<DataSource pivotBy={pivotBy} />
```

In the above example, the `column.defaultWidth=400` will be applied to columns generated for all `canDesign` values corresponding to each country. This is good but not good enough as you might want to customize the pivot column for every value in the pivot. You can do that by passing a function to the `pivotBy.column` property.

```tsx
const pivotBy: DataSourcePivotBy<DATA_TYPE>[] = [
  { field: 'country' },
  { field: 'canDesign', column: ({ column }) => {
    return {
      header: column.pivotGroupKeyForColumn === 'yes' ? 'Designer' : 'Not a Designer',
    }
  },
];
```



<Sandpack title="Pivoting with customized pivot column">

```ts file=pivoting-customize-column-example.page.tsx
```

</Sandpack>

## Server-side pivoting

By default, pivoting is client side. However, if you specify <DataSourcePropLink name="fullLazyLoad" code>DataSource.fullLazyLoad=true</DataSourcePropLink> and provide a function that returns a promise for the <DataSourcePropLink name="data" code>DataSource.data</DataSourcePropLink> prop, the table will use server-pivoted data.

In the example below, let's assume the following practical scenario, with the data-type being a `Developer{country, stack, preferredLanguage, canDesign, age, salary}`.

```tsx
const groupBy = [
  { field: "country" }, // possible values: any valid country
  { field: "stack" } // possible values: "backend", "frontend", "full-stack"
]
const pivotBy = [
  { field: "preferredLanguage" }, // possible values: "TypeScript","JavaScript","Go"
  { field: "canDesign" }, // possible values: "yes" or "no"
]

const aggregationReducers = {
  salary: { name: 'Salary (avg)', field: 'salary', reducer: 'avg' },
  age: { name: 'Age (avg)', field: 'age', reducer: 'avg' },
};
```

```tsx

const dataSource = ({ groupBy, groupKeys, pivotBy, groupKeys, aggregationReducers }) => {
  // make sure you return a Promise that resolves to the correct structure - see details below

  //eg: groupBy: [{ field: 'country' }, { field: 'stack' }],
  //    groupKeys: [], - so we're requesting top-level data

  //eg: groupBy: [{ field: 'country' }, { field: 'stack' }],
  //    groupKeys: ["Canada"], - so we're requesting Canada's data

  //eg: groupBy: [{ field: 'country' }, { field: 'stack' }],
  //    groupKeys: ["Canada"], - so we're requesting Canada's data

}

<DataSource fullLazyLoad data={dataSource}>
```

```js
{
  data: [
    {
      aggregations: {
        // for each aggregation, have an entry
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
          // for each aggregation, have an entry
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

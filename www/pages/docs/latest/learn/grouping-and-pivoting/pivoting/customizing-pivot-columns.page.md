There are a number of ways to customize the generated pivot columns and we'll cover each of them in this page

## Inheriting from initial columns

Pivoting is all about aggregations, so you need to specify the <DataSourcePropLink name="aggregationReducers">reducers</DataSourcePropLink> that will aggregate your data. Each reducer can have a `field` property that specifies the field that will be used for aggregation.

If the table <PropLink name="columns"/> collection already has a column bound to the `field` used in the aggregation, the column configuration will be inherited by the generated pivot column.

```ts
const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: {
    field: 'preferredLanguage',
    style: { color: 'blue' },
  },
  age: {
    field: 'age',
    style: {
      color: 'magenta',
      background: 'yellow',
    },
  },
  salary: {
    field: 'salary',
    type: 'number',
    style: {
      color: 'red',
    },
  },
  canDesign: { field: 'canDesign' },
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  id: { field: 'id' },
};

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

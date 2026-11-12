// Snippets shown on building-pivoted-react-datagrids-with-generated-columns.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  DataSourcePivotBy,
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

{
  //#region pivoting-belongs-in-the-datasource
  const groupBy = [{ field: 'department' }, { field: 'country' }];
  const pivotBy = [{ field: 'team' }];

  <DataSource<Developer>
    groupBy={groupBy}
    pivotBy={pivotBy}
    aggregationReducers={aggregationReducers}
  >
    {({ pivotColumns, pivotColumnGroups }) => {
      return (
        <InfiniteTable<Developer>
          columns={columns}
          pivotColumns={pivotColumns}
          pivotColumnGroups={pivotColumnGroups}
        />
      );
    }}
  </DataSource>;
  //#endregion
}

{
  //#region scenario-2-support-ops-volume-by-priority
  const groupBy = [{ field: 'priority' }, { field: 'productArea' }];
  const pivotBy = [{ field: 'channel' }];

  const aggregationReducers = {
    ticketCount: {
      name: 'Tickets',
      initialValue: 0,
      reducer: (acc) => acc + 1,
    },
    avgFirstResponseMins: {
      name: 'Avg first response (min)',
      field: 'firstResponseMins',
      initialValue: 0,
      reducer: (acc, value) => acc + value,
      done: (sum, arr) => (arr.length ? sum / arr.length : 0),
    },
  };
  //#endregion
}

{
  //#region scenario-3-commerce-revenue-by-product-line
  const pivotBy = [{ field: 'stack' }, { field: 'canDesign' }];

  <InfiniteTable<Developer>
    columns={columns}
    pivotColumns={pivotColumns}
    pivotColumnGroups={pivotColumnGroups}
    pivotTotalColumnPosition="end"
    pivotGrandTotalColumnPosition="start"
  />
  //#endregion
}

{
  //#region inherit-formatting-from-source-columns
  const columns: InfiniteTablePropColumns<Developer> = {
    salary: {
      field: 'salary',
      type: 'number',
      style: { color: 'red' },
    },
  };

  const aggregationReducers = {
    avgSalary: {
      field: 'salary',
      reducer: 'avg',
    },
  };
  //#endregion
}

{
  //#region rename-raw-values-into-business-labels
  const pivotBy: DataSourcePivotBy<Developer>[] = [
    { field: 'country' },
    {
      field: 'canDesign',
      column: ({ column }) => {
        const lastKey = column.pivotGroupKeys[column.pivotGroupKeys.length - 1];

        return {
          header: lastKey === 'yes' ? 'Designer' : 'Non-designer',
        };
      },
    },
  ];
  //#endregion
}

{
  //#region rename-raw-values-into-business-labels-2
  const groupBy = [{ field: 'skuFamily' }, { field: 'sku' }];
  const pivotBy = [
    { field: 'warehouse' },
    {
      field: 'status',
      column: ({ column }) => {
        const status =
          column.pivotGroupKeys[column.pivotGroupKeys.length - 1];
        const labels: Record<string, string> = {
          in_stock: 'Available',
          reserved: 'Reserved',
          quarantine: 'Quarantine',
        };

        return {
          header: labels[status] ?? String(status),
          defaultWidth: 120,
        };
      },
    },
  ];

  const aggregationReducers = {
    units: {
      name: 'Units',
      field: 'quantity',
      initialValue: 0,
      reducer: (acc, value) => acc + value,
    },
  };
  //#endregion
}

{
  //#region scenario-5-saas-metrics-plans-and-regions-at
  const groupBy = [{ field: 'country' }, { field: 'stack' }];
  const pivotBy = [
    { field: 'preferredLanguage' },
    { field: 'canDesign' },
  ];

  const aggregationReducers = {
    salary: { name: 'Salary (avg)', field: 'salary', reducer: 'avg' },
    age: { name: 'Age (avg)', field: 'age', reducer: 'avg' },
  };

  const dataSource = ({ groupBy, pivotBy, groupKeys, aggregationReducers }) => {
    // Fetch a Promise that resolves to { data, totalCount, pivot, ... }
    // See the pivoting docs for the full response shape.
  };

  <DataSource lazyLoad data={dataSource} groupBy={groupBy} pivotBy={pivotBy} />;
  //#endregion
}

export {};

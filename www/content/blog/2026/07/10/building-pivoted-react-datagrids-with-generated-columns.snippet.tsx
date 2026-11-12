// Snippets shown on building-pivoted-react-datagrids-with-generated-columns.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSource,
  DataSourcePivotBy,
  InfiniteTable,
  InfiniteTablePropColumns,
  type DataSourceData,
  type DataSourceDataParams,
  type DataSourcePropAggregationReducers,
  type DataSourcePropGroupBy,
  type DataSourcePropPivotBy,
  type DataSourceRemoteData,
  type InfiniteTableProps,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  department: string;
  team: string;
  country: string;
  stack: string;
  preferredLanguage: string;
  canDesign: 'yes' | 'no';
  age: number;
  salary: number;
};

// the rows of the support scenario
type Ticket = {
  id: number;
  priority: 'critical' | 'high' | 'normal';
  productArea: string;
  channel: string;
  firstResponseMins: number;
};

// the rows of the inventory scenario
type InventoryItem = {
  id: number;
  skuFamily: string;
  sku: string;
  warehouse: string;
  status: 'in_stock' | 'reserved' | 'quarantine';
  quantity: number;
};

declare const data: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;

// Some snippets write their config without a type (`const groupBy = [{ field: 'country' }]`),
// so their `field` is a `string`. Those are checked, after the region, against
// the library types for a row type that has any string as a key.
type AnyRow = Record<string, unknown>;

export function PivotingInTheDataSource(props: {
  aggregationReducers: DataSourcePropAggregationReducers<Developer>;
}) {
  const { aggregationReducers } = props;

  //#region pivoting-belongs-in-the-datasource
  const groupBy: DataSourcePropGroupBy<Developer> = [{ field: 'department' }, { field: 'country' }];
  const pivotBy: DataSourcePropPivotBy<Developer> = [{ field: 'team' }];

  <DataSource<Developer>
    primaryKey="id"
    data={data}
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
  return null;
}

export function supportOps() {
  //#region scenario-2-support-ops-volume-by-priority
  const groupBy = [{ field: 'priority' }, { field: 'productArea' }];
  const pivotBy = [{ field: 'channel' }];

  const aggregationReducers: DataSourcePropAggregationReducers<Ticket> = {
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
  const checkedGroupBy: DataSourcePropGroupBy<AnyRow> = groupBy;
  const checkedPivotBy: DataSourcePropPivotBy<AnyRow> = pivotBy;
  return { checkedGroupBy, checkedPivotBy, aggregationReducers };
}

export function PivotTotals(props: {
  pivotColumns: InfiniteTableProps<Developer>['pivotColumns'];
  pivotColumnGroups: InfiniteTableProps<Developer>['pivotColumnGroups'];
}) {
  const { pivotColumns, pivotColumnGroups } = props;

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
  const checkedPivotBy: DataSourcePropPivotBy<AnyRow> = pivotBy;
  return checkedPivotBy;
}

export function inheritFormatting() {
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
  const checkedReducers: DataSourcePropAggregationReducers<AnyRow> =
    aggregationReducers;
  return { columns, checkedReducers };
}

export function businessLabels() {
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
  return pivotBy;
}

export function warehouseDashboard() {
  //#region warehouse-dashboard
  const groupBy = [{ field: 'skuFamily' }, { field: 'sku' }];
  const pivotBy: DataSourcePivotBy<InventoryItem>[] = [
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

  const aggregationReducers: DataSourcePropAggregationReducers<InventoryItem> = {
    units: {
      name: 'Units',
      field: 'quantity',
      initialValue: 0,
      reducer: (acc, value) => acc + value,
    },
  };
  //#endregion
  const checkedGroupBy: DataSourcePropGroupBy<AnyRow> = groupBy;
  return { checkedGroupBy, pivotBy, aggregationReducers };
}

declare function fetchPivotData(
  params: Pick<
    DataSourceDataParams<Developer>,
    'groupBy' | 'pivotBy' | 'groupKeys' | 'aggregationReducers'
  >,
): Promise<DataSourceRemoteData<Developer>>;

export function ServerSidePivoting() {
  //#region scenario-5-saas-metrics-plans-and-regions-at
  const groupBy: DataSourcePropGroupBy<Developer> = [{ field: 'country' }, { field: 'stack' }];
  const pivotBy: DataSourcePropPivotBy<Developer> = [
    { field: 'preferredLanguage' },
    { field: 'canDesign' },
  ];

  const aggregationReducers = {
    salary: { name: 'Salary (avg)', field: 'salary', reducer: 'avg' },
    age: { name: 'Age (avg)', field: 'age', reducer: 'avg' },
  };

  const dataSource: DataSourceData<Developer> = ({ groupBy, pivotBy, groupKeys, aggregationReducers }) => {
    // Fetch a Promise that resolves to { data, totalCount, pivot, ... }
    // See the pivoting docs for the full response shape.
    return fetchPivotData({ groupBy, pivotBy, groupKeys, aggregationReducers });
  };

  <DataSource primaryKey="id" lazyLoad data={dataSource} groupBy={groupBy} pivotBy={pivotBy} />;
  //#endregion
  const checkedReducers: DataSourcePropAggregationReducers<AnyRow> =
    aggregationReducers;
  return checkedReducers;
}

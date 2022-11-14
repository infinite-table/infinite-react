import {
  InfiniteTable,
  DataSource,
  DataSourceGroupBy,
  DataSourcePivotBy,
  InfiniteTableColumnAggregator,
  DataSourcePropAggregationReducers,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react@prerelease';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react@prerelease';
import * as React from 'react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80 },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};

const defaultGroupBy: DataSourceGroupBy<Developer>[] = [
  {
    field: 'country',
  },
  {
    field: 'city',
  },
];

const defaultPivotBy: DataSourcePivotBy<Developer>[] = [
  {
    field: 'stack',
  },
  {
    field: 'canDesign',
    column: {
      renderValue: ({ value }) => {
        return <span style={{ color: 'tomato' }}>{value}</span>;
      },
      // use piped rendering - the renderBag object
      // contains the renderBag.value as returned by the `renderValue` fn
      // use `value` to decide if there was a real value or not to be rendered
      render: ({ value, renderBag }) => {
        return value == null ? '—' : renderBag.value;
      },
    },
    columnGroup: ({ columnGroup }) => {
      return {
        ...columnGroup,
        header:
          columnGroup.pivotGroupKey === 'yes' ? 'Designer' : 'Non-designer',
      };
    },
  },
];

const avgReducer: InfiniteTableColumnAggregator<Developer, any> = {
  initialValue: 0,

  reducer: (acc, sum) => acc + sum,
  done: (sum, arr) => Math.round(arr.length ? sum / arr.length : 0),
};

const aggregations: DataSourcePropAggregationReducers<Developer> = {
  salary: {
    ...avgReducer,
    name: 'Salary (avg)',
    field: 'salary',
  },
  age: {
    ...avgReducer,
    name: 'Age (avg)',
    field: 'age',
  },
};

const groupColumn: InfiniteTableColumn<Developer> = {
  renderSelectionCheckBox: false,
};

export default function ColumnValueGetterExample() {
  return (
    <>
      <DataSource<Developer>
        primaryKey="id"
        defaultGroupBy={defaultGroupBy}
        defaultPivotBy={defaultPivotBy}
        aggregationReducers={aggregations}
        data={dataSource}
      >
        {({ pivotColumns, pivotColumnGroups }) => {
          return (
            <InfiniteTable<Developer>
              groupRenderStrategy="single-column"
              groupColumn={groupColumn}
              columns={columns}
              columnDefaultWidth={200}
              pivotColumns={pivotColumns}
              pivotColumnGroups={pivotColumnGroups}
              pivotTotalColumnPosition="start"
            />
          );
        }}
      </DataSource>
    </>
  );
}

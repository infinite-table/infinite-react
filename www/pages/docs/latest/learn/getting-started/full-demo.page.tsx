import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
  InfiniteTablePropColumnTypes,
} from '@infinite-table/infinite-react';
import type {
  InfiniteTableColumn,
  InfiniteTablePropColumns,
  InfiniteTableColumnRenderValueParam,
  DataSourcePropAggregationReducers,
  DataSourceGroupBy,
} from '@infinite-table/infinite-react';
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

const avgReducer = {
  initialValue: 0,
  reducer: (acc: number, sum: number) => acc + sum,
  done: (value: number, arr: any[]) =>
    arr.length ? Math.floor(value / arr.length) : 0,
};
const aggregationReducers: DataSourcePropAggregationReducers<Developer> = {
  salary: {
    field: 'salary',

    ...avgReducer,
  },
  age: {
    field: 'age',
    ...avgReducer,
  },
};

const columns: InfiniteTablePropColumns<Developer> = {
  age: { field: 'age', header: 'Age', type: 'number' },
  salary: {
    header: 'Compensation',
    field: 'salary',
    type: 'number',
    defaultWidth: 170,
  },
  currency: { field: 'currency', header: 'Currency', defaultWidth: 100 },
  preferredLanguage: {
    field: 'preferredLanguage',
    header: 'Programming Language',
  },

  canDesign: { field: 'canDesign', header: 'Design Skills' },
  country: { field: 'country', header: 'Country' },
  firstName: { field: 'firstName', header: 'First Name' },
  stack: { field: 'stack', header: 'Stack' },

  city: { field: 'city', header: 'City' },
};

// → 123.456,789
const groupColumn: InfiniteTableColumn<Developer> = {
  header: 'Grouping',
  defaultWidth: 250,

  // in this function we have access to collapsed info
  // and grouping info about the current row - see rowInfo.groupBy
  renderValue: ({
    value,
    rowInfo,
  }: InfiniteTableColumnRenderValueParam<Developer>) => {
    if (!rowInfo.isGroupRow) {
      return value;
    }
    const groupBy = rowInfo.groupBy || [];
    const collapsed = rowInfo.collapsed;
    const groupField = groupBy[groupBy.length - 1];

    if (groupField === 'age') {
      return `🥳 ${value}${collapsed ? ' 🤷‍♂️' : ''}`;
    }

    return `${value}`;
  },
};

const defaultGroupRowsState = new GroupRowsState({
  //make all groups collapsed by default
  collapsedRows: true,
  expandedRows: [['United States'], ['United States', 'backend'], ['France']],
});

const columnTypes: InfiniteTablePropColumnTypes<Developer> = {
  number: {
    align: 'end',
    style: () => {
      return {};
    },
    renderValue: ({ value, data }) =>
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: data?.currency || 'USD',
      }).format(value),
  },
};

export default function App() {
  const groupBy: DataSourceGroupBy<Developer>[] = React.useMemo(
    () => [
      {
        field: 'country',
      },
      { field: 'stack' },
    ],
    [],
  );
  return (
    <DataSource<Developer>
      data={dataSource}
      primaryKey="id"
      defaultGroupRowsState={defaultGroupRowsState}
      aggregationReducers={aggregationReducers}
      groupBy={groupBy}
    >
      <InfiniteTable<Developer>
        groupRenderStrategy="single-column"
        groupColumn={groupColumn}
        columns={columns}
        columnTypes={columnTypes}
        columnDefaultWidth={150}
      />
    </DataSource>
  );
}

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

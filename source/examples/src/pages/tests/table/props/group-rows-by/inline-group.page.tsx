import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourceGroupRowsBy,
  InfiniteTableColumnAggregator,
  InfiniteTablePropColumns,
  InfiniteTablePropColumnAggregations,
  DataSourcePropPivotBy,
  InfiniteTableColumn,
  GroupRowsState,
} from '@infinite-table/infinite-react';
import { Person, data } from './pivotData';

const domProps = {
  style: { height: '80vh', border: '1px solid gray' },
};

const groupRowsBy: DataSourceGroupRowsBy<Person>[] = [
  {
    field: 'department',
  },
  {
    field: 'team',
  },
];

const sumReducer: InfiniteTableColumnAggregator<Person, any> = {
  initialValue: 0,
  getter: (data) => data.salary,
  reducer: (acc, sum) => acc + sum,
};

const columnAggregations: InfiniteTablePropColumnAggregations<Person> = new Map(
  [['salary', sumReducer]],
);

const columns: InfiniteTablePropColumns<Person> = new Map([
  ['department', { field: 'department' }],
  // [
  //   'department1',
  //   {
  //     valueGetter: ({ data }) => data?.department,
  //     header: 'dep',
  //   } as InfiniteTableColumn<Person>,
  // ],
  ['team', { field: 'team' }],
  // [
  //   'team1',
  //   {
  //     valueGetter: ({ data }) => data?.team,
  //     header: 'team1',
  //   } as InfiniteTableColumn<Person>,
  // ],
  ['id', { field: 'id' }],
  ['name', { field: 'name' }],
  ['country', { field: 'country' }],
]);

const pivotBy: DataSourcePropPivotBy<Person> = [
  {
    field: 'country',
    column: {
      header: 'test',
    },
  },
  { field: 'age' },
];

const groupColumn = {
  width: 300,
};

// data.length = 6;

const groupRowsState = new GroupRowsState({
  // collapsedRows: [['it', 'components']],
  // collapsedRows: [['it'], ['devops', 'infrastructure']],
  collapsedRows: [],
  expandedRows: true,
});

// const pivotColumn = {
//   style: ({ value }) => (value! > 60_000 ? { color: 'red' } : {}),
// };
export default function GroupByExample() {
  return (
    <>
      <DataSource<Person>
        primaryKey="id"
        data={data}
        groupRowsBy={groupRowsBy}
        defaultGroupRowsState={groupRowsState}
      >
        <InfiniteTable<Person>
          domProps={domProps}
          columns={columns}
          // collapsedColumnGroups=
          pivotTotalColumnPosition={'start'}
          columnDefaultWidth={200}
          groupColumn={groupColumn}
          groupRenderStrategy={'inline'}
          // groupRenderStrategy={'multi-column'}
          columnAggregations={columnAggregations}
        ></InfiniteTable>
      </DataSource>
    </>
  );
}

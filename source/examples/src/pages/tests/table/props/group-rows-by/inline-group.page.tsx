import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  DataSourceGroupRowsBy,
  InfiniteTableColumnAggregator,
  InfiniteTablePropColumns,
  InfiniteTablePropColumnAggregations,
  InfiniteTableColumn,
  GroupRowsState,
  InfiniteTablePropGroupRenderStrategy,
} from '@infinite-table/infinite-react';
import { Person, data } from './pivotData';
import { useState } from 'react';

const domProps = {
  style: {
    height: '60vh',
    border: '1px solid gray',
    width: 'calc(100% - 20px)',
    marginLeft: 10,
  },
};

const groupRowsBy: DataSourceGroupRowsBy<Person>[] = [
  {
    field: 'department',
  },
  {
    field: 'team',
  },
  // { field: 'country' },
];

const sum = (acc: number, sum: number) => acc + sum;

const sumReducer: InfiniteTableColumnAggregator<Person, any> = {
  initialValue: 0,
  getter: (data) => data.salary,
  reducer: sum,
};

const columnAggregations: InfiniteTablePropColumnAggregations<Person> = new Map(
  [['salary', sumReducer]],
);

// TODO add renderValue for each column, for easy override
const columns: InfiniteTablePropColumns<Person> = new Map<
  string,
  InfiniteTableColumn<Person>
>([
  [
    'department',
    {
      field: 'department',
      valueGetter: ({ enhancedData }) => {
        const { groupBy, parents } = enhancedData;

        const groupData =
          parents?.[groupBy?.indexOf('department') ?? -1] || enhancedData;

        return (
          <>
            {groupData?.value} ({groupData?.groupCount}), total{' '}
            {groupData?.reducerResults?.[0]}
          </>
        );
      },
    },
  ],
  [
    'team',
    {
      field: 'team',
      valueGetter: ({ enhancedData }) => {
        const { groupBy, parents } = enhancedData;
        const groupData =
          parents?.[groupBy?.indexOf('team') ?? -1] || enhancedData;

        return (
          <>
            {groupData?.value} ({groupData?.groupCount}), total{' '}
            {groupData?.reducerResults?.[0]}
          </>
        );
      },
    },
  ],
  ['id', { field: 'id' }],
  ['name', { field: 'name' }],
  ['country', { field: 'country' }],
  ['salary', { field: 'salary' }],
]);

// const pivotBy: DataSourcePropPivotBy<Person> = [
//   {
//     field: 'country',
//     column: {
//       header: 'test',
//     },
//   },
//   { field: 'age' },
// ];

const groupColumn = {
  width: 300,
};

const groupRowsState = new GroupRowsState({
  collapsedRows: [['it']],

  expandedRows: true,
});

const groupOptions: InfiniteTablePropGroupRenderStrategy[] = [
  'inline',
  'multi-column',
  'single-column',
];

export default function GroupByExample() {
  const [groupRenderStrategy, setGroupRenderStrategy] =
    useState<InfiniteTablePropGroupRenderStrategy>('inline');

  const [hideEmptyGroupColumns, setHide] = useState(true);
  return (
    <div style={{ fontSize: 16 }}>
      <p style={{ padding: 10 }}>
        Choose group render strategy:
        <div style={{ display: 'flex', flexFlow: 'column' }}>
          {groupOptions.map((option) => {
            return (
              <label key={option} style={{ padding: 5 }}>
                <input
                  onChange={(event) => {
                    const groupRenderStrategy = event.target
                      .value as any as InfiniteTablePropGroupRenderStrategy;
                    setGroupRenderStrategy(groupRenderStrategy);

                    setHide(
                      groupRenderStrategy === 'single-column'
                        ? false
                        : hideEmptyGroupColumns,
                    );
                  }}
                  style={{ marginRight: 10 }}
                  type="radio"
                  name="groupRenderStrategy"
                  value={option}
                  checked={groupRenderStrategy === option}
                />
                {option}
              </label>
            );
          })}
        </div>
      </p>
      <p style={{ padding: 10 }}>
        Hide empty group columns:{' '}
        <input
          disabled={groupRenderStrategy === 'single-column'}
          type="checkbox"
          checked={hideEmptyGroupColumns}
          onChange={() => {
            setHide(!hideEmptyGroupColumns);
          }}
        />
      </p>
      <DataSource<Person>
        primaryKey="id"
        data={data}
        groupRowsBy={groupRowsBy}
        defaultGroupRowsState={groupRowsState}
      >
        <InfiniteTable<Person>
          domProps={domProps}
          columns={columns}
          pivotTotalColumnPosition={'start'}
          columnDefaultWidth={250}
          groupColumn={groupColumn}
          hideEmptyGroupColumns={hideEmptyGroupColumns}
          groupRenderStrategy={groupRenderStrategy}
          columnAggregations={columnAggregations}
        ></InfiniteTable>
      </DataSource>
    </div>
  );
}

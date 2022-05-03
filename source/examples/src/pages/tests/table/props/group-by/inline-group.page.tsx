import {
  InfiniteTable,
  DataSource,
  DataSourceGroupBy,
  InfiniteTableColumnAggregator,
  InfiniteTablePropColumns,
  InfiniteTableColumn,
  GroupRowsState,
  InfiniteTablePropGroupRenderStrategy,
  InfiniteTableColumnSizingOptions,
  DataSourcePropAggregationReducers,
} from '@infinite-table/infinite-react';
import * as React from 'react';
import { useState } from 'react';

import { Person, data } from './pivotData';

const domProps = {
  style: {
    height: '60vh',
    border: '1px solid gray',
    width: 'calc(100% - 20px)',
    marginLeft: 10,
  },
};

const formatter = new Intl.NumberFormat();
const groupBy: DataSourceGroupBy<Person>[] = [
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

const reducers: DataSourcePropAggregationReducers<Person> = {
  salary: { field: 'salary', ...sumReducer },
};

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
  collapsedRows: [['it', 'components']],

  expandedRows: true,
});

const groupOptions: InfiniteTablePropGroupRenderStrategy[] = [
  'inline',
  'multi-column',
  'single-column',
];

export default function GroupByExample() {
  const [groupRenderStrategy, setGroupRenderStrategy] =
    useState<InfiniteTablePropGroupRenderStrategy>('single-column');

  const [hideEmptyGroupColumns, setHide] = useState(true);

  // TODO add renderValue for each column, for easy override
  const columns = React.useMemo(() => {
    const columns: InfiniteTablePropColumns<Person> = new Map<
      string,
      InfiniteTableColumn<Person>
    >([
      [
        'department',
        {
          field: 'department',
          valueGetter:
            groupRenderStrategy === 'inline'
              ? ({ rowInfo }) => {
                  if (!rowInfo.isGroupRow) {
                    return null;
                  }
                  const { groupBy, parents } = rowInfo;

                  const groupData =
                    parents?.[groupBy?.indexOf('department') ?? -1] || rowInfo;

                  return `${groupData?.value} (${
                    groupData?.groupCount
                  }), total ${' '} ${formatter.format(
                    groupData?.reducerResults?.salary as any as number,
                  )}`;
                }
              : undefined,
        },
      ],
      [
        'team',
        {
          field: 'team',
        },
      ],
      ['id', { field: 'id' }],
      ['name', { field: 'name' }],
      ['country', { field: 'country' }],
      [
        'salary',
        {
          field: 'salary',

          render: ({ value }) =>
            value ? `$ ${formatter.format(value as any as number)}` : null,
        },
      ],
    ]);
    return columns;
  }, [groupRenderStrategy]);

  const defaultColumnSizing = React.useMemo<
    Record<string, InfiniteTableColumnSizingOptions>
  >(
    () => ({
      id: { width: 70 },
      name: { width: 100 },
      country: { width: 120 },
    }),
    [],
  );

  return (
    <div style={{ fontSize: 16 }}>
      <p style={{ padding: 10 }}>
        Choose group render strategy:
        <div
          style={{
            display: 'flex',
            flexFlow: 'column',
            alignItems: 'flex-start',
          }}
        >
          {groupOptions.map((option) => {
            return (
              <label key={option} style={{ padding: 5, cursor: 'pointer' }}>
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
        groupBy={groupBy}
        defaultGroupRowsState={groupRowsState}
        aggregationReducers={reducers}
      >
        <InfiniteTable<Person>
          domProps={domProps}
          columns={columns}
          defaultColumnSizing={defaultColumnSizing}
          columnDefaultWidth={280}
          groupColumn={groupColumn}
          hideEmptyGroupColumns={hideEmptyGroupColumns}
          groupRenderStrategy={groupRenderStrategy}
        ></InfiniteTable>
      </DataSource>
    </div>
  );
}

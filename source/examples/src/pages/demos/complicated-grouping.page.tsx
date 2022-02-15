import {
  DataSource,
  DataSourceGroupBy,
  DataSourcePropAggregationReducers,
  GroupRowsState,
  InfiniteTable,
  InfiniteTableColumnRenderParam,
  InfiniteTableGroupColumnBase,
  InfiniteTableGroupColumnGetterOptions,
  InfiniteTableColumn,
  InfiniteTablePropColumnVisibility,
} from '@infinite-table/infinite-react';

// import {InfiniteTablePropColumnVisibility} from  'components/src/....';

import * as React from 'react';

type Transaction = {
  id: number;
  type: 'Pending' | 'Done';
  subType: 'Cash' | 'Non Cash' | number;
  month?: number;
  day?: number;
  EUR?: number;
  USD?: number;
  total: number;
};
const dataSource = () => {
  return Promise.resolve(
    [
      { type: 'Pending', subType: 'Cash', EUR: 1000, USD: 500, total: 1400 },
      {
        type: 'Pending',
        subType: 'Non Cash',
        EUR: 2000,
        USD: 1000,
        total: 2800,
      },
      { type: 'Done', subType: 2022, month: 1, day: 10, EUR: 200, total: 200 },
      { type: 'Done', subType: 2021, month: 12, day: 25, EUR: 100, total: 100 },
      { type: 'Done', subType: 2021, month: 12, day: 12, USD: 50, total: 40 },
      {
        type: 'Done',
        subType: 2021,
        month: 11,
        day: 20,
        EUR: 100,
        USD: 50,
        total: 140,
      },
    ].map((d, i) => ({ ...d, id: i })) as Transaction[],
  );
};

const sumReducer = {
  initialValue: 0,
  reducer: (acc: number, sum: number) => (sum !== undefined ? acc + sum : acc),
  done: (value: number, arr: any[]) => (arr.length ? value : 0),
};
const aggregationReducers: DataSourcePropAggregationReducers<Transaction> = {
  EUR: {
    field: 'EUR',
    ...sumReducer,
  },
  USD: {
    field: 'USD',
    ...sumReducer,
  },
  total: {
    field: 'total',
    ...sumReducer,
  },
};

const allColumns: Record<string, InfiniteTableColumn<Transaction>> = {
  id: { field: 'id', defaultFlex: 1 },
  type: {
    field: 'type',
    header: 'Type',

    defaultHiddenWhenGroupedBy: true,
    defaultFlex: 1,
  },
  subType: {
    field: 'subType',
    header: 'SubType',
    defaultHiddenWhenGroupedBy: true,
    defaultFlex: 1,
  },
  month: {
    field: 'month',
    header: 'Month',
    type: 'number',
    defaultHiddenWhenGroupedBy: true, //{ day: true, month: true },
    defaultFlex: 1,
  },
  day: {
    field: 'day',
    header: 'Day',
    type: 'number',
    defaultHiddenWhenGroupedBy: true,
    defaultFlex: 1,
  },

  EUR: {
    field: 'EUR',
    type: 'number',
    defaultFlex: 1,
  },
  USD: {
    field: 'USD',
    type: 'number',
    defaultFlex: 1,
    render: ({ value, toggleCurrentGroupRow }) => {
      return (
        <>
          {value}
          <button onClick={toggleCurrentGroupRow}>Toggle</button>
        </>
      );
    },
  },
  total: {
    field: 'total',
    header: 'Total (EUR)',
    type: 'number',
    defaultFlex: 1,
  },
};

const createGroupColumn =
  (manageUnbalancedGroup: boolean = false) =>
  (arg: InfiniteTableGroupColumnGetterOptions<Transaction>) => {
    if (arg.groupByForColumn?.field === 'subType' && manageUnbalancedGroup) {
      return {
        renderGroupIcon(param) {
          const { rowInfo, groupBy, groupIcon } = param;

          if (rowInfo.isGroupRow) {
            const nextGroupBy = groupBy[rowInfo.groupBy?.length || 0];
            const nextDataDefined = rowInfo.groupData?.[0][nextGroupBy.field];

            return nextDataDefined ? groupIcon : null;
          }

          return <>{groupIcon}</>;
        },
      } as InfiniteTableGroupColumnBase<Transaction>;
    }

    if (arg.groupByForColumn?.field === 'day') {
      return {
        render(param: InfiniteTableColumnRenderParam<Transaction>) {
          const { value, rowInfo } = param;
          if (
            rowInfo.isGroupRow &&
            rowInfo.groupBy?.length !== rowInfo.rootGroupBy?.length
          ) {
            return null;
          }
          return <>{value}</>;
        },
      } as Partial<InfiniteTableGroupColumnBase<Transaction>>;
    }
    return arg.groupByForColumn;
  };

const defaultGroupRowsState = new GroupRowsState({
  collapsedRows: true,
  expandedRows: [],
});

defaultGroupRowsState.expandGroupRow(['Pending']);
defaultGroupRowsState.expandGroupRow(['Done']);
defaultGroupRowsState.expandGroupRow(['Done', 2022]);

const domProps = {
  style: {
    height: '90vw',
  },
};

const groupFields = ['type', 'subType', 'month', 'day'];
export default function App() {
  const [unbalancedGroup, setUnbalancedGroup] = React.useState(true);
  const groupBy: DataSourceGroupBy<Transaction>[] = React.useMemo(
    () =>
      groupFields.map((f: any) => ({
        field: f,
        column: (allColumns as any)[f],
      })),
    [],
  );

  const columnVisibility = React.useMemo(() => {
    return groupBy.reduce((visibility, groupByItem) => {
      visibility[groupByItem.field] = false;

      return visibility;
    }, {} as InfiniteTablePropColumnVisibility);
  }, [groupBy]);

  const onColumnVisibilityChange = React.useCallback((columnVisibility) => {},
  []);

  const groupColumn = React.useMemo(
    () => createGroupColumn(unbalancedGroup),
    [unbalancedGroup],
  );
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: '0 0 auto' }}>
        <input
          id="unbalancedGroupInput"
          type="checkbox"
          checked={unbalancedGroup}
          onChange={() => setUnbalancedGroup(!unbalancedGroup)}
        />
        <label htmlFor="unbalancedGroupInput">Unbalanced Group</label>
      </div>
      {/* grouped data */}
      <DataSource<Transaction>
        data={dataSource}
        primaryKey="id"
        defaultGroupRowsState={defaultGroupRowsState}
        aggregationReducers={aggregationReducers}
        groupBy={groupBy}
      >
        <InfiniteTable<Transaction>
          domProps={domProps}
          // columnVisibility={columnVisibility}
          // onColumnVisibilityChange={onColumnVisibilityChange}
          groupRenderStrategy="multi-column"
          groupColumn={groupColumn}
          columns={allColumns}
          columnDefaultWidth={100}
          hideEmptyGroupColumns={true}
        />
      </DataSource>
    </div>
  );
}

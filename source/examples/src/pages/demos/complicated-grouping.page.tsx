import {
  DataSource,
  DataSourceGroupBy,
  DataSourcePropAggregationReducers,
  GroupRowsState,
  InfiniteTable,
  InfiniteTableColumnRenderParam,
  InfiniteTableGroupColumnBase,
  InfiniteTableGroupColumnGetterOptions,
} from '@infinite-table/infinite-react';
// import { pickBy } from 'lodash';
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

const domProps = {
  style: { height: '80vh' },
};

// type ColDef = InfiniteTablePropColumnSizing & InfiniteTablePropColumns<Transaction>;
const allColumns = {
  id: { field: 'id', defaultFlex: 1 },
  type: {
    field: 'type',
    header: 'Type',
    defaultHiddenWhenGrouped: true,
    defaultFlex: 1,
  },
  subType: {
    field: 'subType',
    header: 'SubType',
    defaultHiddenWhenGrouped: true,
    defaultFlex: 1,
  },
  month: {
    field: 'month',
    header: 'Month',
    type: 'number',
    defaultHiddenWhenGrouped: true,
    defaultFlex: 1,
  },
  day: {
    field: 'day',
    header: 'Day',
    type: 'number',
    defaultHiddenWhenGrouped: true,
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
  },
  total: {
    field: 'total',
    header: 'Total (EUR)',
    type: 'number',
    defaultFlex: 1,
  },
};

// TODO remove this after the next release
//@ts-ignore
const createGroupColumn =
  (manageUnbalancedGroup: boolean = false) =>
  (arg: InfiniteTableGroupColumnGetterOptions<Transaction>) => {
    // For sub type column, it should:
    //  - not display children if sub groups have undefined values = "unbalanced groups" (month & day in this sample) | at worst based on type's value === "Pending"
    //  - not display group expand / Collapse for these groups
    //  - display as group when value is numeric = year
    if (arg.groupByForColumn?.field === 'subType' && manageUnbalancedGroup) {
      return {
        ...arg.groupByForColumn,
        render(param: InfiniteTableColumnRenderParam<Transaction>) {
          const { value, rowInfo } = param;
          console.log('Group Column subType render', arg, param);
          //   //   // if (rowInfo.groupData.type === "Pending") {
          //   //   //   return value;
          //   //   // }
          //   //   return value;

          if (rowInfo.isGroupRow && rowInfo.groupCount === 1) {
            // How can we toggle / collapsed all the children if defaultGroupRowsState is expanded
            //     if (!rowInfo.collapsed && rowInfo.groupKeys) {
            //       setTimeout(() => param.toggleGroupRow(rowInfo.groupKeys ?? []), 0);
            //     }
            return value === undefined ? null : value;
          }

          // How can we render as the default renderer for group ? i.e. value & collapse / expand icon when on the rowGroup (not on others)
          // and how can we use the renderer of the column if any for displaying the value ?
          // return param.column.render?.(param); // loop ?
          return arg.groupByForColumn?.column?.render?.(param) ?? value;
          //return value;
        },
      } as InfiniteTableGroupColumnBase<Transaction>;
    }

    // hide last level to only show relevant aggregation
    if (arg.groupByForColumn?.field === 'day') {
      return {
        render(param: InfiniteTableColumnRenderParam<Transaction>) {
          const { value, rowInfo } = param;
          if (
            rowInfo.isGroupRow &&
            rowInfo.groupBy?.length !== rowInfo.rootGroupBy?.length
          ) {
            // we are on a group row that is the last grouping level
            return null;
          }
          return value;
        },
      } as Partial<InfiniteTableGroupColumnBase<Transaction>>;
    }
    return arg.groupByForColumn;
  };

const defaultGroupRowsState = new GroupRowsState({
  collapsedRows: [],
  expandedRows: true,
});

const groupFields = ['type', 'subType', 'month', 'day'];
export default function App() {
  const [unbalancedGroup, setUnbalancedGroup] = React.useState(false);
  const groupBy: DataSourceGroupBy<Transaction>[] = React.useMemo(
    () =>
      groupFields.map((f: any) => ({
        field: f,
      })),
    [],
  );
  // const groupColumn = React.useMemo(
  //   () => createGroupColumn(unbalancedGroup),
  //   [unbalancedGroup],
  // );
  // // Workaround issue with defaultHiddenWhenGrouped
  // const columns = React.useMemo(
  //   () => pickBy(allColumns, (c) => c.field && !groupFields.includes(c.field)),
  //   [],
  // );
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
          groupRenderStrategy="multi-column"
          //@ts-ignore
          columns={allColumns}
          columnDefaultWidth={200}
          columnMinWidth={200}
          hideEmptyGroupColumns={true}
        />
      </DataSource>
      {/* raw data 
      <DataSource<Transaction> data={dataSource} primaryKey="id">
        <InfiniteTable<Transaction>
          columns={allColumns}
          columnDefaultWidth={100}
          columnSizing={allColumns}
        />
      </DataSource>
      */}
    </div>
  );
}

import type {
  DataSourceGroupBy,
  DataSourcePivotBy,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import {
  DataSource,
  DataSourceData,
  DataSourcePropAggregationReducers,
  GroupRowsState,
  InfiniteTable,
  InfiniteTablePropColumnPinning,
} from '@infinite-table/infinite-react';
import { InfiniteTable_HasGrouping_RowInfoGroup } from '@infinite-table/infinite-react/utils/groupAndPivot';

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

const DATA_SOURCE_SIZE = '10k';

const dataSource: DataSourceData<Developer> = ({
  pivotBy,
  aggregationReducers,
  groupBy,

  groupKeys = [],
  lazyLoadStartIndex: skip = 0,
  lazyLoadBatchSize: take = 5,
}) => {
  const args = [
    pivotBy
      ? 'pivotBy=' + JSON.stringify(pivotBy.map((p) => ({ field: p.field })))
      : null,
    `groupKeys=${JSON.stringify(groupKeys)}`,
    groupBy
      ? 'groupBy=' + JSON.stringify(groupBy.map((p) => ({ field: p.field })))
      : null,
    aggregationReducers
      ? 'reducers=' +
        JSON.stringify(
          Object.keys(aggregationReducers).map((key) => ({
            field: aggregationReducers[key].field,
            id: key,
            name: aggregationReducers[key].reducer,
          })),
        )
      : null,
    `start=${skip}`,
    `limit=${take}`,
  ]
    .filter(Boolean)
    .join('&');

  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL +
      `/developers${DATA_SOURCE_SIZE}-sql?` +
      args,
  )
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const aggregationReducers: DataSourcePropAggregationReducers<Developer> = {
  salary: {
    // the aggregation name will be used as the column header
    name: 'Salary (avg)',
    field: 'salary',
    reducer: 'avg',
  },
  age: {
    name: 'Age (avg)',
    field: 'age',
    reducer: 'avg',
  },
};
const GroupIconRenderer = ({
  toggleCurrentGroupRow,
  rowInfo,
}: {
  toggleCurrentGroupRow: Function;
  rowInfo: InfiniteTable_HasGrouping_RowInfoGroup<Developer>;
}) => {
  const handleToggle = React.useCallback(
    () => toggleCurrentGroupRow(),
    [toggleCurrentGroupRow],
  );

  // NOTE: Workaround is to change onClick by onClick={() => toggleCurrentGroupRow()} in this use case
  return (
    <div style={{ display: 'flex' }} onClick={handleToggle}>
      {rowInfo.collapsed ? '>' : 'v'}&nbsp;
    </div>
  );
};

const columns: InfiniteTablePropColumns<Developer> = {
  preferredLanguage: { field: 'preferredLanguage' },
  age: { field: 'age' },

  salary: {
    field: 'salary',
    type: 'number',
  },
  canDesign: { field: 'canDesign' },
  country: { field: 'country' },
  firstName: { field: 'firstName' },
  stack: { field: 'stack' },
  id: { field: 'id' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  currency: { field: 'currency' },
};

// make the row labels column (id: 'labels') be pinned
const defaultColumnPinning: InfiniteTablePropColumnPinning = {
  // make the generated group columns pinned to start
  'group-by-country': 'start',
  'group-by-stack': 'start',
};

// make all rows collapsed by default
const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

const domProps = {
  style: {
    height: '80vh',
  },
};

export default function RemotePivotExample() {
  const groupBy: DataSourceGroupBy<Developer>[] = React.useMemo(
    () => [
      {
        field: 'country',
        column: {
          // give the group column for the country prop a custom id
          id: 'group-by-country',
          renderGroupIcon: ({ toggleCurrentGroupRow, rowInfo }) => (
            <GroupIconRenderer {...{ toggleCurrentGroupRow, rowInfo }} />
          ),
        },
      },
      {
        field: 'city',
        column: {
          // give the group column for the city prop a custom id
          id: 'group-by-city',
          renderGroupIcon: GroupIconRenderer,
          // renderGroupIcon: ({ toggleCurrentGroupRow, collapsed }) => (
          //   <GroupIconRenderer {...{ toggleCurrentGroupRow, collapsed }} />
          // ),
        },
      },
      {
        field: 'stack',
        column: {
          // give the group column for the stack prop a custom id
          id: 'group-by-stack',
          // renderGroupIcon: GroupIconRenderer,
          renderGroupIcon: ({ toggleCurrentGroupRow, rowInfo }) => (
            <GroupIconRenderer {...{ toggleCurrentGroupRow, rowInfo }} />
          ),
        },
      },
    ],
    [],
  );

  const pivotBy: DataSourcePivotBy<Developer>[] = React.useMemo(
    () => [
      { field: 'preferredLanguage' },
      {
        field: 'canDesign',
        // customize the column group
        columnGroup: ({ columnGroup }) => {
          return {
            ...columnGroup,
            header: `${
              columnGroup.pivotGroupKey === 'yes' ? 'Designer' : 'Non-designer'
            }`,
          };
        },
        // customize columns generated under this column group
        column: ({ column }) => ({
          ...column,
          header: `🎉 ${column.header}`,
        }),
      },
    ],
    [],
  );

  return (
    <DataSource<Developer>
      primaryKey="id"
      data={dataSource}
      groupBy={groupBy}
      pivotBy={pivotBy}
      aggregationReducers={aggregationReducers}
      defaultGroupRowsState={groupRowsState}
      lazyLoad={{ batchSize: 5 }}
    >
      {({ pivotColumns, pivotColumnGroups }) => {
        return (
          <InfiniteTable<Developer>
            domProps={domProps}
            defaultColumnPinning={defaultColumnPinning}
            columns={columns}
            hideEmptyGroupColumns
            // groupColumn={groupColumn}
            pivotColumns={pivotColumns}
            pivotColumnGroups={pivotColumnGroups}
            columnDefaultWidth={220}
          />
        );
      }}
    </DataSource>
  );
}

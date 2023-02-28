import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
  DataSourcePropAggregationReducers,
  InfiniteTablePropColumnTypes,
  DataSourceData,
} from '@infinite-table/infinite-react';
import type {
  InfiniteTablePropColumns,
  InfiniteTableProps,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import { Settings as CSettings } from './Settings';
import { Developer, GroupByDeveloperType, PivotByDeveloperType } from './types';

const aggregationReducers: DataSourcePropAggregationReducers<Developer> = {
  salary: {
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

const dataSource: DataSourceData<Developer> = ({
  pivotBy,
  aggregationReducers,
  groupBy,

  lazyLoadStartIndex,
  lazyLoadBatchSize,
  groupKeys = [],
  sortInfo,
}) => {
  if (sortInfo && !Array.isArray(sortInfo)) {
    sortInfo = [sortInfo];
  }
  const startLimit: string[] = [];
  if (lazyLoadBatchSize && lazyLoadBatchSize > 0) {
    const start = lazyLoadStartIndex || 0;
    startLimit.push(`start=${start}`);
    startLimit.push(`limit=${lazyLoadBatchSize}`);
  }
  const args = [
    ...startLimit,
    pivotBy
      ? 'pivotBy=' + JSON.stringify(pivotBy.map((p) => ({ field: p.field })))
      : null,
    `groupKeys=${JSON.stringify(groupKeys)}`,
    groupBy
      ? 'groupBy=' + JSON.stringify(groupBy.map((p) => ({ field: p.field })))
      : null,
    sortInfo
      ? 'sortInfo=' +
        JSON.stringify(
          sortInfo.map((s) => ({
            field: s.field,
            dir: s.dir,
          })),
        )
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
  ]
    .filter(Boolean)
    .join('&');

  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + `/developers30k-sql?` + args,
  ).then((r) => r.json());
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
  country: { field: 'country' },
  canDesign: { field: 'canDesign' },
  hobby: { field: 'hobby' },
  city: { field: 'city' },
  age: { field: 'age', type: ['number'] },
  salary: {
    field: 'salary',
    type: ['number', 'currency'],
  },
  currency: { field: 'currency' },
};

const numberFormatter = new Intl.NumberFormat();
const columnTypes: InfiniteTablePropColumnTypes<Developer> = {
  number: {
    renderValue: ({ value }) => numberFormatter.format(value as number),
  },
  currency: {
    renderValue: (param) => {
      const { value, data } = param;
      return `${numberFormatter.format(value as number)} ${
        data?.currency ?? ''
      }`;
    },
  },
  default: {
    style: {},
  },
};

// Groupings
const defaultGroupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

// Style functions
const getRowStyle: InfiniteTableProps<Developer>['rowStyle'] = ({ data }) => {
  if (data?.canDesign === 'yes') {
    return {
      borderBottom: '1px dotted var(--infinite-cell-color)',
    };
  }

  return {};
};

// COMPONENTS
const defaultColumnPinning: InfiniteTableProps<any>['columnPinning'] = {
  'group-by': true,
};

export default function GroupByExample() {
  const [groupBy, setGroupBy] = React.useState<GroupByDeveloperType>([
    {
      field: 'country',
    },
    { field: 'city' },
  ]);
  const [pivotEnabled, setPivotEnabled] = React.useState(true);
  const [pivotBy, setPivotBy] = React.useState<PivotByDeveloperType>([
    {
      field: 'preferredLanguage',
    },
    {
      field: 'canDesign',
    },
  ]);
  const [backgroundColor, setBackgroundColor] = React.useState<string>('');

  const preparedDataSource = React.useMemo(
    () => (dataSource as Function).bind(null),
    [pivotBy, groupBy],
  );

  /**
   * Forces a rerender when color changes
   */
  const preparedColumnTypes = React.useMemo<
    InfiniteTablePropColumnTypes<Developer>
  >(
    () => ({
      ...columnTypes,
      default: {
        style: (params) => {
          if (params.column.field === 'preferredLanguage') {
            return {
              backgroundColor,
            };
          }
          return {};
        },
      },
    }),
    [backgroundColor],
  );
  return (
    <>
      <CSettings
        onGroupChange={setGroupBy}
        onPivotChange={setPivotBy}
        onColorChange={setBackgroundColor}
        groupBy={groupBy}
        pivotBy={pivotBy}
        pivotEnabled={pivotEnabled}
        onPivotEnableChange={setPivotEnabled}
      />

      <DataSource<Developer>
        primaryKey="id"
        lazyLoad
        data={preparedDataSource}
        groupBy={groupBy}
        pivotBy={pivotEnabled ? pivotBy : undefined}
        aggregationReducers={aggregationReducers}
        defaultGroupRowsState={defaultGroupRowsState}
      >
        {({ pivotColumns, pivotColumnGroups }) => {
          return (
            <InfiniteTable<Developer>
              columns={columns}
              columnPinning={defaultColumnPinning}
              columnTypes={preparedColumnTypes}
              pivotColumns={pivotColumns}
              pivotColumnGroups={pivotColumnGroups}
              pivotTotalColumnPosition="end"
              rowStyle={getRowStyle}
            />
          );
        }}
      </DataSource>
    </>
  );
}

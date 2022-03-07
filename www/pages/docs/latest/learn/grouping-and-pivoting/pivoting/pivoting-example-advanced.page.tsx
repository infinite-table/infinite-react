import * as React from 'react';
import Select from 'react-select';

import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
  DataSourcePropAggregationReducers,
  InfiniteTablePropColumnTypes,
} from '@infinite-table/infinite-react';

import type {
  InfiniteTableColumn,
  InfiniteTableColumnAggregator,
  InfiniteTablePropColumns,
  DataSourceGroupBy,
  DataSourcePivotBy,
} from '@infinite-table/infinite-react';

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
  streetName: string;
  streetNo: number;
  streetPrefix: string;
};

type GroupByDeveloperType = DataSourceGroupBy<Developer>[];
type PivotByDeveloperType = DataSourcePivotBy<Developer>[];

const dataSource = () => {
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + '/developers100'
  )
    .then((r) => r.json())
    .then((data: Developer[]) => data)
    .then(
      (data) =>
        new Promise<Developer[]>((resolve) => {
          setTimeout(() => resolve(data), 1000);
        })
    );
};

const columns: InfiniteTablePropColumns<Developer> =
  new Map<string, InfiniteTableColumn<Developer>>([
    ['id', { field: 'id' }],
    ['firstName', { field: 'firstName' }],
    ['preferredLanguage', { field: 'preferredLanguage' }],
    ['stack', { field: 'stack' }],
    ['country', { field: 'country' }],
    ['canDesign', { field: 'canDesign' }],
    ['hobby', { field: 'hobby' }],
    ['city', { field: 'city' }],
    ['age', { field: 'age' }],
    ['salary', { field: 'salary', type: 'number' }],
    ['currency', { field: 'currency' }],
  ]);

const columnTypes: InfiniteTablePropColumnTypes<
  InfiniteTableColumn<Developer>
> = {
  default: {},
};

const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

const groupedColumnDef: DataSourceGroupBy<Developer>['column'] =
  {
    style: {
      color: 'red',
    },
  };

const avgReducer: InfiniteTableColumnAggregator<
  Developer,
  any
> = {
  initialValue: 0,
  field: 'salary',
  reducer: (acc, sum) => acc + sum,
  done: (sum, arr) => (arr.length ? sum / arr.length : 0),
};

const maxReducer: InfiniteTableColumnAggregator<
  Developer,
  any
> = {
  initialValue: -Infinity,
  field: 'salary',
  reducer: (acc, next) => (acc < next ? next : acc),
  done: (max) => max,
};

const minReducer: InfiniteTableColumnAggregator<
  Developer,
  any
> = {
  initialValue: Infinity,
  field: 'salary',
  reducer: (acc, next) => (acc > next ? next : acc),
  done: (min) => min,
};

const selectStyles = {
  option: () => ({
    color: 'black',
  }),
};

type ReducerOptions = 'min' | 'max' | 'avg';
const Settings: React.FunctionComponent<{
  groupBy: GroupByDeveloperType;
  pivotBy: PivotByDeveloperType;
  reducerKey: ReducerOptions;
  onReducerKeyChange: (reducerKey: ReducerOptions) => void;
  onGroupChange: (groupBy: GroupByDeveloperType) => void;
  onPivotChange: (pivotBy: PivotByDeveloperType) => void;
}> = ({
  groupBy,
  pivotBy,
  reducerKey,
  onGroupChange,
  onPivotChange,
  onReducerKeyChange,
}) => {
  const allGroupOptions = [
    { value: 'country', label: 'country' },
    { value: 'stack', label: 'stack' },
    {
      value: 'preferredLanguage',
      label: 'preferredLanguage',
    },
    { value: 'hobby', label: 'hobby' },
    { value: 'city', label: 'city' },
    { value: 'currency', label: 'currency' },
  ];

  const allPivotOptions = [
    { value: 'country', label: 'country' },
    { value: 'canDesign', label: 'canDesign' },
    { value: 'city', label: 'city' },
    {
      value: 'preferredLanguage',
      label: 'preferredLanguage',
    },
    { value: 'hobby', label: 'hobby' },
    { value: 'age', label: 'age' },
  ];

  const reducerKeyOptions = [
    { value: 'min', label: 'Min' },
    { value: 'max', label: 'Max' },
    { value: 'avg', label: 'Avg' },
  ];

  const groupByValue = allGroupOptions.filter((option) =>
    groupBy.some((group) => group.field === option.value)
  );

  return (
    <div style={{ zIndex: 3000, maxWidth: 600 }}>
      <div>
        <b>Group By:</b>
        <label>
          <Select
            value={groupByValue}
            styles={selectStyles}
            isMulti
            isClearable
            isSearchable
            options={allGroupOptions}
            onChange={(options) => {
              onGroupChange(
                options.map((option) => ({
                  field: option.value as keyof Developer,
                }))
              );
            }}
          />
        </label>
      </div>
      <div>
        <b>Pivot By:</b>
        <label>
          <Select
            styles={selectStyles}
            isMulti
            isClearable
            isSearchable
            options={allPivotOptions}
            value={allPivotOptions.filter((option) =>
              pivotBy.some(
                (pivot) => pivot.field === option.value
              )
            )}
            onChange={(newOptions) =>
              onPivotChange(
                newOptions.map((option) => ({
                  field: option.value as keyof Developer,
                }))
              )
            }
          />
        </label>
      </div>
      <div>
        <label style={{ zIndex: 3000 }}>
          <b>Select aggregation function:</b>
          <Select
            styles={selectStyles}
            value={reducerKeyOptions.find(
              (option) => option.value === reducerKey
            )}
            onChange={(option) =>
              onReducerKeyChange(
                option?.value as ReducerOptions
              )
            }
            options={reducerKeyOptions}
          />
        </label>
      </div>
    </div>
  );
};

export default function GroupByExample() {
  const [groupBy, setGroupBy] =
    React.useState<GroupByDeveloperType>([
      {
        field: 'preferredLanguage',
      },
      { field: 'stack' },
    ]);
  const [pivotBy, setPivotBy] =
    React.useState<PivotByDeveloperType>([
      { field: 'country' },
      {
        field: 'canDesign',
      },
    ]);

  const [reducerKey, setReducerKey] =
    React.useState<ReducerOptions>('avg');

  const reducerMap = {
    avg: avgReducer,
    max: maxReducer,
    min: minReducer,
  };

  const reducers: DataSourcePropAggregationReducers<Developer> =
    {
      default: reducerMap[reducerKey],
    };

  const preparedGroupBy = groupBy.map((group) => ({
    ...group,
    column: () => ({
      style: {
        color: 'red',
      },
    }),
  }));
  const preparedPivotBy = pivotBy.map((pivot) => ({
    ...pivot,
    column: {
      style: {
        color: 'red',
      },
    },
  }));

  return (
    <>
      <Settings
        onGroupChange={setGroupBy}
        onPivotChange={setPivotBy}
        onReducerKeyChange={setReducerKey}
        groupBy={preparedGroupBy}
        pivotBy={preparedPivotBy}
        reducerKey={reducerKey}
      />

      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        groupBy={preparedGroupBy}
        pivotBy={pivotBy}
        aggregationReducers={reducers}
        defaultGroupRowsState={groupRowsState}>
        {({ pivotColumns, pivotColumnGroups }) => {
          return (
            <InfiniteTable<Developer>
              columns={columns}
              columnTypes={columnTypes}
              pivotColumns={pivotColumns}
              pivotColumnGroups={pivotColumnGroups}
              pivotTotalColumnPosition="end"
            />
          );
        }}
      </DataSource>
    </>
  );
}

import * as React from 'react';
import Select, { Props as SelectProps } from 'react-select';

import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
  DataSourcePropAggregationReducers,
  InfiniteTablePropColumnTypes,
  InfiniteTablePivotColumn,
} from '@infinite-table/infinite-react';

import type {
  InfiniteTableColumn,
  InfiniteTableColumnAggregator,
  InfiniteTablePropColumns,
  DataSourceGroupBy,
  DataSourcePivotBy,
  InfiniteTableProps,
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
    ['age', { field: 'age', type: ['number'] }],
    [
      'salary',
      { field: 'salary', type: ['number', 'currency'] },
    ],
    ['currency', { field: 'currency' }],
  ]);

function numberWithCommas(x: number) {
  if (isNaN(x) || typeof x !== 'number') {
    return '';
  }
  return x
    ?.toString?.()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const columnTypes: InfiniteTablePropColumnTypes<Developer> =
  {
    number: {
      renderValue: ({ value }) =>
        numberWithCommas(value as number),
    },
    currency: {
      renderValue: (param) => {
        const { value, data, column } = param;
        // const columnType = column.type;
        // if (!Array.isArray(column.type)) {
        //   return '...';
        // }
        // column.type.reduce((acc, type) => {
        //   param.value = acc;
        //   if (type === 'currency') {
        //     return acc;
        //   }
        //   acc = columnTypes[type].renderValue(param);
        //   return acc;
        // }, value);

        return `${value} ${data?.currency ?? ''}`;
      },
    },
    default: {
      style: {
        color: 'red',
      },
    },
  };

//  Column modifiers

const getPivotColumn = (
  column: InfiniteTableColumn<Developer>
): Partial<InfiniteTablePivotColumn<Developer>> => {
  return {
    ...column,
    style: (params) => {
      if (typeof params.value === 'number') {
        return {
          fontStyle: 'italic',
        };
      }
    },
  };
};

const getGroupColumn = (
  column: InfiniteTableColumn<Developer>
): Partial<InfiniteTableColumn<Developer>> => {
  return {
    style: {
      color: 'red',
    },
  };
};

const groupColumn = {
  style: {
    color: 'red',
  },
};

// Groupings

const groupRowsState = new GroupRowsState({
  expandedRows: [],
  collapsedRows: true,
});

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

// Style functions

const getRowStyle: InfiniteTableProps<Developer>['rowStyle'] =
  ({ data }) => {
    if (data?.canDesign === 'yes') {
      return {
        borderBottom:
          '1px dotted var(--infinite-row-color)',
      };
    }

    return {};
  };

// React-Select Props

const selectProps: SelectProps = {
  menuPosition: 'fixed',
  styles: {
    container: () => ({
      flex: 1,
    }),
    option: () => ({
      color: 'black',
    }),
  },
};

// COMPONENTS

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
    <div
      style={{
        zIndex: 3000,
        marginBottom: 10,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gridGap: 20,
        padding: 20,
      }}>
      <div>
        <b>Group By:</b>
        <label>
          <Select
            {...selectProps}
            value={groupByValue}
            isMulti
            isClearable
            isSearchable
            options={allGroupOptions}
            onChange={(options) => {
              onGroupChange(
                (options as typeof allGroupOptions).map(
                  (option) => ({
                    field: option.value as keyof Developer,
                  })
                )
              );
            }}
          />
        </label>
      </div>
      <div>
        <b>Pivot By:</b>
        <label>
          <Select
            {...selectProps}
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
                (newOptions as typeof allPivotOptions).map(
                  (option) => ({
                    field: option.value as keyof Developer,
                  })
                )
              )
            }
          />
        </label>
      </div>
      <div>
        <label style={{ zIndex: 3000 }}>
          <b>Select aggregation function:</b>
          <Select
            {...selectProps}
            value={reducerKeyOptions.find(
              (option) => option.value === reducerKey
            )}
            onChange={(option) =>
              onReducerKeyChange(
                (option as typeof reducerKeyOptions[0])
                  ?.value as ReducerOptions
              )
            }
            options={reducerKeyOptions}
          />
        </label>
      </div>
      <div>
        Select Pivoted Columns Background:
        <input type="color" />
      </div>
    </div>
  );
};

export default function GroupByExample() {
  const [groupBy, setGroupBy] =
    React.useState<GroupByDeveloperType>([]);
  const [pivotBy, setPivotBy] =
    React.useState<PivotByDeveloperType>([]);

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
    column: groupColumn,
  })) as GroupByDeveloperType;

  const preparedPivotBy = pivotBy.map((pivot) => ({
    ...pivot,
    column: getPivotColumn,
  })) as PivotByDeveloperType;

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
        groupBy={
          preparedGroupBy.length
            ? preparedGroupBy
            : undefined
        }
        pivotBy={
          preparedPivotBy.length
            ? preparedPivotBy
            : undefined
        }
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
              rowStyle={getRowStyle}
            />
          );
        }}
      </DataSource>
    </>
  );
}

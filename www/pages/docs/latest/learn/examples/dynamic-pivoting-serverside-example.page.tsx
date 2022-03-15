import * as React from 'react';
import Select, { Props as SelectProps } from 'react-select';

import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
  DataSourcePropAggregationReducers,
  InfiniteTablePropColumnTypes,
  InfiniteTablePivotColumn,
  debounce,
  DataSourceData,
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

const aggregationReducers: DataSourcePropAggregationReducers<Developer> =
  {
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
      ? 'pivotBy=' +
        JSON.stringify(
          pivotBy.map((p) => ({ field: p.field }))
        )
      : null,
    `groupKeys=${JSON.stringify(groupKeys)}`,
    groupBy
      ? 'groupBy=' +
        JSON.stringify(
          groupBy.map((p) => ({ field: p.field }))
        )
      : null,
    sortInfo
      ? 'sortInfo=' +
        JSON.stringify(
          sortInfo.map((s) => ({
            field: s.field,
            dir: s.dir,
          }))
        )
      : null,
    aggregationReducers
      ? 'reducers=' +
        JSON.stringify(
          Object.keys(aggregationReducers).map((key) => ({
            field: aggregationReducers[key].field,
            id: key,
            name: aggregationReducers[key].reducer,
          }))
        )
      : null,
  ]
    .filter(Boolean)
    .join('&');

  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL +
      `/developers30k-sql?` +
      args
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

const columnTypes: InfiniteTablePropColumnTypes<Developer> =
  {
    number: {
      renderValue: ({ value }) =>
        numberFormatter.format(value as number),
    },
    currency: {
      renderValue: (param) => {
        const { value, data } = param;
        return `${numberFormatter.format(
          value as number
        )} ${data?.currency ?? ''}`;
      },
    },
    default: {
      style: {},
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

const groupColumn = {
  style: {
    fontWeight: '600',
    color: 'var(--infinite-accent-color)',
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

const defaultColumnPinning: InfiniteTableProps<any>['columnPinning'] =
  {
    'group-by': true,
  };

type ReducerOptions = 'min' | 'max' | 'avg';
const Settings: React.FunctionComponent<{
  groupBy: GroupByDeveloperType;
  pivotBy: PivotByDeveloperType;
  reducerKey: ReducerOptions;
  onReducerKeyChange: (reducerKey: ReducerOptions) => void;
  onGroupChange: (groupBy: GroupByDeveloperType) => void;
  onPivotChange: (pivotBy: PivotByDeveloperType) => void;
  onColorChange: (color: string) => void;
}> = ({
  groupBy,
  pivotBy,
  reducerKey,
  onGroupChange,
  onPivotChange,
  onReducerKeyChange,
  onColorChange,
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

  const groupByValue = allGroupOptions.filter((option) =>
    groupBy.some((group) => group.field === option.value)
  );

  const debouncedSetColor = React.useMemo(() => {
    return debounce(onColorChange, { wait: 300 });
  }, []);

  return (
    <div
      style={{
        zIndex: 3000,
        marginBottom: 10,
        display: 'grid',
        color: 'var(--infinite-row-color)',
        background: 'var(--infinite-background)',
        gridTemplateColumns: '1fr 1fr',
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
        <b style={{ display: 'block', marginBottom: 10 }}>
          Select `preferredLanguage` column Background:
        </b>
        <input
          onChange={(event) => {
            if (event.target.value) {
              debouncedSetColor(event.target.value);
            }
          }}
          type="color"
        />
      </div>
    </div>
  );
};

export default function GroupByExample() {
  const [groupBy, setGroupBy] =
    React.useState<GroupByDeveloperType>([
      {
        field: 'country',
      },
      { field: 'city' },
    ]);
  const [pivotBy, setPivotBy] =
    React.useState<PivotByDeveloperType>([
      {
        field: 'preferredLanguage',
      },
      {
        field: 'canDesign',
      },
    ]);
  const [reducerKey, setReducerKey] =
    React.useState<ReducerOptions>('avg');
  const [backgroundColor, setBackgroundColor] =
    React.useState<string>('');

  const preparedDataSource = React.useMemo(
    () => (dataSource as Function).bind(null),
    [pivotBy, groupBy]
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
        },
      },
    }),
    [backgroundColor]
  );

  const preparedGroupBy = React.useMemo(() => {
    return groupBy.map((group) => ({
      ...group,
      column: groupColumn,
    })) as GroupByDeveloperType;
  }, [groupBy]);

  const preparedPivotBy = React.useMemo(() => {
    return pivotBy.map((pivot) => ({
      ...pivot,
      column: getPivotColumn,
    })) as PivotByDeveloperType;
  }, [pivotBy]);

  return (
    <>
      <Settings
        onGroupChange={setGroupBy}
        onPivotChange={setPivotBy}
        onReducerKeyChange={setReducerKey}
        onColorChange={setBackgroundColor}
        groupBy={preparedGroupBy}
        pivotBy={preparedPivotBy}
        reducerKey={reducerKey}
      />

      <DataSource<Developer>
        primaryKey="id"
        lazyLoad
        data={preparedDataSource}
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
        aggregationReducers={aggregationReducers}
        defaultGroupRowsState={groupRowsState}>
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

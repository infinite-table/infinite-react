import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
  DataSourcePropAggregationReducers,
  InfiniteTablePropColumnTypes,
} from '@infinite-table/infinite-react';

import type {
  InfiniteTableColumnAggregator,
  InfiniteTablePropColumns,
  InfiniteTableProps,
} from '@infinite-table/infinite-react';

import { Settings as Dude, Settings } from './Settings';
import {
  Developer,
  GroupByDeveloperType,
  PivotByDeveloperType,
} from './types';

export type ReducerOptions = 'min' | 'max' | 'avg';

const dataSource = () => {
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + '/developers100'
  )
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
  country: { field: 'country' },
  canDesign: { field: 'canDesign' },
  hobby: { field: 'hobby' },
  city: {
    field: 'city',
    style: {
      color: 'blue',
    },
  },
  age: {
    field: 'age',
    type: ['number'],
  },
  salary: {
    field: 'salary',
    type: ['number', 'currency'],
    style: {
      color: 'red',
    },
  },
  currency: { field: 'currency' },
};

const numberFormatter = new Intl.NumberFormat();

const columnTypes: InfiniteTablePropColumnTypes<Developer> =
  {
    number: {
      renderValue: ({ value }) =>
        typeof value === 'number'
          ? numberFormatter.format(value as number)
          : null,
    },
    currency: {
      renderValue: (param) => {
        const { value, data } = param;
        return typeof value === 'number'
          ? `${numberFormatter.format(value as number)} ${
              data?.currency ?? ''
            }`
          : null;
      },
    },
    default: {
      style: {},
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

  reducer: (acc, sum) => acc + sum,
  done: (sum, arr) => (arr.length ? sum / arr.length : 0),
};

const maxReducer: InfiniteTableColumnAggregator<
  Developer,
  any
> = {
  initialValue: -Infinity,

  reducer: (acc, next) => (acc < next ? next : acc),
  done: (max) => max,
};

const minReducer: InfiniteTableColumnAggregator<
  Developer,
  any
> = {
  initialValue: Infinity,

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

// COMPONENTS
type GroupByExampleProps<T> = {
  domProps?: InfiniteTableProps<T>['domProps'];
};

export default function GroupByExample(
  props: GroupByExampleProps<any>
) {
  const { domProps } = props;
  const [groupBy, setGroupBy] =
    React.useState<GroupByDeveloperType>([
      {
        field: 'country',
      },
      { field: 'city' },
    ]);
  const [pivotEnabled, setPivotEnabled] =
    React.useState(true);
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

  /**
   * Forces a rerender when color changes
   */
  const preparedColumnTypes = React.useMemo<
    InfiniteTablePropColumnTypes<Developer>
  >(
    () => ({
      ...columnTypes,
      number: {
        style: {
          backgroundColor,
        },
      },
    }),
    [backgroundColor]
  );

  const reducers: DataSourcePropAggregationReducers<Developer> =
    React.useMemo(() => {
      const reducerMap = {
        avg: avgReducer,
        max: maxReducer,
        min: minReducer,
      };

      return {
        salary: {
          ...reducerMap[reducerKey],
          name: 'Salary (avg)',
          field: 'salary',
        },
        age: {
          ...reducerMap[reducerKey],
          name: 'Age (avg)',
          field: 'age',
        },
      };
    }, [reducerKey]);

  const preparedGroupBy = React.useMemo(() => {
    return groupBy.map((group) => ({
      ...group,
    })) as GroupByDeveloperType;
  }, [groupBy]);

  const preparedPivotBy = React.useMemo(() => {
    return pivotBy.map((pivot) => ({
      ...pivot,
    })) as PivotByDeveloperType;
  }, [pivotBy]);

  const onDataParamsChange = React.useCallback(
    (dataParams) => {
      console.log(dataParams);
    },
    []
  );

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
        pivotEnabled={pivotEnabled}
        onPivotEnableChange={setPivotEnabled}
      />

      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        groupBy={preparedGroupBy}
        pivotBy={pivotEnabled ? preparedPivotBy : undefined}
        aggregationReducers={reducers}
        onDataParamsChange={onDataParamsChange}
        defaultGroupRowsState={groupRowsState}>
        {({ pivotColumns, pivotColumnGroups }) => {
          return (
            <InfiniteTable<Developer>
              domProps={domProps}
              columns={columns}
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

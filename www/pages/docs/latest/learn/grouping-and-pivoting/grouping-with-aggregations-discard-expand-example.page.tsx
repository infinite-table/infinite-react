import * as React from 'react';
import {
  InfiniteTable,
  DataSource,
  DataSourcePropGroupBy,
  InfiniteTableColumnRenderValueParam,
  DataSourcePropAggregationReducers,
  InfiniteTablePropColumns,
  DataSourceGroupBy,
  GroupRowsState,
  InfiniteTableProps,
  InfiniteTableGroupColumnFunction,
  InfiniteTableColumn,
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
};

const avgReducer = {
  initialValue: 0,
  reducer: (acc: number, sum: number) => acc + sum,
  done: (value: number, arr: any[]) =>
    arr.length ? Math.floor(value / arr.length) : 0,
};
const aggregationReducers: DataSourcePropAggregationReducers<Developer> =
  {
    salary: {
      field: 'salary',

      ...avgReducer,
    },
    age: {
      field: 'age',
      ...avgReducer,
    },
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

// TODO remove this after the next release
//@ts-ignore
const groupColumn: InfiniteTableGroupColumnFunction<
  Developer
> = (arg) => {
  const column: {
    render?: InfiniteTableColumn<Developer>['render'];
  } = {};

  if (arg.groupIndexForColumn === arg.groupBy.length - 1) {
    column.render = ({ value, rowInfo }) => {
      if (
        rowInfo.groupBy.length !=
        rowInfo.rootGroupBy?.length
      ) {
        // we are on a group row that is the last grouping level
        return null;
      }
      return value;
    };
  }
  return column;
};

const defaultGroupRowsState = new GroupRowsState({
  //make all groups collapsed by default
  collapsedRows: true,
  expandedRows: [],
});

export default function App() {
  const groupBy: DataSourceGroupBy<Developer>[] =
    React.useMemo(
      () => [
        {
          field: 'country',
        },
        { field: 'stack' },
      ],
      []
    );
  return (
    <DataSource<Developer>
      data={dataSource}
      primaryKey="id"
      defaultGroupRowsState={defaultGroupRowsState}
      aggregationReducers={aggregationReducers}
      groupBy={groupBy}>
      <InfiniteTable<Developer>
        groupRenderStrategy="multi-column"
        groupColumn={groupColumn}
        columns={columns}
        columnDefaultWidth={250}
      />
    </DataSource>
  );
}

const dataSource = () => {
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + '/developers10k'
  )
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

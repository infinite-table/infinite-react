import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
  InfiniteTableColumn,
  DataSourceGroupBy,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import { columns, COLUMN_WIDTH, ROW_HEIGHT } from './columns';

export type Developer = {
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

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers10k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const groupBy: DataSourceGroupBy<Developer>[] = [];
const preparedColumns = columns.reduce((acc, column) => {
  const field = column.field as keyof Developer;
  const col: InfiniteTableColumn<Developer> = {
    field,
  };
  if (typeof column.getValue === 'function') {
    col.valueGetter = (params) => {
      return params.data ? column?.getValue?.(params.data) : null;
    };
  }
  if (column.group) {
    groupBy.push({ field });
  }

  acc[field] = col;

  return acc;
}, {} as Record<string, InfiniteTableColumn<Developer>>);

const groupRowsState = new GroupRowsState({
  expandedRows: true,
  collapsedRows: [],
});

const columnTypes = {
  default: {
    defaultWidth: COLUMN_WIDTH,
  },
};

const App: React.FunctionComponent = (_props) => {
  return (
    <div style={{ height: 600, display: 'flex' }}>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        groupBy={groupBy}
        defaultGroupRowsState={groupRowsState}
      >
        {() => {
          return (
            <InfiniteTable<Developer>
              rowHeight={ROW_HEIGHT}
              columns={preparedColumns}
              columnTypes={columnTypes}
            />
          );
        }}
      </DataSource>
    </div>
  );
};

export default App;

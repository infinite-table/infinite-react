import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  GroupRowsState,
  InfiniteTableColumn,
  DataSourceGroupBy,
} from '@infinite-table/infinite-react';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';

import { columns } from './columns';

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
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + '/developers10k'
  )
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const groupBy: DataSourceGroupBy<Developer>[] = [];
const preparedColumns: InfiniteTablePropColumns<Developer> =
  {};

columns.forEach((column) => {
  const field = column.field as keyof Developer;
  const colDef: InfiniteTableColumn<Developer> = {
    field,
  };

  if (typeof column.getValue === 'function') {
    colDef.valueGetter = (params) => {
      return params.data
        ? column?.getValue?.(params.data)
        : null;
    };
  }
  if (column.group) {
    groupBy.push({ field });
  }

  preparedColumns[field] = colDef;
});

const groupRowsState = new GroupRowsState({
  expandedRows: true,
  collapsedRows: [],
});

const App: React.FunctionComponent = (props) => {
  return (
    <div style={{ height: 600, display: 'flex' }}>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        groupBy={groupBy}
        defaultGroupRowsState={groupRowsState}>
        {() => {
          return (
            <InfiniteTable<Developer>
              columns={preparedColumns}
            />
          );
        }}
      </DataSource>
    </div>
  );
};

export default App;

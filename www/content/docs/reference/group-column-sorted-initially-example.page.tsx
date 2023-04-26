import {
  InfiniteTable,
  DataSource,
  DataSourcePropSortInfo,
} from '@infinite-table/infinite-react';
import type {
  DataSourcePropGroupBy,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import * as React from 'react';

const groupBy: DataSourcePropGroupBy<Developer> = [
  {
    field: 'stack',
  },
  {
    field: 'preferredLanguage',
  },
];

const columns: InfiniteTablePropColumns<Developer> = {
  country: {
    field: 'country',
  },
  theFirstName: {
    field: 'firstName',
    style: {
      color: 'orange',
    },
    // hide this column when grouping active
    // as the group column is anyways bound to this field
    defaultHiddenWhenGroupedBy: '*',
  },
  stack: {
    field: 'stack',
    style: {
      color: 'tomato',
    },
  },
  preferredLanguage: { field: 'preferredLanguage' },
  age: { field: 'age' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  canDesign: { field: 'canDesign' },
};

const groupColumn = {
  field: 'firstName',
};

const defaultSortInfo: DataSourcePropSortInfo<Developer> = [
  {
    field: ['stack', 'preferredLanguage'],
    dir: -1,
    id: 'group-by',
  },
];

export default function App() {
  return (
    <DataSource<Developer>
      data={dataSource}
      primaryKey="id"
      defaultSortInfo={defaultSortInfo}
      groupBy={groupBy}
    >
      <InfiniteTable<Developer>
        groupColumn={groupColumn}
        columns={columns}
        hideColumnWhenGrouped
        columnDefaultWidth={250}
      />
    </DataSource>
  );
}

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers10')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  email: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

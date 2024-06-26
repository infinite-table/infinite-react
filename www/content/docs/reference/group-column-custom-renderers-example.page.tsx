import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';
import type {
  DataSourcePropGroupBy,
  InfiniteTableColumn,
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
  firstName: {
    field: 'firstName',
    style: {
      color: 'orange',
    },
    renderValue: ({ value, rowInfo }) =>
      rowInfo.isGroupRow ? null : `${value}.`,
  },
  stack: {
    field: 'stack',
    style: {
      color: 'tomato',
    },
  },
  age: { field: 'age' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  canDesign: { field: 'canDesign' },
};

const groupColumn: InfiniteTableColumn<Developer> = {
  field: 'firstName',
  renderValue: ({ value }) => {
    return `First name: ${value}`;
  },
};

export default function App() {
  return (
    <DataSource<Developer> data={dataSource} primaryKey="id" groupBy={groupBy}>
      <InfiniteTable<Developer>
        groupColumn={groupColumn}
        columns={columns}
        columnDefaultWidth={250}
      />
    </DataSource>
  );
}

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
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

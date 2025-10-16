import * as React from 'react';
import {
  InfiniteTable,
  DataSource,
  type InfiniteTablePropColumns,
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

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 80 },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  salary: { field: 'salary', type: 'number' },
};

export default function App() {
  return (
    <DataSource<Developer> primaryKey="id" data={dataSource}>
      <InfiniteTable<Developer>
        columns={columns}
        columnDefaultWidth={200}
        rowHoverClassName="bg-orange-800!"
      />
    </DataSource>
  );
}

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

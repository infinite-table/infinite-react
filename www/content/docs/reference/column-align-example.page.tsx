import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

import * as React from 'react';

export default function App() {
  const [align, setAlign] = React.useState<'start' | 'center' | 'end'>('start');

  const columns: InfiniteTablePropColumns<Developer> = {
    firstName: {
      field: 'firstName',

      align,
    },
  };
  return (
    <>
      <div
        style={{
          color: 'var(--infinite-cell-color)',
          padding: '10px',
        }}
      >
        <p>Select the column align</p>
        <select
          value={align}
          onChange={(e) =>
            setAlign(e.target.value as 'start' | 'center' | 'end')
          }
        >
          <option value="start">Start</option>
          <option value="center">Center</option>
          <option value="end">End</option>
        </select>
      </div>
      <DataSource<Developer> data={dataSource} primaryKey="id">
        <InfiniteTable<Developer>
          columns={columns}
          columnDefaultWidth={250}
          headerOptions={{
            alwaysReserveSpaceForSortIcon: false,
          }}
        />
      </DataSource>
    </>
  );
}

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers100')
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

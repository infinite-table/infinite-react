import * as React from 'react';
import {
  InfiniteTable,
  DataSource,
} from '@infinite-table/infinite-react';

import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';
import { useState } from 'react';

const columns: InfiniteTablePropColumns<Developer> = {
  country: {
    field: 'country',
  },
  firstName: {
    field: 'firstName',
  },
  stack: {
    field: 'stack',
  },
  age: { field: 'age' },
  id: { field: 'id' },
  salary: {
    field: 'salary',
    type: 'number',
  },
  canDesign: { field: 'canDesign' },
};

export default function App() {
  const [rowSelection, setRowSelection] = useState<
    number | null | string
  >(3);
  return (
    <>
      <p
        style={{
          color: 'var(--infinite-cell-color)',
          padding: 10,
        }}>
        Current row selection:
        <code style={{ display: 'inline-block' }}>
          <pre> {JSON.stringify(rowSelection)}.</pre>
        </code>
      </p>

      <DataSource<Developer>
        data={dataSource}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
        primaryKey="id">
        <InfiniteTable<Developer>
          columns={columns}
          columnDefaultWidth={150}
        />
      </DataSource>
    </>
  );
}

const dataSource = () => {
  return fetch(
    process.env.NEXT_PUBLIC_BASE_URL + '/developers100'
  )
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

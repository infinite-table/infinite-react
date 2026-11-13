import * as React from 'react';

import {
  DataSource,
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  age: number;
};

const data: Developer[] = [
  { id: 1, firstName: 'John', lastName: 'Bob', age: 20 },
  { id: 2, firstName: 'Marry', lastName: 'Bob', age: 25 },
  { id: 3, firstName: 'Bill', lastName: 'Bobson', age: 30 },
];

const columns: InfiniteTablePropColumns<Developer> = {
  firstName: { field: 'firstName' },
  lastName: { field: 'lastName' },
  age: { field: 'age', type: 'number' },
};

export default function App() {
  const appRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      ref={appRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        color: 'var(--infinite-cell-color)',
      }}
    >
      <p style={{ padding: 10 }}>
        The table sits in a short pane that clips its content. Open a column
        menu - it is rendered into document.body and kept within this app.
      </p>
      <div style={{ height: 360, overflow: 'hidden' }}>
        <DataSource<Developer> data={data} primaryKey="id">
          <InfiniteTable<Developer>
            columns={columns}
            menuPortalContainer={document.body}
            menuConstrainTo={() => appRef.current}
          />
        </DataSource>
      </div>
    </div>
  );
}

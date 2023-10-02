import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

import * as React from 'react';

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

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', defaultWidth: 60 },
  firstName: { field: 'firstName' },
  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
  country: { field: 'country' },
  age: { field: 'age', type: 'number' },
  salary: { field: 'salary', type: 'number' },
  currency: { field: 'currency', type: 'number' },
};

export default function App() {
  const [selectionMode, setSelectionMode] = React.useState<
    'multi-cell' | 'multi-row'
  >('multi-cell');

  const currentColumns = React.useMemo(() => {
    return {
      ...columns,
      id: {
        field: 'id',
        defaultWidth: 60,
        renderSelectionCheckBox: true,
      },
    } as InfiniteTablePropColumns<Developer>;
  }, [selectionMode]);
  return (
    <div
      style={{
        display: 'flex',
        flex: 1,
        color: 'var(--infinite-cell-color)',
        flexFlow: 'column',
        background: 'var(--infinite-background)',
      }}
    >
      <p style={{ padding: 10 }}>Please select the selection mode</p>
      <div style={{ padding: 10, paddingTop: 0 }}>
        <select
          style={{
            margin: '10px 0',
            display: 'inline-block',
            background: 'var(--infinite-background)',
            color: 'currentColor',
            padding: 'var(--infinite-space-3)',
          }}
          value={selectionMode}
          onChange={(event) => {
            const selectionMode = event.target.value as
              | 'multi-cell'
              | 'multi-row';

            setSelectionMode(selectionMode);
          }}
        >
          <option value="multi-cell">multi-cell</option>
          <option value="multi-row">multi-row</option>
        </select>
      </div>
      <DataSource<Developer>
        primaryKey="id"
        data={dataSource}
        selectionMode={selectionMode}
      >
        <InfiniteTable<Developer>
          columns={currentColumns}
          columnDefaultWidth={100}
        />
      </DataSource>
    </div>
  );
}

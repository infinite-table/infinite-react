import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';
import type {
  DataSourcePropGroupBy,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import * as React from 'react';
import { useState } from 'react';

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
  },
  preferredLanguage: {
    field: 'preferredLanguage',
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

const groupColumn = {
  field: 'firstName' as keyof Developer,
};

const domProps = {
  style: { flex: 1 },
};
export default function App() {
  const [hideColumnWhenGrouped, setHidden] = useState(true);
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
      <div style={{ padding: 10 }}>
        <label>
          <input
            type="checkbox"
            checked={hideColumnWhenGrouped}
            onChange={() => {
              setHidden(!hideColumnWhenGrouped);
            }}
          />
          Hide Column When Grouped
        </label>
      </div>
      <DataSource<Developer>
        data={dataSource}
        primaryKey="id"
        groupBy={groupBy}
      >
        <InfiniteTable<Developer>
          groupColumn={groupColumn}
          columns={columns}
          hideColumnWhenGrouped={hideColumnWhenGrouped}
          columnDefaultWidth={250}
          domProps={domProps}
        />
      </DataSource>
    </div>
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

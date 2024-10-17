import * as React from 'react';

import {
  DataSourceData,
  InfiniteTable,
  InfiniteTablePropColumns,
  DataSource,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  salary: number;
};

const data: DataSourceData<Developer> = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + `/developers1k-sql?`)
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    type: 'number',
    defaultWidth: 100,
  },
  salary: {
    field: 'salary',
    type: 'number',
  },

  firstName: {
    field: 'firstName',
  },
  stack: { field: 'stack' },
  currency: { field: 'currency', defaultFilterable: false },
};

export default () => {
  const [showColumnFilters, setShowColumnFilters] = React.useState(true);
  return (
    <>
      <React.StrictMode>
        <div style={{ paddingBlock: 10 }}>
          <button onClick={() => setShowColumnFilters(!showColumnFilters)}>
            Toggle visibility of column filters
          </button>
        </div>
        <DataSource<Developer>
          data={data}
          primaryKey="id"
          defaultFilterValue={[]}
          filterDelay={0}
          filterMode="local"
        >
          <InfiniteTable<Developer>
            columnDefaultWidth={150}
            columnMinWidth={50}
            columns={columns}
            showColumnFilters={showColumnFilters}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};

import * as React from 'react';

import {
  DataSource,
  DataSourceData,
  DataSourceProps,
  InfiniteTable,
  InfiniteTablePropColumns,
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
    defaultFilterable: true,
    field: 'salary',
    type: 'number',
  },

  firstName: {
    field: 'firstName',
  },
  stack: { field: 'stack' },
  currency: { field: 'currency' },
};

const domProps = {
  style: {
    height: '100%',
  },
};
export default () => {
  const [filterValue, setFilterValue] = React.useState<
    DataSourceProps<Developer>['filterValue']
  >([
    {
      field: 'salary',
      operator: 'gt',
      filterValue: 50000,
      filterType: 'number',
    },
  ]);

  return (
    <>
      <div style={{ color: 'var(--infinite-cell-color)' }}>
        Current filters:{' '}
        <pre>
          <code>{JSON.stringify(filterValue, null, 2)}</code>
        </pre>
      </div>
      <React.StrictMode>
        <DataSource<Developer>
          data={data}
          primaryKey="id"
          filterValue={filterValue}
          onFilterValueChange={setFilterValue}
          filterDelay={0}
          filterMode="local"
        >
          <InfiniteTable<Developer>
            domProps={domProps}
            columnDefaultWidth={150}
            columnMinWidth={50}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};

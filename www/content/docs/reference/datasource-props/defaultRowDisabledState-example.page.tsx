import * as React from 'react';

import {
  DataSource,
  DataSourceData,
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

export default () => {
  return (
    <>
      <DataSource<Developer>
        data={data}
        primaryKey="id"
        defaultRowDisabledState={{
          enabledRows: true,
          disabledRows: [1, 3, 4, 5],
        }}
      >
        <InfiniteTable<Developer>
          keyboardNavigation="row"
          columnDefaultWidth={120}
          columnMinWidth={50}
          columns={columns}
        />
      </DataSource>
    </>
  );
};

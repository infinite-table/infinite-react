import * as React from 'react';

import {
  InfiniteTablePropColumns,
  InfiniteTable,
  DataSource,
} from '@infinite-table/infinite-react';


import { useState } from 'react';

import { data, height80vhDomProps, type Developer } from './common';

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },

  firstName: {
    field: 'firstName',
  },

  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};

export default function App() {
  const [rowSelection, setRowSelection] = useState<string | number | null>(3);

  return (
    <>
      <div>Selected {JSON.stringify(rowSelection)}</div>
      <DataSource<Developer>
        primaryKey="id"
        data={data}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      >
        <InfiniteTable<Developer> domProps={height80vhDomProps} columns={columns} />
      </DataSource>
    </>
  );
}

import * as React from 'react';

import {
  InfiniteTablePropColumns,
  InfiniteTable,
  DataSource,
} from '@infinite-table/infinite-react';


import { data, height80vhDomProps, type Developer } from './common';

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id', renderSelectionCheckBox: true },

  firstName: {
    field: 'firstName',
  },

  preferredLanguage: { field: 'preferredLanguage' },
  stack: { field: 'stack' },
};

export default function App() {
  return (
    <>
      <DataSource<Developer>
        primaryKey="id"
        data={data}
        selectionMode="multi-row"
      >
        <InfiniteTable<Developer> domProps={height80vhDomProps} columns={columns} />
      </DataSource>
    </>
  );
}

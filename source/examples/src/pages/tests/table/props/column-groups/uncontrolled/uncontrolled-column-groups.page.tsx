import * as React from 'react';

import { InfiniteTable, DataSource } from '@src/index';
import { InfiniteTableColumnGroup } from '@src/components/InfiniteTable/types/InfiniteTableProps';

import { rowData, Person } from '../rowData';
import { columns } from '../columns';

const getColumnGroups = () => {
  const columnGroups: Map<string, InfiniteTableColumnGroup> = new Map([
    ['contact info', { header: 'Contact info' }],
    ['street', { header: 'street', columnGroup: 'address' }],
    ['location', { header: 'location', columnGroup: 'address' }],
    ['address', { header: 'Address' }],
  ]);

  return columnGroups;
};

const columnGroups = getColumnGroups();
(globalThis as any).columnGroups = columnGroups;

const App = () => {
  return (
    <React.StrictMode>
      <DataSource<Person> primaryKey="id" data={rowData}>
        <InfiniteTable<Person>
          domProps={{
            style: {
              margin: '5px',
              height: '80vh',
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          columnGroups={columnGroups}
          columnDefaultWidth={140}
          columnMinWidth={50}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
};

export default App;

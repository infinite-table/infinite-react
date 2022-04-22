import { InfiniteTableColumnGroup } from '@src/components/InfiniteTable/types/InfiniteTableProps';
import { InfiniteTable, DataSource } from '@src/index';
import * as React from 'react';

import { columns } from '../columns';
import { rowData, Person } from '../rowData';

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
const collapsedColumnGroups = new Map<string[], string>();
(globalThis as any).columnGroups = columnGroups;
(globalThis as any).collapsedColumnGroups = collapsedColumnGroups;

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
          columnPinning={{
            id: true,
            streetNo: true,
          }}
          columnGroups={columnGroups}
          defaultCollapsedColumnGroups={collapsedColumnGroups}
          pinnedStartMaxWidth={300}
          columnDefaultWidth={240}
          columnMinWidth={50}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
};

export default App;

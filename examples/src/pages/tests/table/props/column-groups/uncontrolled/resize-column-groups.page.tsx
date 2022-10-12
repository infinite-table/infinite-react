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

const App = () => {
  return (
    <React.StrictMode>
      <DataSource<Person> primaryKey="id" data={rowData}>
        <InfiniteTable<Person>
          domProps={{
            style: {
              margin: '5px',
              height: '80vh',
              width: '80vw',
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          defaultActiveCellIndex={[1, 1]}
          columnGroups={columnGroups}
          columnDefaultWidth={340}
          columnMinWidth={50}
          columnMaxWidth={250}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
};

export default App;

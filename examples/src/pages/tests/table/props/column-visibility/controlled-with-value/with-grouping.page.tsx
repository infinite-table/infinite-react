import * as React from 'react';

import {
  InfiniteTable,
  InfiniteTableColumn,
  InfiniteTablePropColumnVisibility,
  DataSource,
} from '@infinite-table/infinite-react';

import { rowData, Car } from '../rowData';
import { columns } from '../columns';
import { useState } from 'react';

const groupColumn: InfiniteTableColumn<Car> = {
  header: 'Grouping',
  field: 'make',
};

const App = () => {
  const [columnVisibility, setColumnVisibility] =
    useState<InfiniteTablePropColumnVisibility>({});

  return (
    <React.StrictMode>
      <button
        onClick={() =>
          setColumnVisibility({
            id: false,
            make: false,
            model: false,
            price: false,
            year: false,
            'group-by': false,
          })
        }
      >
        hide all
      </button>
      <button onClick={() => setColumnVisibility({})}>show all</button>
      <DataSource<Car>
        primaryKey="id"
        data={rowData}
        groupBy={[
          {
            field: 'make',
          },
        ]}
      >
        <InfiniteTable<Car>
          domProps={{
            style: {
              margin: '5px',
              height: '80vh',
              border: '1px solid gray',
              position: 'relative',
            },
          }}
          defaultColumnPinning={{
            'group-by': true,
          }}
          columnVisibility={columnVisibility}
          onColumnVisibilityChange={setColumnVisibility}
          groupRenderStrategy="single-column"
          columns={columns}
          groupColumn={groupColumn}
        />
      </DataSource>
    </React.StrictMode>
  );
};

export default App;

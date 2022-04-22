import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';
import * as React from 'react';

import { columns } from '../columns';
import { rowData, Car } from '../rowData';

const App = () => {
  return (
    <>
      <button
        onClick={() => {
          columns.delete('id');
          columns.delete('make');
        }}
      >
        hide id and make columns
      </button>
      <React.StrictMode>
        <DataSource<Car>
          primaryKey="id"
          data={rowData}
          fields={['id', 'make', 'model', 'price']}
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
            columnDefaultWidth={140}
            columnMinWidth={50}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};

export default App;

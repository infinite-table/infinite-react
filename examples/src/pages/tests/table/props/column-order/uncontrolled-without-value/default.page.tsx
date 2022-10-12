import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';
import * as React from 'react';

import { columns } from '../columns';
import { rowData, Car } from '../rowData';

const App = () => {
  const [cols, setCols] = React.useState(columns);
  return (
    <>
      <button
        onClick={() => {
          const cols = {
            ...columns,
          };
          //@ts-ignore
          delete cols.id;
          //@ts-ignore
          delete cols.make;
          setCols(cols);
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
            columns={cols}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
};

export default App;

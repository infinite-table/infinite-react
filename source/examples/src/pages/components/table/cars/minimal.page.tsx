import * as React from 'react';

import {
  DataSource,
  InfiniteTable,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';

import { rowData, Car } from './rowData';

const columns = new Map<string, InfiniteTableColumn<Car>>([
  ['id', { field: 'id' }],
  [
    'make',
    {
      field: 'model',
    },
  ],
  ['model', { field: 'model' }],
  ['price', { field: 'price' }],
  ['year', { field: 'year', width: 500 }],
  ['rating', { field: 'rating' }],
]);

const App = () => {
  return (
    <React.StrictMode>
      <DataSource<Car> primaryKey="id" data={rowData}>
        <InfiniteTable
          columns={columns}
          domProps={{ style: { height: '50vh' } }}
        />
      </DataSource>
    </React.StrictMode>
  );
};

export default App;

import * as React from 'react';

import { DataSource, TableFactory, TableColumn } from '@src/index';

import { rowData, Car } from './rowData';

const Table = TableFactory<Car>();

const columns = new Map<string, TableColumn<Car>>([
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
      <DataSource<Car>
        primaryKey="id"
        data={rowData}
        fields={['id', 'make', 'model', 'price']}
      >
        <Table columns={columns} />
      </DataSource>
    </React.StrictMode>
  );
};

export default App;

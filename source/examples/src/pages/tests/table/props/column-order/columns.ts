import type { InfiniteTableColumn } from '@src/components/Table';
import type { Car } from './rowData';

export const columns = new Map<string, InfiniteTableColumn<Car>>([
  ['id', { field: 'id' }],
  [
    'make',
    {
      field: 'make',
    },
  ],
  ['model', { field: 'model' }],
  ['price', { field: 'price' }],
  ['year', { field: 'year' }],
  ['rating', { field: 'rating' }],
]);

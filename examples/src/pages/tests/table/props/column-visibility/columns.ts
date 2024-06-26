import type { InfiniteTableColumn } from '@infinite-table/infinite-react';
import type { Car } from './rowData';

export const columns: Record<string, InfiniteTableColumn<Car>> = {
  id: { field: 'id' },

  make: {
    field: 'make',
  },
  model: { field: 'model' },
  price: { field: 'price' },
  year: { field: 'year' },
};

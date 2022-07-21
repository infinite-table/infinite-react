import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';
import type { Car } from './rowData';

export const columns: InfiniteTablePropColumns<Car> = {
  id: { field: 'id' },

  make: {
    field: 'make',
  },
  model: { field: 'model' },
  price: { field: 'price' },
  year: { field: 'year' },
  rating: { field: 'rating' },
};

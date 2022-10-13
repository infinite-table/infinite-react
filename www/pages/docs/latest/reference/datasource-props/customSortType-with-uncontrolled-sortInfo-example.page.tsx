import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import * as React from 'react';

export type CarSale = {
  id: number;

  make: string;
  model: string;
  year: number;

  sales: number;
  color: string;
};

const carsales: CarSale[] = [
  {
    make: 'Volkswagen',
    model: 'GTI',
    year: 2009,
    sales: 6,
    color: 'red',
    id: 0,
  },
  {
    make: 'Honda',
    model: 'Element 2WD',
    year: 2009,
    sales: 739,
    color: 'red',
    id: 1,
  },
  {
    make: 'Acura',
    model: 'RDX 4WD',
    year: 2008,
    sales: 2,
    color: 'magenta',
    id: 2,
  },
  {
    make: 'Honda',
    model: 'Fit',
    year: 2009,
    sales: 211,
    color: 'blue',
    id: 3,
  },
  {
    make: 'Mazda',
    model: '6',
    year: 2009,
    sales: 31,
    color: 'blue',

    id: 4,
  },
  {
    make: 'Acura',
    model: 'TSX',
    year: 2009,
    sales: 14,
    color: 'yellow',
    id: 5,
  },
  {
    make: 'Acura',
    model: 'TSX',
    year: 2010,
    sales: 14,
    color: 'red',
    id: 6,
  },
  {
    make: 'Audi',
    model: 'A3',
    year: 2009,
    sales: 2,
    color: 'magenta',
    id: 7,
  },
];

const columns: Record<string, InfiniteTableColumn<CarSale>> = {
  color: { field: 'color', sortType: 'color' },
  make: { field: 'make' },
  model: { field: 'model' },

  sales: {
    field: 'sales',
    sortType: 'number',
  },
  year: {
    field: 'year',
    sortType: 'number',
  },
};
const newSortTypes = {
  color: (one: string, two: string) => {
    if (one === 'magenta') {
      // magenta comes first
      return -1;
    }
    if (two === 'magenta') {
      // magenta comes first
      return 1;
    }
    return one.localeCompare(two);
  },
};

export default function DataTestPage() {
  return (
    <DataSource<CarSale>
      data={carsales}
      primaryKey="id"
      defaultSortInfo={{
        field: 'color',
        dir: 1,
        type: 'color',
      }}
      sortTypes={newSortTypes}
    >
      <InfiniteTable<CarSale> columns={columns} />
    </DataSource>
  );
}

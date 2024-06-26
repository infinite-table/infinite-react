import { CarSale } from '@examples/datasets/CarSale';
import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import * as React from 'react';

const carsales: CarSale[] = [
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'RDX 2WD',
    year: 2010,
    sales: 15,
    color: 'red',
    id: 0,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'RDX 4WD',
    year: 2007,
    sales: 1,
    color: 'red',
    id: 1,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'RDX 4WD',
    year: 2008,
    sales: 2,
    color: 'magenta',
    id: 2,
  },
];

(globalThis as any).carsales = carsales;

const columns: Record<string, InfiniteTableColumn<CarSale>> = {
  make: { field: 'make' },
  model: { field: 'model' },

  category: {
    field: 'category',
  },
  sales: {
    field: 'sales',
    sortType: 'number',
  },
  year: {
    field: 'year',
    sortType: 'number',
  },
};

const domProps = {
  style: {
    margin: '5px',
    height: 900,
    border: '1px solid gray',
    position: 'relative',
  } as React.CSSProperties,
};

const dataSource = () => {
  (globalThis as any).callCount = ((globalThis as any).callCount || 0) + 1;
  return Promise.resolve(carsales);
};
export default function DataTestPage() {
  return (
    <>
      <DataSource<CarSale> data={dataSource} primaryKey="id" sortMode="local">
        <InfiniteTable<CarSale> domProps={domProps} columns={columns} />
      </DataSource>
    </>
  );
}

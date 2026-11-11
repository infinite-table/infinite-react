/**
 * The Infinite Table side of the migration snippets. Every page migrates the
 * same small "cars" grid, so readers can compare like with like.
 */
export const CARS_TYPE = `type Car = { id: number; make: string; model: string; price: number };`;

export const CARS_DATA = `const data: Car[] = [
  { id: 1, make: 'Tesla', model: 'Model Y', price: 64950 },
  { id: 2, make: 'Ford', model: 'F-Series', price: 33850 },
];`;

export const INFINITE_CARS = `
import { DataSource, InfiniteTable } from '@infinite-table/infinite-react';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';
import '@infinite-table/infinite-react/index.css';

${CARS_TYPE}

${CARS_DATA}

const columns: InfiniteTablePropColumns<Car> = {
  make: { field: 'make', header: 'Make' },
  model: { field: 'model', header: 'Model', defaultWidth: 200 },
  price: {
    field: 'price',
    header: 'Price',
    renderValue: ({ value }) => <b>{value}</b>,
  },
};

export function Cars() {
  return (
    <div style={{ height: 500, display: 'flex' }}>
      <DataSource<Car>
        primaryKey="id"
        data={data}
        defaultSortInfo={{ field: 'make', dir: 1 }}
      >
        <InfiniteTable<Car> columns={columns} />
      </DataSource>
    </div>
  );
}`;

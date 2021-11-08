import * as React from 'react';

import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
} from '@infinite-table/infinite-react';
import { CarSale } from '@examples/datasets/CarSale';

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
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'RDX 4WD',
    year: 2009,
    sales: 136,
    color: 'blue',
    id: 3,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'RDX 4WD',
    year: 2010,
    color: 'blue',
    sales: 30,
    id: 4,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'TSX',
    year: 2009,
    sales: 14,
    color: 'yellow',
    id: 5,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Acura',
    model: 'TSX',
    year: 2010,
    sales: 14,
    color: 'red',
    id: 6,
  },
  {
    category: '1 - Category 1 Truck',
    make: 'Audi',
    model: 'A3',
    year: 2009,
    sales: 2,
    color: 'magenta',
    id: 7,
  },
];

(globalThis as any).carsales = carsales;

const columns = new Map<string, InfiniteTableColumn<CarSale>>([
  ['make', { field: 'make' }],
  ['model', { field: 'model' }],
  [
    'category',
    {
      field: 'category',
    },
  ],
  [
    'count',
    {
      field: 'sales',
    },
  ],
  [
    'year',
    {
      field: 'year',
      type: 'number',
    },
  ],
]);

const domProps = {
  style: {
    margin: '5px',
    height: 900,
    border: '1px solid gray',
    position: 'relative',
  },
};
export default function DataTestPage() {
  const [rowHeight, setRowHeight] = React.useState(40);
  return (
    <React.StrictMode>
      Current row height: {rowHeight}
      <br />
      Press buttons below to increment/decrement row height by 10
      <div style={{ display: 'flex', flexFlow: 'row' }}>
        <button
          data-name="up"
          onClick={() => {
            setRowHeight((rowHeight) => rowHeight + 10);
          }}
        >
          UP
        </button>
        <button
          data-name="down"
          onClick={() => {
            setRowHeight((rowHeight) => rowHeight - 10);
          }}
        >
          DOWN
        </button>
      </div>
      <DataSource<CarSale> data={carsales} primaryKey="id">
        <InfiniteTable<CarSale>
          domProps={domProps}
          rowHeight={rowHeight}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
}

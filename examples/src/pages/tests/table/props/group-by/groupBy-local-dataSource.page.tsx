import { CarSale } from '@examples/datasets/CarSale';
import {
  InfiniteTable,
  DataSource,
  InfiniteTableColumn,
  DataSourceDataParams,
  DataSourcePropGroupBy,
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

const dataSource = (params: DataSourceDataParams<CarSale>) => {
  console.log('refetch data');

  (globalThis as any).callCount = ((globalThis as any).callCount || 0) + 1;
  (globalThis as any).groupBy = params.groupBy;
  return Promise.resolve(carsales);
};
export default function DataTestPage() {
  const [groupBy, setGroupBy] = React.useState<DataSourcePropGroupBy<CarSale>>([
    {
      field: 'year',
    },
  ]);
  return (
    <>
      <button
        onClick={() => {
          setGroupBy((groupBy) => {
            if (groupBy.length) {
              return [];
            } else {
              return [
                {
                  field: 'year',
                },
              ];
            }
          });
        }}
      >
        toggle group
      </button>
      <DataSource<CarSale>
        data={dataSource}
        primaryKey="id"
        groupMode="local"
        groupBy={groupBy}
      >
        <InfiniteTable<CarSale> domProps={domProps} columns={columns} />
      </DataSource>
    </>
  );
}

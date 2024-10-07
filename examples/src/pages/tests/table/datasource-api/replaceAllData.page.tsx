import {
  InfiniteTableColumn,
  InfiniteTable,
  DataSource,
  DataSourceData,
  DataSourceApi,
} from '@infinite-table/infinite-react';
import * as React from 'react';

type Car = {
  id: number;
  name: string;
  price: number;
};
const cars: Car[] = [
  { id: 0, name: 'Audi', price: 40000 },
  { id: 1, name: 'Volvo', price: 30000 },
  { id: 2, name: 'BMW', price: 25000 },
];
const dataSource: DataSourceData<Car> = () => {
  return cars;
};

const columns: Record<string, InfiniteTableColumn<Car>> = {
  identifier: {
    field: 'id',
  },
  name: {
    field: 'name',
    name: 'Name',
  },
  price: { field: 'price' },
};
const domProps: React.HTMLAttributes<HTMLDivElement> = {
  style: {
    margin: '5px',

    minHeight: '500px',
  },
};

export default function () {
  const [api, setApi] = React.useState<DataSourceApi<Car>>();
  return (
    <>
      <React.StrictMode>
        <button
          onClick={() => {
            api?.replaceAllData([{ id: 10, name: 'Porsche', price: 60000 }]);
          }}
        >
          replaceAllData
        </button>
        <DataSource<Car> data={dataSource} primaryKey="id" onReady={setApi}>
          <InfiniteTable<Car>
            domProps={domProps}
            columnDefaultWidth={150}
            columns={columns}
          />
        </DataSource>
      </React.StrictMode>
    </>
  );
}

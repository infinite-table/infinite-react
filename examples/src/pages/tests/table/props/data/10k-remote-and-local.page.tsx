import * as React from 'react';
import { CarSale } from '@examples/datasets/CarSale';
import { carsales, carSaleBasicColumns as localCols } from './common';

import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
  streetName: string;
  streetNo: number;
  streetPrefix: string;
};

const cols100 = [...new Array(138)].reduce((acc, _item, index) => {
  acc[`col${index}`] = {
    field: 'firstName',
    header: `col${index}`,
    renderValue: ({ value }: any) => `${value} ${index}`,
  };
  return acc;
}, {});

const columns: InfiniteTablePropColumns<Developer> = {
  id: { field: 'id' },
  firstName: { field: 'firstName' },
  age: {
    field: 'age',
    type: ['number'],
  },
  salary: {
    field: 'salary',
    type: ['number', 'currency'],
    style: {
      color: 'red',
    },
  },

  canDesign: { field: 'canDesign' },
  preferredLanguage: { field: 'preferredLanguage' },
  city: { field: 'city' },
  lastName: { field: 'lastName' },
  hobby: { field: 'hobby' },
  stack: { field: 'stack' },
  streetName: { field: 'streetName' },
  currency: { field: 'currency' },
  ...cols100,
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers10k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

export default function DataTestPage() {
  const [active, setActive] = React.useState([true, true]);

  return (
    <React.StrictMode>
      <button onClick={() => setActive([!active[0], active[1]])}>
        toggle remote
      </button>
      {active[0] && (
        <DataSource<Developer> data={dataSource} primaryKey="id">
          <InfiniteTable<Developer>
            columnDefaultWidth={130}
            domProps={{
              style: {
                margin: '5px',
                height: active[1] ? '50vh' : '90vh',
                border: '1px solid gray',
                position: 'relative',
              },
            }}
            // columnPinning={{
            //   age: 'start',
            //   canDesign: 'end',
            // }}

            columns={columns}
          />
        </DataSource>
      )}
      <button onClick={() => setActive([active[0], !active[1]])}>
        toggle local
      </button>
      {active[1] && (
        <DataSource<CarSale> data={carsales} primaryKey="id">
          <InfiniteTable<CarSale>
            debugId="local"
            columns={localCols}
            domProps={{
              style: {
                margin: '5px',
                height: active[0] ? '40vh' : '90vh',
                border: '1px solid gray',
                position: 'relative',
              },
            }}
          />
        </DataSource>
      )}
    </React.StrictMode>
  );
}

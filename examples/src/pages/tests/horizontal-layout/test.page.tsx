import {
  InfiniteTable,
  DataSource,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

import * as React from 'react';
import { useState } from 'react';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  country: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
  salary: number;
};

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    type: 'number',
    defaultWidth: 100,
    style: {
      // background: 'rgba(255, 99, 71, 0.4)',
    },
  },
  canDesign: {
    field: 'canDesign',
    defaultWidth: 200,
    style: {
      // background: 'rgba(211, 119, 171, 0.3)',
    },
  },
  salary: {
    field: 'salary',
    type: 'number',
    defaultWidth: 300,
    style: {
      // background: 'rgba(55, 99, 171, 0.5)',
    },
  },
  firstName: {
    field: 'firstName',
    style: {
      // background: 'rgb(111 255 72 / 48%)',
    },
  },
  // age: {
  //   field: 'age',
  //   type: 'number',
  // },

  // stack: { field: 'stack', renderMenuIcon: false },
  // currency: { field: 'currency' },
  // country: { field: 'country' },
};

const domProps = {
  // style: { height: 420 /*30px header, 420 body*/, width: 230 },
  style: { height: '50vh' /*30px header, 420 body*/, width: '100vw' },
};

const data = Array.from({ length: 1000 }, (_, i) => ({
  id: i,
  preferredLanguage: `Lang ${i}`,
  age: i * 10,
  salary: i * 1000,
  firstName: `John ${i}`,
  lastName: `Doe ${i}`,
  currency: `USD ${i}`,
  country: `USA ${i}`,
  canDesign: i % 2 === 0 ? ('yes' as const) : ('no' as const),
  stack: i % 2 === 0 ? 'frontend' : 'backend',
}));

export default function App() {
  const [wrapRowsHorizontally, setWrapRowsHorizontally] = useState(true);
  return (
    <>
      <button
        onClick={() => {
          setWrapRowsHorizontally(!wrapRowsHorizontally);
        }}
      >
        toggle
      </button>
      <input type="text" defaultValue="" />
      <DataSource<Developer>
        primaryKey="id"
        data={data}
        key={`${wrapRowsHorizontally}`}
      >
        <InfiniteTable<Developer>
          wrapRowsHorizontally={wrapRowsHorizontally}
          rowHeight={50}
          domProps={domProps}
          header={true}
          columnHeaderHeight={30}
          columns={columns}
          columnDefaultWidth={200}
          onCellClick={({ rowIndex, colIndex }) => {
            console.log('clicked', rowIndex, colIndex);
          }}
        />
      </DataSource>
    </>
  );
}

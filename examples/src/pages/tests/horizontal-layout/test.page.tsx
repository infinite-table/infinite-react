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
  },
  canDesign: {
    field: 'canDesign',
  },
  salary: {
    field: 'salary',
    type: 'number',
  },
  // firstName: {
  //   field: 'firstName',
  // },
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
  style: { height: '50vh' /*30px header, 420 body*/, width: '80vw' },
};

const data = Array.from({ length: 50 }, (_, i) => ({
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

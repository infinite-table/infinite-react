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
    // defaultWidth: 50,
  },
  canDesign: {
    field: 'canDesign',
    defaultWidth: 150,
  },
  salary: {
    field: 'salary',
    type: 'number',
    defaultWidth: 80,
  },
  firstName: {
    field: 'firstName',
    defaultWidth: 120,
  },
  age: {
    field: 'age',
    type: 'number',
    defaultWidth: 90,
  },

  stack: { field: 'stack', renderMenuIcon: false, defaultWidth: 110 },
  // currency: { field: 'currency' },
  // country: { field: 'country' },
};

const domProps = {
  // style: { height: 420 /*30px header, 420 body*/, width: 230 },
  style: { height: '50vh' /*30px header, 420 body*/, width: '80vw' },
};

const data = Array.from({ length: 5000 }, (_, i) => ({
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

(globalThis as any).INFINITE_API = null;
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
        defaultCellSelection={{
          defaultSelection: false,
          selectedCells: [],
        }}
      >
        <InfiniteTable<Developer>
          onReady={({ api }) => {
            (globalThis as any).INFINITE_API = api;
          }}
          wrapRowsHorizontally={wrapRowsHorizontally}
          rowHeight={50}
          domProps={domProps}
          header={true}
          columnHeaderHeight={30}
          columns={columns}
          keyboardNavigation="cell"
          columnDefaultWidth={100}
          onCellClick={({ rowIndex, colIndex }) => {
            console.log('clicked', rowIndex, colIndex);
          }}
        />
      </DataSource>
    </>
  );
}

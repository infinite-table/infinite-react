import {
  InfiniteTable,
  DataSource,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

import * as React from 'react';
import { useState } from 'react';

type Developer = {
  id: number;
  preferredLanguage: string;
  age: number;
  salary: number;
};
const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    type: 'number',
  },
  preferredLanguage: { field: 'preferredLanguage' },
  // age: { field: 'age' },
  // salary: { field: 'salary' },
};

const domProps = {
  // style: { height: 420 /*30px header, 420 body*/, width: 230 },
  style: { height: '50vh' /*30px header, 420 body*/, width: '50vw' },
};

const data = Array.from({ length: 10 }, (_, i) => ({
  id: i,
  preferredLanguage: `Lang ${i}`,
  age: i * 10,
  salary: i * 1000,
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
      <DataSource<Developer>
        primaryKey="id"
        data={data}
        key={`${wrapRowsHorizontally}`}
      >
        <InfiniteTable<Developer>
          wrapRowsHorizontally={wrapRowsHorizontally}
          rowHeight={50}
          domProps={domProps}
          header={false}
          columnHeaderHeight={30}
          columns={columns}
          columnDefaultWidth={100}
          onCellClick={({ rowIndex, colIndex }) => {
            console.log('clicked', rowIndex, colIndex);
          }}
        />
      </DataSource>
    </>
  );
}

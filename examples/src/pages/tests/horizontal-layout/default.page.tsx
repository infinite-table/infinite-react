import {
  InfiniteTable,
  DataSource,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

import * as React from 'react';
import { useState } from 'react';
import { Developer, dataSource } from './horiz-layout-data';

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    type: 'number',
    /*xdefaultWidth: 80,*/ renderValue: ({ value }) => value - 1,
    style: (options) => {
      return {
        // background : options.rowInfo.
      };
    },
  },
  preferredLanguage: { field: 'preferredLanguage' /*xdefaultWidth: 110 */ },
  // age: { field: 'age' /*xdefaultWidth: 70 */ },
  // salary: {
  //   field: 'salary',
  //   type: 'number',
  //   /*xdefaultWidth: 100,*/
  // },
};

export function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

const domProps = { style: { height: '30vh', width: '90vw' } };
// const domProps = { style: { height: '30vh', width: 300 } };

// dataSource.length = 12;

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
        data={dataSource}
        key={`${wrapRowsHorizontally}`}
      >
        <InfiniteTable<Developer>
          wrapRowsHorizontally={wrapRowsHorizontally}
          rowHeight={50}
          domProps={domProps}
          columns={columns}
          columnDefaultWidth={150}
          onCellClick={({ rowIndex, colIndex }) => {
            console.log('clicked', rowIndex, colIndex);
          }}
        />
      </DataSource>
    </>
  );
}

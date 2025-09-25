import {
  InfiniteTable,
  DataSource,
  type InfiniteTablePropColumns,
  useInfiniteColumnCell,
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

globalThis.React = React;
const columns: InfiniteTablePropColumns<Developer> = {
  isFavorite: {
    defaultWidth: 21,
    header: 'fav',
    style: {
      backgroundColor: 'rgba(0, 0, 155, 0.4)',
    },
  },
  label: {
    header: 'label',
    defaultWidth: 150,
    // field: 'label',
    style: {
      backgroundColor: 'rgba(200, 200, 0, 0.4)',
    },
  },
  bidSize: {
    header: 'bidSize',
    // field: 'bidSize',
    defaultWidth: 45,
    style: {
      backgroundColor: 'rgba(200, 250, 0, 0.4)',
    },
  },
  bidPrice: {
    header: 'bidPrice',
    type: 'number',
    defaultWidth: 65,
    // defaultWidth: 80,
    style: {
      backgroundColor: 'rgba(0, 200, 0, 0.4)',
    },
  },
  offerPrice: {
    header: 'offerPrice',
    type: 'number',
    defaultWidth: 65,
    style: {
      backgroundColor: 'rgba(255, 0, 0, 0.4)',
    },
  },
  offerSize: {
    header: 'offerSize',
    // field: 'offerSize',
    defaultWidth: 45,
    style: {
      backgroundColor: 'rgba(0, 255, 0, 0.4)',
    },
  },
  'blotter-bidSize': {
    header: 'blotter-bidSize',
    field: 'age',
    type: 'number',
    defaultWidth: 45,
    style: {
      backgroundColor: 'rgba(0, 200, 255, 0.4)',
    },
  },
  'blotter-bidPrice': {
    header: 'blotter-bidPrice',
    type: 'number',
    defaultWidth: 65,
    style: {
      backgroundColor: 'rgba(0, 200, 255, 0.4)',
    },
  },
  'blotter-offerPrice': {
    header: 'blotter-offerPrice',
    type: 'number',
    defaultWidth: 65,
    style: {
      backgroundColor: 'rgba(200, 0, 255, 0.4)',
    },
  },
  'blotter-offerSize': {
    header: 'blotter-offerSize',
    type: 'number',
    defaultWidth: 45,
    style: {
      backgroundColor: 'rgba(180, 0, 255, 0.4)',
    },
  },
};

Object.keys(columns).forEach((key) => {
  columns[key].render = ({}) => {
    return <CustomCmp />;
  };
});

function CustomCmp() {
  const { rowInfo, column } = useInfiniteColumnCell();
  // const now = Date.now();

  // while (Date.now() - now < 0.001) {
  //   // do nothing
  // }
  return (
    <div>
      {rowInfo.indexInAll}-{column.id}
    </div>
  );
}

const domProps = {
  // style: { height: 420 /*30px header, 420 body*/, width: 230 },
  style: { height: '80vh' /*30px header, 420 body*/, width: '100vw' },
};

const data = Array.from({ length: 10000 }, (_, i) => ({
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
          debugId="table"
          wrapRowsHorizontally={true}
          rowHeight={30}
          domProps={domProps}
          columnHeaderHeight={30}
          columns={columns}
          columnMinWidth={100}
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

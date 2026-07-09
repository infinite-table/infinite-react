import {
  InfiniteTable,
  DataSource,
  DataSourceData,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import {
  columns,
  developers1kDataSource,
  type Developer,
} from './common';

export default function App() {
  const [activeCellIndex, setActiveCellIndex] = React.useState<
    [number, number] | null
  >(null);
  const [gridHasFocus, setGridHasFocus] = React.useState(false);
  return (
    <div>
      <input
        placeholder="Type something"
        className="border border-gray-700 p-2 m-2"
      />

      <DataSource<Developer>
        primaryKey="id"
        data={developers1kDataSource as DataSourceData<Developer>}
      >
        <InfiniteTable<Developer>
          domProps={{ style: { height: '80vh' } }}
          columns={columns}
          activeCellIndex={gridHasFocus ? activeCellIndex : null}
          onActiveCellIndexChange={setActiveCellIndex}
          onSelfBlur={() => {
            setGridHasFocus(false);
          }}
          onSelfFocus={() => {
            setGridHasFocus(true);
          }}
        />
      </DataSource>
      <input
        placeholder="Type something else"
        className="border border-gray-700 p-2 m-2"
      />
    </div>
  );
}

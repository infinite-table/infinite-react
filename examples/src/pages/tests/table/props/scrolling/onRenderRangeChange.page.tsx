import * as React from 'react';

import {
  InfiniteTable,
  ScrollStopInfo,
  debounce,
} from '@infinite-table/infinite-react';
import { DataSource } from '@infinite-table/infinite-react';
import { TableRenderRange } from '@src/components/VirtualBrain/MatrixBrain';

import {
  columns,
  developers10kDataSource,
  renderRangeDomProps,
  type Developer,
} from './common';

const sinon = require('sinon');

const onRenderRangeChange = sinon.spy((_scrollInfo: ScrollStopInfo) => {});

(globalThis as any).onRenderRangeChange = onRenderRangeChange;

export default () => {
  const fn = React.useMemo(() => {
    return debounce(
      (range: TableRenderRange) => {
        console.log(range);
        onRenderRangeChange(range);
      },
      { wait: 20 },
    );
  }, []);
  return (
    <React.StrictMode>
      <>
        <DataSource<Developer> data={developers10kDataSource} primaryKey="id">
          <InfiniteTable<Developer>
            domProps={renderRangeDomProps}
            columnMinWidth={50}
            columnDefaultWidth={350}
            onRenderRangeChange={fn}
            columns={columns}
          />
        </DataSource>
      </>
    </React.StrictMode>
  );
};

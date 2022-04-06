import { TableRenderCellFnParam } from '@src/components/HeadlessTable/ReactHeadlessTableRenderer';
import { HeadlessTable } from '@src/components/HeadlessTable';

import * as React from 'react';

export default function App() {
  const renderCell = (param: TableRenderCellFnParam) => {
    const {
      rowIndex,
      colIndex,
      widthWithColspan,
      heightWithRowspan,
      colspan,
      rowspan,
      width,
      height,
      domRef,
    } = param;
    return (
      <b
        ref={domRef}
        style={{
          position: 'absolute',
          overflow: 'hidden',
          height: heightWithRowspan,
          width: widthWithColspan,
          zIndex: colspan > 1 || rowspan > 1 ? 1 : 0,
          background: 'white',
          left: 0,
          top: 0,
          border: '1px solid gray',
          color: rowIndex % 4 === 0 ? 'red' : 'black',
        }}
      >
        ({rowIndex}, {colIndex}).
      </b>
    );
  };

  return (
    <HeadlessTable
      rowHeight={40}
      colWidth={150}
      cols={50}
      rows={2000}
      height={1800}
      width={1500}
      renderCell={renderCell}
    />
  );
}

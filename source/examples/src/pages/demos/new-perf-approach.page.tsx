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
      rowFixed,
      colFixed,
      onMouseEnter,
      onMouseLeave,
      width,
      height,
      domRef,
    } = param;
    return (
      <b
        onMouseLeave={onMouseLeave}
        onMouseEnter={onMouseEnter}
        ref={domRef}
        style={{
          overflow: 'hidden',
          height: heightWithRowspan,
          width: widthWithColspan,
          zIndex: colspan > 1 || rowspan > 1 ? 1 : 0,
          background: rowFixed || colFixed ? 'yellow' : '#f6ac9f',
          border: '1px solid gray',
          color: rowIndex % 4 === 0 ? 'red' : 'black',
        }}
      >
        ({rowIndex}, {colIndex}).
      </b>
    );
  };

  return (
    <div style={{ border: '2px solid red', padding: '10px' }}>
      <HeadlessTable
        rowHeight={40}
        colWidth={150}
        fixedColsStart={2}
        fixedColsEnd={2}
        fixedRowsStart={2}
        fixedRowsEnd={2}
        cols={1100}
        rows={50000}
        height={1000}
        width={1900}
        renderCell={renderCell}
      />
    </div>
  );
}

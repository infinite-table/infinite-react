// import { TableRenderCellFnParam } from '@src/components/HeadlessTable/ReactHeadlessTableRenderer';
// import { HeadlessTableWithPinnedContainers } from '@src/components/HeadlessTable/HeadlessTableWithPinnedContainers';

import * as React from 'react';
import { MatrixBrain } from '@src/components/VirtualBrain/MatrixBrain';
import { HeadlessTable } from '@src/components/HeadlessTable';
import { useState } from 'react';
import { TableRenderCellFnParam } from '@src/components/HeadlessTable/rendererTypes';

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
      domRef,
    } = param;
    return (
      <b
        onMouseLeave={onMouseLeave}
        onMouseEnter={onMouseEnter}
        ref={domRef as React.Ref<HTMLElement>}
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
  const [brain] = React.useState(() => new MatrixBrain('test'));

  (globalThis as any).brain = brain;

  const [height, setHeight] = useState(1200);

  const width = 1200;
  // React.useEffect(() => {
  //   debugger;
  //   brain.update({
  //     height,
  //     width,
  //   });
  // }, [width, height]);

  React.useEffect(() => {
    brain.updateFixedCells({
      fixedColsStart: 0,
      fixedColsEnd: 2,
      // fixedRowsStart: 2,
      // fixedRowsEnd: 2,
    });
    brain.update({
      rowHeight: 40,
      colWidth: 150,
      width: width,
      height: height,
      rows: 1500,
      cols: 4,
    });
  }, [width, height]);
  return (
    <>
      <button
        onClick={() => {
          setHeight((h) => h + 100);
        }}
      >
        +
      </button>
      <button
        onClick={() => {
          setHeight((h) => h - 100);
        }}
      >
        -
      </button>
      <div style={{ border: '2px solid red', padding: '10px' }}>
        {/* <HeadlessTableWithPinnedContainers */}
        <HeadlessTable
          brain={brain}
          // rowHeight={40}
          // colWidth={150}
          // fixedColsStart={2}
          // fixedColsEnd={2}
          // fixedRowsStart={2}
          // fixedRowsEnd={2}
          activeCellRowHeight={40}
          cols={1100}
          rows={5000}
          height={height}
          width={width}
          style={{
            width,
            height,
          }}
          renderCell={renderCell}
        />
      </div>
    </>
  );
}

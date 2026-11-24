import * as React from 'react';

import { HeadlessTable } from '@src/components/HeadlessTable';
import { TableRenderCellFnParam } from '@src/components/HeadlessTable/rendererTypes';
import { MatrixBrain } from '@src/components/VirtualBrain/MatrixBrain';

import {
  CELL_BACKGROUND,
  COLS,
  FIXED,
  GRID,
  ROWS,
  colWidth,
  getCellKind,
  rowHeight,
} from './pinnedRowsAndColsData';

const renderCell = (param: TableRenderCellFnParam) => {
  const { rowIndex, colIndex, widthWithColspan, heightWithRowspan, domRef } =
    param;
  const kind = getCellKind(rowIndex, colIndex);

  return (
    <div
      ref={domRef as React.Ref<HTMLDivElement>}
      data-cell={`${rowIndex},${colIndex}`}
      data-kind={kind}
      style={{
        width: widthWithColspan,
        height: heightWithRowspan,
        boxSizing: 'border-box',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        padding: '0 4px',
        font: '12px/24px sans-serif',
        color: '#222',
        background: CELL_BACKGROUND[kind],
        borderRight: '1px solid #ccc',
        borderBottom: '1px solid #ccc',
      }}
    >
      {rowIndex},{colIndex}
    </div>
  );
};

export default function App() {
  const [brain] = React.useState(() => {
    const brain = new MatrixBrain('pinned-rows-and-cols');
    brain.updateFixedCells(FIXED);
    brain.update({
      rows: ROWS,
      cols: COLS,
      rowHeight,
      colWidth,
      width: GRID.width,
      height: GRID.height,
    });
    return brain;
  });

  const [size, setSize] = React.useState(GRID);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    (globalThis as any).setGridSize = (width: number, height: number) =>
      setSize({ width, height });
    setReady(true);
  }, []);

  return (
    <div style={{ padding: 20, font: '14px sans-serif', color: '#222' }}>
      <style>{`body { background: white; }`}</style>
      <p style={{ margin: '0 0 12px' }}>
        A HeadlessTable on its own: {ROWS} rows × {COLS} columns, with 2 rows
        and 2 columns pinned at each end. Pinned rows are yellow, pinned
        columns blue, the 4 corners orange. Each cell shows its row,column.
      </p>
      <div
        id="host"
        data-ready={ready}
        style={{
          // HeadlessTable fills its nearest positioned ancestor
          position: 'relative',
          width: size.width,
          height: size.height,
          border: '1px solid #888',
        }}
      >
        <HeadlessTable
          brain={brain}
          renderCell={renderCell}
          activeCellRowHeight={undefined}
          tabIndex={0}
        />
      </div>
    </div>
  );
}

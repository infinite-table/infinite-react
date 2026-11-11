import * as React from 'react';

import {
  DataSource,
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

import {
  BENCH_COLUMNS,
  BENCH_COLUMN_WIDTH,
  BENCH_HEADER_HEIGHT,
  BENCH_ROW_HEIGHT,
  BenchRow,
} from './data';
import { BenchAdapter } from './harness';
import { BenchmarkPage } from './BenchmarkPage';

const columns: InfiniteTablePropColumns<BenchRow> = Object.fromEntries(
  BENCH_COLUMNS.map((c) => [
    c.field,
    {
      field: c.field,
      header: c.header,
      type: c.type === 'number' ? 'number' : 'string',
    },
  ]),
);

declare const __INFINITE_VERSION__: string;

// Set here and not in _app, so the AG Grid pages don't load Infinite Table.
// Without a license key the grid works the same, but shows a footer.
if (process.env.NEXT_PUBLIC_INFINITE_LICENSE_KEY) {
  InfiniteTable.licenseKey = process.env.NEXT_PUBLIC_INFINITE_LICENSE_KEY;
}

const CELL = '.InfiniteColumnCell:not(.InfiniteDetachedCell)';

const root = () =>
  document.querySelector<HTMLElement>(
    '[data-benchmark-grid="infinite"] .Infinite',
  );

const scroller = () =>
  root()?.querySelector<HTMLElement>('.InfiniteVirtualScrollContainer') ?? null;

const adapter: BenchAdapter = {
  grid: 'infinite',
  version: __INFINITE_VERSION__,
  getRoot: root,
  getVerticalScroller: scroller,
  getHorizontalScroller: scroller,
  getBodyRect: () => {
    const el = scroller();
    if (!el) {
      return null;
    }
    const rect = el.getBoundingClientRect();
    return {
      left: rect.left + el.clientLeft,
      top: rect.top + el.clientTop,
      width: el.clientWidth,
      height: el.clientHeight,
    };
  },
  getRenderedColumnCells: (field) =>
    Array.from(
      root()?.querySelectorAll<HTMLElement>(
        `${CELL}[data-column-id="${field}"]`,
      ) ?? [],
    ),
  getRenderedRowCells: (rowIndex) =>
    Array.from(
      root()?.querySelectorAll<HTMLElement>(
        `${CELL}[data-row-index="${rowIndex}"]`,
      ) ?? [],
    ),
  getCellRowIndex: (cell) => Number(cell.getAttribute('data-row-index') ?? -1),
  getCellColumnId: (cell) => cell.getAttribute('data-column-id') ?? '',
  getCell: (rowIndex, field) =>
    root()?.querySelector<HTMLElement>(
      `${CELL}[data-row-index="${rowIndex}"][data-column-id="${field}"]`,
    ) ?? null,
  getHeaderCell: (field) =>
    root()?.querySelector<HTMLElement>(
      `.InfiniteHeaderCell[data-column-id="${field}"]`,
    ) ?? null,
};

/**
 * Infinite Table with defaults - only row height / header height / column
 * widths are set, to match the AG Grid setup.
 */
const domProps = { style: { flex: 1, minHeight: 0 } };
function Infinite({ data }: { data: BenchRow[] }) {
  return (
    <DataSource<BenchRow> data={data} primaryKey="id">
      <InfiniteTable<BenchRow>
        columns={columns}
        rowHeight={BENCH_ROW_HEIGHT}
        columnHeaderHeight={BENCH_HEADER_HEIGHT}
        columnDefaultWidth={BENCH_COLUMN_WIDTH}
        domProps={domProps}
      />
    </DataSource>
  );
}

export function InfiniteBenchmark({ rowCount }: { rowCount: number }) {
  return (
    <BenchmarkPage
      title={`Infinite Table ${__INFINITE_VERSION__}`}
      rowCount={rowCount}
      adapter={adapter}
      renderGrid={(data) => <Infinite data={data} />}
    />
  );
}

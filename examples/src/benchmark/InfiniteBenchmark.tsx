import * as React from 'react';

import {
  DataSource,
  DataSourceApi,
  DataSourcePropAggregationReducers,
  DataSourcePropFilterValue,
  DataSourcePropGroupBy,
  DataSourcePropSortInfo,
  GroupRowsState,
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
import { BenchGridProps, BenchmarkPage } from './BenchmarkPage';
import {
  BENCH_AGGREGATE_FIELD,
  BENCH_FILTER_FIELD,
  BENCH_FILTER_MIN,
  BENCH_GROUP_FIELD,
  BENCH_SORT_DIR,
  BENCH_SORT_FIELD,
} from './updates';

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

// the views of the live-update scenarios - see updates.ts
const sortInfo: DataSourcePropSortInfo<BenchRow> = {
  field: BENCH_SORT_FIELD,
  dir: BENCH_SORT_DIR,
  // a sortInfo for a field (not a column) compares strings by default
  type: 'number',
};
const filterValue: DataSourcePropFilterValue<BenchRow> = [
  {
    field: BENCH_FILTER_FIELD,
    filter: { type: 'number', operator: 'gte', value: BENCH_FILTER_MIN },
  },
];
const groupBy: DataSourcePropGroupBy<BenchRow> = [{ field: BENCH_GROUP_FIELD }];
const aggregationReducers: DataSourcePropAggregationReducers<BenchRow> = {
  [BENCH_AGGREGATE_FIELD]: {
    field: BENCH_AGGREGATE_FIELD,
    initialValue: 0,
    reducer: (sum: number, value: number) => sum + value,
  },
};
const collapsedGroups = () =>
  new GroupRowsState({ expandedRows: [], collapsedRows: true });

/**
 * Infinite Table with defaults - only row height / header height / column
 * widths are set, to match the AG Grid setup.
 *
 * Rows are changed with `dataSourceApi.updateDataArray`, the API Infinite
 * Table documents for live updates. In the filtered view the column filters
 * are not shown in the header (`showColumnFilters={false}`), so the header has
 * the same height as in the other grids.
 */
const domProps = { style: { flex: 1, minHeight: 0 } };
function Infinite({ data, view, onUpdater }: BenchGridProps) {
  const [groupRowsState] = React.useState(collapsedGroups);
  const onReady = React.useCallback(
    (api: DataSourceApi<BenchRow>) => {
      onUpdater((rows) => {
        api.updateDataArray(rows);
      });
    },
    [onUpdater],
  );
  return (
    <DataSource<BenchRow>
      data={data}
      primaryKey="id"
      onReady={onReady}
      defaultSortInfo={view === 'sorted' ? sortInfo : undefined}
      defaultFilterValue={view === 'filtered' ? filterValue : undefined}
      groupBy={view === 'grouped' ? groupBy : undefined}
      aggregationReducers={
        view === 'grouped' ? aggregationReducers : undefined
      }
      defaultGroupRowsState={view === 'grouped' ? groupRowsState : undefined}
    >
      <InfiniteTable<BenchRow>
        columns={columns}
        rowHeight={BENCH_ROW_HEIGHT}
        columnHeaderHeight={BENCH_HEADER_HEIGHT}
        columnDefaultWidth={BENCH_COLUMN_WIDTH}
        domProps={domProps}
        showColumnFilters={view === 'filtered' ? false : undefined}
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
      renderGrid={(props) => <Infinite {...props} />}
    />
  );
}

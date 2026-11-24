import * as React from 'react';

import { AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  ColDef,
  GetRowIdParams,
  GridReadyEvent,
  GridState,
  ModuleRegistry,
  themeQuartz,
} from 'ag-grid-community';

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
  BENCH_FILTER_FIELD,
  BENCH_FILTER_MIN,
  BENCH_SORT_DIR,
  BENCH_SORT_FIELD,
  BenchView,
} from './updates';

declare const __AG_GRID_VERSION__: string;

ModuleRegistry.registerModules([AllCommunityModule]);

const columnDefs: ColDef<BenchRow>[] = BENCH_COLUMNS.map((c) => ({
  field: c.field,
  headerName: c.header,
  cellDataType: c.type === 'number' ? 'number' : 'text',
  width: BENCH_COLUMN_WIDTH,
  sortable: true,
}));

// the filtered view: the salary column has AG Grid's number filter (columns
// have no filter by default)
const filteredColumnDefs: ColDef<BenchRow>[] = columnDefs.map((c) =>
  c.field === BENCH_FILTER_FIELD ? { ...c, filter: 'agNumberColumnFilter' } : c,
);

const getRowId = (params: GetRowIdParams<BenchRow>) => String(params.data.id);

const root = () =>
  document.querySelector<HTMLElement>(
    '[data-benchmark-grid="ag-grid"] .ag-root-wrapper',
  );

// AG Grid 36: one native scroller (.ag-grid-viewport) for both axes, with a
// sticky header inside it and the body rows in .ag-grid-scrolling-rows
const viewport = () =>
  root()?.querySelector<HTMLElement>('.ag-grid-viewport') ?? null;

const centerRows = () =>
  root()?.querySelector<HTMLElement>('.ag-grid-scrolling-rows') ?? null;

const adapter: BenchAdapter = {
  grid: 'ag-grid',
  version: __AG_GRID_VERSION__,
  getRoot: root,
  getVerticalScroller: viewport,
  getHorizontalScroller: viewport,
  getBodyRect: () => {
    const el = viewport();
    const header = root()?.querySelector<HTMLElement>('.ag-header');
    if (!el || !header) {
      return null;
    }
    const rect = el.getBoundingClientRect();
    const top = header.getBoundingClientRect().bottom;
    return {
      left: rect.left + el.clientLeft,
      top,
      width: el.clientWidth,
      height: rect.top + el.clientTop + el.clientHeight - top,
    };
  },
  getRenderedColumnCells: (field) =>
    Array.from(
      centerRows()?.querySelectorAll<HTMLElement>(
        `.ag-row .ag-cell[col-id="${field}"]`,
      ) ?? [],
    ),
  getRenderedRowCells: (rowIndex) =>
    Array.from(
      centerRows()?.querySelectorAll<HTMLElement>(
        `.ag-row[row-index="${rowIndex}"] .ag-cell`,
      ) ?? [],
    ),
  getCellRowIndex: (cell) =>
    Number(cell.closest('.ag-row')?.getAttribute('row-index') ?? -1),
  getCellColumnId: (cell) => cell.getAttribute('col-id') ?? '',
  getCell: (rowIndex, field) =>
    centerRows()?.querySelector<HTMLElement>(
      `.ag-row[row-index="${rowIndex}"] .ag-cell[col-id="${field}"]`,
    ) ?? null,
  getHeaderCell: (field) =>
    root()?.querySelector<HTMLElement>(`.ag-header-cell[col-id="${field}"]`) ??
    null,
};

// the views of the live-update scenarios - see updates.ts. AG Grid
// Community has no row grouping or aggregation: it has no `grouped` view
const initialStates: Partial<Record<BenchView, GridState>> = {
  sorted: {
    sort: {
      sortModel: [
        { colId: BENCH_SORT_FIELD, sort: BENCH_SORT_DIR === -1 ? 'desc' : 'asc' },
      ],
    },
  },
  filtered: {
    filter: {
      filterModel: {
        [BENCH_FILTER_FIELD]: {
          filterType: 'number',
          type: 'greaterThanOrEqual',
          filter: BENCH_FILTER_MIN,
        },
      },
    },
  },
};

const style = { flex: 1, minHeight: 0 };
/**
 * AG Grid with defaults, except for the settings below, which only make the
 * setup match the Infinite Table one:
 *  - same row height / header height / column widths
 *  - animateRows: false - Infinite does not animate row moves on sort, and the
 *    animation would make "sorted rows visible" ambiguous
 *  - getRowId - Infinite always has a primary key
 *
 * Rows are changed with `api.applyTransaction({ update })`, the transaction
 * API AG Grid documents for updating rows.
 */
function AgGrid({ data, view, onUpdater }: BenchGridProps) {
  if (view === 'grouped') {
    throw new Error('AG Grid Community has no row grouping');
  }
  const onGridReady = React.useCallback(
    ({ api }: GridReadyEvent<BenchRow>) => {
      onUpdater((rows) => {
        api.applyTransaction({ update: rows });
      });
    },
    [onUpdater],
  );
  return (
    <div style={style}>
      <AgGridReact<BenchRow>
        theme={themeQuartz}
        initialState={initialStates[view]}
        onGridReady={onGridReady}
        rowData={data}
        columnDefs={view === 'filtered' ? filteredColumnDefs : columnDefs}
        getRowId={getRowId}
        rowHeight={BENCH_ROW_HEIGHT}
        headerHeight={BENCH_HEADER_HEIGHT}
        animateRows={false}
      />
    </div>
  );
}

export function AgGridBenchmark({ rowCount }: { rowCount: number }) {
  return (
    <BenchmarkPage
      title={`AG Grid ${__AG_GRID_VERSION__}`}
      rowCount={rowCount}
      adapter={adapter}
      renderGrid={(props) => <AgGrid {...props} />}
    />
  );
}

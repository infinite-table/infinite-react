import * as React from 'react';

import {
  DataSource,
  DataSourceApi,
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

/**
 * A cell whose content depends on rows OTHER than its own goes stale when one
 * of those other rows is updated: its own rowInfo did not change, so the
 * (memoized) cell is never told to render again.
 *
 * `repaintCellsKey` fixes this - here in three flavours:
 *   - "no key"       : the stale baseline
 *   - "any change"   : column fn key returning `originalDataArrayChangedInfo`
 *                      - a new object on every data change -> repaints on any change
 *   - "segment avg"  : column fn key returning the segment average itself
 *                      -> repaints only the cells whose value actually changed
 *   - the table-level `repaintCellsKey` (a number) is bumped by the
 *     "repaint all" button - it repaints the columns without their own key
 *     ("no key"), but NOT the ones that have one (the column key wins).
 */
type Sale = { id: number; account: string; segment: string; revenue: number };

const data: Sale[] = [
  { id: 1, account: 'Acme', segment: 'Enterprise', revenue: 100 },
  { id: 2, account: 'Globex', segment: 'Enterprise', revenue: 200 },
  { id: 3, account: 'Initech', segment: 'Enterprise', revenue: 300 },
  { id: 4, account: 'Hooli', segment: 'SMB', revenue: 10 },
  { id: 5, account: 'Vandelay', segment: 'SMB', revenue: 30 },
];

// per-cell render counts, read by the spec: `${columnId}:${rowId}` -> count
const renderCounts: Record<string, number> = {};
(globalThis as any).renderCounts = renderCounts;

function countRender(columnId: string, rowId: number) {
  const key = `${columnId}:${rowId}`;
  renderCounts[key] = (renderCounts[key] ?? 0) + 1;
}

function segmentAvg(rows: Sale[], segment: string) {
  const segmentRows = rows.filter((row) => row.segment === segment);
  return (
    segmentRows.reduce((sum, row) => sum + row.revenue, 0) / segmentRows.length
  );
}

const columns: InfiniteTablePropColumns<Sale> = {
  id: { field: 'id', defaultWidth: 60 },
  account: { field: 'account' },
  segment: { field: 'segment' },
  revenue: { field: 'revenue', type: 'number', defaultEditable: true },
  noKey: {
    header: 'segment avg (no key)',
    type: 'number',
    render: ({ rowInfo, dataSourceApi }) => {
      if (rowInfo.isGroupRow) {
        return null;
      }
      countRender('noKey', rowInfo.id);
      return (
        <>
          {segmentAvg(dataSourceApi.getOriginalDataArray(), rowInfo.data.segment)}
        </>
      );
    },
  },
  anyChange: {
    header: 'segment avg (key: any change)',
    type: 'number',
    // a new object on every data change
    repaintCellsKey: ({ dataSourceState }) =>
      dataSourceState.originalDataArrayChangedInfo,
    render: ({ rowInfo, dataSourceApi }) => {
      if (rowInfo.isGroupRow) {
        return null;
      }
      countRender('anyChange', rowInfo.id);
      return (
        <>
          {segmentAvg(dataSourceApi.getOriginalDataArray(), rowInfo.data.segment)}
        </>
      );
    },
  },
  segmentKey: {
    header: 'segment avg (key: segment avg)',
    type: 'number',
    // the derived value is the key - the cell repaints only when it changes
    repaintCellsKey: ({
      rowInfo,
      dataSourceState,
      previousDataSourceState,
    }) => {
      if (rowInfo.isGroupRow) {
        return null;
      }
      (globalThis as any).lastRepaintCellsKeyParams = {
        rowId: rowInfo.id,
        hasPreviousState: !!previousDataSourceState,
        previousLength: previousDataSourceState?.originalDataArray.length,
        currentLength: dataSourceState.originalDataArray.length,
      };
      return segmentAvg(dataSourceState.originalDataArray, rowInfo.data.segment);
    },
    render: ({ rowInfo, dataSourceApi }) => {
      if (rowInfo.isGroupRow) {
        return null;
      }
      countRender('segmentKey', rowInfo.id);
      return (
        <>
          {segmentAvg(dataSourceApi.getOriginalDataArray(), rowInfo.data.segment)}
        </>
      );
    },
  },
};

export default function RepaintCellsKeyPage() {
  const [dataSourceApi, setDataSourceApi] =
    React.useState<DataSourceApi<Sale>>();
  const [repaintCellsKey, setRepaintCellsKey] = React.useState(0);

  return (
    <React.StrictMode>
      <div
        style={{ display: 'flex', gap: 8, padding: 8, alignItems: 'center' }}
      >
        <button
          data-name="update"
          onClick={() => {
            dataSourceApi!.updateData({ id: 1, revenue: 400 });
          }}
        >
          Acme 100 -&gt; 400 (Enterprise avg becomes 300)
        </button>
        <button
          data-name="reset"
          onClick={() => {
            dataSourceApi!.updateData({ id: 1, revenue: 100 });
          }}
        >
          Reset Acme to 100 (avg back to 200)
        </button>
        <button
          data-name="repaint-all"
          onClick={() => setRepaintCellsKey((key) => key + 1)}
        >
          repaint all (bump table repaintCellsKey)
        </button>
        <span data-name="repaint-key">{repaintCellsKey}</span>
      </div>

      <DataSource<Sale> data={data} primaryKey="id" onReady={setDataSourceApi}>
        <InfiniteTable<Sale>
          domProps={{ style: { height: 400, margin: 8 } }}
          columnDefaultWidth={200}
          columns={columns}
          repaintCellsKey={repaintCellsKey}
        />
      </DataSource>
    </React.StrictMode>
  );
}

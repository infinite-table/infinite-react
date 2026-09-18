import * as React from 'react';

import {
  DataSource,
  DataSourceApi,
  DataSourcePropAggregationReducers,
  InfiniteTable,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

/**
 * Minimal repro: a cell whose content depends on rows OTHER than its own
 * goes stale when one of those other rows is updated.
 *
 * Two such columns, both using only what Infinite provides:
 *   - "group avg (rowInfo.parents)": the leaf renders its parent group's
 *     `reducerResults.revenue` — the same number the group row shows
 *   - "avg via api": the leaf averages `dataSourceApi.getOriginalDataArray()`
 *     for its segment — works without grouping as well
 *
 * Click "Acme 100 -> 400". Enterprise average becomes 300.
 *   - the group row shows 300           -> its reducerResults changed, the rowInfo diff notifies it
 *   - Acme's two cells show 300         -> its own data changed, notified
 *   - Globex's and Initech's cells      -> STILL 200. Their rowInfo is considered equal
 *                                          (`parents` is excluded from the diff, `data` is the
 *                                          same object), so they are never notified and never
 *                                          re-render.
 * Untick "group by segment": the "avg via api" column shows the same
 * staleness with no grouping involved. Toggling grouping re-renders the
 * table and "fixes" the cells, which is the point: nothing is cached, the
 * cells were simply not told to render again.
 */
type Sale = { id: number; account: string; segment: string; revenue: number };

const data: Sale[] = [
  { id: 1, account: 'Acme', segment: 'Enterprise', revenue: 100 },
  { id: 2, account: 'Globex', segment: 'Enterprise', revenue: 200 },
  { id: 3, account: 'Initech', segment: 'Enterprise', revenue: 300 },
  { id: 4, account: 'Hooli', segment: 'SMB', revenue: 10 },
  { id: 5, account: 'Vandelay', segment: 'SMB', revenue: 30 },
];

const columns: InfiniteTablePropColumns<Sale> = {
  id: { field: 'id', defaultWidth: 60 },
  account: { field: 'account' },
  segment: { field: 'segment' },
  revenue: { field: 'revenue', type: 'number', defaultEditable: true },
  groupAvg: {
    header: 'group avg (rowInfo.parents)',
    type: 'number',
    defaultWidth: 220,
    render: ({ rowInfo }) => {
      if (rowInfo.isGroupRow || !rowInfo.dataSourceHasGrouping) {
        return null;
      }
      const parentGroup = rowInfo.parents[rowInfo.parents.length - 1];
      return <>{parentGroup?.reducerResults?.revenue}</>;
    },
  },
  avgViaApi: {
    header: 'avg via api (getOriginalDataArray)',
    type: 'number',
    defaultWidth: 260,
    render: ({ rowInfo, dataSourceApi }) => {
      if (rowInfo.isGroupRow) {
        return null;
      }
      const rows = dataSourceApi
        .getOriginalDataArray()
        .filter((row) => row.segment === rowInfo.data.segment);
      const avg = rows.reduce((sum, row) => sum + row.revenue, 0) / rows.length;
      return <>{avg}</>;
    },
  },
};

const aggregationReducers: DataSourcePropAggregationReducers<Sale> = {
  revenue: {
    field: 'revenue',
    initialValue: 0,
    reducer: (acc, value) => acc + value,
    done: (sum, arr) => (arr.length ? sum / arr.length : 0),
  },
};

export default function CrossRowCellStale() {
  const [dataSourceApi, setDataSourceApi] =
    React.useState<DataSourceApi<Sale>>();
  const [grouped, setGrouped] = React.useState(true);

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
        <label>
          <input
            type="checkbox"
            data-name="grouped"
            checked={grouped}
            onChange={(event) => setGrouped(event.target.checked)}
          />
          group by segment
        </label>
      </div>

      <DataSource<Sale>
        data={data}
        primaryKey="id"
        onReady={setDataSourceApi}
        groupBy={grouped ? [{ field: 'segment' }] : []}
        aggregationReducers={aggregationReducers}
      >
        <InfiniteTable<Sale>
          domProps={{ style: { height: 400, margin: 8 } }}
          columnDefaultWidth={130}
          columns={columns}
        />
      </DataSource>
    </React.StrictMode>
  );
}

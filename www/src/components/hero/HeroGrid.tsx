'use client';

import {
  DataSource,
  InfiniteTable,
  type DataSourceApi,
  type DataSourceGroupBy,
  type DataSourcePivotBy,
  type InfiniteTableApi,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import {
  GROUP_REDUCERS,
  PIVOT_REDUCERS,
  getColumnMenuItems,
  groupColumn,
  useColumns,
} from './columns';
import type { HeroFeed } from './data/feed';
import type { Instrument } from './data/instruments';
import type { HeroDensity } from './themes';

export type HeroGridApis = {
  api: InfiniteTableApi<Instrument>;
  dataSourceApi: DataSourceApi<Instrument>;
};

const PIVOT_BY: DataSourcePivotBy<Instrument>[] = [{ field: 'assetClass' }];
// the generated group column ('group-by') goes first, then the ticker
const COLUMN_PINNING = { 'group-by': 'start', symbol: 'start' } as const;

/**
 * The id the Infinite Table DevTools extension lists this grid under. It also
 * names the grid's tracks in the Chrome DevTools profiler.
 */
const DEVTOOLS_DEBUG_ID = 'live-demo';

export type HeroGridProps = {
  feed: HeroFeed;
  rows: Instrument[];
  groupBy: DataSourceGroupBy<Instrument>[];
  onGroupByChange: (groupBy: DataSourceGroupBy<Instrument>[]) => void;
  pivot: boolean;
  density: HeroDensity;
  flashDuration: number;
  selectedId: number;
  onSelect: (id: number) => void;
  onReady: (apis: HeroGridApis) => void;
};

// narrow screens start without the long Name column, so Price fits
const NARROW_COLUMN_VISIBILITY: Record<string, false> = { name: false };

/**
 * The live blotter: one DataSource fed by the worker stream, rendered by one
 * InfiniteTable. Everything below is regular, documented Infinite Table API.
 */
export function HeroGrid({
  feed,
  rows,
  groupBy,
  onGroupByChange,
  pivot,
  density,
  flashDuration,
  selectedId,
  onSelect,
  onReady,
}: HeroGridProps) {
  const columns = useColumns(feed, flashDuration);
  const [initialVisibility] = React.useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 640
      ? NARROW_COLUMN_VISIBILITY
      : undefined,
  );
  const apisRef = React.useRef<HeroGridApis | null>(null);

  // keep the on-screen rows ticking briskly (see feed.ts — "visible-row subscription")
  React.useEffect(() => {
    feed.setFocusProvider(() => {
      const apis = apisRef.current;
      if (!apis || apis.api.isDestroyed()) return [];
      const range = apis.api.getVisibleRenderRange();
      const ids: number[] = [];
      for (
        let index = range.start[0];
        index < range.end[0] && ids.length < 200;
        index++
      ) {
        const rowInfo = apis.dataSourceApi.getRowInfoByIndex(index);
        if (rowInfo && !rowInfo.isGroupRow && rowInfo.data)
          ids.push((rowInfo.data as Instrument).id);
      }
      return ids;
    });
    return () => feed.setFocusProvider(null);
  }, [feed]);

  // big row counts: commits wait while the grid is being scrolled
  const scrollCleanupRef = React.useRef<(() => void) | null>(null);
  React.useEffect(() => () => scrollCleanupRef.current?.(), []);
  const watchScroll = (api: InfiniteTableApi<Instrument>) => {
    scrollCleanupRef.current?.();
    const scroller = api.scrollContainer;
    if (!scroller) return;
    const onScroll = () => feed.noteScroll();
    scroller.addEventListener('scroll', onScroll, { passive: true });
    scrollCleanupRef.current = () =>
      scroller.removeEventListener('scroll', onScroll);
  };

  const onRowSelectionChange = React.useCallback(
    (id: unknown) => {
      if (typeof id === 'number') onSelect(id);
    },
    [onSelect],
  );

  return (
    <DataSource<Instrument>
      primaryKey="id"
      data={rows}
      groupBy={groupBy}
      onGroupByChange={onGroupByChange}
      pivotBy={pivot ? PIVOT_BY : undefined}
      aggregationReducers={pivot ? PIVOT_REDUCERS : GROUP_REDUCERS}
      selectionMode="single-row"
      rowSelection={selectedId}
      onRowSelectionChange={onRowSelectionChange}
    >
      {({ pivotColumns, pivotColumnGroups }) => (
        <InfiniteTable<Instrument>
          debugId={DEVTOOLS_DEBUG_ID}
          columns={columns}
          pivotColumns={pivotColumns}
          pivotColumnGroups={pivotColumnGroups}
          pivotTotalColumnPosition="end"
          groupColumn={groupColumn}
          getColumnMenuItems={getColumnMenuItems}
          groupRenderStrategy="single-column"
          defaultColumnPinning={COLUMN_PINNING}
          defaultColumnVisibility={initialVisibility}
          columnDefaultWidth={110}
          rowHeight={density.rowHeight}
          columnHeaderHeight={density.headerHeight}
          keyboardNavigation="row"
          licenseKey={process.env.NEXT_PUBLIC_INFINITE_LICENSE_KEY}
          onReady={(apis) => {
            apisRef.current = apis;
            watchScroll(apis.api);
            onReady(apis);
          }}
        />
      )}
    </DataSource>
  );
}

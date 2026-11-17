'use client';

import {
  createFlashingColumnCellComponent,
  type DataSourcePropAggregationReducers,
  type InfiniteTableColumnRenderValueParam,
  type InfiniteTablePropColumns,
  type InfiniteTablePropGroupColumn,
  type InfiniteTableProps,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import * as aggregations from './aggregations';

import {
  ChangePill,
  DayRange,
  MoneyCell,
  Sparkline,
  SymbolCell,
  VolumeBar,
} from './cells';
import type { HeroFeed } from './data/feed';
import { currencyOf, spreadBpsOf, type Instrument } from './data/instruments';
import { formatCap, formatCompact, formatPrice, formatSigned } from './format';

type RenderParam = InfiniteTableColumnRenderValueParam<Instrument>;

export const GROUP_REDUCERS: DataSourcePropAggregationReducers<Instrument> =
  aggregations.GROUP_REDUCERS;
export const PIVOT_REDUCERS: DataSourcePropAggregationReducers<Instrument> =
  aggregations.PIVOT_REDUCERS;

/** The row's data for normal (leaf) rows; null for group rows. */
const leaf = (params: RenderParam): Instrument | null =>
  !params.rowInfo.isGroupRow && params.data
    ? (params.data as Instrument)
    : null;

type GetColumnMenuItems = NonNullable<
  InfiniteTableProps<Instrument>['getColumnMenuItems']
>;
type MenuItems = ReturnType<GetColumnMenuItems>;

export const getColumnMenuItems: GetColumnMenuItems = (items) =>
  aggregations.trimGroupByMenu(items ?? []) as MenuItems;

export function makeColumns(
  feed: HeroFeed,
  { flashDuration }: { flashDuration: number },
): InfiniteTablePropColumns<Instrument> {
  const FlashingCell = createFlashingColumnCellComponent({ flashDuration });

  return {
    symbol: {
      field: 'symbol',
      header: 'Symbol',
      defaultWidth: 118,
      renderValue: (params) => {
        const data = leaf(params);
        return data ? (
          <SymbolCell symbol={data.symbol} sector={data.sector} />
        ) : null;
      },
    },
    name: { field: 'name', header: 'Name', defaultWidth: 200 },
    price: {
      field: 'price',
      header: 'Price',
      type: 'number',
      align: 'end',
      defaultWidth: 100,
      components: { ColumnCell: FlashingCell },
      renderValue: (params) =>
        leaf(params) ? (
          <span className="hero-num">
            {formatPrice(params.value as number)}
          </span>
        ) : null,
    },
    changePct: {
      field: 'changePct',
      header: 'Chg %',
      type: 'number',
      align: 'end',
      defaultWidth: 104,
      renderValue: (params) =>
        typeof params.value === 'number' ? (
          <ChangePill value={params.value} />
        ) : null,
    },
    spark: {
      header: 'Trend',
      defaultWidth: 118,
      defaultSortable: false,
      valueGetter: ({ data }) => data.tick,
      renderValue: (params) => {
        const data = leaf(params);
        return data ? (
          <Sparkline feed={feed} id={data.id} tick={data.tick} />
        ) : null;
      },
    },
    volume: {
      field: 'volume',
      header: 'Volume',
      type: 'number',
      defaultWidth: 128,
      renderValue: (params) => {
        const data = leaf(params);
        if (data) return <VolumeBar id={data.id} volume={data.volume} />;
        return typeof params.value === 'number' ? (
          <span className="hero-num hero-dim">
            {formatCompact(params.value)}
          </span>
        ) : null;
      },
    },
    dayPnl: {
      field: 'dayPnl',
      header: 'Day P&L',
      type: 'number',
      align: 'end',
      defaultWidth: 108,
      components: { ColumnCell: FlashingCell },
      renderValue: (params) =>
        typeof params.value === 'number' ? (
          <MoneyCell value={params.value} />
        ) : null,
    },
    pnl: {
      field: 'pnl',
      header: 'Unreal. P&L',
      type: 'number',
      align: 'end',
      defaultWidth: 116,
      renderValue: (params) =>
        typeof params.value === 'number' ? (
          <MoneyCell value={params.value} />
        ) : null,
    },
    range: {
      header: 'Day range',
      defaultWidth: 112,
      defaultSortable: false,
      valueGetter: ({ data }) => data.price,
      renderValue: (params) => {
        const data = leaf(params);
        return data ? (
          <DayRange feed={feed} id={data.id} price={data.price} />
        ) : null;
      },
    },
    bid: {
      header: 'Bid',
      type: 'number',
      align: 'end',
      defaultWidth: 90,
      valueGetter: ({ data }) =>
        data.price * (1 - spreadBpsOf(data.id) / 20_000),
      renderValue: (params) =>
        leaf(params) ? (
          <span className="hero-num hero-dim">
            {formatPrice(params.value as number)}
          </span>
        ) : null,
    },
    ask: {
      header: 'Ask',
      type: 'number',
      align: 'end',
      defaultWidth: 90,
      valueGetter: ({ data }) =>
        data.price * (1 + spreadBpsOf(data.id) / 20_000),
      renderValue: (params) =>
        leaf(params) ? (
          <span className="hero-num hero-dim">
            {formatPrice(params.value as number)}
          </span>
        ) : null,
    },
    position: {
      field: 'position',
      header: 'Position',
      type: 'number',
      align: 'end',
      defaultWidth: 104,
      renderValue: (params) =>
        typeof params.value === 'number' ? (
          <span className="hero-num">{formatSigned(params.value)}</span>
        ) : null,
    },
    marketCap: {
      field: 'marketCap',
      header: 'Mkt cap',
      type: 'number',
      align: 'end',
      defaultWidth: 100,
      renderValue: (params) =>
        typeof params.value === 'number' ? (
          <span className="hero-num hero-dim">{formatCap(params.value)}</span>
        ) : null,
    },
    sector: { field: 'sector', header: 'Sector', defaultWidth: 132 },
    assetClass: { field: 'assetClass', header: 'Class', defaultWidth: 92 },
    region: { field: 'region', header: 'Region', defaultWidth: 104 },
    exchange: { field: 'exchange', header: 'Exchange', defaultWidth: 104 },
    currency: {
      header: 'Ccy',
      defaultWidth: 72,
      valueGetter: ({ data }) => currencyOf(data.exchange),
    },
  };
}

export const groupColumn: InfiniteTablePropGroupColumn<Instrument> = {
  header: 'Group',
  defaultWidth: 168,
  renderGroupValue: ({ value, rowInfo }) => (
    <span className="hero-group">
      <span className="hero-group__name">{String(value)}</span>
      <span className="hero-group__count">
        {rowInfo.isGroupRow ? formatCompact(rowInfo.groupCount) : ''}
      </span>
    </span>
  ),
};

export function useColumns(feed: HeroFeed, flashDuration: number) {
  return React.useMemo(
    () => makeColumns(feed, { flashDuration }),
    [feed, flashDuration],
  );
}

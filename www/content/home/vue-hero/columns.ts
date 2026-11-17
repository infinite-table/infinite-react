import { h, type VNode } from 'vue';
import {
  createFlashingColumnCellComponent,
  type DataSourcePropAggregationReducers,
  type InfiniteTableColumnRenderValueParam,
  type InfiniteTablePropColumns,
  type InfiniteTablePropGroupColumn,
  type InfiniteTableProps,
} from '@infinite-table/infinite-vue';

import * as aggregations from '../../../src/components/hero/aggregations';
import {
  SPARK_HEIGHT,
  SPARK_WIDTH,
  dayRangeGeometry,
  sparkGeometry,
  volumeRatio,
} from '../../../src/components/hero/cellGeometry';
import type { HeroFeed } from '../../../src/components/hero/data/feed';
import {
  SECTOR_HUES,
  currencyOf,
  spreadBpsOf,
  type Instrument,
  type Sector,
} from '../../../src/components/hero/data/instruments';
import {
  formatCap,
  formatCompact,
  formatMoney,
  formatPct,
  formatPrice,
  formatSigned,
  tone,
} from '../../../src/components/hero/format';

type RenderParam = InfiniteTableColumnRenderValueParam<Instrument>;

export const GROUP_REDUCERS: DataSourcePropAggregationReducers<Instrument> =
  aggregations.GROUP_REDUCERS;
// pivot columns inherit the renderers of the dayPnl / changePct columns
export const PIVOT_REDUCERS: DataSourcePropAggregationReducers<Instrument> =
  aggregations.PIVOT_REDUCERS;

type GetColumnMenuItems = NonNullable<
  InfiniteTableProps<Instrument>['getColumnMenuItems']
>;

/** The default column menu, with "Group by" trimmed to the categorical columns. */
export const getColumnMenuItems: GetColumnMenuItems = (items) =>
  aggregations.trimGroupByMenu(items ?? []) as ReturnType<GetColumnMenuItems>;

/** The row's data for normal (leaf) rows; null for group rows. */
const leaf = (params: RenderParam): Instrument | null =>
  !params.rowInfo.isGroupRow && params.data
    ? (params.data as Instrument)
    : null;

// ---- cells: plain functions that return VNodes -----------------------------

const num = (text: string, dim = false) =>
  h('span', { class: dim ? 'hero-num hero-dim' : 'hero-num' }, text);

/** Initials avatar tinted by sector + ticker. */
function symbolCell(symbol: string, sector: Sector) {
  return h('span', { class: 'hero-symbol' }, [
    h(
      'span',
      {
        class: 'hero-symbol__avatar',
        style: { '--hero-avatar-hue': SECTOR_HUES[sector] ?? 210 },
        'aria-hidden': 'true',
      },
      symbol.slice(0, 2),
    ),
    h('span', { class: 'hero-symbol__ticker' }, symbol),
  ]);
}

function changePill(value: number) {
  const t = tone(value);
  return h('span', { class: `hero-pill hero-pill--${t}` }, [
    h(
      'span',
      { class: 'hero-pill__arrow', 'aria-hidden': 'true' },
      t === 'up' ? '▲' : t === 'down' ? '▼' : '•',
    ),
    formatPct(value),
  ]);
}

const moneyCell = (value: number) =>
  h(
    'span',
    { class: `hero-money hero-money--${tone(value)}` },
    formatMoney(value),
  );

/** Inline SVG sparkline of the row's last ticks. */
function sparkline(feed: HeroFeed, id: number) {
  const { line, area, up, lastY } = sparkGeometry(feed, id);
  return h(
    'svg',
    {
      class: `hero-spark hero-spark--${up ? 'up' : 'down'}`,
      viewBox: `0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`,
      preserveAspectRatio: 'none',
      'aria-hidden': 'true',
    },
    [
      h('path', { class: 'hero-spark__area', d: area }),
      h('path', {
        class: 'hero-spark__line',
        d: line,
        'vector-effect': 'non-scaling-stroke',
      }),
      h('circle', {
        class: 'hero-spark__dot',
        cx: SPARK_WIDTH,
        cy: lastY,
        r: 1.6,
        'vector-effect': 'non-scaling-stroke',
      }),
    ],
  );
}

/** Traded volume vs a typical day. */
function volumeBar(id: number, volume: number) {
  return h('span', { class: 'hero-vol' }, [
    h(
      'span',
      { class: 'hero-vol__track' },
      h('span', {
        class: 'hero-vol__bar',
        style: { transform: `scaleX(${volumeRatio(id, volume).toFixed(3)})` },
      }),
    ),
    h('span', { class: 'hero-vol__text' }, formatCompact(volume)),
  ]);
}

/** Day low → high with a marker at the current price. */
function dayRange(feed: HeroFeed, id: number, price: number) {
  const { low, high, at, openAt, up } = dayRangeGeometry(feed, id, price);
  return h(
    'span',
    { class: 'hero-range', title: `${low.toFixed(2)} – ${high.toFixed(2)}` },
    [
      h('span', { class: 'hero-range__track' }),
      h('span', { class: 'hero-range__open', style: { left: `${openAt}%` } }),
      h('span', {
        class: `hero-range__marker hero-range__marker--${up ? 'up' : 'down'}`,
        style: { left: `${at}%` },
      }),
    ],
  );
}

/** A cell that renders only when the value is a number (leaf or aggregate). */
const whenNumber =
  (render: (value: number) => VNode) =>
  ({ value }: RenderParam) =>
    typeof value === 'number' ? render(value) : null;

// ---- columns ---------------------------------------------------------------

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
        return data ? symbolCell(data.symbol, data.sector) : null;
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
        leaf(params) ? num(formatPrice(params.value as number)) : null,
    },
    changePct: {
      field: 'changePct',
      header: 'Chg %',
      type: 'number',
      align: 'end',
      defaultWidth: 104,
      renderValue: whenNumber(changePill),
    },
    spark: {
      header: 'Trend',
      defaultWidth: 118,
      defaultSortable: false,
      // the tick changes on every update of the row, so the cell re-renders
      valueGetter: ({ data }) => data.tick,
      renderValue: (params) => {
        const data = leaf(params);
        return data ? sparkline(feed, data.id) : null;
      },
    },
    volume: {
      field: 'volume',
      header: 'Volume',
      type: 'number',
      defaultWidth: 128,
      renderValue: (params) => {
        const data = leaf(params);
        if (data) return volumeBar(data.id, data.volume);
        return typeof params.value === 'number'
          ? num(formatCompact(params.value), true)
          : null;
      },
    },
    dayPnl: {
      field: 'dayPnl',
      header: 'Day P&L',
      type: 'number',
      align: 'end',
      defaultWidth: 108,
      components: { ColumnCell: FlashingCell },
      renderValue: whenNumber(moneyCell),
    },
    pnl: {
      field: 'pnl',
      header: 'Unreal. P&L',
      type: 'number',
      align: 'end',
      defaultWidth: 116,
      renderValue: whenNumber(moneyCell),
    },
    range: {
      header: 'Day range',
      defaultWidth: 112,
      defaultSortable: false,
      valueGetter: ({ data }) => data.price,
      renderValue: (params) => {
        const data = leaf(params);
        return data ? dayRange(feed, data.id, data.price) : null;
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
        leaf(params) ? num(formatPrice(params.value as number), true) : null,
    },
    ask: {
      header: 'Ask',
      type: 'number',
      align: 'end',
      defaultWidth: 90,
      valueGetter: ({ data }) =>
        data.price * (1 + spreadBpsOf(data.id) / 20_000),
      renderValue: (params) =>
        leaf(params) ? num(formatPrice(params.value as number), true) : null,
    },
    position: {
      field: 'position',
      header: 'Position',
      type: 'number',
      align: 'end',
      defaultWidth: 104,
      renderValue: whenNumber((value) => num(formatSigned(value))),
    },
    marketCap: {
      field: 'marketCap',
      header: 'Mkt cap',
      type: 'number',
      align: 'end',
      defaultWidth: 100,
      renderValue: whenNumber((value) => num(formatCap(value), true)),
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
  renderGroupValue: ({ value, rowInfo }) =>
    h('span', { class: 'hero-group' }, [
      h('span', { class: 'hero-group__name' }, String(value)),
      h(
        'span',
        { class: 'hero-group__count' },
        rowInfo.isGroupRow ? formatCompact(rowInfo.groupCount) : '',
      ),
    ]),
};

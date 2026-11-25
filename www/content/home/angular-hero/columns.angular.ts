import type { TemplateRef } from '@angular/core';
import {
  createFlashingColumnCellComponent,
  renderTemplate,
  type DataSourcePropAggregationReducers,
  type InfiniteTableColumnRenderValueParam,
  type InfiniteTablePropColumns,
  type InfiniteTablePropGroupColumn,
  type InfiniteTableProps,
  type Renderable,
} from '@infinite-table/infinite-angular';

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

// ---- cells: the markup is in ng-templates (hero-grid.angular.ts), the
// ---- values they show are worked out here, per render

export const SPARK_VIEW_BOX = `0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`;
export { SPARK_WIDTH };

export type NumCell = { text: string; dim: boolean };
export type SymbolCell = { symbol: string; hue: number };
export type PillCell = { tone: string; arrow: string; text: string };
export type MoneyCell = { tone: string; text: string };
export type SparkCell = {
  line: string;
  area: string;
  up: boolean;
  lastY: number;
};
export type VolumeCell = { scale: string; text: string };
export type RangeCell = {
  title: string;
  openAt: number;
  at: number;
  up: boolean;
};
export type GroupCell = { name: string; count: string };

/** The cell templates of the grid component, read when a cell renders. */
export type HeroCellTemplates = {
  num: () => TemplateRef<NumCell>;
  symbol: () => TemplateRef<SymbolCell>;
  pill: () => TemplateRef<PillCell>;
  money: () => TemplateRef<MoneyCell>;
  spark: () => TemplateRef<SparkCell>;
  volume: () => TemplateRef<VolumeCell>;
  range: () => TemplateRef<RangeCell>;
  group: () => TemplateRef<GroupCell>;
};

/** The row's data for normal (leaf) rows; null for group rows. */
const leaf = (params: RenderParam): Instrument | null =>
  !params.rowInfo.isGroupRow && params.data
    ? (params.data as Instrument)
    : null;

export function makeColumns(
  feed: HeroFeed,
  { flashDuration }: { flashDuration: number },
  cells: HeroCellTemplates,
): InfiniteTablePropColumns<Instrument> {
  const FlashingCell = createFlashingColumnCellComponent({ flashDuration });

  const num = (text: string, dim = false) =>
    renderTemplate(cells.num(), { text, dim });

  /** Change % as a pill with an arrow. */
  const changePill = (value: number) => {
    const t = tone(value);
    return renderTemplate(cells.pill(), {
      tone: t,
      arrow: t === 'up' ? '▲' : t === 'down' ? '▼' : '•',
      text: formatPct(value),
    });
  };

  const moneyCell = (value: number) =>
    renderTemplate(cells.money(), {
      tone: tone(value),
      text: formatMoney(value),
    });

  /** A cell that renders only when the value is a number (leaf or aggregate). */
  const whenNumber =
    (render: (value: number) => Renderable) =>
    ({ value }: RenderParam): Renderable =>
      typeof value === 'number' ? render(value) : null;

  return {
    symbol: {
      field: 'symbol',
      header: 'Symbol',
      defaultWidth: 118,
      renderValue: (params) => {
        const data = leaf(params);
        return data
          ? renderTemplate(cells.symbol(), {
              symbol: data.symbol,
              hue: SECTOR_HUES[data.sector] ?? 210,
            })
          : null;
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
        return data
          ? renderTemplate(cells.spark(), sparkGeometry(feed, data.id))
          : null;
      },
    },
    volume: {
      field: 'volume',
      header: 'Volume',
      type: 'number',
      defaultWidth: 128,
      renderValue: (params) => {
        const data = leaf(params);
        if (data) {
          return renderTemplate(cells.volume(), {
            scale: volumeRatio(data.id, data.volume).toFixed(3),
            text: formatCompact(data.volume),
          });
        }
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
        if (!data) return null;
        const { low, high, at, openAt, up } = dayRangeGeometry(
          feed,
          data.id,
          data.price,
        );
        return renderTemplate(cells.range(), {
          title: `${low.toFixed(2)} – ${high.toFixed(2)}`,
          openAt,
          at,
          up,
        });
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

export function makeGroupColumn(
  cells: HeroCellTemplates,
): InfiniteTablePropGroupColumn<Instrument> {
  return {
    header: 'Group',
    defaultWidth: 168,
    renderGroupValue: ({ value, rowInfo }) =>
      renderTemplate(cells.group(), {
        name: String(value),
        count: rowInfo.isGroupRow ? formatCompact(rowInfo.groupCount) : '',
      }),
  };
}

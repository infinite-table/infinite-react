/*
 * The aggregations and the column menu of the blotter, as plain objects: no
 * framework imports, so the React grid (columns.tsx), the Vue one
 * (content/home/vue-hero) and the Angular one (content/home/angular-hero)
 * share them.
 */
import type { Instrument } from './data/instruments';

/** Cap-weighted average change %, like an index. */
const weightedChange = {
  field: 'changePct' as const,
  initialValue: () => ({ weighted: 0, weight: 0 }),
  reducer: (
    acc: { weighted: number; weight: number },
    value: number,
    data: Instrument,
  ) => {
    acc.weighted += value * data.marketCap;
    acc.weight += data.marketCap;
    return acc;
  },
  done: (acc: { weighted: number; weight: number }) =>
    acc.weight ? acc.weighted / acc.weight : 0,
};

const sum = <K extends keyof Instrument>(field: K) => ({
  field,
  initialValue: 0,
  reducer: (acc: number, value: number) => acc + (value || 0),
});

export const GROUP_REDUCERS = {
  changePct: weightedChange,
  dayPnl: sum('dayPnl'),
  pnl: sum('pnl'),
  volume: sum('volume'),
  marketCap: sum('marketCap'),
  position: sum('position'),
};

/** Pivot keeps it readable: two measures per asset class. */
// pivot columns inherit the renderers of the dayPnl / changePct columns
export const PIVOT_REDUCERS = {
  dayPnl: {
    ...sum('dayPnl'),
    name: 'Day P&L',
    pivotColumn: { defaultWidth: 112 },
  },
  changePct: {
    ...weightedChange,
    name: 'Chg %',
    pivotColumn: { defaultWidth: 104 },
  },
};

/**
 * Columns it makes sense to group by (the categorical ones). Currency is left
 * out: it is a computed column with no field, so the menu would show it
 * disabled.
 */
const GROUPABLE = new Set(['sector', 'assetClass', 'region', 'exchange']);

/**
 * Keep the default column menu, but trim its "Group by" submenu to the
 * categorical columns — a one-function customization via getColumnMenuItems.
 */
type SubMenu = { items: { key?: unknown }[] } & Record<string, unknown>;
type ItemWithMenu = { key: string; menu?: SubMenu | (() => SubMenu) };

export const trimGroupByMenu = (items: unknown[]): unknown[] =>
  items.map((item) => {
    const candidate = item as unknown as ItemWithMenu | null;
    if (
      !candidate ||
      typeof candidate !== 'object' ||
      candidate.key !== 'group-by'
    )
      return item;
    const original = candidate.menu;
    if (!original) return item;
    return {
      ...candidate,
      menu: () => {
        const sub = typeof original === 'function' ? original() : original;
        return {
          ...sub,
          items: sub.items.filter((entry) => GROUPABLE.has(String(entry?.key))),
        };
      },
    };
  });

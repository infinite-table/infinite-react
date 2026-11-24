import * as React from 'react';

import {
  DataSource,
  InfiniteTable,
  type DataSourcePropAggregationReducers,
  type DataSourcePropGroupBy,
  type DataSourcePropRowSelection_MultiRow,
  type DataSourcePropSortInfo,
  type InfiniteTablePropColumns,
  type InfiniteTableProps,
} from '@infinite-table/infinite-react';
import '@infinite-table/infinite-react/theme/shadcn.css';

// the Bklit charts, as `npx shadcn@latest add @bklit/line-chart @bklit/sparkline` adds them
import {
  AreaSparkline,
  ChartTooltip,
  Grid,
  Line,
  LineChart,
  XAxis,
} from './components/charts';
import { curveMonotoneX } from 'd3-shape';

type PageRow = {
  path: string;
  section: string;
  /** daily visitors, one value per day of the selected range */
  trend: number[];
  /** visitors in the selected range */
  visitors: number;
  /** visitors in the range before it, for the change column */
  previous: number;
  /** null for pages that didn't exist in the previous range */
  change: number | null;
  bounceRate: number;
  avgTime: number;
};

const RANGES = [7, 30, 90] as const;
type Range = (typeof RANGES)[number];

/** colors of the charted pages: the line in the chart and the sparkline in the grid */
const SERIES_COLORS = [
  'var(--series-1)',
  'var(--series-2)',
  'var(--series-3)',
  'var(--series-4)',
  'var(--series-5)',
];

const sum = (acc: number, value: number) => acc + value;

/** averages weighted by visitors, so a busy page counts more than a quiet one */
const weightedAverage = (field: 'bounceRate' | 'avgTime') => ({
  initialValue: () => ({ total: 0, weight: 0 }),
  getter: (row: PageRow) => row,
  reducer: (acc: { total: number; weight: number }, row: PageRow) => ({
    total: acc.total + row[field] * row.visitors,
    weight: acc.weight + row.visitors,
  }),
  done: (acc: { total: number; weight: number }) =>
    acc.weight ? acc.total / acc.weight : 0,
});

// #region aggregations
const aggregationReducers: DataSourcePropAggregationReducers<PageRow> = {
  visitors: { field: 'visitors', initialValue: 0, reducer: sum },
  previous: { field: 'previous', initialValue: 0, reducer: sum },
  // the group's daily visitors: the sum of its pages, day by day -
  // so group rows get a sparkline too
  trend: {
    field: 'trend', // #highlight
    initialValue: () => [] as number[],
    reducer: (acc: number[], trend: number[]) =>
      trend.map((value, day) => value + (acc[day] ?? 0)),
  },
  change: {
    field: 'change',
    initialValue: () => ({ visitors: 0, previous: 0 }),
    getter: (row) => row,
    reducer: (acc: { visitors: number; previous: number }, row: PageRow) => ({
      visitors: acc.visitors + row.visitors,
      previous: acc.previous + row.previous,
    }),
    done: (acc: { visitors: number; previous: number }) =>
      acc.previous ? (acc.visitors - acc.previous) / acc.previous : null,
  },
  bounceRate: { field: 'bounceRate', ...weightedAverage('bounceRate') },
  avgTime: { field: 'avgTime', ...weightedAverage('avgTime') },
};
// #endregion aggregations

const groupBy: DataSourcePropGroupBy<PageRow> = [{ field: 'section' }];
const defaultSortInfo: DataSourcePropSortInfo<PageRow> = [
  { field: 'visitors', dir: -1, type: 'number' },
];

export default function App() {
  useThemeCss();
  const [range, setRange] = React.useState<Range>(30);
  const rows = React.useMemo(() => getRows(range), [range]);

  // #region selection
  const [rowSelection, setRowSelection] =
    React.useState<DataSourcePropRowSelection_MultiRow>({
      selectedRows: [
        '/docs/learn/getting-started',
        '/pricing',
        '/blog/bklit-charts',
      ],
      defaultSelection: false,
    });

  // the selected pages, in the order they were selected (select all: by visitors)
  const selectedPages = React.useMemo(() => {
    if (!rowSelection.defaultSelection) {
      return rowSelection.selectedRows as string[];
    }
    const deselected = new Set(rowSelection.deselectedRows);
    return [...rows]
      .sort((a, b) => b.visitors - a.visitors)
      .map((row) => row.path)
      .filter((path) => !deselected.has(path));
  }, [rowSelection, rows]);

  // the first 5 of them are drawn in the chart, each with its own color
  const colors = useSeriesColors(selectedPages.slice(0, SERIES_COLORS.length));
  // #endregion selection

  const columns = React.useMemo<InfiniteTablePropColumns<PageRow>>(
    () => ({
      // #region trend-column
      trend: {
        field: 'trend',
        header: 'Trend',
        defaultWidth: 150,
        sortable: false,
        renderValue: ({ value, data, rowInfo, column }) => (
          <AreaSparkline
            data={(value as number[] | undefined) ?? []}
            dataKey={dayValue}
            // the column width, without the cell's padding - also while resizing
            width={column.computedWidth - CELL_PADDING_X}
            height={28}
            // start at 0, so small changes don't look like big ones
            yDomain={[0, undefined]}
            curve="monotone"
            // cells are reused for other rows while scrolling: no morphing between them
            animate={false}
            // the charted pages get the color of their line in the chart
            color={
              rowInfo.isGroupRow
                ? 'var(--foreground)'
                : colors.get(data?.path ?? '') ?? 'var(--muted-foreground)'
            }
            fillOpacity={0.25}
          />
        ),
      },
      // #endregion trend-column
      visitors: {
        field: 'visitors',
        header: 'Visitors',
        type: 'number',
        defaultWidth: 110,
        renderValue: ({ value }) => formatNumber(value),
      },
      change: {
        field: 'change',
        header: 'Change',
        type: 'number',
        defaultWidth: 100,
        renderValue: ({ value }) => <Change value={value} />,
      },
      bounceRate: {
        field: 'bounceRate',
        header: 'Bounce',
        type: 'number',
        defaultWidth: 95,
        renderValue: ({ value }) => `${Math.round(value * 100)}%`,
      },
      avgTime: {
        field: 'avgTime',
        header: 'Avg. time',
        type: 'number',
        defaultWidth: 115,
        renderValue: ({ value }) => formatDuration(value),
      },
    }),
    [colors],
  );

  const groupColumn = React.useMemo<InfiniteTableProps<PageRow>['groupColumn']>(
    () => ({
      field: 'path',
      header: 'Page',
      defaultFlex: 1,
      minWidth: 240,
      renderSelectionCheckBox: true,
      renderHeaderSelectionCheckBox: true,
      renderValue: ({ value, data, rowInfo }) => {
        if (rowInfo.isGroupRow) {
          return (
            <span className="font-medium">
              {value}{' '}
              <span className="text-muted-foreground font-normal">
                · {rowInfo.groupCount} pages
              </span>
            </span>
          );
        }
        const color = colors.get(data?.path ?? '');
        return (
          <span className="flex min-w-0 items-center gap-2">
            {color ? (
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ background: color }}
              />
            ) : null}
            <span className="truncate font-mono text-[13px]">{value}</span>
          </span>
        );
      },
    }),
    [colors],
  );

  const charted = [...colors.entries()];
  const rowsByPath = React.useMemo(
    () => new Map(rows.map((row) => [row.path, row])),
    [rows],
  );

  return (
    <div className="infinite-theme-name--shadcn flex h-full flex-1 flex-col gap-3 bg-background p-4 text-foreground">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-base font-semibold">Top pages</h1>
          <p className="text-muted-foreground text-sm">
            Select pages in the grid to compare them in the chart.
          </p>
        </div>
        <RangePicker value={range} onChange={setRange} />
      </header>

      <section className="rounded-xl border border-border bg-card px-4 pt-3 pb-1">
        <Legend
          charted={charted.map(([path, color]) => ({
            path,
            color,
            visitors: rowsByPath.get(path)?.visitors ?? 0,
          }))}
          moreCount={Math.max(0, selectedPages.length - charted.length)}
          onRemove={(path) =>
            setRowSelection((selection) =>
              selection.defaultSelection
                ? {
                    ...selection,
                    deselectedRows: [...selection.deselectedRows, path],
                  }
                : {
                    ...selection,
                    selectedRows: selection.selectedRows.filter(
                      (selected) => selected !== path,
                    ),
                  },
            )
          }
        />
        <VisitorsChart
          range={range}
          rowsByPath={rowsByPath}
          charted={charted}
        />
      </section>

      <DataSource<PageRow>
        data={rows}
        primaryKey="path"
        groupBy={groupBy}
        aggregationReducers={aggregationReducers}
        defaultSortInfo={defaultSortInfo}
        selectionMode="multi-row"
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      >
        <InfiniteTable<PageRow>
          columns={columns}
          groupColumn={groupColumn}
          groupRenderStrategy="single-column"
          rowHeight={42}
          domProps={{
            className: 'rounded-xl border border-border overflow-hidden',
            style: { flex: 1, minHeight: 240 },
          }}
        />
      </DataSource>
    </div>
  );
}

// #region chart
function VisitorsChart(props: {
  range: Range;
  rowsByPath: Map<string, PageRow>;
  charted: [path: string, color: string][];
}) {
  const { range, rowsByPath, charted } = props;
  // nothing selected: the total of all pages
  const series = charted.length
    ? charted.map(([path, color]) => ({
        label: path,
        color,
        trend: rowsByPath.get(path)?.trend ?? [],
      }))
    : [
        {
          label: 'All pages',
          color: 'var(--foreground)',
          trend: sumTrends([...rowsByPath.values()]),
        },
      ];

  // Bklit charts take one object per date, with a key for each line
  const data = getDates(range).map((date, day) => {
    const point: Record<string, unknown> = { date };
    series.forEach((s, index) => {
      point[`s${index}`] = s.trend[day] ?? 0;
    });
    return point;
  });

  return (
    <LineChart
      data={data}
      aspectRatio=""
      className="h-[200px]"
      margin={{ top: 16, right: 8, bottom: 28, left: 8 }}
    >
      <Grid horizontal />
      {series.map((s, index) => (
        <Line
          key={s.label}
          dataKey={`s${index}`}
          curve={curveMonotoneX}
          stroke={s.color}
          strokeWidth={2}
        />
      ))}
      <XAxis numTicks={6} />
      <ChartTooltip
        rows={(point) =>
          series.map((s, index) => ({
            color: s.color,
            label: s.label,
            value: formatNumber(point[`s${index}`] as number),
          }))
        }
      />
    </LineChart>
  );
}
// #endregion chart

function Legend(props: {
  charted: { path: string; color: string; visitors: number }[];
  moreCount: number;
  onRemove: (path: string) => void;
}) {
  if (!props.charted.length) {
    return (
      <p className="text-muted-foreground py-1 text-sm">
        All pages - nothing selected
      </p>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2 py-1">
      {props.charted.map(({ path, color, visitors }) => (
        <button
          key={path}
          type="button"
          title="Remove from the chart"
          onClick={() => props.onRemove(path)}
          className="group flex items-center gap-2 rounded-full border border-border px-2.5 py-0.5 text-xs hover:bg-muted"
        >
          <span className="size-2 rounded-full" style={{ background: color }} />
          <span className="font-mono">{path}</span>
          <span className="text-muted-foreground tabular-nums">
            {formatNumber(visitors)}
          </span>
          <span className="text-muted-foreground group-hover:text-foreground">
            ×
          </span>
        </button>
      ))}
      {props.moreCount ? (
        <span className="text-muted-foreground text-xs">
          + {props.moreCount} more selected
        </span>
      ) : null}
    </div>
  );
}

function RangePicker(props: {
  value: Range;
  onChange: (range: Range) => void;
}) {
  return (
    <div className="flex rounded-lg border border-border bg-muted p-0.5 text-sm">
      {RANGES.map((range) => (
        <button
          key={range}
          type="button"
          onClick={() => props.onChange(range)}
          className={
            range === props.value
              ? 'rounded-md bg-background px-3 py-1 font-medium shadow-sm'
              : 'text-muted-foreground rounded-md px-3 py-1 hover:text-foreground'
          }
        >
          {range} days
        </button>
      ))}
    </div>
  );
}

function Change({ value }: { value: number | null }) {
  if (value == null) {
    return (
      <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
        new
      </span>
    );
  }
  const up = value >= 0;
  return (
    <span
      className="tabular-nums"
      style={{ color: up ? 'var(--chart-positive)' : 'var(--chart-negative)' }}
    >
      {up ? '▲' : '▼'} {Math.abs(value * 100).toFixed(1)}%
    </span>
  );
}

/** Keeps the color of a charted page while it stays charted. */
function useSeriesColors(paths: string[]): Map<string, string> {
  const previous = React.useRef(new Map<string, string>());
  const key = paths.join('|');
  return React.useMemo(() => {
    const next = new Map<string, string>();
    for (const path of paths) {
      const color = previous.current.get(path);
      if (color) next.set(path, color);
    }
    const free = SERIES_COLORS.filter(
      (color) => ![...next.values()].includes(color),
    );
    for (const path of paths) {
      if (!next.has(path)) next.set(path, free.shift()!);
    }
    // in selection order
    const ordered = new Map(paths.map((path) => [path, next.get(path)!]));
    previous.current = ordered;
    return ordered;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}

const dayValue = (value: number) => value;
const CELL_PADDING_X = 16;

const numberFormat = new Intl.NumberFormat('en-US');
const formatNumber = (value: number) => numberFormat.format(Math.round(value));
const formatDuration = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(
    2,
    '0',
  )}`;

function sumTrends(rows: PageRow[]) {
  return rows.reduce<number[]>(
    (acc, row) => row.trend.map((value, day) => value + (acc[day] ?? 0)),
    [],
  );
}

// #region data
/** A fixed last day, so the demo looks the same every day. */
const LAST_DAY = new Date(2026, 10, 23);
const HISTORY_DAYS = 180;

type Page = {
  path: string;
  section: string;
  /** daily visitors 180 days ago */
  base: number;
  /** growth over the 180 days: 0.5 = +50% */
  growth: number;
  /** traffic on weekends, relative to weekdays */
  weekend: number;
  /** days ago the page was published - a launch spike, then a long tail */
  launchedDaysAgo?: number;
  bounceRate: number;
  avgTime: number;
};

// prettier-ignore
const PAGES: Page[] = [
  { path: '/', section: 'Marketing', base: 2100, growth: 0.35, weekend: 0.75, bounceRate: 0.42, avgTime: 48 },
  { path: '/pricing', section: 'Marketing', base: 640, growth: 0.6, weekend: 0.68, bounceRate: 0.31, avgTime: 95 },
  { path: '/features', section: 'Marketing', base: 410, growth: 0.1, weekend: 0.72, bounceRate: 0.38, avgTime: 72 },
  { path: '/compare/datagrids', section: 'Marketing', base: 120, growth: 1.4, weekend: 0.77, launchedDaysAgo: 120, bounceRate: 0.29, avgTime: 164 },
  { path: '/docs/learn/getting-started', section: 'Docs', base: 900, growth: 0.45, weekend: 0.64, bounceRate: 0.21, avgTime: 210 },
  { path: '/docs/learn/grouping-and-pivoting', section: 'Docs', base: 520, growth: 0.25, weekend: 0.61, bounceRate: 0.18, avgTime: 254 },
  { path: '/docs/learn/selection/row-selection', section: 'Docs', base: 330, growth: 0.2, weekend: 0.61, bounceRate: 0.2, avgTime: 188 },
  { path: '/docs/learn/theming', section: 'Docs', base: 290, growth: 0.55, weekend: 0.64, bounceRate: 0.24, avgTime: 176 },
  { path: '/docs/learn/working-with-data/live-updates', section: 'Docs', base: 180, growth: 0.15, weekend: 0.61, bounceRate: 0.19, avgTime: 232 },
  { path: '/docs/reference/infinite-table-props', section: 'Docs', base: 760, growth: 0.3, weekend: 0.59, bounceRate: 0.12, avgTime: 305 },
  { path: '/docs/reference/datasource-props', section: 'Docs', base: 430, growth: 0.3, weekend: 0.59, bounceRate: 0.14, avgTime: 281 },
  { path: '/docs/releases', section: 'Docs', base: 210, growth: 0.05, weekend: 0.66, bounceRate: 0.33, avgTime: 84 },
  { path: '/blog/bklit-charts', section: 'Blog', base: 0, growth: 0, weekend: 0.81, launchedDaysAgo: 9, bounceRate: 0.36, avgTime: 228 },
  { path: '/blog/one-line-of-css', section: 'Blog', base: 0, growth: 0, weekend: 0.81, launchedDaysAgo: 22, bounceRate: 0.39, avgTime: 196 },
  { path: '/blog/benchmarking-a-million-rows', section: 'Blog', base: 0, growth: 0, weekend: 0.84, launchedDaysAgo: 40, bounceRate: 0.34, avgTime: 262 },
  { path: '/blog/infinite-table-9', section: 'Blog', base: 0, growth: 0, weekend: 0.81, launchedDaysAgo: 105, bounceRate: 0.41, avgTime: 151 },
  { path: '/blog/file-explorer-treegrid', section: 'Blog', base: 0, growth: 0, weekend: 0.86, launchedDaysAgo: 150, bounceRate: 0.37, avgTime: 207 },
  { path: '/blog/real-time-updates', section: 'Blog', base: 0, growth: 0, weekend: 0.86, launchedDaysAgo: 168, bounceRate: 0.4, avgTime: 183 },
  { path: '/examples/trading-dashboard', section: 'Examples', base: 260, growth: 0.5, weekend: 0.7, bounceRate: 0.27, avgTime: 141 },
  { path: '/examples/pivot-table', section: 'Examples', base: 190, growth: 0.2, weekend: 0.68, bounceRate: 0.3, avgTime: 122 },
  { path: '/examples/tree-grid', section: 'Examples', base: 150, growth: 0.65, weekend: 0.7, bounceRate: 0.28, avgTime: 133 },
  { path: '/examples/master-detail', section: 'Examples', base: 110, growth: -0.1, weekend: 0.68, bounceRate: 0.32, avgTime: 118 },
];

/** a small seeded random generator, so the data is the same on every load */
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** daily visitors of every page, oldest day first */
const HISTORY: Map<string, number[]> = new Map(
  PAGES.map((page, pageIndex) => {
    const rand = random(pageIndex + 1);
    const days = Array.from({ length: HISTORY_DAYS }, (_, day) => {
      const daysAgo = HISTORY_DAYS - 1 - day;
      const date = new Date(LAST_DAY);
      date.setDate(date.getDate() - daysAgo);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const noise = 0.8 + rand() * 0.4;
      const weekday = isWeekend ? page.weekend : 1;

      if (page.launchedDaysAgo != null) {
        if (daysAgo > page.launchedDaysAgo) return 0;
        const age = page.launchedDaysAgo - daysAgo;
        const visitors = page.base
          ? page.base * (1 + (page.growth * age) / page.launchedDaysAgo)
          : // a blog post: a launch spike that settles on a long tail
            3200 * Math.exp(-age / 3) + 260 * Math.exp(-age / 30) + 60;
        return Math.round(visitors * weekday * noise);
      }
      const growth = 1 + (page.growth * day) / HISTORY_DAYS;
      return Math.round(page.base * growth * weekday * noise);
    });
    return [page.path, days];
  }),
);

function getRows(range: Range): PageRow[] {
  return PAGES.map((page) => {
    const days = HISTORY.get(page.path)!;
    const trend = days.slice(-range);
    const previousDays = days.slice(-2 * range, -range);
    const visitors = trend.reduce(sum, 0);
    const previous = previousDays.reduce(sum, 0);
    return {
      path: page.path,
      section: page.section,
      trend,
      visitors,
      previous,
      // a page that was launched during the range is new
      change: previousDays.some((value) => value === 0)
        ? null
        : (visitors - previous) / previous,
      bounceRate: page.bounceRate,
      avgTime: page.avgTime,
    };
  });
}

function getDates(range: Range) {
  return Array.from({ length: range }, (_, day) => {
    const date = new Date(LAST_DAY);
    date.setDate(date.getDate() - (range - 1 - day));
    return date;
  });
}
// #endregion data

/**
 * Adds the CSS below to the page, for Tailwind (in the browser) to compile it.
 * In your app, it goes in your global stylesheet.
 */
function useThemeCss() {
  React.useLayoutEffect(() => {
    const style = document.createElement('style');
    style.setAttribute('type', 'text/tailwindcss');
    style.textContent = THEME_CSS;
    document.head.append(style);
    return () => style.remove();
  }, []);
}

// #region theme
/**
 * The shadcn/ui tokens - Infinite Table's `shadcn` theme and the Bklit charts both
 * read them - plus the Bklit chart tokens. In your app they are in your global CSS,
 * with `.dark` for the dark mode; here `.infinite-theme-mode--dark` is the docs' dark mode.
 */
const THEME_CSS = `
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-border: var(--border);
  --color-chart-label: var(--chart-label);
  --color-chart-tooltip-background: var(--chart-tooltip-background);
  --color-chart-tooltip-foreground: var(--chart-tooltip-foreground);
  --color-chart-tooltip-muted: var(--chart-tooltip-muted);
}

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  --card: oklch(1 0 0);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.145 0 0);
  --primary: oklch(0.205 0 0);
  --primary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.97 0 0);
  --muted-foreground: oklch(0.556 0 0);
  --accent: oklch(0.97 0 0);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.922 0 0);
  --input: oklch(0.922 0 0);
  --ring: oklch(0.708 0 0);

  --series-1: oklch(0.585 0.233 277.117);
  --series-2: oklch(0.769 0.188 70.08);
  --series-3: oklch(0.696 0.17 162.48);
  --series-4: oklch(0.645 0.246 16.439);
  --series-5: oklch(0.685 0.169 237.323);

  --chart-line-primary: var(--series-1);
  --chart-positive: oklch(0.596 0.145 163.225);
  --chart-negative: oklch(0.577 0.245 27.325);
  --chart-background: var(--card);
  --chart-foreground: oklch(0.145 0.004 285);
  --chart-foreground-muted: oklch(0.55 0.014 260);
  --chart-crosshair: oklch(0.556 0 0);
  --chart-grid: oklch(0.922 0 0);
  --chart-label: oklch(0.45 0.01 260);
  --chart-tooltip-background: var(--popover);
  --chart-tooltip-foreground: var(--popover-foreground);
  --chart-tooltip-muted: var(--muted-foreground);
  --chart-indicator-color: oklch(0.21 0.006 285);
  --chart-indicator-secondary-color: oklch(0.913 0 0);
}

.dark,
.infinite-theme-mode--dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.17 0 0);
  --popover: oklch(0.205 0 0);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.922 0 0);
  --primary-foreground: oklch(0.205 0 0);
  --muted: oklch(0.269 0 0);
  --muted-foreground: oklch(0.708 0 0);
  --accent: oklch(0.269 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.556 0 0);

  --series-1: oklch(0.673 0.182 276.935);
  --series-2: oklch(0.828 0.189 84.429);
  --series-3: oklch(0.765 0.177 163.223);
  --series-4: oklch(0.712 0.194 13.428);
  --series-5: oklch(0.746 0.16 232.661);

  --chart-positive: oklch(0.765 0.177 163.223);
  --chart-negative: oklch(0.704 0.191 22.216);
  --chart-foreground: oklch(0.45 0 0);
  --chart-foreground-muted: oklch(0.65 0.01 260);
  --chart-crosshair: oklch(0.45 0 0);
  --chart-grid: oklch(0.25 0 0);
  --chart-label: oklch(0.75 0.01 260);
  --chart-indicator-color: oklch(1 0 0);
  --chart-indicator-secondary-color: oklch(0.145 0 0);
}
`;
// #endregion theme

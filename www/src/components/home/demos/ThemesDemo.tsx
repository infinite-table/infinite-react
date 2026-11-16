'use client';

import {
  DataSource,
  InfiniteTable,
  type DataSourcePropAggregationReducers,
  type DataSourcePropGroupBy,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import {
  type Instrument,
  formatCompact,
  formatPct,
  makeInstruments,
  nameFor,
} from './data';
import {
  type ColorMode,
  LICENSE_KEY,
  Segmented,
  gridDomProps,
  themeClassName,
  useSiteMode,
} from './shared';

import './demo-themes.css';

const THEMES = [
  { id: 'terminal', label: 'Terminal' },
  { id: 'sheet', label: 'Sheet' },
  { id: 'paper', label: 'Paper' },
  { id: 'default', label: 'Default' },
  { id: 'minimalist', label: 'Minimalist' },
  { id: 'ocean', label: 'Ocean' },
  { id: 'balsam', label: 'Balsam' },
] as const;
type ThemeId = (typeof THEMES)[number]['id'];

const MODES = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
] as const;

const DENSITIES = [
  { id: 'compact', label: 'Compact' },
  { id: 'comfortable', label: 'Comfortable' },
  { id: 'spacious', label: 'Spacious' },
] as const;
type DensityId = (typeof DENSITIES)[number]['id'];

const groupBy: DataSourcePropGroupBy<Instrument> = [{ field: 'sector' }];

const reducers: DataSourcePropAggregationReducers<Instrument> = {
  volume: {
    field: 'volume',
    initialValue: 0,
    reducer: (acc: number, value: number) => acc + value,
  },
  changePct: {
    field: 'changePct',
    initialValue: 0,
    reducer: (acc: number, value: number) => acc + value,
    done: (sum: number, rows: Instrument[]) =>
      rows.length ? sum / rows.length : 0,
  },
};

const columns: InfiniteTablePropColumns<Instrument> = {
  symbol: { field: 'symbol', header: 'Symbol', defaultWidth: 100 },
  name: {
    header: 'Name',
    valueGetter: ({ data }) => nameFor(data.id),
    defaultFlex: 1,
    minWidth: 190,
  },
  sector: { field: 'sector', header: 'Sector' },
  price: {
    field: 'price',
    header: 'Price',
    type: 'number',
    align: 'end',
    defaultWidth: 100,
    renderValue: ({ value }) => (value == null ? null : value.toFixed(2)),
  },
  changePct: {
    field: 'changePct',
    header: 'Chg %',
    type: 'number',
    align: 'end',
    defaultWidth: 100,
    renderValue: ({ value }) =>
      value == null ? null : (
        <span className={value < 0 ? 'home-down' : 'home-up'}>
          {formatPct(value)}
        </span>
      ),
  },
  volume: {
    field: 'volume',
    header: 'Volume',
    type: 'number',
    align: 'end',
    defaultWidth: 110,
    renderValue: ({ value }) => (value == null ? null : formatCompact(value)),
  },
  region: { field: 'region', header: 'Region', defaultWidth: 110 },
};

export default function ThemesDemo() {
  const siteMode = useSiteMode();
  const [theme, setTheme] = React.useState<ThemeId>('terminal');
  const [mode, setMode] = React.useState<ColorMode>(siteMode);
  const [density, setDensity] = React.useState<DensityId>('comfortable');
  const [copied, setCopied] = React.useState(false);

  // follow the site toggle; the Mode control can still flip it here
  React.useEffect(() => setMode(siteMode), [siteMode]);

  const data = React.useMemo(() => makeInstruments(3000), []);

  const className = themeClassName(theme, mode, density);
  const cssImports =
    theme === 'default'
      ? `import '@infinite-table/infinite-react/index.css';`
      : `import '@infinite-table/infinite-react/index.css';\nimport '@infinite-table/infinite-react/theme/${theme}.css';`;
  const snippet = `${cssImports}\n\n<div className="${className}">\n  <InfiniteTable />\n</div>`;

  const copy = () => {
    navigator.clipboard?.writeText(snippet).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="home-demo__card">
      <div className="home-demo__bar home-demo__bar--wrap">
        <Segmented
          label="Theme"
          options={THEMES}
          value={theme}
          onChange={setTheme}
        />
        <Segmented
          label="Mode"
          options={MODES}
          value={mode}
          onChange={setMode}
        />
        <Segmented
          label="Density"
          options={DENSITIES}
          value={density}
          onChange={setDensity}
        />
      </div>
      <div className={`home-demo__grid ${className}`}>
        <DataSource<Instrument>
          data={data}
          primaryKey="id"
          groupBy={groupBy}
          aggregationReducers={reducers}
        >
          <InfiniteTable<Instrument>
            columns={columns}
            domProps={gridDomProps}
            columnDefaultWidth={130}
            groupColumn={{ header: 'Sector', defaultWidth: 190 }}
            defaultColumnVisibility={{ sector: false }}
            licenseKey={LICENSE_KEY}
          />
        </DataSource>
      </div>
      <div className="home-demo__snippet">
        <pre>
          <code>{snippet}</code>
        </pre>
        <button type="button" className="site-key site-key--sm" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

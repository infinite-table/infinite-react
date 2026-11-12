/*
 * Live Infinite Table demos for the direction prototypes, straight from the
 * published package (no build step). Mounted by shared.js:
 *
 *   <div data-grid-demo="themes" data-default-theme="terminal"></div>
 *   <div data-grid-demo="million" data-theme-name="terminal"></div>
 *   <div data-grid-demo="pivot" data-theme-name="paper"></div>
 *   <div data-grid-demo="grouped" data-theme-name="paper"></div>  (no chrome)
 *
 * The color mode follows <html data-theme>.
 */
import React from 'https://esm.sh/react@18.3.1';
import { createRoot } from 'https://esm.sh/react-dom@18.3.1/client';
import {
  InfiniteTable,
  DataSource,
} from 'https://esm.sh/@infinite-table/infinite-react@10.1.5?deps=react@18.3.1,react-dom@18.3.1';

const h = React.createElement;
const { useState, useEffect, useMemo, useRef, useCallback } = React;

const PKG = 'https://unpkg.com/@infinite-table/infinite-react@10.1.5';

const THEMES = [
  { id: 'terminal', label: 'Terminal' },
  { id: 'sheet', label: 'Sheet' },
  { id: 'paper', label: 'Paper' },
  { id: 'default', label: 'Default' },
  { id: 'minimalist', label: 'Minimalist' },
  { id: 'ocean', label: 'Ocean' },
  { id: 'balsam', label: 'Balsam' },
];

const DENSITIES = [
  { id: 'compact', label: 'Compact' },
  { id: 'comfortable', label: 'Comfortable' },
  { id: 'spacious', label: 'Spacious' },
];

/* ---- css ---------------------------------------------------------------- */

const loadedCss = new Map();
function loadCss(href) {
  if (!loadedCss.has(href)) {
    loadedCss.set(
      href,
      new Promise((resolve) => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.onload = link.onerror = () => resolve();
        document.head.appendChild(link);
      }),
    );
  }
  return loadedCss.get(href);
}

const cssReady = Promise.all([
  loadCss(`${PKG}/index.css`),
  ...THEMES.filter((t) => t.id !== 'default').map((t) =>
    loadCss(`${PKG}/theme/${t.id}.css`),
  ),
]);

/* ---- data --------------------------------------------------------------- */

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SECTORS = [
  'Technology',
  'Financials',
  'Health Care',
  'Energy',
  'Industrials',
  'Consumer Disc.',
  'Staples',
  'Materials',
  'Utilities',
  'Real Estate',
  'Comms',
];
const REGIONS = ['Americas', 'EMEA', 'APAC'];
const ASSET_CLASSES = ['Equity', 'ETF', 'ADR', 'REIT'];
const NAME_A = [
  'Apex',
  'Nova',
  'Silverline',
  'Atlas',
  'Quanta',
  'Beacon',
  'Falcon',
  'Orion',
  'Meridian',
  'Evergreen',
  'Sterling',
  'Keystone',
  'Cascade',
  'Summit',
  'Harbor',
  'Vertex',
];
const NAME_B = [
  'Robotics',
  'Energy',
  'Software',
  'Materials',
  'Medical',
  'Freight',
  'Networks',
  'Studios',
  'Health',
  'Foods',
  'Towers',
  'Assurance',
  'Data',
  'Rail',
  'Steel',
  'Beverages',
];
const NAME_C = ['Ltd', 'AG', 'SA', 'plc', 'Inc', 'Corp', 'Group', 'Holdings'];
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function symbolFor(i) {
  return (
    LETTERS[(i * 7 + 3) % 26] +
    LETTERS[Math.floor(i / 26 + i * 3) % 26] +
    LETTERS[Math.floor(i / 676 + i * 11 + 5) % 26]
  );
}
function nameFor(i) {
  return `${NAME_A[i % 16]} ${NAME_B[(i * 5 + (i >> 4)) % 16]} ${
    NAME_C[(i * 3 + (i >> 8)) % 8]
  }`;
}

function makeInstrument(i, rand) {
  const price = 8 + rand() * rand() * 520;
  return {
    id: i,
    symbol: symbolFor(i),
    sector: SECTORS[Math.floor(rand() * SECTORS.length)],
    region: REGIONS[Math.floor(rand() * REGIONS.length)],
    price,
    changePct: (rand() - 0.48) * 5,
    volume: Math.round(20000 + rand() * rand() * 4_000_000),
  };
}

function makeInstruments(count, seed = 7) {
  const rand = mulberry32(seed);
  const rows = new Array(count);
  for (let i = 0; i < count; i++) rows[i] = makeInstrument(i, rand);
  return rows;
}

/** builds `count` rows in slices, so the page stays responsive */
function makeInstrumentsChunked(count, onProgress, signal) {
  return new Promise((resolve) => {
    const rand = mulberry32(11);
    const rows = new Array(count);
    let i = 0;
    const slice = () => {
      if (signal.aborted) return;
      const end = Math.min(count, i + 100_000);
      for (; i < end; i++) rows[i] = makeInstrument(i, rand);
      onProgress(i);
      if (i < count) setTimeout(slice, 0);
      else resolve(rows);
    };
    slice();
  });
}

function makeTrades(count) {
  const rand = mulberry32(23);
  const rows = new Array(count);
  for (let i = 0; i < count; i++) {
    rows[i] = {
      id: i,
      sector: SECTORS[Math.floor(rand() * SECTORS.length)],
      region: REGIONS[Math.floor(rand() * REGIONS.length)],
      assetClass: ASSET_CLASSES[Math.floor(rand() * rand() * 4)],
      pnl: 0,
      notional: Math.round(50_000 + rand() * 2_000_000),
    };
    // a per sector and region drift, so some cells end up in the red
    const row = rows[i];
    const drift =
      (((SECTORS.indexOf(row.sector) * 7 + REGIONS.indexOf(row.region) * 5) %
        9) -
        3.4) /
      90;
    row.pnl = Math.round((rand() - 0.5 + drift) * 90_000);
  }
  return rows;
}

/* ---- formatting --------------------------------------------------------- */

const int = new Intl.NumberFormat('en-US');
const compact = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const money = (v) =>
  `${v < 0 ? '−' : ''}$${compact.format(Math.abs(Math.round(v)))}`;
const pct = (v) => `${v < 0 ? '−' : '+'}${Math.abs(v).toFixed(2)}%`;
const signClass = (v) => (v < 0 ? 'gd-down' : 'gd-up');

/* ---- shared bits -------------------------------------------------------- */

function useSiteMode() {
  const read = () =>
    document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
  const [mode, setMode] = useState(read);
  useEffect(() => {
    const observer = new MutationObserver(() => setMode(read()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    return () => observer.disconnect();
  }, []);
  return mode;
}

function Seg({ label, options, value, onChange }) {
  return h(
    'div',
    { className: 'gd-group' },
    h('span', { className: 'gd-label' }, label),
    h(
      'div',
      { className: 'gd-seg', role: 'group', 'aria-label': label },
      options.map((option) =>
        h(
          'button',
          {
            key: option.id,
            type: 'button',
            'aria-pressed': String(option.id === value),
            onClick: () => onChange(option.id),
          },
          option.label,
        ),
      ),
    ),
  );
}

const themeClass = (theme, mode, density) =>
  [
    theme !== 'default' ? `infinite-theme-name--${theme}` : '',
    `infinite-theme-mode--${mode}`,
    density ? `infinite-density--${density}` : '',
  ]
    .filter(Boolean)
    .join(' ');

const gridDomProps = { style: { height: '100%' } };

const instrumentColumns = {
  symbol: { field: 'symbol', header: 'Symbol', defaultWidth: 110 },
  name: {
    header: 'Name',
    valueGetter: ({ data }) => nameFor(data.id),
    defaultFlex: 1,
    minWidth: 190,
  },
  sector: { field: 'sector', header: 'Sector', defaultWidth: 150 },
  price: {
    field: 'price',
    header: 'Price',
    type: 'number',
    align: 'end',
    defaultWidth: 110,
    renderValue: ({ value }) => (value == null ? null : value.toFixed(2)),
  },
  changePct: {
    field: 'changePct',
    header: 'Chg %',
    type: 'number',
    align: 'end',
    defaultWidth: 110,
    renderValue: ({ value }) =>
      value == null
        ? null
        : h('span', { className: signClass(value) }, pct(value)),
  },
  volume: {
    field: 'volume',
    header: 'Volume',
    type: 'number',
    align: 'end',
    defaultWidth: 120,
    renderValue: ({ value }) => (value == null ? null : compact.format(value)),
  },
  region: { field: 'region', header: 'Region', defaultWidth: 120 },
};

/* ---- 1. theme gallery: theme x mode x density --------------------------- */

const sum = (acc, value) => acc + value;

const galleryGroupBy = [{ field: 'sector' }];
const galleryReducers = {
  volume: { field: 'volume', initialValue: 0, reducer: sum },
  changePct: {
    field: 'changePct',
    initialValue: 0,
    reducer: (acc, value) => acc + value,
    done: (sum, rows) => (rows.length ? sum / rows.length : 0),
  },
};

function ThemesDemo({ host }) {
  const siteMode = useSiteMode();
  const [theme, setTheme] = useState(host.dataset.defaultTheme || 'default');
  const [density, setDensity] = useState('comfortable');
  const [mode, setMode] = useState(siteMode);
  const [copied, setCopied] = useState(false);
  useEffect(() => setMode(siteMode), [siteMode]);

  const data = useMemo(() => makeInstruments(3000), []);

  const cssImport =
    theme === 'default'
      ? `import '@infinite-table/infinite-react/index.css'`
      : `import '@infinite-table/infinite-react/index.css'\nimport '@infinite-table/infinite-react/theme/${theme}.css'`;
  const className = themeClass(theme, mode, density);
  const snippet = `${cssImport}\n\n<div className="${className}">\n  <InfiniteTable />\n</div>`;

  const copy = () => {
    navigator.clipboard?.writeText(snippet).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return h(
    'div',
    { className: 'gd gd-themes' },
    h(
      'div',
      { className: 'gd-controls' },
      h(Seg, { label: 'Theme', options: THEMES, value: theme, onChange: setTheme }),
      h(Seg, {
        label: 'Mode',
        options: [
          { id: 'light', label: 'Light' },
          { id: 'dark', label: 'Dark' },
        ],
        value: mode,
        onChange: setMode,
      }),
      h(Seg, {
        label: 'Density',
        options: DENSITIES,
        value: density,
        onChange: setDensity,
      }),
      h('span', { className: 'gd-spacer' }),
      h(
        'button',
        { type: 'button', className: 'gd-btn gd-copy', onClick: copy },
        copied ? 'Copied' : 'Copy CSS',
      ),
    ),
    h(
      'div',
      { className: `gd-grid ${className}` },
      h(
        DataSource,
        {
          data,
          primaryKey: 'id',
          groupBy: galleryGroupBy,
          aggregationReducers: galleryReducers,
        },
        h(InfiniteTable, {
          columns: instrumentColumns,
          domProps: gridDomProps,
          columnDefaultWidth: 130,
          groupColumn: { header: 'Sector', defaultWidth: 190 },
          defaultColumnVisibility: { sector: false },
        }),
      ),
    ),
    h(
      'pre',
      { className: 'gd-snippet' },
      h('code', null, snippet),
    ),
  );
}

/* ---- a plain grouped grid (the docs page's demo card) -------------------- */

function GroupedDemo({ host }) {
  const mode = useSiteMode();
  const theme = host.dataset.themeName || 'default';
  const data = useMemo(() => makeInstruments(1500, 19), []);
  return h(
    'div',
    { className: `gd-grid gd-grid--bare ${themeClass(theme, mode)}` },
    h(
      DataSource,
      {
        data,
        primaryKey: 'id',
        groupBy: galleryGroupBy,
        aggregationReducers: galleryReducers,
      },
      h(InfiniteTable, {
        columns: instrumentColumns,
        domProps: gridDomProps,
        columnDefaultWidth: 130,
        groupColumn: { header: 'Sector', defaultWidth: 190 },
        defaultColumnVisibility: { sector: false, region: false },
      }),
    ),
  );
}

/* ---- 2. one million rows ------------------------------------------------ */

const lowEnd =
  matchMedia('(max-width: 767px)').matches ||
  (navigator.deviceMemory !== undefined && navigator.deviceMemory < 4);
const BIG_COUNT = lowEnd ? 100_000 : 1_000_000;

const derived = (header, fn, digits = 2) => ({
  header,
  type: 'number',
  align: 'end',
  defaultWidth: 110,
  valueGetter: ({ data }) => fn(data),
  renderValue: ({ value }) => (value == null ? null : value.toFixed(digits)),
});

const millionColumns = {
  id: {
    field: 'id',
    header: '#',
    type: 'number',
    align: 'end',
    defaultWidth: 110,
    renderValue: ({ value }) => int.format(value + 1),
  },
  symbol: instrumentColumns.symbol,
  name: { ...instrumentColumns.name, defaultFlex: undefined, defaultWidth: 230 },
  sector: instrumentColumns.sector,
  price: instrumentColumns.price,
  changePct: instrumentColumns.changePct,
  volume: instrumentColumns.volume,
  bid: derived('Bid', (d) => d.price * 0.9996),
  ask: derived('Ask', (d) => d.price * 1.0004),
  open: derived('Open', (d) => d.price / (1 + d.changePct / 100)),
  high: derived('High', (d) => d.price * 1.012),
  low: derived('Low', (d) => d.price * 0.987),
  region: instrumentColumns.region,
  beta: derived('Beta', (d) => 0.4 + ((d.id * 37) % 160) / 100),
  pe: derived('P/E', (d) => 6 + ((d.id * 53) % 420) / 10, 1),
  position: derived('Position', (d) => ((d.id * 97) % 9000) * 10, 0),
};

function MillionDemo({ host }) {
  const mode = useSiteMode();
  const theme = host.dataset.themeName || 'default';
  const [data, setData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [buildMs, setBuildMs] = useState(0);
  const [range, setRange] = useState(null);
  const apiRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    const start = performance.now();
    makeInstrumentsChunked(BIG_COUNT, setProgress, controller.signal).then(
      (rows) => {
        setBuildMs(Math.round(performance.now() - start));
        setData(rows);
      },
    );
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!data) return;
    const timer = setInterval(() => {
      try {
        const r = apiRef.current?.getVisibleRenderRange?.();
        if (r) setRange([r.start[0], r.end[0]]);
      } catch {}
    }, 200);
    return () => clearInterval(timer);
  }, [data]);

  const jump = useCallback((fraction) => {
    const api = apiRef.current;
    const scroller = api?.scrollContainer;
    if (!scroller) return;
    scroller.scrollTop = fraction * (scroller.scrollHeight - scroller.clientHeight);
  }, []);

  const className = themeClass(theme, mode, 'compact');

  return h(
    'div',
    { className: 'gd gd-million' },
    h(
      'div',
      { className: 'gd-controls' },
      h(
        'span',
        { className: 'gd-readout' },
        h('b', null, int.format(BIG_COUNT)),
        ` rows × ${Object.keys(millionColumns).length} columns`,
        data ? ` · data built in ${int.format(buildMs)} ms` : '',
        range
          ? h(
              React.Fragment,
              null,
              ' · rows ',
              h('b', null, `${int.format(range[0] + 1)}–${int.format(range[1])}`),
              ' in view',
            )
          : null,
      ),
      h('span', { className: 'gd-spacer' }),
      h(
        'button',
        { type: 'button', className: 'gd-btn', onClick: () => jump(0) },
        'Top',
      ),
      h(
        'button',
        {
          type: 'button',
          className: 'gd-btn',
          onClick: () => jump(0.05 + Math.random() * 0.9),
        },
        'Jump to a random row',
      ),
      h(
        'button',
        { type: 'button', className: 'gd-btn', onClick: () => jump(1) },
        'Bottom',
      ),
    ),
    h(
      'div',
      { className: `gd-grid gd-grid--tall ${className}` },
      data
        ? h(
            DataSource,
            { data, primaryKey: 'id' },
            h(InfiniteTable, {
              columns: millionColumns,
              domProps: gridDomProps,
              columnDefaultWidth: 120,
              onReady: ({ api }) => {
                apiRef.current = api;
              },
            }),
          )
        : h(
            'div',
            { className: 'gd-loading' },
            `building ${int.format(progress)} / ${int.format(BIG_COUNT)} rows…`,
          ),
    ),
  );
}

/* ---- 3. pivot ----------------------------------------------------------- */

const pivotGroupBy = [{ field: 'sector' }];
const pivotBy = [{ field: 'region' }];
const pivotReducers = {
  pnl: {
    field: 'pnl',
    initialValue: 0,
    reducer: sum,
    name: 'P&L',
    pivotColumn: { defaultFlex: 1, minWidth: 104 },
  },
  notional: {
    field: 'notional',
    initialValue: 0,
    reducer: sum,
    name: 'Notional',
    pivotColumn: { defaultFlex: 1, minWidth: 104 },
  },
};
// the generated pivot columns take their renderers from these
const pivotColumns = {
  sector: { field: 'sector', header: 'Sector' },
  region: { field: 'region', header: 'Region' },
  pnl: {
    field: 'pnl',
    header: 'P&L',
    type: 'number',
    align: 'end',
    renderValue: ({ value }) =>
      value == null
        ? null
        : h('span', { className: signClass(value) }, money(value)),
  },
  notional: {
    field: 'notional',
    header: 'Notional',
    type: 'number',
    align: 'end',
    renderValue: ({ value }) => (value == null ? null : money(value)),
  },
};

function PivotDemo({ host }) {
  const mode = useSiteMode();
  const theme = host.dataset.themeName || 'default';
  const data = useMemo(() => makeTrades(20_000), []);
  return h(
    'div',
    { className: 'gd gd-pivot' },
    h(
      'div',
      { className: `gd-grid ${themeClass(theme, mode)}` },
      h(
        DataSource,
        {
          data,
          primaryKey: 'id',
          groupBy: pivotGroupBy,
          pivotBy,
          aggregationReducers: pivotReducers,
        },
        ({ pivotColumns: generated, pivotColumnGroups }) =>
          h(InfiniteTable, {
            columns: pivotColumns,
            pivotColumns: generated,
            pivotColumnGroups,
            domProps: gridDomProps,
            columnDefaultWidth: 128,
            groupColumn: { header: 'Sector', defaultWidth: 180 },
            pivotTotalColumnPosition: 'end',
          }),
      ),
    ),
  );
}

/* ---- mount -------------------------------------------------------------- */

const DEMOS = {
  themes: ThemesDemo,
  million: MillionDemo,
  pivot: PivotDemo,
  grouped: GroupedDemo,
};

export async function mountGridDemo(host) {
  const Demo = DEMOS[host.dataset.gridDemo];
  if (!Demo) return;
  await cssReady;
  createRoot(host).render(h(Demo, { host }));
}

'use client';

import {
  DataSource,
  InfiniteTable,
  type InfiniteTableApi,
  type InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';
import * as React from 'react';

import {
  type Instrument,
  formatCompact,
  formatInt,
  formatPct,
  makeInstrumentsChunked,
  nameFor,
} from './data';
import {
  LICENSE_KEY,
  gridDomProps,
  themeClassName,
  useSiteMode,
} from './shared';

import './demo-themes.css';

/** A million rows where there's room for them; 100k on phones. */
function rowCount() {
  if (typeof window === 'undefined') return 1_000_000;
  const small = window.matchMedia('(max-width: 767px)').matches;
  const lowMemory =
    'deviceMemory' in navigator && (navigator as any).deviceMemory < 4;
  return small || lowMemory ? 100_000 : 1_000_000;
}

const derived = (
  header: string,
  fn: (row: Instrument) => number,
  digits = 2,
): InfiniteTablePropColumns<Instrument>[string] => ({
  header,
  type: 'number',
  align: 'end',
  defaultWidth: 110,
  valueGetter: ({ data }) => fn(data),
  renderValue: ({ value }) => (value == null ? null : value.toFixed(digits)),
});

const columns: InfiniteTablePropColumns<Instrument> = {
  id: {
    field: 'id',
    header: '#',
    type: 'number',
    align: 'end',
    defaultWidth: 110,
    renderValue: ({ value }) => formatInt(value + 1),
  },
  symbol: { field: 'symbol', header: 'Symbol', defaultWidth: 100 },
  name: {
    header: 'Name',
    valueGetter: ({ data }) => nameFor(data.id),
    defaultWidth: 230,
  },
  sector: { field: 'sector', header: 'Sector', defaultWidth: 150 },
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
  bid: derived('Bid', (d) => d.price * 0.9996),
  ask: derived('Ask', (d) => d.price * 1.0004),
  open: derived('Open', (d) => d.price / (1 + d.changePct / 100)),
  high: derived('High', (d) => d.price * 1.012),
  low: derived('Low', (d) => d.price * 0.987),
  region: { field: 'region', header: 'Region', defaultWidth: 110 },
  beta: derived('Beta', (d) => 0.4 + ((d.id * 37) % 160) / 100),
  pe: derived('P/E', (d) => 6 + ((d.id * 53) % 420) / 10, 1),
  position: derived('Position', (d) => ((d.id * 97) % 9000) * 10, 0),
};

const COLUMN_COUNT = Object.keys(columns).length;

export default function MillionRowsDemo() {
  const mode = useSiteMode();
  const [count] = React.useState(rowCount);
  const [data, setData] = React.useState<Instrument[] | null>(null);
  const [progress, setProgress] = React.useState(0);
  const [buildMs, setBuildMs] = React.useState(0);
  const [range, setRange] = React.useState<[number, number] | null>(null);
  const apiRef = React.useRef<InfiniteTableApi<Instrument> | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();
    const start = performance.now();
    makeInstrumentsChunked(count, setProgress, controller.signal).then(
      (rows) => {
        setBuildMs(Math.round(performance.now() - start));
        setData(rows);
      },
    );
    return () => controller.abort();
  }, [count]);

  React.useEffect(() => {
    if (!data) return;
    const timer = setInterval(() => {
      const renderRange = apiRef.current?.getVisibleRenderRange();
      if (renderRange) {
        setRange([renderRange.start[0], renderRange.end[0]]);
      }
    }, 250);
    return () => clearInterval(timer);
  }, [data]);

  const jump = (fraction: number) => {
    const api = apiRef.current;
    if (api) {
      api.scrollTop = Math.round(fraction * api.scrollTopMax);
    }
  };

  return (
    <div className="home-demo__card">
      <div className="home-demo__bar">
        <span className="home-demo__readout">
          <b>{formatInt(count)}</b> rows × {COLUMN_COUNT} columns
          {data ? ` · data built in ${formatInt(buildMs)} ms` : ''}
          {range ? (
            <>
              {' · rows '}
              <b>
                {formatInt(range[0] + 1)}–{formatInt(range[1])}
              </b>
              {' in view'}
            </>
          ) : null}
        </span>
        <span className="home-demo__spacer" />
        <button
          type="button"
          className="site-key site-key--sm"
          onClick={() => jump(0)}
        >
          Top
        </button>
        <button
          type="button"
          className="site-key site-key--sm"
          onClick={() => jump(0.05 + Math.random() * 0.9)}
        >
          Random row
        </button>
        <button
          type="button"
          className="site-key site-key--sm"
          onClick={() => jump(1)}
        >
          Bottom
        </button>
      </div>
      <div
        className={`home-demo__grid home-grid--site ${themeClassName(
          'terminal',
          mode,
          'compact',
        )}`}
      >
        {data ? (
          <DataSource<Instrument> data={data} primaryKey="id">
            <InfiniteTable<Instrument>
              columns={columns}
              domProps={gridDomProps}
              columnDefaultWidth={110}
              licenseKey={LICENSE_KEY}
              onReady={({ api }) => {
                apiRef.current = api;
              }}
            />
          </DataSource>
        ) : (
          <div className="home-demo__loading">
            building {formatInt(progress)} / {formatInt(count)} rows…
          </div>
        )}
      </div>
    </div>
  );
}

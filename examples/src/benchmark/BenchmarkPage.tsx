import * as React from 'react';

import {
  BENCH_GRID_HEIGHT,
  BENCH_GRID_WIDTH,
  BenchRow,
  generateBenchData,
} from './data';
import { BenchAdapter, installBenchmark } from './harness';
import { BenchView, getBenchView } from './updates';

/** what every grid component of a benchmark page gets */
export type BenchGridProps = {
  /** the rows, in the order of the data (by id) */
  data: BenchRow[];
  /** sorting / filter / grouping to mount with - see updates.ts */
  view: BenchView;
  /**
   * the grid gives the page the function that hands it changed rows (new
   * objects, in place of the ones with the same id), once it can take them
   */
  onUpdater: (update: (rows: BenchRow[]) => void) => void;
};

type BenchmarkPageProps = {
  title: string;
  rowCount: number;
  adapter: BenchAdapter;
  renderGrid: (props: BenchGridProps) => React.ReactNode;
};

/**
 * Identical shell for every grid: generates the data (outside of any
 * measurement), installs `window.__bench` and renders the grid in a fixed
 * size box only when asked to.
 *
 * `?autoMount=0` - used by the benchmark spec, which calls
 * `window.__bench.mount()` itself, so mounting is measured. Without it the
 * grid mounts right away, for looking at the demo in the browser.
 *
 * `?extraHeight=N` - makes the box N px taller. The spec uses it to give
 * all the grids a body of the same height (so they render the same number of
 * rows) when one of them shows something the others don't - e.g. MUI's
 * pagination footer, or the footer Infinite Table renders when it has no
 * license key.
 *
 * `?view=sorted` (`filtered`, `grouped`) - the grid mounts with that
 * sorting / filter / grouping, for the scenarios with live updates.
 */
export function BenchmarkPage(props: BenchmarkPageProps) {
  const { adapter, renderGrid, title, rowCount } = props;
  const [data, setData] = React.useState<BenchRow[] | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const mountedRef = React.useRef(false);
  const [info, setInfo] = React.useState('generating data...');
  const [extraHeight, setExtraHeight] = React.useState(0);
  const [view, setView] = React.useState<BenchView>('plain');
  const updaterRef = React.useRef<((rows: BenchRow[]) => void) | null>(null);
  const onUpdater = React.useCallback(
    (update: (rows: BenchRow[]) => void) => {
      updaterRef.current = update;
    },
    [],
  );

  React.useEffect(() => {
    const start = performance.now();
    const rows = generateBenchData(rowCount);
    const dataGenerationTime = performance.now() - start;
    const params = new URLSearchParams(window.location.search);
    const view = getBenchView(window.location.search);

    const uninstall = installBenchmark(
      adapter,
      {
        mount: () => {
          mountedRef.current = true;
          setMounted(true);
        },
        isMounted: () => mountedRef.current,
        view,
        update: (rows) => {
          if (!updaterRef.current) {
            throw new Error('The grid cannot take updates yet');
          }
          updaterRef.current(rows);
        },
      },
      rows,
      dataGenerationTime,
    );

    setInfo(
      `${title} · ${rows.length.toLocaleString('en-US')} rows${
        view === 'plain' ? '' : ` · ${view}`
      } · data generated in ${Math.round(dataGenerationTime)}ms · ${
        process.env.NODE_ENV
      } build${__DEV__ ? ' · __DEV__ on' : ''}`,
    );
    setData(rows);
    setView(view);

    // set before the grid mounts, so mounting is not followed by a resize
    setExtraHeight(Math.max(0, Number(params.get('extraHeight')) || 0));

    const autoMount = params.get('autoMount') !== '0';
    if (autoMount) {
      mountedRef.current = true;
      setMounted(true);
    }

    return uninstall;
  }, []);

  return (
    <>
      <div
        data-benchmark-grid={adapter.grid}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: BENCH_GRID_WIDTH,
          height: BENCH_GRID_HEIGHT + extraHeight,
          display: 'flex',
          flexDirection: 'column',
          background: 'white',
          color: 'black',
        }}
      >
        {mounted && data ? renderGrid({ data, view, onUpdater }) : null}
      </div>
      <div
        style={{
          position: 'fixed',
          top: BENCH_GRID_HEIGHT + extraHeight + 8,
          left: 8,
          font: '13px system-ui, sans-serif',
          color: 'gray',
        }}
      >
        {info}
      </div>
    </>
  );
}

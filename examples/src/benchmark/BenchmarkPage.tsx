import * as React from 'react';

import {
  BENCH_GRID_HEIGHT,
  BENCH_GRID_WIDTH,
  BenchRow,
  generateBenchData,
} from './data';
import { BenchAdapter, installBenchmark } from './harness';

type BenchmarkPageProps = {
  title: string;
  rowCount: number;
  adapter: BenchAdapter;
  renderGrid: (data: BenchRow[]) => React.ReactNode;
};

/**
 * Identical shell for both grids: generates the data (outside of any
 * measurement), installs `window.__bench` and renders the grid in a fixed
 * size box only when asked to.
 *
 * `?autoMount=0` - used by the benchmark spec, which calls
 * `window.__bench.mount()` itself, so mounting is measured. Without it the
 * grid mounts right away, for looking at the demo in the browser.
 */
export function BenchmarkPage(props: BenchmarkPageProps) {
  const { adapter, renderGrid, title, rowCount } = props;
  const [data, setData] = React.useState<BenchRow[] | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const mountedRef = React.useRef(false);
  const [info, setInfo] = React.useState('generating data...');

  React.useEffect(() => {
    const start = performance.now();
    const rows = generateBenchData(rowCount);
    const dataGenerationTime = performance.now() - start;

    const uninstall = installBenchmark(
      adapter,
      {
        mount: () => {
          mountedRef.current = true;
          setMounted(true);
        },
        isMounted: () => mountedRef.current,
      },
      rows,
      dataGenerationTime,
    );

    setInfo(
      `${title} · ${rows.length.toLocaleString(
        'en-US',
      )} rows · data generated in ${Math.round(dataGenerationTime)}ms · ${
        process.env.NODE_ENV
      } build${__DEV__ ? ' · __DEV__ on' : ''}`,
    );
    setData(rows);

    const autoMount =
      new URLSearchParams(window.location.search).get('autoMount') !== '0';
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
          height: BENCH_GRID_HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          background: 'white',
          color: 'black',
        }}
      >
        {mounted && data ? renderGrid(data) : null}
      </div>
      <div
        style={{
          position: 'fixed',
          top: BENCH_GRID_HEIGHT + 8,
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

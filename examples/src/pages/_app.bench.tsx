import * as React from 'react';

import '../index.global.css';

// _app for the production grid benchmark build (GRID_BENCHMARK=1) - kept
// minimal on purpose: no dev chrome, no extra themes, nothing rendered
// next to the grids. Neither grid is imported here, so each page loads only
// its own grid (the Infinite Table license key is set in InfiniteBenchmark).

export default function BenchmarkApp({ Component, pageProps }: any) {
  return <Component {...pageProps} />;
}

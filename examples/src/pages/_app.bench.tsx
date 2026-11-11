import * as React from 'react';

import { InfiniteTable } from '@infinite-table/infinite-react';

import '../index.global.css';

// _app for the production grid benchmark build (GRID_BENCHMARK=1) - kept
// minimal on purpose: no dev chrome, no extra themes, nothing rendered
// next to the grids

InfiniteTable.licenseKey = process.env.NEXT_PUBLIC_INFINITE_LICENSE_KEY;

export default function BenchmarkApp({ Component, pageProps }: any) {
  return <Component {...pageProps} />;
}

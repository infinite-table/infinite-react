'use client';

import { InfiniteTable } from '@infinite-table/infinite-react';

import '../styles/index.css';
import 'devtools-ui/index.css';

import type { AppProps } from 'next/app';

InfiniteTable.licenseKey = process.env.NEXT_PUBLIC_INFINITE_LICENSE_KEY;

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="h-screen w-screen flex flex-col flex-1 overflow-auto flex-container">
      <Component {...pageProps} />
    </div>
  );
}

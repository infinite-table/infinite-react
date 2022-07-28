import * as React from 'react';
import '../index.global.css';
import { InfiniteTable } from '@infinite-table/infinite-react';

InfiniteTable.defaultProps.licenseKey =
  process.env.NEXT_PUBLIC_INFINITE_LICENSE_KEY;

function MyApp({ Component, pageProps }) {
  if (!process.browser) {
    return null;
  }
  return (
    <div
      // className="__next it--theme-dark"
      className="__next infinite-dark"
      style={{ '--it-row-height': '3rem' }}
    >
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;

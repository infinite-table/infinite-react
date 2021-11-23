import * as React from 'react';
import '@components/InfiniteTable/index.scss';
import '../index.scss';

// globalThis.InfiniteTableLicenseKey =
//   process.env.NEXT_PUBLIC_INFINITE_LICENSE_KEY;

function MyApp({ Component, pageProps }) {
  if (!process.browser) {
    return null;
  }
  return (
    <div
      // className="__next it--theme-dark"
      className="__next dark"
      style={{ '--it-row-height': '3rem' }}
    >
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;

import * as React from 'react';
import '@components/InfiniteTable/index.scss';
import '../index.scss';

globalThis.InfiniteTableLicenseKey = process.env.NEXT_PUBLIC_LICENSE_KEY;

function MyApp({ Component, pageProps }) {
  if (!process.browser) {
    return null;
  }
  return (
    <React.StrictMode>
      <div className="__next it--theme-dark">
        <Component {...pageProps} />
      </div>
    </React.StrictMode>
  );
}

export default MyApp;

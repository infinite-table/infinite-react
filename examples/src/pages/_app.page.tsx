import * as React from 'react';
import Head from 'next/head';
import '../index.global.css';
import '../globals.css';

import 'shadcn-ui-css-vars/index.css';

import '../../../source/dist/theme/shadcn.css';
import '../../../source/dist/theme/ocean.css';
import '../../../source/dist/theme/minimalist.css';
import '../../../source/dist/theme/balsam.css';

import { InfiniteTable } from '@infinite-table/infinite-react';

InfiniteTable.licenseKey = process.env.NEXT_PUBLIC_INFINITE_LICENSE_KEY;

function MyApp({ Component, pageProps }: any) {
  return (
    <div
      className="__next infinite-theme-mode--dark"
      //@ts-ignore ignore
      style={{ '--it-row-height': '3rem', color: 'var(--infinite-cell-color)' }}
    >
      <Head>
        <meta
          http-equiv="Content-Security-Policy"
          content="default-src * 'unsafe-inline'; style-src * 'unsafe-inline'; script-src * 'unsafe-inline' 'unsafe-eval'; img-src * data: 'unsafe-inline'; connect-src * 'unsafe-inline'; frame-src *;"
        />
      </Head>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;

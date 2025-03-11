import * as React from 'react';
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
      className="__next infinite-dark"
      //@ts-ignore ignore
      style={{ '--it-row-height': '3rem', color: 'var(--infinite-cell-color)' }}
    >
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;

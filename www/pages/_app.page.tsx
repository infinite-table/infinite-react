import { AppProps } from 'next/app';
// import { useRouter } from 'next/router';
// import { DocsLayout } from '@www/layouts/DocsLayout';
// import { MainLayout } from '@www/layouts/MainLayout';

import '@docsearch/css';
import './styles/fonts.css';
import './styles/algolia.css';
import './styles/index.css';
import './styles/sandpack.css';
import '@codesandbox/sandpack-react/dist/index.css';

// import '../../source/dist/index.css';

import '@www/styles/globals.css';
import * as React from 'react';

import { InfiniteTable } from '@infinite-table/infinite-react';

//@ts-ignore
InfiniteTable.defaultProps.licenseKey =
  process.env.NEXT_PUBLIC_INFINITE_LICENSE_KEY;

const EmptyAppShell: React.FC = ({ children }) => {
  // if (process.env.NODE_ENV === 'development') {
  //   if (!process.browser) {
  //     return null;
  //   }
  // }
  return <>{children}</>;
};

export default function MyApp({
  Component,
  pageProps,
}: AppProps) {
  let AppShell =
    (Component as any).appShell || EmptyAppShell;
  // In order to make sidebar scrolling between pages work as expected
  // we need to access the underlying MDX component.
  if ((Component as any).isMDXComponent) {
    AppShell = (Component as any)({}).props.originalType
      .appShell;
  }
  React.useEffect(() => {
    // Monkey patch Google Tag Manager in development to just log to the console
    if (process.env.NODE_ENV !== 'production') {
      (window as any).gtag = (...args: any[]) => {
        console.log('gtag: ', ...args);
      };
    }
  }, []);
  return (
    <AppShell>
      <Component {...pageProps} />
    </AppShell>
  );
}

// const versions = require('./docs/versions.json');

// //@ts-ignore
// MyApp.getInitialProps = async (ctx) => {
//   // let currentVersion = ctx.router.query.v;

//   // if (!currentVersion) {
//   let currentVersion = ctx.router.pathname
//     .split('/')
//     //@ts-ignore
//     .filter((x) => x.trim())[1];
//   // }

//   const defaultProps = await App.getInitialProps(ctx);

//   const result = {
//     ...defaultProps,
//     pageProps: {
//       ...defaultProps.pageProps,
//       currentVersion,
//       versionInfo: versions[currentVersion],
//     },
//   };

//   return result;
// };

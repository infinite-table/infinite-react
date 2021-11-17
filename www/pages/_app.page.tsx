import App, { AppProps } from 'next/app';
// import { useRouter } from 'next/router';
// import { DocsLayout } from '@www/layouts/DocsLayout';
// import { MainLayout } from '@www/layouts/MainLayout';

import '@docsearch/css';
import './styles/fonts.css';
import './styles/algolia.css';
import './styles/index.css';
import './styles/sandpack.css';
import '@codesandbox/sandpack-react/dist/index.css';

import '../../source/dist/index.css';

import '@www/styles/globals.css';
import { DocsContext, DocsContextType } from '../src/components/DocsContext';
import * as React from 'react';

(globalThis as any).InfiniteTableLicenseKey =
  'StartDate=2021-06-29|EndDate=2030-01-01|Owner=Adaptable|Type=distribution|TS=1624971462479|C=137829811,1004007071,2756196225,1839832928,3994409405,636616862';

// //@ts-ignore
// function MyApp({Component, pageProps}) {
//   const content = <Component {...pageProps} />;

//   const router = useRouter();
//   const {pathname} = router;

//   const IS_DOCS = pathname.startsWith("/docs");

//   if (!IS_DOCS) {
//     return <MainLayout>{content}</MainLayout>;
//   }

//   console.log("pageProps are", pageProps);
//   return (
//     <DocsContext.Provider value={pageProps as DocsContextType}>
//       <DocsLayout>{content}</DocsLayout>
//     </DocsContext.Provider>
//   );
// }

// export default MyApp;

const EmptyAppShell: React.FC = ({ children }) => <>{children}</>;

export default function MyApp({ Component, pageProps }: AppProps) {
  let AppShell = (Component as any).appShell || EmptyAppShell;
  // In order to make sidebar scrolling between pages work as expected
  // we need to access the underlying MDX component.
  if ((Component as any).isMDXComponent) {
    AppShell = (Component as any)({}).props.originalType.appShell;
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

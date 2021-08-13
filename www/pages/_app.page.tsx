import App from "next/app";
import { useRouter } from "next/router";
import { DocsLayout } from "@www/layouts/DocsLayout";
import { MainLayout } from "@www/layouts/MainLayout";

import "@www/styles/globals.css";
import { DocsContext, DocsContextType } from "../src/components/DocsContext";

(globalThis as any).InfiniteTableLicenseKey =
  "StartDate=2021-06-29|EndDate=2030-01-01|Owner=Adaptable|Type=distribution|TS=1624971462479|C=137829811,1004007071,2756196225,1839832928,3994409405,636616862";

function MyApp({ Component, pageProps }) {
  const content = <Component {...pageProps} />;

  const router = useRouter();
  const { pathname } = router;

  const IS_DOCS = pathname.startsWith("/docs");

  if (!IS_DOCS) {
    return <MainLayout>{content}</MainLayout>;
  }

  console.log("pageProps are", pageProps);
  return (
    <DocsContext.Provider value={pageProps as DocsContextType}>
      <DocsLayout>{content}</DocsLayout>
    </DocsContext.Provider>
  );
}

export default MyApp;

const versions = require("./docs/versions.json");

MyApp.getInitialProps = async (ctx) => {
  // let currentVersion = ctx.router.query.v;

  // if (!currentVersion) {
  let currentVersion = ctx.router.pathname
    .split("/")
    .filter((x) => x.trim())[1];
  // }

  const defaultProps = await App.getInitialProps(ctx);

  const result = {
    ...defaultProps,
    pageProps: {
      ...defaultProps.pageProps,
      currentVersion,
      versionInfo: versions[currentVersion],
    },
  };

  return result;
};

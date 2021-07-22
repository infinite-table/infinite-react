import App from "next/app";
import { useRouter } from "next/router";
import { DocsLayout } from "@www/layouts/DocsLayout";
import { MainLayout } from "@www/layouts/MainLayout";

import "@www/styles/globals.css";
import { DocsContext, DocsContextType } from "./docs/DocsContext";

function MyApp({ Component, pageProps }) {
  const content = <Component {...pageProps} />;

  console.log("pageProps are", pageProps);
  const router = useRouter();
  const { pathname } = router;

  const IS_DOCS = pathname.startsWith("/docs");

  if (!IS_DOCS) {
    return <MainLayout>{content}</MainLayout>;
  }

  return (
    <DocsContext.Provider value={pageProps as DocsContextType}>
      <DocsLayout>{content}</DocsLayout>
    </DocsContext.Provider>
  );
}

export default MyApp;

const versions = require("./docs/versions.json");

MyApp.getInitialProps = async (ctx) => {
  let currentVersion = ctx.router.query.v;

  if (!currentVersion) {
    currentVersion = ctx.router.pathname.split("/").filter((x) => x.trim())[1];
  }

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

import Head from "next/head";
import { MDXProvider } from "@mdx-js/react";
import { useRouter } from "next/router";
import humanize from "humanize-string";
import { Footer } from "@www/components/Footer";
import { MainLayout } from "./MainLayout";
import { DocsMenu } from "@www/components/DocsMenu";
import {
  centeredFlexColumn,
  centeredFlexRow,
  display,
  flex1,
  flexDirection,
  paddingY,
} from "@www/styles/utils.css";
import { container, width100 } from "@www/components/components.css";
import { DocsHeader } from "@www/components/DocsHeader";
import { useDocsContext } from "../../pages/docs/DocsContext";

export function DocsLayout({ children }) {
  const router = useRouter();

  const { currentVersion, versionInfo } = useDocsContext();

  console.log({ currentVersion, versionInfo });
  const { pathname } = router;

  const parts = pathname.split("/");
  const title = humanize(parts.pop());

  return (
    <MDXProvider>
      <Head>
        <title>{title} :: Infinite Table for React</title>
      </Head>
      <MainLayout>
        <DocsHeader version={currentVersion} date={versionInfo.date} />
        <div
          style={{ flex: 1, overflow: "auto", justifyContent: "center" }}
          className={`${flex1} ${display.flex} ${width100}`}
        >
          <div
            className={`${display.flex} ${flexDirection.row} ${container}  ${flex1}`}
          >
            <DocsMenu
              items={[
                {
                  label: "Getting started",
                  path: "/getting-started",
                },
                {
                  label: "Row selection",
                  path: "/row-selection",
                },
                {
                  label: "cell selection",
                  path: "/cell-selection",
                },
                {
                  label: "columns",
                  path: "/columns",
                },
                {
                  label: "styling rows",
                  path: "/styling-rows",
                },
                {
                  label: "column bands",
                  path: "/col-bands",
                },
                {
                  label: "grouping row",
                  path: "/grouping-rows",
                },
              ]}
            />
            <div
              className={`${display.flex} ${flexDirection.column} ${flex1} ${paddingY["16"]}`}
            >
              {children}
            </div>
          </div>
        </div>
      </MainLayout>
      <Footer />
    </MDXProvider>
  );
}

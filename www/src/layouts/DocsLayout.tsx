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
import { DocsLink } from "@www/components/DocsLink";
import { useDocsContext } from "../components/DocsContext";
import {
  DocsHeadingType1,
  DocsHeadingType2,
  DocsHeadingType3,
  DocsHeadingType4,
} from "@www/components/DocsHeading";
import { DocsCodeBlock } from "@www/components/DocsCodeBlock";
import { DocsContent } from "@www/components/DocsContent";
import { useEffect } from "react";
import ClipboardJS from "clipboard";

const COMPONENTS = {
  a: DocsLink,
  h1: DocsHeadingType1,
  h2: DocsHeadingType2,
  h3: DocsHeadingType3,
  h4: DocsHeadingType4,
  inlineCode: DocsCodeBlock,
};

export function DocsLayout({ children }) {
  const router = useRouter();

  const { currentVersion, versionInfo } = useDocsContext();

  const { pathname } = router;

  const parts = pathname.split("/");
  const title = humanize(parts.pop());

  useEffect(() => {
    new ClipboardJS("[data-clipboard-text]", {
      // text: function (trigger) {
      //   return trigger.getAttribute('data');
      // },
    });
  }, []);

  return (
    <MDXProvider components={COMPONENTS}>
      <Head>
        <title>{title} :: Infinite Table for React</title>
      </Head>
      <MainLayout>
        <DocsHeader version={currentVersion} versionInfo={versionInfo} />
        <div
          style={{ flex: 1, overflow: "auto", justifyContent: "center" }}
          className={`${flex1} ${display.flex} ${width100}`}
        >
          <div
            className={`${display.flex} ${flexDirection.row} ${container}  ${flex1}`}
          >
            <DocsMenu
              items={versionInfo.menu}
              currentVersion={currentVersion}
            />
            <DocsContent>{children}</DocsContent>
          </div>
        </div>
      </MainLayout>
      <Footer />
    </MDXProvider>
  );
}

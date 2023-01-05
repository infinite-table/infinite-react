import { getSandpackCssText } from '@codesandbox/sandpack-react';
import Document, { Html, Head, Main, NextScript } from 'next/document';
import * as React from 'react';

//@ts-ignore
class MyDocument extends Document {
  render() {
    //  @todo specify language in HTML?
    return (
      <Html lang="en">
        <Head>
          <style
            dangerouslySetInnerHTML={{ __html: getSandpackCssText() }}
            id="sandpack"
          />
        </Head>
        <body className="font-sans antialiased text-lg bg-black text-secondary-dark leading-base">
          <Main />
          <NextScript />
          <link href="/_pagefind/pagefind-ui.css" rel="stylesheet" />
          <script
            src="/_pagefind/pagefind-ui.js"
            type="text/javascript"
          ></script>
          <script
            src="https://jean-genie-thirty.infinite-table.com/script.js"
            data-site="GPFWXKHK"
            defer
          ></script>
        </body>
      </Html>
    );
  }
}

export default MyDocument;

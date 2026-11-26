import { Html, Head, Main, NextScript } from 'next/document';

import { themeBootScript } from '../test-index/examplesTheme';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta
          http-equiv="Content-Security-Policy"
          content="default-src * 'unsafe-inline'; style-src * 'unsafe-inline'; script-src * 'unsafe-inline' 'unsafe-eval'; img-src * data: 'unsafe-inline'; connect-src * 'unsafe-inline'; frame-src *;"
        />
      </Head>
      <body
        className="__next infinite-theme-mode--dark"
        style={{
          //@ts-ignore ignore
          '--it-row-height': '3rem',
          color: 'var(--infinite-cell-color)',
        }}
      >
        {/* the light / dark choice, before the first paint. Under automation
            the dark grids of this className stay, as the specs expect */}
        <script
          dangerouslySetInnerHTML={{
            __html: themeBootScript({ inBody: true }),
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

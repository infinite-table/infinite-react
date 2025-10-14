import { Html, Head, Main, NextScript } from 'next/document';

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
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

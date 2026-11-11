import { Html, Head, Main, NextScript } from 'next/document';

// _document for the production grid benchmark build (GRID_BENCHMARK=1)
export default function BenchmarkDocument() {
  return (
    <Html lang="en">
      <Head />
      <body style={{ margin: 0, background: 'white' }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}

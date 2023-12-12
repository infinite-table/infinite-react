import { CSSProperties } from 'react';

import '@docsearch/css';
import '../styles/index.css';
import '../styles/fonts.css';
import '../styles/sandpack.css';
import '../styles/globals.css';
import colors from '../../colors';

import ClientLayout from './clientLayout';

import { SandpackCSSText } from './SandpackCSSText';
import { MetaProperties } from './MetaProperties';
import { asMeta } from '@www/utils/asMeta';

export const metadata = asMeta({
  title:
    'Infinite Table DataGrid for React — One Table — Infinite Applications.',
  description:
    'Infinite Table DataGrid for React — One Table — Infinite Applications. Infinite Table is the modern DataGrid for building React apps — faster.',
});

const vars: CSSProperties = Object.entries(colors).reduce(
  (acc, [name, value]) => ({
    ...acc,
    [`--color-${name}`]: value,
  }),
  {},
);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={vars} data-theme="dark">
      <head>
        <SandpackCSSText />
        <MetaProperties />
      </head>
      <body className="font-sans antialiased text-lg bg-black text-secondary-dark leading-base">
        <div className={`  bg-black text-content-color `}>
          <ClientLayout>{children}</ClientLayout>
        </div>

        <script
          src="https://cdn.usefathom.com/script.js"
          data-site="GPFWXKHK"
          defer
        ></script>
      </body>
    </html>
  );
}

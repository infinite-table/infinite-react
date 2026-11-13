import { IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google';

import '@docsearch/css';
import '../styles/index.css';
import '../styles/sandpack.css';
import '../styles/globals.css';
import '@thedatagrid/docs-kit/react/styles.css';
import '@thedatagrid/docs-kit/frameworks/styles.css';
import '../styles/docs-kit.css';

import ClientLayout from './clientLayout';

import { SandpackCSSText } from './SandpackCSSText';
import { ThemeInitScript } from '@www/components/themeInit';
import { MetaProperties } from './MetaProperties';
import { asMeta } from '@www/utils/asMeta';
import { DocsFrameworksProvider } from '@www/components/DocsFrameworks';
import { getDocsFrameworkPages } from '@www/utils/docsFrameworkContent';

export const metadata = asMeta({
  title:
    'Infinite Table DataGrid for React — One Table — Infinite Applications.',
  description:
    'Infinite Table DataGrid for React — One Table — Infinite Applications. Infinite Table is the modern DataGrid for building React apps — faster.',
});

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-plex-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plexSans.variable} ${jetbrainsMono.variable}`}
      // the init script sets data-theme before React hydrates
      suppressHydrationWarning
    >
      <head>
        <ThemeInitScript />
        <SandpackCSSText />
        <MetaProperties />
      </head>
      <body className="font-sans antialiased text-lg bg-bg text-fg leading-base">
        <div>
          {/* which docs pages exist for Vue: the switcher, the banner and docs links use it */}
          <DocsFrameworksProvider pages={getDocsFrameworkPages()}>
            <ClientLayout>{children}</ClientLayout>
          </DocsFrameworksProvider>
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

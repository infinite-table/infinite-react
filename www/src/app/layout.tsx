import { IBM_Plex_Sans, JetBrains_Mono } from 'next/font/google';

import '@docsearch/css';
import '../styles/index.css';
import '../styles/globals.css';
import '@thedatagrid/docs-kit/react/styles.css';
import '@thedatagrid/docs-kit/frameworks/styles.css';
import '../styles/docs-kit.css';
import '../styles/site-shell.css';
import '../styles/docs.css';
import '../styles/pages.css';

import ClientLayout from './clientLayout';

import { ThemeInitScript } from '@www/components/themeInit';
import { MetaProperties } from './MetaProperties';
import { sortedPostsIncludingDrafts } from './blog/sortedPosts';

const BLOG_POST_PATHS = sortedPostsIncludingDrafts.map((post) => post.href);
import { asMeta } from '@www/utils/asMeta';
import { DocsFrameworksProvider } from '@www/components/DocsFrameworks';
import { getDocsFrameworkPages } from '@www/utils/docsFrameworkContent';

export const metadata = asMeta({
  // og:image and twitter:image are absolute URLs
  metadataBase: new URL('https://infinite-table.com'),
  title:
    'Infinite Table DataGrid for React — One Table — Infinite Applications.',
  description:
    'Infinite Table is the modern DataGrid for building React apps — faster. Virtualized, with sorting, row grouping, pivoting, aggregations, filtering and lazy loading.',
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
        <MetaProperties blogPostPaths={BLOG_POST_PATHS} />
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

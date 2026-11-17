import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { ExternalLink } from './ExternalLink';

type FooterItem = { label: string; href: string };

const COLUMNS: { title: string; items: FooterItem[] }[] = [
  {
    title: 'Product',
    items: [
      { label: 'Get started', href: '/docs/learn/getting-started' },
      { label: 'Demo', href: '/demo' },
      { label: 'Themes', href: '/themes' },
      { label: 'Compare', href: '/compare' },
      { label: 'Benchmark', href: '/benchmark' },
      { label: 'Buy a license', href: '/pricing' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Reference',
    items: [
      { label: 'Props', href: '/docs/reference' },
      { label: 'API', href: '/docs/reference/api' },
      { label: 'Releases', href: '/docs/releases' },
      { label: 'llms.txt', href: '/llms.txt' },
    ],
  },
  {
    title: 'Community',
    items: [
      {
        label: 'GitHub',
        href: 'https://github.com/infinite-table/infinite-react',
      },
      { label: 'X / Twitter', href: 'https://twitter.com/get_infinite' },
      { label: 'Community', href: '/community' },
    ],
  },
  {
    title: 'Company',
    items: [
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'License & terms', href: '/eula' },
      { label: 'Email us', href: 'mailto:admin@infinite-table.com' },
    ],
  },
];

function FooterLink({ label, href }: FooterItem) {
  if (/^(https:|mailto:)/.test(href)) {
    return <ExternalLink href={href}>{label}</ExternalLink>;
  }
  return <Link href={href}>{label}</Link>;
}

export const Footer = () => {
  const pathname = usePathname() || '';
  // the docs and the blog have a fixed sidebar on the left
  const besideSidebar =
    /^\/(vue\/)?docs(\/|$)/.test(pathname) || pathname.startsWith('/blog');

  return (
    <footer
      className={`site-footer ${besideSidebar ? 'site-footer--beside-sidebar' : ''}`}
    >
      <div className="site-footer__wrap">
        <div className="site-footer__grid">
          <div className="site-footer__brand">
            <Link href="/" className="site-brand" aria-label="Infinite Table home">
              <i className="site-brand__mark" aria-hidden="true" />
              <span>Infinite Table</span>
            </Link>
            <p>One Table — Infinite Applications.</p>
          </div>
          {COLUMNS.map((column) => (
            <div key={column.title} className="site-footer__col">
              <h3>{column.title}</h3>
              {column.items.map((item) => (
                <FooterLink key={item.href} {...item} />
              ))}
            </div>
          ))}
        </div>
        <div className="site-footer__base">
          <span>© {new Date().getFullYear()} Infinite Table</span>
          <span>React and Vue DataGrid</span>
        </div>
      </div>
    </footer>
  );
};

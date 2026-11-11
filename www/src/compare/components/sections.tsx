import Link from 'next/link';
import * as React from 'react';

import { CodeBlock } from '@www/components/CodeBlock';

import { packageStats } from '../matrix';
import { formatDate, formatKB, getStats } from '../matrixUtils';
import type { CompareCopy, Framework, Product } from '../types';
import styles from './compare.module.css';
import { Inline, Paragraphs, toPlainText } from './Inline';

const REPO = 'https://github.com/infinite-table/infinite-react';
const CORRECTION_ISSUE = `${REPO}/issues/new?template=compare_page_correction.md`;

export function Section({
  id,
  title,
  lead,
  children,
}: {
  id: string;
  title: string;
  lead?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <h2 id={`${id}-title`} className={styles.sectionTitle}>
        {title}
      </h2>
      {lead ? <div className={styles.sectionLead}>{lead}</div> : null}
      {children}
    </section>
  );
}

export function Verdict({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className={`${styles.card} ${styles.verdict}`}>
      <span className={styles.verdictLabel}>TL;DR</span>
      <Paragraphs items={paragraphs} />
    </div>
  );
}

export function ChooseCards({
  product,
  chooseThem,
  chooseInfinite,
}: {
  product: Product;
  chooseThem: string[];
  chooseInfinite: string[];
}) {
  return (
    <div className={styles.grid2}>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Choose {product.name} if</h3>
        <ul className={styles.list}>
          {chooseThem.map((text, i) => (
            <li key={i}>
              <Inline text={text} />
            </li>
          ))}
        </ul>
      </div>
      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Choose Infinite Table if</h3>
        <ul className={styles.list}>
          {chooseInfinite.map((text, i) => (
            <li key={i}>
              <Inline text={text} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Strengths({ product }: { product: Product }) {
  return (
    <ul className={styles.list}>
      {product.strengths.map((strength, i) => (
        <li key={i}>
          {strength.text}{' '}
          <a
            className={styles.sourceLink}
            href={strength.source}
            target="_blank"
            rel="noopener noreferrer"
          >
            source
          </a>
        </li>
      ))}
    </ul>
  );
}

export function PricingTable({ products }: { products: Product[] }) {
  return (
    <div className={styles.tableScroll}>
      <table className={styles.table}>
        <caption className={styles.srOnly}>Editions, licenses and prices</caption>
        <thead>
          <tr>
            <th scope="col" className={styles.stickyCol}>
              Edition
            </th>
            <th scope="col">License</th>
            <th scope="col">List price</th>
            <th scope="col">Conditions</th>
            <th scope="col">Deployment</th>
          </tr>
        </thead>
        <tbody>
          {products.flatMap((product, index) =>
            product.editions.map((edition) => (
              <tr
                key={`${product.id}-${edition.id}`}
                className={index === 0 ? styles.infiniteCol : undefined}
              >
                <th scope="row" className={styles.stickyCol}>
                  {edition.name}
                </th>
                <td>{edition.license}</td>
                <td>
                  <strong style={{ color: 'var(--cmp-text)' }}>
                    {edition.price}
                  </strong>
                  {edition.priceNote ? (
                    <span className={styles.featureDescription}>
                      {edition.priceNote}
                    </span>
                  ) : null}
                  <a
                    className={styles.sourceLink}
                    href={edition.source}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    source
                  </a>
                </td>
                <td>
                  <span className={styles.featureDescription}>
                    {edition.freeConditions ?? '–'}
                  </span>
                </td>
                <td>
                  <span className={styles.featureDescription}>
                    {edition.deployment ?? '–'}
                  </span>
                </td>
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  );
}

export function PackageStatsTable({ products }: { products: Product[] }) {
  const rows = products.flatMap((product, index) =>
    product.measurements.map((m) => ({
      product,
      isInfinite: index === 0,
      label: m.label,
      stats: getStats(m.statsId),
      statsId: m.statsId,
    })),
  );
  return (
    <>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>
            Bundle size and dependencies
          </caption>
          <thead>
            <tr>
              <th scope="col" className={styles.stickyCol}>
                Package
              </th>
              <th scope="col" className={styles.num}>
                JS, min + gzip
              </th>
              <th scope="col" className={styles.num}>
                CSS, min + gzip
              </th>
              <th scope="col" className={styles.num}>
                Runtime dependencies
              </th>
              <th scope="col" className={styles.num}>
                From other publishers
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ isInfinite, label, stats, statsId }) =>
              stats ? (
                <tr
                  key={statsId}
                  className={isInfinite ? styles.infiniteCol : undefined}
                >
                  <th scope="row" className={styles.stickyCol}>
                    {label}
                    <span className={styles.featureDescription}>
                      {stats.packages
                        .map((p) => `${p.name}@${p.version}`)
                        .join(' + ')}
                    </span>
                  </th>
                  <td className={styles.num}>{formatKB(stats.bundle.jsGzip)}</td>
                  <td className={styles.num}>
                    {formatKB(stats.bundle.cssGzip)}
                  </td>
                  <td className={styles.num}>
                    <strong
                      className={
                        stats.transitiveDependencyCount === 0
                          ? styles.better
                          : undefined
                      }
                    >
                      {stats.transitiveDependencyCount}
                    </strong>
                    {stats.transitiveDependencyCount ? (
                      <details>
                        <summary className={styles.sourceLink}>list</summary>
                        <span
                          className={styles.featureDescription}
                          style={{ textAlign: 'left', whiteSpace: 'normal' }}
                        >
                          {stats.transitiveDependencies.join(', ')}
                        </span>
                      </details>
                    ) : null}
                  </td>
                  <td className={styles.num}>
                    {stats.thirdPartyDependencyCount}
                  </td>
                </tr>
              ) : null,
            )}
          </tbody>
        </table>
      </div>
      <p className={styles.muted}>
        Measured on {formatDate(packageStats.measuredAt)} with the latest
        versions on npm. <strong>Runtime dependencies</strong>: every package
        that <code>npm install</code> adds besides the grid&apos;s own packages
        and the framework, including required peer dependencies.{' '}
        <strong>JS / CSS</strong>: esbuild {packageStats.tools.esbuild} bundle
        of the minimal getting-started usage, minified, React or Vue left out,
        gzip level 9 (kB = 1,000 bytes). Fonts and images are not counted.
        Numbers include required peers such as a design system, so they are
        lower if your app already ships those. The{' '}
        <a
          href={`${REPO}/blob/master/www/scripts/compare/measure-packages.mjs`}
          target="_blank"
          rel="noopener noreferrer"
        >
          measurement script
        </a>{' '}
        is open source: run it to reproduce or update these numbers.
      </p>
    </>
  );
}

const FRAMEWORK_ORDER: Framework[] = [
  'React',
  'Vue',
  'Angular',
  'Svelte',
  'Solid',
  'Preact',
  'Qwik',
  'Lit',
  'Ember',
  'Alpine',
  'JavaScript',
  'Web Components',
  'Blazor',
  'ASP.NET',
  'jQuery',
];

export function FrameworkTable({ products }: { products: Product[] }) {
  const used = FRAMEWORK_ORDER.filter((fw) =>
    products.some((p) => p.frameworks.list.includes(fw)),
  );
  return (
    <div className={styles.tableScroll}>
      <table className={styles.table}>
        <caption className={styles.srOnly}>Supported frameworks</caption>
        <thead>
          <tr>
            <th scope="col" className={styles.stickyCol}>
              Framework
            </th>
            {products.map((product, index) => (
              <th
                key={product.id}
                scope="col"
                className={index === 0 ? styles.infiniteCol : undefined}
              >
                {product.name}
                <a
                  className={`${styles.sourceLink} ${styles.colHeadMeta}`}
                  href={product.frameworks.source}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  source
                </a>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {used.map((fw) => (
            <tr key={fw}>
              <th scope="row" className={styles.stickyCol}>
                {fw}
              </th>
              {products.map((product, index) => {
                const has = product.frameworks.list.includes(fw);
                return (
                  <td
                    key={product.id}
                    className={index === 0 ? styles.infiniteCol : undefined}
                  >
                    {has ? (
                      <span className={`${styles.mark} ${styles.full}`}>
                        <span className={styles.markIcon} aria-hidden="true">
                          ✓
                        </span>
                        Yes
                      </span>
                    ) : (
                      <span className={`${styles.mark} ${styles.none}`}>
                        <span className={styles.markIcon} aria-hidden="true">
                          ✕
                        </span>
                        No
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function FrameworkNotes({ products }: { products: Product[] }) {
  const notes = products.filter((p) => p.frameworks.note);
  if (!notes.length) return null;
  return (
    <ul className={`${styles.list} ${styles.muted}`} style={{ marginTop: '1rem' }}>
      {notes.map((p) => (
        <li key={p.id}>
          <strong>{p.name}:</strong> {p.frameworks.note}
        </li>
      ))}
    </ul>
  );
}

export function Migration({
  migration,
  product,
}: {
  migration: CompareCopy['migration'];
  product: Product;
}) {
  return (
    <>
      <p className={styles.sectionLead}>
        <Inline text={migration.intro} />
      </p>
      <div className={styles.codeGrid}>
        <div>
          <p className={styles.codeLabel}>{migration.from.label}</p>
          <CodeBlock lang="tsx">{migration.from.code.trim()}</CodeBlock>
        </div>
        <div>
          <p className={styles.codeLabel}>{migration.to.label}</p>
          <CodeBlock lang="tsx">{migration.to.code.trim()}</CodeBlock>
        </div>
      </div>
      <div className={styles.tableScroll}>
        <table className={styles.table}>
          <caption className={styles.srOnly}>
            How {product.name} concepts map to Infinite Table
          </caption>
          <thead>
            <tr>
              <th scope="col">{product.name}</th>
              <th scope="col" className={styles.infiniteCol}>
                Infinite Table
              </th>
            </tr>
          </thead>
          <tbody>
            {migration.mapping.map(([from, to], i) => (
              <tr key={i}>
                <td>
                  <Inline text={from} />
                </td>
                <td className={styles.infiniteCol}>
                  <Inline text={to} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {migration.notes?.length ? (
        <ul className={styles.list} style={{ marginTop: '1rem' }}>
          {migration.notes.map((note, i) => (
            <li key={i}>
              <Inline text={note} />
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

/**
 * TODO(demo-pipeline): replace with the live side-by-side demo iframes once
 * the new docs demo pipeline ships. Keep the `demo` title/description in the
 * copy files - they describe what each demo should show.
 */
export function DemoPlaceholder({
  demo,
  product,
}: {
  demo: CompareCopy['demo'];
  product: Product;
}) {
  return (
    <div className={styles.demoPlaceholder} data-demo-placeholder={product.id}>
      <strong>Live side-by-side demo: coming soon</strong>
      <span>
        {demo.title}. <Inline text={demo.description} />
      </span>
      <span className={styles.muted}>
        Until then, try the <Link href="/demo">live Infinite Table demo</Link>{' '}
        or see the <Link href="/benchmark">benchmark</Link>.
      </span>
    </div>
  );
}

export function Faq({ faq }: { faq: CompareCopy['faq'] }) {
  return (
    <div className={styles.faq}>
      {faq.map((item, i) => (
        <details key={i}>
          <summary>{item.q}</summary>
          <div className={styles.faqAnswer}>
            <p>
              <Inline text={item.a} />
            </p>
          </div>
        </details>
      ))}
    </div>
  );
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      // structured data is static, built from our own copy
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  );
}

export function faqJsonLd(faq: CompareCopy['faq']) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: toPlainText(item.a) },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `https://infinite-table.com${item.path}`,
    })),
  };
}

export function SourcesAndCorrections({ products }: { products: Product[] }) {
  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>Sources and corrections</h3>
      <p>
        Every statement about another product links to the vendor&apos;s own
        documentation, pricing or license page.{' '}
        {products.map((p, i) => (
          <React.Fragment key={p.id}>
            {i ? ' ' : ''}
            {p.name} facts were last verified on {formatDate(p.lastVerified)}.
          </React.Fragment>
        ))}{' '}
        Prices are list prices as published; taxes, discounts and quotes can
        differ. Products change quickly, so please check the vendor&apos;s site
        before you buy.
      </p>
      <p style={{ marginBottom: 0 }}>
        Spotted something wrong or out of date? We&apos;ll fix it:{' '}
        <a href={CORRECTION_ISSUE} target="_blank" rel="noopener noreferrer">
          open a correction issue
        </a>
        ,{' '}
        <a
          href={`${REPO}/blob/master/www/src/compare/matrix.ts`}
          target="_blank"
          rel="noopener noreferrer"
        >
          edit the data on GitHub
        </a>{' '}
        or{' '}
        <a href="mailto:admin@infinite-table.com?subject=Comparison%20page%20correction">
          email us
        </a>
        .
      </p>
    </div>
  );
}

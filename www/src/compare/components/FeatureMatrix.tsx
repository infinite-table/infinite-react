import Link from 'next/link';
import * as React from 'react';

import { FEATURE_GROUPS, FEATURES } from '../matrix';
import {
  matrixEditions,
  resolveCell,
  ResolvedCell,
  shortEditionName,
  tierLabel,
} from '../matrixUtils';
import type { Product, Support } from '../types';
import styles from './compare.module.css';

const MARKS: Record<Support, { icon: string; label: string }> = {
  full: { icon: '✓', label: 'Yes' },
  partial: { icon: '◐', label: 'Partial' },
  headless: { icon: '◐', label: 'Logic only' },
  none: { icon: '✕', label: 'No' },
};

export function SupportMark({
  support,
  label,
}: {
  support: Support;
  label?: string;
}) {
  const mark = MARKS[support];
  return (
    <span className={`${styles.mark} ${styles[support]}`}>
      <span className={styles.markIcon} aria-hidden="true">
        {mark.icon}
      </span>
      {label ?? mark.label}
    </span>
  );
}

export function SupportLegend() {
  return (
    <ul className={styles.legend} aria-label="Legend">
      <li>
        <SupportMark support="full" label="Built in" />
      </li>
      <li>
        <SupportMark support="partial" label="Partial / with limits" />
      </li>
      <li>
        <SupportMark support="headless" label="Logic only (headless)" />
      </li>
      <li>
        <SupportMark support="none" label="Not available" />
      </li>
      <li>
        <span className={styles.tier}>Pro</span>{' '}
        <span className={styles.muted}>= needs that paid edition</span>
      </li>
    </ul>
  );
}

function Cell({
  cell,
  showNote = true,
}: {
  cell: ResolvedCell;
  showNote?: boolean;
}) {
  return (
    <div className={styles.cell}>
      {cell.inEdition ? (
        <span className={`${styles.mark} ${styles.none}`}>
          <span className={styles.markIcon} aria-hidden="true">
            ✕
          </span>
          No
        </span>
      ) : (
        <SupportMark support={cell.support} />
      )}
      {cell.inEdition ? (
        <span className={styles.cellNote}>In {cell.inEdition.name}</span>
      ) : showNote && cell.note ? (
        <span className={styles.cellNote}>{cell.note}</span>
      ) : null}
      {cell.source && !cell.inEdition ? (
        <a
          className={styles.sourceLink}
          href={cell.source}
          target="_blank"
          rel="noopener noreferrer"
        >
          source
        </a>
      ) : null}
    </div>
  );
}

/**
 * Feature table for one competitor page: Infinite Table, then one column per
 * edition of the competitor.
 */
export function ProductFeatureMatrix({
  infinite,
  product,
}: {
  infinite: Product;
  product: Product;
}) {
  const editions = matrixEditions(product);
  const infiniteEdition = infinite.editions[0];

  return (
    <div className={styles.tableScroll}>
      <table className={styles.table}>
        <caption className={styles.srOnly}>
          Features of Infinite Table and {product.name}, by edition
        </caption>
        <thead>
          <tr>
            <th scope="col" className={styles.stickyCol}>
              Feature
            </th>
            <th scope="col" className={styles.infiniteCol}>
              <span className={styles.colHeadName}>{infinite.name}</span>
              <span className={styles.colHeadMeta}>
                Free with footer · {infiniteEdition.price}
              </span>
            </th>
            {editions.length === 1 && product.editions.length > 1 ? (
              <th scope="col">
                <span className={styles.colHeadName}>{product.name}</span>
                <span className={styles.colHeadMeta}>
                  Same features in every edition
                </span>
              </th>
            ) : (
              editions.map((edition) => (
                <th scope="col" key={edition.id}>
                  <span className={styles.colHeadName}>{edition.name}</span>
                  <span className={styles.colHeadMeta}>
                    {edition.license} · {edition.price}
                  </span>
                </th>
              ))
            )}
          </tr>
        </thead>
        <tbody>
          {FEATURE_GROUPS.map((group) => (
            <React.Fragment key={group.id}>
              <tr className={styles.groupRow}>
                <th colSpan={2 + editions.length} scope="colgroup">
                  {group.title}
                </th>
              </tr>
              {group.features.map((key) => {
                const feature = FEATURES[key];
                return (
                  <tr key={key}>
                    <th scope="row" className={styles.stickyCol}>
                      {feature.label}
                      <span
                        className={`${styles.featureDescription} ${styles.featureHint}`}
                      >
                        {feature.description}
                      </span>
                    </th>
                    <td className={styles.infiniteCol}>
                      <Cell
                        cell={resolveCell(
                          infinite,
                          infinite.features[key],
                          infiniteEdition.id,
                        )}
                      />
                    </td>
                    {editions.map((edition) => {
                      const cell = resolveCell(
                        product,
                        product.features[key],
                        edition.id,
                      );
                      return (
                        <td key={edition.id}>
                          <Cell
                            cell={cell}
                            // a note is shown once, where that support starts
                            showNote={
                              editions.length === 1 ||
                              !cell.fromEdition ||
                              cell.fromEdition === edition.id
                            }
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * The full matrix on /compare: one column per product, showing what the
 * product has in any edition and which edition that is.
 */
export function AllProductsMatrix({ products }: { products: Product[] }) {
  return (
    <div className={styles.tableScroll}>
      <table className={styles.table}>
        <caption className={styles.srOnly}>
          Features of every data grid we compare, with the edition that
          includes them
        </caption>
        <thead>
          <tr>
            <th scope="col" className={styles.stickyCol}>
              Feature
            </th>
            {products.map((product, index) => (
              <th
                scope="col"
                key={product.id}
                className={index === 0 ? styles.infiniteCol : undefined}
              >
                <span className={styles.colHeadName}>
                  {index === 0 ? (
                    product.name
                  ) : (
                    <Link href={`/compare/${product.id}`}>{product.name}</Link>
                  )}
                </span>
                <span className={styles.colHeadMeta}>
                  {product.editions[0].free
                    ? 'Free for commercial use'
                    : 'Paid for commercial use'}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {FEATURE_GROUPS.map((group) => (
            <React.Fragment key={group.id}>
              <tr className={styles.groupRow}>
                <th colSpan={1 + products.length} scope="colgroup">
                  {group.title}
                </th>
              </tr>
              {group.features.map((key) => (
                <tr key={key}>
                  <th scope="row" className={styles.stickyCol}>
                    {FEATURES[key].label}
                  </th>
                  {products.map((product, index) => {
                    const cell = product.features[key];
                    const tier =
                      cell.support === 'none'
                        ? undefined
                        : tierLabel(product, cell.edition);
                    const title = [
                      cell.note,
                      cell.upgrade
                        ? `${shortEditionName(
                            product,
                            product.editions.find(
                              (e) => e.id === cell.upgrade!.edition,
                            )!,
                          )}: ${cell.upgrade.note ?? 'full support'}`
                        : undefined,
                    ]
                      .filter(Boolean)
                      .join(' ');
                    return (
                      <td
                        key={product.id}
                        className={index === 0 ? styles.infiniteCol : undefined}
                        title={title || undefined}
                      >
                        <div className={styles.cell}>
                          {cell.source && cell.support !== 'none' ? (
                            <a
                              href={cell.source}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ textDecoration: 'none' }}
                            >
                              <SupportMark support={cell.support} />
                            </a>
                          ) : (
                            <SupportMark support={cell.support} />
                          )}
                          {tier ? <span className={styles.tier}>{tier}</span> : null}
                          {cell.upgrade ? (
                            <span className={styles.tier}>
                              {cell.upgrade.support === 'full' ? 'full in ' : 'more in '}
                              {tierLabel(product, cell.upgrade.edition)}
                            </span>
                          ) : null}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

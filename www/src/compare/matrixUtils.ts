import type { Edition, FeatureCell, Product, Support } from './types';
import { FEATURE_KEYS, packageStats } from './matrix';

export type ResolvedCell = {
  support: Support;
  note?: string;
  source?: string;
  /** set when the feature exists, but only in a higher edition */
  inEdition?: Edition;
  /** the edition this level of support starts in */
  fromEdition?: string;
};

const rank = (product: Product, editionId?: string) =>
  product.editions.findIndex((edition) => edition.id === editionId);

/** what one edition of a product gets for a feature */
export function resolveCell(
  product: Product,
  cell: FeatureCell,
  editionId: string,
): ResolvedCell {
  const current = rank(product, editionId);
  if (cell.upgrade && current >= rank(product, cell.upgrade.edition)) {
    return {
      support: cell.upgrade.support,
      note: cell.upgrade.note ?? cell.note,
      source: cell.source,
      fromEdition: cell.upgrade.edition,
    };
  }
  if (cell.support === 'none') {
    return { support: 'none', note: cell.note, source: cell.source };
  }
  if (current >= rank(product, cell.edition)) {
    return {
      support: cell.support,
      note: cell.note,
      source: cell.source,
      fromEdition: cell.edition,
    };
  }
  return {
    support: 'none',
    source: cell.source,
    inEdition: product.editions.find((edition) => edition.id === cell.edition),
  };
}

/**
 * The editions worth a column of their own in a feature table: the first one,
 * plus every edition some feature is first available in.
 */
export function matrixEditions(product: Product): Edition[] {
  const used = new Set<string>([product.editions[0].id]);
  for (const key of FEATURE_KEYS) {
    const cell = product.features[key];
    if (cell.support !== 'none' && cell.edition) used.add(cell.edition);
    if (cell.upgrade) used.add(cell.upgrade.edition);
  }
  return product.editions.filter((edition) => used.has(edition.id));
}

/** an edition label for a feature that isn't in the product's first edition */
export function tierLabel(product: Product, editionId?: string) {
  if (!editionId || editionId === product.editions[0].id) {
    return undefined;
  }
  const edition = product.editions.find((e) => e.id === editionId);
  return edition ? shortEditionName(product, edition) : undefined;
}

/** "AG Grid Enterprise" -> "Enterprise" */
export function shortEditionName(product: Product, edition: Edition) {
  if (edition.shortName) {
    return edition.shortName;
  }
  const prefix = `${product.name} `;
  return edition.name.startsWith(prefix)
    ? edition.name.slice(prefix.length)
    : edition.name;
}

export function countFeatures(product: Product, editionId: string) {
  let full = 0;
  let partial = 0;
  for (const key of FEATURE_KEYS) {
    const { support } = resolveCell(product, product.features[key], editionId);
    if (support === 'full') full++;
    else if (support === 'partial' || support === 'headless') partial++;
  }
  return { full, partial, total: FEATURE_KEYS.length };
}

export function getStats(statsId: string) {
  return packageStats.results[statsId];
}

export function formatKB(bytes: number) {
  if (!bytes) {
    return '–';
  }
  const kb = bytes / 1000;
  return `${kb.toLocaleString('en-US', {
    maximumFractionDigits: kb >= 100 ? 0 : 1,
  })} kB`;
}

export function formatDate(isoDate: string) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

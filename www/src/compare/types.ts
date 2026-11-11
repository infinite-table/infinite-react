/**
 * Types for the comparison data in `matrix.ts`.
 *
 * Every statement about a product must carry a `source` URL (the official
 * page that shows it) and every product a `lastVerified` date.
 */

export type FeatureKey =
  | 'rowVirtualization'
  | 'columnVirtualization'
  | 'sorting'
  | 'filtering'
  | 'columnResizing'
  | 'columnReordering'
  | 'columnPinning'
  | 'columnGroups'
  | 'columnMenu'
  | 'rowGrouping'
  | 'aggregations'
  | 'pivoting'
  | 'treeData'
  | 'masterDetail'
  | 'lazyLoading'
  | 'serverSideOperations'
  | 'cellEditing'
  | 'rowSelection'
  | 'cellSelection'
  | 'keyboardNavigation'
  | 'contextMenu'
  | 'rowReordering'
  | 'clipboard'
  | 'csvExport'
  | 'excelExport'
  | 'pagination'
  | 'charts'
  | 'themingCssVariables'
  | 'accessibility'
  | 'rtl';

export type FeatureDefinition = {
  key: FeatureKey;
  label: string;
  /** what counts as having the feature */
  description: string;
};

export type FeatureGroup = {
  id: string;
  title: string;
  features: FeatureKey[];
};

/**
 * - `full`: built in
 * - `partial`: built in, with a limitation explained in `note`
 * - `headless`: the library provides the state and logic, you build the UI
 * - `none`: not available (or only through third-party libraries)
 */
export type Support = 'full' | 'partial' | 'headless' | 'none';

export type FeatureCell = {
  support: Support;
  /** id of the cheapest edition that includes it (see `Product.editions`) */
  edition?: string;
  note?: string;
  /** official page that shows it - required unless `support` is `none` */
  source?: string;
  /**
   * a higher edition that supports it better, e.g. single-column sorting in
   * the free edition, multi-column sorting in a paid one
   */
  upgrade?: { edition: string; support: Support; note?: string };
};

export type Edition = {
  id: string;
  name: string;
  /** e.g. "Pro" for "MUI X Pro", used in feature tables */
  shortName?: string;
  /** e.g. "MIT", "Commercial" */
  license: string;
  /** headline list price, as the vendor shows it */
  price: string;
  /** billing basis, renewals, minimums */
  priceNote?: string;
  /** true if it can be used in commercial production without paying */
  free: boolean;
  /** conditions for free use (watermark, revenue cap, non-commercial only...) */
  freeConditions?: string;
  /** deployment / distribution / SaaS licensing */
  deployment?: string;
  source: string;
};

export type Framework =
  | 'React'
  | 'Preact'
  | 'Vue'
  | 'Angular'
  | 'Svelte'
  | 'Solid'
  | 'Qwik'
  | 'Lit'
  | 'Ember'
  | 'Alpine'
  | 'JavaScript'
  | 'Web Components'
  | 'Blazor'
  | 'ASP.NET'
  | 'jQuery';

export type Sourced = { text: string; source: string };

export type Product = {
  /** used in the URL: /compare/<id> */
  id: string;
  name: string;
  vendor: string;
  homepage: string;
  docs: string;
  pricingUrl?: string;
  licenseUrl?: string;
  repo?: string;
  /** YYYY-MM-DD - when the facts below were last checked against the sources */
  lastVerified: string;
  /** cheapest first */
  editions: Edition[];
  frameworks: { list: Framework[]; source: string; note?: string };
  /** what a React user installs */
  packages: { name: string; edition?: string; note?: string }[];
  rendering: Sourced;
  /**
   * ids of entries in `package-stats.json` (bundle size, dependencies),
   * one per edition worth showing
   */
  measurements: { statsId: string; label: string }[];
  features: Record<FeatureKey, FeatureCell>;
  /** what the product genuinely does well */
  strengths: Sourced[];
  /** other notable facts, e.g. a separate pivot component */
  notes?: Sourced[];
};

export type PackageStats = {
  label: string;
  measuredAt: string;
  framework: 'react' | 'vue';
  packages: { name: string; version: string }[];
  directDependencies: string[];
  peerDependencies: string[];
  extraInstall: string[];
  transitiveDependencyCount: number;
  /** of which published by the grid's vendor */
  firstPartyDependencyCount: number;
  thirdPartyDependencyCount: number;
  transitiveDependencies: string[];
  bundle: {
    jsGzip: number;
    jsMinified: number;
    cssGzip: number;
    cssMinified: number;
  };
};

export type PackageStatsFile = {
  measuredAt: string;
  tools: { node: string; npm: string; esbuild: string };
  script: string;
  results: Record<string, PackageStats>;
};

/**
 * The editorial part of a /compare/<id> page. Strings may use [label](url),
 * `code` and **bold**. Facts (prices, features, sizes) come from the matrix,
 * never from here.
 */
export type CompareCopy = {
  /** the product id in matrix.ts */
  id: string;
  /** <meta name="description"> */
  metaDescription: string;
  /** one sentence under the page title */
  tagline: string;
  /** the TL;DR, 1-3 short paragraphs */
  verdict: string[];
  /** when the competitor is the better choice */
  chooseThem: string[];
  /** when Infinite Table is the better fit */
  chooseInfinite: string[];
  /** deeper differences, a few short sections */
  sections?: { title: string; paragraphs: string[] }[];
  migration: {
    intro: string;
    from: { label: string; code: string };
    to: { label: string; code: string };
    /** how the concepts map */
    mapping: [string, string][];
    notes?: string[];
  };
  faq: { q: string; a: string }[];
  /** the live side-by-side demo we want to show, once the demo pipeline exists */
  demo: { title: string; description: string };
};

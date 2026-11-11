/**
 * The comparison data behind /compare and every /compare/<id> page.
 *
 * Single source of truth: the index table, the per-product pages and the
 * public /compare/matrix.json all read this file. Bundle sizes and dependency
 * counts are measured by `www/scripts/compare/measure-packages.mjs` and live in
 * `package-stats.json`, re-exported below.
 *
 * Rules for editing:
 * - every feature cell other than `no()` needs the URL of the official docs
 *   page that shows it;
 * - prices, licenses and editions need the URL of the official pricing or
 *   license page;
 * - bump `lastVerified` on a product only after re-checking its sources.
 *
 * Spotted something wrong? Please open an issue or a pull request:
 * https://github.com/infinite-table/infinite-react/issues/new?template=compare_page_correction.md
 */
import packageStatsJson from './package-stats.json';
import type {
  FeatureCell,
  FeatureDefinition,
  FeatureGroup,
  FeatureKey,
  PackageStatsFile,
  Product,
} from './types';

export const packageStats = packageStatsJson as PackageStatsFile;

// ---------------------------------------------------------------------------
// features
// ---------------------------------------------------------------------------

export const FEATURES: Record<FeatureKey, FeatureDefinition> = {
  rowVirtualization: {
    key: 'rowVirtualization',
    label: 'Row virtualization',
    description: 'Only the visible rows are rendered, out of the box.',
  },
  columnVirtualization: {
    key: 'columnVirtualization',
    label: 'Column virtualization',
    description: 'Only the visible columns are rendered, out of the box.',
  },
  sorting: {
    key: 'sorting',
    label: 'Multi-column sorting',
    description: 'Built-in sorting UI, including sorting by several columns.',
  },
  filtering: {
    key: 'filtering',
    label: 'Column filters',
    description: 'Built-in filter UI: a filter row, header filters or a filter menu.',
  },
  columnResizing: {
    key: 'columnResizing',
    label: 'Column resizing',
    description: 'Users drag to resize columns.',
  },
  columnReordering: {
    key: 'columnReordering',
    label: 'Column reordering',
    description: 'Users drag and drop columns to reorder them.',
  },
  columnPinning: {
    key: 'columnPinning',
    label: 'Column pinning',
    description: 'Pin (freeze) columns to the left or right.',
  },
  columnGroups: {
    key: 'columnGroups',
    label: 'Column groups',
    description: 'Multi-level, grouped column headers.',
  },
  columnMenu: {
    key: 'columnMenu',
    label: 'Column menu',
    description: 'A built-in column header menu (sort, hide, pin...).',
  },
  rowGrouping: {
    key: 'rowGrouping',
    label: 'Row grouping',
    description: 'Group rows by one or more columns, with expand and collapse.',
  },
  aggregations: {
    key: 'aggregations',
    label: 'Aggregations',
    description: 'Aggregated values (sum, average...) for groups or totals.',
  },
  pivoting: {
    key: 'pivoting',
    label: 'Pivoting',
    description: 'Pivot rows into dynamically generated columns.',
  },
  treeData: {
    key: 'treeData',
    label: 'Tree data',
    description: 'Hierarchical (tree) rows.',
  },
  masterDetail: {
    key: 'masterDetail',
    label: 'Master-detail',
    description: 'Expandable detail rows with custom content or a nested grid.',
  },
  lazyLoading: {
    key: 'lazyLoading',
    label: 'Lazy loading',
    description: 'Load rows from a server in batches as the user scrolls.',
  },
  serverSideOperations: {
    key: 'serverSideOperations',
    label: 'Server-side sort, filter and group',
    description:
      'Built-in support for sorting, filtering and grouping on the server.',
  },
  pagination: {
    key: 'pagination',
    label: 'Pagination UI',
    description: 'A built-in pager.',
  },
  cellEditing: {
    key: 'cellEditing',
    label: 'Cell editing',
    description: 'Inline cell editing with built-in editors.',
  },
  rowSelection: {
    key: 'rowSelection',
    label: 'Row selection',
    description: 'Select rows, including checkbox selection.',
  },
  cellSelection: {
    key: 'cellSelection',
    label: 'Cell selection',
    description: 'Select multiple cells or ranges of cells.',
  },
  keyboardNavigation: {
    key: 'keyboardNavigation',
    label: 'Keyboard navigation',
    description: 'Move between cells with the keyboard.',
  },
  contextMenu: {
    key: 'contextMenu',
    label: 'Context menu',
    description: 'A built-in cell or row context menu.',
  },
  rowReordering: {
    key: 'rowReordering',
    label: 'Row drag and drop',
    description: 'Reorder rows by dragging them.',
  },
  clipboard: {
    key: 'clipboard',
    label: 'Clipboard',
    description: 'Copy (and paste) cells, built in.',
  },
  csvExport: {
    key: 'csvExport',
    label: 'CSV export',
    description: 'Built-in export to CSV.',
  },
  excelExport: {
    key: 'excelExport',
    label: 'Excel export',
    description: 'Built-in export to Excel (.xlsx).',
  },
  charts: {
    key: 'charts',
    label: 'Integrated charts',
    description: 'Chart grid data from inside the grid.',
  },
  themingCssVariables: {
    key: 'themingCssVariables',
    label: 'Theming with CSS variables',
    description: 'Theme the grid through CSS custom properties or design tokens.',
  },
  accessibility: {
    key: 'accessibility',
    label: 'Documented accessibility',
    description:
      'ARIA roles and screen reader support, documented by the vendor.',
  },
  rtl: {
    key: 'rtl',
    label: 'Right-to-left',
    description: 'Right-to-left layout support.',
  },
};

export const FEATURE_GROUPS: FeatureGroup[] = [
  {
    id: 'rendering',
    title: 'Rendering',
    features: ['rowVirtualization', 'columnVirtualization'],
  },
  {
    id: 'columns',
    title: 'Columns',
    features: [
      'sorting',
      'filtering',
      'columnResizing',
      'columnReordering',
      'columnPinning',
      'columnGroups',
      'columnMenu',
    ],
  },
  {
    id: 'analysis',
    title: 'Grouping and analysis',
    features: [
      'rowGrouping',
      'aggregations',
      'pivoting',
      'treeData',
      'masterDetail',
    ],
  },
  {
    id: 'server',
    title: 'Server data',
    features: ['lazyLoading', 'serverSideOperations', 'pagination'],
  },
  {
    id: 'interaction',
    title: 'Editing and interaction',
    features: [
      'cellEditing',
      'rowSelection',
      'cellSelection',
      'keyboardNavigation',
      'contextMenu',
      'rowReordering',
    ],
  },
  {
    id: 'output',
    title: 'Export and charts',
    features: ['clipboard', 'csvExport', 'excelExport', 'charts'],
  },
  {
    id: 'platform',
    title: 'Styling and accessibility',
    features: ['themingCssVariables', 'accessibility', 'rtl'],
  },
];

export const FEATURE_KEYS = FEATURE_GROUPS.flatMap((group) => group.features);

// ---------------------------------------------------------------------------
// helpers, to keep one feature on one line
// ---------------------------------------------------------------------------

/** built in, from `edition` */
const yes = (edition: string, source: string, note?: string): FeatureCell => ({
  support: 'full',
  edition,
  source,
  note,
});
/** built in, with a limitation */
const partial = (
  edition: string,
  source: string,
  note: string,
): FeatureCell => ({ support: 'partial', edition, source, note });
/** state and logic only, you build the UI */
const headless = (
  edition: string,
  source: string,
  note?: string,
): FeatureCell => ({ support: 'headless', edition, source, note });
/** `cell`, plus better support from a higher edition */
const upgrade = (
  cell: FeatureCell,
  edition: string,
  note?: string,
  support: FeatureCell['support'] = 'full',
): FeatureCell => ({ ...cell, upgrade: { edition, support, note } });
/** not available */
const no = (note?: string, source?: string): FeatureCell => ({
  support: 'none',
  note,
  source,
});

const IT = 'https://infinite-table.com';

// ---------------------------------------------------------------------------
// Infinite Table
// ---------------------------------------------------------------------------

export const infinite: Product = {
  id: 'infinite-table',
  name: 'Infinite Table',
  vendor: 'Infinite Table',
  homepage: IT,
  docs: `${IT}/docs`,
  pricingUrl: `${IT}/pricing`,
  licenseUrl: `${IT}/eula`,
  repo: 'https://github.com/infinite-table/infinite-react',
  lastVerified: '2026-11-11',
  editions: [
    {
      id: 'infinite',
      name: 'Infinite Table',
      license: 'Commercial (EULA)',
      price: '$395 per developer per year',
      priceNote:
        'Volume discounts: 5% from 3 developers, 10% from 5, 15% from 10. For 20 or more developers, email us.',
      free: true,
      freeConditions:
        'Every feature is free to use, in any product, as long as the "Powered by Infinite Table" footer stays visible. A license removes the footer and adds email support.',
      deployment:
        'Development licenses only: no deployment, application or SaaS licenses.',
      source: `${IT}/pricing`,
    },
  ],
  frameworks: {
    list: ['React', 'Vue'],
    source: 'https://www.npmjs.com/package/@infinite-table/infinite-vue',
    note: 'React 18+ (@infinite-table/infinite-react) and Vue 3.4+ (@infinite-table/infinite-vue), same features and version.',
  },
  packages: [
    { name: '@infinite-table/infinite-react' },
    { name: '@infinite-table/infinite-vue', note: 'for Vue 3' },
  ],
  rendering: {
    text: 'DOM, with row and column virtualization.',
    source: `${IT}/docs/learn/examples/performance-many-rows-and-columns`,
  },
  measurements: [
    { statsId: 'infinite-react', label: 'Infinite Table for React' },
    { statsId: 'infinite-vue', label: 'Infinite Table for Vue' },
  ],
  features: {
    rowVirtualization: yes(
      'infinite',
      `${IT}/docs/learn/examples/performance-many-rows-and-columns`,
    ),
    columnVirtualization: yes(
      'infinite',
      `${IT}/docs/learn/examples/performance-many-rows-and-columns`,
    ),
    sorting: yes('infinite', `${IT}/docs/learn/sorting/multiple-sorting`),
    filtering: yes(
      'infinite',
      `${IT}/docs/learn/filtering`,
      'Filter row with operators, client-side or server-side.',
    ),
    columnResizing: yes(
      'infinite',
      `${IT}/docs/learn/columns/fixed-and-flexible-size`,
    ),
    columnReordering: yes('infinite', `${IT}/docs/learn/columns/column-order`),
    columnPinning: yes(
      'infinite',
      `${IT}/docs/reference/infinite-table-props#columnPinning`,
    ),
    columnGroups: yes('infinite', `${IT}/docs/learn/columns/column-grouping`),
    columnMenu: yes('infinite', `${IT}/docs/learn/columns/column-menus`),
    rowGrouping: yes(
      'infinite',
      `${IT}/docs/learn/grouping-and-pivoting/grouping-rows`,
    ),
    aggregations: yes(
      'infinite',
      `${IT}/docs/learn/grouping-and-pivoting/group-aggregations`,
    ),
    pivoting: yes(
      'infinite',
      `${IT}/docs/learn/grouping-and-pivoting/pivoting/overview`,
    ),
    treeData: yes('infinite', `${IT}/docs/learn/tree-grid/overview`),
    masterDetail: yes('infinite', `${IT}/docs/learn/master-detail/overview`),
    lazyLoading: yes(
      'infinite',
      `${IT}/docs/learn/working-with-data/lazy-loading`,
    ),
    serverSideOperations: yes(
      'infinite',
      `${IT}/docs/learn/working-with-data/lazy-loading`,
      'Sorting, filtering, grouping and pivoting can all run on the server.',
    ),
    pagination: no(
      'No pager UI. Live pagination loads the next page as you scroll.',
      `${IT}/docs/learn/working-with-data/live-pagination`,
    ),
    cellEditing: yes('infinite', `${IT}/docs/learn/editing/overview`),
    rowSelection: yes('infinite', `${IT}/docs/learn/selection/row-selection`),
    cellSelection: yes(
      'infinite',
      `${IT}/docs/learn/selection/cell-selection`,
    ),
    keyboardNavigation: yes(
      'infinite',
      `${IT}/docs/learn/keyboard-navigation/navigating-cells`,
    ),
    contextMenu: yes(
      'infinite',
      `${IT}/docs/learn/context-menus/using-context-menus`,
    ),
    rowReordering: no(),
    clipboard: no(),
    csvExport: no(),
    excelExport: no(),
    charts: no(
      'Cells can render any component, for example sparklines.',
      `${IT}/docs/learn/examples/using-sparklines`,
    ),
    themingCssVariables: yes(
      'infinite',
      `${IT}/docs/learn/theming/css-variables`,
    ),
    accessibility: no(
      'Keyboard navigation is built in, but ARIA roles and screen reader support are not documented.',
    ),
    rtl: no(),
  },
  strengths: [
    {
      text: 'Zero runtime dependencies: installing it adds one package to your app.',
      source: 'https://www.npmjs.com/package/@infinite-table/infinite-react',
    },
    {
      text: 'Grouping, aggregations, pivoting, tree data and master-detail in the one package, free to use with a footer.',
      source: `${IT}/docs/learn/getting-started/licensing`,
    },
    {
      text: 'A declarative API: every piece of state is a prop, controlled or uncontrolled, like a React input.',
      source: `${IT}/docs/learn/getting-started`,
    },
    {
      text: 'A separate DataSource component handles loading, sorting, filtering, grouping and pivoting, locally or on the server.',
      source: `${IT}/docs/learn/working-with-data`,
    },
  ],
};

// ---------------------------------------------------------------------------
// competitors, in the order they are listed on /compare
// ---------------------------------------------------------------------------

const AG = 'https://www.ag-grid.com/react-data-grid';

const agGrid: Product = {
  id: 'ag-grid',
  name: 'AG Grid',
  vendor: 'AG Grid Ltd',
  homepage: 'https://www.ag-grid.com/',
  docs: `${AG}/getting-started/`,
  pricingUrl: 'https://www.ag-grid.com/license-pricing/',
  licenseUrl:
    'https://www.ag-grid.com/eula/AG-Grid-Enterprise-License-Latest.html',
  repo: 'https://github.com/ag-grid/ag-grid',
  lastVerified: '2026-11-11',
  editions: [
    {
      id: 'community',
      name: 'AG Grid Community',
      license: 'MIT',
      price: 'Free',
      free: true,
      freeConditions: 'Free for everyone, including production use.',
      deployment: 'None (MIT).',
      source: 'https://www.ag-grid.com/license-pricing/',
    },
    {
      id: 'enterprise',
      name: 'AG Grid Enterprise',
      license: 'Commercial (EULA)',
      price: '$999 per developer',
      priceNote:
        'Perpetual license with 1 year of support and updates. Online purchase covers 1-10 developers on internal applications; volume and renewal discounts through sales.',
      free: false,
      freeConditions:
        'Can be tested locally without a license (watermark and console message). Free 30-day trial license.',
      deployment:
        'Applications used by customers or other external users are licensed through sales. All front-end developers on the project need a license.',
      source: 'https://www.ag-grid.com/landing-pages/enterprise-data-grid/',
    },
    {
      id: 'enterprise-bundle',
      name: 'AG Grid Enterprise + AG Charts Enterprise',
      shortName: 'Enterprise Bundle',
      license: 'Commercial (EULA)',
      price: '$1,498 per developer',
      priceNote:
        'Perpetual license with 1 year of support and updates. Same licensing rules as AG Grid Enterprise.',
      free: false,
      source: 'https://www.ag-grid.com/landing-pages/enterprise-data-grid/',
    },
  ],
  frameworks: {
    list: ['React', 'Angular', 'Vue', 'JavaScript'],
    source: `${AG}/community-vs-enterprise/`,
  },
  packages: [
    { name: 'ag-grid-react', edition: 'community' },
    { name: 'ag-grid-community', edition: 'community' },
    { name: 'ag-grid-enterprise', edition: 'enterprise' },
  ],
  rendering: {
    text: 'DOM, with row and column virtualization.',
    source: `${AG}/dom-virtualisation/`,
  },
  measurements: [
    { statsId: 'ag-grid-community', label: 'AG Grid Community' },
    { statsId: 'ag-grid-enterprise', label: 'AG Grid Enterprise' },
  ],
  features: {
    rowVirtualization: yes('community', `${AG}/dom-virtualisation/`),
    columnVirtualization: yes('community', `${AG}/dom-virtualisation/`),
    sorting: yes('community', `${AG}/row-sorting/`),
    filtering: yes(
      'community',
      `${AG}/filtering/`,
      'Text, number and date filters and a floating filter row in Community; Set, Multi and Advanced filters in Enterprise.',
    ),
    columnResizing: yes('community', `${AG}/column-sizing/`),
    columnReordering: yes('community', `${AG}/column-moving/`),
    columnPinning: yes('community', `${AG}/column-pinning/`),
    columnGroups: yes('community', `${AG}/column-groups/`),
    columnMenu: yes(
      'enterprise',
      `${AG}/column-menu/`,
      'Community can open the column filter from the header, but has no column menu.',
    ),
    rowGrouping: yes('enterprise', `${AG}/grouping/`),
    aggregations: yes('enterprise', `${AG}/aggregation/`),
    pivoting: yes('enterprise', `${AG}/pivoting/`),
    treeData: yes('enterprise', `${AG}/tree-data/`),
    masterDetail: yes('enterprise', `${AG}/master-detail/`),
    lazyLoading: yes(
      'community',
      `${AG}/infinite-scrolling/`,
      'Infinite Row Model in Community (no grouping); Server-Side Row Model with lazy-loaded groups in Enterprise.',
    ),
    serverSideOperations: upgrade(
      partial(
        'community',
        `${AG}/server-side-model/`,
        'Community: server-side sorting and filtering through the Infinite Row Model, without grouping.',
      ),
      'enterprise',
      'Enterprise: the Server-Side Row Model also groups, aggregates and pivots on the server.',
    ),
    pagination: yes('community', `${AG}/row-pagination/`),
    cellEditing: yes(
      'community',
      `${AG}/provided-cell-editors/`,
      'Rich Select and Formula editors are Enterprise.',
    ),
    rowSelection: yes('community', `${AG}/row-selection-multi-row/`),
    cellSelection: yes('enterprise', `${AG}/cell-selection/`),
    keyboardNavigation: yes('community', `${AG}/keyboard-navigation/`),
    contextMenu: yes('enterprise', `${AG}/context-menu/`),
    rowReordering: yes('community', `${AG}/row-dragging/`),
    clipboard: yes('enterprise', `${AG}/clipboard/`),
    csvExport: yes('community', `${AG}/csv-export/`),
    excelExport: yes('enterprise', `${AG}/excel-export/`),
    charts: yes(
      'enterprise',
      `${AG}/integrated-charts/`,
      'Integrated charts need AG Grid Enterprise; the full chart range needs the AG Charts Enterprise bundle.',
    ),
    themingCssVariables: yes('community', `${AG}/theming-parameters/`),
    accessibility: yes('community', `${AG}/accessibility/`),
    rtl: yes('community', `${AG}/rtl/`),
  },
  strengths: [
    {
      text: 'The broadest feature set of any grid here: on top of grouping, pivoting and tree data, Enterprise adds Excel and PDF export, formulas, a fill handle, tool panels and a status bar.',
      source: 'https://www.ag-grid.com/license-pricing/',
    },
    {
      text: 'Integrated charts: users chart grid data from inside the grid, powered by AG Charts.',
      source: `${AG}/integrated-charts/`,
    },
    {
      text: 'The Server-Side Row Model hands filtering, sorting, grouping, aggregation and pivoting to the server, and loads group children on expand.',
      source: `${AG}/server-side-model/`,
    },
    {
      text: 'A generous MIT Community edition, free in production, with multi-sort, filters, editing, selection, pagination, CSV export, accessibility and RTL.',
      source: `${AG}/community-vs-enterprise/`,
    },
    {
      text: 'One grid with official React, Angular, Vue and JavaScript versions, each with its own docs.',
      source: 'https://www.ag-grid.com/',
    },
    {
      text: 'Documented accessibility: ARIA roles and states, tested with JAWS and VoiceOver.',
      source: `${AG}/accessibility/`,
    },
  ],
};

const MUI = 'https://mui.com/x/react-data-grid';

const muiXDataGrid: Product = {
  id: 'mui-x-data-grid',
  name: 'MUI X Data Grid',
  vendor: 'MUI',
  homepage: `${MUI}/`,
  docs: `${MUI}/quickstart/`,
  pricingUrl: 'https://mui.com/pricing/',
  licenseUrl: 'https://mui.com/x/introduction/licensing/',
  repo: 'https://github.com/mui/mui-x',
  lastVerified: '2026-11-11',
  editions: [
    {
      id: 'community',
      name: 'MUI X Data Grid (Community)',
      shortName: 'Community',
      license: 'MIT',
      price: 'Free',
      free: true,
      freeConditions: 'Free forever under the MIT license.',
      deployment: 'None (MIT).',
      source: 'https://mui.com/x/introduction/licensing/',
    },
    {
      id: 'pro',
      name: 'MUI X Pro',
      shortName: 'Pro',
      license: 'Commercial (EULA)',
      price: '$299 per developer per year',
      priceNote:
        'Annual license for one application. Multi-application and perpetual licenses are also offered.',
      free: false,
      freeConditions:
        '30-day evaluation in non-production environments without a key (watermark and console warnings).',
      deployment:
        'Royalty-free: no deployment or end-user fees. Licensed per front-end developer.',
      source: 'https://mui.com/pricing/',
    },
    {
      id: 'premium',
      name: 'MUI X Premium',
      shortName: 'Premium',
      license: 'Commercial (EULA)',
      price: '$599 per developer per year',
      priceNote:
        'Annual license for one application. Multi-application and perpetual licenses are also offered.',
      free: false,
      freeConditions: 'Same 30-day evaluation as Pro.',
      deployment:
        'Royalty-free: no deployment or end-user fees. Licensed per front-end developer.',
      source: 'https://mui.com/pricing/',
    },
    {
      id: 'enterprise',
      name: 'MUI X Enterprise',
      shortName: 'Enterprise',
      license: 'Commercial (EULA)',
      price: '$1,399 per developer per year',
      priceNote:
        'From 15 seats, through sales. Premium features plus priority support.',
      free: false,
      deployment: 'Royalty-free, multi-application.',
      source: 'https://mui.com/pricing/',
    },
  ],
  frameworks: {
    list: ['React'],
    source: `${MUI}/`,
    note: 'React 17, 18 and 19. Material UI (@mui/material) is a required peer dependency.',
  },
  packages: [
    { name: '@mui/x-data-grid', edition: 'community' },
    { name: '@mui/x-data-grid-pro', edition: 'pro' },
    { name: '@mui/x-data-grid-premium', edition: 'premium' },
  ],
  rendering: {
    text: 'DOM, with row and column virtualization.',
    source: `${MUI}/virtualization/`,
  },
  measurements: [
    { statsId: 'mui-x-data-grid', label: 'MUI X Data Grid (Community)' },
    { statsId: 'mui-x-data-grid-premium', label: 'MUI X Data Grid Premium' },
  ],
  features: {
    rowVirtualization: upgrade(
      partial(
        'community',
        `${MUI}/virtualization/#row-virtualization`,
        'Community pages hold at most 100 rows, so it virtualizes up to 100 rows.',
      ),
      'pro',
    ),
    columnVirtualization: yes(
      'community',
      `${MUI}/virtualization/#column-virtualization`,
    ),
    sorting: upgrade(
      partial(
        'community',
        `${MUI}/sorting/#multi-sorting`,
        'Community sorts by one column at a time.',
      ),
      'pro',
      'Multi-column sorting from Pro.',
    ),
    filtering: upgrade(
      partial(
        'community',
        `${MUI}/filtering/`,
        'Community applies one filter at a time, from the filter panel, plus a quick filter.',
      ),
      'pro',
      'Pro adds multiple filters and a header filter row.',
    ),
    columnResizing: yes('community', `${MUI}/column-dimensions/`),
    columnReordering: yes('pro', `${MUI}/column-ordering/`),
    columnPinning: yes('pro', `${MUI}/column-pinning/`),
    columnGroups: yes('community', `${MUI}/column-groups/`),
    columnMenu: yes('community', `${MUI}/column-menu/`),
    rowGrouping: yes('premium', `${MUI}/row-grouping/`),
    aggregations: yes('premium', `${MUI}/aggregation/`),
    pivoting: yes('premium', `${MUI}/pivoting/`),
    treeData: yes('pro', `${MUI}/tree-data/`),
    masterDetail: yes('pro', `${MUI}/master-detail/`),
    lazyLoading: yes(
      'pro',
      `${MUI}/server-side-data/lazy-loading/`,
      'Viewport and infinite loading through the Data Source.',
    ),
    serverSideOperations: upgrade(
      partial(
        'community',
        `${MUI}/server-side-data/`,
        'Community: server-side sorting, filtering and pagination through the Data Source.',
      ),
      'premium',
      'Premium: also row grouping, aggregation and pivoting on the server.',
    ),
    pagination: yes(
      'community',
      `${MUI}/pagination/`,
      'Always on in Community, with pages of up to 100 rows.',
    ),
    cellEditing: yes('community', `${MUI}/editing/`),
    rowSelection: yes('community', `${MUI}/row-selection/`),
    cellSelection: yes('premium', `${MUI}/cell-selection/`),
    keyboardNavigation: yes(
      'community',
      `${MUI}/accessibility/#keyboard-navigation`,
    ),
    contextMenu: no(
      'No built-in context menu; the docs show how to add your own through slots.',
      `${MUI}/components/`,
    ),
    rowReordering: yes('pro', `${MUI}/row-ordering/`),
    clipboard: upgrade(
      partial(
        'community',
        `${MUI}/clipboard/`,
        'Community copies the selected rows; pasting is Premium.',
      ),
      'premium',
      'Premium: copy cell ranges and paste.',
    ),
    csvExport: yes('community', `${MUI}/export/#csv-export`),
    excelExport: yes('premium', `${MUI}/export/#excel-export`),
    charts: yes(
      'premium',
      `${MUI}/charts-integration/`,
      'Uses @mui/x-charts-premium, covered by the Premium license.',
    ),
    themingCssVariables: partial(
      'community',
      `${MUI}/style/`,
      'Styled through the Material UI theme, `sx` and class names; CSS variables are not a documented theming API.',
    ),
    accessibility: yes('community', `${MUI}/accessibility/`),
    rtl: yes('community', `${MUI}/localization/#rtl-support`),
  },
  strengths: [
    {
      text: 'It inherits your Material UI theme (palette, typography, density), so it fits an MUI app with no extra styling.',
      source: `${MUI}/`,
    },
    {
      text: 'A capable MIT edition: column resizing, column groups, editing, CSV export, column virtualization and a server-side data source.',
      source: 'https://mui.com/x/introduction/licensing/',
    },
    {
      text: 'One license covers the whole MUI X suite at that tier: date pickers, charts and tree view too.',
      source: 'https://mui.com/x/introduction/licensing/',
    },
    {
      text: 'Premium analytics: grouping, aggregation, pivoting with a pivot panel, Excel export and a charts integration that follows the grid state.',
      source: `${MUI}/charts-integration/`,
    },
    {
      text: 'An AI assistant (Premium) that turns natural-language prompts into filters, sorting, grouping and charts.',
      source: `${MUI}/ai-assistant/`,
    },
    {
      text: 'Careful accessibility work: it targets WCAG 2.2 AA and follows the WAI-ARIA grid pattern.',
      source: `${MUI}/accessibility/`,
    },
  ],
};

const TS = 'https://tanstack.com/table/latest/docs';
const TSG = `${TS}/framework/react/guide`;

const tanstackTable: Product = {
  id: 'tanstack-table',
  name: 'TanStack Table',
  vendor: 'TanStack',
  homepage: 'https://tanstack.com/table',
  docs: `${TS}/framework/react/quick-start`,
  licenseUrl: 'https://github.com/TanStack/table/blob/main/LICENSE',
  repo: 'https://github.com/TanStack/table',
  lastVerified: '2026-11-11',
  editions: [
    {
      id: 'oss',
      name: 'TanStack Table',
      license: 'MIT',
      price: 'Free',
      free: true,
      freeConditions: 'MIT: free for any use, no license key.',
      deployment: 'None (MIT).',
      source: 'https://github.com/TanStack/table/blob/main/LICENSE',
    },
  ],
  frameworks: {
    list: [
      'React',
      'Preact',
      'Vue',
      'Solid',
      'Svelte',
      'Angular',
      'Ember',
      'Lit',
      'Alpine',
      'JavaScript',
    ],
    source: `${TS}/overview`,
    note: 'Official adapters for React, Preact, Octane, Vue, Solid, Svelte, Angular, Ember, Lit and Alpine, plus vanilla JavaScript through @tanstack/table-core. Svelte 3 and 4 need v8.',
  },
  packages: [
    { name: '@tanstack/react-table' },
    { name: '@tanstack/react-virtual', note: 'for virtualization' },
  ],
  rendering: {
    text: 'Headless: you render all the markup and styles.',
    source: `${TS}/overview`,
  },
  measurements: [
    { statsId: 'tanstack-table', label: 'TanStack Table' },
    {
      statsId: 'tanstack-table-virtual',
      label: 'TanStack Table + TanStack Virtual',
    },
  ],
  features: {
    rowVirtualization: headless(
      'oss',
      `${TSG}/virtualization`,
      'Through the separate TanStack Virtual package.',
    ),
    columnVirtualization: headless(
      'oss',
      `${TSG}/virtualization`,
      'Through the separate TanStack Virtual package.',
    ),
    sorting: headless('oss', `${TSG}/sorting`),
    filtering: headless(
      'oss',
      `${TSG}/column-filtering`,
      'Filter logic and built-in filter functions; you build the filter UI.',
    ),
    columnResizing: headless('oss', `${TSG}/column-resizing`),
    columnReordering: headless(
      'oss',
      `${TSG}/column-ordering`,
      'Column order state; drag and drop is yours to build.',
    ),
    columnPinning: headless('oss', `${TSG}/column-pinning`),
    columnGroups: headless('oss', `${TS}/guide/header-groups`),
    columnMenu: no(),
    rowGrouping: headless('oss', `${TSG}/grouping`),
    aggregations: headless('oss', `${TSG}/aggregation`),
    pivoting: no(),
    treeData: headless('oss', `${TSG}/expanding`, 'Sub-rows with expand state.'),
    masterDetail: headless(
      'oss',
      `${TSG}/expanding`,
      'Expanded-row state; you render the detail content.',
    ),
    lazyLoading: no(
      'Not built in; the official example builds it with TanStack Virtual and your own data fetching.',
      'https://github.com/TanStack/table/tree/main/examples/react/virtualized-infinite-scrolling',
    ),
    serverSideOperations: headless(
      'oss',
      `${TS}/guide/client-side-vs-server-side`,
      'Manual modes let your server sort, filter, group and paginate.',
    ),
    pagination: headless('oss', `${TSG}/pagination`),
    cellEditing: no('No editing feature: editable cells are application code.'),
    rowSelection: headless('oss', `${TSG}/row-selection`),
    cellSelection: headless('oss', `${TSG}/cell-selection`, 'New in v9.'),
    keyboardNavigation: headless(
      'oss',
      `${TSG}/cell-selection`,
      'Focused-cell state and move APIs come with cell selection; you wire the keys.',
    ),
    contextMenu: no(),
    rowReordering: no(
      'The official example reorders rows with the third-party dnd-kit.',
      'https://github.com/TanStack/table/tree/main/examples/react/row-dnd',
    ),
    clipboard: no(
      'Selected cell values are available through the API; copying is yours to build.',
    ),
    csvExport: no(),
    excelExport: no(),
    charts: no(),
    themingCssVariables: no(
      'Ships no styles: you style it with your own CSS or design system.',
    ),
    accessibility: no(
      'No accessibility guide: you render the markup, so the ARIA roles are yours too.',
    ),
    rtl: headless(
      'oss',
      `${TSG}/column-resizing`,
      'Logical start/end pinning and an RTL resize mode; you set the direction on your markup.',
    ),
  },
  strengths: [
    {
      text: 'Headless: it brings no markup or styles, so the table can match any design system exactly.',
      source: 'https://tanstack.com/table/latest',
    },
    {
      text: 'One core with official adapters for React, Vue, Solid, Svelte, Angular and more.',
      source: `${TS}/overview`,
    },
    {
      text: 'MIT, one free edition, no license keys and no deployment fees.',
      source: 'https://github.com/TanStack/table/blob/main/LICENSE',
    },
    {
      text: 'Broad logic coverage: sorting, filtering, faceting, grouping, aggregation, expansion, row and cell selection, pagination.',
      source: 'https://tanstack.com/table/latest',
    },
    {
      text: 'A tiny core: in v9 you register only the features you use.',
      source: `${TS}/guide/features`,
    },
    {
      text: 'Server-side processing is first-class, with a manual mode for each feature.',
      source: `${TS}/guide/client-side-vs-server-side`,
    },
  ],
  notes: [
    {
      text: 'TanStack offers paid enterprise support and workshops; prices are on request.',
      source: 'https://tanstack.com/paid-support',
    },
  ],
};

const HOT = 'https://handsontable.com/docs/react-data-grid';

const handsontable: Product = {
  id: 'handsontable',
  name: 'Handsontable',
  vendor: 'Handsoncode',
  homepage: 'https://handsontable.com/',
  docs: `${HOT}/`,
  pricingUrl: 'https://handsontable.com/pricing',
  licenseUrl: `${HOT}/software-license/`,
  repo: 'https://github.com/handsontable/handsontable',
  lastVerified: '2026-11-11',
  editions: [
    {
      id: 'non-commercial',
      name: 'Non-commercial and evaluation license',
      license: 'Proprietary (non-commercial)',
      price: 'Free',
      free: false,
      freeConditions:
        'Non-commercial use only: education, research, personal use, testing and demos. In a business it covers evaluation, not production.',
      source: `${HOT}/license-key/`,
    },
    {
      id: 'commercial',
      name: 'Handsontable commercial license',
      license: 'Commercial',
      price: 'Contact sales (no public list price)',
      priceNote:
        'Priced by the number of end users of your applications, as a subscription or a perpetual license, with a support plan.',
      free: false,
      freeConditions: '45-day trial.',
      deployment:
        'Covers internal and customer-facing apps. SaaS, OEM and redistribution terms are not published.',
      source: 'https://handsontable.com/pricing',
    },
    {
      id: 'bundle',
      name: 'Handsontable + HyperFormula bundle',
      license: 'Commercial',
      price: 'Contact sales (no public list price)',
      priceNote:
        'Adds a commercial license for the HyperFormula formula engine (otherwise GPLv3).',
      free: false,
      source: 'https://handsontable.com/pricing',
    },
  ],
  frameworks: {
    list: ['React', 'Angular', 'Vue', 'JavaScript'],
    source: `${HOT}/`,
  },
  packages: [{ name: '@handsontable/react-wrapper' }, { name: 'handsontable' }],
  rendering: {
    text: 'DOM, with row and column virtualization.',
    source: `${HOT}/row-virtualization/`,
  },
  measurements: [{ statsId: 'handsontable', label: 'Handsontable' }],
  features: {
    rowVirtualization: yes('non-commercial', `${HOT}/row-virtualization/`),
    columnVirtualization: yes(
      'non-commercial',
      `${HOT}/column-virtualization/`,
    ),
    sorting: yes('non-commercial', `${HOT}/rows-sorting/`),
    filtering: yes(
      'non-commercial',
      `${HOT}/column-filter/`,
      'Excel-like filters in the column menu.',
    ),
    columnResizing: yes('non-commercial', `${HOT}/column-width/`),
    columnReordering: yes('non-commercial', `${HOT}/column-moving/`),
    columnPinning: partial(
      'non-commercial',
      `${HOT}/column-freezing/`,
      'Columns freeze at the start edge only.',
    ),
    columnGroups: yes(
      'non-commercial',
      `${HOT}/column-groups/`,
      'Nested headers, optionally collapsible.',
    ),
    columnMenu: yes('non-commercial', `${HOT}/column-menu/`),
    rowGrouping: no(
      'No grouping by column value; the NestedRows plugin shows parent and child rows from nested data.',
      `${HOT}/row-parent-child/`,
    ),
    aggregations: partial(
      'non-commercial',
      `${HOT}/column-summary/`,
      'The ColumnSummary plugin writes totals into cells you choose; no group or footer rows.',
    ),
    pivoting: no(),
    treeData: partial(
      'non-commercial',
      `${HOT}/row-parent-child/`,
      'NestedRows plugin; not supported together with column filters or sorting.',
    ),
    masterDetail: no(),
    lazyLoading: partial(
      'non-commercial',
      `${HOT}/server-side-data/`,
      'The DataProvider plugin (17.1+) loads one page at a time with the pager; loading on scroll is not documented.',
    ),
    serverSideOperations: partial(
      'non-commercial',
      `${HOT}/server-side-data/`,
      'DataProvider sends paging, single-column sorting and filters to your server; no grouping.',
    ),
    pagination: yes('non-commercial', `${HOT}/rows-pagination/`),
    cellEditing: yes('non-commercial', `${HOT}/cell-editor/`),
    rowSelection: partial(
      'non-commercial',
      `${HOT}/selection/`,
      'Select whole rows from the row headers; no checkbox selection column.',
    ),
    cellSelection: yes('non-commercial', `${HOT}/selection/`),
    keyboardNavigation: yes('non-commercial', `${HOT}/keyboard-shortcuts/`),
    contextMenu: yes('non-commercial', `${HOT}/context-menu/`),
    rowReordering: yes('non-commercial', `${HOT}/row-moving/`),
    clipboard: yes('non-commercial', `${HOT}/basic-clipboard/`),
    csvExport: yes('non-commercial', `${HOT}/export-to-csv/`),
    excelExport: yes(
      'non-commercial',
      `${HOT}/export-to-excel/`,
      'Since 17.1; needs the ExcelJS library as a peer dependency.',
    ),
    charts: no(),
    themingCssVariables: yes('non-commercial', `${HOT}/themes/`),
    accessibility: yes('non-commercial', `${HOT}/accessibility/`),
    rtl: yes('non-commercial', `${HOT}/layout-direction/`),
  },
  strengths: [
    {
      text: 'It looks and feels like a spreadsheet: Excel-style shortcuts, a fill handle, merged cells, comments and undo/redo.',
      source: 'https://handsontable.com/',
    },
    {
      text: 'Excel-compatible formulas through the HyperFormula engine (about 400 functions).',
      source: `${HOT}/formula-calculation/`,
    },
    {
      text: 'A deep editing toolkit: many cell types and editors, sync and async validators, custom React editors.',
      source: `${HOT}/cell-editor/`,
    },
    {
      text: 'Native .xlsx export that keeps data types, styles, merged cells and frozen panes, plus CSV export.',
      source: `${HOT}/export-to-excel/`,
    },
    {
      text: 'Strong accessibility documentation: it targets WCAG 2.2 A/AA and publishes a conformance report.',
      source: `${HOT}/accessibility/`,
    },
    {
      text: 'Zero runtime dependencies in the current release, too.',
      source: 'https://www.npmjs.com/package/handsontable',
    },
  ],
};

const DX = 'https://js.devexpress.com/React/Documentation/Guide/UI_Components/DataGrid';
const DXAPI =
  'https://js.devexpress.com/React/Documentation/ApiReference/UI_Components/dxDataGrid/Configuration';

const devexpress: Product = {
  id: 'devexpress',
  name: 'DevExtreme DataGrid',
  vendor: 'DevExpress',
  homepage: 'https://js.devexpress.com/',
  docs: `${DX}/Overview/`,
  pricingUrl: 'https://www.devexpress.com/buy/js/',
  licenseUrl: 'https://js.devexpress.com/Licensing/',
  repo: 'https://github.com/DevExpress/DevExtreme',
  lastVerified: '2026-11-11',
  editions: [
    {
      id: 'complete',
      name: 'DevExtreme Complete',
      license: 'Commercial (EULA)',
      price: '$899.99 per developer per year',
      priceNote:
        'Subscription; renewal $449.99. Volume discounts from 2 licenses. Also included in the ASP.NET and Blazor, DXperience and Universal subscriptions.',
      free: false,
      freeConditions:
        '30-day evaluation; no free or non-commercial license.',
      deployment: 'Royalty-free: no per-server or run-time fees.',
      source: 'https://www.devexpress.com/buy/js/',
    },
  ],
  frameworks: {
    list: ['React', 'Angular', 'Vue', 'jQuery', 'ASP.NET'],
    source: 'https://js.devexpress.com/',
    note: 'ASP.NET Core and MVC wrappers come with the ASP.NET and Blazor subscription and higher.',
  },
  packages: [{ name: 'devextreme-react' }, { name: 'devextreme' }],
  rendering: {
    text: 'DOM, with optional row and column virtualization.',
    source: `${DXAPI}/scrolling/`,
  },
  measurements: [{ statsId: 'devextreme', label: 'DevExtreme React DataGrid' }],
  features: {
    rowVirtualization: yes('complete', `${DXAPI}/scrolling/`, 'Opt-in virtual scrolling.'),
    columnVirtualization: yes(
      'complete',
      `${DX}/Enhance_Performance_on_Large_Datasets/`,
      'Opt-in; needs column widths.',
    ),
    sorting: yes('complete', `${DX}/Sorting/`),
    filtering: yes(
      'complete',
      `${DX}/Filtering_and_Searching/`,
      'Filter row, header filter, search panel and filter builder.',
    ),
    columnResizing: yes('complete', `${DX}/Columns/Column_Sizing/`),
    columnReordering: yes('complete', `${DX}/Columns/Column_Reordering/`),
    columnPinning: yes('complete', `${DX}/Columns/Column_Fixing/`),
    columnGroups: yes('complete', `${DX}/Columns/Column_Types/Band_Columns/`),
    columnMenu: yes(
      'complete',
      `${DX}/Sorting/`,
      'A header context menu (right-click) for sorting, grouping and fixing.',
    ),
    rowGrouping: yes('complete', `${DX}/Grouping/`),
    aggregations: yes('complete', `${DX}/Summaries/`),
    pivoting: partial(
      'complete',
      'https://js.devexpress.com/React/Documentation/Guide/UI_Components/PivotGrid/Overview/',
      'In the separate PivotGrid component, not in the DataGrid.',
    ),
    treeData: partial(
      'complete',
      'https://js.devexpress.com/React/Documentation/Guide/UI_Components/TreeList/Overview/',
      'In the separate TreeList component, not in the DataGrid.',
    ),
    masterDetail: yes('complete', `${DX}/Master-Detail_Interface/`),
    lazyLoading: yes('complete', `${DX}/Scrolling/`),
    serverSideOperations: yes('complete', `${DXAPI}/remoteOperations/`),
    pagination: yes('complete', `${DX}/Paging/`),
    cellEditing: yes(
      'complete',
      `${DX}/Editing/`,
      'Row, cell, batch, form and popup modes.',
    ),
    rowSelection: yes('complete', `${DX}/Selection/`),
    cellSelection: no('Not found in the DataGrid docs.'),
    keyboardNavigation: yes('complete', `${DX}/Accessibility/`),
    contextMenu: partial(
      'complete',
      `${DXAPI}/#onContextMenuPreparing`,
      'Built-in items for headers and group rows; data-row items are yours to add.',
    ),
    rowReordering: yes('complete', `${DXAPI}/rowDragging/`),
    clipboard: no('Not found in the DataGrid docs.'),
    csvExport: partial(
      'complete',
      'https://js.devexpress.com/React/Documentation/ApiReference/Common/Utils/excelExporter/',
      'Through the Excel exporter API; no CSV export format option.',
    ),
    excelExport: yes(
      'complete',
      `${DX}/Getting_Started_with_DataGrid/#Export_Data`,
      'Needs the devextreme-exceljs-fork and file-saver packages.',
    ),
    charts: no(
      'Charts are separate components; only the PivotGrid documents chart integration.',
    ),
    themingCssVariables: no(
      'Predefined themes, customized with ThemeBuilder; CSS variables are not documented.',
      'https://js.devexpress.com/React/Documentation/Guide/Themes_and_Styles/Predefined_Themes/',
    ),
    accessibility: yes('complete', `${DX}/Accessibility/`),
    rtl: yes(
      'complete',
      'https://js.devexpress.com/React/Demos/WidgetsGallery/Demo/DataGrid/RightToLeftSupport/',
    ),
  },
  strengths: [
    {
      text: 'Part of a large UI suite for React, Angular, Vue and jQuery, with a TreeList, a PivotGrid and charts next to the grid.',
      source: 'https://js.devexpress.com/',
    },
    {
      text: 'Many filtering UIs: a filter row, Excel-style header filters, a search panel and a filter builder.',
      source: `${DX}/Filtering_and_Searching/`,
    },
    {
      text: 'Five editing modes (row, cell, batch, form, popup) with validation.',
      source: `${DX}/Editing/`,
    },
    {
      text: 'Built-in remote operations: filtering, sorting, paging, grouping and summaries on the server.',
      source: `${DXAPI}/remoteOperations/`,
    },
    {
      text: 'Excel and PDF export with customizable cells.',
      source: `${DX}/Getting_Started_with_DataGrid/#Export_Data`,
    },
    {
      text: 'Royalty-free distribution, licensed per developer only.',
      source: 'https://js.devexpress.com/Licensing/',
    },
  ],
  notes: [
    {
      text: 'The older DevExtreme Reactive React Grid (@devexpress/dx-react-grid) reached end-of-life in December 2025; DevExpress points users to the DevExtreme React components compared here.',
      source: 'https://github.com/DevExpress/devextreme-reactive',
    },
  ],
};

const SF = 'https://ej2.syncfusion.com/react/documentation/grid';

const syncfusion: Product = {
  id: 'syncfusion',
  name: 'Syncfusion React Grid',
  vendor: 'Syncfusion',
  homepage: 'https://www.syncfusion.com/react-components/react-data-grid',
  docs: `${SF}/getting-started`,
  pricingUrl: 'https://www.syncfusion.com/sales/pricing',
  licenseUrl: 'https://www.syncfusion.com/eula/es/',
  repo: 'https://github.com/syncfusion/ej2-react-ui-components',
  lastVerified: '2026-11-11',
  editions: [
    {
      id: 'community',
      name: 'Syncfusion Community License (small companies)',
      shortName: 'Community License',
      license: 'Proprietary (free)',
      price: 'Free',
      free: true,
      freeConditions:
        'For companies and individuals under $1M annual revenue, with 5 or fewer developers and 10 or fewer employees, that never raised more than $3M in outside capital.',
      deployment: 'Royalty-free distribution.',
      source: 'https://www.syncfusion.com/products/communitylicense',
    },
    {
      id: 'grid-sdk',
      name: 'Syncfusion Grid SDK',
      shortName: 'Grid SDK',
      license: 'Commercial (EULA)',
      price: '$959 per developer per year',
      priceNote:
        'Annual subscription with support; includes the Tree Grid and Pivot Table. The UI Component Suite (all SDKs) is $1,199.',
      free: false,
      freeConditions: '30-day evaluation.',
      deployment: 'Royalty-free distribution of builds made during the subscription.',
      source: 'https://www.syncfusion.com/sales/pricing',
    },
  ],
  frameworks: {
    list: ['React', 'Angular', 'Vue', 'JavaScript', 'Blazor', 'ASP.NET'],
    source: 'https://www.syncfusion.com/grid-sdk',
    note: 'Also .NET MAUI, WPF, WinForms, WinUI and UWP. Each platform has its own implementation.',
  },
  packages: [{ name: '@syncfusion/ej2-react-grids' }],
  rendering: {
    text: 'DOM, with optional row and column virtualization.',
    source: `${SF}/overview`,
  },
  measurements: [{ statsId: 'syncfusion', label: 'Syncfusion React Grid' }],
  features: {
    rowVirtualization: yes(
      'community',
      `${SF}/scrolling/virtual-scrolling`,
      'Opt-in; not compatible with every feature.',
    ),
    columnVirtualization: yes(
      'community',
      `${SF}/scrolling/virtual-scrolling`,
      'Opt-in; not compatible with grouping.',
    ),
    sorting: yes('community', `${SF}/sorting`),
    filtering: yes(
      'community',
      `${SF}/filtering/filtering`,
      'Filter bar, filter menu and Excel-like checkbox filter.',
    ),
    columnResizing: yes('community', `${SF}/columns/column-resizing`),
    columnReordering: yes('community', `${SF}/columns/column-reorder`),
    columnPinning: yes('community', `${SF}/columns/frozen-column`),
    columnGroups: yes('community', `${SF}/columns/column-headers`),
    columnMenu: yes('community', `${SF}/columns/column-menu`),
    rowGrouping: yes('community', `${SF}/grouping/grouping`),
    aggregations: yes('community', `${SF}/aggregates/aggregates`),
    pivoting: partial(
      'community',
      'https://ej2.syncfusion.com/react/documentation/pivotview/getting-started',
      'In the separate Pivot Table component, not in the Grid.',
    ),
    treeData: partial(
      'community',
      'https://ej2.syncfusion.com/react/documentation/treegrid/getting-started',
      'In the separate Tree Grid component, not in the Grid.',
    ),
    masterDetail: yes('community', `${SF}/hierarchy-grid`),
    lazyLoading: yes('community', `${SF}/scrolling/infinite-scrolling`),
    serverSideOperations: yes('community', `${SF}/data-binding/remote-data`),
    pagination: yes('community', `${SF}/paging`),
    cellEditing: yes('community', `${SF}/editing/edit`),
    rowSelection: yes('community', `${SF}/selection/row-selection`),
    cellSelection: yes('community', `${SF}/selection/cell-selection`),
    keyboardNavigation: yes('community', `${SF}/accessibility`),
    contextMenu: yes('community', `${SF}/context-menu`),
    rowReordering: yes('community', `${SF}/row/row-drag-and-drop`),
    clipboard: yes('community', `${SF}/clipboard`),
    csvExport: yes('community', `${SF}/excel-export/excel-exporting`),
    excelExport: yes('community', `${SF}/excel-export/excel-exporting`),
    charts: no('Charts are separate components.'),
    themingCssVariables: yes(
      'community',
      'https://ej2.syncfusion.com/react/documentation/appearance/theme',
      'In the Tailwind 3.4, Bootstrap 5.3, Fluent 2 and Material 3 themes.',
    ),
    accessibility: yes('community', `${SF}/accessibility`),
    rtl: yes('community', `${SF}/global-local`),
  },
  strengths: [
    {
      text: 'A free Community License covers the whole suite, commercial use included, for small organizations.',
      source: 'https://www.syncfusion.com/products/communitylicense',
    },
    {
      text: 'Very broad platform coverage: React, Angular, Vue, JavaScript, Blazor, ASP.NET, .NET MAUI and desktop.',
      source: 'https://www.syncfusion.com/grid-sdk',
    },
    {
      text: 'The Grid SDK bundles the Data Grid with a Tree Grid and a Pivot Table.',
      source: 'https://www.syncfusion.com/sales/pricing',
    },
    {
      text: 'First-party Excel, CSV and PDF export, with no third-party libraries.',
      source: `${SF}/excel-export/excel-exporting`,
    },
    {
      text: 'Rich built-in interaction: column and context menus, Excel-like filters, clipboard copy and paste, range selection.',
      source: `${SF}/context-menu`,
    },
    {
      text: 'Server-side data through DataManager adaptors for OData, Web API, URL and GraphQL endpoints.',
      source: `${SF}/data-binding/remote-data`,
    },
  ],
};

const KR = 'https://www.telerik.com/kendo-react-ui/components/grid';

const kendoReact: Product = {
  id: 'kendoreact',
  name: 'KendoReact Grid',
  vendor: 'Progress (Telerik)',
  homepage: 'https://www.telerik.com/kendo-react-ui',
  docs: KR,
  pricingUrl: 'https://www.telerik.com/kendo-react-ui/pricing',
  licenseUrl:
    'https://www.telerik.com/purchase/license-agreement/progress-kendoreact',
  repo: 'https://github.com/telerik/kendo-react',
  lastVerified: '2026-11-11',
  editions: [
    {
      id: 'free',
      name: 'KendoReact Free',
      shortName: 'Free',
      license: 'Proprietary (free)',
      price: 'Free',
      free: true,
      freeConditions:
        'Free in production, commercial use included, with no license key. Includes the Grid with a subset of its features; Premium features need a license.',
      deployment: 'None.',
      source:
        'https://www.telerik.com/kendo-react-ui/components/getting-started/free-vs-premium',
    },
    {
      id: 'premium',
      name: 'KendoReact (Premium)',
      shortName: 'Premium',
      license: 'Commercial (EULA)',
      price: 'From $649 per developer per year',
      priceNote:
        'By support level: $649 Lite, $749 Priority, $1,199 Ultimate. Also included in Kendo UI and Telerik DevCraft bundles.',
      free: false,
      freeConditions: '30-day trial, not for production.',
      deployment:
        'No deployment fees: only developers using the components need licenses.',
      source: 'https://www.telerik.com/kendo-react-ui/pricing',
    },
  ],
  frameworks: {
    list: ['React'],
    source: 'https://www.telerik.com/kendo-react-ui/pricing',
    note: 'KendoReact is React-only; Progress sells separate Kendo UI products for Angular, Vue and jQuery.',
  },
  packages: [{ name: '@progress/kendo-react-grid' }],
  rendering: {
    text: 'DOM, with optional row and column virtualization.',
    source: `${KR}/scroll-modes/virtual`,
  },
  measurements: [{ statsId: 'kendoreact', label: 'KendoReact Grid' }],
  features: {
    rowVirtualization: yes('premium', `${KR}/scroll-modes/virtual`),
    columnVirtualization: yes('free', `${KR}/optimization/column-virtualization`),
    sorting: upgrade(
      partial('free', `${KR}/sorting`, 'Free: sorting by one column.'),
      'premium',
      'Premium: multi-column sorting.',
    ),
    filtering: yes(
      'free',
      `${KR}/filtering`,
      'Filter row and quick filter are free; column-menu and checkbox filters are Premium.',
    ),
    columnResizing: yes('free', `${KR}/columns/resizing`),
    columnReordering: yes('free', `${KR}/columns/reordering`),
    columnPinning: yes('premium', `${KR}/columns/locked`),
    columnGroups: yes('premium', `${KR}/columns/headers`),
    columnMenu: yes('premium', `${KR}/columns/column-menu`),
    rowGrouping: yes('premium', `${KR}/grouping/grouping`),
    aggregations: yes('premium', `${KR}/grouping/grouping`, 'Group aggregates.'),
    pivoting: partial(
      'premium',
      'https://www.telerik.com/kendo-react-ui/components/pivotgrid',
      'In the separate PivotGrid component, not in the Grid.',
    ),
    treeData: partial(
      'premium',
      'https://www.telerik.com/kendo-react-ui/components/treelist',
      'In the separate TreeList component, not in the Grid.',
    ),
    masterDetail: yes('premium', `${KR}/hierarchy`),
    lazyLoading: yes(
      'premium',
      `${KR}/scroll-modes/virtual`,
      'Virtual scrolling with remote data.',
    ),
    serverSideOperations: yes(
      'premium',
      `${KR}/data-operations/odata-server-operations`,
    ),
    pagination: yes('free', `${KR}/paging`),
    cellEditing: yes(
      'free',
      `${KR}/editing`,
      'In-cell editing is free; other edit modes are Premium.',
    ),
    rowSelection: yes(
      'free',
      `${KR}/selection`,
      'Multiple-row selection is Premium.',
    ),
    cellSelection: yes('free', `${KR}/selection`, 'Multi-range selection is Premium.'),
    keyboardNavigation: yes('free', `${KR}/accessibility/keyboard-navigation`),
    contextMenu: yes('premium', `${KR}/interactivity/context-menu`),
    rowReordering: yes('free', `${KR}/rows/row-reordering`),
    clipboard: yes('premium', `${KR}/interactivity/clipboard`),
    csvExport: yes('free', `${KR}/export/csv-export`),
    excelExport: yes('premium', `${KR}/export/excel-export`),
    charts: yes('premium', `${KR}/integration-with-chart`, 'Through the Chart Wizard.'),
    themingCssVariables: yes(
      'free',
      'https://www.telerik.com/design-system/docs/themes/kendo-themes/default/customization/',
    ),
    accessibility: yes('free', `${KR}/accessibility`),
    rtl: yes('free', `${KR}/globalization`),
  },
  strengths: [
    {
      text: 'KendoReact Free includes a production-ready Grid at no cost, commercial use included, with no license key.',
      source:
        'https://www.telerik.com/kendo-react-ui/components/getting-started/free-vs-premium',
    },
    {
      text: 'Users can build charts from selected rows or cells with the Chart Wizard.',
      source: `${KR}/integration-with-chart`,
    },
    {
      text: 'Progress states the Grid is WCAG 2.2 AA and Section 508 compliant.',
      source: `${KR}/accessibility`,
    },
    {
      text: 'CSV (free), Excel and PDF (Premium) export, plus clipboard copy and paste.',
      source: `${KR}/export/excel-export`,
    },
    {
      text: 'Part of a large suite of React components with shared design-system themes.',
      source: 'https://www.telerik.com/kendo-react-ui/pricing',
    },
  ],
};

const GLIDE = 'https://docs.grid.glideapps.com';

const glide: Product = {
  id: 'glide-data-grid',
  name: 'Glide Data Grid',
  vendor: 'Glide',
  homepage: 'https://grid.glideapps.com/',
  docs: `${GLIDE}/`,
  licenseUrl: 'https://github.com/glideapps/glide-data-grid/blob/main/README.md',
  repo: 'https://github.com/glideapps/glide-data-grid',
  lastVerified: '2026-11-11',
  editions: [
    {
      id: 'oss',
      name: 'Glide Data Grid',
      license: 'MIT',
      price: 'Free',
      free: true,
      freeConditions: 'MIT: free for any use.',
      deployment: 'None (MIT).',
      source: 'https://github.com/glideapps/glide-data-grid/blob/main/README.md',
    },
  ],
  frameworks: { list: ['React'], source: `${GLIDE}/` },
  packages: [{ name: '@glideapps/glide-data-grid' }],
  rendering: {
    text: 'HTML canvas, drawing cells on demand.',
    source: `${GLIDE}/faq`,
  },
  measurements: [{ statsId: 'glide-data-grid', label: 'Glide Data Grid' }],
  features: {
    rowVirtualization: yes('oss', `${GLIDE}/`, 'Canvas rendering, cells drawn on demand.'),
    columnVirtualization: yes('oss', `${GLIDE}/`, 'Canvas rendering, cells drawn on demand.'),
    sorting: no('Sorting is implemented in your data source.', `${GLIDE}/faq`),
    filtering: no('Filtering is implemented in your data source.', `${GLIDE}/faq`),
    columnResizing: yes('oss', `${GLIDE}/api/dataeditor/input-interaction#oncolumnresize`),
    columnReordering: yes('oss', `${GLIDE}/api/dataeditor/input-interaction#oncolumnmoved`),
    columnPinning: partial(
      'oss',
      `${GLIDE}/api/dataeditor/important-props#freezecolumns`,
      'Left side only.',
    ),
    columnGroups: partial(
      'oss',
      `${GLIDE}/api/dataeditor/styling#getgroupdetails`,
      'One level of group headers.',
    ),
    columnMenu: headless(
      'oss',
      `${GLIDE}/api/dataeditor/input-interaction#onheadermenuclick`,
      'A menu indicator and click event; you render the menu.',
    ),
    rowGrouping: no(),
    aggregations: no(),
    pivoting: no(),
    treeData: no(),
    masterDetail: no(),
    lazyLoading: headless(
      'oss',
      `${GLIDE}/api/dataeditor/important-props#onvisibleregionchanged`,
      'Cells are requested on demand; you load the data.',
    ),
    serverSideOperations: no(),
    pagination: no(),
    cellEditing: yes('oss', `${GLIDE}/api/dataeditor/editing`),
    rowSelection: yes('oss', `${GLIDE}/api/dataeditor/row-markers#rowmarkers`),
    cellSelection: yes(
      'oss',
      `${GLIDE}/api/dataeditor/selection-handling#column-range-rowselect`,
    ),
    keyboardNavigation: yes(
      'oss',
      `${GLIDE}/api/dataeditor/input-interaction#keybindings`,
    ),
    contextMenu: headless(
      'oss',
      `${GLIDE}/api/dataeditor/input-interaction#oncellcontextmenu`,
      'Context menu events; you render the menu.',
    ),
    rowReordering: yes('oss', `${GLIDE}/api/dataeditor/input-interaction#onrowmoved`),
    clipboard: yes('oss', `${GLIDE}/extended-quickstart-guide/copy-and-paste-support`),
    csvExport: no(),
    excelExport: no(),
    charts: partial(
      'oss',
      'https://github.com/glideapps/glide-data-grid/releases/tag/v6.0.0',
      'In-cell sparklines only.',
    ),
    themingCssVariables: partial(
      'oss',
      'https://github.com/glideapps/glide-data-grid/blob/main/packages/core/API.md#theme',
      'Themed mainly through a JavaScript theme object.',
    ),
    accessibility: partial(
      'oss',
      `${GLIDE}/faq`,
      'The FAQ says it works with screen readers, with limited testing.',
    ),
    rtl: no(),
  },
  strengths: [
    {
      text: 'Canvas rendering that scales to millions of rows, with cells drawn on demand.',
      source: 'https://github.com/glideapps/glide-data-grid/blob/main/README.md',
    },
    {
      text: 'Very fast, smooth native scrolling.',
      source: 'https://github.com/glideapps/glide-data-grid/blob/main/README.md',
    },
    {
      text: 'Fully custom cell drawing, plus many built-in cell types.',
      source: `${GLIDE}/api/dataeditor/custom-cells`,
    },
    {
      text: 'Spreadsheet-style interaction: multi-range selection, copy and paste, a fill handle.',
      source: `${GLIDE}/api/dataeditor/selection-handling`,
    },
    {
      text: 'MIT-licensed, with TypeScript types, variable row heights and merged cells.',
      source: 'https://github.com/glideapps/glide-data-grid/blob/main/README.md',
    },
  ],
  notes: [
    {
      text: 'The latest stable release is 6.0.3 (February 2024); newer versions are published as alphas.',
      source: 'https://www.npmjs.com/package/@glideapps/glide-data-grid?activeTab=versions',
    },
  ],
};

const RDG = 'https://github.com/Comcast/react-data-grid';

const reactDataGrid: Product = {
  id: 'react-data-grid',
  name: 'react-data-grid',
  vendor: 'Comcast (open source, originally Adazzle)',
  homepage: 'https://comcast.github.io/react-data-grid/',
  docs: `${RDG}#api-reference`,
  licenseUrl: `${RDG}/blob/main/LICENSE`,
  repo: RDG,
  lastVerified: '2026-11-11',
  editions: [
    {
      id: 'oss',
      name: 'react-data-grid',
      license: 'MIT',
      price: 'Free',
      free: true,
      freeConditions: 'MIT: free for any use.',
      deployment: 'None (MIT).',
      source: `${RDG}/blob/main/LICENSE`,
    },
  ],
  frameworks: { list: ['React'], source: `${RDG}#features` },
  packages: [{ name: 'react-data-grid' }],
  rendering: { text: 'DOM, with row and column virtualization.', source: `${RDG}#features` },
  measurements: [{ statsId: 'react-data-grid', label: 'react-data-grid' }],
  features: {
    rowVirtualization: yes('oss', `${RDG}#enablevirtualization-maybeboolean`),
    columnVirtualization: yes('oss', `${RDG}#features`),
    sorting: partial(
      'oss',
      `${RDG}#sortcolumns-maybereadonly-sortcolumn`,
      'Sortable headers and sort state; you sort the rows.',
    ),
    filtering: no('The demos build header filters in app code.'),
    columnResizing: yes('oss', `${RDG}#resizable-maybeboolean`),
    columnReordering: partial(
      'oss',
      `${RDG}#draggable-maybeboolean`,
      'Drag events; you reorder the columns.',
    ),
    columnPinning: yes('oss', `${RDG}#frozen-maybecolumnfrozen--true`),
    columnGroups: yes('oss', `${RDG}#columngrouptrow-tsummaryrow`),
    columnMenu: no(),
    rowGrouping: yes('oss', `${RDG}#treedatagrid-`, 'With the TreeDataGrid component.'),
    aggregations: partial(
      'oss',
      `${RDG}#topsummaryrows-maybereadonly-sr`,
      'Summary rows show values you compute.',
    ),
    pivoting: no(),
    treeData: no('TreeDataGrid groups by column values; the tree demo is app code.'),
    masterDetail: no('The demo builds it in app code.'),
    lazyLoading: no('The infinite scrolling demo is app code.'),
    serverSideOperations: no(),
    pagination: no(),
    cellEditing: yes('oss', `${RDG}#rendereditcell-maybeprops-rendereditcellcontentpropstrow-tsummaryrow--reactnode`),
    rowSelection: yes('oss', `${RDG}#selectedrows-maybereadonlysetk`),
    cellSelection: no(),
    keyboardNavigation: yes('oss', `${RDG}#keyboard-shortcuts`),
    contextMenu: headless(
      'oss',
      `${RDG}#oncellcontextmenu-cellmouseeventhandlerr-sr`,
      'A context menu event; you render the menu.',
    ),
    rowReordering: no('The demo implements it in app code.'),
    clipboard: partial(
      'oss',
      `${RDG}#keyboard-shortcuts`,
      'Copy and paste of the active cell, through callbacks.',
    ),
    csvExport: no(),
    excelExport: no(),
    charts: no(),
    themingCssVariables: yes('oss', `${RDG}#css-variables`),
    accessibility: yes('oss', `${RDG}#role-string--undefined`),
    rtl: yes('oss', `${RDG}#direction-maybeltr--rtl`),
  },
  strengths: [
    {
      text: 'Small and dependency-free, with tree shaking.',
      source: `${RDG}#features`,
    },
    {
      text: 'Row and column virtualization.',
      source: `${RDG}#features`,
    },
    {
      text: 'A modern React fit: ESM, server-side rendering support, strict TypeScript types.',
      source: `${RDG}#features`,
    },
    {
      text: 'Light and dark mode out of the box, themed with CSS variables.',
      source: `${RDG}#styling-and-customization`,
    },
    {
      text: 'Accessible: ARIA grid semantics, keyboard support and right-to-left layouts.',
      source: `${RDG}#treedatagrid-`,
    },
  ],
  notes: [
    {
      text: 'The npm "latest" release is a 7.0 beta; the last stable release is 6.1.0, from 2019.',
      source: 'https://www.npmjs.com/package/react-data-grid?activeTab=versions',
    },
  ],
};

const MRT = 'https://www.material-react-table.com/docs';

const materialReactTable: Product = {
  id: 'material-react-table',
  name: 'Material React Table',
  vendor: 'Kevin Van Cott (open source)',
  homepage: 'https://www.material-react-table.com/',
  docs: `${MRT}/getting-started/install`,
  licenseUrl: 'https://github.com/KevinVandy/material-react-table/blob/v3/LICENSE',
  repo: 'https://github.com/KevinVandy/material-react-table',
  lastVerified: '2026-11-11',
  editions: [
    {
      id: 'mit',
      name: 'Material React Table',
      license: 'MIT',
      price: 'Free',
      free: true,
      freeConditions: 'MIT: free in personal and commercial projects.',
      deployment: 'None (MIT).',
      source: 'https://www.material-react-table.com/about',
    },
  ],
  frameworks: {
    list: ['React'],
    source: `${MRT}/getting-started/install`,
    note: 'Built on TanStack Table and Material UI, which (with Emotion and MUI date pickers) are required peer dependencies.',
  },
  packages: [{ name: 'material-react-table' }],
  rendering: {
    text: 'DOM, Material UI table built on TanStack Table; virtualization is opt-in.',
    source: `${MRT}/guides/virtualization`,
  },
  measurements: [{ statsId: 'material-react-table', label: 'Material React Table' }],
  features: {
    rowVirtualization: yes('mit', `${MRT}/guides/virtualization`, 'Opt-in.'),
    columnVirtualization: yes('mit', `${MRT}/guides/virtualization`, 'Opt-in.'),
    sorting: yes('mit', `${MRT}/guides/sorting`),
    filtering: yes('mit', `${MRT}/guides/column-filtering`),
    columnResizing: yes('mit', `${MRT}/guides/column-resizing`),
    columnReordering: yes('mit', `${MRT}/guides/column-ordering-dnd`),
    columnPinning: yes('mit', `${MRT}/guides/column-pinning`),
    columnGroups: yes('mit', `${MRT}/examples/advanced`),
    columnMenu: yes('mit', `${MRT}/guides/column-actions`),
    rowGrouping: yes('mit', `${MRT}/guides/column-grouping`),
    aggregations: yes('mit', `${MRT}/guides/aggregation`),
    pivoting: no(),
    treeData: yes('mit', `${MRT}/guides/expanding-sub-rows`),
    masterDetail: yes('mit', `${MRT}/guides/detail-panel`),
    lazyLoading: no(
      'The infinite scrolling example builds it with TanStack Query.',
      `${MRT}/examples/infinite-scrolling`,
    ),
    serverSideOperations: partial(
      'mit',
      `${MRT}/examples/react-query`,
      'Manual modes turn off client-side processing; you fetch the data.',
    ),
    pagination: yes('mit', `${MRT}/guides/pagination`),
    cellEditing: yes('mit', `${MRT}/guides/editing`),
    rowSelection: yes('mit', `${MRT}/guides/row-selection`),
    cellSelection: no(),
    keyboardNavigation: yes('mit', `${MRT}/guides/accessibility`),
    contextMenu: yes('mit', `${MRT}/guides/cell-actions`, 'Cell actions menu.'),
    rowReordering: partial(
      'mit',
      `${MRT}/guides/row-ordering-dnd`,
      'Drag handles; you reorder the data.',
    ),
    clipboard: partial('mit', `${MRT}/guides/click-to-copy`, 'Click to copy one cell.'),
    csvExport: no('The docs show how to export with third-party libraries.', `${MRT}/examples/export-csv`),
    excelExport: no(),
    charts: no(),
    themingCssVariables: partial(
      'mit',
      `${MRT}/guides/customize-components`,
      'Themed through the Material UI theme.',
    ),
    accessibility: partial(
      'mit',
      `${MRT}/guides/accessibility`,
      'Keyboard navigation and focus are documented; ARIA roles are not.',
    ),
    rtl: partial(
      'mit',
      `${MRT}/guides/column-resizing`,
      'Follows the MUI theme direction for resizing.',
    ),
  },
  strengths: [
    {
      text: 'A ready-made Material Design data table on top of TanStack Table: toolbar, menus, filters and pagination included.',
      source: 'https://www.material-react-table.com/',
    },
    {
      text: 'It respects your Material UI theme.',
      source: `${MRT}/guides/customize-components`,
    },
    {
      text: 'MIT with no paid tier, including grouping, aggregation, tree rows and detail panels.',
      source: 'https://www.material-react-table.com/about',
    },
    {
      text: 'Rich filtering: 13 filter variants, including date, range and multi-select.',
      source: `${MRT}/guides/column-filtering`,
    },
    {
      text: 'Five editing modes (modal, row, cell, table, custom).',
      source: `${MRT}/guides/editing`,
    },
  ],
  notes: [
    {
      text: 'The latest stable release, 3.2.1, is from March 2025.',
      source: 'https://www.npmjs.com/package/material-react-table?activeTab=versions',
    },
  ],
};

const MANT = 'https://www.mantine-react-table.com/docs';
const MANT2 = 'https://v2.mantine-react-table.com/docs';

const mantineReactTable: Product = {
  id: 'mantine-react-table',
  name: 'Mantine React Table',
  vendor: 'Kevin Van Cott (open source)',
  homepage: 'https://www.mantine-react-table.com/',
  docs: `${MANT}/getting-started/install`,
  licenseUrl: 'https://github.com/KevinVandy/mantine-react-table/blob/v2/LICENSE',
  repo: 'https://github.com/KevinVandy/mantine-react-table',
  lastVerified: '2026-11-11',
  editions: [
    {
      id: 'mit',
      name: 'Mantine React Table',
      license: 'MIT',
      price: 'Free',
      free: true,
      freeConditions: 'MIT: free in personal and commercial projects.',
      deployment: 'None (MIT).',
      source: 'https://www.mantine-react-table.com/about',
    },
  ],
  frameworks: {
    list: ['React'],
    source: `${MANT}/getting-started/install`,
    note: 'The stable V1 needs Mantine V6; V2, for Mantine V7, is in beta.',
  },
  packages: [{ name: 'mantine-react-table' }],
  rendering: {
    text: 'DOM, Mantine table built on TanStack Table; virtualization is opt-in.',
    source: `${MANT}/guides/virtualization`,
  },
  measurements: [{ statsId: 'mantine-react-table', label: 'Mantine React Table' }],
  features: {
    rowVirtualization: yes('mit', `${MANT}/guides/virtualization`, 'Opt-in.'),
    columnVirtualization: yes('mit', `${MANT}/guides/virtualization`, 'Opt-in.'),
    sorting: yes('mit', `${MANT}/guides/sorting`),
    filtering: yes('mit', `${MANT}/guides/column-filtering`),
    columnResizing: yes('mit', `${MANT}/guides/column-resizing`),
    columnReordering: yes('mit', `${MANT}/guides/column-ordering-dnd`),
    columnPinning: yes('mit', `${MANT}/guides/column-pinning`),
    columnGroups: yes('mit', `${MANT}/api/column-options`),
    columnMenu: yes('mit', `${MANT}/guides/column-actions-menu`),
    rowGrouping: yes('mit', `${MANT}/guides/aggregation-and-grouping`),
    aggregations: yes('mit', `${MANT}/guides/aggregation-and-grouping`),
    pivoting: no(),
    treeData: yes('mit', `${MANT}/guides/expanding-sub-rows`),
    masterDetail: yes('mit', `${MANT}/guides/detail-panel`),
    lazyLoading: no(
      'The infinite scrolling example builds it with TanStack Query.',
      `${MANT}/examples/infinite-scrolling`,
    ),
    serverSideOperations: partial(
      'mit',
      `${MANT}/guides/sorting`,
      'Manual modes turn off client-side processing; you fetch the data.',
    ),
    pagination: yes('mit', `${MANT}/guides/pagination`),
    cellEditing: yes('mit', `${MANT}/guides/editing`),
    rowSelection: yes('mit', `${MANT}/guides/row-selection`),
    cellSelection: no(),
    keyboardNavigation: no(),
    contextMenu: no(),
    rowReordering: partial(
      'mit',
      `${MANT}/guides/row-ordering-dnd`,
      'Drag handles; you reorder the data.',
    ),
    clipboard: partial('mit', `${MANT}/guides/click-to-copy`, 'Click to copy one cell.'),
    csvExport: no('The docs show how to export with third-party libraries.', `${MANT}/examples/export-csv`),
    excelExport: no(),
    charts: no(),
    themingCssVariables: partial(
      'mit',
      `${MANT2}/guides/customize-component-styles`,
      'Mantine theme; CSS variables in the V2 beta.',
    ),
    accessibility: no(),
    rtl: partial(
      'mit',
      `${MANT2}/guides/column-resizing`,
      'RTL column resizing in the V2 beta.',
    ),
  },
  strengths: [
    {
      text: 'A ready-made Mantine data table on top of TanStack Table: toolbar, menus, filters and pagination included.',
      source: 'https://v2.mantine-react-table.com/',
    },
    {
      text: 'It respects your Mantine theme.',
      source: `${MANT2}/guides/customize-component-styles`,
    },
    {
      text: 'MIT with no paid tier, including grouping, aggregation, tree rows and detail panels.',
      source: 'https://www.mantine-react-table.com/about',
    },
    {
      text: 'Five editing modes and many filter variants.',
      source: `${MANT}/guides/editing`,
    },
    {
      text: 'Shares its API with Material React Table, which it was forked from.',
      source: 'https://www.mantine-react-table.com/',
    },
  ],
  notes: [
    {
      text: 'npm "latest" is still V1 (1.3.4, November 2023, for Mantine V6). V2 is 2.0.0-beta.9 (February 2025). Neither supports Mantine 8 or 9.',
      source: 'https://www.npmjs.com/package/mantine-react-table?activeTab=versions',
    },
  ],
};

const REVO = 'https://rv-grid.com/guide';

const revogrid: Product = {
  id: 'revogrid',
  name: 'RevoGrid',
  vendor: 'Revolist',
  homepage: 'https://rv-grid.com/',
  docs: `${REVO}/react/`,
  pricingUrl: 'https://rv-grid.com/pricing',
  licenseUrl: `${REVO}/licensing`,
  repo: 'https://github.com/revolist/revogrid',
  lastVerified: '2026-11-11',
  editions: [
    {
      id: 'community',
      name: 'RevoGrid (MIT core)',
      shortName: 'MIT core',
      license: 'MIT',
      price: 'Free',
      free: true,
      freeConditions: 'MIT: free for commercial use.',
      deployment: 'None (MIT).',
      source: 'https://rv-grid.com/pricing',
    },
    {
      id: 'pro-lite',
      name: 'RevoGrid Pro Lite',
      shortName: 'Pro Lite',
      license: 'Commercial (EULA)',
      price: '$199 per developer per year',
      priceNote: 'Annual license; Pro modules except Pivot, Kanban, Gantt and Scheduler.',
      free: false,
      freeConditions: '30-day evaluation.',
      deployment: 'No deployment counting, no server license.',
      source: 'https://rv-grid.com/pricing',
    },
    {
      id: 'pro-advanced',
      name: 'RevoGrid Pro Advanced',
      shortName: 'Pro Advanced',
      license: 'Commercial (EULA)',
      price: '$499 per developer per year',
      priceNote: 'Adds the Pivot Table, Kanban, Gantt and Scheduler modules.',
      free: false,
      freeConditions: '30-day evaluation.',
      deployment: 'No deployment counting, no server license.',
      source: 'https://rv-grid.com/pricing',
    },
  ],
  frameworks: {
    list: ['React', 'Vue', 'Angular', 'Svelte', 'JavaScript', 'Web Components'],
    source: 'https://github.com/revolist/revogrid/blob/main/readme.md',
  },
  packages: [{ name: '@revolist/react-datagrid' }, { name: '@revolist/revogrid' }],
  rendering: {
    text: 'DOM web component, with row and column virtualization.',
    source: 'https://github.com/revolist/revogrid/blob/main/readme.md',
  },
  measurements: [{ statsId: 'revogrid', label: 'RevoGrid (MIT core)' }],
  features: {
    rowVirtualization: yes('community', `${REVO}/defs`),
    columnVirtualization: yes('community', `${REVO}/performance`),
    sorting: yes('community', `${REVO}/sorting`),
    filtering: yes('community', `${REVO}/filters`),
    columnResizing: yes('community', `${REVO}/column/resize`),
    columnReordering: yes('community', `${REVO}/column/order`),
    columnPinning: yes('community', `${REVO}/column/pin`),
    columnGroups: yes('community', `${REVO}/column/grouping`),
    columnMenu: no(),
    rowGrouping: yes('community', `${REVO}/row/grouping`),
    aggregations: yes('pro-lite', `${REVO}/row/grouping`),
    pivoting: yes('pro-advanced', 'https://rv-grid.com/pricing'),
    treeData: yes('pro-lite', 'https://rv-grid.com/pro/'),
    masterDetail: yes('pro-lite', 'https://rv-grid.com/pro/'),
    lazyLoading: yes('pro-lite', 'https://rv-grid.com/pro/'),
    serverSideOperations: headless(
      'community',
      `${REVO}/server-side-data`,
      'Intercept sort and filter events and load the results yourself.',
    ),
    pagination: yes('pro-lite', 'https://rv-grid.com/pro/'),
    cellEditing: yes('community', `${REVO}/editing`),
    rowSelection: yes('pro-lite', 'https://rv-grid.com/pro/', 'Checkbox row selection is Pro.'),
    cellSelection: yes('community', `${REVO}/defs`),
    keyboardNavigation: yes('community', `${REVO}/defs#Keyboard`),
    contextMenu: yes('pro-lite', 'https://rv-grid.com/pro/'),
    rowReordering: yes('community', `${REVO}/row/order`),
    clipboard: yes('community', `${REVO}/defs`),
    csvExport: yes('community', `${REVO}/export.plugin`),
    excelExport: yes('pro-lite', `${REVO}/data-grid-export-excel`),
    charts: partial('pro-lite', 'https://rv-grid.com/pro/', 'Charts in cells only.'),
    themingCssVariables: yes('community', `${REVO}/theme`),
    accessibility: yes('community', `${REVO}/wcag`),
    rtl: yes('community', `${REVO}/rtl`),
  },
  strengths: [
    {
      text: 'Built for large data: millions of cells and thousands of columns.',
      source: 'https://github.com/revolist/revogrid/blob/main/readme.md',
    },
    {
      text: 'A web component core with official React, Vue, Angular and Svelte wrappers.',
      source: `${REVO}/defs`,
    },
    {
      text: 'A generous MIT core: column groups, row grouping, pinning, range selection, clipboard and CSV export.',
      source: 'https://github.com/revolist/revogrid/blob/main/readme.md',
    },
    {
      text: 'Low, simple Pro pricing with no deployment counting.',
      source: 'https://rv-grid.com/pricing',
    },
    {
      text: 'Pro Advanced adds Pivot Table, Gantt, Kanban and Scheduler modules on the same grid.',
      source: 'https://rv-grid.com/pricing',
    },
  ],
};

const WJ = 'https://developer.mescius.com/wijmo';

const wijmo: Product = {
  id: 'wijmo',
  name: 'Wijmo FlexGrid',
  vendor: 'MESCIUS',
  homepage: `${WJ}`,
  docs: `${WJ}/docs/GettingStarted/QuickStart/QuickStart-React`,
  pricingUrl: `${WJ}/pricing`,
  licenseUrl: `${WJ}/licensing`,
  lastVerified: '2026-11-11',
  editions: [
    {
      id: 'enterprise',
      name: 'Wijmo Enterprise',
      license: 'Commercial (EULA)',
      price: '$799 per developer',
      priceNote:
        'Perpetual developer license with one year of updates and support; renewal $599 per year.',
      free: false,
      freeConditions: '30-day trial with a watermark.',
      deployment:
        'Licensed per developer and deployment hostname: 5 non-commercial hostnames included; commercial deployment is $499 per hostname (one-time); SaaS needs an annual SaaS license.',
      source: `${WJ}/pricing`,
    },
  ],
  frameworks: {
    list: ['React', 'Angular', 'Vue', 'JavaScript', 'Web Components'],
    source: `${WJ}/docs/GettingStarted/Introduction`,
  },
  packages: [{ name: '@mescius/wijmo.react.grid' }],
  rendering: {
    text: 'DOM, with row and column virtualization.',
    source: `${WJ}/api/classes/Wijmo_Grid.Flexgrid.html`,
  },
  measurements: [{ statsId: 'wijmo', label: 'Wijmo FlexGrid' }],
  features: {
    rowVirtualization: yes('enterprise', `${WJ}/api/classes/Wijmo_Grid.Flexgrid.html`),
    columnVirtualization: yes('enterprise', `${WJ}/api/classes/Wijmo_Grid.Flexgrid.html`),
    sorting: yes('enterprise', `${WJ}/api/enums/Wijmo_Grid.Allowsorting.html`),
    filtering: yes(
      'enterprise',
      `${WJ}/docs/Topics/Grid/Filtering/Excel-like-Filter`,
      'Excel-style filters (wijmo.grid.filter module).',
    ),
    columnResizing: yes('enterprise', `${WJ}/demos/Grid/Columns/Resizing/react`),
    columnReordering: yes('enterprise', `${WJ}/api/enums/Wijmo_Grid.Allowdragging.html`),
    columnPinning: partial(
      'enterprise',
      `${WJ}/api/enums/Wijmo_Grid.Allowpinning.html`,
      'Frozen and pinned columns on the left.',
    ),
    columnGroups: yes('enterprise', `${WJ}/demos/Grid/Columns/ColumnGroups/react`),
    columnMenu: no('The column picker demo builds one in app code.'),
    rowGrouping: yes('enterprise', `${WJ}/demos/Grid/Grouping/GroupPanel`),
    aggregations: yes('enterprise', `${WJ}/demos/Grid/Aggregation/Aggregategroup`),
    pivoting: yes(
      'enterprise',
      `${WJ}/docs/Topics/OLAP/OLAP-Architecture`,
      'With the separate OLAP module (PivotGrid).',
    ),
    treeData: yes('enterprise', `${WJ}/demos/Grid/TreeGrid/ChildItems`),
    masterDetail: yes('enterprise', `${WJ}/demos/Grid/Rows/RowDetail/Overview`),
    lazyLoading: partial(
      'enterprise',
      `${WJ}/demos/Grid/Data-binding/VirtualOData`,
      'Documented for OData services.',
    ),
    serverSideOperations: partial(
      'enterprise',
      `${WJ}/flexgrid-javascript-data-grid`,
      'Server-side operations through CollectionViews, documented mainly for OData.',
    ),
    pagination: yes(
      'enterprise',
      `${WJ}/demos/Core/CollectionView/NavigatingViews/CollectionViewNavigator`,
    ),
    cellEditing: yes('enterprise', `${WJ}/api/classes/Wijmo_Grid.Flexgrid.html`),
    rowSelection: yes('enterprise', `${WJ}/demos/Grid/Selection/CheckboxSelection`),
    cellSelection: yes('enterprise', `${WJ}/api/enums/wijmo_grid.selectionmode.html`),
    keyboardNavigation: yes('enterprise', `${WJ}/api/classes/Wijmo_Grid.Flexgrid.html`),
    contextMenu: no('The demo builds one in app code.'),
    rowReordering: yes('enterprise', `${WJ}/demos/Grid/Rows/Reordering`),
    clipboard: yes('enterprise', `${WJ}/api/classes/Wijmo_Grid.Flexgrid.html`),
    csvExport: partial(
      'enterprise',
      `${WJ}/demos/Grid/ClipString`,
      'CSV text through getClipString; saving the file is up to you.',
    ),
    excelExport: yes('enterprise', `${WJ}/demos/Grid/ImportExportPrint/Excel/Async`),
    charts: partial(
      'enterprise',
      `${WJ}/demos/Grid/CustomCells/CellMaker/Sparklines/purejs`,
      'In-cell sparklines; charts are separate controls.',
    ),
    themingCssVariables: partial(
      'enterprise',
      `${WJ}/docs/GettingStarted/Wijmo-Sass`,
      'Themed with Sass variables and bundled themes.',
    ),
    accessibility: yes('enterprise', `${WJ}/demos/Grid/Accessibility/AccessibilityExtender`),
    rtl: yes('enterprise', `${WJ}/demos/Grid/RightToLeft`),
  },
  strengths: [
    {
      text: 'A broad feature set in one product: Excel-style filtering, grouping with aggregates, a tree grid, master-detail and multi-level column groups.',
      source: `${WJ}/flexgrid-javascript-data-grid`,
    },
    {
      text: 'Client-side OLAP pivoting with a pivot panel, pivot grid and pivot chart.',
      source: `${WJ}/react-ui-components`,
    },
    {
      text: 'Modular: components ship as separate modules, with no external dependencies.',
      source: `${WJ}/docs/GettingStarted/Introduction`,
    },
    {
      text: 'One component set for JavaScript, Angular, React, Vue and Web Components.',
      source: `${WJ}/docs/GettingStarted/Introduction`,
    },
    {
      text: 'Perpetual developer licenses, and offline license validation.',
      source: `${WJ}/licensing`,
    },
  ],
};


export const competitors: Product[] = [
  agGrid,
  muiXDataGrid,
  tanstackTable,
  handsontable,
  devexpress,
  syncfusion,
  kendoReact,
  glide,
  reactDataGrid,
  materialReactTable,
  mantineReactTable,
  revogrid,
  wijmo,
];

export const products: Product[] = [infinite, ...competitors];

export function getCompetitor(id: string): Product | undefined {
  return competitors.find((product) => product.id === id);
}

/** the edition object a feature cell points to */
export function getEdition(product: Product, editionId?: string) {
  return product.editions.find((edition) => edition.id === editionId);
}

/** the cheapest edition, and whether it's free */
export function getEntryEdition(product: Product) {
  return product.editions[0];
}

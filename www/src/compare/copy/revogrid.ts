import type { CompareCopy } from '../types';
import { CARS_DATA, CARS_TYPE, INFINITE_CARS } from './shared';

export const revogridCopy: CompareCopy = {
  id: 'revogrid',
  metaDescription:
    'Infinite Table vs RevoGrid: MIT core vs Pro features, pricing, bundle size, framework support and migration, with sources for every claim.',
  tagline:
    'RevoGrid is a web-component grid with an MIT core and inexpensive Pro plans. Infinite Table is a React and Vue grid with every feature in one package.',
  verdict: [
    'RevoGrid is a fast, virtualized grid built as a web component, with wrappers for React, Vue, Angular and Svelte. Its MIT core is generous: sorting, filters, pinning on both sides, column groups, row grouping, range selection, clipboard, CSV export, RTL. Pro Lite ($199 per developer per year) adds aggregation, tree data, master-detail, lazy loading, pagination, context menus and Excel export; Pro Advanced ($499) adds pivoting.',
    'Infinite Table includes aggregations, pivoting, tree data, master-detail and lazy loading in its free package, with **zero runtime dependencies**, and is configured with React or Vue props rather than a web component. It is free to use with a footer.',
  ],
  chooseThem: [
    'You need one grid across React, Vue, Angular, Svelte and plain JavaScript.',
    'You need clipboard, CSV and Excel export, RTL or documented accessibility.',
    "The MIT core covers what you need, or Pro's price suits you.",
  ],
  chooseInfinite: [
    'You need aggregations, pivoting, tree data or master-detail without a paid plan.',
    'You want a component that is native to React or Vue, with controlled and uncontrolled props.',
    'You want server-side grouping and pivoting with lazy loading.',
  ],
  migration: {
    intro:
      'RevoGrid columns use `prop` and `name`; Infinite Table uses `field` and `header` in a `columns` object.',
    from: {
      label: 'RevoGrid',
      code: `
import { RevoGrid } from '@revolist/react-datagrid';
import type { ColumnRegular } from '@revolist/react-datagrid';

${CARS_TYPE}

${CARS_DATA}

const columns: ColumnRegular[] = [
  { prop: 'make', name: 'Make', sortable: true, order: 'asc' },
  { prop: 'model', name: 'Model', size: 200 },
  { prop: 'price', name: 'Price' },
];

export function Cars() {
  return <RevoGrid columns={columns} source={data} style={{ height: 500 }} />;
}`,
    },
    to: { label: 'Infinite Table', code: INFINITE_CARS },
    mapping: [
      ['`prop`', '`field`'],
      ['`name`', '`header`'],
      ['`size`', '`defaultWidth`, or the `columnSizing` prop'],
      ['`cellTemplate`', '`renderValue` or `render`'],
      ['`order` on a column', '`defaultSortInfo`, `sortInfo` on `<DataSource>`'],
      ['`grouping`', '`defaultGroupBy`, `groupBy` on `<DataSource>`'],
      ['`pin`', '`columnPinning`'],
    ],
  },
  faq: [
    {
      q: 'Which RevoGrid features need Pro?',
      a: "Based on RevoGrid's pricing and Pro pages, aggregation, tree data, master-detail, server loading with infinite scroll, pagination, checkbox row selection, context menus and Excel export are Pro features; pivoting needs Pro Advanced. Grouping, pinning, column groups, range selection, clipboard and CSV export are in the MIT core.",
    },
  ],
  demo: {
    title: 'Grouping and aggregating in both grids',
    description: 'The same rows grouped with aggregations in RevoGrid Pro and in Infinite Table.',
  },
};

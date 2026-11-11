import type { CompareCopy } from '../types';
import { CARS_DATA, CARS_TYPE, INFINITE_CARS } from './shared';

export const glideCopy: CompareCopy = {
  id: 'glide-data-grid',
  metaDescription:
    'Infinite Table vs Glide Data Grid: DOM vs canvas rendering, features, licensing, bundle size and migration, with sources for every claim.',
  tagline:
    'Glide Data Grid draws cells on a canvas and leaves sorting and filtering to you. Infinite Table renders DOM cells and has data operations built in.',
  verdict: [
    'Glide Data Grid is a fast, MIT-licensed grid that renders on an HTML canvas. It scrolls smoothly through millions of rows and has spreadsheet-like interaction: range selection, copy and paste, a fill handle. Sorting, filtering, grouping and server data are left to your code, and its latest stable release is from February 2024.',
    'Infinite Table renders regular DOM cells, so cells can hold any React component, and it has sorting, filtering, grouping, pivoting, tree data, master-detail and lazy loading built in, with **zero runtime dependencies**. It is free to use with a footer.',
  ],
  chooseThem: [
    'You need canvas rendering for very large grids with simple cells.',
    'You want spreadsheet-style range selection, copy and paste, and a fill handle.',
    'You want an MIT license with no footer.',
  ],
  chooseInfinite: [
    'You need sorting, filtering, grouping or pivoting built in.',
    'Your cells render React components: buttons, links, inputs, charts.',
    'You load data from a server as the user scrolls.',
    'You want a grid that is actively released.',
  ],
  migration: {
    intro:
      'Glide asks you for each cell through `getCellContent` and leaves sorting to your data; Infinite Table takes your data and columns, and sorts it for you.',
    from: {
      label: 'Glide Data Grid',
      code: `
import { DataEditor, GridCellKind } from '@glideapps/glide-data-grid';
import type { GridCell, GridColumn, Item } from '@glideapps/glide-data-grid';
import '@glideapps/glide-data-grid/dist/index.css';

${CARS_TYPE}

${CARS_DATA}

const columns: GridColumn[] = [
  { title: 'Make', id: 'make' },
  { title: 'Model', id: 'model', width: 200 },
  { title: 'Price', id: 'price' },
];
const keys = ['make', 'model', 'price'] as const;

// sorting is up to you: sort the data before giving it to the grid
const rows = [...data].sort((a, b) => a.make.localeCompare(b.make));

function getCellContent([col, row]: Item): GridCell {
  const value = String(rows[row][keys[col]]);
  return {
    kind: GridCellKind.Text,
    data: value,
    displayData: value,
    allowOverlay: false,
  };
}

export function Cars() {
  return (
    <DataEditor
      columns={columns}
      rows={rows.length}
      getCellContent={getCellContent}
      height={500}
    />
  );
}`,
    },
    to: { label: 'Infinite Table', code: INFINITE_CARS },
    mapping: [
      ['`columns` (array) + `getCellContent`', '`columns` (an object keyed by column id) with `field`'],
      ['`title`', '`header`'],
      ['`width`', '`defaultWidth`, or the `columnSizing` prop'],
      ['custom cells (canvas drawing)', '`renderValue` or `render` (React components)'],
      ['sorting your data yourself', '`defaultSortInfo`, `sortInfo` on `<DataSource>`'],
      ['`onVisibleRegionChanged` + your fetch', 'a `data` function on `<DataSource>`, with `lazyLoad`'],
    ],
  },
  faq: [
    {
      q: 'Does Glide Data Grid sort and filter?',
      a: "Glide's FAQ says filtering and sorting are something you implement in your data source. Infinite Table sorts and filters built in, on the client or the server.",
    },
    {
      q: 'Is canvas rendering faster than DOM rendering?',
      a: 'Canvas rendering can draw very large grids quickly, and Glide scrolls smoothly. DOM rendering lets cells hold any React component and works with browser features such as text selection and find. Infinite Table virtualizes rows and columns, so it only renders the cells you see.',
    },
  ],
  demo: {
    title: 'Scrolling a million rows in both grids',
    description: 'The same large dataset in Glide Data Grid (canvas) and Infinite Table (DOM).',
  },
};

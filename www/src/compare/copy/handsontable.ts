import type { CompareCopy } from '../types';
import { CARS_DATA, CARS_TYPE, INFINITE_CARS } from './shared';

export const handsontableCopy: CompareCopy = {
  id: 'handsontable',
  metaDescription:
    'Infinite Table vs Handsontable: a data grid for large datasets vs a spreadsheet-like grid. Features, licensing for commercial use, bundle size and migration, with sources.',
  tagline:
    'Handsontable is a spreadsheet-like grid with formulas and Excel-style editing. Infinite Table is a data grid for exploring large datasets, with grouping, pivoting and server-side loading.',
  verdict: [
    'Handsontable is built to feel like a spreadsheet: Excel-like shortcuts, a fill handle, merged cells, comments, undo and redo, validators and formulas through HyperFormula. It also has native Excel export and thorough accessibility documentation. If your users edit data the way they would in Excel, it is a strong fit.',
    "Infinite Table is built for reading and analysing data: row grouping with aggregations, pivoting, tree data, master-detail and lazy loading from a server, with every piece of state exposed as a prop. Handsontable doesn't group rows by value, pivot or render detail rows, and its server-side data loads one page at a time.",
    "The licenses differ a lot. Handsontable's free license is for non-commercial use only, and commercial licenses are priced per end user, through sales. Infinite Table is free for commercial use with a footer, or $395 per developer per year without it.",
  ],
  chooseThem: [
    'Your users need a spreadsheet: formulas, a fill handle, merged cells, comments, undo and redo.',
    'You need Excel and CSV export, or clipboard copy and paste, built in.',
    'You need documented accessibility (Handsontable publishes a WCAG 2.2 conformance report) or right-to-left layouts.',
    'You use Angular or plain JavaScript as well as React and Vue.',
  ],
  chooseInfinite: [
    'You need row grouping with aggregations, pivoting or master-detail.',
    'You load large datasets from a server in batches as the user scrolls.',
    'You want to use the grid commercially for free (with a footer), or at a published per-developer price.',
    'You want a declarative API: columns, sorting, grouping and selection as controlled or uncontrolled props.',
  ],
  sections: [
    {
      title: 'Spreadsheet vs data grid',
      paragraphs: [
        "Handsontable's model is a sheet: rows are identified by their position, and sorting, filtering and moving are stored as index changes. Formulas, validators and cell meta data are first class.",
        'Infinite Table\'s model is a dataset: rows have a primary key, and `<DataSource>` derives sorted, filtered, grouped and pivoted views from your data, locally or on the server.',
      ],
    },
  ],
  migration: {
    intro:
      'A Handsontable grid with three columns and an initial sort, next to the same grid in Infinite Table.',
    from: {
      label: 'Handsontable',
      code: `
import { HotTable, HotColumn } from '@handsontable/react-wrapper';
import { registerAllModules } from 'handsontable/registry';
import 'handsontable/styles/handsontable.min.css';
import 'handsontable/styles/ht-theme-main.min.css';

registerAllModules();

${CARS_TYPE}

${CARS_DATA}

export function Cars() {
  return (
    <HotTable
      themeName="ht-theme-main"
      data={data}
      colHeaders={true}
      columnSorting={{ initialConfig: { column: 0, sortOrder: 'asc' } }}
      height={500}
      licenseKey="non-commercial-and-evaluation"
    >
      <HotColumn data="make" title="Make" />
      <HotColumn data="model" title="Model" width={200} />
      <HotColumn data="price" title="Price" type="numeric" />
    </HotTable>
  );
}`,
    },
    to: { label: 'Infinite Table', code: INFINITE_CARS },
    mapping: [
      ['`<HotColumn data="make">` or `columns`', '`columns` (an object keyed by column id) with `field`'],
      ['`title`, `colHeaders`', '`header`'],
      ['`width`, `colWidths`', '`defaultWidth`, `defaultFlex`, or the `columnSizing` prop'],
      ['`renderer`', '`renderValue` or `render`'],
      ['rows identified by index', '`primaryKey` on `<DataSource>`'],
      ['`columnSorting.initialConfig`', '`defaultSortInfo`, `sortInfo` on `<DataSource>`'],
      ['`NestedRows` (`__children`)', '`<TreeDataSource>` and `<TreeGrid>`'],
      ['`DataProvider` plugin', 'a `data` function on `<DataSource>`, with `lazyLoad`'],
      ['`licenseKey`', '`licenseKey`'],
    ],
  },
  faq: [
    {
      q: 'Is Handsontable free for commercial use?',
      a: 'No. Its free license key, `non-commercial-and-evaluation`, covers non-commercial use (education, research, personal use, testing and demos); in a business it only covers evaluation. Commercial licenses are sold through sales and priced by the number of end users. Infinite Table can be used commercially for free, with a "Powered by Infinite Table" footer.',
    },
    {
      q: 'Does Infinite Table support formulas like Handsontable?',
      a: 'No. Infinite Table has no formula engine. Handsontable integrates HyperFormula, with about 400 Excel-compatible functions. In Infinite Table you compute values with a column `valueGetter`, or in your data.',
    },
    {
      q: 'Does Handsontable support row grouping and pivoting?',
      a: "Handsontable's docs don't describe grouping rows by column value or pivoting. Its NestedRows plugin shows parent and child rows from nested data. Infinite Table has row grouping, aggregations and pivoting built in.",
    },
    {
      q: 'Is Infinite Table good for spreadsheet-style editing?',
      a: 'It has inline editing, [Excel-like editing](/docs/learn/editing/excel-like-editing) (start typing to edit) and cell selection, but no fill handle, formulas, undo and redo, or clipboard paste. For a spreadsheet experience, Handsontable is the better fit.',
    },
  ],
  demo: {
    title: 'Editing, then grouping, the same dataset',
    description:
      'Edit cells in both grids, then group and aggregate the same rows in Infinite Table.',
  },
};

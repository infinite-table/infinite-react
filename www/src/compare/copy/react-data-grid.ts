import type { CompareCopy } from '../types';
import { CARS_DATA, CARS_TYPE, INFINITE_CARS } from './shared';

export const reactDataGridCopy: CompareCopy = {
  id: 'react-data-grid',
  metaDescription:
    'Infinite Table vs react-data-grid: features, licensing, bundle size, dependencies and migration, with sources for every claim.',
  tagline:
    'react-data-grid is a small, dependency-free MIT grid that leaves data operations to you. Infinite Table, also dependency-free, has them built in.',
  verdict: [
    "react-data-grid is lean and well made: zero dependencies, row and column virtualization, frozen columns, column groups, row grouping, editing, CSS-variable theming, accessibility and RTL. It shows sort state but leaves sorting, filtering and loading data to your code, and its npm `latest` release is a 7.0 beta (the last stable release is from 2019).",
    'Infinite Table is the same size class in dependencies (**zero**), and adds built-in sorting, filtering, aggregations, pivoting, tree data, master-detail, lazy loading, cell selection and context menus. It is free to use with a footer.',
  ],
  chooseThem: [
    'You want the smallest bundle and do your own data processing.',
    'You want an MIT license with no footer.',
    'You need documented accessibility or right-to-left layouts.',
  ],
  chooseInfinite: [
    'You want sorting, filtering and aggregations done for you, on the client or the server.',
    'You need pivoting, tree data, master-detail or lazy loading.',
    'You want a stable release line.',
  ],
  migration: {
    intro:
      'react-data-grid reports sort changes and expects you to sort the rows; Infinite Table sorts for you.',
    from: {
      label: 'react-data-grid',
      code: `
import { useMemo, useState } from 'react';
import { DataGrid } from 'react-data-grid';
import type { Column, SortColumn } from 'react-data-grid';
import 'react-data-grid/lib/styles.css';

${CARS_TYPE}

${CARS_DATA}

const columns: Column<Car>[] = [
  { key: 'make', name: 'Make', sortable: true },
  { key: 'model', name: 'Model', width: 200, sortable: true },
  { key: 'price', name: 'Price', renderCell: ({ row }) => <b>{row.price}</b> },
];

export function Cars() {
  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([
    { columnKey: 'make', direction: 'ASC' },
  ]);

  // the grid shows the sort state; sorting the rows is up to you
  const rows = useMemo(() => {
    const [sort] = sortColumns;
    if (!sort) return data;
    const key = sort.columnKey as keyof Car;
    const sorted = [...data].sort((a, b) =>
      String(a[key]).localeCompare(String(b[key]), undefined, { numeric: true }),
    );
    return sort.direction === 'DESC' ? sorted.reverse() : sorted;
  }, [sortColumns]);

  return (
    <DataGrid
      columns={columns}
      rows={rows}
      sortColumns={sortColumns}
      onSortColumnsChange={setSortColumns}
      style={{ height: 500 }}
    />
  );
}`,
    },
    to: { label: 'Infinite Table', code: INFINITE_CARS },
    mapping: [
      ['`columns` with `key`', '`columns` (an object keyed by column id) with `field`'],
      ['`name`', '`header`'],
      ['`width`', '`defaultWidth`, or the `columnSizing` prop'],
      ['`renderCell`', '`renderValue` or `render`'],
      ['`sortColumns` + sorting the rows yourself', '`defaultSortInfo`, `sortInfo` on `<DataSource>`'],
      ['`<TreeDataGrid groupBy>`', '`defaultGroupBy`, `groupBy` on `<DataSource>`'],
      ['`frozen`', '`columnPinning`'],
    ],
  },
  faq: [
    {
      q: 'Is react-data-grid stable?',
      a: "Its npm `latest` tag points to a 7.0 beta, and the last stable release, 6.1.0, is from 2019. The project is actively developed on GitHub, and API names still change between betas.",
    },
    {
      q: 'Does react-data-grid sort and filter the rows?',
      a: 'It shows sortable headers and reports the sort state, but sorting the rows is up to you, and filtering is built in app code in its demos. Infinite Table sorts and filters built in.',
    },
  ],
  demo: {
    title: 'Sorting and filtering in both grids',
    description: 'The same rows sorted and filtered in react-data-grid (with app code) and in Infinite Table.',
  },
};

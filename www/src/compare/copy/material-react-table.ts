import type { CompareCopy } from '../types';
import { CARS_DATA, CARS_TYPE, INFINITE_CARS } from './shared';

export const materialReactTableCopy: CompareCopy = {
  id: 'material-react-table',
  metaDescription:
    'Infinite Table vs Material React Table: features, dependencies, bundle size, licensing and migration, with sources for every claim.',
  tagline:
    'Material React Table is a ready-made Material UI table on top of TanStack Table. Infinite Table is a design-system-agnostic grid with zero dependencies.',
  verdict: [
    'Material React Table (MRT) puts a complete Material UI interface on TanStack Table: column menus, many filter types, grouping with aggregation, tree rows, detail panels, editing modes, pinning and optional virtualization, all MIT-licensed. It needs Material UI, Emotion and MUI date pickers, and its latest stable release is from March 2025.',
    'Infinite Table has those features too, plus pivoting, lazy loading from a server and cell selection, with **zero runtime dependencies** and no design system attached. It is free to use with a footer.',
  ],
  chooseThem: [
    'Your app uses Material UI and you want a table that looks native.',
    'You want an MIT license with no footer.',
    'You already know TanStack Table.',
  ],
  chooseInfinite: [
    "Your app doesn't use Material UI.",
    'You need pivoting, lazy loading or cell selection.',
    'Dependency count and bundle size matter to you.',
    'You use Vue as well as React.',
  ],
  migration: {
    intro:
      'MRT column definitions follow TanStack Table (`accessorKey`, `header`, `Cell`); Infinite Table uses a `columns` object with `field`.',
    from: {
      label: 'Material React Table',
      code: `
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table';
import type { MRT_ColumnDef } from 'material-react-table';

${CARS_TYPE}

${CARS_DATA}

const columns: MRT_ColumnDef<Car>[] = [
  { accessorKey: 'make', header: 'Make' },
  { accessorKey: 'model', header: 'Model', size: 200 },
  {
    accessorKey: 'price',
    header: 'Price',
    Cell: ({ cell }) => <b>{cell.getValue<number>()}</b>,
  },
];

export function Cars() {
  const table = useMaterialReactTable({
    columns,
    data,
    getRowId: (row) => String(row.id),
    initialState: { sorting: [{ id: 'make', desc: false }] },
  });
  return <MaterialReactTable table={table} />;
}`,
    },
    to: { label: 'Infinite Table', code: INFINITE_CARS },
    mapping: [
      ['`accessorKey`', '`field`'],
      ['`header`', '`header`'],
      ['`size`', '`defaultWidth`, or the `columnSizing` prop'],
      ['`Cell`', '`renderValue` or `render`'],
      ['`getRowId`', '`primaryKey` on `<DataSource>`'],
      ['`initialState.sorting`', '`defaultSortInfo`, `sortInfo` on `<DataSource>`'],
      ['`enableGrouping`, `grouping` state', '`defaultGroupBy`, `groupBy` on `<DataSource>`'],
      ['`renderDetailPanel`', '`rowDetailRenderer`'],
      ['`manualSorting`... + your fetch', 'a `data` function on `<DataSource>`, with `lazyLoad`'],
    ],
  },
  faq: [
    {
      q: 'Do I need Material UI for Material React Table?',
      a: 'Yes. Material UI, Emotion, MUI icons and MUI date pickers are required peer dependencies. Infinite Table has no dependencies.',
    },
    {
      q: 'Does Material React Table support pivoting?',
      a: 'No pivoting feature is documented. It has grouping with aggregation, inherited from TanStack Table. Infinite Table has built-in pivoting.',
    },
  ],
  demo: {
    title: 'Grouping and detail rows in both tables',
    description: 'The same rows grouped, with detail panels, in Material React Table and Infinite Table.',
  },
};

import type { CompareCopy } from '../types';
import { CARS_DATA, CARS_TYPE, INFINITE_CARS } from './shared';

export const mantineReactTableCopy: CompareCopy = {
  id: 'mantine-react-table',
  metaDescription:
    'Infinite Table vs Mantine React Table: features, Mantine version support, dependencies, bundle size and migration, with sources for every claim.',
  tagline:
    'Mantine React Table is a ready-made Mantine table on top of TanStack Table. Infinite Table is a design-system-agnostic grid with zero dependencies.',
  verdict: [
    'Mantine React Table (MRT) gives Mantine apps a complete table on TanStack Table: column menus, filters, grouping with aggregation, tree rows, detail panels, editing modes and optional virtualization, all MIT-licensed. Its stable release (V1) targets Mantine 6; V2, for Mantine 7, has been in beta since February 2025, and neither supports Mantine 8 or 9.',
    'Infinite Table has those features too, plus pivoting, lazy loading, cell selection, keyboard navigation and a context menu, with **zero runtime dependencies** and no design system attached. It is free to use with a footer.',
  ],
  chooseThem: [
    'Your app uses a Mantine version MRT supports, and you want a native-looking table.',
    'You want an MIT license with no footer.',
    'You already know TanStack Table or Material React Table.',
  ],
  chooseInfinite: [
    "You're on Mantine 8 or 9, or don't use Mantine.",
    'You need pivoting, lazy loading, cell selection or keyboard navigation.',
    'Dependency count and bundle size matter to you.',
  ],
  migration: {
    intro:
      'MRT column definitions follow TanStack Table (`accessorKey`, `header`, `Cell`); Infinite Table uses a `columns` object with `field`.',
    from: {
      label: 'Mantine React Table',
      code: `
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table';
import type { MRT_ColumnDef } from 'mantine-react-table';

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
  const table = useMantineReactTable({
    columns,
    data,
    getRowId: (row) => String(row.id),
    initialState: { sorting: [{ id: 'make', desc: false }] },
  });
  return <MantineReactTable table={table} />;
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
    ],
  },
  faq: [
    {
      q: 'Which Mantine versions does Mantine React Table support?',
      a: "MRT V1 (the npm `latest` release) needs Mantine 6, and the V2 beta needs Mantine 7. Neither peer range includes Mantine 8 or 9. Infinite Table doesn't depend on a design system.",
    },
    {
      q: 'Does Mantine React Table support pivoting?',
      a: 'No pivoting feature is documented. It has grouping with aggregation, inherited from TanStack Table. Infinite Table has built-in pivoting.',
    },
  ],
  demo: {
    title: 'Grouping and detail rows in both tables',
    description: 'The same rows grouped, with detail panels, in Mantine React Table and Infinite Table.',
  },
};

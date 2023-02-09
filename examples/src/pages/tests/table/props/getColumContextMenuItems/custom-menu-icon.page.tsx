import {
  InfiniteTable,
  DataSource,
  InfiniteTablePropGetColumnMenuItems,
} from '@infinite-table/infinite-react';
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';
import * as React from 'react';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const dataSource = () => {
  return fetch(process.env.NEXT_PUBLIC_BASE_URL + '/developers1k')
    .then((r) => r.json())
    .then((data: Developer[]) => data);
};

const columns: InfiniteTablePropColumns<Developer> = {
  currency: {
    field: 'currency',
    components: {
      MenuIcon: () => <div>🌕</div>,
    },
  },
  salary: {
    field: 'salary',
  },
  country: {
    field: 'country',
  },
  preferredLanguage: {
    field: 'preferredLanguage',
    defaultWidth: 350,
    header: ({ columnApi, insideColumnMenu }) => {
      if (insideColumnMenu) {
        return 'Preferred Language';
      }
      return (
        <>
          Preferred Language{' '}
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => {
              e.stopPropagation();
              columnApi.toggleContextMenu(e.target);
            }}
            style={{ border: '1px solid magenta', margin: 2 }}
          >
            Toggle menu
          </button>
        </>
      );
    },
    renderMenuIcon: () => <div>🌎</div>,
  },
  id: { field: 'id', defaultWidth: 80, renderMenuIcon: false },
  firstName: {
    field: 'firstName',
    renderMenuIcon: false,
  },
};

const getColumMenuItems: InfiniteTablePropGetColumnMenuItems<Developer> = (
  items,
  { column },
) => {
  items.push({
    key: 'hello',
    label: 'Hello World',
    onAction: () => {
      alert('Hello World from column ' + column.id);
    },
  });
  return items;
};

export default function ColumnContextMenuItems() {
  return (
    <>
      <DataSource<Developer> primaryKey="id" data={dataSource}>
        <InfiniteTable<Developer>
          domProps={{
            style: {
              height: '80vh',
            },
          }}
          columnHeaderHeight={70}
          columns={columns}
          getContextMenuItems={getColumMenuItems}
        />
      </DataSource>
    </>
  );
}

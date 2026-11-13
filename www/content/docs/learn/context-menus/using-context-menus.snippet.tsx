// Snippets shown on using-context-menus.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSource,
  InfiniteTable,
  type InfiniteTablePropColumns,
  type InfiniteTablePropGetCellContextMenuItems,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  age: number;
  currency: string;
};

declare const data: Developer[];
declare const columns: InfiniteTablePropColumns<Developer>;

export function CellContextMenu() {
  //#region intro
  const getCellContextMenuItems: InfiniteTablePropGetCellContextMenuItems<Developer> = ({ column, value }) => {
    if (column.id === 'currency') {
      return [
        {
          label: `Convert ${value}`,
          key: 'currency-convert',
        },
      ];
    }

    if (column.id === 'age') {
      return null;
    }

    return [
      {
        label: `Welcome ${value}`,
        key: 'hi',
      },
    ];
  };

  <DataSource<Developer> data={data} primaryKey="id">
    <InfiniteTable<Developer>
      getCellContextMenuItems={getCellContextMenuItems}
      columns={columns}
    />
  </DataSource>;
  //#endregion
  return null;
}

export function contextMenuWithColumns() {
  //#region columns-and-items
  const getCellContextMenuItems = () => {
    return {
      columns: [{ name: 'label' }, { name: 'icon' }],
      items: [
        {
          label: 'Welcome',
          icon: '👋',
          key: 'hi',
          onAction: () => {
            // do something
          },
          hideMenuOnAction: true,
        },
        {
          label: 'Convert',
          icon: '🔁',
          key: 'convert',
        },
      ],
    };
  };
  //#endregion
  // declared without a type on the page, so check it here
  const checked: InfiniteTablePropGetCellContextMenuItems<Developer> =
    getCellContextMenuItems;
  return checked;
}

export function hidingTheContextMenu() {
  //#region hiding-the-context-menu
  const getCellContextMenuItems: InfiniteTablePropGetCellContextMenuItems<Developer> = () => {
    return {
      columns: [{ name: 'label' }],
      items: [
        {
          label: 'Hello',
          key: 'hi',
          onAction: ({ key, hideMenu }) => {
            // do something
            console.log('Hello');

            // hide the menu
            hideMenu(); // #highlight
          },
        },
      ],
    };
  };
  //#endregion
  return getCellContextMenuItems;
}

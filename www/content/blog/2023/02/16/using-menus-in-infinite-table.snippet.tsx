// Snippets shown on using-menus-in-infinite-table.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSource,
  InfiniteTable,
  type InfiniteTablePropColumns,
  type InfiniteTablePropGetCellContextMenuItems,
  type InfiniteTablePropGetColumnMenuItems,
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
  //#region configuring-a-context-menu
  const getCellContextMenuItems: InfiniteTablePropGetCellContextMenuItems<Developer> = ({ column, data, value }) => {
    if (column.id === 'currency') {
      return [
        {
          label: `Convert ${value}`,
          key: 'currency-convert',
          onAction: ({ key, item }) => {
            alert('clicked ' + item.key);
          },
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
  //#region configuring-the-context-menu-to-have-multiple
  const getCellContextMenuItems = () => {
    return {
      columns: [{ name: 'label' }, { name: 'icon' }],
      items: [
        {
          label: 'Welcome',
          icon: '👋',
          key: 'hi',
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

export function customColumnMenu() {
  //#region customizing-column-menu
  const getColumnMenuItems: InfiniteTablePropGetColumnMenuItems<Developer> = (items, { column }) => {
    if (column.id === 'firstName') {
      // you can adjust the default items for a specific column
      items.splice(0, 0, {
        key: 'firstName',
        label: 'First name menu item',
        onClick: () => {
          console.log('Hey there!');
        },
      });
    }

    // or for all columns
    items.push({
      key: 'hello',
      label: 'Hello World',
      onClick: () => {
        alert('Hello World from column ' + column.id);
      },
    });
    return items;
  };
  //#endregion
  return getColumnMenuItems;
}

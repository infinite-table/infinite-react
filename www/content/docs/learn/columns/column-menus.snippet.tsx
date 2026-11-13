// Snippets shown on column-menus.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import type {
  InfiniteTableColumn,
  InfiniteTablePropGetColumnMenuItems,
} from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  salary: number;
};

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

export function menuItemsWithSubmenus() {
  //#region menu-items-with-submenus
  const getColumnMenuItems: InfiniteTablePropGetColumnMenuItems<Developer> = (defaultItems, { column }) => {
    const items = [
      {
        key: 'translate',
        label: 'Translate',
        menu: {
          items: [
            { // #highlight
              key: 'translateToEnglish',
              label: 'English',
              onAction: () => {
                console.log('Translate to English');
              },
            },
            {
              key: 'translateToFrench',
              label: 'French',
              onAction: () => {
                console.log('Translate to French');
              },
            },
          ],
        },
      },
    ];

    return items;
  };
  //#endregion
  return getColumnMenuItems;
}

export function customMenuIcon() {
  //#region custom-menu-icon
  const columns = {
    name: {
      field: 'firstName',
      renderMenuIcon: () => <div>🌎</div>,
    },
    salary: {
      field: 'salary',
      renderMenuIcon: false,
    },
  };
  //#endregion

  // the snippet has no type annotation, so check it against the column type here
  // (without `field`, which is just a `string` in an object that has no annotation)
  const checked: Record<string, Omit<InfiniteTableColumn<Developer>, 'field'>> = columns;
  return checked;
}

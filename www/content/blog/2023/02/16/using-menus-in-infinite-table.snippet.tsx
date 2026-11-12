// Snippets shown on using-menus-in-infinite-table.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  InfiniteTable,
} from '@infinite-table/infinite-react';

{
  //#region configuring-a-context-menu
  const getCellContextMenuItems = ({ column, data, value }) => {
    if (column.id === 'currency') {
      return [
        {
          label: `Convert ${value}`,
          key: 'currency-convert',
          onAction: (key, item) => {
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
}

{
  //#region configuring-the-context-menu-to-have-multiple
  const getCellContextMenuItems = () => {
    return {
      columns: [{ name: 'label' }, { name: 'lcon' }],
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
}

{
  //#region customizing-column-menu
  function getColumnMenuItems(items, { column }) {
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
  }
  //#endregion
}

export {};

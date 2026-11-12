// Snippets shown on using-context-menus.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  DataSource,
  InfiniteTable,
} from '@infinite-table/infinite-react';

{
  //#region intro
  const getCellContextMenuItems = ({ column, value }) => {
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
}

{
  //#region intro-2
  const getCellContextMenuItems = () => {
    return {
      columns: [{ name: 'label' }, { name: 'lcon' }],
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
}

{
  //#region hiding-the-context-menu
  const getCellContextMenuItems = () => {
    return {
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
}

export {};

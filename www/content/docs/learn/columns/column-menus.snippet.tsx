// Snippets shown on column-menus.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).

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

{
  //#region menu-items-with-submenus
  function getColumnMenuItems(items, { column }) {
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
  }
  //#endregion
}

{
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
}

export {};

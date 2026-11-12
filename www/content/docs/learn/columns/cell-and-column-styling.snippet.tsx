// Snippets shown on cell-and-column-styling.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).

{
  //#region styling-a-column-in-the-datagrid
  const column = {
    firstName: {
      style: {
        color: 'red',
        fontWeight: 'bold',
      },
    },
  };
  //#endregion
}

{
  //#region styling-a-column-using-a-style-function
  const columns = {
    salary: {
      field: 'salary',
      type: 'number',
      style: ({ value, data, column, rowInfo }) => {
        return { // #highlight
          color: value && value > 100_000 ? 'red' : 'tomato',
        };
      },
    },
  };
  //#endregion
}

{
  //#region styling-a-column-using-column-classname
  const columns = {
    firstName: {
      className: 'first-name-column',
    },
  };
  //#endregion
}

{
  //#region styling-a-column-using-a-classname-function
  const columns = {
    salary: {
      field: 'salary',
      type: 'number',
      className: ({ value, data, column, rowInfo }) => {
        return value && value > 100_000 ? 'red-color' : 'tomato-color', // #highlight
      },
    },
  }
  //#endregion
}

export {};

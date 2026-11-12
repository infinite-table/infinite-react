// Snippets shown on overview.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).

{
  //#region customize-edit-value-when-editing-starts
  const columns = {
    salary: {
      field: 'salary',
      // this can return a Promise
      getValueToEdit: ({ value, data, rowInfo, column }) => {
        // suppose the value is a string like '$1000'
        // but we want to start editing with the number 1000
        return value.replace('$', '');
      },
    },
  };
  //#endregion
}

export {};

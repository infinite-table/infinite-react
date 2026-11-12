// Snippets shown on handling-dates.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).

{
  //#region using-date-strings
  const sortTypes = {
    mydatestring: (a: string, b: string) => {
      // use your preferred date parsing library
      // to turn a string into date and then compare the two values
      return new Date(a).getTime() - new Date(b).getTime();
    },
  };
  //#endregion
}

export {};

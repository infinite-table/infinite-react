// Snippets shown on using-row-info.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).

{
  //#region discriminator
  rowInfo.dataSourceHasGrouping === false;
  //#endregion
}

{
  //#region discriminator-2
  rowInfo.dataSourceHasGrouping === true && rowInfo.isGroupRow === false;
  //#endregion
}

{
  //#region discriminator-3
  rowInfo.dataSourceHasGrouping === true && rowInfo.isGroupRow === true;
  //#endregion
}

export {};

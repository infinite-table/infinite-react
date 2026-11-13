// Snippets shown on using-row-info.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import type { InfiniteTableRowInfo } from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
};

export function discriminators(rowInfo: InfiniteTableRowInfo<Developer>) {
  //#region discriminator
  rowInfo.dataSourceHasGrouping === false;
  //#endregion

  //#region discriminator-normal-row-when-grouping
  rowInfo.dataSourceHasGrouping === true && rowInfo.isGroupRow === false;
  //#endregion

  //#region discriminator-group-row
  rowInfo.dataSourceHasGrouping === true && rowInfo.isGroupRow === true;
  //#endregion
}

// Snippets shown on lazy-loading.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import type { DataSourceRemoteData } from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
};

// what the Promise returned by the `data` function resolves to
export const response: DataSourceRemoteData<Developer> =
  //#region intro
  {
    data: [ /* ... */ ],
    totalCount: 10000
  }
  //#endregion
;

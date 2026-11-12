// Snippets shown on how-do-i-flash-cells.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  salary: number;
};

//#region configuring-a-flashing-column

import { FlashingColumnCell } from '@infinite-table/infinite-react';

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
  },
  salary: {
    field: 'salary',
    components: {
      ColumnCell: FlashingColumnCell, // #highlight
    }
  },
};
//#endregion

export {};

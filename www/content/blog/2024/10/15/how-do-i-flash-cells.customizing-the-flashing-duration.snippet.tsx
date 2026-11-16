// Snippets shown on how-do-i-flash-cells.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';

type Developer = {
  id: number;
  firstName: string;
  salary: number;
};

//#region customizing-the-flashing-duration

import { createFlashingColumnCellComponent } from '@infinite-table/infinite-react';

const FlashingColumnCell = createFlashingColumnCellComponent({
  flashDuration: 500,
  flashClassName: 'my-flash-class',
});

const columns: InfiniteTablePropColumns<Developer> = {
  salary: {
    field: 'salary',
    components: {
      ColumnCell: FlashingColumnCell,
    }
  }
}
//#endregion

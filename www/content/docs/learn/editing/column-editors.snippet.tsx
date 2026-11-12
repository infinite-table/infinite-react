// Snippets shown on column-editors.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-react';

{
  //#region intro
  const columns: InfiniteTablePropColumns<Developer> = {
    canDesign: {
      field: 'canDesign',
      defaultEditable: true,
      components: {
        // don't forget to provide an implementation
        // for the BoolEditor component
        Editor: BoolEditor,
      },
    },
    id: {
      field: 'id',
    },
  };
  //#endregion
}

export {};

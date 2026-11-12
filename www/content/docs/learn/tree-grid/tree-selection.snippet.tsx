// Snippets shown on tree-selection.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).

//#region example-of-tree-selection-value-with-default
import type { TreeSelectionValue } from '@infinite-table/infinite-react';

// Default selection is false, with some selected node paths: ['1'] and ['2', '20']
// however, node ['1', '10'] is deselected
const treeSelectioDefaultDeselected: TreeSelectionValue = {
  defaultSelection: false,
  selectedPaths: [['1'], ['2', '20']],
  deselectedPaths: [['1', '10']],
};
//#endregion

{
  //#region example-of-tree-selection-value-with-default-2
  // Default selection is true, with some deselected node paths: ['2'] and ['3']
  // however, inside ['3'], we have a selected node ['3','30','301']
  const treeSelectionDefaultSelected: TreeSelectionValue = {
    defaultSelection: true,
    deselectedPaths: [['2'], ['3']],
    selectedPaths: [['3','30','301']],
  };
  //#endregion
}

{
  //#region tree-selection-value-to-show-all-nodes-as
  {
    defaultSelection: true,
    deselectedPaths: [],
  }
  //#endregion
}

{
  //#region all-nodes-as-deselected
  {
    defaultSelection: false,
    selectedPaths: [],
  }
  //#endregion
}

export {};

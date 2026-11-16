// Code shown on the Vue version of tree-selection.page.md: the sibling of
// tree-selection.snippet.tsx, with the same `#region` names.
// Type-checked with vue-tsc against the current source.
//
// The regions that are the same code in React and Vue are shown from the .tsx
// file (the fences marked `neutral` in the page).

//#region example-of-tree-selection-value-with-default
import type { TreeSelectionValue } from '@infinite-table/infinite-vue';

// Default selection is false, with some selected node paths: ['1'] and ['2', '20']
// however, node ['1', '10'] is deselected
const treeSelectioDefaultDeselected: TreeSelectionValue = {
  defaultSelection: false,
  selectedPaths: [['1'], ['2', '20']],
  deselectedPaths: [['1', '10']],
};
//#endregion

export { treeSelectioDefaultDeselected };

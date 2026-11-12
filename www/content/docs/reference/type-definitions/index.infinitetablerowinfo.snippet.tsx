// Snippets shown on index.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  InfiniteTable_HasGrouping_RowInfoGroup,
  InfiniteTable_HasGrouping_RowInfoNormal,
  InfiniteTable_Tree_RowInfoLeafNode,
  InfiniteTable_Tree_RowInfoParentNode,
} from '@infinite-table/infinite-react';

//#region infinitetablerowinfo

export type InfiniteTableRowInfo<T> =
  // dataSourceHasGrouping = false, isGroupRow = false
  | InfiniteTable_NoGrouping_RowInfoNormal<T>;

  // dataSourceHasGrouping = true, isGroupRow = false
  | InfiniteTable_HasGrouping_RowInfoNormal<T>

   // dataSourceHasGrouping = true, isGroupRow = true
  | InfiniteTable_HasGrouping_RowInfoGroup<T>

  // tree scenarios - leaf node
  | InfiniteTable_Tree_RowInfoLeafNode<T>

  // tree scenarios - parent node
  | InfiniteTable_Tree_RowInfoParentNode<T>;
//#endregion

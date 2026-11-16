// The shape of `InfiniteTableRowInfo`, as shown on the "Type Definitions" page.
// It re-declares the library type under the same name, so it lives in a file of
// its own. Type-checked with the rest of the docs against the current source.
import type {
  InfiniteTableRowInfo as LibraryInfiniteTableRowInfo,
  InfiniteTable_HasGrouping_RowInfoGroup,
  InfiniteTable_HasGrouping_RowInfoNormal,
  InfiniteTable_Tree_RowInfoLeafNode,
  InfiniteTable_Tree_RowInfoParentNode,
} from '@infinite-table/infinite-react';

// `InfiniteTable_NoGrouping_RowInfoNormal` is documented on the page, but the
// package does not export it (the other four members are exported). Until it
// does, it is picked out of the exported union by its discriminants.
type InfiniteTable_NoGrouping_RowInfoNormal<T> = Extract<
  LibraryInfiniteTableRowInfo<T>,
  { dataSourceHasGrouping: false; isTreeNode: false }
>;

//#region infinitetablerowinfo

export type InfiniteTableRowInfo<T> =
  // dataSourceHasGrouping = false, isGroupRow = false
  | InfiniteTable_NoGrouping_RowInfoNormal<T>

  // dataSourceHasGrouping = true, isGroupRow = false
  | InfiniteTable_HasGrouping_RowInfoNormal<T>

   // dataSourceHasGrouping = true, isGroupRow = true
  | InfiniteTable_HasGrouping_RowInfoGroup<T>

  // tree scenarios - leaf node
  | InfiniteTable_Tree_RowInfoLeafNode<T>

  // tree scenarios - parent node
  | InfiniteTable_Tree_RowInfoParentNode<T>;
//#endregion

// Keeps the shape above honest: it has to stay interchangeable with the type
// the library exports. A member added to (or removed from) the real union
// makes one of these two assignments fail.
type Developer = { id: number; firstName: string };

export function shownShapeMatchesTheLibrary(
  fromLibrary: LibraryInfiniteTableRowInfo<Developer>,
  asShown: InfiniteTableRowInfo<Developer>,
) {
  const shown: InfiniteTableRowInfo<Developer> = fromLibrary;
  const library: LibraryInfiniteTableRowInfo<Developer> = asShown;
  return [shown, library];
}

// the member that is not exported is a plain row: no grouping, no tree
export function noGroupingRowInfo(
  rowInfo: InfiniteTable_NoGrouping_RowInfoNormal<Developer>,
) {
  const dataSourceHasGrouping: false = rowInfo.dataSourceHasGrouping;
  const isGroupRow: false = rowInfo.isGroupRow;
  const data: Developer = rowInfo.data;
  return [dataSourceHasGrouping, isGroupRow, data];
}

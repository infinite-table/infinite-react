import { getCellContext } from '../components/InfiniteTableRow/columnRendering';
import type { InfiniteTableState } from '../types';
import type { InfiniteTableContextValue } from '../types/InfiniteTableContextValue';

export type EditingCell<T> = NonNullable<InfiniteTableState<T>['editingCell']>;

export type EditingCellContextParams<T> = Omit<
  InfiniteTableContextValue<T>,
  'state' | 'computed'
>;

/**
 * Resolves the row of an edit: by primary key when the edit recorded one,
 * falling back to the recorded index. Returns -1 when the row is no longer
 * in the data array.
 *
 * Edits are persisted asynchronously and their callbacks run after the data
 * has changed, so the recorded index can be stale: the edit may have moved
 * the row (its group sorts differently, or its single-row group collapsed)
 * or removed it (filtered out, deleted).
 */
export function resolveEditingCellRowIndex<T>(
  context: EditingCellContextParams<T>,
  editingCell: EditingCell<T>,
): number {
  const { rowIndex, primaryKey } = editingCell;
  const { dataArray } = context.getDataSourceState();

  if (primaryKey !== undefined) {
    const indexByKey = context.dataSourceApi.getIndexByPrimaryKey(primaryKey);

    if (indexByKey !== -1) {
      return indexByKey;
    }
    if (dataArray[rowIndex]?.id !== primaryKey) {
      return -1;
    }
  }

  return dataArray[rowIndex] ? rowIndex : -1;
}

/**
 * Cell context for an edit lifecycle callback, or `null` when the edited
 * row is no longer in the data array. See {@link resolveEditingCellRowIndex}.
 */
export function getEditingCellContext<T>(
  context: EditingCellContextParams<T>,
  editingCell: EditingCell<T>,
) {
  const rowIndex = resolveEditingCellRowIndex(context, editingCell);

  if (rowIndex === -1) {
    return null;
  }

  return getCellContext<T>({
    ...context,
    rowIndex,
    columnId: editingCell.columnId,
  });
}

export function warnEditedRowGone(
  callbackName: string,
  editingCell: EditingCell<any>,
) {
  console.warn(
    `Skipping "${callbackName}": the edited row (primaryKey: ${String(
      editingCell.primaryKey,
    )}, rowIndex: ${editingCell.rowIndex}) is no longer in the data array.`,
  );
}

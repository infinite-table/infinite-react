import { computeResize, FlexComputeResizeResult } from '../../../../flexbox';
import type {
  InfiniteTableComputedColumn,
  InfiniteTablePropColumnSizing,
} from '../../../types';

export type ColumnResizeContext<T> = {
  getState: () => {
    columnSizing: InfiniteTablePropColumnSizing;
    viewportReservedWidth?: number;
    bodySize: { width: number };
  };
  getComputed: () => {
    computedVisibleColumns: InfiniteTableComputedColumn<T>[];
  };
};

/**
 * Framework-neutral column resize computation, extracted from the React
 * useColumnResizeHandle hook - computes the new columnSizing map for a drag
 * diff on the resize handle after the given column.
 */
export function computeColumnResizeForDiff<T>(options: {
  context: ColumnResizeContext<T>;
  column: InfiniteTableComputedColumn<T>;
  diff: number;
  shareSpaceOnResize: boolean;
}): FlexComputeResizeResult {
  const { context, column, diff, shareSpaceOnResize } = options;

  const state = context.getState();
  const { columnSizing, viewportReservedWidth, bodySize } = state;

  const columns = context.getComputed().computedVisibleColumns;

  let atLeastOneFlex = false;

  const columnSizingWithFlex = columns.reduce((acc, col) => {
    if (col.computedFlex) {
      acc[col.id] = { ...columnSizing[col.id], flex: col.computedWidth }; // we explicitly need to have here `{ flex: col.computedWidth }` and not `{ flex: col.computedFlex }`
      // this is to make the test #advancedcolumnresizing work

      atLeastOneFlex = true;
    }
    return acc;
  }, {} as InfiniteTablePropColumnSizing);

  const columnSizingForResize = atLeastOneFlex
    ? {
        // #advancedcolumnresizing-important
        // yep, this order is correct - first apply current columnSizing from state
        ...columnSizing,

        // and then for flex columns, we override with actual computed widths from above
        ...columnSizingWithFlex,
      }
    : columnSizing;

  return computeResize({
    shareSpaceOnResize,
    availableSize: bodySize.width,
    reservedWidth: viewportReservedWidth || 0,
    dragHandleOffset: diff,
    dragHandlePositionAfter: column.computedVisibleIndex,
    columnSizing: columnSizingForResize,
    items: columns.map((c) => {
      return {
        id: c.id,
        computedFlex: c.computedFlex,
        computedWidth: c.computedWidth,
        computedMinWidth: c.computedMinWidth,
        computedMaxWidth: c.computedMaxWidth,
      };
    }),
  });
}

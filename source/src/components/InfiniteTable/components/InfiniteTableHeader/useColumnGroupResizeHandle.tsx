import * as React from 'react';
import { useCallback } from 'react';
import { computeGroupResize } from '../../../flexbox';
import { MatrixBrain } from '../../../VirtualBrain/MatrixBrain';
import {
  InfiniteTableComputedColumn,
  InfiniteTablePropColumnSizing,
} from '../../types';
import { InfiniteTableComputedColumnGroup } from '../../types/InfiniteTableProps';

import { GroupResizeHandle } from './ResizeHandle/GroupResizeHandle';
import { useInfiniteTableSelector } from '../../hooks/useInfiniteTableSelector';

export function useColumnGroupResizeHandle<T>(
  groupColumns: InfiniteTableComputedColumn<T>[],
  config: {
    bodyBrain: MatrixBrain;
    groupHeight: number;
    columnGroup: InfiniteTableComputedColumnGroup;
    columnGroupsMaxDepth: number;
  },
) {
  const { bodyBrain, groupHeight, columnGroup, columnGroupsMaxDepth } = config;
  const { computedVisibleColumns, getState, getComputed, actions } =
    useInfiniteTableSelector((ctx) => {
      return {
        computedVisibleColumns: ctx.computed
          .computedVisibleColumns as InfiniteTableComputedColumn<T>[],
        getState: ctx.getState,
        getComputed: ctx.getComputed,
        actions: ctx.actions,
      };
    });

  const lastColumnInGroup = groupColumns[groupColumns.length - 1];

  const computeResizeForDiff = useCallback(
    (diff: number) => {
      const state = getState();
      const { columnSizing, viewportReservedWidth, bodySize } = state;

      const columns = getComputed().computedVisibleColumns;

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

      const result = computeGroupResize({
        availableSize: bodySize.width,
        reservedWidth: viewportReservedWidth || 0,
        dragHandleOffset: diff,
        dragHandlePositionAfter: lastColumnInGroup.computedVisibleIndex,
        columnSizing: columnSizingForResize,
        columnGroupSize: groupColumns.length,
        items: columns.map((c) => {
          return {
            id: c.id,
            resizable: c.computedResizable,
            computedFlex: c.computedFlex,
            computedWidth: c.computedWidth,
            computedMinWidth: c.computedMinWidth,
            computedMaxWidth: c.computedMaxWidth,
          };
        }),
      });

      return result;
    },
    [lastColumnInGroup],
  );

  const onColumnResize = useCallback(
    (diff: number) => {
      const { columnSizing, reservedWidth } = computeResizeForDiff(diff);

      actions.viewportReservedWidth = reservedWidth;

      actions.columnSizing = columnSizing;
    },
    [computeResizeForDiff],
  );

  const groupResizable = groupColumns.some((c) => c.computedResizable);
  const resizeHandle = groupResizable ? (
    <GroupResizeHandle
      brain={bodyBrain}
      style={{
        // height: groupHeight * (columnGroupsMaxDepth - columnGroup.depth + 2),
        height: groupHeight * (columnGroupsMaxDepth - columnGroup.depth + 2),
      }}
      columns={computedVisibleColumns}
      groupColumns={groupColumns}
      computeResize={computeResizeForDiff}
      onResize={onColumnResize}
    />
  ) : null;

  return resizeHandle;
}

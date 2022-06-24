import * as React from 'react';
import { useCallback } from 'react';
import { computeGroupResize } from '../../../flexbox';
import { MatrixBrain } from '../../../VirtualBrain/MatrixBrain';
import { useInfiniteTable } from '../../hooks/useInfiniteTable';
import {
  InfiniteTableComputedColumn,
  InfiniteTablePropColumnSizing,
} from '../../types';
import { InfiniteTableComputedColumnGroup } from '../../types/InfiniteTableProps';

import { GroupResizeHandle } from './ResizeHandle/GroupResizeHandle';

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
  const {
    computed: { computedVisibleColumns },
    getState,
    getComputed,
    componentActions,
  } = useInfiniteTable<T>();

  const lastColumnInGroup = groupColumns[groupColumns.length - 1];

  const computeResizeForDiff = useCallback((diff: number) => {
    const state = getState();
    const { columnSizing, viewportReservedWidth, bodySize } = state;

    const columns = getComputed().computedVisibleColumns;

    let atLeastOneFlex = false;

    const columnSizingWithFlex = columns.reduce((acc, col) => {
      if (col.computedFlex) {
        acc[col.id] = { flex: col.computedWidth }; // we explicitly need to have here `{ flex: col.computedWidth }` and not `{ flex: col.computedFlex }`
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
  }, []);

  const onColumnResize = useCallback((diff: number) => {
    const { columnSizing, reservedWidth } = computeResizeForDiff(diff);

    componentActions.viewportReservedWidth = reservedWidth;

    componentActions.columnSizing = columnSizing;
  }, []);

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

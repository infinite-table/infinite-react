import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';

import { join } from '../../../../utils/join';
import { stripVar } from '../../../../utils/stripVar';
import { computeGroupResize } from '../../../flexbox';
import { rootClassName } from '../../internalProps';
import { InternalVars } from '../../internalVars.css';
import { cssEllipsisClassName } from '../../utilities.css';

import type { InfiniteTableComputedColumn } from '../../types';
import type { InfiniteTablePropColumnSizing } from '../../types';
import type { InfiniteTableComputedColumnGroup } from '../../types/InfiniteTableProps';

import { useInfiniteTableContext } from '../../InfiniteTableContextForVue.vue';
import { GroupResizeHandle } from './ResizeHandle/GroupResizeHandleForVue.vue';

import { HeaderGroupCls } from './header.css';

export const TableHeaderGroupClassName = `${rootClassName}HeaderGroup`;

const columnWidthAtIndex = stripVar(InternalVars.columnWidthAtIndex);
const columnZIndexAtIndex = stripVar(InternalVars.columnZIndexAtIndex);

/**
 * Vue sibling of InfiniteTableHeaderGroup - same DOM (data-group-id, widths
 * computed from the column width CSS vars), including the column group
 * resize handle (ports useColumnGroupResizeHandle).
 */
export const InfiniteTableHeaderGroup = defineComponent({
  name: 'InfiniteTableHeaderGroup',
  props: {
    columnGroup: {
      type: Object as PropType<InfiniteTableComputedColumnGroup>,
      required: true,
    },
    columns: {
      type: Array as PropType<InfiniteTableComputedColumn<any>[]>,
      required: true,
    },
    height: { type: Number, required: true },
    width: { type: Number, required: true },
    columnGroupsMaxDepth: { type: Number, required: true },
    horizontalLayoutPageIndex: {
      type: Number as PropType<number | null>,
      default: null,
    },
    domRef: {
      type: Function as PropType<(el: HTMLElement | null) => void>,
      required: true,
    },
  },
  setup(props) {
    const { getState, getComputed, actions } = useInfiniteTableContext();

    const domRefCallback = (el: any) => {
      props.domRef((el as HTMLElement) ?? null);
    };

    // ports computeResizeForDiff from useColumnGroupResizeHandle
    const computeResizeForDiff = (diff: number) => {
      const state = getState();
      const { columnSizing, viewportReservedWidth, bodySize } = state;

      const columns = getComputed().computedVisibleColumns;
      const groupColumns = props.columns;
      const lastColumnInGroup = groupColumns[groupColumns.length - 1];

      let atLeastOneFlex = false;

      const columnSizingWithFlex = columns.reduce((acc, col) => {
        if (col.computedFlex) {
          // we explicitly need `{ flex: col.computedWidth }` and not
          // `{ flex: col.computedFlex }` - see #advancedcolumnresizing
          acc[col.id] = { ...columnSizing[col.id], flex: col.computedWidth };
          atLeastOneFlex = true;
        }
        return acc;
      }, {} as InfiniteTablePropColumnSizing);

      const columnSizingForResize = atLeastOneFlex
        ? {
            // #advancedcolumnresizing-important - this order is correct:
            // first the current columnSizing from state, then for flex
            // columns override with actual computed widths
            ...columnSizing,
            ...columnSizingWithFlex,
          }
        : columnSizing;

      return computeGroupResize({
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
    };

    const onColumnResize = (diff: number) => {
      const { columnSizing, reservedWidth } = computeResizeForDiff(diff);

      actions.viewportReservedWidth = reservedWidth;
      actions.columnSizing = columnSizing;
    };

    return () => {
      const { columnGroup, height, columns, columnGroupsMaxDepth } = props;

      let { header } = columnGroup;
      const { style: userStyle } = columnGroup;

      if (header instanceof Function) {
        header = header({
          columnGroup,
          horizontalLayoutPageIndex: props.horizontalLayoutPageIndex,
        });
      }

      const firstColumn = columns[0];
      const width =
        columns.length > 1
          ? `calc( ` +
            columns
              .map(
                (col) =>
                  `var(${columnWidthAtIndex}-${col.computedVisibleIndex})`,
              )
              .join(' + ') +
            ' )'
          : `var(${columnWidthAtIndex}-${firstColumn.computedVisibleIndex})`;

      // the zIndexes are bigger at groups that are at the top
      // also groups to the left have a higher zIndex
      const zIndex = `calc(var(${columnZIndexAtIndex}-${
        firstColumn.computedVisibleIndex
      }) + ${columnGroupsMaxDepth - columnGroup.depth})`;

      let style =
        typeof userStyle === 'function'
          ? userStyle({
              columnGroup,
              horizontalLayoutPageIndex: props.horizontalLayoutPageIndex,
            })
          : userStyle;
      style = style && typeof style === 'object' ? { ...style } : {};

      (style as Record<string, any>).width = width;
      (style as Record<string, any>).height = `${height}px`;

      const groupResizable = columns.some((c) => c.computedResizable);
      const resizeHandle = groupResizable
        ? h(GroupResizeHandle, {
            brain: getState().brain,
            draggerStyle: {
              height: `${
                height * (columnGroupsMaxDepth - columnGroup.depth + 2)
              }px`,
            },
            columns: getComputed().computedVisibleColumns,
            groupColumns: columns,
            computeResize: computeResizeForDiff,
            onResize: onColumnResize,
          })
        : null;

      return h(
        'div',
        {
          ref: domRefCallback,
          'data-group-id': columnGroup.uniqueGroupId,
          class: join(HeaderGroupCls, TableHeaderGroupClassName),
          style: style as Record<string, any>,
          'data-z-index': zIndex,
        },
        [
          h(
            'div',
            {
              class: join(
                `${TableHeaderGroupClassName}__header-content`,
                cssEllipsisClassName,
              ),
            },
            [header as any],
          ),
          resizeHandle,
        ],
      );
    };
  },
});

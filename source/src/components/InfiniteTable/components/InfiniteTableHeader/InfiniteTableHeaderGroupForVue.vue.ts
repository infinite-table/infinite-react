import { defineComponent, h } from 'vue';
import type { PropType } from 'vue';

import { join } from '../../../../utils/join';
import { stripVar } from '../../../../utils/stripVar';
import { rootClassName } from '../../internalProps';
import { InternalVars } from '../../internalVars.css';
import { cssEllipsisClassName } from '../../utilities.css';

import type { InfiniteTableComputedColumn } from '../../types';
import type { InfiniteTableComputedColumnGroup } from '../../types/InfiniteTableProps';

import { HeaderGroupCls } from './header.css';

export const TableHeaderGroupClassName = `${rootClassName}HeaderGroup`;

const columnWidthAtIndex = stripVar(InternalVars.columnWidthAtIndex);
const columnZIndexAtIndex = stripVar(InternalVars.columnZIndexAtIndex);

/**
 * Vue sibling of InfiniteTableHeaderGroup - same DOM (data-group-id, widths
 * computed from the column width CSS vars). Column group resize handles are
 * deferred (they come with the resizing slice).
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
    const domRefCallback = (el: any) => {
      props.domRef((el as HTMLElement) ?? null);
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
        ],
      );
    };
  },
});

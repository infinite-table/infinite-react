import { h } from 'vue';
import type { VNodeChild } from 'vue';

import type { InfiniteTableColumnCellContextType } from '..';
import type { InfiniteTable_HasGrouping_RowInfoGroup } from '../../../utils/groupAndPivot';
import { join } from '../../../utils/join';
import type { DataSourceGroupBy } from '../../DataSource';
import { showLoadingIcon } from '../../DataSource/state/rowInfoStatus';
import { ExpandCollapseIcon } from '../components/icons/ExpandCollapseIcon/ExpandCollapseIconForVue.vue';
import { LoadingIcon } from '../components/icons/LoadingIcon/LoadingIconForVue.vue';
import { InfiniteTableColumnCellClassName } from '../components/InfiniteTableRow/InfiniteTableColumnCellClassNames';
import { GroupRowExpanderCls } from '../components/InfiniteTableRow/row.css';

import {
  InfiniteTableColumn,
  InfiniteTableGeneratedGroupColumn,
} from '../types/InfiniteTableColumn';
import {
  InfiniteTableGroupColumnGetterOptions,
  InfiniteTablePropGroupColumn,
  InfiniteTablePropGroupRenderStrategy,
} from '../types/InfiniteTableProps';
import {
  alignItems,
  cssEllipsisClassName,
  display,
  flexFlow,
} from '../utilities.css';

import {
  buildColumnForGroupBy,
  buildSingleGroupColumn,
  GroupColumnRenderers,
} from './buildGroupColumn';

export { styleForGroupColumn } from '../components/InfiniteTableRow/columnCellStyling';

/**
 * Vue sibling of getColumnForGroupBy.tsx.
 *
 * The generated column structure comes from the shared buildGroupColumn
 * module - only the render/renderGroupIcon implementations live here, since
 * they produce Vue vnodes (same DOM/classnames as the React JSX versions).
 */
export function getGroupColumnRender<T>({
  groupIndexForColumn,
  groupRenderStrategy,
}: {
  groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
  groupIndexForColumn: number;
}) {
  return (renderOptions: InfiniteTableColumnCellContextType<T>) => {
    const { rowInfo, renderBag, column, align } = renderOptions;

    const { value: valueToRender, groupIcon, selectionCheckBox } = renderBag;

    const groupRowInfo = rowInfo as InfiniteTable_HasGrouping_RowInfoGroup<T>;

    const className = join(
      display.flex,
      column.align === 'end' ? flexFlow.rowReverse : flexFlow.row,
      alignItems.center,
      `${InfiniteTableColumnCellClassName}Expander`,
      groupRenderStrategy === 'single-column' ||
        (groupRenderStrategy === 'multi-column' &&
          (!rowInfo.isGroupRow || selectionCheckBox))
        ? GroupRowExpanderCls({ align })
        : null,
    );

    if (groupRenderStrategy === 'multi-column') {
      if (
        groupIndexForColumn + 1 !== groupRowInfo.groupNesting &&
        groupRowInfo.isGroupRow
      ) {
        return selectionCheckBox
          ? (h('div', { class: className }, [
              selectionCheckBox as VNodeChild,
            ]) as any)
          : null;
      }
    }

    return h('div', { class: className }, [
      groupIcon as VNodeChild,
      selectionCheckBox as VNodeChild,
      h('div', { class: cssEllipsisClassName }, [
        (valueToRender ?? null) as VNodeChild,
      ]),
    ]) as any;
  };
}

export function getGroupColumnRenderGroupIcon<T>({
  groupIndexForColumn,
  groupRenderStrategy,
  toggleGroupRow,
  initialRenderGroupIcon,
}: {
  toggleGroupRow: (groupRowKeys: any[]) => void;
  groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
  groupIndexForColumn: number;

  initialRenderGroupIcon?: InfiniteTableColumn<T>['renderGroupIcon'];
}) {
  return (renderOptions: InfiniteTableColumnCellContextType<T>) => {
    const {
      rowInfo,
      value,
      rootGroupBy: groupBy,
      pivotBy,
      column,
    } = renderOptions;

    // for groupRenderStrategy !== 'inline', we work on group rows
    const groupRowInfo = (
      groupRenderStrategy !== 'inline'
        ? rowInfo
        : // while for inline, we need to still work on group rows, but the current row is a data item
          // so we go find the group row via the parents of enhanced data
          (rowInfo.isGroupRow && rowInfo.parents?.[groupIndexForColumn]) ||
          rowInfo
    ) as InfiniteTable_HasGrouping_RowInfoGroup<T>;

    if (!groupRowInfo) {
      return null;
    }

    const collapsed = groupRowInfo!.collapsed;

    if (groupRenderStrategy === 'inline') {
      if (groupRowInfo.groupCount === 1) {
        return value;
      }

      if (groupRowInfo.groupNesting === groupIndexForColumn && collapsed) {
        return null;
      }
    } else {
      if (!groupRowInfo.isGroupRow) {
        return null;
      }

      if (groupRenderStrategy === 'multi-column') {
        if (groupIndexForColumn + 1 !== groupRowInfo.groupNesting) {
          return null;
        }
      }
    }

    const groupKeys = groupRowInfo!.groupKeys!;

    let icon: VNodeChild = null;

    const showExpanderIcon = pivotBy
      ? (groupRowInfo.groupKeys?.length || 0) < groupBy?.length
      : (groupRowInfo.groupKeys?.length || 0) <= groupBy?.length;

    const isLoading = showLoadingIcon(groupRowInfo);

    if (isLoading) {
      icon = h(LoadingIcon);
    } else if (showExpanderIcon) {
      icon = h(ExpandCollapseIcon, {
        expanded: !collapsed,
        direction: column.align === 'end' ? 'end' : 'start',
        onChange: () => {
          toggleGroupRow(groupKeys!);
        },
      });
    }

    if (initialRenderGroupIcon) {
      renderOptions.renderBag.groupIcon = icon as any;
      icon = (initialRenderGroupIcon as Function)(renderOptions) as VNodeChild;
    }

    return icon as any;
  };
}

function getVueGroupColumnRenderers<T>(): GroupColumnRenderers<T> {
  return {
    getGroupColumnRender,
    getGroupColumnRenderGroupIcon,
  };
}

export function getColumnForGroupBy<T>(
  options: InfiniteTableGroupColumnGetterOptions<T> & {
    groupIndexForColumn: number;
    groupByForColumn: DataSourceGroupBy<T>;
  },
  toggleGroupRow: (groupRowKeys: any[]) => void,
  groupColumnFromProps?: Partial<InfiniteTablePropGroupColumn<T>>,
): InfiniteTableGeneratedGroupColumn<T> {
  return buildColumnForGroupBy<T>(
    options,
    toggleGroupRow,
    groupColumnFromProps,
    getVueGroupColumnRenderers<T>(),
  );
}

export function getSingleGroupColumn<T>(
  options: InfiniteTableGroupColumnGetterOptions<T>,
  toggleGroupRow: (groupRowKeys: any[]) => void,
  groupColumnFromProps?: Partial<InfiniteTablePropGroupColumn<T>>,
) {
  return buildSingleGroupColumn<T>(
    options,
    toggleGroupRow,
    groupColumnFromProps,
    getVueGroupColumnRenderers<T>(),
  );
}

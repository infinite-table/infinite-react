
import type { InfiniteTableColumnCellContextType } from '..';
import type { InfiniteTable_HasGrouping_RowInfoGroup } from '../../../utils/groupAndPivot';
import { join } from '../../../utils/join';
import type { DataSourceGroupBy } from '../../DataSource';
import { showLoadingIcon } from '../../DataSource/state/rowInfoStatus';
import { ExpandCollapseIcon } from '../components/icons/ExpandCollapseIcon/ExpandCollapseIconForAngular.angular';
import { LoadingIcon } from '../components/icons/LoadingIcon/LoadingIconForAngular.angular';
import { renderComponent } from '../../RawList/InfiniteRenderForAngular.angular';
import { renderDiv } from '../../RawList/InfiniteDivForAngular.angular';
import type { Renderable } from '../../types/FrameworkTypes.angular';
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
 * Angular sibling of getColumnForGroupBy.tsx.
 *
 * The generated column structure comes from the shared buildGroupColumn
 * module - only the render/renderGroupIcon implementations live here: they
 * return Angular renderables (same DOM/classnames as the React JSX versions).
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
    const isNestedGroupRow =
      groupRenderStrategy === 'multi-column' &&
      groupRowInfo.isGroupRow &&
      groupIndexForColumn + 1 !== groupRowInfo.groupNesting;

    const className = join(
      display.flex,
      column.align === 'end' ? flexFlow.rowReverse : flexFlow.row,
      alignItems.center,
      `${InfiniteTableColumnCellClassName}Expander`,
      groupRenderStrategy === 'single-column' ||
        (groupRenderStrategy === 'multi-column' &&
          (!rowInfo.isGroupRow ||
            selectionCheckBox ||
            (isNestedGroupRow && column.field)))
        ? GroupRowExpanderCls({ align })
        : null,
    );

    if (isNestedGroupRow) {
      // Pivot grids have no leaf rows. A field-bound group column must
      // still show that field on nested group rows — same as leaves
      // in a non-pivoted grid — indented one level past the group row.
      if (!column.field) {
        return selectionCheckBox
          ? (renderDiv(className, [selectionCheckBox as Renderable]) as any)
          : null;
      }

      return renderDiv(className, [
        selectionCheckBox as Renderable,
        renderDiv(cssEllipsisClassName, (valueToRender ?? null) as Renderable),
      ]) as any;
    }

    return renderDiv(className, [
      groupIcon as Renderable,
      selectionCheckBox as Renderable,
      renderDiv(cssEllipsisClassName, (valueToRender ?? null) as Renderable),
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

    let icon: Renderable = null;

    const showExpanderIcon = pivotBy
      ? (groupRowInfo.groupKeys?.length || 0) < groupBy?.length
      : (groupRowInfo.groupKeys?.length || 0) <= groupBy?.length;

    const isLoading = showLoadingIcon(groupRowInfo);

    if (isLoading) {
      icon = renderComponent(LoadingIcon);
    } else if (showExpanderIcon) {
      icon = renderComponent(ExpandCollapseIcon, {
        inputs: {
          expanded: !collapsed,
          direction: column.align === 'end' ? 'end' : 'start',
          onChange: () => {
            toggleGroupRow(groupKeys!);
          },
        },
      });
    }

    if (initialRenderGroupIcon) {
      renderOptions.renderBag.groupIcon = icon as any;
      icon = (initialRenderGroupIcon as Function)(renderOptions) as Renderable;
    }

    return icon as any;
  };
}

function getAngularGroupColumnRenderers<T>(): GroupColumnRenderers<T> {
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
    getAngularGroupColumnRenderers<T>(),
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
    getAngularGroupColumnRenderers<T>(),
  );
}

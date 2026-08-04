import * as React from 'react';

import { InfiniteTableColumnCellContextType } from '..';
import { InfiniteTable_HasGrouping_RowInfoGroup } from '../../../utils/groupAndPivot';
import { join } from '../../../utils/join';
import { DataSourceGroupBy } from '../../DataSource';
import { showLoadingIcon } from '../../DataSource/state/rowInfoStatus';
import { Renderable } from '../../types/Renderable';
import { ExpandCollapseIcon } from '../components/icons/ExpandCollapseIcon';
import { LoadingIcon } from '../components/icons/LoadingIcon';
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

import { RenderCellHookComponent } from './RenderHookComponentForInfinite';
import {
  buildColumnForGroupBy,
  buildSingleGroupColumn,
  GroupColumnRenderers,
} from './buildGroupColumn';

export { styleForGroupColumn } from '../components/InfiniteTableRow/columnCellStyling';

export function getGroupColumnRender<T>({
  groupIndexForColumn,
  groupRenderStrategy,
}: {
  groupRenderStrategy: InfiniteTablePropGroupRenderStrategy;
  groupIndexForColumn: number;
}) {
  return (renderOptions: InfiniteTableColumnCellContextType<T>) => {
    const { rowInfo, renderBag, column, align } = renderOptions;

    // TODO continue here to take valueToRender from corrensponding groupByColumn
    // see http://localhost:3000/tests/table/props/row-selection/with-grouping
    let { value: valueToRender, groupIcon, selectionCheckBox } = renderBag;

    // for groupRenderStrategy !== 'inline', we work on group rows
    // const groupRowInfo = (
    //   groupRenderStrategy !== 'inline'
    //     ? rowInfo
    //     : // while for inline, we need to still work on group rows, but the current row is a data item
    //       // so we go find the group row via the parents of enhanced data
    //       (rowInfo.isGroupRow && rowInfo.parents?.[groupIndexForColumn]) ||
    //       rowInfo
    // ) as InfiniteTable_HasGrouping_RowInfoGroup<T>;
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
        return selectionCheckBox ? (
          <div className={className}>{selectionCheckBox}</div>
        ) : null;
      }
    } else if (
      groupRenderStrategy === 'single-column' &&
      !groupRowInfo.isGroupRow
    ) {
      // groupIcon = null;
      // return null;
    }

    // if (!groupIcon) {
    //   return valueToRender;
    // }

    // if (groupByColumn && groupByColumn.renderValue) {
    //   valueToRender = groupByColumn.renderValue(renderOptions);
    // }

    return (
      <div className={className}>
        {groupIcon}
        {selectionCheckBox}

        <div className={cssEllipsisClassName}>{valueToRender ?? null}</div>
      </div>
    );
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
      icon = <LoadingIcon />;
    } else if (showExpanderIcon) {
      const defaultIcon = (
        <ExpandCollapseIcon
          expanded={!collapsed}
          direction={column.align === 'end' ? 'end' : 'start'}
          onChange={() => {
            // if (!data) {
            //   return;
            // }
            toggleGroupRow(groupKeys!);
          }}
        />
      );
      icon = defaultIcon;
    }

    if (initialRenderGroupIcon) {
      renderOptions.renderBag.groupIcon = icon;
      icon = (
        <RenderCellHookComponent
          render={initialRenderGroupIcon!}
          renderParam={renderOptions}
        />
      );
    }

    return icon;
  };
}
function getReactGroupColumnRenderers<T>(): GroupColumnRenderers<T> {
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
    getReactGroupColumnRenderers<T>(),
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
    getReactGroupColumnRenderers<T>(),
  );
}

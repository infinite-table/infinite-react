import * as React from 'react';

import { InfiniteTableColumnCellContextType } from '..';
import {
  InfiniteTableRowInfo,
  InfiniteTable_HasGrouping_RowInfoGroup,
} from '../../../utils/groupAndPivot';
import { join } from '../../../utils/join';
import { stripVar } from '../../../utils/stripVar';
import { DataSourceGroupBy } from '../../DataSource';
import { showLoadingIcon } from '../../DataSource/state/rowInfoStatus';
import { Renderable } from '../../types/Renderable';
import { ExpanderIcon } from '../components/icons/ExpanderIcon';
import { LoadingIcon } from '../components/icons/LoadingIcon';
import { InfiniteTableColumnCellClassName } from '../components/InfiniteTableRow/InfiniteTableColumnCell';
import { GroupRowExpanderCls } from '../components/InfiniteTableRow/row.css';

import { ThemeVars } from '../theme.css';
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

export function styleForGroupColumn<T>({
  rowInfo,
}: {
  rowInfo: InfiniteTableRowInfo<T>;
}) {
  return {
    [stripVar(ThemeVars.components.Row.groupNesting)]:
      rowInfo.dataSourceHasGrouping
        ? rowInfo.isGroupRow
          ? rowInfo.groupNesting - 1
          : rowInfo.groupNesting
        : 0,
  };
}
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

    if (groupRenderStrategy === 'multi-column') {
      if (
        groupIndexForColumn + 1 !== groupRowInfo.groupNesting &&
        groupRowInfo.isGroupRow
      ) {
        return null;
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
      <div
        className={join(
          display.flex,
          column.align === 'end' ? flexFlow.rowReverse : flexFlow.row,
          alignItems.center,
          `${InfiniteTableColumnCellClassName}Expander`,
          groupRenderStrategy === 'single-column' ||
            (groupRenderStrategy === 'multi-column' && !rowInfo.isGroupRow)
            ? GroupRowExpanderCls({ align })
            : null,
        )}
      >
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
        <ExpanderIcon
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
export function getColumnForGroupBy<T>(
  options: InfiniteTableGroupColumnGetterOptions<T> & {
    groupIndexForColumn: number;
    groupByForColumn: DataSourceGroupBy<T>;
  },
  toggleGroupRow: (groupRowKeys: any[]) => void,
  groupColumnFromProps?: Partial<InfiniteTablePropGroupColumn<T>>,
): InfiniteTableGeneratedGroupColumn<T> {
  const { groupByForColumn, groupIndexForColumn, groupRenderStrategy } =
    options;

  let userDefinedGroupColumn: Partial<InfiniteTableColumn<T>> =
    typeof groupColumnFromProps === 'function'
      ? groupColumnFromProps(options, toggleGroupRow)
      : { ...groupColumnFromProps };

  if (groupByForColumn.column) {
    userDefinedGroupColumn = {
      ...userDefinedGroupColumn,
      ...groupByForColumn.column,
    };
  }

  let generatedGroupColumn: InfiniteTableGeneratedGroupColumn<T> = {
    header: `Group by ${groupByForColumn.field || groupByForColumn.groupField}`,
    groupByForColumn,

    render: getGroupColumnRender({
      groupIndexForColumn,
      groupRenderStrategy,
    }),
    ...userDefinedGroupColumn,
    renderGroupIcon: getGroupColumnRenderGroupIcon({
      initialRenderGroupIcon: userDefinedGroupColumn?.renderGroupIcon,
      groupIndexForColumn,
      toggleGroupRow,
      groupRenderStrategy,
    }),
  };

  if (groupColumnFromProps) {
    if (typeof groupColumnFromProps === 'function') {
      generatedGroupColumn = {
        ...generatedGroupColumn,
        ...groupColumnFromProps(options, toggleGroupRow),
      } as InfiniteTableGeneratedGroupColumn<T>;
    } else {
      generatedGroupColumn = {
        ...generatedGroupColumn,
        ...groupColumnFromProps,
      } as InfiniteTableGeneratedGroupColumn<T>;
    }
  }
  return generatedGroupColumn;
}

export function getSingleGroupColumn<T>(
  options: InfiniteTableGroupColumnGetterOptions<T>,
  toggleGroupRow: (groupRowKeys: any[]) => void,
  groupColumnFromProps?: Partial<InfiniteTablePropGroupColumn<T>>,
) {
  const theGroupColumnFromProps =
    typeof groupColumnFromProps === 'function'
      ? groupColumnFromProps(options, toggleGroupRow)
      : groupColumnFromProps;

  const base: { sortable?: boolean } = {};

  if (options.sortable != undefined) {
    base.sortable = options.sortable;
  }
  let generatedGroupColumn: InfiniteTableGeneratedGroupColumn<T> = {
    ...base,
    header: `Group`,
    groupByForColumn: options.groupBy,
    renderSelectionCheckBox: options.selectionMode === 'multi-row',

    render: getGroupColumnRender({
      groupIndexForColumn: 0,
      groupRenderStrategy: 'single-column',
    }),
    ...groupColumnFromProps,
    renderGroupIcon: getGroupColumnRenderGroupIcon({
      initialRenderGroupIcon: theGroupColumnFromProps?.renderGroupIcon,
      groupIndexForColumn: 0,
      toggleGroupRow,
      groupRenderStrategy: 'single-column',
    }),
  };

  return generatedGroupColumn;
}

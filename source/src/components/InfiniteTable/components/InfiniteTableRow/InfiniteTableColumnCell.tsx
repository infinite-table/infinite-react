import * as React from 'react';
import { useCallback, useContext, useMemo } from 'react';

import { join } from '../../../../utils/join';
import { stripVar } from '../../../../utils/stripVar';
import { useDataSourceContextValue } from '../../../DataSource/publicHooks/useDataSource';

import { useCellClassName } from '../../hooks/useCellClassName';
import { useInfiniteTable } from '../../hooks/useInfiniteTable';
import { internalProps } from '../../internalProps';
import { InternalVars } from '../../theme.css';

import type {
  InfiniteTableColumnStyleFnParams,
  InfiniteTableColumnRenderParam,
  InfiniteTableColumnCellContextType,
  InfiniteTableColumnRenderFunction,
} from '../../types/InfiniteTableColumn';
import { InfiniteTableRowStyleFnParams } from '../../types/InfiniteTableProps';
import { objectValuesExcept } from '../../utils/objectValuesExcept';
import { RenderCellHookComponent } from '../../utils/RenderHookComponent';
import { ColumnCellRecipe, SelectionCheckboxCls } from '../cell.css';
import { InfiniteCheckBox } from '../CheckBox';
import {
  getColumnRenderParam,
  getFormattedValueContextForCell,
  InfiniteTableColumnRenderingContext,
} from './columnRendering';

import {
  InfiniteTableCell,
  InfiniteTableCellClassName,
} from './InfiniteTableCell';
import {
  InfiniteTableCellProps,
  InfiniteTableColumnCellProps,
} from './InfiniteTableCellTypes';

const { rootClassName } = internalProps;

const columnZIndexAtIndex = stripVar(InternalVars.columnZIndexAtIndex);

export const InfiniteTableColumnCellContext = React.createContext<
  InfiniteTableColumnCellContextType<any>
>(null as any as InfiniteTableColumnCellContextType<any>);

export const InfiniteTableColumnCellClassName = `${rootClassName}ColumnCell`;

export const defaultRenderSelectionCheckBox: InfiniteTableColumnRenderFunction<
  any
> = (params) => {
  const {
    rowInfo,
    selectCurrentRow,
    deselectCurrentRow,
    toggleCurrentGroupRowSelection,
    column,
  } = params;

  if (rowInfo.isGroupRow && !column.groupByField) {
    return null;
  }

  return (
    <InfiniteCheckBox
      domProps={{
        className: SelectionCheckboxCls,
      }}
      onChange={(selected) => {
        if (rowInfo.isGroupRow) {
          toggleCurrentGroupRowSelection();
          return;
        }

        if (selected) {
          selectCurrentRow();
        } else {
          deselectCurrentRow();
        }
      }}
      checked={rowInfo.rowSelected}
    />
  );
};

function InfiniteTableColumnCellFn<T>(props: InfiniteTableColumnCellProps<T>) {
  const {
    rowInfo,
    rowStyle,
    rowClassName,

    // getData,
    width,
    column,
    onMouseLeave,
    onMouseEnter,

    // toggleGroupRow,
    rowIndex,
    rowHeight,
    columnsMap,

    domRef,
    hidden,
    showZebraRows,
  } = props;

  if (!column) {
    return <div ref={domRef}>no column</div>;
  }

  const { rowSelected } = rowInfo;

  const { getState, componentActions, imperativeApi } = useInfiniteTable<T>();
  const { componentState: dataSourceState, getState: getDataSourceState } =
    useDataSourceContextValue<T>();
  const { activeRowIndex, keyboardNavigation } = getState();
  const rowActive = rowIndex === activeRowIndex && keyboardNavigation === 'row';

  const renderingContext: InfiniteTableColumnRenderingContext<T> = {
    getState,
    getDataSourceState,
    actions: componentActions,
    api: imperativeApi,
  };

  const formattedResult = getFormattedValueContextForCell(
    column,
    rowInfo,
    renderingContext,
  );
  const { formattedValueContext, formattedValue } = formattedResult;

  const onClick = useCallback(
    (event) => {
      const colIndex = column.computedVisibleIndex;

      getState().cellClick({
        rowIndex,
        colIndex,
        event,
      });
    },
    [rowIndex, column.computedVisibleIndex, keyboardNavigation],
  );

  const onMouseDown = useCallback(
    (event) => {
      const colIndex = column.computedVisibleIndex;

      getState().cellMouseDown({
        rowIndex,
        colIndex,
        event,
      });

      if (keyboardNavigation === 'row') {
        componentActions.activeRowIndex = rowIndex;
        return;
      }
      if (keyboardNavigation === 'cell') {
        componentActions.activeCellIndex = [rowIndex, colIndex];
      }
    },
    [rowIndex, column.computedVisibleIndex, keyboardNavigation],
  );

  const { selectionMode } = dataSourceState;

  const stylingRenderParam = {
    column,
    ...formattedValueContext,
  } as InfiniteTableColumnStyleFnParams<T>;

  const renderParam = getColumnRenderParam({
    column,
    rowInfo,
    formattedValue,
    formattedValueContext,
    context: { ...renderingContext, columnsMap },
  }) as InfiniteTableColumnRenderParam<T>;

  renderParam.domRef = domRef;

  renderParam.selectCurrentRow = useCallback(renderParam.selectCurrentRow, [
    rowInfo,
  ]);
  renderParam.deselectCurrentRow = useCallback(renderParam.deselectCurrentRow, [
    rowInfo,
  ]);
  renderParam.toggleCurrentGroupRow = useCallback(
    renderParam.toggleCurrentGroupRow,
    [rowInfo],
  );
  renderParam.toggleCurrentGroupRowSelection = useCallback(
    renderParam.toggleCurrentGroupRowSelection,
    [rowInfo],
  );

  const renderChildren = useCallback(() => {
    if (hidden) {
      return null;
    }

    if (column.renderGroupIcon) {
      renderParam.renderBag.groupIcon = (
        <RenderCellHookComponent
          render={column.renderGroupIcon}
          renderParam={{
            ...renderParam,
            renderBag: { ...renderParam.renderBag },
          }}
        />
      );
    }
    if (column.renderSelectionCheckBox && selectionMode == 'multi-row') {
      // make selectionCheckBox available in the render bag
      // when we have column.renderSelectionCheckBox defined as a function
      // as people might want to use the default value
      // and enhance it
      renderParam.renderBag.selectionCheckBox = (
        <RenderCellHookComponent
          render={defaultRenderSelectionCheckBox}
          renderParam={renderParam}
        />
      );

      if (column.renderSelectionCheckBox !== true) {
        renderParam.renderBag.selectionCheckBox = (
          <RenderCellHookComponent
            render={column.renderSelectionCheckBox}
            renderParam={{
              ...renderParam,
              renderBag: { ...renderParam.renderBag },
            }}
          />
        );
      }
    }

    if (column.renderValue) {
      renderParam.renderBag.value = (
        <RenderCellHookComponent
          render={column.renderValue}
          renderParam={{
            ...renderParam,
            renderBag: { ...renderParam.renderBag },
          }}
        />
      );
    }

    if (rowInfo.isGroupRow && column.renderGroupValue) {
      renderParam.renderBag.value = (
        <RenderCellHookComponent
          render={column.renderGroupValue}
          renderParam={{
            ...renderParam,
            renderBag: { ...renderParam.renderBag },
          }}
        />
      );
    }
    if (!rowInfo.isGroupRow && column.renderLeafValue) {
      renderParam.renderBag.value = (
        <RenderCellHookComponent
          render={column.renderLeafValue}
          renderParam={{
            ...renderParam,
            renderBag: { ...renderParam.renderBag },
          }}
        />
      );
    }

    if (column.render) {
      return (
        <RenderCellHookComponent
          render={column.render}
          renderParam={renderParam}
        />
      );
    }

    return (
      <>
        {column.align !== 'end' ? renderParam.renderBag.groupIcon : null}
        {column.align !== 'end'
          ? renderParam.renderBag.selectionCheckBox
          : null}
        {renderParam.renderBag.value}

        {column.align === 'end'
          ? renderParam.renderBag.selectionCheckBox
          : null}
        {column.align === 'end' ? renderParam.renderBag.groupIcon : null}
      </>
    );
  }, [
    column,
    hidden,
    ...objectValuesExcept(renderParam, {
      renderBag: true,
    }),
  ]);

  const rowPropsAndStyleArgs: InfiniteTableRowStyleFnParams<T> = {
    ...formattedValueContext,
    rowIndex,
  };

  const rowComputedClassName =
    typeof rowClassName === 'function'
      ? rowClassName(rowPropsAndStyleArgs)
      : rowClassName;

  const colClassName: undefined | string = column.className
    ? typeof column.className === 'function'
      ? column.className(stylingRenderParam)
      : column.className
    : undefined;

  let style: React.CSSProperties | undefined;

  if (rowStyle) {
    style =
      typeof rowStyle === 'function'
        ? { ...style, ...rowStyle(rowPropsAndStyleArgs) }
        : { ...style, ...rowStyle };
  }

  style = column.style
    ? typeof column.style === 'function'
      ? { ...style, ...(column.style(stylingRenderParam) || {}) }
      : { ...style, ...column.style }
    : style || {};

  // style.width = width;
  style.height = rowHeight;
  style.zIndex = `var(${columnZIndexAtIndex}-${column.computedVisibleIndex})`;

  const memoizedStyle = useMemo(
    () => style,
    [!style ? null : JSON.stringify(style)],
  );

  const odd =
    (rowInfo.indexInAll != null ? rowInfo.indexInAll : rowIndex) % 2 === 1;

  const zebra = showZebraRows ? (odd ? 'odd' : 'even') : false;

  const cellProps: InfiniteTableCellProps<T> &
    React.HTMLAttributes<HTMLElement> = {
    domRef,
    cellType: 'body',
    column,
    width,

    style: memoizedStyle,
    onMouseLeave,
    onMouseEnter,
    onClick,
    onMouseDown,
    cssEllipsis: column.cssEllipsis ?? true,
    className: join(
      useCellClassName(
        column,
        [InfiniteTableColumnCellClassName, InfiniteTableCellClassName],
        ColumnCellRecipe,
        { dragging: false, zebra, rowActive, rowSelected },
      ),
      colClassName,
      rowComputedClassName,
    ),
    renderChildren,
  };

  // const ContextProvider =
  //   InfiniteTableColumnCellContext.Provider as React.Provider<
  //     InfiniteTableColumnCellContextType<T>
  //   >;

  return <InfiniteTableCell<T> {...cellProps}></InfiniteTableCell>;
}

export const InfiniteTableColumnCell = React.memo(
  InfiniteTableColumnCellFn,
) as typeof InfiniteTableColumnCellFn;

export function useInfiniteColumnCell<T>() {
  const result = useContext(
    InfiniteTableColumnCellContext,
  ) as InfiniteTableColumnCellContextType<T>;

  return result;
}

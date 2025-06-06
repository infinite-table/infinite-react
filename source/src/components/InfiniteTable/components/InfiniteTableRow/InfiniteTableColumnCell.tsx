import * as React from 'react';
import { useCallback, useContext, useMemo } from 'react';
import { once } from '../../../../utils/DeepMap/once';
import {
  InfiniteTableRowInfoDataDiscriminator,
  InfiniteTable_Tree_RowInfoBase,
} from '../../../../utils/groupAndPivot';
// const once = (fn: Function) => fn;

import { join } from '../../../../utils/join';

import { stripVar } from '../../../../utils/stripVar';
import { useDataSourceContextValue } from '../../../DataSource/publicHooks/useDataSourceState';

import { useCellClassName } from '../../hooks/useCellClassName';
import { useInfiniteTable } from '../../hooks/useInfiniteTable';
import { internalProps } from '../../internalProps';
import { InternalVars } from '../../internalVars.css';
import { InfiniteColumnEditorContextType } from '../../types';

import type {
  InfiniteTableColumnCellContextType,
  InfiniteTableColumnRenderFunction,
  InfiniteTableColumnClassName,
  InfiniteTableColumnStylingFnParams,
  InfiniteTableColumnStyle,
  InfiniteTableColumn,
} from '../../types/InfiniteTableColumn';
import { InfiniteTableRowContext } from '../../types/InfiniteTableContextValue';
import { InfiniteTableRowStylingFnParams } from '../../types/InfiniteTableProps';
import { styleForGroupColumn } from '../../utils/getColumnForGroupBy';
import { objectValuesExcept } from '../../utils/objectValuesExcept';
import {
  CellEditorContextComponent,
  RenderCellHookComponent,
} from '../../utils/RenderHookComponentForInfinite';
import { ThemeVars } from '../../vars.css';
import {
  ColumnCellRecipe,
  ColumnCellSelectionIndicatorRecipe,
  SelectionCheckboxCls,
} from '../cell.css';
import { InfiniteCheckBox } from '../CheckBox';
import { ExpandCollapseIcon } from '../icons/ExpandCollapseIcon';
import { getColumnRenderingParams } from './columnRendering';
import { InfiniteTableColumnRenderingContext } from './columnRenderingContextType';

import {
  InfiniteTableCell,
  InfiniteTableCellClassName,
} from './InfiniteTableCell';
import {
  InfiniteTableCellProps,
  InfiniteTableColumnCellProps,
} from './InfiniteTableCellTypes';
import { InfiniteTableColumnEditor } from './InfiniteTableColumnEditor';
import { TreeColumnCellExpanderCls } from './row.css';

const { rootClassName } = internalProps;

const columnZIndexAtIndex = stripVar(InternalVars.columnZIndexAtIndex);

export function styleForTreeColumn<T>({
  rowInfo,
}: {
  rowInfo: InfiniteTable_Tree_RowInfoBase<T>;
}) {
  return {
    [stripVar(ThemeVars.components.Row.groupNesting)]: rowInfo.isTreeNode
      ? rowInfo.isParentNode
        ? rowInfo.treeNesting
        : rowInfo.treeNesting + 1
      : 0,
  };
}

export const InfiniteTableColumnCellContext = React.createContext<
  InfiniteTableColumnCellContextType<any>
>(null as any as InfiniteTableColumnCellContextType<any>);

export const InfiniteTableColumnCellClassName = `${rootClassName}ColumnCell`;

export const defaultRenderRowDetailIcon: InfiniteTableColumnRenderFunction<
  any
> = (params) => {
  const { toggleCurrentRowDetails, rowDetailState } = params;

  return (
    <ExpandCollapseIcon
      style={{
        visibility: rowDetailState === false ? 'hidden' : 'visible',
      }}
      expanded={rowDetailState === 'expanded'}
      onChange={toggleCurrentRowDetails}
    />
  );
};

const EXPANDER_STYLE: React.CSSProperties = {
  display: 'inline-block',
  visibility: 'visible',
};

export const defaultRenderTreeIcon: InfiniteTableColumn<any>['renderTreeIcon'] =
  (params) => {
    const { rowInfo, toggleCurrentTreeNode, nodeExpanded, api } = params;

    const isNodeReadOnly = api.getDataSourceState().isNodeReadOnly;

    return (
      <ExpandCollapseIcon
        disabled={
          rowInfo.isTreeNode && rowInfo.isParentNode
            ? isNodeReadOnly(rowInfo)
            : false
        }
        style={EXPANDER_STYLE}
        expanded={nodeExpanded}
        onChange={toggleCurrentTreeNode}
      />
    );
  };
export const defaultRenderSelectionCheckBox: InfiniteTableColumnRenderFunction<
  any
> = (params) => {
  const {
    rowInfo,
    selectCurrentRow,
    deselectCurrentRow,
    toggleCurrentGroupRowSelection,
    column,
    dataSourceApi,
    api,
  } = params;

  if (rowInfo.isGroupRow && !column.groupByForColumn) {
    // we previously returned null here and didn't show a selection checkbox
    // for group rows that were not group columns
    // but we better show it and allow users to opt-out instead
    // return null;
  }
  const { components } = api.getState();

  const isNodeSelectable = api.getDataSourceState().isNodeSelectable;
  const CheckBoxCmp = components?.CheckBox || InfiniteCheckBox;

  return (
    <CheckBoxCmp
      domProps={{
        className: SelectionCheckboxCls,
      }}
      disabled={rowInfo.isTreeNode ? !isNodeSelectable(rowInfo) : false}
      onChange={(selected) => {
        if (rowInfo.isTreeNode) {
          dataSourceApi.treeApi.setNodeSelection(
            rowInfo.nodePath,
            selected ?? false,
          );
          return;
        }
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

function applyColumnClassName<T>(
  columnClassName: InfiniteTableColumnClassName<T>,
  param: InfiniteTableColumnStylingFnParams<T>,
) {
  const colClassName: undefined | string = columnClassName
    ? typeof columnClassName === 'function'
      ? columnClassName(param)
      : columnClassName
    : undefined;

  return colClassName;
}

function applyColumnStyle<T>(
  existingStyle: React.CSSProperties | undefined,
  columnStyle: InfiniteTableColumnStyle<T>,
  param: InfiniteTableColumnStylingFnParams<T>,
) {
  return typeof columnStyle === 'function'
    ? { ...existingStyle, ...columnStyle(param) }
    : { ...existingStyle, ...columnStyle };
}

function InfiniteTableColumnCellFn<T>(props: InfiniteTableColumnCellProps<T>) {
  const {
    rowInfo,
    rowStyle,
    rowClassName,

    rowIndexInHorizontalLayoutPage,
    horizontalLayoutPageIndex,
    getData,
    cellStyle,
    cellClassName,

    rowDetailState,

    width,
    column,
    onMouseLeave,
    onMouseEnter,

    onRowMouseEnter,
    onRowMouseLeave,

    // toggleGroupRow,
    rowIndex,
    rowHeight,
    columnsMap,

    fieldsToColumn,

    domRef: initialDomRef,
    hidden,
    showZebraRows,
  } = props;

  const htmlElementRef = React.useRef<HTMLElement | null>(null);
  const domRef = useCallback(
    (node: HTMLElement | null) => {
      htmlElementRef.current = node;
      if (initialDomRef) {
        initialDomRef(node);
      }
    },
    [initialDomRef],
  );

  if (!column) {
    return <div ref={domRef}>no column</div>;
  }

  const { rowSelected } = rowInfo;

  const {
    getState,
    actions: componentActions,
    computed,
    api: imperativeApi,
    getDataSourceMasterContext,
  } = useInfiniteTable<T>();
  const {
    componentState: dataSourceState,
    getState: getDataSourceState,
    api: dataSourceApi,
    componentActions: dataSourceActions,
  } = useDataSourceContextValue<T>();

  const { activeRowIndex, keyboardNavigation, columnReorderInPageIndex } =
    getState();
  const rowActive = rowIndex === activeRowIndex && keyboardNavigation === 'row';

  const renderingContext: InfiniteTableColumnRenderingContext<T> = {
    getState,
    getDataSourceState,
    getDataSourceMasterContext,
    actions: componentActions,
    dataSourceActions,
    api: imperativeApi,
    dataSourceApi,
  };

  const rowDisabled = rowInfo.rowDisabled;

  const visibleColumnsIds = computed.computedVisibleColumns.map((x) => x.id);
  const colRenderingParams = getColumnRenderingParams({
    horizontalLayoutPageIndex,
    rowIndexInHorizontalLayoutPage,
    column,
    rowInfo,
    rowDetailState: rowDetailState,
    columnsMap,
    visibleColumnsIds,
    fieldsToColumn,
    context: renderingContext,
  });

  const {
    stylingParam,
    renderParams,
    formattedValueContext,
    renderFunctions,
    groupByColumnReference,
    inEdit,
  } = colRenderingParams;

  const { align, verticalAlign } = renderParams;

  const renderParam = renderParams as InfiniteTableColumnCellContextType<T>;
  const renderParamRef =
    React.useRef<InfiniteTableColumnCellContextType<T>>(renderParam);

  const handleMouseEnter =
    onRowMouseEnter && onMouseEnter
      ? (event: React.MouseEvent) => {
          const rowInfoDiscriminator: InfiniteTableRowInfoDataDiscriminator<T> =
            formattedValueContext;

          const rowContext: InfiniteTableRowContext<T> = {
            ...rowInfoDiscriminator,
            rowIndex,
          } as InfiniteTableRowContext<T>;
          onRowMouseEnter(rowContext, event);
          onMouseEnter(event);
        }
      : onMouseEnter;

  const handleMouseLeave =
    onRowMouseLeave && onMouseLeave
      ? (event: React.MouseEvent) => {
          const rowContext: InfiniteTableRowContext<T> = {
            ...formattedValueContext,
            rowIndex,
            rowInfo,
          } as InfiniteTableRowContext<T>;
          onRowMouseLeave(rowContext, event);
          onMouseLeave(event);
        }
      : onMouseLeave;

  const onClick = useCallback(
    (event: React.MouseEvent) => {
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
    (event: React.MouseEvent) => {
      const colIndex = column.computedVisibleIndex;

      getState().cellMouseDown({
        rowIndex,
        colIndex,
        event,
      });

      if (keyboardNavigation === 'row') {
        if (!rowDisabled) {
          componentActions.activeRowIndex = rowIndex;
        }
        return;
      }
      if (keyboardNavigation === 'cell') {
        componentActions.activeCellIndex = [rowIndex, colIndex];
      }
    },
    [rowIndex, rowDisabled, column.computedVisibleIndex, keyboardNavigation],
  );

  const { selectionMode, cellSelection, isNodeReadOnly } = dataSourceState;

  const cellSelected = renderParam.cellSelected;

  renderParam.domRef = domRef;
  renderParam.htmlElementRef = htmlElementRef;

  renderParam.toggleCurrentTreeNode = useCallback(
    renderParam.toggleCurrentTreeNode,
    [rowInfo],
  );

  renderParam.selectCell = useCallback(renderParam.selectCell, [rowInfo]);
  renderParam.deselectCell = useCallback(renderParam.deselectCell, [rowInfo]);

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
  renderParam.toggleCurrentRowSelection = useCallback(
    renderParam.toggleCurrentRowSelection,
    [rowInfo],
  );
  renderParam.toggleCurrentGroupRowSelection = useCallback(
    renderParam.toggleCurrentGroupRowSelection,
    [rowInfo],
  );

  renderParam.toggleCurrentTreeNodeSelection = useCallback(
    renderParam.toggleCurrentTreeNodeSelection,
    [rowInfo],
  );

  const EditorComponent =
    column.components?.Editor ?? InfiniteTableColumnEditor;

  const editor = inEdit ? (
    <CellEditorContextComponent contextValue={renderParam}>
      <EditorComponent />
    </CellEditorContextComponent>
  ) : null;

  // for whatever reason (React!!!), this is called twice
  // and since this function mutates the renderParam object
  // we get unwanted side effects
  // so let's only execute it once
  const renderChildren = useCallback(
    once(() => {
      if (hidden) {
        return null;
      }

      if (inEdit) {
        return null;
      }
      renderParamRef.current = renderParam;

      if (renderFunctions.renderGroupIcon) {
        renderParam.renderBag.groupIcon = (
          <RenderCellHookComponent
            render={renderFunctions.renderGroupIcon}
            renderParam={{
              ...renderParam,
              renderBag: { ...renderParam.renderBag },
            }}
          />
        );
      }
      if (
        renderFunctions.renderSelectionCheckBox &&
        selectionMode == 'multi-row'
      ) {
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

        if (renderFunctions.renderSelectionCheckBox !== true) {
          renderParam.renderBag.selectionCheckBox = (
            <RenderCellHookComponent
              render={renderFunctions.renderSelectionCheckBox}
              renderParam={{
                ...renderParam,
                renderBag: { ...renderParam.renderBag },
              }}
            />
          );
        }
      }

      if (rowInfo.isTreeNode) {
        const { isParentNode } = rowInfo;
        let fn: Function | boolean | undefined = undefined;

        const renderForNodeOrLeaf = isParentNode
          ? renderFunctions.renderTreeIconForParentNode
          : renderFunctions.renderTreeIconForLeafNode;

        fn =
          renderForNodeOrLeaf ||
          // for parents, fallback to the renderTreeIcon as well
          typeof renderFunctions.renderTreeIcon === 'function'
            ? renderFunctions.renderTreeIcon
            : isParentNode && renderFunctions.renderTreeIcon === true
            ? defaultRenderTreeIcon
            : undefined;

        if (fn === true) {
          fn = defaultRenderTreeIcon;
        } else if (fn) {
          // make selectionCheckBox available in the render bag
          // when we have column.renderSelectionCheckBox defined as a function
          // as people might want to use the default value
          // and enhance it

          renderParam.renderBag.treeIcon = (
            <RenderCellHookComponent
              render={defaultRenderTreeIcon as Function}
              renderParam={renderParam}
            />
          );
        }

        if (fn) {
          renderParam.renderBag.treeIcon = (
            <RenderCellHookComponent
              render={fn as Function}
              renderParam={{
                ...renderParam,
                renderBag: { ...renderParam.renderBag },
              }}
            />
          );
        }
      }

      if (renderFunctions.renderRowDetailIcon) {
        renderParam.renderBag.rowDetailsIcon = (
          <RenderCellHookComponent
            render={defaultRenderRowDetailIcon}
            renderParam={{
              ...renderParam,
              renderBag: {
                ...renderParam.renderBag,
              },
            }}
          />
        );
        if (typeof renderFunctions.renderRowDetailIcon === 'function') {
          renderParam.renderBag.rowDetailsIcon = (
            <RenderCellHookComponent
              render={renderFunctions.renderRowDetailIcon}
              renderParam={{
                ...renderParam,
                renderBag: { ...renderParam.renderBag },
              }}
            />
          );
        }
      }

      if (renderFunctions.renderValue) {
        renderParam.renderBag.value = (
          <RenderCellHookComponent
            render={renderFunctions.renderValue}
            renderParam={{
              ...renderParam,
              renderBag: { ...renderParam.renderBag },
            }}
          />
        );
      }

      if (rowInfo.isGroupRow && renderFunctions.renderGroupValue) {
        renderParam.renderBag.value = (
          <RenderCellHookComponent
            render={renderFunctions.renderGroupValue}
            renderParam={{
              ...renderParam,
              renderBag: { ...renderParam.renderBag },
            }}
          />
        );
      }
      if (!rowInfo.isGroupRow && renderFunctions.renderLeafValue) {
        renderParam.renderBag.value = (
          <RenderCellHookComponent
            render={renderFunctions.renderLeafValue}
            renderParam={{
              ...renderParam,
              renderBag: { ...renderParam.renderBag },
            }}
          />
        );
      }

      renderParamRef.current = renderParam;

      let valueToRender = renderParam.renderBag.value;

      // add this in order to make date rendering work without any additional code
      if (valueToRender instanceof Date) {
        valueToRender = valueToRender.toLocaleDateString();
      }
      const all = (
        <>
          {align !== 'end' ? renderParam.renderBag.treeIcon : null}
          {align !== 'end' ? renderParam.renderBag.groupIcon : null}
          {align !== 'end' ? renderParam.renderBag.rowDetailsIcon : null}
          {align !== 'end' ? renderParam.renderBag.selectionCheckBox : null}
          {valueToRender}

          {align === 'end' ? renderParam.renderBag.selectionCheckBox : null}
          {align === 'end' ? renderParam.renderBag.rowDetailsIcon : null}
          {align === 'end' ? renderParam.renderBag.groupIcon : null}
          {align === 'end' ? renderParam.renderBag.treeIcon : null}
        </>
      );

      if (column.render) {
        return (
          <RenderCellHookComponent
            render={column.render}
            renderParam={{
              ...renderParam,
              renderBag: { ...renderParam.renderBag, all },
            }}
          />
        );
      }

      return all;
    }),
    [
      column,
      hidden,
      inEdit,
      rowDetailState,
      column.renderTreeIcon || column.renderTreeIconForParentNode
        ? isNodeReadOnly
        : false,
      ...objectValuesExcept(renderParam, {
        renderBag: true,
        selectCell: true,
        deselectCell: true,
        selectCurrentRow: true,
        deselectCurrentRow: true,
        toggleCurrentGroupRow: true,
        toggleCurrentRowDetails: true,
        toggleCurrentRowSelection: true,
        toggleCurrentGroupRowSelection: true,
        toggleCurrentTreeNodeSelection: true,
        toggleCurrentTreeNode: true,
        rowHasSelectedCells: true,
      }),
    ],
  );

  const visibleColumnIds = computed.computedVisibleColumns.map((x) => x.id);
  const allColumnIds = computed.computedColumnOrder;
  const rowPropsAndStyleArgs: InfiniteTableRowStylingFnParams<T> = {
    ...formattedValueContext,
    visibleColumnIds,
    allColumnIds,
    rowIndex,
    // we put it as false by default
    rowHasSelectedCells: false,
  };

  // and then make it a getter
  // so it can be computed lazily - just when the user calls and needs this
  Object.defineProperty(rowPropsAndStyleArgs, 'rowHasSelectedCells', {
    get() {
      return rowInfo.hasSelectedCells(visibleColumnIds);
    },
  });

  const columnIsTree =
    rowInfo.isTreeNode &&
    (column.renderTreeIcon ||
      column.renderTreeIconForLeafNode ||
      column.renderTreeIconForParentNode);

  const rowComputedClassName =
    typeof rowClassName === 'function'
      ? rowClassName(rowPropsAndStyleArgs)
      : rowClassName;

  let colClassName: string | undefined = undefined;

  if (groupByColumnReference?.className) {
    colClassName = applyColumnClassName(
      groupByColumnReference.className,
      stylingParam,
    );
  }
  if (cellClassName) {
    colClassName = join(
      colClassName,
      applyColumnClassName(cellClassName, stylingParam),
    );
  }
  if (column.className) {
    colClassName = join(
      colClassName,
      applyColumnClassName(column.className, stylingParam),
    );
  }

  if (columnIsTree) {
    colClassName = join(
      colClassName,
      TreeColumnCellExpanderCls({
        align,
      }),
    );
  }

  let style: React.CSSProperties | undefined;

  if (rowInfo.dataSourceHasGrouping && column.groupByForColumn) {
    style = styleForGroupColumn({ rowInfo });
  }

  if (columnIsTree) {
    style = styleForTreeColumn({ rowInfo });
  }

  if (rowStyle) {
    style =
      typeof rowStyle === 'function'
        ? { ...style, ...rowStyle(rowPropsAndStyleArgs) }
        : { ...style, ...rowStyle };
  }

  if (cellStyle) {
    style = applyColumnStyle(style, cellStyle, stylingParam);
  }

  if (groupByColumnReference?.style) {
    style = applyColumnStyle(style, groupByColumnReference.style, stylingParam);
  }
  if (column.style) {
    style = applyColumnStyle(style, column.style, stylingParam);
  }
  style = style || {};

  style.height = rowHeight;
  style.zIndex = `var(${columnZIndexAtIndex}-${column.computedVisibleIndex})`;

  const memoizedStyle = useMemo(
    () => style,
    [!style ? null : JSON.stringify(style)],
  );

  const odd =
    rowIndexInHorizontalLayoutPage != null
      ? rowIndexInHorizontalLayoutPage % 2 === 1
      : (rowInfo.indexInAll != null ? rowInfo.indexInAll : rowIndex) % 2 === 1;

  const zebra = showZebraRows ? (odd ? 'odd' : 'even') : false;

  let topSelectionBorder = false;
  let leftSelectionBorder = false;
  let rightSelectionBorder = false;
  let bottomSelectionBorder = false;

  if (cellSelection && cellSelected) {
    const arr = getData();
    const topRowInfo = arr[rowInfo.indexInAll - 1];
    const bottomRowInfo = arr[rowInfo.indexInAll + 1];
    const nextColumn =
      computed.computedVisibleColumns[column.computedVisibleIndex + 1];
    const prevColumn =
      computed.computedVisibleColumns[column.computedVisibleIndex - 1];

    topSelectionBorder = topRowInfo
      ? !cellSelection.isCellSelected(topRowInfo.id, column.id)
      : true;

    if (column.computedPinned === 'end' && column.computedFirstInCategory) {
      leftSelectionBorder = true;
    } else {
      leftSelectionBorder = prevColumn
        ? !cellSelection.isCellSelected(rowInfo.id, prevColumn.id)
        : true;
    }

    if (column.computedPinned === 'start' && column.computedLastInCategory) {
      rightSelectionBorder = true;
    } else {
      rightSelectionBorder = nextColumn
        ? !cellSelection.isCellSelected(rowInfo.id, nextColumn.id)
        : true;
    }
    bottomSelectionBorder = bottomRowInfo
      ? !cellSelection.isCellSelected(bottomRowInfo.id, column.id)
      : true;
  }

  const cellSelectionBorders =
    cellSelection && cellSelected
      ? {
          top: topSelectionBorder,
          left: leftSelectionBorder,
          right: rightSelectionBorder,
          bottom: bottomSelectionBorder,
        }
      : null;

  const insideDisabledDraggingPage =
    columnReorderInPageIndex != null
      ? horizontalLayoutPageIndex !== columnReorderInPageIndex
      : false;

  const afterChildren = editor;
  const theChildren = renderChildren();
  const cellProps: InfiniteTableCellProps<T> &
    React.HTMLAttributes<HTMLElement> = {
    domRef,
    cellType: 'body',
    column,
    width,
    rowId: rowInfo.id,
    horizontalLayoutPageIndex,

    style: memoizedStyle,
    onMouseLeave: handleMouseLeave,
    onMouseEnter: handleMouseEnter,
    onClick,
    afterChildren,
    onMouseDown,
    cssEllipsis: column.cssEllipsis ?? true,
    className: join(
      cellSelectionBorders
        ? ColumnCellSelectionIndicatorRecipe(cellSelectionBorders)
        : '',
      useCellClassName(
        column,
        [InfiniteTableColumnCellClassName, InfiniteTableCellClassName],
        ColumnCellRecipe,
        {
          dragging: false,
          insideDisabledDraggingPage,
          zebra,
          align,
          verticalAlign,
          rowDisabled,
          rowActive,
          cellSelected,
          rowSelected,
          treeNode: rowInfo.isTreeNode
            ? rowInfo.isParentNode
              ? 'parent'
              : 'leaf'
            : false,
          firstRow: rowInfo.indexInAll === 0,
          firstRowInHorizontalLayoutPage: rowIndexInHorizontalLayoutPage === 0,
          groupRow: rowInfo.isGroupRow,
          groupCell: rowInfo.isGroupRow ? !!column.groupByForColumn : false,
          rowExpanded: rowInfo.isGroupRow ? !rowInfo.collapsed : false,
        },
      ),
      colClassName,
      rowComputedClassName,
    ),
    renderChildren: useCallback(() => theChildren, [renderChildren]),
  };

  const ContextProvider =
    InfiniteTableColumnCellContext.Provider as React.Provider<
      InfiniteTableColumnCellContextType<T>
    >;
  return (
    // this context is here for supporting useInfiniteColumnCell to be used
    // with a custom column component, specified via column.components.ColumnCell
    <ContextProvider
      value={renderParamRef.current as InfiniteTableColumnCellContextType<T>}
    >
      <InfiniteTableCell<T> {...cellProps}></InfiniteTableCell>
    </ContextProvider>
  );
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

export function useInfiniteColumnEditor<
  T,
>(): InfiniteColumnEditorContextType<T> {
  const {
    api,
    state: { editingValueRef, editingCell },
  } = useInfiniteTable<T>();

  const { column, rowInfo } = useInfiniteColumnCell<T>();

  const [initialValue] = React.useState(() => editingCell?.value);
  const [currentValue, setCurrentValue] = React.useState(initialValue);

  const readOnly = editingCell
    ? !editingCell.active && !!editingCell.waiting
    : false;

  const setValue = React.useCallback((value: any) => {
    editingValueRef.current = value;
    setCurrentValue(value);
  }, []);

  React.useLayoutEffect(() => {
    editingValueRef.current = initialValue;
  }, []);

  const confirmEdit = api.confirmEdit;
  const cancelEdit = api.cancelEdit;
  const rejectEdit = api.rejectEdit;

  return {
    api,
    initialValue,
    value: currentValue,
    readOnly,
    column,
    rowInfo,
    setValue,
    confirmEdit,
    cancelEdit,
    rejectEdit,
  };
}

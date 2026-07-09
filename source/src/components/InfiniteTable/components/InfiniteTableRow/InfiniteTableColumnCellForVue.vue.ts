import {
  computed,
  defineComponent,
  h,
  onBeforeUnmount,
  onRenderTriggered,
  provide,
  shallowRef,
  watch,
} from 'vue';
import type { InjectionKey, PropType, ShallowRef, VNodeChild } from 'vue';
import { inject } from 'vue';

import { join } from '../../../../utils/join';
import { stripVar } from '../../../../utils/stripVar';
import type { GridMouseEvent } from '../../../types/DOMTypes';
import type { RowInfoStore } from '../../../DataSource/RowInfoStore';
import { InternalVars } from '../../internalVars.css';
import { cssEllipsisClassName, overflow } from '../../utilities.css';
import { ColumnCellCls, SelectionCheckboxCls } from '../cell.css';
import { InfiniteCheckBox } from '../CheckBoxForVue.vue';
import { ExpandCollapseIcon } from '../icons/ExpandCollapseIconForVue.vue';

import type {
  InfiniteTableColumnCellContextType,
  InfiniteTableColumn,
  InfiniteTableComputedColumn,
} from '../../types/InfiniteTableColumn';
import type { InfiniteTableRowInfo } from '../../types';
import type {
  InfiniteTablePropCellClassName,
  InfiniteTablePropCellStyle,
  InfiniteTablePropRowClassName,
  InfiniteTablePropRowStyle,
} from '../../types/InfiniteTableProps';

import { getColumnRenderingParams } from './columnRendering';
import type { InfiniteTableColumnRenderingContext } from './columnRenderingContextType';
import { getColumnCellStyling } from './columnCellStyling';
import { InfiniteTableCellClassName } from './InfiniteTableCellClassNames';
import { InfiniteTableColumnCellClassName } from './InfiniteTableColumnCellClassNames';
import { InfiniteTableColumnEditor } from './InfiniteTableColumnEditorForVue.vue';

const columnWidthAtIndex = stripVar(InternalVars.columnWidthAtIndex);
const columnReorderEffectDurationAtIndex = stripVar(
  InternalVars.columnReorderEffectDurationAtIndex,
);

/**
 * Vue counterpart of the React InfiniteTableColumnCellContext: the current
 * cell render param, exposed to descendants (custom cell components,
 * custom render functions rendering components).
 */
export const InfiniteColumnCellInjectionKey: InjectionKey<
  ShallowRef<InfiniteTableColumnCellContextType<any>>
> = Symbol('InfiniteColumnCell');

export function useInfiniteColumnCell<T>() {
  return inject(InfiniteColumnCellInjectionKey) as ShallowRef<
    InfiniteTableColumnCellContextType<T>
  >;
}

/**
 * Vue equivalents of the default render functions in
 * InfiniteTableColumnCell.tsx (same DOM: same classnames + data attributes).
 */
export const defaultRenderRowDetailIcon = (params: any): VNodeChild => {
  const { toggleCurrentRowDetails, rowDetailState } = params;

  return h(ExpandCollapseIcon, {
    style: {
      visibility: rowDetailState === false ? 'hidden' : 'visible',
    },
    expanded: rowDetailState === 'expanded',
    onChange: toggleCurrentRowDetails,
  });
};

const EXPANDER_STYLE = {
  display: 'inline-block',
  visibility: 'visible',
} as const;

export const defaultRenderTreeIcon = (params: any): VNodeChild => {
  const { rowInfo, toggleCurrentTreeNode, nodeExpanded, api } = params;

  const isNodeReadOnly = api.getDataSourceState().isNodeReadOnly;

  return h(ExpandCollapseIcon, {
    disabled:
      rowInfo.isTreeNode && rowInfo.isParentNode
        ? isNodeReadOnly(rowInfo)
        : false,
    style: EXPANDER_STYLE,
    expanded: nodeExpanded,
    onChange: toggleCurrentTreeNode,
  });
};

export const defaultRenderSelectionCheckBox = (params: any): VNodeChild => {
  const {
    rowInfo,
    selectCurrentRow,
    deselectCurrentRow,
    toggleCurrentGroupRowSelection,
    dataSourceApi,
    api,
  } = params;

  const { components } = api.getState();

  const isNodeSelectable = api.getDataSourceState().isNodeSelectable;
  const CheckBoxCmp = components?.CheckBox || InfiniteCheckBox;

  return h(CheckBoxCmp, {
    domProps: {
      class: SelectionCheckboxCls,
    },
    disabled: rowInfo.isTreeNode ? !isNodeSelectable(rowInfo) : false,
    onChange: (selected: boolean | null) => {
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
    },
    checked: rowInfo.rowSelected,
  });
};

/**
 * Vue sibling of RenderCellHookComponent: the render hook result is wrapped
 * in a component that provides the STAGED renderParam (with the renderBag
 * copy as it was when the hook ran). Without this, component vnodes returned
 * by hooks (e.g. renderValue: () => h(MyCmp)) would execute later and read
 * the final renderBag - which already contains their own output, causing
 * infinite recursion.
 */
const RenderCellHookWrapper = defineComponent({
  name: 'RenderCellHook',
  props: {
    renderParam: { type: Object as PropType<any>, required: true },
    content: { type: null as unknown as PropType<VNodeChild>, default: null },
  },
  setup(props) {
    provide(
      InfiniteColumnCellInjectionKey,
      computed(() => props.renderParam) as any,
    );
    return () => props.content as any;
  },
});

function renderCellHook(render: Function, renderParam: any): VNodeChild {
  const result = render(renderParam) as VNodeChild;
  if (result == null) {
    return result;
  }
  return h(RenderCellHookWrapper, { renderParam, content: result });
}

export type InfiniteTableColumnCellVueProps<T = any> = {
  rowIndex: number;
  rowHeight: number;
  width: number;
  hidden: boolean;
  domRef: (el: HTMLElement | null) => void;
  column: InfiniteTableComputedColumn<T>;
  columnsMap: Map<string, InfiniteTableComputedColumn<T>>;
  fieldsToColumn: Map<keyof T, InfiniteTableComputedColumn<T>>;
  showZebraRows: boolean;
  rowDetailState: false | 'collapsed' | 'expanded';
  inEditMode?: boolean;
  rowIndexInHorizontalLayoutPage: number | null;
  horizontalLayoutPageIndex: number | null;
  rowStyle?: InfiniteTablePropRowStyle<T>;
  rowClassName?: InfiniteTablePropRowClassName<T>;
  cellStyle?: InfiniteTablePropCellStyle<T>;
  cellClassName?: InfiniteTablePropCellClassName<T>;
  getData: () => InfiniteTableRowInfo<T>[];
  rowInfoStore: RowInfoStore<T>;
  renderingContext: InfiniteTableColumnRenderingContext<T>;
  getComputedVisibleColumns: () => InfiniteTableComputedColumn<T>[];
  getComputedColumnOrder: () => string[];
  dataSourceStatePartial?: {
    isNodeReadOnly: unknown;
    selectionMode: unknown;
    cellSelection: unknown;
  };
  onMouseEnter?: (event: GridMouseEvent) => void;
  onMouseLeave?: (event: GridMouseEvent) => void;
};

export const InfiniteTableColumnCell = defineComponent({
  name: 'InfiniteTableColumnCell',
  props: {
    rowIndex: { type: Number, required: true },
    rowHeight: { type: Number, required: true },
    width: { type: Number, required: true },
    hidden: { type: Boolean, default: false },
    domRef: {
      type: Function as PropType<(el: HTMLElement | null) => void>,
      required: true,
    },
    column: { type: Object as PropType<any>, required: true },
    columnsMap: { type: Object as PropType<Map<string, any>>, required: true },
    fieldsToColumn: {
      type: Object as PropType<Map<any, any>>,
      required: true,
    },
    showZebraRows: { type: Boolean, default: true },
    rowDetailState: {
      type: [Boolean, String] as PropType<false | 'collapsed' | 'expanded'>,
      default: false,
    },
    // not read directly - the cell derives inEdit live via
    // getColumnRenderingParams. Passed as a prop (same as React) so the
    // prop diff makes exactly the affected cell re-render when editing
    // starts/stops.
    inEditMode: { type: Boolean, default: false },
    rowIndexInHorizontalLayoutPage: {
      type: Number as PropType<number | null>,
      default: null,
    },
    horizontalLayoutPageIndex: {
      type: Number as PropType<number | null>,
      default: null,
    },
    rowStyle: { type: [Object, Function], default: undefined },
    rowClassName: { type: [String, Function], default: undefined },
    cellStyle: { type: [Object, Function], default: undefined },
    cellClassName: { type: [String, Function], default: undefined },
    getData: { type: Function as PropType<() => any[]>, required: true },
    rowInfoStore: { type: Object as PropType<any>, required: true },
    renderingContext: {
      type: Object as PropType<InfiniteTableColumnRenderingContext<any>>,
      required: true,
    },
    getComputedVisibleColumns: {
      type: Function as PropType<() => any[]>,
      required: true,
    },
    getComputedColumnOrder: {
      type: Function as PropType<() => string[]>,
      required: true,
    },
    // not read directly - the cell reads the live values via
    // getDataSourceState during render. Passed as a prop (same as React's
    // dataSourceStatePartialForCell) so the prop diff re-renders the cell
    // when isNodeReadOnly / selectionMode / cellSelection change
    dataSourceStatePartial: {
      type: Object as PropType<any>,
      default: undefined,
    },
    // the renderer's row-hover handlers (add/remove hover classnames on the
    // row's cells) - declared as props so Vue doesn't treat them as emits
    onMouseEnter: {
      type: Function as PropType<(event: GridMouseEvent) => void>,
      default: undefined,
    },
    onMouseLeave: {
      type: Function as PropType<(event: GridMouseEvent) => void>,
      default: undefined,
    },
  },
  setup(props) {
    if (__DEV__ && (globalThis as any).__INFINITE_DEBUG_CELL__) {
      onRenderTriggered((e) => {
        // eslint-disable-next-line no-console
        console.log(
          '[cell render triggered]',
          props.rowIndex,
          props.column?.id,
          e.type,
          (e as any).key,
          e.target,
        );
      });
    }

    const htmlElementRef: { current: HTMLElement | null } = { current: null };
    const domRefCallback = (el: any) => {
      // when a custom ColumnCell component is used, the ref is the component
      // instance - unwrap it to its root element (React does this via
      // forwardRef + the context domRef instead)
      const node = el && el.$el !== undefined ? el.$el : el;
      htmlElementRef.current = (node as HTMLElement) ?? null;
      props.domRef(htmlElementRef.current);
    };

    // same role as React's useSyncExternalStore on the rowInfoStore:
    // per-row updates (eg mutations) re-render just this cell
    const rowInfoRef = shallowRef<InfiniteTableRowInfo<any> | undefined>(
      props.rowInfoStore.getRowInfoAtIndex(props.rowIndex),
    );

    let unsubscribeRowInfo: VoidFunction | null = null;
    watch(
      [() => props.rowInfoStore, () => props.rowIndex],
      ([rowInfoStore, rowIndex]) => {
        unsubscribeRowInfo?.();
        rowInfoRef.value = rowInfoStore.getRowInfoAtIndex(rowIndex);
        unsubscribeRowInfo = rowInfoStore.subscribeToRowIndex(rowIndex, () => {
          rowInfoRef.value = rowInfoStore.getRowInfoAtIndex(rowIndex);
        });
      },
      { immediate: true },
    );

    onBeforeUnmount(() => {
      unsubscribeRowInfo?.();
      unsubscribeRowInfo = null;
    });

    // exposed to descendants for useInfiniteColumnCell
    const renderParamRef = shallowRef<InfiniteTableColumnCellContextType<any>>(
      null as any,
    );
    provide(InfiniteColumnCellInjectionKey, renderParamRef);

    const onClick = (event: MouseEvent) => {
      const { renderingContext, column, rowIndex } = props;
      renderingContext.getState().cellClick({
        rowIndex,
        colIndex: column.computedVisibleIndex,
        event: event as any,
      });
    };

    const onMouseDown = (event: MouseEvent) => {
      const { renderingContext, column, rowIndex } = props;
      const { getState, actions } = renderingContext;
      const colIndex = column.computedVisibleIndex;

      getState().cellMouseDown({
        rowIndex,
        colIndex,
        event: event as any,
      });

      const { keyboardNavigation } = getState();
      const rowDisabled = rowInfoRef.value?.rowDisabled ?? false;

      if (keyboardNavigation === 'row') {
        if (!rowDisabled) {
          actions.activeRowIndex = rowIndex;
        }
        return;
      }
      if (keyboardNavigation === 'cell') {
        actions.activeCellIndex = [rowIndex, colIndex];
      }
    };

    return () => {
      const {
        column,
        rowIndex,
        rowHeight,
        hidden,
        rowDetailState,
        renderingContext,
        rowIndexInHorizontalLayoutPage,
        horizontalLayoutPageIndex,
      } = props;

      const rowInfo = rowInfoRef.value;

      if (!column || !rowInfo) {
        return h('div', { ref: domRefCallback, style: { display: 'none' } });
      }

      const { getState, getDataSourceState } = renderingContext;
      const { activeRowIndex, keyboardNavigation, columnReorderInPageIndex } =
        getState();
      const rowActive =
        rowIndex === activeRowIndex && keyboardNavigation === 'row';
      const rowDisabled = rowInfo.rowDisabled;
      const { rowSelected } = rowInfo;

      const visibleColumnsIds = props
        .getComputedVisibleColumns()
        .map((x: any) => x.id);

      const colRenderingParams = getColumnRenderingParams({
        horizontalLayoutPageIndex,
        rowIndexInHorizontalLayoutPage,
        column,
        rowInfo,
        rowDetailState,
        columnsMap: props.columnsMap,
        visibleColumnsIds,
        fieldsToColumn: props.fieldsToColumn,
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

      const renderParam =
        renderParams as InfiniteTableColumnCellContextType<any>;

      renderParam.domRef = domRefCallback as any;
      renderParam.htmlElementRef = htmlElementRef as any;

      renderParamRef.value = renderParam;

      const { selectionMode } = getDataSourceState();
      const cellSelected = renderParam.cellSelected;
      const cellSelection = getDataSourceState().cellSelection ?? null;

      // ------- render bag (mirrors the React renderChildren body) -------
      let children: VNodeChild = null;

      if (!hidden && !inEdit) {
        if (renderFunctions.renderGroupIcon) {
          renderParam.renderBag.groupIcon = renderCellHook(
            renderFunctions.renderGroupIcon as Function,
            {
              ...renderParam,
              renderBag: { ...renderParam.renderBag },
            },
          ) as any;
        }

        if (
          renderFunctions.renderSelectionCheckBox &&
          selectionMode == 'multi-row'
        ) {
          // make selectionCheckBox available in the render bag
          // when we have column.renderSelectionCheckBox defined as a function
          // as people might want to use the default value and enhance it
          renderParam.renderBag.selectionCheckBox = renderCellHook(
            defaultRenderSelectionCheckBox,
            renderParam,
          ) as any;

          if (renderFunctions.renderSelectionCheckBox !== true) {
            renderParam.renderBag.selectionCheckBox = renderCellHook(
              renderFunctions.renderSelectionCheckBox as Function,
              {
                ...renderParam,
                renderBag: { ...renderParam.renderBag },
              },
            ) as any;
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
            renderParam.renderBag.treeIcon = renderCellHook(
              defaultRenderTreeIcon as Function,
              renderParam,
            ) as any;
          }

          if (fn) {
            renderParam.renderBag.treeIcon = renderCellHook(fn as Function, {
              ...renderParam,
              renderBag: { ...renderParam.renderBag },
            }) as any;
          }
        }

        if (renderFunctions.renderRowDetailIcon) {
          renderParam.renderBag.rowDetailsIcon = renderCellHook(
            defaultRenderRowDetailIcon,
            {
              ...renderParam,
              renderBag: { ...renderParam.renderBag },
            },
          ) as any;
          if (typeof renderFunctions.renderRowDetailIcon === 'function') {
            renderParam.renderBag.rowDetailsIcon = renderCellHook(
              renderFunctions.renderRowDetailIcon as Function,
              {
                ...renderParam,
                renderBag: { ...renderParam.renderBag },
              },
            ) as any;
          }
        }

        if (renderFunctions.renderValue) {
          renderParam.renderBag.value = renderCellHook(
            renderFunctions.renderValue as Function,
            {
              ...renderParam,
              renderBag: { ...renderParam.renderBag },
            },
          ) as any;
        }

        if (rowInfo.isGroupRow && renderFunctions.renderGroupValue) {
          renderParam.renderBag.value = renderCellHook(
            renderFunctions.renderGroupValue as Function,
            {
              ...renderParam,
              renderBag: { ...renderParam.renderBag },
            },
          ) as any;
        }
        if (!rowInfo.isGroupRow && renderFunctions.renderLeafValue) {
          renderParam.renderBag.value = renderCellHook(
            renderFunctions.renderLeafValue as Function,
            {
              ...renderParam,
              renderBag: { ...renderParam.renderBag },
            },
          ) as any;
        }

        let valueToRender = renderParam.renderBag.value as any;

        // make date rendering work without any additional code
        if (valueToRender instanceof Date) {
          valueToRender = valueToRender.toLocaleDateString();
        }

        const bag = renderParam.renderBag;
        const all: VNodeChild = [
          align !== 'end' ? (bag.treeIcon as any) : null,
          align !== 'end' ? (bag.groupIcon as any) : null,
          align !== 'end' ? (bag.rowDetailsIcon as any) : null,
          align !== 'end' ? (bag.selectionCheckBox as any) : null,
          valueToRender,
          align === 'end' ? (bag.selectionCheckBox as any) : null,
          align === 'end' ? (bag.rowDetailsIcon as any) : null,
          align === 'end' ? (bag.groupIcon as any) : null,
          align === 'end' ? (bag.treeIcon as any) : null,
        ];

        children = column.render
          ? renderCellHook(column.render as Function, {
              ...renderParam,
              renderBag: { ...renderParam.renderBag, all },
            })
          : all;
      }

      // ------- styling (shared controller, same as React) -------
      const { style, className } = getColumnCellStyling({
        column,
        rowInfo,
        rowIndex,
        rowHeight,
        rowIndexInHorizontalLayoutPage,
        horizontalLayoutPageIndex,
        align,
        verticalAlign,
        stylingParam,
        formattedValueContext,
        groupByColumnReference,
        rowStyle: props.rowStyle as any,
        rowClassName: props.rowClassName as any,
        cellStyle: props.cellStyle as any,
        cellClassName: props.cellClassName as any,
        showZebraRows: props.showZebraRows,
        rowActive,
        rowDisabled,
        rowSelected,
        cellSelected,
        cellSelection,
        getData: props.getData,
        computedVisibleColumns: props.getComputedVisibleColumns(),
        computedColumnOrder: props.getComputedColumnOrder(),
        columnReorderInPageIndex,
      });

      // ------- DOM structure (mirrors InfiniteTableCell for body cells) ---
      const colIndex = column.computedVisibleIndex;
      const cssEllipsis = column.cssEllipsis ?? true;

      const finalStyle: Record<string, any> = {
        width: `var(${columnWidthAtIndex}-${colIndex})`,
        transition: `transform var(${columnReorderEffectDurationAtIndex}-${colIndex}, 0s)`,
        ...(style as any),
        height:
          typeof style.height === 'number' ? `${style.height}px` : style.height,
      };

      // mirrors handleMouseEnter/handleMouseLeave in the React cell: the
      // renderer handler (row hover classnames) + the user callback
      const { onRowMouseEnter, onRowMouseLeave } =
        props.renderingContext.getState();

      const handleMouseEnter =
        onRowMouseEnter || props.onMouseEnter
          ? (event: MouseEvent) => {
              onRowMouseEnter?.(
                { ...formattedValueContext, rowIndex } as any,
                event as any,
              );
              props.onMouseEnter?.(event as any);
            }
          : undefined;

      const handleMouseLeave =
        onRowMouseLeave || props.onMouseLeave
          ? (event: MouseEvent) => {
              onRowMouseLeave?.(
                { ...formattedValueContext, rowIndex, rowInfo } as any,
                event as any,
              );
              props.onMouseLeave?.(event as any);
            }
          : undefined;

      const domProps: Record<string, any> = {
        ref: domRefCallback,
        style: finalStyle,
        'data-column-id': column.id,
        'data-z-index': finalStyle.zIndex,
        'data-row-id': `${rowInfo.id}`,
        class: join(className, InfiniteTableCellClassName, ColumnCellCls),
        onClick,
        onMousedown: onMouseDown,
        onMouseenter: handleMouseEnter,
        onMouseleave: handleMouseLeave,
      };

      const contentNode = h(
        'div',
        {
          class: join(
            `${InfiniteTableCellClassName}_content`,
            cssEllipsis ? cssEllipsisClassName : overflow.hidden,
          ),
        },
        [children],
      );

      // the editor renders AFTER the content div, inside the cell root -
      // same position as React's afterChildren in InfiniteTableCell
      const EditorComponent =
        (
          column as InfiniteTableColumn<any> & {
            components?: { Editor?: any };
          }
        ).components?.Editor ?? InfiniteTableColumnEditor;

      const editor = inEdit ? h(EditorComponent) : null;

      const cellChildren = editor ? [contentNode, editor] : [contentNode];

      const RenderComponent = (
        column as InfiniteTableColumn<any> & {
          components?: { ColumnCell?: any };
        }
      ).components?.ColumnCell;

      if (RenderComponent) {
        return h(RenderComponent, domProps, { default: () => cellChildren });
      }

      return h('div', domProps, cellChildren);
    };
  },
});

export const InfiniteTableColumnCellForVueClassName =
  InfiniteTableColumnCellClassName;

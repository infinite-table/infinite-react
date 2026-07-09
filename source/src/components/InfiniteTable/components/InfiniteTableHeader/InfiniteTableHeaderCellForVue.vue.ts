import {
  defineComponent,
  h,
  inject,
  provide,
  ref,
  shallowRef,
  Teleport,
} from 'vue';
import type { InjectionKey, PropType, ShallowRef, VNodeChild } from 'vue';

import { join } from '../../../../utils/join';
import { stripVar } from '../../../../utils/stripVar';
import { debounce } from '../../../utils/debounce';
import type { DataSourcePropSelectionMode } from '../../../DataSource/types';
import { getColumnApiForColumn } from '../../api/getColumnApi';
import { useCellClassName } from '../../hooks/useCellClassName';
import {
  createColumnPointerDownHandler,
  ProxyPositionRef,
} from '../../hooks/useColumnPointerEventsForVue.vue';
import { InternalVars } from '../../internalVars.css';
import { ThemeVars } from '../../vars.css';
import { HiddenIcon } from '../icons/IconForVue.vue';

import type {
  InfiniteTableColumnHeaderParam,
  InfiniteTableComputedColumn,
  InfiniteTableHeaderCellContextType,
} from '../../types/InfiniteTableColumn';
import type { InfiniteTablePropHeaderOptions } from '../../types/InfiniteTableProps';
import {
  cssEllipsisClassName,
  cursor,
  flex,
  justifyContent,
  overflow,
  userSelect,
} from '../../utilities.css';
import { ColumnCellCls, SelectionCheckboxCls } from '../cell.css';
import { InfiniteCheckBox } from '../CheckBoxForVue.vue';
import { FilterIcon } from '../icons/FilterIconForVue.vue';
import { MenuIcon } from '../icons/MenuIconForVue.vue';
import { SortIcon } from '../icons/SortIconForVue.vue';
import {
  InfiniteTableCellClassName,
  InfiniteTableCellContentClassName,
} from '../InfiniteTableRow/InfiniteTableCellClassNames';

import {
  CellCls,
  HeaderCellRecipe,
  HeaderSortIconCls,
  HeaderCellContentRecipe,
  HeaderCellContentVariantsType,
  HeaderCellProxy,
  HeaderCellProxyRemoveIconRecipe,
  HeaderSortIconRecipe,
} from './header.css';
import { InfiniteTableHeaderCellClassName } from './headerClassName';
import { StringFilterEditor } from '../FilterEditorsForVue.vue';
import {
  InfiniteTableColumnHeaderFilter,
  InfiniteTableColumnHeaderFilterEmpty,
  InfiniteTableFilterOperatorSwitch,
} from './InfiniteTableColumnHeaderFilterForVue.vue';
import { computeColumnResizeForDiff } from './ResizeHandle/columnResizeShared';
import { ResizeHandle } from './ResizeHandle/ResizeHandleForVue.vue';

import { useInfiniteTableContext } from '../../InfiniteTableContextForVue.vue';

const columnWidthAtIndex = stripVar(InternalVars.columnWidthAtIndex);
const columnReorderEffectDurationAtIndex = stripVar(
  InternalVars.columnReorderEffectDurationAtIndex,
);
const columnZIndexAtIndex = stripVar(InternalVars.columnZIndexAtIndex);
const columnVisibilityAtIndex = stripVar(InternalVars.columnVisibilityAtIndex);

/**
 * Vue counterpart of InfiniteTableHeaderCellContext: the current header cell
 * render param, exposed to descendants (custom header render functions).
 */
export const InfiniteHeaderCellInjectionKey: InjectionKey<
  ShallowRef<InfiniteTableHeaderCellContextType<any>>
> = Symbol('InfiniteHeaderCell');

export function useInfiniteHeaderCell<T>() {
  return inject(InfiniteHeaderCellInjectionKey) as ShallowRef<
    InfiniteTableHeaderCellContextType<T>
  >;
}

/**
 * Vue port of defaultRenderSelectionCheckBox from
 * InfiniteTableHeaderCell.tsx - the header (select all) checkbox.
 */
export const defaultRenderSelectionCheckBox = (params: any): VNodeChild => {
  const { allRowsSelected, someRowsSelected, api, dataSourceApi } = params;

  const selected = allRowsSelected ? true : someRowsSelected ? null : false;
  const { components, isTree } = api.getState();
  const CheckBoxCmp = components?.CheckBox || InfiniteCheckBox;

  return h(CheckBoxCmp, {
    domProps: {
      class: SelectionCheckboxCls,
    },
    onChange: (selected: boolean | null) => {
      if (isTree) {
        if (selected) {
          dataSourceApi.treeApi.selectAll();
        } else {
          dataSourceApi.treeApi.deselectAll();
        }
        return;
      }

      if (selected) {
        api.rowSelectionApi.selectAll();
      } else {
        api.rowSelectionApi.deselectAll();
      }
    },
    checked: selected,
  });
};

function renderHeaderCellHook(render: Function, renderParam: any): VNodeChild {
  return render(renderParam) as VNodeChild;
}

const spacer = () => h('div', { class: flex['1'] });

/**
 * Vue sibling of InfiniteTableHeaderCell (Phase 3c subset).
 *
 * Implemented: sort icon + click-to-sort (with multi-sort ctrl/meta append),
 * filter icon, menu icon (opens the column menu via
 * columnApi.toggleContextMenu), header filter row (filter editors + operator
 * switch when showColumnFilters), column resize handles (drag to resize,
 * shift+drag to share space), header render pipeline (renderBag: sortIcon,
 * filterIcon, menuIcon, filterEditor, selectionCheckBox, header +
 * column.renderHeader / header as function), select-all checkbox, same
 * classnames/data attributes as React.
 *
 * Deferred to later slices: drag-to-reorder (the drag proxy).
 */
export const InfiniteTableHeaderCell = defineComponent({
  name: 'InfiniteTableHeaderCell',
  props: {
    column: {
      type: Object as PropType<InfiniteTableComputedColumn<any>>,
      required: true,
    },
    columnsMap: {
      type: Object as PropType<Map<string, InfiniteTableComputedColumn<any>>>,
      required: true,
    },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    headerOptions: {
      type: Object as PropType<InfiniteTablePropHeaderOptions>,
      required: true,
    },
    horizontalLayoutPageIndex: {
      type: Number as PropType<number | null>,
      default: null,
    },
    domRef: {
      type: Function as PropType<(el: HTMLElement | null) => void>,
      required: true,
    },
    allRowsSelected: { type: Boolean, required: true },
    someRowsSelected: { type: Boolean, required: true },
    selectionMode: {
      type: [String, Boolean] as PropType<DataSourcePropSelectionMode>,
      required: true,
    },
  },
  setup(props) {
    const tableContext = useInfiniteTableContext();
    const { api, actions, getState, getComputed, dataSourceContext } =
      tableContext;
    const { getDataSourceState, dataSourceApi, dataSourceActions } =
      dataSourceContext;

    const htmlElementRef: { current: HTMLElement | null } = { current: null };
    const domRefCallback = (el: any) => {
      // when a custom HeaderCell component is used, the ref is the component
      // instance - unwrap it to its root element
      const node = el && el.$el !== undefined ? el.$el : el;
      htmlElementRef.current = (node as HTMLElement) ?? null;
      props.domRef(htmlElementRef.current);
    };

    const renderParamRef = shallowRef<InfiniteTableHeaderCellContextType<any>>(
      null as any,
    );
    provide(InfiniteHeaderCellInjectionKey, renderParamRef);

    const getColumnApi = () =>
      getColumnApiForColumn<any>(props.column, {
        actions,
        api,
        dataSourceActions,
        dataSourceApi,
        getComputed,
        getDataSourceState,
        getDataSourceMasterContext: () =>
          getDataSourceState().getDataSourceMasterContextRef?.current?.() ??
          undefined,
        getState,
      })!;

    // mirrors the debouncedOnFilterValueChange useMemo in the React header
    // cell: recreated when the column id or filterDelay changes
    let debouncedFilterChange: {
      key: string;
      fn: (filterValue: any) => void;
    } | null = null;
    const getDebouncedOnFilterValueChange = () => {
      const columnId = props.column.id;
      const filterDelay = getDataSourceState().filterDelay;
      const key = `${columnId}:${filterDelay}`;

      if (!debouncedFilterChange || debouncedFilterChange.key !== key) {
        const fn = (filterValue: any) => {
          api.setColumnFilter(columnId, filterValue);
        };
        debouncedFilterChange = {
          key,
          fn: filterDelay > 0 ? debounce(fn, { wait: filterDelay }) : fn,
        };
      }
      return debouncedFilterChange.fn;
    };

    // mirrors useColumnPointerEvents: drag-to-reorder for draggable columns,
    // toggle-sorting for plain clicks
    const proxyPosition: ProxyPositionRef = ref(null);
    const dragColumnOutside = ref(false);

    const { onPointerDown } = createColumnPointerDownHandler<any>({
      columnId: props.column.id,
      context: { getState, getComputed, actions, api },
      domRef: htmlElementRef,
      getHorizontalLayoutPageIndex: () => props.horizontalLayoutPageIndex,
      // same default as the React header state (allowColumnHideWhileDragging)
      allowColumnHideOnDrag: true,
      proxyPosition,
      dragColumnOutside,
    });

    return () => {
      const { column, columnsMap, horizontalLayoutPageIndex, headerOptions } =
        props;
      const { allRowsSelected, someRowsSelected, selectionMode } = props;

      const sortInfo = column.computedSortInfo;
      const header = column.header;

      const columnApi = getColumnApi();
      const computedSortable = columnApi.isSortable();

      const alwaysShow = headerOptions.alwaysReserveSpaceForSortIcon;

      const alignFnOrValue = column.headerAlign ?? column.align;
      const align =
        (typeof alignFnOrValue === 'function'
          ? alignFnOrValue({ isHeader: true, column })
          : alignFnOrValue) ?? 'start';

      const verticalAlign =
        (typeof column.verticalAlign === 'function'
          ? column.verticalAlign({ isHeader: true, column })
          : column.verticalAlign) ?? 'center';

      const sortIcon =
        computedSortable && (column.computedSorted || alwaysShow)
          ? h(SortIcon, {
              index: column.computedMultiSort
                ? column.computedSortIndex + 1
                : undefined,
              style: {
                marginInlineStart: ThemeVars.spacing[2],
                marginInlineEnd: ThemeVars.spacing[2],
              },
              className: `${InfiniteTableHeaderCellClassName}__sort-icon ${HeaderSortIconCls} ${HeaderSortIconRecipe(
                {
                  align,
                },
              )}`,
              direction: column.computedSorted
                ? column.computedSortedAsc
                  ? 1
                  : -1
                : 0,
            })
          : null;

      const filtered = column.computedFilterable && column.computedFiltered;
      const filterIcon = filtered ? h(FilterIcon) : null;

      const headerCSSEllipsis =
        column.headerCssEllipsis ?? column.cssEllipsis ?? true;

      // reactive read: the render effect re-runs when the column menu
      // opens/closes for this column
      const columnMenuVisibleForColumnId =
        tableContext.state.value.columnMenuVisibleForColumnId;

      // reactive reads for drag-to-reorder state
      const columnReorderDragColumnId =
        tableContext.state.value.columnReorderDragColumnId;
      const columnReorderInPageIndex =
        tableContext.state.value.columnReorderInPageIndex;

      const dragging = columnReorderDragColumnId === column.id;
      const insideDisabledDraggingPage =
        columnReorderInPageIndex != null
          ? horizontalLayoutPageIndex !== columnReorderInPageIndex
          : false;

      const menuIconProps: Record<string, any> = {
        reserveSpaceWhenHidden: align === 'center',
        menuVisible: columnMenuVisibleForColumnId === column.id,

        style:
          align === 'end'
            ? {
                marginInlineStart: `calc(${ThemeVars.components.HeaderCell.resizeHandleActiveAreaWidth} / 2)`,
                marginInlineEnd: ThemeVars.spacing[2],
              }
            : {
                marginInlineEnd: `calc(${ThemeVars.components.HeaderCell.resizeHandleActiveAreaWidth} / 2)`,
                marginInlineStart: ThemeVars.spacing[2],
              },
        domProps: {
          onMousedown: (event: MouseEvent) => {
            event.stopPropagation();
            columnApi.toggleContextMenu(event.target!);
          },
        },
      };
      const MenuIconCmp =
        (column.components?.MenuIcon as any) ||
        (getState().components?.MenuIcon as any) ||
        MenuIcon;
      const menuIcon = h(MenuIconCmp, menuIconProps);

      // ------- header filter (mirrors the React header cell) -------
      const showColumnFilters = getState().showColumnFilters;
      const dataSourceState = getDataSourceState();
      const filterTypes = dataSourceState.filterTypes;

      const filterTypeKey = column.computedFilterType;
      const filterType = filterTypes[filterTypeKey];

      const operatorName = column.computedFilterable
        ? column.computedFilterValue?.filter.operator ??
          filterType?.defaultOperator
        : undefined;

      const operator =
        column.computedFilterable && filterType
          ? filterType.operators.find((op) => op.name === operatorName)
          : undefined;

      const FilterEditor = (operator?.components?.FilterEditor ||
        filterType?.components?.FilterEditor ||
        column.components?.FilterEditor ||
        StringFilterEditor) as any;

      const FilterOperatorSwitch = (filterType?.components
        ?.FilterOperatorSwitch ||
        column.components?.FilterOperatorSwitch ||
        InfiniteTableFilterOperatorSwitch) as any;

      const columnFilterEditor = column.computedFilterable
        ? h(InfiniteTableColumnHeaderFilter, {
            filterProps: {
              horizontalLayoutPageIndex,
              filterEditor: FilterEditor,
              filterOperatorSwitch: FilterOperatorSwitch,
              operator,
              filterTypes,
              onChange: getDebouncedOnFilterValueChange(),
              columnFilterType: filterTypeKey,
              columnLabel: column.field || column.name || column.id,
              columnFilterValue: column.computedFilterValue,
              columnHeaderHeight: getState().columnHeaderHeight,
            },
          })
        : h(InfiniteTableColumnHeaderFilterEmpty);

      const initialRenderParam: InfiniteTableColumnHeaderParam<any> = {
        horizontalLayoutPageIndex,
        dragging,
        domRef: domRefCallback as any,
        htmlElementRef: htmlElementRef as any,
        renderLocation: 'column-header',
        column,
        columnsMap,
        columnSortInfo: sortInfo,
        columnFilterValue: column.computedFilterValue,
        filtered: column.computedFiltered,
        someRowsSelected,
        allRowsSelected,
        selectionMode,
        api,
        dataSourceApi,
        columnApi,
        renderBag: {
          sortIcon: sortIcon as any,
          filterIcon: filterIcon as any,
          menuIcon: menuIcon as any,
          menuIconProps: menuIconProps as any,
          selectionCheckBox: null,
          header:
            column.header && typeof column.header !== 'function'
              ? column.header
              : column.name,
        },
      } as InfiniteTableColumnHeaderParam<any>;

      const renderParam =
        initialRenderParam as InfiniteTableHeaderCellContextType<any>;
      renderParam.renderBag.filterEditor = columnFilterEditor as any;
      renderParamRef.value = renderParam;

      // ------- header render pipeline (mirrors renderChildren) -------
      const pipelineParam = {
        ...initialRenderParam,
        renderBag: { ...initialRenderParam.renderBag },
      };

      if (column.renderSortIcon) {
        pipelineParam.renderBag.sortIcon = renderHeaderCellHook(
          column.renderSortIcon as Function,
          {
            ...pipelineParam,
            renderBag: { ...pipelineParam.renderBag },
          },
        ) as any;
      }

      if (column.renderFilterIcon) {
        pipelineParam.renderBag.filterIcon = renderHeaderCellHook(
          column.renderFilterIcon as Function,
          {
            ...pipelineParam,
            renderBag: { ...pipelineParam.renderBag },
          },
        ) as any;
      }

      if (typeof column.renderMenuIcon === 'function') {
        const result = renderHeaderCellHook(column.renderMenuIcon as Function, {
          ...pipelineParam,
          renderBag: { ...pipelineParam.renderBag },
        }) as any;

        pipelineParam.renderBag.menuIcon = result
          ? // if it's already a MenuIcon, use as is - otherwise wrap it
            result.type === MenuIconCmp || result.type === MenuIcon
            ? result
            : h(MenuIconCmp, menuIconProps, () => result)
          : null;
      }

      if (column.renderSelectionCheckBox && selectionMode === 'multi-row') {
        // make selectionCheckBox available in the render bag when
        // column.renderSelectionCheckBox is a function, as people might want
        // to use the default value and enhance it
        pipelineParam.renderBag.selectionCheckBox = renderHeaderCellHook(
          defaultRenderSelectionCheckBox,
          {
            ...pipelineParam,
            renderBag: { ...pipelineParam.renderBag },
          },
        ) as any;

        const renderHeaderSelectionCheckBox =
          column.renderHeaderSelectionCheckBox ??
          column.renderSelectionCheckBox;
        if (
          renderHeaderSelectionCheckBox &&
          renderHeaderSelectionCheckBox !== true
        ) {
          pipelineParam.renderBag.selectionCheckBox = renderHeaderCellHook(
            renderHeaderSelectionCheckBox as Function,
            {
              ...pipelineParam,
              renderBag: { ...pipelineParam.renderBag },
            },
          ) as any;
        }
      }

      if (header instanceof Function) {
        pipelineParam.renderBag.header = renderHeaderCellHook(
          header as Function,
          {
            ...pipelineParam,
            renderBag: { ...pipelineParam.renderBag },
          },
        ) as any;
      }

      const headerContent = headerCSSEllipsis
        ? h('div', { class: cssEllipsisClassName }, [
            pipelineParam.renderBag.header as VNodeChild,
          ])
        : (pipelineParam.renderBag.header as VNodeChild);

      const theMenuIcon =
        column.renderMenuIcon === false
          ? null
          : (pipelineParam.renderBag.menuIcon as VNodeChild);

      const all: VNodeChild = [
        // for align center, we push content to middle, except the menu icon
        // - this spacer pushes from start
        align === 'center' ? spacer() : null,
        pipelineParam.renderBag.selectionCheckBox as VNodeChild,

        headerContent,

        pipelineParam.renderBag.sortIcon as VNodeChild,
        pipelineParam.renderBag.filterIcon as VNodeChild,
        // for align center, this spacer pushes from end
        align === 'center' ? spacer() : null,

        // for align non center, we push the menu icon at the end
        align !== 'center' ? spacer() : null,
        theMenuIcon,
      ];

      const children: VNodeChild = column.renderHeader
        ? renderHeaderCellHook(column.renderHeader as Function, {
            ...pipelineParam,
            renderBag: { ...pipelineParam.renderBag, all: all as any },
          })
        : all;

      // ------- style + classnames (same contract as React) -------
      let style: Record<string, any> = {
        height: `${props.height}px`,
      };

      if (column.headerStyle) {
        style =
          typeof column.headerStyle === 'function'
            ? { ...style, ...(column.headerStyle(renderParam as any) || {}) }
            : { ...style, ...column.headerStyle };
      }

      const headerClassName =
        typeof column.headerClassName === 'function'
          ? column.headerClassName(renderParam as any)
          : column.headerClassName;

      const zIndex = `var(${columnZIndexAtIndex}-${column.computedVisibleIndex})`;
      style.zIndex = zIndex;
      style.visibility = `var(${columnVisibilityAtIndex}-${column.computedVisibleIndex}, visible)`;
      style.width = `var(${columnWidthAtIndex}-${column.computedVisibleIndex})`;
      style.transition = `transform var(${columnReorderEffectDurationAtIndex}-${column.computedVisibleIndex}, 0s)`;

      const contentRecipeVariants: HeaderCellContentVariantsType = {
        filtered: column.computedFiltered,
        verticalAlign,
        align,
      };

      const dataAttrs = {
        'data-field': `${column.field || ''}`,
        'data-column-id': column.id,
        'data-header-align': align,
        'data-name': 'HeaderCell',
        'data-sort': column.computedSortedAsc
          ? 'asc'
          : column.computedSortedDesc
          ? 'desc'
          : 'none',
        'data-sort-index': `${column.computedSortIndex ?? -1}`,
      };

      const className = join(
        InfiniteTableHeaderCellClassName,
        userSelect.none,
        computedSortable ? cursor.pointer : '',
        headerClassName,
        useCellClassName(
          column,
          [InfiniteTableHeaderCellClassName, InfiniteTableCellClassName],
          HeaderCellRecipe,
          {
            dragging,
            insideDisabledDraggingPage,
            align,
            verticalAlign,
            rowSelected: false,
            cellSelected: false,
            rowDisabled: false,
            zebra: false,
            rowActive: false,
            firstRow: true,
            firstRowInHorizontalLayoutPage: true,
            treeNode: false,
            groupCell: false,
            groupRow: false,
            rowExpanded: false,
          },
        ),
        CellCls,
        InfiniteTableCellClassName,
        ColumnCellCls,
      );

      const contentNode = h(
        'div',
        {
          class: join(
            InfiniteTableCellContentClassName,
            headerCSSEllipsis ? cssEllipsisClassName : overflow.hidden,
            HeaderCellContentRecipe(contentRecipeVariants),
            justifyContent[align],
          ),
          style: showColumnFilters
            ? { height: `${props.height / 2}px` }
            : undefined,
        },
        [children],
      );

      // ------- resize handle (mirrors useColumnResizeHandle) -------
      const computeResizeParam = (resizeParam: {
        diff: number;
        shareSpaceOnResize: boolean;
      }) =>
        computeColumnResizeForDiff({
          context: { getState, getComputed },
          column,
          diff: resizeParam.diff,
          shareSpaceOnResize: resizeParam.shareSpaceOnResize,
        });

      const resizeHandle = column.computedResizable
        ? h(ResizeHandle, {
            horizontalLayoutPageIndex,
            columns: getComputed().computedVisibleColumns,
            columnIndex: column.computedVisibleIndex,
            computeResize: computeResizeParam,
            onResize: (resizeParam: {
              diff: number;
              shareSpaceOnResize: boolean;
            }) => {
              const { columnSizing, reservedWidth } =
                computeResizeParam(resizeParam);

              if (!resizeParam.shareSpaceOnResize) {
                actions.viewportReservedWidth = reservedWidth;
              }
              actions.columnSizing = columnSizing;
            },
          })
        : null;

      // mirrors afterChildren in the React header cell
      const afterChildren = [
        showColumnFilters ? columnFilterEditor : null,
        resizeHandle,
      ];

      const domProps: Record<string, any> = {
        ref: domRefCallback,
        ...dataAttrs,
        // this is used by the headless renderer - look for #updatezindex
        'data-z-index': zIndex,
        style,
        class: className,
        onPointerdown: onPointerDown,
      };

      // ------- drag proxy (mirrors draggingProxy in the React header cell) -------
      let draggingProxy: VNodeChild = null;
      const portalNode = getState().portalDOMRef.current;

      if (dragging && proxyPosition.value && portalNode) {
        draggingProxy = h(Teleport as any, { to: portalNode }, [
          h(
            'div',
            {
              key: column.id,
              class: `${InfiniteTableHeaderCellClassName}Proxy ${HeaderCellProxy}`,
              style: {
                height: `${props.height}px`,
                width: `${props.width}px`,
                left: `${proxyPosition.value.left ?? 0}px`,
                top: `${proxyPosition.value.top ?? 0}px`,
              },
            },
            [
              h(
                'div',
                {
                  class: HeaderCellProxyRemoveIconRecipe({
                    visible: dragColumnOutside.value,
                  }),
                },
                [h(HiddenIcon, { size: 16 })],
              ),
              pipelineParam.renderBag.header as VNodeChild,
            ],
          ),
        ]);
      }

      const HeaderCellComponent = column.components?.HeaderCell;
      if (HeaderCellComponent) {
        return [
          h(HeaderCellComponent as any, domProps, {
            default: () => [contentNode, afterChildren],
          }),
          draggingProxy,
        ];
      }

      return [h('div', domProps, [contentNode, afterChildren]), draggingProxy];
    };
  },
});

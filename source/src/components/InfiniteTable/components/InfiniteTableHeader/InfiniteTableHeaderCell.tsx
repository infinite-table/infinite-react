import * as React from 'react';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { keyMirror } from '../../../../utils/keyMirror';

import { join } from '../../../../utils/join';
import { stripVar } from '../../../../utils/stripVar';
import { defaultFilterTypes } from '../../../DataSource/defaultFilterTypes';
import {
  useDataSourceState,
  useDataSourceContextValue,
} from '../../../DataSource/publicHooks/useDataSourceState';
import { DataSourcePropFilterTypes } from '../../../DataSource/types';
import { setupResizeObserver } from '../../../ResizeObserver';
import { debounce } from '../../../utils/debounce';
import { getColumnApiForColumn } from '../../api/getColumnApi';
import { useCellClassName } from '../../hooks/useCellClassName';
import { useColumnPointerEvents } from '../../hooks/useColumnPointerEvents';
import { useInfiniteTable } from '../../hooks/useInfiniteTable';
import { InternalVars } from '../../internalVars.css';
import { ThemeVars } from '../../vars.css';

import type {
  InfiniteTableColumnHeaderParam,
  InfiniteTableColumnHeaderRenderFunction,
  InfiniteTableComputedColumn,
  InfiniteTableHeaderCellContextType,
} from '../../types/InfiniteTableColumn';
import {
  cssEllipsisClassName,
  cursor,
  flex,
  justifyContent,
  userSelect,
} from '../../utilities.css';
import { RenderHeaderCellHookComponent } from '../../utils/RenderHookComponentForInfinite';
import { SelectionCheckboxCls } from '../cell.css';
import { InfiniteCheckBox } from '../CheckBox';
import { StringFilterEditor } from '../FilterEditors';
import { FilterIcon } from '../icons/FilterIcon';
import { MenuIcon, MenuIconProps } from '../icons/MenuIcon';
import { SortIcon } from '../icons/SortIcon';
import {
  InfiniteTableCell,
  InfiniteTableCellClassName,
} from '../InfiniteTableRow/InfiniteTableCell';
import { InfiniteTableHeaderCellProps } from '../InfiniteTableRow/InfiniteTableCellTypes';

import {
  CellCls,
  HeaderCellRecipe,
  HeaderCellProxy,
  HeaderSortIconCls,
  HeaderCellContentRecipe,
  HeaderCellContentVariantsType,
  HeaderSortIconRecipe,
} from './header.css';
import {
  InfiniteTableColumnHeaderFilter,
  InfiniteTableColumnHeaderFilterEmpty,
  InfiniteTableFilterOperatorSwitch,
} from './InfiniteTableColumnHeaderFilter';
import { useColumnResizeHandle } from './useColumnResizeHandle';

export const defaultRenderSelectionCheckBox: InfiniteTableColumnHeaderRenderFunction<
  any
> = (params) => {
  const { allRowsSelected, someRowsSelected, api, dataSourceApi } = params;

  const selected = allRowsSelected ? true : someRowsSelected ? null : false;
  const { components, isTree } = api.getState();
  const CheckBoxCmp = components?.CheckBox || InfiniteCheckBox;

  return (
    <CheckBoxCmp
      domProps={{
        className: SelectionCheckboxCls,
      }}
      onChange={(selected) => {
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
      }}
      checked={selected}
    />
  );
};

export const InfiniteTableHeaderCellContext = React.createContext<
  InfiniteTableHeaderCellContextType<any>
>(null as any as InfiniteTableHeaderCellContextType<any>);

import { InfiniteTableHeaderCellClassName } from './headerClassName';
export { InfiniteTableHeaderCellClassName };

export function getColumnFilterType<T>(
  column: InfiniteTableComputedColumn<T>,
  filterTypes: DataSourcePropFilterTypes<T> = defaultFilterTypes,
) {
  let columnFilterType: string =
    column.computedFilterValue?.filter.type || column.filterType || '';

  if (!columnFilterType) {
    let colFilterType = column.type;

    if (colFilterType && !Array.isArray(colFilterType)) {
      colFilterType = [colFilterType];
    }

    if (colFilterType) {
      columnFilterType = (colFilterType! as string[]).reduce((acc, type) => {
        if (!acc && filterTypes[type]) {
          return type;
        }
        return acc;
      }, '');
    }
  }

  if (!filterTypes[columnFilterType]) {
    columnFilterType = Object.keys(filterTypes)[0] || 'string';
  }

  return columnFilterType;
}

const columnZIndexAtIndex = stripVar(InternalVars.columnZIndexAtIndex);

const spacer = <div className={flex['1']}></div>;

export const InfiniteHeaderCellDataAttributes = keyMirror({
  'data-name': ``,
  'data-field': ``,
  'data-header-align': '',
  'data-column-id': '',
  'data-sort': '',
  'data-sort-index': '',
});
export function InfiniteTableHeaderCell<T>(
  props: InfiniteTableHeaderCellProps<T>,
) {
  const column: InfiniteTableComputedColumn<T> = props.column;

  const {
    api,
    getComputed,
    getState,
    actions,
    state: {
      showColumnFilters,
      components,
      portalDOMRef,
      columnHeaderHeight,
      columnReorderDragColumnId,
      columnMenuVisibleForColumnId,
      columnReorderInPageIndex,
    },
    getDataSourceMasterContext,
  } = useInfiniteTable<T>();

  const {
    api: dataSourceApi,
    componentActions: dataSourceActions,
    getState: getDataSourceState,
    componentState: { filterDelay, filterTypes },
  } = useDataSourceContextValue<T>();

  const { allRowsSelected, someRowsSelected, selectionMode } =
    useDataSourceState<T>();

  const horizontalLayoutPageIndex = props.horizontalLayoutPageIndex;
  const dragging = columnReorderDragColumnId === column.id;

  const insideDisabledDraggingPage =
    columnReorderInPageIndex != null
      ? horizontalLayoutPageIndex !== columnReorderInPageIndex
      : false;
  const { onResize, height, width, headerOptions, columnsMap } = props;

  const sortInfo = column.computedSortInfo;

  const header = column.header;

  const ref = useCallback(
    (node: HTMLElement | null) => {
      domRef.current = node;
      props.domRef?.(node);
    },
    [props.domRef],
  );

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

  const columnApi = getColumnApiForColumn(column, {
    actions,
    api,
    dataSourceActions,
    dataSourceApi,
    getComputed,
    getDataSourceState,
    getDataSourceMasterContext,
    getState,
  })!;

  const computedSortable = columnApi.isSortable();
  const sortIcon =
    computedSortable && (column.computedSorted || alwaysShow) ? (
      <SortIcon
        index={
          column.computedMultiSort ? column.computedSortIndex + 1 : undefined
        }
        style={{
          marginInlineStart: ThemeVars.spacing[2],
          marginInlineEnd: ThemeVars.spacing[2],
        }}
        className={`${InfiniteTableHeaderCellClassName}__sort-icon ${HeaderSortIconCls} ${HeaderSortIconRecipe(
          {
            align,
          },
        )}`}
        direction={
          column.computedSorted ? (column.computedSortedAsc ? 1 : -1) : 0
        }
      />
    ) : null;

  const filtered = column.computedFilterable && column.computedFiltered;
  const filterIcon = filtered ? <FilterIcon /> : null;

  const headerCSSEllipsis =
    column.headerCssEllipsis ?? column.cssEllipsis ?? true;

  const menuIconProps: MenuIconProps = {
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
      onMouseDown: (event) => {
        event.stopPropagation();
        columnApi.toggleContextMenu(event.target);
      },
    },
  };
  const MenuIconCmp =
    column.components?.MenuIcon || components?.MenuIcon || MenuIcon;
  const menuIcon = <MenuIconCmp {...menuIconProps} />;

  const domRef = useRef<HTMLElement | null>(null);

  const initialRenderParam: InfiniteTableColumnHeaderParam<T> = {
    horizontalLayoutPageIndex,
    dragging,
    domRef: ref,
    htmlElementRef: domRef,
    insideColumnMenu: false,
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
      sortIcon,
      filterIcon,
      menuIcon,
      menuIconProps,
      selectionCheckBox: null,
      header:
        column.header && typeof column.header !== 'function'
          ? column.header
          : column.name,
    },
  };
  const renderParam = initialRenderParam;

  const renderChildren = () => {
    // #header-rendering-pipeline-run-twice-fix
    // if you uncomment this, all the rendering pipeline below
    // will be flawed!!!
    // for whatever reason, this renderChildren() fn is called twice
    // probably because of React.StrictMode (it's called twice for the same outer closure run)
    // so removing the following 4 lines would result
    // in renderParam.renderBag.sortIcon/menuIcon/etc
    // to be assigned twice, and the second time, it's assigned to the previous run's value
    // and not to the default icon/value
    const renderParam = {
      ...initialRenderParam,
      renderBag: { ...initialRenderParam.renderBag },
    };
    if (column.renderSortIcon) {
      renderParam.renderBag.sortIcon = (
        <RenderHeaderCellHookComponent
          render={column.renderSortIcon}
          renderParam={{
            ...renderParam,
            renderBag: {
              // if #header-rendering-pipeline-run-twice-fix would not be applied
              // at the second run, renderParam.renderBag.sortIcon would have the value
              // of the previous run, so a <RenderHeaderCellHookComponent> would be rendered
              // which would make this render the sort icon twice
              ...renderParam.renderBag,
            },
          }}
        />
      );
    }

    if (column.renderFilterIcon) {
      renderParam.renderBag.filterIcon = (
        <RenderHeaderCellHookComponent
          render={column.renderFilterIcon}
          renderParam={{
            ...renderParam,
            renderBag: { ...renderParam.renderBag },
          }}
        />
      );
    }

    if (typeof column.renderMenuIcon === 'function') {
      renderParam.renderBag.menuIcon = (
        <RenderHeaderCellHookComponent
          render={(param: InfiniteTableHeaderCellContextType<T>) => {
            if (typeof column.renderMenuIcon !== 'function') {
              return null;
            }
            const result = column.renderMenuIcon(param);

            if (result) {
              //@ts-ignore if it's the same component, we don't need to wrap it

              if (result.type === MenuIconCmp || result.type === MenuIcon) {
                return result;
              }
              // otherwise wrap everything in a MenuIcon
              return <MenuIconCmp {...menuIconProps}>{result}</MenuIconCmp>;
            }
            return null;
          }}
          renderParam={{
            ...renderParam,
            renderBag: {
              ...renderParam.renderBag,
            },
          }}
        />
      );
    }

    if (column.renderSelectionCheckBox && selectionMode === 'multi-row') {
      // make selectionCheckBox available in the render bag
      // when we have column.renderSelectionCheckBox defined as a function
      // as people might want to use the default value
      // and enhance it

      renderParam.renderBag.selectionCheckBox = (
        <RenderHeaderCellHookComponent
          render={defaultRenderSelectionCheckBox}
          renderParam={{
            ...renderParam,
            renderBag: {
              ...renderParam.renderBag,
            },
          }}
        />
      );

      const renderHeaderSelectionCheckBox =
        column.renderHeaderSelectionCheckBox ?? column.renderSelectionCheckBox;
      if (
        renderHeaderSelectionCheckBox &&
        renderHeaderSelectionCheckBox !== true
      ) {
        renderParam.renderBag.selectionCheckBox = (
          <RenderHeaderCellHookComponent
            render={renderHeaderSelectionCheckBox}
            renderParam={{
              ...renderParam,
              renderBag: {
                ...renderParam.renderBag,
              },
            }}
          />
        );
      }
    }

    if (header instanceof Function) {
      renderParam.renderBag.header = (
        <RenderHeaderCellHookComponent
          render={header}
          renderParam={{
            ...renderParam,
            renderBag: { ...renderParam.renderBag },
          }}
        />
      );
    }

    const theMenuIcon =
      column.renderMenuIcon === false ? null : renderParam.renderBag.menuIcon;

    const headerContent = headerCSSEllipsis ? (
      <div className={cssEllipsisClassName}>{renderParam.renderBag.header}</div>
    ) : (
      renderParam.renderBag.header
    );

    const all = (
      <>
        {/* for align center, we push content to middle, except the menu icon
    this spacer pushes from start */}
        {align === 'center' ? spacer : null}
        {renderParam.renderBag.selectionCheckBox}

        {headerContent}

        {renderParam.renderBag.sortIcon}
        {renderParam.renderBag.filterIcon}
        {/* for align center, we push content to middle, except the menu icon
    this spacer pushes from end */}
        {align === 'center' ? spacer : null}

        {/* for align non center, we push menu icon at the end */}
        {align !== 'center' ? spacer : null}
        {theMenuIcon}
      </>
    );

    if (column.renderHeader) {
      return (
        <RenderHeaderCellHookComponent
          render={column.renderHeader}
          renderParam={{
            ...renderParam,
            renderBag: { ...renderParam.renderBag, all },
          }}
        />
      );
    }

    return all;
  };

  useEffect(() => {
    let clearOnResize: null | (() => void) = null;
    const node = domRef.current;

    if (onResize && node) {
      clearOnResize = setupResizeObserver(node, onResize);
    }

    return () => {
      clearOnResize?.();
    };
  }, [domRef.current, props.onResize]);

  let style: React.CSSProperties = {
    // height: column.computedFiltered? height*2: height,
    height: height,
  };

  if (column.headerStyle) {
    style =
      typeof column.headerStyle === 'function'
        ? { ...style, ...(column.headerStyle(renderParam) || {}) }
        : { ...style, ...column.headerStyle };
  }

  const headerClassName =
    typeof column.headerClassName === 'function'
      ? column.headerClassName(renderParam)
      : column.headerClassName;

  const { onPointerDown, proxyPosition } = useColumnPointerEvents({
    columnId: column.id,
    domRef,
    horizontalLayoutPageIndex,
  });

  let draggingProxy = null;

  if (dragging && proxyPosition) {
    draggingProxy = (
      <div
        key={column.id}
        className={`${InfiniteTableHeaderCellClassName}Proxy ${HeaderCellProxy}`}
        style={{
          position: 'absolute',
          height,
          width,
          left: proxyPosition!.left ?? 0,

          top: proxyPosition!.top ?? 0,
          zIndex: 1_000_000_000,
        }}
      >
        {renderParam.renderBag.header}
      </div>
    );

    draggingProxy = createPortal(draggingProxy, portalDOMRef.current!);
  }
  const ContextProvider =
    InfiniteTableHeaderCellContext.Provider as React.Provider<
      InfiniteTableHeaderCellContextType<T>
    >;

  const contentRecipeVariants: HeaderCellContentVariantsType = {
    filtered: column.computedFiltered,
    verticalAlign,
    align,
  };

  const debouncedOnFilterValueChange = React.useMemo(() => {
    const fn = (filterValue: any) => {
      api.setColumnFilter(column.id, filterValue);
    };

    if (filterDelay > 0) {
      return debounce(fn, { wait: filterDelay });
    }

    return fn;
  }, [filterDelay, column.id]);

  const filterTypeKey = column.computedFilterType;
  const filterType = filterTypes[filterTypeKey];

  const operatorName = column.computedFilterable
    ? column.computedFilterValue?.filter.operator ?? filterType?.defaultOperator
    : undefined;

  const operator =
    column.computedFilterable && filterType
      ? filterType.operators.find((op) => op.name === operatorName)
      : undefined;

  const FilterEditor = (operator?.components?.FilterEditor ||
    filterType?.components?.FilterEditor ||
    column.components?.FilterEditor ||
    StringFilterEditor) as () => React.JSX.Element | null;

  const FilterOperatorSwitch =
    filterType?.components?.FilterOperatorSwitch ||
    column.components?.FilterOperatorSwitch;

  const resizeHandle = useColumnResizeHandle(column, {
    horizontalLayoutPageIndex,
  });

  const zIndex = `var(${columnZIndexAtIndex}-${column.computedVisibleIndex})`;
  style.zIndex = zIndex;

  const dataAttrs: {
    [K in keyof typeof InfiniteHeaderCellDataAttributes]: string;
  } = {
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

  const columnFilterEditor = column.computedFilterable ? (
    <InfiniteTableColumnHeaderFilter
      horizontalLayoutPageIndex={horizontalLayoutPageIndex}
      filterEditor={FilterEditor}
      filterOperatorSwitch={
        FilterOperatorSwitch ?? InfiniteTableFilterOperatorSwitch
      }
      operator={operator}
      filterTypes={filterTypes}
      onChange={debouncedOnFilterValueChange}
      columnFilterType={filterTypeKey}
      columnLabel={column.field || column.name || column.id}
      columnFilterValue={column.computedFilterValue}
      columnHeaderHeight={columnHeaderHeight}
    />
  ) : (
    <InfiniteTableColumnHeaderFilterEmpty />
  );

  renderParam.renderBag.filterEditor = columnFilterEditor;

  return (
    <ContextProvider value={renderParam}>
      <InfiniteTableCell<T>
        domRef={ref}
        horizontalLayoutPageIndex={props.horizontalLayoutPageIndex}
        cellType="header"
        column={column}
        {...dataAttrs}
        // this is used by ReactHeadlessRenderer - look for #updatezindex
        data-z-index={zIndex}
        style={style}
        width={width}
        onPointerDown={onPointerDown}
        contentClassName={join(
          HeaderCellContentRecipe(contentRecipeVariants),
          justifyContent[align],
        )}
        contentStyle={showColumnFilters ? { height: height / 2 } : undefined}
        className={join(
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
        )}
        cssEllipsis={headerCSSEllipsis}
        afterChildren={
          <>
            {showColumnFilters ? columnFilterEditor : null}
            {resizeHandle}
          </>
        }
        renderChildren={renderChildren}
      />
      {draggingProxy}
    </ContextProvider>
  );
}

export function useInfiniteHeaderCell<T>() {
  const result = useContext(
    InfiniteTableHeaderCellContext,
  ) as InfiniteTableHeaderCellContextType<T>;

  return result;
}

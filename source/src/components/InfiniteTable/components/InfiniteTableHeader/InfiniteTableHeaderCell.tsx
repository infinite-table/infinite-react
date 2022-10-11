import * as React from 'react';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { join } from '../../../../utils/join';
import { stripVar } from '../../../../utils/stripVar';
import { defaultFilterTypes } from '../../../DataSource/defaultFilterTypes';
import {
  useDataSource,
  useDataSourceContextValue,
} from '../../../DataSource/publicHooks/useDataSource';
import {
  DataSourceFilterValueItem,
  DataSourcePropFilterTypes,
} from '../../../DataSource/types';
import { setupResizeObserver } from '../../../ResizeObserver';
import { debounce } from '../../../utils/debounce';
import { useCellClassName } from '../../hooks/useCellClassName';
import { useColumnPointerEvents } from '../../hooks/useColumnPointerEvents';
import { useInfiniteTable } from '../../hooks/useInfiniteTable';
import { internalProps } from '../../internalProps';
import { InternalVars, ThemeVars } from '../../theme.css';
import { InfiniteTableFilterEditorProps } from '../../types';
import type {
  InfiniteTableColumnHeaderParam,
  InfiniteTableColumnHeaderRenderFunction,
  InfiniteTableComputedColumn,
  InfiniteTableHeaderCellContextType,
} from '../../types/InfiniteTableColumn';
import { cursor, flex, justifyContent, userSelect } from '../../utilities.css';
import { RenderHeaderCellHookComponent } from '../../utils/RenderHookComponentForInfinite';
import { SelectionCheckboxCls } from '../cell.css';
import { InfiniteCheckBox } from '../CheckBox';
import { defaultFilterEditors, StringFilterEditor } from '../FilterEditors';
import { MenuIcon } from '../icons/MenuIcon';
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
} from './InfiniteTableColumnHeaderFilter';
import { useColumnResizeHandle } from './useColumnResizeHandle';

export const defaultRenderSelectionCheckBox: InfiniteTableColumnHeaderRenderFunction<
  any
> = (params) => {
  const { allRowsSelected, someRowsSelected, api } = params;

  const selected = allRowsSelected ? true : someRowsSelected ? null : false;

  return (
    <InfiniteCheckBox
      domProps={{
        className: SelectionCheckboxCls,
      }}
      onChange={(selected) => {
        if (selected) {
          api.selectionApi.selectAll();
        } else {
          api.selectionApi.deselectAll();
        }
      }}
      checked={selected}
    />
  );
};

export const InfiniteTableHeaderCellContext = React.createContext<
  InfiniteTableHeaderCellContextType<any>
>(null as any as InfiniteTableHeaderCellContextType<any>);

const { rootClassName } = internalProps;

export const InfiniteTableHeaderCellClassName = `${rootClassName}HeaderCell`;

export function getColumnFilterType<T>(
  column: InfiniteTableComputedColumn<T>,
  filterTypes: DataSourcePropFilterTypes<T> = defaultFilterTypes,
) {
  let columnFilterType: string =
    column.computedFilterValue?.filterType || column.filterType || '';

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
export function InfiniteTableHeaderCell<T>(
  props: InfiniteTableHeaderCellProps<T>,
) {
  const column: InfiniteTableComputedColumn<T> = props.column;

  const {
    computed: { showColumnFilters },
    imperativeApi: api,
    componentState: {
      portalDOMRef,
      columnHeaderHeight,
      filterEditors,
      columnReorderDragColumnId,
      onColumnMenuClick,
    },
  } = useInfiniteTable<T>();

  const { allRowsSelected, someRowsSelected, selectionMode } =
    useDataSource<T>();

  const dragging = columnReorderDragColumnId === column.id;

  const { onResize, height, width, headerOptions, columnsMap } = props;

  const sortInfo = column.computedSortInfo;

  let header = column.header;

  const ref = useCallback(
    (node: HTMLElement | null) => {
      domRef.current = node;
      props.domRef?.(node);
    },
    [props.domRef],
  );

  const alwaysShow = headerOptions.alwaysReserveSpaceForSortIcon;

  const sortIcon =
    column.computedSortable && (column.computedSorted || alwaysShow) ? (
      <SortIcon
        index={
          column.computedMultiSort ? column.computedSortIndex + 1 : undefined
        }
        className={`${InfiniteTableHeaderCellClassName}__sort-icon ${HeaderSortIconCls} ${HeaderSortIconRecipe(
          {
            align: column.align || 'start',
          },
        )}`}
        direction={
          column.computedSorted ? (column.computedSortedAsc ? 1 : -1) : 0
        }
      />
    ) : null;

  const align = column.align || 'start';

  const menuIcon = (
    <MenuIcon
      style={{
        [align === 'end'
          ? 'marginInlineStart'
          : 'marginInlineEnd']: `calc(${ThemeVars.components.HeaderCell.resizeHandleActiveAreaWidth} / 2)`,
      }}
      domProps={{
        onClick: (event) => {
          onColumnMenuClick({
            target: event.target as HTMLElement,
            column,
          });
        },
      }}
    />
  );

  const renderParam: InfiniteTableColumnHeaderParam<T> = {
    dragging,
    domRef: ref,
    column,
    columnsMap,
    columnSortInfo: sortInfo,
    columnFilterValue: column.computedFilterValue,
    someRowsSelected,
    allRowsSelected,
    selectionMode,
    api,
    renderBag: {
      sortIcon,
      menuIcon:
        align === 'end' ? (
          <>
            {menuIcon}
            {spacer}
          </>
        ) : (
          <>
            {spacer}
            {menuIcon}
          </>
        ),
      selectionCheckBox: null,
      header:
        column.header && typeof column.header !== 'function'
          ? column.header
          : column.name,
    },
  };

  const renderChildren = () => {
    if (column.renderSortIcon) {
      renderParam.renderBag.sortIcon = (
        <RenderHeaderCellHookComponent
          render={column.renderSortIcon}
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
          render={column.renderMenuIcon}
          renderParam={renderParam}
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
          renderParam={renderParam}
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
              renderBag: { ...renderParam.renderBag },
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

    if (column.renderHeader) {
      return (
        <RenderHeaderCellHookComponent
          render={column.renderHeader}
          renderParam={renderParam}
        />
      );
    }

    const theMenuIcon =
      column.renderMenuIcon === false ? null : align === 'end' ? (
        <>
          {renderParam.renderBag.menuIcon}
          {spacer}
        </>
      ) : (
        <>
          {spacer}
          {renderParam.renderBag.menuIcon}
        </>
      );

    return (
      <>
        {align === 'end' ? theMenuIcon : null}
        {align !== 'end' ? renderParam.renderBag.selectionCheckBox : null}
        {align === 'end' ? renderParam.renderBag.sortIcon : null}

        {renderParam.renderBag.header}

        {align !== 'end' ? renderParam.renderBag.sortIcon : null}
        {align === 'end' ? renderParam.renderBag.selectionCheckBox : null}
        {align !== 'end' ? theMenuIcon : null}
      </>
    );
  };

  const domRef = useRef<HTMLElement | null>(null);

  const {
    componentActions: dataSourceActions,
    getState: getDataSourceState,
    componentState: { filterDelay, filterTypes },
  } = useDataSourceContextValue<T>();

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
  };

  const setFilterValue = useCallback(
    (filterValue: DataSourceFilterValueItem<T>) => {
      const state = getDataSourceState();
      let newFilterValue = state.filterValue ?? [];

      let found = false;
      newFilterValue = newFilterValue.map((currentFilterValue) => {
        if (
          (filterValue.id && currentFilterValue.id === filterValue.id) ||
          (filterValue.field && currentFilterValue.field === column.field)
        ) {
          found = true;
          return filterValue;
        }

        return currentFilterValue;
      });

      if (!found) {
        newFilterValue.push(filterValue);
      }

      // we now filter away the empty filter values
      newFilterValue = newFilterValue.filter((filterValue) => {
        const filterType = filterTypes[filterValue.filterType];
        if (
          !filterType ||
          filterType.emptyValues.has(filterValue.filterValue)
        ) {
          return false;
        }
        return true;
      });

      dataSourceActions.filterValue = newFilterValue;
    },
    [column, filterTypes],
  );

  const debouncedOnFilterValueChange = React.useMemo(() => {
    const fn = (filterValue: any) => {
      let newFilterValueForColumn: DataSourceFilterValueItem<T>;
      if (column.computedFilterValue) {
        newFilterValueForColumn = {
          ...column.computedFilterValue,
        };
      } else {
        const filterType = column.computedFilterType;
        const filterValueForColumn: Partial<DataSourceFilterValueItem<T>> = {
          filterType,
          operator: filterTypes[filterType].defaultOperator,
          filterValue,
          valueGetter: column.valueGetter,
        };
        if (column.field) {
          filterValueForColumn.field = column.field;
        } else {
          filterValueForColumn.id = column.id;
        }

        newFilterValueForColumn =
          filterValueForColumn as DataSourceFilterValueItem<T>;
      }

      newFilterValueForColumn.filterValue = filterValue;

      setFilterValue(newFilterValueForColumn);
    };

    if (filterDelay > 0) {
      return debounce(fn, { wait: filterDelay });
    }

    return fn;
  }, [
    filterDelay,
    setFilterValue,
    column.computedFilterValue,
    column.id,
    column.field,
    column.computedFilterType,
  ]);

  const filterType = column.computedFilterType;

  const FilterEditor = (filterEditors[filterType] ||
    defaultFilterEditors[filterType] ||
    StringFilterEditor) as React.FC<InfiniteTableFilterEditorProps<T>>;

  const resizeHandle = useColumnResizeHandle(column);

  const zIndex = `var(${columnZIndexAtIndex}-${column.computedVisibleIndex})`;
  style.zIndex = zIndex;
  return (
    <ContextProvider value={renderParam}>
      <InfiniteTableCell<T>
        domRef={ref}
        cellType="header"
        column={column}
        data-name={`HeaderCell`}
        data-column-id={column.id}
        // this is used by ReactHeadlessRenderer - look for #updatezindex
        data-z-index={zIndex}
        style={style}
        width={width}
        onPointerDown={onPointerDown}
        contentClassName={join(
          HeaderCellContentRecipe(contentRecipeVariants),
          justifyContent[column.align ?? 'start'],
        )}
        contentStyle={showColumnFilters ? { height: height / 2 } : undefined}
        className={join(
          InfiniteTableHeaderCellClassName,
          userSelect.none,
          column.computedSortable ? cursor.pointer : '',
          headerClassName,

          useCellClassName(
            column,
            [InfiniteTableHeaderCellClassName, InfiniteTableCellClassName],
            HeaderCellRecipe,
            {
              dragging,
              rowSelected: false,
              zebra: false,
              rowActive: false,
              groupRow: false,
              rowExpanded: false,
            },
          ),
          CellCls,
        )}
        cssEllipsis={column.headerCssEllipsis ?? column.cssEllipsis ?? true}
        afterChildren={
          <>
            {showColumnFilters ? (
              column.computedFilterable ? (
                <InfiniteTableColumnHeaderFilter
                  filterEditor={FilterEditor}
                  filterTypes={filterTypes}
                  onChange={debouncedOnFilterValueChange}
                  columnFilterType={filterType}
                  columnLabel={column.field || column.name || column.id}
                  columnFilterValue={column.computedFilterValue}
                  columnHeaderHeight={columnHeaderHeight}
                />
              ) : (
                <InfiniteTableColumnHeaderFilterEmpty />
              )
            ) : null}
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

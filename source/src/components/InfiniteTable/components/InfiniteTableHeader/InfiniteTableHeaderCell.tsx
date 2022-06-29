import * as React from 'react';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { join } from '../../../../utils/join';
import { stripVar } from '../../../../utils/stripVar';
import { defaultFilterTypes } from '../../../DataSource/defaultFilterTypes';
import { useDataSourceContextValue } from '../../../DataSource/publicHooks/useDataSource';
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
import { InternalVars } from '../../theme.css';
import { InfiniteTableFilterEditorProps } from '../../types';
import type {
  InfiniteTableColumnHeaderParams,
  InfiniteTableComputedColumn,
  InfiniteTableHeaderCellContextType,
} from '../../types/InfiniteTableColumn';
import { cursor, justifyContent, userSelect } from '../../utilities.css';
import { RenderHookComponent } from '../../utils/RenderHookComponent';
import { defaultFilterEditors, StringFilterEditor } from '../FilterEditors';
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
const columnOffsetAtIndex = stripVar(InternalVars.columnOffsetAtIndex);

export function InfiniteTableHeaderCell<T>(
  props: InfiniteTableHeaderCellProps<T>,
) {
  const column: InfiniteTableComputedColumn<T> = props.column;
  const columns: Map<string, InfiniteTableComputedColumn<T>> = props.columns;
  const { onResize, height, width, headerOptions } = props;

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
  const sortTool =
    column.computedSorted || alwaysShow ? (
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

  const renderParam: InfiniteTableColumnHeaderParams<T> = {
    domRef: ref,
    column,
    columnSortInfo: sortInfo,
    columnFilterValue: column.computedFilterValue,
    sortTool,
  };

  const align = column.align || 'start';

  const renderChildren = () => {
    if (header instanceof Function) {
      header = (
        <RenderHookComponent render={header} renderParam={renderParam} />
      );
    }
    header = header ?? column.name;

    return (
      <>
        {align === 'end' ? sortTool : null}
        {header}
        {align !== 'end' ? sortTool : null}
      </>
    );
  };

  const domRef = useRef<HTMLElement | null>(null);

  const {
    computed: {
      computedRemainingSpace,
      showColumnFilters,
      computedVisibleColumns,
      computedPinnedStartColumns,
    },
    componentState: { portalDOMRef, columnHeaderHeight, filterEditors },
  } = useInfiniteTable<T>();

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

  const style: React.CSSProperties = {
    // height: column.computedFiltered? height*2: height,
    height: height,
  };

  const { onPointerDown, dragging, proxyPosition } = useColumnPointerEvents({
    pinnedStartColsCount: computedPinnedStartColumns.length,
    visibleColsCount: computedVisibleColumns.length,
    computedRemainingSpace,
    columnId: column.id,
    domRef,
    columns,
  });

  let draggingProxy = null;

  if (dragging) {
    draggingProxy = (
      <div
        className={`${InfiniteTableHeaderCellClassName}Proxy ${HeaderCellProxy}`}
        style={{
          position: 'absolute',
          height,
          width,
          left: `calc( var(${columnOffsetAtIndex}-${
            column.computedVisibleIndex
          }) + ${proxyPosition!.left ?? 0}px)`,

          top: proxyPosition!.top ?? 0,
          zIndex: 1_000_000_000,
        }}
      >
        {header}
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
    (filterValue) => {
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

          useCellClassName(
            column,
            [InfiniteTableHeaderCellClassName, InfiniteTableCellClassName],
            HeaderCellRecipe,
            { dragging, zebra: false, rowActive: false },
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

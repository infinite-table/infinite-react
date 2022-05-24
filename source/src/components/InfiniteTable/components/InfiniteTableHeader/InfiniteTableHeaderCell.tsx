import * as React from 'react';
import { useCallback, useContext, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { join } from '../../../../utils/join';
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
    computed: { computedRemainingSpace, showColumnFilters },
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

  const { onPointerDown, onPointerUp, dragging, draggingDiff, proxyOffset } =
    useColumnPointerEvents({
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
          left:
            column.computedAbsoluteOffset +
            draggingDiff.left +
            (proxyOffset?.left ?? 0),

          top: draggingDiff?.top + (proxyOffset?.top ?? 0),
          zIndex: 1,
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

  return (
    <ContextProvider value={renderParam}>
      <InfiniteTableCell<T>
        domRef={ref}
        cellType="header"
        column={column}
        data-name={`HeaderCell`}
        data-column-id={column.id}
        style={style}
        width={width}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
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
            { dragging, zebra: false },
          ),
          CellCls,
        )}
        cssEllipsis={column.headerCssEllipsis ?? column.cssEllipsis ?? true}
        afterChildren={
          showColumnFilters ? (
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
          ) : null
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

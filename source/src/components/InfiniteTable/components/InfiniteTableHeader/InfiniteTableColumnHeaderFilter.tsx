import * as React from 'react';
import { useEffect, useState } from 'react';

import { useInfiniteTable } from '../../hooks/useInfiniteTable';

import { getColumnLabel } from './getColumnLabel';

import { HeaderFilterCls, HeaderFilterEditorCls } from './header.css';
import {
  InfiniteTableColumnHeaderFilterClassName,
  InfiniteTableColumnHeaderFilterContext,
  InfiniteTableColumnHeaderFilterProps,
} from './InfiniteTableColumnHeaderFilterContext';
import { useInfiniteHeaderCell } from './InfiniteTableHeaderCell';

const stopPropagation = (e: React.PointerEvent<any>) => e.stopPropagation();

export function InfiniteTableColumnHeaderFilter<T>(
  props: InfiniteTableColumnHeaderFilterProps<T>,
) {
  const FilterEditor = props.filterEditor;

  return (
    <div
      onPointerUp={stopPropagation}
      onPointerDown={stopPropagation}
      className={`${InfiniteTableColumnHeaderFilterClassName} ${HeaderFilterCls}`}
      style={{ height: props.columnHeaderHeight }}
    >
      <InfiniteTableColumnHeaderFilterContext.Provider value={props}>
        {FilterEditor ? <FilterEditor /> : null}
      </InfiniteTableColumnHeaderFilterContext.Provider>
    </div>
  );
}

export function InfiniteTableColumnHeaderFilterEmpty() {
  return (
    <div
      onPointerUp={stopPropagation}
      onPointerDown={stopPropagation}
      className={`${InfiniteTableColumnHeaderFilterClassName} ${HeaderFilterCls}`}
      style={{ height: '100%' }}
    />
  );
}

export function useInfiniteColumnFilterEditor<T>() {
  const context = useInfiniteTable<T>();

  const { column, columnApi } = useInfiniteHeaderCell<T>();

  const columnLabel = getColumnLabel(column, context);

  const filterContextValue = React.useContext(
    InfiniteTableColumnHeaderFilterContext,
  );

  const [theValue, setTheValue] = useState(
    filterContextValue.columnFilterValue?.filterValue ?? '',
  );

  const onInputChange = React.useCallback(
    (filterValue: any) => {
      setTheValue(filterValue);
      filterContextValue.onChange(filterValue);
    },
    [filterContextValue.onChange],
  );

  useEffect(() => {
    if (filterContextValue.columnFilterValue) {
      if (theValue !== filterContextValue.columnFilterValue.filterValue) {
        setTheValue(filterContextValue.columnFilterValue.filterValue);
      }
    } else {
      //reset to empty value if no filter value defined
      const currentFilterType =
        filterContextValue.filterTypes[
          filterContextValue.columnFilterType ?? 'string'
        ];

      if (currentFilterType) {
        const emptyValue = [...currentFilterType.emptyValues][0];
        if (emptyValue !== theValue) {
          setTheValue(emptyValue);
        }
      }
    }
  }, [filterContextValue.columnFilterValue?.filterValue]);

  const filterType = filterContextValue.columnFilterValue
    ? filterContextValue.columnFilterValue.filterType
    : filterContextValue.columnFilterType ?? 'string';

  const operator = filterContextValue.columnFilterValue
    ? filterContextValue.columnFilterValue.operator
    : filterContextValue.filterTypes[filterType]
    ? filterContextValue.filterTypes[filterType].defaultOperator
    : filterContextValue.filterTypes.string.defaultOperator;

  return {
    api: context.api,
    column,
    columnApi,
    operator,
    value: theValue,
    filterType,
    setValue: onInputChange,
    ariaLabel: `Filter for ${columnLabel}`,
    className: HeaderFilterEditorCls,
  };
}

import * as React from 'react';
import { useEffect, useState } from 'react';
import { join } from '../../../../utils/join';

import { useInfiniteTable } from '../../hooks/useInfiniteTable';
import { useInfiniteTableState } from '../../hooks/useInfiniteTableState';
import { height } from '../../utilities.css';
import { FilterIcon } from '../icons/FilterIcon';

import { getColumnLabel } from './getColumnLabel';

import {
  HeaderFilterRecipe,
  HeaderFilterEditorCls,
  HeaderFilterOperatorCls,
  HeaderFilterOperatorIconRecipe,
} from './header.css';
import {
  InfiniteTableColumnHeaderFilterClassName,
  InfiniteTableColumnHeaderFilterContext,
  InfiniteTableColumnHeaderFilterOperatorClassName,
  InfiniteTableColumnHeaderFilterProps,
} from './InfiniteTableColumnHeaderFilterContext';
import { useInfiniteHeaderCell } from './InfiniteTableHeaderCell';

const InfiniteTableColumnHeaderFilterInputClassName = `${InfiniteTableColumnHeaderFilterClassName}__input`;

const stopPropagation = (e: React.PointerEvent<any>) => e.stopPropagation();

export function InfiniteTableColumnHeaderFilter<T>(
  props: InfiniteTableColumnHeaderFilterProps<T>,
) {
  const { filterOperatorMenuVisibleForColumnId } = useInfiniteTableState();
  const { column } = useInfiniteHeaderCell();

  const FilterEditor = props.filterEditor;
  const FilterOperatorSwitch = props.filterOperatorSwitch;

  const [focused, setFocused] = useState(false);
  const onFocus = React.useCallback(() => {
    setFocused(true);
  }, []);

  const onBlur = React.useCallback(() => {
    setFocused(false);
  }, []);

  const active = filterOperatorMenuVisibleForColumnId === column.id || focused;

  return (
    <div
      onPointerUp={stopPropagation}
      onPointerDown={stopPropagation}
      onFocus={onFocus}
      onBlur={onBlur}
      className={`${InfiniteTableColumnHeaderFilterClassName} ${HeaderFilterRecipe(
        {
          active,
        },
      )}`}
      style={{ height: props.columnHeaderHeight }}
    >
      <InfiniteTableColumnHeaderFilterContext.Provider value={props}>
        <FilterOperatorSwitch />
        <FilterEditor />
      </InfiniteTableColumnHeaderFilterContext.Provider>
    </div>
  );
}

export function InfiniteTableFilterOperatorSwitch() {
  const { columnApi, disabled, operator } = useInfiniteColumnFilterEditor();

  const Icon = operator?.components?.Icon ?? FilterIcon;

  return (
    <div
      data-name="filter-operator"
      data-disabled={disabled}
      onMouseDown={(event) => {
        event.stopPropagation();
        if (disabled) {
          return;
        }

        columnApi.toggleFilterOperatorMenu(event.target);
      }}
      className={join(
        InfiniteTableColumnHeaderFilterOperatorClassName,
        HeaderFilterOperatorCls,
        disabled
          ? `${InfiniteTableColumnHeaderFilterOperatorClassName}--disabled`
          : '',
      )}
    >
      <Icon
        size={20}
        className={`${HeaderFilterOperatorIconRecipe({
          disabled,
        })}`}
      />
    </div>
  );
}

export function InfiniteTableColumnHeaderFilterEmpty() {
  return (
    <div
      onPointerUp={stopPropagation}
      onPointerDown={stopPropagation}
      className={`${InfiniteTableColumnHeaderFilterClassName} ${HeaderFilterRecipe(
        { active: false },
      )} ${height['50%']}`}
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

  const { columnFilterType, filterTypes, columnFilterValue } =
    filterContextValue;
  const filterType = filterTypes[columnFilterType!];

  const [theValue, setTheValue] = useState(
    columnFilterValue?.filter.value ?? '',
  );

  const onInputChange = React.useCallback(
    (filterValue: any) => {
      setTheValue(filterValue);
      filterContextValue.onChange(filterValue);
    },
    [filterContextValue.onChange],
  );

  const clearValue = React.useCallback(() => {
    context.api.clearColumnFilter(column.id);
  }, [column.id]);
  const removeColumnFilter = React.useCallback(() => {
    context.api.removeColumnFilter(column.id);
  }, [column.id]);

  useEffect(() => {
    if (columnFilterValue) {
      if (theValue !== columnFilterValue.filter.value) {
        setTheValue(columnFilterValue.filter.value);
      }
    } else {
      //reset to empty value if no filter value defined

      if (filterType) {
        const emptyValue = [...filterType.emptyValues][0];
        if (emptyValue !== theValue) {
          setTheValue(emptyValue);
        }
      }
    }
  }, [columnFilterValue?.filter.value]);

  const operator = filterContextValue.operator;
  const operatorName = operator?.name;
  return {
    api: context.api,
    column,
    columnFilterValue,
    columnApi,
    operatorName,
    operator,
    value: theValue,
    disabled: columnFilterValue?.disabled,
    filterType,
    filterTypes,
    filterTypeKey: columnFilterType!,
    filtered: column.computedFiltered,
    setValue: onInputChange,
    clearValue,
    removeColumnFilter,
    ariaLabel: `Filter for ${columnLabel}`,
    className: `${HeaderFilterEditorCls} ${InfiniteTableColumnHeaderFilterInputClassName}`,
  };
}

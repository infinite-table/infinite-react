import * as React from 'react';
import { useEffect, useState } from 'react';

import {
  DataSourceFilterValueItem,
  DataSourcePropFilterTypes,
} from '../../../DataSource';
import { Renderable } from '../../../types/Renderable';
import { internalProps } from '../../internalProps';
import { InfiniteTableFilterEditorProps } from '../../types';

import { HeaderFilterCls, HeaderFilterEditorCls } from './header.css';

const { rootClassName } = internalProps;
export type InfiniteTableColumnHeaderFilterProps<T> = {
  filterEditor: React.FC<InfiniteTableFilterEditorProps<T>>;
  filterTypes: DataSourcePropFilterTypes<T>;
  columnFilterValue: DataSourceFilterValueItem<T> | null;
  columnLabel: Renderable;
  columnFilterType?: string;
  columnHeaderHeight: number;
  onChange: (value: DataSourceFilterValueItem<T> | null) => void;
};

export const InfiniteTableColumnHeaderFilterClassName = `${rootClassName}HeaderCell__filter`;

const stopPropagation = (e: React.PointerEvent<any>) => e.stopPropagation();

export function InfiniteTableColumnHeaderFilter<T>(
  props: InfiniteTableColumnHeaderFilterProps<T>,
) {
  const [theValue, setTheValue] = useState(
    props.columnFilterValue?.filterValue ?? '',
  );

  const onInputChange = (filterValue: any) => {
    setTheValue(filterValue);
    props.onChange(filterValue);
  };

  useEffect(() => {
    if (props.columnFilterValue) {
      if (theValue !== props.columnFilterValue.filterValue) {
        setTheValue(props.columnFilterValue.filterValue);
      }
    } else {
      //reset to empty value if no filter value defined
      const currentFilterType =
        props.filterTypes[props.columnFilterType ?? 'string'];

      if (currentFilterType) {
        const emptyValue = [...currentFilterType.emptyValues][0];
        if (emptyValue !== theValue) {
          setTheValue(emptyValue);
        }
      }
    }
  }, [props.columnFilterValue?.filterValue]);

  const filterType = props.columnFilterValue
    ? props.columnFilterValue.filterType
    : props.columnFilterType ?? 'string';

  const operator = props.columnFilterValue
    ? props.columnFilterValue.operator
    : props.filterTypes[filterType]
    ? props.filterTypes[filterType].defaultOperator
    : props.filterTypes.string.defaultOperator;

  const filterEditorProps = {
    ariaLabel: `Filter for ${props.columnLabel}`,
    filterValue: theValue,
    className: HeaderFilterEditorCls,
    operator,
    filterType,
    onChange: onInputChange,
  };

  const FilterEditor = props.filterEditor;

  return (
    <div
      onPointerUp={stopPropagation}
      onPointerDown={stopPropagation}
      className={`${InfiniteTableColumnHeaderFilterClassName} ${HeaderFilterCls}`}
      style={{ height: props.columnHeaderHeight }}
    >
      {FilterEditor ? <FilterEditor {...filterEditorProps} /> : null}
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

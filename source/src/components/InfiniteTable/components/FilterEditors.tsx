import * as React from 'react';

import { useInfiniteColumnFilterEditor } from './InfiniteTableHeader/InfiniteTableColumnHeaderFilter';

export function StringFilterEditor<T>() {
  const { ariaLabel, value, setValue, className, disabled } =
    useInfiniteColumnFilterEditor<T>();
  return (
    <input
      data-xxx
      aria-label={ariaLabel}
      type="text"
      disabled={disabled}
      value={value as any as string}
      onChange={(event) => {
        setValue(event.target.value as any as T);
      }}
      className={className}
    />
  );
}

export function NumberFilterEditor<T>() {
  const { ariaLabel, value, setValue, className, disabled } =
    useInfiniteColumnFilterEditor<T>();
  return (
    <input
      aria-label={ariaLabel}
      type="number"
      data-yyy
      disabled={disabled}
      value={value as any as number}
      onChange={(event) => {
        let value = isNaN(event.target.valueAsNumber)
          ? event.target.value
          : event.target.valueAsNumber;
        setValue(value as any as T);
      }}
      className={className}
    />
  );
}

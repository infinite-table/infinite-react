import * as React from 'react';

import { useInfiniteColumnFilterEditor } from './InfiniteTableHeader/InfiniteTableColumnHeaderFilter';

function getFilterEditors(): Record<any, () => JSX.Element | null> {
  return {
    string: StringFilterEditor,
    number: NumberFilterEditor,
  };
}

export const defaultFilterEditors = getFilterEditors();

export function StringFilterEditor<T>() {
  const { ariaLabel, value, setValue, className } =
    useInfiniteColumnFilterEditor<T>();
  return (
    <input
      aria-label={`Filter for ${ariaLabel}`}
      type="text"
      value={value as any as string}
      onChange={(event) => {
        setValue(event.target.value as any as T);
      }}
      className={className}
    />
  );
}

export function NumberFilterEditor<T>() {
  const { ariaLabel, value, setValue, className } =
    useInfiniteColumnFilterEditor<T>();
  return (
    <input
      aria-label={`Filter for ${ariaLabel}`}
      type="number"
      value={value as any as number}
      onChange={(event) => {
        let value = event.target.value;
        //@ts-ignore
        if (!isNaN(value + '')) {
          value = value + '';
        }
        setValue(value as any as T);
      }}
      className={className}
    />
  );
}

import * as React from 'react';

import {
  InfiniteTableFilterEditorProps,
  InfiniteTablePropFilterEditors,
} from '../types/InfiniteTableProps';

function getFilterEditors<T>(): InfiniteTablePropFilterEditors<T> {
  return {
    string: StringFilterEditor,
    number: NumberFilterEditor,
  };
}

export const defaultFilterEditors = getFilterEditors();

export function StringFilterEditor<T>(
  props: InfiniteTableFilterEditorProps<T>,
) {
  return (
    <input
      aria-label={`Filter for ${props.ariaLabel}`}
      type="text"
      value={props.filterValue as any as string}
      onChange={(event) => {
        props.onChange(event.target.value as any as T);
      }}
      className={props.className}
    />
  );
}

export function NumberFilterEditor<T>(
  props: InfiniteTableFilterEditorProps<T>,
) {
  return (
    <input
      aria-label={`Filter for ${props.ariaLabel}`}
      type="number"
      value={props.filterValue as any as number}
      onChange={(event) => {
        let value = event.target.value;
        //@ts-ignore
        if (!isNaN(value + '')) {
          value = value + '';
        }
        props.onChange(value as any as T);
      }}
      className={props.className}
    />
  );
}

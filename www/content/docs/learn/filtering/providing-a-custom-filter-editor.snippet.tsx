// Snippets shown on providing-a-custom-filter-editor.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import * as React from 'react';
import {
  DataSource,
  useInfiniteColumnFilterEditor,
} from '@infinite-table/infinite-react';

import { BoolFilterEditor } from './providing-a-custom-filter-editor.boolfiltereditor.snippet';

type Developer = {
  id: number;
  firstName: string;
  canDesign: boolean;
};

declare const data: Developer[];

//#region intro
export function NumberFilterEditor<T>() {
  const { ariaLabel, value, setValue, className, disabled } =
    useInfiniteColumnFilterEditor<T>();

  return (
    <input
      aria-label={ariaLabel}
      type="number"
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
//#endregion

export function BoolFilterType() {
  return (
    <DataSource<Developer>
      primaryKey="id"
      data={data}
      //#region defining-the-bool-filter-type-with-one
      filterTypes={{
        bool: {
          label: 'Boolean',
          defaultOperator: 'eq',
          // when the filter checkbox is indeterminate state, that's mapped to `null`
          emptyValues: [null], // #highlight
          operators: [
            // operators will come here
          ],
        }
      }}
      //#endregion
    />
  );
}

export function BoolFilterTypeWithOperator() {
  return (
    <DataSource<Developer>
      primaryKey="id"
      data={data}
      //#region defining-the-eq-operator
      filterTypes={{
        bool: {
          defaultOperator: 'eq',
          emptyValues: [null],
          operators: [
            {
              name: 'eq', // #highlight
              label: 'Equals',
              fn: ({ currentValue, filterValue }) => currentValue === filterValue,
            },
          ],
        },
      }}
      //#endregion
    />
  );
}

export function BoolFilterTypeWithEditor() {
  return (
    <DataSource<Developer>
      primaryKey="id"
      data={data}
      //#region specifying-the-filtereditor-component
      filterTypes={{
        bool: {
          defaultOperator: 'eq',
          emptyValues: [null],
          components: {
            FilterEditor: BoolFilterEditor, // #highlight
            FilterOperatorSwitch: () => null,
          },
          operators: [
            {
              name: 'eq',
              label: 'Equals',
              fn: ({ currentValue, filterValue }) =>
                currentValue === filterValue,
            },
          ],
        },
      }}
      //#endregion
    />
  );
}

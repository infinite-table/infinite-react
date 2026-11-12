// Snippets shown on providing-a-custom-filter-editor.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
import {
  useInfiniteColumnFilterEditor,
} from '@infinite-table/infinite-react';

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

//#region intro-2
import { components } from '@infinite-table/infinite-react';

const { NumberFilterEditor, StringFilterEditor } = components;
//#endregion

{
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
}

{
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
}

{
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
}

export {};

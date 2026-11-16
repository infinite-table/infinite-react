// Snippets shown on the Vue version of providing-a-custom-filter-editor.page.md: the sibling of
// providing-a-custom-filter-editor.snippet.tsx, with the same `#region` names.
// Type-checked with vue-tsc against the library source (`npm run tsc:vue`).
import { defineComponent, h } from 'vue';
import {
  useInfiniteColumnFilterEditor,
  type DataSourcePropFilterTypes,
} from '@infinite-table/infinite-vue';

import { BoolFilterEditor } from './providing-a-custom-filter-editor.boolfiltereditor.snippet.vue';

type Developer = {
  id: number;
  firstName: string;
  canDesign: boolean;
};

//#region intro
export const NumberFilterEditor = defineComponent({
  setup() {
    const { ariaLabel, value, setValue, className, disabled } =
      useInfiniteColumnFilterEditor();

    return () =>
      h('input', {
        'aria-label': ariaLabel.value,
        type: 'number',
        disabled: disabled.value,
        value: value.value ?? '',
        onInput: (event: Event) => {
          const target = event.target as HTMLInputElement;
          const value = isNaN(target.valueAsNumber)
            ? target.value
            : target.valueAsNumber;
          setValue(value);
        },
        class: className,
      });
  },
});
//#endregion

export function boolFilterType() {
  //#region defining-the-bool-filter-type-with-one
  // <DataSource :filterTypes="filterTypes" />
  const filterTypes: DataSourcePropFilterTypes<Developer> = {
    bool: {
      label: 'Boolean',
      defaultOperator: 'eq',
      // when the filter checkbox is indeterminate state, that's mapped to `null`
      emptyValues: [null], // #highlight
      operators: [
        // operators will come here
      ],
    },
  };
  //#endregion
  return filterTypes;
}

export function boolFilterTypeWithOperator() {
  //#region defining-the-eq-operator
  // <DataSource :filterTypes="filterTypes" />
  const filterTypes: DataSourcePropFilterTypes<Developer> = {
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
  };
  //#endregion
  return filterTypes;
}

export function boolFilterTypeWithEditor() {
  //#region specifying-the-filtereditor-component
  // <DataSource :filterTypes="filterTypes" />
  const filterTypes: DataSourcePropFilterTypes<Developer> = {
    bool: {
      defaultOperator: 'eq',
      emptyValues: [null],
      components: {
        FilterEditor: BoolFilterEditor as any, // #highlight
        FilterOperatorSwitch: () => null,
      },
      operators: [
        {
          name: 'eq',
          label: 'Equals',
          fn: ({ currentValue, filterValue }) => currentValue === filterValue,
        },
      ],
    },
  };
  //#endregion
  return filterTypes;
}

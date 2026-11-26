// Code shown on the Angular version of providing-a-custom-filter-editor.page.md: the sibling of
// providing-a-custom-filter-editor.snippet.tsx, with the same `#region` names.
// Type-checked, templates included, by `npm run tsc:angular`.
import { Component, computed } from '@angular/core';
import {
  injectColumnFilterEditor,
  renderComponent,
} from '@infinite-table/infinite-angular';
import type { DataSourcePropFilterTypes } from '@infinite-table/infinite-angular';

import { BoolFilterEditor } from './providing-a-custom-filter-editor.boolfiltereditor.snippet.angular';

type Developer = {
  id: number;
  firstName: string;
  canDesign: boolean;
};

//#region intro
@Component({
  // the host element is the input
  selector: 'input[numberFilterEditor]',
  host: {
    type: 'number',
    '[attr.aria-label]': 'editor.ariaLabel()',
    '[disabled]': '!!editor.disabled()',
    '[value]': 'value()',
    '[class]': 'editor.className',
    '(input)': 'onInput($event)',
  },
  template: '',
})
export class NumberFilterEditor {
  protected readonly editor = injectColumnFilterEditor();

  protected readonly value = computed(() => this.editor.value() ?? '');

  protected onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    const value = isNaN(target.valueAsNumber)
      ? target.value
      : target.valueAsNumber;
    this.editor.setValue(value);
  }
}
//#endregion

export function boolFilterType() {
  //#region defining-the-bool-filter-type-with-one
  // <infinite-data-source [filterTypes]="filterTypes" />
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
  // <infinite-data-source [filterTypes]="filterTypes" />
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
  // <infinite-data-source [filterTypes]="filterTypes" />
  const filterTypes: DataSourcePropFilterTypes<Developer> = {
    bool: {
      defaultOperator: 'eq',
      emptyValues: [null],
      components: {
        FilterEditor: () => renderComponent(BoolFilterEditor), // #highlight
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

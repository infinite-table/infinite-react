import { Component } from '@angular/core';

import {
  DataSource,
  InfiniteCheckBox,
  InfiniteTable,
  injectColumnFilterEditor,
  renderComponent,
} from '@infinite-table/infinite-angular';
import type {
  DataSourcePropFilterTypes,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  canDesign: boolean;
  stack: string;
  hobby: string;
};
const dataSource: Developer[] = [
  {
    id: 1,
    firstName: 'John',

    canDesign: true,
    stack: 'frontend',
    hobby: 'gaming',
  },
  {
    id: 2,
    firstName: 'Jane',

    canDesign: false,
    stack: 'backend',
    hobby: 'reading',
  },
  {
    id: 3,
    firstName: 'Jack',

    canDesign: true,
    stack: 'frontend',
    hobby: 'gaming',
  },
  {
    id: 4,
    firstName: 'Jill',

    canDesign: false,
    stack: 'backend',
    hobby: 'reading',
  },
  {
    id: 5,
    firstName: 'Seb',

    canDesign: false,
    stack: 'backend',
    hobby: 'reading',
  },
];

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
    type: 'number',
    defaultWidth: 100,
  },
  canDesign: {
    field: 'canDesign',
    filterType: 'bool',
    renderValue: ({ value }) => (value ? 'Yes' : 'No'),
  },
  firstName: {
    field: 'firstName',
  },
  stack: { field: 'stack' },
};

const domProps = {
  style: {
    height: '100%',
  },
};

@Component({
  selector: 'div[boolFilterEditor]',
  imports: [InfiniteCheckBox],
  host: {
    '[class]': 'editor.className',
    style: 'text-align: center',
  },
  template: `
    <input
      infiniteCheckBox
      [checked]="editor.value()"
      (checkedChange)="onChange($event)"
    />
  `,
})
class BoolFilterEditor {
  protected readonly editor = injectColumnFilterEditor<Developer>();

  protected onChange(newValue: boolean | null) {
    const value = this.editor.value();
    if (value === true) {
      // after the value was true, make it go to indeterminate state
      newValue = null;
    }
    if (value === null) {
      // from indeterminate, goto false
      newValue = false;
    }
    this.editor.setValue(newValue);
  }
}

const filterTypes: DataSourcePropFilterTypes<Developer> = {
  bool: {
    defaultOperator: 'eq',
    emptyValues: [null],
    components: {
      FilterEditor: () => renderComponent(BoolFilterEditor),
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

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <infinite-data-source
      [data]="dataSource"
      primaryKey="id"
      [defaultFilterValue]="[]"
      [filterDelay]="0"
      [filterTypes]="filterTypes"
    >
      <infinite-table
        debugId="checkbox-filter-editor-example"
        [domProps]="domProps"
        [columnDefaultWidth]="150"
        [columnMinWidth]="50"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly dataSource = dataSource;
  protected readonly filterTypes = filterTypes;
  protected readonly domProps = domProps;
  protected readonly columns = columns;
}

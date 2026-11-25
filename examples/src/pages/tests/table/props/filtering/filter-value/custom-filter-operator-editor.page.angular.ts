import { Component, computed } from '@angular/core';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

import { injectColumnFilterEditor, renderComponent } from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  salary: number;
};

const data: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Bob',
    salary: 2000,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 2,
    firstName: 'Marry',
    lastName: 'Bob',
    salary: 3500,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 3,
    firstName: 'Bill',
    lastName: 'Bobson',
    salary: 3000,
    canDesign: 'no',
    currency: 'CAD',
    preferredLanguage: 'TypeScript',
    stack: 'frontend',
  },
  {
    id: 4,
    firstName: 'Mark',
    lastName: 'Twain',
    salary: 1000,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Rust',
    stack: 'backend',
  },
  {
    id: 5,
    firstName: 'Matthew',
    lastName: 'Hilson',
    salary: 12900,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Go',
    stack: 'backend',
  },
];

const columns: Record<string, any> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
  },
  salary: {
    defaultFilterable: true,
    field: 'salary',
    type: 'number',
    filterType: 'salary',
  },
  stack: { field: 'stack' },
  currency: { field: 'currency', defaultFilterable: false },
};

@Component({
  selector: 'div[defaultFilterTypeEditor]',
  host: { 'data-operator': 'default-filter-type-editor' },
  template: `{{ text() }}`,
})
class DefaultFilterTypeEditor {
  private readonly editor = injectColumnFilterEditor();
  protected readonly text = computed(() =>
    this.editor.filtered()
      ? `Operator ${this.editor.operator()?.name}`
      : 'Not applied',
  );
}

@Component({
  selector: 'div[mediumFilterEditor]',
  host: { 'data-operator': 'medium' },
  template: `Medium`,
})
class MediumFilterEditor {}

@Component({
  selector: 'div[highFilterEditor]',
  host: { 'data-operator': 'high' },
  template: `High`,
})
class HighFilterEditor {}



const filterTypes = {
  salary: {
    defaultOperator: '',
    emptyValues: [] as any[],
    components: {
      FilterEditor: () => renderComponent(DefaultFilterTypeEditor),
    },
    operators: [
      {
        name: 'low',
        fn: ({ currentValue, filterValue, emptyValues }: any) => {
          if (
            emptyValues.includes(currentValue) ||
            emptyValues.includes(filterValue)
          ) {
            return true;
          }
          return currentValue <= 1000;
        },
      },
      {
        name: 'medium',
        fn: ({ currentValue }: any) => {
          return currentValue > 1000 && currentValue < 10000;
        },

        components: {
          FilterEditor: () => renderComponent(MediumFilterEditor),
        },
      },
      {
        name: 'high',
        fn: ({ currentValue }: any) => {
          return currentValue >= 10000;
        },
        components: {
          FilterEditor: () => renderComponent(HighFilterEditor),
        },
      },
    ],
  },
};

const defaultFilterValue: any[] = [];

const domProps = {
  style: {
    height: '100%',
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
  <infinite-data-source
    [data]="data"
    primaryKey="id"
    [defaultFilterValue]="defaultFilterValue"
    [filterDelay]="0"
    [filterTypes]="filterTypes"
  >
    <infinite-table
      [domProps]="domProps"
      [columnDefaultWidth]="150"
      [columnMinWidth]="50"
      [columns]="columns"
    />
  </infinite-data-source>
  `,
})
export default class CustomFilterOperatorEditorPage {
  protected readonly columns = columns;
  protected readonly data = data;
  protected readonly defaultFilterValue = defaultFilterValue;
  protected readonly domProps = domProps;
  protected readonly filterTypes = filterTypes;
}

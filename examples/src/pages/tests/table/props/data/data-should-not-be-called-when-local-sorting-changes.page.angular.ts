import { Component, computed, signal } from '@angular/core';

import { DataSource, InfiniteTable } from '@infinite-table/infinite-angular';

type Developer = {
  id: number;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';
  hobby: string;
  salary: number;
  age: number;
};

const developers: Developer[] = [
  {
    id: 0,
    firstName: 'Nya',
    lastName: 'Klein',
    country: 'India',
    city: 'Unnao',
    age: 40,
    currency: 'JPY',
    preferredLanguage: 'TypeScript',
    stack: 'backend',
    canDesign: 'yes',
    salary: 60000,
    hobby: 'sports',
  },
  {
    id: 1,
    firstName: 'Axel',
    lastName: 'Runolfsson',
    country: 'Mexico',

    city: 'Cuitlahuac',

    age: 20,
    currency: 'USD',
    preferredLanguage: 'TypeScript',
    stack: 'backend',
    canDesign: 'no',
    salary: 100000,
    hobby: 'sports',
  },
  {
    id: 2,
    firstName: 'Gonzalo',
    lastName: 'McGlynn',
    country: 'United Arab Emirates',
    city: 'Fujairah',
    age: 60,
    currency: 'JPY',
    preferredLanguage: 'Go',
    stack: 'frontend',
    canDesign: 'yes',
    salary: 120000,
    hobby: 'photography',
  },
];

const dataSource = () => {
  (globalThis as any).timesCalled = ((globalThis as any).timesCalled || 0) + 1;
  return developers;
};

const columns: Record<string, any> = {
  identifier: {
    field: 'id',
  },
  name: {
    field: 'firstName',
    name: 'First Name',
  },
  city: { field: 'city' },
  stack: { field: 'stack' },

  fullName: {
    name: 'Full name',
    render: ({ data }: { data: Developer | null }) => {
      return `${data?.firstName} - ${data?.lastName}`;
    },
  },
  age: {
    field: 'age',
    type: 'number',
  },
  salary: {
    field: 'salary',
    type: 'number',
  },
  country: {
    field: 'country',
  },
};
const domProps = {
  style: {
    margin: '5px',

    minHeight: '500px',
  },
};

@Component({
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="sortMode.set('local')">sort mode local</button>
    <button (click)="sortMode.set('remote')">sort mode remote</button>
    <p style="color: tomato">Current sort mode: {{ sortMode() }}</p>
    <infinite-data-source
      [data]="dataSource"
      primaryKey="id"
      [shouldReloadData]="shouldReloadData()"
      (sortInfoChange)="onSortInfoChange($event)"
      [sortInfo]="sortInfo()"
    >
      <infinite-table
        [domProps]="domProps"
        [columnDefaultWidth]="150"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class DataShouldNotBeCalledWhenLocalSortingChangesPage {
  protected readonly dataSource = dataSource;
  protected readonly columns = columns;
  protected readonly domProps = domProps;

  protected readonly sortInfo = signal<any>([
    {
      field: 'age',
      dir: 1,
    },
  ]);
  protected readonly sortMode = signal<'local' | 'remote'>('local');

  protected readonly shouldReloadData = computed(() => {
    return {
      sortInfo: this.sortMode() === 'remote',
    };
  });

  protected onSortInfoChange(newSortInfo: any) {
    this.sortInfo.set(newSortInfo);
  }
}

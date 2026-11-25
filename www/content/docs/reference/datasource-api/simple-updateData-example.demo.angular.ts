import { Component, signal } from '@angular/core';

import { InfiniteTable, DataSource } from '@infinite-table/infinite-angular';
import type {
  DataSourceApi,
  InfiniteTablePropColumns,
} from '@infinite-table/infinite-angular';

type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  preferredLanguage: string;
  stack: string;
  canDesign: 'yes' | 'no';

  age: number;
};

const data: Developer[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Bob',
    age: 20,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 2,
    firstName: 'Marry',
    lastName: 'Bob',
    age: 25,
    canDesign: 'yes',
    currency: 'USD',
    preferredLanguage: 'JavaScript',
    stack: 'frontend',
  },
  {
    id: 3,
    firstName: 'Bill',
    lastName: 'Bobson',
    age: 30,
    canDesign: 'no',
    currency: 'CAD',
    preferredLanguage: 'TypeScript',
    stack: 'frontend',
  },
  {
    id: 4,
    firstName: 'Mark',
    lastName: 'Twain',
    age: 31,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Rust',
    stack: 'backend',
  },
  {
    id: 5,
    firstName: 'Matthew',
    lastName: 'Hilson',
    age: 29,
    canDesign: 'yes',
    currency: 'CAD',
    preferredLanguage: 'Go',
    stack: 'backend',
  },
];

const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id',
  },
  firstName: {
    field: 'firstName',
  },
  age: {
    field: 'age',
    type: 'number',
  },

  stack: { field: 'stack', renderMenuIcon: false },
  currency: { field: 'currency' },
};

const currencies = ['USD', 'CAD', 'EUR', 'GBP', 'RUB', 'UAH', 'CNY'];
const stacks = ['frontend', 'backend', 'fullstack'];
const languages = [
  'JavaScript',
  'TypeScript',
  'Go',
  'Rust',
  'Python',
  'Java',
  'C#',
];
const getRandomDeveloperUpdate = (data: Developer): Partial<Developer> => ({
  id: data.id,
  age: Math.floor(Math.random() * (60 - 20 + 1)) + 20,
  canDesign: ['yes', 'no'][
    Math.floor(Math.random() * 2)
  ] as Developer['canDesign'],

  currency: currencies[Math.floor(Math.random() * currencies.length)],
  preferredLanguage: languages[Math.floor(Math.random() * languages.length)],
  stack: stacks[Math.floor(Math.random() * stacks.length)],
});

@Component({
  selector: 'demo-root',
  imports: [DataSource, InfiniteTable],
  template: `
    <button (click)="updateCurrentRow()">Update current row</button>

    <infinite-data-source [data]="data" primaryKey="id" (ready)="onReady($event)">
      <infinite-table
        debugId="simple-updateData-example"
        [(activeRowIndex)]="activeIndex"
        keyboardNavigation="row"
        [columnDefaultWidth]="100"
        [columnMinWidth]="50"
        [columns]="columns"
      />
    </infinite-data-source>
  `,
})
export default class App {
  protected readonly data = data;
  protected readonly columns = columns;

  private dataSourceApi: DataSourceApi<Developer> | null = null;
  protected readonly activeIndex = signal<number | null | undefined>(0);

  protected onReady(api: DataSourceApi<Developer>) {
    this.dataSourceApi = api;
  }

  protected updateCurrentRow() {
    const activeIndex = this.activeIndex();
    if (activeIndex == null) {
      return;
    }
    const rowInfo = this.dataSourceApi!.getRowInfoByIndex(activeIndex);
    if (rowInfo && rowInfo.data) {
      this.dataSourceApi!.updateData(
        getRandomDeveloperUpdate(rowInfo.data as Developer),
      );
    }
  }
}
